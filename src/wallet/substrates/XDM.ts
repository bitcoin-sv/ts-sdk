import {
  Base64String,
  BasketStringUnder300Bytes,
  BEEF,
  BooleanDefaultFalse,
  BooleanDefaultTrue,
  Byte,
  CertificateFieldNameUnder50Bytes,
  DescriptionString5to50Bytes,
  EntityIconURLStringMax500Bytes,
  EntityNameStringMax100Bytes,
  HexString,
  ISOTimestampString,
  KeyIDStringUnder800Bytes,
  LabelStringUnder300Bytes,
  OutpointString,
  OutputTagStringUnder300Bytes,
  PositiveInteger,
  PositiveIntegerDefault10Max10000,
  PositiveIntegerMax10,
  PositiveIntegerOrZero,
  ProtocolString5To400Bytes,
  PubKeyHex,
  SatoshiValue,
  SecurityLevel,
  TXIDHexString,
  VersionString7To30Bytes,
  WalletInterface
} from '../Wallet.interfaces'
import { Utils, Random } from '../../primitives/index'
import { WalletError } from '../WalletError'
import { CallType } from '../../../mod'

/**
 * Facilitates wallet operations over cross-document messaging.
 */
export default class XDMSubstrate implements WalletInterface {
  private readonly domain: string

  constructor (domain: string = '*') {
    if (typeof window !== 'object') {
      throw new Error('The XDM substrate requires a global window object.')
    }
    if (typeof window.postMessage !== 'function') {
      throw new Error(
        'The window object does not seem to support postMessage calls.'
      )
    }
    this.domain = domain
  }

  async invoke<T>(call: CallType, args: T): Promise<unknown> {
    return await new Promise<unknown>((resolve, reject) => {
      const id = Utils.toBase64(Random(12))

      const listener = (e: MessageEvent): void => {
        if (
          !(e instanceof MessageEvent) || // ✅ Ensures 'e' is a MessageEvent
          !e.isTrusted || // ✅ Explicitly checks the boolean
          typeof e.data !== 'object' || // ✅ Ensures e.data is an object before accessing properties
          e.data === null || // ✅ Handles potential null values
          e.data.type !== 'CWI' ||
          e.data.id !== id ||
          e.data.isInvocation !== true // ✅ Explicit comparison
        ) {
          return
        }

        if (typeof window.removeEventListener === 'function') {
          window.removeEventListener('message', listener)
        }

        if (e.data.status === 'error') {
          const err = new WalletError(
            e.data.description ?? 'Unknown error', // ✅ Handles null/undefined case
            e.data.code ?? 'UNKNOWN_ERROR' // ✅ Handles null/undefined case
          )
          reject(err)
        } else {
          resolve(e.data.result)
        }
      }

      window.addEventListener('message', listener)

      window.parent.postMessage(
        {
          type: 'CWI',
          isInvocation: true,
          id,
          call,
          args
        },
        this.domain
      )
    })
  }

  async createAction (args: {
    description: DescriptionString5to50Bytes
    inputs?: Array<{
      tx?: BEEF
      outpoint: OutpointString
      unlockingScript?: HexString
      unlockingScriptLength?: PositiveInteger
      inputDescription: DescriptionString5to50Bytes
      sequenceNumber?: PositiveIntegerOrZero
    }>
    outputs?: Array<{
      lockingScript: HexString
      satoshis: SatoshiValue
      outputDescription: DescriptionString5to50Bytes
      basket?: BasketStringUnder300Bytes
      customInstructions?: string
      tags?: OutputTagStringUnder300Bytes[]
    }>
    lockTime?: PositiveIntegerOrZero
    version?: PositiveIntegerOrZero
    labels?: LabelStringUnder300Bytes[]
    options?: {
      signAndProcess?: BooleanDefaultTrue
      acceptDelayedBroadcast?: BooleanDefaultTrue
      trustSelf?: 'known'
      knownTxids?: TXIDHexString[]
      returnTXIDOnly?: BooleanDefaultFalse
      noSend?: BooleanDefaultFalse
      noSendChange?: OutpointString[]
      sendWith?: TXIDHexString[]
    }
  }): Promise<{
      txid?: TXIDHexString
      tx?: BEEF
      noSendChange?: OutpointString[]
      sendWithResults?: Array<{
        txid: TXIDHexString
        status: 'unproven' | 'sending' | 'failed'
      }>
      signableTransaction?: { tx: BEEF, reference: Base64String }
    }> {
    return await (await this.invoke('createAction', args) as Promise<{
      txid?: TXIDHexString
      tx?: BEEF
      noSendChange?: OutpointString[]
      sendWithResults?: Array<{
        txid: TXIDHexString
        status: 'unproven' | 'sending' | 'failed'
      }>
      signableTransaction?: { tx: BEEF, reference: Base64String }
    }>)
  }

