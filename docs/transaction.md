# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

## Interfaces

| |
| --- |
| [BroadcastFailure](#interface-broadcastfailure) |
| [BroadcastResponse](#interface-broadcastresponse) |
| [Broadcaster](#interface-broadcaster) |
| [ChainTracker](#interface-chaintracker) |
| [FeeModel](#interface-feemodel) |
| [TransactionInput](#interface-transactioninput) |
| [TransactionOutput](#interface-transactionoutput) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---

### Interface: TransactionInput

Represents an input to a Bitcoin transaction.
This interface defines the structure and components required to construct
a transaction input in the Bitcoin blockchain.

Example

```ts
// Creating a simple transaction input
let txInput = {
  sourceTXID: '123abc...',
  sourceOutputIndex: 0,
  sequence: 0xFFFFFFFF
};

// Using an unlocking script template
txInput.unlockingScriptTemplate = {
  sign: async (tx, index) => { ... },
  estimateLength: async (tx, index) => { ... }
};
```

```ts
export default interface TransactionInput {
    sourceTransaction?: Transaction;
    sourceTXID?: string;
    sourceOutputIndex: number;
    unlockingScript?: UnlockingScript;
    unlockingScriptTemplate?: {
        sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
        estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>;
    };
    sequence: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
### Interface: TransactionOutput

Represents an output in a Bitcoin transaction.
This interface defines the structure and components necessary to construct
a transaction output, which secures owned Bitcoins to be unlocked later.

Example

```ts
// Creating a simple transaction output
let txOutput = {
  satoshis: 1000,
  lockingScript: LockingScript.fromASM('OP_DUP OP_HASH160 ... OP_EQUALVERIFY OP_CHECKSIG'),
  change: false
};
```

```ts
export default interface TransactionOutput {
    satoshis?: number;
    lockingScript: LockingScript;
    change?: boolean;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
### Interface: FeeModel

Represents the interface for a transaction fee model.
This interface defines a standard method for computing a fee when given a transaction.

```ts
export default interface FeeModel {
    computeFee: (transaction: Transaction) => Promise<number>;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
### Interface: BroadcastResponse

Defines the structure of a successful broadcast response.

```ts
export interface BroadcastResponse {
    status: "success";
    txid: string;
    message: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
### Interface: BroadcastFailure

Defines the structure of a failed broadcast response.

```ts
export interface BroadcastFailure {
    status: "error";
    code: string;
    description: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
### Interface: Broadcaster

Represents the interface for a transaction broadcaster.
This interface defines a standard method for broadcasting transactions.

```ts
export interface Broadcaster {
    broadcast: (transaction: Transaction) => Promise<BroadcastResponse | BroadcastFailure>;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
### Interface: ChainTracker

The Chain Tracker is responsible for verifying the validity of a given Merkle root
for a specific block height within the blockchain.

Chain Trackers ensure the integrity of the blockchain by
validating new headers against the chain's history. They use accumulated
proof-of-work and protocol adherence as metrics to assess the legitimacy of blocks.

Example

```ts
const chainTracker = {
  isValidRootForHeight: async (root, height) => {
    // Implementation to check if the Merkle root is valid for the specified block height.
  }
};
```

```ts
export default interface ChainTracker {
    isValidRootForHeight: (root: string, height: number) => Promise<boolean>;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
## Classes

| |
| --- |
| [MerklePath](#class-merklepath) |
| [SatoshisPerKilobyte](#class-satoshisperkilobyte) |
| [Transaction](#class-transaction) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---

### Class: SatoshisPerKilobyte

Represents the "satoshis per kilobyte" transaction fee model.

```ts
export default class SatoshisPerKilobyte implements FeeModel {
    value: number;
    constructor(value: number) 
    async computeFee(tx: Transaction): Promise<number> 
}
```

<details>

<summary>Class SatoshisPerKilobyte Details</summary>

#### Constructor

Constructs an instance of the sat/kb fee model.

```ts
constructor(value: number) 
```

Argument Details

+ **value**
  + The number of satoshis per kilobyte to charge as a fee.

#### Method computeFee

Computes the fee for a given transaction.

```ts
async computeFee(tx: Transaction): Promise<number> 
```

Returns

The fee in satoshis for the transaction, as a BigNumber.

Argument Details

+ **tx**
  + The transaction for which a fee is to be computed.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
### Class: MerklePath

Represents a Merkle Path, which is used to provide a compact proof of inclusion for a
transaction in a block. This class encapsulates all the details required for creating
and verifying Merkle Proofs.

Example

```ts
// Creating and verifying a Merkle Path
const merklePath = MerklePath.fromHex('...');
const isValid = merklePath.verify(txid, chainTracker);
```

```ts
export default class MerklePath {
    blockHeight: number;
    path: Array<Array<{
        offset: number;
        hash?: string;
        txid?: boolean;
        duplicate?: boolean;
    }>>;
    static fromHex(hex: string): MerklePath 
    static fromReader(reader: Reader): MerklePath 
    static fromBinary(bump: number[]): MerklePath 
    constructor(blockHeight: number, path: Array<Array<{
        offset: number;
        hash?: string;
        txid?: boolean;
        duplicate?: boolean;
    }>>) 
    toBinary(): number[] 
    toHex(): string 
    computeRoot(txid?: string): string 
    async verify(txid: string, chainTracker: ChainTracker): Promise<boolean> 
    combine(other: MerklePath): void 
}
```

<details>

<summary>Class MerklePath Details</summary>

#### Method combine

Combines this MerklePath with another to create a compound proof.

```ts
combine(other: MerklePath): void 
```

Argument Details

+ **other**
  + Another MerklePath to combine with this path.

Throws

- If the paths have different block heights or roots.

#### Method computeRoot

Computes the Merkle root from the provided transaction ID.

```ts
computeRoot(txid?: string): string 
```

Returns

- The computed Merkle root as a hexadecimal string.

Argument Details

+ **txid**
  + The transaction ID to compute the Merkle root for. If not provided, the root will be computed from an unspecified branch, and not all branches will be validated!

Throws

- If the transaction ID is not part of the Merkle Path.

#### Method fromBinary

Creates a MerklePath instance from a binary array.

```ts
static fromBinary(bump: number[]): MerklePath 
```

Returns

- A new MerklePath instance.

Argument Details

+ **bump**
  + The binary array representation of the Merkle Path.

#### Method fromHex

Creates a MerklePath instance from a hexadecimal string.

```ts
static fromHex(hex: string): MerklePath 
```

Returns

- A new MerklePath instance.

Argument Details

+ **hex**
  + The hexadecimal string representation of the Merkle Path.

#### Method toBinary

Converts the MerklePath to a binary array format.

```ts
toBinary(): number[] 
```

Returns

- The binary array representation of the Merkle Path.

#### Method toHex

Converts the MerklePath to a hexadecimal string format.

```ts
toHex(): string 
```

Returns

- The hexadecimal string representation of the Merkle Path.

#### Method verify

Verifies if the given transaction ID is part of the Merkle tree at the specified block height.

```ts
async verify(txid: string, chainTracker: ChainTracker): Promise<boolean> 
```

Returns

- True if the transaction ID is valid within the Merkle Path at the specified block height.

Argument Details

+ **txid**
  + The transaction ID to verify.
+ **chainTracker**
  + The ChainTracker instance used to verify the Merkle root.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
### Class: Transaction

Represents a complete Bitcoin transaction. This class encapsulates all the details
required for creating, signing, and processing a Bitcoin transaction, including
inputs, outputs, and various transaction-related methods.

Example

```ts
// Creating a new transaction
let tx = new Transaction();
tx.addInput(...);
tx.addOutput(...);
await tx.fee();
await tx.sign();
await tx.broadcast();
```

```ts
export default class Transaction {
    version: number;
    inputs: TransactionInput[];
    outputs: TransactionOutput[];
    lockTime: number;
    metadata: Record<string, any>;
    merklePath?: MerklePath;
    static fromBEEF(beef: number[]): Transaction 
    static parseScriptOffsets(bin: number[]): {
        inputs: {
            vin: number;
            offset: number;
            length: number;
        }[];
        outputs: {
            vout: number;
            offset: number;
            length: number;
        }[];
    } 
    static fromBinary(bin: number[]): Transaction 
    static fromHex(hex: string): Transaction 
    static fromHexBEEF(hex: string): Transaction 
    constructor(version: number = 1, inputs: TransactionInput[] = [], outputs: TransactionOutput[] = [], lockTime: number = 0, metadata: Record<string, any> = {}, merklePath?: MerklePath) 
    addInput(input: TransactionInput): void 
    addOutput(output: TransactionOutput): void 
    updateMetadata(metadata: Record<string, any>): void 
    async fee(model?: FeeModel, changeDistribution: "equal" | "random" = "equal"): Promise<void> 
    async sign(): Promise<void> 
    async broadcast(broadcaster: Broadcaster): Promise<BroadcastResponse | BroadcastFailure> 
    toBinary(): number[] 
    toEF(): number[] 
    toHexEF(): string 
    toHex(): string 
    toHexBEEF(): string 
    hash(enc?: "hex"): number[] | string 
    id(): number[];
    id(enc: "hex"): string;
    id(enc?: "hex"): number[] | string 
    async verify(chainTracker: ChainTracker | "scripts only"): Promise<boolean> 
    toBEEF(): number[] 
}
```

<details>

<summary>Class Transaction Details</summary>

#### Method addInput

Adds a new input to the transaction.

```ts
addInput(input: TransactionInput): void 
```

Argument Details

+ **input**
  + The TransactionInput object to add to the transaction.

Throws

- If the input does not have a sourceTXID or sourceTransaction defined.

#### Method addOutput

Adds a new output to the transaction.

```ts
addOutput(output: TransactionOutput): void 
```

Argument Details

+ **output**
  + The TransactionOutput object to add to the transaction.

#### Method broadcast

Broadcasts a transaction.

```ts
async broadcast(broadcaster: Broadcaster): Promise<BroadcastResponse | BroadcastFailure> 
```

Returns

A BroadcastResponse or BroadcastFailure from the Broadcaster

Argument Details

+ **broadcaster**
  + The Broadcaster instance wwhere the transaction will be sent

#### Method fee

Computes fees prior to signing.
If no fee model is provided, uses a SatoshisPerKilobyte fee model that pays 10 sat/kb.

```ts
async fee(model?: FeeModel, changeDistribution: "equal" | "random" = "equal"): Promise<void> 
```

Argument Details

+ **model**
  + The initialized fee model to use
+ **changeDistribution**
  + Specifies how the change should be distributed
amongst the change outputs

TODO: Benford's law change distribution.

#### Method fromBEEF

Creates a new transaction, linked to its inputs and their associated merkle paths, from a BEEF (BRC-62) structure.

```ts
static fromBEEF(beef: number[]): Transaction 
```

Returns

An anchored transaction, linked to its associated inputs populated with merkle paths.

Argument Details

+ **beef**
  + A binary representation of a transaction in BEEF format.

#### Method fromBinary

Creates a Transaction instance from a binary array.

```ts
static fromBinary(bin: number[]): Transaction 
```

Returns

- A new Transaction instance.

Argument Details

+ **bin**
  + The binary array representation of the transaction.

#### Method fromHex

Creates a Transaction instance from a hexadecimal string.

```ts
static fromHex(hex: string): Transaction 
```

Returns

- A new Transaction instance.

Argument Details

+ **hex**
  + The hexadecimal string representation of the transaction.

#### Method fromHexBEEF

Creates a Transaction instance from a hexadecimal string encoded BEEF.

```ts
static fromHexBEEF(hex: string): Transaction 
```

Returns

- A new Transaction instance.

Argument Details

+ **hex**
  + The hexadecimal string representation of the transaction BEEF.

#### Method hash

Calculates the transaction's hash.

```ts
hash(enc?: "hex"): number[] | string 
```

Returns

- The hash of the transaction in the specified format.

Argument Details

+ **enc**
  + The encoding to use for the hash. If 'hex', returns a hexadecimal string; otherwise returns a binary array.

#### Method id

Calculates the transaction's ID in binary array.

```ts
id(): number[]
```

Returns

- The ID of the transaction in the binary array format.

#### Method id

Calculates the transaction's ID in hexadecimal format.

```ts
id(enc: "hex"): string
```

Returns

- The ID of the transaction in the hex format.

Argument Details

+ **enc**
  + The encoding to use for the ID. If 'hex', returns a hexadecimal string.

#### Method id

Calculates the transaction's ID.

```ts
id(enc?: "hex"): number[] | string 
```

Returns

- The ID of the transaction in the specified format.

Argument Details

+ **enc**
  + The encoding to use for the ID. If 'hex', returns a hexadecimal string; otherwise returns a binary array.

#### Method parseScriptOffsets

Since the validation of blockchain data is atomically transaction data validation,
any application seeking to validate data in output scripts must store the entire transaction as well.
Since the transaction data includes the output script data, saving a second copy of potentially
large scripts can bloat application storage requirements.

This function efficiently parses binary transaction data to determine the offsets and lengths of each script.
This supports the efficient retreival of script data from transaction data.

```ts
static parseScriptOffsets(bin: number[]): {
    inputs: {
        vin: number;
        offset: number;
        length: number;
    }[];
    outputs: {
        vout: number;
        offset: number;
        length: number;
    }[];
} 
```

Returns

inputs: { vin: number, offset: number, length: number }[]
outputs: { vout: number, offset: number, length: number }[]
}

Argument Details

+ **bin**
  + binary transaction data

#### Method sign

Signs a transaction, hydrating all its unlocking scripts based on the provided script templates where they are available.

```ts
async sign(): Promise<void> 
```

#### Method toBEEF

Serializes this transaction, together with its inputs and the respective merkle proofs, into the BEEF (BRC-62) format. This enables efficient verification of its compliance with the rules of SPV.

```ts
toBEEF(): number[] 
```

Returns

The serialized BEEF structure

#### Method toBinary

Converts the transaction to a binary array format.

```ts
toBinary(): number[] 
```

Returns

- The binary array representation of the transaction.

#### Method toEF

Converts the transaction to a BRC-30 EF format.

```ts
toEF(): number[] 
```

Returns

- The BRC-30 EF representation of the transaction.

#### Method toHex

Converts the transaction to a hexadecimal string format.

```ts
toHex(): string 
```

Returns

- The hexadecimal string representation of the transaction.

#### Method toHexBEEF

Converts the transaction to a hexadecimal string BEEF.

```ts
toHexBEEF(): string 
```

Returns

- The hexadecimal string representation of the transaction BEEF.

#### Method toHexEF

Converts the transaction to a hexadecimal string EF.

```ts
toHexEF(): string 
```

Returns

- The hexadecimal string representation of the transaction EF.

#### Method updateMetadata

Updates the transaction's metadata.

```ts
updateMetadata(metadata: Record<string, any>): void 
```

Argument Details

+ **metadata**
  + The metadata object to merge into the existing metadata.

#### Method verify

Verifies the legitimacy of the Bitcoin transaction according to the rules of SPV by ensuring all the input transactions link back to valid block headers, the chain of spends for all inputs are valid, and the sum of inputs is not less than the sum of outputs.

```ts
async verify(chainTracker: ChainTracker | "scripts only"): Promise<boolean> 
```

Returns

Whether the transaction is valid according to the rules of SPV.

Argument Details

+ **chainTracker**
  + An instance of ChainTracker, a Bitcoin block header tracker. If the value is set to 'scripts only', headers will not be verified.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Variables](#variables)

---
## Functions

## Variables

