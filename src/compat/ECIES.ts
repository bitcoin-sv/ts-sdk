// import { AESWrappercbc } from './aescbc'
import Random from '../primitives/Random.js'
import PrivateKey from '../primitives/PrivateKey.js'
import PublicKey from '../primitives/PublicKey.js'
import Point from '../primitives/Point.js'
import * as Hash from '../primitives/Hash.js'
import { toArray, toHex, encode } from '../primitives/utils.js'

function AES (key) {
  if (!this._tables[0][0][0]) this._precompute()

  let tmp, encKey, decKey
  const sbox = this._tables[0][4]
  const decTable = this._tables[1]
  const keyLen = key.length
  let rcon = 1

  if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
    throw new Error('invalid aes key size')
  }

  this._key = [encKey = key.slice(0), decKey = []]

  // schedule encryption keys
  for (var i = keyLen; i < 4 * keyLen + 28; i++) {
    tmp = encKey[i - 1]

    // apply sbox
    if (i % keyLen === 0 || (keyLen === 8 && i % keyLen === 4)) {
      tmp = sbox[tmp >>> 24] << 24 ^ sbox[tmp >> 16 & 255] << 16 ^ sbox[tmp >> 8 & 255] << 8 ^ sbox[tmp & 255]

      // shift rows and add rcon
      if (i % keyLen === 0) {
        tmp = tmp << 8 ^ tmp >>> 24 ^ rcon << 24
        rcon = rcon << 1 ^ (rcon >> 7) * 283
      }
    }

    encKey[i] = encKey[i - keyLen] ^ tmp
  }

  // schedule decryption keys
  for (let j = 0; i; j++, i--) {
    tmp = encKey[j & 3 ? i : i - 4]
    if (i <= 4 || j < 4) {
      decKey[j] = tmp
    } else {
      decKey[j] = decTable[0][sbox[tmp >>> 24]] ^
                decTable[1][sbox[tmp >> 16 & 255]] ^
                decTable[2][sbox[tmp >> 8 & 255]] ^
                decTable[3][sbox[tmp & 255]]
    }
  }
}

