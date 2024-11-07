import { Base64String, BasketStringUnder300Characters, BEEF, BooleanDefaultFalse, BooleanDefaultTrue, Byte, CertificateFieldNameUnder50Characters, DescriptionString5to50Characters, EntityIconURLStringMax500Characters, EntityNameStringMax100Characters, HexString, ISOTimestampString, KeyIDStringUnder800Characters, LabelStringUnder300Characters, OriginatorDomainNameString, OutpointString, OutputTagStringUnder300Characters, PositiveInteger, PositiveIntegerDefault10Max10000, PositiveIntegerMax10, PositiveIntegerOrZero, ProtocolString5To400Characters, PubKeyHex, SatoshiValue, TXIDHexString, VersionString7To30Characters, Wallet } from '../Wallet.interface.js'

/**
 * Facilitates wallet operations over the winow.CWI interface.
 */
export default class WindowCWISubstrate implements Wallet {
  constructor() {
    if (typeof window !== 'object') {
      throw new Error('The window.CWI substrate requires a global window object.')
    }
    if (typeof (window as any).CWI !== 'object') {
      throw new Error('The window.CWI interface does not appear to be bound to the window object.')
    }
  }

  async createAction(args: { description: DescriptionString5to50Characters, inputs?: Array<{ tx?: BEEF, outpoint: OutpointString, unlockingScript?: HexString, unlockingScriptLength?: PositiveInteger, inputDescription: DescriptionString5to50Characters, sequenceNumber?: PositiveIntegerOrZero }>, outputs?: Array<{ lockingScript: HexString, satoshis: SatoshiValue, outputDescription: DescriptionString5to50Characters, basket?: BasketStringUnder300Characters, customInstructions?: string, tags?: OutputTagStringUnder300Characters[] }>, lockTime?: PositiveIntegerOrZero, version?: PositiveIntegerOrZero, labels?: LabelStringUnder300Characters[], options?: { signAndProcess?: BooleanDefaultTrue, acceptDelayedBroadcast?: BooleanDefaultTrue, trustSelf?: 'known', knownTxids?: TXIDHexString[], returnTXIDOnly?: BooleanDefaultFalse, noSend?: BooleanDefaultFalse, noSendChange?: OutpointString[], sendWith?: TXIDHexString[] } }, originator?: OriginatorDomainNameString): Promise<{ txid?: TXIDHexString, tx?: BEEF, noSendChange?: OutpointString[], sendWithResults?: Array<{ txid: TXIDHexString, status: 'unproven' | 'sending' | 'failed' }>, signableTransaction?: { tx: BEEF, reference: Base64String } }> {
    return (window as any).CWI.createAction(args, originator)
  }

  async signAction(args: { spends: Record<PositiveIntegerOrZero, { unlockingScript: HexString, sequenceNumber?: PositiveIntegerOrZero }>, reference: Base64String, options?: { acceptDelayedBroadcast?: BooleanDefaultTrue, returnTXIDOnly?: BooleanDefaultFalse, noSend?: BooleanDefaultFalse, noSendChange?: OutpointString[], sendWith: TXIDHexString[] } }, originator?: OriginatorDomainNameString): Promise<{ txid?: TXIDHexString, tx?: BEEF, noSendChange?: OutpointString[], sendWithResults?: Array<{ txid: TXIDHexString, status: 'unproven' | 'sending' | 'failed' }> }> {
    return (window as any).CWI.signAction(args, originator)
  }

  async abortAction(args: { reference: Base64String }, originator?: OriginatorDomainNameString): Promise<{ aborted: true }> {
    return (window as any).CWI.abortAction(args, originator)
  }

  async listActions(args: { labels: LabelStringUnder300Characters[], labelQueryMode?: 'any' | 'all', includeLabels?: BooleanDefaultFalse, includeInputs?: BooleanDefaultFalse, includeInputSourceLockingScripts?: BooleanDefaultFalse, includeInputUnlockingScripts?: BooleanDefaultFalse, includeOutputs?: BooleanDefaultFalse, includeOutputLockingScripts?: BooleanDefaultFalse, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }, originator?: OriginatorDomainNameString): Promise<{ totalActions: PositiveIntegerOrZero, actions: Array<{ txid: TXIDHexString, satoshis: SatoshiValue, status: 'completed' | 'unprocessed' | 'sending' | 'unproven' | 'unsigned' | 'nosend' | 'nonfinal', isOutgoing: boolean, description: DescriptionString5to50Characters, labels?: LabelStringUnder300Characters[], version: PositiveIntegerOrZero, lockTime: PositiveIntegerOrZero, inputs?: Array<{ sourceOutpoint: OutpointString, sourceSatoshis: SatoshiValue, sourceLockingScript?: HexString, unlockingScript?: HexString, inputDescription: DescriptionString5to50Characters, sequenceNumber: PositiveIntegerOrZero }>, outputs?: Array<{ outputIndex: PositiveIntegerOrZero, satoshis: SatoshiValue, lockingScript?: HexString, spendable: boolean, outputDescription: DescriptionString5to50Characters, basket: BasketStringUnder300Characters, tags: OutputTagStringUnder300Characters[], customInstructions?: string }> }> }> {
    return (window as any).CWI.listActions(args, originator)
  }

