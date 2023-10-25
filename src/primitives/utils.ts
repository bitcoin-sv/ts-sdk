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
