import LockingScript from './LockingScript.js'
import UnlockingScript from './UnlockingScript.js'
import Transaction from '../transaction/Transaction.js'

/**
 * @interface
 *
 * This interface defines the structure for script templates used in Bitcoin transactions.
 * It provides methods for creating locking scripts, unlocking scripts, and estimating the length of unlocking scripts.
 */
export default interface ScriptTemplate {
  /**
   * Creates a locking script with the given parameters.
   *
   * @param {...any} params - The parameters required to create the locking script.
   * @returns {LockingScript} - An instance of LockingScript, or a Promise for one.
   */
  lock: (...params: any) => LockingScript | Promise<LockingScript>

  /**
   * Creates a function that generates an unlocking script along with its signature and length estimation.
   *
   * This method returns an object containing two functions:
   * 1. `sign` - A function that, when called with a transaction and an input index, returns an UnlockingScript instance.
   * 2. `estimateLength` - A function that returns the estimated length of the unlocking script in bytes.
   *
   * @param {...any} params - The parameters required to create the unlocking script.
   * @returns {Object} - An object containing the `sign` and `estimateLength` functions.
   */
  unlock: (...params: any) =>
  {
    sign: (tx: Transaction, inputIndex: number) =>
    Promise<UnlockingScript>
    estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>
  }
}
