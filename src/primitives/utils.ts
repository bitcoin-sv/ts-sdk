import BigNumber from './BigNumber.js'
import { hash256 } from './Hash.js'

/**
 * Prepends a '0' to an odd character length word to ensure it has an even number of characters.
 * @param {string} word - The input word.
 * @returns {string} - The word with a leading '0' if it's an odd character length; otherwise, the original word.
 */
export const zero2 = (word: string): string => {
  if (word.length % 2 === 1) {
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
  for (const num of msg) {
    res += zero2(num.toString(16))
  }
  return res
}

/**
 * Converts various message formats into an array of numbers.
 * Supports arrays, hexadecimal strings, base64 strings, and UTF-8 strings.
 *
 * @param {any} msg - The input message (array or string).
 * @param {('hex' | 'utf8' | 'base64')} enc - Specifies the string encoding, if applicable.
 * @returns {any[]} - Array representation of the input.
 */
export const toArray = (msg: any, enc?: 'hex' | 'utf8' | 'base64'): any[] => {
  if (Array.isArray(msg)) return msg.slice()
  if (msg === undefined) return []

  if (typeof msg !== 'string') {
    return Array.from(msg, (item: any) => item | 0)
  }

  switch (enc) {
    case 'hex':
      return hexToArray(msg)
    case 'base64':
      return base64ToArray(msg)
    default:
      return utf8ToArray(msg)
  }
}

const hexToArray = (msg: string): number[] => {
  msg = msg.replace(/[^a-z0-9]+/gi, '')
  if (msg.length % 2 !== 0) msg = '0' + msg
  const res: number[] = []
  for (let i = 0; i < msg.length; i += 2) {
    res.push(parseInt(msg[i] + msg[i + 1], 16))
  }
  return res
}

const base64ToArray = (msg: string): number[] => {
  const base64Chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const result: number[] = []
  let currentBit = 0
  let currentByte = 0

  for (const char of msg.replace(/=+$/, '')) {
    currentBit = (currentBit << 6) | base64Chars.indexOf(char)
    currentByte += 6

    if (currentByte >= 8) {
      currentByte -= 8
      result.push((currentBit >> currentByte) & 0xff)
      currentBit &= (1 << currentByte) - 1
    }
  }

  return result
}

/**
 * Encodes a string into an array of bytes representing its UTF-8 encoding.
 * Any lone surrogates are replaced with the Unicode replacement character (U+FFFD).
 *
 * @param str - The string to encode.
 * @returns An array of numbers, each representing a byte in the UTF-8 encoded string.
 */
function utf8ToArray (str: string): number[] {
  const result: number[] = []

  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i)
    if (cp === undefined) {
      // Should never be out of range.
      throw new Error(`Index out of range: ${i}`)
    }
    let codePoint = cp

    if (codePoint > 0xFFFF) {
      // Valid surrogate pair => skip the next code unit because codePointAt
      // has already combined them into a single code point.
      i++
    } else {
      // Check if codePoint is a lone (unpaired) high surrogate or low surrogate.
      if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
        // Replace with the replacement character (U+FFFD).
        codePoint = 0xFFFD
      }
    }

    // Encode according to the UTF-8 standard
    if (codePoint <= 0x7F) {
      result.push(codePoint)
    } else if (codePoint <= 0x7FF) {
      result.push(
        0xC0 | (codePoint >> 6),
        0x80 | (codePoint & 0x3F)
      )
    } else if (codePoint <= 0xFFFF) {
      result.push(
        0xE0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3F),
        0x80 | (codePoint & 0x3F)
      )
    } else {
      result.push(
        0xF0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3F),
        0x80 | ((codePoint >> 6) & 0x3F),
        0x80 | (codePoint & 0x3F)
      )
    }
  }

  return result
}

/**
 * Converts an array of numbers to a UTF-8 encoded string.
 * @param {number[]} arr - The input array of numbers.
 * @returns {string} - The UTF-8 encoded string.
 */
