# CHANGELOG for `@bsv/sdk`

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Table of Contents

- [CHANGELOG for `@bsv/sdk`](#changelog-for-bsvsdk)
  - [Table of Contents](#table-of-contents)
  - [\[Unreleased\]](#unreleased)
    - [Added](#added)      
    - [Changed](#changed)
    - [Deprecated](#deprecated)
    - [Removed](#removed)
    - [Fixed](#fixed)
    - [Security](#security)
  - [\[1.2.13\]](#1213---2024-12-13)
    - [Added](#1213-added)
    - [Fixed](#1213-fixed)
  - [\[1.2.12\]](#1212---2024-12-12)
    - [Fixed](#1212-fixed)
  - [\[1.2.11\]](#1211---2024-12-10)
    - [Fixed](#1211-fixed)
  - [\[1.2.10\]](#1210)
    - [Added](#added-1)
    - [Fixed](#fixed-1)
    - [Security](#security-1)
  - [\[1.2.9\] - 2024-12-06](#129---2024-12-06)
    - [\[1.2.9\] Added](#129-added)
  - [\[1.2.8\] - 2024-12-02](#128---2024-12-02)
    - [\[1.2.8\] Fixed](#128-fixed)
  - [\[1.2.7\] - 2024-12-02](#127---2024-12-02)
    - [\[1.2.7\] Added](#127-added)
    - [\[1.2.7\] Fixed](#127-fixed)
  - [\[1.2.6\] - 2024-11-30](#126---2024-11-30)
    - [\[1.2.6\] Fixed](#126-fixed)
  - [\[1.2.5\] - 2024-11-30](#125---2024-11-30)
    - [\[1.2.5\] Added](#125-added)
  - [\[1.2.4\] - 2024-11-29](#124---2024-11-29)
    - [\[1.2.4\] Added](#124-added)
  - [\[1.2.3\] - 2024-11-26](#123---2024-11-26)
    - [\[1.2.3\] Added](#123-added)
  - [\[1.2.2\] - 2024-11-26](#122---2024-11-26)
    - [\[1.2.2\] Added](#122-added)
  - [\[1.2.1\] - 2024-11-25](#121---2024-11-25)
    - [\[1.2.1\] Added](#121-added)
  - [\[1.2.0\] - 2024-11-25](#120---2024-11-25)
    - [\[1.2.0\] Added](#120-added)
  - [\[1.1.33\] - 2024-11-22](#1133---2024-11-22)
    - [Added](#added-2)
    - [Fixed](#fixed-2)
  - [\[1.1.32\] - 2024-11-22](#1132---2024-11-22)
    - [Added](#added-3)
    - [Fixed](#fixed-3)
    - [Removed](#removed-1)
  - [\[1.1.30\] - 2024-11-02](#1130---2024-11-02)
    - [Added](#added-4)
    - [Changed](#changed-1)
  - [\[1.1.29\] - 2024-10-23](#1129---2024-10-23)
    - [Fixed](#fixed-4)
  - [\[1.1.28\] - 2024-10-23](#1128---2024-10-23)
    - [Added](#added-5)
  - [\[1.1.26\] - 2024-10-22](#1126---2024-10-22)
    - [Added](#added-6)
  - [\[1.1.25\] - 2024-10-21](#1125---2024-10-21)
    - [Added](#added-7)
  - [\[1.1.24\] - 2024-10-04](#1124---2024-10-04)
    - [Fixed](#fixed-5)
  - [\[1.1.22\] - 2024-09-02](#1122---2024-09-02)
    - [Added](#added-8)
  - [\[1.1.21\] - 2024-09-02](#1121---2024-09-02)
    - [Added](#added-9)
    - [Changed](#changed-2)
  - [\[1.1.17\] - 2024-08-21](#1117---2024-08-21)
    - [Added](#added-10)
  - [\[1.1.14\] - 2024-07-30](#1114---2024-07-30)
    - [Added](#added-11)
  - [\[1.1.13\] - 2024-07-19](#1113---2024-07-19)
    - [Fixed](#fixed-6)
  - [\[1.1.10\] - 2024-06-28](#1110---2024-06-28)
    - [Fixed](#fixed-7)
  - [\[1.1.8\] - 2024-06-19](#118---2024-06-19)
    - [Added](#added-12)
  - [\[1.1.6\] - 2024-06-12](#116---2024-06-12)
    - [Added](#added-13)
  - [\[1.1.5\] - 2024-06-11](#115---2024-06-11)
    - [Fixed](#fixed-8)
  - [\[1.1.4\] - 2024-05-10](#114---2024-05-10)
    - [Added](#added-14)
    - [Changed](#changed-3)
  - [\[1.1.0\] - 2024-05-06](#110---2024-05-06)
    - [Added](#added-15)
    - [Removed](#removed-2)
    - [Fixed](#fixed-9)
    - [New Contributors](#new-contributors)
  - [\[1.0.0\] - 2024-02-10](#100---2024-02-10)
    - [Added](#added-16)
    - [Template for New Releases:](#template-for-new-releases)

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

---
## [1.2.13] - 2024-12-13

### [1.2.13] Added
- JSON HTTP substrate, with corresponding swagger-ui documentation.
- Example args and responses to the swagger-ui

### [1.2.13] Fixed
- PrivateKey test linter errors

---

## [1.2.13] - 2024-12-13
### [1.2.13] Fixed

- Fixed MerklePath constructor to allow for null initialisation.

## [1.2.12] - 2024-12-12
### [1.2.12] Fixed

- Added optional broadcastMany to Broadcaster interface.

## [1.2.11] - 2024-12-10
### [1.2.11] Fixed

- Added a fix to ensure PrivateKeys as hex are always 64 chars in length ensuring 256 bit keys.

## [1.2.10]

### Added

Beef makeTxidOnly

### Fixed

Beef sortTx fix for partially valid and txidOnly data.

### Security

---

## [1.2.9] - 2024-12-06

### [1.2.9] Added

- Added support for returning coinsRemoved in an overlay Submitted Transaction Execution AcKnowledgment (STEAK) message.

---

## [1.2.8] - 2024-12-02

### [1.2.8] Fixed

- Stop people inadvertently creating corrupted public keys.

---

## [1.2.7] - 2024-12-02

### [1.2.7] Added

- Define the security level of protocolIDs as a type so that we can attach a JSDoc explaining what each value means.

### [1.2.7] Fixed

- Use a default value in the async fee() function when no args are used rather than requiring a value and then setting if undefined.

---

## [1.2.6] - 2024-11-30

### [1.2.6] Fixed
- revealSpecificKeyLinkage requires a counterparty. 
- ProtoWallet now correctly implements the wallet interface.

---
## [1.2.5] - 2024-11-30

### [1.2.5] Added
- Testnet capabilities & config override for node to function without error to defaultBroadcaster
- broadcastMany function to ARCBroadcaster

---

## [1.2.4] - 2024-11-29

### [1.2.4] Added
- A "random" distributioun mode for change allocation which approximates Benford's Law in attempt to distribute the remainder of: (inputSats - knownOutputSats - txFee) across the outputs marked "change: true".

---

## [1.2.3] - 2024-11-26

### [1.2.3] Added
- Added support for Overlay broadcast and lookup timeouts.
---

## [1.2.2] - 2024-11-26

### [1.2.2] Added
- Updated the default ShipBroadcast config, tests, and docs.

---

## [1.2.1] - 2024-11-25

### [1.2.1] Added
- [NPM package provenance](https://github.blog/security/supply-chain-security/introducing-npm-package-provenance/) support

---

## [1.2.0] - 2024-11-25

### [1.2.0] Added
- Implement BRC-100 wallet interface
- Add PushDrop token template
- SHIP and SLAP overlay tooling including broadcaster and lookup

---

## [1.1.33] - 2024-11-22

### Added

Beef.toBinaryAtomic(txid: string) to serialize Beef with AtomicBEEF header.

### Fixed

Transaction.fromAtomicBEEF

1. Test for all required dependencies was ignoring BUMP hashes.
2. Test for unused transactions required additional fix.

---

## [1.1.32] - 2024-11-22

### Added

1. allowPartial optional argument to Transaction toBEEF and toAtomicBEEF to avoid errors on missing sourceTransactions.
2. findBump, findTransactionForSigning, findAtomicTransaction to Beef class.
3. mergeBeefFromParty to BeefParty
4. isValid to BeefTx, used by new sortTx.
5. Add serialized AtomicBEEF deserialization to Beef class.
6. Add atomicTxid property to Beef class.

### Fixed

1. sortTxs of Beef class fixed to handle incompletely valid data, order now matches spec for isValid true BEEF.

### Removed

1. degree property from BeefTx class, was used only by original sortTxs algorithm.

---

## [1.1.30] - 2024-11-02
### Added
- Feature - Schorr class which allows ZKP creation and verification. BRC-94 and BRC-100 related.

### Changed
- electrumEncrypt correctly allows fromPrivateKey to be omitted

## [1.1.29] - 2024-10-23
### Fixed
- ECIES ElectrumDecrypt counterparty decryption bug

## [1.1.28] - 2024-10-23
### Added
- UMD support added for use in non-standard environments.

## [1.1.26] - 2024-10-22
### Added
- Atomic BEEF serializer and deserializer for `Transaction` class
- Ability to select a TXID from a BEEF when construction a `Transaction.fromBEEF()`

## [1.1.25] - 2024-10-21
### Added
- `Beef`, `BeefTx`, and `BeefParty` classes

## [1.1.24] - 2024-10-04
### Fixed
- Addressed #125
- Optimized SPV verification

## [1.1.22] - 2024-09-02
### Added
- Base64 mode support for BSM

## [1.1.21] - 2024-09-02
### Added
- Broadcaster types have been updated to better align with Arc
- Added some convenience functions for toDER and fromDER on the point and pubkey classes where missing.
### Changed
- In the PublicKey class pubkey.toDER() to defaults to return a number[] rather than string. If a string is desired .toString() or .toDER('hex') have equivalent functionality.

## [1.1.17] - 2024-08-21
### Added
Transaction static fromReader method is now public.

## [1.1.14] - 2024-07-30
### Added
Ability to split a private key into shares using Shamir's Secret Sharing Scheme. Use like this:
```javascript
const key = PrivateKey.fromRandom()
const recovery = key.split(2, 5)
const sameKey = PrivateKey.fromShares(recovery.shares, recovery.threshold)
```

## [1.1.13] - 2024-07-19
### Fixed
Transaction SPV verification now correctly returns true for "scripts only" verification when a merkle proof is found.

## [1.1.10] - 2024-06-28
### Fixed
ARC Broadcaster correctly parses status -> code, details -> description. Adds optional txid and more to error response if provided.

## [1.1.8] - 2024-06-19
### Added
TOTP class which allows the generation of time based pass codes. Use varies but originally included for validating shared secrets between remote counterparties over a secure channel.

## [1.1.6] - 2024-06-12
### Added
- Allow Fees in historic transaction to be validated against a FeeModel.

## [1.1.5] - 2024-06-11
### Fixed
- Unnecessary `Buffer.from` in pbkdf2 function has been removed.

## [1.1.4] - 2024-05-10
### Added
- MerklePath trim function which removes data if it can be calculated. Backported from go-sdk by tonesnotes. Only affects compound Merkle paths which are not yet widely used.

### Changed
- The corresponding error messages associated with invalid MerklePaths which no longer check empty levels if they are above level 0.

## [1.1.0] - 2024-05-06

### Added
- Ability to create TransactionInputs from a utxo, creating a partial sourceTransaction. 
Use is like so:
```javascript
const input = fromUtxo({
    txid: '434555433eaca96dff6e71a4d02febd0dd3832e5ca4e5734623ca914522e17d5',
    vout: 0,
    script: '76a914d01b0b702ee90e00944342f97c772a8be83e42a288ac',
    satoshis: 1234
}, new P2PKH().unlock(key))

tx.addInput(input)
```
- Ability to create a transaction from Extended Format bytes or hex. The result being a partial sourceTransaction in each input.
```javascript
const tx = Transaction.fromHexEF('020000000000000000ef01b2faffe1e1d3c88f4092f34646c060ea2b6a93acc3010484c747ed4c051c2555080000006a4730440220392bcec91f190ce38db9bf53d03886ab63d9bd24fcf7174e8a8df21d23382ba7022038f20c1f3f6583951d01af0be30612a6c0b46d949b4aae60f42644ce513f3e55412103ea0ff49ec6fbb9cbc942d9c1fce9c04e12a91c1209b239466e0a29147da55db1ffffffff01f45500000000001976a914de337957f543c8d1fad2cfff0b57bb5b4264d91788ac0390010000000000001976a9144d255baa50a14bef4cce1eb8012a02768e8ffaa888acd3600000000000001976a91447e22d8011bb446cc3f606179e333f64a9b6206b88ac04915500000000001976a914d24cb016397008a85c88b1278a36434fdd4e801f88ac00000000')
```

### Removed
- Use of sourceSatoshis as a parameter of TransactionInput type.

### Fixed
* Increase default maxNumSize to MAX_SAFE_INJTEGER to resolve OP_BIN2NUM execution failures. by @tonesnotes in https://github.com/bitcoin-sv/ts-sdk/pull/20
* Docs examples by @ty-everett in https://github.com/bitcoin-sv/ts-sdk/pull/21
* Allow BigNumber constructor to accept a BigNumber. by @tonesnotes in https://github.com/bitcoin-sv/ts-sdk/pull/22
* Hash enc digest hex by @tonesnotes in https://github.com/bitcoin-sv/ts-sdk/pull/27
* [feature] helper function to allow Address => Locking Script by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/24
* [chore] npm run doc by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/26
* CRITICAL FIX for BigNumber fromSm by @tonesnotes in https://github.com/bitcoin-sv/ts-sdk/pull/30
* [feature]: Block Header Service api by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/23
* Tone bug 31 by @tonesnotes in https://github.com/bitcoin-sv/ts-sdk/pull/33
* Low Level Docs by @ty-everett in https://github.com/bitcoin-sv/ts-sdk/pull/32
* push(...x) fails for large array x values by @tonesnotes in https://github.com/bitcoin-sv/ts-sdk/pull/36
* [fix] length must be that of the data, not the original argument. by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/37
* [chore] ts-standard and linter stuff by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/38
* [feature] compact sigs by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/39
* controversial stuff by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/40
* Avoid requiring sourceTransaction on inputs. by @tonesnotes in https://github.com/bitcoin-sv/ts-sdk/pull/41
* [fix] Enforce signature length in compact sigs by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/44
* Concept-level documentation by @ty-everett in https://github.com/bitcoin-sv/ts-sdk/pull/45
* refactor: add more static factory methods to HD class and use them in examples by @dorzepowski in https://github.com/bitcoin-sv/ts-sdk/pull/48
* refactor: replace returned type union with method overloading for transaction id. by @dorzepowski in https://github.com/bitcoin-sv/ts-sdk/pull/50
* [docs] HOW_TX.md review and edits. Note: A topic worth discussing is c… by @jonesjBSV in https://github.com/bitcoin-sv/ts-sdk/pull/53
* [chore] remove redundant line by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/56
* I suspect it should be this - see ts-paymail for more suggestions by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/60
* [fix] adding startsWith OP_ seems to fix the ASM parsing bug by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/58
* Add Transaction.parseScriptOffsets by @tonesnotes in https://github.com/bitcoin-sv/ts-sdk/pull/59
* [fix] Compact SIgnatures Pubkey Recovery function precision. by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/63
* feat(#65): configure ARC with custom http client by @dorzepowski in https://github.com/bitcoin-sv/ts-sdk/pull/66
* feat: default broadcaster and chain tracker by @dorzepowski in https://github.com/bitcoin-sv/ts-sdk/pull/67
* Fixed fee model by @tiagolr in https://github.com/bitcoin-sv/ts-sdk/pull/70
* toAddress() string prefix support by @tiagolr in https://github.com/bitcoin-sv/ts-sdk/pull/72
* Addional input field sourceSatoshis to be used in fee calculation by @tiagolr in https://github.com/bitcoin-sv/ts-sdk/pull/71
* Tone key length by @tonesnotes in https://github.com/bitcoin-sv/ts-sdk/pull/79
* Improve JSON content type detection by @oskarszoon in https://github.com/bitcoin-sv/ts-sdk/pull/80
* example-utxos-tx.md by @tiagolr in https://github.com/bitcoin-sv/ts-sdk/pull/75
* Allow ARC config to set CallbackURL and other headers as required by @sirdeggen in https://github.com/bitcoin-sv/ts-sdk/pull/81
* Tone overlay1 by @tonesnotes in https://github.com/bitcoin-sv/ts-sdk/pull/82

### New Contributors
* @tonesnotes made their first contribution in https://github.com/bitcoin-sv/ts-sdk/pull/20
* @dorzepowski made their first contribution in https://github.com/bitcoin-sv/ts-sdk/pull/48
* @jonesjBSV made their first contribution in https://github.com/bitcoin-sv/ts-sdk/pull/53
* @tiagolr made their first contribution in https://github.com/bitcoin-sv/ts-sdk/pull/70
* @oskarszoon made their first contribution in https://github.com/bitcoin-sv/ts-sdk/pull/80

## [1.0.0] - 2024-02-10

### Added
- Initial release of the BSV Blockchain Libraries Project SDK.
- Sound Cryptographic Primitives for key management, signature computations, and encryption protocols.
- Script Level Constructs with network-compliant script interpreter.
- Comprehensive Transaction Construction and Signing API.
- Mechanisms for Transaction Broadcast Management.
- Tools for Merkle Proof Verification and representation.
- Structures and interfaces for full Serializable SPV Structures.
- Enhanced mechanisms for Secure Encryption and Signed Messages.

---

### Template for New Releases:

Replace `X.X.X` with the new version number and `YYYY-MM-DD` with the release date:

```
## [X.X.X] - YYYY-MM-DD

### Added
- 

### Changed
- 

### Deprecated
- 

### Removed
- 

### Fixed
- 

### Security
- 
```

Use this template as the starting point for each new version. Always update the "Unreleased" section with changes as they're implemented, and then move them under the new version header when that version is released.