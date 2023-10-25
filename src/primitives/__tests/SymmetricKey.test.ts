import SymmetricKey from '../../../dist/cjs/src/primitives/SymmetricKey'
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
  it('Encrypts values as an array', () => {
    const originalValue = [42, 99, 33, 0, 1]
    const encryptedValue = KEYS[2].encrypt(
      originalValue
    )
    const decryptedValue = KEYS[2].decrypt(
      encryptedValue
    )
    expect(originalValue).toEqual(decryptedValue)
  })
  it('Decrypts a correctly-encrypted value', () => {
    const result = KEYS[0].decrypt(CIPHERTEXT_1, 'hex') as string
    expect(Buffer.from(result, 'hex').toString('utf8')).toEqual(PLAINTEXT_1)
  })
  it('Throws a useful error when decryption fails', () => {
    expect(() => {
      KEYS[2].decrypt(
        CIPHERTEXT_1,
        'hex'
      )
    }).toThrow(new Error('Decryption failed!'))
  })
  it('decrypts values encrypted with the encrypt function', () => {
    const originalValue = 'secret value'
    const encryptedValue = KEYS[1].encrypt(originalValue)
    const decryptedValue = KEYS[1].decrypt(encryptedValue, 'utf8')
    expect(originalValue).toEqual(decryptedValue)
  })
  vectors.forEach((vector, index) => {
    it(`Should pass test vector #${index + 1}`, () => {
      const key = new SymmetricKey([...Buffer.from(vector.key, 'base64')])
      const result = key.decrypt(
        [...Buffer.from(vector.ciphertext, 'base64')],
        'hex'
      )
      expect(result).toEqual(Buffer.from(vector.plaintext).toString('hex'))
    })
  })
})
