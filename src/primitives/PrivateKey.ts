import BigNumber from './BigNumber'
import Signature from './Signature'
import PublicKey from './PublicKey'
import Point from './Point'
import Curve from './Curve'
import { sign, verify } from './ECDSA'
import { sha256, sha256hmac } from './Hash'
import Random from './Random'
import { fromBase58Check, toArray, toBase58, toBase58Check } from './utils'
import Polynomial, { PointInFiniteField } from './Polynomial'

/**
 * @class KeyShares
 *
 * This class is used to store the shares of a private key.
 *
 * @param shares - An array of shares
 * @param threshold - The number of shares required to recombine the private key
 *
 * @returns KeyShares
 *
 * @example
 * const key = PrivateKey.fromShares(shares)
 *
 */

export class KeyShares {
  points: PointInFiniteField[]
  threshold: number
  integrity: string

  constructor (
    points: PointInFiniteField[],
    threshold: number,
    integrity: string
  ) {
    this.points = points
    this.threshold = threshold
    this.integrity = integrity
  }

  static fromBackupFormat (shares: string[]): KeyShares {
    let threshold = 0
    let integrity = ''
    const points = shares.map((share, idx) => {
      const shareParts = share.split('.')
      if (shareParts.length !== 4) {
        throw Error(
          'Invalid share format in share ' +
            idx +
            '. Expected format: "x.y.t.i" - received ' +
            share
        )
      }
      const [x, y, t, i] = shareParts
      if (!t) throw Error('Threshold not found in share ' + idx)
      if (!i) throw Error('Integrity not found in share ' + idx)
      const tInt = parseInt(t)
      if (idx !== 0 && threshold !== tInt) { throw Error('Threshold mismatch in share ' + idx) }
      if (idx !== 0 && integrity !== i) { throw Error('Integrity mismatch in share ' + idx) }
      threshold = tInt
      integrity = i
      return PointInFiniteField.fromString([x, y].join('.'))
    })
    return new KeyShares(points, threshold, integrity)
  }

  toBackupFormat () {
    return this.points.map(
      (share) => share.toString() + '.' + this.threshold + '.' + this.integrity
    )
  }
}

/**
 * Represents a Private Key, which is a secret that can be used to generate signatures in a cryptographic system.
 *
 * The `PrivateKey` class extends from the `BigNumber` class. It offers methods to create signatures, verify them,
 * create a corresponding public key and derive a shared secret from a public key.
 *
 * @extends {BigNumber}
 * @see {@link BigNumber} for more information on BigNumber.
 */
export default class PrivateKey extends BigNumber {
  /**
   * Generates a private key randomly.
   *
   * @method fromRandom
   * @static
   * @returns The newly generated Private Key.
   *
   * @example
   * const privateKey = PrivateKey.fromRandom();
   */
  static fromRandom (): PrivateKey {
    return new PrivateKey(Random(32))
  }

  /**
   * Generates a private key from a string.
   *
   * @method fromString
   * @static
   * @param str - The string to generate the private key from.
   * @param base - The base of the string.
   * @returns The generated Private Key.
   * @throws Will throw an error if the string is not valid.
   **/
  static fromString (str: string, base: number | 'hex' = 'hex'): PrivateKey {
    return new PrivateKey(super.fromString(str, base).toArray())
  }

  /**
   * Generates a private key from a hexadecimal string.
   *
   * @method fromHex
   * @static
   * @param {string} str - The hexadecimal string representing the private key. The string must represent a valid private key in big-endian format.
   * @returns {PrivateKey} The generated Private Key instance.
   * @throws {Error} If the string is not a valid hexadecimal or represents an invalid private key.
   **/
  static fromHex (str: string): PrivateKey {
    return new PrivateKey(super.fromHex(str, 'big'))
  }

