import BigNumber from '../primitives/BigNumber.js'
import LockingScript from '../script/LockingScript.js'

/**
 * Represents an output in a Bitcoin transaction.
 * This interface defines the structure and components necessary to construct
 * a transaction output, which secures owned Bitcoins to be unlocked later.
 *
 * @interface TransactionOutput
 * @property {number} [satoshis] - Optional. The amount of satoshis (the smallest unit of Bitcoin) to be transferred by this output.
 * @property {LockingScript} lockingScript - The script that 'locks' the satoshis,
 *           specifying the conditions under which they can be spent. This script is
 *           essential for securing the funds and typically contains cryptographic
 *           puzzles that need to be solved to spend the output.
 * @property {boolean} [change] - Optional. A flag that indicates whether this output
 *           is a change output. If true, it means this output is returning funds back
 *           to the sender, usually as the 'change' from the transaction inputs.
 *
 * @example
 * // Creating a simple transaction output
 * let txOutput = {
 *   satoshis: 1000,
 *   lockingScript: LockingScript.fromASM('OP_DUP OP_HASH160 ... OP_EQUALVERIFY OP_CHECKSIG'),
 *   change: false
 * };
 *
 * @description
 * The TransactionOutput interface defines how bitcoins are to be distributed in a transaction, either to a recipient or
 * back to the sender as change. The lockingScript is critical as it determines the conditions
 * under which the output can be spent, typically requiring a digital signature matching the
 * intended recipient's public key.
 */
export default interface TransactionOutput {
  satoshis?: number
  lockingScript: LockingScript
  change?: boolean
}
