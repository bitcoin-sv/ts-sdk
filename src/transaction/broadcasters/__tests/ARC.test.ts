import ARC from '../../../../dist/cjs/src/transaction/broadcasters/ARC.js'
import Transaction from '../../../../dist/cjs/src/transaction/Transaction.js'

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
  let broadcaster: ARC
  let transaction: Transaction

  beforeEach(() => {
    broadcaster = new ARC(URL, apiKey)
    transaction = new Transaction()
  })

  it('should broadcast successfully using window.fetch', async () => {
    // Mocking window.fetch
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => await Promise.resolve({
        txid: 'mocked_txid',
        txStatus: 'success',
        extraInfo: 'received'
      })
    })
    global.window = { fetch: mockFetch } as any

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
    jest.mock('https', () => ({
      request: (url, options, callback) => {
        // eslint-disable-next-line
        callback({
          statusCode: 200,
          on: (event, handler) => {
            if (event === 'data') handler(JSON.stringify({
              txid: 'mocked_txid',
              txStatus: 'success',
              extraInfo: 'received'
            }))
            if (event === 'end') handler()
          }
        })
        return {
          on: jest.fn(),
          write: jest.fn(),
          end: jest.fn()
        }
      }
    }))

    delete global.window
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

    const response = await broadcaster.broadcast(transaction)

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual({
      status: 'error',
      code: '500',
      description: 'Network error'
    })
  })

  it('should handle non-200 responses', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => await Promise.resolve({
        status: '400',
        detail: 'Bad request'
      })
    })
    global.window = { fetch: mockFetch } as any

    const response = await broadcaster.broadcast(transaction)

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual({
      status: 'error',
      code: '400',
      description: 'Bad request'
    })
  })
})
