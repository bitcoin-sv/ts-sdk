import OP from '../OP.js'
import ScriptTemplate from '../ScriptTemplate.js'
import LockingScript from '../LockingScript.js'
import UnlockingScript from '../UnlockingScript.js'
import Transaction from '../../transaction/Transaction.js'
import PrivateKey from '../../primitives/PrivateKey.js'
import TransactionSignature from '../../primitives/TransactionSignature.js'
import { sha256 } from '../../primitives/Hash.js'

export default class P2PKH implements ScriptTemplate {
  lock (pubkeyhash: number[]): LockingScript {
    return new LockingScript([
      { op: OP.OP_DUP },
      { op: OP.OP_HASH160 },
      { op: pubkeyhash.length, data: pubkeyhash },
      { op: OP.OP_EQUALVERIFY },
      { op: OP.OP_CHECKSIG }
    ])
  }

  unlock (
    privateKey: PrivateKey,
    signOutputs: 'all' | 'none' | 'single' = 'all',
    anyoneCanPay: boolean = false
  ): (tx: Transaction, inputIndex: number) => UnlockingScript {
    return (tx: Transaction, inputIndex: number) => {
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
        // Question: Should the library support use-cases where the source transaction is not provided? This is to say, is it ever acceptable for someone to sign an input spending some output from a transaction they have not provided? Some elements (such as the satoshi value and output script) are always required. A merkle proof is also always required, and verifying it (while also verifying that the claimed output is contained within the claimed transaction) is also always required. This seems to require the entire input transaction.
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
      const rawSignature = privateKey.sign(sha256(preimage))
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
    }
  }

  estimateUnlockingScriptLength (): number {
    // public key (33) + signature (71)
    return 104
  }
}
