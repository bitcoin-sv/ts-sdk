import BIP39 from '../../../dist/cjs/src/compat/BIP39'
import { wordList as enWordList } from '../../../dist/cjs/src/compat/bip-39-wordlist-en'
import Random from '../../../dist/cjs/src/primitives/Random'
import vectors from './BIP39.vectors'
import HD from '../../../dist/cjs/src/compat/HD'
import { toBase58Check, toHex, toArray } from '../../../dist/cjs/src/primitives/utils'

describe('BIP39', function () {
    it('should initialize the class', () => {
        expect(BIP39).toBeDefined()
        expect(new BIP39()).toBeDefined()
    })

    it('should have a wordlist of length 2048', () => {
        expect(enWordList.value.length).toEqual(2048)
    })

    it('should handle this community-derived test vector', () => {
        // There was a bug in Copay and bip32jp about deriving addresses with bip39
        // and bip44. This confirms we are handling the situation correctly and
        // derive the correct value.
        //
        // More information here:
        // https://github.com/iancoleman/bip39/issues/58
        const seed = BIP39.fromString('fruit wave dwarf banana earth journey tattoo true farm silk olive fence').toSeed(
            'banana'
        )
        let bip32 = HD.fromSeed(seed)
        bip32 = bip32.derive("m/44'/0'/0'/0/0")
        const pkh = bip32.pubKey.toHash()
        const addr = toBase58Check(pkh)
        expect(addr).toEqual('17rxURoF96VhmkcEGCj5LNQkmN9HVhWb7F')
    })

    it('should generate a mnemonic phrase that passes the check', () => {
        let mnemonic

        // should be able to make a mnemonic with or without the default wordlist
        let bip39 = new BIP39().fromRandom(128)
        expect(bip39.check()).toEqual(true)
        bip39 = new BIP39().fromRandom(128)
        expect(bip39.check()).toEqual(true)

        const entropy = Buffer.alloc(32)
        entropy.fill(0)
        bip39 = new BIP39().fromEntropy(entropy)
        expect(bip39.check()).toEqual(true)

        mnemonic = bip39.mnemonic

        // mnemonics with extra whitespace do not pass the check
        bip39 = new BIP39().fromString(mnemonic + ' ')
        expect(bip39.check()).toEqual(false)

        // mnemonics with a word replaced do not pass the check
        const words = mnemonic.split(' ')
        expect(words[words.length - 1]).not.toEqual('zoo')
        words[words.length - 1] = 'zoo'
        mnemonic = words.join(' ')
        expect(new BIP39().fromString(mnemonic).check()).toEqual(false)
    })

    describe('#toBinary', () => {
        it('should convert to a binary array', () => {
            const bip39 = new BIP39().fromRandom()
            expect(bip39.seed).toBeDefined()
            expect(bip39.mnemonic).toBeDefined()
            const buf = bip39.toBinary()
            expect(buf.length).toBeGreaterThan(512 / 8 + 1 + 1)
        })
    })

    describe('#fromBinary', () => {
        it('should convert from a binary array', () => {
            const bip39a = new BIP39().fromRandom()
            const bip39b = new BIP39().fromBinary(bip39a.toBinary())
            expect(bip39a.mnemonic).toEqual(bip39b.mnemonic)
            expect(toHex(bip39b.seed)).toEqual(toHex(bip39b.seed))
        })
    })

    describe('#fromRandom', () => {
        it('should throw an error if bits is too low', () => {
            expect(() => {
                new BIP39().fromRandom(127)
            }).toThrow('bits must be multiple of 32')
        })

        it('should throw an error if bits is not a multiple of 32', () => {
            expect(() => {
                new BIP39().fromRandom(256 - 1)
            }).toThrow('bits must be multiple of 32')
        })
    })

    describe('@fromRandom', () => {
        it('should throw an error if bits is too low', () => {
            expect(() => {
                BIP39.fromRandom(127)
            }).toThrow('bits must be multiple of 32')
        })

        it('should throw an error if bits is not a multiple of 32', () => {
            expect(() => {
                BIP39.fromRandom(256 - 1)
            }).toThrow('bits must be multiple of 32')
        })
    })

    describe('#fromEntropy', () => {
        it('should build from entropy', () => {
            const bip39 = new BIP39().fromEntropy(Random(32))
            expect(bip39).toBeDefined()
        })
    })

    describe('@fromEntropy', () => {
        it('should build from entropy', () => {
            const bip39 = BIP39.fromEntropy(Random(32))
            expect(bip39).toBeDefined()
        })
    })

    describe('#entropy2Mnemonic', () => {
        it('should throw an error if you do not use enough entropy', () => {
            const buf = Buffer.alloc(128 / 8 - 1)
            buf.fill(0)
            expect(() => {
                new BIP39().entropy2Mnemonic([...buf])
            }).toThrow('Entropy is less than 128 bits. It must be 128 bits or more.')
        })
    })

    describe('#fromString', () => {
        it('should throw an error in invalid mnemonic', () => {
            expect(() => {
                new BIP39().fromString('invalid mnemonic').toSeed()
            }).toThrow(
                'Mnemonic does not pass the check - was the mnemonic typed incorrectly? Are there extra spaces?'
            )
        })
    })

    describe('@isValid', () => {
        it('should know this is valid', () => {
            const isValid = BIP39.isValid(
                'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
                'TREZOR'
            )
            expect(isValid).toBe(true)
        })

        it('should know this is invalid', () => {
            const isValid = BIP39.isValid(
                'abandonnnnnnn abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
                'TREZOR'
            )
            expect(isValid).toEqual(false)
        })
    })

    describe('vectors', () => {
        // eslint-disable-next-line ban/ban
        vectors.english.forEach((vector, v) => {
            it('should pass english test vector ' + v, () => {
                const entropy = toArray(vector.entropy, 'hex')
                const bip39 = new BIP39().fromEntropy(entropy)
                expect(bip39.toString()).toEqual(vector.mnemonic)
                expect(bip39.check()).toEqual(true)
                const seed = bip39.toSeed(vector.passphrase)
                expect(toHex(seed)).toEqual(vector.seed)
                expect(new HD().fromSeed(seed).toString()).toEqual(vector.bip32_xprv)
            })
        })

    })
})
