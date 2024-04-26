import { fromBase58Check, toBase58Check, Writer, Reader, toArray, toHex } from '../primitives/utils.js'
import * as Hash from '../primitives/Hash.js'
import Curve from '../primitives/Curve.js'
import PrivateKey from '../primitives/PrivateKey.js'
import PublicKey from '../primitives/PublicKey.js'
import Random from '../primitives/Random.js'
import BigNumber from '../primitives/BigNumber.js'

/**
 * @deprecated
 * The HD class implements the Bitcoin Improvement Proposal 32 (BIP32) hierarchical deterministic wallets.
 * It allows the generation of child keys from a master key, ensuring a tree-like structure of keys and addresses.
 * This class is deprecated due to the introduction of BRC-42, which offers an enhanced key derivation scheme.
 * BRC-42 uses invoice numbers for key derivation, improving privacy and scalability compared to BIP32.
 *
 * @class HD
 * @deprecated Replaced by BRC-42 which uses invoice numbers and supports private derivation.
 */
export default class HD {
  versionBytesNum: number
  depth: number
  parentFingerPrint: number[]
  childIndex: number
  chainCode: number[]
  privKey: PrivateKey
  pubKey: PublicKey
  constants = {
    pubKey: 0x0488b21e,
    privKey: 0x0488ade4
  }

  /**
     * Constructor for the BIP32 HD wallet.
     * Initializes an HD wallet with optional parameters for version bytes, depth, parent fingerprint, child index, chain code, private key, and public key.
     * @param versionBytesNum - Version bytes number for the wallet.
     * @param depth - Depth of the key in the hierarchy.
     * @param parentFingerPrint - Fingerprint of the parent key.
     * @param childIndex - Index of the child key.
     * @param chainCode - Chain code for key derivation.
     * @param privKey - Private key of the wallet.
     * @param pubKey - Public key of the wallet.
     */
  constructor (
    versionBytesNum?: number,
    depth?: number,
    parentFingerPrint?: number[],
    childIndex?: number,
    chainCode?: number[],
    privKey?: PrivateKey,
    pubKey?: PublicKey
  ) {
    this.versionBytesNum = versionBytesNum
    this.depth = depth
    this.parentFingerPrint = parentFingerPrint
    this.childIndex = childIndex
    this.chainCode = chainCode
    this.privKey = privKey
    this.pubKey = pubKey
  }

  /**
     * Generates a new HD wallet with random keys.
     * This method creates a root HD wallet with randomly generated private and public keys.
     * @returns {HD} The current HD instance with generated keys.
     */
  public fromRandom (): this {
    this.versionBytesNum = this.constants.privKey
    this.depth = 0x00
    this.parentFingerPrint = [0, 0, 0, 0]
    this.childIndex = 0
    this.chainCode = Random(32)
    this.privKey = PrivateKey.fromRandom()
    this.pubKey = this.privKey.toPublicKey()
    return this
  }

  /**
     * Generates a new HD wallet with random keys.
     * This method creates a root HD wallet with randomly generated private and public keys.
     * @returns {HD} A new HD instance with generated keys.
     * @static
     */
  public static fromRandom (): HD {
    return new this().fromRandom()
  }

  /**
   * Initializes the HD wallet from a given base58 encoded string.
   * This method decodes a provided string to set up the HD wallet's properties.
   * @param str - A base58 encoded string representing the wallet.
   * @returns {HD} The new instance with properties set from the string.
   */
  public static fromString (str: string): HD {
    return new this().fromString(str)
  }

  /**
     * Initializes the HD wallet from a given base58 encoded string.
     * This method decodes a provided string to set up the HD wallet's properties.
     * @param str - A base58 encoded string representing the wallet.
     * @returns {HD} The current instance with properties set from the string.
     */
  public fromString (str: string): this {
    const decoded = fromBase58Check(str)
    return this.fromBinary([...decoded.prefix, ...decoded.data] as number[])
  }

  /**
   * Initializes the HD wallet from a seed.
   * This method generates keys and other properties from a given seed, conforming to the BIP32 specification.
   * @param bytes - An array of bytes representing the seed.
   * @returns {HD} The current instance with properties set from the seed.
   */
  public static fromSeed (bytes: number[]): HD {
    return new this().fromSeed(bytes)
  }