  async internalizeAction(args: { tx: BEEF, outputs: Array<{ outputIndex: PositiveIntegerOrZero, protocol: 'wallet payment' | 'basket insertion', paymentRemittance?: { derivationPrefix: Base64String, derivationSuffix: Base64String, senderIdentityKey: PubKeyHex }, insertionRemittance?: { basket: BasketStringUnder300Characters, customInstructions?: string, tags?: OutputTagStringUnder300Characters[] } }>, description: DescriptionString5to50Characters, labels?: LabelStringUnder300Characters[] }, originator?: OriginatorDomainNameString): Promise<{ accepted: true }> {
    return (window as any).CWI.internalizeAction(args, originator)
  }

  async listOutputs(args: { basket: BasketStringUnder300Characters, tags?: OutputTagStringUnder300Characters[], tagQueryMode?: 'all' | 'any', include?: 'locking scripts' | 'entire transactions', includeCustomInstructions?: BooleanDefaultFalse, includeTags?: BooleanDefaultFalse, includeLabels?: BooleanDefaultFalse, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }, originator?: OriginatorDomainNameString): Promise<{ totalOutputs: PositiveIntegerOrZero, outputs: Array<{ outpoint: OutpointString, satoshis: SatoshiValue, lockingScript?: HexString, tx?: BEEF, spendable: true, customInstructions?: string, tags?: OutputTagStringUnder300Characters[], labels?: LabelStringUnder300Characters[] }> }> {
    return (window as any).CWI.listOutputs(args, originator)
  }

  async relinquishOutput(args: { basket: BasketStringUnder300Characters, output: OutpointString }, originator?: OriginatorDomainNameString): Promise<{ relinquished: true }> {
    return (window as any).CWI.relinquishOutput(args, originator)
  }

