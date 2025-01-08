import { PrivateKey, SymmetricKey, Utils, Wallet, ProtoWallet } from "../../../mod.js"
import { MasterCertificate } from "../certificates/MasterCertificate.js"
import { VerifiableCertificate } from "../certificates/VerifiableCertificate.js"

/**
 * Creates a Master Certificate by encrypting provided fields and generating a master keyring.
 * 
 * @param {Wallet} wallet - The wallet instance used for encryption and public key retrieval.
 * @param {Record<string, string>} fields - The certificate fields to encrypt.
 * @param {string} certificateType - The type of the certificate being created.
 * @param {string} certificateSerialNumber - The serial number of the certificate.
 * @param {string} certifierPublicKey - The public key of the certifier.
 * @returns {Promise<MasterCertificate>} A promise resolving to the created Master Certificate.
 */
export async function createMasterCertificate(
  wallet: Wallet,
  fields: Record<string, string>,
  certificateType: string,
  certificateSerialNumber: string,
  certifierPublicKey: string
): Promise<MasterCertificate> {
  const certificateFields: Record<string, string> = {}
  const masterKeyring: Record<string, string> = {}

  for (const fieldName in fields) {
    const fieldSymmetricKey = SymmetricKey.fromRandom()
    const encryptedFieldValue = fieldSymmetricKey.encrypt(Utils.toArray(fields[fieldName], 'utf8'))
    certificateFields[fieldName] = Utils.toBase64(encryptedFieldValue as number[])

    const encryptedFieldKey = await wallet.encrypt({
      plaintext: fieldSymmetricKey.toArray(),
      protocolID: [2, 'certificate field encryption'],
      keyID: `${certificateSerialNumber} ${fieldName}`,
      counterparty: 'self'
    })
    masterKeyring[fieldName] = Utils.toBase64(encryptedFieldKey.ciphertext)
  }

  return new MasterCertificate(
    certificateType,
    certificateSerialNumber,
    (await wallet.getPublicKey({ identityKey: true })).publicKey,
    certifierPublicKey,
    'revocationOutpoint',
    certificateFields,
    masterKeyring
  )
}

/**
 * Creates a Verifiable Certificate by signing a Master Certificate and generating a keyring for a verifier.
 * 
 * @param {MasterCertificate} masterCertificate - The master certificate to convert into a verifiable certificate.
 * @param {Wallet} wallet - The wallet instance used for generating a keyring for the verifier.
 * @param {string} verifierIdentityKey - The identity key of the verifier.
 * @param {string[]} fieldsToReveal - The list of fields to reveal to the verifier.
 * @param {PrivateKey} certifierPrivateKey - The private key of the certifier for signing the certificate.
 * @returns {Promise<VerifiableCertificate>} A promise resolving to the created Verifiable Certificate.
 */
export async function createVerifiableCertificate(
  masterCertificate: MasterCertificate,
  wallet: Wallet,
  verifierIdentityKey: string,
  fieldsToReveal: string[],
  certifierWallet: Wallet
): Promise<VerifiableCertificate> {
  await masterCertificate.sign(certifierWallet)

  const keyringForVerifier = await masterCertificate.createKeyringForVerifier(
    wallet,
    verifierIdentityKey,
    fieldsToReveal
  )

  return new VerifiableCertificate(
    masterCertificate.type,
    masterCertificate.serialNumber,
    masterCertificate.subject,
    masterCertificate.certifier,
    masterCertificate.revocationOutpoint,
    masterCertificate.fields,
    masterCertificate.signature,
    keyringForVerifier
  )
}
