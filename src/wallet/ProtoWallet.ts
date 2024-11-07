import {
  Base64String,
  BasketStringUnder300Characters,
  BEEF,
  BooleanDefaultFalse,
  BooleanDefaultTrue,
  Byte,
  CertificateFieldNameUnder50Characters,
  DescriptionString5to50Characters,
  EntityIconURLStringMax500Characters,
  EntityNameStringMax100Characters,
  HexString,
  ISOTimestampString,
  KeyIDStringUnder800Characters,
  LabelStringUnder300Characters,
  OriginatorDomainNameString,
  OutpointString,
  OutputTagStringUnder300Characters,
  PositiveInteger,
  PositiveIntegerDefault10Max10000,
  PositiveIntegerMax10,
  PositiveIntegerOrZero,
  ProtocolString5To400Characters,
  PubKeyHex,
  SatoshiValue,
  TXIDHexString,
  VersionString7To30Characters,
  Wallet
} from './Wallet.interface.js'
import KeyDeriver from './KeyDeriver.js'
import { PrivateKey, Hash, ECDSA, BigNumber, Signature, Schnorr, PublicKey, Point } from '../primitives/index.js'

/**
 * A ProtoWallet is a structure that fulfills the Wallet interface, capable of performing all foundational cryptographic operations. It can derive keys, create signatures, facilitate encryption and HMAC operations, and reveal key linkages. However, ProtoWallet does not create transactions, manage outputs, interact with the blockchain, enable the management of identity certificates, or store any data.
 */
export default class ProtoWallet implements Wallet {
  keyDeriver: KeyDeriver
  privilegedError: string =
    'ProtoWallet is a single-keyring wallet, operating without context about whether its configured keyring is privileged.'

  constructor(rootKey: PrivateKey | 'anyone', KeyDeriverClass = KeyDeriver) {
    this.keyDeriver = new KeyDeriverClass(rootKey)
  }

