import { Base64String, BasketStringUnder300Characters, BEEF, BooleanDefaultFalse, BooleanDefaultTrue, Byte, CertificateFieldNameUnder50Characters, DescriptionString5to50Characters, EntityIconURLStringMax500Characters, EntityNameStringMax100Characters, HexString, ISOTimestampString, KeyIDStringUnder800Characters, LabelStringUnder300Characters, OriginatorDomainNameStringUnder250Characters, OutpointString, OutputTagStringUnder300Characters, PositiveInteger, PositiveIntegerDefault10Max10000, PositiveIntegerMax10, PositiveIntegerOrZero, ProtocolString5To400Characters, PubKeyHex, SatoshiValue, TXIDHexString, VersionString7To30Characters, Wallet } from '../Wallet.interface.js'
import { Utils, Random } from '../../primitives/index.js'
import { WalletError } from '../WalletError.js'

/**
 * Facilitates wallet operations over cross-document messaging.
 */
export default class XDMSubstrate implements Wallet {
  constructor() {
    if (typeof window !== 'object') {
      throw new Error('The XDM substrate requires a global window object.')
    }
    if (typeof window.postMessage !== 'function') {
      throw new Error('The window object does not seem to support postMessage calls.')
    }
  }

  async invoke(call, args): Promise<any> {
    return await new Promise((resolve, reject) => {
      const id = Utils.toBase64(Random(12))
      window.addEventListener('message', async e => {
        if (e.data.type !== 'CWI' || !e.isTrusted || e.data.id !== id || e.data.isInvocation) return
        if (e.data.status === 'error') {
          const err = new WalletError(e.data.description, e.data.code)
          reject(err)
        } else {
          resolve(e.data.result)
        }
      })
      window.parent.postMessage({
        type: 'CWI',
        isInvocation: true,
        id,
        call,
        args
      }, '*')
    })
  }

  async createAction(args: { description: DescriptionString5to50Characters, inputs?: Array<{ tx?: BEEF, outpoint: OutpointString, unlockingScript?: HexString, unlockingScriptLength?: PositiveInteger, inputDescription: DescriptionString5to50Characters, sequenceNumber?: PositiveIntegerOrZero }>, outputs?: Array<{ lockingScript: HexString, satoshis: SatoshiValue, outputDescription: DescriptionString5to50Characters, basket?: BasketStringUnder300Characters, customInstructions?: string, tags?: OutputTagStringUnder300Characters[] }>, lockTime?: PositiveIntegerOrZero, version?: PositiveIntegerOrZero, labels?: LabelStringUnder300Characters[], options?: { signAndProcess?: BooleanDefaultTrue, acceptDelayedBroadcast?: BooleanDefaultTrue, trustSelf?: 'known', knownTxids?: TXIDHexString[], returnTXIDOnly?: BooleanDefaultFalse, noSend?: BooleanDefaultFalse, noSendChange?: OutpointString[], sendWith?: TXIDHexString[] } }): Promise<{ txid?: TXIDHexString, tx?: BEEF, noSendChange?: OutpointString[], sendWithResults?: Array<{ txid: TXIDHexString, status: 'unproven' | 'sending' | 'failed' }>, signableTransaction?: { tx: BEEF, reference: Base64String } }> {
    return await this.invoke('createAction', args)
  }

  async signAction(args: { spends: Record<PositiveIntegerOrZero, { unlockingScript: HexString, sequenceNumber?: PositiveIntegerOrZero }>, reference: Base64String, options?: { acceptDelayedBroadcast?: BooleanDefaultTrue, returnTXIDOnly?: BooleanDefaultFalse, noSend?: BooleanDefaultFalse, noSendChange?: OutpointString[], sendWith: TXIDHexString[] } }): Promise<{ txid?: TXIDHexString, tx?: BEEF, noSendChange?: OutpointString[], sendWithResults?: Array<{ txid: TXIDHexString, status: 'unproven' | 'sending' | 'failed' }> }> {
    return await this.invoke('signAction', args)
  }

  async abortAction(args: { reference: Base64String }): Promise<{ aborted: true }> {
    return await this.invoke('abortAction', args)
  }

