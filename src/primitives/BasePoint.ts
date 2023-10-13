import BigNumber from './BigNumber'
import Curve from './Curve'

// NOTE: Methods from this class currently return 'any' instead of BasePoint, because their return type depends on the derived class of the instance. This deserves more attention and thought.

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

  add (p: any): any {
    throw new Error('Not implmented')
  }

  dbl (): any {
    throw new Error('Not implmented')
  }

  precompute (power?: number): any {
    if (this.precomputed != null) { return this }

    const precomputed = {
      doubles: null,
      naf: null,
      beta: null
    }
    precomputed.naf = this._getNAFPoints(8)
    precomputed.doubles = this._getDoubles(4, power)
    precomputed.beta = this._getBeta()
    this.precomputed = precomputed

    return this
  };

  _hasDoubles (k: BigNumber): boolean {
    if (this.precomputed == null) { return false }

    const doubles = this.precomputed.doubles
    if (typeof doubles !== 'object') { return false }

    return doubles.points.length >= Math.ceil((k.bitLength() + 1) / doubles.step)
  };

  _getDoubles (
    step?: number,
    power?: number
  ): { step: number, points: any[] } {
    if (
      typeof this.precomputed === 'object' && this.precomputed !== null &&
      typeof this.precomputed.doubles === 'object' &&
      this.precomputed.doubles !== null
    ) {
      return this.precomputed.doubles
    }

    const doubles = [this]
    /* eslint-disable @typescript-eslint/no-this-alias */
    let acc: BasePoint = this
    for (let i = 0; i < power; i += step) {
      for (let j = 0; j < step; j++) { acc = acc.dbl() }
      doubles.push(acc as this)
    }
    return {
      step,
      points: doubles
    }
  };

  _getNAFPoints (wnd: number): { wnd: number, points: any[] } {
    if (
      typeof this.precomputed === 'object' && this.precomputed !== null &&
      typeof this.precomputed.naf === 'object' && this.precomputed.naf !== null
    ) {
      return this.precomputed.naf
    }

    const res = [this]
    const max = (1 << wnd) - 1
    const dbl = max === 1 ? null : this.dbl()
    for (let i = 1; i < max; i++) { res[i] = res[i - 1].add(dbl) }
    return {
      wnd,
      points: res
    }
  }

  _getBeta (): any {
    return null
  }

  dblp (k: number): any {
    let r: BasePoint = this
    for (let i = 0; i < k; i++) { r = r.dbl() }
    return r
  }
}
