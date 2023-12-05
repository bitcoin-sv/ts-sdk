import BigNumber from './BigNumber.js'
import Signature from './Signature.js'
import Curve from './Curve.js'
import Point from './Point.js'
import DRBG from './DRBG.js'

/**
 * Truncates a BigNumber message to the length of the curve order n, in the context of the Elliptic Curve Digital Signature Algorithm (ECDSA).
 * This method is used as part of ECDSA signing and verification.
 *
 * The method calculates `delta`, which is a difference obtained by subtracting the bit length of the curve order `n` from the byte length of the message in bits.
 * If `delta` is greater than zero, logical shifts msg to the right by `delta`, retaining the sign.
 *
 * Another condition is tested, but only if `truncOnly` is false. This condition compares the value of msg to curve order `n`.
 * If msg is greater or equal to `n`, it is decreased by `n` and returned.
 *
 * @method truncateToN
 * @param msg - The BigNumber message to be truncated.
 * @param truncOnly - An optional boolean parameter that if set to true, the method will only perform truncation of the BigNumber without doing the additional subtraction from the curve order.
 * @returns Returns the truncated BigNumber value, potentially subtracted by the curve order n.
 *
 * @example
 * let msg = new BigNumber('1234567890abcdef', 16);
 * let truncatedMsg = truncateToN(msg);
 */
function truncateToN (msg: BigNumber, truncOnly?: boolean): BigNumber {
  const curve = new Curve()
  const delta = msg.byteLength() * 8 - curve.n.bitLength()
  if (delta > 0) { msg = msg.ushrn(delta) }
  if (!truncOnly && msg.cmp(curve.n) >= 0) {
    return msg.sub(curve.n)
  } else {
    return msg
  }
}

/**
 * Generates a digital signature for a given message.
 *
 * @function sign
 * @param msg - The BigNumber message for which the signature has to be computed.
 * @param key - Private key in BigNumber.
 * @param forceLowS - Optional boolean flag if True forces "s" to be the lower of two possible values.
 * @param customK - Optional specification for k value, which can be a function or BigNumber.
 * @returns Returns the elliptic curve digital signature of the message.
 *
 * @example
 * const msg = new BigNumber('2664878')
 * const key = new BigNumber('123456')
 * const signature = sign(msg, key)
 */
export const sign = (msg: BigNumber, key: BigNumber, forceLowS: boolean = false, customK?: BigNumber | Function): Signature => {
  const curve = new Curve()
  msg = truncateToN(msg)

  // Zero-extend key to provide enough entropy
  const bytes = curve.n.byteLength()
  const bkey = key.toArray('be', bytes)

  // Zero-extend nonce to have the same byte size as N
  const nonce = msg.toArray('be', bytes)

  // Instantiate Hmac_DRBG
  const drbg = new DRBG(bkey, nonce)

  // Number of bytes to generate
  const ns1 = curve.n.subn(1)

  for (let iter = 0; ; iter++) {
    // Compute the k-value
    let k = typeof customK === 'function'
      ? customK(iter)
      : BigNumber.isBN(customK)
        ? customK
        : new BigNumber(drbg.generate(bytes), 16)
    k = truncateToN(k, true)
    if (k.cmpn(1) <= 0 || k.cmp(ns1) >= 0) {
      if (BigNumber.isBN(customK)) {
        throw new Error('Invalid fixed custom K value (must be more than 1 and less than N-1)')
      } else {
        continue
      }
    }

    const kp = curve.g.mul(k)
    if (kp.isInfinity()) {
      if (BigNumber.isBN(customK)) {
        throw new Error('Invalid fixed custom K value (must not create a point at infinity when multiplied by the generator point)')
      } else {
        continue
      }
    }

    const kpX = kp.getX()
    const r = kpX.umod(curve.n)
    if (r.cmpn(0) === 0) {
      if (BigNumber.isBN(customK)) {
        throw new Error('Invalid fixed custom K value (when multiplied by G, the resulting x coordinate mod N must not be zero)')
      } else {
        continue
      }
    }

    let s = k.invm(curve.n).mul(r.mul(key).iadd(msg))
    s = s.umod(curve.n)
    if (s.cmpn(0) === 0) {
      if (BigNumber.isBN(customK)) {
        throw new Error('Invalid fixed custom K value (when used with the key, it cannot create a zero value for S)')
      } else {
        continue
      }
    }

    // Use complement of `s`, if it is > `n / 2`
    if (forceLowS && s.cmp(curve.n.ushrn(1)) > 0) {
      s = curve.n.sub(s)
    }

    return new Signature(r, s)
  }
}

/**
 * Verifies a digital signature of a given message.
 *
 * Message and key used during the signature generation process, and the previously computed signature
 * are used to validate the authenticity of the digital signature.
 *
 * @function verify
 * @param msg - The BigNumber message for which the signature has to be verified.
 * @param sig - Signature object consisting of parameters 'r' and 's'.
 * @param key - Public key in Point.
 * @returns Returns true if the signature is valid and false otherwise.
 *
 * @example
 * const msg = new BigNumber('2664878', 16)
 * const key = new Point(new BigNumber(10), new BigNumber(20)
 * const signature = sign(msg, new BigNumber('123456'))
 * const isVerified = verify(msg, sig, key)
 */
export const verify = (msg: BigNumber, sig: Signature, key: Point): boolean => {
  const curve = new Curve()
  msg = truncateToN(msg)
  // Perform primitive values validation
  const r = sig.r
  const s = sig.s
  if (r.cmpn(1) < 0 || r.cmp(curve.n) >= 0) { return false }
  if (s.cmpn(1) < 0 || s.cmp(curve.n) >= 0) { return false }

  // Validate signature
  const sinv = s.invm(curve.n)
  const u1 = sinv.mul(msg).umod(curve.n)
  const u2 = sinv.mul(r).umod(curve.n)

  // NOTE: Greg Maxwell's trick, inspired by:
  // https://git.io/vad3K
  const p = curve.g.jmulAdd(u1, key, u2)
  if (p.isInfinity()) { return false }

  // Compare `p.x` of Jacobian point with `r`,
  // this will do `p.x == r * p.z^2` instead of multiplying `p.x` by the
  // inverse of `p.z^2`
  return p.eqXToP(r)
}
