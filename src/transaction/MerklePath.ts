import { Reader, Writer, toHex, toArray } from '../primitives/utils.js'
import { hash256 } from '../primitives/Hash.js'
import ChainTracker from './ChainTracker.js'

export interface MerklePathLeaf {
  offset: number
  hash?: string
  txid?: boolean
  duplicate?: boolean
}

/**
 * Represents a Merkle Path, which is used to provide a compact proof of inclusion for a
 * transaction in a block. This class encapsulates all the details required for creating
 * and verifying Merkle Proofs.
 *
 * @class MerklePath
 * @property {number} blockHeight - The height of the block in which the transaction is included.
 * @property {Array<Array<{offset: number, hash?: string, txid?: boolean, duplicate?: boolean}>>} path -
 *           A tree structure representing the Merkle Path, with each level containing information
 *           about the nodes involved in constructing the proof.
 *
 * @example
 * // Creating and verifying a Merkle Path
 * const merklePath = MerklePath.fromHex('...');
 * const isValid = merklePath.verify(txid, chainTracker);
 *
 * @description
 * The MerklePath class is useful for verifying transactions in a lightweight and efficient manner without
 * needing the entire block data. This class offers functionalities for creating, converting,
 * and verifying these proofs.
 */
export default class MerklePath {
  blockHeight: number
  path: Array<Array<{
    offset: number
    hash?: string
    txid?: boolean
    duplicate?: boolean
  }>>

  /**
   * Creates a MerklePath instance from a hexadecimal string.
   *
   * @static
   * @param {string} hex - The hexadecimal string representation of the Merkle Path.
   * @returns {MerklePath} - A new MerklePath instance.
   */
  static fromHex (hex: string): MerklePath {
    return MerklePath.fromBinary(toArray(hex, 'hex'))
  }

