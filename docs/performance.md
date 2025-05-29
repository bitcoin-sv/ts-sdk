# BigNumber Benchmarks

The `benchmarks/bignumber-bench.js` script measures heavy operations on extremely large numbers using Node.js `performance` hooks. The script accepts command line arguments for digit count and iteration counts.

Baseline results on the initial implementation:

```
$ node benchmarks/bignumber-bench.js
mul large numbers: 81.81ms
add large numbers: 3995.99ms
```

After optimising multiplication to reduce internal allocations:

```
$ node benchmarks/bignumber-bench.js
mul large numbers: 74.89ms
add large numbers: 4015.07ms
```

Numbers represent total wall clock time to run the inner loops of each benchmark.

### 200k digit multiplication

Running the benchmark with `200000` digits (`node benchmarks/bignumber-bench.js 200000 1 1`) produced the following results before the latest optimisations:

```
mul large numbers: 2103.61ms
add large numbers: 209.73ms
```

After updating the internal length bookkeeping and avoiding repeated initialisation work the same benchmark now reports:

```
mul large numbers: 9.78ms
add large numbers: 2.29ms
```

### Serialization with 200k digits

Benchmarking the script number serializers on 200,000-digit values using `node benchmarks/serialization-bench.js 200000 1` produced the following baseline results prior to optimisation:

```
toSm big: 1386.31ms
toSm little: 1320.55ms
fromSm big: 1060.76ms
fromSm little: 1066.45ms
fromScriptNum: 1055.22ms
```

After rewriting the serializers to rely on direct hex conversion and minimal checks the same benchmark now reports:

```
toSm big: 7.53ms
toSm little: 11.38ms
fromSm big: 12.87ms
fromSm little: 8.24ms
fromScriptNum: 37.18ms
```
