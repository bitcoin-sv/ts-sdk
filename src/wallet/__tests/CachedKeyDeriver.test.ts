import { PrivateKey, PublicKey, SymmetricKey } from '../../primitives/index'
import CachedKeyDeriver from '../../wallet/CachedKeyDeriver'
import KeyDeriver from '../../wallet/KeyDeriver'

describe('CachedKeyDeriver', () => {
  let mockKeyDeriver: jest.Mocked<KeyDeriver>
  let cachedKeyDeriver: CachedKeyDeriver
  const rootKey = new PrivateKey(1)

  beforeEach(() => {
    // Reset the mocks and create a new CachedKeyDeriver instance before each test
    jest.clearAllMocks()
    mockKeyDeriver = new KeyDeriver(rootKey) as jest.Mocked<KeyDeriver>
    // Mock the methods of KeyDeriver
    mockKeyDeriver.derivePublicKey = jest.fn()
    mockKeyDeriver.derivePrivateKey = jest.fn()
    mockKeyDeriver.deriveSymmetricKey = jest.fn()
    mockKeyDeriver.revealCounterpartySecret = jest.fn()
    mockKeyDeriver.revealSpecificSecret = jest.fn()

    // Replace the internal keyDeriver instance with the mocked one
    cachedKeyDeriver = new CachedKeyDeriver(rootKey)
    // @ts-expect-error: Accessing private property for testing purposes
    cachedKeyDeriver.keyDeriver = mockKeyDeriver
  })

  describe('derivePublicKey', () => {
    it('should call derivePublicKey on KeyDeriver and cache the result', () => {
      const protocolID: [0, string] = [0, 'testprotocol']
      const keyID = 'key1'
      const counterparty = 'self'
      const publicKey = new PublicKey(0)

      mockKeyDeriver.derivePublicKey.mockReturnValue(publicKey)

      // First call - should invoke the underlying method
      const result1 = cachedKeyDeriver.derivePublicKey(
        protocolID,
        keyID,
        counterparty
      )
      expect(mockKeyDeriver.derivePublicKey).toHaveBeenCalledTimes(1)
      expect(result1).toBe(publicKey)

      // Second call with the same parameters - should retrieve from cache
      const result2 = cachedKeyDeriver.derivePublicKey(
        protocolID,
        keyID,
        counterparty
      )
      expect(mockKeyDeriver.derivePublicKey).toHaveBeenCalledTimes(1) // No additional calls
      expect(result2).toBe(publicKey)
    })

    it('should handle different parameters correctly', () => {
      const protocolID1: [0, string] = [0, 'protocol1']
      const protocolID2: [1, string] = [1, 'protocol2']
      const keyID1 = 'key1'
      const keyID2 = 'key2'
      const counterparty1 = 'self'
      const counterparty2 = 'anyone'
      const publicKey1 = new PublicKey(0)
      const publicKey2 = new PublicKey(0)

      mockKeyDeriver.derivePublicKey
        .mockReturnValueOnce(publicKey1)
        .mockReturnValueOnce(publicKey2)

      // Different parameters - should not hit cache
      const result1 = cachedKeyDeriver.derivePublicKey(
        protocolID1,
        keyID1,
        counterparty1
      )
      const result2 = cachedKeyDeriver.derivePublicKey(
        protocolID2,
        keyID2,
        counterparty2
      )
      expect(mockKeyDeriver.derivePublicKey).toHaveBeenCalledTimes(2)
      expect(result1).toBe(publicKey1)
      expect(result2).toBe(publicKey2)
    })
  })

  describe('derivePrivateKey', () => {
    it('should call derivePrivateKey on KeyDeriver and cache the result', () => {
      const protocolID: [1, string] = [1, 'testprotocol']
      const keyID = 'key1'
      const counterparty = 'anyone'
      const privateKey = new PrivateKey()

      mockKeyDeriver.derivePrivateKey.mockReturnValue(privateKey)

      // First call - should invoke the underlying method
      const result1 = cachedKeyDeriver.derivePrivateKey(
        protocolID,
        keyID,
        counterparty
      )
      expect(mockKeyDeriver.derivePrivateKey).toHaveBeenCalledTimes(1)
      expect(result1).toBe(privateKey)

      // Second call with the same parameters - should retrieve from cache
      const result2 = cachedKeyDeriver.derivePrivateKey(
        protocolID,
        keyID,
        counterparty
      )
      expect(mockKeyDeriver.derivePrivateKey).toHaveBeenCalledTimes(1)
      expect(result2).toBe(privateKey)
    })

    it('should differentiate cache entries based on parameters', () => {
      const protocolID: [1, string] = [1, 'testprotocol']
      const keyID = 'key1'
      const counterparty = 'anyone'
      const privateKey1 = new PrivateKey()
      const privateKey2 = new PrivateKey()

      mockKeyDeriver.derivePrivateKey
        .mockReturnValueOnce(privateKey1)
        .mockReturnValueOnce(privateKey2)

      // First call
      const result1 = cachedKeyDeriver.derivePrivateKey(
        protocolID,
        keyID,
        counterparty
      )
      expect(result1).toBe(privateKey1)

      // Second call with different keyID
      const result2 = cachedKeyDeriver.derivePrivateKey(
        protocolID,
        'key2',
        counterparty
      )
      expect(result2).toBe(privateKey2)
      expect(mockKeyDeriver.derivePrivateKey).toHaveBeenCalledTimes(2)
    })
  })

  describe('deriveSymmetricKey', () => {
    it('should call deriveSymmetricKey on KeyDeriver and cache the result', () => {
      const protocolID: [2, string] = [2, 'testprotocol']
      const keyID = 'key1'
      const counterparty = new PublicKey(0)
      const symmetricKey = new SymmetricKey(0)

      mockKeyDeriver.deriveSymmetricKey.mockReturnValue(symmetricKey)

      // First call
      const result1 = cachedKeyDeriver.deriveSymmetricKey(
        protocolID,
        keyID,
        counterparty
      )
      expect(mockKeyDeriver.deriveSymmetricKey).toHaveBeenCalledTimes(1)
      expect(result1).toBe(symmetricKey)

      // Second call with same parameters
      const result2 = cachedKeyDeriver.deriveSymmetricKey(
        protocolID,
        keyID,
        counterparty
      )
      expect(mockKeyDeriver.deriveSymmetricKey).toHaveBeenCalledTimes(1)
      expect(result2).toBe(symmetricKey)
    })

    it('should throw an error when KeyDeriver throws an error', () => {
      const protocolID: [2, string] = [2, 'testprotocol']
      const keyID = 'key1'
      const counterparty = 'anyone'

      mockKeyDeriver.deriveSymmetricKey.mockImplementation(() => {
        throw new Error('Test error')
      })

      expect(() => {
        cachedKeyDeriver.deriveSymmetricKey(protocolID, keyID, counterparty)
      }).toThrow('Test error')
    })
  })

  describe('revealCounterpartySecret', () => {
    it('should call revealCounterpartySecret on KeyDeriver and cache the result', () => {
      const counterparty = new PublicKey(0)
      const secret = [1, 2, 3]

      mockKeyDeriver.revealCounterpartySecret.mockReturnValue(secret)

      // First call
      const result1 = cachedKeyDeriver.revealCounterpartySecret(counterparty)
      expect(mockKeyDeriver.revealCounterpartySecret).toHaveBeenCalledTimes(1)
      expect(result1).toBe(secret)

      // Second call with same parameters
      const result2 = cachedKeyDeriver.revealCounterpartySecret(counterparty)
      expect(mockKeyDeriver.revealCounterpartySecret).toHaveBeenCalledTimes(1)
      expect(result2).toBe(secret)
    })
  })

  describe('revealSpecificSecret', () => {
    it('should call revealSpecificSecret on KeyDeriver and cache the result', () => {
      const counterparty = 'self'
      const protocolID: [0, string] = [0, 'testprotocol']
      const keyID = 'key1'
      const secret = [4, 5, 6]

      mockKeyDeriver.revealSpecificSecret.mockReturnValue(secret)

      // First call
      const result1 = cachedKeyDeriver.revealSpecificSecret(
        counterparty,
        protocolID,
        keyID
      )
      expect(mockKeyDeriver.revealSpecificSecret).toHaveBeenCalledTimes(1)
      expect(result1).toBe(secret)

      // Second call with same parameters
      const result2 = cachedKeyDeriver.revealSpecificSecret(
        counterparty,
        protocolID,
        keyID
      )
      expect(mockKeyDeriver.revealSpecificSecret).toHaveBeenCalledTimes(1)
      expect(result2).toBe(secret)
    })

    it('should handle different parameters correctly', () => {
      const counterparty = 'self'
      const protocolID1: [0, string] = [0, 'protocol1']
      const protocolID2: [1, string] = [1, 'protocol2']
      const keyID1 = 'key1'
      const keyID2 = 'key2'
      const secret1 = [4, 5, 6]
      const secret2 = [7, 8, 9]

      mockKeyDeriver.revealSpecificSecret
        .mockReturnValueOnce(secret1)
        .mockReturnValueOnce(secret2)

      // First call
      const result1 = cachedKeyDeriver.revealSpecificSecret(
        counterparty,
        protocolID1,
        keyID1
      )
      expect(result1).toBe(secret1)

      // Second call with different parameters
      const result2 = cachedKeyDeriver.revealSpecificSecret(
        counterparty,
        protocolID2,
        keyID2
      )
      expect(result2).toBe(secret2)
      expect(mockKeyDeriver.revealSpecificSecret).toHaveBeenCalledTimes(2)
    })
  })

  describe('Cache management', () => {
    it('should not exceed the max cache size and evict least recently used items', () => {
      const maxCacheSize = 5
      // Create a new CachedKeyDeriver with a small cache size
      cachedKeyDeriver = new CachedKeyDeriver(rootKey, { maxCacheSize });
      (cachedKeyDeriver as unknown as { keyDeriver: KeyDeriver }).keyDeriver = mockKeyDeriver

      const protocolID: [0, string] = [0, 'testprotocol']
      const counterparty = 'self'

      // Mock return values
      const mockResults = [1, 2, 3, 4, 5, 6].map(() => new PublicKey(0))

      mockKeyDeriver.derivePublicKey
        .mockReturnValueOnce(mockResults[0])
        .mockReturnValueOnce(mockResults[1])
        .mockReturnValueOnce(mockResults[2])
        .mockReturnValueOnce(mockResults[3])
        .mockReturnValueOnce(mockResults[4])
        .mockReturnValueOnce(mockResults[5])

      // Add entries to fill the cache
      for (let i = 0; i < maxCacheSize; i++) {
        cachedKeyDeriver.derivePublicKey(protocolID, `key${i}`, counterparty)
      }

      // Cache should be full now
      expect((cachedKeyDeriver as unknown as { cache: Map<string, PublicKey | PrivateKey | SymmetricKey | number[]> }).cache.size).toBe(maxCacheSize)

      // Access one of the earlier keys to make it recently used
      cachedKeyDeriver.derivePublicKey(protocolID, 'key0', counterparty)

      // Add one more entry to exceed the cache size
      cachedKeyDeriver.derivePublicKey(protocolID, 'key5', counterparty)

      // Cache size should still be maxCacheSize
      expect((cachedKeyDeriver as unknown as { cache: Map<string, PublicKey | PrivateKey | SymmetricKey | number[]> }).cache.size).toBe(maxCacheSize)

      // The least recently used item (key1) should have been evicted
      // The cache should contain keys: key0, key2, key3, key4, key5
      expect(Array.from((cachedKeyDeriver as unknown as { cache: Map<string, PublicKey | PrivateKey | SymmetricKey | number[]> }).cache.keys())).toEqual([
        expect.stringContaining('key2'),
        expect.stringContaining('key3'),
        expect.stringContaining('key4'),
        expect.stringContaining('key0'),
        expect.stringContaining('key5')
      ])
    })

    it('should update the recentness of cache entries on access', () => {
      const maxCacheSize = 3
      cachedKeyDeriver = new CachedKeyDeriver(rootKey, { maxCacheSize });
      (cachedKeyDeriver as unknown as { keyDeriver: KeyDeriver }).keyDeriver = mockKeyDeriver

      const protocolID: [0, string] = [0, 'testprotocol']
      const counterparty = 'self'
      const keys = ['key1', 'key2', 'key3']
      const publicKeys = keys.map(() => new PublicKey(0))

      mockKeyDeriver.derivePublicKey
        .mockReturnValueOnce(publicKeys[0])
        .mockReturnValueOnce(publicKeys[1])
        .mockReturnValueOnce(publicKeys[2])

      // Fill the cache
      keys.forEach((keyID) => {
        cachedKeyDeriver.derivePublicKey(protocolID, keyID, counterparty)
      })

      // Access 'key1' to make it most recently used
      cachedKeyDeriver.derivePublicKey(protocolID, 'key1', counterparty)

      // Add a new key to trigger eviction
      const newKeyID = 'key4'
      const newPublicKey = new PublicKey(0)
      mockKeyDeriver.derivePublicKey.mockReturnValueOnce(newPublicKey)
      cachedKeyDeriver.derivePublicKey(protocolID, newKeyID, counterparty)

      // 'key2' should be evicted as it is the least recently used
      expect(Array.from((cachedKeyDeriver as unknown as { cache: Map<string, PublicKey | PrivateKey | SymmetricKey | number[]> }).cache.keys())).toEqual([
        expect.stringContaining('key3'),
        expect.stringContaining('key1'),
        expect.stringContaining('key4')
      ])
    })
  })

  describe('Performance considerations', () => {
    it('should improve performance by caching expensive operations', () => {
      const protocolID: [0, string] = [0, 'testprotocol']
      const keyID = 'key1'
      const counterparty = 'self'
      const publicKey = new PublicKey(0)

      // Simulate an expensive operation
      mockKeyDeriver.derivePublicKey.mockImplementation(() => {
        const start = Date.now()
        while (Date.now() - start < 50) {
          // Intentional busy wait for 50ms
        } // Busy wait for 50ms
        return publicKey
      })

      const startTime = Date.now()
      cachedKeyDeriver.derivePublicKey(protocolID, keyID, counterparty)
      const firstCallDuration = Date.now() - startTime

      const startTime2 = Date.now()
      cachedKeyDeriver.derivePublicKey(protocolID, keyID, counterparty)
      const secondCallDuration = Date.now() - startTime2

      expect(firstCallDuration).toBeGreaterThanOrEqual(50)
      expect(secondCallDuration).toBeLessThan(10) // Should be much faster due to caching
    })
  })
})
