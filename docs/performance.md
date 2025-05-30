# Performance Benchmarks

The following benchmarks exercise the `Reader` and `Writer` utilities on the `fix-mem` branch.
Each scenario serializes data with `Writer`, deserializes with `Reader` and measures the total
execution time using `process.hrtime`.

| Case | Description | Time (ms) |
|------|-------------|----------|
| Large payloads | Three 2&nbsp;MB payloads written and read | 156.91 |
| Small payloads | 3000 writes of a 100&nbsp;byte payload | 3.64 |
| Medium payloads | One hundred 64&nbsp;KB payloads | 110.75 |
| Mixed payloads | 1000 mixed integer operations | 7.76 |

The benchmark can be run with:

```bash
npm run build
node benchmarks/reader-writer.benchmark.js
```

Results may vary slightly between runs but provide a baseline for future optimisations.
