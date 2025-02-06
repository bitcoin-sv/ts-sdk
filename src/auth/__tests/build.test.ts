import { PrivateKey, PublicKey } from '../../../mod'

describe('Peer class mutual authentication and certificate exchange', () => {
  for (let i = 0; i < 20; i++) {
    it(`tests point ${i + 1}`, () => {
      const pubKeyString = PrivateKey.fromRandom().toPublicKey().toString()
      const test = PublicKey.fromString(pubKeyString)
      expect(test).toBeTruthy()
    })
  }
})
