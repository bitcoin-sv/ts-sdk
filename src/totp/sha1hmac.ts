import { Hash } from '@bsv/sdk';

/**
 * SHA1HMAC is implemented based on SHA256HMAC from @bsv/sdk.
 * TODO: Consider to move it to @bsv/sdk in the future.
 */
export class SHA1HMAC {
  inner: Hash.SHA1;
  outer: Hash.SHA1;
  blockSize = 64;

  constructor(key: number[] | string) {
    key = Hash.toArray(key, 'hex');
    // Shorten key, if needed
    if (key.length > this.blockSize) {
      key = new Hash.SHA1().update(key).digest();
    }

    // Keys shorter than block size are padded with zeros on the right
    let i;
    for (i = key.length; i < this.blockSize; i++) {
      key.push(0);
    }

    for (i = 0; i < key.length; i++) {
      key[i] ^= 0x36;
    }
    this.inner = new Hash.SHA1().update(key);

    // 0x36 ^ 0x5c = 0x6a
    for (i = 0; i < key.length; i++) {
      key[i] ^= 0x6a;
    }
    this.outer = new Hash.SHA1().update(key);
  }

  update(msg: number[] | string, enc?: 'hex'): SHA1HMAC {
    this.inner.update(msg, enc);
    return this;
  }

  digest(): number[] {
    this.outer.update(this.inner.digest());
    return this.outer.digest();
  }

  digestHex(): string {
    this.outer.update(this.inner.digest());
    return this.outer.digestHex();
  }
}
