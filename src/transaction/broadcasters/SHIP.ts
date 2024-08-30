import { BroadcastResponse, BroadcastFailure, Broadcaster } from '../Broadcaster.js'
import Transaction from '../Transaction.js'
import { HttpClient, HttpClientRequestOptions } from '../http/HttpClient.js'
import { defaultHttpClient } from '../http/DefaultHttpClient.js'
import Random from '../../primitives/Random.js'
import { toHex } from '../../primitives/utils.js'

/** Default SHIP trackers */
export const DEFAULT_SHIP_TRACKERS: string[] = [
  // TODO: Specify default trackers.
]

/** Configuration options for the SHIP broadcaster. */
export interface SHIPConfig {
  /** The HTTP client used to make requests to Overlay Services hosts. */
  httpClient?: HttpClient
  /** The list of SHIP trackers queried to resolve Overlay Services hosts for a given topic. */
  shipTrackers?: string[]
}

/**
 * Represents an SHIP transaction broadcaster.
 */
export default class SHIP implements Broadcaster {
  private readonly httpClient: HttpClient
  private readonly topics: string[]
  private readonly shipTrackers: string[]

  /**
   * Constructs an instance of the SHIP broadcaster.
   *
   * @param {string[]} topics - The list of SHIP topic names where transactions are to be sent.
   * @param {SHIPConfig} config - Configuration options for the SHIP broadcaster.
   */
  constructor(topics: string[], config?: SHIPConfig) {
    this.topics = topics
    const { httpClient, shipTrackers } = config ?? {} as SHIPConfig
    this.httpClient = httpClient ?? defaultHttpClient()
    this.shipTrackers = shipTrackers ?? DEFAULT_SHIP_TRACKERS
  }

  /**
   * Broadcasts a transaction to Overlay Services via SHIP.
   *
   * @param {Transaction} tx - The transaction to be sent.
   * @returns {Promise<BroadcastResponse | BroadcastFailure>} A promise that resolves to either a success or failure response.
   */
  async broadcast(tx: Transaction): Promise<BroadcastResponse | BroadcastFailure> {
    let beef: number[]
    try {
      beef = tx.toBEEF()
    } catch (error) {
      throw new Error('Transactions sent via SHIP to Overlay Services must be serializable to BEEF format.')
    }

    const interestedHosts = await this.findInterestedHosts()

    for (const [domain, topics] of domainToTopicsMap.entries()) {
      const promise = fetch(`${String(domain)}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Topics': JSON.stringify(Array.from(topics))
        },
        body: new Uint8Array(taggedBEEF.beef)
      })
      broadcastPromises.push(promise)
    }

    await Promise.all(broadcastPromises)

    const requestOptions: HttpClientRequestOptions = {
      method: 'POST',
      headers: this.requestHeaders(),
      data: { rawTx: beef }
    }

    try {
      const response = await this.httpClient.request<ArcResponse>(`${this.URL}/v1/tx`, requestOptions)
      if (response.ok) {
        const { txid, extraInfo, txStatus } = response.data
        return {
          status: 'success',
          txid,
          message: `${txStatus} ${extraInfo}`
        }
      } else {
        const st = typeof response.status
        const r: BroadcastFailure = {
          status: 'error',
          code: st === 'number' || st === 'string' ? response.status.toString() : 'ERR_UNKNOWN',
          description: 'Unknown error'
        }
        let d = response.data
        if (typeof d === 'string') {
          try {
            d = JSON.parse(response.data)
          } catch { }
        }
        if (typeof d === 'object') {
          r.more = d
          if (typeof d.txid === 'string') {
            r.txid = d.txid
          }
          if (typeof d.detail === 'string') {
            r.description = d.detail
          }
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

  /**
   * Finds which hosts are interested in transactions tagged with the given set of topics.
   * 
   * @returns A mapping of URLs for hosts interested in this transaction. Keys are URLs, values are which of our topics the specific host cares about.
   */
  private async findInterestedHosts(): Promise<Map<string, Set<string>>> {
    // TODO: cache the list of interested hosts to avoid spamming SHIP trackers.
    // TODO: Monetize the operation of the SHIP tracker system.
    // TODO: Cache ship/slap lookup with expiry (every 5min)

    // Find all SHIP advertisements for the topics we care about
    const domainToTopicsMap = new Map<string, Set<string>>()
    for (const topic of this.topics) {
      try {
        // Handle custom lookup service answers
        const lookupAnswer = await this.aggregatedSHIPLookup(topic)
        const shipAdvertisements: Advertisement[] = []
        lookupAnswer.outputs.forEach(output => {
          try {
            // Parse out the advertisements using the provided parser
            const tx = Transaction.fromBEEF(output.beef)
            const advertisement = this.advertiser?.parseAdvertisement(tx.outputs[output.outputIndex].lockingScript)
            if (advertisement !== undefined && advertisement !== null && advertisement.protocol === 'SHIP') {
              shipAdvertisements.push(advertisement)
            }
          } catch (error) {
            console.error('Failed to parse advertisement output:', error)
          }
        })
        if (shipAdvertisements.length > 0) {
          shipAdvertisements.forEach((advertisement: Advertisement) => {
            if (!domainToTopicsMap.has(advertisement.domain)) {
              domainToTopicsMap.set(advertisement.domain, new Set<string>())
            }
            domainToTopicsMap.get(advertisement.domain)?.add(topic)
          })
        }
      } catch (error) {
        console.error(`Error looking up topic ${String(topic)}:`, error)
      }
    }

    // Make sure we gossip to the shipTrackers we know about.
    if (this.topics.includes('tm_ship')) {
      this.shipTrackers.forEach(tracker => {
        if (domainToTopicsMap.get(tracker) !== undefined) {
          domainToTopicsMap.get(tracker)?.add('tm_ship')
        } else {
          domainToTopicsMap.set(tracker, new Set(['tm_ship']))
        }
      })
    }

    return domainToTopicsMap
  }
