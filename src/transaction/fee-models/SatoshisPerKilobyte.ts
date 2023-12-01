import FeeModel from '../FeeModel.js'
import Transaction from '../Transaction.js'
import BigNumber from '../../primitives/BigNumber.js'

/**
 * Represents the "satoshis per kilobyte" transaction fee model.
 */
export default class SatoshisPerKilobyte implements FeeModel {
  value: number

  /**
   * Constructs an instance of the sat/kb fee model.
   *
   * @param {number} value - The number of satoshis per kilobyte to charge as a fee.
   */
  constructor (value: number) {
    this.value = value
  }

  computeFee (tx: Transaction): BigNumber {
    // TODO
    throw new Error('Not yet implemented')
  }
}
