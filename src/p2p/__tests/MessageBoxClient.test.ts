/* eslint-env jest */
import MessageBoxClient from '../MessageBoxClient'
import { WalletClient, AuthFetch } from '@bsv/sdk'
import { AuthSocketClient } from '@bsv/authsocket'

// Mock WalletClient methods
jest.spyOn(WalletClient.prototype, 'createHmac').mockResolvedValue({ hmac: [1, 2, 3] })
jest.spyOn(WalletClient.prototype, 'getPublicKey').mockResolvedValue({ publicKey: 'mockIdentityKey' })

// Mock AuthFetch fetch method
jest.spyOn(AuthFetch.prototype, 'fetch').mockResolvedValue({ json: async () => ({}) } as Response)

// Properly mock AuthSocketClient to return a fake WebSocket instance
const mockSocket = {
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn()
}

jest.mock('@bsv/authsocket', () => ({
  AuthSocketClient: jest.fn(() => mockSocket)
}))

describe('MessageBoxClient', () => {
  let mockWalletClient: WalletClient

  beforeEach(() => {
    mockWalletClient = new WalletClient()
    jest.clearAllMocks() // Reset all mocks to prevent test interference
  })

  it('creates an instance of the MessageBoxClient class', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    // Ensure the peerServHost property is set correctly
    expect(messageBoxClient).toHaveProperty('peerServHost', 'https://staging-peerserv.babbage.systems')

    // Ensure the socket is initialized as undefined before connecting
    expect(messageBoxClient.testSocket).toBeUndefined()
  })

  it('initializes WebSocket connection', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })
    await messageBoxClient.initializeConnection()
    expect(AuthSocketClient).toHaveBeenCalledWith('https://staging-peerserv.babbage.systems', expect.objectContaining({ wallet: mockWalletClient }))
  })

  it('throws an error when WebSocket connection is not initialized', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    // Mock `initializeConnection` so it doesn't set up `this.socket`
    jest.spyOn(messageBoxClient, 'initializeConnection').mockImplementation(async () => {})

    await expect(messageBoxClient.sendLiveMessage({
      recipient: 'mockIdentityKey',
      messageBox: 'test_inbox',
      body: 'Test message'
    })).rejects.toThrow('WebSocket connection not initialized')
  })

  it('sends a message via WebSocket', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })
    await messageBoxClient.initializeConnection()

    // Spy on the emit function of the testSocket
    const emitSpy = jest.spyOn(messageBoxClient.testSocket as any, 'emit')

    await messageBoxClient.sendLiveMessage({
      recipient: 'mockIdentityKey',
      messageBox: 'test_inbox',
      body: 'Test message'
    })

    expect(emitSpy).toHaveBeenCalledWith('sendMessage', expect.objectContaining({
      roomId: 'mockIdentityKey-test_inbox',
      message: expect.objectContaining({ body: 'Test message' })
    }))
  })

  it('throws an error when sendMessage() API fails', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    jest.spyOn(messageBoxClient.authFetch, 'fetch')
      .mockResolvedValue({
        status: 500,
        json: async () => ({ status: 'error', description: 'Internal Server Error' })
      } as unknown as Response)

    await expect(messageBoxClient.sendMessage({
      recipient: 'mockIdentityKey',
      messageBox: 'test_inbox',
      body: 'Test Message'
    })).rejects.toThrow('Internal Server Error')
  })

  it('throws an error when listMessages() API fails', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    jest.spyOn(messageBoxClient.authFetch, 'fetch')
      .mockResolvedValue({
        status: 500,
        json: async () => ({ status: 'error', description: 'Failed to fetch messages' })
      } as unknown as Response)

    await expect(messageBoxClient.listMessages({ messageBox: 'test_inbox' }))
      .rejects.toThrow('Failed to fetch messages')
  })

  it('throws an error when acknowledgeMessage() API fails', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    jest.spyOn(messageBoxClient.authFetch, 'fetch')
      .mockResolvedValue({
        status: 500,
        json: async () => ({ status: 'error', description: 'Failed to acknowledge messages' })
      } as unknown as Response)

    await expect(messageBoxClient.acknowledgeMessage({ messageIds: ['42'] }))
      .rejects.toThrow('Failed to acknowledge messages')
  })

  it('throws an error when identity key is missing', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    // Mock `getPublicKey` to return an empty key
    jest.spyOn(mockWalletClient, 'getPublicKey').mockResolvedValue({ publicKey: '' })

    await expect(messageBoxClient.initializeConnection()).rejects.toThrow('Identity key is missing')
  })

  it('throws an error when recipient is empty in sendLiveMessage', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    await expect(messageBoxClient.sendLiveMessage({
      recipient: '  ', // Empty recipient (whitespace)
      messageBox: 'test_inbox',
      body: 'Test message'
    })).rejects.toThrow('Recipient cannot be empty')
  })

  it('throws an error when messageBox is missing in sendMessage', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    await expect(messageBoxClient.sendMessage({
      recipient: 'mockIdentityKey',
      messageBox: '', // Empty messageBox
      body: 'Test message'
    })).rejects.toThrow('You must provide a messageBox to send this message into!')
  })

  it('throws an error when message body is missing in sendMessage', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    await expect(messageBoxClient.sendMessage({
      recipient: 'mockIdentityKey',
      messageBox: 'test_inbox',
      body: '' // Empty body
    })).rejects.toThrow('Every message must have a body!')
  })

  it('throws an error when messageBox is empty in listMessages', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    await expect(messageBoxClient.listMessages({
      messageBox: '' // Empty messageBox
    })).rejects.toThrow('MessageBox cannot be empty')
  })
})
