import LockingScript from './LockingScript.js'
import UnlockingScript from './UnlockingScript.js'
import Script from './Script.js'
import BigNumber from '../primitives/BigNumber.js'
import OP from './OP.js'
import ScriptChunk from './ScriptChunk.js'
import { toHex, minimallyEncode } from '../primitives/utils.js'
import * as Hash from '../primitives/Hash.js'
import TransactionSignature from '../primitives/TransactionSignature.js'
import PublicKey from '../primitives/PublicKey.js'
import { verify } from '../primitives/ECDSA.js'
import TransactionInput from '../transaction/TransactionInput.js'
import TransactionOutput from '../transaction/TransactionOutput.js'

// These constants control the current behavior of the interpreter.
const maxScriptElementSize = 1024 * 1024 * 1024
const maxMultisigKeyCount = Math.pow(2, 31) - 1
const requireMinimalPush = true
const requirePushOnlyUnlockingScripts = true
const requireLowSSignatures = true
const requireCleanStack = true

// --- Optimization: Pre-computed script numbers ---
const SCRIPTNUM_NEG_1 = Object.freeze(new BigNumber(-1).toScriptNum())
const SCRIPTNUMS_0_TO_16: ReadonlyArray<Readonly<number[]>> = Object.freeze(
  Array.from({ length: 17 }, (_, i) => Object.freeze(new BigNumber(i).toScriptNum()))
)

// --- Helper functions ---

function compareNumberArrays (a: Readonly<number[]>, b: Readonly<number[]>): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

function isMinimallyEncodedHelper (
  buf: Readonly<number[]>,
  maxNumSize: number = Number.MAX_SAFE_INTEGER
): boolean {
  if (buf.length > maxNumSize) {
    return false
  }
  if (buf.length > 0) {
    if ((buf[buf.length - 1] & 0x7f) === 0) {
      if (buf.length <= 1 || (buf[buf.length - 2] & 0x80) === 0) {
        return false
      }
    }
  }
  return true
}

function isChecksigFormatHelper (buf: Readonly<number[]>): boolean {
  // This is a simplified check. The full DER check is more complex and typically
  // done by TransactionSignature.fromChecksigFormat which can throw.
  // This helper is mostly for early bailout or non-throwing checks if needed.
  if (buf.length < 9 || buf.length > 73) return false
  if (buf[0] !== 0x30) return false // DER SEQUENCE
  if (buf[1] !== buf.length - 3) return false // Total length (excluding type and length byte for sequence, and hash type)

  const rMarker = buf[2]
  const rLen = buf[3]
  if (rMarker !== 0x02) return false // DER INTEGER
  if (rLen === 0) return false // R length is zero
  if (5 + rLen >= buf.length) return false // S length misplaced or R too long

  const sMarkerOffset = 4 + rLen
  const sMarker = buf[sMarkerOffset]
  const sLen = buf[sMarkerOffset + 1]
  if (sMarker !== 0x02) return false // DER INTEGER
  if (sLen === 0) return false // S length is zero

  // Check R value negative or excessively padded
  if ((buf[4] & 0x80) !== 0) return false // R value negative
  if (rLen > 1 && buf[4] === 0x00 && (buf[5] & 0x80) === 0) return false // R value excessively padded

  // Check S value negative or excessively padded
  const sValueOffset = sMarkerOffset + 2
  if ((buf[sValueOffset] & 0x80) !== 0) return false // S value negative
  if (sLen > 1 && buf[sValueOffset] === 0x00 && (buf[sValueOffset + 1] & 0x80) === 0) return false // S value excessively padded

  if (rLen + sLen + 7 !== buf.length) return false // Final length check including hash type

  return true
}

function isChunkMinimalPushHelper (chunk: ScriptChunk): boolean {
  const data = chunk.data
  const op = chunk.op
  if (!Array.isArray(data)) return true
  if (data.length === 0) return op === OP.OP_0
  if (data.length === 1 && data[0] >= 1 && data[0] <= 16) return op === OP.OP_1 + (data[0] - 1)
  if (data.length === 1 && data[0] === 0x81) return op === OP.OP_1NEGATE
  if (data.length <= 75) return op === data.length
  if (data.length <= 255) return op === OP.OP_PUSHDATA1
  if (data.length <= 65535) return op === OP.OP_PUSHDATA2
  return true
}

/**
 * The Spend class represents a spend action within a Bitcoin SV transaction.
 * It encapsulates all the necessary data required for spending a UTXO (Unspent Transaction Output)
 * and includes details about the source transaction, output, and the spending transaction itself.
 *
 * @property {string} sourceTXID - The transaction ID of the source UTXO.
 * @property {number} sourceOutputIndex - The index of the output in the source transaction.
 * @property {BigNumber} sourceSatoshis - The amount of satoshis in the source UTXO.
 * @property {LockingScript} lockingScript - The locking script associated with the UTXO.
 * @property {number} transactionVersion - The version of the current transaction.
 * @property {Array<{ sourceTXID: string, sourceOutputIndex: number, sequence: number }>} otherInputs -
 *           An array of other inputs in the transaction, each with a txid, outputIndex, and sequence number.
 * @property {Array<{ satoshis: BigNumber, lockingScript: LockingScript }>} outputs -
 *           An array of outputs of the current transaction, including the satoshi value and locking script for each.
 * @property {number} inputIndex - The index of this input in the current transaction.
 * @property {UnlockingScript} unlockingScript - The unlocking script that unlocks the UTXO for spending.
 * @property {number} inputSequence - The sequence number of this input.
 * @property {number} lockTime - The lock time of the transaction.
 * @property {number} memoryLimit - Control over script interpreter memory usage.
 * @property {boolean} isRelaxed - Optional. If true, disables all the unlocking script maleability restrictions consitent with Chronicle release. Maleability restrictions are neve appliced to locking scripts.
 */
export default class Spend {
  sourceTXID: string
  sourceOutputIndex: number
  sourceSatoshis: number
  lockingScript: LockingScript
  transactionVersion: number
  otherInputs: TransactionInput[]
  outputs: TransactionOutput[]
  inputIndex: number
  unlockingScript: UnlockingScript
  inputSequence: number
  lockTime: number

  context: 'UnlockingScript' | 'LockingScript'
  programCounter: number
  lastCodeSeparator: number | null
  stack: number[][]
  altStack: number[][]
  ifStack: boolean[]
  memoryLimit: number
  stackMem: number
  altStackMem: number

  isRelaxedOverride: boolean

