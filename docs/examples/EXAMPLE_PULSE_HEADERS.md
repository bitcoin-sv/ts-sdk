# Example: Building a Pulse Block Headers Client

When [verifying BEEF structures](EXAMPLE_VERIFYING_BEEF.md), it's necessary to ensure that all transactions are well-anchored: this is to say, that they come from inputs in the honest chain. The SDK doesn't ship with a headers client, but this guide shows an example of how to use it with [Pulse](https://github.com/bitcoin-sv/block-headers-service): a popular client suitable for a wide range of use-cases.

## Pre-requisites

As stated in the README, you will need to be running a Pulse instance. Get it up and running, and configure a level of authentication appropriate for your use-case:

```sh
docker pull bsvb/block-headers-service
docker run bsvb/block-headers-service:latest
```

## Building our Client

The SDK's `ChainTracker` interface defines the required structure for our implementation, as follows:

```typescript
/**
 * The Chain Tracker is responsible for verifying the validity of a given Merkle root
 * for a specific block height within the blockchain.
 *
 * Chain Trackers ensure the integrity of the blockchain by
 * validating new headers against the chain's history. They use accumulated
 * proof-of-work and protocol adherence as metrics to assess the legitimacy of blocks.
 *
 * @interface ChainTracker
 * @function isValidRootForHeight - A method to verify the validity of a Merkle root
 *          for a given block height.
 *
 * @example
 * const chainTracker = {
 *   isValidRootForHeight: async (root, height) => {
 *     // Implementation to check if the Merkle root is valid for the specified block height.
 *   }
 * };
 */
export default interface ChainTracker {
  isValidRootForHeight: (root: string, height: number) => Promise<boolean>
}
```

Given a merkle root and block height, we return a boolean indicating whether it's valid.

We can plug in the Pulse API with appropriate HTTP handling logic as follows:

```typescript
/**
 * Represents a Pulse headers client.
 */
export default class PulseClient implements ChainTracker {
  URL: string
  apiKey: string

  /**
   * Constructs an instance of the Pulse chain tracker.
   *
   * @param {string} URL - The URL endpoint for the Pulse API.
   * @param {string} apiKey - The API key used for authorization with the Pulse API.
   */
  constructor (URL: string, apiKey: string) {
    this.URL = URL
    this.apiKey = apiKey
  }

  /**
   * Checks a merkle root for a height.
   *
   * @param {string} root - The merkle root to check.
   * @param {number} height — The height at which to check.
   * @returns {Promise<boolean>} A promise that resolves to either a success or failure response (true or false).
   */
  async isValidRootForHeight (root: String, height: number): Promise<boolean> {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      }
    }

    try {
      let response
      let data: any = {}

      if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        // Use fetch in a browser environment
        response = await window.fetch(`${this.URL}/api/v1/chain/header/byHeight?height=${height}&count=1`, requestOptions)
        data = await response.json()
      } else if (typeof require !== 'undefined') {
        // Use Node.js https module
        // eslint-disable-next-line
        const https = require('https')
        response = await this.nodeFetch(https, requestOptions)
        data = JSON.parse(response)
      } else {
        throw new Error('No method available to perform HTTP request')
      }

      if (data.txid as boolean || response.ok as boolean || response.statusCode === 200) {
        // Root must match
        return data[0].merkleRoot === root
      } else {
        return false
      }
    } catch (error) {
        // Handle error
        return false
    }
  }

  /** Helper function for Node.js HTTPS requests */
  private async nodeFetch (https, requestOptions, height): Promise<any> {
    return await new Promise((resolve, reject) => {
      const req = https.request(`${this.URL}/api/v1/chain/header/byHeight?height=${height}&count=1`, requestOptions, res => {
        let data = ''
        res.on('data', (chunk: string) => {
          data += chunk
        })
        res.on('end', () => {
          resolve(data)
        })
      })

      req.on('error', error => {
        reject(error)
      })

      if (requestOptions.body as boolean) {
        req.write(requestOptions.body)
      }
      req.end()
    })
  }
}
```

Now, we can use our `PulseClient` as a `ChainTracker` when calling the `Transaction` object's `.verify()` method. You can see an example in the [BEEF verification guide](EXAMPLE_VERIFYING_BEEF.md).

This provides the ability to ensure that a transaction is well-anchored.
