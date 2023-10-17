import BigNumber from './BigNumber'
import Signature from './Signature'
import PublicKey from './PublicKey'
import Point from './Point'
import Curve from './Curve'
import { sign, verify } from './ECDSA'
import { sha256 } from './Hash'
import Random from './Random'

export default class PrivateKey extends BigNumber {
  static fromRandom (): PrivateKey {
    return new PrivateKey(Random(32))
  }

  sign (msg: number[] | string, enc?: 'hex'): Signature {
    const msgHash = new BigNumber(sha256(msg, enc), 16)
    return sign(msgHash, this)
  }

  verify (msg: number[] | string, sig: Signature, enc?: 'hex'): boolean {
    const msgHash = new BigNumber(sha256(msg, enc), 16)
    return verify(msgHash, sig, this.toPublicKey())
  }

  toPublicKey (): PublicKey {
    const c = new Curve()
    const p = c.g.mul(this)
    return new PublicKey(p.x, p.y)
  }

  deriveSharedSecret (key: PublicKey): Point {
    if (!key.validate()) {
      throw new Error('Public key not valid for ECDH secret derivation')
    }
    return key.mul(this)
  }
}
