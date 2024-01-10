// /**
//  * Bip39: Mnemonic Seeds
//  * =====================
//  *
//  * Bip39 is a way to turn random entropy into a mnemonic (a string of words
//  * from a wordlist), and then that mnemonic into a seed. The seed can then be
//  * used in Bip32 to derive hierarchical deterministic keys. It does not go the
//  * other way around (i.e., you cannot turn a seed into a mnemonic). The usual
//  * way to use it is either to generate a new one, like this:
//  *
//  * const mnemonic = new Bip39().fromRandom().toString()
//  *
//  * or from a known mnemonic:
//  *
//  * const seed = new Bip39().fromString(mnemonic).toSeed()
//  */
// import * as pbkdf2 from 'pbkdf2'
// import { wordList } from './bip-39-en-wordlist'
// import { Br } from './br'
// import { Bw } from './bw'
// import { Hash } from './hash'
// import { Random } from './random'
// import { Struct } from './struct'
// import { Workers } from './workers'

// export class Bip39 extends Struct {
//     public mnemonic: string
//     public seed: Buffer
//     public Wordlist: { value: string[]; space: string }

//     constructor(mnemonic?: string, seed?: Buffer, wordlist = wordList) {
//         super({ mnemonic, seed })
//         this.Wordlist = wordlist
//     }

//     public toBw(bw?: Bw): Bw {
//         if (!bw) {
//             bw = new Bw()
//         }
//         if (this.mnemonic) {
//             const buf = Buffer.from(this.mnemonic)
//             bw.writeVarIntNum(buf.length)
//             bw.write(buf)
//         } else {
//             bw.writeVarIntNum(0)
//         }
//         if (this.seed) {
//             bw.writeVarIntNum(this.seed.length)
//             bw.write(this.seed)
//         } else {
//             bw.writeVarIntNum(0)
//         }
//         return bw
//     }

//     public fromBr(br: Br): this {
//         const mnemoniclen = br.readVarIntNum()
//         if (mnemoniclen > 0) {
//             this.mnemonic = br.read(mnemoniclen).toString()
//         }
//         const seedlen = br.readVarIntNum()
//         if (seedlen > 0) {
//             this.seed = br.read(seedlen)
//         }
//         return this
//     }

//     /**
//      * Generate a random new mnemonic from the wordlist.
//      */
//     public fromRandom(bits?: number): this {
//         if (!bits) {
//             bits = 128
//         }
//         if (bits % 32 !== 0) {
//             throw new Error('bits must be multiple of 32')
//         }
//         if (bits < 128) {
//             throw new Error('bits must be at least 128')
//         }
//         const buf = Random.getRandomBuffer(bits / 8)
//         this.entropy2Mnemonic(buf)
//         this.mnemonic2Seed()
//         return this
//     }

//     public static fromRandom(bits?: number): Bip39 {
//         return new this().fromRandom(bits)
//     }

//     public async asyncFromRandom(bits?: number): Promise<this> {
//         if (!bits) {
//             bits = 128
//         }
//         const buf = Random.getRandomBuffer(bits / 8)
//         let workersResult = await Workers.asyncObjectMethod(this, 'entropy2Mnemonic', [buf])
//         const bip39 = new Bip39().fromFastBuffer(workersResult.resbuf)
//         workersResult = await Workers.asyncObjectMethod(bip39, 'mnemonic2Seed', [])
//         return this.fromFastBuffer(workersResult.resbuf)
//     }

//     public static asyncFromRandom(bits?: number): Promise<Bip39> {
//         return new this().asyncFromRandom(bits)
//     }

//     public fromEntropy(buf: Buffer): this {
//         this.entropy2Mnemonic(buf)
//         return this
//     }

//     public static fromEntropy(buf: Buffer): Bip39 {
//         return new this().fromEntropy(buf)
//     }

//     public async asyncFromEntropy(buf: Buffer): Promise<this> {
//         const workersResult = await Workers.asyncObjectMethod(this, 'fromEntropy', [buf])
//         return this.fromFastBuffer(workersResult.resbuf)
//     }

//     public static asyncFromEntropy(buf: Buffer): Promise<Bip39> {
//         return new this().asyncFromEntropy(buf)
//     }

//     public fromString(mnemonic: string): this {
//         this.mnemonic = mnemonic
//         return this
//     }

//     public toString(): string {
//         return this.mnemonic
//     }

//     public toSeed(passphrase?: string): Buffer {
//         this.mnemonic2Seed(passphrase)
//         return this.seed
//     }

