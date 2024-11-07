/**
 * @typedef {boolean} BooleanDefaultFalse
 * Represents an optional boolean parameter, which defaults to `false` if not provided.
 */
export type BooleanDefaultFalse = boolean

/**
 * @typedef {boolean} BooleanDefaultTrue
 * Represents an optional boolean parameter, which defaults to `true` if not provided.
 */
export type BooleanDefaultTrue = boolean

/**
 * @typedef {number} Byte
 * Represents an integer from 0 to 255 (inclusive).
 * @minimum 0
 * @maximum 255
 */
export type Byte = number

/**
 * @typedef {number} PositiveIntegerOrZero
 * A positive integer, includes zero and has an upper bound of `2^32 - 1`.
 * @minimum 0
 * @maximum 4294967295
 */
export type PositiveIntegerOrZero = number

/**
 * @typedef {number} PositiveInteger
 * A positive integer that excludes zero, and has an upper bound of `2^32 - 1`.
 * @minimum 1
 * @maximum 4294967295
 */
export type PositiveInteger = number

/**
 * @typedef {number} PositiveIntegerMax10
 * A positive integer that excludes zero, and has an upper bound of 10.
 * @minimum 1
 * @maximum 10
 */
export type PositiveIntegerMax10 = number

/**
 * @typedef {number} PositiveIntegerDefault10Max10000
 * A positive integer that defaults to 10, and has an upper bound of 10000.
 * @minimum 1
 * @default 10
 * @maximum 10000
 */
export type PositiveIntegerDefault10Max10000 = number

/**
 * @typedef {number} SatoshiValue
 * Represents a value in Satoshis, constrained by the max supply of Bitcoin (2.1 * 10^15 Satoshis).
 * @minimum 1
 * @maximum 2100000000000000
 */
export type SatoshiValue = number

/**
 * @typedef {string} ISOTimestampString
 * Represents an ISO timestamp string.
 */
export type ISOTimestampString = string

/**
 * @typedef {string} HexString
 * A string containing only hexadecimal characters (0-9, a-f).
 */
export type HexString = string

/**
 * @typedef {HexString} TXIDHexString
 * Represents a transaction ID, enforced to be exactly 64 characters in length and in hexadecimal format.
 * @length 64
 */
export type TXIDHexString = HexString

/**
 * @typedef {string} OutpointString
 * Represents a transaction ID and output index pair. The TXID is given as a hex string followed by a period "." and then the output index is given as a decimal integer.
 */
export type OutpointString = string

/**
 * @typedef {HexString} PubKeyHex
 * Represents a compressed DER secp256k1 public key, exactly 66 hex characters (33 bytes) in length.
 * @length 66
 */
export type PubKeyHex = HexString

/**
 * @typedef {string} Base64String
 * A standard base64 encoded string.
 */
export type Base64String = string

/**
 * @typedef {string} OriginatorDomainNameString
 * Represents the fully qualified domain name (FQDN) of the application that originates the request.
 */
export type OriginatorDomainNameString = string

/**
 * @typedef {string & { minLength: 5, maxLength: 50 }} DescriptionString5to50Characters
 * A string used for descriptions, with a length between 5 and 50 characters.
 */
export type DescriptionString5to50Characters = string

/**
 * @typedef {string & { maxLength: 300 }} BasketStringUnder300Characters
 * A string for naming baskets, with a maximum length of 300 characters.
 */
export type BasketStringUnder300Characters = string

/**
 * @typedef {string & { maxLength: 300 }} OutputTagStringUnder300Characters
 * A string for tagging outputs, with a maximum length of 300 characters.
 */
export type OutputTagStringUnder300Characters = string

/**
 * @typedef {string & { maxLength: 300 }} LabelStringUnder300Characters
 * A string for labeling transactions, with a maximum length of 300 characters.
 */
export type LabelStringUnder300Characters = string

/**
 * @typedef {Byte[]} BEEF
 * An array of integers, each ranging from 0 to 255, indicating transaction data in BEEF (BRC-62) format.
 */
export type BEEF = Byte[]

/**
 * @typedef {Byte[]} AtomicBEEF
 * An array of integers, each ranging from 0 to 255, indicating transaction data in Atomic BEEF (BRC-95) format.
 */
export type AtomicBEEF = Byte[]

/**
 * @typedef {string & { minLength: 5, maxLength: 400 }} ProtocolString5To400Characters
 * A protocol identifier with a length between 5 and 400 characters.
 */
export type ProtocolString5To400Characters = string

/**
 * @typedef {string & { maxLength: 800 }} KeyIDStringUnder800Characters
 * Represents a key identifier string, with a maximum length of 800 characters.
 */
export type KeyIDStringUnder800Characters = string

/**
 * @typedef {string & { maxLength: 50 }} CertificateFieldNameUnder50Characters
 * Represents a certificate field name with a maximum length of 50 characters.
 */
export type CertificateFieldNameUnder50Characters = string

/**
 * @typedef {string & { maxLength: 100 }} EntityNameStringMax100Characters
 * Represents a trusted entity name with a maximum length of 100 characters.
 */
export type EntityNameStringMax100Characters = string

/**
 * @typedef {string & { maxLength: 500 }} EntityIconURLStringMax500Characters
 * Represents a trusted entity icon URL with a maximum length of 500 characters.
 */
export type EntityIconURLStringMax500Characters = string

/**
 * @typedef {string & { minLength: 7, maxLength: 30 }} VersionString7To30Characters
 * Represents a version string, with a length between 7 and 30 characters.
 *
 * The format is [vendor]-[major].[minor].[patch]
 */
export type VersionString7To30Characters = string

/**
 * @typedef {string & { minLength: 10, maxLength: 40 }} ErrorCodeString10To40Characters
 * Represents a machine-readable error code string, with a length between 10 and 40 characters.
 */
export type ErrorCodeString10To40Characters = string

/**
 * @typedef {string & { minLength: 20, maxLength: 200 }} ErrorDescriptionString20To200Characters
 * Represents a human-readable error description string, with a length between 20 and 200 characters.
 */
export type ErrorDescriptionString20To200Characters = string