  async listActions(args: { labels: LabelStringUnder300Characters[], labelQueryMode?: 'any' | 'all', includeLabels?: BooleanDefaultFalse, includeInputs?: BooleanDefaultFalse, includeInputSourceLockingScripts?: BooleanDefaultFalse, includeInputUnlockingScripts?: BooleanDefaultFalse, includeOutputs?: BooleanDefaultFalse, includeOutputLockingScripts?: BooleanDefaultFalse, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }): Promise<{ totalActions: PositiveIntegerOrZero, actions: Array<{ txid: TXIDHexString, satoshis: SatoshiValue, status: 'completed' | 'unprocessed' | 'sending' | 'unproven' | 'unsigned' | 'nosend' | 'nonfinal', isOutgoing: boolean, description: DescriptionString5to50Characters, labels?: LabelStringUnder300Characters[], version: PositiveIntegerOrZero, lockTime: PositiveIntegerOrZero, inputs?: Array<{ sourceOutpoint: OutpointString, sourceSatoshis: SatoshiValue, sourceLockingScript?: HexString, unlockingScript?: HexString, inputDescription: DescriptionString5to50Characters, sequenceNumber: PositiveIntegerOrZero }>, outputs?: Array<{ outputIndex: PositiveIntegerOrZero, satoshis: SatoshiValue, lockingScript?: HexString, spendable: boolean, outputDescription: DescriptionString5to50Characters, basket: BasketStringUnder300Characters, tags: OutputTagStringUnder300Characters[], customInstructions?: string }> }> }> {
    return await this.invoke('listActions', args)
  }

  async internalizeAction(args: { tx: BEEF, outputs: Array<{ outputIndex: PositiveIntegerOrZero, protocol: 'wallet payment' | 'basket insertion', paymentRemittance?: { derivationPrefix: Base64String, derivationSuffix: Base64String, senderIdentityKey: PubKeyHex }, insertionRemittance?: { basket: BasketStringUnder300Characters, customInstructions?: string, tags?: OutputTagStringUnder300Characters[] } }>, description: DescriptionString5to50Characters, labels?: LabelStringUnder300Characters[] }): Promise<{ accepted: true }> {
    return await this.invoke('internalizeAction', args)
  }

  async listOutputs(args: { basket: BasketStringUnder300Characters, tags?: OutputTagStringUnder300Characters[], tagQueryMode?: 'all' | 'any', include?: 'locking scripts' | 'entire transactions', includeCustomInstructions?: BooleanDefaultFalse, includeTags?: BooleanDefaultFalse, includeLabels?: BooleanDefaultFalse, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }): Promise<{ totalOutputs: PositiveIntegerOrZero, outputs: Array<{ outpoint: OutpointString, satoshis: SatoshiValue, lockingScript?: HexString, tx?: BEEF, spendable: true, customInstructions?: string, tags?: OutputTagStringUnder300Characters[], labels?: LabelStringUnder300Characters[] }> }> {
    return await this.invoke('listOutputs', args)
  }

  async relinquishOutput(args: { basket: BasketStringUnder300Characters, output: OutpointString }): Promise<{ relinquished: true }> {
    return await this.invoke('relinquishOutput', args)
  }

