import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'
import PrivateKey from '../../../dist/cjs/src/primitives/PrivateKey'
import { hash160 } from '../../../dist/cjs/src/primitives/Hash'
import Curve from '../../../dist/cjs/src/primitives/Curve'
import Spend from '../../../dist/cjs/src/script/Spend'
import P2PKH from '../../../dist/cjs/src/script/templates/P2PKH'
import Transaction from '../../../dist/cjs/src/transaction/Transaction'

describe('Spend', () => {
  it('Successfully validates a P2PKH spend', () => {
    const privateKey = new PrivateKey(1)
    const publicKey = new Curve().g.mul(privateKey)
    const hash = hash160(publicKey.encode(true)) as number[]
    const p2pkh = new P2PKH()
    const lockingScript = p2pkh.lock(hash)
    const satoshis = new BigNumber(1)
    const unlockingTemplate = p2pkh.unlock(privateKey)
    const sourceTx = new Transaction(1, [], [{
      lockingScript,
      satoshis
    }], 0)
    const spendTx = new Transaction(1, [{
      sourceTransaction: sourceTx,
      sourceOutputIndex: 0,
      sequence: 0xffffffff
    }], [], 0)
    const unlockingScript = unlockingTemplate(spendTx, 0)
    const spend = new Spend({
      sourceTXID: sourceTx.id('hex'),
      sourceOutputIndex: 0,
      sourceSatoshis: satoshis,
      lockingScript,
      transactionVersion: 1,
      otherInputs: [],
      inputIndex: 0,
      unlockingScript,
      outputs: [],
      inputSequence: 0xffffffff,
      lockTime: 0
    })
    const valid = spend.validate()
    expect(valid).toBe(true)
  })
  it('Fails to verify a P2PKH spend with the wrong key', () => {
    const privateKey = new PrivateKey(1)
    const publicKey = new Curve().g.mul(privateKey)
    const wrongPrivateKey = new PrivateKey(2)
    const hash = hash160(publicKey.encode(true)) as number[]
    const p2pkh = new P2PKH()
    const lockingScript = p2pkh.lock(hash)
    const satoshis = new BigNumber(1)
    const unlockingTemplate = p2pkh.unlock(wrongPrivateKey)
    const sourceTx = new Transaction(1, [], [{
      lockingScript,
      satoshis
    }], 0)
    const spendTx = new Transaction(1, [{
      sourceTransaction: sourceTx,
      sourceOutputIndex: 0,
      sequence: 0xffffffff
    }], [], 0)
    const unlockingScript = unlockingTemplate(spendTx, 0)
    const spend = new Spend({
      sourceTXID: sourceTx.id('hex'),
      sourceOutputIndex: 0,
      sourceSatoshis: satoshis,
      lockingScript,
      transactionVersion: 1,
      otherInputs: [],
      inputIndex: 0,
      unlockingScript,
      outputs: [],
      inputSequence: 0xffffffff,
      lockTime: 0
    })
    expect(() => spend.validate()).toThrow()
  })
})
