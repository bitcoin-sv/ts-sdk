import { AuthFetch } from '../auth/clients/AuthFetch.js'
import { WalletInterface } from '../wallet/Wallet.interfaces.js'
import * as StorageUtils from './StorageUtils.js'

export interface UploaderConfig {
  storageURL: string
  wallet: WalletInterface
}

export interface UploadableFile {
  data: number[]
  type: string
}

export interface UploadFileResult {
  published: boolean
  uhrpURL: string
}

export class StorageUploader {
  private readonly authFetch: AuthFetch
  private readonly baseURL: string

  constructor (config: UploaderConfig) {
    this.baseURL = config.storageURL
    this.authFetch = new AuthFetch(config.wallet)
  }

  private async getUploadInfo (
    fileSize: number,
    retentionPeriod: number
  ): Promise<{
      uploadURL: string
      requiredHeaders: Record<string, string>
      amount?: number
    }> {
    const url = `${this.baseURL}/upload`
    const body = { fileSize, retentionPeriod }

    const response = await this.authFetch.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      throw new Error(`Upload info request failed: HTTP ${response.status}`)
    }
    const data = await response.json() as {
      status: string
      uploadURL: string
      amount?: number
      requiredHeaders: Record<string, string>
    }
    if (data.status === 'error') {
      throw new Error('Upload route returned an error.')
    }
    return {
      uploadURL: data.uploadURL,
      requiredHeaders: data.requiredHeaders,
      amount: data.amount
    }
  }

  private async uploadFile (
    uploadURL: string,
    file: UploadableFile,
    requiredHeaders: Record<string, string>
  ): Promise<UploadFileResult> {
    const body = Uint8Array.from(file.data)

    const response = await fetch(uploadURL, {
      method: 'PUT',
      body,
      headers: {
        'Content-Type': file.type,
        ...requiredHeaders
      }
    })
    if (!response.ok) {
      throw new Error(`File upload failed: HTTP ${response.status}`)
    }

    const uhrpURL = await StorageUtils.getURLForFile(file.data)
    return {
      published: true,
      uhrpURL
    }
  }

  /**
     * Publishes a file to the storage server with the specified retention period.
     *
     * This will:
     * 1. Request an upload URL from the server.
     * 2. Perform an HTTP PUT to upload the file’s raw bytes.
     * 3. Return a UHRP URL referencing the file once published.
     *
     * @param params.file - An object describing the file’s data (number[] array of bytes) and mime type.
     * @param params.retentionPeriod - Number of minutes to keep the file hosted.
     *
     * @returns An object indicating whether the file was published successfully and the resulting UHRP URL.
     *
     * @throws If either the upload info request or the subsequent file upload request fails (non-OK HTTP status).
     */
  public async publishFile (params: {
    file: UploadableFile
    retentionPeriod: number
  }): Promise<UploadFileResult> {
    const { file, retentionPeriod } = params
    const fileSize = file.data.length

    const { uploadURL, requiredHeaders } = await this.getUploadInfo(fileSize, retentionPeriod)
    return await this.uploadFile(uploadURL, file, requiredHeaders)
  }
}
