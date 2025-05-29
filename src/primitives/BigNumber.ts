// @ts-nocheck
import ReductionContext from './ReductionContext.js'

// ... (rest of the BigNumber class as per your latest working version) ...
export default class BigNumber {
  // ... (static readonly arrays, wordSize, constants - UNCHANGED from your previous "new" version) ...
  public static readonly zeros: string[] = [
    '', '0', '00', '000', '0000', '00000', '000000', '0000000', '00000000',
    '000000000', '0000000000', '00000000000', '000000000000', '0000000000000',
    '00000000000000', '000000000000000', '0000000000000000', '00000000000000000',
    '000000000000000000', '0000000000000000000', '00000000000000000000',
    '000000000000000000000', '0000000000000000000000', '00000000000000000000000',
    '000000000000000000000000', '0000000000000000000000000'
  ]

  static readonly groupSizes: number[] = [
    0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
  ]

  static readonly groupBases: number[] = [
    0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
    43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
    16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343,
    7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000,
    28629151, 33554432, 39135393, 45435424, 52521875, 60466176
  ]

  static readonly wordSize: number = 26
  private static readonly WORD_SIZE_BIGINT: bigint = BigInt(BigNumber.wordSize)
  private static readonly WORD_MASK: bigint = (1n << BigNumber.WORD_SIZE_BIGINT) - 1n
  private static readonly MAX_SAFE_INTEGER_BIGINT: bigint = BigInt(Number.MAX_SAFE_INTEGER)
  private static readonly MIN_SAFE_INTEGER_BIGINT: bigint = BigInt(Number.MIN_SAFE_INTEGER)
  private static readonly MAX_IMULN_ARG: number = 0x4000000 - 1
  private static readonly MAX_NUMBER_CONSTRUCTOR_MAG_BIGINT: bigint = (1n << 53n) - 1n

  private _magnitude: bigint
  private _sign: 0 | 1
  private _nominalWordLength: number
  public red: ReductionContext | null

  public get negative (): number {
    return this._sign
  }

  public set negative (val: number) {
    this.assert(val === 0 || val === 1, 'Negative property must be 0 or 1')
    const newSign = val === 1 ? 1 : 0
    if (this._magnitude === 0n) {
      this._sign = 0
    } else {
      this._sign = newSign
    }
  }

  private get _computedWordsArray (): number[] {
    if (this._magnitude === 0n) return [0]
    const arr: number[] = []
    let temp = this._magnitude
    while (temp > 0n) {
      arr.push(Number(temp & BigNumber.WORD_MASK))
      temp >>= BigNumber.WORD_SIZE_BIGINT
    }
    return arr.length > 0 ? arr : [0]
  }

  public get words (): number[] {
    const computed = this._computedWordsArray
    if (this._nominalWordLength <= computed.length) {
      return computed
    }
    const paddedWords = new Array(this._nominalWordLength).fill(0)
    for (let i = 0; i < computed.length; i++) {
      paddedWords[i] = computed[i]
    }
    return paddedWords
  }

  public set words (newWords: number[]) {
    const oldSign = this._sign
    let newMagnitude = 0n
    const len = newWords.length > 0 ? newWords.length : 1
    for (let i = len - 1; i >= 0; i--) {
      const wordVal = newWords[i] === undefined ? 0 : newWords[i]
      newMagnitude = (newMagnitude << BigNumber.WORD_SIZE_BIGINT) | BigInt(wordVal & Number(BigNumber.WORD_MASK))
    }
    this._magnitude = newMagnitude
    this._sign = oldSign
    this._nominalWordLength = len
    this.normSign()
  }

  public get length (): number {
    return Math.max(1, this._nominalWordLength)
  }

  static isBN (num: any): boolean {
    if (num instanceof BigNumber) return true
    return (
      num !== null &&
      typeof num === 'object' &&
      num.constructor?.wordSize === BigNumber.wordSize &&
      Array.isArray(num.words)
    )
  }

  static max (left: BigNumber, right: BigNumber): BigNumber { return left.cmp(right) > 0 ? left : right }
  static min (left: BigNumber, right: BigNumber): BigNumber { return left.cmp(right) < 0 ? left : right }

