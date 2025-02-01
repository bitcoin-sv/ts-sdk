import MerklePath from './MerklePath'
import Transaction from './Transaction'
import ChainTracker from './ChainTracker'
import BeefTx from './BeefTx'
import { Reader, Writer, toHex, toArray } from '../primitives/utils'
import { hash256 } from '../primitives/Hash'

export const BEEF_V1 = 4022206465 // 0100BEEF in LE order
export const BEEF_V2 = 4022206466 // 0200BEEF in LE order
export const ATOMIC_BEEF = 0x01010101 // 01010101
export enum TX_DATA_FORMAT {
  RAWTX = 0, // rawtx without BUMP
  RAWTX_AND_BUMP_INDEX = 1, // rawtx with bump index
  TXID_ONLY = 2, // txid only
}

/*
 * BEEF standard: BRC-62: Background Evaluation Extended Format (BEEF) Transactions
 * https://github.com/bitcoin-sv/BRCs/blob/master/transactions/0062.md
 *
 * BUMP standard: BRC-74: BSV Unified Merkle Path (BUMP) Format
 * https://github.com/bitcoin-sv/BRCs/blob/master/transactions/0074.md
 *
 * BRC-95: Atomic BEEF Transactions
 * https://github.com/bitcoin-sv/BRCs/blob/master/transactions/0095.md
 *
 * The Atomic BEEF format is supported by the binary deserialization static method `fromBinary`.
 *
 * BRC-96: BEEF V2, Txid Only Extension
 * https://github.com/bitcoin-sv/BRCs/blob/master/transactions/0096.md
 *
 * A valid serialized BEEF is the cornerstone of Simplified Payment Validation (SPV)
 * where they are exchanged between two non-trusting parties to establish the
 * validity of a newly constructed bitcoin transaction and its inputs from prior
 * transactions.
 *
 * A `Beef` is fundamentally an list of `BUMP`s and a list of transactions.
 *
 * A `BUMP` is a partial merkle tree for a 'mined' bitcoin block.
 * It can therefore be used to prove the validity of transaction data
 * for each transaction txid whose merkle path is included in the tree.
 *
 * To be valid, the list of transactions must be sorted in dependency order:
 * oldest transaction first;
 * and each transaction must either
 * have a merkle path in one of the BUMPs, or
 * have all of its input transactions included in the list of transactions.
 *
 * The `Beef` class supports the construction of valid BEEFs by allowing BUMPs
 * (merkle paths) and transactions to be merged sequentially.
 *
 * The `Beef` class also extends the standard by supporting 'known' transactions.
 * A 'known' transaction is represented solely by its txid.
 * To become valid, all the 'known' transactions in a `Beef` must be replaced by full
 * transactions and merkle paths, if they are mined.
 *
 * The purpose of supporting 'known' transactions is that one or both parties
 * generating and exchanging BEEFs often possess partial knowledge of valid transactions
 * due to their history.
 *
 * A valid `Beef` is only required when sent to a party with no shared history,
 * such as a transaction processor.
 *
 * IMPORTANT NOTE:
 * It is fundamental to the BEEF value proposition that only valid transactions and valid
 * merkle path (BUMP) data be added to it. Merging invalid data breaks the `verify` and `isValid`
 * functions. There is no support for removing invalid data. A `Beef` that becomes invalid
 * must be discarded.
 */
export class Beef {
  bumps: MerklePath[] = []
  txs: BeefTx[] = []
  version: number = BEEF_V2
  atomicTxid: string | undefined = undefined

  constructor (version: number = BEEF_V2) {
    this.version = version
  }

  /**
   * @param txid of `beefTx` to find
   * @returns `BeefTx` in `txs` with `txid`.
   */
  findTxid (txid: string): BeefTx | undefined {
    return this.txs.find((tx) => tx.txid === txid)
  }

  /**
   * Replaces `BeefTx` for this txid with txidOnly.
   *
   * Replacement is done so that a `clone()` can be
   * updated by this method without affecting the
   * original.
   *
   * @param txid
   * @returns undefined if txid is unknown.
   */
  makeTxidOnly (txid: string): BeefTx | undefined {
    const i = this.txs.findIndex((tx) => tx.txid === txid)
    if (i === -1) return undefined
    let btx = this.txs[i]
    if (btx.isTxidOnly) {
      return btx
    }
    this.txs.splice(i, 1)
    btx = this.mergeTxidOnly(txid)
    return btx
  }

