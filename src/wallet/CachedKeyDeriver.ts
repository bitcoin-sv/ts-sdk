import { PrivateKey, PublicKey, SymmetricKey } from '../primitives/index.js'
import KeyDeriver from './KeyDeriver.js'
import { SecurityLevel } from './Wallet.interfaces.js'

/**
 * A cached version of KeyDeriver that caches the results of key derivation methods.
 * This is useful for optimizing performance when the same keys are derived multiple times.
 * It supports configurable cache size with sane defaults and maintains cache entries using LRU (Least Recently Used) eviction policy.
 */
export default class CachedKeyDeriver {
  private readonly keyDeriver: KeyDeriver
  private readonly cache: Map<string, any>
  private readonly maxCacheSize: number

  /**
     * Initializes the CachedKeyDeriver instance with a root private key and optional cache settings.
     * @param {PrivateKey | 'anyone'} rootKey - The root private key or the string 'anyone'.
     * @param {Object} [options] - Optional settings for the cache.
     * @param {number} [options.maxCacheSize=1000] - The maximum number of entries to store in the cache.
     */
  constructor (rootKey: PrivateKey | 'anyone', options?: { maxCacheSize?: number }) {
    this.keyDeriver = new KeyDeriver(rootKey)
    this.cache = new Map<string, any>()
    this.maxCacheSize = options?.maxCacheSize || 1000
  }

  /**
     * Derives a public key based on protocol ID, key ID, and counterparty.
     * Caches the result for future calls with the same parameters.
     * @param {[SecurityLevel, string]} protocolID - The protocol ID including a security level and protocol name.
     * @param {string} keyID - The key identifier.
     * @param {PublicKey | string | 'self' | 'anyone'} counterparty - The counterparty's public key or a predefined value ('self' or 'anyone').
     * @param {boolean} [forSelf=false] - Whether deriving for self.
     * @returns {PublicKey} - The derived public key.
     */
  derivePublicKey (
    protocolID: [SecurityLevel, string],
    keyID: string,
    counterparty: PublicKey | string | 'self' | 'anyone',
    forSelf: boolean = false
  ): PublicKey {
    const cacheKey = this.generateCacheKey('derivePublicKey', protocolID, keyID, counterparty, forSelf)
    if (this.cache.has(cacheKey)) {
      return this.cacheGet(cacheKey)
    } else {
      const result = this.keyDeriver.derivePublicKey(protocolID, keyID, counterparty, forSelf)
      this.cacheSet(cacheKey, result)
      return result
    }
  }

  /**
     * Derives a private key based on protocol ID, key ID, and counterparty.
     * Caches the result for future calls with the same parameters.
     * @param {[SecurityLevel, string]} protocolID - The protocol ID including a security level and protocol name.
     * @param {string} keyID - The key identifier.
     * @param {PublicKey | string | 'self' | 'anyone'} counterparty - The counterparty's public key or a predefined value ('self' or 'anyone').
     * @returns {PrivateKey} - The derived private key.
     */
  derivePrivateKey (
    protocolID: [SecurityLevel, string],
    keyID: string,
    counterparty: PublicKey | string | 'self' | 'anyone'
  ): PrivateKey {
    const cacheKey = this.generateCacheKey('derivePrivateKey', protocolID, keyID, counterparty)
    if (this.cache.has(cacheKey)) {
      return this.cacheGet(cacheKey)
    } else {
      const result = this.keyDeriver.derivePrivateKey(protocolID, keyID, counterparty)
      this.cacheSet(cacheKey, result)
      return result
    }
  }

  /**
     * Derives a symmetric key based on protocol ID, key ID, and counterparty.
     * Caches the result for future calls with the same parameters.
     * @param {[SecurityLevel, string]} protocolID - The protocol ID including a security level and protocol name.
     * @param {string} keyID - The key identifier.
     * @param {PublicKey | string | 'self' | 'anyone'} counterparty - The counterparty's public key or a predefined value ('self' or 'anyone').
     * @returns {SymmetricKey} - The derived symmetric key.
     * @throws {Error} - Throws an error if attempting to derive a symmetric key for 'anyone'.
     */
  deriveSymmetricKey (
    protocolID: [SecurityLevel, string],
    keyID: string,
    counterparty: PublicKey | string | 'self' | 'anyone'
  ): SymmetricKey {
    const cacheKey = this.generateCacheKey('deriveSymmetricKey', protocolID, keyID, counterparty)
    if (this.cache.has(cacheKey)) {
      return this.cacheGet(cacheKey)
    } else {
      const result = this.keyDeriver.deriveSymmetricKey(protocolID, keyID, counterparty)
      this.cacheSet(cacheKey, result)
      return result
    }
  }

