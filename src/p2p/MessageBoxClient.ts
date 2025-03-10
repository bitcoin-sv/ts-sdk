import { WalletClient, AuthFetch } from '@bsv/sdk'
import { AuthSocketClient } from '@bsv/authsocket'

/**
 * Defines the structure of a PeerServ Message
 */
export interface PeerServMessage {
  messageId: number
  body: string
  sender: string
  created_at: string
  updated_at: string
  acknowledged?: boolean
}

/**
 * Defines the structure of a message being sent
 */
interface SendMessageParams {
  recipient: string
  messageBox: string
  body: string | object
  messageId?: string
  payment?: { satoshisPaid: number }
}

/**
 * Defines the structure of the response from sendMessage
 */
interface SendMessageResponse {
  status: string
  messageId: string
}

/**
 * Defines the structure of a request to acknowledge messages
 */
interface AcknowledgeMessageParams {
  messageIds: string[]
}

/**
 * Defines the structure of a request to list messages
 */
interface ListMessagesParams {
  messageBox: string
}

/**
 * Extendable class for interacting with a PeerServ
 */
class MessageBoxClient {
  private readonly peerServHost: string
  public readonly authFetch: AuthFetch
  private readonly walletClient: WalletClient
  private socket?: ReturnType<typeof AuthSocketClient>
  private myIdentityKey?: string

  constructor ({
    peerServHost = 'https://staging-peerserv.babbage.systems',
    walletClient
  }: { peerServHost?: string, walletClient: WalletClient }) {
    this.peerServHost = peerServHost
    this.walletClient = walletClient
    this.authFetch = new AuthFetch(this.walletClient)
  }

  /**
   * Calculates the required payment for sending a message.
   * This function matches the pricing logic on the server.
   */
  calculateMessagePrice (message: string, priority: boolean = false): number {
    const basePrice = 2 // Base fee in satoshis
    const sizeFactor = Math.ceil(Buffer.byteLength(message, 'utf8') / 1024) * 3 // 50 satoshis per KB

    const totalPrice = basePrice + sizeFactor
    console.log(`[CLIENT] Calculated message price: ${totalPrice} satoshis`)

    return totalPrice
  }

  /**
  * Getter for joinedRooms to use in tests
  */
  public getJoinedRooms (): Set<string> {
    return this.joinedRooms
  }

  public getIdentityKey (): string {
    if (this.myIdentityKey == null) {
      throw new Error('[CLIENT ERROR] Identity key is not set')
    }
    return this.myIdentityKey
  }

