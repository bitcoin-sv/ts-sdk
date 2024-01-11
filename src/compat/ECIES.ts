// import { Aescbc } from './aescbc'
import Random from '../primitives/Random.js'
import PrivateKey from '../primitives/PrivateKey.js'
import PublicKey from '../primitives/PublicKey.js'
import Point from '../primitives/Point.js'
import * as Hash from '../primitives/Hash.js'
import { toArray, toHex } from '../primitives/utils.js'
import { AES } from '../primitives/AESGCM.js'

class CBC {
    public static buf2BlocksBuf(buf: number[], blockSize: number): number[][] {
        const bytesize = blockSize / 8
        const blockBufs = []

        for (let i = 0; i <= buf.length / bytesize; i++) {
            let blockBuf = buf.slice(i * bytesize, i * bytesize + bytesize)

            if (blockBuf.length < blockSize) {
                blockBuf = CBC.pkcs7Pad(blockBuf, blockSize)
            }

            blockBufs.push(blockBuf)
        }

        return blockBufs
    }

    public static blockBufs2Buf(blockBufs: number[][]): number[] {
        let last = blockBufs[blockBufs.length - 1]
        last = CBC.pkcs7Unpad(last)
        blockBufs[blockBufs.length - 1] = last

        const buf = blockBufs.flat()

        return buf
    }

    public static encrypt(
        messageBuf: number[],
        ivBuf: number[],
        blockCipher: any /* TODO: type */,
        cipherKeyBuf: number[]
    ): number[] {
        const blockSize = ivBuf.length * 8
        const blockBufs = CBC.buf2BlocksBuf(messageBuf, blockSize)
        const encBufs = CBC.encryptBlocks(blockBufs, ivBuf, blockCipher, cipherKeyBuf)
        const encBuf = encBufs.flat()
        return encBuf
    }

    public static decrypt(
        encBuf: number[],
        ivBuf: number[],
        blockCipher: any /* TODO: type */,
        cipherKeyBuf: number[]
    ): number[] {
        const bytesize = ivBuf.length
        const encBufs = []
        for (let i = 0; i < encBuf.length / bytesize; i++) {
            encBufs.push(encBuf.slice(i * bytesize, i * bytesize + bytesize))
        }
        const blockBufs = CBC.decryptBlocks(encBufs, ivBuf, blockCipher, cipherKeyBuf)
        const buf = CBC.blockBufs2Buf(blockBufs)
        return buf
    }

    public static encryptBlock(
        blockBuf: number[],
        ivBuf: number[],
        blockCipher: any /* TODO: type */,
        cipherKeyBuf: number[]
    ): number[] {
        const xorbuf = CBC.xorBufs(blockBuf, ivBuf)
        const encBuf = blockCipher(xorbuf, cipherKeyBuf)
        return encBuf
    }

    public static decryptBlock(
        encBuf: number[],
        ivBuf: number[],
        blockCipher: any /* TODO: type */,
        cipherKeyBuf: number[]
    ): number[] {
        const xorbuf = blockCipher(encBuf, cipherKeyBuf)
        const blockBuf = CBC.xorBufs(xorbuf, ivBuf)
        return blockBuf
    }

    public static encryptBlocks(
        blockBufs: number[][],
        ivBuf: number[],
        blockCipher: any /* TODO: type */,
        cipherKeyBuf: number[]
    ): number[][] {
        const encBufs = []

        for (let i = 0; i < blockBufs.length; i++) {
            const blockBuf = blockBufs[i]
            const encBuf = CBC.encryptBlock(blockBuf, ivBuf, blockCipher, cipherKeyBuf)

            encBufs.push(encBuf)

            ivBuf = encBuf
        }

        return encBufs
    }

    public static decryptBlocks(
        encBufs: number[][],
        ivBuf: number[],
        blockCipher: any /* TODO: type */,
        cipherKeyBuf: number[]
    ): number[][] {
        const blockBufs = []

        for (let i = 0; i < encBufs.length; i++) {
            const encBuf = encBufs[i]
            const blockBuf = CBC.decryptBlock(encBuf, ivBuf, blockCipher, cipherKeyBuf)

            blockBufs.push(blockBuf)

            ivBuf = encBuf
        }

        return blockBufs
    }

    public static pkcs7Pad(buf: number[], blockSize: number): number[] {
        const bytesize = blockSize / 8
        const padbytesize = bytesize - buf.length
        const pad = new Array(padbytesize)
        pad.fill(padbytesize)
        const paddedbuf = [...buf, ...pad]
        return paddedbuf
    }

    public static pkcs7Unpad(paddedbuf: number[]): number[] {
        const padlength = paddedbuf[paddedbuf.length - 1]
        const padbuf = paddedbuf.slice(paddedbuf.length - padlength, paddedbuf.length)
        const padbuf2 = new Array(padlength)
        padbuf2.fill(padlength)
        if (toHex(padbuf) !== toHex(padbuf2)) {
            throw new Error('invalid padding')
        }
        return paddedbuf.slice(0, paddedbuf.length - padlength)
    }

    public static xorBufs(buf1: number[], buf2: number[]): number[] {
        if (buf1.length !== buf2.length) {
            throw new Error('bufs must have the same length')
        }

        const buf = new Array(buf1.length).fill(0)

        for (let i = 0; i < buf1.length; i++) {
            buf[i] = buf1[i] ^ buf2[i]
        }

        return buf
    }
}

