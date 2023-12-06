import TransactionInput from './TransactionInput.js'
import TransactionOutput from './TransactionOutput.js'
import UnlockingScript from '../script/UnlockingScript.js'
import LockingScript from '../script/LockingScript.js'
import { Reader, Writer, toHex, toArray } from '../primitives/utils.js'
import { hash256 } from '../primitives/Hash.js'
import BigNumber from '../primitives/BigNumber.js'
import FeeModel from './FeeModel.js'
import SatoshisPerKilobyte from './fee-models/SatoshisPerKilobyte.js'
import { Broadcaster, BroadcastResponse, BroadcastFailure } from './Broadcaster.js'
import MerklePath from './MerklePath.js'

/**
 * Represents a complete Bitcoin transaction. This class encapsulates all the details
 * required for creating, signing, and processing a Bitcoin transaction, including
 * inputs, outputs, and various transaction-related methods.
 *
 * @class Transaction
 * @property {number} version - The version number of the transaction. Used to specify
 *           which set of rules this transaction follows.
 * @property {TransactionInput[]} inputs - An array of TransactionInput objects, representing
 *           the inputs for the transaction. Each input references a previous transaction's output.
 * @property {TransactionOutput[]} outputs - An array of TransactionOutput objects, representing
 *           the outputs for the transaction. Each output specifies the amount of satoshis to be
 *           transferred and the conditions under which they can be spent.
 * @property {number} lockTime - The lock time of the transaction. If non-zero, it specifies the
 *           earliest time or block height at which the transaction can be added to the block chain.
 * @property {Record<string, any>} metadata - A key-value store for attaching additional data to
 *           the transaction object, not included in the transaction itself. Useful for adding descriptions, internal reference numbers, or other information.
 * @property {MerkleProof} [merkleProof] - Optional. A merkle proof demonstrating the transaction's
 *           inclusion in a block. Useful for transaction verification using SPV.
 *
 * @example
 * // Creating a new transaction
 * let tx = new Transaction();
 * tx.addInput(...);
 * tx.addOutput(...);
 * await tx.fee();
 * await tx.sign();
 * await tx.broadcast();
 *
 * @description
 * The Transaction class provides comprehensive
 * functionality to handle various aspects of transaction creation, including
 * adding inputs and outputs, computing fees, signing the transaction, and
 * generating its binary or hexadecimal representation.
 */
export default class Transaction {
  version: number
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
  lockTime: number
  metadata: Record<string, any>
  merklePath?: MerklePath

  // TODO: Incomplete
  // static fromBRC1 (brc1: {
  //   inputs?: Record<string, unknown>
  //   outputs?: TransactionOutput[]
  //   lockTime?: number
  // }): Transaction {
  //   const tx = new Transaction()

  //   const parseInputs = (inputs: unknown): TransactionInput[] => {
  //     const results: TransactionInput[] = []
  //     if (typeof inputs !== 'object') {
  //       return results
  //     }

  //     for (const txid of Object.keys(inputs)) {
  //       const input = inputs[txid]
  //       const sourceTransaction = Transaction.fromHex(input.rawTx)
  //       sourceTransaction.inputs = parseInputs(input.inputs)
  //       for (const outputIndex of input.outputsToRedeem) {
  //         const txInput = {
  //           unlockingScript: UnlockingScript.fromHex(input.unlockingScript),
  //           sourceTransaction,
  //           sourceOutputIndex: outputIndex,
  //           sequence: typeof input.sequence === 'number'
  //             ? input.sequence
  //             : 0xffffffff
  //         }
  //         results.push(txInput)
  //       }
  //     }

  //     return results
  //   }

  //   const inputs = parseInputs(brc1.inputs)
  //   for (const i of inputs) {
  //     tx.addInput(i)
  //   }

  //   if (Array.isArray(brc1.outputs)) {
  //     for (const out of brc1.outputs) {
  //       tx.addOutput({
  //         satoshis: new BigNumber(out.satoshis),
  //         script: LockingScript.fromHex(out.script)
  //       })
  //     }
  //   }
  //   if (typeof brc1.lockTime === 'number') {
  //     tx.lockTime = brc1.lockTime
  //   }

  //   return tx
  // }

