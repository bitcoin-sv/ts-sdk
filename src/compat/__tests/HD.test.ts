import HD from '../../../dist/cjs/src/compat/HD'
import { fromBase58Check, toArray, toHex } from '../../../dist/cjs/src/primitives/utils'

describe('HD', () => {
  it('should satisfy these basic API features', () => {
    expect(HD.fromRandom().toString().slice(0, 4)).toEqual('xprv')
    expect(HD.fromRandom().toPublic().toString().slice(0, 4)).toEqual('xpub')
  })

  // test vectors: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
  const vector1master = '000102030405060708090a0b0c0d0e0f'
  const vector1mPublic =
        'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8'
  const vector1mPrivate =
        'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi'
  const vector1m0hPublic =
        'xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LHhwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw'
  const vector1m0hPrivate =
        'xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7'
  const vector1m0h1Public =
        'xpub6ASuArnXKPbfEwhqN6e3mwBcDTgzisQN1wXN9BJcM47sSikHjJf3UFHKkNAWbWMiGj7Wf5uMash7SyYq527Hqck2AxYysAA7xmALppuCkwQ'
  const vector1m0h1Private =
        'xprv9wTYmMFdV23N2TdNG573QoEsfRrWKQgWeibmLntzniatZvR9BmLnvSxqu53Kw1UmYPxLgboyZQaXwTCg8MSY3H2EU4pWcQDnRnrVA1xe8fs'
  const vector1m0h12hPublic =
        'xpub6D4BDPcP2GT577Vvch3R8wDkScZWzQzMMUm3PWbmWvVJrZwQY4VUNgqFJPMM3No2dFDFGTsxxpG5uJh7n7epu4trkrX7x7DogT5Uv6fcLW5'
  const vector1m0h12hPrivate =
        'xprv9z4pot5VBttmtdRTWfWQmoH1taj2axGVzFqSb8C9xaxKymcFzXBDptWmT7FwuEzG3ryjH4ktypQSAewRiNMjANTtpgP4mLTj34bhnZX7UiM'
  const vector1m0h12h2Public =
        'xpub6FHa3pjLCk84BayeJxFW2SP4XRrFd1JYnxeLeU8EqN3vDfZmbqBqaGJAyiLjTAwm6ZLRQUMv1ZACTj37sR62cfN7fe5JnJ7dh8zL4fiyLHV'
  const vector1m0h12h2Private =
        'xprvA2JDeKCSNNZky6uBCviVfJSKyQ1mDYahRjijr5idH2WwLsEd4Hsb2Tyh8RfQMuPh7f7RtyzTtdrbdqqsunu5Mm3wDvUAKRHSC34sJ7in334'
  const vector1m0h12h21000000000Public =
        'xpub6H1LXWLaKsWFhvm6RVpEL9P4KfRZSW7abD2ttkWP3SSQvnyA8FSVqNTEcYFgJS2UaFcxupHiYkro49S8yGasTvXEYBVPamhGW6cFJodrTHy'
  const vector1m0h12h21000000000Private =
        'xprvA41z7zogVVwxVSgdKUHDy1SKmdb533PjDz7J6N6mV6uS3ze1ai8FHa8kmHScGpWmj4WggLyQjgPie1rFSruoUihUZREPSL39UNdE3BBDu76'
  const vector2master =
        'fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542'
  const vector2mPublic =
        'xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB'
  const vector2mPrivate =
        'xprv9s21ZrQH143K31xYSDQpPDxsXRTUcvj2iNHm5NUtrGiGG5e2DtALGdso3pGz6ssrdK4PFmM8NSpSBHNqPqm55Qn3LqFtT2emdEXVYsCzC2U'
  const vector2m0Public =
        'xpub69H7F5d8KSRgmmdJg2KhpAK8SR3DjMwAdkxj3ZuxV27CprR9LgpeyGmXUbC6wb7ERfvrnKZjXoUmmDznezpbZb7ap6r1D3tgFxHmwMkQTPH'
  const vector2m0Private =
        'xprv9vHkqa6EV4sPZHYqZznhT2NPtPCjKuDKGY38FBWLvgaDx45zo9WQRUT3dKYnjwih2yJD9mkrocEZXo1ex8G81dwSM1fwqWpWkeS3v86pgKt'
  const vector2m02147483647hPublic =
        'xpub6ASAVgeehLbnwdqV6UKMHVzgqAG8Gr6riv3Fxxpj8ksbH9ebxaEyBLZ85ySDhKiLDBrQSARLq1uNRts8RuJiHjaDMBU4Zn9h8LZNnBC5y4a'
  const vector2m02147483647hPrivate =
        'xprv9wSp6B7kry3Vj9m1zSnLvN3xH8RdsPP1Mh7fAaR7aRLcQMKTR2vidYEeEg2mUCTAwCd6vnxVrcjfy2kRgVsFawNzmjuHc2YmYRmagcEPdU9'
  const vector2m02147483647h1Public =
        'xpub6DF8uhdarytz3FWdA8TvFSvvAh8dP3283MY7p2V4SeE2wyWmG5mg5EwVvmdMVCQcoNJxGoWaU9DCWh89LojfZ537wTfunKau47EL2dhHKon'
  const vector2m02147483647h1Private =
        'xprv9zFnWC6h2cLgpmSA46vutJzBcfJ8yaJGg8cX1e5StJh45BBciYTRXSd25UEPVuesF9yog62tGAQtHjXajPPdbRCHuWS6T8XA2ECKADdw4Ef'
  const vector2m02147483647h12147483646hPublic =
        'xpub6ERApfZwUNrhLCkDtcHTcxd75RbzS1ed54G1LkBUHQVHQKqhMkhgbmJbZRkrgZw4koxb5JaHWkY4ALHY2grBGRjaDMzQLcgJvLJuZZvRcEL'
  const vector2m02147483647h12147483646hPrivate =
        'xprvA1RpRA33e1JQ7ifknakTFpgNXPmW2YvmhqLQYMmrj4xJXXWYpDPS3xz7iAxn8L39njGVyuoseXzU6rcxFLJ8HFsTjSyQbLYnMpCqE2VbFWc'
  const vector2m02147483647h12147483646h2Public =
        'xpub6FnCn6nSzZAw5Tw7cgR9bi15UV96gLZhjDstkXXxvCLsUXBGXPdSnLFbdpq8p9HmGsApME5hQTZ3emM2rnY5agb9rXpVGyy3bdW6EEgAtqt'
  const vector2m02147483647h12147483646h2Private =
        'xprvA2nrNbFZABcdryreWet9Ea4LvTJcGsqrMzxHx98MMrotbir7yrKCEXw7nadnHM8Dq38EGfSh6dqA9QWTyefMLEcBYJUuekgW4BYPJcr9E7j'

  it('should make a new a bip32', () => {
    let bip32
    bip32 = new HD()
    expect(bip32).toBeDefined()
    expect(HD.fromString(vector1mPrivate).toString()).toEqual(vector1mPrivate)
    expect(HD.fromString(HD.fromString(vector1mPrivate).toString())
      .toString())
      .toEqual(vector1mPrivate)
  })

  it('should initialize test vector 1 from the extended public key', () => {
    const bip32 = HD.fromString(vector1mPublic)
    expect(bip32).toBeDefined()
  })

  it('should initialize test vector 1 from the extended private key', () => {
    const bip32 = HD.fromString(vector1mPrivate)
    expect(bip32).toBeDefined()
  })

  it('should get the extended public key from the extended private key for test vector 1', () => {
    const bip32 = HD.fromString(vector1mPrivate)
    expect(bip32.toPublic().toString()).toEqual(vector1mPublic)
  })

  it("should get m/0' ext. private key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'")
    expect(child).toBeDefined()
    expect(child.toString()).toEqual(vector1m0hPrivate)
  })

  it("should get m/0' ext. public key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'")
    expect(child).toBeDefined()
    expect(child.toPublic().toString()).toEqual(vector1m0hPublic)
  })

  it("should get m/0'/1 ext. private key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'/1")
    expect(child).toBeDefined()
    expect(child.toString()).toEqual(vector1m0h1Private)
  })

  it("should get m/0'/1 ext. public key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'/1")
    expect(child).toBeDefined()
    expect(child.toPublic().toString()).toEqual(vector1m0h1Public)
  })

  it("should get m/0'/1 ext. public key from m/0' public key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'")
    const childPub = HD.fromString(child.toPublic().toString())
    const child2 = childPub.derive('m/1')
    expect(child2).toBeDefined()
    expect(child2.toPublic().toString()).toEqual(vector1m0h1Public)
  })

  it("should get m/0'/1/2h ext. private key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'/1/2'")
    expect(child).toBeDefined()
    expect(child.toString()).toEqual(vector1m0h12hPrivate)
  })

  it("should get m/0'/1/2h ext. public key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'/1/2'")
    expect(child).toBeDefined()
    expect(child.toPublic().toString()).toEqual(vector1m0h12hPublic)
  })

  it("should get m/0'/1/2h/2 ext. private key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'/1/2'/2")
    expect(child).toBeDefined()
    expect(child.toString()).toEqual(vector1m0h12h2Private)
  })

  it("should get m/0'/1/2'/2 ext. public key from m/0'/1/2' public key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'/1/2'")
    const childPub = HD.fromString(child.toPublic().toString())
    const child2 = childPub.derive('m/2')
    expect(child2).toBeDefined()
    expect(child2.toPublic().toString()).toEqual(vector1m0h12h2Public)
  })

  it("should get m/0'/1/2h/2 ext. public key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'/1/2'/2")
    expect(child).toBeDefined()
    expect(child.toPublic().toString()).toEqual(vector1m0h12h2Public)
  })

  it("should get m/0'/1/2h/2/1000000000 ext. private key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'/1/2'/2/1000000000")
    expect(child).toBeDefined()
    expect(child.toString()).toEqual(vector1m0h12h21000000000Private)
  })

  it("should get m/0'/1/2h/2/1000000000 ext. public key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'/1/2'/2/1000000000")
    expect(child).toBeDefined()
    expect(child.toPublic().toString()).toEqual(vector1m0h12h21000000000Public)
  })

  it("should get m/0'/1/2'/2/1000000000 ext. public key from m/0'/1/2'/2 public key from test vector 1", () => {
    const bip32 = HD.fromString(vector1mPrivate)
    const child = bip32.derive("m/0'/1/2'/2")
    const childPub = HD.fromString(child.toPublic().toString())
    const child2 = childPub.derive('m/1000000000')
    expect(child2).toBeDefined()
    expect(child2.toPublic().toString()).toEqual(vector1m0h12h21000000000Public)
  })

  it('should initialize test vector 2 from the extended public key', () => {
    const bip32 = HD.fromString(vector2mPublic)
    expect(bip32).toBeDefined()
  })

  it('should initialize test vector 2 from the extended private key', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    expect(bip32).toBeDefined()
  })

  it('should get the extended public key from the extended private key for test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    expect(bip32.toPublic().toString()).toEqual(vector2mPublic)
  })

  it('should get m/0 ext. private key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive('m/0')
    expect(child).toBeDefined()
    expect(child.toString()).toEqual(vector2m0Private)
  })

  it('should get m/0 ext. public key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive('m/0')
    expect(child).toBeDefined()
    expect(child.toPublic().toString()).toEqual(vector2m0Public)
  })

  it('should get m/0 ext. public key from m public key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive('m')
    const childPub = HD.fromString(child.toPublic().toString())
    const child2 = childPub.derive('m/0')
    expect(child2).toBeDefined()
    expect(child2.toPublic().toString()).toEqual(vector2m0Public)
  })

  it('should get m/0/2147483647h ext. private key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive("m/0/2147483647'")
    expect(child).toBeDefined()
    expect(child.toString()).toEqual(vector2m02147483647hPrivate)
  })

  it('should get m/0/2147483647h ext. public key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive("m/0/2147483647'")
    expect(child).toBeDefined()
    expect(child.toPublic().toString()).toEqual(vector2m02147483647hPublic)
  })

  it('should get m/0/2147483647h/1 ext. private key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive("m/0/2147483647'/1")
    expect(child).toBeDefined()
    expect(child.toString()).toEqual(vector2m02147483647h1Private)
  })

  it('should get m/0/2147483647h/1 ext. public key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive("m/0/2147483647'/1")
    expect(child).toBeDefined()
    expect(child.toPublic().toString()).toEqual(vector2m02147483647h1Public)
  })

  it('should get m/0/2147483647h/1 ext. public key from m/0/2147483647h public key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive("m/0/2147483647'")
    const childPub = HD.fromString(child.toPublic().toString())
    const child2 = childPub.derive('m/1')
    expect(child2).toBeDefined()
    expect(child2.toPublic().toString()).toEqual(vector2m02147483647h1Public)
  })

  it('should get m/0/2147483647h/1/2147483646h ext. private key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive("m/0/2147483647'/1/2147483646'")
    expect(child).toBeDefined()
    expect(child.toString()).toEqual(vector2m02147483647h12147483646hPrivate)
  })

  it('should get m/0/2147483647h/1/2147483646h ext. public key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive("m/0/2147483647'/1/2147483646'")
    expect(child).toBeDefined()
    expect(child.toPublic().toString()).toEqual(vector2m02147483647h12147483646hPublic)
  })

  it('should get m/0/2147483647h/1/2147483646h/2 ext. private key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive("m/0/2147483647'/1/2147483646'/2")
    expect(child).toBeDefined()
    expect(child.toString()).toEqual(vector2m02147483647h12147483646h2Private)
  })

  it('should get m/0/2147483647h/1/2147483646h/2 ext. public key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive("m/0/2147483647'/1/2147483646'/2")
    expect(child).toBeDefined()
    expect(child.toPublic().toString()).toEqual(vector2m02147483647h12147483646h2Public)
  })

  it('should get m/0/2147483647h/1/2147483646h/2 ext. public key from m/0/2147483647h/2147483646h public key from test vector 2', () => {
    const bip32 = HD.fromString(vector2mPrivate)
    const child = bip32.derive("m/0/2147483647'/1/2147483646'")
    const childPub = HD.fromString(child.toPublic().toString())
    const child2 = childPub.derive('m/2')
    expect(child2).toBeDefined()
    expect(child2.toPublic().toString()).toEqual(vector2m02147483647h12147483646h2Public)
  })

  describe('#fromRandom', () => {
    it('should not return the same one twice', () => {
      const bip32a = HD.fromRandom()
      const bip32b = HD.fromRandom()
      expect(bip32a.toString()).not.toEqual(bip32b.toString())
    })
  })

  describe('@fromRandom', () => {
    it('should not return the same one twice', () => {
      const bip32a = HD.fromRandom()
      const bip32b = HD.fromRandom()
      expect(bip32a.toString()).not.toEqual(bip32b.toString())
    })
  })

  describe('#fromSeed', () => {
    it('should initialize a new Bip32 correctly from test vector 1 seed', () => {
      const hex = vector1master
      const bip32 = HD.fromSeed(toArray(hex, 'hex'))
      expect(bip32).toBeDefined()
      expect(bip32.toString()).toEqual(vector1mPrivate)
      expect(bip32.toPublic().toString()).toEqual(vector1mPublic)
    })

    it('should initialize a new Bip32 correctly from test vector 2 seed', () => {
      const hex = vector2master
      const bip32 = HD.fromSeed(toArray(hex, 'hex'))
      expect(bip32).toBeDefined()
      expect(bip32.toString()).toEqual(vector2mPrivate)
      expect(bip32.toPublic().toString()).toEqual(vector2mPublic)
    })
  })

  describe('@fromSeed', () => {
    it('should initialize a new Bip32 correctly from test vector 1 seed', () => {
      const hex = vector1master
      const bip32 = HD.fromSeed(toArray(hex, 'hex'))
      expect(bip32).toBeDefined()
      expect(bip32.toString()).toEqual(vector1mPrivate)
      expect(bip32.toPublic().toString()).toEqual(vector1mPublic)
    })

    it('should initialize a new Bip32 correctly from test vector 2 seed', () => {
      const hex = vector2master
      const bip32 = HD.fromSeed(toArray(hex, 'hex'))
      expect(bip32).toBeDefined()
      expect(bip32.toString()).toEqual(vector2mPrivate)
      expect(bip32.toPublic().toString()).toEqual(vector2mPublic)
    })
  })

  describe('#fromBinary', () => {
    it('should make a bip32 from binary', () => {
      const str =
                'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi'
      const buf = fromBase58Check(str)
      let bip32 = HD.fromBinary([...buf.prefix, ...buf.data])
      expect(bip32).toBeDefined()
      expect(bip32.toString()).toEqual(str)
      bip32 = bip32.toPublic()
      const xpub = bip32.toString()
      bip32 = HD.fromBinary(bip32.toBinary())
      expect(bip32.toString()).toEqual(xpub)
    })
  })

  describe('#toBinary', () => {
    it('should return a bip32 buffer', () => {
      const str =
                'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi'
      const buf = fromBase58Check(str)
      const bip32 = HD.fromString(str)
      expect(toHex(bip32.toBinary())).toEqual(toHex([...buf.prefix, ...buf.data]))
    })
  })

  describe('#fromString', () => {
    it('should make a bip32 from a string', () => {
      const str =
                'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi'
      const bip32 = HD.fromString(str)
      expect(bip32).toBeDefined()
      expect(bip32.toString()).toEqual(str)
    })
  })

  describe('#toString', () => {
    const bip32 = new HD()
    bip32.fromRandom()
    it('should return an xprv string', () => {
      expect(bip32.toString().slice(0, 4)).toEqual('xprv')
    })

    it('should return an xpub string', () => {
      expect(bip32.toPublic().toString().slice(0, 4)).toEqual('xpub')
    })
  })

  describe('#isPrivate', () => {
    it('should know if this bip32 is private', () => {
      const bip32priv = HD.fromRandom()
      const bip32pub = bip32priv.toPublic()
      expect(bip32priv.isPrivate()).toEqual(true)
      expect(bip32pub.isPrivate()).toEqual(false)
    })
  })
})
