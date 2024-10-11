import BigNumber from './BigNumber.js'
import Curve from './Curve.js'
import Point from './Point.js'
import { sha256 } from './Hash.js'
import { PrivateKey, PublicKey } from './index.js'


export default class Schnorr {
    private curve: Curve

    constructor() {
        this.curve = new Curve()
    }

    /**
     * Generates a proof that demonstrates the link between public key A and shared secret S
     * @param a Private key corresponding to public key A
     * @param A Public key
     * @param B Other party's public key
     * @param S Shared secret
     * @returns Proof (R, S', z)
     */
    generateProof(aArg: PrivateKey, AArg: PublicKey, BArg: PublicKey, S: Point): { R: Point, SPrime: Point, z: BigNumber } {
        // Convert private key to BigNumber
        const a = new BigNumber().add(aArg)
        
        // Generate random blinding factor r
        const r = new BigNumber().add(PrivateKey.fromRandom())

        // Compute R = rG
        const R = this.curve.g.mul(r)

        const A = new Point(AArg.getX(), AArg.getY())
        const B = new Point(BArg.getX(), BArg.getY())

        // Compute S' = rB
        const SPrime = B.mul(r)

        // Compute challenge e = H(A, B, S, S', R)
        const e = this.computeChallenge(A, B, S, SPrime, R)

        // Compute response z = r + e * a mod n
        const z = r.add(e.mul(a)).umod(this.curve.n)

        return { R, SPrime, z }
    }

    /**
     * Verifies the proof of the link between public key A and shared secret S
     * @param A Public key
     * @param B Other party's public key
     * @param S Shared secret
     * @param proof Proof (R, S', z)
     * @returns True if the proof is valid, false otherwise
     */
    verifyProof(A: Point, B: Point, S: Point, proof: { R: Point, SPrime: Point, z: BigNumber }): boolean {
        const { R, SPrime, z } = proof

        // Compute challenge e = H(A, B, S, S', R)
        const e = this.computeChallenge(A, B, S, SPrime, R)

        // Check zG = R + eA
        const zG = this.curve.g.mul(z)
        const RpluseA = R.add(A.mul(e))
        if (!zG.eq(RpluseA)) {
            return false
        }

        // Check zB = S' + eS
        const zB = B.mul(z)
        const SprimeeS = SPrime.add(S.mul(e))
        if (!zB.eq(SprimeeS)) {
            return false
        }

        return true
    }

    private computeChallenge(A: Point, B: Point, S: Point, SPrime: Point, R: Point): BigNumber {
        const message = [...A.encode(true), ...B.encode(true), ...S.encode(true), ...SPrime.encode(true), ...R.encode(true)] as number[]
        const hash = sha256(message)
        return new BigNumber(hash, 16).umod(this.curve.n)
    }
}

