# Wallet SDK

Primarily `interface` declarations of most abstract Wallet.interfaces related APIs.

This includes:

- Local copy of Wallet.interfaces, WalletCrypto, WalletSigner, ProtoWallet, CachedKeyDeriver to be merged back to `@bsv/ts-sdk`
- Certificate and CertOps for standardized certificate handling.
- WERR_errors.ts standard error classes.
- WalletError standard error base class.
- StorageSyncReadyer: a standard subset of WalletStorage for legacy import services.
- validationHelpers non-asynchronous Wallet.interfaces args object validation methods and interfaces. For interface details standardization and enforcement.
- `types` generic types for standardization.