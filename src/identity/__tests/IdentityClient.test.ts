import { WalletCertificate, WalletInterface } from '../../wallet/index'
import { IdentityClient } from '../IdentityClient'
import { Certificate } from '../../auth/certificates/index.js'
import { KNOWN_IDENTITY_TYPES, defaultIdentity } from '../types/index.js'

// ----- Mocks for external dependencies -----
jest.mock('../../script', () => {
  return {
    PushDrop: jest.fn().mockImplementation(() => ({
      lock: jest.fn().mockResolvedValue({
        toHex: () => 'lockingScriptHex'
      }),
      unlock: jest.fn()
    }))
  }
})

jest.mock('../../overlay-tools/index.js', () => {
  return {
    TopicBroadcaster: jest.fn().mockImplementation(() => ({
      broadcast: jest.fn().mockResolvedValue('broadcastResult')
    }))
  }
})

jest.mock('../../transaction/index.js', () => {
  return {
    Transaction: {
      fromAtomicBEEF: jest.fn().mockImplementation((tx) => ({
        toHexBEEF: () => 'transactionHex'
      })),
      fromBEEF: jest.fn()
    }
  }
})

// ----- Begin Test Suite -----
describe('IdentityClient', () => {
  let walletMock: Partial<WalletInterface>
  let identityClient: IdentityClient

  beforeEach(() => {
    // Create a fake wallet implementing the methods used by IdentityClient.
    walletMock = {
      proveCertificate: jest.fn().mockResolvedValue({ keyringForVerifier: 'fakeKeyring' }),
      createAction: jest.fn().mockResolvedValue({
        tx: [1, 2, 3],
        signableTransaction: { tx: [1, 2, 3], reference: 'ref' }
      }),
      listCertificates: jest.fn().mockResolvedValue({ certificates: [] }),
      acquireCertificate: jest.fn().mockResolvedValue({
        fields: { name: 'Alice' },
        verify: jest.fn().mockResolvedValue(true)
      }),
      signAction: jest.fn().mockResolvedValue({ tx: [4, 5, 6] }),
      getNetwork: jest.fn().mockResolvedValue({ network: 'testnet' }),
      discoverByIdentityKey: jest.fn(),
      discoverByAttributes: jest.fn()
    }

    identityClient = new IdentityClient(walletMock as WalletInterface)

    // Clear any previous calls/spies.
    jest.clearAllMocks()
  })

  describe('publiclyRevealAttributes', () => {
    it('should throw an error if certificate has no fields', async () => {
      const certificate = {
        fields: {},
        verify: jest.fn().mockResolvedValue(true)
      } as any as WalletCertificate
      const fieldsToReveal = ['name']
      await expect(
        identityClient.publiclyRevealAttributes(certificate, fieldsToReveal)
      ).rejects.toThrow('Certificate has no fields to reveal!')
    })

    it('should throw an error if fieldsToReveal is empty', async () => {
      const certificate = {
        fields: { name: 'Alice' },
        verify: jest.fn().mockResolvedValue(true)
      } as any as WalletCertificate
      const fieldsToReveal: string[] = []
      await expect(
        identityClient.publiclyRevealAttributes(certificate, fieldsToReveal)
      ).rejects.toThrow('You must reveal at least one field!')
    })

    it('should throw an error if certificate verification fails', async () => {
      const certificate = {
        fields: { name: 'Alice' },
        verify: jest.fn().mockRejectedValue(new Error('Verification error')),
        type: 'dummyType',
        serialNumber: 'dummySerial',
        subject: 'dummySubject',
        certifier: 'dummyCertifier',
        revocationOutpoint: 'dummyRevocation',
        signature: 'dummySignature'
      } as any as WalletCertificate
      const fieldsToReveal = ['name']
      await expect(
        identityClient.publiclyRevealAttributes(certificate, fieldsToReveal)
      ).rejects.toThrow('Certificate verification failed!')
    })

    it('should publicly reveal attributes successfully', async () => {
      // Prepare a dummy certificate with all required properties.
      const certificate = {
        fields: { name: 'Alice' },
        verify: jest.fn().mockResolvedValue(true), // this property is not used since the Certificate is re-instantiated
        type: 'xCert',
        serialNumber: '12345',
        subject: 'abcdef1234567890',
        certifier: 'CertifierX',
        revocationOutpoint: 'outpoint1',
        signature: 'signature1'
      } as any as WalletCertificate

      // Ensure that Certificate.verify (called on the re-instantiated Certificate)
      // resolves successfully.
      jest.spyOn(Certificate.prototype, 'verify').mockResolvedValue(false)

      const fieldsToReveal = ['name']
      const result = await identityClient.publiclyRevealAttributes(certificate, fieldsToReveal)
      expect(result).toEqual('broadcastResult')

      // Validate that proveCertificate was called with the proper arguments.
      expect(walletMock.proveCertificate).toHaveBeenCalledWith({
        certificate,
        fieldsToReveal,
        verifier: expect.any(String)
      })

      // Validate that createAction was called.
      expect(walletMock.createAction).toHaveBeenCalled()
    })
  })

  describe('resolveByIdentityKey', () => {
    it('should return parsed identities from discovered certificates', async () => {
      const dummyCertificate = {
        type: KNOWN_IDENTITY_TYPES.xCert,
        subject: 'abcdef1234567890',
        decryptedFields: {
          userName: 'Alice',
          profilePhoto: 'alicePhotoUrl'
        },
        certifierInfo: {
          name: 'CertifierX',
          iconUrl: 'certifierIconUrl'
        }
      }
      // Mock discoverByIdentityKey to return a certificate list.
      walletMock.discoverByIdentityKey = jest.fn().mockResolvedValue({ certificates: [dummyCertificate] })

      const identities = await identityClient.resolveByIdentityKey({ identityKey: 'dummyKey' })
      expect(walletMock.discoverByIdentityKey).toHaveBeenCalledWith({ identityKey: 'dummyKey' }, undefined)
      expect(identities).toHaveLength(1)
      expect(identities[0]).toEqual({
        name: 'Alice',
        avatarURL: 'alicePhotoUrl',
        abbreviatedKey: 'abcdef1234...',
        identityKey: 'abcdef1234567890',
        badgeLabel: 'X account certified by CertifierX',
        badgeIconURL: 'certifierIconUrl',
        badgeClickURL: 'https://socialcert.net'
      })
    })
  })

  it('should throw if createAction returns no tx', async () => {
    const certificate = {
      fields: { name: 'Alice' },
      verify: jest.fn().mockResolvedValue(true),
      type: 'xCert',
      serialNumber: '12345',
      subject: 'abcdef1234567890',
      certifier: 'CertifierX',
      revocationOutpoint: 'outpoint1',
      signature: 'signature1'
    } as any as WalletCertificate

    jest.spyOn(Certificate.prototype, 'verify').mockResolvedValue(false)

    // Simulate createAction returning an object with tx = undefined
    walletMock.createAction = jest.fn().mockResolvedValue({
      tx: undefined,
      signableTransaction: { tx: undefined, reference: 'ref' }
    })

    const fieldsToReveal = ['name']

    await expect(
      identityClient.publiclyRevealAttributes(certificate, fieldsToReveal)
    ).rejects.toThrow('Public reveal failed: failed to create action!')
  })

  describe('resolveByAttributes', () => {
    it('should return parsed identities from discovered certificates', async () => {
      const dummyCertificate = {
        type: KNOWN_IDENTITY_TYPES.emailCert,
        subject: 'emailSubject1234',
        decryptedFields: {
          email: 'alice@example.com',
          profilePhoto: 'ignored' // not used for email type
        },
        certifierInfo: {
          name: 'EmailCertifier',
          iconUrl: 'emailIconUrl'
        }
      }
      // Mock discoverByAttributes to return a certificate list.
      walletMock.discoverByAttributes = jest.fn().mockResolvedValue({ certificates: [dummyCertificate] })

      const identities = await identityClient.resolveByAttributes({ attributes: { email: 'alice@example.com' } })
      expect(walletMock.discoverByAttributes).toHaveBeenCalledWith({ attributes: { email: 'alice@example.com' } }, undefined)
      expect(identities).toHaveLength(1)
      expect(identities[0]).toEqual({
        name: 'alice@example.com',
        avatarURL: 'XUTZxep7BBghAJbSBwTjNfmcsDdRFs5EaGEgkESGSgjJVYgMEizu',
        abbreviatedKey: 'emailSubje...',
        identityKey: 'emailSubject1234',
        badgeLabel: 'Email certified by EmailCertifier',
        badgeIconURL: 'emailIconUrl',
        badgeClickURL: 'https://socialcert.net'
      })
    })
  })

  describe('parseIdentity', () => {
    it('should correctly parse an xCert identity', () => {
      const dummyCertificate = {
        type: KNOWN_IDENTITY_TYPES.xCert,
        subject: 'abcdef1234567890',
        decryptedFields: {
          userName: 'Alice',
          profilePhoto: 'alicePhotoUrl'
        },
        certifierInfo: {
          name: 'CertifierX',
          iconUrl: 'certifierIconUrl'
        }
      }
      const identity = IdentityClient.parseIdentity(dummyCertificate as unknown as any)
      expect(identity).toEqual({
        name: 'Alice',
        avatarURL: 'alicePhotoUrl',
        abbreviatedKey: 'abcdef1234...',
        identityKey: 'abcdef1234567890',
        badgeLabel: 'X account certified by CertifierX',
        badgeIconURL: 'certifierIconUrl',
        badgeClickURL: 'https://socialcert.net'
      })
    })

    it('should return default identity for unknown type', () => {
      const dummyCertificate = {
        type: 'unknownType',
        subject: '',
        decryptedFields: {
          profilePhoto: 'defaultPhoto'
        },
        certifierInfo: {}
      }
      const identity = IdentityClient.parseIdentity(dummyCertificate as any)
      expect(identity).toEqual({
        name: defaultIdentity.name,
        avatarURL: 'defaultPhoto',
        abbreviatedKey: '',
        identityKey: '',
        badgeLabel: defaultIdentity.badgeLabel,
        badgeIconURL: defaultIdentity.badgeIconURL,
        badgeClickURL: defaultIdentity.badgeClickURL
      })
    })
  })
})
