// NOTE: Enum values must not exceed the UInt8 range (0–255)
enum calls {
  createAction = 1,
  signAction = 2,
  abortAction = 3,
  listActions = 4,
  internalizeAction = 5,
  listOutputs = 6,
  relinquishOutput = 7,
  getPublicKey = 8,
  revealCounterpartyKeyLinkage = 9,
  revealSpecificKeyLinkage = 10,
  encrypt = 11,
  decrypt = 12,
  createHmac = 13,
  verifyHmac = 14,
  createSignature = 15,
  verifySignature = 16,
  acquireCertificate = 17,
  listCertificates = 18,
  proveCertificate = 19,
  relinquishCertificate = 20,
  discoverByIdentityKey = 21,
  discoverByAttributes = 22,
  isAuthenticated = 23,
  waitForAuthentication = 24,
  getHeight = 25,
  getHeaderForHeight = 26,
  getNetwork = 27,
  getVersion = 28,
}

export default calls
export type CallType = keyof typeof calls
