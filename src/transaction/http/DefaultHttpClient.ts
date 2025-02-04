import { HttpClient, HttpClientResponse } from './HttpClient'
import { NodejsHttpClient, HttpsNodejs } from './NodejsHttpClient'
import { FetchHttpClient } from './FetchHttpClient'
import * as https from 'https'

/**
 * Wraps Node's `https.request` to match the expected `HttpsNodejs` interface.
 */
const httpsWrapper: HttpsNodejs = {
  request: (url, options, callback) => {
    const req = https.request(url, options as https.RequestOptions, (res) => {
      callback({
        on: (event: string, cb: (data: Buffer | string) => void) => {
          res.on(event, cb)
        },
        statusCode: res.statusCode ?? 500,
        statusMessage: res.statusMessage ?? 'Unknown Error',
        headers: res.headers as { [key: string]: string }
      })
    })
    return {
      write: (chunk: string) => req.write(chunk),
      on: (event: string, cb: (data: Buffer | string) => void) => req.on(event, cb),
      end: () => req.end()
    }
  }
}

/**
 * Returns a default HttpClient implementation based on the environment that it is run on.
 * Uses `fetch` in the browser, and `https` in Node.
 */
export function defaultHttpClient (): HttpClient {
  const noHttpClient: HttpClient = {
    async request<T = unknown>(): Promise<HttpClientResponse<T>> {
      throw new Error('No method available to perform HTTP request')
    }
  }

  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    return new FetchHttpClient(window.fetch.bind(window))
  } else if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      return new NodejsHttpClient(httpsWrapper) // ✅ Pass wrapped https object
    } catch {
      return noHttpClient
    }
  } else {
    return noHttpClient
  }
}
