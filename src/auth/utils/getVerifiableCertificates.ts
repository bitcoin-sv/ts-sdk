import { VerifiableCertificate } from '../certificates/VerifiableCertificate.js'
import { WalletInterface } from '../../wallet/Wallet.interfaces.js'
import { RequestedCertificateSet } from '../types.js'

/**
 * Retrieves an array of verifiable certificates based on the request.
 *
 * @private
 * @param {RequestedCertificateSet} requestedCertificates - The set of certificates requested by the peer.
 * @param {string} verifierIdentityKey - The public key of the verifier requesting the certificates.
 * @returns {Promise<VerifiableCertificate[]>} An array of verifiable certificates.
 */
export const getVerifiableCertificates = async (
  wallet: WalletInterface,
  requestedCertificates: RequestedCertificateSet,
  verifierIdentityKey: string
): Promise<VerifiableCertificate[]> => {
  // Find matching certificates we have
  // Note: This may return multiple certificates that match the correct type.
  const matchingCertificates = await wallet.listCertificates({
    certifiers: requestedCertificates.certifiers,
    types: Object.keys(requestedCertificates.types)
  })

  // For each certificate requested, create a verifiable cert with selectively revealed fields
  return await Promise.all(
    matchingCertificates.certificates.map(async (certificate) => {
      const { keyringForVerifier } = await wallet.proveCertificate({
        certificate,
        fieldsToReveal: requestedCertificates.types[certificate.type],
        verifier: verifierIdentityKey
      })
      return new VerifiableCertificate(
        certificate.type,
        certificate.serialNumber,
        certificate.subject,
        certificate.certifier,
        certificate.revocationOutpoint,
        certificate.fields,
        keyringForVerifier,
        certificate.signature
      )
    })
  )
}
