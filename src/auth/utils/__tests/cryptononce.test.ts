import { PrivateKey } from '../../../../dist/cjs/src/primitives/index.js'
import { ProtoWallet } from '../../../../dist/cjs/src/wallet/index.js'
import { Wallet } from '../../../../dist/cjs/src/wallet/Wallet.interfaces.js'
import { createNonce } from '../../../../dist/cjs/src/auth/utils/createNonce.js'
import { verifyNonce } from '../../../../dist/cjs/src/auth/utils/verifyNonce.js'

describe('createNonce', () => {
  let mockWallet: Wallet

  beforeEach(() => {
    mockWallet = {
      createHmac: jest.fn().mockResolvedValue({ hmac: new Uint8Array(16) }),
    } as unknown as Wallet
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
  let mockWallet: Wallet

  beforeEach(() => {
    mockWallet = {
      createHmac: jest.fn().mockResolvedValue({ hmac: new Uint8Array(16) }),
      verifyHmac: jest.fn().mockResolvedValue({ valid: true }),
    } as unknown as Wallet
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
})
