# Opcodes and Their Functionality Within Bitcoin Script

## Introduction
BSV is underpinned by a powerful scripting language that plays a crucial role in securing transactions. This language, which defines the conditions under which coins can be spent, relies heavily on "opcodes" — operational codes that manipulate and evaluate data. This document aims to demystify the functionality of these opcodes, providing examples of their use.

## Securing Coins with Script Predicates
Scripts secure coins through predicates. A predicate is essentially a condition that must be met for coins to be spent. In Bitcoin, these conditions are defined using a scripting language that determines how and when the coins can be transferred. The scripts ensure that only the rightful owner of the coins can spend them by satisfying the conditions laid down in the script attached to each coin or output.

## Script Execution Environment: Stacks and Scripts
Bitcoin's scripting system operates in a stack-based execution environment. This means that the script processes data using two primary structures:
- **Main stack:** Where most operations are performed.
- **Alt stack:** Used occasionally to provide additional stack flexibility.

Scripts in Bitcoin are divided into two parts:
1. **Unlocking script:** Provided by the spender of the coins, this script supplies the data needed to satisfy the conditions of the locking script.
2. **Locking script:** Placed by the recipient in a transaction output, this script sets the conditions under which the coins can be spent.

The execution begins with the unlocking script, which places data on the stack. Following this, the locking script is appended and continues to operate on the same stack. The spend is considered valid if, at the end of execution, the top of the stack holds a "true" value (non-zero).

## Understanding Opcodes
Opcodes are the operational codes used within a script to perform specific functions on the data in the stacks. Each opcode manipulates stack data to perform operations such as addition, subtraction, logical comparisons, cryptographic hashes, signature checks, and more. After executing an opcode, the results are pushed back onto the stack, altering its state for subsequent operations.

### Examples of Common Opcodes
- **OP_ADD:** Pops the top two items off the stack, adds them, and pushes the result back onto the stack.
- **OP_EQUAL:** Pops the top two items, compares them, and pushes `1` (true) if they are equal, or `0` (false) otherwise.
- **OP_HASH256:** Pops the top item, computes its double SHA-256 hash, and pushes the result back onto the stack.
- **OP_CHECKSIG:** Pops a public key and a signature from the stack and checks if the signature is valid for the given public key and wider transaction; pushes `1` if the signature is valid.

These opcodes are foundational for enabling complex scripting capabilities in BSV, allowing for the creation of various types of transactions including multi-signature wallets, escrow arrangements, sCrypt smart contracts, and much more.

## Combining Opcodes to Secure Coins
The true power of scripting comes from the combination of opcodes to form complex predicates. These predicates secure the coins by requiring that certain conditions be met before the coins can be spent. For example, a script might require that a transaction be signed by multiple parties (multi-signature), or that a certain amount of time elapse before the coins can be spent (timelocks).

### Implementing Cryptographic Primitives
Opcodes also implement various cryptographic primitives such as digital signatures and hashing. These primitives are essential for maintaining the security and integrity of transactions on the blockchain. For instance, the `OP_CHECKSIG` opcode is crucial for verifying that a transaction is authorized by the holder of the private keys associated with the coins being spent.

## Conclusion
By understanding the functionality of opcodes within the Bitcoin scripting language, users and developers can appreciate the flexibility and security that Bitcoin scripts provide. You can check out [this example](../examples/EXAMPLE_VERIFYING_SPENDS.md) of how to validate spends within the BSV SDK.
