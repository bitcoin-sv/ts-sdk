import ReductionContext from './ReductionContext.js'
import BigNumber from './BigNumber.js'

/**
 * Represents a Montgomery reduction context, which is a mathematical method
 * for performing modular multiplication without division.
 *
 * Montgomery reduction is an algorithm used mainly in cryptography which can
 * help to speed up calculations in contexts where there are many repeated
 * computations.
 *
 * This class extends the `ReductionContext` class.
 *
 * @class MontgomoryMethod
 * @extends {ReductionContext}
 *
 * @property shift - The number of bits in the modulus.
 * @property r - The 2^shift, shifted left by the bit length of modulus `m`.
 * @property r2 - The square of `r` modulo `m`.
 * @property rinv - The modular multiplicative inverse of `r` mod `m`.
 * @property minv - The modular multiplicative inverse of `m` mod `r`.
 */
export default class MontgomoryMethod extends ReductionContext {
  shift: number
  r: BigNumber
  r2: BigNumber
  rinv: BigNumber
  minv: BigNumber

  /**
   * @constructor
   * @param m - The modulus to be used for the Montgomery method reductions.
   */
  constructor (m: BigNumber | 'k256') {
    super(m)

    this.shift = this.m.bitLength()
    if (this.shift % 26 !== 0) {
      this.shift += 26 - (this.shift % 26)
    }

    this.r = new BigNumber(1).iushln(this.shift)
    this.r2 = this.imod(this.r.sqr())
    this.rinv = this.r._invmp(this.m)

    this.minv = this.rinv.mul(this.r).isubn(1).div(this.m)
    this.minv = this.minv.umod(this.r)
    this.minv = this.r.sub(this.minv)
  }

  /**
   * Converts a number into the Montgomery domain.
   *
   * @method convertTo
   * @param num - The number to be converted into the Montgomery domain.
   * @returns The result of the conversion into the Montgomery domain.
   *
   * @example
   * const montMethod = new MontgomoryMethod(m);
   * const convertedNum = montMethod.convertTo(num);
   */
  convertTo (num: BigNumber): BigNumber {
    return this.imod(num.ushln(this.shift))
  }

  /**
   * Converts a number from the Montgomery domain back to the original domain.
   *
   * @method convertFrom
   * @param num - The number to be converted from the Montgomery domain.
   * @returns The result of the conversion from the Montgomery domain.
   *
   * @example
   * const montMethod = new MontgomoryMethod(m);
   * const convertedNum = montMethod.convertFrom(num);
   */
  convertFrom (num: BigNumber): BigNumber {
    const r = this.imod(num.mul(this.rinv))
    r.red = null
    return r
  }

  /**
   * Performs an in-place multiplication of two numbers in the Montgomery domain.
   *
   * @method imul
   * @param a - The first number to multiply.
   * @param b - The second number to multiply.
   * @returns The result of the in-place multiplication.
   *
   * @example
   * const montMethod = new MontgomoryMethod(m);
   * const product = montMethod.imul(a, b);
   */
  imul (a: BigNumber, b: BigNumber): BigNumber {
    if (a.isZero() || b.isZero()) {
      a.words[0] = 0
      a.length = 1
      return a
    }

    const t = a.imul(b)
    const c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m)
    const u = t.isub(c).iushrn(this.shift)
    let res = u

    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m)
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m)
    }

    return res.forceRed(this)
  }

  /**
   * Performs the multiplication of two numbers in the Montgomery domain.
   *
   * @method mul
   * @param a - The first number to multiply.
   * @param b - The second number to multiply.
   * @returns The result of the multiplication.
   *
   * @example
   * const montMethod = new MontgomoryMethod(m);
   * const product = montMethod.mul(a, b);
   */
  mul (a: BigNumber, b: BigNumber): BigNumber {
    if (a.isZero() || b.isZero()) return new BigNumber(0).forceRed(this)

    const t = a.mul(b)
    const c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m)
    const u = t.isub(c).iushrn(this.shift)
    let res = u
    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m)
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m)
    }

    return res.forceRed(this)
  }

  /**
   * Calculates the modular multiplicative inverse of a number in the Montgomery domain.
   *
   * @method invm
   * @param a - The number to compute the modular multiplicative inverse of.
   * @returns The modular multiplicative inverse of 'a'.
   *
   * @example
   * const montMethod = new MontgomoryMethod(m);
   * const inverse = montMethod.invm(a);
   */
  invm (a: BigNumber): BigNumber {
    // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
    const res = this.imod(a._invmp(this.m).mul(this.r2))
    return res.forceRed(this)
  }
}
