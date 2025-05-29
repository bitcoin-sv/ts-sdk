import { performance } from 'perf_hooks'
import BigNumber from '../dist/esm/src/primitives/BigNumber.js'

function benchmark(name, fn) {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name}: ${(end - start).toFixed(2)}ms`)
}

const largeHex = 'f'.repeat(20000) // 20k hex digits ~80k bits
const a = new BigNumber(largeHex, 16)
const b = new BigNumber(largeHex, 16)
benchmark('mul large numbers', () => {
  for (let i = 0; i < 5; i++) {
    a.mul(b)
  }
})
benchmark('add large numbers', () => {
  for (let i = 0; i < 1000; i++) {
    a.add(b)
  }
})
