import { NodejsHttpClient } from '../../../transaction/http/NodejsHttpClient'
import WhatsOnChain from '../../../transaction/chaintrackers/WhatsOnChain'
import { FetchHttpClient } from '../../../transaction/http/FetchHttpClient'

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
    global.window = { fetch: mockFetch } as unknown as Window & typeof globalThis

    const chainTracker = new WhatsOnChain(network)
    const response = await chainTracker.isValidRootForHeight(
      merkleroot,
      height
    )

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual(true)
  })

  it('should verify merkleroot successfully using Node.js https', async () => {
    // Mocking Node.js https module
    mockedHttps({
      ...successResponse,
      data: JSON.stringify(successResponse.data) // Ensure data is a string
    })
    global.window = {} as unknown as Window & typeof globalThis

    const chainTracker = new WhatsOnChain(network)
    const response = await chainTracker.isValidRootForHeight(
      merkleroot,
      height
    )

    expect(response).toEqual(true)
  })

  it('should verify merkleroot successfully using provided window.fetch', async () => {
    const mockFetch = mockedFetch(successResponse)

    const chainTracker = new WhatsOnChain(network, {
      httpClient: new FetchHttpClient(mockFetch)
    })
    const response = await chainTracker.isValidRootForHeight(
      merkleroot,
      height
    )

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual(true)
  })

  it('should verify merkleroot successfully using provided Node.js https', async () => {
    const mockHttps = mockedHttps({
      ...successResponse,
      data: JSON.stringify(successResponse.data) // Convert data to a string
    })

    const chainTracker = new WhatsOnChain(network, {
      httpClient: new NodejsHttpClient(mockHttps)
    })
    const response = await chainTracker.isValidRootForHeight(
      merkleroot,
      height
    )

    expect(response).toEqual(true)
  })

  it('should respond with invalid root for height when block for height is not found', async () => {
    const mockFetch = mockedFetch({
      status: 404,
      data: 'not found'
    })

    const chainTracker = new WhatsOnChain(network, {
      httpClient: new FetchHttpClient(mockFetch)
    })
    const response = await chainTracker.isValidRootForHeight(
      merkleroot,
      height
    )

    expect(response).toEqual(false)
  })

  it('should handle network errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'))

    const chainTracker = new WhatsOnChain(network, {
      httpClient: new FetchHttpClient(mockFetch)
    })

    await expect(
      chainTracker.isValidRootForHeight(merkleroot, height)
    ).rejects.toThrow('Network error')
  })

  it('should throw error when received error response', async () => {
    const mockFetch = mockedFetch({
      status: 401,
      data: { error: 'Unauthorized' }
    })

    const chainTracker = new WhatsOnChain(network, {
      httpClient: new FetchHttpClient(mockFetch)
    })

    await expect(
      chainTracker.isValidRootForHeight(merkleroot, height)
    ).rejects.toThrow(
      /Failed to verify merkleroot for height \d+ because of an error: .*/
    )
  })

  it('should return the current height', async () => {
    const mockFetch = mockedFetch({
      status: 200,
      data: [
        {
          hash: '00000000000000000af9958a79fd4dbac1b04a553cc00c80e108718561ccb5a5',
          confirmations: 1,
          size: 29605652,
          height: 875904,
          version: 704643072,
          versionHex: '2a000000',
          merkleroot:
            '8af5a2d4325ec30e30103b1f365c303d4b49d11e42d26b0d7e9b6866724392e9',
          time: 1734667612,
          mediantime: 1734663717,
          nonce: 157007350,
          bits: '180f2b74',
          difficulty: 72479484799.59058,
          chainwork:
            '00000000000000000000000000000000000000000160c2f41c8793b90f4500dd',
          previousblockhash:
            '00000000000000000128f312a7c62ef5f9a91a3f845a4464d10cfbaaecd233a0',
          nextblockhash: '',
          nTx: 0,
          num_tx: 167567
        }
      ]
    })

    const chainTracker = new WhatsOnChain(network, {
      httpClient: new FetchHttpClient(mockFetch)
    })

    await expect(await chainTracker.currentHeight()).toBe(875904)
  })

  function mockedFetch (response: { status: number, data: any }): jest.Mock<Promise<Response>> {
    return jest.fn().mockResolvedValue(
      new Response(JSON.stringify(response.data), {
        status: response.status,
        statusText: response.status === 200 ? 'OK' : 'Bad request',
        headers: new Headers({ 'Content-Type': 'application/json' }) // Uses Headers API
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
            'content-type': 'application/json'
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
