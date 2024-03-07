# Using Hashes and HMACs

In this tutorial, we will learn how to use hashes and HMACs (Hash-based Message Authentication Code).

First, you will want to make sure you have installed the required dependencies.

- **Hash** - this class will enable you to generate various hashers and HMAC generators.
- **Utils** - the SDK provides several helpful utility functions such as toArray and and toUTF8 which allow you to serialize and deserialize data as needed.

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

## Creating a HMAC

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

We've explored the core concepts and practical applications of hashing and HMACs using the low-level Hash class in the SDK. Whether you're verifying the integrity of data, securing communications, or implementing authentication protocols, these tools will serve you well in your development journey.