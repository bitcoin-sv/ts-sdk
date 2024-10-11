import MerklePath from "./MerklePath.js";
import Transaction from "./Transaction.js";
import ChainTracker from "./ChainTracker.js";
import BeefTx from "./BeefTx.js";
import { Reader, Writer, toHex, toArray } from "../primitives/utils.js"

export const BEEF_MAGIC = 4022206465    // 0100BEEF in LE order
export const BEEF_MAGIC_V2 = 4022206466 // 0200BEEF in LE order
export const BEEF_MAGIC_TXID_ONLY_EXTENSION = 4022206465 // 0100BEEF in LE order

export type BeefVersion = undefined | 'V1' | 'V2'

/*
 * BEEF standard: BRC-62: Background Evaluation Extended Format (BEEF) Transactions
 * https://github.com/bitcoin-sv/BRCs/blob/master/transactions/0062.md
 * 
 * BUMP standard: BRC-74: BSV Unified Merkle Path (BUMP) Format
 * https://github.com/bitcoin-sv/BRCs/blob/master/transactions/0074.md
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
 */
export class Beef {
    bumps: MerklePath[] = []
    txs: BeefTx[] = []
    version: BeefVersion = undefined

    constructor(version?: BeefVersion) {
        this.version = version
    }

    /**
     * BEEF_MAGIC is the original V1 version.
     * BEEF_MAGIC_V2 includes support for txidOnly transactions in serialized beefs.
     * @returns version magic value based on current contents and constructor version parameter.
     */
    get magic(): number {
        if (this.version === 'V1')
            return BEEF_MAGIC

        if (this.version === 'V2')
            return BEEF_MAGIC_V2

        const hasTxidOnly = -1 < this.txs.findIndex(tx => tx.isTxidOnly)
        if (hasTxidOnly)
            return BEEF_MAGIC_V2

        return BEEF_MAGIC
    }

    /**
     * @param txid of `beefTx` to find
     * @returns `BeefTx` in `txs` with `txid`.
     */
    findTxid(txid: string): BeefTx | undefined {
        return this.txs.find(tx => tx.txid === txid)
    }