  /**
   * @returns `MerklePath` with level zero hash equal to txid or undefined.
   */
  findBump (txid: string): MerklePath | undefined {
    return this.bumps.find((b) => b.path[0].find((leaf) => leaf.hash === txid))
  }

  /**
   * Finds a Transaction in this `Beef`
   * and adds any missing input SourceTransactions from this `Beef`.
   *
   * The result is suitable for signing.
   *
   * @param txid The id of the target transaction.
   * @returns Transaction with all available input `SourceTransaction`s from this Beef.
   */
  findTransactionForSigning (txid: string): Transaction | undefined {
    const beefTx = this.findTxid(txid)
    if (!isO(beefTx)) return undefined

    for (const i of beefTx.tx.inputs) {
      if (!isO(i.sourceTransaction)) {
        const itx = this.findTxid(i.sourceTXID)
        if (isO(itx)) {
          i.sourceTransaction = itx.tx
        }
      }
    }

    return beefTx.tx
  }

  /**
   * Builds the proof tree rooted at a specific `Transaction`.
   *
   * To succeed, the Beef must contain all the required transaction and merkle path data.
   *
   * @param txid The id of the target transaction.
   * @returns Transaction with input `SourceTransaction` and `MerklePath` populated from this Beef.
   */
  findAtomicTransaction (txid: string): Transaction | undefined {
    const beefTx = this.findTxid(txid)
    if (!isO(beefTx)) return undefined

    const addInputProof = (beef: Beef, tx: Transaction): void => {
      const mp = beef.findBump(tx.id('hex'))
      if (isO(mp)) {
        tx.merklePath = mp
      } else {
        for (const i of tx.inputs) {
          if (!isO(i.sourceTransaction)) {
            const itx = beef.findTxid(i.sourceTXID)
            if (isO(itx)) {
              i.sourceTransaction = itx.tx
            }
          }
          if (isO(i.sourceTransaction)) {
            const mp = beef.findBump(i.sourceTransaction.id('hex'))
            if (isO(mp)) {
              i.sourceTransaction.merklePath = mp
            } else {
              addInputProof(beef, i.sourceTransaction)
            }
          }
        }
      }
    }

    addInputProof(this, beefTx.tx)

    return beefTx.tx
  }

  /**
   * Merge a MerklePath that is assumed to be fully valid.
   * @param bump
   * @returns index of merged bump
   */
  mergeBump (bump: MerklePath): number {
    let bumpIndex: number | undefined
    // If this proof is identical to another one previously added, we use that first. Otherwise, we try to merge it with proofs from the same block.
    for (let i = 0; i < this.bumps.length; i++) {
      const b = this.bumps[i]
      if (b === bump) {
        // Literally the same
        return i
      }
      if (b.blockHeight === bump.blockHeight) {
        // Probably the same...
        const rootA = b.computeRoot()
        const rootB = bump.computeRoot()
        if (rootA === rootB) {
          // Definitely the same... combine them to save space
          b.combine(bump)
          bumpIndex = i
          break
        }
      }
    }

    // if the proof is not yet added, add a new path.
    if (bumpIndex === undefined) {
      bumpIndex = this.bumps.length
      this.bumps.push(bump)
    }

    // review if any transactions are proven by this bump
    const b = this.bumps[bumpIndex]
    for (const tx of this.txs) {
      const txid = tx.txid
      if (!isO(tx.bumpIndex)) {
        for (const n of b.path[0]) {
          if (n.hash === txid) {
            tx.bumpIndex = bumpIndex
            n.txid = true
            break
          }
        }
      }
    }

    return bumpIndex
  }

  /**
   * Merge a serialized transaction.
   *
   * Checks that a transaction with the same txid hasn't already been merged.
   *
   * Replaces existing transaction with same txid.
   *
   * @param rawTx
   * @param bumpIndex Optional. If a number, must be valid index into bumps array.
   * @returns txid of rawTx
   */
  mergeRawTx (rawTx: number[], bumpIndex?: number): BeefTx {
    const newTx: BeefTx = new BeefTx(rawTx, bumpIndex)
    this.removeExistingTxid(newTx.txid)
    this.txs.push(newTx)
    this.tryToValidateBumpIndex(newTx)
    return newTx
  }

