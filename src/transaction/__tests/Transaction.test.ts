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
import fromUtxo from '../../../dist/cjs/src/compat/Utxo'

import sighashVectors from '../../primitives/__tests/sighash.vectors'
import invalidTransactions from './tx.invalid.vectors'
import validTransactions from './tx.valid.vectors'
import bigTX from './bigtx.vectors'

const BRC62Hex = '0100beef01fe636d0c0007021400fe507c0c7aa754cef1f7889d5fd395cf1f785dd7de98eed895dbedfe4e5bc70d1502ac4e164f5bc16746bb0868404292ac8318bbac3800e4aad13a014da427adce3e010b00bc4ff395efd11719b277694cface5aa50d085a0bb81f613f70313acd28cf4557010400574b2d9142b8d28b61d88e3b2c3f44d858411356b49a28a4643b6d1a6a092a5201030051a05fc84d531b5d250c23f4f886f6812f9fe3f402d61607f977b4ecd2701c19010000fd781529d58fc2523cf396a7f25440b409857e7e221766c57214b1d38c7b481f01010062f542f45ea3660f86c013ced80534cb5fd4c19d66c56e7e8c5d4bf2d40acc5e010100b121e91836fd7cd5102b654e9f72f3cf6fdbfd0b161c53a9c54b12c841126331020100000001cd4e4cac3c7b56920d1e7655e7e260d31f29d9a388d04910f1bbd72304a79029010000006b483045022100e75279a205a547c445719420aa3138bf14743e3f42618e5f86a19bde14bb95f7022064777d34776b05d816daf1699493fcdf2ef5a5ab1ad710d9c97bfb5b8f7cef3641210263e2dee22b1ddc5e11f6fab8bcd2378bdd19580d640501ea956ec0e786f93e76ffffffff013e660000000000001976a9146bfd5c7fbe21529d45803dbcf0c87dd3c71efbc288ac0000000001000100000001ac4e164f5bc16746bb0868404292ac8318bbac3800e4aad13a014da427adce3e000000006a47304402203a61a2e931612b4bda08d541cfb980885173b8dcf64a3471238ae7abcd368d6402204cbf24f04b9aa2256d8901f0ed97866603d2be8324c2bfb7a37bf8fc90edd5b441210263e2dee22b1ddc5e11f6fab8bcd2378bdd19580d640501ea956ec0e786f93e76ffffffff013c660000000000001976a9146bfd5c7fbe21529d45803dbcf0c87dd3c71efbc288ac0000000000'
const MerkleRootFromBEEF = 'bb6f640cc4ee56bf38eb5a1969ac0c16caa2d3d202b22bf3735d10eec0ca6e00'

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

  describe('#parseScriptOffsets', () => {
    it('should match sliced scripts to parsed scripts', async () => {
      const tx = Transaction.fromBinary(tx2buf)
      expect(tx.id("hex")).toBe(tx2idhex)
      const r = Transaction.parseScriptOffsets(tx2buf)
      expect(r.inputs.length).toBe(2)
      expect(r.outputs.length).toBe(2)
      for (let vin = 0; vin < 2; vin++) {
        const i = r.inputs[vin]
        const script = tx2buf.slice(i.offset, i.length + i.offset)
        expect(script).toEqual(tx.inputs[vin].unlockingScript?.toBinary())
      }
      for (let vout = 0; vout < 2; vout++) {
        const o = r.outputs[vout]
        const script = tx2buf.slice(o.offset, o.length + o.offset)
        expect(script).toEqual(tx.outputs[vout].lockingScript?.toBinary())
      }
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
        satoshis: 1
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
        satoshis: 4000
      }], 0)
      const spendTx = new Transaction(1, [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      }], [{
        satoshis: 1000,
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
    it('Signs a large number of unlocking script templates in a timely manner', async () => {
      const privateKey = new PrivateKey(134)
      const publicKey = new Curve().g.mul(privateKey)
      const publicKeyHash = hash160(publicKey.encode(true)) as number[]
      const p2pkh = new P2PKH()
      const spendCount = 30
      const output = {
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: 4000
      }
      const manyOutputs = [output]
      for (let i = 1; i < spendCount; i++) {
        manyOutputs[i] = {
          lockingScript: p2pkh.lock(publicKeyHash),
          satoshis: 4000
        }
      }
      const sourceTx = new Transaction(1, [], manyOutputs, 0)
      const input = {
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      }
      const manyInputs = [input]
      for (let i = 1; i < spendCount; i++) {
        manyInputs[i] = {
          sourceTransaction: sourceTx,
          sourceOutputIndex: i,
          unlockingScriptTemplate: p2pkh.unlock(privateKey),
          sequence: 0xffffffff
        }
      }
      const spendTx = new Transaction(1, manyInputs, [{
        satoshis: 1000,
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
      const publicKeyHash = hash160(publicKey.encode(true), 'hex') as unknown as number[]
      const p2pkh = new P2PKH()
      const sourceTx = new Transaction(1, [], [{
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: 4000
      }], 0)
      const spendTx = new Transaction(1, [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      }], [{
        satoshis: 1000,
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
        satoshis: 4000
      }], 0)
      const spendTx = new Transaction(1, [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      }], [{
        satoshis: 1000,
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
      expect(spendTx.outputs[1].satoshis).toEqual(2997)
    })
    it('Computes fees with a custom fee model', async () => {
      const privateKey = new PrivateKey(1)
      const publicKey = new Curve().g.mul(privateKey)
      const publicKeyHash = hash160(publicKey.encode(true)) as number[]
      const p2pkh = new P2PKH()
      const sourceTx = new Transaction(1, [], [{
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: 4000
      }], 0)
      const spendTx = new Transaction(1, [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      }], [{
        satoshis: 1000,
        lockingScript: p2pkh.lock(publicKeyHash)
      }, {
        lockingScript: p2pkh.lock(publicKeyHash),
        change: true
      }], 0)
      expect(spendTx.outputs[1].satoshis).not.toBeDefined()
      await spendTx.fee({
        // Our custom fee model will always charge 1033 sats for a tx.
        computeFee: async () => 1033
      })
      // 4000 sats in - 1000 sats out - 1033 sats fee = expected 1967 sats change
      expect(spendTx.outputs[1].satoshis).toEqual(1967)
    })
    it('Computes fee using FixedFee model', async () => {
      const privateKey = new PrivateKey(1)
      const publicKey = new Curve().g.mul(privateKey)
      const publicKeyHash = hash160(publicKey.encode(true)) as number[]
      const p2pkh = new P2PKH()
      const sourceTx = new Transaction(1, [], [{
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: 4000
      }], 0)
      const spendTx = new Transaction(1, [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      }], [{
        satoshis: 1000,
        lockingScript: p2pkh.lock(publicKeyHash)
      }, {
        lockingScript: p2pkh.lock(publicKeyHash),
        change: true
      }], 0)
      expect(spendTx.outputs[1].satoshis).not.toBeDefined()
      await spendTx.fee(1033)
      // 4000 sats in - 1000 sats out - 1033 sats fee = expected 1967 sats change
      expect(spendTx.outputs[1].satoshis).toEqual(1967)
    })
    it('Distributes change among multiple change outputs', async () => {
      const privateKey = new PrivateKey(1)
      const publicKey = new Curve().g.mul(privateKey)
      const publicKeyHash = hash160(publicKey.encode(true)) as number[]
      const p2pkh = new P2PKH()
      const sourceTx = new Transaction(1, [], [{
        lockingScript: p2pkh.lock(publicKeyHash),
        satoshis: 4000
      }], 0)
      const spendTx = new Transaction(1, [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        unlockingScriptTemplate: p2pkh.unlock(privateKey),
        sequence: 0xffffffff
      }], [{
        satoshis: 1000,
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
        computeFee: async () => 1033
      })
      // 4000 sats in - 1000 sats out - 1033 sats fee = expected 1967 sats change
      // Divide by 2 (no remainder) = 983 sats per change output
      expect(spendTx.outputs[1].satoshis).toEqual(983)
      expect(spendTx.outputs[2].satoshis).toEqual(983)
    })
    it('Calculates fee for utxo based transaction', async () => {
      const utxos = [ // WoC format utxos
        {
          height: 1600000,
          tx_pos: 0,
          tx_hash: '672dd6a93fa5d7ba6794e0bdf8b479440b95a55ec10ad3d9e03585ecb5628d8d',
          value: 10000
        },
        {
          height: 1600000,
          tx_pos: 0,
          tx_hash: 'f33505acf37a7726cc37d391bc6f889b8684ac2a2d581c4be2a4b1c8b46609bc',
          value: 10000
        }
      ]
      const priv = PrivateKey.fromRandom()
      const tx = new Transaction()
      utxos.forEach(utxo => {
        const u = {
          txid: utxo.tx_hash,
          vout: utxo.tx_pos,
          script: new P2PKH().lock(priv.toPublicKey().toHash()).toHex(),
          satoshis: utxo.value
        }
        tx.addInput(fromUtxo(u, new P2PKH().unlock(priv)))
      })
      tx.addOutput({
        lockingScript: new P2PKH().lock(priv.toAddress()),
        change: true
      })
      await tx.fee({ computeFee: async () => 10 })
      expect(tx.outputs[0].satoshis).toEqual(20000 - 10)
      expect(tx.getFee()).toEqual(10)
    })
  })

  describe('Broadcast', () => {
    it('Broadcasts with the default Broadcaster instance', async () => {
      const mockedFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {
          get (key: string) {
            if (key === 'Content-Type') {
              return 'application/json'
            }
          }
        },
        json: async () => ({
          txid: 'mocked_txid',
          txStatus: 'success',
          extraInfo: 'received'
        })
      });

      (global as any).window = { fetch: mockedFetch } as any

      const tx = new Transaction()
      const rv = await tx.broadcast()

      expect(mockedFetch).toHaveBeenCalled()
      const url = (mockedFetch as jest.Mock).mock.calls[0][0] as string
      expect(url).toEqual('https://arc.taal.com/v1/tx')
      expect(rv).toEqual({
        status: 'success',
        txid: 'mocked_txid',
        message: 'success received'
      })
    })

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

  describe('BEEF', () => {
    it('Serialization and deserialization', async () => {
      const tx = Transaction.fromBEEF(toArray(BRC62Hex, 'hex'))
      expect(tx.inputs[0].sourceTransaction.merklePath.blockHeight).toEqual(814435)
      const beef = toHex(tx.toBEEF())
      expect(beef).toEqual(BRC62Hex)
    })
    it('Does not double-encode transactions', () => {
      // Source: https://github.com/bitcoin-sv/ts-sdk/issues/77
      const incorrect = '0100beef01fe76eb0c000e02c402deff5437203e0b5cb22646cbada24a60349bf45c8b280ffb755868f2955c3111c500f4076b7f48031fc467f87d5e99d9c3c0b59e4dca5e3049f58b735c59b413a8b6016300bad9c2d948e8a2ca647fdb50f2fd36641c4adf937b41134405a3e7f734b8beb201300053604a579558b5f7030e618d5c726a19229e0ff677f6edf109f41c5cfdafc93e0119005f8465c2a8d1558afbfa80c2395f3f8866a2fa5015e54fab778b0149da58376c010d00cd452b4e74f57d199cdb81b8a0e4a62dcdaf89504d6c63a5a65d5b866912b8c0010700d2ae7e2ce76da560509172066f1a1cf81faf81d73f9c0f6fd5af0904973dcfb10102006e5e077bcaa35c0240d61c1f3bba8d789223711ec035ef88b0911fc569d2b95a010000c961038959b9d404297a180c066816562dd2a34986c0960121a87ba91a51262f010100a50e381b4e8812479ea561e5bab7dcaa80078652b1b39ee5410966c515a3442b010100383ce8891ca7bf1ddefa5e0d8a1ba9ab01cb4e18046e9d7d0d438b5aaecc38b2010100c694be322b4e74acca8a5ef7703afedb708281321fd674f1221eebc743b0e01c0101000f3cc61f2b3d762cfecdd977ba768a5cbb0a4b402ad4f0d1bd3a98a582794c35010100094ad56eeea3b47edb2b298775f2efabe48172612cb3419962632251d8cdb78e010100de84bf9dd8873f37decbda1b5188e24ead978b147a63c809691702d19c47e8cb050200000001b67f1b6a6c3e70742a39b82ba45d51c983f598963ebf237101cc372da1144b83020000006b483045022100d14c3eb0c1438747c124f099bc664bf945cd27cbd96915027057e508bbc9e03302203c73f79d4e00f8018783e1008ce0fbb8e8c58bff6bd8042ab7e3966a66c8788c41210356762156ee9347c3e2ceca17d13713028d5446f453e9cbcb0ea170b4ca7fab52ffffffff037c660000000000001976a91417c85798ff61f7ec8af257f672d973b6ec6d88fd88ac75330100000000001976a914eb645f9ea7e4e232e54b9651474c100026698c3088acf2458005000000001976a914802737e30c85b6fe86e26fb28e03140058aca65e88ac0000000001000100000001deff5437203e0b5cb22646cbada24a60349bf45c8b280ffb755868f2955c3111000000006a473044022076da9f61380c208f43652587c219b4452a7b803a0407c2c7c0f3bc27612c4e88022021a9eb02da5529873a5986933f9c35965aa78537b9e2aef9382de33cfb1ab4bb41210314793e1758db3caa7d2bce97b347ae3ced2f8a402b797ed986be63473d4644a0ffffffff023c330000000000001976a91417c85798ff61f7ec8af257f672d973b6ec6d88fd88ac3c330000000000001976a91417c85798ff61f7ec8af257f672d973b6ec6d88fd88ac00000000000200000001b67f1b6a6c3e70742a39b82ba45d51c983f598963ebf237101cc372da1144b83020000006b483045022100d14c3eb0c1438747c124f099bc664bf945cd27cbd96915027057e508bbc9e03302203c73f79d4e00f8018783e1008ce0fbb8e8c58bff6bd8042ab7e3966a66c8788c41210356762156ee9347c3e2ceca17d13713028d5446f453e9cbcb0ea170b4ca7fab52ffffffff037c660000000000001976a91417c85798ff61f7ec8af257f672d973b6ec6d88fd88ac75330100000000001976a914eb645f9ea7e4e232e54b9651474c100026698c3088acf2458005000000001976a914802737e30c85b6fe86e26fb28e03140058aca65e88ac0000000001000100000001deff5437203e0b5cb22646cbada24a60349bf45c8b280ffb755868f2955c3111000000006a473044022076da9f61380c208f43652587c219b4452a7b803a0407c2c7c0f3bc27612c4e88022021a9eb02da5529873a5986933f9c35965aa78537b9e2aef9382de33cfb1ab4bb41210314793e1758db3caa7d2bce97b347ae3ced2f8a402b797ed986be63473d4644a0ffffffff023c330000000000001976a91417c85798ff61f7ec8af257f672d973b6ec6d88fd88ac3c330000000000001976a91417c85798ff61f7ec8af257f672d973b6ec6d88fd88ac000000000001000000022e7f69f3e1e17e22cfb8818577b3c83a4fbbbc1bab55c70ffcdd994ae30ea48b000000006b483045022100d9a2d1efea4896b36b2eb5af42cf52009982c7c31b446213fe37f26835d9d72202203e4dee0ceb068a4936e79b0bf69f72203906a00a4256cb1a7b30a40764616e8441210314793e1758db3caa7d2bce97b347ae3ced2f8a402b797ed986be63473d4644a0ffffffff2e7f69f3e1e17e22cfb8818577b3c83a4fbbbc1bab55c70ffcdd994ae30ea48b010000006b483045022100b57a09145c57b7b5efb4b546f1b0bfb7adbc5e64d35d9d6989345d4c60c483940220280998a210a49a6efaacda6fb73670001bb7269d069be80eb14ea2227a73e82241210314793e1758db3caa7d2bce97b347ae3ced2f8a402b797ed986be63473d4644a0ffffffff0174660000000000001976a91417c85798ff61f7ec8af257f672d973b6ec6d88fd88ac0000000000'
      const correct = '0100beef01fe76eb0c000e02c402deff5437203e0b5cb22646cbada24a60349bf45c8b280ffb755868f2955c3111c500f4076b7f48031fc467f87d5e99d9c3c0b59e4dca5e3049f58b735c59b413a8b6016300bad9c2d948e8a2ca647fdb50f2fd36641c4adf937b41134405a3e7f734b8beb201300053604a579558b5f7030e618d5c726a19229e0ff677f6edf109f41c5cfdafc93e0119005f8465c2a8d1558afbfa80c2395f3f8866a2fa5015e54fab778b0149da58376c010d00cd452b4e74f57d199cdb81b8a0e4a62dcdaf89504d6c63a5a65d5b866912b8c0010700d2ae7e2ce76da560509172066f1a1cf81faf81d73f9c0f6fd5af0904973dcfb10102006e5e077bcaa35c0240d61c1f3bba8d789223711ec035ef88b0911fc569d2b95a010000c961038959b9d404297a180c066816562dd2a34986c0960121a87ba91a51262f010100a50e381b4e8812479ea561e5bab7dcaa80078652b1b39ee5410966c515a3442b010100383ce8891ca7bf1ddefa5e0d8a1ba9ab01cb4e18046e9d7d0d438b5aaecc38b2010100c694be322b4e74acca8a5ef7703afedb708281321fd674f1221eebc743b0e01c0101000f3cc61f2b3d762cfecdd977ba768a5cbb0a4b402ad4f0d1bd3a98a582794c35010100094ad56eeea3b47edb2b298775f2efabe48172612cb3419962632251d8cdb78e010100de84bf9dd8873f37decbda1b5188e24ead978b147a63c809691702d19c47e8cb030200000001b67f1b6a6c3e70742a39b82ba45d51c983f598963ebf237101cc372da1144b83020000006b483045022100d14c3eb0c1438747c124f099bc664bf945cd27cbd96915027057e508bbc9e03302203c73f79d4e00f8018783e1008ce0fbb8e8c58bff6bd8042ab7e3966a66c8788c41210356762156ee9347c3e2ceca17d13713028d5446f453e9cbcb0ea170b4ca7fab52ffffffff037c660000000000001976a91417c85798ff61f7ec8af257f672d973b6ec6d88fd88ac75330100000000001976a914eb645f9ea7e4e232e54b9651474c100026698c3088acf2458005000000001976a914802737e30c85b6fe86e26fb28e03140058aca65e88ac0000000001000100000001deff5437203e0b5cb22646cbada24a60349bf45c8b280ffb755868f2955c3111000000006a473044022076da9f61380c208f43652587c219b4452a7b803a0407c2c7c0f3bc27612c4e88022021a9eb02da5529873a5986933f9c35965aa78537b9e2aef9382de33cfb1ab4bb41210314793e1758db3caa7d2bce97b347ae3ced2f8a402b797ed986be63473d4644a0ffffffff023c330000000000001976a91417c85798ff61f7ec8af257f672d973b6ec6d88fd88ac3c330000000000001976a91417c85798ff61f7ec8af257f672d973b6ec6d88fd88ac000000000001000000022e7f69f3e1e17e22cfb8818577b3c83a4fbbbc1bab55c70ffcdd994ae30ea48b000000006b483045022100d9a2d1efea4896b36b2eb5af42cf52009982c7c31b446213fe37f26835d9d72202203e4dee0ceb068a4936e79b0bf69f72203906a00a4256cb1a7b30a40764616e8441210314793e1758db3caa7d2bce97b347ae3ced2f8a402b797ed986be63473d4644a0ffffffff2e7f69f3e1e17e22cfb8818577b3c83a4fbbbc1bab55c70ffcdd994ae30ea48b010000006b483045022100b57a09145c57b7b5efb4b546f1b0bfb7adbc5e64d35d9d6989345d4c60c483940220280998a210a49a6efaacda6fb73670001bb7269d069be80eb14ea2227a73e82241210314793e1758db3caa7d2bce97b347ae3ced2f8a402b797ed986be63473d4644a0ffffffff0174660000000000001976a91417c85798ff61f7ec8af257f672d973b6ec6d88fd88ac0000000000'
      const tx1 = Transaction.fromHexBEEF(incorrect)
      expect(tx1.toHexBEEF()).toEqual(correct)
    })
  })

  describe('EF', () => {
    it('Serialization and deserialization', async () => {
      const tx = Transaction.fromBEEF(toArray(BRC62Hex, 'hex'))
      const ef = toHex(tx.toEF())
      expect(ef).toEqual('010000000000000000ef01ac4e164f5bc16746bb0868404292ac8318bbac3800e4aad13a014da427adce3e000000006a47304402203a61a2e931612b4bda08d541cfb980885173b8dcf64a3471238ae7abcd368d6402204cbf24f04b9aa2256d8901f0ed97866603d2be8324c2bfb7a37bf8fc90edd5b441210263e2dee22b1ddc5e11f6fab8bcd2378bdd19580d640501ea956ec0e786f93e76ffffffff3e660000000000001976a9146bfd5c7fbe21529d45803dbcf0c87dd3c71efbc288ac013c660000000000001976a9146bfd5c7fbe21529d45803dbcf0c87dd3c71efbc288ac00000000')
    })
  })

  describe('Verification', () => {
    it('Verifies the transaction from the BEEF spec', async () => {
      const tx = Transaction.fromHexBEEF(BRC62Hex)
      const alwaysYesChainTracker = {
        isValidRootForHeight: async () => true
      }
      const verified = await tx.verify(alwaysYesChainTracker)
      expect(verified).toBe(true)
    })

    it('Verifies the transaction from the BEEF spec with a default chain tracker', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {
          get (key: string) {
            if (key === 'Content-Type') {
              return 'application/json'
            }
          }
        },
        json: async () => ({
          merkleroot: MerkleRootFromBEEF
        })
      });
      (global as any).window = { fetch: mockFetch }


      const tx = Transaction.fromHexBEEF(BRC62Hex)

      const verified = await tx.verify()

      expect(mockFetch).toHaveBeenCalled()
      expect(verified).toBe(true)
    })

    it('Verifies the transaction from the BEEF spec with a scripts only', async () => {
      const BEEF = "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"
      const tx = Transaction.fromBEEF(toArray(BEEF, "base64"))

      // Verifies transaction with scripts only
      const verified = await tx.verify("scripts only")
      expect(verified).toBe(true)
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

      // 151, 142 and 25 have invalid Satoshi amounts that exceed 53 bits in length, causing exceptions that make serialization and deserialization impossible.
      if (i === 151 || i === 142 || i === 25) {
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
