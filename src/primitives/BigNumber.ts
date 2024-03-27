import ReductionContext from './ReductionContext.js'

/**
 * JavaScript numbers are only precise up to 53 bits. Since Bitcoin relies on
 * 256-bit cryptography, this BigNumber class enables operations on larger
 * numbers.
 *
 * @class BigNumber
 */
export default class BigNumber {
  /**
   * @privateinitializer
   */
  static zeros: string[] = [
    '',
    '0',
    '00',
    '000',
    '0000',
    '00000',
    '000000',
    '0000000',
    '00000000',
    '000000000',
    '0000000000',
    '00000000000',
    '000000000000',
    '0000000000000',
    '00000000000000',
    '000000000000000',
    '0000000000000000',
    '00000000000000000',
    '000000000000000000',
    '0000000000000000000',
    '00000000000000000000',
    '000000000000000000000',
    '0000000000000000000000',
    '00000000000000000000000',
    '000000000000000000000000',
    '0000000000000000000000000'
  ]

  /**
   * @privateinitializer
   */
  static groupSizes: number[] = [
    0, 0,
    25, 16, 12, 11, 10, 9, 8,
    8, 7, 7, 7, 7, 6, 6,
    6, 6, 6, 6, 6, 5, 5,
    5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5
  ]

  /**
   * @privateinitializer
   */
  static groupBases: number[] = [
    0, 0,
    33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
    43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
    16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
    6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
    24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
  ]

  /**
   * The word size of big number chunks.
   *
   * @property wordSize
   *
   * @example
   * console.log(BigNumber.wordSize);  // output: 26
   */
  static wordSize: number = 26

  /**
   * Negative flag. Indicates whether the big number is a negative number.
   * - If 0, the number is positive.
   * - If 1, the number is negative.
   *
   * @property negative
   *
   * @example
   * let num = new BigNumber("-10");
   * console.log(num.negative);  // output: 1
   */
  negative: number

  /**
   * Array of numbers, where each number represents a part of the value of the big number.
   *
   * @property words
   *
   * @example
   * let num = new BigNumber(50000);
   * console.log(num.words);  // output: [ 50000 ]
   */
  words: number[]

  /**
   * Length of the words array.
   *
   * @property length
   *
   * @example
   * let num = new BigNumber(50000);
   * console.log(num.length);  // output: 1
   */
  length: number

  /**
   * Reduction context of the big number.
   *
   * @property red
   */
  red: ReductionContext | null

  /**
   * Checks whether a value is an instance of BigNumber. If not, then checks the features of the input to determine potential compatibility. Regular JS numbers fail this check.
   *
   * @method isBN
   * @param num - The value to be checked.
   * @returns - Returns a boolean value determining whether or not the checked num parameter is a BigNumber.
   *
   * @example
   * const validNum = new BigNumber(5);
   * BigNumber.isBN(validNum); // returns true
   *
   * const invalidNum = 5;
   * BigNumber.isBN(invalidNum); // returns false
   */
  static isBN (num: any): boolean {
    if (num instanceof BigNumber) {
      return true
    }

    return num !== null && typeof num === 'object' &&
      num.constructor.wordSize === BigNumber.wordSize &&
      Array.isArray(num.words)
  }

  /**
   * Returns the bigger value between two BigNumbers
   *
   * @method max
   * @param left - The first BigNumber to be compared.
   * @param right - The second BigNumber to be compared.
   * @returns - Returns the bigger BigNumber between left and right.
   *
   * @example
   * const bn1 = new BigNumber(5);
   * const bn2 = new BigNumber(10);
   * BigNumber.max(bn1, bn2); // returns bn2
   */
  static max (left: BigNumber, right: BigNumber): BigNumber {
    if (left.cmp(right) > 0) return left
    return right
  }

  /**
   * Returns the smaller value between two BigNumbers
   *
   * @method min
   * @param left - The first BigNumber to be compared.
   * @param right - The second BigNumber to be compared.
   * @returns - Returns the smaller value between left and right.
   *
   * @example
   * const bn1 = new BigNumber(5);
   * const bn2 = new BigNumber(10);
   * BigNumber.min(bn1, bn2); // returns bn1
   */
  static min (left: BigNumber, right: BigNumber): BigNumber {
    if (left.cmp(right) < 0) return left
    return right
  }

  /**
   * @constructor
   *
   * @param number - The number (various types accepted) to construct a BigNumber from. Default is 0.
   *
   * @param base - The base of number provided. By default is 10.
   *
   * @param endian - The endianness provided. By default is 'big endian'.
   *
   * @example
   * import BigNumber from './BigNumber';
   * const bn = new BigNumber('123456', 10, 'be');
   */
  constructor (
    number: number | string | number[] = 0,
    base: number | 'be' | 'le' | 'hex' = 10,
    endian: 'be' | 'le' = 'be'
  ) {
    this.negative = 0
    this.words = []
    this.length = 0

    // Reduction context
    this.red = null

    if (number !== null) {
      if (base === 'le' || base === 'be') {
        endian = base
        base = 10
      }

      if (typeof number === 'number') {
        return this.initNumber(number, base, endian)
      }

      if (typeof number === 'object') {
        return this.initArray(number, endian)
      }

      if (base === 'hex') {
        base = 16
      }
      this.assert(base === (base | 0) && base >= 2 && base <= 36)

      number = number.toString().replace(/\s+/g, '')
      let start = 0
      if (number[0] === '-') {
        start++
        this.negative = 1
      }

      if (start < number.length) {
        if (base === 16) {
          this.parseHex(number, start, endian)
        } else {
          this.parseBase(number, base, start)
          if (endian === 'le') {
            this.initArray(this.toArray(), endian)
          }
        }
      }
    }
  }

  /**
   * Asserts that a certain condition is true. If it is not, throws an error with the provided message.
   *
   * @method assert
   * @private
   * @param val - The condition to be checked.
   * @param msg - The error message to throw if the condition is not satisfied. Default is 'Assertion failed'.
   */
  private assert (val: unknown, msg: string = 'Assertion failed'): void {
    if (!(val as boolean)) throw new Error(msg)
  }

