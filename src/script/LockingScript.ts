import Script from './Script.js'

/**
 * The LockingScript class represents a locking script in a Bitcoin SV transaction.
 * It extends the Script class and is used specifically for output scripts that lock funds.
 *
 * Inherits all properties and methods from the Script class.
 *
 * @extends {Script}
 * @see {@link Script} for more information on Script.
 */
export default class LockingScript extends Script {
  /**
   * @method isLockingScript
   * Determines if the script is a locking script.
   * @returns {boolean} Always returns true for a LockingScript instance.
   */
  isLockingScript (): boolean {
    return true
  }

  /**
   * @method isUnlockingScript
   * Determines if the script is an unlocking script.
   * @returns {boolean} Always returns false for a LockingScript instance.
   */
  isUnlockingScript (): boolean {
    return false
  }
}
