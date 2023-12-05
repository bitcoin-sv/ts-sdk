import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'
import TransactionSignature from '../../../dist/cjs/src/primitives/TransactionSignature'
import { toHex, toArray } from '../../../dist/cjs/src/primitives/utils'
import Script from '../../../dist/cjs/src/script/Script'
import UnlockingScript from '../../../dist/cjs/src/script/UnlockingScript'
import LockingScript from '../../../dist/cjs/src/script/LockingScript'
import Transaction from '../../../dist/cjs/src/transaction/Transaction'
import { hash256, hash160 } from '../../../dist/cjs/src/primitives/Hash'
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import Curve from '../../../dist/cjs/src/primitives/Curve'
import P2PKH from '../../../dist/cjs/src/script/templates/P2PKH'

import sighashVectors from '../../primitives/__tests/sighash.vectors'
import invalidTransactions from './tx.invalid.vectors'
import validTransactions from './tx.valid.vectors'
import bigTX from './bigtx.vectors'

describe('Transaction', () => {
  const txIn = {
    sourceTXID: '0000000000000000000000000000000000000000000000000000000000000000',
    sourceOutputIndex: 0,
    unlockingScript: UnlockingScript.fromHex('ae'),
    sequence: 0
  }
  const txOut = {
    satoshis: BigNumber.fromHex('0500000000000000', 'be'),
    lockingScript: LockingScript.fromHex('ae')
  }
  const tx = new Transaction(0, [txIn], [txOut], 0)
  const txhex =
        '000000000100000000000000000000000000000000000000000000000000000000000000000000000001ae0000000001050000000000000001ae00000000'
  const txbuf = toArray(txhex, 'hex')

  const tx2idhex = '8c9aa966d35bfeaf031409e0001b90ccdafd8d859799eb945a3c515b8260bcf2'
  const tx2hex =
        '01000000029e8d016a7b0dc49a325922d05da1f916d1e4d4f0cb840c9727f3d22ce8d1363f000000008c493046022100e9318720bee5425378b4763b0427158b1051eec8b08442ce3fbfbf7b30202a44022100d4172239ebd701dae2fbaaccd9f038e7ca166707333427e3fb2a2865b19a7f27014104510c67f46d2cbb29476d1f0b794be4cb549ea59ab9cc1e731969a7bf5be95f7ad5e7f904e5ccf50a9dc1714df00fbeb794aa27aaff33260c1032d931a75c56f2ffffffffa3195e7a1ab665473ff717814f6881485dc8759bebe97e31c301ffe7933a656f020000008b48304502201c282f35f3e02a1f32d2089265ad4b561f07ea3c288169dedcf2f785e6065efa022100e8db18aadacb382eed13ee04708f00ba0a9c40e3b21cf91da8859d0f7d99e0c50141042b409e1ebbb43875be5edde9c452c82c01e3903d38fa4fd89f3887a52cb8aea9dc8aec7e2c9d5b3609c03eb16259a2537135a1bf0f9c5fbbcbdbaf83ba402442ffffffff02206b1000000000001976a91420bb5c3bfaef0231dc05190e7f1c8e22e098991e88acf0ca0100000000001976a9149e3e2d23973a04ec1b02be97c30ab9f2f27c3b2c88ac00000000'
  const tx2buf = toArray(tx2hex, 'hex')

  it('should make a new transaction', () => {
    let tx = new Transaction()
    expect(tx).toBeDefined()
    tx = new Transaction()
    expect(tx).toBeDefined()

    expect(Transaction.fromBinary(txbuf).toHex()).toEqual(txhex)

    // should set known defaults
    expect(tx.version).toEqual(1)
    expect(tx.inputs.length).toEqual(0)
    expect(tx.outputs.length).toEqual(0)
    expect(tx.lockTime).toEqual(0)
  })

  describe('#constructor', () => {
    it('should set these known defaults', () => {
      const tx = new Transaction()
      expect(tx.version).toEqual(1)
      expect(tx.inputs.length).toEqual(0)
      expect(tx.outputs.length).toEqual(0)
      expect(tx.lockTime).toEqual(0)
    })
  })

  describe('#fromHex', () => {
    it('should recover from this known tx', () => {
      expect(Transaction.fromHex(txhex).toHex()).toEqual(txhex)
    })

    it('should recover from this known tx from the blockchain', () => {
      expect(Transaction.fromHex(tx2hex).toHex()).toEqual(tx2hex)
    })
  })

  describe('#fromBinary', () => {
    it('should recover from this known tx', () => {
      expect(toHex(Transaction.fromBinary(txbuf).toBinary())).toEqual(txhex)
    })

    it('should recover from this known tx from the blockchain', () => {
      expect(toHex(Transaction.fromBinary(tx2buf).toBinary())).toEqual(tx2hex)
    })
  })

  describe('#toHex', () => {
    it('should produce this known tx', () => {
      expect(Transaction.fromHex(txhex).toHex()).toEqual(txhex)
    })
  })

  describe('#toBinary', () => {
    it('should produce this known tx', () => {
      expect(toHex(Transaction.fromBinary(txbuf).toBinary())).toEqual(txhex)
    })
  })

  describe('#hash', () => {
    it('should correctly calculate the hash of this known transaction', () => {
      const tx = Transaction.fromBinary(tx2buf)
      expect(toHex(tx.hash().reverse())).toEqual(tx2idhex)
    })
  })

  describe('#id', () => {
    it('should correctly calculate the txid of this known transaction', () => {
      const tx = Transaction.fromBinary(tx2buf)
      expect(tx.id('hex')).toEqual(tx2idhex)
    })
  })

  describe('#addInput', () => {
    it('should add an input', () => {
      const txIn = {
        sourceTXID: '0000000000000000000000000000000000000000000000000000000000000000',
        sourceOutputIndex: 0,
        unlockingScript: new UnlockingScript(),
        sequence: 0xffffffff
      }
      const tx = new Transaction()
      expect(tx.inputs.length).toEqual(0)
      tx.addInput(txIn)
      expect(tx.inputs.length).toEqual(1)
    })
  })

  describe('#addOutput', () => {
    it('should add an output', () => {
      const txOut = {
        lockingScript: new LockingScript(),
        satoshis: new BigNumber(0)
      }
      const tx = new Transaction()
      expect(tx.outputs.length).toEqual(0)
      tx.addOutput(txOut)
      expect(tx.outputs.length).toEqual(1)
    })
  })

  describe('Signing', () => {
    it('Signs unlocking script templates, hydrating the scripts', async () => {
      const privateKey = new PrivateKey(1)
      const publicKey = new Curve().g.mul(privateKey)
      const publicKeyHash = hash160(publicKey.encode(true)) as number[]
      const p2pkh = new P2PKH()
      const sourceTx = new Transaction(1, [], [{
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: new BigNumber(4000)
      }], 0)
      const spendTx = new Transaction(1, [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      }], [{
        satoshis: new BigNumber(1000),
        lockingScript: p2pkh.lock(publicKeyHash)
      }, {
        lockingScript: p2pkh.lock(publicKeyHash),
        change: true
      }], 0)
      expect(spendTx.inputs[0].unlockingScript).not.toBeDefined()
      await spendTx.fee()
      await spendTx.sign()
      expect(spendTx.inputs[0].unlockingScript).toBeDefined()
      // P2PKH unlocking scripts have two chunks (the signature and public key)
      expect(spendTx.inputs[0].unlockingScript.chunks.length).toBe(2)
    })
    it('Throws an Error if signing before the fee is computed', async () => {
      const privateKey = new PrivateKey(1)
      const publicKey = new Curve().g.mul(privateKey)
      const publicKeyHash = hash160(publicKey.encode(true)) as number[]
      const p2pkh = new P2PKH()
      const sourceTx = new Transaction(1, [], [{
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: new BigNumber(4000)
      }], 0)
      const spendTx = new Transaction(1, [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      }], [{
        satoshis: new BigNumber(1000),
        lockingScript: p2pkh.lock(publicKeyHash)
      }, {
        lockingScript: p2pkh.lock(publicKeyHash),
        change: true
      }], 0)
      await expect(spendTx.sign()).rejects.toThrow()
    })
  })

  describe('Fees', () => {
    it('Computes fees with the default fee model', async () => {
      const privateKey = new PrivateKey(1)
      const publicKey = new Curve().g.mul(privateKey)
      const publicKeyHash = hash160(publicKey.encode(true)) as number[]
      const p2pkh = new P2PKH()
      const sourceTx = new Transaction(1, [], [{
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: new BigNumber(4000)
      }], 0)
      const spendTx = new Transaction(1, [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      }], [{
        satoshis: new BigNumber(1000),
        lockingScript: p2pkh.lock(publicKeyHash)
      }, {
        lockingScript: p2pkh.lock(publicKeyHash),
        change: true
      }], 0)
      expect(spendTx.outputs[1].satoshis).not.toBeDefined()
      await spendTx.fee()
      // Transaction size is 225 bytes for one-input two-output P2PKH.
      // Default fee rate is 10 sat/kb = 2.25 sats (round up to 3).
      // 4000 sats in - 1000 sats out - 3 sats fee = expected 2997 sats change.
      expect(spendTx.outputs[1].satoshis.toNumber()).toEqual(2997)
    })
    it('Computes fees with a custom fee model', async () => {
      const privateKey = new PrivateKey(1)
      const publicKey = new Curve().g.mul(privateKey)
      const publicKeyHash = hash160(publicKey.encode(true)) as number[]
      const p2pkh = new P2PKH()
      const sourceTx = new Transaction(1, [], [{
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: new BigNumber(4000)
      }], 0)
      const spendTx = new Transaction(1, [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      }], [{
        satoshis: new BigNumber(1000),
        lockingScript: p2pkh.lock(publicKeyHash)
      }, {
        lockingScript: p2pkh.lock(publicKeyHash),
        change: true
      }], 0)
      expect(spendTx.outputs[1].satoshis).not.toBeDefined()
      await spendTx.fee({
        // Our custom fee model will always charge 1033 sats for a tx.
        computeFee: async () => new BigNumber(1033)
      })
      // 4000 sats in - 1000 sats out - 1033 sats fee = expected 1967 sats change
      expect(spendTx.outputs[1].satoshis.toNumber()).toEqual(1967)
    })
    it('Distributes change among multiple change outputs', async () => {
      const privateKey = new PrivateKey(1)
      const publicKey = new Curve().g.mul(privateKey)
      const publicKeyHash = hash160(publicKey.encode(true)) as number[]
      const p2pkh = new P2PKH()
      const sourceTx = new Transaction(1, [], [{
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: new BigNumber(4000)
      }], 0)
      const spendTx = new Transaction(1, [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      }], [{
        satoshis: new BigNumber(1000),
        lockingScript: p2pkh.lock(publicKeyHash)
      }, {
        lockingScript: p2pkh.lock(publicKeyHash),
        change: true
      }, {
        lockingScript: p2pkh.lock(publicKeyHash),
        change: true
      }], 0)
      expect(spendTx.outputs[1].satoshis).not.toBeDefined()
      expect(spendTx.outputs[2].satoshis).not.toBeDefined()
      await spendTx.fee({
        // Our custom fee model will always charge 1033 sats for a tx.
        computeFee: async () => new BigNumber(1033)
      })
      // 4000 sats in - 1000 sats out - 1033 sats fee = expected 1967 sats change
      // Divide by 2 (no remainder) = 983 sats per change output
      expect(spendTx.outputs[1].satoshis.toNumber()).toEqual(983)
      expect(spendTx.outputs[2].satoshis.toNumber()).toEqual(983)
    })
  })

  describe('Broadcast', () => {
    it('Broadcasts with the provided Broadcaster instance', async () => {
      const mockBroadcast = jest.fn(() => 'MOCK_RV')
      const tx = new Transaction()
      const rv = await tx.broadcast({
        broadcast: mockBroadcast
      })
      expect(mockBroadcast).toHaveBeenCalledWith(tx)
      expect(rv).toEqual('MOCK_RV')
    })
  })

  describe('vectors: a 1mb transaction', () => {
    it('should find the correct id of this (valid, on the blockchain) 1 mb transaction', () => {
      const txidhex = bigTX.txidhex
      const txhex = bigTX.txhex
      const tx = Transaction.fromHex(txhex)
      const txid = tx.id('hex')
      expect(txid).toEqual(txidhex)
    })
  })

  describe('vectors: sighash and serialization', () => {
    sighashVectors.forEach((vector, i) => {
      if (i === 0) {
        return
      }
      it(`should pass bitcoin-abc sighash test vector ${i}`, () => {
        const txbuf = toArray(vector[0], 'hex')
        const scriptbuf = toArray(vector[1], 'hex')
        const subScript = Script.fromBinary(scriptbuf)
        const nIn = (vector[2]) as number
        const nHashType = (vector[3]) as number
        const sighashBuf = toArray(vector[4], 'hex')
        const tx = Transaction.fromBinary(txbuf)

        // make sure transacion to/from buffer is isomorphic
        expect(toHex(tx.toBinary())).toEqual(toHex(txbuf))

        // sighash ought to be correct
        const valueBn = new BigNumber(0)
        const otherInputs = [...tx.inputs]
        const [input] = otherInputs.splice(nIn, 1)
        const preimage = TransactionSignature.format({
          sourceTXID: input.sourceTXID,
          sourceOutputIndex: input.sourceOutputIndex,
          sourceSatoshis: valueBn,
          transactionVersion: tx.version,
          otherInputs,
          outputs: tx.outputs,
          inputIndex: nIn,
          subscript: subScript,
          inputSequence: input.sequence,
          lockTime: tx.lockTime,
          scope: nHashType
        })
        const hash = hash256(preimage) as number[]
        hash.reverse()
        expect(toHex(hash)).toEqual(toHex(sighashBuf))
      })
    })

    validTransactions.forEach((vector, i) => {
      if (vector.length === 1) {
        return
      }
      it(`should correctly serialized/deserialize tx_valid test vector ${i}`, () => {
        const expectedHex = vector[1]
        const expectedBin = toArray(vector[1], 'hex')
        const actualTX = Transaction.fromBinary(expectedBin)
        const actualBin = actualTX.toBinary()
        const actualHex = toHex(actualBin)
        expect(actualHex).toEqual(expectedHex)
      })
    })

    invalidTransactions.forEach((vector, i) => {
      if (vector.length === 1) {
        return
      }
      it(`should correctly serialized/deserialize tx_invalid test vector ${i}`, () => {
        const expectedHex = vector[1]
        const expectedBin = toArray(vector[1], 'hex')
        const actualTX = Transaction.fromBinary(expectedBin)
        const actualBin = actualTX.toBinary()
        const actualHex = toHex(actualBin)
        expect(actualHex).toEqual(expectedHex)
      })
    })
  })
})
