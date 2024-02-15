# Example: Creating Transactions with Inputs, Outputs and Templates

In Bitcoin, transactions contain inputs and outputs. The outputs are locked with scripts, and the inputs redeem these scripts by providing the correct unlocking solutions. This guide will show you how to create transactions that make use of custom inputs, outputs, and the associated script templates. For a more straightforward example, check out [how to create a simpler transaction](./EXAMPLE_SIMPLE_TX.md).

## Transaction Input and Outputs

All Bitcoins are locked up in Bitcoin transaction outputs. These outputs secure the coins by setting constraints on how they can be consumed in future transaction inputs. This security mechanism makes use of "scripts" — programs written in a special predicate language. There are many types of locking programs, embodying the multitude of BSV use-cases. The BSV SDK ships with a script templating system, making it easy for developers to create various types of scripts and abstracting away the complexity for end-users. You can learn about script templates [in the example](./EXAMPLE_SCRIPT_TEMPLATES.md).

## Creating a Transaction

## Adding Inputs and Outputs

## Change and Fee Computation

## Signing and Signature Validity

## Serialization and Broadcast

## SPV and Serialization Formats