import { RegistryClient } from '../RegistryClient'
import { WalletInterface } from '../../wallet/index.js'
import { TopicBroadcaster, LookupResolver } from '../../overlay-tools/index.js'
import { PushDrop } from '../../script/index.js'
import {
  DefinitionType,
  DefinitionData,
  BasketDefinitionData,
  ProtocolDefinitionData,
  CertificateDefinitionData,
  RegistryRecord,
  CertificateFieldDescriptor
} from '../types/index.js'

// -------------------- Mocks Setup -------------------- //

// 1) A top-level broadcast mock function
const mockBroadcast = jest.fn().mockResolvedValue('mockBroadcastSuccess')

jest.mock('../../overlay-tools/index.js', () => {
  return {
    TopicBroadcaster: jest.fn().mockImplementation(() => ({
      broadcast: mockBroadcast
    })),
    LookupResolver: jest.fn().mockImplementation(() => ({
      query: jest.fn()
    }))
  }
})

jest.mock('../../script/index.js', () => {
  const actualScriptModule = jest.requireActual('../../script/index.js')
  return {
    ...actualScriptModule,
    PushDrop: Object.assign(
      jest.fn().mockImplementation(() => ({
        lock: jest.fn().mockResolvedValue({ toHex: () => 'mockLockingScriptHex' }),
        unlock: jest.fn().mockResolvedValue({
          sign: jest.fn().mockResolvedValue({
            toHex: () => 'mockUnlockingScriptHex'
          })
        })
      })),
      {
        // Ensure decode is a Jest mock
        decode: jest.fn()
      }
    ),
    LockingScript: {
      fromHex: jest.fn().mockImplementation((hex: string) => ({ hex }))
    }
  }
})

  // Ensure `PushDrop.decode` is recognized as a Jest mock
  ; (PushDrop as any).decode = jest.fn()

jest.mock('../../transaction/index.js', () => {
  return {
    Transaction: {
      fromAtomicBEEF: jest.fn().mockImplementation((_tx: number[]) => ({
        toHexBEEF: () => 'mockTxHexBEEF',
        outputs: [
          { lockingScript: 'mockLockingScriptObject0' },
          { lockingScript: 'mockLockingScriptObject1' },
          { lockingScript: 'mockLockingScriptObject2' }
        ]
      })),
      fromBEEF: jest.fn().mockImplementation((_tx: number[]) => ({}))
    }
  }
})

jest.mock('../../primitives/index.js', () => {
  return {
    Utils: {
      toArray: jest.fn().mockImplementation((str: string) =>
        Array.from(str).map((c) => c.charCodeAt(0))
      ),
      toUTF8: jest.fn().mockImplementation((arr: number[] | string) => {
        if (Array.isArray(arr)) {
          return arr.map((n) => String.fromCharCode(n)).join('')
        }
        return arr
      })
    }
  }
})

let walletMock: Partial<WalletInterface>

/**
 * Build minimal valid DefinitionData for each type
 */
function buildDefinitionData(type: DefinitionType): DefinitionData {
  switch (type) {
    case 'basket': {
      const data: BasketDefinitionData = {
        definitionType: 'basket',
        basketID: 'someBasketId',
        name: 'Test Basket',
        iconURL: 'https://someiconurl.com',
        description: 'Basket Description',
        documentationURL: 'https://docs.basket.com'
      }
      return data
    }
    case 'protocol': {
      const data: ProtocolDefinitionData = {
        definitionType: 'protocol',
        protocolID: 'someProtocolId',
        securityLevel: 1,
        name: 'Test Protocol',
        iconURL: 'https://someiconurl.com',
        description: 'Protocol Description',
        documentationURL: 'https://docs.protocol.com'
      }
      return data
    }
    case 'certificate': {
      const fields: Record<string, CertificateFieldDescriptor> = {
        myField: {
          friendlyName: 'Friendly Field Name',
          description: 'some field description',
          type: 'text',
          fieldIcon: 'https://someiconurl.com/icons/myField.png'
        }
      }
      const data: CertificateDefinitionData = {
        definitionType: 'certificate',
        type: 'someCertType',
        name: 'Test Certificate',
        iconURL: 'https://someiconurl.com',
        description: 'Certificate Description',
        documentationURL: 'https://docs.certificate.com',
        fields
      }
      return data
    }
    default:
      throw new Error(`Invalid test usage: unsupported DefinitionType "${type}"`)
  }
}

