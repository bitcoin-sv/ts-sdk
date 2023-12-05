import UnlockingScript from '../script/UnlockingScript.js'
import Transaction from './Transaction.js'

export default interface TransactionInput {
  sourceTransaction?: Transaction
  sourceTXID?: string
  sourceOutputIndex: number
  unlockingScript?: UnlockingScript
  unlockingScriptTemplate?: {
    sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>
    estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>
  }
  sequence: number
}
