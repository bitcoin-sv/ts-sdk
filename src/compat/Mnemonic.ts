import { wordList } from './bip-39-wordlist-en.js'
import { encode, toArray, Reader, Writer } from '../primitives/utils.js'
import * as Hash from '../primitives/Hash.js'
import Random from '../primitives/Random.js'

/**
 * @class Mnemonic
 *
 * @description
 * Class representing Mnemonic functionality.
 * This class provides methods for generating, converting, and validating mnemonic phrases
 * according to the BIP39 standard. It supports creating mnemonics from random entropy,
 * converting mnemonics to seeds, and validating mnemonic phrases.
 */
export default class Mnemonic {
  public mnemonic: string
  public seed: number[]
  public Wordlist: { value: string[], space: string }

  /**
     * Constructs a Mnemonic object.
     * @param {string} [mnemonic] - An optional mnemonic phrase.
     * @param {number[]} [seed] - An optional seed derived from the mnemonic.
     * @param {object} [wordlist=wordList] - An object containing a list of words and space character used in the mnemonic.
     */
  constructor (mnemonic?: string, seed?: number[], wordlist = wordList) {
    this.mnemonic = mnemonic
    this.seed = seed
    this.Wordlist = wordlist
  }

  /**
     * Converts the mnemonic and seed into a binary representation.
     * @returns {number[]} The binary representation of the mnemonic and seed.
     */
  public toBinary (): number[] {
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

  /**
     * Loads a mnemonic and seed from a binary representation.
     * @param {number[]} bin - The binary representation of a mnemonic and seed.
     * @returns {this} The Mnemonic instance with loaded mnemonic and seed.
     */
  public fromBinary (bin: number[]): this {
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
     * Generates a random mnemonic from a given bit length.
     * @param {number} [bits=128] - The bit length for the random mnemonic (must be a multiple of 32 and at least 128).
     * @returns {this} The Mnemonic instance with the new random mnemonic.
     * @throws {Error} If the bit length is not a multiple of 32 or is less than 128.
     */
  public fromRandom (bits?: number): this {
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

  /**
     * Static method to generate a Mnemonic instance with a random mnemonic.
     * @param {number} [bits=128] - The bit length for the random mnemonic.
     * @returns {Mnemonic} A new Mnemonic instance.
     */
  public static fromRandom (bits?: number): Mnemonic {
    return new this().fromRandom(bits)
  }

  /**
     * Converts given entropy into a mnemonic phrase.
     * This method is used to generate a mnemonic from a specific entropy source.
     * @param {number[]} buf - The entropy buffer, must be at least 128 bits.
     * @returns {this} The Mnemonic instance with the mnemonic set from the given entropy.
     * @throws {Error} If the entropy is less than 128 bits.
     */
  public fromEntropy (buf: number[]): this {
    this.entropy2Mnemonic(buf)
    return this
  }

  /**
     * Static method to create a Mnemonic instance from a given entropy.
     * @param {number[]} buf - The entropy buffer.
     * @returns {Mnemonic} A new Mnemonic instance.
     */
  public static fromEntropy (buf: number[]): Mnemonic {
    return new this().fromEntropy(buf)
  }

  /**
     * Sets the mnemonic for the instance from a string.
     * @param {string} mnemonic - The mnemonic phrase as a string.
     * @returns {this} The Mnemonic instance with the set mnemonic.
     */
  public fromString (mnemonic: string): this {
    this.mnemonic = mnemonic
    return this
  }

  /**
     * Static method to create a Mnemonic instance from a mnemonic string.
     * @param {string} str - The mnemonic phrase.
     * @returns {Mnemonic} A new Mnemonic instance.
     */
  public static fromString (str: string): Mnemonic {
    return new this().fromString(str)
  }

  /**
     * Converts the instance's mnemonic to a string representation.
     * @returns {string} The mnemonic phrase as a string.
     */
  public toString (): string {
    return this.mnemonic
  }

  /**
     * Converts the mnemonic to a seed.
     * The mnemonic must pass the validity check before conversion.
     * @param {string} [passphrase=''] - An optional passphrase for additional security.
     * @returns {number[]} The generated seed.
     * @throws {Error} If the mnemonic is invalid.
     */
  public toSeed (passphrase?: string): number[] {
    this.mnemonic2Seed(passphrase)
    return this.seed
  }

  /**
     * Converts entropy to a mnemonic phrase.
     * This method takes a buffer of entropy and converts it into a corresponding
     * mnemonic phrase based on the Mnemonic wordlist. The entropy should be at least 128 bits.
     * The method applies a checksum and maps the entropy to words in the wordlist.
     * @param {number[]} buf - The entropy buffer to convert. Must be at least 128 bits.
     * @returns {this} The Mnemonic instance with the mnemonic set from the entropy.
     * @throws {Error} If the entropy is less than 128 bits or if it's not an even multiple of 11 bits.
     */
  public entropy2Mnemonic (buf: number[]): this {
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
     * Validates the mnemonic phrase.
     * Checks for correct length, absence of invalid words, and proper checksum.
     * @returns {boolean} True if the mnemonic is valid, false otherwise.
     * @throws {Error} If the mnemonic is not an even multiple of 11 bits.
     */
  public check (): boolean {
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
     * Converts a mnemonic to a seed.
     * This method takes the instance's mnemonic phrase, combines it with a passphrase (if provided),
     * and uses PBKDF2 to generate a seed. It also validates the mnemonic before conversion.
     * This seed can then be used for generating deterministic keys.
     * @param {string} [passphrase=''] - An optional passphrase for added security.
     * @returns {this} The Mnemonic instance with the seed generated from the mnemonic.
     * @throws {Error} If the mnemonic does not pass validation or if the passphrase is not a string.
     */
  public mnemonic2Seed (passphrase = ''): this {
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

  /**
     * Determines the validity of a given passphrase with the mnemonic.
     * This method is useful for checking if a passphrase matches with the mnemonic.
     * @param {string} [passphrase=''] - The passphrase to validate.
     * @returns {boolean} True if the mnemonic and passphrase combination is valid, false otherwise.
     */
  public isValid (passphrase = ''): boolean {
    let isValid
    try {
      isValid = !!this.mnemonic2Seed(passphrase)
    } catch (err) {
      isValid = false
    }
    return isValid
  }

  /**
     * Static method to check the validity of a given mnemonic and passphrase combination.
     * @param {string} mnemonic - The mnemonic phrase.
     * @param {string} [passphrase=''] - The passphrase to validate.
     * @returns {boolean} True if the combination is valid, false otherwise.
     */
  public static isValid (mnemonic: string, passphrase = ''): boolean {
    return new Mnemonic(mnemonic).isValid(passphrase)
  }
}
