# Type 42 Key Derivation

The BSV SDK supports type-42 key derivation, which is a way for two people who have master keys to derive child keys from one another, given a specific string called an invoice number. They can then use these keys for message signing, message encryption or any other purpose.

This guide will cover the process of type-42 derivation, the steps involved, and then demonstrate a simple example of using it for message signing. Finally, we will talk about the "anyone key" and why it can sometimes be useful within type-42 systems.

## The Process

The process starts with two users, who each generate a "master key" from which everything else will be based. Then, they share the associated public key with the other party.

Next, they make use of [ECDH](./ECDH.md) to arrive at a shared secret between themselves. They agree on the "invoice number" they will be using to communicate. We call it an invoice number because type-42 has historically been used for Bitcoin payments. In reality, this is just the unique identifier for the keys to derive.

Now, they compute an [HMAC](./USING_HASHES_AND_HMACS.md) over the invoice number, using the shared secret as the HMAC key. Because the shared secret is private, the HMAC hash function initialized with its value is only usable by the two parties. This means only these two people can hash the invoice number in this unique way.

Finally, the output of the HMAC function over the invoice number is used for key derivation. If Alice wants to derive a key from Bob, she will add this HMAC output to Bob's master public key. Conversely, if Bob wants to derive his own private key to match, he can add the same vlue to his original master private key.

Every invoice number leads to a unique, privately-derivable key in a "shared key universe" occupied only by Alice and Bob. Alice can derive public keys for Bob, and Bob can derive the corresponding private keys. Conversely, Bob can derive public keys for Alice, and Alice can derive the corresponding private keys. They just need to agree on the right invoice number to use, and know each other's master public keys.

Because no one else can compute a shared secret between these two values, no one else can use the special HMAC function over the invoice numbers, and thus no one else can link the master keys of either party to any other party.

## Practical Example

Let's use the BSV SDK to create a practical example. Here, Alice and Bob will generate private keys. Then, Alice will sign a message privately for Bob to verify, using a specific invoice number. Finally, Bob will use the invoice number to deriv Alice's child signing public key, so he can verify the message that Alice signed for him:

```ts
import { PrivateKey, Utils } from '@bsv/sdk'

const alice = PrivateKey.fromRandom()
const alicePub = alice.toPublicKey()

const bob = PrivateKey.fromRandom()
const bobPub = bob.toPublicKey()

// Both parties agree on an invoice number to use
const invoiceNumber = '2-simple signing protocol-1'

// Alice derives a child private key for signing
const aliceSigningChild = alice.deriveChild(bobPub, invoiceNumber)

// Alice signs a message for Bob
const message = Utils.toArray('Hi Bob', 'utf8')
const signature = aliceSigningChild.sign(message)

// Bob derives Alice's correct signing public key from her master public key
const aliceSigningPub = alicePub.deriveChild(bob, invoiceNumber)

// Now, Bob can privately verify Alice's signature
const verified = aliceSigningPub.verify(message, signature)
console.log(verified)
// true
```

This enables people to securely agree on which keys to use, and derive keys for one another privately.