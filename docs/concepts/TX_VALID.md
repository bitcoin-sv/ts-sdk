# How are Bitcoin Transactions Validated?

Understanding the intricacies of Bitcoin transaction validation is crucial for developers building systems that receive and process them within the ecosystem. This document will delve into the foundational concepts surrounding Bitcoin transactions, peer-to-peer exchange, and Simplified Payment Verification (SPV), as well as the critical validation processes that underpin the BSV network's scaling model.

## Introduction

Bitcoin transactions are the lifeblood of the network, enabling the transfer of value between participants without the need for central intermediaries. Each transaction on the Bitcoin SV blockchain is verified through a series of cryptographic checks and balances that ensure its authenticity and compliance with network rules.

### Key Concepts

- **Transactions:** These are data structures that encode the transfer of value between participants in the network.
- **Peer-to-Peer Exchange:** Direct interaction between participants' wallets without the need for a central authority, in which transactions and associated merkle proofs are sent back and forth.
- **SPV (Simplified Payment Verification):** A method for validating transactions that does not require downloading the entire blockchain, facilitating more scalable applications.

## The Transaction Validation Process

Validating a Bitcoin transaction involves several critical steps that confirm its legitimacy and adherence to the rules set by the network. Here's a breakdown of the validation process:

1. **Script Execution:**
   - Each input in a transaction has an unlocking script that must successfully execute and validate against the locking script of the output it is spending.
   - The result of this script execution must be true, indicating that the conditions to spend the output are met.

2. **Transaction Outputs vs. Inputs:**
   - The total value of outputs must not exceed the total value of inputs, ensuring that no new money is created out of thin air, except for the coinbase transaction, which includes the block reward.
   - Check that the transaction includes enough fee to be included in a block, as miners prioritize transactions with higher fees.

3. **Merkle Path Verifications:**
   - Each input must be traceable back to a transaction included in a block, verified through a Merkle path.
   - This ensures that each input used is legitimate and recognized by the network as having been previously confirmed.

4. **Checking Locktime and Sequence:**
   - Transactions may include locktime and sequence numbers that impose conditions on the earliest time or block height at which a transaction can be added to the blockchain.
   - Proper handling of these parameters ensures that transactions are processed in a timely and orderly manner.

You can check out an example using the TypeScript SDK where a transaction is verified according to these rules [here](../examples/EXAMPLE_VERIFYING_BEEF.md).