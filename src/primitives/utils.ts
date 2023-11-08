import BigNumber from './BigNumber.js'

/**
 * Appends a '0' to a single-character word to ensure it has two characters.
 * @param {string} word - The input word.
 * @returns {string} - The word with a leading '0' if it's a single character; otherwise, the original word.
 */
export const zero2 = (word: string): string => {
  if (word.length === 1) {
    return '0' + word
  } else {
    return word
  }
}

/**
 * Converts an array of numbers to a hexadecimal string representation.
 * @param {number[]} msg - The input array of numbers.
 * @returns {string} - The hexadecimal string representation of the input array.
 */
export const toHex = (msg: number[]): string => {
  let res = ''
  for (let i = 0; i < msg.length; i++) {
    res += zero2(msg[i].toString(16))
  }
  return res
}

/**
 * Converts various message formats into an array of numbers.
 * Supports arrays, hexadecimal strings, and UTF-8 strings.
 *
 * @param {any} msg - The input message (array or string).
 * @param {('hex' | 'utf8')} enc - Specifies the string encoding, if applicable.
 * @returns {any[]} - Array representation of the input.
 */
export const toArray = (msg: any, enc?: 'hex' | 'utf8'): any[] => {
  // Return a copy if already an array
  if (Array.isArray(msg)) { return msg.slice() }

  // Return empty array for falsy values
  if (!(msg as boolean)) { return [] }
  const res: any[] = []

  // Convert non-string messages to numbers
  if (typeof msg !== 'string') {
    for (let i = 0; i < msg.length; i++) { res[i] = msg[i] | 0 }
    return res
  }

  // Handle hexadecimal encoding
  if (enc === 'hex') {
    msg = msg.replace(/[^a-z0-9]+/ig, '')
    if (msg.length % 2 !== 0) { msg = '0' + (msg as string) }
    for (let i = 0; i < msg.length; i += 2) {
      res.push(
        parseInt((msg[i] as string) + (msg[i + 1] as string), 16)
      )
    }
  } else {
    // Handle UTF-8 encoding
    for (let i = 0; i < msg.length; i++) {
      const c = msg.charCodeAt(i)
      const hi = c >> 8
      const lo = c & 0xff
      if (hi as unknown as boolean) {
        res.push(hi, lo)
      } else {
        res.push(lo)
      }
    }
  }
  return res
}

/**
 * Converts an array of numbers to a UTF-8 encoded string.
 * @param {number[]} arr - The input array of numbers.
 * @returns {string} - The UTF-8 encoded string.
 */
