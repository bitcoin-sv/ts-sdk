import PrivateKey from './PrivateKey.js'
import BigNumber from './BigNumber.js'
import Curve from './Curve.js'
import Random from './Random.js'
import { fromBase58, toBase58 } from './utils.js'

export class PointInFiniteField {
  x: BigNumber
  y: BigNumber

  constructor (x: BigNumber, y: BigNumber) {
    const P = new Curve().p // arithmetic is mod P
    this.x = x.umod(P)
    this.y = y.umod(P)
  }

  toString (): string {
    return toBase58(this.x.toArray()) + '.' + toBase58(this.y.toArray())
  }

  static fromString (str: string): PointInFiniteField {
    const [x, y] = str.split('.')
    return new PointInFiniteField(new BigNumber(fromBase58(x)), new BigNumber(fromBase58(y)))
  }
}

/**
 * Polynomial class
 *
 * This class is used to create a polynomial with a given threshold and a private key.
 * The polynomial is used to create shares of the private key.
 *
 * @param key - The private key to split
 * @param threshold - The number of shares required to recombine the private key
 *
 * @example
 * const key = new PrivateKey()
 * const threshold = 2
 * const polynomial = new Polynomial(key, threshold)
 *
 */
export default class Polynomial {
  readonly points: PointInFiniteField[]
  readonly threshold: number

  constructor (points: PointInFiniteField[], threshold?: number) {
    this.points = points
    this.threshold = threshold || points.length
  }

  static fromPrivateKey (key: PrivateKey, threshold: number): Polynomial {
    const P = new Curve().p // arithmetic is mod P
    // The key is the y-intercept of the polynomial where x=0.
    const points = [new PointInFiniteField(new BigNumber(0), new BigNumber(key.toArray()))]

    // The other values are random
    for (let i = 1; i < threshold; i++) {
      const randomX = new BigNumber(Random(32)).umod(P)
      const randomY = new BigNumber(Random(32)).umod(P)
      points.push(new PointInFiniteField(randomX, randomY))
    }

    return new Polynomial(points)
  }

  // Evaluate the polynomial at x by using Lagrange interpolation
  valueAt (x: BigNumber): BigNumber {
    const P = new Curve().p // arithmetic is mod P
    let y = new BigNumber(0)
    for (let i = 0; i < this.threshold; i++) {
      let term = this.points[i].y
      for (let j = 0; j < this.threshold; j++) {
        if (i !== j) {
          const xj = this.points[j].x
          const xi = this.points[i].x

          const numerator = x.sub(xj).umod(P)
          const denominator = xi.sub(xj).umod(P)
          const denominatorInverse = denominator.invm(P)

          const fraction = numerator.mul(denominatorInverse).umod(P)
          term = term.mul(fraction).umod(P)
        }
      }
      y = y.add(term).umod(P)
    }
    return y
  }
}