export class AESCBC {
    public static encrypt(messageBuf: number[], cipherKeyBuf: number[], ivBuf: number[], concatIvBuf = true): number[] {
        ivBuf = ivBuf || Random(128 / 8)
        const ctBuf = CBC.encrypt(messageBuf, ivBuf, AES, cipherKeyBuf)
        if (concatIvBuf) {
            return [...ivBuf, ...ctBuf]
        } else {
            return ctBuf
        }
    }

    public static decrypt(encBuf: number[], cipherKeyBuf: number[], ivBuf?: number[]): number[] {
        if (!ivBuf) {
            ivBuf = encBuf.slice(0, 128 / 8)
            const ctBuf = encBuf.slice(128 / 8)
            return CBC.decrypt(ctBuf, ivBuf, AES, cipherKeyBuf)
        } else {
            const ctBuf = encBuf
            return CBC.decrypt(ctBuf, ivBuf, AES, cipherKeyBuf)
        }
    }
}

export default class ECIES {
    public static ivkEkM(privKey: PrivateKey, pubKey: PublicKey): { iv: number[]; kE: number[]; kM: number[] } {
        const r = privKey
        const KB = pubKey
        const P = KB.mul(r)
        const S = new PublicKey(P.x, P.y)
        const Sbuf = S.encode(true) as number[]
        const hash = Hash.sha512(Sbuf) as number[]
        return {
            iv: hash.slice(0, 16),
            kE: hash.slice(16, 32),
            kM: hash.slice(32, 64),
        }
    }

    public static electrumEncrypt(messageBuf: number[], toPublicKey: PublicKey, fromPrivateKey?: PrivateKey, noKey = false): number[] {
        let Rbuf
        if (fromPrivateKey === null) {
            fromPrivateKey = PrivateKey.fromRandom()
        }
        if (!noKey) {
            Rbuf = fromPrivateKey.toPublicKey().encode(true)
        }
        const { iv, kE, kM } = ECIES.ivkEkM(fromPrivateKey, toPublicKey)
        const ciphertext = AESCBC.encrypt(messageBuf, kE, iv, false)
        const BIE1 = toArray('BIE1')
        let encBuf: number[]
        if (Rbuf) {
            encBuf = [...BIE1, ...Rbuf, ...ciphertext]
        } else {
            encBuf = [...BIE1, ...ciphertext]
        }
        const hmac = Hash.sha256hmac(kM, encBuf) as number[]
        return [...encBuf, ...hmac]
    }

    public static electrumDecrypt(encBuf: number[], toPrivateKey: PrivateKey, fromPublicKey: PublicKey = null): number[] {
        const tagLength = 32

        const magic = encBuf.slice(0, 4)
        if (toHex(magic) !== 'BIE1') {
            throw new Error('Invalid Magic')
        }
        let offset = 4
        if (fromPublicKey === null) {
            // BIE1 use compressed public key, length is always 33.
            const pub = encBuf.slice(4, 37)
            fromPublicKey = PublicKey.fromString(toHex(pub))
            offset = 37
        }
        const { iv, kE, kM } = ECIES.ivkEkM(toPrivateKey, fromPublicKey)
        const ciphertext = encBuf.slice(offset, encBuf.length - tagLength)
        const hmac = encBuf.slice(encBuf.length - tagLength, encBuf.length)

        const hmac2 = Hash.sha256hmac(kM, encBuf.slice(0, encBuf.length - tagLength)) as number[]

        if (toHex(hmac) !== toHex(hmac2)) {
            throw new Error('Invalid checksum')
        }
        return AESCBC.decrypt(ciphertext, kE, iv)
    }

    public static bitcoreEncrypt(messageBuf: number[], toPublicKey: PublicKey, fromPrivateKey?: PrivateKey, ivBuf?: number[]): number[] {
        if (!fromPrivateKey) {
            fromPrivateKey = PrivateKey.fromRandom()
        }
        const r = fromPrivateKey
        const RPublicKey = fromPrivateKey.toPublicKey()
        const RBuf = RPublicKey.encode(true) as number[]
        const KB = toPublicKey
        const P = KB.mul(r)
        const S = P.getX()
        const Sbuf = S.toArray('be', 32)
        const kEkM = Hash.sha512(Sbuf) as number[]
        const kE = kEkM.slice(0, 32)
        const kM = kEkM.slice(32, 64)
        const c = AESCBC.encrypt(messageBuf, kE, ivBuf)
        const d = Hash.sha256hmac(kM, c) as number[]
        const encBuf = [...RBuf, ...c, ...d]
        return encBuf
    }

    public static bitcoreDecrypt(encBuf: number[], toPrivateKey: PrivateKey): number[] {
        const kB = toPrivateKey
        const fromPublicKey = PublicKey.fromString(toHex(encBuf.slice(0, 33)))
        const R = fromPublicKey
        const P = R.mul(kB)
        if (P.eq(new Point(0, 0))) {
            throw new Error('P equals 0')
        }
        const S = P.getX()
        const Sbuf = S.toArray('be', 32)
        const kEkM = Hash.sha512(Sbuf) as number[]
        const kE = kEkM.slice(0, 32)
        const kM = kEkM.slice(32, 64)
        const c = encBuf.slice(33, encBuf.length - 32)
        const d = encBuf.slice(encBuf.length - 32, encBuf.length)
        const d2 = Hash.sha256hmac(kM, c) as number[]
        if (toHex(d) !== toHex(d2)) {
            throw new Error('Invalid checksum')
        }
        const messageBuf = AESCBC.decrypt(c, kE)
        return messageBuf
    }
}