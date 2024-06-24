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
  it('Encrypts a message for a recipient with rare key length', () => {
    const recipient = new PrivateKey(21)
    {
      // Rare length case... Leading zeros in key BigNumber array.
      const encrypted = [
        66, 66, 16, 51, 2, 215, 146, 77, 79, 125,
        67, 234, 150, 90, 70, 90, 227, 9, 95, 244,
        17, 49, 229, 148, 111, 60, 133, 247, 158, 68,
        173, 188, 248, 226, 126, 8, 14, 2, 53, 43,
        191, 74, 76, 221, 18, 86, 79, 147, 250, 51,
        44, 227, 51, 48, 29, 154, 212, 2, 113, 248,
        16, 113, 129, 52, 10, 239, 37, 190, 89, 213,

        75, 148, 8, 235, 104, 137, 80, 129, 55, 68,
        182, 141, 118, 212, 215, 121, 161, 107, 62, 247,
        12, 172, 244, 170, 208, 37, 213, 198, 103, 118,
        75, 166, 166, 131, 191, 105, 48, 232, 101, 223,
        255, 169, 176, 204, 126, 249, 78, 178, 10, 51,
        13, 163, 58, 232, 122, 111, 210, 218, 187, 247,
        164, 101, 207, 15, 37, 227, 108, 82, 70, 35,
        5, 148, 18, 162, 120, 64, 46, 40, 227, 197,
        6, 112, 207, 200, 238, 81
      ]
      expect(() => decrypt(encrypted, recipient)).not.toThrow()
    }
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
