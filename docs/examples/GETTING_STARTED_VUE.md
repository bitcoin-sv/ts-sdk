# Getting Started with BSV SDK in a Vue TypeScript Project

Welcome to the quick start guide for integrating the BSV SDK into your Vue TypeScript project. This guide will walk you through the setup and basic usage of the BSV SDK, enabling you to build scalable applications on the BSV Blockchain. Let’s dive into how you can add blockchain capabilities to your Vue application.

## Prerequisites

Before starting, ensure you have the following installed:
- Node.js (16.x or later)
- npm (6.x or later)
- Vue CLI (3.x or later)

If you're new to Vue or TypeScript, it might be helpful to familiarize yourself with the basics of creating a Vue project with TypeScript support.

## Step 1: Create Your Vue Project

If you haven't already, start by creating a new Vue project. Open your terminal and run:

```bash
vue create my-bsv-app
```

During the setup, choose "Manually select features" to select TypeScript. Follow the prompts to set up TypeScript with Vue.

## Step 2: Install the BSV SDK

Navigate to your project directory in the terminal and install the BSV SDK by running:

```bash
npm install @bsv/sdk
```

This command will add the BSV SDK as a dependency to your project, making its functionality available for use in your Vue components.

## Step 3: Initialize the SDK in Your Vue Application

Create a new file `bsvPlugin.ts` in your project's `src` directory. This file will set up the BSV SDK so that it can be easily used throughout your application.

```typescript
// src/bsvPlugin.ts

import { createApp } from 'vue';
import App from './App.vue';

// Import the SDK
import * as BSV from '@bsv/sdk';

const app = createApp(App);

// Here you can add BSV SDK to Vue's global properties for easy access in components
app.config.globalProperties.$bsv = BSV;

app.mount('#app');
```

Update your `main.ts` to use this new setup:

```typescript
// src/main.ts

import './bsvPlugin';
```

## Step 4: Using the BSV SDK in Your Components

Now that you have the BSV SDK integrated into your Vue application, you can start using it in your components. Here's an example of how to create and sign a transaction within a Vue component:

1. **Create a new Vue component** `TransactionComponent.vue` in your `src/components` directory.
2. **Implement the BSV SDK logic** within your component:

```vue
<template>
  <div>
    <h1>Create and Sign a Transaction</h1>
    <!-- Transaction form and submission button will go here -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TransactionComponent',
  methods: {
    async createAndSignTransaction() {
        // Access the BSV SDK from the global properties
        const BSV = this.$bsv;
        const privKey = BSV.PrivateKey.fromWif('L5EY1SbTvvPNSdCYQe1EJHfXCBBT4PmnF6CDbzCm9iifZptUvDGB')
        const sourceTransaction = BSV.Transaction.fromHex('...') // your source transaction goes here

        const version = 1
        const input = {
            sourceTransaction,
            sourceOutputIndex: 0,
            unlockingScriptTemplate: new BSV.P2PKH().unlock(privKey),
        }
        const output = {
            lockingScript: new BSV.P2PKH().lock(privKey.toPublicKey().toHash()),
            change: true
        }

        const tx = new BSV.Transaction(version, [input], [output])
        await tx.fee()
        await tx.sign()

        // grab your api key from https://console.taal.com
        const apiKey = 'mainnet_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // replace
        await tx.broadcast(new BSV.ARC('https://api.taal.com/arc', apiKey))
    }
  }
});
</script>
```

With the BSV SDK now part of your Vue application, you can extend the functionality as needed to interact with the BSV Blockchain. Use the SDK's comprehensive API to create transactions, manage keys, verify signatures, and much more.
