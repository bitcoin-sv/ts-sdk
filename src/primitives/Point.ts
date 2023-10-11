import BasePoint from './BasePoint'
import JPoint from './JacobianPoint'
import BigNumber from './BigNumber'

export default class Point extends BasePoint {
  x: BigNumber | null
  y: BigNumber | null
  inf: boolean

  static fromJSON (
    obj: string | any[], isRed: boolean
  ): Point {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj)
    }
    const res = new Point(obj[0], obj[1], isRed)
    if (typeof obj[2] !== 'object') {
      return res
    }

    const obj2point = (obj): Point => {
      return new Point(obj[0], obj[1], isRed)
    }

    const pre = obj[2]
    res.precomputed = {
      beta: null,
      doubles: typeof pre.doubles === 'object' && pre.doubles !== null && {
        step: pre.doubles.step,
        points: [res].concat(pre.doubles.points.map(obj2point))
      },
      naf: typeof pre.naf === 'object' && pre.naf !== null && {
        wnd: pre.naf.wnd,
        points: [res].concat(pre.naf.points.map(obj2point))
      }
    }
    return res
  }

  constructor (
    x: BigNumber | number | number[] | string | null,
    y: BigNumber | number | number[] | string | null,
    isRed: boolean = false
  ) {
    super('affine')
    this.precomputed = null
    if (x === null && y === null) {
      this.x = null
      this.y = null
      this.inf = true
    } else {
      this.x = new BigNumber(x, 16)
      this.y = new BigNumber(y, 16)
      // Force redgomery representation when loading from JSON
      if (isRed) {
        this.x.forceRed(this.curve.red)
        this.y.forceRed(this.curve.red)
      }
      if (this.x.red === null) { this.x = this.x.toRed(this.curve.red) }
      if (this.y.red === null) { this.y = this.y.toRed(this.curve.red) }
      this.inf = false
    }
  }

  validate (): boolean {
    return this.curve.validate(this)
  }

  _getBeta (): undefined | Point {
    if (typeof this.curve.endo !== 'object') { return }

    const pre = this.precomputed
    if (typeof pre === 'object' && pre !== null && typeof pre.beta === 'object' && pre.beta !== null) {
      return pre.beta as Point
    }

    const beta = new Point(this.x.redMul(this.curve.endo.beta), this.y)
    if (pre != null) {
      const curve = this.curve
      const endoMul = (p: Point): Point => {
        return new Point(p.x.redMul(curve.endo.beta), p.y)
      }
      pre.beta = beta
      beta.precomputed = {
        beta: null,
        naf: (pre.naf != null) && {
          wnd: pre.naf.wnd,
          points: pre.naf.points.map(endoMul)
        },
        doubles: (pre.doubles != null) && {
          step: pre.doubles.step,
          points: pre.doubles.points.map(endoMul)
        }
      }
    }
    return beta
  }

  toJSON (): [BigNumber | null, BigNumber | null, { doubles: { step: any, points: any[] } | undefined, naf: { wnd: any, points: any[] } | undefined }?] {
    if (this.precomputed == null) { return [this.x, this.y] }

    return [this.x, this.y, typeof this.precomputed === 'object' && this.precomputed !== null && {
      doubles: (this.precomputed.doubles != null) && {
        step: this.precomputed.doubles.step,
        points: this.precomputed.doubles.points.slice(1)
      },
      naf: (this.precomputed.naf != null) && {
        wnd: this.precomputed.naf.wnd,
        points: this.precomputed.naf.points.slice(1)
      }
    }]
  }

  inspect (): string {
    if (this.isInfinity()) {
      return '<EC Point Infinity>'
    }
    return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
      ' y: ' + this.y.fromRed().toString(16, 2) + '>'
  }

  isInfinity (): boolean {
    return this.inf
  }

  add (p: Point): Point {
    // O + P = P
    if (this.inf) { return p }

    // P + O = P
    if (p.inf) { return this }

    // P + P = 2P
    if (this.eq(p)) { return this.dbl() }

    // P + (-P) = O
    if (this.neg().eq(p)) { return new Point(null, null) }

    // P + Q = O
    if (this.x.cmp(p.x) === 0) { return new Point(null, null) }

    let c = this.y.redSub(p.y)
    if (c.cmpn(0) !== 0) { c = c.redMul(this.x.redSub(p.x).redInvm()) }
    const nx = c.redSqr().redISub(this.x).redISub(p.x)
    const ny = c.redMul(this.x.redSub(nx)).redISub(this.y)
    return new Point(nx, ny)
  }

  dbl (): Point {
    if (this.inf) { return this }

    // 2P = O
    const ys1 = this.y.redAdd(this.y)
    if (ys1.cmpn(0) === 0) {
      return new Point(null, null)
    }

    const a = this.curve.a

    const x2 = this.x.redSqr()
    const dyinv = ys1.redInvm()
    const c = x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv)

    const nx = c.redSqr().redISub(this.x.redAdd(this.x))
    const ny = c.redMul(this.x.redSub(nx)).redISub(this.y)
    return new Point(nx, ny)
  }

  getX (): BigNumber {
    return this.x.fromRed()
  }

  getY (): BigNumber {
    return this.y.fromRed()
  }

  mul (k: BigNumber | number | number[] | string): Point {
    k = new BigNumber(k, 16)
    if (this.isInfinity()) {
      return this
    } else if (this._hasDoubles(k)) {
      return this.curve._fixedNafMul(this, k)
    } else if (
      typeof this.curve.endo === 'object' && this.curve.endo !== null
    ) {
      return this.curve._endoWnafMulAdd([this], [k]) as Point
    } else {
      return this.curve._wnafMul(this, k) as Point
    }
  }

  mulAdd (k1: BigNumber, p2: Point, k2: BigNumber): Point {
    const points = [this, p2]
    const coeffs = [k1, k2]
    if (typeof this.curve.endo === 'object' && this.curve.endo !== null) {
      return this.curve._endoWnafMulAdd(points, coeffs) as Point
    } else {
      return this.curve._wnafMulAdd(1, points, coeffs, 2) as Point
    }
  }

  jmulAdd (k1: BigNumber, p2: Point, k2: BigNumber): JPoint {
    const points = [this, p2]
    const coeffs = [k1, k2]
    if (typeof this.curve.endo === 'object' && this.curve.endo !== null) {
      return this.curve._endoWnafMulAdd(points, coeffs, true) as JPoint
    } else {
      return this.curve._wnafMulAdd(1, points, coeffs, 2, true) as JPoint
    }
  }

  eq (p: Point): boolean {
    return this === p || (
      (this.inf === p.inf) &&
      (this.inf || (this.x.cmp(p.x) === 0 && this.y.cmp(p.y) === 0)))
  }

  neg (_precompute?: boolean): Point {
    if (this.inf) { return this }

    const res = new Point(this.x, this.y.redNeg())
    if (_precompute && (this.precomputed != null)) {
      const pre = this.precomputed
      const negate = (p: Point): Point => p.neg()
      res.precomputed = {
        naf: (pre.naf != null) && {
          wnd: pre.naf.wnd,
          points: pre.naf.points.map(negate)
        },
        doubles: (pre.doubles != null) && {
          step: pre.doubles.step,
          points: pre.doubles.points.map((p) => p.neg())
        },
        beta: undefined
      }
    }
    return res
  }

  toJ (): JPoint {
    if (this.inf) {
      return new JPoint(null, null, null)
    }
    const res = new JPoint(this.x, this.y, this.curve.one)
    return res
  }
}