  async getPublicKey(args: { identityKey?: true, protocolID?: [0 | 1 | 2, ProtocolString5To400Characters], keyID?: KeyIDStringUnder800Characters, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', forSelf?: BooleanDefaultFalse }): Promise<{ publicKey: PubKeyHex }> {
    return await this.invoke('getPublicKey', args)
  }

  async revealCounterpartyKeyLinkage(args: { counterparty: PubKeyHex, verifier: PubKeyHex, privilegedReason?: DescriptionString5to50Characters, privileged?: BooleanDefaultFalse }): Promise<{ prover: PubKeyHex, verifier: PubKeyHex, counterparty: PubKeyHex, revelationTime: ISOTimestampString, encryptedLinkage: Byte[], encryptedLinkageProof: Byte[] }> {
    return await this.invoke('revealCounterpartyKeyLinkage', args)
  }

  async revealSpecificKeyLinkage(args: { counterparty: PubKeyHex, verifier: PubKeyHex, protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, privileged?: BooleanDefaultFalse }): Promise<{ prover: PubKeyHex, verifier: PubKeyHex, counterparty: PubKeyHex, protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, encryptedLinkage: Byte[], encryptedLinkageProof: Byte[], proofType: Byte }> {
    return await this.invoke('revealSpecificKeyLinkage', args)
  }

  async encrypt(args: { plaintext: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ ciphertext: Byte[] }> {
    return await this.invoke('encrypt', args)
  }

  async decrypt(args: { ciphertext: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ plaintext: Byte[] }> {
    return await this.invoke('decrypt', args)
  }

  async createHmac(args: { data: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ hmac: Byte[] }> {
    return await this.invoke('createHmac', args)
  }

  async verifyHmac(args: { data: Byte[], hmac: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ valid: true }> {
    return await this.invoke('verifyHmac', args)
  }

  async createSignature(args: { data?: Byte[], hashToDirectlySign?: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ signature: Byte[] }> {
    return await this.invoke('createSignature', args)
  }

  async verifySignature(args: { data?: Byte[], hashToDirectlyVerify?: Byte[], signature: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', forSelf?: BooleanDefaultFalse, privileged?: BooleanDefaultFalse }): Promise<{ valid: true }> {
    return await this.invoke('verifySignature', args)
  }

  async acquireCertificate(args: { type: Base64String, subject: PubKeyHex, serialNumber: Base64String, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, string>, certifier: PubKeyHex, keyringRevealer: PubKeyHex | 'certifier', keyringForSubject: Record<CertificateFieldNameUnder50Characters, Base64String>, acquisitionProtocol: 'direct' | 'issuance', certifierUrl?: string }): Promise<{ type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, string> }> {
    return await this.invoke('acquireCertificate', args)
  }

  async listCertificates(args: { certifiers: PubKeyHex[], types: Base64String[], limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Characters }): Promise<{ totalCertificates: PositiveIntegerOrZero, certificates: Array<{ type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, string> }> }> {
    return await this.invoke('listCertificates', args)
  }

  async proveCertificate(args: { certificate: { type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, string> }, fieldsToReveal: CertificateFieldNameUnder50Characters[], verifier: PubKeyHex, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Characters }): Promise<{ keyringForVerifier: Record<CertificateFieldNameUnder50Characters, Base64String> }> {
    return await this.invoke('proveCertificate', args)
  }

  async relinquishCertificate(args: { type: Base64String, serialNumber: Base64String, certifier: PubKeyHex }): Promise<{ relinquished: true }> {
    return await this.invoke('relinquishCertificate', args)
  }

  async discoverByIdentityKey(args: { identityKey: PubKeyHex, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }): Promise<{ totalCertificates: PositiveIntegerOrZero, certificates: Array<{ type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, Base64String>, certifierInfo: { name: EntityNameStringMax100Characters, iconUrl: EntityIconURLStringMax500Characters, description: DescriptionString5to50Characters, trust: PositiveIntegerMax10 }, publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>, decryptedFields: Record<CertificateFieldNameUnder50Characters, string> }> }> {
    return await this.invoke('discoverByIdentityKey', args)
  }

  async discoverByAttributes(args: { attributes: Record<CertificateFieldNameUnder50Characters, string>, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }): Promise<{ totalCertificates: PositiveIntegerOrZero, certificates: Array<{ type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, Base64String>, certifierInfo: { name: EntityNameStringMax100Characters, iconUrl: EntityIconURLStringMax500Characters, description: DescriptionString5to50Characters, trust: PositiveIntegerMax10 }, publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>, decryptedFields: Record<CertificateFieldNameUnder50Characters, string> }> }> {
    return await this.invoke('discoverByAttributes', args)
  }

  async isAuthenticated(args: {}): Promise<{ authenticated: boolean }> {
    return await this.invoke('isAuthenticated', args)
  }

  async waitForAuthentication(args: {}): Promise<{ authenticated: true }> {
    return await this.invoke('waitForAuthentication', args)
  }

  async getHeight(args: {}): Promise<{ height: PositiveInteger }> {
    return await this.invoke('getHeight', args)
  }

  async getHeaderForHeight(args: { height: PositiveInteger }): Promise<{ header: HexString }> {
    return await this.invoke('getHeaderForHeight', args)
  }

  async getNetwork(args: {}): Promise<{ network: 'mainnet' | 'testnet' }> {
    return await this.invoke('getNetwork', args)
  }

  async getVersion(args: {}): Promise<{ version: VersionString7To30Characters }> {
    return await this.invoke('getVersion', args)
  }
}