  /**
   * @constructor
   * Constructs the Spend object with necessary transaction details.
   * @param {string} params.sourceTXID - The transaction ID of the source UTXO.
   * @param {number} params.sourceOutputIndex - The index of the output in the source transaction.
   * @param {BigNumber} params.sourceSatoshis - The amount of satoshis in the source UTXO.
   * @param {LockingScript} params.lockingScript - The locking script associated with the UTXO.
   * @param {number} params.transactionVersion - The version of the current transaction.
   * @param {Array<{ sourceTXID: string, sourceOutputIndex: number, sequence: number }>} params.otherInputs -
   *        An array of other inputs in the transaction.
   * @param {Array<{ satoshis: BigNumber, lockingScript: LockingScript }>} params.outputs -
   *        The outputs of the current transaction.
   * @param {number} params.inputIndex - The index of this input in the current transaction.
   * @param {UnlockingScript} params.unlockingScript - The unlocking script for this spend.
   * @param {number} params.inputSequence - The sequence number of this input.
   * @param {number} params.lockTime - The lock time of the transaction.
   * @param {number} params.memoryLimit - Optional control over script interpreter memory usage.
   * @param {boolean} params.isRelaxed - Optional. If true, disables all the unlocking script maleability restrictions consitent with Chronicle release. Maleability restrictions are neve appliced to locking scripts.
   *
   * @example
   * const spend = new Spend({
   *   sourceTXID: "abcd1234", // sourceTXID
   *   sourceOutputIndex: 0, // sourceOutputIndex
   *   sourceSatoshis: new BigNumber(1000), // sourceSatoshis
   *   lockingScript: LockingScript.fromASM("OP_DUP OP_HASH160 abcd1234... OP_EQUALVERIFY OP_CHECKSIG"),
   *   transactionVersion: 1, // transactionVersion
   *   otherInputs: [{ sourceTXID: "abcd1234", sourceOutputIndex: 1, sequence: 0xffffffff }], // otherInputs
   *   outputs: [{ satoshis: new BigNumber(500), lockingScript: LockingScript.fromASM("OP_DUP...") }], // outputs
   *   inputIndex: 0, // inputIndex
   *   unlockingScript: UnlockingScript.fromASM("3045... 02ab..."),
   *   inputSequence: 0xffffffff // inputSequence
   *   memoryLimit: 100000 // memoryLimit
   * });
   */
  constructor (params: {
    sourceTXID: string
    sourceOutputIndex: number
    sourceSatoshis: number
    lockingScript: LockingScript
    transactionVersion: number
    otherInputs: TransactionInput[]
    outputs: TransactionOutput[]
    unlockingScript: UnlockingScript
    inputSequence: number
    inputIndex: number
    lockTime: number
    memoryLimit?: number
    isRelaxed?: boolean
  }) {
    this.sourceTXID = params.sourceTXID
    this.sourceOutputIndex = params.sourceOutputIndex
    this.sourceSatoshis = params.sourceSatoshis
    this.lockingScript = params.lockingScript
    this.transactionVersion = params.transactionVersion
    this.otherInputs = params.otherInputs
    this.outputs = params.outputs
    this.inputIndex = params.inputIndex
    this.unlockingScript = params.unlockingScript
    this.inputSequence = params.inputSequence
    this.lockTime = params.lockTime
    this.memoryLimit = params.memoryLimit ?? 32000000
    this.isRelaxedOverride = params.isRelaxed === true
    this.stack = []
    this.altStack = []
    this.ifStack = []
    this.stackMem = 0
    this.altStackMem = 0
    this.reset()
  }

  private isRelaxed (): boolean {
    if (this.context === 'LockingScript') { return true }

    return this.isRelaxedOverride ||
      // TODO: This remains to be approved by the Chronicle team.
      (this.transactionVersion & 0x8000000) !== 0
  }

  reset (): void {
    this.context = 'UnlockingScript'
    this.programCounter = 0
    this.lastCodeSeparator = null
    this.stack = []
    this.altStack = []
    this.ifStack = []
    this.stackMem = 0
    this.altStackMem = 0
  }

  private ensureStackMem (additional: number): void {
    if (this.stackMem + additional > this.memoryLimit) {
      this.scriptEvaluationError(
        'Stack memory usage has exceeded ' + String(this.memoryLimit) + ' bytes'
      )
    }
  }

  private ensureAltStackMem (additional: number): void {
    if (this.altStackMem + additional > this.memoryLimit) {
      this.scriptEvaluationError(
        'Alt stack memory usage has exceeded ' + String(this.memoryLimit) + ' bytes'
      )
    }
  }

  private pushStack (item: number[]): void {
    this.ensureStackMem(item.length)
    this.stack.push(item)
    this.stackMem += item.length
  }

  private pushStackCopy (item: Readonly<number[]>): void {
    this.ensureStackMem(item.length)
    const copy = item.slice()
    this.stack.push(copy)
    this.stackMem += copy.length
  }

  private popStack (): number[] {
    if (this.stack.length === 0) {
      this.scriptEvaluationError('Attempted to pop from an empty stack.')
    }
    const item = this.stack.pop() as number[]
    this.stackMem -= item.length
    return item
  }

  private stackTop (index: number = -1): number[] {
    // index = -1 for top, -2 for second top, etc.
    // stack.length + index provides 0-based index from start
    if (this.stack.length === 0 || this.stack.length < Math.abs(index) || (index >= 0 && index >= this.stack.length)) {
      this.scriptEvaluationError(`Stack underflow accessing element at index ${index}. Stack length is ${this.stack.length}.`)
    }
    return this.stack[this.stack.length + index]
  }

  private pushAltStack (item: number[]): void {
    this.ensureAltStackMem(item.length)
    this.altStack.push(item)
    this.altStackMem += item.length
  }

  private popAltStack (): number[] {
    if (this.altStack.length === 0) {
      this.scriptEvaluationError('Attempted to pop from an empty alt stack.')
    }
    const item = this.altStack.pop() as number[]
    this.altStackMem -= item.length
    return item
  }

  private checkSignatureEncoding (buf: Readonly<number[]>): boolean {
    if (buf.length === 0) return true

    if (!isChecksigFormatHelper(buf)) {
      this.scriptEvaluationError('The signature format is invalid.') // Generic message like original
      return false
    }
    try {
      const sig = TransactionSignature.fromChecksigFormat(buf as number[]) // This can throw for stricter DER rules
      if (!this.isRelaxed() && requireLowSSignatures && !sig.hasLowS()) {
        this.scriptEvaluationError('The signature must have a low S value.')
        return false
      }
    } catch (e) {
      this.scriptEvaluationError('The signature format is invalid.')
      return false
    }
    return true
  }

