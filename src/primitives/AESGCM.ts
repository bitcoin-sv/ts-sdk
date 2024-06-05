const SBox = [[0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76],
  [0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0],
  [0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15],
  [0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75],
  [0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84],
  [0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf],
  [0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8],
  [0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2],
  [0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73],
  [0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb],
  [0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79],
  [0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08],
  [0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a],
  [0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e],
  [0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf],
  [0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16]]
const Rcon = [[0x00, 0x00, 0x00, 0x00], [0x01, 0x00, 0x00, 0x00], [0x02, 0x00, 0x00, 0x00], [0x04, 0x00, 0x00, 0x00],
  [0x08, 0x00, 0x00, 0x00], [0x10, 0x00, 0x00, 0x00], [0x20, 0x00, 0x00, 0x00], [0x40, 0x00, 0x00, 0x00],
  [0x80, 0x00, 0x00, 0x00], [0x1b, 0x00, 0x00, 0x00], [0x36, 0x00, 0x00, 0x00]]

function addRoundKey (
  state: number[][],
  roundKeyArray: number[][],
  offset: number
): void {
  let i
  let j: number
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      state[i][j] = state[i][j] ^ roundKeyArray[offset + j][i]
    }
  }
}

function subBytes (state: number[][]): void {
  let i
  let j
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      state[i][j] = SBox[(state[i][j] & 0xF0) >> 4][(state[i][j] & 0x0F)]
    }
  }
}

function subWord (value: number[]): void {
  let i
  for (i = 0; i < 4; i++) {
    value[i] = SBox[(value[i] & 0xF0) >> 4][(value[i] & 0x0F)]
  }
}

function rotWord (value: number[]): void {
  const temp = value[0]

  value[0] = value[1]
  value[1] = value[2]
  value[2] = value[3]
  value[3] = temp
}

function shiftRows (state: number[][]): void {
  let i: number
  let j: number
  let k: number
  let l: number
  let temp

  for (i = 1; i < 4; i++) {
    for (j = 0; j < ((i - 1) % 2) + 1; j++) {
      temp = state[i][j]
      k = j
      while (true) {
        l = k + i
        if (l >= 4) {
          l = l - 4
        }

        if (l === j) {
          break
        }

        state[i][k] = state[i][l]
        k = l
      }

      state[i][k] = temp
    }
  }
}

function finiteFieldMultiplication (value0: number, value1: number): number {
  let i
  let result = 0

  for (i = 0; i < 8; i++) {
    if ((value1 & 1) !== 0) {
      result = result ^ value0
    }

    if ((value0 & 0x80) !== 0) {
      value0 = value0 << 1
      value0 = value0 ^ 0x11b
    } else {
      value0 = value0 << 1
    }

    value1 = value1 >> 1
  }

  return result
}

function mixColumns (state: number[][]): void {
  let i
  let j
  const temp: number[][] = [[], [], [], []]

  for (i = 0; i < 4; i++) {
    temp[0][i] = finiteFieldMultiplication(0x02, state[0][i]) ^ finiteFieldMultiplication(0x03, state[1][i]) ^
      state[2][i] ^ state[3][i]
    temp[1][i] = state[0][i] ^ finiteFieldMultiplication(0x02, state[1][i]) ^
      finiteFieldMultiplication(0x03, state[2][i]) ^ state[3][i]
    temp[2][i] = state[0][i] ^ state[1][i] ^ finiteFieldMultiplication(0x02, state[2][i]) ^
      finiteFieldMultiplication(0x03, state[3][i])
    temp[3][i] = finiteFieldMultiplication(0x03, state[0][i]) ^ state[1][i] ^ state[2][i] ^
      finiteFieldMultiplication(0x02, state[3][i])
  }

  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      state[i][j] = temp[i][j]
    }
  }
}

function keyExpansion (roundLimit: number, key: number[]): number[][] {
  let i
  let j
  const nK = parseInt(String(key.length / 4))
  const result = []

  for (i = 0; i < key.length; i++) {
    if (i % 4 === 0) {
      result.push([])
    }

    result[parseInt(String(i / 4))].push(key[i])
  }

  for (i = nK; i < 4 * roundLimit; i++) {
    result[i] = []
    const temp = result[i - 1].slice()

    if (i % nK === 0) {
      rotWord(temp)
      subWord(temp)

      for (j = 0; j < 4; j++) {
        temp[j] = temp[j] ^ Rcon[parseInt(String(i / nK))][j]
      }
    } else if (nK > 6 && (i % nK) === 4) {
      subWord(temp)
    }

    for (j = 0; j < 4; j++) {
      result[i][j] = result[i - nK][j] ^ temp[j]
    }
  }

  return result
}

