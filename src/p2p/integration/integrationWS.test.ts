import MessageBoxClient, { PeerServMessage } from '../MessageBoxClient.js'
import { WalletClient } from '@bsv/sdk'
import { webcrypto } from 'crypto'

(global as any).self = { crypto: webcrypto }

const WS_URL = 'ws://localhost:8080'

let recipientKey: string
const messageBox = 'testBox'
const testMessage = 'Hello, this is a WebSocket integration test.'

const walletClient = new WalletClient('json-api', 'localhost')
const messageBoxClient = new MessageBoxClient({
  peerServHost: WS_URL,
  walletClient
})

describe('MessageBoxClient WebSocket Integration Tests', () => {
  beforeAll(async () => {
    // console.log('Initializing WebSocket connection for tests...')
    // await messageBoxClient.initializeConnection()
    // console.log('WebSocket connection initialized.')

    const keyResult = await walletClient.getPublicKey({ identityKey: true })
    recipientKey = keyResult.publicKey
    console.log(`Recipient Key: ${recipientKey}`)
  })

  afterAll(async () => {
    console.log('Closing WebSocket connection after tests.')
    await messageBoxClient.disconnectWebSocket() // Use the new method
  })

  /** TEST 1: Authenticate WebSocket Connection **/
  test('should authenticate and connect via WebSocket', async () => {
    await messageBoxClient.initializeConnection()
    expect(messageBoxClient).toBeDefined()
    console.log('[TEST] WebSocket authenticated and connected')
  }, 15000)

  /** TEST 2: Join a WebSocket Room **/
  test('should join a WebSocket room successfully', async () => {
    await messageBoxClient.joinRoom(messageBox)
    console.log(`Joined WebSocket room: ${messageBox}`)

    // Verify that the room was actually joined
    expect(messageBoxClient.getJoinedRooms().has(`${messageBoxClient.getIdentityKey()}-${messageBox}`)).toBe(true)
  })

  /** TEST 3: Send and Receive a Message via WebSocket **/
  test('should send and receive a message via WebSocket', async () => {
    let receivedMessage: PeerServMessage | null = null

    // Create a promise that resolves when the message is received
    const messagePromise = new Promise<PeerServMessage>((resolve, reject) => {
      messageBoxClient.listenForLiveMessages({
        messageBox,
        onMessage: async (message) => {
          try {
            receivedMessage = message
            console.log('[TEST] Received message:', JSON.stringify(message, null, 2))
            // Optionally, add any additional async processing here before resolving.
            resolve(message)
          } catch (error) {
            console.error('Error processing message:', error)
            reject(error)
          }
        }
      })

      // Timeout in case no message is received
      setTimeout(() => {
        reject(new Error('Test timed out: No message received over WebSocket'))
      }, 10000)
    })

    // Ensure WebSocket room is joined before sending
    await messageBoxClient.joinRoom(messageBox)

    // ✅ Send message after listener is set up
    console.log(`[TEST] Sending message to WebSocket room: ${messageBox}`)
    const response = await messageBoxClient.sendLiveMessage({
      recipient: recipientKey,
      messageBox,
      body: testMessage
    })

    // Ensure message sending was successful
    expect(response.status).toBe('success')

    // Wait for the message to be received (promise resolves here)
    const received = await messagePromise

    // Verify message content
    expect(received).not.toBeNull()
    expect(received.body).toBe(testMessage)
    expect(received.sender).toBe(recipientKey)
  }, 1500000)


  /** TEST 4: Leave a WebSocket Room **/
  test('should leave a WebSocket room successfully', async () => {
    await messageBoxClient.leaveRoom(messageBox)
    console.log(`[TEST] Left WebSocket room: ${messageBox}`)

    // Ensure the room is removed from joinedRooms
    expect(messageBoxClient.getJoinedRooms().has(`${messageBoxClient.getIdentityKey()}-${messageBox}`)).toBe(false)
  })
})
