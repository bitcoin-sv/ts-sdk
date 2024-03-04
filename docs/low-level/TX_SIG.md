A Transaction Signature serves as strong evidence that the transaction has been authorized by the holder of the private key corresponding to an associated public key. This document provides information about the structure, serialization and pre-image format for these signatures.

### Data Structure

The `TransactionSignature` class extends the `Signature` class, inheriting its basic properties of `r` and `s`, which are components of the ECDSA (Elliptic Curve Digital Signature Algorithm) signature. Additionally, it introduces a `scope` variable which is specific to the context of transaction signing, indicating the parts of the transaction the signature commits to.

The class defines several static readonly properties representing the SIGHASH types for the `scope`:

- `SIGHASH_ALL`: The signature commits to all outputs of the transaction, ensuring none can be changed without invalidating the signature.
- `SIGHASH_NONE`: The signature commits to no outputs, allowing others to add outputs to the transaction.
- `SIGHASH_SINGLE`: The signature commits to exactly one output, the one with the same index as the input the signature is for. This allows for independent adjustment of outputs in multi-output transactions.
- `SIGHASH_ANYONECANPAY`: Modifies the behavior of the other types by only committing to the current input, allowing others to add or remove other inputs.
- `SIGHASH_FORKID`: Currently always enabled in BSV.

### Serialization and Formats

The `TransactionSignature` class includes methods for serializing and deserializing transaction signatures, useful for referencing them within scripts, among other things.

- `format()`: This static method prepares the transaction data for signing by creating a preimage according to the specified SIGHASH type. It considers various components like inputs, outputs, the transaction sequence, and lock time. Useful for generating the data that will be signed to produce a transaction signature.
- `fromChecksigFormat()`: Deserializes a script stack element into a `TransactionSignature` instance, useful for parsing signatures from raw transaction data.
- `toChecksigFormat()`: Serializes the signature back into a format that can be embedded in a script. This includes converting the ECDSA components (`r` and `s`) into DER format, followed by the `scope` (SIGHASH flags) to indicate which components are signed.

The `TransactionSignature` encapsulates the complexity of transaction signing and signature serialization. You can make use of the static `.format()` method to compute the signatures you need, enabling a wide variety of applications.

## Using the Signature Preimage Formatter

Here's an example of formatting a signature preimage for use in a Transaction:

```typescript
import { P2PKH, Transaction, PrivateKey, TransactionSignature, UnlockingScript, Hash } from '@bsv/sdk'

// Initialize the script template, source TX, and the TX we'll be working on adding a signature for.
const p2pkh = new P2PKH()
const sourceTx = Transaction.fromHex('0200000001849c6419aec8b65d747cb72282cc02f3fc26dd018b46962f5de48957fac50528020000006a473044022008a60c611f3b48eaf0d07b5425d75f6ce65c3730bd43e6208560648081f9661b0220278fa51877100054d0d08e38e069b0afdb4f0f9d38844c68ee2233ace8e0de2141210360cd30f72e805be1f00d53f9ccd47dfd249cbb65b0d4aee5cfaf005a5258be37ffffffff03d0070000000000001976a914acc4d7c37bc9d0be0a4987483058a2d842f2265d88ac75330100000000001976a914db5b7964eecb19fcab929bf6bd29297ec005d52988ac809f7c09000000001976a914c0b0a42e92f062bdbc6a881b1777eed1213c19eb88ac00000000')
const tx = new Transaction(
    1, //version
    [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        sequence: 0xffffffff
    }],
    [{ // outputs
        lockingScript: p2pkh.lock('176ayvhKue1C5StD31cTsdN1hwotw59jsR'),
        satoshis: 1000
    }],
    0 // lock time
)

// The private key we will use for signing
const privateKey = new PrivateKey(42) // Replace

// Let's decide which input index we're signing
const inputIndex = 0

// We'll sign all inputs and outputs with this signature.
let signatureScope = TransactionSignature.SIGHASH_FORKID | TransactionSignature.SIGHASH_ALL

const otherInputs = [...tx.inputs]
const [input] = otherInputs.splice(inputIndex, 1)
if (typeof input.sourceTransaction !== 'object') {
    throw new Error(
        'The source transaction is needed for transaction signing.'
    )
}

// The pre-image is the data that we are incorporating into the signature.
// It needs a few important details about the output we're spending and the new transaction we're creating.
const preimage = TransactionSignature.format({
    // The source TXID of the output we're spending needs to be provided.
    sourceTXID: input.sourceTransaction.id('hex') as string,

    // Identify the output index in the source transaction so we know where the coins come from.
    sourceOutputIndex: input.sourceOutputIndex,

    // Identify the amount of satoshis that are in the source output.
    sourceSatoshis: input.sourceTransaction.outputs[input.sourceOutputIndex].satoshis as number,

    // Identify the version of the new transaction you are creating, that will spend the source output.
    transactionVersion: tx.version,

    // Stipulate any other inputs (with the current input removed from the list) in the new transaction
    // that will be included in the signature. Note that with SIGHASH_ANYONECANPAY, this can be empty.
    otherInputs,

    // Stipulate the index of the current input in the new transaction you are working to create.
    inputIndex,

    // Stipulate the outputs to the new transaction you are creating.
    // Note that if you are using SIGHASH_NONE, this can be empty.
    // If you are using SIGHASH_SINGLE, it could be a "sparse array" with only the output at the same index as the inputIndex populated.
    outputs: tx.outputs,

    // Provide the current sequence number of the input that you are working on signing.
    inputSequence: input.sequence,

    // Provide the portion of the script in which you are working.
    // In most simple use-cases (that don't make use of OP_CODESEPARATOR), this is just the locking script from the source output.
    subscript: input.sourceTransaction.outputs[input.sourceOutputIndex].lockingScript,

    // Provide the lock time for the new transaction you are working to create.
    lockTime: tx.lockTime,

    // Finally, provide the SIGHASH flags you wish to include in the preimage that will be generated.
    scope: signatureScope
})

// The result will be a preimage that can be signed, and included in scripts.

// We sign the hash of the preimage.
// Because the `.sign()` method also performs a hash, the result is the "double-hash" needed by Bitcoin.
const rawSignature = privateKey.sign(Hash.sha256(preimage))

// Now, we construct a TransactionSignature from the ECDSA signature, for conversion to Checksig format.
const sig = new TransactionSignature(
    rawSignature.r,
    rawSignature.s,
    signatureScope
)

// Then we convert it so it can be used in a script
const sigForScript = sig.toChecksigFormat()

// Finally, we could go on to make any kind of needed unlocking script with the signature..
const pubkeyForScript = privateKey.toPublicKey().encode(true) as number[]
const script = new UnlockingScript([
    { op: sigForScript.length, data: sigForScript },
    { op: pubkeyForScript.length, data: pubkeyForScript }
])
console.log('Signature was computed! P2PKH Unlocking Script:', script.toHex())
```

First, we set up the data we wanted to sign. Then, we created a pre-image, hashed it, and signed it with a private key using ECSA. Then, we created a new `TransactionSignature` instance with the ECDSA signature, so that we could convert it into Checksig format. At this point, you could use the transaction signature in a script to help unlock a UTXO, enabling you to unlock and spend the associated Bitcoins or other digital assets.
