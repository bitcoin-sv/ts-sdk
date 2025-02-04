import { Certificate } from '../../../auth/index'
import { CompletedProtoWallet } from '../../../auth/certificates/__tests/CompletedProtoWallet'
import { Utils, PrivateKey } from '../../../primitives/index'

describe('Certificate', () => {
  // Sample data for testing
  const sampleType = Utils.toBase64(new Array(32).fill(1))
  const sampleSerialNumber = Utils.toBase64(new Array(32).fill(2))
  const sampleSubjectPrivateKey = PrivateKey.fromRandom()
  const sampleSubjectPubKey = sampleSubjectPrivateKey.toPublicKey().toString()
  const sampleCertifierPrivateKey = PrivateKey.fromRandom()
  const sampleCertifierPubKey = sampleCertifierPrivateKey
    .toPublicKey()
    .toString()
  const sampleRevocationOutpoint =
    'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef.1'
  const sampleFields = {
    name: 'Alice',
    email: 'alice@example.com',
    organization: 'Example Corp'
  }
  const sampleFieldsEmpty = {}

  it('should construct a Certificate with valid data', () => {
    const certificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey,
      sampleRevocationOutpoint,
      sampleFields,
      undefined // No signature
    )

    expect(certificate.type).toEqual(sampleType)
    expect(certificate.serialNumber).toEqual(sampleSerialNumber)
    expect(certificate.subject).toEqual(sampleSubjectPubKey)
    expect(certificate.certifier).toEqual(sampleCertifierPubKey)
    expect(certificate.revocationOutpoint).toEqual(sampleRevocationOutpoint)
    expect(certificate.signature).toBeUndefined()
    expect(certificate.fields).toEqual(sampleFields)
  })

  it('should serialize and deserialize the Certificate without signature', () => {
    const certificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey,
      sampleRevocationOutpoint,
      sampleFields,
      undefined // No signature
    )

    const serialized = certificate.toBinary(false) // Exclude signature
    const deserializedCertificate = Certificate.fromBinary(serialized)

    expect(deserializedCertificate.type).toEqual(sampleType)
    expect(deserializedCertificate.serialNumber).toEqual(sampleSerialNumber)
    expect(deserializedCertificate.subject).toEqual(sampleSubjectPubKey)
    expect(deserializedCertificate.certifier).toEqual(sampleCertifierPubKey)
    expect(deserializedCertificate.revocationOutpoint).toEqual(
      sampleRevocationOutpoint
    )
    expect(deserializedCertificate.signature).toBeUndefined()
    expect(deserializedCertificate.fields).toEqual(sampleFields)
  })

  it('should serialize and deserialize the Certificate with signature', async () => {
    const certificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey,
      sampleRevocationOutpoint,
      sampleFields,
      undefined // No signature
    )

    // Sign the certificate
    const certifierWallet = new CompletedProtoWallet(sampleCertifierPrivateKey)
    await certificate.sign(certifierWallet)

    const serialized = certificate.toBinary(true) // Include signature
    const deserializedCertificate = Certificate.fromBinary(serialized)

    expect(deserializedCertificate.type).toEqual(sampleType)
    expect(deserializedCertificate.serialNumber).toEqual(sampleSerialNumber)
    expect(deserializedCertificate.subject).toEqual(sampleSubjectPubKey)
    expect(deserializedCertificate.certifier).toEqual(sampleCertifierPubKey)
    expect(deserializedCertificate.revocationOutpoint).toEqual(
      sampleRevocationOutpoint
    )
    expect(deserializedCertificate.signature).toEqual(certificate.signature)
    expect(deserializedCertificate.fields).toEqual(sampleFields)
  })

  it('should sign the Certificate and verify the signature successfully', async () => {
    const certificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey,
      sampleRevocationOutpoint,
      sampleFields,
      undefined // No signature
    )

    // Sign the certificate
    const certifierWallet = new CompletedProtoWallet(sampleCertifierPrivateKey)
    await certificate.sign(certifierWallet)

    // Verify the signature
    const isValid = await certificate.verify()
    expect(isValid).toBe(true)
  })

  it('should fail verification if the Certificate is tampered with', async () => {
    const certificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey,
      sampleRevocationOutpoint,
      sampleFields,
      undefined // No signature
    )

    // Sign the certificate
    const certifierWallet = new CompletedProtoWallet(sampleCertifierPrivateKey)
    await certificate.sign(certifierWallet)

    // Tamper with the certificate (modify a field)
    certificate.fields.email = 'attacker@example.com'

    // Verify the signature
    await expect(certificate.verify()).rejects.toThrow()
  })

  it('should fail verification if the signature is missing', async () => {
    const certificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey,
      sampleRevocationOutpoint,
      sampleFields,
      undefined // No signature
    )

    // Verify the signature
    await expect(certificate.verify()).rejects.toThrow()
  })

  it('should fail verification if the signature is incorrect', async () => {
    const certificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey,
      sampleRevocationOutpoint,
      sampleFields,
      '3045022100cde229279465bb91992ccbc30bf6ed4eb8cdd9d517f31b30ff778d500d5400010220134f0e4065984f8668a642a5ad7a80886265f6aaa56d215d6400c216a4802177' // Incorrect signature
    )

    // Verify the signature
    await expect(
      certificate.verify()
    ).rejects.toThrowErrorMatchingInlineSnapshot('"Signature is not valid"')
  })

  it('should handle certificates with empty fields', async () => {
    const certificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey,
      sampleRevocationOutpoint,
      sampleFieldsEmpty,
      undefined // No signature
    )

    // Sign the certificate
    const certifierWallet = new CompletedProtoWallet(sampleCertifierPrivateKey)
    await certificate.sign(certifierWallet)

    // Serialize and deserialize
    const serialized = certificate.toBinary(true)
    const deserializedCertificate = Certificate.fromBinary(serialized)

    expect(deserializedCertificate.fields).toEqual(sampleFieldsEmpty)

    // Verify the signature
    const isValid = await deserializedCertificate.verify()
    expect(isValid).toBe(true)
  })

  it('should correctly handle serialization/deserialization when signature is excluded', () => {
    const certificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey,
      sampleRevocationOutpoint,
      sampleFields,
      'deadbeef1234' // Placeholder signature
    )

    // Serialize without signature
    const serialized = certificate.toBinary(false)
    const deserializedCertificate = Certificate.fromBinary(serialized)

    expect(deserializedCertificate.signature).toBeUndefined() // Signature should be empty
    expect(deserializedCertificate.fields).toEqual(sampleFields)
  })

  it('should correctly handle certificates with long field names and values', async () => {
    const longFieldName = 'longFieldName_'.repeat(10) // ✅ Removed `as any`
    const longFieldValue = 'longFieldValue_'.repeat(20)

    const fields: Record<string, string> = { // ✅ Explicitly type `fields`
      [longFieldName]: longFieldValue
    }

    const certificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey,
      sampleRevocationOutpoint,
      fields,
      undefined // No signature
    )

    // Sign the certificate
    const certifierWallet = new CompletedProtoWallet(sampleCertifierPrivateKey)
    await certificate.sign(certifierWallet)

    // Serialize and deserialize
    const serialized = certificate.toBinary(true)
    const deserializedCertificate = Certificate.fromBinary(serialized)

    expect(deserializedCertificate.fields).toEqual(fields)

    // Verify the signature
    const isValid = await deserializedCertificate.verify()
    expect(isValid).toBe(true)
  })

  it('should correctly serialize and deserialize the revocationOutpoint', () => {
    const certificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey,
      sampleRevocationOutpoint,
      sampleFields,
      undefined // No signature
    )

    const serialized = certificate.toBinary(false)
    const deserializedCertificate = Certificate.fromBinary(serialized)

    expect(deserializedCertificate.revocationOutpoint).toEqual(
      sampleRevocationOutpoint
    )
  })

  it('should correctly handle certificates with no fields', async () => {
    const certificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey,
      sampleRevocationOutpoint,
      {}, // No fields
      undefined // No signature
    )

    // Sign the certificate
    const certifierWallet = new CompletedProtoWallet(sampleCertifierPrivateKey)
    await certificate.sign(certifierWallet)

    // Serialize and deserialize
    const serialized = certificate.toBinary(true)
    const deserializedCertificate = Certificate.fromBinary(serialized)

    expect(deserializedCertificate.fields).toEqual({})

    // Verify the signature
    const isValid = await deserializedCertificate.verify()
    expect(isValid).toBe(true)
  })

  it("should throw if already signed, and should update the certifier field if it differs from the wallet's public key", async () => {
    // Scenario 1: Certificate already has a signature
    const preSignedCertificate = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      sampleCertifierPubKey, // We'll pretend this was signed by them
      sampleRevocationOutpoint,
      sampleFields,
      'deadbeef' // Already has a placeholder signature
    )
    const certifierWallet = new CompletedProtoWallet(sampleCertifierPrivateKey)

    // Trying to sign again should throw
    await expect(preSignedCertificate.sign(certifierWallet)).rejects.toThrow(
      'Certificate has already been signed!'
    )

    // Scenario 2: The certifier property is set to something different from the wallet's public key
    const mismatchedCertifierPubKey = PrivateKey.fromRandom()
      .toPublicKey()
      .toString()
    const certificateWithMismatch = new Certificate(
      sampleType,
      sampleSerialNumber,
      sampleSubjectPubKey,
      mismatchedCertifierPubKey, // Different from actual wallet key
      sampleRevocationOutpoint,
      sampleFields
    )

    // Sign the certificate; it should automatically update
    // the certifier field to match the wallet's actual public key
    const certifierPubKey = (
      await certifierWallet.getPublicKey({ identityKey: true })
    ).publicKey
    await certificateWithMismatch.sign(certifierWallet)
    expect(certificateWithMismatch.certifier).toBe(certifierPubKey)
    expect(await certificateWithMismatch.verify()).toBe(true)
  })
})
