# Example: Verifying a BEEF Structure

The BSV SDK comes with advanced capabilities around the SPV architecture. In Bitcoin, SPV refers to the process of creating, exchanging, and verifying transactions in a way that anchors them to the blockchain. One of the standard formats for representing the necessary SPV data is known as BEEF (background-evaluated extended format), representing a transaction and its parents together with needed merkle proofs. This example will show you how to verify the legitimacy of a BEEF-formatted SPV structure you've received, checking to ensure the target transaction and its ancestors are well-anchored to the blockchain based on the current chain of block headers. First we'll unpack these concepts, then we'll dive into the code.

## Block Headers and Merkle Proofs

In Bitcoin, miners create blocks. These blocks comprise merkle trees of the included transactions. The root of the merkle tree, together with other useful information, is collected together into a block header that can be used to verify the block's proof-of-work. This merkle tree structure enables anyone to keep track of the chain of block headers without keeping a copy of every Bitcoin transaction.

Merkle proofs are simply a way for someone to prove the existence of a given transaction within a given merkle tree, and by extension, its inclusion by the miners in a particular block of the blockchain. This becomes extremely important and useful when we think about Simplified Payment Verification (SPV).

## Simplified Payment Verification (SPV)

The process for SPV is detailed in [BRC-67](https://github.com/bitcoin-sv/BRCs/blob/master/transactions/0067.md), but the main idea is that when a sender sends a transaction, they include merkle proofs on all of the input transactions. This allows anyone with a copy of the Bitcoin block headers to check that the input transactions are included in the blockchain. Verifiers then check that all the input and output scripts correctly transfer value from one party to the next, ensuring an unbroken chain of spends. The [BEEF data structure](https://github.com/bitcoin-sv/BRCs/blob/master/transactions/0062.md) provides a compact and efficient way for people to represent the data required to perform SPV. 

## Block Headers Client

To verify BEEF structures with the BSV SDK, you'll need to provide a block headers client that, given a merkle root, will indicate to the library whether the merkle root is correct for the block that's in the active chain at the given block height.

For simplicity in this example, we are going to use a mock headers client that always indicates every merkle root as valid no matter what. However, in any real project, **you MUST always use an actual block headers client or attackers will be able to easily fool you with fraudulent transactions!**

The TypeScript BSV SDK does not ship with a block headers client, but check out this example (link to be provided once complete) for setting up Pulse.

Here is the gullible block headers client we will be using:

```typescript
const gullibleHeadersClient = {
    // DO NOT USE IN A REAL PROJECT due to security risks of accepting any merkle root as valid without verification
    isValidRootForHeight: async (merkleRoot, height) => {
      console.log({ merkleRoot, height })
      return true
    }
}
```

## Verifying a BEEF Structure

Now that you have access to a block headers client (either Pulse on a real project or the above code for a toy example), we can proceed to verifying the BEEF structure with the following code:

```typescript
import { Transaction } from '@bsv/sdk'

// Replace with the BEEF structure you'd like to check
const BEEFHex = '0100beef01fe636d0c0007021400fe507c0c7aa754cef1f7889d5fd395cf1f785dd7de98eed895dbedfe4e5bc70d1502ac4e164f5bc16746bb0868404292ac8318bbac3800e4aad13a014da427adce3e010b00bc4ff395efd11719b277694cface5aa50d085a0bb81f613f70313acd28cf4557010400574b2d9142b8d28b61d88e3b2c3f44d858411356b49a28a4643b6d1a6a092a5201030051a05fc84d531b5d250c23f4f886f6812f9fe3f402d61607f977b4ecd2701c19010000fd781529d58fc2523cf396a7f25440b409857e7e221766c57214b1d38c7b481f01010062f542f45ea3660f86c013ced80534cb5fd4c19d66c56e7e8c5d4bf2d40acc5e010100b121e91836fd7cd5102b654e9f72f3cf6fdbfd0b161c53a9c54b12c841126331020100000001cd4e4cac3c7b56920d1e7655e7e260d31f29d9a388d04910f1bbd72304a79029010000006b483045022100e75279a205a547c445719420aa3138bf14743e3f42618e5f86a19bde14bb95f7022064777d34776b05d816daf1699493fcdf2ef5a5ab1ad710d9c97bfb5b8f7cef3641210263e2dee22b1ddc5e11f6fab8bcd2378bdd19580d640501ea956ec0e786f93e76ffffffff013e660000000000001976a9146bfd5c7fbe21529d45803dbcf0c87dd3c71efbc288ac0000000001000100000001ac4e164f5bc16746bb0868404292ac8318bbac3800e4aad13a014da427adce3e000000006a47304402203a61a2e931612b4bda08d541cfb980885173b8dcf64a3471238ae7abcd368d6402204cbf24f04b9aa2256d8901f0ed97866603d2be8324c2bfb7a37bf8fc90edd5b441210263e2dee22b1ddc5e11f6fab8bcd2378bdd19580d640501ea956ec0e786f93e76ffffffff013c660000000000001976a9146bfd5c7fbe21529d45803dbcf0c87dd3c71efbc288ac0000000000'

// You can create a Transaction from BEEF hex directly
const tx = Transaction.fromHexBEEF(BEEFHex)

// This ensures the BEEF structure is legitimate
const verified = await tx.verify(gullibleHeadersClient)

// Print the results
console.log(verified)
```

The above code allows you to ensure that a given BEEF structure is valid according to the rules of SPV.