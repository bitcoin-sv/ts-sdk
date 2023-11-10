import ScriptChunk from './ScriptChunk.js'
import OP from './OP.js'
import { encode, toHex, Reader, Writer, toArray } from '../primitives/utils.js'
import BigNumber from '../primitives/BigNumber.js'

export default class Script {
  chunks: ScriptChunk[]

  static fromASM (asm: string): Script {
    const chunks: ScriptChunk[] = []
    const tokens = asm.split(' ')
    let i = 0
    while (i < tokens.length) {
      const token = tokens[i]
      let opCode
      let opCodeNum: number
      if (typeof OP[token] !== 'undefined') {
        opCode = token
        opCodeNum = OP[token]
      }

      // we start with two special cases, 0 and -1, which are handled specially in
      // toASM. see _chunkToString.
      if (token === '0') {
        opCodeNum = 0
        chunks.push({
          op: opCodeNum
        })
        i = i + 1
      } else if (token === '-1') {
        opCodeNum = OP.OP_1NEGATE
        chunks.push({
          op: opCodeNum
        })
        i = i + 1
      } else if (opCode === undefined) {
        let hex = tokens[i]
        if (hex.length % 2 !== 0) {
          hex = '0' + hex
        }
        const arr = toArray(hex, 'hex')
        if (encode(arr, 'hex') !== hex) {
          throw new Error('invalid hex string in script')
        }
        const len = arr.length
        if (len >= 0 && len < OP.OP_PUSHDATA1) {
          opCodeNum = len
        } else if (len < Math.pow(2, 8)) {
          opCodeNum = OP.OP_PUSHDATA1
        } else if (len < Math.pow(2, 16)) {
          opCodeNum = OP.OP_PUSHDATA2
        } else if (len < Math.pow(2, 32)) {
          opCodeNum = OP.OP_PUSHDATA4
        }
        chunks.push({
          data: arr,
          op: opCodeNum
        })
        i = i + 1
      } else if (
        opCodeNum === OP.OP_PUSHDATA1 ||
        opCodeNum === OP.OP_PUSHDATA2 ||
        opCodeNum === OP.OP_PUSHDATA4
      ) {
        chunks.push({
          data: toArray(tokens[i + 2], 'hex'),
          op: opCodeNum
        })
        i = i + 3
      } else {
        chunks.push({
          op: opCodeNum
        })
        i = i + 1
      }
    }
    return new Script(chunks)
  }

  static fromHex (hex: string): Script {
    return Script.fromBinary(toArray(hex, 'hex'))
  }

  static fromBinary (bin: number[]): Script {
    bin = [...bin]
    const chunks: ScriptChunk[] = []

    const br = new Reader(bin)
    while (!br.eof()) {
      const op = br.readUInt8()

      let len = 0
      // eslint-disable-next-line @typescript-eslint/no-shadow
      let data: number[] = []
      if (op > 0 && op < OP.OP_PUSHDATA1) {
        len = op
        chunks.push({
          data: br.read(len),
          op
        })
      } else if (op === OP.OP_PUSHDATA1) {
        try {
          len = br.readUInt8()
          data = br.read(len)
        } catch (err) {
          br.read()
        }
        chunks.push({
          data,
          op
        })
      } else if (op === OP.OP_PUSHDATA2) {
        try {
          len = br.readUInt16LE()
          data = br.read(len)
        } catch (err) {
          br.read()
        }
        chunks.push({
          data,
          op
        })
      } else if (op === OP.OP_PUSHDATA4) {
        try {
          len = br.readUInt32LE()
          data = br.read(len)
        } catch (err) {
          br.read()
        }
        chunks.push({
          data,
          op
        })
      } else {
        chunks.push({
          op
        })
      }
    }
    return new Script(chunks)
  }

  constructor (chunks: ScriptChunk[] = []) {
    this.chunks = chunks
  }

  toASM (): string {
    let str = ''
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i]
      str += this._chunkToString(chunk)
    }

    return str.slice(1)
  }

  toHex (): string {
    return encode(this.toBinary(), 'hex') as string
  }

  toBinary (): number[] {
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

  writeScript (script: Script): Script {
    this.chunks = this.chunks.concat(script.chunks)
    return this
  }

  writeOpCode (op: number): Script {
    this.chunks.push({ op })
    return this
  }

  setChunkOpCode (i: number, op: number): Script {
    this.chunks[i] = { op }
    return this
  }

  writeBn (bn: BigNumber): Script {
    if (bn.cmpn(0) === OP.OP_0) {
      this.chunks.push({
        op: OP.OP_0
      })
    } else if (bn.cmpn(-1) === 0) {
      this.chunks.push({
        op: OP.OP_1NEGATE
      })
    } else if (bn.cmpn(1) >= 0 && bn.cmpn(16) <= 0) {
      // see OP_1 - OP_16
      this.chunks.push({
        op: bn.toNumber() + OP.OP_1 - 1
      })
    } else {
      const buf = bn.toSm('little')
      this.writeBin(buf)
    }
    return this
  }

  writeBin (bin: number[]): Script {
    let op
    if (bin.length > 0 && bin.length < OP.OP_PUSHDATA1) {
      op = bin.length
    } else if (bin.length === 0) {
      op = OP.OP_0
    } else if (bin.length < Math.pow(2, 8)) {
      op = OP.OP_PUSHDATA1
    } else if (bin.length < Math.pow(2, 16)) {
      op = OP.OP_PUSHDATA2
    } else if (bin.length < Math.pow(2, 32)) {
      op = OP.OP_PUSHDATA4
    } else {
      throw new Error("You can't push that much data")
    }
    this.chunks.push({
      data: bin,
      op
    })
    return this
  }

  writeNumber (num: number): Script {
    this.writeBn(new BigNumber(num))
    return this
  }

  removeCodeseparators (): Script {
    const chunks = []
    for (let i = 0; i < this.chunks.length; i++) {
      if (this.chunks[i].op !== OP.OP_CODESEPARATOR) {
        chunks.push(this.chunks[i])
      }
    }
    this.chunks = chunks
    return this
  }

  isPushOnly (): boolean {
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i]
      const opCodeNum = chunk.op
      if (opCodeNum > OP.OP_16) {
        return false
      }
    }
    return true
  }

  private _chunkToString (chunk: ScriptChunk): string {
    const op = chunk.op
    let str = ''
    if (typeof chunk.data === 'undefined') {
      const val = (OP[op] as string)
      str = `${str} ${val}`
    } else {
      str = `${str} ${toHex(chunk.data)}`
    }
    return str
  }
}
