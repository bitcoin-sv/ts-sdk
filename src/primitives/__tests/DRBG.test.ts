import DRBG from '../../../dist/cjs/src/primitives/DRBG'
import DRBGVectors from './DRBG.vectors'

describe('Hmac_DRBG', () => {
  describe('NIST vector', function () {
    DRBGVectors.forEach(function (opt) {
      it('should not fail at ' + opt.name, function () {
        const drbg = new DRBG(opt.entropy, opt.nonce)

        let last
        for (let i = 0; i < opt.add.length; i++) {
          last = drbg.generate(opt.expected.length / 2)
        }
        expect(last).toEqual(opt.expected)
      })
    })
  })
})
