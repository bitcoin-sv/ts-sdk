import LockingScript from '../../../dist/cjs/src/script/LockingScript'
import UnlockingScript from '../../../dist/cjs/src/script/UnlockingScript'
import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'
import Spend from '../../../dist/cjs/src/script/Spend'
import scriptFromVector from './scriptFromVector'

import scriptInvalid from './script.invalid.vectors'
import scriptValid from './script.valid.vectors'

describe('Spend', () => {
  describe('vectors', () => {
    scriptValid.forEach((a, i) => {
      if (a.length === 1) {
        return
      }
      it(`should not fail when reading scriptValid vector ${i}`, () => {
        const spend = new Spend({
          sourceTXID: '0000000000000000000000000000000000000000000000000000000000000000',
          sourceOutputIndex: 0,
          sourceSatoshis: new BigNumber(1),
          lockingScript: new LockingScript(scriptFromVector(a[1]).chunks),
          transactionVersion: 1,
          otherInputs: [],
          outputs: [],
          inputIndex: 0,
          unlockingScript: new UnlockingScript(scriptFromVector(a[0]).chunks),
          inputSequence: 0xffffffff,
          lockTime: 0
        })
        expect(() => {
          spend.validate()
        }).not.toThrow()
      })
    })

    scriptInvalid.forEach((a, i) => {
      if (a.length === 1) {
        return
      }

      it(`should throw when reading scriptInvalid vector ${i}`, () => {
        const spend = new Spend({
          sourceTXID: '0000000000000000000000000000000000000000000000000000000000000000',
          sourceOutputIndex: 0,
          sourceSatoshis: new BigNumber(1),
          lockingScript: new LockingScript(scriptFromVector(a[1]).chunks),
          transactionVersion: 1,
          otherInputs: [],
          outputs: [],
          inputIndex: 0,
          unlockingScript: new UnlockingScript(scriptFromVector(a[0]).chunks),
          inputSequence: 0xffffffff,
          lockTime: 0
        })
        expect(() => {
          spend.validate()
        }).toThrow()
      })
    })
  })
})
