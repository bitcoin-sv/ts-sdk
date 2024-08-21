/* eslint-env jest */
import { toArray, zero2, toHex, encode, fromBase58, toBase58, fromBase58Check, toBase58Check } from '../../../dist/cjs/src/primitives/utils'

describe('utils', () => {
  it('should convert to array', () => {
    expect(toArray('1234', 'hex')).toEqual([0x12, 0x34])
    expect(toArray('1234')).toEqual([49, 50, 51, 52])
    expect(toArray('1234', 'utf8')).toEqual([49, 50, 51, 52])
    expect(toArray('\u1234234')).toEqual([18, 52, 50, 51, 52])
    expect(toArray([1, 2, 3, 4])).toEqual([1, 2, 3, 4])
  })

  it('should zero pad byte to hex', () => {
    expect(zero2('0')).toBe('00')
    expect(zero2('01')).toBe('01')
  })

  it('should convert to hex', () => {
    expect(toHex([0, 1, 2, 3])).toBe('00010203')
  })

  it('should encode', () => {
    expect(encode([0, 1, 2, 3])).toEqual([0, 1, 2, 3])
    expect(encode([0, 1, 2, 3], 'hex')).toBe('00010203')
  })

  describe('base58 to binary', () => {
    it('Converts as expected', () => {
      const actual = fromBase58('6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV')
      expect(toHex(actual)).toEqual('02c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cfeb05f9d2')
    })
    it('Converts as expected with leading 1s', () => {
      const actual = fromBase58('111z')
      expect(toHex(actual)).toEqual('00000039')
    })
    it('Throws when called with undefined base58 string', () => {
      expect(() => fromBase58()).toThrow(new Error('Expected base58 string but got “undefined”'))
    })
    it('Throws when called with invalid characters in base58 string', () => {
      expect(() => fromBase58('0L')).toThrow(new Error('Invalid base58 character “0”'))
    })
  })
  describe('binary to base58 string', () => {
    it('Converts to base58 as expected', () => {
      const actual = toBase58(
        toArray('02c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cfeb05f9d2', 'hex')
      )
      expect(actual).toEqual('6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV')
    })
    it('Converts to base58 as expected with 1s', () => {
      const actual = toBase58([0, 0, 0, 4])
      expect(actual).toEqual('1115')
    })
  })
  describe('base58check encoding and decoding', () => {
    it('should correctly encode and decode data with default prefix', () => {
      let data = toArray('f5f2d624cfb5c3f66d06123d0829d1c9cebf770e', 'hex')
      let encoded = toBase58Check(data)
      expect(encoded).toBe('1PRTTaJesdNovgne6Ehcdu1fpEdX7913CK')
      expect(fromBase58Check(encoded)).toEqual({ prefix: [0], data })

      data = toArray('27b5891b01da2db74cde1689a97a2acbe23d5fb1', 'hex')
      encoded = toBase58Check(data)
      expect(encoded).toBe('14cxpo3MBCYYWCgF74SWTdcmxipnGUsPw3')
      expect(fromBase58Check(encoded)).toEqual({ prefix: [0], data })
    })

    it('should correctly encode and decode data with custom prefix', () => {
      const prefix = [0x80]
      let data = toArray('1E99423A4ED27608A15A2616A2B0E9E52CED330AC530EDCC32C8FFC6A526AEDD', 'hex')
      let encoded = toBase58Check(data, prefix)
      expect(encoded).toBe('5J3mBbAH58CpQ3Y5RNJpUKPE62SQ5tfcvU2JpbnkeyhfsYB1Jcn')
      expect(fromBase58Check(encoded)).toEqual({ prefix, data })

      data = toArray('3aba4162c7251c891207b747840551a71939b0de081f85c4e44cf7c13e41daa6', 'hex')
      encoded = toBase58Check(data, prefix)
      expect(encoded).toBe('5JG9hT3beGTJuUAmCQEmNaxAuMacCTfXuw1R3FCXig23RQHMr4K')
      expect(fromBase58Check(encoded)).toEqual({ prefix, data })
    })

    it('should correctly handle encoding and decoding with different encoding formats', () => {
      const prefix = [0x80]
      let dataHex = '1E99423A4ED27608A15A2616A2B0E9E52CED330AC530EDCC32C8FFC6A526AEDD01'
      dataHex = dataHex.toLowerCase()
      let data = toArray(dataHex, 'hex')
      let encoded = toBase58Check(data, prefix)
      expect(encoded).toBe('KxFC1jmwwCoACiCAWZ3eXa96mBM6tb3TYzGmf6YwgdGWZgawvrtJ')
      expect(fromBase58Check(encoded, 'hex')).toEqual({ prefix: '80', data: dataHex })

      dataHex = '3aba4162c7251c891207b747840551a71939b0de081f85c4e44cf7c13e41daa601'
      data = toArray(dataHex, 'hex')
      encoded = toBase58Check(data, prefix)
      expect(encoded).toBe('KyBsPXxTuVD82av65KZkrGrWi5qLMah5SdNq6uftawDbgKa2wv6S')
      expect(fromBase58Check(encoded, 'hex')).toEqual({ prefix: '80', data: dataHex })
    })

    it('should correctly encode and decode Bitcoin addresses', () => {
      const dataHex = '086eaa677895f92d4a6c5ef740c168932b5e3f44'
      const data = toArray(dataHex, 'hex')
      const encoded = toBase58Check(data)
      expect(encoded).toBe('1mayif3H2JDC62S4N3rLNtBNRAiUUP99k')
      expect(fromBase58Check(encoded, 'hex')).toEqual({ prefix: '00', data: dataHex })

      const address = '1mayif3H2JDC62S4N3rLNtBNRAiUUP99k'
      expect(fromBase58Check(address, 'hex')).toEqual({ prefix: '00', data: dataHex })
    })
  })
})
