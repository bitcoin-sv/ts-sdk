# Example: Message Encryption and Decryption

This guide walks you through the steps of encrypting and decrypting messages.

## Overview

Understanding the ins-and-outs of message encryption and decryption is key to implementing secure communication. The implemented functions allow a sender to encrypt messages that only the intended recipient can decrypt, thus preserving the privacy of the message exchange.

### Encrypting a Message
 To get started, you will first want to import the required functions / classes.

```ts
import { PrivateKey, EncryptedMessage, Utils } from '@bsv/sdk'
```

Next, you will want to configure who the sender is, the recipient, and what message you would like to encrypt.

```ts
const sender = new PrivateKey(15)
const recipient = new PrivateKey(21)
const recipientPub = recipient.toPublicKey()
const message: number[] = Utils.toArray('Did you receive the Bitcoin payment?', 'utf8')
```

Now you are ready to generate the ciphertext using the `encrypt` function. This function will return an array of bytes so you will need to convert it using `toUTF` if you would like it as a string of text. 

```ts
const encrypted: number[] = EncryptedMessage.encrypt(message, sender, recipientPub)
const ciphertextMessage: string = Utils.toUTF8(encrypted)
```

### Decrypting a Message

To get back your plaintext message, use the `decrypt` function and then transform it as needed.

```ts
const decrypted: number[] = EncryptedMessage.decrypt(encrypted, recipient)
const plaintextMessage: string = Utils.toUTF8(decrypted)
// console.log(plaintextMessage) -> 'Did you receive the Bitcoin payment?'
```

## Considerations

As you leverage encryption and decryption in your applications, it's crucial to remember:

- **Key management**: Private keys should always be kept safe and never exposed. This library insures that intermediate keys generated for message encryption always use random nonces to mitigate key-reuse attack vectors. 

- **Key of recipient:** The decryption stage using the recipient's key is always done on the recipient's end. As such, the recipient key used is the public key provided by the recipient, and is just generated in the above example for testing purposes.

- **Interpretation of decrypted data**: The decrypted byte array may need to be transformed back into a string, depending on the nature of the original message. There are several utility functions exported, such as toUTF8, that can be leveraged as needed.

This is just a simple example of how encryption and decryption can be implemented for secure message exchange in your applications. The exact method of implementation might vary based on your application’s specifics.