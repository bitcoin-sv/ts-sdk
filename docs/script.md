# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

## Interfaces

| |
| --- |
| [ScriptChunk](#interface-scriptchunk) |
| [ScriptTemplate](#interface-scripttemplate) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Interface: ScriptChunk

A representation of a chunk of a script, which includes an opcode. For push operations, the associated data to push onto the stack is also included.

```ts
export default interface ScriptChunk {
    op: number;
    data?: number[];
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ScriptTemplate

```ts
export default interface ScriptTemplate {
    lock: (...params: any) => LockingScript | Promise<LockingScript>;
    unlock: (...params: any) => {
        sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
        estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>;
    };
}
```

See also: [LockingScript](#class-lockingscript), [Transaction](#class-transaction), [UnlockingScript](#class-unlockingscript), [sign](#variable-sign)

<details>

<summary>Interface ScriptTemplate Details</summary>

#### Property lock

Creates a locking script with the given parameters.

```ts
lock: (...params: any) => LockingScript | Promise<LockingScript>
```
See also: [LockingScript](#class-lockingscript)

#### Property unlock

Creates a function that generates an unlocking script along with its signature and length estimation.

This method returns an object containing two functions:
1. `sign` - A function that, when called with a transaction and an input index, returns an UnlockingScript instance.
2. `estimateLength` - A function that returns the estimated length of the unlocking script in bytes.

```ts
unlock: (...params: any) => {
    sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
    estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>;
}
```
See also: [Transaction](#class-transaction), [UnlockingScript](#class-unlockingscript), [sign](#variable-sign)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Classes

| |
| --- |
| [LockingScript](#class-lockingscript) |
| [P2PKH](#class-p2pkh) |
| [PushDrop](#class-pushdrop) |
| [RPuzzle](#class-rpuzzle) |
| [Script](#class-script) |
| [Spend](#class-spend) |
| [UnlockingScript](#class-unlockingscript) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Class: LockingScript

The LockingScript class represents a locking script in a Bitcoin SV transaction.
It extends the Script class and is used specifically for output scripts that lock funds.

Inherits all properties and methods from the Script class.

```ts
export default class LockingScript extends Script {
    isLockingScript(): boolean 
    isUnlockingScript(): boolean 
}
```

See also: [Script](#class-script)

<details>

<summary>Class LockingScript Details</summary>

#### Method isLockingScript

```ts
isLockingScript(): boolean 
```

Returns

Always returns true for a LockingScript instance.

#### Method isUnlockingScript

```ts
isUnlockingScript(): boolean 
```

Returns

Always returns false for a LockingScript instance.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: P2PKH

P2PKH (Pay To Public Key Hash) class implementing ScriptTemplate.

This class provides methods to create Pay To Public Key Hash locking and unlocking scripts, including the unlocking of P2PKH UTXOs with the private key.

```ts
export default class P2PKH implements ScriptTemplate {
    lock(pubkeyhash: string | number[]): LockingScript 
    unlock(privateKey: PrivateKey, signOutputs: "all" | "none" | "single" = "all", anyoneCanPay: boolean = false, sourceSatoshis?: number, lockingScript?: Script): {
        sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
        estimateLength: () => Promise<108>;
    } 
}
```

See also: [LockingScript](#class-lockingscript), [PrivateKey](#class-privatekey), [Script](#class-script), [ScriptTemplate](#interface-scripttemplate), [Transaction](#class-transaction), [UnlockingScript](#class-unlockingscript), [sign](#variable-sign)

<details>

<summary>Class P2PKH Details</summary>

#### Method lock

Creates a P2PKH locking script for a given public key hash or address string

```ts
lock(pubkeyhash: string | number[]): LockingScript 
```
See also: [LockingScript](#class-lockingscript)

Returns

- A P2PKH locking script.

Argument Details

+ **pubkeyhash**
  + or address - An array or address representing the public key hash.

#### Method unlock

Creates a function that generates a P2PKH unlocking script along with its signature and length estimation.

The returned object contains:
1. `sign` - A function that, when invoked with a transaction and an input index,
   produces an unlocking script suitable for a P2PKH locked output.
2. `estimateLength` - A function that returns the estimated length of the unlocking script in bytes.

```ts
unlock(privateKey: PrivateKey, signOutputs: "all" | "none" | "single" = "all", anyoneCanPay: boolean = false, sourceSatoshis?: number, lockingScript?: Script): {
    sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
    estimateLength: () => Promise<108>;
} 
```
See also: [PrivateKey](#class-privatekey), [Script](#class-script), [Transaction](#class-transaction), [UnlockingScript](#class-unlockingscript), [sign](#variable-sign)

Returns

- An object containing the `sign` and `estimateLength` functions.

Argument Details

+ **privateKey**
  + The private key used for signing the transaction.
+ **signOutputs**
  + The signature scope for outputs.
+ **anyoneCanPay**
  + Flag indicating if the signature allows for other inputs to be added later.
+ **sourceSatoshis**
  + Optional. The amount being unlocked. Otherwise the input.sourceTransaction is required.
+ **lockingScript**
  + Optional. The lockinScript. Otherwise the input.sourceTransaction is required.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: PushDrop

```ts
export default class PushDrop implements ScriptTemplate {
    wallet: Wallet;
    static decode(script: LockingScript): {
        lockingPublicKey: PublicKey;
        fields: number[][];
    } 
    constructor(wallet: Wallet) 
    async lock(fields: number[][], protocolID: [
        SecurityLevel,
        string
    ], keyID: string, counterparty: string, forSelf = false, includeSignature = true, lockPosition: "before" | "after" = "before"): Promise<LockingScript> 
    unlock(protocolID: [
        SecurityLevel,
        string
    ], keyID: string, counterparty: string, signOutputs: "all" | "none" | "single" = "all", anyoneCanPay = false, sourceSatoshis?: number, lockingScript?: LockingScript): {
        sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
        estimateLength: () => Promise<73>;
    } 
}
```

See also: [LockingScript](#class-lockingscript), [PublicKey](#class-publickey), [ScriptTemplate](#interface-scripttemplate), [SecurityLevel](#type-securitylevel), [Transaction](#class-transaction), [UnlockingScript](#class-unlockingscript), [Wallet](#interface-wallet), [sign](#variable-sign)

<details>

<summary>Class PushDrop Details</summary>

#### Constructor

Constructs a new instance of the PushDrop class.

```ts
constructor(wallet: Wallet) 
```
See also: [Wallet](#interface-wallet)

Argument Details

+ **wallet**
  + The wallet interface used for creating signatures and accessing public keys.

#### Method decode

Decodes a PushDrop script back into its token fields and the locking public key. If a signature was present, it will be the last field returned.
Warning: Only works with a P2PK lock at the beginning of the script.

```ts
static decode(script: LockingScript): {
    lockingPublicKey: PublicKey;
    fields: number[][];
} 
```
See also: [LockingScript](#class-lockingscript), [PublicKey](#class-publickey)

Returns

An object containing PushDrop token fields and the locking public key. If a signature was included, it will be the last field.

Argument Details

+ **script**
  + PushDrop script to decode back into token fields

#### Method lock

Creates a PushDrop locking script with arbitrary data fields and a public key lock.

```ts
async lock(fields: number[][], protocolID: [
    SecurityLevel,
    string
], keyID: string, counterparty: string, forSelf = false, includeSignature = true, lockPosition: "before" | "after" = "before"): Promise<LockingScript> 
```
See also: [LockingScript](#class-lockingscript), [SecurityLevel](#type-securitylevel)

Returns

The generated PushDrop locking script.

Argument Details

+ **fields**
  + The token fields to include in the locking script.
+ **protocolID**
  + The protocol ID to use.
+ **keyID**
  + The key ID to use.
+ **counterparty**
  + The counterparty involved in the transaction, "self" or "anyone".
+ **forSelf**
  + Flag indicating if the lock is for the creator (default no).
+ **includeSignature**
  + Flag indicating if a signature should be included in the script (default yes).

#### Method unlock

Creates an unlocking script for spending a PushDrop token output.

```ts
unlock(protocolID: [
    SecurityLevel,
    string
], keyID: string, counterparty: string, signOutputs: "all" | "none" | "single" = "all", anyoneCanPay = false, sourceSatoshis?: number, lockingScript?: LockingScript): {
    sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
    estimateLength: () => Promise<73>;
} 
```
See also: [LockingScript](#class-lockingscript), [SecurityLevel](#type-securitylevel), [Transaction](#class-transaction), [UnlockingScript](#class-unlockingscript), [sign](#variable-sign)

Returns

An object containing functions to sign the transaction and estimate the script length.

Argument Details

+ **protocolID**
  + The protocol ID to use.
+ **keyID**
  + The key ID to use.
+ **counterparty**
  + The counterparty involved in the transaction, "self" or "anyone".
+ **sourceTXID**
  + The TXID of the source transaction.
+ **sourceSatoshis**
  + The number of satoshis in the source output.
+ **lockingScript**
  + The locking script of the source output.
+ **signOutputs**
  + Specifies which outputs to sign.
+ **anyoneCanPay**
  + Specifies if the anyone-can-pay flag is set.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: RPuzzle

RPuzzle class implementing ScriptTemplate.

This class provides methods to create R Puzzle and R Puzzle Hash locking and unlocking scripts, including the unlocking of UTXOs with the correct K value.

```ts
export default class RPuzzle implements ScriptTemplate {
    type: "raw" | "SHA1" | "SHA256" | "HASH256" | "RIPEMD160" | "HASH160" = "raw";
    constructor(type: "raw" | "SHA1" | "SHA256" | "HASH256" | "RIPEMD160" | "HASH160" = "raw") 
    lock(value: number[]): LockingScript 
    unlock(k: BigNumber, privateKey: PrivateKey, signOutputs: "all" | "none" | "single" = "all", anyoneCanPay: boolean = false): {
        sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
        estimateLength: () => Promise<108>;
    } 
}
```

See also: [BigNumber](#class-bignumber), [LockingScript](#class-lockingscript), [PrivateKey](#class-privatekey), [ScriptTemplate](#interface-scripttemplate), [Transaction](#class-transaction), [UnlockingScript](#class-unlockingscript), [sign](#variable-sign)

<details>

<summary>Class RPuzzle Details</summary>

#### Constructor

```ts
constructor(type: "raw" | "SHA1" | "SHA256" | "HASH256" | "RIPEMD160" | "HASH160" = "raw") 
```

Argument Details

+ **type**
  + Denotes the type of puzzle to create

#### Method lock

Creates an R puzzle locking script for a given R value or R value hash.

```ts
lock(value: number[]): LockingScript 
```
See also: [LockingScript](#class-lockingscript)

Returns

- An R puzzle locking script.

Argument Details

+ **value**
  + An array representing the R value or its hash.

#### Method unlock

Creates a function that generates an R puzzle unlocking script along with its signature and length estimation.

The returned object contains:
1. `sign` - A function that, when invoked with a transaction and an input index,
   produces an unlocking script suitable for an R puzzle locked output.
2. `estimateLength` - A function that returns the estimated length of the unlocking script in bytes.

```ts
unlock(k: BigNumber, privateKey: PrivateKey, signOutputs: "all" | "none" | "single" = "all", anyoneCanPay: boolean = false): {
    sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
    estimateLength: () => Promise<108>;
} 
```
See also: [BigNumber](#class-bignumber), [PrivateKey](#class-privatekey), [Transaction](#class-transaction), [UnlockingScript](#class-unlockingscript), [sign](#variable-sign)

Returns

- An object containing the `sign` and `estimateLength` functions.

Argument Details

+ **k**
  + — The K-value used to unlock the R-puzzle.
+ **privateKey**
  + The private key used for signing the transaction. If not provided, a random key will be generated.
+ **signOutputs**
  + The signature scope for outputs.
+ **anyoneCanPay**
  + Flag indicating if the signature allows for other inputs to be added later.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: Script

The Script class represents a script in a Bitcoin SV transaction,
encapsulating the functionality to construct, parse, and serialize
scripts used in both locking (output) and unlocking (input) scripts.

```ts
export default class Script {
    chunks: ScriptChunk[];
    static fromASM(asm: string): Script 
    static fromHex(hex: string): Script 
    static fromBinary(bin: number[]): Script 
    constructor(chunks: ScriptChunk[] = []) 
    toASM(): string 
    toHex(): string 
    toBinary(): number[] 
    writeScript(script: Script): Script 
    writeOpCode(op: number): Script 
    setChunkOpCode(i: number, op: number): Script 
    writeBn(bn: BigNumber): Script 
    writeBin(bin: number[]): Script 
    writeNumber(num: number): Script 
    removeCodeseparators(): Script 
    findAndDelete(script: Script): Script 
    isPushOnly(): boolean 
    isLockingScript(): boolean 
    isUnlockingScript(): boolean 
}
```

See also: [BigNumber](#class-bignumber), [ScriptChunk](#interface-scriptchunk), [toHex](#variable-tohex)

<details>

<summary>Class Script Details</summary>

#### Constructor

```ts
constructor(chunks: ScriptChunk[] = []) 
```
See also: [ScriptChunk](#interface-scriptchunk)

Argument Details

+ **chunks**
  + =[] - An array of script chunks to directly initialize the script.

#### Method findAndDelete

Deletes the given item wherever it appears in the current script.

```ts
findAndDelete(script: Script): Script 
```
See also: [Script](#class-script)

Returns

This script instance for chaining.

Argument Details

+ **script**
  + The script containing the item to delete from the current script.

#### Method fromASM

```ts
static fromASM(asm: string): Script 
```
See also: [Script](#class-script)

Returns

A new Script instance.

Argument Details

+ **asm**
  + The script in ASM string format.

Example

```ts
const script = Script.fromASM("OP_DUP OP_HASH160 abcd... OP_EQUALVERIFY OP_CHECKSIG")
```

#### Method fromBinary

```ts
static fromBinary(bin: number[]): Script 
```
See also: [Script](#class-script)

Returns

A new Script instance.

Argument Details

+ **bin**
  + The script in binary array format.

Example

```ts
const script = Script.fromBinary([0x76, 0xa9, ...])
```

#### Method fromHex

```ts
static fromHex(hex: string): Script 
```
See also: [Script](#class-script)

Returns

A new Script instance.

Argument Details

+ **hex**
  + The script in hexadecimal format.

Example

```ts
const script = Script.fromHex("76a9...");
```

#### Method isLockingScript

```ts
isLockingScript(): boolean 
```

Returns

True if the script is a locking script, otherwise false.

#### Method isPushOnly

```ts
isPushOnly(): boolean 
```

Returns

True if the script is push-only, otherwise false.

#### Method isUnlockingScript

```ts
isUnlockingScript(): boolean 
```

Returns

True if the script is an unlocking script, otherwise false.

#### Method removeCodeseparators

```ts
removeCodeseparators(): Script 
```
See also: [Script](#class-script)

Returns

This script instance for chaining.

#### Method setChunkOpCode

```ts
setChunkOpCode(i: number, op: number): Script 
```
See also: [Script](#class-script)

Returns

This script instance for chaining.

Argument Details

+ **i**
  + The index of the chunk.
+ **op**
  + The opcode to set.

#### Method toASM

```ts
toASM(): string 
```

Returns

The script in ASM string format.

#### Method toBinary

```ts
toBinary(): number[] 
```

Returns

The script in binary array format.

#### Method toHex

```ts
toHex(): string 
```

Returns

The script in hexadecimal format.

#### Method writeBin

```ts
writeBin(bin: number[]): Script 
```
See also: [Script](#class-script)

Returns

This script instance for chaining.

Argument Details

+ **bin**
  + The binary data to append.

Throws

Throws an error if the data is too large to be pushed.

#### Method writeBn

```ts
writeBn(bn: BigNumber): Script 
```
See also: [BigNumber](#class-bignumber), [Script](#class-script)

Returns

This script instance for chaining.

Argument Details

+ **bn**
  + The BigNumber to append.

#### Method writeNumber

```ts
writeNumber(num: number): Script 
```
See also: [Script](#class-script)

Returns

This script instance for chaining.

Argument Details

+ **num**
  + The number to append.

#### Method writeOpCode

```ts
writeOpCode(op: number): Script 
```
See also: [Script](#class-script)

Returns

This script instance for chaining.

Argument Details

+ **op**
  + The opcode to append.

#### Method writeScript

```ts
writeScript(script: Script): Script 
```
See also: [Script](#class-script)

Returns

This script instance for chaining.

Argument Details

+ **script**
  + The script to append.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: Spend

The Spend class represents a spend action within a Bitcoin SV transaction.
It encapsulates all the necessary data required for spending a UTXO (Unspent Transaction Output)
and includes details about the source transaction, output, and the spending transaction itself.

```ts
export default class Spend {
    sourceTXID: string;
    sourceOutputIndex: number;
    sourceSatoshis: number;
    lockingScript: LockingScript;
    transactionVersion: number;
    otherInputs: TransactionInput[];
    outputs: TransactionOutput[];
    inputIndex: number;
    unlockingScript: UnlockingScript;
    inputSequence: number;
    lockTime: number;
    context: "UnlockingScript" | "LockingScript";
    programCounter: number;
    lastCodeSeparator: number | null;
    stack: number[][];
    altStack: number[][];
    ifStack: boolean[];
    constructor(params: {
        sourceTXID: string;
        sourceOutputIndex: number;
        sourceSatoshis: number;
        lockingScript: LockingScript;
        transactionVersion: number;
        otherInputs: TransactionInput[];
        outputs: TransactionOutput[];
        unlockingScript: UnlockingScript;
        inputSequence: number;
        inputIndex: number;
        lockTime: number;
    }) 
    reset(): void 
    step(): void 
    validate(): boolean 
}
```

See also: [LockingScript](#class-lockingscript), [TransactionInput](#interface-transactioninput), [TransactionOutput](#interface-transactionoutput), [UnlockingScript](#class-unlockingscript)

<details>

<summary>Class Spend Details</summary>

#### Constructor

```ts
constructor(params: {
    sourceTXID: string;
    sourceOutputIndex: number;
    sourceSatoshis: number;
    lockingScript: LockingScript;
    transactionVersion: number;
    otherInputs: TransactionInput[];
    outputs: TransactionOutput[];
    unlockingScript: UnlockingScript;
    inputSequence: number;
    inputIndex: number;
    lockTime: number;
}) 
```
See also: [LockingScript](#class-lockingscript), [TransactionInput](#interface-transactioninput), [TransactionOutput](#interface-transactionoutput), [UnlockingScript](#class-unlockingscript)

Argument Details

+ **params.sourceTXID**
  + The transaction ID of the source UTXO.
+ **params.sourceOutputIndex**
  + The index of the output in the source transaction.
+ **params.sourceSatoshis**
  + The amount of satoshis in the source UTXO.
+ **params.lockingScript**
  + The locking script associated with the UTXO.
+ **params.transactionVersion**
  + The version of the current transaction.
+ **params.otherInputs**
  + -
An array of other inputs in the transaction.
+ **params.outputs**
  + -
The outputs of the current transaction.
+ **params.inputIndex**
  + The index of this input in the current transaction.
+ **params.unlockingScript**
  + The unlocking script for this spend.
+ **params.inputSequence**
  + The sequence number of this input.
+ **params.lockTime**
  + The lock time of the transaction.

Example

```ts
const spend = new Spend({
  sourceTXID: "abcd1234", // sourceTXID
  sourceOutputIndex: 0, // sourceOutputIndex
  sourceSatoshis: new BigNumber(1000), // sourceSatoshis
  lockingScript: LockingScript.fromASM("OP_DUP OP_HASH160 abcd1234... OP_EQUALVERIFY OP_CHECKSIG"),
  transactionVersion: 1, // transactionVersion
  otherInputs: [{ sourceTXID: "abcd1234", sourceOutputIndex: 1, sequence: 0xffffffff }], // otherInputs
  outputs: [{ satoshis: new BigNumber(500), lockingScript: LockingScript.fromASM("OP_DUP...") }], // outputs
  inputIndex: 0, // inputIndex
  unlockingScript: UnlockingScript.fromASM("3045... 02ab..."),
  inputSequence: 0xffffffff // inputSequence
});
```

#### Method validate

```ts
validate(): boolean 
```

Returns

Returns true if the scripts are valid and the spend is legitimate, otherwise false.

Example

```ts
if (spend.validate()) {
  console.log("Spend is valid!");
} else {
  console.log("Invalid spend!");
}
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: UnlockingScript

The UnlockingScript class represents an unlocking script in a Bitcoin SV transaction.
It extends the Script class and is used specifically for input scripts that unlock funds.

Inherits all properties and methods from the Script class.

```ts
export default class UnlockingScript extends Script {
    isLockingScript(): boolean 
    isUnlockingScript(): boolean 
}
```

See also: [Script](#class-script)

<details>

<summary>Class UnlockingScript Details</summary>

#### Method isLockingScript

```ts
isLockingScript(): boolean 
```

Returns

Always returns false for an UnlockingScript instance.

#### Method isUnlockingScript

```ts
isUnlockingScript(): boolean 
```

Returns

Always returns true for an UnlockingScript instance.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Functions

## Types

## Enums

## Variables

