import { Base64String, BasketStringUnder300Characters, BEEF, BooleanDefaultFalse, BooleanDefaultTrue, Byte, CertificateFieldNameUnder50Characters, DescriptionString5to50Characters, EntityIconURLStringMax500Characters, EntityNameStringMax100Characters, HexString, ISOTimestampString, KeyIDStringUnder800Characters, LabelStringUnder300Characters, OriginatorDomainNameStringUnder250Characters, OutpointString, OutputTagStringUnder300Characters, PositiveInteger, PositiveIntegerDefault10Max10000, PositiveIntegerMax10, PositiveIntegerOrZero, ProtocolString5To400Characters, PubKeyHex, SatoshiValue, TXIDHexString, VersionString7To30Characters, Wallet } from './Wallet.interfaces.js'
import WindowCWISubstrate from './substrates/window.CWI.js'
import XDMSubstrate from './substrates/XDM.js'
import WalletWireTransceiver from './substrates/WalletWireTransceiver.js'
import HTTPWalletWire from './substrates/HTTPWalletWire.js'

/**
 * The SDK is how applications communicate with wallets over a communications substrate.
 */
export default class WalletClient implements Wallet {
  public substrate: 'auto' | Wallet
  originator?: OriginatorDomainNameStringUnder250Characters
  constructor(substrate: 'auto' | 'Cicada' | 'XDM' | 'window.CWI' | Wallet = 'auto', originator?: OriginatorDomainNameStringUnder250Characters) {
    if (substrate === 'Cicada') substrate = new WalletWireTransceiver(new HTTPWalletWire(originator))
    if (substrate === 'window.CWI') substrate = new WindowCWISubstrate()
    if (substrate === 'XDM') substrate = new XDMSubstrate()
    this.substrate = substrate
    this.originator = originator
  }

  async connectToSubstrate() {
    if (typeof this.substrate === 'object') {
      return // substrate is already connected
    }
    let sub: Wallet
    const checkSub = async (timeout?: number) => {
      let result
      if (typeof timeout === 'number') {
        result = await Promise.race([
          sub.getVersion({}),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timed out.')), timeout))
        ])
      } else {
        result = await sub.getVersion({})
      }
      if (typeof result !== 'object' || typeof result.version !== 'string') {
        throw new Error('Failed to use substrate.')
      }
    }
    try {
      sub = new WindowCWISubstrate()
      await checkSub()
      this.substrate = sub
    } catch (e) {
      try {
        sub = new XDMSubstrate()
        await checkSub(200)
        this.substrate = sub
      } catch (e) {
        try {
          sub = new WalletWireTransceiver(new HTTPWalletWire(this.originator))
          await checkSub()
          this.substrate = sub
        } catch (e) {
          throw new Error('No wallet available over any communication substrate. Install a BSV wallet today!')
        }
      }
    }
  }

