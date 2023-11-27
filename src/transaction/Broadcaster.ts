import Transaction from './Transaction.js'

export interface BroadcastResponse {
  status: 'success'
  txid: string
  message: string
}

export interface BroadcastFailure {
  status: 'error'
  code: string
  description: string
}

export interface Broadcaster {
  broadcast: (transaction: Transaction) =>
  Promise<BroadcastResponse | BroadcastFailure>
}
