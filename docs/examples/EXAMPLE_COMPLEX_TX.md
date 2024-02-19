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
const tx . new Transaction()
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
const puz = new RPuzzle('HASH256')
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
// We must first obtain the R-value for the template
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

## Signing and Signature Validity

## Serialization and Broadcast

## SPV and Serialization Formats