import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'

describe('PrivateKey', () => {
  it('should split the private key into shares correctly', () => {
    const privateKey = PrivateKey.fromRandom()
    const threshold = 2
    const totalShares = 5

    // Split the private key
    const shares = privateKey.split(threshold, totalShares)

    // Check the number of shares
    expect(shares.length).toBe(totalShares)

    // Check that each share is a BigNumber
    shares.forEach(share => {
      expect(share).toBeInstanceOf(BigNumber)
    })
  })

  it('should throw an error for invalid threshold values', () => {
    const privateKey = PrivateKey.fromRandom()
    const invalidThreshold = 101
    const totalShares = 5

    expect(() => privateKey.split(invalidThreshold, totalShares)).toThrow('Invalid threshold value')
  })
})
