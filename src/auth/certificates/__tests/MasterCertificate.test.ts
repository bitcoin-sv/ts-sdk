/**
 * @file MasterCertificate.test.ts
 * @description Tests for the MasterCertificate class.
 */

import { MasterCertificate } from '../MasterCertificate'
import { VerifiableCertificate } from '../VerifiableCertificate'
import { ProtoWallet, PrivateKey, SymmetricKey, Utils, Random } from '../../../../mod'

describe('MasterCertificate', () => {
  const subjectPrivateKey = PrivateKey.fromRandom()
  const subjectPubKey = subjectPrivateKey.toPublicKey().toString()
  const certifierPrivateKey = PrivateKey.fromRandom()
  const certifierPubKey = certifierPrivateKey.toPublicKey().toString()

  // A mock revocation outpoint for testing
  const mockRevocationOutpoint = 'deadbeefdeadbeefdeadbeefdeadbeef00000000000000000000000000000000.1'

  // Arbitrary certificate data (in plaintext)
  const plaintextFields = {
    name: 'Alice',
    email: 'alice@example.com',
    department: 'Engineering'
  }

  const subjectWallet = new ProtoWallet(subjectPrivateKey)
  const certifierWallet = new ProtoWallet(certifierPrivateKey)

  describe('constructor', () => {
    it('should construct a MasterCertificate successfully when masterKeyring is valid', () => {
      // Prepare a minimal valid MasterCertificate
      const fieldSymKey = SymmetricKey.fromRandom()
      const encryptedFieldValue = Utils.toBase64(
        fieldSymKey.encrypt(Utils.toArray('Alice', 'utf8')) as number[]
      )

      const encryptedKeyForSubject = Utils.toBase64([0, 1, 2, 3])
      // We assume we have the same fieldName in both `fields` and `masterKeyring`.
      const fields = { name: encryptedFieldValue }
      const masterKeyring = { name: encryptedKeyForSubject }

      const certificate = new MasterCertificate(
        Utils.toBase64(Random(16)), // type
        Utils.toBase64(Random(16)), // serialNumber
        subjectPubKey,
        certifierPubKey,
        mockRevocationOutpoint,
        fields,
        masterKeyring
      )

      expect(certificate).toBeInstanceOf(MasterCertificate)
      expect(certificate.fields).toEqual(fields)
      expect(certificate.masterKeyring).toEqual(masterKeyring)
      expect(certificate.subject).toEqual(subjectPubKey)
      expect(certificate.certifier).toEqual(certifierPubKey)
    })

    it('should throw if masterKeyring is missing a key for any field', () => {
      const fields = { name: 'encrypted_value' }
      const masterKeyring = {} // intentionally empty

      expect(() => {
        new MasterCertificate(
          Utils.toBase64(Random(16)), // type
          Utils.toBase64(Random(16)), // serialNumber
          subjectPubKey,
          certifierPubKey,
          mockRevocationOutpoint,
          fields,
          masterKeyring
        )
      }).toThrowError(/Master keyring must contain a value for every field/)
    })
  })

  describe('decryptFields', () => {
    it('should decrypt all fields correctly using subject wallet', async () => {
      // Issue a certificate for the subject, which includes a valid masterKeyring
      const certificate = await MasterCertificate.issueCertificateForSubject(
        certifierWallet,
        subjectPubKey,
        plaintextFields,
        'TEST_CERT'
      )

      // Now subject should be able to decrypt all fields
      const decrypted = await certificate.decryptFields(subjectWallet)
      expect(decrypted).toEqual(plaintextFields)
    })

    it('should throw if masterKeyring is empty or invalid', async () => {
      // Manually create a MasterCertificate with an empty masterKeyring
      const emptyMasterKeyringCert = new MasterCertificate(
        Utils.toBase64(Random(16)),
        Utils.toBase64(Random(16)),
        subjectPubKey,
        certifierPubKey,
        mockRevocationOutpoint,
        { name: Utils.toBase64([1, 2, 3]) }, // one field
        {} // empty masterKeyring
      )

      await expect(emptyMasterKeyringCert.decryptFields(subjectWallet))
        .rejects
        .toThrow('A MasterCertificate must have a valid masterKeyring!')
    })

    it('should throw if decryption fails for any field', async () => {
      // Manually craft a scenario where the key is incorrect
      const badKeyMasterKeyring = Utils.toBase64([9, 9, 9, 9]) // Not the correct key
      const badKeyCertificate = new MasterCertificate(
        Utils.toBase64(Random(16)),
        Utils.toBase64(Random(16)),
        subjectPubKey,
        certifierPubKey,
        mockRevocationOutpoint,
        {
          name: Utils.toBase64(SymmetricKey.fromRandom().encrypt(Utils.toArray('Alice', 'utf8')) as number[])
        },
        { name: badKeyMasterKeyring }
      )

      await expect(badKeyCertificate.decryptFields(subjectWallet))
        .rejects
        .toThrow('Failed to decrypt all master certificate fields.')
    })
  })

  describe('createKeyringForVerifier', () => {
    const verifierPrivateKey = PrivateKey.fromRandom()
    const verifierPubKey = verifierPrivateKey.toPublicKey().toString()
    const verifierWallet = new ProtoWallet(verifierPrivateKey)

    let issuedCert: MasterCertificate

    beforeAll(async () => {
      issuedCert = await MasterCertificate.issueCertificateForSubject(
        certifierWallet,
        subjectPubKey,
        plaintextFields,
        'TEST_CERT'
      )
    })

    it('should create a verifier keyring for specified fields', async () => {
      // We only want to share "name" with the verifier
      const fieldsToReveal = ['name']
      const keyringForVerifier = await issuedCert.createKeyringForVerifier(
        subjectWallet,
        verifierPubKey,
        fieldsToReveal
      )

      // The new keyring should only contain "name"
      expect(Object.keys(keyringForVerifier)).toHaveLength(1)
      expect(keyringForVerifier).toHaveProperty('name')

      // Now let's create a VerifiableCertificate for the verifier
      const verifiableCert = new VerifiableCertificate(
        issuedCert.type,
        issuedCert.serialNumber,
        issuedCert.subject,
        issuedCert.certifier,
        issuedCert.revocationOutpoint,
        issuedCert.fields,
        issuedCert.signature,
        keyringForVerifier
      )

      // The verifier should successfully decrypt the "name" field
      const decrypted = await verifiableCert.decryptFields(verifierWallet)
      expect(decrypted).toEqual({ name: plaintextFields.name })
    })

    it('should throw if fields to reveal are not subset of the certificate fields', async () => {
      await expect(
        issuedCert.createKeyringForVerifier(subjectWallet, verifierPubKey, ['nonexistent_field'])
      ).rejects.toThrow(
        /Fields to reveal must be a subset of the certificate fields\. Missing the "nonexistent_field" field\./
      )
    })

    it('should throw if the master key fails to decrypt the corresponding field', async () => {
      // We'll tamper the certificate's masterKeyring so that a field key is invalid
      const tamperedCert = new MasterCertificate(
        issuedCert.type,
        issuedCert.serialNumber,
        issuedCert.subject,
        issuedCert.certifier,
        issuedCert.revocationOutpoint,
        issuedCert.fields,
        {
          // Tamper: replace 'name' field with nonsense
          name: Utils.toBase64([66, 66, 66]),
          email: issuedCert.masterKeyring.email,
          department: issuedCert.masterKeyring.department
        },
        issuedCert.signature
      )

      await expect(
        tamperedCert.createKeyringForVerifier(subjectWallet, verifierPubKey, ['name'])
      ).rejects.toThrow('Decryption of the "name" field with its revelation key failed.')
    })

    it('should support optional originator parameter', async () => {
      // Just to ensure coverage for the originator-based flows
      const fieldsToReveal = ['name']
      const keyringForVerifier = await issuedCert.createKeyringForVerifier(
        subjectWallet,
        verifierPubKey,
        fieldsToReveal,
        'my-originator'
      )
      expect(keyringForVerifier).toHaveProperty('name')
    })
  })

  describe('issueCertificateForSubject', () => {
    it('should issue a valid MasterCertificate for the given subject', async () => {
      const newPlaintextFields = {
        project: 'Top Secret',
        clearanceLevel: 'High'
      }

      const revocationFn = jest.fn().mockResolvedValue(mockRevocationOutpoint)
      const progressFn = jest.fn().mockResolvedValue(undefined)

      const newCert = await MasterCertificate.issueCertificateForSubject(
        certifierWallet,
        subjectPubKey,
        newPlaintextFields,
        'TEST_CERT',
        revocationFn,
        progressFn
      )

      expect(newCert).toBeInstanceOf(MasterCertificate)
      // The certificate's fields should be encrypted base64
      for (const fieldName in newPlaintextFields) {
        expect(newCert.fields[fieldName]).toMatch(/^[A-Za-z0-9+/]+=*$/) // base64 check
      }
      // The masterKeyring should also contain base64 strings
      for (const fieldName in newPlaintextFields) {
        expect(newCert.masterKeyring[fieldName]).toMatch(/^[A-Za-z0-9+/]+=*$/)
      }
      // Check revocation outpoint is from mock
      expect(newCert.revocationOutpoint).toEqual(mockRevocationOutpoint)
      // Check we have a signature
      expect(newCert.signature).toBeDefined()
      // Check that the progressFn and revocationFn were called
      expect(revocationFn).toHaveBeenCalledWith(newCert.serialNumber, expect.anything())
      expect(progressFn).toHaveBeenCalled()
    })
  })
})
