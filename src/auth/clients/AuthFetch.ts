import { Utils, Random, P2PKH, PublicKey, Wallet } from '../../../mod.js'
import { Peer } from '../Peer.js'
import { SimplifiedFetchTransport } from '../transports/SimplifiedFetchTransport.js'
import { SessionManager } from '../SessionManager.js'
import { RequestedCertificateSet } from '../types.js'
import { VerifiableCertificate } from '../certificates/VerifiableCertificate.js'
import { Writer } from 'src/primitives/utils.js'

type SimplifiedFetchRequestOptions = {
  method?: string,
  headers?: Record<string, string>,
  body?: any,
  retryCounter?: number
}
type AuthPeer = { peer: Peer, identityKey?: string, supportsMutualAuth?: boolean }

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
  private sessionManager: SessionManager
  private wallet: Wallet
  private callbacks: Record<string, { resolve: Function, reject: Function }> = {}
  private certificatesReceived: VerifiableCertificate[] = []
  private requestedCertificates?: RequestedCertificateSet
  peers: Record<string, AuthPeer> = {}

  /**
  * Constructs a new SimplifiedFetch instance.
  * @param wallet - The wallet instance for signing and authentication.
  * @param requestedCertificates - Optional set of certificates to request from peers.
  */
  constructor(wallet: Wallet, requestedCertificates?: RequestedCertificateSet, sessionManager?: SessionManager) {
    this.wallet = wallet
    this.requestedCertificates = requestedCertificates
    this.sessionManager = sessionManager || new SessionManager()
  }

  /**
   * Mutually authenticates and sends a HTTP request to a server.
   * 
   * 1) Attempt the request.
   * 2) If 402 Payment Required, automatically create and send payment.
   * 3) Return the final response.
   * 
   * @param url - The URL to send the request to.
   * @param config - Configuration options for the request, including method, headers, and body.
   * @returns A promise that resolves with the server's response, structured as a Response-like object.
   * 
   * @throws Will throw an error if unsupported headers are used or other validation fails.
   */
  async fetch(url: string, config: SimplifiedFetchRequestOptions = {}): Promise<Response> {
    if (config.retryCounter) {
      if (config.retryCounter <= 0) {
        throw new Error('Request failed after maximum number of retries.')
      }
      config.retryCounter--
    }
    const response = await new Promise<Response>(async (resolve, reject) => {
      try {
        // Apply defaults
        const { method = 'GET', headers = {}, body } = config

        // Extract a base url
        const parsedUrl = new URL(url)
        const baseURL = parsedUrl.origin

        // Create a new transport for this base url if needed
        let peerToUse: AuthPeer
        if (!this.peers[baseURL]) {
          // Create a peer for the request
          const newTransport = new SimplifiedFetchTransport(baseURL)
          peerToUse = {
            peer: new Peer(this.wallet, newTransport, this.requestedCertificates, this.sessionManager)
          }
          this.peers[baseURL] = peerToUse
          const callbackId = this.peers[baseURL].peer.listenForCertificatesReceived((senderPublicKey: string, certs: VerifiableCertificate[]) => {
            this.certificatesReceived.push(...certs)
            // peerToUse.peer.stopListeningForCertificatesReceived()
          })
        } else {
          // Check if there's a session associated with this baseURL
          if (this.peers[baseURL].supportsMutualAuth === false) {
            // Use standard fetch if mutual authentication is not supported
            try {
              const response = await this.handleFetchAndValidate(url, config, this.peers[baseURL])
              resolve(response)
            } catch (error) {
              reject(error)
            }
          }
          peerToUse = this.peers[baseURL]
        }

        // Serialize the simplified fetch request.
        const requestNonce = Random(32)
        const requestNonceAsBase64 = Utils.toBase64(requestNonce)

        const writer = await this.serializeRequest(
          method,
          headers,
          body,
          parsedUrl,
          requestNonce
        )

        // Setup general message listener to resolve requests once a response is received
        this.callbacks[requestNonceAsBase64] = { resolve, reject }
        const listenerId = peerToUse.peer.listenForGeneralMessages((senderPublicKey: string, payload: number[]) => {
          // Create a reader
          const responseReader = new Utils.Reader(payload)
          // Deserialize first 32 bytes of payload
          const responseNonceAsBase64 = Utils.toBase64(responseReader.read(32))
          if (responseNonceAsBase64 === requestNonceAsBase64) {
            peerToUse.peer.stopListeningForGeneralMessages(listenerId)

            // Save the identity key for the peer for future requests, since we have it here.
            this.peers[baseURL].identityKey = senderPublicKey
            this.peers[baseURL].supportsMutualAuth = true

            // Status code
            const statusCode = responseReader.readVarIntNum()

            // Headers
            const responseHeaders = {}
            const nHeaders = responseReader.readVarIntNum()
            if (nHeaders > 0) {
              for (let i = 0; i < nHeaders; i++) {
                const nHeaderKeyBytes = responseReader.readVarIntNum()
                const headerKeyBytes = responseReader.read(nHeaderKeyBytes)
                const headerKey = Utils.toUTF8(headerKeyBytes)
                const nHeaderValueBytes = responseReader.readVarIntNum()
                const headerValueBytes = responseReader.read(nHeaderValueBytes)
                const headerValue = Utils.toUTF8(headerValueBytes)
                responseHeaders[headerKey] = headerValue
              }
            }

            // Add back the server identity key header
            responseHeaders['x-bsv-auth-identity-key'] = senderPublicKey

            // Body
            let responseBody
            const responseBodyBytes = responseReader.readVarIntNum()
            if (responseBodyBytes > 0) {
              responseBody = responseReader.read(responseBodyBytes)
            }

            // Create the Response object
            const responseValue = new Response(
              responseBody ? new Uint8Array(responseBody) : null, {
              status: statusCode,
              statusText: `${statusCode}`,
              headers: new Headers(responseHeaders)
            })

            // Resolve or reject the correct request with the response data
            this.callbacks[requestNonceAsBase64].resolve(responseValue)

            // Clean up
            delete this.callbacks[requestNonceAsBase64]
          }
        })

        // Send the request, now that all listeners are set up
        await peerToUse.peer.toPeer(writer.toArray(), peerToUse.identityKey).catch(async error => {
          if (error.message.includes('HTTP server failed to authenticate')) {
            try {
              const response = await this.handleFetchAndValidate(url, config, peerToUse)
              resolve(response)
            } catch (fetchError) {
              reject(fetchError)
            }
          } else {
            reject(error)
          }
        })
      } catch (e) {
        reject(e)
      }
    })

    // Check if server requires payment to access the requested route
    if (response.status === 402) {
      // Create and attach a payment, then retry
      return await this.handlePaymentAndRetry(url, config, response)
    }

    return response
  }

  /**
   * Request Certificates from a Peer
   * @param baseUrl 
   * @param certificatesToRequest 
   */
  async sendCertificateRequest(baseUrl: string, certificatesToRequest: RequestedCertificateSet): Promise<VerifiableCertificate[]> {
    const parsedUrl = new URL(baseUrl)
    const baseURL = parsedUrl.origin

    let peerToUse: { peer: Peer; identityKey?: string }
    if (this.peers[baseURL]) {
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
    return new Promise<VerifiableCertificate[]>(async (resolve, reject) => {
      // Set up the listener before making the request
      const callbackId = peerToUse.peer.listenForCertificatesReceived((_senderPublicKey: string, certs: VerifiableCertificate[]) => {
        peerToUse.peer.stopListeningForCertificatesReceived(callbackId)
        this.certificatesReceived.push(...certs)
        resolve(certs)
      })

      try {
        // Initiate the certificate request
        await peerToUse.peer.requestCertificates(certificatesToRequest, peerToUse.identityKey)
      } catch (err) {
        peerToUse.peer.stopListeningForCertificatesReceived(callbackId)
        reject(err)
      }
    })
  }

  /**
   * Return any certificates we've collected thus far, then clear them out.
   */
  public consumeReceivedCertificates(): VerifiableCertificate[] {
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
  private async serializeRequest(
    method: string,
    headers: Record<string, string>,
    body: any,
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
    const includedHeaders: [string, string][] = []
    for (let [k, v] of Object.entries(headers)) {
      k = k.toLowerCase() // We will always sign lower-case header keys
      if (k.startsWith('x-bsv-') || k === 'content-type' || k === 'authorization') {
        if (k.startsWith('x-bsv-auth')) {
          throw new Error('No BSV auth headers allowed here!')
        }
        includedHeaders.push([k, v])
      } else {
        throw new Error('Unsupported header in the simplified fetch implementation. Only content-type, authorization, and x-bsv-* headers are supported.')
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
    if (body) {
      const reqBody = await this.normalizeBodyToNumberArray(body) // Use the utility function
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
  private async handleFetchAndValidate(url: string, config: RequestInit, peerToUse: AuthPeer): Promise<Response> {
    const response = await fetch(url, config)
    response.headers.forEach(header => {
      if (header.toLocaleLowerCase().startsWith('x-bsv')) {
        throw new Error('The server is trying to claim it has been authenticated when it has not!')
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
  private async handlePaymentAndRetry(
    url: string,
    config: SimplifiedFetchRequestOptions = {},
    originalResponse: Response
  ): Promise<Response | null> {
    // Make sure the server is using the correct payment version
    const paymentVersion = originalResponse.headers.get('x-bsv-payment-version')
    if (!paymentVersion || paymentVersion !== PAYMENT_VERSION) {
      throw new Error(`Unsupported x-bsv-payment-version response header. Client version: ${PAYMENT_VERSION}, Server version: ${paymentVersion}`)
    }

    // Get required headers from the 402 response
    const satoshisRequiredHeader = originalResponse.headers.get(
      'x-bsv-payment-satoshis-required'
    )
    if (!satoshisRequiredHeader) {
      throw new Error('Missing x-bsv-payment-satoshis-required response header.')
    }
    const satoshisRequired = parseInt(satoshisRequiredHeader)
    if (isNaN(satoshisRequired) || satoshisRequired <= 0) {
      throw new Error('Invalid x-bsv-payment-satoshis-required response header value.')
    }

    const serverIdentityKey = originalResponse.headers.get('x-bsv-auth-identity-key')
    if (!serverIdentityKey) {
      throw new Error('Missing x-bsv-auth-identity-key response header.')
    }

    const derivationPrefix = originalResponse.headers.get('x-bsv-payment-derivation-prefix')
    if (!derivationPrefix) {
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
    const lockingScript = new P2PKH().lock(PublicKey.fromString(derivedPublicKey).toHash()).toHex()

    // Create the payment transaction using createAction
    const { tx } = await this.wallet.createAction({
      description: `Payment for request to ${new URL(url).origin}`,
      outputs: [{
        satoshis: satoshisRequired,
        lockingScript,
        outputDescription: 'HTTP request payment'
      }]
    })

    // Attach the payment to the request headers
    config.headers = config.headers || {}
    config.headers['x-bsv-payment'] = JSON.stringify({
      derivationPrefix,
      transaction: Utils.toBase64(tx)
    })
    config.retryCounter ??= 3

    // Re-attempt request with payment attached
    return this.fetch(url, config)
  }

  private async normalizeBodyToNumberArray(body: BodyInit | null | undefined): Promise<number[]> {
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
      const typedArray = body instanceof ArrayBuffer ? new Uint8Array(body) : new Uint8Array(body.buffer)
      return Array.from(typedArray)
    }

    // 5. Blob
    if (body instanceof Blob) {
      const arrayBuffer = await body.arrayBuffer()
      return Array.from(new Uint8Array(arrayBuffer))
    }

    // 6. FormData
    if (body instanceof FormData) {
      const entries: [string, string][] = []
      body.forEach((value, key) => {
        entries.push([key, value.toString()])
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
      throw new Error('ReadableStream cannot be directly converted to number[].')
    }

    // 9. Fallback
    throw new Error('Unsupported body type in this SimplifiedFetch implementation.')
  }
}