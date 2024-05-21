import FeeModel from '../FeeModel.js'
import Transaction from '../Transaction.js'

/**
 * Represents the fixed fee model.
 */
export default class SatoshisPerKilobyte implements FeeModel {
  /**
   * @property
   * Denotes the fixed fee value in satoshis.
   */
  value: number

  /**
   * Constructs an instance of the fixed fee model.
   *
   * @param {number} value - The number of satoshis to charge as fee.
   */
  constructor(value: number) {
    this.value = value
  }

  /**
   * Computes the fee for a given transaction.
   *
   * @param tx The transaction for which a fee is to be computed.
   * @returns The fee in satoshis for the transaction, as a BigNumber.
   */
  async computeFee(tx: Transaction): Promise<number> {
    return Promise.resolve(this.value)
  }
}
