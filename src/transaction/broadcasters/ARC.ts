import { BroadcastResponse, BroadcastFailure, Broadcaster } from '../Broadcaster.js'
import Transaction from '../Transaction.js'

export default class ARC implements Broadcaster {
  URL: string

  constructor (URL: string) {
    this.URL = URL
  }

  async broadcast (tx: Transaction): Promise<BroadcastResponse | BroadcastFailure> {
    const txHex = tx.toHex()
    return { // TODO: broadcast
      status: 'success',
      txid: tx.id('hex') as string,
      message: 'OK'
    }
  }
}
