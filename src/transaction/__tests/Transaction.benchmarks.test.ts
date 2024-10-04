// __tests__/transaction.benchmark.test.ts

import Transaction from '../../../dist/cjs/src/transaction/Transaction'
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import { hash160 } from '../../../dist/cjs/src/primitives/Hash'
import P2PKH from '../../../dist/cjs/src/script/templates/P2PKH'
import { jest } from '@jest/globals'

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
    const publicKeyHash = hash160(publicKey.toDER())
    const p2pkh = new P2PKH()

    it('verifies a transaction with a deep input chain', async () => {
        // Create a deep chain of transactions (e.g., depth of 100)
        const depth = 100
        let tx = new Transaction()
        tx.addOutput({
            lockingScript: p2pkh.lock(publicKeyHash),
            satoshis: 100000
        })
        tx.merklePath = {
            // Mock merkle path verification
            blockHeight: 0,
            merkleRoot: '',
            hashes: [],
            verify: async () => true,
            toBinary: () => [],
            computeRoot: () => ''
        }

        // Build the chain
        for (let i = 0; i < depth; i++) {
            const newTx = new Transaction()
            newTx.addInput({
                sourceTransaction: tx,
                sourceOutputIndex: 0,
                unlockingScriptTemplate: p2pkh.unlock(privateKey),
                sequence: 0xffffffff
            })
            newTx.addOutput({
                lockingScript: p2pkh.lock(publicKeyHash),
                satoshis: 100000 - 1000 * (i + 1)
            })
            await newTx.sign()
            tx = newTx
        }

        // Measure verification time
        const timeTaken = await measureTime(async () => {
            const verified = await tx.verify('scripts only')
            expect(verified).toBe(true)
        })
        console.log(`Verification time for deep chain of depth ${depth}: ${timeTaken.toFixed(2)} ms`)
    })

    it('verifies a transaction with a wide input set', async () => {
        // Create a transaction with many inputs (e.g., 100 inputs)
        const inputCount = 100
        const sourceTxs = []

        // Create source transactions
        for (let i = 0; i < inputCount; i++) {
            const sourceTx = new Transaction()
            sourceTx.addOutput({
                lockingScript: p2pkh.lock(publicKeyHash),
                satoshis: 1000
            })
            sourceTx.merklePath = {
                blockHeight: 0,
                merkleRoot: '',
                hashes: [],
                verify: async () => true,
                toBinary: () => [],
                computeRoot: () => ''
            }
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
        console.log(`Verification time for wide transaction with ${inputCount} inputs: ${timeTaken.toFixed(2)} ms`)
    })

    it('verifies a large transaction with many inputs and outputs', async () => {
        const inputCount = 50
        const outputCount = 50
        const sourceTxs = []

        // Create source transactions
        for (let i = 0; i < inputCount; i++) {
            const sourceTx = new Transaction()
            sourceTx.addOutput({
                lockingScript: p2pkh.lock(publicKeyHash),
                satoshis: 2000
            })
            sourceTx.merklePath = {
                blockHeight: 0,
                merkleRoot: '',
                hashes: [],
                verify: async () => true,
                toBinary: () => [],
                computeRoot: () => ''
            }
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
        console.log(`Verification time for large transaction with ${inputCount} inputs and ${outputCount} outputs: ${timeTaken.toFixed(2)} ms`)
    })

    it('verifies a transaction with nested inputs (complex graph)', async () => {
        // Create a transaction graph where inputs come from transactions with multiple inputs
        const depth = 5
        const fanOut = 3
        let txs = []

        // Create base transactions
        for (let i = 0; i < fanOut; i++) {
            const baseTx = new Transaction()
            baseTx.addOutput({
                lockingScript: p2pkh.lock(publicKeyHash),
                satoshis: 100000
            })
            baseTx.merklePath = {
                blockHeight: 0,
                merkleRoot: '',
                hashes: [],
                verify: async () => true,
                toBinary: () => [],
                computeRoot: () => ''
            }
            txs.push(baseTx)
        }

        // Build the graph
        for (let d = 0; d < depth; d++) {
            const newTxs = []
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
                newTx.addOutput({
                    lockingScript: p2pkh.lock(publicKeyHash),
                    satoshis: tx.outputs[0].satoshis - 1000 * fanOut
                })
                await newTx.sign()
                newTxs.push(newTx)
            }
            txs = newTxs
        }

        // Take the last transaction for verification
        const finalTx = txs[0]

        // Measure verification time
        const timeTaken = await measureTime(async () => {
            const verified = await finalTx.verify('scripts only')
            expect(verified).toBe(true)
        })
        console.log(`Verification time for nested inputs with depth ${depth} and fan-out ${fanOut}: ${timeTaken.toFixed(2)} ms`)
    })
})