  /**
   * Merge a `Transaction` and any referenced `merklePath` and `sourceTransaction`, recursifely.
   *
   * Replaces existing transaction with same txid.
   *
   * Attempts to match an existing bump to the new transaction.
   *
   * @param tx
   * @returns txid of tx
   */
  mergeTransaction (tx: Transaction): BeefTx {
    const txid = tx.id('hex')
    this.removeExistingTxid(txid)
    let bumpIndex: number | undefined
    if (isO(tx.merklePath)) {
      bumpIndex = this.mergeBump(tx.merklePath)
    }
    const newTx = new BeefTx(tx, bumpIndex)
    this.txs.push(newTx)
    this.tryToValidateBumpIndex(newTx)
    bumpIndex = newTx.bumpIndex
    if (bumpIndex === undefined) {
      for (const input of tx.inputs) {
        if (isO(input.sourceTransaction)) {
          this.mergeTransaction(input.sourceTransaction)
        }
      }
    }
    return newTx
  }

  /**
   * Removes an existing transaction from the BEEF, given its TXID
   * @param txid TXID of the transaction to remove
   */
  removeExistingTxid (txid: string): void {
    const existingTxIndex = this.txs.findIndex((t) => t.txid === txid)
    if (existingTxIndex >= 0) {
      this.txs.splice(existingTxIndex, 1)
    }
  }

  mergeTxidOnly (txid: string): BeefTx {
    let tx = this.txs.find((t) => t.txid === txid)
    if (!isO(tx)) {
      tx = new BeefTx(txid)
      this.txs.push(tx)
      this.tryToValidateBumpIndex(tx)
    }
    return tx
  }

  mergeBeefTx (btx: BeefTx): BeefTx {
    let beefTx = this.findTxid(btx.txid)
    if (btx.isTxidOnly && !isO(beefTx)) {
      beefTx = this.mergeTxidOnly(btx.txid)
    } else if (isO(btx._tx) && (!isO(beefTx) || beefTx.isTxidOnly)) {
      beefTx = this.mergeTransaction(btx._tx)
    } else if (isA(btx._rawTx) && (!isO(beefTx) || beefTx.isTxidOnly)) {
      beefTx = this.mergeRawTx(btx._rawTx)
    }
    return beefTx
  }

  mergeBeef (beef: number[] | Beef): void {
    const b: Beef = Array.isArray(beef) ? Beef.fromBinary(beef) : beef

    for (const bump of b.bumps) {
      this.mergeBump(bump)
    }

    for (const tx of b.txs) {
      this.mergeBeefTx(tx)
    }
  }

  /**
   * Sorts `txs` and checks structural validity of beef.
   *
   * Does NOT verify merkle roots.
   *
   * Validity requirements:
   * 1. No 'known' txids, unless `allowTxidOnly` is true.
   * 2. All transactions have bumps or their inputs chain back to bumps (or are known).
   * 3. Order of transactions satisfies dependencies before dependents.
   * 4. No transactions with duplicate txids.
   *
   * @param allowTxidOnly optional. If true, transaction txid only is assumed valid
   */
  isValid (allowTxidOnly?: boolean): boolean {
    return this.verifyValid(allowTxidOnly).valid
  }

  /**
   * Sorts `txs` and confirms validity of transaction data contained in beef
   * by validating structure of this beef and confirming computed merkle roots
   * using `chainTracker`.
   *
   * Validity requirements:
   * 1. No 'known' txids, unless `allowTxidOnly` is true.
   * 2. All transactions have bumps or their inputs chain back to bumps (or are known).
   * 3. Order of transactions satisfies dependencies before dependents.
   * 4. No transactions with duplicate txids.
   *
   * @param chainTracker Used to verify computed merkle path roots for all bump txids.
   * @param allowTxidOnly optional. If true, transaction txid is assumed valid
   */
  async verify (
    chainTracker: ChainTracker,
    allowTxidOnly?: boolean
  ): Promise<boolean> {
    const r = this.verifyValid(allowTxidOnly)
    if (!r.valid) return false

    for (const height of Object.keys(r.roots)) {
      const isValid = await chainTracker.isValidRootForHeight(
        r.roots[height],
        Number(height)
      )
      if (!isValid) {
        return false
      }
    }

    return true
  }

