import { SessionManager } from './SessionManager.js'
import {
  createNonce,
  verifyNonce,
  getVerifiableCertificates,
  validateCertificates
} from './utils/index.js'
import {
  AuthMessage,
  PeerSession,
  RequestedCertificateSet,
  Transport
} from './types.js'
import { VerifiableCertificate } from './certificates/VerifiableCertificate.js'
import { Random, Utils, WalletInterface } from '../../mod.js'

const AUTH_VERSION = '0.1'

/**
 * Represents a peer capable of performing mutual authentication.
 * Manages sessions, handles authentication handshakes, certificate requests and responses,
 * and sending and receiving general messages over a transport layer.
 */
export class Peer {
  public sessionManager: SessionManager
  private readonly transport: Transport
  private readonly wallet: WalletInterface
  certificatesToRequest: RequestedCertificateSet
  private readonly onGeneralMessageReceivedCallbacks: Map<
  number,
  (senderPublicKey: string, payload: number[]) => void
  > = new Map()

  private readonly onCertificatesReceivedCallbacks: Map<
  number,
  (senderPublicKey: string, certs: VerifiableCertificate[]) => void
  > = new Map()

  private readonly onCertificateRequestReceivedCallbacks: Map<
  number,
  (
    senderPublicKey: string,
    requestedCertificates: RequestedCertificateSet
  ) => void
  > = new Map()

  private readonly onInitialResponseReceivedCallbacks: Map<
  number,
  { callback: (sessionNonce: string) => void, sessionNonce: string }
  > = new Map()

  // Single shared counter for all callback types
  private callbackIdCounter: number = 0

  // Whether to auto-persist the session with the last-interacted-with peer
  private readonly autoPersistLastSession: boolean = true

  // Last-interacted-with peer identity key
  private lastInteractedWithPeer: string | undefined

  /**
   * Creates a new Peer instance
   *
   * @param {WalletInterface} wallet - The wallet instance used for cryptographic operations.
   * @param {Transport} transport - The transport mechanism used for sending and receiving messages.
   * @param {RequestedCertificateSet} [certificatesToRequest] - Optional set of certificates to request from a peer during the initial handshake.
   * @param {SessionManager} [sessionManager] - Optional SessionManager to be used for managing peer sessions.
   * @param {boolean} [autoPersistLastSession] - Whether to auto-persist the session with the last-interacted-with peer. Defaults to true.
   */
  constructor (
    wallet: WalletInterface,
    transport: Transport,
    certificatesToRequest?: RequestedCertificateSet,
    sessionManager?: SessionManager,
    autoPersistLastSession?: boolean
  ) {
    this.wallet = wallet
    this.transport = transport
    this.certificatesToRequest = certificatesToRequest ?? {
      certifiers: [],
      types: {}
    }
    this.transport.onData(this.handleIncomingMessage.bind(this)).catch(console.error)
    this.sessionManager = sessionManager != null ? sessionManager : new SessionManager()
    if (autoPersistLastSession === false) {
      this.autoPersistLastSession = false
    } else {
      this.autoPersistLastSession = true
    }
  }

  /**
   * Sends a general message to a peer, and initiates a handshake if necessary.
   *
   * @param {number[]} message - The message payload to send.
   * @param {string} [identityKey] - The identity public key of the peer. If not provided, a handshake will be initiated.
   * @returns {Promise<void>}
   * @throws Will throw an error if the message fails to send.
   */
  async toPeer (
    message: number[],
    identityKey?: string,
    maxWaitTime?: number
  ): Promise<void> {
    if (
      this.autoPersistLastSession &&
      this.lastInteractedWithPeer !== undefined &&
      this.lastInteractedWithPeer !== null &&
      typeof identityKey !== 'string'
    ) {
      identityKey = this.lastInteractedWithPeer
    }
    const peerSession = await this.getAuthenticatedSession(
      identityKey,
      maxWaitTime
    )

    // Prepare the general message
    const requestNonce = Utils.toBase64(Random(32))
    const { signature } = await this.wallet.createSignature({
      data: message,
      protocolID: [2, 'auth message signature'],
      keyID: `${requestNonce} ${peerSession.peerNonce ?? ''}`,
      counterparty: peerSession.peerIdentityKey
    })

    const generalMessage: AuthMessage = {
      version: AUTH_VERSION,
      messageType: 'general',
      identityKey: (await this.wallet.getPublicKey({ identityKey: true }))
        .publicKey,
      nonce: requestNonce,
      yourNonce: peerSession.peerNonce,
      payload: message,
      signature
    }

    try {
      await this.transport.send(generalMessage)
    } catch (error) {
      const e = new Error(
        `Failed to send message to peer ${peerSession.peerIdentityKey ?? 'unknown'}: ${String(error.message)}`
      )
      e.stack = error.stack
      throw e
    }
  }

