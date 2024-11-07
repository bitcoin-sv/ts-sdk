# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

## Interfaces

| |
| --- |
| [AdmittanceInstructions](#interface-admittanceinstructions) |
| [LookupQuestion](#interface-lookupquestion) |
| [LookupResolverConfig](#interface-lookupresolverconfig) |
| [OverlayBroadcastFacilitator](#interface-overlaybroadcastfacilitator) |
| [OverlayLookupFacilitator](#interface-overlaylookupfacilitator) |
| [SHIPBroadcasterConfig](#interface-shipbroadcasterconfig) |
| [TaggedBEEF](#interface-taggedbeef) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

### Interface: LookupQuestion

The question asked to the Overlay Services Engine when a consumer of state wishes to look up information.

```ts
export interface LookupQuestion {
    service: string;
    query: unknown;
}
```

<details>

<summary>Interface LookupQuestion Details</summary>

#### Property query

The query which will be forwarded to the Lookup Service.
Its type depends on that prescribed by the Lookup Service employed.

```ts
query: unknown
```

#### Property service

The identifier for a Lookup Service which the person asking the question wishes to use.

```ts
service: string
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Interface: LookupResolverConfig

Configuration options for the Lookup resolver.

```ts
export interface LookupResolverConfig {
    facilitator?: OverlayLookupFacilitator;
    slapTrackers?: string[];
    hostOverrides?: Record<string, string[]>;
    additionalHosts?: Record<string, string[]>;
}
```

<details>

<summary>Interface LookupResolverConfig Details</summary>

#### Property additionalHosts

Map of lookup service names to arrays of hosts to use in addition to resolving via SLAP.

```ts
additionalHosts?: Record<string, string[]>
```

#### Property facilitator

The facilitator used to make requests to Overlay Services hosts.

```ts
facilitator?: OverlayLookupFacilitator
```

#### Property hostOverrides

Map of lookup service names to arrays of hosts to use in place of resolving via SLAP.

```ts
hostOverrides?: Record<string, string[]>
```

#### Property slapTrackers

The list of SLAP trackers queried to resolve Overlay Services hosts for a given lookup service.

```ts
slapTrackers?: string[]
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Interface: OverlayLookupFacilitator

Facilitates lookups to URLs that return answers.

```ts
export interface OverlayLookupFacilitator {
    lookup: (url: string, question: LookupQuestion) => Promise<LookupAnswer>;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Interface: TaggedBEEF

Tagged BEEF

```ts
export interface TaggedBEEF {
    beef: number[];
    topics: string[];
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Interface: AdmittanceInstructions

Instructs the Overlay Services Engine about which outputs to admit and which previous outputs to retain. Returned by a Topic Manager.

```ts
export interface AdmittanceInstructions {
    outputsToAdmit: number[];
    coinsToRetain: number[];
}
```

<details>

<summary>Interface AdmittanceInstructions Details</summary>

#### Property coinsToRetain

The indices of all inputs from the provided transaction which spend previously-admitted outputs that should be retained for historical record-keeping.

```ts
coinsToRetain: number[]
```

#### Property outputsToAdmit

The indices of all admissable outputs into the managed topic from the provided transaction.

```ts
outputsToAdmit: number[]
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Interface: SHIPBroadcasterConfig

Configuration options for the SHIP broadcaster.

```ts
export interface SHIPBroadcasterConfig {
    facilitator?: OverlayBroadcastFacilitator;
    resolver: LookupResolver;
    requireAcknowledgmentFromAllHostsForTopics?: "all" | "any" | string[];
    requireAcknowledgmentFromAnyHostForTopics?: "all" | "any" | string[];
    requireAcknowledgmentFromSpecificHostsForTopics?: Record<string, "all" | "any" | string[]>;
}
```

<details>

<summary>Interface SHIPBroadcasterConfig Details</summary>

#### Property facilitator

The facilitator used to make requests to Overlay Services hosts.

```ts
facilitator?: OverlayBroadcastFacilitator
```

#### Property requireAcknowledgmentFromAllHostsForTopics

Determines which topics (all, any, or a specific list) mustt be present within all STEAKs received from every host for the broadcast to be considered a success. By default, all hosts must acknowledge all topics.

```ts
requireAcknowledgmentFromAllHostsForTopics?: "all" | "any" | string[]
```

#### Property requireAcknowledgmentFromAnyHostForTopics

Determines which topics (all, any, or a specific list) mustt be present within STEAK received from at least one host for the broadcast to be considered a success.

```ts
requireAcknowledgmentFromAnyHostForTopics?: "all" | "any" | string[]
```

#### Property requireAcknowledgmentFromSpecificHostsForTopics

Determines a mapping whose keys are specific hosts and whose values are the topics (all, any, or a specific list) that must be present within the STEAK received by the given hosts, in order for the broadcast to be considered a success.

```ts
requireAcknowledgmentFromSpecificHostsForTopics?: Record<string, "all" | "any" | string[]>
```

#### Property resolver

The resolver used to locate suitable hosts with SHIP

```ts
resolver: LookupResolver
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Interface: OverlayBroadcastFacilitator

Facilitates transaction broadcasts that return STEAK.

```ts
export interface OverlayBroadcastFacilitator {
    send: (url: string, taggedBEEF: TaggedBEEF) => Promise<STEAK>;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
## Classes

| |
| --- |
| [HTTPSOverlayBroadcastFacilitator](#class-httpsoverlaybroadcastfacilitator) |
| [HTTPSOverlayLookupFacilitator](#class-httpsoverlaylookupfacilitator) |
| [LookupResolver](#class-lookupresolver) |
| [OverlayAdminTokenTemplate](#class-overlayadmintokentemplate) |
| [SHIPCast](#class-shipcast) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

### Class: OverlayAdminTokenTemplate

Script template enabling the creation, unlocking, and decoding of SHIP and SLAP advertisements.

```ts
export default class OverlayAdminTokenTemplate implements ScriptTemplate {
    pushDrop: PushDrop;
    static decode(script: LockingScript): {
        protocol: "SHIP" | "SLAP";
        identityKey: string;
        domain: string;
        topicOrService: string;
    } 
    constructor(wallet: Wallet) 
    async lock(protocol: "SHIP" | "SLAP", domain: string, topicOrService: string): Promise<LockingScript> 
    unlock(protocol: "SHIP" | "SLAP"): {
        sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
        estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>;
    } 
}
```

<details>

<summary>Class OverlayAdminTokenTemplate Details</summary>

#### Constructor

Constructs a new Overlay Admin template instance

```ts
constructor(wallet: Wallet) 
```

Argument Details

+ **wallet**
  + Wallet to use for locking and unlocking

#### Method decode

Decodes a SHIP or SLAP advertisement from a given locking script.

```ts
static decode(script: LockingScript): {
    protocol: "SHIP" | "SLAP";
    identityKey: string;
    domain: string;
    topicOrService: string;
} 
```

Returns

Decoded SHIP or SLAP advertisement

Argument Details

+ **script**
  + Locking script comprising a SHIP or SLAP token to decode

#### Method lock

Creates a new advertisement locking script

```ts
async lock(protocol: "SHIP" | "SLAP", domain: string, topicOrService: string): Promise<LockingScript> 
```

Returns

Locking script comprising the advertisement token

Argument Details

+ **protocol**
  + SHIP or SLAP
+ **domain**
  + Domain where the topic or service is available
+ **topicOrService**
  + Topic or service to advertise

#### Method unlock

Unlocks an advertisement token as part of a transaction.

```ts
unlock(protocol: "SHIP" | "SLAP"): {
    sign: (tx: Transaction, inputIndex: number) => Promise<UnlockingScript>;
    estimateLength: (tx: Transaction, inputIndex: number) => Promise<number>;
} 
```

Returns

Script unlocker capable of unlocking the advertisement token

Argument Details

+ **protocol**
  + SHIP or SLAP, depending on the token to unlock

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: HTTPSOverlayLookupFacilitator

```ts
export class HTTPSOverlayLookupFacilitator implements OverlayLookupFacilitator {
    httpClient: HttpClient;
    constructor(httpClient?: HttpClient) 
    async lookup(url: string, question: LookupQuestion): Promise<LookupAnswer> 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: LookupResolver

Represents an SHIP transaction broadcaster.

```ts
export default class LookupResolver {
    constructor(config?: LookupResolverConfig) 
    async query(question: LookupQuestion): Promise<LookupAnswer> 
}
```

<details>

<summary>Class LookupResolver Details</summary>

#### Method query

Given a LookupQuestion, returns a LookupAnswer. Aggregates across multiple services and supports resiliency.

```ts
async query(question: LookupQuestion): Promise<LookupAnswer> 
```

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: HTTPSOverlayBroadcastFacilitator

```ts
export class HTTPSOverlayBroadcastFacilitator implements OverlayBroadcastFacilitator {
    httpClient: HttpClient;
    constructor(httpClient?: HttpClient) 
    async send(url: string, taggedBEEF: TaggedBEEF): Promise<STEAK> 
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Class: SHIPCast

Represents a SHIP transaction broadcaster.

```ts
export default class SHIPCast implements Broadcaster {
    constructor(topics: string[], config?: SHIPBroadcasterConfig) 
    async broadcast(tx: Transaction): Promise<BroadcastResponse | BroadcastFailure> 
}
```

<details>

<summary>Class SHIPCast Details</summary>

#### Constructor

Constructs an instance of the SHIP broadcaster.

```ts
constructor(topics: string[], config?: SHIPBroadcasterConfig) 
```

Argument Details

+ **topics**
  + The list of SHIP topic names where transactions are to be sent.
+ **config**
  + Configuration options for the SHIP broadcaster.

#### Method broadcast

Broadcasts a transaction to Overlay Services via SHIP.

```ts
async broadcast(tx: Transaction): Promise<BroadcastResponse | BroadcastFailure> 
```

Returns

A promise that resolves to either a success or failure response.

Argument Details

+ **tx**
  + The transaction to be sent.

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
## Functions

## Types

| |
| --- |
| [LookupAnswer](#type-lookupanswer) |
| [STEAK](#type-steak) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

### Type: LookupAnswer

How the Overlay Services Engine responds to a Lookup Question.
It may comprise either an output list or a freeform response from the Lookup Service.

```ts
export type LookupAnswer = {
    type: "output-list";
    outputs: Array<{
        beef: number[];
        outputIndex: number;
    }>;
} | {
    type: "freeform";
    result: unknown;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Type: STEAK

Submitted Transaction Execution AcKnowledgment

```ts
export type STEAK = Record<string, AdmittanceInstructions>
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
## Variables

| |
| --- |
| [DEFAULT_SHIP_TRACKERS](#variable-default_ship_trackers) |
| [DEFAULT_SLAP_TRACKERS](#variable-default_slap_trackers) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

### Variable: DEFAULT_SLAP_TRACKERS

```ts
DEFAULT_SLAP_TRACKERS: string[] = []
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Variable: DEFAULT_SHIP_TRACKERS

```ts
DEFAULT_SHIP_TRACKERS: string[] = []
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