  private verifyValid (allowTxidOnly?: boolean): {
    valid: boolean
    roots: Record<number, string>
  } {
    const r: { valid: boolean, roots: Record<number, string> } = {
      valid: false,
      roots: {}
    }

    this.sortTxs()

    // valid txids: only txids if allowed, bump txids, then txids with input's in txids
    const txids: Record<string, boolean> = {}

    for (const tx of this.txs) {
      if (tx.isTxidOnly) {
        if (!isTB(allowTxidOnly)) return r
        txids[tx.txid] = true
      }
    }

    const confirmComputedRoot = (b: MerklePath, txid: string): boolean => {
      const root = b.computeRoot(txid)
      if (!isS(r.roots[b.blockHeight])) {
        // accept the root as valid for this block and reuse for subsequent txids
        r.roots[b.blockHeight] = root
      }
      if (r.roots[b.blockHeight] !== root) {
        return false
      }
      return true
    }

    for (const b of this.bumps) {
      for (const n of b.path[0]) {
        if (isTB(n.txid) && isS(n.hash)) {
          txids[n.hash] = true
          // all txid hashes in all bumps must have agree on computed merkle path roots
          if (!confirmComputedRoot(b, n.hash)) {
            return r
          }
        }
      }
    }

    for (const t of this.txs) {
      // all input txids must be included before they are referenced
      for (const i of t.inputTxids) {
        if (!txids[i]) return r
      }
      txids[t.txid] = true
    }

    r.valid = true
    return r
  }

  /**
   * Serializes this data to `writer`
   * @param writer
   */
  toWriter (writer: Writer): void {
    writer.writeUInt32LE(this.version)

    writer.writeVarIntNum(this.bumps.length)
    for (const b of this.bumps) {
      writer.write(b.toBinary())
    }

    writer.writeVarIntNum(this.txs.length)
    for (const tx of this.txs) {
      tx.toWriter(writer, this.version)
    }
  }

  /**
   * Returns a binary array representing the serialized BEEF
   * @returns A binary array representing the BEEF
   */
  toBinary (): number[] {
    const writer = new Writer()
    this.toWriter(writer)
    return writer.toArray()
  }

  /**
   * Serialize this Beef as AtomicBEEF.
   *
   * `txid` must exist
   *
   * after sorting, if txid is not last txid, creates a clone and removes newer txs
   *
   * @param txid
   * @returns serialized contents of this Beef with AtomicBEEF prefix.
   */
  toBinaryAtomic (txid: string): number[] {
    this.sortTxs()
    const tx = this.findTxid(txid)
    if (tx == null) {
      throw new Error(`${txid} does not exist in this Beef`)
    }
    const writer = new Writer()
    writer.writeUInt32LE(ATOMIC_BEEF)
    writer.write(toArray(txid, 'hex'))
    if (this.txs[this.txs.length - 1] !== tx) {
      const beef = this.clone()
      const i = this.txs.findIndex((t) => t.txid === txid)
      beef.txs.splice(i + 1)
      beef.toWriter(writer)
    } else {
      this.toWriter(writer)
    }
    return writer.toArray()
  }

  /**
   * Returns a hex string representing the serialized BEEF
   * @returns A hex string representing the BEEF
   */
  toHex (): string {
    return toHex(this.toBinary())
  }

  static fromReader (br: Reader): Beef {
    let version = br.readUInt32LE()
    let atomicTxid: string | undefined
    if (version === ATOMIC_BEEF) {
      // Skip the txid and re-read the BEEF version
      atomicTxid = toHex(br.read(32))
      version = br.readUInt32LE()
    }
    if (version !== BEEF_V1 && version !== BEEF_V2) {
      throw new Error(
        `Serialized BEEF must start with ${BEEF_V1} or ${BEEF_V2} but starts with ${version}`
      )
    }
    const beef = new Beef(version)
    const bumpsLength = br.readVarIntNum()
    for (let i = 0; i < bumpsLength; i++) {
      const bump = MerklePath.fromReader(br, false)
      beef.bumps.push(bump)
    }
    const txsLength = br.readVarIntNum()
    for (let i = 0; i < txsLength; i++) {
      const beefTx = BeefTx.fromReader(br, version)
      beef.txs.push(beefTx)
    }
    beef.atomicTxid = atomicTxid
    return beef
  }

