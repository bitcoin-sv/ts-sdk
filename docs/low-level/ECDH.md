# ECDH (Elliptic Curve Diffie-Hallman)

The process of ECDH enables two parties to agree on a common shared secret. Then, messages can be exchanged using this common secret. This guide provides a conceptual example, then delves into a practical example.

## The Setup

Each party randomly generates a private key, then sends the associated public key to the other party. In order to compute the public key from the private key, they multiply the private key by a generator point on an elliptic curve, using point multiplication.

```
Alice = random()
AlicePub = Alice * GeneratorPoint
Bob = random()
BobPub = Bob * GeneratorPoint
```

Then, the parties use Elliptic Curve Diffie-Hallman (ECDH) to derive a shared secret. The way this works is that the first party, let's call her Alice, uses her private key combined with the second user's (call him Bob) public key to compute a secret. Meanwhile, Bob can use his private key and Alice's public key to compute the same secret:

```
AliceSecret = Alice * BobPub
BobSecret = Bob * AlicePub
```

These secrets are equal because:

```
AlicePub (Alice * GeneratorPoint) * Bob = BobPub (Bob * GeneratorPoint) * Alice
```

Put more simply:

```
Alice * Bob * GeneratorPoint
Bob * Alice * GeneratorPoint
```

Because multiplication is easy but division is practically impossible in elliptic curve math, the system is secure even though both parties generate the same shared secret. Also, no third party can generate the shared secret. Alice can't learn Bob's private key and Bob can't learn Alice's private key.

## Practical Demonstration

The BSV SDK enables the computation of a shared secret as follows:

```ts
import { PrivateKey } from '@bsv/sdk'

const alice = PrivateKey.fromRandom()
const alicePub = alice.toPublicKey()

const bob = PrivateKey.fromRandom()
const bobPub = bob.toPublicKey()

// Alice derives the secret with Bob's public key
// She does not need his private key.
const aliceSecret = alice.deriveSharedSecret(bobPub).toString()

// Bob derives the secret with Alice's public key
// He does not need her private key.
const bobSecret = bob.deriveSharedSecret(alicePub).toString()

// We've converted these secrets into hex and now we can see if they are equal
console.log(aliceSecret === bobSecret)
// true
```

You can then use the secret to encrypt data or otherwise communicate securely between the two parties.
