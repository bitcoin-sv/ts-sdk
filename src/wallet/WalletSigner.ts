import {
  AbortActionArgs,
  AbortActionResult,
  AcquireCertificateArgs,
  AcquireCertificateResult,
  Base64String,
  BasketStringUnder300Bytes,
  BEEF,
  BooleanDefaultFalse,
  BooleanDefaultTrue,
  Byte,
  CertificateFieldNameUnder50Bytes,
  CreateActionArgs,
  CreateActionResult,
  CreateHmacArgs,
  CreateSignatureArgs,
  DescriptionString5to50Bytes,
  DiscoverByAttributesArgs,
  DiscoverByIdentityKeyArgs,
  DiscoverCertificatesResult,
  EntityIconURLStringMax500Bytes,
  EntityNameStringMax100Bytes,
  GetPublicKeyArgs,
  HexString,
  InternalizeActionArgs,
  InternalizeActionResult,
  ISOTimestampString,
  KeyIDStringUnder800Bytes,
  LabelStringUnder300Bytes,
  ListActionsArgs,
  ListActionsResult,
  ListCertificatesArgs,
  ListCertificatesResult,
  ListOutputsArgs,
  ListOutputsResult,
  OriginatorDomainNameStringUnder250Bytes,
  OutpointString,
  OutputTagStringUnder300Bytes,
  PositiveInteger,
  PositiveIntegerDefault10Max10000,
  PositiveIntegerMax10,
  PositiveIntegerOrZero,
  ProtocolString5To400Bytes,
  ProveCertificateArgs,
  ProveCertificateResult,
  PubKeyHex,
  RelinquishCertificateArgs,
  RevealCounterpartyKeyLinkageArgs,
  RevealCounterpartyKeyLinkageResult,
  RevealSpecificKeyLinkageArgs,
  RevealSpecificKeyLinkageResult,
  SatoshiValue,
  SecurityLevel,
  SignActionArgs,
  SignActionResult,
  TXIDHexString,
  VerifyHmacArgs,
  VerifySignatureArgs,
  VersionString7To30Bytes,
  Wallet,
  WalletDecryptArgs,
  WalletEncryptArgs,
  WalletCertificate
} from './Wallet.interfaces.js'
import KeyDeriver from './KeyDeriver.js'
import { PrivateKey, Hash, ECDSA, BigNumber, Signature, Schnorr, PublicKey, Point, Utils } from '../primitives/index.js'
import walletErrors, { WalletError } from './WalletError.js'
import ProtoWallet from './ProtoWallet.js'
import { createMasterCertificate, createVerifiableCertificate, MasterCertificate, VerifiableCertificate, SymmetricKey, Beef, BeefParty } from 'mod.js'
import { createActionSdk } from './createActionSdk.js'
import { validateCreateActionArgs } from './validationHelpers.js'

interface WalletStorage {
  storageIdentityKey: string
  syncWith(foreignPeer: WalletStorage): Promise<void>
  listActions(args: ListActionsArgs): Promise<ListActionsResult>
  internalizeAction(args: InternalizeActionArgs): Promise<InternalizeActionResult>
  listOutputs(args: ListOutputsArgs): Promise<ListOutputsResult>
  getHeight(): Promise<PositiveInteger>
  getHeaderForHeight(args: { height: PositiveInteger }): Promise<{ header: HexString }>
  relinquishOutput(args: { basket: BasketStringUnder300Bytes, output: OutpointString }): Promise<void>
  listCertificates(args: ListCertificatesArgs): Promise<ListCertificatesResult>
  findMasterKeyringForCertificate(type: Base64String, serialNumber: Base64String): Promise<Record<CertificateFieldNameUnder50Bytes, Base64String>>
  storeCertificateAndMasterKeyring(certificate: WalletCertificate, keyring: Record<CertificateFieldNameUnder50Bytes, Base64String>): Promise<void>
  relinquishCertificate(args: RelinquishCertificateArgs): Promise<void>
}

// TODO: Move to types
interface KeyPair {
  privateKey: string
  publicKey: string
}

// type Network = 'mainnet' | 'testnet';

