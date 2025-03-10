import { StorageUploader } from '../StorageUploader.js'
import { WalletClient, StorageUtils } from '../../../mod.js'

// A helper for converting a string to a number[] of UTF-8 bytes
function stringToUtf8Array(str: string): number[] {
  return Array.from(new TextEncoder().encode(str))
}

describe('StorageUploader Tests', () => {
  let uploader: StorageUploader
  let walletClient: WalletClient
  let globalFetchSpy: jest.SpiedFunction<typeof global.fetch>

  beforeEach(() => {
    // Use a real or mock WalletClient
    walletClient = new WalletClient('json-api', 'non-admin.com')

    uploader = new StorageUploader({
      nanostoreURL: 'https://nanostore.babbage.systems', // TODO update to new nanostore url
      wallet: walletClient
    })

    // Spy on global.fetch to simulate network requests
    globalFetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should upload a file, produce a valid UHRP URL, and decode it to the known SHA-256', async () => {
    // Suppose we want "Hello, world!" as data
    // SHA-256("Hello, world!") starts with "b94d27b9..."
    const data = stringToUtf8Array('Hello, world!')

    // Mock out getUploadInfo so we can control the returned upload/public URLs
    jest.spyOn(uploader as any, 'getUploadInfo').mockResolvedValue({
      uploadURL: 'https://example-upload.com/put',
      publicURL: 'https://example.com/public/hello'
    })

    const result = await uploader.publishFile({
      file: {
        data,
        type: 'text/plain'
      },
      retentionPeriod: 7 // days or whatever your system uses
    })

    // We expect exactly one PUT request
    expect(globalFetchSpy).toHaveBeenCalledTimes(1)
    // Check the result
    expect(StorageUtils.isValidURL(result.hash)).toBe(true)
    expect(result.publicURL).toBe('https://example.com/public/hello')
    expect(result.published).toBe(true)

    // For additional assurance, we can parse the hash and compare
    // the first 4 hex bytes to "b94d27b9"
    const rawHash = StorageUtils.getHashFromURL(result.hash)
    const firstFour = rawHash.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join('')
    expect(firstFour).toEqual('b94d27b9')
  })

  it('should throw if the upload fails with HTTP 500', async () => {
    // Force the fetch to fail
    globalFetchSpy.mockResolvedValueOnce(new Response(null, { status: 500 }))

    // Also mock getUploadInfo
    jest.spyOn(uploader as any, 'getUploadInfo').mockResolvedValue({
      uploadURL: 'https://example-upload.com/put',
      publicURL: 'https://example.com/public/fail'
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
