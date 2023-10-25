import Mersenne from './Mersenne.js'
import BigNumber from './BigNumber.js'

/**
 * A class representing K-256, a prime number with optimizations, specifically used in the secp256k1 curve.
 * It extends the functionalities of the Mersenne class.
 * K-256 prime is represented as 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f'
 *
 * @class K256
 * @extends {Mersenne}
 *
 * @example
 * const k256 = new K256();
 */
export default class K256 extends Mersenne {
  /**
   * Constructor for the K256 class.
   * Creates an instance of K256 using the super constructor from Mersenne.
   *
   * @constructor
   *
   * @example
   * const k256 = new K256();
   */
  constructor () {
    super(
      'k256',
      'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f'
    )
  }

  /**
   * Splits a BigNumber into a new BigNumber based on specific computation
   * rules. This method modifies the input and output big numbers.
   *
   * @method split
   * @param input - The BigNumber to be split.
   * @param output - The BigNumber that results from the split.
   *
   * @example
   * const input = new BigNumber(3456);
   * const output = new BigNumber(0);
   * k256.split(input, output);
   */
  split (input: BigNumber, output: BigNumber): void {
    // 256 = 9 * 26 + 22
    const mask = 0x3fffff

    const outLen = Math.min(input.length, 9)
    let i = 0
    for (; i < outLen; i++) {
      output.words[i] = input.words[i]
    }
    output.length = outLen

    if (input.length <= 9) {
      input.words[0] = 0
      input.length = 1
      return
    }

    // Shift by 9 limbs
    let prev = input.words[9]
    output.words[output.length++] = prev & mask

    for (i = 10; i < input.length; i++) {
      const next = input.words[i] | 0
      input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22)
      prev = next
    }
    prev >>>= 22
    input.words[i - 10] = prev
    if (prev === 0 && input.length > 10) {
      input.length -= 10
    } else {
      input.length -= 9
    }
  }

  /**
   * Multiplies a BigNumber ('num') with the constant 'K' in-place and returns the result.
   * 'K' is equal to 0x1000003d1 or in decimal representation: [ 64, 977 ].
   *
   * @method imulK
   * @param num - The BigNumber to multiply with K.
   * @returns Returns the mutated BigNumber after multiplication.
   *
   * @example
   * const number = new BigNumber(12345);
   * const result = k256.imulK(number);
   */
  imulK (num: BigNumber): BigNumber {
    // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
    num.words[num.length] = 0
    num.words[num.length + 1] = 0
    num.length += 2

    // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
    let lo = 0
    for (let i = 0; i < num.length; i++) {
      const w = num.words[i] | 0
      lo += w * 0x3d1
      num.words[i] = lo & 0x3ffffff
      lo = w * 0x40 + ((lo / 0x4000000) | 0)
    }

    // Fast length reduction
    if (num.words[num.length - 1] === 0) {
      num.length--
      if (num.words[num.length - 1] === 0) {
        num.length--
      }
    }
    return num
  }
}