  /**
   * Function to initialize a BigNumber from a regular number. It also determines if the number is negative and sets the negative property accordingly.
   * If the endianness provided is little endian ('le'), it reverses the bytes.
   *
   * @method initNumber
   * @private
   * @param number - The number to initialize the BigNumber from.
   * @param base - The base of the number provided.
   * @param endian - The endianness ('be' for big-endian, 'le' for little-endian).
   * @returns The current BigNumber instance.
   */
  private initNumber (number, base, endian): BigNumber {
    if (number < 0) {
      this.negative = 1
      number = -number
    }
    if (number < 0x4000000) {
      this.words = [number & 0x3ffffff]
      this.length = 1
    } else if (number < 0x10000000000000) {
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff
      ]
      this.length = 2
    } else {
      this.assert(
        number < 0x20000000000000,
        'The number is larger than 2 ^ 53 (unsafe)'
      )
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff,
        1
      ]
      this.length = 3
    }

    if (endian !== 'le') return this

    // Reverse the bytes
    this.initArray(this.toArray(), endian)
    return this
  }

  /**
   * Creates a new BigNumber from the provided number array and initializes it based on the base and endian provided.
   *
   * @method initArray
   * @private
   * @param number - The array of numbers to initialize the BigNumber from. Each number represents a part of the value of the big number.
   * @param endian - The endianness ('be' for big-endian, 'le' for little-endian).
   * @return The current BigNumber instance.
   */
  private initArray (number, endian): BigNumber {
    // Perhaps a Uint8Array
    this.assert(
      typeof number.length === 'number',
      'The number must have a length'
    )
    if (number.length <= 0) {
      this.words = [0]
      this.length = 1
      return this
    }

    this.length = Math.ceil(number.length / 3)
    this.words = new Array(this.length)
    let i = 0
    for (; i < this.length; i++) {
      this.words[i] = 0
    }

    let j: number, w
    let off = 0
    if (endian === 'be') {
      for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
        w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16)
        this.words[j] |= (w << off) & 0x3ffffff
        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff
        off += 24
        if (off >= 26) {
          off -= 26
          j++
        }
      }
    } else if (endian === 'le') {
      for (i = 0, j = 0; i < number.length; i += 3) {
        w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16)
        this.words[j] |= (w << off) & 0x3ffffff
        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff
        off += 24
        if (off >= 26) {
          off -= 26
          j++
        }
      }
    }
    return this.strip()
  }

  /**
   * Function to extract the 4-bit number from a hexadecimal character
   *
   * @method parseHex4Bits
   * @private
   * @param string - The string containing the hexadecimal character.
   * @param index - The index of the hexadecimal character in the string.
   * @return The decimal value corresponding to the hexadecimal character.
   */
  private parseHex4Bits (string: string, index: number): number {
    const c = string.charCodeAt(index)
    // '0' - '9'
    if (c >= 48 && c <= 57) {
      return c - 48
    // 'A' - 'F'
    } else if (c >= 65 && c <= 70) {
      return c - 55
    // 'a' - 'f'
    } else if (c >= 97 && c <= 102) {
      return c - 87
    } else {
      throw new Error('Invalid character in ' + string)
    }
  }

  /**
   * Function to extract the 8-bit number from two hexadecimal characters
   *
   * @method parseHexByte
   * @private
   * @param string - The string containing the hexadecimal characters.
   * @param lowerBound - The lower bound of the index to start parsing from.
   * @param index - The index of the second hexadecimal character in the string.
   * @return The decimal value corresponding to the two hexadecimal characters.
   */
  private parseHexByte (
    string: string, lowerBound: number, index: number
  ): number {
    let r = this.parseHex4Bits(string, index)
    if (index - 1 >= lowerBound) {
      r |= this.parseHex4Bits(string, index - 1) << 4
    }
    return r
  }

  /**
   * Function to parse and convert a specific string portion into a big number in hexadecimal base.
   *
   * @method parseHex
   * @private
   * @param number - The string to parse.
   * @param start - The index to start parsing from.
   * @param endian - The endianness ('be', 'le').
   * @return The current BigNumber instance.
   */
  private parseHex (number: string, start: number, endian): BigNumber {
    // Create possibly bigger array to ensure that it fits the number
    this.length = Math.ceil((number.length - start) / 6)
    this.words = new Array(this.length)
    let i = 0
    for (; i < this.length; i++) {
      this.words[i] = 0
    }

    // 24-bits chunks
    let off = 0
    let j = 0

    let w
    if (endian === 'be') {
      for (i = number.length - 1; i >= start; i -= 2) {
        w = this.parseHexByte(number, start, i) << off
        this.words[j] |= w & 0x3ffffff
        if (off >= 18) {
          off -= 18
          j += 1
          this.words[j] |= w >>> 26
        } else {
          off += 8
        }
      }
    } else {
      const parseLength = number.length - start
      for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
        w = this.parseHexByte(number, start, i) << off
        this.words[j] |= w & 0x3ffffff
        if (off >= 18) {
          off -= 18
          j += 1
          this.words[j] |= w >>> 26
        } else {
          off += 8
        }
      }
    }

    return this.strip()
  }

  /**
   * Function to convert a particular string portion into a base word.
   *
   * @method parseBaseWord
   * @private
   * @param str - The string to parse.
   * @param start - The index to start parsing from.
   * @param end - The index to stop parsing at.
   * @param mul - The base to be used for the conversion.
   * @return The decimal value of the parsed base word.
   */
  private parseBaseWord (str, start, end, mul): number {
    let r = 0
    let b = 0
    const len = Math.min(str.length, end)
    for (let i = start; i < len; i++) {
      const c = str.charCodeAt(i) - 48

      r *= mul

      // 'a'
      if (c >= 49) {
        b = c - 49 + 0xa

      // 'A'
      } else if (c >= 17) {
        b = c - 17 + 0xa

      // '0' - '9'
      } else {
        b = c
      }
      this.assert(c >= 0 && b < mul, 'Invalid character')
      r += b
    }
    return r
  }

  /**
   * Function to convert a string into a big number in a specific base.
   *
   * @method parseBase
   * @private
   * @param number - The string to be converted into a big number.
   * @param base - The base to be used for conversion.
   * @param start - The index to start conversion from.
   * @return The current BigNumber instance.
   */
  private parseBase (number: string, base: number, start: number): BigNumber {
    // Initialize as zero
    this.words = [0]
    this.length = 1

    // Find length of limb in base
    let limbLen = 0
    let limbPow = 1
    for (; limbPow <= 0x3ffffff; limbPow *= base) {
      limbLen++
    }
    limbLen--
    limbPow = (limbPow / base) | 0

    const total = number.length - start
    const mod = total % limbLen
    const end = Math.min(total, total - mod) + start

    let word = 0
    let i = start
    for (; i < end; i += limbLen) {
      word = this.parseBaseWord(number, i, i + limbLen, base)

      this.imuln(limbPow)
      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word
      } else {
        this._iaddn(word)
      }
    }

    if (mod !== 0) {
      let pow = 1
      word = this.parseBaseWord(number, i, number.length, base)

      for (i = 0; i < mod; i++) {
        pow *= base
      }

      this.imuln(pow)
      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word
      } else {
        this._iaddn(word)
      }
    }

    return this.strip()
  }

  /**
   * The copy method copies the state of this BigNumber into an exsiting `dest` BigNumber.
   *
   * @method copy
   * @param dest - The BigNumber instance that will be updated to become a copy.
   *
   * @example
   * const bn1 = new BigNumber('123456', 10, 'be');
   * const bn2 = new BigNumber();
   * bn1.copy(bn2);
   * // bn2 is now a BigNumber representing 123456
   */
  copy (dest: BigNumber): void {
    dest.words = new Array(this.length)
    for (let i = 0; i < this.length; i++) {
      dest.words[i] = this.words[i]
    }
    dest.length = this.length
    dest.negative = this.negative
    dest.red = this.red
  }

  /**
   *
   * Directly transfers the attributes of the source BigNumber to the destination BigNumber.
   *
   * @method move
   * @param dest - The BigNumber that attributes will be moved into.
   * @param src - The BigNumber that attributes will be moved from.
   *
   * @example
   * const src = new BigNumber('123456', 10, 'be');
   * const dest = new BigNumber();
   * BigNumber.move(dest, src);
   * // dest is now a BigNumber representing 123456
   */
  static move (dest: BigNumber, src: BigNumber): void {
    dest.words = src.words
    dest.length = src.length
    dest.negative = src.negative
    dest.red = src.red
  }

  /**
   * Creates a copy of the current BigNumber instance.
   *
   * @method clone
   * @returns A new BigNumber instance, identical to the original.
   *
   * @example
   * const bn = new BigNumber('123456', 10, 'be');
   * const bnClone = bn.clone();
   */
  clone (): BigNumber {
    const r = new BigNumber()
    this.copy(r)
    return r
  }

  /**
   * Increases the BigNumber length up to a certain size and initializes new elements with 0.
   *
   * @method expand
   * @param size - The desired size to grow the BigNumber length.
   * @returns The BigNumber instance after expansion.
   *
   * @example
   * const bn = new BigNumber('123456', 10, 'be');
   * bn.expand(10);
   */
  expand (size): BigNumber {
    while (this.length < size) {
      this.words[this.length++] = 0
    }
    return this
  }

  /**
   * Removes leading zeros.
   *
   * @method strip
   * @returns - Returns the BigNumber after stripping leading zeros.
   *
   * @example
   * const bn = new BigNumber("000000", 2, "be");
   * bn.strip();
   * // bn now represents 0
   */
  strip (): BigNumber {
    while (this.length > 1 && this.words[this.length - 1] === 0) {
      this.length--
    }
    return this.normSign()
  }

  /**
   * Normalizes the sign of the BigNumber. Changes -0 to 0.
   *
   * @method normSign
   * @returns The normalized BigNumber instance.
   *
   * @example
   * const bn = new BigNumber('-0', 10, 'be');
   * bn.normSign();
   */
  normSign (): BigNumber {
    // -0 = 0
    if (this.length === 1 && this.words[0] === 0) {
      this.negative = 0
    }
    return this
  }

  /**
   * Utility for inspecting the current BigNumber instance. Accompanied with a prefix '<BN: ' or '<BN-R: '.
   *
   * @method inspect
   * @returns A string representation to inspect the BigNumber instance.
   *
   * @example
   * const bn = new BigNumber('123456', 10, 'be');
   * bn.inspect();
   */
  inspect (): string {
    return (this.red !== null ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>'
  }

  /**
   * Converts the BigNumber instance to a string representation.
   *
   * @method toString
   * @param base - The base for representing number. Default is 10. Other accepted values are 16 and 'hex'.
   * @param padding - Represents the minimum number of digits to represent the BigNumber as a string. Default is 1.
   * @throws If base is not between 2 and 36.
   * @returns The string representation of the BigNumber instance
   *
   * @example
   * const bn = new BigNumber('123456', 10, 'be');
   * bn.toString(16); // Converts the BigNumber to a hexadecimal string.
   */
  toString (base: number | 'hex' = 10, padding: number = 1): string {
    let out: string
    if (base === 16 || base === 'hex') {
      out = ''
      let off = 0
      let carry = 0
      for (let i = 0; i < this.length; i++) {
        const w = this.words[i]
        const word = (((w << off) | carry) & 0xffffff).toString(16)
        carry = (w >>> (24 - off)) & 0xffffff
        off += 2
        if (off >= 26) {
          off -= 26
          i--
        }
        if (carry !== 0 || i !== this.length - 1) {
          out = BigNumber.zeros[6 - word.length] + word + out
        } else {
          out = word + out
        }
      }
      if (carry !== 0) {
        out = carry.toString(16) + out
      }
      if (padding === 0 && out === '0') {
        return ''
      }
      while (out.length % padding !== 0 && padding !== 0) {
        out = '0' + out
      }
      if (this.negative !== 0) {
        out = '-' + out
      }
      return out
    }

    if (base === (base | 0) && base >= 2 && base <= 36) {
      const groupSize = BigNumber.groupSizes[base]
      const groupBase = BigNumber.groupBases[base]
      out = ''
      let c = this.clone()
      c.negative = 0
      while (!c.isZero()) {
        const r = c.modrn(groupBase).toString(base)
        c = c.idivn(groupBase)

        if (!c.isZero()) {
          out = BigNumber.zeros[groupSize - r.length] + r + out
        } else {
          out = r + out
        }
      }
      if (this.isZero()) {
        out = '0' + out
      }
      while (out.length % padding !== 0) {
        out = '0' + out
      }
      if (this.negative !== 0) {
        out = '-' + out
      }
      return out
    }

    throw new Error('Base should be between 2 and 36')
  }

  /**
   * Converts the BigNumber instance to a JavaScript number.
   * Please note that JavaScript numbers are only precise up to 53 bits.
   *
   * @method toNumber
   * @throws If the BigNumber instance cannot be safely stored in a JavaScript number
   * @returns The JavaScript number representation of the BigNumber instance.
   *
   * @example
   * const bn = new BigNumber('123456', 10, 'be');
   * bn.toNumber();
   */
  toNumber (): number {
    let ret = this.words[0]
    if (this.length === 2) {
      ret += this.words[1] * 0x4000000
    } else if (this.length === 3 && this.words[2] === 0x01) {
      // NOTE: at this stage it is known that the top bit is set
      ret += 0x10000000000000 + (this.words[1] * 0x4000000)
    } else if (this.length > 2) {
      throw new Error('Number can only safely store up to 53 bits')
    }
    return (this.negative !== 0) ? -ret : ret
  }

  /**
   * Converts the BigNumber instance to a JSON-formatted string.
   *
   * @method toJSON
   * @returns The JSON string representation of the BigNumber instance.
   *
   * @example
   * const bn = new BigNumber('123456', 10, 'be');
   * bn.toJSON();
   */
  toJSON (): string {
    return this.toString(16)
  }

  /**
   * An internal method to format the BigNumber instance into ArrayTypes of Little Endian Type.
   * This is a private method.
   *
   * @method toArrayLikeLE
   * @private
   * @param res - The resultant ArrayType instance
   * @param byteLength - The byte length to define the size of ArrayType
   */
  private toArrayLikeLE (res, byteLength): void {
    let position = 0
    let carry = 0

    for (let i = 0, shift = 0; i < this.length; i++) {
      const word = (this.words[i] << shift) | carry

      res[position++] = word & 0xff
      if (position < res.length) {
        res[position++] = (word >> 8) & 0xff
      }
      if (position < res.length) {
        res[position++] = (word >> 16) & 0xff
      }

      if (shift === 6) {
        if (position < res.length) {
          res[position++] = (word >> 24) & 0xff
        }
        carry = 0
        shift = 0
      } else {
        carry = word >>> 24
        shift += 2
      }
    }

    if (position < res.length) {
      res[position++] = carry

      while (position < res.length) {
        res[position++] = 0
      }
    }
  }

  /**
   * An internal method to format the BigNumber instance into ArrayTypes of Big Endian Type.
   * This is a private method.
   *
   * @method toArrayLikeBE
   * @private
   * @param res - The resultant ArrayType instance
   * @param byteLength - The byte length to define the size of ArrayType
   */
  private toArrayLikeBE (res, byteLength): void {
    let position = res.length - 1
    let carry = 0

    for (let i = 0, shift = 0; i < this.length; i++) {
      const word = (this.words[i] << shift) | carry

      res[position--] = word & 0xff
      if (position >= 0) {
        res[position--] = (word >> 8) & 0xff
      }
      if (position >= 0) {
        res[position--] = (word >> 16) & 0xff
      }

      if (shift === 6) {
        if (position >= 0) {
          res[position--] = (word >> 24) & 0xff
        }
        carry = 0
        shift = 0
      } else {
        carry = word >>> 24
        shift += 2
      }
    }

    if (position >= 0) {
      res[position--] = carry

      while (position >= 0) {
        res[position--] = 0
      }
    }
  }

  /**
   * Converts the BigNumber instance to a JavaScript number array.
   *
   * @method toArray
   * @param endian - The endian for converting BigNumber to array. Default value is 'be'.
   * @param length - The length for the resultant array. Default value is undefined.
   * @returns The JavaScript array representation of the BigNumber instance.
   *
   * @example
   * const bn = new BigNumber('123456', 10, 'be');
   * bn.toArray('be', 8);
   */
  toArray (endian: 'le' | 'be' = 'be', length?: number): number[] {
    this.strip()

    const byteLength = this.byteLength()
    const reqLength = length ?? Math.max(1, byteLength)
    this.assert(byteLength <= reqLength, 'byte array longer than desired length')
    this.assert(reqLength > 0, 'Requested array length <= 0')

    const res = new Array(reqLength)
    if (endian === 'le') {
      this.toArrayLikeLE(res, byteLength)
    } else {
      this.toArrayLikeBE(res, byteLength)
    }
    return res
  }

  /**
   * A utility method to count the word bits.
   * This is a private method.
   *
   * @method countWordBits
   * @private
   * @param w - The input number to count the word bits.
   * @returns The number of word bits
   */
  private countWordBits (w: number): number {
    if (typeof Math.clz32 === 'function') {
      return 32 - Math.clz32(w)
    }
    let t = w
    let r = 0
    if (t >= 0x1000) {
      r += 13
      t >>>= 13
    }
    if (t >= 0x40) {
      r += 7
      t >>>= 7
    }
    if (t >= 0x8) {
      r += 4
      t >>>= 4
    }
    if (t >= 0x02) {
      r += 2
      t >>>= 2
    }
    return r + t
  }

  /**
   * A utility method to compute the number of zero bits.
   * This is a private method.
   *
   * @method zeroWordBits
   * @private
   * @param w - The input number to count the zero bits.
   * @returns The number of zero bits
   */
  private zeroWordBits (w: number): number {
    // Short-cut
    if (w === 0) return 26

    let t = w
    let r = 0
    if ((t & 0x1fff) === 0) {
      r += 13
      t >>>= 13
    }
    if ((t & 0x7f) === 0) {
      r += 7
      t >>>= 7
    }
    if ((t & 0xf) === 0) {
      r += 4
      t >>>= 4
    }
    if ((t & 0x3) === 0) {
      r += 2
      t >>>= 2
    }
    if ((t & 0x1) === 0) {
      r++
    }
    return r
  }

  /**
   * Returns the number of used bits in this big number.
   *
   * @method bitLength
   * @returns The number of used bits
   */
  bitLength (): number {
    const w = this.words[this.length - 1]
    const hi = this.countWordBits(w)
    return (this.length - 1) * 26 + hi
  }

  /**
   * Convert a big number to a boolean array representing
   * a binary number, where each array index is a bit.
   * @static
   * @method toBitArray
   * @param num - The big number to convert.
   * @returns Returns an array of booleans representing
   * a binary number, with each array index being a bit.
   * @example
   * const BigNumber = require("./BigNumber");
   * const bn = new BigNumber('6'); // binary: 110
   * const bits = BigNumber.toBitArray(bn); // [1,1,0]
   */
  static toBitArray (num: BigNumber): Array<0 | 1> {
    const w = new Array(num.bitLength())

    for (let bit = 0; bit < w.length; bit++) {
      const off = (bit / 26) | 0
      const wbit = bit % 26

      w[bit] = (num.words[off] >>> wbit) & 0x01
    }

    return w
  }

  /**
   * Convert this big number to a boolean array representing
   * a binary number, where each array index is a bit.
   * @method toBitArray
   * @returns Returns an array of booleans representing a binary number.
   *
   * @example
   * const BigNumber = require("./BigNumber");
   * const bn = new BigNumber('6'); // binary: 110
   * const bits = bn.toBitArray(); // [ 1, 1, 0 ]
   */
  toBitArray (): Array<0 | 1> {
    return BigNumber.toBitArray(this)
  }

  /**
   * Returns the number of trailing zero bits in the big number.
   * @method zeroBits
   * @returns Returns the number of trailing zero bits
   * in the binary representation of the big number.
   * @example
   * const BigNumber = require("./BigNumber");
   * const bn = new BigNumber('8'); // binary: 1000
   * const zeroBits = bn.zeroBits(); // 3
   */
  zeroBits (): number {
    if (this.isZero()) return 0

    let r = 0
    for (let i = 0; i < this.length; i++) {
      const b = this.zeroWordBits(this.words[i])
      r += b
      if (b !== 26) break
    }
    return r
  }

  /**
   * Get the byte length of the BigNumber
   *
   * @method byteLength
   * @returns Returns the byte length of the big number.
   * @example
   * const BigNumber = require("./BigNumber");
   * const bn = new BigNumber('1234');
   * const byteLen = bn.byteLength();
   */
  byteLength (): number {
    return Math.ceil(this.bitLength() / 8)
  }

  /**
   * Converts this big number to two's complement with a specified bit width.
   * @method toTwos
   * @param width - The bit width.
   * @returns Returns the two's complement of the big number.
   *
   * @example
   * const BigNumber = require("./BigNumber");
   * const bn = new BigNumber('-1234');
   * const twosComp = bn.toTwos(16);
   */
  toTwos (width: number): BigNumber {
    if (this.negative !== 0) {
      return this.abs().inotn(width).iaddn(1)
    }
    return this.clone()
  }

  /**
   * Converts this big number from two's complement with a specified bit width.
   * @method fromTwos
   * @param width - The bit width.
   * @returns Returns the big number converted from two's complement.
   *
   * @example
   * const BigNumber = require("./BigNumber");
   * const bn = new BigNumber('-1234');
   * const fromTwos = bn.fromTwos(16);
   */
  fromTwos (width: number): BigNumber {
    if (this.testn(width - 1)) {
      return this.notn(width).iaddn(1).ineg()
    }
    return this.clone()
  }

  /**
   * Checks if the big number is negative.
   * @method isNeg
   * @returns Returns true if the big number is negative, otherwise false.
   *
   * @example
   * const BigNumber = require("./BigNumber");
   * const bn = new BigNumber('-1234');
   * const isNegative = bn.isNeg(); // true
   */
  isNeg (): boolean {
    return this.negative !== 0
  }

  /**
   * Negates the big number and returns a new instance.
   * @method neg
   * @returns Returns a new BigNumber that is the negation of this big number.
   *
   * @example
   * const BigNumber = require("./BigNumber");
   * const bn = new BigNumber('1234');
   * const neg = bn.neg(); // -1234
   */
  neg (): BigNumber {
    return this.clone().ineg()
  }

  /**
   * Negates the big number in-place.
   * @method ineg
   * @returns Returns this big number as the negation of itself.
   *
   * @example
   * const BigNumber = require("./BigNumber");
   * const bn = new BigNumber('1234');
   * bn.ineg(); // bn is now -1234
   */
  ineg (): BigNumber {
    if (!this.isZero()) {
      this.negative ^= 1
    }

    return this
  }

  /**
   * Performs a bitwise OR operation with another BigNumber and stores
   * the result in this BigNumber.
   * @method iuor
   * @param num - The other BigNumber.
   * @returns Returns this BigNumber after performing the bitwise OR operation.
   *
   * @example
   * const BigNumber = require("./BigNumber");
   * const bn1 = new BigNumber('10'); // binary: 1010
   * const bn2 = new(num: BigNumber): BigNumber BigNumber('6'); // binary: 0110
   * bn1.iuor(bn2); // now, bn1 binary: 1110
   */
  iuor (num: BigNumber): BigNumber {
    while (this.length < num.length) {
      this.words[this.length++] = 0
    }

    for (let i = 0; i < num.length; i++) {
      this.words[i] = this.words[i] | num.words[i]
    }

    return this.strip()
  }

  /**
   * Performs a bitwise OR operation with another BigNumber, considering
   * that neither of the numbers can be negative. Stores the result in this BigNumber.
   * @method ior
   * @param num - The other BigNumber.
   * @returns Returns this BigNumber after performing the bitwise OR operation.
   *
   * @example
   * const BigNumber = require("./BigNumber");
   * const bn1 = new BigNumber('10'); // binary: 1010
   * const bn2 = new BigNumber('6'); // binary: 0110
   * bn1.ior(bn2); // now, bn1 binary: 1110
   */
  ior (num: BigNumber): BigNumber {
    this.assert((this.negative | num.negative) === 0)
    return this.iuor(num)
  }

  /**
   * Performs a bitwise OR operation on the current instance and given
   * BigNumber and returns a new BigNumber, in such a way that if either
   * the corresponding bit in the first operand or the second operand is
   * 1, then the output is also 1.
   *
   * @method or
   * @param num - The BigNumber to perform the bitwise OR operation with.
   * @returns Returns a new BigNumber resulting from the bitwise OR operation.
   *
   * @example
   * const num1 = new BigNumber('10');
   * const num2 = new BigNumber('20');
   * console.log(num1.or(num2).toString());
   */
  or (num: BigNumber): BigNumber {
    if (this.length > num.length) return this.clone().ior(num)
    return num.clone().ior(this)
  }

  /**
   * Performs a bitwise OR operation on the current instance and given
   * BigNumber without considering signed bit(no negative values) and returns a new BigNumber,
   * similar to the `or` method.
   *
   * @method uor
   * @param num - The BigNumber to perform the bitwise OR operation with.
   * @returns Returns a new BigNumber resulting from the bitwise OR operation without sign consideration.
   *
   * @example
   * const num1 = new BigNumber('10');
   * const num2 = new BigNumber('20');
   * console.log(num1.uor(num2).toString());
   */
  uor (num: BigNumber): BigNumber {
    if (this.length > num.length) return this.clone().iuor(num)
    return num.clone().iuor(this)
  }

  /**
   * Performs a bitwise AND operation in-place(this method changes the calling object)
   * on the current instance and given BigNumber such that it modifies the current
   * instance and keeps the bits set in the result only if the corresponding bit is set
   * in both operands.
   *
   * @method iuand
   * @param num - The BigNumber to perform the bitwise AND operation with.
   * @returns Returns the current BigNumber instance after performing the bitwise AND operation.
   *
   * @example
   * const num1 = new BigNumber('10');
   * const num2 = new BigNumber('20');
   * console.log(num1.iuand(num2).toString());
   */
  iuand (num: BigNumber): BigNumber {
    const minLength = Math.min(this.length, num.length)

    for (let i = 0; i < minLength; i++) {
      this.words[i] = this.words[i] & num.words[i]
    }

    this.length = minLength

    return this.strip()
  }

  /**
   * Performs an in-place operation that does a bitwise AND operation in-place,
   * on the current instance and given BigNumber such that it modifies the current
   * instance only if neither operand is negative. This method is similar to the iuand method but
   * checks for negative values before operation.
   *
   * @method iand
   * @param num - The BigNumber to perform the bitwise AND operation with.
   * @returns Returns the current BigNumber instance after performing the bitwise AND operation.
   *
   * @example
   * const num1 = new BigNumber('10');
   * const num2 = new BigNumber('20');
   * console.log(num1.iand(num2).toString());
   */
  iand (num: BigNumber): BigNumber {
    this.assert((this.negative | num.negative) === 0)
    return this.iuand(num)
  }

  /**
   * Performs a bitwise AND operation that returns a new BigNumber, and keeps the bits
   * set in the result only if the corresponding bit is set in both operands.
   *
   * @method and
   * @param num - The BigNumber to perform the bitwise AND operation with.
   * @returns Returns new BigNumber resulting from the bitwise AND operation.
   *
   * @example
   * const num1 = new BigNumber('10');
   * const num2 = new BigNumber('20');
   * console.log(num1.and(num2).toString());
   */
  and (num: BigNumber): BigNumber {
    if (this.length > num.length) return this.clone().iand(num)
    return num.clone().iand(this)
  }

  /**
   * Performs a bitwise AND operation without considering signed bit
   * (no negative values) which returns a new BigNumber, similar to the `and` method.
   *
   * @method uand
   * @param num - The BigNumber to perform the bitwise AND operation with.
   * @returns Returns new BigNumber resulting from the bitwise AND operation without sign consideration.
   *
   * @example
   * const num1 = new BigNumber('10');
   * const num2 = new BigNumber('20');
   * console.log(num1.uand(num2).toString());
   */
  uand (num: BigNumber): BigNumber {
    if (this.length > num.length) return this.clone().iuand(num)
    return num.clone().iuand(this)
  }

  /**
   * Modifies the current instance by performing a bitwise XOR operation
   * in-place with the provided BigNumber. It keeps the bits set in the result only if the
   * corresponding bits in the operands are different.
   *
   * @method iuxor
   * @param num - The BigNumber to perform the bitwise XOR operation with.
   * @returns Returns the current BigNumber instance after performing the bitwise XOR operation.
   *
   * @example
   * const num1 = new BigNumber('10');
   * const num2 = new BigNumber('20');
   * console.log(num1.iuxor(num2).toString());
   */
  iuxor (num: BigNumber): BigNumber {
    if (this.length > num.length) {
      for (let i = 0; i < num.length; i++) {
        this.words[i] = this.words[i] ^ num.words[i]
      }
    } else {
      for (let i = 0; i < this.length; i++) {
        this.words[i] = this.words[i] ^ num.words[i]
      }
      for (let i = this.length; i < num.length; i++) {
        this.words[i] = num.words[i]
      }
      this.length = num.length
    }
    return this.strip()
  }

  /**
   * Performs an in-place operation that does a bitwise XOR operation in-place,
   * on the current instance and given BigNumber such that it modifies the current
   * instance only if neither operand is negative. This method is similar to the iuxor method but
   * checks for negative values before operation.
   *
   * @method ixor
   * @param num - The BigNumber to perform the bitwise XOR operation with.
   * @returns Returns the current BigNumber instance after performing the bitwise XOR operation.
   *
   * @example
   * const num1 = new BigNumber('10');
   * const num2 = new BigNumber('20');
   * console.log(num1.ixor(num2).toString());
   */
  ixor (num: BigNumber): BigNumber {
    this.assert(
      (this.negative | num.negative) === 0,
      'Neither number can be negative'
    )
    return this.iuxor(num)
  }

  /**
   * Performs a bitwise XOR operation which returns a new BigNumber, and keeps the bits
   * set in the result only if the corresponding bits in the operands are different.
   *
   * @method xor
   * @param num - The BigNumber to perform the bitwise XOR operation with.
   * @returns Returns a new BigNumber resulting from the bitwise XOR operation.
   *
   * @example
   * const num1 = new BigNumber('10');
   * const num2 = new BigNumber('20');
   * console.log(num1.xor(num2).toString());
   */
  xor (num: BigNumber): BigNumber {
    if (this.length > num.length) return this.clone().ixor(num)
    return num.clone().ixor(this)
  }

  /**
   * Performs an unsigned XOR operation on this BigNumber with the supplied BigNumber. Returns a new BigNumber.
   *
   * @method uxor
   * @param num - The BigNumber with which the unsigned bitwise XOR operation is to be performed.
   * @returns Returns a new BigNumber resulting from the unsigned bitwise XOR operation.
   *
   * @example
   * const num1 = new BigNumber('30');
   * const num2 = new BigNumber('40');
   * console.log(num1.uxor(num2).toString()); // Output will be the result of unsigned XOR operation
   */
  uxor (num: BigNumber): BigNumber {
    if (this.length > num.length) return this.clone().iuxor(num)
    return num.clone().iuxor(this)
  }

  /**
   * In-place method that performs a bitwise NOT operation on a BigNumber up to a specified bit width.
   *
   * @method inotn
   * @param width - The number of bits to perform the NOT operation on.
   * @returns Returns the BigNumber after performing the bitwise NOT operation.
   *
   * @example
   * const num = new BigNumber('42');
   * num.inotn(10);
   * console.log(num.toString());
   */
  inotn (width: number): BigNumber {
    this.assert(
      typeof width === 'number' && width >= 0,
      'The width needs to be a number greater than zero'
    )

    let bytesNeeded = Math.ceil(width / 26) | 0
    const bitsLeft = width % 26

    // Extend the number with leading zeroes
    this.expand(bytesNeeded)

    if (bitsLeft > 0) {
      bytesNeeded--
    }

    // Handle complete words
    let i = 0
    for (; i < bytesNeeded; i++) {
      this.words[i] = ~this.words[i] & 0x3ffffff
    }

    // Handle the residue
    if (bitsLeft > 0) {
      this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft))
    }

    // And remove leading zeroes
    return this.strip()
  }

  /**
   * Performs a bitwise NOT operation on a BigNumber up to a specified bit width. Returns a new BigNumber.
   *
   * @method notn
   * @param width - The number of bits to perform the NOT operation on.
   * @returns Returns a new BigNumber resulting from the bitwise NOT operation.
   *
   * @example
   * const num = new BigNumber('42');
   * const notnResult = num.notn(10);
   * console.log(notnResult.toString());
   */
  notn (width: number): BigNumber {
    return this.clone().inotn(width)
  }

  /**
   * Set `bit` of `this` BigNumber. The `bit` is a position in the binary representation,
   * and `val` is the value to be set at that position (`0` or `1`).
   *
   * @method setn
   * @param bit - The bit position to set.
   * @param val - The value to set at the bit position.
   * @returns Returns the BigNumber after setting the value at the bit position.
   *
   * @example
   * const num = new BigNumber('42');
   * num.setn(2, 1);
   * console.log(num.toString());
   */
  setn (bit: number, val: 0 | 1 | true | false): BigNumber {
    this.assert(typeof bit === 'number' && bit >= 0)

    const off = (bit / 26) | 0
    const wbit = bit % 26

    this.expand(off + 1)

    if (val === 1 || val === true) {
      this.words[off] = this.words[off] | (1 << wbit)
    } else {
      this.words[off] = this.words[off] & ~(1 << wbit)
    }

    return this.strip()
  }

  /**
   * Add `num` to `this` BigNumber in-place.
   *
   * @method iadd
   * @param num - The BigNumber to add to `this` BigNumber.
   * @returns Returns the BigNumber after performing the addition.
   *
   * @example
   * const num1 = new BigNumber('10');
   * num1.iadd(new BigNumber('20'));
   * console.log(num1.toString());
   */
  iadd (num: BigNumber): BigNumber {
    let r

    // negative + positive
    if (this.negative !== 0 && num.negative === 0) {
      this.negative = 0
      r = this.isub(num)
      this.negative ^= 1
      return this.normSign()

    // positive + negative
    } else if (this.negative === 0 && num.negative !== 0) {
      num.negative = 0
      r = this.isub(num)
      num.negative = 1
      return r.normSign()
    }

    // a.length > b.length
    let a, b
    if (this.length > num.length) {
      /* eslint-disable @typescript-eslint/no-this-alias */
      a = this
      b = num
    } else {
      a = num
      /* eslint-disable @typescript-eslint/no-this-alias */
      b = this
    }

    let carry = 0
    let i = 0
    for (; i < b.length; i++) {
      r = (a.words[i] | 0) + (b.words[i] | 0) + carry
      this.words[i] = r & 0x3ffffff
      carry = r >>> 26
    }
    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry
      this.words[i] = r & 0x3ffffff
      carry = r >>> 26
    }

    this.length = a.length
    if (carry !== 0) {
      this.words[this.length] = carry
      this.length++
    // Copy the rest of the words
    } else if (a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i]
      }
    }

    return this
  }

  /**
   * Add `num` to `this` BigNumber.
   *
   * @method add
   * @param num - The BigNumber to add to `this` BigNumber.
   * @returns Returns a new BigNumber which is the result of the addition.
   *
   * @example
   * const num1 = new BigNumber('10');
   * const addResult = num1.add(new BigNumber('20'));
   * console.log(addResult.toString());
   */
  add (num: BigNumber): BigNumber {
    let res
    if (num.negative !== 0 && this.negative === 0) {
      num.negative = 0
      res = this.sub(num)
      num.negative ^= 1
      return res
    } else if (num.negative === 0 && this.negative !== 0) {
      this.negative = 0
      res = num.sub(this)
      this.negative = 1
      return res
    }

    if (this.length > num.length) return this.clone().iadd(num)

    return num.clone().iadd(this)
  }

  /**
   * Subtract `num` from `this` BigNumber in-place.
   *
   * @method isub
   * @param num - The BigNumber to be subtracted from `this` BigNumber.
   * @returns Returns the BigNumber after performing the subtraction.
   *
   * @example
   * const num1 = new BigNumber('20');
   * num1.isub(new BigNumber('10'));
   * console.log(num1.toString());
   */
  isub (num: BigNumber): BigNumber {
    let r: BigNumber | number
    // this - (-num) = this + num
    if (num.negative !== 0) {
      num.negative = 0
      r = this.iadd(num)
      num.negative = 1
      return r.normSign()

    // -this - num = -(this + num)
    } else if (this.negative !== 0) {
      this.negative = 0
      this.iadd(num)
      this.negative = 1
      return this.normSign()
    }

    // At this point both numbers are positive
    const cmp = this.cmp(num)

    // Optimization - zeroify
    if (cmp === 0) {
      this.negative = 0
      this.length = 1
      this.words[0] = 0
      return this
    }

    // a > b
    let a, b
    if (cmp > 0) {
      /* eslint-disable @typescript-eslint/no-this-alias */
      a = this
      b = num
    } else {
      a = num
      /* eslint-disable @typescript-eslint/no-this-alias */
      b = this
    }

    let carry = 0
    let i = 0
    for (; i < b.length; i++) {
      r = (a.words[i] | 0) - (b.words[i] | 0) + carry
      carry = r >> 26
      this.words[i] = r & 0x3ffffff
    }
    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry
      carry = r >> 26
      this.words[i] = r & 0x3ffffff
    }

    // Copy rest of the words
    if (carry === 0 && i < a.length && a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i]
      }
    }

    this.length = Math.max(this.length, i)

    if (a !== this) {
      this.negative = 1
    }

    return this.strip()
  }

  /**
   * Subtract `num` from `this` BigNumber.
   *
   * @method sub
   * @param num - The BigNumber to be subtracted from `this` BigNumber.
   * @returns Returns a new BigNumber which is the result of the subtraction.
   *
   * @example
   * const num1 = new BigNumber('20');
   * const subResult = num1.sub(new BigNumber('10'));
   * console.log(subResult.toString());
   */
  sub (num: BigNumber): BigNumber {
    return this.clone().isub(num)
  }

  private smallMulTo (
    self: BigNumber, num: BigNumber, out: BigNumber
  ): BigNumber {
    out.negative = num.negative ^ self.negative
    let len = (self.length + num.length) | 0
    out.length = len
    len = (len - 1) | 0

    // Peel one iteration (compiler can't do it, because of code complexity)
    let a = self.words[0] | 0
    let b = num.words[0] | 0
    let r = a * b

    const lo = r & 0x3ffffff
    let carry = (r / 0x4000000) | 0
    out.words[0] = lo

    let k = 1
    for (; k < len; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      let ncarry = carry >>> 26
      let rword = carry & 0x3ffffff
      const maxJ = Math.min(k, num.length - 1)
      for (let j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        const i = (k - j) | 0
        a = self.words[i] | 0
        b = num.words[j] | 0
        r = a * b + rword
        ncarry += (r / 0x4000000) | 0
        rword = r & 0x3ffffff
      }
      out.words[k] = rword | 0
      carry = ncarry | 0
    }
    if (carry !== 0) {
      out.words[k] = carry | 0
    } else {
      out.length--
    }

    return out.strip()
  }

  comb10MulTo (self: BigNumber, num: BigNumber, out: BigNumber): BigNumber {
    const a = self.words
    const b = num.words
    const o = out.words
    let c: number = 0
    let lo: number
    let mid: number
    let hi: number
    const a0 = a[0] | 0
    const al0 = a0 & 0x1fff
    const ah0 = a0 >>> 13
    const a1 = a[1] | 0
    const al1 = a1 & 0x1fff
    const ah1 = a1 >>> 13
    const a2 = a[2] | 0
    const al2 = a2 & 0x1fff
    const ah2 = a2 >>> 13
    const a3 = a[3] | 0
    const al3 = a3 & 0x1fff
    const ah3 = a3 >>> 13
    const a4 = a[4] | 0
    const al4 = a4 & 0x1fff
    const ah4 = a4 >>> 13
    const a5 = a[5] | 0
    const al5 = a5 & 0x1fff
    const ah5 = a5 >>> 13
    const a6 = a[6] | 0
    const al6 = a6 & 0x1fff
    const ah6 = a6 >>> 13
    const a7 = a[7] | 0
    const al7 = a7 & 0x1fff
    const ah7 = a7 >>> 13
    const a8 = a[8] | 0
    const al8 = a8 & 0x1fff
    const ah8 = a8 >>> 13
    const a9 = a[9] | 0
    const al9 = a9 & 0x1fff
    const ah9 = a9 >>> 13
    const b0 = b[0] | 0
    const bl0 = b0 & 0x1fff
    const bh0 = b0 >>> 13
    const b1 = b[1] | 0
    const bl1 = b1 & 0x1fff
    const bh1 = b1 >>> 13
    const b2 = b[2] | 0
    const bl2 = b2 & 0x1fff
    const bh2 = b2 >>> 13
    const b3 = b[3] | 0
    const bl3 = b3 & 0x1fff
    const bh3 = b3 >>> 13
    const b4 = b[4] | 0
    const bl4 = b4 & 0x1fff
    const bh4 = b4 >>> 13
    const b5 = b[5] | 0
    const bl5 = b5 & 0x1fff
    const bh5 = b5 >>> 13
    const b6 = b[6] | 0
    const bl6 = b6 & 0x1fff
    const bh6 = b6 >>> 13
    const b7 = b[7] | 0
    const bl7 = b7 & 0x1fff
    const bh7 = b7 >>> 13
    const b8 = b[8] | 0
    const bl8 = b8 & 0x1fff
    const bh8 = b8 >>> 13
    const b9 = b[9] | 0
    const bl9 = b9 & 0x1fff
    const bh9 = b9 >>> 13

    out.negative = self.negative ^ num.negative
    out.length = 19
    /* k = 0 */
    lo = Math.imul(al0, bl0)
    mid = Math.imul(al0, bh0)
    mid = (mid + Math.imul(ah0, bl0)) | 0
    hi = Math.imul(ah0, bh0)
    let w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0
    w0 &= 0x3ffffff
    /* k = 1 */
    lo = Math.imul(al1, bl0)
    mid = Math.imul(al1, bh0)
    mid = (mid + Math.imul(ah1, bl0)) | 0
    hi = Math.imul(ah1, bh0)
    lo = (lo + Math.imul(al0, bl1)) | 0
    mid = (mid + Math.imul(al0, bh1)) | 0
    mid = (mid + Math.imul(ah0, bl1)) | 0
    hi = (hi + Math.imul(ah0, bh1)) | 0
    let w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0
    w1 &= 0x3ffffff
    /* k = 2 */
    lo = Math.imul(al2, bl0)
    mid = Math.imul(al2, bh0)
    mid = (mid + Math.imul(ah2, bl0)) | 0
    hi = Math.imul(ah2, bh0)
    lo = (lo + Math.imul(al1, bl1)) | 0
    mid = (mid + Math.imul(al1, bh1)) | 0
    mid = (mid + Math.imul(ah1, bl1)) | 0
    hi = (hi + Math.imul(ah1, bh1)) | 0
    lo = (lo + Math.imul(al0, bl2)) | 0
    mid = (mid + Math.imul(al0, bh2)) | 0
    mid = (mid + Math.imul(ah0, bl2)) | 0
    hi = (hi + Math.imul(ah0, bh2)) | 0
    let w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0
    w2 &= 0x3ffffff
    /* k = 3 */
    lo = Math.imul(al3, bl0)
    mid = Math.imul(al3, bh0)
    mid = (mid + Math.imul(ah3, bl0)) | 0
    hi = Math.imul(ah3, bh0)
    lo = (lo + Math.imul(al2, bl1)) | 0
    mid = (mid + Math.imul(al2, bh1)) | 0
    mid = (mid + Math.imul(ah2, bl1)) | 0
    hi = (hi + Math.imul(ah2, bh1)) | 0
    lo = (lo + Math.imul(al1, bl2)) | 0
    mid = (mid + Math.imul(al1, bh2)) | 0
    mid = (mid + Math.imul(ah1, bl2)) | 0
    hi = (hi + Math.imul(ah1, bh2)) | 0
    lo = (lo + Math.imul(al0, bl3)) | 0
    mid = (mid + Math.imul(al0, bh3)) | 0
    mid = (mid + Math.imul(ah0, bl3)) | 0
    hi = (hi + Math.imul(ah0, bh3)) | 0
    let w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0
    w3 &= 0x3ffffff
    /* k = 4 */
    lo = Math.imul(al4, bl0)
    mid = Math.imul(al4, bh0)
    mid = (mid + Math.imul(ah4, bl0)) | 0
    hi = Math.imul(ah4, bh0)
    lo = (lo + Math.imul(al3, bl1)) | 0
    mid = (mid + Math.imul(al3, bh1)) | 0
    mid = (mid + Math.imul(ah3, bl1)) | 0
    hi = (hi + Math.imul(ah3, bh1)) | 0
    lo = (lo + Math.imul(al2, bl2)) | 0
    mid = (mid + Math.imul(al2, bh2)) | 0
    mid = (mid + Math.imul(ah2, bl2)) | 0
    hi = (hi + Math.imul(ah2, bh2)) | 0
    lo = (lo + Math.imul(al1, bl3)) | 0
    mid = (mid + Math.imul(al1, bh3)) | 0
    mid = (mid + Math.imul(ah1, bl3)) | 0
    hi = (hi + Math.imul(ah1, bh3)) | 0
    lo = (lo + Math.imul(al0, bl4)) | 0
    mid = (mid + Math.imul(al0, bh4)) | 0
    mid = (mid + Math.imul(ah0, bl4)) | 0
    hi = (hi + Math.imul(ah0, bh4)) | 0
    let w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0
    w4 &= 0x3ffffff
    /* k = 5 */
    lo = Math.imul(al5, bl0)
    mid = Math.imul(al5, bh0)
    mid = (mid + Math.imul(ah5, bl0)) | 0
    hi = Math.imul(ah5, bh0)
    lo = (lo + Math.imul(al4, bl1)) | 0
    mid = (mid + Math.imul(al4, bh1)) | 0
    mid = (mid + Math.imul(ah4, bl1)) | 0
    hi = (hi + Math.imul(ah4, bh1)) | 0
    lo = (lo + Math.imul(al3, bl2)) | 0
    mid = (mid + Math.imul(al3, bh2)) | 0
    mid = (mid + Math.imul(ah3, bl2)) | 0
    hi = (hi + Math.imul(ah3, bh2)) | 0
    lo = (lo + Math.imul(al2, bl3)) | 0
    mid = (mid + Math.imul(al2, bh3)) | 0
    mid = (mid + Math.imul(ah2, bl3)) | 0
    hi = (hi + Math.imul(ah2, bh3)) | 0
    lo = (lo + Math.imul(al1, bl4)) | 0
    mid = (mid + Math.imul(al1, bh4)) | 0
    mid = (mid + Math.imul(ah1, bl4)) | 0
    hi = (hi + Math.imul(ah1, bh4)) | 0
    lo = (lo + Math.imul(al0, bl5)) | 0
    mid = (mid + Math.imul(al0, bh5)) | 0
    mid = (mid + Math.imul(ah0, bl5)) | 0
    hi = (hi + Math.imul(ah0, bh5)) | 0
    let w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0
    w5 &= 0x3ffffff
    /* k = 6 */
    lo = Math.imul(al6, bl0)
    mid = Math.imul(al6, bh0)
    mid = (mid + Math.imul(ah6, bl0)) | 0
    hi = Math.imul(ah6, bh0)
    lo = (lo + Math.imul(al5, bl1)) | 0
    mid = (mid + Math.imul(al5, bh1)) | 0
    mid = (mid + Math.imul(ah5, bl1)) | 0
    hi = (hi + Math.imul(ah5, bh1)) | 0
    lo = (lo + Math.imul(al4, bl2)) | 0
    mid = (mid + Math.imul(al4, bh2)) | 0
    mid = (mid + Math.imul(ah4, bl2)) | 0
    hi = (hi + Math.imul(ah4, bh2)) | 0
    lo = (lo + Math.imul(al3, bl3)) | 0
    mid = (mid + Math.imul(al3, bh3)) | 0
    mid = (mid + Math.imul(ah3, bl3)) | 0
    hi = (hi + Math.imul(ah3, bh3)) | 0
    lo = (lo + Math.imul(al2, bl4)) | 0
    mid = (mid + Math.imul(al2, bh4)) | 0
    mid = (mid + Math.imul(ah2, bl4)) | 0
    hi = (hi + Math.imul(ah2, bh4)) | 0
    lo = (lo + Math.imul(al1, bl5)) | 0
    mid = (mid + Math.imul(al1, bh5)) | 0
    mid = (mid + Math.imul(ah1, bl5)) | 0
    hi = (hi + Math.imul(ah1, bh5)) | 0
    lo = (lo + Math.imul(al0, bl6)) | 0
    mid = (mid + Math.imul(al0, bh6)) | 0
    mid = (mid + Math.imul(ah0, bl6)) | 0
    hi = (hi + Math.imul(ah0, bh6)) | 0
    let w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0
    w6 &= 0x3ffffff
    /* k = 7 */
    lo = Math.imul(al7, bl0)
    mid = Math.imul(al7, bh0)
    mid = (mid + Math.imul(ah7, bl0)) | 0
    hi = Math.imul(ah7, bh0)
    lo = (lo + Math.imul(al6, bl1)) | 0
    mid = (mid + Math.imul(al6, bh1)) | 0
    mid = (mid + Math.imul(ah6, bl1)) | 0
    hi = (hi + Math.imul(ah6, bh1)) | 0
    lo = (lo + Math.imul(al5, bl2)) | 0
    mid = (mid + Math.imul(al5, bh2)) | 0
    mid = (mid + Math.imul(ah5, bl2)) | 0
    hi = (hi + Math.imul(ah5, bh2)) | 0
    lo = (lo + Math.imul(al4, bl3)) | 0
    mid = (mid + Math.imul(al4, bh3)) | 0
    mid = (mid + Math.imul(ah4, bl3)) | 0
    hi = (hi + Math.imul(ah4, bh3)) | 0
    lo = (lo + Math.imul(al3, bl4)) | 0
    mid = (mid + Math.imul(al3, bh4)) | 0
    mid = (mid + Math.imul(ah3, bl4)) | 0
    hi = (hi + Math.imul(ah3, bh4)) | 0
    lo = (lo + Math.imul(al2, bl5)) | 0
    mid = (mid + Math.imul(al2, bh5)) | 0
    mid = (mid + Math.imul(ah2, bl5)) | 0
    hi = (hi + Math.imul(ah2, bh5)) | 0
    lo = (lo + Math.imul(al1, bl6)) | 0
    mid = (mid + Math.imul(al1, bh6)) | 0
    mid = (mid + Math.imul(ah1, bl6)) | 0
    hi = (hi + Math.imul(ah1, bh6)) | 0
    lo = (lo + Math.imul(al0, bl7)) | 0
    mid = (mid + Math.imul(al0, bh7)) | 0
    mid = (mid + Math.imul(ah0, bl7)) | 0
    hi = (hi + Math.imul(ah0, bh7)) | 0
    let w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0
    w7 &= 0x3ffffff
    /* k = 8 */
    lo = Math.imul(al8, bl0)
    mid = Math.imul(al8, bh0)
    mid = (mid + Math.imul(ah8, bl0)) | 0
    hi = Math.imul(ah8, bh0)
    lo = (lo + Math.imul(al7, bl1)) | 0
    mid = (mid + Math.imul(al7, bh1)) | 0
    mid = (mid + Math.imul(ah7, bl1)) | 0
    hi = (hi + Math.imul(ah7, bh1)) | 0
    lo = (lo + Math.imul(al6, bl2)) | 0
    mid = (mid + Math.imul(al6, bh2)) | 0
    mid = (mid + Math.imul(ah6, bl2)) | 0
    hi = (hi + Math.imul(ah6, bh2)) | 0
    lo = (lo + Math.imul(al5, bl3)) | 0
    mid = (mid + Math.imul(al5, bh3)) | 0
    mid = (mid + Math.imul(ah5, bl3)) | 0
    hi = (hi + Math.imul(ah5, bh3)) | 0
    lo = (lo + Math.imul(al4, bl4)) | 0
    mid = (mid + Math.imul(al4, bh4)) | 0
    mid = (mid + Math.imul(ah4, bl4)) | 0
    hi = (hi + Math.imul(ah4, bh4)) | 0
    lo = (lo + Math.imul(al3, bl5)) | 0
    mid = (mid + Math.imul(al3, bh5)) | 0
    mid = (mid + Math.imul(ah3, bl5)) | 0
    hi = (hi + Math.imul(ah3, bh5)) | 0
    lo = (lo + Math.imul(al2, bl6)) | 0
    mid = (mid + Math.imul(al2, bh6)) | 0
    mid = (mid + Math.imul(ah2, bl6)) | 0
    hi = (hi + Math.imul(ah2, bh6)) | 0
    lo = (lo + Math.imul(al1, bl7)) | 0
    mid = (mid + Math.imul(al1, bh7)) | 0
    mid = (mid + Math.imul(ah1, bl7)) | 0
    hi = (hi + Math.imul(ah1, bh7)) | 0
    lo = (lo + Math.imul(al0, bl8)) | 0
    mid = (mid + Math.imul(al0, bh8)) | 0
    mid = (mid + Math.imul(ah0, bl8)) | 0
    hi = (hi + Math.imul(ah0, bh8)) | 0
    let w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0
    w8 &= 0x3ffffff
    /* k = 9 */
    lo = Math.imul(al9, bl0)
    mid = Math.imul(al9, bh0)
    mid = (mid + Math.imul(ah9, bl0)) | 0
    hi = Math.imul(ah9, bh0)
    lo = (lo + Math.imul(al8, bl1)) | 0
    mid = (mid + Math.imul(al8, bh1)) | 0
    mid = (mid + Math.imul(ah8, bl1)) | 0
    hi = (hi + Math.imul(ah8, bh1)) | 0
    lo = (lo + Math.imul(al7, bl2)) | 0
    mid = (mid + Math.imul(al7, bh2)) | 0
    mid = (mid + Math.imul(ah7, bl2)) | 0
    hi = (hi + Math.imul(ah7, bh2)) | 0
    lo = (lo + Math.imul(al6, bl3)) | 0
    mid = (mid + Math.imul(al6, bh3)) | 0
    mid = (mid + Math.imul(ah6, bl3)) | 0
    hi = (hi + Math.imul(ah6, bh3)) | 0
    lo = (lo + Math.imul(al5, bl4)) | 0
    mid = (mid + Math.imul(al5, bh4)) | 0
    mid = (mid + Math.imul(ah5, bl4)) | 0
    hi = (hi + Math.imul(ah5, bh4)) | 0
    lo = (lo + Math.imul(al4, bl5)) | 0
    mid = (mid + Math.imul(al4, bh5)) | 0
    mid = (mid + Math.imul(ah4, bl5)) | 0
    hi = (hi + Math.imul(ah4, bh5)) | 0
    lo = (lo + Math.imul(al3, bl6)) | 0
    mid = (mid + Math.imul(al3, bh6)) | 0
    mid = (mid + Math.imul(ah3, bl6)) | 0
    hi = (hi + Math.imul(ah3, bh6)) | 0
    lo = (lo + Math.imul(al2, bl7)) | 0
    mid = (mid + Math.imul(al2, bh7)) | 0
    mid = (mid + Math.imul(ah2, bl7)) | 0
    hi = (hi + Math.imul(ah2, bh7)) | 0
    lo = (lo + Math.imul(al1, bl8)) | 0
    mid = (mid + Math.imul(al1, bh8)) | 0
    mid = (mid + Math.imul(ah1, bl8)) | 0
    hi = (hi + Math.imul(ah1, bh8)) | 0
    lo = (lo + Math.imul(al0, bl9)) | 0
    mid = (mid + Math.imul(al0, bh9)) | 0
    mid = (mid + Math.imul(ah0, bl9)) | 0
    hi = (hi + Math.imul(ah0, bh9)) | 0
    let w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0
    w9 &= 0x3ffffff
    /* k = 10 */
    lo = Math.imul(al9, bl1)
    mid = Math.imul(al9, bh1)
    mid = (mid + Math.imul(ah9, bl1)) | 0
    hi = Math.imul(ah9, bh1)
    lo = (lo + Math.imul(al8, bl2)) | 0
    mid = (mid + Math.imul(al8, bh2)) | 0
    mid = (mid + Math.imul(ah8, bl2)) | 0
    hi = (hi + Math.imul(ah8, bh2)) | 0
    lo = (lo + Math.imul(al7, bl3)) | 0
    mid = (mid + Math.imul(al7, bh3)) | 0
    mid = (mid + Math.imul(ah7, bl3)) | 0
    hi = (hi + Math.imul(ah7, bh3)) | 0
    lo = (lo + Math.imul(al6, bl4)) | 0
    mid = (mid + Math.imul(al6, bh4)) | 0
    mid = (mid + Math.imul(ah6, bl4)) | 0
    hi = (hi + Math.imul(ah6, bh4)) | 0
    lo = (lo + Math.imul(al5, bl5)) | 0
    mid = (mid + Math.imul(al5, bh5)) | 0
    mid = (mid + Math.imul(ah5, bl5)) | 0
    hi = (hi + Math.imul(ah5, bh5)) | 0
    lo = (lo + Math.imul(al4, bl6)) | 0
    mid = (mid + Math.imul(al4, bh6)) | 0
    mid = (mid + Math.imul(ah4, bl6)) | 0
    hi = (hi + Math.imul(ah4, bh6)) | 0
    lo = (lo + Math.imul(al3, bl7)) | 0
    mid = (mid + Math.imul(al3, bh7)) | 0
    mid = (mid + Math.imul(ah3, bl7)) | 0
    hi = (hi + Math.imul(ah3, bh7)) | 0
    lo = (lo + Math.imul(al2, bl8)) | 0
    mid = (mid + Math.imul(al2, bh8)) | 0
    mid = (mid + Math.imul(ah2, bl8)) | 0
    hi = (hi + Math.imul(ah2, bh8)) | 0
    lo = (lo + Math.imul(al1, bl9)) | 0
    mid = (mid + Math.imul(al1, bh9)) | 0
    mid = (mid + Math.imul(ah1, bl9)) | 0
    hi = (hi + Math.imul(ah1, bh9)) | 0
    let w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0
    w10 &= 0x3ffffff
    /* k = 11 */
    lo = Math.imul(al9, bl2)
    mid = Math.imul(al9, bh2)
    mid = (mid + Math.imul(ah9, bl2)) | 0
    hi = Math.imul(ah9, bh2)
    lo = (lo + Math.imul(al8, bl3)) | 0
    mid = (mid + Math.imul(al8, bh3)) | 0
    mid = (mid + Math.imul(ah8, bl3)) | 0
    hi = (hi + Math.imul(ah8, bh3)) | 0
    lo = (lo + Math.imul(al7, bl4)) | 0
    mid = (mid + Math.imul(al7, bh4)) | 0
    mid = (mid + Math.imul(ah7, bl4)) | 0
    hi = (hi + Math.imul(ah7, bh4)) | 0
    lo = (lo + Math.imul(al6, bl5)) | 0
    mid = (mid + Math.imul(al6, bh5)) | 0
    mid = (mid + Math.imul(ah6, bl5)) | 0
    hi = (hi + Math.imul(ah6, bh5)) | 0
    lo = (lo + Math.imul(al5, bl6)) | 0
    mid = (mid + Math.imul(al5, bh6)) | 0
    mid = (mid + Math.imul(ah5, bl6)) | 0
    hi = (hi + Math.imul(ah5, bh6)) | 0
    lo = (lo + Math.imul(al4, bl7)) | 0
    mid = (mid + Math.imul(al4, bh7)) | 0
    mid = (mid + Math.imul(ah4, bl7)) | 0
    hi = (hi + Math.imul(ah4, bh7)) | 0
    lo = (lo + Math.imul(al3, bl8)) | 0
    mid = (mid + Math.imul(al3, bh8)) | 0
    mid = (mid + Math.imul(ah3, bl8)) | 0
    hi = (hi + Math.imul(ah3, bh8)) | 0
    lo = (lo + Math.imul(al2, bl9)) | 0
    mid = (mid + Math.imul(al2, bh9)) | 0
    mid = (mid + Math.imul(ah2, bl9)) | 0
    hi = (hi + Math.imul(ah2, bh9)) | 0
    let w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0
    w11 &= 0x3ffffff
    /* k = 12 */
    lo = Math.imul(al9, bl3)
    mid = Math.imul(al9, bh3)
    mid = (mid + Math.imul(ah9, bl3)) | 0
    hi = Math.imul(ah9, bh3)
    lo = (lo + Math.imul(al8, bl4)) | 0
    mid = (mid + Math.imul(al8, bh4)) | 0
    mid = (mid + Math.imul(ah8, bl4)) | 0
    hi = (hi + Math.imul(ah8, bh4)) | 0
    lo = (lo + Math.imul(al7, bl5)) | 0
    mid = (mid + Math.imul(al7, bh5)) | 0
    mid = (mid + Math.imul(ah7, bl5)) | 0
    hi = (hi + Math.imul(ah7, bh5)) | 0
    lo = (lo + Math.imul(al6, bl6)) | 0
    mid = (mid + Math.imul(al6, bh6)) | 0
    mid = (mid + Math.imul(ah6, bl6)) | 0
    hi = (hi + Math.imul(ah6, bh6)) | 0
    lo = (lo + Math.imul(al5, bl7)) | 0
    mid = (mid + Math.imul(al5, bh7)) | 0
    mid = (mid + Math.imul(ah5, bl7)) | 0
    hi = (hi + Math.imul(ah5, bh7)) | 0
    lo = (lo + Math.imul(al4, bl8)) | 0
    mid = (mid + Math.imul(al4, bh8)) | 0
    mid = (mid + Math.imul(ah4, bl8)) | 0
    hi = (hi + Math.imul(ah4, bh8)) | 0
    lo = (lo + Math.imul(al3, bl9)) | 0
    mid = (mid + Math.imul(al3, bh9)) | 0
    mid = (mid + Math.imul(ah3, bl9)) | 0
    hi = (hi + Math.imul(ah3, bh9)) | 0
    let w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0
    w12 &= 0x3ffffff
    /* k = 13 */
    lo = Math.imul(al9, bl4)
    mid = Math.imul(al9, bh4)
    mid = (mid + Math.imul(ah9, bl4)) | 0
    hi = Math.imul(ah9, bh4)
    lo = (lo + Math.imul(al8, bl5)) | 0
    mid = (mid + Math.imul(al8, bh5)) | 0
    mid = (mid + Math.imul(ah8, bl5)) | 0
    hi = (hi + Math.imul(ah8, bh5)) | 0
    lo = (lo + Math.imul(al7, bl6)) | 0
    mid = (mid + Math.imul(al7, bh6)) | 0
    mid = (mid + Math.imul(ah7, bl6)) | 0
    hi = (hi + Math.imul(ah7, bh6)) | 0
    lo = (lo + Math.imul(al6, bl7)) | 0
    mid = (mid + Math.imul(al6, bh7)) | 0
    mid = (mid + Math.imul(ah6, bl7)) | 0
    hi = (hi + Math.imul(ah6, bh7)) | 0
    lo = (lo + Math.imul(al5, bl8)) | 0
    mid = (mid + Math.imul(al5, bh8)) | 0
    mid = (mid + Math.imul(ah5, bl8)) | 0
    hi = (hi + Math.imul(ah5, bh8)) | 0
    lo = (lo + Math.imul(al4, bl9)) | 0
    mid = (mid + Math.imul(al4, bh9)) | 0
    mid = (mid + Math.imul(ah4, bl9)) | 0
    hi = (hi + Math.imul(ah4, bh9)) | 0
    let w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0
    w13 &= 0x3ffffff
    /* k = 14 */
    lo = Math.imul(al9, bl5)
    mid = Math.imul(al9, bh5)
    mid = (mid + Math.imul(ah9, bl5)) | 0
    hi = Math.imul(ah9, bh5)
    lo = (lo + Math.imul(al8, bl6)) | 0
    mid = (mid + Math.imul(al8, bh6)) | 0
    mid = (mid + Math.imul(ah8, bl6)) | 0
    hi = (hi + Math.imul(ah8, bh6)) | 0
    lo = (lo + Math.imul(al7, bl7)) | 0
    mid = (mid + Math.imul(al7, bh7)) | 0
    mid = (mid + Math.imul(ah7, bl7)) | 0
    hi = (hi + Math.imul(ah7, bh7)) | 0
    lo = (lo + Math.imul(al6, bl8)) | 0
    mid = (mid + Math.imul(al6, bh8)) | 0
    mid = (mid + Math.imul(ah6, bl8)) | 0
    hi = (hi + Math.imul(ah6, bh8)) | 0
    lo = (lo + Math.imul(al5, bl9)) | 0
    mid = (mid + Math.imul(al5, bh9)) | 0
    mid = (mid + Math.imul(ah5, bl9)) | 0
    hi = (hi + Math.imul(ah5, bh9)) | 0
    let w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0
    w14 &= 0x3ffffff
    /* k = 15 */
    lo = Math.imul(al9, bl6)
    mid = Math.imul(al9, bh6)
    mid = (mid + Math.imul(ah9, bl6)) | 0
    hi = Math.imul(ah9, bh6)
    lo = (lo + Math.imul(al8, bl7)) | 0
    mid = (mid + Math.imul(al8, bh7)) | 0
    mid = (mid + Math.imul(ah8, bl7)) | 0
    hi = (hi + Math.imul(ah8, bh7)) | 0
    lo = (lo + Math.imul(al7, bl8)) | 0
    mid = (mid + Math.imul(al7, bh8)) | 0
    mid = (mid + Math.imul(ah7, bl8)) | 0
    hi = (hi + Math.imul(ah7, bh8)) | 0
    lo = (lo + Math.imul(al6, bl9)) | 0
    mid = (mid + Math.imul(al6, bh9)) | 0
    mid = (mid + Math.imul(ah6, bl9)) | 0
    hi = (hi + Math.imul(ah6, bh9)) | 0
    let w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0
    w15 &= 0x3ffffff
    /* k = 16 */
    lo = Math.imul(al9, bl7)
    mid = Math.imul(al9, bh7)
    mid = (mid + Math.imul(ah9, bl7)) | 0
    hi = Math.imul(ah9, bh7)
    lo = (lo + Math.imul(al8, bl8)) | 0
    mid = (mid + Math.imul(al8, bh8)) | 0
    mid = (mid + Math.imul(ah8, bl8)) | 0
    hi = (hi + Math.imul(ah8, bh8)) | 0
    lo = (lo + Math.imul(al7, bl9)) | 0
    mid = (mid + Math.imul(al7, bh9)) | 0
    mid = (mid + Math.imul(ah7, bl9)) | 0
    hi = (hi + Math.imul(ah7, bh9)) | 0
    let w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0
    w16 &= 0x3ffffff
    /* k = 17 */
    lo = Math.imul(al9, bl8)
    mid = Math.imul(al9, bh8)
    mid = (mid + Math.imul(ah9, bl8)) | 0
    hi = Math.imul(ah9, bh8)
    lo = (lo + Math.imul(al8, bl9)) | 0
    mid = (mid + Math.imul(al8, bh9)) | 0
    mid = (mid + Math.imul(ah8, bl9)) | 0
    hi = (hi + Math.imul(ah8, bh9)) | 0
    let w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0
    w17 &= 0x3ffffff
    /* k = 18 */
    lo = Math.imul(al9, bl9)
    mid = Math.imul(al9, bh9)
    mid = (mid + Math.imul(ah9, bl9)) | 0
    hi = Math.imul(ah9, bh9)
    let w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0
    c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0
    w18 &= 0x3ffffff
    o[0] = w0
    o[1] = w1
    o[2] = w2
    o[3] = w3
    o[4] = w4
    o[5] = w5
    o[6] = w6
    o[7] = w7
    o[8] = w8
    o[9] = w9
    o[10] = w10
    o[11] = w11
    o[12] = w12
    o[13] = w13
    o[14] = w14
    o[15] = w15
    o[16] = w16
    o[17] = w17
    o[18] = w18
    if (c !== 0) {
      o[19] = c
      out.length++
    }
    return out
  }

  private bigMulTo (self: BigNumber, num: BigNumber, out: BigNumber): BigNumber {
    out.negative = num.negative ^ self.negative
    out.length = self.length + num.length

    let carry = 0
    let hncarry = 0
    let k = 0
    for (; k < out.length - 1; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      let ncarry = hncarry
      hncarry = 0
      let rword = carry & 0x3ffffff
      const maxJ = Math.min(k, num.length - 1)
      for (let j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        const i = k - j
        const a = self.words[i] | 0
        const b = num.words[j] | 0
        const r = a * b

        let lo = r & 0x3ffffff
        ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0
        lo = (lo + rword) | 0
        rword = lo & 0x3ffffff
        ncarry = (ncarry + (lo >>> 26)) | 0

        hncarry += ncarry >>> 26
        ncarry &= 0x3ffffff
      }
      out.words[k] = rword
      carry = ncarry
      ncarry = hncarry
    }
    if (carry !== 0) {
      out.words[k] = carry
    } else {
      out.length--
    }

    return out.strip()
  }

  /**
   * Performs multiplication between the BigNumber instance and a given BigNumber.
   * It chooses the multiplication method based on the lengths of the numbers to optimize execution time.
   *
   * @method mulTo
   * @param num - The BigNumber multiply with.
   * @param out - The BigNumber where to store the result.
   * @returns The BigNumber resulting from the multiplication operation.
   *
   * @example
   * const bn1 = new BigNumber('12345');
   * const bn2 = new BigNumber('23456');
   * const output = new BigNumber();
   * bn1.mulTo(bn2, output);
   */
  mulTo (num: BigNumber, out: BigNumber): BigNumber {
    let res
    const len = this.length + num.length
    if (this.length === 10 && num.length === 10) {
      res = this.comb10MulTo(this, num, out)
    } else if (len < 63) {
      res = this.smallMulTo(this, num, out)
    } else {
      res = this.bigMulTo(this, num, out)
    }

    return res
  }

  /**
   * Performs multiplication between the BigNumber instance and a given BigNumber.
   * It creates a new BigNumber to store the result.
   *
   * @method mul
   * @param num - The BigNumber to multiply with.
   * @returns The BigNumber resulting from the multiplication operation.
   *
   * @example
   * const bn1 = new BigNumber('12345');
   * const bn2 = new BigNumber('23456');
   * const result = bn1.mul(bn2);
   */
  mul (num: BigNumber): BigNumber {
    const out = new BigNumber()
    out.words = new Array(this.length + num.length)
    return this.mulTo(num, out)
  }

  /**
   * Performs an in-place multiplication of the BigNumber instance by a given BigNumber.
   *
   * @method imul
   * @param num - The BigNumber to multiply with.
   * @returns The BigNumber itself after the multiplication.
   *
   * @example
   * const bn1 = new BigNumber('12345');
   * const bn2 = new BigNumber('23456');
   * bn1.imul(bn2);
   */
  imul (num: BigNumber): BigNumber {
    return this.clone().mulTo(num, this)
  }

  /**
   * Performs an in-place multiplication of the BigNumber instance by a number.
   * This method asserts the input to be a number less than 0x4000000 to prevent overflowing.
   * If negavtive number is provided, the resulting BigNumber will be inversely negative.
   *
   * @method imuln
   * @param num - The number to multiply with.
   * @returns The BigNumber itself after the multiplication.
   *
   * @example
   * const bn = new BigNumber('12345');
   * bn.imuln(23456);
   */
  imuln (num: number): BigNumber {
    const isNegNum = num < 0
    if (isNegNum) num = -num

    this.assert(typeof num === 'number')
    this.assert(num < 0x4000000)

    // Carry
    let carry = 0
    let i = 0
    for (; i < this.length; i++) {
      const w = (this.words[i] | 0) * num
      const lo = (w & 0x3ffffff) + (carry & 0x3ffffff)
      carry >>= 26
      carry += (w / 0x4000000) | 0
      // NOTE: lo is 27bit maximum
      carry += lo >>> 26
      this.words[i] = lo & 0x3ffffff
    }

    if (carry !== 0) {
      this.words[i] = carry
      this.length++
    }

    return isNegNum ? this.ineg() : this
  }

  /**
   * Performs multiplication between the BigNumber instance and a number.
   * It performs the multiplication operation in-place to a cloned BigNumber.
   *
   * @method muln
   * @param num - The number to multiply with.
   * @returns The resulting BigNumber from the multiplication operation.
   *
   * @example
   * const bn = new BigNumber('12345');
   * const result = bn.muln(23456);
   */
  muln (num: number): BigNumber {
    return this.clone().imuln(num)
  }

  /**
   * Squares the BigNumber instance.
   *
   * @method sqr
   * @returns The BigNumber squared.
   *
   * @example
   * const bn = new BigNumber('12345');
   * const result = bn.sqr();
   */
  sqr (): BigNumber {
    return this.mul(this)
  }

  /**
   * Performs in-place multiplication of the BigNumber instance by itself.
   *
   * @method isqr
   * @returns The result of multiplying the BigNumber instance by itself.
   *
   * @example
   * let myNumber = new BigNumber(4);
   * myNumber.isqr(); // Returns BigNumber of value 16
   */
  isqr (): BigNumber {
    return this.imul(this.clone())
  }

  /**
   * Raises the BigNumber instance to the power of the specified BigNumber.
   *
   * @method pow
   * @param num - The exponent to raise the BigNumber instance to.
   * @returns The result of raising the BigNumber instance to the power of num.
   *
   * @example
   * let base = new BigNumber(2);
   * let exponent = new BigNumber(3);
   * base.pow(exponent); // Returns BigNumber of value 8
   */
  pow (num: BigNumber): BigNumber {
    const w = BigNumber.toBitArray(num)
    if (w.length === 0) return new BigNumber(1)

    // Skip leading zeroes
    /* eslint-disable @typescript-eslint/no-this-alias */
    let res = this
    let i = 0
    for (; i < w.length; i++, res = res.sqr() as this) {
      if (w[i] !== 0) break
    }

    if (++i < w.length) {
      for (let q = res.sqr(); i < w.length; i++, q = q.sqr()) {
        if (w[i] === 0) continue
        res = res.mul(q) as this
      }
    }

    return res
  }

  /**
   * Performs in-place bitwise left shift operation on the BigNumber instance.
   *
   * @method iushln
   * @param bits - The number of positions to shift.
   * @returns The BigNumber instance after performing the shift operation.
   *
   * @example
   * let myNumber = new BigNumber(4);
   * myNumber.iushln(2); // Returns BigNumber of value 16
   */
  iushln (bits: number): BigNumber {
    this.assert(typeof bits === 'number' && bits >= 0)
    const r = bits % 26
    const s = (bits - r) / 26
    const carryMask = (0x3ffffff >>> (26 - r)) << (26 - r)
    let i: number

    if (r !== 0) {
      let carry = 0

      for (i = 0; i < this.length; i++) {
        const newCarry = this.words[i] & carryMask
        const c = ((this.words[i] | 0) - newCarry) << r
        this.words[i] = c | carry
        carry = newCarry >>> (26 - r)
      }

      if (carry !== 0) {
        this.words[i] = carry
        this.length++
      }
    }

    if (s !== 0) {
      for (i = this.length - 1; i >= 0; i--) {
        this.words[i + s] = this.words[i]
      }

      for (i = 0; i < s; i++) {
        this.words[i] = 0
      }

      this.length += s
    }

    return this.strip()
  }

  /**
   * Performs an in-place left shift operation on the BigNumber instance only if it is non-negative.
   *
   * @method ishln
   * @param bits - The number of positions to shift.
   * @returns The BigNumber instance after performing the shift operation.
   *
   * @example
   * let myNumber = new BigNumber(4);
   * myNumber.ishln(2); // Returns BigNumber of value 16
   */
  ishln (bits: number): BigNumber {
    this.assert(this.negative === 0)
    return this.iushln(bits)
  }

  /**
   * Performs an in-place unsigned bitwise right shift operation on the BigNumber instance.
   *
   * @method iushrn
   * @param bits - The number of positions to shift.
   * @param hint - Lowest bit before trailing zeroes.
   * @param extended - To be filled with the bits that are shifted out.
   * @returns The BigNumber instance after performing the shift operation.
   *
   * @example
   * let myNumber = new BigNumber(16);
   * myNumber.iushrn(2); // Returns BigNumber of value 4
   */
  iushrn (bits: number, hint?: number, extended?: BigNumber): BigNumber {
    this.assert(typeof bits === 'number' && bits >= 0)
    let h
    if (typeof hint === 'number' && hint !== 0) {
      h = (hint - (hint % 26)) / 26
    } else {
      h = 0
    }

    const r = bits % 26
    const s = Math.min((bits - r) / 26, this.length)
    const mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r)
    const maskedWords = extended

    h -= s
    h = Math.max(0, h)

    // Extended mode, copy masked part
    let i = 0
    if (typeof maskedWords !== 'undefined') {
      for (; i < s; i++) {
        maskedWords.words[i] = this.words[i]
      }
      maskedWords.length = s
    }

    if (s === 0) {
      // No-op, we should not move anything at all
    } else if (this.length > s) {
      this.length -= s
      for (i = 0; i < this.length; i++) {
        this.words[i] = this.words[i + s]
      }
    } else {
      this.words[0] = 0
      this.length = 1
    }

    let carry = 0
    for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
      const word = this.words[i] | 0
      this.words[i] = (carry << (26 - r)) | (word >>> r)
      carry = word & mask
    }

    // Push carried bits as a mask
    if ((maskedWords != null) && carry !== 0) {
      maskedWords.words[maskedWords.length++] = carry
    }

    if (this.length === 0) {
      this.words[0] = 0
      this.length = 1
    }

    return this.strip()
  }

  /**
   * Performs an in-place right shift operation on the BigNumber instance only if it is non-negative.
   *
   * @method ishrn
   * @param bits - The number of positions to shift.
   * @param hint - Lowest bit before trailing zeroes.
   * @param extended - To be filled with the bits that are shifted out.
   * @returns The BigNumber instance after performing the shift operation.
   *
   * @example
   * let myNumber = new BigNumber(16);
   * myNumber.ishrn(2); // Returns BigNumber of value 4
   */
  ishrn (bits, hint?, extended?): BigNumber {
    this.assert(this.negative === 0)
    return this.iushrn(bits, hint, extended)
  }

  /**
   * Performs a bitwise left shift operation on a clone of the BigNumber instance.
   *
   * @method shln
   * @param bits - The number of positions to shift.
   * @returns A new BigNumber, which is the result of the shift operation.
   *
   * @example
   * let myNumber = new BigNumber(4);
   * let shiftedNumber = myNumber.shln(2);
   * console.log(shiftedNumber.toString()); // Outputs "16"
   */
  shln (bits): BigNumber {
    return this.clone().ishln(bits)
  }

  /**
   * Performs an unsigned bitwise shift left operation on a clone of the BigNumber instance.
   *
   * @method ushln
   * @param bits - The number of bits to shift.
   * @returns A new BigNumber resulting from the shift operation.
   *
   * @example
   * let myNumber = new BigNumber(4);
   * let shiftedNumber = myNumber.ushln(2);
   * console.log(shiftedNumber.toString()); // Outputs "16"
   */
  ushln (bits): BigNumber {
    return this.clone().iushln(bits)
  }

  /**
   * Performs a bitwise right shift operation on a clone of the BigNumber instance.
   *
   * @method shrn
   * @param bits - The number of bits to shift.
   * @returns A new BigNumber resulting from the shift operation.
   *
   * @example
   * let myNumber = new BigNumber(16);
   * let shiftedNumber = myNumber.shrn(3);
   * console.log(shiftedNumber.toString()); // Outputs "2"
   */
  shrn (bits): BigNumber {
    return this.clone().ishrn(bits)
  }

  /**
   * Performs an unsigned bitwise shift right operation on a clone of the BigNumber instance.
   *
   * @method ushrn
   * @param bits - The number of bits to shift.
   * @returns A new BigNumber resulting from the shift operation.
   *
   * @example
   * let myNumber = new BigNumber(20);
   * let shiftedNumber = myNumber.ushrn(2);
   * console.log(shiftedNumber.toString()); // Outputs "5"
   */
  ushrn (bits): BigNumber {
    return this.clone().iushrn(bits)
  }

  /**
   * Tests if the nth bit of the BigNumber is set.
   *
   * @method testn
   * @param bit - The position of the bit to test.
   * @returns A boolean indicating whether the nth bit is set.
   *
   * @example
   * let myNumber = new BigNumber(10); // 1010 in binary
   * myNumber.testn(1); // Returns true (indicating that the second bit from right is set)
   */
  testn (bit: number): boolean {
    this.assert(typeof bit === 'number' && bit >= 0)
    const r = bit % 26
    const s = (bit - r) / 26
    const q = 1 << r

    // Fast case: bit is much higher than all existing words
    if (this.length <= s) return false

    // Check bit and return
    const w = this.words[s]

    return Boolean(w & q)
  }

  /**
   * Performs an in-place operation to keep only the lower bits of the number.
   * @method imaskn
   * @param bits - The number of lower bits to keep.
   * @returns Returns the BigNumber with only the specified lower bits.
   * @throws Will throw an error if bits is not a positive number.
   * @throws Will throw an error if initial BigNumber is negative as imaskn only works with positive numbers.
   * @example
   * const myNumber = new BigNumber(52);
   * myNumber.imaskn(2); // myNumber becomes 0 because lower 2 bits of 52 (110100) are 00.
   */
  imaskn (bits): BigNumber {
    this.assert(typeof bits === 'number' && bits >= 0)
    const r = bits % 26
    let s = (bits - r) / 26

    this.assert(this.negative === 0, 'imaskn works only with positive numbers')

    if (this.length <= s) {
      return this
    }

    if (r !== 0) {
      s++
    }
    this.length = Math.min(s, this.length)

    if (r !== 0) {
      const mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r)
      this.words[this.length - 1] &= mask
    }

    return this.strip()
  }

  /**
   * Returns a new BigNumber that keeps only the lower bits of the original number.
   * @method maskn
   * @param bits - The number of lower bits to keep.
   * @returns Returns a new BigNumber with only the specified lower bits of the original number.
   * @example
   * const myNumber = new BigNumber(52);
   * const newNumber = myNumber.maskn(2); // newNumber becomes 0, myNumber doesn't change.
   */
  maskn (bits): BigNumber {
    return this.clone().imaskn(bits)
  }

  /**
   * Performs an in-place addition of a plain number to the BigNumber.
   * @method iaddn
   * @param num - The plain number to add.
   * @returns Returns the BigNumber after the addition.
   * @throws Will throw an error if num is not a number or is larger than 0x4000000.
   * @example
   * const myNumber = new BigNumber(50);
   * myNumber.iaddn(2); // myNumber becomes 52.
   */
  iaddn (num: number): BigNumber {
    this.assert(typeof num === 'number')
    this.assert(num < 0x4000000, 'num is too large')
    if (num < 0) return this.isubn(-num)

    // Possible sign change
    if (this.negative !== 0) {
      if (this.length === 1 && (this.words[0] | 0) <= num) {
        this.words[0] = num - (this.words[0] | 0)
        this.negative = 0
        return this
      }

      this.negative = 0
      this.isubn(num)
      this.negative = 1
      return this
    }

    // Add without checks
    return this._iaddn(num)
  }

  /**
   * A helper method for in-place addition, used when there are no sign changes or size checks needed.
   * @private
   * @method _iaddn
   * @param num - The plain number to add.
   * @returns Returns the BigNumber after the addition.
   */
  _iaddn (num: number): BigNumber {
    this.words[0] += num

    // Carry
    let i = 0
    for (; i < this.length && this.words[i] >= 0x4000000; i++) {
      this.words[i] -= 0x4000000
      if (i === this.length - 1) {
        this.words[i + 1] = 1
      } else {
        this.words[i + 1]++
      }
    }
    this.length = Math.max(this.length, i + 1)

    return this
  }

  /**
   * Performs an in-place subtraction of a plain number from the BigNumber.
   * @method isubn
   * @param num - The plain number to subtract.
   * @returns Returns the BigNumber after the subtraction.
   * @throws Will throw an error if num is not a number or is larger than 0x4000000.
   * @example
   * const myNumber = new BigNumber(52);
   * myNumber.isubn(2); // myNumber becomes 50.
   */
  isubn (num: number): BigNumber {
    this.assert(typeof num === 'number')
    this.assert(num < 0x4000000)
    if (num < 0) return this.iaddn(-num)

    if (this.negative !== 0) {
      this.negative = 0
      this.iaddn(num)
      this.negative = 1
      return this
    }

    this.words[0] -= num

    if (this.length === 1 && this.words[0] < 0) {
      this.words[0] = -this.words[0]
      this.negative = 1
    } else {
      // Carry
      for (let i = 0; i < this.length && this.words[i] < 0; i++) {
        this.words[i] += 0x4000000
        this.words[i + 1] -= 1
      }
    }

    return this.strip()
  }

  /**
   * Returns a new BigNumber that is the result of adding a plain number to the original BigNumber.
   * @method addn
   * @param num - The plain number to add.
   * @returns Returns a new BigNumber which is the sum of the original BigNumber and the plain number.
   * @example
   * const myNumber = new BigNumber(50);
   * const newNumber = myNumber.addn(2); // newNumber becomes 52, myNumber doesn't change.
   */
  addn (num: number): BigNumber {
    return this.clone().iaddn(num)
  }

  /**
   * Returns a new BigNumber that is the result of subtracting a plain number from the original BigNumber.
   * @method subn
   * @param num - The plain number to subtract.
   * @returns Returns a new BigNumber which is the difference of the original BigNumber and the plain number.
   * @example
   * const myNumber = new BigNumber(52);
   * const newNumber = myNumber.subn(2);  // newNumber becomes 50, myNumber doesn't change.
   */
  subn (num: number): BigNumber {
    return this.clone().isubn(num)
  }

  /**
   * Performs an in-place operation to make the BigNumber an absolute value.
   * @method iabs
   * @returns Returns the BigNumber as an absolute value.
   * @example
   * const myNumber = new BigNumber(-50);
   * myNumber.iabs(); // myNumber becomes 50.
   */
  iabs (): BigNumber {
    this.negative = 0
    return this
  }

  /**
   * Obtains the absolute value of a BigNumber instance.
   * This operation does not affect the actual object but instead returns a new instance of BigNumber.
   *
   * @method abs
   * @returns a new BigNumber instance with the absolute value of the current instance.
   *
   * @example
   * let negativeNumber = new BigNumber(-10);
   * let absolute = negativeNumber.abs();
   * console.log(absolute.toString()); // Outputs: "10"
   */
  abs (): BigNumber {
    return this.clone().iabs()
  }

  /**
   * Perform an in-place shift left, subtract, and multiply operation on a BigNumber instance.
   * This method modifies the existing BigNumber instance.
   *
   * @method _ishlnsubmul
   * @param num - The BigNumber to be operated on.
   * @param mul - The multiplication factor.
   * @param shift - The number of places to shift left.
   * @returns the updated BigNumber instance after performing the in-place shift, subtract, and multiply operations.
   *
   * @example
   * let number = new BigNumber(10);
   * number._ishlnsubmul(new BigNumber(2), 3, 1);
   * console.log(number.toString()); // Outputs result after performing operations
   */
  _ishlnsubmul (num: BigNumber, mul, shift: number): BigNumber {
    const len = num.length + shift
    let i: number

    this.expand(len)

    let w
    let carry = 0
    for (i = 0; i < num.length; i++) {
      w = (this.words[i + shift] | 0) + carry
      const right = (num.words[i] | 0) * mul
      w -= right & 0x3ffffff
      carry = (w >> 26) - ((right / 0x4000000) | 0)
      this.words[i + shift] = w & 0x3ffffff
    }
    for (; i < this.length - shift; i++) {
      w = (this.words[i + shift] | 0) + carry
      carry = w >> 26
      this.words[i + shift] = w & 0x3ffffff
    }

    if (carry === 0) return this.strip()

    // Subtraction overflow
    this.assert(carry === -1, 'carry must be -1')
    carry = 0
    for (i = 0; i < this.length; i++) {
      w = -(this.words[i] | 0) + carry
      carry = w >> 26
      this.words[i] = w & 0x3ffffff
    }
    this.negative = 1

    return this.strip()
  }

  /**
   * Performs a division on a BigNumber instance word-wise.
   *
   * This is a private method and should not be directly accessed.
   *
   * @method wordDiv
   * @private
   * @param num - The BigNumber to divide by.
   * @param mode - Specifies the operation mode as 'mod' for modulus or 'div' for division.
   * @returns Object with division (div) and modulo (mod) results, subject to the 'mode' specified.
   */
  private wordDiv (num: BigNumber, mode): any {
    let shift = this.length - num.length

    let a = this.clone()
    let b = num

    // Normalize
    let bhi = b.words[b.length - 1] | 0
    const bhiBits = this.countWordBits(bhi)
    shift = 26 - bhiBits
    if (shift !== 0) {
      b = b.ushln(shift)
      a.iushln(shift)
      bhi = b.words[b.length - 1] | 0
    }

    // Initialize quotient
    const m = a.length - b.length
    let q: BigNumber | undefined

    if (mode !== 'mod') {
      q = new BigNumber()
      q.length = m + 1
      q.words = new Array(q.length)
      for (let i = 0; i < q.length; i++) {
        q.words[i] = 0
      }
    }

    const diff = a.clone()._ishlnsubmul(b, 1, m)
    if (diff.negative === 0) {
      a = diff
      if (typeof q !== 'undefined') {
        q.words[m] = 1
      }
    }

    for (let j = m - 1; j >= 0; j--) {
      let qj = (a.words[b.length + j] | 0) * 0x4000000 +
        (a.words[b.length + j - 1] | 0)

      // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
      // (0x7ffffff)
      qj = Math.min((qj / bhi) | 0, 0x3ffffff)

      a._ishlnsubmul(b, qj, j)
      while (a.negative !== 0) {
        qj--
        a.negative = 0
        a._ishlnsubmul(b, 1, j)
        if (!a.isZero()) {
          a.negative ^= 1
        }
      }
      if (typeof q !== 'undefined') {
        q.words[j] = qj
      }
    }
    if (typeof q !== 'undefined') {
      q.strip()
    }
    a.strip()

    // Denormalize
    if (mode !== 'div' && shift !== 0) {
      a.iushrn(shift)
    }

    return {
      div: q ?? null,
      mod: a
    }
  }

  /**
   * Performs division and/or modulus operation on a BigNumber instance depending on the 'mode' parameter.
   * If the mode parameter is not provided, both division and modulus results are returned.
   *
   * @method divmod
   * @param num - The BigNumber to divide by.
   * @param mode - Specifies operation as 'mod' for modulus, 'div' for division, or both if not specified.
   * @param positive - Specifies if unsigned modulus is requested.
   * @returns Object with properties for division (div) and modulo (mod) results.
   *
   * @example
   * let number = new BigNumber(10);
   * let result = number.divmod(new BigNumber(3));
   * console.log(result.div.toString()); // Outputs: "3"
   * console.log(result.mod.toString()); // Outputs: "1"
   */
  divmod (num: BigNumber, mode?: 'div' | 'mod', positive?: boolean): any {
    this.assert(!num.isZero())

    if (this.isZero()) {
      return {
        div: new BigNumber(0),
        mod: new BigNumber(0)
      }
    }

    let div, mod, res
    if (this.negative !== 0 && num.negative === 0) {
      res = this.neg().divmod(num, mode)

      if (mode !== 'mod') {
        div = res.div.neg()
      }

      if (mode !== 'div') {
        mod = res.mod.neg()
        if (positive && mod.negative !== 0) {
          mod.iadd(num)
        }
      }

      return {
        div,
        mod
      }
    }

    if (this.negative === 0 && num.negative !== 0) {
      res = this.divmod(num.neg(), mode)

      if (mode !== 'mod') {
        div = res.div.neg()
      }

      return {
        div,
        mod: res.mod
      }
    }

    if ((this.negative & num.negative) !== 0) {
      res = this.neg().divmod(num.neg(), mode)

      if (mode !== 'div') {
        mod = res.mod.neg()
        if (positive && mod.negative !== 0) {
          mod.isub(num)
        }
      }

      return {
        div: res.div,
        mod
      }
    }

    // Both numbers are positive at this point

    // Strip both numbers to approximate shift value
    if (num.length > this.length || this.cmp(num) < 0) {
      return {
        div: new BigNumber(0),
        mod: this
      }
    }

    // Very short reduction
    if (num.length === 1) {
      if (mode === 'div') {
        return {
          div: this.divn(num.words[0]),
          mod: null
        }
      }

      if (mode === 'mod') {
        return {
          div: null,
          mod: new BigNumber(this.modrn(num.words[0]))
        }
      }

      return {
        div: this.divn(num.words[0]),
        mod: new BigNumber(this.modrn(num.words[0]))
      }
    }

    return this.wordDiv(num, mode)
  }

  /**
   * Divides a BigNumber instance by another BigNumber and returns result. This does not modify the actual object.
   *
   * @method div
   * @param num - The BigNumber to divide by.
   * @returns A new BigNumber instance of the division result.
   *
   * @example
   * let number = new BigNumber(10);
   * let result = number.div(new BigNumber(2));
   * console.log(result.toString()); // Outputs: "5"
   */
  div (num: BigNumber): BigNumber {
    return this.divmod(num, 'div', false).div as BigNumber
  }

  /**
   * Returns the remainder after division of one `BigNumber` by another `BigNumber`.
   *
   * @method mod
   * @param num - The divisor `BigNumber`.
   * @returns The remainder `BigNumber` after division.
   *
   * @example
   * const bigNum1 = new BigNumber('100');
   * const bigNum2 = new BigNumber('45');
   * const remainder = bigNum1.mod(bigNum2); // remainder here would be '10'
   */
  mod (num: BigNumber): BigNumber {
    return this.divmod(num, 'mod', false).mod as BigNumber
  }

  /**
   * Returns the remainder after unsigned division of one `BigNumber` by another `BigNumber`.
   *
   * @method umod
   * @param num - The divisor `BigNumber`.
   * @returns The remainder `BigNumber` after unsigned division.
   * Note: Here 'unsigned division' means that signs of the numbers are ignored.
   *
   * @example
   * const bigNum1 = new BigNumber('-100');
   * const bigNum2 = new BigNumber('45');
   * const remainder = bigNum1.umod(bigNum2); // remainder here would be '10' as signs are ignored.
   */
  umod (num: BigNumber): BigNumber {
    return this.divmod(num, 'mod', true).mod as BigNumber
  }

  /**
   * Returns the rounded quotient after division of one `BigNumber` by another `BigNumber`.
   *
   * @method divRound
   * @param num - The divisor `BigNumber`.
   * @returns The rounded quotient `BigNumber` after division.
   *
   * @example
   * const bigNum1 = new BigNumber('100');
   * const bigNum2 = new BigNumber('45');
   * const quotient = bigNum1.divRound(bigNum2); // quotient here would be '2'
   */
  divRound (num: BigNumber): BigNumber {
    const dm: { div: BigNumber, mod: BigNumber } = (
      this.divmod(num) as unknown as { div: BigNumber, mod: BigNumber }
    )

    // Fast case - exact division
    if (dm.mod.isZero()) return dm.div

    const mod = dm.div.negative !== 0
      ? dm.mod.isub(num)
      : dm.mod

    const half = num.ushrn(1)
    const r2: number = num.andln(1)
    const cmp = mod.cmp(half)

    // Round down
    if (cmp < 0 || (r2 === 1 && cmp === 0)) return dm.div

    // Round up
    return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1)
  }

  /**
   * Returns the remainder after division of a `BigNumber` by a primitive number.
   *
   * @method modrn
   * @param num - The divisor primitive number.
   * @returns The remainder number after division.
   *
   * @example
   * const bigNum = new BigNumber('100');
   * const num = 45;
   * const remainder = bigNum.modrn(num); // remainder here would be '10'
   */
  modrn (num: number): number {
    const isNegNum = num < 0
    if (isNegNum) num = -num

    this.assert(num <= 0x3ffffff)
    const p = (1 << 26) % num

    let acc = 0
    for (let i = this.length - 1; i >= 0; i--) {
      acc = (p * acc + (this.words[i] | 0)) % num
    }

    return isNegNum ? -acc : acc
  }

  /**
   * Performs an in-place division of a `BigNumber` by a primitive number.
   *
   * @method idivn
   * @param num - The divisor primitive number.
   * @returns The `BigNumber` itself after being divided.
   * Note: 'in-place' means that this operation modifies the original `BigNumber`.
   *
   * @example
   * const bigNum = new BigNumber('100');
   * const num = 45;
   * bigNum.idivn(num); // the bigNum here directly becomes '2'
   */
  idivn (num: number): BigNumber {
    const isNegNum = num < 0
    if (isNegNum) num = -num

    this.assert(num <= 0x3ffffff)

    let carry = 0
    for (let i = this.length - 1; i >= 0; i--) {
      const w = (this.words[i] | 0) + carry * 0x4000000
      this.words[i] = (w / num) | 0
      carry = w % num
    }

    this.strip()
    return isNegNum ? this.ineg() : this
  }

  /**
   * Returns the quotient `BigNumber` after division of one `BigNumber` by a primitive number.
   *
   * @method divn
   * @param num - The divisor primitive number.
   * @returns A new quotient `BigNumber` after division.
   *
   * @example
   * const bigNum = new BigNumber('100');
   * const num = 45;
   * const quotient = bigNum.divn(num); // quotient here would be '2'
   */
  divn (num: number): BigNumber {
    return this.clone().idivn(num)
  }

  /**
   * Computes the Extended Euclidean Algorithm for this BigNumber and provided BigNumber `p`.
   * The Extended Euclidean Algorithm is a method to find the GCD (Greatest Common Divisor) and the multiplicative inverse in a modulus field.
   *
   * @method egcd
   * @param p - The `BigNumber` with which the Extended Euclidean Algorithm will be computed.
   * @returns An object `{a: BigNumber, b: BigNumber, gcd: BigNumber}` where `gcd` is the GCD of the numbers, `a` is the coefficient of `this`, and `b` is the coefficient of `p` in Bézout's identity.
   *
   * @example
   * const bigNum1 = new BigNumber('100');
   * const bigNum2 = new BigNumber('45');
   * const result = bigNum1.egcd(bigNum2);
   */
  egcd (p: BigNumber): { a: BigNumber, b: BigNumber, gcd: BigNumber } {
    this.assert(p.negative === 0, 'p must not be negative')
    this.assert(!p.isZero(), 'p must not be zero')

    let x = this
    const y = p.clone()

    if (x.negative !== 0) {
      x = x.umod(p) as this
    } else {
      x = x.clone() as this
    }

    // A * x + B * y = x
    const A = new BigNumber(1)
    const B = new BigNumber(0)

    // C * x + D * y = y
    const C = new BigNumber(0)
    const D = new BigNumber(1)

    let g = 0

    while (x.isEven() && y.isEven()) {
      x.iushrn(1)
      y.iushrn(1)
      ++g
    }

    const yp = y.clone()
    const xp = x.clone()

    while (!x.isZero()) {
      let i = 0
      let im = 1
      for (; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
      if (i > 0) {
        x.iushrn(i)
        while (i-- > 0) {
          if (A.isOdd() || B.isOdd()) {
            A.iadd(yp)
            B.isub(xp)
          }

          A.iushrn(1)
          B.iushrn(1)
        }
      }

      let j = 0
      let jm = 1
      for (; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
      if (j > 0) {
        y.iushrn(j)
        while (j-- > 0) {
          if (C.isOdd() || D.isOdd()) {
            C.iadd(yp)
            D.isub(xp)
          }

          C.iushrn(1)
          D.iushrn(1)
        }
      }

      if (x.cmp(y) >= 0) {
        x.isub(y)
        A.isub(C)
        B.isub(D)
      } else {
        y.isub(x)
        C.isub(A)
        D.isub(B)
      }
    }

    return {
      a: C,
      b: D,
      gcd: y.iushln(g)
    }
  }

  /**
   * Compute the multiplicative inverse of the current BigNumber in the modulus field specified by `p`.
   * The multiplicative inverse is a number which when multiplied with the current BigNumber gives '1' in the modulus field.
   *
   * @method _invmp
   * @param p - The `BigNumber` specifying the modulus field.
   * @returns The multiplicative inverse `BigNumber` in the modulus field specified by `p`.
   *
   * @example
   * const bigNum = new BigNumber('45');
   * const p = new BigNumber('100');
   * const inverse = bigNum._invmp(p); // inverse here would be a BigNumber such that (inverse*bigNum) % p = '1'
   */
  _invmp (p: BigNumber): BigNumber {
    this.assert(p.negative === 0, 'p must not be negative')
    this.assert(!p.isZero(), 'p must not be zero')

    let a = this
    const b = p.clone()

    if (a.negative !== 0) {
      a = a.umod(p) as this
    } else {
      a = a.clone() as this
    }

    const x1 = new BigNumber(1)
    const x2 = new BigNumber(0)

    const delta = b.clone()

    while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
      let i = 0
      let im = 1
      for (; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
      if (i > 0) {
        a.iushrn(i)
        while (i-- > 0) {
          if (x1.isOdd()) {
            x1.iadd(delta)
          }

          x1.iushrn(1)
        }
      }

      let j = 0
      let jm = 1
      for (; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
      if (j > 0) {
        b.iushrn(j)
        while (j-- > 0) {
          if (x2.isOdd()) {
            x2.iadd(delta)
          }

          x2.iushrn(1)
        }
      }

      if (a.cmp(b) >= 0) {
        a.isub(b)
        x1.isub(x2)
      } else {
        b.isub(a)
        x2.isub(x1)
      }
    }

    let res
    if (a.cmpn(1) === 0) {
      res = x1
    } else {
      res = x2
    }

    if (res.cmpn(0) < 0) {
      res.iadd(p)
    }

    return res
  }

  /**
   * Computes and returns the greatest common divisor (GCD) of this BigNumber and the provided BigNumber.
   *
   * @method gcd
   * @param num - The BigNumber with which to compute the GCD.
   * @returns The GCD of this BigNumber and the provided BigNumber.
   *
   * @example
   * let a = new BigNumber(48);
   * let b = new BigNumber(18);
   * let gcd = a.gcd(b);
   */
  gcd (num: BigNumber): BigNumber {
    if (this.isZero()) return num.abs()
    if (num.isZero()) return this.abs()

    let a = this.clone()
    let b = num.clone()
    a.negative = 0
    b.negative = 0

    // Remove common factor of two
    let shift = 0
    for (; a.isEven() && b.isEven(); shift++) {
      a.iushrn(1)
      b.iushrn(1)
    }

    do {
      while (a.isEven()) {
        a.iushrn(1)
      }
      while (b.isEven()) {
        b.iushrn(1)
      }

      const r = a.cmp(b)
      if (r < 0) {
        // Swap `a` and `b` to make `a` always bigger than `b`
        const t = a
        a = b
        b = t
      } else if (r === 0 || b.cmpn(1) === 0) {
        break
      }

      a.isub(b)
    } while (true)

    return b.iushln(shift)
  }

  /**
   * Computes and returns the modular multiplicative inverse of this BigNumber in the field defined by the provided BigNumber.
   *
   * @method invm
   * @param num - The BigNumber that defines the field.
   * @returns The modular multiplicative inverse of this BigNumber.
   *
   * @example
   * let a = new BigNumber(3);
   * let field = new BigNumber(7);
   * let inverse = a.invm(field);
   */
  invm (num: BigNumber): BigNumber {
    return this.egcd(num).a.umod(num)
  }

  /**
   * Checks if this BigNumber is even.
   * An even number is an integer which is evenly divisible by two.
   *
   * @method isEven
   * @returns true if this BigNumber is even, else false.
   *
   * @example
   * let a = new BigNumber(4);
   * let isEven = a.isEven(); // true
   */
  isEven (): boolean {
    return (this.words[0] & 1) === 0
  }

  /**
   * Checks if this BigNumber is Odd.
   * An odd number is an integer which is not evenly divisible by two.
   *
   * @method isOdd
   * @returns true if this BigNumber is Odd, else false.
   *
   * @example
   * let a = new BigNumber(3);
   * let isOdd = a.isOdd(); // true
   */
  isOdd (): boolean {
    return (this.words[0] & 1) === 1
  }

  /**
   * Returns the result of bitwise AND operation between the least significant 26 bits of
   * this BigNumber and the provided number.
   * This method is mostly used to mask-off less significant bits.
   *
   * @method andln
   * @param num - The number to AND with.
   * @returns The result of the AND operation.
   *
   * @example
   * let a = new BigNumber(60);
   * let result = a.andln(13); // 12
   */
  andln (num: number): number {
    return this.words[0] & num
  }

  /**
   * Increments the value at the bit position specified by the input parameter.
   *
   * @method bincn
   * @param bit - The bit position to increment at.
   * @returns This BigNumber after incrementing at the specific bit position.
   *
   * @example
   * let a = new BigNumber(5);
   * a.bincn(2); // a = 7
   */
  bincn (bit: number): BigNumber {
    this.assert(typeof bit === 'number')
    const r = bit % 26
    const s = (bit - r) / 26
    const q = 1 << r

    // Fast case: bit is much higher than all existing words
    if (this.length <= s) {
      this.expand(s + 1)
      this.words[s] |= q
      return this
    }

    // Add bit and propagate, if needed
    let carry = q
    let i = s
    for (; carry !== 0 && i < this.length; i++) {
      let w = this.words[i] | 0
      w += carry
      carry = w >>> 26
      w &= 0x3ffffff
      this.words[i] = w
    }
    if (carry !== 0) {
      this.words[i] = carry
      this.length++
    }
    return this
  }

  /**
   * Checks if this BigNumber is Zero.
   * A BigNumber is zero if it only contains one word and that word is 0.
   *
   * @method isZero
   * @returns true if this BigNumber is Zero, else false.
   *
   * @example
   * let a = new BigNumber(0);
   * let isZero = a.isZero(); // true
   */
  isZero (): boolean {
    return this.length === 1 && this.words[0] === 0
  }

  /**
   * Compares this BigNumber with the given number.
   * It returns -1 if this BigNumber is less than the number, 0 if they're equal, and 1 if the BigNumber is greater than the number.
   *
   * @method cmpn
   * @param num - The number to compare with.
   * @returns -1, 0, or 1 based on the comparison result.
   *
   * @example
   * let a = new BigNumber(15);
   * let result = a.cmpn(10); // 1
   */
  cmpn (num: number): 1 | 0 | -1 {
    const negative = num < 0

    if (this.negative !== 0 && !negative) return -1
    if (this.negative === 0 && negative) return 1

    this.strip()

    let res: 1 | 0 | -1
    if (this.length > 1) {
      res = 1
    } else {
      if (negative) {
        num = -num
      }

      this.assert(num <= 0x3ffffff, 'Number is too big')

      const w = this.words[0] | 0
      res = w === num ? 0 : w < num ? -1 : 1
    }
    if (this.negative !== 0) return (-res | 0) as 1 | 0 | -1
    return res
  }

  /**
   * Compare this big number with another big number.
   * @method cmp
   * @param num - The big number to compare with.
   * @returns Returns:
   * 1 if this big number is greater,
   * -1 if it's less,
   * 0 if they are equal.
   *
   * @example
   * import BigNumber from './BigNumber';
   * const bn1 = new BigNumber('10');
   * const bn2 = new BigNumber('6');
   * const comparisonResult = bn1.cmp(bn2); // 1 - because 10 is greater than 6
   */
  cmp (num: BigNumber): 1 | 0 | -1 {
    if (this.negative !== 0 && num.negative === 0) return -1
    if (this.negative === 0 && num.negative !== 0) return 1

    const res = this.ucmp(num)
    if (this.negative !== 0) return (-res | 0) as 1 | 0 | -1
    return res
  }

  /**
   * Performs an unsigned comparison between this BigNumber instance and another.
   *
   * @method ucmp
   * @param num - The BigNumber instance to compare with.
   * @returns Returns 1 if this BigNumber is bigger, -1 if it is smaller, and 0 if they are equal.
   *
   * @example
   * let bigNumber1 = new BigNumber('1234');
   * let bigNumber2 = new BigNumber('2345');
   * let comparisonResult = bigNumber1.ucmp(bigNumber2); // Returns -1
   */
  ucmp (num: BigNumber): 1 | 0 | -1 {
    // At this point both numbers have the same sign
    if (this.length > num.length) return 1
    if (this.length < num.length) return -1

    let res: 1 | 0 | -1 = 0
    for (let i = this.length - 1; i >= 0; i--) {
      const a = this.words[i] | 0
      const b = num.words[i] | 0

      if (a === b) continue
      if (a < b) {
        res = -1
      } else if (a > b) {
        res = 1
      }
      break
    }
    return res
  }

  /**
   * Checks if this BigNumber instance is greater than a number.
   *
   * @method gtn
   * @param num - The number to compare with.
   * @returns Returns true if this BigNumber is greater than the number, false otherwise.
   *
   * @example
   * let bigNumber = new BigNumber('2345');
   * let isGreater = bigNumber.gtn(1234); // Returns true
   */
  gtn (num: number): boolean {
    return this.cmpn(num) === 1
  }

  /**
   * Checks if this BigNumber instance is greater than another BigNumber.
   *
   * @method gt
   * @param num - The BigNumber to compare with.
   * @returns Returns true if this BigNumber is greater than the other BigNumber, false otherwise.
   *
   * @example
   * let bigNumber1 = new BigNumber('2345');
   * let bigNumber2 = new BigNumber('1234');
   * let isGreater = bigNumber1.gt(bigNumber2); // Returns true
   */
  gt (num: BigNumber): boolean {
    return this.cmp(num) === 1
  }

  /**
   * Checks if this BigNumber instance is greater than or equal to a number.
   *
   * @method gten
   * @param num - The number to compare with.
   * @returns Returns true if this BigNumber is greater than or equal to the number, false otherwise.
   *
   * @example
   * let bigNumber = new BigNumber('1234');
   * let isGreaterOrEqual = bigNumber.gten(1234); // Returns true
   */
  gten (num: number): boolean {
    return this.cmpn(num) >= 0
  }

  /**
   * Checks if this BigNumber instance is greater than or equal to another BigNumber.
   *
   * @method gte
   * @param num - The BigNumber to compare with.
   * @returns Returns true if this BigNumber is greater than or equal to the other BigNumber, false otherwise.
   *
   * @example
   * let bigNumber1 = new BigNumber('1234');
   * let bigNumber2 = new BigNumber('1234');
   * let isGreaterOrEqual = bigNumber1.gte(bigNumber2); // Returns true
   */
  gte (num: BigNumber): boolean {
    return this.cmp(num) >= 0
  }

  /**
   * Checks if this BigNumber instance is less than a number.
   *
   * @method ltn
   * @param num - The number to compare with.
   * @returns Returns true if this BigNumber is less than the number, false otherwise.
   *
   * @example
   * let bigNumber = new BigNumber('1234');
   * let isLess = bigNumber.ltn(2345); // Returns true
   */
  ltn (num: number): boolean {
    return this.cmpn(num) === -1
  }

  /**
   * Checks if this BigNumber instance is less than another BigNumber.
   *
   * @method lt
   * @param num - The BigNumber to compare with.
   * @returns Returns true if this BigNumber is less than the other BigNumber, false otherwise.
   *
   * @example
   * let bigNumber1 = new BigNumber('1234');
   * let bigNumber2 = new BigNumber('2345');
   * let isLess = bigNumber1.lt(bigNumber2); // Returns true
   */
  lt (num: BigNumber): boolean {
    return this.cmp(num) === -1
  }

  /**
   * Checks if this BigNumber instance is less than or equal to a number.
   *
   * @method lten
   * @param num - The number to compare with.
   * @returns Returns true if this BigNumber is less than or equal to the number, false otherwise.
   *
   * @example
   * let bigNumber = new BigNumber('2345');
   * let isLessOrEqual = bigNumber.lten(2345); // Returns true
   */
  lten (num: number): boolean {
    return this.cmpn(num) <= 0
  }

  /**
   * Checks if this BigNumber instance is less than or equal to another BigNumber.
   *
   * @method lte
   * @param num - The BigNumber to compare with.
   * @returns Returns true if this BigNumber is less than or equal to the other BigNumber, false otherwise.
   *
   * @example
   * let bigNumber1 = new BigNumber('2345');
   * let bigNumber2 = new BigNumber('2345');
   * let isLessOrEqual = bigNumber1.lte(bigNumber2); // Returns true
   */
  lte (num: BigNumber): boolean {
    return this.cmp(num) <= 0
  }

  /**
   * Checks if this BigNumber instance is equal to a number.
   *
   * @method eqn
   * @param num - The number to compare with.
   * @returns Returns true if this BigNumber is equal to the number, false otherwise.
   *
   * @example
   * let bigNumber = new BigNumber('1234');
   * let isEqual = bigNumber.eqn(1234); // Returns true
   */
  eqn (num: number): boolean {
    return this.cmpn(num) === 0
  }

  /**
   * Compares the current BigNumber with the given number and returns whether they're equal.
   *
   * @method eq
   * @param num - The number to compare equality with.
   * @returns Returns true if the current BigNumber is equal to the provided number, otherwise false.
   *
   * @example
   * let bigNum = new BigNumber(10);
   * bigNum.eq(new BigNumber(10)); // true
   */
  eq (num: BigNumber): boolean {
    return this.cmp(num) === 0
  }

  /**
   * Converts a BigNumber to a reduction context ensuring the number is a positive integer and is not already in a reduction context.
   * Throws an error in case the number is either negative or already in a reduction context.
   *
   * @method toRed
   * @param ctx - The ReductionContext to convert the BigNumber to.
   * @returns Returns the BigNumber in the given ReductionContext.
   *
   * @example
   * let bigNum = new BigNumber(10);
   * let redCtx = new ReductionContext();
   * bigNum.toRed(redCtx);
   */
  toRed (ctx: ReductionContext): BigNumber {
    this.assert(this.red == null, 'Already a number in reduction context')
    this.assert(this.negative === 0, 'red works only with positives')
    return ctx.convertTo(this).forceRed(ctx)
  }

  /**
   * Converts a BigNumber from a reduction context, making sure the number is indeed in a reduction context.
   * Throws an error in case the number is not in a reduction context.
   *
   * @method fromRed
   * @returns Returns the BigNumber out of the ReductionContext.
   *
   * @example
   * let bigNum = new BigNumber(10);
   * let redCtx = new ReductionContext();
   * bigNum.toRed(redCtx);
   * bigNum.fromRed();
   */
  fromRed (): BigNumber {
    this.assert(
      this.red,
      'fromRed works only with numbers in reduction context'
    )
    return (this.red).convertFrom(this)
  }

  /**
   * Forces the current BigNumber into a reduction context, irrespective of the BigNumber's current state.
   *
   * @method forceRed
   * @param ctx - The ReductionContext to forcefully convert the BigNumber to.
   * @returns Returns the BigNumber in the given ReductionContext.
   *
   * @example
   * let bigNum = new BigNumber(10);
   * let redCtx = new ReductionContext();
   * bigNum.forceRed(redCtx);
   */
  forceRed (ctx: ReductionContext): BigNumber {
    // this.assert(this.red == null, 'Already a number in reduction context')
    this.red = ctx
    return this
  }

  /**
   * Performs addition operation of the current BigNumber with the given number in a reduction context.
   * Throws an error in case the number is not in a reduction context.
   *
   * @method redAdd
   * @param num - The number to add to the current BigNumber.
   * @returns Returns a new BigNumber that's the sum of the current BigNumber and the provided number in the reduction context.
   *
   * @example
   * let bigNum = new BigNumber(10);
   * let redCtx = new ReductionContext();
   * bigNum.toRed(redCtx);
   * bigNum.redAdd(new BigNumber(20)); // returns a BigNumber of 30 in reduction context
   */
  redAdd (num: BigNumber): BigNumber {
    this.assert(this.red, 'redAdd works only with red numbers')
    return (this.red).add(this, num)
  }

  /**
   * Performs in-place addition operation of the current BigNumber with the given number in a reduction context.
   * Throws an error in case the number is not in a reduction context.
   *
   * @method redIAdd
   * @param num - The number to add to the current BigNumber.
   * @returns Returns the modified current BigNumber after adding the provided number in the reduction context.
   *
   * @example
   * let bigNum = new BigNumber(10);
   * let redCtx = new ReductionContext();
   * bigNum.toRed(redCtx);
   * bigNum.redIAdd(new BigNumber(20)); // modifies the bigNum to 30 in reduction context
   */
  redIAdd (num: BigNumber): BigNumber {
    this.assert(this.red, 'redIAdd works only with red numbers')
    return (this.red).iadd(this, num)
  }

  /**
   * Performs subtraction operation of the current BigNumber with the given number in a reduction context.
   * Throws an error in case the number is not in a reduction context.
   *
   * @method redSub
   * @param num - The number to subtract from the current BigNumber.
   * @returns Returns a new BigNumber that's the subtraction result of the current BigNumber and the provided number in the reduction context.
   *
   * @example
   * let bigNum = new BigNumber(30);
   * let redCtx = new ReductionContext();
   * bigNum.toRed(redCtx);
   * bigNum.redSub(new BigNumber(20)); // returns a BigNumber of 10 in reduction context
   */
  redSub (num: BigNumber): BigNumber {
    this.assert(this.red, 'redSub works only with red numbers')
    return (this.red).sub(this, num)
  }

  /**
   * Performs in-place subtraction operation of the current BigNumber with the given number in a reduction context.
   * Throws an error in case the number is not in a reduction context.
   *
   * @method redISub
   * @param num - The number to subtract from the current BigNumber.
   * @returns Returns the modified current BigNumber after subtracting the provided number in the reduction context.
   *
   * @example
   * let bigNum = new BigNumber(30);
   * let redCtx = new ReductionContext();
   * bigNum.toRed(redCtx);
   * bigNum.redISub(new BigNumber(20)); // modifies the bigNum to 10 in reduction context
   */
  redISub (num: BigNumber): BigNumber {
    this.assert(this.red, 'redISub works only with red numbers')
    return (this.red).isub(this, num)
  }

  /**
   * Performs the shift left operation on the current BigNumber in the reduction context.
   * Throws an error in case the number is not in a reduction context.
   *
   * @method redShl
   * @param num - The positions to shift left the current BigNumber.
   * @returns Returns a new BigNumber after performing the shift left operation on the current BigNumber in the reduction context.
   *
   * @example
   * let bigNum = new BigNumber(1);
   * let redCtx = new ReductionContext();
   * bigNum.toRed(redCtx);
   * bigNum.redShl(2); // returns a BigNumber of 4 in reduction context
   */
  redShl (num: number): BigNumber {
    this.assert(this.red, 'redShl works only with red numbers')
    return (this.red).shl(this, num)
  }

  /**
   * Performs multiplication operation of the current BigNumber with the given number in a reduction context.
   * Throws an error in case the number is not in a reduction context.
   *
   * @method redMul
   * @param num - The number to multiply with the current BigNumber.
   * @returns Returns a new BigNumber that's the product of the current BigNumber and the provided number in the reduction context.
   *
   * @example
   * let bigNum = new BigNumber(10);
   * let redCtx = new ReductionContext();
   * bigNum.toRed(redCtx);
   * bigNum.redMul(new BigNumber(20)); // returns a BigNumber of 200 in reduction context
   */
  redMul (num: BigNumber): BigNumber {
    this.assert(this.red, 'redMul works only with red numbers')
    ; (this.red).verify2(this, num)
    return (this.red).mul(this, num)
  }

  /**
   * Performs an in-place multiplication of this BigNumber instance with another BigNumber within a reduction context.
   * Expects that this BigNumber is within the reduction context i.e., it has been reduced.
   *
   * @method redIMul
   * @param num - The BigNumber to multiply with the current BigNumber.
   * @returns A BigNumber that is the result of the in-place multiplication operation, within the reduction context.
   *
   * @example
   * let bigNum1 = new BigNumber('10').toRed(someRed);
   * let bigNum2 = new BigNumber('5');
   * bigNum1.redIMul(bigNum2);
   */
  redIMul (num: BigNumber): BigNumber {
    this.assert(this.red, 'redMul works only with red numbers')
    ; (this.red).verify2(this, num)
    return (this.red).imul(this, num)
  }

  /**
   * Square of a "red" (reduced) BigNumber.
   * This function squares the calling BigNumber and returns the result.
   * It only works if the number is "reduced". A number is considered reduced
   * if it has a `red` field that points to a reduction context object.
   *
   * @method redSqr
   * @throws If the BigNumber is not reduced
   * @returns The square of the BigNumber
   *
   * @example
   * const num = new BigNumber('25').toRed(someRed);
   * const result = num.redSqr();
   * console.log(result.toString()); // Outputs: '625' mod the red value
   */
  redSqr (): BigNumber {
    this.assert(this.red, 'redSqr works only with red numbers')
    ; (this.red).verify1(this)
    return (this.red).sqr(this)
  }

  /**
   * In-place square of a "red" (reduced) BigNumber.
   * This function squares the calling BigNumber and overwrites it with the result.
   * It only works if the number is "reduced". A number is considered reduced
   * if it has a `red` field that points to a reduction context object.
   *
   * @method redISqr
   * @throws If the BigNumber is not reduced
   * @returns This BigNumber squared in place
   *
   * @example
   * const num = new BigNumber('25').toRed(someRed);
   * num.redISqr();
   * console.log(num.toString()); // Outputs: '625' mod the red value
   */
  redISqr (): BigNumber {
    this.assert(this.red, 'redISqr works only with red numbers')
    ; (this.red).verify1(this)
    return (this.red).isqr(this)
  }

  /**
   * Square root of a "red" (reduced) BigNumber.
   * This function calculates the square root of the calling BigNumber
   * and returns the result. It only works if the number is "reduced".
   * A number is considered reduced if it has a `red`
   * field that points to a reduction context object.
   *
   * @method redSqrt
   * @throws If the BigNumber is not reduced
   * @returns The square root of the BigNumber
   *
   * @example
   * const num = new BigNumber('4').toRed(someRed);
   * const result = num.redSqrt();
   * console.log(result.toString()); // Outputs: '2' mod the red value
   */
  redSqrt (): BigNumber {
    this.assert(this.red, 'redSqrt works only with red numbers')
    ; (this.red).verify1(this)
    return (this.red).sqrt(this)
  }

  /**
   * Find multiplicative inverse (reciprocal) in respect to reduction context.
   * The method works only on numbers that have a reduction context set.
   *
   * @method redInvm
   * @returns Returns a BigNumber that is multiplicative inverse in respect to the reduction context.
   * @throws Will throw an error if this number does not have a reduction context.
   *
   * @example
   * let a = new BigNumber('2345', 16);
   * a.red = someReductionContext;
   * let aInverse = a.redInvm();
   */
  redInvm (): BigNumber {
    this.assert(this.red, 'redInvm works only with red numbers')
    ; (this.red).verify1(this)
    return (this.red).invm(this)
  }

  /**
   * Find negative version of this number in respect to reduction context.
   * The method works only on numbers that have a reduction context set.
   *
   * @method redNeg
   * @returns Returns a BigNumber that is the negative version of this number in respect to the reduction context.
   * @throws Will throw an error if this number does not have a reduction context.
   *
   * @example
   * let a = new BigNumber('2345', 16);
   * a.red = someReductionContext;
   * let aNeg = a.redNeg();
   */
  redNeg (): BigNumber {
    this.assert(this.red, 'redNeg works only with red numbers')
    ; (this.red).verify1(this)
    return (this.red).neg(this)
  }

  /**
   * Raises this number to the power of 'num', in respect to reduction context.
   * Note that 'num' must not have a reduction context set.
   *
   * @method redPow
   * @param num - The exponent to raise this number to.
   * @returns Returns a BigNumber that is this number raised to the power of 'num', in respect to the reduction context.
   * @throws Will throw an error if this number does not have a reduction context or 'num' has a reduction context.
   *
   * @example
   * let a = new BigNumber(3);
   * a.red = someReductionContext;
   * let b = new BigNumber(3);
   * let result = a.redPow(b);  // equivalent to (a^b) mod red
   */
  redPow (num: BigNumber): BigNumber {
    this.assert((this.red != null) && (num.red == null), 'redPow(normalNum)')
    ; (this.red).verify1(this)
    return (this.red).pow(this, num)
  }

  /**
   * Creates a BigNumber from a hexadecimal string.
   *
   * @static
   * @method fromHex
   * @param hex - The hexadecimal string to create a BigNumber from.
   * @returns Returns a BigNumber created from the hexadecimal input string.
   *
   * @example
   * const exampleHex = 'a1b2c3';
   * const bigNumber = BigNumber.fromHex(exampleHex);
   */
  static fromHex (hex: string, endian?: 'little' | 'big'): BigNumber {
    if (endian === 'big') {
      return new BigNumber(hex, 16)
    } else {
      return new BigNumber(hex, 16, 'le')
    }
  }

  /**
   * Converts this BigNumber to a hexadecimal string.
   *
   * @method toHex
   * @param length - The minimum length of the hex string
   * @returns Returns a string representing the hexadecimal value of this BigNumber.
   *
   * @example
   * const bigNumber = new BigNumber(255);
   * const hex = bigNumber.toHex();
   */
  toHex (length: number = 0): string {
    return this.toString('hex', length * 2)
  }

  /**
   * Creates a BigNumber from a JSON-serialized string.
   *
   * @static
   * @method fromJSON
   * @param str - The JSON-serialized string to create a BigNumber from.
   * @returns Returns a BigNumber created from the JSON input string.
   *
   * @example
   * const serialized = '{"type":"BigNumber","hex":"a1b2c3"}';
   * const bigNumber = BigNumber.fromJSON(serialized);
   */
  static fromJSON (str: string): BigNumber {
    return new BigNumber(str)
  }

  /**
   * Creates a BigNumber from a number.
   *
   * @static
   * @method fromNumber
   * @param n - The number to create a BigNumber from.
   * @returns Returns a BigNumber equivalent to the input number.
   *
   * @example
   * const number = 1234;
   * const bigNumber = BigNumber.fromNumber(number);
   */
  static fromNumber (n: number): BigNumber {
    return new BigNumber(n)
  }

  /**
   * Creates a BigNumber from a string, considering an optional base.
   *
   * @static
   * @method fromString
   * @param str - The string to create a BigNumber from.
   * @param base - The base used for conversion. If not provided, base 10 is assumed.
   * @returns Returns a BigNumber equivalent to the string after conversion from the specified base.
   *
   * @example
   * const str = '1234';
   * const bigNumber = BigNumber.fromString(str, 16);
   */
  static fromString (str: string, base?: number | 'hex'): BigNumber {
    return new BigNumber(str, base)
  }

  /**
   * Creates a BigNumber from a signed magnitude number.
   *
   * @static
   * @method fromSm
   * @param num - The signed magnitude number to convert to a BigNumber.
   * @param endian - Defines endianess. If not provided, big endian is assumed.
   * @returns Returns a BigNumber equivalent to the signed magnitude number interpreted with specified endianess.
   *
   * @example
   * const num = [0x81]
   * const bigNumber = BigNumber.fromSm(num, { endian: 'little' }); // equivalent to BigNumber from '-1'
   */
  static fromSm (num: number[], endian: 'big' | 'little' = 'big'): BigNumber {
    let n = num
    if (num.length === 0) {
      return new BigNumber(0)
    }

    if (endian === 'little') {
      n = [...n]
      n = n.reverse()
    }

    if ((n[0] & 0x80) !== 0) {
      n = [...n]
      n[0] = n[0] & 0x7f
      return new BigNumber(n).neg()
    } else {
      return new BigNumber(n)
    }
  }

  /**
   * Converts this BigNumber to a signed magnitude number.
   *
   * @method toSm
   * @param endian - Defines endianess. If not provided, big endian is assumed.
   * @returns Returns an array equivalent to this BigNumber interpreted as a signed magnitude with specified endianess.
   *
   * @example
   * const bigNumber = new BigNumber(-1);
   * const num = bigNumber.toSm('little'); // [0x81]
   */
  toSm (endian: 'big' | 'little' = 'big'): number[] {
    let num: number[]
    if (this.cmpn(0) === -1) {
      num = this.neg().toArray()
      if ((num[0] & 0x80) !== 0) {
        num = [0x80, ...num]
      } else {
        num[0] = num[0] | 0x80
      }
    } else {
      num = this.toArray()
      if ((num[0] & 0x80) !== 0) {
        num = [0x00, ...num]
      }
    }

    if (num.length === 1 && num[0] === 0) {
      num = []
    }

    if (endian === 'little') {
      num = num.reverse()
    }

    return num
  }

  /**
   * Creates a BigNumber from a number representing the "bits" value in a block header.
   *
   * @static
   * @method fromBits
   * @param bits - The number representing the bits value in a block header.
   * @param strict - If true, an error is thrown if the number has negative bit set.
   * @returns Returns a BigNumber equivalent to the "bits" value in a block header.
   * @throws Will throw an error if `strict` is `true` and the number has negative bit set.
   *
   * @example
   * const bits = 0x1d00ffff;
   * const bigNumber = BigNumber.fromBits(bits);
   */
  static fromBits (bits: number, strict: boolean = false): BigNumber {
    // Convert to signed 32-bit value manually without using Buffer
    bits = (bits & 0x80000000) ? bits - 0x100000000 : bits
    if (strict && (bits & 0x00800000) !== 0) {
      throw new Error('negative bit set')
    }
    const nsize = bits >> 24
    const nword = bits & 0x007fffff

    // Manually create the byte array (similar to the original buffer)
    let bytes = [
      (nword >> 24) & 0xFF,
      (nword >> 16) & 0xFF,
      (nword >> 8) & 0xFF,
      nword & 0xFF
    ]

    if (nsize <= 3) {
      bytes = bytes.slice(1, 1 + nsize) // remove the most significant byte(s) as necessary
    } else {
      // add trailing zeros (similar to the original buffer fill)
      for (let i = 0; i < nsize - 3; i++) {
        bytes.push(0)
      }
    }

    // Adjust for sign if the negative bit was set, and then convert array to BigNumber
    if ((bits & 0x00800000) !== 0) {
      return new BigNumber(bytes).neg()
    } else {
      return new BigNumber(bytes)
    }
  }

  /**
   * Converts this BigNumber to a number representing the "bits" value in a block header.
   *
   * @method toBits
   * @returns Returns a number equivalent to the "bits" value in a block header.
   *
   * @example
   * const bigNumber = new BigNumber(1);
   * const bits = bigNumber.toBits();
   */
  toBits (): number {
    let byteArray
    if (this.ltn(0)) {
      byteArray = this.neg().toArray('be')
    } else {
      byteArray = this.toArray('be')
    }

    // Ensure that the byte array is of a minimum size
    while (byteArray.length < 4) {
      byteArray.unshift(0)
    }

    // For the case where byteArray represents '00', the bits should be 0x00000000
    if (byteArray.every(byte => byte === 0)) {
      return 0x00000000
    }

    // Remove leading zeros from the byte array for further processing
    while (byteArray[0] === 0) {
      byteArray.shift()
    }

    let nsize = byteArray.length

    // We're interested in the first three bytes for the "nword"
    // or in smaller cases, what's available
    let nword = byteArray.slice(0, 3).reduce((acc, val) => (acc * 256) + val, 0)

    // Ensure we don't have the sign bit set initially
    if ((nword & 0x800000) !== 0) {
      // If the 24th bit is set, we're going to need one more byte to represent this number
      byteArray.unshift(0) // Unshift a zero byte to not change the actual number
      nsize += 1
      nword >>>= 8 // Shift right to make room for that byte
    }

    // Encode size and the 3 bytes into "nword"
    let bits = (nsize << 24) | nword

    if (this.ltn(0)) {
      // If the number is negative, set the 0x00800000 bit to indicate sign
      bits |= 0x00800000
    }

    return bits >>> 0 // Convert to unsigned 32-bit integer
  }

  /**
   * Creates a BigNumber from the format used in Bitcoin scripts.
   *
   * @static
   * @method fromScriptNum
   * @param num - The number in the format used in Bitcoin scripts.
   * @param requireMinimal - If true, non-minimally encoded values will throw an error.
   * @param maxNumSize - The maximum allowed size for the number. If not provided, defaults to 4.
   * @returns Returns a BigNumber equivalent to the number used in a Bitcoin script.
   * @throws Will throw an error if `requireMinimal` is `true` and the value is non-minimally encoded. Will throw an error if number length is greater than `maxNumSize`.
   *
   * @example
   * const num = [0x02, 0x01]
   * const bigNumber = BigNumber.fromScriptNum(num, true, 5)
   */
  static fromScriptNum (
    num: number[], requireMinimal?: boolean, maxNumSize?: number
  ): BigNumber {
    if (maxNumSize === undefined) {
      maxNumSize = Number.MAX_SAFE_INTEGER
    }
    if (num.length > maxNumSize) {
      throw new Error('script number overflow')
    }
    if (requireMinimal && num.length > 0) {
    // Check that the number is encoded with the minimum possible
    // number of bytes.
    //
    // If the most-significant-byte - excluding the sign bit - is zero
    // then we're not minimal. Note how this test also rejects the
    // negative-zero encoding, 0x80.
      if ((num[num.length - 1] & 0x7f) === 0) {
      // One exception: if there's more than one byte and the most
      // significant bit of the second-most-significant-byte is set
      // it would conflict with the sign bit. An example of this case
      // is +-255, which encode to 0xff00 and 0xff80 respectively.
      // (big-endian).
        if (num.length <= 1 || (num[num.length - 2] & 0x80) === 0) {
          throw new Error('non-minimally encoded script number')
        }
      }
    }
    return BigNumber.fromSm(num, 'little')
  }

  /**
   * Converts this BigNumber to a number in the format used in Bitcoin scripts.
   *
   * @method toScriptNum
   * @returns Returns the equivalent to this BigNumber as a Bitcoin script number.
   *
   * @example
   * const bigNumber = new BigNumber(258)
   * const num = bigNumber.toScriptNum() // equivalent to bigNumber.toSm('little')
   */
  toScriptNum (): number[] {
    return this.toSm('little')
  }
}
