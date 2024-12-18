import { Wallet, CreateActionArgs, OriginatorDomainNameStringUnder250Bytes, CreateActionResult, BooleanDefaultTrue, AcquireCertificateArgs, AcquireCertificateResult, Base64String, BasketStringUnder300Bytes, BooleanDefaultFalse, Byte, CertificateFieldNameUnder50Bytes, DescriptionString5to50Bytes, DiscoverCertificatesResult, EntityIconURLStringMax500Bytes, EntityNameStringMax100Bytes, HexString, InternalizeActionArgs, ISOTimestampString, KeyIDStringUnder800Bytes, ListActionsArgs, ListActionsResult, ListCertificatesResult, ListOutputsArgs, ListOutputsResult, OutpointString, PositiveInteger, PositiveIntegerDefault10Max10000, PositiveIntegerMax10, PositiveIntegerOrZero, ProtocolString5To400Bytes, ProveCertificateArgs, ProveCertificateResult, PubKeyHex, SecurityLevel, SignActionArgs, SignActionResult, VersionString7To30Bytes } from '../Wallet.interfaces.js'

export default class HTTPWalletJSON implements Wallet {
  baseUrl: string
  httpClient: typeof fetch
  originator: OriginatorDomainNameStringUnder250Bytes | undefined
  api: (call: string, args: any) => Promise<any>

  constructor(originator: OriginatorDomainNameStringUnder250Bytes | undefined, baseUrl: string = 'http://localhost:3321', httpClient = fetch) {
    this.baseUrl = baseUrl
    this.originator = originator
    this.httpClient = httpClient
    this.api = async (call, args) => {
      try {
        const response = await (await httpClient(`${this.baseUrl}/${call}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Originator': this.originator
          },
          body: JSON.stringify(args)
        })).json()
        return response
      } catch (error) {
        console.log({ 'HTTPWalletJSON': { call, args, error }})
        throw error
      }
    }
  }

  async createAction(args: CreateActionArgs): Promise<CreateActionResult> {
    return await this.api('createAction', args)
  }

  async signAction(args: SignActionArgs): Promise<SignActionResult> {
    return await this.api('signAction', args)
  }

  async abortAction(args: { reference: Base64String }): Promise<{ aborted: true }> {
    return await this.api('abortAction', args)
  }

  async listActions(args: ListActionsArgs): Promise<ListActionsResult> {
    return await this.api('listActions', args)
  }

  async internalizeAction(args: InternalizeActionArgs): Promise<{ accepted: true }> {
    return await this.api('internalizeAction', args)
  }

  async listOutputs(args: ListOutputsArgs): Promise<ListOutputsResult> {
    return await this.api('listOutputs', args)
  }

  async relinquishOutput(args: { basket: BasketStringUnder300Bytes, output: OutpointString }): Promise<{ relinquished: true }> {
    return await this.api('relinquishOutput', args)
  }

  async getPublicKey(args: { seekPermission?: BooleanDefaultTrue, identityKey?: true, protocolID?: [SecurityLevel, ProtocolString5To400Bytes], keyID?: KeyIDStringUnder800Bytes, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', forSelf?: BooleanDefaultFalse }): Promise<{ publicKey: PubKeyHex }> {
    return await this.api('getPublicKey', args)
  }

  async revealCounterpartyKeyLinkage(args: { counterparty: PubKeyHex, verifier: PubKeyHex, privilegedReason?: DescriptionString5to50Bytes, privileged?: BooleanDefaultFalse }): Promise<{ prover: PubKeyHex, verifier: PubKeyHex, counterparty: PubKeyHex, revelationTime: ISOTimestampString, encryptedLinkage: Byte[], encryptedLinkageProof: number[] }> {
    return await this.api('revealCounterpartyKeyLinkage', args)
  }

  async revealSpecificKeyLinkage(args: { counterparty: PubKeyHex, verifier: PubKeyHex, protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, privileged?: BooleanDefaultFalse }): Promise<{ prover: PubKeyHex, verifier: PubKeyHex, counterparty: PubKeyHex, protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, encryptedLinkage: Byte[], encryptedLinkageProof: Byte[], proofType: Byte }> {
    return await this.api('revealSpecificKeyLinkage', args)
  }

  async encrypt(args: { seekPermission?: BooleanDefaultTrue, plaintext: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ ciphertext: Byte[] }> {
    return await this.api('encrypt', args)
  }

  async decrypt(args: { seekPermission?: BooleanDefaultTrue, ciphertext: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ plaintext: Byte[] }> {
    return await this.api('decrypt', args)
  }

  async createHmac(args: { seekPermission?: BooleanDefaultTrue, data: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ hmac: Byte[] }> {
    return await this.api('createHmac', args)
  }

  async verifyHmac(args: { seekPermission?: BooleanDefaultTrue, data: Byte[], hmac: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ valid: true }> {
    return await this.api('verifyHmac', args)
  }

  async createSignature(args: { seekPermission?: BooleanDefaultTrue, data?: Byte[], hashToDirectlySign?: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }): Promise<{ signature: Byte[] }> {
    return await this.api('createSignature', args)
  }

  async verifySignature(args: { seekPermission?: BooleanDefaultTrue, data?: Byte[], hashToDirectlyVerify?: Byte[], signature: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', forSelf?: BooleanDefaultFalse, privileged?: BooleanDefaultFalse }): Promise<{ valid: true }> {
    return await this.api('verifySignature', args)
  }

  async acquireCertificate(args: AcquireCertificateArgs): Promise<AcquireCertificateResult> {
    return await this.api('acquireCertificate', args)
  }

  async listCertificates(args: { certifiers: PubKeyHex[], types: Base64String[], limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Bytes }): Promise<ListCertificatesResult> {
    return await this.api('listCertificates', args)
  }

  async proveCertificate(args: ProveCertificateArgs): Promise<ProveCertificateResult> {
    return await this.api('proveCertificate', args)
  }

  async relinquishCertificate(args: { type: Base64String, serialNumber: Base64String, certifier: PubKeyHex }): Promise<{ relinquished: true }> {
    return await this.api('relinquishCertificate', args)
  }

  async discoverByIdentityKey(args: { seekPermission?: BooleanDefaultTrue, identityKey: PubKeyHex, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }): Promise<DiscoverCertificatesResult> {
    return await this.api('discoverByIdentityKey', args)
  }

  async discoverByAttributes(args: { seekPermission?: BooleanDefaultTrue, attributes: Record<CertificateFieldNameUnder50Bytes, string>, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }): Promise<DiscoverCertificatesResult> {
    return await this.api('discoverByAttributes', args)
  }

  async isAuthenticated(args: {}): Promise<{ authenticated: boolean }> {
    return await this.api('isAuthenticated', args)
  }

  async waitForAuthentication(args: {}): Promise<{ authenticated: true }> {
    return await this.api('waitForAuthentication', args)
  }

  async getHeight(args: {}): Promise<{ height: PositiveInteger }> {
    return await this.api('getHeight', args)
  }

  async getHeaderForHeight(args: { height: PositiveInteger }): Promise<{ header: HexString }> {
    return await this.api('getHeaderForHeight', args)
  }

  async getNetwork(args: {}): Promise<{ network: 'mainnet' | 'testnet' }> {
    return await this.api('getNetwork', args)
  }

  async getVersion(args: {}): Promise<{ version: VersionString7To30Bytes }> {
    return await this.api('getVersion', args)
  }
}