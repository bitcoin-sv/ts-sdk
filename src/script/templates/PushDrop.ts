import ScriptTemplate from '../ScriptTemplate.js'
import LockingScript from '../LockingScript.js'
import UnlockingScript from '../UnlockingScript.js'
import Transaction from '../../transaction/Transaction.js'
import { minimallyEncode } from 'src/primitives/utils.js'

// !!!!!!!!!
// To build this template, we want the wallet to exist first.
// Then we have protocolID, and the ts-sdk can know about signing.
// Then we can use getPublicKey and keep it all abstract.
// Otherwise we have to implement it using the "old" ways.
// Everyone will use Wallet interface once it exists.
// Even P2PKH and P2RPH will have the option to do that.
// Wallet will be first.

const OP_DROP = '75'
const OP_2DROP = '6d'

export default class PushDrop implements ScriptTemplate {
    async lock(protocolID: ProtocolID, keyID: string, counterparty: string, assetId: string, amount: number, metadata: string, forSelf = false): Promise<LockingScript> {
        const publicKey = await getPublicKey({
            protocolID,
            keyID,
            counterparty,
            forSelf
        })
        const lockPart = new LockingScript([
            { op: publicKey.length / 2, data: toArray(publicKey, 'hex') },
            { op: OP.OP_CHECKSIG }
        ]).toHex()
        const fields: Array<string | Uint8Array> = [
            assetId,
            String(amount),
            metadata
        ]
        const dataToSign = Buffer.concat(fields.map(x => Buffer.from(x)))
        const signature = await createSignature({
            data: dataToSign,
            protocolID,
            keyID,
            counterparty,
        })
        fields.push(signature)
        const pushPart = fields.reduce(
            (acc, el) => acc + minimallyEncode(el),
            ''
        )
        let dropPart = ''
        let notYetDropped = fields.length
        while (notYetDropped > 1) {
            dropPart += OP_2DROP
            notYetDropped -= 2
        }
        if (notYetDropped) {
            dropPart += OP_DROP
        }
        return LockingScript.fromHex(`${lockPart}${pushPart}${dropPart}`)
    }

    unlock(
        protocolID: ProtocolID,
        keyID: string,
        counterparty: string,
        sourceTXID?: string,
        sourceSatoshis?: number,
        lockingScript?: LockingScript,
        signOutputs: 'all' | 'none' | 'single' = 'all',
        anyoneCanPay = false
    ): {
        sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>
        estimateLength: () => Promise<72>
    } {
        return {
            sign: async (tx: Transaction, inputIndex: number): Promise<UnlockingScript> => {
                const input = tx.inputs[inputIndex]
                const otherInputs = tx.inputs.filter((_, index) => index !== inputIndex)
                sourceTXID = input.sourceTXID ? input.sourceTXID : input.sourceTransaction?.id('hex') as string
                if (!sourceTXID) {
                    throw new Error(
                        'The input sourceTXID or sourceTransaction is required for transaction signing.'
                    )
                }
                sourceSatoshis ||= input.sourceTransaction?.outputs[input.sourceOutputIndex].satoshis
                if (!sourceSatoshis) {
                    throw new Error(
                        'The sourceSatoshis or input sourceTransaction is required for transaction signing.'
                    )
                }
                lockingScript ||= input.sourceTransaction?.outputs[input.sourceOutputIndex].lockingScript
                if (!lockingScript) {
                    throw new Error(
                        'The lockingScript or input sourceTransaction is required for transaction signing.'
                    )
                }

                let signatureScope = TransactionSignature.SIGHASH_FORKID
                if (signOutputs === 'all') {
                    signatureScope |= TransactionSignature.SIGHASH_ALL
                }
                if (signOutputs === 'none') {
                    signatureScope |= TransactionSignature.SIGHASH_NONE
                }
                if (signOutputs === 'single') {
                    signatureScope |= TransactionSignature.SIGHASH_SINGLE
                }
                if (anyoneCanPay) {
                    signatureScope |= TransactionSignature.SIGHASH_ANYONECANPAY
                }

                const preimage = TransactionSignature.format({
                    sourceTXID,
                    sourceOutputIndex: input.sourceOutputIndex,
                    sourceSatoshis,
                    transactionVersion: tx.version,
                    otherInputs,
                    inputIndex,
                    outputs: tx.outputs,
                    inputSequence: input.sequence,
                    subscript: lockingScript,
                    lockTime: tx.lockTime,
                    scope: signatureScope
                })
                const preimageHash = sha256(preimage)
                const SDKSignature = await createSignature({
                    data: Uint8Array.from(preimageHash),
                    protocolID,
                    keyID,
                    counterparty
                })
                const rawSignature = Signature.fromDER([...SDKSignature])
                const sig = new TransactionSignature(
                    rawSignature.r,
                    rawSignature.s,
                    signatureScope
                )
                const sigForScript = sig.toChecksigFormat()
                return new UnlockingScript([
                    { op: sigForScript.length, data: sigForScript }
                ])
            },
            estimateLength: async () => 72
        }
    }
}