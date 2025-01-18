/**
 * @file VerifiableCertificate.test.ts
 * @description Tests for the VerifiableCertificate class.
 */

import { VerifiableCertificate } from '../VerifiableCertificate'
import { ProtoWallet, PrivateKey, SymmetricKey, Utils, Wallet, AbortActionArgs, AbortActionResult, AcquireCertificateArgs, AcquireCertificateResult, CreateActionArgs, CreateActionResult, DiscoverByAttributesArgs, DiscoverByIdentityKeyArgs, DiscoverCertificatesResult, GetHeaderArgs, GetHeaderResult, GetHeightResult, InternalizeActionArgs, InternalizeActionResult, ListActionsArgs, ListActionsResult, ListCertificatesArgs, ListCertificatesResult, ListOutputsArgs, ListOutputsResult, OriginatorDomainNameStringUnder250Bytes, ProveCertificateArgs, ProveCertificateResult, RelinquishCertificateArgs, RelinquishCertificateResult, RelinquishOutputArgs, RelinquishOutputResult, SignActionArgs, SignActionResult } from '../../../../mod'

describe('VerifiableCertificate', () => {
  const subjectPrivateKey = PrivateKey.fromRandom()
  const subjectPubKey = subjectPrivateKey.toPublicKey().toString()
  const certifierPrivateKey = PrivateKey.fromRandom()
  const certifierPubKey = certifierPrivateKey.toPublicKey().toString()
  const verifierPrivateKey = PrivateKey.fromRandom()
  const verifierPubKey = verifierPrivateKey.toPublicKey().toString()

  const subjectWallet = new CompletedProtoWallet(subjectPrivateKey)
  const verifierWallet = new CompletedProtoWallet(verifierPrivateKey)

  const sampleType = Utils.toBase64(new Array(32).fill(1))
  const sampleSerialNumber = Utils.toBase64(new Array(32).fill(2))
  const sampleRevocationOutpoint = 'deadbeefdeadbeefdeadbeefdeadbeef00000000000000000000000000000000.1'

  const plaintextFields = {
    name: 'Alice',
    email: 'alice@example.com',
    organization: 'Example Corp'
  }

  let verifiableCert: VerifiableCertificate

  beforeEach(async () => {
    // For each test, we'll build a fresh VerifiableCertificate with valid encryption
    const certificateFields = {}
    const keyring = {}

    for (const fieldName in plaintextFields) {
      // Generate a random field symmetric key
      const fieldSymKey = SymmetricKey.fromRandom()
      // Encrypt the field's plaintext
      const encryptedFieldValue = fieldSymKey.encrypt(Utils.toArray(plaintextFields[fieldName], 'utf8'))
      certificateFields[fieldName] = Utils.toBase64(encryptedFieldValue as number[])

      // Now encrypt the fieldSymKey for the verifier
      const { ciphertext: encryptedRevelationKey } = await subjectWallet.encrypt({
        plaintext: fieldSymKey.toArray(),
        protocolID: [2, 'certificate field encryption'],
        keyID: `${sampleSerialNumber} ${fieldName}`,
        counterparty: verifierPubKey
      })
      keyring[fieldName] = Utils.toBase64(encryptedRevelationKey)
    }

    verifiableCert = new VerifiableCertificate(
      sampleType,
      sampleSerialNumber,
      subjectPubKey,
      certifierPubKey,
      sampleRevocationOutpoint,
      certificateFields,
      undefined, // signature
      keyring
    )
  })

  describe('constructor', () => {
    it('should create a VerifiableCertificate with all required properties', () => {
      expect(verifiableCert).toBeInstanceOf(VerifiableCertificate)
      expect(verifiableCert.type).toEqual(sampleType)
      expect(verifiableCert.serialNumber).toEqual(sampleSerialNumber)
      expect(verifiableCert.subject).toEqual(subjectPubKey)
      expect(verifiableCert.certifier).toEqual(certifierPubKey)
      expect(verifiableCert.revocationOutpoint).toEqual(sampleRevocationOutpoint)
      expect(verifiableCert.fields).toBeDefined()
      expect(verifiableCert.keyring).toBeDefined()
    })
  })

  describe('decryptFields', () => {
    it('should decrypt fields successfully when provided the correct verifier wallet and keyring', async () => {
      const decrypted = await verifiableCert.decryptFields(verifierWallet)
      expect(decrypted).toEqual(plaintextFields)
    })

    it('should fail if the verifier wallet does not have the correct private key (wrong key)', async () => {
      const wrongPrivateKey = PrivateKey.fromRandom()
      const wrongWallet = new CompletedProtoWallet(wrongPrivateKey)

      await expect(verifiableCert.decryptFields(wrongWallet)).rejects.toThrow(
        /Failed to decrypt selectively revealed certificate fields using keyring/
      )
    })

    it('should fail if the keyring is empty or missing keys', async () => {
      // Create a new VerifiableCertificate but with an empty keyring
      const fields = verifiableCert.fields
      const emptyKeyringCert = new VerifiableCertificate(
        verifiableCert.type,
        verifiableCert.serialNumber,
        verifiableCert.subject,
        verifiableCert.certifier,
        verifiableCert.revocationOutpoint,
        fields,
        verifiableCert.signature,
        {} // empty
      )

      await expect(emptyKeyringCert.decryptFields(verifierWallet)).rejects.toThrow(
        'A keyring is required to decrypt certificate fields for the verifier.'
      )
    })

    it('should fail if the encrypted field or its key is tampered', async () => {
      // Tamper the keyring so it doesn't match the field encryption
      verifiableCert.keyring.name = Utils.toBase64([9, 9, 9, 9])
      await expect(verifiableCert.decryptFields(verifierWallet)).rejects.toThrow(
        /Failed to decrypt selectively revealed certificate fields using keyring/
      )
    })
  })
})

class CompletedProtoWallet extends ProtoWallet implements Wallet {
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