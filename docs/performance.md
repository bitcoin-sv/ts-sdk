# BigNumber Benchmarks

The `benchmarks/bignumber-bench.js` script measures a few heavy operations on extremely large numbers (20k hex digits ~80k bits) using Node.js `performance` hooks.

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
