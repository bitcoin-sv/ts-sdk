/* global describe, it */

import BigNumber from '../../../dist/cjs/src/primitives/BigNumber'
import * as fixtures from './BigNumber.fixtures'

describe('BN.js/Arithmetic', () => {
  describe('.add()', () => {
    it('should add numbers', () => {
      expect(new BigNumber(14).add(new BigNumber(26)).toString(16)).toBe('28')
      const k = new BigNumber(0x1234)
      let r = k

      for (let i = 0; i < 257; i++) {
        r = r.add(k)
      }

      expect(r.toString(16)).toBe('125868')
    })

    it('should handle carry properly (in-place)', () => {
      const k = new BigNumber('abcdefabcdefabcdef', 16)
      const r = new BigNumber('deadbeef', 16)

      for (let i = 0; i < 257; i++) {
        r.iadd(k)
      }

      expect(r.toString(16)).toBe('ac79bd9b79be7a277bde')
    })

    it('should properly do positive + negative', () => {
      let a = new BigNumber('abcd', 16)
      let b = new BigNumber('-abce', 16)

      expect(a.iadd(b).toString(16)).toBe('-1')

      a = new BigNumber('abcd', 16)
      b = new BigNumber('-abce', 16)

      expect(a.add(b).toString(16)).toBe('-1')
      expect(b.add(a).toString(16)).toBe('-1')
    })
  })

  describe('.iaddn()', () => {
    it('should allow a sign change', () => {
      const a = new BigNumber(-100)
      expect(a.negative).toBe(1)

      a.iaddn(200)

      expect(a.negative).toBe(0)
      expect(a.toString()).toBe('100')
    })

    it('should add negative number', () => {
      const a = new BigNumber(-100)
      expect(a.negative).toBe(1)

      a.iaddn(-200)

      expect(a.toString()).toBe('-300')
    })

    it('should allow neg + pos with big number', () => {
      const a = new BigNumber('-1000000000', 10)
      expect(a.negative).toBe(1)

      a.iaddn(200)

      expect(a.toString()).toBe('-999999800')
    })

    it('should carry limb', () => {
      const a = new BigNumber('3ffffff', 16)

      expect(a.iaddn(1).toString(16)).toBe('4000000')
    })

    it('should throw error with num eq 0x4000000', () => {
      expect(() => new BigNumber(0).iaddn(0x4000000)).toThrow('num is too large')
    })

    it('should reset sign if value equal to value in instance', () => {
      const a = new BigNumber(-1)
      expect(a.addn(1).toString()).toBe('0')
    })
  })

  describe('.sub()', () => {
    it('should subtract small numbers', () => {
      expect(new BigNumber(26).sub(new BigNumber(14)).toString(16)).toBe('c')
      expect(new BigNumber(14).sub(new BigNumber(26)).toString(16)).toBe('-c')
      expect(new BigNumber(26).sub(new BigNumber(26)).toString(16)).toBe('0')
      expect(new BigNumber(-26).sub(new BigNumber(26)).toString(16)).toBe('-34')
    })

    const a = new BigNumber(
      '31ff3c61db2db84b9823d320907a573f6ad37c437abe458b1802cda041d6384' +
      'a7d8daef41395491e2',
      16)
    const b = new BigNumber(
      '6f0e4d9f1d6071c183677f601af9305721c91d31b0bbbae8fb790000',
      16)
    const r = new BigNumber(
      '31ff3c61db2db84b9823d3208989726578fd75276287cd9516533a9acfb9a67' +
      '76281f34583ddb91e2',
      16)

    it('should subtract big numbers', () => {
      expect(a.sub(b).cmp(r)).toBe(0)
    })

    it('should subtract numbers in place', () => {
      expect(b.clone().isub(a).neg().cmp(r)).toBe(0)
    })

    it('should subtract with carry', () => {
      let a = new BigNumber('12345', 16)
      let b = new BigNumber('1000000000000', 16)
      expect(a.isub(b).toString(16)).toBe('-fffffffedcbb')

      a = new BigNumber('12345', 16)
      b = new BigNumber('1000000000000', 16)
      expect(b.isub(a).toString(16)).toBe('fffffffedcbb')
    })
  })

  describe('.isubn()', () => {
    it('should subtract negative number', () => {
      const r = new BigNumber(
        '7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b', 16)
      expect(r.isubn(-1).toString(16)).toBe(
        '7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681c')
    })

    it('should work for positive numbers', () => {
      const a = new BigNumber(-100)
      expect(a.negative).toBe(1)

      a.isubn(200)
      expect(a.negative).toBe(1)
      expect(a.toString()).toBe('-300')
    })

    it('should not allow a sign change', () => {
      const a = new BigNumber(-100)
      expect(a.negative).toBe(1)

      a.isubn(-200)
      expect(a.negative).toBe(0)
      expect(a.toString()).toBe('100')
    })

    it('should change sign on small numbers at 0', () => {
      const a = new BigNumber(0).subn(2)
      expect(a.toString()).toBe('-2')
    })

    it('should change sign on small numbers at 1', () => {
      const a = new BigNumber(1).subn(2)
      expect(a.toString()).toBe('-1')
    })

    it('should throw error with num eq 0x4000000', () => {
      expect(() => new BigNumber(0).isubn(0x4000000)).toThrow('Assertion failed')
    })
  })

  function testMethod (name, mul): void {
    describe(name, () => {
      it('should multiply numbers of different signs', () => {
        const offsets = [
          1, // smallMulTo
          250, // comb10MulTo
          1000, // bigMulTo
          15000 // jumboMulTo
        ]

        for (let i = 0; i < offsets.length; ++i) {
          const x = new BigNumber(1).ishln(offsets[i])

          expect(mul(x, x).isNeg()).toBe(false)
          expect(mul(x, x.neg()).isNeg()).toBe(true)
          expect(mul(x.neg(), x).isNeg()).toBe(true)
          expect(mul(x.neg(), x.neg()).isNeg()).toBe(false)
        }
      })

      it('should multiply with carry', () => {
        const n = new BigNumber(0x1001)
        let r = n

        for (let i = 0; i < 4; i++) {
          r = mul(r, n)
        }

        expect(r.toString(16)).toBe('100500a00a005001')
      })

      it('should correctly multiply big numbers', () => {
        const n = new BigNumber(
          '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
          16
        )
        expect(
          mul(n, n).toString(16)
        ).toBe(
          '39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729ab9' +
          'b055c3a9458e4ce3289560a38e08ba8175a9446ce14e608245ab3a9' +
          '978a8bd8acaa40'
        )
        expect(
          mul(mul(n, n), n).toString(16)
        ).toBe(
          '1b888e01a06e974017a28a5b4da436169761c9730b7aeedf75fc60f687b' +
          '46e0cf2cb11667f795d5569482640fe5f628939467a01a612b02350' +
          '0d0161e9730279a7561043af6197798e41b7432458463e64fa81158' +
          '907322dc330562697d0d600'
        )
      })

      it('should multiply neg number on 0', () => {
        expect(
          mul(new BigNumber('-100000000000'), new BigNumber('3').div(new BigNumber('4')))
            .toString(16)
        ).toBe('0')
      })

      it('should regress mul big numbers', () => {
        const qs = fixtures.dhGroups.p17.qs
        const q = new BigNumber(fixtures.dhGroups.p17.q, 16)
        expect(mul(q, q).toString(16)).toBe(qs)
      })
    })
  }

  testMethod('.mul()', function (x, y) {
    return BigNumber.prototype.mul.apply(x, [y])
  })

  describe('.imul()', () => {
    it('should multiply numbers in-place', () => {
      let a = new BigNumber('abcdef01234567890abcd', 16)
      let b = new BigNumber('deadbeefa551edebabba8', 16)
      let c = a.mul(b)

      expect(a.imul(b).toString(16)).toBe(c.toString(16))

      a = new BigNumber('abcdef01234567890abcd214a25123f512361e6d236', 16)
      b = new BigNumber('deadbeefa551edebabba8121234fd21bac0341324dd', 16)
      c = a.mul(b)

      expect(a.imul(b).toString(16)).toBe(c.toString(16))
    })

    it('should multiply by 0', () => {
      const a = new BigNumber('abcdef01234567890abcd', 16)
      const b = new BigNumber('0', 16)
      const c = a.mul(b)

      expect(a.imul(b).toString(16)).toBe(c.toString(16))
    })

    it('should regress mul big numbers in-place', () => {
      const qs = fixtures.dhGroups.p17.qs
      const q = new BigNumber(fixtures.dhGroups.p17.q, 16)
      expect(q.isqr().toString(16)).toBe(qs)
    })
  })

  describe('.muln()', () => {
    it('should multiply number by small number', () => {
      const a = new BigNumber('abcdef01234567890abcd', 16)
      const b = new BigNumber('dead', 16)
      const c = a.mul(b)

      expect(a.muln(0xdead).toString(16)).toBe(c.toString(16))
    })

    it('should throw error with num eq 0x4000000', () => {
      expect(() => new BigNumber(0).imuln(0x4000000)).toThrow(/^Assertion failed$/)
    })

    it('should negate number if number is negative', () => {
      const a = new BigNumber('dead', 16)
      expect(a.clone().imuln(-1).toString(16)).toBe(a.clone().neg().toString(16))
      expect(a.clone().muln(-1).toString(16)).toBe(a.clone().neg().toString(16))

      const b = new BigNumber('dead', 16)
      expect(b.clone().imuln(-42).toString(16)).toBe(b.clone().neg().muln(42).toString(16))
      expect(b.clone().muln(-42).toString(16)).toBe(b.clone().neg().muln(42).toString(16))
    })
  })

  describe('.pow()', () => {
    it('should raise number to the power', () => {
      const a = new BigNumber('ab', 16)
      const b = new BigNumber('13', 10)
      const c = a.pow(b)

      expect(c.toString(16)).toBe('15963da06977df51909c9ba5b')
    })
  })

  describe('.div()', () => {
    it('should divide small numbers (<=26 bits)', () => {
      expect(new BigNumber('256').div(new BigNumber(10)).toString(10)).toEqual('25')
      expect(new BigNumber('-256').div(new BigNumber(10)).toString(10)).toEqual('-25')
      expect(new BigNumber('256').div(new BigNumber(-10)).toString(10)).toEqual('-25')
      expect(new BigNumber('-256').div(new BigNumber(-10)).toString(10)).toEqual('25')

      expect(new BigNumber('10').div(new BigNumber(256)).toString(10)).toEqual('0')
      expect(new BigNumber('-10').div(new BigNumber(256)).toString(10)).toEqual('0')
      expect(new BigNumber('10').div(new BigNumber(-256)).toString(10)).toEqual('0')
      expect(new BigNumber('-10').div(new BigNumber(-256)).toString(10)).toEqual('0')
    })

    it('should divide large numbers (>53 bits)', () => {
      expect(new BigNumber('1222222225255589').div(new BigNumber('611111124969028')).toString(10)).toEqual('1')
      expect(new BigNumber('-1222222225255589').div(new BigNumber('611111124969028')).toString(10)).toEqual('-1')
      expect(new BigNumber('1222222225255589').div(new BigNumber('-611111124969028')).toString(10)).toEqual('-1')
      expect(new BigNumber('-1222222225255589').div(new BigNumber('-611111124969028')).toString(10)).toEqual('1')

      expect(new BigNumber('611111124969028').div(new BigNumber('1222222225255589')).toString(10)).toEqual('0')
      expect(new BigNumber('-611111124969028').div(new BigNumber('1222222225255589')).toString(10)).toEqual('0')
      expect(new BigNumber('611111124969028').div(new BigNumber('-1222222225255589')).toString(10)).toEqual('0')
      expect(new BigNumber('-611111124969028').div(new BigNumber('-1222222225255589')).toString(10)).toEqual('0')
    })

    it('should divide numbers', () => {
      expect(new BigNumber('69527932928').div(new BigNumber('16974594')).toString(16)).toEqual('fff')
      expect(new BigNumber('-69527932928').div(new BigNumber('16974594')).toString(16)).toEqual('-fff')

      const b = new BigNumber('39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729ab9b055c3a9458e4ce3289560a38e08ba8175a9446ce14e608245ab3a9978a8bd8acaa40', 16)
      const n = new BigNumber('79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', 16)
      expect(b.div(n).toString(16)).toEqual(n.toString(16))

      expect(new BigNumber('1').div(new BigNumber('-5')).toString(10)).toEqual('0')
    })

    it('should not fail on regression after moving to _wordDiv', function () {
      // Regression after moving to word div
      let p = new BigNumber(
        'fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f',
        16)
      let a = new BigNumber(
        '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
        16)
      const as = a.sqr()
      expect(
        as.div(p).toString(16)).toEqual(
        '39e58a8055b6fb264b75ec8c646509784204ac15a8c24e05babc9729e58090b9')

      p = new BigNumber(
        'ffffffff00000001000000000000000000000000ffffffffffffffffffffffff',
        16)
      a = new BigNumber(
        'fffffffe00000003fffffffd0000000200000001fffffffe00000002ffffffff' +
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        16)
      expect(
        a.div(p).toString(16)).toEqual(
        'ffffffff00000002000000000000000000000001000000000000000000000001')
    })
  })

  describe('.idivn()', () => {
    it('should divide numbers in-place', () => {
      expect(new BigNumber('10', 16).idivn(3).toString(16)).toEqual('5')
      expect(new BigNumber('10', 16).idivn(-3).toString(16)).toEqual('-5')
      expect(new BigNumber('12', 16).idivn(3).toString(16)).toEqual('6')
      expect(new BigNumber('10000000000000000').idivn(3).toString(10)).toEqual('3333333333333333')
      expect(new BigNumber('100000000000000000000000000000').idivn(3).toString(10)).toEqual('33333333333333333333333333333')

      const t = new BigNumber(3)
      expect(new BigNumber('12345678901234567890123456', 16).idivn(3).toString(16)).toEqual(new BigNumber('12345678901234567890123456', 16).div(t).toString(16))
    })
  })

  describe('.divRound()', () => {
    it('should divide numbers with rounding', () => {
      expect(new BigNumber(9).divRound(new BigNumber(20)).toString(10)).toEqual('0')
      expect(new BigNumber(10).divRound(new BigNumber(20)).toString(10)).toEqual('1')
      expect(new BigNumber(150).divRound(new BigNumber(20)).toString(10)).toEqual('8')
      expect(new BigNumber(149).divRound(new BigNumber(20)).toString(10)).toEqual('7')
      expect(new BigNumber(149).divRound(new BigNumber(17)).toString(10)).toEqual('9')
      expect(new BigNumber(144).divRound(new BigNumber(17)).toString(10)).toEqual('8')
      expect(new BigNumber(-144).divRound(new BigNumber(17)).toString(10)).toEqual('-8')
    })

    it('should return 1 on exact division', () => {
      expect(new BigNumber(144).divRound(new BigNumber(144)).toString(10)).toEqual('1')
    })
  })

  describe('.mod()', () => {
    it('should modulo small numbers (<=26 bits)', () => {
      expect(new BigNumber('256').mod(new BigNumber(10)).toString(10)).toEqual('6')
      expect(new BigNumber('-256').mod(new BigNumber(10)).toString(10)).toEqual('-6')
      expect(new BigNumber('256').mod(new BigNumber(-10)).toString(10)).toEqual('6')
      expect(new BigNumber('-256').mod(new BigNumber(-10)).toString(10)).toEqual('-6')

      expect(new BigNumber('10').mod(new BigNumber(256)).toString(10)).toEqual('10')
      expect(new BigNumber('-10').mod(new BigNumber(256)).toString(10)).toEqual('-10')
      expect(new BigNumber('10').mod(new BigNumber(-256)).toString(10)).toEqual('10')
      expect(new BigNumber('-10').mod(new BigNumber(-256)).toString(10)).toEqual('-10')
    })

    it('should modulo large numbers (>53 bits)', () => {
      expect(new BigNumber('1222222225255589').mod(new BigNumber('611111124969028')).toString(10)).toEqual('611111100286561')
      expect(new BigNumber('-1222222225255589').mod(new BigNumber('611111124969028')).toString(10)).toEqual('-611111100286561')
      expect(new BigNumber('1222222225255589').mod(new BigNumber('-611111124969028')).toString(10)).toEqual('611111100286561')
      expect(new BigNumber('-1222222225255589').mod(new BigNumber('-611111124969028')).toString(10)).toEqual('-611111100286561')

      expect(new BigNumber('611111124969028').mod(new BigNumber('1222222225255589')).toString(10)).toEqual('611111124969028')
      expect(new BigNumber('-611111124969028').mod(new BigNumber('1222222225255589')).toString(10)).toEqual('-611111124969028')
      expect(new BigNumber('611111124969028').mod(new BigNumber('-1222222225255589')).toString(10)).toEqual('611111124969028')
      expect(new BigNumber('-611111124969028').mod(new BigNumber('-1222222225255589')).toString(10)).toEqual('-611111124969028')
    })

    it('should mod numbers', () => {
      expect(new BigNumber('10').mod(new BigNumber(256)).toString(16)).toEqual('a')
      expect(new BigNumber('69527932928').mod(new BigNumber('16974594')).toString(16)).toEqual('102f302')

      expect(new BigNumber(178).div(new BigNumber(10)).toNumber()).toEqual(17)
      expect(new BigNumber(178).mod(new BigNumber(10)).toNumber()).toEqual(8)
      expect(new BigNumber(178).umod(new BigNumber(10)).toNumber()).toEqual(8)

      expect(new BigNumber(-178).div(new BigNumber(10)).toNumber()).toEqual(-17)
      expect(new BigNumber(-178).mod(new BigNumber(10)).toNumber()).toEqual(-8)
      expect(new BigNumber(-178).umod(new BigNumber(10)).toNumber()).toEqual(2)

      expect(new BigNumber(178).div(new BigNumber(-10)).toNumber()).toEqual(-17)
      expect(new BigNumber(178).mod(new BigNumber(-10)).toNumber()).toEqual(8)
      expect(new BigNumber(178).umod(new BigNumber(-10)).toNumber()).toEqual(8)

      expect(new BigNumber(-178).div(new BigNumber(-10)).toNumber()).toEqual(17)
      expect(new BigNumber(-178).mod(new BigNumber(-10)).toNumber()).toEqual(-8)
      expect(new BigNumber(-178).umod(new BigNumber(-10)).toNumber()).toEqual(2)

      expect(new BigNumber(-4).div(new BigNumber(-3)).toNumber()).toEqual(1)
      expect(new BigNumber(-4).mod(new BigNumber(-3)).toNumber()).toEqual(-1)

      expect(new BigNumber(-4).mod(new BigNumber(3)).toNumber()).toEqual(-1)
      expect(new BigNumber(-4).umod(new BigNumber(-3)).toNumber()).toEqual(2)

      const p = new BigNumber(
        'ffffffff00000001000000000000000000000000ffffffffffffffffffffffff',
        16)
      const a = new BigNumber(
        'fffffffe00000003fffffffd0000000200000001fffffffe00000002ffffffff' +
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        16)
      expect(a.mod(p).toString(16)).toEqual('0')
    })

    it('should properly carry the sign inside division', () => {
      const a = new BigNumber('945304eb96065b2a98b57a48a06ae28d285a71b5', 'hex')
      const b = new BigNumber(
        'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe',
        'hex')

      expect(a.mul(b).mod(a).cmpn(0)).toEqual(0)
    })
  })

  describe('.modrn()', () => {
    it('should act like .mod() on small numbers', () => {
      expect(new BigNumber('10', 16).modrn(256).toString(16)).toEqual('10')
      expect(new BigNumber('10', 16).modrn(-256).toString(16)).toEqual('-10')
      expect(new BigNumber('100', 16).modrn(256).toString(16)).toEqual('0')
      expect(new BigNumber('1001', 16).modrn(256).toString(16)).toEqual('1')
      expect(new BigNumber('100000000001', 16).modrn(256).toString(16)).toEqual('1')
      expect(new BigNumber('100000000001', 16).modrn(257).toString(16)).toEqual(
        new BigNumber('100000000001', 16).mod(new BigNumber(257)).toString(16))
      expect(new BigNumber('123456789012', 16).modrn(3).toString(16)).toEqual(
        new BigNumber('123456789012', 16).mod(new BigNumber(3)).toString(16))
    })
  })

  describe('.abs()', () => {
    it('should return absolute value', () => {
      expect(new BigNumber(0x1001).abs().toString()).toEqual('4097')
      expect(new BigNumber(-0x1001).abs().toString()).toEqual('4097')
      expect(new BigNumber('ffffffff', 16).abs().toString()).toEqual('4294967295')
    })
  })

  describe('.invm()', () => {
    it('should invert relatively-prime numbers', () => {
      const p = new BigNumber(257)
      let a = new BigNumber(3)
      let b = a.invm(p)
      expect(a.mul(b).mod(p).toString(16)).toEqual('1')

      const p192 = new BigNumber(
        'fffffffffffffffffffffffffffffffeffffffffffffffff',
        16)
      a = new BigNumber('deadbeef', 16)
      b = a.invm(p192)
      expect(a.mul(b).mod(p192).toString(16)).toEqual('1')

      const phi = new BigNumber('872d9b030ba368706b68932cf07a0e0c', 16)
      const e = new BigNumber(65537)
      const d = e.invm(phi)
      expect(e.mul(d).mod(phi).toString(16)).toEqual('1')

      a = new BigNumber('5')
      b = new BigNumber('6')
      const r = a.invm(b)
      expect(r.mul(a).mod(b).toString(16)).toEqual('1')
    })
  })

  describe('.gcd()', () => {
    it('should return GCD', () => {
      expect(new BigNumber(3).gcd(new BigNumber(2)).toString(10)).toEqual('1')
      expect(new BigNumber(18).gcd(new BigNumber(12)).toString(10)).toEqual('6')
      expect(new BigNumber(-18).gcd(new BigNumber(12)).toString(10)).toEqual('6')
      expect(new BigNumber(-18).gcd(new BigNumber(-12)).toString(10)).toEqual('6')
      expect(new BigNumber(-18).gcd(new BigNumber(0)).toString(10)).toEqual('18')
      expect(new BigNumber(0).gcd(new BigNumber(-18)).toString(10)).toEqual('18')
      expect(new BigNumber(2).gcd(new BigNumber(0)).toString(10)).toEqual('2')
      expect(new BigNumber(0).gcd(new BigNumber(3)).toString(10)).toEqual('3')
      expect(new BigNumber(0).gcd(new BigNumber(0)).toString(10)).toEqual('0')
    })
  })

  describe('.egcd()', () => {
    it('should return EGCD', () => {
      expect(new BigNumber(3).egcd(new BigNumber(2)).gcd.toString(10)).toEqual('1')
      expect(new BigNumber(18).egcd(new BigNumber(12)).gcd.toString(10)).toEqual('6')
      expect(new BigNumber(-18).egcd(new BigNumber(12)).gcd.toString(10)).toEqual('6')
      expect(new BigNumber(0).egcd(new BigNumber(12)).gcd.toString(10)).toEqual('12')
    })
    it('should not allow 0 input', () => {
      expect(() => {
        new BigNumber(1).egcd(0 as unknown as BigNumber)
      }).toThrow(/^p must not be negative$/)
    })
    it('should not allow negative input', () => {
      expect(() => {
        new BigNumber(1).egcd(-1 as unknown as BigNumber)
      }).toThrow(/^p must not be negative$/)
    })
  })

  describe('BN.max(a, b)', () => {
    it('should return maximum', () => {
      expect(BigNumber.max(new BigNumber(3), new BigNumber(2)).toString(16)).toEqual('3')
      expect(BigNumber.max(new BigNumber(2), new BigNumber(3)).toString(16)).toEqual('3')
      expect(BigNumber.max(new BigNumber(2), new BigNumber(2)).toString(16)).toEqual('2')
      expect(BigNumber.max(new BigNumber(2), new BigNumber(-2)).toString(16)).toEqual('2')
    })
  })

  describe('BN.min(a, b)', () => {
    it('should return minimum', () => {
      expect(BigNumber.min(new BigNumber(3), new BigNumber(2)).toString(16)).toEqual('2')
      expect(BigNumber.min(new BigNumber(2), new BigNumber(3)).toString(16)).toEqual('2')
      expect(BigNumber.min(new BigNumber(2), new BigNumber(2)).toString(16)).toEqual('2')
      expect(BigNumber.min(new BigNumber(2), new BigNumber(-2)).toString(16)).toEqual('-2')
    })
  })

  describe('BN.ineg', () => {
    it('shouldn\'t change sign for zero', () => {
      expect(new BigNumber(0).ineg().toString(10)).toEqual('0')
    })
  })
})
