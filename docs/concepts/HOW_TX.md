# How are Transactions Built with Inputs and Outputs?

Transactions are one of the fundamental entities within the blockchain, acting as the mechanism through which value is transferred across the network. Understanding how transactions are built using inputs and outputs is crucial for developers, as this process encompasses the core of creating, signing, and sending transactions within applications.

## Understanding Transactions

A **transaction** in BSV is a record that transfers some outputs containing Bitcoins from one state to the next. However, unlike traditional banking systems, these transactions aren't direct debits or credits to an account. Instead, they reference outputs created by previous transactions as thrir inputs and create new outputs as future spendable coins.

### Transaction Structure

Each transaction consists of the following components:

- **Version**: Indicates the ruleset under which the transaction is validated or which overlay it belongs to.
- **Inputs**: List of references to outputs from previous transactions, showing where the bitcoins being sent were previously stored.
- **Outputs**: List of allocations of bitcoins, specifying the amount and conditions under which they can be spent in the future.
- **Lock Time**: An optional setting that specifies the earliest time or block number at which the transaction can be valid.

Transactions can also be attached to a **Merkle proof** to provide proof of inclusion in a particular block, after they have been processed.

## Inputs and Outputs

Inputs and outputs are the essential elements that make up a transaction. Understanding their structure and usage is key to mastering transaction creation and manipulation using the BSV SDK.

### Transaction Inputs

A **Transaction Input** includes the following fields:

- **Source Transaction ID**: The transaction ID (TXID) from which the input bitcoins are derived.
- **Source Output Index**: Specifies which output from the referenced transaction is to be spent.
- **Unlocking Script**: Contains signatures or other unlocking solutions that allows referenced previous output to be spent.
- **Sequence**: A number that can be used to allow transaction inputs to be updated before finalization, if it's less than 0xFFFFFFFF.

Inputs connect a new transaction back to the point in the blockchain where the bitcoins were previously recorded as outputs.

### Transaction Outputs

A **Transaction Output** consists of:

- **Satoshis**: The amount of BSV being transferred.
- **Locking Script**: Defines the conditions under which the output can be spent, such as requiring a digital signature from the recipient's public key.

Outputs transfer the ownership of satoshi commodity tokens or colloquially, coins, so their new owner can use them as inputs in future transactions.

## Constructing a Transaction

Creating a transaction involves several clear steps, utilizing inputs and outputs to dictate where bitcoins are moving from and to:

1. **Define Outputs**: Decide the amount of BSV to transfer and the conditions under which the transfer can later be spent.
2. **Select Inputs**: Identify previous transaction outputs to spend that have enough balance to cover the outputs and the transaction fee.
3. **Calculate Fees**: Estimate the necessary transaction fee based on transaction size, where you will be broadcasting, and the level of service priority you require.
4. **Generate Change**: If inputs exceed the sum of outputs and fees, create change output(s) sending the excess back to the sender without re-using keys.
5. **Unlock Inputs**: Utilize the private keys or other mechanisms associated with the inputs you're spending to unlock each one, thereby authorizing the bitcoins to be spent.
6. **Complete Unlocking**: In cases of multi-party transactions, pass the transaction around to all needed parties for unlocking.
7. **Broadcast**: Send the final signed transaction to the BSV network for inclusion in a block, and register it with overlay networks as required.

Each of these steps is facilitated by the BSV SDK, which provides comprehensive tools and templates to handle the complexities of transaction creation, from generating cryptographic signatures to managing network broadcast clients.

## Conclusion

The BSV SDK empowers developers to build robust applications on the network by abstracting the complexities of transaction creation. By understanding how transactions are structured and built through inputs and outputs, developers can leverage the full potential of the BSV blockchain, ensuring secure, efficient, and scalable applications. You can check out an example of creating transactions [in this tutorial!](../examples/EXAMPLE_COMPLEX_TX.md)
