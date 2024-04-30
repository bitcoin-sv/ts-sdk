import * as ECDSA from '../../primitives/ECDSA'
import BigNumber from '../../primitives/BigNumber'
import Curve from '../../primitives/Curve'
import Signature from '../../primitives/Signature'

const msg = new BigNumber('deadbeef', 16)
const key = new BigNumber('1e5edd45de6d22deebef4596b80444ffcc29143839c1dce18db470e25b4be7b5', 16)
const curve = new Curve()
const pub = curve.g.mul(key)
const wrongPub = curve.g.mul(new BigNumber(33))

describe('ECDSA', () => {
  it('should sign and verify', () => {
    const signature = ECDSA.sign(msg, key)
    expect(ECDSA.verify(msg, signature, pub)).toBeTruthy()
  })

  it('should encode and decode with DER', () => {
    const signature = ECDSA.sign(msg, key)
    const encoded = signature.toDER()
    expect(encoded.length).toBe(71)
    const decoded = Signature.fromDER(encoded)
    expect(decoded.r.toString(16)).toEqual(signature.r.toString(16))
    expect(decoded.s.toString(16)).toEqual(signature.s.toString(16))
  })

  it('should encode and decode with hex DER', () => {
    const signature = ECDSA.sign(msg, key)
    const encoded = signature.toDER('hex')
    expect(encoded.length).toBe(142)
    const decoded = Signature.fromDER(encoded, 'hex')
    expect(decoded.r.toString(16)).toEqual(signature.r.toString(16))
    expect(decoded.s.toString(16)).toEqual(signature.s.toString(16))
  })

  it('should have `signature.s <= keys.ec.nh`', () => {
    // key.sign(msg, options)
    const sign = ECDSA.sign(msg, key, true)
    expect(sign.s.cmp(curve.n.ushrn(1)) <= 0).toBeTruthy()
  })

  it('should support `options.k`', () => {
    const sign = ECDSA.sign(msg, key, undefined, new BigNumber(1358))
    expect(ECDSA.verify(msg, sign, pub)).toBeTruthy()
  })

  it('should not verify an incorrectly signed message', () => {
    const wrongMessage = new BigNumber('BA5AABBE1AA9B6EC1E2ADB2DF99699344345678901234567890ABCDEFABCDEF02', 16)
    const signature = ECDSA.sign(msg, key)
    const result = ECDSA.verify(wrongMessage, signature, pub)
    expect(result).toBe(false)
  })

  it('should not verify signature with wrong public key', () => {
    const signature = ECDSA.sign(msg, key)
    expect(ECDSA.verify(msg, signature, wrongPub)).toBeFalsy()
  })
})
