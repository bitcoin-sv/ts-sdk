import BigNumber from './BigNumber.ts'
import Signature from './Signature.ts'
import Curve from './Curve.ts'
import Point from './Point.ts'
import DRBG from './DRBG.ts'

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
    if (k.cmpn(1) <= 0 || k.cmp(ns1) >= 0) { continue }

    const kp = curve.g.mul(k)
    if (kp.isInfinity()) { continue }

    const kpX = kp.getX()
    const r = kpX.umod(curve.n)
    if (r.cmpn(0) === 0) { continue }

    let s = k.invm(curve.n).mul(r.mul(key).iadd(msg))
    s = s.umod(curve.n)
    if (s.cmpn(0) === 0) { continue }

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
