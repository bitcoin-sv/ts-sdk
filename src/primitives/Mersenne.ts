import BigNumber from './BigNumber.js'

/**
 * A representation of a pseudo-Mersenne prime.
 * A pseudo-Mersenne prime has the general form 2^n - k, where n and k are integers.
 *
 * @class Mersenne
 *
 * @property name - The identifier for the Mersenne instance.
 * @property p - BigNumber equivalent to 2^n - k.
 * @property k - The constant subtracted from 2^n to derive a pseudo-Mersenne prime.
 * @property n - The exponent which determines the magnitude of the prime.
 */
export default class Mersenne {
  name: string
  p: BigNumber
  k: BigNumber
  n: number
  private readonly tmp: BigNumber

  /**
   * @constructor
   * @param name - An identifier for the Mersenne instance.
   * @param p - A string representation of the pseudo-Mersenne prime, expressed in hexadecimal.
   *
   * @example
   * const mersenne = new Mersenne('M31', '7FFFFFFF');
   */
  constructor (name: string, p: string) {
    // P = 2 ^ N - K
    this.name = name
    this.p = new BigNumber(p, 16)
    this.n = this.p.bitLength()
    this.k = new BigNumber(1).iushln(this.n).isub(this.p)

    this.tmp = this._tmp()
  }

  /**
   * Creates a temporary BigNumber structure for computations,
   * ensuring the appropriate number of words are initially allocated.
   *
   * @method _tmp
   * @returns A BigNumber with scaled size depending on prime magnitude.
   */
  private _tmp (): BigNumber {
    const tmp = new BigNumber()
    tmp.words = new Array(Math.ceil(this.n / 13))
    return tmp
  }

  /**
   * Reduces an input BigNumber in place, under the assumption that
   * it is less than the square of the pseudo-Mersenne prime.
   *
   * @method ireduce
   * @param num - The BigNumber to be reduced.
   * @returns The reduced BigNumber.
   *
   * @example
   * const reduced = mersenne.ireduce(new BigNumber('2345', 16));
   */
  ireduce (num: BigNumber): BigNumber {
    // Assumes that `num` is less than `P^2`
    // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
    let r = num
    let rlen

    do {
      this.split(r, this.tmp)
      r = this.imulK(r)
      r = r.iadd(this.tmp)
      rlen = r.bitLength()
    } while (rlen > this.n)

    const cmp = rlen < this.n ? -1 : r.ucmp(this.p)
    if (cmp === 0) {
      r.words[0] = 0
      r.length = 1
    } else if (cmp > 0) {
      r.isub(this.p)
    } else {
      if (r.strip !== undefined) {
        // r is a BN v4 instance
        r.strip()
      } else {
        // r is a BN v5 instance
        r.strip()
      }
    }

    return r
  }

  /**
   * Shifts bits of the input BigNumber to the right, in place,
   * to meet the magnitude of the pseudo-Mersenne prime.
   *
   * @method split
   * @param input - The BigNumber to be shifted.
   * @param out - The BigNumber to hold the shifted result.
   *
   * @example
   * mersenne.split(new BigNumber('2345', 16), new BigNumber());
   */
  split (input: BigNumber, out: BigNumber): void {
    input.iushrn(this.n, 0, out)
  }

  /**
   * Performs an in-place multiplication of the parameter by constant k.
   *
   * @method imulK
   * @param num - The BigNumber to multiply with k.
   * @returns The result of the multiplication, in BigNumber format.
   *
   * @example
   * const multiplied = mersenne.imulK(new BigNumber('2345', 16));
   */
  imulK (num: BigNumber): BigNumber {
    return num.imul(this.k)
  }
}
