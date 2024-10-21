import { Reader, Writer, toHex, toArray } from "../primitives/utils.js"
import Transaction from "../transaction/Transaction.js"
import { asString, doubleSha256BE } from "./helpers.js"
import { BEEF_MAGIC_TXID_ONLY_EXTENSION } from "./Beef.js"

/**
 * A single bitcoin transaction associated with a `Beef` validity proof set.
 * 
 * Simple case is transaction data included directly, either as raw bytes or fully parsed data, or both.
 * 
 * Supports 'known' transactions which are represented by just their txid.
 * It is assumed that intended consumer of this beef already has validity proof for such a transaction,
 * which they can merge if necessary to create a valid beef.
 */
export default class BeefTx {
    _bumpIndex?: number
    _tx?: Transaction
    _rawTx?: number[]
    _txid?: string
    inputTxids: string[] = []
    degree: number = 0

    get bumpIndex() : number | undefined { return this._bumpIndex}

    set bumpIndex(v: number | undefined) {
        this._bumpIndex = v
        this.updateInputTxids()
    }

    get hasProof() : boolean {
        return this._bumpIndex !== undefined
    }

    get isTxidOnly() : boolean {
        return !!this._txid && !this._rawTx && !this._tx
    }

    get txid() {
        if (this._txid) return this._txid
        if (this._tx) return this._txid = this._tx.id('hex')
        if (this._rawTx) return this._txid = asString(doubleSha256BE(Buffer.from(this._rawTx)))
        throw new Error('Internal')
    }

    get tx() {
        if (this._tx) return this._tx
        if (this._rawTx) return this._tx = Transaction.fromBinary(this._rawTx)
        return undefined
    }

    get rawTx() {
        if (this._rawTx) return this._rawTx
        if (this._tx) return this._rawTx = this._tx.toBinary()
        return undefined
    }

    /**
     * @param tx If string, must be a valid txid. If `number[]` must be a valid serialized transaction.
     * @param bumpIndex If transaction already has a proof in the beef to which it will be added.
     */
    constructor (tx: Transaction | number[] | string, bumpIndex?: number) {
        if (typeof tx === 'string') {
            this._txid = tx
        } else {
            if (Array.isArray(tx)) {
                this._rawTx = tx
            } else {
                this._tx = <Transaction>tx
            }
        }
        this.bumpIndex = bumpIndex
        this.updateInputTxids()
    }

    private updateInputTxids() {
        if (this.hasProof || !this.tx)
            // If we have a proof, or don't have a parsed transaction
            this.inputTxids = []
        else {
            const inputTxids = {};
            for (const input of this.tx.inputs)
                inputTxids[input.sourceTXID!] = true;
            this.inputTxids = Object.keys(inputTxids);
        }
    }

    toWriter(writer: Writer) : void {
        if (this.isTxidOnly) {
            // Encode just the txid of a known transaction using the txid
            writer.writeUInt32LE(BEEF_MAGIC_TXID_ONLY_EXTENSION)
            writer.writeReverse(toArray(this._txid, 'hex'))
        } else if (this._rawTx)
            writer.write(this._rawTx)
        else if (this._tx)
            writer.write(this._tx.toBinary())
        else
            throw new Error('a valid serialized Transaction is expected')
        if (this.bumpIndex === undefined) {
            writer.writeUInt8(0)
        } else {
            writer.writeUInt8(1)
            writer.writeVarIntNum(this.bumpIndex)
        }
    }

    static fromReader (br: Reader): BeefTx {
        let tx: Transaction | number[] | string | undefined = undefined
        const version = br.readUInt32LE()
        if (version === BEEF_MAGIC_TXID_ONLY_EXTENSION) {
            // This is the extension to support known transactions
            tx = toHex(br.readReverse(32))
        } else {
            br.pos -= 4 // Unread the version...
            tx = Transaction.fromReader(br)
        }
        const bumpIndex = br.readUInt8() ? br.readVarIntNum() : undefined
        const beefTx = new BeefTx(tx, bumpIndex)
        return beefTx
    }

}