  /**
   * Creates a Transaction instance from a binary array.
   *
   * @static
   * @param {number[]} bin - The binary array representation of the transaction.
   * @returns {Transaction} - A new Transaction instance.
   */
  static fromBinary (bin: number[]): Transaction {
    const br = new Reader(bin)
    const version = br.readUInt32LE()
    const inputsLength = br.readVarIntNum()
    const inputs: TransactionInput[] = []
    for (let i = 0; i < inputsLength; i++) {
      const sourceTXID = toHex(br.read(32))
      const sourceOutputIndex = br.readUInt32LE()
      const scriptLength = br.readVarIntNum()
      const scriptBin = br.read(scriptLength)
      const unlockingScript = UnlockingScript.fromBinary(scriptBin)
      const sequence = br.readUInt32LE()
      inputs.push({
        sourceTXID,
        sourceOutputIndex,
        unlockingScript,
        sequence
      })
    }
    const outputsLength = br.readVarIntNum()
    const outputs: TransactionOutput[] = []
    for (let i = 0; i < outputsLength; i++) {
      const satoshis = br.readUInt64LEBn()
      const scriptLength = br.readVarIntNum()
      const scriptBin = br.read(scriptLength)
      const lockingScript = LockingScript.fromBinary(scriptBin)
      outputs.push({
        satoshis,
        lockingScript
      })
    }
    const lockTime = br.readUInt32LE()
    return new Transaction(version, inputs, outputs, lockTime)
  }

  /**
   * Creates a Transaction instance from a hexadecimal string.
   *
   * @static
   * @param {string} hex - The hexadecimal string representation of the transaction.
   * @returns {Transaction} - A new Transaction instance.
   */
  static fromHex (hex: string): Transaction {
    return Transaction.fromBinary(toArray(hex, 'hex'))
  }

  constructor (
    version: number = 1,
    inputs: TransactionInput[] = [],
    outputs: TransactionOutput[] = [],
    lockTime: number = 0,
    metadata: Record<string, any> = {},
    merklePath?: MerklePath
  ) {
    this.version = version
    this.inputs = inputs
    this.outputs = outputs
    this.lockTime = lockTime
    this.metadata = metadata
    this.merklePath = merklePath
  }

  /**
   * Adds a new input to the transaction.
   *
   * @param {TransactionInput} input - The TransactionInput object to add to the transaction.
   * @throws {Error} - If the input does not have a sourceTXID or sourceTransaction defined.
   */
  addInput (input: TransactionInput): void {
    if (
      typeof input.sourceTXID === 'undefined' &&
      typeof input.sourceTransaction === 'undefined'
    ) {
      throw new Error('A reference to an an input transaction is required. If the input transaction itself cannot be referenced, its TXID must still be provided.')
    }
    this.inputs.push(input)
  }

  /**
   * Adds a new output to the transaction.
   *
   * @param {TransactionOutput} output - The TransactionOutput object to add to the transaction.
   */
  addOutput (output: TransactionOutput): void {
    this.outputs.push(output)
  }

  /**
   * Updates the transaction's metadata.
   *
   * @param {Record<string, any>} metadata - The metadata object to merge into the existing metadata.
   */
  updateMetadata (metadata: Record<string, any>): void {
    this.metadata = {
      ...this.metadata,
      ...metadata
    }
  }

  /**
   * Computes fees prior to signing.
   * If no fee model is provided, uses a SatoshisPerKilobyte fee model that pays 10 sat/kb.
   *
   * @param model - The initialized fee model to use
   * @param changeDistribution - Specifies how the change should be distributed
   * amongst the change outputs
   *
   * TODO: Benford's law change distribution.
   */
  async fee (model?: FeeModel, changeDistribution: 'equal' | 'random' = 'equal'): Promise<void> {
    if (typeof model === 'undefined') {
      model = new SatoshisPerKilobyte(10)
    }
    const fee = await model.computeFee(this)
    // change = inputs - fee - non-change outputs
    const change = new BigNumber(0)
    for (const input of this.inputs) {
      if (typeof input.sourceTransaction !== 'object') {
        throw new Error('Source transactions are required for all inputs during fee computation')
      }
      change.iadd(
        input.sourceTransaction.outputs[input.sourceOutputIndex].satoshis
      )
    }
    change.isub(fee)
    let changeCount = 0
    for (const out of this.outputs) {
      if (!out.change) {
        change.isub(out.satoshis)
      } else {
        changeCount++
      }
    }

    if (change.lten(changeCount)) {
      // There is not enough change to distribute among the change outputs.
      // We'll remove all change outputs and leave the extra for the miners.
      for (let i = 0; i < this.outputs.length; i++) {
        if (this.outputs[i].change) {
          this.outputs.splice(i, 1)
          i--
        }
      }
      return
    }

    // Distribute change among change outputs
    if (changeDistribution === 'random') {
      // TODO
      throw new Error('Not yet implemented')
    } else if (changeDistribution === 'equal') {
      const perOutput = change.divn(changeCount)
      for (const out of this.outputs) {
        if (out.change) {
          out.satoshis = perOutput.clone()
        }
      }
    }
  }

