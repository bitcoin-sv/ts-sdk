import { ScriptTemplate, LockingScript, UnlockingScript, OP } from '../index.js'
import {
  Utils,
  Hash,
  TransactionSignature,
  Signature,
  PublicKey
} from '../../primitives/index.js'
import { WalletInterface } from '../../wallet/Wallet.interfaces.js'
import { Transaction } from '../../transaction/index.js'
import { SecurityLevel } from '../../wallet/Wallet.interfaces.js'

/**
 * For a given piece of data to push onto the stack in script, creates the correct minimally-encoded script chunk,
 * including the correct push operation.
 *
 * TODO: This should be made into a TS-SDK util (distinct from the `minimallyEncode` util)
 */
const createMinimallyEncodedScriptChunk = (
  data: number[]
): { op: number; data?: number[] } => {
  if (data.length === 0) {
    // Could have used OP_0.
    return { op: 0 }
  }
  if (data.length === 1 && data[0] === 0) {
    // Could have used OP_0.
    return { op: 0 }
  }
  if (data.length === 1 && data[0] > 0 && data[0] <= 16) {
    // Could have used OP_0 .. OP_16.
    return { op: 0x50 + data[0] }
  }
  if (data.length === 1 && data[0] === 0x81) {
    // Could have used OP_1NEGATE.
    return { op: 0x4f }
  }
  if (data.length <= 75) {
    // Could have used a direct push (opcode indicating number of bytes
    // pushed + those bytes).
    return { op: data.length, data }
  }
  if (data.length <= 255) {
    // Could have used OP_PUSHDATA.
    return { op: 0x4c, data }
  }
  if (data.length <= 65535) {
    // Could have used OP_PUSHDATA2.
    return { op: 0x4d, data }
  }
  return { op: 0x4e, data }
}

export default class PushDrop implements ScriptTemplate {
  wallet: WalletInterface

  /**
   * Decodes a PushDrop script back into its token fields and the locking public key. If a signature was present, it will be the last field returned.
   * Warning: Only works with a P2PK lock at the beginning of the script.
   * @param script PushDrop script to decode back into token fields
   * @returns An object containing PushDrop token fields and the locking public key. If a signature was included, it will be the last field.
   */
  static decode(script: LockingScript): {
    lockingPublicKey: PublicKey
    fields: number[][]
  } {
    const lockingPublicKey = PublicKey.fromString(
      Utils.toHex(script.chunks[0].data)
    )
    const fields = []
    for (let i = 2; i < script.chunks.length; i++) {
      const nextOpcode = script.chunks[i + 1].op
      let chunk = script.chunks[i].data
      if (!chunk) {
        if (script.chunks[i].op >= 80 && script.chunks[i].op <= 95) {
          chunk = [script.chunks[i].op - 80]
        } else if (script.chunks[i].op === 0) {
          chunk = [0]
        } else if (script.chunks[i].op === 0x4f) {
          chunk = [0x81]
        }
      }
      fields.push(chunk)

      // If the next value is DROP or 2DROP then this is the final field
      if (nextOpcode === OP.OP_DROP || nextOpcode === OP.OP_2DROP) {
        break
      }
    }

    return {
      fields,
      lockingPublicKey
    }
  }

  /**
   * Constructs a new instance of the PushDrop class.
   *
   * @param {WalletInterface} wallet - The wallet interface used for creating signatures and accessing public keys.
   */
  constructor(wallet: WalletInterface) {
    this.wallet = wallet
  }

