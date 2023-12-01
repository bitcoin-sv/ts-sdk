import LockingScript from './LockingScript.js'
import UnlockingScript from './UnlockingScript.js'
import Transaction from '../transaction/Transaction.js'

export default interface ScriptTemplate {
  lock: (...params: any) => LockingScript
  unlock: (...params: any) =>
  (tx: Transaction, inputIndex: number) =>
  UnlockingScript
  estimateUnlockingScriptLength: (...params: any) => number
}