  /**
   * Generates a private key from a WIF (Wallet Import Format) string.
   *
   * @method fromWif
   * @static
   * @param wif - The WIF string to generate the private key from.
   * @param base - The base of the string.
   * @returns The generated Private Key.
   * @throws Will throw an error if the string is not a valid WIF.
   **/
  static fromWif (wif: string, prefixLength: number = 1): PrivateKey {
    const decoded = fromBase58Check(wif, null, prefixLength)
    if (decoded.data.length !== 33) {
      throw new Error('Invalid WIF length')
    }
    if (decoded.data[32] !== 1) {
      throw new Error('Invalid WIF padding')
    }
    return new PrivateKey(decoded.data.slice(0, 32))
  }

  /**
   * @constructor
   *
   * @param number - The number (various types accepted) to construct a BigNumber from. Default is 0.
   *
   * @param base - The base of number provided. By default is 10. Ignored if number is BigNumber.
   *
   * @param endian - The endianness provided. By default is 'big endian'. Ignored if number is BigNumber.
   *
   * @param modN - Optional. Default 'apply. If 'apply', apply modN to input to guarantee a valid PrivateKey. If 'error', if input is out of field throw Error('Input is out of field'). If 'nocheck', assumes input is in field.
   *
   * @example
   * import PrivateKey from './PrivateKey';
   * import BigNumber from './BigNumber';
   * const privKey = new PrivateKey(new BigNumber('123456', 10, 'be'));
   */
  constructor (
    number: BigNumber | number | string | number[] = 0,
    base: number | 'be' | 'le' | 'hex' = 10,
    endian: 'be' | 'le' = 'be',
    modN: 'apply' | 'nocheck' | 'error' = 'apply'
  ) {
    if (number instanceof BigNumber) {
      super()
      number.copy(this)
    } else {
      super(number, base, endian)
    }

    if (modN !== 'nocheck') {
      const check = this.checkInField()
      if (!check.inField) {
        if (modN === 'error') {
          throw new Error('Input is out of field')
        }
        // Force the PrivateKey BigNumber value to lie in the field limited by curve.n
        BigNumber.move(this, check.modN)
      }
    }
  }

  /**
   * A utility function to check that the value of this PrivateKey lies in the field limited by curve.n
   * @returns { inField, modN } where modN is this PrivateKey's current BigNumber value mod curve.n, and inField is true only if modN equals current BigNumber value.
   */
  checkInField (): { inField: boolean, modN: BigNumber } {
    const curve = new Curve()
    const modN = this.mod(curve.n)
    const inField = this.cmp(modN) === 0
    return { inField, modN }
  }

  /**
   * @returns true if the PrivateKey's current BigNumber value lies in the field limited by curve.n
   */
  isValid (): boolean {
    return this.checkInField().inField
  }

  /**
   * Signs a message using the private key.
   *
   * @method sign
   * @param msg - The message (array of numbers or string) to be signed.
   * @param enc - If 'hex' the string will be treated as hex, utf8 otherwise.
   * @param forceLowS - If true (the default), the signature will be forced to have a low S value.
   * @param customK — If provided, uses a custom K-value for the signature. Provie a function that returns a BigNumber, or the BigNumber itself.
   * @returns A digital signature generated from the hash of the message and the private key.
   *
   * @example
   * const privateKey = PrivateKey.fromRandom();
   * const signature = privateKey.sign('Hello, World!');
   */
  sign (
    msg: number[] | string,
    enc?: 'hex' | 'utf8',
    forceLowS: boolean = true,
    customK?: Function | BigNumber
  ): Signature {
    const msgHash = new BigNumber(sha256(msg, enc), 16)
    return sign(msgHash, this, forceLowS, customK)
  }

  /**
   * Verifies a message's signature using the public key associated with this private key.
   *
   * @method verify
   * @param msg - The original message which has been signed.
   * @param sig - The signature to be verified.
   * @param enc - The data encoding method.
   * @returns Whether or not the signature is valid.
   *
   * @example
   * const privateKey = PrivateKey.fromRandom();
   * const signature = privateKey.sign('Hello, World!');
   * const isSignatureValid = privateKey.verify('Hello, World!', signature);
   */
  verify (msg: number[] | string, sig: Signature, enc?: 'hex'): boolean {
    const msgHash = new BigNumber(sha256(msg, enc), 16)
    return verify(msgHash, sig, this.toPublicKey())
  }

