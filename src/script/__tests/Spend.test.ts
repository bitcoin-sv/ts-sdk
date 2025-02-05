import PrivateKey from '../../primitives/PrivateKey'
import { hash160, hash256 } from '../../primitives/Hash'
import Curve from '../../primitives/Curve'
import Spend from '../../script/Spend'
import P2PKH from '../../script/templates/P2PKH'
import RPuzzle from '../../script/templates/RPuzzle'
import Transaction from '../../transaction/Transaction'
import LockingScript from '../../script/LockingScript'
import UnlockingScript from '../../script/UnlockingScript'
import BigNumber from '../../primitives/BigNumber'

import spendValid from './spend.valid.vectors'

describe('Spend', () => {
  it('Successfully validates a P2PKH spend', async () => {
    const privateKey = new PrivateKey(1)
    const publicKey = privateKey.toPublicKey()
    const hash = publicKey.toHash()
    const p2pkh = new P2PKH()
    const lockingScript = p2pkh.lock(hash)
    const satoshis = 1
    const unlockingTemplate = p2pkh.unlock(privateKey)
    const sourceTx = new Transaction(
      1,
      [],
      [
        {
          lockingScript,
          satoshis
        }
      ],
      0
    )
    const spendTx = new Transaction(
      1,
      [
        {
          sourceTransaction: sourceTx,
          sourceOutputIndex: 0,
          sequence: 0xffffffff
        }
      ],
      [],
      0
    )
    const unlockingScript = await unlockingTemplate.sign(spendTx, 0)
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
  it('Fails to verify a P2PKH spend with the wrong key', async () => {
    const privateKey = new PrivateKey(1)
    const publicKey = privateKey.toPublicKey()
    const wrongPrivateKey = new PrivateKey(2)
    const hash = publicKey.toHash()
    const p2pkh = new P2PKH()
    const lockingScript = p2pkh.lock(hash)
    const satoshis = 1
    const unlockingTemplate = p2pkh.unlock(wrongPrivateKey)
    const sourceTx = new Transaction(
      1,
      [],
      [
        {
          lockingScript,
          satoshis
        }
      ],
      0
    )
    const spendTx = new Transaction(
      1,
      [
        {
          sourceTransaction: sourceTx,
          sourceOutputIndex: 0,
          sequence: 0xffffffff
        }
      ],
      [],
      0
    )
    const unlockingScript = await unlockingTemplate.sign(spendTx, 0)
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
  it('Successfully validates an R-puzzle spend', async () => {
    const k = new PrivateKey(2)
    const c = new Curve()

    // Ensure generator point (g) and curve order (n) exist
    if (c.g === null || c.g === undefined || c.n === null || c.n === undefined) {
      throw new Error('Curve generator point or order is null')
    }

    let r = c.g.mul(k).x
    if (r == null) {
      throw new Error('Point multiplication resulted in null x-coordinate')
    }

    r = r.umod(c.n)

    // Ensure r remains a BigNumber and applies padding if needed
    if (r.toArray()[0] > 127) {
      r = new BigNumber([0, ...r.toArray()], 16)
    }

    const puz = new RPuzzle()
    const rArray = r.toArray('be', 32)
    const lockingScript = puz.lock(rArray)

    const satoshis = 1

    const privateKey = PrivateKey.fromRandom()

    const unlockingTemplate = puz.unlock(k, privateKey)
    const sourceTx = new Transaction(
      1,
      [],
      [
        {
          lockingScript,
          satoshis
        }
      ],
      0
    )

    const spendTx = new Transaction(
      1,
      [
        {
          sourceTransaction: sourceTx,
          sourceOutputIndex: 0,
          sequence: 0xffffffff
        }
      ],
      [],
      0
    )

    const unlockingScript = await unlockingTemplate.sign(spendTx, 0)
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

  it('Successfully validates an R-puzzle spend (HASH256)', async () => {
    const k = new PrivateKey(2)
    const c = new Curve()

    if (c.g == null || c.g === undefined) {
      throw new Error('Curve generator point is null')
    }

    let r = c.g.mul(k).x
    if (r == null) {
      throw new Error('Generated r value is null')
    }

    r = r.umod(c.n)
    const rArray = r.toArray('be', 32) // Convert BigNumber to a 32-byte array
    const hashedR = hash256(rArray) // Ensure hash256 receives correct input

    const puz = new RPuzzle('HASH256')
    const lockingScript = puz.lock(hashedR)
    const satoshis = 1

    // ✅ Ensure privateKey is valid and within range
    const privateKey = PrivateKey.fromRandom()

    const unlockingTemplate = puz.unlock(k, privateKey)
    const sourceTx = new Transaction(
      1,
      [],
      [
        {
          lockingScript,
          satoshis
        }
      ],
      0
    )

    const spendTx = new Transaction(
      1,
      [
        {
          sourceTransaction: sourceTx,
          sourceOutputIndex: 0,
          sequence: 0xffffffff
        }
      ],
      [],
      0
    )

    const unlockingScript = await unlockingTemplate.sign(spendTx, 0)
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

  it('Fails to validate an R-puzzle spend with the wrong K value', async () => {
    const k = new PrivateKey(2)
    const wrongK = new PrivateKey(5)
    const c = new Curve()

    if (c.g == null || c.g === undefined) {
      throw new Error('Curve generator point is null')
    }

    let r = c.g.mul(k).x
    if (r == null) {
      throw new Error('Generated r value is null')
    }

    r = r.umod(c.n)
    const rArray = r.toArray('be', 32) // Convert BigNumber to a 32-byte array
    const hashedR = hash256(rArray) // Ensure hash256 receives correct input

    const puz = new RPuzzle('HASH256')
    const lockingScript = puz.lock(hashedR)
    const satoshis = 1

    // ✅ Ensure privateKey is valid and within range
    const privateKey = PrivateKey.fromRandom()

    const unlockingTemplate = puz.unlock(wrongK, privateKey)
    const sourceTx = new Transaction(
      1,
      [],
      [
        {
          lockingScript,
          satoshis
        }
      ],
      0
    )

    const spendTx = new Transaction(
      1,
      [
        {
          sourceTransaction: sourceTx,
          sourceOutputIndex: 0,
          sequence: 0xffffffff
        }
      ],
      [],
      0
    )

    const unlockingScript = await unlockingTemplate.sign(spendTx, 0)
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

  it('Fails to validate an R-puzzle spend with the wrong hash', async () => {
    const k = new PrivateKey(2)
    const c = new Curve()

    if (c.g == null || c.g === undefined) {
      throw new Error('Curve generator point is null')
    }

    let r = c.g.mul(k).x
    if (r == null) {
      throw new Error('Generated r value is null')
    }

    r = r.umod(c.n)
    const rArray = r.toArray('be', 32) // Convert BigNumber to a 32-byte array
    const wrongHash = hash160(rArray) // Ensure hash160 receives correct input

    const puz = new RPuzzle('HASH256')
    const lockingScript = puz.lock(wrongHash)
    const satoshis = 1

    // ✅ Ensure privateKey is valid and within range
    const privateKey = PrivateKey.fromRandom()

    const unlockingTemplate = puz.unlock(k, privateKey)
    const sourceTx = new Transaction(
      1,
      [],
      [
        {
          lockingScript,
          satoshis
        }
      ],
      0
    )

    const spendTx = new Transaction(
      1,
      [
        {
          sourceTransaction: sourceTx,
          sourceOutputIndex: 0,
          sequence: 0xffffffff
        }
      ],
      [],
      0
    )

    const unlockingScript = await unlockingTemplate.sign(spendTx, 0)
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
  for (let i = 0; i < spendValid.length; i++) {
    const a = spendValid[i]
    if (a.length === 1) {
      continue
    }
    it(a[2], () => {
      const spend = new Spend({
        sourceTXID:
          '0000000000000000000000000000000000000000000000000000000000000000',
        sourceOutputIndex: 0,
        sourceSatoshis: 1,
        lockingScript: LockingScript.fromHex(a[1]),
        transactionVersion: 1,
        otherInputs: [],
        outputs: [],
        inputIndex: 0,
        unlockingScript: UnlockingScript.fromHex(a[0]),
        inputSequence: 0xffffffff,
        lockTime: 0
      })
      expect(spend.validate()).toBe(true)
    })
  }
})
