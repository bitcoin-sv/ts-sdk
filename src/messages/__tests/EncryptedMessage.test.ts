import { encrypt, decrypt } from '../../messages/EncryptedMessage'
import PrivateKey from '../../primitives/PrivateKey'

describe('EncryptedMessage', () => {
  it('Encrypts a message for a recipient', () => {
    const sender = new PrivateKey(15)
    const recipient = new PrivateKey(21)
    const recipientPub = recipient.toPublicKey()
    const message = [1, 2, 4, 8, 16, 32]
    const encrypted = encrypt(message, sender, recipientPub)
    const decrypted = decrypt(encrypted, recipient)
    expect(decrypted).toEqual(message)
  })
  it('Fails to decrypt a message with wrong version', () => {
    const sender = new PrivateKey(15)
    const recipient = new PrivateKey(21)
    const recipientPub = recipient.toPublicKey()
    const message = [1, 2, 4, 8, 16, 32]
    const encrypted = encrypt(message, sender, recipientPub)
    encrypted[0] = 1
    expect(() => decrypt(encrypted, recipient)).toThrow(new Error(
      'Message version mismatch: Expected 42421033, received 01421033'
    ))
  })
  it('Fails to decrypt a message with wrong recipient', () => {
    const sender = new PrivateKey(15)
    const recipient = new PrivateKey(21)
    const wrongRecipient = new PrivateKey(22)
    const recipientPub = recipient.toPublicKey()
    const message = [1, 2, 4, 8, 16, 32]
    const encrypted = encrypt(message, sender, recipientPub)
    expect(() => decrypt(encrypted, wrongRecipient)).toThrow(new Error(
      'The encrypted message expects a recipient public key of 02352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5, but the provided key is 03421f5fc9a21065445c96fdb91c0c1e2f2431741c72713b4b99ddcb316f31e9fc'
    ))
  })
})
