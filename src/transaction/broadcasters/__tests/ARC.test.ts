import ARC from '../../../../dist/cjs/src/transaction/broadcasters/ARC.js'
import Transaction from '../../../../dist/cjs/src/transaction/Transaction.js'
import {NodejsHttpClient} from "../../http/NodejsHttpClient";

// Mock Transaction
jest.mock('../../Transaction', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        toHex: () => 'mocked_transaction_hex'
      }
    })
  }
})

describe('ARC Broadcaster', () => {
  const URL = 'https://example.com'
  const apiKey = 'test_api_key'
  const successResponse = {
    txid: 'mocked_txid',
    txStatus: 'success',
    extraInfo: 'received'
  }

  let transaction: Transaction

  beforeEach(() => {
    transaction = new Transaction()
  })

  it('should broadcast successfully using window.fetch', async () => {
    // Mocking window.fetch
    const mockFetch = mockedFetch(successResponse)
    global.window = { fetch: mockFetch } as any

    const broadcaster = new ARC(URL, apiKey)
    const response = await broadcaster.broadcast(transaction)

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual({
      status: 'success',
      txid: 'mocked_txid',
      message: 'success received'
    })
  })

  it('should broadcast successfully using Node.js https', async () => {
    // Mocking Node.js https module
    mockedHttps(successResponse)
    delete global.window

    const broadcaster = new ARC(URL, apiKey)
    const response = await broadcaster.broadcast(transaction)

    expect(response).toEqual({
      status: 'success',
      txid: 'mocked_txid',
      message: 'success received'
    })
  })

  it('should broadcast successfully using provided fetch', async () => {

    const mockFetch = mockedFetch(successResponse)

    const broadcaster = new ARC(URL, apiKey, { fetch: mockFetch })
    const response = await broadcaster.broadcast(transaction)

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual({
      status: 'success',
      txid: 'mocked_txid',
      message: 'success received'
    })
  })

  it('should broadcast successfully using provided https', async () => {

    const mockHttps = mockedHttps(successResponse)
    const broadcaster = new ARC(URL, apiKey, new NodejsHttpClient(mockHttps))

    const response = await broadcaster.broadcast(transaction)

    expect(response).toEqual({
      status: 'success',
      txid: 'mocked_txid',
      message: 'success received'
    })
  })

  it('should handle network errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'))
    global.window = { fetch: mockFetch } as any

    const broadcaster = new ARC(URL, apiKey)
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
      status: '400',
      detail: 'Bad request'
    })
    global.window = { fetch: mockFetch } as any

    const broadcaster = new ARC(URL, apiKey)
    const response = await broadcaster.broadcast(transaction)

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual({
      status: 'error',
      code: '400',
      description: 'Bad request'
    })
  })

  function mockedFetch(response) {
    return jest.fn().mockResolvedValue({
      ok: response.status === '200',
      json: async () => response
    });
  }

  function mockedHttps(response) {
    const https = {
      request: (url, options, callback) => {
        // eslint-disable-next-line
        callback({
          statusCode: 200,
          on: (event, handler) => {
            if (event === 'data') handler(JSON.stringify(response))
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

