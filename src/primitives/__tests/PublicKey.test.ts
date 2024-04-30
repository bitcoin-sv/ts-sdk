import PublicKey from '../../primitives/PublicKey'
import PrivateKey from '../../primitives/PrivateKey'
import Point from '../../primitives/Point'
import BigNumber from '../../primitives/BigNumber'
import BRC42Public from './BRC42.public.vectors'

describe('PublicKey', () => {
  let privateKey
  let publicKey

  beforeEach(() => {
    privateKey = PrivateKey.fromRandom()
    publicKey = PublicKey.fromPrivateKey(privateKey)
  })

  describe('Static methods', () => {
    test('fromPrivateKey should return a valid PublicKey', () => {
      expect(publicKey).toBeInstanceOf(PublicKey)
    })

    test('fromDER should create a PublicKey from a string', () => {
      const pubKeyString = publicKey.toString()
      const newPublicKey = PublicKey.fromString(pubKeyString)
      expect(newPublicKey).toBeInstanceOf(PublicKey)
      expect(newPublicKey.x.toHex()).toEqual(publicKey.x.toHex())
      expect(newPublicKey.y.toHex()).toEqual(publicKey.y.toHex())
    })
  })

  describe('Instance methods', () => {
    test('deriveSharedSecret should derive a shared secret Point', () => {
      const sharedSecret = publicKey.deriveSharedSecret(privateKey)
      expect(sharedSecret).toBeInstanceOf(Point)
    })

    test('deriveSharedSecret should throw error for invalid public key', () => {
      const invalidPublicKey = new PublicKey(10, 13)
      expect(() => {
        invalidPublicKey.deriveSharedSecret(privateKey)
      }).toThrow('Public key not valid for ECDH secret derivation')
    })

    test('verify should return true for valid signature', () => {
      const message = new BigNumber('deadbeef', 16)
      const signature = privateKey.sign(message)
      expect(publicKey.verify(message, signature)).toBe(true)
    })

    test('toDER should return DER encoded string of public key', () => {
      const derString = publicKey.toDER()
      expect(typeof derString).toBe('string')
      expect(derString.length).toBe(66)
    })
  })
  describe('BRC42 vectors', () => {
    for (let i = 0; i < BRC42Public.length; i++) {
      it(`Passes BRC42 public vector #${i + 1}`, () => {
        const v = BRC42Public[i]
        const publicKey = PublicKey.fromString(v.recipientPublicKey)
        const privateKey = PrivateKey.fromString(v.senderPrivateKey, 16)
        const derived = publicKey.deriveChild(privateKey, v.invoiceNumber)
        expect(derived.toString()).toEqual(v.publicKey)
      })
    }
  })
})
