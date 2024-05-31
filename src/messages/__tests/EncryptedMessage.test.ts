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
  it('Encrypts a message for a recipient with rare length', () => {
    const recipient = new PrivateKey(21)
    {
      // Typical length case...
      const encrypted = [
        66,66,16,51,2,215,146,77,79,125,
        67,234,150,90,70,90,227,9,95,244,
        17,49,229,148,111,60,133,247,158,68,
        173,188,248,226,126,8,14,2,53,43,
        191,74,76,221,18,86,79,147,250,51,
        44,227,51,48,29,154,212,2,113,248,
        16,113,129,52,10,239,37,190,89,213,

        14,43,0,166,243,145,14,242,87,212,
        158,179,148,45,89,131,162,187,0,135,
        93,195,69,102,93,146,158,106,171,114,
        151,9,223,231,77,91,3,82,228,128,
        2,100,128,179,248,241,165,76,241,169,
        53,215,235,15,226,78,40,161,163,113,
        28,78,75,28,114,218,184,81,232,1,
        179,24,237,137,182,16,171,224,72,46,
        13,222,150,106,192,255
      ]
      // good
      // ss 039312a4f7bd7740e7b0b3936bbd73bc1eba768a4faf00a671348236ba62ebbd5b
      // ssen 3,147,18,164,247,189,119,64,231,176,
      //  179,147,107,189,115,188,30,186,118,138,
      //  79,175,0,166,113,52,130,54,186,98,
      //  235,189,91
      // bad
      // ss 0300a45fb58f5c359518a8850179af816f45963b4ab75a858979e3513217a9c188
      // ssen 3,0,164,95,181,143,92,53,149,24,
      //  168,133,1,121,175,129,111,69,150,59,
      //  74,183,90,133,137,121,227,81,50,23,
      //  169,193,136
      const decrypted = decrypt(encrypted, recipient)
    }
    {
      // Rare length case...
      const encrypted = [
        //bad enc 66,66,16,51,2,215,146,77,79,125,67,234,150,90,70,90,227,9,95,244,17,49,229,148,111,60,133,247,158,68,173,188,248,226,126,8,14,2,53,43,191,74,76,221,18,86,79,147,250,51,44,227,51,48,29,154,212,2,113,248,16,113,129,52,10,239,37,190,89,213,186,118,75,239,112,214,28,90,217,249,209,59,163,139,127,55,176,155,43,76,76,74,46,122,122,185,163,60,130,136,38,173,175,29,253,110,5,236,43,147,61,200,166,27,255,226,241,42,77,135,4,149,106,200,222,206,195,75,141,35,183,139,3,37,96,177,38,242,59,208,58,228,88,24,171,122,87,121,149,175,203,169,1,211,19,107
        66,66,16,51,2,215,146,77,79,125,
        67,234,150,90,70,90,227,9,95,244,
        17,49,229,148,111,60,133,247,158,68,
        173,188,248,226,126,8,14,2,53,43,
        191,74,76,221,18,86,79,147,250,51,
        44,227,51,48,29,154,212,2,113,248,
        16,113,129,52,10,239,37,190,89,213,

        75,148,8,235,104,137,80,129,55,68,
        182,141,118,212,215,121,161,107,62,247,
        12,172,244,170,208,37,213,198,103,118,
        75,166,166,131,191,105,48,232,101,223,
        255,169,176,204,126,249,78,178,10,51,
        13,163,58,232,122,111,210,218,187,247,
        164,101,207,15,37,227,108,82,70,35,
        5,148,18,162,120,64,46,40,227,197,
        6,112,207,200,238,81
      ]
      const decrypted = decrypt(encrypted, recipient)
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
