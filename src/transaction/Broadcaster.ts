import Transaction from './Transaction.js'

/**
 * Defines the structure of a successful broadcast response.
 *
 * @interface
 * @property {string} status - The status of the response, indicating success.
 * @property {string} txid - The transaction ID of the broadcasted transaction.
 * @property {string} message - A human-readable success message.
 */
export interface BroadcastResponse {
  status: 'success'
  txid: string
  message: string
  competingTxs?: string[]
}

/**
 * Defines the structure of a failed broadcast response.
 *
 * @interface
 * @property {string} status - The status of the response, indicating an error.
 * @property {string} code - A machine-readable error code representing the type of error encountered.
 * @property {string} txid - The transaction ID of the broadcasted transaction.
 * @property {string} description - A detailed description of the error.
 * @property {object} more - The unparsed response data from the underlying broadcast service.
 */
export interface BroadcastFailure {
  status: 'error'
  code: string
  txid?: string
  description: string
  more?: object
}

/**
 * Represents the interface for a transaction broadcaster.
 * This interface defines a standard method for broadcasting transactions.
 *
 * @interface
 * @property {function} broadcast - A function that takes a Transaction object and returns a promise.
 *                                  The promise resolves to either a BroadcastResponse or a BroadcastFailure.
 */
export interface Broadcaster {
  broadcast: (transaction: Transaction) =>
  Promise<BroadcastResponse | BroadcastFailure>
}

/**
 * Convenience type guard for response from `Broadcaster.broadcast`
 */
export function isBroadcastResponse (r: BroadcastResponse | BroadcastFailure): r is BroadcastResponse {
  return r.status === 'success'
}

/**
 * Convenience type guard for response from `Broadcaster.broadcast`
 */
export function isBroadcastFailure (r: BroadcastResponse | BroadcastFailure): r is BroadcastFailure {
  return r.status === 'error'
}
