import { LookupResolver } from '../overlay-tools/index.js'
import { StorageUtils } from './index.js'
import PushDrop from '../script/templates/PushDrop.js'
import Transaction from '../transaction/Transaction.js'
import { Hash, Utils } from '../primitives/index.js'

export interface DownloaderConfig {
  networkPreset: 'mainnet' | 'testnet' | 'local'
}

export interface DownloadResult {
  data: number[]
  mimeType: string | null
}

/**
 * Locates HTTP URLs where content can be downloaded. It uses the passed or the default one.
 *
 * @param {Object} obj All parameters are passed in an object.
 * @param {String} obj.uhrpUrl The UHRP url to resolve.
 * @param {string} obj.confederacyHost HTTPS URL for for the with default setting.
 *
 * @return {Array<String>} An array of HTTP URLs where content can be downloaded.
 * @throws {Error} If UHRP url parameter invalid or is not an array
 * or there is an error retrieving url(s) stored in the UHRP token.
 */
export class StorageDownloader {
  private readonly networkPreset?: 'mainnet' | 'testnet' | 'local' = 'mainnet'

  constructor (config?: DownloaderConfig) {
    this.networkPreset = config?.networkPreset
  }

  public async resolve (uhrpUrl: string): Promise<string[]> {
    // Use UHRP lookup service
    const lookupResolver = new LookupResolver({ networkPreset: this.networkPreset })
    const response = await lookupResolver.query({ service: 'ls_uhrp', query: { uhrpUrl } })
    if (response.type !== 'output-list') {
      throw new Error('Lookup answer must be an output list')
    }
    const decodedResults: string[] = []
    const currentTime = Math.floor(Date.now() / 1000)
    for (let i = 0; i < response.outputs.length; i++) {
      const tx = Transaction.fromBEEF(response.outputs[i].beef)
      const { fields } = PushDrop.decode(tx.outputs[response.outputs[i].outputIndex].lockingScript)

      const expiryTime = new Utils.Reader(fields[3]).readVarIntNum()
      if (expiryTime < currentTime) {
        continue
      }

      decodedResults.push(Utils.toUTF8(fields[2]))
    }
    return decodedResults
  }

  public async download (uhrpUrl: string): Promise<DownloadResult> {
    if (!StorageUtils.isValidURL(uhrpUrl)) {
      throw new Error('Invalid parameter UHRP url')
    }
    const hash = StorageUtils.getHashFromURL(uhrpUrl)
    const downloadURLs = await this.resolve(uhrpUrl)

    if (!Array.isArray(downloadURLs) || downloadURLs.length === 0) {
      throw new Error('No one currently hosts this file!')
    }

    for (let i = 0; i < downloadURLs.length; i++) {
      try {
        // The url is fetched
        const result = await fetch(downloadURLs[i], { method: 'GET' })

        // If the request fails, continue to the next url
        if (!result.ok || result.status >= 400) {
          continue
        }
        const body = await result.arrayBuffer()

        // The body is loaded into a number array
        const content: number[] = [...new Uint8Array(body)]
        const contentHash = Hash.sha256(content)
        for (let i = 0; i < contentHash.length; ++i) {
          if (contentHash[i] !== hash[i]) {
            throw new Error('Value of content does not match hash of the url given')
          }
        }

        return {
          data: content,
          mimeType: result.headers.get('Content-Type')
        }
      } catch (error) {
        continue
      }
    }
    throw new Error(`Unable to download content from ${uhrpUrl}`)
  }
}