/**
 * A WalletSigner is a structure that fulfills the Wallet interface, capable of performing all foundational cryptographic operations. It can derive keys, create signatures, facilitate encryption and HMAC operations, and reveal key linkages. However, ProtoWallet does not create transactions, manage outputs, interact with the blockchain, enable the management of identity certificates, or store any data.
 */
export default class WalletSigner implements Wallet {
  keyDeriver: KeyDeriver
  network: 'mainnet' | 'testnet'
  activeStorageProvider: WalletStorage
  auxiliaryStorageProviders: WalletStorage[]
  proto: ProtoWallet
  syncAfterWrite: boolean
  privilegedError: string =
    'ProtoWallet is a single-keyring wallet, operating without context about whether its configured keyring is privileged.'

  beef: BeefParty
  storageParty: string
  userParty: string

  constructor(
    rootKey: PrivateKey | 'anyone',
    storageProviders: WalletStorage[],
    network: 'mainnet' | 'testnet' = 'mainnet',
    syncAfterWrite: boolean = false,
    KeyDeriverClass = KeyDeriver
  ) {
    this.keyDeriver = new KeyDeriverClass(rootKey)
    this.activeStorageProvider = storageProviders[0]
    this.auxiliaryStorageProviders = storageProviders.splice(1)
    this.network = network
    this.proto = new ProtoWallet(rootKey, KeyDeriverClass)
    this.syncAfterWrite = syncAfterWrite

    // Construct signer BEEF parties
    this.storageParty = this.activeStorageProvider.storageIdentityKey
    this.userParty = this.getClientChangeKeyPair().publicKey
    this.beef = new BeefParty([this.storageParty, this.userParty])
  }

  private async syncPrimaryStorageToAuxiliary() {
    for (const aux of this.auxiliaryStorageProviders) {
      try {
        await aux.syncWith(this.activeStorageProvider)
      } catch (e) {
        continue
      }
    }
  }

  async createAction(args: CreateActionArgs): Promise<CreateActionResult> {
    const vargs = validateCreateActionArgs(args)
    vargs.options.knownTxids = this.getKnownTxids(vargs.options.knownTxids)

    const r = await createActionSdk(this, vargs)

    if (r.signableTransaction) {
      const st = r.signableTransaction
      const ab = Beef.fromBinary(st.tx)
      if (!ab.atomicTxid)
        throw new WalletError('Missing atomicTxid in signableTransaction result')
      if (ab.txs.length < 1 || ab.txs[ab.txs.length - 1].txid !== ab.atomicTxid)
        throw new WalletError('atomicTxid does not match txid of last AtomicBEEF transaction')
      // Remove the new, partially constructed transaction from beef as it will never be a valid transaction.
      ab.txs.slice(ab.txs.length - 1)
      this.beef.mergeBeefFromParty(this.storageParty, ab)
    } else if (r.tx) {
      this.beef.mergeBeefFromParty(this.storageParty, r.tx)
    }

    if (this.syncAfterWrite) {
      await this.syncPrimaryStorageToAuxiliary()
    }

    return r
  }

  async signAction(args: SignActionArgs): Promise<SignActionResult> {
    throw new Error('todo')
  }

  async abortAction(args: AbortActionArgs): Promise<AbortActionResult> {
    throw new Error('todo')
  }

  async listActions(args: ListActionsArgs): Promise<ListActionsResult> {
    return this.activeStorageProvider.listActions(args)
  }

  internalizeAction(args: InternalizeActionArgs): Promise<InternalizeActionResult> {
    return this.activeStorageProvider.internalizeAction(args)
  }

  listOutputs(args: ListOutputsArgs): Promise<ListOutputsResult> {
    return this.activeStorageProvider.listOutputs(args)
  }

  async relinquishOutput(args: {
    basket: BasketStringUnder300Bytes
    output: OutpointString
  }): Promise<{ relinquished: true }> {
    await this.activeStorageProvider.relinquishOutput(args)
    if (this.syncAfterWrite) {
      await this.syncPrimaryStorageToAuxiliary()
    }
    return { relinquished: true }
  }

