/* eslint-env jest */
import MessageBoxClient from '../MessageBoxClient'
import { WalletClient } from '@bsv/sdk'
import { AuthSocketClient } from '@bsv/authsocket'

jest.mock('@bsv/sdk', () => ({
  AuthFetch: jest.fn().mockImplementation(() => ({
    fetch: jest.fn().mockResolvedValue({ json: async () => ({}) })
  })),
  WalletClient: jest.fn().mockImplementation(() => ({
    createHmac: jest.fn().mockResolvedValue({ hmac: new Uint8Array([1, 2, 3]) }),
    getPublicKey: jest.fn().mockResolvedValue({ publicKey: 'mockIdentityKey' })
  }))
}))

// ✅ Properly mock AuthSocketClient to return a fake WebSocket instance
const mockSocket = {
  on: jest.fn(),
  emit: jest.fn()
}

jest.mock('@bsv/authsocket', () => ({
  AuthSocketClient: jest.fn(() => mockSocket) // ✅ Returns our mock socket
}))

describe('MessageBoxClient', () => {
  let mockWalletClient: WalletClient

  beforeEach(() => {
    mockWalletClient = new WalletClient()
    jest.clearAllMocks() // ✅ Reset all mocks to prevent test interference
  })

  const VALID_SEND_RESULT = {
    body: JSON.stringify({
      status: 200,
      message: 'Your message has been sent!'
    })
  }

  const VALID_LIST_AND_READ_RESULT = {
    body: JSON.stringify({
      status: 200,
      messages: [
        { sender: 'mockSender', messageBoxId: 42, body: '{}' },
        { sender: 'mockSender', messageBoxId: 43, body: '{}' }
      ]
    })
  }

  const VALID_ACK_RESULT = {
    body: JSON.stringify({
      status: 200,
      message: 'Messages marked as acknowledged!'
    })
  }

  it('Creates an instance of the MessageBoxClient class', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    // Ensure the peerServHost property is set correctly
    expect(messageBoxClient).toHaveProperty('peerServHost', 'https://staging-peerserv.babbage.systems')

    // Ensure the socket is initialized as undefined before connecting
    expect(messageBoxClient.testSocket).toBeUndefined()
  })

  it('Initializes WebSocket connection', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })
    await messageBoxClient.initializeConnection()
    expect(AuthSocketClient).toHaveBeenCalledWith('https://staging-peerserv.babbage.systems', expect.objectContaining({ wallet: mockWalletClient }))
  })

  it('Throws an error when WebSocket connection is not initialized', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    // 🔹 Mock `initializeConnection` so it doesn't set up `this.socket`
    jest.spyOn(messageBoxClient, 'initializeConnection').mockImplementation(async () => {})

    await expect(messageBoxClient.sendLiveMessage({
      recipient: 'mockIdentityKey',
      messageBox: 'test_inbox',
      body: 'Test message'
    })).rejects.toThrow('WebSocket connection not initialized')
  })

  it('Listens for live messages', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })
    await messageBoxClient.initializeConnection()
    const mockOnMessage = jest.fn()
    await messageBoxClient.listenForLiveMessages({ messageBox: 'test_inbox', onMessage: mockOnMessage })
    expect(messageBoxClient.testSocket?.emit).toHaveBeenCalledWith('joinRoom', 'mockIdentityKey-test_inbox')
  })

  it('Sends a live message', async () => {
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

  it('Sends a message', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })
    jest.spyOn(messageBoxClient.authFetch, 'fetch').mockResolvedValue({
      json: async () => JSON.parse(VALID_SEND_RESULT.body),
      headers: new Headers(),
      ok: true,
      status: 200
    } as unknown as Response)

    const result = await messageBoxClient.sendMessage({
      recipient: 'mockIdentityKey',
      messageBox: 'test_inbox',
      body: { data: 'test' }
    })

    expect(result).toHaveProperty('message', 'Your message has been sent!')
  })

  it('Lists available messages', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })
    jest.spyOn(messageBoxClient.authFetch, 'fetch').mockResolvedValue({
      json: async () => JSON.parse(VALID_LIST_AND_READ_RESULT.body),
      headers: new Headers(),
      ok: true,
      status: 200
    } as unknown as Response)

    const result = await messageBoxClient.listMessages({ messageBox: 'test_inbox' })

    expect(result).toEqual(JSON.parse(VALID_LIST_AND_READ_RESULT.body).messages)
  })

  it('Acknowledges a message', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })
    jest.spyOn(messageBoxClient.authFetch, 'fetch').mockResolvedValue({
      json: async () => JSON.parse(VALID_ACK_RESULT.body),
      headers: new Headers(),
      ok: true,
      status: 200
    } as unknown as Response)

    const result = await messageBoxClient.acknowledgeMessage({ messageIds: ['42'] })

    expect(result).toEqual(200)
  })

  it('Throws an error when sendMessage() API fails', async () => {
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

  it('Throws an error when listMessages() API fails', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    jest.spyOn(messageBoxClient.authFetch, 'fetch')
      .mockResolvedValue({
        status: 500,
        json: async () => ({ status: 'error', description: 'Failed to fetch messages' })
      } as unknown as Response)

    await expect(messageBoxClient.listMessages({ messageBox: 'test_inbox' }))
      .rejects.toThrow('Failed to fetch messages')
  })

  it('Throws an error when acknowledgeMessage() API fails', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    jest.spyOn(messageBoxClient.authFetch, 'fetch')
      .mockResolvedValue({
        status: 500,
        json: async () => ({ status: 'error', description: 'Failed to acknowledge messages' })
      } as unknown as Response)

    await expect(messageBoxClient.acknowledgeMessage({ messageIds: ['42'] }))
      .rejects.toThrow('Failed to acknowledge messages')
  })

  it('Throws an error when identity key is missing', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    // Mock `getPublicKey` to return an empty key
    jest.spyOn(mockWalletClient, 'getPublicKey').mockResolvedValue({ publicKey: '' })

    await expect(messageBoxClient.initializeConnection()).rejects.toThrow('Identity key is missing')
  })

  it('Initializes WebSocket connection only once', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    // ✅ Ensure `getPublicKey` always returns a valid identity key
    jest.spyOn(mockWalletClient, 'getPublicKey').mockResolvedValue({ publicKey: 'mockIdentityKey' })

    // ✅ Directly mock `AuthSocketClient` correctly
    const authSocketMock = { on: jest.fn(), emit: jest.fn() }
    ;(AuthSocketClient as jest.Mock).mockReturnValue(authSocketMock)

    await messageBoxClient.initializeConnection()

    // ✅ Ensure WebSocket connection initializes once
    expect(AuthSocketClient).toHaveBeenCalledTimes(1)

    // 🔥 Call `initializeConnection` again (should NOT create another socket)
    await messageBoxClient.initializeConnection()

    // ✅ Ensure it's still only called once
    expect(AuthSocketClient).toHaveBeenCalledTimes(1)
  })

  it('Throws an error when WebSocket is not initialized before listening for messages', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    // Mock `initializeConnection` so it doesn't set up WebSocket
    jest.spyOn(messageBoxClient, 'initializeConnection').mockImplementation(async () => {})

    await expect(
      messageBoxClient.listenForLiveMessages({
        onMessage: jest.fn(),
        messageBox: 'test_inbox'
      })
    ).rejects.toThrow('WebSocket connection not initialized')
  })

  it('Emits joinRoom event and listens for incoming messages', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    // Mock identity key properly
    jest.spyOn(mockWalletClient, 'getPublicKey').mockResolvedValue({ publicKey: 'mockIdentityKey' })

    // Mock socket with `on` method capturing event handlers
    const mockSocket = {
      emit: jest.fn(),
      on: jest.fn()
    } as any

    // Mock `initializeConnection` so it assigns `socket` & identity key
    jest.spyOn(messageBoxClient, 'initializeConnection').mockImplementation(async () => {
      Object.defineProperty(messageBoxClient, 'testIdentityKey', { get: () => 'mockIdentityKey' })
      Object.defineProperty(messageBoxClient, 'testSocket', { get: () => mockSocket });
      (messageBoxClient as any).socket = mockSocket; // Ensures internal socket is set
      (messageBoxClient as any).myIdentityKey = 'mockIdentityKey' // Ensures identity key is set
    })

    const onMessageMock = jest.fn()

    await messageBoxClient.listenForLiveMessages({
      onMessage: onMessageMock,
      messageBox: 'test_inbox'
    })

    // ✅ Ensure `joinRoom` event was emitted with the correct identity key
    expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', 'mockIdentityKey-test_inbox')

    // Simulate receiving a message
    const receivedMessage = { text: 'Hello, world!' }

    // ✅ Extract & invoke the callback function stored in `on`
    const sendMessageCallback = mockSocket.on.mock.calls.find(
      ([eventName]) => eventName === 'sendMessage-mockIdentityKey-test_inbox'
    )?.[1] // Extract the callback function

    if (typeof sendMessageCallback === 'function') {
      sendMessageCallback(receivedMessage)
    }

    // ✅ Ensure `onMessage` was called with the received message
    expect(onMessageMock).toHaveBeenCalledWith(receivedMessage)
  })

  it('Handles WebSocket connection and disconnection events', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    // Mock `getPublicKey` to return a valid key
    jest.spyOn(mockWalletClient, 'getPublicKey').mockResolvedValue({ publicKey: 'mockIdentityKey' })

    // Mock socket
    const mockSocket = {
      on: jest.fn((event, callback) => {
        if (event === 'connect') callback()
        if (event === 'disconnect') callback()
      }),
      emit: jest.fn()
    }

    // Ensure AuthSocketClient returns our mock socket
    ;(AuthSocketClient as jest.Mock).mockReturnValue(mockSocket)

    // Spy on console logs
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

    await messageBoxClient.initializeConnection()

    // Ensure event listeners were set up
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function))

    // Ensure correct console logs were triggered
    expect(consoleLogSpy).toHaveBeenCalledWith('Connected to MessageBox server via WebSocket')
    expect(consoleLogSpy).toHaveBeenCalledWith('Disconnected from MessageBox server')

    // Restore console.log
    consoleLogSpy.mockRestore()
  })

  it('throws an error when recipient is empty in sendLiveMessage', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    // Mock `initializeConnection` so it assigns `socket` & identity key
    jest.spyOn(messageBoxClient, 'initializeConnection').mockImplementation(async () => {
      Object.defineProperty(messageBoxClient, 'testIdentityKey', { get: () => 'mockIdentityKey' })
      Object.defineProperty(messageBoxClient, 'testSocket', { get: () => mockSocket });
      (messageBoxClient as any).socket = mockSocket; // Ensures internal socket is set
      (messageBoxClient as any).myIdentityKey = 'mockIdentityKey' // Ensures identity key is set
    })

    // Mock socket to ensure WebSocket validation does not fail
    const mockSocket = {
      emit: jest.fn()
    } as any
    jest.spyOn(messageBoxClient, 'testSocket', 'get').mockReturnValue(mockSocket)

    await expect(messageBoxClient.sendLiveMessage({
      recipient: '  ', // Empty recipient (whitespace)
      messageBox: 'test_inbox',
      body: 'Test message'
    })).rejects.toThrow('Recipient cannot be empty')
  })

  it('throws an error when recipient is missing in sendMessage', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    await expect(messageBoxClient.sendMessage({
      recipient: '', // Empty recipient
      messageBox: 'test_inbox',
      body: 'Test message'
    })).rejects.toThrow('You must provide a message recipient!')

    await expect(messageBoxClient.sendMessage({
      recipient: '   ', // Whitespace recipient
      messageBox: 'test_inbox',
      body: 'Test message'
    })).rejects.toThrow('You must provide a message recipient!')

    await expect(messageBoxClient.sendMessage({
      recipient: null as any, // Null recipient
      messageBox: 'test_inbox',
      body: 'Test message'
    })).rejects.toThrow('You must provide a message recipient!')
  })

  it('throws an error when messageBox is missing in sendMessage', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    await expect(messageBoxClient.sendMessage({
      recipient: 'mockIdentityKey',
      messageBox: '', // Empty messageBox
      body: 'Test message'
    })).rejects.toThrow('You must provide a messageBox to send this message into!')

    await expect(messageBoxClient.sendMessage({
      recipient: 'mockIdentityKey',
      messageBox: '   ', // Whitespace messageBox
      body: 'Test message'
    })).rejects.toThrow('You must provide a messageBox to send this message into!')

    await expect(messageBoxClient.sendMessage({
      recipient: 'mockIdentityKey',
      messageBox: null as any, // Null messageBox
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

    await expect(messageBoxClient.sendMessage({
      recipient: 'mockIdentityKey',
      messageBox: 'test_inbox',
      body: '   ' // Whitespace body
    })).rejects.toThrow('Every message must have a body!')

    await expect(messageBoxClient.sendMessage({
      recipient: 'mockIdentityKey',
      messageBox: 'test_inbox',
      body: null as any // Null body
    })).rejects.toThrow('Every message must have a body!')
  })

  it('throws an error when messageBox is empty in listMessages', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    await expect(messageBoxClient.listMessages({
      messageBox: '' // Empty messageBox
    })).rejects.toThrow('MessageBox cannot be empty')

    await expect(messageBoxClient.listMessages({
      messageBox: '   ' // Whitespace messageBox
    })).rejects.toThrow('MessageBox cannot be empty')
  })

  it('throws an error when messageIds is empty in acknowledgeMessage', async () => {
    const messageBoxClient = new MessageBoxClient({ walletClient: mockWalletClient })

    await expect(messageBoxClient.acknowledgeMessage({
      messageIds: [] // Empty array
    })).rejects.toThrow('Message IDs array cannot be empty')

    await expect(messageBoxClient.acknowledgeMessage({
      messageIds: undefined as any // Undefined value
    })).rejects.toThrow('Message IDs array cannot be empty')

    await expect(messageBoxClient.acknowledgeMessage({
      messageIds: null as any // Null value
    })).rejects.toThrow('Message IDs array cannot be empty')

    await expect(messageBoxClient.acknowledgeMessage({
      messageIds: 'invalid' as any // Not an array
    })).rejects.toThrow('Message IDs array cannot be empty')
  })
})
