import { encrypt, decrypt } from '../../../dist/cjs/src/messages/EncryptedMessage'
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'

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
})