  /**
   * Sends a request for certificates to a peer.
   * This method allows a peer to dynamically request specific certificates after
   * an initial handshake or message has been exchanged.
   *
   * @param {RequestedCertificateSet} certificatesToRequest - Specifies the certifiers and types of certificates required from the peer.
   * @param {string} [identityKey] - The identity public key of the peer. If not provided, the current session identity is used.
   * @param {number} [maxWaitTime=10000] - Maximum time in milliseconds to wait for the peer session to be authenticated.
   * @returns {Promise<void>} Resolves if the certificate request message is successfully sent.
   * @throws Will throw an error if the peer session is not authenticated or if sending the request fails.
   */
  async requestCertificates (
    certificatesToRequest: RequestedCertificateSet,
    identityKey?: string,
    maxWaitTime = 10000
  ): Promise<void> {
    const peerSession = await this.getAuthenticatedSession(
      identityKey,
      maxWaitTime
    )

    // Prepare the general message
    const requestNonce = Utils.toBase64(Random(32))
    const { signature } = await this.wallet.createSignature({
      data: Utils.toArray(JSON.stringify(certificatesToRequest), 'utf8'),
      protocolID: [2, 'auth message signature'],
      keyID: `${requestNonce} ${peerSession.peerNonce ?? ''}`,
      counterparty: peerSession.peerIdentityKey
    })

    const certRequestMessage: AuthMessage = {
      version: AUTH_VERSION,
      messageType: 'certificateRequest',
      identityKey: (await this.wallet.getPublicKey({ identityKey: true }))
        .publicKey,
      nonce: requestNonce,
      initialNonce: peerSession.sessionNonce,
      yourNonce: peerSession.peerNonce,
      requestedCertificates: certificatesToRequest,
      signature
    }

    try {
      await this.transport.send(certRequestMessage)
    } catch (error: any) {
      throw new Error(
        `Failed to send certificate request message to peer ${peerSession.peerIdentityKey ?? 'unknown'}: ${String(error.message)}`
      )
    }
  }

  /**
   * Retrieves an authenticated session for a given peer identity. If no session exists
   * or the session is not authenticated, initiates a handshake to create or authenticate the session.
   *
   * @param {string} [identityKey] - The identity public key of the peer. If provided, it attempts
   * to retrieve an existing session associated with this identity.
   * @param {number} [maxWaitTime] - The maximum time in milliseconds to wait for the handshake
   * to complete if a new session is required. Defaults to a pre-defined timeout if not specified.
   * @returns {Promise<PeerSession>} - A promise that resolves with an authenticated `PeerSession`.
   * @throws {Error} - Throws an error if the transport is not connected or if the handshake fails.
   */
  async getAuthenticatedSession (
    identityKey?: string,
    maxWaitTime?: number
  ): Promise<PeerSession> {
    if (this.transport === undefined) {
      throw new Error('Peer transport is not connected!')
    }

    let peerSession = identityKey !== undefined && identityKey !== ''
      ? this.sessionManager.getSession(identityKey)
      : undefined
    if (peerSession === undefined || !peerSession?.isAuthenticated) {
      const sessionNonce = await this.initiateHandshake(
        identityKey,
        maxWaitTime
      )
      peerSession = this.sessionManager.getSession(identityKey !== undefined && identityKey !== '' ? identityKey : sessionNonce)
      if (peerSession === undefined || !peerSession.isAuthenticated) {
        throw new Error('Unable to establish mutual authentication with peer!')
      }
    }

    return peerSession
  }

  /**
   * Registers a callback to listen for general messages from peers.
   *
   * @param {(senderPublicKey: string, payload: number[]) => void} callback - The function to call when a general message is received.
   * @returns {number} The ID of the callback listener.
   */
  listenForGeneralMessages (
    callback: (senderPublicKey: string, payload: number[]) => void
  ): number {
    const callbackID = this.callbackIdCounter++
    this.onGeneralMessageReceivedCallbacks.set(callbackID, callback)
    return callbackID
  }

