import ScriptChunk from './ScriptChunk.js'
import OP from './OP.js'
import { encode, Writer } from '../primitives/utils.js'

export default class Script {
  chunks: ScriptChunk[]

  // TODO: static from methods

  constructor (chunks: ScriptChunk[]) {
    this.chunks = chunks
  }

  toASM(): string {
    let str = ''
    for (let i = 0; i < this.chunks.length; i++) {
        const chunk = this.chunks[i]
        str += this._chunkToString(chunk)
    }

    return str.slice(1)
  }

  toHex(): string {
    return encode(this.toBinary(), 'hex') as string
  }

   toBinary(): number[] {
      const writer = new Writer()

      for (let i = 0; i < this.chunks.length; i++) {
        const chunk = this.chunks[i]
        const op = chunk.op
        writer.writeUInt8(op)
        if (chunk.data) {
          if (op < OP.OP_PUSHDATA1) {
            writer.write(chunk.data)
          } else if (op === OP.OP_PUSHDATA1) {
            writer.writeUInt8(chunk.data.length)
            writer.write(chunk.data)
          } else if (op === OP.OP_PUSHDATA2) {
            writer.writeUInt16LE(chunk.data.length)
            writer.write(chunk.data)
          } else if (op === OP.OP_PUSHDATA4) {
            writer.writeUInt32LE(chunk.data.length)
            writer.write(chunk.data)
          }
        }
      }

      return writer.toArray()
    }

  private _chunkToString(chunk: ScriptChunk): string {
        const op = chunk.op
        let str = ''
        if (!chunk.data) {
            // no data chunk
            if (typeof OP[op] !== 'undefined') {
                // A few cases where the opcode name differs from reverseMap
                // aside from 1 to 16 data pushes.
                if (op === 0) {
                    // OP_0 -> 0
                    str = str + ' 0'
                } else if (op === 79) {
                    // OP_1NEGATE -> 1
                    str = str + ' -1'
                } else {
                    str = str + ' ' + OP[op]
                }
            } else {
                let numstr = op.toString(16)
                if (numstr.length % 2 !== 0) {
                    numstr = '0' + numstr
                }
                str = str + ' ' + numstr
            }
        } else {
            // data chunk
            if (chunk.data) {
                str = str + ' ' + encode(chunk.data, 'hex')
            }
        }
        return str
    }
}