  /**
   * Constructs an instance of the Beef class based on the provided binary array
   * @param bin The binary array from which to construct BEEF
   * @returns An instance of the Beef class constructed from the binary data
   */
  static fromBinary (bin: number[]): Beef {
    const br = new Reader(bin)
    return Beef.fromReader(br)
  }

  /**
   * Constructs an instance of the Beef class based on the provided string
   * @param s The string value from which to construct BEEF
   * @param enc The encoding of the string value from which BEEF should be constructed
   * @returns An instance of the Beef class constructed from the string
   */
  static fromString (s: string, enc: 'hex' | 'utf8' | 'base64' = 'hex'): Beef {
    const bin = toArray(s, enc)
    const br = new Reader(bin)
    return Beef.fromReader(br)
  }

  /**
   * Try to validate newTx.bumpIndex by looking for an existing bump
   * that proves newTx.txid
   *
   * @param newTx A new `BeefTx` that has been added to this.txs
   * @returns true if a bump was found, false otherwise
   */
  private tryToValidateBumpIndex (newTx: BeefTx): boolean {
    if (newTx.bumpIndex !== undefined) {
      return true
    }
    const txid = newTx.txid
    for (let i = 0; i < this.bumps.length; i++) {
      const j = this.bumps[i].path[0].findIndex((b) => b.hash === txid)
      if (j >= 0) {
        newTx.bumpIndex = i
        this.bumps[i].path[0][j].txid = true
        return true
      }
    }
    return false
  }

  /**
   * Sort the `txs` by input txid dependency order:
   * - Oldest Tx Anchored by Path or txid only
   * - Newer Txs depending on Older parents
   * - Newest Tx
   *
   * with proof (MerklePath) last, longest chain of dependencies first
   *
   * @returns `{ missingInputs, notValid, valid, withMissingInputs }`
   */
  sortTxs (): {
    missingInputs: string[]
    notValid: string[]
    valid: string[]
    withMissingInputs: string[]
    txidOnly: string[]
  } {
    // Hashtable of valid txids (with proof or all inputs chain to proof)
    const validTxids: Record<string, boolean> = {}

    // Hashtable of all transaction txids to transaction
    const txidToTx: Record<string, BeefTx> = {}

    // queue of unsorted transactions ...
    let queue: BeefTx[] = []

    // sorted transactions: hasProof to with longest dependency chain
    const result: BeefTx[] = []

    const txidOnly: BeefTx[] = []

    for (const tx of this.txs) {
      txidToTx[tx.txid] = tx
      tx.isValid = tx.hasProof
      if (tx.isValid) {
        validTxids[tx.txid] = true
        result.push(tx)
      } else if (tx.isTxidOnly && tx.inputTxids.length === 0) {
        validTxids[tx.txid] = true
        txidOnly.push(tx)
      } else {
        queue.push(tx)
      }
    }

    // Hashtable of unknown input txids used to fund transactions without their own proof.
    const missingInputs: Record<string, boolean> = {}
    // transactions with one or more missing inputs
    const txsMissingInputs: BeefTx[] = []

    const possiblyMissingInputs = queue
    queue = []

    // all tx are isValid false, hasProof false.
    // if isTxidOnly then has inputTxids
    for (const tx of possiblyMissingInputs) {
      let hasMissingInput = false

      // For all the unproven transactions,
      // link their inputs that exist in this beef,
      // make a note of missing inputs.
      for (const inputTxid of tx.inputTxids) {
        if (!isO(txidToTx[inputTxid])) {
          missingInputs[inputTxid] = true
          hasMissingInput = true
        }
      }
      if (hasMissingInput) {
        txsMissingInputs.push(tx)
      } else {
        queue.push(tx)
      }
    }

    // As long as we have unsorted transactions...
    while (queue.length > 0) {
      const oldQueue = queue
      queue = []
      // all tx are isValid false, hasProof false.
      // if isTxidOnly then has inputTxids
      for (const tx of oldQueue) {
        if (tx.inputTxids.every((txid) => validTxids[txid])) {
          validTxids[tx.txid] = true
          result.push(tx)
        } else {
          queue.push(tx)
        }
      }
      if (oldQueue.length === queue.length) {
        break
      }
    }

    // transactions that don't have proofs and don't chain to proofs
    const txsNotValid = queue

    // New order of txs is unsortable (missing inputs or depends on missing inputs), txidOnly, sorted (so newest sorted is last)
    this.txs = txsMissingInputs
      .concat(txsNotValid)
      .concat(txidOnly)
      .concat(result)

    return {
      missingInputs: Object.keys(missingInputs),
      notValid: txsNotValid.map((tx) => tx.txid),
      valid: Object.keys(validTxids),
      withMissingInputs: txsMissingInputs.map((tx) => tx.txid),
      txidOnly: txidOnly.map((tx) => tx.txid)
    }
  }

