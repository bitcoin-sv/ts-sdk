/* eslint-env jest */
import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'

describe('BN.js/Binary', function () {
  describe('.shl()', function () {
    it('should shl numbers', function () {
      expect(new BigNumber('69527932928').shln(13).toString(16)).toEqual('2060602000000')
      expect(new BigNumber('69527932928').shln(45).toString(16)).toEqual('206060200000000000000')
    })

    it('should ushl numbers', function () {
      expect(new BigNumber('69527932928').ushln(13).toString(16)).toEqual('2060602000000')
      expect(new BigNumber('69527932928').ushln(45).toString(16)).toEqual('206060200000000000000')
    })
  })

  describe('.shr()', function () {
    it('should shr numbers', function () {
      expect(new BigNumber('69527932928').shrn(13).toString(16)).toEqual('818180')
      expect(new BigNumber('69527932928').shrn(17).toString(16)).toEqual('81818')
      expect(new BigNumber('69527932928').shrn(256).toString(16)).toEqual('0')
    })

    it('should ushr numbers', function () {
      expect(new BigNumber('69527932928').ushrn(13).toString(16)).toEqual('818180')
      expect(new BigNumber('69527932928').ushrn(17).toString(16)).toEqual('81818')
      expect(new BigNumber('69527932928').ushrn(256).toString(16)).toEqual('0')
    })
  })

  describe('.bincn()', function () {
    it('should increment bit', function () {
      expect(new BigNumber(0).bincn(1).toString(16)).toEqual('2')
      expect(new BigNumber(2).bincn(1).toString(16)).toEqual('4')
      expect(new BigNumber(2).bincn(1).bincn(1).toString(16)).toEqual(new BigNumber(2).bincn(2).toString(16))
      expect(new BigNumber(0xffffff).bincn(1).toString(16)).toEqual('1000001')
      expect(new BigNumber(2).bincn(63).toString(16)).toEqual('8000000000000002')
    })
  })

  describe('.imaskn()', function () {
    it('should mask bits in-place', function () {
      expect(new BigNumber(0).imaskn(1).toString(16)).toEqual('0')
      expect(new BigNumber(3).imaskn(1).toString(16)).toEqual('1')
      expect(new BigNumber('123456789', 16).imaskn(4).toString(16)).toEqual('9')
      expect(new BigNumber('123456789', 16).imaskn(16).toString(16)).toEqual('6789')
      expect(new BigNumber('123456789', 16).imaskn(28).toString(16)).toEqual('3456789')
    })

    it('should not mask when number is bigger than length', function () {
      expect(new BigNumber(0xe3).imaskn(56).toString(16)).toEqual('e3')
      expect(new BigNumber(0xe3).imaskn(26).toString(16)).toEqual('e3')
    })
  })

  describe('.testn()', function () {
    it('should support test specific bit', function () {
      [
        'ff',
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      ].forEach(function (hex) {
        const bn = new BigNumber(hex, 16)
        const bl = bn.bitLength()

        for (let i = 0; i < bl; ++i) {
          expect(bn.testn(i)).toEqual(true)
        }

        // test off the end
        expect(bn.testn(bl)).toEqual(false)
      })

      const xbits = '01111001010111001001000100011101' +
        '11010011101100011000111001011101' +
        '10010100111000000001011000111101' +
        '01011111001111100100011110000010' +
        '01011010100111010001010011000100' +
        '01101001011110100001001111100110' +
        '001110010111'

      const x = new BigNumber(
        '23478905234580795234378912401239784125643978256123048348957342'
      )
      for (let i = 0; i < x.bitLength(); ++i) {
        expect(x.testn(i)).toEqual(xbits.charAt(i) === '1')
      }
    })

    it('should have short-cuts', function () {
      const x = new BigNumber('abcd', 16)
      expect(!x.testn(128)).toEqual(true)
    })
  })

  describe('.and()', function () {
    it('should and numbers', function () {
      expect(new BigNumber('1010101010101010101010101010101010101010', 2)
        .and(new BigNumber('101010101010101010101010101010101010101', 2))
        .toString(2)).toEqual('0')
    })

    it('should and numbers of different limb-length', function () {
      expect(
        new BigNumber('abcd0000ffff', 16)
          .and(new BigNumber('abcd', 16)).toString(16)).toEqual('abcd')
    })
  })

  describe('.iand()', function () {
    it('should iand numbers', function () {
      expect(new BigNumber('1010101010101010101010101010101010101010', 2)
        .iand(new BigNumber('101010101010101010101010101010101010101', 2))
        .toString(2)).toEqual('0')
      expect(new BigNumber('1000000000000000000000000000000000000001', 2)
        .iand(new BigNumber('1', 2))
        .toString(2)).toEqual('1')
      expect(new BigNumber('1', 2)
        .iand(new BigNumber('1000000000000000000000000000000000000001', 2))
        .toString(2)).toEqual('1')
    })
  })

  describe('.or()', function () {
    it('should or numbers', function () {
      expect(new BigNumber('1010101010101010101010101010101010101010', 2)
        .or(new BigNumber('101010101010101010101010101010101010101', 2))
        .toString(2)).toEqual('1111111111111111111111111111111111111111')
    })

    it('should or numbers of different limb-length', function () {
      expect(
        new BigNumber('abcd00000000', 16)
          .or(new BigNumber('abcd', 16)).toString(16)).toEqual('abcd0000abcd')
    })
  })

  describe('.ior()', function () {
    it('should ior numbers', function () {
      expect(new BigNumber('1010101010101010101010101010101010101010', 2)
        .ior(new BigNumber('101010101010101010101010101010101010101', 2))
        .toString(2)).toEqual('1111111111111111111111111111111111111111')
      expect(new BigNumber('1000000000000000000000000000000000000000', 2)
        .ior(new BigNumber('1', 2))
        .toString(2)).toEqual('1000000000000000000000000000000000000001')
      expect(new BigNumber('1', 2)
        .ior(new BigNumber('1000000000000000000000000000000000000000', 2))
        .toString(2)).toEqual('1000000000000000000000000000000000000001')
    })
  })

  describe('.xor()', function () {
    it('should xor numbers', function () {
      expect(new BigNumber('11001100110011001100110011001100', 2)
        .xor(new BigNumber('1100110011001100110011001100110', 2))
        .toString(2)).toEqual('10101010101010101010101010101010')
    })
  })

  describe('.ixor()', function () {
    it('should ixor numbers', function () {
      expect(new BigNumber('11001100110011001100110011001100', 2)
        .ixor(new BigNumber('1100110011001100110011001100110', 2))
        .toString(2)).toEqual('10101010101010101010101010101010')
      expect(new BigNumber('11001100110011001100110011001100', 2)
        .ixor(new BigNumber('1', 2))
        .toString(2)).toEqual('11001100110011001100110011001101')
      expect(new BigNumber('1', 2)
        .ixor(new BigNumber('11001100110011001100110011001100', 2))
        .toString(2)).toEqual('11001100110011001100110011001101')
    })

    it('should and numbers of different limb-length', function () {
      expect(
        new BigNumber('abcd0000ffff', 16)
          .ixor(new BigNumber('abcd', 16)).toString(16)).toEqual('abcd00005432')
    })
  })

  describe('.setn()', function () {
    it('should allow single bits to be set', function () {
      expect(new BigNumber(0).setn(2, true).toString(2)).toEqual('100')
      expect(new BigNumber(0).setn(27, true).toString(2)).toEqual('1000000000000000000000000000')
      expect(new BigNumber(0).setn(63, true).toString(16)).toEqual(new BigNumber(1).iushln(63).toString(16))
      expect(new BigNumber('1000000000000000000000000001', 2).setn(27, false).toString(2)).toEqual('1')
      expect(new BigNumber('101', 2).setn(2, false).toString(2)).toEqual('1')
    })
  })

  describe('.notn()', function () {
    it('should allow bitwise negation', function () {
      expect(new BigNumber('111000111', 2).notn(9).toString(2)).toEqual('111000')
      expect(new BigNumber('000111000', 2).notn(9).toString(2)).toEqual('111000111')
      expect(new BigNumber('111000111', 2).notn(9).toString(2)).toEqual('111000')
      expect(new BigNumber('000111000', 2).notn(9).toString(2)).toEqual('111000111')
      expect(new BigNumber('111000111', 2).notn(32).toString(2)).toEqual('11111111111111111111111000111000')
      expect(new BigNumber('000111000', 2).notn(32).toString(2)).toEqual('11111111111111111111111111000111')
      expect(new BigNumber('111000111', 2).notn(68).toString(2)).toEqual('11111111111111111111111111111111' +
        '111111111111111111111111111000111000')
      expect(new BigNumber('000111000', 2).notn(68).toString(2)).toEqual('11111111111111111111111111111111' +
        '111111111111111111111111111111000111')
    })
  })
})
