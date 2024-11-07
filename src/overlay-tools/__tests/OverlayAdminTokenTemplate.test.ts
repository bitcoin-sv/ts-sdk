import OverlayAdminTokenTemplate from '../../../dist/cjs/src/overlay-tools/OverlayAdminTokenTemplate.js'
import PushDrop from '../../../dist/cjs/src/script/templates/PushDrop.js'
import ProtoWallet from '../../../dist/cjs/src//wallet/ProtoWallet.js'
import { PrivateKey } from '../../../dist/cjs/src/primitives/index.js'
import { Transaction } from '../../../dist/cjs/src/transaction/index.js'
import { Spend } from '../../../dist/cjs/src/script/index.js'

describe('Overlay Admin Token Template', () => {
  describe('Lock and Decode', () => {
    it('Creates a script that can be decoded', async () => {
      const key = new PrivateKey(1)
      const wallet = new ProtoWallet(key)
      const lib = new OverlayAdminTokenTemplate(wallet)
      const script = await lib.lock('SHIP', 'test.com', 'tm_tests')
      const decoded = OverlayAdminTokenTemplate.decode(script)
      expect(decoded).toEqual({
        domain: 'test.com',
        protocol: 'SHIP',
        identityKey: key.toPublicKey().toString(),
        topicOrService: 'tm_tests'
      })
    })
    it('Will not decode with invalid field count or protocol', async () => {
      const key = new PrivateKey(1)
      const wallet = new ProtoWallet(key)
      const pushDrop = new PushDrop(wallet)
      const scriptBadFieldCount = await pushDrop.lock([[1], [2], [3]], [2, 'tests'], '1', 'self')
      const scriptBadProtocol = await pushDrop.lock([[1], [2], [3], [4]], [2, 'tests'], '1', 'self')
      expect(() => OverlayAdminTokenTemplate.decode(scriptBadFieldCount)).toThrow()
      expect(() => OverlayAdminTokenTemplate.decode(scriptBadProtocol)).toThrow()
    })
  })
  describe('Unlock', () => {
    it('creates a correct unlocking script', async () => {
      const key = new PrivateKey(1)
      const wallet = new ProtoWallet(key)
      const lib = new OverlayAdminTokenTemplate(wallet)
      const lockingScript = await lib.lock('SLAP', 'test.com', 'ls_tests')
      const satoshis = 1
      const unlockingTemplate = await lib.unlock('SLAP')
      const sourceTx = new Transaction(1, [], [{
        lockingScript,
        satoshis
      }], 0)
      const spendTx = new Transaction(1, [{
        sourceTransaction: sourceTx,
        sourceOutputIndex: 0,
        sequence: 0xffffffff
      }], [], 0)
      const unlockingScript = await unlockingTemplate.sign(spendTx, 0)
      expect(await unlockingTemplate.estimateLength(spendTx, 0)).toEqual(73)
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
  })
})