  static fromReader (reader: Reader): MerklePath {
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

  /**
   * Creates a MerklePath instance from a binary array.
   *
   * @static
   * @param {number[]} bump - The binary array representation of the Merkle Path.
   * @returns {MerklePath} - A new MerklePath instance.
   */
  static fromBinary (bump: number[]): MerklePath {
    const reader = new Reader(bump)
    return MerklePath.fromReader(reader)
  }

  constructor (blockHeight: number, path: Array<Array<{
    offset: number
    hash?: string
    txid?: boolean
    duplicate?: boolean
  }>>) {
    this.blockHeight = blockHeight
    this.path = path

    // store all of the legal offsets which we expect given the txid indices.
    const legalOffsets = Array(this.path.length).fill(0).map(() => new Set())
    this.path.map((leaves, height) => {
      if (leaves.length === 0 && height === 0) {
        throw new Error(`Empty level at height: ${height}`)
      }
      const offsetsAtThisHeight = new Set()
      leaves.map(leaf => {
        if (offsetsAtThisHeight.has(leaf.offset)) throw new Error(`Duplicate offset: ${leaf.offset}, at height: ${height}`)
        offsetsAtThisHeight.add(leaf.offset)
        if (height === 0) {
          if (!leaf.duplicate) {
            for (let h = 1; h < this.path.length; h++) {
              legalOffsets[h].add(leaf.offset >> h ^ 1)
            }
          }
        } else {
          if (!legalOffsets[height].has(leaf.offset)) {
            throw new Error(`Invalid offset: ${leaf.offset}, at height: ${height}, with legal offsets: ${Array.from(legalOffsets[height]).join(', ')}`)
          }
        }
      })
    })

    let root: string
    // every txid must calculate to the same root.
    this.path[0].map((leaf, idx) => {
      if (idx === 0) root = this.computeRoot(leaf.hash)
      if (root !== this.computeRoot(leaf.hash)) {
        throw new Error('Mismatched roots')
      }
    })
  }

  /**
   * Converts the MerklePath to a binary array format.
   *
   * @returns {number[]} - The binary array representation of the Merkle Path.
   */
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

  /**
   * Converts the MerklePath to a hexadecimal string format.
   *
   * @returns {string} - The hexadecimal string representation of the Merkle Path.
   */
  toHex (): string {
    return toHex(this.toBinary())
  }

  /**
   * Computes the Merkle root from the provided transaction ID.
   *
   * @param {string} txid - The transaction ID to compute the Merkle root for. If not provided, the root will be computed from an unspecified branch, and not all branches will be validated!
   * @returns {string} - The computed Merkle root as a hexadecimal string.
   * @throws {Error} - If the transaction ID is not part of the Merkle Path.
   */
  computeRoot (txid?: string): string {
    if (typeof txid !== 'string') {
      txid = this.path[0].find(leaf => Boolean(leaf?.hash)).hash
    }
    // Find the index of the txid at the lowest level of the Merkle tree
    const index = this.path[0].find(l => l.hash === txid).offset
    if (typeof index !== 'number') {
      throw new Error(`This proof does not contain the txid: ${txid}`)
    }
    // Calculate the root using the index as a way to determine which direction to concatenate.
    const hash = (m: string): string => toHex((
      hash256(toArray(m, 'hex').reverse())
    ).reverse())
    let workingHash = txid
    for (let height = 0; height < this.path.length; height++) {
      const leaves = this.path[height]
      const offset = index >> height ^ 1
      const leaf = this.findOrComputeLeaf(height, offset)
      if (typeof leaf !== 'object') {
        throw new Error(`Missing hash for index ${index} at height ${height}`)
      }
      if (leaf.duplicate) {
        workingHash = hash(workingHash + workingHash)
      } else if (offset % 2 !== 0) {
        workingHash = hash(leaf.hash + workingHash)
      } else {
        workingHash = hash(workingHash + leaf.hash)
      }
    }
    return workingHash
  }

  /**
   * Find leaf with `offset` at `height` or compute from level below, recursively.
   *
   * Does not add computed leaves to path.
   *
   * @param height
   * @param offset
   */
  findOrComputeLeaf (height: number, offset: number): MerklePathLeaf | undefined {
    const hash = (m: string): string => toHex((
      hash256(toArray(m, 'hex').reverse())
    ).reverse())

    let leaf: MerklePathLeaf | undefined = this.path[height].find(l => l.offset === offset)

    if (leaf) return leaf

    if (height === 0) return undefined

    const h = height - 1
    const l = offset << 1

    const leaf0 = this.findOrComputeLeaf(h, l)
    if (!leaf0 || !leaf0.hash) return undefined

    const leaf1 = this.findOrComputeLeaf(h, l + 1)
    if (!leaf1) return undefined

    let workinghash: string
    if (leaf1.duplicate) { workinghash = hash(leaf0.hash + leaf0.hash) } else { workinghash = hash(leaf1.hash + leaf0.hash) }
    leaf = {
      offset,
      hash: workinghash
    }

    return leaf
  }

  /**
   * Verifies if the given transaction ID is part of the Merkle tree at the specified block height.
   *
   * @param {string} txid - The transaction ID to verify.
   * @param {ChainTracker} chainTracker - The ChainTracker instance used to verify the Merkle root.
   * @returns {boolean} - True if the transaction ID is valid within the Merkle Path at the specified block height.
   */
  async verify (txid: string, chainTracker: ChainTracker): Promise<boolean> {
    const root = this.computeRoot(txid)
    // Use the chain tracker to determine whether this is a valid merkle root at the given block height
    return await chainTracker.isValidRootForHeight(root, this.blockHeight)
  }

  /**
   * Combines this MerklePath with another to create a compound proof.
   *
   * @param {MerklePath} other - Another MerklePath to combine with this path.
   * @throws {Error} - If the paths have different block heights or roots.
   */
  combine (other: MerklePath): void {
    if (this.blockHeight !== other.blockHeight) {
      throw new Error('You cannot combine paths which do not have the same block height.')
    }
    const root1 = this.computeRoot()
    const root2 = other.computeRoot()
    if (root1 !== root2) {
      throw new Error('You cannot combine paths which do not have the same root.')
    }
    const combinedPath = []
    for (let h = 0; h < this.path.length; h++) {
      combinedPath.push([])
      for (let l = 0; l < this.path[h].length; l++) {
        combinedPath[h].push(this.path[h][l])
      }
      for (let l = 0; l < other.path[h].length; l++) {
        if (!(combinedPath[h].find(leaf => leaf.offset === other.path[h][l].offset) as boolean)) {
          combinedPath[h].push(other.path[h][l])
        } else {
          // Ensure that any elements which appear in both are not downgraded to a non txid.
          if (other.path[h][l]?.txid) {
            const target = combinedPath[h].find(leaf => leaf.offset === other.path[h][l].offset)
            target.txid = true
          }
        }
      }
    }
    this.path = combinedPath
    this.trim()
  }

  /**
   * Remove all internal nodes that are not required by level zero txid nodes.
   * Assumes that at least all required nodes are present.
   * Leaves all levels sorted by increasing offset.
   */
  trim () {
    const pushIfNew = (v: number, a: number[]) => {
      if (a.length === 0 || a.slice(-1)[0] !== v) { a.push(v) }
    }

    const dropOffsetsFromLevel = (dropOffsets: number[], level: number) => {
      for (let i = dropOffsets.length; i >= 0; i--) {
        const l = this.path[level].findIndex(n => n.offset === dropOffsets[i])
        if (l >= 0) { this.path[level].splice(l, 1) }
      }
    }

    const nextComputedOffsets = (cos: number[]): number[] => {
      const ncos: number[] = []
      for (const o of cos) {
        pushIfNew(o >> 1, ncos)
      }
      return ncos
    }

    let computedOffsets: number[] = [] // in next level
    let dropOffsets: number[] = []
    for (let h = 0; h < this.path.length; h++) {
      // Sort each level by increasing offset order
      this.path[h].sort((a, b) => a.offset - b.offset)
    }
    for (let l = 0; l < this.path[0].length; l++) {
      const n = this.path[0][l]
      if (n.txid) {
        // level 0 must enable computing level 1 for txid nodes
        pushIfNew(n.offset >> 1, computedOffsets)
      } else {
        const isOdd = n.offset % 2 === 1
        const peer = this.path[0][l + (isOdd ? -1 : 1)]
        if (!peer.txid) {
          // drop non-txid level 0 nodes without a txid peer
          pushIfNew(peer.offset, dropOffsets)
        }
      }
    }
    dropOffsetsFromLevel(dropOffsets, 0)
    for (let h = 1; h < this.path.length; h++) {
      dropOffsets = computedOffsets
      computedOffsets = nextComputedOffsets(computedOffsets)
      dropOffsetsFromLevel(dropOffsets, h)
    }
  }
}
