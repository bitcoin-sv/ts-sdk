import ARC from '../../../../dist/cjs/src/transaction/broadcasters/ARC.js'
import Transaction from '../../../../dist/cjs/src/transaction/Transaction.js'
import {NodejsHttpClient} from "../../../../dist/cjs/src/transaction/http/NodejsHttpClient.js";
import {FetchHttpClient} from "../../../../dist/cjs/src/transaction/http/FetchHttpClient.js";
import {HttpClientRequestOptions} from "../../http";

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
  const successResponse = {
    status: 200,
    data: {
      txid: 'mocked_txid',
      txStatus: 'success',
      extraInfo: 'received'
    }
  }

  let transaction: Transaction

  beforeEach(() => {
    transaction = new Transaction()
  })

  it('should broadcast successfully using window.fetch', async () => {
    // Mocking window.fetch
    const mockFetch = mockedFetch(successResponse)
    global.window = {fetch: mockFetch} as any

    const broadcaster = new ARC(URL)
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

    const broadcaster = new ARC(URL)
    const response = await broadcaster.broadcast(transaction)

    expect(response).toEqual({
      status: 'success',
      txid: 'mocked_txid',
      message: 'success received'
    })
  })

  it('should broadcast successfully using provided fetch', async () => {

    const mockFetch = mockedFetch(successResponse)

    const broadcaster = new ARC(URL, {httpClient: new FetchHttpClient(mockFetch)})
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
    const broadcaster = new ARC(URL, {httpClient: new NodejsHttpClient(mockHttps)})

    const response = await broadcaster.broadcast(transaction)

    expect(response).toEqual({
      status: 'success',
      txid: 'mocked_txid',
      message: 'success received'
    })
  })

  it('should send default request headers when broadcasting', async () => {
    const mockFetch = mockedFetch(successResponse)

    const broadcaster = new ARC(URL, {httpClient: new FetchHttpClient(mockFetch)})
    await broadcaster.broadcast(transaction)

    const {headers} = (mockFetch as jest.Mock).mock.calls[0][1] as HttpClientRequestOptions

    expect(headers['Content-Type']).toEqual('application/json')
    expect(headers['XDeployment-ID']).toBeDefined()
    expect(headers['XDeployment-ID']).toMatch(/ts-sdk-.*/)
    expect(headers['Authorization']).toBeUndefined()
  })

  it('should send authorization header when api key is provided', async () => {
    const mockFetch = mockedFetch(successResponse)
    const apiKey = 'mainnet_1234567890'

    const broadcaster = new ARC(URL, {apiKey, httpClient: new FetchHttpClient(mockFetch)})
    await broadcaster.broadcast(transaction)

    const {headers} = (mockFetch as jest.Mock).mock.calls[0][1] as HttpClientRequestOptions

    expect(headers['XDeployment-ID']).toBeDefined()
    expect(headers['XDeployment-ID']).toMatch(/ts-sdk-.*/)
    expect(headers['Authorization']).toEqual(`Bearer ${apiKey}`)
  })

  it('should handle api key as second argument', async () => {
    const mockFetch = mockedFetch(successResponse)
    global.window = {fetch: mockFetch} as any

    const apiKey = 'mainnet_1234567890'

    const broadcaster = new ARC(URL, apiKey)
    await broadcaster.broadcast(transaction)

    const {headers} = (mockFetch as jest.Mock).mock.calls[0][1] as HttpClientRequestOptions

    expect(headers['Authorization']).toEqual(`Bearer ${apiKey}`)
  })


  it('should send provided deployment id', async () => {
    const mockFetch = mockedFetch(successResponse)
    const deploymentId = 'custom_deployment_id'

    const broadcaster = new ARC(URL, {deploymentId, httpClient: new FetchHttpClient(mockFetch)})
    await broadcaster.broadcast(transaction)

    const {headers} = (mockFetch as jest.Mock).mock.calls[0][1] as HttpClientRequestOptions

    expect(headers['XDeployment-ID']).toEqual(deploymentId)
  })

  it('should handle network errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'))
    global.window = {fetch: mockFetch} as any

    const broadcaster = new ARC(URL, {httpClient: new FetchHttpClient(mockFetch)})
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
      data: JSON.stringify({
        detail: 'Bad request'
      })
    })

    const broadcaster = new ARC(URL, {httpClient: new FetchHttpClient(mockFetch)})
    const response = await broadcaster.broadcast(transaction)

    expect(mockFetch).toHaveBeenCalled()
    expect(response).toEqual({
      status: 'error',
      code: '400',
      description: 'Bad request',
      more: {
        detail: 'Bad request'
      }
    })
  })

  it('handles error 460', async () => {
    // Model the actual response format received from...
    const apiKey: string = '...'
    if (apiKey !== '...') {
      const URL = 'https://arc.taal.com'
      const arc = new ARC(URL, apiKey)
      const response = await arc.broadcast(transaction)
      expect(response.more).toBeTruthy()
    }

    const mockFetch = mockedFetch({
      status: 460,
      data: {
        status: 460,
        detail: 'Transaction is not in extended format, missing input scripts',
        txid: 'd21633ba23f70118185227be58a63527675641ad37967e2aa461559f577aec43'
      }
    })

    const broadcaster = new ARC(URL, {httpClient: new FetchHttpClient(mockFetch)})
    const response = await broadcaster.broadcast(transaction)
    expect(response.status).toBe('error')
    expect(response.code).toBe('460')
    expect(response.description).toBe('Transaction is not in extended format, missing input scripts')
    expect(response.txid).toBe('d21633ba23f70118185227be58a63527675641ad37967e2aa461559f577aec43')
  })

  function mockedFetch(response) {
    return jest.fn().mockResolvedValue({
      ok: response.status === 200,
      status: response.status,
      statusText: response.status === 200 ? 'OK' : 'Bad request',
      headers: {
        get(key: string) {
          if (key === 'Content-Type') {
            return 'application/json; charset=UTF-8'
          }
        }
      },
      json: async () => response.data
    });
  }

  function mockedHttps(response) {
    const https = {
      request: (url, options, callback) => {
        // eslint-disable-next-line
        callback({
          statusCode: response.status,
          statusMessage: response.status == 200 ? 'OK' : 'Bad request',
          headers: {
            'content-type': 'application/json; charset=UTF-8'
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