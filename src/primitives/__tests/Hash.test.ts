/* eslint-env jest */
import * as hash from '../../../dist/cjs/src/primitives/Hash'
import * as crypto from 'crypto'

describe('Hash', function () {
  function test (Hash, cases): void {
    for (let i = 0; i < cases.length; i++) {
      const msg = cases[i][0]
      const res = cases[i][1]
      const enc = cases[i][2]

      let dgst = new Hash().update(msg, enc).digest('hex')
      expect(dgst).toEqual(res)

      // Split message
      dgst = new Hash().update(msg.slice(0, 2), enc)
        .update(msg.slice(2), enc)
        .digest('hex')
      expect(dgst).toEqual(res)
    }
  }

  it('should support sha256', function () {
    test(hash.SHA256, [
      ['abc',
        'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
      ['abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
        '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'],
      ['deadbeef',
        '5f78c33274e43fa9de5659265c1d917e25c03722dcb0b8d27db8d5feaa813953',
        'hex']
    ])
  })

  it('should support ripemd160', function () {
    test(hash.RIPEMD160, [
      ['', '9c1185a5c5e9fc54612808977ee8f548b2258d31'],
      ['abc',
        '8eb208f7e05d987a9b044a8e98c6b087f15a0bfc'],
      ['message digest',
        '5d0689ef49d2fae572b881b123a85ffa21595f36'],
      ['abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
        '12a053384a9c0c88e405a06c27dcf49ada62eb2b'],
      ['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        'b0e20b6e3116640286ed3a87a5713079b21f5189']
    ])
  })

  it('should support sha1', function () {
    test(hash.SHA1, [
      ['',
        'da39a3ee5e6b4b0d3255bfef95601890afd80709'],
      ['abc',
        'a9993e364706816aba3e25717850c26c9cd0d89d'],
      ['abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
        '84983e441c3bd26ebaae4aa1f95129e5e54670f1'],
      ['deadbeef',
        'd78f8bb992a56a597f6c7a1fb918bb78271367eb',
        'hex']
    ])
  })

  it('handles utf8 in strings just like crypto', function () {
    test(hash.SHA256, [
      'hello', // one byte per character
      'привет', // two bytes per character
      '您好', // three bytes per character
      '👋', // four bytes per character
      'hello привет 您好 👋!!!' // mixed character lengths
    ].map(str => [str, crypto
      .createHash('sha256')
      .update(str)
      .digest('hex')]))
  })
})
