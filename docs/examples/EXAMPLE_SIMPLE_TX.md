# Example: Creating a Simple Transaction

This guide walks you through the steps of creating a simple Bitcoin transaction. To get started, let's explain some basic concepts around Bitcoin transactions.

## Understanding and Creating Transactions

Transactions in Bitcoin are mechanisms for transferring value and invoking smart contract logic. The `Transaction` class in the BSV SDK encapsulates the creation, signing, and broadcasting of transactions, also enabling the use of Bitcoin's scripting language for locking and unlocking coins.

## Creating and Signing a Transaction

Consider the scenario where you need to create a transaction. The process involves specifying inputs (where the bitcoins are coming from) and outputs (where they're going). Here's a simplified example:

```typescript
import { Transaction, PrivateKey, PublicKey, P2PKH, ARC } from '@bsv/sdk'

const privKey = PrivateKey.fromWif('...') // Your P2PKH private key
const changePrivKey = PrivateKey.fromWif('...') // Change private key (never re-use addresses)
const recipientLockingScript = LockingScript.fromAddress('1...') // Address of the recipient

const tx = new Transaction()

// Add the input
tx.addInput({
  sourceTransaction: Transaction.fromHex('...'), // The source transaction where the output you are spending was created,
  sourceOutputIndex: 0, // The output index in the source transaction
  unlockingScriptTemplate: new P2PKH().unlock(privKey), // The script template you are using to unlock the output, in this case P2PKH
})

// Pay an output to a recipient using the P2PKH locking template
tx.addOutput({
  lockingScript: recipientLockingScript,
  satoshis: 2500
})

// Send remainder back the change
tx.addOutput({
  lockingScript: new P2PKH().lock(changePrivKey.toPublicKey().toHash()),
  change: true
})

// Now we can compute the fee and sign the transaction
await tx.fee()
await tx.sign()

// Finally, we broadcast it with ARC.
// get your api key from https://console.taal.com
const apiKey = 'mainnet_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // replace
await tx.broadcast(new ARC('https://api.taal.com/arc', apiKey))
```

This code snippet demonstrates creating a transaction, adding an input and an output, setting a change script, configuring the fee, signing the transaction, and broadcasting with the ARC broadcaster. It uses the P2PKH Template, which is a specific type of Bitcoin locking program. To learn more about templates, check out this example (link to be provided once cmpplete).

## Handling Hex Locking Scripts

Moving beyond this basic example into more advanced use-cases enables you to start dealing with custom scripts. If you're provided with a hex-encoded locking script for an output, you can set it directly in the transaction's output as follows:

```typescript
transaction.addOutput({
  lockingScript: Script.fromHex('76a9....88ac'), // Hex-encoded locking script
  satoshis: 2500 // Number of satoshis
})
```

The `Transaction` class abstracts the complexity of Bitcoin's transaction structure. It handles inputs, outputs, scripts, and serialization, offering methods to easily modify and interrogate the transaction. Check out the full code-level documentation, refer to other examples, or reach out to the community to learn more.