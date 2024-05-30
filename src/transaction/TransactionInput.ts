import UnlockingScript from '../script/UnlockingScript.js'
import Transaction from './Transaction.js'

/**
 * Represents an input to a Bitcoin transaction.
 * This interface defines the structure and components required to construct
 * a transaction input in the Bitcoin blockchain.
 *
 * @interface TransactionInput
 * @property {Transaction} [sourceTransaction] - Optional. The source transaction
 *           from which this input is derived. This is the transaction whose output
 *           is being spent by this input. Preferably provided if available.
 * @property {string} [sourceTXID] - Optional. The transaction ID (TXID) of the source
 *           transaction. Required if the source transaction itself is not provided.
 *           This uniquely identifies the transaction within the blockchain.
 * @property {number} sourceOutputIndex - The index of the output in the source transaction
 *           that this input is spending. It is zero-based, indicating the position of the
 *           output in the array of outputs of the source transaction.
 * @property {UnlockingScript} [unlockingScript] - Optional. The script that 'unlocks' the
 *           source output for spending. This script typically contains signatures and
 *           public keys that evidence the ownership of the output.
 * @property {Object} [unlockingScriptTemplate] - Optional. A template for generating the
 *           unlocking script. Useful when the unlocking script needs to be generated
 *           dynamically.
 *    @property {Function} unlockingScriptTemplate.sign - A function that, when given the
 *              current transaction and the index of this input, returns a Promise that
 *              resolves to the UnlockingScript.
 *    @property {Function} unlockingScriptTemplate.estimateLength - A function that estimates
 *              the length of the unlocking script, given the transaction and the input index.
 * @property {number} sequence - A sequence number for the input. Used to enable
 *           updates to this input. If set to a non-final value (less than 0xFFFFFFFF),
 *           it indicates that the input may be replaced in the future.
 *
 * @example
 * // Creating a simple transaction input
 * let txInput = {
 *   sourceTXID: '123abc...',
 *   sourceOutputIndex: 0,
 *   sequence: 0xFFFFFFFF
 * };
 *
 * // Using an unlocking script template
 * txInput.unlockingScriptTemplate = {
 *   sign: async (tx, index) => { ... },
 *   estimateLength: async (tx, index) => { ... }
 * };
 *
 * @description
 * This interface links an input to a
 * previous output and provides mechanisms (through unlocking scripts) to authorize the
 * spending of that output.
 */
export default interface TransactionInput {
  sourceTransaction?: Transaction
  sourceTXID?: string
  sourceOutputIndex: number
  unlockingScript?: UnlockingScript
  unlockingScriptTemplate?: {
    sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>
    estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>
  }
  sequence: number
}
