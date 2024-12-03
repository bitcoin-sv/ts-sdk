import Certificate from '../../../dist/cjs/src/auth/Certificate.js'
import ProtoWallet from '../../../dist/cjs/src/wallet/ProtoWallet.js'
import { Utils, PrivateKey } from '../../../dist/cjs/src/primitives/index.js'

describe('Certificate', () => {
    // Sample data for testing
    const sampleType = Utils.toBase64(new Array(32).fill(1))
    const sampleSerialNumber = Utils.toBase64(new Array(32).fill(2))
    const sampleSubjectPrivateKey = PrivateKey.fromRandom()
    const sampleSubjectPubKey = sampleSubjectPrivateKey.toPublicKey().toString()
    const sampleCertifierPrivateKey = PrivateKey.fromRandom()
    const sampleCertifierPubKey = sampleCertifierPrivateKey.toPublicKey().toString()
    const sampleRevocationOutpoint = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef.1'
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

        const serialized = certificate.toBin(false) // Exclude signature
        const deserializedCertificate = Certificate.fromBin(serialized)

        expect(deserializedCertificate.type).toEqual(sampleType)
        expect(deserializedCertificate.serialNumber).toEqual(sampleSerialNumber)
        expect(deserializedCertificate.subject).toEqual(sampleSubjectPubKey)
        expect(deserializedCertificate.certifier).toEqual(sampleCertifierPubKey)
        expect(deserializedCertificate.revocationOutpoint).toEqual(sampleRevocationOutpoint)
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
        const certifierWallet: ProtoWallet = new ProtoWallet(sampleCertifierPrivateKey)
        await certificate.sign(certifierWallet)

        const serialized = certificate.toBin(true) // Include signature
        const deserializedCertificate = Certificate.fromBin(serialized)

        expect(deserializedCertificate.type).toEqual(sampleType)
        expect(deserializedCertificate.serialNumber).toEqual(sampleSerialNumber)
        expect(deserializedCertificate.subject).toEqual(sampleSubjectPubKey)
        expect(deserializedCertificate.certifier).toEqual(sampleCertifierPubKey)
        expect(deserializedCertificate.revocationOutpoint).toEqual(sampleRevocationOutpoint)
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
        const certifierWallet: ProtoWallet = new ProtoWallet(sampleCertifierPrivateKey)
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
        const certifierWallet: ProtoWallet = new ProtoWallet(sampleCertifierPrivateKey)
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
        await expect(certificate.verify()).rejects.toThrowErrorMatchingInlineSnapshot(`"Signature is not valid"`)
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
        const certifierWallet: ProtoWallet = new ProtoWallet(sampleCertifierPrivateKey)
        await certificate.sign(certifierWallet)

        // Serialize and deserialize
        const serialized = certificate.toBin(true)
        const deserializedCertificate = Certificate.fromBin(serialized)

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
            'deadbeef1234', // Placeholder signature
        )

        // Serialize without signature
        const serialized = certificate.toBin(false)
        const deserializedCertificate = Certificate.fromBin(serialized)

        expect(deserializedCertificate.signature).toBeUndefined() // Signature should be empty
        expect(deserializedCertificate.fields).toEqual(sampleFields)
    })

    it('should correctly handle certificates with long field names and values', async () => {
        const longFieldName = 'longFieldName_'.repeat(10) as any // Exceeding typical lengths
        const longFieldValue = 'longFieldValue_'.repeat(20)
        const fields = {
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
        const certifierWallet: ProtoWallet = new ProtoWallet(sampleCertifierPrivateKey)
        await certificate.sign(certifierWallet)

        // Serialize and deserialize
        const serialized = certificate.toBin(true)
        const deserializedCertificate = Certificate.fromBin(serialized)

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

        const serialized = certificate.toBin(false)
        const deserializedCertificate = Certificate.fromBin(serialized)

        expect(deserializedCertificate.revocationOutpoint).toEqual(sampleRevocationOutpoint)
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
        const certifierWallet: ProtoWallet = new ProtoWallet(sampleCertifierPrivateKey)
        await certificate.sign(certifierWallet)

        // Serialize and deserialize
        const serialized = certificate.toBin(true)
        const deserializedCertificate = Certificate.fromBin(serialized)

        expect(deserializedCertificate.fields).toEqual({})

        // Verify the signature
        const isValid = await deserializedCertificate.verify()
        expect(isValid).toBe(true)
    })
})