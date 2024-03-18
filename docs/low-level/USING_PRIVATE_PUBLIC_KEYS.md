# Generating, Serializing, and Deserializing Private and Public Keys

Private keys protect Bitcoins, enable secure message signing, among other vital roles in the BSV ecosystem. Public keys enable ownership tracking, message attestation, and attribution for signed messages, among other use-cases. In this low-level tutorial, we will learn how to generate, serialize and deserialize public and private keys using the functions provided by the SDK.

## Getting Set Up

We'll be making use of two SDK modules in this guide. Make sure you've installed the `@bsv/sdk` package in your project, then import the modules we'll be using:

- **PrivateKey** - this class will enable to you create a new PrivateKey from various sources such as random, hex string, and WIP. It can also transform a private key into a public key.
- **Utils** - the SDK provides several helpful utility functions such as `toArray` and and `toUTF8` which allow you to serialize and deserialize data as needed.

```ts
import { PrivateKey, Utils } from '@bsv/sdk'
```

## Generating and Deserializing Keys
First, we will learn how to generate new cryptographic keys to be used within your applications. Unless generating a new private key from random, this will most often involve deserializing a key from various types the most common being such as hex, WIF, and binary.

Here is an example of how this can be done:

```ts
  const privKeyRandom = PrivateKey.fromRandom()
  const privKeyFromHex = PrivateKey.fromHex('08dcced21ebf831cb1b1d320c5de2dee690ebea9b4930a7f1af9b7bde8f7858a')
  const privKeyFromHex2 = PrivateKey.fromString('08dcced21ebf831cb1b1d320c5de2dee690ebea9b4930a7f1af9b7bde8f7858a', 'hex')
  const privKeyFromWif = PrivateKey.fromWif('L3dyA911FSFwSpgzRFhncUTRPk57aNTHkEhRtXoi4W7fz63bR45W')
  const privKeyFromBinary = new PrivateKey(Utils.toArray('e0f6f9084f02a59cdc0aa9498b28fe8e20d0d4eeeb19af629761099210990894', 'hex'))
```

We can then transform these to find the corresponding public key  as follows:

```ts
  const privKeyRandom = PrivateKey.fromRandom()
  // Get the corresponding public key
  let pubKey = privKeyRandom.toPublicKey()
```

## Serializing Keys

Sometimes you will want to convert private / public keys into a format that can be more easily transported in your applications such as hex or binary.

Let's explore the available functions the SDK provides.

### Private Keys
Serialize a private key into hex and binary:
```ts
  // Starting private key
  const privKey = PrivateKey.fromRandom()

  // Serialized formats
  const privKeyHex = privKey.toHex()
  const privKeyBinary = privKey.toArray()
  const privKeyWif = privKey.toWif()
```

### Public Keys
Public keys can be serialized as well, and include helper functions to serialize into common formats such as an address or DER.

```ts
  
  const privateKey = PrivateKey.fromRandom()
  const publicKey = privateKey.toPublicKey()
  const publicKeyHex = publicKey.toString()
  const publicKeyAddress = publicKey.toAddress()
  const publicKeyDER = publicKey.toDER()

  // Serialize a public key using function chaining
  const publicKey = PrivateKey.fromRandom().toPublicKey().toString()
```

Now you should be able to manage cryptographic keys with the SDK, including generating, serializing, and deserializing both private and public keys. These skills are important for using low-level cryptographic keys, ensuring you have the necessary tools to leverage the security benefits they offer and to implement advanced cryptographic functions within your applications.