  /**
   * Removes a general message listener.
   *
   * @param {number} callbackID - The ID of the callback to remove.
   */
  stopListeningForGeneralMessages (callbackID: number): void {
    this.onGeneralMessageReceivedCallbacks.delete(callbackID)
  }

  /**
   * Registers a callback to listen for certificates received from peers.
   *
   * @param {(certs: VerifiableCertificate[]) => void} callback - The function to call when certificates are received.
   * @returns {number} The ID of the callback listener.
   */
  listenForCertificatesReceived (
    callback: (senderPublicKey: string, certs: VerifiableCertificate[]) => void
  ): number {
    const callbackID = this.callbackIdCounter++
    this.onCertificatesReceivedCallbacks.set(callbackID, callback)
    return callbackID
  }

  /**
   * Cancels and unsubscribes a certificatesReceived listener.
   *
   * @param {number} callbackID - The ID of the certificates received callback to cancel.
   */
  stopListeningForCertificatesReceived (callbackID: number): void {
    this.onCertificatesReceivedCallbacks.delete(callbackID)
  }

  /**
   * Registers a callback to listen for certificates requested from peers.
   *
   * @param {(requestedCertificates: RequestedCertificateSet) => void} callback - The function to call when a certificate request is received
   * @returns {number} The ID of the callback listener.
   */
  listenForCertificatesRequested (
    callback: (
      senderPublicKey: string,
      requestedCertificates: RequestedCertificateSet
    ) => void
  ): number {
    const callbackID = this.callbackIdCounter++
    this.onCertificateRequestReceivedCallbacks.set(callbackID, callback)
    return callbackID
  }

  /**
   * Cancels and unsubscribes a certificatesRequested listener.
   *
   * @param {number} callbackID - The ID of the requested certificates callback to cancel.
   */
  stopListeningForCertificatesRequested (callbackID: number): void {
    this.onCertificateRequestReceivedCallbacks.delete(callbackID)
  }

  /**
   * Initiates the mutual authentication handshake with a peer.
   *
   * @private
   * @param {string} [identityKey] - The identity public key of the peer.
   * @returns {Promise<string>} A promise that resolves to the session nonce.
   */
  private async initiateHandshake (
    identityKey?: string,
    maxWaitTime = 10000
  ): Promise<string> {
    const sessionNonce = await createNonce(this.wallet) // Initial request nonce
    this.sessionManager.addSession({
      isAuthenticated: false,
      sessionNonce,
      peerIdentityKey: identityKey
    })

    const initialRequest: AuthMessage = {
      version: AUTH_VERSION,
      messageType: 'initialRequest',
      identityKey: (await this.wallet.getPublicKey({ identityKey: true }))
        .publicKey,
      initialNonce: sessionNonce,
      requestedCertificates: this.certificatesToRequest
    }

    await this.transport.send(initialRequest)
    return await this.waitForInitialResponse(sessionNonce, maxWaitTime)
  }

  /**
   * Waits for the initial response from the peer after sending an initial handshake request message.
   *
   * @param {string} sessionNonce - The session nonce created in the initial request.
   * @returns {Promise<string>} A promise that resolves with the session nonce when the initial response is received.
   */
  private async waitForInitialResponse (
    sessionNonce: string,
    maxWaitTime = 10000
  ): Promise<string> {
    return await new Promise((resolve, reject) => {
      const callbackID = this.listenForInitialResponse(
        sessionNonce,
        sessionNonce => {
          clearTimeout(timeoutHandle)
          this.stopListeningForInitialResponses(callbackID)
          resolve(sessionNonce)
        }
      )

      const timeoutHandle = setTimeout(() => {
        this.stopListeningForInitialResponses(callbackID)
        reject(new Error('Initial response timed out.'))
      }, maxWaitTime)
    })
  }

  /**
   * Adds a listener for an initial response message matching a specific initial nonce.
   *
   * @private
   * @param {string} sessionNonce - The session nonce to match.
   * @param {(sessionNonce: string) => void} callback - The callback to invoke when the initial response is received.
   * @returns {number} The ID of the callback listener.
   */
  private listenForInitialResponse (
    sessionNonce: string,
    callback: (sessionNonce: string) => void
  ): number {
    const callbackID = this.callbackIdCounter++
    this.onInitialResponseReceivedCallbacks.set(callbackID, {
      callback,
      sessionNonce
    })
    return callbackID
  }

