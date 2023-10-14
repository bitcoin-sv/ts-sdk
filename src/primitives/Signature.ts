import BigNumber from './BigNumber'
import PublicKey from './PublicKey'
import Message from './Message'
import { verify } from './ECDSA'

export default class Signature {
  r: BigNumber
  s: BigNumber

  constructor (r: BigNumber, s: BigNumber) {
    this.r = r
    this.s = s
  }

  verify (msg: Message, key: PublicKey): void {
  }
}
