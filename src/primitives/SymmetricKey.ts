import BigNumber from './BigNumber'
import { AESGCM, AESGCMDecrypt } from './AESGCM'
import Random from './Random'
import { toArray, encode } from './utils'

export default class SymmetricKey extends BigNumber {
  encrypt (msg: number[] | string, enc?: 'hex'): string | number[] {
    const iv = Random(32)
    msg = toArray(msg, enc)
    const { result, authenticationTag } = AESGCM(
      msg,
      [],
      iv,
      this.toArray()
    )
    return encode([...iv, ...result, ...authenticationTag], enc)
  }

  decrypt (msg: number[] | string, enc?: 'hex' | 'utf8'): string | number[] {
    msg = toArray(msg, enc) as number[]
    const iv = msg.slice(0, 32)
    const ciphertextWithTag = msg.slice(32)
    const messageTag = ciphertextWithTag.slice(-16)
    const ciphertext = ciphertextWithTag.slice(0, -16)
    const result = AESGCMDecrypt(
      ciphertext,
      [],
      iv,
      messageTag,
      this.toArray()
    )
    if (result === null) {
      throw new Error('Decryption failed!')
    }
    return encode(result, enc)
  }
}
