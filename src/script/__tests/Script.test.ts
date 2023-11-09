import Script from '../../../dist/cjs/src/script/Script'
import OP from '../../../dist/cjs/src/script/OP'

import scriptInvalid from './script.invalid.vectors'
import scriptValid from './script.valid.vectors'

describe('Script', () => {
  it('should make a new script', () => {
    const script = new Script()
    expect(script).toBeDefined()
    expect(new Script().toASM()).toEqual('')
  })

  describe('#fromHex', () => {
    it('should parse this hex string containing an OP code', () => {
      const buf = Buffer.alloc(1)
      buf[0] = OP.OP_0
      const script = Script.fromHex(buf.toString('hex'))
      expect(script.chunks).toHaveLength(1)
      expect(script.chunks[0].op).toBe(buf[0])
    })
  })

  describe('#fromBinary', () => {
    it('should parse this buffer containing an OP code', () => {
      const buf = Buffer.alloc(1)
      buf[0] = OP.OP_0
      const script = Script.fromBinary(buf)
      expect(script.chunks).toHaveLength(1)
      expect(script.chunks[0].op).toBe(buf[0])
    })

    it('should parse this buffer containing another OP code', () => {
      const buf = Buffer.alloc(1)
      buf[0] = OP.OP_CHECKMULTISIG
      const script = Script.fromBinary(buf)
      expect(script.chunks).toHaveLength(1)
      expect(script.chunks[0].op).toBe(buf[0])
    })

    it('should parse this buffer containing three bytes of data', () => {
      const buf = Buffer.from([3, 1, 2, 3])
      const script = Script.fromBinary(buf)
      expect(script.chunks).toHaveLength(1)
      expect(script.chunks[0].data).toBe('010203')
    })

    it('should parse this buffer containing OP_PUSHDATA1 and zero bytes of data', () => {
      const buf = Buffer.from([0])
      buf[0] = OP('OP_PUSHDATA1').toNumber()
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('')
    })

    it('should parse this buffer containing OP_PUSHDATA2 and zero bytes of data', () => {
      const buf = Buffer.from([0])
      buf[0] = OP('OP_PUSHDATA2').toNumber()
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('')
    })

    it('should parse this buffer containing OP_PUSHDATA2 and three bytes of data', () => {
      const buf = Buffer.from([0, 0, 0, 1, 2, 3])
      buf[0] = OP('OP_PUSHDATA2').toNumber()
      buf.writeUInt16LE(3, 1)
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
    })

    it('should parse this buffer containing OP_PUSHDATA4 and zero bytes of data', () => {
      const buf = Buffer.from([0, 0])
      buf[0] = OP('OP_PUSHDATA4').toNumber()
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('')
    })

    it('should parse this buffer containing OP_PUSHDATA4 and three bytes of data', () => {
      const buf = Buffer.from([0, 0, 0, 0, 0, 1, 2, 3])
      buf[0] = OP('OP_PUSHDATA4').toNumber()
      buf.writeUInt16LE(3, 1)
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
    })

    it('should parse this buffer an OP code, data, and another OP code', () => {
      const buf = Buffer.from([0, 0, 0, 0, 0, 0, 1, 2, 3, 0])
      buf[0] = OP.OP_0.toNumber()
      buf[1] = OP('OP_PUSHDATA4').toNumber()
      buf.writeUInt16LE(3, 2)
      buf[buf.length - 1] = OP.OP_0.toNumber()
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(3)
      script.chunks[0].opCodeNum.should.equal(buf[0])
      script.chunks[1].buf.toString('hex').should.equal('010203')
      script.chunks[2].opCodeNum.should.equal(buf[buf.length - 1])
    })
  })

  describe('#toBuffer', () => {
    it('should output this hex string containing an OP code', () => {
      const buf = Buffer.alloc(1)
      buf[0] = OP.OP_0.toNumber()
      const script = Script.fromHex(buf.toString('hex'))
      script.chunks.length.should.equal(1)
      script.chunks[0].opCodeNum.should.equal(buf[0])
      script.toHex().should.equal(buf.toString('hex'))
    })
  })

  describe('#toBuffer', () => {
    it('should output this buffer containing an OP code', () => {
      const buf = Buffer.alloc(1)
      buf[0] = OP.OP_0.toNumber()
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].opCodeNum.should.equal(buf[0])
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should output this buffer containing another OP code', () => {
      const buf = Buffer.alloc(1)
      buf[0] = OP('OP_CHECKMULTISIG').toNumber()
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].opCodeNum.should.equal(buf[0])
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should output this buffer containing three bytes of data', () => {
      const buf = Buffer.from([3, 1, 2, 3])
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should output this buffer containing OP_PUSHDATA1 and three bytes of data', () => {
      const buf = Buffer.from([0, 0, 1, 2, 3])
      buf[0] = OP('OP_PUSHDATA1').toNumber()
      buf.writeUInt8(3, 1)
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should output this buffer containing OP_PUSHDATA2 and three bytes of data', () => {
      const buf = Buffer.from([0, 0, 0, 1, 2, 3])
      buf[0] = OP('OP_PUSHDATA2').toNumber()
      buf.writeUInt16LE(3, 1)
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should output this buffer containing OP_PUSHDATA4 and three bytes of data', () => {
      const buf = Buffer.from([0, 0, 0, 0, 0, 1, 2, 3])
      buf[0] = OP('OP_PUSHDATA4').toNumber()
      buf.writeUInt16LE(3, 1)
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(1)
      script.chunks[0].buf.toString('hex').should.equal('010203')
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })

    it('should output this buffer an OP code, data, and another OP code', () => {
      const buf = Buffer.from([0, 0, 0, 0, 0, 0, 1, 2, 3, 0])
      buf[0] = OP.OP_0.toNumber()
      buf[1] = OP('OP_PUSHDATA4').toNumber()
      buf.writeUInt16LE(3, 2)
      buf[buf.length - 1] = OP.OP_0.toNumber()
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(3)
      script.chunks[0].opCodeNum.should.equal(buf[0])
      script.chunks[1].buf.toString('hex').should.equal('010203')
      script.chunks[2].opCodeNum.should.equal(buf[buf.length - 1])
      script.toBuffer().toString('hex').should.equal(buf.toString('hex'))
    })
  })

  describe('#fromString', () => {
    it('should parse these known scripts', () => {
      new Script()
        .fromString('OP_0 OP_PUSHDATA4 3 0x010203 OP_0')
        .toString()
        .should.equal('OP_0 OP_PUSHDATA4 3 0x010203 OP_0')
      new Script()
        .fromString(
          'OP_DUP OP_HASH160 20 0x1451baa3aad777144a0759998a03538018dd7b4b OP_EQUALVERIFY OP_CHECKSIG'
        )
        .toString()
        .should.equal(
          'OP_DUP OP_HASH160 20 0x1451baa3aad777144a0759998a03538018dd7b4b OP_EQUALVERIFY OP_CHECKSIG'
        )
      new Script()
        .fromString(
          'OP_SHA256 32 0x8cc17e2a2b10e1da145488458a6edec4a1fdb1921c2d5ccbc96aa0ed31b4d5f8 OP_EQUALVERIFY OP_DUP OP_HASH160 20 0x1451baa3aad777144a0759998a03538018dd7b4b OP_EQUALVERIFY OP_CHECKSIGVERIFY OP_EQUALVERIFY OP_DUP OP_HASH160 20 0x1451baa3aad777144a0759998a03538018dd7b4b OP_EQUALVERIFY OP_CHECKSIG'
        )
        .toString()
        .should.equal(
          'OP_SHA256 32 0x8cc17e2a2b10e1da145488458a6edec4a1fdb1921c2d5ccbc96aa0ed31b4d5f8 OP_EQUALVERIFY OP_DUP OP_HASH160 20 0x1451baa3aad777144a0759998a03538018dd7b4b OP_EQUALVERIFY OP_CHECKSIGVERIFY OP_EQUALVERIFY OP_DUP OP_HASH160 20 0x1451baa3aad777144a0759998a03538018dd7b4b OP_EQUALVERIFY OP_CHECKSIG'
        )
      new Script()
        .fromString('OP_0 OP_PUSHDATA2 3 0x010203 OP_0')
        .toString()
        .should.equal('OP_0 OP_PUSHDATA2 3 0x010203 OP_0')
      new Script()
        .fromString('OP_0 OP_PUSHDATA1 3 0x010203 OP_0')
        .toString()
        .should.equal('OP_0 OP_PUSHDATA1 3 0x010203 OP_0')
      Script.fromString('OP_0 3 0x010203 OP_0').toString().should.equal('OP_0 3 0x010203 OP_0')
      Script.fromString('').toString().should.equal('')
      Script.fromString(undefined).toString().should.equal('')
    })
  })

  describe('#toString', () => {
    it('should output this buffer an OP code, data, and another OP code', () => {
      const buf = Buffer.from([0, 0, 0, 0, 0, 0, 1, 2, 3, 0])
      buf[0] = OP.OP_0.toNumber()
      buf[1] = OP('OP_PUSHDATA4').toNumber()
      buf.writeUInt16LE(3, 2)
      buf[buf.length - 1] = OP.OP_0.toNumber()
      const script = Script.fromBinary(buf)
      script.chunks.length.should.equal(3)
      script.chunks[0].opCodeNum.should.equal(buf[0])
      script.chunks[1].buf.toString('hex').should.equal('010203')
      script.chunks[2].opCodeNum.should.equal(buf[buf.length - 1])
      script.toString().should.equal('OP_0 OP_PUSHDATA4 3 0x010203 OP_0')
    })
  })

  describe('@fromASM', () => {
    it('should parse this known script in ASM', () => {
      const asm = 'OP_DUP OP_HASH160 f4c03610e60ad15100929cc23da2f3a799af1725 OP_EQUALVERIFY OP_CHECKSIG'
      const script = Script.fromASM(asm)
      script.chunks[0].opCodeNum.should.equal(OP.OP_DUP)
      script.chunks[1].opCodeNum.should.equal(OP.OP_HASH160)
      script.chunks[2].opCodeNum.should.equal(20)
      script.chunks[2].buf.toString('hex').should.equal('f4c03610e60ad15100929cc23da2f3a799af1725')
      script.chunks[3].opCodeNum.should.equal(OP.OP_EQUALVERIFY)
      script.chunks[4].opCodeNum.should.equal(OP.OP_CHECKSIG)
    })

    it('should parse this known problematic script in ASM', () => {
      const asm = 'OP_RETURN 026d02 0568656c6c6f'
      const script = Script.fromASM(asm)
      script.toASM().should.equal(asm)
    })

    it('should know this is invalid hex', () => {
      const asm = 'OP_RETURN 026d02 0568656c6c6fzz'

      const createScript = () => {
        const script = Script.fromASM(asm)
        return script.toASM()
      }

      // Expect the function to throw an error with the specified message
      expect(createScript).toThrow('invalid hex string in script')
    })

    it('should parse this long PUSHDATA1 script in ASM', () => {
      const buf = Buffer.alloc(220, 0)
      const asm = 'OP_RETURN ' + buf.toString('hex')
      const script = Script.fromASM(asm)
      script.chunks[1].opCodeNum.should.equal(OP.OP_PUSHDATA1)
      script.toASM().should.equal(asm)
    })

    it('should parse this long PUSHDATA2 script in ASM', () => {
      const buf = Buffer.alloc(1024, 0)
      const asm = 'OP_RETURN ' + buf.toString('hex')
      const script = Script.fromASM(asm)
      script.chunks[1].opCodeNum.should.equal(OP.OP_PUSHDATA2)
      script.toASM().should.equal(asm)
    })

    it('should parse this long PUSHDATA4 script in ASM', () => {
      const buf = Buffer.alloc(Math.pow(2, 17), 0)
      const asm = 'OP_RETURN ' + buf.toString('hex')
      const script = Script.fromASM(asm)
      script.chunks[1].opCodeNum.should.equal(OP.OP_PUSHDATA4)
      script.toASM().should.equal(asm)
    })

    it('should return this script correctly', () => {
      const asm1 = 'OP_FALSE'
      const asm2 = 'OP_0'
      const asm3 = '0'
      Script.fromASM(asm1).toASM().should.equal(asm3)
      Script.fromASM(asm2).toASM().should.equal(asm3)
      Script.fromASM(asm3).toASM().should.equal(asm3)
    })

    it('should return this script correctly', () => {
      const asm1 = 'OP_1NEGATE'
      const asm2 = '-1'
      Script.fromASM(asm1).toASM().should.equal(asm2)
      Script.fromASM(asm2).toASM().should.equal(asm2)
    })
  })

  describe('#removeCodeseparators', () => {
    it('should remove any OP_CODESEPARATORs', () => {
      Script.fromASM('OP_CODESEPARATOR OP_0 OP_CODESEPARATOR')
        .removeCodeseparators()
        .toString()
        .should.equal('OP_0')
    })
  })

  describe('#isPushOnly', () => {
    it("should know these scripts are or aren't push only", () => {
      Script.fromASM('OP_0').isPushOnly().should.equal(true)
      Script.fromASM('OP_0 OP_RETURN').isPushOnly().should.equal(false)
      Script.fromASM('OP_PUSHDATA1 5 0x1010101010').isPushOnly().should.equal(true)

      // like bitcoind, we regard OP_RESERVED as being "push only"
      Script.fromASM('OP_RESERVED').isPushOnly().should.equal(true)
    })
  })

  describe('vectors', () => {
    // eslint-disable-next-line ban/ban
    scriptValid.forEach((a, i) => {
      if (a.length === 1) {
        return
      }
      it('should not fail when reading scriptValid vector ' + i, () => {
        // The try-catch is used because Jest expects assertions
        // to be made with expect().toThrow() for exceptions.
        expect(() => {
          Script.fromASM(a[0]).toHex()
          Script.fromASM(a[0]).toASM()
        }).not.toThrow()

        expect(() => {
          Script.fromASM(a[1]).toHex()
          Script.fromASM(a[1]).toASM()
        }).not.toThrow()

        // should be able to return the same output over and over
        let str = Script.fromASM(a[0]).toASM()
        expect(Script.fromASM(str).toASM()).toEqual(str)
        str = Script.fromASM(a[1]).toASM()
        expect(Script.fromASM(str).toASM()).toEqual(str)
      })
    })

    // eslint-disable-next-line ban/ban
    scriptInvalid.forEach((a, i) => {
      if (a.length === 1) {
        return
      }

      it(`should not fail when reading scriptInvalid vector ${i}`, () => {
      // Test that no errors are thrown for the first item
        expect(() => {
          const scriptA = Script.fromASM(a[0])
          scriptA.toHex()
          scriptA.toASM()
        }).not.toThrow()

        // Test that no errors are thrown for the second item
        expect(() => {
          const scriptB = Script.fromASM(a[1])
          scriptB.toHex()
          scriptB.toASM()
        }).not.toThrow()

        // Test that it should be able to return the same output over and over for the first item
        const strA = Script.fromASM(a[0]).toASM()
        expect(Script.fromASM(strA).toASM()).toEqual(strA)

        // Test that it should be able to return the same output over and over for the second item
        const strB = Script.fromASM(a[1]).toASM()
        expect(Script.fromASM(strB).toASM()).toEqual(strB)
      })
    })
  })
})
