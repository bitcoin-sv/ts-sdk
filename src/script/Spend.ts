import LockingScript from './LockingScript.js'
import UnlockingScript from './UnlockingScript.js'

export default class Spend {
  lockingScript: LockingScript
  unlockingScript: UnlockingScript

  constructor (lockingScript: LockingScript, unlockingScript: UnlockingScript) {
    this.lockingScript = lockingScript
    this.unlockingScript = unlockingScript
  }

  validate (): boolean {
    // Interpret script
    return false
  }
}