  /**
     * Initializes the HD wallet from a seed.
     * This method generates keys and other properties from a given seed, conforming to the BIP32 specification.
     * @param bytes - An array of bytes representing the seed.
     * @returns {HD} The current instance with properties set from the seed.
     */
  public fromSeed (bytes: number[]): this {
    if (bytes.length < 128 / 8) {
      throw new Error('Need more than 128 bits of entropy')
    }
    if (bytes.length > 512 / 8) {
      throw new Error('More than 512 bits of entropy is nonstandard')
    }
    const hash: number[] = Hash.sha512hmac(toArray('Bitcoin seed', 'utf8'), bytes)

    this.depth = 0x00
    this.parentFingerPrint = [0, 0, 0, 0]
    this.childIndex = 0
    this.chainCode = hash.slice(32, 64)
    this.versionBytesNum = this.constants.privKey
    this.privKey = new PrivateKey(hash.slice(0, 32))
    this.pubKey = this.privKey.toPublicKey()

    return this
  }

  /**
   * Initializes the HD wallet from a binary buffer.
   * Parses a binary buffer to set up the wallet's properties.
   * @param buf - A buffer containing the wallet data.
   * @returns {HD} The new instance with properties set from the buffer.
   */
  public static fromBinary (buf: number[]): HD {
    return new this().fromBinary(buf)
  }

  /**
   * Initializes the HD wallet from a binary buffer.
   * Parses a binary buffer to set up the wallet's properties.
   * @param buf - A buffer containing the wallet data.
   * @returns {HD} The current instance with properties set from the buffer.
   */
  public fromBinary (buf: number[]): this {
    // Both pub and private extended keys are 78 buf
    if (buf.length !== 78) {
      throw new Error('incorrect bip32 data length')
    }
    const reader = new Reader(buf)

    this.versionBytesNum = reader.readUInt32BE()
    this.depth = reader.readUInt8()
    this.parentFingerPrint = reader.read(4)
    this.childIndex = reader.readUInt32BE()
    this.chainCode = reader.read(32)
    const keyBytes = reader.read(33)

    const isPrivate = this.versionBytesNum === this.constants.privKey
    const isPublic = this.versionBytesNum === this.constants.pubKey

    if (isPrivate && keyBytes[0] === 0) {
      this.privKey = new PrivateKey(keyBytes.slice(1, 33))
      this.pubKey = this.privKey.toPublicKey()
    } else if (isPublic && (keyBytes[0] === 0x02 || keyBytes[0] === 0x03)) {
      this.pubKey = PublicKey.fromString(toHex(keyBytes))
    } else {
      throw new Error('Invalid key')
    }

    return this
  }

  /**
   * Converts the HD wallet to a base58 encoded string.
   * This method provides a string representation of the HD wallet's current state.
   * @returns {string} A base58 encoded string of the HD wallet.
   */
  public toString (): string {
    const bin = this.toBinary()
    return toBase58Check(bin, [])
  }

  /**
     * Derives a child HD wallet based on a given path.
     * The path specifies the hierarchy of the child key to be derived.
     * @param path - A string representing the derivation path (e.g., 'm/0'/1).
     * @returns {HD} A new HD instance representing the derived child wallet.
     */
  public derive (path: string): HD {
    if (path === 'm') {
      return this
    }

    const e = path.split('/')

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let bip32: HD = this
    for (const i in e) {
      const c = e[i]

      if (i === '0') {
        if (c !== 'm') {
          throw new Error('invalid path')
        }
        continue
      }

      if (parseInt(c.replace("'", ''), 10).toString() !== c.replace("'", '')) {
        throw new Error('invalid path')
      }

      const usePrivate = c.length > 1 && c[c.length - 1] === "'"
      let childIndex = parseInt(usePrivate ? c.slice(0, c.length - 1) : c, 10) & 0x7fffffff

      if (usePrivate) {
        childIndex += 0x80000000
      }

      bip32 = bip32.deriveChild(childIndex)
    }

    return bip32
  }

