import OP from '../OP.js'
import ScriptTemplate from '../ScriptTemplate.js'
import LockingScript from '../LockingScript.js'
import UnlockingScript from '../UnlockingScript.js'

export default class P2PKH implements ScriptTemplate {
  lock (pubkeyhash: number[]): LockingScript {
    return new LockingScript([
      { op: OP.OP_DUP },
      { op: OP.OP_HASH160 },
      { op: OP.OP_PUSHDATA1, data: pubkeyhash },
      { op: OP.OP_EQUALVERIFY },
      { op: OP.OP_CHECKSIG }
    ])
  }

  unlock (pubkey: number[], sig: number[]): UnlockingScript {
    return new UnlockingScript([
      { op: OP.OP_PUSHDATA1, data: sig },
      { op: OP.OP_PUSHDATA1, data: pubkey }
    ])
  }

  unlock (key: PrivateKey, transaction: Transaction): UnlockingScript {

  }
}
