# API

Links: [API](#api), [Classes](#classes), [Functions](#functions), [Variables](#variables)

## Classes

### Class: HD

```ts
export default class HD {
    versionBytesNum: number;
    depth: number;
    parentFingerPrint: number[];
    childIndex: number;
    chainCode: number[];
    privKey: PrivateKey;
    pubKey: PublicKey;
    constants = {
        pubKey: 76067358,
        privKey: 76066276
    };
    constructor(versionBytesNum?: number, depth?: number, parentFingerPrint?: number[], childIndex?: number, chainCode?: number[], privKey?: PrivateKey, pubKey?: PublicKey) 
    public fromRandom(): this 
    public static fromRandom(): HD 
    public fromString(str: string): this 
    public toString(): string 
    public fromSeed(bytes: number[]): this 
    public static fromSeed(bytes: number[]): HD 
    public fromBinary(buf: number[]): this 
    public derive(path: string): HD 
    public deriveChild(i: number): HD 
    public toPublic(): HD 
    public toBinary(): number[] 
    public isPrivate(): boolean 
}
```

<details>

<summary>Class HD Details</summary>

#### Constructor

Constructor for the BIP32 HD wallet.
Initializes an HD wallet with optional parameters for version bytes, depth, parent fingerprint, child index, chain code, private key, and public key.

```ts
constructor(versionBytesNum?: number, depth?: number, parentFingerPrint?: number[], childIndex?: number, chainCode?: number[], privKey?: PrivateKey, pubKey?: PublicKey) 
```

Argument Details

+ **versionBytesNum**
  + Version bytes number for the wallet.
+ **depth**
  + Depth of the key in the hierarchy.
+ **parentFingerPrint**
  + Fingerprint of the parent key.
+ **childIndex**
  + Index of the child key.
+ **chainCode**
  + Chain code for key derivation.
+ **privKey**
  + Private key of the wallet.
+ **pubKey**
  + Public key of the wallet.

#### Method derive

Derives a child HD wallet based on a given path.
The path specifies the hierarchy of the child key to be derived.

```ts
public derive(path: string): HD 
```

Returns

A new HD instance representing the derived child wallet.

Argument Details

+ **path**
  + A string representing the derivation path (e.g., 'm/0'/1).

#### Method deriveChild

Derives a child HD wallet from the current wallet based on an index.
This method generates either a private or public child key depending on the current wallet's state.

```ts
public deriveChild(i: number): HD 
```

Returns

A new HD instance representing the derived child wallet.

Argument Details

+ **i**
  + The index of the child key to derive.

#### Method fromBinary

Initializes the HD wallet from a binary buffer.
Parses a binary buffer to set up the wallet's properties.

```ts
public fromBinary(buf: number[]): this 
```

Returns

The current instance with properties set from the buffer.

Argument Details

+ **buf**
  + A buffer containing the wallet data.

#### Method fromRandom

Generates a new HD wallet with random keys.
This method creates a root HD wallet with randomly generated private and public keys.

```ts
public fromRandom(): this 
```

Returns

The current HD instance with generated keys.

#### Method fromRandom

Generates a new HD wallet with random keys.
This method creates a root HD wallet with randomly generated private and public keys.

```ts
public static fromRandom(): HD 
```

Returns

A new HD instance with generated keys.

#### Method fromSeed

Initializes the HD wallet from a seed.
This method generates keys and other properties from a given seed, conforming to the BIP32 specification.

```ts
public fromSeed(bytes: number[]): this 
```

Returns

The current instance with properties set from the seed.

Argument Details

+ **bytes**
  + An array of bytes representing the seed.

#### Method fromSeed

Initializes the HD wallet from a seed.
This method generates keys and other properties from a given seed, conforming to the BIP32 specification.

```ts
public static fromSeed(bytes: number[]): HD 
```

Returns

The current instance with properties set from the seed.

Argument Details

+ **bytes**
  + An array of bytes representing the seed.

#### Method fromString

Initializes the HD wallet from a given base58 encoded string.
This method decodes a provided string to set up the HD wallet's properties.

```ts
public fromString(str: string): this 
```

Returns

The current instance with properties set from the string.

Argument Details

+ **str**
  + A base58 encoded string representing the wallet.

#### Method isPrivate

Checks if the HD wallet contains a private key.
This method determines whether the wallet is a private key wallet or a public key only wallet.

```ts
public isPrivate(): boolean 
```

Returns

A boolean value indicating whether the wallet has a private key (true) or not (false).

#### Method toBinary

Converts the HD wallet into a binary representation.
This method serializes the wallet's properties into a binary format.

```ts
public toBinary(): number[] 
```

Returns

An array of numbers representing the binary data of the wallet.

#### Method toPublic

Converts the current HD wallet to a public-only wallet.
This method strips away the private key information, leaving only the public part.

```ts
public toPublic(): HD 
```

Returns

A new HD instance representing the public-only wallet.

#### Method toString

function toString() { [native code] }

Converts the HD wallet to a base58 encoded string.
This method provides a string representation of the HD wallet's current state.

```ts
public toString(): string 
```

Returns

A base58 encoded string of the HD wallet.

</details>

Links: [API](#api), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
## Functions

## Variables

| |
| --- |
| [magicHash](#variable-magichash) |
| [sign](#variable-sign) |
| [verify](#variable-verify) |

Links: [API](#api), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---

### Variable: magicHash

```ts
magicHash = (messageBuf: number[]): number[] => {
    const bw = new Writer();
    bw.writeVarIntNum(prefix.length);
    bw.write(toArray(prefix, "utf8"));
    bw.writeVarIntNum(messageBuf.length);
    bw.write(messageBuf);
    const buf = bw.toArray();
    const hashBuf = Hash.hash256(buf) as number[];
    return hashBuf;
}
```

Links: [API](#api), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
### Variable: sign

```ts
sign = (message: number[], privateKey: PrivateKey): Signature => {
    const hashBuf = magicHash(message);
    return ECDSA.sign(new BigNumber(hashBuf), privateKey, true);
}
```

Links: [API](#api), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
### Variable: verify

```ts
verify = (message: number[], sig: Signature, pubKey: PublicKey): boolean => {
    const hashBuf = magicHash(message);
    return ECDSA.verify(new BigNumber(hashBuf), sig, pubKey);
}
```

Links: [API](#api), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
