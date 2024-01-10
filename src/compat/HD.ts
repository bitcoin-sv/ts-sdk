import { fromBase58Check, toBase58Check, Writer, Reader, toArray, toHex } from '../primitives/utils.js'
import * as Hash from '../primitives/Hash.js'
import Curve from '../primitives/Curve.js'
import PrivateKey from '../primitives/PrivateKey.js'
import PublicKey from '../primitives/PublicKey.js'
import Random from '../primitives/Random.js'
import BigNumber from '../primitives/BigNumber.js'

export default class HD {
    versionBytesNum: number
    depth: number
    parentFingerPrint: number[]
    childIndex: number
    chainCode: number[]
    privKey: PrivateKey
    pubKey: PublicKey
    constants = {
        pubKey: 0x0488b21e,
        privKey: 0x0488ade4
    }

    constructor(
        versionBytesNum?: number,
        depth?: number,
        parentFingerPrint?: number[],
        childIndex?: number,
        chainCode?: number[],
        privKey?: PrivateKey,
        pubKey?: PublicKey
    ) {
        this.versionBytesNum = versionBytesNum
        this.depth = depth
        this.parentFingerPrint = parentFingerPrint
        this.childIndex = childIndex
        this.chainCode = chainCode
        this.privKey = privKey
        this.pubKey = pubKey
    }

    public fromRandom(): this {
        this.versionBytesNum = this.constants.privKey
        this.depth = 0x00
        this.parentFingerPrint = [0, 0, 0, 0]
        this.childIndex = 0
        this.chainCode = Random(32)
        this.privKey = PrivateKey.fromRandom()
        this.pubKey = this.privKey.toPublicKey()
        return this
    }

    public static fromRandom(): HD {
        return new this().fromRandom()
    }

    public fromString(str: string): this {
        const decoded = fromBase58Check(str)
        return this.fromBinary([...decoded.prefix, ...decoded.data] as number[])
    }

    public toString(): string {
        const bin = this.toBinary()
        return toBase58Check(bin, [])
    }

    public fromSeed(bytes: number[]): this {
        if (bytes.length < 128 / 8) {
            throw new Error('Need more than 128 bits of entropy')
        }
        if (bytes.length > 512 / 8) {
            throw new Error('More than 512 bits of entropy is nonstandard')
        }
        const hash: number[] = Hash.sha512hmac(toArray('Bitcoin seed', 'utf8'), bytes) as number[]

        this.depth = 0x00
        this.parentFingerPrint = [0, 0, 0, 0]
        this.childIndex = 0
        this.chainCode = hash.slice(32, 64)
        this.versionBytesNum = this.constants.privKey
        this.privKey = new PrivateKey(hash.slice(0, 32))
        this.pubKey = this.privKey.toPublicKey()

        return this
    }

    public static fromSeed(bytes: number[]): HD {
        return new this().fromSeed(bytes)
    }

    public fromBinary(buf: number[]): this {
        // Both pub and private extended keys are 78 buf
        if (buf.length !== 78) {
            throw new Error('incorrect bip32 data length')
        }
        const reader = new Reader(buf)

        this.versionBytesNum = reader.readUInt32BE()
        this.depth = reader.readUInt8()
        this.parentFingerPrint = reader.read(4)
        this.childIndex = reader.readUInt32BE()
        this.chainCode = reader.read(32)
        const keyBytes = reader.read(33)

        const isPrivate = this.versionBytesNum === this.constants.privKey
        const isPublic = this.versionBytesNum === this.constants.pubKey

        if (isPrivate && keyBytes[0] === 0) {
            this.privKey = new PrivateKey(keyBytes.slice(1, 33))
            this.pubKey = this.privKey.toPublicKey()
        } else if (isPublic && (keyBytes[0] === 0x02 || keyBytes[0] === 0x03)) {
            this.pubKey = PublicKey.fromString(toHex(keyBytes))
        } else {
            throw new Error('Invalid key')
        }

        return this
    }

