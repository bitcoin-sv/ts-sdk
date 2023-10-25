import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'

describe('BigNumber/Serializers', () => {
  describe('#fromJSON', () => {
    it('should make Bn from a string', () => {
      expect(BigNumber.fromJSON('5').toString()).toEqual('5')
    })
  })

  describe('#toJSON', () => {
    it('should make string from a Bn', () => {
      expect(new BigNumber(5).toJSON()).toEqual('5')
      expect(BigNumber.fromJSON('5').toJSON()).toEqual('5')
    })
  })

  describe('#fromString', () => {
    it('should make Bn from a string', () => {
      expect(BigNumber.fromString('5').toString()).toEqual('5')
    })
  })

  describe('#toString', () => {
    it('should make a string', () => {
      expect(new BigNumber(5).toString()).toEqual('5')
    })
  })

  describe('@fromBuffer', () => {
    it('should work with big endian', () => {
      const bn = BigNumber.fromBuffer(Buffer.from('0001', 'hex'), { endian: 'big' })
      expect(bn.toString()).toEqual('1')
    })

    it('should work with big endian 256', () => {
      const bn = BigNumber.fromBuffer(Buffer.from('0100', 'hex'), { endian: 'big' })
      expect(bn.toString()).toEqual('256')
    })

    it('should work with little endian if we specify the size', () => {
      const bn = BigNumber.fromBuffer(Buffer.from('0100', 'hex'), { endian: 'little' })
      expect(bn.toString()).toEqual('1')
    })
  })

  describe('#fromHex', () => {
    it('should create bn from known hex', () => {
      const bn = BigNumber.fromHex('0100', { endian: 'little' })
      expect(bn.toString()).toEqual('1')
    })
  })

  describe('#fromBuffer', () => {
    it('should work as a prototype method', () => {
      const bn = BigNumber.fromBuffer(Buffer.from('0100', 'hex'), { endian: 'little' })
      expect(bn.toString()).toEqual('1')
    })
  })

  describe('#toHex', () => {
    it('should create a hex string of 4 byte buffer', () => {
      const bn = new BigNumber(1)
      expect(bn.toHex({ size: 4 })).toEqual('00000001')
    })
  })

  describe('#toBuffer', () => {
    it('should convert zero to empty buffer', () => {
      expect(new BigNumber(0).toBuffer().length).toEqual(0)
    })

    it('should create a 4 byte buffer', () => {
      const bn = new BigNumber(1)
      expect(bn.toBuffer({ size: 4 }).toString('hex')).toEqual('00000001')
    })

    it('should create a 4 byte buffer in little endian', () => {
      const bn = new BigNumber(1)
      expect(bn.toBuffer({ size: 4, endian: 'little' }).toString('hex')).toEqual('01000000')
    })

    it('should create a 2 byte buffer even if you ask for a 1 byte', () => {
      const bn = new BigNumber('ff00', 16)
      expect(bn.toBuffer({ size: 1 }).toString('hex')).toEqual('ff00')
    })

    it('should create a 4 byte buffer even if you ask for a 1 byte', () => {
      const bn = new BigNumber('ffffff00', 16)
      expect(bn.toBuffer({ size: 4 }).toString('hex')).toEqual('ffffff00')
    })
  })

  describe('#toBits', () => {
    it('should convert these known Bns to bits', () => {
      expect(BigNumber.fromHex('00').toBits()).toEqual(0x00000000)
      expect(BigNumber.fromHex('01').toBits()).toEqual(0x01000001)
      expect(BigNumber.fromHex('0101').toBits()).toEqual(0x02000101)
      expect(BigNumber.fromHex('010101').toBits()).toEqual(0x03010101)
      expect(BigNumber.fromHex('01010101').toBits()).toEqual(0x04010101)
      expect(BigNumber.fromHex('0101010101').toBits()).toEqual(0x05010101)
      expect(BigNumber.fromHex('010101010101').toBits()).toEqual(0x06010101)
      expect(BigNumber.fromNumber(-1).toBits()).toEqual(0x01800001)
    })
  })

  describe('#fromBits', () => {
    it('should convert these known bits to Bns', () => {
      expect(BigNumber.fromBits(0x01003456).toHex()).toEqual('')
      expect(BigNumber.fromBits(0x02003456).toHex()).toEqual('34')
      expect(BigNumber.fromBits(0x03003456).toHex()).toEqual('3456')
      expect(BigNumber.fromBits(0x04003456).toHex()).toEqual('345600')
      expect(BigNumber.fromBits(0x05003456).toHex()).toEqual('34560000')
      expect(BigNumber.fromBits(0x05f03456).ltn(0)).toEqual(true) // sign bit set
      expect(() => BigNumber.fromBits(0x05f03456, { strict: true })).toThrow('negative bit set')
      expect(BigNumber.fromBits(0x04923456).ltn(0)).toEqual(true)
    })
  })

  describe('#toSm', () => {
    it('should convert to Sm', () => {
      let buf
      buf = new BigNumber().toSm()
      expect(buf.toString('hex')).toEqual('')
      buf = new BigNumber(5).toSm()
      expect(buf.toString('hex')).toEqual('05')
      buf = new BigNumber(-5).toSm()
      expect(buf.toString('hex')).toEqual('85')
      buf = new BigNumber(128).toSm()
      expect(buf.toString('hex')).toEqual('0080')
      buf = new BigNumber(-128).toSm()
      expect(buf.toString('hex')).toEqual('8080')
      buf = new BigNumber(127).toSm()
      expect(buf.toString('hex')).toEqual('7f')
      buf = new BigNumber(-127).toSm()
      expect(buf.toString('hex')).toEqual('ff')
      buf = new BigNumber(128).toSm({ endian: 'little' })
      expect(buf.toString('hex')).toEqual('8000')
      buf = new BigNumber(-128).toSm({ endian: 'little' })
      expect(buf.toString('hex')).toEqual('8080')
    })
  })

  describe('#fromSm', () => {
    it('should convert from Sm', () => {
      let buf
      buf = Buffer.from([0])
      expect(BigNumber.fromSm(buf).cmpn(0)).toEqual(0)
      buf = Buffer.from('05', 'hex')
      expect(BigNumber.fromSm(buf).cmpn(5)).toEqual(0)
      buf = Buffer.from('85', 'hex')
      expect(BigNumber.fromSm(buf).cmpn(-5)).toEqual(0)
      buf = Buffer.from('0080', 'hex')
      expect(BigNumber.fromSm(buf).cmpn(128)).toEqual(0)
      buf = Buffer.from('8080', 'hex')
      expect(BigNumber.fromSm(buf).cmpn(-128)).toEqual(0)
      buf = Buffer.from('8000', 'hex')
      expect(BigNumber.fromSm(buf, { endian: 'little' }).cmpn(128)).toEqual(0)
      buf = Buffer.from('8080', 'hex')
      expect(BigNumber.fromSm(buf, { endian: 'little' }).cmpn(-128)).toEqual(0)
      buf = Buffer.from('0080', 'hex') // negative zero
      expect(BigNumber.fromSm(buf, { endian: 'little' }).cmpn(0)).toEqual(0)
    })
  })

  describe('#toScriptNumBuffer', () => {
    it('should output a little endian Sm number', () => {
      const bn = new BigNumber(-23434234)
      expect(bn.toScriptNumBuffer().toString('hex')).toEqual(bn.toSm({ endian: 'little' }).toString('hex'))
    })
  })

  describe('#fromScriptNumBuffer', () => {
    it('should parse this normal number', () => {
      expect(BigNumber.fromScriptNumBuffer(Buffer.from('01', 'hex')).toNumber()).toEqual(1)
      expect(BigNumber.fromScriptNumBuffer(Buffer.from('0080', 'hex')).toNumber()).toEqual(0)
      expect(BigNumber.fromScriptNumBuffer(Buffer.from('0180', 'hex')).toNumber()).toEqual(-1)
    })

    it('should throw an error for a number over 4 bytes', () => {
      expect(() => BigNumber.fromScriptNumBuffer(Buffer.from('8100000000', 'hex'))).toThrow('script number overflow')
    })

    it('should throw an error for number that is not a minimal size representation', () => {
      expect(() => BigNumber.fromScriptNumBuffer(Buffer.from('80000000', 'hex'), true)).toThrow('non-minimally encoded script number')
      expect(() => BigNumber.fromScriptNumBuffer(Buffer.from('800000', 'hex'), true)).toThrow('non-minimally encoded script number')
      expect(() => BigNumber.fromScriptNumBuffer(Buffer.from('00', 'hex'), true)).toThrow('non-minimally encoded script number')
      expect(BigNumber.fromScriptNumBuffer(Buffer.from('8000', 'hex'), true).toString()).toEqual('128')
      expect(BigNumber.fromScriptNumBuffer(Buffer.from('0081', 'hex'), true).toString()).toEqual('-256')
      expect(BigNumber.fromScriptNumBuffer(Buffer.from('', 'hex'), true).toString()).toEqual('0')
      expect(BigNumber.fromScriptNumBuffer(Buffer.from('01', 'hex'), true).toString()).toEqual('1')
      expect(BigNumber.fromScriptNumBuffer(Buffer.from('00000000', 'hex')).toString()).toEqual('0')
    })
  })

  describe('#fromNumber', () => {
    it('should convert from a number', () => {
      expect(BigNumber.fromNumber(5).toNumber()).toEqual(5)
    })
  })

  describe('#toNumber', () => {
    it('it should convert to a number', () => {
      expect(new BigNumber(5).toNumber()).toEqual(5)
    })
  })
})
