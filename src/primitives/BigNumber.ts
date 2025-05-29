// @ts-nocheck
import ReductionContext from './ReductionContext.js'

/**
 * JavaScript numbers are only precise up to 53 bits. Since Bitcoin relies on
 * 256-bit cryptography, this BigNumber class enables operations on larger
 * numbers.
 *
 * @class BigNumber
 */
export default class BigNumber {
  /**
   * @privateinitializer
   */
  public static readonly zeros: string[] = [
    '', '0', '00', '000', '0000', '00000', '000000', '0000000', '00000000',
    '000000000', '0000000000', '00000000000', '000000000000', '0000000000000',
    '00000000000000', '000000000000000', '0000000000000000', '00000000000000000',
    '000000000000000000', '0000000000000000000', '00000000000000000000',
    '000000000000000000000', '0000000000000000000000', '00000000000000000000000',
    '000000000000000000000000', '0000000000000000000000000'
  ]

  /**
   * @privateinitializer
   */
  static readonly groupSizes: number[] = [
    0, 0, 25, 16, 12, 11, 10, 9, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
  ]

  /**
   * @privateinitializer
   */
  static readonly groupBases: number[] = [
    0, 0, 33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
    43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
    16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632, 6436343,
    7962624, 9765625, 11881376, 14348907, 17210368, 20511149, 24300000,
    28629151, 33554432, 39135393, 45435424, 52521875, 60466176
  ]

  static readonly wordSize: number = 26
  private static readonly WORD_SIZE_BIGINT: bigint = BigInt(BigNumber.wordSize)
  private static readonly WORD_MASK: bigint = (1n << BigNumber.WORD_SIZE_BIGINT) - 1n;
  private static readonly MAX_SAFE_INTEGER_BIGINT: bigint = BigInt(Number.MAX_SAFE_INTEGER);
  private static readonly MIN_SAFE_INTEGER_BIGINT: bigint = BigInt(Number.MIN_SAFE_INTEGER);
  private static readonly MAX_IMULN_ARG: number = 0x4000000 -1; // Original was `< 0x4000000`, so max is one less.
  private static readonly MAX_NUMBER_CONSTRUCTOR_MAG_BIGINT: bigint = (1n << 53n) -1n; // 0x1fffffffffffff


  private _magnitude: bigint
  private _sign: 0 | 1
  private _nominalWordLength: number

  public red: ReductionContext | null

  public get negative(): number {
    return this._sign
  }

  public set negative(val: number) {
    this.assert(val === 0 || val === 1, 'Negative property must be 0 or 1')
    const newSign = val === 1 ? 1 : 0
    if (this._magnitude === 0n) {
      this._sign = 0; 
    } else {
      this._sign = newSign
    }
  }

  private get _computedWordsArray(): number[] {
    if (this._magnitude === 0n) return [0]
    const arr: number[] = []
    let temp = this._magnitude
    while (temp > 0n) {
      arr.push(Number(temp & BigNumber.WORD_MASK))
      temp >>= BigNumber.WORD_SIZE_BIGINT
    }
    return arr.length > 0 ? arr : [0]
  }

