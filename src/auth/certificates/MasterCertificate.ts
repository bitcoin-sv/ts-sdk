import {
  SymmetricKey,
  Utils,
  Base64String,
  CertificateFieldNameUnder50Bytes,
  HexString,
  OutpointString,
  PubKeyHex,
  ProtoWallet,
  Random
} from '../../../mod.js'
import Certificate from './Certificate.js'

/**
 * MasterCertificate extends the base Certificate class to manage a master keyring, enabling the creation of verifiable certificates.
 *
 * It allows for the selective disclosure of certificate fields by creating a `VerifiableCertificate` for a specific verifier.
 * The `MasterCertificate` can securely decrypt each master key and re-encrypt it for a verifier, creating a customized
 * keyring containing only the keys necessary for the verifier to access designated fields.
 *
 */
export class MasterCertificate extends Certificate {
  declare type: Base64String
  declare serialNumber: Base64String
  declare subject: PubKeyHex
  declare certifier: PubKeyHex
  declare revocationOutpoint: OutpointString
  declare fields: Record<CertificateFieldNameUnder50Bytes, string>
  declare signature?: HexString

  masterKeyring: Record<CertificateFieldNameUnder50Bytes, string>

  constructor(
    type: Base64String,
    serialNumber: Base64String,
    subject: PubKeyHex,
    certifier: PubKeyHex,
    revocationOutpoint: OutpointString,
    fields: Record<CertificateFieldNameUnder50Bytes, string>,
    masterKeyring: Record<CertificateFieldNameUnder50Bytes, string>,
    signature?: HexString
  ) {
    super(type, serialNumber, subject, certifier, revocationOutpoint, fields, signature)

    // Ensure every field in `fields` has a corresponding key in `masterKeyring`
    // TODO: Consider additional checks that would be helpful
    for (const fieldName of Object.keys(fields)) {
      if (!masterKeyring[fieldName]) {
        throw new Error(
          `Master keyring must contain a value for every field. Missing key for field: "${fieldName}".`
        );
      }
    }

    this.masterKeyring = masterKeyring
  }

  /**
   * Creates a keyring for a verifier, enabling them to decrypt specific certificate fields.
   * This method decrypts the master field keys for the specified fields and re-encrypts them
   * for the verifier's identity key. The result is a keyring containing the keys necessary
   * for the verifier to access the designated fields.
   *
   * @param {ProtoWallet} subjectWallet - The wallet instance of the subject, used to decrypt and re-encrypt field keys.
   * @param {string} verifierIdentityKey - The public identity key of the verifier who will receive access to the specified fields.
   * @param {string[]} fieldsToReveal - An array of field names to be revealed to the verifier. Must be a subset of the certificate's fields.
   * @param {string} [originator] - Optional originator identifier, used if additional context is needed for decryption and encryption operations.
   * @returns {Promise<Record<CertificateFieldNameUnder50Bytes, string>>} - A keyring mapping field names to encrypted field revelation keys, allowing the verifier to decrypt specified fields.
   * @throws {Error} Throws an error if:
   *   - fieldsToReveal is not an array of strings.
   *   - A field in `fieldsToReveal` does not exist in the certificate.
   *   - The decrypted master field key fails to decrypt the corresponding field (indicating an invalid key).
   */
  async createKeyringForVerifier(subjectWallet: ProtoWallet, verifierIdentityKey: string, fieldsToReveal: string[], originator?: string): Promise<Record<CertificateFieldNameUnder50Bytes, string>> {
    if (!Array.isArray(fieldsToReveal)) {
      throw new Error('fieldsToReveal must be an array of strings')
    }
    const fieldRevelationKeyring = {}
    for (const fieldName of fieldsToReveal) {
      // Make sure that fields to reveal is a subset of the certificate fields
      if (!this.fields[fieldName]) {
        throw new Error(`Fields to reveal must be a subset of the certificate fields. Missing the "${fieldName}" field.`)
      }

      // Create a keyID
      const keyID = `${this.serialNumber} ${fieldName}`
      const encryptedMasterFieldKey = this.masterKeyring[fieldName]

      // Decrypt the master field key
      const { plaintext: masterFieldKey } = await subjectWallet.decrypt({
        ciphertext: Utils.toArray(encryptedMasterFieldKey, 'base64'),
        protocolID: [2, 'certificate field encryption'],
        keyID,
        counterparty: 'self'
      }, originator)

      // Verify that derived key actually decrypts requested field
      try {
        new SymmetricKey(masterFieldKey).decrypt(Utils.toArray(this.fields[fieldName], 'base64'))
      } catch (_) {
        throw new Error(`Decryption of the "${fieldName}" field with its revelation key failed.`)
      }

      // Encrypt derived fieldRevelationKey for verifier
      const { ciphertext: encryptedFieldRevelationKey } = await subjectWallet.encrypt({
        plaintext: masterFieldKey,
        protocolID: [2, 'certificate field encryption'],
        keyID: `${this.serialNumber} ${fieldName}`,
        counterparty: verifierIdentityKey
      }, originator)

      // Add encryptedFieldRevelationKey to fieldRevelationKeyring
      fieldRevelationKeyring[fieldName] = Utils.toBase64(encryptedFieldRevelationKey)
    }

    // Return the field revelation keyring which can be used to create a verifiable certificate for a verifier.
    return fieldRevelationKeyring
  }

