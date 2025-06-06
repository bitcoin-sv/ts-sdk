/* eslint-env jest */
import BigNumber from '../../primitives/BigNumber'
import ReductionContext from '../../primitives/ReductionContext'
import MontgomoryMethod from '../../primitives/MontgomoryMethod'
import K256 from '../../primitives/K256'

describe('BN.js/Reduction context', function () {
  const testMethod = (name: string, Method): void => {
    describe(name + ' method', function () {
      it('should support add, iadd, sub, isub operations', () => {
        const p = new BigNumber(257)
        const m = new Method(p)
        const a = new BigNumber(123).toRed(m)
        const b = new BigNumber(231).toRed(m)

        expect(a.redAdd(b).fromRed().toString(10)).toEqual('97')
        expect(a.redSub(b).fromRed().toString(10)).toEqual('149')
        expect(b.redSub(a).fromRed().toString(10)).toEqual('108')

        expect(a.clone().redIAdd(b).fromRed().toString(10)).toEqual('97')
        expect(a.clone().redISub(b).fromRed().toString(10)).toEqual('149')
        expect(b.clone().redISub(a).fromRed().toString(10)).toEqual('108')
      })

      it('should support pow and mul operations', () => {
        const p192 = new BigNumber(
          'fffffffffffffffffffffffffffffffeffffffffffffffff',
          16
        )
        const m = new Method(p192)
        const a = new BigNumber(123)
        const b = new BigNumber(231)
        const c = a.toRed(m).redMul(b.toRed(m)).fromRed()
        expect(c.cmp(a.mul(b).mod(p192))).toEqual(0)

        expect(
          a.toRed(m).redPow(new BigNumber(0)).fromRed().cmp(new BigNumber(1))
        ).toEqual(0)
        expect(
          a.toRed(m).redPow(new BigNumber(3)).fromRed().cmp(a.sqr().mul(a))
        ).toEqual(0)
        expect(
          a.toRed(m).redPow(new BigNumber(4)).fromRed().cmp(a.sqr().sqr())
        ).toEqual(0)
        expect(
          a.toRed(m).redPow(new BigNumber(8)).fromRed().cmp(a.sqr().sqr().sqr())
        ).toEqual(0)
        expect(
          a
            .toRed(m)
            .redPow(new BigNumber(9))
            .fromRed()
            .cmp(a.sqr().sqr().sqr().mul(a))
        ).toEqual(0)
        expect(
          a
            .toRed(m)
            .redPow(new BigNumber(17))
            .fromRed()
            .cmp(a.sqr().sqr().sqr().sqr().mul(a))
        ).toEqual(0)
        expect(
          a
            .toRed(m)
            .redPow(new BigNumber('deadbeefabbadead', 16))
            .fromRed()
            .toString(16)
        ).toEqual('3aa0e7e304e320b68ef61592bcb00341866d6fa66e11a4d6')
      })

      it('should sqrtm numbers', () => {
        let p = new BigNumber(263)
        let m = new Method(p)
        let q = new BigNumber(11).toRed(m)

        let qr = q.redSqrt()
        expect(qr.redSqr().cmp(q)).toEqual(0)

        qr = q.redSqrt()
        expect(qr.redSqr().cmp(q)).toEqual(0)

        p = new BigNumber(
          'fffffffffffffffffffffffffffffffeffffffffffffffff',
          16
        )
        m = new Method(p)

        q = new BigNumber(13).toRed(m)
        qr = q.redSqrt(/* true, p */)
        expect(qr.redSqr().cmp(q)).toEqual(0)

        qr = q.redSqrt(/* false, p */)
        expect(qr.redSqr().cmp(q)).toEqual(0)

        // Tonelli-shanks
        p = new BigNumber(13)
        m = new Method(p)
        q = new BigNumber(10).toRed(m)
        expect(q.redSqrt().fromRed().toString(10)).toEqual('7')
      })

      it('should invm numbers', function () {
        const p = new BigNumber(257)
        const m = new Method(p)
        const a = new BigNumber(3).toRed(m)
        const b = a.redInvm()
        expect(a.redMul(b).fromRed().toString(16)).toEqual('1')
      })

      it('should invm numbers (regression)', function () {
        const p = new BigNumber(
          'ffffffff00000001000000000000000000000000ffffffffffffffffffffffff',
          16
        )
        let a = new BigNumber(
          'e1d969b8192fbac73ea5b7921896d6a2263d4d4077bb8e5055361d1f7f8163f3',
          16
        )

        const m = new Method(p)
        a = a.toRed(m)

        expect(a.redInvm().fromRed().negative).toEqual(0)
      })

      it('should imul numbers', function () {
        const p = new BigNumber(
          'fffffffffffffffffffffffffffffffeffffffffffffffff',
          16
        )
        const m = new Method(p)

        const a = new BigNumber('deadbeefabbadead', 16)
        const b = new BigNumber('abbadeadbeefdead', 16)
        const c = a.mul(b).mod(p)

        expect(a.toRed(m).redIMul(b.toRed(m)).fromRed().toString(16)).toEqual(
          c.toString(16)
        )
      })

      it('should pow(base, 0) == 1', function () {
        const base = new BigNumber(256).toRed(new ReductionContext('k256'))
        const exponent = new BigNumber(0)
        const result = base.redPow(exponent)
        expect(result.toString()).toEqual('1')
      })

      it('should shl numbers', function () {
        const base = new BigNumber(256).toRed(new ReductionContext('k256'))
        const result = base.redShl(1)
        expect(result.toString()).toEqual('512')
      })

      it('should reduce when converting to red', function () {
        const p = new BigNumber(257)
        const m = new Method(p)
        const a = new BigNumber(5).toRed(m)

        expect(() => {
          const b = a.redISub(new BigNumber(512).toRed(m))
          b.redISub(new BigNumber(512).toRed(m))
        }).not.toThrow()
      })

      it('redNeg and zero value', function () {
        const a = new BigNumber(0).toRed(new ReductionContext('k256')).redNeg()
        expect(a.isZero()).toEqual(true)
      })

      it('should not allow modulus <= 1', function () {
        expect(() => {
          return new ReductionContext(new BigNumber(0))
        }).toThrow(new Error('modulus must be greater than 1'))

        expect(() => {
          return new ReductionContext(new BigNumber(1))
        }).toThrow(new Error('modulus must be greater than 1'))

        expect(() => {
          return new ReductionContext(new BigNumber(2))
        }).not.toThrow()
      })
    })
  }

  testMethod('Plain', ReductionContext)
  testMethod('Montgomery', MontgomoryMethod)

  describe('Pseudo-Mersenne Primes', function () {
    it('should reduce numbers mod k256', function () {
      const p = new K256()

      expect(p.ireduce(new BigNumber(0xdead)).toString(16)).toEqual('dead')
      expect(p.ireduce(new BigNumber('deadbeef', 16)).toString(16)).toEqual(
        'deadbeef'
      )

      const num = new BigNumber(
        'fedcba9876543210fedcba9876543210dead' +
          'fedcba9876543210fedcba9876543210dead',
        16
      )
      let exp = num.mod(p.p).toString(16)
      expect(p.ireduce(num).toString(16)).toEqual(exp)

      const regr = new BigNumber(
        'f7e46df64c1815962bf7bc9c56128798' +
          '3f4fcef9cb1979573163b477eab93959' +
          '335dfb29ef07a4d835d22aa3b6797760' +
          '70a8b8f59ba73d56d01a79af9',
        16
      )
      exp = regr.mod(p.p).toString(16)

      expect(p.ireduce(regr).toString(16)).toEqual(exp)
    })

    it('should not fail to invm number mod k256', function () {
      let regr2 = new BigNumber(
        '6c150c4aa9a8cf1934485d40674d4a7cd494675537bda36d49405c5d2c6f496f',
        16
      )
      regr2 = regr2.toRed(new ReductionContext('k256'))
      expect(regr2.redInvm().redMul(regr2).fromRed().cmpn(1)).toEqual(0)
    })

    it('should correctly square the number', function () {
      const p = new K256().p
      const red = new ReductionContext('k256')

      const n = new BigNumber(
        '9cd8cb48c3281596139f147c1364a3ed' + 'e88d3f310fdb0eb98c924e599ca1b3c9',
        16
      )
      const expected = n.sqr().mod(p)
      const actual = n.toRed(red).redSqr().fromRed()

      expect(actual.toString(16)).toEqual(expected.toString(16))
    })

    it('redISqr should return right result', function () {
      const n = new BigNumber('30f28939', 16)
      const actual = n.toRed(new ReductionContext('k256')).redISqr().fromRed()
      expect(actual.toString(16)).toEqual('95bd93d19520eb1')
    })
  })

  it('should avoid 4.1.0 regresion', function () {
    const bits2int = (obits, q): BigNumber => {
      let bits
      if (Buffer.isBuffer(obits)) {
        bits = new BigNumber(obits.toString('hex'), 16)
      } else {
        bits = new BigNumber(obits)
      }
      const shift = (obits.length << 3) - q.bitLength()
      if (shift > 0) {
        bits.ishrn(shift)
      }
      return bits
    }
    const t = Buffer.from(
      'aff1651e4cd6036d57aa8b2a05ccf1a9d5a40166340ecbbdc55' +
        'be10b568aa0aa3d05ce9a2fcec9df8ed018e29683c6051cb83e' +
        '46ce31ba4edb045356a8d0d80b',
      'hex'
    )
    const g = new BigNumber(
      '5c7ff6b06f8f143fe8288433493e4769c4d988ace5be25a0e24809670' +
        '716c613d7b0cee6932f8faa7c44d2cb24523da53fbe4f6ec3595892d1' +
        'aa58c4328a06c46a15662e7eaa703a1decf8bbb2d05dbe2eb956c142a' +
        '338661d10461c0d135472085057f3494309ffa73c611f78b32adbb574' +
        '0c361c9f35be90997db2014e2ef5aa61782f52abeb8bd6432c4dd097b' +
        'c5423b285dafb60dc364e8161f4a2a35aca3a10b1c4d203cc76a470a3' +
        '3afdcbdd92959859abd8b56e1725252d78eac66e71ba9ae3f1dd24871' +
        '99874393cd4d832186800654760e1e34c09e4d155179f9ec0dc4473f9' +
        '96bdce6eed1cabed8b6f116f7ad9cf505df0f998e34ab27514b0ffe7',
      16
    )
    const p = new BigNumber(
      '9db6fb5951b66bb6fe1e140f1d2ce5502374161fd6538df1648218642' +
        'f0b5c48c8f7a41aadfa187324b87674fa1822b00f1ecf8136943d7c55' +
        '757264e5a1a44ffe012e9936e00c1d3e9310b01c7d179805d3058b2a9' +
        'f4bb6f9716bfe6117c6b5b3cc4d9be341104ad4a80ad6c94e005f4b99' +
        '3e14f091eb51743bf33050c38de235567e1b34c3d6a5c0ceaa1a0f368' +
        '213c3d19843d0b4b09dcb9fc72d39c8de41f1bf14d4bb4563ca283716' +
        '21cad3324b6a2d392145bebfac748805236f5ca2fe92b871cd8f9c36d' +
        '3292b5509ca8caa77a2adfc7bfd77dda6f71125a7456fea153e433256' +
        'a2261c6a06ed3693797e7995fad5aabbcfbe3eda2741e375404ae25b',
      16
    )
    const q = new BigNumber(
      'f2c3119374ce76c9356990b465374a17f23f9ed35089bd969f61c6dde' + '9998c1f',
      16
    )
    const k = bits2int(t, q)
    const expectedR =
      '89ec4bb1400eccff8e7d9aa515cd1de7803f2daff09693ee7fd1353e' + '90a68307'
    const r = g.toRed(new MontgomoryMethod(p)).redPow(k).fromRed().mod(q)
    expect(r.toString(16)).toEqual(expectedR)
  })

  it('K256.split for 512 bits number should return equal numbers', function () {
    const red = new ReductionContext('k256')
    const input = new BigNumber(1).iushln(512).subn(1)
    expect(input.bitLength()).toEqual(512)
    const output = new BigNumber(0)
    red.prime?.split(input, output)
    expect(input.cmp(output)).toEqual(0)
  })

  it('imod should change host object', function () {
    const red = new ReductionContext(new BigNumber(13))
    const a = new BigNumber(2).toRed(red)
    const b = new BigNumber(7).toRed(red)
    const c = a.redIMul(b)
    expect(a.toNumber()).toEqual(1)
    expect(c.toNumber()).toEqual(1)
  })
})
