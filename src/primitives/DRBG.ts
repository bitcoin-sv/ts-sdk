import { SHA256HMAC } from './Hash.js'
import { toHex, toArray } from './utils.js'

export default class HmacDRBG {
  K: number[]
  V: number[]

  constructor (entropy: number[] | string, nonce: number[] | string) {
    entropy = toArray(entropy, 'hex')
    nonce = toArray(nonce, 'hex')

    if (entropy.length < 32) {
      throw new Error('Not enough entropy. Minimum is 256 bits')
    }
    const seed = entropy.concat(nonce)

    this.K = new Array(32)
    this.V = new Array(32)
    for (let i = 0; i < 32; i++) {
      this.K[i] = 0x00
      this.V[i] = 0x01
    }
    this.update(seed)
  }

  hmac (): SHA256HMAC {
    return new SHA256HMAC(this.K)
  }

  update (seed?): void {
    let kmac = this.hmac()
      .update(this.V)
      .update([0x00])
    if (seed !== undefined) { kmac = kmac.update(seed) }
    this.K = kmac.digest() as number[]
    this.V = this.hmac().update(this.V).digest() as number[]
    if (seed === undefined) { return }

    this.K = this.hmac()
      .update(this.V)
      .update([0x01])
      .update(seed)
      .digest() as number[]
    this.V = this.hmac().update(this.V).digest() as number[]
  }

  generate (len: number): string {
    let temp = []
    while (temp.length < len) {
      this.V = this.hmac().update(this.V).digest() as number[]
      temp = temp.concat(this.V)
    }

    const res = temp.slice(0, len)
    this.update()
    return toHex(res)
  }
}
