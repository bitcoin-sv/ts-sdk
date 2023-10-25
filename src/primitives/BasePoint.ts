import Curve from './Curve.js'

/**
 * Base class for Point (affine coordinates) and JacobianPoint classes,
 * defining their curve and type.
 */
export default abstract class BasePoint {
  curve: Curve
  type: 'affine' | 'jacobian'
  precomputed: {
    doubles: { step: number, points: any[] } | undefined
    naf: { wnd: any, points: any[] } | undefined
    beta: BasePoint | null | undefined
  } | null

  constructor (type: 'affine' | 'jacobian') {
    this.curve = new Curve()
    this.type = type
    this.precomputed = null
  }
}
