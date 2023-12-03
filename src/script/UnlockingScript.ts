import Script from './Script.js'

/**
 * The UnlockingScript class represents an unlocking script in a Bitcoin SV transaction.
 * It extends the Script class and is used specifically for input scripts that unlock funds.
 *
 * Inherits all properties and methods from the Script class.
 *
 * @extends {Script}
 * @see {@link Script} for more information on Script.
 */
export default class UnlockingScript extends Script {
  /**
   * @method isLockingScript
   * Determines if the script is a locking script.
   * @returns {boolean} Always returns false for an UnlockingScript instance.
   */
  isLockingScript (): boolean {
    return false
  }

  /**
   * @method isUnlockingScript
   * Determines if the script is an unlocking script.
   * @returns {boolean} Always returns true for an UnlockingScript instance.
   */
  isUnlockingScript (): boolean {
    return true
  }
}
