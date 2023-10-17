import * as ECDSA from '../ECDSA'
import BigNumber from '../BigNumber'
import Curve from '../Curve'
import Signature from '../Signature'

const msg = new BigNumber('deadbeef', 16)
const keys = new BigNumber('1e5edd45de6d22deebef4596b80444ffcc29143839c1dce18db470e25b4be7b5', 16)
const curve = new Curve()
const pub = curve.g.mul(keys)
const wrongPub = curve.g.mul(new BigNumber(33))

describe('ECDSA', () => {
  describe('curve secp256k1', () => {
    it('should sign and verify', () => {
      const signature = ECDSA.sign(msg, keys)
      expect(ECDSA.verify(msg, signature, pub)).toBeTruthy()
    })

    it('should encode and decode with DER', () => {
      const signature = ECDSA.sign(msg, keys)
      const encoded = signature.toDER()
      expect(encoded.length).toBe(71)
      const decoded = Signature.fromDER(encoded)
      expect(decoded.r.toString(16)).toEqual(signature.r.toString(16))
      expect(decoded.s.toString(16)).toEqual(signature.s.toString(16))
    })

    it('should encode and decode with hex DER', () => {
      const signature = ECDSA.sign(msg, keys)
      const encoded = signature.toDER('hex')
      expect(encoded.length).toBe(142)
      const decoded = Signature.fromDER(encoded, 'hex')
      expect(decoded.r.toString(16)).toEqual(signature.r.toString(16))
      expect(decoded.s.toString(16)).toEqual(signature.s.toString(16))
    })

    it('should have `signature.s <= keys.ec.nh`', () => {
      // key.sign(msg, options)
      const sign = ECDSA.sign(msg, keys, true)
      expect(sign.s.cmp(curve.n.ushrn(1)) <= 0).toBeTruthy()
    })

    it('should support `options.k`', () => {
      const sign = ECDSA.sign(msg, keys, undefined, new BigNumber(1358))
      expect(ECDSA.verify(msg, sign, pub)).toBeTruthy()
    })

    it('should not verify signature with wrong public key', () => {
      const signature = ECDSA.sign(msg, keys)
      expect(ECDSA.verify(msg, signature, wrongPub)).toBeFalsy()
    })
  })
})
