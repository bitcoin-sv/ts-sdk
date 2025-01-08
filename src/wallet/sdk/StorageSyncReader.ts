import { sdk, table } from "..";

export interface StorageSyncReader {

    isAvailable(): boolean
    makeAvailable(): Promise<void>
    /**
     * Valid if isAvailable() returns true which requires makeAvailable() to complete successfully.
     */
    settings?: table.Settings

    destroy(): Promise<void>

    /////////////////
    //
    // READ OPERATIONS (state preserving methods)
    //
    /////////////////

    getSettings(trx?: sdk.TrxToken): Promise<table.Settings>

    getProvenTxsForUser(identityKey: string, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTx[]>
    getProvenTxReqsForUser(identityKey: string, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.ProvenTxReq[]>
    getTxLabelMapsForUser(identityKey: string, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.TxLabelMap[]>
    getOutputTagMapsForUser(identityKey: string, since?: Date, paged?: sdk.Paged, trx?: sdk.TrxToken): Promise<table.OutputTagMap[]>

    findCertificates(args: sdk.FindCertificatesArgs): Promise<table.Certificate[]>
    findCommissions(args: sdk.FindCommissionsArgs): Promise<table.Commission[]>
    findOutputBaskets(args: sdk.FindOutputBasketsArgs): Promise<table.OutputBasket[]>
    findOutputs(args: sdk.FindOutputsArgs): Promise<table.Output[]>
    findOutputTags(args: sdk.FindOutputTagsArgs): Promise<table.OutputTag[]>
    findTransactions(args: sdk.FindTransactionsArgs): Promise<table.Transaction[]>
    findTxLabels(args: sdk.FindTxLabelsArgs): Promise<table.TxLabel[]>

    // These are needed for automation:
    findSyncStates(args: sdk.FindSyncStatesArgs): Promise<table.SyncState[]>
    findUsers(args: sdk.FindUsersArgs): Promise<table.User[]>

    requestSyncChunk(args: RequestSyncChunkArgs): Promise<RequestSyncChunkResult>
}

/**
 * success: Last sync of this user from this dojo was successful.
 *
 * error: Last sync protocol operation for this user to this dojo threw and error.
 *
 * identified: Configured sync dojo has been identified but not sync'ed.
 *
 * unknown: Sync protocol state is unknown.
 */
export type SyncStatus = 'success' | 'error' | 'identified' | 'updated' | 'unknown'

export type SyncProtocolVersion = '0.1.0'

export interface RequestSyncChunkArgs {
    /**
     * The identity of whose data is being requested
     */
    identityKey: string
    /**
     * The max updated_at time received from the storage service receiving the request.
     * Will be undefiend if this is the first request or if no data was previously sync'ed.
     * 
     * `since` must include items if 'updated_at' is greater or equal. Thus, when not undefined, a sync request should always return at least one item already seen.
     */
    since?: Date
    /**
     * A rough limit on how large the response should be.
     * The item that exceeds the limit is included and ends adding more items.
     */
    maxRoughSize: number
    /**
     * The maximum number of items (records) to be returned.
     */
    maxItems: number
    /**
     * For each entity in dependency order, the offset at which to start returning items
     * from `since`.
     * 
     * The entity order is:
     * 0 ProvenTxs
     * 1 ProvenTxReqs
     * 2 OutputBaskets
     * 3 TxLabels
     * 4 OutputTags
     * 5 Transactions
     * 6 TxLabelMaps
     * 7 Commissions
     * 8 Outputs
     * 9 OutputTagMaps
     * 10 Certificates
     * 11 CertificateFields
     */
    offsets: { name: string, offset: number }[]
}

/**
 * Result received from remote `WalletStorage` in response to a `RequestSyncChunkArgs` request.
 * 
 * Each property is undefined if there was no attempt to update it. Typically this is caused by size and count limits on this result.
 * 
 * If all properties are empty arrays the sync process has received all available new and updated items.
 */
export interface RequestSyncChunkResult {
    provenTxs?: table.ProvenTx[]
    provenTxReqs?: table.ProvenTxReq[]
    outputBaskets?: table.OutputBasket[]
    txLabels?: table.TxLabel[]
    outputTags?: table.OutputTag[]
    transactions?: table.Transaction[]
    txLabelMaps?: table.TxLabelMap[]
    commissions?: table.Commission[]
    outputs?: table.Output[]
    outputTagMaps?: table.OutputTagMap[]
    certificates?: table.Certificate[]
    certificateFields?: table.CertificateField[]
}