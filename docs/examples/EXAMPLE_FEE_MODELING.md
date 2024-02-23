# Example: Creating a Custom Transaction Fee Model

Bitcoin miners accept transactions into a block when they pay an appropriate fee. The transaction fee is simply the difference between the amounts used as input, and the amounts claimed by transaction outputs. This is to say, any amount of Bitcoins that are unclaimed (left over) after all transaction outputs have been fulfilled is given to the miner who solves the block in which the transaction is included.

To date, fees have generally been measured in satoshis per kilobyte of block space used by the transaction. However, the SDK allows you to create custom fee models that take other factors into account. This guide will show you the default fee model, and discuss how it might be customized in the future. Note that you'll need to consult with various miners if considering an alternative fee model, to make sure your transactions would still be included in the blockchain.

## Default Fee Model

The `.fee()` method on a `Transaction` object takes a fee model as an optional parameter. The function of a fee model is to compute the number of satoshis that the transaction should pay in fees. Here's the interface all fee models need to follow:

```typescript
/**
 * Represents the interface for a transaction fee model.
 * This interface defines a standard method for computing a fee when given a transaction.
 *
 * @interface
 * @property {function} computeFee - A function that takes a Transaction object and returns a BigNumber representing the number of satoshis the transaction should cost.
 */
export default interface FeeModel {
  computeFee: (transaction: Transaction) => Promise<number>
}

```

In short, a fee model is an object with a `computeFee` function that, when called with a `Transaction` as its first and only parameter, will return a `Promise` for a `number` of satoshis.

The default fee model, used if no other model is provided, looks like this:

```typescript
/**
 * Represents the "satoshis per kilobyte" transaction fee model.
 */
export default class SatoshisPerKilobyte implements FeeModel {
  /**
   * @property
   * Denotes the number of satoshis paid per kilobyte of transaction size.
   */
  value: number

  /**
   * Constructs an instance of the sat/kb fee model.
   *
   * @param {number} value - The number of satoshis per kilobyte to charge as a fee.
   */
  constructor(value: number) {
    this.value = value
  }

  /**
   * Computes the fee for a given transaction.
   *
   * @param tx The transaction for which a fee is to be computed.
   * @returns The fee in satoshis for the transaction, as a number.
   */
  async computeFee(tx: Transaction): Promise<number> {
    const getVarIntSize = (i: number): number => {
      if (i > 2 ** 32) {
        return 9
      } else if (i > 2 ** 16) {
        return 5
      } else if (i > 253) {
        return 3
      } else {
        return 1
      }
    }
    // Compute the (potentially estimated) size of the transaction
    let size = 4 // version
    size += getVarIntSize(tx.inputs.length) // number of inputs
    for (let i = 0; i < tx.inputs.length; i++) {
      const input = tx.inputs[i]
      size += 40 // txid, output index, sequence number
      let scriptLength: number
      if (typeof input.unlockingScript === 'object') {
        scriptLength = input.unlockingScript.toBinary().length
      } else if (typeof input.unlockingScriptTemplate === 'object') {
        scriptLength = await input.unlockingScriptTemplate.estimateLength(tx, i)
      } else {
        throw new Error('All inputs must have an unlocking script or an unlocking script template for sat/kb fee computation.')
      }
      size += getVarIntSize(scriptLength) // unlocking script length
      size += scriptLength // unlocking script
    }
    size += getVarIntSize(tx.outputs.length) // number of outputs
    for (const out of tx.outputs) {
      size += 8 // satoshis
      const length = out.lockingScript.toBinary().length
      size += getVarIntSize(length) // script length
      size += length // script
    }
    size += 4 // lock time
    // We'll use Math.ceil to ensure the miners get the extra satoshi.
    const fee = Math.ceil((size / 1000) * this.value)
    return fee
  }
}
```

Here, you can see we're computing the size of the transaction in bytes, then computing the number of satoshis based on the number of kilobytes.

## Making Adjustments

Let's modify our fee model to check for a few custom cases, just as a purely theoretical example:

- If the version of the transaction is 3301, the transaction is free.
- If there are more than 3x as many inputs as there are outputs (the transaction is helping shrink the number of UTXOs), the transaction gets a 20% discount.
- If there are more than 5x as many outputs as there are inputs, the transaction is 10% more expensive.
- Other than that, the rules are the same as the Satoshis per Kilobyte fee model.

With these rules in place, let's build a custom fee model!

```typescript
/**
 * Represents the "example" transaction fee model.
 */
export default class Example implements FeeModel {
  /**
   * @property
   * Denotes the base number of satoshis paid per kilobyte of transaction size.
   */
  value: number

  /**
   * Constructs an instance of the example fee model.
   *
   * @param {number} value - The base number of satoshis per kilobyte to charge as a fee.
   */
  constructor(value: number) {
    this.value = value
  }

  /**
   * Computes the fee for a given transaction.
   *
   * @param tx The transaction for which a fee is to be computed.
   * @returns The fee in satoshis for the transaction, as a number.
   */
  async computeFee(tx: Transaction): Promise<number> {
    const getVarIntSize = (i: number): number => {
      if (i > 2 ** 32) {
        return 9
      } else if (i > 2 ** 16) {
        return 5
      } else if (i > 253) {
        return 3
      } else {
        return 1
      }
    }

    // Version 3301 transactions are free :)
    if (tx.version === 3301) {
        return 0
    }

    // Compute the (potentially estimated) size of the transaction
    let size = 4 // version
    size += getVarIntSize(tx.inputs.length) // number of inputs
    for (let i = 0; i < tx.inputs.length; i++) {
      const input = tx.inputs[i]
      size += 40 // txid, output index, sequence number
      let scriptLength: number
      if (typeof input.unlockingScript === 'object') {
        scriptLength = input.unlockingScript.toBinary().length
      } else if (typeof input.unlockingScriptTemplate === 'object') {
        scriptLength = await input.unlockingScriptTemplate.estimateLength(tx, i)
      } else {
        throw new Error('All inputs must have an unlocking script or an unlocking script template for sat/kb fee computation.')
      }
      size += getVarIntSize(scriptLength) // unlocking script length
      size += scriptLength // unlocking script
    }
    size += getVarIntSize(tx.outputs.length) // number of outputs
    for (const out of tx.outputs) {
      size += 8 // satoshis
      const length = out.lockingScript.toBinary().length
      size += getVarIntSize(length) // script length
      size += length // script
    }
    size += 4 // lock time
    let fee = ((size / 1000) * this.value)

    // Now we apply our input and output rules
    // For the inputs incentive
    if (tx.inputs.length / 3 >= tx.outputs.length) {
        fee *= 0.8
    }
    // For the outputs penalty
    if (tx.outputs.length / 5 >= tx.inputs.length) {
        fee *= 1.1
    }

    // We'll use Math.ceil to ensure the miners get the extra satoshi.
    return Math.ceil(fee)
  }
}
```

Now. when you create a new transaction and call the `.ee()` method with this fee model, it will follow the rules we have set above!
