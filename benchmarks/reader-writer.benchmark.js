import { Writer, Reader } from '../dist/esm/src/primitives/utils.js'
import BigNumber from '../dist/esm/src/primitives/BigNumber.js'

function measure (fn) {
  const start = process.hrtime.bigint()
  fn()
  const end = process.hrtime.bigint()
  return Number(end - start) / 1e6 // ms
}

function createPayload (size) {
  const arr = new Array(size)
  for (let i = 0; i < size; i++) arr[i] = i & 0xff
  return arr
}

function benchmarkLarge () {
  const writer = new Writer()
  const payload = createPayload(2 * 1024 * 1024)
  for (let i = 0; i < 3; i++) writer.write(payload)
  const data = writer.toArray()
  const reader = new Reader(data)
  for (let i = 0; i < 3; i++) reader.read(payload.length)
}

function benchmarkSmall () {
  const writer = new Writer()
  const payload = createPayload(100)
  for (let i = 0; i < 3000; i++) writer.write(payload)
  const data = writer.toArray()
  const reader = new Reader(data)
  for (let i = 0; i < 3000; i++) reader.read(payload.length)
}

function benchmarkMedium () {
  const writer = new Writer()
  const payload = createPayload(64 * 1024)
  for (let i = 0; i < 100; i++) writer.write(payload)
  const data = writer.toArray()
  const reader = new Reader(data)
  for (let i = 0; i < 100; i++) reader.read(payload.length)
}

function benchmarkMixed () {
  const writer = new Writer()
  for (let i = 0; i < 1000; i++) {
    writer.writeUInt8(i & 0xff)
    writer.writeInt16LE(i)
    writer.writeUInt32BE(i)
    writer.writeVarIntNum(i)
    writer.writeUInt64LEBn(new BigNumber(i))
  }
  const data = writer.toArray()
  const reader = new Reader(data)
  for (let i = 0; i < 1000; i++) {
    reader.readUInt8()
    reader.readInt16LE()
    reader.readUInt32BE()
    reader.readVarIntNum()
    reader.readUInt64LEBn()
  }
}

function run () {
  console.log('Large payloads:', measure(benchmarkLarge).toFixed(2), 'ms')
  console.log('Small payloads:', measure(benchmarkSmall).toFixed(2), 'ms')
  console.log('Medium payloads:', measure(benchmarkMedium).toFixed(2), 'ms')
  console.log('Mixed payloads:', measure(benchmarkMixed).toFixed(2), 'ms')
}

run()
