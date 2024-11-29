import { hash256 } from '../primitives/Hash.js'
import { Reader, Writer, toHex, toArray } from '../primitives/utils.js'
import Transaction from './Transaction.js'
import { BEEF_MAGIC, BEEF_MAGIC_TXID_ONLY_EXTENSION } from './Beef.js'

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
  /**
   * true if `hasProof` or all inputs chain to `hasProof`.
   *
   * Typically set by sorting transactions by proven dependency chains.
   */
  isValid?: boolean = undefined

  get bumpIndex (): number | undefined { return this._bumpIndex }

  set bumpIndex (v: number | undefined) {
    this._bumpIndex = v
    this.updateInputTxids()
  }

  get hasProof (): boolean {
    return this._bumpIndex !== undefined
  }

  get isTxidOnly (): boolean {
    return !!this._txid && !this._rawTx && !this._tx
  }

  get txid () {
    if (this._txid) return this._txid
    if (this._tx) return this._txid = this._tx.id('hex')
    if (this._rawTx) return this._txid = toHex(hash256(this._rawTx))
    throw new Error('Internal')
  }

  get tx () {
    if (this._tx) return this._tx
    if (this._rawTx) return this._tx = Transaction.fromBinary(this._rawTx)
    return undefined
  }

  get rawTx () {
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
        this._tx = tx
      }
    }
    this.bumpIndex = bumpIndex
    this.updateInputTxids()
  }

  private updateInputTxids () {
    if (this.hasProof || !this.tx)
    // If we have a proof, or don't have a parsed transaction
    { this.inputTxids = [] } else {
      const inputTxids = {}
      for (const input of this.tx.inputs) { inputTxids[input.sourceTXID] = true }
      this.inputTxids = Object.keys(inputTxids)
    }
  }

  toWriter (writer: Writer, magic: number): void {
    if (magic === BEEF_MAGIC) {
      // V1
      if (this.isTxidOnly) {
        // Encode just the txid of a known transaction using the txid
        writer.writeUInt32LE(BEEF_MAGIC_TXID_ONLY_EXTENSION)
        writer.writeReverse(toArray(this._txid, 'hex'))
      } else if (this._rawTx) { writer.write(this._rawTx) } else if (this._tx) { writer.write(this._tx.toBinary()) } else { throw new Error('a valid serialized Transaction is expected') }
      if (this.bumpIndex === undefined) {
        writer.writeUInt8(0)
      } else {
        writer.writeUInt8(1)
        writer.writeVarIntNum(this.bumpIndex)
      }
    } else {
      // V2
      if (this.isTxidOnly) {
        // Encode just the txid of a known transaction using the txid
        writer.writeUInt8(2)
        writer.writeReverse(toArray(this._txid, 'hex'))
      } else {
        if (this.bumpIndex === undefined) {
          writer.writeUInt8(0)
        } else {
          writer.writeUInt8(1)
          writer.writeVarIntNum(this.bumpIndex)
        }
        if (this._rawTx) { writer.write(this._rawTx) } else if (this._tx) { writer.write(this._tx.toBinary()) } else { throw new Error('a valid serialized Transaction is expected') }
      }
    }
  }

  static fromReader (br: Reader, magic: number): BeefTx {
    let tx: Transaction | number[] | string | undefined
    let bumpIndex: number | undefined

    if (magic === BEEF_MAGIC) {
      // V1
      const version = br.readUInt32LE()
      if (version === BEEF_MAGIC_TXID_ONLY_EXTENSION) {
        // This is the extension to support known transactions
        tx = toHex(br.readReverse(32))
      } else {
        br.pos -= 4 // Unread the version...
        tx = Transaction.fromReader(br)
      }
      bumpIndex = br.readUInt8() ? br.readVarIntNum() : undefined
    } else {
      // V2
      const format = br.readUInt8()
      if (format === 2) {
        // txid only
        tx = toHex(br.readReverse(32))
      } else {
        if (format === 1) { bumpIndex = br.readVarIntNum() }
        tx = Transaction.fromReader(br)
      }
    }

    const beefTx = new BeefTx(tx, bumpIndex)
    return beefTx
  }
}
