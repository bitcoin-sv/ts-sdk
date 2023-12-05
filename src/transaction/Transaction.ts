import TransactionInput from './TransactionInput.js'
import TransactionOutput from './TransactionOutput.js'
import UnlockingScript from '../script/UnlockingScript.js'
import LockingScript from '../script/LockingScript.js'
import { Reader, Writer, toHex, toArray } from '../primitives/utils.js'
import { hash256 } from '../primitives/Hash.js'
import BigNumber from '../primitives/BigNumber.js'
import FeeModel from './FeeModel.js'
import SatoshisPerKilobyte from './fee-models/SatoshisPerKilobyte.js'

export default class Transaction {
  version: number
  inputs: TransactionInput[]
  outputs: TransactionOutput[]
  lockTime: number
  metadata: Record<string, any>
  // merkleProof?: MerkleProof

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

  static fromHex (hex: string): Transaction {
    return Transaction.fromBinary(toArray(hex, 'hex'))
  }

  constructor (
    version: number = 1,
    inputs: TransactionInput[] = [],
    outputs: TransactionOutput[] = [],
    lockTime: number = 0,
    metadata: Record<string, any> = {}
  ) {
    this.version = version
    this.inputs = inputs
    this.outputs = outputs
    this.lockTime = lockTime
    this.metadata = metadata
  }

  addInput (input: TransactionInput): void {
    if (
      typeof input.sourceTXID === 'undefined' &&
      typeof input.sourceTransaction === 'undefined'
    ) {
      throw new Error('A reference to an an input transaction is required. If the input transaction itself cannot be referenced, its TXID must still be provided.')
    }
    this.inputs.push(input)
  }

  addOutput (output: TransactionOutput): void {
    this.outputs.push(output)
  }

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
      change.add(
        input.sourceTransaction.outputs[input.sourceOutputIndex].satoshis
      )
    }
    change.sub(fee)
    for (const out of this.outputs) {
      if (!out.change) {
        change.sub(out.satoshis)
      }
    }

    // Distribute change among change outputs
    if (changeDistribution === 'random') {
      // TODO
      throw new Error('Not yet implemented')
    } else if (changeDistribution === 'equal') {
      const totalChangeOutputs = this.outputs.reduce(
        (a, e) => e.change ? a + 1 : a,
        0
      )
      const perOutput = change.divn(totalChangeOutputs)
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
    for (let i = 0, l = this.inputs.length; i < l; i++) {
      if (typeof this.inputs[i].unlockingScriptTemplate === 'object') {
        this.inputs[i].unlockingScript = await this.inputs[i]
          .unlockingScriptTemplate
          .sign(this, i)
      }
    }
  }

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

  toHex (): string {
    return toHex(this.toBinary())
  }

  hash (enc?: 'hex'): number[] | string {
    return hash256(this.toBinary(), enc)
  }

  id (enc?: 'hex'): number[] | string {
    const id = hash256(this.toBinary()) as number[]
    id.reverse()
    if (enc === 'hex') {
      return toHex(id)
    }
    return id
  }
}
