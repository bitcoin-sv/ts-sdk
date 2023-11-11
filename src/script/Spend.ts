import LockingScript from './LockingScript.js'
import UnlockingScript from './UnlockingScript.js'
import BigNumber from '../primitives/BigNumber.js'

/**
 * The Spend class represents a spend action within a Bitcoin SV transaction.
 * It encapsulates all the necessary data required for spending a UTXO (Unspent Transaction Output)
 * and includes details about the source transaction, output, and the spending transaction itself.
 *
 * @property {string} sourceTXID - The transaction ID of the source UTXO.
 * @property {number} sourceOutputIndex - The index of the output in the source transaction.
 * @property {BigNumber} sourceSatoshis - The amount of satoshis in the source UTXO.
 * @property {LockingScript} lockingScript - The locking script associated with the UTXO.
 * @property {number} transactionVersion - The version of the current transaction.
 * @property {Array<{ txid: string, outputIndex: number, sequence: number }>} otherInputs -
 *           An array of other inputs in the transaction, each with a txid, outputIndex, and sequence number.
 * @property {Array<{ satoshis: BigNumber, script: LockingScript }>} outputs -
 *           An array of outputs of the current transaction, including the satoshi value and locking script for each.
 * @property {number} inputIndex - The index of this input in the current transaction.
 * @property {UnlockingScript} unlockingScript - The unlocking script that unlocks the UTXO for spending.
 * @property {number} inputSequence - The sequence number of this input.
 */
export default class Spend {
  sourceTXID: string
  sourceOutputIndex: number
  sourceSatoshis: BigNumber
  lockingScript: LockingScript
  transactionVersion: number
  otherInputs: Array<{ txid: string, outputIndex: number, sequence: number }>
  outputs: Array<{ satoshis: BigNumber, script: LockingScript }>
  inputIndex: number
  unlockingScript: UnlockingScript
  inputSequence: number

  /**
   * @constructor
   * Constructs the Spend object with necessary transaction details.
   * @param {string} sourceTXID - The transaction ID of the source UTXO.
   * @param {number} sourceOutputIndex - The index of the output in the source transaction.
   * @param {BigNumber} sourceSatoshis - The amount of satoshis in the source UTXO.
   * @param {LockingScript} lockingScript - The locking script associated with the UTXO.
   * @param {number} transactionVersion - The version of the current transaction.
   * @param {Array<{ txid: string, outputIndex: number, sequence: number }>} otherInputs -
   *        An array of other inputs in the transaction.
   * @param {Array<{ satoshis: BigNumber, script: LockingScript }>} outputs -
   *        The outputs of the current transaction.
   * @param {number} inputIndex - The index of this input in the current transaction.
   * @param {UnlockingScript} unlockingScript - The unlocking script for this spend.
   * @param {number} inputSequence - The sequence number of this input.
   *
   * @example
   * const spend = new Spend(
   *   "abcd1234", // sourceTXID
   *   0, // sourceOutputIndex
   *   new BigNumber(1000), // sourceSatoshis
   *   LockingScript.fromASM("OP_DUP OP_HASH160 abcd1234... OP_EQUALVERIFY OP_CHECKSIG"),
   *   2, // transactionVersion
   *   [{ txid: "abcd1234", outputIndex: 1, sequence: 0xffffffff }], // otherInputs
   *   [{ satoshis: new BigNumber(500), script: LockingScript.fromASM("OP_DUP...") }], // outputs
   *   0, // inputIndex
   *   UnlockingScript.fromASM("3045... 02ab..."),
   *   0xffffffff // inputSequence
   * );
   */
  constructor (
    sourceTXID: string,
    sourceOutputIndex: number,
    sourceSatoshis: BigNumber,
    lockingScript: LockingScript,
    transactionVersion: number,
    otherInputs: Array<{ txid: string, outputIndex: number, sequence: number }>,
    outputs: Array<{ satoshis: BigNumber, script: LockingScript }>,
    inputIndex: number,
    unlockingScript: UnlockingScript,
    inputSequence: number
  ) {
    this.sourceTXID = sourceTXID
    this.sourceOutputIndex = sourceOutputIndex
    this.sourceSatoshis = sourceSatoshis
    this.lockingScript = lockingScript
    this.transactionVersion = transactionVersion
    this.otherInputs = otherInputs
    this.outputs = outputs
    this.inputIndex = inputIndex
    this.unlockingScript = unlockingScript
    this.inputSequence = inputSequence
  }

  /**
   * @method validate
   * Validates the spend action by interpreting the locking and unlocking scripts.
   * @returns {boolean} Returns true if the scripts are valid and the spend is legitimate, otherwise false.
   * @example
   * if (spend.validate()) {
   *   console.log("Spend is valid!");
   * } else {
   *   console.log("Invalid spend!");
   * }
   */
  validate (): boolean {
    // TODO: Interpret script
    return false
  }
}
