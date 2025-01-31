import ECIES from '../ECIES'
import * as Hash from '../../primitives/Hash'
import PrivateKey from '../../primitives/PrivateKey'
import { Utils } from '../../primitives/index'

describe('#ECIES', () => {
  it('should make a new ECIES object', () => {
    expect(ECIES).toBeDefined()
  })

  const fromkey = new PrivateKey(42)
  const tokey = new PrivateKey(88)
  const messageBuf = Hash.sha256(
    Utils.toArray('my message is the hash of this string', 'utf8')
  )

  describe('@bitcoreEncrypt', () => {
    it('should return a buffer', () => {
      const encBuf = ECIES.bitcoreEncrypt(
        messageBuf,
        tokey.toPublicKey(),
        fromkey
      )
      expect(Array.isArray(encBuf)).toEqual(true)
    })

    it('should return a buffer if fromkey is not present', () => {
      const encBuf = ECIES.bitcoreEncrypt(messageBuf, tokey.toPublicKey())
      expect(Array.isArray(encBuf)).toEqual(true)
    })
  })

  describe('@bitcoreDecrypt', () => {
    it('should decrypt that which was encrypted', () => {
      const encBuf = ECIES.bitcoreEncrypt(
        messageBuf,
        tokey.toPublicKey(),
        fromkey
      )
      const messageBuf2 = ECIES.bitcoreDecrypt(encBuf, tokey)
      expect(Utils.toHex(messageBuf2)).toEqual(Utils.toHex(messageBuf))
    })

    it('should decrypt that which was encrypted if fromPrivateKey was randomly generated', () => {
      const encBuf = ECIES.bitcoreEncrypt(messageBuf, tokey.toPublicKey())
      const messageBuf2 = ECIES.bitcoreDecrypt(encBuf, tokey)
      expect(messageBuf2).toEqual(messageBuf)
    })
  })

  describe('Electrum ECIES', () => {
    // const alicePrivateKey = PrivateKey.fromString('L1Ejc5dAigm5XrM3mNptMEsNnHzS7s51YxU7J61ewGshZTKkbmzJ')
    // const bobPrivateKey = PrivateKey.fromString('KxfxrUXSMjJQcb3JgnaaA6MqsrKQ1nBSxvhuigdKRyFiEm6BZDgG')
    const alicePrivateKey = PrivateKey.fromString(
      '77e06abc52bf065cb5164c5deca839d0276911991a2730be4d8d0a0307de7ceb',
      16
    )
    const bobPrivateKey = PrivateKey.fromString(
      '2b57c7c5e408ce927eef5e2efb49cfdadde77961d342daa72284bb3d6590862d',
      16
    )

    it('should do these test vectors correctly', () => {
      const message = Utils.toArray('this is my test message', 'utf8')

      expect(
        ECIES.electrumDecrypt(
          Utils.toArray(
            'QklFMQOGFyMXLo9Qv047K3BYJhmnJgt58EC8skYP/R2QU/U0yXXHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbiaH4FsxKIOOvzolIFVAS0FplUmib2HnlAM1yP/iiPsU=',
            'base64'
          ),
          alicePrivateKey
        )
      ).toEqual(message)
      expect(
        ECIES.electrumDecrypt(
          Utils.toArray(
            'QklFMQM55QTWSSsILaluEejwOXlrBs1IVcEB4kkqbxDz4Fap53XHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbvZJHgyAzxA6SoujduvJXv+A9ri3po9veilrmc8p6dwo=',
            'base64'
          ),
          bobPrivateKey
        )
      ).toEqual(message)

      expect(
        Utils.toBase64(
          ECIES.electrumEncrypt(
            message,
            bobPrivateKey.toPublicKey(),
            alicePrivateKey
          )
        )
      ).toEqual(
        'QklFMQM55QTWSSsILaluEejwOXlrBs1IVcEB4kkqbxDz4Fap53XHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbvZJHgyAzxA6SoujduvJXv+A9ri3po9veilrmc8p6dwo='
      )
      expect(
        Utils.toBase64(
          ECIES.electrumEncrypt(
            message,
            alicePrivateKey.toPublicKey(),
            bobPrivateKey
          )
        )
      ).toEqual(
        'QklFMQOGFyMXLo9Qv047K3BYJhmnJgt58EC8skYP/R2QU/U0yXXHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbiaH4FsxKIOOvzolIFVAS0FplUmib2HnlAM1yP/iiPsU='
      )
    })

    it('should encrypt and decrypt symmetrically with matching strings in ECDH noKey mode', () => {
      const message = Utils.toArray('this is my ECDH test message', 'utf8')
      const ecdhMessageEncryptedBob = ECIES.electrumEncrypt(
        message,
        bobPrivateKey.toPublicKey(),
        alicePrivateKey,
        true
      )
      const ecdhMessageEncryptedAlice = ECIES.electrumEncrypt(
        message,
        alicePrivateKey.toPublicKey(),
        bobPrivateKey,
        true
      )
      expect(ecdhMessageEncryptedBob).toEqual(ecdhMessageEncryptedAlice)
      expect(
        ECIES.electrumDecrypt(
          ecdhMessageEncryptedAlice,
          bobPrivateKey,
          alicePrivateKey.toPublicKey()
        )
      ).toEqual(Utils.toArray('this is my ECDH test message', 'utf8'))
      expect(
        ECIES.electrumDecrypt(
          ecdhMessageEncryptedBob,
          alicePrivateKey,
          bobPrivateKey.toPublicKey()
        )
      ).toEqual(Utils.toArray('this is my ECDH test message', 'utf8'))
    })

    it('should encrypt and decrypt using ephemeral fromPrivateKey', () => {
      const message = Utils.toArray(
        'this is my ephemeral key test message',
        'utf8'
      )
      const encryptedMessage = ECIES.electrumEncrypt(
        message,
        bobPrivateKey.toPublicKey()
      )
      expect(ECIES.electrumDecrypt(encryptedMessage, bobPrivateKey)).toEqual(
        message
      )
    })

    it('should encrypt and decrypt message with counterparty public key', () => {
      const wif = 'L211enC224G1kV8pyyq7bjVd9SxZebnRYEzzM3i7ZHCc1c5E7dQu'
      const senderPrivateKey = PrivateKey.fromWif(wif)
      const senderPublicKey = senderPrivateKey.toPublicKey()
      const msgStr = 'hello world'
      const messageBuf = Utils.toArray(msgStr, 'utf8')

      // Create a random counterparty (recipient) public/private key pair
      const recipientPrivateKey = PrivateKey.fromRandom()
      const recipientPublicKey = recipientPrivateKey.toPublicKey()

      // Encrypt the message using electrumEncrypt
      const encryptedMessage = ECIES.electrumEncrypt(
        messageBuf,
        recipientPublicKey,
        senderPrivateKey
      )

      // Decrypt the message using electrumDecrypt
      const decryptedMessageBuf = ECIES.electrumDecrypt(
        encryptedMessage,
        recipientPrivateKey,
        senderPublicKey
      )

      const decryptedMsgStr = Utils.toUTF8(decryptedMessageBuf)

      expect(decryptedMsgStr).toEqual(msgStr)
    })
  })
})
