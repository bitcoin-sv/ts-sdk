import BigNumber from './BigNumber'
import PublicKey from './PublicKey'
import Message from './Message'

export default class Signature {
  r: BigNumber
  s: BigNumber

  constructor (r: BigNumber, s: BigNumber) {
    this.r = r
    this.s = s
  }

  verify (msg: Message, key: PublicKey): boolean {

  }
}