AES.prototype = {

  /**
     * Encrypt an array of 4 big-endian words.
     * @param {Array} data The plaintext.
     * @return {Array} The ciphertext.
     */
  encrypt: function (data) { return this._crypt(data, 0) },

  /**
     * Decrypt an array of 4 big-endian words.
     * @param {Array} data The ciphertext.
     * @return {Array} The plaintext.
     */
  decrypt: function (data) { return this._crypt(data, 1) },

  /**
     * The expanded S-box and inverse S-box tables.  These will be computed
     * on the client so that we don't have to send them down the wire.
     *
     * There are two tables, _tables[0] is for encryption and
     * _tables[1] is for decryption.
     *
     * The first 4 sub-tables are the expanded S-box with MixColumns.  The
     * last (_tables[01][4]) is the S-box itself.
     *
     * @private
     */
  _tables: [
    [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)],
    [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)]
  ],

  // Expand the S-box tables.
  _precompute: function () {
    const encTable = this._tables[0]; const decTable = this._tables[1]
    const sbox = encTable[4]; const sboxInv = decTable[4]
    let i; let x; let xInv; const d = new Uint8Array(256); const th = new Uint8Array(256); let x2; let x4; let x8; let s; let tEnc; let tDec

    // Compute double and third tables
    for (i = 0; i < 256; i++) {
      th[(d[i] = i << 1 ^ (i >> 7) * 283) ^ i] = i
    }

    for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
      // Compute sbox
      s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4
      s = s >> 8 ^ s & 255 ^ 99
      sbox[x] = s
      sboxInv[s] = x

      // Compute MixColumns
      x8 = d[x4 = d[x2 = d[x]]]
      tDec = x8 * 0x1010101 ^ x4 * 0x10001 ^ x2 * 0x101 ^ x * 0x1010100
      tEnc = d[s] * 0x101 ^ s * 0x1010100

      for (i = 0; i < 4; i++) {
        encTable[i][x] = tEnc = tEnc << 24 ^ tEnc >>> 8
        decTable[i][s] = tDec = tDec << 24 ^ tDec >>> 8
      }
    }
  },

  /**
     * Encryption and decryption core.
     * @param {Array} input Four words to be encrypted or decrypted.
     * @param dir The direction, 0 for encrypt and 1 for decrypt.
     * @return {Array} The four encrypted or decrypted words.
     * @private
     */
  _crypt: function (input, dir) {
    if (input.length !== 4) {
      throw new Error('invalid aes block size')
    }

    const key = this._key[dir]
    // state variables a,b,c,d are loaded with pre-whitened data
    let a = input[0] ^ key[0]
    let b = input[dir ? 3 : 1] ^ key[1]
    let c = input[2] ^ key[2]
    let d = input[dir ? 1 : 3] ^ key[3]
    let a2; let b2; let c2

    const nInnerRounds = key.length / 4 - 2
    let i
    let kIndex = 4
    const out = new Uint32Array(4); const // <--- this is slower in Node.js, about the same in Chrome */
      table = this._tables[dir]

    // load up the tables
    const t0 = table[0]
    const t1 = table[1]
    const t2 = table[2]
    const t3 = table[3]
    const sbox = table[4]

    // Inner rounds.  Cribbed from OpenSSL.
    for (i = 0; i < nInnerRounds; i++) {
      a2 = t0[a >>> 24] ^ t1[b >> 16 & 255] ^ t2[c >> 8 & 255] ^ t3[d & 255] ^ key[kIndex]
      b2 = t0[b >>> 24] ^ t1[c >> 16 & 255] ^ t2[d >> 8 & 255] ^ t3[a & 255] ^ key[kIndex + 1]
      c2 = t0[c >>> 24] ^ t1[d >> 16 & 255] ^ t2[a >> 8 & 255] ^ t3[b & 255] ^ key[kIndex + 2]
      d = t0[d >>> 24] ^ t1[a >> 16 & 255] ^ t2[b >> 8 & 255] ^ t3[c & 255] ^ key[kIndex + 3]
      kIndex += 4
      a = a2; b = b2; c = c2
    }

    // Last round.
    for (i = 0; i < 4; i++) {
      out[dir ? 3 & -i : i] =
                sbox[a >>> 24] << 24 ^
                sbox[b >> 16 & 255] << 16 ^
                sbox[c >> 8 & 255] << 8 ^
                sbox[d & 255] ^
                key[kIndex++]
      a2 = a; a = b; b = c; c = d; d = a2
    }

    return out
  }
}

class AESWrapper {
  public static encrypt (messageBuf: number[], keyBuf: number[]): number[] {
    const key = AESWrapper.buf2Words((keyBuf))
    const message = AESWrapper.buf2Words((messageBuf))
    const a = new AES(key)
    const enc = a.encrypt(message)
    const encBuf = AESWrapper.words2Buf(enc)
    return encBuf
  }

  public static decrypt (encBuf: number[], keyBuf: number[]): number[] {
    const enc = AESWrapper.buf2Words((encBuf))
    const key = AESWrapper.buf2Words((keyBuf))
    const a = new AES(key)
    const message = a.decrypt(enc)
    const messageBuf = AESWrapper.words2Buf(message)
    return messageBuf
  }

  public static buf2Words (buf: number[]): number[] {
    if (buf.length % 4) {
      throw new Error('buf length must be a multiple of 4')
    }
    const words = []
    for (let i = 0; i < buf.length / 4; i++) {
      const val =
                (buf[i * 4] * 0x1000000) + // Shift the first byte by 24 bits
                ((buf[i * 4 + 1] << 16) | // Shift the second byte by 16 bits
                    (buf[i * 4 + 2] << 8) | // Shift the third byte by 8 bits
                    buf[i * 4 + 3]) // The fourth byte
      words.push(val)
    }
    return words
  }

  public static words2Buf (words: number[]): number[] {
    const buf = new Array(words.length * 4)

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      buf[i * 4] = (word >>> 24) & 0xFF
      buf[i * 4 + 1] = (word >>> 16) & 0xFF
      buf[i * 4 + 2] = (word >>> 8) & 0xFF
      buf[i * 4 + 3] = word & 0xFF
    }

    return buf
  }
}

