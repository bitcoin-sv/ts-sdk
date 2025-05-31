import { performance } from 'perf_hooks'
import BigNumber from '../dist/esm/src/primitives/BigNumber.js'

function benchmark (name, fn) {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name}: ${(end - start).toFixed(2)}ms`)
}

const digits = Number(process.argv[2] ?? 20000)
const mulIterations = Number(process.argv[3] ?? 5)
const addIterations = Number(process.argv[4] ?? 1000)
const largeHex = 'f'.repeat(digits)
const a = new BigNumber(largeHex, 16)
const b = new BigNumber(largeHex, 16)

benchmark('mul large numbers', () => {
  for (let i = 0; i < mulIterations; i++) {
    a.mul(b)
  }
})

benchmark('add large numbers', () => {
  for (let i = 0; i < addIterations; i++) {
    a.add(b)
  }
})
