import { Script, Transaction, TransactionInput } from "@bsv/sdk"
import { asBsvSdkScript, makeAtomicBeef, PendingSignAction, PendingStorageInput, verifyTruthy } from "./utilityHelpers.js"
import WalletSigner from './WalletSigner.js'
import { ScriptTemplateSABPPP } from './ScriptTemplateSABPPP.js'
import { sdk } from './sdk'

export async function createActionSdk(signer: WalletSigner, vargs: sdk.ValidCreateActionArgs)
    : Promise<sdk.CreateActionResult> {
    const r: sdk.CreateActionResult = {}

    let prior: PendingSignAction | undefined = undefined

    if (vargs.isNewTx) {
        prior = await createNewTx(signer, vargs)

        if (vargs.isSignAction) {
            return makeSignableTransactionResult(prior, signer, vargs)
        }

        prior.tx = await completeSignedTransaction(prior, {}, signer)

        r.txid = prior.tx.id('hex')
        r.noSendChange = prior.dcr.noSendChangeOutputVouts?.map(vout => `${r.txid}.${vout}`)
        if (!vargs.options.returnTXIDOnly)
            r.tx = makeAtomicBeef(prior.tx, prior.dcr.inputBeef!)
    }

    r.sendWithResults = await processActionSdk(prior, signer, vargs)

    return r
}

async function createNewTx(signer: WalletSigner, args: sdk.ValidCreateActionArgs)
    : Promise<PendingSignAction> {
    const storageArgs = removeUnlockScripts(args);
    const dcr = await signer.storage.createTransactionSdk(storageArgs)

    const reference = dcr.reference

    const { tx, amount, pdi } = buildSignableTransaction(dcr, args, signer)

    const prior: PendingSignAction = { reference, dcr, args, amount, tx, pdi }

    return prior
}

function makeSignableTransactionResult(prior: PendingSignAction, signer: WalletSigner, args: sdk.ValidCreateActionArgs)
    : sdk.CreateActionResult {
    if (!prior.dcr.inputBeef)
        throw new sdk.WERR_INTERNAL('prior.dcr.inputBeef must be valid')

    const txid = prior.tx.id('hex')

    const r: sdk.CreateActionResult = {
        noSendChange: args.isNoSend ? prior.dcr.noSendChangeOutputVouts?.map(vout => `${txid}.${vout}`) : undefined,
        signableTransaction: {
            reference: prior.dcr.reference,
            tx: makeAtomicBeef(prior.tx, prior.dcr.inputBeef)
        }
    }

    signer.pendingSignActions[r.signableTransaction!.reference] = prior

    return r
}

/**
 * Derive a change output locking script
 */
function makeChangeLock(
    out: sdk.StorageCreateTransactionSdkOutput,
    dctr: sdk.StorageCreateTransactionSdkResult,
    args: sdk.ValidCreateActionArgs,
    changeKeys: sdk.KeyPair,
    signer: WalletSigner)
    : Script {
    const derivationPrefix = dctr.derivationPrefix
    const derivationSuffix = verifyTruthy(out.derivationSuffix);
    const sabppp = new ScriptTemplateSABPPP({ derivationPrefix, derivationSuffix, keyDeriver: signer.keyDeriver });
    const lockingScript = sabppp.lock(changeKeys.privateKey, changeKeys.publicKey)
    return lockingScript
}

