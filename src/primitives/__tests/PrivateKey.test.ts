import PublicKey from '../../../dist/cjs/src/primitives/PublicKey'
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import BRC42Private from './BRC42.private.vectors'

describe('PrivateKey', () => {
  describe('BRC42 vectors', () => {
    for (let i = 0; i < BRC42Private.length; i++) {
      it(`Passes BRC42 private vector #${i + 1}`, () => {
        const v = BRC42Private[i]
        const publicKey = PublicKey.fromString(v.senderPublicKey)
        const privateKey = PrivateKey.fromString(v.recipientPrivateKey, 16)
        const derived = privateKey.deriveChild(publicKey, v.invoiceNumber)
        expect(derived.toHex(32)).toEqual(v.privateKey)
      })
    }
  })
})
