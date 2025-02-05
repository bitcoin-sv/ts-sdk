import Transaction from '../../../transaction/Transaction'
import { NodejsHttpClient } from '../../../transaction/http/NodejsHttpClient'
import WhatsOnChainBroadcaster from '../../../transaction/broadcasters/WhatsOnChainBroadcaster'
import { FetchHttpClient } from '../../../transaction/http/FetchHttpClient'

// Mock Transaction
jest.mock('../../../transaction/Transaction', () => {
  class MockTransaction {
    toHex (): string {
      return 'mocked_transaction_hex'
    }

    toHexEF (): string {
      return 'mocked_transaction_hexEF'
    }
  }
  return { __esModule: true, default: MockTransaction }
})

describe('WhatsOnChainBroadcaster', () => {
  const network = 'main'
  const successResponse = {
    status: 200,
    data: 'mocked_txid'
  }

  let transaction: Transaction

  beforeEach(() => {
    transaction = new Transaction()
  })

  it('should broadcast successfully using window.fetch', async () => {
    // Mocking window.fetch
    const mockFetch = mockedFetch(successResponse)
    global.window = { fetch: mockFetch } as unknown as Window & typeof globalThis

    const broadcaster = new WhatsOnChainBroadcaster(network)
    const response = await broadcaster.broadcast(transaction)

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual({
      status: 'success',
      txid: 'mocked_txid',
      message: 'broadcast successful'
    })
  })

  it('should broadcast successfully using Node.js https', async () => {
    // Mocking Node.js https module
    mockedHttps(successResponse)
    global.window = {} as unknown as Window & typeof globalThis

    const broadcaster = new WhatsOnChainBroadcaster(network)
    const response = await broadcaster.broadcast(transaction)

    expect(response).toEqual({
      status: 'success',
      txid: 'mocked_txid',
      message: 'broadcast successful'
    })
  })

  it('should broadcast successfully using provided fetch', async () => {
    const mockFetch = mockedFetch(successResponse)

    const broadcaster = new WhatsOnChainBroadcaster(
      network,
      new FetchHttpClient(mockFetch)
    )
    const response = await broadcaster.broadcast(transaction)

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual({
      status: 'success',
      txid: 'mocked_txid',
      message: 'broadcast successful'
    })
  })

  it('should broadcast successfully using provided https', async () => {
    const mockHttps = mockedHttps(successResponse)
    const broadcaster = new WhatsOnChainBroadcaster(
      network,
      new NodejsHttpClient(mockHttps)
    )

    const response = await broadcaster.broadcast(transaction)

    expect(response).toEqual({
      status: 'success',
      txid: 'mocked_txid',
      message: 'broadcast successful'
    })
  })

  it('should handle network errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'))
    global.window = { fetch: mockFetch } as unknown as Window & typeof globalThis

    const broadcaster = new WhatsOnChainBroadcaster(network)
    const response = await broadcaster.broadcast(transaction)

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual({
      status: 'error',
      code: '500',
      description: 'Network error'
    })
  })

  it('should handle non-200 responses', async () => {
    const mockFetch = mockedFetch({
      status: 400,
      data: 'Bad request'
    })
    global.window = { fetch: mockFetch } as unknown as Window & typeof globalThis

    const broadcaster = new WhatsOnChainBroadcaster(network)
    const response = await broadcaster.broadcast(transaction)

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual({
      status: 'error',
      code: '400',
      description: 'Bad request'
    })
  })

  function mockedFetch (response: { status: number, data: string }): jest.Mock<Promise<Response>> {
    return jest.fn().mockResolvedValue(
      new Response(response.data, {
        status: response.status,
        statusText: response.status === 200 ? 'OK' : 'Bad request',
        headers: new Headers({ 'Content-Type': 'text/plain' }) // Uses Headers API
      })
    )
  }

  function mockedHttps (response: { status: number, data: string }): {
    request: (
      url: string,
      options: unknown,
      callback: (res: {
        statusCode: number
        statusMessage: string
        headers: { 'content-type': string }
        on: (event: string, handler: (chunk?: any) => void) => void
      }) => void
    ) => {
      on: jest.Mock
      write: jest.Mock
      end: jest.Mock
    }
  } {
    const https = {
      request: (url, options, callback) => {
        // eslint-disable-next-line
        callback({
          statusCode: response.status,
          statusMessage: response.status === 200 ? 'OK' : 'Bad request',
          headers: {
            'content-type': 'text/plain'
          },
          on: (event, handler) => {
            if (event === 'data') handler(response.data)
            if (event === 'end') handler()
          }
        })
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn()
        }
      }
    }
    jest.mock('https', () => https)
    return https
  }
})
