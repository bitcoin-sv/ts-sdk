# What are Transaction Signatures?

Transaction signatures play a crucial role in securing transactions and establishing trust between parties. These digital signatures serve as a powerful tool for validating the authenticity and integrity of spends on the blockchain. This document delves into the concept of transaction signatures, breaking down their components, functionality, and significance in a way that's (hopefully) accessible to a fairly broad audience.

## Introduction to Digital Signatures

Before diving into transaction signatures, it's essential to understand the basics of digital signatures. A digital signature is akin to a fingerprint; it is a unique mark that an individual can use to sign digital documents or transactions. Just as a handwritten signature authenticates the identity of the signer and their consent to the document's terms, a digital signature ensures that a digital document or transaction is authentic and hasn't been tampered with after the signature was made.

## Components of Transaction Signatures

Transaction signatures in BSV are a special type of digital signature. They consist of several key components:

- **r and s values**: These two values constitute the core of the ECDSA (Elliptic Curve Digital Signature Algorithm) signature. They are derived from the private key of the sender and the transaction data. Together, they verify that the owner of the corresponding public key has authorized the transaction.
- **SIGHASH flags**: Transaction signatures also include SIGHASH flags, which specify how much of the transaction data is covered by the signature. These flags allow signers to control which parts of the transaction they are committing to when they sign it, and which ones might be updated later.

## Understanding SIGHASH Flags

SIGHASH flags provide flexibility in how transactions are signed, offering several options:

- **SIGHASH_ALL**: This is the default mode, where the signature covers all the inputs and outputs of the transaction. It indicates the signer's commitment to the exact details of the transaction, including the amount and script associated with each output.
- **SIGHASH_NONE**: With this flag, the signature covers all inputs but no outputs, allowing others to add or modify outputs. This could be used in scenarios where the signer is indifferent to where the funds are going.
- **SIGHASH_SINGLE**: This mode signs only one input and one output, the one with the same index as the signed input. It is useful for transactions with multiple participants, allowing each to sign only for their part.
- **SIGHASH_ANYONECANPAY**: This flag can be combined with the others and indicates that the signature covers only the current input, allowing others to add more inputs to the transaction.

## The Role of Transaction Signatures

Transaction signatures serve two primary purposes on the BSV network:

1. **Authentication**: By signing a transaction with their private key, the sender proves they hold the private keys needed by the locking script that secures the funds they're attempting to spend.
2. **Integrity**: Once a transaction is signed, any alteration to the parts that were signed would invalidate the signature. This property ensures that once a transaction is broadcasted to the network, it cannot be tampered with or altered by malicious actors.

## Conclusion

Transaction signatures are at the heart of the security and trust model of blockchain technology. They enable the secure transfer of digital assets between parties without the need for a central authority. By understanding the components and functionality of transaction signatures, users and developers can better appreciate the sophisticated mechanisms that keep the BSV network secure and trustworthy. You can learn more about how transaction signatures work within the TypeScript BSV SDK [here](../low-level/TX_SIG.md).
