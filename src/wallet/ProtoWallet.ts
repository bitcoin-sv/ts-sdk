import {
  Base64String,
  BasketStringUnder300Bytes,
  BEEF,
  BooleanDefaultFalse,
  BooleanDefaultTrue,
  Byte,
  CertificateFieldNameUnder50Bytes,
  DescriptionString5to50Bytes,
  EntityIconURLStringMax500Bytes,
  EntityNameStringMax100Bytes,
  HexString,
  ISOTimestampString,
  KeyIDStringUnder800Bytes,
  LabelStringUnder300Bytes,
  OriginatorDomainNameStringUnder250Bytes,
  OutpointString,
  OutputTagStringUnder300Bytes,
  PositiveInteger,
  PositiveIntegerDefault10Max10000,
  PositiveIntegerMax10,
  PositiveIntegerOrZero,
  ProtocolString5To400Bytes,
  PubKeyHex,
  SatoshiValue,
  SecurityLevel,
  TXIDHexString,
  VersionString7To30Bytes,
  Wallet
} from './Wallet.interfaces.js'
import KeyDeriver from './KeyDeriver.js'
import { PrivateKey, Hash, ECDSA, BigNumber, Signature, Schnorr, PublicKey, Point } from '../primitives/index.js'
import walletErrors, { WalletError } from './WalletError.js'

/**
 * A ProtoWallet is a structure that fulfills the Wallet interface, capable of performing all foundational cryptographic operations. It can derive keys, create signatures, facilitate encryption and HMAC operations, and reveal key linkages. However, ProtoWallet does not create transactions, manage outputs, interact with the blockchain, enable the management of identity certificates, or store any data.
 */
export default class ProtoWallet implements Wallet {
  keyDeriver: KeyDeriver
  privilegedError: string =
    'ProtoWallet is a single-keyring wallet, operating without context about whether its configured keyring is privileged.'

  constructor (rootKey: PrivateKey | 'anyone', KeyDeriverClass = KeyDeriver) {
    this.keyDeriver = new KeyDeriverClass(rootKey)
  }

