import Signature from './Signature.js'
import BigNumber from './BigNumber.js'
import * as Hash from './Hash.js'
import { toArray, Writer } from './utils.js'
import Script from '../script/Script.js'
import TransactionInput from '../transaction/TransactionInput.js'
import TransactionOutput from '../transaction/TransactionOutput.js'

export default class TransactionSignature extends Signature {
  public static readonly SIGHASH_ALL = 0x00000001
  public static readonly SIGHASH_NONE = 0x00000002
  public static readonly SIGHASH_SINGLE = 0x00000003
  public static readonly SIGHASH_CHRONICLE = 0x00000020
  public static readonly SIGHASH_FORKID = 0x00000040
  public static readonly SIGHASH_ANYONECANPAY = 0x00000080

  scope: number

  /**
   * Implements the original bitcoin transaction signature digest preimage algorithm (OTDA).
   * @param params
   * @returns preimage as a byte array
   */
  static formatOTDA (params: {
    sourceTXID: string
    sourceOutputIndex: number
    sourceSatoshis: number
    transactionVersion: number
    otherInputs: TransactionInput[]
    outputs: TransactionOutput[]
    inputIndex: number
    subscript: Script
    inputSequence: number
    lockTime: number
    scope: number
  }): number[] {
    const isAnyoneCanPay = (params.scope & TransactionSignature.SIGHASH_ANYONECANPAY) !== TransactionSignature.SIGHASH_ANYONECANPAY
    const isSingle = (params.scope & 3) === TransactionSignature.SIGHASH_SINGLE
    const isNone = (params.scope & 3) === TransactionSignature.SIGHASH_NONE
    const isAll = (params.scope & 3) === TransactionSignature.SIGHASH_ALL

    const currentInput = {
      sourceTXID: params.sourceTXID,
      sourceOutputIndex: params.sourceOutputIndex,
      sequence: params.inputSequence,
      script: params.subscript.toBinary()
    }

    const writer = new Writer()

    function writeInputs (inputs: Array<{ sourceTXID: string, sourceOutputIndex: number, sequence: number, script: number[] }>): void {
      writer.writeVarIntNum(inputs.length)
      for (const input of inputs) {
        writer.writeReverse(toArray(input.sourceTXID, 'hex'))
        writer.writeUInt32LE(input.sourceOutputIndex)
        writer.writeVarIntNum(input.script.length)
        writer.write(input.script)
        writer.writeUInt32LE(input.sequence)
      }
    }

    function writeOutputs (outputs: Array<{ satoshis: number, script: number[] }>): void {
      writer.writeVarIntNum(outputs.length)
      for (const output of outputs) {
        writer.writeUInt64LE(output.satoshis)
        writer.writeVarIntNum(output.script.length)
        writer.write(output.script)
      }
    }

    // Version
    writer.writeInt32LE(params.transactionVersion)

    const emptyScript = new Script().toBinary()

    if (!isAnyoneCanPay) {
      const inputs = params.otherInputs.map(input => ({
        sourceTXID: input.sourceTXID ?? input.sourceTransaction?.id('hex') ?? '',
        sourceOutputIndex: input.sourceOutputIndex,
        sequence: (isSingle || isNone) ? 0 : (input.sequence ?? 0xffffffff), // Default to max sequence number
        script: emptyScript
      }))
      inputs.splice(params.inputIndex, 0, currentInput)
      writeInputs(inputs)
    } else if (isAnyoneCanPay) {
      writeInputs([currentInput])
    }

    if (isAll) {
      const outputs = params.outputs.map(output => ({
        satoshis: output.satoshis ?? 0, // Default to 0 if undefined
        script: output.lockingScript.toBinary()
      }))
      writeOutputs(outputs)
    } else if (isSingle) {
      const outputs: Array<{ satoshis: number, script: number[] }> = []
      for (let i = 0; i < params.inputIndex; i++) outputs.push({ satoshis: 0, script: emptyScript })
      const o = params.outputs[params.inputIndex]
      if (o !== undefined) { outputs.push({ satoshis: o.satoshis ?? 0, script: o.lockingScript.toBinary() }) }
      writeOutputs(outputs)
    } else if (isNone) {
      writeOutputs([])
    }

    // Locktime
    writer.writeUInt32LE(params.lockTime)

    // sighashType
    writer.writeUInt32LE(params.scope >>> 0)

    const buf = writer.toArray()
    // const preimage = toHex(buf)
    // const sighash = toHex(Hash.hash256(buf))
    return buf
  }

