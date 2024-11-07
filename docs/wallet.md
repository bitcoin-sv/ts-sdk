# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

## Interfaces

| |
| --- |
| [Wallet](#interface-wallet) |
| [WalletWire](#interface-walletwire) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---

### Interface: Wallet

The Wallet interface defines a wallet capable of various tasks including transaction creation and signing,
encryption, decryption, identity certificate management, identity verification, and communication
with applications as per the BRC standards. This interface allows applications to interact with
the wallet for a range of functionalities aligned with the Babbage architectural principles.

```ts
export interface Wallet {
    createAction: (args: {
        description: DescriptionString5to50Characters;
        inputBEEF?: BEEF;
        inputs?: Array<{
            outpoint: OutpointString;
            unlockingScript?: HexString;
            unlockingScriptLength?: PositiveInteger;
            inputDescription: DescriptionString5to50Characters;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        outputs?: Array<{
            lockingScript: HexString;
            satoshis: SatoshiValue;
            outputDescription: DescriptionString5to50Characters;
            basket?: BasketStringUnder300Characters;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
        }>;
        lockTime?: PositiveIntegerOrZero;
        version?: PositiveIntegerOrZero;
        labels?: LabelStringUnder300Characters[];
        options?: {
            signAndProcess?: BooleanDefaultTrue;
            acceptDelayedBroadcast?: BooleanDefaultTrue;
            trustSelf?: "known";
            knownTxids?: TXIDHexString[];
            returnTXIDOnly?: BooleanDefaultFalse;
            noSend?: BooleanDefaultFalse;
            noSendChange?: OutpointString[];
            sendWith?: TXIDHexString[];
            randomizeOutputs?: BooleanDefaultTrue;
        };
    }, originator?: OriginatorDomainNameString) => Promise<{
        txid?: TXIDHexString;
        tx?: AtomicBEEF;
        noSendChange?: OutpointString[];
        sendWithResults?: Array<{
            txid: TXIDHexString;
            status: "unproven" | "sending" | "failed";
        }>;
        signableTransaction?: {
            tx: AtomicBEEF;
            reference: Base64String;
        };
    }>;
    signAction: (args: {
        spends: Record<PositiveIntegerOrZero, {
            unlockingScript: HexString;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        reference: Base64String;
        options?: {
            acceptDelayedBroadcast?: BooleanDefaultTrue;
            returnTXIDOnly?: BooleanDefaultFalse;
            noSend?: BooleanDefaultFalse;
            sendWith?: TXIDHexString[];
        };
    }, originator?: OriginatorDomainNameString) => Promise<{
        txid?: TXIDHexString;
        tx?: AtomicBEEF;
        sendWithResults?: Array<{
            txid: TXIDHexString;
            status: "unproven" | "sending" | "failed";
        }>;
    }>;
    abortAction: (args: {
        reference: Base64String;
    }, originator?: OriginatorDomainNameString) => Promise<{
        aborted: true;
    }>;
    listActions: (args: {
        labels: LabelStringUnder300Characters[];
        labelQueryMode?: "any" | "all";
        includeLabels?: BooleanDefaultFalse;
        includeInputs?: BooleanDefaultFalse;
        includeInputSourceLockingScripts?: BooleanDefaultFalse;
        includeInputUnlockingScripts?: BooleanDefaultFalse;
        includeOutputs?: BooleanDefaultFalse;
        includeOutputLockingScripts?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        seekPermission?: BooleanDefaultTrue;
    }, originator?: OriginatorDomainNameString) => Promise<{
        totalActions: PositiveIntegerOrZero;
        actions: Array<{
            txid: TXIDHexString;
            satoshis: SatoshiValue;
            status: "completed" | "unprocessed" | "sending" | "unproven" | "unsigned" | "nosend" | "nonfinal";
            isOutgoing: boolean;
            description: DescriptionString5to50Characters;
            labels?: LabelStringUnder300Characters[];
            version: PositiveIntegerOrZero;
            lockTime: PositiveIntegerOrZero;
            inputs?: Array<{
                sourceOutpoint: OutpointString;
                sourceSatoshis: SatoshiValue;
                sourceLockingScript?: HexString;
                unlockingScript?: HexString;
                inputDescription: DescriptionString5to50Characters;
                sequenceNumber: PositiveIntegerOrZero;
            }>;
            outputs?: Array<{
                outputIndex: PositiveIntegerOrZero;
                satoshis: SatoshiValue;
                lockingScript?: HexString;
                spendable: boolean;
                outputDescription: DescriptionString5to50Characters;
                basket: BasketStringUnder300Characters;
                tags: OutputTagStringUnder300Characters[];
                customInstructions?: string;
            }>;
        }>;
    }>;
    internalizeAction: (args: {
        tx: AtomicBEEF;
        outputs: Array<{
            outputIndex: PositiveIntegerOrZero;
            protocol: "wallet payment" | "basket insertion";
            paymentRemittance?: {
                derivationPrefix: Base64String;
                derivationSuffix: Base64String;
                senderIdentityKey: PubKeyHex;
            };
            insertionRemittance?: {
                basket: BasketStringUnder300Characters;
                customInstructions?: string;
                tags?: OutputTagStringUnder300Characters[];
            };
        }>;
        description: DescriptionString5to50Characters;
        labels?: LabelStringUnder300Characters[];
        seekPermission?: BooleanDefaultTrue;
    }, originator?: OriginatorDomainNameString) => Promise<{
        accepted: true;
    }>;
    listOutputs: (args: {
        basket: BasketStringUnder300Characters;
        tags?: OutputTagStringUnder300Characters[];
        tagQueryMode?: "all" | "any";
        include?: "locking scripts" | "entire transactions";
        includeCustomInstructions?: BooleanDefaultFalse;
        includeTags?: BooleanDefaultFalse;
        includeLabels?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        seekPermission?: BooleanDefaultTrue;
    }, originator?: OriginatorDomainNameString) => Promise<{
        totalOutputs: PositiveIntegerOrZero;
        BEEF?: BEEF;
        outputs: Array<{
            outpoint: OutpointString;
            satoshis: SatoshiValue;
            lockingScript?: HexString;
            spendable: true;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
            labels?: LabelStringUnder300Characters[];
        }>;
    }>;
    relinquishOutput: (args: {
        basket: BasketStringUnder300Characters;
        output: OutpointString;
    }, originator?: OriginatorDomainNameString) => Promise<{
        relinquished: true;
    }>;
    getPublicKey: (args: {
        identityKey?: true;
        protocolID?: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID?: KeyIDStringUnder800Characters;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
        seekPermission?: BooleanDefaultTrue;
    }, originator?: OriginatorDomainNameString) => Promise<{
        publicKey: PubKeyHex;
    }>;
    revealCounterpartyKeyLinkage: (args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        privilegedReason?: DescriptionString5to50Characters;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString) => Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        revelationTime: ISOTimestampString;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
    }>;
    revealSpecificKeyLinkage: (args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString) => Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
        proofType: Byte;
    }>;
    encrypt: (args: {
        plaintext: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
        seekPermission?: BooleanDefaultTrue;
    }, originator?: OriginatorDomainNameString) => Promise<{
        ciphertext: Byte[];
    }>;
    decrypt: (args: {
        ciphertext: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
        seekPermission?: BooleanDefaultTrue;
    }, originator?: OriginatorDomainNameString) => Promise<{
        plaintext: Byte[];
    }>;
    createHmac: (args: {
        data: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
        seekPermission?: BooleanDefaultTrue;
    }, originator?: OriginatorDomainNameString) => Promise<{
        hmac: Byte[];
    }>;
    verifyHmac: (args: {
        data: Byte[];
        hmac: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
        seekPermission?: BooleanDefaultTrue;
    }, originator?: OriginatorDomainNameString) => Promise<{
        valid: true;
    }>;
    createSignature: (args: {
        data?: Byte[];
        hashToDirectlySign?: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
        seekPermission?: BooleanDefaultTrue;
    }, originator?: OriginatorDomainNameString) => Promise<{
        signature: Byte[];
    }>;
    verifySignature: (args: {
        data?: Byte[];
        hashToDirectlyVerify?: Byte[];
        signature: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
        privileged?: BooleanDefaultFalse;
        seekPermission?: BooleanDefaultTrue;
    }, originator?: OriginatorDomainNameString) => Promise<{
        valid: true;
    }>;
    acquireCertificate: (args: {
        type: Base64String;
        certifier: PubKeyHex;
        acquisitionProtocol: "direct" | "issuance";
        fields: Record<CertificateFieldNameUnder50Characters, string>;
        serialNumber?: Base64String;
        revocationOutpoint?: OutpointString;
        signature?: HexString;
        certifierUrl?: string;
        keyringRevealer?: PubKeyHex | "certifier";
        keyringForSubject?: Record<CertificateFieldNameUnder50Characters, Base64String>;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }, originator?: OriginatorDomainNameString) => Promise<{
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        certifier: PubKeyHex;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, string>;
    }>;
    listCertificates: (args: {
        certifiers: PubKeyHex[];
        types: Base64String[];
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }, originator?: OriginatorDomainNameString) => Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }>;
    proveCertificate: (args: {
        certificate: {
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, string>;
        };
        fieldsToReveal: CertificateFieldNameUnder50Characters[];
        verifier: PubKeyHex;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }, originator?: OriginatorDomainNameString) => Promise<{
        keyringForVerifier: Record<CertificateFieldNameUnder50Characters, Base64String>;
    }>;
    relinquishCertificate: (args: {
        type: Base64String;
        serialNumber: Base64String;
        certifier: PubKeyHex;
    }, originator?: OriginatorDomainNameString) => Promise<{
        relinquished: true;
    }>;
    discoverByIdentityKey: (args: {
        identityKey: PubKeyHex;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        seekPermission?: BooleanDefaultTrue;
    }, originator?: OriginatorDomainNameString) => Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Characters;
                iconUrl: EntityIconURLStringMax500Characters;
                description: DescriptionString5to50Characters;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }>;
    discoverByAttributes: (args: {
        attributes: Record<CertificateFieldNameUnder50Characters, string>;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        seekPermission?: BooleanDefaultTrue;
    }, originator?: OriginatorDomainNameString) => Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Characters;
                iconUrl: EntityIconURLStringMax500Characters;
                description: DescriptionString5to50Characters;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }>;
    isAuthenticated: (args: {}, originator?: OriginatorDomainNameString) => Promise<{
        authenticated: boolean;
    }>;
    waitForAuthentication: (args: {}, originator?: OriginatorDomainNameString) => Promise<{
        authenticated: true;
    }>;
    getHeight: (args: {}, originator?: OriginatorDomainNameString) => Promise<{
        height: PositiveInteger;
    }>;
    getHeaderForHeight: (args: {
        height: PositiveInteger;
    }, originator?: OriginatorDomainNameString) => Promise<{
        header: HexString;
    }>;
    getNetwork: (args: {}, originator?: OriginatorDomainNameString) => Promise<{
        network: "mainnet" | "testnet";
    }>;
    getVersion: (args: {}, originator?: OriginatorDomainNameString) => Promise<{
        version: VersionString7To30Characters;
    }>;
}
```

<details>

<summary>Interface Wallet Details</summary>

#### Property abortAction

Aborts a transaction that is in progress and has not yet been finalized or sent to the network.

```ts
abortAction: (args: {
    reference: Base64String;
}, originator?: OriginatorDomainNameString) => Promise<{
    aborted: true;
}>
```

#### Property acquireCertificate

Acquires an identity certificate, whether by acquiring one from the certifier or by directly receiving it.

```ts
acquireCertificate: (args: {
    type: Base64String;
    certifier: PubKeyHex;
    acquisitionProtocol: "direct" | "issuance";
    fields: Record<CertificateFieldNameUnder50Characters, string>;
    serialNumber?: Base64String;
    revocationOutpoint?: OutpointString;
    signature?: HexString;
    certifierUrl?: string;
    keyringRevealer?: PubKeyHex | "certifier";
    keyringForSubject?: Record<CertificateFieldNameUnder50Characters, Base64String>;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Characters;
}, originator?: OriginatorDomainNameString) => Promise<{
    type: Base64String;
    subject: PubKeyHex;
    serialNumber: Base64String;
    certifier: PubKeyHex;
    revocationOutpoint: OutpointString;
    signature: HexString;
    fields: Record<CertificateFieldNameUnder50Characters, string>;
}>
```

#### Property createAction

Creates a new Bitcoin transaction based on the provided inputs, outputs, labels, locks, and other options.

```ts
createAction: (args: {
    description: DescriptionString5to50Characters;
    inputBEEF?: BEEF;
    inputs?: Array<{
        outpoint: OutpointString;
        unlockingScript?: HexString;
        unlockingScriptLength?: PositiveInteger;
        inputDescription: DescriptionString5to50Characters;
        sequenceNumber?: PositiveIntegerOrZero;
    }>;
    outputs?: Array<{
        lockingScript: HexString;
        satoshis: SatoshiValue;
        outputDescription: DescriptionString5to50Characters;
        basket?: BasketStringUnder300Characters;
        customInstructions?: string;
        tags?: OutputTagStringUnder300Characters[];
    }>;
    lockTime?: PositiveIntegerOrZero;
    version?: PositiveIntegerOrZero;
    labels?: LabelStringUnder300Characters[];
    options?: {
        signAndProcess?: BooleanDefaultTrue;
        acceptDelayedBroadcast?: BooleanDefaultTrue;
        trustSelf?: "known";
        knownTxids?: TXIDHexString[];
        returnTXIDOnly?: BooleanDefaultFalse;
        noSend?: BooleanDefaultFalse;
        noSendChange?: OutpointString[];
        sendWith?: TXIDHexString[];
        randomizeOutputs?: BooleanDefaultTrue;
    };
}, originator?: OriginatorDomainNameString) => Promise<{
    txid?: TXIDHexString;
    tx?: AtomicBEEF;
    noSendChange?: OutpointString[];
    sendWithResults?: Array<{
        txid: TXIDHexString;
        status: "unproven" | "sending" | "failed";
    }>;
    signableTransaction?: {
        tx: AtomicBEEF;
        reference: Base64String;
    };
}>
```

#### Property createHmac

Creates an HMAC (Hash-based Message Authentication Code) based on the provided data, protocol, key ID, counterparty, and other factors.

```ts
createHmac: (args: {
    data: Byte[];
    protocolID: [
        0 | 1 | 2,
        ProtocolString5To400Characters
    ];
    keyID: KeyIDStringUnder800Characters;
    privilegedReason?: DescriptionString5to50Characters;
    counterparty?: PubKeyHex | "self" | "anyone";
    privileged?: BooleanDefaultFalse;
    seekPermission?: BooleanDefaultTrue;
}, originator?: OriginatorDomainNameString) => Promise<{
    hmac: Byte[];
}>
```

#### Property createSignature

Creates a digital signature for the provided data or hash using a specific protocol, key, and optionally considering privilege and counterparty.

```ts
createSignature: (args: {
    data?: Byte[];
    hashToDirectlySign?: Byte[];
    protocolID: [
        0 | 1 | 2,
        ProtocolString5To400Characters
    ];
    keyID: KeyIDStringUnder800Characters;
    privilegedReason?: DescriptionString5to50Characters;
    counterparty?: PubKeyHex | "self" | "anyone";
    privileged?: BooleanDefaultFalse;
    seekPermission?: BooleanDefaultTrue;
}, originator?: OriginatorDomainNameString) => Promise<{
    signature: Byte[];
}>
```

#### Property decrypt

Decrypts the provided ciphertext using derived keys, based on the protocol ID, key ID, counterparty, and other factors.

```ts
decrypt: (args: {
    ciphertext: Byte[];
    protocolID: [
        0 | 1 | 2,
        ProtocolString5To400Characters
    ];
    keyID: KeyIDStringUnder800Characters;
    privilegedReason?: DescriptionString5to50Characters;
    counterparty?: PubKeyHex | "self" | "anyone";
    privileged?: BooleanDefaultFalse;
    seekPermission?: BooleanDefaultTrue;
}, originator?: OriginatorDomainNameString) => Promise<{
    plaintext: Byte[];
}>
```

#### Property discoverByAttributes

Discovers identity certificates belonging to other users, where the documents contain specific attributes, issued by a trusted entity.

```ts
discoverByAttributes: (args: {
    attributes: Record<CertificateFieldNameUnder50Characters, string>;
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    seekPermission?: BooleanDefaultTrue;
}, originator?: OriginatorDomainNameString) => Promise<{
    totalCertificates: PositiveIntegerOrZero;
    certificates: Array<{
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        certifier: PubKeyHex;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
        certifierInfo: {
            name: EntityNameStringMax100Characters;
            iconUrl: EntityIconURLStringMax500Characters;
            description: DescriptionString5to50Characters;
            trust: PositiveIntegerMax10;
        };
        publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
        decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
    }>;
}>
```

#### Property discoverByIdentityKey

Discovers identity certificates, issued to a given identity key by a trusted entity.

```ts
discoverByIdentityKey: (args: {
    identityKey: PubKeyHex;
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    seekPermission?: BooleanDefaultTrue;
}, originator?: OriginatorDomainNameString) => Promise<{
    totalCertificates: PositiveIntegerOrZero;
    certificates: Array<{
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        certifier: PubKeyHex;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
        certifierInfo: {
            name: EntityNameStringMax100Characters;
            iconUrl: EntityIconURLStringMax500Characters;
            description: DescriptionString5to50Characters;
            trust: PositiveIntegerMax10;
        };
        publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
        decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
    }>;
}>
```

#### Property encrypt

Encrypts the provided plaintext data using derived keys, based on the protocol ID, key ID, counterparty, and other factors.

```ts
encrypt: (args: {
    plaintext: Byte[];
    protocolID: [
        0 | 1 | 2,
        ProtocolString5To400Characters
    ];
    keyID: KeyIDStringUnder800Characters;
    privilegedReason?: DescriptionString5to50Characters;
    counterparty?: PubKeyHex | "self" | "anyone";
    privileged?: BooleanDefaultFalse;
    seekPermission?: BooleanDefaultTrue;
}, originator?: OriginatorDomainNameString) => Promise<{
    ciphertext: Byte[];
}>
```

#### Property getHeaderForHeight

Retrieves the block header of a block at a specified height.

```ts
getHeaderForHeight: (args: {
    height: PositiveInteger;
}, originator?: OriginatorDomainNameString) => Promise<{
    header: HexString;
}>
```

#### Property getHeight

Retrieves the current height of the blockchain.

```ts
getHeight: (args: {}, originator?: OriginatorDomainNameString) => Promise<{
    height: PositiveInteger;
}>
```

#### Property getNetwork

Retrieves the Bitcoin network the client is using (mainnet or testnet).

```ts
getNetwork: (args: {}, originator?: OriginatorDomainNameString) => Promise<{
    network: "mainnet" | "testnet";
}>
```

#### Property getPublicKey

Retrieves a derived or identity public key based on the requested protocol, key ID, counterparty, and other factors.

```ts
getPublicKey: (args: {
    identityKey?: true;
    protocolID?: [
        0 | 1 | 2,
        ProtocolString5To400Characters
    ];
    keyID?: KeyIDStringUnder800Characters;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Characters;
    counterparty?: PubKeyHex | "self" | "anyone";
    forSelf?: BooleanDefaultFalse;
    seekPermission?: BooleanDefaultTrue;
}, originator?: OriginatorDomainNameString) => Promise<{
    publicKey: PubKeyHex;
}>
```

#### Property getVersion

Retrieves the current version string of the wallet.

```ts
getVersion: (args: {}, originator?: OriginatorDomainNameString) => Promise<{
    version: VersionString7To30Characters;
}>
```

#### Property internalizeAction

Submits a transaction to be internalized and optionally labeled, outputs paid to the wallet balance, inserted into baskets, and/or tagged.

```ts
internalizeAction: (args: {
    tx: AtomicBEEF;
    outputs: Array<{
        outputIndex: PositiveIntegerOrZero;
        protocol: "wallet payment" | "basket insertion";
        paymentRemittance?: {
            derivationPrefix: Base64String;
            derivationSuffix: Base64String;
            senderIdentityKey: PubKeyHex;
        };
        insertionRemittance?: {
            basket: BasketStringUnder300Characters;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
        };
    }>;
    description: DescriptionString5to50Characters;
    labels?: LabelStringUnder300Characters[];
    seekPermission?: BooleanDefaultTrue;
}, originator?: OriginatorDomainNameString) => Promise<{
    accepted: true;
}>
```

#### Property isAuthenticated

Checks the authentication status of the user.

```ts
isAuthenticated: (args: {}, originator?: OriginatorDomainNameString) => Promise<{
    authenticated: boolean;
}>
```

#### Property listActions

Lists all transactions matching the specified labels.

```ts
listActions: (args: {
    labels: LabelStringUnder300Characters[];
    labelQueryMode?: "any" | "all";
    includeLabels?: BooleanDefaultFalse;
    includeInputs?: BooleanDefaultFalse;
    includeInputSourceLockingScripts?: BooleanDefaultFalse;
    includeInputUnlockingScripts?: BooleanDefaultFalse;
    includeOutputs?: BooleanDefaultFalse;
    includeOutputLockingScripts?: BooleanDefaultFalse;
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    seekPermission?: BooleanDefaultTrue;
}, originator?: OriginatorDomainNameString) => Promise<{
    totalActions: PositiveIntegerOrZero;
    actions: Array<{
        txid: TXIDHexString;
        satoshis: SatoshiValue;
        status: "completed" | "unprocessed" | "sending" | "unproven" | "unsigned" | "nosend" | "nonfinal";
        isOutgoing: boolean;
        description: DescriptionString5to50Characters;
        labels?: LabelStringUnder300Characters[];
        version: PositiveIntegerOrZero;
        lockTime: PositiveIntegerOrZero;
        inputs?: Array<{
            sourceOutpoint: OutpointString;
            sourceSatoshis: SatoshiValue;
            sourceLockingScript?: HexString;
            unlockingScript?: HexString;
            inputDescription: DescriptionString5to50Characters;
            sequenceNumber: PositiveIntegerOrZero;
        }>;
        outputs?: Array<{
            outputIndex: PositiveIntegerOrZero;
            satoshis: SatoshiValue;
            lockingScript?: HexString;
            spendable: boolean;
            outputDescription: DescriptionString5to50Characters;
            basket: BasketStringUnder300Characters;
            tags: OutputTagStringUnder300Characters[];
            customInstructions?: string;
        }>;
    }>;
}>
```

#### Property listCertificates

Lists identity certificates belonging to the user, filtered by certifier(s) and type(s).

```ts
listCertificates: (args: {
    certifiers: PubKeyHex[];
    types: Base64String[];
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Characters;
}, originator?: OriginatorDomainNameString) => Promise<{
    totalCertificates: PositiveIntegerOrZero;
    certificates: Array<{
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        certifier: PubKeyHex;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, string>;
    }>;
}>
```

#### Property listOutputs

Lists the spendable outputs kept within a specific basket, optionally tagged with specific labels.

```ts
listOutputs: (args: {
    basket: BasketStringUnder300Characters;
    tags?: OutputTagStringUnder300Characters[];
    tagQueryMode?: "all" | "any";
    include?: "locking scripts" | "entire transactions";
    includeCustomInstructions?: BooleanDefaultFalse;
    includeTags?: BooleanDefaultFalse;
    includeLabels?: BooleanDefaultFalse;
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    seekPermission?: BooleanDefaultTrue;
}, originator?: OriginatorDomainNameString) => Promise<{
    totalOutputs: PositiveIntegerOrZero;
    BEEF?: BEEF;
    outputs: Array<{
        outpoint: OutpointString;
        satoshis: SatoshiValue;
        lockingScript?: HexString;
        spendable: true;
        customInstructions?: string;
        tags?: OutputTagStringUnder300Characters[];
        labels?: LabelStringUnder300Characters[];
    }>;
}>
```

#### Property proveCertificate

Proves select fields of an identity certificate, as specified, when requested by a verifier.

```ts
proveCertificate: (args: {
    certificate: {
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        certifier: PubKeyHex;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, string>;
    };
    fieldsToReveal: CertificateFieldNameUnder50Characters[];
    verifier: PubKeyHex;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Characters;
}, originator?: OriginatorDomainNameString) => Promise<{
    keyringForVerifier: Record<CertificateFieldNameUnder50Characters, Base64String>;
}>
```

#### Property relinquishCertificate

Relinquishes an identity certificate, removing it from the wallet regardless of whether the revocation outpoint has become spent.

```ts
relinquishCertificate: (args: {
    type: Base64String;
    serialNumber: Base64String;
    certifier: PubKeyHex;
}, originator?: OriginatorDomainNameString) => Promise<{
    relinquished: true;
}>
```

#### Property relinquishOutput

Relinquish an output out of a basket, removing it from tracking without spending it.

```ts
relinquishOutput: (args: {
    basket: BasketStringUnder300Characters;
    output: OutpointString;
}, originator?: OriginatorDomainNameString) => Promise<{
    relinquished: true;
}>
```

#### Property revealCounterpartyKeyLinkage

Reveals the key linkage between ourselves and a counterparty, to a particular verifier, across all interactions with the counterparty.

```ts
revealCounterpartyKeyLinkage: (args: {
    counterparty: PubKeyHex;
    verifier: PubKeyHex;
    privilegedReason?: DescriptionString5to50Characters;
    privileged?: BooleanDefaultFalse;
}, originator?: OriginatorDomainNameString) => Promise<{
    prover: PubKeyHex;
    verifier: PubKeyHex;
    counterparty: PubKeyHex;
    revelationTime: ISOTimestampString;
    encryptedLinkage: Byte[];
    encryptedLinkageProof: Byte[];
}>
```

#### Property revealSpecificKeyLinkage

Reveals the key linkage between ourselves and a counterparty, to a particular verifier, with respect to a specific interaction.

```ts
revealSpecificKeyLinkage: (args: {
    counterparty: PubKeyHex;
    verifier: PubKeyHex;
    protocolID: [
        0 | 1 | 2,
        ProtocolString5To400Characters
    ];
    keyID: KeyIDStringUnder800Characters;
    privilegedReason?: DescriptionString5to50Characters;
    privileged?: BooleanDefaultFalse;
}, originator?: OriginatorDomainNameString) => Promise<{
    prover: PubKeyHex;
    verifier: PubKeyHex;
    counterparty: PubKeyHex;
    protocolID: [
        0 | 1 | 2,
        ProtocolString5To400Characters
    ];
    keyID: KeyIDStringUnder800Characters;
    encryptedLinkage: Byte[];
    encryptedLinkageProof: Byte[];
    proofType: Byte;
}>
```

#### Property signAction

Signs a transaction previously created using `createAction`.

```ts
signAction: (args: {
    spends: Record<PositiveIntegerOrZero, {
        unlockingScript: HexString;
        sequenceNumber?: PositiveIntegerOrZero;
    }>;
    reference: Base64String;
    options?: {
        acceptDelayedBroadcast?: BooleanDefaultTrue;
        returnTXIDOnly?: BooleanDefaultFalse;
        noSend?: BooleanDefaultFalse;
        sendWith?: TXIDHexString[];
    };
}, originator?: OriginatorDomainNameString) => Promise<{
    txid?: TXIDHexString;
    tx?: AtomicBEEF;
    sendWithResults?: Array<{
        txid: TXIDHexString;
        status: "unproven" | "sending" | "failed";
    }>;
}>
```

#### Property verifyHmac

Verifies an HMAC (Hash-based Message Authentication Code) based on the provided data, protocol, key ID, counterparty, and other factors.

```ts
verifyHmac: (args: {
    data: Byte[];
    hmac: Byte[];
    protocolID: [
        0 | 1 | 2,
        ProtocolString5To400Characters
    ];
    keyID: KeyIDStringUnder800Characters;
    privilegedReason?: DescriptionString5to50Characters;
    counterparty?: PubKeyHex | "self" | "anyone";
    privileged?: BooleanDefaultFalse;
    seekPermission?: BooleanDefaultTrue;
}, originator?: OriginatorDomainNameString) => Promise<{
    valid: true;
}>
```

#### Property verifySignature

Verifies a digital signature for the provided data or hash using a specific protocol, key, and optionally considering privilege and counterparty.

```ts
verifySignature: (args: {
    data?: Byte[];
    hashToDirectlyVerify?: Byte[];
    signature: Byte[];
    protocolID: [
        0 | 1 | 2,
        ProtocolString5To400Characters
    ];
    keyID: KeyIDStringUnder800Characters;
    privilegedReason?: DescriptionString5to50Characters;
    counterparty?: PubKeyHex | "self" | "anyone";
    forSelf?: BooleanDefaultFalse;
    privileged?: BooleanDefaultFalse;
    seekPermission?: BooleanDefaultTrue;
}, originator?: OriginatorDomainNameString) => Promise<{
    valid: true;
}>
```

#### Property waitForAuthentication

Continuously waits until the user is authenticated, returning the result once confirmed.

```ts
waitForAuthentication: (args: {}, originator?: OriginatorDomainNameString) => Promise<{
    authenticated: true;
}>
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Interface: WalletWire

A Wallet Wire is an abstraction over a raw transport medium where binary data can be sent to and subsequently received from a wallet.

```ts
export default interface WalletWire {
    transmitToWallet: (message: number[]) => Promise<number[]>;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
## Classes

| |
| --- |
| [CachedKeyDeriver](#class-cachedkeyderiver) |
| [HTTPWalletWire](#class-httpwalletwire) |
| [KeyDeriver](#class-keyderiver) |
| [ProtoWallet](#class-protowallet) |
| [WalletSDK](#class-walletsdk) |
| [WalletWireTransceiver](#class-walletwiretransceiver) |
| [WindowCWISubstrate](#class-windowcwisubstrate) |
| [XDMSubstrate](#class-xdmsubstrate) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---

### Class: KeyDeriver

Class responsible for deriving various types of keys using a root private key.
It supports deriving public and private keys, symmetric keys, and revealing key linkages.

```ts
export default class KeyDeriver {
    rootKey: PrivateKey;
    constructor(rootKey: PrivateKey | "anyone") 
    derivePublicKey(protocolID: [
        0 | 1 | 2,
        string
    ], keyID: string, counterparty: PublicKey | string | "self" | "anyone", forSelf: boolean = false): PublicKey 
    derivePrivateKey(protocolID: [
        0 | 1 | 2,
        string
    ], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): PrivateKey 
    deriveSymmetricKey(protocolID: [
        0 | 1 | 2,
        string
    ], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): SymmetricKey 
    revealCounterpartySecret(counterparty: PublicKey | string | "self" | "anyone"): number[] 
    revealSpecificSecret(counterparty: PublicKey | string | "self" | "anyone", protocolID: [
        0 | 1 | 2,
        string
    ], keyID: string): number[] 
}
```

<details>

<summary>Class KeyDeriver Details</summary>

#### Constructor

Initializes the KeyDeriver instance with a root private key.

```ts
constructor(rootKey: PrivateKey | "anyone") 
```

Argument Details

+ **rootKey**
  + The root private key or the string 'anyone'.

#### Method derivePrivateKey

Derives a private key based on protocol ID, key ID, and counterparty.

```ts
derivePrivateKey(protocolID: [
    0 | 1 | 2,
    string
], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): PrivateKey 
```

Returns

- The derived private key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

#### Method derivePublicKey

Derives a public key based on protocol ID, key ID, and counterparty.

```ts
derivePublicKey(protocolID: [
    0 | 1 | 2,
    string
], keyID: string, counterparty: PublicKey | string | "self" | "anyone", forSelf: boolean = false): PublicKey 
```

Returns

- The derived public key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').
+ **forSelf**
  + Whether deriving for self.

#### Method deriveSymmetricKey

Derives a symmetric key based on protocol ID, key ID, and counterparty.
Note: Symmetric keys should not be derivable by everyone due to security risks.

```ts
deriveSymmetricKey(protocolID: [
    0 | 1 | 2,
    string
], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): SymmetricKey 
```

Returns

- The derived symmetric key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

Throws

- Throws an error if attempting to derive a symmetric key for 'anyone'.

#### Method revealCounterpartySecret

Reveals the shared secret between the root key and the counterparty.
Note: This should not be used for 'self'.

```ts
revealCounterpartySecret(counterparty: PublicKey | string | "self" | "anyone"): number[] 
```

Returns

- The shared secret as a number array.

Argument Details

+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

Throws

- Throws an error if attempting to reveal a shared secret for 'self'.

#### Method revealSpecificSecret

Reveals the specific key association for a given protocol ID, key ID, and counterparty.

```ts
revealSpecificSecret(counterparty: PublicKey | string | "self" | "anyone", protocolID: [
    0 | 1 | 2,
    string
], keyID: string): number[] 
```

Returns

- The specific key association as a number array.

Argument Details

+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').
+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Class: CachedKeyDeriver

A cached version of KeyDeriver that caches the results of key derivation methods.
This is useful for optimizing performance when the same keys are derived multiple times.
It supports configurable cache size with sane defaults and maintains cache entries using LRU (Least Recently Used) eviction policy.

```ts
export default class CachedKeyDeriver {
    constructor(rootKey: PrivateKey | "anyone", options?: {
        maxCacheSize?: number;
    }) 
    derivePublicKey(protocolID: [
        0 | 1 | 2,
        string
    ], keyID: string, counterparty: PublicKey | string | "self" | "anyone", forSelf: boolean = false): PublicKey 
    derivePrivateKey(protocolID: [
        0 | 1 | 2,
        string
    ], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): PrivateKey 
    deriveSymmetricKey(protocolID: [
        0 | 1 | 2,
        string
    ], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): SymmetricKey 
    revealCounterpartySecret(counterparty: PublicKey | string | "self" | "anyone"): number[] 
    revealSpecificSecret(counterparty: PublicKey | string | "self" | "anyone", protocolID: [
        0 | 1 | 2,
        string
    ], keyID: string): number[] 
}
```

<details>

<summary>Class CachedKeyDeriver Details</summary>

#### Constructor

Initializes the CachedKeyDeriver instance with a root private key and optional cache settings.

```ts
constructor(rootKey: PrivateKey | "anyone", options?: {
    maxCacheSize?: number;
}) 
```

Argument Details

+ **rootKey**
  + The root private key or the string 'anyone'.
+ **options**
  + Optional settings for the cache.

#### Method derivePrivateKey

Derives a private key based on protocol ID, key ID, and counterparty.
Caches the result for future calls with the same parameters.

```ts
derivePrivateKey(protocolID: [
    0 | 1 | 2,
    string
], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): PrivateKey 
```

Returns

- The derived private key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

#### Method derivePublicKey

Derives a public key based on protocol ID, key ID, and counterparty.
Caches the result for future calls with the same parameters.

```ts
derivePublicKey(protocolID: [
    0 | 1 | 2,
    string
], keyID: string, counterparty: PublicKey | string | "self" | "anyone", forSelf: boolean = false): PublicKey 
```

Returns

- The derived public key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').
+ **forSelf**
  + Whether deriving for self.

#### Method deriveSymmetricKey

Derives a symmetric key based on protocol ID, key ID, and counterparty.
Caches the result for future calls with the same parameters.

```ts
deriveSymmetricKey(protocolID: [
    0 | 1 | 2,
    string
], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): SymmetricKey 
```

Returns

- The derived symmetric key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

Throws

- Throws an error if attempting to derive a symmetric key for 'anyone'.

#### Method revealCounterpartySecret

Reveals the shared secret between the root key and the counterparty.
Caches the result for future calls with the same parameters.

```ts
revealCounterpartySecret(counterparty: PublicKey | string | "self" | "anyone"): number[] 
```

Returns

- The shared secret as a number array.

Argument Details

+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

Throws

- Throws an error if attempting to reveal a shared secret for 'self'.

#### Method revealSpecificSecret

Reveals the specific key association for a given protocol ID, key ID, and counterparty.
Caches the result for future calls with the same parameters.

```ts
revealSpecificSecret(counterparty: PublicKey | string | "self" | "anyone", protocolID: [
    0 | 1 | 2,
    string
], keyID: string): number[] 
```

Returns

- The specific key association as a number array.

Argument Details

+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').
+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Class: ProtoWallet

A ProtoWallet is a structure that fulfills the Wallet interface, capable of performing all foundational cryptographic operations. It can derive keys, create signatures, facilitate encryption and HMAC operations, and reveal key linkages. However, ProtoWallet does not create transactions, manage outputs, interact with the blockchain, enable the management of identity certificates, or store any data.

```ts
export default class ProtoWallet implements Wallet {
    keyDeriver: KeyDeriver;
    privilegedError: string = "ProtoWallet is a single-keyring wallet, operating without context about whether its configured keyring is privileged.";
    constructor(rootKey: PrivateKey | "anyone", KeyDeriverClass = KeyDeriver) 
    async createAction(args: {
        description: DescriptionString5to50Characters;
        inputs?: Array<{
            tx?: BEEF;
            outpoint: OutpointString;
            unlockingScript?: HexString;
            unlockingScriptLength?: PositiveInteger;
            inputDescription: DescriptionString5to50Characters;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        outputs?: Array<{
            lockingScript: HexString;
            satoshis: SatoshiValue;
            outputDescription: DescriptionString5to50Characters;
            basket?: BasketStringUnder300Characters;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
        }>;
        lockTime?: PositiveIntegerOrZero;
        version?: PositiveIntegerOrZero;
        labels?: LabelStringUnder300Characters[];
        options?: {
            signAndProcess?: BooleanDefaultTrue;
            acceptDelayedBroadcast?: BooleanDefaultTrue;
            trustSelf?: "known";
            knownTxids?: TXIDHexString[];
            returnTXIDOnly?: BooleanDefaultFalse;
            noSend?: BooleanDefaultFalse;
            noSendChange?: OutpointString[];
            sendWith?: TXIDHexString[];
            randomizeOutputs?: BooleanDefaultTrue;
        };
    }, originator?: OriginatorDomainNameString): Promise<{
        txid?: TXIDHexString;
        tx?: BEEF;
        noSendChange?: OutpointString[];
        sendWithResults?: Array<{
            txid: TXIDHexString;
            status: "unproven" | "sending" | "failed";
        }>;
        signableTransaction?: {
            tx: BEEF;
            reference: Base64String;
        };
    }> 
    async signAction(args: {
        spends: Record<PositiveIntegerOrZero, {
            unlockingScript: HexString;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        reference: Base64String;
        options?: {
            acceptDelayedBroadcast?: BooleanDefaultTrue;
            returnTXIDOnly?: BooleanDefaultFalse;
            noSend?: BooleanDefaultFalse;
            noSendChange?: OutpointString[];
            sendWith?: TXIDHexString[];
        };
    }, originator?: OriginatorDomainNameString): Promise<{
        txid?: TXIDHexString;
        tx?: BEEF;
        noSendChange?: OutpointString[];
        sendWithResults?: Array<{
            txid: TXIDHexString;
            status: "unproven" | "sending" | "failed";
        }>;
    }> 
    async abortAction(args: {
        reference: Base64String;
    }, originator?: OriginatorDomainNameString): Promise<{
        aborted: true;
    }> 
    async listActions(args: {
        labels: LabelStringUnder300Characters[];
        labelQueryMode?: "any" | "all";
        includeLabels?: BooleanDefaultFalse;
        includeInputs?: BooleanDefaultFalse;
        includeInputSourceLockingScripts?: BooleanDefaultFalse;
        includeInputUnlockingScripts?: BooleanDefaultFalse;
        includeOutputs?: BooleanDefaultFalse;
        includeOutputLockingScripts?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalActions: PositiveIntegerOrZero;
        actions: Array<{
            txid: TXIDHexString;
            satoshis: SatoshiValue;
            status: "completed" | "unprocessed" | "sending" | "unproven" | "unsigned" | "nosend" | "nonfinal";
            isOutgoing: boolean;
            description: DescriptionString5to50Characters;
            labels?: LabelStringUnder300Characters[];
            version: PositiveIntegerOrZero;
            lockTime: PositiveIntegerOrZero;
            inputs?: Array<{
                sourceOutpoint: OutpointString;
                sourceSatoshis: SatoshiValue;
                sourceLockingScript?: HexString;
                unlockingScript?: HexString;
                inputDescription: DescriptionString5to50Characters;
                sequenceNumber: PositiveIntegerOrZero;
            }>;
            outputs?: Array<{
                outputIndex: PositiveIntegerOrZero;
                satoshis: SatoshiValue;
                lockingScript?: HexString;
                spendable: boolean;
                outputDescription: DescriptionString5to50Characters;
                basket: BasketStringUnder300Characters;
                tags: OutputTagStringUnder300Characters[];
                customInstructions?: string;
            }>;
        }>;
    }> 
    async internalizeAction(args: {
        tx: BEEF;
        outputs: Array<{
            outputIndex: PositiveIntegerOrZero;
            protocol: "wallet payment" | "basket insertion";
            paymentRemittance?: {
                derivationPrefix: Base64String;
                derivationSuffix: Base64String;
                senderIdentityKey: PubKeyHex;
            };
            insertionRemittance?: {
                basket: BasketStringUnder300Characters;
                customInstructions?: string;
                tags?: OutputTagStringUnder300Characters[];
            };
        }>;
        description: DescriptionString5to50Characters;
        labels?: LabelStringUnder300Characters[];
    }, originator?: OriginatorDomainNameString): Promise<{
        accepted: true;
    }> 
    async listOutputs(args: {
        basket: BasketStringUnder300Characters;
        tags?: OutputTagStringUnder300Characters[];
        tagQueryMode?: "all" | "any";
        include?: "locking scripts" | "entire transactions";
        includeCustomInstructions?: BooleanDefaultFalse;
        includeTags?: BooleanDefaultFalse;
        includeLabels?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalOutputs: PositiveIntegerOrZero;
        outputs: Array<{
            outpoint: OutpointString;
            satoshis: SatoshiValue;
            lockingScript?: HexString;
            tx?: BEEF;
            spendable: true;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
            labels?: LabelStringUnder300Characters[];
        }>;
    }> 
    async relinquishOutput(args: {
        basket: BasketStringUnder300Characters;
        output: OutpointString;
    }, originator?: OriginatorDomainNameString): Promise<{
        relinquished: true;
    }> 
    async getPublicKey(args: {
        identityKey?: true;
        protocolID?: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID?: KeyIDStringUnder800Characters;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        publicKey: PubKeyHex;
    }> 
    async revealCounterpartyKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        privilegedReason?: DescriptionString5to50Characters;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        revelationTime: ISOTimestampString;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
    }> 
    async revealSpecificKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
        proofType: Byte;
    }> 
    async encrypt(args: {
        plaintext: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        ciphertext: Byte[];
    }> 
    async decrypt(args: {
        ciphertext: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        plaintext: Byte[];
    }> 
    async createHmac(args: {
        data: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        hmac: Byte[];
    }> 
    async verifyHmac(args: {
        data: Byte[];
        hmac: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        valid: true;
    }> 
    async createSignature(args: {
        data?: Byte[];
        hashToDirectlySign?: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        signature: Byte[];
    }> 
    async verifySignature(args: {
        data?: Byte[];
        hashToDirectlyVerify?: Byte[];
        signature: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        valid: true;
    }> 
    async acquireCertificate(args: {
        type: Base64String;
        certifier: PubKeyHex;
        acquisitionProtocol: "direct" | "issuance";
        fields: Record<CertificateFieldNameUnder50Characters, string>;
        serialNumber?: Base64String;
        revocationOutpoint?: OutpointString;
        signature?: HexString;
        certifierUrl?: string;
        keyringRevealer?: PubKeyHex | "certifier";
        keyringForSubject?: Record<CertificateFieldNameUnder50Characters, Base64String>;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }, originator?: OriginatorDomainNameString): Promise<{
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        certifier: PubKeyHex;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, string>;
    }> 
    async listCertificates(args: {
        certifiers: PubKeyHex[];
        types: Base64String[];
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async proveCertificate(args: {
        certificate: {
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, string>;
        };
        fieldsToReveal: CertificateFieldNameUnder50Characters[];
        verifier: PubKeyHex;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }, originator?: OriginatorDomainNameString): Promise<{
        keyringForVerifier: Record<CertificateFieldNameUnder50Characters, Base64String>;
    }> 
    async relinquishCertificate(args: {
        type: Base64String;
        serialNumber: Base64String;
        certifier: PubKeyHex;
    }, originator?: OriginatorDomainNameString): Promise<{
        relinquished: true;
    }> 
    async discoverByIdentityKey(args: {
        identityKey: PubKeyHex;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Characters;
                iconUrl: EntityIconURLStringMax500Characters;
                description: DescriptionString5to50Characters;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async discoverByAttributes(args: {
        attributes: Record<CertificateFieldNameUnder50Characters, string>;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Characters;
                iconUrl: EntityIconURLStringMax500Characters;
                description: DescriptionString5to50Characters;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async isAuthenticated(args: {}, originator?: OriginatorDomainNameString): Promise<{
        authenticated: boolean;
    }> 
    async waitForAuthentication(args: {}, originator?: OriginatorDomainNameString): Promise<{
        authenticated: true;
    }> 
    async getHeight(args: {}, originator?: OriginatorDomainNameString): Promise<{
        height: PositiveInteger;
    }> 
    async getHeaderForHeight(args: {
        height: PositiveInteger;
    }, originator?: OriginatorDomainNameString): Promise<{
        header: HexString;
    }> 
    async getNetwork(args: {}, originator?: OriginatorDomainNameString): Promise<{
        network: "mainnet" | "testnet";
    }> 
    async getVersion(args: {}, originator?: OriginatorDomainNameString): Promise<{
        version: VersionString7To30Characters;
    }> 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Class: WindowCWISubstrate

Facilitates wallet operations over the winow.CWI interface.

```ts
export default class WindowCWISubstrate implements Wallet {
    constructor() 
    async createAction(args: {
        description: DescriptionString5to50Characters;
        inputs?: Array<{
            tx?: BEEF;
            outpoint: OutpointString;
            unlockingScript?: HexString;
            unlockingScriptLength?: PositiveInteger;
            inputDescription: DescriptionString5to50Characters;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        outputs?: Array<{
            lockingScript: HexString;
            satoshis: SatoshiValue;
            outputDescription: DescriptionString5to50Characters;
            basket?: BasketStringUnder300Characters;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
        }>;
        lockTime?: PositiveIntegerOrZero;
        version?: PositiveIntegerOrZero;
        labels?: LabelStringUnder300Characters[];
        options?: {
            signAndProcess?: BooleanDefaultTrue;
            acceptDelayedBroadcast?: BooleanDefaultTrue;
            trustSelf?: "known";
            knownTxids?: TXIDHexString[];
            returnTXIDOnly?: BooleanDefaultFalse;
            noSend?: BooleanDefaultFalse;
            noSendChange?: OutpointString[];
            sendWith?: TXIDHexString[];
        };
    }, originator?: OriginatorDomainNameString): Promise<{
        txid?: TXIDHexString;
        tx?: BEEF;
        noSendChange?: OutpointString[];
        sendWithResults?: Array<{
            txid: TXIDHexString;
            status: "unproven" | "sending" | "failed";
        }>;
        signableTransaction?: {
            tx: BEEF;
            reference: Base64String;
        };
    }> 
    async signAction(args: {
        spends: Record<PositiveIntegerOrZero, {
            unlockingScript: HexString;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        reference: Base64String;
        options?: {
            acceptDelayedBroadcast?: BooleanDefaultTrue;
            returnTXIDOnly?: BooleanDefaultFalse;
            noSend?: BooleanDefaultFalse;
            noSendChange?: OutpointString[];
            sendWith: TXIDHexString[];
        };
    }, originator?: OriginatorDomainNameString): Promise<{
        txid?: TXIDHexString;
        tx?: BEEF;
        noSendChange?: OutpointString[];
        sendWithResults?: Array<{
            txid: TXIDHexString;
            status: "unproven" | "sending" | "failed";
        }>;
    }> 
    async abortAction(args: {
        reference: Base64String;
    }, originator?: OriginatorDomainNameString): Promise<{
        aborted: true;
    }> 
    async listActions(args: {
        labels: LabelStringUnder300Characters[];
        labelQueryMode?: "any" | "all";
        includeLabels?: BooleanDefaultFalse;
        includeInputs?: BooleanDefaultFalse;
        includeInputSourceLockingScripts?: BooleanDefaultFalse;
        includeInputUnlockingScripts?: BooleanDefaultFalse;
        includeOutputs?: BooleanDefaultFalse;
        includeOutputLockingScripts?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalActions: PositiveIntegerOrZero;
        actions: Array<{
            txid: TXIDHexString;
            satoshis: SatoshiValue;
            status: "completed" | "unprocessed" | "sending" | "unproven" | "unsigned" | "nosend" | "nonfinal";
            isOutgoing: boolean;
            description: DescriptionString5to50Characters;
            labels?: LabelStringUnder300Characters[];
            version: PositiveIntegerOrZero;
            lockTime: PositiveIntegerOrZero;
            inputs?: Array<{
                sourceOutpoint: OutpointString;
                sourceSatoshis: SatoshiValue;
                sourceLockingScript?: HexString;
                unlockingScript?: HexString;
                inputDescription: DescriptionString5to50Characters;
                sequenceNumber: PositiveIntegerOrZero;
            }>;
            outputs?: Array<{
                outputIndex: PositiveIntegerOrZero;
                satoshis: SatoshiValue;
                lockingScript?: HexString;
                spendable: boolean;
                outputDescription: DescriptionString5to50Characters;
                basket: BasketStringUnder300Characters;
                tags: OutputTagStringUnder300Characters[];
                customInstructions?: string;
            }>;
        }>;
    }> 
    async internalizeAction(args: {
        tx: BEEF;
        outputs: Array<{
            outputIndex: PositiveIntegerOrZero;
            protocol: "wallet payment" | "basket insertion";
            paymentRemittance?: {
                derivationPrefix: Base64String;
                derivationSuffix: Base64String;
                senderIdentityKey: PubKeyHex;
            };
            insertionRemittance?: {
                basket: BasketStringUnder300Characters;
                customInstructions?: string;
                tags?: OutputTagStringUnder300Characters[];
            };
        }>;
        description: DescriptionString5to50Characters;
        labels?: LabelStringUnder300Characters[];
    }, originator?: OriginatorDomainNameString): Promise<{
        accepted: true;
    }> 
    async listOutputs(args: {
        basket: BasketStringUnder300Characters;
        tags?: OutputTagStringUnder300Characters[];
        tagQueryMode?: "all" | "any";
        include?: "locking scripts" | "entire transactions";
        includeCustomInstructions?: BooleanDefaultFalse;
        includeTags?: BooleanDefaultFalse;
        includeLabels?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalOutputs: PositiveIntegerOrZero;
        outputs: Array<{
            outpoint: OutpointString;
            satoshis: SatoshiValue;
            lockingScript?: HexString;
            tx?: BEEF;
            spendable: true;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
            labels?: LabelStringUnder300Characters[];
        }>;
    }> 
    async relinquishOutput(args: {
        basket: BasketStringUnder300Characters;
        output: OutpointString;
    }, originator?: OriginatorDomainNameString): Promise<{
        relinquished: true;
    }> 
    async getPublicKey(args: {
        identityKey?: true;
        protocolID?: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID?: KeyIDStringUnder800Characters;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        publicKey: PubKeyHex;
    }> 
    async revealCounterpartyKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        privilegedReason?: DescriptionString5to50Characters;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        revelationTime: ISOTimestampString;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
    }> 
    async revealSpecificKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
        proofType: Byte;
    }> 
    async encrypt(args: {
        plaintext: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        ciphertext: Byte[];
    }> 
    async decrypt(args: {
        ciphertext: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        plaintext: Byte[];
    }> 
    async createHmac(args: {
        data: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        hmac: Byte[];
    }> 
    async verifyHmac(args: {
        data: Byte[];
        hmac: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        valid: true;
    }> 
    async createSignature(args: {
        data?: Byte[];
        hashToDirectlySign?: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        signature: Byte[];
    }> 
    async verifySignature(args: {
        data?: Byte[];
        hashToDirectlyVerify?: Byte[];
        signature: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        valid: true;
    }> 
    async acquireCertificate(args: {
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, string>;
        certifier: PubKeyHex;
        keyringRevealer: PubKeyHex | "certifier";
        keyringForSubject: Record<CertificateFieldNameUnder50Characters, Base64String>;
        acquisitionProtocol: "direct" | "issuance";
        certifierUrl?: string;
    }, originator?: OriginatorDomainNameString): Promise<{
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        certifier: PubKeyHex;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, string>;
    }> 
    async listCertificates(args: {
        certifiers: PubKeyHex[];
        types: Base64String[];
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async proveCertificate(args: {
        certificate: {
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, string>;
        };
        fieldsToReveal: CertificateFieldNameUnder50Characters[];
        verifier: PubKeyHex;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }, originator?: OriginatorDomainNameString): Promise<{
        keyringForVerifier: Record<CertificateFieldNameUnder50Characters, Base64String>;
    }> 
    async relinquishCertificate(args: {
        type: Base64String;
        serialNumber: Base64String;
        certifier: PubKeyHex;
    }, originator?: OriginatorDomainNameString): Promise<{
        relinquished: true;
    }> 
    async discoverByIdentityKey(args: {
        identityKey: PubKeyHex;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Characters;
                iconUrl: EntityIconURLStringMax500Characters;
                description: DescriptionString5to50Characters;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async discoverByAttributes(args: {
        attributes: Record<CertificateFieldNameUnder50Characters, string>;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Characters;
                iconUrl: EntityIconURLStringMax500Characters;
                description: DescriptionString5to50Characters;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async isAuthenticated(args: {}, originator?: OriginatorDomainNameString): Promise<{
        authenticated: boolean;
    }> 
    async waitForAuthentication(args: {}, originator?: OriginatorDomainNameString): Promise<{
        authenticated: true;
    }> 
    async getHeight(args: {}, originator?: OriginatorDomainNameString): Promise<{
        height: PositiveInteger;
    }> 
    async getHeaderForHeight(args: {
        height: PositiveInteger;
    }, originator?: OriginatorDomainNameString): Promise<{
        header: HexString;
    }> 
    async getNetwork(args: {}, originator?: OriginatorDomainNameString): Promise<{
        network: "mainnet" | "testnet";
    }> 
    async getVersion(args: {}, originator?: OriginatorDomainNameString): Promise<{
        version: VersionString7To30Characters;
    }> 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Class: XDMSubstrate

Facilitates wallet operations over cross-document messaging.

```ts
export default class XDMSubstrate implements Wallet {
    constructor() 
    async invoke(call, args): Promise<any> 
    async createAction(args: {
        description: DescriptionString5to50Characters;
        inputs?: Array<{
            tx?: BEEF;
            outpoint: OutpointString;
            unlockingScript?: HexString;
            unlockingScriptLength?: PositiveInteger;
            inputDescription: DescriptionString5to50Characters;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        outputs?: Array<{
            lockingScript: HexString;
            satoshis: SatoshiValue;
            outputDescription: DescriptionString5to50Characters;
            basket?: BasketStringUnder300Characters;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
        }>;
        lockTime?: PositiveIntegerOrZero;
        version?: PositiveIntegerOrZero;
        labels?: LabelStringUnder300Characters[];
        options?: {
            signAndProcess?: BooleanDefaultTrue;
            acceptDelayedBroadcast?: BooleanDefaultTrue;
            trustSelf?: "known";
            knownTxids?: TXIDHexString[];
            returnTXIDOnly?: BooleanDefaultFalse;
            noSend?: BooleanDefaultFalse;
            noSendChange?: OutpointString[];
            sendWith?: TXIDHexString[];
        };
    }): Promise<{
        txid?: TXIDHexString;
        tx?: BEEF;
        noSendChange?: OutpointString[];
        sendWithResults?: Array<{
            txid: TXIDHexString;
            status: "unproven" | "sending" | "failed";
        }>;
        signableTransaction?: {
            tx: BEEF;
            reference: Base64String;
        };
    }> 
    async signAction(args: {
        spends: Record<PositiveIntegerOrZero, {
            unlockingScript: HexString;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        reference: Base64String;
        options?: {
            acceptDelayedBroadcast?: BooleanDefaultTrue;
            returnTXIDOnly?: BooleanDefaultFalse;
            noSend?: BooleanDefaultFalse;
            noSendChange?: OutpointString[];
            sendWith: TXIDHexString[];
        };
    }): Promise<{
        txid?: TXIDHexString;
        tx?: BEEF;
        noSendChange?: OutpointString[];
        sendWithResults?: Array<{
            txid: TXIDHexString;
            status: "unproven" | "sending" | "failed";
        }>;
    }> 
    async abortAction(args: {
        reference: Base64String;
    }): Promise<{
        aborted: true;
    }> 
    async listActions(args: {
        labels: LabelStringUnder300Characters[];
        labelQueryMode?: "any" | "all";
        includeLabels?: BooleanDefaultFalse;
        includeInputs?: BooleanDefaultFalse;
        includeInputSourceLockingScripts?: BooleanDefaultFalse;
        includeInputUnlockingScripts?: BooleanDefaultFalse;
        includeOutputs?: BooleanDefaultFalse;
        includeOutputLockingScripts?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }): Promise<{
        totalActions: PositiveIntegerOrZero;
        actions: Array<{
            txid: TXIDHexString;
            satoshis: SatoshiValue;
            status: "completed" | "unprocessed" | "sending" | "unproven" | "unsigned" | "nosend" | "nonfinal";
            isOutgoing: boolean;
            description: DescriptionString5to50Characters;
            labels?: LabelStringUnder300Characters[];
            version: PositiveIntegerOrZero;
            lockTime: PositiveIntegerOrZero;
            inputs?: Array<{
                sourceOutpoint: OutpointString;
                sourceSatoshis: SatoshiValue;
                sourceLockingScript?: HexString;
                unlockingScript?: HexString;
                inputDescription: DescriptionString5to50Characters;
                sequenceNumber: PositiveIntegerOrZero;
            }>;
            outputs?: Array<{
                outputIndex: PositiveIntegerOrZero;
                satoshis: SatoshiValue;
                lockingScript?: HexString;
                spendable: boolean;
                outputDescription: DescriptionString5to50Characters;
                basket: BasketStringUnder300Characters;
                tags: OutputTagStringUnder300Characters[];
                customInstructions?: string;
            }>;
        }>;
    }> 
    async internalizeAction(args: {
        tx: BEEF;
        outputs: Array<{
            outputIndex: PositiveIntegerOrZero;
            protocol: "wallet payment" | "basket insertion";
            paymentRemittance?: {
                derivationPrefix: Base64String;
                derivationSuffix: Base64String;
                senderIdentityKey: PubKeyHex;
            };
            insertionRemittance?: {
                basket: BasketStringUnder300Characters;
                customInstructions?: string;
                tags?: OutputTagStringUnder300Characters[];
            };
        }>;
        description: DescriptionString5to50Characters;
        labels?: LabelStringUnder300Characters[];
    }): Promise<{
        accepted: true;
    }> 
    async listOutputs(args: {
        basket: BasketStringUnder300Characters;
        tags?: OutputTagStringUnder300Characters[];
        tagQueryMode?: "all" | "any";
        include?: "locking scripts" | "entire transactions";
        includeCustomInstructions?: BooleanDefaultFalse;
        includeTags?: BooleanDefaultFalse;
        includeLabels?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }): Promise<{
        totalOutputs: PositiveIntegerOrZero;
        outputs: Array<{
            outpoint: OutpointString;
            satoshis: SatoshiValue;
            lockingScript?: HexString;
            tx?: BEEF;
            spendable: true;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
            labels?: LabelStringUnder300Characters[];
        }>;
    }> 
    async relinquishOutput(args: {
        basket: BasketStringUnder300Characters;
        output: OutpointString;
    }): Promise<{
        relinquished: true;
    }> 
    async getPublicKey(args: {
        identityKey?: true;
        protocolID?: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID?: KeyIDStringUnder800Characters;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
    }): Promise<{
        publicKey: PubKeyHex;
    }> 
    async revealCounterpartyKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        privilegedReason?: DescriptionString5to50Characters;
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        revelationTime: ISOTimestampString;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
    }> 
    async revealSpecificKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
        proofType: Byte;
    }> 
    async encrypt(args: {
        plaintext: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        ciphertext: Byte[];
    }> 
    async decrypt(args: {
        ciphertext: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        plaintext: Byte[];
    }> 
    async createHmac(args: {
        data: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        hmac: Byte[];
    }> 
    async verifyHmac(args: {
        data: Byte[];
        hmac: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        valid: true;
    }> 
    async createSignature(args: {
        data?: Byte[];
        hashToDirectlySign?: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        signature: Byte[];
    }> 
    async verifySignature(args: {
        data?: Byte[];
        hashToDirectlyVerify?: Byte[];
        signature: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        valid: true;
    }> 
    async acquireCertificate(args: {
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, string>;
        certifier: PubKeyHex;
        keyringRevealer: PubKeyHex | "certifier";
        keyringForSubject: Record<CertificateFieldNameUnder50Characters, Base64String>;
        acquisitionProtocol: "direct" | "issuance";
        certifierUrl?: string;
    }): Promise<{
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        certifier: PubKeyHex;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, string>;
    }> 
    async listCertificates(args: {
        certifiers: PubKeyHex[];
        types: Base64String[];
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async proveCertificate(args: {
        certificate: {
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, string>;
        };
        fieldsToReveal: CertificateFieldNameUnder50Characters[];
        verifier: PubKeyHex;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }): Promise<{
        keyringForVerifier: Record<CertificateFieldNameUnder50Characters, Base64String>;
    }> 
    async relinquishCertificate(args: {
        type: Base64String;
        serialNumber: Base64String;
        certifier: PubKeyHex;
    }): Promise<{
        relinquished: true;
    }> 
    async discoverByIdentityKey(args: {
        identityKey: PubKeyHex;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Characters;
                iconUrl: EntityIconURLStringMax500Characters;
                description: DescriptionString5to50Characters;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async discoverByAttributes(args: {
        attributes: Record<CertificateFieldNameUnder50Characters, string>;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Characters;
                iconUrl: EntityIconURLStringMax500Characters;
                description: DescriptionString5to50Characters;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async isAuthenticated(args: {}): Promise<{
        authenticated: boolean;
    }> 
    async waitForAuthentication(args: {}): Promise<{
        authenticated: true;
    }> 
    async getHeight(args: {}): Promise<{
        height: PositiveInteger;
    }> 
    async getHeaderForHeight(args: {
        height: PositiveInteger;
    }): Promise<{
        header: HexString;
    }> 
    async getNetwork(args: {}): Promise<{
        network: "mainnet" | "testnet";
    }> 
    async getVersion(args: {}): Promise<{
        version: VersionString7To30Characters;
    }> 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Class: WalletWireTransceiver

A way to make remote calls to a wallet over a wallet wire.

```ts
export default class WalletWireTransceiver implements Wallet {
    wire: WalletWire;
    constructor(wire: WalletWire) 
    async createAction(args: {
        description: DescriptionString5to50Characters;
        inputBEEF?: BEEF;
        inputs?: Array<{
            outpoint: OutpointString;
            unlockingScript?: HexString;
            unlockingScriptLength?: PositiveInteger;
            inputDescription: DescriptionString5to50Characters;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        outputs?: Array<{
            lockingScript: HexString;
            satoshis: SatoshiValue;
            outputDescription: DescriptionString5to50Characters;
            basket?: BasketStringUnder300Characters;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
        }>;
        lockTime?: PositiveIntegerOrZero;
        version?: PositiveIntegerOrZero;
        labels?: LabelStringUnder300Characters[];
        options?: {
            signAndProcess?: BooleanDefaultTrue;
            acceptDelayedBroadcast?: BooleanDefaultTrue;
            trustSelf?: "known";
            knownTxids?: TXIDHexString[];
            returnTXIDOnly?: BooleanDefaultFalse;
            noSend?: BooleanDefaultFalse;
            noSendChange?: OutpointString[];
            sendWith?: TXIDHexString[];
            randomizeOutputs?: BooleanDefaultTrue;
        };
    }, originator?: OriginatorDomainNameString): Promise<{
        txid?: TXIDHexString;
        tx?: BEEF;
        noSendChange?: OutpointString[];
        sendWithResults?: Array<{
            txid: TXIDHexString;
            status: "unproven" | "sending" | "failed";
        }>;
        signableTransaction?: {
            tx: BEEF;
            reference: Base64String;
        };
    }> 
    async signAction(args: {
        spends: Record<PositiveIntegerOrZero, {
            unlockingScript: HexString;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        reference: Base64String;
        options?: {
            acceptDelayedBroadcast?: BooleanDefaultTrue;
            returnTXIDOnly?: BooleanDefaultFalse;
            noSend?: BooleanDefaultFalse;
            noSendChange?: OutpointString[];
            sendWith: TXIDHexString[];
        };
    }, originator?: OriginatorDomainNameString): Promise<{
        txid?: TXIDHexString;
        tx?: BEEF;
        noSendChange?: OutpointString[];
        sendWithResults?: Array<{
            txid: TXIDHexString;
            status: "unproven" | "sending" | "failed";
        }>;
    }> 
    async abortAction(args: {
        reference: Base64String;
    }, originator?: OriginatorDomainNameString): Promise<{
        aborted: true;
    }> 
    async listActions(args: {
        seekPermission?: BooleanDefaultTrue;
        labels: LabelStringUnder300Characters[];
        labelQueryMode?: "any" | "all";
        includeLabels?: BooleanDefaultFalse;
        includeInputs?: BooleanDefaultFalse;
        includeInputSourceLockingScripts?: BooleanDefaultFalse;
        includeInputUnlockingScripts?: BooleanDefaultFalse;
        includeOutputs?: BooleanDefaultFalse;
        includeOutputLockingScripts?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalActions: PositiveIntegerOrZero;
        actions: Array<{
            txid: TXIDHexString;
            satoshis: SatoshiValue;
            status: "completed" | "unprocessed" | "sending" | "unproven" | "unsigned" | "nosend" | "nonfinal";
            isOutgoing: boolean;
            description: DescriptionString5to50Characters;
            labels?: LabelStringUnder300Characters[];
            version: PositiveIntegerOrZero;
            lockTime: PositiveIntegerOrZero;
            inputs?: Array<{
                sourceOutpoint: OutpointString;
                sourceSatoshis: SatoshiValue;
                sourceLockingScript?: HexString;
                unlockingScript?: HexString;
                inputDescription: DescriptionString5to50Characters;
                sequenceNumber: PositiveIntegerOrZero;
            }>;
            outputs?: Array<{
                outputIndex: PositiveIntegerOrZero;
                satoshis: SatoshiValue;
                lockingScript?: HexString;
                spendable: boolean;
                outputDescription: DescriptionString5to50Characters;
                basket: BasketStringUnder300Characters;
                tags: OutputTagStringUnder300Characters[];
                customInstructions?: string;
            }>;
        }>;
    }> 
    async internalizeAction(args: {
        seekPermission?: BooleanDefaultTrue;
        tx: AtomicBEEF;
        outputs: Array<{
            outputIndex: PositiveIntegerOrZero;
            protocol: "wallet payment" | "basket insertion";
            paymentRemittance?: {
                derivationPrefix: Base64String;
                derivationSuffix: Base64String;
                senderIdentityKey: PubKeyHex;
            };
            insertionRemittance?: {
                basket: BasketStringUnder300Characters;
                customInstructions?: string;
                tags?: OutputTagStringUnder300Characters[];
            };
        }>;
        description: DescriptionString5to50Characters;
        labels?: LabelStringUnder300Characters[];
    }, originator?: OriginatorDomainNameString): Promise<{
        accepted: true;
    }> 
    async listOutputs(args: {
        seekPermission?: BooleanDefaultTrue;
        basket: BasketStringUnder300Characters;
        tags?: OutputTagStringUnder300Characters[];
        tagQueryMode?: "all" | "any";
        include?: "locking scripts" | "entire transactions";
        includeCustomInstructions?: BooleanDefaultFalse;
        includeTags?: BooleanDefaultFalse;
        includeLabels?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalOutputs: PositiveIntegerOrZero;
        BEEF?: BEEF;
        outputs: Array<{
            outpoint: OutpointString;
            satoshis: SatoshiValue;
            lockingScript?: HexString;
            spendable: true;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
            labels?: LabelStringUnder300Characters[];
        }>;
    }> 
    async relinquishOutput(args: {
        basket: BasketStringUnder300Characters;
        output: OutpointString;
    }, originator?: OriginatorDomainNameString): Promise<{
        relinquished: true;
    }> 
    async getPublicKey(args: {
        seekPermission?: BooleanDefaultTrue;
        identityKey?: true;
        protocolID?: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID?: KeyIDStringUnder800Characters;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        publicKey: PubKeyHex;
    }> 
    async revealCounterpartyKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        privilegedReason?: DescriptionString5to50Characters;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        revelationTime: ISOTimestampString;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: number[];
    }> 
    async revealSpecificKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
        proofType: Byte;
    }> 
    async encrypt(args: {
        seekPermission?: BooleanDefaultTrue;
        plaintext: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        ciphertext: Byte[];
    }> 
    async decrypt(args: {
        seekPermission?: BooleanDefaultTrue;
        ciphertext: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        plaintext: Byte[];
    }> 
    async createHmac(args: {
        seekPermission?: BooleanDefaultTrue;
        data: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        hmac: Byte[];
    }> 
    async verifyHmac(args: {
        seekPermission?: BooleanDefaultTrue;
        data: Byte[];
        hmac: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        valid: true;
    }> 
    async createSignature(args: {
        seekPermission?: BooleanDefaultTrue;
        data?: Byte[];
        hashToDirectlySign?: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        signature: Byte[];
    }> 
    async verifySignature(args: {
        seekPermission?: BooleanDefaultTrue;
        data?: Byte[];
        hashToDirectlyVerify?: Byte[];
        signature: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameString): Promise<{
        valid: true;
    }> 
    async acquireCertificate(args: {
        type: Base64String;
        certifier: PubKeyHex;
        acquisitionProtocol: "direct" | "issuance";
        fields: Record<CertificateFieldNameUnder50Characters, string>;
        serialNumber?: Base64String;
        revocationOutpoint?: OutpointString;
        signature?: HexString;
        certifierUrl?: string;
        keyringRevealer?: PubKeyHex | "certifier";
        keyringForSubject?: Record<CertificateFieldNameUnder50Characters, Base64String>;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }, originator?: OriginatorDomainNameString): Promise<{
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        certifier: PubKeyHex;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, string>;
    }> 
    async listCertificates(args: {
        certifiers: PubKeyHex[];
        types: Base64String[];
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async proveCertificate(args: {
        certificate: {
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, string>;
        };
        fieldsToReveal: CertificateFieldNameUnder50Characters[];
        verifier: PubKeyHex;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }, originator?: OriginatorDomainNameString): Promise<{
        keyringForVerifier: Record<CertificateFieldNameUnder50Characters, Base64String>;
    }> 
    async relinquishCertificate(args: {
        type: Base64String;
        serialNumber: Base64String;
        certifier: PubKeyHex;
    }, originator?: OriginatorDomainNameString): Promise<{
        relinquished: true;
    }> 
    async discoverByIdentityKey(args: {
        seekPermission?: BooleanDefaultTrue;
        identityKey: PubKeyHex;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Characters;
                iconUrl: EntityIconURLStringMax500Characters;
                description: DescriptionString5to50Characters;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async discoverByAttributes(args: {
        seekPermission?: BooleanDefaultTrue;
        attributes: Record<CertificateFieldNameUnder50Characters, string>;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameString): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Characters;
                iconUrl: EntityIconURLStringMax500Characters;
                description: DescriptionString5to50Characters;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async isAuthenticated(args: {}, originator?: OriginatorDomainNameString): Promise<{
        authenticated: boolean;
    }> 
    async waitForAuthentication(args: {}, originator?: OriginatorDomainNameString): Promise<{
        authenticated: true;
    }> 
    async getHeight(args: {}, originator?: OriginatorDomainNameString): Promise<{
        height: PositiveInteger;
    }> 
    async getHeaderForHeight(args: {
        height: PositiveInteger;
    }, originator?: OriginatorDomainNameString): Promise<{
        header: HexString;
    }> 
    async getNetwork(args: {}, originator?: OriginatorDomainNameString): Promise<{
        network: "mainnet" | "testnet";
    }> 
    async getVersion(args: {}, originator?: OriginatorDomainNameString): Promise<{
        version: VersionString7To30Characters;
    }> 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Class: HTTPWalletWire

```ts
export default class HTTPWalletWire implements WalletWire {
    baseUrl: string;
    httpClient: HttpClient;
    originator: string | undefined;
    constructor(originator: string | undefined, baseUrl: string = "http://localhost:3301", httpClient = defaultHttpClient()) 
    async transmitToWallet(message: number[]): Promise<number[]> 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Class: WalletSDK

The SDK is how applications communicate with wallets over a communications substrate.

```ts
export default class WalletSDK implements Wallet {
    public substrate: "auto" | Wallet;
    originator?: OriginatorDomainNameString;
    constructor(substrate: "auto" | "Cicada" | "XDM" | "window.CWI" | Wallet = "auto", originator?: OriginatorDomainNameString) 
    async connectToSubstrate() 
    async createAction(args: {
        description: DescriptionString5to50Characters;
        inputs?: Array<{
            tx?: BEEF;
            outpoint: OutpointString;
            unlockingScript?: HexString;
            unlockingScriptLength?: PositiveInteger;
            inputDescription: DescriptionString5to50Characters;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        outputs?: Array<{
            lockingScript: HexString;
            satoshis: SatoshiValue;
            outputDescription: DescriptionString5to50Characters;
            basket?: BasketStringUnder300Characters;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
        }>;
        lockTime?: PositiveIntegerOrZero;
        version?: PositiveIntegerOrZero;
        labels?: LabelStringUnder300Characters[];
        options?: {
            signAndProcess?: BooleanDefaultTrue;
            acceptDelayedBroadcast?: BooleanDefaultTrue;
            trustSelf?: "known";
            knownTxids?: TXIDHexString[];
            returnTXIDOnly?: BooleanDefaultFalse;
            noSend?: BooleanDefaultFalse;
            noSendChange?: OutpointString[];
            sendWith?: TXIDHexString[];
        };
    }): Promise<{
        txid?: TXIDHexString;
        tx?: BEEF;
        noSendChange?: OutpointString[];
        sendWithResults?: Array<{
            txid: TXIDHexString;
            status: "unproven" | "sending" | "failed";
        }>;
        signableTransaction?: {
            tx: BEEF;
            reference: Base64String;
        };
    }> 
    async signAction(args: {
        spends: Record<PositiveIntegerOrZero, {
            unlockingScript: HexString;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        reference: Base64String;
        options?: {
            acceptDelayedBroadcast?: BooleanDefaultTrue;
            returnTXIDOnly?: BooleanDefaultFalse;
            noSend?: BooleanDefaultFalse;
            noSendChange?: OutpointString[];
            sendWith: TXIDHexString[];
        };
    }): Promise<{
        txid?: TXIDHexString;
        tx?: BEEF;
        noSendChange?: OutpointString[];
        sendWithResults?: Array<{
            txid: TXIDHexString;
            status: "unproven" | "sending" | "failed";
        }>;
    }> 
    async abortAction(args: {
        reference: Base64String;
    }): Promise<{
        aborted: true;
    }> 
    async listActions(args: {
        labels: LabelStringUnder300Characters[];
        labelQueryMode?: "any" | "all";
        includeLabels?: BooleanDefaultFalse;
        includeInputs?: BooleanDefaultFalse;
        includeInputSourceLockingScripts?: BooleanDefaultFalse;
        includeInputUnlockingScripts?: BooleanDefaultFalse;
        includeOutputs?: BooleanDefaultFalse;
        includeOutputLockingScripts?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }): Promise<{
        totalActions: PositiveIntegerOrZero;
        actions: Array<{
            txid: TXIDHexString;
            satoshis: SatoshiValue;
            status: "completed" | "unprocessed" | "sending" | "unproven" | "unsigned" | "nosend" | "nonfinal";
            isOutgoing: boolean;
            description: DescriptionString5to50Characters;
            labels?: LabelStringUnder300Characters[];
            version: PositiveIntegerOrZero;
            lockTime: PositiveIntegerOrZero;
            inputs?: Array<{
                sourceOutpoint: OutpointString;
                sourceSatoshis: SatoshiValue;
                sourceLockingScript?: HexString;
                unlockingScript?: HexString;
                inputDescription: DescriptionString5to50Characters;
                sequenceNumber: PositiveIntegerOrZero;
            }>;
            outputs?: Array<{
                outputIndex: PositiveIntegerOrZero;
                satoshis: SatoshiValue;
                lockingScript?: HexString;
                spendable: boolean;
                outputDescription: DescriptionString5to50Characters;
                basket: BasketStringUnder300Characters;
                tags: OutputTagStringUnder300Characters[];
                customInstructions?: string;
            }>;
        }>;
    }> 
    async internalizeAction(args: {
        tx: BEEF;
        outputs: Array<{
            outputIndex: PositiveIntegerOrZero;
            protocol: "wallet payment" | "basket insertion";
            paymentRemittance?: {
                derivationPrefix: Base64String;
                derivationSuffix: Base64String;
                senderIdentityKey: PubKeyHex;
            };
            insertionRemittance?: {
                basket: BasketStringUnder300Characters;
                customInstructions?: string;
                tags?: OutputTagStringUnder300Characters[];
            };
        }>;
        description: DescriptionString5to50Characters;
        labels?: LabelStringUnder300Characters[];
    }): Promise<{
        accepted: true;
    }> 
    async listOutputs(args: {
        basket: BasketStringUnder300Characters;
        tags?: OutputTagStringUnder300Characters[];
        tagQueryMode?: "all" | "any";
        include?: "locking scripts" | "entire transactions";
        includeCustomInstructions?: BooleanDefaultFalse;
        includeTags?: BooleanDefaultFalse;
        includeLabels?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }): Promise<{
        totalOutputs: PositiveIntegerOrZero;
        outputs: Array<{
            outpoint: OutpointString;
            satoshis: SatoshiValue;
            lockingScript?: HexString;
            tx?: BEEF;
            spendable: true;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Characters[];
            labels?: LabelStringUnder300Characters[];
        }>;
    }> 
    async relinquishOutput(args: {
        basket: BasketStringUnder300Characters;
        output: OutpointString;
    }): Promise<{
        relinquished: true;
    }> 
    async getPublicKey(args: {
        identityKey?: true;
        protocolID?: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID?: KeyIDStringUnder800Characters;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
    }): Promise<{
        publicKey: PubKeyHex;
    }> 
    async revealCounterpartyKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        privilegedReason?: DescriptionString5to50Characters;
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        revelationTime: ISOTimestampString;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
    }> 
    async revealSpecificKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
        proofType: Byte;
    }> 
    async encrypt(args: {
        plaintext: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        ciphertext: Byte[];
    }> 
    async decrypt(args: {
        ciphertext: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        plaintext: Byte[];
    }> 
    async createHmac(args: {
        data: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        hmac: Byte[];
    }> 
    async verifyHmac(args: {
        data: Byte[];
        hmac: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        valid: true;
    }> 
    async createSignature(args: {
        data?: Byte[];
        hashToDirectlySign?: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        signature: Byte[];
    }> 
    async verifySignature(args: {
        data?: Byte[];
        hashToDirectlyVerify?: Byte[];
        signature: Byte[];
        protocolID: [
            0 | 1 | 2,
            ProtocolString5To400Characters
        ];
        keyID: KeyIDStringUnder800Characters;
        privilegedReason?: DescriptionString5to50Characters;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        valid: true;
    }> 
    async acquireCertificate(args: {
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, string>;
        certifier: PubKeyHex;
        keyringRevealer: PubKeyHex | "certifier";
        keyringForSubject: Record<CertificateFieldNameUnder50Characters, Base64String>;
        acquisitionProtocol: "direct" | "issuance";
        certifierUrl?: string;
    }): Promise<{
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        certifier: PubKeyHex;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Characters, string>;
    }> 
    async listCertificates(args: {
        certifiers: PubKeyHex[];
        types: Base64String[];
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async proveCertificate(args: {
        certificate: {
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, string>;
        };
        fieldsToReveal: CertificateFieldNameUnder50Characters[];
        verifier: PubKeyHex;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Characters;
    }): Promise<{
        keyringForVerifier: Record<CertificateFieldNameUnder50Characters, Base64String>;
    }> 
    async relinquishCertificate(args: {
        type: Base64String;
        serialNumber: Base64String;
        certifier: PubKeyHex;
    }): Promise<{
        relinquished: true;
    }> 
    async discoverByIdentityKey(args: {
        identityKey: PubKeyHex;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Characters;
                iconUrl: EntityIconURLStringMax500Characters;
                description: DescriptionString5to50Characters;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async discoverByAttributes(args: {
        attributes: Record<CertificateFieldNameUnder50Characters, string>;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Characters, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Characters;
                iconUrl: EntityIconURLStringMax500Characters;
                description: DescriptionString5to50Characters;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Characters, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Characters, string>;
        }>;
    }> 
    async isAuthenticated(args: {} = {}): Promise<{
        authenticated: boolean;
    }> 
    async waitForAuthentication(args: {} = {}): Promise<{
        authenticated: true;
    }> 
    async getHeight(args: {} = {}): Promise<{
        height: PositiveInteger;
    }> 
    async getHeaderForHeight(args: {
        height: PositiveInteger;
    }): Promise<{
        header: HexString;
    }> 
    async getNetwork(args: {} = {}): Promise<{
        network: "mainnet" | "testnet";
    }> 
    async getVersion(args: {} = {}): Promise<{
        version: VersionString7To30Characters;
    }> 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
## Types

| | | |
| --- | --- | --- |
| [AtomicBEEF](#type-atomicbeef) | [EntityNameStringMax100Characters](#type-entitynamestringmax100characters) | [PositiveInteger](#type-positiveinteger) |
| [BEEF](#type-beef) | [ErrorCodeString10To40Characters](#type-errorcodestring10to40characters) | [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000) |
| [Base64String](#type-base64string) | [ErrorDescriptionString20To200Characters](#type-errordescriptionstring20to200characters) | [PositiveIntegerMax10](#type-positiveintegermax10) |
| [BasketStringUnder300Characters](#type-basketstringunder300characters) | [HexString](#type-hexstring) | [PositiveIntegerOrZero](#type-positiveintegerorzero) |
| [BooleanDefaultFalse](#type-booleandefaultfalse) | [ISOTimestampString](#type-isotimestampstring) | [ProtocolString5To400Characters](#type-protocolstring5to400characters) |
| [BooleanDefaultTrue](#type-booleandefaulttrue) | [KeyIDStringUnder800Characters](#type-keyidstringunder800characters) | [PubKeyHex](#type-pubkeyhex) |
| [Byte](#type-byte) | [LabelStringUnder300Characters](#type-labelstringunder300characters) | [SatoshiValue](#type-satoshivalue) |
| [CertificateFieldNameUnder50Characters](#type-certificatefieldnameunder50characters) | [OriginatorDomainNameString](#type-originatordomainnamestring) | [TXIDHexString](#type-txidhexstring) |
| [DescriptionString5to50Characters](#type-descriptionstring5to50characters) | [OutpointString](#type-outpointstring) | [VersionString7To30Characters](#type-versionstring7to30characters) |
| [EntityIconURLStringMax500Characters](#type-entityiconurlstringmax500characters) | [OutputTagStringUnder300Characters](#type-outputtagstringunder300characters) |  |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---

### Type: BooleanDefaultFalse

```ts
export type BooleanDefaultFalse = boolean
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: BooleanDefaultTrue

```ts
export type BooleanDefaultTrue = boolean
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: Byte

```ts
export type Byte = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: PositiveIntegerOrZero

```ts
export type PositiveIntegerOrZero = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: PositiveInteger

```ts
export type PositiveInteger = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: PositiveIntegerMax10

```ts
export type PositiveIntegerMax10 = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: PositiveIntegerDefault10Max10000

```ts
export type PositiveIntegerDefault10Max10000 = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: SatoshiValue

```ts
export type SatoshiValue = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: ISOTimestampString

```ts
export type ISOTimestampString = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: HexString

```ts
export type HexString = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: TXIDHexString

```ts
export type TXIDHexString = HexString
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: OutpointString

```ts
export type OutpointString = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: PubKeyHex

```ts
export type PubKeyHex = HexString
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: Base64String

```ts
export type Base64String = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: OriginatorDomainNameString

```ts
export type OriginatorDomainNameString = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: DescriptionString5to50Characters

```ts
export type DescriptionString5to50Characters = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: BasketStringUnder300Characters

```ts
export type BasketStringUnder300Characters = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: OutputTagStringUnder300Characters

```ts
export type OutputTagStringUnder300Characters = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: LabelStringUnder300Characters

```ts
export type LabelStringUnder300Characters = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: BEEF

```ts
export type BEEF = Byte[]
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: AtomicBEEF

```ts
export type AtomicBEEF = Byte[]
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: ProtocolString5To400Characters

```ts
export type ProtocolString5To400Characters = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: KeyIDStringUnder800Characters

```ts
export type KeyIDStringUnder800Characters = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: CertificateFieldNameUnder50Characters

```ts
export type CertificateFieldNameUnder50Characters = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: EntityNameStringMax100Characters

```ts
export type EntityNameStringMax100Characters = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: EntityIconURLStringMax500Characters

```ts
export type EntityIconURLStringMax500Characters = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: VersionString7To30Characters

```ts
export type VersionString7To30Characters = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: ErrorCodeString10To40Characters

```ts
export type ErrorCodeString10To40Characters = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
### Type: ErrorDescriptionString20To200Characters

```ts
export type ErrorDescriptionString20To200Characters = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Types](#types)

---
