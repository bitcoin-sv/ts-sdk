import PublicKey from '../../../dist/cjs/src/primitives/PublicKey'
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import Signature from '../../../dist/cjs/src/primitives/Signature'
import Point from '../../../dist/cjs/src/primitives/Point'
import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'

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
      const pubKeyString = publicKey.toString();
      const newPublicKey = PublicKey.fromString(pubKeyString);
      expect(newPublicKey).toBeInstanceOf(PublicKey);
      expect(newPublicKey.x.toHex()).toEqual(publicKey.x.toHex());
      expect(newPublicKey.y.toHex()).toEqual(publicKey.y.toHex());
    })

  })

  describe('Instance methods', () => {

    test('deriveSharedSecret should derive a shared secret Point', () => {
      const sharedSecret = publicKey.deriveSharedSecret(privateKey);
      expect(sharedSecret).toBeInstanceOf(Point);
    })

    test('deriveSharedSecret should throw error for invalid public key', () => {
      const invalidPublicKey = new PublicKey(10, 13)
      expect(() => {
        invalidPublicKey.deriveSharedSecret(privateKey)
      }).toThrow('Public key not valid for ECDH secret derivation')
    })

    test('verify should return true for valid signature', () => {
      const message = new BigNumber('deadbeef', 16);
      const signature = privateKey.sign(message);
      expect(publicKey.verify(message, signature)).toBe(true);
    });

    test('toDER should return DER encoded string of public key', () => {
      const derString = publicKey.toDER();
      expect(typeof derString).toBe('string');
      expect(derString.length).toBe(66)
    });

  });

});
