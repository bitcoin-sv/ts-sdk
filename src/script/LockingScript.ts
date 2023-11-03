import Script from './Script.js'
import Spend from './Spend.js'
import UnlockingScript from './UnlockingScript.js'

export default class LockingScript extends Script {
  createSpend(unlockingScript: UnlockingScript): Spend {
    return new Spend(this, unlockingScript)
  }
}