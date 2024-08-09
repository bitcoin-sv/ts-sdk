import BasePoint from './BasePoint.js'
import JPoint from './JacobianPoint.js'
import BigNumber from './BigNumber.js'
import { toArray, toHex } from './utils.js'
import ReductionContext from './ReductionContext.js'

/**
 * `Point` class is a representation of an elliptic curve point with affine coordinates.
 * It extends the functionality of BasePoint and carries x, y coordinates of point on the curve.
 * It also introduces new methods for handling Point operations in elliptic curve.
 *
 * @class Point
 * @extends {BasePoint}
 *
 * @property x - The x-coordinate of the point.
 * @property y - The y-coordinate of the point.
 * @property inf - Flag to record if the point is at infinity in the Elliptic Curve.
 */
export default class Point extends BasePoint {
  x: BigNumber | null
  y: BigNumber | null
  inf: boolean

  /**
   * Creates a point object from a given Array. These numbers can represent coordinates in hex format, or points
   * in multiple established formats.
   * The function verifies the integrity of the provided data and throws errors if inconsistencies are found.
   *
   * @method fromDER
   * @static
   * @param bytes - The point representation number array.
   * @returns Returns a new point representing the given string.
   * @throws `Error` If the point number[] value has a wrong length.
   * @throws `Error` If the point format is unknown.
   *
   * @example
   * const derPoint = [ 2, 18, 123, 108, 125, 83, 1, 251, 164, 214, 16, 119, 200, 216, 210, 193, 251, 193, 129, 67, 97, 146, 210, 216, 77, 254, 18, 6, 150, 190, 99, 198, 128 ];
   * const point = Point.fromDER(derPoint);
   */
  static fromDER (bytes: number[]): Point {
    const len = 32
    // uncompressed, hybrid-odd, hybrid-even
    if ((bytes[0] === 0x04 || bytes[0] === 0x06 || bytes[0] === 0x07) &&
      bytes.length - 1 === 2 * len) {
      if (bytes[0] === 0x06) {
        if (bytes[bytes.length - 1] % 2 !== 0) {
          throw new Error('Point string value is wrong length')
        }
      } else if (bytes[0] === 0x07) {
        if (bytes[bytes.length - 1] % 2 !== 1) {
          throw new Error('Point string value is wrong length')
        }
      }

      const res = new Point(
        bytes.slice(1, 1 + len),
        bytes.slice(1 + len, 1 + 2 * len)
      )

      return res
    } else if ((bytes[0] === 0x02 || bytes[0] === 0x03) &&
              bytes.length - 1 === len) {
      return Point.fromX(bytes.slice(1, 1 + len), bytes[0] === 0x03)
    }
    throw new Error('Unknown point format')
  }

  /**
   * Creates a point object from a given string. This string can represent coordinates in hex format, or points
   * in multiple established formats.
   * The function verifies the integrity of the provided data and throws errors if inconsistencies are found.
   *
   * @method fromString
   * @static
   *
   * @param str The point representation string.
   * @returns Returns a new point representing the given string.
   * @throws `Error` If the point string value has a wrong length.
   * @throws `Error` If the point format is unknown.
   *
   * @example
   * const pointStr = 'abcdef';
   * const point = Point.fromString(pointStr);
   */
  static fromString (str: string): Point {
    const bytes = toArray(str, 'hex')
    return Point.fromDER(bytes)
  }

  /**
   * Generates a point from an x coordinate and a boolean indicating whether the corresponding
   * y coordinate is odd.
   *
   * @method fromX
   * @static
   * @param x - The x coordinate of the point.
   * @param odd - Boolean indicating whether the corresponding y coordinate is odd or not.
   * @returns Returns the new point.
   * @throws `Error` If the point is invalid.
   *
   * @example
   * const xCoordinate = new BigNumber('10');
   * const point = Point.fromX(xCoordinate, true);
   */