  async getPublicKey(args: { identityKey?: true, protocolID?: [0 | 1 | 2, ProtocolString5To400Characters], keyID?: KeyIDStringUnder800Characters, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', forSelf?: BooleanDefaultFalse }, originator?: OriginatorDomainNameString): Promise<{ publicKey: PubKeyHex }> {
    return (window as any).CWI.getPublicKey(args, originator)
  }

  async revealCounterpartyKeyLinkage(args: { counterparty: PubKeyHex, verifier: PubKeyHex, privilegedReason?: DescriptionString5to50Characters, privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameString): Promise<{ prover: PubKeyHex, verifier: PubKeyHex, counterparty: PubKeyHex, revelationTime: ISOTimestampString, encryptedLinkage: Byte[], encryptedLinkageProof: Byte[] }> {
    return (window as any).CWI.revealCounterpartyKeyLinkage(args, originator)
  }

  async revealSpecificKeyLinkage(args: { counterparty: PubKeyHex, verifier: PubKeyHex, protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameString): Promise<{ prover: PubKeyHex, verifier: PubKeyHex, counterparty: PubKeyHex, protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, encryptedLinkage: Byte[], encryptedLinkageProof: Byte[], proofType: Byte }> {
    return (window as any).CWI.revealSpecificKeyLinkage(args, originator)
  }

  async encrypt(args: { plaintext: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameString): Promise<{ ciphertext: Byte[] }> {
    return (window as any).CWI.encrypt(args, originator)
  }

  async decrypt(args: { ciphertext: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameString): Promise<{ plaintext: Byte[] }> {
    return (window as any).CWI.decrypt(args, originator)
  }

  async createHmac(args: { data: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameString): Promise<{ hmac: Byte[] }> {
    return (window as any).CWI.createHmac(args, originator)
  }

  async verifyHmac(args: { data: Byte[], hmac: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameString): Promise<{ valid: true }> {
    return (window as any).CWI.verifyHmac(args, originator)
  }

  async createSignature(args: { data?: Byte[], hashToDirectlySign?: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameString): Promise<{ signature: Byte[] }> {
    return (window as any).CWI.createSignature(args, originator)
  }

  async verifySignature(args: { data?: Byte[], hashToDirectlyVerify?: Byte[], signature: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', forSelf?: BooleanDefaultFalse, privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameString): Promise<{ valid: true }> {
    return (window as any).CWI.verifySignature(args, originator)
  }

  async acquireCertificate(args: { type: Base64String, subject: PubKeyHex, serialNumber: Base64String, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, string>, certifier: PubKeyHex, keyringRevealer: PubKeyHex | 'certifier', keyringForSubject: Record<CertificateFieldNameUnder50Characters, Base64String>, acquisitionProtocol: 'direct' | 'issuance', certifierUrl?: string }, originator?: OriginatorDomainNameString): Promise<{ type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, string> }> {
    return (window as any).CWI.acquireCertificate(args, originator)
  }

  async listCertificates(args: { certifiers: PubKeyHex[], types: Base64String[], limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Characters }, originator?: OriginatorDomainNameString): Promise<{ totalCertificates: PositiveIntegerOrZero, certificates: Array<{ type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, string> }> }> {
    return (window as any).CWI.listCertificates(args, originator)
  }

  async proveCertificate(args: { certificate: { type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, string> }, fieldsToReveal: CertificateFieldNameUnder50Characters[], verifier: PubKeyHex, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Characters }, originator?: OriginatorDomainNameString): Promise<{ keyringForVerifier: Record<CertificateFieldNameUnder50Characters, Base64String> }> {
    return (window as any).CWI.proveCertificate(args, originator)
  }

  async relinquishCertificate(args: { type: Base64String, serialNumber: Base64String, certifier: PubKeyHex }, originator?: OriginatorDomainNameString): Promise<{ relinquished: true }> {
    return (window as any).CWI.relinquishCertificate(args, originator)
  }

  async discoverByIdentityKey(args: { identityKey: PubKeyHex, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }, originator?: OriginatorDomainNameString): Promise<{ totalCertificates: PositiveIntegerOrZero, certificates: Array<{ type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, Base64String>, certifierInfo: { name: EntityNameStringMax100Characters, iconUrl: EntityIconURLStringMax500Characters, description: DescriptionString5to50Characters, trust: PositiveIntegerMax10 }, publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>, decryptedFields: Record<CertificateFieldNameUnder50Characters, string> }> }> {
    return (window as any).CWI.discoverByIdentityKey(args, originator)
  }

  async discoverByAttributes(args: { attributes: Record<CertificateFieldNameUnder50Characters, string>, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }, originator?: OriginatorDomainNameString): Promise<{ totalCertificates: PositiveIntegerOrZero, certificates: Array<{ type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, Base64String>, certifierInfo: { name: EntityNameStringMax100Characters, iconUrl: EntityIconURLStringMax500Characters, description: DescriptionString5to50Characters, trust: PositiveIntegerMax10 }, publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>, decryptedFields: Record<CertificateFieldNameUnder50Characters, string> }> }> {
    return (window as any).CWI.discoverByAttributes(args, originator)
  }

  async isAuthenticated(args: {}, originator?: OriginatorDomainNameString): Promise<{ authenticated: boolean }> {
    return (window as any).CWI.isAuthenticated(args, originator)
  }

  async waitForAuthentication(args: {}, originator?: OriginatorDomainNameString): Promise<{ authenticated: true }> {
    return (window as any).CWI.waitForAuthentication(args, originator)
  }

  async getHeight(args: {}, originator?: OriginatorDomainNameString): Promise<{ height: PositiveInteger }> {
    return (window as any).CWI.getHeight(args, originator)
  }

  async getHeaderForHeight(args: { height: PositiveInteger }, originator?: OriginatorDomainNameString): Promise<{ header: HexString }> {
    return (window as any).CWI.getHeaderForHeight(args, originator)
  }

  async getNetwork(args: {}, originator?: OriginatorDomainNameString): Promise<{ network: 'mainnet' | 'testnet' }> {
    return (window as any).CWI.getNetwork(args, originator)
  }

  async getVersion(args: {}, originator?: OriginatorDomainNameString): Promise<{ version: VersionString7To30Characters }> {
    return (window as any).CWI.getVersion(args, originator)
  }
}