export async function completeSignedTransaction(
    prior: PendingSignAction,
    spends: Record<number, sdk.SignActionSpend>,
    signer: WalletSigner,
)
    : Promise<Transaction> {

    /////////////////////
    // Insert the user provided unlocking scripts from "spends" arg
    /////////////////////
    for (const [key, spend] of Object.entries(spends)) {
        const vin = Number(key)
        const createInput = prior.args.inputs[vin]
        const input = prior.tx.inputs[vin]
        if (!createInput || !input || createInput.unlockingScript || !Number.isInteger(createInput.unlockingScriptLength))
            throw new sdk.WERR_INVALID_PARAMETER('args', `spend does not correspond to prior input with valid unlockingScriptLength.`)
        if (spend.unlockingScript.length / 2 > createInput.unlockingScriptLength!)
            throw new sdk.WERR_INVALID_PARAMETER('args', `spend unlockingScript length ${spend.unlockingScript.length} exceeds expected length ${createInput.unlockingScriptLength}`)
        input.unlockingScript = asBsvSdkScript(spend.unlockingScript)
        if (spend.sequenceNumber !== undefined)
            input.sequence = spend.sequenceNumber
    }

    const results = {
        sdk: <sdk.SignActionResult>{}
    }

    /////////////////////
    // Insert SABPPP unlock templates for storage signed inputs
    /////////////////////
    for (const pdi of prior.pdi) {
        const sabppp = new ScriptTemplateSABPPP({
            derivationPrefix: pdi.derivationPrefix,
            derivationSuffix: pdi.derivationSuffix,
            keyDeriver: signer.keyDeriver
        })
        const keys = signer.getClientChangeKeyPair()
        const lockerPrivKey = keys.privateKey
        const unlockerPubKey = pdi.unlockerPubKey || keys.publicKey
        const sourceSatoshis = pdi.sourceSatoshis
        const lockingScript = asBsvSdkScript(pdi.lockingScript)
        const unlockTemplate = sabppp.unlock(lockerPrivKey, unlockerPubKey, sourceSatoshis, lockingScript)
        const input = prior.tx.inputs[pdi.vin]
        input.unlockingScriptTemplate = unlockTemplate
    }

    /////////////////////
    // Sign storage signed inputs making transaction fully valid.
    /////////////////////
    await prior.tx.sign()

    return prior.tx
}
function removeUnlockScripts(args: sdk.ValidCreateActionArgs) {
    let storageArgs = args
    if (!storageArgs.inputs.every(i => i.unlockingScript === undefined)) {
        // Never send unlocking scripts to storage, all it needs is the script length.
        storageArgs = { ...args, inputs: [] };
        for (const i of args.inputs) {
            const di: sdk.ValidCreateActionInput = {
                ...i,
                unlockingScriptLength: i.unlockingScript !== undefined ? i.unlockingScript.length : i.unlockingScriptLength
            };
            delete di.unlockingScript;
            storageArgs.inputs.push(di);
        }
    }
    return storageArgs;
}

export async function processActionSdk(prior: PendingSignAction | undefined, signer: WalletSigner, vargs: sdk.ValidProcessActionArgs)
    : Promise<sdk.SendWithResult[] | undefined> {
    const params: sdk.StorageProcessActionSdkParams = {
        userId: vargs.userId!, ////////////!!!!!!!!!!!!!!!!!!!!!!!!!!
        isNewTx: vargs.isNewTx,
        isSendWith: vargs.isSendWith,
        isNoSend: vargs.isNoSend,
        isDelayed: vargs.isDelayed,
        reference: prior ? prior.reference : undefined,
        txid: prior ? prior.tx.id('hex') : undefined,
        rawTx: prior ? prior.tx.toBinary() : undefined,
        sendWith: vargs.isSendWith ? vargs.options.sendWith : [],
    }
    const r: sdk.StorageProcessActionSdkResults = await signer.storage.processActionSdk(params)

    return r.sendWithResults
}

