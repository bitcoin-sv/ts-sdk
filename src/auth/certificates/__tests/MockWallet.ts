import { PrivateKey } from "mod.js"
import { ProtoWallet, Wallet, CreateActionArgs, OriginatorDomainNameStringUnder250Bytes, CreateActionResult, SignActionArgs, SignActionResult, AbortActionArgs, AbortActionResult, ListActionsArgs, ListActionsResult, InternalizeActionArgs, InternalizeActionResult, ListOutputsArgs, ListOutputsResult, RelinquishOutputArgs, RelinquishOutputResult, AcquireCertificateArgs, AcquireCertificateResult, ListCertificatesArgs, ListCertificatesResult, ProveCertificateArgs, ProveCertificateResult, RelinquishCertificateArgs, RelinquishCertificateResult, DiscoverByIdentityKeyArgs, DiscoverCertificatesResult, DiscoverByAttributesArgs, GetHeightResult, GetHeaderArgs, GetHeaderResult, KeyDeriverApi, KeyDeriver, GetPublicKeyArgs, GetPublicKeyResult } from "../../../wallet/index.js"

export class CompletedProtoWallet extends ProtoWallet implements Wallet {
  declare getPublicKey: (args: GetPublicKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetPublicKeyResult>

  constructor(rootKeyOrKeyDeriver: PrivateKey | 'anyone' | KeyDeriverApi) {
    super(rootKeyOrKeyDeriver)
    if (typeof rootKeyOrKeyDeriver['identityKey'] !== 'string') {
      rootKeyOrKeyDeriver = new KeyDeriver(rootKeyOrKeyDeriver as PrivateKey | 'anyone')
    }
    this.keyDeriver = rootKeyOrKeyDeriver as KeyDeriver
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