    /**
     * Merge a MerklePath that is assumed to be fully valid.
     * @param bump 
     * @returns index of merged bump
     */
    mergeBump(bump: MerklePath): number {
        let bumpIndex: number | undefined = undefined
        // If this proof is identical to another one previously added, we use that first. Otherwise, we try to merge it with proofs from the same block.
        for (let i = 0; i < this.bumps.length; i++) {
            const b = this.bumps[i]
            if (b === bump) { // Literally the same
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
            if (!tx.bumpIndex) {
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
    mergeRawTx(rawTx: number[], bumpIndex?: number): BeefTx {
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
    mergeTransaction(tx: Transaction): BeefTx {
        const txid = tx.id('hex')
        this.removeExistingTxid(txid)
        let bumpIndex: number | undefined = undefined
        if (tx.merklePath)
            bumpIndex = this.mergeBump(tx.merklePath)
        const newTx = new BeefTx(tx, bumpIndex)
        this.txs.push(newTx)
        this.tryToValidateBumpIndex(newTx)
        bumpIndex = newTx.bumpIndex
        if (bumpIndex === undefined) {
            for (const input of tx.inputs) {
                if (input.sourceTransaction)
                    this.mergeTransaction(input.sourceTransaction)
            }
        }
        return newTx
    }

    /**
     * Removes an existing transaction from the BEEF, given its TXID
     * @param txid TXID of the transaction to remove
     */
    removeExistingTxid(txid: string) {
        const existingTxIndex = this.txs.findIndex(t => t.txid === txid)
        if (existingTxIndex >= 0)
            this.txs.splice(existingTxIndex, 1)
    }

    mergeTxidOnly(txid: string): BeefTx {
        if (this.version === 'V1')
            throw new Error(`BEEF V1 format does not support txid only transactions.`)

        let tx = this.txs.find(t => t.txid === txid)
        if (!tx) {
            tx = new BeefTx(txid)
            this.txs.push(tx)
            this.tryToValidateBumpIndex(tx)
        }
        return tx
    }

    mergeBeefTx(btx: BeefTx): BeefTx {
        let beefTx = this.findTxid(btx.txid)
        if (!beefTx && btx.isTxidOnly)
            beefTx = this.mergeTxidOnly(btx.txid)
        else if (!beefTx || beefTx.isTxidOnly) {
            if (btx._tx)
                beefTx = this.mergeTransaction(btx._tx)
            else
                beefTx = this.mergeRawTx(btx._rawTx!)
        }
        return beefTx
    }

    mergeBeef(beef: number[] | Beef) {
        const b: Beef = Array.isArray(beef) ? Beef.fromBinary(beef) : beef

        for (const bump of b.bumps)
            this.mergeBump(bump)

        for (const tx of b.txs)
            this.mergeBeefTx(tx)
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
    isValid(allowTxidOnly?: boolean): boolean {
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
    async verify(chainTracker: ChainTracker, allowTxidOnly?: boolean): Promise<boolean> {
        const r = this.verifyValid(allowTxidOnly)
        if (!r.valid) return false

        for (const height of Object.keys(r.roots)) {
            const isValid = await chainTracker.isValidRootForHeight(r.roots[height], Number(height))
            if (!isValid)
                return false
        }

        return true
    }

    private verifyValid(allowTxidOnly?: boolean)
        : { valid: boolean, roots: Record<number, string> } {

        const r: { valid: boolean, roots: Record<number, string> } = { valid: false, roots: {} }

        this.sortTxs()

        // valid txids: only txids if allowed, bump txids, then txids with input's in txids
        const txids: Record<string, boolean> = {}

        for (const tx of this.txs) {
            if (tx.isTxidOnly) {
                if (!allowTxidOnly) return r
                txids[tx.txid] = true
            }
        }

        const confirmComputedRoot = (b: MerklePath, txid: string): boolean => {
            const root = b.computeRoot(txid)
            if (!r.roots[b.blockHeight]) {
                // accept the root as valid for this block and reuse for subsequent txids
                r.roots[b.blockHeight] = root
            }
            if (r.roots[b.blockHeight] !== root)
                return false
            return true
        }

        for (const b of this.bumps) {
            for (const n of b.path[0]) {
                if (n.txid && n.hash) {
                    txids[n.hash] = true
                    // all txid hashes in all bumps must have agree on computed merkle path roots
                    if (!confirmComputedRoot(b, n.hash))
                        return r
                }
            }
        }

        for (const t of this.txs) {
            for (const i of t.inputTxids)
                // all input txids must be included before they are referenced
                if (!txids[i]) return r
            txids[t.txid] = true
        }

        r.valid = true
        return r
    }

    /**
     * Returns a binary array representing the serialized BEEF
     * @returns A binary array representing the BEEF
     */
    toBinary(): number[] {

        const writer = new Writer()
        writer.writeUInt32LE(this.magic)

        writer.writeVarIntNum(this.bumps.length)
        for (const b of this.bumps) {
            writer.write(b.toBinary())
        }

        writer.writeVarIntNum(this.txs.length)
        for (const tx of this.txs) {
            tx.toWriter(writer, this.magic)
        }

        return writer.toArray()
    }

    /**
     * Returns a hex string representing the serialized BEEF
     * @returns A hex string representing the BEEF
     */
    toHex(): string {
        return toHex(this.toBinary())
    }

    static fromReader(br: Reader): Beef {
        const version = br.readUInt32LE()
        if (version !== BEEF_MAGIC && version !== BEEF_MAGIC_V2)
            throw new Error(`Serialized BEEF must start with ${BEEF_MAGIC} or ${BEEF_MAGIC_V2} but starts with ${version}`)
        const beef = new Beef(version === BEEF_MAGIC_V2 ? 'V2' : undefined)
        const bumpsLength = br.readVarIntNum()
        for (let i = 0; i < bumpsLength; i++) {
            const bump = MerklePath.fromReader(br)
            beef.bumps.push(bump)
        }
        const txsLength = br.readVarIntNum()
        for (let i = 0; i < txsLength; i++) {
            const beefTx = BeefTx.fromReader(br, version)
            beef.txs.push(beefTx)
        }
        return beef
    }

    /**
     * Constructs an instance of the Beef class based on the provided binary array
     * @param bin The binary array from which to construct BEEF
     * @returns An instance of the Beef class constructed from the binary data
     */
    static fromBinary(bin: number[]): Beef {
        const br = new Reader(bin)
        return Beef.fromReader(br)
    }

    /**
     * Constructs an instance of the Beef class based on the provided string
     * @param s The string value from which to construct BEEF
     * @param enc The encoding of the string value from which BEEF should be constructed
     * @returns An instance of the Beef class constructed from the string
     */
    static fromString(s: string, enc?: 'hex' | 'utf8' | 'base64'): Beef {
        enc ||= 'hex'
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
    private tryToValidateBumpIndex(newTx: BeefTx): boolean {
        if (newTx.bumpIndex !== undefined)
            return true
        const txid = newTx.txid
        for (let i = 0; i < this.bumps.length; i++) {
            const j = this.bumps[i].path[0].findIndex(b => b.hash === txid)
            if (j >= 0) {
                newTx.bumpIndex = i
                this.bumps[i].path[0][j].txid = true
                return true
            }
        }
        return false
    }

    /**
     * Sort the `txs` by input txid dependency order.
     * @returns array of input txids of unproven transactions that aren't included in txs.
     */
    sortTxs(): string[] {
        const missingInputs: Record<string, boolean> = {}

        const txidToTx: Record<string, BeefTx> = {}

        for (const tx of this.txs) {
            txidToTx[tx.txid] = tx
            // All transactions in this beef start at degree zero.
            tx.degree = 0
        }

        for (const tx of this.txs) {
            if (tx.bumpIndex === undefined) {
                // For all the unproven transactions,
                // link their inputs that exist in this beef,
                // make a note of missing inputs.
                for (const inputTxid of tx.inputTxids) {
                    if (!txidToTx[inputTxid])
                        missingInputs[inputTxid] = true
                }
            }
        }

        // queue of transactions that no unsorted transactions depend upon...
        const queue: BeefTx[] = []
        // sorted transactions
        const result: BeefTx[] = []

        // Increment each txid's degree for every input reference to it by another txid
        for (const tx of this.txs) {
            for (const inputTxid of tx.inputTxids) {
                const tx = txidToTx[inputTxid]
                if (tx)
                    tx.degree++
            }
        }
        // Since circular dependencies aren't possible, start with the txids no one depends on.
        // These are the transactions that should be sent last...
        for (const tx of this.txs) {
            if (tx.degree === 0) {
                queue.push(tx)
            }
        }
        // As long as we have transactions to send...
        while (queue.length) {
            let tx = queue.shift()!
            // Add it as new first to send
            result.unshift(tx)
            // And remove its impact on degree
            // noting that any tx achieving a
            // value of zero can be sent...
            for (const inputTxid of tx.inputTxids) {
                const inputTx = txidToTx[inputTxid]
                if (inputTx) {
                    inputTx.degree--
                    if (inputTx.degree === 0) {
                        queue.push(inputTx)
                    }
                }
            }
        }
        this.txs = result

        return Object.keys(missingInputs)
    }

    /**
     * @returns a shallow copy of this beef
     */
    clone(): Beef {
        const c = new Beef()
        c.bumps = Array.from(this.bumps)
        c.txs = Array.from(this.txs)
        return c
    }

    /**
     * Ensure that all the txids in `knownTxids` are txidOnly
     * @param knownTxids 
     */
    trimKnownTxids(knownTxids: string[]) {
        for (let i = 0; i < this.txs.length;) {
            const tx = this.txs[i]
            if (tx.isTxidOnly && -1 < knownTxids.indexOf(tx.txid)) {
                this.txs.splice(i, 1)
            } else {
                i++
            }
        }
        // TODO: bumps could be trimmed to eliminate unreferenced proofs.
    }

    /**
     * @returns Summary of `Beef` contents as multi-line string.
     */
    toLogString(): string {
        let log = ''
        log += `BEEF with ${this.bumps.length} BUMPS and ${this.txs.length} Transactions, isValid ${this.isValid()}\n`
        let i = -1
        for (const b of this.bumps) {
            i++
            log += `  BUMP ${i}\n    block: ${b.blockHeight}\n    txids: [\n${b.path[0].filter(n => !!n.txid).map(n => `      '${n.hash}'`).join(',\n')}\n    ]\n`
        }
        i = -1
        for (const t of this.txs) {
            i++
            log += `  TX ${i}\n    txid: ${t.txid}\n`
            if (t.bumpIndex !== undefined) {
                log += `    bumpIndex: ${t.bumpIndex}\n`
            }
            if (t.isTxidOnly) {
                log += `    txidOnly\n`
            } else {
                log += `    rawTx length=${t.rawTx!.length}\n`
            }
            if (t.inputTxids.length > 0) {
                log += `    inputs: [\n${t.inputTxids.map(it => `      '${it}'`).join(',\n')}\n    ]\n`
            }
        }
        return log
    }
}

export default Beef