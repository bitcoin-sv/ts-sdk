import BigNumber from './BigNumber'
import Signature from './Signature'
import Curve from './Curve'
import Point from './Point'
import DRBG from './DRBG'

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
