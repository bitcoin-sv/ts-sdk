import BasePoint from './BasePoint'
import BigNumber from './BigNumber'
import Point from './Point'

export default class JacobianPoint extends BasePoint {
  x: BigNumber
  y: BigNumber
  z: BigNumber
  zOne: boolean

  constructor (
    x: string | BigNumber | null,
    y: string | BigNumber | null,
    z: string | BigNumber | null
  ) {
    super('jacobian')
    if (x === null && y === null && z === null) {
      this.x = this.curve.one
      this.y = this.curve.one
      this.z = new BigNumber(0)
    } else {
      this.x = new BigNumber(x, 16)
      this.y = new BigNumber(y, 16)
      this.z = new BigNumber(z, 16)
    }
    if (this.x.red == null) { this.x = this.x.toRed(this.curve.red) }
    if (this.y.red == null) { this.y = this.y.toRed(this.curve.red) }
    if (this.z.red == null) { this.z = this.z.toRed(this.curve.red) }

    this.zOne = this.z === this.curve.one
  }

  toP (): Point {
    if (this.isInfinity()) {
      return new Point(null, null)
    }

    const zinv = this.z.redInvm()
    const zinv2 = zinv.redSqr()
    const ax = this.x.redMul(zinv2)
    const ay = this.y.redMul(zinv2).redMul(zinv)

    return new Point(ax, ay)
  }

  neg (): JacobianPoint {
    return new JacobianPoint(this.x, this.y.redNeg(), this.z)
  }