class CBC {
  public static buf2BlocksBuf (buf: number[], blockSize: number): number[][] {
    const bytesize = blockSize / 8
    const blockBufs = []

    for (let i = 0; i <= buf.length / bytesize; i++) {
      let blockBuf = buf.slice(i * bytesize, i * bytesize + bytesize)

      if (blockBuf.length < blockSize) {
        blockBuf = CBC.pkcs7Pad(blockBuf, blockSize)
      }

      blockBufs.push(blockBuf)
    }

    return blockBufs
  }

  public static blockBufs2Buf (blockBufs: number[][]): number[] {
    let last = blockBufs[blockBufs.length - 1]
    last = CBC.pkcs7Unpad(last)
    blockBufs[blockBufs.length - 1] = last

    const buf = blockBufs.flat()

    return buf
  }

  public static encrypt (
    messageBuf: number[],
    ivBuf: number[],
    blockCipher: any /* TODO: type */,
    cipherKeyBuf: number[]
  ): number[] {
    const blockSize = ivBuf.length * 8
    const blockBufs = CBC.buf2BlocksBuf(messageBuf, blockSize)
    const encBufs = CBC.encryptBlocks(blockBufs, ivBuf, blockCipher, cipherKeyBuf)
    const encBuf = encBufs.flat()
    return encBuf
  }

  public static decrypt (
    encBuf: number[],
    ivBuf: number[],
    blockCipher: any /* TODO: type */,
    cipherKeyBuf: number[]
  ): number[] {
    const bytesize = ivBuf.length
    const encBufs = []
    for (let i = 0; i < encBuf.length / bytesize; i++) {
      encBufs.push(encBuf.slice(i * bytesize, i * bytesize + bytesize))
    }
    const blockBufs = CBC.decryptBlocks(encBufs, ivBuf, blockCipher, cipherKeyBuf)
    const buf = CBC.blockBufs2Buf(blockBufs)
    return buf
  }

  public static encryptBlock (
    blockBuf: number[],
    ivBuf: number[],
    blockCipher: any /* TODO: type */,
    cipherKeyBuf: number[]
  ): number[] {
    const xorbuf = CBC.xorBufs(blockBuf, ivBuf)
    const encBuf = blockCipher.encrypt(xorbuf, cipherKeyBuf)
    return encBuf
  }

  public static decryptBlock (
    encBuf: number[],
    ivBuf: number[],
    blockCipher: any /* TODO: type */,
    cipherKeyBuf: number[]
  ): number[] {
    const xorbuf = blockCipher.decrypt(encBuf, cipherKeyBuf)
    const blockBuf = CBC.xorBufs(xorbuf, ivBuf)
    return blockBuf
  }

  public static encryptBlocks (
    blockBufs: number[][],
    ivBuf: number[],
    blockCipher: any /* TODO: type */,
    cipherKeyBuf: number[]
  ): number[][] {
    const encBufs = []

    for (let i = 0; i < blockBufs.length; i++) {
      const blockBuf = blockBufs[i]
      const encBuf = CBC.encryptBlock(blockBuf, ivBuf, blockCipher, cipherKeyBuf)

      encBufs.push(encBuf)

      ivBuf = encBuf
    }

    return encBufs
  }

  public static decryptBlocks (
    encBufs: number[][],
    ivBuf: number[],
    blockCipher: any /* TODO: type */,
    cipherKeyBuf: number[]
  ): number[][] {
    const blockBufs = []

    for (let i = 0; i < encBufs.length; i++) {
      const encBuf = encBufs[i]
      const blockBuf = CBC.decryptBlock(encBuf, ivBuf, blockCipher, cipherKeyBuf)

      blockBufs.push(blockBuf)

      ivBuf = encBuf
    }

    return blockBufs
  }

  public static pkcs7Pad (buf: number[], blockSize: number): number[] {
    const bytesize = blockSize / 8
    const padbytesize = bytesize - buf.length
    const pad = new Array(padbytesize)
    pad.fill(padbytesize)
    const paddedbuf = [...buf, ...pad]
    return paddedbuf
  }

  public static pkcs7Unpad (paddedbuf: number[]): number[] {
    const padlength = paddedbuf[paddedbuf.length - 1]
    const padbuf = paddedbuf.slice(paddedbuf.length - padlength, paddedbuf.length)
    const padbuf2 = new Array(padlength)
    padbuf2.fill(padlength)
    if (toHex(padbuf) !== toHex(padbuf2)) {
      throw new Error('invalid padding')
    }
    return paddedbuf.slice(0, paddedbuf.length - padlength)
  }