  /**
     * Derives a child HD wallet from the current wallet based on an index.
     * This method generates either a private or public child key depending on the current wallet's state.
     * @param i - The index of the child key to derive.
     * @returns {HD} A new HD instance representing the derived child wallet.
     */
  public deriveChild (i: number): HD {
    if (typeof i !== 'number') {
      throw new Error('i must be a number')
    }

    const ibc: number[] = []
    ibc.push((i >> 24) & 0xff)
    ibc.push((i >> 16) & 0xff)
    ibc.push((i >> 8) & 0xff)
    ibc.push(i & 0xff)
    const ib = [...ibc]

    const usePrivate = (i & 0x80000000) !== 0

    const isPrivate = this.versionBytesNum === this.constants.privKey

    if (usePrivate && (!this.privKey || !isPrivate)) {
      throw new Error('Cannot do private key derivation without private key')
    }

    let ret = null
    if (this.privKey) {
      let data = null

      if (usePrivate) {
        data = [0, ...this.privKey.toArray('be', 32), ...ib]
      } else {
        data = [...this.pubKey.encode(true) as number[], ...ib]
      }

      const hash = Hash.sha512hmac(this.chainCode, data)
      const il = new BigNumber(hash.slice(0, 32))
      const ir = hash.slice(32, 64)

      // ki = IL + kpar (mod n).
      const k = il.add(this.privKey).mod(new Curve().n)

      ret = new HD()
      ret.chainCode = ir

      ret.privKey = new PrivateKey(k.toArray())
      ret.pubKey = ret.privKey.toPublicKey()
    } else {
      const data = [...this.pubKey.encode(true) as number[], ...ib]
      const hash = Hash.sha512hmac(this.chainCode, data)
      const il = new BigNumber(hash.slice(0, 32))
      const ir = hash.slice(32, 64)

      // Ki = (IL + kpar)*G = IL*G + Kpar
      const ilG = new Curve().g.mul(il)
      const Kpar = this.pubKey
      const Ki = ilG.add(Kpar)
      const newpub = new PublicKey(Ki.x, Ki.y)

      ret = new HD()
      ret.chainCode = ir

      ret.pubKey = newpub
    }

    ret.childIndex = i
    const pubKeyhash = Hash.hash160(this.pubKey.encode(true))
    ret.parentFingerPrint = pubKeyhash.slice(0, 4)
    ret.versionBytesNum = this.versionBytesNum
    ret.depth = this.depth + 1

    return ret
  }

  /**
     * Converts the current HD wallet to a public-only wallet.
     * This method strips away the private key information, leaving only the public part.
     * @returns {HD} A new HD instance representing the public-only wallet.
     */
  public toPublic (): HD {
    const bip32 = new HD(this.versionBytesNum, this.depth, this.parentFingerPrint, this.childIndex, this.chainCode, this.privKey, this.pubKey)
    bip32.versionBytesNum = this.constants.pubKey
    bip32.privKey = undefined
    return bip32
  }

  /**
     * Converts the HD wallet into a binary representation.
     * This method serializes the wallet's properties into a binary format.
     * @returns {number[]} An array of numbers representing the binary data of the wallet.
     */
  public toBinary (): number[] {
    const isPrivate = this.versionBytesNum === this.constants.privKey
    const isPublic = this.versionBytesNum === this.constants.pubKey
    if (isPrivate) {
      return new Writer()
        .writeUInt32BE(this.versionBytesNum)
        .writeUInt8(this.depth)
        .write(this.parentFingerPrint)
        .writeUInt32BE(this.childIndex)
        .write(this.chainCode)
        .writeUInt8(0)
        .write(this.privKey.toArray('be', 32))
        .toArray()
    } else if (isPublic) {
      return new Writer()
        .writeUInt32BE(this.versionBytesNum)
        .writeUInt8(this.depth)
        .write(this.parentFingerPrint)
        .writeUInt32BE(this.childIndex)
        .write(this.chainCode)
        .write(this.pubKey.encode(true) as number[])
        .toArray()
    } else {
      throw new Error('bip32: invalid versionBytesNum byte')
    }
  }

  /**
     * Checks if the HD wallet contains a private key.
     * This method determines whether the wallet is a private key wallet or a public key only wallet.
     * @returns {boolean} A boolean value indicating whether the wallet has a private key (true) or not (false).
     */
  public isPrivate (): boolean {
    return this.versionBytesNum === this.constants.privKey
  }
}