  async getPublicKey(args: GetPublicKeyArgs): Promise<{ publicKey: PubKeyHex }> {
    return this.proto.getPublicKey(args)
  }

  async revealCounterpartyKeyLinkage(args: RevealCounterpartyKeyLinkageArgs): Promise<RevealCounterpartyKeyLinkageResult> {
    return this.proto.revealCounterpartyKeyLinkage(args)
  }

  async revealSpecificKeyLinkage(args: RevealSpecificKeyLinkageArgs): Promise<RevealSpecificKeyLinkageResult> {
    return this.proto.revealSpecificKeyLinkage(args)
  }

  async encrypt(args: WalletEncryptArgs): Promise<{ ciphertext: Byte[] }> {
    return this.proto.encrypt(args)
  }

  async decrypt(args: WalletDecryptArgs): Promise<{ plaintext: Byte[] }> {
    return this.proto.decrypt(args)
  }

  async createHmac(args: CreateHmacArgs): Promise<{ hmac: Byte[] }> {
    return this.proto.createHmac(args)
  }

  async verifyHmac(args: VerifyHmacArgs): Promise<{ valid: true }> {
    return this.proto.verifyHmac(args)
  }

  async createSignature(args: CreateSignatureArgs): Promise<{ signature: Byte[] }> {
    return this.proto.createSignature(args)
  }

  async verifySignature(args: VerifySignatureArgs): Promise<{ valid: true }> {
    return this.proto.verifySignature(args)
  }

  async acquireCertificate(args: AcquireCertificateArgs): Promise<AcquireCertificateResult> {
    if (args.privileged) {
      throw new WalletError(this.privilegedError)
    }
    const { publicKey: ourIdentityKey } = await this.proto.getPublicKey({ identityKey: true })
    if (args.acquisitionProtocol === 'direct') {
      let actualKeyringRevealer: PubKeyHex
      if (!args.keyringRevealer || args.keyringRevealer === 'certifier') {
        actualKeyringRevealer = args.certifier
      } else {
        actualKeyringRevealer = args.keyringRevealer
      }
      // Validate that all fields are provided in the keyring
      if (Object.keys(args.fields).length !== Object.keys(args.keyringForSubject).length) {
        throw new WalletError('Keyring for subject does not include all fields')
      }
      if (Object.keys(args.fields).some(field => (!args.keyringForSubject[field]))) {
        throw new WalletError('Keyring for subject does not include all fields')
      }
      // Decrypt the keyring and build the correct "self" master keyring
      const masterKeyringForSelf = {}
      for (const fieldName of Object.keys(args.fields)) {
        const keyID = `${args.serialNumber} ${fieldName}`
        const encryptedMasterFieldKey = args.keyringForSubject[fieldName]

        // Decrypt the master field key
        const { plaintext: masterFieldKey } = await this.proto.decrypt({
          ciphertext: Utils.toArray(encryptedMasterFieldKey, 'base64'),
          protocolID: [2, 'certificate field encryption'],
          keyID,
          counterparty: actualKeyringRevealer
        })

        // Verify that derived key actually decrypts requested field
        try {
          new SymmetricKey(masterFieldKey).decrypt(Utils.toArray(args.fields[fieldName], 'base64'))
        } catch (_) {
          throw new WalletError(`Decryption of the "${fieldName}" field with its revelation key failed.`)
        }

        // Encrypt masterFieldKey for self
        const { ciphertext: encryptedFieldRevelationKey } = await this.proto.encrypt({
          plaintext: masterFieldKey,
          protocolID: [2, 'certificate field encryption'],
          keyID: `${args.serialNumber} ${fieldName}`,
          counterparty: 'self'
        })

        // Add encryptedFieldRevelationKey to fieldRevelationKeyring
        masterKeyringForSelf[fieldName] = Utils.toBase64(encryptedFieldRevelationKey)
      }

      const cert: WalletCertificate = {
        type: args.type,
        serialNumber: args.serialNumber,
        subject: ourIdentityKey,
        certifier: args.certifier,
        fields: args.fields,
        revocationOutpoint: args.revocationOutpoint,
        signature: args.signature!
      }
      await this.activeStorageProvider.storeCertificateAndMasterKeyring(cert, masterKeyringForSelf)
      if (this.syncAfterWrite) {
        await this.syncPrimaryStorageToAuxiliary()
      }
      return cert
    } else if (args.acquisitionProtocol === 'issuance') {
      // TODO: Pull code from CWI Core
      // Put this code into a private method for talking to a certifier
      // Get the certificate and store it with `await this.activeStorageProvider.storeCertificateAndMasterKeyring(cert, masterKeyringForSelf)`
      // Get certificate from backend
      // Validate that we can actually decrypt the master keyring
      // Store certificate and master keyring

      // store

      if (this.syncAfterWrite) {
        await this.syncPrimaryStorageToAuxiliary()
      }
    } else {
      throw new WalletError(`Unknown certificate acquisition protocol: ${args.acquisitionProtocol}`)
    }
  }