  private checkPublicKeyEncoding (buf: Readonly<number[]>): boolean {
    if (buf.length === 0) {
      this.scriptEvaluationError('Public key is empty.')
      return false
    }
    if (buf.length < 33) {
      this.scriptEvaluationError('The public key is too short, it must be at least 33 bytes.')
      return false
    }
    if (buf[0] === 0x04) {
      if (buf.length !== 65) {
        this.scriptEvaluationError('The non-compressed public key must be 65 bytes.')
        return false
      }
    } else if (buf[0] === 0x02 || buf[0] === 0x03) {
      if (buf.length !== 33) {
        this.scriptEvaluationError('The compressed public key must be 33 bytes.')
        return false
      }
    } else {
      this.scriptEvaluationError('The public key is in an unknown format.')
      return false
    }
    try {
      PublicKey.fromDER(buf as number[]) // This can throw for stricter DER rules
    } catch (e) {
      this.scriptEvaluationError('The public key is in an unknown format.')
      return false
    }
    return true
  }

  private verifySignature (
    sig: TransactionSignature,
    pubkey: PublicKey,
    subscript: Script
  ): boolean {
    const preimage = TransactionSignature.format({
      sourceTXID: this.sourceTXID,
      sourceOutputIndex: this.sourceOutputIndex,
      sourceSatoshis: this.sourceSatoshis,
      transactionVersion: this.transactionVersion,
      otherInputs: this.otherInputs,
      outputs: this.outputs,
      inputIndex: this.inputIndex,
      subscript,
      inputSequence: this.inputSequence,
      lockTime: this.lockTime,
      scope: sig.scope
    })
    const hash = new BigNumber(Hash.hash256(preimage))
    return verify(hash, sig, pubkey)
  }

