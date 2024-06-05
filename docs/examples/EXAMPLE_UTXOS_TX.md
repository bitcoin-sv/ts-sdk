# Example: Creating a Transaction from UTXOs

This guide shows how to create a transaction from UTXOs fetched from WhatsOnChain.
It also shows how to set a fixed fee and build OP_RETURN outputs.

## The UTXOs format

Although its not a standard, UTXOs can be fetched from apis like [WhatsOnChain](https://whatsonchain.com/) in a similar format.

```typescript
/** Utxos from whatsonchain api*/
const utxos = [
  {
    height: 1600000,
    tx_pos: 0,
    tx_hash: '672dd6a93fa5d7ba6794e0bdf8b479440b95a55ec10ad3d9e03585ecb5628d8f',
    value: 10000
  },
  {
    height: 1600000,
    tx_pos: 0,
    tx_hash: 'f33505acf37a7726cc37d391bc6f889b8684ac2a2d581c4be2a4b1c8b46609bb',
    value: 10000
  },
]
```

## Building a transaction from UTXOs

The first step is to build a transaction and add inputs from the utxos related to the private key `priv`.

```typescript
import { Transaction, PrivateKey, P2PKH, LockingScript, Utils, OP } from '@bsv/sdk'

const priv = PrivateKey.fromWif('...')
const tx = new Transaction()

utxos.forEach(utxo => {
  const script = new P2PKH().lock(priv.toPublicKey().toHash())
  tx.addInput({
    sourceTXID: utxo.tx_hash,
    sourceOutputIndex: utxo.tx_pos,
    sourceSatoshis: utxo.value,
    unlockingScriptTemplate: new P2PKH()
      .unlock(priv, 'all', false, utxo.value, script)
  })
})
```

## Adding the outputs

Next an OP_RETURN output script is added along with a change address to the original `priv`, note that addresses should not be reused as its not a good practice.

```typescript
const data = Utils.toArray('some data')
const script = [
  { op: OP.OP_FALSE },
  { op: OP.OP_RETURN },
  { op: data.length, data }
]

// Add the new OP_RETURN script as output
tx.addOutput({
  lockingScript: new LockingScript(script),
  satoshis: 0
})

// Add a change output to the used private key
tx.addOutput({
  lockingScript: new P2PKH().lock(priv.toAddress()),
  change: true
})
```

## Finalize the transaction

Last step is to set the transaction fee, sign the transaction and broadcast it.

```typescript
await tx.fee(10) // a fixed fee of 10 sats is used
await tx.sign()
await tx.broadcast()
```

That concludes this basic example but common practice to create a transaction from UTXOs. Refer to other examples for instructions on how to calculate fees from transaction size, use different locking script templates, different broadcast services and more.