import { hash256 } from '../primitives/Hash.js'
import { Reader, Writer, toHex, toArray } from '../primitives/utils.js'
import Transaction from './Transaction.js'
import { BEEF_V2, TX_DATA_FORMAT } from './Beef.js'

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
    if (this._tx) {
      this._txid = this._tx.id('hex')
      return this._txid
    }
    if (this._rawTx) {
      this._txid = toHex(hash256(this._rawTx))
      return this._txid
    }
    throw new Error('Internal')
  }

  get tx () {
    if (this._tx) return this._tx
    if (this._rawTx) {
      this._tx = Transaction.fromBinary(this._rawTx)
      return this._tx
    }
    return undefined
  }

  get rawTx () {
    if (this._rawTx) return this._rawTx
    if (this._tx) {
      this._rawTx = this._tx.toBinary()
      return this._rawTx
    }
    return undefined
  }

  /**
     * @param tx If string, must be a valid txid. If `number[]` must be a valid serialized transaction.
     * @param bumpIndex If transaction already has a proof in the beef to which it will be added.
     */
  constructor (tx: Transaction | number[] | string, bumpIndex?: number) {
    if (typeof tx === 'string') {
      this._txid = tx
    } else if (Array.isArray(tx)) {
      this._rawTx = tx
    } else {
      this._tx = tx
    }
    this.bumpIndex = bumpIndex
    this.updateInputTxids()
  }

  static fromTx (tx: Transaction, bumpIndex?: number): BeefTx {
    return new BeefTx(tx, bumpIndex)
  }

  static fromRawTx (rawTx: number[], bumpIndex?: number): BeefTx {
    return new BeefTx(rawTx, bumpIndex)
  }

  static fromTxid (txid: string, bumpIndex?: number): BeefTx {
    return new BeefTx(txid, bumpIndex)
  }

  private updateInputTxids () {
    if (this.hasProof || !this.tx) {
      // If we have a proof, or don't have a parsed transaction
      this.inputTxids = []
    } else {
      const inputTxids = {}
      for (const input of this.tx.inputs) { inputTxids[input.sourceTXID] = true }
      this.inputTxids = Object.keys(inputTxids)
    }
  }

  toWriter (writer: Writer, version: number): void {
    const writeByte = (bb: number) => {
      writer.writeUInt8(bb)
    }

    const writeTxid = () => {
      writer.writeReverse(toArray(this._txid, 'hex'))
    }

    const writeTx = () => {
      if (this._rawTx) {
        writer.write(this._rawTx)
      } else if (this._tx) {
        writer.write(this._tx.toBinary())
      } else {
        throw new Error('a valid serialized Transaction is expected')
      }
    }

    const writeBumpIndex = () => {
      if (this.bumpIndex === undefined) {
        writeByte(TX_DATA_FORMAT.RAWTX) // 0
      } else {
        writeByte(TX_DATA_FORMAT.RAWTX_AND_BUMP_INDEX) // 1
        writer.writeVarIntNum(this.bumpIndex) // the index of the associated bump
      }
    }

    if (version === BEEF_V2) {
      if (this.isTxidOnly) {
        writeByte(TX_DATA_FORMAT.TXID_ONLY)
        writeTxid()
      } else if (this.bumpIndex !== undefined) {
        writeByte(TX_DATA_FORMAT.RAWTX_AND_BUMP_INDEX)
        writer.writeVarIntNum(this.bumpIndex)
        writeTx()
      } else {
        writeByte(TX_DATA_FORMAT.RAWTX)
        writeTx()
      }
    } else {
      writeTx()
      writeBumpIndex()
    }
  }

  static fromReader (br: Reader, version: number): BeefTx {
    let data: Transaction | number[] | string | undefined
    let bumpIndex: number | undefined
    let beefTx: BeefTx | undefined
    if (version === BEEF_V2) {
      // V2
      const format = br.readUInt8()
      if (format === TX_DATA_FORMAT.TXID_ONLY) {
        beefTx = BeefTx.fromTxid(toHex(br.readReverse(32)))
      } else {
        if (format === TX_DATA_FORMAT.RAWTX_AND_BUMP_INDEX) {
          bumpIndex = br.readVarIntNum()
        }
        data = Transaction.fromReader(br)
        beefTx = BeefTx.fromTx(data, bumpIndex)
      }
    } else {
      // V1
      data = Transaction.fromReader(br)
      bumpIndex = br.readUInt8() ? br.readVarIntNum() : undefined
      beefTx = BeefTx.fromTx(data, bumpIndex)
    }

    return beefTx
  }
}
