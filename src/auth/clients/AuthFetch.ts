import { Utils, Random, P2PKH, PublicKey, WalletInterface } from '../../../mod'
import { Peer } from '../Peer'
import { SimplifiedFetchTransport } from '../transports/SimplifiedFetchTransport'
import { SessionManager } from '../SessionManager'
import { RequestedCertificateSet } from '../types'
import { VerifiableCertificate } from '../certificates/VerifiableCertificate'
import { Writer } from '../../primitives/utils'

interface SimplifiedFetchRequestOptions {
  method?: string
  headers?: Record<string, string>
  body?: string | Record<string, unknown> | null // ✅ Explicitly define allowed types
  retryCounter?: number
}
interface AuthPeer {
  peer: Peer
  identityKey?: string
  supportsMutualAuth?: boolean
}

const PAYMENT_VERSION = '1.0'

/**
 * AuthFetch provides a lightweight fetch client for interacting with servers
 * over a simplified HTTP transport mechanism. It integrates session management, peer communication,
 * and certificate handling to enable secure and mutually-authenticated requests.
 *
 * Additionally, it automatically handles 402 Payment Required responses by creating
 * and sending BSV payment transactions when necessary.
 */
export class AuthFetch {
  private readonly sessionManager: SessionManager
  private readonly wallet: WalletInterface
  private callbacks: Record<
  string,
  { resolve: (value?: unknown) => void, reject: (reason?: unknown) => void }
  > = {}

  private readonly certificatesReceived: VerifiableCertificate[] = []
  private readonly requestedCertificates?: RequestedCertificateSet
  peers: Record<string, AuthPeer> = {}

  /**
   * Constructs a new AuthFetch instance.
   * @param wallet - The wallet instance for signing and authentication.
   * @param requestedCertificates - Optional set of certificates to request from peers.
   */
  constructor (
    wallet: WalletInterface,
    requestedCertificates?: RequestedCertificateSet,
    sessionManager?: SessionManager
  ) {
    this.wallet = wallet
    this.requestedCertificates = requestedCertificates
    this.sessionManager = sessionManager ?? new SessionManager()
  }

  /**
 * Mutually authenticates and sends a HTTP request to a server.
 */
  async fetch (
    url: string,
    config: SimplifiedFetchRequestOptions = {}
  ): Promise<Response> {
    if (config.retryCounter !== undefined) {
      if (config.retryCounter <= 0) {
        throw new Error('Request failed after maximum number of retries.')
      }
      config.retryCounter--
    }

    try {
    // Apply defaults
      const { method = 'GET', headers = {}, body } = config
      const parsedUrl = new URL(url)
      const baseURL = parsedUrl.origin

      // Create a new transport for this base URL if needed
      let peerToUse: AuthPeer
      if (this.peers[baseURL] === undefined) {
        const newTransport = new SimplifiedFetchTransport(baseURL)
        peerToUse = {
          peer: new Peer(
            this.wallet,
            newTransport,
            this.requestedCertificates,
            this.sessionManager
          )
        }
        this.peers[baseURL] = peerToUse

        // Listen for certificates
        this.peers[baseURL].peer.listenForCertificatesReceived(
          (senderPublicKey: string, certs: VerifiableCertificate[]) => {
            this.certificatesReceived.push(...certs)
          }
        )
      } else {
        peerToUse = this.peers[baseURL]

        // If mutual auth is not supported, fallback to standard fetch
        if (peerToUse.supportsMutualAuth === false) {
          return await this.handleFetchAndValidate(url, {
            ...config,
            body: config.body !== undefined && config.body !== null && typeof config.body === 'object'
              ? JSON.stringify(config.body)
              : config.body
          }, peerToUse)
        }
      }

      // Serialize the simplified fetch request
      const requestNonce = Random(32)
      const requestNonceAsBase64 = Utils.toBase64(requestNonce)

      const writer = await this.serializeRequest(
        method,
        headers,
        body ?? null,
        parsedUrl,
        requestNonce
      )

      // Set up the request promise
      const responsePromise = new Promise<Response>((resolve, reject) => {
        this.callbacks[requestNonceAsBase64] = { resolve, reject }

        // Listen for response messages
        const listenerId = peerToUse.peer.listenForGeneralMessages(
          (senderPublicKey: string, payload: number[]) => {
            try {
              const responseReader = new Utils.Reader(payload)
              const responseNonceAsBase64 = Utils.toBase64(responseReader.read(32))

              if (responseNonceAsBase64 === requestNonceAsBase64) {
                peerToUse.peer.stopListeningForGeneralMessages(listenerId)

                // Save identity key
                this.peers[baseURL].identityKey = senderPublicKey
                this.peers[baseURL].supportsMutualAuth = true

                // Deserialize response
                const statusCode = responseReader.readVarIntNum()
                const responseHeaders: Record<string, string> = {}
                const nHeaders = responseReader.readVarIntNum()

                for (let i = 0; i < nHeaders; i++) {
                  const key = Utils.toUTF8(responseReader.read(responseReader.readVarIntNum()))
                  const value = Utils.toUTF8(responseReader.read(responseReader.readVarIntNum()))
                  responseHeaders[key] = value
                }

                // Add server identity key header
                responseHeaders['x-bsv-auth-identity-key'] = senderPublicKey

                // Read response body
                const responseBodyBytes = responseReader.readVarIntNum()
                const responseBody =
                responseBodyBytes > 0 ? responseReader.read(responseBodyBytes) : new Uint8Array([])

                // Construct response
                const responseValue = new Response(new Uint8Array(responseBody), {
                  status: statusCode,
                  statusText: `${statusCode}`,
                  headers: new Headers(responseHeaders)
                })

                resolve(responseValue)
                Reflect.deleteProperty(this.callbacks, requestNonceAsBase64)
              }
            } catch (err) {
              reject(err)
            }
          }
        )

        // Send request
        peerToUse.peer.toPeer(writer.toArray(), peerToUse.identityKey).catch(async (error: unknown) => {
          if (
            typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message: string }).message === 'string' &&
          (error as { message: string }).message.includes('HTTP server failed to authenticate')
          ) {
            try {
              const response = await this.handleFetchAndValidate(url, {
                ...config,
                body: config.body !== undefined && config.body !== null && typeof config.body === 'object'
                  ? JSON.stringify(config.body)
                  : config.body
              }, peerToUse)

              resolve(response)
            } catch (fetchError) {
              reject(fetchError)
            }
          } else {
            reject(error)
          }
        })
      })

