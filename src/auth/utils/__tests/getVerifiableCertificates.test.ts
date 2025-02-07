import { WalletInterface } from '../../../wallet/Wallet.interfaces'
import { getVerifiableCertificates } from '../../../auth/utils/getVerifiableCertificates'
import { RequestedCertificateSet } from '../../../auth/types'
import { VerifiableCertificate } from '../../../auth/certificates/VerifiableCertificate'

describe('getVerifiableCertificates', () => {
  let mockWallet: WalletInterface
  let requestedCertificates: RequestedCertificateSet
  let verifierIdentityKey: string

  beforeEach(() => {
    mockWallet = {
      listCertificates: jest.fn(),
      proveCertificate: jest.fn()
    } as unknown as WalletInterface

    requestedCertificates = {
      certifiers: ['certifier1', 'certifier2'],
      types: {
        certType1: ['field1', 'field2'],
        certType2: ['field3']
      }
    }

    verifierIdentityKey = 'verifier_public_key'
  })

  it('retrieves matching certificates based on requested set', async () => {
    const mockCertificate = {
      type: 'certType1',
      serialNumber: 'serial1',
      subject: 'subject1',
      certifier: 'certifier1',
      revocationOutpoint: 'outpoint1',
      fields: { field1: 'encryptedData1', field2: 'encryptedData2' },
      signature: 'signature1'
    };

    (mockWallet.listCertificates as jest.Mock).mockResolvedValue({
      certificates: [mockCertificate]
    });
    (mockWallet.proveCertificate as jest.Mock).mockResolvedValue({
      keyringForVerifier: { field1: 'key1', field2: 'key2' }
    })

    const result = await getVerifiableCertificates(
      mockWallet,
      requestedCertificates,
      verifierIdentityKey
    )

    expect(mockWallet.listCertificates).toHaveBeenCalledWith({
      certifiers: requestedCertificates.certifiers,
      types: Object.keys(requestedCertificates.types)
    })

    expect(mockWallet.proveCertificate).toHaveBeenCalledWith({
      certificate: mockCertificate,
      fieldsToReveal: requestedCertificates.types[mockCertificate.type],
      verifier: verifierIdentityKey
    })

    expect(result).toHaveLength(1)
    expect(result[0]).toBeInstanceOf(VerifiableCertificate)
    expect(result[0]).toMatchObject({
      type: 'certType1',
      serialNumber: 'serial1',
      subject: 'subject1',
      certifier: 'certifier1',
      revocationOutpoint: 'outpoint1',
      fields: { field1: 'encryptedData1', field2: 'encryptedData2' },
      signature: 'signature1',
      keyring: { field1: 'key1', field2: 'key2' }
    })
  })

  it('returns an empty array when no matching certificates are found', async () => {
    (mockWallet.listCertificates as jest.Mock).mockResolvedValue({
      certificates: []
    })

    const result = await getVerifiableCertificates(
      mockWallet,
      requestedCertificates,
      verifierIdentityKey
    )

    expect(result).toEqual([])
    expect(mockWallet.listCertificates).toHaveBeenCalled()
    expect(mockWallet.proveCertificate).not.toHaveBeenCalled()
  })

  it('propagates errors from listCertificates', async () => {
    (mockWallet.listCertificates as jest.Mock).mockRejectedValue(
      new Error('listCertificates failed')
    )

    await expect(
      getVerifiableCertificates(
        mockWallet,
        requestedCertificates,
        verifierIdentityKey
      )
    ).rejects.toThrow('listCertificates failed')
  })

  it('propagates errors from proveCertificate', async () => {
    const mockCertificate = {
      type: 'certType1',
      serialNumber: 'serial1',
      subject: 'subject1',
      certifier: 'certifier1',
      revocationOutpoint: 'outpoint1',
      fields: { field1: 'encryptedData1', field2: 'encryptedData2' },
      signature: 'signature1'
    };

    (mockWallet.listCertificates as jest.Mock).mockResolvedValue({
      certificates: [mockCertificate]
    });
    (mockWallet.proveCertificate as jest.Mock).mockRejectedValue(
      new Error('proveCertificate failed')
    )

    await expect(
      getVerifiableCertificates(
        mockWallet,
        requestedCertificates,
        verifierIdentityKey
      )
    ).rejects.toThrow('proveCertificate failed')
  })

  it('handles empty requested certificates gracefully', async () => {
    requestedCertificates = { certifiers: [], types: {} };
    (mockWallet.listCertificates as jest.Mock).mockResolvedValue({
      certificates: []
    })

    const result = await getVerifiableCertificates(
      mockWallet,
      requestedCertificates,
      verifierIdentityKey
    )

    expect(result).toEqual([])
    expect(mockWallet.listCertificates).toHaveBeenCalledWith({
      certifiers: [],
      types: []
    })
  })
})