  /**
   * Signs a transaction, hydrating all its unlocking scripts based on the provided script templates where they are available.
   */
  async sign (): Promise<void> {
    for (const out of this.outputs) {
      if (typeof out.satoshis === 'undefined') {
        if (out.change) {
          throw new Error('There are still change outputs with uncomputed amounts. Use the fee() method to compute the change amounts and transaction fees prior to signing.')
        } else {
          throw new Error('One or more transaction outputs is missing an amount. Ensure all output amounts are provided before signing.')
        }
      }
    }
    for (let i = 0, l = this.inputs.length; i < l; i++) {
      if (typeof this.inputs[i].unlockingScriptTemplate === 'object') {
        this.inputs[i].unlockingScript = await this.inputs[i]
          .unlockingScriptTemplate
          .sign(this, i)
      }
    }
  }

  /**
   * Broadcasts a transaction.
   *
   * @param broadcaster The Broadcaster instance wwhere the transaction will be sent
   * @returns A BroadcastResponse or BroadcastFailure from the Broadcaster
   */
  async broadcast (broadcaster: Broadcaster): Promise<BroadcastResponse | BroadcastFailure> {
    return await broadcaster.broadcast(this)
  }

  /**
   * Converts the transaction to a binary array format.
   *
   * @returns {number[]} - The binary array representation of the transaction.
   */
  toBinary (): number[] {
    const writer = new Writer()
    writer.writeUInt32LE(this.version)
    writer.writeVarIntNum(this.inputs.length)
    for (const i of this.inputs) {
      if (typeof i.sourceTransaction !== 'undefined') {
        writer.write(i.sourceTransaction.hash() as number[])
      } else {
        writer.write(toArray(i.sourceTXID, 'hex'))
      }
      writer.writeUInt32LE(i.sourceOutputIndex)
      const scriptBin = i.unlockingScript.toBinary()
      writer.writeVarIntNum(scriptBin.length)
      writer.write(scriptBin)
      writer.writeUInt32LE(i.sequence)
    }
    writer.writeVarIntNum(this.outputs.length)
    for (const o of this.outputs) {
      writer.writeUInt64LEBn(o.satoshis)
      const scriptBin = o.lockingScript.toBinary()
      writer.writeVarIntNum(scriptBin.length)
      writer.write(scriptBin)
    }
    writer.writeUInt32LE(this.lockTime)
    return writer.toArray()
  }

  /**
   * Converts the transaction to a hexadecimal string format.
   *
   * @returns {string} - The hexadecimal string representation of the transaction.
   */
  toHex (): string {
    return toHex(this.toBinary())
  }

  /**
   * Calculates the transaction's hash.
   *
   * @param {'hex' | undefined} enc - The encoding to use for the hash. If 'hex', returns a hexadecimal string; otherwise returns a binary array.
   * @returns {string | number[]} - The hash of the transaction in the specified format.
   */
  hash (enc?: 'hex'): number[] | string {
    return hash256(this.toBinary(), enc)
  }

  /**
   * Calculates the transaction's ID.
   *
   * @param {'hex' | undefined} enc - The encoding to use for the ID. If 'hex', returns a hexadecimal string; otherwise returns a binary array.
   * @returns {string | number[]} - The ID of the transaction in the specified format.
   */
  id (enc?: 'hex'): number[] | string {
    const id = hash256(this.toBinary()) as number[]
    id.reverse()
    if (enc === 'hex') {
      return toHex(id)
    }
    return id
  }
}
