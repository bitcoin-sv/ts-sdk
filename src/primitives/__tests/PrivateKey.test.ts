import PublicKey from '../../../dist/cjs/src/primitives/PublicKey'
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import BRC42Private from './BRC42.private.vectors'
import Curve from '../../../dist/cjs/src/primitives/Curve'
import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'

describe('PrivateKey', () => {
  describe('BRC42 vectors', () => {
    const curve = new Curve()

    for (let i = 0; i < BRC42Private.length; i++) {
      it(`Passes BRC42 private vector #${i + 1}`, () => {
        const v = BRC42Private[i]
        const publicKey = PublicKey.fromString(v.senderPublicKey)
        const privateKey = PrivateKey.fromString(v.recipientPrivateKey, 16)
        const derived = privateKey.deriveChild(publicKey, v.invoiceNumber)
        expect(derived.toHex(32)).toEqual(v.privateKey)
      })
    }
  })

  describe('PrivateKey Validation', () => {
    const curve = new Curve()

    const isValidPrivateKey = (key) => {
      try {
        const keyAsNumber = new BigNumber(key, 16)
        const isZero = keyAsNumber.isZero()
        const exceedsCurve = keyAsNumber.cmp(curve.n) >= 0
        const isHexLengthValid = key.length === 64

        // if (isZero) console.log(`Key is zero: ${key}`)
        // if (exceedsCurve) console.log(`Key exceeds curve.n: ${key}`)
        // if (!isHexLengthValid) console.log(`Key is not 256 bits in hex: ${key} (Hex Length: ${key.length})`)

        return !isZero && !exceedsCurve && isHexLengthValid
      } catch (e) {
        console.error(`Error validating key: ${key}`, e)
        return false
      }
    }

    it('Validates manually provided valid private keys', () => {
      const validKeys = [
        '0000000000000000000000000000000000000000000000000000000000000001',
        'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140',
        '8a2f85e08360a04c8a36b7c22c5e9e9a0d3bcf2f95c97db2b8bd90fc5f5ff66a',
        '1b5a8f2392e6959a7de2b0a58f8a64cc528c9bfc1788ee0d32e1455063e71545'
      ]

      validKeys.forEach((key, index) => {
        const isValid = isValidPrivateKey(key)
        // console.log(`Valid Key Test #${index + 1}: ${key} (Valid: ${isValid})`)
        expect(isValid).toBe(true)
      })
    })

    it('Validates manually provided invalid private keys', () => {
      const invalidKeys = [
        '0000000000000000000000000000000000000000000000000000000000000000',
        'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141',
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe',
        '1234567890abcdef',
        'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd03641',
        'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364',
      ]

      invalidKeys.forEach((key, index) => {
        const isValid = isValidPrivateKey(key)
        // console.log(`Invalid Key Test #${index + 1}: ${key} (Valid: ${isValid})`)
        expect(isValid).toBe(false)
      })
    })

    it('Tests 10000 PrivateKey.fromRandom() instances for validity', () => {
      for (let i = 0; i < 10000; i++) {
        const privateKey = PrivateKey.fromRandom()
        const privateKeyValue = privateKey.toString('hex')
        const isValid = isValidPrivateKey(privateKeyValue)

        // console.log(`Random Key Test #${i + 1}: ${privateKeyValue} (Valid: ${isValid})`)
        expect(isValid).toBe(true)
      }
    })
  })
})
