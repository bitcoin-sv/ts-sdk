# Example: Using ECIES Encryption

Electrum ECIES is a protocol for exchanging encrypted data between parties. It has been commonly used in many applications, and while the SDK's native [Message Encryption functionality](EXAMPLE_ENCRYPT_DECRYPT_MESSAGE.md) is the preferred approach for new applications (due to its use of GCM over CBC and aditional layers of security described below), legacy systems still use ECIES and this guide will demonstrate how it can be done.

## Message Encryption

In ECIES, a message can be encrypted directly to the public key of the recipient, either from your private key or from a random private key. The public key can either be included or excluded from the message. Check out the below examples:

```typescript
import { ECIES, PrivateKey, Utils } from '@bsv/sdk'

const alicePrivateKey = PrivateKey.fromString('77e06abc52bf065cb5164c5deca839d0276911991a2730be4d8d0a0307de7ceb', 16)
const bobPrivateKey = PrivateKey.fromString('2b57c7c5e408ce927eef5e2efb49cfdadde77961d342daa72284bb3d6590862d', 16)
const message = Utils.toArray('this is my ECDH test message', 'utf8')

const ecdhMessageEncryptedAlice = ECIES.electrumEncrypt(message, alicePrivateKey.toPublicKey(), bobPrivateKey, true)
console.log(Utils.toUTF8(ECIES.electrumDecrypt(ecdhMessageEncryptedAlice, bobPrivateKey, alicePrivateKey.toPublicKey())))
// 'this is my ECDH test message'

const ecdhMessageEncryptedBob = ECIES.electrumEncrypt(message, bobPrivateKey.toPublicKey(), alicePrivateKey, true)
console.log(Utils.toUTF8(ECIES.electrumDecrypt(ecdhMessageEncryptedBob, alicePrivateKey, bobPrivateKey.toPublicKey())))
// 'this is my ECDH test message'
```

Here, we start by declaring two private keys. Then, ...

## Considerations

This guide has shown how to use Electrum ECIES encryption. While this approach has been used by many legacy systems, the SDK's native encryption has the following benefits:

- **Additional Security Layer**: The native SDK implentation, based on [BRC-78](https://github.com/bitcoin-sv/BRCs/blob/master/peer-to-peer/0078.md), employs an additional layer of security by utilizing a one-off ephemeral key for the encryption process. Even if the key for a particular message is discovered, it does not compromise the private keys of either of the parties. Different keys are used for every message, adding an additional step for attackers.

- **Incompatibility with BRC-43 Invoice Numbers**: The native approach is fully compatible with [BRC-43](https://brc.dev/43) invoice numbers, and the [BRC-2](https://brc.dev/2) encryption process, making it possible for users of the [BRC-56 standard wallet](https://brc.dev/56) able to natively use the system under their MetaNet identities. ECIES is not compatible with these standards.

- **Use of GCM over CBC**: While this is not a security risk, GCM supports range-based encryption and decryption. This may make it better than CBC if you need to send parts of a large encrypted dataset over the network.

Despite these drawbacks, Electrum ECIES still remains a fundamentally secure and robust encryption scheme.
