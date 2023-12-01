import BigNumber from '../primitives/BigNumber.js'
import LockingScript from '../script/LockingScript.js'

export default interface TransactionOutput {
  satoshis?: BigNumber
  lockingScript: LockingScript
  change?: boolean
}
