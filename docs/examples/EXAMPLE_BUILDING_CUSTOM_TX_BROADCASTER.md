# Example: Building a Custom Transaction Broadcast Client

This guide walks through the necessary steps for building a custom transaction broadcast client.

## Overview

A transaction broadcast client is a crucial component in any Bitcoin SV application, allowing it to communicate with the Bitcoin SV network. Implementing a transaction broadcaster can be accomplished using the clearly defined Broadcast interface.

Our task will be to create a broadcaster that connects with the What's on Chain service. This broadcaster is particularly designed for browser applications and utilizes the standard Fetch API for HTTP communications with the relevant API endpoints.

## Getting Started

In order to build a compliant broadcast client, we first need to import the interfaces to implement.

```ts
import { Transaction, BroadcastResponse, BroadcastFailure, Broadcaster } from '@bsv/sdk'
```

Next, we create a new class that implements the Broadcaster interface which requires a broadcast function. 

We will be implementing a What's on Chain (WOC) broadcaster that runs in a browser context and uses [window.fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to send a POST request to the WOC broadcast API endpoint.

```ts
import { Transaction } from '@bsv/sdk'
import type { Broadcaster } from '@bsv/sdk/src/transaction/Broadcaster'

/**
 * Represents an WOC transaction broadcaster.
 */
export default class WOC implements Broadcaster {
  network: 'main' | 'test'
  URL: string

  /**
   * Constructs an instance of the WOC broadcaster.
   *
   * @param {string} network - which network to use (testnet or mainnet)
   */
  constructor(network: 'main' | 'test') {
    this.network = network
    this.URL = `https://api.whatsonchain.com/v1/bsv/${network}/tx/raw`
  }

  /**
   * Broadcasts a transaction via WOC.
   * This method will assume that window.fetch is available
   *
   * @param {Transaction} tx - The transaction to be broadcasted.
   * @returns {Promise<BroadcastResponse | BroadcastFailure>} A promise that resolves to either a success or failure response.
   */
  async broadcast(tx: Transaction): Promise<BroadcastResponse | BroadcastFailure> {
    const txhex = tx.toHex()

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txhex })
    }

    try {
      let data: any = {}

      // Use fetch in a browser environment
      const response = await window.fetch(`${this.URL}`, requestOptions)
      data = await response.json()

      if (data.txid as boolean || response.ok as boolean || response.status === 200) {
        return {
          status: 'success',
          txid: data?.txid,
          message: data?.messages
        }
      }
    } catch (e) {
      // TODO: Implement error handling as needed
    }
  }
}
```

Now, you can make use of this broadcast client when sending transactions with the `.broadcast()` method:

```typescript
await exampleTX.broadcast(new WOC('main'))
```

The result will be one of the SDK's standard `BroadcastResponse` or `BroadcastFailure` types, indicating the status of your transaction.
