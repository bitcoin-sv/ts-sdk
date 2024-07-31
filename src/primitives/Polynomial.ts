import PrivateKey from './PrivateKey.js'
import BigNumber from './BigNumber.js'
import Point from './Point.js'
import Curve from './Curve.js'
import Random from './Random.js'

// prime for the finite field must be larger than any key value.
const P = new Curve().p

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
  readonly points: Point[]
  readonly threshold: number

  constructor (points: Point[]) {
    this.points = points
    this.threshold = points.length
  }

  static fromPrivateKey (key: PrivateKey, threshold: number): Polynomial {
    // The key is the y-intercept of the polynomial where x=0.
    const points = [new Point(new BigNumber(0), new BigNumber(key.toArray()))]

    // The other values are random
    for (let i = 1; i < threshold; i++) {
      const randomX = new BigNumber(Random(32)).umod(P)
      const randomY = new BigNumber(Random(32)).umod(P)
      points.push(new Point(randomX, randomY))
    }

    return new Polynomial(points)
  }

  // Evaluate the polynomial at x by using Lagrange interpolation
  valueAt (x: BigNumber): BigNumber {
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
