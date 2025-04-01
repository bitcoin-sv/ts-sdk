import LockingScript from '../script/LockingScript.js'
import PushDrop from '../script/templates/PushDrop.js'
import * as Utils from '../primitives/utils.js'
import { WalletInterface, OutpointString, CreateActionInput, SignActionSpend } from '../wallet/Wallet.interfaces.js'
import WalletClient from '../wallet/WalletClient.js'
import Transaction from '../transaction/Transaction.js'

/**
 * Implements a key-value storage system backed by transaction outputs managed by a wallet.
 * Each key-value pair is represented by a PushDrop token output in a specific context (basket).
 * Allows setting, getting, and removing key-value pairs, with optional encryption.
 */
export default class LocalKVStore {
  /**
   * The wallet interface used to manage outputs and perform cryptographic operations.
   * @private
   * @readonly
   */
  private readonly wallet: WalletInterface
  /**
   * The context (basket name) used to namespace the key-value pairs within the wallet.
   * @private
   * @readonly
   */
  private readonly context: string
  /**
   * Flag indicating whether values should be encrypted before storing.
   * @private
   * @readonly
   */
  private readonly encrypt: boolean

  /**
   * Creates an instance of the localKVStore.
   *
   * @param {WalletInterface} [wallet=new WalletClient()] - The wallet interface to use. Defaults to a new WalletClient instance.
   * @param {string} [context='kvstore-default'] - The context (basket) for namespacing keys. Defaults to 'kvstore-default'.
   * @param {boolean} [encrypt=true] - Whether to encrypt values. Defaults to true.
   * @throws {Error} If the context is missing or empty.
   */
  constructor (
    wallet: WalletInterface = new WalletClient(),
    context = 'kvstore-default',
    encrypt = true
  ) {
    if (typeof context !== 'string' || context.length < 1) {
      throw new Error('A context in which to operate is required.')
    }
    this.wallet = wallet
    this.context = context
    this.encrypt = encrypt
  }

  /**
   * Retrieves the value associated with a given key.
   *
   * @param {string} key - The key to retrieve the value for.
   * @param {string | undefined} [defaultValue=undefined] - The value to return if the key is not found.
   * @returns {Promise<string | undefined>} A promise that resolves to the value as a string,
   *   the defaultValue if the key is not found, or undefined if no defaultValue is provided.
   * @throws {Error} If multiple outputs are found for the key (ambiguous state).
   * @throws {Error} If the found output's locking script cannot be decoded or represents an invalid token format.
   */
  async get (key: string, defaultValue: string | undefined = undefined): Promise<string | undefined> {
    const results = await this.wallet.listOutputs({
      basket: this.context,
      tags: [key],
      include: 'locking scripts'
    })
    if (results.outputs.length === 0) {
      return defaultValue
    } else if (results.outputs.length > 1) {
      throw new Error('Multiple tokens found for this key. You need to call set to collapse this ambiguous state before you can get this value again.')
    }
    let fields: number[][]
    try {
      if (typeof results.outputs[0].lockingScript !== 'string') {
        throw new Error('No locking script')
      }
      const decoded = PushDrop.decode(LockingScript.fromHex(results.outputs[0].lockingScript))
      if (decoded.fields.length !== 1) {
        throw new Error('Invalid token.')
      }
      fields = decoded.fields
    } catch (_) {
      throw new Error(`Invalid value found. You need to call set to collapse the corrupted state (or relinquish the corrupted ${results.outputs[0].outpoint} output from the ${this.context} basket) before you can get this value again.`)
    }
    if (!this.encrypt) {
      return Utils.toUTF8(fields[0])
    } else {
      const { plaintext } = await this.wallet.decrypt({
        protocolID: [2, this.context],
        keyID: key,
        ciphertext: fields[0]
      })
      return Utils.toUTF8(plaintext)
    }
  }

