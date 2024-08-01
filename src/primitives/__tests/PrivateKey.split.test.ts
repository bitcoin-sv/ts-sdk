import PrivateKey, { KeyShares } from '../../../dist/cjs/src/primitives/PrivateKey'
import { PointInFiniteField } from '../../../dist/cjs/src/primitives/Polynomial'

describe('PrivateKey', () => {
  it('should split the private key into shares correctly', () => {
    const privateKey = PrivateKey.fromRandom()
    const threshold = 2
    const totalShares = 5

    // Split the private key
    const shares = privateKey.toKeyShares(threshold, totalShares)
    const backup = shares.toBackupFormat()

    // Check the number of shares
    expect(backup.length).toBe(totalShares)

    // Check that each share is a BigNumber
    shares.points.forEach(share => {
      expect(share).toBeInstanceOf(PointInFiniteField)
    })
    expect(shares.threshold).toBe(threshold)
  })

  it('should recombine the shares into a private key correctly', () => {
    let x = 0
    while (x < 3) {
      const key = PrivateKey.fromRandom()
      const allShares = key.toKeyShares(3, 5)
      const backup = allShares.toBackupFormat()
      const someShares = KeyShares.fromBackupFormat(backup.slice(0,3))
      const rebuiltKey = PrivateKey.fromKeyShares(someShares)
      expect(rebuiltKey.toWif()).toBe(key.toWif())
      x++
    }
  })

  it('should throw an error for invalid threshold values', () => {
    const k = PrivateKey.fromRandom()
    expect(() => k.toKeyShares(101, 23)).toThrow('threshold should be between 2 and 99')
  })

  it('should throw an error if the same share is included twice during recovery', () => {
    const backup = [ '45s4vLL2hFvqmxrarvbRT2vZoQYGZGocsmaEksZ64o5M.A7nZrGux15nEsQGNZ1mbfnMKugNnS6SYYEQwfhfbDZG8.3.2f804d43', '7aPzkiGZgvU4Jira5PN9Qf9o7FEg6uwy1zcxd17NBhh3.CCt7NH1sPFgceb6phTRkfviim2WvmUycJCQd2BxauxP9.3.2f804d43', '9GaS2Tw5sXqqbuigdjwGPwPsQuEFqzqUXo5MAQhdK3es.8MLh2wyE3huyq6hiBXjSkJRucgyKh4jVY6ESq5jNtXRE.3.2f804d43', 'GBmoNRbsMVsLmEK5A6G28fktUNonZkn9mDrJJ58FXgsf.HDBRkzVUCtZ38ApEu36fvZtDoDSQTv3TWmbnxwwR7kto.3.2f804d43', '2gHebXBgPd7daZbsj6w9TPDta3vQzqvbkLtJG596rdN1.E7ZaHyyHNDCwR6qxZvKkPPWWXzFCiKQFentJtvSSH5Bi.3.2f804d43' ]
    const recovery = KeyShares.fromBackupFormat([backup[0], backup[1], backup[1]])
    expect(() => PrivateKey.fromKeyShares(recovery)).toThrow('Duplicate share detected, each must be unique.')
  })
})
