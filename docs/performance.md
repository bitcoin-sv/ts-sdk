# BigNumber Benchmarks

The benchmark scripts measure extremely large number operations and script number serialization performance.

All results below were gathered on Node.js v22.16.0 using the `dist` build of the SDK. Each benchmark was executed with 200,000-digit inputs to stress the implementation.

## Addition and Multiplication

Command:

```bash
node benchmarks/bignumber-bench.js 200000 1 1
```

| Branch | mul large numbers | add large numbers |
| --- | --- | --- |
| master (pre-May-2025) | 6364.11ms | 13.04ms |
| fix-mem (May-2025) | 13.60ms | 2.64ms |

## Serialization

Command:

```bash
node benchmarks/serialization-bench.js 200000 1
```

| Branch | toSm big | toSm little | fromSm big | fromSm little | fromScriptNum |
| --- | --- | --- | --- | --- | --- |
| master (pre-May-2025) | 6.12ms | 10.11ms | 6.35ms | 12.56ms | 3.39ms |
| fix-mem (May-2025) | 8.46ms | 8.12ms | 27.77ms | 11.16ms | 10.31ms |
