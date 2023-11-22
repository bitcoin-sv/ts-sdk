import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'
import { Reader } from '../../../dist/cjs/src/primitives/utils'
import Spend from '../../../dist/cjs/src/script/Spend'
import Script from '../../../dist/cjs/src/script/Script'
import Transaction from '../../../dist/cjs/src/transaction/Transaction'

import * as fixture from './vectors/bip69.json'
import * as vectorsBitcoinABCSighash from '../../primitives/__tests/sighash.vectors'
import * as vectorsBitcoindTxInvalid from '../../script/__tests/script.invalid.vectors'
import * as vectorsBitcoindTxValid from '../../script/__tests/script.valid.vectors'
import * as largesttxvector from './largesttx.vectors'

describe('Tx', () => {
  const txIn = new TxIn().fromBuffer(
    Buffer.from('00000000000000000000000000000000000000000000000000000000000000000000000001ae00000000', 'hex')
  )
  const txOut = new TxOut().fromBuffer(Buffer.from('050000000000000001ae', 'hex'))
  const tx = new Transaction().fromObject({
    versionBytesNum: 0,
    txInsVi: VarInt.fromNumber(1),
    txIns: [txIn],
    txOutsVi: VarInt.fromNumber(1),
    txOuts: [txOut],
    nLockTime: 0
  })
  const txhex =
        '000000000100000000000000000000000000000000000000000000000000000000000000000000000001ae0000000001050000000000000001ae00000000'
  const txbuf = Buffer.from(txhex, 'hex')

  const tx2idhex = '8c9aa966d35bfeaf031409e0001b90ccdafd8d859799eb945a3c515b8260bcf2'
  const tx2hex =
        '01000000029e8d016a7b0dc49a325922d05da1f916d1e4d4f0cb840c9727f3d22ce8d1363f000000008c493046022100e9318720bee5425378b4763b0427158b1051eec8b08442ce3fbfbf7b30202a44022100d4172239ebd701dae2fbaaccd9f038e7ca166707333427e3fb2a2865b19a7f27014104510c67f46d2cbb29476d1f0b794be4cb549ea59ab9cc1e731969a7bf5be95f7ad5e7f904e5ccf50a9dc1714df00fbeb794aa27aaff33260c1032d931a75c56f2ffffffffa3195e7a1ab665473ff717814f6881485dc8759bebe97e31c301ffe7933a656f020000008b48304502201c282f35f3e02a1f32d2089265ad4b561f07ea3c288169dedcf2f785e6065efa022100e8db18aadacb382eed13ee04708f00ba0a9c40e3b21cf91da8859d0f7d99e0c50141042b409e1ebbb43875be5edde9c452c82c01e3903d38fa4fd89f3887a52cb8aea9dc8aec7e2c9d5b3609c03eb16259a2537135a1bf0f9c5fbbcbdbaf83ba402442ffffffff02206b1000000000001976a91420bb5c3bfaef0231dc05190e7f1c8e22e098991e88acf0ca0100000000001976a9149e3e2d23973a04ec1b02be97c30ab9f2f27c3b2c88ac00000000'
  const tx2buf = Buffer.from(tx2hex, 'hex')

  it('should make a new transaction', () => {
    let tx = new Transaction()
    should.exist(tx)
    tx = new Transaction()
    should.exist(tx)

    Transaction.fromBuffer(txbuf).toBuffer().toString('hex').should.equal(txhex)

    // should set known defaults
    tx.versionBytesNum.should.equal(1)
    tx.txInsVi.toNumber().should.equal(0)
    tx.txIns.length.should.equal(0)
    tx.txOutsVi.toNumber().should.equal(0)
    tx.txOuts.length.should.equal(0)
    tx.nLockTime.should.equal(0)
  })

  describe('#constructor', () => {
    it('should set these known defaults', () => {
      const tx = new Transaction()
      tx.versionBytesNum.should.equal(1)
      tx.txInsVi.toNumber().should.equal(0)
      tx.txIns.length.should.equal(0)
      tx.txOutsVi.toNumber().should.equal(0)
      tx.txOuts.length.should.equal(0)
      tx.nLockTime.should.equal(0)
    })
  })

  describe('#clone', () => {
    it('should clone a tx', () => {
      const tx1 = Transaction.fromHex(tx2hex)
      const tx2 = tx1.clone()
      tx2.should.not.equal(tx1)
      tx2.toHex().should.equal(tx1.toHex())
    })
  })

  describe('#cloneByBuffer', () => {
    it('should clone a tx by buffer', () => {
      const tx1 = Transaction.fromHex(tx2hex)
      tx1.toJSON = sinon.spy()
      const tx2 = tx1.cloneByBuffer()
            ;(tx1.toJSON as sinon.SinonSpy).calledOnce.should.equal(false)
      tx2.should.not.equal(tx1)
      tx2.toHex().should.equal(tx1.toHex())
    })
  })

  describe('#fromObject', () => {
    it('should set all the basic parameters', () => {
      const tx = new Transaction().fromObject({
        versionBytesNum: 0,
        txInsVi: VarInt.fromNumber(1),
        txIns: [txIn],
        txOutsVi: VarInt.fromNumber(1),
        txOuts: [txOut],
        nLockTime: 0
      })
      should.exist(tx.versionBytesNum)
      should.exist(tx.txInsVi)
      should.exist(tx.txIns)
      should.exist(tx.txOutsVi)
      should.exist(tx.txOuts)
      should.exist(tx.nLockTime)
    })
  })

  describe('#fromJSON', () => {
    it('should set all the basic parameters', () => {
      const tx = new Transaction().fromJSON({
        versionBytesNum: 0,
        txInsVi: VarInt.fromNumber(1).toJSON(),
        txIns: [txIn.toJSON()],
        txOutsVi: VarInt.fromNumber(1).toJSON(),
        txOuts: [txOut.toJSON()],
        nLockTime: 0
      })
      should.exist(tx.versionBytesNum)
      should.exist(tx.txInsVi)
      should.exist(tx.txIns)
      should.exist(tx.txOutsVi)
      should.exist(tx.txOuts)
      should.exist(tx.nLockTime)
    })
  })

  describe('#toJSON', () => {
    it('should recover all the basic parameters', () => {
      const json = tx.toJSON()
      should.exist(json.versionBytesNum)
      should.exist(json.txInsVi)
      should.exist(json.txIns)
      should.exist(json.txOutsVi)
      should.exist(json.txOuts)
      should.exist(json.nLockTime)
    })
  })

  describe('#fromHex', () => {
    it('should recover from this known tx', () => {
      new Transaction().fromHex(txhex).toHex().should.equal(txhex)
    })

    it('should recover from this known tx from the blockchain', () => {
      new Transaction().fromHex(tx2hex).toHex().should.equal(tx2hex)
    })
  })

  describe('#fromBuffer', () => {
    it('should recover from this known tx', () => {
      new Transaction().fromBuffer(txbuf).toBuffer().toString('hex').should.equal(txhex)
    })

    it('should recover from this known tx from the blockchain', () => {
      new Transaction().fromBuffer(tx2buf).toBuffer().toString('hex').should.equal(tx2hex)
    })
  })

  describe('#fromBr', () => {
    it('should recover from this known tx', () => {
      new Transaction().fromBr(new Reader(txbuf)).toBuffer().toString('hex').should.equal(txhex)
    })
  })

  describe('#toHex', () => {
    it('should produce this known tx', () => {
      new Transaction().fromHex(txhex).toHex().should.equal(txhex)
    })
  })

  describe('#toBuffer', () => {
    it('should produce this known tx', () => {
      new Transaction().fromBuffer(txbuf).toBuffer().toString('hex').should.equal(txhex)
    })
  })

  describe('#toBw', () => {
    it('should produce this known tx', () => {
      new Transaction().fromBuffer(txbuf).toBw().toBuffer().toString('hex').should.equal(txhex)
    })
  })

  describe('#sighash', () => {
    it('should hash this transaction', () => {
      tx.sighash(0, 0, new Script()).length.should.equal(32)
    })

    it('should return 1 for the SIGHASH_SINGLE bug', () => {
      const tx = Transaction.fromBuffer(tx2buf)
      tx.txOuts.length = 1
      tx.txOutsVi = VarInt.fromNumber(1)
      tx.sighash(Sig.SIGHASH_SINGLE, 1, new Script())
        .toString('hex')
        .should.equal('0000000000000000000000000000000000000000000000000000000000000001')
    })
  })

  describe('#asyncSighash', () => {
    it('should hash this transaction', async () => {
      const hashBuf = await tx.asyncSighash(0, 0, new Script())
      hashBuf.length.should.equal(32)
    })

    it('should return 1 for the SIGHASH_SINGLE bug', async () => {
      const tx = Transaction.fromBuffer(tx2buf)
      tx.txOuts.length = 1
      tx.txOutsVi = VarInt.fromNumber(1)
      const hashBuf = await tx.asyncSighash(Sig.SIGHASH_SINGLE, 1, new Script())
      hashBuf.toString('hex').should.equal('0000000000000000000000000000000000000000000000000000000000000001')
    })
  })

  describe('#sign', () => {
    it('should return a signature', () => {
      const keyPair = new KeyPair().fromRandom()
      const sig1 = tx.sign(keyPair, Sig.SIGHASH_ALL, 0, new Script())
      should.exist(sig1)
      const sig2 = tx.sign(keyPair, Sig.SIGHASH_SINGLE, 0, new Script())
      const sig3 = tx.sign(keyPair, Sig.SIGHASH_ALL, 0, new Script().fromString('OP_RETURN'))
      sig1.toString().should.not.equal(sig2.toString())
      sig1.toString().should.not.equal(sig3.toString())
    })
  })

  describe('#asyncSign', () => {
    it('should return a signature', async () => {
      const keyPair = new KeyPair().fromRandom()
      const sig1 = tx.sign(keyPair, Sig.SIGHASH_ALL, 0, new Script())
      const sig1b = await tx.asyncSign(keyPair, Sig.SIGHASH_ALL, 0, new Script())
      const sig2 = tx.sign(keyPair, Sig.SIGHASH_SINGLE, 0, new Script())
      const sig2b = await tx.asyncSign(keyPair, Sig.SIGHASH_SINGLE, 0, new Script())
      const sig3 = tx.sign(keyPair, Sig.SIGHASH_ALL, 0, new Script().fromString('OP_RETURN'))
      const sig3b = await tx.asyncSign(keyPair, Sig.SIGHASH_ALL, 0, new Script().fromString('OP_RETURN'))
      sig1.toString().should.equal(sig1b.toString())
      sig2.toString().should.equal(sig2b.toString())
      sig3.toString().should.equal(sig3b.toString())
    })
  })

  describe('#verify', () => {
    it('should return a signature', () => {
      const keyPair = new KeyPair().fromRandom()
      const sig1 = tx.sign(keyPair, Sig.SIGHASH_ALL, 0, new Script())
      tx.verify(sig1, keyPair.pubKey, 0, new Script()).should.equal(true)
    })
  })

  describe('#asyncVerify', () => {
    it('should return a signature', async () => {
      const keyPair = new KeyPair().fromRandom()
      const sig1 = tx.sign(keyPair, Sig.SIGHASH_ALL, 0, new Script())
      const verified = await tx.asyncVerify(sig1, keyPair.pubKey, 0, new Script())
      verified.should.equal(true)
    })
  })

  describe('#hash', () => {
    it('should correctly calculate the hash of this known transaction', () => {
      const tx = Transaction.fromBuffer(tx2buf)
      const txHashBuf = Buffer.from(Array.apply([], Buffer.from(tx2idhex, 'hex')).reverse())
      tx.hash().toString('hex').should.equal(txHashBuf.toString('hex'))
    })
  })

  describe('#asyncHash', () => {
    it('should correctly calculate the hash of this known transaction', async () => {
      const tx = Transaction.fromBuffer(tx2buf)
      const txHashBuf = Buffer.from(Array.apply([], Buffer.from(tx2idhex, 'hex')).reverse())
      const hashBuf = await tx.asyncHash()
      hashBuf.toString('hex').should.equal(txHashBuf.toString('hex'))
    })
  })

  describe('#id', () => {
    it('should correctly calculate the id of this known transaction', () => {
      const tx = Transaction.fromBuffer(tx2buf)
      tx.id().should.equal(tx2idhex)
    })
  })

  describe('#asyncId', () => {
    it('should correctly calculate the id of this known transaction', async () => {
      const tx = Transaction.fromBuffer(tx2buf)
      const idbuf = await tx.asyncId()
      idbuf.should.equal(tx2idhex)
    })
  })

  describe('#addTxIn', () => {
    it('should add an input', () => {
      const txIn = new TxIn()
      const tx = new Transaction()
      tx.txInsVi.toNumber().should.equal(0)
      tx.addTxIn(txIn)
      tx.txInsVi.toNumber().should.equal(1)
      tx.txIns.length.should.equal(1)
    })
  })

  describe('#addTxOut', () => {
    it('should add an output', () => {
      const txOut = new TxOut()
      const tx = new Transaction()
      tx.txOutsVi.toNumber().should.equal(0)
      tx.addTxOut(txOut)
      tx.txOutsVi.toNumber().should.equal(1)
      tx.txOuts.length.should.equal(1)
    })
  })

  describe('bectors: bip69 (from bitcoinjs)', () => {
    // returns index-based order of sorted against original
    function getIndexOrder (original, sorted) {
      return sorted.map((value) => {
        return original.indexOf(value)
      })
    }

    // eslint-disable-next-line ban/ban
    fixture.inputs.forEach((inputSet) => {
      it(inputSet.description, () => {
        const tx = new Transaction()
        const txIns = inputSet.inputs.map((input) => {
          const txHashBuf = Buffer.from(input.txId, 'hex').reverse()
          const txOutNum = input.vout
          const script = new Script()
          const txIn = TxIn.fromProperties(txHashBuf, txOutNum, script)
          return txIn
        })
        tx.txIns = [...txIns]
        tx.sort()
        getIndexOrder(txIns, tx.txIns).toString().should.equal(inputSet.expected.toString())
      })
    })

    // eslint-disable-next-line ban/ban
    fixture.outputs.forEach((outputSet) => {
      it(outputSet.description, () => {
        const tx = new Transaction()
        const txOuts = outputSet.outputs.map((output) => {
          const txOut = TxOut.fromProperties(new BigNumber(output.value), Script.fromAsmString(output.script))
          return txOut
        })
        tx.txOuts = [...txOuts]
        tx.sort()
        getIndexOrder(txOuts, tx.txOuts).toString().should.equal(outputSet.expected.toString())
      })
    })
  })

  describe('vectors: a 1mb transaction', () => {
    it('should find the correct id of this (valid, on the blockchain) 1 mb transaction', () => {
      const txidhex = largesttxvector.txidhex
      const txhex = largesttxvector.txhex
      const tx = Transaction.fromHex(txhex)
      const txid = tx.id()
      txid.should.equal(txidhex)
    })
  })

  describe('vectors: sighash and serialization', () => {
    // eslint-disable-next-line ban/ban
    vectorsBitcoindSighash.forEach((vector, i) => {
      if (i === 0) {
        return
      }
      it('should pass bitcoind sighash test vector ' + i, () => {
        const txbuf = Buffer.from(vector[0], 'hex')
        const scriptbuf = Buffer.from(vector[1], 'hex')
        const subScript = new Script().fromBuffer(scriptbuf)
        const nIn = vector[2]
        const nHashType = vector[3]
        const sighashBuf = Buffer.from(vector[4], 'hex')
        const tx = Transaction.fromBuffer(txbuf)

        // make sure transacion to/from buffer is isomorphic
        tx.toHex().should.equal(txbuf.toString('hex'))

        // sighash ought to be correct
        tx.sighash(nHashType, nIn, subScript)
          .toString('hex')
          .should.equal(sighashBuf.toString('hex'))
      })
    })

    // eslint-disable-next-line ban/ban
    vectorsBitcoinABCSighash.forEach((vector, i) => {
      if (i === 0) {
        return
      }
      it('should pass bitcoin-abc sighash test vector ' + i, () => {
        if (vector[0] === 'Test vectors for SIGHASH_FORKID') {
          return
        }
        const txbuf = Buffer.from(vector[0], 'hex')
        const scriptbuf = Buffer.from(vector[1], 'hex')
        const subScript = new Script().fromBuffer(scriptbuf)
        const nIn = (vector[2]) as number
        const nHashType = (vector[3]) as number
        const sighashBuf = Buffer.from(vector[4], 'hex')
        const tx = Transaction.fromBuffer(txbuf)

        // make sure transacion to/from buffer is isomorphic
        tx.toBuffer().toString('hex').should.equal(txbuf.toString('hex'))

        // sighash ought to be correct
        const valueBn = new BigNumber(0)
        let flags = 0
        if (nHashType & Sig.SIGHASH_FORKID) {
          flags = Spend.SCRIPT_ENABLE_SIGHASH_FORKID
        }
        tx.sighash(nHashType, nIn, subScript, valueBn, flags)
          .toString('hex')
          .should.equal(sighashBuf.toString('hex'))
      })
    })

    let j = 0
    // eslint-disable-next-line ban/ban
    vectorsBitcoindTxValid.forEach((vector) => {
      if (vector.length === 1) {
        return
      }
      it('should correctly serialized/deserialize tx_valid test vector ' + j, () => {
        const txhex = vector[1]
        const txbuf = Buffer.from(vector[1], 'hex')
        const tx = Transaction.fromBuffer(txbuf)
        tx.toBuffer().toString('hex').should.equal(txhex)
      })
      j++
    })

    j = 0
    // eslint-disable-next-line ban/ban
    vectorsBitcoindTxInvalid.forEach((vector) => {
      if (vector.length === 1) {
        return
      }
      it('should correctly serialized/deserialize tx_invalid test vector ' + j, () => {
        const txhex = vector[1]
        const txbuf = Buffer.from(vector[1], 'hex')
        const tx = Transaction.fromBuffer(txbuf)
        tx.toBuffer().toString('hex').should.equal(txhex)
      })
      j++
    })
  })
})
