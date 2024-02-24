# Example: Verifying Spends with Script Intrepreter

The SDK comes with a script interpreter that allows you to verify the chain of spends within Bitcoin. When coins are spent from one transaction to another, the process is carried out between a particular output of the source transaction and a particular input of the spending transaction. The `Spend` class sets up the necessary contextual information for this process, and then evaluates the scripts to determine if the transfer is legitimate.

This guide will walk you through the verification of a real spend, with real data. You can apply this code to your own transactions to ensure the transfer of coins from one state into the next is legitimate.

## Pre-requisites

We will need two transactions: a source transaction and a spending transaction, in order to set up the `Spend` context in which the transfer of coins occurs between them. When you construct an instance of the `Spend` class, you'll need to provide this information in the correct format. In a new file, let's set up som basic things we'll need:

```typescript
import { Spend, LockingScript, UnlockingScript } from '@bsv/sdk'

const spend = new Spend({

    // Replace with the TXID of the transaction where you are spending from
    sourceTXID: '0000000000000000000000000000000000000000000000000000000000000000',

    // Replace with the output index you are redeeming
    sourceOutputIndex: 0,

    // Replace with the number of satoshis in the output you are redeeming
    sourceSatoshis: 1,

    // Replace with the locking script you are spending
    lockingScript: LockingScript.fromASM('OP_3 OP_ADD OP_7 OP_EQUAL'),

    // Replace with the version of the new spending transaction
    transactionVersion: 1,

    // Other inputs from the spending transaction that are needed for verification.
    // The SIGHASH flags used in signatures may not require this (if SIGHASH_ANYONECANPAY was used).
    // This is an ordered array of TransactionInputs with the input whose script we're currently evaluating missing.
    otherInputs: [],

    // TransactionOutputs from the spending transaction that are needed for verification.
    // The SIGHASH flags used in signatures may nnt require this (if SIGHASH_NONE was used).
    // If SIGHASH_SINGLE is used, it's possible for this to be a sparse array, with only the index corresponding to
    // the inputIndex populated.
    outputs: [],

    // This is the index of the input whose script we are currently evaluating.
    inputIndex: 0,

    // This is the unlocking script that we are evaluating, to see if it unlocks the source output.
    unlockingScript: UnlockingScript.fromASM('OP_4'),

    // This is the sequence number of the input whose script we are currently evaluating.
    inputSequence: 0xffffffff,

    // This is the lock time of the spending transaction.
    lockTime: 0
})
```

Once you've provided the context and constructed the Spend, you should have a new spend instance ready for verification.

## Validating the Spend

You can use the `validate()` method to run the scripts and validate the spend, as follows:

```typescript
const validated = spend.validate()
// console.log(validated) => true
```

The result will be a boolean indicating the result of the script. If there is an error thrown, or if the boolean is false, the script is not valid. If the boolean is true, the spend is considered valid.

Errors from the spend will contain useful information, such as the specific opcode and context in which the error occurred (in either the locking or unlocking script).
