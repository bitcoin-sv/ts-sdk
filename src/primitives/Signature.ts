import BigNumber from './BigNumber'
import PublicKey from './PublicKey'
import { verify } from './ECDSA'
import { sha256 } from './Hash'
import { toArray, toHex } from './utils'

export default class Signature {
  r: BigNumber
  s: BigNumber

  constructor (r: BigNumber, s: BigNumber) {
    this.r = r
    this.s = s
  }

  verify (msg: number[] | string, key: PublicKey, enc?: 'hex'): boolean {
    const msgHash = new BigNumber(sha256(msg, enc), 16)
    return verify(msgHash, this, key)
  }

  private rmPadding (buf: number[]): number[] {
    let i = 0
    const len = buf.length - 1
    while ((buf[i] === 0) && ((buf[i + 1] & 0x80) === 0) && i < len) {
      i++
    }
    if (i === 0) {
      return buf
    }
    return buf.slice(i)
  }

  static getLength (buf, p): number {
    const initial = buf[p.place++]
    if ((initial & 0x80) === 0) {
      return initial
    }
    const octetLen = initial & 0xf

    // Indefinite length or overflow
    if (octetLen === 0 || octetLen > 4) {
      throw new Error('Invalid DER entity length')
    }

    let val = 0
    let i, off
    for (i = 0, off = p.place; i < octetLen; i++, off++) {
      val <<= 8
      val |= buf[off]
      val >>>= 0
    }

    // Leading zeroes
    if (val <= 0x7f) {
      throw new Error('Invalid DER entity length')
    }

    p.place = off
    return val
  }

  static fromDER (data: number[] | string, enc?: 'hex'): Signature {
    class Position {
      place: number
      constructor () {
        this.place = 0
      }
    }
    data = toArray(data, enc)
    const p = new Position()
    if (data[p.place++] !== 0x30) {
      throw new Error('Signature DER must start with 0x30')
    }
    const len = this.getLength(data, p)
    if ((len + p.place) !== data.length) {
      throw new Error('Signature DER invalid')
    }
    if (data[p.place++] !== 0x02) {
      throw new Error('Signature DER invalid')
    }
    const rlen = this.getLength(data, p)
    let r = data.slice(p.place, rlen + p.place)
    p.place += rlen
    if (data[p.place++] !== 0x02) {
      throw new Error('Signature DER invalid')
    }
    const slen = this.getLength(data, p)
    if (data.length !== slen + p.place) {
      throw new Error('Invalid R-length in signature DER')
    }
    let s = data.slice(p.place, slen + p.place)
    if (r[0] === 0) {
      if ((r[1] & 0x80) !== 0) {
        r = r.slice(1)
      } else {
        throw new Error('Invalid R-value in signature DER')
      }
    }
    if (s[0] === 0) {
      if ((s[1] & 0x80) !== 0) {
        s = s.slice(1)
      } else {
        throw new Error('Invalid S-value in signature DER')
      }
    }

    return new Signature(
      new BigNumber(r),
      new BigNumber(s)
    )
  }

  private constructLength (arr, len): number[] {
    if (len < 0x80) {
      arr.push(len)
      return
    }
    let octets = 1 + (Math.log(len) / Math.LN2 >>> 3)
    arr.push(octets | 0x80)
    while ((--octets) !== 0) {
      arr.push((len >>> (octets << 3)) & 0xff)
    }
    arr.push(len)
  }

  toDER (enc?: 'hex'): number[] | string {
    let r = this.r.toArray()
    let s = this.s.toArray()

    // Pad values
    if ((r[0] & 0x80) !== 0) { r = [0].concat(r) }
    // Pad values
    if ((s[0] & 0x80) !== 0) { s = [0].concat(s) }

    r = this.rmPadding(r)
    s = this.rmPadding(s)

    while ((s[0] === 0) && (s[1] & 0x80) === 0) {
      s = s.slice(1)
    }
    let arr = [0x02]
    this.constructLength(arr, r.length)
    arr = arr.concat(r)
    arr.push(0x02)
    this.constructLength(arr, s.length)
    const backHalf = arr.concat(s)
    let res = [0x30]
    this.constructLength(res, backHalf.length)
    res = res.concat(backHalf)
    if (enc === 'hex') {
      return toHex(res)
    } else {
      return res
    }
  }
}
