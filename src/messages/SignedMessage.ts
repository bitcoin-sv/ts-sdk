import PublicKey from '../primitives/PublicKey.js'
import PrivateKey from '../primitives/PrivateKey.js'
import Signature from '../primitives/Signature.js'
import Curve from '../primitives/Curve.js'
import Random from '../primitives/Random.js'
import { toBase64, toArray, Reader, toHex } from '../primitives/utils.js'

const VERSION = '42423301'

export const sign = (
  message: number[],
  sender: PrivateKey,
  recipient?: PublicKey
): number[] => {
  const recipientAnyone = typeof recipient !== 'object'
  if (recipientAnyone) {
    const curve = new Curve()
    const anyone = new PrivateKey(1)
    const anyonePoint = curve.g.mul(anyone)
    recipient = new PublicKey(
      anyonePoint.x,
      anyonePoint.y
    )
  }
  const keyID = Random(32)
  const keyIDBase64 = toBase64(keyID)
  const invoiceNumber = `2-message signing-${keyIDBase64}`
  const signingKey = sender.deriveChild(recipient, invoiceNumber)
  const signature = signingKey.sign(message).toDER()
  const senderPublicKey = sender.toPublicKey().encode(true)
  const version = toArray(VERSION, 'hex')
  return [
    ...version,
    ...senderPublicKey,
    ...(recipientAnyone ? [0] : recipient.encode(true)),
    ...keyID,
    ...signature
  ]
}

export const verify = (message: number[], sig: number[], recipient?: PrivateKey): boolean => {
  const reader = new Reader(sig)
  const messageVersion = toHex(reader.read(4))
  if (messageVersion !== VERSION) {
    throw new Error(
        `Message version mismatch: Expected ${VERSION}, received ${messageVersion}`
    )
  }
  const signer = PublicKey.fromString(toHex(reader.read(33)))
  const [verifierFirst] = reader.read(1)
  if (verifierFirst === 0) {
    recipient = new PrivateKey(1)
  } else {
    const verifierRest = reader.read(32)
    const verifierDER = toHex([verifierFirst, ...verifierRest])
    if (typeof recipient !== 'object') {
      throw new Error(`This signature can only be verified with knowledge of a specific private key. The associated public key is: ${verifierDER}`)
    }
    const recipientDER = recipient.toPublicKey().encode(true, 'hex') as string
    if (verifierDER !== recipientDER) {
      throw new Error(`The recipient public key is ${recipientDER} but the signature requres the recipient to have public key ${verifierDER}`)
    }
  }
  const keyID = toBase64(reader.read(32))
  const signatureDER = toHex(reader.read(reader.bin.length - reader.pos))
  const signature = Signature.fromDER(signatureDER, 'hex')
  const invoiceNumber = `2-message signing-${keyID}`
  const signingKey = signer.deriveChild(recipient, invoiceNumber)
  const verified = signingKey.verify(message, signature)
  return verified
}
