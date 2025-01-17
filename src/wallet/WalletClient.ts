import { AcquireCertificateArgs, AcquireCertificateResult, Base64String, BasketStringUnder300Bytes, BEEF, BooleanDefaultFalse, BooleanDefaultTrue, Byte, CertificateFieldNameUnder50Bytes, CreateActionArgs, CreateActionResult, DescriptionString5to50Bytes, DiscoverCertificatesResult, EntityIconURLStringMax500Bytes, EntityNameStringMax100Bytes, HexString, InternalizeActionArgs, ISOTimestampString, KeyIDStringUnder800Bytes, LabelStringUnder300Bytes, ListActionsArgs, ListActionsResult, ListCertificatesResult, ListOutputsArgs, ListOutputsResult, OriginatorDomainNameStringUnder250Bytes, OutpointString, OutputTagStringUnder300Bytes, PositiveInteger, PositiveIntegerDefault10Max10000, PositiveIntegerMax10, PositiveIntegerOrZero, ProtocolString5To400Bytes, ProveCertificateArgs, ProveCertificateResult, PubKeyHex, SatoshiValue, SecurityLevel, SignActionArgs, SignActionResult, TXIDHexString, VersionString7To30Bytes, Wallet } from './Wallet.interfaces.js'
import WindowCWISubstrate from './substrates/window.CWI.js'
import XDMSubstrate from './substrates/XDM.js'
import WalletWireTransceiver from './substrates/WalletWireTransceiver.js'
import HTTPWalletWire from './substrates/HTTPWalletWire.js'
import HTTPWalletJSON from './substrates/HTTPWalletJSON.js'

const MAX_XDM_RESPONSE_WAIT = 200

/**
 * The SDK is how applications communicate with wallets over a communications substrate.
 */
export default class WalletClient implements Wallet {
  public substrate: 'auto' | Wallet
  originator?: OriginatorDomainNameStringUnder250Bytes
  constructor (substrate: 'auto' | 'Cicada' | 'XDM' | 'window.CWI' | 'json-api' | Wallet = 'auto', originator?: OriginatorDomainNameStringUnder250Bytes) {
    if (substrate === 'Cicada') substrate = new WalletWireTransceiver(new HTTPWalletWire(originator))
    if (substrate === 'window.CWI') substrate = new WindowCWISubstrate()
    if (substrate === 'XDM') substrate = new XDMSubstrate()
    if (substrate === 'json-api') substrate = new HTTPWalletJSON(originator)
    this.substrate = substrate
    this.originator = originator
  }

