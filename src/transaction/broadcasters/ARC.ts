import {BroadcastResponse, BroadcastFailure, Broadcaster} from '../Broadcaster.js'
import Transaction from '../Transaction.js'
import {HttpClient, HttpClientRequestOptions} from "../http/HttpClient.js";
import { defaultHttpClient } from "../http/DefaultHttpClient.js";

/**
 * Represents an ARC transaction broadcaster.
 */
export default class ARC implements Broadcaster {
  URL: string
  apiKey: string
  private httpClient: HttpClient;

  /**
   * Constructs an instance of the ARC broadcaster.
   *
   * @param {string} URL - The URL endpoint for the ARC API.
   * @param {string} apiKey - The API key used for authorization with the ARC API.
   * @param {HttpClient} httpClient - The HTTP client used to make requests to the ARC API.
   */
  constructor(URL: string, apiKey: string, httpClient: HttpClient = defaultHttpClient()) {
    this.URL = URL
    this.apiKey = apiKey
    this.httpClient = httpClient
  }

  /**
   * Broadcasts a transaction via ARC.
   *
   * @param {Transaction} tx - The transaction to be broadcasted.
   * @returns {Promise<BroadcastResponse | BroadcastFailure>} A promise that resolves to either a success or failure response.
   */
  async broadcast(tx: Transaction): Promise<BroadcastResponse | BroadcastFailure> {
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
    const requestOptions: HttpClientRequestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      data: {rawTx}
    }

    try {
      const response = await this.httpClient.request<ArcResponse>(`${this.URL}/v1/tx`, requestOptions)
      if (response.ok) {
        const {txid, extraInfo, txStatus} = response.data
        return {
          status: 'success',
          txid: txid,
          message: `${txStatus} ${extraInfo}`
        }
      } else {
        return {
          status: 'error',
          code: response.status.toString() ?? 'ERR_UNKNOWN',
          description: response.data?.detail ?? 'Unknown error'
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

interface ArcResponse {
  txid: string
  extraInfo: string
  txStatus: string
}
