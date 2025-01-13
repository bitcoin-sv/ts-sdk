# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

## Interfaces

| |
| --- |
| [AuthMessage](#interface-authmessage) |
| [PeerSession](#interface-peersession) |
| [RequestedCertificateSet](#interface-requestedcertificateset) |
| [RequestedCertificateTypeIDAndFieldList](#interface-requestedcertificatetypeidandfieldlist) |
| [Transport](#interface-transport) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Interface: AuthMessage

```ts
export interface AuthMessage {
    version: string;
    messageType: "initialRequest" | "initialResponse" | "certificateRequest" | "certificateResponse" | "general";
    identityKey: string;
    nonce?: string;
    initialNonce?: string;
    yourNonce?: string;
    certificates?: VerifiableCertificate[];
    requestedCertificates?: RequestedCertificateSet;
    payload?: number[];
    signature?: number[];
}
```

See also: [RequestedCertificateSet](#interface-requestedcertificateset), [VerifiableCertificate](#class-verifiablecertificate)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: PeerSession

```ts
export interface PeerSession {
    isAuthenticated: boolean;
    sessionNonce?: string;
    peerNonce?: string;
    peerIdentityKey?: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RequestedCertificateSet

```ts
export interface RequestedCertificateSet {
    certifiers: string[];
    types: RequestedCertificateTypeIDAndFieldList;
}
```

See also: [RequestedCertificateTypeIDAndFieldList](#interface-requestedcertificatetypeidandfieldlist)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RequestedCertificateTypeIDAndFieldList

```ts
export interface RequestedCertificateTypeIDAndFieldList {
    [certificateTypeID: string]: string[];
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: Transport

```ts
export interface Transport {
    send: (message: AuthMessage) => Promise<void>;
    onData: (callback: (message: AuthMessage) => Promise<void>) => Promise<void>;
}
```

See also: [AuthMessage](#interface-authmessage)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Classes

| |
| --- |
| [AuthFetch](#class-authfetch) |
| [Certificate](#class-certificate) |
| [MasterCertificate](#class-mastercertificate) |
| [Peer](#class-peer) |
| [SessionManager](#class-sessionmanager) |
| [SimplifiedFetchTransport](#class-simplifiedfetchtransport) |
| [VerifiableCertificate](#class-verifiablecertificate) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Class: AuthFetch

AuthFetch provides a lightweight fetch client for interacting with servers
over a simplified HTTP transport mechanism. It integrates session management, peer communication,
and certificate handling to enable secure and mutually-authenticated requests.

Additionally, it automatically handles 402 Payment Required responses by creating
and sending BSV payment transactions when necessary.

```ts
export class AuthFetch {
    peers: Record<string, AuthPeer> = {};
    constructor(wallet: Wallet, requestedCertificates?: RequestedCertificateSet, sessionManager?: SessionManager) 
    async fetch(url: string, config: SimplifiedFetchRequestOptions = {}): Promise<Response> 
    async sendCertificateRequest(baseUrl: string, certificatesToRequest: RequestedCertificateSet): Promise<VerifiableCertificate[]> 
    public consumeReceivedCertificates(): VerifiableCertificate[] 
}
```

See also: [RequestedCertificateSet](#interface-requestedcertificateset), [SessionManager](#class-sessionmanager), [VerifiableCertificate](#class-verifiablecertificate), [Wallet](#interface-wallet)

<details>

<summary>Class AuthFetch Details</summary>

#### Constructor

Constructs a new AuthFetch instance.

```ts
constructor(wallet: Wallet, requestedCertificates?: RequestedCertificateSet, sessionManager?: SessionManager) 
```
See also: [RequestedCertificateSet](#interface-requestedcertificateset), [SessionManager](#class-sessionmanager), [Wallet](#interface-wallet)

Argument Details

+ **wallet**
  + The wallet instance for signing and authentication.
+ **requestedCertificates**
  + Optional set of certificates to request from peers.

#### Method consumeReceivedCertificates

Return any certificates we've collected thus far, then clear them out.

```ts
public consumeReceivedCertificates(): VerifiableCertificate[] 
```
See also: [VerifiableCertificate](#class-verifiablecertificate)

#### Method fetch

Mutually authenticates and sends a HTTP request to a server.

1) Attempt the request.
2) If 402 Payment Required, automatically create and send payment.
3) Return the final response.

```ts
async fetch(url: string, config: SimplifiedFetchRequestOptions = {}): Promise<Response> 
```

Returns

A promise that resolves with the server's response, structured as a Response-like object.

Argument Details

+ **url**
  + The URL to send the request to.
+ **config**
  + Configuration options for the request, including method, headers, and body.

Throws

Will throw an error if unsupported headers are used or other validation fails.

#### Method sendCertificateRequest

Request Certificates from a Peer

```ts
async sendCertificateRequest(baseUrl: string, certificatesToRequest: RequestedCertificateSet): Promise<VerifiableCertificate[]> 
```
See also: [RequestedCertificateSet](#interface-requestedcertificateset), [VerifiableCertificate](#class-verifiablecertificate)

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: Certificate

Represents an Identity Certificate as per the Wallet interface specifications.

This class provides methods to serialize and deserialize certificates, as well as signing and verifying the certificate's signature.

```ts
export default class Certificate {
    type: Base64String;
    serialNumber: Base64String;
    subject: PubKeyHex;
    certifier: PubKeyHex;
    revocationOutpoint: OutpointString;
    fields: Record<CertificateFieldNameUnder50Bytes, string>;
    signature?: HexString;
    constructor(type: Base64String, serialNumber: Base64String, subject: PubKeyHex, certifier: PubKeyHex, revocationOutpoint: OutpointString, fields: Record<CertificateFieldNameUnder50Bytes, string>, signature?: HexString) 
    toBinary(includeSignature: boolean = true): number[] 
    static fromBinary(bin: number[]): Certificate 
    async verify(): Promise<boolean> 
    async sign(certifier: Wallet): Promise<void> 
}
```

See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex), [Wallet](#interface-wallet), [sign](#variable-sign), [verify](#variable-verify)

<details>

<summary>Class Certificate Details</summary>

#### Constructor

Constructs a new Certificate.

```ts
constructor(type: Base64String, serialNumber: Base64String, subject: PubKeyHex, certifier: PubKeyHex, revocationOutpoint: OutpointString, fields: Record<CertificateFieldNameUnder50Bytes, string>, signature?: HexString) 
```
See also: [Base64String](#type-base64string), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex)

Argument Details

+ **type**
  + Type identifier for the certificate, base64 encoded string, 32 bytes.
+ **serialNumber**
  + Unique serial number of the certificate, base64 encoded string, 32 bytes.
+ **subject**
  + The public key belonging to the certificate's subject, compressed public key hex string.
+ **certifier**
  + Public key of the certifier who issued the certificate, compressed public key hex string.
+ **revocationOutpoint**
  + The outpoint used to confirm that the certificate has not been revoked (TXID.OutputIndex), as a string.
+ **fields**
  + All the fields present in the certificate.
+ **signature**
  + Certificate signature by the certifier's private key, DER encoded hex string.

#### Property certifier

Public key of the certifier who issued the certificate, compressed public key hex string.

```ts
certifier: PubKeyHex
```
See also: [PubKeyHex](#type-pubkeyhex)

#### Property fields

All the fields present in the certificate, with field names as keys and field values as strings.

```ts
fields: Record<CertificateFieldNameUnder50Bytes, string>
```
See also: [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes)

#### Property revocationOutpoint

The outpoint used to confirm that the certificate has not been revoked (TXID.OutputIndex), as a string.

```ts
revocationOutpoint: OutpointString
```
See also: [OutpointString](#type-outpointstring)

#### Property serialNumber

Unique serial number of the certificate, base64 encoded string, 32 bytes.

```ts
serialNumber: Base64String
```
See also: [Base64String](#type-base64string)

#### Property signature

Certificate signature by the certifier's private key, DER encoded hex string.

```ts
signature?: HexString
```
See also: [HexString](#type-hexstring)

#### Property subject

The public key belonging to the certificate's subject, compressed public key hex string.

```ts
subject: PubKeyHex
```
See also: [PubKeyHex](#type-pubkeyhex)

#### Property type

Type identifier for the certificate, base64 encoded string, 32 bytes.

```ts
type: Base64String
```
See also: [Base64String](#type-base64string)

#### Method fromBinary

Deserializes a certificate from binary format.

```ts
static fromBinary(bin: number[]): Certificate 
```
See also: [Certificate](#class-certificate)

Returns

- The deserialized Certificate object.

Argument Details

+ **bin**
  + The binary data representing the certificate.

#### Method sign

Signs the certificate using the provided certifier wallet.

```ts
async sign(certifier: Wallet): Promise<void> 
```
See also: [Wallet](#interface-wallet)

Argument Details

+ **certifier**
  + The wallet representing the certifier.

#### Method toBinary

Serializes the certificate into binary format, with or without a signature.

```ts
toBinary(includeSignature: boolean = true): number[] 
```

Returns

- The serialized certificate in binary format.

Argument Details

+ **includeSignature**
  + Whether to include the signature in the serialization.

#### Method verify

Verifies the certificate's signature.

```ts
async verify(): Promise<boolean> 
```

Returns

- A promise that resolves to true if the signature is valid.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: MasterCertificate

MasterCertificate extends the base Certificate class to manage a master keyring, enabling the creation of verifiable certificates.

It allows for the selective disclosure of certificate fields by creating a `VerifiableCertificate` for a specific verifier.
The `MasterCertificate` can securely decrypt each master key and re-encrypt it for a verifier, creating a customized
keyring containing only the keys necessary for the verifier to access designated fields.

```ts
export class MasterCertificate extends Certificate {
    declare type: Base64String;
    declare serialNumber: Base64String;
    declare subject: PubKeyHex;
    declare certifier: PubKeyHex;
    declare revocationOutpoint: OutpointString;
    declare fields: Record<CertificateFieldNameUnder50Bytes, string>;
    declare signature?: HexString;
    masterKeyring: Record<CertificateFieldNameUnder50Bytes, string>;
    constructor(type: Base64String, serialNumber: Base64String, subject: PubKeyHex, certifier: PubKeyHex, revocationOutpoint: OutpointString, fields: Record<CertificateFieldNameUnder50Bytes, string>, masterKeyring: Record<CertificateFieldNameUnder50Bytes, string>, signature?: HexString) 
    async createKeyringForVerifier(subjectWallet: Wallet, verifierIdentityKey: string, fieldsToReveal: string[], originator?: string): Promise<Record<CertificateFieldNameUnder50Bytes, string>> 
}
```

See also: [Base64String](#type-base64string), [Certificate](#class-certificate), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex), [Wallet](#interface-wallet)

<details>

<summary>Class MasterCertificate Details</summary>

#### Method createKeyringForVerifier

Creates a verifiable certificate structure for a specific verifier, allowing them access to specified fields.
This method decrypts the master field keys for each field specified in `fieldsToReveal` and re-encrypts them
for the verifier's identity key. The resulting certificate structure includes only the fields intended to be
revealed and a verifier-specific keyring for field decryption.

```ts
async createKeyringForVerifier(subjectWallet: Wallet, verifierIdentityKey: string, fieldsToReveal: string[], originator?: string): Promise<Record<CertificateFieldNameUnder50Bytes, string>> 
```
See also: [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [Wallet](#interface-wallet)

Returns

- A new certificate structure containing the original encrypted fields, the verifier-specific field decryption keyring, and essential certificate metadata.

Argument Details

+ **subjectWallet**
  + The wallet instance of the subject, used to decrypt and re-encrypt field keys.
+ **verifierIdentityKey**
  + The public identity key of the verifier who will receive access to the specified fields.
+ **fieldsToReveal**
  + An array of field names to be revealed to the verifier. Must be a subset of the certificate's fields.
+ **originator**
  + Optional originator identifier, used if additional context is needed for decryption and encryption operations.

Throws

Throws an error if:
- fieldsToReveal is empty or a field in `fieldsToReveal` does not exist in the certificate.
- The decrypted master field key fails to decrypt the corresponding field (indicating an invalid key).

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: Peer

Represents a peer capable of performing mutual authentication.
Manages sessions, handles authentication handshakes, certificate requests and responses,
and sending and receiving general messages over a transport layer.

```ts
export class Peer {
    public sessionManager: SessionManager;
    certificatesToRequest: RequestedCertificateSet;
    constructor(wallet: Wallet, transport: Transport, certificatesToRequest?: RequestedCertificateSet, sessionManager?: SessionManager, autoPersistLastSession?: boolean) 
    async toPeer(message: number[], identityKey?: string, maxWaitTime?: number): Promise<void> 
    async requestCertificates(certificatesToRequest: RequestedCertificateSet, identityKey?: string, maxWaitTime = 10000): Promise<void> 
    async getAuthenticatedSession(identityKey?: string, maxWaitTime?: number): Promise<PeerSession> 
    listenForGeneralMessages(callback: (senderPublicKey: string, payload: number[]) => void): number 
    stopListeningForGeneralMessages(callbackID: number): void 
    listenForCertificatesReceived(callback: (senderPublicKey: string, certs: VerifiableCertificate[]) => void): number 
    stopListeningForCertificatesReceived(callbackID: number): void 
    listenForCertificatesRequested(callback: (senderPublicKey: string, requestedCertificates: RequestedCertificateSet) => void): number 
    stopListeningForCertificatesRequested(callbackID: number): void 
    async processInitialRequest(message: AuthMessage) 
    async sendCertificateResponse(verifierIdentityKey: string, certificates: VerifiableCertificate[]) 
}
```

See also: [AuthMessage](#interface-authmessage), [PeerSession](#interface-peersession), [RequestedCertificateSet](#interface-requestedcertificateset), [SessionManager](#class-sessionmanager), [Transport](#interface-transport), [VerifiableCertificate](#class-verifiablecertificate), [Wallet](#interface-wallet)

<details>

<summary>Class Peer Details</summary>

#### Constructor

Creates a new Peer instance

```ts
constructor(wallet: Wallet, transport: Transport, certificatesToRequest?: RequestedCertificateSet, sessionManager?: SessionManager, autoPersistLastSession?: boolean) 
```
See also: [RequestedCertificateSet](#interface-requestedcertificateset), [SessionManager](#class-sessionmanager), [Transport](#interface-transport), [Wallet](#interface-wallet)

Argument Details

+ **wallet**
  + The wallet instance used for cryptographic operations.
+ **transport**
  + The transport mechanism used for sending and receiving messages.
+ **certificatesToRequest**
  + Optional set of certificates to request from a peer during the initial handshake.
+ **sessionManager**
  + Optional SessionManager to be used for managing peer sessions.
+ **autoPersistLastSession**
  + Whether to auto-persist the session with the last-interacted-with peer. Defaults to true.

#### Method getAuthenticatedSession

Retrieves an authenticated session for a given peer identity. If no session exists
or the session is not authenticated, initiates a handshake to create or authenticate the session.

```ts
async getAuthenticatedSession(identityKey?: string, maxWaitTime?: number): Promise<PeerSession> 
```
See also: [PeerSession](#interface-peersession)

Returns

- A promise that resolves with an authenticated `PeerSession`.

Argument Details

+ **identityKey**
  + The identity public key of the peer. If provided, it attempts
to retrieve an existing session associated with this identity.
+ **maxWaitTime**
  + The maximum time in milliseconds to wait for the handshake
to complete if a new session is required. Defaults to a pre-defined timeout if not specified.

Throws

- Throws an error if the transport is not connected or if the handshake fails.

#### Method listenForCertificatesReceived

Registers a callback to listen for certificates received from peers.

```ts
listenForCertificatesReceived(callback: (senderPublicKey: string, certs: VerifiableCertificate[]) => void): number 
```
See also: [VerifiableCertificate](#class-verifiablecertificate)

Returns

The ID of the callback listener.

Argument Details

+ **callback**
  + The function to call when certificates are received.

#### Method listenForCertificatesRequested

Registers a callback to listen for certificates requested from peers.

```ts
listenForCertificatesRequested(callback: (senderPublicKey: string, requestedCertificates: RequestedCertificateSet) => void): number 
```
See also: [RequestedCertificateSet](#interface-requestedcertificateset)

Returns

The ID of the callback listener.

Argument Details

+ **callback**
  + The function to call when a certificate request is received

#### Method listenForGeneralMessages

Registers a callback to listen for general messages from peers.

```ts
listenForGeneralMessages(callback: (senderPublicKey: string, payload: number[]) => void): number 
```

Returns

The ID of the callback listener.

Argument Details

+ **callback**
  + The function to call when a general message is received.

#### Method processInitialRequest

Processes an initial request message from a peer.

```ts
async processInitialRequest(message: AuthMessage) 
```
See also: [AuthMessage](#interface-authmessage)

Argument Details

+ **message**
  + The incoming initial request message.

#### Method requestCertificates

Sends a request for certificates to a peer.
This method allows a peer to dynamically request specific certificates after
an initial handshake or message has been exchanged.

```ts
async requestCertificates(certificatesToRequest: RequestedCertificateSet, identityKey?: string, maxWaitTime = 10000): Promise<void> 
```
See also: [RequestedCertificateSet](#interface-requestedcertificateset)

Returns

Resolves if the certificate request message is successfully sent.

Argument Details

+ **certificatesToRequest**
  + Specifies the certifiers and types of certificates required from the peer.
+ **identityKey**
  + The identity public key of the peer. If not provided, the current session identity is used.
+ **maxWaitTime**
  + Maximum time in milliseconds to wait for the peer session to be authenticated.

Throws

Will throw an error if the peer session is not authenticated or if sending the request fails.

#### Method sendCertificateResponse

Sends a certificate response message containing the specified certificates to a peer.

```ts
async sendCertificateResponse(verifierIdentityKey: string, certificates: VerifiableCertificate[]) 
```
See also: [VerifiableCertificate](#class-verifiablecertificate)

Returns

- A promise that resolves once the certificate response has been sent successfully.

Argument Details

+ **verifierIdentityKey**
  + The identity key of the peer requesting the certificates.
+ **certificates**
  + The list of certificates to be included in the response.

Throws

Throws an error if the peer session could not be authenticated or if message signing fails.

#### Method stopListeningForCertificatesReceived

Cancels and unsubscribes a certificatesReceived listener.

```ts
stopListeningForCertificatesReceived(callbackID: number): void 
```

Argument Details

+ **callbackID**
  + The ID of the certificates received callback to cancel.

#### Method stopListeningForCertificatesRequested

Cancels and unsubscribes a certificatesRequested listener.

```ts
stopListeningForCertificatesRequested(callbackID: number): void 
```

Argument Details

+ **callbackID**
  + The ID of the requested certificates callback to cancel.

#### Method stopListeningForGeneralMessages

Removes a general message listener.

```ts
stopListeningForGeneralMessages(callbackID: number): void 
```

Argument Details

+ **callbackID**
  + The ID of the callback to remove.

#### Method toPeer

Sends a general message to a peer, and initiates a handshake if necessary.

```ts
async toPeer(message: number[], identityKey?: string, maxWaitTime?: number): Promise<void> 
```

Argument Details

+ **message**
  + The message payload to send.
+ **identityKey**
  + The identity public key of the peer. If not provided, a handshake will be initiated.

Throws

Will throw an error if the message fails to send.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: SessionManager

Manages sessions for peers, allowing sessions to be added, retrieved, updated, and removed
by relevant identifiers (sessionNonce and peerIdentityKey).

```ts
export class SessionManager {
    constructor() 
    addSession(session: PeerSession): void 
    updateSession(session: PeerSession): void 
    getSession(identifier: string): PeerSession | undefined 
    removeSession(session: PeerSession): void 
    hasSession(identifier: string): boolean 
}
```

See also: [PeerSession](#interface-peersession)

<details>

<summary>Class SessionManager Details</summary>

#### Method addSession

Adds a session to the manager, associating it with relevant identifiers for retrieval.

```ts
addSession(session: PeerSession): void 
```
See also: [PeerSession](#interface-peersession)

Argument Details

+ **session**
  + The peer session to add.

#### Method getSession

Retrieves a session based on a given identifier.

```ts
getSession(identifier: string): PeerSession | undefined 
```
See also: [PeerSession](#interface-peersession)

Returns

- The matching peer session, or undefined if not found.

Argument Details

+ **identifier**
  + The identifier for the session (sessionNonce or peerIdentityKey).

#### Method hasSession

Checks if a session exists based on a given identifier.

```ts
hasSession(identifier: string): boolean 
```

Returns

- True if the session exists, false otherwise.

Argument Details

+ **identifier**
  + The identifier to check.

#### Method removeSession

Removes a session from the manager by clearing all associated identifiers.

```ts
removeSession(session: PeerSession): void 
```
See also: [PeerSession](#interface-peersession)

Argument Details

+ **session**
  + The peer session to remove.

#### Method updateSession

Updates a session in the manager, ensuring that all identifiers are correctly associated.

```ts
updateSession(session: PeerSession): void 
```
See also: [PeerSession](#interface-peersession)

Argument Details

+ **session**
  + The peer session to update.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: SimplifiedFetchTransport

Implements an HTTP-specific transport for handling Peer mutual authentication messages.
This class integrates with fetch to send and receive authenticated messages between peers.

```ts
export class SimplifiedFetchTransport implements Transport {
    fetchClient: typeof fetch;
    baseUrl: string;
    constructor(baseUrl: string, fetchClient = defaultFetch) 
    async send(message: AuthMessage): Promise<void> 
    async onData(callback: (message: AuthMessage) => Promise<void>): Promise<void> 
    deserializeRequestPayload(payload: number[]): {
        method: string;
        urlPostfix: string;
        headers: Record<string, string>;
        body: number[];
        requestId: string;
    } 
}
```

See also: [AuthMessage](#interface-authmessage), [Transport](#interface-transport)

<details>

<summary>Class SimplifiedFetchTransport Details</summary>

#### Constructor

Constructs a new instance of SimplifiedFetchTransport.

```ts
constructor(baseUrl: string, fetchClient = defaultFetch) 
```

Argument Details

+ **baseUrl**
  + The base URL for all HTTP requests made by this transport.
+ **fetchClient**
  + A fetch implementation to use for HTTP requests (default: global fetch).

#### Method deserializeRequestPayload

Deserializes a request payload from a byte array into an HTTP request-like structure.

```ts
deserializeRequestPayload(payload: number[]): {
    method: string;
    urlPostfix: string;
    headers: Record<string, string>;
    body: number[];
    requestId: string;
} 
```

Returns

An object representing the deserialized request, including the method,
URL postfix (path and query string), headers, body, and request ID.

Argument Details

+ **payload**
  + The serialized payload to deserialize.

#### Method onData

Registers a callback to handle incoming messages. 
This must be called before sending any messages to ensure responses can be processed.

```ts
async onData(callback: (message: AuthMessage) => Promise<void>): Promise<void> 
```
See also: [AuthMessage](#interface-authmessage)

Returns

A promise that resolves once the callback is set.

Argument Details

+ **callback**
  + A function to invoke when an incoming AuthMessage is received.

#### Method send

Sends a message to an HTTP server using the transport mechanism.
Handles both general and authenticated message types. For general messages,
the payload is deserialized and sent as an HTTP request. For other message types,
the message is sent as a POST request to the `/auth` endpoint.

```ts
async send(message: AuthMessage): Promise<void> 
```
See also: [AuthMessage](#interface-authmessage)

Returns

A promise that resolves when the message is successfully sent.

Argument Details

+ **message**
  + The AuthMessage to send.

Throws

Will throw an error if no listener has been registered via `onData`.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: VerifiableCertificate

VerifiableCertificate extends the Certificate class, adding functionality to manage a verifier-specific keyring.
This keyring allows selective decryption of certificate fields for authorized verifiers.

```ts
export class VerifiableCertificate extends Certificate {
    declare type: Base64String;
    declare serialNumber: Base64String;
    declare subject: PubKeyHex;
    declare certifier: PubKeyHex;
    declare revocationOutpoint: OutpointString;
    declare fields: Record<CertificateFieldNameUnder50Bytes, string>;
    declare signature?: HexString;
    keyring: Record<CertificateFieldNameUnder50Bytes, string>;
    decryptedFields?: Record<CertificateFieldNameUnder50Bytes, Base64String>;
    constructor(type: Base64String, serialNumber: Base64String, subject: PubKeyHex, certifier: PubKeyHex, revocationOutpoint: OutpointString, fields: Record<CertificateFieldNameUnder50Bytes, string>, signature?: HexString, keyring?: Record<CertificateFieldNameUnder50Bytes, string>, decryptedFields?: Record<CertificateFieldNameUnder50Bytes, Base64String>) 
    async decryptFields(verifierWallet: Wallet): Promise<Record<CertificateFieldNameUnder50Bytes, string>> 
}
```

See also: [Base64String](#type-base64string), [Certificate](#class-certificate), [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [HexString](#type-hexstring), [OutpointString](#type-outpointstring), [PubKeyHex](#type-pubkeyhex), [Wallet](#interface-wallet)

<details>

<summary>Class VerifiableCertificate Details</summary>

#### Method decryptFields

Decrypts certificate fields using the provided keyring and verifier wallet

```ts
async decryptFields(verifierWallet: Wallet): Promise<Record<CertificateFieldNameUnder50Bytes, string>> 
```
See also: [CertificateFieldNameUnder50Bytes](#type-certificatefieldnameunder50bytes), [Wallet](#interface-wallet)

Returns

- A promise that resolves to an object where each key is a field name and each value is the decrypted field value as a string.

Argument Details

+ **verifierWallet**
  + The wallet instance of the certificate's verifier, used to decrypt field keys.

Throws

Throws an error if any of the decryption operations fail, with a message indicating the failure context.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Functions

| |
| --- |
| [createMasterCertificate](#function-createmastercertificate) |
| [createNonce](#function-createnonce) |
| [createVerifiableCertificate](#function-createverifiablecertificate) |
| [verifyNonce](#function-verifynonce) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Function: createMasterCertificate

Creates a Master Certificate by encrypting provided fields and generating a master keyring.

```ts
export async function createMasterCertificate(wallet: Wallet, fields: Record<string, string>, certificateType: string, certificateSerialNumber: string, certifierPublicKey: string): Promise<MasterCertificate> 
```

See also: [MasterCertificate](#class-mastercertificate), [Wallet](#interface-wallet)

<details>

<summary>Function createMasterCertificate Details</summary>

Returns

A promise resolving to the created Master Certificate.

Argument Details

+ **wallet**
  + The wallet instance used for encryption and public key retrieval.
+ **fields**
  + The certificate fields to encrypt.
+ **certificateType**
  + The type of the certificate being created.
+ **certificateSerialNumber**
  + The serial number of the certificate.
+ **certifierPublicKey**
  + The public key of the certifier.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Function: createNonce

Creates a nonce derived from a privateKey

```ts
export async function createNonce(wallet: Wallet): Promise<string> 
```

See also: [Wallet](#interface-wallet)

<details>

<summary>Function createNonce Details</summary>

Returns

A random nonce derived with a wallet

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Function: createVerifiableCertificate

Creates a Verifiable Certificate by signing a Master Certificate and generating a keyring for a verifier.

```ts
export async function createVerifiableCertificate(masterCertificate: MasterCertificate, wallet: Wallet, verifierIdentityKey: string, fieldsToReveal: string[], certifierPrivateKey: PrivateKey): Promise<VerifiableCertificate> 
```

See also: [MasterCertificate](#class-mastercertificate), [PrivateKey](#class-privatekey), [VerifiableCertificate](#class-verifiablecertificate), [Wallet](#interface-wallet)

<details>

<summary>Function createVerifiableCertificate Details</summary>

Returns

A promise resolving to the created Verifiable Certificate.

Argument Details

+ **masterCertificate**
  + The master certificate to convert into a verifiable certificate.
+ **wallet**
  + The wallet instance used for generating a keyring for the verifier.
+ **verifierIdentityKey**
  + The identity key of the verifier.
+ **fieldsToReveal**
  + The list of fields to reveal to the verifier.
+ **certifierPrivateKey**
  + The private key of the certifier for signing the certificate.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Function: verifyNonce

Verifies a nonce derived from a wallet

```ts
export async function verifyNonce(nonce: string, wallet: Wallet): Promise<boolean> 
```

See also: [Wallet](#interface-wallet)

<details>

<summary>Function verifyNonce Details</summary>

Returns

The status of the validation

Argument Details

+ **nonce**
  + A nonce to verify as a base64 string.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Types

## Enums

## Variables

| |
| --- |
| [getVerifiableCertificates](#variable-getverifiablecertificates) |
| [validateCertificates](#variable-validatecertificates) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Variable: getVerifiableCertificates

```ts
getVerifiableCertificates = async (wallet: Wallet, requestedCertificates: RequestedCertificateSet, verifierIdentityKey: string): Promise<VerifiableCertificate[]> => {
    const matchingCertificates = await wallet.listCertificates({
        certifiers: requestedCertificates.certifiers,
        types: Object.keys(requestedCertificates.types)
    });
    return await Promise.all(matchingCertificates.certificates.map(async (certificate) => {
        const { keyringForVerifier } = await wallet.proveCertificate({
            certificate,
            fieldsToReveal: requestedCertificates.types[certificate.type],
            verifier: verifierIdentityKey
        });
        return new VerifiableCertificate(certificate.type, certificate.serialNumber, certificate.subject, certificate.certifier, certificate.revocationOutpoint, certificate.fields, certificate.signature, keyringForVerifier);
    }));
}
```

See also: [RequestedCertificateSet](#interface-requestedcertificateset), [VerifiableCertificate](#class-verifiablecertificate), [Wallet](#interface-wallet)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Variable: validateCertificates

```ts
validateCertificates = async (verifierWallet: Wallet, message: AuthMessage, certificatesRequested?: RequestedCertificateSet): Promise<void> => {
    await Promise.all(message.certificates.map(async (incomingCert: VerifiableCertificate) => {
        if (incomingCert.subject !== message.identityKey) {
            throw new Error(`The subject of one of your certificates ("${incomingCert.subject}") is not the same as the request sender ("${message.identityKey}").`);
        }
        const certToVerify = new VerifiableCertificate(incomingCert.type, incomingCert.serialNumber, incomingCert.subject, incomingCert.certifier, incomingCert.revocationOutpoint, incomingCert.fields, incomingCert.signature, incomingCert.keyring);
        const isValidCert = await certToVerify.verify();
        if (!isValidCert) {
            throw new Error(`The signature for the certificate with serial number ${certToVerify.serialNumber} is invalid!`);
        }
        if (certificatesRequested) {
            const { certifiers, types } = certificatesRequested;
            if (!certifiers.includes(certToVerify.certifier)) {
                throw new Error(`Certificate with serial number ${certToVerify.serialNumber} has an unrequested certifier: ${certToVerify.certifier}`);
            }
            const requestedFields = types[certToVerify.type];
            if (!requestedFields) {
                throw new Error(`Certificate with type ${certToVerify.type} was not requested`);
            }
        }
        await certToVerify.decryptFields(verifierWallet);
    }));
}
```

See also: [AuthMessage](#interface-authmessage), [Certificate](#class-certificate), [RequestedCertificateSet](#interface-requestedcertificateset), [VerifiableCertificate](#class-verifiablecertificate), [Wallet](#interface-wallet), [verify](#variable-verify)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