  step (): boolean {
    if (this.stackMem > this.memoryLimit) {
      this.scriptEvaluationError('Stack memory usage has exceeded ' + String(this.memoryLimit) + ' bytes')
      return false // Error thrown
    }
    if (this.altStackMem > this.memoryLimit) {
      this.scriptEvaluationError('Alt stack memory usage has exceeded ' + String(this.memoryLimit) + ' bytes')
      return false // Error thrown
    }

    if (
      this.context === 'UnlockingScript' &&
      this.programCounter >= this.unlockingScript.chunks.length
    ) {
      this.context = 'LockingScript'
      this.programCounter = 0
    }

    const currentScript = this.context === 'UnlockingScript' ? this.unlockingScript : this.lockingScript
    if (this.programCounter >= currentScript.chunks.length) {
      return false
    }
    const operation = currentScript.chunks[this.programCounter]

    const currentOpcode = operation.op
    if (typeof currentOpcode === 'undefined') {
      this.scriptEvaluationError(`Missing opcode in ${this.context} at pc=${this.programCounter}.`) // Error thrown
    }
    if (Array.isArray(operation.data) && operation.data.length > maxScriptElementSize) {
      this.scriptEvaluationError(`Data push > ${maxScriptElementSize} bytes (pc=${this.programCounter}).`) // Error thrown
    }

    const isScriptExecuting = !this.ifStack.includes(false)

    if (isScriptExecuting && currentOpcode >= 0 && currentOpcode <= OP.OP_PUSHDATA4) {
      if (!this.isRelaxed() && requireMinimalPush && !isChunkMinimalPushHelper(operation)) {
        this.scriptEvaluationError(`This data is not minimally-encoded. (PC: ${this.programCounter})`) // Error thrown
      }
      this.pushStack(Array.isArray(operation.data) ? operation.data : [])
    } else if (isScriptExecuting || (currentOpcode >= OP.OP_IF && currentOpcode <= OP.OP_ENDIF)) {
      let buf: number[], buf1: number[], buf2: number[], buf3: number[]
      let x1: number[], x2: number[], x3: number[]
      let bn: BigNumber, bn1: BigNumber, bn2: BigNumber, bn3: BigNumber
      let n: number, size: number, fValue: boolean, fSuccess: boolean, subscript: Script
      let bufSig: number[], bufPubkey: number[]
      let sig: TransactionSignature, pubkey: PublicKey
      let i: number, ikey: number, isig: number, nKeysCount: number, nSigsCount: number, fOk: boolean

      switch (currentOpcode) {
        case OP.OP_VER:
          this.pushStackCopy(new BigNumber(this.transactionVersion).toScriptNum())
          break
        case OP.OP_SUBSTR: {
          if (this.stack.length < 3) this.scriptEvaluationError('OP_SUBSTR requires at least three items to be on the stack.')
          const len = BigNumber.fromScriptNum(this.popStack(), !this.isRelaxed() && requireMinimalPush).toNumber()
          const offset = BigNumber.fromScriptNum(this.popStack(), !this.isRelaxed() && requireMinimalPush).toNumber()
          buf = this.popStack()
          const size = buf.length

          if (offset < 0 || offset >= size || len < 0 || len > size - offset) {
            this.scriptEvaluationError(`OP_SUBSTR offset (${offset}) must be in range [0, ${size}) and length (${len}) must be in range [0, ${size - offset}]`)
          }

          this.pushStack(buf.slice(offset, offset + len))
          break
        }
        case OP.OP_LEFT: {
          if (this.stack.length < 2) this.scriptEvaluationError('OP_LEFT requires at least two items to be on the stack.')
          const len = BigNumber.fromScriptNum(this.popStack(), !this.isRelaxed() && requireMinimalPush).toNumber()
          buf = this.popStack()
          const size = buf.length

          if (len < 0 || len > size) {
            this.scriptEvaluationError(`OP_LEFT length (${len}) must be in range [0, ${size}]`)
          }

          this.pushStack(buf.slice(0, len))
          break
        }
        case OP.OP_RIGHT: {
          if (this.stack.length < 2) this.scriptEvaluationError('OP_RIGHT requires at least two items to be on the stack.')
          const len = BigNumber.fromScriptNum(this.popStack(), !this.isRelaxed() && requireMinimalPush).toNumber()
          buf = this.popStack()
          const size = buf.length

          if (len < 0 || len > size) {
            this.scriptEvaluationError(`OP_RIGHT length (${len}) must be in range [0, ${size}]`)
          }

          this.pushStack(buf.slice(size - len, len))
          break
        }

        case OP.OP_1NEGATE: this.pushStackCopy(SCRIPTNUM_NEG_1); break
        case OP.OP_0: this.pushStackCopy(SCRIPTNUMS_0_TO_16[0]); break
        case OP.OP_1: case OP.OP_2: case OP.OP_3: case OP.OP_4:
        case OP.OP_5: case OP.OP_6: case OP.OP_7: case OP.OP_8:
        case OP.OP_9: case OP.OP_10: case OP.OP_11: case OP.OP_12:
        case OP.OP_13: case OP.OP_14: case OP.OP_15: case OP.OP_16:
          n = currentOpcode - (OP.OP_1 - 1)
          this.pushStackCopy(SCRIPTNUMS_0_TO_16[n])
          break

        case OP.OP_NOP:
        case OP.OP_NOP1:
        case OP.OP_NOP2:
        case OP.OP_NOP3:
        // case OP.OP_NOP4: // Allocated to OP_SUBSTR
        // case OP.OP_NOP5: // Allocated to OP_LEFT
        // case OP.OP_NOP6: // Allocated to OP_RIGHT
        // eslint-disable-next-line no-fallthrough
        case OP.OP_NOP7:
        case OP.OP_NOP8:
        case OP.OP_NOP9:
        case OP.OP_NOP10:
        // eslint-disable-next-line no-fallthrough
        case OP.OP_NOP11: case OP.OP_NOP12: case OP.OP_NOP13: case OP.OP_NOP14: case OP.OP_NOP15:
        case OP.OP_NOP16: case OP.OP_NOP17: case OP.OP_NOP18: case OP.OP_NOP19: case OP.OP_NOP20:
        case OP.OP_NOP21: case OP.OP_NOP22: case OP.OP_NOP23: case OP.OP_NOP24: case OP.OP_NOP25:
        case OP.OP_NOP26: case OP.OP_NOP27: case OP.OP_NOP28: case OP.OP_NOP29: case OP.OP_NOP30:
        case OP.OP_NOP31: case OP.OP_NOP32: case OP.OP_NOP33: case OP.OP_NOP34: case OP.OP_NOP35:
        case OP.OP_NOP36: case OP.OP_NOP37: case OP.OP_NOP38: case OP.OP_NOP39: case OP.OP_NOP40:
        case OP.OP_NOP41: case OP.OP_NOP42: case OP.OP_NOP43: case OP.OP_NOP44: case OP.OP_NOP45:
        case OP.OP_NOP46: case OP.OP_NOP47: case OP.OP_NOP48: case OP.OP_NOP49: case OP.OP_NOP50:
        case OP.OP_NOP51: case OP.OP_NOP52: case OP.OP_NOP53: case OP.OP_NOP54: case OP.OP_NOP55:
        case OP.OP_NOP56: case OP.OP_NOP57: case OP.OP_NOP58: case OP.OP_NOP59: case OP.OP_NOP60:
        case OP.OP_NOP61: case OP.OP_NOP62: case OP.OP_NOP63: case OP.OP_NOP64: case OP.OP_NOP65:
        case OP.OP_NOP66: case OP.OP_NOP67: case OP.OP_NOP68: case OP.OP_NOP69: case OP.OP_NOP70:
        case OP.OP_NOP71: case OP.OP_NOP72: case OP.OP_NOP73:
        case OP.OP_NOP77:
          break

        case OP.OP_VERIF:
        case OP.OP_VERNOTIF:
          fValue = false
          if (isScriptExecuting) {
            if (this.stack.length < 1) this.scriptEvaluationError('OP_VERIF and OP_VERNOTIF require at least one item on the stack when they are used!')
            buf2 = new BigNumber(this.transactionVersion).toScriptNum()
            buf1 = this.popStack()
            fValue = compareNumberArrays(buf1, buf2)
            if (currentOpcode === OP.OP_VERNOTIF) fValue = !fValue
          }
          this.ifStack.push(fValue)
          break
        case OP.OP_IF:
        case OP.OP_NOTIF:
          fValue = false
          if (isScriptExecuting) {
            if (this.stack.length < 1) this.scriptEvaluationError('OP_IF and OP_NOTIF require at least one item on the stack when they are used!')
            buf = this.popStack()
            fValue = this.castToBool(buf)
            if (currentOpcode === OP.OP_NOTIF) fValue = !fValue
          }
          this.ifStack.push(fValue)
          break
        case OP.OP_ELSE:
          if (this.ifStack.length === 0) this.scriptEvaluationError('OP_ELSE requires a preceeding OP_IF.')
          this.ifStack[this.ifStack.length - 1] = !this.ifStack[this.ifStack.length - 1]
          break
        case OP.OP_ENDIF:
          if (this.ifStack.length === 0) this.scriptEvaluationError('OP_ENDIF requires a preceeding OP_IF.')
          this.ifStack.pop()
          break
        case OP.OP_VERIFY:
          if (this.stack.length < 1) this.scriptEvaluationError('OP_VERIFY requires at least one item to be on the stack.')
          buf1 = this.stackTop()
          fValue = this.castToBool(buf1)
          if (!fValue) this.scriptEvaluationError('OP_VERIFY requires the top stack value to be truthy.')
          this.popStack()
          break
        case OP.OP_RETURN:
          if (this.context === 'UnlockingScript') this.programCounter = this.unlockingScript.chunks.length
          else this.programCounter = this.lockingScript.chunks.length
          this.ifStack = []
          this.programCounter-- // To counteract the final increment and ensure loop termination
          break

        case OP.OP_TOALTSTACK:
          if (this.stack.length < 1) this.scriptEvaluationError('OP_TOALTSTACK requires at oeast one item to be on the stack.')
          this.pushAltStack(this.popStack())
          break
        case OP.OP_FROMALTSTACK:
          if (this.altStack.length < 1) this.scriptEvaluationError('OP_FROMALTSTACK requires at least one item to be on the stack.') // "stack" here means altstack
          this.pushStack(this.popAltStack())
          break
        case OP.OP_2DROP:
          if (this.stack.length < 2) this.scriptEvaluationError('OP_2DROP requires at least two items to be on the stack.')
          this.popStack(); this.popStack()
          break
        case OP.OP_2DUP:
          if (this.stack.length < 2) this.scriptEvaluationError('OP_2DUP requires at least two items to be on the stack.')
          buf1 = this.stackTop(-2)
          buf2 = this.stackTop(-1)
          this.pushStackCopy(buf1); this.pushStackCopy(buf2)
          break
        case OP.OP_3DUP:
          if (this.stack.length < 3) this.scriptEvaluationError('OP_3DUP requires at least three items to be on the stack.')
          buf1 = this.stackTop(-3)
          buf2 = this.stackTop(-2)
          buf3 = this.stackTop(-1)
          this.pushStackCopy(buf1); this.pushStackCopy(buf2); this.pushStackCopy(buf3)
          break
        case OP.OP_2OVER:
          if (this.stack.length < 4) this.scriptEvaluationError('OP_2OVER requires at least four items to be on the stack.')
          buf1 = this.stackTop(-4)
          buf2 = this.stackTop(-3)
          this.pushStackCopy(buf1); this.pushStackCopy(buf2)
          break
        case OP.OP_2ROT: {
          if (this.stack.length < 6) this.scriptEvaluationError('OP_2ROT requires at least six items to be on the stack.')
          const rot6 = this.popStack(); const rot5 = this.popStack()
          const rot4 = this.popStack(); const rot3 = this.popStack()
          const rot2 = this.popStack(); const rot1 = this.popStack()
          this.pushStack(rot3); this.pushStack(rot4)
          this.pushStack(rot5); this.pushStack(rot6)
          this.pushStack(rot1); this.pushStack(rot2)
          break
        }
        case OP.OP_2SWAP: {
          if (this.stack.length < 4) this.scriptEvaluationError('OP_2SWAP requires at least four items to be on the stack.')
          const swap4 = this.popStack(); const swap3 = this.popStack()
          const swap2 = this.popStack(); const swap1 = this.popStack()
          this.pushStack(swap3); this.pushStack(swap4)
          this.pushStack(swap1); this.pushStack(swap2)
          break
        }
        case OP.OP_IFDUP:
          if (this.stack.length < 1) this.scriptEvaluationError('OP_IFDUP requires at least one item to be on the stack.')
          buf1 = this.stackTop()
          if (this.castToBool(buf1)) {
            this.pushStackCopy(buf1)
          }
          break
        case OP.OP_DEPTH:
          this.pushStack(new BigNumber(this.stack.length).toScriptNum())
          break
        case OP.OP_DROP:
          if (this.stack.length < 1) this.scriptEvaluationError('OP_DROP requires at least one item to be on the stack.')
          this.popStack()
          break
        case OP.OP_DUP:
          if (this.stack.length < 1) this.scriptEvaluationError('OP_DUP requires at least one item to be on the stack.')
          this.pushStackCopy(this.stackTop())
          break
        case OP.OP_NIP:
          if (this.stack.length < 2) this.scriptEvaluationError('OP_NIP requires at least two items to be on the stack.')
          buf2 = this.popStack()
          this.popStack()
          this.pushStack(buf2)
          break
        case OP.OP_OVER:
          if (this.stack.length < 2) this.scriptEvaluationError('OP_OVER requires at least two items to be on the stack.')
          this.pushStackCopy(this.stackTop(-2))
          break
        case OP.OP_PICK:
        case OP.OP_ROLL: {
          if (this.stack.length < 2) this.scriptEvaluationError(`${OP[currentOpcode] as string} requires at least two items to be on the stack.`)
          bn = BigNumber.fromScriptNum(this.popStack(), !this.isRelaxed() && requireMinimalPush)
          n = bn.toNumber()
          if (n < 0 || n >= this.stack.length) {
            this.scriptEvaluationError(`${OP[currentOpcode] as string} requires the top stack element to be 0 or a positive number less than the current size of the stack.`)
          }
          const itemToMoveOrCopy = this.stack[this.stack.length - 1 - n]
          if (currentOpcode === OP.OP_ROLL) {
            this.stack.splice(this.stack.length - 1 - n, 1)
            this.stackMem -= itemToMoveOrCopy.length
            this.pushStack(itemToMoveOrCopy)
          } else { // OP_PICK
            this.pushStackCopy(itemToMoveOrCopy)
          }
          break
        }
        case OP.OP_ROT:
          if (this.stack.length < 3) this.scriptEvaluationError('OP_ROT requires at least three items to be on the stack.')
          x3 = this.popStack()
          x2 = this.popStack()
          x1 = this.popStack()
          this.pushStack(x2); this.pushStack(x3); this.pushStack(x1)
          break
        case OP.OP_SWAP:
          if (this.stack.length < 2) this.scriptEvaluationError('OP_SWAP requires at least two items to be on the stack.')
          x2 = this.popStack()
          x1 = this.popStack()
          this.pushStack(x2); this.pushStack(x1)
          break
        case OP.OP_TUCK:
          if (this.stack.length < 2) this.scriptEvaluationError('OP_TUCK requires at least two items to be on the stack.')
          buf1 = this.stackTop(-1) // Top element (x2)
          // stack is [... rest, x1, x2]
          // We want [... rest, x2_copy, x1, x2]
          this.ensureStackMem(buf1.length)
          this.stack.splice(this.stack.length - 2, 0, buf1.slice()) // Insert copy of x2 before x1
          this.stackMem += buf1.length // Account for the new copy
          break
        case OP.OP_SIZE:
          if (this.stack.length < 1) this.scriptEvaluationError('OP_SIZE requires at least one item to be on the stack.')
          this.pushStack(new BigNumber(this.stackTop().length).toScriptNum())
          break

        case OP.OP_AND:
        case OP.OP_OR:
        case OP.OP_XOR: {
          if (this.stack.length < 2) this.scriptEvaluationError(`${OP[currentOpcode] as string} requires at least two items on the stack.`)
          buf2 = this.popStack()
          buf1 = this.popStack()
          if (buf1.length !== buf2.length) this.scriptEvaluationError(`${OP[currentOpcode] as string} requires the top two stack items to be the same size.`)

          const resultBufBitwiseOp = new Array(buf1.length)
          for (let k = 0; k < buf1.length; k++) {
            if (currentOpcode === OP.OP_AND) resultBufBitwiseOp[k] = buf1[k] & buf2[k]
            else if (currentOpcode === OP.OP_OR) resultBufBitwiseOp[k] = buf1[k] | buf2[k]
            else resultBufBitwiseOp[k] = buf1[k] ^ buf2[k]
          }
          this.pushStack(resultBufBitwiseOp)
          break
        }
        case OP.OP_INVERT: {
          if (this.stack.length < 1) this.scriptEvaluationError('OP_INVERT requires at least one item to be on the stack.')
          buf = this.popStack()
          const invertedBufOp = new Array(buf.length)
          for (let k = 0; k < buf.length; k++) {
            invertedBufOp[k] = (~buf[k]) & 0xff
          }
          this.pushStack(invertedBufOp)
          break
        }
        case OP.OP_LSHIFT:
        case OP.OP_RSHIFT: {
          if (this.stack.length < 2) this.scriptEvaluationError(`${OP[currentOpcode] as string} requires at least two items to be on the stack.`)
          bn2 = BigNumber.fromScriptNum(this.popStack(), !this.isRelaxed() && requireMinimalPush) // n (shift amount)
          buf1 = this.popStack() // value to shift
          n = bn2.toNumber()
          if (n < 0) this.scriptEvaluationError(`${OP[currentOpcode] as string} requires the top item on the stack not to be negative.`)
          if (buf1.length === 0) {
            this.pushStack([])
            break
          }
          bn1 = new BigNumber(buf1)
          let shiftedBn: BigNumber
          if (currentOpcode === OP.OP_LSHIFT) shiftedBn = bn1.ushln(n)
          else shiftedBn = bn1.ushrn(n)

          const shiftedArr = shiftedBn.toArray('le', buf1.length)
          this.pushStack(shiftedArr)
          break
        }
        case OP.OP_EQUAL:
        case OP.OP_EQUALVERIFY:
          if (this.stack.length < 2) this.scriptEvaluationError(`${OP[currentOpcode] as string} requires at least two items to be on the stack.`)
          buf2 = this.popStack()
          buf1 = this.popStack()
          fValue = compareNumberArrays(buf1, buf2)
          this.pushStack(fValue ? [1] : [])
          if (currentOpcode === OP.OP_EQUALVERIFY) {
            if (!fValue) this.scriptEvaluationError('OP_EQUALVERIFY requires the top two stack items to be equal.')
            this.popStack()
          }
          break

        case OP.OP_1ADD: case OP.OP_1SUB: case OP.OP_2MUL: case OP.OP_2DIV:
        case OP.OP_NEGATE: case OP.OP_ABS:
        case OP.OP_NOT: case OP.OP_0NOTEQUAL:
          if (this.stack.length < 1) this.scriptEvaluationError(`${OP[currentOpcode] as string} requires at least one item to be on the stack.`)
          bn = BigNumber.fromScriptNum(this.popStack(), !this.isRelaxed() && requireMinimalPush)
          switch (currentOpcode) {
            case OP.OP_1ADD: bn = bn.add(new BigNumber(1)); break
            case OP.OP_1SUB: bn = bn.sub(new BigNumber(1)); break
            case OP.OP_2MUL: bn = bn.mul(new BigNumber(2)); break
            case OP.OP_2DIV: bn = bn.div(new BigNumber(2)); break
            case OP.OP_NEGATE: bn = bn.neg(); break
            case OP.OP_ABS: if (bn.isNeg()) bn = bn.neg(); break
            case OP.OP_NOT: bn = new BigNumber(bn.cmpn(0) === 0 ? 1 : 0); break
            case OP.OP_0NOTEQUAL: bn = new BigNumber(bn.cmpn(0) !== 0 ? 1 : 0); break
          }
          this.pushStack(bn.toScriptNum())
          break
        case OP.OP_ADD: case OP.OP_SUB: case OP.OP_MUL: case OP.OP_DIV: case OP.OP_MOD:
        case OP.OP_BOOLAND: case OP.OP_BOOLOR:
        case OP.OP_NUMEQUAL: case OP.OP_NUMEQUALVERIFY: case OP.OP_NUMNOTEQUAL:
        case OP.OP_LESSTHAN: case OP.OP_GREATERTHAN:
        case OP.OP_LESSTHANOREQUAL: case OP.OP_GREATERTHANOREQUAL:
        case OP.OP_MIN: case OP.OP_MAX: {
          if (this.stack.length < 2) this.scriptEvaluationError(`${OP[currentOpcode] as string} requires at least two items to be on the stack.`)
          buf2 = this.popStack()
          buf1 = this.popStack()
          bn2 = BigNumber.fromScriptNum(buf2, !this.isRelaxed() && requireMinimalPush)
          bn1 = BigNumber.fromScriptNum(buf1, !this.isRelaxed() && requireMinimalPush)
          let predictedLen = 0
          switch (currentOpcode) {
            case OP.OP_MUL:
              predictedLen = bn1.byteLength() + bn2.byteLength()
              break
            case OP.OP_ADD:
            case OP.OP_SUB:
              predictedLen = Math.max(bn1.byteLength(), bn2.byteLength()) + 1
              break
            default:
              predictedLen = Math.max(bn1.byteLength(), bn2.byteLength())
          }
          this.ensureStackMem(predictedLen)
          let resultBnArithmetic: BigNumber = new BigNumber(0)
          switch (currentOpcode) {
            case OP.OP_ADD: resultBnArithmetic = bn1.add(bn2); break
            case OP.OP_SUB: resultBnArithmetic = bn1.sub(bn2); break
            case OP.OP_MUL: resultBnArithmetic = bn1.mul(bn2); break
            case OP.OP_DIV:
              if (bn2.cmpn(0) === 0) this.scriptEvaluationError('OP_DIV cannot divide by zero!')
              resultBnArithmetic = bn1.div(bn2); break
            case OP.OP_MOD:
              if (bn2.cmpn(0) === 0) this.scriptEvaluationError('OP_MOD cannot divide by zero!')
              resultBnArithmetic = bn1.mod(bn2); break
            case OP.OP_BOOLAND: resultBnArithmetic = new BigNumber((bn1.cmpn(0) !== 0 && bn2.cmpn(0) !== 0) ? 1 : 0); break
            case OP.OP_BOOLOR: resultBnArithmetic = new BigNumber((bn1.cmpn(0) !== 0 || bn2.cmpn(0) !== 0) ? 1 : 0); break
            case OP.OP_NUMEQUAL: resultBnArithmetic = new BigNumber(bn1.cmp(bn2) === 0 ? 1 : 0); break
            case OP.OP_NUMEQUALVERIFY: resultBnArithmetic = new BigNumber(bn1.cmp(bn2) === 0 ? 1 : 0); break
            case OP.OP_NUMNOTEQUAL: resultBnArithmetic = new BigNumber(bn1.cmp(bn2) !== 0 ? 1 : 0); break
            case OP.OP_LESSTHAN: resultBnArithmetic = new BigNumber(bn1.cmp(bn2) < 0 ? 1 : 0); break
            case OP.OP_GREATERTHAN: resultBnArithmetic = new BigNumber(bn1.cmp(bn2) > 0 ? 1 : 0); break
            case OP.OP_LESSTHANOREQUAL: resultBnArithmetic = new BigNumber(bn1.cmp(bn2) <= 0 ? 1 : 0); break
            case OP.OP_GREATERTHANOREQUAL: resultBnArithmetic = new BigNumber(bn1.cmp(bn2) >= 0 ? 1 : 0); break
            case OP.OP_MIN: resultBnArithmetic = bn1.cmp(bn2) < 0 ? bn1 : bn2; break
            case OP.OP_MAX: resultBnArithmetic = bn1.cmp(bn2) > 0 ? bn1 : bn2; break
          }
          this.pushStack(resultBnArithmetic.toScriptNum())
          if (currentOpcode === OP.OP_NUMEQUALVERIFY) {
            if (!this.castToBool(this.stackTop())) this.scriptEvaluationError('OP_NUMEQUALVERIFY requires the top stack item to be truthy.')
            this.popStack()
          }
          break
        }
        case OP.OP_WITHIN:
          if (this.stack.length < 3) this.scriptEvaluationError('OP_WITHIN requires at least three items to be on the stack.')
          bn3 = BigNumber.fromScriptNum(this.popStack(), !this.isRelaxed() && requireMinimalPush) // max
          bn2 = BigNumber.fromScriptNum(this.popStack(), !this.isRelaxed() && requireMinimalPush) // min
          bn1 = BigNumber.fromScriptNum(this.popStack(), !this.isRelaxed() && requireMinimalPush) // x
          fValue = bn1.cmp(bn2) >= 0 && bn1.cmp(bn3) < 0
          this.pushStack(fValue ? [1] : [])
          break

        case OP.OP_RIPEMD160: case OP.OP_SHA1: case OP.OP_SHA256:
        case OP.OP_HASH160: case OP.OP_HASH256: {
          if (this.stack.length < 1) this.scriptEvaluationError(`${OP[currentOpcode] as string} requires at least one item to be on the stack.`)
          buf = this.popStack()
          let hashResult: number[] = [] // Initialize to empty, to satisfy TS compiler
          if (currentOpcode === OP.OP_RIPEMD160) hashResult = Hash.ripemd160(buf)
          else if (currentOpcode === OP.OP_SHA1) hashResult = Hash.sha1(buf)
          else if (currentOpcode === OP.OP_SHA256) hashResult = Hash.sha256(buf)
          else if (currentOpcode === OP.OP_HASH160) hashResult = Hash.hash160(buf)
          else if (currentOpcode === OP.OP_HASH256) hashResult = Hash.hash256(buf)
          this.pushStack(hashResult)
          break
        }
        case OP.OP_CODESEPARATOR:
          this.lastCodeSeparator = this.programCounter
          break
        case OP.OP_CHECKSIG:
        case OP.OP_CHECKSIGVERIFY: {
          if (this.stack.length < 2) this.scriptEvaluationError(`${OP[currentOpcode] as string} requires at least two items to be on the stack.`)
          bufPubkey = this.popStack()
          bufSig = this.popStack()

          if (!this.checkSignatureEncoding(bufSig) || !this.checkPublicKeyEncoding(bufPubkey)) {
            // Error already thrown by helpers
            this.scriptEvaluationError(`${OP[currentOpcode] as string} requires correct encoding for the public key and signature.`) // Fallback, should be unreachable
          }

          fSuccess = false
          if (bufSig.length > 0) {
            try {
              sig = TransactionSignature.fromChecksigFormat(bufSig)

              const scriptForChecksig: Script = this.context === 'UnlockingScript' ? this.unlockingScript : this.lockingScript
              const scriptCodeChunks = scriptForChecksig.chunks.slice(this.lastCodeSeparator === null ? 0 : this.lastCodeSeparator + 1)
              subscript = new Script(scriptCodeChunks)
              subscript.findAndDelete(new Script().writeBin(bufSig))

              pubkey = PublicKey.fromDER(bufPubkey)
              fSuccess = this.verifySignature(sig, pubkey, subscript)
            } catch (e) {
              fSuccess = false
            }
          }

          this.pushStack(fSuccess ? [1] : [])
          if (currentOpcode === OP.OP_CHECKSIGVERIFY) {
            if (!fSuccess) this.scriptEvaluationError('OP_CHECKSIGVERIFY requires that a valid signature is provided.')
            this.popStack()
          }
          break
        }
        case OP.OP_CHECKMULTISIG:
        case OP.OP_CHECKMULTISIGVERIFY: {
          i = 1
          if (this.stack.length < i) {
            this.scriptEvaluationError(`${OP[currentOpcode] as string} requires at least 1 item for nKeys.`)
          }

          nKeysCount = BigNumber.fromScriptNum(this.stackTop(-i), !this.isRelaxed() && requireMinimalPush).toNumber()
          if (nKeysCount < 0 || nKeysCount > maxMultisigKeyCount) {
            this.scriptEvaluationError(`${OP[currentOpcode] as string} requires a key count between 0 and ${maxMultisigKeyCount}.`)
          }
          ikey = ++i
          i += nKeysCount

          if (this.stack.length < i) {
            this.scriptEvaluationError(`${OP[currentOpcode] as string} stack too small for nKeys and keys. Need ${i}, have ${this.stack.length}.`)
          }

          nSigsCount = BigNumber.fromScriptNum(this.stackTop(-i), !this.isRelaxed() && requireMinimalPush).toNumber()
          if (nSigsCount < 0 || nSigsCount > nKeysCount) {
            this.scriptEvaluationError(`${OP[currentOpcode] as string} requires the number of signatures to be no greater than the number of keys.`)
          }
          isig = ++i
          i += nSigsCount
          if (this.stack.length < i) {
            this.scriptEvaluationError(`${OP[currentOpcode] as string} stack too small for N, keys, M, sigs, and dummy. Need ${i}, have ${this.stack.length}.`)
          }

          const baseScriptCMS = this.context === 'UnlockingScript' ? this.unlockingScript : this.lockingScript
          const subscriptChunksCMS = baseScriptCMS.chunks.slice(this.lastCodeSeparator === null ? 0 : this.lastCodeSeparator + 1)
          subscript = new Script(subscriptChunksCMS)

          for (let k = 0; k < nSigsCount; k++) {
            bufSig = this.stackTop(-isig - k) // Sigs are closer to top than keys
            subscript.findAndDelete(new Script().writeBin(bufSig))
          }

          fSuccess = true
          while (fSuccess && nSigsCount > 0) {
            if (nKeysCount === 0) { // No more keys to check against but still sigs left
              fSuccess = false
              break
            }
            bufSig = this.stackTop(-isig)
            bufPubkey = this.stackTop(-ikey)

            if (!this.checkSignatureEncoding(bufSig) || !this.checkPublicKeyEncoding(bufPubkey)) {
              this.scriptEvaluationError(`${OP[currentOpcode] as string} requires correct encoding for the public key and signature.`)
            }

            fOk = false
            if (bufSig.length > 0) {
              try {
                sig = TransactionSignature.fromChecksigFormat(bufSig)
                pubkey = PublicKey.fromDER(bufPubkey)
                fOk = this.verifySignature(sig, pubkey, subscript)
              } catch (e) {
                fOk = false
              }
            }

            if (fOk) {
              isig++; nSigsCount--
            }
            ikey++; nKeysCount--

            if (nSigsCount > nKeysCount) {
              fSuccess = false
            }
          }

          // Correct total items consumed by op (N_val, keys, M_val, sigs, dummy)
          const itemsConsumedByOp = 1 + // N_val
                                  BigNumber.fromScriptNum(this.stackTop(-1), false).toNumber() + // keys
                                  1 + // M_val
                                  BigNumber.fromScriptNum(this.stackTop(-(1 + BigNumber.fromScriptNum(this.stackTop(-1), false).toNumber() + 1)), false).toNumber() + // sigs
                                  1 // dummy

          let popCount = itemsConsumedByOp - 1 // Pop all except dummy
          while (popCount > 0) {
            this.popStack()
            popCount--
          }

          // Check and pop dummy
          if (this.stack.length < 1) {
            this.scriptEvaluationError(`${OP[currentOpcode] as string} requires an extra item (dummy) to be on the stack.`)
          }
          const dummyBuf = this.popStack()
          if (!this.isRelaxed() && dummyBuf.length > 0) { // SCRIPT_VERIFY_NULLDUMMY
            this.scriptEvaluationError(`${OP[currentOpcode] as string} requires the extra stack item (dummy) to be empty.`)
          }

          this.pushStack(fSuccess ? [1] : [])
          if (currentOpcode === OP.OP_CHECKMULTISIGVERIFY) {
            if (!fSuccess) this.scriptEvaluationError('OP_CHECKMULTISIGVERIFY requires that a sufficient number of valid signatures are provided.')
            this.popStack()
          }
          break
        }

        case OP.OP_CAT: {
          if (this.stack.length < 2) this.scriptEvaluationError('OP_CAT requires at least two items to be on the stack.')
          buf2 = this.popStack()
          buf1 = this.popStack()
          const catResult = (buf1).concat(buf2)
          if (catResult.length > maxScriptElementSize) this.scriptEvaluationError(`It's not currently possible to push data larger than ${maxScriptElementSize} bytes.`)
          this.pushStack(catResult)
          break
        }
        case OP.OP_SPLIT: {
          if (this.stack.length < 2) this.scriptEvaluationError('OP_SPLIT requires at least two items to be on the stack.')
          const posBuf = this.popStack()
          const dataToSplit = this.popStack()

          n = BigNumber.fromScriptNum(posBuf, !this.isRelaxed() && requireMinimalPush).toNumber()
          if (n < 0 || n > dataToSplit.length) {
            this.scriptEvaluationError('OP_SPLIT requires the first stack item to be a non-negative number less than or equal to the size of the second-from-top stack item.')
          }

          this.pushStack(dataToSplit.slice(0, n))
          this.pushStack(dataToSplit.slice(n))
          break
        }
        case OP.OP_NUM2BIN: {
          if (this.stack.length < 2) this.scriptEvaluationError('OP_NUM2BIN requires at least two items to be on the stack.')

          size = BigNumber.fromScriptNum(this.popStack(), !this.isRelaxed() && requireMinimalPush).toNumber()
          if (size > maxScriptElementSize || size < 0) { // size can be 0
            this.scriptEvaluationError(`It's not currently possible to push data larger than ${maxScriptElementSize} bytes or negative size.`)
          }

          let rawnum = this.popStack() // This is the number to convert
          rawnum = minimallyEncode(rawnum) // Get its minimal scriptnum form

          if (rawnum.length > size) {
            this.scriptEvaluationError('OP_NUM2BIN requires that the size expressed in the top stack item is large enough to hold the value expressed in the second-from-top stack item.')
          }

          if (rawnum.length === size) {
            this.pushStack(rawnum)
            break
          }

          const resultN2B = new Array(size).fill(0x00)
          let signbit = 0x00

          if (rawnum.length > 0) {
            signbit = rawnum[rawnum.length - 1] & 0x80 // Store sign bit
            rawnum[rawnum.length - 1] &= 0x7f // Remove sign bit for padding
          }

          // Copy rawnum (now positive magnitude) into the result
          for (let k = 0; k < rawnum.length; k++) {
            resultN2B[k] = rawnum[k]
          }

          // If the original number was negative, the sign bit must be set on the new MSB
          if (signbit !== 0) {
            resultN2B[size - 1] |= 0x80
          }
          this.pushStack(resultN2B)
          break
        }
        case OP.OP_BIN2NUM: {
          if (this.stack.length < 1) this.scriptEvaluationError('OP_BIN2NUM requires at least one item to be on the stack.')
          buf1 = this.popStack()
          const b2nResult = minimallyEncode(buf1)
          if (!isMinimallyEncodedHelper(b2nResult)) {
            this.scriptEvaluationError('OP_BIN2NUM requires that the resulting number is valid.')
          }
          this.pushStack(b2nResult)
          break
        }

        default:
          this.scriptEvaluationError(`Invalid opcode ${currentOpcode} (pc=${this.programCounter}).`)
      }
    }

    this.programCounter++
    return true
  }