  async createAction(args: { description: DescriptionString5to50Characters, inputs?: Array<{ tx?: BEEF, outpoint: OutpointString, unlockingScript?: HexString, unlockingScriptLength?: PositiveInteger, inputDescription: DescriptionString5to50Characters, sequenceNumber?: PositiveIntegerOrZero }>, outputs?: Array<{ lockingScript: HexString, satoshis: SatoshiValue, outputDescription: DescriptionString5to50Characters, basket?: BasketStringUnder300Characters, customInstructions?: string, tags?: OutputTagStringUnder300Characters[] }>, lockTime?: PositiveIntegerOrZero, version?: PositiveIntegerOrZero, labels?: LabelStringUnder300Characters[], options?: { signAndProcess?: BooleanDefaultTrue, acceptDelayedBroadcast?: BooleanDefaultTrue, trustSelf?: 'known', knownTxids?: TXIDHexString[], returnTXIDOnly?: BooleanDefaultFalse, noSend?: BooleanDefaultFalse, noSendChange?: OutpointString[], sendWith?: TXIDHexString[] } }): Promise<{ txid?: TXIDHexString, tx?: BEEF, noSendChange?: OutpointString[], sendWithResults?: Array<{ txid: TXIDHexString, status: 'unproven' | 'sending' | 'failed' }>, signableTransaction?: { tx: BEEF, reference: Base64String } }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).createAction(args, this.originator)
  }

  async signAction(args: { spends: Record<PositiveIntegerOrZero, { unlockingScript: HexString, sequenceNumber?: PositiveIntegerOrZero }>, reference: Base64String, options?: { acceptDelayedBroadcast?: BooleanDefaultTrue, returnTXIDOnly?: BooleanDefaultFalse, noSend?: BooleanDefaultFalse, noSendChange?: OutpointString[], sendWith: TXIDHexString[] } }): Promise<{ txid?: TXIDHexString, tx?: BEEF, noSendChange?: OutpointString[], sendWithResults?: Array<{ txid: TXIDHexString, status: 'unproven' | 'sending' | 'failed' }> }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).signAction(args, this.originator)
  }

  async abortAction(args: { reference: Base64String }): Promise<{ aborted: true }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).abortAction(args, this.originator)
  }

  async listActions(args: { labels: LabelStringUnder300Characters[], labelQueryMode?: 'any' | 'all', includeLabels?: BooleanDefaultFalse, includeInputs?: BooleanDefaultFalse, includeInputSourceLockingScripts?: BooleanDefaultFalse, includeInputUnlockingScripts?: BooleanDefaultFalse, includeOutputs?: BooleanDefaultFalse, includeOutputLockingScripts?: BooleanDefaultFalse, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }): Promise<{ totalActions: PositiveIntegerOrZero, actions: Array<{ txid: TXIDHexString, satoshis: SatoshiValue, status: 'completed' | 'unprocessed' | 'sending' | 'unproven' | 'unsigned' | 'nosend' | 'nonfinal', isOutgoing: boolean, description: DescriptionString5to50Characters, labels?: LabelStringUnder300Characters[], version: PositiveIntegerOrZero, lockTime: PositiveIntegerOrZero, inputs?: Array<{ sourceOutpoint: OutpointString, sourceSatoshis: SatoshiValue, sourceLockingScript?: HexString, unlockingScript?: HexString, inputDescription: DescriptionString5to50Characters, sequenceNumber: PositiveIntegerOrZero }>, outputs?: Array<{ outputIndex: PositiveIntegerOrZero, satoshis: SatoshiValue, lockingScript?: HexString, spendable: boolean, outputDescription: DescriptionString5to50Characters, basket: BasketStringUnder300Characters, tags: OutputTagStringUnder300Characters[], customInstructions?: string }> }> }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).listActions(args, this.originator)
  }

  async internalizeAction(args: { tx: BEEF, outputs: Array<{ outputIndex: PositiveIntegerOrZero, protocol: 'wallet payment' | 'basket insertion', paymentRemittance?: { derivationPrefix: Base64String, derivationSuffix: Base64String, senderIdentityKey: PubKeyHex }, insertionRemittance?: { basket: BasketStringUnder300Characters, customInstructions?: string, tags?: OutputTagStringUnder300Characters[] } }>, description: DescriptionString5to50Characters, labels?: LabelStringUnder300Characters[] }): Promise<{ accepted: true }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).internalizeAction(args, this.originator)
  }

  async listOutputs(args: { basket: BasketStringUnder300Characters, tags?: OutputTagStringUnder300Characters[], tagQueryMode?: 'all' | 'any', include?: 'locking scripts' | 'entire transactions', includeCustomInstructions?: BooleanDefaultFalse, includeTags?: BooleanDefaultFalse, includeLabels?: BooleanDefaultFalse, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }): Promise<{ totalOutputs: PositiveIntegerOrZero, outputs: Array<{ outpoint: OutpointString, satoshis: SatoshiValue, lockingScript?: HexString, tx?: BEEF, spendable: true, customInstructions?: string, tags?: OutputTagStringUnder300Characters[], labels?: LabelStringUnder300Characters[] }> }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).listOutputs(args, this.originator)
  }

  async relinquishOutput(args: { basket: BasketStringUnder300Characters, output: OutpointString }): Promise<{ relinquished: true }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).relinquishOutput(args, this.originator)
  }

  async getPublicKey(args: { identityKey?: true, protocolID?: [0 | 1 | 2, ProtocolString5To400Characters], keyID?: KeyIDStringUnder800Characters, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', forSelf?: BooleanDefaultFalse }): Promise<{ publicKey: PubKeyHex }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).getPublicKey(args, this.originator)
  }

  async revealCounterpartyKeyLinkage(args: { counterparty: PubKeyHex, verifier: PubKeyHex, privilegedReason?: DescriptionString5to50Characters, privileged?: BooleanDefaultFalse }): Promise<{ prover: PubKeyHex, verifier: PubKeyHex, counterparty: PubKeyHex, revelationTime: ISOTimestampString, encryptedLinkage: Byte[], encryptedLinkageProof: Byte[] }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).revealCounterpartyKeyLinkage(args, this.originator)
  }

  async revealSpecificKeyLinkage(args: { counterparty: PubKeyHex, verifier: PubKeyHex, protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, privileged?: BooleanDefaultFalse }): Promise<{ prover: PubKeyHex, verifier: PubKeyHex, counterparty: PubKeyHex, protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, encryptedLinkage: Byte[], encryptedLinkageProof: Byte[], proofType: Byte }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).revealSpecificKeyLinkage(args, this.originator)
  }

  async encrypt(args: { plaintext: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ ciphertext: Byte[] }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).encrypt(args, this.originator)
  }

  async decrypt(args: { ciphertext: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ plaintext: Byte[] }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).decrypt(args, this.originator)
  }

  async createHmac(args: { data: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ hmac: Byte[] }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).createHmac(args, this.originator)
  }

  async verifyHmac(args: { data: Byte[], hmac: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ valid: true }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).verifyHmac(args, this.originator)
  }

  async createSignature(args: { data?: Byte[], hashToDirectlySign?: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ signature: Byte[] }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).createSignature(args, this.originator)
  }

  async verifySignature(args: { data?: Byte[], hashToDirectlyVerify?: Byte[], signature: Byte[], protocolID: [0 | 1 | 2, ProtocolString5To400Characters], keyID: KeyIDStringUnder800Characters, privilegedReason?: DescriptionString5to50Characters, counterparty?: PubKeyHex | 'self' | 'anyone', forSelf?: BooleanDefaultFalse, privileged?: BooleanDefaultFalse }): Promise<{ valid: true }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).verifySignature(args, this.originator)
  }

  async acquireCertificate(args: { type: Base64String, subject: PubKeyHex, serialNumber: Base64String, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, string>, certifier: PubKeyHex, keyringRevealer: PubKeyHex | 'certifier', keyringForSubject: Record<CertificateFieldNameUnder50Characters, Base64String>, acquisitionProtocol: 'direct' | 'issuance', certifierUrl?: string }): Promise<{ type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, string> }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).acquireCertificate(args, this.originator)
  }

  async listCertificates(args: { certifiers: PubKeyHex[], types: Base64String[], limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Characters }): Promise<{ totalCertificates: PositiveIntegerOrZero, certificates: Array<{ type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, string> }> }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).listCertificates(args, this.originator)
  }

  async proveCertificate(args: { certificate: { type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, string> }, fieldsToReveal: CertificateFieldNameUnder50Characters[], verifier: PubKeyHex, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Characters }): Promise<{ keyringForVerifier: Record<CertificateFieldNameUnder50Characters, Base64String> }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).proveCertificate(args, this.originator)
  }

  async relinquishCertificate(args: { type: Base64String, serialNumber: Base64String, certifier: PubKeyHex }): Promise<{ relinquished: true }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).relinquishCertificate(args, this.originator)
  }

  async discoverByIdentityKey(args: { identityKey: PubKeyHex, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }): Promise<{ totalCertificates: PositiveIntegerOrZero, certificates: Array<{ type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, Base64String>, certifierInfo: { name: EntityNameStringMax100Characters, iconUrl: EntityIconURLStringMax500Characters, description: DescriptionString5to50Characters, trust: PositiveIntegerMax10 }, publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>, decryptedFields: Record<CertificateFieldNameUnder50Characters, string> }> }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).discoverByIdentityKey(args, this.originator)
  }

  async discoverByAttributes(args: { attributes: Record<CertificateFieldNameUnder50Characters, string>, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }): Promise<{ totalCertificates: PositiveIntegerOrZero, certificates: Array<{ type: Base64String, subject: PubKeyHex, serialNumber: Base64String, certifier: PubKeyHex, revocationOutpoint: OutpointString, signature: HexString, fields: Record<CertificateFieldNameUnder50Characters, Base64String>, certifierInfo: { name: EntityNameStringMax100Characters, iconUrl: EntityIconURLStringMax500Characters, description: DescriptionString5to50Characters, trust: PositiveIntegerMax10 }, publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>, decryptedFields: Record<CertificateFieldNameUnder50Characters, string> }> }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).discoverByAttributes(args, this.originator)
  }

  async isAuthenticated(args: {} = {}): Promise<{ authenticated: boolean }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).isAuthenticated(args, this.originator)
  }

  async waitForAuthentication(args: {} = {}): Promise<{ authenticated: true }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).waitForAuthentication(args, this.originator)
  }

  async getHeight(args: {} = {}): Promise<{ height: PositiveInteger }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).getHeight(args, this.originator)
  }

  async getHeaderForHeight(args: { height: PositiveInteger }): Promise<{ header: HexString }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).getHeaderForHeight(args, this.originator)
  }

  async getNetwork(args: {} = {}): Promise<{ network: 'mainnet' | 'testnet' }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).getNetwork(args, this.originator)
  }

  async getVersion(args: {} = {}): Promise<{ version: VersionString7To30Characters }> {
    if (typeof this.substrate !== 'object') {
      await this.connectToSubstrate()
    }
    return await (this.substrate as Wallet).getVersion(args, this.originator)
  }
}
