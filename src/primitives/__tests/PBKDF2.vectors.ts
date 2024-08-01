export default [{
  key: 'password',
  salt: 'salt',
  iterations: 1,
  dkLen: 32,
  results: {
    sha512: '867f70cf1ade02cff3752599a3a53dc4af34c7a669815ae5d513554e1c8cf252'
  }
},
{
  key: 'password',
  salt: 'salt',
  iterations: 2,
  dkLen: 32,
  results: {
    sha512: 'e1d9c16aa681708a45f5c7c4e215ceb66e011a2e9f0040713f18aefdb866d53c'
  }
},
{
  key: 'password',
  salt: 'salt',
  iterations: 1,
  dkLen: 64,
  results: {
    sha512: '867f70cf1ade02cff3752599a3a53dc4af34c7a669815ae5d513554e1c8cf252c02d470a285a0501bad999bfe943c08f050235d7d68b1da55e63f73b60a57fce'
  }
},
{
  key: 'password',
  salt: 'salt',
  iterations: 2,
  dkLen: 64,
  results: {
    sha512: 'e1d9c16aa681708a45f5c7c4e215ceb66e011a2e9f0040713f18aefdb866d53cf76cab2868a39b9f7840edce4fef5a82be67335c77a6068e04112754f27ccf4e'
  }
},
{
  key: 'password',
  salt: 'salt',
  iterations: 4096,
  dkLen: 32,
  results: {
    sha512: 'd197b1b33db0143e018b12f3d1d1479e6cdebdcc97c5c0f87f6902e072f457b5'
  }
},
{
  key: 'passwordPASSWORDpassword',
  salt: 'saltSALTsaltSALTsaltSALTsaltSALTsalt',
  iterations: 4096,
  dkLen: 40,
  results: {
    sha512: '8c0511f4c6e597c6ac6315d8f0362e225f3c501495ba23b868c005174dc4ee71115b59f9e60cd953'
  }
},
{
  key: 'pass\u00000word',
  salt: 'sa\u00000lt',
  iterations: 4096,
  dkLen: 16,
  results: {
    sha512: '336d14366099e8aac2c46c94a8f178d2'
  }
},
{
  keyHex: '63ffeeddccbbaa',
  salt: 'salt',
  iterations: 1,
  dkLen: 32,
  results: {
    sha512: 'f69de451247225a7b30cc47632899572bb980f500d7c606ac9b1c04f928a3488'
  }
},
{
  description: 'Unicode salt, no truncation due to hex',
  key: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  saltHex: '6d6e656d6f6e6963e383a1e383bce38388e383abe382abe38299e3838fe38299e382a6e38299e382a1e381afe3829ae381afe38299e3818fe38299e3829de38299e381a1e381a1e38299e58d81e4babae58d81e889b2',
  iterations: 2048,
  dkLen: 64,
  results: {
    sha512: 'ba553eedefe76e67e2602dc20184c564010859faada929a090dd2c57aacb204ceefd15404ab50ef3e8dbeae5195aeae64b0def4d2eead1cdc728a33ced520ffd'
  }
},
{
  key: 'password',
  salt: 'salt',
  iterations: 1,
  dkLen: 10,
  results: {
    sha512: '867f70cf1ade02cff375'
  }
},
{
  key: 'password',
  salt: 'salt',
  iterations: 1,
  dkLen: 100,
  results: {
    sha512: '867f70cf1ade02cff3752599a3a53dc4af34c7a669815ae5d513554e1c8cf252c02d470a285a0501bad999bfe943c08f050235d7d68b1da55e63f73b60a57fce7b532e206c2967d4c7d2ffa460539fc4d4e5eec70125d74c6c7cf86d25284f297907fcea'
  }
},
{
  keyUint8Array: [112, 97, 115, 115, 119, 111, 114, 100],
  salt: 'salt',
  iterations: 1,
  dkLen: 32,
  results: {
    sha512: '867f70cf1ade02cff3752599a3a53dc4af34c7a669815ae5d513554e1c8cf252'
  }
},
{
  key: 'password',
  saltUint8Array: [115, 97, 108, 116],
  iterations: 1,
  dkLen: 32,
  results: {
    sha512: '867f70cf1ade02cff3752599a3a53dc4af34c7a669815ae5d513554e1c8cf252'
  }
}
]
