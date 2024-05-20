# Example: Building a Pulse Block Headers Client

When [verifying BEEF structures](EXAMPLE_VERIFYING_BEEF.md), it's necessary to ensure that all transactions are well-anchored: this is to say, that they come from inputs in the honest chain. The SDK doesn't ship with a headers client, but this guide shows an example of how to use it with [block-headers-service](https://github.com/bitcoin-sv/block-headers-service): a popular client suitable for a wide range of use-cases.

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

Given an array of merkle roots and corresponding block heights, we return a boolean indicating whether they're all valid.

We can plug in the Block Header Service API with appropriate HTTP handling logic as follows:

```typescript
import {defaultHttpClient} from "@bsv/sdk";

/**
 * Represents a Block Headers Client.
 */
export default class BlockHeadersClient implements ChainTracker {
  URL: string
  apiKey: string

  /**
   * Constructs an instance of the Pulse chain tracker.
   *
   * @param {string} URL - The URL endpoint for the Pulse API.
   * @param {string} apiKey - The API key used for authorization with the Pulse API.
   */
  constructor(URL: string, apiKey: string) {
    this.URL = URL
    this.apiKey = apiKey
    this.httpClient = defaultHttpClient()
  }

  /**
   * Checks a set of merkle roots with corresponding heights.
   *
   * @param root: string - The merkle root to check
   * @param height: number - The corresponding height
   * @returns {Promise<boolean>} A promise that resolves to either a success or failure response (true or false).
   */
  async isValidRootForHeight(root: string, height: number): Promise<boolean> {
    const response = await httpsClient(`${this.URL}/api/v1/chain/merkleroot/verify`, {
      method: 'POST',
      body: [{merkleRoot: root, blockHeight: height}],
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      }
    })
    if (response.ok) {
      return response.data?.confirmationState === 'CONFIRMED'
    } else {
      throw new Error(`Failed to verify root at height ${height} with response ${response.status}`)
    }
  }
}
```

Now, we can use our `BlockHeadersClient` as a `ChainTracker` when calling the `Transaction` object's `.verify()` method. You can see an example in the [BEEF verification guide](EXAMPLE_VERIFYING_BEEF.md).

This provides the ability to ensure that a transaction is well-anchored.