  public static xorBufs (buf1: number[], buf2: number[]): number[] {
    if (buf1.length !== buf2.length) {
      throw new Error('bufs must have the same length')
    }

    const buf = new Array(buf1.length)

    for (let i = 0; i < buf1.length; i++) {
      buf[i] = buf1[i] ^ buf2[i]
    }

    return buf
  }
}

class AESCBC {
  public static encrypt (messageBuf: number[], cipherKeyBuf: number[], ivBuf: number[], concatIvBuf = true): number[] {
    ivBuf = ivBuf || new Array(128 / 8).fill(0) || Random(128 / 8)
    const ctBuf = CBC.encrypt(messageBuf, ivBuf, AESWrapper, cipherKeyBuf)
    if (concatIvBuf) {
      return [...ivBuf, ...ctBuf]
    } else {
      return [...ctBuf]
    }
  }

  public static decrypt (encBuf: number[], cipherKeyBuf: number[], ivBuf?: number[]): number[] {
    if (!ivBuf) {
      ivBuf = encBuf.slice(0, 128 / 8)
      const ctBuf = encBuf.slice(128 / 8)
      return CBC.decrypt(ctBuf, ivBuf, AESWrapper, cipherKeyBuf)
    } else {
      const ctBuf = encBuf
      return CBC.decrypt(ctBuf, ivBuf, AESWrapper, cipherKeyBuf)
    }
  }
}

/**
 * @class ECIES
 * Implements the Electrum ECIES protocol for encrypted communication.
 *
 * @prprecated This class is deprecated in favor of the BRC-78 standard for portable encrypted messages,
 * which provides a more comprehensive and secure solution by integrating with BRC-42 and BRC-43 standards.
 */
export default class ECIES {
  /**
     * Generates the initialization vector (iv), encryption key (kE), and MAC key (kM)
     * using the sender's private key and receiver's public key.
     *
     * @param {PrivateKey} privKey - The sender's private key.
     * @param {PublicKey} pubKey - The receiver's public key.
     * @returns {Object} An object containing the iv, kE, and kM as number arrays.
     */
  public static ivkEkM (privKey: PrivateKey, pubKey: PublicKey): { iv: number[], kE: number[], kM: number[] } {
    const r = privKey
    const KB = pubKey
    const P = KB.mul(r)
    const S = new PublicKey(P.x, P.y)
    const Sbuf = S.encode(true) as number[]
    const hash = Hash.sha512(Sbuf)
    return {
      iv: hash.slice(0, 16),
      kE: hash.slice(16, 32),
      kM: hash.slice(32, 64)
    }
  }

  /**
     * Encrypts a given message using the Electrum ECIES method.
     *
     * @param {number[]} messageBuf - The message to be encrypted, in number array format.
     * @param {PublicKey} toPublicKey - The public key of the recipient.
     * @param {PrivateKey} [fromPrivateKey] - The private key of the sender. If not provided, a random private key is used.
     * @param {boolean} [noKey=false] - If true, does not include the sender's public key in the encrypted message.
     * @returns {number[]} The encrypted message as a number array.
     */
  public static electrumEncrypt (messageBuf: number[], toPublicKey: PublicKey, fromPrivateKey?: PrivateKey, noKey = false): number[] {
    let Rbuf
    if (!fromPrivateKey) {
      fromPrivateKey = PrivateKey.fromRandom()
    }
    if (!noKey) {
      Rbuf = fromPrivateKey.toPublicKey().encode(true)
    }
    const { iv, kE, kM } = ECIES.ivkEkM(fromPrivateKey, toPublicKey)
    const ciphertext = AESCBC.encrypt(messageBuf, kE, iv, false)
    const BIE1 = toArray('BIE1', 'utf8')
    let encBuf: number[]
    if (Rbuf) {
      encBuf = [...BIE1, ...Rbuf, ...ciphertext]
    } else {
      encBuf = [...BIE1, ...ciphertext]
    }
    const hmac = Hash.sha256hmac(kM, encBuf)
    return [...encBuf, ...hmac]
  }

