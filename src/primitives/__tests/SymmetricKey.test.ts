import SymmetricKey from '../SymmetricKey'
import vectors from './SymmetricKey.vectors'

const KEYS: SymmetricKey[] = [
  new SymmetricKey('5a90d59d829197983a54d887fdea2dc4c38098f00ba3110f2645633b6ea11458', 16),
  new SymmetricKey('bac6ac492f54d7c997fadc1be593a4ace26ecdf37d30b3ad12f34077fb2629e4', 16),
  new SymmetricKey('53dcdc6ea6a6910af35a48708f49228e0e6661ea885435080cbabc58e6a14f10', 16)
]

const PLAINTEXT_1 = 'hello there'
const CIPHERTEXT_1 = '8c8d25348dfd5240be833215a123173c64919779ab8845a700a4520311504c168ade2d4b728cc53a254f0aba857caaf6af97453ac2ff61487d0d52'

describe('SymmetricKey', () => {
  it('Produces output that can be decrypted', () => {
    const originalValue = 'a thing to encrypt'
    const encryptedValue = KEYS[2].encrypt(originalValue)
    const decryptedValue = KEYS[2].decrypt(encryptedValue, 'utf8')
    expect(originalValue).toEqual(decryptedValue)
  })
  // it('Encrypts values of type Uint8Array', () => {
  //   const originalValue = new Uint8Array([42, 99, 33, 0, 1])
  //   const encryptedValue = encrypt(
  //     originalValue,
  //     getKey(2)
  //   )
  //   const decryptedValue = decrypt(
  //     encryptedValue,
  //     getKey(2),
  //     'Uint8Array'
  //   )
  //   expect(originalValue).toEqual(decryptedValue)
  // })
  // it('Can return the result as a Uint8Array', () => {
  //   const originalValue = new Uint8Array([5, 95, 6, 94])
  //   const encryptedValue = encrypt(
  //     originalValue,
  //     getKey(2),
  //     'Uint8Array'
  //   )
  //   expect(encryptedValue.constructor).toEqual(Uint8Array)
  // })
  it('Decrypts a correctly-encrypted value', () => {
    const result = KEYS[0].decrypt(CIPHERTEXT_1, 'hex')
    expect(result).toEqual(PLAINTEXT_1)
  })
  // it('Returns the decrypted value as a Uint8Array when appropriate', () => {
  //   const result = decrypt(CIPHERTEXT_1, getKey(1), 'Uint8Array')
  //   expect(result.constructor === Uint8Array).toBe(true)
  // })
  // it('Throws a useful error when decryption fails', () => {
  //   expect(decrypt(
  //     CIPHERTEXT_1,
  //     getKey(2)
  //   )).rejects.toThrow('Decryption failed!')
  // })
  // it('decrypts values encrypted with the encrypt function', () => {
  //   const originalValue = 'secret value'
  //   const encryptedValue = encrypt(originalValue, getKey(2))
  //   const decryptedValue = decrypt(encryptedValue, getKey(2))
  //   expect(originalValue).toEqual(decryptedValue)
  // })
  // it('Can decrypt Uint8Array ciphertexts', () => {
  //   const originalValue = 'secret value'
  //   const encryptedValue = encrypt(
  //     originalValue,
  //     getKey(2),
  //     'Uint8Array'
  //   )
  //   expect(encryptedValue.constructor).toEqual(Uint8Array)
  //   const decryptedValue = decrypt(encryptedValue, getKey(2))
  //   expect(originalValue).toEqual(decryptedValue)
  // })
  // vectors.forEach((vector, index) => {
  //   it(`Should pass test vector #${index + 1}`, () => {
  //     const importedKey = crypto.subtle.importKey(
  //       'raw',
  //       decodeUint8FromString(vector.key),
  //       { name: 'AES-GCM' },
  //       false,
  //       ['decrypt']
  //     )
  //     const result = decrypt(
  //       vector.ciphertext,
  //       importedKey
  //     )
  //     expect(result).toEqual(vector.plaintext)
  //   })
  // })
})
