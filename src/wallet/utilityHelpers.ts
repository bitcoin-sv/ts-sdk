import { Beef, Hash, PrivateKey, PublicKey, Random, Script, Transaction, Utils } from "@bsv/sdk";
// import { sdk } from "..";
// import { Chain } from "../sdk/types";

export function toWalletNetwork(chain: Chain): sdk.WalletNetwork {
    return chain === 'main' ? 'mainnet' : 'testnet';
}

export function makeAtomicBeef(tx: Transaction, beef: number[] | Beef): number[] {
    if (Array.isArray(beef))
        beef = Beef.fromBinary(beef)
    beef.mergeTransaction(tx)
    return beef.toBinaryAtomic(tx.id('hex'))
}

/**
 * Coerce a bsv transaction encoded as a hex string, serialized Buffer, or Transaction to Transaction
 * If tx is already a Transaction, just return it.
 * @publicbody
 */
export function asBsvSdkTx(tx: sdk.HexString | number[] | Transaction): Transaction {
    if (Array.isArray(tx)) {
        tx = Transaction.fromBinary(tx)
    } else if (typeof tx === 'string') {
        tx = Transaction.fromHex(tx)
    }
    return tx
}

/**
 * Coerce a bsv script encoded as a hex string, serialized Buffer, or Script to Script
 * If script is already a Script, just return it.
 * @publicbody
 */
export function asBsvSdkScript(script: sdk.HexString | number[] | Script): Script {
    if (Array.isArray(script)) {
        script = Script.fromBinary(script)
    } else if (typeof script === 'string') {
        script = Script.fromHex(script)
    }
    return script
}

/**
 * @param privKey bitcoin private key in 32 byte hex string form
 * @returns @bsv/sdk PrivateKey
 */
export function asBsvSdkPrivateKey(privKey: string): PrivateKey {
    return PrivateKey.fromString(privKey, 'hex')
}

/**
 * @param pubKey bitcoin public key in standard compressed key hex string form
 * @returns @bsv/sdk PublicKey
 */
export function asBsvSdkPublickKey(pubKey: string): PublicKey {
    return PublicKey.fromString(pubKey)
}

/**
 * Helper function.
 *
 * Verifies that a possibly optional value has a value.
 */
export function verifyTruthy<T>(v: T | null | undefined, description?: string): T {
    if (v == null) throw new sdk.WERR_INTERNAL(description ?? 'A truthy value is required.')
    return v
}

/**
 * Helper function.
 *
 * Verifies that a hex string is trimmed and lower case.
 */
export function verifyHexString(v: string): string {
    if (typeof v !== 'string') throw new sdk.WERR_INTERNAL('A string is required.');
    v = v.trim().toLowerCase()
    return v
}

/**
 * Helper function.
 *
 * Verifies that an optional or null hex string is undefined or a trimmed lowercase string.
 */
export function verifyOptionalHexString(v?: string | null): string | undefined {
    if (!v) return undefined
    return verifyHexString(v)
}


/**
 * Helper function.
 *
 * Verifies that an optional or null number has a numeric value.
 */
export function verifyNumber(v: number | null | undefined): number {
    if (typeof v !== 'number') throw new sdk.WERR_INTERNAL('A number is required.')
    return v
}

/**
 * Helper function.
 *
 * Verifies that an optional or null number has a numeric value.
 */
export function verifyInteger(v: number | null | undefined): number {
    if (typeof v !== 'number' || !Number.isInteger(v)) throw new sdk.WERR_INTERNAL('An integer is required.');
    return v
}

/**
 * Helper function.
 * 
 * Verifies that a database record identifier is an integer greater than zero.
 */
export function verifyId(id: number | undefined | null): number {
    id = verifyInteger(id)
    if (id < 1) throw new sdk.WERR_INTERNAL(`id must be valid integer greater than zero.`)
    return id
}

/**
 * Helper function.
 *
 * @throws WERR_BAD_REQUEST if results has length greater than one.
 *
 * @returns results[0] or undefined if length is zero.
 */
export function verifyOneOrNone<T>(results: T[]): (T | undefined) {
    if (results.length > 1) throw new sdk.WERR_BAD_REQUEST('Result must be unique.')
    return results[0]
}

/**
 * Helper function.
 *
 * @throws WERR_BAD_REQUEST if results has length other than one.
 *
 * @returns results[0].
 */
