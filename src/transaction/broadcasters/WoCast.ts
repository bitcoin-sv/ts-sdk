import { HttpClient } from '../../primitives/utils.js'
import { BroadcastResponse, BroadcastFailure, Broadcaster } from '../Broadcaster.js'
import Transaction from '../Transaction.js'

/**
 * Represents an Whats on Chain transaction broadcaster.
 */
export default class WoCast implements Broadcaster {
  URL: string
  apiKey: string

  /**
   * Constructs an instance of the WhatsOnChain broadcaster.
   *
   * @param {string} network - The URL endpoint for the WhatsOnChain API.
   */
  constructor (network: string = 'main') {
    this.URL = `https://api.whatsonchain.com/v1/bsv/${network}/tx/raw`
  }

  /**
   * Broadcasts a transaction via ARC.
   * This method will attempt to use `window.fetch` if available (in browser environments).
   * If running in a Node.js environment, it falls back to using the Node.js `https` module.
   *
   * @param {Transaction} tx - The transaction to be broadcasted.
   * @returns {Promise<BroadcastResponse | BroadcastFailure>} A promise that resolves to either a success or failure response.
   */
  async broadcast (tx: Transaction): Promise<BroadcastResponse | BroadcastFailure> {
    let txhex
    txhex = tx.toHex()
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain'
      },
      body: JSON.stringify({ txhex })
    }

    try {
      const http = new HttpClient()
      const { response, data } = await http.request(this.URL, requestOptions)
      if (data.txid as boolean || response.ok as boolean || response.statusCode === 200) {
        return {
          status: 'success',
          txid: data,
          message: 'broadcast successful'
        }
      } else {
        return {
          status: 'error',
          code: response.status ?? 'ERR_UNKNOWN',
          description: data ?? 'Unknown error'
        }
      }
    } catch (error) {
      return {
        status: 'error',
        code: '500',
        description: typeof error.message === 'string'
          ? error.message
          : 'Internal Server Error'
      }
    }
  }
}
