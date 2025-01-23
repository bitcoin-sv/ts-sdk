import { PrivateKey } from "mod.js"
import { ProtoWallet, WalletInterface, CreateActionArgs, OriginatorDomainNameStringUnder250Bytes, CreateActionResult, SignActionArgs, SignActionResult, AbortActionArgs, AbortActionResult, ListActionsArgs, ListActionsResult, InternalizeActionArgs, InternalizeActionResult, ListOutputsArgs, ListOutputsResult, RelinquishOutputArgs, RelinquishOutputResult, AcquireCertificateArgs, AcquireCertificateResult, ListCertificatesArgs, ListCertificatesResult, ProveCertificateArgs, ProveCertificateResult, RelinquishCertificateArgs, RelinquishCertificateResult, DiscoverByIdentityKeyArgs, DiscoverCertificatesResult, DiscoverByAttributesArgs, GetHeightResult, GetHeaderArgs, GetHeaderResult, KeyDeriverApi, KeyDeriver, GetPublicKeyArgs, GetPublicKeyResult, PubKeyHex, AuthenticatedResult, GetNetworkResult, GetVersionResult } from "../../../wallet/index.js"

// Test Mock wallet which extends ProtoWallet but still implements Wallet interface
// Unsupported methods throw
export class CompletedProtoWallet extends ProtoWallet implements WalletInterface {
  constructor(rootKeyOrKeyDeriver: PrivateKey | 'anyone' | KeyDeriverApi) {
    super(rootKeyOrKeyDeriver)
    if (typeof rootKeyOrKeyDeriver['identityKey'] !== 'string') {
      rootKeyOrKeyDeriver = new KeyDeriver(rootKeyOrKeyDeriver as PrivateKey | 'anyone')
    }
    this.keyDeriver = rootKeyOrKeyDeriver as KeyDeriver
  }
  isAuthenticated(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<AuthenticatedResult> {
    throw new Error("not implemented")
  }
  waitForAuthentication(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<AuthenticatedResult> {
    throw new Error("not implemented")
  }
  getNetwork(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<GetNetworkResult> {
    throw new Error("not implemented")
  }
  getVersion(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<GetVersionResult> {
    throw new Error("not implemented")
  }
  async getPublicKey(
    args: GetPublicKeyArgs,
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ publicKey: PubKeyHex }> {
    if (args.privileged) {
      throw new Error('no privilege support')
    }
    if (args.identityKey) {
      return { publicKey: this.keyDeriver.rootKey.toPublicKey().toString() }
    } else {
      if (!args.protocolID || !args.keyID) {
        throw new Error('protocolID and keyID are required if identityKey is false or undefined.')
      }
      return {
        publicKey: this.keyDeriver
          .derivePublicKey(
            args.protocolID,
            args.keyID,
            args.counterparty || 'self',
            args.forSelf
          )
          .toString()
      }
    }
  }

  async createAction(args: CreateActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<CreateActionResult> {
    throw new Error("not implemented")
  }
  async signAction(args: SignActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<SignActionResult> {
    throw new Error("not implemented")
  }
  async abortAction(args: AbortActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<AbortActionResult> {
    throw new Error("not implemented")
  }
  async listActions(args: ListActionsArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<ListActionsResult> {
    throw new Error("not implemented")
  }
  async internalizeAction(args: InternalizeActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<InternalizeActionResult> {
    throw new Error("not implemented")
  }
  async listOutputs(args: ListOutputsArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<ListOutputsResult> {
    throw new Error("not implemented")
  }
  async relinquishOutput(args: RelinquishOutputArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<RelinquishOutputResult> {
    throw new Error("not implemented")
  }
  async acquireCertificate(args: AcquireCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<AcquireCertificateResult> {
    throw new Error("not implemented")
  }
  async listCertificates(args: ListCertificatesArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<ListCertificatesResult> {
    throw new Error("not implemented")
  }
  async proveCertificate(args: ProveCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<ProveCertificateResult> {
    throw new Error("not implemented")
  }
  async relinquishCertificate(args: RelinquishCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<RelinquishCertificateResult> {
    throw new Error("not implemented")
  }
  async discoverByIdentityKey(args: DiscoverByIdentityKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<DiscoverCertificatesResult> {
    throw new Error("not implemented")
  }
  async discoverByAttributes(args: DiscoverByAttributesArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<DiscoverCertificatesResult> {
    throw new Error("not implemented")
  }
  async getHeight(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<GetHeightResult> {
    throw new Error("not implemented")
  }
  async getHeaderForHeight(args: GetHeaderArgs, originator?: OriginatorDomainNameStringUnder250Bytes)
    : Promise<GetHeaderResult> {
    throw new Error("not implemented")
  }
}