import BigNumber from './BigNumber.js'
import Curve from './Curve.js'
import Point from './Point.js'
import { sha256 } from './Hash.js'
import { PrivateKey, PublicKey } from './index.js'

/**
 * Class representing the Schnorr Zero-Knowledge Proof (ZKP) protocol.
 *
 * This class provides methods to generate and verify proofs that demonstrate knowledge of a secret without revealing it.
 * Specifically, it allows one party to prove to another that they know the private key corresponding to a public key
 * and have correctly computed a shared secret, without disclosing the private key itself.
 *
 * The protocol involves two main methods:
 * - `generateProof`: Generates a proof linking a public key `A` and a shared secret `S`, proving knowledge of the corresponding private key `a`.
 * - `verifyProof`: Verifies the provided proof, ensuring its validity without revealing any secret information.
 *
 * The class utilizes elliptic curve cryptography (ECC) and the SHA-256 hash function to compute challenges within the proof.
 *
 * @example
 * ```typescript
 * const schnorr = new Schnorr();
 * const a = PrivateKey.fromRandom(); // Prover's private key
 * const A = a.toPublicKey();         // Prover's public key
 * const b = PrivateKey.fromRandom(); // Other party's private key
 * const B = b.toPublicKey();         // Other party's public key
 * const S = B.mul(a);                // Shared secret
 *
 * // Prover generates the proof
 * const proof = schnorr.generateProof(a, A, B, S);
 *
 * // Verifier verifies the proof
 * const isValid = schnorr.verifyProof(A.point, B.point, S.point, proof);
 * console.log(`Proof is valid: ${isValid}`);
 * ```
 */
export default class Schnorr {
  private readonly curve: Curve

  constructor () {
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
  generateProof (
    aArg: PrivateKey,
    AArg: PublicKey,
    BArg: PublicKey,
    S: Point
  ): { R: Point, SPrime: Point, z: BigNumber } {
    const r = PrivateKey.fromRandom()
    const R = r.toPublicKey()
    const SPrime = BArg.mul(r)
    const e = this.computeChallenge(AArg, BArg, S, SPrime, R)
    const z = r.add(e.mul(aArg)).umod(this.curve.n)
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
  verifyProof (
    A: Point,
    B: Point,
    S: Point,
    proof: { R: Point, SPrime: Point, z: BigNumber }
  ): boolean {
    const { R, SPrime, z } = proof
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

  private computeChallenge (
    A: Point,
    B: Point,
    S: Point,
    SPrime: Point,
    R: Point
  ): BigNumber {
    const message = [
      ...A.encode(true),
      ...B.encode(true),
      ...S.encode(true),
      ...SPrime.encode(true),
      ...R.encode(true)
    ] as number[]
    const hash = sha256(message)
    return new BigNumber(hash).umod(this.curve.n)
  }
}
