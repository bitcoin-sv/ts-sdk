// __tests__/transaction.benchmark.test.ts

import Transaction from '../../transaction/Transaction'
import PrivateKey from '../../primitives/PrivateKey'
import P2PKH from '../../script/templates/P2PKH'
import { jest } from '@jest/globals'
import MerklePath from '../MerklePath'

jest.setTimeout(60000) // Increase timeout for benchmarking tests if necessary

// Helper function to measure execution time
async function measureTime(fn: () => Promise<void>): Promise<number> {
  const start = process.hrtime()
  await fn()
  const diff = process.hrtime(start)
  const timeInMs = diff[0] * 1000 + diff[1] / 1e6
  return timeInMs
}

describe('Transaction Verification Benchmark', () => {
  const privateKey = new PrivateKey(1)
  const publicKey = privateKey.toPublicKey()
  const publicKeyHash = publicKey.toHash()
  const p2pkh = new P2PKH()

  it('verifies a transaction with a deep input chain', async () => {
    const depth = 100
    let tx = new Transaction()
    tx.addOutput({
      lockingScript: p2pkh.lock(publicKeyHash),
      satoshis: 100000
    })
    const blockHeight = 1631619
    const txid = tx.hash('hex') as string

    const path = [
      [
        { offset: 0, hash: txid, txid: true, duplicate: false },
        { offset: 1, hash: 'otherHash1', txid: false, duplicate: false }
      ],
      [{ offset: 1, hash: 'mergedHash1', txid: false, duplicate: false }]
    ]

    const merklePath = new MerklePath(blockHeight, path)

    // Assign the MerklePath to the transaction
    tx.merklePath = merklePath

    for (let i = 1; i < depth + 1; i++) {
      const newTx = new Transaction()
      newTx.addInput({
        sourceTransaction: tx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      })
      newTx.addOutput({
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: 100000 - i * 10
      })
      await newTx.sign()
      tx = newTx
    }
  })

  it('verifies a transaction with a wide input set', async () => {
    // Create a transaction with many inputs (e.g., 100 inputs)
    const inputCount = 100
    const sourceTxs: Transaction[] = []

    // Create source transactions
    for (let i = 0; i < inputCount; i++) {
      const sourceTx = new Transaction()
      sourceTx.addOutput({
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: 1000
      })
      const blockHeight = 1631619
      const txid = sourceTx.hash('hex') as string
      const path = [
        [
          { offset: 0, hash: txid, txid: true, duplicate: false },
          { offset: 1, hash: 'otherHash1', txid: false, duplicate: false }
        ],
        [{ offset: 1, hash: 'mergedHash1', txid: false, duplicate: false }]
      ]

      const merklePath = new MerklePath(blockHeight, path)

      // Assign the MerklePath to the transaction
      sourceTx.merklePath = merklePath
      sourceTxs.push(sourceTx)
    }

    // Create transaction with many inputs
    const tx = new Transaction()
    for (let i = 0; i < inputCount; i++) {
      tx.addInput({
        sourceTransaction: sourceTxs[i],
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      })
    }
    tx.addOutput({
      lockingScript: p2pkh.lock(publicKeyHash),
      satoshis: inputCount * 1000 - 1000
    })
    await tx.sign()

    // Measure verification time
    const timeTaken = await measureTime(async () => {
      const verified = await tx.verify('scripts only')
      expect(verified).toBe(true)
    })
  })

  it('verifies a large transaction with many inputs and outputs', async () => {
    const inputCount = 50
    const outputCount = 50
    const sourceTxs: Transaction[] = []

    // Create source transactions
    for (let i = 0; i < inputCount; i++) {
      const sourceTx = new Transaction()
      sourceTx.addOutput({
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: 2000
      })
      const blockHeight = 1631619
      const txid = sourceTx.hash('hex') as string
      const path = [
        [
          { offset: 0, hash: txid, txid: true, duplicate: false },
          { offset: 1, hash: 'otherHash1', txid: false, duplicate: false }
        ],
        [{ offset: 1, hash: 'mergedHash1', txid: false, duplicate: false }]
      ]

      const merklePath = new MerklePath(blockHeight, path)

      // Assign the MerklePath to the transaction
      sourceTx.merklePath = merklePath
      sourceTxs.push(sourceTx)
    }

    // Create transaction with many inputs and outputs
    const tx = new Transaction()
    for (let i = 0; i < inputCount; i++) {
      tx.addInput({
        sourceTransaction: sourceTxs[i],
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      })
    }
    for (let i = 0; i < outputCount; i++) {
      tx.addOutput({
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: 1000
      })
    }
    await tx.sign()

    // Measure verification time
    const timeTaken = await measureTime(async () => {
      const verified = await tx.verify('scripts only')
      expect(verified).toBe(true)
    })
  })

  it('verifies a transaction with nested inputs (complex graph)', async () => {
    // Create a transaction graph where inputs come from transactions with multiple inputs
    const depth = 5
    const fanOut = 3
    let txs: Transaction[] = []

    // Create base transactions
    for (let i = 0; i < fanOut; i++) {
      const baseTx = new Transaction()
      baseTx.addOutput({
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: 100000
      })
      const blockHeight = 1631619
      const txid = baseTx.hash('hex') as string
      const path = [
        [
          { offset: 0, hash: txid, txid: true, duplicate: false },
          { offset: 1, hash: 'otherHash1', txid: false, duplicate: false }
        ],
        [{ offset: 1, hash: 'mergedHash1', txid: false, duplicate: false }]
      ]

      const merklePath = new MerklePath(blockHeight, path)

      // Assign the MerklePath to the transaction
      baseTx.merklePath = merklePath
      txs.push(baseTx)
    }

    // Build the graph
    for (let d = 0; d < depth; d++) {
      const newTxs: Transaction[] = [] // Ensure newTxs is properly typed
      for (const tx of txs) {
        const newTx = new Transaction()
        for (let i = 0; i < fanOut; i++) {
          newTx.addInput({
            sourceTransaction: tx,
            sourceOutputIndex: 0,
            unlockingScriptTemplate: p2pkh.unlock(privateKey),
            sequence: 0xffffffff
          })
        }

        // Ensure tx.outputs[0] exists before accessing satoshis
        newTx.addOutput({
          lockingScript: p2pkh.lock(publicKeyHash),
          satoshis: (tx.outputs[0]?.satoshis ?? 0) - 1000 * fanOut
        })

        await newTx.sign()
        newTxs.push(newTx)
      }
      txs = newTxs // Reassign txs with newly created transactions
    }

    // Take the last transaction for verification
    const finalTx = txs[0]

    // Measure verification time
    const timeTaken = await measureTime(async () => {
      const verified = await finalTx.verify('scripts only')
      expect(verified).toBe(true)
    })
  })
})
