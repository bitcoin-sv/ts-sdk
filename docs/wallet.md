# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

## Interfaces

| | | |
| --- | --- | --- |
| [AbortActionArgs](#interface-abortactionargs) | [InternalizeActionResult](#interface-internalizeactionresult) | [SignActionOptions](#interface-signactionoptions) |
| [AbortActionResult](#interface-abortactionresult) | [InternalizeOutput](#interface-internalizeoutput) | [SignActionResult](#interface-signactionresult) |
| [AcquireCertificateArgs](#interface-acquirecertificateargs) | [KeyLinkageArgs](#interface-keylinkageargs) | [SignActionSpend](#interface-signactionspend) |
| [AcquireCertificateResult](#interface-acquirecertificateresult) | [KeyLinkageResult](#interface-keylinkageresult) | [SignableTransaction](#interface-signabletransaction) |
| [BasketInsertion](#interface-basketinsertion) | [ListActionsArgs](#interface-listactionsargs) | [VerifyHmacArgs](#interface-verifyhmacargs) |
| [CreateActionArgs](#interface-createactionargs) | [ListActionsResult](#interface-listactionsresult) | [VerifySignatureArgs](#interface-verifysignatureargs) |
| [CreateActionInput](#interface-createactioninput) | [ListCertificatesArgs](#interface-listcertificatesargs) | [Wallet](#interface-wallet) |
| [CreateActionOptions](#interface-createactionoptions) | [ListCertificatesResult](#interface-listcertificatesresult) | [WalletAction](#interface-walletaction) |
| [CreateActionOutput](#interface-createactionoutput) | [ListOutputsArgs](#interface-listoutputsargs) | [WalletActionInput](#interface-walletactioninput) |
| [CreateActionResult](#interface-createactionresult) | [ListOutputsResult](#interface-listoutputsresult) | [WalletActionOutput](#interface-walletactionoutput) |
| [CreateHmacArgs](#interface-createhmacargs) | [ProveCertificateArgs](#interface-provecertificateargs) | [WalletCertificate](#interface-walletcertificate) |
| [CreateSignatureArgs](#interface-createsignatureargs) | [ProveCertificateResult](#interface-provecertificateresult) | [WalletDecryptArgs](#interface-walletdecryptargs) |
| [DiscoverByAttributesArgs](#interface-discoverbyattributesargs) | [RelinquishCertificateArgs](#interface-relinquishcertificateargs) | [WalletEncryptArgs](#interface-walletencryptargs) |
| [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs) | [RevealCounterpartyKeyLinkageArgs](#interface-revealcounterpartykeylinkageargs) | [WalletEncryptionArgs](#interface-walletencryptionargs) |
| [DiscoverCertificatesResult](#interface-discovercertificatesresult) | [RevealCounterpartyKeyLinkageResult](#interface-revealcounterpartykeylinkageresult) | [WalletErrorObject](#interface-walleterrorobject) |
| [GetPublicKeyArgs](#interface-getpublickeyargs) | [RevealSpecificKeyLinkageArgs](#interface-revealspecifickeylinkageargs) | [WalletOutput](#interface-walletoutput) |
| [IdentityCertificate](#interface-identitycertificate) | [RevealSpecificKeyLinkageResult](#interface-revealspecifickeylinkageresult) | [WalletPayment](#interface-walletpayment) |
| [IdentityCertifier](#interface-identitycertifier) | [SendWithResult](#interface-sendwithresult) | [WalletWire](#interface-walletwire) |
| [InternalizeActionArgs](#interface-internalizeactionargs) | [SignActionArgs](#interface-signactionargs) |  |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Interface: AbortActionArgs

```ts
export interface AbortActionArgs {
    reference: Base64String;
}
```

See also: [Base64String](#type-base64string)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: AbortActionResult

```ts
export interface AbortActionResult {
    aborted: true;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: AcquireCertificateArgs

```ts
export interface AcquireCertificateArgs {
    type: Base64String;
    certifier: PubKeyHex;
    acquisitionProtocol: AcquisitionProtocol;
    fields: Record<CertificateFieldNameUnder50Bytes, string>;
    serialNumber?: Base64String;
    revocationOutpoint?: OutpointString;
    signature?: HexString;
    certifierUrl?: string;
    keyringRevealer?: KeyringRevealer;
    keyringForSubject?: Record<CertificateFieldNameUnder50Bytes, Base64String>;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Bytes;
}
```

See also: [AcquisitionProtocol](#type-acquisitionprotocol), [Base64String](#type-base64string), [BooleanDefaultFalse](#type-booleandefaultfalse), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [KeyringRevealer](#type-keyringrevealer), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: AcquireCertificateResult

```ts
export interface AcquireCertificateResult extends WalletCertificate {
}
```

See also: [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: BasketInsertion

```ts
export interface BasketInsertion {
    basket: BasketStringUnder300Bytes;
    customInstructions?: string;
    tags?: OutputTagStringUnder300Bytes[];
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: CreateActionArgs

```ts
export interface CreateActionArgs {
    description: DescriptionString5to50Bytes;
    inputBEEF?: BEEF;
    inputs?: CreateActionInput[];
    outputs?: CreateActionOutput[];
    lockTime?: PositiveIntegerOrZero;
    version?: PositiveIntegerOrZero;
    labels?: LabelStringUnder300Bytes[];
    options?: CreateActionOptions;
}
```

See also: [BEEF](#type-beef), [CreateActionInput](#interface-createactioninput), [CreateActionOptions](#interface-createactionoptions), [CreateActionOutput](#interface-createactionoutput), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: CreateActionInput

```ts
export interface CreateActionInput {
    outpoint: OutpointString;
    inputDescription: DescriptionString5to50Bytes;
    unlockingScript?: HexString;
    unlockingScriptLength?: PositiveInteger;
    sequenceNumber?: PositiveIntegerOrZero;
}
```

See also: [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PositiveInteger](#type-positiveinteger), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: CreateActionOptions

```ts
export interface CreateActionOptions {
    signAndProcess?: BooleanDefaultTrue;
    acceptDelayedBroadcast?: BooleanDefaultTrue;
    trustSelf?: TrustSelf;
    knownTxids?: TXIDHexString[];
    returnTXIDOnly?: BooleanDefaultFalse;
    noSend?: BooleanDefaultFalse;
    noSendChange?: OutpointString[];
    sendWith?: TXIDHexString[];
    randomizeOutputs?: BooleanDefaultTrue;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [OutpointString](#type-outpointstring), [TXIDHexString](#type-txidhexstring), [TrustSelf](#type-trustself)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: CreateActionOutput

```ts
export interface CreateActionOutput {
    lockingScript: HexString;
    satoshis: SatoshiValue;
    outputDescription: DescriptionString5to50Bytes;
    basket?: BasketStringUnder300Bytes;
    customInstructions?: string;
    tags?: OutputTagStringUnder300Bytes[];
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: CreateActionResult

```ts
export interface CreateActionResult {
    txid?: TXIDHexString;
    tx?: AtomicBEEF;
    noSendChange?: OutpointString[];
    sendWithResults?: SendWithResult[];
    signableTransaction?: SignableTransaction;
}
```

See also: [AtomicBEEF](#type-atomicbeef), [OutpointString](#type-outpointstring), [SendWithResult](#interface-sendwithresult), [SignableTransaction](#interface-signabletransaction), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: CreateHmacArgs

```ts
export interface CreateHmacArgs extends WalletEncryptionArgs {
    data: Byte[];
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: CreateSignatureArgs

```ts
export interface CreateSignatureArgs extends WalletEncryptionArgs {
    data?: Byte[];
    hashToDirectlySign?: Byte[];
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: DiscoverByAttributesArgs

```ts
export interface DiscoverByAttributesArgs {
    attributes: Record<CertificateFieldNameUnder50Bytes, string>;
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [BooleanDefaultTrue](#type-booleandefaulttrue), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: DiscoverByIdentityKeyArgs

```ts
export interface DiscoverByIdentityKeyArgs {
    identityKey: PubKeyHex;
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [BooleanDefaultTrue](#type-booleandefaulttrue), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: DiscoverCertificatesResult

```ts
export interface DiscoverCertificatesResult {
    totalCertificates: PositiveIntegerOrZero;
    certificates: IdentityCertificate[];
}
```

See also: [IdentityCertificate](#interface-identitycertificate), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: GetPublicKeyArgs

When `identityKey` is true, `WalletEncryptionArgs` are not used.

When `identityKey` is undefined, `WalletEncryptionArgs` are required.

```ts
export interface GetPublicKeyArgs extends Partial<WalletEncryptionArgs> {
    identityKey?: true;
    forSelf?: BooleanDefaultFalse;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: IdentityCertificate

```ts
export interface IdentityCertificate extends WalletCertificate {
    certifierInfo: IdentityCertifier;
    publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Bytes, Base64String>;
    decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>;
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [IdentityCertifier](#interface-identitycertifier), [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: IdentityCertifier

```ts
export interface IdentityCertifier {
    name: EntityNameStringMax100Bytes;
    iconUrl: EntityIconURLStringMax500Bytes;
    description: DescriptionString5to50Bytes;
    trust: PositiveIntegerMax10;
}
```

See also: [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [EntityIconURLStringMax500Bytes](#type-entityiconurlstringmax500bytes), [EntityNameStringMax100Bytes](#type-entitynamestringmax100bytes), [PositiveIntegerMax10](#type-positiveintegermax10)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: InternalizeActionArgs

```ts
export interface InternalizeActionArgs {
    tx: AtomicBEEF;
    outputs: InternalizeOutput[];
    description: DescriptionString5to50Bytes;
    labels?: LabelStringUnder300Bytes[];
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [AtomicBEEF](#type-atomicbeef), [BooleanDefaultTrue](#type-booleandefaulttrue), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [InternalizeOutput](#interface-internalizeoutput), [LabelStringUnder300Bytes](#type-labelstringunder300bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: InternalizeActionResult

```ts
export interface InternalizeActionResult {
    accepted: true;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: InternalizeOutput

```ts
export interface InternalizeOutput {
    outputIndex: PositiveIntegerOrZero;
    protocol: "wallet payment" | "basket insertion";
    paymentRemittance?: WalletPayment;
    insertionRemittance?: BasketInsertion;
}
```

See also: [BasketInsertion](#interface-basketinsertion), [PositiveIntegerOrZero](#type-positiveintegerorzero), [WalletPayment](#interface-walletpayment)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: KeyLinkageArgs

```ts
export interface KeyLinkageArgs {
    protocolID: [
        SecurityLevel,
        ProtocolString5To400Bytes
    ];
    keyID: KeyIDStringUnder800Bytes;
    counterparty?: WalletCounterparty;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Bytes;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [ProtocolString5To400Bytes](#type-protocolstring5to400bytes), [SecurityLevel](#type-securitylevel), [WalletCounterparty](#type-walletcounterparty)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: KeyLinkageResult

```ts
export interface KeyLinkageResult {
    encryptedLinkage: Byte[];
    encryptedLinkageProof: Byte[];
    prover: PubKeyHex;
    verifier: PubKeyHex;
    counterparty: PubKeyHex;
}
```

See also: [Byte](#type-byte), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ListActionsArgs

```ts
export interface ListActionsArgs {
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
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ListActionsResult

```ts
export interface ListActionsResult {
    totalActions: PositiveIntegerOrZero;
    actions: WalletAction[];
}
```

See also: [PositiveIntegerOrZero](#type-positiveintegerorzero), [WalletAction](#interface-walletaction)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ListCertificatesArgs

```ts
export interface ListCertificatesArgs {
    certifiers: PubKeyHex[];
    types: Base64String[];
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Bytes;
}
```

See also: [Base64String](#type-base64string), [BooleanDefaultFalse](#type-booleandefaultfalse), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ListCertificatesResult

```ts
export interface ListCertificatesResult {
    totalCertificates: PositiveIntegerOrZero;
    certificates: WalletCertificate[];
}
```

See also: [PositiveIntegerOrZero](#type-positiveintegerorzero), [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ListOutputsArgs

```ts
export interface ListOutputsArgs {
    basket: BasketStringUnder300Bytes;
    tags?: OutputTagStringUnder300Bytes[];
    tagQueryMode?: "all" | "any";
    include?: "locking scripts" | "entire transactions";
    includeCustomInstructions?: BooleanDefaultFalse;
    includeTags?: BooleanDefaultFalse;
    includeLabels?: BooleanDefaultFalse;
    limit?: PositiveIntegerDefault10Max10000;
    offset?: PositiveIntegerOrZero;
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ListOutputsResult

```ts
export interface ListOutputsResult {
    totalOutputs: PositiveIntegerOrZero;
    BEEF?: BEEF;
    outputs: WalletOutput[];
}
```

See also: [BEEF](#type-beef), [PositiveIntegerOrZero](#type-positiveintegerorzero), [WalletOutput](#interface-walletoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ProveCertificateArgs

```ts
export interface ProveCertificateArgs {
    certificate: WalletCertificate;
    fieldsToReveal: CertificateFieldNameUnder50Bytes[];
    verifier: PubKeyHex;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Bytes;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [PubKeyHex](#type-pubkeyhex), [WalletCertificate](#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ProveCertificateResult

```ts
export interface ProveCertificateResult {
    keyringForVerifier: Record<CertificateFieldNameUnder50Bytes, Base64String>;
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RelinquishCertificateArgs

```ts
export interface RelinquishCertificateArgs {
    type: Base64String;
    serialNumber: Base64String;
    certifier: PubKeyHex;
}
```

See also: [Base64String](#type-base64string), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RevealCounterpartyKeyLinkageArgs

```ts
export interface RevealCounterpartyKeyLinkageArgs {
    counterparty: PubKeyHex;
    verifier: PubKeyHex;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Bytes;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RevealCounterpartyKeyLinkageResult

```ts
export interface RevealCounterpartyKeyLinkageResult extends KeyLinkageResult {
    revelationTime: ISOTimestampString;
}
```

See also: [ISOTimestampString](#type-isotimestampstring), [KeyLinkageResult](#interface-keylinkageresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RevealSpecificKeyLinkageArgs

```ts
export interface RevealSpecificKeyLinkageArgs extends KeyLinkageArgs {
    verifier: PubKeyHex;
    counterparty: WalletCounterparty;
}
```

See also: [KeyLinkageArgs](#interface-keylinkageargs), [PubKeyHex](#type-pubkeyhex), [WalletCounterparty](#type-walletcounterparty)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RevealSpecificKeyLinkageResult

```ts
export interface RevealSpecificKeyLinkageResult extends KeyLinkageResult {
    protocolID: WalletProtocol;
    keyID: KeyIDStringUnder800Bytes;
    proofType: Byte;
}
```

See also: [Byte](#type-byte), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [KeyLinkageResult](#interface-keylinkageresult), [WalletProtocol](#type-walletprotocol)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: SendWithResult

```ts
export interface SendWithResult {
    txid: TXIDHexString;
    status: "unproven" | "sending" | "failed";
}
```

See also: [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: SignActionArgs

```ts
export interface SignActionArgs {
    spends: Record<PositiveIntegerOrZero, SignActionSpend>;
    reference: Base64String;
    options?: SignActionOptions;
}
```

See also: [Base64String](#type-base64string), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SignActionOptions](#interface-signactionoptions), [SignActionSpend](#interface-signactionspend)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: SignActionOptions

```ts
export interface SignActionOptions {
    acceptDelayedBroadcast?: BooleanDefaultTrue;
    returnTXIDOnly?: BooleanDefaultFalse;
    noSend?: BooleanDefaultFalse;
    sendWith?: TXIDHexString[];
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: SignActionResult

```ts
export interface SignActionResult {
    txid?: TXIDHexString;
    tx?: AtomicBEEF;
    sendWithResults?: SendWithResult[];
}
```

See also: [AtomicBEEF](#type-atomicbeef), [SendWithResult](#interface-sendwithresult), [TXIDHexString](#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: SignActionSpend

```ts
export interface SignActionSpend {
    unlockingScript: HexString;
    sequenceNumber?: PositiveIntegerOrZero;
}
```

See also: [HexString](#type-hexstring), [PositiveIntegerOrZero](#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: SignableTransaction

```ts
export interface SignableTransaction {
    tx: AtomicBEEF;
    reference: Base64String;
}
```

See also: [AtomicBEEF](#type-atomicbeef), [Base64String](#type-base64string)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: VerifyHmacArgs

```ts
export interface VerifyHmacArgs extends WalletEncryptionArgs {
    data: Byte[];
    hmac: Byte[];
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: VerifySignatureArgs

```ts
export interface VerifySignatureArgs extends WalletEncryptionArgs {
    data?: Byte[];
    hashToDirectlyVerify?: Byte[];
    signature: Byte[];
    forSelf?: BooleanDefaultFalse;
}
```

See also: [BooleanDefaultFalse](#type-booleandefaultfalse), [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: Wallet

The Wallet interface defines a wallet capable of various tasks including transaction creation and signing,
encryption, decryption, identity certificate management, identity verification, and communication
with applications as per the BRC standards. This interface allows applications to interact with
the wallet for a range of functionalities aligned with the Babbage architectural principles.

Error Handling

Every method of the `Wallet` interface has a return value of the form `Promise<object>`.
When an error occurs, an exception object may be thrown which must conform to the `WalletError` interface.
Serialization layers can rely on the `isError` property being unique to error objects to
deserialize and rethrow `WalletError` conforming objects.

```ts
export interface Wallet {
    createAction: (args: CreateActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateActionResult>;
    signAction: (args: SignActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<SignActionResult>;
    abortAction: (args: AbortActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AbortActionResult>;
    listActions: (args: ListActionsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListActionsResult>;
    internalizeAction: (args: InternalizeActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<InternalizeActionResult>;
    listOutputs: (args: ListOutputsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListOutputsResult>;
    relinquishOutput: (args: {
        basket: BasketStringUnder300Bytes;
        output: OutpointString;
    }, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        relinquished: true;
    }>;
    getPublicKey: (args: GetPublicKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        publicKey: PubKeyHex;
    }>;
    revealCounterpartyKeyLinkage: (args: RevealCounterpartyKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealCounterpartyKeyLinkageResult>;
    revealSpecificKeyLinkage: (args: RevealSpecificKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealSpecificKeyLinkageResult>;
    encrypt: (args: WalletEncryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        ciphertext: Byte[];
    }>;
    decrypt: (args: WalletDecryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        plaintext: Byte[];
    }>;
    createHmac: (args: CreateHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        hmac: Byte[];
    }>;
    verifyHmac: (args: VerifyHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        valid: true;
    }>;
    createSignature: (args: CreateSignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        signature: Byte[];
    }>;
    verifySignature: (args: VerifySignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        valid: true;
    }>;
    acquireCertificate: (args: AcquireCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AcquireCertificateResult>;
    listCertificates: (args: ListCertificatesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListCertificatesResult>;
    proveCertificate: (args: ProveCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ProveCertificateResult>;
    relinquishCertificate: (args: RelinquishCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        relinquished: true;
    }>;
    discoverByIdentityKey: (args: DiscoverByIdentityKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>;
    discoverByAttributes: (args: DiscoverByAttributesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>;
    isAuthenticated: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        authenticated: boolean;
    }>;
    waitForAuthentication: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        authenticated: true;
    }>;
    getHeight: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        height: PositiveInteger;
    }>;
    getHeaderForHeight: (args: {
        height: PositiveInteger;
    }, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        header: HexString;
    }>;
    getNetwork: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        network: WalletNetwork;
    }>;
    getVersion: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
        version: VersionString7To30Bytes;
    }>;
}
```

See also: [AbortActionArgs](#interface-abortactionargs), [AbortActionResult](#interface-abortactionresult), [AcquireCertificateArgs](#interface-acquirecertificateargs), [AcquireCertificateResult](#interface-acquirecertificateresult), [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [Byte](#type-byte), [CreateActionArgs](#interface-createactionargs), [CreateActionResult](#interface-createactionresult), [CreateHmacArgs](#interface-createhmacargs), [CreateSignatureArgs](#interface-createsignatureargs), [DiscoverByAttributesArgs](#interface-discoverbyattributesargs), [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [GetPublicKeyArgs](#interface-getpublickeyargs), [HexString](#type-hexstring), [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesArgs](#interface-listcertificatesargs), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [OutpointString](#type-outpointstring), [PositiveInteger](#type-positiveinteger), [ProveCertificateArgs](#interface-provecertificateargs), [ProveCertificateResult](#interface-provecertificateresult), [PubKeyHex](#type-pubkeyhex), [RelinquishCertificateArgs](#interface-relinquishcertificateargs), [RevealCounterpartyKeyLinkageArgs](#interface-revealcounterpartykeylinkageargs), [RevealCounterpartyKeyLinkageResult](#interface-revealcounterpartykeylinkageresult), [RevealSpecificKeyLinkageArgs](#interface-revealspecifickeylinkageargs), [RevealSpecificKeyLinkageResult](#interface-revealspecifickeylinkageresult), [SignActionArgs](#interface-signactionargs), [SignActionResult](#interface-signactionresult), [VerifyHmacArgs](#interface-verifyhmacargs), [VerifySignatureArgs](#interface-verifysignatureargs), [VersionString7To30Bytes](#type-versionstring7to30bytes), [WalletDecryptArgs](#interface-walletdecryptargs), [WalletEncryptArgs](#interface-walletencryptargs), [WalletNetwork](#type-walletnetwork), [decrypt](#variable-decrypt), [encrypt](#variable-encrypt)

<details>

<summary>Interface Wallet Details</summary>

#### Property abortAction

Aborts a transaction that is in progress and has not yet been finalized or sent to the network.

```ts
abortAction: (args: AbortActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AbortActionResult>
```
See also: [AbortActionArgs](#interface-abortactionargs), [AbortActionResult](#interface-abortactionresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

#### Property acquireCertificate

Acquires an identity certificate, whether by acquiring one from the certifier or by directly receiving it.

```ts
acquireCertificate: (args: AcquireCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AcquireCertificateResult>
```
See also: [AcquireCertificateArgs](#interface-acquirecertificateargs), [AcquireCertificateResult](#interface-acquirecertificateresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

#### Property createAction

Creates a new Bitcoin transaction based on the provided inputs, outputs, labels, locks, and other options.

```ts
createAction: (args: CreateActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateActionResult>
```
See also: [CreateActionArgs](#interface-createactionargs), [CreateActionResult](#interface-createactionresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

#### Property createHmac

Creates an HMAC (Hash-based Message Authentication Code) based on the provided data, protocol, key ID, counterparty, and other factors.

```ts
createHmac: (args: CreateHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    hmac: Byte[];
}>
```
See also: [Byte](#type-byte), [CreateHmacArgs](#interface-createhmacargs), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

#### Property createSignature

Creates a digital signature for the provided data or hash using a specific protocol, key, and optionally considering privilege and counterparty.

```ts
createSignature: (args: CreateSignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    signature: Byte[];
}>
```
See also: [Byte](#type-byte), [CreateSignatureArgs](#interface-createsignatureargs), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

#### Property decrypt

Decrypts the provided ciphertext using derived keys, based on the protocol ID, key ID, counterparty, and other factors.

```ts
decrypt: (args: WalletDecryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    plaintext: Byte[];
}>
```
See also: [Byte](#type-byte), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [WalletDecryptArgs](#interface-walletdecryptargs)

#### Property discoverByAttributes

Discovers identity certificates belonging to other users, where the documents contain specific attributes, issued by a trusted entity.

```ts
discoverByAttributes: (args: DiscoverByAttributesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>
```
See also: [DiscoverByAttributesArgs](#interface-discoverbyattributesargs), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

#### Property discoverByIdentityKey

Discovers identity certificates, issued to a given identity key by a trusted entity.

```ts
discoverByIdentityKey: (args: DiscoverByIdentityKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>
```
See also: [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

#### Property encrypt

Encrypts the provided plaintext data using derived keys, based on the protocol ID, key ID, counterparty, and other factors.

```ts
encrypt: (args: WalletEncryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    ciphertext: Byte[];
}>
```
See also: [Byte](#type-byte), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [WalletEncryptArgs](#interface-walletencryptargs)

#### Property getHeaderForHeight

Retrieves the block header of a block at a specified height.

```ts
getHeaderForHeight: (args: {
    height: PositiveInteger;
}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    header: HexString;
}>
```
See also: [HexString](#type-hexstring), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [PositiveInteger](#type-positiveinteger)

#### Property getHeight

Retrieves the current height of the blockchain.

```ts
getHeight: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    height: PositiveInteger;
}>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [PositiveInteger](#type-positiveinteger)

#### Property getNetwork

Retrieves the Bitcoin network the client is using (mainnet or testnet).

```ts
getNetwork: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    network: WalletNetwork;
}>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [WalletNetwork](#type-walletnetwork)

#### Property getPublicKey

Retrieves a derived or identity public key based on the requested protocol, key ID, counterparty, and other factors.

```ts
getPublicKey: (args: GetPublicKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    publicKey: PubKeyHex;
}>
```
See also: [GetPublicKeyArgs](#interface-getpublickeyargs), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [PubKeyHex](#type-pubkeyhex)

#### Property getVersion

Retrieves the current version string of the wallet.

```ts
getVersion: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    version: VersionString7To30Bytes;
}>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [VersionString7To30Bytes](#type-versionstring7to30bytes)

#### Property internalizeAction

Submits a transaction to be internalized and optionally labeled, outputs paid to the wallet balance, inserted into baskets, and/or tagged.

```ts
internalizeAction: (args: InternalizeActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<InternalizeActionResult>
```
See also: [InternalizeActionArgs](#interface-internalizeactionargs), [InternalizeActionResult](#interface-internalizeactionresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

#### Property isAuthenticated

Checks the authentication status of the user.

```ts
isAuthenticated: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    authenticated: boolean;
}>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

#### Property listActions

Lists all transactions matching the specified labels.

```ts
listActions: (args: ListActionsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListActionsResult>
```
See also: [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

#### Property listCertificates

Lists identity certificates belonging to the user, filtered by certifier(s) and type(s).

```ts
listCertificates: (args: ListCertificatesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListCertificatesResult>
```
See also: [ListCertificatesArgs](#interface-listcertificatesargs), [ListCertificatesResult](#interface-listcertificatesresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

#### Property listOutputs

Lists the spendable outputs kept within a specific basket, optionally tagged with specific labels.

```ts
listOutputs: (args: ListOutputsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListOutputsResult>
```
See also: [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

#### Property proveCertificate

Proves select fields of an identity certificate, as specified, when requested by a verifier.

```ts
proveCertificate: (args: ProveCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ProveCertificateResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [ProveCertificateArgs](#interface-provecertificateargs), [ProveCertificateResult](#interface-provecertificateresult)

#### Property relinquishCertificate

Relinquishes an identity certificate, removing it from the wallet regardless of whether the revocation outpoint has become spent.

```ts
relinquishCertificate: (args: RelinquishCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    relinquished: true;
}>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [RelinquishCertificateArgs](#interface-relinquishcertificateargs)

#### Property relinquishOutput

Relinquish an output out of a basket, removing it from tracking without spending it.

```ts
relinquishOutput: (args: {
    basket: BasketStringUnder300Bytes;
    output: OutpointString;
}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    relinquished: true;
}>
```
See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [OutpointString](#type-outpointstring)

#### Property revealCounterpartyKeyLinkage

Reveals the key linkage between ourselves and a counterparty, to a particular verifier, across all interactions with the counterparty.

```ts
revealCounterpartyKeyLinkage: (args: RevealCounterpartyKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealCounterpartyKeyLinkageResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [RevealCounterpartyKeyLinkageArgs](#interface-revealcounterpartykeylinkageargs), [RevealCounterpartyKeyLinkageResult](#interface-revealcounterpartykeylinkageresult)

#### Property revealSpecificKeyLinkage

Reveals the key linkage between ourselves and a counterparty, to a particular verifier, with respect to a specific interaction.

```ts
revealSpecificKeyLinkage: (args: RevealSpecificKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealSpecificKeyLinkageResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [RevealSpecificKeyLinkageArgs](#interface-revealspecifickeylinkageargs), [RevealSpecificKeyLinkageResult](#interface-revealspecifickeylinkageresult)

#### Property signAction

Signs a transaction previously created using `createAction`.

```ts
signAction: (args: SignActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<SignActionResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [SignActionArgs](#interface-signactionargs), [SignActionResult](#interface-signactionresult)

#### Property verifyHmac

Verifies an HMAC (Hash-based Message Authentication Code) based on the provided data, protocol, key ID, counterparty, and other factors.

```ts
verifyHmac: (args: VerifyHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    valid: true;
}>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [VerifyHmacArgs](#interface-verifyhmacargs)

#### Property verifySignature

Verifies a digital signature for the provided data or hash using a specific protocol, key, and optionally considering privilege and counterparty.

```ts
verifySignature: (args: VerifySignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    valid: true;
}>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [VerifySignatureArgs](#interface-verifysignatureargs)

#### Property waitForAuthentication

Continuously waits until the user is authenticated, returning the result once confirmed.

```ts
waitForAuthentication: (args: {}, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<{
    authenticated: true;
}>
```
See also: [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletAction

```ts
export interface WalletAction {
    txid: TXIDHexString;
    satoshis: SatoshiValue;
    status: ActionStatus;
    isOutgoing: boolean;
    description: DescriptionString5to50Bytes;
    labels?: LabelStringUnder300Bytes[];
    version: PositiveIntegerOrZero;
    lockTime: PositiveIntegerOrZero;
    inputs?: WalletActionInput[];
    outputs?: WalletActionOutput[];
}
```

See also: [ActionStatus](#type-actionstatus), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SatoshiValue](#type-satoshivalue), [TXIDHexString](#type-txidhexstring), [WalletActionInput](#interface-walletactioninput), [WalletActionOutput](#interface-walletactionoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletActionInput

```ts
export interface WalletActionInput {
    sourceOutpoint: OutpointString;
    sourceSatoshis: SatoshiValue;
    sourceLockingScript?: HexString;
    unlockingScript?: HexString;
    inputDescription: DescriptionString5to50Bytes;
    sequenceNumber: PositiveIntegerOrZero;
}
```

See also: [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletActionOutput

```ts
export interface WalletActionOutput {
    satoshis: SatoshiValue;
    lockingScript?: HexString;
    spendable: boolean;
    customInstructions?: string;
    tags: OutputTagStringUnder300Bytes[];
    outputIndex: PositiveIntegerOrZero;
    outputDescription: DescriptionString5to50Bytes;
    basket: BasketStringUnder300Bytes;
}
```

See also: [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [HexString](#type-hexstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [PositiveIntegerOrZero](#type-positiveintegerorzero), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletCertificate

```ts
export interface WalletCertificate {
    type: Base64String;
    subject: PubKeyHex;
    serialNumber: Base64String;
    certifier: PubKeyHex;
    revocationOutpoint: OutpointString;
    signature: HexString;
    fields: Record<CertificateFieldNameUnder50Bytes, string>;
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletDecryptArgs

```ts
export interface WalletDecryptArgs extends WalletEncryptionArgs {
    ciphertext: Byte[];
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletEncryptArgs

```ts
export interface WalletEncryptArgs extends WalletEncryptionArgs {
    plaintext: Byte[];
}
```

See also: [Byte](#type-byte), [WalletEncryptionArgs](#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletEncryptionArgs

```ts
export interface WalletEncryptionArgs extends KeyLinkageArgs {
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [BooleanDefaultTrue](#type-booleandefaulttrue), [KeyLinkageArgs](#interface-keylinkageargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletErrorObject

Every method of the `Wallet` interface has a return value of the form `Promise<object>`.
When errors occur, an exception object may be thrown which must conform to the `WalletError` interface.
Serialization layers can rely on the `isError` property being unique to error objects.
Deserialization should rethrow `WalletError` conforming objects.

```ts
export interface WalletErrorObject extends Error {
    isError: true;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletOutput

```ts
export interface WalletOutput {
    satoshis: SatoshiValue;
    lockingScript?: HexString;
    spendable: true;
    customInstructions?: string;
    tags?: OutputTagStringUnder300Bytes[];
    outpoint: OutpointString;
    labels?: LabelStringUnder300Bytes[];
}
```

See also: [HexString](#type-hexstring), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [OutpointString](#type-outpointstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [SatoshiValue](#type-satoshivalue)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletPayment

```ts
export interface WalletPayment {
    derivationPrefix: Base64String;
    derivationSuffix: Base64String;
    senderIdentityKey: PubKeyHex;
}
```

See also: [Base64String](#type-base64string), [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
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
| [CachedKeyDeriver](#class-cachedkeyderiver) |
| [HTTPWalletJSON](#class-httpwalletjson) |
| [HTTPWalletWire](#class-httpwalletwire) |
| [KeyDeriver](#class-keyderiver) |
| [ProtoWallet](#class-protowallet) |
| [WalletClient](#class-walletclient) |
| [WalletError](#class-walleterror) |
| [WalletWireProcessor](#class-walletwireprocessor) |
| [WalletWireTransceiver](#class-walletwiretransceiver) |
| [WindowCWISubstrate](#class-windowcwisubstrate) |
| [XDMSubstrate](#class-xdmsubstrate) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

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
        SecurityLevel,
        string
    ], keyID: string, counterparty: PublicKey | string | "self" | "anyone", forSelf: boolean = false): PublicKey 
    derivePrivateKey(protocolID: [
        SecurityLevel,
        string
    ], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): PrivateKey 
    deriveSymmetricKey(protocolID: [
        SecurityLevel,
        string
    ], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): SymmetricKey 
    revealCounterpartySecret(counterparty: PublicKey | string | "self" | "anyone"): number[] 
    revealSpecificSecret(counterparty: PublicKey | string | "self" | "anyone", protocolID: [
        SecurityLevel,
        string
    ], keyID: string): number[] 
}
```

See also: [PrivateKey](#class-privatekey), [PublicKey](#class-publickey), [SecurityLevel](#type-securitylevel), [SymmetricKey](#class-symmetrickey)

<details>

<summary>Class CachedKeyDeriver Details</summary>

#### Constructor

Initializes the CachedKeyDeriver instance with a root private key and optional cache settings.

```ts
constructor(rootKey: PrivateKey | "anyone", options?: {
    maxCacheSize?: number;
}) 
```
See also: [PrivateKey](#class-privatekey)

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
    SecurityLevel,
    string
], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): PrivateKey 
```
See also: [PrivateKey](#class-privatekey), [PublicKey](#class-publickey), [SecurityLevel](#type-securitylevel)

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
    SecurityLevel,
    string
], keyID: string, counterparty: PublicKey | string | "self" | "anyone", forSelf: boolean = false): PublicKey 
```
See also: [PublicKey](#class-publickey), [SecurityLevel](#type-securitylevel)

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
    SecurityLevel,
    string
], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): SymmetricKey 
```
See also: [PublicKey](#class-publickey), [SecurityLevel](#type-securitylevel), [SymmetricKey](#class-symmetrickey)

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
See also: [PublicKey](#class-publickey)

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
    SecurityLevel,
    string
], keyID: string): number[] 
```
See also: [PublicKey](#class-publickey), [SecurityLevel](#type-securitylevel)

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

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: HTTPWalletJSON

```ts
export default class HTTPWalletJSON implements Wallet {
    baseUrl: string;
    httpClient: typeof fetch;
    originator: OriginatorDomainNameStringUnder250Bytes | undefined;
    api: (call: string, args: any) => Promise<any>;
    constructor(originator: OriginatorDomainNameStringUnder250Bytes | undefined, baseUrl: string = "http://localhost:3321", httpClient = fetch) 
    async createAction(args: CreateActionArgs): Promise<CreateActionResult> 
    async signAction(args: SignActionArgs): Promise<SignActionResult> 
    async abortAction(args: {
        reference: Base64String;
    }): Promise<{
        aborted: true;
    }> 
    async listActions(args: ListActionsArgs): Promise<ListActionsResult> 
    async internalizeAction(args: InternalizeActionArgs): Promise<{
        accepted: true;
    }> 
    async listOutputs(args: ListOutputsArgs): Promise<ListOutputsResult> 
    async relinquishOutput(args: {
        basket: BasketStringUnder300Bytes;
        output: OutpointString;
    }): Promise<{
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
    }): Promise<{
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
    }): Promise<{
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
    }): Promise<{
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
    }): Promise<{
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
    }): Promise<{
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
    }): Promise<{
        valid: true;
    }> 
    async acquireCertificate(args: AcquireCertificateArgs): Promise<AcquireCertificateResult> 
    async listCertificates(args: {
        certifiers: PubKeyHex[];
        types: Base64String[];
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Bytes;
    }): Promise<ListCertificatesResult> 
    async proveCertificate(args: ProveCertificateArgs): Promise<ProveCertificateResult> 
    async relinquishCertificate(args: {
        type: Base64String;
        serialNumber: Base64String;
        certifier: PubKeyHex;
    }): Promise<{
        relinquished: true;
    }> 
    async discoverByIdentityKey(args: {
        seekPermission?: BooleanDefaultTrue;
        identityKey: PubKeyHex;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }): Promise<DiscoverCertificatesResult> 
    async discoverByAttributes(args: {
        seekPermission?: BooleanDefaultTrue;
        attributes: Record<CertificateFieldNameUnder50Bytes, string>;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }): Promise<DiscoverCertificatesResult> 
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
        version: VersionString7To30Bytes;
    }> 
}
```

See also: [AcquireCertificateArgs](#interface-acquirecertificateargs), [AcquireCertificateResult](#interface-acquirecertificateresult), [Base64String](#type-base64string), [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [Byte](#type-byte), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [CreateActionArgs](#interface-createactionargs), [CreateActionResult](#interface-createactionresult), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [HexString](#type-hexstring), [ISOTimestampString](#type-isotimestampstring), [InternalizeActionArgs](#interface-internalizeactionargs), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [OutpointString](#type-outpointstring), [PositiveInteger](#type-positiveinteger), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [ProtocolString5To400Bytes](#type-protocolstring5to400bytes), [ProveCertificateArgs](#interface-provecertificateargs), [ProveCertificateResult](#interface-provecertificateresult), [PubKeyHex](#type-pubkeyhex), [SecurityLevel](#type-securitylevel), [SignActionArgs](#interface-signactionargs), [SignActionResult](#interface-signactionresult), [VersionString7To30Bytes](#type-versionstring7to30bytes), [Wallet](#interface-wallet), [decrypt](#variable-decrypt), [encrypt](#variable-encrypt)

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

See also: [WalletWire](#interface-walletwire)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: KeyDeriver

Class responsible for deriving various types of keys using a root private key.
It supports deriving public and private keys, symmetric keys, and revealing key linkages.

```ts
export default class KeyDeriver {
    rootKey: PrivateKey;
    constructor(rootKey: PrivateKey | "anyone") 
    derivePublicKey(protocolID: [
        SecurityLevel,
        string
    ], keyID: string, counterparty: PublicKey | string | "self" | "anyone", forSelf: boolean = false): PublicKey 
    derivePrivateKey(protocolID: [
        SecurityLevel,
        string
    ], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): PrivateKey 
    deriveSymmetricKey(protocolID: [
        SecurityLevel,
        string
    ], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): SymmetricKey 
    revealCounterpartySecret(counterparty: PublicKey | string | "self" | "anyone"): number[] 
    revealSpecificSecret(counterparty: PublicKey | string | "self" | "anyone", protocolID: [
        SecurityLevel,
        string
    ], keyID: string): number[] 
}
```

See also: [PrivateKey](#class-privatekey), [PublicKey](#class-publickey), [SecurityLevel](#type-securitylevel), [SymmetricKey](#class-symmetrickey)

<details>

<summary>Class KeyDeriver Details</summary>

#### Constructor

Initializes the KeyDeriver instance with a root private key.

```ts
constructor(rootKey: PrivateKey | "anyone") 
```
See also: [PrivateKey](#class-privatekey)

Argument Details

+ **rootKey**
  + The root private key or the string 'anyone'.

#### Method derivePrivateKey

Derives a private key based on protocol ID, key ID, and counterparty.

```ts
derivePrivateKey(protocolID: [
    SecurityLevel,
    string
], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): PrivateKey 
```
See also: [PrivateKey](#class-privatekey), [PublicKey](#class-publickey), [SecurityLevel](#type-securitylevel)

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
    SecurityLevel,
    string
], keyID: string, counterparty: PublicKey | string | "self" | "anyone", forSelf: boolean = false): PublicKey 
```
See also: [PublicKey](#class-publickey), [SecurityLevel](#type-securitylevel)

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
    SecurityLevel,
    string
], keyID: string, counterparty: PublicKey | string | "self" | "anyone"): SymmetricKey 
```
See also: [PublicKey](#class-publickey), [SecurityLevel](#type-securitylevel), [SymmetricKey](#class-symmetrickey)

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
See also: [PublicKey](#class-publickey)

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
    SecurityLevel,
    string
], keyID: string): number[] 
```
See also: [PublicKey](#class-publickey), [SecurityLevel](#type-securitylevel)

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

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: ProtoWallet

A ProtoWallet is a structure that fulfills the Wallet interface, capable of performing all foundational cryptographic operations. It can derive keys, create signatures, facilitate encryption and HMAC operations, and reveal key linkages. However, ProtoWallet does not create transactions, manage outputs, interact with the blockchain, enable the management of identity certificates, or store any data.

```ts
export default class ProtoWallet implements Wallet {
    keyDeriver: KeyDeriver;
    privilegedError: string = "ProtoWallet is a single-keyring wallet, operating without context about whether its configured keyring is privileged.";
    constructor(rootKey: PrivateKey | "anyone", KeyDeriverClass = KeyDeriver) 
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
            randomizeOutputs?: BooleanDefaultTrue;
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
            spendable: true;
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
        certifier: PubKeyHex;
        acquisitionProtocol: "direct" | "issuance";
        fields: Record<CertificateFieldNameUnder50Bytes, string>;
        serialNumber?: Base64String;
        revocationOutpoint?: OutpointString;
        signature?: HexString;
        certifierUrl?: string;
        keyringRevealer?: PubKeyHex | "certifier";
        keyringForSubject?: Record<CertificateFieldNameUnder50Bytes, Base64String>;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Bytes;
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
    async isAuthenticated(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        authenticated: boolean;
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

See also: [BEEF](#type-beef), [Base64String](#type-base64string), [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [Byte](#type-byte), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [EntityIconURLStringMax500Bytes](#type-entityiconurlstringmax500bytes), [EntityNameStringMax100Bytes](#type-entitynamestringmax100bytes), [HexString](#type-hexstring), [ISOTimestampString](#type-isotimestampstring), [KeyDeriver](#class-keyderiver), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [OutpointString](#type-outpointstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [PositiveInteger](#type-positiveinteger), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerMax10](#type-positiveintegermax10), [PositiveIntegerOrZero](#type-positiveintegerorzero), [PrivateKey](#class-privatekey), [ProtocolString5To400Bytes](#type-protocolstring5to400bytes), [PubKeyHex](#type-pubkeyhex), [SatoshiValue](#type-satoshivalue), [SecurityLevel](#type-securitylevel), [TXIDHexString](#type-txidhexstring), [VersionString7To30Bytes](#type-versionstring7to30bytes), [Wallet](#interface-wallet), [decrypt](#variable-decrypt), [encrypt](#variable-encrypt)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: WalletClient

The SDK is how applications communicate with wallets over a communications substrate.

```ts
export default class WalletClient implements Wallet {
    public substrate: "auto" | Wallet;
    originator?: OriginatorDomainNameStringUnder250Bytes;
    constructor(substrate: "auto" | "Cicada" | "XDM" | "window.CWI" | "json-api" | Wallet = "auto", originator?: OriginatorDomainNameStringUnder250Bytes) 
    async connectToSubstrate() 
    async createAction(args: CreateActionArgs): Promise<CreateActionResult> 
    async signAction(args: SignActionArgs): Promise<SignActionResult> 
    async abortAction(args: {
        reference: Base64String;
    }): Promise<{
        aborted: true;
    }> 
    async listActions(args: ListActionsArgs): Promise<ListActionsResult> 
    async internalizeAction(args: InternalizeActionArgs): Promise<{
        accepted: true;
    }> 
    async listOutputs(args: ListOutputsArgs): Promise<ListOutputsResult> 
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
    async acquireCertificate(args: AcquireCertificateArgs): Promise<AcquireCertificateResult> 
    async listCertificates(args: {
        certifiers: PubKeyHex[];
        types: Base64String[];
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
        privileged?: BooleanDefaultFalse;
        privilegedReason?: DescriptionString5to50Bytes;
    }): Promise<ListCertificatesResult> 
    async proveCertificate(args: ProveCertificateArgs): Promise<ProveCertificateResult> 
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
    }): Promise<DiscoverCertificatesResult> 
    async discoverByAttributes(args: {
        attributes: Record<CertificateFieldNameUnder50Bytes, string>;
        limit?: PositiveIntegerDefault10Max10000;
        offset?: PositiveIntegerOrZero;
    }): Promise<DiscoverCertificatesResult> 
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
        version: VersionString7To30Bytes;
    }> 
}
```

See also: [AcquireCertificateArgs](#interface-acquirecertificateargs), [AcquireCertificateResult](#interface-acquirecertificateresult), [Base64String](#type-base64string), [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [BooleanDefaultFalse](#type-booleandefaultfalse), [Byte](#type-byte), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [CreateActionArgs](#interface-createactionargs), [CreateActionResult](#interface-createactionresult), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [HexString](#type-hexstring), [ISOTimestampString](#type-isotimestampstring), [InternalizeActionArgs](#interface-internalizeactionargs), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [OutpointString](#type-outpointstring), [PositiveInteger](#type-positiveinteger), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [ProtocolString5To400Bytes](#type-protocolstring5to400bytes), [ProveCertificateArgs](#interface-provecertificateargs), [ProveCertificateResult](#interface-provecertificateresult), [PubKeyHex](#type-pubkeyhex), [SecurityLevel](#type-securitylevel), [SignActionArgs](#interface-signactionargs), [SignActionResult](#interface-signactionresult), [VersionString7To30Bytes](#type-versionstring7to30bytes), [Wallet](#interface-wallet), [decrypt](#variable-decrypt), [encrypt](#variable-encrypt)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: WalletError

```ts
export class WalletError extends Error {
    code: number;
    isError: boolean = true;
    constructor(message: string, code = 1, stack?: string) 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: WalletWireProcessor

Processes incoming wallet calls received over a wallet wire, with a given wallet.

```ts
export default class WalletWireProcessor implements WalletWire {
    wallet: Wallet;
    constructor(wallet: Wallet) 
    async transmitToWallet(message: number[]): Promise<number[]> 
}
```

See also: [Wallet](#interface-wallet), [WalletWire](#interface-walletwire)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: WalletWireTransceiver

A way to make remote calls to a wallet over a wallet wire.

```ts
export default class WalletWireTransceiver implements Wallet {
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
        authenticated: boolean;
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

See also: [AcquireCertificateArgs](#interface-acquirecertificateargs), [AcquireCertificateResult](#interface-acquirecertificateresult), [Base64String](#type-base64string), [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [Byte](#type-byte), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [CreateActionArgs](#interface-createactionargs), [CreateActionResult](#interface-createactionresult), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [DiscoverCertificatesResult](#interface-discovercertificatesresult), [HexString](#type-hexstring), [ISOTimestampString](#type-isotimestampstring), [InternalizeActionArgs](#interface-internalizeactionargs), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [ListActionsArgs](#interface-listactionsargs), [ListActionsResult](#interface-listactionsresult), [ListCertificatesResult](#interface-listcertificatesresult), [ListOutputsArgs](#interface-listoutputsargs), [ListOutputsResult](#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [OutpointString](#type-outpointstring), [PositiveInteger](#type-positiveinteger), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](#type-positiveintegerorzero), [ProtocolString5To400Bytes](#type-protocolstring5to400bytes), [ProveCertificateArgs](#interface-provecertificateargs), [ProveCertificateResult](#interface-provecertificateresult), [PubKeyHex](#type-pubkeyhex), [SecurityLevel](#type-securitylevel), [SignActionArgs](#interface-signactionargs), [SignActionResult](#interface-signactionresult), [VersionString7To30Bytes](#type-versionstring7to30bytes), [Wallet](#interface-wallet), [WalletWire](#interface-walletwire), [decrypt](#variable-decrypt), [encrypt](#variable-encrypt)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: WindowCWISubstrate

Facilitates wallet operations over the window.CWI interface.

```ts
export default class WindowCWISubstrate implements Wallet {
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
            spendable: true;
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
    async isAuthenticated(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{
        authenticated: boolean;
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

See also: [BEEF](#type-beef), [Base64String](#type-base64string), [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [Byte](#type-byte), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [EntityIconURLStringMax500Bytes](#type-entityiconurlstringmax500bytes), [EntityNameStringMax100Bytes](#type-entitynamestringmax100bytes), [HexString](#type-hexstring), [ISOTimestampString](#type-isotimestampstring), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes), [OutpointString](#type-outpointstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [PositiveInteger](#type-positiveinteger), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerMax10](#type-positiveintegermax10), [PositiveIntegerOrZero](#type-positiveintegerorzero), [ProtocolString5To400Bytes](#type-protocolstring5to400bytes), [PubKeyHex](#type-pubkeyhex), [SatoshiValue](#type-satoshivalue), [SecurityLevel](#type-securitylevel), [TXIDHexString](#type-txidhexstring), [VersionString7To30Bytes](#type-versionstring7to30bytes), [Wallet](#interface-wallet), [decrypt](#variable-decrypt), [encrypt](#variable-encrypt)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: XDMSubstrate

Facilitates wallet operations over cross-document messaging.

```ts
export default class XDMSubstrate implements Wallet {
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
            spendable: true;
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
        version: VersionString7To30Bytes;
    }> 
}
```

See also: [BEEF](#type-beef), [Base64String](#type-base64string), [BasketStringUnder300Bytes](#type-basketstringunder300bytes), [BooleanDefaultFalse](#type-booleandefaultfalse), [BooleanDefaultTrue](#type-booleandefaulttrue), [Byte](#type-byte), [CallType](#type-calltype), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes), [EntityIconURLStringMax500Bytes](#type-entityiconurlstringmax500bytes), [EntityNameStringMax100Bytes](#type-entitynamestringmax100bytes), [HexString](#type-hexstring), [ISOTimestampString](#type-isotimestampstring), [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes), [LabelStringUnder300Bytes](#type-labelstringunder300bytes), [OutpointString](#type-outpointstring), [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes), [PositiveInteger](#type-positiveinteger), [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000), [PositiveIntegerMax10](#type-positiveintegermax10), [PositiveIntegerOrZero](#type-positiveintegerorzero), [ProtocolString5To400Bytes](#type-protocolstring5to400bytes), [PubKeyHex](#type-pubkeyhex), [SatoshiValue](#type-satoshivalue), [SecurityLevel](#type-securitylevel), [TXIDHexString](#type-txidhexstring), [VersionString7To30Bytes](#type-versionstring7to30bytes), [Wallet](#interface-wallet), [decrypt](#variable-decrypt), [encrypt](#variable-encrypt)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Functions

## Types

| | | |
| --- | --- | --- |
| [AcquisitionProtocol](#type-acquisitionprotocol) | [EntityNameStringMax100Bytes](#type-entitynamestringmax100bytes) | [PositiveIntegerMax10](#type-positiveintegermax10) |
| [ActionStatus](#type-actionstatus) | [ErrorCodeString10To40Bytes](#type-errorcodestring10to40bytes) | [PositiveIntegerOrZero](#type-positiveintegerorzero) |
| [AtomicBEEF](#type-atomicbeef) | [ErrorDescriptionString20To200Bytes](#type-errordescriptionstring20to200bytes) | [ProtocolString5To400Bytes](#type-protocolstring5to400bytes) |
| [BEEF](#type-beef) | [HexString](#type-hexstring) | [PubKeyHex](#type-pubkeyhex) |
| [Base64String](#type-base64string) | [ISOTimestampString](#type-isotimestampstring) | [SatoshiValue](#type-satoshivalue) |
| [BasketStringUnder300Bytes](#type-basketstringunder300bytes) | [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes) | [SecurityLevel](#type-securitylevel) |
| [BooleanDefaultFalse](#type-booleandefaultfalse) | [KeyringRevealer](#type-keyringrevealer) | [TXIDHexString](#type-txidhexstring) |
| [BooleanDefaultTrue](#type-booleandefaulttrue) | [LabelStringUnder300Bytes](#type-labelstringunder300bytes) | [TrustSelf](#type-trustself) |
| [Byte](#type-byte) | [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes) | [VersionString7To30Bytes](#type-versionstring7to30bytes) |
| [CallType](#type-calltype) | [OutpointString](#type-outpointstring) | [WalletCounterparty](#type-walletcounterparty) |
| [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes) | [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes) | [WalletErrorCode](#type-walleterrorcode) |
| [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes) | [PositiveInteger](#type-positiveinteger) | [WalletNetwork](#type-walletnetwork) |
| [EntityIconURLStringMax500Bytes](#type-entityiconurlstringmax500bytes) | [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000) | [WalletProtocol](#type-walletprotocol) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Type: AcquisitionProtocol

```ts
export type AcquisitionProtocol = "direct" | "issuance"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: ActionStatus

```ts
export type ActionStatus = "completed" | "unprocessed" | "sending" | "unproven" | "unsigned" | "nosend" | "nonfinal"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: AtomicBEEF

```ts
export type AtomicBEEF = Byte[]
```

See also: [Byte](#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: BEEF

```ts
export type BEEF = Byte[]
```

See also: [Byte](#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: Base64String

```ts
export type Base64String = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: BasketStringUnder300Bytes

```ts
export type BasketStringUnder300Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: BooleanDefaultFalse

```ts
export type BooleanDefaultFalse = boolean
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: BooleanDefaultTrue

```ts
export type BooleanDefaultTrue = boolean
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: Byte

```ts
export type Byte = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: CallType

```ts
export type CallType = keyof typeof calls
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: CertificateFieldNameUnder50Bytes

```ts
export type CertificateFieldNameUnder50Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: DescriptionString5to50Bytes

```ts
export type DescriptionString5to50Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: EntityIconURLStringMax500Bytes

```ts
export type EntityIconURLStringMax500Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: EntityNameStringMax100Bytes

```ts
export type EntityNameStringMax100Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: ErrorCodeString10To40Bytes

```ts
export type ErrorCodeString10To40Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: ErrorDescriptionString20To200Bytes

```ts
export type ErrorDescriptionString20To200Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: HexString

```ts
export type HexString = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: ISOTimestampString

```ts
export type ISOTimestampString = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: KeyIDStringUnder800Bytes

```ts
export type KeyIDStringUnder800Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: KeyringRevealer

```ts
export type KeyringRevealer = PubKeyHex | "certifier"
```

See also: [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: LabelStringUnder300Bytes

```ts
export type LabelStringUnder300Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: OriginatorDomainNameStringUnder250Bytes

```ts
export type OriginatorDomainNameStringUnder250Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: OutpointString

```ts
export type OutpointString = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: OutputTagStringUnder300Bytes

```ts
export type OutputTagStringUnder300Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: PositiveInteger

```ts
export type PositiveInteger = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: PositiveIntegerDefault10Max10000

```ts
export type PositiveIntegerDefault10Max10000 = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: PositiveIntegerMax10

```ts
export type PositiveIntegerMax10 = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: PositiveIntegerOrZero

```ts
export type PositiveIntegerOrZero = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: ProtocolString5To400Bytes

```ts
export type ProtocolString5To400Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: PubKeyHex

```ts
export type PubKeyHex = HexString
```

See also: [HexString](#type-hexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: SatoshiValue

```ts
export type SatoshiValue = number
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: SecurityLevel


SecurityLevel for protocols.
0 = Silently grants the request with no user interation.
1 = Requires user approval for every application.
2 = Requires user approval per counterparty per application.

```ts
export type SecurityLevel = 0 | 1 | 2
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: TXIDHexString

```ts
export type TXIDHexString = HexString
```

See also: [HexString](#type-hexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: TrustSelf

Controls behavior of input BEEF validation.

If `known`, input transactions may omit supporting validity proof data for all TXIDs known to this wallet.

If undefined, input BEEFs must be complete and valid.

```ts
export type TrustSelf = "known"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: VersionString7To30Bytes

```ts
export type VersionString7To30Bytes = string
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: WalletCounterparty

```ts
export type WalletCounterparty = PubKeyHex | "self" | "anyone"
```

See also: [PubKeyHex](#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: WalletErrorCode

```ts
export type WalletErrorCode = keyof typeof walletErrors
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: WalletNetwork

```ts
export type WalletNetwork = "mainnet" | "testnet"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: WalletProtocol

```ts
export type WalletProtocol = [
    SecurityLevel,
    ProtocolString5To400Bytes
]
```

See also: [ProtocolString5To400Bytes](#type-protocolstring5to400bytes), [SecurityLevel](#type-securitylevel)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Enums

### Enum: SecurityLevels

```ts
export enum SecurityLevels {
    Silent = 0,
    App = 1,
    Counterparty = 2
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Variables

