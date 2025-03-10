import { AuthFetch, WalletInterface, StorageUtils } from '../../mod.js'

export interface UploaderConfig {
    nanostoreURL: string
    wallet: WalletInterface
}

export interface UploadableFile {
    data: number[]
    type?: string
}

export interface UploadFileResult {
    published: boolean
    hash: string
    publicURL: string
}

export class StorageUploader {
    private authFetch: AuthFetch
    private baseURL: string

    constructor(config: UploaderConfig) {
        this.baseURL = config.nanostoreURL
        this.authFetch = new AuthFetch(config.wallet)
    }

    private async getUploadInfo(
        fileSize: number,
        retentionPeriod: number
    ): Promise<{
        uploadURL: string
        publicURL: string
        amount?: number
    }> {
        const url = `${this.baseURL}/upload`
        const body = { fileSize, retentionPeriod }

        const response = await this.authFetch.fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(body)
        })
        if (!response.ok) {
            throw new Error(`Upload info request failed: HTTP ${response.status}`)
        }
        const data = await response.json() as {
            status: string,
            uploadURL: string
            publicURL: string,
            amount?: number
        }
        if (data.status === 'error') {
            throw new Error('Upload route returned an error.')
        }
        return {
            uploadURL: data.uploadURL,
            publicURL: data.publicURL,
            amount: data.amount
        }
    }

    private async uploadFile(
        uploadURL: string,
        publicURL: string,
        file: UploadableFile
    ): Promise<UploadFileResult> {

        // START OF OLD UPLOAD TODO
        const body = Uint8Array.from(file.data)

        const response = await fetch(uploadURL, {
            method: 'PUT',
            body: body
        })
        if (!response.ok) {
            throw new Error(`File upload failed: HTTP ${response.status}`)
        }

        const fileHash = StorageUtils.getURLForFile(file.data)
        return {
            published: true,
            hash: fileHash,
            publicURL
        }
    }

    public async publishFile(params: {
        file: UploadableFile
        retentionPeriod: number
    }): Promise<UploadFileResult> {
        const { file, retentionPeriod } = params
        const fileSize = file.data.length

        const { uploadURL, publicURL, amount } = await this.getUploadInfo(fileSize, retentionPeriod)
        return this.uploadFile(uploadURL, publicURL, file)
    }
}