export function verifyOne<T>(results: T[], errorDescrition?: string): T {
    if (results.length !== 1) throw new sdk.WERR_BAD_REQUEST(errorDescrition ?? 'Result must exist and be unique.')
    return results[0]
}

/**
 * Returns an await'able Promise that resolves in the given number of msecs.
 * @publicbody
 */
export function wait(msecs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, msecs))
}

/**
 * @returns count cryptographically secure random bytes as Buffer
 */
export function randomBytes(count: number): number[] {
    return Random(count)
}

/**
 * @returns count cryptographically secure random bytes as hex encoded string
 */
export function randomBytesHex(count: number): string {
    return Utils.toHex(Random(count))
}

/**
 * @returns count cryptographically secure random bytes as base64 encoded string
 */
export function randomBytesBase64(count: number): string {
    return Utils.toBase64(Random(count))
}

/**
 * Coerce a value to Buffer if currently encoded as a string or 
 * @param val Buffer or string or number[]. If string, encoding param applies. If number[], Buffer.from constructor is used.
 * @param encoding defaults to 'hex'. Only applies to val of type string
 * @returns input val if it is a Buffer or new Buffer from string val
 * @publicbody
 */
export function asBuffer(val: Buffer | string | number[], encoding?: BufferEncoding): Buffer {
    let b: Buffer
    if (Buffer.isBuffer(val)) b = val
    else if (typeof val === 'string') b = Buffer.from(val, encoding ?? 'hex')
    else b = Buffer.from(val)
    return b
}

/**
 * Coerce a value to an encoded string if currently a Buffer or number[]
 * @param val Buffer or string or number[]. If string, encoding param applies. If number[], Buffer.from constructor is used.
 * @param encoding defaults to 'hex'
 * @returns input val if it is a string; or if number[], first converted to Buffer then as Buffer; if Buffer encoded using `encoding`
 * @publicbody
 */
export function asString(val: Buffer | string | number[], encoding?: BufferEncoding): string {
    if (Array.isArray(val)) val = Buffer.from(val)
    return Buffer.isBuffer(val) ? val.toString(encoding ?? 'hex') : val
}

export function asArray(val: Buffer | string | number[], encoding?: BufferEncoding): number[] {
    let a: number[]
    if (Array.isArray(val)) a = val
    else if (Buffer.isBuffer(val)) a = Array.from(val)
    else a = Array.from(Buffer.from(val, encoding || 'hex'))
    return a
}

export function validateSecondsSinceEpoch(time: number): Date {
    const date = new Date(time * 1000)
    if (date.getTime() / 1000 !== time || time < 1600000000 || time > 100000000000) { throw new sdk.WERR_INVALID_PARAMETER('time', `valid "since epoch" unix time`) }
    return date
}

/**
 * Compares lengths and direct equality of values.
 * @param arr1 
 * @param arr2 
 * @returns 
 */
export function arraysEqual(arr1: Number[], arr2: Number[]) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

export function optionalArraysEqual(arr1?: Number[], arr2?: Number[]) {
    if (!arr1 && !arr2) return true
    if (!arr1 || !arr2) return false
    return arraysEqual(arr1, arr2)
}

export function maxDate(d1?: Date, d2?: Date): Date | undefined {
    if (d1 && d2) {
        if (d1 > d2) return d1
        return d2
    }
    if (d1) return d1
    if (d2) return d2
    return undefined
}

/**
 * Calculate the SHA256 hash of an array of bytes
 * @returns sha256 hash of buffer contents.
 * @publicbody
 */
export function sha256Hash(data: number[]): number[] {
    const first = new Hash.SHA256().update(data).digest()
    return first
}

/**
 * Calculate the SHA256 hash of the SHA256 hash of an array of bytes.
 * @param data an array of bytes
 * @returns double sha256 hash of data, byte 0 of hash first.
 * @publicbody
 */
export function doubleSha256HashLE(data: number[]): number[] {
    const first = new Hash.SHA256().update(data).digest()
    const second = new Hash.SHA256().update(first).digest()
    return second
}

/**
 * Calculate the SHA256 hash of the SHA256 hash of an array of bytes.
 * @param data is an array of bytes.
 * @returns reversed (big-endian) double sha256 hash of data, byte 31 of hash first.
 * @publicbody
 */
export function doubleSha256BE(data: number[]): number[] {
    return doubleSha256HashLE(data).reverse()
}