  /**
   * Creates a PushDrop locking script with arbitrary data fields and a public key lock.
   *
   * @param {number[][]} fields - The token fields to include in the locking script.
   * @param {[SecurityLevel, string]} protocolID - The protocol ID to use.
   * @param {string} keyID - The key ID to use.
   * @param {string} counterparty - The counterparty involved in the transaction, "self" or "anyone".
   * @param {boolean} [forSelf=false] - Flag indicating if the lock is for the creator (default no).
   * @param {boolean} [includeSignature=true] - Flag indicating if a signature should be included in the script (default yes).
   * @returns {Promise<LockingScript>} The generated PushDrop locking script.
   */
  async lock(
    fields: number[][],
    protocolID: [SecurityLevel, string],
    keyID: string,
    counterparty: string,
    forSelf = false,
    includeSignature = true,
    lockPosition: 'before' | 'after' = 'before'
  ): Promise<LockingScript> {
    const { publicKey } = await this.wallet.getPublicKey({
      protocolID,
      keyID,
      counterparty,
      forSelf
    })
    const lockChunks: Array<{ op: number; data?: number[] }> = []
    const pushDropChunks: Array<{ op: number; data?: number[] }> = []
    lockChunks.push({
      op: publicKey.length / 2,
      data: Utils.toArray(publicKey, 'hex')
    })
    lockChunks.push({ op: OP.OP_CHECKSIG })
    if (includeSignature) {
      const dataToSign = fields.reduce((a, e) => [...a, ...e], [])
      const { signature } = await this.wallet.createSignature({
        data: dataToSign,
        protocolID,
        keyID,
        counterparty
      })
      fields.push(signature)
    }
    for (const field of fields) {
      pushDropChunks.push(createMinimallyEncodedScriptChunk(field))
    }
    let notYetDropped = fields.length
    while (notYetDropped > 1) {
      pushDropChunks.push({ op: OP.OP_2DROP })
      notYetDropped -= 2
    }
    if (notYetDropped) {
      pushDropChunks.push({ op: OP.OP_DROP })
    }
    if (lockPosition === 'before') {
      return new LockingScript([...lockChunks, ...pushDropChunks])
    } else {
      return new LockingScript([...pushDropChunks, ...lockChunks])
    }
  }

  /**
   * Creates an unlocking script for spending a PushDrop token output.
   *
   * @param {[SecurityLevel, string]} protocolID - The protocol ID to use.
   * @param {string} keyID - The key ID to use.
   * @param {string} counterparty - The counterparty involved in the transaction, "self" or "anyone".
   * @param {string} [sourceTXID] - The TXID of the source transaction.
   * @param {number} [sourceSatoshis] - The number of satoshis in the source output.
   * @param {LockingScript} [lockingScript] - The locking script of the source output.
   * @param {'all' | 'none' | 'single'} [signOutputs='all'] - Specifies which outputs to sign.
   * @param {boolean} [anyoneCanPay=false] - Specifies if the anyone-can-pay flag is set.
   * @returns {Object} An object containing functions to sign the transaction and estimate the script length.
   */
  unlock(
    protocolID: [SecurityLevel, string],
    keyID: string,
    counterparty: string,
    signOutputs: 'all' | 'none' | 'single' = 'all',
    anyoneCanPay = false,
    sourceSatoshis?: number,
    lockingScript?: LockingScript
  ): {
    sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>
    estimateLength: () => Promise<73>
  } {
    return {
      sign: async (
        tx: Transaction,
        inputIndex: number
      ): Promise<UnlockingScript> => {
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

        const input = tx.inputs[inputIndex]

        const otherInputs = tx.inputs.filter((_, index) => index !== inputIndex)

        const sourceTXID = input.sourceTXID
          ? input.sourceTXID
          : input.sourceTransaction?.id('hex')
        if (!sourceTXID) {
          throw new Error(
            'The input sourceTXID or sourceTransaction is required for transaction signing.'
          )
        }
        sourceSatoshis ||=
          input.sourceTransaction?.outputs[input.sourceOutputIndex].satoshis
        if (!sourceSatoshis) {
          throw new Error(
            'The sourceSatoshis or input sourceTransaction is required for transaction signing.'
          )
        }
        lockingScript ||=
          input.sourceTransaction?.outputs[input.sourceOutputIndex]
            .lockingScript
        if (!lockingScript) {
          throw new Error(
            'The lockingScript or input sourceTransaction is required for transaction signing.'
          )
        }

        const preimage = TransactionSignature.format({
          sourceTXID,
          sourceOutputIndex: input.sourceOutputIndex,
          sourceSatoshis,
          transactionVersion: tx.version,
          otherInputs,
          inputIndex,
          outputs: tx.outputs,
          inputSequence: input.sequence,
          subscript: lockingScript,
          lockTime: tx.lockTime,
          scope: signatureScope
        })
        const preimageHash = Hash.sha256(preimage)
        const { signature: bareSignature } = await this.wallet.createSignature({
          data: preimageHash,
          protocolID,
          keyID,
          counterparty
        })
        const signature = Signature.fromDER([...bareSignature])
        const txSignature = new TransactionSignature(
          signature.r,
          signature.s,
          signatureScope
        )
        const sigForScript = txSignature.toChecksigFormat()
        return new UnlockingScript([
          { op: sigForScript.length, data: sigForScript }
        ])
      },
      estimateLength: async () => 73
    }
  }
}
