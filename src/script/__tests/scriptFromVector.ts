import Script from '../../../dist/cjs/src/script/Script'
import OP from '../../../dist/cjs/src/script/OP'
import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'
import { Writer, toArray } from '../../../dist/cjs/src/primitives/utils'

export default (str: string): Script => {
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
      bw.write(toArray(hex, 'hex'))
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
  const script = Script.fromBinary(buf)
  return script
}
