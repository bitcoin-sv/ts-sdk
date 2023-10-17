import Point from './Point'
import PrivateKey from './PrivateKey'
import Curve from './Curve'
import { verify } from './ECDSA'
import BigNumber from './BigNumber'
import { sha256 } from './Hash'
import Signature from './Signature'

export default class PublicKey extends Point {
  static fromPrivateKey (key: PrivateKey): PublicKey {
    const c = new Curve()
    const p = c.g.mul(key)
    return new PublicKey(p.x, p.y)
  }

  static fromString (str: string): PublicKey {
    const p = Point.fromString(str)
    return new PublicKey(p.x, p.y)
  }

  deriveSharedSecret (priv: PrivateKey): Point {
    if (!this.validate()) {
      throw new Error('Public key not valid for ECDH secret derivation')
    }
    return this.mul(priv)
  }

  verify (msg: number[] | string, sig: Signature, enc?: 'hex'): boolean {
    const msgHash = new BigNumber(sha256(msg, enc), 16)
    return verify(msgHash, sig, this)
  }

  toDER (): string {
    return this.encode(true, 'hex') as string
  }
}