/**
 * The Wallet interface defines a wallet capable of various tasks including transaction creation and signing,
 * encryption, decryption, identity certificate management, identity verification, and communication
 * with applications as per the BRC standards. This interface allows applications to interact with
 * the wallet for a range of functionalities aligned with the Babbage architectural principles.
 */
export interface Wallet {
  /**
   * Creates a new Bitcoin transaction based on the provided inputs, outputs, labels, locks, and other options.
   *
   * @param {Object} args - The arguments required to create the transaction.
   * @param {DescriptionString5to50Characters} args.description - A human-readable description of the action represented by this transaction.
   * @param {BEEF} [args.inputBEEF] - BEEF data associated with the set of input transactions from which UTXOs will be consumed.
   * @param {Array<Object>} [args.inputs] - An optional array of input objects used in the transaction.
   * @param {OutpointString} args.inputs[].outpoint - The outpoint being consumed.
   * @param {HexString} args.inputs[].unlockingScript - The unlocking script needed to release the specified UTXO.
   * @param {DescriptionString5to50Characters} args.inputs[].inputDescription - A description of this input for contextual understanding of what it consumes.
   * @param {PositiveIntegerOrZero} [args.inputs[].sequenceNumber] - An optional sequence number applied to the input.
   * @param {PositiveInteger} [args.inputs[].unlockingScriptLength] - Length of the unlocking script, in case it will be provided later using `signAction`.
   * @param {Array<Object>} [args.outputs] - An optional array of output objects for the transaction.
   * @param {HexString} args.outputs[].lockingScript - The locking script that dictates how the output can later be spent.
   * @param {SatoshiValue} args.outputs[].satoshis - Number of Satoshis that constitute this output.
   * @param {DescriptionString5to50Characters} args.outputs[].outputDescription - Description of what this output represents.
   * @param {BasketStringUnder300Characters} [args.outputs[].basket] - Name of the basket where this UTXO will be held, if tracking is desired.
   * @param {string} [args.outputs[].customInstructions] - Custom instructions attached onto this UTXO, often utilized within application logic to provide necessary unlocking context or track token histories.
   * @param {OutputTagStringUnder300Characters[]} [args.outputs[].tags] - Tags assigned to the output for sorting or filtering.
   * @param {PositiveIntegerOrZero} [args.lockTime] - Optional lock time for the transaction.
   * @param {PositiveInteger} [args.version] - Optional transaction version specifier.
   * @param {LabelStringUnder300Characters[]} [args.labels] - Optional labels providing additional categorization for the transaction.
   * @param {Object} [args.options] - Optional settings modifying transaction processing behavior.
   * @param {BooleanDefaultTrue} [args.options.signAndProcess] - Optional. If true and all inputs have unlockingScripts, the new transaction will be signed and handed off for processing by the network; result `txid` and `tx` are valid and `signableTransaciton` is undefined. If false or an input has an unlockingScriptLength, result `txid` and `tx` are undefined and `signableTransaction` is valid.
   * @param {BooleanDefaultTrue} [args.options.acceptDelayedBroadcast] - Optional. If true, the transaction will be sent to the network by a background process; use `noSend` and `sendWith` options to batch chained transactions. If false, the transaction will be broadcast to the network and any errors returned in result; note that rapidly sent chained transactions may still fail due to network propagation delays.
   * @param {'known'} [args.options.trustSelf] - Optional. If `known`, input transactions may omit supporting validity proof data for TXIDs known to this wallet or included in `knownTxids`.
   * @param {TXIDHexString[]} [args.options.knownTxids] - Optional. When working with large chained transactions using `noSend` and `sendWith` options, include TXIDs of inputs that may be assumed to be valid even if not already known by this wallet.
   * @param {BooleanDefaultFalse} [args.options.returnTXIDOnly] - Optional. If true, only a TXID will be returned instead of a transaction.
   * @param {BooleanDefaultFalse} [args.options.noSend] - Optional. If true, the transaction will be constructed but not sent to the network. Supports the creation of chained batches of transactions using the `sendWith` option.
   * @param {Array<OutPoint>} [args.options.noSendChange] - Optional. Valid when `noSend` is true. May contain `noSendChange` outpoints previously returned by prior `noSend` actions in the same batch of chained actions.
   * @param {Array<TXIDHexString>} [args.options.sendWith] - Optional. Sends a batch of actions previously created as `noSend` actions to the network; either synchronously if `acceptDelayedBroadcast` is true or by a background process.
   * @param {BooleanDefaultTrue} [args.options.randomizeOutputs] — optional. When set to false, the wallet will avoid randomizing the order of outputs within the transaction.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise returns different structures based on the outcome: error response, response with TXID, response with transaction, or info about signable transaction (partial BEEF and reference number).
   */
  createAction: (
    args: {
      description: DescriptionString5to50Characters
      inputBEEF?: BEEF
      inputs?: Array<{
        outpoint: OutpointString
        unlockingScript?: HexString
        unlockingScriptLength?: PositiveInteger
        inputDescription: DescriptionString5to50Characters
        sequenceNumber?: PositiveIntegerOrZero
      }>
      outputs?: Array<{
        lockingScript: HexString
        satoshis: SatoshiValue
        outputDescription: DescriptionString5to50Characters
        basket?: BasketStringUnder300Characters
        customInstructions?: string
        tags?: OutputTagStringUnder300Characters[]
      }>
      lockTime?: PositiveIntegerOrZero
      version?: PositiveIntegerOrZero
      labels?: LabelStringUnder300Characters[]
      options?: {
        signAndProcess?: BooleanDefaultTrue
        acceptDelayedBroadcast?: BooleanDefaultTrue
        trustSelf?: 'known'
        knownTxids?: TXIDHexString[]
        returnTXIDOnly?: BooleanDefaultFalse
        noSend?: BooleanDefaultFalse
        noSendChange?: OutpointString[]
        sendWith?: TXIDHexString[]
        randomizeOutputs?: BooleanDefaultTrue
      }
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{
    txid?: TXIDHexString
    tx?: AtomicBEEF
    noSendChange?: OutpointString[]
    sendWithResults?: Array<{
      txid: TXIDHexString
      status: 'unproven' | 'sending' | 'failed'
    }>
    signableTransaction?: {
      tx: AtomicBEEF
      reference: Base64String
    }
  }>

  /**
   * Signs a transaction previously created using `createAction`.
   *
   * @param {Object} args - Arguments to sign the transaction.
   * @param {Record<PositiveIntegerOrZero, Object>} args.spends - Map of input indexes to the corresponding unlocking script and optional sequence number.
   * @param {HexString} args.spends[].unlockingScript - The unlocking script for the corresponding input.
   * @param {PositiveIntegerOrZero} [args.spends[].sequenceNumber] - The sequence number of the input.
   * @param {Base64String} args.reference - Reference number returned from the call to `createAction`.
   * @param {Object} [args.options] - Optional settings modifying transaction processing behavior.
   * @param {BooleanDefaultTrue} [args.options.acceptDelayedBroadcast] - Optional. If true, transaction will be sent to the network by a background process; use `noSend` and `sendWith` options to batch chained transactions. If false, transaction will be broadcast to the network and any errors returned in result; note that rapidly sent chained transactions may still fail due to network propagation delays.
   * @param {'known'} [args.options.trustSelf] - Optional. If `known`, input transactions may omit supporting validity proof data for TXIDs known to this wallet or included in `knownTxids`.
   * @param {TXIDHexString[]} [args.options.knownTxids] - Optional. When working with large chained transactions using `noSend` and `sendWith` options, include TXIDs of inputs that may be assumed to be valid even if not already known by this wallet.
   * @param {BooleanDefaultFalse} [args.options.returnTXIDOnly] - Optional. If true, only a TXID will be returned instead of a transaction.
   * @param {BooleanDefaultFalse} [args.options.noSend] - Optional. If true, the transaction will be constructed but not sent to the network. Supports the creation of chained batches of transactions using the `sendWith` option.
   * @param {Array<TXIDHexString>} [args.options.sendWith] - Optional. Sends a batch of actions previously created as `noSend` actions to the network; either synchronously if `acceptDelayedBroadcast` is true or by a background process.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise returns an error response or a response with either the completed transaction or TXID.
   */
  signAction: (
    args: {
      spends: Record<
        PositiveIntegerOrZero,
        {
          unlockingScript: HexString
          sequenceNumber?: PositiveIntegerOrZero
        }
      >
      reference: Base64String
      options?: {
        acceptDelayedBroadcast?: BooleanDefaultTrue
        returnTXIDOnly?: BooleanDefaultFalse
        noSend?: BooleanDefaultFalse
        sendWith?: TXIDHexString[]
      }
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{
    txid?: TXIDHexString
    tx?: AtomicBEEF
    sendWithResults?: Array<{
      txid: TXIDHexString
      status: 'unproven' | 'sending' | 'failed'
    }>
  }>

  /**
   * Aborts a transaction that is in progress and has not yet been finalized or sent to the network.
   *
   * @param {Object} args - Arguments to identify the transaction that needs to be aborted.
   * @param {Base64String} args.reference - Reference number for the transaction to abort.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise resolves to an object indicating the abortion result (either success or error).
   */
  abortAction: (
    args: {
      reference: Base64String
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{ aborted: true }>

  /**
   * Lists all transactions matching the specified labels.
   *
   * @param {Object} args - Arguments to specify how to filter or retrieve transactions.
   * @param {LabelStringUnder300Characters[]} args.labels - An array of labels used to filter actions.
   * @param {'any' | 'all'} [args.labelQueryMode] - Specifies how to match labels (default is any which matches any of the labels).
   * @param {BooleanDefaultFalse} [args.includeLabels] - Whether to include transaction labels in the result set.
   * @param {boolean} [args.includeInputs] - Whether to include input details in the result set.
   * @param {boolean} [args.includeInputSourceLockingScripts] - Whether to include input source locking scripts in the result set.
   * @param {boolean} [args.includeInputUnlockingScripts] - Whether to include input unlocking scripts in the result set.
   * @param {boolean} [args.includeOutputs] - Whether to include output details in the result set.
   * @param {boolean} [args.includeOutputLockingScripts] - Whether to include output locking scripts in the result set.
   * @param {PositiveIntegerDefault10Max10000} [args.limit] - The maximum number of transactions to retrieve.
   * @param {PositiveIntegerOrZero} [args.offset] - Number of transactions to skip before starting to return the results.
   * @param {BooleanDefaultTrue} [args.seekPermission] — Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise resolves to an object containing actions, their metadata, inputs, and outputs if applicable, or an error object.
   */
  listActions: (
    args: {
      labels: LabelStringUnder300Characters[]
      labelQueryMode?: 'any' | 'all'
      includeLabels?: BooleanDefaultFalse
      includeInputs?: BooleanDefaultFalse
      includeInputSourceLockingScripts?: BooleanDefaultFalse
      includeInputUnlockingScripts?: BooleanDefaultFalse
      includeOutputs?: BooleanDefaultFalse
      includeOutputLockingScripts?: BooleanDefaultFalse
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
      seekPermission?: BooleanDefaultTrue
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{
    totalActions: PositiveIntegerOrZero
    actions: Array<{
      txid: TXIDHexString
      satoshis: SatoshiValue
      status:
      | 'completed'
      | 'unprocessed'
      | 'sending'
      | 'unproven'
      | 'unsigned'
      | 'nosend'
      | 'nonfinal'
      isOutgoing: boolean
      description: DescriptionString5to50Characters
      labels?: LabelStringUnder300Characters[]
      version: PositiveIntegerOrZero
      lockTime: PositiveIntegerOrZero
      inputs?: Array<{
        sourceOutpoint: OutpointString
        sourceSatoshis: SatoshiValue
        sourceLockingScript?: HexString
        unlockingScript?: HexString
        inputDescription: DescriptionString5to50Characters
        sequenceNumber: PositiveIntegerOrZero
      }>
      outputs?: Array<{
        outputIndex: PositiveIntegerOrZero
        satoshis: SatoshiValue
        lockingScript?: HexString
        spendable: boolean
        outputDescription: DescriptionString5to50Characters
        basket: BasketStringUnder300Characters
        tags: OutputTagStringUnder300Characters[]
        customInstructions?: string
      }>
    }>
  }>

  /**
   * Submits a transaction to be internalized and optionally labeled, outputs paid to the wallet balance, inserted into baskets, and/or tagged.
   *
   * @param {Object} args - Arguments required to internalize the transaction.
   * @param {BEEF} args.tx - Atomic BEEF-formatted transaction to internalize.
   * @param {Array<Object>} args.outputs - Metadata about outputs, processed differently based on payment or insertion types.
   * @param {PositiveIntegerOrZero} args.outputs[].outputIndex - Index of the output within the transaction.
   * @param {'payment' | 'insert'} args.outputs[].protocol - Specifies whether the output is a payment (to be received into the wallet balance) or an insert operation (into a particular basket).
   * @param {Object} [args.outputs[].paymentRemittance] - Remittance data, structured accordingly for the payment operation.
   * @param {Base64String} args.outputs[].paymentRemittance.derivationPrefix - Payment-level derivation prefix used by the sender for key derivation (for payments).
   * @param {Base64String} args.outputs[].paymentRemittance.derivationSuffix - Specific output-level derivation suffix used by the sender for key derivation (for payments).
   * @param {PubKeyHex} args.outputs[].paymentRemittance.senderIdentityKey - Public identity key of the sender (for payments).
   * @param {Object} [args.outputs[].insertionRemittance] - Remittance data, structured accordingly for the insertion operation.
   * @param {BasketStringUnder300Characters} args.outputs[].insertionRemittance.basket - Basket in which to place the output (for insertions).
   * @param {string} [args.outputs[].insertionRemittance.customInstructions] - Optionally provided custom instructions attached to the output (for insertions).
   * @param {OutputTagStringUnder300Characters[]} [args.outputs[].insertionRemittance.tags] - Tags attached to the output (for insertions).
   * @param {DescriptionString5to50Characters} args.description - Human-readable description of the transaction being internalized.
   * @param {LabelStringUnder300Characters[]} [args.labels] - Optional labels associated with this transaction.
   * @param {BooleanDefaultTrue} [args.seekPermission] — Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise resolves to an object indicating the success of the operation or an error object.
   */
  internalizeAction: (
    args: {
      tx: AtomicBEEF
      outputs: Array<{
        outputIndex: PositiveIntegerOrZero
        protocol: 'wallet payment' | 'basket insertion'
        paymentRemittance?: {
          derivationPrefix: Base64String
          derivationSuffix: Base64String
          senderIdentityKey: PubKeyHex
        }
        insertionRemittance?: {
          basket: BasketStringUnder300Characters
          customInstructions?: string
          tags?: OutputTagStringUnder300Characters[]
        }
      }>
      description: DescriptionString5to50Characters
      labels?: LabelStringUnder300Characters[]
      seekPermission?: BooleanDefaultTrue
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{ accepted: true }>

  /**
   * Lists the spendable outputs kept within a specific basket, optionally tagged with specific labels.
   *
   * @param {Object} args - Arguments detailing the query for listing spendable outputs.
   * @param {BasketStringUnder300Characters} args.basket - The associated basket name whose outputs should be listed.
   * @param {OutputTagStringUnder300Characters[]} [args.tags] - Filter outputs based on these tags.
   * @param {'all' | 'any'} [args.tagQueryMode] - Filter mode, defining whether all or any of the tags must match. By default, any tag can match.
   * @param {'locking scripts' | 'entire transactions'} [args.include] - Whether to include locking scripts (with each output) or entire transactions (as aggregated BEEF, at the top level) in the result. By default, unless specified, neither are returned.
   * @param {BooleanDefaultFalse} [args.includeEntireTransactions] - Whether to include the entire transaction(s) in the result.
   * @param {BooleanDefaultFalse} [args.includeCustomInstructions] - Whether custom instructions should be returned in the result.
   * @param {BooleanDefaultFalse} [args.includeTags] - Whether the tags associated with the output should be returned.
   * @param {BooleanDefaultFalse} [args.includeLabels] - Whether the labels associated with the transaction containing the output should be returned.
   * @param {PositiveIntegerDefault10Max10000} [args.limit] - Optional limit on the number of outputs to return.
   * @param {PositiveIntegerOrZero} [args.offset] - Number of outputs to skip before starting to return results.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @param {BooleanDefaultTrue} [args.seekPermission] — Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.
   * @returns {Promise<Object>} The promise returns an output listing or an error object.
   */
  listOutputs: (
    args: {
      basket: BasketStringUnder300Characters
      tags?: OutputTagStringUnder300Characters[]
      tagQueryMode?: 'all' | 'any'
      include?: 'locking scripts' | 'entire transactions'
      includeCustomInstructions?: BooleanDefaultFalse
      includeTags?: BooleanDefaultFalse
      includeLabels?: BooleanDefaultFalse
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
      seekPermission?: BooleanDefaultTrue
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{
    totalOutputs: PositiveIntegerOrZero
    BEEF?: BEEF
    outputs: Array<{
      outpoint: OutpointString
      satoshis: SatoshiValue
      lockingScript?: HexString
      spendable: true
      customInstructions?: string
      tags?: OutputTagStringUnder300Characters[]
      labels?: LabelStringUnder300Characters[]
    }>
  }>

  /**
   * Relinquish an output out of a basket, removing it from tracking without spending it.
   *
   * @param {Object} args - Arguments identifying the output in the basket.
   * @param {BasketStringUnder300Characters} args.basket - The associated basket name where the output should be removed.
   * @param {OutpointString} args.outpoint - The output that should be removed from the basket.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise returns an indication of successful removal or an error object.
   */
  relinquishOutput: (
    args: {
      basket: BasketStringUnder300Characters
      output: OutpointString
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{ relinquished: true }>

  /**
   * Retrieves a derived or identity public key based on the requested protocol, key ID, counterparty, and other factors.
   *
   * @param {Object} args - Arguments to specify which public key to retrieve.
   * @param {BooleanDefaultFalse|true} [args.identityKey] - Use true to retrieve the current user's own identity key, overriding any protocol ID, key ID, or counterparty specified.
   * @param {[0 | 1 | 2, ProtocolString5To400Characters]} args.protocolID - The security level and protocol string used for key derivation.
   * @param {KeyIDStringUnder800Characters} args.keyID - The key ID used for key derivation.
   * @param {BooleanDefaultFalse} [args.privileged] - Whether this is a privileged request.
   * @param {DescriptionString5to50Characters} [args.privilegedReason] - Reason provided for privileged access, required if this is a privileged operation.
   * @param {PubKeyHex | 'self' | 'anyone'} [args.counterparty] - The public key of the counterparty involved in the key derivation process.
   * @param {BooleanDefaultFalse} [args.forSelf] - Whether to return the public key derived from the current user's own identity (as opposed to the counterparty's identity).
   * @param {BooleanDefaultTrue} [args.seekPermission] — Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} Resolves to an object containing the public key, or an error response.
   */
  getPublicKey: (
    args: {
      identityKey?: true
      protocolID?: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID?: KeyIDStringUnder800Characters
      privileged?: BooleanDefaultFalse
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      forSelf?: BooleanDefaultFalse
      seekPermission?: BooleanDefaultTrue
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{ publicKey: PubKeyHex }>

  /**
   * Reveals the key linkage between ourselves and a counterparty, to a particular verifier, across all interactions with the counterparty.
   *
   * @param {Object} args - Contains information about counterparty, verifier, and whether the operation is privileged.
   * @param {PubKeyHex} args.counterparty - The public key of the counterparty involved in the linkage.
   * @param {PubKeyHex} args.verifier - The public key of the verifier requesting the linkage information.
   * @param {DescriptionString5to50Characters} [args.privilegedReason] - Reason provided for privileged access, required if this is a privileged operation.
   * @param {BooleanDefaultFalse} [args.privileged] - Whether this is a privileged request.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} Resolves to the key linkage, or an error response.
   */
  revealCounterpartyKeyLinkage: (
    args: {
      counterparty: PubKeyHex
      verifier: PubKeyHex
      privilegedReason?: DescriptionString5to50Characters
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{
    prover: PubKeyHex
    verifier: PubKeyHex
    counterparty: PubKeyHex
    revelationTime: ISOTimestampString
    encryptedLinkage: Byte[]
    encryptedLinkageProof: Byte[]
  }>

  /**
   * Reveals the key linkage between ourselves and a counterparty, to a particular verifier, with respect to a specific interaction.
   *
   * @param {Object} args - The object defining the counterparty, verifier, protocol, and keyID for which linkage should be revealed.
   * @param {PubKeyHex} args.counterparty - The public key of the counterparty involved in the linkage.
   * @param {PubKeyHex} args.verifier - The public key of the verifier requesting the linkage information.
   * @param {[0 | 1 | 2, ProtocolString5To400Characters]} args.protocolID - The security level and protocol string associated with the linkage information to reveal.
   * @param {KeyIDStringUnder800Characters} args.keyID - The key ID associated with the linkage information to reveal.
   * @param {DescriptionString5to50Characters} [args.privilegedReason] - Reason provided for privileged access, required if this is a privileged operation.
   * @param {BooleanDefaultFalse} [args.privileged] - Whether this is a privileged request.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise returns the requested linkage information, or an error object.
   */
  revealSpecificKeyLinkage: (
    args: {
      counterparty: PubKeyHex
      verifier: PubKeyHex
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{
    prover: PubKeyHex
    verifier: PubKeyHex
    counterparty: PubKeyHex
    protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
    keyID: KeyIDStringUnder800Characters
    encryptedLinkage: Byte[]
    encryptedLinkageProof: Byte[]
    proofType: Byte
  }>

  /**
   * Encrypts the provided plaintext data using derived keys, based on the protocol ID, key ID, counterparty, and other factors.
   *
   * @param {Object} args - Information needed for encryption, including the plaintext, protocol ID, and key ID.
   * @param {Byte[]} args.plaintext - Array of bytes constituting the plaintext data to be encrypted.
   * @param {[0 | 1 | 2, ProtocolString5To400Characters]} args.protocolID - The security level and protocol string under which the data should be encrypted.
   * @param {KeyIDStringUnder800Characters} args.keyID - Key ID under which the encryption will be performed.
   * @param {DescriptionString5to50Characters} [args.privilegedReason] - Reason provided for privileged access, required if this is a privileged operation.
   * @param {PubKeyHex | 'self' | 'anyone'} [args.counterparty] - Public key of the counterparty (if two-party encryption is desired).
   * @param {BooleanDefaultFalse} [args.privileged] - Whether this is a privileged request.
   * @param {BooleanDefaultTrue} [args.seekPermission] — Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} Resolves to the encrypted ciphertext bytes or an error if encryption fails.
   */
  encrypt: (
    args: {
      plaintext: Byte[]
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
      seekPermission?: BooleanDefaultTrue
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{ ciphertext: Byte[] }>

  /**
   * Decrypts the provided ciphertext using derived keys, based on the protocol ID, key ID, counterparty, and other factors.
   *
   * @param {Object} args - Contains the ciphertext, protocol ID, and key ID required to decrypt the data.
   * @param {Byte[]} args.ciphertext - Encrypted bytes, including the initialization vector, for decryption.
   * @param {[0 | 1 | 2, ProtocolString5To400Characters]} args.protocolID - Security level and protocol string that were used during the encryption of the ciphertext.
   * @param {KeyIDStringUnder800Characters} args.keyID - Key ID used during the encryption of the ciphertext.
   * @param {DescriptionString5to50Characters} [args.privilegedReason] - Reason provided for privileged access, required if this is a privileged operation.
   * @param {PubKeyHex | 'self' | 'anyone'} [args.counterparty] - Public identity key of the counterparty for the encryption operation.
   * @param {BooleanDefaultFalse} [args.privileged] - Whether this is a privileged request.
   * @param {BooleanDefaultTrue} [args.seekPermission] — Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} Resolves to the decryption result, containing the plaintext data or an error.
   */
  decrypt: (
    args: {
      ciphertext: Byte[]
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
      seekPermission?: BooleanDefaultTrue
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{ plaintext: Byte[] }>

  /**
   * Creates an HMAC (Hash-based Message Authentication Code) based on the provided data, protocol, key ID, counterparty, and other factors.
   *
   * @param {Object} args - Arguments containing the data, protocol ID, and key ID to generate the HMAC from.
   * @param {Byte[]} args.data - Input data (in bytes) for which the HMAC needs to be created.
   * @param {[0 | 1 | 2, ProtocolString5To400Characters]} args.protocolID - Security level and protocol string to be used during the HMAC operation.
   * @param {KeyIDStringUnder800Characters} args.keyID - Key ID to be used in the HMAC operation.
   * @param {DescriptionString5to50Characters} [args.privilegedReason] - Reason provided for privileged access, required if this is a privileged operation.
   * @param {PubKeyHex | 'self' | 'anyone'} [args.counterparty] - Public identity key of the counterparty if the operation encompasses a two-party interaction.
   * @param {BooleanDefaultFalse} [args.privileged] - Whether this is a privileged request.
   * @param {BooleanDefaultTrue} [args.seekPermission] — Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} Resolves to an object containing the generated HMAC bytes, or an error if the creation fails.
   */
  createHmac: (
    args: {
      data: Byte[]
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
      seekPermission?: BooleanDefaultTrue
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{ hmac: Byte[] }>

  /**
   * Verifies an HMAC (Hash-based Message Authentication Code) based on the provided data, protocol, key ID, counterparty, and other factors.
   *
   * @param {Object} args - Arguments containing the HMAC data, protocol ID, and key ID needed for verification.
   * @param {Byte[]} args.data - The input data whose HMAC is to be verified.
   * @param {Byte[]} args.hmac - Byte array representing the HMAC value to be verified.
   * @param {[0 | 1 | 2, ProtocolString5To400Characters]} args.protocolID - Security level and protocol string to be used during the HMAC operation.
   * @param {KeyIDStringUnder800Characters} args.keyID - Key ID to be used during the HMAC operation.
   * @param {DescriptionString5to50Characters} [args.privilegedReason] - Reason provided for privileged access, required if this is a privileged operation.
   * @param {PubKeyHex | 'self' | 'anyone'} [args.counterparty] - Public identity key of the counterparty if the operation encompasses a two-party interaction.
   * @param {BooleanDefaultFalse} [args.privileged] - Whether this is a privileged request.
   * @param {BooleanDefaultTrue} [args.seekPermission] — Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} Resolves to an object confirming whether the HMAC was valid or an error.
   */
  verifyHmac: (
    args: {
      data: Byte[]
      hmac: Byte[]
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
      seekPermission?: BooleanDefaultTrue
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{ valid: true }>

  /**
   * Creates a digital signature for the provided data or hash using a specific protocol, key, and optionally considering privilege and counterparty.
   *
   * @param {Object} args - Arguments to specify data, protocol, key ID, and privilege for creating the signature.
   * @param {Byte[]} [args.data] - Data to be signed using the derived private key with ECDSA. Required unless directly signing a hash.
   * @param {[0 | 1 | 2, ProtocolString5To400Characters]} args.protocolID - Security level and protocol string to be used during the signing operation.
   * @param {KeyIDStringUnder800Characters} args.keyID - Key ID to be used during the signing operation.
   * @param {DescriptionString5to50Characters} [args.privilegedReason] - Reason provided for privileged access, required if this is a privileged operation.
   * @param {PubKeyHex | 'self' | 'anyone'} [args.counterparty] - Public identity key of the counterparty if the operation encompasses a two-party interaction.
   * @param {BooleanDefaultFalse} [args.privileged] - Whether this is a privileged request.
   * @param {Byte[]} [args.hashToDirectlySign] - Sign a pre-hashed value in situations where data can't or shouldn't be revealed, whether due to its size or for privacy.
   * @param {BooleanDefaultTrue} [args.seekPermission] — Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise will resolve to an object containing the DER-encoded ECDSA signature, or an error on failure.
   */
  createSignature: (
    args: {
      data?: Byte[]
      hashToDirectlySign?: Byte[]
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
      seekPermission?: BooleanDefaultTrue
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{ signature: Byte[] }>

  /**
   * Verifies a digital signature for the provided data or hash using a specific protocol, key, and optionally considering privilege and counterparty.
   *
   * @param {Object} args - Arguments specifying the data, signature, protocol, and key ID.
   * @param {Byte[]} [args.data] - The data originally signed, which is required for verification unless directly verifying a hash.
   * @param {Byte[]} args.signature - The DER-encoded ECDSA signature to validate.
   * @param {[0 | 1 | 2, ProtocolString5To400Characters]} args.protocolID - Security level and protocol string to be used during signature verification.
   * @param {KeyIDStringUnder800Characters} args.keyID - Key ID to be used during signature verification.
   * @param {DescriptionString5to50Characters} [args.privilegedReason] - Reason provided for privileged access, required if this is a privileged operation.
   * @param {PubKeyHex | 'self' | 'anyone'} [args.counterparty] - Public identity key of the counterparty if the operation encompasses a two-party interaction.
   * @param {BooleanDefaultFalse} [args.forSelf] - Whether the signature to be verified was created by this user rather than the counterparty.
   * @param {BooleanDefaultFalse} [args.privileged] - Whether this is a privileged request.
   * @param {Byte[]} [args.hashToDirectlyVerify] - Optional field to verify the signature against a precomputed hash instead of data.
   * @param {BooleanDefaultTrue} [args.seekPermission] — Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise resolves to a boolean object indicating whether the signature was valid or an error message.
   */
  verifySignature: (
    args: {
      data?: Byte[]
      hashToDirectlyVerify?: Byte[]
      signature: Byte[]
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      forSelf?: BooleanDefaultFalse
      privileged?: BooleanDefaultFalse
      seekPermission?: BooleanDefaultTrue
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{ valid: true }>

  /**
   * Acquires an identity certificate, whether by acquiring one from the certifier or by directly receiving it.
   *
   * @param {Object} args - Contains the type of certificate, certifier information, and fields of the certificate to be provided, among other details.
   * @param {Base64String} args.type - Type identifier for the certificate.
   * @param {PubKeyHex} args.certifier - The public identity key of the certifier.
   * @param {'issuance' | 'direct'} args.acquisitionProtocol - Specifies the acquisition process, set to either 'issuance' or 'direct'.
   * * @param {Record<CertificateFieldNameUnder50Characters, string>} args.fields - The fields included within the certificate.
   * @param {Base64String} [args.serialNumber] - Serial number of the certificate to acquire (required when the acquisition protocol is direct).
   * @param {string} [args.revocationOutpoint] - Reference for an outpoint comprising a Bitcoin token that, if ever spent, marks the certificate as invalid (required when the acquisition protocol is direct).
   * @param {HexString} [args.signature] - Signature over the certificate (required when the acquisition protocol is direct).
   * @param {string} [args.certifierUrl] - URL of the certifier where certificate acquisition requests will be sent (required when the acquisition protocol is issuance).
   * @param {PubKeyHex | 'certifier'} [args.keyringRevealer] - The public identity key of the entity revealing the keyring to the user, if different from the certifier (required when the acquisition protocol is direct).
   * @param {Record<CertificateFieldNameUnder50Characters, Base64String>} [args.keyringForSubject] - Keyring revealing all certificate fields to the subject (required when the acquisition protocol is direct).
   * @param {BooleanDefaultFalse} [args.privileged] - Whether this is a privileged request.
   * @param {DescriptionString5to50Characters} [args.privilegedReason] - Reason provided for privileged access, required if this is a privileged operation.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise resolves to an object containing the acquired certificate, or an error object.
   */
  acquireCertificate: (
    args: {
      type: Base64String
      certifier: PubKeyHex
      acquisitionProtocol: 'direct' | 'issuance'
      fields: Record<CertificateFieldNameUnder50Characters, string>
      serialNumber?: Base64String
      revocationOutpoint?: OutpointString
      signature?: HexString
      certifierUrl?: string
      keyringRevealer?: PubKeyHex | 'certifier'
      keyringForSubject?: Record<
        CertificateFieldNameUnder50Characters,
        Base64String
      >
      privileged?: BooleanDefaultFalse
      privilegedReason?: DescriptionString5to50Characters
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{
    type: Base64String
    subject: PubKeyHex
    serialNumber: Base64String
    certifier: PubKeyHex
    revocationOutpoint: OutpointString
    signature: HexString
    fields: Record<CertificateFieldNameUnder50Characters, string>
  }>

  /**
   * Lists identity certificates belonging to the user, filtered by certifier(s) and type(s).
   *
   * @param {Object} args - Arguments used to filter or limit the list of certificates returned by the request.
   * @param {PubKeyHex[]} args.certifiers - An array of public keys for specific certifiers (filters by these certifiers).
   * @param {Base64String[]} args.types - An array of certificate types issued by any of the specified certifiers, which should be returned.
   * @param {PositiveIntegerDefault10Max10000} [args.limit] - Maximum number of certificates to return.
   * @param {PositiveIntegerOrZero} [args.offset] - Number of records to skip before starting to return results.
   * @param {BooleanDefaultFalse} [args.privileged] - Whether this is a privileged request.
   * @param {DescriptionString5to50Characters} [args.privilegedReason] - Reason provided for privileged access, required if this is a privileged operation.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise resolves to an object containing certificates or an error response.
   */
  listCertificates: (
    args: {
      certifiers: PubKeyHex[]
      types: Base64String[]
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
      privileged?: BooleanDefaultFalse
      privilegedReason?: DescriptionString5to50Characters
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{
    totalCertificates: PositiveIntegerOrZero
    certificates: Array<{
      type: Base64String
      subject: PubKeyHex
      serialNumber: Base64String
      certifier: PubKeyHex
      revocationOutpoint: OutpointString
      signature: HexString
      fields: Record<CertificateFieldNameUnder50Characters, string>
    }>
  }>

  /**
   * Proves select fields of an identity certificate, as specified, when requested by a verifier.
   *
   * @param {Object} args - Arguments including the certificate, fields to reveal, and verifier's public key.
   * @param {Object} args.certificate - The specific identity certificate being proven.
   * @param {Base64String} args.certificate.type - The type of the certificate to be proven.
   * @param {PubKeyHex} args.certificate.subject - Public key belonging to the certificate's subject.
   * @param {Base64String} args.certificate.serialNumber - Unique serial number of the certificate.
   * @param {PubKeyHex} args.certificate.certifier - Public key of the certifier who issued the certificate.
   * @param {OutpointString} args.certificate.revocationOutpoint - The outpoint used to confirm that the certificate has not been revoked.
   * @param {HexString} args.certificate.signature - Certificate signature by the certifier's private key.
   * @param {Record<CertificateFieldNameUnder50Characters, string>} args.certificate.fields - All the encrypted fields present in the certificate.
   * @param {CertificateFieldNameUnder50Characters[]} args.fieldsToReveal - Array of field names that need to be revealed to the verifier.
   * @param {PubKeyHex} args.verifier - Public key of the verifier, to whom the key revelations will be made.
   * @param {BooleanDefaultFalse} [args.privileged] - Whether this is a privileged request.
   * @param {DescriptionString5to50Characters} [args.privilegedReason] - Reason provided for privileged access, required if this is a privileged operation.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} Resolves to a keyring for the verifier or an error object.
   */
  proveCertificate: (
    args: {
      certificate: {
        type: Base64String
        subject: PubKeyHex
        serialNumber: Base64String
        certifier: PubKeyHex
        revocationOutpoint: OutpointString
        signature: HexString
        fields: Record<CertificateFieldNameUnder50Characters, string>
      }
      fieldsToReveal: CertificateFieldNameUnder50Characters[]
      verifier: PubKeyHex
      privileged?: BooleanDefaultFalse
      privilegedReason?: DescriptionString5to50Characters
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{
    keyringForVerifier: Record<
      CertificateFieldNameUnder50Characters,
      Base64String
    >
  }>

  /**
   * Relinquishes an identity certificate, removing it from the wallet regardless of whether the revocation outpoint has become spent.
   *
   * @param {Object} args - Contains the type of certificate, certifier, and serial number for relinquishment.
   * @param {Base64String} args.type - Type identifier for the certificate.
   * @param {PubKeyHex} args.certifier - The public identity key of the certifier.
   * @param {Base64String} args.serialNumber - Serial number of the certificate to relinquish.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise resolves to an indication of successful relinquishment or an error object.
   */
  relinquishCertificate: (
    args: {
      type: Base64String
      serialNumber: Base64String
      certifier: PubKeyHex
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{ relinquished: true }>

  /**
   * Discovers identity certificates, issued to a given identity key by a trusted entity.
   *
   * @param {Object} args - Arguments for requesting the discovery based on the identity key.
   * @param {PubKeyHex} args.identityKey - Identity key used to filter and discover certificates.
   * @param {PositiveIntegerDefault10Max10000} [args.limit] - Maximum number of certificates to return in the response.
   * @param {PositiveIntegerOrZero} [args.offset] - Skip this number of records before starting to provide results.
   * @param {BooleanDefaultTrue} [args.seekPermission] — Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise resolves to the list of certificates discovered or an error object.
   */
  discoverByIdentityKey: (
    args: {
      identityKey: PubKeyHex
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
      seekPermission?: BooleanDefaultTrue
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{
    totalCertificates: PositiveIntegerOrZero
    certificates: Array<{
      type: Base64String
      subject: PubKeyHex
      serialNumber: Base64String
      certifier: PubKeyHex
      revocationOutpoint: OutpointString
      signature: HexString
      fields: Record<CertificateFieldNameUnder50Characters, Base64String>
      certifierInfo: {
        name: EntityNameStringMax100Characters
        iconUrl: EntityIconURLStringMax500Characters
        description: DescriptionString5to50Characters
        trust: PositiveIntegerMax10
      }
      publiclyRevealedKeyring: Record<
        CertificateFieldNameUnder50Characters,
        Base64String
      >
      decryptedFields: Record<CertificateFieldNameUnder50Characters, string>
    }>
  }>

  /**
   * Discovers identity certificates belonging to other users, where the documents contain specific attributes, issued by a trusted entity.
   *
   * @param {Object} args - Attributes and optional parameters used to discover certificates.
   * @param {Record<CertificateFieldNameUnder50Characters, string>} args.attributes - The attributes used to discover the certificates.
   * @param {PositiveIntegerDefault10Max10000} [args.limit] - Optional limit on the number of results returned.
   * @param {PositiveIntegerOrZero} [args.offset] - Starts retrieval of results after the specified number of records.
   * @param {BooleanDefaultTrue} [args.seekPermission] — Whether to seek permission from the user for this operation if required. Default true, will return an error rather than proceed if set to false.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise resolves to a list of matching certificates or an error object.
   */
  discoverByAttributes: (
    args: {
      attributes: Record<CertificateFieldNameUnder50Characters, string>
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
      seekPermission?: BooleanDefaultTrue
    },
    originator?: OriginatorDomainNameString
  ) => Promise<{
    totalCertificates: PositiveIntegerOrZero
    certificates: Array<{
      type: Base64String
      subject: PubKeyHex
      serialNumber: Base64String
      certifier: PubKeyHex
      revocationOutpoint: OutpointString
      signature: HexString
      fields: Record<CertificateFieldNameUnder50Characters, Base64String>
      certifierInfo: {
        name: EntityNameStringMax100Characters
        iconUrl: EntityIconURLStringMax500Characters
        description: DescriptionString5to50Characters
        trust: PositiveIntegerMax10
      }
      publiclyRevealedKeyring: Record<
        CertificateFieldNameUnder50Characters,
        Base64String
      >
      decryptedFields: Record<CertificateFieldNameUnder50Characters, string>
    }>
  }>

  /**
   * Checks the authentication status of the user.
   *
   * @param {Object} args - Empty object, as no parameters are needed.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise resolves to an object indicating whether the user is authenticated or an error response.
   */
  isAuthenticated: (
    args: {},
    originator?: OriginatorDomainNameString
  ) => Promise<{ authenticated: boolean }>

  /**
   * Continuously waits until the user is authenticated, returning the result once confirmed.
   *
   * @param {Object} args - Not used, pass an empty object.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The final result indicating that the user is authenticated or an error object.
   */
  waitForAuthentication: (
    args: {},
    originator?: OriginatorDomainNameString
  ) => Promise<{ authenticated: true }>

  /**
   * Retrieves the current height of the blockchain.
   *
   * @param {Object} args - Empty object as no other parameters are necessary.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} Resolves to an object indicating the current height or an error on failure.
   */
  getHeight: (
    args: {},
    originator?: OriginatorDomainNameString
  ) => Promise<{ height: PositiveInteger }>

  /**
   * Retrieves the block header of a block at a specified height.
   *
   * @param {Object} args - Contains the height parameter needed to retrieve the block header.
   * @param {PositiveInteger} args.height - Specifies the height at which the block header needs to be retrieved.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise resolves to an 80-byte block header or an error if it cannot be retrieved.
   */
  getHeaderForHeight: (
    args: { height: PositiveInteger },
    originator?: OriginatorDomainNameString
  ) => Promise<{ header: HexString }>

  /**
   * Retrieves the Bitcoin network the client is using (mainnet or testnet).
   *
   * @param {Object} args - No arguments required, pass an empty object.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} The promise resolves to an object indicating whether the client is using the mainnet or testnet.
   */
  getNetwork: (
    args: {},
    originator?: OriginatorDomainNameString
  ) => Promise<{ network: 'mainnet' | 'testnet' }>

  /**
   * Retrieves the current version string of the wallet.
   *
   * @param {Object} args - Empty argument object.
   * @param {OriginatorDomainNameString} [originator] - Fully-qualified domain name (FQDN) of the application that originated the request.
   * @returns {Promise<Object>} Resolves to an object containing the version string of the wallet, or an error.
   */
  getVersion: (
    args: {},
    originator?: OriginatorDomainNameString
  ) => Promise<{ version: VersionString7To30Characters }>
}