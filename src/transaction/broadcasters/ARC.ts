import { HttpClient } from '../../primitives/utils.js'
import { BroadcastResponse, BroadcastFailure, Broadcaster } from '../Broadcaster.js'
import Transaction from '../Transaction.js'

/**
 * Represents an ARC transaction broadcaster.
 */
export default class ARC implements Broadcaster {
  URL: string
  apiKey: string

  /**
   * Constructs an instance of the ARC broadcaster.
   *
   * @param {string} URL - The URL endpoint for the ARC API.
   * @param {string} apiKey - The API key used for authorization with the ARC API.
   */
  constructor (URL: string, apiKey: string) {
    this.URL = URL
    this.apiKey = apiKey
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
    let rawTx
    try {
      rawTx = tx.toHexEF()
    } catch (error) {
      if (error.message === 'All inputs must have source transactions when serializing to EF format') {
        rawTx = tx.toHex()
      } else {
        throw error
      }
    } 
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({ rawTx })
    }

    try {
      const http = new HttpClient()
      const { response, data } = await http.request(`${this.URL}/tx/broadcast`, requestOptions)

      if (data.txid as boolean || response.ok as boolean || response.statusCode === 200) {
        return {
          status: 'success',
          txid: data.txid,
          message: data?.txStatus + ' ' + data?.extraInfo
        }
      } else {
        return {
          status: 'error',
          code: data.status as boolean ? data.status : 'ERR_UNKNOWN',
          description: data.detail as boolean ? data.detail : 'Unknown error'
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
