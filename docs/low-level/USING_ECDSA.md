# Low-level: Making Use of ECDSA with Public and Private Keys

In this tutorial, we will learn how to use ECDSA with asymmetric public and private key pairs. Note, this is a low-level tutorial and should only be used if you would like to add advanced features to your applications. 

## Getting Started

First, you will want to make sure you have installed the required dependencies.

```ts
import { PrivateKey, Utils } from '@bsv/sdk'
```

```ts
const privateKey = PrivateKey.fromRandom()
const message = Utils.toArray('Message to sign!')
const signature = privateKey.sign(message)
const valid = privateKey.verify(message, signature)
// console.log(valid) --> true
```