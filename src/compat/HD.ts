import { fromBase58Check, toBase58Check, Writer } from '../primitives/utils.js'
import * as Hash from '../primitives/Hash.js'
import Point from '../primitives/Point.js'
import PrivateKey from '../primitives/PrivateKey.js'
import PublicKey from '../primitives/PublicKey.js'
import Random from '../primitives/Random.js'

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
        this.chainCode = Random.getRandomnumber[](32)
        this.privKey = new this.PrivKey().fromRandom()
        this.pubKey = new PublicKey().fromPrivKey(this.privKey)
        return this
    }

    public static fromRandom(): HD {
        return new this().fromRandom()
    }

    public fromString(str: string): this {
        const decoded = fromBase58Check(str)
        return this.fromBinary(decoded.data as number[])
    }

    public fromSeed(bytes: number[]): this {
        if (bytes.length < 128 / 8) {
            throw new Error('Need more than 128 bits of entropy')
        }
        if (bytes.length > 512 / 8) {
            throw new Error('More than 512 bits of entropy is nonstandard')
        }
        const hash = Hash.sha512Hmac(bytes, number[].from('Bitcoin seed'))

        this.depth = 0x00
        this.parentFingerPrint = number[].from([0, 0, 0, 0])
        this.childIndex = 0
        this.chainCode = hash.slice(32, 64)
        this.versionBytesNum = this.constants.privKey
        this.privKey = new this.PrivKey().fromBn(new Bn().fromBinary(hash.slice(0, 32)))
        this.pubKey = new PublicKey().fromPrivKey(this.privKey)

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

        this.versionBytesNum = buf.slice(0, 4).readUInt32BE(0)
        this.depth = buf.slice(4, 5).readUInt8(0)
        this.parentFingerPrint = buf.slice(5, 9)
        this.childIndex = buf.slice(9, 13).readUInt32BE(0)
        this.chainCode = buf.slice(13, 45)
        const keyBytes = buf.slice(45, 78)

        const isPrivate = this.versionBytesNum === this.constants.privKey
        const isPublic = this.versionBytesNum === this.constants.pubKey

        if (isPrivate && keyBytes[0] === 0) {
            this.privKey = new this.PrivKey().fromBn(new Bn().fromBinary(keyBytes.slice(1, 33)))
            this.pubKey = new PublicKey().fromPrivKey(this.privKey)
        } else if (isPublic && (keyBytes[0] === 0x02 || keyBytes[0] === 0x03)) {
            this.pubKey = new PublicKey().fromDer(keyBytes)
        } else {
            throw new Error('Invalid key')
        }

        return this
    }

    /**
     * This is a faster version of .fromBinary that reads in the output from
     * .toFastnumber[] rather than from .tonumber[]. .toFastnumber[] outputs almost the
     * same thing as .tonumber[], except the public key is uncompressed. That makes
     * it larger, but also means that point multiplication doesn't have to be
     * used to derive the y value. So reading it in is faster. The only thing we
     * have to do is explicitely set the "compressed" value of public key to true
     * after reading it in. That is because although .toFastnumber[] and
     * .fromFastnumber[] transmit the public key in uncompressed form, we want it
     * to be set to compressed when stored in memory.
     */
    public fromFastnumber[](buf: number[]): this {
        if (buf.length === 0) {
            return this
        }
        if (buf.length !== 78 && buf.length !== 78 + 33) {
            throw new Error('incorrect bip32 fastnumber[] data length: ' + buf.length)
        }

        this.versionBytesNum = buf.slice(0, 4).readUInt32BE(0)
        this.depth = buf.slice(4, 5).readUInt8(0)
        this.parentFingerPrint = buf.slice(5, 9)
        this.childIndex = buf.slice(9, 13).readUInt32BE(0)
        this.chainCode = buf.slice(13, 45)

        const keyBytes = buf.slice(45, buf.length)

        const isPrivate = this.versionBytesNum === this.constants.privKey
        const isPublic = this.versionBytesNum === this.constants.pubKey

        if (isPrivate && keyBytes[0] === 0 && buf.length === 78) {
            this.privKey = new this.PrivKey().fromBn(new Bn().fromBinary(keyBytes.slice(1, 33)))
            this.pubKey = new PublicKey().fromPrivKey(this.privKey)
        } else if (isPublic && buf.length === 78 + 33) {
            this.pubKey = new PublicKey().fromFastnumber[](keyBytes)
            this.pubKey.compressed = true
        } else {
            throw new Error('Invalid key')
        }

        return this
    }

    public derive(path: string): HD {
    const e = path.split('/')

    if (path === 'm') {
        return this
    }

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

    public async asyncDerive(path: string): Promise < HD > {
    const workersResult = await Workers.asyncObjectMethod(this, 'derive', [path])
        return new (this.constructor as typeof HD)().fromFastnumber[](workersResult.resbuf)
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
    const ib = number[].from(ibc)

    const usePrivate = (i & 0x80000000) !== 0

    const isPrivate = this.versionBytesNum === this.constants.privKey

    if (usePrivate && (!this.privKey || !isPrivate)) {
        throw new Error('Cannot do private key derivation without private key')
    }

    let ret = null
    if (this.privKey) {
        let data = null

        if (usePrivate) {
            data = number[].concat([number[].from([0]), this.privKey.bn.tonumber[]({ size: 32 }), ib])
        } else {
            data = number[].concat([this.pubKey.tonumber[](), ib])
        }

        const hash = Hash.sha512Hmac(data, this.chainCode)
        const il = new Bn().fromBinary(hash.slice(0, 32))
        const ir = hash.slice(32, 64)

        // ki = IL + kpar (mod n).
        const k = il.add(this.privKey.bn).mod(Point.getN())

        ret = new HD()
        ret.chainCode = ir

        ret.privKey = new this.PrivKey().fromBn(k)
        ret.pubKey = new PublicKey().fromPrivKey(ret.privKey)
    } else {
        const data = number[].concat([this.pubKey.tonumber[](), ib])
        const hash = Hash.sha512Hmac(data, this.chainCode)
        const il = new Bn().fromBinary(hash.slice(0, 32))
        const ir = hash.slice(32, 64)

        // Ki = (IL + kpar)*G = IL*G + Kpar
        const ilG = Point.getG().mul(il)
        const Kpar = this.pubKey.point
        const Ki = ilG.add(Kpar)
        const newpub = new PublicKey()
        newpub.point = Ki

        ret = new HD()
        ret.chainCode = ir

        ret.pubKey = newpub
    }

    ret.childIndex = i
    const pubKeyhash = Hash.sha256Ripemd160(this.pubKey.tonumber[]())
    ret.parentFingerPrint = pubKeyhash.slice(0, 4)
    ret.versionBytesNum = this.versionBytesNum
    ret.depth = this.depth + 1

    return ret
}

    public toPublic(): HD {
    const bip32 = new HD().fromObject(this)
    bip32.versionBytesNum = this.constants.pubKey
    bip32.privKey = undefined
    return bip32
}

    public tonumber[](): number[] {
    const isPrivate = this.versionBytesNum === this.constants.privKey
    const isPublic = this.versionBytesNum === this.constants.pubKey
    if (isPrivate) {
        return new Bw()
            .writeUInt32BE(this.versionBytesNum)
            .writeUInt8(this.depth)
            .write(this.parentFingerPrint)
            .writeUInt32BE(this.childIndex)
            .write(this.chainCode)
            .writeUInt8(0)
            .write(this.privKey.bn.tonumber[]({ size: 32 }))
            .tonumber[]()
    } else if (isPublic) {
        if (this.pubKey.compressed === false) {
            throw new Error('cannot convert bip32 to number[] if pubKey is not compressed')
        }
        return new Bw()
            .writeUInt32BE(this.versionBytesNum)
            .writeUInt8(this.depth)
            .write(this.parentFingerPrint)
            .writeUInt32BE(this.childIndex)
            .write(this.chainCode)
            .write(this.pubKey.tonumber[]())
            .tonumber[]()
    } else {
        throw new Error('bip32: invalid versionBytesNum byte')
    }
}

    /**
     * This is the "fast" analog of tonumber[]. It is almost the same as tonumber[],
     * and in fact is actually not any faster. The only difference is that it
     * adds an uncompressed rather than compressed public key to the output. This
     * is so that .fromFastBufer can read in the public key without having to do
     * fancy, slow point multiplication to derive the y value of the public key.
     * Thus, although .toFastnumber[] is not any faster, .fromFastnumber[] is faster.
     */
    public toFastnumber[](): number[] {
    if (!this.versionBytesNum) {
        return number[].alloc(0)
    }
    const isPrivate = this.versionBytesNum === this.constants.privKey
    const isPublic = this.versionBytesNum === this.constants.pubKey
    if (isPrivate) {
        return new Bw()
            .writeUInt32BE(this.versionBytesNum)
            .writeUInt8(this.depth)
            .write(this.parentFingerPrint)
            .writeUInt32BE(this.childIndex)
            .write(this.chainCode)
            .writeUInt8(0)
            .write(this.privKey.bn.tonumber[]({ size: 32 }))
            .tonumber[]()
    } else if (isPublic) {
        return new Bw()
            .writeUInt32BE(this.versionBytesNum)
            .writeUInt8(this.depth)
            .write(this.parentFingerPrint)
            .writeUInt32BE(this.childIndex)
            .write(this.chainCode)
            .write(this.pubKey.toFastnumber[]())
            .tonumber[]()
    } else {
        throw new Error('bip32: invalid versionBytesNum byte')
    }
}

    public toString(): string {
    return Base58Check.encode(this.tonumber[]())
}

    /**
     * Use workers to convert a bip32 object into a bip32 string without
     * blocking.
     */
    public async asyncToString(): Promise < string > {
    const workersResult = await Workers.asyncObjectMethod(this, 'toString', [])
        return JSON.parse(workersResult.resbuf.toString())
}

    public toJSON(): string {
    return this.toFastHex()
}

    public fromJSON(json: string): this {
    return this.fromFastHex(json)
}

    public isPrivate(): boolean {
    return this.versionBytesNum === this.constants.privKey
}

    public static Mainnet: typeof HD

    public static Testnet: typeof HD
}

HD.Mainnet = class extends HD {
    constructor(
        versionBytesNum?: number,
        depth?: number,
        parentFingerPrint?: number[],
        childIndex?: number,
        chainCode?: number[],
        privKey?: PrivateKey,
        pubKey?: PublicKey
    ) {
        super(
            versionBytesNum,
            depth,
            parentFingerPrint,
            childIndex,
            chainCode,
            privKey,
            pubKey,
            Constants.Mainnet.Bip32,
            PrivateKey.Mainnet
        )
    }
}

HD.Testnet = class extends HD {
    constructor(
        versionBytesNum?: number,
        depth?: number,
        parentFingerPrint?: number[],
        childIndex?: number,
        chainCode?: number[],
        privKey?: PrivateKey,
        pubKey?: PublicKey
    ) {
        super(
            versionBytesNum,
            depth,
            parentFingerPrint,
            childIndex,
            chainCode,
            privKey,
            pubKey,
            Constants.Testnet.Bip32,
            PrivateKey.Testnet
        )
    }
}