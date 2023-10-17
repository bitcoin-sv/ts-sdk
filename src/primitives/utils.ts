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

export const encode = (arr: number[], enc?: 'hex'): string | number[] => {
  if (enc === 'hex') {
    return toHex(arr)
  } else {
    return arr
  }
}
