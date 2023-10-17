import BasePoint from './BasePoint'
import JPoint from './JacobianPoint'
import BigNumber from './BigNumber'
import { toArray, toHex } from './utils'
import ReductionContext from './ReductionContext'

export default class Point extends BasePoint {
  x: BigNumber | null
  y: BigNumber | null
  inf: boolean

  static fromString (str: string): Point {
    const bytes = toArray(str, 'hex')

    const len = 32

    // uncompressed, hybrid-odd, hybrid-even
    if ((bytes[0] === 0x04 || bytes[0] === 0x06 || bytes[0] === 0x07) &&
      bytes.length - 1 === 2 * len) {
      if (bytes[0] === 0x06) {
        if (bytes[bytes.length - 1] % 2 !== 0) {
          throw new Error('Point string value is wrong length')
        }
      } else if (bytes[0] === 0x07) {
        if (bytes[bytes.length - 1] % 2 !== 1) {
          throw new Error('Point string value is wrong length')
        }
      }

      const res = new Point(
        bytes.slice(1, 1 + len),
        bytes.slice(1 + len, 1 + 2 * len)
      )

      return res
    } else if ((bytes[0] === 0x02 || bytes[0] === 0x03) &&
              bytes.length - 1 === len) {
      return Point.fromX(bytes.slice(1, 1 + len), bytes[0] === 0x03)
    }
    throw new Error('Unknown point format')
  }