  /**
   * Sets or updates the value associated with a given key.
   * If the key already exists (one or more outputs found), it spends the existing output(s)
   * and creates a new one with the updated value. If multiple outputs exist for the key,
   * they are collapsed into a single new output.
   * If the key does not exist, it creates a new output.
   * Handles encryption if enabled.
   * If signing the update/collapse transaction fails, it relinquishes the original outputs and starts over with a new chain.
   *
   * @param {string} key - The key to set or update.
   * @param {string} value - The value to associate with the key.
   * @returns {Promise<OutpointString>} A promise that resolves to the outpoint string (txid.vout) of the new or updated token output.
   */
  async set (key: string, value: string): Promise<OutpointString> {
    let valueAsArray = Utils.toArray(value, 'utf8')
    if (this.encrypt) {
      const { ciphertext } = await this.wallet.encrypt({
        plaintext: valueAsArray,
        protocolID: [2, this.context],
        keyID: key
      })
      valueAsArray = ciphertext
    }
    const pushdrop = new PushDrop(this.wallet)
    const lockingScript = await pushdrop.lock(
      [valueAsArray],
      [2, this.context],
      key,
      'self'
    )
    const results = await this.wallet.listOutputs({
      basket: this.context,
      tags: [key],
      include: 'entire transactions'
    })
    if (results.totalOutputs !== 0) {
      try {
        const inputs: CreateActionInput[] = []
        for (let i = 0; i < results.outputs.length; i++) {
          inputs.push({
            outpoint: results.outputs[i].outpoint,
            unlockingScriptLength: 74,
            inputDescription: 'Previous key-value token'
          })
        }
        const { signableTransaction } = await this.wallet.createAction({
          description: `Update ${key} in ${this.context}`,
          inputBEEF: results.BEEF,
          inputs,
          outputs: [{
            lockingScript: lockingScript.toHex(),
            satoshis: 1,
            outputDescription: 'Key-value token'
          }],
          options: {
            acceptDelayedBroadcast: false,
            randomizeOutputs: false
          }
        })
        if (typeof signableTransaction !== 'object') {
          throw new Error('Wallet did not return a signable transaction when expected.')
        }
        const tx = Transaction.fromAtomicBEEF(signableTransaction.tx)
        const spends: Record<number, SignActionSpend> = {}
        for (let i = 0; i < results.outputs.length; i++) {
          const unlocker = pushdrop.unlock(
            [2, this.context],
            key,
            'self'
          )
          const unlockingScript = await unlocker.sign(tx, i)
          spends[i] = {
            unlockingScript: unlockingScript.toHex()
          }
        }
        const { txid } = await this.wallet.signAction({
          reference: signableTransaction.reference,
          spends
        })
        return `${txid as string}.0`
      } catch (_) {
        // Signing failed, relinquish original outputs
        for (let i = 0; i < results.outputs.length; i++) {
          await this.wallet.relinquishOutput({
            output: results.outputs[i].outpoint,
            basket: this.context
          })
        }
      }
    }
    const { txid } = await this.wallet.createAction({
      description: `Set ${key} in ${this.context}`,
      outputs: [{
        lockingScript: lockingScript.toHex(),
        satoshis: 1,
        outputDescription: 'Key-value token'
      }],
      options: {
        acceptDelayedBroadcast: false,
        randomizeOutputs: false
      }
    })
    return `${txid as string}.0`
  }

  /**
   * Removes the key-value pair associated with the given key.
   * It finds the existing output(s) for the key and spends them without creating a new output.
   * If multiple outputs exist, they are all spent in the same transaction.
   * If the key does not exist, it does nothing.
   * If signing the removal transaction fails, it relinquishes the original outputs instead of spending.
   *
   * @param {string} key - The key to remove.
   * @returns {Promise<string | void>} A promise that resolves to the txid of the removal transaction if successful.
   */
  async remove (key: string): Promise<OutpointString | undefined> {
    const results = await this.wallet.listOutputs({
      basket: this.context,
      tags: [key],
      include: 'entire transactions'
    })
    if (results.totalOutputs === 0) {
      return // Key not found, do nothing
    }
    const pushdrop = new PushDrop(this.wallet)
    try {
      const inputs: CreateActionInput[] = []
      for (let i = 0; i < results.outputs.length; i++) {
        inputs.push({
          outpoint: results.outputs[i].outpoint,
          unlockingScriptLength: 74,
          inputDescription: 'Previous key-value token'
        })
      }
      const { signableTransaction } = await this.wallet.createAction({
        description: `Update ${key} in ${this.context}`,
        inputBEEF: results.BEEF,
        inputs,
        options: {
          acceptDelayedBroadcast: false
        }
      })
      if (typeof signableTransaction !== 'object') {
        throw new Error('Wallet did not return a signable transaction when expected.')
      }
      const tx = Transaction.fromAtomicBEEF(signableTransaction.tx)
      const spends: Record<number, SignActionSpend> = {}
      for (let i = 0; i < results.outputs.length; i++) {
        const unlocker = pushdrop.unlock(
          [2, this.context],
          key,
          'self'
        )
        const unlockingScript = await unlocker.sign(tx, i)
        spends[i] = {
          unlockingScript: unlockingScript.toHex()
        }
      }
      const { txid } = await this.wallet.signAction({
        reference: signableTransaction.reference,
        spends
      })
      return txid
    } catch (_) {
      for (let i = 0; i < results.outputs.length; i++) {
        await this.wallet.relinquishOutput({
          output: results.outputs[i].outpoint,
          basket: this.context
        })
      }
    }
  }
}
