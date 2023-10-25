import BigNumber from './BigNumber.js'
import PublicKey from './PublicKey.js'
import { verify } from './ECDSA.js'
import { sha256 } from './Hash.js'
import { toArray, toHex } from './utils.js'

/**
 * Represents a digital signature.
 *
 * A digital signature is a mathematical scheme for verifying the authenticity of
 * digital messages or documents. In many scenarios, it is equivalent to a handwritten signature or stamped seal.
 * The signature pair (R, S) corresponds to the raw ECDSA ([Elliptic Curve Digital Signature Algorithm](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm)) signature.
 * Signatures are often serialized into a format known as '[DER encoding](https://en.wikipedia.org/wiki/X.690#DER_encoding)' for transmission.
 *
 * @class Signature
 */
export default class Signature {
  /**
   * @property Represents the "r" component of the digital signature
   */
  r: BigNumber

  /**
   * @property Represents the "s" component of the digital signature
   */
  s: BigNumber

  /**
   * Takes an array of numbers or a string and returns a new Signature instance.
   * This method will throw an error if the DER encoding is invalid.
   * If a string is provided, it is assumed to represent a hexadecimal sequence.
   *
   * @static
   * @method fromDER
   * @param data - The sequence to decode from DER encoding.
   * @param enc - The encoding of the data string.
   * @returns The decoded data in the form of Signature instance.
   *
   * @example
   * const signature = Signature.fromDER('30440220018c1f5502f8...', 'hex');
   */
  static fromDER (data: number[] | string, enc?: 'hex'): Signature {
    const getLength = (buf, p): number => {
      const initial = buf[p.place++]
      if ((initial & 0x80) === 0) {
        return initial
      } else {
        throw new Error('Invalid DER entity length')
      }
    }

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
    const len = getLength(data, p)
    if ((len + p.place) !== data.length) {
      throw new Error('Signature DER invalid')
    }
    if (data[p.place++] !== 0x02) {
      throw new Error('Signature DER invalid')
    }
    const rlen = getLength(data, p)
    let r = data.slice(p.place, rlen + p.place)
    p.place += rlen
    if (data[p.place++] !== 0x02) {
      throw new Error('Signature DER invalid')
    }
    const slen = getLength(data, p)
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

  /**
   * Creates an instance of the Signature class.
   *
   * @constructor
   * @param r - The R component of the signature.
   * @param s - The S component of the signature.
   *
   * @example
   * const r = new BigNumber('208755674028...');
   * const s = new BigNumber('564745627577...');
   * const signature = new Signature(r, s);
   */
  constructor (r: BigNumber, s: BigNumber) {
    this.r = r
    this.s = s
  }

  /**
   * Verifies a digital signature.
   *
   * This method will return true if the signature, key, and message hash match.
   * If the data or key do not match the signature, the function returns false.
   *
   * @method verify
   * @param msg - The message to verify.
   * @param key - The public key used to sign the original message.
   * @param enc - The encoding of the msg string.
   * @returns A boolean representing whether the signature is valid.
   *
   * @example
   * const msg = 'The quick brown fox jumps over the lazy dog';
   * const publicKey = PublicKey.fromString('04188ca1050...');
   * const isVerified = signature.verify(msg, publicKey);
   */
  verify (msg: number[] | string, key: PublicKey, enc?: 'hex'): boolean {
    const msgHash = new BigNumber(sha256(msg, enc), 16)
    return verify(msgHash, this, key)
  }

  /**
   * Converts an instance of Signature into DER encoding.
   *
   * If the encoding parameter is set to 'hex', the function will return a hex string.
   * Otherwise, it will return an array of numbers.
   *
   * @method toDER
   * @param enc - The encoding to use for the output.
   * @returns The current instance in DER encoding.
   *
   * @example
   * const der = signature.toDER('hex');
   */
  toDER (enc?: 'hex'): number[] | string {
    const constructLength = (arr, len): void => {
      if (len < 0x80) {
        arr.push(len)
      } else {
        throw new Error('len must be < 0x80')
      }
    }

    const rmPadding = (buf: number[]): number[] => {
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

    let r = this.r.toArray()
    let s = this.s.toArray()

    // Pad values
    if ((r[0] & 0x80) !== 0) { r = [0].concat(r) }
    // Pad values
    if ((s[0] & 0x80) !== 0) { s = [0].concat(s) }

    r = rmPadding(r)
    s = rmPadding(s)

    while ((s[0] === 0) && (s[1] & 0x80) === 0) {
      s = s.slice(1)
    }
    let arr = [0x02]
    constructLength(arr, r.length)
    arr = arr.concat(r)
    arr.push(0x02)
    constructLength(arr, s.length)
    const backHalf = arr.concat(s)
    let res = [0x30]
    constructLength(res, backHalf.length)
    res = res.concat(backHalf)
    if (enc === 'hex') {
      return toHex(res)
    } else {
      return res
    }
  }
}
