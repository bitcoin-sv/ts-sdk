/* eslint-env jest */
import MessageBoxClient from '../../MessageBoxClient.js'
import { WalletClient } from '@bsv/sdk'
import { webcrypto } from 'crypto'

// Set up global crypto for Node.js
(global as any).self = { crypto: webcrypto }

const HTTP_URL = 'https://messagebox.babbage.systems'
const messageBox = 'testBox'
const testMessage = 'Hello, this is an integration test.'
const testMessage2 = 'Another test message to avoid duplicates.'

let recipientKey: string
let testMessageId: string

const walletClient = new WalletClient('json-api', 'localhost')
const messageBoxClient = new MessageBoxClient({
  peerServHost: HTTP_URL,
  walletClient
})

describe('MessageBoxClient HTTP Integration Tests (No WebSocket)', () => {
  beforeAll(async () => {
    try {
      console.log('[DEBUG] Retrieving public key...')

      const publicKeyResponse = await walletClient.getPublicKey({ identityKey: true })
      if (!publicKeyResponse?.publicKey?.trim()) {
        throw new Error('[ERROR] getPublicKey returned an invalid key!')
      }

      recipientKey = publicKeyResponse.publicKey.trim()
      console.log('[DEBUG] Successfully assigned recipientKey:', recipientKey)
    } catch (error) {
      console.error('[ERROR] Failed to retrieve public key:', error)
      throw error
    }
  })

  afterAll(async () => {
    try {
      if (testMessageId) {
        console.log('[DEBUG] Cleaning up test messages...')
        const ackResponse = await messageBoxClient.acknowledgeMessage({ messageIds: [testMessageId] })
        console.log('[DEBUG] Acknowledge Response:', ackResponse)
        expect(ackResponse).toBe('success')
      }
    } catch (error) {
      console.error('[ERROR] Failed to acknowledge test message:', error)
    }
  })

  /** TEST 1: Send a Message with Correct Payment **/
  test('should send a message successfully with correct payment', async () => {
    const requiredPayment = messageBoxClient.calculateMessagePrice(testMessage)

    const response = await messageBoxClient.sendMessage({
      recipient: recipientKey,
      messageBox,
      body: testMessage,
      payment: { satoshisPaid: requiredPayment }
    })

    console.log('[DEBUG] SendMessage Response:', response)

    expect(response).toHaveProperty('status', 'success')
    expect(response).toHaveProperty('messageId', expect.any(String))

    testMessageId = response.messageId
  }, 30000)

  /** TEST 2: Send Message without Payment (Expect 402) **/
  test('should fail to send a message without payment', async () => {
    await expect(messageBoxClient.sendMessage({
      recipient: recipientKey,
      messageBox,
      body: testMessage
    })).rejects.toThrow(/insufficient funds|payment required/i)
  }, 30000)

  /** TEST 3: List Messages **/
  test('should list messages from messageBox', async () => {
    const messages = await messageBoxClient.listMessages({ messageBox })

    expect(messages.length).toBeGreaterThan(0)
    expect(messages.some(msg => msg.body === JSON.stringify(testMessage))).toBe(true)
  }, 15000)

  /** TEST 4: List Messages from an Empty MessageBox **/
  test('should return an empty list if no messages exist', async () => {
    const messages = await messageBoxClient.listMessages({ messageBox: 'emptyBox' })
    expect(messages).toEqual([])
  }, 15000)

  /** TEST 5: Acknowledge a Message **/
  test('should acknowledge (delete) a message', async () => {
    const ackResponse = await messageBoxClient.acknowledgeMessage({ messageIds: [testMessageId] })
    expect(ackResponse).toBe('success')
  }, 15000)

  /** TEST 6: Acknowledge a Nonexistent Message **/
  test('should fail to acknowledge a nonexistent message', async () => {
    await expect(messageBoxClient.acknowledgeMessage({ messageIds: ['fakeMessageId'] }))
      .rejects.toThrow(/message not found/i)
  }, 15000)

  /** TEST 7: Send Message with Invalid Recipient **/
  test('should fail if recipient is invalid', async () => {
    await expect(messageBoxClient.sendMessage({
      recipient: '',
      messageBox,
      body: testMessage
    })).rejects.toThrow(/you must provide a message recipient/i)
  }, 15000)

  /** TEST 8: Send Message with Empty Body **/
  test('should fail if message body is empty', async () => {
    await expect(messageBoxClient.sendMessage({
      recipient: recipientKey,
      messageBox,
      body: ''
    })).rejects.toThrow(/every message must have a body/i)
  }, 15000)

  /** TEST 9: Send Message with Excessive Payment (Should still succeed) **/
  test('should send a message even if payment is more than required', async () => {
    const overpaidAmount = messageBoxClient.calculateMessagePrice(testMessage2) + 1000

    const response = await messageBoxClient.sendMessage({
      recipient: recipientKey,
      messageBox,
      body: testMessage2,
      payment: { satoshisPaid: overpaidAmount }
    })

    console.log('[DEBUG] Overpayment SendMessage Response:', response)

    expect(response.status).toBe('success')
  }, 15000)
})
