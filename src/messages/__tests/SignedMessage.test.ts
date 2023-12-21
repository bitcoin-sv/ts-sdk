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
  it('Fails to verify a message with a wrong version', () => {
    const sender = new PrivateKey(15)
    const recipient = new PrivateKey(21)
    const recipientPub = recipient.toPublicKey()
    const message = [1, 2, 4, 8, 16, 32]
    const signature = sign(message, sender, recipientPub)
    signature[0] = 1
    expect(() => verify(message, signature, recipient)).toThrow(new Error(
      'Message version mismatch: Expected 42423301, received 01423301'
    ))
  })
  it('Fails to verify a message with no verifier when required', () => {
    const sender = new PrivateKey(15)
    const recipient = new PrivateKey(21)
    const recipientPub = recipient.toPublicKey()
    const message = [1, 2, 4, 8, 16, 32]
    const signature = sign(message, sender, recipientPub)
    expect(() => verify(message, signature)).toThrow(new Error(
      'This signature can only be verified with knowledge of a specific private key. The associated public key is: 02352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5'
    ))
  })
  it('Fails to verify a message with a wrong verifier', () => {
    const sender = new PrivateKey(15)
    const recipient = new PrivateKey(21)
    const wrongRecipient = new PrivateKey(22)
    const recipientPub = recipient.toPublicKey()
    const message = [1, 2, 4, 8, 16, 32]
    const signature = sign(message, sender, recipientPub)
    expect(() => verify(message, signature, wrongRecipient)).toThrow(new Error(
      'The recipient public key is 03421f5fc9a21065445c96fdb91c0c1e2f2431741c72713b4b99ddcb316f31e9fc but the signature requres the recipient to have public key 02352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5'
    ))
  })
})
