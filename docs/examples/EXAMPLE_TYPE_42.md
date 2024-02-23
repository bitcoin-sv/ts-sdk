# Example: Using Type 42 Key Derivation for Bitcoin Wallet Management

Welcome to this type-42 key derivation guide! We're glad you're here, especially if you're migrating from an older key derivation system. Type-42 is more private, more elegant and it's easy to understand.

This guide will walk you through using type-42 keys in the context of a Bitcoin wallet.

## Generating keys

Generating type-42 keys with the SDK is identical to generating normal private keys. Secretly, every private key (and public key) in the SDK is already a type-42 key!

```typescript
import { PrivateKey } from '@bsv/sdk'

const privateKey = PrivateKey.fromRandom()
```

Now, we can move on to key derivation.

## Type 42 Key Derivation

In type-42 systems, you provide a counterparty key when deriving, as well as your own. There is always one public key and one private key. It's either:

- Your private key and the public key of your counterparty are used to derive one of your private keys, or
- Your private key and the public key of your counterparty are used to derive one of their public keys

When you and your counterparty use the same invoice number to derive keys, the public key you derive for them will correspond to the private key they derive for themselves. A private key that you derive for yourself will correspond to the public key they derived for you.

Once you understand those concepts, we're ready to jump into some code!

### Alice and Bob

Let's consider the scenario of Alice and Bob, who want to exchange some Bitcoin. How can Alice send Bitcoins to Bob?

1. Alice learns Bob's master public key, and they agree on the Bitcoin aount to exchange.
2. They also agree on an invoice number.
3. Alice uses Bob's master public key with her private key to derive the payment key she will use.
4. Alice creates a Bitcoin transaction and pays Bob the money.
5. Bob uses Alice's public key and his own private key to derive the corresponding private key, verifying it matches the transaction Alice sent him.

Here's an example:

```typescript
// Alice and Bob have master private keys...
const alice = PrivateKey.fromRandom()
const bob = PrivateKey.fromRandom()
alice.toString()
'106674548343907642146062962636638307981249604845652704224160905817279514790351'
bob.toString()
'108446104340374144960104248963000752145648236191076545713737995455205583156408'

// ... and master public keys
const alicePub = alice.toPublicKey()
const bobPub = bob.toPublicKey()
alicePub.toString()
'0260846fbaf8e950c1896d360954a716f26699252b879fea1743a9f78a0950d167'
bobPub.toString()
'0258bfa42bd832c4ab655295cac5e2f64daefb2b4cd9a2b72bdd3c3f9ba5076cb7'

// To pay Alice, they agree on an invoice number and then Bob derives a key where he can pay Alice
const paymentKey = alicePub.deriveChild(bob, 'AMZN-44-1191213')

// The key can be converted to an address if desired
paymentKey2.toAddress()
'1HqfEfHNF9ji9p3AEC66mj8fhGA7sy2WYT'

// To unlock the coins, Alice derives the private key with the same invoice number, using Bob's public key
const paymentPriv = alice.deriveChild(bobPub, 'AMZN-44-1191213')

// The key can be converted to WIF if desired
paymentPriv.toWif()
'L22stYh323a8DfBNunLvxrcrxudT2YXjdKxe1q9ecARYT9XfFGGc'

// To check, Alice can convert the private key back into an address.
paymentPriv.toPublicKey().toAddress()
'1HqfEfHNF9ji9p3AEC66mj8fhGA7sy2WYT'
```

This provides privacy for Alice and Bob, even if eeryone in the world knows Alice and Bob's master public keys.

## Going Further: Public Derivation

Sometimes, there is a legitimate reason to do "public key derivation" from a key, so that anyone can link a master key to a child key, like in BIP32. To accomplish this, rather than creating a new algorithm, we just use a private key that everyone already knows: the number `1`.

```typescript
alicePub.deriveChild(new PrivateKey(1), '1').toString()
'0391ff4958a6629be3176330bed0efd99d860f2b7630c21b2e33a42f3cd1740544'
alicePub.deriveChild(new PrivateKey(1), '2').toString()
'022ea65d6d66754dc7d94e197dab31a4a8854cdb28d57f216e765af7dfddb5322d'
alicePub.deriveChild(new PrivateKey(1), 'Bitcoin SV').toString()
'039e9bf79f4cf7accc061d570b1282bd24d2045be44584e8c6744cd3ff42e1758c'
alicePub.deriveChild(new PrivateKey(1), '2-tempo-1').toString() // BRC-43 :)
'02fd1e62689b7faaa718fabe9593da718fb2f966a9b391e5c48f25b1f9fbd4e770'
```

Because everyone knows the number `1`, everyone can derive Alice's public keys with these invoice numbers. But only Alice can derive the corresponding private keys:

```typescript
alice.deriveChild(new PrivateKey(1).toPublicKey(), '1').toString()
'5097922263303694608415912843049723146488598519566487750842578489217455687866'
alice.deriveChild(new PrivateKey(1).toPublicKey(), '2').toString()
'30335387255051916743526252561695774618041865683431443265879198629898915116869'
alice.deriveChild(new PrivateKey(1).toPublicKey(), 'Bitcoin SV').toString()
'78577766545688955856149390014909118010252835780550951683873199149559002824861'
alice.deriveChild(new PrivateKey(1).toPublicKey(), '2-tempo-1').toString() // BRC-43 :)
'85481526811941870977151386860102277207605069038305420293413543998866547111586'
```

The type-42 system enables both public and private key derivation, all while providing a more flexible and open-ended invoice numbering scheme than BIP32.