  constructor (
    number: number | string | number[] | bigint | undefined = 0,
    base: number | 'be' | 'le' | 'hex' = 10,
    endian: 'be' | 'le' = 'be'
  ) {
    this._magnitude = 0n
    this._sign = 0
    this._nominalWordLength = 1
    this.red = null

    if (number === undefined) number = 0

    if (number === null) { this._initializeState(0n, 0); return }
    if (typeof number === 'bigint') { this._initializeState(number < 0n ? -number : number, number < 0n ? 1 : 0); this.normSign(); return }

    let effectiveBase: number | 'hex' = base
    let effectiveEndian: 'be' | 'le' = endian

    if (base === 'le' || base === 'be') { effectiveEndian = base; effectiveBase = 10 }

    if (typeof number === 'number') { this.initNumber(number, effectiveEndian); return }
    if (Array.isArray(number)) { this.initArray(number, effectiveEndian); return }

    if (typeof number === 'string') {
      if (effectiveBase === 'hex') effectiveBase = 16
      this.assert(typeof effectiveBase === 'number' && effectiveBase === (effectiveBase | 0) && effectiveBase >= 2 && effectiveBase <= 36, 'Base must be an integer between 2 and 36')
      const originalNumberStr = number.toString().replace(/\s+/g, '')
      let start = 0; let sign = 0
      if (originalNumberStr.startsWith('-')) { start++; sign = 1 } else if (originalNumberStr.startsWith('+')) { start++ }

      const numStr = originalNumberStr.substring(start)
      if (numStr.length === 0) { this._initializeState(0n, (sign === 1 && originalNumberStr.startsWith('-')) ? 1 : 0); this.normSign(); return }

      if (effectiveBase === 16) {
        let tempMagnitude: bigint
        if (effectiveEndian === 'le') {
          const bytes: number[] = []; let hexStr = numStr
          if (hexStr.length % 2 !== 0) hexStr = '0' + hexStr
          for (let i = 0; i < hexStr.length; i += 2) {
            const byteHex = hexStr.substring(i, i + 2); const byteVal = parseInt(byteHex, 16)
            if (isNaN(byteVal)) throw new Error('Invalid character in ' + hexStr)
            bytes.push(byteVal)
          }
          this.initArray(bytes, 'le'); this._sign = sign; this.normSign(); return
        } else {
          try { tempMagnitude = BigInt('0x' + numStr) } catch (e) { throw new Error('Invalid character in ' + numStr) }
        }
        this._initializeState(tempMagnitude, sign); this.normSign()
      } else {
        try {
          this._parseBaseString(numStr, effectiveBase)
          this._sign = sign; this.normSign()
          if (effectiveEndian === 'le') {
            const currentSign = this._sign
            this.initArray(this.toArray('be'), 'le')
            this._sign = currentSign; this.normSign()
          }
        } catch (err) {
          const error = err as Error
          if (
            error.message.includes('Invalid character in string') ||
            error.message.includes('Invalid digit for base') ||
            error.message.startsWith('Invalid character:')
          ) {
            throw new Error('Invalid character')
          }
          throw error
        }
      }
    } else if (number !== 0) {
      this.assert(false, 'Unsupported input type for BigNumber constructor')
    } else {
      this._initializeState(0n, 0)
    }
  }

  private _bigIntToStringInBase (num: bigint, base: number): string {
    if (num === 0n) return '0'
    if (base < 2 || base > 36) throw new Error('Base must be between 2 and 36')

    const digits = '0123456789abcdefghijklmnopqrstuvwxyz'
    let result = ''
    let currentNum = num > 0n ? num : -num
    const bigBase = BigInt(base)

    while (currentNum > 0n) {
      result = digits[Number(currentNum % bigBase)] + result
      currentNum /= bigBase
    }
    return result
  }

  private _parseBaseString (numberStr: string, base: number): void {
    if (numberStr.length === 0) { this._magnitude = 0n; this._finishInitialization(); return }

    this._magnitude = 0n
    const bigBase = BigInt(base)

    let groupSize = BigNumber.groupSizes[base]
    let groupBaseBigInt = BigInt(BigNumber.groupBases[base])

    if (groupSize === 0 || groupBaseBigInt === 0n) {
      groupSize = Math.floor(Math.log(0x3ffffff) / Math.log(base))
      if (groupSize === 0) groupSize = 1
      groupBaseBigInt = bigBase ** BigInt(groupSize)
    }

    let currentPos = 0
    const totalLen = numberStr.length

    let firstChunkLen = totalLen % groupSize
    if (firstChunkLen === 0 && totalLen > 0) firstChunkLen = groupSize

    if (firstChunkLen > 0) {
      const chunkStr = numberStr.substring(currentPos, currentPos + firstChunkLen)
      this._magnitude = BigInt(this._parseBaseWord(chunkStr, base))
      currentPos += firstChunkLen
    }

    while (currentPos < totalLen) {
      const chunkStr = numberStr.substring(currentPos, currentPos + groupSize)
      const wordVal = BigInt(this._parseBaseWord(chunkStr, base))
      this._magnitude = this._magnitude * groupBaseBigInt + wordVal
      currentPos += groupSize
    }

    this._finishInitialization()
  }

  private _parseBaseWord (str: string, base: number): number {
    let r = 0
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i)
      let digitVal
      if (charCode >= 48 && charCode <= 57) digitVal = charCode - 48
      else if (charCode >= 65 && charCode <= 90) digitVal = charCode - 65 + 10
      else if (charCode >= 97 && charCode <= 122) digitVal = charCode - 97 + 10
      else throw new Error('Invalid character: ' + str[i])

