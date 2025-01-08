import { sdk } from "..";

/**
 * Subset of `NinjaApi` interface and `NinjaBase` methods and properties that are required to support
 * the `NinjaWallet` implementation of the `Wallet.interface` API
 */
export interface WalletSigner {
  chain?: sdk.Chain
  isAuthenticated(): boolean;
  getClientChangeKeyPair(): KeyPair;
  keyDeriver?: sdk.KeyDeriverApi
  storageIdentity?: StorageIdentity

  setServices(v: sdk.WalletServices) : void
  getServices() : sdk.WalletServices

  authenticate(identityKey?: string, addIfNew?: boolean): Promise<void>

  listActions(vargs: sdk.ValidListActionsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListActionsResult>
  listOutputs(vargs: sdk.ValidListOutputsArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ListOutputsResult>
  createActionSdk(vargs: sdk.ValidCreateActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.CreateActionResult>
  signActionSdk(vargs: sdk.ValidSignActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.SignActionResult>
  abortActionSdk(vargs: sdk.ValidAbortActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.AbortActionResult>
  internalizeActionSdk(vargs: sdk.ValidInternalizeActionArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.InternalizeActionResult>
  relinquishOutputSdk(vargs: sdk.ValidRelinquishOutputArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.RelinquishOutputResult>

  acquireCertificateSdk(vargs: sdk.ValidAcquireDirectCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.AcquireCertificateResult>
  listCertificatesSdk(vargs: sdk.ValidListCertificatesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes) : Promise<sdk.ListCertificatesResult>
  proveCertificateSdk(vargs: sdk.ValidProveCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.ProveCertificateResult>
  relinquishCertificateSdk(vargs: sdk.ValidRelinquishCertificateArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.RelinquishCertificateResult>
  discoverByIdentityKeySdk(vargs: sdk.ValidDiscoverByIdentityKeyArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult>
  discoverByAttributesSdk(vargs: sdk.ValidDiscoverByAttributesArgs, originator?: sdk.OriginatorDomainNameStringUnder250Bytes): Promise<sdk.DiscoverCertificatesResult>

  getChain(): Promise<sdk.Chain>
}

export interface KeyPair {
  privateKey: string
  publicKey: string
}

export interface StorageIdentity {
   /**
    * The identity key (public key) assigned to this storage
    */
   storageIdentityKey: string
   /**
    * The human readable name assigned to this storage.
    */
   storageName: string
}

export interface EntityTimeStamp {
    created_at: Date
    updated_at: Date
}
