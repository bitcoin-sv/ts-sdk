import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import Point from '../../../dist/cjs/src/primitives/Point'

describe('PrivateKey', () => {
  it('should split the private key into shares correctly', () => {
    const privateKey = PrivateKey.fromRandom()
    const threshold = 2
    const totalShares = 5

    const og = privateKey.toWif()

    // Split the private key
    const shares = privateKey.split(threshold, totalShares)

    // Check the number of shares
    expect(shares.length).toBe(totalShares)

    // Check that each share is a BigNumber
    shares.forEach(share => {
      expect(share).toBeInstanceOf(Point)
    })

    // recombine
    const recombined = PrivateKey.fromShares(shares.slice(0, threshold))
    expect(recombined.toWif()).toBe(og)
  })

  it('should throw an error for invalid threshold values', () => {
    const privateKey = PrivateKey.fromRandom()
    const invalidThreshold = 101
    const totalShares = 5

    expect(() => privateKey.split(invalidThreshold, totalShares)).toThrow('Invalid threshold value')
  })
})