  /**
   * @method validate
   * Validates the spend action by interpreting the locking and unlocking scripts.
   * @returns {boolean} Returns true if the scripts are valid and the spend is legitimate, otherwise false.
   * @example
   * if (spend.validate()) {
   *   console.log("Spend is valid!");
   * } else {
   *   console.log("Invalid spend!");
   * }
   */
  validate (): boolean {
    if (!this.isRelaxed() && requirePushOnlyUnlockingScripts && !this.unlockingScript.isPushOnly()) {
      this.scriptEvaluationError(
        'Unlocking scripts can only contain push operations, and no other opcodes.'
      )
    }

    while (this.step()) {
      if (
        this.context === 'LockingScript' &&
        this.programCounter >= this.lockingScript.chunks.length
      ) {
        break
      }
    }

    if (this.ifStack.length > 0) {
      this.scriptEvaluationError(
        'Every OP_IF, OP_NOTIF, or OP_ELSE must be terminated with OP_ENDIF prior to the end of the script.'
      )
    }

    if (!this.isRelaxed() && requireCleanStack) {
      if (this.stack.length !== 1) {
        this.scriptEvaluationError(
          `The clean stack rule requires exactly one item to be on the stack after script execution, found ${this.stack.length}.`
        )
      }
    }

    if (this.stack.length === 0) {
      this.scriptEvaluationError(
        'The top stack element must be truthy after script evaluation (stack is empty).'
      )
    } else if (!this.castToBool(this.stackTop())) {
      this.scriptEvaluationError(
        'The top stack element must be truthy after script evaluation.'
      )
    }

    return true
  }

