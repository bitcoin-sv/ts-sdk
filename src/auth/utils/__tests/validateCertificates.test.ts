import { validateCertificates } from '../../../../dist/cjs/src/auth/utils/validateCertificates.js'
import { VerifiableCertificate } from '../../../../dist/cjs/src/auth/certificates/VerifiableCertificate.js'
import { ProtoWallet } from '../../../../dist/cjs/src/wallet/index.js'
import { PrivateKey } from '../../../../dist/cjs/src/primitives/index.js'

let mockVerify = jest.fn(() => Promise.resolve(true))
let mockDecryptFields = jest.fn(() =>
  Promise.resolve({ field1: 'decryptedValue1' })
)
const mockInstances = []

jest.mock(
  '../../../../dist/cjs/src/auth/certificates/VerifiableCertificate.js',
  () => {
    return {
      VerifiableCertificate: jest.fn().mockImplementation(() => {
        const instance = {
          type: 'requested_type',
          serialNumber: 'valid_serial',
          subject: 'valid_subject',
          certifier: 'valid_certifier',
          revocationOutpoint: 'outpoint',
          fields: { field1: 'encryptedData1' },
          decryptedFields: {},
          verify: mockVerify,
          decryptFields: mockDecryptFields
        }
        mockInstances.push(instance)
        return instance
      })
    }
  }
)

describe('validateCertificates', () => {
  let verifierWallet
  let message

  beforeEach(() => {
    jest.clearAllMocks()
    mockInstances.length = 0 // Clear tracked instances

    // Reset state
    mockVerify = jest.fn(() => Promise.resolve(true))
    mockDecryptFields = jest.fn(() =>
      Promise.resolve({ field1: 'decryptedValue1' })
    )

    verifierWallet = new ProtoWallet(new PrivateKey(1))
    message = {
      identityKey: 'valid_subject',
      certificates: [
        {
          type: 'requested_type',
          serialNumber: 'valid_serial',
          subject: 'valid_subject',
          certifier: 'valid_certifier',
          revocationOutpoint: 'outpoint',
          fields: { field1: 'encryptedData1' },
          decryptedFields: {}
        }
      ]
    }
  })

  it('completes without errors for valid input', async () => {
    await expect(
      validateCertificates(verifierWallet, message)
    ).resolves.not.toThrow()

    expect(VerifiableCertificate).toHaveBeenCalledTimes(
      message.certificates.length
    )
    expect(mockVerify).toHaveBeenCalledTimes(message.certificates.length)
    expect(mockDecryptFields).toHaveBeenCalledWith(verifierWallet)
  })

  it('throws an error for mismatched identity key', async () => {
    message.identityKey = 'different_subject'

    await expect(validateCertificates(verifierWallet, message)).rejects.toThrow(
      `The subject of one of your certificates ("valid_subject") is not the same as the request sender ("different_subject").`
    )
  })

  it('throws an error if certificate signature is invalid', async () => {
    mockVerify.mockResolvedValueOnce(false)

    await expect(validateCertificates(verifierWallet, message)).rejects.toThrow(
      `The signature for the certificate with serial number valid_serial is invalid!`
    )
  })

  it('throws an error for unrequested certifier', async () => {
    const certificatesRequested = {
      certifiers: ['another_certifier'],
      types: { requested_type: ['field1'] }
    }

    await expect(
      validateCertificates(verifierWallet, message, certificatesRequested)
    ).rejects.toThrow(
      `Certificate with serial number valid_serial has an unrequested certifier: valid_certifier`
    )
  })

  it('throws an error for unrequested certificate type', async () => {
    const certificatesRequested = {
      certifiers: ['valid_certifier'],
      types: { another_type: ['field1'] }
    }

    await expect(
      validateCertificates(verifierWallet, message, certificatesRequested)
    ).rejects.toThrow(`Certificate with type requested_type was not requested`)
  })

  it('decrypts fields without throwing errors', async () => {
    await expect(
      validateCertificates(verifierWallet, message)
    ).resolves.not.toThrow()
    for (const instance of mockInstances) {
      expect(instance.decryptFields).toHaveBeenCalledWith(verifierWallet)
    }
  })

  it('throws an error if a field decryption fails', async () => {
    mockDecryptFields.mockRejectedValue(new Error('Decryption failed'))
    await expect(validateCertificates(verifierWallet, message)).rejects.toThrow(
      'Decryption failed'
    )
  })

  it('handles multiple certificates properly', async () => {
    const anotherCertificate = {
      type: 'requested_type',
      serialNumber: 'another_serial',
      subject: 'valid_subject',
      certifier: 'valid_certifier',
      revocationOutpoint: 'outpoint',
      fields: { field1: 'encryptedData1' },
      decryptedFields: {}
    }

    message.certificates.push(anotherCertificate)

    await expect(
      validateCertificates(verifierWallet, message)
    ).resolves.not.toThrow()

    expect(VerifiableCertificate).toHaveBeenCalledTimes(2)
    expect(mockVerify).toHaveBeenCalledTimes(2)
    for (const instance of mockInstances) {
      expect(instance.decryptFields).toHaveBeenCalledWith(verifierWallet)
    }
  })
})