  async createAction (
    args: {
      description: DescriptionString5to50Bytes
      inputs?: Array<{
        tx?: BEEF
        outpoint: OutpointString
        unlockingScript?: HexString
        unlockingScriptLength?: PositiveInteger
        inputDescription: DescriptionString5to50Bytes
        sequenceNumber?: PositiveIntegerOrZero
      }>
      outputs?: Array<{
        lockingScript: HexString
        satoshis: SatoshiValue
        outputDescription: DescriptionString5to50Bytes
        basket?: BasketStringUnder300Bytes
        customInstructions?: string
        tags?: OutputTagStringUnder300Bytes[]
      }>
      lockTime?: PositiveIntegerOrZero
      version?: PositiveIntegerOrZero
      labels?: LabelStringUnder300Bytes[]
      options?: {
        signAndProcess?: BooleanDefaultTrue
        acceptDelayedBroadcast?: BooleanDefaultTrue
        trustSelf?: 'known'
        knownTxids?: TXIDHexString[]
        returnTXIDOnly?: BooleanDefaultFalse
        noSend?: BooleanDefaultFalse
        noSendChange?: OutpointString[]
        sendWith?: TXIDHexString[]
        randomizeOutputs?: BooleanDefaultTrue
      }
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{
      txid?: TXIDHexString
      tx?: BEEF
      noSendChange?: OutpointString[]
      sendWithResults?: Array<{
        txid: TXIDHexString
        status: 'unproven' | 'sending' | 'failed'
      }>
      signableTransaction?: {
        tx: BEEF
        reference: Base64String
      }
    }> {
    throw new WalletError('ProtoWallet does not support creating transactions.', walletErrors.unsupportedAction)
  }

  async signAction (
    args: {
      spends: Record<
      PositiveIntegerOrZero,
      {
        unlockingScript: HexString
        sequenceNumber?: PositiveIntegerOrZero
      }
      >
      reference: Base64String
      options?: {
        acceptDelayedBroadcast?: BooleanDefaultTrue
        returnTXIDOnly?: BooleanDefaultFalse
        noSend?: BooleanDefaultFalse
        noSendChange?: OutpointString[]
        sendWith?: TXIDHexString[]
      }
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{
      txid?: TXIDHexString
      tx?: BEEF
      noSendChange?: OutpointString[]
      sendWithResults?: Array<{
        txid: TXIDHexString
        status: 'unproven' | 'sending' | 'failed'
      }>
    }> {
    throw new WalletError('ProtoWallet does not support creating transactions.', walletErrors.unsupportedAction)
  }

  async abortAction (
    args: {
      reference: Base64String
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ aborted: true }> {
    throw new WalletError('ProtoWallet does not support aborting transactions.', walletErrors.unsupportedAction)
  }

  async listActions (
    args: {
      labels: LabelStringUnder300Bytes[]
      labelQueryMode?: 'any' | 'all'
      includeLabels?: BooleanDefaultFalse
      includeInputs?: BooleanDefaultFalse
      includeInputSourceLockingScripts?: BooleanDefaultFalse
      includeInputUnlockingScripts?: BooleanDefaultFalse
      includeOutputs?: BooleanDefaultFalse
      includeOutputLockingScripts?: BooleanDefaultFalse
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{
      totalActions: PositiveIntegerOrZero
      actions: Array<{
        txid: TXIDHexString
        satoshis: SatoshiValue
        status:
        | 'completed'
        | 'unprocessed'
        | 'sending'
        | 'unproven'
        | 'unsigned'
        | 'nosend'
        | 'nonfinal'
        isOutgoing: boolean
        description: DescriptionString5to50Bytes
        labels?: LabelStringUnder300Bytes[]
        version: PositiveIntegerOrZero
        lockTime: PositiveIntegerOrZero
        inputs?: Array<{
          sourceOutpoint: OutpointString
          sourceSatoshis: SatoshiValue
          sourceLockingScript?: HexString
          unlockingScript?: HexString
          inputDescription: DescriptionString5to50Bytes
          sequenceNumber: PositiveIntegerOrZero
        }>
        outputs?: Array<{
          outputIndex: PositiveIntegerOrZero
          satoshis: SatoshiValue
          lockingScript?: HexString
          spendable: boolean
          outputDescription: DescriptionString5to50Bytes
          basket: BasketStringUnder300Bytes
          tags: OutputTagStringUnder300Bytes[]
          customInstructions?: string
        }>
      }>
    }> {
    throw new WalletError('ProtoWallet does not support retrieving transactions.', walletErrors.unsupportedAction)
  }

  async internalizeAction (
    args: {
      tx: BEEF
      outputs: Array<{
        outputIndex: PositiveIntegerOrZero
        protocol: 'wallet payment' | 'basket insertion'
        paymentRemittance?: {
          derivationPrefix: Base64String
          derivationSuffix: Base64String
          senderIdentityKey: PubKeyHex
        }
        insertionRemittance?: {
          basket: BasketStringUnder300Bytes
          customInstructions?: string
          tags?: OutputTagStringUnder300Bytes[]
        }
      }>
      description: DescriptionString5to50Bytes
      labels?: LabelStringUnder300Bytes[]
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ accepted: true }> {
    throw new WalletError('ProtoWallet does not support internalizing transactions.', walletErrors.unsupportedAction)
  }

  async listOutputs (
    args: {
      basket: BasketStringUnder300Bytes
      tags?: OutputTagStringUnder300Bytes[]
      tagQueryMode?: 'all' | 'any'
      include?: 'locking scripts' | 'entire transactions'
      includeCustomInstructions?: BooleanDefaultFalse
      includeTags?: BooleanDefaultFalse
      includeLabels?: BooleanDefaultFalse
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{
      totalOutputs: PositiveIntegerOrZero
      outputs: Array<{
        outpoint: OutpointString
        satoshis: SatoshiValue
        lockingScript?: HexString
        tx?: BEEF
        spendable: true
        customInstructions?: string
        tags?: OutputTagStringUnder300Bytes[]
        labels?: LabelStringUnder300Bytes[]
      }>
    }> {
    throw new WalletError('ProtoWallet does not support retrieving outputs.', walletErrors.unsupportedAction)
  }

  async relinquishOutput (
    args: {
      basket: BasketStringUnder300Bytes
      output: OutpointString
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ relinquished: true }> {
    throw new WalletError('ProtoWallet does not support deleting outputs.', walletErrors.unsupportedAction)
  }

  async getPublicKey (
    args: {
      identityKey?: true
      protocolID?: [SecurityLevel, ProtocolString5To400Bytes]
      keyID?: KeyIDStringUnder800Bytes
      privileged?: BooleanDefaultFalse
      privilegedReason?: DescriptionString5to50Bytes
      counterparty?: PubKeyHex | 'self' | 'anyone'
      forSelf?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ publicKey: PubKeyHex }> {
    if (args.privileged) {
      throw new WalletError(this.privilegedError)
    }
    if (args.identityKey) {
      return { publicKey: this.keyDeriver.rootKey.toPublicKey().toString() }
    } else {
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

  async revealCounterpartyKeyLinkage (
    args: {
      counterparty: PubKeyHex
      verifier: PubKeyHex
      privilegedReason?: DescriptionString5to50Bytes
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{
      prover: PubKeyHex
      verifier: PubKeyHex
      counterparty: PubKeyHex
      revelationTime: ISOTimestampString
      encryptedLinkage: Byte[]
      encryptedLinkageProof: Byte[]
    }> {
    if (args.privileged) {
      throw new WalletError(this.privilegedError)
    }
    const { publicKey: identityKey } = await this.getPublicKey({ identityKey: true })
    const linkage = this.keyDeriver.revealCounterpartySecret(args.counterparty)
    const linkageProof = new Schnorr().generateProof(this.keyDeriver.rootKey, this.keyDeriver.rootKey.toPublicKey(), PublicKey.fromString(args.counterparty), Point.fromDER(linkage))
    const linkageProofBin = [
      ...linkageProof.R.encode(true),
      ...linkageProof.SPrime.encode(true),
      ...linkageProof.z.toArray()
    ] as number[]
    const revelationTime = new Date().toISOString()
    const { ciphertext: encryptedLinkage } = await this.encrypt({
      plaintext: linkage,
      protocolID: [2, 'counterparty linkage revelation'],
      keyID: revelationTime,
      counterparty: args.verifier
    })
    const { ciphertext: encryptedLinkageProof } = await this.encrypt({
      plaintext: linkageProofBin,
      protocolID: [2, 'counterparty linkage revelation'],
      keyID: revelationTime,
      counterparty: args.verifier
    })
    return {
      prover: identityKey,
      verifier: args.verifier,
      counterparty: args.counterparty,
      revelationTime,
      encryptedLinkage,
      encryptedLinkageProof
    }
  }

  async revealSpecificKeyLinkage (
    args: {
      counterparty: PubKeyHex
      verifier: PubKeyHex
      protocolID: [SecurityLevel, ProtocolString5To400Bytes]
      keyID: KeyIDStringUnder800Bytes
      privilegedReason?: DescriptionString5to50Bytes
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{
      prover: PubKeyHex
      verifier: PubKeyHex
      counterparty: PubKeyHex
      protocolID: [SecurityLevel, ProtocolString5To400Bytes]
      keyID: KeyIDStringUnder800Bytes
      encryptedLinkage: Byte[]
      encryptedLinkageProof: Byte[]
      proofType: Byte
    }> {
    if (args.privileged) {
      throw new WalletError(this.privilegedError)
    }
    const { publicKey: identityKey } = await this.getPublicKey({ identityKey: true })
    const linkage = this.keyDeriver.revealSpecificSecret(
      args.counterparty,
      args.protocolID,
      args.keyID
    )
    const { ciphertext: encryptedLinkage } = await this.encrypt({
      plaintext: linkage,
      protocolID: [2, `specific linkage revelation ${args.protocolID[0]} ${args.protocolID[1]}`],
      keyID: args.keyID,
      counterparty: args.verifier
    })
    const { ciphertext: encryptedLinkageProof } = await this.encrypt({
      plaintext: [0], // Proof type 0, no proof provided
      protocolID: [2, `specific linkage revelation ${args.protocolID[0]} ${args.protocolID[1]}`],
      keyID: args.keyID,
      counterparty: args.verifier
    })
    return {
      prover: identityKey,
      verifier: args.verifier,
      counterparty: args.counterparty,
      protocolID: args.protocolID,
      keyID: args.keyID,
      encryptedLinkage,
      encryptedLinkageProof,
      proofType: 0
    }
  }

  async encrypt (
    args: {
      plaintext: Byte[]
      protocolID: [SecurityLevel, ProtocolString5To400Bytes]
      keyID: KeyIDStringUnder800Bytes
      privilegedReason?: DescriptionString5to50Bytes
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ ciphertext: Byte[] }> {
    if (args.privileged) {
      throw new WalletError(this.privilegedError)
    }
    const key = this.keyDeriver.deriveSymmetricKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self'
    )
    return { ciphertext: key.encrypt(args.plaintext) as number[] }
  }

  async decrypt (
    args: {
      ciphertext: Byte[]
      protocolID: [SecurityLevel, ProtocolString5To400Bytes]
      keyID: KeyIDStringUnder800Bytes
      privilegedReason?: DescriptionString5to50Bytes
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ plaintext: Byte[] }> {
    if (args.privileged) {
      throw new WalletError(this.privilegedError)
    }
    const key = this.keyDeriver.deriveSymmetricKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self'
    )
    return { plaintext: key.decrypt(args.ciphertext) as number[] }
  }

  async createHmac (
    args: {
      data: Byte[]
      protocolID: [SecurityLevel, ProtocolString5To400Bytes]
      keyID: KeyIDStringUnder800Bytes
      privilegedReason?: DescriptionString5to50Bytes
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ hmac: Byte[] }> {
    if (args.privileged) {
      throw new WalletError(this.privilegedError)
    }
    const key = this.keyDeriver.deriveSymmetricKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self'
    )
    return { hmac: Hash.sha256hmac(key.toArray(), args.data) }
  }

  async verifyHmac (
    args: {
      data: Byte[]
      hmac: Byte[]
      protocolID: [SecurityLevel, ProtocolString5To400Bytes]
      keyID: KeyIDStringUnder800Bytes
      privilegedReason?: DescriptionString5to50Bytes
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ valid: true }> {
    if (args.privileged) {
      throw new WalletError(this.privilegedError)
    }
    const key = this.keyDeriver.deriveSymmetricKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self'
    )
    const valid = Hash.sha256hmac(key.toArray(), args.data).toString() === args.hmac.toString()
    if (!valid) {
      throw new WalletError('HMAC is not valid', walletErrors.invalidHmac)
    }
    return { valid }
  }

  async createSignature (
    args: {
      data?: Byte[]
      hashToDirectlySign?: Byte[]
      protocolID: [SecurityLevel, ProtocolString5To400Bytes]
      keyID: KeyIDStringUnder800Bytes
      privilegedReason?: DescriptionString5to50Bytes
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ signature: Byte[] }> {
    if (args.privileged) {
      throw new WalletError(this.privilegedError)
    }
    let hash: number[] = args.hashToDirectlySign
    if (!hash) {
      hash = Hash.sha256(args.data)
    }
    const key = this.keyDeriver.derivePrivateKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'anyone'
    )
    return { signature: ECDSA.sign(new BigNumber(hash), key, true).toDER() as number[] }
  }

  async verifySignature (
    args: {
      data?: Byte[]
      hashToDirectlyVerify?: Byte[]
      signature: Byte[]
      protocolID: [SecurityLevel, ProtocolString5To400Bytes]
      keyID: KeyIDStringUnder800Bytes
      privilegedReason?: DescriptionString5to50Bytes
      counterparty?: PubKeyHex | 'self' | 'anyone'
      forSelf?: BooleanDefaultFalse
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ valid: true }> {
    if (args.privileged) {
      throw new WalletError(this.privilegedError)
    }
    let hash: number[] = args.hashToDirectlyVerify
    if (!hash) {
      hash = Hash.sha256(args.data)
    }
    const key = this.keyDeriver.derivePublicKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self',
      args.forSelf
    )
    const valid = ECDSA.verify(new BigNumber(hash), Signature.fromDER(args.signature), key)
    if (!valid) {
      throw new WalletError('Signature is not valid', walletErrors.invalidSignature)
    }
    return { valid }
  }

  async acquireCertificate (
    args: {
      type: Base64String
      certifier: PubKeyHex
      acquisitionProtocol: 'direct' | 'issuance'
      fields: Record<CertificateFieldNameUnder50Bytes, string>
      serialNumber?: Base64String
      revocationOutpoint?: OutpointString
      signature?: HexString
      certifierUrl?: string
      keyringRevealer?: PubKeyHex | 'certifier'
      keyringForSubject?: Record<CertificateFieldNameUnder50Bytes, Base64String>
      privileged?: BooleanDefaultFalse
      privilegedReason?: DescriptionString5to50Bytes
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{
      type: Base64String
      subject: PubKeyHex
      serialNumber: Base64String
      certifier: PubKeyHex
      revocationOutpoint: OutpointString
      signature: HexString
      fields: Record<CertificateFieldNameUnder50Bytes, string>
    }> {
    throw new WalletError('ProtoWallet does not support acquiring certificates.', walletErrors.unsupportedAction)
  }

  async listCertificates (
    args: {
      certifiers: PubKeyHex[]
      types: Base64String[]
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
      privileged?: BooleanDefaultFalse
      privilegedReason?: DescriptionString5to50Bytes
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{
      totalCertificates: PositiveIntegerOrZero
      certificates: Array<{
        type: Base64String
        subject: PubKeyHex
        serialNumber: Base64String
        certifier: PubKeyHex
        revocationOutpoint: OutpointString
        signature: HexString
        fields: Record<CertificateFieldNameUnder50Bytes, string>
      }>
    }> {
    throw new WalletError('ProtoWallet does not support retrieving certificates.', walletErrors.unsupportedAction)
  }

  async proveCertificate (
    args: {
      certificate: {
        type: Base64String
        subject: PubKeyHex
        serialNumber: Base64String
        certifier: PubKeyHex
        revocationOutpoint: OutpointString
        signature: HexString
        fields: Record<CertificateFieldNameUnder50Bytes, string>
      }
      fieldsToReveal: CertificateFieldNameUnder50Bytes[]
      verifier: PubKeyHex
      privileged?: BooleanDefaultFalse
      privilegedReason?: DescriptionString5to50Bytes
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{
      keyringForVerifier: Record<CertificateFieldNameUnder50Bytes, Base64String>
    }> {
    throw new WalletError('ProtoWallet does not support proving certificates.', walletErrors.unsupportedAction)
  }

  async relinquishCertificate (
    args: {
      type: Base64String
      serialNumber: Base64String
      certifier: PubKeyHex
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ relinquished: true }> {
    throw new WalletError('ProtoWallet does not support deleting certificates.', walletErrors.unsupportedAction)
  }

  async discoverByIdentityKey (
    args: {
      identityKey: PubKeyHex
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{
      totalCertificates: PositiveIntegerOrZero
      certificates: Array<{
        type: Base64String
        subject: PubKeyHex
        serialNumber: Base64String
        certifier: PubKeyHex
        revocationOutpoint: OutpointString
        signature: HexString
        fields: Record<CertificateFieldNameUnder50Bytes, Base64String>
        certifierInfo: {
          name: EntityNameStringMax100Bytes
          iconUrl: EntityIconURLStringMax500Bytes
          description: DescriptionString5to50Bytes
          trust: PositiveIntegerMax10
        }
        publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Bytes, Base64String>
        decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>
      }>
    }> {
    throw new WalletError('ProtoWallet does not support resolving identities.', walletErrors.unsupportedAction)
  }

  async discoverByAttributes (
    args: {
      attributes: Record<CertificateFieldNameUnder50Bytes, string>
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
    },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{
      totalCertificates: PositiveIntegerOrZero
      certificates: Array<{
        type: Base64String
        subject: PubKeyHex
        serialNumber: Base64String
        certifier: PubKeyHex
        revocationOutpoint: OutpointString
        signature: HexString
        fields: Record<CertificateFieldNameUnder50Bytes, Base64String>
        certifierInfo: {
          name: EntityNameStringMax100Bytes
          iconUrl: EntityIconURLStringMax500Bytes
          description: DescriptionString5to50Bytes
          trust: PositiveIntegerMax10
        }
        publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Bytes, Base64String>
        decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>
      }>
    }> {
    throw new WalletError('ProtoWallet does not support resolving identities.', walletErrors.unsupportedAction)
  }

  async isAuthenticated (
    args: {},
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ authenticated: boolean }> {
    return { authenticated: true }
  }

  async waitForAuthentication (
    args: {},
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ authenticated: true }> {
    return { authenticated: true }
  }

  async getHeight (
    args: {},
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ height: PositiveInteger }> {
    throw new WalletError('ProtoWallet does not support blockchain tracking.', walletErrors.unsupportedAction)
  }

  async getHeaderForHeight (
    args: { height: PositiveInteger },
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ header: HexString }> {
    throw new WalletError('ProtoWallet does not support blockchain tracking.', walletErrors.unsupportedAction)
  }

  async getNetwork (
    args: {},
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ network: 'mainnet' | 'testnet' }> {
    return { network: 'mainnet' }
  }

  async getVersion (
    args: {},
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ version: VersionString7To30Bytes }> {
    return { version: 'proto-1.0.0' }
  }
}