  /**
     * Decrypts a message encrypted using the Electrum ECIES method.
     *
     * @param {number[]} encBuf - The encrypted message buffer.
     * @param {PrivateKey} toPrivateKey - The private key of the recipient.
     * @param {PublicKey} [fromPublicKey=null] - The public key of the sender. If not provided, it is extracted from the message.
     * @returns {number[]} The decrypted message as a number array.
     */
  public static electrumDecrypt (encBuf: number[], toPrivateKey: PrivateKey, fromPublicKey?: PublicKey): number[] {
    const tagLength = 32

    const magic = encBuf.slice(0, 4)
    if (encode(magic, 'utf8') !== 'BIE1') {
      throw new Error('Invalid Magic')
    }
    let offset = 4
    if (!fromPublicKey) {
      // BIE1 use compressed public key, length is always 33.
      const pub = encBuf.slice(4, 37)
      fromPublicKey = PublicKey.fromString(toHex(pub))
      offset = 37
    }
    const { iv, kE, kM } = ECIES.ivkEkM(toPrivateKey, fromPublicKey)
    const ciphertext = encBuf.slice(offset, encBuf.length - tagLength)
    const hmac = encBuf.slice(encBuf.length - tagLength, encBuf.length)

    const hmac2 = Hash.sha256hmac(kM, encBuf.slice(0, encBuf.length - tagLength))

    if (toHex(hmac) !== toHex(hmac2)) {
      throw new Error('Invalid checksum')
    }
    return AESCBC.decrypt(ciphertext, kE, iv)
  }

  /**
     * Encrypts a given message using the Bitcore variant of ECIES.
     *
     * @param {number[]} messageBuf - The message to be encrypted, in number array format.
     * @param {PublicKey} toPublicKey - The public key of the recipient.
     * @param {PrivateKey} [fromPrivateKey] - The private key of the sender. If not provided, a random private key is used.
     * @param {number[]} [ivBuf] - The initialization vector for encryption. If not provided, a random IV is used.
     * @returns {number[]} The encrypted message as a number array.
     */
  public static bitcoreEncrypt (messageBuf: number[], toPublicKey: PublicKey, fromPrivateKey?: PrivateKey, ivBuf?: number[]): number[] {
    if (!fromPrivateKey) {
      fromPrivateKey = PrivateKey.fromRandom()
    }
    const r = fromPrivateKey
    const RPublicKey = fromPrivateKey.toPublicKey()
    const RBuf = RPublicKey.encode(true) as number[]
    const KB = toPublicKey
    const P = KB.mul(r)
    const S = P.getX()
    const Sbuf = S.toArray('be', 32)
    const kEkM = Hash.sha512(Sbuf)
    const kE = kEkM.slice(0, 32)
    const kM = kEkM.slice(32, 64)
    const c = AESCBC.encrypt(messageBuf, kE, ivBuf)
    const d = Hash.sha256hmac(kM, [...c])
    const encBuf = [...RBuf, ...c, ...d]
    return encBuf
  }

  /**
     * Decrypts a message encrypted using the Bitcore variant of ECIES.
     *
     * @param {number[]} encBuf - The encrypted message buffer.
     * @param {PrivateKey} toPrivateKey - The private key of the recipient.
     * @returns {number[]} The decrypted message as a number array.
     */
  public static bitcoreDecrypt (encBuf: number[], toPrivateKey: PrivateKey): number[] {
    const kB = toPrivateKey
    const fromPublicKey = PublicKey.fromString(toHex(encBuf.slice(0, 33)))
    const R = fromPublicKey
    const P = R.mul(kB)
    if (P.eq(new Point(0, 0))) {
      throw new Error('P equals 0')
    }
    const S = P.getX()
    const Sbuf = S.toArray('be', 32)
    const kEkM = Hash.sha512(Sbuf)
    const kE = kEkM.slice(0, 32)
    const kM = kEkM.slice(32, 64)
    const c = encBuf.slice(33, encBuf.length - 32)
    const d = encBuf.slice(encBuf.length - 32, encBuf.length)
    const d2 = Hash.sha256hmac(kM, c)
    if (toHex(d) !== toHex(d2)) {
      throw new Error('Invalid checksum')
    }
    const messageBuf = AESCBC.decrypt(c, kE)
    return [...messageBuf]
  }
}
