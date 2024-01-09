/* eslint-env jest */
import { toArray, zero2, toHex, encode, fromBase58, toBase58 } from '../../../dist/cjs/src/primitives/utils'

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

  describe("base58 to binary", () => {
    it('Converts as expected', () => {
      const actual = fromBase58("6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV")
      expect(toHex(actual)).toEqual('02c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cfeb05f9d2')
    })
    it('Converts as expected with leading 1s', () => {
      const actual = fromBase58("111z")
      expect(toHex(actual)).toEqual('00000039')
    })
    it('Throws when called with undefined base58 string', () => {
      expect(() => fromBase58()).toThrow(new Error('Expected base58 string but got “undefined”'))
    })
    it('Throws when called with invalid characters in base58 string', () => {
      expect(() => fromBase58('0L')).toThrow(new Error('Invalid base58 character “0”'))
    })
  })
  describe("binary to base58 string", () => {
    it('Converts to base58 as expected', () => {
      const actual = toBase58(
        toArray("02c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cfeb05f9d2", "hex")
      )
      expect(actual).toEqual("6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV")
    })
    it('Converts to base58 as expected with 1s', () => {
      const actual = toBase58([0, 0, 0, 4])
      expect(actual).toEqual("1115")
    })
  })
})