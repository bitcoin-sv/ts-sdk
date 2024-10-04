import BigNumber from './BigNumber.js'
import Signature from './Signature.js'
import Curve from './Curve.js'
import Point from './Point.js'
import DRBG from './DRBG.js'

/**
 * Truncates a BigNumber message to the length of the curve order n, in the context of the Elliptic Curve Digital Signature Algorithm (ECDSA).
 * This method is used as part of ECDSA signing and verification.
 *
 * The method calculates `delta`, which is a difference obtained by subtracting the bit length of the curve order `n` from the byte length of the message in bits.
 * If `delta` is greater than zero, logical shifts msg to the right by `delta`, retaining the sign.
 *
 * Another condition is tested, but only if `truncOnly` is false. This condition compares the value of msg to curve order `n`.
 * If msg is greater or equal to `n`, it is decreased by `n` and returned.
 *
 * @method truncateToN
 * @param msg - The BigNumber message to be truncated.
 * @param truncOnly - An optional boolean parameter that if set to true, the method will only perform truncation of the BigNumber without doing the additional subtraction from the curve order.
 * @returns Returns the truncated BigNumber value, potentially subtracted by the curve order n.
 *
 * @example
 * let msg = new BigNumber('1234567890abcdef', 16);
 * let truncatedMsg = truncateToN(msg);
 */
function truncateToN(msg: BigNumber, truncOnly?: boolean, curve = new Curve()): BigNumber {
    const delta = msg.byteLength() * 8 - curve.n.bitLength()
    if (delta > 0) { msg.iushrn(delta) }
    if (!truncOnly && msg.cmp(curve.n) >= 0) {
        return msg.sub(curve.n)
    } else {
        return msg
    }
}

/**
 * Generates a digital signature for a given message.
 *
 * @function sign
 * @param msg - The BigNumber message for which the signature has to be computed.
 * @param key - Private key in BigNumber.
 * @param forceLowS - Optional boolean flag if True forces "s" to be the lower of two possible values.
 * @param customK - Optional specification for k value, which can be a function or BigNumber.
 * @returns Returns the elliptic curve digital signature of the message.
 *
 * @example
 * const msg = new BigNumber('2664878')
 * const key = new BigNumber('123456')
 * const signature = sign(msg, key)
 */
