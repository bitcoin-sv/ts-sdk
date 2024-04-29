# Example: BIP32 Key Derivation with HD Wallets

For a long time, BIP32 was the standard way to structure a Bitcoin wallet. While [type-42](EXAMPLE_TYPE_42.md) has since taken over as the standard approach due to its increased privacy and open-ended invoice numbering scheme, it's sometimes still necessary to interact with legacy systems using BIP32 key derivation.

This guide will show you how to generate keys, derive child keys, and convert them to WIF and Bitcoin address formats. At the end, we'll compare BIP32 to the [type-42 system and encourage you to adopt the new approach](EXAMPLE_TYPE_42.md) to key management.

## Generating BIP32 keys

You can generate a BIP32 seed with the SDK as follows:

```typescript
import { HD } from '@bsv/sdk'
const randomKey = HD.fromRandom()

// Convert your "xprv" key to a string
console.log(randomKey.toString())

// Example: xprv9s21ZrQH143K2vF2szsDFhrRehet4iHNCBPWprjymByU9mzN7n687qj3ULQ2YYXdNqFwhVSsKv9W9fM675whM9ATaYrmsLpykQSxMc6RN8V
```

You can also import an existing key as follows:

```typescript
const importedKey = HD.fromString('xprv...')
```

Now that you've generated or imported your key, you're ready to derive child keys.

## Deriving Child Keys

BIP32 child keys can be derived from a key using the `.derive()` method. Here's a full example:

```typescript
const key = HD.fromString('xprv9s21ZrQH143K2vF2szsDFhrRehet4iHNCBPWprjymByU9mzN7n687qj3ULQ2YYXdNqFwhVSsKv9W9fM675whM9ATaYrmsLpykQSxMc6RN8V')
const child = key.derive('m/0/1/2')
console.log(child.toString())
// 'xprv9yGx5dNDfq8pt1DJ9SFCK3gNFhjrL3kTqEj98oDs6xvfaUAUs3nyvVakQzwHAEMrc6gg1c3iaNCDubUruhX75gNHC7HAnFxHuxeiMVgLEqS'
```

Any of the standard derivation paths can be passed into the `.derive()` method.

## Converting Between Formats

XPRIV keys can be converted to normal `PrivateKey` instances, and from there to WIF keys. XPUB keys can be converted to normal `PublicKey` instances, and from there to Bitcoin addresses. XPRIV keys can also be converted to XPUB keys:

```typescript
const key = HD.fromString('xprv9s21ZrQH143K2vF2szsDFhrRehet4iHNCBPWprjymByU9mzN7n687qj3ULQ2YYXdNqFwhVSsKv9W9fM675whM9ATaYrmsLpykQSxMc6RN8V')

// Convert XPRIV to XPUB
const xpubKey = key.toPublic()
console.log(xpubKey.toString());
// xpub661MyMwAqRbcFQKVz2QDcqoACjVNUB1DZQK7dF9bKXWT2aKWfKQNfe3XKakZ1EnxeNP5E4MqZnZZw4P7179rPbeJEjhYbwF5ovkbGkeYPdF

// Convert XPRIV to WIF
console.log(key.privKey.toWif())
// L1MZHeu2yMYRpDr45icTvjN7s3bBK1o7NgsRMkcfhzgRjLzewAhZ

// Convert XPUB to public key
console.log(xpubKey.pubKey.toString())
// 022248d79bf217de60fa4afd4c7841e4f957b6459ed9a8c9c01b61e16cd4da3aae

// Convert XPUB to address
console.log(xpubKey.pubKey.toAddress())
// 1CJXwGLb6GMCF46A721VYW59b21kkoRc5D
```

This guide has demonstrated how to use BIP32 for key derivation and format conversion. You can continue to use BIP32 within BSV wallet applications, but it's important to consider the disadvantages and risks of continued use, which are discussed below.

## Disadvantages and Risks

BIP32 allows anyone to derive child keys if they know an XPUB. The number of child keys per parent is limited to 2^31, and there's no support for custom invoice numbering schemes that can be used when deriving a child, only a simple integer. Finally, BIP32 has no support for private derivation, where two parties share a common key universe no one else can link to them, even while knowing the master public key. It's for these reasons that we recommend the use of type-42 over BIP32. You can read an equivalent guide [here](EXAMPLE_TYPE_42.md).
