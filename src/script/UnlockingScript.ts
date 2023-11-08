import Script from './Script.js'
import Spend from './Spend.js'
import LockingScript from './LockingScript.js'

export default class UnlockingScript extends Script {
  createSpend (lockingScript: LockingScript): Spend {
    return new Spend(lockingScript, this)
  }
}
