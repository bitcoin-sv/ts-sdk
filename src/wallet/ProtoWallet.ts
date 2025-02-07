import { KeyDeriver, KeyDeriverApi } from './KeyDeriver'
import {
  Hash,
  ECDSA,
  BigNumber,
  Signature,
  Schnorr,
  PublicKey,
  Point,
  PrivateKey
} from '../primitives/index'
import {
  AuthenticatedResult,
  CreateHmacArgs,
  CreateHmacResult,
  CreateSignatureArgs,
  CreateSignatureResult,
  GetNetworkResult,
  GetPublicKeyArgs,
  GetVersionResult,
  OriginatorDomainNameStringUnder250Bytes,
  PubKeyHex,
  RevealCounterpartyKeyLinkageArgs,
  RevealCounterpartyKeyLinkageResult,
  RevealSpecificKeyLinkageArgs,
  RevealSpecificKeyLinkageResult,
  VerifyHmacArgs,
  VerifyHmacResult,
  VerifySignatureArgs,
  VerifySignatureResult,
  WalletDecryptArgs,
  WalletDecryptResult,
  WalletEncryptArgs,
  WalletEncryptResult
} from './Wallet.interfaces'

/**
 * A ProtoWallet is precursor to a full wallet, capable of performing all foundational cryptographic operations.
 * It can derive keys, create signatures, facilitate encryption and HMAC operations, and reveal key linkages.
 *
 * However, ProtoWallet does not create transactions, manage outputs, interact with the blockchain,
 * enable the management of identity certificates, or store any data. It is also not concerned with privileged keys.
 */
export class ProtoWallet {
  keyDeriver?: KeyDeriverApi

  constructor (rootKeyOrKeyDeriver?: PrivateKey | 'anyone' | KeyDeriverApi) {
    if (typeof (rootKeyOrKeyDeriver as KeyDeriver).identityKey !== 'string') {
      rootKeyOrKeyDeriver = new KeyDeriver(
        rootKeyOrKeyDeriver as PrivateKey | 'anyone'
      )
    }
    this.keyDeriver = rootKeyOrKeyDeriver as KeyDeriver
  }

  async getPublicKey (
    args: GetPublicKeyArgs,
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<{ publicKey: PubKeyHex }> {
    if (args.identityKey) {
      return { publicKey: this.keyDeriver.rootKey.toPublicKey().toString() }
    } else {
      if (!args.protocolID || !args.keyID) {
        throw new Error(
          'protocolID and keyID are required if identityKey is false or undefined.'
        )
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

  async revealCounterpartyKeyLinkage (
    args: RevealCounterpartyKeyLinkageArgs,
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<RevealCounterpartyKeyLinkageResult> {
    const { publicKey: identityKey } = await this.getPublicKey({
      identityKey: true
    })
    const linkage = this.keyDeriver.revealCounterpartySecret(args.counterparty)
    const linkageProof = new Schnorr().generateProof(
      this.keyDeriver.rootKey,
      this.keyDeriver.rootKey.toPublicKey(),
      PublicKey.fromString(args.counterparty),
      Point.fromDER(linkage)
    )
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
    args: RevealSpecificKeyLinkageArgs,
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<RevealSpecificKeyLinkageResult> {
    const { publicKey: identityKey } = await this.getPublicKey({
      identityKey: true
    })
    const linkage = this.keyDeriver.revealSpecificSecret(
      args.counterparty,
      args.protocolID,
      args.keyID
    )
    const { ciphertext: encryptedLinkage } = await this.encrypt({
      plaintext: linkage,
      protocolID: [
        2,
        `specific linkage revelation ${args.protocolID[0]} ${args.protocolID[1]}`
      ],
      keyID: args.keyID,
      counterparty: args.verifier
    })
    const { ciphertext: encryptedLinkageProof } = await this.encrypt({
      plaintext: [0], // Proof type 0, no proof provided
      protocolID: [
        2,
        `specific linkage revelation ${args.protocolID[0]} ${args.protocolID[1]}`
      ],
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
    args: WalletEncryptArgs,
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<WalletEncryptResult> {
    const key = this.keyDeriver.deriveSymmetricKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self'
    )
    return { ciphertext: key.encrypt(args.plaintext) as number[] }
  }

  async decrypt (
    args: WalletDecryptArgs,
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<WalletDecryptResult> {
    const key = this.keyDeriver.deriveSymmetricKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self'
    )
    return { plaintext: key.decrypt(args.ciphertext) as number[] }
  }

  async createHmac (
    args: CreateHmacArgs,
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<CreateHmacResult> {
    const key = this.keyDeriver.deriveSymmetricKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self'
    )
    return { hmac: Hash.sha256hmac(key.toArray(), args.data) }
  }

  async verifyHmac (
    args: VerifyHmacArgs,
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<VerifyHmacResult> {
    const key = this.keyDeriver.deriveSymmetricKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self'
    )
    const valid =
      Hash.sha256hmac(key.toArray(), args.data).toString() ===
      args.hmac.toString()
    if (!valid) {
      const e = new Error('HMAC is not valid')
      ;(e as any).code = 'ERR_INVALID_HMAC'
      throw e
    }
    return { valid }
  }

  async createSignature (
    args: CreateSignatureArgs,
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<CreateSignatureResult> {
    if (!args.hashToDirectlySign && !args.data) {
      throw new Error('args.data or args.hashToDirectlySign must be valid')
    }
    const hash: number[] = args.hashToDirectlySign || Hash.sha256(args.data)
    const key = this.keyDeriver.derivePrivateKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'anyone'
    )
    return {
      signature: ECDSA.sign(new BigNumber(hash), key, true).toDER() as number[]
    }
  }

  async verifySignature (
    args: VerifySignatureArgs,
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<VerifySignatureResult> {
    if (!args.hashToDirectlyVerify && !args.data) {
      throw new Error('args.data or args.hashToDirectlyVerify must be valid')
    }
    const hash: number[] = args.hashToDirectlyVerify || Hash.sha256(args.data)
    const key = this.keyDeriver.derivePublicKey(
      args.protocolID,
      args.keyID,
      args.counterparty || 'self',
      args.forSelf
    )
    const valid = ECDSA.verify(
      new BigNumber(hash),
      Signature.fromDER(args.signature),
      key
    )
    if (!valid) {
      const e = new Error('Signature is not valid')
      ;(e as any).code = 'ERR_INVALID_SIGNATURE'
      throw e
    }
    return { valid }
  }
}

export default ProtoWallet
