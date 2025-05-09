# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

## Interfaces

### Interface: TOTPOptions

Options for TOTP generation.

```ts
export interface TOTPOptions {
    digits?: number;
    algorithm?: TOTPAlgorithm;
    period?: number;
    timestamp?: number;
}
```

See also: [TOTPAlgorithm](./totp.md#type-totpalgorithm)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
## Classes

### Class: TOTP

```ts
export class TOTP {
    static generate(secret: number[], options?: TOTPOptions): string 
    static validate(secret: number[], passcode: string, options?: TOTPValidateOptions): boolean 
}
```

See also: [TOTPOptions](./totp.md#interface-totpoptions), [TOTPValidateOptions](./totp.md#type-totpvalidateoptions)

#### Method generate

Generates a Time-based One-Time Password (TOTP).

```ts
static generate(secret: number[], options?: TOTPOptions): string 
```
See also: [TOTPOptions](./totp.md#interface-totpoptions)

Returns

The generated TOTP.

Argument Details

+ **secret**
  + The secret key for TOTP.
+ **options**
  + Optional parameters for TOTP.

#### Method validate

Validates a Time-based One-Time Password (TOTP).

```ts
static validate(secret: number[], passcode: string, options?: TOTPValidateOptions): boolean 
```
See also: [TOTPValidateOptions](./totp.md#type-totpvalidateoptions)

Returns

A boolean indicating whether the passcode is valid.

Argument Details

+ **secret**
  + The secret key for TOTP.
+ **passcode**
  + The passcode to validate.
+ **options**
  + Optional parameters for TOTP validation.

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
## Functions

## Types

| |
| --- |
| [TOTPAlgorithm](#type-totpalgorithm) |
| [TOTPValidateOptions](#type-totpvalidateoptions) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---

### Type: TOTPAlgorithm

```ts
export type TOTPAlgorithm = "SHA-1" | "SHA-256" | "SHA-512"
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
### Type: TOTPValidateOptions

Options for TOTP validation.

```ts
export type TOTPValidateOptions = TOTPOptions & {
    skew?: number;
}
```

See also: [TOTPOptions](./totp.md#interface-totpoptions)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Variables](#variables)

---
## Variables

