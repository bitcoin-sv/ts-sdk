import { sha256 } from './Hash'

export default class HmacDRBG {
  K: number[]
  V: number[]

  constructor (entropy: number[], nonce: number[]) {
    this.K = null
    this.V = null

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

  hmac () {
    return new sha256.hmac(this.K)
  }

  update (seed?): void {
    let kmac = this.hmac()
      .update(this.V)
      .update([0x00])
    if (seed !== undefined) { kmac = kmac.update(seed) }
    this.K = kmac.digest()
    this.V = this.hmac().update(this.V).digest()
    if (seed === undefined) { return }

    this.K = this.hmac()
      .update(this.V)
      .update([0x01])
      .update(seed)
      .digest()
    this.V = this.hmac().update(this.V).digest()
  }

  generate (len: number): number[] {
    let temp = []
    while (temp.length < len) {
      this.V = this.hmac().update(this.V).digest()
      temp = temp.concat(this.V)
    }

    const res = temp.slice(0, len)
    this.update()
    return res
  }
}