function buildSignableTransaction(
    dctr: sdk.StorageCreateTransactionSdkResult,
    args: sdk.ValidCreateActionArgs,
    signer: WalletSigner
)
    : { tx: Transaction, amount: number, pdi: PendingStorageInput[], log: string } {
    const changeKeys = signer.getClientChangeKeyPair()

    const {
        inputs: storageInputs,
        outputs: storageOutputs,
    } = dctr;

    const tx = new Transaction(args.version, [], [], args.lockTime);

    // The order of outputs in storageOutputs is always:
    // CreateActionArgs.outputs in the original order
    // Commission output
    // Change outputs
    // The Vout values will be randomized if args.options.randomizeOutputs is true. Default is true.
    const voutToIndex = Array<number>(storageOutputs.length)
    for (let vout = 0; vout < storageOutputs.length; vout++) {
        const i = storageOutputs.findIndex(o => o.vout === vout)
        if (i < 0)
            throw new sdk.WERR_INVALID_PARAMETER('output.vout', `sequential. ${vout} is missing`)
        voutToIndex[vout] = i
    }

    //////////////
    // Add OUTPUTS
    /////////////
    for (let vout = 0; vout < storageOutputs.length; vout++) {
        const i = voutToIndex[vout]
        const out = storageOutputs[i]
        if (vout !== out.vout)
            throw new sdk.WERR_INVALID_PARAMETER('output.vout', `equal to array index. ${out.vout} !== ${vout}`)

        const change = out.providedBy === 'storage' && out.purpose === 'change'

        const lockingScript = change ? makeChangeLock(out, dctr, args, changeKeys, signer) : asBsvSdkScript(out.lockingScript)

        const output = {
            satoshis: out.satoshis,
            lockingScript,
            change
        }
        tx.addOutput(output);
    }

    //////////////
    // Merge and sort INPUTS info by vin order.
    /////////////
    const inputs: {
        argsInput: sdk.ValidCreateActionInput | undefined,
        storageInput: sdk.StorageCreateTransactionSdkInput,
    }[] = []
    for (const storageInput of storageInputs) {
        const argsInput = (storageInput.vin !== undefined && storageInput.vin < args.inputs.length) ? args.inputs[storageInput.vin] : undefined
        inputs.push({ argsInput, storageInput })
    }
    inputs.sort((a, b) => a.storageInput.vin! < b.storageInput.vin! ? -1 : a.storageInput.vin! === b.storageInput.vin! ? 0 : 1)

    const pendingStorageInputs: PendingStorageInput[] = []

    //////////////
    // Add INPUTS
    /////////////
    let totalChangeInputs = 0
    for (const { storageInput, argsInput } of inputs) {
        // Two types of inputs are handled: user specified wth/without unlockingScript and storage specified using SABPPP template.
        if (argsInput) {
            // Type 1: User supplied input, with or without an explicit unlockingScript.
            // If without, signAction must be used to provide the actual unlockScript.
            const hasUnlock = typeof argsInput.unlockingScript === 'string'
            const unlock = hasUnlock ? asBsvSdkScript(argsInput.unlockingScript!) : new Script()
            const inputToAdd: TransactionInput = {
                sourceTXID: argsInput.outpoint.txid,
                sourceOutputIndex: argsInput.outpoint.vout,
                unlockingScript: unlock,
                sequence: argsInput.sequenceNumber
            };
            tx.addInput(inputToAdd);
        } else {
            // Type2: SABPPP protocol inputs which are signed using ScriptTemplateSABPPP.
            if (storageInput.type !== 'P2PKH')
                throw new sdk.WERR_INVALID_PARAMETER('type', `vin ${storageInput.vin}, "${storageInput.type}" is not a supported unlocking script type.`);

            pendingStorageInputs.push({
                vin: tx.inputs.length,
                derivationPrefix: verifyTruthy(storageInput.derivationPrefix),
                derivationSuffix: verifyTruthy(storageInput.derivationSuffix),
                unlockerPubKey: storageInput.senderIdentityKey,
                sourceSatoshis: storageInput.sourceSatoshis,
                lockingScript: storageInput.sourceLockingScript
            })

            const inputToAdd: TransactionInput = {
                sourceTXID: storageInput.sourceTxid,
                sourceOutputIndex: storageInput.sourceVout,
                unlockingScript: new Script(),
                sequence: 0xffffffff
            };
            tx.addInput(inputToAdd);
            totalChangeInputs += verifyTruthy(storageInput.sourceSatoshis);
        }
    }

    // The amount is the total of non-foreign inputs minus change outputs
    // Note that the amount can be negative when we are redeeming more inputs than we are spending
    const totalChangeOutputs = storageOutputs.filter(x => x.purpose === 'change').reduce((acc, el) => acc + el.satoshis, 0);
    const amount = totalChangeInputs - totalChangeOutputs;

    return {
        tx,
        amount,
        pdi: pendingStorageInputs,
        log: ''
    };
}