//     public async asyncToSeed(passphrase?: string): Promise<Buffer> {
//         if (passphrase === undefined) {
//             passphrase = ''
//         }
//         const args = [passphrase]
//         const workersResult = await Workers.asyncObjectMethod(this, 'toSeed', args)
//         return workersResult.resbuf
//     }

//     /**
//      * Generate a new mnemonic from some entropy generated somewhere else. The
//      * entropy must be at least 128 bits.
//      */
//     public entropy2Mnemonic(buf: Buffer): this {
//         if (!Buffer.isBuffer(buf) || buf.length < 128 / 8) {
//             throw new Error('Entropy is less than 128 bits. It must be 128 bits or more.')
//         }

//         const hash = Hash.sha256(buf)
//         let bin = ''
//         const bits = buf.length * 8
//         for (let i = 0; i < buf.length; i++) {
//             bin = bin + ('00000000' + buf[i].toString(2)).slice(-8)
//         }
//         let hashbits = hash[0].toString(2)
//         hashbits = ('00000000' + hashbits).slice(-8).slice(0, bits / 32)
//         bin = bin + hashbits

//         if (bin.length % 11 !== 0) {
//             throw new Error('internal error - entropy not an even multiple of 11 bits - ' + bin.length)
//         }

//         let mnemonic = ''
//         for (let i = 0; i < bin.length / 11; i++) {
//             if (mnemonic !== '') {
//                 mnemonic = mnemonic + this.Wordlist.space
//             }
//             const wi = parseInt(bin.slice(i * 11, (i + 1) * 11), 2)
//             mnemonic = mnemonic + this.Wordlist.value[wi]
//         }

//         this.mnemonic = mnemonic
//         return this
//     }

//     /**
//      * Check that a mnemonic is valid. This means there should be no superfluous
//      * whitespace, no invalid words, and the checksum should match.
//      */
//     public check(): boolean {
//         const mnemonic = this.mnemonic

//         // confirm no invalid words
//         const words = mnemonic.split(this.Wordlist.space)
//         let bin = ''
//         for (let i = 0; i < words.length; i++) {
//             const ind = this.Wordlist.value.indexOf(words[i])
//             if (ind < 0) {
//                 return false
//             }
//             bin = bin + ('00000000000' + ind.toString(2)).slice(-11)
//         }

//         if (bin.length % 11 !== 0) {
//             throw new Error('internal error - entropy not an even multiple of 11 bits - ' + bin.length)
//         }

//         // confirm checksum
//         const cs = bin.length / 33
//         const hashBits = bin.slice(-cs)
//         const nonhashBits = bin.slice(0, bin.length - cs)
//         const buf = Buffer.alloc(nonhashBits.length / 8)
//         for (let i = 0; i < nonhashBits.length / 8; i++) {
//             buf.writeUInt8(parseInt(bin.slice(i * 8, (i + 1) * 8), 2), i)
//         }
//         const hash = Hash.sha256(buf)
//         let expectedHashBits = hash[0].toString(2)
//         expectedHashBits = ('00000000' + expectedHashBits).slice(-8).slice(0, cs)

//         return expectedHashBits === hashBits
//     }

//     /**
//      * Convert a mnemonic to a seed. Does not check for validity of the mnemonic -
//      * for that, you should manually run check() first.
//      */
//     public mnemonic2Seed(passphrase = ''): this {
//         let mnemonic = this.mnemonic
//         if (!this.check()) {
//             throw new Error(
//                 'Mnemonic does not pass the check - was the mnemonic typed incorrectly? Are there extra spaces?'
//             )
//         }
//         if (typeof passphrase !== 'string') {
//             throw new Error('passphrase must be a string or undefined')
//         }
//         mnemonic = mnemonic.normalize('NFKD')
//         passphrase = passphrase.normalize('NFKD')
//         const mbuf = Buffer.from(mnemonic)
//         const pbuf = Buffer.concat([Buffer.from('mnemonic'), Buffer.from(passphrase)])
//         this.seed = pbkdf2.pbkdf2Sync(mbuf, pbuf, 2048, 64, 'sha512')
//         return this
//     }

//     public isValid(passphrase = ''): boolean {
//         let isValid
//         try {
//             isValid = !!this.mnemonic2Seed(passphrase)
//         } catch (err) {
//             isValid = false
//         }
//         return isValid
//     }

//     public static isValid(mnemonic: string, passphrase = ''): boolean {
//         return new Bip39(mnemonic).isValid(passphrase)
//     }
// }