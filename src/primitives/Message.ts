import PublicKey from './PublicKey'
import Signature from './Signature'

export default class Message {
  data: Buffer

  constructor (data: Buffer) {
    this.data = data
  }

  sign (key: PublicKey): Signature {

  }

  verify (sig: Signature, key: PublicKey): boolean {

  }
}