      if (digitVal >= base) throw new Error('Invalid character')
      r = r * base + digitVal
    }
    return r
  }

  private _initializeState (magnitude: bigint, sign: 0 | 1): void {
    this._magnitude = magnitude
    this._sign = (magnitude === 0n) ? 0 : sign
    this._finishInitialization()
  }

  private _finishInitialization (): void {
    if (this._magnitude === 0n) {
      this._nominalWordLength = 1
      this._sign = 0
    } else {
      const bitLen = this._magnitude.toString(2).length
      this._nominalWordLength = Math.max(1, Math.ceil(bitLen / BigNumber.wordSize))
    }
  }

  private assert (val: unknown, msg: string = 'Assertion failed'): void { if (!(val as boolean)) throw new Error(msg) }

  private initNumber (number: number, endian: 'be' | 'le' = 'be'): this {
    this.assert(BigInt(Math.abs(number)) <= BigNumber.MAX_NUMBER_CONSTRUCTOR_MAG_BIGINT, 'The number is larger than 2 ^ 53 (unsafe)')
    this.assert(number % 1 === 0, 'Number must be an integer for BigNumber conversion')
    this._initializeState(BigInt(Math.abs(number)), number < 0 ? 1 : 0)
    if (endian === 'le') {
      const currentSign = this._sign
      const beBytes = this.toArray('be')
      this.initArray(beBytes, 'le')
      this._sign = currentSign
      this.normSign()
    }
    return this
  }

  private initArray (bytes: number[], endian: 'be' | 'le'): this {
    if (bytes.length === 0) { this._initializeState(0n, 0); return this }
    let magnitude = 0n
    if (endian === 'be') { for (let i = 0; i < bytes.length; i++) magnitude = (magnitude << 8n) | BigInt(bytes[i] & 0xff) } else { for (let i = bytes.length - 1; i >= 0; i--) magnitude = (magnitude << 8n) | BigInt(bytes[i] & 0xff) }
    this._initializeState(magnitude, 0)
    return this
  }

  copy (dest: BigNumber): void { dest._magnitude = this._magnitude; dest._sign = this._sign; dest._nominalWordLength = this._nominalWordLength; dest.red = this.red }
  static move (dest: BigNumber, src: BigNumber): void { dest._magnitude = src._magnitude; dest._sign = src._sign; dest._nominalWordLength = src._nominalWordLength; dest.red = src.red }
  clone (): BigNumber { const r = new BigNumber(0n); this.copy(r); return r }

  expand (size: number): this {
    this.assert(size >= 0, 'Expand size must be non-negative')
    this._nominalWordLength = Math.max(this._nominalWordLength, size, 1)
    return this
  }

  strip (): this { this._finishInitialization(); return this.normSign() }
  normSign (): this { if (this._magnitude === 0n) this._sign = 0; return this }
  inspect (): string { return (this.red !== null ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>' }

  private _getMinimalHex (): string {
    if (this._magnitude === 0n) return '0'
    return this._magnitude.toString(16)
  }

  toString (base: number | 'hex' = 10, padding: number = 1): string {
    if (base === 16 || base === 'hex') {
      // For toString('hex', N), N is the 'multiple-of-N characters' rule from bn.js tests
      // For toString(16, P) where P=1 (default) or P=0, it means minimal hex.
      let hexStr = this._getMinimalHex() // e.g., "f", "123", "0"

      if (padding > 1) { // N-multiple rule for characters
        // Ensure hexStr is even length if not "0" to represent full bytes before applying multiple rule
        if (hexStr !== '0' && hexStr.length % 2 !== 0) {
          hexStr = '0' + hexStr
        }
        while (hexStr.length % padding !== 0) {
          hexStr = '0' + hexStr
        }
      }
      // If padding is 0 or 1, hexStr (minimal) is used as is.
      // "0" is always "0" unless toHex("") specific case.
      // Single digit hex like "f" is not "0f" by default from toString(16).
      return (this.isNeg() ? '-' : '') + hexStr
    }

    if (typeof base !== 'number' || base < 2 || base > 36 || base % 1 !== 0) throw new Error('Base should be an integer between 2 and 36')
    return this.toBaseString(base, padding)
  }

  private toBaseString (base: number, padding: number): string {
    if (this._magnitude === 0n) {
      let out = '0'
      if (padding > 1) { while (out.length < padding) out = '0' + out }
      return out
    }

    let groupSize = BigNumber.groupSizes[base]
    let groupBaseBigInt = BigInt(BigNumber.groupBases[base])
    if (groupSize === 0 || groupBaseBigInt === 0n) {
      groupSize = Math.floor(Math.log(Number.MAX_SAFE_INTEGER) / Math.log(base))
      if (groupSize === 0) groupSize = 1
      groupBaseBigInt = BigInt(base) ** BigInt(groupSize)
    }

    let out = ''
    let tempMag = this._magnitude

    while (tempMag > 0n) {
      const remainder = tempMag % groupBaseBigInt
      tempMag /= groupBaseBigInt

      const chunkStr = this._bigIntToStringInBase(remainder, base)

      if (tempMag > 0n) {
        const zerosToPrepend = groupSize - chunkStr.length
        if (zerosToPrepend > 0 && zerosToPrepend < BigNumber.zeros.length) {
          out = BigNumber.zeros[zerosToPrepend] + chunkStr + out
        } else if (zerosToPrepend > 0) {
          out = '0'.repeat(zerosToPrepend) + chunkStr + out
        } else {
          out = chunkStr + out
        }
      } else {
        out = chunkStr + out
      }
    }

    if (padding > 0) { while (out.length < padding) out = '0' + out }
    return (this._sign === 1 ? '-' : '') + out
  }

  toNumber (): number {
    const val = this._getSignedValue()
    if (val > BigNumber.MAX_SAFE_INTEGER_BIGINT || val < BigNumber.MIN_SAFE_INTEGER_BIGINT) throw new Error('Number can only safely store up to 53 bits')
    return Number(val)
  }

  toJSON (): string {
    const hex = this._getMinimalHex()
    return (this.isNeg() ? '-' : '') + hex
  }

  private toArrayLikeGeneric (res: number[], isLE: boolean): void {
    let tempMag = this._magnitude
    let position = isLE ? 0 : res.length - 1
    const increment = isLE ? 1 : -1

    for (let k = 0; k < res.length; ++k) {
      if (tempMag === 0n && position >= 0 && position < res.length) {
        res[position] = 0
      } else if (position >= 0 && position < res.length) {
        res[position] = Number(tempMag & 0xffn)
      } else {
        break
      }
      tempMag >>= 8n
      position += increment
    }
  }

  toArray (endian: 'le' | 'be' = 'be', length?: number): number[] {
    this.strip()
    const actualByteLength = this.byteLength()
    const reqLength = length ?? Math.max(1, actualByteLength)

    this.assert(actualByteLength <= reqLength, 'byte array longer than desired length')
    this.assert(reqLength > 0, 'Requested array length <= 0')

    const res = new Array(reqLength).fill(0)
    if (this._magnitude === 0n && reqLength > 0) return res
    if (this._magnitude === 0n && reqLength === 0) return []

    this.toArrayLikeGeneric(res, endian === 'le')
    return res
  }

  bitLength (): number { if (this._magnitude === 0n) return 0; return this._magnitude.toString(2).length }
  static toBitArray (num: BigNumber): Array<0 | 1> {
    const len = num.bitLength()
    if (len === 0) return []
    const w = new Array<0 | 1>(len)
    const mag = num._magnitude
    for (let bit = 0; bit < len; bit++) {
      w[bit] = ((mag >> BigInt(bit)) & 1n) !== 0n ? 1 : 0
    }
    return w
  }

  toBitArray (): Array<0 | 1> { return BigNumber.toBitArray(this) }

  zeroBits (): number {
    if (this._magnitude === 0n) return 0
    let c = 0
    let t = this._magnitude
    while ((t & 1n) === 0n && t !== 0n) {
      c++
      t >>= 1n
    }
    return c
  }

  byteLength (): number { if (this._magnitude === 0n) return 0; return Math.ceil(this.bitLength() / 8) }

  private _getSignedValue (): bigint { return this._sign === 1 ? -this._magnitude : this._magnitude }

  private _setValueFromSigned (sVal: bigint): void {
    if (sVal < 0n) {
      this._magnitude = -sVal
      this._sign = 1
    } else {
      this._magnitude = sVal
      this._sign = 0
    }
    this._finishInitialization()
    this.normSign()
  }

  toTwos (width: number): BigNumber { this.assert(width >= 0); const Bw = BigInt(width); let v = this._getSignedValue(); if (this._sign === 1 && this._magnitude !== 0n) v = (1n << Bw) + v; const m = (1n << Bw) - 1n; v &= m; const r = new BigNumber(0n); r._initializeState(v, 0); return r }
  fromTwos (width: number): BigNumber {
    this.assert(width >= 0)
    const Bw = BigInt(width)
    const m = this._magnitude
    if (width > 0 && ((m >> (Bw - 1n)) & 1n) !== 0n && this._sign === 0) {
      const sVal = m - (1n << Bw)
      const r = new BigNumber(0n)
      r._setValueFromSigned(sVal)
      return r
    }
    return this.clone()
  }

  isNeg (): boolean { return this._sign === 1 && this._magnitude !== 0n }
  neg (): BigNumber { return this.clone().ineg() }
  ineg (): this { if (this._magnitude !== 0n) this._sign = this._sign === 1 ? 0 : 1; return this }

  private _iuop (num: BigNumber, op: (a: bigint, b: bigint) => bigint): this {
    const newMag = op(this._magnitude, num._magnitude)
    const isXor = op === ((a: bigint, b: bigint) => a ^ b)
    let targetNominalLength = this._nominalWordLength
    if (isXor) targetNominalLength = Math.max(this.length, num.length)

    this._magnitude = newMag
    this._finishInitialization()
    if (isXor) this._nominalWordLength = Math.max(this._nominalWordLength, targetNominalLength)
    return this.strip()
  }

  iuor (num: BigNumber): this { return this._iuop(num, (a, b) => a | b) }
  iuand (num: BigNumber): this { return this._iuop(num, (a, b) => a & b) }
  iuxor (num: BigNumber): this { return this._iuop(num, (a, b) => a ^ b) }
  private _iop (num: BigNumber, op: (a: bigint, b: bigint) => bigint): this { this.assert(this._sign === 0 && num._sign === 0); return this._iuop(num, op) }
  ior (num: BigNumber): this { return this._iop(num, (a, b) => a | b) }
  iand (num: BigNumber): this { return this._iop(num, (a, b) => a & b) }
  ixor (num: BigNumber): this { return this._iop(num, (a, b) => a ^ b) }
  private _uop_new (num: BigNumber, opName: 'iuor' | 'iuand' | 'iuxor'): BigNumber { if (this.length >= num.length) return this.clone()[opName](num); return num.clone()[opName](this) }
  or (num: BigNumber): BigNumber { this.assert(this._sign === 0 && num._sign === 0); return this._uop_new(num, 'iuor') }
  uor (num: BigNumber): BigNumber { return this._uop_new(num, 'iuor') }
  and (num: BigNumber): BigNumber { this.assert(this._sign === 0 && num._sign === 0); return this._uop_new(num, 'iuand') }
  uand (num: BigNumber): BigNumber { return this._uop_new(num, 'iuand') }
  xor (num: BigNumber): BigNumber { this.assert(this._sign === 0 && num._sign === 0); return this._uop_new(num, 'iuxor') }
  uxor (num: BigNumber): BigNumber { return this._uop_new(num, 'iuxor') }

  inotn (width: number): this { this.assert(typeof width === 'number' && width >= 0); const Bw = BigInt(width); const m = (1n << Bw) - 1n; this._magnitude = (~this._magnitude) & m; const wfw = width === 0 ? 1 : Math.ceil(width / BigNumber.wordSize); this._nominalWordLength = Math.max(1, wfw); this.strip(); this._nominalWordLength = Math.max(this._nominalWordLength, Math.max(1, wfw)); return this }
  notn (width: number): BigNumber { return this.clone().inotn(width) }
  setn (bit: number, val: any): this { this.assert(typeof bit === 'number' && bit >= 0); const Bb = BigInt(bit); if (val === 1 || val === true) this._magnitude |= (1n << Bb); else this._magnitude &= ~(1n << Bb); const wnb = Math.floor(bit / BigNumber.wordSize) + 1; this._nominalWordLength = Math.max(this._nominalWordLength, wnb); this._finishInitialization(); return this.strip() }

  iadd (num: BigNumber): this { this._setValueFromSigned(this._getSignedValue() + num._getSignedValue()); return this }
  add (num: BigNumber): BigNumber { const r = new BigNumber(0n); r._setValueFromSigned(this._getSignedValue() + num._getSignedValue()); return r }
  isub (num: BigNumber): this { this._setValueFromSigned(this._getSignedValue() - num._getSignedValue()); return this }
  sub (num: BigNumber): BigNumber { const r = new BigNumber(0n); r._setValueFromSigned(this._getSignedValue() - num._getSignedValue()); return r }
  mul (num: BigNumber): BigNumber {
    const r = new BigNumber(0n)
    r._magnitude = this._magnitude * num._magnitude
    r._sign = r._magnitude === 0n ? 0 : ((this._sign ^ num._sign) as 0 | 1)
    r._nominalWordLength = this.length + num.length
    r.red = null
    return r.normSign()
  }

  imul (num: BigNumber): this {
    this._magnitude *= num._magnitude
    this._sign = this._magnitude === 0n ? 0 : ((this._sign ^ num._sign) as 0 | 1)
    this._nominalWordLength = this.length + num.length
    this.red = null
    return this.normSign()
  }

  imuln (num: number): this { this.assert(typeof num === 'number', 'Assertion failed'); this.assert(Math.abs(num) <= BigNumber.MAX_IMULN_ARG, 'Assertion failed'); this._setValueFromSigned(this._getSignedValue() * BigInt(num)); return this }
  muln (num: number): BigNumber { return this.clone().imuln(num) }
  sqr (): BigNumber {
    const r = new BigNumber(0n)
    r._magnitude = this._magnitude * this._magnitude
    r._sign = 0
    r._nominalWordLength = this.length * 2
    r.red = null
    return r
  }

  isqr (): this {
    this._magnitude *= this._magnitude
    this._sign = 0
    this._nominalWordLength = this.length * 2
    this.red = null
    return this
  }

  pow (num: BigNumber): BigNumber {
    this.assert(num._sign === 0, 'Exponent for pow must be non-negative')
    if (num.isZero()) return new BigNumber(1n)

    const res = new BigNumber(1n)
    const currentBase = this.clone()
    const exp = num.clone()

    const baseIsNegative = currentBase.isNeg()
    const expIsOdd = exp.isOdd()
    if (baseIsNegative) currentBase.ineg()

    while (!exp.isZero()) {
      if (exp.isOdd()) {
        res.imul(currentBase)
      }
      currentBase.isqr()
      exp.iushrn(1)
    }

    if (baseIsNegative && expIsOdd) {
      res.ineg()
    }
    return res
  }

  iushln (bits: number): this { this.assert(typeof bits === 'number' && bits >= 0); if (bits === 0) return this; this._magnitude <<= BigInt(bits); this._finishInitialization(); return this.strip() }
  ishln (bits: number): this { this.assert(this._sign === 0, 'ishln requires positive number'); return this.iushln(bits) }
  iushrn (bits: number, hint?: number, extended?: BigNumber): this { this.assert(typeof bits === 'number' && bits >= 0); if (bits === 0) { if (extended != null)extended._initializeState(0n, 0); return this } if (extended != null) { const m = (1n << BigInt(bits)) - 1n; const sOut = this._magnitude & m; extended._initializeState(sOut, 0) } this._magnitude >>= BigInt(bits); this._finishInitialization(); return this.strip() }
  ishrn (bits: number, hint?: number, extended?: BigNumber): this { this.assert(this._sign === 0, 'ishrn requires positive number'); return this.iushrn(bits, hint, extended) }
  shln (bits: number): BigNumber { return this.clone().ishln(bits) } ushln (bits: number): BigNumber { return this.clone().iushln(bits) } shrn (bits: number): BigNumber { return this.clone().ishrn(bits) } ushrn (bits: number): BigNumber { return this.clone().iushrn(bits) }
  testn (bit: number): boolean {
    this.assert(typeof bit === 'number' && bit >= 0)
    return ((this._magnitude >> BigInt(bit)) & 1n) !== 0n
  }

  imaskn (bits: number): this { this.assert(typeof bits === 'number' && bits >= 0); this.assert(this._sign === 0, 'imaskn works only with positive numbers'); const Bb = BigInt(bits); const m = Bb === 0n ? 0n : (1n << Bb) - 1n; this._magnitude &= m; const wfm = bits === 0 ? 1 : Math.max(1, Math.ceil(bits / BigNumber.wordSize)); this._nominalWordLength = wfm; this._finishInitialization(); this._nominalWordLength = Math.max(this._nominalWordLength, wfm); return this.strip() }

  maskn (bits: number): BigNumber { return this.clone().imaskn(bits) }
  iaddn (num: number): this { this.assert(typeof num === 'number'); this.assert(Math.abs(num) <= BigNumber.MAX_IMULN_ARG, 'num is too large'); this._setValueFromSigned(this._getSignedValue() + BigInt(num)); return this }
  _iaddn (num: number): this { return this.iaddn(num) }
  isubn (num: number): this { this.assert(typeof num === 'number'); this.assert(Math.abs(num) <= BigNumber.MAX_IMULN_ARG, 'Assertion failed'); this._setValueFromSigned(this._getSignedValue() - BigInt(num)); return this }
  addn (num: number): BigNumber { return this.clone().iaddn(num) } subn (num: number): BigNumber { return this.clone().isubn(num) }
  iabs (): this { this._sign = 0; return this } abs (): BigNumber { return this.clone().iabs() }

  divmod (num: BigNumber, mode?: 'div' | 'mod', positive?: boolean): any {
    this.assert(!num.isZero(), 'Division by zero')
    if (this.isZero()) {
      const z = new BigNumber(0n)
      return { div: mode !== 'mod' ? z : null, mod: mode !== 'div' ? z : null }
    }
    const tV = this._getSignedValue()
    const nV = num._getSignedValue()
    let dV: bigint | null = null
    let mV: bigint | null = null
    if (mode !== 'mod') dV = tV / nV
    if (mode !== 'div') {
      mV = tV % nV
      if (positive === true && mV < 0n) mV += nV < 0n ? -nV : nV
    }
    const rd = dV !== null ? new BigNumber(0n) : null
    if (rd !== null && dV !== null) rd._setValueFromSigned(dV)
    const rm = mV !== null ? new BigNumber(0n) : null
    if (rm !== null && mV !== null) rm._setValueFromSigned(mV)
    return { div: rd, mod: rm }
  }

  div (num: BigNumber): BigNumber {
    return this.divmod(num, 'div', false).div as BigNumber
  }

  mod (num: BigNumber): BigNumber {
    return this.divmod(num, 'mod', false).mod as BigNumber
  }

  umod (num: BigNumber): BigNumber {
    return this.divmod(num, 'mod', true).mod as BigNumber
  }

  divRound (num: BigNumber): BigNumber {
    this.assert(!num.isZero())
    const tV = this._getSignedValue()
    const nV = num._getSignedValue()

    let d = tV / nV
    const m = tV % nV

    if (m === 0n) {
      const r = new BigNumber(0n); r._setValueFromSigned(d); return r
    }

    const absM = m < 0n ? -m : m
    const absNV = nV < 0n ? -nV : nV

    if (absM * 2n >= absNV) {
      if ((tV > 0n && nV > 0n) || (tV < 0n && nV < 0n)) {
        d += 1n
      } else {
        d -= 1n
      }
    }
    const r = new BigNumber(0n); r._setValueFromSigned(d); return r
  }

  modrn (numArg: number): number {
    this.assert(numArg !== 0, 'Division by zero in modrn')
    const absDivisor = BigInt(Math.abs(numArg))
    if (absDivisor === 0n) throw new Error('Division by zero in modrn')

    const remainderMag = this._magnitude % absDivisor
    return numArg < 0 ? Number(-remainderMag) : Number(remainderMag)
  }

  idivn (num: number): this { this.assert(num !== 0); this.assert(Math.abs(num) <= BigNumber.MAX_IMULN_ARG, 'num is too large'); this._setValueFromSigned(this._getSignedValue() / BigInt(num)); return this }
  divn (num: number): BigNumber { return this.clone().idivn(num) }

  egcd (p: BigNumber): { a: BigNumber, b: BigNumber, gcd: BigNumber } { this.assert(p._sign === 0, 'p must not be negative'); this.assert(!p.isZero(), 'p must not be zero'); let uV = this._getSignedValue(); let vV = p._magnitude; let a = 1n; let pa = 0n; let b = 0n; let pb = 1n; while (vV !== 0n) { const q = uV / vV; let t = vV; vV = uV % vV; uV = t; t = pa; pa = a - q * pa; a = t; t = pb; pb = b - q * pb; b = t } const ra = new BigNumber(0n); ra._setValueFromSigned(a); const rb = new BigNumber(0n); rb._setValueFromSigned(b); const rg = new BigNumber(0n); rg._initializeState(uV < 0n ? -uV : uV, 0); return { a: ra, b: rb, gcd: rg } }
  gcd (num: BigNumber): BigNumber { let u = this._magnitude; let v = num._magnitude; if (u === 0n) { const r = new BigNumber(0n); r._setValueFromSigned(v); return r.iabs() } if (v === 0n) { const r = new BigNumber(0n); r._setValueFromSigned(u); return r.iabs() } while (v !== 0n) { const t = u % v; u = v; v = t } const res = new BigNumber(0n); res._initializeState(u, 0); return res }

  invm (num: BigNumber): BigNumber {
    this.assert(!num.isZero() && num._sign === 0, 'Modulus for invm must be positive and non-zero')
    const eg = this.egcd(num)
    if (!eg.gcd.eqn(1)) {
      throw new Error('Inverse does not exist (numbers are not coprime).')
    }
    return eg.a.umod(num)
  }

  isEven (): boolean { return this._magnitude % 2n === 0n } isOdd (): boolean { return this._magnitude % 2n === 1n }
  andln (num: number): number { this.assert(num >= 0); return Number(this._magnitude & BigInt(num)) }
  bincn (bit: number): this { this.assert(typeof bit === 'number' && bit >= 0); const BVal = 1n << BigInt(bit); this._setValueFromSigned(this._getSignedValue() + BVal); return this }
  isZero (): boolean { return this._magnitude === 0n }
  cmpn (num: number): 1 | 0 | -1 { this.assert(Math.abs(num) <= BigNumber.MAX_IMULN_ARG, 'Number is too big'); const tV = this._getSignedValue(); const nV = BigInt(num); if (tV < nV) return -1; if (tV > nV) return 1; return 0 }
  cmp (num: BigNumber): 1 | 0 | -1 { const tV = this._getSignedValue(); const nV = num._getSignedValue(); if (tV < nV) return -1; if (tV > nV) return 1; return 0 }
  ucmp (num: BigNumber): 1 | 0 | -1 { if (this._magnitude < num._magnitude) return -1; if (this._magnitude > num._magnitude) return 1; return 0 }
  gtn (num: number): boolean { return this.cmpn(num) === 1 } gt (num: BigNumber): boolean { return this.cmp(num) === 1 } gten (num: number): boolean { return this.cmpn(num) >= 0 } gte (num: BigNumber): boolean { return this.cmp(num) >= 0 }
  ltn (num: number): boolean { return this.cmpn(num) === -1 } lt (num: BigNumber): boolean { return this.cmp(num) === -1 } lten (num: number): boolean { return this.cmpn(num) <= 0 } lte (num: BigNumber): boolean { return this.cmp(num) <= 0 }
  eqn (num: number): boolean { return this.cmpn(num) === 0 } eq (num: BigNumber): boolean { return this.cmp(num) === 0 }

  toRed (ctx: ReductionContext): BigNumber { this.assert(this.red == null, 'Already a number in reduction context'); this.assert(this._sign === 0, 'toRed works only with positives'); return ctx.convertTo(this).forceRed(ctx) }
  fromRed (): BigNumber { this.assert(this.red, 'fromRed works only with numbers in reduction context'); return this.red.convertFrom(this) }
  forceRed (ctx: ReductionContext): this { this.red = ctx; return this }
  redAdd (num: BigNumber): BigNumber { this.assert(this.red, 'redAdd works only with red numbers'); return this.red.add(this, num) }
  redIAdd (num: BigNumber): BigNumber { this.assert(this.red, 'redIAdd works only with red numbers'); return this.red.iadd(this, num) }
  redSub (num: BigNumber): BigNumber { this.assert(this.red, 'redSub works only with red numbers'); return this.red.sub(this, num) }
  redISub (num: BigNumber): BigNumber { this.assert(this.red, 'redISub works only with red numbers'); return this.red.isub(this, num) }
  redShl (num: number): BigNumber { this.assert(this.red, 'redShl works only with red numbers'); return this.red.shl(this, num) }
  redMul (num: BigNumber): BigNumber { this.assert(this.red, 'redMul works only with red numbers'); this.red.verify2(this, num); return this.red.mul(this, num) }
  redIMul (num: BigNumber): BigNumber { this.assert(this.red, 'redIMul works only with red numbers'); this.red.verify2(this, num); return this.red.imul(this, num) }
  redSqr (): BigNumber { this.assert(this.red, 'redSqr works only with red numbers'); this.red.verify1(this); return this.red.sqr(this) }
  redISqr (): BigNumber { this.assert(this.red, 'redISqr works only with red numbers'); this.red.verify1(this); return this.red.isqr(this) }
  redSqrt (): BigNumber { this.assert(this.red, 'redSqrt works only with red numbers'); this.red.verify1(this); return this.red.sqrt(this) }
  redInvm (): BigNumber { this.assert(this.red, 'redInvm works only with red numbers'); this.red.verify1(this); return this.red.invm(this) }
  redNeg (): BigNumber { this.assert(this.red, 'redNeg works only with red numbers'); this.red.verify1(this); return this.red.neg(this) }
  redPow (num: BigNumber): BigNumber { this.assert(this.red != null && num.red == null, 'redPow(normalNum)'); this.red.verify1(this); return this.red.pow(this, num) }

  static fromHex (hex: string, endian?: 'le' | 'be' | 'little' | 'big'): BigNumber { let eE: 'le' | 'be' = 'be'; if (endian === 'little' || endian === 'le')eE = 'le'; return new BigNumber(hex, 16, eE) }

  toHex (byteLength: number = 0): string {
    if (this.isZero() && byteLength === 0) return ''

    let hexStr = this._getMinimalHex() // Raw hex: "0", "f", "10", "123"

    // Ensure even length for non-zero values (byte alignment)
    if (hexStr !== '0' && hexStr.length % 2 !== 0) {
      hexStr = '0' + hexStr
    }

    // Pad to minimum character length (byteLength * 2)
    const minChars = byteLength * 2
    while (hexStr.length < minChars) {
      hexStr = '0' + hexStr
    }
    return (this.isNeg() ? '-' : '') + hexStr
  }

  static fromJSON (str: string): BigNumber { return new BigNumber(str, 16) }
  static fromNumber (n: number): BigNumber { return new BigNumber(n) }
  static fromString (str: string, base?: number | 'hex'): BigNumber { return new BigNumber(str, base) }

  static fromSm (bytes: number[], endian: 'big' | 'little' = 'big'): BigNumber {
    if (bytes.length === 0) return new BigNumber(0n)

    let sign: 0 | 1 = 0
    let mag = 0n

    if (endian === 'little') {
      let i = bytes.length - 1
      let byte = bytes[i]
      if ((byte & 0x80) !== 0) { sign = 1; byte &= 0x7f }
      mag = BigInt(byte)
      for (i = i - 1; i >= 0; i--) mag = (mag << 8n) | BigInt(bytes[i])
    } else {
      let byte = bytes[0]
      if ((byte & 0x80) !== 0) { sign = 1; byte &= 0x7f }
      mag = BigInt(byte)
      for (let i = 1; i < bytes.length; i++) mag = (mag << 8n) | BigInt(bytes[i])
    }

    const r = new BigNumber(0n)
    r._initializeState(mag, sign)
    return r
  }

  toSm (endian: 'big' | 'little' = 'big'): number[] {
    if (this._magnitude === 0n) {
      return this._sign === 1 ? [0x80] : []
    }

    const byteLen = this.byteLength()
    const beBytes = new Array(byteLen)
    let temp = this._magnitude
    for (let i = byteLen - 1; i >= 0; i--) {
      beBytes[i] = Number(temp & 0xffn)
      temp >>= 8n
    }

    if (this._sign === 1) {
      if ((beBytes[0] & 0x80) !== 0) beBytes.unshift(0x80)
      else beBytes[0] |= 0x80
    } else if ((beBytes[0] & 0x80) !== 0) {
      beBytes.unshift(0x00)
    }

    return endian === 'little' ? beBytes.slice().reverse() : beBytes
  }

  static fromBits (bits: number, strict: boolean = false): BigNumber {
    const nSize = bits >>> 24
    const nWordCompact = bits & 0x007fffff
    const isNegativeFromBit = (bits & 0x00800000) !== 0

    if (strict && isNegativeFromBit) {
      throw new Error('negative bit set')
    }

    if (nSize === 0 && nWordCompact === 0) {
      if (isNegativeFromBit && strict) throw new Error('negative bit set for zero value')
      return new BigNumber(0n)
    }

    const bn = new BigNumber(nWordCompact)

    // This logic comes from original bn.js `fromCompact`
    if (nSize <= 3) {
      bn.iushrn((3 - nSize) * 8)
    } else {
      bn.iushln((nSize - 3) * 8)
    }

    if (isNegativeFromBit) {
      bn.ineg()
    }
    return bn
  }

  toBits (): number {
    this.strip()
    if (this.isZero() && !this.isNeg()) return 0

    const isActualNegative = this.isNeg()
    const bnAbs = this.abs() // Work with absolute value for magnitude

    // Get byte array of absolute value
    let mB = bnAbs.toArray('be') // Minimal byte array

    // Remove leading zeros from byte array, if any (toArray('be') might already do this if no length specified)
    let firstNonZeroIdx = 0
    while (firstNonZeroIdx < mB.length - 1 && mB[firstNonZeroIdx] === 0) { // Keep last byte if it's [0]
      firstNonZeroIdx++
    }
    mB = mB.slice(firstNonZeroIdx)

    let nSize = mB.length
    if (nSize === 0 && !bnAbs.isZero()) { // Should not happen if bnAbs is truly non-zero and toArray is correct
      mB = [0] // Should not be needed if toArray works for small numbers
      nSize = 1
    }
    if (bnAbs.isZero()) { // if original was, e.g., -0, bnAbs is 0.
      nSize = 0 // Size for 0 is 0, unless it's negative 0 to be encoded
      mB = []
    }

    let nWordNum
    if (nSize === 0) {
      nWordNum = 0
    } else if (nSize <= 3) {
      nWordNum = 0
      for (let i = 0; i < nSize; i++) {
        nWordNum = (nWordNum << 8) | mB[i]
      }
    } else { // nSize > 3
      nWordNum = (mB[0] << 16) | (mB[1] << 8) | mB[2]
    }

    if ((nWordNum & 0x00800000) !== 0 && nSize <= 0xff) { // MSB of 3-byte mantissa is set
      nWordNum >>>= 8 // Shift mantissa over by one byte
      nSize++ // Increase size component by one
    }

    let b = (nSize << 24) | nWordNum
    if (isActualNegative) b |= 0x00800000
    return b >>> 0
  }

  static fromScriptNum (num: number[], requireMinimal: boolean = false, maxNumSize?: number): BigNumber {
    if (maxNumSize !== undefined && num.length > maxNumSize) throw new Error('script number overflow')
    if (num.length === 0) return new BigNumber(0n)
    if (requireMinimal) {
      if ((num[num.length - 1] & 0x7f) === 0) {
        if (num.length <= 1 || (num[num.length - 2] & 0x80) === 0) {
          throw new Error('non-minimally encoded script number')
        }
      }
    }
    return BigNumber.fromSm(num, 'little')
  }

  toScriptNum (): number[] { return this.toSm('little') }

  _invmp (p: BigNumber): BigNumber {
    this.assert(p._sign === 0, 'p must not be negative for _invmp')
    this.assert(!p.isZero(), 'p must not be zero for _invmp')

    const aBN: BigNumber = this.umod(p)

    let aVal = aBN._magnitude
    let bVal = p._magnitude
    let x1Val = 1n
    let x2Val = 0n
    const modulus = p._magnitude

    while (aVal > 1n && bVal > 1n) {
      let i = 0; while (((aVal >> BigInt(i)) & 1n) === 0n) i++
      if (i > 0) {
        aVal >>= BigInt(i)
        for (let k = 0; k < i; ++k) { if ((x1Val & 1n) !== 0n) x1Val += modulus; x1Val >>= 1n }
      }

      let j = 0; while (((bVal >> BigInt(j)) & 1n) === 0n) j++
      if (j > 0) {
        bVal >>= BigInt(j)
        for (let k = 0; k < j; ++k) { if ((x2Val & 1n) !== 0n) x2Val += modulus; x2Val >>= 1n }
      }

      if (aVal >= bVal) { aVal -= bVal; x1Val -= x2Val } else { bVal -= aVal; x2Val -= x1Val }
    }

    let resultVal: bigint
    if (aVal === 1n) resultVal = x1Val
    else if (bVal === 1n) resultVal = x2Val
    else if (aVal === 0n && bVal === 1n) resultVal = x2Val
    else if (bVal === 0n && aVal === 1n) resultVal = x1Val
    else throw new Error('_invmp: GCD is not 1, inverse does not exist. aVal=' + aVal + ', bVal=' + bVal)

    resultVal %= modulus
    if (resultVal < 0n) resultVal += modulus

    const resultBN = new BigNumber(0n)
    resultBN._initializeState(resultVal, 0)
    return resultBN
  }

  mulTo (num: BigNumber, out: BigNumber): BigNumber {
    out._magnitude = this._magnitude * num._magnitude
    out._sign = out._magnitude === 0n ? 0 : ((this._sign ^ num._sign) as 0 | 1)
    out._nominalWordLength = this.length + num.length
    out.red = null
    out.normSign()
    return out
  }
}
