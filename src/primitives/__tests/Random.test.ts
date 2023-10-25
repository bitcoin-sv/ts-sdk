/* eslint-env jest */
import Random from '../../../dist/cjs/src/primitives/Random'

describe('Random', () => {
  it('Produces random bytes of correct length', () => {
    expect(Random(3).length).toBe(3)
    expect(Random(10).length).toBe(10)
  })
  it('Does not produce the same thing every time', () => {
    // While this test may fail once every few hundred trillion years or so,
    // I haven't seen it fail yet. If you see it fail, please let me know.
    expect(Random(32)).not.toEqual(Random(32))
  })
})