  async listCertificates(args: ListCertificatesArgs): Promise<ListCertificatesResult> {
    return await this.activeStorageProvider.listCertificates(args)
  }

  async proveCertificate(
    args: ProveCertificateArgs
  ): Promise<ProveCertificateResult> {
    if (args.privileged) {
      throw new WalletError(this.privilegedError)
    }
    const masterKeyring = await this.activeStorageProvider.findMasterKeyringForCertificate(
      args.certificate.type,
      args.certificate.serialNumber
    )
    const masterCertificate = new MasterCertificate(
      args.certificate.type,
      args.certificate.serialNumber,
      args.certificate.subject,
      args.certificate.certifier,
      args.certificate.revocationOutpoint,
      args.certificate.fields,
      masterKeyring,
      args.certificate.signature
    )
    const keyringForVerifier = await masterCertificate.createKeyringForVerifier(
      this.proto,
      args.verifier,
      args.fieldsToReveal
    )
    return {
      keyringForVerifier
    }
  }

  async relinquishCertificate(args: RelinquishCertificateArgs): Promise<{ relinquished: true }> {
    await this.activeStorageProvider.relinquishCertificate(args)
    if (this.syncAfterWrite) {
      await this.syncPrimaryStorageToAuxiliary()
    }
    return { relinquished: true }
  }

  async discoverByIdentityKey(args: DiscoverByIdentityKeyArgs): Promise<DiscoverCertificatesResult> {
    // SOW E
    throw new Error('todo')
  }

  async discoverByAttributes(args: DiscoverByAttributesArgs): Promise<DiscoverCertificatesResult> {
    // SOW E
    throw new Error('todo')
  }

  async isAuthenticated(args: {}): Promise<{ authenticated: boolean }> {
    return { authenticated: true }
  }

  async waitForAuthentication(args: {}): Promise<{ authenticated: true }> {
    return { authenticated: true }
  }

  async getHeight(args: {}): Promise<{ height: PositiveInteger }> {
    const height = await this.activeStorageProvider.getHeight()
    return { height }
  }

  async getHeaderForHeight(args: { height: PositiveInteger }): Promise<{ header: HexString }> {
    return this.activeStorageProvider.getHeaderForHeight(args)
  }

  async getNetwork(args: {}): Promise<{ network: 'mainnet' | 'testnet' }> {
    return { network: this.network }
  }

  async getVersion(args: {}): Promise<{ version: VersionString7To30Bytes }> {
    return { version: 'signer-1.0.0' }
  }

  // Helper methods
  private getKnownTxids(newKnownTxids?: string[]): string[] {
    if (newKnownTxids) {
      for (const txid of newKnownTxids) this.beef.mergeTxidOnly(txid)
    }
    const r = this.beef.sortTxs()
    const knownTxids = r.valid.concat(r.txidOnly)
    return knownTxids
  }

  private getClientChangeKeyPair(): KeyPair {
    const kp: KeyPair = {
      privateKey: this.keyDeriver.rootKey.toString(),
      publicKey: this.keyDeriver.rootKey.toPublicKey().toString()
    }
    return kp
  }
}
