import {
  getURLForFile,
  getURLForHash,
  getHashFromURL,
  isValidURL
} from '../../storage/index.js'

// Helpers
function hexToNumberArray(hex: string): number[] {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string!')
  }
  const result: number[] = []
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.substring(i, i + 2), 16)
    result.push(byte)
  }
  return result
}

function numberArrayToHex(arr: number[]): string {
  return arr.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Example data
const exampleHashHex = 'a0d4c2cb69837827bae6ad6c717218d6f53708e2ebcaefaebac2639ac27ccbb7'
const exampleHash = hexToNumberArray(exampleHashHex)
const exampleFileHex = '687da27f04a112aa48f1cab2e7949f1eea4f7ba28319c1e999910cd561a634a05a3516e6db'
const exampleFile = hexToNumberArray(exampleFileHex)
const exampleURL = '12DqDSf2zRn6S4QQcU2PypSzfiR2vXmnnwjEm2M8SC2W9STgYtN'

describe('StorageUtils', () => {
  describe('getURLForHash', () => {
    it('Creates the correct URL for the hash', () => {
      const url = getURLForHash(exampleHash)
      expect(url).toEqual(exampleURL)
    })

    it('Throws an error if hash length is invalid', () => {
      expect(() => getURLForHash(exampleFile)).toThrow(
        new Error('Hash length must be 32 bytes (sha256)')
      )
    })
  })

  describe('getURLForFile', () => {
    it('Creates the correct URL for the file', () => {
      const url = getURLForFile(exampleFile)
      console.log('REEEEEEEEEEE:', url)
      expect(url).toEqual('1CcbHGybeibpPPqa3EK64iYHhJ3WQSi2t1ZRcQ9dQ9k5ykVuBM')
    })
  })

  describe('getHashFromURL', () => {
    it('Decodes the URL to the correct hash', () => {
      debugger
      const hash = getHashFromURL(exampleURL)
      expect(numberArrayToHex(hash)).toEqual(exampleHashHex)
    })

    it('Throws an error if checksum is invalid', () => {
      const badURL = 'XUU7cTfy6fA6q2neLDmzPqJnGB6o18PXKoGaWLPrH1SeWLKgdCKq'
      expect(() => getHashFromURL(badURL)).toThrow(new Error('Invalid checksum'))
    })

    it('Throws an error if URL length is invalid', () => {
      const badURL = 'SomeBase58CheckTooShortOrTooLong'
      expect(() => getHashFromURL(badURL)).toThrow()
    })

    it('Throws an error if prefix is invalid', () => {
      const invalidPrefixURL1 = 'AInvalidPrefixTestString1'
      const invalidPrefixURL2 = 'AInvalidPrefixTestString2'
      expect(() => getHashFromURL(invalidPrefixURL1)).toThrow()
      expect(() => getHashFromURL(invalidPrefixURL2)).toThrow()
    })
  })

  describe('isValidURL', () => {
    it('Returns true when URL is valid', () => {
      expect(isValidURL(exampleURL)).toBe(true)
    })

    it('Returns false if checksum is invalid', () => {
      const badURL = 'XUU7cTfy6fA6q2neLDmzPqJnGB6o18PXKoGaWLPrH1SeWLKgdCKq'
      expect(isValidURL(badURL)).toBe(false)
    })

    it('Returns false if URL length is invalid', () => {
      const badURL = 'SomeBase58CheckTooShortOrTooLong'
      expect(isValidURL(badURL)).toBe(false)
    })

    it('Returns false if prefix is invalid', () => {
      const badURL1 = 'AnotherInvalidPrefixTestString'
      const badURL2 = 'YetAnotherInvalidPrefixTestString'
      expect(isValidURL(badURL1)).toBe(false)
      expect(isValidURL(badURL2)).toBe(false)
    })
  })
})
