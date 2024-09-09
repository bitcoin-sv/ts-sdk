# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

## Interfaces

## Classes

| |
| --- |
| [ECIES](#class-ecies) |
| [HD](#class-hd) |
| [Mnemonic](#class-mnemonic) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

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
    public static fromString(str: string): HD 
    public fromString(str: string): this 
    public static fromSeed(bytes: number[]): HD 
    public fromSeed(bytes: number[]): this 
    public static fromBinary(buf: number[]): HD 
    public fromBinary(buf: number[]): this 
    public toString(): string 
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
public static fromBinary(buf: number[]): HD 
```

Returns

The new instance with properties set from the buffer.

Argument Details

+ **buf**
  + A buffer containing the wallet data.

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
public static fromSeed(bytes: number[]): HD 
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
public fromSeed(bytes: number[]): this 
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
public static fromString(str: string): HD 
```

Returns

The new instance with properties set from the string.

Argument Details

+ **str**
  + A base58 encoded string representing the wallet.

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

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: Mnemonic

```ts
export default class Mnemonic {
    public mnemonic: string;
    public seed: number[];
    public Wordlist: {
        value: string[];
        space: string;
    };
    constructor(mnemonic?: string, seed?: number[], wordlist = wordList) 
    public toBinary(): number[] 
    public fromBinary(bin: number[]): this 
    public fromRandom(bits?: number): this 
    public static fromRandom(bits?: number): Mnemonic 
    public fromEntropy(buf: number[]): this 
    public static fromEntropy(buf: number[]): Mnemonic 
    public fromString(mnemonic: string): this 
    public static fromString(str: string): Mnemonic 
    public toString(): string 
    public toSeed(passphrase?: string): number[] 
    public entropy2Mnemonic(buf: number[]): this 
    public check(): boolean 
    public mnemonic2Seed(passphrase = ""): this 
    public isValid(passphrase = ""): boolean 
    public static isValid(mnemonic: string, passphrase = ""): boolean 
}
```

<details>

<summary>Class Mnemonic Details</summary>

#### Constructor

Constructs a Mnemonic object.

```ts
constructor(mnemonic?: string, seed?: number[], wordlist = wordList) 
```

Argument Details

+ **mnemonic**
  + An optional mnemonic phrase.
+ **seed**
  + An optional seed derived from the mnemonic.
+ **wordlist**
  + An object containing a list of words and space character used in the mnemonic.

#### Method check

Validates the mnemonic phrase.
Checks for correct length, absence of invalid words, and proper checksum.

```ts
public check(): boolean 
```

Returns

True if the mnemonic is valid, false otherwise.

Throws

If the mnemonic is not an even multiple of 11 bits.

#### Method entropy2Mnemonic

Converts entropy to a mnemonic phrase.
This method takes a buffer of entropy and converts it into a corresponding
mnemonic phrase based on the Mnemonic wordlist. The entropy should be at least 128 bits.
The method applies a checksum and maps the entropy to words in the wordlist.

```ts
public entropy2Mnemonic(buf: number[]): this 
```

Returns

The Mnemonic instance with the mnemonic set from the entropy.

Argument Details

+ **buf**
  + The entropy buffer to convert. Must be at least 128 bits.

Throws

If the entropy is less than 128 bits or if it's not an even multiple of 11 bits.

#### Method fromBinary

Loads a mnemonic and seed from a binary representation.

```ts
public fromBinary(bin: number[]): this 
```

Returns

The Mnemonic instance with loaded mnemonic and seed.

Argument Details

+ **bin**
  + The binary representation of a mnemonic and seed.

#### Method fromEntropy

Converts given entropy into a mnemonic phrase.
This method is used to generate a mnemonic from a specific entropy source.

```ts
public fromEntropy(buf: number[]): this 
```

Returns

The Mnemonic instance with the mnemonic set from the given entropy.

Argument Details

+ **buf**
  + The entropy buffer, must be at least 128 bits.

Throws

If the entropy is less than 128 bits.

#### Method fromEntropy

Static method to create a Mnemonic instance from a given entropy.

```ts
public static fromEntropy(buf: number[]): Mnemonic 
```

Returns

A new Mnemonic instance.

Argument Details

+ **buf**
  + The entropy buffer.

#### Method fromRandom

Generates a random mnemonic from a given bit length.

```ts
public fromRandom(bits?: number): this 
```

Returns

The Mnemonic instance with the new random mnemonic.

Argument Details

+ **bits**
  + The bit length for the random mnemonic (must be a multiple of 32 and at least 128).

Throws

If the bit length is not a multiple of 32 or is less than 128.

#### Method fromRandom

Static method to generate a Mnemonic instance with a random mnemonic.

```ts
public static fromRandom(bits?: number): Mnemonic 
```

Returns

A new Mnemonic instance.

Argument Details

+ **bits**
  + The bit length for the random mnemonic.

#### Method fromString

Sets the mnemonic for the instance from a string.

```ts
public fromString(mnemonic: string): this 
```

Returns

The Mnemonic instance with the set mnemonic.

Argument Details

+ **mnemonic**
  + The mnemonic phrase as a string.

#### Method fromString

Static method to create a Mnemonic instance from a mnemonic string.

```ts
public static fromString(str: string): Mnemonic 
```

Returns

A new Mnemonic instance.

Argument Details

+ **str**
  + The mnemonic phrase.

#### Method isValid

Determines the validity of a given passphrase with the mnemonic.
This method is useful for checking if a passphrase matches with the mnemonic.

```ts
public isValid(passphrase = ""): boolean 
```

Returns

True if the mnemonic and passphrase combination is valid, false otherwise.

Argument Details

+ **passphrase**
  + The passphrase to validate.

#### Method isValid

Static method to check the validity of a given mnemonic and passphrase combination.

```ts
public static isValid(mnemonic: string, passphrase = ""): boolean 
```

Returns

True if the combination is valid, false otherwise.

Argument Details

+ **mnemonic**
  + The mnemonic phrase.
+ **passphrase**
  + The passphrase to validate.

#### Method mnemonic2Seed

Converts a mnemonic to a seed.
This method takes the instance's mnemonic phrase, combines it with a passphrase (if provided),
and uses PBKDF2 to generate a seed. It also validates the mnemonic before conversion.
This seed can then be used for generating deterministic keys.

```ts
public mnemonic2Seed(passphrase = ""): this 
```

Returns

The Mnemonic instance with the seed generated from the mnemonic.

Argument Details

+ **passphrase**
  + An optional passphrase for added security.

Throws

If the mnemonic does not pass validation or if the passphrase is not a string.

#### Method toBinary

Converts the mnemonic and seed into a binary representation.

```ts
public toBinary(): number[] 
```

Returns

The binary representation of the mnemonic and seed.

#### Method toSeed

Converts the mnemonic to a seed.
The mnemonic must pass the validity check before conversion.

```ts
public toSeed(passphrase?: string): number[] 
```

Returns

The generated seed.

Argument Details

+ **passphrase**
  + An optional passphrase for additional security.

Throws

If the mnemonic is invalid.

#### Method toString

function toString() { [native code] }

Converts the instance's mnemonic to a string representation.

```ts
public toString(): string 
```

Returns

The mnemonic phrase as a string.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: ECIES

```ts
export default class ECIES {
    public static ivkEkM(privKey: PrivateKey, pubKey: PublicKey): {
        iv: number[];
        kE: number[];
        kM: number[];
    } 
    public static electrumEncrypt(messageBuf: number[], toPublicKey: PublicKey, fromPrivateKey?: PrivateKey, noKey = false): number[] 
    public static electrumDecrypt(encBuf: number[], toPrivateKey: PrivateKey, fromPublicKey?: PublicKey): number[] 
    public static bitcoreEncrypt(messageBuf: number[], toPublicKey: PublicKey, fromPrivateKey?: PrivateKey, ivBuf?: number[]): number[] 
    public static bitcoreDecrypt(encBuf: number[], toPrivateKey: PrivateKey): number[] 
}
```

<details>

<summary>Class ECIES Details</summary>

#### Method bitcoreDecrypt

Decrypts a message encrypted using the Bitcore variant of ECIES.

```ts
public static bitcoreDecrypt(encBuf: number[], toPrivateKey: PrivateKey): number[] 
```

Returns

The decrypted message as a number array.

Argument Details

+ **encBuf**
  + The encrypted message buffer.
+ **toPrivateKey**
  + The private key of the recipient.

#### Method bitcoreEncrypt

Encrypts a given message using the Bitcore variant of ECIES.

```ts
public static bitcoreEncrypt(messageBuf: number[], toPublicKey: PublicKey, fromPrivateKey?: PrivateKey, ivBuf?: number[]): number[] 
```

Returns

The encrypted message as a number array.

Argument Details

+ **messageBuf**
  + The message to be encrypted, in number array format.
+ **toPublicKey**
  + The public key of the recipient.
+ **fromPrivateKey**
  + The private key of the sender. If not provided, a random private key is used.
+ **ivBuf**
  + The initialization vector for encryption. If not provided, a random IV is used.

#### Method electrumDecrypt

Decrypts a message encrypted using the Electrum ECIES method.

```ts
public static electrumDecrypt(encBuf: number[], toPrivateKey: PrivateKey, fromPublicKey?: PublicKey): number[] 
```

Returns

The decrypted message as a number array.

Argument Details

+ **encBuf**
  + The encrypted message buffer.
+ **toPrivateKey**
  + The private key of the recipient.
+ **fromPublicKey**
  + The public key of the sender. If not provided, it is extracted from the message.

#### Method electrumEncrypt

Encrypts a given message using the Electrum ECIES method.

```ts
public static electrumEncrypt(messageBuf: number[], toPublicKey: PublicKey, fromPrivateKey?: PrivateKey, noKey = false): number[] 
```

Returns

The encrypted message as a number array.

Argument Details

+ **messageBuf**
  + The message to be encrypted, in number array format.
+ **toPublicKey**
  + The public key of the recipient.
+ **fromPrivateKey**
  + The private key of the sender. If not provided, a random private key is used.
+ **noKey**
  + If true, does not include the sender's public key in the encrypted message.

#### Method ivkEkM

Generates the initialization vector (iv), encryption key (kE), and MAC key (kM)
using the sender's private key and receiver's public key.

```ts
public static ivkEkM(privKey: PrivateKey, pubKey: PublicKey): {
    iv: number[];
    kE: number[];
    kM: number[];
} 
```

Returns

An object containing the iv, kE, and kM as number arrays.

Argument Details

+ **privKey**
  + The sender's private key.
+ **pubKey**
  + The receiver's public key.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
## Functions

### Function: fromUtxo

Example

```ts
const i = fromUtxo({
  txid: '434555433eaca96dff6e71a4d02febd0dd3832e5ca4e5734623ca914522e17d5',
  vout: 0,
  script: '51',
  satoshis: 1234
}, new P2PKH().unlock(p))

tx.addInput(i)
```

```ts
export default function fromUtxo(utxo: jsonUtxo, unlockingScriptTemplate: {
    sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
    estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>;
}): TransactionInput 
```

<details>

<summary>Function fromUtxo Details</summary>

Argument Details

+ **utxo**
  + : jsonUtxo
+ **unlockingScriptTemplate**
  + : { sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>, estimateLength: (tx: Transaction, inputIndex: number) => Promise<number> }

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
## Types

## Variables

| |
| --- |
| [magicHash](#variable-magichash) |
| [sign](#variable-sign) |
| [verify](#variable-verify) |
| [wordList](#variable-wordlist) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

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
    const hashBuf = Hash.hash256(buf);
    return hashBuf;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: sign

```ts
sign = (message: number[], privateKey: PrivateKey, mode: "raw" | "base64" = "base64"): Signature | string => {
    const hashBuf = magicHash(message);
    const sig = ECDSA.sign(new BigNumber(hashBuf), privateKey, true);
    if (mode === "raw") {
        return sig;
    }
    const h = new BigNumber(hashBuf);
    const r = sig.CalculateRecoveryFactor(privateKey.toPublicKey(), h);
    return sig.toCompact(r, true, "base64") as string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: verify

```ts
verify = (message: number[], sig: Signature, pubKey: PublicKey): boolean => {
    const hashBuf = magicHash(message);
    return ECDSA.verify(new BigNumber(hashBuf), sig, pubKey);
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: wordList

```ts
wordList = {
    value: [
        "abandon",
        "ability",
        "able",
        "about",
        "above",
        "absent",
        "absorb",
        "abstract",
        "absurd",
        "abuse",
        "access",
        "accident",
        "account",
        "accuse",
        "achieve",
        "acid",
        "acoustic",
        "acquire",
        "across",
        "act",
        "action",
        "actor",
        "actress",
        "actual",
        "adapt",
        "add",
        "addict",
        "address",
        "adjust",
        "admit",
        "adult",
        "advance",
        "advice",
        "aerobic",
        "affair",
        "afford",
        "afraid",
        "again",
        "age",
        "agent",
        "agree",
        "ahead",
        "aim",
        "air",
        "airport",
        "aisle",
        "alarm",
        "album",
        "alcohol",
        "alert",
        "alien",
        "all",
        "alley",
        "allow",
        "almost",
        "alone",
        "alpha",
        "already",
        "also",
        "alter",
        "always",
        "amateur",
        "amazing",
        "among",
        "amount",
        "amused",
        "analyst",
        "anchor",
        "ancient",
        "anger",
        "angle",
        "angry",
        "animal",
        "ankle",
        "announce",
        "annual",
        "another",
        "answer",
        "antenna",
        "antique",
        "anxiety",
        "any",
        "apart",
        "apology",
        "appear",
        "apple",
        "approve",
        "april",
        "arch",
        "arctic",
        "area",
        "arena",
        "argue",
        "arm",
        "armed",
        "armor",
        "army",
        "around",
        "arrange",
        "arrest",
        "arrive",
        "arrow",
        "art",
        "artefact",
        "artist",
        "artwork",
        "ask",
        "aspect",
        "assault",
        "asset",
        "assist",
        "assume",
        "asthma",
        "athlete",
        "atom",
        "attack",
        "attend",
        "attitude",
        "attract",
        "auction",
        "audit",
        "august",
        "aunt",
        "author",
        "auto",
        "autumn",
        "average",
        "avocado",
        "avoid",
        "awake",
        "aware",
        "away",
        "awesome",
        "awful",
        "awkward",
        "axis",
        "baby",
        "bachelor",
        "bacon",
        "badge",
        "bag",
        "balance",
        "balcony",
        "ball",
        "bamboo",
        "banana",
        "banner",
        "bar",
        "barely",
        "bargain",
        "barrel",
        "base",
        "basic",
        "basket",
        "battle",
        "beach",
        "bean",
        "beauty",
        "because",
        "become",
        "beef",
        "before",
        "begin",
        "behave",
        "behind",
        "believe",
        "below",
        "belt",
        "bench",
        "benefit",
        "best",
        "betray",
        "better",
        "between",
        "beyond",
        "bicycle",
        "bid",
        "bike",
        "bind",
        "biology",
        "bird",
        "birth",
        "bitter",
        "black",
        "blade",
        "blame",
        "blanket",
        "blast",
        "bleak",
        "bless",
        "blind",
        "blood",
        "blossom",
        "blouse",
        "blue",
        "blur",
        "blush",
        "board",
        "boat",
        "body",
        "boil",
        "bomb",
        "bone",
        "bonus",
        "book",
        "boost",
        "border",
        "boring",
        "borrow",
        "boss",
        "bottom",
        "bounce",
        "box",
        "boy",
        "bracket",
        "brain",
        "brand",
        "brass",
        "brave",
        "bread",
        "breeze",
        "brick",
        "bridge",
        "brief",
        "bright",
        "bring",
        "brisk",
        "broccoli",
        "broken",
        "bronze",
        "broom",
        "brother",
        "brown",
        "brush",
        "bubble",
        "buddy",
        "budget",
        "buffalo",
        "build",
        "bulb",
        "bulk",
        "bullet",
        "bundle",
        "bunker",
        "burden",
        "burger",
        "burst",
        "bus",
        "business",
        "busy",
        "butter",
        "buyer",
        "buzz",
        "cabbage",
        "cabin",
        "cable",
        "cactus",
        "cage",
        "cake",
        "call",
        "calm",
        "camera",
        "camp",
        "can",
        "canal",
        "cancel",
        "candy",
        "cannon",
        "canoe",
        "canvas",
        "canyon",
        "capable",
        "capital",
        "captain",
        "car",
        "carbon",
        "card",
        "cargo",
        "carpet",
        "carry",
        "cart",
        "case",
        "cash",
        "casino",
        "castle",
        "casual",
        "cat",
        "catalog",
        "catch",
        "category",
        "cattle",
        "caught",
        "cause",
        "caution",
        "cave",
        "ceiling",
        "celery",
        "cement",
        "census",
        "century",
        "cereal",
        "certain",
        "chair",
        "chalk",
        "champion",
        "change",
        "chaos",
        "chapter",
        "charge",
        "chase",
        "chat",
        "cheap",
        "check",
        "cheese",
        "chef",
        "cherry",
        "chest",
        "chicken",
        "chief",
        "child",
        "chimney",
        "choice",
        "choose",
        "chronic",
        "chuckle",
        "chunk",
        "churn",
        "cigar",
        "cinnamon",
        "circle",
        "citizen",
        "city",
        "civil",
        "claim",
        "clap",
        "clarify",
        "claw",
        "clay",
        "clean",
        "clerk",
        "clever",
        "click",
        "client",
        "cliff",
        "climb",
        "clinic",
        "clip",
        "clock",
        "clog",
        "close",
        "cloth",
        "cloud",
        "clown",
        "club",
        "clump",
        "cluster",
        "clutch",
        "coach",
        "coast",
        "coconut",
        "code",
        "coffee",
        "coil",
        "coin",
        "collect",
        "color",
        "column",
        "combine",
        "come",
        "comfort",
        "comic",
        "common",
        "company",
        "concert",
        "conduct",
        "confirm",
        "congress",
        "connect",
        "consider",
        "control",
        "convince",
        "cook",
        "cool",
        "copper",
        "copy",
        "coral",
        "core",
        "corn",
        "correct",
        "cost",
        "cotton",
        "couch",
        "country",
        "couple",
        "course",
        "cousin",
        "cover",
        "coyote",
        "crack",
        "cradle",
        "craft",
        "cram",
        "crane",
        "crash",
        "crater",
        "crawl",
        "crazy",
        "cream",
        "credit",
        "creek",
        "crew",
        "cricket",
        "crime",
        "crisp",
        "critic",
        "crop",
        "cross",
        "crouch",
        "crowd",
        "crucial",
        "cruel",
        "cruise",
        "crumble",
        "crunch",
        "crush",
        "cry",
        "crystal",
        "cube",
        "culture",
        "cup",
        "cupboard",
        "curious",
        "current",
        "curtain",
        "curve",
        "cushion",
        "custom",
        "cute",
        "cycle",
        "dad",
        "damage",
        "damp",
        "dance",
        "danger",
        "daring",
        "dash",
        "daughter",
        "dawn",
        "day",
        "deal",
        "debate",
        "debris",
        "decade",
        "december",
        "decide",
        "decline",
        "decorate",
        "decrease",
        "deer",
        "defense",
        "define",
        "defy",
        "degree",
        "delay",
        "deliver",
        "demand",
        "demise",
        "denial",
        "dentist",
        "deny",
        "depart",
        "depend",
        "deposit",
        "depth",
        "deputy",
        "derive",
        "describe",
        "desert",
        "design",
        "desk",
        "despair",
        "destroy",
        "detail",
        "detect",
        "develop",
        "device",
        "devote",
        "diagram",
        "dial",
        "diamond",
        "diary",
        "dice",
        "diesel",
        "diet",
        "differ",
        "digital",
        "dignity",
        "dilemma",
        "dinner",
        "dinosaur",
        "direct",
        "dirt",
        "disagree",
        "discover",
        "disease",
        "dish",
        "dismiss",
        "disorder",
        "display",
        "distance",
        "divert",
        "divide",
        "divorce",
        "dizzy",
        "doctor",
        "document",
        "dog",
        "doll",
        "dolphin",
        "domain",
        "donate",
        "donkey",
        "donor",
        "door",
        "dose",
        "double",
        "dove",
        "draft",
        "dragon",
        "drama",
        "drastic",
        "draw",
        "dream",
        "dress",
        "drift",
        "drill",
        "drink",
        "drip",
        "drive",
        "drop",
        "drum",
        "dry",
        "duck",
        "dumb",
        "dune",
        "during",
        "dust",
        "dutch",
        "duty",
        "dwarf",
        "dynamic",
        "eager",
        "eagle",
        "early",
        "earn",
        "earth",
        "easily",
        "east",
        "easy",
        "echo",
        "ecology",
        "economy",
        "edge",
        "edit",
        "educate",
        "effort",
        "egg",
        "eight",
        "either",
        "elbow",
        "elder",
        "electric",
        "elegant",
        "element",
        "elephant",
        "elevator",
        "elite",
        "else",
        "embark",
        "embody",
        "embrace",
        "emerge",
        "emotion",
        "employ",
        "empower",
        "empty",
        "enable",
        "enact",
        "end",
        "endless",
        "endorse",
        "enemy",
        "energy",
        "enforce",
        "engage",
        "engine",
        "enhance",
        "enjoy",
        "enlist",
        "enough",
        "enrich",
        "enroll",
        "ensure",
        "enter",
        "entire",
        "entry",
        "envelope",
        "episode",
        "equal",
        "equip",
        "era",
        "erase",
        "erode",
        "erosion",
        "error",
        "erupt",
        "escape",
        "essay",
        "essence",
        "estate",
        "eternal",
        "ethics",
        "evidence",
        "evil",
        "evoke",
        "evolve",
        "exact",
        "example",
        "excess",
        "exchange",
        "excite",
        "exclude",
        "excuse",
        "execute",
        "exercise",
        "exhaust",
        "exhibit",
        "exile",
        "exist",
        "exit",
        "exotic",
        "expand",
        "expect",
        "expire",
        "explain",
        "expose",
        "express",
        "extend",
        "extra",
        "eye",
        "eyebrow",
        "fabric",
        "face",
        "faculty",
        "fade",
        "faint",
        "faith",
        "fall",
        "false",
        "fame",
        "family",
        "famous",
        "fan",
        "fancy",
        "fantasy",
        "farm",
        "fashion",
        "fat",
        "fatal",
        "father",
        "fatigue",
        "fault",
        "favorite",
        "feature",
        "february",
        "federal",
        "fee",
        "feed",
        "feel",
        "female",
        "fence",
        "festival",
        "fetch",
        "fever",
        "few",
        "fiber",
        "fiction",
        "field",
        "figure",
        "file",
        "film",
        "filter",
        "final",
        "find",
        "fine",
        "finger",
        "finish",
        "fire",
        "firm",
        "first",
        "fiscal",
        "fish",
        "fit",
        "fitness",
        "fix",
        "flag",
        "flame",
        "flash",
        "flat",
        "flavor",
        "flee",
        "flight",
        "flip",
        "float",
        "flock",
        "floor",
        "flower",
        "fluid",
        "flush",
        "fly",
        "foam",
        "focus",
        "fog",
        "foil",
        "fold",
        "follow",
        "food",
        "foot",
        "force",
        "forest",
        "forget",
        "fork",
        "fortune",
        "forum",
        "forward",
        "fossil",
        "foster",
        "found",
        "fox",
        "fragile",
        "frame",
        "frequent",
        "fresh",
        "friend",
        "fringe",
        "frog",
        "front",
        "frost",
        "frown",
        "frozen",
        "fruit",
        "fuel",
        "fun",
        "funny",
        "furnace",
        "fury",
        "future",
        "gadget",
        "gain",
        "galaxy",
        "gallery",
        "game",
        "gap",
        "garage",
        "garbage",
        "garden",
        "garlic",
        "garment",
        "gas",
        "gasp",
        "gate",
        "gather",
        "gauge",
        "gaze",
        "general",
        "genius",
        "genre",
        "gentle",
        "genuine",
        "gesture",
        "ghost",
        "giant",
        "gift",
        "giggle",
        "ginger",
        "giraffe",
        "girl",
        "give",
        "glad",
        "glance",
        "glare",
        "glass",
        "glide",
        "glimpse",
        "globe",
        "gloom",
        "glory",
        "glove",
        "glow",
        "glue",
        "goat",
        "goddess",
        "gold",
        "good",
        "goose",
        "gorilla",
        "gospel",
        "gossip",
        "govern",
        "gown",
        "grab",
        "grace",
        "grain",
        "grant",
        "grape",
        "grass",
        "gravity",
        "great",
        "green",
        "grid",
        "grief",
        "grit",
        "grocery",
        "group",
        "grow",
        "grunt",
        "guard",
        "guess",
        "guide",
        "guilt",
        "guitar",
        "gun",
        "gym",
        "habit",
        "hair",
        "half",
        "hammer",
        "hamster",
        "hand",
        "happy",
        "harbor",
        "hard",
        "harsh",
        "harvest",
        "hat",
        "have",
        "hawk",
        "hazard",
        "head",
        "health",
        "heart",
        "heavy",
        "hedgehog",
        "height",
        "hello",
        "helmet",
        "help",
        "hen",
        "hero",
        "hidden",
        "high",
        "hill",
        "hint",
        "hip",
        "hire",
        "history",
        "hobby",
        "hockey",
        "hold",
        "hole",
        "holiday",
        "hollow",
        "home",
        "honey",
        "hood",
        "hope",
        "horn",
        "horror",
        "horse",
        "hospital",
        "host",
        "hotel",
        "hour",
        "hover",
        "hub",
        "huge",
        "human",
        "humble",
        "humor",
        "hundred",
        "hungry",
        "hunt",
        "hurdle",
        "hurry",
        "hurt",
        "husband",
        "hybrid",
        "ice",
        "icon",
        "idea",
        "identify",
        "idle",
        "ignore",
        "ill",
        "illegal",
        "illness",
        "image",
        "imitate",
        "immense",
        "immune",
        "impact",
        "impose",
        "improve",
        "impulse",
        "inch",
        "include",
        "income",
        "increase",
        "index",
        "indicate",
        "indoor",
        "industry",
        "infant",
        "inflict",
        "inform",
        "inhale",
        "inherit",
        "initial",
        "inject",
        "injury",
        "inmate",
        "inner",
        "innocent",
        "input",
        "inquiry",
        "insane",
        "insect",
        "inside",
        "inspire",
        "install",
        "intact",
        "interest",
        "into",
        "invest",
        "invite",
        "involve",
        "iron",
        "island",
        "isolate",
        "issue",
        "item",
        "ivory",
        "jacket",
        "jaguar",
        "jar",
        "jazz",
        "jealous",
        "jeans",
        "jelly",
        "jewel",
        "job",
        "join",
        "joke",
        "journey",
        "joy",
        "judge",
        "juice",
        "jump",
        "jungle",
        "junior",
        "junk",
        "just",
        "kangaroo",
        "keen",
        "keep",
        "ketchup",
        "key",
        "kick",
        "kid",
        "kidney",
        "kind",
        "kingdom",
        "kiss",
        "kit",
        "kitchen",
        "kite",
        "kitten",
        "kiwi",
        "knee",
        "knife",
        "knock",
        "know",
        "lab",
        "label",
        "labor",
        "ladder",
        "lady",
        "lake",
        "lamp",
        "language",
        "laptop",
        "large",
        "later",
        "latin",
        "laugh",
        "laundry",
        "lava",
        "law",
        "lawn",
        "lawsuit",
        "layer",
        "lazy",
        "leader",
        "leaf",
        "learn",
        "leave",
        "lecture",
        "left",
        "leg",
        "legal",
        "legend",
        "leisure",
        "lemon",
        "lend",
        "length",
        "lens",
        "leopard",
        "lesson",
        "letter",
        "level",
        "liar",
        "liberty",
        "library",
        "license",
        "life",
        "lift",
        "light",
        "like",
        "limb",
        "limit",
        "link",
        "lion",
        "liquid",
        "list",
        "little",
        "live",
        "lizard",
        "load",
        "loan",
        "lobster",
        "local",
        "lock",
        "logic",
        "lonely",
        "long",
        "loop",
        "lottery",
        "loud",
        "lounge",
        "love",
        "loyal",
        "lucky",
        "luggage",
        "lumber",
        "lunar",
        "lunch",
        "luxury",
        "lyrics",
        "machine",
        "mad",
        "magic",
        "magnet",
        "maid",
        "mail",
        "main",
        "major",
        "make",
        "mammal",
        "man",
        "manage",
        "mandate",
        "mango",
        "mansion",
        "manual",
        "maple",
        "marble",
        "march",
        "margin",
        "marine",
        "market",
        "marriage",
        "mask",
        "mass",
        "master",
        "match",
        "material",
        "math",
        "matrix",
        "matter",
        "maximum",
        "maze",
        "meadow",
        "mean",
        "measure",
        "meat",
        "mechanic",
        "medal",
        "media",
        "melody",
        "melt",
        "member",
        "memory",
        "mention",
        "menu",
        "mercy",
        "merge",
        "merit",
        "merry",
        "mesh",
        "message",
        "metal",
        "method",
        "middle",
        "midnight",
        "milk",
        "million",
        "mimic",
        "mind",
        "minimum",
        "minor",
        "minute",
        "miracle",
        "mirror",
        "misery",
        "miss",
        "mistake",
        "mix",
        "mixed",
        "mixture",
        "mobile",
        "model",
        "modify",
        "mom",
        "moment",
        "monitor",
        "monkey",
        "monster",
        "month",
        "moon",
        "moral",
        "more",
        "morning",
        "mosquito",
        "mother",
        "motion",
        "motor",
        "mountain",
        "mouse",
        "move",
        "movie",
        "much",
        "muffin",
        "mule",
        "multiply",
        "muscle",
        "museum",
        "mushroom",
        "music",
        "must",
        "mutual",
        "myself",
        "mystery",
        "myth",
        "naive",
        "name",
        "napkin",
        "narrow",
        "nasty",
        "nation",
        "nature",
        "near",
        "neck",
        "need",
        "negative",
        "neglect",
        "neither",
        "nephew",
        "nerve",
        "nest",
        "net",
        "network",
        "neutral",
        "never",
        "news",
        "next",
        "nice",
        "night",
        "noble",
        "noise",
        "nominee",
        "noodle",
        "normal",
        "north",
        "nose",
        "notable",
        "note",
        "nothing",
        "notice",
        "novel",
        "now",
        "nuclear",
        "number",
        "nurse",
        "nut",
        "oak",
        "obey",
        "object",
        "oblige",
        "obscure",
        "observe",
        "obtain",
        "obvious",
        "occur",
        "ocean",
        "october",
        "odor",
        "off",
        "offer",
        "office",
        "often",
        "oil",
        "okay",
        "old",
        "olive",
        "olympic",
        "omit",
        "once",
        "one",
        "onion",
        "online",
        "only",
        "open",
        "opera",
        "opinion",
        "oppose",
        "option",
        "orange",
        "orbit",
        "orchard",
        "order",
        "ordinary",
        "organ",
        "orient",
        "original",
        "orphan",
        "ostrich",
        "other",
        "outdoor",
        "outer",
        "output",
        "outside",
        "oval",
        "oven",
        "over",
        "own",
        "owner",
        "oxygen",
        "oyster",
        "ozone",
        "pact",
        "paddle",
        "page",
        "pair",
        "palace",
        "palm",
        "panda",
        "panel",
        "panic",
        "panther",
        "paper",
        "parade",
        "parent",
        "park",
        "parrot",
        "party",
        "pass",
        "patch",
        "path",
        "patient",
        "patrol",
        "pattern",
        "pause",
        "pave",
        "payment",
        "peace",
        "peanut",
        "pear",
        "peasant",
        "pelican",
        "pen",
        "penalty",
        "pencil",
        "people",
        "pepper",
        "perfect",
        "permit",
        "person",
        "pet",
        "phone",
        "photo",
        "phrase",
        "physical",
        "piano",
        "picnic",
        "picture",
        "piece",
        "pig",
        "pigeon",
        "pill",
        "pilot",
        "pink",
        "pioneer",
        "pipe",
        "pistol",
        "pitch",
        "pizza",
        "place",
        "planet",
        "plastic",
        "plate",
        "play",
        "please",
        "pledge",
        "pluck",
        "plug",
        "plunge",
        "poem",
        "poet",
        "point",
        "polar",
        "pole",
        "police",
        "pond",
        "pony",
        "pool",
        "popular",
        "portion",
        "position",
        "possible",
        "post",
        "potato",
        "pottery",
        "poverty",
        "powder",
        "power",
        "practice",
        "praise",
        "predict",
        "prefer",
        "prepare",
        "present",
        "pretty",
        "prevent",
        "price",
        "pride",
        "primary",
        "print",
        "priority",
        "prison",
        "private",
        "prize",
        "problem",
        "process",
        "produce",
        "profit",
        "program",
        "project",
        "promote",
        "proof",
        "property",
        "prosper",
        "protect",
        "proud",
        "provide",
        "public",
        "pudding",
        "pull",
        "pulp",
        "pulse",
        "pumpkin",
        "punch",
        "pupil",
        "puppy",
        "purchase",
        "purity",
        "purpose",
        "purse",
        "push",
        "put",
        "puzzle",
        "pyramid",
        "quality",
        "quantum",
        "quarter",
        "question",
        "quick",
        "quit",
        "quiz",
        "quote",
        "rabbit",
        "raccoon",
        "race",
        "rack",
        "radar",
        "radio",
        "rail",
        "rain",
        "raise",
        "rally",
        "ramp",
        "ranch",
        "random",
        "range",
        "rapid",
        "rare",
        "rate",
        "rather",
        "raven",
        "raw",
        "razor",
        "ready",
        "real",
        "reason",
        "rebel",
        "rebuild",
        "recall",
        "receive",
        "recipe",
        "record",
        "recycle",
        "reduce",
        "reflect",
        "reform",
        "refuse",
        "region",
        "regret",
        "regular",
        "reject",
        "relax",
        "release",
        "relief",
        "rely",
        "remain",
        "remember",
        "remind",
        "remove",
        "render",
        "renew",
        "rent",
        "reopen",
        "repair",
        "repeat",
        "replace",
        "report",
        "require",
        "rescue",
        "resemble",
        "resist",
        "resource",
        "response",
        "result",
        "retire",
        "retreat",
        "return",
        "reunion",
        "reveal",
        "review",
        "reward",
        "rhythm",
        "rib",
        "ribbon",
        "rice",
        "rich",
        "ride",
        "ridge",
        "rifle",
        "right",
        "rigid",
        "ring",
        "riot",
        "ripple",
        "risk",
        "ritual",
        "rival",
        "river",
        "road",
        "roast",
        "robot",
        "robust",
        "rocket",
        "romance",
        "roof",
        "rookie",
        "room",
        "rose",
        "rotate",
        "rough",
        "round",
        "route",
        "royal",
        "rubber",
        "rude",
        "rug",
        "rule",
        "run",
        "runway",
        "rural",
        "sad",
        "saddle",
        "sadness",
        "safe",
        "sail",
        "salad",
        "salmon",
        "salon",
        "salt",
        "salute",
        "same",
        "sample",
        "sand",
        "satisfy",
        "satoshi",
        "sauce",
        "sausage",
        "save",
        "say",
        "scale",
        "scan",
        "scare",
        "scatter",
        "scene",
        "scheme",
        "school",
        "science",
        "scissors",
        "scorpion",
        "scout",
        "scrap",
        "screen",
        "script",
        "scrub",
        "sea",
        "search",
        "season",
        "seat",
        "second",
        "secret",
        "section",
        "security",
        "seed",
        "seek",
        "segment",
        "select",
        "sell",
        "seminar",
        "senior",
        "sense",
        "sentence",
        "series",
        "service",
        "session",
        "settle",
        "setup",
        "seven",
        "shadow",
        "shaft",
        "shallow",
        "share",
        "shed",
        "shell",
        "sheriff",
        "shield",
        "shift",
        "shine",
        "ship",
        "shiver",
        "shock",
        "shoe",
        "shoot",
        "shop",
        "short",
        "shoulder",
        "shove",
        "shrimp",
        "shrug",
        "shuffle",
        "shy",
        "sibling",
        "sick",
        "side",
        "siege",
        "sight",
        "sign",
        "silent",
        "silk",
        "silly",
        "silver",
        "similar",
        "simple",
        "since",
        "sing",
        "siren",
        "sister",
        "situate",
        "six",
        "size",
        "skate",
        "sketch",
        "ski",
        "skill",
        "skin",
        "skirt",
        "skull",
        "slab",
        "slam",
        "sleep",
        "slender",
        "slice",
        "slide",
        "slight",
        "slim",
        "slogan",
        "slot",
        "slow",
        "slush",
        "small",
        "smart",
        "smile",
        "smoke",
        "smooth",
        "snack",
        "snake",
        "snap",
        "sniff",
        "snow",
        "soap",
        "soccer",
        "social",
        "sock",
        "soda",
        "soft",
        "solar",
        "soldier",
        "solid",
        "solution",
        "solve",
        "someone",
        "song",
        "soon",
        "sorry",
        "sort",
        "soul",
        "sound",
        "soup",
        "source",
        "south",
        "space",
        "spare",
        "spatial",
        "spawn",
        "speak",
        "special",
        "speed",
        "spell",
        "spend",
        "sphere",
        "spice",
        "spider",
        "spike",
        "spin",
        "spirit",
        "split",
        "spoil",
        "sponsor",
        "spoon",
        "sport",
        "spot",
        "spray",
        "spread",
        "spring",
        "spy",
        "square",
        "squeeze",
        "squirrel",
        "stable",
        "stadium",
        "staff",
        "stage",
        "stairs",
        "stamp",
        "stand",
        "start",
        "state",
        "stay",
        "steak",
        "steel",
        "stem",
        "step",
        "stereo",
        "stick",
        "still",
        "sting",
        "stock",
        "stomach",
        "stone",
        "stool",
        "story",
        "stove",
        "strategy",
        "street",
        "strike",
        "strong",
        "struggle",
        "student",
        "stuff",
        "stumble",
        "style",
        "subject",
        "submit",
        "subway",
        "success",
        "such",
        "sudden",
        "suffer",
        "sugar",
        "suggest",
        "suit",
        "summer",
        "sun",
        "sunny",
        "sunset",
        "super",
        "supply",
        "supreme",
        "sure",
        "surface",
        "surge",
        "surprise",
        "surround",
        "survey",
        "suspect",
        "sustain",
        "swallow",
        "swamp",
        "swap",
        "swarm",
        "swear",
        "sweet",
        "swift",
        "swim",
        "swing",
        "switch",
        "sword",
        "symbol",
        "symptom",
        "syrup",
        "system",
        "table",
        "tackle",
        "tag",
        "tail",
        "talent",
        "talk",
        "tank",
        "tape",
        "target",
        "task",
        "taste",
        "tattoo",
        "taxi",
        "teach",
        "team",
        "tell",
        "ten",
        "tenant",
        "tennis",
        "tent",
        "term",
        "test",
        "text",
        "thank",
        "that",
        "theme",
        "then",
        "theory",
        "there",
        "they",
        "thing",
        "this",
        "thought",
        "three",
        "thrive",
        "throw",
        "thumb",
        "thunder",
        "ticket",
        "tide",
        "tiger",
        "tilt",
        "timber",
        "time",
        "tiny",
        "tip",
        "tired",
        "tissue",
        "title",
        "toast",
        "tobacco",
        "today",
        "toddler",
        "toe",
        "together",
        "toilet",
        "token",
        "tomato",
        "tomorrow",
        "tone",
        "tongue",
        "tonight",
        "tool",
        "tooth",
        "top",
        "topic",
        "topple",
        "torch",
        "tornado",
        "tortoise",
        "toss",
        "total",
        "tourist",
        "toward",
        "tower",
        "town",
        "toy",
        "track",
        "trade",
        "traffic",
        "tragic",
        "train",
        "transfer",
        "trap",
        "trash",
        "travel",
        "tray",
        "treat",
        "tree",
        "trend",
        "trial",
        "tribe",
        "trick",
        "trigger",
        "trim",
        "trip",
        "trophy",
        "trouble",
        "truck",
        "true",
        "truly",
        "trumpet",
        "trust",
        "truth",
        "try",
        "tube",
        "tuition",
        "tumble",
        "tuna",
        "tunnel",
        "turkey",
        "turn",
        "turtle",
        "twelve",
        "twenty",
        "twice",
        "twin",
        "twist",
        "two",
        "type",
        "typical",
        "ugly",
        "umbrella",
        "unable",
        "unaware",
        "uncle",
        "uncover",
        "under",
        "undo",
        "unfair",
        "unfold",
        "unhappy",
        "uniform",
        "unique",
        "unit",
        "universe",
        "unknown",
        "unlock",
        "until",
        "unusual",
        "unveil",
        "update",
        "upgrade",
        "uphold",
        "upon",
        "upper",
        "upset",
        "urban",
        "urge",
        "usage",
        "use",
        "used",
        "useful",
        "useless",
        "usual",
        "utility",
        "vacant",
        "vacuum",
        "vague",
        "valid",
        "valley",
        "valve",
        "van",
        "vanish",
        "vapor",
        "various",
        "vast",
        "vault",
        "vehicle",
        "velvet",
        "vendor",
        "venture",
        "venue",
        "verb",
        "verify",
        "version",
        "very",
        "vessel",
        "veteran",
        "viable",
        "vibrant",
        "vicious",
        "victory",
        "video",
        "view",
        "village",
        "vintage",
        "violin",
        "virtual",
        "virus",
        "visa",
        "visit",
        "visual",
        "vital",
        "vivid",
        "vocal",
        "voice",
        "void",
        "volcano",
        "volume",
        "vote",
        "voyage",
        "wage",
        "wagon",
        "wait",
        "walk",
        "wall",
        "walnut",
        "want",
        "warfare",
        "warm",
        "warrior",
        "wash",
        "wasp",
        "waste",
        "water",
        "wave",
        "way",
        "wealth",
        "weapon",
        "wear",
        "weasel",
        "weather",
        "web",
        "wedding",
        "weekend",
        "weird",
        "welcome",
        "west",
        "wet",
        "whale",
        "what",
        "wheat",
        "wheel",
        "when",
        "where",
        "whip",
        "whisper",
        "wide",
        "width",
        "wife",
        "wild",
        "will",
        "win",
        "window",
        "wine",
        "wing",
        "wink",
        "winner",
        "winter",
        "wire",
        "wisdom",
        "wise",
        "wish",
        "witness",
        "wolf",
        "woman",
        "wonder",
        "wood",
        "wool",
        "word",
        "work",
        "world",
        "worry",
        "worth",
        "wrap",
        "wreck",
        "wrestle",
        "wrist",
        "write",
        "wrong",
        "yard",
        "year",
        "yellow",
        "you",
        "young",
        "youth",
        "zebra",
        "zero",
        "zone",
        "zoo"
    ],
    space: " "
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
