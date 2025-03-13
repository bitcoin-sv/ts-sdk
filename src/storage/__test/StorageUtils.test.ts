import { StorageUtils } from '../index.js'
import * as Utils from '../../primitives/utils.js'
import * as Hash from '../..//primitives/Hash.js'

// Example data
const exampleHashHex = '1a5ec49a3f32cd56d19732e89bde5d81755ddc0fd8515dc8b226d47654139dca'
const exampleHash = Utils.toArray(exampleHashHex, 'hex')
const exampleFileHex = '687da27f04a112aa48f1cab2e7949f1eea4f7ba28319c1e999910cd561a634a05a3516e6db'
const exampleFile = Utils.toArray(exampleFileHex, 'hex')
const exampleURL = 'XUT6PqWb3GP3LR7dmBMCJwZ3oo5g1iGCF3CrpzyuJCemkGu1WGoq'

describe('StorageUtils', () => {
  describe('getURLForHash', () => {
    it('Creates the correct URL for the hash', () => {
      const url = StorageUtils.getURLForHash(exampleHash)
      expect(url).toBe(exampleURL)
    })

    it('Throws an error if hash length is invalid', () => {
      // Get the length of a FILE (not a hash — wrong length!)
      expect(() => StorageUtils.getURLForHash(exampleFile)).toThrow(
        new Error('Hash length must be 32 bytes (sha256)')
      )
    })
  })

  describe('getURLForFile', () => {
    it('Creates the correct URL for the file', () => {
      const url = StorageUtils.getURLForFile(exampleFile)
      expect(url).toEqual(exampleURL)
    })
  })

  describe('getHashFromURL', () => {
    it('Decodes the URL to the correct hash', () => {
      const hash = StorageUtils.getHashFromURL(exampleURL)
      expect(Utils.toHex(hash)).toEqual(exampleHashHex)
    })

    it('Gets the same hash as getting one directly from the file', () => {
      const hashA = StorageUtils.getHashFromURL(exampleURL)
      const hashB = Hash.sha256(exampleFile)
      expect(hashA).toEqual(hashB)
    })

    it('Throws an error if checksum is invalid', () => {
      const badURL = 'XUU7cTfy6fA6q2neLDmzPqJnGB6o18PXKoGaWLPrH1SeWLKgdCKq'
      expect(() => StorageUtils.getHashFromURL(badURL)).toThrow(new Error('Invalid checksum'))
    })

    it('Throws an error if URL length is invalid', () => {
      const badURL = 'SomeBase58CheckTooShortOrTooLong'
      expect(() => StorageUtils.getHashFromURL(badURL)).toThrow()
    })

    it('Throws an error if prefix is invalid', () => {
      const invalidPrefixURL1 = 'AInvalidPrefixTestString1'
      const invalidPrefixURL2 = 'AInvalidPrefixTestString2'
      expect(() => StorageUtils.getHashFromURL(invalidPrefixURL1)).toThrow()
      expect(() => StorageUtils.getHashFromURL(invalidPrefixURL2)).toThrow()
    })
  })

  describe('isValidURL', () => {
    it('Returns true when URL is valid', () => {
      expect(StorageUtils.isValidURL(exampleURL)).toBe(true)
    })

    it('Returns false if checksum is invalid', () => {
      const badURL = 'XUU7cTfy6fA6q2neLDmzPqJnGB6o18PXKoGaWLPrH1SeWLKgdCKq'
      expect(StorageUtils.isValidURL(badURL)).toBe(false)
    })

    it('Returns false if URL length is invalid', () => {
      const badURL = 'SomeBase58CheckTooShortOrTooLong'
      expect(StorageUtils.isValidURL(badURL)).toBe(false)
    })

    it('Returns false if prefix is invalid', () => {
      const badURL1 = 'AnotherInvalidPrefixTestString'
      const badURL2 = 'YetAnotherInvalidPrefixTestString'
      expect(StorageUtils.isValidURL(badURL1)).toBe(false)
      expect(StorageUtils.isValidURL(badURL2)).toBe(false)
    })
  })
})
