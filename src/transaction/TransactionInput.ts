import UnlockingScript from '../script/UnlockingScript.js'
import Transaction from './Transaction.js'

export default interface TransactionInput {
  sourceTransaction?: Transaction
  sourceTXID?: string
  sourceOutputIndex: number
  unlockingScript?: UnlockingScript
  createUnlockingScript?: (tx: Transaction, inputIndex: number) => UnlockingScript
  sequence: number
}
