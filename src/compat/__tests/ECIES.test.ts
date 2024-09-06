import ECIES from '../../../dist/cjs/src/compat/ECIES'
import * as Hash from '../../../dist/cjs/src/primitives/Hash'
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import { toArray, toHex, encode, toBase64 } from '../../../dist/cjs/src/primitives/utils'

describe('#ECIES', () => {
  it('should make a new ECIES object', () => {
    expect(ECIES).toBeDefined()
  })

  const fromkey = new PrivateKey(42)
  const tokey = new PrivateKey(88)
  const messageBuf = Hash.sha256(toArray('my message is the hash of this string', 'utf8'))

  describe('@bitcoreEncrypt', () => {
    it('should return a buffer', () => {
      const encBuf = ECIES.bitcoreEncrypt(messageBuf, tokey.toPublicKey(), fromkey)
      expect(Array.isArray(encBuf)).toEqual(true)
    })

    it('should return a buffer if fromkey is not present', () => {
      const encBuf = ECIES.bitcoreEncrypt(messageBuf, tokey.toPublicKey())
      expect(Array.isArray(encBuf)).toEqual(true)
    })
  })

  describe('@bitcoreDecrypt', () => {
    it('should decrypt that which was encrypted', () => {
      const encBuf = ECIES.bitcoreEncrypt(messageBuf, tokey.toPublicKey(), fromkey)
      const messageBuf2 = ECIES.bitcoreDecrypt(encBuf, tokey)
      expect(toHex(messageBuf2)).toEqual(toHex(messageBuf))
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
    const alicePrivateKey = PrivateKey.fromString('77e06abc52bf065cb5164c5deca839d0276911991a2730be4d8d0a0307de7ceb', 16)
    const bobPrivateKey = PrivateKey.fromString('2b57c7c5e408ce927eef5e2efb49cfdadde77961d342daa72284bb3d6590862d', 16)

    it('should do these test vectors correctly', () => {
      const message = toArray('this is my test message', 'utf8')

      expect(ECIES.electrumDecrypt(
        toArray(
          'QklFMQOGFyMXLo9Qv047K3BYJhmnJgt58EC8skYP/R2QU/U0yXXHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbiaH4FsxKIOOvzolIFVAS0FplUmib2HnlAM1yP/iiPsU=',
          'base64'
        ),
        alicePrivateKey
      ))
        .toEqual(message)
      expect(ECIES.electrumDecrypt(
        toArray(
          'QklFMQM55QTWSSsILaluEejwOXlrBs1IVcEB4kkqbxDz4Fap53XHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbvZJHgyAzxA6SoujduvJXv+A9ri3po9veilrmc8p6dwo=',
          'base64'
        ),
        bobPrivateKey
      ))
        .toEqual(message)

      expect(toBase64(
        ECIES.electrumEncrypt(message, bobPrivateKey.toPublicKey(), alicePrivateKey)
      ))
        .toEqual(
          'QklFMQM55QTWSSsILaluEejwOXlrBs1IVcEB4kkqbxDz4Fap53XHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbvZJHgyAzxA6SoujduvJXv+A9ri3po9veilrmc8p6dwo='
        )
      expect(toBase64(ECIES.electrumEncrypt(message, alicePrivateKey.toPublicKey(), bobPrivateKey)))
        .toEqual(
          'QklFMQOGFyMXLo9Qv047K3BYJhmnJgt58EC8skYP/R2QU/U0yXXHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbiaH4FsxKIOOvzolIFVAS0FplUmib2HnlAM1yP/iiPsU='
        )
    })

    it('should encrypt and decrypt symmetrically with matching strings in ECDH noKey mode', () => {
      const message = toArray('this is my ECDH test message', 'utf8')
      const ecdhMessageEncryptedBob = ECIES.electrumEncrypt(message, bobPrivateKey.toPublicKey(), alicePrivateKey, true)
      const ecdhMessageEncryptedAlice = ECIES.electrumEncrypt(message, alicePrivateKey.toPublicKey(), bobPrivateKey, true)
      expect(ecdhMessageEncryptedBob).toEqual(ecdhMessageEncryptedAlice)
      expect(ECIES.electrumDecrypt(ecdhMessageEncryptedAlice, bobPrivateKey, alicePrivateKey.toPublicKey()))
        .toEqual(toArray('this is my ECDH test message', 'utf8'))
      expect(ECIES.electrumDecrypt(ecdhMessageEncryptedBob, alicePrivateKey, bobPrivateKey.toPublicKey()))
        .toEqual(toArray('this is my ECDH test message', 'utf8'))
    })

    it('should encrypt and decrypt using ephemeral fromPrivateKey', () => {
      const message = toArray('this is my ephemeral key test message', 'utf8')
      const encryptedMessage = ECIES.electrumEncrypt(message, bobPrivateKey.toPublicKey())
      expect(ECIES.electrumDecrypt(encryptedMessage, bobPrivateKey))
        .toEqual(message)
    })
  })
})
