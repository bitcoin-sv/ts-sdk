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
  private readonly points: Point[]
  private readonly threshold: number

  constructor (points: Point[], threshold: number) {
    this.points = points
    this.threshold = threshold
  }

  static fromPrivateKey (key: PrivateKey, threshold: number): Polynomial {
    // The key is the y-intercept of the polynomial where x=0.
    const poly = new Polynomial([new Point(new BigNumber(0), new BigNumber(key.toArray()))], threshold)
    // The other values are random
    for (let i = 1; i < threshold; i++) {
      poly.points.push(new Point(new BigNumber(Random(32)).mod(P), new BigNumber(Random(32)).mod(P)))
    }
    return poly
  }

  // Evaluate the polynomial at x by using lagrange interpolation
  valueAt (x: BigNumber): BigNumber {
    let y = new BigNumber(0)
    for (let i = 0; i < this.threshold; i++) {
      let term = this.points[i].y
      for (let j = 0; j < this.threshold; j++) {
        if (i !== j) {
          const xj = this.points[j].x
          const xi = this.points[i].x
          
          const numerator = x.sub(xj)
          const denominator = xi.sub(xj)
          const denominatorInverse = denominator.invm(P)
          
          const fraction = numerator.mul(denominatorInverse).mod(P)
          term = term.mul(fraction).mod(P)
        }
      }
      y = y.add(term).mod(P)
    }
    return y
  }
}
