import Schnorr from '../../primitives/Schnorr'
import BigNumber from '../../primitives/BigNumber'
import Curve from '../../primitives/Curve'
import PrivateKey from '../../primitives/PrivateKey'
import PublicKey from '../../primitives/PublicKey'
import Point from '../../primitives/Point'

describe('Schnorr Zero-Knowledge Proof', () => {
  let schnorr: Schnorr
  let curve: Curve

  beforeAll(() => {
    schnorr = new Schnorr()
    curve = new Curve()
  })

  it('should verify a valid proof', () => {
    // Generate private keys
    const a = PrivateKey.fromRandom()
    const b = PrivateKey.fromRandom()

    // Compute public keys
    const A = a.toPublicKey()
    const B = b.toPublicKey()

    // Compute shared secret S = B * a
    const S = B.mul(a)

    // Generate proof
    const proof = schnorr.generateProof(a, A, B, S)

    // Verify proof
    const result = schnorr.verifyProof(A, B, S, proof)
    expect(result).toBe(true)
  })

  it('should fail verification if proof is tampered (R modified)', () => {
    // Generate private keys
    const a = PrivateKey.fromRandom()
    const b = PrivateKey.fromRandom()

    // Compute public keys
    const A = a.toPublicKey()
    const B = b.toPublicKey()

    // Compute shared secret S = B * a
    const S = B.mul(a)

    // Generate proof
    const proof = schnorr.generateProof(a, A, B, S)

    // Tamper with R
    const tamperedR = proof.R.add(curve.g)
    const tamperedProof = { ...proof, R: tamperedR }

    // Verify proof
    const result = schnorr.verifyProof(A, B, S, tamperedProof)
    expect(result).toBe(false)
  })

  it('should fail verification if proof is tampered (z modified)', () => {
    // Generate private keys
    const a = PrivateKey.fromRandom()
    const b = PrivateKey.fromRandom()

    // Compute public keys
    const A = a.toPublicKey()
    const B = b.toPublicKey()

    // Compute shared secret S = B * a
    const S = B.mul(a)

    // Generate proof
    const proof = schnorr.generateProof(a, A, B, S)

    // Tamper with z
    const tamperedZ = proof.z.add(new BigNumber(1)).umod(curve.n)
    const tamperedProof = { ...proof, z: tamperedZ }

    // Verify proof
    const result = schnorr.verifyProof(A, B, S, tamperedProof)
    expect(result).toBe(false)
  })

  it("should fail verification if proof is tampered (S' modified)", () => {
    // Generate private keys
    const a = PrivateKey.fromRandom()
    const b = PrivateKey.fromRandom()

    // Compute public keys
    const A = a.toPublicKey()
    const B = b.toPublicKey()

    // Compute shared secret S = B * a
    const S = B.mul(a)

    // Generate proof
    const proof = schnorr.generateProof(a, A, B, S)

    // Tamper with S'
    const tamperedSPrime = proof.SPrime.add(curve.g)
    const tamperedProof = { ...proof, SPrime: tamperedSPrime }

    // Verify proof
    const result = schnorr.verifyProof(A, B, S, tamperedProof)
    expect(result).toBe(false)
  })

  it('should fail verification if inputs are tampered (A modified)', () => {
    // Generate private keys
    const a = PrivateKey.fromRandom()
    const b = PrivateKey.fromRandom()

    // Compute public keys
    const A = a.toPublicKey()
    const B = b.toPublicKey()

    // Compute shared secret S = B * a
    const S = B.mul(a)

    // Generate proof
    const proof = schnorr.generateProof(a, A, B, S)

    // Tamper with A
    const tamperedA = A.add(curve.g)

    // Verify proof
    const result = schnorr.verifyProof(tamperedA, B, S, proof)
    expect(result).toBe(false)
  })

  it('should fail verification if inputs are tampered (B modified)', () => {
    // Generate private keys
    const a = PrivateKey.fromRandom()
    const b = PrivateKey.fromRandom()

    // Compute public keys
    const A = a.toPublicKey()
    const B = b.toPublicKey()

    // Compute shared secret S = B * a
    const S = B.mul(a)

    // Generate proof
    const proof = schnorr.generateProof(a, A, B, S)

    // Tamper with B
    const tamperedB = B.add(curve.g)

    // Verify proof
    const result = schnorr.verifyProof(A, tamperedB, S, proof)
    expect(result).toBe(false)
  })

  it('should fail verification if inputs are tampered (S modified)', () => {
    // Generate private keys
    const a = PrivateKey.fromRandom()
    const b = PrivateKey.fromRandom()

    // Compute public keys
    const A = a.toPublicKey()
    const B = b.toPublicKey()

    // Compute shared secret S = B * a
    const S = B.mul(a)

    // Generate proof
    const proof = schnorr.generateProof(a, A, B, S)

    // Tamper with S
    const tamperedS = S.add(curve.g)

    // Verify proof
    const result = schnorr.verifyProof(A, B, tamperedS, proof)
    expect(result).toBe(false)
  })

  it('should fail verification if using wrong private key', () => {
    // Generate private keys
    const a = PrivateKey.fromRandom()
    const wrongA = PrivateKey.fromRandom()
    const b = PrivateKey.fromRandom()

    // Compute public keys
    const A = a.toPublicKey()
    const B = b.toPublicKey()

    // Compute shared secret S = B * a
    const S = B.mul(a)

    // Generate proof using wrong private key
    const proof = schnorr.generateProof(wrongA, A, B, S)

    // Verify proof
    const result = schnorr.verifyProof(A, B, S, proof)
    expect(result).toBe(false)
  })

  it('should fail verification if using wrong public key', () => {
    // Generate private keys
    const a = PrivateKey.fromRandom()
    const b = PrivateKey.fromRandom()
    const wrongB = PrivateKey.fromRandom()

    // Compute public keys
    const A = a.toPublicKey()
    const B = b.toPublicKey()
    const wrongBPublic = wrongB.toPublicKey()

    // Compute shared secret S = B * a
    const S = B.mul(a)

    // Generate proof
    const proof = schnorr.generateProof(a, A, B, S)

    // Verify proof with wrong B
    const result = schnorr.verifyProof(A, wrongBPublic, S, proof)
    expect(result).toBe(false)
  })

  it('should fail verification if shared secret S is incorrect', () => {
    // Generate private keys
    const a = PrivateKey.fromRandom()
    const b = PrivateKey.fromRandom()

    // Compute public keys
    const A = a.toPublicKey()
    const B = b.toPublicKey()

    // Intentionally compute incorrect shared secret
    const S = B.mul(a).add(curve.g)

    // Generate proof with correct S
    const proof = schnorr.generateProof(a, A, B, B.mul(a))

    // Verify proof with incorrect S
    const result = schnorr.verifyProof(A, B, S, proof)
    expect(result).toBe(false)
  })

  it('should verify a valid proof with fixed keys', () => {
    // Use fixed private keys for determinism
    const a = new PrivateKey(
      new BigNumber(
        '123456789abcdef123456789abcdef123456789abcdef123456789abcdef',
        16
      )
    )
    const b = new PrivateKey(
      new BigNumber(
        'abcdef123456789abcdef123456789abcdef123456789abcdef123456789',
        16
      )
    )

    // Compute public keys
    const A = a.toPublicKey()
    const B = b.toPublicKey()

    // Compute shared secret S = B * a
    const S = B.mul(a)

    // Generate proof
    const proof = schnorr.generateProof(a, A, B, S)

    // Verify proof
    const result = schnorr.verifyProof(A, B, S, proof)
    expect(result).toBe(true)
  })

  it('should throw an error if inputs are invalid', () => {
    const a = PrivateKey.fromRandom()
    const b = PrivateKey.fromRandom()
    const A = a.toPublicKey()
    const B = b.toPublicKey()
    const S = B.mul(a)
    const proof = schnorr.generateProof(a, A, B, S)

    expect(() => schnorr.verifyProof(null as unknown as PublicKey, B, S, proof)).toThrow()
    expect(() => schnorr.verifyProof(A, null as unknown as PublicKey, S, proof)).toThrow()
    expect(() => schnorr.verifyProof(A, B, null as unknown as PublicKey, proof)).toThrow()
    expect(() => schnorr.verifyProof(A, B, S, null as unknown as { R: Point, SPrime: Point, z: BigNumber })).toThrow() // ✅ Correct cast
  })
})