const toUTF8 = (arr: number[]): string => {
  let result = ''

  for (let i = 0; i < arr.length; i++) {
    const byte = arr[i]

    // 1-byte sequence (0xxxxxxx)
    if (byte <= 0x7F) {
      result += String.fromCharCode(byte)
    }
    // 2-byte sequence (110xxxxx 10xxxxxx)
    else if (byte >= 0xC0 && byte <= 0xDF) {
      const byte2 = arr[++i]
      const codePoint = ((byte & 0x1F) << 6) | (byte2 & 0x3F)
      result += String.fromCharCode(codePoint)
    }
    // 3-byte sequence (1110xxxx 10xxxxxx 10xxxxxx)
    else if (byte >= 0xE0 && byte <= 0xEF) {
      const byte2 = arr[++i]
      const byte3 = arr[++i]
      const codePoint = ((byte & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F)
      result += String.fromCharCode(codePoint)
    }
    // 4-byte sequence (11110xxx 10xxxxxx 10xxxxxx 10xxxxxx)
    else if (byte >= 0xF0 && byte <= 0xF7) {
      const byte2 = arr[++i]
      const byte3 = arr[++i]
      const byte4 = arr[++i]
      const codePoint = ((byte & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F)

      // Convert to UTF-16 surrogate pair
      const surrogate1 = 0xD800 + ((codePoint - 0x10000) >> 10)
      const surrogate2 = 0xDC00 + ((codePoint - 0x10000) & 0x3FF)
      result += String.fromCharCode(surrogate1, surrogate2)
    }
  }

  return result
}

/**
 * Encodes an array of numbers into a specified encoding ('hex' or 'utf8'). If no encoding is provided, returns the original array.
 * @param {number[]} arr - The input array of numbers.
 * @param {('hex' | 'utf8')} enc - The desired encoding.
 * @returns {string | number[]} - The encoded message as a string (for 'hex' and 'utf8') or the original array.
 */
export const encode = (arr: number[], enc?: 'hex' | 'utf8'): string | number[] => {
  switch (enc) {
    case 'hex':
      return toHex(arr)
    case 'utf8':
      return toUTF8(arr)
    // If no encoding is provided, return the original array
    default:
      return arr
  }
}

export class Writer {
  public bufs: number[][]

  constructor (bufs?: number[][]) {
    this.bufs = bufs || []
  }

  getLength (): number {
    let len = 0
    for (const i in this.bufs) {
      const buf = this.bufs[i]
      len = len + buf.length
    }
    return len
  }

  toArray(): number[] {
    let ret = []
    for (const x of this.bufs) {
      ret = [...ret, ...x]
    }
    return ret
  }

  write (buf: number[]): Writer {
    this.bufs.push(buf)
    return this
  }

  writeReverse (buf: number[]): Writer {
    const buf2: number[] = new Array(buf.length)
    for (let i = 0; i < buf2.length; i++) {
      buf2[i] = buf[buf.length - 1 - i]
    }
    this.bufs.push(buf2)
    return this
  }

  writeUInt8 (n: number): Writer {
    const buf = new Array(1)
    buf[0] = n
    this.write(buf)
    return this
  }

  writeInt8 (n: number): Writer {
    const buf = new Array(1)
    buf[0] = n & 0xFF
    this.write(buf)
    return this
  }

  writeUInt16BE (n: number): Writer {
    this.bufs.push([
      (n >> 8) & 0xFF, // shift right 8 bits to get the high byte
      n & 0xFF // low byte is just the last 8 bits
    ])
    return this
  }

  writeInt16BE (n: number): Writer {
    return this.writeUInt16BE(n & 0xFFFF) // Mask with 0xFFFF to get the lower 16 bits
  }

  writeUInt16LE (n: number): Writer {
    this.bufs.push([
      n & 0xFF, // low byte is just the last 8 bits
      (n >> 8) & 0xFF // shift right 8 bits to get the high byte
    ])
    return this
  }

  writeInt16LE (n: number): Writer {
    return this.writeUInt16LE(n & 0xFFFF) // Mask with 0xFFFF to get the lower 16 bits
  }

  writeUInt32BE (n: number): Writer {
    this.bufs.push([
      (n >> 24) & 0xFF, // highest byte
      (n >> 16) & 0xFF,
      (n >> 8) & 0xFF,
      n & 0xFF // lowest byte
    ])
    return this
  }

  writeInt32BE (n: number): Writer {
    return this.writeUInt32BE(n >>> 0) // Using unsigned right shift to handle negative numbers
  }

  writeUInt32LE (n: number): Writer {
    this.bufs.push([
      n & 0xFF, // lowest byte
      (n >> 8) & 0xFF,
      (n >> 16) & 0xFF,
      (n >> 24) & 0xFF // highest byte
    ])
    return this
  }

  writeInt32LE (n: number): Writer {
    return this.writeUInt32LE(n >>> 0) // Using unsigned right shift to handle negative numbers
  }

  writeUInt64BEBn (bn: BigNumber): Writer {
    const buf = bn.toArray('be', 8)
    this.write(buf)
    return this
  }

  writeUInt64LEBn (bn: BigNumber): Writer {
    const buf = bn.toArray('be', 8)
    this.writeReverse(buf)
    return this
  }

  writeVarIntNum (n: number): Writer {
    const buf = Writer.varIntNum(n)
    this.write(buf)
    return this
  }

  writeVarIntBn (bn: BigNumber): Writer {
    const buf = Writer.varIntBn(bn)
    this.write(buf)
    return this
  }

  static varIntNum (n: number): number[] {
    let buf: number[]
    if (n < 253) {
      buf = [n] // 1 byte
    } else if (n < 0x10000) {
      // 253 followed by the number in little-endian format
      buf = [
        253, // 0xfd
        n & 0xFF, // low byte
        (n >> 8) & 0xFF // high byte
      ]
    } else if (n < 0x100000000) {
      // 254 followed by the number in little-endian format
      buf = [
        254, // 0xfe
        n & 0xFF,
        (n >> 8) & 0xFF,
        (n >> 16) & 0xFF,
        (n >> 24) & 0xFF
      ]
    } else {
      // 255 followed by the number in little-endian format
      // Since JavaScript bitwise operations work on 32 bits, we need to handle 64-bit numbers in two parts
      const low = n & 0xFFFFFFFF
      const high = Math.floor(n / 0x100000000) & 0xFFFFFFFF
      buf = [
        255, // 0xff
        low & 0xFF,
        (low >> 8) & 0xFF,
        (low >> 16) & 0xFF,
        (low >> 24) & 0xFF,
        high & 0xFF,
        (high >> 8) & 0xFF,
        (high >> 16) & 0xFF,
        (high >> 24) & 0xFF
      ]
    }
    return buf
  }

  static varIntBn (bn: BigNumber): number[] {
    let buf: number[]
    const n = bn.toNumber()
    if (n < 253) {
      // No need for bitwise operation as the value is within a byte's range
      buf = [n]
    } else if (n < 0x10000) {
      // Value fits in a uint16
      buf = [253, n & 0xFF, (n >> 8) & 0xFF]
    } else if (n < 0x100000000) {
      // Value fits in a uint32
      buf = [254, n & 0xFF, (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF]
    } else {
      const bw = new Writer()
      bw.writeUInt8(255)
      bw.writeUInt64LEBn(bn)
      buf = bw.toArray()
    }
    return buf
  }
}
