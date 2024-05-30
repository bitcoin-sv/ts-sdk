import Transaction from '../transaction/Transaction.js'
import TransactionInput from '../transaction/TransactionInput.js'
import LockingScript from '../script/LockingScript.js'
import UnlockingScript from '../script/UnlockingScript.js'

type jsonUtxo = {
    txid: string
    vout: number
    satoshis: number
    script: string
}
/**
 * fromUtxo
 * 
 * This function creates a transaction input from a utxo json object
 * The idea being old code that uses utxos rather than sourceTranactions can convert using this.
 * 
 * example:
 * const i = fromUtxo({
 *   txid: '434555433eaca96dff6e71a4d02febd0dd3832e5ca4e5734623ca914522e17d5',
 *   vout: 0,
 *   script: '51',
 *   satoshis: 1234
 * }, new P2PKH().unlock(p))
 * 
 * tx.addInput(i)
 * 
 * @param utxo: jsonUtxo
 * @param unlockingScriptTemplate: { sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>, estimateLength: (tx: Transaction, inputIndex: number) => Promise<number> }
 * @returns 
 */
export default function fromUtxo(utxo: jsonUtxo, unlockingScriptTemplate: {
    sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>
    estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>
  }): TransactionInput {
    const sourceTransaction = new Transaction(0, [], [], 0)
    sourceTransaction.outputs = Array(utxo.vout + 1).fill(null)
    sourceTransaction.outputs[utxo.vout] = {
        satoshis: utxo.satoshis,
        lockingScript: LockingScript.fromHex(utxo.script)
    }
    return {
        sourceTransaction,
        sourceOutputIndex: utxo.vout,
        unlockingScriptTemplate,
        sequence: 0xFFFFFFFF
    }
}