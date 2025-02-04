/**
 * An interface for HTTP client used to make HTTP requests.
 */
export interface HttpClient {
  /**
   * Makes a request to the server.
   * @param url The URL to make the request to.
   * @param options The request configuration.
   */
  request: <T = unknown, D = unknown>(
    url: string,
    options: HttpClientRequestOptions<D>
  ) => Promise<HttpClientResponse<T>>
}

/**
 * An interface for configuration of the request to be passed to the request method.
 */
export interface HttpClientRequestOptions<Data = unknown> {
  /** A string to set request's method. */
  method?: string
  /** An object literal set request's headers. */
  headers?: Record<string, string>
  /** An object or null to set request's body. */
  data?: Data
}

/**
 * An interface for the response returned by the request method.
 */
export type HttpClientResponse<T = unknown> =
  | {
    data: T
    /** The status code of the response. */
    status: number
    /** The status text of the response. */
    statusText: string
    /** A flag indicating whether the request ends with success status or not. */
    ok: true
  }
  | {
    data: unknown
    /** The status code of the response. */
    status: number
    /** The status text of the response. */
    statusText: string
    /** A flag indicating whether the request ends with success status or not. */
    ok: false
  }