  static fromX (x: BigNumber | number | number[] | string, odd: boolean): Point {
    const red = new ReductionContext('k256')
    const a = new BigNumber(0).toRed(red)
    const b = new BigNumber(7).toRed(red)
    const zero = new BigNumber(0).toRed(red)
    if (!BigNumber.isBN(x)) {
      x = new BigNumber(x as number, 16)
    }
    x = x as BigNumber
    if (x.red == null) {
      x = x.toRed(red)
    }

    const y2 = x.redSqr().redMul(x).redIAdd(x.redMul(a)).redIAdd(b)
    let y = y2.redSqrt()
    if (y.redSqr().redSub(y2).cmp(zero) !== 0) {
      throw new Error('invalid point')
    }

    // XXX Is there any way to tell if the number is odd without converting it
    // to non-red form?
    const isOdd = y.fromRed().isOdd()
    if ((odd && !isOdd) || (!odd && isOdd)) {
      y = y.redNeg()
    }

    return new Point(x, y)
  }

  /**
   * Generates a point from a serialized JSON object. The function accounts for different options in the JSON object,
   * including precomputed values for optimization of EC operations, and calls another helper function to turn nested
   * JSON points into proper Point objects.
   *
   * @method fromJSON
   * @static
   * @param obj - An object or array that holds the data for the point.
   * @param isRed - A boolean to direct how the Point is constructed from the JSON object.
   * @returns Returns a new point based on the deserialized JSON object.
   *
   * @example
   * const serializedPoint = '{"x":52,"y":15}';
   * const point = Point.fromJSON(serializedPoint, true);
   */
  static fromJSON (
    obj: string | any[], isRed: boolean
  ): Point {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj)
    }
    const res = new Point(obj[0], obj[1], isRed)
    if (typeof obj[2] !== 'object') {
      return res
    }

    const obj2point = (obj): Point => {
      return new Point(obj[0], obj[1], isRed)
    }

    const pre = obj[2]
    res.precomputed = {
      beta: null,
      doubles: typeof pre.doubles === 'object' && pre.doubles !== null
        ? {
            step: pre.doubles.step,
            points: [res].concat(pre.doubles.points.map(obj2point))
          }
        : undefined,
      naf: typeof pre.naf === 'object' && pre.naf !== null
        ? {
            wnd: pre.naf.wnd,
            points: [res].concat(pre.naf.points.map(obj2point))
          }
        : undefined
    }
    return res
  }

  /**
   * @constructor
   * @param x - The x-coordinate of the point. May be a number, a BigNumber, a string (which will be interpreted as hex), a number array, or null. If null, an "Infinity" point is constructed.
   * @param y - The y-coordinate of the point, similar to x.
   * @param isRed - A boolean indicating if the point is a member of the field of integers modulo the k256 prime. Default is true.
   *
   * @example
   * new Point('abc123', 'def456');
   * new Point(null, null); // Generates Infinity point.
   */
  constructor (
    x: BigNumber | number | number[] | string | null,
    y: BigNumber | number | number[] | string | null,
    isRed: boolean = true
  ) {
    super('affine')
    this.precomputed = null
    if (x === null && y === null) {
      this.x = null
      this.y = null
      this.inf = true
    } else {
      if (!BigNumber.isBN(x)) {
        x = new BigNumber(x as number, 16)
      }
      this.x = x as BigNumber
      if (!BigNumber.isBN(y)) {
        y = new BigNumber(y as number, 16)
      }
      this.y = y as BigNumber
      // Force redgomery representation when loading from JSON
      if (isRed) {
        this.x.forceRed(this.curve.red)
        this.y.forceRed(this.curve.red)
      }
      if (this.x.red === null) { this.x = this.x.toRed(this.curve.red) }
      if (this.y.red === null) { this.y = this.y.toRed(this.curve.red) }
      this.inf = false
    }
  }

  /**
   * Validates if a point belongs to the curve. Follows the short Weierstrass
   * equation for elliptic curves: y^2 = x^3 + ax + b.
   *
   * @method validate
   * @returns {boolean} true if the point is on the curve, false otherwise.
   *
   * @example
   * const aPoint = new Point(x, y);
   * const isValid = aPoint.validate();
   */
  validate (): boolean {
    return this.curve.validate(this)
  }

  /**
   * Encodes the coordinates of a point into an array or a hexadecimal string.
   * The details of encoding are determined by the optional compact and enc parameters.
   *
   * @method encode
   * @param compact - If true, an additional prefix byte 0x02 or 0x03 based on the 'y' coordinate being even or odd respectively is used. If false, byte 0x04 is used.
   * @param enc - Expects the string 'hex' if hexadecimal string encoding is required instead of an array of numbers.
   * @throws Will throw an error if the specified encoding method is not recognized. Expects 'hex'.
   * @returns If enc is undefined, a byte array representation of the point will be returned. if enc is 'hex', a hexadecimal string representation of the point will be returned.
   *
   * @example
   * const aPoint = new Point(x, y);
   * const encodedPointArray = aPoint.encode();
   * const encodedPointHex = aPoint.encode(true, 'hex');
   */
  encode (compact: boolean = true, enc?: 'hex'): number[] | string {
    const len = this.curve.p.byteLength()
    const x = this.getX().toArray('be', len)
    let res: number[]
    if (compact) {
      res = [this.getY().isEven() ? 0x02 : 0x03].concat(x)
    } else {
      res = [0x04].concat(x, this.getY().toArray('be', len))
    }
    if (enc !== 'hex') {
      return res
    } else {
      return toHex(res)
    }
  }

  /**
   * Converts the point coordinates to a hexadecimal string. A wrapper method
   * for encode. Byte 0x02 or 0x03 is used as prefix based on the 'y' coordinate being even or odd respectively.
   *
   * @method toString
   * @returns {string} A hexadecimal string representation of the point coordinates.
   *
   * @example
   * const aPoint = new Point(x, y);
   * const stringPoint = aPoint.toString();
   */
  toString (): string {
    return this.encode(true, 'hex') as string
  }

  /**
   * Exports the x and y coordinates of the point, and the precomputed doubles and non-adjacent form (NAF) for optimization. The output is an array.
   *
   * @method toJSON
   * @returns An Array where first two elements are the coordinates of the point and optional third element is an object with doubles and NAF points.
   *
   * @example
   * const aPoint = new Point(x, y);
   * const jsonPoint = aPoint.toJSON();
   */
  toJSON (): [BigNumber | null, BigNumber | null, { doubles: { step: any, points: any[] } | undefined, naf: { wnd: any, points: any[] } | undefined }?] {
    if (this.precomputed == null) { return [this.x, this.y] }

    return [this.x, this.y, typeof this.precomputed === 'object' && this.precomputed !== null
      ? {
          doubles: (this.precomputed.doubles != null)
            ? {
                step: this.precomputed.doubles.step,
                points: this.precomputed.doubles.points.slice(1)
              }
            : undefined,
          naf: (this.precomputed.naf != null)
            ? {
                wnd: this.precomputed.naf.wnd,
                points: this.precomputed.naf.points.slice(1)
              }
            : undefined
        }
      : undefined]
  }

  /**
   * Provides the point coordinates in a human-readable string format for debugging purposes.
   *
   * @method inspect
   * @returns String of the format '<EC Point x: x-coordinate y: y-coordinate>', or '<EC Point Infinity>' if the point is at infinity.
   *
   * @example
   * const aPoint = new Point(x, y);
   * console.log(aPoint.inspect());
   */
  inspect (): string {
    if (this.isInfinity()) {
      return '<EC Point Infinity>'
    }
    return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
      ' y: ' + this.y.fromRed().toString(16, 2) + '>'
  }

  /**
   * Checks if the point is at infinity.
   * @method isInfinity
   * @returns Returns whether or not the point is at infinity.
   *
   * @example
   * const p = new Point(null, null);
   * console.log(p.isInfinity()); // outputs: true
   */
  isInfinity (): boolean {
    return this.inf
  }

  /**
   * Adds another Point to this Point, returning a new Point.
   *
   * @method add
   * @param p - The Point to add to this one.
   * @returns A new Point that results from the addition.
   *
   * @example
   * const p1 = new Point(1, 2);
   * const p2 = new Point(2, 3);
   * const result = p1.add(p2);
   */
  add (p: Point): Point {
    // O + P = P
    if (this.inf) { return p }

    // P + O = P
    if (p.inf) { return this }

    // P + P = 2P
    if (this.eq(p)) { return this.dbl() }

    // P + (-P) = O
    if (this.neg().eq(p)) { return new Point(null, null) }

    // P + Q = O
    if (this.x.cmp(p.x) === 0) { return new Point(null, null) }

    let c = this.y.redSub(p.y)
    if (c.cmpn(0) !== 0) { c = c.redMul(this.x.redSub(p.x).redInvm()) }
    const nx = c.redSqr().redISub(this.x).redISub(p.x)
    const ny = c.redMul(this.x.redSub(nx)).redISub(this.y)
    return new Point(nx, ny)
  }

  /**
   * Doubles the current point.
   *
   * @method dbl
   *
   * @example
   * const P = new Point('123', '456');
   * const result = P.dbl();
   * */
  dbl (): Point {
    if (this.inf) { return this }

    // 2P = O
    const ys1 = this.y.redAdd(this.y)
    if (ys1.cmpn(0) === 0) {
      return new Point(null, null)
    }

    const a = this.curve.a

    const x2 = this.x.redSqr()
    const dyinv = ys1.redInvm()
    const c = x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv)

    const nx = c.redSqr().redISub(this.x.redAdd(this.x))
    const ny = c.redMul(this.x.redSub(nx)).redISub(this.y)
    return new Point(nx, ny)
  }

  /**
   * Returns X coordinate of point
   *
   * @example
   * const P = new Point('123', '456');
   * const x = P.getX();
   */
  getX (): BigNumber {
    return this.x.fromRed()
  }

  /**
   * Returns X coordinate of point
   *
   * @example
   * const P = new Point('123', '456');
   * const x = P.getX();
   */
  getY (): BigNumber {
    return this.y.fromRed()
  }

  /**
   * Multiplies this Point by a scalar value, returning a new Point.
   *
   * @method mul
   * @param k - The scalar value to multiply this Point by.
   * @returns  A new Point that results from the multiplication.
   *
   * @example
   * const p = new Point(1, 2);
   * const result = p.mul(2); // this doubles the Point
   */
  mul (k: BigNumber | number | number[] | string): Point {
    if (!BigNumber.isBN(k)) {
      k = new BigNumber(k as number, 16)
    }
    k = k as BigNumber
    if (this.isInfinity()) {
      return this
    } else if (this._hasDoubles(k)) {
      return this._fixedNafMul(k)
    } else {
      return this._endoWnafMulAdd([this], [k]) as Point
    }
  }

  /**
   * Performs a multiplication and addition operation in a single step.
   * Multiplies this Point by k1, adds the resulting Point to the result of p2 multiplied by k2.
   *
   * @method mulAdd
   * @param k1 - The scalar value to multiply this Point by.
   * @param p2 - The other Point to be involved in the operation.
   * @param k2 - The scalar value to multiply the Point p2 by.
   * @returns A Point that results from the combined multiplication and addition operations.
   *
   * @example
   * const p1 = new Point(1, 2);
   * const p2 = new Point(2, 3);
   * const result = p1.mulAdd(2, p2, 3);
   */
  mulAdd (k1: BigNumber, p2: Point, k2: BigNumber): Point {
    const points = [this, p2]
    const coeffs = [k1, k2]
    return this._endoWnafMulAdd(points, coeffs) as Point
  }

  /**
   * Performs the Jacobian multiplication and addition operation in a single
   * step. Instead of returning a regular Point, the result is a JacobianPoint.
   *
   * @method jmulAdd
   * @param k1 - The scalar value to multiply this Point by.
   * @param p2 - The other Point to be involved in the operation
   * @param k2 - The scalar value to multiply the Point p2 by.
   * @returns A JacobianPoint that results from the combined multiplication and addition operation.
   *
   * @example
   * const p1 = new Point(1, 2);
   * const p2 = new Point(2, 3);
   * const result = p1.jmulAdd(2, p2, 3);
   */
  jmulAdd (k1: BigNumber, p2: Point, k2: BigNumber): JPoint {
    const points = [this, p2]
    const coeffs = [k1, k2]
    return this._endoWnafMulAdd(points, coeffs, true) as JPoint
  }

  /**
   * Checks if the Point instance is equal to another given Point.
   *
   * @method eq
   * @param p - The Point to be checked if equal to the current instance.
   *
   * @returns Whether the two Point instances are equal. Both the 'x' and 'y' coordinates have to match, and both points have to either be valid or at infinity for equality. If both conditions are true, it returns true, else it returns false.
   *
   * @example
   * const p1 = new Point(5, 20);
   * const p2 = new Point(5, 20);
   * const areEqual = p1.eq(p2); // returns true
   */
  eq (p: Point): boolean {
    return this === p || (
      (this.inf === p.inf) &&
      (this.inf || (this.x.cmp(p.x) === 0 && this.y.cmp(p.y) === 0)))
  }

  /**
   * Negate a point. The negation of a point P is the mirror of P about x-axis.
   *
   * @method neg
   *
   * @example
   * const P = new Point('123', '456');
   * const result = P.neg();
   */
  neg (_precompute?: boolean): Point {
    if (this.inf) { return this }

    const res = new Point(this.x, this.y.redNeg())
    if (_precompute && (this.precomputed != null)) {
      const pre = this.precomputed
      const negate = (p: Point): Point => p.neg()
      res.precomputed = {
        naf: (pre.naf != null) && {
          wnd: pre.naf.wnd,
          points: pre.naf.points.map(negate)
        },
        doubles: (pre.doubles != null) && {
          step: pre.doubles.step,
          points: pre.doubles.points.map((p) => p.neg())
        },
        beta: undefined
      }
    }
    return res
  }

  /**
   * Performs the "doubling" operation on the Point a given number of times.
   * This is used in elliptic curve operations to perform multiplication by 2, multiple times.
   * If the point is at infinity, it simply returns the point because doubling
   * a point at infinity is still infinity.
   *
   * @method dblp
   * @param k - The number of times the "doubling" operation is to be performed on the Point.
   * @returns The Point after 'k' "doubling" operations have been performed.
   *
   * @example
   * const p = new Point(5, 20);
   * const doubledPoint = p.dblp(10); // returns the point after "doubled" 10 times
   */
  dblp (k: number): Point {
    /* eslint-disable @typescript-eslint/no-this-alias */
    let r: Point = this
    for (let i = 0; i < k; i++) { r = r.dbl() }
    return r
  }

  /**
   * Converts the point to a Jacobian point. If the point is at infinity, the corresponding Jacobian point
   * will also be at infinity.
   *
   * @method toJ
   * @returns Returns a new Jacobian point based on the current point.
   *
   * @example
   * const point = new Point(xCoordinate, yCoordinate);
   * const jacobianPoint = point.toJ();
   */
  toJ (): JPoint {
    if (this.inf) {
      return new JPoint(null, null, null)
    }
    const res = new JPoint(this.x, this.y, this.curve.one)
    return res
  }

  private _getBeta (): undefined | Point {
    if (typeof this.curve.endo !== 'object') { return }

    const pre = this.precomputed
    if (typeof pre === 'object' && pre !== null && typeof pre.beta === 'object' && pre.beta !== null) {
      return pre.beta as Point
    }

    const beta = new Point(this.x.redMul(this.curve.endo.beta), this.y)
    if (pre != null) {
      const curve = this.curve
      const endoMul = (p: Point): Point => {
        return new Point(p.x.redMul(curve.endo.beta), p.y)
      }
      pre.beta = beta
      beta.precomputed = {
        beta: null,
        naf: (pre.naf != null)
          ? {
              wnd: pre.naf.wnd,
              points: pre.naf.points.map(endoMul)
            }
          : undefined,
        doubles: (pre.doubles != null)
          ? {
              step: pre.doubles.step,
              points: pre.doubles.points.map(endoMul)
            }
          : undefined
      }
    }
    return beta
  }

  private _fixedNafMul (k: BigNumber): Point {
    if (typeof this.precomputed !== 'object' || this.precomputed === null) {
      throw new Error('_fixedNafMul requires precomputed values for the point')
    }
    const doubles = this._getDoubles()

    const naf = this.curve.getNAF(k, 1, this.curve._bitLength)
    let I = (1 << (doubles.step + 1)) - (doubles.step % 2 === 0 ? 2 : 1)
    I /= 3

    // Translate into more windowed form
    const repr: number[] = []
    for (let j = 0; j < naf.length; j += doubles.step) {
      let nafW = 0
      for (let k = j + doubles.step - 1; k >= j; k--) {
        nafW = (nafW << 1) + naf[k]
      }
      repr.push(nafW)
    }

    let a = new JPoint(null, null, null)
    let b = new JPoint(null, null, null)
    for (let i = I; i > 0; i--) {
      for (let j = 0; j < repr.length; j++) {
        const nafW = repr[j]
        if (nafW === i) {
          b = b.mixedAdd(doubles.points[j])
        } else if (nafW === -i) {
          b = b.mixedAdd((doubles.points[j]).neg())
        }
      }
      a = a.add(b)
    }
    return a.toP()
  }

  private _wnafMulAdd (
    defW: number,
    points: Point[],
    coeffs: BigNumber[],
    len: number,
    jacobianResult?: boolean
  ): BasePoint {
    const wndWidth = this.curve._wnafT1
    const wnd = this.curve._wnafT2
    const naf = this.curve._wnafT3

    // Fill all arrays
    let max = 0
    for (let i = 0; i < len; i++) {
      const p = points[i]
      const nafPoints = p._getNAFPoints(defW)
      wndWidth[i] = nafPoints.wnd
      wnd[i] = nafPoints.points
    }

    // Comb small window NAFs
    for (let i = len - 1; i >= 1; i -= 2) {
      const a = i - 1
      const b = i
      if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
        naf[a] = this.curve
          .getNAF(coeffs[a], wndWidth[a], this.curve._bitLength)
        naf[b] = this.curve
          .getNAF(coeffs[b], wndWidth[b], this.curve._bitLength)
        max = Math.max(naf[a].length, max)
        max = Math.max(naf[b].length, max)
        continue
      }

      const comb: any[] = [
        points[a], /* 1 */
        null, /* 3 */
        null, /* 5 */
        points[b] /* 7 */
      ]

      // Try to avoid Projective points, if possible
      if (points[a].y.cmp(points[b].y) === 0) {
        comb[1] = points[a].add(points[b])
        comb[2] = points[a].toJ().mixedAdd(points[b].neg())
      } else if (points[a].y.cmp(points[b].y.redNeg()) === 0) {
        comb[1] = points[a].toJ().mixedAdd(points[b])
        comb[2] = points[a].add(points[b].neg())
      } else {
        comb[1] = points[a].toJ().mixedAdd(points[b])
        comb[2] = points[a].toJ().mixedAdd(points[b].neg())
      }

      const index = [
        -3, /* -1 -1 */
        -1, /* -1 0 */
        -5, /* -1 1 */
        -7, /* 0 -1 */
        0, /* 0 0 */
        7, /* 0 1 */
        5, /* 1 -1 */
        1, /* 1 0 */
        3 /* 1 1 */
      ]

      const jsf = this.curve.getJSF(coeffs[a], coeffs[b])
      max = Math.max(jsf[0].length, max)
      naf[a] = new Array(max)
      naf[b] = new Array(max)
      for (let j = 0; j < max; j++) {
        const ja = jsf[0][j] | 0
        const jb = jsf[1][j] | 0

        naf[a][j] = index[(ja + 1) * 3 + (jb + 1)]
        naf[b][j] = 0
        wnd[a] = comb
      }
    }

    let acc = new JPoint(null, null, null)
    const tmp = this.curve._wnafT4
    for (let i = max; i >= 0; i--) {
      let k = 0

      while (i >= 0) {
        let zero = true
        for (let j = 0; j < len; j++) {
          tmp[j] = naf[j][i] | 0
          if (tmp[j] !== 0) { zero = false }
        }
        if (!zero) { break }
        k++
        i--
      }
      if (i >= 0) { k++ }
      acc = acc.dblp(k)
      if (i < 0) { break }

      for (let j = 0; j < len; j++) {
        const z = tmp[j]
        let p
        if (z === 0) {
          continue
        } else if (z > 0) {
          p = wnd[j][(z - 1) >> 1]
        } else if (z < 0) {
          p = wnd[j][(-z - 1) >> 1].neg()
        }

        if (p.type === 'affine') {
          acc = acc.mixedAdd(p)
        } else {
          acc = acc.add(p)
        }
      }
    }
    // Zeroify references
    for (let i = 0; i < len; i++) { wnd[i] = null }

    if (jacobianResult) {
      return acc
    } else {
      return acc.toP()
    }
  }

  private _endoWnafMulAdd (points: Point[], coeffs, jacobianResult?: boolean): BasePoint {
    const npoints = this.curve._endoWnafT1
    const ncoeffs = this.curve._endoWnafT2
    let i
    for (i = 0; i < points.length; i++) {
      const split = this.curve._endoSplit(coeffs[i])
      let p = points[i]
      let beta = p._getBeta()

      if (split.k1.negative !== 0) {
        split.k1.ineg()
        p = p.neg(true)
      }
      if (split.k2.negative !== 0) {
        split.k2.ineg()
        beta = beta.neg(true)
      }

      npoints[i * 2] = p
      npoints[i * 2 + 1] = beta
      ncoeffs[i * 2] = split.k1
      ncoeffs[i * 2 + 1] = split.k2
    }
    const res = this._wnafMulAdd(1, npoints, ncoeffs, i * 2, jacobianResult)

    // Clean-up references to points and coefficients
    for (let j = 0; j < i * 2; j++) {
      npoints[j] = null
      ncoeffs[j] = null
    }
    return res
  }

  private _hasDoubles (k: BigNumber): boolean {
    if (this.precomputed == null) { return false }

    const doubles = this.precomputed.doubles
    if (typeof doubles !== 'object') { return false }

    return doubles.points.length >= Math.ceil((k.bitLength() + 1) / doubles.step)
  };

  private _getDoubles (
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
    let acc: Point = this
    for (let i = 0; i < power; i += step) {
      for (let j = 0; j < step; j++) { acc = acc.dbl() }
      doubles.push(acc as this)
    }
    return {
      step,
      points: doubles
    }
  };

  private _getNAFPoints (wnd: number): { wnd: number, points: any[] } {
    if (
      typeof this.precomputed === 'object' && this.precomputed !== null &&
      typeof this.precomputed.naf === 'object' && this.precomputed.naf !== null
    ) {
      return this.precomputed.naf
    }

    const res = [this]
    const max = (1 << wnd) - 1
    const dbl = max === 1 ? null : this.dbl()
    for (let i = 1; i < max; i++) { res[i] = res[i - 1].add(dbl) as this }
    return {
      wnd,
      points: res
    }
  }
}
