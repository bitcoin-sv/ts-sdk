import { KeyDeriver, KeyDeriverApi } from './KeyDeriver'
import { PrivateKey } from '@bsv/sdk'
import { WalletCrypto } from './WalletCrypto'
import { AbortActionArgs, AcquireCertificateArgs, CreateActionArgs, InternalizeActionArgs, ListActionsArgs, ListCertificatesArgs, ListOutputsArgs, ProveCertificateArgs, SignActionArgs, AbortActionResult, AcquireCertificateResult, AuthenticatedResult, CreateActionResult, DiscoverByAttributesArgs, DiscoverByIdentityKeyArgs, DiscoverCertificatesResult, GetHeaderArgs, GetHeaderResult, GetHeightResult, GetNetworkResult, GetVersionResult, InternalizeActionResult, ListActionsResult, ListCertificatesResult, ListOutputsResult, OriginatorDomainNameStringUnder250Bytes, ProveCertificateResult, RelinquishCertificateArgs, RelinquishCertificateResult, RelinquishOutputArgs, RelinquishOutputResult, SignActionResult, Wallet } from './Wallet.interfaces'

/**
 * A ProtoWallet is a structure that fulfills the Wallet interface, capable of performing all foundational cryptographic operations. It can derive keys, create signatures, facilitate encryption and HMAC operations, and reveal key linkages. However, ProtoWallet does not create transactions, manage outputs, interact with the blockchain, enable the management of identity certificates, or store any data.
 */
export class ProtoWallet extends WalletCrypto implements Wallet {

  constructor(rootKeyOrKeyDeriver: PrivateKey | 'anyone' | KeyDeriverApi) {
    if (typeof rootKeyOrKeyDeriver['identityKey'] !== 'string') {
      rootKeyOrKeyDeriver = new KeyDeriver(rootKeyOrKeyDeriver as PrivateKey | 'anyone')
    }
    super(rootKeyOrKeyDeriver as KeyDeriverApi)
  }

  async isAuthenticated(args: {}, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<AuthenticatedResult> {
    return { authenticated: true }
  }

  async waitForAuthentication(args: {}, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<AuthenticatedResult> {
    return { authenticated: true }
  }

  async getNetwork(args: {}, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<GetNetworkResult> {
    return { network: 'mainnet' }
  }

  async getVersion(args: {}, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<GetVersionResult> {
    return { version: 'proto-1.0.0' }
  }

  async createAction(args: CreateActionArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<CreateActionResult> {
    throw new Error('ProtoWallet does not support creating transactions.')
  }

  async signAction(args: SignActionArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<SignActionResult> {
    throw new Error('ProtoWallet does not support creating transactions.')
  }

  async abortAction(args: AbortActionArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<AbortActionResult> {
    throw new Error('ProtoWallet does not support aborting transactions.')
  }

  async listActions(args: ListActionsArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<ListActionsResult> {
    throw new Error('ProtoWallet does not support retrieving transactions.')
  }

  async internalizeAction(args: InternalizeActionArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<InternalizeActionResult> {
    throw new Error('ProtoWallet does not support internalizing transactions.')
  }

  async listOutputs(args: ListOutputsArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<ListOutputsResult> {
    throw new Error('ProtoWallet does not support retrieving outputs.')
  }

  async relinquishOutput(args: RelinquishOutputArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<RelinquishOutputResult> {
    throw new Error('ProtoWallet does not support deleting outputs.')
  }

  async acquireCertificate(args: AcquireCertificateArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<AcquireCertificateResult> {
    throw new Error('ProtoWallet does not support acquiring certificates.')
  }

  async listCertificates(args: ListCertificatesArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<ListCertificatesResult> {
    throw new Error('ProtoWallet does not support retrieving certificates.')
  }

  async proveCertificate(args: ProveCertificateArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<ProveCertificateResult> {
    throw new Error('ProtoWallet does not support proving certificates.')
  }

  async relinquishCertificate(args: RelinquishCertificateArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<RelinquishCertificateResult> {
    throw new Error('ProtoWallet does not support deleting certificates.')
  }

  async discoverByIdentityKey(args: DiscoverByIdentityKeyArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<DiscoverCertificatesResult> {
    throw new Error('ProtoWallet does not support resolving identities.')
  }

  async discoverByAttributes(args: DiscoverByAttributesArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<DiscoverCertificatesResult> {
    throw new Error('ProtoWallet does not support resolving identities.')
  }

  async getHeight(args: {}, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<GetHeightResult> {
    throw new Error('ProtoWallet does not support blockchain tracking.')
  }

  async getHeaderForHeight(args: GetHeaderArgs, Originator?: OriginatorDomainNameStringUnder250Bytes): Promise<GetHeaderResult> {
    throw new Error('ProtoWallet does not support blockchain tracking.')
  }
}
