import ECIES from '../../../dist/cjs/src/compat/ECIES'
import * as Hash from '../../../dist/cjs/src/primitives/Hash'
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import { toArray, toHex } from '../../../dist/cjs/src/primitives/utils'

describe('#ECIES', () => {
    it('should make a new ECIES object', () => {
        expect(ECIES).toBeDefined()
    })

    const fromkey = new PrivateKey(42)
    const tokey = new PrivateKey(88)
    const messageBuf = Hash.sha256(toArray('my message is the hash of this string', 'utf8'))

    // describe('@bitcoreEncrypt', () => {
    //     it('should return a buffer', () => {
    //         const encBuf = ECIES.bitcoreEncrypt(messageBuf, tokey.toPublicKey(), fromkey)
    //         expect(Array.isArray(encBuf)).toEqual(true)
    //     })

    //     it('should return a buffer if fromkey is not present', () => {
    //         const encBuf = ECIES.bitcoreEncrypt(messageBuf, tokey.toPublicKey())
    //         expect(Array.isArray(encBuf)).toEqual(true)
    //     })
    // })

    describe('@bitcoreDecrypt', () => {
        it('should decrypt that which was encrypted', () => {
            const encBuf = ECIES.bitcoreEncrypt(messageBuf, tokey.toPublicKey(), fromkey)
            const messageBuf2 = ECIES.bitcoreDecrypt(encBuf, tokey)
            expect(toHex(messageBuf2)).toEqual(toHex(messageBuf))
        })

        // it('should decrypt that which was encrypted if fromPrivateKey was randomly generated', () => {
        //     const encBuf = ECIES.bitcoreEncrypt(messageBuf, tokey.toPublicKey())
        //     const messageBuf2 = ECIES.bitcoreDecrypt(encBuf, tokey)
        //     expect(messageBuf2).toEqual(messageBuf)
        // })
    })

    // describe('Electrum ECIES', () => {
    //     // const alicePrivateKey = PrivateKey.fromString('L1Ejc5dAigm5XrM3mNptMEsNnHzS7s51YxU7J61ewGshZTKkbmzJ')
    //     // const bobPrivateKey = PrivateKey.fromString('KxfxrUXSMjJQcb3JgnaaA6MqsrKQ1nBSxvhuigdKRyFiEm6BZDgG')
    //     const alicePrivateKey = PrivateKey.fromString('L1Ejc5dAigm5XrM3mNptMEsNnHzS7s51YxU7J61ewGshZTKkbmzJ')
    //     const bobPrivateKey = PrivateKey.fromString('KxfxrUXSMjJQcb3JgnaaA6MqsrKQ1nBSxvhuigdKRyFiEm6BZDgG')

    //     it('should do these test vectors correctly', () => {
    //         const message = toArray('this is my test message', 'utf8')

    //         ECIES.electrumDecrypt(
    //             toArray(
    //                 'QklFMQOGFyMXLo9Qv047K3BYJhmnJgt58EC8skYP/R2QU/U0yXXHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbiaH4FsxKIOOvzolIFVAS0FplUmib2HnlAM1yP/iiPsU=',
    //                 'base64'
    //             ),
    //             alicePrivateKey
    //         )
    //             .toString()
    //             .should.equal(message.toString())
    //         ECIES.electrumDecrypt(
    //             toArray(
    //                 'QklFMQM55QTWSSsILaluEejwOXlrBs1IVcEB4kkqbxDz4Fap53XHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbvZJHgyAzxA6SoujduvJXv+A9ri3po9veilrmc8p6dwo=',
    //                 'base64'
    //             ),
    //             bobPrivateKey
    //         )
    //             .toString()
    //             .should.equal(message.toString())

    //         ECIES.electrumEncrypt(message, bobPrivateKey.pubKey, alicePrivateKey)
    //             .toString('base64')
    //             .should.equal(
    //                 'QklFMQM55QTWSSsILaluEejwOXlrBs1IVcEB4kkqbxDz4Fap53XHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbvZJHgyAzxA6SoujduvJXv+A9ri3po9veilrmc8p6dwo='
    //             )
    //         ECIES.electrumEncrypt(message, alicePrivateKey.pubKey, bobPrivateKey)
    //             .toString('base64')
    //             .should.equal(
    //                 'QklFMQOGFyMXLo9Qv047K3BYJhmnJgt58EC8skYP/R2QU/U0yXXHOt6L3tKmrXho6yj6phfoiMkBOhUldRPnEI4fSZXbiaH4FsxKIOOvzolIFVAS0FplUmib2HnlAM1yP/iiPsU='
    //             )
    //     })

    //     it('should encrypt and decrypt symmetrically with matching strings in ECDH noKey mode', () => {
    //         const message = toArray('this is my ECDH test message', 'utf8')
    //         const ecdhMessageEncryptedBob = ECIES.electrumEncrypt(message, bobPrivateKey.toPublicKey(), alicePrivateKey, true)
    //         const ecdhMessageEncryptedAlice = ECIES.electrumEncrypt(message, alicePrivateKey.toPublicKey(), bobPrivateKey, true)
    //         ecdhMessageEncryptedBob.toString('base64').should.equal(ecdhMessageEncryptedAlice.toString('base64'))
    //         ECIES.electrumDecrypt(ecdhMessageEncryptedAlice, bobPrivateKey, alicePrivateKey.toPublicKey())
    //             .toString()
    //             .should.equal('this is my ECDH test message')
    //         ECIES.electrumDecrypt(ecdhMessageEncryptedBob, alicePrivateKey, bobPrivateKey.toPublicKey())
    //             .toString()
    //             .should.equal('this is my ECDH test message')
    //     })
    // })
})