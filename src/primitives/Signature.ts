import BigNumber from './BigNumber.js'
import PublicKey from './PublicKey.js'
import { verify } from './ECDSA.js'
import { sha256 } from './Hash.js'
import { toArray, toHex, toBase64 } from './utils.js'
import Point from './Point.js'
import Curve from './Curve.js'

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
  static fromDER (data: number[] | string, enc?: 'hex' | 'base64'): Signature {
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
   * Takes an array of numbers or a string and returns a new Signature instance.
   * This method will throw an error if the Compact encoding is invalid.
   * If a string is provided, it is assumed to represent a hexadecimal sequence.
   * compactByte value 27-30 means uncompressed public key.
   * 31-34 means compressed public key.
   * The range represents the recovery param which can be 0,1,2,3.
   * We could support recovery functions in future if there's demand.
   *
   * @static
   * @method fromCompact
   * @param data - The sequence to decode from Compact encoding.
   * @param enc - The encoding of the data string.
   * @returns The decoded data in the form of Signature instance.
   *
   * @example
   * const signature = Signature.fromCompact('1b18c1f5502f8...', 'hex');
   */
  static fromCompact (data: number[] | string, enc?: 'hex' | 'base64'): Signature {
    data = toArray(data, enc)
    if (data.length !== 65) {
      throw new Error('Invalid Compact Signature')
    }
    const compactByte = data[0]
    if (compactByte < 27 || compactByte >= 35) {
      throw new Error('Invalid Compact Byte')
    }
    return new Signature(
      new BigNumber(data.slice(1, 33)),
      new BigNumber(data.slice(33, 65))
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
   * An alias for the toDER method.
   *
   * If the encoding parameter is set to 'hex', the function will return a hex string.
   * If 'base64', it will return a base64 string.
   * Otherwise, it will return an array of numbers.
   *
   * @method toDER
   * @param enc - The encoding to use for the output.
   * @returns The current instance in DER encoding.
   *
   * @example
   * const der = signature.toString('base64');
   */
  toString (enc?: 'hex' | 'base64') {
    return this.toDER(enc)
  }

  /**
   * Converts an instance of Signature into DER encoding.
   *
   * If the encoding parameter is set to 'hex', the function will return a hex string.
   * If 'base64', it will return a base64 string.
   * Otherwise, it will return an array of numbers.
   *
   * @method toDER
   * @param enc - The encoding to use for the output.
   * @returns The current instance in DER encoding.
   *
   * @example
   * const der = signature.toDER('hex');
   */
  toDER (enc?: 'hex' | 'base64'): number[] | string {
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
    } else if (enc === 'base64') {
      return toBase64(res)
    } else {
      return res
    }
  }

  /**
   * Converts an instance of Signature into Compact encoding.
   *
   * If the encoding parameter is set to 'hex', the function will return a hex string.
   * If 'base64', it will return a base64 string.
   * Otherwise, it will return an array of numbers.
   *
   * @method toCompact
   * @param enc - The encoding to use for the output.
   * @returns The current instance in DER encoding.
   *
   * @example
   * const compact = signature.toCompact(3, true, 'base64');
   */
  toCompact (recovery: number, compressed: boolean, enc?: 'hex' | 'base64'): number[] | string {
    if (recovery < 0 || recovery > 3) throw new Error('Invalid recovery param')
    if (typeof compressed !== 'boolean') throw new Error('Invalid compressed param')
    let compactByte = 27 + recovery
    if (compressed) {
      compactByte += 4
    }
    let arr = [compactByte]
    arr = arr.concat(this.r.toArray('be', 32))
    arr = arr.concat(this.s.toArray('be', 32))
    if (enc === 'hex') {
      return toHex(arr)
    } else if (enc === 'base64') {
      return toBase64(arr)
    } else {
      return arr
    }
  }

  /**
   * Recovers the public key from a signature.
   * This method will return the public key if it finds a valid public key.
   * If it does not find a valid public key, it will throw an error.
   * The recovery factor is a number between 0 and 3.
   * @method RecoverPublicKey
   * @param recovery - The recovery factor.
   * @param e - The message hash.
   * @returns The public key associated with the signature.
   *
   * @example
   * const publicKey = signature.RecoverPublicKey(0, msgHash);
   */
  RecoverPublicKey (recovery: number, e: BigNumber): PublicKey {
    const r = this.r
    const s = this.s

    // A set LSB signifies that the y-coordinate is odd
    const isYOdd = !!(recovery & 1)

    // The more significant bit specifies whether we should use the
    // first or second candidate key.
    const isSecondKey = recovery >> 1

    const curve = new Curve()
    const n = curve.n
    const G = curve.g

    // 1.1 LEt x = r + jn
    const x = isSecondKey ? r.add(n) : r
    const R = Point.fromX(x, isYOdd)

    // 1.4 Check that nR is at infinity
    const nR = R.mul(n)
    if (!nR.isInfinity()) {
      throw new Error('nR is not at infinity')
    }

    // Compute -e from e
    const eNeg = e.neg().umod(n)

    // 1.6.1 Compute Q = r^-1 (sR - eG)
    // Q = r^-1 (sR + -eG)
    const rInv = r.invm(n)

    // const Q = R.multiplyTwo(s, G, eNeg).mul(rInv)
    const srInv = rInv.mul(s).umod(n)
    const eInvrInv = rInv.mul(eNeg).umod(n)
    const Q = G.mul(eInvrInv).add(R.mul(srInv))

    const pubKey = new PublicKey(Q)
    pubKey.validate()

    return pubKey
  }

  /**
   * Calculates the recovery factor which will work for a particular public key and message hash.
   * This method will return the recovery factor if it finds a valid recovery factor.
   * If it does not find a valid recovery factor, it will throw an error.
   * The recovery factor is a number between 0 and 3.
   *
   * @method CalculateRecoveryFactor
   * @param msgHash - The message hash.
   * @returns the recovery factor: number
   * /
   * @example
   * const recovery = signature.CalculateRecoveryFactor(publicKey, msgHash);
   */
  CalculateRecoveryFactor (pubkey: PublicKey, msgHash: BigNumber): number {
    for (let recovery = 0; recovery < 4; recovery++) {
      let Qprime
      try {
        Qprime = this.RecoverPublicKey(recovery, msgHash)
      } catch (e) {
        continue
      }
      if (pubkey.eq(Qprime)) {
        return recovery
      }
    }
    throw new Error('Unable to find valid recovery factor')
  }
}
