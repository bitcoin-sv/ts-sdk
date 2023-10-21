export const zero2 = (word: string): string => {
  if (word.length === 1) {
    return '0' + word
  } else {
    return word
  }
}

export const toHex = (msg: number[]): string => {
  let res = ''
  for (let i = 0; i < msg.length; i++) {
    res += zero2(msg[i].toString(16))
  }
  return res
}

export const toArray = (msg: any, enc?: 'hex' | 'utf8'): any[] => {
  if (Array.isArray(msg)) { return msg.slice() }
  if (!(msg as boolean)) { return [] }
  const res: any[] = []
  if (typeof msg !== 'string') {
    for (let i = 0; i < msg.length; i++) { res[i] = msg[i] | 0 }
    return res
  }
  if (enc === 'hex') {
    msg = msg.replace(/[^a-z0-9]+/ig, '')
    if (msg.length % 2 !== 0) { msg = '0' + (msg as string) }
    for (let i = 0; i < msg.length; i += 2) {
      res.push(
        parseInt((msg[i] as string) + (msg[i + 1] as string), 16)
      )
    }
  } else {
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

const toUTF8 = (arr: number[]): string => {
  let result = ''

  for (let i = 0; i < arr.length; i++) {
    const byte = arr[i]

    if (byte <= 0x7F) { // 1-byte sequence (0xxxxxxx)
      result += String.fromCharCode(byte)
    } else if (byte >= 0xC0 && byte <= 0xDF) { // 2-byte sequence (110xxxxx 10xxxxxx)
      const byte2 = arr[++i]
      const codePoint = ((byte & 0x1F) << 6) | (byte2 & 0x3F)
      result += String.fromCharCode(codePoint)
    } else if (byte >= 0xE0 && byte <= 0xEF) { // 3-byte sequence (1110xxxx 10xxxxxx 10xxxxxx)
      const byte2 = arr[++i]
      const byte3 = arr[++i]
      const codePoint = ((byte & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F)
      result += String.fromCharCode(codePoint)
    } else if (byte >= 0xF0 && byte <= 0xF7) { // 4-byte sequence (11110xxx 10xxxxxx 10xxxxxx 10xxxxxx)
      const byte2 = arr[++i]
      const byte3 = arr[++i]
      const byte4 = arr[++i]
      const codePoint = ((byte & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F)
      // UTF-16 surrogate pair
      const surrogate1 = 0xD800 + ((codePoint - 0x10000) >> 10)
      const surrogate2 = 0xDC00 + ((codePoint - 0x10000) & 0x3FF)
      result += String.fromCharCode(surrogate1, surrogate2)
    }
  }

  return result
}

export const encode = (arr: number[], enc?: 'hex' | 'utf8'): string | number[] => {
  switch (enc) {
    case 'hex':
      return toHex(arr)
    case 'utf8':
      return toUTF8(arr)
    default:
      return arr
  }
}
