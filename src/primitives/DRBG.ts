import { SHA256HMAC } from './Hash.js'
import { toHex, toArray } from './utils.js'

/**
 * This class behaves as a HMAC-based deterministic random bit generator (DRBG). It implements a deterministic random number generator using SHA256HMAC HASH function. It takes an initial entropy and nonce when instantiated for seeding purpose.
 * @class DRBG
 *
 * @constructor
 * @param entropy - Initial entropy either in number array or hexadecimal string.
 * @param nonce - Initial nonce either in number array or hexadecimal string.
 *
 * @throws Throws an error message 'Not enough entropy. Minimum is 256 bits' when entropy's length is less than 32.
 *
 * @example
 * const drbg = new DRBG('af12de...', '123ef...');
 */
export default class DRBG {
  K: number[]
  V: number[]

  constructor (entropy: number[] | string, nonce: number[] | string) {
    entropy = toArray(entropy, 'hex')
    nonce = toArray(nonce, 'hex')

    if (entropy.length < 32) {
      throw new Error('Not enough entropy. Minimum is 256 bits')
    }
    const seed = entropy.concat(nonce)

    this.K = new Array(32)
    this.V = new Array(32)
    for (let i = 0; i < 32; i++) {
      this.K[i] = 0x00
      this.V[i] = 0x01
    }
    this.update(seed)
  }

  /**
   * Generates HMAC using the K value of the instance. This method is used internally for operations.
   *
   * @method hmac
   * @returns The SHA256HMAC object created with K value.
   *
   * @example
   * const hmac = drbg.hmac();
   */
  hmac (): SHA256HMAC {
    return new SHA256HMAC(this.K)
  }

  /**
   * Updates the `K` and `V` values of the instance based on the seed.
   * The seed if not provided uses `V` as seed.
   *
   * @method update
   * @param seed - an optional value that used to update `K` and `V`. Default is `undefined`.
   * @returns Nothing, but updates the internal state `K` and `V` value.
   *
   * @example
   * drbg.update('e13af...');
   */
  update (seed?): void {
    let kmac = this.hmac()
      .update(this.V)
      .update([0x00])
    if (seed !== undefined) { kmac = kmac.update(seed) }
    this.K = kmac.digest()
    this.V = this.hmac().update(this.V).digest()
    if (seed === undefined) { return }

    this.K = this.hmac()
      .update(this.V)
      .update([0x01])
      .update(seed)
      .digest()
    this.V = this.hmac().update(this.V).digest()
  }

  /**
   * Generates deterministic random hexadecimal string of given length.
   * In every generation process, it also updates the internal state `K` and `V`.
   *
   * @method generate
   * @param len - The length of required random number.
   * @returns The required deterministic random hexadecimal string.
   *
   * @example
   * const randomHex = drbg.generate(256);
   */
  generate (len: number): string {
    let temp = []
    while (temp.length < len) {
      this.V = this.hmac().update(this.V).digest()
      temp = temp.concat(this.V)
    }

    const res = temp.slice(0, len)
    this.update()
    return toHex(res)
  }
}
