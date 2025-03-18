# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

## Interfaces

### Interface: WalletWire

A Wallet Wire is an abstraction over a raw transport medium where binary data can be sent to and subsequently received from a wallet.

```ts
export default interface WalletWire {
    transmitToWallet: (message: number[]) => Promise<number[]>;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Classes

| |
| --- |
| [HTTPWalletWire](#class-httpwalletwire) |
| [WalletWireProcessor](#class-walletwireprocessor) |
| [WalletWireTransceiver](#class-walletwiretransceiver) |
| [WindowCWISubstrate](#class-windowcwisubstrate) |
| [XDMSubstrate](#class-xdmsubstrate) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Class: HTTPWalletWire

```ts
export default class HTTPWalletWire implements WalletWire {
    baseUrl: string;
    httpClient: typeof fetch;
    originator: string | undefined;
    constructor(originator: string | undefined, baseUrl: string = "http://localhost:3301", httpClient = fetch) 
    async transmitToWallet(message: number[]): Promise<number[]> 
}
```

See also: [WalletWire](./wallet.md#interface-walletwire)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: WalletWireProcessor

Processes incoming wallet calls received over a wallet wire, with a given wallet.

```ts
export default class WalletWireProcessor implements WalletWire {
    wallet: WalletInterface;
    constructor(wallet: WalletInterface) 
    async transmitToWallet(message: number[]): Promise<number[]> 
}
```

See also: [WalletInterface](./wallet.md#interface-walletinterface), [WalletWire](./wallet.md#interface-walletwire)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: WalletWireTransceiver

A way to make remote calls to a wallet over a wallet wire.

```ts
export default class WalletWireTransceiver implements WalletInterface {
    wire: WalletWire;
    constructor(wire: WalletWire) 
    async createAction(args: CreateActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<CreateActionResult> 
    async signAction(args: SignActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<SignActionResult> 
    async abortAction(args: {
        reference: Base64String;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        aborted: true;
    }> 
    async listActions(args: ListActionsArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<ListActionsResult> 
    async internalizeAction(args: InternalizeActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        accepted: true;
    }> 
    async listOutputs(args: ListOutputsArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<ListOutputsResult> 
    async relinquishOutput(args: {
        basket: BasketStringUnder300Bytes;
        output: OutpointString;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        relinquished: true;
    }> 
    async getPublicKey(args: {
        seekPermission?: BooleanDefaultTrue;
        identityKey?: true;
        protocolID?: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID?: KeyIDStringUnder800Bytes;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        publicKey: PubKeyHex;
    }> 
    async revealCounterpartyKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        privilegedReason?: DescriptionString5to50Bytes;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
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
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
        proofType: Byte;
    }> 
    async encrypt(args: {
        seekPermission?: BooleanDefaultTrue;
        plaintext: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        ciphertext: Byte[];
    }> 
    async decrypt(args: {
        seekPermission?: BooleanDefaultTrue;
        ciphertext: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        plaintext: Byte[];
    }> 
    async createHmac(args: {
        seekPermission?: BooleanDefaultTrue;
        data: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        hmac: Byte[];
    }> 
    async verifyHmac(args: {
        seekPermission?: BooleanDefaultTrue;
        data: Byte[];
        hmac: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        valid: true;
    }> 
    async createSignature(args: {
        seekPermission?: BooleanDefaultTrue;
        data?: Byte[];
        hashToDirectlySign?: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        signature: Byte[];
    }> 
    async verifySignature(args: {
        seekPermission?: BooleanDefaultTrue;
        data?: Byte[];
        hashToDirectlyVerify?: Byte[];
        signature: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        valid: true;
    }> 
    async acquireCertificate(args: AcquireCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<AcquireCertificateResult> 
    async listCertificates(args: {
        certifiers: PubKeyHex[];
        types: Base64String[];
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Bytes;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<ListCertificatesResult> 
    async proveCertificate(args: ProveCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<ProveCertificateResult> 
    async relinquishCertificate(args: {
        type: Base64String;
        serialNumber: Base64String;
        certifier: PubKeyHex;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        relinquished: true;
    }> 
    async discoverByIdentityKey(args: {
        seekPermission?: BooleanDefaultTrue;
        identityKey: PubKeyHex;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<DiscoverCertificatesResult> 
    async discoverByAttributes(args: {
        seekPermission?: BooleanDefaultTrue;
        attributes: Record<CertificateFieldNameUnder50Bytes, string>;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<DiscoverCertificatesResult> 
    async isAuthenticated(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        authenticated: true;
    }> 
    async waitForAuthentication(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        authenticated: true;
    }> 
    async getHeight(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        height: PositiveInteger;
    }> 
    async getHeaderForHeight(args: {
        height: PositiveInteger;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        header: HexString;
    }> 
    async getNetwork(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        network: "mainnet" | "testnet";
    }> 
    async getVersion(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        version: VersionString7To30Bytes;
    }> 
}
```

See also: [AcquireCertificateArgs](./wallet.md#interface-acquirecertificateargs), [AcquireCertificateResult](./wallet.md#type-acquirecertificateresult), [Base64String](./wallet.md#type-base64string), [BasketStringUnder300Bytes](./wallet.md#type-basketstringunder300bytes), [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [BooleanDefaultTrue](./wallet.md#type-booleandefaulttrue), [Byte](./wallet.md#type-byte), [CertificateFieldNameUnder50Bytes](./wallet.md#type-certificatefieldnameunder50bytes), [CreateActionArgs](./wallet.md#interface-createactionargs), [CreateActionResult](./wallet.md#interface-createactionresult), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [DiscoverCertificatesResult](./wallet.md#interface-discovercertificatesresult), [HexString](./wallet.md#type-hexstring), [ISOTimestampString](./wallet.md#type-isotimestampstring), [InternalizeActionArgs](./wallet.md#interface-internalizeactionargs), [KeyIDStringUnder800Bytes](./wallet.md#type-keyidstringunder800bytes), [ListActionsArgs](./wallet.md#interface-listactionsargs), [ListActionsResult](./wallet.md#interface-listactionsresult), [ListCertificatesResult](./wallet.md#interface-listcertificatesresult), [ListOutputsArgs](./wallet.md#interface-listoutputsargs), [ListOutputsResult](./wallet.md#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [OutpointString](./wallet.md#type-outpointstring), [PositiveInteger](./wallet.md#type-positiveinteger), [PositiveIntegerDefault10Max10000](./wallet.md#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [ProtocolString5To400Bytes](./wallet.md#type-protocolstring5to400bytes), [ProveCertificateArgs](./wallet.md#interface-provecertificateargs), [ProveCertificateResult](./wallet.md#interface-provecertificateresult), [PubKeyHex](./wallet.md#type-pubkeyhex), [SecurityLevel](./wallet.md#type-securitylevel), [SignActionArgs](./wallet.md#interface-signactionargs), [SignActionResult](./wallet.md#interface-signactionresult), [VersionString7To30Bytes](./wallet.md#type-versionstring7to30bytes), [WalletInterface](./wallet.md#interface-walletinterface), [WalletWire](./wallet.md#interface-walletwire), [decrypt](./messages.md#variable-decrypt), [encrypt](./messages.md#variable-encrypt)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: WindowCWISubstrate

Facilitates wallet operations over the window.CWI interface.

```ts
export default class WindowCWISubstrate implements WalletInterface {
    constructor() 
    async createAction(args: {
        description: DescriptionString5to50Bytes;
        inputs?: Array<{
            tx?: BEEF;
            outpoint: OutpointString;
            unlockingScript?: HexString;
            unlockingScriptLength?: PositiveInteger;
            inputDescription: DescriptionString5to50Bytes;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        outputs?: Array<{
            lockingScript: HexString;
            satoshis: SatoshiValue;
            outputDescription: DescriptionString5to50Bytes;
            basket?: BasketStringUnder300Bytes;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Bytes[];
        }>;
        lockTime?: PositiveIntegerOrZero;
        version?: PositiveIntegerOrZero;
        labels?: LabelStringUnder300Bytes[];
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
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
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
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
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
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        aborted: true;
    }> 
    async listActions(args: {
        labels: LabelStringUnder300Bytes[];
        labelQueryMode?: "any" | "all";
        includeLabels?: BooleanDefaultFalse;
        includeInputs?: BooleanDefaultFalse;
        includeInputSourceLockingScripts?: BooleanDefaultFalse;
        includeInputUnlockingScripts?: BooleanDefaultFalse;
        includeOutputs?: BooleanDefaultFalse;
        includeOutputLockingScripts?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        totalActions: PositiveIntegerOrZero;
        actions: Array<{
            txid: TXIDHexString;
            satoshis: SatoshiValue;
            status: "completed" | "unprocessed" | "sending" | "unproven" | "unsigned" | "nosend" | "nonfinal" | "failed";
            isOutgoing: boolean;
            description: DescriptionString5to50Bytes;
            labels?: LabelStringUnder300Bytes[];
            version: PositiveIntegerOrZero;
            lockTime: PositiveIntegerOrZero;
            inputs?: Array<{
                sourceOutpoint: OutpointString;
                sourceSatoshis: SatoshiValue;
                sourceLockingScript?: HexString;
                unlockingScript?: HexString;
                inputDescription: DescriptionString5to50Bytes;
                sequenceNumber: PositiveIntegerOrZero;
            }>;
            outputs?: Array<{
                outputIndex: PositiveIntegerOrZero;
                satoshis: SatoshiValue;
                lockingScript?: HexString;
                spendable: boolean;
                outputDescription: DescriptionString5to50Bytes;
                basket: BasketStringUnder300Bytes;
                tags: OutputTagStringUnder300Bytes[];
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
                basket: BasketStringUnder300Bytes;
                customInstructions?: string;
                tags?: OutputTagStringUnder300Bytes[];
            };
        }>;
        description: DescriptionString5to50Bytes;
        labels?: LabelStringUnder300Bytes[];
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        accepted: true;
    }> 
    async listOutputs(args: {
        basket: BasketStringUnder300Bytes;
        tags?: OutputTagStringUnder300Bytes[];
        tagQueryMode?: "all" | "any";
        include?: "locking scripts" | "entire transactions";
        includeCustomInstructions?: BooleanDefaultFalse;
        includeTags?: BooleanDefaultFalse;
        includeLabels?: BooleanDefaultFalse;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        totalOutputs: PositiveIntegerOrZero;
        outputs: Array<{
            outpoint: OutpointString;
            satoshis: SatoshiValue;
            lockingScript?: HexString;
            tx?: BEEF;
            spendable: boolean;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Bytes[];
            labels?: LabelStringUnder300Bytes[];
        }>;
    }> 
    async relinquishOutput(args: {
        basket: BasketStringUnder300Bytes;
        output: OutpointString;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        relinquished: true;
    }> 
    async getPublicKey(args: {
        identityKey?: true;
        protocolID?: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID?: KeyIDStringUnder800Bytes;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        publicKey: PubKeyHex;
    }> 
    async revealCounterpartyKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        privilegedReason?: DescriptionString5to50Bytes;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
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
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
        proofType: Byte;
    }> 
    async encrypt(args: {
        plaintext: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        ciphertext: Byte[];
    }> 
    async decrypt(args: {
        ciphertext: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        plaintext: Byte[];
    }> 
    async createHmac(args: {
        data: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        hmac: Byte[];
    }> 
    async verifyHmac(args: {
        data: Byte[];
        hmac: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        valid: true;
    }> 
    async createSignature(args: {
        data?: Byte[];
        hashToDirectlySign?: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        signature: Byte[];
    }> 
    async verifySignature(args: {
        data?: Byte[];
        hashToDirectlyVerify?: Byte[];
        signature: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
        privileged?: BooleanDefaultFalse;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        valid: true;
    }> 
    async acquireCertificate(args: {
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Bytes, string>;
        certifier: PubKeyHex;
        keyringRevealer: PubKeyHex | "certifier";
        keyringForSubject: Record<CertificateFieldNameUnder50Bytes, Base64String>;
        acquisitionProtocol: "direct" | "issuance";
        certifierUrl?: string;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        certifier: PubKeyHex;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Bytes, string>;
    }> 
    async listCertificates(args: {
        certifiers: PubKeyHex[];
        types: Base64String[];
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Bytes;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Bytes, string>;
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
            fields: Record<CertificateFieldNameUnder50Bytes, string>;
        };
        fieldsToReveal: CertificateFieldNameUnder50Bytes[];
        verifier: PubKeyHex;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Bytes;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        keyringForVerifier: Record<CertificateFieldNameUnder50Bytes, Base64String>;
    }> 
    async relinquishCertificate(args: {
        type: Base64String;
        serialNumber: Base64String;
        certifier: PubKeyHex;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        relinquished: true;
    }> 
    async discoverByIdentityKey(args: {
        identityKey: PubKeyHex;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Bytes, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Bytes;
                iconUrl: EntityIconURLStringMax500Bytes;
                description: DescriptionString5to50Bytes;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Bytes, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>;
        }>;
    }> 
    async discoverByAttributes(args: {
        attributes: Record<CertificateFieldNameUnder50Bytes, string>;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Bytes, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Bytes;
                iconUrl: EntityIconURLStringMax500Bytes;
                description: DescriptionString5to50Bytes;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Bytes, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>;
        }>;
    }> 
    async isAuthenticated(args: object, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        authenticated: true;
    }> 
    async waitForAuthentication(args: object, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        authenticated: true;
    }> 
    async getHeight(args: object, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        height: PositiveInteger;
    }> 
    async getHeaderForHeight(args: {
        height: PositiveInteger;
    }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        header: HexString;
    }> 
    async getNetwork(args: object, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        network: "mainnet" | "testnet";
    }> 
    async getVersion(args: object, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        version: VersionString7To30Bytes;
    }> 
}
```

See also: [BEEF](./wallet.md#type-beef), [Base64String](./wallet.md#type-base64string), [BasketStringUnder300Bytes](./wallet.md#type-basketstringunder300bytes), [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [BooleanDefaultTrue](./wallet.md#type-booleandefaulttrue), [Byte](./wallet.md#type-byte), [CertificateFieldNameUnder50Bytes](./wallet.md#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [EntityIconURLStringMax500Bytes](./wallet.md#type-entityiconurlstringmax500bytes), [EntityNameStringMax100Bytes](./wallet.md#type-entitynamestringmax100bytes), [HexString](./wallet.md#type-hexstring), [ISOTimestampString](./wallet.md#type-isotimestampstring), [KeyIDStringUnder800Bytes](./wallet.md#type-keyidstringunder800bytes), [LabelStringUnder300Bytes](./wallet.md#type-labelstringunder300bytes), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [OutpointString](./wallet.md#type-outpointstring), [OutputTagStringUnder300Bytes](./wallet.md#type-outputtagstringunder300bytes), [PositiveInteger](./wallet.md#type-positiveinteger), [PositiveIntegerDefault10Max10000](./wallet.md#type-positiveintegerdefault10max10000), [PositiveIntegerMax10](./wallet.md#type-positiveintegermax10), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [ProtocolString5To400Bytes](./wallet.md#type-protocolstring5to400bytes), [PubKeyHex](./wallet.md#type-pubkeyhex), [SatoshiValue](./wallet.md#type-satoshivalue), [SecurityLevel](./wallet.md#type-securitylevel), [TXIDHexString](./wallet.md#type-txidhexstring), [VersionString7To30Bytes](./wallet.md#type-versionstring7to30bytes), [WalletInterface](./wallet.md#interface-walletinterface), [decrypt](./messages.md#variable-decrypt), [encrypt](./messages.md#variable-encrypt)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: XDMSubstrate

Facilitates wallet operations over cross-document messaging.

```ts
export default class XDMSubstrate implements WalletInterface {
    constructor(domain: string = "*") 
    async invoke(call: CallType, args: any): Promise<any> 
    async createAction(args: {
        description: DescriptionString5to50Bytes;
        inputs?: Array<{
            tx?: BEEF;
            outpoint: OutpointString;
            unlockingScript?: HexString;
            unlockingScriptLength?: PositiveInteger;
            inputDescription: DescriptionString5to50Bytes;
            sequenceNumber?: PositiveIntegerOrZero;
        }>;
        outputs?: Array<{
            lockingScript: HexString;
            satoshis: SatoshiValue;
            outputDescription: DescriptionString5to50Bytes;
            basket?: BasketStringUnder300Bytes;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Bytes[];
        }>;
        lockTime?: PositiveIntegerOrZero;
        version?: PositiveIntegerOrZero;
        labels?: LabelStringUnder300Bytes[];
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
        labels: LabelStringUnder300Bytes[];
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
            description: DescriptionString5to50Bytes;
            labels?: LabelStringUnder300Bytes[];
            version: PositiveIntegerOrZero;
            lockTime: PositiveIntegerOrZero;
            inputs?: Array<{
                sourceOutpoint: OutpointString;
                sourceSatoshis: SatoshiValue;
                sourceLockingScript?: HexString;
                unlockingScript?: HexString;
                inputDescription: DescriptionString5to50Bytes;
                sequenceNumber: PositiveIntegerOrZero;
            }>;
            outputs?: Array<{
                outputIndex: PositiveIntegerOrZero;
                satoshis: SatoshiValue;
                lockingScript?: HexString;
                spendable: boolean;
                outputDescription: DescriptionString5to50Bytes;
                basket: BasketStringUnder300Bytes;
                tags: OutputTagStringUnder300Bytes[];
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
                basket: BasketStringUnder300Bytes;
                customInstructions?: string;
                tags?: OutputTagStringUnder300Bytes[];
            };
        }>;
        description: DescriptionString5to50Bytes;
        labels?: LabelStringUnder300Bytes[];
    }): Promise<{
        accepted: true;
    }> 
    async listOutputs(args: {
        basket: BasketStringUnder300Bytes;
        tags?: OutputTagStringUnder300Bytes[];
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
            spendable: boolean;
            customInstructions?: string;
            tags?: OutputTagStringUnder300Bytes[];
            labels?: LabelStringUnder300Bytes[];
        }>;
    }> 
    async relinquishOutput(args: {
        basket: BasketStringUnder300Bytes;
        output: OutpointString;
    }): Promise<{
        relinquished: true;
    }> 
    async getPublicKey(args: {
        identityKey?: true;
        protocolID?: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID?: KeyIDStringUnder800Bytes;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        forSelf?: BooleanDefaultFalse;
    }): Promise<{
        publicKey: PubKeyHex;
    }> 
    async revealCounterpartyKeyLinkage(args: {
        counterparty: PubKeyHex;
        verifier: PubKeyHex;
        privilegedReason?: DescriptionString5to50Bytes;
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
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        prover: PubKeyHex;
        verifier: PubKeyHex;
        counterparty: PubKeyHex;
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        encryptedLinkage: Byte[];
        encryptedLinkageProof: Byte[];
        proofType: Byte;
    }> 
    async encrypt(args: {
        plaintext: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        ciphertext: Byte[];
    }> 
    async decrypt(args: {
        ciphertext: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        plaintext: Byte[];
    }> 
    async createHmac(args: {
        data: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        hmac: Byte[];
    }> 
    async verifyHmac(args: {
        data: Byte[];
        hmac: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
        counterparty?: PubKeyHex | "self" | "anyone";
        privileged?: BooleanDefaultFalse;
    }): Promise<{
        valid: true;
    }> 
    async createSignature(args: {
        data?: Byte[];
        hashToDirectlySign?: Byte[];
        protocolID: [
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
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
            SecurityLevel,
            ProtocolString5To400Bytes
        ];
        keyID: KeyIDStringUnder800Bytes;
        privilegedReason?: DescriptionString5to50Bytes;
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
        fields: Record<CertificateFieldNameUnder50Bytes, string>;
        certifier: PubKeyHex;
        keyringRevealer: PubKeyHex | "certifier";
        keyringForSubject: Record<CertificateFieldNameUnder50Bytes, Base64String>;
        acquisitionProtocol: "direct" | "issuance";
        certifierUrl?: string;
    }): Promise<{
        type: Base64String;
        subject: PubKeyHex;
        serialNumber: Base64String;
        certifier: PubKeyHex;
        revocationOutpoint: OutpointString;
        signature: HexString;
        fields: Record<CertificateFieldNameUnder50Bytes, string>;
    }> 
    async listCertificates(args: {
        certifiers: PubKeyHex[];
        types: Base64String[];
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Bytes;
    }): Promise<{
        totalCertificates: PositiveIntegerOrZero;
        certificates: Array<{
            type: Base64String;
            subject: PubKeyHex;
            serialNumber: Base64String;
            certifier: PubKeyHex;
            revocationOutpoint: OutpointString;
            signature: HexString;
            fields: Record<CertificateFieldNameUnder50Bytes, string>;
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
            fields: Record<CertificateFieldNameUnder50Bytes, string>;
        };
        fieldsToReveal: CertificateFieldNameUnder50Bytes[];
        verifier: PubKeyHex;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Bytes;
    }): Promise<{
        keyringForVerifier: Record<CertificateFieldNameUnder50Bytes, Base64String>;
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
            fields: Record<CertificateFieldNameUnder50Bytes, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Bytes;
                iconUrl: EntityIconURLStringMax500Bytes;
                description: DescriptionString5to50Bytes;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Bytes, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>;
        }>;
    }> 
    async discoverByAttributes(args: {
        attributes: Record<CertificateFieldNameUnder50Bytes, string>;
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
            fields: Record<CertificateFieldNameUnder50Bytes, Base64String>;
            certifierInfo: {
                name: EntityNameStringMax100Bytes;
                iconUrl: EntityIconURLStringMax500Bytes;
                description: DescriptionString5to50Bytes;
                trust: PositiveIntegerMax10;
            };
            publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Bytes, Base64String>;
            decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>;
        }>;
    }> 
    async isAuthenticated(args: {}): Promise<{
        authenticated: true;
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
        version: VersionString7To30Bytes;
    }> 
}
```

See also: [BEEF](./wallet.md#type-beef), [Base64String](./wallet.md#type-base64string), [BasketStringUnder300Bytes](./wallet.md#type-basketstringunder300bytes), [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [BooleanDefaultTrue](./wallet.md#type-booleandefaulttrue), [Byte](./wallet.md#type-byte), [CallType](./wallet.md#type-calltype), [CertificateFieldNameUnder50Bytes](./wallet.md#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [EntityIconURLStringMax500Bytes](./wallet.md#type-entityiconurlstringmax500bytes), [EntityNameStringMax100Bytes](./wallet.md#type-entitynamestringmax100bytes), [HexString](./wallet.md#type-hexstring), [ISOTimestampString](./wallet.md#type-isotimestampstring), [KeyIDStringUnder800Bytes](./wallet.md#type-keyidstringunder800bytes), [LabelStringUnder300Bytes](./wallet.md#type-labelstringunder300bytes), [OutpointString](./wallet.md#type-outpointstring), [OutputTagStringUnder300Bytes](./wallet.md#type-outputtagstringunder300bytes), [PositiveInteger](./wallet.md#type-positiveinteger), [PositiveIntegerDefault10Max10000](./wallet.md#type-positiveintegerdefault10max10000), [PositiveIntegerMax10](./wallet.md#type-positiveintegermax10), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [ProtocolString5To400Bytes](./wallet.md#type-protocolstring5to400bytes), [PubKeyHex](./wallet.md#type-pubkeyhex), [SatoshiValue](./wallet.md#type-satoshivalue), [SecurityLevel](./wallet.md#type-securitylevel), [TXIDHexString](./wallet.md#type-txidhexstring), [VersionString7To30Bytes](./wallet.md#type-versionstring7to30bytes), [WalletInterface](./wallet.md#interface-walletinterface), [decrypt](./messages.md#variable-decrypt), [encrypt](./messages.md#variable-encrypt)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Functions

## Types

### Type: CallType

```ts
export type CallType = keyof typeof calls
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Enums

## Variables