  /**
   * Removes a listener for initial responses.
   *
   * @private
   * @param {number} callbackID - The ID of the callback to remove.
   */
  private stopListeningForInitialResponses (callbackID: number): void {
    this.onInitialResponseReceivedCallbacks.delete(callbackID)
  }

  /**
   * Handles incoming messages from the transport.
   *
   * @param {AuthMessage} message - The incoming message to process.
   * @returns {Promise<void>}
   */
  private async handleIncomingMessage (message: AuthMessage): Promise<void> {
    if (message.version === undefined || message.version === '' || message.version !== AUTH_VERSION) {
      console.error(
        `Invalid message auth version! Received: ${message.version}, expected: ${AUTH_VERSION}`
      )
      return
    }

    switch (message.messageType) {
      case 'initialRequest':
        await this.processInitialRequest(message)
        break
      case 'initialResponse':
        await this.processInitialResponse(message)
        break
      case 'certificateRequest':
        await this.processCertificateRequest(message)
        break
      case 'certificateResponse':
        await this.processCertificateResponse(message)
        break
      case 'general':
        await this.processGeneralMessage(message)
        break
      default:
        console.error(
          `Unknown message type of ${String(message.messageType)} from ${String(message.identityKey)}`
        )
    }
  }

  /**
   * Processes an initial request message from a peer.
   *
   * @param {AuthMessage} message - The incoming initial request message.
   * @returns {Promise<void>}
   */
  async processInitialRequest (message: AuthMessage): Promise<void> {
    if (message.identityKey === undefined || message.identityKey === '' || message.initialNonce === undefined || message.initialNonce === '') {
      throw new Error('Missing required fields in initialResponse message.')
    }

    // Create an initial session nonce
    const sessionNonce = await createNonce(this.wallet)
    this.sessionManager.addSession({
      isAuthenticated: true,
      sessionNonce,
      peerNonce: message.initialNonce,
      peerIdentityKey: message.identityKey
    })

    // Handle initial certificate requests
    let certificatesToInclude
    if (message.requestedCertificates !== undefined && Array.isArray(message.requestedCertificates?.certifiers) && message.requestedCertificates?.certifiers?.length > 0) {
      if (this.onCertificateRequestReceivedCallbacks.size > 0) {
        // The application wants to handle certificate requests
        this.onCertificateRequestReceivedCallbacks.forEach(callback => {
          callback(message.identityKey, message.requestedCertificates as RequestedCertificateSet)
        })
      } else {
        // Attempt to find exact matching certificates to return automatically to save round trips
        certificatesToInclude = await getVerifiableCertificates(
          this.wallet,
          message.requestedCertificates,
          message.identityKey
        )
      }
    }

    // Create the signature for the message
    const { signature } = await this.wallet.createSignature({
      data: Utils.toArray(message.initialNonce + sessionNonce, 'base64'),
      protocolID: [2, 'auth message signature'],
      keyID: `${message.initialNonce} ${sessionNonce}`,
      counterparty: message.identityKey
    })

    const initialResponseMessage: AuthMessage = {
      version: AUTH_VERSION,
      messageType: 'initialResponse',
      identityKey: (await this.wallet.getPublicKey({ identityKey: true }))
        .publicKey,
      initialNonce: sessionNonce,
      yourNonce: message.initialNonce,
      certificates: certificatesToInclude,
      requestedCertificates: this.certificatesToRequest,
      signature
    }

    // For security, only set the last-interacted-with peer here if this is the first peer we've interacted with.
    if (this.lastInteractedWithPeer === undefined || this.lastInteractedWithPeer === null) {
      this.lastInteractedWithPeer = message.identityKey
    }

    await this.transport.send(initialResponseMessage)
  }

