import {
  SymmetricKey,
  Utils,
  Base64String,
  CertificateFieldNameUnder50Bytes,
  HexString,
  OutpointString,
  PubKeyHex,
  Wallet
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
    this.masterKeyring = masterKeyring
  }

  /**
   * Creates a verifiable certificate structure for a specific verifier, allowing them access to specified fields.
   * This method decrypts the master field keys for each field specified in `fieldsToReveal` and re-encrypts them
   * for the verifier's identity key. The resulting certificate structure includes only the fields intended to be
   * revealed and a verifier-specific keyring for field decryption.
   *
   * @param {Wallet} subjectWallet - The wallet instance of the subject, used to decrypt and re-encrypt field keys.
   * @param {string} verifierIdentityKey - The public identity key of the verifier who will receive access to the specified fields.
   * @param {string[]} fieldsToReveal - An array of field names to be revealed to the verifier. Must be a subset of the certificate's fields.
   * @param {string} [originator] - Optional originator identifier, used if additional context is needed for decryption and encryption operations.
   * @returns {Promise<Object>} - A new certificate structure containing the original encrypted fields, the verifier-specific field decryption keyring, and essential certificate metadata.
   * @throws {Error} Throws an error if:
   *   - fieldsToReveal is empty or a field in `fieldsToReveal` does not exist in the certificate.
   *   - The decrypted master field key fails to decrypt the corresponding field (indicating an invalid key).
   */
  async createKeyringForVerifier(subjectWallet: Wallet, verifierIdentityKey: string, fieldsToReveal: string[], originator?: string): Promise<Record<CertificateFieldNameUnder50Bytes, string>> {
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
}
