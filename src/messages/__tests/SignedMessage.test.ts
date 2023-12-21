import { sign, verify } from '../../../dist/cjs/src/messages/SignedMessage'
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'

describe('SignedMessage', () => {
  it('Signs a message for a recipient', () => {
    const sender = new PrivateKey(15)
    const recipient = new PrivateKey(21)
    const recipientPub = recipient.toPublicKey()
    const message = [1, 2, 4, 8, 16, 32]
    const signature = sign(message, sender, recipientPub)
    const verified = verify(message, signature, recipient)
    expect(verified).toEqual(true)
  })
  it('Signs a message for anyone', () => {
    const sender = new PrivateKey(15)
    const message = [1, 2, 4, 8, 16, 32]
    const signature = sign(message, sender)
    const verified = verify(message, signature)
    expect(verified).toEqual(true)
  })
})