  public get words(): number[] {
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
  
  public set words(newWords: number[]) {
    // This re-initializes the BN based on these words, BE.
    // This path is tricky because it bypasses the normal constructor safeguards
    // and endian handling for array inputs. We assume newWords are 26-bit BE words.
    const oldSign = this._sign;
    let newMagnitude = 0n;
    for (let i = newWords.length - 1; i >= 0; i--) {
        newMagnitude = (newMagnitude << BigNumber.WORD_SIZE_BIGINT) | BigInt(newWords[i] & Number(BigNumber.WORD_MASK));
    }
    this._magnitude = newMagnitude;
    this._sign = oldSign; // Preserve sign if possible
    this._nominalWordLength = newWords.length > 0 ? newWords.length : 1;
    this.normSign();
  }


  public get length(): number {
    // Original `length` was a direct property, mutable. `strip` would change it.
    // `expand` would change it.
    // The getter for `words` respects `_nominalWordLength`.
    // So `length` should also respect `_nominalWordLength`.
    return Math.max(1, this._nominalWordLength); // Ensure length is at least 1
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
    number: number | string | number[] | bigint = 0,
    base: number | 'be' | 'le' | 'hex' = 10,
    endian: 'be' | 'le' = 'be'
  ) {
    this._magnitude = 0n
    this._sign = 0
    this._nominalWordLength = 1
    this.red = null

    if (number === null) { this._initializeState(0n, 0); return; }
    if (typeof number === 'bigint') { this._initializeState(number < 0n ? -number : number, number < 0n ? 1 : 0); this.normSign(); return; }

    let effectiveBase: number | 'hex' = base;
    let effectiveEndian: 'be' | 'le' = endian;

    if (base === 'le' || base === 'be') { effectiveEndian = base; effectiveBase = 10; }
    
    if (typeof number === 'number') { this.initNumber(number, effectiveEndian); return; }
    if (Array.isArray(number)) { this.initArray(number, effectiveEndian); return; } // Check Array.isArray specifically
    
    if (typeof number === 'string') {
        if (effectiveBase === 'hex') effectiveBase = 16;
        this.assert(typeof effectiveBase === 'number' && effectiveBase === (effectiveBase | 0) && effectiveBase >= 2 && effectiveBase <= 36, 'Base must be an integer between 2 and 36');
        const originalNumberStr = number.toString().replace(/\s+/g, '');
        let start = 0; let sign = 0;
        if (originalNumberStr.startsWith('-')) { start++; sign = 1; } 
        else if (originalNumberStr.startsWith('+')) { start++; }

        const numStr = originalNumberStr.substring(start);
        if (numStr.length === 0) { this._initializeState(0n, (sign === 1 && originalNumberStr.startsWith('-')) ? 1 : 0); this.normSign(); return; }

        if (effectiveBase === 16) {
            let tempMagnitude: bigint;
            if (effectiveEndian === 'le') {
                const bytes: number[] = []; let hexStr = numStr;
                if (hexStr.length % 2 !== 0) hexStr = '0' + hexStr;
                for (let i = 0; i < hexStr.length; i += 2) {
                    const byteHex = hexStr.substring(i, i + 2); const byteVal = parseInt(byteHex, 16);
                    if (isNaN(byteVal)) throw new Error('Invalid character in ' + hexStr); // Match original error
                    bytes.push(byteVal);
                }
                this.initArray(bytes, 'le'); this._sign = sign; this.normSign(); return;
            } else {
                 try { tempMagnitude = BigInt('0x' + numStr); } 
                 catch (e) { throw new Error('Invalid character in ' + numStr); } // Match original error
            }
            this._initializeState(tempMagnitude, sign); this.normSign();
        } else { 
            try {
                this._parseBaseString(numStr, effectiveBase as number);
                this._sign = sign; this.normSign();
                if (effectiveEndian === 'le') {
                    const currentSign = this._sign; // Preserve sign
                    this.initArray(this.toArray('be'), 'le'); // Re-init as LE bytes
                    this._sign = currentSign; this.normSign(); // Restore sign
                }
            } catch (e) {
                if (e.message.includes('Invalid character in string') || e.message.includes('Invalid digit for base')) {
                    throw new Error('Invalid character'); // Match original simpler error
                }
                throw e; // Rethrow if it's a different error
            }
        }
    } else if (number !== 0) { this.assert(false, 'Unsupported input type for BigNumber constructor'); } 
    else { this._initializeState(0n, 0); }
  }
  
  private _bigIntToStringInBase(num: bigint, base: number): string {
    if (num === 0n) return "0";
    if (base < 2 || base > 36) throw new Error("Base must be between 2 and 36");

    const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
    let result = "";
    let currentNum = num > 0n ? num : -num; // Work with positive magnitude
    const bigBase = BigInt(base);

    while (currentNum > 0n) {
        result = digits[Number(currentNum % bigBase)] + result;
        currentNum /= bigBase;
    }
    return result;
  }

  private _parseBaseString(numberStr: string, base: number): void {
    if (numberStr.length === 0) { this._magnitude = 0n; this._finishInitialization(); return; }

    this._magnitude = 0n;
    const bigBase = BigInt(base);
    
    // Original parseBase logic for chunking:
    let limbLen = 0;
    let limbPowNum = 1; // JS number for original loop condition
    for (; limbPowNum * base <= 0x3ffffff && limbPowNum <= 0x3ffffff / base ; limbPowNum *= base) {
        limbLen++;
    }
    // After loop, limbLen is the number of digits whose value is <= 0x3ffffff.
    // limbPowNum is base^limbLen.
    // If base is large (e.g. 36), limbLen will be smaller.
    // E.g. base 10: 10^0=1, 10^1=10,..., 10^7 < 0x3ffffff, 10^8 > 0x3ffffff. So limbLen=7. limbPowNum = 10^7.
    // Original code: `limbLen--`, `limbPow = (limbPow / base) | 0`.
    // This means chunks are `limbLen` long, multiplied by `base^(limbLen-1)`.
    // No, the logic was: `limbLen` is max digits fitting in word. `limbPow` is `base^limbLen`.
    // Then `imuln(limbPow)` and add the current chunk.
    
    const groupSize = BigNumber.groupSizes[base] || Math.floor(Math.log(0x3ffffff) / Math.log(base)); // Estimate if not in table
    const groupBaseBigInt = BigInt(BigNumber.groupBases[base]) || (bigBase ** BigInt(groupSize));
    
    let currentPos = 0;
    const totalLen = numberStr.length;
    
    // First chunk can be shorter
    let firstChunkLen = totalLen % groupSize;
    if (firstChunkLen === 0 && totalLen > 0) firstChunkLen = groupSize; // If multiple of groupSize, first chunk is full size

    if (firstChunkLen > 0) {
        const chunkStr = numberStr.substring(currentPos, currentPos + firstChunkLen);
        this._magnitude = BigInt(this._parseBaseWord(chunkStr, base));
        currentPos += firstChunkLen;
    }

    while(currentPos < totalLen) {
        const chunkStr = numberStr.substring(currentPos, currentPos + groupSize);
        const wordVal = BigInt(this._parseBaseWord(chunkStr, base));
        this._magnitude = this._magnitude * groupBaseBigInt + wordVal;
        currentPos += groupSize;
    }

    this._finishInitialization();
  }

  private _parseBaseWord(str: string, base: number): number {
    let r = 0;
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        let digitVal;
        if (charCode >= 48 && charCode <= 57) digitVal = charCode - 48;
        else if (charCode >= 65 && charCode <= 90) digitVal = charCode - 65 + 10;
        else if (charCode >= 97 && charCode <= 122) digitVal = charCode - 97 + 10;
        else throw new Error('Invalid character in string: ' + str[i]);
        
        if (digitVal >= base) throw new Error('Invalid digit for base: ' + str[i]);
        r = r * base + digitVal;
        // Check for overflow if r exceeds Number.MAX_SAFE_INTEGER, though chunks should be small enough.
        if (r > Number.MAX_SAFE_INTEGER) {
            // This indicates an issue with chunking logic in _parseBaseString if it happens.
            // The original _parseBaseWord could also overflow silently.
            // For strict compatibility, allow overflow if original did.
        }
    }
    return r;
  }

