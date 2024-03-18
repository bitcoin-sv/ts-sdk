# Serializing and Deserializing Bitcoin Scripts

Bitcoin scripts are the mechanism by which coins are locked and unlocked. They define the constraints and rules that govern transfers, and are therefore instrumental in the functionality of Bitcoin.

In this low-level tutorial, we will learn how to serialize and deserialize Bitcoin scripts within your applications using the functions provided by the SDK.

First, you will want to make sure you have installed the `@bsv/sdk` library and imported the necessary modules for this tutorial:

- **Script** - this class will enable to you create a Bitcoin Script from various sources.
- **PrivateKey** - Used in the demo of creating a P2PKH locking script.
- **P2PKH** - This class provides methods to create Pay To Public Key Hash locking and unlocking scripts.
- **OP** - Bitcoin opcode map used in example scripts. 

```ts
import { Script, PrivateKey, P2PKH, OP } from '@bsv/sdk'
```

## Generating and Deserializing Scripts
First, we will learn how to generate new Bitcoin scripts. This will usually involve deserializing a script from various types the most common being as hex, ASM, and binary.

Here is an example of how this can be done:

```ts
  // From Hex
  const buf: number[] = [OP.OP_TRUE]
  const scriptFromHex = Script.fromHex(Utils.toHex([OP.OP_TRUE]))

  // From ASM
  const scriptFromASM = Script.fromASM('OP_DUP OP_HASH160 1451baa3aad777144a0759998a03538018dd7b4b OP_EQUALVERIFY OP_CHECKSIG')

  // From Binary
  const buf2 = [OP.OP_PUSHDATA1, 3, 1, 2, 3]
  const scriptFromBinary = Script.fromBinary(buf)
```

For a more advanced example, the P2PKH class can be used to creating a locking script to a Public Key Hash as follows:

```ts
  const priv = PrivateKey.fromRandom()
  const publicKeyHash = priv.toPublicKey().toHash()
  const lockingScript = new P2PKH().lock(publicKeyHash).toASM()
  // console.log(lockingScript)
  // -> 'OP_DUP OP_HASH160 99829df6ad0df41a759811add7f233e268501ea9 OP_EQUALVERIFY OP_CHECKSIG'

```

## Serializing Scripts

Sometimes you will want to convert Scripts into a format that can be more easily transported in your applications such as hex or binary.

Let's explore the available functions the SDK provides.

```ts
  // Create initial script
  const script = Script.fromASM('OP_DUP OP_HASH160 1451baa3aad777144a0759998a03538018dd7b4b OP_EQUALVERIFY OP_CHECKSIG')

  // Serialize script
  const scriptAsHex = script.toHex()
  // console.log(scriptAsHex)
  // -> 76a9141451baa3aad777144a0759998a03538018dd7b4b88ac

  const scriptAsASM = script.toASM()
  // console.log(scriptAsASM)
  // -> 'OP_DUP OP_HASH160 1451baa3aad777144a0759998a03538018dd7b4b OP_EQUALVERIFY OP_CHECKSIG'

  const scriptAsBinary = script.toBinary()
  // console.log(scriptAsBinary)
  // -> [118, 169, 20, ..., 172]
```

We've covered how to interpret scripts from formats like hex, ASM, and binary, as well as how to convert them back for efficient transmission or storage. You should now be equipped to manage Bitcoin scripts efficiently in your journey to develop Bitcoin-powered applications.