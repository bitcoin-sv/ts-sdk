import { Peer } from "../../../dist/cjs/src/auth/Peer.js"
import { AuthMessage, Transport } from "../../../dist/cjs/src/auth/types.js"
import { jest } from '@jest/globals'
import { Wallet } from "../../../dist/cjs/src/wallet/Wallet.interfaces.js"
import { ProtoWallet } from '../../../dist/cjs/src/wallet/index.js'
import { Utils, PrivateKey, SymmetricKey } from '../../../dist/cjs/src/primitives/index.js'
import { VerifiableCertificate, } from "../../../dist/cjs/src/auth/certificates/VerifiableCertificate.js"
import { MasterCertificate } from '../../../dist/cjs/src/auth/certificates/MasterCertificate.js'
import { getVerifiableCertificates } from '../../../dist/cjs/src/auth/utils/getVerifiableCertificates.js'
jest.mock('../../../dist/cjs/src/auth/utils/getVerifiableCertificates.js')

class LocalTransport implements Transport {
  private peerTransport?: LocalTransport
  private onDataCallback?: (message: AuthMessage) => void

  connect(peerTransport: LocalTransport): void {
    this.peerTransport = peerTransport
    peerTransport.peerTransport = this
  }

  async send(message: AuthMessage): Promise<void> {
    if (this.peerTransport && this.peerTransport.onDataCallback) {
      // Simulate message delivery by calling the onData callback of the peer
      this.peerTransport.onDataCallback(message)
    } else {
      throw new Error("Peer transport is not connected or not listening for data.")
    }
  }

  async onData(callback: (message: AuthMessage) => Promise<void>): Promise<void> {
    this.onDataCallback = callback
  }
}

