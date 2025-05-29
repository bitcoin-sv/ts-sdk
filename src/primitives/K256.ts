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
    const mask = 0x3fffff // 22 bits
    const inputWords = input.words // Access via getter
    const inputNominalLength = input.length // Access via getter, respects _nominalWordLength

    const outLen = Math.min(inputNominalLength, 9)
    const tempOutputWords = new Array(outLen + (inputNominalLength > 9 ? 1 : 0)).fill(0)

    for (let i = 0; i < outLen; i++) {
      tempOutputWords[i] = inputWords[i]
    }
    let currentOutputWordCount = outLen

    if (inputNominalLength <= 9) {
      const finalOutputWords = new Array(currentOutputWordCount)
      for (let i = 0; i < currentOutputWordCount; ++i) finalOutputWords[i] = tempOutputWords[i]
      output.words = finalOutputWords // Use setter

      input.words = [0] // Use setter to set to 0
      return
    }

    // Shift by 9 limbs
    let prev = inputWords[9]
    tempOutputWords[currentOutputWordCount++] = prev & mask

    const finalOutputWords = new Array(currentOutputWordCount)
    for (let i = 0; i < currentOutputWordCount; ++i) finalOutputWords[i] = tempOutputWords[i]
    output.words = finalOutputWords // Use setter for output

    // For input modification
    const tempInputNewWords = new Array(Math.max(1, inputNominalLength - 9)).fill(0)
    let currentInputNewWordCount = 0

    for (let i = 10; i < inputNominalLength; i++) {
      const next = inputWords[i] | 0
      if (currentInputNewWordCount < tempInputNewWords.length) { // Boundary check
        tempInputNewWords[currentInputNewWordCount++] = ((next & mask) << 4) | (prev >>> 22)
      }
      prev = next
    }
    prev >>>= 22
    if (currentInputNewWordCount < tempInputNewWords.length) { // Boundary check
      tempInputNewWords[currentInputNewWordCount++] = prev
    } else if (prev !== 0 && tempInputNewWords.length > 0) { // If prev is non-zero but no space, this is an issue.
      // This case implies original logic might have relied on array auto-expansion or specific length handling
      // For safety, if there's still a carry and no space, the array should have been bigger.
      // However, the original logic `input.length -= 9` suggests truncation.
    }

    const finalInputNewWords = new Array(currentInputNewWordCount)
    for (let i = 0; i < currentInputNewWordCount; ++i) finalInputNewWords[i] = tempInputNewWords[i]
    input.words = finalInputNewWords // Use setter, which will strip and set magnitude
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
    const currentWords = num.words // Get current words based on _magnitude and _nominalWordLength
    const originalNominalLength = num.length // Getter

    const newNominalLength = originalNominalLength + 2
    const tempWords = new Array(newNominalLength).fill(0)

    for (let i = 0; i < originalNominalLength; i++) {
      tempWords[i] = currentWords[i]
    }
    // tempWords is now effectively num.words expanded with zeroes

    let lo = 0
    for (let i = 0; i < newNominalLength; i++) { // Iterate up to new expanded length
      const w = tempWords[i] | 0
      lo += w * 0x3d1 // 0x3d1 = 977
      tempWords[i] = lo & 0x3ffffff // 26-bit mask
      lo = w * 0x40 + ((lo / 0x4000000) | 0) // 0x40 = 64. 0x4000000 = 2^26
    }

    num.words = tempWords // Use setter to re-initialize from tempWords
    // The setter will handle _magnitude, _sign, _nominalWordLength, and strip.
    return num
  }
}
