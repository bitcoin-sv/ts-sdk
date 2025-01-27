import { PrivateKey, Random, Utils } from '../../../../dist/cjs/src/primitives/index.js'
import { ProtoWallet } from '../../../../dist/cjs/src/wallet/ProtoWallet.js'
import { WalletInterface } from '../../../../dist/cjs/src/wallet/Wallet.interfaces.js'
import { createNonce } from '../../../../dist/cjs/src/auth/utils/createNonce.js'
import { verifyNonce } from '../../../../dist/cjs/src/auth/utils/verifyNonce.js'
import { hash256 } from '../../../../dist/cjs/src/primitives/Hash.js'

describe('createNonce', () => {
  let mockWallet: WalletInterface

  beforeEach(() => {
    mockWallet = {
      createHmac: jest.fn().mockResolvedValue({ hmac: new Uint8Array(16) }),
    } as unknown as WalletInterface
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('throws an error if wallet fails to create HMAC', async () => {
    // Mock failure of HMAC creation
    (mockWallet.createHmac as jest.Mock).mockRejectedValue(new Error('Failed to create HMAC'))

    await expect(createNonce(mockWallet)).rejects.toThrow('Failed to create HMAC')
  })

  it('creates a 256-bit nonce', async () => {
    const nonce = await createNonce(mockWallet)
    expect(Buffer.from(nonce, 'base64').byteLength).toEqual(32)
  })
})

describe('verifyNonce', () => {
  let mockWallet: WalletInterface

  beforeEach(() => {
    mockWallet = {
      createHmac: jest.fn().mockResolvedValue({ hmac: new Uint8Array(16) }),
      verifyHmac: jest.fn().mockResolvedValue({ valid: true }),
    } as unknown as WalletInterface
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does not verify an invalid nonce', async () => {
    (mockWallet.verifyHmac as jest.Mock).mockResolvedValue({ valid: false })

    const nonce = await createNonce(mockWallet)
    await expect(verifyNonce(nonce + 'ABC', mockWallet)).resolves.toEqual(false)
    await expect(verifyNonce(nonce + '=', mockWallet)).resolves.toEqual(false)
    await expect(verifyNonce(Buffer.from(nonce + Buffer.from('extra').toString('base64'), 'base64').toString('base64'), mockWallet)).resolves.toEqual(false)
  })

  it('returns false for an invalid HMAC verification', async () => {
    (mockWallet.verifyHmac as jest.Mock).mockResolvedValue({ valid: false })

    const nonce = await createNonce(mockWallet)
    await expect(verifyNonce(nonce, mockWallet)).resolves.toEqual(false)
  })

  it('verifies a 256-bit nonce', async () => {
    (mockWallet.verifyHmac as jest.Mock).mockResolvedValue({ valid: true })

    const nonce1 = await createNonce(mockWallet)
    const nonce2 = await createNonce(mockWallet)

    expect(Buffer.from(nonce1, 'base64').byteLength).toEqual(32)
    expect(Buffer.from(nonce2, 'base64').byteLength).toEqual(32)

    await expect(verifyNonce(nonce1, mockWallet)).resolves.toEqual(true)
    await expect(verifyNonce(nonce2, mockWallet)).resolves.toEqual(true)
  })

  it('verifies nonce using real createHmac and verifyHmac', async () => {
    const realWallet = new ProtoWallet(PrivateKey.fromRandom())

    const nonce = await createNonce(realWallet)
    const isValid = await verifyNonce(nonce, realWallet)

    expect(isValid).toEqual(true)
  })

  it('SerialNumber use-case', async () => {
    const clientWallet = new ProtoWallet(PrivateKey.fromRandom())
    const serverWallet = new ProtoWallet(PrivateKey.fromRandom())

    // Client creates a random nonce that the server can verify
    const clientNonce = await createNonce(clientWallet, (await serverWallet.getPublicKey({ identityKey: true })).publicKey)
    // The server verifies the client created the nonce provided
    await verifyNonce(clientNonce, serverWallet, (await clientWallet.getPublicKey({ identityKey: true })).publicKey)
    // Server creates a random nonce that the client can verify
    const serverNonce = await createNonce(serverWallet, (await clientWallet.getPublicKey({ identityKey: true })).publicKey)
    // The server compute a serial number from the client and server nonce
    const { hmac: serialNumber } = await serverWallet.createHmac({
      data: clientNonce + serverNonce,
      protocolID: [2, 'certificate creation'],
      keyID: serverNonce + clientNonce,
      counterparty: (await clientWallet.getPublicKey({ identityKey: true })).publicKey
    })

    // Client verifies server's nonce
    await verifyNonce(serverNonce, clientWallet, (await serverWallet.getPublicKey({ identityKey: true })).publicKey)

    // Client verifies the server included their nonce
    const { valid } = await clientWallet.verifyHmac({
      hmac: serialNumber,
      data: clientNonce + serverNonce,
      protocolID: [2, 'certificate creation'],
      keyID: serverNonce + clientNonce,
      counterparty: (await serverWallet.getPublicKey({ identityKey: true })).publicKey,
    })

    console.log(Utils.toBase64(serialNumber))
    expect(valid).toEqual(true)
  })
})
