import Transaction from './Transaction'
import BigNumber from '../primitives/BigNumber'

/**
 * Represents the interface for a transaction fee model.
 * This interface defines a standard method for computing a fee when given a transaction.
 *
 * @interface
 * @property {function} computeFee - A function that takes a Transaction object and returns a BigNumber representing the number of satoshis the transaction should cost.
 */
export default interface FeeModel {
  computeFee: (transaction: Transaction) => Promise<number>
}
