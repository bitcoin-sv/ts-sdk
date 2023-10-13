import Point from './Point'
import PrivateKey from './PrivateKey'

export default class PublicKey {
  point: Point

  static fromPrivateKey (key: PrivateKey): PublicKey {

  }

  constructor (point: Point) {
    this.point = point
  }
}