      // Wait for response
      const response = await responsePromise

      // Handle 402 Payment Required
      if (response.status === 402) {
        return await this.handlePaymentAndRetry(url, config, response)
      }

      return response
    } catch (error) {
      throw new Error(`Fetch request failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Request Certificates from a Peer
   * @param baseUrl
   * @param certificatesToRequest
   */
  async sendCertificateRequest (
    baseUrl: string,
    certificatesToRequest: RequestedCertificateSet
  ): Promise<VerifiableCertificate[]> {
    const parsedUrl = new URL(baseUrl)
    const baseURL = parsedUrl.origin

    let peerToUse: { peer: Peer, identityKey?: string }
    if (this.peers[baseURL] !== undefined) { // ✅ Explicit undefined check
      peerToUse = { peer: this.peers[baseURL].peer }
    } else {
      const newTransport = new SimplifiedFetchTransport(baseURL)
      peerToUse = {
        peer: new Peer(
          this.wallet,
          newTransport,
          this.requestedCertificates,
          this.sessionManager
        )
      }
      this.peers[baseURL] = peerToUse
    }

    // Return a promise that resolves when certificates are received
    // Return a promise that resolves when certificates are received
    return await new Promise<VerifiableCertificate[]>((resolve, reject) => {
      // Set up the listener before making the request
      const callbackId = peerToUse.peer.listenForCertificatesReceived(
        (_senderPublicKey: string, certs: VerifiableCertificate[]) => {
          peerToUse.peer.stopListeningForCertificatesReceived(callbackId)
          this.certificatesReceived.push(...certs)
          resolve(certs)
        }
      )

      // Initiate the certificate request without using await
      peerToUse.peer
        .requestCertificates(certificatesToRequest, peerToUse.identityKey)
        .then(() => {
          // Successfully requested certificates
        })
        .catch((err) => {
          peerToUse.peer.stopListeningForCertificatesReceived(callbackId)
          reject(err)
        })
    })
  }

  /**
   * Return any certificates we've collected thus far, then clear them out.
   */
  public consumeReceivedCertificates (): VerifiableCertificate[] {
    return this.certificatesReceived.splice(0)
  }

  /**
   * Serializes the HTTP request to be sent over the Transport.
   *
   * @param method - The HTTP method (e.g., 'GET', 'POST') for the request.
   * @param headers - A record of HTTP headers to include in the request.
   * @param body - The body of the request, if applicable (e.g., for POST/PUT requests).
   * @param parsedUrl - The parsed URL object containing the full request URL.
   * @param requestNonce - A unique random nonce to ensure request integrity.
   * @returns A promise that resolves to a `Writer` containing the serialized request.
   *
   * @throws Will throw an error if unsupported headers are used or serialization fails.
   */
  private async serializeRequest (
    method: string,
    headers: Record<string, string>,
    body: string | Record<string, unknown> | null,
    parsedUrl: URL,
    requestNonce: number[]
  ): Promise<Writer> {
    const writer = new Utils.Writer()
    // Write request nonce
    writer.write(requestNonce)
    // Method length
    writer.writeVarIntNum(method.length)
    // Method
    writer.write(Utils.toArray(method))

    // Handle pathname (e.g. /path/to/resource)
    if (parsedUrl.pathname.length > 0) {
      // Pathname length
      const pathnameAsArray = Utils.toArray(parsedUrl.pathname)
      writer.writeVarIntNum(pathnameAsArray.length)
      // Pathname
      writer.write(pathnameAsArray)
    } else {
      writer.writeVarIntNum(-1)
    }

    // Handle search params (e.g. ?q=hello)
    if (parsedUrl.search.length > 0) {
      // search length
      const searchAsArray = Utils.toArray(parsedUrl.search)
      writer.writeVarIntNum(searchAsArray.length)
      // search
      writer.write(searchAsArray)
    } else {
      writer.writeVarIntNum(-1)
    }

    // Construct headers to send / sign:
    // - Custom headers prefixed with x-bsv are included
    // - x-bsv-auth headers are not allowed
    // - content-type and authorization are signed by client
    const includedHeaders: Array<[string, string]> = []
    for (const [k, v] of Object.entries(headers)) { // ✅ Use const instead of let
      const lowerCaseKey = k.toLowerCase() // ✅ Use a new variable for the lower-case key
      if (
        lowerCaseKey.startsWith('x-bsv-') ||
    lowerCaseKey === 'content-type' ||
    lowerCaseKey === 'authorization'
      ) {
        if (k.startsWith('x-bsv-auth')) {
          throw new Error('No BSV auth headers allowed here!')
        }
        includedHeaders.push([k, v])
      } else {
        throw new Error(
          'Unsupported header in the simplified fetch implementation. Only content-type, authorization, and x-bsv-* headers are supported.'
        )
      }
    }

    // nHeaders
    writer.writeVarIntNum(includedHeaders.length)
    for (let i = 0; i < includedHeaders.length; i++) {
      // headerKeyLength
      const headerKeyAsArray = Utils.toArray(includedHeaders[i][0], 'utf8')
      writer.writeVarIntNum(headerKeyAsArray.length)
      // headerKey
      writer.write(headerKeyAsArray)
      // headerValueLength
      const headerValueAsArray = Utils.toArray(includedHeaders[i][1], 'utf8')
      writer.writeVarIntNum(headerValueAsArray.length)
      // headerValue
      writer.write(headerValueAsArray)
    }

    // Handle body
    if (body !== null && body !== undefined && Object.keys(body).length !== 0) {
      // ✅ Ensure `body` is correctly formatted as a string before processing
      const formattedBody = typeof body === 'object'
        ? JSON.stringify(body) // Convert objects to JSON strings
        : body // Keep strings as they are

      const reqBody = await this.normalizeBodyToNumberArray(formattedBody)
      writer.writeVarIntNum(reqBody.length)
      writer.write(reqBody)
    } else {
      writer.writeVarIntNum(-1) // No body
    }
    return writer
  }

  /**
   * Handles a non-authenticated fetch requests and validates that the server is not claiming to be authenticated.
   */
  private async handleFetchAndValidate (
    url: string,
    config: RequestInit,
    peerToUse: AuthPeer
  ): Promise<Response> {
    const response = await fetch(url, config)
    response.headers.forEach((header) => {
      if (header.toLocaleLowerCase().startsWith('x-bsv')) {
        throw new Error(
          'The server is trying to claim it has been authenticated when it has not!'
        )
      }
    })

    if (response.ok) {
      peerToUse.supportsMutualAuth = false
      return response
    } else {
      throw new Error(`Request failed with status: ${response.status}`)
    }
  }

  /**
   * If we get 402 Payment Required, we build a transaction via wallet.createAction()
   * and re-attempt the request with an x-bsv-payment header.
   */
  private async handlePaymentAndRetry (
    url: string,
    config: SimplifiedFetchRequestOptions = {},
    originalResponse: Response
  ): Promise<Response> {
    // Make sure the server is using the correct payment version
    const paymentVersion = originalResponse.headers.get(
      'x-bsv-payment-version'
    )
    if (paymentVersion === null || paymentVersion === undefined || paymentVersion.trim() === '' || paymentVersion !== PAYMENT_VERSION) {
      throw new Error(
        `Unsupported x-bsv-payment-version response header. Client version: ${PAYMENT_VERSION}, Server version: ${paymentVersion ?? 'unknown'}`
      )
    }

    // Get required headers from the 402 response
    const satoshisRequiredHeader = originalResponse.headers.get(
      'x-bsv-payment-satoshis-required'
    )
    if (satoshisRequiredHeader === null || satoshisRequiredHeader === undefined || satoshisRequiredHeader.trim() === '') {
      throw new Error(
        'Missing x-bsv-payment-satoshis-required response header.'
      )
    }

    const satoshisRequired = parseInt(satoshisRequiredHeader)
    if (isNaN(satoshisRequired) || satoshisRequired <= 0) {
      throw new Error(
        'Invalid x-bsv-payment-satoshis-required response header value.'
      )
    }

    const serverIdentityKey = originalResponse.headers.get(
      'x-bsv-auth-identity-key'
    )
    if (serverIdentityKey === null || serverIdentityKey === undefined || serverIdentityKey.trim() === '') {
      throw new Error('Missing x-bsv-auth-identity-key response header.')
    }

    const derivationPrefix = originalResponse.headers.get(
      'x-bsv-payment-derivation-prefix'
    )
    if (derivationPrefix === null || derivationPrefix === undefined || derivationPrefix.trim() === '') {
      throw new Error('Missing x-bsv-payment-derivation-prefix response header.')
    }

    // Create a random suffix for the derivation path
    const derivationSuffix = Utils.toBase64(Random(10))

    // Derive the script hex from the server identity key
    const { publicKey: derivedPublicKey } = await this.wallet.getPublicKey({
      protocolID: [2, 'wallet payment'],
      keyID: `${derivationPrefix} ${derivationSuffix}`,
      counterparty: serverIdentityKey
    })
    const lockingScript = new P2PKH()
      .lock(PublicKey.fromString(derivedPublicKey).toHash())
      .toHex()

    // Create the payment transaction using createAction
    const { tx } = await this.wallet.createAction({
      description: `Payment for request to ${new URL(url).origin}`,
      outputs: [
        {
          satoshis: satoshisRequired,
          lockingScript,
          outputDescription: 'HTTP request payment'
        }
      ]
    })

    // Attach the payment to the request headers
    if (tx == null) {
      throw new Error('Transaction object is undefined.')
    }

    config.headers = config.headers ?? {} // ✅ Correctly handle nullish headers
    config.headers['x-bsv-payment'] = JSON.stringify({
      derivationPrefix,
      transaction: Utils.toBase64(tx)
    })

    config.retryCounter ??= 3

    // Re-attempt request with payment attached
    return await this.fetch(url, config)
  }

  private async normalizeBodyToNumberArray (
    body: BodyInit | null | undefined
  ): Promise<number[]> {
    // 1. Null / undefined
    if (body == null) {
      return []
    }

    // 2. number[]
    if (Array.isArray(body) && body.every((item) => typeof item === 'number')) {
      return body // Return the array as is
    }

    // 3. string
    if (typeof body === 'string') {
      return Utils.toArray(body, 'utf8')
    }

    // 4. ArrayBuffer / TypedArrays
    if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
      const typedArray =
        body instanceof ArrayBuffer
          ? new Uint8Array(body)
          : new Uint8Array(body.buffer)
      return Array.from(typedArray)
    }

    // 5. Blob
    if (body instanceof Blob) {
      const arrayBuffer = await body.arrayBuffer()
      return Array.from(new Uint8Array(arrayBuffer))
    }

    // 6. FormData
    if (body instanceof FormData) {
      const entries: Array<[string, string]> = []
      body.forEach((value, key) => {
        entries.push([key, typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)])
      })
      const urlEncoded = new URLSearchParams(entries).toString()
      return Utils.toArray(urlEncoded, 'utf8')
    }

    // 7. URLSearchParams
    if (body instanceof URLSearchParams) {
      return Utils.toArray(body.toString(), 'utf8')
    }

    // 8. ReadableStream
    if (body instanceof ReadableStream) {
      throw new Error(
        'ReadableStream cannot be directly converted to number[].'
      )
    }

    // 9. Fallback
    throw new Error(
      'Unsupported body type in this SimplifiedFetch implementation.'
    )
  }
}
