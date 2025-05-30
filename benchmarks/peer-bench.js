import { performance } from 'perf_hooks'
import { randomFillSync } from 'crypto'
// Provide browser-like crypto for Random
globalThis.self = { crypto: { getRandomValues: (arr) => randomFillSync(arr) } }
import { Peer } from '../dist/esm/src/auth/Peer.js'
import { CompletedProtoWallet } from '../dist/esm/src/auth/certificates/__tests/CompletedProtoWallet.js'
import { PrivateKey, Utils } from '../dist/esm/src/primitives/index.js'

class LocalTransport {
  peerTransport;
  onDataCallback;
  connect(peerTransport) {
    this.peerTransport = peerTransport;
    peerTransport.peerTransport = this;
  }
  async send(message) {
    if (this.peerTransport?.onDataCallback) {
      this.peerTransport.onDataCallback(message);
    } else {
      throw new Error('Peer transport is not connected or not listening for data.');
    }
  }
  async onData(callback) {
    this.onDataCallback = callback;
  }
}

async function oneExchange() {
  const walletA = new CompletedProtoWallet(PrivateKey.fromRandom());
  const walletB = new CompletedProtoWallet(PrivateKey.fromRandom());
  const transportA = new LocalTransport();
  const transportB = new LocalTransport();
  transportA.connect(transportB);

  const alice = new Peer(walletA, transportA);
  const bob = new Peer(walletB, transportB);

  const wait = new Promise(resolve => {
    bob.listenForGeneralMessages(() => resolve());
  });

  await alice.toPeer(Utils.toArray('hello'));
  await wait;
}

async function benchmark(iterations = 10) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await oneExchange();
  }
  const end = performance.now();
  console.log(`peer exchange x${iterations}: ${(end - start).toFixed(2)}ms`);
}

benchmark(Number(process.argv[2] ?? 5));
