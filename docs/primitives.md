# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

## Interfaces

## Classes

| | | |
| --- | --- | --- |
| [BasePoint](#class-basepoint) | [Point](#class-point) | [SHA1HMAC](#class-sha1hmac) |
| [BigNumber](#class-bignumber) | [PointInFiniteField](#class-pointinfinitefield) | [SHA256](#class-sha256) |
| [Curve](#class-curve) | [Polynomial](#class-polynomial) | [SHA256HMAC](#class-sha256hmac) |
| [DRBG](#class-drbg) | [PrivateKey](#class-privatekey) | [SHA512](#class-sha512) |
| [JacobianPoint](#class-jacobianpoint) | [PublicKey](#class-publickey) | [SHA512HMAC](#class-sha512hmac) |
| [K256](#class-k256) | [RIPEMD160](#class-ripemd160) | [Signature](#class-signature) |
| [KeyShares](#class-keyshares) | [Reader](#class-reader) | [SymmetricKey](#class-symmetrickey) |
| [Mersenne](#class-mersenne) | [ReductionContext](#class-reductioncontext) | [TransactionSignature](#class-transactionsignature) |
| [MontgomoryMethod](#class-montgomorymethod) | [SHA1](#class-sha1) | [Writer](#class-writer) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

### Class: Mersenne

A representation of a pseudo-Mersenne prime.
A pseudo-Mersenne prime has the general form 2^n - k, where n and k are integers.

```ts
export default class Mersenne {
    name: string;
    p: BigNumber;
    k: BigNumber;
    n: number;
    constructor(name: string, p: string) 
    ireduce(num: BigNumber): BigNumber 
    split(input: BigNumber, out: BigNumber): void 
    imulK(num: BigNumber): BigNumber 
}
```

<details>

<summary>Class Mersenne Details</summary>

#### Constructor

```ts
constructor(name: string, p: string) 
```

Argument Details

+ **name**
  + An identifier for the Mersenne instance.
+ **p**
  + A string representation of the pseudo-Mersenne prime, expressed in hexadecimal.

Example

```ts
const mersenne = new Mersenne('M31', '7FFFFFFF');
```

#### Property k

The constant subtracted from 2^n to derive a pseudo-Mersenne prime.

```ts
k: BigNumber
```

#### Property n

The exponent which determines the magnitude of the prime.

```ts
n: number
```

#### Property name

The identifier for the Mersenne instance.

```ts
name: string
```

#### Property p

BigNumber equivalent to 2^n - k.

```ts
p: BigNumber
```

#### Method imulK

Performs an in-place multiplication of the parameter by constant k.

```ts
imulK(num: BigNumber): BigNumber 
```

Returns

The result of the multiplication, in BigNumber format.

Argument Details

+ **num**
  + The BigNumber to multiply with k.

Example

```ts
const multiplied = mersenne.imulK(new BigNumber('2345', 16));
```

#### Method ireduce

Reduces an input BigNumber in place, under the assumption that
it is less than the square of the pseudo-Mersenne prime.

```ts
ireduce(num: BigNumber): BigNumber 
```

Returns

The reduced BigNumber.

Argument Details

+ **num**
  + The BigNumber to be reduced.

Example

```ts
const reduced = mersenne.ireduce(new BigNumber('2345', 16));
```

#### Method split

Shifts bits of the input BigNumber to the right, in place,
to meet the magnitude of the pseudo-Mersenne prime.

```ts
split(input: BigNumber, out: BigNumber): void 
```

Argument Details

+ **input**
  + The BigNumber to be shifted.
+ **out**
  + The BigNumber to hold the shifted result.

Example

```ts
mersenne.split(new BigNumber('2345', 16), new BigNumber());
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: K256

A class representing K-256, a prime number with optimizations, specifically used in the secp256k1 curve.
It extends the functionalities of the Mersenne class.
K-256 prime is represented as 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f'

Example

```ts
const k256 = new K256();
```

```ts
export default class K256 extends Mersenne {
    constructor() 
    split(input: BigNumber, output: BigNumber): void 
    imulK(num: BigNumber): BigNumber 
}
```

<details>

<summary>Class K256 Details</summary>

#### Constructor

Constructor for the K256 class.
Creates an instance of K256 using the super constructor from Mersenne.

```ts
constructor() 
```

Example

```ts
const k256 = new K256();
```

#### Method imulK

Multiplies a BigNumber ('num') with the constant 'K' in-place and returns the result.
'K' is equal to 0x1000003d1 or in decimal representation: [ 64, 977 ].

```ts
imulK(num: BigNumber): BigNumber 
```

Returns

Returns the mutated BigNumber after multiplication.

Argument Details

+ **num**
  + The BigNumber to multiply with K.

Example

```ts
const number = new BigNumber(12345);
const result = k256.imulK(number);
```

#### Method split

Splits a BigNumber into a new BigNumber based on specific computation
rules. This method modifies the input and output big numbers.

```ts
split(input: BigNumber, output: BigNumber): void 
```

Argument Details

+ **input**
  + The BigNumber to be split.
+ **output**
  + The BigNumber that results from the split.

Example

```ts
const input = new BigNumber(3456);
const output = new BigNumber(0);
k256.split(input, output);
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: ReductionContext

A base reduction engine that provides several arithmetic operations over
big numbers under a modulus context. It's particularly suitable for
calculations required in cryptography algorithms and encoding schemas.

```ts
export default class ReductionContext {
    prime: Mersenne | null;
    m: BigNumber;
    constructor(m: BigNumber | "k256") 
    verify1(a: BigNumber): void 
    verify2(a: BigNumber, b: BigNumber): void 
    imod(a: BigNumber): BigNumber 
    neg(a: BigNumber): BigNumber 
    add(a: BigNumber, b: BigNumber): BigNumber 
    iadd(a: BigNumber, b: BigNumber): BigNumber 
    sub(a: BigNumber, b: BigNumber): BigNumber 
    isub(a: BigNumber, b: BigNumber): BigNumber 
    shl(a: BigNumber, num: number): BigNumber 
    imul(a: BigNumber, b: BigNumber): BigNumber 
    mul(a: BigNumber, b: BigNumber): BigNumber 
    isqr(a: BigNumber): BigNumber 
    sqr(a: BigNumber): BigNumber 
    sqrt(a: BigNumber): BigNumber 
    invm(a: BigNumber): BigNumber 
    pow(a: BigNumber, num: BigNumber): BigNumber 
    convertTo(num: BigNumber): BigNumber 
    convertFrom(num: BigNumber): BigNumber 
}
```

<details>

<summary>Class ReductionContext Details</summary>

#### Constructor

Constructs a new ReductionContext.

```ts
constructor(m: BigNumber | "k256") 
```

Argument Details

+ **m**
  + A BigNumber representing the modulus, or 'k256' to create a context for Koblitz curve.

Example

```ts
new ReductionContext(new BigNumber(11));
new ReductionContext('k256');
```

#### Property m

The modulus used for reduction operations.

```ts
m: BigNumber
```

#### Property prime

The prime number utilised in the reduction context, typically an instance of Mersenne class.

```ts
prime: Mersenne | null
```

#### Method add

Performs the addition operation on two BigNumbers in the reduction context.

```ts
add(a: BigNumber, b: BigNumber): BigNumber 
```

Returns

Returns the result of 'a + b' in the reduction context.

Argument Details

+ **a**
  + First BigNumber to add.
+ **b**
  + Second BigNumber to add.

Example

```ts
const context = new ReductionContext(new BigNumber(5));
context.add(new BigNumber(2), new BigNumber(4)); // Returns 1
```

#### Method convertFrom

Converts a BigNumber from reduction context to its regular form.

```ts
convertFrom(num: BigNumber): BigNumber 
```

Returns

Returns the converted BigNumber in its regular form.

Argument Details

+ **num**
  + The BigNumber to convert from the reduction context.

Example

```ts
const context = new ReductionContext(new BigNumber(7));
const a = context.convertTo(new BigNumber(8)); // 'a' is now 1 in the reduction context
context.convertFrom(a); // Returns 1
```

#### Method convertTo

Converts a BigNumber to its equivalent in the reduction context.

```ts
convertTo(num: BigNumber): BigNumber 
```

Returns

Returns the converted BigNumber compatible with the reduction context.

Argument Details

+ **num**
  + The BigNumber to convert to the reduction context.

Example

```ts
const context = new ReductionContext(new BigNumber(7));
context.convertTo(new BigNumber(8)); // Returns 1 (8 % 7)
```

#### Method iadd

Performs an in-place addition operation on two BigNumbers in the reduction context
in order to avoid creating a new BigNumber, it modifies the first one with the result.

```ts
iadd(a: BigNumber, b: BigNumber): BigNumber 
```

Returns

Returns the modified 'a' after addition with 'b' in the reduction context.

Argument Details

+ **a**
  + First BigNumber to add.
+ **b**
  + Second BigNumber to add.

Example

```ts
const context = new ReductionContext(new BigNumber(5));
const a = new BigNumber(2);
context.iadd(a, new BigNumber(4)); // Modifies 'a' to be 1
```

#### Method imod

Performs an in-place reduction of the given BigNumber by the modulus of the reduction context, 'm'.

```ts
imod(a: BigNumber): BigNumber 
```

Returns

Returns the reduced result.

Argument Details

+ **a**
  + BigNumber to be reduced.

Example

```ts
const context = new ReductionContext(new BigNumber(7));
context.imod(new BigNumber(19)); // Returns 5
```

#### Method imul

Performs in-place multiplication of two BigNumbers in the reduction context,
modifying the first BigNumber with the result.

```ts
imul(a: BigNumber, b: BigNumber): BigNumber 
```

Returns

Returns the modified 'a' after multiplication with 'b' in the reduction context.

Argument Details

+ **a**
  + First BigNumber to multiply.
+ **b**
  + Second BigNumber to multiply.

Example

```ts
const context = new ReductionContext(new BigNumber(7));
const a = new BigNumber(3);
context.imul(a, new BigNumber(2)); // Modifies 'a' to be 6
```

#### Method invm

Calculates the multiplicative inverse of a BigNumber in the reduction context.

```ts
invm(a: BigNumber): BigNumber 
```

Returns

Returns the multiplicative inverse of 'a' in the reduction context.

Argument Details

+ **a**
  + The BigNumber to find the multiplicative inverse of.

Example

```ts
const context = new ReductionContext(new BigNumber(11));
context.invm(new BigNumber(3)); // Returns 4 (3*4 mod 11 = 1)
```

#### Method isqr

Calculates the square of a BigNumber in the reduction context,
modifying the original BigNumber with the result.

```ts
isqr(a: BigNumber): BigNumber 
```

Returns

Returns the squared 'a' in the reduction context.

Argument Details

+ **a**
  + BigNumber to be squared.

Example

```ts
const context = new ReductionContext(new BigNumber(7));
const a = new BigNumber(3);
context.isqr(a); // Modifies 'a' to be 2 (9 % 7 = 2)
```

#### Method isub

Performs in-place subtraction of one BigNumber from another in the reduction context,
it modifies the first BigNumber with the result.

```ts
isub(a: BigNumber, b: BigNumber): BigNumber 
```

Returns

Returns the modified 'a' after subtraction of 'b' in the reduction context.

Argument Details

+ **a**
  + BigNumber to be subtracted from.
+ **b**
  + BigNumber to subtract.

Example

```ts
const context = new ReductionContext(new BigNumber(5));
const a = new BigNumber(4);
context.isub(a, new BigNumber(2)); // Modifies 'a' to be 2
```

#### Method mul

Multiplies two BigNumbers in the reduction context.

```ts
mul(a: BigNumber, b: BigNumber): BigNumber 
```

Returns

Returns the result of 'a * b' in the reduction context.

Argument Details

+ **a**
  + First BigNumber to multiply.
+ **b**
  + Second BigNumber to multiply.

Example

```ts
const context = new ReductionContext(new BigNumber(7));
context.mul(new BigNumber(3), new BigNumber(2)); // Returns 6
```

#### Method neg

Negates a BigNumber in the context of the modulus.

```ts
neg(a: BigNumber): BigNumber 
```

Returns

Returns the negation of 'a' in the reduction context.

Argument Details

+ **a**
  + BigNumber to negate.

Example

```ts
const context = new ReductionContext(new BigNumber(7));
context.neg(new BigNumber(3)); // Returns 4
```

#### Method pow

Raises a BigNumber to a power in the reduction context.

```ts
pow(a: BigNumber, num: BigNumber): BigNumber 
```

Returns

Returns the result of 'a' raised to the power of 'num' in the reduction context.

Argument Details

+ **a**
  + The BigNumber to be raised to a power.
+ **num**
  + The power to raise the BigNumber to.

Example

```ts
const context = new ReductionContext(new BigNumber(7));
context.pow(new BigNumber(3), new BigNumber(2)); // Returns 2 (3^2 % 7)
```

#### Method shl

Performs bitwise shift left operation on a BigNumber in the reduction context.

```ts
shl(a: BigNumber, num: number): BigNumber 
```

Returns

Returns the result of shifting 'a' left by 'num' positions in the reduction context.

Argument Details

+ **a**
  + BigNumber to perform shift on.
+ **num**
  + The number of positions to shift.

Example

```ts
const context = new ReductionContext(new BigNumber(32));
context.shl(new BigNumber(4), 2); // Returns 16
```

#### Method sqr

Calculates the square of a BigNumber in the reduction context.

```ts
sqr(a: BigNumber): BigNumber 
```

Returns

Returns the result of 'a^2' in the reduction context.

Argument Details

+ **a**
  + BigNumber to be squared.

Example

```ts
const context = new ReductionContext(new BigNumber(7));
context.sqr(new BigNumber(3)); // Returns 2 (9 % 7 = 2)
```

#### Method sqrt

Calculates the square root of a BigNumber in the reduction context.

```ts
sqrt(a: BigNumber): BigNumber 
```

Returns

Returns the square root of 'a' in the reduction context.

Argument Details

+ **a**
  + The BigNumber to calculate the square root of.

Example

```ts
const context = new ReductionContext(new BigNumber(9));
context.sqrt(new BigNumber(4)); // Returns 2
```

#### Method sub

Subtracts one BigNumber from another BigNumber in the reduction context.

```ts
sub(a: BigNumber, b: BigNumber): BigNumber 
```

Returns

Returns the result of 'a - b' in the reduction context.

Argument Details

+ **a**
  + BigNumber to be subtracted from.
+ **b**
  + BigNumber to subtract.

Example

```ts
const context = new ReductionContext(new BigNumber(7));
context.sub(new BigNumber(3), new BigNumber(2)); // Returns 1
```

#### Method verify1

Verifies that a BigNumber is positive and red. Throws an error if these
conditions are not met.

```ts
verify1(a: BigNumber): void 
```

Argument Details

+ **a**
  + The BigNumber to be verified.

Example

```ts
this.verify1(new BigNumber(10).toRed());
this.verify1(new BigNumber(-10).toRed()); //throws an Error
this.verify1(new BigNumber(10)); //throws an Error
```

#### Method verify2

Verifies that two BigNumbers are both positive and red. Also checks
that they have the same reduction context. Throws an error if these
conditions are not met.

```ts
verify2(a: BigNumber, b: BigNumber): void 
```

Argument Details

+ **a**
  + The first BigNumber to be verified.
+ **b**
  + The second BigNumber to be verified.

Example

```ts
this.verify2(new BigNumber(10).toRed(this), new BigNumber(20).toRed(this));
this.verify2(new BigNumber(-10).toRed(this), new BigNumber(20).toRed(this)); //throws an Error
this.verify2(new BigNumber(10).toRed(this), new BigNumber(20)); //throws an Error
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: BigNumber

JavaScript numbers are only precise up to 53 bits. Since Bitcoin relies on
256-bit cryptography, this BigNumber class enables operations on larger
numbers.

```ts
export default class BigNumber {
    static zeros: string[] 
    static groupSizes: number[] 
    static groupBases: number[] 
    static wordSize: number = 26;
    negative: number;
    words: number[];
    length: number;
    red: ReductionContext | null;
    static isBN(num: any): boolean 
    static max(left: BigNumber, right: BigNumber): BigNumber 
    static min(left: BigNumber, right: BigNumber): BigNumber 
    constructor(number: number | string | number[] = 0, base: number | "be" | "le" | "hex" = 10, endian: "be" | "le" = "be") 
    copy(dest: BigNumber): void 
    static move(dest: BigNumber, src: BigNumber): void 
    clone(): BigNumber 
    expand(size): BigNumber 
    strip(): BigNumber 
    normSign(): BigNumber 
    inspect(): string 
    toString(base: number | "hex" = 10, padding: number = 1): string 
    toNumber(): number 
    toJSON(): string 
    toArray(endian: "le" | "be" = "be", length?: number): number[] 
    bitLength(): number 
    static toBitArray(num: BigNumber): Array<0 | 1> 
    toBitArray(): Array<0 | 1> 
    zeroBits(): number 
    byteLength(): number 
    toTwos(width: number): BigNumber 
    fromTwos(width: number): BigNumber 
    isNeg(): boolean 
    neg(): BigNumber 
    ineg(): BigNumber 
    iuor(num: BigNumber): BigNumber 
    ior(num: BigNumber): BigNumber 
    or(num: BigNumber): BigNumber 
    uor(num: BigNumber): BigNumber 
    iuand(num: BigNumber): BigNumber 
    iand(num: BigNumber): BigNumber 
    and(num: BigNumber): BigNumber 
    uand(num: BigNumber): BigNumber 
    iuxor(num: BigNumber): BigNumber 
    ixor(num: BigNumber): BigNumber 
    xor(num: BigNumber): BigNumber 
    uxor(num: BigNumber): BigNumber 
    inotn(width: number): BigNumber 
    notn(width: number): BigNumber 
    setn(bit: number, val: 0 | 1 | true | false): BigNumber 
    iadd(num: BigNumber): BigNumber 
    add(num: BigNumber): BigNumber 
    isub(num: BigNumber): BigNumber 
    sub(num: BigNumber): BigNumber 
    comb10MulTo(self: BigNumber, num: BigNumber, out: BigNumber): BigNumber 
    mulTo(num: BigNumber, out: BigNumber): BigNumber 
    mul(num: BigNumber): BigNumber 
    imul(num: BigNumber): BigNumber 
    imuln(num: number): BigNumber 
    muln(num: number): BigNumber 
    sqr(): BigNumber 
    isqr(): BigNumber 
    pow(num: BigNumber): BigNumber 
    iushln(bits: number): BigNumber 
    ishln(bits: number): BigNumber 
    iushrn(bits: number, hint?: number, extended?: BigNumber): BigNumber 
    ishrn(bits, hint?, extended?): BigNumber 
    shln(bits): BigNumber 
    ushln(bits): BigNumber 
    shrn(bits): BigNumber 
    ushrn(bits): BigNumber 
    testn(bit: number): boolean 
    imaskn(bits): BigNumber 
    maskn(bits): BigNumber 
    iaddn(num: number): BigNumber 
    isubn(num: number): BigNumber 
    addn(num: number): BigNumber 
    subn(num: number): BigNumber 
    iabs(): BigNumber 
    abs(): BigNumber 
    _ishlnsubmul(num: BigNumber, mul, shift: number): BigNumber 
    divmod(num: BigNumber, mode?: "div" | "mod", positive?: boolean): any 
    div(num: BigNumber): BigNumber 
    mod(num: BigNumber): BigNumber 
    umod(num: BigNumber): BigNumber 
    divRound(num: BigNumber): BigNumber 
    modrn(num: number): number 
    idivn(num: number): BigNumber 
    divn(num: number): BigNumber 
    egcd(p: BigNumber): {
        a: BigNumber;
        b: BigNumber;
        gcd: BigNumber;
    } 
    _invmp(p: BigNumber): BigNumber 
    gcd(num: BigNumber): BigNumber 
    invm(num: BigNumber): BigNumber 
    isEven(): boolean 
    isOdd(): boolean 
    andln(num: number): number 
    bincn(bit: number): BigNumber 
    isZero(): boolean 
    cmpn(num: number): 1 | 0 | -1 
    cmp(num: BigNumber): 1 | 0 | -1 
    ucmp(num: BigNumber): 1 | 0 | -1 
    gtn(num: number): boolean 
    gt(num: BigNumber): boolean 
    gten(num: number): boolean 
    gte(num: BigNumber): boolean 
    ltn(num: number): boolean 
    lt(num: BigNumber): boolean 
    lten(num: number): boolean 
    lte(num: BigNumber): boolean 
    eqn(num: number): boolean 
    eq(num: BigNumber): boolean 
    toRed(ctx: ReductionContext): BigNumber 
    fromRed(): BigNumber 
    forceRed(ctx: ReductionContext): BigNumber 
    redAdd(num: BigNumber): BigNumber 
    redIAdd(num: BigNumber): BigNumber 
    redSub(num: BigNumber): BigNumber 
    redISub(num: BigNumber): BigNumber 
    redShl(num: number): BigNumber 
    redMul(num: BigNumber): BigNumber 
    redIMul(num: BigNumber): BigNumber 
    redSqr(): BigNumber 
    redISqr(): BigNumber 
    redSqrt(): BigNumber 
    redInvm(): BigNumber 
    redNeg(): BigNumber 
    redPow(num: BigNumber): BigNumber 
    static fromHex(hex: string, endian?: "little" | "big"): BigNumber 
    toHex(length: number = 0): string 
    static fromJSON(str: string): BigNumber 
    static fromNumber(n: number): BigNumber 
    static fromString(str: string, base?: number | "hex"): BigNumber 
    static fromSm(num: number[], endian: "big" | "little" = "big"): BigNumber 
    toSm(endian: "big" | "little" = "big"): number[] 
    static fromBits(bits: number, strict: boolean = false): BigNumber 
    toBits(): number 
    static fromScriptNum(num: number[], requireMinimal?: boolean, maxNumSize?: number): BigNumber 
    toScriptNum(): number[] 
}
```

<details>

<summary>Class BigNumber Details</summary>

#### Constructor

```ts
constructor(number: number | string | number[] = 0, base: number | "be" | "le" | "hex" = 10, endian: "be" | "le" = "be") 
```

Argument Details

+ **number**
  + The number (various types accepted) to construct a BigNumber from. Default is 0.
+ **base**
  + The base of number provided. By default is 10.
+ **endian**
  + The endianness provided. By default is 'big endian'.

Example

```ts
import BigNumber from './BigNumber';
const bn = new BigNumber('123456', 10, 'be');
```

#### Property length

Length of the words array.

```ts
length: number
```

Example

```ts
let num = new BigNumber(50000);
console.log(num.length);  // output: 1
```

#### Property negative

Negative flag. Indicates whether the big number is a negative number.
- If 0, the number is positive.
- If 1, the number is negative.

```ts
negative: number
```

Example

```ts
let num = new BigNumber("-10");
console.log(num.negative);  // output: 1
```

#### Property red

Reduction context of the big number.

```ts
red: ReductionContext | null
```

#### Property wordSize

The word size of big number chunks.

```ts
static wordSize: number = 26
```

Example

```ts
console.log(BigNumber.wordSize);  // output: 26
```

#### Property words

Array of numbers, where each number represents a part of the value of the big number.

```ts
words: number[]
```

Example

```ts
let num = new BigNumber(50000);
console.log(num.words);  // output: [ 50000 ]
```

#### Method _invmp

Compute the multiplicative inverse of the current BigNumber in the modulus field specified by `p`.
The multiplicative inverse is a number which when multiplied with the current BigNumber gives '1' in the modulus field.

```ts
_invmp(p: BigNumber): BigNumber 
```

Returns

The multiplicative inverse `BigNumber` in the modulus field specified by `p`.

Argument Details

+ **p**
  + The `BigNumber` specifying the modulus field.

Example

```ts
const bigNum = new BigNumber('45');
const p = new BigNumber('100');
const inverse = bigNum._invmp(p); // inverse here would be a BigNumber such that (inverse*bigNum) % p = '1'
```

#### Method _ishlnsubmul

Perform an in-place shift left, subtract, and multiply operation on a BigNumber instance.
This method modifies the existing BigNumber instance.

```ts
_ishlnsubmul(num: BigNumber, mul, shift: number): BigNumber 
```

Returns

the updated BigNumber instance after performing the in-place shift, subtract, and multiply operations.

Argument Details

+ **num**
  + The BigNumber to be operated on.
+ **mul**
  + The multiplication factor.
+ **shift**
  + The number of places to shift left.

Example

```ts
let number = new BigNumber(10);
number._ishlnsubmul(new BigNumber(2), 3, 1);
console.log(number.toString()); // Outputs result after performing operations
```

#### Method abs

Obtains the absolute value of a BigNumber instance.
This operation does not affect the actual object but instead returns a new instance of BigNumber.

```ts
abs(): BigNumber 
```

Returns

a new BigNumber instance with the absolute value of the current instance.

Example

```ts
let negativeNumber = new BigNumber(-10);
let absolute = negativeNumber.abs();
console.log(absolute.toString()); // Outputs: "10"
```

#### Method add

Add `num` to `this` BigNumber.

```ts
add(num: BigNumber): BigNumber 
```

Returns

Returns a new BigNumber which is the result of the addition.

Argument Details

+ **num**
  + The BigNumber to add to `this` BigNumber.

Example

```ts
const num1 = new BigNumber('10');
const addResult = num1.add(new BigNumber('20'));
console.log(addResult.toString());
```

#### Method addn

Returns a new BigNumber that is the result of adding a plain number to the original BigNumber.

```ts
addn(num: number): BigNumber 
```

Returns

Returns a new BigNumber which is the sum of the original BigNumber and the plain number.

Argument Details

+ **num**
  + The plain number to add.

Example

```ts
const myNumber = new BigNumber(50);
const newNumber = myNumber.addn(2); // newNumber becomes 52, myNumber doesn't change.
```

#### Method and

Performs a bitwise AND operation that returns a new BigNumber, and keeps the bits
set in the result only if the corresponding bit is set in both operands.

```ts
and(num: BigNumber): BigNumber 
```

Returns

Returns new BigNumber resulting from the bitwise AND operation.

Argument Details

+ **num**
  + The BigNumber to perform the bitwise AND operation with.

Example

```ts
const num1 = new BigNumber('10');
const num2 = new BigNumber('20');
console.log(num1.and(num2).toString());
```

#### Method andln

Returns the result of bitwise AND operation between the least significant 26 bits of
this BigNumber and the provided number.
This method is mostly used to mask-off less significant bits.

```ts
andln(num: number): number 
```

Returns

The result of the AND operation.

Argument Details

+ **num**
  + The number to AND with.

Example

```ts
let a = new BigNumber(60);
let result = a.andln(13); // 12
```

#### Method bincn

Increments the value at the bit position specified by the input parameter.

```ts
bincn(bit: number): BigNumber 
```

Returns

This BigNumber after incrementing at the specific bit position.

Argument Details

+ **bit**
  + The bit position to increment at.

Example

```ts
let a = new BigNumber(5);
a.bincn(2); // a = 7
```

#### Method bitLength

Returns the number of used bits in this big number.

```ts
bitLength(): number 
```

Returns

The number of used bits

#### Method byteLength

Get the byte length of the BigNumber

```ts
byteLength(): number 
```

Returns

Returns the byte length of the big number.

Example

```ts
const BigNumber = require("./BigNumber");
const bn = new BigNumber('1234');
const byteLen = bn.byteLength();
```

#### Method clone

Creates a copy of the current BigNumber instance.

```ts
clone(): BigNumber 
```

Returns

A new BigNumber instance, identical to the original.

Example

```ts
const bn = new BigNumber('123456', 10, 'be');
const bnClone = bn.clone();
```

#### Method cmp

Compare this big number with another big number.

```ts
cmp(num: BigNumber): 1 | 0 | -1 
```

Returns

Returns:
1 if this big number is greater,
-1 if it's less,
0 if they are equal.

Argument Details

+ **num**
  + The big number to compare with.

Example

```ts
import BigNumber from './BigNumber';
const bn1 = new BigNumber('10');
const bn2 = new BigNumber('6');
const comparisonResult = bn1.cmp(bn2); // 1 - because 10 is greater than 6
```

#### Method cmpn

Compares this BigNumber with the given number.
It returns -1 if this BigNumber is less than the number, 0 if they're equal, and 1 if the BigNumber is greater than the number.

```ts
cmpn(num: number): 1 | 0 | -1 
```

Returns

-1, 0, or 1 based on the comparison result.

Argument Details

+ **num**
  + The number to compare with.

Example

```ts
let a = new BigNumber(15);
let result = a.cmpn(10); // 1
```

#### Method copy

The copy method copies the state of this BigNumber into an exsiting `dest` BigNumber.

```ts
copy(dest: BigNumber): void 
```

Argument Details

+ **dest**
  + The BigNumber instance that will be updated to become a copy.

Example

```ts
const bn1 = new BigNumber('123456', 10, 'be');
const bn2 = new BigNumber();
bn1.copy(bn2);
// bn2 is now a BigNumber representing 123456
```

#### Method div

Divides a BigNumber instance by another BigNumber and returns result. This does not modify the actual object.

```ts
div(num: BigNumber): BigNumber 
```

Returns

A new BigNumber instance of the division result.

Argument Details

+ **num**
  + The BigNumber to divide by.

Example

```ts
let number = new BigNumber(10);
let result = number.div(new BigNumber(2));
console.log(result.toString()); // Outputs: "5"
```

#### Method divRound

Returns the rounded quotient after division of one `BigNumber` by another `BigNumber`.

```ts
divRound(num: BigNumber): BigNumber 
```

Returns

The rounded quotient `BigNumber` after division.

Argument Details

+ **num**
  + The divisor `BigNumber`.

Example

```ts
const bigNum1 = new BigNumber('100');
const bigNum2 = new BigNumber('45');
const quotient = bigNum1.divRound(bigNum2); // quotient here would be '2'
```

#### Method divmod

Performs division and/or modulus operation on a BigNumber instance depending on the 'mode' parameter.
If the mode parameter is not provided, both division and modulus results are returned.

```ts
divmod(num: BigNumber, mode?: "div" | "mod", positive?: boolean): any 
```

Returns

Object with properties for division (div) and modulo (mod) results.

Argument Details

+ **num**
  + The BigNumber to divide by.
+ **mode**
  + Specifies operation as 'mod' for modulus, 'div' for division, or both if not specified.
+ **positive**
  + Specifies if unsigned modulus is requested.

Example

```ts
let number = new BigNumber(10);
let result = number.divmod(new BigNumber(3));
console.log(result.div.toString()); // Outputs: "3"
console.log(result.mod.toString()); // Outputs: "1"
```

#### Method divn

Returns the quotient `BigNumber` after division of one `BigNumber` by a primitive number.

```ts
divn(num: number): BigNumber 
```

Returns

A new quotient `BigNumber` after division.

Argument Details

+ **num**
  + The divisor primitive number.

Example

```ts
const bigNum = new BigNumber('100');
const num = 45;
const quotient = bigNum.divn(num); // quotient here would be '2'
```

#### Method egcd

Computes the Extended Euclidean Algorithm for this BigNumber and provided BigNumber `p`.
The Extended Euclidean Algorithm is a method to find the GCD (Greatest Common Divisor) and the multiplicative inverse in a modulus field.

```ts
egcd(p: BigNumber): {
    a: BigNumber;
    b: BigNumber;
    gcd: BigNumber;
} 
```

Returns

An object `{a: BigNumber, b: BigNumber, gcd: BigNumber}` where `gcd` is the GCD of the numbers, `a` is the coefficient of `this`, and `b` is the coefficient of `p` in Bézout's identity.

Argument Details

+ **p**
  + The `BigNumber` with which the Extended Euclidean Algorithm will be computed.

Example

```ts
const bigNum1 = new BigNumber('100');
const bigNum2 = new BigNumber('45');
const result = bigNum1.egcd(bigNum2);
```

#### Method eq

Compares the current BigNumber with the given number and returns whether they're equal.

```ts
eq(num: BigNumber): boolean 
```

Returns

Returns true if the current BigNumber is equal to the provided number, otherwise false.

Argument Details

+ **num**
  + The number to compare equality with.

Example

```ts
let bigNum = new BigNumber(10);
bigNum.eq(new BigNumber(10)); // true
```

#### Method eqn

Checks if this BigNumber instance is equal to a number.

```ts
eqn(num: number): boolean 
```

Returns

Returns true if this BigNumber is equal to the number, false otherwise.

Argument Details

+ **num**
  + The number to compare with.

Example

```ts
let bigNumber = new BigNumber('1234');
let isEqual = bigNumber.eqn(1234); // Returns true
```

#### Method expand

Increases the BigNumber length up to a certain size and initializes new elements with 0.

```ts
expand(size): BigNumber 
```

Returns

The BigNumber instance after expansion.

Argument Details

+ **size**
  + The desired size to grow the BigNumber length.

Example

```ts
const bn = new BigNumber('123456', 10, 'be');
bn.expand(10);
```

#### Method forceRed

Forces the current BigNumber into a reduction context, irrespective of the BigNumber's current state.

```ts
forceRed(ctx: ReductionContext): BigNumber 
```

Returns

Returns the BigNumber in the given ReductionContext.

Argument Details

+ **ctx**
  + The ReductionContext to forcefully convert the BigNumber to.

Example

```ts
let bigNum = new BigNumber(10);
let redCtx = new ReductionContext();
bigNum.forceRed(redCtx);
```

#### Method fromBits

Creates a BigNumber from a number representing the "bits" value in a block header.

```ts
static fromBits(bits: number, strict: boolean = false): BigNumber 
```

Returns

Returns a BigNumber equivalent to the "bits" value in a block header.

Argument Details

+ **bits**
  + The number representing the bits value in a block header.
+ **strict**
  + If true, an error is thrown if the number has negative bit set.

Throws

Will throw an error if `strict` is `true` and the number has negative bit set.

Example

```ts
const bits = 0x1d00ffff;
const bigNumber = BigNumber.fromBits(bits);
```

#### Method fromHex

Creates a BigNumber from a hexadecimal string.

```ts
static fromHex(hex: string, endian?: "little" | "big"): BigNumber 
```

Returns

Returns a BigNumber created from the hexadecimal input string.

Argument Details

+ **hex**
  + The hexadecimal string to create a BigNumber from.

Example

```ts
const exampleHex = 'a1b2c3';
const bigNumber = BigNumber.fromHex(exampleHex);
```

#### Method fromJSON

Creates a BigNumber from a JSON-serialized string.

```ts
static fromJSON(str: string): BigNumber 
```

Returns

Returns a BigNumber created from the JSON input string.

Argument Details

+ **str**
  + The JSON-serialized string to create a BigNumber from.

Example

```ts
const serialized = '{"type":"BigNumber","hex":"a1b2c3"}';
const bigNumber = BigNumber.fromJSON(serialized);
```

#### Method fromNumber

Creates a BigNumber from a number.

```ts
static fromNumber(n: number): BigNumber 
```

Returns

Returns a BigNumber equivalent to the input number.

Argument Details

+ **n**
  + The number to create a BigNumber from.

Example

```ts
const number = 1234;
const bigNumber = BigNumber.fromNumber(number);
```

#### Method fromRed

Converts a BigNumber from a reduction context, making sure the number is indeed in a reduction context.
Throws an error in case the number is not in a reduction context.

```ts
fromRed(): BigNumber 
```

Returns

Returns the BigNumber out of the ReductionContext.

Example

```ts
let bigNum = new BigNumber(10);
let redCtx = new ReductionContext();
bigNum.toRed(redCtx);
bigNum.fromRed();
```

#### Method fromScriptNum

Creates a BigNumber from the format used in Bitcoin scripts.

```ts
static fromScriptNum(num: number[], requireMinimal?: boolean, maxNumSize?: number): BigNumber 
```

Returns

Returns a BigNumber equivalent to the number used in a Bitcoin script.

Argument Details

+ **num**
  + The number in the format used in Bitcoin scripts.
+ **requireMinimal**
  + If true, non-minimally encoded values will throw an error.
+ **maxNumSize**
  + The maximum allowed size for the number. If not provided, defaults to 4.

Throws

Will throw an error if `requireMinimal` is `true` and the value is non-minimally encoded. Will throw an error if number length is greater than `maxNumSize`.

Example

```ts
const num = [0x02, 0x01]
const bigNumber = BigNumber.fromScriptNum(num, true, 5)
```

#### Method fromSm

Creates a BigNumber from a signed magnitude number.

```ts
static fromSm(num: number[], endian: "big" | "little" = "big"): BigNumber 
```

Returns

Returns a BigNumber equivalent to the signed magnitude number interpreted with specified endianess.

Argument Details

+ **num**
  + The signed magnitude number to convert to a BigNumber.
+ **endian**
  + Defines endianess. If not provided, big endian is assumed.

Example

```ts
const num = [0x81]
const bigNumber = BigNumber.fromSm(num, { endian: 'little' }); // equivalent to BigNumber from '-1'
```

#### Method fromString

Creates a BigNumber from a string, considering an optional base.

```ts
static fromString(str: string, base?: number | "hex"): BigNumber 
```

Returns

Returns a BigNumber equivalent to the string after conversion from the specified base.

Argument Details

+ **str**
  + The string to create a BigNumber from.
+ **base**
  + The base used for conversion. If not provided, base 10 is assumed.

Example

```ts
const str = '1234';
const bigNumber = BigNumber.fromString(str, 16);
```

#### Method fromTwos

Converts this big number from two's complement with a specified bit width.

```ts
fromTwos(width: number): BigNumber 
```

Returns

Returns the big number converted from two's complement.

Argument Details

+ **width**
  + The bit width.

Example

```ts
const BigNumber = require("./BigNumber");
const bn = new BigNumber('-1234');
const fromTwos = bn.fromTwos(16);
```

#### Method gcd

Computes and returns the greatest common divisor (GCD) of this BigNumber and the provided BigNumber.

```ts
gcd(num: BigNumber): BigNumber 
```

Returns

The GCD of this BigNumber and the provided BigNumber.

Argument Details

+ **num**
  + The BigNumber with which to compute the GCD.

Example

```ts
let a = new BigNumber(48);
let b = new BigNumber(18);
let gcd = a.gcd(b);
```

#### Method gt

Checks if this BigNumber instance is greater than another BigNumber.

```ts
gt(num: BigNumber): boolean 
```

Returns

Returns true if this BigNumber is greater than the other BigNumber, false otherwise.

Argument Details

+ **num**
  + The BigNumber to compare with.

Example

```ts
let bigNumber1 = new BigNumber('2345');
let bigNumber2 = new BigNumber('1234');
let isGreater = bigNumber1.gt(bigNumber2); // Returns true
```

#### Method gte

Checks if this BigNumber instance is greater than or equal to another BigNumber.

```ts
gte(num: BigNumber): boolean 
```

Returns

Returns true if this BigNumber is greater than or equal to the other BigNumber, false otherwise.

Argument Details

+ **num**
  + The BigNumber to compare with.

Example

```ts
let bigNumber1 = new BigNumber('1234');
let bigNumber2 = new BigNumber('1234');
let isGreaterOrEqual = bigNumber1.gte(bigNumber2); // Returns true
```

#### Method gten

Checks if this BigNumber instance is greater than or equal to a number.

```ts
gten(num: number): boolean 
```

Returns

Returns true if this BigNumber is greater than or equal to the number, false otherwise.

Argument Details

+ **num**
  + The number to compare with.

Example

```ts
let bigNumber = new BigNumber('1234');
let isGreaterOrEqual = bigNumber.gten(1234); // Returns true
```

#### Method gtn

Checks if this BigNumber instance is greater than a number.

```ts
gtn(num: number): boolean 
```

Returns

Returns true if this BigNumber is greater than the number, false otherwise.

Argument Details

+ **num**
  + The number to compare with.

Example

```ts
let bigNumber = new BigNumber('2345');
let isGreater = bigNumber.gtn(1234); // Returns true
```

#### Method iabs

Performs an in-place operation to make the BigNumber an absolute value.

```ts
iabs(): BigNumber 
```

Returns

Returns the BigNumber as an absolute value.

Example

```ts
const myNumber = new BigNumber(-50);
myNumber.iabs(); // myNumber becomes 50.
```

#### Method iadd

Add `num` to `this` BigNumber in-place.

```ts
iadd(num: BigNumber): BigNumber 
```

Returns

Returns the BigNumber after performing the addition.

Argument Details

+ **num**
  + The BigNumber to add to `this` BigNumber.

Example

```ts
const num1 = new BigNumber('10');
num1.iadd(new BigNumber('20'));
console.log(num1.toString());
```

#### Method iaddn

Performs an in-place addition of a plain number to the BigNumber.

```ts
iaddn(num: number): BigNumber 
```

Returns

Returns the BigNumber after the addition.

Argument Details

+ **num**
  + The plain number to add.

Throws

Will throw an error if num is not a number or is larger than 0x4000000.

Example

```ts
const myNumber = new BigNumber(50);
myNumber.iaddn(2); // myNumber becomes 52.
```

#### Method iand

Performs an in-place operation that does a bitwise AND operation in-place,
on the current instance and given BigNumber such that it modifies the current
instance only if neither operand is negative. This method is similar to the iuand method but
checks for negative values before operation.

```ts
iand(num: BigNumber): BigNumber 
```

Returns

Returns the current BigNumber instance after performing the bitwise AND operation.

Argument Details

+ **num**
  + The BigNumber to perform the bitwise AND operation with.

Example

```ts
const num1 = new BigNumber('10');
const num2 = new BigNumber('20');
console.log(num1.iand(num2).toString());
```

#### Method idivn

Performs an in-place division of a `BigNumber` by a primitive number.

```ts
idivn(num: number): BigNumber 
```

Returns

The `BigNumber` itself after being divided.
Note: 'in-place' means that this operation modifies the original `BigNumber`.

Argument Details

+ **num**
  + The divisor primitive number.

Example

```ts
const bigNum = new BigNumber('100');
const num = 45;
bigNum.idivn(num); // the bigNum here directly becomes '2'
```

#### Method imaskn

Performs an in-place operation to keep only the lower bits of the number.

```ts
imaskn(bits): BigNumber 
```

Returns

Returns the BigNumber with only the specified lower bits.

Argument Details

+ **bits**
  + The number of lower bits to keep.

Throws

Will throw an error if bits is not a positive number.

Will throw an error if initial BigNumber is negative as imaskn only works with positive numbers.

Example

```ts
const myNumber = new BigNumber(52);
myNumber.imaskn(2); // myNumber becomes 0 because lower 2 bits of 52 (110100) are 00.
```

#### Method imul

Performs an in-place multiplication of the BigNumber instance by a given BigNumber.

```ts
imul(num: BigNumber): BigNumber 
```

Returns

The BigNumber itself after the multiplication.

Argument Details

+ **num**
  + The BigNumber to multiply with.

Example

```ts
const bn1 = new BigNumber('12345');
const bn2 = new BigNumber('23456');
bn1.imul(bn2);
```

#### Method imuln

Performs an in-place multiplication of the BigNumber instance by a number.
This method asserts the input to be a number less than 0x4000000 to prevent overflowing.
If negavtive number is provided, the resulting BigNumber will be inversely negative.

```ts
imuln(num: number): BigNumber 
```

Returns

The BigNumber itself after the multiplication.

Argument Details

+ **num**
  + The number to multiply with.

Example

```ts
const bn = new BigNumber('12345');
bn.imuln(23456);
```

#### Method ineg

Negates the big number in-place.

```ts
ineg(): BigNumber 
```

Returns

Returns this big number as the negation of itself.

Example

```ts
const BigNumber = require("./BigNumber");
const bn = new BigNumber('1234');
bn.ineg(); // bn is now -1234
```

#### Method inotn

In-place method that performs a bitwise NOT operation on a BigNumber up to a specified bit width.

```ts
inotn(width: number): BigNumber 
```

Returns

Returns the BigNumber after performing the bitwise NOT operation.

Argument Details

+ **width**
  + The number of bits to perform the NOT operation on.

Example

```ts
const num = new BigNumber('42');
num.inotn(10);
console.log(num.toString());
```

#### Method inspect

Utility for inspecting the current BigNumber instance. Accompanied with a prefix '<BN: ' or '<BN-R: '.

```ts
inspect(): string 
```

Returns

A string representation to inspect the BigNumber instance.

Example

```ts
const bn = new BigNumber('123456', 10, 'be');
bn.inspect();
```

#### Method invm

Computes and returns the modular multiplicative inverse of this BigNumber in the field defined by the provided BigNumber.

```ts
invm(num: BigNumber): BigNumber 
```

Returns

The modular multiplicative inverse of this BigNumber.

Argument Details

+ **num**
  + The BigNumber that defines the field.

Example

```ts
let a = new BigNumber(3);
let field = new BigNumber(7);
let inverse = a.invm(field);
```

#### Method ior

Performs a bitwise OR operation with another BigNumber, considering
that neither of the numbers can be negative. Stores the result in this BigNumber.

```ts
ior(num: BigNumber): BigNumber 
```

Returns

Returns this BigNumber after performing the bitwise OR operation.

Argument Details

+ **num**
  + The other BigNumber.

Example

```ts
const BigNumber = require("./BigNumber");
const bn1 = new BigNumber('10'); // binary: 1010
const bn2 = new BigNumber('6'); // binary: 0110
bn1.ior(bn2); // now, bn1 binary: 1110
```

#### Method isBN

Checks whether a value is an instance of BigNumber. If not, then checks the features of the input to determine potential compatibility. Regular JS numbers fail this check.

```ts
static isBN(num: any): boolean 
```

Returns

- Returns a boolean value determining whether or not the checked num parameter is a BigNumber.

Argument Details

+ **num**
  + The value to be checked.

Example

```ts
const validNum = new BigNumber(5);
BigNumber.isBN(validNum); // returns true

const invalidNum = 5;
BigNumber.isBN(invalidNum); // returns false
```

#### Method isEven

Checks if this BigNumber is even.
An even number is an integer which is evenly divisible by two.

```ts
isEven(): boolean 
```

Returns

true if this BigNumber is even, else false.

Example

```ts
let a = new BigNumber(4);
let isEven = a.isEven(); // true
```

#### Method isNeg

Checks if the big number is negative.

```ts
isNeg(): boolean 
```

Returns

Returns true if the big number is negative, otherwise false.

Example

```ts
const BigNumber = require("./BigNumber");
const bn = new BigNumber('-1234');
const isNegative = bn.isNeg(); // true
```

#### Method isOdd

Checks if this BigNumber is Odd.
An odd number is an integer which is not evenly divisible by two.

```ts
isOdd(): boolean 
```

Returns

true if this BigNumber is Odd, else false.

Example

```ts
let a = new BigNumber(3);
let isOdd = a.isOdd(); // true
```

#### Method isZero

Checks if this BigNumber is Zero.
A BigNumber is zero if it only contains one word and that word is 0.

```ts
isZero(): boolean 
```

Returns

true if this BigNumber is Zero, else false.

Example

```ts
let a = new BigNumber(0);
let isZero = a.isZero(); // true
```

#### Method ishln

Performs an in-place left shift operation on the BigNumber instance only if it is non-negative.

```ts
ishln(bits: number): BigNumber 
```

Returns

The BigNumber instance after performing the shift operation.

Argument Details

+ **bits**
  + The number of positions to shift.

Example

```ts
let myNumber = new BigNumber(4);
myNumber.ishln(2); // Returns BigNumber of value 16
```

#### Method ishrn

Performs an in-place right shift operation on the BigNumber instance only if it is non-negative.

```ts
ishrn(bits, hint?, extended?): BigNumber 
```

Returns

The BigNumber instance after performing the shift operation.

Argument Details

+ **bits**
  + The number of positions to shift.
+ **hint**
  + Lowest bit before trailing zeroes.
+ **extended**
  + To be filled with the bits that are shifted out.

Example

```ts
let myNumber = new BigNumber(16);
myNumber.ishrn(2); // Returns BigNumber of value 4
```

#### Method isqr

Performs in-place multiplication of the BigNumber instance by itself.

```ts
isqr(): BigNumber 
```

Returns

The result of multiplying the BigNumber instance by itself.

Example

```ts
let myNumber = new BigNumber(4);
myNumber.isqr(); // Returns BigNumber of value 16
```

#### Method isub

Subtract `num` from `this` BigNumber in-place.

```ts
isub(num: BigNumber): BigNumber 
```

Returns

Returns the BigNumber after performing the subtraction.

Argument Details

+ **num**
  + The BigNumber to be subtracted from `this` BigNumber.

Example

```ts
const num1 = new BigNumber('20');
num1.isub(new BigNumber('10'));
console.log(num1.toString());
```

#### Method isubn

Performs an in-place subtraction of a plain number from the BigNumber.

```ts
isubn(num: number): BigNumber 
```

Returns

Returns the BigNumber after the subtraction.

Argument Details

+ **num**
  + The plain number to subtract.

Throws

Will throw an error if num is not a number or is larger than 0x4000000.

Example

```ts
const myNumber = new BigNumber(52);
myNumber.isubn(2); // myNumber becomes 50.
```

#### Method iuand

Performs a bitwise AND operation in-place(this method changes the calling object)
on the current instance and given BigNumber such that it modifies the current
instance and keeps the bits set in the result only if the corresponding bit is set
in both operands.

```ts
iuand(num: BigNumber): BigNumber 
```

Returns

Returns the current BigNumber instance after performing the bitwise AND operation.

Argument Details

+ **num**
  + The BigNumber to perform the bitwise AND operation with.

Example

```ts
const num1 = new BigNumber('10');
const num2 = new BigNumber('20');
console.log(num1.iuand(num2).toString());
```

#### Method iuor

Performs a bitwise OR operation with another BigNumber and stores
the result in this BigNumber.

```ts
iuor(num: BigNumber): BigNumber 
```

Returns

Returns this BigNumber after performing the bitwise OR operation.

Argument Details

+ **num**
  + The other BigNumber.

Example

```ts
const BigNumber = require("./BigNumber");
const bn1 = new BigNumber('10'); // binary: 1010
const bn2 = new(num: BigNumber): BigNumber BigNumber('6'); // binary: 0110
bn1.iuor(bn2); // now, bn1 binary: 1110
```

#### Method iushln

Performs in-place bitwise left shift operation on the BigNumber instance.

```ts
iushln(bits: number): BigNumber 
```

Returns

The BigNumber instance after performing the shift operation.

Argument Details

+ **bits**
  + The number of positions to shift.

Example

```ts
let myNumber = new BigNumber(4);
myNumber.iushln(2); // Returns BigNumber of value 16
```

#### Method iushrn

Performs an in-place unsigned bitwise right shift operation on the BigNumber instance.

```ts
iushrn(bits: number, hint?: number, extended?: BigNumber): BigNumber 
```

Returns

The BigNumber instance after performing the shift operation.

Argument Details

+ **bits**
  + The number of positions to shift.
+ **hint**
  + Lowest bit before trailing zeroes.
+ **extended**
  + To be filled with the bits that are shifted out.

Example

```ts
let myNumber = new BigNumber(16);
myNumber.iushrn(2); // Returns BigNumber of value 4
```

#### Method iuxor

Modifies the current instance by performing a bitwise XOR operation
in-place with the provided BigNumber. It keeps the bits set in the result only if the
corresponding bits in the operands are different.

```ts
iuxor(num: BigNumber): BigNumber 
```

Returns

Returns the current BigNumber instance after performing the bitwise XOR operation.

Argument Details

+ **num**
  + The BigNumber to perform the bitwise XOR operation with.

Example

```ts
const num1 = new BigNumber('10');
const num2 = new BigNumber('20');
console.log(num1.iuxor(num2).toString());
```

#### Method ixor

Performs an in-place operation that does a bitwise XOR operation in-place,
on the current instance and given BigNumber such that it modifies the current
instance only if neither operand is negative. This method is similar to the iuxor method but
checks for negative values before operation.

```ts
ixor(num: BigNumber): BigNumber 
```

Returns

Returns the current BigNumber instance after performing the bitwise XOR operation.

Argument Details

+ **num**
  + The BigNumber to perform the bitwise XOR operation with.

Example

```ts
const num1 = new BigNumber('10');
const num2 = new BigNumber('20');
console.log(num1.ixor(num2).toString());
```

#### Method lt

Checks if this BigNumber instance is less than another BigNumber.

```ts
lt(num: BigNumber): boolean 
```

Returns

Returns true if this BigNumber is less than the other BigNumber, false otherwise.

Argument Details

+ **num**
  + The BigNumber to compare with.

Example

```ts
let bigNumber1 = new BigNumber('1234');
let bigNumber2 = new BigNumber('2345');
let isLess = bigNumber1.lt(bigNumber2); // Returns true
```

#### Method lte

Checks if this BigNumber instance is less than or equal to another BigNumber.

```ts
lte(num: BigNumber): boolean 
```

Returns

Returns true if this BigNumber is less than or equal to the other BigNumber, false otherwise.

Argument Details

+ **num**
  + The BigNumber to compare with.

Example

```ts
let bigNumber1 = new BigNumber('2345');
let bigNumber2 = new BigNumber('2345');
let isLessOrEqual = bigNumber1.lte(bigNumber2); // Returns true
```

#### Method lten

Checks if this BigNumber instance is less than or equal to a number.

```ts
lten(num: number): boolean 
```

Returns

Returns true if this BigNumber is less than or equal to the number, false otherwise.

Argument Details

+ **num**
  + The number to compare with.

Example

```ts
let bigNumber = new BigNumber('2345');
let isLessOrEqual = bigNumber.lten(2345); // Returns true
```

#### Method ltn

Checks if this BigNumber instance is less than a number.

```ts
ltn(num: number): boolean 
```

Returns

Returns true if this BigNumber is less than the number, false otherwise.

Argument Details

+ **num**
  + The number to compare with.

Example

```ts
let bigNumber = new BigNumber('1234');
let isLess = bigNumber.ltn(2345); // Returns true
```

#### Method maskn

Returns a new BigNumber that keeps only the lower bits of the original number.

```ts
maskn(bits): BigNumber 
```

Returns

Returns a new BigNumber with only the specified lower bits of the original number.

Argument Details

+ **bits**
  + The number of lower bits to keep.

Example

```ts
const myNumber = new BigNumber(52);
const newNumber = myNumber.maskn(2); // newNumber becomes 0, myNumber doesn't change.
```

#### Method max

Returns the bigger value between two BigNumbers

```ts
static max(left: BigNumber, right: BigNumber): BigNumber 
```

Returns

- Returns the bigger BigNumber between left and right.

Argument Details

+ **left**
  + The first BigNumber to be compared.
+ **right**
  + The second BigNumber to be compared.

Example

```ts
const bn1 = new BigNumber(5);
const bn2 = new BigNumber(10);
BigNumber.max(bn1, bn2); // returns bn2
```

#### Method min

Returns the smaller value between two BigNumbers

```ts
static min(left: BigNumber, right: BigNumber): BigNumber 
```

Returns

- Returns the smaller value between left and right.

Argument Details

+ **left**
  + The first BigNumber to be compared.
+ **right**
  + The second BigNumber to be compared.

Example

```ts
const bn1 = new BigNumber(5);
const bn2 = new BigNumber(10);
BigNumber.min(bn1, bn2); // returns bn1
```

#### Method mod

Returns the remainder after division of one `BigNumber` by another `BigNumber`.

```ts
mod(num: BigNumber): BigNumber 
```

Returns

The remainder `BigNumber` after division.

Argument Details

+ **num**
  + The divisor `BigNumber`.

Example

```ts
const bigNum1 = new BigNumber('100');
const bigNum2 = new BigNumber('45');
const remainder = bigNum1.mod(bigNum2); // remainder here would be '10'
```

#### Method modrn

Returns the remainder after division of a `BigNumber` by a primitive number.

```ts
modrn(num: number): number 
```

Returns

The remainder number after division.

Argument Details

+ **num**
  + The divisor primitive number.

Example

```ts
const bigNum = new BigNumber('100');
const num = 45;
const remainder = bigNum.modrn(num); // remainder here would be '10'
```

#### Method move


Directly transfers the attributes of the source BigNumber to the destination BigNumber.

```ts
static move(dest: BigNumber, src: BigNumber): void 
```

Argument Details

+ **dest**
  + The BigNumber that attributes will be moved into.
+ **src**
  + The BigNumber that attributes will be moved from.

Example

```ts
const src = new BigNumber('123456', 10, 'be');
const dest = new BigNumber();
BigNumber.move(dest, src);
// dest is now a BigNumber representing 123456
```

#### Method mul

Performs multiplication between the BigNumber instance and a given BigNumber.
It creates a new BigNumber to store the result.

```ts
mul(num: BigNumber): BigNumber 
```

Returns

The BigNumber resulting from the multiplication operation.

Argument Details

+ **num**
  + The BigNumber to multiply with.

Example

```ts
const bn1 = new BigNumber('12345');
const bn2 = new BigNumber('23456');
const result = bn1.mul(bn2);
```

#### Method mulTo

Performs multiplication between the BigNumber instance and a given BigNumber.
It chooses the multiplication method based on the lengths of the numbers to optimize execution time.

```ts
mulTo(num: BigNumber, out: BigNumber): BigNumber 
```

Returns

The BigNumber resulting from the multiplication operation.

Argument Details

+ **num**
  + The BigNumber multiply with.
+ **out**
  + The BigNumber where to store the result.

Example

```ts
const bn1 = new BigNumber('12345');
const bn2 = new BigNumber('23456');
const output = new BigNumber();
bn1.mulTo(bn2, output);
```

#### Method muln

Performs multiplication between the BigNumber instance and a number.
It performs the multiplication operation in-place to a cloned BigNumber.

```ts
muln(num: number): BigNumber 
```

Returns

The resulting BigNumber from the multiplication operation.

Argument Details

+ **num**
  + The number to multiply with.

Example

```ts
const bn = new BigNumber('12345');
const result = bn.muln(23456);
```

#### Method neg

Negates the big number and returns a new instance.

```ts
neg(): BigNumber 
```

Returns

Returns a new BigNumber that is the negation of this big number.

Example

```ts
const BigNumber = require("./BigNumber");
const bn = new BigNumber('1234');
const neg = bn.neg(); // -1234
```

#### Method normSign

Normalizes the sign of the BigNumber. Changes -0 to 0.

```ts
normSign(): BigNumber 
```

Returns

The normalized BigNumber instance.

Example

```ts
const bn = new BigNumber('-0', 10, 'be');
bn.normSign();
```

#### Method notn

Performs a bitwise NOT operation on a BigNumber up to a specified bit width. Returns a new BigNumber.

```ts
notn(width: number): BigNumber 
```

Returns

Returns a new BigNumber resulting from the bitwise NOT operation.

Argument Details

+ **width**
  + The number of bits to perform the NOT operation on.

Example

```ts
const num = new BigNumber('42');
const notnResult = num.notn(10);
console.log(notnResult.toString());
```

#### Method or

Performs a bitwise OR operation on the current instance and given
BigNumber and returns a new BigNumber, in such a way that if either
the corresponding bit in the first operand or the second operand is
1, then the output is also 1.

```ts
or(num: BigNumber): BigNumber 
```

Returns

Returns a new BigNumber resulting from the bitwise OR operation.

Argument Details

+ **num**
  + The BigNumber to perform the bitwise OR operation with.

Example

```ts
const num1 = new BigNumber('10');
const num2 = new BigNumber('20');
console.log(num1.or(num2).toString());
```

#### Method pow

Raises the BigNumber instance to the power of the specified BigNumber.

```ts
pow(num: BigNumber): BigNumber 
```

Returns

The result of raising the BigNumber instance to the power of num.

Argument Details

+ **num**
  + The exponent to raise the BigNumber instance to.

Example

```ts
let base = new BigNumber(2);
let exponent = new BigNumber(3);
base.pow(exponent); // Returns BigNumber of value 8
```

#### Method redAdd

Performs addition operation of the current BigNumber with the given number in a reduction context.
Throws an error in case the number is not in a reduction context.

```ts
redAdd(num: BigNumber): BigNumber 
```

Returns

Returns a new BigNumber that's the sum of the current BigNumber and the provided number in the reduction context.

Argument Details

+ **num**
  + The number to add to the current BigNumber.

Example

```ts
let bigNum = new BigNumber(10);
let redCtx = new ReductionContext();
bigNum.toRed(redCtx);
bigNum.redAdd(new BigNumber(20)); // returns a BigNumber of 30 in reduction context
```

#### Method redIAdd

Performs in-place addition operation of the current BigNumber with the given number in a reduction context.
Throws an error in case the number is not in a reduction context.

```ts
redIAdd(num: BigNumber): BigNumber 
```

Returns

Returns the modified current BigNumber after adding the provided number in the reduction context.

Argument Details

+ **num**
  + The number to add to the current BigNumber.

Example

```ts
let bigNum = new BigNumber(10);
let redCtx = new ReductionContext();
bigNum.toRed(redCtx);
bigNum.redIAdd(new BigNumber(20)); // modifies the bigNum to 30 in reduction context
```

#### Method redIMul

Performs an in-place multiplication of this BigNumber instance with another BigNumber within a reduction context.
Expects that this BigNumber is within the reduction context i.e., it has been reduced.

```ts
redIMul(num: BigNumber): BigNumber 
```

Returns

A BigNumber that is the result of the in-place multiplication operation, within the reduction context.

Argument Details

+ **num**
  + The BigNumber to multiply with the current BigNumber.

Example

```ts
let bigNum1 = new BigNumber('10').toRed(someRed);
let bigNum2 = new BigNumber('5');
bigNum1.redIMul(bigNum2);
```

#### Method redISqr

In-place square of a "red" (reduced) BigNumber.
This function squares the calling BigNumber and overwrites it with the result.
It only works if the number is "reduced". A number is considered reduced
if it has a `red` field that points to a reduction context object.

```ts
redISqr(): BigNumber 
```

Returns

This BigNumber squared in place

Throws

If the BigNumber is not reduced

Example

```ts
const num = new BigNumber('25').toRed(someRed);
num.redISqr();
console.log(num.toString()); // Outputs: '625' mod the red value
```

#### Method redISub

Performs in-place subtraction operation of the current BigNumber with the given number in a reduction context.
Throws an error in case the number is not in a reduction context.

```ts
redISub(num: BigNumber): BigNumber 
```

Returns

Returns the modified current BigNumber after subtracting the provided number in the reduction context.

Argument Details

+ **num**
  + The number to subtract from the current BigNumber.

Example

```ts
let bigNum = new BigNumber(30);
let redCtx = new ReductionContext();
bigNum.toRed(redCtx);
bigNum.redISub(new BigNumber(20)); // modifies the bigNum to 10 in reduction context
```

#### Method redInvm

Find multiplicative inverse (reciprocal) in respect to reduction context.
The method works only on numbers that have a reduction context set.

```ts
redInvm(): BigNumber 
```

Returns

Returns a BigNumber that is multiplicative inverse in respect to the reduction context.

Throws

Will throw an error if this number does not have a reduction context.

Example

```ts
let a = new BigNumber('2345', 16);
a.red = someReductionContext;
let aInverse = a.redInvm();
```

#### Method redMul

Performs multiplication operation of the current BigNumber with the given number in a reduction context.
Throws an error in case the number is not in a reduction context.

```ts
redMul(num: BigNumber): BigNumber 
```

Returns

Returns a new BigNumber that's the product of the current BigNumber and the provided number in the reduction context.

Argument Details

+ **num**
  + The number to multiply with the current BigNumber.

Example

```ts
let bigNum = new BigNumber(10);
let redCtx = new ReductionContext();
bigNum.toRed(redCtx);
bigNum.redMul(new BigNumber(20)); // returns a BigNumber of 200 in reduction context
```

#### Method redNeg

Find negative version of this number in respect to reduction context.
The method works only on numbers that have a reduction context set.

```ts
redNeg(): BigNumber 
```

Returns

Returns a BigNumber that is the negative version of this number in respect to the reduction context.

Throws

Will throw an error if this number does not have a reduction context.

Example

```ts
let a = new BigNumber('2345', 16);
a.red = someReductionContext;
let aNeg = a.redNeg();
```

#### Method redPow

Raises this number to the power of 'num', in respect to reduction context.
Note that 'num' must not have a reduction context set.

```ts
redPow(num: BigNumber): BigNumber 
```

Returns

Returns a BigNumber that is this number raised to the power of 'num', in respect to the reduction context.

Argument Details

+ **num**
  + The exponent to raise this number to.

Throws

Will throw an error if this number does not have a reduction context or 'num' has a reduction context.

Example

```ts
let a = new BigNumber(3);
a.red = someReductionContext;
let b = new BigNumber(3);
let result = a.redPow(b);  // equivalent to (a^b) mod red
```

#### Method redShl

Performs the shift left operation on the current BigNumber in the reduction context.
Throws an error in case the number is not in a reduction context.

```ts
redShl(num: number): BigNumber 
```

Returns

Returns a new BigNumber after performing the shift left operation on the current BigNumber in the reduction context.

Argument Details

+ **num**
  + The positions to shift left the current BigNumber.

Example

```ts
let bigNum = new BigNumber(1);
let redCtx = new ReductionContext();
bigNum.toRed(redCtx);
bigNum.redShl(2); // returns a BigNumber of 4 in reduction context
```

#### Method redSqr

Square of a "red" (reduced) BigNumber.
This function squares the calling BigNumber and returns the result.
It only works if the number is "reduced". A number is considered reduced
if it has a `red` field that points to a reduction context object.

```ts
redSqr(): BigNumber 
```

Returns

The square of the BigNumber

Throws

If the BigNumber is not reduced

Example

```ts
const num = new BigNumber('25').toRed(someRed);
const result = num.redSqr();
console.log(result.toString()); // Outputs: '625' mod the red value
```

#### Method redSqrt

Square root of a "red" (reduced) BigNumber.
This function calculates the square root of the calling BigNumber
and returns the result. It only works if the number is "reduced".
A number is considered reduced if it has a `red`
field that points to a reduction context object.

```ts
redSqrt(): BigNumber 
```

Returns

The square root of the BigNumber

Throws

If the BigNumber is not reduced

Example

```ts
const num = new BigNumber('4').toRed(someRed);
const result = num.redSqrt();
console.log(result.toString()); // Outputs: '2' mod the red value
```

#### Method redSub

Performs subtraction operation of the current BigNumber with the given number in a reduction context.
Throws an error in case the number is not in a reduction context.

```ts
redSub(num: BigNumber): BigNumber 
```

Returns

Returns a new BigNumber that's the subtraction result of the current BigNumber and the provided number in the reduction context.

Argument Details

+ **num**
  + The number to subtract from the current BigNumber.

Example

```ts
let bigNum = new BigNumber(30);
let redCtx = new ReductionContext();
bigNum.toRed(redCtx);
bigNum.redSub(new BigNumber(20)); // returns a BigNumber of 10 in reduction context
```

#### Method setn

Set `bit` of `this` BigNumber. The `bit` is a position in the binary representation,
and `val` is the value to be set at that position (`0` or `1`).

```ts
setn(bit: number, val: 0 | 1 | true | false): BigNumber 
```

Returns

Returns the BigNumber after setting the value at the bit position.

Argument Details

+ **bit**
  + The bit position to set.
+ **val**
  + The value to set at the bit position.

Example

```ts
const num = new BigNumber('42');
num.setn(2, 1);
console.log(num.toString());
```

#### Method shln

Performs a bitwise left shift operation on a clone of the BigNumber instance.

```ts
shln(bits): BigNumber 
```

Returns

A new BigNumber, which is the result of the shift operation.

Argument Details

+ **bits**
  + The number of positions to shift.

Example

```ts
let myNumber = new BigNumber(4);
let shiftedNumber = myNumber.shln(2);
console.log(shiftedNumber.toString()); // Outputs "16"
```

#### Method shrn

Performs a bitwise right shift operation on a clone of the BigNumber instance.

```ts
shrn(bits): BigNumber 
```

Returns

A new BigNumber resulting from the shift operation.

Argument Details

+ **bits**
  + The number of bits to shift.

Example

```ts
let myNumber = new BigNumber(16);
let shiftedNumber = myNumber.shrn(3);
console.log(shiftedNumber.toString()); // Outputs "2"
```

#### Method sqr

Squares the BigNumber instance.

```ts
sqr(): BigNumber 
```

Returns

The BigNumber squared.

Example

```ts
const bn = new BigNumber('12345');
const result = bn.sqr();
```

#### Method strip

Removes leading zeros.

```ts
strip(): BigNumber 
```

Returns

- Returns the BigNumber after stripping leading zeros.

Example

```ts
const bn = new BigNumber("000000", 2, "be");
bn.strip();
// bn now represents 0
```

#### Method sub

Subtract `num` from `this` BigNumber.

```ts
sub(num: BigNumber): BigNumber 
```

Returns

Returns a new BigNumber which is the result of the subtraction.

Argument Details

+ **num**
  + The BigNumber to be subtracted from `this` BigNumber.

Example

```ts
const num1 = new BigNumber('20');
const subResult = num1.sub(new BigNumber('10'));
console.log(subResult.toString());
```

#### Method subn

Returns a new BigNumber that is the result of subtracting a plain number from the original BigNumber.

```ts
subn(num: number): BigNumber 
```

Returns

Returns a new BigNumber which is the difference of the original BigNumber and the plain number.

Argument Details

+ **num**
  + The plain number to subtract.

Example

```ts
const myNumber = new BigNumber(52);
const newNumber = myNumber.subn(2);  // newNumber becomes 50, myNumber doesn't change.
```

#### Method testn

Tests if the nth bit of the BigNumber is set.

```ts
testn(bit: number): boolean 
```

Returns

A boolean indicating whether the nth bit is set.

Argument Details

+ **bit**
  + The position of the bit to test.

Example

```ts
let myNumber = new BigNumber(10); // 1010 in binary
myNumber.testn(1); // Returns true (indicating that the second bit from right is set)
```

#### Method toArray

Converts the BigNumber instance to a JavaScript number array.

```ts
toArray(endian: "le" | "be" = "be", length?: number): number[] 
```

Returns

The JavaScript array representation of the BigNumber instance.

Argument Details

+ **endian**
  + The endian for converting BigNumber to array. Default value is 'be'.
+ **length**
  + The length for the resultant array. Default value is undefined.

Example

```ts
const bn = new BigNumber('123456', 10, 'be');
bn.toArray('be', 8);
```

#### Method toBitArray

Convert a big number to a boolean array representing
a binary number, where each array index is a bit.

```ts
static toBitArray(num: BigNumber): Array<0 | 1> 
```

Returns

Returns an array of booleans representing
a binary number, with each array index being a bit.

Argument Details

+ **num**
  + The big number to convert.

Example

```ts
const BigNumber = require("./BigNumber");
const bn = new BigNumber('6'); // binary: 110
const bits = BigNumber.toBitArray(bn); // [1,1,0]
```

#### Method toBitArray

Convert this big number to a boolean array representing
a binary number, where each array index is a bit.

```ts
toBitArray(): Array<0 | 1> 
```

Returns

Returns an array of booleans representing a binary number.

Example

```ts
const BigNumber = require("./BigNumber");
const bn = new BigNumber('6'); // binary: 110
const bits = bn.toBitArray(); // [ 1, 1, 0 ]
```

#### Method toBits

Converts this BigNumber to a number representing the "bits" value in a block header.

```ts
toBits(): number 
```

Returns

Returns a number equivalent to the "bits" value in a block header.

Example

```ts
const bigNumber = new BigNumber(1);
const bits = bigNumber.toBits();
```

#### Method toHex

Converts this BigNumber to a hexadecimal string.

```ts
toHex(length: number = 0): string 
```

Returns

Returns a string representing the hexadecimal value of this BigNumber.

Argument Details

+ **length**
  + The minimum length of the hex string

Example

```ts
const bigNumber = new BigNumber(255);
const hex = bigNumber.toHex();
```

#### Method toJSON

Converts the BigNumber instance to a JSON-formatted string.

```ts
toJSON(): string 
```

Returns

The JSON string representation of the BigNumber instance.

Example

```ts
const bn = new BigNumber('123456', 10, 'be');
bn.toJSON();
```

#### Method toNumber

Converts the BigNumber instance to a JavaScript number.
Please note that JavaScript numbers are only precise up to 53 bits.

```ts
toNumber(): number 
```

Returns

The JavaScript number representation of the BigNumber instance.

Throws

If the BigNumber instance cannot be safely stored in a JavaScript number

Example

```ts
const bn = new BigNumber('123456', 10, 'be');
bn.toNumber();
```

#### Method toRed

Converts a BigNumber to a reduction context ensuring the number is a positive integer and is not already in a reduction context.
Throws an error in case the number is either negative or already in a reduction context.

```ts
toRed(ctx: ReductionContext): BigNumber 
```

Returns

Returns the BigNumber in the given ReductionContext.

Argument Details

+ **ctx**
  + The ReductionContext to convert the BigNumber to.

Example

```ts
let bigNum = new BigNumber(10);
let redCtx = new ReductionContext();
bigNum.toRed(redCtx);
```

#### Method toScriptNum

Converts this BigNumber to a number in the format used in Bitcoin scripts.

```ts
toScriptNum(): number[] 
```

Returns

Returns the equivalent to this BigNumber as a Bitcoin script number.

Example

```ts
const bigNumber = new BigNumber(258)
const num = bigNumber.toScriptNum() // equivalent to bigNumber.toSm('little')
```

#### Method toSm

Converts this BigNumber to a signed magnitude number.

```ts
toSm(endian: "big" | "little" = "big"): number[] 
```

Returns

Returns an array equivalent to this BigNumber interpreted as a signed magnitude with specified endianess.

Argument Details

+ **endian**
  + Defines endianess. If not provided, big endian is assumed.

Example

```ts
const bigNumber = new BigNumber(-1);
const num = bigNumber.toSm('little'); // [0x81]
```

#### Method toString

function toString() { [native code] }

Converts the BigNumber instance to a string representation.

```ts
toString(base: number | "hex" = 10, padding: number = 1): string 
```

Returns

The string representation of the BigNumber instance

Argument Details

+ **base**
  + The base for representing number. Default is 10. Other accepted values are 16 and 'hex'.
+ **padding**
  + Represents the minimum number of digits to represent the BigNumber as a string. Default is 1.

Throws

If base is not between 2 and 36.

Example

```ts
const bn = new BigNumber('123456', 10, 'be');
bn.toString(16); // Converts the BigNumber to a hexadecimal string.
```

#### Method toTwos

Converts this big number to two's complement with a specified bit width.

```ts
toTwos(width: number): BigNumber 
```

Returns

Returns the two's complement of the big number.

Argument Details

+ **width**
  + The bit width.

Example

```ts
const BigNumber = require("./BigNumber");
const bn = new BigNumber('-1234');
const twosComp = bn.toTwos(16);
```

#### Method uand

Performs a bitwise AND operation without considering signed bit
(no negative values) which returns a new BigNumber, similar to the `and` method.

```ts
uand(num: BigNumber): BigNumber 
```

Returns

Returns new BigNumber resulting from the bitwise AND operation without sign consideration.

Argument Details

+ **num**
  + The BigNumber to perform the bitwise AND operation with.

Example

```ts
const num1 = new BigNumber('10');
const num2 = new BigNumber('20');
console.log(num1.uand(num2).toString());
```

#### Method ucmp

Performs an unsigned comparison between this BigNumber instance and another.

```ts
ucmp(num: BigNumber): 1 | 0 | -1 
```

Returns

Returns 1 if this BigNumber is bigger, -1 if it is smaller, and 0 if they are equal.

Argument Details

+ **num**
  + The BigNumber instance to compare with.

Example

```ts
let bigNumber1 = new BigNumber('1234');
let bigNumber2 = new BigNumber('2345');
let comparisonResult = bigNumber1.ucmp(bigNumber2); // Returns -1
```

#### Method umod

Returns the remainder after unsigned division of one `BigNumber` by another `BigNumber`.

```ts
umod(num: BigNumber): BigNumber 
```

Returns

The remainder `BigNumber` after unsigned division.
Note: Here 'unsigned division' means that signs of the numbers are ignored.

Argument Details

+ **num**
  + The divisor `BigNumber`.

Example

```ts
const bigNum1 = new BigNumber('-100');
const bigNum2 = new BigNumber('45');
const remainder = bigNum1.umod(bigNum2); // remainder here would be '10' as signs are ignored.
```

#### Method uor

Performs a bitwise OR operation on the current instance and given
BigNumber without considering signed bit(no negative values) and returns a new BigNumber,
similar to the `or` method.

```ts
uor(num: BigNumber): BigNumber 
```

Returns

Returns a new BigNumber resulting from the bitwise OR operation without sign consideration.

Argument Details

+ **num**
  + The BigNumber to perform the bitwise OR operation with.

Example

```ts
const num1 = new BigNumber('10');
const num2 = new BigNumber('20');
console.log(num1.uor(num2).toString());
```

#### Method ushln

Performs an unsigned bitwise shift left operation on a clone of the BigNumber instance.

```ts
ushln(bits): BigNumber 
```

Returns

A new BigNumber resulting from the shift operation.

Argument Details

+ **bits**
  + The number of bits to shift.

Example

```ts
let myNumber = new BigNumber(4);
let shiftedNumber = myNumber.ushln(2);
console.log(shiftedNumber.toString()); // Outputs "16"
```

#### Method ushrn

Performs an unsigned bitwise shift right operation on a clone of the BigNumber instance.

```ts
ushrn(bits): BigNumber 
```

Returns

A new BigNumber resulting from the shift operation.

Argument Details

+ **bits**
  + The number of bits to shift.

Example

```ts
let myNumber = new BigNumber(20);
let shiftedNumber = myNumber.ushrn(2);
console.log(shiftedNumber.toString()); // Outputs "5"
```

#### Method uxor

Performs an unsigned XOR operation on this BigNumber with the supplied BigNumber. Returns a new BigNumber.

```ts
uxor(num: BigNumber): BigNumber 
```

Returns

Returns a new BigNumber resulting from the unsigned bitwise XOR operation.

Argument Details

+ **num**
  + The BigNumber with which the unsigned bitwise XOR operation is to be performed.

Example

```ts
const num1 = new BigNumber('30');
const num2 = new BigNumber('40');
console.log(num1.uxor(num2).toString()); // Output will be the result of unsigned XOR operation
```

#### Method xor

Performs a bitwise XOR operation which returns a new BigNumber, and keeps the bits
set in the result only if the corresponding bits in the operands are different.

```ts
xor(num: BigNumber): BigNumber 
```

Returns

Returns a new BigNumber resulting from the bitwise XOR operation.

Argument Details

+ **num**
  + The BigNumber to perform the bitwise XOR operation with.

Example

```ts
const num1 = new BigNumber('10');
const num2 = new BigNumber('20');
console.log(num1.xor(num2).toString());
```

#### Method zeroBits

Returns the number of trailing zero bits in the big number.

```ts
zeroBits(): number 
```

Returns

Returns the number of trailing zero bits
in the binary representation of the big number.

Example

```ts
const BigNumber = require("./BigNumber");
const bn = new BigNumber('8'); // binary: 1000
const zeroBits = bn.zeroBits(); // 3
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: MontgomoryMethod

Represents a Montgomery reduction context, which is a mathematical method
for performing modular multiplication without division.

Montgomery reduction is an algorithm used mainly in cryptography which can
help to speed up calculations in contexts where there are many repeated
computations.

This class extends the `ReductionContext` class.

```ts
export default class MontgomoryMethod extends ReductionContext {
    shift: number;
    r: BigNumber;
    r2: BigNumber;
    rinv: BigNumber;
    minv: BigNumber;
    constructor(m: BigNumber | "k256") 
    convertTo(num: BigNumber): BigNumber 
    convertFrom(num: BigNumber): BigNumber 
    imul(a: BigNumber, b: BigNumber): BigNumber 
    mul(a: BigNumber, b: BigNumber): BigNumber 
    invm(a: BigNumber): BigNumber 
}
```

<details>

<summary>Class MontgomoryMethod Details</summary>

#### Constructor

```ts
constructor(m: BigNumber | "k256") 
```

Argument Details

+ **m**
  + The modulus to be used for the Montgomery method reductions.

#### Property minv

The modular multiplicative inverse of `m` mod `r`.

```ts
minv: BigNumber
```

#### Property r

The 2^shift, shifted left by the bit length of modulus `m`.

```ts
r: BigNumber
```

#### Property r2

The square of `r` modulo `m`.

```ts
r2: BigNumber
```

#### Property rinv

The modular multiplicative inverse of `r` mod `m`.

```ts
rinv: BigNumber
```

#### Property shift

The number of bits in the modulus.

```ts
shift: number
```

#### Method convertFrom

Converts a number from the Montgomery domain back to the original domain.

```ts
convertFrom(num: BigNumber): BigNumber 
```

Returns

The result of the conversion from the Montgomery domain.

Argument Details

+ **num**
  + The number to be converted from the Montgomery domain.

Example

```ts
const montMethod = new MontgomoryMethod(m);
const convertedNum = montMethod.convertFrom(num);
```

#### Method convertTo

Converts a number into the Montgomery domain.

```ts
convertTo(num: BigNumber): BigNumber 
```

Returns

The result of the conversion into the Montgomery domain.

Argument Details

+ **num**
  + The number to be converted into the Montgomery domain.

Example

```ts
const montMethod = new MontgomoryMethod(m);
const convertedNum = montMethod.convertTo(num);
```

#### Method imul

Performs an in-place multiplication of two numbers in the Montgomery domain.

```ts
imul(a: BigNumber, b: BigNumber): BigNumber 
```

Returns

The result of the in-place multiplication.

Argument Details

+ **a**
  + The first number to multiply.
+ **b**
  + The second number to multiply.

Example

```ts
const montMethod = new MontgomoryMethod(m);
const product = montMethod.imul(a, b);
```

#### Method invm

Calculates the modular multiplicative inverse of a number in the Montgomery domain.

```ts
invm(a: BigNumber): BigNumber 
```

Returns

The modular multiplicative inverse of 'a'.

Argument Details

+ **a**
  + The number to compute the modular multiplicative inverse of.

Example

```ts
const montMethod = new MontgomoryMethod(m);
const inverse = montMethod.invm(a);
```

#### Method mul

Performs the multiplication of two numbers in the Montgomery domain.

```ts
mul(a: BigNumber, b: BigNumber): BigNumber 
```

Returns

The result of the multiplication.

Argument Details

+ **a**
  + The first number to multiply.
+ **b**
  + The second number to multiply.

Example

```ts
const montMethod = new MontgomoryMethod(m);
const product = montMethod.mul(a, b);
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: BasePoint

Base class for Point (affine coordinates) and JacobianPoint classes,
defining their curve and type.

```ts
export default abstract class BasePoint {
    curve: Curve;
    type: "affine" | "jacobian";
    precomputed: {
        doubles: {
            step: number;
            points: any[];
        } | undefined;
        naf: {
            wnd: any;
            points: any[];
        } | undefined;
        beta: BasePoint | null | undefined;
    } | null;
    constructor(type: "affine" | "jacobian") 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: JacobianPoint

The `JacobianPoint` class extends the `BasePoint` class for handling Jacobian coordinates on an Elliptic Curve.
This class defines the properties and the methods needed to work with points in Jacobian coordinates.

The Jacobian coordinates represent a point (x, y, z) on an Elliptic Curve such that the usual (x, y) coordinates are given by (x/z^2, y/z^3).

Example

```ts
const pointJ = new JacobianPoint('3', '4', '1');
```

```ts
export default class JacobianPoint extends BasePoint {
    x: BigNumber;
    y: BigNumber;
    z: BigNumber;
    zOne: boolean;
    constructor(x: string | BigNumber | null, y: string | BigNumber | null, z: string | BigNumber | null) 
    toP(): Point 
    neg(): JacobianPoint 
    add(p: JacobianPoint): JacobianPoint 
    mixedAdd(p: Point): JacobianPoint 
    dblp(pow: number): JacobianPoint 
    dbl(): JacobianPoint 
    eq(p: Point | JacobianPoint): boolean 
    eqXToP(x: BigNumber): boolean 
    inspect(): string 
    isInfinity(): boolean 
}
```

<details>

<summary>Class JacobianPoint Details</summary>

#### Constructor

Constructs a new `JacobianPoint` instance.

```ts
constructor(x: string | BigNumber | null, y: string | BigNumber | null, z: string | BigNumber | null) 
```

Argument Details

+ **x**
  + If `null`, the x-coordinate will default to the curve's defined 'one' constant.
If `x` is not a BigNumber, `x` will be converted to a `BigNumber` assuming it is a hex string.
+ **y**
  + If `null`, the y-coordinate will default to the curve's defined 'one' constant.
If `y` is not a BigNumber, `y` will be converted to a `BigNumber` assuming it is a hex string.
+ **z**
  + If `null`, the z-coordinate will default to 0.
If `z` is not a BigNumber, `z` will be converted to a `BigNumber` assuming it is a hex string.

Example

```ts
const pointJ1 = new JacobianPoint(null, null, null); // creates point at infinity
const pointJ2 = new JacobianPoint('3', '4', '1'); // creates point (3, 4, 1)
```

#### Property x

The `x` coordinate of the point in the Jacobian form.

```ts
x: BigNumber
```

#### Property y

The `y` coordinate of the point in the Jacobian form.

```ts
y: BigNumber
```

#### Property z

The `z` coordinate of the point in the Jacobian form.

```ts
z: BigNumber
```

#### Property zOne

Flag that indicates if the `z` coordinate is one.

```ts
zOne: boolean
```

#### Method add

Addition operation in the Jacobian coordinates. It takes a Jacobian point as an argument
and returns a new Jacobian point as a result of the addition. In the special cases,
when either one of the points is the point at infinity, it will return the other point.

```ts
add(p: JacobianPoint): JacobianPoint 
```

Returns

Returns a new Jacobian point as the result of the addition.

Argument Details

+ **p**
  + The Jacobian point to be added.

Example

```ts
const p1 = new JacobianPoint(x1, y1, z1)
const p2 = new JacobianPoint(x2, y2, z2)
const result = p1.add(p2)
```

#### Method dbl

Point doubling operation in the Jacobian coordinates. A special case is when the point is the point at infinity, in this case, this function will return the point itself.

```ts
dbl(): JacobianPoint 
```

Returns

Returns a new Jacobian point as the result of the doubling.

Example

```ts
const jp = new JacobianPoint(x, y, z)
const result = jp.dbl()
```

#### Method dblp

Multiple doubling operation. It doubles the Jacobian point as many times as the pow parameter specifies. If pow is 0 or the point is the point at infinity, it will return the point itself.

```ts
dblp(pow: number): JacobianPoint 
```

Returns

Returns a new Jacobian point as the result of multiple doublings.

Argument Details

+ **pow**
  + The number of times the point should be doubled.

Example

```ts
const jp = new JacobianPoint(x, y, z)
const result = jp.dblp(3)
```

#### Method eq

Equality check operation. It checks whether the affine or Jacobian point is equal to this Jacobian point.

```ts
eq(p: Point | JacobianPoint): boolean 
```

Returns

Returns true if the points are equal, otherwise returns false.

Argument Details

+ **p**
  + The affine or Jacobian point to compare with.

Example

```ts
const jp1 = new JacobianPoint(x1, y1, z1)
const jp2 = new JacobianPoint(x2, y2, z2)
const areEqual = jp1.eq(jp2)
```

#### Method eqXToP

Equality check operation in relation to an x coordinate of a point in projective coordinates.
It checks whether the x coordinate of the Jacobian point is equal to the provided x coordinate
of a point in projective coordinates.

```ts
eqXToP(x: BigNumber): boolean 
```

Returns

Returns true if the x coordinates are equal, otherwise returns false.

Argument Details

+ **x**
  + The x coordinate of a point in projective coordinates.

Example

```ts
const jp = new JacobianPoint(x1, y1, z1)
const isXEqual = jp.eqXToP(x2)
```

#### Method inspect

Returns the string representation of the JacobianPoint instance.

```ts
inspect(): string 
```

Returns

Returns the string description of the JacobianPoint. If the JacobianPoint represents a point at infinity, the return value of this function is '<EC JPoint Infinity>'. For a normal point, it returns the string description format as '<EC JPoint x: x-coordinate y: y-coordinate z: z-coordinate>'.

Example

```ts
const point = new JacobianPoint('5', '6', '1');
console.log(point.inspect()); // Output: '<EC JPoint x: 5 y: 6 z: 1>'
```

#### Method isInfinity

Checks whether the JacobianPoint instance represents a point at infinity.

```ts
isInfinity(): boolean 
```

Returns

Returns true if the JacobianPoint's z-coordinate equals to zero (which represents the point at infinity in Jacobian coordinates). Returns false otherwise.

Example

```ts
const point = new JacobianPoint('5', '6', '0');
console.log(point.isInfinity()); // Output: true
```

#### Method mixedAdd

Mixed addition operation. This function combines the standard point addition with
the transformation from the affine to Jacobian coordinates. It first converts
the affine point to Jacobian, and then preforms the addition.

```ts
mixedAdd(p: Point): JacobianPoint 
```

Returns

Returns the result of the mixed addition as a new Jacobian point.

Argument Details

+ **p**
  + The affine point to be added.

Example

```ts
const jp = new JacobianPoint(x1, y1, z1)
const ap = new Point(x2, y2)
const result = jp.mixedAdd(ap)
```

#### Method neg

Negation operation. It returns the additive inverse of the Jacobian point.

```ts
neg(): JacobianPoint 
```

Returns

Returns a new Jacobian point as the result of the negation.

Example

```ts
const jp = new JacobianPoint(x, y, z)
const result = jp.neg()
```

#### Method toP

Converts the `JacobianPoint` object instance to standard affine `Point` format and returns `Point` type.

```ts
toP(): Point 
```

Returns

The `Point`(affine) object representing the same point as the original `JacobianPoint`.

If the initial `JacobianPoint` represents point at infinity, an instance of `Point` at infinity is returned.

Example

```ts
const pointJ = new JacobianPoint('3', '4', '1');
const pointP = pointJ.toP();  // The point in affine coordinates.
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: RIPEMD160

An implementation of RIPEMD160 cryptographic hash function. Extends the BaseHash class.
It provides a way to compute a 'digest' for any kind of input data; transforming the data
into a unique output of fixed size. The output is deterministic; it will always be
the same for the same input.

Example

```ts
const ripemd160 = new RIPEMD160();
```

```ts
export class RIPEMD160 extends BaseHash {
    h: number[];
    constructor() 
    _update(msg: number[], start: number): void 
    _digest(): number[] 
    _digestHex(): string 
}
```

<details>

<summary>Class RIPEMD160 Details</summary>

#### Property h

Array that is updated iteratively as part of hashing computation.

```ts
h: number[]
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: SHA256

An implementation of SHA256 cryptographic hash function. Extends the BaseHash class.
It provides a way to compute a 'digest' for any kind of input data; transforming the data
into a unique output of fixed size. The output is deterministic; it will always be
the same for the same input.

Example

```ts
const sha256 = new SHA256();
```

```ts
export class SHA256 extends BaseHash {
    h: number[];
    W: number[];
    k: number[];
    constructor() 
    _update(msg: number[], start?: number): void 
    ;
    _digest(): number[] 
    _digestHex(): string 
}
```

<details>

<summary>Class SHA256 Details</summary>

#### Property W

Provides a way to recycle usage of the array memory.

```ts
W: number[]
```

#### Property h

The initial hash constants

```ts
h: number[]
```

#### Property k

The round constants used for each round of SHA-256

```ts
k: number[]
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: SHA1

An implementation of SHA1 cryptographic hash function. Extends the BaseHash class.
It provides a way to compute a 'digest' for any kind of input data; transforming the data
into a unique output of fixed size. The output is deterministic; it will always be
the same for the same input.

Example

```ts
const sha1 = new SHA1();
```

```ts
export class SHA1 extends BaseHash {
    h: number[];
    W: number[];
    k: number[];
    constructor() 
    _update(msg: number[], start?: number): void 
    _digest(): number[] 
    _digestHex(): string 
}
```

<details>

<summary>Class SHA1 Details</summary>

#### Property W

Provides a way to recycle usage of the array memory.

```ts
W: number[]
```

#### Property h

The initial hash constants.

```ts
h: number[]
```

#### Property k

The round constants used for each round of SHA-1.

```ts
k: number[]
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: SHA512

An implementation of SHA512 cryptographic hash function. Extends the BaseHash class.
It provides a way to compute a 'digest' for any kind of input data; transforming the data
into a unique output of fixed size. The output is deterministic; it will always be
the same for the same input.

Example

```ts
const sha512 = new SHA512();
```

```ts
export class SHA512 extends BaseHash {
    h: number[];
    W: number[];
    k: number[];
    constructor() 
    _prepareBlock(msg, start) 
    _update(msg, start) 
    _digest() 
    _digestHex() 
}
```

<details>

<summary>Class SHA512 Details</summary>

#### Property W

Provides a way to recycle usage of the array memory.

```ts
W: number[]
```

#### Property h

The initial hash constants.

```ts
h: number[]
```

#### Property k

The round constants used for each round of SHA-512.

```ts
k: number[]
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: SHA256HMAC

The `SHA256HMAC` class is used to create Hash-based Message Authentication Code (HMAC) using the SHA-256 cryptographic hash function.

HMAC is a specific type of MAC involving a cryptographic hash function and a secret cryptographic key. It may be used to simultaneously verify both the data integrity and the authenticity of a message.

This class also uses the SHA-256 cryptographic hash algorithm that produces a 256-bit (32-byte) hash value.

```ts
export class SHA256HMAC {
    inner: SHA256;
    outer: SHA256;
    blockSize = 64;
    outSize = 32;
    constructor(key: number[] | string) 
    update(msg: number[] | string, enc?: "hex"): SHA256HMAC 
    digest(): number[] 
    digestHex(): string 
}
```

<details>

<summary>Class SHA256HMAC Details</summary>

#### Constructor

The constructor for the `SHA256HMAC` class.

It initializes the `SHA256HMAC` object and sets up the inner and outer padded keys.
If the key size is larger than the blockSize, it is digested using SHA-256.
If the key size is less than the blockSize, it is padded with zeroes.

```ts
constructor(key: number[] | string) 
```

Argument Details

+ **key**
  + The key to use to create the HMAC. Can be a number array or a string in hexadecimal format.

Example

```ts
const myHMAC = new SHA256HMAC('deadbeef');
```

#### Property blockSize

The block size for the SHA-256 hash function, in bytes. It's set to 64 bytes.

```ts
blockSize = 64
```

#### Property inner

Represents the inner hash of SHA-256.

```ts
inner: SHA256
```

#### Property outSize

The output size of the SHA-256 hash function, in bytes. It's set to 32 bytes.

```ts
outSize = 32
```

#### Property outer

Represents the outer hash of SHA-256.

```ts
outer: SHA256
```

#### Method digest

Finalizes the HMAC computation and returns the resultant hash.

```ts
digest(): number[] 
```

Returns

Returns the digest of the hashed data. Can be a number array or a string.

Example

```ts
let hashedMessage = myHMAC.digest();
```

#### Method digestHex

Finalizes the HMAC computation and returns the resultant hash as a hex string.

```ts
digestHex(): string 
```

Returns

Returns the digest of the hashed data as a hex string

Example

```ts
let hashedMessage = myHMAC.digestHex();
```

#### Method update

Updates the `SHA256HMAC` object with part of the message to be hashed.

```ts
update(msg: number[] | string, enc?: "hex"): SHA256HMAC 
```

Returns

Returns the instance of `SHA256HMAC` for chaining calls.

Argument Details

+ **msg**
  + Part of the message to hash. Can be a number array or a string.
+ **enc**
  + If 'hex', then the input is encoded as hexadecimal. If undefined or not 'hex', then no encoding is performed.

Example

```ts
myHMAC.update('deadbeef', 'hex');
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: SHA1HMAC

```ts
export class SHA1HMAC {
    inner: SHA1;
    outer: SHA1;
    blockSize = 64;
    constructor(key: number[] | string) 
    update(msg: number[] | string, enc?: "hex"): SHA1HMAC 
    digest(): number[] 
    digestHex(): string 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: SHA512HMAC

The `SHA512HMAC` class is used to create Hash-based Message Authentication Code (HMAC) using the SHA-512 cryptographic hash function.

HMAC is a specific type of MAC involving a cryptographic hash function and a secret cryptographic key. It may be used to simultaneously verify both the data integrity and the authenticity of a message.

This class also uses the SHA-512 cryptographic hash algorithm that produces a 512-bit (64-byte) hash value.

```ts
export class SHA512HMAC {
    inner: SHA512;
    outer: SHA512;
    blockSize = 128;
    outSize = 32;
    constructor(key: number[] | string) 
    update(msg: number[] | string, enc?: "hex" | "utf8"): SHA512HMAC 
    digest(): number[] 
    digestHex(): string 
}
```

<details>

<summary>Class SHA512HMAC Details</summary>

#### Constructor

The constructor for the `SHA512HMAC` class.

It initializes the `SHA512HMAC` object and sets up the inner and outer padded keys.
If the key size is larger than the blockSize, it is digested using SHA-512.
If the key size is less than the blockSize, it is padded with zeroes.

```ts
constructor(key: number[] | string) 
```

Argument Details

+ **key**
  + The key to use to create the HMAC. Can be a number array or a string in hexadecimal format.

Example

```ts
const myHMAC = new SHA512HMAC('deadbeef');
```

#### Property blockSize

The block size for the SHA-512 hash function, in bytes. It's set to 128 bytes.

```ts
blockSize = 128
```

#### Property inner

Represents the inner hash of SHA-512.

```ts
inner: SHA512
```

#### Property outSize

The output size of the SHA-512 hash function, in bytes. It's set to 64 bytes.

```ts
outSize = 32
```

#### Property outer

Represents the outer hash of SHA-512.

```ts
outer: SHA512
```

#### Method digest

Finalizes the HMAC computation and returns the resultant hash.

```ts
digest(): number[] 
```

Returns

Returns the digest of the hashed data as a number array.

Example

```ts
let hashedMessage = myHMAC.digest();
```

#### Method digestHex

Finalizes the HMAC computation and returns the resultant hash as a hex string.

```ts
digestHex(): string 
```

Returns

Returns the digest of the hashed data as a hex string

Example

```ts
let hashedMessage = myHMAC.digestHex();
```

#### Method update

Updates the `SHA512HMAC` object with part of the message to be hashed.

```ts
update(msg: number[] | string, enc?: "hex" | "utf8"): SHA512HMAC 
```

Returns

Returns the instance of `SHA512HMAC` for chaining calls.

Argument Details

+ **msg**
  + Part of the message to hash. Can be a number array or a string.
+ **enc**
  + If 'hex', then the input is encoded as hexadecimal. If undefined or not 'hex', then no encoding is performed.

Example

```ts
myHMAC.update('deadbeef', 'hex');
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: Writer

```ts
export class Writer {
    public bufs: number[][];
    constructor(bufs?: number[][]) 
    getLength(): number 
    toArray(): number[] 
    write(buf: number[]): Writer 
    writeReverse(buf: number[]): Writer 
    writeUInt8(n: number): Writer 
    writeInt8(n: number): Writer 
    writeUInt16BE(n: number): Writer 
    writeInt16BE(n: number): Writer 
    writeUInt16LE(n: number): Writer 
    writeInt16LE(n: number): Writer 
    writeUInt32BE(n: number): Writer 
    writeInt32BE(n: number): Writer 
    writeUInt32LE(n: number): Writer 
    writeInt32LE(n: number): Writer 
    writeUInt64BEBn(bn: BigNumber): Writer 
    writeUInt64LEBn(bn: BigNumber): Writer 
    writeUInt64LE(n: number): Writer 
    writeVarIntNum(n: number): Writer 
    writeVarIntBn(bn: BigNumber): Writer 
    static varIntNum(n: number): number[] 
    static varIntBn(bn: BigNumber): number[] 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: Reader

```ts
export class Reader {
    public bin: number[];
    public pos: number;
    constructor(bin: number[] = [], pos: number = 0) 
    public eof(): boolean 
    public read(len = this.bin.length): number[] 
    public readReverse(len = this.bin.length): number[] 
    public readUInt8(): number 
    public readInt8(): number 
    public readUInt16BE(): number 
    public readInt16BE(): number 
    public readUInt16LE(): number 
    public readInt16LE(): number 
    public readUInt32BE(): number 
    public readInt32BE(): number 
    public readUInt32LE(): number 
    public readInt32LE(): number 
    public readUInt64BEBn(): BigNumber 
    public readUInt64LEBn(): BigNumber 
    public readVarIntNum(): number 
    public readVarInt(): number[] 
    public readVarIntBn(): BigNumber 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: Point

`Point` class is a representation of an elliptic curve point with affine coordinates.
It extends the functionality of BasePoint and carries x, y coordinates of point on the curve.
It also introduces new methods for handling Point operations in elliptic curve.

```ts
export default class Point extends BasePoint {
    x: BigNumber | null;
    y: BigNumber | null;
    inf: boolean;
    static fromDER(bytes: number[]): Point 
    static fromString(str: string): Point 
    static fromX(x: BigNumber | number | number[] | string, odd: boolean): Point 
    static fromJSON(obj: string | any[], isRed: boolean): Point 
    constructor(x: BigNumber | number | number[] | string | null, y: BigNumber | number | number[] | string | null, isRed: boolean = true) 
    validate(): boolean 
    encode(compact: boolean = true, enc?: "hex"): number[] | string 
    toString(): string 
    toJSON(): [
        BigNumber | null,
        BigNumber | null,
        {
            doubles: {
                step: any;
                points: any[];
            } | undefined;
            naf: {
                wnd: any;
                points: any[];
            } | undefined;
        }?
    ] 
    inspect(): string 
    isInfinity(): boolean 
    add(p: Point): Point 
    dbl(): Point 
    getX(): BigNumber 
    getY(): BigNumber 
    mul(k: BigNumber | number | number[] | string): Point 
    mulAdd(k1: BigNumber, p2: Point, k2: BigNumber): Point 
    jmulAdd(k1: BigNumber, p2: Point, k2: BigNumber): JPoint 
    eq(p: Point): boolean 
    neg(_precompute?: boolean): Point 
    dblp(k: number): Point 
    toJ(): JPoint 
    ;
    ;
}
```

<details>

<summary>Class Point Details</summary>

#### Constructor

```ts
constructor(x: BigNumber | number | number[] | string | null, y: BigNumber | number | number[] | string | null, isRed: boolean = true) 
```

Argument Details

+ **x**
  + The x-coordinate of the point. May be a number, a BigNumber, a string (which will be interpreted as hex), a number array, or null. If null, an "Infinity" point is constructed.
+ **y**
  + The y-coordinate of the point, similar to x.
+ **isRed**
  + A boolean indicating if the point is a member of the field of integers modulo the k256 prime. Default is true.

Example

```ts
new Point('abc123', 'def456');
new Point(null, null); // Generates Infinity point.
```

#### Property inf

Flag to record if the point is at infinity in the Elliptic Curve.

```ts
inf: boolean
```

#### Property x

The x-coordinate of the point.

```ts
x: BigNumber | null
```

#### Property y

The y-coordinate of the point.

```ts
y: BigNumber | null
```

#### Method add

Adds another Point to this Point, returning a new Point.

```ts
add(p: Point): Point 
```

Returns

A new Point that results from the addition.

Argument Details

+ **p**
  + The Point to add to this one.

Example

```ts
const p1 = new Point(1, 2);
const p2 = new Point(2, 3);
const result = p1.add(p2);
```

#### Method dbl

Doubles the current point.

```ts
dbl(): Point 
```

Example

```ts
const P = new Point('123', '456');
const result = P.dbl();
```

#### Method dblp

Performs the "doubling" operation on the Point a given number of times.
This is used in elliptic curve operations to perform multiplication by 2, multiple times.
If the point is at infinity, it simply returns the point because doubling
a point at infinity is still infinity.

```ts
dblp(k: number): Point 
```

Returns

The Point after 'k' "doubling" operations have been performed.

Argument Details

+ **k**
  + The number of times the "doubling" operation is to be performed on the Point.

Example

```ts
const p = new Point(5, 20);
const doubledPoint = p.dblp(10); // returns the point after "doubled" 10 times
```

#### Method encode

Encodes the coordinates of a point into an array or a hexadecimal string.
The details of encoding are determined by the optional compact and enc parameters.

```ts
encode(compact: boolean = true, enc?: "hex"): number[] | string 
```

Returns

If enc is undefined, a byte array representation of the point will be returned. if enc is 'hex', a hexadecimal string representation of the point will be returned.

Argument Details

+ **compact**
  + If true, an additional prefix byte 0x02 or 0x03 based on the 'y' coordinate being even or odd respectively is used. If false, byte 0x04 is used.
+ **enc**
  + Expects the string 'hex' if hexadecimal string encoding is required instead of an array of numbers.

Throws

Will throw an error if the specified encoding method is not recognized. Expects 'hex'.

Example

```ts
const aPoint = new Point(x, y);
const encodedPointArray = aPoint.encode();
const encodedPointHex = aPoint.encode(true, 'hex');
```

#### Method eq

Checks if the Point instance is equal to another given Point.

```ts
eq(p: Point): boolean 
```

Returns

Whether the two Point instances are equal. Both the 'x' and 'y' coordinates have to match, and both points have to either be valid or at infinity for equality. If both conditions are true, it returns true, else it returns false.

Argument Details

+ **p**
  + The Point to be checked if equal to the current instance.

Example

```ts
const p1 = new Point(5, 20);
const p2 = new Point(5, 20);
const areEqual = p1.eq(p2); // returns true
```

#### Method fromDER

Creates a point object from a given Array. These numbers can represent coordinates in hex format, or points
in multiple established formats.
The function verifies the integrity of the provided data and throws errors if inconsistencies are found.

```ts
static fromDER(bytes: number[]): Point 
```

Returns

Returns a new point representing the given string.

Argument Details

+ **bytes**
  + The point representation number array.

Throws

`Error` If the point number[] value has a wrong length.

`Error` If the point format is unknown.

Example

```ts
const derPoint = [ 2, 18, 123, 108, 125, 83, 1, 251, 164, 214, 16, 119, 200, 216, 210, 193, 251, 193, 129, 67, 97, 146, 210, 216, 77, 254, 18, 6, 150, 190, 99, 198, 128 ];
const point = Point.fromDER(derPoint);
```

#### Method fromJSON

Generates a point from a serialized JSON object. The function accounts for different options in the JSON object,
including precomputed values for optimization of EC operations, and calls another helper function to turn nested
JSON points into proper Point objects.

```ts
static fromJSON(obj: string | any[], isRed: boolean): Point 
```

Returns

Returns a new point based on the deserialized JSON object.

Argument Details

+ **obj**
  + An object or array that holds the data for the point.
+ **isRed**
  + A boolean to direct how the Point is constructed from the JSON object.

Example

```ts
const serializedPoint = '{"x":52,"y":15}';
const point = Point.fromJSON(serializedPoint, true);
```

#### Method fromString

Creates a point object from a given string. This string can represent coordinates in hex format, or points
in multiple established formats.
The function verifies the integrity of the provided data and throws errors if inconsistencies are found.

```ts
static fromString(str: string): Point 
```

Returns

Returns a new point representing the given string.

Argument Details

+ **str**
  + The point representation string.

Throws

`Error` If the point string value has a wrong length.

`Error` If the point format is unknown.

Example

```ts
const pointStr = 'abcdef';
const point = Point.fromString(pointStr);
```

#### Method fromX

Generates a point from an x coordinate and a boolean indicating whether the corresponding
y coordinate is odd.

```ts
static fromX(x: BigNumber | number | number[] | string, odd: boolean): Point 
```

Returns

Returns the new point.

Argument Details

+ **x**
  + The x coordinate of the point.
+ **odd**
  + Boolean indicating whether the corresponding y coordinate is odd or not.

Throws

`Error` If the point is invalid.

Example

```ts
const xCoordinate = new BigNumber('10');
const point = Point.fromX(xCoordinate, true);
```

#### Method getX

Returns X coordinate of point

```ts
getX(): BigNumber 
```

Example

```ts
const P = new Point('123', '456');
const x = P.getX();
```

#### Method getY

Returns X coordinate of point

```ts
getY(): BigNumber 
```

Example

```ts
const P = new Point('123', '456');
const x = P.getX();
```

#### Method inspect

Provides the point coordinates in a human-readable string format for debugging purposes.

```ts
inspect(): string 
```

Returns

String of the format '<EC Point x: x-coordinate y: y-coordinate>', or '<EC Point Infinity>' if the point is at infinity.

Example

```ts
const aPoint = new Point(x, y);
console.log(aPoint.inspect());
```

#### Method isInfinity

Checks if the point is at infinity.

```ts
isInfinity(): boolean 
```

Returns

Returns whether or not the point is at infinity.

Example

```ts
const p = new Point(null, null);
console.log(p.isInfinity()); // outputs: true
```

#### Method jmulAdd

Performs the Jacobian multiplication and addition operation in a single
step. Instead of returning a regular Point, the result is a JacobianPoint.

```ts
jmulAdd(k1: BigNumber, p2: Point, k2: BigNumber): JPoint 
```

Returns

A JacobianPoint that results from the combined multiplication and addition operation.

Argument Details

+ **k1**
  + The scalar value to multiply this Point by.
+ **p2**
  + The other Point to be involved in the operation
+ **k2**
  + The scalar value to multiply the Point p2 by.

Example

```ts
const p1 = new Point(1, 2);
const p2 = new Point(2, 3);
const result = p1.jmulAdd(2, p2, 3);
```

#### Method mul

Multiplies this Point by a scalar value, returning a new Point.

```ts
mul(k: BigNumber | number | number[] | string): Point 
```

Returns

A new Point that results from the multiplication.

Argument Details

+ **k**
  + The scalar value to multiply this Point by.

Example

```ts
const p = new Point(1, 2);
const result = p.mul(2); // this doubles the Point
```

#### Method mulAdd

Performs a multiplication and addition operation in a single step.
Multiplies this Point by k1, adds the resulting Point to the result of p2 multiplied by k2.

```ts
mulAdd(k1: BigNumber, p2: Point, k2: BigNumber): Point 
```

Returns

A Point that results from the combined multiplication and addition operations.

Argument Details

+ **k1**
  + The scalar value to multiply this Point by.
+ **p2**
  + The other Point to be involved in the operation.
+ **k2**
  + The scalar value to multiply the Point p2 by.

Example

```ts
const p1 = new Point(1, 2);
const p2 = new Point(2, 3);
const result = p1.mulAdd(2, p2, 3);
```

#### Method neg

Negate a point. The negation of a point P is the mirror of P about x-axis.

```ts
neg(_precompute?: boolean): Point 
```

Example

```ts
const P = new Point('123', '456');
const result = P.neg();
```

#### Method toJ

Converts the point to a Jacobian point. If the point is at infinity, the corresponding Jacobian point
will also be at infinity.

```ts
toJ(): JPoint 
```

Returns

Returns a new Jacobian point based on the current point.

Example

```ts
const point = new Point(xCoordinate, yCoordinate);
const jacobianPoint = point.toJ();
```

#### Method toJSON

Exports the x and y coordinates of the point, and the precomputed doubles and non-adjacent form (NAF) for optimization. The output is an array.

```ts
toJSON(): [
    BigNumber | null,
    BigNumber | null,
    {
        doubles: {
            step: any;
            points: any[];
        } | undefined;
        naf: {
            wnd: any;
            points: any[];
        } | undefined;
    }?
] 
```

Returns

An Array where first two elements are the coordinates of the point and optional third element is an object with doubles and NAF points.

Example

```ts
const aPoint = new Point(x, y);
const jsonPoint = aPoint.toJSON();
```

#### Method toString

function toString() { [native code] }

Converts the point coordinates to a hexadecimal string. A wrapper method
for encode. Byte 0x02 or 0x03 is used as prefix based on the 'y' coordinate being even or odd respectively.

```ts
toString(): string 
```

Returns

A hexadecimal string representation of the point coordinates.

Example

```ts
const aPoint = new Point(x, y);
const stringPoint = aPoint.toString();
```

#### Method validate

Validates if a point belongs to the curve. Follows the short Weierstrass
equation for elliptic curves: y^2 = x^3 + ax + b.

```ts
validate(): boolean 
```

Returns

true if the point is on the curve, false otherwise.

Example

```ts
const aPoint = new Point(x, y);
const isValid = aPoint.validate();
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: Curve

```ts
export default class Curve {
    p: BigNumber;
    red: ReductionContext;
    redN: BigNumber | null;
    zero: BigNumber;
    one: BigNumber;
    two: BigNumber;
    g: Point;
    n: BigNumber;
    a: BigNumber;
    b: BigNumber;
    tinv: BigNumber;
    zeroA: boolean;
    threeA: boolean;
    endo: any;
    _endoWnafT1: any[];
    _endoWnafT2: any[];
    _wnafT1: any[];
    _wnafT2: any[];
    _wnafT3: any[];
    _wnafT4: any[];
    _bitLength: number;
    static assert(expression: unknown, message: string = "Elliptic curve assertion failed"): void 
    getNAF(num: BigNumber, w: number, bits: number): number[] 
    getJSF(k1: BigNumber, k2: BigNumber): number[][] 
    static cachedProperty(obj, name: string, computer): void 
    static parseBytes(bytes: string | number[]): number[] 
    static intFromLE(bytes: number[]): BigNumber 
    constructor() 
    _getEndomorphism(conf): {
        beta: BigNumber;
        lambda: BigNumber;
        basis: Array<{
            a: BigNumber;
            b: BigNumber;
        }>;
    } | undefined 
    ;
    _getEndoRoots(num: BigNumber): [
        BigNumber,
        BigNumber
    ] 
    ;
    _getEndoBasis(lambda: BigNumber): [
        {
            a: BigNumber;
            b: BigNumber;
        },
        {
            a: BigNumber;
            b: BigNumber;
        }
    ] 
    _endoSplit(k: BigNumber): {
        k1: BigNumber;
        k2: BigNumber;
    } 
    validate(point: Point): boolean 
    ;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: DRBG

This class behaves as a HMAC-based deterministic random bit generator (DRBG). It implements a deterministic random number generator using SHA256HMAC HASH function. It takes an initial entropy and nonce when instantiated for seeding purpose.

Example

```ts
const drbg = new DRBG('af12de...', '123ef...');
```

```ts
export default class DRBG {
    K: number[];
    V: number[];
    constructor(entropy: number[] | string, nonce: number[] | string) 
    hmac(): SHA256HMAC 
    update(seed?): void 
    generate(len: number): string 
}
```

<details>

<summary>Class DRBG Details</summary>

#### Method generate

Generates deterministic random hexadecimal string of given length.
In every generation process, it also updates the internal state `K` and `V`.

```ts
generate(len: number): string 
```

Returns

The required deterministic random hexadecimal string.

Argument Details

+ **len**
  + The length of required random number.

Example

```ts
const randomHex = drbg.generate(256);
```

#### Method hmac

Generates HMAC using the K value of the instance. This method is used internally for operations.

```ts
hmac(): SHA256HMAC 
```

Returns

The SHA256HMAC object created with K value.

Example

```ts
const hmac = drbg.hmac();
```

#### Method update

Updates the `K` and `V` values of the instance based on the seed.
The seed if not provided uses `V` as seed.

```ts
update(seed?): void 
```

Returns

Nothing, but updates the internal state `K` and `V` value.

Argument Details

+ **seed**
  + an optional value that used to update `K` and `V`. Default is `undefined`.

Example

```ts
drbg.update('e13af...');
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: Signature

Represents a digital signature.

A digital signature is a mathematical scheme for verifying the authenticity of
digital messages or documents. In many scenarios, it is equivalent to a handwritten signature or stamped seal.
The signature pair (R, S) corresponds to the raw ECDSA ([Elliptic Curve Digital Signature Algorithm](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm)) signature.
Signatures are often serialized into a format known as '[DER encoding](https://en.wikipedia.org/wiki/X.690#DER_encoding)' for transmission.

```ts
export default class Signature {
    r: BigNumber;
    s: BigNumber;
    static fromDER(data: number[] | string, enc?: "hex" | "base64"): Signature 
    static fromCompact(data: number[] | string, enc?: "hex" | "base64"): Signature 
    constructor(r: BigNumber, s: BigNumber) 
    verify(msg: number[] | string, key: PublicKey, enc?: "hex"): boolean 
    toString(enc?: "hex" | "base64") 
    toDER(enc?: "hex" | "base64"): number[] | string 
    toCompact(recovery: number, compressed: boolean, enc?: "hex" | "base64"): number[] | string 
    RecoverPublicKey(recovery: number, e: BigNumber): PublicKey 
    CalculateRecoveryFactor(pubkey: PublicKey, msgHash: BigNumber): number 
}
```

<details>

<summary>Class Signature Details</summary>

#### Constructor

Creates an instance of the Signature class.

```ts
constructor(r: BigNumber, s: BigNumber) 
```

Argument Details

+ **r**
  + The R component of the signature.
+ **s**
  + The S component of the signature.

Example

```ts
const r = new BigNumber('208755674028...');
const s = new BigNumber('564745627577...');
const signature = new Signature(r, s);
```

#### Method CalculateRecoveryFactor

Calculates the recovery factor which will work for a particular public key and message hash.
This method will return the recovery factor if it finds a valid recovery factor.
If it does not find a valid recovery factor, it will throw an error.
The recovery factor is a number between 0 and 3.

```ts
CalculateRecoveryFactor(pubkey: PublicKey, msgHash: BigNumber): number 
```

Returns

the recovery factor: number
/

Argument Details

+ **msgHash**
  + The message hash.

Example

```ts
const recovery = signature.CalculateRecoveryFactor(publicKey, msgHash);
```

#### Method RecoverPublicKey

Recovers the public key from a signature.
This method will return the public key if it finds a valid public key.
If it does not find a valid public key, it will throw an error.
The recovery factor is a number between 0 and 3.

```ts
RecoverPublicKey(recovery: number, e: BigNumber): PublicKey 
```

Returns

The public key associated with the signature.

Argument Details

+ **recovery**
  + The recovery factor.
+ **e**
  + The message hash.

Example

```ts
const publicKey = signature.RecoverPublicKey(0, msgHash);
```

#### Method fromCompact

Takes an array of numbers or a string and returns a new Signature instance.
This method will throw an error if the Compact encoding is invalid.
If a string is provided, it is assumed to represent a hexadecimal sequence.
compactByte value 27-30 means uncompressed public key.
31-34 means compressed public key.
The range represents the recovery param which can be 0,1,2,3.
We could support recovery functions in future if there's demand.

```ts
static fromCompact(data: number[] | string, enc?: "hex" | "base64"): Signature 
```

Returns

The decoded data in the form of Signature instance.

Argument Details

+ **data**
  + The sequence to decode from Compact encoding.
+ **enc**
  + The encoding of the data string.

Example

```ts
const signature = Signature.fromCompact('1b18c1f5502f8...', 'hex');
```

#### Method fromDER

Takes an array of numbers or a string and returns a new Signature instance.
This method will throw an error if the DER encoding is invalid.
If a string is provided, it is assumed to represent a hexadecimal sequence.

```ts
static fromDER(data: number[] | string, enc?: "hex" | "base64"): Signature 
```

Returns

The decoded data in the form of Signature instance.

Argument Details

+ **data**
  + The sequence to decode from DER encoding.
+ **enc**
  + The encoding of the data string.

Example

```ts
const signature = Signature.fromDER('30440220018c1f5502f8...', 'hex');
```

#### Method toCompact

Converts an instance of Signature into Compact encoding.

If the encoding parameter is set to 'hex', the function will return a hex string.
If 'base64', it will return a base64 string.
Otherwise, it will return an array of numbers.

```ts
toCompact(recovery: number, compressed: boolean, enc?: "hex" | "base64"): number[] | string 
```

Returns

The current instance in DER encoding.

Argument Details

+ **enc**
  + The encoding to use for the output.

Example

```ts
const compact = signature.toCompact(3, true, 'base64');
```

#### Method toDER

Converts an instance of Signature into DER encoding.

If the encoding parameter is set to 'hex', the function will return a hex string.
If 'base64', it will return a base64 string.
Otherwise, it will return an array of numbers.

```ts
toDER(enc?: "hex" | "base64"): number[] | string 
```

Returns

The current instance in DER encoding.

Argument Details

+ **enc**
  + The encoding to use for the output.

Example

```ts
const der = signature.toDER('hex');
```

#### Method toString

function toString() { [native code] }

Converts an instance of Signature into DER encoding.
An alias for the toDER method.

If the encoding parameter is set to 'hex', the function will return a hex string.
If 'base64', it will return a base64 string.
Otherwise, it will return an array of numbers.

```ts
toString(enc?: "hex" | "base64") 
```

Returns

The current instance in DER encoding.

Argument Details

+ **enc**
  + The encoding to use for the output.

Example

```ts
const der = signature.toString('base64');
```

#### Method verify

Verifies a digital signature.

This method will return true if the signature, key, and message hash match.
If the data or key do not match the signature, the function returns false.

```ts
verify(msg: number[] | string, key: PublicKey, enc?: "hex"): boolean 
```

Returns

A boolean representing whether the signature is valid.

Argument Details

+ **msg**
  + The message to verify.
+ **key**
  + The public key used to sign the original message.
+ **enc**
  + The encoding of the msg string.

Example

```ts
const msg = 'The quick brown fox jumps over the lazy dog';
const publicKey = PublicKey.fromString('04188ca1050...');
const isVerified = signature.verify(msg, publicKey);
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: PointInFiniteField

```ts
export class PointInFiniteField {
    x: BigNumber;
    y: BigNumber;
    constructor(x: BigNumber, y: BigNumber) 
    toString(): string 
    static fromString(str: string): PointInFiniteField 
}
```

<details>

<summary>Class PointInFiniteField Details</summary>

#### Method toString

function toString() { [native code] }

```ts
toString(): string 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: Polynomial

Polynomial class

This class is used to create a polynomial with a given threshold and a private key.
The polynomial is used to create shares of the private key.

Example

```ts
const key = new PrivateKey()
const threshold = 2
const polynomial = new Polynomial(key, threshold)
```

```ts
export default class Polynomial {
    readonly points: PointInFiniteField[];
    readonly threshold: number;
    constructor(points: PointInFiniteField[], threshold?: number) 
    static fromPrivateKey(key: PrivateKey, threshold: number): Polynomial 
    valueAt(x: BigNumber): BigNumber 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: KeyShares

Example

```ts
const key = PrivateKey.fromShares(shares)
```

```ts
export class KeyShares {
    points: PointInFiniteField[];
    threshold: number;
    integrity: string;
    constructor(points: PointInFiniteField[], threshold: number, integrity: string) 
    static fromBackupFormat(shares: string[]): KeyShares 
    toBackupFormat() 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: PrivateKey

Represents a Private Key, which is a secret that can be used to generate signatures in a cryptographic system.

The `PrivateKey` class extends from the `BigNumber` class. It offers methods to create signatures, verify them,
create a corresponding public key and derive a shared secret from a public key.

```ts
export default class PrivateKey extends BigNumber {
    static fromRandom(): PrivateKey 
    static fromString(str: string, base: number | "hex"): PrivateKey 
    static fromWif(wif: string, prefixLength: number = 1): PrivateKey 
    constructor(number: BigNumber | number | string | number[] = 0, base: number | "be" | "le" | "hex" = 10, endian: "be" | "le" = "be", modN: "apply" | "nocheck" | "error" = "apply") 
    checkInField(): {
        inField: boolean;
        modN: BigNumber;
    } 
    isValid(): boolean 
    sign(msg: number[] | string, enc?: "hex" | "utf8", forceLowS: boolean = true, customK?: Function | BigNumber): Signature 
    verify(msg: number[] | string, sig: Signature, enc?: "hex"): boolean 
    toPublicKey(): PublicKey 
    toWif(prefix: number[] = [128]): string 
    toAddress(prefix: number[] | string = [0]): string 
    deriveSharedSecret(key: PublicKey): Point 
    deriveChild(publicKey: PublicKey, invoiceNumber: string): PrivateKey 
    toKeyShares(threshold: number, totalShares: number): KeyShares 
    toBackupShares(threshold: number, totalShares: number): string[] 
    static fromBackupShares(shares: string[]): PrivateKey 
    static fromKeyShares(keyShares: KeyShares): PrivateKey 
}
```

<details>

<summary>Class PrivateKey Details</summary>

#### Constructor

```ts
constructor(number: BigNumber | number | string | number[] = 0, base: number | "be" | "le" | "hex" = 10, endian: "be" | "le" = "be", modN: "apply" | "nocheck" | "error" = "apply") 
```

Argument Details

+ **number**
  + The number (various types accepted) to construct a BigNumber from. Default is 0.
+ **base**
  + The base of number provided. By default is 10. Ignored if number is BigNumber.
+ **endian**
  + The endianness provided. By default is 'big endian'. Ignored if number is BigNumber.
+ **modN**
  + Optional. Default 'apply. If 'apply', apply modN to input to guarantee a valid PrivateKey. If 'error', if input is out of field throw Error('Input is out of field'). If 'nocheck', assumes input is in field.

Example

```ts
import PrivateKey from './PrivateKey';
import BigNumber from './BigNumber';
const privKey = new PrivateKey(new BigNumber('123456', 10, 'be'));
```

#### Method checkInField

A utility function to check that the value of this PrivateKey lies in the field limited by curve.n

```ts
checkInField(): {
    inField: boolean;
    modN: BigNumber;
} 
```

Returns

, modN } where modN is this PrivateKey's current BigNumber value mod curve.n, and inField is true only if modN equals current BigNumber value.

#### Method deriveChild

Derives a child key with BRC-42.

```ts
deriveChild(publicKey: PublicKey, invoiceNumber: string): PrivateKey 
```

Returns

The derived child key.

Argument Details

+ **publicKey**
  + The public key of the other party
+ **invoiceNumber**
  + The invoice number used to derive the child key

#### Method deriveSharedSecret

Derives a shared secret from the public key.

```ts
deriveSharedSecret(key: PublicKey): Point 
```

Returns

The derived shared secret (a point on the curve).

Argument Details

+ **key**
  + The public key to derive the shared secret from.

Throws

Will throw an error if the public key is not valid.

Example

```ts
const privateKey = PrivateKey.fromRandom();
const publicKey = privateKey.toPublicKey();
const sharedSecret = privateKey.deriveSharedSecret(publicKey);
```

#### Method fromBackupShares

```ts
static fromBackupShares(shares: string[]): PrivateKey 
```

Returns

PrivateKey

Example

```ts
const share1 = '3znuzt7DZp8HzZTfTh5MF9YQKNX3oSxTbSYmSRGrH2ev.2Nm17qoocmoAhBTCs8TEBxNXCskV9N41rB2PckcgYeqV.2.35449bb9'
const share2 = 'Cm5fuUc39X5xgdedao8Pr1kvCSm8Gk7Cfenc7xUKcfLX.2juyK9BxCWn2DiY5JUAgj9NsQ77cc9bWksFyW45haXZm.2.35449bb9'

const recoveredKey = PrivateKey.fromBackupShares([share1, share2])
```

#### Method fromKeyShares

Combines shares to reconstruct the private key.

```ts
static fromKeyShares(keyShares: KeyShares): PrivateKey 
```

Returns

The reconstructed private key.

Argument Details

+ **shares**
  + An array of points (shares) to be used to reconstruct the private key.
+ **threshold**
  + The minimum number of shares required to reconstruct the private key.

#### Method fromRandom

Generates a private key randomly.

```ts
static fromRandom(): PrivateKey 
```

Returns

The newly generated Private Key.

Example

```ts
const privateKey = PrivateKey.fromRandom();
```

#### Method fromString

Generates a private key from a string.

```ts
static fromString(str: string, base: number | "hex"): PrivateKey 
```

Returns

The generated Private Key.

Argument Details

+ **str**
  + The string to generate the private key from.
+ **base**
  + The base of the string.

Throws

Will throw an error if the string is not valid.

#### Method fromWif

Generates a private key from a WIF (Wallet Import Format) string.

```ts
static fromWif(wif: string, prefixLength: number = 1): PrivateKey 
```

Returns

The generated Private Key.

Argument Details

+ **wif**
  + The WIF string to generate the private key from.
+ **base**
  + The base of the string.

Throws

Will throw an error if the string is not a valid WIF.

#### Method isValid

```ts
isValid(): boolean 
```

Returns

true if the PrivateKey's current BigNumber value lies in the field limited by curve.n

#### Method sign

Signs a message using the private key.

```ts
sign(msg: number[] | string, enc?: "hex" | "utf8", forceLowS: boolean = true, customK?: Function | BigNumber): Signature 
```

Returns

A digital signature generated from the hash of the message and the private key.

Argument Details

+ **msg**
  + The message (array of numbers or string) to be signed.
+ **enc**
  + If 'hex' the string will be treated as hex, utf8 otherwise.
+ **forceLowS**
  + If true (the default), the signature will be forced to have a low S value.
+ **customK**
  + — If provided, uses a custom K-value for the signature. Provie a function that returns a BigNumber, or the BigNumber itself.

Example

```ts
const privateKey = PrivateKey.fromRandom();
const signature = privateKey.sign('Hello, World!');
```

#### Method toAddress

Base58Check encodes the hash of the public key associated with this private key with a prefix to indicate locking script type.
Defaults to P2PKH for mainnet, otherwise known as a "Bitcoin Address".

```ts
toAddress(prefix: number[] | string = [0]): string 
```

Returns

Returns the address encoding associated with the hash of the public key associated with this private key.

Argument Details

+ **prefix**
  + defaults to [0x00] for mainnet, set to [0x6f] for testnet or use the strings 'testnet' or 'mainnet'

Example

```ts
const address = privkey.toAddress()
const address = privkey.toAddress('mainnet')
const testnetAddress = privkey.toAddress([0x6f])
const testnetAddress = privkey.toAddress('testnet')
```

#### Method toBackupShares

```ts
toBackupShares(threshold: number, totalShares: number): string[] 
```

Argument Details

+ **threshold**
  + The number of shares which will be required to reconstruct the private key.
+ **totalShares**
  + The number of shares to generate for distribution.

#### Method toKeyShares

Splits the private key into shares using Shamir's Secret Sharing Scheme.

```ts
toKeyShares(threshold: number, totalShares: number): KeyShares 
```

Returns

An array of shares.

Argument Details

+ **threshold**
  + The minimum number of shares required to reconstruct the private key.
+ **totalShares**
  + The total number of shares to generate.
+ **prime**
  + The prime number to be used in Shamir's Secret Sharing Scheme.

Example

```ts
const key = PrivateKey.fromRandom()
const shares = key.toKeyShares(2, 5)
```

#### Method toPublicKey

Converts the private key to its corresponding public key.

The public key is generated by multiplying the base point G of the curve and the private key.

```ts
toPublicKey(): PublicKey 
```

Returns

The generated PublicKey.

Example

```ts
const privateKey = PrivateKey.fromRandom();
const publicKey = privateKey.toPublicKey();
```

#### Method toWif

Converts the private key to a Wallet Import Format (WIF) string.

Base58Check encoding is used for encoding the private key.
The prefix

```ts
toWif(prefix: number[] = [128]): string 
```

Returns

The WIF string.

Argument Details

+ **prefix**
  + defaults to [0x80] for mainnet, set it to [0xef] for testnet.

Throws

Error('Value is out of field') if current BigNumber value is out of field limited by curve.n

Example

```ts
const privateKey = PrivateKey.fromRandom();
const wif = privateKey.toWif();
const testnetWif = privateKey.toWif([0xef]);
```

#### Method verify

Verifies a message's signature using the public key associated with this private key.

```ts
verify(msg: number[] | string, sig: Signature, enc?: "hex"): boolean 
```

Returns

Whether or not the signature is valid.

Argument Details

+ **msg**
  + The original message which has been signed.
+ **sig**
  + The signature to be verified.
+ **enc**
  + The data encoding method.

Example

```ts
const privateKey = PrivateKey.fromRandom();
const signature = privateKey.sign('Hello, World!');
const isSignatureValid = privateKey.verify('Hello, World!', signature);
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: PublicKey

The PublicKey class extends the Point class. It is used in public-key cryptography to derive shared secret, verify message signatures, and encode the public key in the DER format.
The class comes with static methods to generate PublicKey instances from private keys or from strings.

```ts
export default class PublicKey extends Point {
    static fromPrivateKey(key: PrivateKey): PublicKey 
    static fromString(str: string): PublicKey 
    static fromDER(bytes: number[]): PublicKey 
    constructor(x: Point | BigNumber | number | number[] | string | null, y: BigNumber | number | number[] | string | null = null, isRed: boolean = true) 
    deriveSharedSecret(priv: PrivateKey): Point 
    verify(msg: number[] | string, sig: Signature, enc?: "hex" | "utf8"): boolean 
    toDER(enc?: "hex" | undefined): number[] | string 
    toHash(enc?: "hex"): number[] | string 
    toAddress(prefix: number[] | string = [0]): string 
    deriveChild(privateKey: PrivateKey, invoiceNumber: string): PublicKey 
    static fromMsgHashAndCompactSignature(msgHash: BigNumber, signature: number[] | string, enc?: "hex" | "base64"): PublicKey 
}
```

<details>

<summary>Class PublicKey Details</summary>

#### Constructor

```ts
constructor(x: Point | BigNumber | number | number[] | string | null, y: BigNumber | number | number[] | string | null = null, isRed: boolean = true) 
```

Argument Details

+ **x**
  + A point or the x-coordinate of the point. May be a number, a BigNumber, a string (which will be interpreted as hex), a number array, or null. If null, an "Infinity" point is constructed.
+ **y**
  + If x is not a point, the y-coordinate of the point, similar to x.
+ **isRed**
  + A boolean indicating if the point is a member of the field of integers modulo the k256 prime. Default is true.

Example

```ts
new PublicKey(point1);
new PublicKey('abc123', 'def456');
```

#### Method deriveChild

Derives a child key with BRC-42.

```ts
deriveChild(privateKey: PrivateKey, invoiceNumber: string): PublicKey 
```

Returns

The derived child key.

Argument Details

+ **privateKey**
  + The private key of the other party
+ **invoiceNumber**
  + The invoice number used to derive the child key

#### Method deriveSharedSecret

Derive a shared secret from a public key and a private key for use in symmetric encryption.
This method multiplies the public key (an instance of Point) with a private key.

```ts
deriveSharedSecret(priv: PrivateKey): Point 
```

Returns

Returns the Point representing the shared secret.

Argument Details

+ **priv**
  + The private key to use in deriving the shared secret.

Throws

Will throw an error if the public key is not valid for ECDH secret derivation.

Example

```ts
const myPrivKey = new PrivateKey(...)
const sharedSecret = myPubKey.deriveSharedSecret(myPrivKey)
```

#### Method fromDER

Static factory method to create a PublicKey instance from a number array.

```ts
static fromDER(bytes: number[]): PublicKey 
```

Returns

Returns the PublicKey created from the number array.

Argument Details

+ **bytes**
  + A number array representing a public key.

Example

```ts
const myPubKey = PublicKey.fromString("03....")
```

#### Method fromMsgHashAndCompactSignature

Takes an array of numbers or a string and returns a new PublicKey instance.
This method will throw an error if the Compact encoding is invalid.
If a string is provided, it is assumed to represent a hexadecimal sequence.
compactByte value 27-30 means uncompressed public key.
31-34 means compressed public key.
The range represents the recovery param which can be 0,1,2,3.

```ts
static fromMsgHashAndCompactSignature(msgHash: BigNumber, signature: number[] | string, enc?: "hex" | "base64"): PublicKey 
```

Returns

A PublicKey instance derived from the message hash and compact signature.

Argument Details

+ **msgHash**
  + The message hash which was signed.
+ **signature**
  + The signature in compact format.
+ **enc**
  + The encoding of the signature string.

Example

```ts
const publicKey = Signature.fromMsgHashAndCompactSignature(msgHash, 'IMOl2mVKfDgsSsHT4uIYBNN4e...', 'base64');
```

#### Method fromPrivateKey

Static factory method to derive a public key from a private key.
It multiplies the generator point 'g' on the elliptic curve by the private key.

```ts
static fromPrivateKey(key: PrivateKey): PublicKey 
```

Returns

Returns the PublicKey derived from the given PrivateKey.

Argument Details

+ **key**
  + The private key from which to derive the public key.

Example

```ts
const myPrivKey = new PrivateKey(...)
const myPubKey = PublicKey.fromPrivateKey(myPrivKey)
```

#### Method fromString

Static factory method to create a PublicKey instance from a string.

```ts
static fromString(str: string): PublicKey 
```

Returns

Returns the PublicKey created from the string.

Argument Details

+ **str**
  + A string representing a public key.

Example

```ts
const myPubKey = PublicKey.fromString("03....")
```

#### Method toAddress

Base58Check encodes the hash of the public key with a prefix to indicate locking script type.
Defaults to P2PKH for mainnet, otherwise known as a "Bitcoin Address".

```ts
toAddress(prefix: number[] | string = [0]): string 
```

Returns

Returns the address encoding associated with the hash of the public key.

Argument Details

+ **prefix**
  + defaults to [0x00] for mainnet, set to [0x6f] for testnet or use the strings 'mainnet' or 'testnet'

Example

```ts
const address = pubkey.toAddress()
const address = pubkey.toAddress('mainnet')
const testnetAddress = pubkey.toAddress([0x6f])
const testnetAddress = pubkey.toAddress('testnet')
```

#### Method toDER

Encode the public key to DER (Distinguished Encoding Rules) format.

```ts
toDER(enc?: "hex" | undefined): number[] | string 
```

Returns

Returns the DER-encoded public key in number array or string.

Argument Details

+ **enc**
  + The encoding of the DER string. undefined = number array, 'hex' = hex string.

Example

```ts
const derPublicKey = myPubKey.toDER()
```

#### Method toHash

Hash sha256 and ripemd160 of the public key.

```ts
toHash(enc?: "hex"): number[] | string 
```

Returns

Returns the hash of the public key.

Example

```ts
const publicKeyHash = pubkey.toHash()
```

#### Method verify

Verify a signature of a message using this public key.

```ts
verify(msg: number[] | string, sig: Signature, enc?: "hex" | "utf8"): boolean 
```

Returns

Returns true if the signature is verified successfully, otherwise false.

Argument Details

+ **msg**
  + The message to verify. It can be a string or an array of numbers.
+ **sig**
  + The Signature of the message that needs verification.
+ **enc**
  + The encoding of the message. It defaults to 'utf8'.

Example

```ts
const myMessage = "Hello, world!"
const mySignature = new Signature(...)
const isVerified = myPubKey.verify(myMessage, mySignature)
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: SymmetricKey

`SymmetricKey` is a class that extends the `BigNumber` class and implements symmetric encryption and decryption methods.
Symmetric-Key encryption is a form of encryption where the same key is used to encrypt and decrypt the message.
It leverages the Advanced Encryption Standard Galois/Counter Mode (AES-GCM) for encryption and decryption of messages.

```ts
export default class SymmetricKey extends BigNumber {
    static fromRandom(): SymmetricKey 
    encrypt(msg: number[] | string, enc?: "hex"): string | number[] 
    decrypt(msg: number[] | string, enc?: "hex" | "utf8"): string | number[] 
}
```

<details>

<summary>Class SymmetricKey Details</summary>

#### Method decrypt

Decrypts a given AES-GCM encrypted message using the same key that was used for encryption.
The method extracts the IV and the authentication tag from the encrypted message, then attempts to decrypt it.
If the decryption fails (e.g., due to message tampering), an error is thrown.

```ts
decrypt(msg: number[] | string, enc?: "hex" | "utf8"): string | number[] 
```

Returns

Returns the decrypted message as a string or an array of numbers, depending on `enc` argument. If absent, an array of numbers is returned.

Argument Details

+ **msg**
  + The encrypted message to be decrypted. It can be a string or an array of numbers.
+ **enc**
  + optional. The encoding of the message (if no encoding is provided, uses utf8 for strings, unless specified as hex).

Throws

Will throw an error if the decryption fails, likely due to message tampering or incorrect decryption key.

Example

```ts
const key = new SymmetricKey(1234);
const decryptedMessage = key.decrypt(encryptedMessage, 'utf8');
```

#### Method encrypt

Encrypts a given message using AES-GCM encryption.
The generated Initialization Vector (IV) is attached to the encrypted message for decryption purposes.
The OpenSSL format of |IV|encryptedContent|authTag| is used.

```ts
encrypt(msg: number[] | string, enc?: "hex"): string | number[] 
```

Returns

Returns the encrypted message as a string or an array of numbers, depending on `enc` argument.

Argument Details

+ **msg**
  + The message to be encrypted. It can be a string or an array of numbers.
+ **enc**
  + optional. The encoding of the message. If hex, the string is assumed to be hex, UTF-8 otherwise.

Example

```ts
const key = new SymmetricKey(1234);
const encryptedMessage = key.encrypt('plainText', 'utf8');
```

#### Method fromRandom

Generates a symmetric key randomly.

```ts
static fromRandom(): SymmetricKey 
```

Returns

The newly generated Symmetric Key.

Example

```ts
const symmetricKey = SymmetricKey.fromRandom();
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: TransactionSignature

```ts
export default class TransactionSignature extends Signature {
    public static readonly SIGHASH_ALL = 1;
    public static readonly SIGHASH_NONE = 2;
    public static readonly SIGHASH_SINGLE = 3;
    public static readonly SIGHASH_FORKID = 64;
    public static readonly SIGHASH_ANYONECANPAY = 128;
    scope: number;
    static format(params: {
        sourceTXID: string;
        sourceOutputIndex: number;
        sourceSatoshis: number;
        transactionVersion: number;
        otherInputs: TransactionInput[];
        outputs: TransactionOutput[];
        inputIndex: number;
        subscript: Script;
        inputSequence: number;
        lockTime: number;
        scope: number;
    }): number[] 
    static fromChecksigFormat(buf: number[]): TransactionSignature 
    constructor(r: BigNumber, s: BigNumber, scope: number) 
    public hasLowS(): boolean 
    toChecksigFormat(): number[] 
}
```

<details>

<summary>Class TransactionSignature Details</summary>

#### Method hasLowS

Compares to bitcoind's IsLowDERSignature
See also Ecdsa signature algorithm which enforces this.
See also Bip 62, "low S values in signatures"

```ts
public hasLowS(): boolean 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
## Functions

| |
| --- |
| [AES](#function-aes) |
| [AESGCM](#function-aesgcm) |
| [AESGCMDecrypt](#function-aesgcmdecrypt) |
| [ghash](#function-ghash) |
| [pbkdf2](#function-pbkdf2) |
| [toArray](#function-toarray) |
| [toBase64](#function-tobase64) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

### Function: toArray

```ts
export function toArray(msg: number[] | string, enc?: "hex" | "utf8"): number[] 
```

<details>

<summary>Function toArray Details</summary>

Returns

array of byte values from msg. If msg is an array, a copy is returned.

Argument Details

+ **enc**
  + Optional. Encoding to use if msg is string. Default is 'utf8'.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Function: pbkdf2

Limited SHA-512-only PBKDF2 function for use in deprecated BIP39 code.

```ts
export function pbkdf2(password: number[], salt: number[], iterations: number, keylen: number, digest = "sha512"): number[] 
```

<details>

<summary>Function pbkdf2 Details</summary>

Returns

The computed key

Argument Details

+ **password**
  + The PBKDF2 password
+ **salt**
  + The PBKDF2 salt
+ **iterations**
  + The number of of iterations to run
+ **keylen**
  + The length of the key
+ **digest**
  + The digest (must be sha512 for this implementation)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Function: toBase64

Converts an array of bytes (each between 0 and 255) into a base64 encoded string.

Example

```ts
const bytes = [72, 101, 108, 108, 111]; // Represents the string "Hello"
console.log(toBase64(bytes)); // Outputs: SGVsbG8=
```

```ts
export function toBase64(byteArray: number[]): string 
```

<details>

<summary>Function toBase64 Details</summary>

Returns

The base64 encoded string.

Argument Details

+ **byteArray**
  + An array of numbers where each number is a byte (0-255).

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Function: AES

```ts
export function AES(input: number[], key: number[]): number[] 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Function: ghash

```ts
export function ghash(input: number[], hashSubKey: number[]): number[] 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Function: AESGCM

```ts
export function AESGCM(plainText: number[], additionalAuthenticatedData: number[], initializationVector: number[], key: number[]): {
    result: number[];
    authenticationTag: number[];
} 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Function: AESGCMDecrypt

```ts
export function AESGCMDecrypt(cipherText: number[], additionalAuthenticatedData: number[], initializationVector: number[], authenticationTag: number[], key: number[]): number[] | null 
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
## Types

## Variables

| | | |
| --- | --- | --- |
| [checkBit](#variable-checkbit) | [minimallyEncode](#variable-minimallyencode) | [sign](#variable-sign) |
| [encode](#variable-encode) | [multiply](#variable-multiply) | [toArray](#variable-toarray) |
| [exclusiveOR](#variable-exclusiveor) | [rightShift](#variable-rightshift) | [toBase58](#variable-tobase58) |
| [fromBase58](#variable-frombase58) | [ripemd160](#variable-ripemd160) | [toBase58Check](#variable-tobase58check) |
| [fromBase58Check](#variable-frombase58check) | [sha1](#variable-sha1) | [toHex](#variable-tohex) |
| [getBytes](#variable-getbytes) | [sha256](#variable-sha256) | [toUTF8](#variable-toutf8) |
| [hash160](#variable-hash160) | [sha256hmac](#variable-sha256hmac) | [verify](#variable-verify) |
| [hash256](#variable-hash256) | [sha512](#variable-sha512) | [zero2](#variable-zero2) |
| [incrementLeastSignificantThirtyTwoBits](#variable-incrementleastsignificantthirtytwobits) | [sha512hmac](#variable-sha512hmac) |  |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

### Variable: ripemd160

```ts
ripemd160 = (msg: number[] | string, enc?: "hex" | "utf8"): number[] => {
    return new RIPEMD160().update(msg, enc).digest();
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: sha1

```ts
sha1 = (msg: number[] | string, enc?: "hex" | "utf8"): number[] => {
    return new SHA1().update(msg, enc).digest();
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: sha256

```ts
sha256 = (msg: number[] | string, enc?: "hex" | "utf8"): number[] => {
    return new SHA256().update(msg, enc).digest();
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: sha512

```ts
sha512 = (msg: number[] | string, enc?: "hex" | "utf8"): number[] => {
    return new SHA512().update(msg, enc).digest();
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: hash256

```ts
hash256 = (msg: number[] | string, enc?: "hex" | "utf8"): number[] => {
    const first = new SHA256().update(msg, enc).digest();
    return new SHA256().update(first).digest();
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: hash160

```ts
hash160 = (msg: number[] | string, enc?: "hex" | "utf8"): number[] => {
    const first = new SHA256().update(msg, enc).digest();
    return new RIPEMD160().update(first).digest();
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: sha256hmac

```ts
sha256hmac = (key: number[] | string, msg: number[] | string, enc?: "hex"): number[] => {
    return new SHA256HMAC(key).update(msg, enc).digest();
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: sha512hmac

```ts
sha512hmac = (key: number[] | string, msg: number[] | string, enc?: "hex"): number[] => {
    return new SHA512HMAC(key).update(msg, enc).digest();
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: zero2

```ts
zero2 = (word: string): string => {
    if (word.length % 2 === 1) {
        return "0" + word;
    }
    else {
        return word;
    }
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: toHex

```ts
toHex = (msg: number[]): string => {
    let res = "";
    for (let i = 0; i < msg.length; i++) {
        res += zero2(msg[i].toString(16));
    }
    return res;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: toArray

```ts
toArray = (msg: any, enc?: "hex" | "utf8" | "base64"): any[] => {
    if (Array.isArray(msg)) {
        return msg.slice();
    }
    if (!(msg as boolean)) {
        return [];
    }
    const res: any[] = [];
    if (typeof msg !== "string") {
        for (let i = 0; i < msg.length; i++) {
            res[i] = msg[i] | 0;
        }
        return res;
    }
    if (enc === "hex") {
        msg = msg.replace(/[^a-z0-9]+/ig, "");
        if (msg.length % 2 !== 0) {
            msg = "0" + (msg as string);
        }
        for (let i = 0; i < msg.length; i += 2) {
            res.push(parseInt((msg[i] as string) + (msg[i + 1] as string), 16));
        }
    }
    else if (enc === "base64") {
        const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        const result: number[] = [];
        let currentBit: number = 0;
        let currentByte: number = 0;
        for (const char of msg.replace(/=+$/, "")) {
            currentBit = (currentBit << 6) | base64Chars.indexOf(char);
            currentByte += 6;
            if (currentByte >= 8) {
                currentByte -= 8;
                result.push((currentBit >> currentByte) & 255);
                currentBit &= (1 << currentByte) - 1;
            }
        }
        return result;
    }
    else {
        for (let i = 0; i < msg.length; i++) {
            const c = msg.charCodeAt(i);
            const hi = c >> 8;
            const lo = c & 255;
            if (hi as unknown as boolean) {
                res.push(hi, lo);
            }
            else {
                res.push(lo);
            }
        }
    }
    return res;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: toUTF8

```ts
toUTF8 = (arr: number[]): string => {
    let result = "";
    for (let i = 0; i < arr.length; i++) {
        const byte = arr[i];
        if (byte <= 127) {
            result += String.fromCharCode(byte);
        }
        else if (byte >= 192 && byte <= 223) {
            const byte2 = arr[++i];
            const codePoint = ((byte & 31) << 6) | (byte2 & 63);
            result += String.fromCharCode(codePoint);
        }
        else if (byte >= 224 && byte <= 239) {
            const byte2 = arr[++i];
            const byte3 = arr[++i];
            const codePoint = ((byte & 15) << 12) | ((byte2 & 63) << 6) | (byte3 & 63);
            result += String.fromCharCode(codePoint);
        }
        else if (byte >= 240 && byte <= 247) {
            const byte2 = arr[++i];
            const byte3 = arr[++i];
            const byte4 = arr[++i];
            const codePoint = ((byte & 7) << 18) | ((byte2 & 63) << 12) | ((byte3 & 63) << 6) | (byte4 & 63);
            const surrogate1 = 55296 + ((codePoint - 65536) >> 10);
            const surrogate2 = 56320 + ((codePoint - 65536) & 1023);
            result += String.fromCharCode(surrogate1, surrogate2);
        }
    }
    return result;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: encode

```ts
encode = (arr: number[], enc?: "hex" | "utf8"): string | number[] => {
    switch (enc) {
        case "hex":
            return toHex(arr);
        case "utf8":
            return toUTF8(arr);
        default:
            return arr;
    }
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: fromBase58

```ts
fromBase58 = (str: string): number[] => {
    if (!str || typeof str !== "string") {
        throw new Error(`Expected base58 string but got “${str}”`);
    }
    if (str.match(/[IOl0]/gmu)) {
        throw new Error(`Invalid base58 character “${str.match(/[IOl0]/gmu)}”`);
    }
    const lz = str.match(/^1+/gmu);
    const psz: number = lz ? lz[0].length : 0;
    const size = ((str.length - psz) * (Math.log(58) / Math.log(256)) + 1) >>> 0;
    const uint8 = new Uint8Array([
        ...new Uint8Array(psz),
        ...str
            .match(/.{1}/gmu)
            .map((i) => base58chars.indexOf(i))
            .reduce((acc, i) => {
            acc = acc.map((j) => {
                const x = j * 58 + i;
                i = x >> 8;
                return x;
            });
            return acc;
        }, new Uint8Array(size))
            .reverse()
            .filter(((lastValue) => (value) => (lastValue = lastValue || value))(false))
    ]);
    return [...uint8];
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: toBase58

```ts
toBase58 = (bin: number[]): string => {
    const base58Map = Array(256).fill(-1);
    for (let i = 0; i < base58chars.length; ++i) {
        base58Map[base58chars.charCodeAt(i)] = i;
    }
    const result = [];
    for (const byte of bin) {
        let carry = byte;
        for (let j = 0; j < result.length; ++j) {
            const x = (base58Map[result[j]] << 8) + carry;
            result[j] = base58chars.charCodeAt(x % 58);
            carry = (x / 58) | 0;
        }
        while (carry) {
            result.push(base58chars.charCodeAt(carry % 58));
            carry = (carry / 58) | 0;
        }
    }
    for (const byte of bin) {
        if (byte)
            break;
        else
            result.push("1".charCodeAt(0));
    }
    result.reverse();
    return String.fromCharCode(...result);
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: toBase58Check

```ts
toBase58Check = (bin: number[], prefix: number[] = [0]) => {
    let hash = hash256([...prefix, ...bin]);
    hash = [...prefix, ...bin, ...hash.slice(0, 4)];
    return toBase58(hash);
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: fromBase58Check

```ts
fromBase58Check = (str: string, enc?: "hex", prefixLength: number = 1) => {
    const bin = fromBase58(str);
    let prefix: string | number[] = bin.slice(0, prefixLength);
    let data: string | number[] = bin.slice(prefixLength, -4);
    let hash = [...prefix, ...data];
    hash = hash256(hash);
    bin.slice(-4).forEach((check, index) => {
        if (check !== hash[index]) {
            throw new Error("Invalid checksum");
        }
    });
    if (enc === "hex") {
        prefix = toHex(prefix);
        data = toHex(data);
    }
    return { prefix, data };
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: minimallyEncode

```ts
minimallyEncode = (buf: number[]): number[] => {
    if (buf.length === 0) {
        return buf;
    }
    const last = buf[buf.length - 1];
    if ((last & 127) !== 0) {
        return buf;
    }
    if (buf.length === 1) {
        return [];
    }
    if ((buf[buf.length - 2] & 128) !== 0) {
        return buf;
    }
    for (let i = buf.length - 1; i > 0; i--) {
        if (buf[i - 1] !== 0) {
            if ((buf[i - 1] & 128) !== 0) {
                buf[i++] = last;
            }
            else {
                buf[i - 1] |= last;
            }
            return buf.slice(0, i);
        }
    }
    return [];
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: sign

```ts
sign = (msg: BigNumber, key: BigNumber, forceLowS: boolean = false, customK?: BigNumber | Function): Signature => {
    const curve = new Curve();
    msg = truncateToN(msg);
    const bytes = curve.n.byteLength();
    const bkey = key.toArray("be", bytes);
    const nonce = msg.toArray("be", bytes);
    const drbg = new DRBG(bkey, nonce);
    const ns1 = curve.n.subn(1);
    for (let iter = 0;; iter++) {
        let k = typeof customK === "function"
            ? customK(iter)
            : BigNumber.isBN(customK)
                ? customK
                : new BigNumber(drbg.generate(bytes), 16);
        k = truncateToN(k, true);
        if (k.cmpn(1) <= 0 || k.cmp(ns1) >= 0) {
            if (BigNumber.isBN(customK)) {
                throw new Error("Invalid fixed custom K value (must be more than 1 and less than N-1)");
            }
            else {
                continue;
            }
        }
        const kp = curve.g.mul(k);
        if (kp.isInfinity()) {
            if (BigNumber.isBN(customK)) {
                throw new Error("Invalid fixed custom K value (must not create a point at infinity when multiplied by the generator point)");
            }
            else {
                continue;
            }
        }
        const kpX = kp.getX();
        const r = kpX.umod(curve.n);
        if (r.cmpn(0) === 0) {
            if (BigNumber.isBN(customK)) {
                throw new Error("Invalid fixed custom K value (when multiplied by G, the resulting x coordinate mod N must not be zero)");
            }
            else {
                continue;
            }
        }
        let s = k.invm(curve.n).mul(r.mul(key).iadd(msg));
        s = s.umod(curve.n);
        if (s.cmpn(0) === 0) {
            if (BigNumber.isBN(customK)) {
                throw new Error("Invalid fixed custom K value (when used with the key, it cannot create a zero value for S)");
            }
            else {
                continue;
            }
        }
        if (forceLowS && s.cmp(curve.n.ushrn(1)) > 0) {
            s = curve.n.sub(s);
        }
        return new Signature(r, s);
    }
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: verify

```ts
verify = (msg: BigNumber, sig: Signature, key: Point): boolean => {
    const curve = new Curve();
    msg = truncateToN(msg);
    const r = sig.r;
    const s = sig.s;
    if (r.cmpn(1) < 0 || r.cmp(curve.n) >= 0) {
        return false;
    }
    if (s.cmpn(1) < 0 || s.cmp(curve.n) >= 0) {
        return false;
    }
    const sinv = s.invm(curve.n);
    const u1 = sinv.mul(msg).umod(curve.n);
    const u2 = sinv.mul(r).umod(curve.n);
    const p = curve.g.jmulAdd(u1, key, u2);
    if (p.isInfinity()) {
        return false;
    }
    return p.eqXToP(r);
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: checkBit

```ts
checkBit = function (byteArray: number[], byteIndex: number, bitIndex: number): 1 | 0 {
    return (byteArray[byteIndex] & (1 << bitIndex)) !== 0 ? 1 : 0;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: getBytes

```ts
getBytes = function (numericValue: number): number[] {
    return [
        (numericValue & 4278190080) >>> 24,
        (numericValue & 16711680) >> 16,
        (numericValue & 65280) >> 8,
        numericValue & 255
    ];
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: exclusiveOR

```ts
exclusiveOR = function (block0: number[], block1: number[]): number[] {
    let i;
    const result = [];
    for (i = 0; i < block0.length; i++) {
        result[i] = block0[i] ^ block1[i];
    }
    return result;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: rightShift

```ts
rightShift = function (block: number[]): number[] {
    let i: number;
    let carry = 0;
    let oldCarry = 0;
    for (i = 0; i < block.length; i++) {
        oldCarry = carry;
        carry = block[i] & 1;
        block[i] = block[i] >> 1;
        if (oldCarry !== 0) {
            block[i] = block[i] | 128;
        }
    }
    return block;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: multiply

```ts
multiply = function (block0: number[], block1: number[]): number[] {
    let i;
    let j;
    let v = block1.slice();
    let z = createZeroBlock(16);
    for (i = 0; i < 16; i++) {
        for (j = 7; j !== -1; j--) {
            if (checkBit(block0, i, j) !== 0) {
                z = exclusiveOR(z, v);
            }
            if (checkBit(v, 15, 0) !== 0) {
                v = exclusiveOR(rightShift(v), R);
            }
            else {
                v = rightShift(v);
            }
        }
    }
    return z;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: incrementLeastSignificantThirtyTwoBits

```ts
incrementLeastSignificantThirtyTwoBits = function (block: number[]): number[] {
    let i;
    const result = block.slice();
    for (i = 15; i !== 11; i--) {
        result[i] = result[i] + 1;
        if (result[i] === 256) {
            result[i] = 0;
        }
        else {
            break;
        }
    }
    return result;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
