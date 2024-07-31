import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import Point from '../../../dist/cjs/src/primitives/Point'

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
      expect(share).toBeInstanceOf(Point)
    })
  })

  it('should recombine the shares into a private key correctly', () => {
    let x = 0
    while (x < 3) {
      const privateKey = PrivateKey.fromRandom()
      const threshold = 2
      const totalShares = 5

      const og = privateKey.toWif() 

      // Split the private key
      const shares = privateKey.split(threshold, totalShares)

      // recombine
      const recombined = PrivateKey.fromShares(shares, threshold)
      expect(recombined.toWif()).toBe(og)
      x++
    }
  })

  it('should throw an error for invalid threshold values', () => {
    const privateKey = PrivateKey.fromRandom()
    const invalidThreshold = 101
    const totalShares = 5

    expect(() => privateKey.split(invalidThreshold, totalShares)).toThrow('threshold should be between 2 and 99')
  })

  it('should throw an error if the same share is included twice during recovery', () => {
    const privateKey = PrivateKey.fromRandom()
    const shares = privateKey.split(2, 5)
    expect(() => PrivateKey.fromShares([shares[1], shares[1]], 2)).toThrow('Duplicate share detected, each must be unique.')
  })
})
