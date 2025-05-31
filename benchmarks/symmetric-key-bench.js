import { performance } from 'perf_hooks'
import { randomBytes, randomFillSync } from 'crypto'
// Provide browser-like crypto for Random
globalThis.self = { crypto: { getRandomValues: (arr) => randomFillSync(arr) } }
import SymmetricKey from '../dist/esm/src/primitives/SymmetricKey.js'

function rand (n) {
  return [...randomBytes(n)]
}

function benchmark (name, fn) {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name}: ${(end - start).toFixed(2)}ms`)
}

const key = SymmetricKey.fromRandom()
const largeMsg = rand(2 * 1024 * 1024)
const smallMsgs = Array.from({ length: 50 }, () => rand(100))
const mediumMsgs = Array.from({ length: 200 }, () => rand(1024))

let enc
benchmark('encrypt large 2MB', () => {
  enc = key.encrypt(largeMsg)
})
benchmark('decrypt large 2MB', () => {
  key.decrypt(enc)
})

benchmark('encrypt 50 small', () => {
  for (const m of smallMsgs) key.encrypt(m)
})
const encSmall = smallMsgs.map(m => key.encrypt(m))
benchmark('decrypt 50 small', () => {
  for (const m of encSmall) key.decrypt(m)
})

benchmark('encrypt 200 medium', () => {
  for (const m of mediumMsgs) key.encrypt(m)
})
const encMedium = mediumMsgs.map(m => key.encrypt(m))
benchmark('decrypt 200 medium', () => {
  for (const m of encMedium) key.decrypt(m)
})