  /**
   * Converts the private key to its corresponding public key.
   *
   * The public key is generated by multiplying the base point G of the curve and the private key.
   *
   * @method toPublicKey
   * @returns The generated PublicKey.
   *
   * @example
   * const privateKey = PrivateKey.fromRandom();
   * const publicKey = privateKey.toPublicKey();
   */
  toPublicKey (): PublicKey {
    const c = new Curve()
    const p = c.g.mul(this)
    return new PublicKey(p.x, p.y)
  }

  /**
   * Converts the private key to a Wallet Import Format (WIF) string.
   *
   * Base58Check encoding is used for encoding the private key.
   * The prefix
   *
   * @method toWif
   * @returns The WIF string.
   *
   * @param prefix defaults to [0x80] for mainnet, set it to [0xef] for testnet.
   *
   * @throws Error('Value is out of field') if current BigNumber value is out of field limited by curve.n
   *
   * @example
   * const privateKey = PrivateKey.fromRandom();
   * const wif = privateKey.toWif();
   * const testnetWif = privateKey.toWif([0xef]);
   */
  toWif (prefix: number[] = [0x80]): string {
    if (!this.isValid()) {
      throw new Error('Value is out of field')
    }
    return toBase58Check([...this.toArray('be', 32), 1], prefix)
  }

  /**
   * Base58Check encodes the hash of the public key associated with this private key with a prefix to indicate locking script type.
   * Defaults to P2PKH for mainnet, otherwise known as a "Bitcoin Address".
   *
   * @param prefix defaults to [0x00] for mainnet, set to [0x6f] for testnet or use the strings 'testnet' or 'mainnet'
   *
   * @returns Returns the address encoding associated with the hash of the public key associated with this private key.
   *
   * @example
   * const address = privkey.toAddress()
   * const address = privkey.toAddress('mainnet')
   * const testnetAddress = privkey.toAddress([0x6f])
   * const testnetAddress = privkey.toAddress('testnet')
   */
  toAddress (prefix: number[] | string = [0x00]): string {
    return this.toPublicKey().toAddress(prefix)
  }

  /**
   * Converts this PrivateKey to a hexadecimal string.
   *
   * @method toHex
   * @param length - The minimum length of the hex string
   * @returns Returns a string representing the hexadecimal value of this BigNumber.
   *
   * @example
   * const bigNumber = new BigNumber(255);
   * const hex = bigNumber.toHex();
   */
  toHex (): string {
    return super.toHex(32)
  }

  /**
   * Converts this PrivateKey to a string representation.
   *
   * @method toString
   * @param {number | 'hex'} [base='hex'] - The base for representing the number. Default is hexadecimal ('hex').
   * @param {number} [padding=64] - The minimum number of digits for the output string. Default is 64, ensuring a 256-bit representation in hexadecimal.
   * @returns {string} A string representation of the PrivateKey in the specified base, padded to the specified length.
   *
   **/
  toString (base: number | 'hex' = 'hex', padding: number = 64): string {
    return super.toString(base, padding)
  }

  /**
   * Derives a shared secret from the public key.
   *
   * @method deriveSharedSecret
   * @param key - The public key to derive the shared secret from.
   * @returns The derived shared secret (a point on the curve).
   * @throws Will throw an error if the public key is not valid.
   *
   * @example
   * const privateKey = PrivateKey.fromRandom();
   * const publicKey = privateKey.toPublicKey();
   * const sharedSecret = privateKey.deriveSharedSecret(publicKey);
   */
  deriveSharedSecret (key: PublicKey): Point {
    if (!key.validate()) {
      throw new Error('Public key not valid for ECDH secret derivation')
    }
    return key.mul(this)
  }

  /**
   * Derives a child key with BRC-42.
   * @param publicKey The public key of the other party
   * @param invoiceNumber The invoice number used to derive the child key
   * @returns The derived child key.
   */
  deriveChild (publicKey: PublicKey, invoiceNumber: string): PrivateKey {
    const sharedSecret = this.deriveSharedSecret(publicKey)
    const invoiceNumberBin = toArray(invoiceNumber, 'utf8')
    const hmac = sha256hmac(sharedSecret.encode(true), invoiceNumberBin)
    const curve = new Curve()
    return new PrivateKey(this.add(new BigNumber(hmac)).mod(curve.n).toArray())
  }

