import { VerifiableCertificate } from '../../../../dist/cjs/src/auth/certificates/VerifiableCertificate.js'
import { PrivateKey, SymmetricKey, Utils } from '../../../../dist/cjs/src/primitives/index.js'
import { CompletedProtoWallet } from '../../../../dist/cjs/src/auth/certificates/__tests/CompletedProtoWallet.js'
import { Certificate } from '../../../../dist/cjs/src/auth/certificates/index.js'
import { MasterCertificate } from '../../../../dist/cjs/src/auth/certificates/MasterCertificate.js'

describe('VerifiableCertificate', () => {
  const subjectPrivateKey = PrivateKey.fromRandom()
  const subjectIdentityKey = subjectPrivateKey.toPublicKey().toString()
  const certifierPrivateKey = PrivateKey.fromRandom()
  const certifierIdentityKey = certifierPrivateKey.toPublicKey().toString()
  const verifierPrivateKey = PrivateKey.fromRandom()
  const verifierIdentityKey = verifierPrivateKey.toPublicKey().toString()

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
    const { certificateFields, masterKeyring } = await MasterCertificate.createCertificateFields(
      subjectWallet,
      certifierIdentityKey,
      plaintextFields
    )
    const keyringForVerifier = await MasterCertificate.createKeyringForVerifier(
      subjectWallet,
      certifierIdentityKey,
      verifierIdentityKey,
      certificateFields,
      Object.keys(certificateFields),
      masterKeyring,
      sampleSerialNumber
    )
    verifiableCert = new VerifiableCertificate(
      sampleType,
      sampleSerialNumber,
      subjectIdentityKey,
      certifierIdentityKey,
      sampleRevocationOutpoint,
      certificateFields,
      keyringForVerifier
    )
  })

  describe('constructor', () => {
    it('should create a VerifiableCertificate with all required properties', () => {
      expect(verifiableCert).toBeInstanceOf(VerifiableCertificate)
      expect(verifiableCert.type).toEqual(sampleType)
      expect(verifiableCert.serialNumber).toEqual(sampleSerialNumber)
      expect(verifiableCert.subject).toEqual(subjectIdentityKey)
      expect(verifiableCert.certifier).toEqual(certifierIdentityKey)
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