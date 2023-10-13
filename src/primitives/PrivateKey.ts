import BigNumber from './BigNumber'
import Signature from './Signature'
import Message from './Message'
import PublicKey from './PublicKey'

export default class PrivateKey {
  n: BigNumber

  constructor (n: BigNumber) {
    this.n = n
  }

  sign (msg: Message): Signature {

  }

  verify (msg: Message, sig: Signature): boolean {

  }

  toPublicKey (): PublicKey {

  }
}
