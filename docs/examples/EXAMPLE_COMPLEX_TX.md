# Example: Creating Transactions with Inputs, Outputs and Templates

In Bitcoin, transactions contain inputs and outputs. The outputs are locked with scripts, and the inputs redeem these scripts by providing the correct unlocking solutions. This guide will show you how to create transactions that make use of custom inputs, outputs, and the associated script templates. For a more straightforward example, check out [how to create a simpler transaction](./EXAMPLE_SIMPLE_TX.md).

## Transaction Input and Outputs

All Bitcoins are locked up in Bitcoin transaction outputs. These outputs secure the coins by setting constraints on how they can be consumed in future transaction inputs. This security mechanism makes use of "scripts" — programs written in a special predicate language. There are many types of locking programs, embodying the multitude of BSV use-cases. The BSV SDK ships with a script templating system, making it easy for developers to create various types of scripts and abstracting away the complexity for end-users. You can learn about script templates [in the example](./EXAMPLE_SCRIPT_TEMPLATES.md).

## Creating a Transaction

To create a transaction with the SDK, you can either use the constructor:

- Use the constructor and pass in arrays of inputs and outputs, or
- Construct a blank transaction, then call the `addInput` and `addOutput` methods

```typescript
const tx = new Transaction(version, inputsArray, outputsArray, lockTime)
// or
const tx = new Transaction()
    .addInput(inputA)
    .addInput(inputB)
    .addOutput(outputA)
tx.version = version
tx.lockTime = lockTime
```

Note that the version and lock time parameters are optional.

## Adding Inputs and Outputs

When constructing a Bitcoin transaction, inputs and outputs form the core components that dictate the flow of bitcoins. Here’s how to structure and add them to a transaction:

### Transaction Inputs

An input in a Bitcoin transaction represents the bitcoins being spent. It's essentially a reference to a previous transaction's output. Inputs have several key components:

- **`sourceTransaction` or `sourceTXID`**: A reference to either the source transaction (another Transaction instance), its TXID. Referencing the transaction itself is always preferred because it exposes more information to the library about the outputs it contains.
- **`sourceOutputIndex`**: A zero-based index indicating which output of the referenced transaction is being spent.
- **`sequence`**: A sequence number for the input. It allows for the replacement of the input until a transaction is finalized. If omitted, the final sequence number is used.
- **`unlockingScript`**: This script proves the spender's right to access the bitcoins from the spent output. It typically contains a digital signature and, optionally, other data like public keys.
- **`unlockingScriptTemplate`**: A template that provides a method to dynamically generate the unlocking script.

Next, we'll add an R-puzzle input into this transaction using the `RPuzzle`` template.

#### Example: Adding an Input

```typescript
const sourceTransaction = Transaction.fromHex('...')
const puz = new RPuzzle()
const k = new BigNumber(1)
const unlockingScriptTemplate = puz.unlock(k)
let txInput = {
    sourceTransaction,
    sourceOutputIndex: 0,
    unlockingScriptTemplate
}

const myTx = new Transaction()
myTx.addInput(txInput)
```

### Transaction Outputs

Outputs define where the bitcoins are going and how they are locked until the next spend. Each output includes:

- **`satoshis`**: The amount of satoshis (the smallest unit of Bitcoin) being transferred. This value dictates how much value the output holds.
- **`lockingScript`**: A script that sets the conditions under which the output can be spent. It's a crucial security feature, often requiring a digital signature that matches the recipient's public key.
- **`change`**: An optional boolean flag indicating if the output is sending change back to the sender.

We will now add an R-puzzle output to a transaction, making use of the script template.

#### Example: Adding an Output

```typescript
// We must first obtain an R-value for the template
const pubkey = PublicKey.fromString('...')
pubkey.x.umod(c.n).toArray()
r = r[0] > 127 ? [0, ...r] : r
const puz = new RPuzzle()
const lockingScript = puz.lock(r)

let txOutput = {
    satoshis: 1000, // Amount in satoshis
    lockingScript,
    change: false // Not a change output, it has a defined number of satoshis
}

myTx.addOutput(txOutput)
```

## Change and Fee Computation

The transaction fee is the difference between the total inputs and total outputs of a transaction. Miners collect these fees as a reward for including transactions in a block. The amount of the fee paid will determine the quality of service provided my miners, subject to their policies.

If the total value of the inputs exceeds the total value you wish to send (plus the transaction fee), the excess amount is returned to you as "change." Change is sent back to a destination controlled by the sender, ensuring that no value is lost. When you set the `change` property on an output to `true`, you don't need to define a number of satoshis. This is because the library computes the number of satoshis for you, when the `.fee()` method is called.

In summary:

1. After all funding sources and recipient outputs are added, add at least one output where `change` is `true`, so that you capture what's left over after you send. Set up a locking script you control so that you can later spend your change.

2. Then, call the `.fee()` method to compute the change amounts across all change outputs, and leave the rest to the miner. You can specify a custom fee model if you wish, but the default should suffice for most use-cases.

In our above code, we already added a change output — now, we can just compute the fees before transaction signing.

```typescript
// Compute the correct amounts for change outputs and leave the rest for the Bitcoin miners
myTx.fee()
```

## Signing and Signature Validity

Once you've defined your inputs and outputs, and once your change has been computed, the next step is to sign your transaction. There are a few things you should note when signing:

- Only inputs with an unlocking template will be signed. If you provided an unlocking script yourself, the library assumes the signatures are already in place.
- If you change the inputs or outputs after signing, certain signatures will need to be re-computd, depending on the SIGHASH flags used.
- If your templates support it, you can produce partial signatures before serializing and sending to other parties. This is especially useful for multi-signature use-cases.

With these considerations in mind, we can now sign our transaction. The `RPuzzle` unlocking templates we configured earlier will be used in this process.

```typescript
// Set the input unlocking scripts based on the script templates
myTx.sign()
```

## Serialization and Broadcast

After a transaction is signed, it can be broadcast to the BSV Mining Network, or to relevant Overlay Networks through the SDK.

```typescript
await tx.broadcast()
```

Alternatively, if you don't want to use the SDK's built-in broadcasting system, you can simply serialize your transaction into a hex string as follows:

```typescript
// Serialize your transaction
myTx.toHex()
```

## SPV and Serialization Formats

Simplified Payment Verification is a mechanism that enables the recipient of a transaction to verify its legitimacy by providing necessary information, like input transactions and their associated merkle proofs.

Earlier in this guide, we mentioned that you can either reference a `sourceTXID` or, preferably, a `sourceTransaction` when linking transaction inputs. The reason why it's preferable to link the entire source transaction is because serializing the transaction in an SPV-compliant way generally requires more information about the outputs being spent.

When properly linked, you can serialize your transactions in the SPV formats as follows:

```typescript
// Note: Requires use of sourceTransaction instead of sourceTXID for inputs
myTx.toHexBEEF()
// or
myTx.toHexEF()
```

This enables the transactions to be verified properly by recipients, using the `.verify()` method:

```typescript
const incomingTX = Transaction.fromHexBEEF('...')
incomingTX.verify() // Provide a source of BSV block headers to verify
```

Recipients, with nothing other than a source of BSV block headers, can verify that the transaction properly unlocks and redeems its inputs, thereby creating its outputs. To learn more about setting up a chain tracker with a source of block headers, check out the Pulse example (link to be provided once completed).
