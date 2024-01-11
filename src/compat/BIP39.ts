import { wordList } from './bip-39-wordlist-en.js'
import { encode, toArray, Reader, Writer } from '../primitives/utils.js'
import * as Hash from '../primitives/Hash.js'
import Random from '../primitives/Random.js'

export default class BIP39 {
    public mnemonic: string
    public seed: number[]
    public Wordlist: { value: string[]; space: string }

    constructor(mnemonic?: string, seed?: number[], wordlist = wordList) {
        this.mnemonic = mnemonic
        this.seed = seed
        this.Wordlist = wordlist
    }

    public toBinary(): number[] {
        const bw = new Writer()
        if (this.mnemonic) {
            const buf = toArray(this.mnemonic, 'utf8')
            bw.writeVarIntNum(buf.length)
            bw.write(buf)
        } else {
            bw.writeVarIntNum(0)
        }
        if (this.seed) {
            bw.writeVarIntNum(this.seed.length)
            bw.write(this.seed)
        } else {
            bw.writeVarIntNum(0)
        }
        return bw.toArray()
    }

    public fromBinary(bin: number[]): this {
        const br = new Reader(bin)
        const mnemoniclen = br.readVarIntNum()
        if (mnemoniclen > 0) {
            this.mnemonic = encode(br.read(mnemoniclen), 'utf8') as string
        }
        const seedlen = br.readVarIntNum()
        if (seedlen > 0) {
            this.seed = br.read(seedlen)
        }
        return this
    }

    /**
     * Generate a random new mnemonic from the wordlist.
     */
    public fromRandom(bits?: number): this {
        if (!bits) {
            bits = 128
        }
        if (bits % 32 !== 0) {
            throw new Error('bits must be multiple of 32')
        }
        if (bits < 128) {
            throw new Error('bits must be at least 128')
        }
        const buf = Random(bits / 8)
        this.entropy2Mnemonic(buf)
        this.mnemonic2Seed()
        return this
    }

    public static fromRandom(bits?: number): BIP39 {
        return new this().fromRandom(bits)
    }

    public fromEntropy(buf: number[]): this {
        this.entropy2Mnemonic(buf)
        return this
    }

    public static fromEntropy(buf: number[]): BIP39 {
        return new this().fromEntropy(buf)
    }

    public fromString(mnemonic: string): this {
        this.mnemonic = mnemonic
        return this
    }

    public static fromString(str: string): BIP39 {
        return new this().fromString(str)
    }

    public toString(): string {
        return this.mnemonic
    }

    public toSeed(passphrase?: string): number[] {
        this.mnemonic2Seed(passphrase)
        return this.seed
    }

    /**
     * Generate a new mnemonic from some entropy generated somewhere else. The
     * entropy must be at least 128 bits.
     */
    public entropy2Mnemonic(buf: number[]): this {
        if (buf.length < 128 / 8) {
            throw new Error('Entropy is less than 128 bits. It must be 128 bits or more.')
        }

        const hash = Hash.sha256(buf)
        let bin = ''
        const bits = buf.length * 8
        for (let i = 0; i < buf.length; i++) {
            bin = bin + ('00000000' + buf[i].toString(2)).slice(-8)
        }
        let hashbits = hash[0].toString(2)
        hashbits = ('00000000' + hashbits).slice(-8).slice(0, bits / 32)
        bin = bin + hashbits

        if (bin.length % 11 !== 0) {
            throw new Error('internal error - entropy not an even multiple of 11 bits - ' + bin.length)
        }

        let mnemonic = ''
        for (let i = 0; i < bin.length / 11; i++) {
            if (mnemonic !== '') {
                mnemonic = mnemonic + this.Wordlist.space
            }
            const wi = parseInt(bin.slice(i * 11, (i + 1) * 11), 2)
            mnemonic = mnemonic + this.Wordlist.value[wi]
        }

        this.mnemonic = mnemonic
        return this
    }

    /**
     * Check that a mnemonic is valid. This means there should be no superfluous
     * whitespace, no invalid words, and the checksum should match.
     */
    public check(): boolean {
        const mnemonic = this.mnemonic

        // confirm no invalid words
        const words = mnemonic.split(this.Wordlist.space)
        let bin = ''
        for (let i = 0; i < words.length; i++) {
            const ind = this.Wordlist.value.indexOf(words[i])
            if (ind < 0) {
                return false
            }
            bin = bin + ('00000000000' + ind.toString(2)).slice(-11)
        }

        if (bin.length % 11 !== 0) {
            throw new Error('internal error - entropy not an even multiple of 11 bits - ' + bin.length)
        }

        // confirm checksum
        const cs = bin.length / 33
        const hashBits = bin.slice(-cs)
        const nonhashBits = bin.slice(0, bin.length - cs)
        const buf = []
        for (let i = 0; i < nonhashBits.length / 8; i++) {
            buf.push(parseInt(bin.slice(i * 8, (i + 1) * 8), 2))
        }
        const hash = Hash.sha256(buf.slice(0, nonhashBits.length / 8))
        let expectedHashBits = hash[0].toString(2)
        expectedHashBits = ('00000000' + expectedHashBits).slice(-8).slice(0, cs)

        return expectedHashBits === hashBits
    }

    /**
     * Convert a mnemonic to a seed. Does not check for validity of the mnemonic -
     * for that, you should manually run check() first.
     */
    public mnemonic2Seed(passphrase = ''): this {
        let mnemonic = this.mnemonic
        if (!this.check()) {
            throw new Error(
                'Mnemonic does not pass the check - was the mnemonic typed incorrectly? Are there extra spaces?'
            )
        }
        if (typeof passphrase !== 'string') {
            throw new Error('passphrase must be a string or undefined')
        }
        mnemonic = mnemonic.normalize('NFKD')
        passphrase = passphrase.normalize('NFKD')
        const mbuf = toArray(mnemonic, 'utf8')
        const pbuf = [...toArray('mnemonic', 'utf8'), ...toArray(passphrase, 'utf8')]
        this.seed = Hash.pbkdf2(mbuf, pbuf, 2048, 64, 'sha512')
        return this
    }

    public isValid(passphrase = ''): boolean {
        let isValid
        try {
            isValid = !!this.mnemonic2Seed(passphrase)
        } catch (err) {
            isValid = false
        }
        return isValid
    }

    public static isValid(mnemonic: string, passphrase = ''): boolean {
        return new BIP39(mnemonic).isValid(passphrase)
    }
}