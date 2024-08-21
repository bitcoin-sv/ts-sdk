import TransactionInput from './TransactionInput.js'
import TransactionOutput from './TransactionOutput.js'
import UnlockingScript from '../script/UnlockingScript.js'
import LockingScript from '../script/LockingScript.js'
import { Reader, Writer, toHex, toArray } from '../primitives/utils.js'
import { hash256 } from '../primitives/Hash.js'
import FeeModel from './FeeModel.js'
import SatoshisPerKilobyte from './fee-models/SatoshisPerKilobyte.js'
import { Broadcaster, BroadcastResponse, BroadcastFailure } from './Broadcaster.js'
import MerklePath from './MerklePath.js'
import Spend from '../script/Spend.js'
import ChainTracker from './ChainTracker.js'
import { defaultBroadcaster } from './broadcasters/DefaultBroadcaster.js'
import { defaultChainTracker } from './chaintrackers/DefaultChainTracker.js'

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
  private cachedHash?: number[]

  /**
   * Creates a new transaction, linked to its inputs and their associated merkle paths, from a BEEF (BRC-62) structure.
   * @param beef A binary representation of a transaction in BEEF format.
   * @returns An anchored transaction, linked to its associated inputs populated with merkle paths.
   */
  static fromBEEF (beef: number[]): Transaction {
    const reader = new Reader(beef)
    // Read the version
    const version = reader.readUInt32LE()
    if (version !== 4022206465) {
      throw new Error(`Invalid BEEF version. Expected 4022206465, received ${version}.`)
    }

    // Read the BUMPs
    const numberOfBUMPs = reader.readVarIntNum()
    const BUMPs = []
    for (let i = 0; i < numberOfBUMPs; i++) {
      BUMPs.push(MerklePath.fromReader(reader))
    }

    // Read all transactions into an object
    // The object has keys of TXIDs and values of objects with transactions and BUMP indexes
    const numberOfTransactions = reader.readVarIntNum()
    const transactions: Record<string, { pathIndex?: number, tx: Transaction }> = {}
    let lastTXID: string
    for (let i = 0; i < numberOfTransactions; i++) {
      const tx = Transaction.fromReader(reader)
      const obj: { pathIndex?: number, tx: Transaction } = { tx }
      const txid = tx.id('hex')
      if (i + 1 === numberOfTransactions) { // The last tXID is stored for later
        lastTXID = txid
      }
      const hasBump = Boolean(reader.readUInt8())
      if (hasBump) {
        obj.pathIndex = reader.readVarIntNum()
      }
      transactions[txid] = obj
    }

    // Recursive function for adding merkle proofs or input transactions
    const addPathOrInputs = (obj: { pathIndex?: number, tx: Transaction }): void => {
      if (typeof obj.pathIndex === 'number') {
        const path = BUMPs[obj.pathIndex]
        if (typeof path !== 'object') {
          throw new Error('Invalid merkle path index found in BEEF!')
        }
        obj.tx.merklePath = path
      } else {
        for (let i = 0; i < obj.tx.inputs.length; i++) {
          const input = obj.tx.inputs[i]
          const sourceObj = transactions[input.sourceTXID]
          if (typeof sourceObj !== 'object') {
            throw new Error(`Reference to unknown TXID in BUMP: ${input.sourceTXID}`)
          }
          input.sourceTransaction = sourceObj.tx
          addPathOrInputs(sourceObj)
        }
      }
    }

    // Read the final transaction and Add inputs and merkle proofs to the final transaction, returning it
    addPathOrInputs(transactions[lastTXID])
    return transactions[lastTXID].tx
  }

  /**
   * Creates a new transaction, linked to its inputs and their associated merkle paths, from a EF (BRC-30) structure.
   * @param ef A binary representation of a transaction in EF format.
   * @returns An extended transaction, linked to its associated inputs by locking script and satoshis amounts only.
   */
  static fromEF (ef: number[]): Transaction {
    const br = new Reader(ef)
    const version = br.readUInt32LE()
    if (toHex(br.read(6)) !== '0000000000ef') throw new Error('Invalid EF marker')
    const inputsLength = br.readVarIntNum()
    const inputs: TransactionInput[] = []
    for (let i = 0; i < inputsLength; i++) {
      const sourceTXID = toHex(br.readReverse(32))
      const sourceOutputIndex = br.readUInt32LE()
      const scriptLength = br.readVarIntNum()
      const scriptBin = br.read(scriptLength)
      const unlockingScript = UnlockingScript.fromBinary(scriptBin)
      const sequence = br.readUInt32LE()
      const satoshis = br.readUInt64LEBn().toNumber()
      const lockingScriptLength = br.readVarIntNum()
      const lockingScriptBin = br.read(lockingScriptLength)
      const lockingScript = LockingScript.fromBinary(lockingScriptBin)
      const sourceTransaction = new Transaction(null, [], [], null)
      sourceTransaction.outputs = Array(sourceOutputIndex + 1).fill(null)
      sourceTransaction.outputs[sourceOutputIndex] = {
        satoshis,
        lockingScript
      }
      inputs.push({
        sourceTransaction,
        sourceTXID,
        sourceOutputIndex,
        unlockingScript,
        sequence
      })
    }
    const outputsLength = br.readVarIntNum()
    const outputs: TransactionOutput[] = []
    for (let i = 0; i < outputsLength; i++) {
      const satoshis = br.readUInt64LEBn().toNumber()
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
   * Since the validation of blockchain data is atomically transaction data validation,
   * any application seeking to validate data in output scripts must store the entire transaction as well.
   * Since the transaction data includes the output script data, saving a second copy of potentially
   * large scripts can bloat application storage requirements.
   *
   * This function efficiently parses binary transaction data to determine the offsets and lengths of each script.
   * This supports the efficient retreival of script data from transaction data.
   *
   * @param bin binary transaction data
   * @returns {
   *   inputs: { vin: number, offset: number, length: number }[]
   *   outputs: { vout: number, offset: number, length: number }[]
   * }
   */
  static parseScriptOffsets (bin: number[]): {
    inputs: Array<{ vin: number, offset: number, length: number }>
    outputs: Array<{ vout: number, offset: number, length: number }>
  } {
    const br = new Reader(bin)
    const inputs: Array<{ vin: number, offset: number, length: number }> = []
    const outputs: Array<{ vout: number, offset: number, length: number }> = []

    br.pos += 4 // version
    const inputsLength = br.readVarIntNum()
    for (let i = 0; i < inputsLength; i++) {
      br.pos += 36 // txid and vout
      const scriptLength = br.readVarIntNum()
      inputs.push({ vin: i, offset: br.pos, length: scriptLength })
      br.pos += scriptLength + 4 // script and sequence
    }
    const outputsLength = br.readVarIntNum()
    for (let i = 0; i < outputsLength; i++) {
      br.pos += 8 // satoshis
      const scriptLength = br.readVarIntNum()
      outputs.push({ vout: i, offset: br.pos, length: scriptLength })
      br.pos += scriptLength
    }
    return { inputs, outputs }
  }

  static fromReader (br: Reader): Transaction {
    const version = br.readUInt32LE()
    const inputsLength = br.readVarIntNum()
    const inputs: TransactionInput[] = []
    for (let i = 0; i < inputsLength; i++) {
      const sourceTXID = toHex(br.readReverse(32))
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
      const satoshis = br.readUInt64LEBn().toNumber()
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
   * Creates a Transaction instance from a binary array.
   *
   * @static
   * @param {number[]} bin - The binary array representation of the transaction.
   * @returns {Transaction} - A new Transaction instance.
   */
  static fromBinary (bin: number[]): Transaction {
    const br = new Reader(bin)
    return Transaction.fromReader(br)
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

  /**
   * Creates a Transaction instance from a hexadecimal string encoded EF.
   *
   * @static
   * @param {string} hex - The hexadecimal string representation of the transaction EF.
   * @returns {Transaction} - A new Transaction instance.
   */
  static fromHexEF (hex: string): Transaction {
    return Transaction.fromEF(toArray(hex, 'hex'))
  }

  /**
   * Creates a Transaction instance from a hexadecimal string encoded BEEF.
   *
   * @static
   * @param {string} hex - The hexadecimal string representation of the transaction BEEF.
   * @returns {Transaction} - A new Transaction instance.
   */
  static fromHexBEEF (hex: string): Transaction {
    return Transaction.fromBEEF(toArray(hex, 'hex'))
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
    // If the input sequence number hasn't been set, the expectation is that it is final.
    if (typeof input.sequence === 'undefined') {
      input.sequence = 0xFFFFFFFF
    }
    this.cachedHash = undefined
    this.inputs.push(input)
  }

  /**
   * Adds a new output to the transaction.
   *
   * @param {TransactionOutput} output - The TransactionOutput object to add to the transaction.
   */
  addOutput (output: TransactionOutput): void {
    this.cachedHash = undefined
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
   * If fee is a number, the transaction uses that value as fee.
   *
   * @param modelOrFee - The initialized fee model to use or fixed fee for the transaction
   * @param changeDistribution - Specifies how the change should be distributed
   * amongst the change outputs
   *
   * TODO: Benford's law change distribution.
   */
  async fee (modelOrFee?: FeeModel | number, changeDistribution: 'equal' | 'random' = 'equal'): Promise<void> {
    this.cachedHash = undefined
    if (typeof modelOrFee === 'undefined') {
      modelOrFee = new SatoshisPerKilobyte(10)
    }
    if (typeof modelOrFee === 'number') {
      const sats = modelOrFee
      modelOrFee = {
        computeFee: async () => sats
      }
    }
    const fee = await modelOrFee.computeFee(this)
    // change = inputs - fee - non-change outputs
    let change = 0
    for (const input of this.inputs) {
      if (typeof input.sourceTransaction !== 'object') {
        throw new Error('Source transactions are required for all inputs during fee computation')
      }
      change += input.sourceTransaction.outputs[input.sourceOutputIndex].satoshis
    }
    change -= fee
    let changeCount = 0
    for (const out of this.outputs) {
      if (!out.change) {
        change -= out.satoshis
      } else {
        changeCount++
      }
    }

    if (change <= changeCount) {
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
      const perOutput = Math.floor(change / changeCount)
      for (const out of this.outputs) {
        if (out.change) {
          out.satoshis = perOutput
        }
      }
    }
  }

  /**
   * Utility method that returns the current fee based on inputs and outputs
   *
   * @returns The current transaction fee
   */
  getFee (): number {
    let totalIn = 0
    for (const input of this.inputs) {
      if (typeof input.sourceTransaction !== 'object') {
        throw new Error('Source transactions or sourceSatoshis are required for all inputs to calculate fee')
      }
      totalIn += input.sourceTransaction.outputs[input.sourceOutputIndex].satoshis
    }
    let totalOut = 0
    for (const output of this.outputs) {
      totalOut += output.satoshis || 0
    }
    return totalIn - totalOut
  }

  /**
   * Signs a transaction, hydrating all its unlocking scripts based on the provided script templates where they are available.
   */
  async sign (): Promise<void> {
    this.cachedHash = undefined
    for (const out of this.outputs) {
      if (typeof out.satoshis === 'undefined') {
        if (out.change) {
          throw new Error('There are still change outputs with uncomputed amounts. Use the fee() method to compute the change amounts and transaction fees prior to signing.')
        } else {
          throw new Error('One or more transaction outputs is missing an amount. Ensure all output amounts are provided before signing.')
        }
      }
    }
    const unlockingScripts = await Promise.all(this.inputs.map(async (x, i): Promise<UnlockingScript | undefined> => {
      if (typeof this.inputs[i].unlockingScriptTemplate === 'object') {
        return await this.inputs[i].unlockingScriptTemplate.sign(this, i)
      } else {
        return await Promise.resolve(undefined)
      }
    }))
    for (let i = 0, l = this.inputs.length; i < l; i++) {
      if (typeof this.inputs[i].unlockingScriptTemplate === 'object') {
        this.inputs[i].unlockingScript = unlockingScripts[i]
      }
    }
  }

  /**
   * Broadcasts a transaction.
   *
   * @param broadcaster The Broadcaster instance wwhere the transaction will be sent
   * @returns A BroadcastResponse or BroadcastFailure from the Broadcaster
   */
  async broadcast (broadcaster: Broadcaster = defaultBroadcaster()): Promise<BroadcastResponse | BroadcastFailure> {
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
      if (typeof i.sourceTXID === 'undefined') {
        writer.write(i.sourceTransaction.hash() as number[])
      } else {
        writer.writeReverse(toArray(i.sourceTXID, 'hex'))
      }
      writer.writeUInt32LE(i.sourceOutputIndex)
      const scriptBin = i.unlockingScript.toBinary()
      writer.writeVarIntNum(scriptBin.length)
      writer.write(scriptBin)
      writer.writeUInt32LE(i.sequence)
    }
    writer.writeVarIntNum(this.outputs.length)
    for (const o of this.outputs) {
      writer.writeUInt64LE(o.satoshis)
      const scriptBin = o.lockingScript.toBinary()
      writer.writeVarIntNum(scriptBin.length)
      writer.write(scriptBin)
    }
    writer.writeUInt32LE(this.lockTime)
    return writer.toArray()
  }

  /**
   * Converts the transaction to a BRC-30 EF format.
   *
   * @returns {number[]} - The BRC-30 EF representation of the transaction.
   */
  toEF (): number[] {
    const writer = new Writer()
    writer.writeUInt32LE(this.version)
    writer.write([0, 0, 0, 0, 0, 0xef])
    writer.writeVarIntNum(this.inputs.length)
    for (const i of this.inputs) {
      if (typeof i.sourceTransaction === 'undefined') {
        throw new Error('All inputs must have source transactions when serializing to EF format')
      }
      if (typeof i.sourceTXID === 'undefined') {
        writer.write(i.sourceTransaction.hash() as number[])
      } else {
        writer.write(toArray(i.sourceTXID, 'hex').reverse() as number[])
      }
      writer.writeUInt32LE(i.sourceOutputIndex)
      const scriptBin = i.unlockingScript.toBinary()
      writer.writeVarIntNum(scriptBin.length)
      writer.write(scriptBin)
      writer.writeUInt32LE(i.sequence)
      writer.writeUInt64LE(i.sourceTransaction.outputs[i.sourceOutputIndex].satoshis)
      const lockingScriptBin = i.sourceTransaction.outputs[i.sourceOutputIndex].lockingScript.toBinary()
      writer.writeVarIntNum(lockingScriptBin.length)
      writer.write(lockingScriptBin)
    }
    writer.writeVarIntNum(this.outputs.length)
    for (const o of this.outputs) {
      writer.writeUInt64LE(o.satoshis)
      const scriptBin = o.lockingScript.toBinary()
      writer.writeVarIntNum(scriptBin.length)
      writer.write(scriptBin)
    }
    writer.writeUInt32LE(this.lockTime)
    return writer.toArray()
  }

  /**
   * Converts the transaction to a hexadecimal string EF.
   *
   * @returns {string} - The hexadecimal string representation of the transaction EF.
   */
  toHexEF (): string {
    return toHex(this.toEF())
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
   * Converts the transaction to a hexadecimal string BEEF.
   *
   * @returns {string} - The hexadecimal string representation of the transaction BEEF.
   */
  toHexBEEF (): string {
    return toHex(this.toBEEF())
  }

  /**
   * Calculates the transaction's hash.
   *
   * @param {'hex' | undefined} enc - The encoding to use for the hash. If 'hex', returns a hexadecimal string; otherwise returns a binary array.
   * @returns {string | number[]} - The hash of the transaction in the specified format.
   */
  hash (enc?: 'hex'): number[] | string {
    let hash
    if (this.cachedHash) {
      hash = this.cachedHash
    } else {
      hash = hash256(this.toBinary())
      this.cachedHash = hash
    }
    if (enc === 'hex') {
      return toHex(hash)
    } else {
      return hash
    }
  }

  /**
   * Calculates the transaction's ID in binary array.
   *
   * @returns {number[]} - The ID of the transaction in the binary array format.
   */
  id (): number[]
  /**
   * Calculates the transaction's ID in hexadecimal format.
   *
   * @param {'hex'} enc - The encoding to use for the ID. If 'hex', returns a hexadecimal string.
   * @returns {string} - The ID of the transaction in the hex format.
   */
  id (enc: 'hex'): string
  /**
   * Calculates the transaction's ID.
   *
   * @param {'hex' | undefined} enc - The encoding to use for the ID. If 'hex', returns a hexadecimal string; otherwise returns a binary array.
   * @returns {string | number[]} - The ID of the transaction in the specified format.
   */
  id (enc?: 'hex'): number[] | string {
    const id = [...this.hash() as number[]]
    id.reverse()
    if (enc === 'hex') {
      return toHex(id)
    }
    return id
  }

  /**
   * Verifies the legitimacy of the Bitcoin transaction according to the rules of SPV by ensuring all the input transactions link back to valid block headers, the chain of spends for all inputs are valid, and the sum of inputs is not less than the sum of outputs.
   *
   * @param chainTracker - An instance of ChainTracker, a Bitcoin block header tracker. If the value is set to 'scripts only', headers will not be verified. If not provided then the default chain tracker will be used.
   *
   * @returns Whether the transaction is valid according to the rules of SPV.
   *
   * @example tx.verify(new WhatsOnChain(), new SatoshisPerKilobyte(1))
   */
  async verify (chainTracker: ChainTracker | 'scripts only' = defaultChainTracker(), feeModel?: FeeModel): Promise<boolean> {
    // If the transaction has a valid merkle path, verification is complete.
    if (typeof this.merklePath === 'object') {
      if (chainTracker === 'scripts only') {
        return true
      } else {
        const proofValid = await this.merklePath.verify(
          this.id('hex'),
          chainTracker
        )
        // Note that if the proof is provided but not valid, the transaction could still be verified by proving all inputs (if they are available) and checking the associated spends.
        if (proofValid) {
          return true
        }
      }
    }

    if (typeof feeModel !== 'undefined') {
      const cpTx = Transaction.fromHexEF(this.toHexEF())
      delete cpTx.outputs[0].satoshis
      cpTx.outputs[0].change = true
      await cpTx.fee(feeModel)
      if (this.getFee() < cpTx.getFee()) throw new Error(`Verification failed because the transaction ${this.id('hex')} has an insufficient fee and has not been mined.`)
    }

    // Verify each input transaction and evaluate the spend events.
    // Also, keep a total of the input amounts for later.
    let inputTotal = 0
    for (let i = 0; i < this.inputs.length; i++) {
      const input = this.inputs[i]
      if (typeof input.sourceTransaction !== 'object') {
        throw new Error(`Verification failed because the input at index ${i} of transaction ${this.id('hex')} is missing an associated source transaction. This source transaction is required for transaction verification because there is no merkle proof for the transaction spending a UTXO it contains.`)
      }
      if (typeof input.unlockingScript !== 'object') {
        throw new Error(`Verification failed because the input at index ${i} of transaction ${this.id('hex')} is missing an associated unlocking script. This script is required for transaction verification because there is no merkle proof for the transaction spending the UTXO.`)
      }
      const sourceOutput = input.sourceTransaction.outputs[input.sourceOutputIndex]
      inputTotal += sourceOutput.satoshis
      const inputVerified = await input.sourceTransaction.verify(chainTracker, feeModel)
      if (!inputVerified) {
        return false
      }
      const otherInputs = [...this.inputs]
      otherInputs.splice(i, 1)
      if (typeof input.sourceTXID === 'undefined') {
        input.sourceTXID = input.sourceTransaction.id('hex')
      }

      const spend = new Spend({
        sourceTXID: input.sourceTXID,
        sourceOutputIndex: input.sourceOutputIndex,
        lockingScript: sourceOutput.lockingScript,
        sourceSatoshis: sourceOutput.satoshis,
        transactionVersion: this.version,
        otherInputs,
        unlockingScript: input.unlockingScript,
        inputSequence: input.sequence,
        inputIndex: i,
        outputs: this.outputs,
        lockTime: this.lockTime
      })
      const spendValid = spend.validate()

      if (!spendValid) {
        return false
      }
    }

    // Total the outputs to ensure they don't amount to more than the inputs
    let outputTotal = 0
    for (const out of this.outputs) {
      if (typeof out.satoshis !== 'number') {
        throw new Error('Every output must have a defined amount during transaction verification.')
      }
      outputTotal += out.satoshis
    }

    return outputTotal <= inputTotal
  }

  /**
   * Serializes this transaction, together with its inputs and the respective merkle proofs, into the BEEF (BRC-62) format. This enables efficient verification of its compliance with the rules of SPV.
   *
   * @returns The serialized BEEF structure
   */
  toBEEF (): number[] {
    const writer = new Writer()
    writer.writeUInt32LE(4022206465)
    const BUMPs: MerklePath[] = []
    const txs: Array<{ tx: Transaction, pathIndex?: number }> = []

    // Recursive function to add paths and input transactions for a TX
    const addPathsAndInputs = (tx: Transaction): void => {
      const obj: { tx: Transaction, pathIndex?: number } = { tx }
      const hasProof = typeof tx.merklePath === 'object'
      if (hasProof) {
        let added = false
        // If this proof is identical to another one previously added, we use that first. Otherwise, we try to merge it with proofs from the same block.
        for (let i = 0; i < BUMPs.length; i++) {
          if (BUMPs[i] === tx.merklePath) { // Literally the same
            obj.pathIndex = i
            added = true
            break
          }
          if (BUMPs[i].blockHeight === tx.merklePath.blockHeight) {
            // Probably the same...
            const rootA = BUMPs[i].computeRoot()
            const rootB = tx.merklePath.computeRoot()
            if (rootA === rootB) {
              // Definitely the same... combine them to save space
              BUMPs[i].combine(tx.merklePath)
              obj.pathIndex = i
              added = true
              break
            }
          }
        }
        // Finally, if the proof is not yet added, add a new path.
        if (!added) {
          obj.pathIndex = BUMPs.length
          BUMPs.push(tx.merklePath)
        }
      }
      const duplicate = txs.some(x => x.tx.id('hex') === tx.id('hex'))
      if (!duplicate) {
        txs.unshift(obj)
      }
      if (!hasProof) {
        for (let i = 0; i < tx.inputs.length; i++) {
          const input = tx.inputs[i]
          if (typeof input.sourceTransaction !== 'object') {
            throw new Error('A required source transaction is missing!')
          }
          addPathsAndInputs(input.sourceTransaction)
        }
      }
    }

    addPathsAndInputs(this)

    writer.writeVarIntNum(BUMPs.length)
    for (const b of BUMPs) {
      writer.write(b.toBinary())
    }
    writer.writeVarIntNum(txs.length)
    for (const t of txs) {
      writer.write(t.tx.toBinary())
      if (typeof t.pathIndex === 'number') {
        writer.writeUInt8(1)
        writer.writeVarIntNum(t.pathIndex)
      } else {
        writer.writeUInt8(0)
      }
    }
    return writer.toArray()
  }
}