  /**
     * Reveals the shared secret between the root key and the counterparty.
     * Caches the result for future calls with the same parameters.
     * @param {PublicKey | string | 'self' | 'anyone'} counterparty - The counterparty's public key or a predefined value ('self' or 'anyone').
     * @returns {number[]} - The shared secret as a number array.
     * @throws {Error} - Throws an error if attempting to reveal a shared secret for 'self'.
     */
  revealCounterpartySecret (counterparty: PublicKey | string | 'self' | 'anyone'): number[] {
    const cacheKey = this.generateCacheKey('revealCounterpartySecret', counterparty)
    if (this.cache.has(cacheKey)) {
      return this.cacheGet(cacheKey)
    } else {
      const result = this.keyDeriver.revealCounterpartySecret(counterparty)
      this.cacheSet(cacheKey, result)
      return result
    }
  }

  /**
     * Reveals the specific key association for a given protocol ID, key ID, and counterparty.
     * Caches the result for future calls with the same parameters.
     * @param {PublicKey | string | 'self' | 'anyone'} counterparty - The counterparty's public key or a predefined value ('self' or 'anyone').
     * @param {[SecurityLevel, string]} protocolID - The protocol ID including a security level and protocol name.
     * @param {string} keyID - The key identifier.
     * @returns {number[]} - The specific key association as a number array.
     */
  revealSpecificSecret (
    counterparty: PublicKey | string | 'self' | 'anyone',
    protocolID: [SecurityLevel, string],
    keyID: string
  ): number[] {
    const cacheKey = this.generateCacheKey('revealSpecificSecret', counterparty, protocolID, keyID)
    if (this.cache.has(cacheKey)) {
      return this.cacheGet(cacheKey)
    } else {
      const result = this.keyDeriver.revealSpecificSecret(counterparty, protocolID, keyID)
      this.cacheSet(cacheKey, result)
      return result
    }
  }

  /**
     * Generates a unique cache key based on the method name and input parameters.
     * @param {string} methodName - The name of the method.
     * @param {...any} args - The arguments passed to the method.
     * @returns {string} - The generated cache key.
     */
  private generateCacheKey (methodName: string, ...args: any[]): string {
    const serializedArgs = args.map((arg) => this.serializeArgument(arg)).join('|')
    return `${methodName}|${serializedArgs}`
  }

  /**
     * Serializes an argument to a string for use in a cache key.
     * @param {any} arg - The argument to serialize.
     * @returns {string} - The serialized argument.
     */
  private serializeArgument (arg: any): string {
    if (arg instanceof PublicKey || arg instanceof PrivateKey) {
      return arg.toString()
    } else if (Array.isArray(arg)) {
      return arg.map((item) => this.serializeArgument(item)).join(',')
    } else if (typeof arg === 'object' && arg !== null) {
      return JSON.stringify(arg)
    } else {
      return String(arg)
    }
  }

  /**
     * Retrieves an item from the cache and updates its position to reflect recent use.
     * @param {string} cacheKey - The key of the cached item.
     * @returns {any} - The cached value.
     */
  private cacheGet (cacheKey: string): any {
    const value = this.cache.get(cacheKey)
    // Update the entry to reflect recent use
    this.cache.delete(cacheKey)
    this.cache.set(cacheKey, value)
    return value
  }

  /**
     * Adds an item to the cache and evicts the least recently used item if necessary.
     * @param {string} cacheKey - The key of the item to cache.
     * @param {any} value - The value to cache.
     */
  private cacheSet (cacheKey: string, value: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Evict the least recently used item (first item in Map)
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(cacheKey, value)
  }
}
