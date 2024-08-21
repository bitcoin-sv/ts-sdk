// import { PrivateKey, PublicKey, Curve, Hash, BigNumber } from '..';
import PublicKey from '../../../dist/cjs/src/primitives/PublicKey'
// import { PrivateKey } from '..';
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import Curve from '../../../dist/cjs/src/primitives/Curve'
import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'

describe('bug-31 tests', () => {
  test('0', () => {
    const c = new Curve()
    const G = c.g
    // const bn = new BigNumber(c.n + 12)
    const bn = c.n.addn(12)
    const sn = new BigNumber(12)
    {
      expect(() => new PrivateKey(bn.toHex(), 'hex', 'be', 'error')).toThrow('Input is out of field')
    }
    const o = PrivateKey.fromString(bn.toHex(), 'hex')
    const os = PrivateKey.fromString(sn.toHex(), 'hex')
    expect(o.cmp(os)).toBe(0)
    const os2 = new PrivateKey(bn.toHex(), 'hex', 'be', 'nocheck')
    expect(o.cmp(os2)).not.toBe(0)

    const oWif = o.toWif()
    expect(oWif).toBe('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU79MFFcB1G')
    const osWif = os.toWif()
    expect(osWif).toBe('KwDiBf89QgGbjEhKnhXJuH7LrciVrZi3qYjgd9M7rFU79MFFcB1G')

    expect(() => os2.toWif()).toThrow('Value is out of field')
  })
})