export const sign = (msg: BigNumber, key: BigNumber, forceLowS: boolean = false, customK?: BigNumber | Function): Signature => {
    if (typeof BigInt === 'function') {
        // Curve parameters for secp256k1
        const zero = BigInt(0);
        const one = BigInt(1);
        const two = BigInt(2);
        const n = BigInt(
            '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'
        ); // Order of the curve
        const p = BigInt(
            '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F'
        ); // Field prime
        const Gx = BigInt(
            '0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'
        );
        const Gy = BigInt(
            '0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8'
        );
        const G = { x: Gx, y: Gy };

        // Convert msg and key to BigInt
        const z = BigInt('0x' + msg.toString(16));
        const d = BigInt('0x' + key.toString(16));

        // Validate private key
        if (d <= zero || d >= n) {
            throw new Error('Invalid private key');
        }

        // Helper function to convert BigInt to byte array
        function bigIntToBytes(value: bigint, length: number): Uint8Array {
            const hex = value.toString(16).padStart(length * 2, '0');
            const bytes = new Uint8Array(length);
            for (let i = 0; i < length; i++) {
                bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
            }
            return bytes;
        }

        // Zero-extend key to provide enough entropy
        const bytes = 32; // Assuming 256-bit curve
        const bkey = bigIntToBytes(d, bytes); // 'd' is the private key BigInt

        // Zero-extend nonce to have the same byte size as N
        const nonce = bigIntToBytes(z, bytes); // 'z' is the message hash BigInt

        // Instantiate Hmac_DRBG
        const drbg = new DRBG(Array.from(bkey), Array.from(nonce));

        // Number of bytes to generate
        const ns1 = n - one;

        let iter = 0;

        // Truncate to N function for BigInt
        function truncateToN(k: bigint, n: bigint, truncOnly: boolean = true): bigint {
            const kBitLength = k.toString(2).length;
            const nBitLength = n.toString(2).length;
            const delta = kBitLength - nBitLength;
            if (delta > 0) {
                k = k >> BigInt(delta);
            }
            if (!truncOnly && k >= n) {
                return k - n;
            } else {
                return k;
            }
        }

        function generateK(): bigint {
            if (typeof customK === 'function') {
                // Call customK function to get k as BigNumber
                const k_bn = customK(iter);
                // Convert k_bn (BigNumber) to BigInt
                const k_str = k_bn.toString(16);
                return BigInt('0x' + k_str);
            } else if (BigNumber.isBN(customK)) {
                // Use customK provided, convert to BigInt
                const k_str = customK.toString(16);
                return BigInt('0x' + k_str);
            } else {
                // Use DRBG to generate k
                const k_hex = drbg.generate(bytes); // Generate hex string
                return BigInt('0x' + k_hex);
            }
        }

        // Modular arithmetic functions
        function mod(a: bigint, m: bigint): bigint {
            return ((a % m) + m) % m;
        }

        function modInv(a: bigint, m: bigint): bigint {
            let lm = one,
                hm = zero;
            let low = mod(a, m),
                high = m;
            while (low > one) {
                const r = high / low;
                const nm = hm - lm * r;
                const neww = high - low * r;
                hm = lm;
                lm = nm;
                high = low;
                low = neww;
            }
            return mod(lm, m);
        }

        function pointAdd(
            P: { x: bigint; y: bigint } | null,
            Q: { x: bigint; y: bigint } | null
        ): { x: bigint; y: bigint } | null {
            if (P === null) return Q;
            if (Q === null) return P;

            if (P.x === Q.x && P.y === mod(-Q.y, p)) {
                return null; // Point at infinity
            }

            let m: bigint;
            if (P.x === Q.x && P.y === Q.y) {
                // Point doubling
                if (P.y === zero) {
                    return null; // Point at infinity
                }
                const numerator = mod(BigInt(3) * P.x * P.x, p); // 3 * x^2
                const denominator = modInv(two * P.y, p);
                m = mod(numerator * denominator, p);
            } else {
                const numerator = mod(Q.y - P.y, p);
                const denominator = modInv(Q.x - P.x, p);
                m = mod(numerator * denominator, p);
            }

            const xR = mod(m * m - P.x - Q.x, p);
            const yR = mod(m * (P.x - xR) - P.y, p);

            return { x: xR, y: yR };
        }

        function scalarMul(
            k: bigint,
            P: { x: bigint; y: bigint }
        ): { x: bigint; y: bigint } | null {
            let N = P;
            let Q = null; // Point at infinity

            while (k > zero) {
                if (k % two === one) {
                    Q = pointAdd(Q, N);
                }
                N = pointAdd(N, N);
                k >>= one;
            }
            return Q;
        }

        while (true) {
            let k = generateK();
            iter += 1;

            // Truncate k to n bits
            k = truncateToN(k, n, true);

            if (k <= one || k >= ns1) {
                if (customK instanceof BigNumber) {
                    throw new Error(
                        'Invalid fixed custom K value (must be more than 1 and less than N-1)'
                    );
                } else {
                    continue;
                }
            }

            const R = scalarMul(k, G);
            if (R === null) {
                if (customK instanceof BigNumber) {
                    throw new Error(
                        'Invalid fixed custom K value (must not create a point at infinity when multiplied by the generator point)'
                    );
                } else {
                    continue;
                }
            }

            const r = mod(R.x, n);
            if (r === zero) {
                if (customK instanceof BigNumber) {
                    throw new Error(
                        'Invalid fixed custom K value (when multiplied by G, the resulting x coordinate mod N must not be zero)'
                    );
                } else {
                    continue;
                }
            }

            const kInv = modInv(k, n);
            const rd = mod(r * d, n);
            let s = mod(kInv * (z + rd), n);
            if (s === zero) {
                if (customK instanceof BigNumber) {
                    throw new Error(
                        'Invalid fixed custom K value (when used with the key, it cannot create a zero value for S)'
                    );
                } else {
                    continue;
                }
            }

            // Use complement of `s` if it is > n / 2
            if (forceLowS && s > n / two) {
                s = n - s;
            }

            // Return signature as BigNumbers
            const r_bn = new BigNumber(r.toString(16), 16);
            const s_bn = new BigNumber(s.toString(16), 16);
            return new Signature(r_bn, s_bn);
        }
    } else {
        const curve = new Curve()
        msg = truncateToN(msg)

        // Zero-extend key to provide enough entropy
        const bytes = curve.n.byteLength()
        const bkey = key.toArray('be', bytes)

        // Zero-extend nonce to have the same byte size as N
        const nonce = msg.toArray('be', bytes)

        // Instantiate Hmac_DRBG
        const drbg = new DRBG(bkey, nonce)

        // Number of bytes to generate
        const ns1 = curve.n.subn(1)

        for (let iter = 0; ; iter++) {
            // Compute the k-value
            let k = typeof customK === 'function'
                ? customK(iter)
                : BigNumber.isBN(customK)
                    ? customK
                    : new BigNumber(drbg.generate(bytes), 16)
            k = truncateToN(k, true)
            if (k.cmpn(1) <= 0 || k.cmp(ns1) >= 0) {
                if (BigNumber.isBN(customK)) {
                    throw new Error('Invalid fixed custom K value (must be more than 1 and less than N-1)')
                } else {
                    continue
                }
            }

            const kp = curve.g.mul(k)
            if (kp.isInfinity()) {
                if (BigNumber.isBN(customK)) {
                    throw new Error('Invalid fixed custom K value (must not create a point at infinity when multiplied by the generator point)')
                } else {
                    continue
                }
            }

            const kpX = kp.getX()
            const r = kpX.umod(curve.n)
            if (r.cmpn(0) === 0) {
                if (BigNumber.isBN(customK)) {
                    throw new Error('Invalid fixed custom K value (when multiplied by G, the resulting x coordinate mod N must not be zero)')
                } else {
                    continue
                }
            }

            let s = k.invm(curve.n).mul(r.mul(key).iadd(msg))
            s = s.umod(curve.n)
            if (s.cmpn(0) === 0) {
                if (BigNumber.isBN(customK)) {
                    throw new Error('Invalid fixed custom K value (when used with the key, it cannot create a zero value for S)')
                } else {
                    continue
                }
            }

            // Use complement of `s`, if it is > `n / 2`
            if (forceLowS && s.cmp(curve.n.ushrn(1)) > 0) {
                s = curve.n.sub(s)
            }
            return new Signature(r, s)
        }
    }
}

