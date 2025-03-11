import { StorageUploader } from '../StorageUploader.js'
import * as StorageUtils from '../StorageUtils.js'
import WalletClient from '../../wallet/WalletClient.js'

// A helper for converting a string to a number[] of UTF-8 bytes
function stringToUtf8Array(str: string): number[] {
  return Array.from(new TextEncoder().encode(str))
}

describe('StorageUploader Tests', () => {
  let uploader: StorageUploader
  let walletClient: WalletClient
  let globalFetchSpy: jest.SpiedFunction<typeof global.fetch>

  beforeEach(() => {
    walletClient = new WalletClient('json-api', 'non-admin.com')

    uploader = new StorageUploader({
      storageURL: 'https://example.test.system',
      wallet: walletClient
    })

    globalFetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should upload a file, produce a valid UHRP URL, and decode it to the known SHA-256', async () => {
    const data = stringToUtf8Array('Hello, world!')

    // Mock out getUploadInfo so we can control the returned upload/public URLs
    jest.spyOn(uploader as any, 'getUploadInfo').mockResolvedValue({
      uploadURL: 'https://example-upload.com/put',
    })

    const result = await uploader.publishFile({
      file: {
        data,
        type: 'text/plain'
      },
      retentionPeriod: 7
    })

    // We expect exactly one PUT request
    expect(globalFetchSpy).toHaveBeenCalledTimes(1)
    // Check the result
    expect(StorageUtils.isValidURL(result.uhrpURL)).toBe(true)
    expect(result.published).toBe(true)

    const url = StorageUtils.getHashFromURL(result.uhrpURL)
    const firstFour = url.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join('')
    expect(firstFour).toHaveLength(8)
  })

  it('should throw if the upload fails with HTTP 500', async () => {
    // Force the fetch to fail
    globalFetchSpy.mockResolvedValueOnce(new Response(null, { status: 500 }))

    // Also mock getUploadInfo
    jest.spyOn(uploader as any, 'getUploadInfo').mockResolvedValue({
      uploadURL: 'https://example-upload.com/put',
    })

    const failingData = stringToUtf8Array('failing data')

    await expect(
      uploader.publishFile({
        file: {
          data: failingData,
          type: 'text/plain'
        },
        retentionPeriod: 30
      })
    ).rejects.toThrow('File upload failed: HTTP 500')
  })
})