  /**
   * Issues a new MasterCertificate for a specified subject.
   * 
   * This method generates a certificate containing encrypted fields and a keyring
   * for the subject to decrypt all fields. Each field is encrypted with a randomly
   * generated symmetric key, which is then encrypted for the subject. The certificate
   * can also includes a revocation outpoint to manage potential revocation.
   * 
   * @param {ProtoWallet} certifierWallet - The wallet of the certifier, used to sign the certificate and encrypt field keys.
   * @param {string} subject - The public identity key of the subject for whom the certificate is issued.
   * @param {Record<CertificateFieldNameUnder50Bytes, string>} fields - A certificate fields to include, with their names and values.
   * @param {string} certificateType - The type of certificate being issued.
   * @param {function(string, Record<CertificateFieldNameUnder50Bytes, string>?): Promise<string>} getRevocationOutpoint - 
   *   Optional function to obtain a revocation outpoint for the certificate. Defaults to a placeholder.
   * @param {function(string): Promise<void>} updateProgress - Optional callback for reporting progress updates during the operation. Defaults to a no-op.
   * @returns {Promise<MasterCertificate>} - A signed MasterCertificate instance containing the encrypted fields and subject specific keyring.
   * 
   * @throws {Error} Throws an error if any operation (e.g., encryption, signing) fails during certificate issuance.
   */
  static async issueCertificateForSubject(
    certifierWallet: ProtoWallet,
    subject: string,
    fields: Record<CertificateFieldNameUnder50Bytes, string>,
    certificateType: string,
    getRevocationOutpoint = async (
      serialNumber: string,
      fields?: Record<CertificateFieldNameUnder50Bytes, string>
    ): Promise<string> => { return 'Certificate revocation not tracked.' },
    updateProgress: (message: string) => Promise<void> = async () => { }
  ): Promise<MasterCertificate> {
    // 1. Generate serialNumber
    const serialNumber = Utils.toBase64(Random(32))

    const encryptedCertificateFields: Record<CertificateFieldNameUnder50Bytes, string> = {}
    const keyringForSubject: Record<CertificateFieldNameUnder50Bytes, string> = {}

    // 2. For each field, generate a random key -> encrypt field -> encrypt key
    for (const [fieldName, fieldValue] of Object.entries(fields)) {
      const fieldSymmetricKey = SymmetricKey.fromRandom()
      const encryptedFieldValue = fieldSymmetricKey.encrypt(Utils.toArray(fieldValue, 'utf8'))
      encryptedCertificateFields[fieldName] = Utils.toBase64(encryptedFieldValue as number[])
      const { ciphertext: encryptedFieldRevelationKey } = await certifierWallet.encrypt({
        plaintext: fieldSymmetricKey.toArray(),
        protocolID: [2, 'certificate field encryption'], // Standard certificate protocol ID
        keyID: `${serialNumber} ${fieldName}`,
        counterparty: subject
      })
      keyringForSubject[fieldName] = Utils.toBase64(encryptedFieldRevelationKey)
    }

    // 3. Obtain a revocation outpoint (ex. certifier can call wallet.createAction())
    const revocationOutpoint = await getRevocationOutpoint(serialNumber)
    // TODO: Validate revocation outpoint format

    // 4. Create new MasterCertificate instance
    const certificate = new MasterCertificate(
      certificateType,
      serialNumber,
      subject,
      (await certifierWallet.getPublicKey({ identityKey: true })).publicKey,
      revocationOutpoint,
      encryptedCertificateFields,
      keyringForSubject
    )

    // 5. Sign and return the new MasterCertificate certifying the subject.
    await certificate.sign(certifierWallet)
    return certificate
  }
}