/**
 * Verifies a digital signature of a given message.
 *
 * Message and key used during the signature generation process, and the previously computed signature
 * are used to validate the authenticity of the digital signature.
 *
 * @function verify
 * @param msg - The BigNumber message for which the signature has to be verified.
 * @param sig - Signature object consisting of parameters 'r' and 's'.
 * @param key - Public key in Point.
 * @returns Returns true if the signature is valid and false otherwise.
 *
 * @example
 * const msg = new BigNumber('2664878', 16)
 * const key = new Point(new BigNumber(10), new BigNumber(20)
 * const signature = sign(msg, new BigNumber('123456'))
 * const isVerified = verify(msg, sig, key)
 */
export const verify = (msg: BigNumber, sig: Signature, key: Point): boolean => {
    // Use BigInt for verification opportunistically
    if (typeof BigInt === 'function') {
        // secp256k1 parameters
        const zero = BigInt(0)
        const one = BigInt(1)
        const p = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F'); // Field prime
        const n = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'); // Order of the curve
        const G = {
            x: BigInt('0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798'),
            y: BigInt('0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8')
        };

        // Modular arithmetic functions
        function mod(a: bigint, m: bigint): bigint {
            return ((a % m) + m) % m;
        }

        function modInv(a: bigint, m: bigint): bigint {
            let lm = one, hm = zero;
            let low = mod(a, m), high = m;
            while (low > one) {
                let r = high / low;
                let nm = hm - lm * r;
                let neww = high - low * r;
                hm = lm;
                lm = nm;
                high = low;
                low = neww;
            }
            return mod(lm, m);
        }

        function modAdd(a, b, m) {
            return mod(a + b, m);
        }

        function modSub(a: bigint, b, m) {
            return mod(a - b, m);
        }

        function modMul(a: bigint, b, m) {
            return mod(a * b, m);
        }

        // Elliptic curve point operations
        function pointAdd(P: { x: bigint, y: bigint }, Q: { x: bigint, y: bigint }) {
            if (P === null) return Q;
            if (Q === null) return P;

            if (P.x === Q.x && P.y === mod(-Q.y, p)) {
                return null; // Point at infinity
            }

            let m;
            if (P.x === Q.x && P.y === Q.y) {
                // Point doubling
                if (P.y === zero) {
                    return null; // Point at infinity
                }
                let numerator = modMul(BigInt(3) * modMul(P.x, P.x, p), one, p); // 3 * x^2
                let denominator = modMul(BigInt(2) * P.y, one, p); // 2 * y
                m = modMul(numerator, modInv(denominator, p), p);
            } else {
                let numerator = modSub(Q.y, P.y, p);
                let denominator = modSub(Q.x, P.x, p);
                m = modMul(numerator, modInv(denominator, p), p);
            }

            let xR = modSub(modMul(m, m, p), modAdd(P.x, Q.x, p), p);
            let yR = modSub(modMul(m, modSub(P.x, xR, p), p), P.y, p);

            return { x: xR, y: yR };
        }

        function scalarMul(k, P) {
            let N = P;
            let Q = null; // Point at infinity
            while (k > zero) {
                if (k & one) {
                    Q = pointAdd(Q, N);
                }
                N = pointAdd(N, N);
                k >>= one;
            }
            return Q;
        }

        // ECDSA signature verification function
        function verifyECDSA(hash, publicKey, signature) {
            const { r, s } = signature;
            const { x: xQ, y: yQ } = publicKey;
            const z = hash;

            // 1. Verify that r and s are in [1, n - 1]
            if (r <= zero || r >= n || s <= zero || s >= n) {
                return false;
            }

            // 2. Compute w = s^-1 mod n
            const w = modInv(s, n);

            // 3. Compute u1 = z * w mod n
            const u1 = modMul(z, w, n);

            // 4. Compute u2 = r * w mod n
            const u2 = modMul(r, w, n);

            // 5. Compute (x1, y1) = u1 * G + u2 * Q
            const Gmul = scalarMul(u1, G);
            const Q = { x: xQ, y: yQ };
            const Qmul = scalarMul(u2, Q);
            const R = pointAdd(Gmul, Qmul);

            if (R === null || R.x === undefined || R.y === undefined) {
                return false;
            }

            // 6. The signature is valid if r ≡ x1 mod n
            const x1 = R.x;
            const v = mod(x1, n);
            return v === r;
        }
        return verifyECDSA(
            BigInt(`0x${msg.toHex()}`),
            {
                x: BigInt(`0x${key.x.toHex()}`),
                y: BigInt(`0x${key.y.toHex()}`)
            },
            {
                r: BigInt(`0x${sig.r.toHex()}`),
                s: BigInt(`0x${sig.s.toHex()}`)
            }
        )
    } else {
        const curve = new Curve()
        msg = truncateToN(msg)
        // Perform primitive values validation
        const r = sig.r
        const s = sig.s
        if (r.cmpn(1) < 0 || r.cmp(curve.n) >= 0) { return false }
        if (s.cmpn(1) < 0 || s.cmp(curve.n) >= 0) { return false }

        // Validate signature
        const sinv = s.invm(curve.n)
        const u1 = sinv.mul(msg).umod(curve.n)
        const u2 = sinv.mul(r).umod(curve.n)

        // NOTE: Greg Maxwell's trick, inspired by:
        // https://git.io/vad3K
        const p = curve.g.jmulAdd(u1, key, u2)
        if (p.isInfinity()) { return false }

        // Compare `p.x` of Jacobian point with `r`,
        // this will do `p.x == r * p.z^2` instead of multiplying `p.x` by the
        // inverse of `p.z^2`
        return p.eqXToP(r)
    }
}