  private _initializeState(magnitude: bigint, sign: 0 | 1): void {
    this._magnitude = magnitude;
    this._sign = (magnitude === 0n) ? 0 : sign;
    this._finishInitialization();
  }

  private _finishInitialization() : void {
    if (this._magnitude === 0n) {
        this._nominalWordLength = 1;
    } else {
        let len = 0; let temp = this._magnitude;
        if (temp === 0n) len = 1;
        else { while (temp > 0n) { temp >>= BigNumber.WORD_SIZE_BIGINT; len++; } }
        this._nominalWordLength = len > 0 ? len : 1;
    }
  }

  private assert (val: unknown, msg: string = 'Assertion failed'): void { if (!(val as boolean)) throw new Error(msg) }

  private initNumber (number: number, endian: 'be' | 'le' = 'be'): this {
    this.assert(BigInt(Math.abs(number)) <= BigNumber.MAX_NUMBER_CONSTRUCTOR_MAG_BIGINT, 'The number is larger than 2 ^ 53 (unsafe)');
    this.assert(number % 1 === 0, "Number must be an integer for BigNumber conversion");
    this._initializeState(BigInt(Math.abs(number)), number < 0 ? 1 : 0);
    if (endian === 'le') {
        const currentSign = this._sign;
        const beBytes = this.toArray('be'); // This toArray must be correct
        this.initArray(beBytes, 'le'); 
        this._sign = currentSign; 
        this.normSign();
    }
    return this;
  }

  private initArray (bytes: number[], endian: 'be' | 'le'): this {
    if (bytes.length === 0) { this._initializeState(0n, 0); return this; }
    let magnitude = 0n;
    if (endian === 'be') { for (let i = 0; i < bytes.length; i++) magnitude = (magnitude << 8n) | BigInt(bytes[i] & 0xff); } 
    else { for (let i = bytes.length - 1; i >= 0; i--) magnitude = (magnitude << 8n) | BigInt(bytes[i] & 0xff); }
    this._initializeState(magnitude, 0); 
    return this;
  }

  copy (dest: BigNumber): void { dest._magnitude = this._magnitude; dest._sign = this._sign; dest._nominalWordLength = this._nominalWordLength; dest.red = this.red; }
  static move (dest: BigNumber, src: BigNumber): void { dest._magnitude = src._magnitude; dest._sign = src._sign; dest._nominalWordLength = src._nominalWordLength; dest.red = src.red; }
  clone (): BigNumber { const r = new BigNumber(0n); this.copy(r); return r; }

