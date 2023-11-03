/* eslint-env jest */
import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'

describe('BN.js/Utils', () => {
  describe('.toString()', () => {
    describe('hex no padding', () => {
      it('should have same length as input', () => {
        let hex = '1'
        for (let i = 1; i <= 128; i++) {
          const n = new BigNumber(hex, 16)
          expect(n.toString(16).length).toEqual(i)
          hex = hex + '0'
        }
      })
    })
    describe('binary padding', () => {
      it('should have a length of 256', () => {
        const a = new BigNumber(0)

        expect(a.toString(2, 256).length).toEqual(256)
      })
    })
    describe('hex padding', () => {
      it('should have length of 8 from leading 15', () => {
        const a = new BigNumber('ffb9602', 16)

        expect(a.toString('hex', 2).length).toEqual(8)
      })

      it('should have length of 8 from leading zero', () => {
        const a = new BigNumber('fb9604', 16)

        expect(a.toString('hex', 8).length).toEqual(8)
      })

      it('should have length of 8 from leading zeros', () => {
        const a = new BigNumber(0)

        expect(a.toString('hex', 8).length).toEqual(8)
      })

      it('should have length of 64 from leading 15', () => {
        const a = new BigNumber(
          'ffb96ff654e61130ba8422f0debca77a0ea74ae5ea8bca9b54ab64aabf01003',
          16)

        expect(a.toString('hex', 2).length).toEqual(64)
      })

      it('should have length of 64 from leading zero', () => {
        const a = new BigNumber(
          'fb96ff654e61130ba8422f0debca77a0ea74ae5ea8bca9b54ab64aabf01003',
          16)

        expect(a.toString('hex', 64).length).toEqual(64)
      })
    })
  })

  describe('.isNeg()', () => {
    it('should return true for negative numbers', () => {
      expect(new BigNumber(-1).isNeg()).toEqual(true)
      expect(new BigNumber(1).isNeg()).toEqual(false)
      expect(new BigNumber(0).isNeg()).toEqual(false)
      expect(new BigNumber('-0', 10).isNeg()).toEqual(false)
    })
  })

  describe('.isOdd()', () => {
    it('should return true for odd numbers', () => {
      expect(new BigNumber(0).isOdd()).toEqual(false)
      expect(new BigNumber(1).isOdd()).toEqual(true)
      expect(new BigNumber(2).isOdd()).toEqual(false)
      expect(new BigNumber('-0', 10).isOdd()).toEqual(false)
      expect(new BigNumber('-1', 10).isOdd()).toEqual(true)
      expect(new BigNumber('-2', 10).isOdd()).toEqual(false)
    })
  })

  describe('.isEven()', () => {
    it('should return true for even numbers', () => {
      expect(new BigNumber(0).isEven()).toEqual(true)
      expect(new BigNumber(1).isEven()).toEqual(false)
      expect(new BigNumber(2).isEven()).toEqual(true)
      expect(new BigNumber('-0', 10).isEven()).toEqual(true)
      expect(new BigNumber('-1', 10).isEven()).toEqual(false)
      expect(new BigNumber('-2', 10).isEven()).toEqual(true)
    })
  })

  describe('.isZero()', () => {
    it('should return true for zero', () => {
      expect(new BigNumber(0).isZero()).toEqual(true)
      expect(new BigNumber(1).isZero()).toEqual(false)
      expect(new BigNumber(0xffffffff).isZero()).toEqual(false)
    })
  })

  describe('.bitLength()', () => {
    it('should return proper bitLength', () => {
      expect(new BigNumber(0).bitLength()).toEqual(0)
      expect(new BigNumber(0x1).bitLength()).toEqual(1)
      expect(new BigNumber(0x2).bitLength()).toEqual(2)
      expect(new BigNumber(0x3).bitLength()).toEqual(2)
      expect(new BigNumber(0x4).bitLength()).toEqual(3)
      expect(new BigNumber(0x8).bitLength()).toEqual(4)
      expect(new BigNumber(0x10).bitLength()).toEqual(5)
      expect(new BigNumber(0x100).bitLength()).toEqual(9)
      expect(new BigNumber(0x123456).bitLength()).toEqual(21)
      expect(new BigNumber('123456789', 16).bitLength()).toEqual(33)
      expect(new BigNumber('8023456789', 16).bitLength()).toEqual(40)
    })
  })

  describe('.byteLength()', () => {
    it('should return proper byteLength', () => {
      expect(new BigNumber(0).byteLength()).toEqual(0)
      expect(new BigNumber(0x1).byteLength()).toEqual(1)
      expect(new BigNumber(0x2).byteLength()).toEqual(1)
      expect(new BigNumber(0x3).byteLength()).toEqual(1)
      expect(new BigNumber(0x4).byteLength()).toEqual(1)
      expect(new BigNumber(0x8).byteLength()).toEqual(1)
      expect(new BigNumber(0x10).byteLength()).toEqual(1)
      expect(new BigNumber(0x100).byteLength()).toEqual(2)
      expect(new BigNumber(0x123456).byteLength()).toEqual(3)
      expect(new BigNumber('123456789', 16).byteLength()).toEqual(5)
      expect(new BigNumber('8023456789', 16).byteLength()).toEqual(5)
    })
  })

  describe('.toArray()', () => {
    it('should return [ 0 ] for `0`', () => {
      const n = new BigNumber(0)
      expect(n.toArray('be')).toEqual([0])
      expect(n.toArray('le')).toEqual([0])
    })

    it('should zero pad to desired lengths', () => {
      const n = new BigNumber(0x123456)
      expect(n.toArray('be', 5)).toEqual([0x00, 0x00, 0x12, 0x34, 0x56])
      expect(n.toArray('le', 5)).toEqual([0x56, 0x34, 0x12, 0x00, 0x00])
    })

    it('should throw when naturally larger than desired length', () => {
      const n = new BigNumber(0x123456)
      expect(() => {
        n.toArray('be', 2)
      }).toThrow(new Error('byte array longer than desired length'))
    })
  })

  describe('.toNumber()', () => {
    it('should return proper Number if below the limit', () => {
      expect(new BigNumber(0x123456).toNumber()).toEqual(0x123456)
      expect(new BigNumber(0x3ffffff).toNumber()).toEqual(0x3ffffff)
      expect(new BigNumber(0x4000000).toNumber()).toEqual(0x4000000)
      expect(new BigNumber(0x10000000000000).toNumber()).toEqual(0x10000000000000)
      expect(new BigNumber(0x10040004004000).toNumber()).toEqual(0x10040004004000)
      expect(new BigNumber(-0x123456).toNumber()).toEqual(-0x123456)
      expect(new BigNumber(-0x3ffffff).toNumber()).toEqual(-0x3ffffff)
      expect(new BigNumber(-0x4000000).toNumber()).toEqual(-0x4000000)
      expect(new BigNumber(-0x10000000000000).toNumber()).toEqual(-0x10000000000000)
      expect(new BigNumber(-0x10040004004000).toNumber()).toEqual(-0x10040004004000)
    })

    it('should throw when number exceeds 53 bits', () => {
      const n = new BigNumber(1).iushln(54)
      expect(() => {
        n.toNumber()
      }).toThrow(new Error('Number can only safely store up to 53 bits'))
    })
  })

  describe('.zeroBits()', () => {
    it('should return proper zeroBits', () => {
      expect(new BigNumber(0).zeroBits()).toEqual(0)
      expect(new BigNumber(0x1).zeroBits()).toEqual(0)
      expect(new BigNumber(0x2).zeroBits()).toEqual(1)
      expect(new BigNumber(0x3).zeroBits()).toEqual(0)
      expect(new BigNumber(0x4).zeroBits()).toEqual(2)
      expect(new BigNumber(0x8).zeroBits()).toEqual(3)
      expect(new BigNumber(0x10).zeroBits()).toEqual(4)
      expect(new BigNumber(0x100).zeroBits()).toEqual(8)
      expect(new BigNumber(0x1000000).zeroBits()).toEqual(24)
      expect(new BigNumber(0x123456).zeroBits()).toEqual(1)
    })
  })

  describe('.toJSON', () => {
    it('should return hex string', () => {
      expect(new BigNumber(0x123).toJSON()).toEqual('123')
    })
  })

  describe('.cmpn', () => {
    it('should return -1, 0, 1 correctly', () => {
      expect(new BigNumber(42).cmpn(42)).toEqual(0)
      expect(new BigNumber(42).cmpn(43)).toEqual(-1)
      expect(new BigNumber(42).cmpn(41)).toEqual(1)
      expect(new BigNumber(0x3fffffe).cmpn(0x3fffffe)).toEqual(0)
      expect(new BigNumber(0x3fffffe).cmpn(0x3ffffff)).toEqual(-1)
      expect(new BigNumber(0x3fffffe).cmpn(0x3fffffd)).toEqual(1)
      expect(() => {
        new BigNumber(0x3fffffe).cmpn(0x4000000)
      }).toThrow(new Error('Number is too big'))
      expect(new BigNumber(42).cmpn(-42)).toEqual(1)
      expect(new BigNumber(-42).cmpn(42)).toEqual(-1)
      expect(new BigNumber(-42).cmpn(-42)).toEqual(0)
      expect(1 / new BigNumber(-42).cmpn(-42)).toEqual(Infinity)
    })
  })

  describe('.cmp', () => {
    it('should return -1, 0, 1 correctly', () => {
      expect(new BigNumber(42).cmp(new BigNumber(42))).toEqual(0)
      expect(new BigNumber(42).cmp(new BigNumber(43))).toEqual(-1)
      expect(new BigNumber(42).cmp(new BigNumber(41))).toEqual(1)
      expect(new BigNumber(0x3fffffe).cmp(new BigNumber(0x3fffffe))).toEqual(0)
      expect(new BigNumber(0x3fffffe).cmp(new BigNumber(0x3ffffff))).toEqual(-1)
      expect(new BigNumber(0x3fffffe).cmp(new BigNumber(0x3fffffd))).toEqual(1)
      expect(new BigNumber(0x3fffffe).cmp(new BigNumber(0x4000000))).toEqual(-1)
      expect(new BigNumber(42).cmp(new BigNumber(-42))).toEqual(1)
      expect(new BigNumber(-42).cmp(new BigNumber(42))).toEqual(-1)
      expect(new BigNumber(-42).cmp(new BigNumber(-42))).toEqual(0)
      expect(1 / new BigNumber(-42).cmp(new BigNumber(-42))).toEqual(Infinity)
    })
  })

  describe('comparison shorthands', () => {
    it('.gtn greater than', () => {
      expect(new BigNumber(3).gtn(2)).toEqual(true)
      expect(new BigNumber(3).gtn(3)).toEqual(false)
      expect(new BigNumber(3).gtn(4)).toEqual(false)
    })
    it('.gt greater than', () => {
      expect(new BigNumber(3).gt(new BigNumber(2))).toEqual(true)
      expect(new BigNumber(3).gt(new BigNumber(3))).toEqual(false)
      expect(new BigNumber(3).gt(new BigNumber(4))).toEqual(false)
    })
    it('.gten greater than or equal', () => {
      expect(new BigNumber(3).gten(3)).toEqual(true)
      expect(new BigNumber(3).gten(2)).toEqual(true)
      expect(new BigNumber(3).gten(4)).toEqual(false)
    })
    it('.gte greater than or equal', () => {
      expect(new BigNumber(3).gte(new BigNumber(3))).toEqual(true)
      expect(new BigNumber(3).gte(new BigNumber(2))).toEqual(true)
      expect(new BigNumber(3).gte(new BigNumber(4))).toEqual(false)
    })
    it('.ltn less than', () => {
      expect(new BigNumber(2).ltn(3)).toEqual(true)
      expect(new BigNumber(2).ltn(2)).toEqual(false)
      expect(new BigNumber(2).ltn(1)).toEqual(false)
    })
    it('.lt less than', () => {
      expect(new BigNumber(2).lt(new BigNumber(3))).toEqual(true)
      expect(new BigNumber(2).lt(new BigNumber(2))).toEqual(false)
      expect(new BigNumber(2).lt(new BigNumber(1))).toEqual(false)
    })
    it('.lten less than or equal', () => {
      expect(new BigNumber(3).lten(3)).toEqual(true)
      expect(new BigNumber(3).lten(2)).toEqual(false)
      expect(new BigNumber(3).lten(4)).toEqual(true)
    })
    it('.lte less than or equal', () => {
      expect(new BigNumber(3).lte(new BigNumber(3))).toEqual(true)
      expect(new BigNumber(3).lte(new BigNumber(2))).toEqual(false)
      expect(new BigNumber(3).lte(new BigNumber(4))).toEqual(true)
    })
    it('.eqn equal', () => {
      expect(new BigNumber(3).eqn(3)).toEqual(true)
      expect(new BigNumber(3).eqn(2)).toEqual(false)
      expect(new BigNumber(3).eqn(4)).toEqual(false)
    })
    it('.eq equal', () => {
      expect(new BigNumber(3).eq(new BigNumber(3))).toEqual(true)
      expect(new BigNumber(3).eq(new BigNumber(2))).toEqual(false)
      expect(new BigNumber(3).eq(new BigNumber(4))).toEqual(false)
    })
  })

  describe('.fromTwos', () => {
    it('should convert from two\'s complement to negative number', () => {
      expect(new BigNumber('00000000', 16).fromTwos(32).toNumber()).toEqual(0)
      expect(new BigNumber('00000001', 16).fromTwos(32).toNumber()).toEqual(1)
      expect(new BigNumber('7fffffff', 16).fromTwos(32).toNumber()).toEqual(2147483647)
      expect(new BigNumber('80000000', 16).fromTwos(32).toNumber()).toEqual(-2147483648)
      expect(new BigNumber('f0000000', 16).fromTwos(32).toNumber()).toEqual(-268435456)
      expect(new BigNumber('f1234567', 16).fromTwos(32).toNumber()).toEqual(-249346713)
      expect(new BigNumber('ffffffff', 16).fromTwos(32).toNumber()).toEqual(-1)
      expect(new BigNumber('fffffffe', 16).fromTwos(32).toNumber()).toEqual(-2)
      expect(new BigNumber('fffffffffffffffffffffffffffffffe', 16)
        .fromTwos(128).toNumber()).toEqual(-2)
      expect(new BigNumber('ffffffffffffffffffffffffffffffff' +
        'fffffffffffffffffffffffffffffffe', 16).fromTwos(256).toNumber()).toEqual(-2)
      expect(new BigNumber('ffffffffffffffffffffffffffffffff' +
        'ffffffffffffffffffffffffffffffff', 16).fromTwos(256).toNumber()).toEqual(-1)
      expect(
        new BigNumber('7fffffffffffffffffffffffffffffff' +
        'ffffffffffffffffffffffffffffffff', 16).fromTwos(256).toString(10)).toEqual(new BigNumber('5789604461865809771178549250434395392663499' +
        '2332820282019728792003956564819967', 10).toString(10))
      expect(
        new BigNumber('80000000000000000000000000000000' +
        '00000000000000000000000000000000', 16).fromTwos(256).toString(10)).toEqual(new BigNumber('-578960446186580977117854925043439539266349' +
        '92332820282019728792003956564819968', 10).toString(10))
    })
  })

  describe('.toTwos', () => {
    it('should convert from negative number to two\'s complement', () => {
      expect(new BigNumber(0).toTwos(32).toString(16)).toEqual('0')
      expect(new BigNumber(1).toTwos(32).toString(16)).toEqual('1')
      expect(new BigNumber(2147483647).toTwos(32).toString(16)).toEqual('7fffffff')
      expect(new BigNumber('-2147483648', 10).toTwos(32).toString(16)).toEqual('80000000')
      expect(new BigNumber('-268435456', 10).toTwos(32).toString(16)).toEqual('f0000000')
      expect(new BigNumber('-249346713', 10).toTwos(32).toString(16)).toEqual('f1234567')
      expect(new BigNumber('-1', 10).toTwos(32).toString(16)).toEqual('ffffffff')
      expect(new BigNumber('-2', 10).toTwos(32).toString(16)).toEqual('fffffffe')
      expect(new BigNumber('-2', 10).toTwos(128).toString(16)).toEqual(
        'fffffffffffffffffffffffffffffffe')
      expect(new BigNumber('-2', 10).toTwos(256).toString(16)).toEqual(
        'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe')
      expect(new BigNumber('-1', 10).toTwos(256).toString(16)).toEqual(
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
      expect(
        new BigNumber('5789604461865809771178549250434395392663' +
        '4992332820282019728792003956564819967', 10).toTwos(256).toString(16)).toEqual(
        '7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
      expect(
        new BigNumber('-578960446186580977117854925043439539266' +
        '34992332820282019728792003956564819968', 10).toTwos(256).toString(16)).toEqual(
        '8000000000000000000000000000000000000000000000000000000000000000')
    })
  })

  describe('.isBN', () => {
    it('should return true for BN', () => {
      expect(BigNumber.isBN(new BigNumber())).toEqual(true)
    })

    it('should return false for everything else', () => {
      expect(BigNumber.isBN(1)).toEqual(false)
      expect(BigNumber.isBN([])).toEqual(false)
      expect(BigNumber.isBN({})).toEqual(false)
    })
  })
})