  async connectToSubstrate () {
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
        await checkSub(MAX_XDM_RESPONSE_WAIT)
        this.substrate = sub
      } catch (e) {
        try {
          sub = new WalletWireTransceiver(new HTTPWalletWire(this.originator))
          await checkSub()
          this.substrate = sub
        } catch (e) {
          try {
            sub = new HTTPWalletJSON(this.originator)
            await checkSub()
            this.substrate = sub
          } catch (e) {
            throw new Error('No wallet available over any communication substrate. Install a BSV wallet today!')
          }
        }
      }
    }
  }

  async createAction (args: CreateActionArgs): Promise<CreateActionResult> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).createAction(args, this.originator)
  }

  async signAction (args: SignActionArgs): Promise<SignActionResult> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).signAction(args, this.originator)
  }

  async abortAction (args: { reference: Base64String }): Promise<{ aborted: true }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).abortAction(args, this.originator)
  }

  async listActions (args: ListActionsArgs): Promise<ListActionsResult> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).listActions(args, this.originator)
  }

  async internalizeAction (args: InternalizeActionArgs): Promise<{ accepted: true }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).internalizeAction(args, this.originator)
  }

  async listOutputs (args: ListOutputsArgs): Promise<ListOutputsResult> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).listOutputs(args, this.originator)
  }

  async relinquishOutput (args: { basket: BasketStringUnder300Bytes, output: OutpointString }): Promise<{ relinquished: true }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).relinquishOutput(args, this.originator)
  }

  async getPublicKey (args: { identityKey?: true, protocolID?: [SecurityLevel, ProtocolString5To400Bytes], keyID?: KeyIDStringUnder800Bytes, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', forSelf?: BooleanDefaultFalse }): Promise<{ publicKey: PubKeyHex }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).getPublicKey(args, this.originator)
  }

  async revealCounterpartyKeyLinkage (args: { counterparty: PubKeyHex, verifier: PubKeyHex, privilegedReason?: DescriptionString5to50Bytes, privileged?: BooleanDefaultFalse }): Promise<{ prover: PubKeyHex, verifier: PubKeyHex, counterparty: PubKeyHex, revelationTime: ISOTimestampString, encryptedLinkage: Byte[], encryptedLinkageProof: Byte[] }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).revealCounterpartyKeyLinkage(args, this.originator)
  }

  async revealSpecificKeyLinkage (args: { counterparty: PubKeyHex, verifier: PubKeyHex, protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, privileged?: BooleanDefaultFalse }): Promise<{ prover: PubKeyHex, verifier: PubKeyHex, counterparty: PubKeyHex, protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, encryptedLinkage: Byte[], encryptedLinkageProof: Byte[], proofType: Byte }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).revealSpecificKeyLinkage(args, this.originator)
  }

  async encrypt (args: { plaintext: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ ciphertext: Byte[] }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).encrypt(args, this.originator)
  }

  async decrypt (args: { ciphertext: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ plaintext: Byte[] }> {
    return await (this.substrate as Wallet).decrypt(args, this.originator)
  }

  async createHmac (args: { data: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ hmac: Byte[] }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).createHmac(args, this.originator)
  }

  async verifyHmac (args: { data: Byte[], hmac: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ valid: true }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).verifyHmac(args, this.originator)
  }

  async createSignature (args: { data?: Byte[], hashToDirectlySign?: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ signature: Byte[] }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).createSignature(args, this.originator)
  }

  async verifySignature (args: { data?: Byte[], hashToDirectlyVerify?: Byte[], signature: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', forSelf?: BooleanDefaultFalse, privileged?: BooleanDefaultFalse }): Promise<{ valid: true }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).verifySignature(args, this.originator)
  }

  async acquireCertificate (args: AcquireCertificateArgs): Promise<AcquireCertificateResult> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).acquireCertificate(args, this.originator)
  }

  async listCertificates (args: { certifiers: PubKeyHex[], types: Base64String[], limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Bytes }): Promise<ListCertificatesResult> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).listCertificates(args, this.originator)
  }

  async proveCertificate (args: ProveCertificateArgs): Promise<ProveCertificateResult> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).proveCertificate(args, this.originator)
  }

  async relinquishCertificate (args: { type: Base64String, serialNumber: Base64String, certifier: PubKeyHex }): Promise<{ relinquished: true }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).relinquishCertificate(args, this.originator)
  }

  async discoverByIdentityKey (args: { identityKey: PubKeyHex, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }): Promise<DiscoverCertificatesResult> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).discoverByIdentityKey(args, this.originator)
  }

  async discoverByAttributes (args: { attributes: Record<CertificateFieldNameUnder50Bytes, string>, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }): Promise<DiscoverCertificatesResult> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).discoverByAttributes(args, this.originator)
  }

  async isAuthenticated (args: {} = {}): Promise<{ authenticated: boolean }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).isAuthenticated(args, this.originator)
  }

  async waitForAuthentication (args: {} = {}): Promise<{ authenticated: true }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).waitForAuthentication(args, this.originator)
  }

  async getHeight (args: {} = {}): Promise<{ height: PositiveInteger }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).getHeight(args, this.originator)
  }

  async getHeaderForHeight (args: { height: PositiveInteger }): Promise<{ header: HexString }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).getHeaderForHeight(args, this.originator)
  }

  async getNetwork (args: {} = {}): Promise<{ network: 'mainnet' | 'testnet' }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).getNetwork(args, this.originator)
  }

  async getVersion (args: {} = {}): Promise<{ version: VersionString7To30Bytes }> {
    await this.connectToSubstrate()
    return await (this.substrate as Wallet).getVersion(args, this.originator)
  }
}
