import { Reader, Writer, toHex, toArray } from '../primitives/utils.js'
import { hash256 } from '../primitives/Hash.js'
import ChainTracker from './ChainTracker.js'

export default class MerklePath {
  blockHeight: number
  path: Array<Array<{
    offset: number
    hash?: string
    txid?: boolean
    duplicate?: boolean
  }>>

  static fromHex (hex: string): MerklePath {
    return MerklePath.fromBinary(toArray(hex, 'hex'))
  }

  static fromBinary (bump: number[]): MerklePath {
    const reader = new Reader(bump)
    const blockHeight = reader.readVarIntNum()
    const treeHeight = reader.readUInt8()
    const path = Array(treeHeight).fill(0).map(() => ([]))
    let flags, offset, nLeavesAtThisHeight
    for (let level = 0; level < treeHeight; level++) {
      nLeavesAtThisHeight = reader.readVarIntNum()
      while (nLeavesAtThisHeight) {
        offset = reader.readVarIntNum()
        flags = reader.readUInt8()
        const leaf: {
          offset: number
          hash?: string
          txid?: boolean
          duplicate?: boolean
        } = { offset }
        if (flags & 1) {
          leaf.duplicate = true
        } else {
          if (flags & 2) {
            leaf.txid = true
          }
          leaf.hash = toHex(reader.read(32).reverse())
        }
        path[level].push(leaf)
        nLeavesAtThisHeight--
      }
      path[level].sort((a, b) => a.offset - b.offset)
    }
    return new MerklePath(blockHeight, path)
  }

  constructor (blockHeight: number, path: Array<Array<{
    offset: number
    hash?: string
    txid?: boolean
    duplicate?: boolean
  }>>) {
    this.blockHeight = blockHeight
    this.path = path
  }

  toBinary (): number[] {
    const writer = new Writer()
    writer.writeVarIntNum(this.blockHeight)
    const treeHeight = this.path.length
    writer.writeUInt8(treeHeight)
    for (let level = 0; level < treeHeight; level++) {
      const nLeaves = Object.keys(this.path[level]).length
      writer.writeVarIntNum(nLeaves)
      for (const leaf of this.path[level]) {
        writer.writeVarIntNum(leaf.offset)
        let flags = 0
        if (leaf?.duplicate) {
          flags |= 1
        }
        if (leaf?.txid) {
          flags |= 2
        }
        writer.writeUInt8(flags)
        if ((flags & 1) === 0) {
          writer.write(toArray(leaf.hash, 'hex').reverse())
        }
      }
    }
    return writer.toArray()
  }

  toHex (): string {
    return toHex(this.toBinary())
  }

  verify (txid: string, chainTracker: ChainTracker): boolean {
    // Find the index of the txid at the lowest level of the Merkle tree
    const index = this.path[0].find(l => l.hash === txid).offset
    if (typeof index !== 'number') {
      throw Error(`This proof does not contain the txid: ${txid}`)
    }
    // Calculate the root using the index as a way to determine which direction to concatenate.
    let workingHash = txid
    this.path.map((leaves, height) => {
      const offset = index >> height ^ 1
      const leaf = leaves.find(l => l.offset === offset)
      if (typeof leaf !== 'object') {
        throw new Error(`Missing hash for index ${index} at height ${height}`)
      }
      const hash = (m: string): string => toHex((
        hash256(toArray(m, 'hex')) as number[]
      ).reverse())
      if (leaf.duplicate) {
        workingHash = hash(workingHash + workingHash)
      } else if (offset % 2 !== 0) {
        workingHash = hash(leaf.hash + workingHash)
      } else {
        workingHash = hash(workingHash + leaf.hash)
      }
    })

    // Use the chain tracker to determine whether this is a valid merkle root at the given block height
    return chainTracker.isValidRootForHeight(workingHash, this.blockHeight)
  }
}
