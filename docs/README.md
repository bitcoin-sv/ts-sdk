# TypeScript Library API Documentation

The documentation is split into various pages, each covering a set of related functionality. The pages are as follows:

- [Primitives](./primitives.md) — Covers public and private keys, key derivation, digital signaturs, symmetric keys, and low-level operations
- [Script](./script.md) — Covers Bitcoin scripts, the templating system, serialization, and the Spend class (script interpreter)
- [Transaction](./transaction.md) — Covers transaction construction, signing, broadcasters, fee models, merkle proofs, and SPV structures like BUMP
- [Messages](./messages.md) — Covers generalizable message signing, verification, encryption and decryption
- [TOTP](./totp.md) - Covers Time-based One Time Password, useful for validating counterparties across unsecured mediums.
- [Wallet](./wallet.md) - Covers the Wallet interface for communication between applications and wallets using a standard interface.
- [Wallet Substrates](./wallet-substrates.md) - Covers the Wallet Substrates which facilitate communication between apps and wallets.
- [Overlay Tools](./overlay-tools.md) - Covers the use of Overlays for broadcast of transactions based on topics, as well as distributed lookup of tokens.
- [Auth](./auth.md) - Mutual Authentication and Service Monetization Framework
- [Storage](./storage.md) — Covers a UHRP client for storing and retrieving data from distributed data storage services by hash.
- [Compat](./compat.md) — Covers deprecated functionality for legacy systems like BIP32 and ECIES

## Swagger

[BRC-100](https://brc.dev/100) defines a Unified, Vendor-Neutral, Unchanging, and Open BSV Blockchain Standard Wallet-to-Application Interface which is implemented in this library within the WalletClient class. The API is laid out here as a swagger openapi document to offer a fast-track to understanding the interface which is implemented across multiple substrates. The JSON api is generally considered a developer friendly introduction to the WalletClient, where an binary equivalent ABI may be preferred for production use cases.

- [Wallet JSON API Swagger](./swagger)
