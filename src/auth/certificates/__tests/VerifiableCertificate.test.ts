/**
 * @file VerifiableCertificate.test.ts
 * @description Tests for the VerifiableCertificate class.
 */

import { VerifiableCertificate } from '../VerifiableCertificate'
import { ProtoWallet, PrivateKey, SymmetricKey, Utils } from '../../../../mod'

describe('VerifiableCertificate', () => {
  const subjectPrivateKey = PrivateKey.fromRandom()
  const subjectPubKey = subjectPrivateKey.toPublicKey().toString()
  const certifierPrivateKey = PrivateKey.fromRandom()
  const certifierPubKey = certifierPrivateKey.toPublicKey().toString()
  const verifierPrivateKey = PrivateKey.fromRandom()
  const verifierPubKey = verifierPrivateKey.toPublicKey().toString()

  const subjectWallet = new ProtoWallet(subjectPrivateKey)
  const verifierWallet = new ProtoWallet(verifierPrivateKey)

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
      const wrongWallet = new ProtoWallet(wrongPrivateKey)

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
