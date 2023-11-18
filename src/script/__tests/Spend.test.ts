import Script from '../../../dist/cjs/src/script/Script'
import LockingScript from '../../../dist/cjs/src/script/LockingScript'
import UnlockingScript from '../../../dist/cjs/src/script/UnlockingScript'
import OP from '../../../dist/cjs/src/script/OP'
import { Writer } from '../../../dist/cjs/src/primitives/utils'
import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'
import Spend from '../../../dist/cjs/src/script/Spend'

import scriptInvalid from './script.invalid.vectors'
import scriptValid from './script.valid.vectors'

describe('Spend', () => {
  describe('vectors', () => {
    const scriptFromVector = (str: string): Script => {
      const bw = new Writer()
      const tokens = str.split(' ')
      let i
      for (i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        if (token === '') {
          continue
        }
        if (token[0] === '0' && token[1] === 'x') {
          const hex = token.slice(2)
          const tbuf = new Script().writeBn(BigNumber.fromHex(hex)).toBinary()
          bw.write(tbuf)
        } else if (token[0] === "'") {
          const tstr = token.slice(1, token.length - 1)
          const cbuf = Buffer.from(tstr)
          const tbuf = Script.fromBinary([...cbuf]).toBinary()
          bw.write(tbuf)
        } else if (OP['OP_' + token] !== undefined) {
          const opstr = 'OP_' + token
          const opCodeNum = OP[opstr]
          bw.writeUInt8(opCodeNum)
        } else if (typeof OP[token] === 'number') {
          const opstr = token
          const opCodeNum = OP[opstr]
          bw.writeUInt8(opCodeNum)
        } else if (!isNaN(parseInt(token, 10))) {
          const bn = new BigNumber(token)
          const script = new Script().writeBn(bn)
          bw.write(script.toBinary())
        } else {
          throw new Error('Could not determine type of script value')
        }
      }
      const buf = bw.toArray()
      return Script.fromBinary(buf)
    }
    scriptValid.forEach((a, i) => {
      if (a.length === 1) {
        return
      }
      it('should not fail when reading scriptValid vector ' + i, () => {
        const spend = new Spend({
          sourceTXID: '0000000000000000000000000000000000000000000000000000000000000000',
          sourceOutputIndex: 0,
          sourceSatoshis: new BigNumber(1),
          lockingScript: new LockingScript(scriptFromVector(a[1]).chunks),
          transactionVersion: 1,
          otherInputs: [],
          outputs: [],
          inputIndex: 0,
          unlockingScript: new UnlockingScript(scriptFromVector(a[1]).chunks),
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
          unlockingScript: new UnlockingScript(scriptFromVector(a[1]).chunks),
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
