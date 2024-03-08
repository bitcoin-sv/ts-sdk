# Using Hashes and HMACs

Hashes allow you to check the integrity of a message, by providing a deterministic one-way function that ransforms the input data. Hashes are widely useful, especially within Bitcoin. The BSV SDK provides first-class support for the hashing functions used within Bitcoin and its scripting language.

In this tutorial, we will learn how to use hashes and HMACs (Hash-based Message Authentication Codes) to verify the integrity of information, ensuring it has not been changed.

## Setting Up

First, install the `@bsv/sdk` package into your project. We will be using two SDK modules for this exercise:

- **Hash** - contains the hash and HMAC functions we will be using.
- **Utils** - the SDK provides several helpful utility functions such as `toArray` and and `toUTF8` which allow you to encode and transform data as needed.

```ts
import { Hash, Utils } from '@bsv/sdk'
```

## Creating a Hash

The following code performs a straightforward SHA256 hash of a message with the resulting hash returned as a hex string. 

This is a one-way process where the input message is transformed into a fixed-size string (the hash), which acts as a unique representation of the input data. It's primarily used for verifying data integrity.

```ts
  let sha256Hasher = new Hash.SHA256()
  sha256Hasher.update('Message to hash')
  let hashedMessage = sha256Hasher.digestHex()
  // console.log(hashedMessage)
  // -> f1aa45b0f5f6703468f9b9bc2b9874d4fa6b001a170d0f132aa5a26d00d0c7e5
```

A binary hash can also be produced by using the `digest` function instead of `digestHex`.

```ts
  let hmacMessage = hmacHasher.digest()
```

Other hashing algorithms are also supported including the following:
- `Hash.RIPEMD160`
- `Hash.SHA1`
- `Hash.SHA512`

There are also shorthand helpers, which will construct the hashesr and digest the message automatically. For example, we can use the `hash.sha256` function as follows:

```ts
const result = Hash.sha256(toArray('hello, world', 'utf8'))
```

In addition to simple hashes, the library also support HMAC functions.

## Creating an HMAC

In comparison to standard hashing, the following code introduces HMAC which combines a secret key with the hashing process to provide both data integrity and authentication. 

A key is involved in the hashing process, making the output hash specific not just to the message but also to the key. This means the same message hashed with a different key would produce a different result, adding a layer of security.

```ts
  let hmacHasher = new Hash.SHA256HMAC('key')
  hmacHasher.update('Message to hash')
  let hmacMessageHex = hmacHasher.digestHex()
  // console.log
  // -> 41495ec4a050f4059f20c8722b6308efe6e0a90a6a4886b02a31d22180db367c
```

Just as with hashes, a binary hmac message can also be produced by using the `digest` function instead of `digestHex`.

```ts
  let hmacMessage = hmacHasher.digest()
```

In addition to SHA256 based HMACs, `Hash.SHA512HMAC` is also supported which uses the SHA-512 cryptographic hash function.

Just as with hashes, there are also shorthand helpers available for HMACs:

```ts
const result = Hash.sha256hmac('key', 'message')
```

This guide has explored the core concepts and practical applications of hashing and HMACs using the BSV SDK. Whether you're verifying the integrity of data, securing communications, or implementing authentication protocols, these tools will serve you well in your development journey.