  /**
   * Splits the private key into shares using Shamir's Secret Sharing Scheme.
   *
   * @param threshold The minimum number of shares required to reconstruct the private key.
   * @param totalShares The total number of shares to generate.
   * @param prime The prime number to be used in Shamir's Secret Sharing Scheme.
   * @returns An array of shares.
   *
   * @example
   * const key = PrivateKey.fromRandom()
   * const shares = key.toKeyShares(2, 5)
   */
  toKeyShares (threshold: number, totalShares: number): KeyShares {
    if (typeof threshold !== 'number' || typeof totalShares !== 'number') { throw new Error('threshold and totalShares must be numbers') }
    if (threshold < 2) throw new Error('threshold must be at least 2')
    if (totalShares < 2) throw new Error('totalShares must be at least 2')
    if (threshold > totalShares) { throw new Error('threshold should be less than or equal to totalShares') }

    const poly = Polynomial.fromPrivateKey(this, threshold)

    const points = []
    for (let i = 0; i < totalShares; i++) {
      const x = new BigNumber(PrivateKey.fromRandom().toArray())
      const y = poly.valueAt(x)
      points.push(new PointInFiniteField(x, y))
    }

    const integrity = (this.toPublicKey().toHash('hex') as string).slice(0, 8)

    return new KeyShares(points, threshold, integrity)
  }

  /**
   * @method toBackupShares
   *
   * Creates a backup of the private key by splitting it into shares.
   *
   *
   * @param threshold The number of shares which will be required to reconstruct the private key.
   * @param totalShares The number of shares to generate for distribution.
   * @returns
   */
  toBackupShares (threshold: number, totalShares: number): string[] {
    return this.toKeyShares(threshold, totalShares).toBackupFormat()
  }

  /**
   *
   * @method fromBackupShares
   *
   * Creates a private key from backup shares.
   *
   * @param shares
   * @returns PrivateKey
   *
   * @example
   *
   * const share1 = '3znuzt7DZp8HzZTfTh5MF9YQKNX3oSxTbSYmSRGrH2ev.2Nm17qoocmoAhBTCs8TEBxNXCskV9N41rB2PckcgYeqV.2.35449bb9'
   * const share2 = 'Cm5fuUc39X5xgdedao8Pr1kvCSm8Gk7Cfenc7xUKcfLX.2juyK9BxCWn2DiY5JUAgj9NsQ77cc9bWksFyW45haXZm.2.35449bb9'
   *
   * const recoveredKey = PrivateKey.fromBackupShares([share1, share2])
   */
  static fromBackupShares (shares: string[]): PrivateKey {
    return PrivateKey.fromKeyShares(KeyShares.fromBackupFormat(shares))
  }

  /**
   * Combines shares to reconstruct the private key.
   *
   * @param shares An array of points (shares) to be used to reconstruct the private key.
   * @param threshold The minimum number of shares required to reconstruct the private key.
   *
   * @returns The reconstructed private key.
   *
   **/
  static fromKeyShares (keyShares: KeyShares): PrivateKey {
    const { points, threshold, integrity } = keyShares
    if (threshold < 2) throw new Error('threshold must be at least 2')
    if (points.length < threshold) {
      throw new Error(
        `At least ${threshold} shares are required to reconstruct the private key`
      )
    }
    // check to see if two points have the same x value
    for (let i = 0; i < threshold; i++) {
      for (let j = i + 1; j < threshold; j++) {
        if (points[i].x.eq(points[j].x)) {
          throw new Error('Duplicate share detected, each must be unique.')
        }
      }
    }
    const poly = new Polynomial(points, threshold)
    const privateKey = new PrivateKey(poly.valueAt(new BigNumber(0)).toArray())
    const integrityHash = privateKey.toPublicKey().toHash('hex').slice(0, 8)
    if (integrityHash !== integrity) {
      throw new Error('Integrity hash mismatch')
    }

    return privateKey
  }
}
