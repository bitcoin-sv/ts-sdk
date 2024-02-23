# Example: Creating the R-puzzle Script Template

This guide will provide information about the structure and functionality of script templates within the BSV SDK. Script templates are a powerful abstraction layer designed to simplify the creation and management of the scripts used in Bitcoin transactions. By understanding how these templates work, developers can leverage them to build more sophisticated and efficient blockchain applications. By the end of this example, you'll understand how the R-puzzle script template (P2RPH) was created.

### Understanding Script Templates

A script template is essentially a blueprint for creating the locking and unlocking scripts that are crucial for securing and spending bitcoins. These templates encapsulate the logic needed to construct these scripts dynamically, based on the parameters passed to them. This approach allows for a modular and reusable codebase, where common scripting patterns can be defined once and then instantiated as needed across different transactions.

#### Locking Script

The locking script, or output script, specifies the conditions under which the bitcoins can be spent. In the BSV SDK, the `lock` function of a script template is responsible for generating this script. By abstracting the creation of locking scripts into a method that accepts parameters, developers can easily create diverse conditions for spending bitcoins without having to write the low-level script code each time.

For example, a locking script might require the presentation of a public key that matches a certain hash or the fulfillment of a multi-signature condition. The flexibility of passing parameters to the `lock` function enables the creation of locking scripts tailored to specific requirements. This example will require a signature created with a particular ephemeral K-value, [an R-puzzle](https://wiki.bitcoinsv.io/index.php/R-Puzzles).

#### Unlocking Script

The unlocking script, or input script, provides the evidence needed to satisfy the conditions set by the locking script. The `unlock` method in a script template not only generates this script but also offers two key functionalities — it's a function that returns an object with two properties:

1. **`estimateLength`**: Before a transaction is signed and broadcast to the network, it's crucial to estimate its size to calculate the required fee accurately. The `estimateLength` function predicts the length of the unlocking script once it will be created, allowing developers to make informed decisions about fee estimation.

2. **`sign`**: This function generates an unlocking script that includes the necessary signatures or data required to unlock the bitcoins. By accepting a transaction and an input index as arguments, it ensures that the unlocking script is correctly associated with the specific transaction input it intends to fund, allowing signatures to be scoped accordingly.

### Creating a Script Template

To create a script template, developers define a class that adheres to the `ScriptTemplate` interface. This involves implementing the `lock` and `unlock` methods with the specific logic needed for their application.

Now that you understand the necessary components, here's the code for the R-puzzle script template:

```javascript
import {
  OP, ScriptTemplate, LockingScript, UnlockingScript, Transaction,
  PrivateKey, TransactionSignature, sha256, ScriptChunk, BigNumber
} from '@bsv/sdk'

/**
 * RPuzzle class implementing ScriptTemplate.
 *
 * This class provides methods to create R Puzzle and R Puzzle Hash locking and unlocking scripts, including the unlocking of UTXOs with the correct K value.
 */
export default class RPuzzle implements ScriptTemplate {
  type: 'raw' | 'SHA1' | 'SHA256' | 'HASH256' | 'RIPEMD160' | 'HASH160' = 'raw'

  /**
   * @constructor
   * Constructs an R Puzzle template instance for a given puzzle type
   *
   * @param {'raw'|'SHA1'|'SHA256'|'HASH256'|'RIPEMD160'|'HASH160'} type Denotes the type of puzzle to create
   */
  constructor (type: 'raw' | 'SHA1' | 'SHA256' | 'HASH256' | 'RIPEMD160' | 'HASH160' = 'raw') {
    this.type = type
  }

  /**
   * Creates an R puzzle locking script for a given R value or R value hash.
   *
   * @param {number[]} value - An array representing the R value or its hash.
   * @returns {LockingScript} - An R puzzle locking script.
   */
  lock (value: number[]): LockingScript {
    const chunks: ScriptChunk[] = [
      { op: OP.OP_OVER },
      { op: OP.OP_3 },
      { op: OP.OP_SPLIT },
      { op: OP.OP_NIP },
      { op: OP.OP_1 },
      { op: OP.OP_SPLIT },
      { op: OP.OP_SWAP },
      { op: OP.OP_SPLIT },
      { op: OP.OP_DROP }
    ]
    if (this.type !== 'raw') {
      chunks.push({
        op: OP['OP_' + this.type]
      })
    }
    chunks.push({ op: value.length, data: value })
    chunks.push({ op: OP.OP_EQUALVERIFY })
    chunks.push({ op: OP.OP_CHECKSIG })
    return new LockingScript(chunks)
  }

  /**
   * Creates a function that generates an R puzzle unlocking script along with its signature and length estimation.
   *
   * The returned object contains:
   * 1. `sign` - A function that, when invoked with a transaction and an input index,
   *    produces an unlocking script suitable for an R puzzle locked output.
   * 2. `estimateLength` - A function that returns the estimated length of the unlocking script in bytes.
   *
   * @param {BigNumber} k — The K-value used to unlock the R-puzzle.
   * @param {PrivateKey} privateKey - The private key used for signing the transaction. If not provided, a random key will be generated.
   * @param {'all'|'none'|'single'} signOutputs - The signature scope for outputs.
   * @param {boolean} anyoneCanPay - Flag indicating if the signature allows for other inputs to be added later.
   * @returns {Object} - An object containing the `sign` and `estimateLength` functions.
   */
  unlock (
    k: BigNumber,
    privateKey: PrivateKey,
    signOutputs: 'all' | 'none' | 'single' = 'all',
    anyoneCanPay: boolean = false
  ): {
      sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>
      estimateLength: () => Promise<106>
    } {
    return {
      sign: async (tx: Transaction, inputIndex: number) => {
        if (typeof privateKey === 'undefined') {
          privateKey = PrivateKey.fromRandom()
        }
        let signatureScope = TransactionSignature.SIGHASH_FORKID
        if (signOutputs === 'all') {
          signatureScope |= TransactionSignature.SIGHASH_ALL
        }
        if (signOutputs === 'none') {
          signatureScope |= TransactionSignature.SIGHASH_NONE
        }
        if (signOutputs === 'single') {
          signatureScope |= TransactionSignature.SIGHASH_SINGLE
        }
        if (anyoneCanPay) {
          signatureScope |= TransactionSignature.SIGHASH_ANYONECANPAY
        }
        const otherInputs = [...tx.inputs]
        const [input] = otherInputs.splice(inputIndex, 1)
        if (typeof input.sourceTransaction !== 'object') {
          throw new Error(
            'The source transaction is needed for transaction signing.'
          )
        }
        const preimage = TransactionSignature.format({
          sourceTXID: input.sourceTransaction.id('hex') as string,
          sourceOutputIndex: input.sourceOutputIndex,
          sourceSatoshis: input.sourceTransaction.outputs[input.sourceOutputIndex].satoshis,
          transactionVersion: tx.version,
          otherInputs,
          inputIndex,
          outputs: tx.outputs,
          inputSequence: input.sequence,
          subscript: input.sourceTransaction.outputs[input.sourceOutputIndex].lockingScript,
          lockTime: tx.lockTime,
          scope: signatureScope
        })
        const rawSignature = privateKey.sign(sha256(preimage), undefined, true, k)
        const sig = new TransactionSignature(
          rawSignature.r,
          rawSignature.s,
          signatureScope
        )
        const sigForScript = sig.toChecksigFormat()
        const pubkeyForScript = privateKey.toPublicKey().encode(true) as number[]
        return new UnlockingScript([
          { op: sigForScript.length, data: sigForScript },
          { op: pubkeyForScript.length, data: pubkeyForScript }
        ])
      },
      estimateLength: async () => {
        // public key (1+33) + signature (1+71)
        // Note: We add 1 to each element's length because of the associated OP_PUSH
        return 106
      }
    }
  }
}
```

In this example, `RPuzzle` defines custom logic for creating both locking and unlocking scripts. The opcodes, intermixed with the various template fields, enable end-users to implement R-puzzles into their applications without being concerned with these low-level details. Check out [this guide](./EXAMPLE_COMPLEX_TX.md) to see an example of this template used in a transaction.

### Conclusion

Script templates in the BSV SDK offer a structured and efficient way to handle the creation of locking and unlocking scripts in Bitcoin transactions. By encapsulating the logic for script generation and providing essential functionalities like signature creation and length estimation, script templates make it easier for developers to implement complex transactional logic. With these tools, template consumers can focus on the higher-level aspects of their blockchain applications, relying on the SDK to manage the intricacies of script handling.