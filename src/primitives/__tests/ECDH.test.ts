/* eslint-env jest */
import PublicKey from '../../../dist/cjs/src/primitives/PublicKey'
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'

describe('ECDH', function () {
  it('should work with secp256k1', function () {
    const s1 = PrivateKey.fromRandom()
    const s2 = PrivateKey.fromRandom()
    let sh1 = s1.deriveSharedSecret(s2.toPublicKey())
    let sh2 = s2.deriveSharedSecret(s1.toPublicKey())
    expect(sh1.toString()).toEqual(sh2.toString())
    sh1 = s1.deriveSharedSecret(PublicKey.fromString(s2.toPublicKey().toDER()))
    sh2 = s2.deriveSharedSecret(PublicKey.fromString(s1.toPublicKey().toDER()))
    expect(sh1.toString()).toEqual(sh2.toString())
    sh1 = s1.deriveSharedSecret(PublicKey.fromPrivateKey(s2))
    sh2 = s2.deriveSharedSecret(PublicKey.fromPrivateKey(s1))
    expect(sh1.toString()).toEqual(sh2.toString())
  })
  it('should be able to prevent a twist attack for secp256k1', () => {
    const bob = PrivateKey.fromRandom()
    // This is a bad point that shouldn't be able to be passed to derive.
    // If a bad point can be passed it's possible to perform a twist attack.
    const mallory = new PublicKey(new BigNumber(14), new BigNumber(16))
    expect(() => {
      bob.deriveSharedSecret(mallory)
    }).toThrow(new Error(
      'Public key not valid for ECDH secret derivation'
    ))
  })
})