export function AES (input: number[], key: number[]): number[] {
  let i
  let j
  let round: number
  let roundLimit
  const state = [[], [], [], []]
  const output = []

  // Since the BigNumber representation of keys ignores big endian zeroes,
  // extend incoming key arrays with zeros to the smallest standard key size.
  const ekey = Array.from(key)
  if (ekey.length <= 16) {
    while (ekey.length < 16) ekey.unshift(0)
    roundLimit = 11
  } else if (ekey.length <= 24) {
    while (ekey.length < 24) ekey.unshift(0)
    roundLimit = 13
  } else if (key.length <= 32) {
    while (ekey.length < 32) ekey.unshift(0)
    roundLimit = 15
  } else {
    throw new Error('Illegal key length: ' + String(key.length))
  }

  const w = keyExpansion(roundLimit, ekey)

  for (i = 0; i < 15; i++) {
    state[parseInt(String(i / 4))].push(input[(i * 4) % 15])
  }
  state[3].push(input[15])

  addRoundKey(state, w, 0)
  for (round = 1; round < roundLimit; round++) {
    subBytes(state)
    shiftRows(state)

    if (round + 1 < roundLimit) {
      mixColumns(state)
    }

    addRoundKey(state, w, round * 4)
  }

  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      output.push(state[j][i])
    }
  }

  return output
}

export const checkBit = function (
  byteArray: number[],
  byteIndex: number,
  bitIndex: number
): 1 | 0 {
  return (byteArray[byteIndex] & (0x01 << bitIndex)) !== 0 ? 1 : 0
}

export const getBytes = function (numericValue: number): number[] {
  return [
    (numericValue & 0xFF000000) >>> 24,
    (numericValue & 0x00FF0000) >> 16,
    (numericValue & 0x0000FF00) >> 8,
    numericValue & 0x000000FF
  ]
}

const createZeroBlock = function (length: number): number[] {
  let i
  const result = []

  for (i = 0; i < length; i++) {
    result.push(0x00)
  }

  return result
}

const R = [0xe1].concat(createZeroBlock(15))

export const exclusiveOR = function (block0: number[], block1: number[]): number[] {
  let i
  const result = []

  for (i = 0; i < block0.length; i++) {
    result[i] = block0[i] ^ block1[i]
  }

  return result
}

export const rightShift = function (block: number[]): number[] {
  let i: number
  let carry = 0
  let oldCarry = 0

  for (i = 0; i < block.length; i++) {
    oldCarry = carry
    carry = block[i] & 0x01
    block[i] = block[i] >> 1

    if (oldCarry !== 0) {
      block[i] = block[i] | 0x80
    }
  }

  return block
}

export const multiply = function (block0: number[], block1: number[]): number[] {
  let i
  let j
  let v = block1.slice()
  let z = createZeroBlock(16)

  for (i = 0; i < 16; i++) {
    for (j = 7; j !== -1; j--) {
      if (checkBit(block0, i, j) !== 0) {
        z = exclusiveOR(z, v)
      }

      if (checkBit(v, 15, 0) !== 0) {
        v = exclusiveOR(rightShift(v), R)
      } else {
        v = rightShift(v)
      }
    }
  }

  return z
}

export const incrementLeastSignificantThirtyTwoBits = function (
  block: number[]
): number[] {
  let i
  const result = block.slice()
  for (i = 15; i !== 11; i--) {
    result[i] = result[i] + 1

    if (result[i] === 256) {
      result[i] = 0
    } else {
      break
    }
  }

  return result
}

export function ghash (input: number[], hashSubKey: number[]): number[] {
  let i: number
  let result = createZeroBlock(16)

  for (i = 0; i < input.length; i += 16) {
    result = multiply(
      exclusiveOR(
        result,
        input.slice(i, Math.min(i + 16, input.length))
      ),
      hashSubKey
    )
  }

  return result
}

function gctr (
  input: number[],
  initialCounterBlock: number[],
  key: number[]
): number[] {
  let i: number
  let j
  let y
  let counterBlock = initialCounterBlock
  const output = []

  if (input.length === 0) {
    return input
  }

  const n = Math.ceil(input.length / 16)
  for (i = 0; i < n; i++) {
    y = exclusiveOR(input.slice(i * 16, Math.min((i + 1) * 16, input.length)),
      AES(counterBlock, key))

    for (j = 0; j < y.length; j++) {
      output.push(y[j])
    }

    if (i + 1 < n) {
      counterBlock = incrementLeastSignificantThirtyTwoBits(counterBlock)
    }
  }

  return output
}