  add (p: JacobianPoint): JacobianPoint {
    // O + P = P
    if (this.isInfinity()) { return p }

    // P + O = P
    if (p.isInfinity()) { return this }

    // 12M + 4S + 7A
    const pz2 = p.z.redSqr()
    const z2 = this.z.redSqr()
    const u1 = this.x.redMul(pz2)
    const u2 = p.x.redMul(z2)
    const s1 = this.y.redMul(pz2.redMul(p.z))
    const s2 = p.y.redMul(z2.redMul(this.z))

    const h = u1.redSub(u2)
    const r = s1.redSub(s2)
    if (h.cmpn(0) === 0) {
      if (r.cmpn(0) !== 0) {
        return new JacobianPoint(null, null, null)
      } else {
        return this.dbl()
      }
    }

    const h2 = h.redSqr()
    const h3 = h2.redMul(h)
    const v = u1.redMul(h2)

    const nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v)
    const ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3))
    const nz = this.z.redMul(p.z).redMul(h)

    return new JacobianPoint(nx, ny, nz)
  }

  mixedAdd (p: Point): JacobianPoint {
    // O + P = P
    if (this.isInfinity()) { return p.toJ() }

    // P + O = P
    if (p.isInfinity()) { return this }

    // 8M + 3S + 7A
    const z2 = this.z.redSqr()
    const u1 = this.x
    const u2 = p.x.redMul(z2)
    const s1 = this.y
    const s2 = p.y.redMul(z2).redMul(this.z)

    const h = u1.redSub(u2)
    const r = s1.redSub(s2)
    if (h.cmpn(0) === 0) {
      if (r.cmpn(0) !== 0) {
        return new JacobianPoint(null, null, null)
      } else {
        return this.dbl()
      }
    }

    const h2 = h.redSqr()
    const h3 = h2.redMul(h)
    const v = u1.redMul(h2)

    const nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v)
    const ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3))
    const nz = this.z.redMul(h)

    return new JacobianPoint(nx, ny, nz)
  }

  dblp (pow: number): JacobianPoint {
    if (pow === 0) {
      return this
    }
    if (this.isInfinity()) {
      return this
    }
    if (typeof pow === 'undefined') {
      return this.dbl()
    }

    /* eslint-disable @typescript-eslint/no-this-alias */
    let r = this as JacobianPoint
    for (let i = 0; i < pow; i++) { r = r.dbl() }
    return r
  }

  dbl (): JacobianPoint {
    if (this.isInfinity()) {
      return this
    }

    let nx
    let ny
    let nz
    // Z = 1
    if (this.zOne) {
      // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
      //     #doubling-mdbl-2007-bl
      // 1M + 5S + 14A

      // XX = X1^2
      const xx = this.x.redSqr()
      // YY = Y1^2
      const yy = this.y.redSqr()
      // YYYY = YY^2
      const yyyy = yy.redSqr()
      // S = 2 * ((X1 + YY)^2 - XX - YYYY)
      let s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy)
      s = s.redIAdd(s)
      // M = 3 * XX + a; a = 0
      const m = xx.redAdd(xx).redIAdd(xx)
      // T = M ^ 2 - 2*S
      const t = m.redSqr().redISub(s).redISub(s)

      // 8 * YYYY
      let yyyy8 = yyyy.redIAdd(yyyy)
      yyyy8 = yyyy8.redIAdd(yyyy8)
      yyyy8 = yyyy8.redIAdd(yyyy8)

      // X3 = T
      nx = t
      // Y3 = M * (S - T) - 8 * YYYY
      ny = m.redMul(s.redISub(t)).redISub(yyyy8)
      // Z3 = 2*Y1
      nz = this.y.redAdd(this.y)
    } else {
      // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
      //     #doubling-dbl-2009-l
      // 2M + 5S + 13A

      // A = X1^2
      const a = this.x.redSqr()
      // B = Y1^2
      const b = this.y.redSqr()
      // C = B^2
      const c = b.redSqr()
      // D = 2 * ((X1 + B)^2 - A - C)
      let d = this.x.redAdd(b).redSqr().redISub(a).redISub(c)
      d = d.redIAdd(d)
      // E = 3 * A
      const e = a.redAdd(a).redIAdd(a)
      // F = E^2
      const f = e.redSqr()

      // 8 * C
      let c8 = c.redIAdd(c)
      c8 = c8.redIAdd(c8)
      c8 = c8.redIAdd(c8)

      // X3 = F - 2 * D
      nx = f.redISub(d).redISub(d)
      // Y3 = E * (D - X3) - 8 * C
      ny = e.redMul(d.redISub(nx)).redISub(c8)
      // Z3 = 2 * Y1 * Z1
      nz = this.y.redMul(this.z)
      nz = nz.redIAdd(nz)
    }

    return new JacobianPoint(nx, ny, nz)
  }

  mul (k: BigNumber | number | number[] | string, kbase?: number | 'hex'): JacobianPoint {
    k = new BigNumber(k, kbase)

    return this.curve._wnafMul(this, k) as JacobianPoint
  }

  eq (p: Point | JacobianPoint): boolean {
    if (p.type === 'affine') { return this.eq((p as Point).toJ()) }

    if (this === p) { return true }

    // x1 * z2^2 == x2 * z1^2
    const z2 = this.z.redSqr()
    p = p as JacobianPoint
    const pz2 = p.z.redSqr()
    if (this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0) !== 0) {
      return false
    }

    // y1 * z2^3 == y2 * z1^3
    const z3 = z2.redMul(this.z)
    const pz3 = pz2.redMul(p.z)
    return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0) === 0
  }

  eqXToP (x: BigNumber): boolean {
    const zs = this.z.redSqr()
    const rx = x.toRed(this.curve.red).redMul(zs)
    if (this.x.cmp(rx) === 0) { return true }

    const xc = x.clone()
    const t = this.curve.redN.redMul(zs)
    for (; ;) {
      xc.iadd(this.curve.n)
      if (xc.cmp(this.curve.p) >= 0) { return false }

      rx.redIAdd(t)
      if (this.x.cmp(rx) === 0) { return true }
    }
  }

  inspect (): string {
    if (this.isInfinity()) { return '<EC JPoint Infinity>' }
    return '<EC JPoint x: ' + this.x.toString(16, 2) +
      ' y: ' + this.y.toString(16, 2) +
      ' z: ' + this.z.toString(16, 2) + '>'
  }

  isInfinity (): boolean {
    return this.z.cmpn(0) === 0
  }
}
