import { Hash } from "../primitives/index.js"

/**
 * @param val Value to convert to encoded string if not already a string.
 * @param encoding 
 */
export function asString (val: Buffer | string, encoding?: BufferEncoding): string {
  return Buffer.isBuffer(val) ? val.toString(encoding ?? 'hex') : val
}

/**
 * Calculate the SHA256 hash of the SHA256 hash of a Buffer.
 * @param data is Buffer or hex encoded string
 * @returns double sha256 hash of buffer contents, byte 0 of hash first.
 * @publicbody
 */
export function doubleSha256HashLE (data: string | Buffer, encoding?: BufferEncoding): Buffer {
    const msg = asArray(data, encoding)
    const first = new Hash.SHA256().update(msg).digest()
    const second = new Hash.SHA256().update(first).digest()
    return asBuffer(second)
}

/**
 * Calculate the SHA256 hash of the SHA256 hash of a Buffer.
 * @param data is Buffer or hex encoded string
 * @returns reversed (big-endian) double sha256 hash of data, byte 31 of hash first.
 * @publicbody
 */
export function doubleSha256BE (data: string | Buffer, encoding?: BufferEncoding): Buffer {
    return doubleSha256HashLE(data, encoding).reverse()
}

export function asArray(val: Buffer | string | number[], encoding?: BufferEncoding): number[] {
  let a: number[]
  if (Array.isArray(val)) a = val
  else if (Buffer.isBuffer(val)) a = Array.from(val)
  else a = Array.from(Buffer.from(val, encoding || 'hex'))
  return a
}

export function asBuffer(val: Buffer | string | number[], encoding?: BufferEncoding): Buffer {
  let b: Buffer
  if (Buffer.isBuffer(val)) b = val
  else if (typeof val === 'string') b = Buffer.from(val, encoding ?? 'hex')
  else b = Buffer.from(val)
  return b
}