import LockingScript from './LockingScript.js'
import UnlockingScript from './UnlockingScript.js'

export default interface ScriptTemplate {
  lock: (...params: any) => LockingScript
  unlock: (...params: any) => UnlockingScript
}