describe('RegistryClient', () => {
  let registryClient: RegistryClient

  beforeEach(() => {
    walletMock = {
      getPublicKey: jest.fn().mockResolvedValue({ publicKey: 'mockPublicKey' }),
      createAction: jest.fn().mockResolvedValue({
        tx: [1, 2, 3],
        signableTransaction: { tx: [1, 2, 3], reference: 'someRef' }
      }),
      signAction: jest.fn().mockResolvedValue({ tx: [4, 5, 6] }),
      listOutputs: jest.fn().mockResolvedValue({ outputs: [] }),
      getNetwork: jest.fn().mockResolvedValue({ network: 'main' })
    }

    registryClient = new RegistryClient(walletMock as WalletInterface)

    // Clear all mock calls
    jest.clearAllMocks()
    mockBroadcast.mockClear()
  })

  // ------------------------------------------------------------------
  // registerDefinition
  // ------------------------------------------------------------------
  describe('registerDefinition', () => {
    it('should register a basket definition and broadcast with networkPreset=main', async () => {
      const data = buildDefinitionData('basket')
      const result = await registryClient.registerDefinition(data)
      expect(result).toBe('mockBroadcastSuccess')

      expect(walletMock.createAction).toHaveBeenCalledWith({
        description: 'Register a new basket item',
        outputs: expect.arrayContaining([
          expect.objectContaining({
            satoshis: 1,
            outputDescription: 'New basket registration token'
          })
        ])
      })
      expect(TopicBroadcaster).toHaveBeenCalledWith(
        ['tm_basketmap'],
        { networkPreset: 'main' }
      )
      expect(mockBroadcast).toHaveBeenCalledTimes(1)
    })

    it('should register a protocol definition and broadcast with networkPreset=main', async () => {
      const data = buildDefinitionData('protocol')
      const result = await registryClient.registerDefinition(data)
      expect(result).toBe('mockBroadcastSuccess')

      expect(walletMock.createAction).toHaveBeenCalledWith({
        description: 'Register a new protocol item',
        outputs: expect.arrayContaining([
          expect.objectContaining({
            satoshis: 1,
            outputDescription: 'New protocol registration token'
          })
        ])
      })

      expect(TopicBroadcaster).toHaveBeenCalledWith(
        ['tm_protomap'],
        { networkPreset: 'main' }
      )
      expect(mockBroadcast).toHaveBeenCalledTimes(1)
    })

    it('should register a certificate definition and broadcast with networkPreset=main', async () => {
      const data = buildDefinitionData('certificate')
      const result = await registryClient.registerDefinition(data)
      expect(result).toBe('mockBroadcastSuccess')

      expect(walletMock.createAction).toHaveBeenCalledWith({
        description: 'Register a new certificate item',
        outputs: expect.arrayContaining([
          expect.objectContaining({
            satoshis: 1,
            outputDescription: 'New certificate registration token'
          })
        ])
      })

      expect(TopicBroadcaster).toHaveBeenCalledWith(
        ['tm_certmap'],
        { networkPreset: 'main' }
      )
      expect(mockBroadcast).toHaveBeenCalledTimes(1)
    })

    it('should throw if createAction returns undefined tx', async () => {
      (walletMock.createAction as jest.Mock).mockResolvedValueOnce({
        tx: undefined
      })
      const data = buildDefinitionData('basket')
      await expect(registryClient.registerDefinition(data)).rejects.toThrow(
        'Failed to create basket registration transaction!'
      )
    })

    it('should throw an error on invalid definition type', async () => {
      const invalidData = { definitionType: 'invalidType' } as any as DefinitionData
      await expect(registryClient.registerDefinition(invalidData)).rejects.toThrow(
        'Invalid registry kind specified'
      )
    })
  })

  // ------------------------------------------------------------------
  // resolve
  // ------------------------------------------------------------------
  describe('resolve', () => {
    it('should return empty array if resolver does not return output-list', async () => {
      (LookupResolver as jest.Mock).mockImplementation(() => ({
        query: jest.fn().mockResolvedValue({ type: 'unknown' })
      }))

      const result = await registryClient.resolve('basket', { name: 'foo' })
      expect(result).toEqual([])
    })

    it('should parse outputs from resolver if type is output-list', async () => {
      ; (LookupResolver as jest.Mock).mockImplementation(() => ({
        query: jest.fn().mockResolvedValue({
          type: 'output-list',
          outputs: [
            { beef: [9, 9, 9], outputIndex: 0 }
          ]
        })
      }))

        // Mock decode once, so the code that does `PushDrop.decode(...)` returns some fields
        ; (PushDrop.decode as jest.Mock).mockReturnValue({
          fields: [
            [98],  // 'b'
            [97],  // 'a'
            [115], // 's'
            [107], // 'k'
            [101], // 'e'
            [116]  // 't' => operator
          ]
        })

        // The final field must match the current wallet pubkey => 't'
        ; (walletMock.getPublicKey as jest.Mock).mockResolvedValueOnce({ publicKey: 't' })

      const result = await registryClient.resolve('basket', { basketID: 'whatever' })
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        definitionType: 'basket',
        basketID: 'b',
        name: 'a',
        iconURL: 's',
        description: 'k',
        documentationURL: 'e',
        registryOperator: 't'
      })
    })

    it('should skip outputs that fail parseLockingScript', async () => {
      ; (LookupResolver as jest.Mock).mockImplementation(() => ({
        query: jest.fn().mockResolvedValue({
          type: 'output-list',
          outputs: [
            { beef: [1, 1, 1], outputIndex: 0 },
            { beef: [2, 2, 2], outputIndex: 1 }
          ]
        })
      }))

        // We do two .mockReturnValueOnce calls so each decode returns something different.
        ; (PushDrop.decode as jest.Mock)
          .mockReturnValueOnce({ fields: [] })
          .mockReturnValueOnce({ fields: [] })

      const result = await registryClient.resolve('basket', { name: 'fooAgain' })
      expect(result).toEqual([])
    })
  })

  // ------------------------------------------------------------------
  // listOwnRegistryEntries
  // ------------------------------------------------------------------
  describe('listOwnRegistryEntries', () => {
    it('should parse and return registry records from wallet outputs', async () => {
      // The wallet returns 3 outputs, but we skip any "spendable" or parse-failing ones
      ; (walletMock.listOutputs as jest.Mock).mockResolvedValue({
        outputs: [
          {
            outpoint: 'abc123.0',
            satoshis: 1000,
            lockingScript: 'someLockingScriptHex',
            spendable: false
          },
          {
            outpoint: 'xyz999.1',
            satoshis: 500,
            lockingScript: 'badLockingScriptHex',
            spendable: false
          },
          {
            outpoint: 'skipMe.2',
            satoshis: 200,
            lockingScript: 'skipLockingScriptHex',
            spendable: true
          }
        ]
      })

        // We decode the first output successfully => 6 fields => valid basket
        // Then the second decode => parse fails
        ; (PushDrop.decode as jest.Mock)
          .mockReturnValueOnce({ fields: Array(6).fill([97]) })
          .mockReturnValueOnce({ fields: [] })
        ; (walletMock.getPublicKey as jest.Mock).mockResolvedValueOnce({ publicKey: 'a' })

      const records = await registryClient.listOwnRegistryEntries('basket')
      expect(walletMock.listOutputs).toHaveBeenCalledWith({
        basket: 'basketmap',
        include: 'locking scripts'
      })
      expect(records).toHaveLength(1)
      expect(records[0]).toMatchObject({
        definitionType: 'basket',
        txid: 'abc123',
        outputIndex: 0,
        satoshis: 1000,
        lockingScript: 'someLockingScriptHex'
      })
    })
  })

  // ------------------------------------------------------------------
  // revokeOwnRegistryEntry
  // ------------------------------------------------------------------
  describe('revokeOwnRegistryEntry', () => {
    let validRecord: RegistryRecord

    beforeEach(() => {
      validRecord = {
        definitionType: 'basket',
        basketID: 'myBasket',
        name: 'whatever',
        iconURL: 'url',
        description: 'desc',
        documentationURL: 'docURL',
        txid: 'someTxId',
        outputIndex: 0,
        satoshis: 1000,
        lockingScript: 'someLockingScriptHex',
        registryOperator: 'mockPublicKey'
      }
    })

    it('should revoke a record successfully (networkPreset=main)', async () => {
      const result = await registryClient.revokeOwnRegistryEntry(validRecord)
      expect(result).toBe('mockBroadcastSuccess')

      expect(walletMock.createAction).toHaveBeenCalledWith({
        description: 'Revoke basket item: myBasket',
        inputs: [
          {
            outpoint: 'someTxId.0',
            unlockingScriptLength: 73,
            inputDescription: 'Revoking basket token'
          }
        ]
      })

      expect(TopicBroadcaster).toHaveBeenCalledWith(['tm_basketmap'], { networkPreset: 'main' })
      expect(mockBroadcast).toHaveBeenCalled()
    })

    it('should throw if createAction returns no signableTransaction', async () => {
      ; (walletMock.createAction as jest.Mock).mockResolvedValueOnce({
        tx: [1, 2, 3],
        signableTransaction: undefined
      })
      await expect(registryClient.revokeOwnRegistryEntry(validRecord)).rejects.toThrow(
        'Failed to create signable transaction.'
      )
    })

    it('should throw if signAction returns no signedTx', async () => {
      ; (walletMock.signAction as jest.Mock).mockResolvedValueOnce({ tx: undefined })
      await expect(registryClient.revokeOwnRegistryEntry(validRecord)).rejects.toThrow(
        'Failed to finalize the transaction signature.'
      )
    })

    it('should propagate broadcast errors', async () => {
      mockBroadcast.mockRejectedValueOnce(new Error('Broadcast failure!'))

      await expect(registryClient.revokeOwnRegistryEntry(validRecord)).rejects.toThrow(
        'Broadcast failure!'
      )
    })
  })
})
