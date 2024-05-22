import OP from '../OP.js'
import ScriptTemplate from '../ScriptTemplate.js'
import LockingScript from '../LockingScript.js'
import PublicKey from '../../primitives/PublicKey.js'
import UnlockingScript from '../UnlockingScript.js'
import Transaction from '../../transaction/Transaction.js'
import { toArray } from '../../primitives/utils.js'

/**
 * Metanet class implementing ScriptTemplate.
 *
 * This class provides methods to create Metanet outputs from data. Only lock script is available.
 */
export default class Metanet implements ScriptTemplate {
  /**
   * Creates a Metanet output script
   *
   * @param {PublicKey} pubkey the public key responsible for the metanet node
   * @param {string} parentTXID the TXID of the parent metanet transaction or null for root node
   * @param {string[]} data the output data, an array of metadata ending in data payload
   * @param {'hex' | 'utf8' | 'base64'} enc The data encoding type, defaults to utf8.
   * @returns {LockingScript} - A Metanet locking script.
   *
   * @example
   * // creates a root metanet return with 'subprotocol' and 'filename' metadata followed by data
   * lock(pubkey, null, txid, ['subprotocol', 'filename', data ])
   */
  lock(pubkey: PublicKey, parentTXID: string | null, data: string[] | string = [], enc?: 'hex' | 'utf8' | 'base64'): LockingScript {
    const script : {op: number, data? }[] = [
      { op: OP.OP_FALSE },
      { op: OP.OP_RETURN }
    ]

    const fields = [
      toArray('meta'),
      toArray(pubkey.toString(), 'hex'),
      parentTXID ? toArray(parentTXID, 'hex') : toArray('null')
    ]

    if (typeof data === 'string') {
      data = [data]
    }

    for (const entry of data) {
      fields.push(toArray(entry, enc))
    }

    for (const field of fields) {
      script.push({ op: field.length, data: field })
    }

    return new LockingScript(script)
  }

  /**
   * Unlock method is not available for Metanet scripts, throws exception.
   */
  unlock(): {
    sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>
    estimateLength: () => Promise<number>
  } {
    throw new Error('Unlock is not supported for Metanet scripts')
  }
}