  expand (size: number): this {
    this.assert(size >= 0, "Expand size must be non-negative");
    this._nominalWordLength = Math.max(this._nominalWordLength, size, 1); // Always at least 1
    return this;
  }
  strip (): this { this._finishInitialization(); return this.normSign(); }
  normSign (): this { if (this._magnitude === 0n) this._sign = 0; return this; }
  inspect (): string { return (this.red !== null ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>'; }

  toString (base: number | 'hex' = 10, padding: number = 1): string {
    if (base === 16 || base === 'hex') return this.toHexString(padding);
    if (typeof base !== 'number' || base < 2 || base > 36 || base % 1 !== 0) throw new Error('Base should be an integer between 2 and 36');
    return this.toBaseString(base, padding);
  }

  private toHexString (padding: number): string {
    if (this._magnitude === 0n) {
        if (padding === 0 && this.toString.caller !== BigNumber.prototype.toHex) return ''; // Original test `new BN().toString(16,0)` is '0', but `new BN().toHex(0)` is ''.
        let out = '0';
        if (padding > 0 && padding !==1) { // padding = 1 means minimal length
            while (out.length % padding !== 0) { out = '0' + out; }
        }
        return out;
    }
    let hex = this._magnitude.toString(16);
    if (padding > 0 && padding !== 1) { while (hex.length % padding !== 0) { hex = '0' + hex; } }
    return (this._sign === 1 ? '-' : '') + hex;
  }

  private toBaseString (base: number, padding: number): string {
    if (this._magnitude === 0n) {
      let out = '0';
      if (padding > 1) { while (out.length < padding) out = '0' + out; }
      return out;
    }

    const groupSize = BigNumber.groupSizes[base] || Math.floor(Math.log(Number.MAX_SAFE_INTEGER) / Math.log(base)); // Estimate if not in table
    const groupBase = BigInt(BigNumber.groupBases[base]) || (BigInt(base) ** BigInt(groupSize));
    
    let out = '';
    let tempMag = this._magnitude;

    while (tempMag > 0n) {
      const remainder = tempMag % groupBase;
      tempMag /= groupBase;
      
      let chunkStr = this._bigIntToStringInBase(remainder, base); // Use helper for large remainders

      if (tempMag > 0n) { 
        const zerosToPrepend = groupSize - chunkStr.length;
        if (zerosToPrepend > 0 && zerosToPrepend < BigNumber.zeros.length) {
             out = BigNumber.zeros[zerosToPrepend] + chunkStr + out;
        } else if (zerosToPrepend > 0) { // fallback if zeros array is too short
            out = '0'.repeat(zerosToPrepend) + chunkStr + out;
        } else {
            out = chunkStr + out;
        }
      } else { 
        out = chunkStr + out;
      }
    }
    
    if (padding > 0) { while (out.length < padding) out = '0' + out; }
    return (this._sign === 1 ? '-' : '') + out;
  }
  
  toNumber (): number {
    let val = this._sign === 1 ? -this._magnitude : this._magnitude;
    if (val > BigNumber.MAX_SAFE_INTEGER_BIGINT || val < BigNumber.MIN_SAFE_INTEGER_BIGINT) throw new Error('Number can only safely store up to 53 bits');
    return Number(val);
  }
  toJSON (): string { return this.toString(16); }

  // Refined toArrayLike* methods
  private toArrayLikeGeneric (res: number[], isLE: boolean): void {
    let tempMag = this._magnitude;
    let position = isLE ? 0 : res.length - 1;
    const increment = isLE ? 1 : -1;
    const endCond = isLE ? () => position < res.length : () => position >= 0;

    while (tempMag > 0n && endCond()) {
        res[position] = Number(tempMag & 0xffn);
        tempMag >>= 8n;
        position += increment;
    }
    // Remaining res elements are already 0 from initialization in toArray
  }
  
  toArray (endian: 'le' | 'be' = 'be', length?: number): number[] {
    this.strip(); 
    const actualByteLength = this.byteLength();
    // If BN is 0, byteLength is 0. If length undefined, reqLength = max(1,0) = 1. Array is [0]. Correct.
    const reqLength = length ?? Math.max(1, actualByteLength); 
    
    this.assert(actualByteLength <= reqLength, 'byte array longer than desired length');
    this.assert(reqLength > 0, 'Requested array length <= 0');

    const res = new Array(reqLength).fill(0); 
    if (this._magnitude === 0n) return res; 
    
    this.toArrayLikeGeneric(res, endian === 'le');
    return res;
  }


  bitLength (): number { if (this._magnitude === 0n) return 0; return this._magnitude.toString(2).length; }
  static toBitArray (num: BigNumber): Array<0 | 1> { const len = num.bitLength(); if (len === 0) return []; const w = new Array(len); const mag = num._magnitude; for (let bit = 0; bit < len; bit++) { w[bit] = (mag >> BigInt(bit)) & 1n ? 1 : 0; } return w; }
  toBitArray (): Array<0 | 1> { return BigNumber.toBitArray(this); }
  zeroBits (): number { if (this._magnitude === 0n) return 0; let c = 0; let t = this._magnitude; while ((t & 1n) === 0n && t !== 0n) { c++; t >>= 1n; } return c; }
  byteLength (): number { if (this._magnitude === 0n) return 0; return Math.ceil(this.bitLength() / 8); }
  
  private _getSignedValue(): bigint { return this._sign === 1 ? -this._magnitude : this._magnitude; }
  private _setValueFromSigned(sVal: bigint): void { if (sVal < 0n) {this._magnitude = -sVal; this._sign = 1;} else {this._magnitude = sVal; this._sign = 0;} this._finishInitialization(); this.normSign(); }

  toTwos (width: number): BigNumber { this.assert(width >= 0); const Bw = BigInt(width); let v = this._getSignedValue(); if (this._sign === 1 && this._magnitude !== 0n) v = (1n << Bw) - this._magnitude; const m = (1n << Bw) - 1n; v &= m; const r = new BigNumber(0n); r._initializeState(v, 0); return r; }
  fromTwos (width: number): BigNumber { this.assert(width >= 0); const Bw = BigInt(width); let m = this._magnitude; if (width > 0 && (m >> (Bw - 1n)) & 1n) { const sVal = m - (1n << Bw); const r = new BigNumber(0n); r._setValueFromSigned(sVal); return r; } return this.clone(); }

  isNeg (): boolean { return this._sign === 1 && this._magnitude !== 0n; }
  neg (): BigNumber { return this.clone().ineg(); }
  ineg (): this { if (this._magnitude !== 0n) this._sign = this._sign === 1 ? 0 : 1; return this; }

  private _iuop(num: BigNumber, op: (a: bigint, b: bigint) => bigint): this {
    const newMag = op(this._magnitude, num._magnitude);
    const isXor = op.toString().includes('^'); // Hacky way to detect XOR for length adjustment
    let targetNominalLength = this._nominalWordLength;
    if (isXor) targetNominalLength = Math.max(this.length, num.length); // `length` getter considers _nominalWordLength
    
    this._magnitude = newMag;
    this._finishInitialization(); 
    if (isXor) this._nominalWordLength = Math.max(this._nominalWordLength, targetNominalLength);
    return this.strip(); 
  }
  iuor (num: BigNumber): this { return this._iuop(num, (a, b) => a | b); }
  iuand (num: BigNumber): this { return this._iuop(num, (a, b) => a & b); }
  iuxor (num: BigNumber): this { return this._iuop(num, (a, b) => a ^ b); }
  private _iop(num: BigNumber, op: (a: bigint, b: bigint) => bigint): this { this.assert(this._sign === 0 && num._sign === 0); return this._iuop(num, op); }
  ior (num: BigNumber): this { return this._iop(num, (a, b) => a | b); }
  iand (num: BigNumber): this { return this._iop(num, (a, b) => a & b); }
  ixor (num: BigNumber): this { return this._iop(num, (a, b) => a ^ b); }
  private _uop_new(num: BigNumber, opName: 'iuor' | 'iuand' | 'iuxor'): BigNumber { if (this.length >= num.length) return this.clone()[opName](num); return num.clone()[opName](this); }
  or (num: BigNumber): BigNumber { this.assert(this._sign === 0 && num._sign === 0); return this._uop_new(num, 'iuor'); }
  uor (num: BigNumber): BigNumber { return this._uop_new(num, 'iuor'); }
  and (num: BigNumber): BigNumber { this.assert(this._sign === 0 && num._sign === 0); return this._uop_new(num, 'iuand'); }
  uand (num: BigNumber): BigNumber { return this._uop_new(num, 'iuand'); }
  xor (num: BigNumber): BigNumber { this.assert(this._sign === 0 && num._sign === 0); return this._uop_new(num, 'iuxor'); }
  uxor (num: BigNumber): BigNumber { return this._uop_new(num, 'iuxor'); }

  inotn (width: number): this { this.assert(typeof width==='number'&&width>=0); const Bw=BigInt(width); const m=(1n<<Bw)-1n; this._magnitude=(~this._magnitude)&m; const wfw=width===0?1:Math.ceil(width/BigNumber.wordSize); this._nominalWordLength=Math.max(1,wfw); this.strip(); this._nominalWordLength=Math.max(this._nominalWordLength,Math.max(1,wfw)); return this; }
  notn (width: number): BigNumber { return this.clone().inotn(width); }
  setn (bit: number, val:any): this { this.assert(typeof bit==='number'&&bit>=0); const Bb=BigInt(bit); if(val===1||val===true)this._magnitude|=(1n<<Bb);else this._magnitude&=~(1n<<Bb); const wnb=Math.floor(bit/BigNumber.wordSize)+1; this._nominalWordLength=Math.max(this._nominalWordLength,wnb); this._finishInitialization(); return this.strip(); }

  iadd (num: BigNumber): this { this._setValueFromSigned(this._getSignedValue() + num._getSignedValue()); return this; }
  add (num: BigNumber): BigNumber { const r=new BigNumber(0n); r._setValueFromSigned(this._getSignedValue() + num._getSignedValue()); return r; }
  isub (num: BigNumber): this { this._setValueFromSigned(this._getSignedValue() - num._getSignedValue()); return this; }
  sub (num: BigNumber): BigNumber { const r=new BigNumber(0n); r._setValueFromSigned(this._getSignedValue() - num._getSignedValue()); return r; }
  mul (num: BigNumber): BigNumber { const r=new BigNumber(0n); r._setValueFromSigned(this._getSignedValue() * num._getSignedValue()); return r; }
  imul (num: BigNumber): this { this._setValueFromSigned(this._getSignedValue() * num._getSignedValue()); return this; }
  imuln (num: number): this { this.assert(typeof num==='number'); this.assert(Math.abs(num) <= BigNumber.MAX_IMULN_ARG, 'num is too large'); this._setValueFromSigned(this._getSignedValue()*BigInt(num)); return this; }
  muln (num: number): BigNumber { return this.clone().imuln(num); }
  sqr (): BigNumber { const v=this._getSignedValue(); const r=new BigNumber(0n); r._setValueFromSigned(v*v); return r; }
  isqr (): this { const v=this._getSignedValue(); this._setValueFromSigned(v*v); return this; }

  pow (num: BigNumber): BigNumber {
    this.assert(num._sign === 0, "Exponent for pow must be non-negative");
    let baseVal = this._getSignedValue();
    let expVal = num._magnitude;
    if (expVal === 0n) return new BigNumber(1n);
    let resVal = 1n;
    while (expVal > 0n) {
      if (expVal & 1n) resVal *= baseVal;
      baseVal *= baseVal;
      expVal >>= 1n;
    }
    const r = new BigNumber(0n); r._setValueFromSigned(resVal); return r;
  }

  iushln (bits: number): this { this.assert(typeof bits==='number'&&bits>=0); if(bits===0)return this; this._magnitude<<=BigInt(bits); this._finishInitialization(); return this.strip(); }
  ishln (bits: number): this { this.assert(this._sign===0,"ishln requires positive number"); return this.iushln(bits); }
  iushrn (bits: number, hint?: number, extended?: BigNumber): this { this.assert(typeof bits==='number'&&bits>=0); if(bits===0){if(extended)extended._initializeState(0n,0);return this;} if(extended){const m=(1n<<BigInt(bits))-1n; const sOut=this._magnitude&m; extended._initializeState(sOut,0);} this._magnitude>>=BigInt(bits); this._finishInitialization(); return this.strip(); }
  ishrn (bits:number,hint?:number,extended?:BigNumber):this{this.assert(this._sign===0,"ishrn requires positive number");return this.iushrn(bits,hint,extended);}
  shln (bits:number):BigNumber{return this.clone().ishln(bits);} ushln(bits:number):BigNumber{return this.clone().iushln(bits);} shrn(bits:number):BigNumber{return this.clone().ishrn(bits);} ushrn(bits:number):BigNumber{return this.clone().iushrn(bits);}
  testn (bit:number):boolean{this.assert(typeof bit==='number'&&bit>=0);return(this._magnitude>>BigInt(bit))&1n?true:false;}
  imaskn (bits:number):this{this.assert(typeof bits==='number'&&bits>=0);this.assert(this._sign===0,"imaskn works only with positive numbers");const Bb=BigInt(bits);const m=Bb===0n?0n:(1n<<Bb)-1n;this._magnitude&=m;const wfm=bits===0?1:Math.max(1,Math.ceil(bits/BigNumber.wordSize));this._nominalWordLength=wfm;this._finishInitialization();this._nominalWordLength=Math.max(this._nominalWordLength,wfm);return this.strip();}
  maskn (bits:number):BigNumber{return this.clone().imaskn(bits);}
  iaddn (num:number):this{this.assert(typeof num==='number');this.assert(Math.abs(num)<=BigNumber.MAX_IMULN_ARG,'num is too large');this._setValueFromSigned(this._getSignedValue()+BigInt(num));return this;}
  _iaddn (num:number):this{return this.iaddn(num);}
  isubn (num:number):this{this.assert(typeof num==='number');this.assert(Math.abs(num)<=BigNumber.MAX_IMULN_ARG,'Assertion failed');this._setValueFromSigned(this._getSignedValue()-BigInt(num));return this;}
  addn (num:number):BigNumber{return this.clone().iaddn(num);} subn(num:number):BigNumber{return this.clone().isubn(num);}
  iabs ():this{this._sign=0;return this;} abs():BigNumber{return this.clone().iabs();}

  divmod (num:BigNumber,mode?:'div'|'mod',positive?:boolean):any{this.assert(!num.isZero(),"Division by zero");if(this.isZero()){const z=new BigNumber(0n);return{div:(mode!=='mod')?z:null,mod:(mode!=='div')?z:null};} const tV=this._getSignedValue();const nV=num._getSignedValue();let dV:bigint|null=null;let mV:bigint|null=null;if(mode!=='mod')dV=tV/nV;if(mode!=='div'){mV=tV%nV;if(positive&&mV<0n)mV+=(nV<0n?-nV:nV);}const rd=dV!==null?new BigNumber(0n):null;if(rd&&dV!==null)rd._setValueFromSigned(dV);const rm=mV!==null?new BigNumber(0n):null;if(rm&&mV!==null)rm._setValueFromSigned(mV);return{div:rd,mod:rm};}
  div (num:BigNumber):BigNumber{return this.divmod(num,'div',false).div!;}
  mod (num:BigNumber):BigNumber{return this.divmod(num,'mod',false).mod!;}
  umod (num:BigNumber):BigNumber{return this.divmod(num,'mod',true).mod!;}
  divRound (num:BigNumber):BigNumber{this.assert(!num.isZero());const tV=this._getSignedValue();const nV=num._getSignedValue();let d=tV/nV;const m=tV%nV;if(m===0n){const r=new BigNumber(0n);r._setValueFromSigned(d);return r;}const two=2n;const mT2A=m<0n?-m*two:m*two;const nVA=nV<0n?-nV:nV;if(mT2A>=nVA){if((tV>0n&&nV>0n)||(tV<0n&&nV<0n))d+=1n;else d-=1n;}const r=new BigNumber(0n);r._setValueFromSigned(d);return r;}
  modrn (num:number):number{this.assert(num!==0);const tV=this._getSignedValue();const nV=BigInt(num);let res=tV%nV;if(res!==0n&&((res<0n&&num>0)||(res>0n&&num<0)))res+=nV;return Number(res);}
  idivn (num:number):this{this.assert(num!==0);this.assert(Math.abs(num)<=BigNumber.MAX_IMULN_ARG,'num is too large');this._setValueFromSigned(this._getSignedValue()/BigInt(num));return this;}
  divn (num:number):BigNumber{return this.clone().idivn(num);}

  egcd (p:BigNumber):{a:BigNumber,b:BigNumber,gcd:BigNumber}{this.assert(p._sign===0,'p must not be negative');this.assert(!p.isZero(),'p must not be zero');let uV=this._getSignedValue();let vV=p._magnitude;let a=1n,pa=0n;let b=0n,pb=1n;while(vV!==0n){const q=uV/vV;let t=vV;vV=uV%vV;uV=t;t=pa;pa=a-q*pa;a=t;t=pb;pb=b-q*pb;b=t;}const ra=new BigNumber(0n);ra._setValueFromSigned(a);const rb=new BigNumber(0n);rb._setValueFromSigned(b);const rg=new BigNumber(0n);rg._initializeState(uV<0n?-uV:uV,0);return{a:ra,b:rb,gcd:rg};}
  gcd (num:BigNumber):BigNumber{let u=this._magnitude;let v=num._magnitude;if(u===0n){const r=new BigNumber(0n);r._setValueFromSigned(v);return r.iabs();}if(v===0n){const r=new BigNumber(0n);r._setValueFromSigned(u);return r.iabs();}while(v!==0n){const t=u%v;u=v;v=t;}const res=new BigNumber(0n);res._initializeState(u,0);return res;}
  invm (num:BigNumber):BigNumber{this.assert(!num.isZero()&&num._sign===0,"Modulus for invm must be positive and non-zero");return this._invmp(num);}

  isEven():boolean{return this._magnitude%2n===0n;} isOdd():boolean{return this._magnitude%2n===1n;}
  andln (num:number):number{this.assert(num>=0);return Number(this._magnitude&BigInt(num));}
  bincn (bit:number):this{this.assert(typeof bit==='number'&&bit>=0);const BVal=1n<<BigInt(bit);this._setValueFromSigned(this._getSignedValue()+BVal);return this;}
  isZero():boolean{return this._magnitude===0n;}
  cmpn (num:number):1|0|-1{this.assert(Math.abs(num)<=BigNumber.MAX_IMULN_ARG,'Number is too big');const tV=this._getSignedValue();const nV=BigInt(num);if(tV<nV)return-1;if(tV>nV)return 1;return 0;}
  cmp (num:BigNumber):1|0|-1{const tV=this._getSignedValue();const nV=num._getSignedValue();if(tV<nV)return-1;if(tV>nV)return 1;return 0;}
  ucmp (num:BigNumber):1|0|-1{if(this._magnitude<num._magnitude)return-1;if(this._magnitude>num._magnitude)return 1;return 0;}
  gtn(num:number):boolean{return this.cmpn(num)===1;} gt(num:BigNumber):boolean{return this.cmp(num)===1;} gten(num:number):boolean{return this.cmpn(num)>=0;} gte(num:BigNumber):boolean{return this.cmp(num)>=0;}
  ltn(num:number):boolean{return this.cmpn(num)===-1;} lt(num:BigNumber):boolean{return this.cmp(num)===-1;} lten(num:number):boolean{return this.cmpn(num)<=0;} lte(num:BigNumber):boolean{return this.cmp(num)<=0;}
  eqn(num:number):boolean{return this.cmpn(num)===0;} eq(num:BigNumber):boolean{return this.cmp(num)===0;}

  toRed(ctx:ReductionContext):BigNumber{this.assert(this.red==null,'Already a number in reduction context');this.assert(this._sign===0,'toRed works only with positives');return ctx.convertTo(this).forceRed(ctx);}
  fromRed():BigNumber{this.assert(this.red,'fromRed works only with numbers in reduction context');return this.red.convertFrom(this);}
  forceRed(ctx:ReductionContext):this{this.red=ctx;return this;}
  redAdd(num:BigNumber):BigNumber{this.assert(this.red,'redAdd works only with red numbers');return this.red.add(this,num);}
  redIAdd(num:BigNumber):BigNumber{this.assert(this.red,'redIAdd works only with red numbers');return this.red.iadd(this,num);}
  redSub(num:BigNumber):BigNumber{this.assert(this.red,'redSub works only with red numbers');return this.red.sub(this,num);}
  redISub(num:BigNumber):BigNumber{this.assert(this.red,'redISub works only with red numbers');return this.red.isub(this,num);}
  redShl(num:number):BigNumber{this.assert(this.red,'redShl works only with red numbers');return this.red.shl(this,num);}
  redMul(num:BigNumber):BigNumber{this.assert(this.red,'redMul works only with red numbers');this.red.verify2(this,num);return this.red.mul(this,num);}
  redIMul(num:BigNumber):BigNumber{this.assert(this.red,'redIMul works only with red numbers');this.red.verify2(this,num);return this.red.imul(this,num);}
  redSqr():BigNumber{this.assert(this.red,'redSqr works only with red numbers');this.red.verify1(this);return this.red.sqr(this);}
  redISqr():BigNumber{this.assert(this.red,'redISqr works only with red numbers');this.red.verify1(this);return this.red.isqr(this);}
  redSqrt():BigNumber{this.assert(this.red,'redSqrt works only with red numbers');this.red.verify1(this);return this.red.sqrt(this);}
  redInvm():BigNumber{this.assert(this.red,'redInvm works only with red numbers');this.red.verify1(this);return this.red.invm(this);}
  redNeg():BigNumber{this.assert(this.red,'redNeg works only with red numbers');this.red.verify1(this);return this.red.neg(this);}
  redPow(num:BigNumber):BigNumber{this.assert(this.red!=null&&num.red==null,'redPow(normalNum)');this.red.verify1(this);return this.red.pow(this,num);}

  static fromHex (hex:string,endian?:'le'|'be'|'little'|'big'):BigNumber{let eE:'le'|'be'='be';if(endian==='little'||endian==='le')eE='le';return new BigNumber(hex,16,eE);}
  toHex (length:number=0):string{return this.toString('hex',length*2);}
  static fromJSON(str:string):BigNumber{return new BigNumber(str,16);}
  static fromNumber(n:number):BigNumber{return new BigNumber(n);}
  static fromString(str:string,base?:number|'hex'):BigNumber{return new BigNumber(str,base);}
  
  static fromSm(bytes:number[],endian:'big'|'little'='big'):BigNumber{if(bytes.length===0)return new BigNumber(0n);const b=[...(endian==='little'?bytes.slice().reverse():bytes)];let s:0|1=0;if(b.length>0&&(b[0]&0x80)!==0){s=1;b[0]&=0x7f;}let m=0n;for(let i=0;i<b.length;i++)m=(m<<8n)|BigInt(b[i]);const r=new BigNumber(0n);r._initializeState(m,s);return r;}
  toSm(endian:'big'|'little'='big'):number[]{if(this._magnitude===0n&&this._sign===0)return[];if(this._magnitude===0n&&this._sign===1)return[0x80];let bytes:number[]=[];let tM=this._magnitude;while(tM>0n){bytes.unshift(Number(tM&0xffn));tM>>=8n;}if(bytes.length===0&&this._magnitude!==0n)bytes=[0];if(this._sign===1){if(bytes.length===0)bytes=[0x80];else if((bytes[0]&0x80)!==0)bytes.unshift(0x80);else bytes[0]|=0x80;}else{if(bytes.length>0&&(bytes[0]&0x80)!==0)bytes.unshift(0x00);}return endian==='little'?bytes.reverse():bytes;}
  
  static fromBits(bits:number,strict:boolean=false):BigNumber{const nS=bits>>>24;const nW=bits&0x007fffff;const iN=(bits&0x00800000)!==0;if(strict&&iN&&nW!==0)throw new Error('Negative bit set in strict mode for fromBits');if(bits===0)return new BigNumber(0n);let mB:number[]=[];if(nS>0){if(nS<=3){for(let i=0;i<nS;i++)mB.push((nW>>>((nS-1-i)*8))&0xff);}else{mB=[(nW>>>16)&0xff,(nW>>>8)&0xff,nW&0xff];for(let k=0;k<nS-3;k++)mB.push(0);}}const bn=new BigNumber(0n);if(mB.length>0)bn.initArray(mB,'be');if(iN)bn._sign=1;bn.normSign();return bn;}
  toBits():number{this.strip();if(this.isZero())return 0;let nS=this.byteLength();const tP=this.abs();let mB=tP.toArray('be');while(mB.length>0&&mB[0]===0)mB.shift();nS=mB.length;if(nS===0&&!this.isZero()){mB=[0];nS=1;}let nW:number;if(nS===0)nW=0;else if(nS<=3){nW=mB.reduce((a,b,i)=>a|(b<<((nS-1-i)*8)),0);if(nS<3)nW<<=(3-nS)*8;}else nW=(mB[0]<<16)|(mB[1]<<8)|mB[2];if((nW&0x00800000)!==0){nW>>>=8;nS++;}let b=(nS<<24)|nW;if(this.isNeg())b|=0x00800000;return b>>>0;}
  
  static fromScriptNum(num:number[],requireMinimal:boolean=false,maxNumSize:number=4):BigNumber{if(num.length>maxNumSize)throw new Error('script number overflow');if(requireMinimal&&num.length>0){if((num[num.length-1]&0x7f)===0){if(num.length<=1||(num[num.length-2]&0x80)===0)throw new Error('non-minimally encoded script number');}}return BigNumber.fromSm(num,'little');}
  toScriptNum():number[]{return this.toSm('little');}

  _invmp (p: BigNumber): BigNumber {
    this.assert(p._sign === 0, 'p must not be negative for _invmp');
    this.assert(!p.isZero(), 'p must not be zero for _invmp');
    
    // Start with a = this mod p (must be positive)
    let aBN: BigNumber = this.umod(p); // umod ensures positive result in [0, p-1]
                                      // and handles if `this` was negative.

    let u = aBN._magnitude;     // Current 'a' value in algorithm, always positive
    let v = p._magnitude;       // Modulus 'n', always positive
    let x1 = 1n;                // Coefficient for 'a'
    let x2 = 0n;                // Coefficient for 'n'
    const n_orig = p._magnitude; // Original modulus for additions if x1/x2 become negative

    // Extended Binary GCD for modular inverse (variant)
    // We want x such that (this * x) % p == 1
    // Or, (u_orig * x1) % n_orig == 1 when u becomes GCD (1)
    while (u !== 0n) { // Loop while u is not 0
        while ((u & 1n) === 0n) { // u is even
            u >>= 1n;
            if (!((x1 & 1n) === 0n)) { // x1 is odd
                x1 = (x1 + n_orig); // Make x1 even before dividing (x1 + n === x1 mod n)
            }
            x1 >>= 1n;
        }
        while ((v & 1n) === 0n) { // v is even
            v >>= 1n;
            if (!((x2 & 1n) === 0n)) { // x2 is odd
                x2 = (x2 + n_orig);
            }
            x2 >>= 1n;
        }

        // Now u and v are odd
        if (u >= v) {
            u -= v;
            x1 -= x2;
        } else {
            v -= u;
            x2 -= x1;
        }
    }
    // After loop, v is GCD(initial_u, initial_n). x2 is Bezout coeff for initial_n.
    // Inverse is x2 if v (GCD) is 1.
    // This is the standard result for `ax + ny = gcd(a,n)` where `y` is `x2`.
    // We need `x`, which is the coefficient for `a`.
    // The previous implementation (`if (aVal === 0n) resultVal = x2Val; else resultVal = x1Val;`)
    // was based on a different loop structure.
    // The version that yielded 86 for (3, 257) was from original BN.js _invmp structure:
    // let a = this.clone(), b = p.clone(); x1 = new BN(1), x2 = new BN(0); delta = p.clone();
    // while (a > 1 && b > 1) { ... } then if (a==1) res=x1 else res=x2.
    // Let's use the egcd approach for _invmp for reliability with BigInt.
    // `invm` itself uses egcd. `_invmp` should be a distinct algorithm for drop-in.
    // The original _invmp:
    //   a = this.umod(p)
    //   b = p.clone()
    //   x1 = BN(1), x2 = BN(0)
    //   delta = p.clone()
    //   while a > 1 && b > 1:
    //     ... binary steps for a, b, x1, x2 ...
    //   if a == 1: res = x1
    //   else: res = x2
    //   return res.umod(p)
    // Re-implementing that specific binary algorithm with BigInts:
    
    aVal = aBN._magnitude; // `a` from `this umod p`
    bVal = p._magnitude;   // `p`
    x1Val = 1n;
    x2Val = 0n;
    const modulus = p._magnitude;

    while (aVal > 1n && bVal > 1n) {
        let i = 0; while (((aVal >> BigInt(i)) & 1n) === 0n) i++;
        if (i > 0) {
            aVal >>= BigInt(i);
            for (let k=0; k<i; ++k) { if ((x1Val & 1n) !== 0n) x1Val += modulus; x1Val >>= 1n; }
        }
        
        let j = 0; while (((bVal >> BigInt(j)) & 1n) === 0n) j++;
        if (j > 0) {
            bVal >>= BigInt(j);
            for (let k=0; k<j; ++k) { if ((x2Val & 1n) !== 0n) x2Val += modulus; x2Val >>= 1n; }
        }

        if (aVal >= bVal) { aVal -= bVal; x1Val -= x2Val; }
        else { bVal -= aVal; x2Val -= x1Val; }
    }
    
    let resultVal: bigint;
    if (aVal === 1n) resultVal = x1Val;
    else if (bVal === 1n) resultVal = x2Val;
    else throw new Error("_invmp: GCD is not 1, inverse does not exist."); // Should not happen if inputs are co-prime

    resultVal %= modulus;
    if (resultVal < 0n) resultVal += modulus;

    const resultBN = new BigNumber(0n); 
    resultBN._initializeState(resultVal, 0); 
    return resultBN;
  }

  mulTo (num: BigNumber, out: BigNumber): BigNumber {
    const resultVal = this._getSignedValue() * num._getSignedValue();
    out._setValueFromSigned(resultVal);
    out.red = null; 
    return out;
  }
}
