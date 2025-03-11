import UnlockingScript from './UnlockingScript.js'
import Transaction from '../transaction/Transaction.js'

export default interface ScriptTemplateUnlock {
  sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>
  estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>
}
