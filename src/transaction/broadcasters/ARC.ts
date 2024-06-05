import {BroadcastResponse, BroadcastFailure, Broadcaster} from '../Broadcaster.js'
import Transaction from '../Transaction.js'
import {HttpClient, HttpClientRequestOptions} from "../http/HttpClient.js";
import {defaultHttpClient} from "../http/DefaultHttpClient.js";
import Random from "../../primitives/Random.js";
import {toHex} from "../../primitives/utils.js";

/** Configuration options for the ARC broadcaster. */
export interface ArcConfig {
  /** Authentication token for the ARC API */
  apiKey?: string
  /** Deployment id used annotating api calls in XDeployment-ID header - this value will be randomly generated if not set */
  deploymentId?: string
  /** The HTTP client used to make requests to the ARC API. */
  httpClient?: HttpClient
}


function defaultDeploymentId() {
  return `ts-sdk-${toHex(Random(16))}`;
}

/**
 * Represents an ARC transaction broadcaster.
 */
export default class ARC implements Broadcaster {
  readonly URL: string
  readonly apiKey: string | undefined
  readonly deploymentId: string
  private readonly httpClient: HttpClient;

  /**
   * Constructs an instance of the ARC broadcaster.
   *
   * @param {string} URL - The URL endpoint for the ARC API.
   * @param {ArcConfig} config - Configuration options for the ARC broadcaster.
   */
  constructor(URL: string, config?: ArcConfig)
  /**
   * Constructs an instance of the ARC broadcaster.
   *
   * @param {string} URL - The URL endpoint for the ARC API.
   * @param {string} apiKey - The API key used for authorization with the ARC API.
   */
  constructor(URL: string, apiKey?: string)

  constructor(URL: string, config?: string | ArcConfig) {
    this.URL = URL
    if (typeof config === 'string') {
      this.apiKey = config
      this.httpClient = defaultHttpClient()
      this.deploymentId = defaultDeploymentId()
    } else {
      const {apiKey, deploymentId, httpClient} = config ?? {} as ArcConfig
      this.httpClient = httpClient ?? defaultHttpClient()
      this.deploymentId = deploymentId ?? defaultDeploymentId()
      this.apiKey = apiKey
    }
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
      headers: this.requestHeaders(),
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
        const r: BroadcastFailure = {
          status: 'error',
          code: response.status.toString() ?? 'ERR_UNKNOWN',
          description: 'Unknown error'
        }
        if (typeof response.data === 'string') {
          try {
            const data = JSON.parse(response.data)
            if (typeof data.detail === 'string') {
              r.description = data.detail
            }
          } catch {}
        }
        return r
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

  private requestHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'XDeployment-ID': this.deploymentId,
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    return headers
  }
}

interface ArcResponse {
  txid: string
  extraInfo: string
  txStatus: string
}