  static formatBip143 (params: {
    sourceTXID: string
    sourceOutputIndex: number
    sourceSatoshis: number
    transactionVersion: number
    otherInputs: TransactionInput[]
    outputs: TransactionOutput[]
    inputIndex: number
    subscript: Script
    inputSequence: number
    lockTime: number
    scope: number
  }): number[] {
    const currentInput = {
      sourceTXID: params.sourceTXID,
      sourceOutputIndex: params.sourceOutputIndex,
      sequence: params.inputSequence
    }
    const inputs = [...params.otherInputs]
    inputs.splice(params.inputIndex, 0, currentInput)

    const getPrevoutHash = (): number[] => {
      const writer = new Writer()

      for (const input of inputs) {
        if (typeof input.sourceTXID === 'undefined') {
          if (input.sourceTransaction == null) {
            throw new Error('Missing sourceTransaction for input')
          }
          writer.write(input.sourceTransaction.hash() as number[])
        } else {
          writer.writeReverse(toArray(input.sourceTXID, 'hex'))
        }
        writer.writeUInt32LE(input.sourceOutputIndex)
      }

      const buf = writer.toArray()
      const ret = Hash.hash256(buf)
      return ret
    }

    const getSequenceHash = (): number[] => {
      const writer = new Writer()

      for (const input of inputs) {
        const sequence = input.sequence ?? 0xffffffff // Default to max sequence number
        writer.writeUInt32LE(sequence)
      }

      const buf = writer.toArray()
      const ret = Hash.hash256(buf)
      return ret
    }

    function getOutputsHash (outputIndex?: number): number[] {
      const writer = new Writer()

      if (typeof outputIndex === 'undefined') {
        for (const output of params.outputs) {
          const satoshis = output.satoshis ?? 0 // Default to 0 if undefined
          writer.writeUInt64LE(satoshis)

          const script = output.lockingScript?.toBinary() ?? []
          writer.writeVarIntNum(script.length)
          writer.write(script)
        }
      } else {
        const output = params.outputs[outputIndex]

        if (output === undefined) { // ✅ Explicitly check for undefined
          throw new Error(`Output at index ${outputIndex} does not exist`)
        }

        const satoshis = output.satoshis ?? 0 // Default to 0 if undefined
        writer.writeUInt64LE(satoshis)

        const script = output.lockingScript?.toBinary() ?? []
        writer.writeVarIntNum(script.length)
        writer.write(script)
      }

      const buf = writer.toArray()
      const ret = Hash.hash256(buf)
      return ret
    }

    let hashPrevouts = new Array(32).fill(0)
    let hashSequence = new Array(32).fill(0)
    let hashOutputs = new Array(32).fill(0)

    if ((params.scope & TransactionSignature.SIGHASH_ANYONECANPAY) === 0) {
      hashPrevouts = getPrevoutHash()
    }

    if (
      (params.scope & TransactionSignature.SIGHASH_ANYONECANPAY) === 0 &&
      (params.scope & 31) !== TransactionSignature.SIGHASH_SINGLE &&
      (params.scope & 31) !== TransactionSignature.SIGHASH_NONE
    ) {
      hashSequence = getSequenceHash()
    }

    if (
      (params.scope & 31) !== TransactionSignature.SIGHASH_SINGLE &&
      (params.scope & 31) !== TransactionSignature.SIGHASH_NONE
    ) {
      hashOutputs = getOutputsHash()
    } else if (
      (params.scope & 31) === TransactionSignature.SIGHASH_SINGLE &&
      params.inputIndex < params.outputs.length
    ) {
      hashOutputs = getOutputsHash(params.inputIndex)
    }

    const writer = new Writer()

    // Version
    writer.writeInt32LE(params.transactionVersion)

    // Input prevouts/nSequence (none/all, depending on flags)
    writer.write(hashPrevouts)
    writer.write(hashSequence)

    //  outpoint (32-byte hash + 4-byte little endian)
    writer.writeReverse(toArray(params.sourceTXID, 'hex'))
    writer.writeUInt32LE(params.sourceOutputIndex)

    // scriptCode of the input (serialized as scripts inside CTxOuts)
    const subscriptBin = params.subscript.toBinary()
    writer.writeVarIntNum(subscriptBin.length)
    writer.write(subscriptBin)

    // value of the output spent by this input (8-byte little endian)
    writer.writeUInt64LE(params.sourceSatoshis)

    // nSequence of the input (4-byte little endian)
    const sequenceNumber = currentInput.sequence
    writer.writeUInt32LE(sequenceNumber)

    // Outputs (none/one/all, depending on flags)
    writer.write(hashOutputs)

    // Locktime
    writer.writeUInt32LE(params.lockTime)

    // sighashType
    writer.writeUInt32LE(params.scope >>> 0)

    const buf = writer.toArray()
    // const preimage = toHex(buf)
    // const sighash = toHex(Hash.hash256(buf))
    return buf
  }

  static format (params: {
    sourceTXID: string
    sourceOutputIndex: number
    sourceSatoshis: number
    transactionVersion: number
    otherInputs: TransactionInput[]
    outputs: TransactionOutput[]
    inputIndex: number
    subscript: Script
    inputSequence: number
    lockTime: number
    scope: number
  }): number[] {
    const hasForkId = (params.scope & TransactionSignature.SIGHASH_FORKID) !== 0
    const hasChronicle = (params.scope & TransactionSignature.SIGHASH_CHRONICLE) !== 0

    if (hasForkId) {
      return TransactionSignature.formatBip143(params)
    }

    if (!hasForkId || hasChronicle) {
      return TransactionSignature.formatOTDA(params)
    }

    return []
  }

  // The format used in a tx
  static fromChecksigFormat (buf: number[]): TransactionSignature {
    if (buf.length === 0) {
      // allow setting a "blank" signature
      const r = new BigNumber(1)
      const s = new BigNumber(1)
      const scope = 1
      return new TransactionSignature(r, s, scope)
    }
    const scope = buf[buf.length - 1]
    const derbuf = buf.slice(0, buf.length - 1)
    const tempSig = Signature.fromDER(derbuf)
    return new TransactionSignature(tempSig.r, tempSig.s, scope)
  }

  constructor (r: BigNumber, s: BigNumber, scope: number) {
    super(r, s)
    this.scope = scope
  }

  /**
   * Compares to bitcoind's IsLowDERSignature
   * See also Ecdsa signature algorithm which enforces this.
   * See also Bip 62, "low S values in signatures"
   */
  public hasLowS (): boolean {
    if (
      this.s.ltn(1) ||
      this.s.gt(
        new BigNumber(
          '7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0',
          'hex'
        )
      )
    ) {
      return false
    }
    return true
  }

  toChecksigFormat (): number[] {
    const derbuf = this.toDER() as number[]
    return [...derbuf, this.scope]
  }
}
