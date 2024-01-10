import { sign, verify, magicHash } from '../../../dist/cjs/src/compat/BSM'
import { toArray } from '../../../dist/cjs/src/primitives/utils'
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'

describe('BSM', () => {
    describe('magicHash', () => {
        it('should return a hash', () => {
            const buf = toArray('001122', 'hex')
            const hashBuf = magicHash(buf)
            expect(hashBuf.length).toEqual(32)
        })
    })
    describe('sign', () => {
        const messageBuf = toArray('this is my message', 'utf8')
        const privateKey = new PrivateKey(42)
        it('should return a signature', () => {
            const sig = sign(messageBuf, privateKey).toDER()
            expect(sig.length).toEqual(70)
        })
    })
    describe('verify', () => {
        const messageBuf = toArray('this is my message', 'utf8')
        const privateKey = new PrivateKey(42)

        it('should verify a signed message', () => {
            const sig = sign(messageBuf, privateKey)
            expect(verify(messageBuf, sig, privateKey.toPublicKey())).toEqual(true)
        })
    })
})