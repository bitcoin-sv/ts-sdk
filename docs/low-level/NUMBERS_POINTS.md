# Numbers and Points

At the base of both symmetric and asymmetric algorithms lie the concept of numbers, large enough to represent a key that can be used in various operations. Further, asymmetric systems based in elliptic curves rely on a way to represent the points on these curves. Both numbers and points have various mathematical operations that enable these algorithms, and this guide will provide an overview of the SDK's implementations of each.

## Big Numbers

In JavaScript and TypeScript, natural numbers are limited to 53 bits of precision. This means that it's not possible to have numbers larger than 2 to the power of 53. However, the keys used in secure algorithms, such as those used in Bitcoin, are on the order of 256 bits in length. This means that we need a specialized representation of these large numbers, and the necessary mathematical operations on them.

The SDK's `BigNumber` class provides this capability. Here's a simple example:

```ts
import { BigNumber, Random } from '@bsv/sdk'

const bn1 = new BigNumber(7)
const bn2 = new BigNumber(4)
const bn3 = bn1.add(bn2)
console.log(bn3.toNumber())
// 11
```

Here, we're creating two "big" numbers and adding them together. These numbers aren't actually very large, but they illustrate the point. We can use larger numbers, generating them randomly, and convert them into hex:

```ts
// Generate a BigNumber from 32 random bytes (256 bits, like Bitcoin private keys)
const bn1 = new BigNumber(Random(32))
console.log(bn1.toHex())
// 31af7e86775fbbab9b8618eaad8d9782251cc67ff7366d7f59aee5455119c44f

// Multiply this number by 65536
const bn2 = bn1.muln(65536)

// Printed on the screen, this should be two bytes shfted over in hex
// This amounts to four extra zeroes at the end
console.log(bn2.toHex())
// 31af7e86775fbbab9b8618eaad8d9782251cc67ff7366d7f59aee5455119c44f0000
```

It's also possible to do many othe operations, like subtraction, division, and conversion into various formats:

```ts
const bn1 = new BigNumber(21)
const bn2 = new BigNumber(5)

console.log(bn1.sub(bn2).toNumber()) // 16

// Note that decimal numbers are not supported.
// For division, we are expecting a whole number.
console.log(bn1.div(bn2).toNumber()) // 4

// We can get the remainder with the modulous function.
console.log(bn1.mod(bn2).toNumber()) // 1

// BigNumbers can be imported and exported to various formats
const bn3 = new BigNumber(Random(6))
console.log(bn3.toHex()) // e09bcaeda91c
console.log(bn3.toBitArray()) // binary value
console.log(bn3.toArray()) // [ 224, 155, 202, 237, 169, 28 ]
```

Private keys and symmetric keys are just an extension of the `BigNumber` class, enabling access to various specialized algorithms like digital signatures and encryption, respectively. When considering public keys, we need to go further and talk about elliptic curves and points.

## Curves and Points

An elliptic curve has various properties and mathematical primitives. The curve used in Bitcoin is called `secp256k1`, and the SDK provides an implementation in the `Curve` class. In order to get started using a curve, you will need the generator point. The generator point can be multiplied with a private key in order to get a corresponding public key.

Let's start by importing the `Curve` class, generating a private key (a random number), and multiplying it by the generator point (called `G`) to get a point representing the corresponding public key:

```ts
import { Curve, BigNumber, Random } from '@bsv/sdk'

const curve = new Curve()
const privateKey = new BigNumber(Random(32))
const G = curve.g
const publicPoint = G.mul(privateKey)
console.log(`Private key: ${privateKey.toHex()}`)
// Private key: fd026136e9803295655bb342553ab8ad3260bd5e1a73ca86a7a92de81d9cee78

console.log(`Public key: ${publicPoint.toString()}`)
// Public key: 028908061925dac16b651e814995cba3dac8acbf8cf1bade40920a31a1611e6970
```

Now, the public key can be shared with the world, and the private key remains secure. This is because the process of point multiplication is impractical to reverse (there is no "point division" or "dividing by the generator point").

## Point Addition and Multiplication

Points are represented (wrapped) at a higher level by the SDK's `PublicKey` class, which simply adds some extra helper functions. Conversely, the SDK wraps Big Numbers with the `PrivateKey` class to extend their functionality.

When dealing with points, we can perform other useful operations. For example, the [type 42 scheme](./TYPE_42.md) talks about adding one point to another. We will demonstrate, and then we'll go further to show the multiplication of a point by a number, to show the process behind [ECDH](./ECDH.md):

```ts
import { Curve, BigNumber, Random } from '@bsv/sdk'

const curve = new Curve()
const G = curve.g

const key1 = new BigNumber(Random(32))
const pubpoint1 = G.mul(key1)

const key2 = new BigNumber(Random(32))
const pubpoint2 = G.mul(key2)

// two points can be added together
const added1and2 = pubpoint1.add(pubpoint2)
console.log(`${pubpoint1.toString()} + ${pubpoint2.toString()} = ${added1and2.toString()}`)
// 0280879ebda787e241ecaf27e29b0539e7a1d3895ee6c881b6e5b3c4468f379bd1 + 03ffd671622049d8f6ccb11f17dcf88fcd43d0916d9698b3d338bb9360e24d48ec = 0254b1a5132c040688f7b85a4ef56cc968c87552222d5ebeefca13f65b88790eb1

// (A * BG) = (B * AG) (this demonstrates why ECDH works)
const mul1and2 = pubpoint1.mul(key2)
console.log(`${pubpoint1.toString()} * ${key2.toHex()} = ${mul1and2.toString()}`)
const mul2and1 = pubpoint2.mul(key1)
console.log(`${pubpoint2.toString()} * ${key1.toHex()} = ${mul2and1.toString()}`)
// 0280879ebda787e241ecaf27e29b0539e7a1d3895ee6c881b6e5b3c4468f379bd1 * 695a2ce8dbf5f1889eac7a5c3711d01e3b863df8ef530b9319924a354e5c20dd = 03f3c29024e3ada33a5ea2258544c63108a8c060378dcd5a69ef69851a8a25ad1f
// 03ffd671622049d8f6ccb11f17dcf88fcd43d0916d9698b3d338bb9360e24d48ec * b329e4c294d2b04b3d6907492a0e471255d93d06472fcb2b1228d6f364c25940 = 03f3c29024e3ada33a5ea2258544c63108a8c060378dcd5a69ef69851a8a25ad1f
```

These lower-level constructs are useful when dealing with key derivation schemes, or when you need to perform specific mathematical operations on public, private or symmetric keys. Keep in mind that because public keys are an extension of `Point`, and because private and symmetric keys extend `BigNumber`, all of the low-level tools from these powerful base classes are always available for your use.