export const toUTF8 = (arr: number[]): string => {
  let result = ''
  let skip = 0

  for (let i = 0; i < arr.length; i++) {
    const byte = arr[i]

    // this byte is part of a multi-byte sequence, skip it
    // added to avoid modifying i within the loop which is considered unsafe.
    if (skip > 0) {
      skip--
      continue
    }

    // 1-byte sequence (0xxxxxxx)
    if (byte <= 0x7f) {
      result += String.fromCharCode(byte)
    } else if (byte >= 0xc0 && byte <= 0xdf) {
      // 2-byte sequence (110xxxxx 10xxxxxx)
      const byte2 = arr[i + 1]
      skip = 1
      const codePoint = ((byte & 0x1f) << 6) | (byte2 & 0x3f)
      result += String.fromCharCode(codePoint)
    } else if (byte >= 0xe0 && byte <= 0xef) {
      // 3-byte sequence (1110xxxx 10xxxxxx 10xxxxxx)
      const byte2 = arr[i + 1]
      const byte3 = arr[i + 2]
      skip = 2
      const codePoint =
        ((byte & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f)
      result += String.fromCharCode(codePoint)
    } else if (byte >= 0xf0 && byte <= 0xf7) {
      // 4-byte sequence (11110xxx 10xxxxxx 10xxxxxx 10xxxxxx)
      const byte2 = arr[i + 1]
      const byte3 = arr[i + 2]
      const byte4 = arr[i + 3]
      skip = 3
      const codePoint =
        ((byte & 0x07) << 18) |
        ((byte2 & 0x3f) << 12) |
        ((byte3 & 0x3f) << 6) |
        (byte4 & 0x3f)

      // Convert to UTF-16 surrogate pair
      const surrogate1 = 0xd800 + ((codePoint - 0x10000) >> 10)
      const surrogate2 = 0xdc00 + ((codePoint - 0x10000) & 0x3ff)
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
export const encode = (
  arr: number[],
  enc?: 'hex' | 'utf8'
): string | number[] => {
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

/**
 * Converts an array of bytes (each between 0 and 255) into a base64 encoded string.
 *
 * @param {number[]} byteArray - An array of numbers where each number is a byte (0-255).
 * @returns {string} The base64 encoded string.
 *
 * @example
 * const bytes = [72, 101, 108, 108, 111]; // Represents the string "Hello"
 * console.log(toBase64(bytes)); // Outputs: SGVsbG8=
 */
export function toBase64 (byteArray: number[]): string {
  const base64Chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let result = ''
  let i: number

  for (i = 0; i < byteArray.length; i += 3) {
    const byte1 = byteArray[i]
    const byte2 = i + 1 < byteArray.length ? byteArray[i + 1] : 0
    const byte3 = i + 2 < byteArray.length ? byteArray[i + 2] : 0

    const encoded1 = byte1 >> 2
    const encoded2 = ((byte1 & 0x03) << 4) | (byte2 >> 4)
    const encoded3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6)
    const encoded4 = byte3 & 0x3f

    result += base64Chars.charAt(encoded1) + base64Chars.charAt(encoded2)
    result += i + 1 < byteArray.length ? base64Chars.charAt(encoded3) : '='
    result += i + 2 < byteArray.length ? base64Chars.charAt(encoded4) : '='
  }

  return result
}

const base58chars =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/**
 * Converts a string from base58 to a binary array
 * @param str - The string representation
 * @returns The binary representation
 */
export const fromBase58 = (str: string): number[] => {
  if (str === '' || typeof str !== 'string') {
    throw new Error(`Expected base58 string but got “${str}”`)
  }
  const match: string[] | null = str.match(/[IOl0]/gmu)

  if (match !== null) {
    throw new Error(`Invalid base58 character “${match.join('')}”`)
  }
  const lz = str.match(/^1+/gmu)
  const psz: number = (lz !== null) ? lz[0].length : 0
  const size = ((str.length - psz) * (Math.log(58) / Math.log(256)) + 1) >>> 0

  const uint8 = new Uint8Array([
    ...new Uint8Array(psz),
    ...(
      str.match(/./gmu) ?? [] // ✅ Safe Fix: If null, use []
    )
      .map((i) => base58chars.indexOf(i))
      .reduce((acc, i) => {
        acc = acc.map((j) => {
          const x = j * 58 + i
          i = x >> 8
          return x
        })
        return acc
      }, new Uint8Array(size))
      .reverse()
      .filter(
        (
          (lastValue) => (value) =>
            // @ts-expect-error
            (lastValue = lastValue || value)
        )(false)
      )
  ])
  return [...uint8]
}

/**
 * Converts a binary array into a base58 string
 * @param bin - The binary array to convert to base58
 * @returns The base58 string representation
 */
export const toBase58 = (bin: number[]): string => {
  const base58Map = Array(256).fill(-1)
  for (let i = 0; i < base58chars.length; ++i) {
    base58Map[base58chars.charCodeAt(i)] = i
  }

  const result: number[] = []

  for (const byte of bin) {
    let carry = byte
    for (let j = 0; j < result.length; ++j) {
      const x = (base58Map[result[j]] << 8) + carry
      result[j] = base58chars.charCodeAt(x % 58)
      carry = (x / 58) | 0
    }
    while (carry !== 0) {
      result.push(base58chars.charCodeAt(carry % 58))
      carry = (carry / 58) | 0
    }
  }

  for (const byte of bin) {
    if (byte !== 0) break
    else result.push('1'.charCodeAt(0))
  }

  result.reverse()

  return String.fromCharCode(...result)
}

/**
 * Converts a binary array into a base58check string with a checksum
 * @param bin - The binary array to convert to base58check
 * @returns The base58check string representation
 */
export const toBase58Check = (bin: number[], prefix: number[] = [0]): string => {
  let hash = hash256([...prefix, ...bin])
  hash = [...prefix, ...bin, ...hash.slice(0, 4)]
  return toBase58(hash)
}

/**
 * Converts a base58check string into a binary array after validating the checksum
 * @param str - The base58check string to convert to binary
 * @param enc - If hex, the return values will be hex strings, arrays of numbers otherwise
 * @param prefixLength - The length of the prefix. Optional, defaults to 1.
 * @returns The binary array representation
 */
export const fromBase58Check = (
  str: string,
  enc?: 'hex',
  prefixLength: number = 1
): { data: number[] | string, prefix: number[] | string } => {
  const bin = fromBase58(str)
  let prefix: string | number[] = bin.slice(0, prefixLength)
  let data: string | number[] = bin.slice(prefixLength, -4)
  let hash = [...prefix, ...data]
  hash = hash256(hash)
  bin.slice(-4).forEach((check, index) => {
    if (check !== hash[index]) {
      throw new Error('Invalid checksum')
    }
  })
  if (enc === 'hex') {
    prefix = toHex(prefix)
    data = toHex(data)
  }
  return { prefix, data }
}

export class Writer {
  public bufs: number[][]

  constructor (bufs?: number[][]) {
    this.bufs = bufs !== undefined ? bufs : []
  }

  getLength (): number {
    let len = 0
    for (const buf of this.bufs) {
      len = len + buf.length
    }
    return len
  }

  toArray (): number[] {
    const totalLength = this.getLength()
    const ret = new Array(totalLength)
    let offset = 0
    for (const buf of this.bufs) {
      for (const value of buf) {
        ret[offset++] = value
      }
    }
    return ret
  }

  write (buf: number[]): this {
    this.bufs.push(buf)
    return this
  }

  writeReverse (buf: number[]): this {
    const buf2: number[] = new Array(buf.length)
    for (let i = 0; i < buf2.length; i++) {
      buf2[i] = buf[buf.length - 1 - i]
    }
    this.bufs.push(buf2)
    return this
  }

  writeUInt8 (n: number): this {
    const buf = new Array(1)
    buf[0] = n
    this.write(buf)
    return this
  }

  writeInt8 (n: number): this {
    const buf = new Array(1)
    buf[0] = n & 0xff
    this.write(buf)
    return this
  }

  writeUInt16BE (n: number): this {
    this.bufs.push([
      (n >> 8) & 0xff, // shift right 8 bits to get the high byte
      n & 0xff // low byte is just the last 8 bits
    ])
    return this
  }

  writeInt16BE (n: number): this {
    return this.writeUInt16BE(n & 0xffff) // Mask with 0xFFFF to get the lower 16 bits
  }

  writeUInt16LE (n: number): this {
    this.bufs.push([
      n & 0xff, // low byte is just the last 8 bits
      (n >> 8) & 0xff // shift right 8 bits to get the high byte
    ])
    return this
  }

  writeInt16LE (n: number): this {
    return this.writeUInt16LE(n & 0xffff) // Mask with 0xFFFF to get the lower 16 bits
  }

  writeUInt32BE (n: number): this {
    this.bufs.push([
      (n >> 24) & 0xff, // highest byte
      (n >> 16) & 0xff,
      (n >> 8) & 0xff,
      n & 0xff // lowest byte
    ])
    return this
  }

  writeInt32BE (n: number): this {
    return this.writeUInt32BE(n >>> 0) // Using unsigned right shift to handle negative numbers
  }

  writeUInt32LE (n: number): this {
    this.bufs.push([
      n & 0xff, // lowest byte
      (n >> 8) & 0xff,
      (n >> 16) & 0xff,
      (n >> 24) & 0xff // highest byte
    ])
    return this
  }

  writeInt32LE (n: number): this {
    return this.writeUInt32LE(n >>> 0) // Using unsigned right shift to handle negative numbers
  }

  writeUInt64BEBn (bn: BigNumber): this {
    const buf = bn.toArray('be', 8)
    this.write(buf)
    return this
  }

  writeUInt64LEBn (bn: BigNumber): this {
    const buf = bn.toArray('be', 8)
    this.writeReverse(buf)
    return this
  }

  writeUInt64LE (n: number): this {
    const buf = new BigNumber(n).toArray('be', 8)
    this.writeReverse(buf)
    return this
  }

  writeVarIntNum (n: number): this {
    const buf = Writer.varIntNum(n)
    this.write(buf)
    return this
  }

  writeVarIntBn (bn: BigNumber): this {
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
        n & 0xff, // low byte
        (n >> 8) & 0xff // high byte
      ]
    } else if (n < 0x100000000) {
      // 254 followed by the number in little-endian format
      buf = [
        254, // 0xfe
        n & 0xff,
        (n >> 8) & 0xff,
        (n >> 16) & 0xff,
        (n >> 24) & 0xff
      ]
    } else {
      // 255 followed by the number in little-endian format
      // Since JavaScript bitwise operations work on 32 bits, we need to handle 64-bit numbers in two parts
      const low = n & 0xffffffff
      const high = Math.floor(n / 0x100000000) & 0xffffffff
      buf = [
        255, // 0xff
        low & 0xff,
        (low >> 8) & 0xff,
        (low >> 16) & 0xff,
        (low >> 24) & 0xff,
        high & 0xff,
        (high >> 8) & 0xff,
        (high >> 16) & 0xff,
        (high >> 24) & 0xff
      ]
    }
    return buf
  }

  static varIntBn (bn: BigNumber): number[] {
    let buf: number[]
    if (bn.ltn(253)) {
      const n = bn.toNumber()
      // No need for bitwise operation as the value is within a byte's range
      buf = [n]
    } else if (bn.ltn(0x10000)) {
      const n = bn.toNumber()
      // Value fits in a uint16
      buf = [253, n & 0xff, (n >> 8) & 0xff]
    } else if (bn.lt(new BigNumber(0x100000000))) {
      const n = bn.toNumber()
      // Value fits in a uint32
      buf = [
        254,
        n & 0xff,
        (n >> 8) & 0xff,
        (n >> 16) & 0xff,
        (n >> 24) & 0xff
      ]
    } else {
      const bw = new Writer()
      bw.writeUInt8(255)
      bw.writeUInt64LEBn(bn)
      buf = bw.toArray()
    }
    return buf
  }
}

export class Reader {
  public bin: number[]
  public pos: number

  constructor (bin: number[] = [], pos: number = 0) {
    this.bin = bin
    this.pos = pos
  }

  public eof (): boolean {
    return this.pos >= this.bin.length
  }

  public read (len = this.bin.length): number[] {
    const start = this.pos
    const end = this.pos + len
    this.pos = end
    return this.bin.slice(start, end)
  }

  public readReverse (len = this.bin.length): number[] {
    const buf2 = new Array(len)
    for (let i = 0; i < len; i++) {
      buf2[i] = this.bin[this.pos + len - 1 - i]
    }
    this.pos += len
    return buf2
  }

  public readUInt8 (): number {
    const val = this.bin[this.pos]
    this.pos += 1
    return val
  }

  public readInt8 (): number {
    const val = this.bin[this.pos]
    this.pos += 1
    // If the sign bit is set, convert to negative value
    return (val & 0x80) !== 0 ? val - 0x100 : val
  }

  public readUInt16BE (): number {
    const val = (this.bin[this.pos] << 8) | this.bin[this.pos + 1]
    this.pos += 2
    return val
  }

  public readInt16BE (): number {
    const val = this.readUInt16BE()
    // If the sign bit is set, convert to negative value
    return (val & 0x8000) !== 0 ? val - 0x10000 : val
  }

  public readUInt16LE (): number {
    const val = this.bin[this.pos] | (this.bin[this.pos + 1] << 8)
    this.pos += 2
    return val
  }

  public readInt16LE (): number {
    const val = this.readUInt16LE()
    // If the sign bit is set, convert to negative value
    const x = (val & 0x8000) !== 0 ? val - 0x10000 : val
    return x
  }

  public readUInt32BE (): number {
    const val =
      this.bin[this.pos] * 0x1000000 + // Shift the first byte by 24 bits
      ((this.bin[this.pos + 1] << 16) | // Shift the second byte by 16 bits
        (this.bin[this.pos + 2] << 8) | // Shift the third byte by 8 bits
        this.bin[this.pos + 3]) // The fourth byte
    this.pos += 4
    return val
  }

  public readInt32BE (): number {
    const val = this.readUInt32BE()
    // If the sign bit is set, convert to negative value
    return (val & 0x80000000) !== 0 ? val - 0x100000000 : val
  }

  public readUInt32LE (): number {
    const val =
      (this.bin[this.pos] |
        (this.bin[this.pos + 1] << 8) |
        (this.bin[this.pos + 2] << 16) |
        (this.bin[this.pos + 3] << 24)) >>>
      0
    this.pos += 4
    return val
  }

  public readInt32LE (): number {
    const val = this.readUInt32LE()
    // Explicitly check if the sign bit is set and then convert to a negative value
    return (val & 0x80000000) !== 0 ? val - 0x100000000 : val
  }

  public readUInt64BEBn (): BigNumber {
    const bin = this.bin.slice(this.pos, this.pos + 8)
    const bn = new BigNumber(bin)
    this.pos = this.pos + 8
    return bn
  }

  public readUInt64LEBn (): BigNumber {
    const bin = this.readReverse(8)
    const bn = new BigNumber(bin)
    return bn
  }

  public readVarIntNum (): number {
    const first = this.readUInt8()
    let bn: BigNumber
    switch (first) {
      case 0xfd:
        return this.readUInt16LE()
      case 0xfe:
        return this.readUInt32LE()
      case 0xff:
        bn = this.readUInt64LEBn()
        if (bn.lte(new BigNumber(2).pow(new BigNumber(53)))) {
          return bn.toNumber()
        } else {
          throw new Error(
            'number too large to retain precision - use readVarIntBn'
          )
        }
      default:
        return first
    }
  }

  public readVarInt (): number[] {
    const first = this.bin[this.pos]
    switch (first) {
      case 0xfd:
        return this.read(1 + 2)
      case 0xfe:
        return this.read(1 + 4)
      case 0xff:
        return this.read(1 + 8)
      default:
        return this.read(1)
    }
  }

  public readVarIntBn (): BigNumber {
    const first = this.readUInt8()
    switch (first) {
      case 0xfd:
        return new BigNumber(this.readUInt16LE())
      case 0xfe:
        return new BigNumber(this.readUInt32LE())
      case 0xff:
        return this.readUInt64LEBn()
      default:
        return new BigNumber(first)
    }
  }
}

export const minimallyEncode = (buf: number[]): number[] => {
  if (buf.length === 0) {
    return buf
  }

  // If the last byte is not 0x00 or 0x80, we are minimally encoded.
  const last = buf[buf.length - 1]
  if ((last & 0x7f) !== 0) {
    return buf
  }

  // If the script is one byte long, then we have a zero, which encodes as an
  // empty array.
  if (buf.length === 1) {
    return []
  }

  // If the next byte has it sign bit set, then we are minimaly encoded.
  if ((buf[buf.length - 2] & 0x80) !== 0) {
    return buf
  }

  // We are not minimally encoded, we need to figure out how much to trim.
  for (let i = buf.length - 1; i > 0; i--) {
    // We found a non zero byte, time to encode.
    if (buf[i - 1] !== 0) {
      if ((buf[i - 1] & 0x80) !== 0) {
        // We found a byte with it sign bit set so we need one more
        // byte.
        buf[i] = last
        return buf.slice(0, i + 1)
      } else {
        // the sign bit is clear, we can use it.
        buf[i - 1] |= last
        return buf.slice(0, i)
      }
    }
  }

  // If we found the whole thing is zeros, then we have a zero.
  return []
}