export function AESGCM (
  plainText: number[],
  additionalAuthenticatedData: number[],
  initializationVector: number[],
  key: number[]
): { result: number[], authenticationTag: number[] } {
  let preCounterBlock
  let plainTag
  const hashSubKey = AES(createZeroBlock(16), key)
  preCounterBlock = [...initializationVector]
  if (initializationVector.length === 12) {
    preCounterBlock = preCounterBlock.concat(createZeroBlock(3)).concat([0x01])
  } else {
    if (initializationVector.length % 16 !== 0) {
      preCounterBlock = preCounterBlock.concat(
        createZeroBlock(16 - (initializationVector.length % 16))
      )
    }

    preCounterBlock = preCounterBlock.concat(createZeroBlock(8))

    preCounterBlock = ghash(preCounterBlock.concat(createZeroBlock(4))
      .concat(getBytes(initializationVector.length * 8)), hashSubKey)
  }

  const cipherText = gctr(plainText, incrementLeastSignificantThirtyTwoBits(preCounterBlock), key)

  plainTag = additionalAuthenticatedData.slice()

  if (additionalAuthenticatedData.length === 0) {
    plainTag = plainTag.concat(createZeroBlock(16))
  } else if (additionalAuthenticatedData.length % 16 !== 0) {
    plainTag = plainTag.concat(createZeroBlock(16 - (additionalAuthenticatedData.length % 16)))
  }

  plainTag = plainTag.concat(cipherText)

  if (cipherText.length === 0) {
    plainTag = plainTag.concat(createZeroBlock(16))
  } else if (cipherText.length % 16 !== 0) {
    plainTag = plainTag.concat(createZeroBlock(16 - (cipherText.length % 16)))
  }

  plainTag = plainTag.concat(createZeroBlock(4))
    .concat(getBytes(additionalAuthenticatedData.length * 8))
    .concat(createZeroBlock(4)).concat(getBytes(cipherText.length * 8))

  return {
    result: cipherText,
    authenticationTag: gctr(ghash(plainTag, hashSubKey), preCounterBlock, key)
  }
}

export function AESGCMDecrypt (
  cipherText: number[],
  additionalAuthenticatedData: number[],
  initializationVector: number[],
  authenticationTag: number[],
  key: number[]
): number[] | null {
  let preCounterBlock
  let compareTag

  // Generate the hash subkey
  const hashSubKey = AES(createZeroBlock(16), key)

  preCounterBlock = [...initializationVector]
  if (initializationVector.length === 12) {
    preCounterBlock = preCounterBlock.concat(createZeroBlock(3)).concat([0x01])
  } else {
    if (initializationVector.length % 16 !== 0) {
      preCounterBlock = preCounterBlock.concat(createZeroBlock(16 - (initializationVector.length % 16)))
    }

    preCounterBlock = preCounterBlock.concat(createZeroBlock(8))

    preCounterBlock = ghash(preCounterBlock.concat(createZeroBlock(4)).concat(getBytes(initializationVector.length * 8)), hashSubKey)
  }

  // Decrypt to obtain the plain text
  const plainText = gctr(cipherText, incrementLeastSignificantThirtyTwoBits(preCounterBlock), key)

  compareTag = additionalAuthenticatedData.slice()

  if (additionalAuthenticatedData.length === 0) {
    compareTag = compareTag.concat(createZeroBlock(16))
  } else if (additionalAuthenticatedData.length % 16 !== 0) {
    compareTag = compareTag.concat(createZeroBlock(16 - (additionalAuthenticatedData.length % 16)))
  }

  compareTag = compareTag.concat(cipherText)

  if (cipherText.length === 0) {
    compareTag = compareTag.concat(createZeroBlock(16))
  } else if (cipherText.length % 16 !== 0) {
    compareTag = compareTag.concat(createZeroBlock(16 - (cipherText.length % 16)))
  }

  compareTag = compareTag.concat(createZeroBlock(4))
    .concat(getBytes(additionalAuthenticatedData.length * 8))
    .concat(createZeroBlock(4)).concat(getBytes(cipherText.length * 8))

  // Generate the authentication tag
  const calculatedTag = gctr(ghash(compareTag, hashSubKey), preCounterBlock, key)

  // If the calculated tag does not match the provided tag, return null - the decryption failed.
  if (calculatedTag.join() !== authenticationTag.join()) {
    return null
  }

  return plainText
}
