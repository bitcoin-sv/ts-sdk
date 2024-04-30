import Script from "../../script/Script"
import Spend from "../../script/Spend"
import Transaction from "../../transaction/Transaction"

describe('SpendComplex', () => {
  it('complex unlock script validation', () => {
    const rawTx = '010000000130f9f05e6ff77b647f72a86c249204aa476d205a320e918d0ae589c1d17943f200000000fd8c0447304402205773ed93e743866c3b1987780d0e0fe79b83229e88ecc41caeb7028194ccbaa902201441eee38be05d8e041ca0ae4880c91e85f43e1a5209547cfb88dcf45dfdaa2dc2210253108f70a2a86ab671f7f8cbff55478d8fee1dd115ee34ada7778aa5407fe0f64d1f04010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030f9f05e6ff77b647f72a86c249204aa476d205a320e918d0ae589c1d17943f200000000fd80032097dfd76851bf465e8f715593b217714858bbe9570ff3bd5e33840a34e20ff0262102ba79df5f8ae7604a9830f03c7933028186aede0675a16f025dc4f8be8eec0382201008ce7480da41702918d1ec8e6849ba32b4d65b1e40dc669c31a1e6306b266c0000000014fb941ff552d7f5b07fe7cdb799f3a769a3818bba03ba6818615179567a75557a557a557a557a557a0079557a75547a547a547a547a757561577901c261517959795979210ac407f0e4bd44bfc207355a778b046225a7068fc59ee7eda43ad905aadbffc800206c266b30e6a1319c66dc401e5bd6b432ba49688eecd118297041da8074ce08105b795679615679aa0079610079517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01007e81517a75615779567956795679567961537956795479577995939521414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff00517951796151795179970079009f63007952799367007968517a75517a75517a7561527a75517a517951795296a0630079527994527a75517a6853798277527982775379012080517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01205279947f7754537993527993013051797e527e54797e58797e527e53797e52797e57797e0079517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a756100795779ac517a75517a75517a75517a75517a75517a75517a75517a75517a7561517a75517a756169577961007961007982775179517954947f75517958947f77517a75517a756161007901007e81517a7561517a7561527a75517a57796100796100798277517951790128947f755179012c947f77517a75517a756161007901007e81517a7561517a7561517a75007905ffffffff009f6951795379a2695879a95479876959795979ac77777777777777777777e903000000000000feffffff0000000000000000000000000000000000000000000000000000000000000000ba681800c2000000feffffff02c8000000000000001976a91454193bbfcf6541e49d0a9e5b1aa40205eae76d6d88ac8e020000000000001976a91492e4a083b28a331b12d42d77d8b21126eaa9ccff88acba681800'
    const lockingScript = '2097dfd76851bf465e8f715593b217714858bbe9570ff3bd5e33840a34e20ff0262102ba79df5f8ae7604a9830f03c7933028186aede0675a16f025dc4f8be8eec0382201008ce7480da41702918d1ec8e6849ba32b4d65b1e40dc669c31a1e6306b266c0000000014fb941ff552d7f5b07fe7cdb799f3a769a3818bba03ba6818615179567a75557a557a557a557a557a0079557a75547a547a547a547a757561577901c261517959795979210ac407f0e4bd44bfc207355a778b046225a7068fc59ee7eda43ad905aadbffc800206c266b30e6a1319c66dc401e5bd6b432ba49688eecd118297041da8074ce08105b795679615679aa0079610079517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01007e81517a75615779567956795679567961537956795479577995939521414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff00517951796151795179970079009f63007952799367007968517a75517a75517a7561527a75517a517951795296a0630079527994527a75517a6853798277527982775379012080517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01205279947f7754537993527993013051797e527e54797e58797e527e53797e52797e57797e0079517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a756100795779ac517a75517a75517a75517a75517a75517a75517a75517a75517a7561517a75517a756169577961007961007982775179517954947f75517958947f77517a75517a756161007901007e81517a7561517a7561527a75517a57796100796100798277517951790128947f755179012c947f77517a75517a756161007901007e81517a7561517a7561517a75007905ffffffff009f6951795379a2695879a95479876959795979ac77777777777777777777'
    const i = rawTx.indexOf(lockingScript.slice(0, 100))
    const j = rawTx.indexOf(lockingScript.slice(lockingScript.length - 100))
    if (i >= 0 && j >= 0) {
      const pushtx = rawTx.slice(i, j + 100)
      expect(pushtx).toBe(lockingScript)
    }
    const ok = validateUnlockScript(rawTx, 0, lockingScript, 1001)
    expect(ok).toBe(true)
  })
})

function verifyTruthy<T>(v: T | undefined): T { if (v == null) throw new Error('must have value'); return v }

export function validateUnlockScript(spendingRawTx: string, vin: number, lockingScript: string, amount: number): boolean {
  const spendingTx = Transaction.fromHex(spendingRawTx)
  const ls = Script.fromHex(lockingScript)

  const us = spendingTx.inputs[0].unlockingScript?.toASM()
  const lsh = ls.toHex()
  const lsa = ls.toASM()

  const spend = new Spend({
    sourceTXID: verifyTruthy(spendingTx.inputs[vin].sourceTXID),
    sourceOutputIndex: spendingTx.inputs[vin].sourceOutputIndex,
    sourceSatoshis: amount,
    lockingScript: ls,
    transactionVersion: spendingTx.version,
    otherInputs: spendingTx.inputs.filter((v, i) => i !== vin),
    inputIndex: vin,
    unlockingScript: verifyTruthy(spendingTx.inputs[vin].unlockingScript),
    outputs: spendingTx.outputs,
    inputSequence: spendingTx.inputs[vin].sequence,
    lockTime: spendingTx.lockTime
  })

  const valid = spend.validate()
  return valid
}