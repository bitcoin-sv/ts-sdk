import BigNumber from '../primitives/BigNumber.js'
import { Writer, toArray } from '../primitives/utils.js'
import * as ECDSA from '../primitives/ECDSA.js'
import * as Hash from '../primitives/Hash.js'
import PrivateKey from '../primitives/PrivateKey.js'
import PublicKey from '../primitives/PublicKey.js'
import Signature from '../primitives/Signature.js'

const prefix = 'Bitcoin Signed Message:\n'

/**
 * Generates a SHA256 double-hash of the prefixed message.
 * @deprecated Replaced by BRC-77 which uses a more secure and private method for message signing.
 * @param messageBuf The message buffer to be hashed.
 * @returns The double-hash of the prefixed message as a number array.
 */
export const magicHash = (messageBuf: number[]): number[] => {
  const bw = new Writer()
  bw.writeVarIntNum(prefix.length)
  bw.write(toArray(prefix, 'utf8'))
  bw.writeVarIntNum(messageBuf.length)
  bw.write(messageBuf)
  const buf = bw.toArray()
  const hashBuf = Hash.hash256(buf)
  return hashBuf
}

/**
 * Signs a BSM message using the given private key.
 * @deprecated Replaced by BRC-77 which employs BRC-42 key derivation and BRC-43 invoice numbers for enhanced security and privacy.
 * @param message The message to be signed as a number array.
 * @param privateKey The private key used for signing the message.
 * @returns The signature object.
 */
export const sign = (message: number[], privateKey: PrivateKey): Signature => {
  const hashBuf = magicHash(message)
  return ECDSA.sign(new BigNumber(hashBuf), privateKey, true)
}

/**
 * Verifies a BSM signed message using the given public key.
 * @deprecated Replaced by BRC-77 which provides privately-verifiable signatures and avoids key reuse.
 * @param message The message to be verified as a number array.
 * @param sig The signature object.
 * @param pubKey The public key for verification.
 * @returns True if the signature is valid, false otherwise.
 */
export const verify = (message: number[], sig: Signature, pubKey: PublicKey): boolean => {
  const hashBuf = magicHash(message)
  return ECDSA.verify(new BigNumber(hashBuf), sig, pubKey)
}