  /**
  * Establish an initial WebSocket connection (optional)
  */
  async initializeConnection (): Promise<void> {
    console.log('[CLIENT] initializeConnection() STARTED') // 🔹 Confirm function is called

    if (this.myIdentityKey == null || this.myIdentityKey.trim() === '') {
      console.log('[CLIENT] Fetching identity key...')
      try {
        const keyResult = await this.walletClient.getPublicKey({ identityKey: true })
        this.myIdentityKey = keyResult.publicKey
        console.log(`[CLIENT] Identity key fetched successfully: ${this.myIdentityKey}`)
      } catch (error) {
        console.error('[CLIENT ERROR] Failed to fetch identity key:', error)
        throw new Error('Identity key retrieval failed')
      }
    }

    if (this.myIdentityKey == null || this.myIdentityKey.trim() === '') {
      console.error('[CLIENT ERROR] Identity key is still missing after retrieval!')
      throw new Error('Identity key is missing')
    }

    console.log('[CLIENT] Setting up WebSocket connection...')

    if (this.socket == null) {
      this.socket = AuthSocketClient(this.peerServHost, { wallet: this.walletClient })

      let identitySent = false
      let authenticated = false

      this.socket.on('connect', () => {
        console.log('[CLIENT] Connected to WebSocket.')

        if (!identitySent) {
          console.log('[CLIENT] Sending authentication data:', this.myIdentityKey)
          if (this.myIdentityKey == null || this.myIdentityKey.trim() === '') {
            console.error('[CLIENT ERROR] Cannot send authentication: Identity key is missing!')
          } else {
            this.socket?.emit('authenticated', { identityKey: this.myIdentityKey })
            identitySent = true
          }
        }
      })

      // Listen for authentication success from the server
      this.socket.on('authenticationSuccess', (data) => {
        console.log(`[CLIENT] WebSocket authentication successful: ${JSON.stringify(data)}`)
        authenticated = true
      })

      // Handle authentication failures
      this.socket.on('authenticationFailed', (data) => {
        console.error(`[CLIENT ERROR] WebSocket authentication failed: ${JSON.stringify(data)}`)
        authenticated = false
      })

      this.socket.on('disconnect', () => {
        console.log('[CLIENT] Disconnected from MessageBox server')
        this.socket = undefined
        identitySent = false
        authenticated = false
      })

      this.socket.on('error', (error) => {
        console.error('[CLIENT ERROR] WebSocket error:', error)
      })

      // Wait for authentication confirmation before proceeding
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (authenticated) {
            console.log('[CLIENT] WebSocket fully authenticated and ready!')
            resolve()
          } else {
            reject(new Error('[CLIENT ERROR] WebSocket authentication timed out!'))
          }
        }, 5000) // Timeout after 5 seconds
      })
    }
  }

  /**
 * Tracks rooms the client has already joined
 */
  private readonly joinedRooms: Set<string> = new Set()

  /**
   * Join a WebSocket room before sending messages
   */
  async joinRoom (messageBox: string): Promise<void> {
    console.log(`[CLIENT] Attempting to join WebSocket room: ${messageBox}`)

    // Ensure WebSocket connection is established first
    if (this.socket == null) {
      console.log('[CLIENT] No WebSocket connection. Initializing...')
      await this.initializeConnection()
    }

    if (this.myIdentityKey == null || this.myIdentityKey.trim() === '') {
      throw new Error('[CLIENT ERROR] Identity key is not defined')
    }

    const roomId = `${this.myIdentityKey ?? ''}-${messageBox}`

    if (this.joinedRooms.has(roomId)) {
      console.log(`[CLIENT] Already joined WebSocket room: ${roomId}`)
      return
    }

    try {
      console.log(`[CLIENT] Joining WebSocket room: ${roomId}`)
      await this.socket?.emit('joinRoom', roomId)
      this.joinedRooms.add(roomId)
      console.log(`[CLIENT] Successfully joined room: ${roomId}`)
    } catch (error) {
      console.error(`[CLIENT ERROR] Failed to join WebSocket room: ${roomId}`, error)
    }
  }

  async listenForLiveMessages ({
    onMessage,
    messageBox
  }: {
    onMessage: (message: PeerServMessage) => void
    messageBox: string
  }): Promise<void> {
    console.log(`[CLIENT] Setting up listener for WebSocket room: ${messageBox}`)

    // Ensure WebSocket connection and room join
    await this.joinRoom(messageBox)

    // Ensure identity key is available before creating roomId
    if (this.myIdentityKey == null || this.myIdentityKey.trim() === '') {
      throw new Error('[CLIENT ERROR] Identity key is missing. Cannot construct room ID.')
    }

    const roomId = `${this.myIdentityKey}-${messageBox}`

    console.log(`[CLIENT] Listening for messages in room: ${roomId}`)

    this.socket?.on(`sendMessage-${roomId}`, (message: PeerServMessage) => {
      console.log(`[CLIENT] Received message in room ${roomId}:`, message)
      onMessage(message)
    })
  }

  /**
 * Sends a message over WebSocket if connected; falls back to HTTP otherwise.
 */
  async sendLiveMessage ({ recipient, messageBox, body }: SendMessageParams): Promise<SendMessageResponse> {
    if (recipient == null || recipient.trim() === '') {
      throw new Error('[CLIENT ERROR] Recipient identity key is required')
    }
    if (messageBox == null || messageBox.trim() === '') {
      throw new Error('[CLIENT ERROR] MessageBox is required')
    }
    if (body == null || (typeof body === 'string' && body.trim() === '')) {
      throw new Error('[CLIENT ERROR] Message body cannot be empty')
    }

    // Ensure WebSocket connection and room join before sending
    await this.joinRoom(messageBox)

    if (this.socket == null) {
      console.warn('[CLIENT WARNING] WebSocket not connected, falling back to HTTP')
      return await this.sendMessage({ recipient, messageBox, body })
    }

    // Generate message ID
    let messageId: string
    try {
      const hmac = await this.walletClient.createHmac({
        data: Array.from(new TextEncoder().encode(JSON.stringify(body))),
        protocolID: [0, 'PeerServ'],
        keyID: '1',
        counterparty: recipient
      })
      messageId = Array.from(hmac.hmac).map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (error) {
      console.error('[CLIENT ERROR] Failed to generate HMAC:', error)
      throw new Error('Failed to generate message identifier.')
    }

    const roomId = `${recipient}-${messageBox}`
    console.log(`[CLIENT] Sending WebSocket message to room: ${roomId}`)

    return await new Promise((resolve, reject) => {
      const ackEvent = `sendMessageAck-${roomId}`
      let handled = false // Track whether the event has already been handled

      const ackHandler = (response?: SendMessageResponse): void => {
        if (handled) return // Ignore duplicate responses
        handled = true // Mark event as handled

        console.log('[CLIENT] Received WebSocket acknowledgment:', response)

        if (response == null || response.status !== 'success') {
          console.warn('[CLIENT] WebSocket message failed, falling back to HTTP')
          this.sendMessage({ recipient, messageBox, body }).then(resolve).catch(reject)
        } else {
          console.log('[CLIENT] Message sent successfully via WebSocket:', response)
          resolve(response)
        }
      }

      // Register the event listener
      this.socket?.on(ackEvent, ackHandler)

      // Send the message
      this.socket?.emit('sendMessage', { roomId, message: { messageId, body } })
    })
  }

  /**
   * Leaves a WebSocket room.
   */
  async leaveRoom (messageBox: string): Promise<void> {
    if (this.socket == null) {
      console.warn('[CLIENT] Attempted to leave a room but WebSocket is not connected.')
      return
    }

    if (this.myIdentityKey == null || this.myIdentityKey.trim() === '') {
      throw new Error('[CLIENT ERROR] Identity key is not defined')
    }

    const roomId = `${this.myIdentityKey}-${messageBox}`
    console.log(`[CLIENT] Leaving WebSocket room: ${roomId}`)
    this.socket.emit('leaveRoom', roomId)

    // ✅ Ensure the room is removed from tracking
    this.joinedRooms.delete(roomId)
  }

  /**
   * Closes WebSocket connection.
   */
  async disconnectWebSocket (): Promise<void> {
    if (this.socket != null) {
      console.log('[CLIENT] Closing WebSocket connection...')
      this.socket.disconnect()
      this.socket = undefined
    } else {
      console.log('[CLIENT] No active WebSocket connection to close.')
    }
  }

  /**
   * Sends a message via HTTP
   */
  async sendMessage (message: SendMessageParams): Promise<SendMessageResponse> {
    if (message.recipient == null || message.recipient.trim() === '') {
      throw new Error('You must provide a message recipient!')
    }
    if (message.messageBox == null || message.messageBox.trim() === '') {
      throw new Error('You must provide a messageBox to send this message into!')
    }
    if (message.body == null || (typeof message.body === 'string' && message.body.trim().length === 0)) {
      throw new Error('Every message must have a body!')
    }

    // Calculate required payment
    const requiredSatoshis = this.calculateMessagePrice(JSON.stringify(message.body), false)
    console.log(`[CLIENT] Calculated message price: ${requiredSatoshis} satoshis`)

    // Generate HMAC
    let messageId: string
    try {
      const hmac = await this.walletClient.createHmac({
        data: Array.from(new TextEncoder().encode(JSON.stringify(message.body))),
        protocolID: [0, 'PeerServ'],
        keyID: '1',
        counterparty: message.recipient
      })
      messageId = message.messageId ?? Array.from(hmac.hmac).map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (error) {
      console.error('[CLIENT ERROR] Failed to generate HMAC:', error)
      throw new Error('Failed to generate message identifier.')
    }

    console.log(`[CLIENT] Sending message with ID ${messageId} and payment: ${requiredSatoshis} satoshis`)

    const requestBody = {
      message: { ...message, messageId, body: JSON.stringify(message.body) }
    }

    try {
      console.log('[CLIENT] Sending HTTP request to:', `${this.peerServHost}/sendMessage`)
      console.log('[CLIENT] Request Body:', JSON.stringify(requestBody, null, 2))

      // Set a manual timeout using Promise.race()
      // const timeoutPromise = new Promise<Response>((_resolve, reject) =>
      //   setTimeout(() => reject(new Error('[CLIENT ERROR] Request timed out!')), 10000)
      // )

      // Ensure the identity key is fetched before sending
      if (this.myIdentityKey == null || this.myIdentityKey === '') {
        try {
          const keyResult = await this.walletClient.getPublicKey({ identityKey: true })
          this.myIdentityKey = keyResult.publicKey
          console.log(`[CLIENT] Fetched identity key before sending request: ${this.myIdentityKey}`)
        } catch (error) {
          console.error('[CLIENT ERROR] Failed to fetch identity key:', error)
          throw new Error('Identity key retrieval failed')
        }
      }

      // Now create the headers AFTER ensuring identityKey is set
      const authHeaders = {
        'Content-Type': 'application/json'
      }

      console.log('[CLIENT] Sending Headers:', JSON.stringify(authHeaders, null, 2))

      const response = await this.authFetch.fetch(`${this.peerServHost}/sendMessage`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(requestBody)
      })

      // Debug: Check if bodyUsed before reading
      console.log('[CLIENT] Raw Response:', response)
      console.log('[CLIENT] Response Body Used?', response.bodyUsed)

      // Read body only if it's not already consumed
      if (response.bodyUsed) {
        throw new Error('[CLIENT ERROR] Response body has already been used!')
      }

      const parsedResponse = await response.json()
      console.log('[CLIENT] Raw Response Body:', parsedResponse)

      if (!response.ok) {
        console.error(`[CLIENT ERROR] Failed to send message. HTTP ${response.status}: ${response.statusText}`)
        throw new Error(`Message sending failed: HTTP ${response.status} - ${response.statusText}`)
      }

      if (parsedResponse.status !== 'success') {
        console.error(`[CLIENT ERROR] Server returned an error: ${String(parsedResponse.description)}`)
        throw new Error(parsedResponse.description ?? 'Unknown error from server.')
      }

      console.log('[CLIENT] Message successfully sent.')
      return { ...parsedResponse, messageId }
    } catch (error) {
      console.error('[CLIENT ERROR] Network or timeout error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to send message: ${errorMessage}`)
    }
  }

  /**
   * Lists messages from PeerServ
   */
  async listMessages ({ messageBox }: ListMessagesParams): Promise<PeerServMessage[]> {
    if (messageBox.trim() === '') {
      throw new Error('MessageBox cannot be empty')
    }

    const response = await this.authFetch.fetch(`${this.peerServHost}/listMessages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageBox })
    })

    const parsedResponse = await response.json()

    if (parsedResponse.status === 'error') {
      throw new Error(parsedResponse.description)
    }

    return parsedResponse.messages
  }

  /**
   * Acknowledges one or more messages as having been received
   */
  async acknowledgeMessage ({ messageIds }: AcknowledgeMessageParams): Promise<string> {
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      throw new Error('Message IDs array cannot be empty')
    }

    const acknowledged = await this.authFetch.fetch(`${this.peerServHost}/acknowledgeMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageIds })
    })

    const parsedAcknowledged = await acknowledged.json()

    if (parsedAcknowledged.status === 'error') {
      throw new Error(parsedAcknowledged.description)
    }

    return parsedAcknowledged.status
  }
}

export default MessageBoxClient
