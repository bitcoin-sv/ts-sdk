import BigNumber from './BigNumber.js'
import Signature from './Signature.js'
import PublicKey from './PublicKey.js'
import Point from './Point.js'
import Curve from './Curve.js'
import { sign, verify } from './ECDSA.js'
import { sha256, sha256hmac } from './Hash.js'
import Random from './Random.js'
import { fromBase58Check, toArray, toBase58Check } from './utils.js'

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
  static fromString (str: string, base: number | 'hex'): PrivateKey {
    return new PrivateKey(BigNumber.fromString(str, base).toArray())
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
  sign (msg: number[] | string, enc?: 'hex' | 'utf8', forceLowS: boolean = true, customK?: Function | BigNumber): Signature {
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
    if (!this.isValid()) { throw new Error('Value is out of field') }
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
   * const shares = key.split(2, 5)
   */
  split (threshold: number, totalShares: number): BigNumber[] {
    if (threshold < 2 || threshold > totalShares || threshold > 99) throw new Error('threshold should be between 2 and 99')
    if (totalShares < 3 || totalShares > 100) throw new Error('totalShares should be between 3 and 100')

    const Prime = new Curve().p
    // define a polynomial with the private key as the x=0 intercept and the rest of the coefficients random
    const points = [new Point(0, new BigNumber(this.toArray()))]
    for (let i = 1; i < threshold; i++) {
      points.push(new Point(new BigNumber(Random(32)), new BigNumber(Random(32))))
    }

    // define the polynomial as a line which interpolates each of the points.
    const poly = (x: BigNumber) => {
      let y = new BigNumber(0)
      for (let i = 0; i < threshold; i++) {
        let num = new BigNumber(1)
        let den = new BigNumber(1)
        for (let j = 0; j < threshold; j++) {
          if (i !== j) {
            num = num.mul(x.sub(points[j].x))
            den = den.mul(points[i].x.sub(points[j].x))
          }
        }
        y = y.add(points[i].y.mul(num).div(den))
      }
      return y.mod(Prime)
    }

    // choose random x values for the shares
    const xValues = []
    for (let i = 0; i < totalShares; i++) {
      xValues.push(new BigNumber(Random(32)).mod(Prime))
    }

    // calculate the shares
    const shareList = []
    for (let i = 0; i < totalShares; i++) {
      const x = xValues[i]
      const y = poly(x)
      shareList.push(new Point(x, y))
    }

    return shareList
  }

  /**
   * Combines shares to reconstruct the private key.
   *
   * @param shares An array of Points.
   * @returns The reconstructed private key.
   * @throws Will throw an error if the number of shares is less than the threshold.
   * @throws Will throw an error if the shares are not valid.
   * 
   * @example
   * const key = PrivateKey.fromRandom()
   * const shares = key.split(2, 5)
   * const reconstructedKey = PrivateKey.combine(shares.slice(0, 2))
   * 
   **/
  static fromShares (points: Point[]): PrivateKey {
    if (points.length < 2) throw new Error('At least 2 shares are required to reconstruct the private key')
    const Prime = new Curve().p
    const threshold = points.length
    // define the polynomial as a line which interpolates each of the shares, and return the y value at x=0.
    let y = new BigNumber(0)
    for (let i = 0; i < threshold; i++) {
      let num = new BigNumber(1)
      let den = new BigNumber(1)
      for (let j = 0; j < threshold; j++) {
        if (i !== j) {
          // Corrected to use points[i].x for numerator calculation
          num = num.mul(points[i].x.sub(points[j].x)).mod(Prime)
          den = den.mul(points[i].x.sub(points[j].x)).mod(Prime)
        }
      }
      // Modular division might require using a modular inverse function
      let term = points[i].y.mul(num).mul(den).mod(Prime)
      y = y.add(term).mod(Prime)
    }
    return new PrivateKey(y.toArray())
  }
}