    public derive(path: string): HD {
        if (path === 'm') {
            return this
        }

        const e = path.split('/')

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let bip32: HD = this
        for (const i in e) {
            const c = e[i]

            if (i === '0') {
                if (c !== 'm') {
                    throw new Error('invalid path')
                }
                continue
            }

            if (parseInt(c.replace("'", ''), 10).toString() !== c.replace("'", '')) {
                throw new Error('invalid path')
            }

            const usePrivate = c.length > 1 && c[c.length - 1] === "'"
            let childIndex = parseInt(usePrivate ? c.slice(0, c.length - 1) : c, 10) & 0x7fffffff

            if (usePrivate) {
                childIndex += 0x80000000
            }

            bip32 = bip32.deriveChild(childIndex)
        }

        return bip32
    }

    public deriveChild(i: number): HD {
        if (typeof i !== 'number') {
            throw new Error('i must be a number')
        }

        const ibc: number[] = []
        ibc.push((i >> 24) & 0xff)
        ibc.push((i >> 16) & 0xff)
        ibc.push((i >> 8) & 0xff)
        ibc.push(i & 0xff)
        const ib = [...ibc]

        const usePrivate = (i & 0x80000000) !== 0

        const isPrivate = this.versionBytesNum === this.constants.privKey

        if (usePrivate && (!this.privKey || !isPrivate)) {
            throw new Error('Cannot do private key derivation without private key')
        }

        let ret = null
        if (this.privKey) {
            let data = null

            if (usePrivate) {
                data = [0, ...this.privKey.toArray('be', 32), ...ib]
            } else {
                data = [...this.pubKey.encode(true) as number[], ...ib]
            }

            const hash = Hash.sha512hmac(this.chainCode, data)
            const il = new BigNumber(hash.slice(0, 32))
            const ir = hash.slice(32, 64)

            // ki = IL + kpar (mod n).
            const k = il.add(this.privKey).mod(new Curve().n)

            ret = new HD()
            ret.chainCode = ir

            ret.privKey = new PrivateKey(k.toArray())
            ret.pubKey = ret.privKey.toPublicKey()
        } else {
            const data = [...this.pubKey.encode(true) as number[], ...ib]
            const hash = Hash.sha512hmac(this.chainCode, data)
            const il = new BigNumber(hash.slice(0, 32))
            const ir = hash.slice(32, 64)

            // Ki = (IL + kpar)*G = IL*G + Kpar
            const ilG = new Curve().g.mul(il)
            const Kpar = this.pubKey
            const Ki = ilG.add(Kpar)
            const newpub = new PublicKey(Ki.x, Ki.y)

            ret = new HD()
            ret.chainCode = ir

            ret.pubKey = newpub
        }

        ret.childIndex = i
        const pubKeyhash = Hash.hash160(this.pubKey.encode(true))
        ret.parentFingerPrint = pubKeyhash.slice(0, 4)
        ret.versionBytesNum = this.versionBytesNum
        ret.depth = this.depth + 1

        return ret
    }

    public toPublic(): HD {
        const bip32 = new HD(this.versionBytesNum, this.depth, this.parentFingerPrint, this.childIndex, this.chainCode, this.privKey, this.pubKey)
        bip32.versionBytesNum = this.constants.pubKey
        bip32.privKey = undefined
        return bip32
    }

    public toBinary(): number[] {
        const isPrivate = this.versionBytesNum === this.constants.privKey
        const isPublic = this.versionBytesNum === this.constants.pubKey
        if (isPrivate) {
            return new Writer()
                .writeUInt32BE(this.versionBytesNum)
                .writeUInt8(this.depth)
                .write(this.parentFingerPrint)
                .writeUInt32BE(this.childIndex)
                .write(this.chainCode)
                .writeUInt8(0)
                .write(this.privKey.toArray('be', 32))
                .toArray()
        } else if (isPublic) {
            return new Writer()
                .writeUInt32BE(this.versionBytesNum)
                .writeUInt8(this.depth)
                .write(this.parentFingerPrint)
                .writeUInt32BE(this.childIndex)
                .write(this.chainCode)
                .write(this.pubKey.encode(true) as number[])
                .toArray()
        } else {
            throw new Error('bip32: invalid versionBytesNum byte')
        }
    }

    public isPrivate(): boolean {
        return this.versionBytesNum === this.constants.privKey
    }
}