  /**
   * @returns a shallow copy of this beef
   */
  clone (): Beef {
    const c = new Beef()
    c.bumps = Array.from(this.bumps)
    c.txs = Array.from(this.txs)
    return c
  }

  /**
   * Ensure that all the txids in `knownTxids` are txidOnly
   * @param knownTxids
   */
  trimKnownTxids (knownTxids: string[]): void {
    for (let i = 0; i < this.txs.length;) {
      const tx = this.txs[i]
      if (tx.isTxidOnly && knownTxids.includes(tx.txid)) {
        this.txs.splice(i, 1)
      } else {
        i++
      }
    }
    // TODO: bumps could be trimmed to eliminate unreferenced proofs.
  }

  /**
   * @returns array of transaction txids that either have a proof or whose inputs chain back to a proven transaction.
   */
  getValidTxids (): string[] {
    const r = this.sortTxs()
    return r.valid
  }

  /**
   * @returns Summary of `Beef` contents as multi-line string.
   */
  toLogString (): string {
    let log = ''
    log += `BEEF with ${this.bumps.length} BUMPS and ${this.txs.length} Transactions, isValid ${this.isValid().toString()}\n`
    let i = -1
    for (const b of this.bumps) {
      i++
      log += `  BUMP ${i}\n    block: ${b.blockHeight}\n    txids: [\n${b.path[0]
        .filter((n) => !!isTB(n.txid))
        .map((n) => `      '${n.hash === undefined ? 'invalid BUMP' : n.hash}'`)
        .join(',\n')}\n    ]\n`
    }
    i = -1
    for (const t of this.txs) {
      i++
      log += `  TX ${i}\n    txid: ${t.txid}\n`
      if (t.bumpIndex !== undefined) {
        log += `    bumpIndex: ${t.bumpIndex}\n`
      }
      if (t.isTxidOnly) {
        log += '    txidOnly\n'
      } else {
        log += `    rawTx length=${t.rawTx.length}\n`
      }
      if (t.inputTxids.length > 0) {
        log += `    inputs: [\n${t.inputTxids.map((it) => `      '${it}'`).join(',\n')}\n    ]\n`
      }
    }
    return log
  }

  /**
   * In some circumstances it may be helpful for the BUMP MerkePaths to include
   * leaves that can be computed from row zero.
   */
  addComputedLeaves (): void {
    const hash = (m: string): string =>
      toHex(hash256(toArray(m, 'hex').reverse()).reverse())

    for (const bump of this.bumps) {
      for (let row = 1; row < bump.path.length; row++) {
        for (const leafL of bump.path[row - 1]) {
          if (isS(leafL.hash) && (leafL.offset & 1) === 0) {
            const leafR = bump.path[row - 1].find(
              (l) => l.offset === leafL.offset + 1
            )
            const offsetOnRow = leafL.offset >> 1
            if (
              isS(leafR?.hash) &&
              bump.path[row].findIndex((l) => l.offset === offsetOnRow) === -1
            ) {
              // computable leaf is missing... add it.
              if (leafR.hash === undefined || leafL.hash === undefined) { throw new Error('internal logic error') }
              bump.path[row].push({
                offset: offsetOnRow,
                // string concatenation puts the right leaf on the left of the left leaf hash :-)
                hash: hash(leafR.hash + leafL.hash)
              })
            }
          }
        }
      }
    }
  }
}

function isO<T> (o?: T): boolean {
  return o !== undefined && o !== null && typeof o === 'object'
}

function isA<T> (o?: T[]): boolean {
  return o !== undefined && o !== null && Array.isArray(o)
}

function isS (o?: string): boolean {
  return o !== undefined && o !== null && typeof o === 'string'
}

function isTB (b?: boolean): boolean {
  return typeof b === 'boolean' && b
}
