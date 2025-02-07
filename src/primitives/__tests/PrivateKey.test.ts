import PublicKey from '../../primitives/PublicKey'
import PrivateKey from '../../primitives/PrivateKey'
import BRC42Private from './BRC42.private.vectors'
import Curve from '../../primitives/Curve'
import BigNumber from '../../primitives/BigNumber'

describe('PrivateKey', () => {
  describe('BRC42 vectors', () => {
    BRC42Private.forEach((vector, index) => {
      it(`Passes BRC42 private vector #${index + 1}`, () => {
        const publicKey = PublicKey.fromString(vector.senderPublicKey)
        const privateKey = PrivateKey.fromString(vector.recipientPrivateKey)
        const derived = privateKey.deriveChild(publicKey, vector.invoiceNumber)
        expect(derived.toHex()).toEqual(vector.privateKey)
      })
    })
  })

  describe('PrivateKey Validation and Conversion', () => {
    const curve = new Curve()

    const isValidPrivateKey = (key: string): boolean => {
      try {
        const keyAsNumber = new BigNumber(key, 16)
        return (
          !keyAsNumber.isZero() &&
          keyAsNumber.cmp(curve.n) < 0 &&
          key.length === 64
        )
      } catch {
        return false
      }
    }

    it('Validates and converts valid private keys between hex and string', () => {
      const validKeys = [
        '0000000000000000000000000000000000000000000000000000000000000001',
        'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140',
        '8a2f85e08360a04c8a36b7c22c5e9e9a0d3bcf2f95c97db2b8bd90fc5f5ff66a',
        '1b5a8f2392e6959a7de2b0a58f8a64cc528c9bfc1788ee0d32e1455063e71545'
      ]

      validKeys.forEach((key) => {
        const privateKeyFromHex = PrivateKey.fromHex(key)
        const privateKeyFromString = PrivateKey.fromString(key, 'hex')
        const privateKeyToHex = privateKeyFromHex.toHex()
        const privateKeyToString = privateKeyFromString.toString('hex')
        expect(isValidPrivateKey(privateKeyToHex)).toBe(true)
        expect(isValidPrivateKey(privateKeyToString)).toBe(true)

        // Round-trip conversion checks
        expect(privateKeyToHex).toEqual(key)
        expect(privateKeyToString).toEqual(key)
      })
    })

    // it('Rejects invalid private keys during validation and conversion', () => {
    //   const invalidKeys = [
    //     '0000000000000000000000000000000000000000000000000000000000000000',
    //     'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141',
    //     'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    //     'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe',
    //     '1234567890abcdef',
    //     'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd03641',
    //     'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364',
    //   ]

    //   invalidKeys.forEach((key, index) => {
    //     const isValid = isValidPrivateKey(key)
    //     expect(isValid).toBe(false)
    //     // Ensure invalid keys throw an error during conversion
    //     expect(() => PrivateKey.fromHex(key)).toThrow()
    //     expect(() => PrivateKey.fromString(key, 'hex')).toThrow()
    //   })
    // })

    it('Tests 10,000 random private keys for valid conversions', () => {
      for (let i = 0; i < 10000; i++) {
        const privateKey = PrivateKey.fromRandom()
        const privateKeyHex = privateKey.toHex()
        const privateKeyString = privateKey.toString('hex')

        // Validate the random key's format
        expect(isValidPrivateKey(privateKeyHex)).toBe(true)
        expect(isValidPrivateKey(privateKeyString)).toBe(true)

        // Round-trip conversion checks
        const roundTripHex = PrivateKey.fromHex(privateKeyHex).toHex()
        const roundTripString = PrivateKey.fromString(
          privateKeyString,
          'hex'
        ).toString('hex')
        expect(roundTripHex).toEqual(privateKeyHex)
        expect(roundTripString).toEqual(privateKeyString)
      }
    })
  })
})
