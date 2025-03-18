# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

## Interfaces

| | | |
| --- | --- | --- |
| [AbortActionArgs](#interface-abortactionargs) | [GetVersionResult](#interface-getversionresult) | [SendWithResult](#interface-sendwithresult) |
| [AbortActionResult](#interface-abortactionresult) | [IdentityCertificate](#interface-identitycertificate) | [SignActionArgs](#interface-signactionargs) |
| [AcquireCertificateArgs](#interface-acquirecertificateargs) | [IdentityCertifier](#interface-identitycertifier) | [SignActionOptions](#interface-signactionoptions) |
| [AuthenticatedResult](#interface-authenticatedresult) | [InternalizeActionArgs](#interface-internalizeactionargs) | [SignActionResult](#interface-signactionresult) |
| [BasketInsertion](#interface-basketinsertion) | [InternalizeActionResult](#interface-internalizeactionresult) | [SignActionSpend](#interface-signactionspend) |
| [CertificateResult](#interface-certificateresult) | [InternalizeOutput](#interface-internalizeoutput) | [SignableTransaction](#interface-signabletransaction) |
| [CreateActionArgs](#interface-createactionargs) | [KeyDeriverApi](#interface-keyderiverapi) | [VerifyHmacArgs](#interface-verifyhmacargs) |
| [CreateActionInput](#interface-createactioninput) | [KeyLinkageResult](#interface-keylinkageresult) | [VerifyHmacResult](#interface-verifyhmacresult) |
| [CreateActionOptions](#interface-createactionoptions) | [ListActionsArgs](#interface-listactionsargs) | [VerifySignatureArgs](#interface-verifysignatureargs) |
| [CreateActionOutput](#interface-createactionoutput) | [ListActionsResult](#interface-listactionsresult) | [VerifySignatureResult](#interface-verifysignatureresult) |
| [CreateActionResult](#interface-createactionresult) | [ListCertificatesArgs](#interface-listcertificatesargs) | [WalletAction](#interface-walletaction) |
| [CreateHmacArgs](#interface-createhmacargs) | [ListCertificatesResult](#interface-listcertificatesresult) | [WalletActionInput](#interface-walletactioninput) |
| [CreateHmacResult](#interface-createhmacresult) | [ListOutputsArgs](#interface-listoutputsargs) | [WalletActionOutput](#interface-walletactionoutput) |
| [CreateSignatureArgs](#interface-createsignatureargs) | [ListOutputsResult](#interface-listoutputsresult) | [WalletCertificate](#interface-walletcertificate) |
| [CreateSignatureResult](#interface-createsignatureresult) | [ProveCertificateArgs](#interface-provecertificateargs) | [WalletDecryptArgs](#interface-walletdecryptargs) |
| [DiscoverByAttributesArgs](#interface-discoverbyattributesargs) | [ProveCertificateResult](#interface-provecertificateresult) | [WalletDecryptResult](#interface-walletdecryptresult) |
| [DiscoverByIdentityKeyArgs](#interface-discoverbyidentitykeyargs) | [RelinquishCertificateArgs](#interface-relinquishcertificateargs) | [WalletEncryptArgs](#interface-walletencryptargs) |
| [DiscoverCertificatesResult](#interface-discovercertificatesresult) | [RelinquishCertificateResult](#interface-relinquishcertificateresult) | [WalletEncryptResult](#interface-walletencryptresult) |
| [GetHeaderArgs](#interface-getheaderargs) | [RelinquishOutputArgs](#interface-relinquishoutputargs) | [WalletEncryptionArgs](#interface-walletencryptionargs) |
| [GetHeaderResult](#interface-getheaderresult) | [RelinquishOutputResult](#interface-relinquishoutputresult) | [WalletErrorObject](#interface-walleterrorobject) |
| [GetHeightResult](#interface-getheightresult) | [RevealCounterpartyKeyLinkageArgs](#interface-revealcounterpartykeylinkageargs) | [WalletInterface](#interface-walletinterface) |
| [GetNetworkResult](#interface-getnetworkresult) | [RevealCounterpartyKeyLinkageResult](#interface-revealcounterpartykeylinkageresult) | [WalletOutput](#interface-walletoutput) |
| [GetPublicKeyArgs](#interface-getpublickeyargs) | [RevealSpecificKeyLinkageArgs](#interface-revealspecifickeylinkageargs) | [WalletPayment](#interface-walletpayment) |
| [GetPublicKeyResult](#interface-getpublickeyresult) | [RevealSpecificKeyLinkageResult](#interface-revealspecifickeylinkageresult) | [WalletWire](#interface-walletwire) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Interface: AbortActionArgs

```ts
export interface AbortActionArgs {
    reference: Base64String;
}
```

See also: [Base64String](./wallet.md#type-base64string)

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

See also: [AcquisitionProtocol](./wallet.md#type-acquisitionprotocol), [Base64String](./wallet.md#type-base64string), [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [CertificateFieldNameUnder50Bytes](./wallet.md#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [HexString](./wallet.md#type-hexstring), [KeyringRevealer](./wallet.md#type-keyringrevealer), [OutpointString](./wallet.md#type-outpointstring), [PubKeyHex](./wallet.md#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: AuthenticatedResult

```ts
export interface AuthenticatedResult {
    authenticated: true;
}
```

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

See also: [BasketStringUnder300Bytes](./wallet.md#type-basketstringunder300bytes), [OutputTagStringUnder300Bytes](./wallet.md#type-outputtagstringunder300bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: CertificateResult

```ts
export interface CertificateResult extends WalletCertificate {
    keyring?: Record<CertificateFieldNameUnder50Bytes, Base64String>;
    verifier?: string;
}
```

See also: [Base64String](./wallet.md#type-base64string), [CertificateFieldNameUnder50Bytes](./wallet.md#type-certificatefieldnameunder50bytes), [WalletCertificate](./wallet.md#interface-walletcertificate)

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

See also: [BEEF](./wallet.md#type-beef), [CreateActionInput](./wallet.md#interface-createactioninput), [CreateActionOptions](./wallet.md#interface-createactionoptions), [CreateActionOutput](./wallet.md#interface-createactionoutput), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [LabelStringUnder300Bytes](./wallet.md#type-labelstringunder300bytes), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero)

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

See also: [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [HexString](./wallet.md#type-hexstring), [OutpointString](./wallet.md#type-outpointstring), [PositiveInteger](./wallet.md#type-positiveinteger), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero)

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

See also: [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [BooleanDefaultTrue](./wallet.md#type-booleandefaulttrue), [OutpointString](./wallet.md#type-outpointstring), [TXIDHexString](./wallet.md#type-txidhexstring), [TrustSelf](./wallet.md#type-trustself)

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

See also: [BasketStringUnder300Bytes](./wallet.md#type-basketstringunder300bytes), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [HexString](./wallet.md#type-hexstring), [OutputTagStringUnder300Bytes](./wallet.md#type-outputtagstringunder300bytes), [SatoshiValue](./wallet.md#type-satoshivalue)

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

See also: [AtomicBEEF](./wallet.md#type-atomicbeef), [OutpointString](./wallet.md#type-outpointstring), [SendWithResult](./wallet.md#interface-sendwithresult), [SignableTransaction](./wallet.md#interface-signabletransaction), [TXIDHexString](./wallet.md#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: CreateHmacArgs

```ts
export interface CreateHmacArgs extends WalletEncryptionArgs {
    data: Byte[];
}
```

See also: [Byte](./wallet.md#type-byte), [WalletEncryptionArgs](./wallet.md#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: CreateHmacResult

```ts
export interface CreateHmacResult {
    hmac: Byte[];
}
```

See also: [Byte](./wallet.md#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: CreateSignatureArgs

```ts
export interface CreateSignatureArgs extends WalletEncryptionArgs {
    data?: Byte[];
    hashToDirectlySign?: Byte[];
}
```

See also: [Byte](./wallet.md#type-byte), [WalletEncryptionArgs](./wallet.md#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: CreateSignatureResult

```ts
export interface CreateSignatureResult {
    signature: Byte[];
}
```

See also: [Byte](./wallet.md#type-byte)

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

See also: [BooleanDefaultTrue](./wallet.md#type-booleandefaulttrue), [CertificateFieldNameUnder50Bytes](./wallet.md#type-certificatefieldnameunder50bytes), [PositiveIntegerDefault10Max10000](./wallet.md#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero)

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

See also: [BooleanDefaultTrue](./wallet.md#type-booleandefaulttrue), [PositiveIntegerDefault10Max10000](./wallet.md#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [PubKeyHex](./wallet.md#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: DiscoverCertificatesResult

```ts
export interface DiscoverCertificatesResult {
    totalCertificates: PositiveIntegerOrZero;
    certificates: IdentityCertificate[];
}
```

See also: [IdentityCertificate](./wallet.md#interface-identitycertificate), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: GetHeaderArgs

```ts
export interface GetHeaderArgs {
    height: PositiveInteger;
}
```

See also: [PositiveInteger](./wallet.md#type-positiveinteger)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: GetHeaderResult

```ts
export interface GetHeaderResult {
    header: HexString;
}
```

See also: [HexString](./wallet.md#type-hexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: GetHeightResult

```ts
export interface GetHeightResult {
    height: PositiveInteger;
}
```

See also: [PositiveInteger](./wallet.md#type-positiveinteger)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: GetNetworkResult

```ts
export interface GetNetworkResult {
    network: WalletNetwork;
}
```

See also: [WalletNetwork](./wallet.md#type-walletnetwork)

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

See also: [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [WalletEncryptionArgs](./wallet.md#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: GetPublicKeyResult

```ts
export interface GetPublicKeyResult {
    publicKey: PubKeyHex;
}
```

See also: [PubKeyHex](./wallet.md#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: GetVersionResult

```ts
export interface GetVersionResult {
    version: VersionString7To30Bytes;
}
```

See also: [VersionString7To30Bytes](./wallet.md#type-versionstring7to30bytes)

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

See also: [Base64String](./wallet.md#type-base64string), [CertificateFieldNameUnder50Bytes](./wallet.md#type-certificatefieldnameunder50bytes), [IdentityCertifier](./wallet.md#interface-identitycertifier), [WalletCertificate](./wallet.md#interface-walletcertificate)

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

See also: [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [EntityIconURLStringMax500Bytes](./wallet.md#type-entityiconurlstringmax500bytes), [EntityNameStringMax100Bytes](./wallet.md#type-entitynamestringmax100bytes), [PositiveIntegerMax10](./wallet.md#type-positiveintegermax10)

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

See also: [AtomicBEEF](./wallet.md#type-atomicbeef), [BooleanDefaultTrue](./wallet.md#type-booleandefaulttrue), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [InternalizeOutput](./wallet.md#interface-internalizeoutput), [LabelStringUnder300Bytes](./wallet.md#type-labelstringunder300bytes)

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

See also: [BasketInsertion](./wallet.md#interface-basketinsertion), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [WalletPayment](./wallet.md#interface-walletpayment)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: KeyDeriverApi

```ts
export interface KeyDeriverApi {
    rootKey: PrivateKey;
    identityKey: string;
    derivePublicKey: (protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf?: boolean) => PublicKey;
    derivePrivateKey: (protocolID: WalletProtocol, keyID: string, counterparty: Counterparty) => PrivateKey;
    deriveSymmetricKey: (protocolID: WalletProtocol, keyID: string, counterparty: Counterparty) => SymmetricKey;
    revealCounterpartySecret: (counterparty: Counterparty) => number[];
    revealSpecificSecret: (counterparty: Counterparty, protocolID: WalletProtocol, keyID: string) => number[];
}
```

See also: [Counterparty](./wallet.md#type-counterparty), [PrivateKey](./primitives.md#class-privatekey), [PublicKey](./primitives.md#class-publickey), [SymmetricKey](./primitives.md#class-symmetrickey), [WalletProtocol](./wallet.md#type-walletprotocol)

#### Property derivePrivateKey

Derives a private key based on protocol ID, key ID, and counterparty.

```ts
derivePrivateKey: (protocolID: WalletProtocol, keyID: string, counterparty: Counterparty) => PrivateKey
```
See also: [Counterparty](./wallet.md#type-counterparty), [PrivateKey](./primitives.md#class-privatekey), [WalletProtocol](./wallet.md#type-walletprotocol)

#### Property derivePublicKey

Derives a public key based on protocol ID, key ID, and counterparty.

```ts
derivePublicKey: (protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf?: boolean) => PublicKey
```
See also: [Counterparty](./wallet.md#type-counterparty), [PublicKey](./primitives.md#class-publickey), [WalletProtocol](./wallet.md#type-walletprotocol)

#### Property deriveSymmetricKey

Derives a symmetric key based on protocol ID, key ID, and counterparty.
Note: Symmetric keys should not be derivable by everyone due to security risks.

```ts
deriveSymmetricKey: (protocolID: WalletProtocol, keyID: string, counterparty: Counterparty) => SymmetricKey
```
See also: [Counterparty](./wallet.md#type-counterparty), [SymmetricKey](./primitives.md#class-symmetrickey), [WalletProtocol](./wallet.md#type-walletprotocol)

#### Property identityKey

The identity of this key deriver which is normally the public key associated with the `rootKey`

```ts
identityKey: string
```

#### Property revealCounterpartySecret

Reveals the shared secret between the root key and the counterparty.
Note: This should not be used for 'self'.

```ts
revealCounterpartySecret: (counterparty: Counterparty) => number[]
```
See also: [Counterparty](./wallet.md#type-counterparty)

#### Property revealSpecificSecret

Reveals the specific key association for a given protocol ID, key ID, and counterparty.

```ts
revealSpecificSecret: (counterparty: Counterparty, protocolID: WalletProtocol, keyID: string) => number[]
```
See also: [Counterparty](./wallet.md#type-counterparty), [WalletProtocol](./wallet.md#type-walletprotocol)

#### Property rootKey

The root key from which all other keys are derived.

```ts
rootKey: PrivateKey
```
See also: [PrivateKey](./primitives.md#class-privatekey)

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

See also: [Byte](./wallet.md#type-byte), [PubKeyHex](./wallet.md#type-pubkeyhex)

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

See also: [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [BooleanDefaultTrue](./wallet.md#type-booleandefaulttrue), [LabelStringUnder300Bytes](./wallet.md#type-labelstringunder300bytes), [PositiveIntegerDefault10Max10000](./wallet.md#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ListActionsResult

```ts
export interface ListActionsResult {
    totalActions: PositiveIntegerOrZero;
    actions: WalletAction[];
}
```

See also: [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [WalletAction](./wallet.md#interface-walletaction)

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

See also: [Base64String](./wallet.md#type-base64string), [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [PositiveIntegerDefault10Max10000](./wallet.md#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [PubKeyHex](./wallet.md#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ListCertificatesResult

```ts
export interface ListCertificatesResult {
    totalCertificates: PositiveIntegerOrZero;
    certificates: CertificateResult[];
}
```

See also: [CertificateResult](./wallet.md#interface-certificateresult), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero)

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

See also: [BasketStringUnder300Bytes](./wallet.md#type-basketstringunder300bytes), [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [BooleanDefaultTrue](./wallet.md#type-booleandefaulttrue), [OutputTagStringUnder300Bytes](./wallet.md#type-outputtagstringunder300bytes), [PositiveIntegerDefault10Max10000](./wallet.md#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero)

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

See also: [BEEF](./wallet.md#type-beef), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [WalletOutput](./wallet.md#interface-walletoutput)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ProveCertificateArgs

```ts
export interface ProveCertificateArgs {
    certificate: Partial<WalletCertificate>;
    fieldsToReveal: CertificateFieldNameUnder50Bytes[];
    verifier: PubKeyHex;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Bytes;
}
```

See also: [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [CertificateFieldNameUnder50Bytes](./wallet.md#type-certificatefieldnameunder50bytes), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [PubKeyHex](./wallet.md#type-pubkeyhex), [WalletCertificate](./wallet.md#interface-walletcertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: ProveCertificateResult

```ts
export interface ProveCertificateResult {
    keyringForVerifier: Record<CertificateFieldNameUnder50Bytes, Base64String>;
    certificate?: WalletCertificate;
    verifier?: PubKeyHex;
}
```

See also: [Base64String](./wallet.md#type-base64string), [CertificateFieldNameUnder50Bytes](./wallet.md#type-certificatefieldnameunder50bytes), [PubKeyHex](./wallet.md#type-pubkeyhex), [WalletCertificate](./wallet.md#interface-walletcertificate)

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

See also: [Base64String](./wallet.md#type-base64string), [PubKeyHex](./wallet.md#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RelinquishCertificateResult

```ts
export interface RelinquishCertificateResult {
    relinquished: true;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RelinquishOutputArgs

```ts
export interface RelinquishOutputArgs {
    basket: BasketStringUnder300Bytes;
    output: OutpointString;
}
```

See also: [BasketStringUnder300Bytes](./wallet.md#type-basketstringunder300bytes), [OutpointString](./wallet.md#type-outpointstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RelinquishOutputResult

```ts
export interface RelinquishOutputResult {
    relinquished: true;
}
```

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

See also: [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [PubKeyHex](./wallet.md#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RevealCounterpartyKeyLinkageResult

```ts
export interface RevealCounterpartyKeyLinkageResult extends KeyLinkageResult {
    revelationTime: ISOTimestampString;
}
```

See also: [ISOTimestampString](./wallet.md#type-isotimestampstring), [KeyLinkageResult](./wallet.md#interface-keylinkageresult)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RevealSpecificKeyLinkageArgs

```ts
export interface RevealSpecificKeyLinkageArgs {
    counterparty: WalletCounterparty;
    verifier: PubKeyHex;
    protocolID: WalletProtocol;
    keyID: KeyIDStringUnder800Bytes;
    privilegedReason?: DescriptionString5to50Bytes;
    privileged?: BooleanDefaultFalse;
}
```

See also: [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [KeyIDStringUnder800Bytes](./wallet.md#type-keyidstringunder800bytes), [PubKeyHex](./wallet.md#type-pubkeyhex), [WalletCounterparty](./wallet.md#type-walletcounterparty), [WalletProtocol](./wallet.md#type-walletprotocol)

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

See also: [Byte](./wallet.md#type-byte), [KeyIDStringUnder800Bytes](./wallet.md#type-keyidstringunder800bytes), [KeyLinkageResult](./wallet.md#interface-keylinkageresult), [WalletProtocol](./wallet.md#type-walletprotocol)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: SendWithResult

```ts
export interface SendWithResult {
    txid: TXIDHexString;
    status: SendWithResultStatus;
}
```

See also: [SendWithResultStatus](./wallet.md#type-sendwithresultstatus), [TXIDHexString](./wallet.md#type-txidhexstring)

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

See also: [Base64String](./wallet.md#type-base64string), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [SignActionOptions](./wallet.md#interface-signactionoptions), [SignActionSpend](./wallet.md#interface-signactionspend)

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

See also: [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [BooleanDefaultTrue](./wallet.md#type-booleandefaulttrue), [TXIDHexString](./wallet.md#type-txidhexstring)

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

See also: [AtomicBEEF](./wallet.md#type-atomicbeef), [SendWithResult](./wallet.md#interface-sendwithresult), [TXIDHexString](./wallet.md#type-txidhexstring)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: SignActionSpend

```ts
export interface SignActionSpend {
    unlockingScript: HexString;
    sequenceNumber?: PositiveIntegerOrZero;
}
```

See also: [HexString](./wallet.md#type-hexstring), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: SignableTransaction

```ts
export interface SignableTransaction {
    tx: AtomicBEEF;
    reference: Base64String;
}
```

See also: [AtomicBEEF](./wallet.md#type-atomicbeef), [Base64String](./wallet.md#type-base64string)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: VerifyHmacArgs

```ts
export interface VerifyHmacArgs extends WalletEncryptionArgs {
    data: Byte[];
    hmac: Byte[];
}
```

See also: [Byte](./wallet.md#type-byte), [WalletEncryptionArgs](./wallet.md#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: VerifyHmacResult

```ts
export interface VerifyHmacResult {
    valid: true;
}
```

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

See also: [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [Byte](./wallet.md#type-byte), [WalletEncryptionArgs](./wallet.md#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: VerifySignatureResult

```ts
export interface VerifySignatureResult {
    valid: true;
}
```

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

See also: [ActionStatus](./wallet.md#type-actionstatus), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [LabelStringUnder300Bytes](./wallet.md#type-labelstringunder300bytes), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [SatoshiValue](./wallet.md#type-satoshivalue), [TXIDHexString](./wallet.md#type-txidhexstring), [WalletActionInput](./wallet.md#interface-walletactioninput), [WalletActionOutput](./wallet.md#interface-walletactionoutput)

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

See also: [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [HexString](./wallet.md#type-hexstring), [OutpointString](./wallet.md#type-outpointstring), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [SatoshiValue](./wallet.md#type-satoshivalue)

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

See also: [BasketStringUnder300Bytes](./wallet.md#type-basketstringunder300bytes), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [HexString](./wallet.md#type-hexstring), [OutputTagStringUnder300Bytes](./wallet.md#type-outputtagstringunder300bytes), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [SatoshiValue](./wallet.md#type-satoshivalue)

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

See also: [Base64String](./wallet.md#type-base64string), [CertificateFieldNameUnder50Bytes](./wallet.md#type-certificatefieldnameunder50bytes), [HexString](./wallet.md#type-hexstring), [OutpointString](./wallet.md#type-outpointstring), [PubKeyHex](./wallet.md#type-pubkeyhex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletDecryptArgs

```ts
export interface WalletDecryptArgs extends WalletEncryptionArgs {
    ciphertext: Byte[];
}
```

See also: [Byte](./wallet.md#type-byte), [WalletEncryptionArgs](./wallet.md#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletDecryptResult

```ts
export interface WalletDecryptResult {
    plaintext: Byte[];
}
```

See also: [Byte](./wallet.md#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletEncryptArgs

```ts
export interface WalletEncryptArgs extends WalletEncryptionArgs {
    plaintext: Byte[];
}
```

See also: [Byte](./wallet.md#type-byte), [WalletEncryptionArgs](./wallet.md#interface-walletencryptionargs)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletEncryptResult

```ts
export interface WalletEncryptResult {
    ciphertext: Byte[];
}
```

See also: [Byte](./wallet.md#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletEncryptionArgs

```ts
export interface WalletEncryptionArgs {
    protocolID: WalletProtocol;
    keyID: KeyIDStringUnder800Bytes;
    counterparty?: WalletCounterparty;
    privileged?: BooleanDefaultFalse;
    privilegedReason?: DescriptionString5to50Bytes;
    seekPermission?: BooleanDefaultTrue;
}
```

See also: [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [BooleanDefaultTrue](./wallet.md#type-booleandefaulttrue), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [KeyIDStringUnder800Bytes](./wallet.md#type-keyidstringunder800bytes), [WalletCounterparty](./wallet.md#type-walletcounterparty), [WalletProtocol](./wallet.md#type-walletprotocol)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletErrorObject

Every method of the `Wallet` interface has a return value of the form `Promise<object>`.
When errors occur, an exception object may be thrown which must conform to the `WalletErrorObject` interface.
Serialization layers can rely on the `isError` property being unique to error objects.
Deserialization should rethrow `WalletErrorObject` conforming objects.

```ts
export interface WalletErrorObject extends Error {
    isError: true;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletInterface

The Wallet interface defines a wallet capable of various tasks including transaction creation and signing,
encryption, decryption, identity certificate management, identity verification, and communication
with applications as per the BRC standards. This interface allows applications to interact with
the wallet for a range of functionalities aligned with the Babbage architectural principles.

Error Handling

Every method of the `Wallet` interface has a return value of the form `Promise<object>`.
When an error occurs, an exception object may be thrown which must conform to the `WalletErrorObject` interface.
Serialization layers can rely on the `isError` property being unique to error objects to
deserialize and rethrow `WalletErrorObject` conforming objects.

```ts
export interface WalletInterface {
    getPublicKey: (args: GetPublicKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetPublicKeyResult>;
    revealCounterpartyKeyLinkage: (args: RevealCounterpartyKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealCounterpartyKeyLinkageResult>;
    revealSpecificKeyLinkage: (args: RevealSpecificKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealSpecificKeyLinkageResult>;
    encrypt: (args: WalletEncryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<WalletEncryptResult>;
    decrypt: (args: WalletDecryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<WalletDecryptResult>;
    createHmac: (args: CreateHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateHmacResult>;
    verifyHmac: (args: VerifyHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<VerifyHmacResult>;
    createSignature: (args: CreateSignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateSignatureResult>;
    verifySignature: (args: VerifySignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<VerifySignatureResult>;
    createAction: (args: CreateActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateActionResult>;
    signAction: (args: SignActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<SignActionResult>;
    abortAction: (args: AbortActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AbortActionResult>;
    listActions: (args: ListActionsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListActionsResult>;
    internalizeAction: (args: InternalizeActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<InternalizeActionResult>;
    listOutputs: (args: ListOutputsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListOutputsResult>;
    relinquishOutput: (args: RelinquishOutputArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RelinquishOutputResult>;
    acquireCertificate: (args: AcquireCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<WalletCertificate>;
    listCertificates: (args: ListCertificatesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListCertificatesResult>;
    proveCertificate: (args: ProveCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ProveCertificateResult>;
    relinquishCertificate: (args: RelinquishCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RelinquishCertificateResult>;
    discoverByIdentityKey: (args: DiscoverByIdentityKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>;
    discoverByAttributes: (args: DiscoverByAttributesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>;
    isAuthenticated: (args: object, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AuthenticatedResult>;
    waitForAuthentication: (args: object, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AuthenticatedResult>;
    getHeight: (args: object, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetHeightResult>;
    getHeaderForHeight: (args: GetHeaderArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetHeaderResult>;
    getNetwork: (args: object, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetNetworkResult>;
    getVersion: (args: object, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetVersionResult>;
}
```

See also: [AbortActionArgs](./wallet.md#interface-abortactionargs), [AbortActionResult](./wallet.md#interface-abortactionresult), [AcquireCertificateArgs](./wallet.md#interface-acquirecertificateargs), [AuthenticatedResult](./wallet.md#interface-authenticatedresult), [CreateActionArgs](./wallet.md#interface-createactionargs), [CreateActionResult](./wallet.md#interface-createactionresult), [CreateHmacArgs](./wallet.md#interface-createhmacargs), [CreateHmacResult](./wallet.md#interface-createhmacresult), [CreateSignatureArgs](./wallet.md#interface-createsignatureargs), [CreateSignatureResult](./wallet.md#interface-createsignatureresult), [DiscoverByAttributesArgs](./wallet.md#interface-discoverbyattributesargs), [DiscoverByIdentityKeyArgs](./wallet.md#interface-discoverbyidentitykeyargs), [DiscoverCertificatesResult](./wallet.md#interface-discovercertificatesresult), [GetHeaderArgs](./wallet.md#interface-getheaderargs), [GetHeaderResult](./wallet.md#interface-getheaderresult), [GetHeightResult](./wallet.md#interface-getheightresult), [GetNetworkResult](./wallet.md#interface-getnetworkresult), [GetPublicKeyArgs](./wallet.md#interface-getpublickeyargs), [GetPublicKeyResult](./wallet.md#interface-getpublickeyresult), [GetVersionResult](./wallet.md#interface-getversionresult), [InternalizeActionArgs](./wallet.md#interface-internalizeactionargs), [InternalizeActionResult](./wallet.md#interface-internalizeactionresult), [ListActionsArgs](./wallet.md#interface-listactionsargs), [ListActionsResult](./wallet.md#interface-listactionsresult), [ListCertificatesArgs](./wallet.md#interface-listcertificatesargs), [ListCertificatesResult](./wallet.md#interface-listcertificatesresult), [ListOutputsArgs](./wallet.md#interface-listoutputsargs), [ListOutputsResult](./wallet.md#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [ProveCertificateArgs](./wallet.md#interface-provecertificateargs), [ProveCertificateResult](./wallet.md#interface-provecertificateresult), [RelinquishCertificateArgs](./wallet.md#interface-relinquishcertificateargs), [RelinquishCertificateResult](./wallet.md#interface-relinquishcertificateresult), [RelinquishOutputArgs](./wallet.md#interface-relinquishoutputargs), [RelinquishOutputResult](./wallet.md#interface-relinquishoutputresult), [RevealCounterpartyKeyLinkageArgs](./wallet.md#interface-revealcounterpartykeylinkageargs), [RevealCounterpartyKeyLinkageResult](./wallet.md#interface-revealcounterpartykeylinkageresult), [RevealSpecificKeyLinkageArgs](./wallet.md#interface-revealspecifickeylinkageargs), [RevealSpecificKeyLinkageResult](./wallet.md#interface-revealspecifickeylinkageresult), [SignActionArgs](./wallet.md#interface-signactionargs), [SignActionResult](./wallet.md#interface-signactionresult), [VerifyHmacArgs](./wallet.md#interface-verifyhmacargs), [VerifyHmacResult](./wallet.md#interface-verifyhmacresult), [VerifySignatureArgs](./wallet.md#interface-verifysignatureargs), [VerifySignatureResult](./wallet.md#interface-verifysignatureresult), [WalletCertificate](./wallet.md#interface-walletcertificate), [WalletDecryptArgs](./wallet.md#interface-walletdecryptargs), [WalletDecryptResult](./wallet.md#interface-walletdecryptresult), [WalletEncryptArgs](./wallet.md#interface-walletencryptargs), [WalletEncryptResult](./wallet.md#interface-walletencryptresult), [decrypt](./messages.md#variable-decrypt), [encrypt](./messages.md#variable-encrypt)

#### Property abortAction

Aborts a transaction that is in progress and has not yet been finalized or sent to the network.

```ts
abortAction: (args: AbortActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AbortActionResult>
```
See also: [AbortActionArgs](./wallet.md#interface-abortactionargs), [AbortActionResult](./wallet.md#interface-abortactionresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property acquireCertificate

Acquires an identity certificate, whether by acquiring one from the certifier or by directly receiving it.

```ts
acquireCertificate: (args: AcquireCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<WalletCertificate>
```
See also: [AcquireCertificateArgs](./wallet.md#interface-acquirecertificateargs), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [WalletCertificate](./wallet.md#interface-walletcertificate)

#### Property createAction

Creates a new Bitcoin transaction based on the provided inputs, outputs, labels, locks, and other options.

```ts
createAction: (args: CreateActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateActionResult>
```
See also: [CreateActionArgs](./wallet.md#interface-createactionargs), [CreateActionResult](./wallet.md#interface-createactionresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property createHmac

Creates an HMAC (Hash-based Message Authentication Code) based on the provided data, protocol, key ID, counterparty, and other factors.

```ts
createHmac: (args: CreateHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateHmacResult>
```
See also: [CreateHmacArgs](./wallet.md#interface-createhmacargs), [CreateHmacResult](./wallet.md#interface-createhmacresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property createSignature

Creates a digital signature for the provided data or hash using a specific protocol, key, and optionally considering privilege and counterparty.

```ts
createSignature: (args: CreateSignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<CreateSignatureResult>
```
See also: [CreateSignatureArgs](./wallet.md#interface-createsignatureargs), [CreateSignatureResult](./wallet.md#interface-createsignatureresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property decrypt

Decrypts the provided ciphertext using derived keys, based on the protocol ID, key ID, counterparty, and other factors.

```ts
decrypt: (args: WalletDecryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<WalletDecryptResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [WalletDecryptArgs](./wallet.md#interface-walletdecryptargs), [WalletDecryptResult](./wallet.md#interface-walletdecryptresult)

#### Property discoverByAttributes

Discovers identity certificates belonging to other users, where the documents contain specific attributes, issued by a trusted entity.

```ts
discoverByAttributes: (args: DiscoverByAttributesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>
```
See also: [DiscoverByAttributesArgs](./wallet.md#interface-discoverbyattributesargs), [DiscoverCertificatesResult](./wallet.md#interface-discovercertificatesresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property discoverByIdentityKey

Discovers identity certificates, issued to a given identity key by a trusted entity.

```ts
discoverByIdentityKey: (args: DiscoverByIdentityKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<DiscoverCertificatesResult>
```
See also: [DiscoverByIdentityKeyArgs](./wallet.md#interface-discoverbyidentitykeyargs), [DiscoverCertificatesResult](./wallet.md#interface-discovercertificatesresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property encrypt

Encrypts the provided plaintext data using derived keys, based on the protocol ID, key ID, counterparty, and other factors.

```ts
encrypt: (args: WalletEncryptArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<WalletEncryptResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [WalletEncryptArgs](./wallet.md#interface-walletencryptargs), [WalletEncryptResult](./wallet.md#interface-walletencryptresult)

#### Property getHeaderForHeight

Retrieves the block header of a block at a specified height.

```ts
getHeaderForHeight: (args: GetHeaderArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetHeaderResult>
```
See also: [GetHeaderArgs](./wallet.md#interface-getheaderargs), [GetHeaderResult](./wallet.md#interface-getheaderresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property getHeight

Retrieves the current height of the blockchain.

```ts
getHeight: (args: object, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetHeightResult>
```
See also: [GetHeightResult](./wallet.md#interface-getheightresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property getNetwork

Retrieves the Bitcoin network the client is using (mainnet or testnet).

```ts
getNetwork: (args: object, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetNetworkResult>
```
See also: [GetNetworkResult](./wallet.md#interface-getnetworkresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property getPublicKey

Retrieves a derived or identity public key based on the requested protocol, key ID, counterparty, and other factors.

```ts
getPublicKey: (args: GetPublicKeyArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetPublicKeyResult>
```
See also: [GetPublicKeyArgs](./wallet.md#interface-getpublickeyargs), [GetPublicKeyResult](./wallet.md#interface-getpublickeyresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property getVersion

Retrieves the current version string of the wallet.

```ts
getVersion: (args: object, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<GetVersionResult>
```
See also: [GetVersionResult](./wallet.md#interface-getversionresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property internalizeAction

Submits a transaction to be internalized and optionally labeled, outputs paid to the wallet balance, inserted into baskets, and/or tagged.

```ts
internalizeAction: (args: InternalizeActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<InternalizeActionResult>
```
See also: [InternalizeActionArgs](./wallet.md#interface-internalizeactionargs), [InternalizeActionResult](./wallet.md#interface-internalizeactionresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property isAuthenticated

Checks the authentication status of the user.

```ts
isAuthenticated: (args: object, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AuthenticatedResult>
```
See also: [AuthenticatedResult](./wallet.md#interface-authenticatedresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property listActions

Lists all transactions matching the specified labels.

```ts
listActions: (args: ListActionsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListActionsResult>
```
See also: [ListActionsArgs](./wallet.md#interface-listactionsargs), [ListActionsResult](./wallet.md#interface-listactionsresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property listCertificates

Lists identity certificates belonging to the user, filtered by certifier(s) and type(s).

```ts
listCertificates: (args: ListCertificatesArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListCertificatesResult>
```
See also: [ListCertificatesArgs](./wallet.md#interface-listcertificatesargs), [ListCertificatesResult](./wallet.md#interface-listcertificatesresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property listOutputs

Lists the spendable outputs kept within a specific basket, optionally tagged with specific labels.

```ts
listOutputs: (args: ListOutputsArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ListOutputsResult>
```
See also: [ListOutputsArgs](./wallet.md#interface-listoutputsargs), [ListOutputsResult](./wallet.md#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

#### Property proveCertificate

Proves select fields of an identity certificate, as specified, when requested by a verifier.

```ts
proveCertificate: (args: ProveCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<ProveCertificateResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [ProveCertificateArgs](./wallet.md#interface-provecertificateargs), [ProveCertificateResult](./wallet.md#interface-provecertificateresult)

#### Property relinquishCertificate

Relinquishes an identity certificate, removing it from the wallet regardless of whether the revocation outpoint has become spent.

```ts
relinquishCertificate: (args: RelinquishCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RelinquishCertificateResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [RelinquishCertificateArgs](./wallet.md#interface-relinquishcertificateargs), [RelinquishCertificateResult](./wallet.md#interface-relinquishcertificateresult)

#### Property relinquishOutput

Relinquish an output out of a basket, removing it from tracking without spending it.

```ts
relinquishOutput: (args: RelinquishOutputArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RelinquishOutputResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [RelinquishOutputArgs](./wallet.md#interface-relinquishoutputargs), [RelinquishOutputResult](./wallet.md#interface-relinquishoutputresult)

#### Property revealCounterpartyKeyLinkage

Reveals the key linkage between ourselves and a counterparty, to a particular verifier, across all interactions with the counterparty.

```ts
revealCounterpartyKeyLinkage: (args: RevealCounterpartyKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealCounterpartyKeyLinkageResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [RevealCounterpartyKeyLinkageArgs](./wallet.md#interface-revealcounterpartykeylinkageargs), [RevealCounterpartyKeyLinkageResult](./wallet.md#interface-revealcounterpartykeylinkageresult)

#### Property revealSpecificKeyLinkage

Reveals the key linkage between ourselves and a counterparty, to a particular verifier, with respect to a specific interaction.

```ts
revealSpecificKeyLinkage: (args: RevealSpecificKeyLinkageArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<RevealSpecificKeyLinkageResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [RevealSpecificKeyLinkageArgs](./wallet.md#interface-revealspecifickeylinkageargs), [RevealSpecificKeyLinkageResult](./wallet.md#interface-revealspecifickeylinkageresult)

#### Property signAction

Signs a transaction previously created using `createAction`.

```ts
signAction: (args: SignActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<SignActionResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [SignActionArgs](./wallet.md#interface-signactionargs), [SignActionResult](./wallet.md#interface-signactionresult)

#### Property verifyHmac

Verifies an HMAC (Hash-based Message Authentication Code) based on the provided data, protocol, key ID, counterparty, and other factors.

```ts
verifyHmac: (args: VerifyHmacArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<VerifyHmacResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [VerifyHmacArgs](./wallet.md#interface-verifyhmacargs), [VerifyHmacResult](./wallet.md#interface-verifyhmacresult)

#### Property verifySignature

Verifies a digital signature for the provided data or hash using a specific protocol, key, and optionally considering privilege and counterparty.

```ts
verifySignature: (args: VerifySignatureArgs, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<VerifySignatureResult>
```
See also: [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [VerifySignatureArgs](./wallet.md#interface-verifysignatureargs), [VerifySignatureResult](./wallet.md#interface-verifysignatureresult)

#### Property waitForAuthentication

Continuously waits until the user is authenticated, returning the result once confirmed.

```ts
waitForAuthentication: (args: object, originator?: OriginatorDomainNameStringUnder250Bytes) => Promise<AuthenticatedResult>
```
See also: [AuthenticatedResult](./wallet.md#interface-authenticatedresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: WalletOutput

```ts
export interface WalletOutput {
    satoshis: SatoshiValue;
    lockingScript?: HexString;
    spendable: boolean;
    customInstructions?: string;
    tags?: OutputTagStringUnder300Bytes[];
    outpoint: OutpointString;
    labels?: LabelStringUnder300Bytes[];
}
```

See also: [HexString](./wallet.md#type-hexstring), [LabelStringUnder300Bytes](./wallet.md#type-labelstringunder300bytes), [OutpointString](./wallet.md#type-outpointstring), [OutputTagStringUnder300Bytes](./wallet.md#type-outputtagstringunder300bytes), [SatoshiValue](./wallet.md#type-satoshivalue)

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

See also: [Base64String](./wallet.md#type-base64string), [PubKeyHex](./wallet.md#type-pubkeyhex)

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
    derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf: boolean = false): PublicKey 
    derivePrivateKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): PrivateKey 
    deriveSymmetricKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): SymmetricKey 
    revealCounterpartySecret(counterparty: Counterparty): number[] 
    revealSpecificSecret(counterparty: Counterparty, protocolID: WalletProtocol, keyID: string): number[] 
}
```

See also: [Counterparty](./wallet.md#type-counterparty), [PrivateKey](./primitives.md#class-privatekey), [PublicKey](./primitives.md#class-publickey), [SymmetricKey](./primitives.md#class-symmetrickey), [WalletProtocol](./wallet.md#type-walletprotocol)

#### Constructor

Initializes the CachedKeyDeriver instance with a root private key and optional cache settings.

```ts
constructor(rootKey: PrivateKey | "anyone", options?: {
    maxCacheSize?: number;
}) 
```
See also: [PrivateKey](./primitives.md#class-privatekey)

Argument Details

+ **rootKey**
  + The root private key or the string 'anyone'.
+ **options**
  + Optional settings for the cache.

#### Method derivePrivateKey

Derives a private key based on protocol ID, key ID, and counterparty.
Caches the result for future calls with the same parameters.

```ts
derivePrivateKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): PrivateKey 
```
See also: [Counterparty](./wallet.md#type-counterparty), [PrivateKey](./primitives.md#class-privatekey), [WalletProtocol](./wallet.md#type-walletprotocol)

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
derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf: boolean = false): PublicKey 
```
See also: [Counterparty](./wallet.md#type-counterparty), [PublicKey](./primitives.md#class-publickey), [WalletProtocol](./wallet.md#type-walletprotocol)

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
deriveSymmetricKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): SymmetricKey 
```
See also: [Counterparty](./wallet.md#type-counterparty), [SymmetricKey](./primitives.md#class-symmetrickey), [WalletProtocol](./wallet.md#type-walletprotocol)

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
revealCounterpartySecret(counterparty: Counterparty): number[] 
```
See also: [Counterparty](./wallet.md#type-counterparty)

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
revealSpecificSecret(counterparty: Counterparty, protocolID: WalletProtocol, keyID: string): number[] 
```
See also: [Counterparty](./wallet.md#type-counterparty), [WalletProtocol](./wallet.md#type-walletprotocol)

Returns

- The specific key association as a number array.

Argument Details

+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').
+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: HTTPWalletJSON

```ts
export default class HTTPWalletJSON implements WalletInterface {
    baseUrl: string;
    httpClient: typeof fetch;
    originator: OriginatorDomainNameStringUnder250Bytes | undefined;
    api: (call: string, args: object) => Promise<unknown>;
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
    async isAuthenticated(args: object): Promise<{
        authenticated: true;
    }> 
    async waitForAuthentication(args: object): Promise<{
        authenticated: true;
    }> 
    async getHeight(args: object): Promise<{
        height: PositiveInteger;
    }> 
    async getHeaderForHeight(args: {
        height: PositiveInteger;
    }): Promise<{
        header: HexString;
    }> 
    async getNetwork(args: object): Promise<{
        network: "mainnet" | "testnet";
    }> 
    async getVersion(args: object): Promise<{
        version: VersionString7To30Bytes;
    }> 
}
```

See also: [AcquireCertificateArgs](./wallet.md#interface-acquirecertificateargs), [AcquireCertificateResult](./wallet.md#type-acquirecertificateresult), [Base64String](./wallet.md#type-base64string), [BasketStringUnder300Bytes](./wallet.md#type-basketstringunder300bytes), [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [BooleanDefaultTrue](./wallet.md#type-booleandefaulttrue), [Byte](./wallet.md#type-byte), [CertificateFieldNameUnder50Bytes](./wallet.md#type-certificatefieldnameunder50bytes), [CreateActionArgs](./wallet.md#interface-createactionargs), [CreateActionResult](./wallet.md#interface-createactionresult), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [DiscoverCertificatesResult](./wallet.md#interface-discovercertificatesresult), [HexString](./wallet.md#type-hexstring), [ISOTimestampString](./wallet.md#type-isotimestampstring), [InternalizeActionArgs](./wallet.md#interface-internalizeactionargs), [KeyIDStringUnder800Bytes](./wallet.md#type-keyidstringunder800bytes), [ListActionsArgs](./wallet.md#interface-listactionsargs), [ListActionsResult](./wallet.md#interface-listactionsresult), [ListCertificatesResult](./wallet.md#interface-listcertificatesresult), [ListOutputsArgs](./wallet.md#interface-listoutputsargs), [ListOutputsResult](./wallet.md#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [OutpointString](./wallet.md#type-outpointstring), [PositiveInteger](./wallet.md#type-positiveinteger), [PositiveIntegerDefault10Max10000](./wallet.md#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [ProtocolString5To400Bytes](./wallet.md#type-protocolstring5to400bytes), [ProveCertificateArgs](./wallet.md#interface-provecertificateargs), [ProveCertificateResult](./wallet.md#interface-provecertificateresult), [PubKeyHex](./wallet.md#type-pubkeyhex), [SecurityLevel](./wallet.md#type-securitylevel), [SignActionArgs](./wallet.md#interface-signactionargs), [SignActionResult](./wallet.md#interface-signactionresult), [VersionString7To30Bytes](./wallet.md#type-versionstring7to30bytes), [WalletInterface](./wallet.md#interface-walletinterface), [decrypt](./messages.md#variable-decrypt), [encrypt](./messages.md#variable-encrypt)

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
### Class: KeyDeriver

Class responsible for deriving various types of keys using a root private key.
It supports deriving public and private keys, symmetric keys, and revealing key linkages.

```ts
export class KeyDeriver implements KeyDeriverApi {
    rootKey: PrivateKey;
    identityKey: string;
    constructor(rootKey: PrivateKey | "anyone") 
    derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf: boolean = false): PublicKey 
    derivePrivateKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): PrivateKey 
    deriveSymmetricKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): SymmetricKey 
    revealCounterpartySecret(counterparty: Counterparty): number[] 
    revealSpecificSecret(counterparty: Counterparty, protocolID: WalletProtocol, keyID: string): number[] 
}
```

See also: [Counterparty](./wallet.md#type-counterparty), [KeyDeriverApi](./wallet.md#interface-keyderiverapi), [PrivateKey](./primitives.md#class-privatekey), [PublicKey](./primitives.md#class-publickey), [SymmetricKey](./primitives.md#class-symmetrickey), [WalletProtocol](./wallet.md#type-walletprotocol)

#### Constructor

Initializes the KeyDeriver instance with a root private key.

```ts
constructor(rootKey: PrivateKey | "anyone") 
```
See also: [PrivateKey](./primitives.md#class-privatekey)

Argument Details

+ **rootKey**
  + The root private key or the string 'anyone'.

#### Method derivePrivateKey

Derives a private key based on protocol ID, key ID, and counterparty.

```ts
derivePrivateKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): PrivateKey 
```
See also: [Counterparty](./wallet.md#type-counterparty), [PrivateKey](./primitives.md#class-privatekey), [WalletProtocol](./wallet.md#type-walletprotocol)

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
derivePublicKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty, forSelf: boolean = false): PublicKey 
```
See also: [Counterparty](./wallet.md#type-counterparty), [PublicKey](./primitives.md#class-publickey), [WalletProtocol](./wallet.md#type-walletprotocol)

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
deriveSymmetricKey(protocolID: WalletProtocol, keyID: string, counterparty: Counterparty): SymmetricKey 
```
See also: [Counterparty](./wallet.md#type-counterparty), [SymmetricKey](./primitives.md#class-symmetrickey), [WalletProtocol](./wallet.md#type-walletprotocol)

Returns

- The derived symmetric key.

Argument Details

+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.
+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').

#### Method revealCounterpartySecret

Reveals the shared secret between the root key and the counterparty.
Note: This should not be used for 'self'.

```ts
revealCounterpartySecret(counterparty: Counterparty): number[] 
```
See also: [Counterparty](./wallet.md#type-counterparty)

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
revealSpecificSecret(counterparty: Counterparty, protocolID: WalletProtocol, keyID: string): number[] 
```
See also: [Counterparty](./wallet.md#type-counterparty), [WalletProtocol](./wallet.md#type-walletprotocol)

Returns

- The specific key association as a number array.

Argument Details

+ **counterparty**
  + The counterparty's public key or a predefined value ('self' or 'anyone').
+ **protocolID**
  + The protocol ID including a security level and protocol name.
+ **keyID**
  + The key identifier.

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: ProtoWallet

A ProtoWallet is precursor to a full wallet, capable of performing all foundational cryptographic operations.
It can derive keys, create signatures, facilitate encryption and HMAC operations, and reveal key linkages.

However, ProtoWallet does not create transactions, manage outputs, interact with the blockchain,
enable the management of identity certificates, or store any data. It is also not concerned with privileged keys.

```ts
export class ProtoWallet {
    keyDeriver?: KeyDeriverApi;
    constructor(rootKeyOrKeyDeriver?: PrivateKey | "anyone" | KeyDeriverApi) 
    async getPublicKey(args: GetPublicKeyArgs): Promise<{
        publicKey: PubKeyHex;
    }> 
    async revealCounterpartyKeyLinkage(args: RevealCounterpartyKeyLinkageArgs): Promise<RevealCounterpartyKeyLinkageResult> 
    async revealSpecificKeyLinkage(args: RevealSpecificKeyLinkageArgs): Promise<RevealSpecificKeyLinkageResult> 
    async encrypt(args: WalletEncryptArgs): Promise<WalletEncryptResult> 
    async decrypt(args: WalletDecryptArgs): Promise<WalletDecryptResult> 
    async createHmac(args: CreateHmacArgs): Promise<CreateHmacResult> 
    async verifyHmac(args: VerifyHmacArgs): Promise<VerifyHmacResult> 
    async createSignature(args: CreateSignatureArgs): Promise<CreateSignatureResult> 
    async verifySignature(args: VerifySignatureArgs): Promise<VerifySignatureResult> 
}
```

See also: [CreateHmacArgs](./wallet.md#interface-createhmacargs), [CreateHmacResult](./wallet.md#interface-createhmacresult), [CreateSignatureArgs](./wallet.md#interface-createsignatureargs), [CreateSignatureResult](./wallet.md#interface-createsignatureresult), [GetPublicKeyArgs](./wallet.md#interface-getpublickeyargs), [KeyDeriverApi](./wallet.md#interface-keyderiverapi), [PrivateKey](./primitives.md#class-privatekey), [PubKeyHex](./wallet.md#type-pubkeyhex), [RevealCounterpartyKeyLinkageArgs](./wallet.md#interface-revealcounterpartykeylinkageargs), [RevealCounterpartyKeyLinkageResult](./wallet.md#interface-revealcounterpartykeylinkageresult), [RevealSpecificKeyLinkageArgs](./wallet.md#interface-revealspecifickeylinkageargs), [RevealSpecificKeyLinkageResult](./wallet.md#interface-revealspecifickeylinkageresult), [VerifyHmacArgs](./wallet.md#interface-verifyhmacargs), [VerifyHmacResult](./wallet.md#interface-verifyhmacresult), [VerifySignatureArgs](./wallet.md#interface-verifysignatureargs), [VerifySignatureResult](./wallet.md#interface-verifysignatureresult), [WalletDecryptArgs](./wallet.md#interface-walletdecryptargs), [WalletDecryptResult](./wallet.md#interface-walletdecryptresult), [WalletEncryptArgs](./wallet.md#interface-walletencryptargs), [WalletEncryptResult](./wallet.md#interface-walletencryptresult), [decrypt](./messages.md#variable-decrypt), [encrypt](./messages.md#variable-encrypt)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: WalletClient

The SDK is how applications communicate with wallets over a communications substrate.

```ts
export default class WalletClient implements WalletInterface {
    public substrate: "auto" | WalletInterface;
    originator?: OriginatorDomainNameStringUnder250Bytes;
    constructor(substrate: "auto" | "Cicada" | "XDM" | "window.CWI" | "json-api" | WalletInterface = "auto", originator?: OriginatorDomainNameStringUnder250Bytes) 
    async connectToSubstrate(): Promise<void> 
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
    async isAuthenticated(args: object = {}): Promise<AuthenticatedResult> 
    async waitForAuthentication(args: object = {}): Promise<{
        authenticated: true;
    }> 
    async getHeight(args: object = {}): Promise<{
        height: PositiveInteger;
    }> 
    async getHeaderForHeight(args: {
        height: PositiveInteger;
    }): Promise<{
        header: HexString;
    }> 
    async getNetwork(args: object = {}): Promise<{
        network: "mainnet" | "testnet";
    }> 
    async getVersion(args: object = {}): Promise<{
        version: VersionString7To30Bytes;
    }> 
}
```

See also: [AcquireCertificateArgs](./wallet.md#interface-acquirecertificateargs), [AcquireCertificateResult](./wallet.md#type-acquirecertificateresult), [AuthenticatedResult](./wallet.md#interface-authenticatedresult), [Base64String](./wallet.md#type-base64string), [BasketStringUnder300Bytes](./wallet.md#type-basketstringunder300bytes), [BooleanDefaultFalse](./wallet.md#type-booleandefaultfalse), [Byte](./wallet.md#type-byte), [CertificateFieldNameUnder50Bytes](./wallet.md#type-certificatefieldnameunder50bytes), [CreateActionArgs](./wallet.md#interface-createactionargs), [CreateActionResult](./wallet.md#interface-createactionresult), [DescriptionString5to50Bytes](./wallet.md#type-descriptionstring5to50bytes), [DiscoverCertificatesResult](./wallet.md#interface-discovercertificatesresult), [HexString](./wallet.md#type-hexstring), [ISOTimestampString](./wallet.md#type-isotimestampstring), [InternalizeActionArgs](./wallet.md#interface-internalizeactionargs), [KeyIDStringUnder800Bytes](./wallet.md#type-keyidstringunder800bytes), [ListActionsArgs](./wallet.md#interface-listactionsargs), [ListActionsResult](./wallet.md#interface-listactionsresult), [ListCertificatesResult](./wallet.md#interface-listcertificatesresult), [ListOutputsArgs](./wallet.md#interface-listoutputsargs), [ListOutputsResult](./wallet.md#interface-listoutputsresult), [OriginatorDomainNameStringUnder250Bytes](./wallet.md#type-originatordomainnamestringunder250bytes), [OutpointString](./wallet.md#type-outpointstring), [PositiveInteger](./wallet.md#type-positiveinteger), [PositiveIntegerDefault10Max10000](./wallet.md#type-positiveintegerdefault10max10000), [PositiveIntegerOrZero](./wallet.md#type-positiveintegerorzero), [ProtocolString5To400Bytes](./wallet.md#type-protocolstring5to400bytes), [ProveCertificateArgs](./wallet.md#interface-provecertificateargs), [ProveCertificateResult](./wallet.md#interface-provecertificateresult), [PubKeyHex](./wallet.md#type-pubkeyhex), [SecurityLevel](./wallet.md#type-securitylevel), [SignActionArgs](./wallet.md#interface-signactionargs), [SignActionResult](./wallet.md#interface-signactionresult), [VersionString7To30Bytes](./wallet.md#type-versionstring7to30bytes), [WalletInterface](./wallet.md#interface-walletinterface), [decrypt](./messages.md#variable-decrypt), [encrypt](./messages.md#variable-encrypt)

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

| | | |
| --- | --- | --- |
| [AcquireCertificateResult](#type-acquirecertificateresult) | [EntityIconURLStringMax500Bytes](#type-entityiconurlstringmax500bytes) | [PositiveIntegerMax10](#type-positiveintegermax10) |
| [AcquisitionProtocol](#type-acquisitionprotocol) | [EntityNameStringMax100Bytes](#type-entitynamestringmax100bytes) | [PositiveIntegerOrZero](#type-positiveintegerorzero) |
| [ActionStatus](#type-actionstatus) | [ErrorCodeString10To40Bytes](#type-errorcodestring10to40bytes) | [ProtocolString5To400Bytes](#type-protocolstring5to400bytes) |
| [AtomicBEEF](#type-atomicbeef) | [ErrorDescriptionString20To200Bytes](#type-errordescriptionstring20to200bytes) | [PubKeyHex](#type-pubkeyhex) |
| [BEEF](#type-beef) | [HexString](#type-hexstring) | [SatoshiValue](#type-satoshivalue) |
| [Base64String](#type-base64string) | [ISOTimestampString](#type-isotimestampstring) | [SecurityLevel](#type-securitylevel) |
| [BasketStringUnder300Bytes](#type-basketstringunder300bytes) | [KeyIDStringUnder800Bytes](#type-keyidstringunder800bytes) | [SendWithResultStatus](#type-sendwithresultstatus) |
| [BooleanDefaultFalse](#type-booleandefaultfalse) | [KeyringRevealer](#type-keyringrevealer) | [TXIDHexString](#type-txidhexstring) |
| [BooleanDefaultTrue](#type-booleandefaulttrue) | [LabelStringUnder300Bytes](#type-labelstringunder300bytes) | [TrustSelf](#type-trustself) |
| [Byte](#type-byte) | [OriginatorDomainNameStringUnder250Bytes](#type-originatordomainnamestringunder250bytes) | [VersionString7To30Bytes](#type-versionstring7to30bytes) |
| [CallType](#type-calltype) | [OutpointString](#type-outpointstring) | [WalletCounterparty](#type-walletcounterparty) |
| [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes) | [OutputTagStringUnder300Bytes](#type-outputtagstringunder300bytes) | [WalletErrorCode](#type-walleterrorcode) |
| [Counterparty](#type-counterparty) | [PositiveInteger](#type-positiveinteger) | [WalletNetwork](#type-walletnetwork) |
| [DescriptionString5to50Bytes](#type-descriptionstring5to50bytes) | [PositiveIntegerDefault10Max10000](#type-positiveintegerdefault10max10000) | [WalletProtocol](#type-walletprotocol) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Type: AcquireCertificateResult

```ts
export type AcquireCertificateResult = WalletCertificate
```

See also: [WalletCertificate](./wallet.md#interface-walletcertificate)

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
export type ActionStatus = "completed" | "unprocessed" | "sending" | "unproven" | "unsigned" | "nosend" | "nonfinal" | "failed"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: AtomicBEEF

```ts
export type AtomicBEEF = Byte[]
```

See also: [Byte](./wallet.md#type-byte)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: BEEF

```ts
export type BEEF = Byte[]
```

See also: [Byte](./wallet.md#type-byte)

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
### Type: Counterparty

```ts
export type Counterparty = PublicKey | PubKeyHex | "self" | "anyone"
```

See also: [PubKeyHex](./wallet.md#type-pubkeyhex), [PublicKey](./primitives.md#class-publickey)

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

See also: [PubKeyHex](./wallet.md#type-pubkeyhex)

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

See also: [HexString](./wallet.md#type-hexstring)

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
### Type: SendWithResultStatus

```ts
export type SendWithResultStatus = "unproven" | "sending" | "failed"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Type: TXIDHexString

```ts
export type TXIDHexString = HexString
```

See also: [HexString](./wallet.md#type-hexstring)

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

See also: [PubKeyHex](./wallet.md#type-pubkeyhex)

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

See also: [ProtocolString5To400Bytes](./wallet.md#type-protocolstring5to400bytes), [SecurityLevel](./wallet.md#type-securitylevel)

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

See also: [Counterparty](./wallet.md#type-counterparty)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Variables

