import { performance } from 'perf_hooks'
import BigNumber from '../dist/esm/src/primitives/BigNumber.js'

function benchmark (name, fn) {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name}: ${(end - start).toFixed(2)}ms`)
}

const digits = Number(process.argv[2] ?? 200000)
const iterations = Number(process.argv[3] ?? 1)
const largeHex = 'f'.repeat(digits)
const bn = new BigNumber(largeHex, 16)
const little = bn.toSm('little')
const big = bn.toSm('big')

benchmark('toSm big', () => {
  for (let i = 0; i < iterations; i++) bn.toSm('big')
})

benchmark('toSm little', () => {
  for (let i = 0; i < iterations; i++) bn.toSm('little')
})

benchmark('fromSm big', () => {
  for (let i = 0; i < iterations; i++) BigNumber.fromSm(big)
})

benchmark('fromSm little', () => {
  for (let i = 0; i < iterations; i++) BigNumber.fromSm(little, 'little')
})

benchmark('fromScriptNum', () => {
  for (let i = 0; i < iterations; i++) BigNumber.fromScriptNum(little)
})
