# Example: Private Signing

This guide walks you through the steps of privately signing a message.

## Overview

Message signing is a mechanism that preserves the integrity of secure communications, enabling entities to verify the authenticity of a message's origin. The primary objective of this document is to demonstrate the correct and private methods for signing a message, applicable to both anyone and specific recipients.

### 1. Example Code - Recipient can Verify
 To get started, you will first want to import the required functions / classes.

```ts
import { PrivateKey, SignedMessage, Utils } from '@bsv/sdk'
```

Next, you will want to configure who the sender is, the recipient, and what message you would like to sign.

```ts
const sender = new PrivateKey(15)
const recipient = new PrivateKey(21)
const recipientPub = recipient.toPublicKey()
const message: number[] = Utils.toArray('I like big blocks and I cannot lie', 'utf8')
```

Now we can sign the message and generate a signature that can only be verified by our specified recipient.

```ts
const signature = SignedMessage.sign(message, sender, recipientPub)
const verified = SignedMessage.verify(message, signature, recipient)
// console.log(verified) -> true
```

### 2. Example Code - Anyone can Verify
To create a signature that anyone can verify, the code is the exact same as the first example just without a specified recipient. This will allow anyone to verify the signature generated without requiring them to know a specific private key.

```ts
const signature = SignedMessage.sign(message, sender)
const verified = SignedMessage.verify(message, signature)
// console.log(verified) -> true
```

## Considerations

While these private signing functions are built on industry standards and well-tested code, there are considerations to keep in mind when integrating them into your applications.

- **Private Key Security**: Private keys must be stored securely to prevent unauthorized access, as they can be used to sign fraudulent messages.

- **Use Case Analysis**: Carefully evaluate whether you need a recipient-specific or anyone verifiable signature based on your use case.

- **Implications of Signature Verifiability**: When creating signatures that anyone can verify, consider the implications. While transparency is achieved, sensitive messages should only be verifiable by intended recipients.

By understanding and applying these considerations, you can ensure a secure implementation of private signing with the @bsv/sdk library.