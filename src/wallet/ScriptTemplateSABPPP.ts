import { asBsvSdkPrivateKey, verifyTruthy } from ".";
import { LockingScript, P2PKH, PrivateKey, Script, ScriptTemplate, Transaction, UnlockingScript } from "@bsv/sdk";
import { sdk } from "./";

export interface ScriptTemplateParamsSABPPP {
    derivationPrefix?: string
    derivationSuffix?: string
    keyDeriver: sdk.KeyDeriverApi
}

export const brc29ProtocolID: sdk.WalletProtocol = [2, '3241645161d8']

export class ScriptTemplateSABPPP implements ScriptTemplate {
    p2pkh: P2PKH

    constructor(public params: ScriptTemplateParamsSABPPP) {
        this.p2pkh = new P2PKH()

        verifyTruthy(params.derivationPrefix)
        verifyTruthy(params.derivationSuffix)
    }

    getKeyID() { return `${this.params.derivationPrefix} ${this.params.derivationSuffix}` }

    getKeyDeriver(privKey: PrivateKey | sdk.HexString): sdk.KeyDeriverApi {
        if (typeof privKey === 'string')
            privKey = PrivateKey.fromHex(privKey)
        if (!this.params.keyDeriver || this.params.keyDeriver.rootKey.toHex() !== privKey.toHex())
            return new sdk.KeyDeriver(privKey)
        return this.params.keyDeriver
    }

    lock(lockerPrivKey: string, unlockerPubKey: string): LockingScript {
        const address = this.getKeyDeriver(lockerPrivKey).derivePublicKey(brc29ProtocolID, this.getKeyID(), unlockerPubKey, false).toAddress()
        const r = this.p2pkh.lock(address)
        return r
    }

    unlock(unlockerPrivKey: string, lockerPubKey: string, sourceSatoshis?: number, lockingScript?: Script)
        : {
            sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
            estimateLength: (tx?: Transaction, inputIndex?: number) => Promise<number>;
        } {
        const derivedPrivateKey = this.getKeyDeriver(unlockerPrivKey).derivePrivateKey(brc29ProtocolID, this.getKeyID(), lockerPubKey).toHex()
        const r = this.p2pkh.unlock(asBsvSdkPrivateKey(derivedPrivateKey), "all", false, sourceSatoshis, lockingScript)
        return r
    }

    /**
     * P2PKH unlock estimateLength is a constant 
     */
    unlockLength = 108

}