  /**
   * Processes an initial response message from a peer.
   *
   * @private
   * @param {AuthMessage} message - The incoming initial response message.
   * @returns {Promise<void>}
   * @throws Will throw an error if nonce verification or signature verification fails.
   */
  private async processInitialResponse (message: AuthMessage): Promise<void> {
    const validNonce = await verifyNonce(message.yourNonce as string, this.wallet)
    if (!validNonce) {
      throw new Error(
        `Initial response nonce verification failed from peer: ${message.identityKey}`
      )
    }

    const peerSession = this.sessionManager.getSession(message.yourNonce as string)
    if (peerSession === null || peerSession === undefined) {
      throw new Error(`Peer session not found for peer: ${message.identityKey}`)
    }

    // Validate message signature
    const { valid } = await this.wallet.verifySignature({
      data: Utils.toArray(
        (peerSession.sessionNonce ?? '') + (message.initialNonce ?? ''),
        'base64'
      ),
      signature: message.signature as number[],
      protocolID: [2, 'auth message signature'],
      keyID: `${peerSession.sessionNonce ?? ''} ${message.initialNonce ?? ''}`,
      counterparty: message.identityKey
    })
    if (!valid) {
      throw new Error(
        `Unable to verify initial response signature for peer: ${message.identityKey}`
      )
    }

    // After signature and nonce verification is complete, the peer is considered authenticated
    // Save the peer's identity key and initial nonce
    // This allows future requests to be linked to the same session
    peerSession.peerNonce = message.initialNonce
    peerSession.peerIdentityKey = message.identityKey
    peerSession.isAuthenticated = true
    // Run update to ensure lookup is available by both peerIdentityKey and sessionNonce
    this.sessionManager.updateSession(peerSession)

    // Process certificates received
    if (
      (this.certificatesToRequest?.certifiers?.length ?? 0) > 0 &&
      (message.certificates !== null && message.certificates !== undefined && message.certificates.length > 0)
    ) {
      await validateCertificates(
        this.wallet,
        message,
        this.certificatesToRequest
      )

      const messageCertificates = message.certificates
      if (message.certificates !== undefined) {
        this.onCertificatesReceivedCallbacks.forEach(callback =>
          callback(message.identityKey, messageCertificates)
        )
      }
    }

    this.lastInteractedWithPeer = message.identityKey

    this.onInitialResponseReceivedCallbacks.forEach(entry => {
      if (entry?.sessionNonce === peerSession.sessionNonce) {
        entry.callback(peerSession.sessionNonce)
      }
    })

    // Check if the peer requested certificates from us
    if (message.requestedCertificates !== undefined && Array.isArray(message.requestedCertificates?.certifiers) && message.requestedCertificates?.certifiers?.length > 0) {
      if (this.onCertificateRequestReceivedCallbacks.size > 0) {
        // Application wants to handle certificate requests
        this.onCertificateRequestReceivedCallbacks.forEach(callback => {
          callback(message.identityKey, message.requestedCertificates as RequestedCertificateSet)
        })
      } else {
        // Attempt to find exact matching certificates to respond automatically and save round trips
        const verifiableCertificates = await getVerifiableCertificates(
          this.wallet,
          message.requestedCertificates,
          message.identityKey
        )
        await this.sendCertificateResponse(
          message.identityKey,
          verifiableCertificates
        )
      }
    }
  }

  /**
   * Processes an incoming certificate request message from a peer.
   * Verifies the nonce and signature to ensure the authenticity of the request,
   * then initiates a response with any requested certificates that are available.
   *
   * @param {AuthMessage} message - The certificate request message received from the peer.
   * @throws {Error} Throws an error if nonce verification fails, or the message signature is invalid.
   */
  private async processCertificateRequest (message: AuthMessage): Promise<void> {
    const validNonce = await verifyNonce(message.yourNonce as string, this.wallet)
    if (!validNonce) {
      throw new Error(
        `Unable to verify nonce for certificate request message from: ${message.identityKey}`
      )
    }
    const peerSession = this.sessionManager.getSession(message.yourNonce as string)

    const { valid } = await this.wallet.verifySignature({
      data: Utils.toArray(
        JSON.stringify(message.requestedCertificates),
        'utf8'
      ),
      signature: message.signature as number[],
      protocolID: [2, 'auth message signature'],
      keyID: `${message.nonce ?? ''} ${peerSession?.sessionNonce ?? ''}`,
      counterparty: peerSession?.peerIdentityKey
    })

    if (!valid) {
      throw new Error(
        `Invalid signature in certificate request message from ${peerSession?.peerIdentityKey ?? 'unknown'}`
      )
    }

    if (message.requestedCertificates !== undefined && Array.isArray(message.requestedCertificates?.certifiers) && message.requestedCertificates?.certifiers?.length > 0) {
      if (this.onCertificateRequestReceivedCallbacks.size > 0) {
        // Application wants to handle certificate requests
        this.onCertificateRequestReceivedCallbacks.forEach(callback => {
          callback(message.identityKey, message.requestedCertificates as RequestedCertificateSet)
        })
      } else {
        // Attempt to find exact matching certificates to respond automatically and save round trips
        const verifiableCertificates = await getVerifiableCertificates(
          this.wallet,
          message.requestedCertificates,
          message.identityKey
        )
        await this.sendCertificateResponse(
          message.identityKey,
          verifiableCertificates
        )
      }
    }
  }

