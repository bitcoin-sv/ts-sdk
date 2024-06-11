# CHANGELOG for `@bsv/sdk`

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Table of Contents

- [Unreleased](#unreleased)
- [1.1.5 - 2024-05-10](#115---2024-05-10)
- [1.1.4 - 2024-05-10](#114---2024-05-10)
- [1.1.0 - 2024-05-06](#110---2024-05-06)
- [1.0.0 - 2024-02-10](#100---2024-02-10)

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

---


## [1.1.5] - 2024-05-10
### Added
- Allow Fees in historic transaction to be validated against a FeeModel.

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