describe('Peer class mutual authentication and certificate exchange', () => {
  let walletA: Wallet, walletB: Wallet
  let transportA: LocalTransport, transportB: LocalTransport
  let alice: Peer, bob: Peer
  let certificatesReceivedByAlice: VerifiableCertificate[] | undefined
  let certificatesReceivedByBob: VerifiableCertificate[] | undefined

  const certificateType = Utils.toBase64(new Array(32).fill(1))
  const certificateSerialNumber = Utils.toBase64(new Array(32).fill(2))
  const certifierPrivateKey = PrivateKey.fromRandom()
  const certifierPublicKey = certifierPrivateKey.toPublicKey().toString()
  const certificatesToRequest = {
    certifiers: [certifierPublicKey],
    types: { [certificateType]: ['name', 'email'] }
  }

  const aliceFields = { name: 'Alice', email: 'alice@example.com', libraryCardNumber: 'A123456' }
  const bobFields = { name: 'Bob', email: 'bob@example.com', libraryCardNumber: 'B654321' }

  async function createMasterCertificate(subjectWallet: Wallet, fields: Record<string, string>) {
    const subjectPubKey = (await subjectWallet.getPublicKey({ identityKey: true })).publicKey
    const certifierWallet = new ProtoWallet(certifierPrivateKey)

    // Issue a new MasterCertificate for the subject (e.g. Alice/Bob)
    const masterCertificate = await MasterCertificate.issueCertificateForSubject(
      certifierWallet,
      subjectPubKey,
      fields,
      certificateType,
      async () => 'revocationOutpoint' // or any revocation outpoint logic you want
    )

    // For test consistency, override the automatically generated serialNumber 
    // with the globally used 'certificateSerialNumber' and re-sign:
    // masterCertificate.signature = undefined
    // masterCertificate.serialNumber = certificateSerialNumber
    // await masterCertificate.sign(certifierWallet)

    return masterCertificate
  }

  async function createVerifiableCertificate(
    masterCertificate: MasterCertificate,
    wallet: Wallet,
    verifierIdentityKey: string,
    fieldsToReveal: string[]
  ): Promise<VerifiableCertificate> {
    const certifierWallet = new ProtoWallet(certifierPrivateKey)

    const keyringForVerifier = await MasterCertificate.createKeyringForVerifier(
      wallet,
      certifierWallet.keyDeriver.identityKey,
      verifierIdentityKey,
      masterCertificate.fields,
      fieldsToReveal,
      masterCertificate.masterKeyring,
      masterCertificate.serialNumber
    )
    return new VerifiableCertificate(
      masterCertificate.type,
      masterCertificate.serialNumber,
      masterCertificate.subject,
      masterCertificate.certifier,
      masterCertificate.revocationOutpoint,
      masterCertificate.fields,
      keyringForVerifier,
      masterCertificate.signature
    )
  }

  function setupPeers(
    aliceRequests: boolean,
    bobRequests: boolean,
    options: {
      aliceCertsToRequest?: typeof certificatesToRequest,
      bobCertsToRequest?: typeof certificatesToRequest
    } = {}
  ) {
    const { aliceCertsToRequest = certificatesToRequest, bobCertsToRequest = certificatesToRequest } = options

    alice = new Peer(walletA, transportA, aliceRequests ? aliceCertsToRequest : undefined)
    bob = new Peer(walletB, transportB, bobRequests ? bobCertsToRequest : undefined)

    const aliceReceivedCertificates = new Promise<void>((resolve) => {
      alice.listenForCertificatesReceived((senderPublicKey, certificates) => {
        certificatesReceivedByAlice = certificates
        resolve()
      })
    })

    const bobReceivedCertificates = new Promise<void>((resolve) => {
      bob.listenForCertificatesReceived((senderPublicKey, certificates) => {
        certificatesReceivedByBob = certificates
        resolve()
      })
    })

    return { aliceReceivedCertificates, bobReceivedCertificates }
  }

  function mockGetVerifiableCertificates(
    aliceCertificate: VerifiableCertificate | undefined,
    bobCertificate: VerifiableCertificate | undefined,
    alicePubKey: string,
    bobPubKey: string
  ) {
    (getVerifiableCertificates as jest.Mock).mockImplementation((wallet, _, verifierIdentityKey) => {
      if (wallet === walletA && verifierIdentityKey === bobPubKey) {
        return aliceCertificate ? Promise.resolve([aliceCertificate]) : Promise.resolve([])
      } else if (wallet === walletB && verifierIdentityKey === alicePubKey) {
        return bobCertificate ? Promise.resolve([bobCertificate]) : Promise.resolve([])
      }
      return Promise.resolve([])
    });
  }

  beforeEach(async () => {
    transportA = new LocalTransport()
    transportB = new LocalTransport()
    transportA.connect(transportB)

    certificatesReceivedByAlice = []
    certificatesReceivedByBob = []

    walletA = new ProtoWallet(PrivateKey.fromRandom())
    walletB = new ProtoWallet(PrivateKey.fromRandom())
  })

  it('Neither Alice nor Bob request certificates, mutual authentication completes successfully', async () => {
    const { aliceReceivedCertificates, bobReceivedCertificates } = setupPeers(false, false)

    const bobReceivedGeneralMessage = new Promise<void>((resolve) => {
      bob.listenForGeneralMessages(async (senderPublicKey, payload) => {
        console.log('Bob received message:', Utils.toUTF8(payload))
        await bob.toPeer(Utils.toArray('Hello Alice!'), senderPublicKey)
        resolve()
      })
    })
    const aliceReceivedGeneralMessage = new Promise<void>((resolve) => {
      alice.listenForGeneralMessages(async (senderPublicKey, payload) => {
        console.log('Alice received message:', Utils.toUTF8(payload))
        resolve()
      })
    })

    await alice.toPeer(Utils.toArray('Hello Bob!'))
    await bobReceivedGeneralMessage
    await aliceReceivedGeneralMessage

    expect(certificatesReceivedByAlice).toEqual([])
    expect(certificatesReceivedByBob).toEqual([])
  }, 15000)

  it('Bob requests certificates from Alice, Alice does not request any from Bob', async () => {
    const alicePubKey = (await walletA.getPublicKey({ identityKey: true })).publicKey
    const bobPubKey = (await walletB.getPublicKey({ identityKey: true })).publicKey

    const aliceMasterCertificate = await createMasterCertificate(walletA, aliceFields)
    const aliceVerifiableCertificate = await createVerifiableCertificate(
      aliceMasterCertificate,
      walletA,
      bobPubKey,
      certificatesToRequest.types[certificateType]
    )

    const { bobReceivedCertificates } = setupPeers(false, true)
    mockGetVerifiableCertificates(aliceVerifiableCertificate, undefined, alicePubKey, bobPubKey)

    const bobReceivedGeneralMessage = new Promise<void>((resolve) => {
      bob.listenForGeneralMessages(async (senderPublicKey, payload) => {
        await bobReceivedCertificates
        if (certificatesReceivedByBob?.length !== 0) {
          certificatesReceivedByBob?.forEach(async cert => {
            // Decrypt to ensure it has the correct fields
            const decryptedFields = await cert.decryptFields(walletB)
            if (cert.certifier !== 'bob') {
              console.log('Bob accepted the message:', Utils.toUTF8(payload))
              console.log('Decrypted fields:', decryptedFields)
            }
          })
        }
        resolve()
      })
    })

    await alice.toPeer(Utils.toArray('Hello Bob!'))
    await bobReceivedGeneralMessage

    expect(certificatesReceivedByAlice).toEqual([])
    expect(certificatesReceivedByBob).toEqual([aliceVerifiableCertificate])
  }, 15000)

  it('Alice requests Bob to present his library card before lending him a book', async () => {
    const alicePubKey = (await walletA.getPublicKey({ identityKey: true })).publicKey
    const bobPubKey = (await walletB.getPublicKey({ identityKey: true })).publicKey

    // Bob's certificate includes his library card number
    const bobMasterCertificate = await createMasterCertificate(walletB, bobFields)
    const bobVerifiableCertificate = await createVerifiableCertificate(
      bobMasterCertificate,
      walletB,
      alicePubKey,
      ['libraryCardNumber']
    )

    // Alice requires Bob to present his library card number
    const aliceCertificatesToRequest = {
      certifiers: [certifierPublicKey],
      types: { [certificateType]: ['libraryCardNumber'] }
    }

    const { aliceReceivedCertificates } = setupPeers(true, false, { aliceCertsToRequest: aliceCertificatesToRequest })
    mockGetVerifiableCertificates(undefined, bobVerifiableCertificate, alicePubKey, bobPubKey)

    const aliceAcceptedLibraryCard = jest.fn()

    alice.listenForCertificatesReceived(async (senderPublicKey, certificates) => {
      for (const cert of certificates) {
        // Decrypt Bob's certificate fields
        const decryptedFields = await cert.decryptFields(walletA)

        // Check and use the decrypted fields
        if (Object.keys(decryptedFields).length !== 0 && decryptedFields.libraryCardNumber) {
          console.log(`Alice received Bob's library card number: ${decryptedFields.libraryCardNumber}`)
          aliceAcceptedLibraryCard()
        }
      }
    })

    const bobReceivedGeneralMessage = new Promise<void>((resolve) => {
      bob.listenForGeneralMessages((senderPublicKey, payload) => {
        console.log('Bob received message from Alice:', Utils.toUTF8(payload))
        resolve()
      })
    })

    // Alice sends a message to Bob requesting his library card before lending him a book
    await alice.toPeer(Utils.toArray('Please present your library card to borrow a book.'))
    await aliceReceivedCertificates
    await bobReceivedGeneralMessage

    expect(aliceAcceptedLibraryCard).toHaveBeenCalled()
    expect(certificatesReceivedByAlice).toEqual([bobVerifiableCertificate])
    expect(certificatesReceivedByBob).toEqual([]) // Bob did not request any certificates
  }, 15000)

  it('Bob requests additional certificates from Alice after initial communication', async () => {
    const alicePubKey = (await walletA.getPublicKey({ identityKey: true })).publicKey
    const bobPubKey = (await walletB.getPublicKey({ identityKey: true })).publicKey

    const aliceMasterCertificate = await createMasterCertificate(walletA, { name: 'Alice' })
    const aliceVerifiableCertificate = await createVerifiableCertificate(
      aliceMasterCertificate,
      walletA,
      bobPubKey,
      ['name']
    )

    const { bobReceivedCertificates } = setupPeers(false, true)
    mockGetVerifiableCertificates(aliceVerifiableCertificate, undefined, alicePubKey, bobPubKey)

    const bobReceivedGeneralMessage = new Promise<void>((resolve) => {
      bob.listenForGeneralMessages(async (senderPublicKey, payload) => {
        await bobReceivedCertificates
        console.log('Bob received message:', Utils.toUTF8(payload))

        // Bob requests additional certificates after initial communication
        await bob.requestCertificates(certificatesToRequest, senderPublicKey)
        resolve()
      })
    })

    // Initial communication from Alice
    await alice.toPeer(Utils.toArray('Hello Bob!'))
    await bobReceivedGeneralMessage

    // Listen for certificates received from the additional request
    const bobReceivedAdditionalCertificates = new Promise<void>((resolve) => {
      bob.listenForCertificatesReceived(async (senderPublicKey, certificates) => {
        if (certificates.length > 0) {
          // Decrypt to confirm
          for (const cert of certificates) {
            const decrypted = await cert.decryptFields(walletB)
            console.log('Bob received additional certificates from Alice:', cert)
            console.log('Decrypted fields:', decrypted)
          }
          resolve()
        }
      })
    })

    await bobReceivedAdditionalCertificates

    expect(certificatesReceivedByBob).toEqual([aliceVerifiableCertificate])
  }, 15000)

  it('Bob requests Alice to provide her membership status before granting access to premium content', async () => {
    const alicePubKey = (await walletA.getPublicKey({ identityKey: true })).publicKey
    const bobPubKey = (await walletB.getPublicKey({ identityKey: true })).publicKey

    // Alice's certificate includes her membership status
    const aliceMasterCertificate = await createMasterCertificate(walletA, { ...aliceFields, membershipStatus: 'Gold' })
    const aliceVerifiableCertificate = await createVerifiableCertificate(
      aliceMasterCertificate,
      walletA,
      bobPubKey,
      ['membershipStatus']
    )

    // Bob requires Alice to present her membership status
    const bobCertificatesToRequest = {
      certifiers: [certifierPublicKey],
      types: { [certificateType]: ['membershipStatus'] }
    }

    const { bobReceivedCertificates } = setupPeers(false, true, { bobCertsToRequest: bobCertificatesToRequest })
    mockGetVerifiableCertificates(aliceVerifiableCertificate, undefined, alicePubKey, bobPubKey)

    const bobAcceptedMembershipStatus = jest.fn()

    const waitForCerts = new Promise<void>((resolve) => {
      bob.listenForCertificatesReceived(async (senderPublicKey, certificates) => {
        for (const cert of certificates) {
          // Decrypt Alice's certificate fields
          const decryptedFields = await cert.decryptFields(walletB)
          if (decryptedFields.membershipStatus) {
            console.log(`Bob received Alice's membership status: ${decryptedFields.membershipStatus}`)
            bobAcceptedMembershipStatus()
            resolve()
          }
        }
      })
    })

    const bobReceivedGeneralMessage = new Promise<void>((resolve) => {
      bob.listenForGeneralMessages((senderPublicKey, payload) => {
        console.log('Bob received message from Alice:', Utils.toUTF8(payload))
        resolve()
      })
    })

    // Alice sends a message to Bob requesting access to premium content
    await alice.toPeer(Utils.toArray('I would like to access the premium content.'))
    await bobReceivedCertificates
    await bobReceivedGeneralMessage
    await waitForCerts

    expect(bobAcceptedMembershipStatus).toHaveBeenCalled()
    expect(certificatesReceivedByBob).toEqual([aliceVerifiableCertificate])
    expect(certificatesReceivedByAlice).toEqual([]) // Alice did not request any certificates
  }, 15000)

  it('Both peers require each other\'s driver\'s license before carpooling', async () => {
    const alicePubKey = (await walletA.getPublicKey({ identityKey: true })).publicKey
    const bobPubKey = (await walletB.getPublicKey({ identityKey: true })).publicKey

    // Both Alice and Bob have driver's license certificates
    const aliceMasterCertificate = await createMasterCertificate(walletA, { ...aliceFields, driversLicenseNumber: 'DLA123456' })
    const aliceVerifiableCertificate = await createVerifiableCertificate(
      aliceMasterCertificate,
      walletA,
      bobPubKey,
      ['driversLicenseNumber']
    )

    const bobMasterCertificate = await createMasterCertificate(walletB, { ...bobFields, driversLicenseNumber: 'DLB654321' })
    const bobVerifiableCertificate = await createVerifiableCertificate(
      bobMasterCertificate,
      walletB,
      alicePubKey,
      ['driversLicenseNumber']
    )

    // Both peers require the driver's license number
    const certificatesToRequestDriversLicense = {
      certifiers: [certifierPublicKey],
      types: { [certificateType]: ['driversLicenseNumber'] }
    }

    const { aliceReceivedCertificates, bobReceivedCertificates } = setupPeers(true, true, {
      aliceCertsToRequest: certificatesToRequestDriversLicense,
      bobCertsToRequest: certificatesToRequestDriversLicense
    })
    mockGetVerifiableCertificates(aliceVerifiableCertificate, bobVerifiableCertificate, alicePubKey, bobPubKey)

    const aliceAcceptedBobDL = jest.fn()
    const bobAcceptedAliceDL = jest.fn()

    const waitForAliceToAcceptBobDL = new Promise<void>((resolve) => {
      alice.listenForCertificatesReceived(async (senderPublicKey, certificates) => {
        for (const cert of certificates) {
          const decryptedFields = await cert.decryptFields(walletA)
          if (decryptedFields.driversLicenseNumber) {
            console.log(`Alice received Bob's driver's license number: ${decryptedFields.driversLicenseNumber}`)
            aliceAcceptedBobDL()
            resolve()
          }
        }
      })
    })

    const waitForBobToAcceptAliceDL = new Promise<void>((resolve) => {
      bob.listenForCertificatesReceived(async (senderPublicKey, certificates) => {
        for (const cert of certificates) {
          const decryptedFields = await cert.decryptFields(walletB)
          if (decryptedFields.driversLicenseNumber) {
            console.log(`Bob received Alice's driver's license number: ${decryptedFields.driversLicenseNumber}`)
            bobAcceptedAliceDL()
            resolve()
          }
        }
      })
    })

    const bobReceivedGeneralMessage = new Promise<void>((resolve) => {
      bob.listenForGeneralMessages(async (senderPublicKey, payload) => {
        console.log('Bob received message from Alice:', Utils.toUTF8(payload))
        await bob.toPeer(Utils.toArray('Looking forward to carpooling!'), senderPublicKey)
        resolve()
      })
    })

    const aliceReceivedGeneralMessage = new Promise<void>((resolve) => {
      alice.listenForGeneralMessages((senderPublicKey, payload) => {
        console.log('Alice received message from Bob:', Utils.toUTF8(payload))
        resolve()
      })
    })

    // Alice initiates the conversation
    await alice.toPeer(Utils.toArray('Please share your driver\'s license number for carpooling.'))
    await aliceReceivedCertificates
    await bobReceivedCertificates
    await bobReceivedGeneralMessage
    await aliceReceivedGeneralMessage

    // Wait for both sides to fully accept each other's certificate
    await waitForAliceToAcceptBobDL
    await waitForBobToAcceptAliceDL

    expect(aliceAcceptedBobDL).toHaveBeenCalled()
    expect(bobAcceptedAliceDL).toHaveBeenCalled()
    expect(certificatesReceivedByAlice).toEqual([bobVerifiableCertificate])
    expect(certificatesReceivedByBob).toEqual([aliceVerifiableCertificate])
  }, 20000)

  it('Peers accept partial certificates if at least one required field is present', async () => {
    const alicePubKey = (await walletA.getPublicKey({ identityKey: true })).publicKey
    const bobPubKey = (await walletB.getPublicKey({ identityKey: true })).publicKey

    // Alice's certificate contains 'name' and 'email'; Bob's contains only 'email'
    const aliceMasterCertificate = await createMasterCertificate(walletA, { name: 'Alice', email: 'alice@example.com' })
    const aliceVerifiableCertificate = await createVerifiableCertificate(
      aliceMasterCertificate,
      walletA,
      bobPubKey,
      ['name', 'email']
    )

    const bobMasterCertificate = await createMasterCertificate(walletB, { email: 'bob@example.com' })
    const bobVerifiableCertificate = await createVerifiableCertificate(
      bobMasterCertificate,
      walletB,
      alicePubKey,
      ['email']
    )

    const partialCertificatesToRequest = {
      certifiers: [certifierPublicKey],
      types: { [certificateType]: ['name', 'email'] }
    }

    const { aliceReceivedCertificates, bobReceivedCertificates } = setupPeers(true, true, {
      aliceCertsToRequest: partialCertificatesToRequest,
      bobCertsToRequest: partialCertificatesToRequest
    })
    mockGetVerifiableCertificates(aliceVerifiableCertificate, bobVerifiableCertificate, alicePubKey, bobPubKey)

    const aliceAcceptedPartialCert = jest.fn()
    const bobAcceptedPartialCert = jest.fn()

    const waitForAlicePartialCert = new Promise<void>((resolve) => {
      alice.listenForCertificatesReceived(async (senderPublicKey, certificates) => {
        for (const cert of certificates) {
          const decryptedFields = await cert.decryptFields(walletA)
          if (decryptedFields.email || decryptedFields.name) {
            console.log(`Alice received Bob's certificate with fields: ${Object.keys(decryptedFields).join(', ')}`)
            aliceAcceptedPartialCert()
            resolve()
          }
        }
      })
    })

    const waitForBobPartialCert = new Promise<void>((resolve) => {
      bob.listenForCertificatesReceived(async (senderPublicKey, certificates) => {
        for (const cert of certificates) {
          const decryptedFields = await cert.decryptFields(walletB)
          if (decryptedFields.email || decryptedFields.name) {
            console.log(`Bob received Alice's certificate with fields: ${Object.keys(decryptedFields).join(', ')}`)
            bobAcceptedPartialCert()
            resolve()
          }
        }
      })
    })

    const bobReceivedGeneralMessage = new Promise<void>((resolve) => {
      bob.listenForGeneralMessages((senderPublicKey, payload) => {
        console.log('Bob received message:', Utils.toUTF8(payload))
        resolve()
      })
    })

    await alice.toPeer(Utils.toArray('Hello Bob!'))
    await aliceReceivedCertificates
    await bobReceivedCertificates
    await bobReceivedGeneralMessage

    // Wait for both sides to fully accept the partial cert
    await waitForAlicePartialCert
    await waitForBobPartialCert

    expect(aliceAcceptedPartialCert).toHaveBeenCalled()
    expect(bobAcceptedPartialCert).toHaveBeenCalled()
    expect(certificatesReceivedByAlice).toEqual([bobVerifiableCertificate])
    expect(certificatesReceivedByBob).toEqual([aliceVerifiableCertificate])
  }, 20000)
})
