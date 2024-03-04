# Low-level: Making Use of ECDSA with Public and Private Keys

In this tutorial, we will learn how to use ECDSA with asymmetric public and private key pairs. Note, this is a low-level tutorial and should only be used if the SDK's higher-level [Message Signing Capabilities](../examples/EXAMPLE_MESSAGE_SIGNING.md) do not meet your needs.

## Getting Started

First, you'll need to import the `PrivateKey` function. We'll also import `utils` so we can represent our messages in human-readable formats.

```ts
import { PrivateKey, Utils } from '@bsv/sdk'
```

Now, let's generate a random private key and sign a message with it.

```ts
const privateKey = PrivateKey.fromRandom()
const message = Utils.toArray('Message to sign!')

// The .sign() method creates an ECDSA digital signature for the message from the private key.
const signature = privateKey.sign(message)

// Anyone with the corresponding public key can now verify the message.
const publicKey = privateKey.toPublicKey()

// The .verify() method is used for message verification
const valid = publicKey.verify(message, signature)
// console.log(valid) --> true
```

Anyone who knows the public key can verify the message, even if they don't have the private key. You can sign Bitcoin transactions, documents, or any other type of information with ECDSA. Changing the message will invalidate the signature.
