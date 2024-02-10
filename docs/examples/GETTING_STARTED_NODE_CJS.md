# Getting Started with BSV SDK in NodeJS (CommonJS)

Welcome to the BSV SDK! This guide is tailored for developers working in a NodeJS environment, specifically those who are using the CommonJS module system. We'll walk you through the installation process and show you how to get started with creating and signing a Bitcoin SV transaction using the SDK. Whether you're building on BSV for the first time or transitioning an existing project to use the SDK, this guide is for you.

## Prerequisites

Before we begin, make sure you have Node.js installed on your system. You can download and install Node.js from [nodejs.org](https://nodejs.org/). This guide assumes you have basic knowledge of JavaScript and the Node.js environment.

## Installation

First, you'll need to install the BSV SDK package in your project. Open your terminal, navigate to your project directory, and run the following command:

```bash
npm install @bsv/sdk
```

This command installs the BSV SDK in your project, making it ready for use. There are no external runtime dependencies.

## Requiring the SDK

To use the BSV SDK in a NodeJS project with CommonJS, you'll import modules using the `require` syntax. Here's how you set up a basic script to use the BSV SDK:

1. Create a new JavaScript file in your project. For example, `index.js`.
2. At the top of your file, require the SDK modules you plan to use. For instance:

```javascript
const { PrivateKey, P2PKH, Transaction, ARC } = require('@bsv/sdk');
```

## Creating and Signing a Transaction

Now, let's create and sign a transaction. We'll follow the example provided in the README. This example demonstrates how to create a transaction from a source to a recipient, including calculating fees, signing the transaction, and broadcasting it to ARC.

Copy and paste the following code into your `index.js` file below your `require` statement:

```javascript
const privKey = PrivateKey.fromWif('L5EY1SbTvvPNSdCYQe1EJHfXCBBT4PmnF6CDbzCm9iifZptUvDGB')

const sourceTransaction = Transaction.fromHex('0200000001849c6419aec8b65d747cb72282cc02f3fc26dd018b46962f5de48957fac50528020000006a473044022008a60c611f3b48eaf0d07b5425d75f6ce65c3730bd43e6208560648081f9661b0220278fa51877100054d0d08e38e069b0afdb4f0f9d38844c68ee2233ace8e0de2141210360cd30f72e805be1f00d53f9ccd47dfd249cbb65b0d4aee5cfaf005a5258be37ffffffff03d0070000000000001976a914acc4d7c37bc9d0be0a4987483058a2d842f2265d88ac75330100000000001976a914db5b7964eecb19fcab929bf6bd29297ec005d52988ac809f7c09000000001976a914c0b0a42e92f062bdbc6a881b1777eed1213c19eb88ac00000000')

const version = 1
const input = {
  sourceTransaction,
  sourceOutputIndex: 0,
  unlockingScriptTemplate: new P2PKH().unlock(privKey),
}
const output = {
  lockingScript: new P2PKH().lock(privKey.toPublicKey().toHash()),
  change: true
}

const tx = new Transaction(version, [input], [output])
await tx.fee()
await tx.sign()

// get your api key from https://console.taal.com
const apiKey = 'mainnet_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // replace
await tx.broadcast(new ARC('https://api.taal.com/arc', apiKey))
```

This script demonstrates the entire process of creating a transaction, from initializing keys to signing and broadcast. When you run this script using Node.js (replacing the source transaction, private key, and ARC credentials), the spend will be signed and broadcast to the BSV network.

## Running Your Script

To run your script, simply execute the following command in your terminal:

```bash
node index.js
```

## Conclusion

Congratulations! You've successfully installed the BSV SDK in your NodeJS project and created a signed transaction. This guide covered the basics to get you started, but the BSV SDK is capable of much more. Explore the SDK documentation for detailed information on all the features and functionalities available to build scalable applications with the BSV blockchain.