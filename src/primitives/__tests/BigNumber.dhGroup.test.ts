/* eslint-env jest */
import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'
import ReductionContext from '../../../dist/cjs/src/primitives/ReductionContext'
import { dhGroups } from './BigNumber.fixtures'

describe('BN.js/Slow DH test', () => {
  Object.keys(dhGroups).forEach(function (name) {
    it('should match public key for ' + name + ' group', () => {
      const group = dhGroups[name]
      const base = new BigNumber(2)
      const mont = new ReductionContext(new BigNumber(group.prime, 16))
      const priv = new BigNumber(group.priv, 16)
      const multed = base.toRed(mont).redPow(priv).fromRed()
      const actual = Buffer.from(multed.toArray())
      expect(actual.toString('hex')).toEqual(group.pub)
    }, 3600 * 1000)
  })
})