  private castToBool (val: Readonly<number[]>): boolean {
    if (val.length === 0) return false
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== 0) {
        return !(i === val.length - 1 && val[i] === 0x80)
      }
    }
    return false
  }

  private scriptEvaluationError (str: string): void {
    const pcInfo = `Context: ${this.context}, PC: ${this.programCounter}`
    const stackHex = this.stack.map(s => (s != null && typeof s.length !== 'undefined') ? toHex(s) : (s === null || s === undefined ? 'null/undef' : 'INVALID_STACK_ITEM')).join(', ')
    const altStackHex = this.altStack.map(s => (s != null && typeof s.length !== 'undefined') ? toHex(s) : (s === null || s === undefined ? 'null/undef' : 'INVALID_STACK_ITEM')).join(', ')

    const stackInfo = `Stack: [${stackHex}] (len: ${this.stack.length}, mem: ${this.stackMem})`
    const altStackInfo = `AltStack: [${altStackHex}] (len: ${this.altStack.length}, mem: ${this.altStackMem})`
    const ifStackInfo = `IfStack: [${this.ifStack.join(', ')}]`

    throw new Error(
      `Script evaluation error: ${str}\nTXID: ${this.sourceTXID}, OutputIdx: ${this.sourceOutputIndex}\n${pcInfo}\n${stackInfo}\n${altStackInfo}\n${ifStackInfo}`
    )
  }
}