  static fromX (x: BigNumber | number | number[] | string, odd: boolean): Point {
    const red = new ReductionContext('k256')
    const a = new BigNumber(0).toRed(red)
    const b = new BigNumber(7).toRed(red)
    const zero = new BigNumber(0).toRed(red)
    if (!BigNumber.isBN(x)) {
      x = new BigNumber(x as number, 16)
    }
    x = x as BigNumber
    if (x.red == null) {
      x = x.toRed(red)
    }

    const y2 = x.redSqr().redMul(x).redIAdd(x.redMul(a)).redIAdd(b)
    let y = y2.redSqrt()
    if (y.redSqr().redSub(y2).cmp(zero) !== 0) {
      throw new Error('invalid point')
    }

    // XXX Is there any way to tell if the number is odd without converting it
    // to non-red form?
    const isOdd = y.fromRed().isOdd()
    if ((odd && !isOdd) || (!odd && isOdd)) {
      y = y.redNeg()
    }

    return new Point(x, y)
  }

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
      doubles: typeof pre.doubles === 'object' && pre.doubles !== null
        ? {
            step: pre.doubles.step,
            points: [res].concat(pre.doubles.points.map(obj2point))
          }
        : undefined,
      naf: typeof pre.naf === 'object' && pre.naf !== null
        ? {
            wnd: pre.naf.wnd,
            points: [res].concat(pre.naf.points.map(obj2point))
          }
        : undefined
    }
    return res
  }

  constructor (
    x: BigNumber | number | number[] | string | null,
    y: BigNumber | number | number[] | string | null,
    isRed: boolean = true
  ) {
    super('affine')
    this.precomputed = null
    if (x === null && y === null) {
      this.x = null
      this.y = null
      this.inf = true
    } else {
      if (!BigNumber.isBN(x)) {
        x = new BigNumber(x as number, 16)
      }
      this.x = x as BigNumber
      if (!BigNumber.isBN(y)) {
        y = new BigNumber(y as number, 16)
      }
      this.y = y as BigNumber
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

  encode (compact: boolean = true, enc?: 'hex'): number[] | string {
    const len = this.curve.p.byteLength()
    const x = this.getX().toArray('be', len)
    let res: number[]
    if (compact) {
      res = [this.getY().isEven() ? 0x02 : 0x03].concat(x)
    } else {
      res = [0x04].concat(x, this.getY().toArray('be', len))
    }
    if (enc !== 'hex') {
      return res
    } else {
      return toHex(res)
    }
  }

  toString (): string {
    return this.encode(true, 'hex') as string
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
        naf: (pre.naf != null)
          ? {
              wnd: pre.naf.wnd,
              points: pre.naf.points.map(endoMul)
            }
          : undefined,
        doubles: (pre.doubles != null)
          ? {
              step: pre.doubles.step,
              points: pre.doubles.points.map(endoMul)
            }
          : undefined
      }
    }
    return beta
  }

  toJSON (): [BigNumber | null, BigNumber | null, { doubles: { step: any, points: any[] } | undefined, naf: { wnd: any, points: any[] } | undefined }?] {
    if (this.precomputed == null) { return [this.x, this.y] }

    return [this.x, this.y, typeof this.precomputed === 'object' && this.precomputed !== null
      ? {
          doubles: (this.precomputed.doubles != null)
            ? {
                step: this.precomputed.doubles.step,
                points: this.precomputed.doubles.points.slice(1)
              }
            : undefined,
          naf: (this.precomputed.naf != null)
            ? {
                wnd: this.precomputed.naf.wnd,
                points: this.precomputed.naf.points.slice(1)
              }
            : undefined
        }
      : undefined]
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

  _fixedNafMul (k: BigNumber): Point {
    if (typeof this.precomputed !== 'object' || this.precomputed === null) {
      throw new Error('_fixedNafMul requires precomputed values for the point')
    }
    const doubles = this._getDoubles()

    const naf = this.curve.getNAF(k, 1, this.curve._bitLength)
    let I = (1 << (doubles.step + 1)) - (doubles.step % 2 === 0 ? 2 : 1)
    I /= 3

    // Translate into more windowed form
    const repr: number[] = []
    for (let j = 0; j < naf.length; j += doubles.step) {
      let nafW = 0
      for (let k = j + doubles.step - 1; k >= j; k--) {
        nafW = (nafW << 1) + naf[k]
      }
      repr.push(nafW)
    }

    let a = new JPoint(null, null, null)
    let b = new JPoint(null, null, null)
    for (let i = I; i > 0; i--) {
      for (let j = 0; j < repr.length; j++) {
        const nafW = repr[j]
        if (nafW === i) {
          b = b.mixedAdd(doubles.points[j])
        } else if (nafW === -i) {
          b = b.mixedAdd((doubles.points[j]).neg())
        }
      }
      a = a.add(b)
    }
    return a.toP()
  }

  _wnafMulAdd (
    defW: number,
    points: Point[],
    coeffs: BigNumber[],
    len: number,
    jacobianResult?: boolean
  ): BasePoint {
    const wndWidth = this.curve._wnafT1
    const wnd = this.curve._wnafT2
    const naf = this.curve._wnafT3

    // Fill all arrays
    let max = 0
    for (let i = 0; i < len; i++) {
      const p = points[i]
      const nafPoints = p._getNAFPoints(defW)
      wndWidth[i] = nafPoints.wnd
      wnd[i] = nafPoints.points
    }

    // Comb small window NAFs
    for (let i = len - 1; i >= 1; i -= 2) {
      const a = i - 1
      const b = i
      if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
        naf[a] = this.curve
          .getNAF(coeffs[a], wndWidth[a], this.curve._bitLength)
        naf[b] = this.curve
          .getNAF(coeffs[b], wndWidth[b], this.curve._bitLength)
        max = Math.max(naf[a].length, max)
        max = Math.max(naf[b].length, max)
        continue
      }

      const comb: any[] = [
        points[a], /* 1 */
        null, /* 3 */
        null, /* 5 */
        points[b] /* 7 */
      ]

      // Try to avoid Projective points, if possible
      if (points[a].y.cmp(points[b].y) === 0) {
        comb[1] = points[a].add(points[b])
        comb[2] = points[a].toJ().mixedAdd(points[b].neg())
      } else if (points[a].y.cmp(points[b].y.redNeg()) === 0) {
        comb[1] = points[a].toJ().mixedAdd(points[b])
        comb[2] = points[a].add(points[b].neg())
      } else {
        comb[1] = points[a].toJ().mixedAdd(points[b])
        comb[2] = points[a].toJ().mixedAdd(points[b].neg())
      }

      const index = [
        -3, /* -1 -1 */
        -1, /* -1 0 */
        -5, /* -1 1 */
        -7, /* 0 -1 */
        0, /* 0 0 */
        7, /* 0 1 */
        5, /* 1 -1 */
        1, /* 1 0 */
        3 /* 1 1 */
      ]

      const jsf = this.curve.getJSF(coeffs[a], coeffs[b])
      max = Math.max(jsf[0].length, max)
      naf[a] = new Array(max)
      naf[b] = new Array(max)
      for (let j = 0; j < max; j++) {
        const ja = jsf[0][j] | 0
        const jb = jsf[1][j] | 0

        naf[a][j] = index[(ja + 1) * 3 + (jb + 1)]
        naf[b][j] = 0
        wnd[a] = comb
      }
    }

    let acc = new JPoint(null, null, null)
    const tmp = this.curve._wnafT4
    for (let i = max; i >= 0; i--) {
      let k = 0

      while (i >= 0) {
        let zero = true
        for (let j = 0; j < len; j++) {
          tmp[j] = naf[j][i] | 0
          if (tmp[j] !== 0) { zero = false }
        }
        if (!zero) { break }
        k++
        i--
      }
      if (i >= 0) { k++ }
      acc = acc.dblp(k)
      if (i < 0) { break }

      for (let j = 0; j < len; j++) {
        const z = tmp[j]
        let p
        if (z === 0) {
          continue
        } else if (z > 0) {
          p = wnd[j][(z - 1) >> 1]
        } else if (z < 0) {
          p = wnd[j][(-z - 1) >> 1].neg()
        }

        if (p.type === 'affine') {
          acc = acc.mixedAdd(p)
        } else {
          acc = acc.add(p)
        }
      }
    }
    // Zeroify references
    for (let i = 0; i < len; i++) { wnd[i] = null }

    if (jacobianResult) {
      return acc
    } else {
      return acc.toP()
    }
  }

  _endoWnafMulAdd (points, coeffs, jacobianResult?: boolean): BasePoint {
    const npoints = this.curve._endoWnafT1
    const ncoeffs = this.curve._endoWnafT2
    let i
    for (i = 0; i < points.length; i++) {
      const split = this.curve._endoSplit(coeffs[i])
      let p = points[i]
      let beta = p._getBeta()

      if (split.k1.negative !== 0) {
        split.k1.ineg()
        p = p.neg(true)
      }
      if (split.k2.negative !== 0) {
        split.k2.ineg()
        beta = beta.neg(true)
      }

      npoints[i * 2] = p
      npoints[i * 2 + 1] = beta
      ncoeffs[i * 2] = split.k1
      ncoeffs[i * 2 + 1] = split.k2
    }
    const res = this._wnafMulAdd(1, npoints, ncoeffs, i * 2, jacobianResult)

    // Clean-up references to points and coefficients
    for (let j = 0; j < i * 2; j++) {
      npoints[j] = null
      ncoeffs[j] = null
    }
    return res
  }

  _wnafMul (p: BasePoint, k: BigNumber): BasePoint {
    let w = 4

    // Precompute window
    const nafPoints = p._getNAFPoints(w)
    w = nafPoints.wnd
    const wnd = nafPoints.points

    // Get NAF form
    const naf = this.curve.getNAF(k, w, this.curve._bitLength)

    // Add `this`*(N+1) for every w-NAF index
    let acc = new JPoint(null, null, null)
    for (let i = naf.length - 1; i >= 0; i--) {
      // Count zeroes
      let k
      for (k = 0; i >= 0 && naf[i] === 0; i--) { k++ }
      if (i >= 0) { k++ }
      acc = acc.dblp(k)

      if (i < 0) { break }
      const z = naf[i]
      if (z === 0) {
        throw new Error('z cannot be 0')
      }
      if (p.type === 'affine') {
        // J +- P
        if (z > 0) {
          acc = acc.mixedAdd(wnd[(z - 1) >> 1])
        } else {
          acc = acc.mixedAdd(wnd[(-z - 1) >> 1].neg())
        }
      } else {
        // J +- J
        if (z > 0) {
          acc = acc.add(wnd[(z - 1) >> 1])
        } else {
          acc = acc.add(wnd[(-z - 1) >> 1].neg())
        }
      }
    }
    return p.type === 'affine' ? acc.toP() : acc
  }

  mul (k: BigNumber | number | number[] | string): Point {
    if (!BigNumber.isBN(k)) {
      k = new BigNumber(k as number, 16)
    }
    k = k as BigNumber
    if (this.isInfinity()) {
      return this
    } else if (this._hasDoubles(k)) {
      return this._fixedNafMul(k)
    } else if (
      typeof this.curve.endo === 'object' && this.curve.endo !== null
    ) {
      return this._endoWnafMulAdd([this], [k]) as Point
    } else {
      return this._wnafMul(this, k) as Point
    }
  }

  mulAdd (k1: BigNumber, p2: Point, k2: BigNumber): Point {
    const points = [this, p2]
    const coeffs = [k1, k2]
    if (typeof this.curve.endo === 'object' && this.curve.endo !== null) {
      return this._endoWnafMulAdd(points, coeffs) as Point
    } else {
      return this._wnafMulAdd(1, points, coeffs, 2) as Point
    }
  }

  jmulAdd (k1: BigNumber, p2: Point, k2: BigNumber): JPoint {
    const points = [this, p2]
    const coeffs = [k1, k2]
    if (typeof this.curve.endo === 'object' && this.curve.endo !== null) {
      return this._endoWnafMulAdd(points, coeffs, true) as JPoint
    } else {
      return this._wnafMulAdd(1, points, coeffs, 2, true) as JPoint
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