  async createAction(
    args: {
      description: DescriptionString5to50Characters
      inputs?: Array<{
        tx?: BEEF
        outpoint: OutpointString
        unlockingScript?: HexString
        unlockingScriptLength?: PositiveInteger
        inputDescription: DescriptionString5to50Characters
        sequenceNumber?: PositiveIntegerOrZero
      }>
      outputs?: Array<{
        lockingScript: HexString
        satoshis: SatoshiValue
        outputDescription: DescriptionString5to50Characters
        basket?: BasketStringUnder300Characters
        customInstructions?: string
        tags?: OutputTagStringUnder300Characters[]
      }>
      lockTime?: PositiveIntegerOrZero
      version?: PositiveIntegerOrZero
      labels?: LabelStringUnder300Characters[]
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
    originator?: OriginatorDomainNameString
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
    throw new Error('ProtoWallet does not support creating transactions.')
  }

  async signAction(
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
    originator?: OriginatorDomainNameString
  ): Promise<{
    txid?: TXIDHexString
    tx?: BEEF
    noSendChange?: OutpointString[]
    sendWithResults?: Array<{
      txid: TXIDHexString
      status: 'unproven' | 'sending' | 'failed'
    }>
  }> {
    throw new Error('ProtoWallet does not support creating transactions.')
  }

  async abortAction(
    args: {
      reference: Base64String
    },
    originator?: OriginatorDomainNameString
  ): Promise<{ aborted: true }> {
    throw new Error('ProtoWallet does not support aborting transactions.')
  }

  async listActions(
    args: {
      labels: LabelStringUnder300Characters[]
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
    originator?: OriginatorDomainNameString
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
      description: DescriptionString5to50Characters
      labels?: LabelStringUnder300Characters[]
      version: PositiveIntegerOrZero
      lockTime: PositiveIntegerOrZero
      inputs?: Array<{
        sourceOutpoint: OutpointString
        sourceSatoshis: SatoshiValue
        sourceLockingScript?: HexString
        unlockingScript?: HexString
        inputDescription: DescriptionString5to50Characters
        sequenceNumber: PositiveIntegerOrZero
      }>
      outputs?: Array<{
        outputIndex: PositiveIntegerOrZero
        satoshis: SatoshiValue
        lockingScript?: HexString
        spendable: boolean
        outputDescription: DescriptionString5to50Characters
        basket: BasketStringUnder300Characters
        tags: OutputTagStringUnder300Characters[]
        customInstructions?: string
      }>
    }>
  }> {
    throw new Error('ProtoWallet does not support retrieving transactions.')
  }

  async internalizeAction(
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
          basket: BasketStringUnder300Characters
          customInstructions?: string
          tags?: OutputTagStringUnder300Characters[]
        }
      }>
      description: DescriptionString5to50Characters
      labels?: LabelStringUnder300Characters[]
    },
    originator?: OriginatorDomainNameString
  ): Promise<{ accepted: true }> {
    throw new Error('ProtoWallet does not support internalizing transactions.')
  }

  async listOutputs(
    args: {
      basket: BasketStringUnder300Characters
      tags?: OutputTagStringUnder300Characters[]
      tagQueryMode?: 'all' | 'any'
      include?: 'locking scripts' | 'entire transactions'
      includeCustomInstructions?: BooleanDefaultFalse
      includeTags?: BooleanDefaultFalse
      includeLabels?: BooleanDefaultFalse
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
    },
    originator?: OriginatorDomainNameString
  ): Promise<{
    totalOutputs: PositiveIntegerOrZero
    outputs: Array<{
      outpoint: OutpointString
      satoshis: SatoshiValue
      lockingScript?: HexString
      tx?: BEEF
      spendable: true
      customInstructions?: string
      tags?: OutputTagStringUnder300Characters[]
      labels?: LabelStringUnder300Characters[]
    }>
  }> {
    throw new Error('ProtoWallet does not support retrieving outputs.')
  }

  async relinquishOutput(
    args: {
      basket: BasketStringUnder300Characters
      output: OutpointString
    },
    originator?: OriginatorDomainNameString
  ): Promise<{ relinquished: true }> {
    throw new Error('ProtoWallet does not support deleting outputs.')
  }

  async getPublicKey(
    args: {
      identityKey?: true
      protocolID?: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID?: KeyIDStringUnder800Characters
      privileged?: BooleanDefaultFalse
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      forSelf?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameString
  ): Promise<{ publicKey: PubKeyHex }> {
    if (args.privileged) {
      throw new Error(this.privilegedError)
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

  async revealCounterpartyKeyLinkage(
    args: {
      counterparty: PubKeyHex
      verifier: PubKeyHex
      privilegedReason?: DescriptionString5to50Characters
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameString
  ): Promise<{
    prover: PubKeyHex
    verifier: PubKeyHex
    counterparty: PubKeyHex
    revelationTime: ISOTimestampString
    encryptedLinkage: Byte[]
    encryptedLinkageProof: Byte[]
  }> {
    if (args.privileged) {
      throw new Error(this.privilegedError)
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

  async revealSpecificKeyLinkage(
    args: {
      counterparty: PubKeyHex
      verifier: PubKeyHex
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameString
  ): Promise<{
    prover: PubKeyHex
    verifier: PubKeyHex
    counterparty: PubKeyHex
    protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
    keyID: KeyIDStringUnder800Characters
    encryptedLinkage: Byte[]
    encryptedLinkageProof: Byte[]
    proofType: Byte
  }> {
    if (args.privileged) {
      throw new Error(this.privilegedError)
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

  async encrypt(
    args: {
      plaintext: Byte[]
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameString
  ): Promise<{ ciphertext: Byte[] }> {
    if (args.privileged) {
      throw new Error(this.privilegedError)
    }
    const key = this.keyDeriver.deriveSymmetricKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self'
    )
    return { ciphertext: key.encrypt(args.plaintext) as number[] }
  }

  async decrypt(
    args: {
      ciphertext: Byte[]
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameString
  ): Promise<{ plaintext: Byte[] }> {
    if (args.privileged) {
      throw new Error(this.privilegedError)
    }
    const key = this.keyDeriver.deriveSymmetricKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self'
    )
    return { plaintext: key.decrypt(args.ciphertext) as number[] }
  }

  async createHmac(
    args: {
      data: Byte[]
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameString
  ): Promise<{ hmac: Byte[] }> {
    if (args.privileged) {
      throw new Error(this.privilegedError)
    }
    const key = this.keyDeriver.deriveSymmetricKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self'
    )
    return { hmac: Hash.sha256hmac(key.toArray(), args.data) }
  }

  async verifyHmac(
    args: {
      data: Byte[]
      hmac: Byte[]
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameString
  ): Promise<{ valid: true }> {
    if (args.privileged) {
      throw new Error(this.privilegedError)
    }
    const key = this.keyDeriver.deriveSymmetricKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self'
    )
    const valid = Hash.sha256hmac(key.toArray(), args.data).toString() === args.hmac.toString()
    if (!valid) {
      const e = new Error('HMAC is not valid');
      (e as any).code = 'ERR_INVALID_HMAC'
      throw e
    }
    return { valid }
  }

  async createSignature(
    args: {
      data?: Byte[]
      hashToDirectlySign?: Byte[]
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameString
  ): Promise<{ signature: Byte[] }> {
    if (args.privileged) {
      throw new Error(this.privilegedError)
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

  async verifySignature(
    args: {
      data?: Byte[]
      hashToDirectlyVerify?: Byte[]
      signature: Byte[]
      protocolID: [0 | 1 | 2, ProtocolString5To400Characters]
      keyID: KeyIDStringUnder800Characters
      privilegedReason?: DescriptionString5to50Characters
      counterparty?: PubKeyHex | 'self' | 'anyone'
      forSelf?: BooleanDefaultFalse
      privileged?: BooleanDefaultFalse
    },
    originator?: OriginatorDomainNameString
  ): Promise<{ valid: true }> {
    if (args.privileged) {
      throw new Error(this.privilegedError)
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
      const e = new Error('Signature is not valid');
      (e as any).code = 'ERR_INVALID_SIGNATURE'
      throw e
    }
    return { valid }
  }

  async acquireCertificate(
    args: {
      type: Base64String
      certifier: PubKeyHex
      acquisitionProtocol: 'direct' | 'issuance'
      fields: Record<CertificateFieldNameUnder50Characters, string>
      serialNumber?: Base64String
      revocationOutpoint?: OutpointString
      signature?: HexString
      certifierUrl?: string
      keyringRevealer?: PubKeyHex | 'certifier'
      keyringForSubject?: Record<CertificateFieldNameUnder50Characters, Base64String>
      privileged?: BooleanDefaultFalse
      privilegedReason?: DescriptionString5to50Characters
    },
    originator?: OriginatorDomainNameString
  ): Promise<{
    type: Base64String
    subject: PubKeyHex
    serialNumber: Base64String
    certifier: PubKeyHex
    revocationOutpoint: OutpointString
    signature: HexString
    fields: Record<CertificateFieldNameUnder50Characters, string>
  }> {
    throw new Error('ProtoWallet does not support acquiring certificates.')
  }

  async listCertificates(
    args: {
      certifiers: PubKeyHex[]
      types: Base64String[]
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
      privileged?: BooleanDefaultFalse
      privilegedReason?: DescriptionString5to50Characters
    },
    originator?: OriginatorDomainNameString
  ): Promise<{
    totalCertificates: PositiveIntegerOrZero
    certificates: Array<{
      type: Base64String
      subject: PubKeyHex
      serialNumber: Base64String
      certifier: PubKeyHex
      revocationOutpoint: OutpointString
      signature: HexString
      fields: Record<CertificateFieldNameUnder50Characters, string>
    }>
  }> {
    throw new Error('ProtoWallet does not support retrieving certificates.')
  }

  async proveCertificate(
    args: {
      certificate: {
        type: Base64String
        subject: PubKeyHex
        serialNumber: Base64String
        certifier: PubKeyHex
        revocationOutpoint: OutpointString
        signature: HexString
        fields: Record<CertificateFieldNameUnder50Characters, string>
      }
      fieldsToReveal: CertificateFieldNameUnder50Characters[]
      verifier: PubKeyHex
      privileged?: BooleanDefaultFalse
      privilegedReason?: DescriptionString5to50Characters
    },
    originator?: OriginatorDomainNameString
  ): Promise<{
    keyringForVerifier: Record<CertificateFieldNameUnder50Characters, Base64String>
  }> {
    throw new Error('ProtoWallet does not support proving certificates.')
  }

  async relinquishCertificate(
    args: {
      type: Base64String
      serialNumber: Base64String
      certifier: PubKeyHex
    },
    originator?: OriginatorDomainNameString
  ): Promise<{ relinquished: true }> {
    throw new Error('ProtoWallet does not support deleting certificates.')
  }

  async discoverByIdentityKey(
    args: {
      identityKey: PubKeyHex
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
    },
    originator?: OriginatorDomainNameString
  ): Promise<{
    totalCertificates: PositiveIntegerOrZero
    certificates: Array<{
      type: Base64String
      subject: PubKeyHex
      serialNumber: Base64String
      certifier: PubKeyHex
      revocationOutpoint: OutpointString
      signature: HexString
      fields: Record<CertificateFieldNameUnder50Characters, Base64String>
      certifierInfo: {
        name: EntityNameStringMax100Characters
        iconUrl: EntityIconURLStringMax500Characters
        description: DescriptionString5to50Characters
        trust: PositiveIntegerMax10
      }
      publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>
      decryptedFields: Record<CertificateFieldNameUnder50Characters, string>
    }>
  }> {
    throw new Error('ProtoWallet does not support resolving identities.')
  }

  async discoverByAttributes(
    args: {
      attributes: Record<CertificateFieldNameUnder50Characters, string>
      limit?: PositiveIntegerDefault10Max10000
      offset?: PositiveIntegerOrZero
    },
    originator?: OriginatorDomainNameString
  ): Promise<{
    totalCertificates: PositiveIntegerOrZero
    certificates: Array<{
      type: Base64String
      subject: PubKeyHex
      serialNumber: Base64String
      certifier: PubKeyHex
      revocationOutpoint: OutpointString
      signature: HexString
      fields: Record<CertificateFieldNameUnder50Characters, Base64String>
      certifierInfo: {
        name: EntityNameStringMax100Characters
        iconUrl: EntityIconURLStringMax500Characters
        description: DescriptionString5to50Characters
        trust: PositiveIntegerMax10
      }
      publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>
      decryptedFields: Record<CertificateFieldNameUnder50Characters, string>
    }>
  }> {
    throw new Error('ProtoWallet does not support resolving identities.')
  }

  async isAuthenticated(
    args: {},
    originator?: OriginatorDomainNameString
  ): Promise<{ authenticated: boolean }> {
    return { authenticated: true }
  }

  async waitForAuthentication(
    args: {},
    originator?: OriginatorDomainNameString
  ): Promise<{ authenticated: true }> {
    return { authenticated: true }
  }

  async getHeight(
    args: {},
    originator?: OriginatorDomainNameString
  ): Promise<{ height: PositiveInteger }> {
    throw new Error('ProtoWallet does not support blockchain tracking.')
  }

  async getHeaderForHeight(
    args: { height: PositiveInteger },
    originator?: OriginatorDomainNameString
  ): Promise<{ header: HexString }> {
    throw new Error('ProtoWallet does not support blockchain tracking.')
  }

  async getNetwork(
    args: {},
    originator?: OriginatorDomainNameString
  ): Promise<{ network: 'mainnet' | 'testnet' }> {
    return { network: 'mainnet' }
  }

  async getVersion(
    args: {},
    originator?: OriginatorDomainNameString
  ): Promise<{ version: VersionString7To30Characters }> {
    return { version: 'proto-1.0.0' }
  }
}
