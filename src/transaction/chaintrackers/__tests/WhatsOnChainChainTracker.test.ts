import { NodejsHttpClient } from '../../../../dist/cjs/src/transaction/http/NodejsHttpClient.js'
import WhatsOnChain from '../../../../dist/cjs/src/transaction/chaintrackers/WhatsOnChain.js'
import { FetchHttpClient } from '../../../../dist/cjs/src/transaction/http/FetchHttpClient.js'

describe('WhatsOnChain ChainTracker', () => {
  const network = 'main'
  const height = 123456
  const merkleroot = 'mocked_merkleroot'

  const successResponse = {
    status: 200,
    data: {
      merkleroot
    }
  }

  it('should verify merkleroot successfully using window.fetch', async () => {
    // Mocking window.fetch
    const mockFetch = mockedFetch(successResponse)
    global.window = { fetch: mockFetch } as any

    const chainTracker = new WhatsOnChain(network)
    const response = await chainTracker.isValidRootForHeight(merkleroot, height)

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual(true)
  })

  it('should verify merkleroot successfully using Node.js https', async () => {
    // Mocking Node.js https module
    mockedHttps(successResponse)
    delete global.window

    const chainTracker = new WhatsOnChain(network)
    const response = await chainTracker.isValidRootForHeight(merkleroot, height)

    expect(response).toEqual(true)
  })

  it('should verify merkleroot successfully using provided window.fetch', async () => {
    const mockFetch = mockedFetch(successResponse)

    const chainTracker = new WhatsOnChain(network, { httpClient: new FetchHttpClient(mockFetch) })
    const response = await chainTracker.isValidRootForHeight(merkleroot, height)

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual(true)
  })

  it('should verify merkleroot successfully using provided Node.js https', async () => {
    const mockHttps = mockedHttps(successResponse)

    const chainTracker = new WhatsOnChain(network, { httpClient: new NodejsHttpClient(mockHttps) })
    const response = await chainTracker.isValidRootForHeight(merkleroot, height)

    expect(response).toEqual(true)
  })

  it('should respond with invalid root for height when block for height is not found', async () => {
    const mockFetch = mockedFetch({
      status: 404,
      data: 'not found'
    })

    const chainTracker = new WhatsOnChain(network, { httpClient: new FetchHttpClient(mockFetch) })
    const response = await chainTracker.isValidRootForHeight(merkleroot, height)

    expect(response).toEqual(false)
  })

  it('should handle network errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'))

    const chainTracker = new WhatsOnChain(network, { httpClient: new FetchHttpClient(mockFetch) })

    await expect(chainTracker.isValidRootForHeight(merkleroot, height)).rejects.toThrow('Network error')
  })

  it('should throw error when received error response', async () => {
    const mockFetch = mockedFetch({
      status: 401,
      data: { error: 'Unauthorized' }
    })

    const chainTracker = new WhatsOnChain(network, { httpClient: new FetchHttpClient(mockFetch) })

    await expect(chainTracker.isValidRootForHeight(merkleroot, height)).rejects.toThrow(/Failed to verify merkleroot for height \d+ because of an error: .*/)
  })

  function mockedFetch (response) {
    return jest.fn().mockResolvedValue({
      ok: response.status === 200,
      status: response.status,
      statusText: response.status === 200 ? 'OK' : 'Bad request',
      headers: {
        get (key: string) {
          if (key === 'Content-Type') {
            return 'application/json'
          }
        }
      },
      json: async () => response.data
    })
  }

  function mockedHttps (response) {
    const https = {
      request: (url, options, callback) => {
        // eslint-disable-next-line
        callback({
          statusCode: response.status,
          statusMessage: response.status == 200 ? 'OK' : 'Bad request',
          headers: {
            'content-type': 'application/json'
          },
          on: (event, handler) => {
            if (event === 'data') handler(JSON.stringify(response.data))
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