  /**
   * Sends a certificate response message containing the specified certificates to a peer.
   *
   * @param {string} verifierIdentityKey - The identity key of the peer requesting the certificates.
   * @param {VerifiableCertificate[]} certificates - The list of certificates to be included in the response.
   * @returns {Promise<void>} - A promise that resolves once the certificate response has been sent successfully.
   *
   * @throws {Error} Throws an error if the peer session could not be authenticated or if message signing fails.
   */
  async sendCertificateResponse (
    verifierIdentityKey: string,
    certificates: VerifiableCertificate[]
  ): Promise<void> {
    const peerSession = await this.getAuthenticatedSession(verifierIdentityKey)
    const requestNonce = Utils.toBase64(Random(32))
    const { signature } = await this.wallet.createSignature({
      data: Utils.toArray(JSON.stringify(certificates), 'utf8'),
      protocolID: [2, 'auth message signature'],
      keyID: `${requestNonce} ${peerSession.peerNonce ?? ''}`,
      counterparty: peerSession.peerIdentityKey
    })

    const certificateResponse: AuthMessage = {
      version: AUTH_VERSION,
      messageType: 'certificateResponse',
      identityKey: (await this.wallet.getPublicKey({ identityKey: true }))
        .publicKey,
      nonce: requestNonce,
      initialNonce: peerSession.sessionNonce,
      yourNonce: peerSession.peerNonce,
      certificates,
      signature
    }

    try {
      await this.transport.send(certificateResponse)
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Failed to send certificate response message to peer ${peerSession.peerIdentityKey ?? 'unknown'}: ${errorMessage}`
      )
    }
  }

  /**
   * Processes a certificate response message from a peer.
   *
   * @private
   * @param {AuthMessage} message - The incoming certificate response message.
   * @returns {Promise<void>}
   * @throws Will throw an error if nonce verification or signature verification fails.
   */
  private async processCertificateResponse (message: AuthMessage): Promise<void> {
    const validNonce = await verifyNonce(message.yourNonce as string, this.wallet)
    if (!validNonce) {
      throw new Error(
        `Unable to verify nonce for certificate response from: ${message.identityKey}!`
      )
    }
    const peerSession = this.sessionManager.getSession(message.yourNonce as string)

    // Validate message signature
    const { valid } = await this.wallet.verifySignature({
      data: Utils.toArray(JSON.stringify(message.certificates), 'utf8'),
      signature: message.signature as number[],
      protocolID: [2, 'auth message signature'],
      keyID: `${message.nonce ?? ''} ${peerSession?.sessionNonce ?? ''}`,
      counterparty: message.identityKey
    })

    if (!valid) {
      throw new Error(
        `Unable to verify certificate response signature for peer: ${message.identityKey}`
      )
    }

    // Process and verify any certificates received
    await validateCertificates(
      this.wallet,
      message,
      message.requestedCertificates
    )

    this.onCertificatesReceivedCallbacks.forEach(callback => {
      callback(message.identityKey, message.certificates as VerifiableCertificate[])
    })
  }

  /**
   * Processes a general message from a peer.
   *
   * @private
   * @param {AuthMessage} message - The incoming general message.
   * @returns {Promise<void>}
   * @throws Will throw an error if nonce verification or signature verification fails.
   */
  private async processGeneralMessage (message: AuthMessage): Promise<void> {
    const validNonce = await verifyNonce(message.yourNonce as string, this.wallet)
    if (!validNonce) {
      throw new Error(
        `Unable to verify nonce for general message from: ${message.identityKey}`
      )
    }
    const peerSession = this.sessionManager.getSession(message.yourNonce as string)

    const { valid } = await this.wallet.verifySignature({
      data: message.payload,
      signature: message.signature as number[],
      protocolID: [2, 'auth message signature'],
      keyID: `${message.nonce ?? ''} ${peerSession?.sessionNonce ?? ''}`,
      counterparty: peerSession?.peerIdentityKey
    })

    if (!valid) {
      throw new Error(
        `Invalid signature in generalMessage from ${peerSession?.peerIdentityKey ?? 'unknown'}`
      )
    }

    this.lastInteractedWithPeer = message.identityKey

    this.onGeneralMessageReceivedCallbacks.forEach(callback => {
      callback(message.identityKey, message.payload as number[])
    })
  }
}
