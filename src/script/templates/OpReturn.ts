import OP from '../OP.js'
import ScriptTemplate from '../ScriptTemplate.js'
import LockingScript from '../LockingScript.js'
import UnlockingScript from '../UnlockingScript.js'
import Transaction from '../../transaction/Transaction.js'
import { toArray } from '../../primitives/utils.js'

/**
 * OpReturn class implementing ScriptTemplate.
 *
 * This class provides methods to create OpReturn scripts from data. Only lock script is available.
 */
export default class OpReturn implements ScriptTemplate {
  /**
   * Creates an OpReturn script
   *
   * @param {string | string[] | number[]} data The data or array of data to push after OP_RETURN.
   * @param {('hex' | 'utf8' | 'base64')} enc The data encoding type, defaults to utf8.
   * @returns {LockingScript} - An OpReturn locking script.
   */
  lock(data: string | string[] | number[], enc?: 'hex' | 'utf8' | 'base64'): LockingScript {
    const script : {op: number, data? }[] = [
      { op: OP.OP_FALSE },
      { op: OP.OP_RETURN }
    ]

    if (typeof data === 'string') {
      data = [data]
    }

    if (data.length && typeof data[0] === 'number') {
      script.push({ op: data.length, data })
    } else {
      for (const entry of data.filter(Boolean)) {
        const arr = toArray(entry, enc)
        script.push({ op: arr.length, data: arr })
      }
    }

    return new LockingScript(script)
  }

  /**
   * Unlock method is not available for OpReturn scripts, throws exception.
   */
  unlock(): {
    sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>
    estimateLength: () => Promise<number>
  } {
    throw new Error('Unlock is not supported for OpReturn scripts')
  }
}