  async signAction (args: {
    spends: Record<
    PositiveIntegerOrZero,
    { unlockingScript: HexString, sequenceNumber?: PositiveIntegerOrZero }
    >
    reference: Base64String
    options?: {
      acceptDelayedBroadcast?: BooleanDefaultTrue
      returnTXIDOnly?: BooleanDefaultFalse
      noSend?: BooleanDefaultFalse
      noSendChange?: OutpointString[]
      sendWith: TXIDHexString[]
    }
  }): Promise<{
      txid?: TXIDHexString
      tx?: BEEF
      noSendChange?: OutpointString[]
      sendWithResults?: Array<{
        txid: TXIDHexString
        status: 'unproven' | 'sending' | 'failed'
      }>
    }> {
    return await (await this.invoke('signAction', args) as Promise<{
      txid?: TXIDHexString
      tx?: BEEF
      noSendChange?: OutpointString[]
      sendWithResults?: Array<{
        txid: TXIDHexString
        status: 'unproven' | 'sending' | 'failed'
      }>
    }>)
  }

  async abortAction (args: {
    reference: Base64String
  }): Promise<{ aborted: true }> {
    return await (await this.invoke('abortAction', args) as Promise<{ aborted: true }>)
  }

  async listActions (args: {
    labels: LabelStringUnder300Bytes[]
    labelQueryMode?: 'any' | 'all'
    includeLabels?: BooleanDefaultFalse
    includeInputs?: BooleanDefaultFalse
    includeInputSourceLockingScripts?: BooleanDefaultFalse
    includeInputUnlockingScripts?: BooleanDefaultFalse
    includeOutputs?: BooleanDefaultFalse
    includeOutputLockingScripts?: BooleanDefaultFalse
    limit?: PositiveIntegerDefault10Max10000
    offset?: PositiveIntegerOrZero
  }): Promise<{
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
        description: DescriptionString5to50Bytes
        labels?: LabelStringUnder300Bytes[]
        version: PositiveIntegerOrZero
        lockTime: PositiveIntegerOrZero
        inputs?: Array<{
          sourceOutpoint: OutpointString
          sourceSatoshis: SatoshiValue
          sourceLockingScript?: HexString
          unlockingScript?: HexString
          inputDescription: DescriptionString5to50Bytes
          sequenceNumber: PositiveIntegerOrZero
        }>
        outputs?: Array<{
          outputIndex: PositiveIntegerOrZero
          satoshis: SatoshiValue
          lockingScript?: HexString
          spendable: boolean
          outputDescription: DescriptionString5to50Bytes
          basket: BasketStringUnder300Bytes
          tags: OutputTagStringUnder300Bytes[]
          customInstructions?: string
        }>
      }>
    }> {
    return await (await this.invoke('listActions', args) as Promise<{
      totalActions: number
      actions: Array<{
        txid: string
        satoshis: number
        status:
        | 'unproven'
        | 'sending'
        | 'completed'
        | 'unprocessed'
        | 'unsigned'
        | 'nosend'
        | 'nonfinal'
        isOutgoing: boolean
        description: string
        labels?: string[]
        version: number
        lockTime: number
        inputs?: Array<{
          sourceOutpoint: string
          sourceSatoshis: number
          sourceLockingScript?: string
          unlockingScript?: string
          inputDescription: string
          sequenceNumber: number
        }>
        outputs?: Array<{
          outputIndex: number
          satoshis: number
          lockingScript?: string
          spendable: boolean
          outputDescription: string
          basket: string
          tags: string[]
          customInstructions?: string
        }>
      }>
    }>)
  }

  async internalizeAction (args: {
    tx: BEEF
    outputs: Array<{
      outputIndex: PositiveIntegerOrZero
      protocol: 'wallet payment' | 'basket insertion'
      paymentRemittance?: {
        derivationPrefix: Base64String
        derivationSuffix: Base64String
        senderIdentityKey: PubKeyHex
      }
      insertionRemittance?: {
        basket: BasketStringUnder300Bytes
        customInstructions?: string
        tags?: OutputTagStringUnder300Bytes[]
      }
    }>
    description: DescriptionString5to50Bytes
    labels?: LabelStringUnder300Bytes[]
  }): Promise<{ accepted: true }> {
    return await (await this.invoke('internalizeAction', args) as Promise<{ accepted: true }>)
  }

  async listOutputs (args: {
    basket: BasketStringUnder300Bytes
    tags?: OutputTagStringUnder300Bytes[]
    tagQueryMode?: 'all' | 'any'
    include?: 'locking scripts' | 'entire transactions'
    includeCustomInstructions?: BooleanDefaultFalse
    includeTags?: BooleanDefaultFalse
    includeLabels?: BooleanDefaultFalse
    limit?: PositiveIntegerDefault10Max10000
    offset?: PositiveIntegerOrZero
  }): Promise<{
      totalOutputs: PositiveIntegerOrZero
      outputs: Array<{
        outpoint: OutpointString
        satoshis: SatoshiValue
        lockingScript?: HexString
        tx?: BEEF
        spendable: boolean
        customInstructions?: string
        tags?: OutputTagStringUnder300Bytes[]
        labels?: LabelStringUnder300Bytes[]
      }>
    }> {
    return await (await this.invoke('listOutputs', args) as Promise<{
      totalOutputs: number
      outputs: Array<{
        outpoint: string
        satoshis: number
        lockingScript?: string
        tx?: BEEF
        spendable: boolean
        customInstructions?: string
        tags?: string[]
        labels?: string[]
      }>
    }>)
  }

  async relinquishOutput (args: {
    basket: BasketStringUnder300Bytes
    output: OutpointString
  }): Promise<{ relinquished: true }> {
    return await (await this.invoke('relinquishOutput', args) as Promise<{ relinquished: true }>)
  }

  async getPublicKey (args: {
    identityKey?: true
    protocolID?: [SecurityLevel, ProtocolString5To400Bytes]
    keyID?: KeyIDStringUnder800Bytes
    privileged?: BooleanDefaultFalse
    privilegedReason?: DescriptionString5to50Bytes
    counterparty?: PubKeyHex | 'self' | 'anyone'
    forSelf?: BooleanDefaultFalse
  }): Promise<{ publicKey: PubKeyHex }> {
    return await (await this.invoke('getPublicKey', args) as Promise<{ publicKey: string }>)
  }

  async revealCounterpartyKeyLinkage (args: {
    counterparty: PubKeyHex
    verifier: PubKeyHex
    privilegedReason?: DescriptionString5to50Bytes
    privileged?: BooleanDefaultFalse
  }): Promise<{
      prover: PubKeyHex
      verifier: PubKeyHex
      counterparty: PubKeyHex
      revelationTime: ISOTimestampString
      encryptedLinkage: Byte[]
      encryptedLinkageProof: Byte[]
    }> {
    return await (await this.invoke('revealCounterpartyKeyLinkage', args) as Promise<{
      prover: string
      verifier: string
      counterparty: string
      revelationTime: string
      encryptedLinkage: number[]
      encryptedLinkageProof: number[]
    }>)
  }

  async revealSpecificKeyLinkage (args: {
    counterparty: PubKeyHex
    verifier: PubKeyHex
    protocolID: [SecurityLevel, ProtocolString5To400Bytes]
    keyID: KeyIDStringUnder800Bytes
    privilegedReason?: DescriptionString5to50Bytes
    privileged?: BooleanDefaultFalse
  }): Promise<{
      prover: PubKeyHex
      verifier: PubKeyHex
      counterparty: PubKeyHex
      protocolID: [SecurityLevel, ProtocolString5To400Bytes]
      keyID: KeyIDStringUnder800Bytes
      encryptedLinkage: Byte[]
      encryptedLinkageProof: Byte[]
      proofType: Byte
    }> {
    return await (await this.invoke('revealSpecificKeyLinkage', args) as Promise<{
      prover: string
      verifier: string
      counterparty: string
      protocolID: [SecurityLevel, string] // ✅ Correct type for `protocolID`
      keyID: string
      encryptedLinkage: number[]
      encryptedLinkageProof: number[]
      proofType: number
    }>)
  }

  async encrypt (args: {
    plaintext: Byte[]
    protocolID: [SecurityLevel, ProtocolString5To400Bytes]
    keyID: KeyIDStringUnder800Bytes
    privilegedReason?: DescriptionString5to50Bytes
    counterparty?: PubKeyHex | 'self' | 'anyone'
    privileged?: BooleanDefaultFalse
  }): Promise<{ ciphertext: Byte[] }> {
    return await (await this.invoke('encrypt', args) as Promise<{ ciphertext: number[] }>)
  }

  async decrypt (args: {
    ciphertext: Byte[]
    protocolID: [SecurityLevel, ProtocolString5To400Bytes]
    keyID: KeyIDStringUnder800Bytes
    privilegedReason?: DescriptionString5to50Bytes
    counterparty?: PubKeyHex | 'self' | 'anyone'
    privileged?: BooleanDefaultFalse
  }): Promise<{ plaintext: Byte[] }> {
    return await (await this.invoke('decrypt', args) as Promise<{ plaintext: number[] }>)
  }

  async createHmac (args: {
    data: Byte[]
    protocolID: [SecurityLevel, ProtocolString5To400Bytes]
    keyID: KeyIDStringUnder800Bytes
    privilegedReason?: DescriptionString5to50Bytes
    counterparty?: PubKeyHex | 'self' | 'anyone'
    privileged?: BooleanDefaultFalse
  }): Promise<{ hmac: Byte[] }> {
    return await (await this.invoke('createHmac', args) as Promise<{ hmac: number[] }>)
  }

  async verifyHmac (args: {
    data: Byte[]
    hmac: Byte[]
    protocolID: [SecurityLevel, ProtocolString5To400Bytes]
    keyID: KeyIDStringUnder800Bytes
    privilegedReason?: DescriptionString5to50Bytes
    counterparty?: PubKeyHex | 'self' | 'anyone'
    privileged?: BooleanDefaultFalse
  }): Promise<{ valid: true }> {
    return await (await this.invoke('verifyHmac', args) as Promise<{ valid: true }>)
  }

  async createSignature (args: {
    data?: Byte[]
    hashToDirectlySign?: Byte[]
    protocolID: [SecurityLevel, ProtocolString5To400Bytes]
    keyID: KeyIDStringUnder800Bytes
    privilegedReason?: DescriptionString5to50Bytes
    counterparty?: PubKeyHex | 'self' | 'anyone'
    privileged?: BooleanDefaultFalse
  }): Promise<{ signature: Byte[] }> {
    return await (await this.invoke('createSignature', args) as Promise<{ signature: number[] }>)
  }

  async verifySignature (args: {
    data?: Byte[]
    hashToDirectlyVerify?: Byte[]
    signature: Byte[]
    protocolID: [SecurityLevel, ProtocolString5To400Bytes]
    keyID: KeyIDStringUnder800Bytes
    privilegedReason?: DescriptionString5to50Bytes
    counterparty?: PubKeyHex | 'self' | 'anyone'
    forSelf?: BooleanDefaultFalse
    privileged?: BooleanDefaultFalse
  }): Promise<{ valid: true }> {
    return await (await this.invoke('verifySignature', args) as Promise<{ valid: true }>)
  }

  async acquireCertificate (args: {
    type: Base64String
    subject: PubKeyHex
    serialNumber: Base64String
    revocationOutpoint: OutpointString
    signature: HexString
    fields: Record<CertificateFieldNameUnder50Bytes, string>
    certifier: PubKeyHex
    keyringRevealer: PubKeyHex | 'certifier'
    keyringForSubject: Record<CertificateFieldNameUnder50Bytes, Base64String>
    acquisitionProtocol: 'direct' | 'issuance'
    certifierUrl?: string
  }): Promise<{
      type: Base64String
      subject: PubKeyHex
      serialNumber: Base64String
      certifier: PubKeyHex
      revocationOutpoint: OutpointString
      signature: HexString
      fields: Record<CertificateFieldNameUnder50Bytes, string>
    }> {
    return await (await this.invoke('acquireCertificate', args) as Promise<{
      type: string
      subject: string
      serialNumber: string
      certifier: string
      revocationOutpoint: string
      signature: string
      fields: Record<string, string>
    }>)
  }

  async listCertificates (args: {
    certifiers: PubKeyHex[]
    types: Base64String[]
    limit?: PositiveIntegerDefault10Max10000
    offset?: PositiveIntegerOrZero
    privileged?: BooleanDefaultFalse
    privilegedReason?: DescriptionString5to50Bytes
  }): Promise<{
      totalCertificates: PositiveIntegerOrZero
      certificates: Array<{
        type: Base64String
        subject: PubKeyHex
        serialNumber: Base64String
        certifier: PubKeyHex
        revocationOutpoint: OutpointString
        signature: HexString
        fields: Record<CertificateFieldNameUnder50Bytes, string>
      }>
    }> {
    return await (await this.invoke('listCertificates', args) as Promise<{
      totalCertificates: number
      certificates: Array<{
        type: string
        subject: string
        serialNumber: string
        certifier: string
        revocationOutpoint: string
        signature: string
        fields: Record<string, string>
      }>
    }>)
  }

  async proveCertificate (args: {
    certificate: {
      type: Base64String
      subject: PubKeyHex
      serialNumber: Base64String
      certifier: PubKeyHex
      revocationOutpoint: OutpointString
      signature: HexString
      fields: Record<CertificateFieldNameUnder50Bytes, string>
    }
    fieldsToReveal: CertificateFieldNameUnder50Bytes[]
    verifier: PubKeyHex
    privileged?: BooleanDefaultFalse
    privilegedReason?: DescriptionString5to50Bytes
  }): Promise<{
      keyringForVerifier: Record<CertificateFieldNameUnder50Bytes, Base64String>
    }> {
    return await (await this.invoke('proveCertificate', args) as Promise<{
      keyringForVerifier: Record<string, string>
    }>)
  }

  async relinquishCertificate (args: {
    type: Base64String
    serialNumber: Base64String
    certifier: PubKeyHex
  }): Promise<{ relinquished: true }> {
    return await (await this.invoke('relinquishCertificate', args) as Promise<{ relinquished: true }>)
  }

  async discoverByIdentityKey (args: {
    identityKey: PubKeyHex
    limit?: PositiveIntegerDefault10Max10000
    offset?: PositiveIntegerOrZero
  }): Promise<{
      totalCertificates: PositiveIntegerOrZero
      certificates: Array<{
        type: Base64String
        subject: PubKeyHex
        serialNumber: Base64String
        certifier: PubKeyHex
        revocationOutpoint: OutpointString
        signature: HexString
        fields: Record<CertificateFieldNameUnder50Bytes, Base64String>
        certifierInfo: {
          name: EntityNameStringMax100Bytes
          iconUrl: EntityIconURLStringMax500Bytes
          description: DescriptionString5to50Bytes
          trust: PositiveIntegerMax10
        }
        publiclyRevealedKeyring: Record<
        CertificateFieldNameUnder50Bytes,
        Base64String
        >
        decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>
      }>
    }> {
    return await (await this.invoke('discoverByIdentityKey', args) as Promise<{
      totalCertificates: number
      certificates: Array<{
        type: string
        subject: string
        serialNumber: string
        certifier: string
        revocationOutpoint: string
        signature: string
        fields: Record<string, string>
        certifierInfo: {
          name: string
          iconUrl: string
          description: string
          trust: number
        }
        publiclyRevealedKeyring: Record<string, string>
        decryptedFields: Record<string, string>
      }>
    }>)
  }

  async discoverByAttributes (args: {
    attributes: Record<CertificateFieldNameUnder50Bytes, string>
    limit?: PositiveIntegerDefault10Max10000
    offset?: PositiveIntegerOrZero
  }): Promise<{
      totalCertificates: PositiveIntegerOrZero
      certificates: Array<{
        type: Base64String
        subject: PubKeyHex
        serialNumber: Base64String
        certifier: PubKeyHex
        revocationOutpoint: OutpointString
        signature: HexString
        fields: Record<CertificateFieldNameUnder50Bytes, Base64String>
        certifierInfo: {
          name: EntityNameStringMax100Bytes
          iconUrl: EntityIconURLStringMax500Bytes
          description: DescriptionString5to50Bytes
          trust: PositiveIntegerMax10
        }
        publiclyRevealedKeyring: Record<
        CertificateFieldNameUnder50Bytes,
        Base64String
        >
        decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>
      }>
    }> {
    return await (await this.invoke('discoverByAttributes', args) as Promise<{
      totalCertificates: number
      certificates: Array<{
        type: string
        subject: string
        serialNumber: string
        certifier: string
        revocationOutpoint: string
        signature: string
        fields: Record<string, string>
        certifierInfo: {
          name: string
          iconUrl: string
          description: string
          trust: number
        }
        publiclyRevealedKeyring: Record<string, string>
        decryptedFields: Record<string, string>
      }>
    }>)
  }

  async isAuthenticated (args: Record<string, never>): Promise<{ authenticated: true }> {
    return await (await this.invoke('isAuthenticated', args) as Promise<{ authenticated: true }>)
  }

  async waitForAuthentication (args: Record<string, never>): Promise<{ authenticated: true }> {
    return await (await this.invoke('waitForAuthentication', args) as Promise<{ authenticated: true }>)
  }

  async getHeight (args: Record<string, never>): Promise<{ height: PositiveInteger }> {
    return await (await this.invoke('getHeight', args) as Promise<{ height: PositiveInteger }>)
  }

  async getHeaderForHeight (args: { height: PositiveInteger }): Promise<{ header: HexString }> {
    return await (await this.invoke('getHeaderForHeight', args) as Promise<{ header: HexString }>)
  }

  async getNetwork (args: Record<string, never>): Promise<{ network: 'mainnet' | 'testnet' }> {
    return await (await this.invoke('getNetwork', args) as Promise<{ network: 'mainnet' | 'testnet' }>)
  }

  async getVersion (args: Record<string, never>): Promise<{ version: VersionString7To30Bytes }> {
    return await (await this.invoke('getVersion', args) as Promise<{ version: VersionString7To30Bytes }>)
  }
}
