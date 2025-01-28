import { WalletInterface } from '../../wallet/index.js'
import { AuthMessage, RequestedCertificateSet } from '../types.js'
import { VerifiableCertificate } from '../certificates/VerifiableCertificate.js'

/**
 * Validates and processes the certificates received from a peer.
 *
 * @private
 * @param {AuthMessage} message - The message containing the certificates to validate.
 * @returns {Promise<void>}
 * @throws Will throw an error if certificate validation or field decryption fails.
 */
export const validateCertificates = async (
  verifierWallet: WalletInterface,
  message: AuthMessage,
  certificatesRequested?: RequestedCertificateSet
): Promise<void> => {
  await Promise.all(
    message.certificates.map(async (incomingCert: VerifiableCertificate) => {
      if (incomingCert.subject !== message.identityKey) {
        throw new Error(
          `The subject of one of your certificates ("${incomingCert.subject}") is not the same as the request sender ("${message.identityKey}").`
        )
      }

      // Verify Certificate structure and signature
      const certToVerify = new VerifiableCertificate(
        incomingCert.type,
        incomingCert.serialNumber,
        incomingCert.subject,
        incomingCert.certifier,
        incomingCert.revocationOutpoint,
        incomingCert.fields,
        incomingCert.signature,
        incomingCert.keyring
      )
      const isValidCert = await certToVerify.verify()
      if (!isValidCert) {
        throw new Error(
          `The signature for the certificate with serial number ${certToVerify.serialNumber} is invalid!`
        )
      }

      // Check if the certificate matches requested certifiers, types, and fields
      if (certificatesRequested) {
        const { certifiers, types } = certificatesRequested

        // Check certifier matches
        if (!certifiers.includes(certToVerify.certifier)) {
          throw new Error(
            `Certificate with serial number ${certToVerify.serialNumber} has an unrequested certifier: ${certToVerify.certifier}`
          )
        }

        // Check type and fields match requested
        const requestedFields = types[certToVerify.type]
        if (!requestedFields) {
          throw new Error(
            `Certificate with type ${certToVerify.type} was not requested`
          )
        }
      }

      // Attempt to decrypt fields
      await certToVerify.decryptFields(verifierWallet)
    })
  )
}
