import Mnemonic from '../../../dist/cjs/src/compat/Mnemonic'
import { wordList as enWordList } from '../../../dist/cjs/src/compat/bip-39-wordlist-en'
import Random from '../../../dist/cjs/src/primitives/Random'
import vectors from './Mnemonic.vectors'
import HD from '../../../dist/cjs/src/compat/HD'
import { toBase58Check, toHex, toArray } from '../../../dist/cjs/src/primitives/utils'

describe('Mnemonic', function () {
  it('should initialize the class', () => {
    expect(Mnemonic).toBeDefined()
    expect(new Mnemonic()).toBeDefined()
  })

  it('should have a wordlist of length 2048', () => {
    expect(enWordList.value.length).toEqual(2048)
  })

  it('should handle this community-derived test vector', () => {
    // There was a bug in Copay and bip32jp about deriving addresses with Mnemonic
    // and bip44. This confirms we are handling the situation correctly and
    // derive the correct value.
    //
    // More information here:
    // https://github.com/iancoleman/bip39/issues/58
    const seed = Mnemonic.fromString('fruit wave dwarf banana earth journey tattoo true farm silk olive fence').toSeed(
      'banana'
    )
    let bip32 = HD.fromSeed(seed)
    bip32 = bip32.derive("m/44'/0'/0'/0/0")
    const pkh = bip32.pubKey.toHash()
    const addr = toBase58Check(pkh)
    expect(addr).toEqual('17rxURoF96VhmkcEGCj5LNQkmN9HVhWb7F')
  })

  it('should generate a mnemonic phrase that passes the check', () => {
    let mnemonic

    // should be able to make a mnemonic with or without the default wordlist
    let m = new Mnemonic().fromRandom(128)
    expect(m.check()).toEqual(true)
    m = new Mnemonic().fromRandom(128)
    expect(m.check()).toEqual(true)

    const entropy = Array(32)
    entropy.fill(0)
    m = new Mnemonic().fromEntropy(entropy)
    expect(m.check()).toEqual(true)

    mnemonic = m.mnemonic

    // mnemonics with extra whitespace do not pass the check
    m = new Mnemonic().fromString(mnemonic + ' ')
    expect(m.check()).toEqual(false)

    // mnemonics with a word replaced do not pass the check
    const words = mnemonic.split(' ')
    expect(words[words.length - 1]).not.toEqual('zoo')
    words[words.length - 1] = 'zoo'
    mnemonic = words.join(' ')
    expect(new Mnemonic().fromString(mnemonic).check()).toEqual(false)
  })

  describe('#toBinary', () => {
    it('should convert to a binary array', () => {
      const m = new Mnemonic().fromRandom()
      expect(m.seed).toBeDefined()
      expect(m.mnemonic).toBeDefined()
      const buf = m.toBinary()
      expect(buf.length).toBeGreaterThan(512 / 8 + 1 + 1)
    })
  })

  describe('#fromBinary', () => {
    it('should convert from a binary array', () => {
      const mA = new Mnemonic().fromRandom()
      const mB = new Mnemonic().fromBinary(mA.toBinary())
      expect(mA.mnemonic).toEqual(mB.mnemonic)
      expect(toHex(mA.seed)).toEqual(toHex(mB.seed))
    })
  })

  describe('#fromRandom', () => {
    it('should throw an error if bits is too low', () => {
      expect(() => {
        new Mnemonic().fromRandom(127)
      }).toThrow('bits must be multiple of 32')
    })

    it('should throw an error if bits is not a multiple of 32', () => {
      expect(() => {
        new Mnemonic().fromRandom(256 - 1)
      }).toThrow('bits must be multiple of 32')
    })
  })

  describe('@fromRandom', () => {
    it('should throw an error if bits is too low', () => {
      expect(() => {
        Mnemonic.fromRandom(127)
      }).toThrow('bits must be multiple of 32')
    })

    it('should throw an error if bits is not a multiple of 32', () => {
      expect(() => {
        Mnemonic.fromRandom(256 - 1)
      }).toThrow('bits must be multiple of 32')
    })
  })

  describe('#fromEntropy', () => {
    it('should build from entropy', () => {
      const m = new Mnemonic().fromEntropy(Random(32))
      expect(m).toBeDefined()
    })
  })

  describe('@fromEntropy', () => {
    it('should build from entropy', () => {
      const m = Mnemonic.fromEntropy(Random(32))
      expect(m).toBeDefined()
    })
  })

  describe('#entropy2Mnemonic', () => {
    it('should throw an error if you do not use enough entropy', () => {
      const buf = Buffer.alloc(128 / 8 - 1)
      buf.fill(0)
      expect(() => {
        new Mnemonic().entropy2Mnemonic([...buf])
      }).toThrow('Entropy is less than 128 bits. It must be 128 bits or more.')
    })
  })

  describe('#fromString', () => {
    it('should throw an error in invalid mnemonic', () => {
      expect(() => {
        new Mnemonic().fromString('invalid mnemonic').toSeed()
      }).toThrow(
        'Mnemonic does not pass the check - was the mnemonic typed incorrectly? Are there extra spaces?'
      )
    })
  })

  describe('@isValid', () => {
    it('should know this is valid', () => {
      const isValid = Mnemonic.isValid(
        'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        'TREZOR'
      )
      expect(isValid).toBe(true)
    })

    it('should know this is invalid', () => {
      const isValid = Mnemonic.isValid(
        'abandonnnnnnn abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
        'TREZOR'
      )
      expect(isValid).toEqual(false)
    })
  })

  describe('vectors', () => {
    // eslint-disable-next-line ban/ban
    vectors.english.forEach((vector, v) => {
      it('should pass english test vector ' + v, () => {
        const entropy = toArray(vector.entropy, 'hex')
        const m = new Mnemonic().fromEntropy(entropy)
        expect(m.toString()).toEqual(vector.mnemonic)
        expect(m.check()).toEqual(true)
        const seed = m.toSeed(vector.passphrase)
        expect(toHex(seed)).toEqual(vector.seed)
        expect(HD.fromSeed(seed).toString()).toEqual(vector.bip32_xprv)
      })
    })
  })
})
