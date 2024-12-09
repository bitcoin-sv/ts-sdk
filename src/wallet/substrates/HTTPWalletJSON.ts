import { Wallet, CreateActionArgs, OriginatorDomainNameStringUnder250Bytes, CreateActionResult, BooleanDefaultTrue, AcquireCertificateArgs, AcquireCertificateResult, Base64String, BasketStringUnder300Bytes, BooleanDefaultFalse, Byte, CertificateFieldNameUnder50Bytes, DescriptionString5to50Bytes, DiscoverCertificatesResult, EntityIconURLStringMax500Bytes, EntityNameStringMax100Bytes, HexString, InternalizeActionArgs, ISOTimestampString, KeyIDStringUnder800Bytes, ListActionsArgs, ListActionsResult, ListCertificatesResult, ListOutputsArgs, ListOutputsResult, OutpointString, PositiveInteger, PositiveIntegerDefault10Max10000, PositiveIntegerMax10, PositiveIntegerOrZero, ProtocolString5To400Bytes, ProveCertificateArgs, ProveCertificateResult, PubKeyHex, SecurityLevel, SignActionArgs, SignActionResult, VersionString7To30Bytes } from '../Wallet.interfaces.js'
import { Utils } from '../../primitives/index.js'
import Certificate from '../../auth/Certificate.js'

export default class HTTPWalletJSON implements Wallet {
  baseUrl: string
  httpClient: typeof fetch
  originator: OriginatorDomainNameStringUnder250Bytes | undefined
  api: (call: string, args: any) => Promise<any>

  constructor(originator: OriginatorDomainNameStringUnder250Bytes | undefined, baseUrl: string = 'http://localhost:3321', httpClient = fetch) {
    this.baseUrl = baseUrl
    this.originator = originator
    this.httpClient = httpClient
    this.api = async (call, args) => {
      try {
        const response = await (await httpClient(`${this.baseUrl}/${call}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Originator': this.originator
          },
          body: JSON.stringify(args)
        })).json()
        return response
      } catch (error) {
        console.log({ 'HTTPWalletJSON': { call, args, error }})
        throw error
      }
    }
  }

  async createAction(args: CreateActionArgs): Promise<CreateActionResult> {
    return await this.api('createAction', args)
  }

  async signAction(args: SignActionArgs): Promise<SignActionResult> {
    return await this.api('signAction', args)
  }

  async abortAction(args: { reference: Base64String }): Promise<{ aborted: true }> {
    return await this.api('abortAction', args)
  }

  async listActions(args: ListActionsArgs): Promise<ListActionsResult> {
    return await this.api('listActions', args)
  }

  async internalizeAction(args: InternalizeActionArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ accepted: true }> {
    return await this.api('internalizeAction', args)
  }

  async listOutputs(args: ListOutputsArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<ListOutputsResult> {
    // const paramWriter = new Utils.Writer()
    // const basketAsArray = Utils.toArray(args.basket, 'utf8')
    // paramWriter.writeVarIntNum(basketAsArray.length)
    // paramWriter.write(basketAsArray)
    // if (typeof args.tags === 'object') {
    //   paramWriter.writeVarIntNum(args.tags.length)
    //   for (const tag of args.tags) {
    //     const tagAsArray = Utils.toArray(tag, 'utf8')
    //     paramWriter.writeVarIntNum(tagAsArray.length)
    //     paramWriter.write(tagAsArray)
    //   }
    // } else {
    //   paramWriter.writeVarIntNum(0)
    // }
    // if (args.tagQueryMode === 'all') {
    //   paramWriter.writeInt8(1)
    // } else if (args.tagQueryMode === 'any') {
    //   paramWriter.writeInt8(2)
    // } else {
    //   paramWriter.writeInt8(-1)
    // }
    // if (args.include === 'locking scripts') {
    //   paramWriter.writeInt8(1)
    // } else if (args.include === 'entire transactions') {
    //   paramWriter.writeInt8(2)
    // } else {
    //   paramWriter.writeInt8(-1)
    // }
    // if (typeof args.includeCustomInstructions === 'boolean') {
    //   paramWriter.writeInt8(args.includeCustomInstructions ? 1 : 0)
    // } else {
    //   paramWriter.writeInt8(-1)
    // }
    // if (typeof args.includeTags === 'boolean') {
    //   paramWriter.writeInt8(args.includeTags ? 1 : 0)
    // } else {
    //   paramWriter.writeInt8(-1)
    // }
    // if (typeof args.includeLabels === 'boolean') {
    //   paramWriter.writeInt8(args.includeLabels ? 1 : 0)
    // } else {
    //   paramWriter.writeInt8(-1)
    // }
    // if (typeof args.limit === 'number') {
    //   paramWriter.writeVarIntNum(args.limit)
    // } else {
    //   paramWriter.writeVarIntNum(-1)
    // }
    // if (typeof args.offset === 'number') {
    //   paramWriter.writeVarIntNum(args.offset)
    // } else {
    //   paramWriter.writeVarIntNum(-1)
    // }

    // // Serialize seekPermission
    // paramWriter.writeInt8(typeof args.seekPermission === 'boolean' ? args.seekPermission ? 1 : 0 : -1)

    // const result = await this.transmit('listOutputs', originator, paramWriter.toArray())
    // const resultReader = new Utils.Reader(result)
    // const totalOutputs = resultReader.readVarIntNum()
    // const beefLength = resultReader.readVarIntNum()
    // let BEEF = undefined
    // if (beefLength >= 0) {
    //   BEEF = resultReader.read(beefLength)
    // }
    // const outputs: Array<{ outpoint: OutpointString, satoshis: SatoshiValue, lockingScript?: HexString, tx?: BEEF, spendable: true, customInstructions?: string, tags?: OutputTagStringUnder300Bytes[], labels?: LabelStringUnder300Bytes[] }> = []
    // for (let i = 0; i < totalOutputs; i++) {
    //   const outpoint = this.readOutpoint(resultReader)
    //   const satoshis = resultReader.readVarIntNum()
    //   const output: { outpoint: OutpointString, satoshis: SatoshiValue, lockingScript?: HexString, tx?: BEEF, spendable: true, customInstructions?: string, tags?: OutputTagStringUnder300Bytes[], labels?: LabelStringUnder300Bytes[] } = {
    //     spendable: true,
    //     outpoint,
    //     satoshis
    //   }
    //   const scriptLength = resultReader.readVarIntNum()
    //   if (scriptLength >= 0) {
    //     output.lockingScript = Utils.toHex(resultReader.read(scriptLength))
    //   }
    //   const customInstructionsLength = resultReader.readVarIntNum()
    //   if (customInstructionsLength >= 0) {
    //     output.customInstructions = Utils.toUTF8(resultReader.read(customInstructionsLength))
    //   }
    //   const tagsLength = resultReader.readVarIntNum()
    //   if (tagsLength !== -1) {
    //     const tags: OutputTagStringUnder300Bytes[] = []
    //     for (let i = 0; i < tagsLength; i++) {
    //       const tagLength = resultReader.readVarIntNum()
    //       tags.push(Utils.toUTF8(resultReader.read(tagLength)))
    //     }
    //     output.tags = tags
    //   }
    //   const labelsLength = resultReader.readVarIntNum()
    //   if (labelsLength !== -1) {
    //     const labels: LabelStringUnder300Bytes[] = []
    //     for (let i = 0; i < labelsLength; i++) {
    //       const labelLength = resultReader.readVarIntNum()
    //       labels.push(Utils.toUTF8(resultReader.read(labelLength)))
    //     }
    //     output.labels = labels
    //   }
    //   outputs.push(output)
    // }
    // return {
    //   totalOutputs,
    //   BEEF,
    //   outputs
    // }
    throw Error('not yet implemented')
  }

  async relinquishOutput(args: { basket: BasketStringUnder300Bytes, output: OutpointString }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ relinquished: true }> {
    // const paramWriter = new Utils.Writer()
    // const basketAsArray = Utils.toArray(args.basket, 'utf8')
    // paramWriter.writeVarIntNum(basketAsArray.length)
    // paramWriter.write(basketAsArray)
    // paramWriter.write(this.encodeOutpoint(args.output))
    // await this.transmit('relinquishOutput', originator, paramWriter.toArray())
    // return { relinquished: true }
    throw Error('not yet implemented')
  }

  private encodeOutpoint(outpoint: OutpointString): number[] {
    const writer = new Utils.Writer()
    const [txid, index] = outpoint.split('.')
    writer.write(Utils.toArray(txid, 'hex'))
    writer.writeVarIntNum(Number(index))
    return writer.toArray()
  }

  private readOutpoint(reader: Utils.Reader): OutpointString {
    const txid = Utils.toHex(reader.read(32))
    const index = reader.readVarIntNum()
    return `${txid}.${index}`
  }

  async getPublicKey(args: { seekPermission?: BooleanDefaultTrue, identityKey?: true, protocolID?: [SecurityLevel, ProtocolString5To400Bytes], keyID?: KeyIDStringUnder800Bytes, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', forSelf?: BooleanDefaultFalse }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ publicKey: PubKeyHex }> {
    return await this.api('getPublicKey', args)
  }

  async revealCounterpartyKeyLinkage(args: { counterparty: PubKeyHex, verifier: PubKeyHex, privilegedReason?: DescriptionString5to50Bytes, privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ prover: PubKeyHex, verifier: PubKeyHex, counterparty: PubKeyHex, revelationTime: ISOTimestampString, encryptedLinkage: Byte[], encryptedLinkageProof: number[] }> {
    // const paramWriter = new Utils.Writer()
    // paramWriter.write(this.encodePrivilegedParams(args.privileged, args.privilegedReason))
    // paramWriter.write(Utils.toArray(args.counterparty, 'hex'))
    // paramWriter.write(Utils.toArray(args.verifier, 'hex'))
    // const result = await this.transmit('revealCounterpartyKeyLinkage', originator, paramWriter.toArray())
    // const resultReader = new Utils.Reader(result)
    // const prover = Utils.toHex(resultReader.read(33))
    // const verifier = Utils.toHex(resultReader.read(33))
    // const counterparty = Utils.toHex(resultReader.read(33))
    // const revelationTimeLength = resultReader.readVarIntNum()
    // const revelationTime = Utils.toUTF8(resultReader.read(revelationTimeLength))
    // const encryptedLinkageLength = resultReader.readVarIntNum()
    // const encryptedLinkage = resultReader.read(encryptedLinkageLength)
    // const encryptedLinkageProofLength = resultReader.readVarIntNum()
    // const encryptedLinkageProof = resultReader.read(encryptedLinkageProofLength)
    // return {
    //   prover,
    //   verifier,
    //   counterparty,
    //   revelationTime,
    //   encryptedLinkage,
    //   encryptedLinkageProof
    // }
    throw Error('not yet implemented')
  }

  async revealSpecificKeyLinkage(args: { counterparty: PubKeyHex, verifier: PubKeyHex, protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ prover: PubKeyHex, verifier: PubKeyHex, counterparty: PubKeyHex, protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, encryptedLinkage: Byte[], encryptedLinkageProof: Byte[], proofType: Byte }> {
    // const paramWriter = new Utils.Writer()
    // paramWriter.write(this.encodeKeyRelatedParams(args.protocolID, args.keyID, args.counterparty, args.privileged, args.privilegedReason))
    // paramWriter.write(Utils.toArray(args.verifier, 'hex'))
    // const result = await this.transmit('revealSpecificKeyLinkage', originator, paramWriter.toArray())
    // const resultReader = new Utils.Reader(result)
    // const prover = Utils.toHex(resultReader.read(33))
    // const verifier = Utils.toHex(resultReader.read(33))
    // const counterparty = Utils.toHex(resultReader.read(33))
    // const securityLevel = resultReader.readUInt8()
    // const protocolLength = resultReader.readVarIntNum()
    // const protocol = Utils.toUTF8(resultReader.read(protocolLength))
    // const keyIDLength = resultReader.readVarIntNum()
    // const keyID = Utils.toUTF8(resultReader.read(keyIDLength))
    // const encryptedLinkageLength = resultReader.readVarIntNum()
    // const encryptedLinkage = resultReader.read(encryptedLinkageLength)
    // const encryptedLinkageProofLength = resultReader.readVarIntNum()
    // const encryptedLinkageProof = resultReader.read(encryptedLinkageProofLength)
    // const proofType = resultReader.readUInt8()
    // return {
    //   prover,
    //   verifier,
    //   counterparty,
    //   protocolID: [securityLevel as SecurityLevel, protocol],
    //   keyID,
    //   encryptedLinkage,
    //   encryptedLinkageProof,
    //   proofType
    // }
    throw Error('not yet implemented')
  }

  async encrypt(args: { seekPermission?: BooleanDefaultTrue, plaintext: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ ciphertext: Byte[] }> {
    // const paramWriter = new Utils.Writer()
    // paramWriter.write(this.encodeKeyRelatedParams(args.protocolID, args.keyID, args.counterparty, args.privileged, args.privilegedReason))
    // paramWriter.writeVarIntNum(args.plaintext.length)
    // paramWriter.write(args.plaintext)
    // // Serialize seekPermission
    // paramWriter.writeInt8(typeof args.seekPermission === 'boolean' ? args.seekPermission ? 1 : 0 : -1)
    // return {
    //   ciphertext: await this.transmit('encrypt', originator, paramWriter.toArray())
    // }
    throw Error('not yet implemented')
  }

  async decrypt(args: { seekPermission?: BooleanDefaultTrue, ciphertext: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ plaintext: Byte[] }> {
    // const paramWriter = new Utils.Writer()
    // paramWriter.write(this.encodeKeyRelatedParams(args.protocolID, args.keyID, args.counterparty, args.privileged, args.privilegedReason))
    // paramWriter.writeVarIntNum(args.ciphertext.length)
    // paramWriter.write(args.ciphertext)
    // // Serialize seekPermission
    // paramWriter.writeInt8(typeof args.seekPermission === 'boolean' ? args.seekPermission ? 1 : 0 : -1)
    // return {
    //   plaintext: await this.transmit('decrypt', originator, paramWriter.toArray())
    // }
    throw Error('not yet implemented')
  }

  async createHmac(args: { seekPermission?: BooleanDefaultTrue, data: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ hmac: Byte[] }> {
    // const paramWriter = new Utils.Writer()
    // paramWriter.write(this.encodeKeyRelatedParams(args.protocolID, args.keyID, args.counterparty, args.privileged, args.privilegedReason))
    // paramWriter.writeVarIntNum(args.data.length)
    // paramWriter.write(args.data)
    // // Serialize seekPermission
    // paramWriter.writeInt8(typeof args.seekPermission === 'boolean' ? args.seekPermission ? 1 : 0 : -1)
    // return {
    //   hmac: await this.transmit('createHmac', originator, paramWriter.toArray())
    // }
    throw Error('not yet implemented')
  }

  async verifyHmac(args: { seekPermission?: BooleanDefaultTrue, data: Byte[], hmac: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ valid: true }> {
    // const paramWriter = new Utils.Writer()
    // paramWriter.write(this.encodeKeyRelatedParams(args.protocolID, args.keyID, args.counterparty, args.privileged, args.privilegedReason))
    // paramWriter.write(args.hmac)
    // paramWriter.writeVarIntNum(args.data.length)
    // paramWriter.write(args.data)
    // // Serialize seekPermission
    // paramWriter.writeInt8(typeof args.seekPermission === 'boolean' ? args.seekPermission ? 1 : 0 : -1)
    // await this.transmit('verifyHmac', originator, paramWriter.toArray())
    // return { valid: true }
    throw Error('not yet implemented')
  }

  async createSignature(args: { seekPermission?: BooleanDefaultTrue, data?: Byte[], hashToDirectlySign?: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ signature: Byte[] }> {
    // const paramWriter = new Utils.Writer()
    // paramWriter.write(this.encodeKeyRelatedParams(args.protocolID, args.keyID, args.counterparty, args.privileged, args.privilegedReason))
    // if (typeof args.data === 'object') {
    //   paramWriter.writeUInt8(1)
    //   paramWriter.writeVarIntNum(args.data.length)
    //   paramWriter.write(args.data)
    // } else {
    //   paramWriter.writeUInt8(2)
    //   paramWriter.write(args.hashToDirectlySign)
    // }
    // // Serialize seekPermission
    // paramWriter.writeInt8(typeof args.seekPermission === 'boolean' ? args.seekPermission ? 1 : 0 : -1)
    // return {
    //   signature: await this.transmit('createSignature', originator, paramWriter.toArray())
    // }
    throw Error('not yet implemented')
  }

  async verifySignature(args: { seekPermission?: BooleanDefaultTrue, data?: Byte[], hashToDirectlyVerify?: Byte[], signature: Byte[], protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, privilegedReason?: DescriptionString5to50Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', forSelf?: BooleanDefaultFalse, privileged?: BooleanDefaultFalse }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ valid: true }> {
    // const paramWriter = new Utils.Writer()
    // paramWriter.write(this.encodeKeyRelatedParams(args.protocolID, args.keyID, args.counterparty, args.privileged, args.privilegedReason))
    // if (typeof args.forSelf === 'boolean') {
    //   paramWriter.writeInt8(args.forSelf ? 1 : 0)
    // } else {
    //   paramWriter.writeInt8(-1)
    // }
    // paramWriter.writeVarIntNum(args.signature.length)
    // paramWriter.write(args.signature)
    // if (typeof args.data === 'object') {
    //   paramWriter.writeUInt8(1)
    //   paramWriter.writeVarIntNum(args.data.length)
    //   paramWriter.write(args.data)
    // } else {
    //   paramWriter.writeUInt8(2)
    //   paramWriter.write(args.hashToDirectlyVerify)
    // }
    // // Serialize seekPermission
    // paramWriter.writeInt8(typeof args.seekPermission === 'boolean' ? args.seekPermission ? 1 : 0 : -1)
    // await this.transmit('verifySignature', originator, paramWriter.toArray())
    // return { valid: true }
    throw Error('not yet implemented')
  }

  private encodeKeyRelatedParams(protocolID: [SecurityLevel, ProtocolString5To400Bytes], keyID: KeyIDStringUnder800Bytes, counterparty?: PubKeyHex | 'self' | 'anyone', privileged?: boolean, privilegedReason?: string): number[] {
    // const paramWriter = new Utils.Writer()
    // paramWriter.writeUInt8(protocolID[0])
    // const protocolAsArray = Utils.toArray(protocolID[1], 'utf8')
    // paramWriter.writeVarIntNum(protocolAsArray.length)
    // paramWriter.write(protocolAsArray)
    // const keyIDAsArray = Utils.toArray(keyID, 'utf8')
    // paramWriter.writeVarIntNum(keyIDAsArray.length)
    // paramWriter.write(keyIDAsArray)
    // if (typeof counterparty !== 'string') {
    //   paramWriter.writeUInt8(0)
    // } else if (counterparty === 'self') {
    //   paramWriter.writeUInt8(11)
    // } else if (counterparty === 'anyone') {
    //   paramWriter.writeUInt8(12)
    // } else {
    //   paramWriter.write(Utils.toArray(counterparty, 'hex'))
    // }
    // paramWriter.write(this.encodePrivilegedParams(privileged, privilegedReason))
    // return paramWriter.toArray()
    throw Error('not yet implemented')
  }

  async acquireCertificate(
    args: AcquireCertificateArgs,
    originator?: OriginatorDomainNameStringUnder250Bytes
  ): Promise<AcquireCertificateResult> {
    // const paramWriter = new Utils.Writer()
    // paramWriter.write(Utils.toArray(args.type, 'base64'))
    // paramWriter.write(Utils.toArray(args.certifier, 'hex'))

    // const fieldEntries = Object.entries(args.fields)
    // paramWriter.writeVarIntNum(fieldEntries.length)
    // for (const [key, value] of fieldEntries) {
    //   const keyAsArray = Utils.toArray(key, 'utf8')
    //   const valueAsArray = Utils.toArray(value, 'utf8')

    //   paramWriter.writeVarIntNum(keyAsArray.length)
    //   paramWriter.write(keyAsArray)

    //   paramWriter.writeVarIntNum(valueAsArray.length)
    //   paramWriter.write(valueAsArray)
    // }

    // paramWriter.write(this.encodePrivilegedParams(args.privileged, args.privilegedReason))
    // paramWriter.writeUInt8(args.acquisitionProtocol === 'direct' ? 1 : 2)

    // if (args.acquisitionProtocol === 'direct') {
    //   paramWriter.write(Utils.toArray(args.serialNumber, 'base64'))
    //   paramWriter.write(this.encodeOutpoint(args.revocationOutpoint))
    //   const signatureAsArray = Utils.toArray(args.signature, 'hex')
    //   paramWriter.writeVarIntNum(signatureAsArray.length)
    //   paramWriter.write(signatureAsArray)

    //   const keyringRevealerAsArray = args.keyringRevealer !== 'certifier'
    //     ? Utils.toArray(args.keyringRevealer, 'hex')
    //     : [11]
    //   paramWriter.write(keyringRevealerAsArray)

    //   const keyringKeys = Object.keys(args.keyringForSubject)
    //   paramWriter.writeVarIntNum(keyringKeys.length)
    //   for (let i = 0; i < keyringKeys.length; i++) {
    //     const keyringKeysAsArray = Utils.toArray(keyringKeys[i], 'utf8')
    //     paramWriter.writeVarIntNum(keyringKeysAsArray.length)
    //     paramWriter.write(keyringKeysAsArray)
    //     const keyringForSubjectAsArray = Utils.toArray(args.keyringForSubject[keyringKeys[i]], 'base64')
    //     paramWriter.writeVarIntNum(keyringForSubjectAsArray.length)
    //     paramWriter.write(keyringForSubjectAsArray)
    //   }
    // } else {
    //   const certifierUrlAsArray = Utils.toArray(args.certifierUrl, 'utf8')
    //   paramWriter.writeVarIntNum(certifierUrlAsArray.length)
    //   paramWriter.write(certifierUrlAsArray)
    // }

    // const result = await this.transmit('acquireCertificate', originator, paramWriter.toArray())
    // const cert = Certificate.fromBin(result)
    // return {
    //   ...cert,
    //   signature: cert.signature as string
    // }
    throw Error('not yet implemented')
  }

  private encodePrivilegedParams(privileged?: boolean, privilegedReason?: string): number[] {
    const paramWriter = new Utils.Writer()
    if (typeof privileged === 'boolean') {
      paramWriter.writeInt8(privileged ? 1 : 0)
    } else {
      paramWriter.writeInt8(-1)
    }
    if (typeof privilegedReason === 'string') {
      const privilegedReasonAsArray = Utils.toArray(privilegedReason, 'utf8')
      paramWriter.writeInt8(privilegedReasonAsArray.length)
      paramWriter.write(privilegedReasonAsArray)
    } else {
      paramWriter.writeInt8(-1)
    }
    return paramWriter.toArray()
  }

  async listCertificates(args: { certifiers: PubKeyHex[], types: Base64String[], limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero, privileged?: BooleanDefaultFalse, privilegedReason?: DescriptionString5to50Bytes }): Promise<ListCertificatesResult> {
    // const paramWriter = new Utils.Writer()
    // paramWriter.writeVarIntNum(args.certifiers.length)
    // for (let i = 0; i < args.certifiers.length; i++) {
    //   paramWriter.write(Utils.toArray(args.certifiers[i], 'hex'))
    // }

    // paramWriter.writeVarIntNum(args.types.length)
    // for (let i = 0; i < args.types.length; i++) {
    //   paramWriter.write(Utils.toArray(args.types[i], 'base64'))
    // }
    // if (typeof args.limit === 'number') {
    //   paramWriter.writeVarIntNum(args.limit)
    // } else {
    //   paramWriter.writeVarIntNum(-1)
    // }
    // if (typeof args.offset === 'number') {
    //   paramWriter.writeVarIntNum(args.offset)
    // } else {
    //   paramWriter.writeVarIntNum(-1)
    // }
    // paramWriter.write(this.encodePrivilegedParams(args.privileged, args.privilegedReason))
    // const result = await this.transmit('listCertificates', originator, paramWriter.toArray())
    // const resultReader = new Utils.Reader(result)
    // const totalCertificates = resultReader.readVarIntNum()
    // const certificates: Array<{
    //   type: Base64String
    //   subject: PubKeyHex
    //   serialNumber: Base64String
    //   certifier: PubKeyHex
    //   revocationOutpoint: OutpointString
    //   signature: HexString
    //   fields: Record<CertificateFieldNameUnder50Bytes, Base64String>
    // }> = []
    // for (let i = 0; i < totalCertificates; i++) {
    //   const certificateLength = resultReader.readVarIntNum()
    //   const certificateBin = resultReader.read(certificateLength)
    //   const cert = Certificate.fromBin(certificateBin)
    //   certificates.push({
    //     ...cert,
    //     signature: cert.signature as string
    //   })
    // }
    // return {
    //   totalCertificates,
    //   certificates
    // }
    return await this.api('listCertificates', args)
  }

  async proveCertificate(args: ProveCertificateArgs, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<ProveCertificateResult> {
    // const paramWriter = new Utils.Writer()
    // const typeAsArray = Utils.toArray(args.certificate.type, 'base64')
    // paramWriter.write(typeAsArray)
    // const subjectAsArray = Utils.toArray(args.certificate.subject, 'hex')
    // paramWriter.write(subjectAsArray)
    // const serialNumberAsArray = Utils.toArray(args.certificate.serialNumber, 'base64')
    // paramWriter.write(serialNumberAsArray)
    // const certifierAsArray = Utils.toArray(args.certificate.certifier, 'hex')
    // paramWriter.write(certifierAsArray)
    // const revocationOutpointAsArray = this.encodeOutpoint(args.certificate.revocationOutpoint)
    // paramWriter.write(revocationOutpointAsArray)
    // const signatureAsArray = Utils.toArray(args.certificate.signature, 'hex')
    // paramWriter.writeVarIntNum(signatureAsArray.length)
    // paramWriter.write(signatureAsArray)
    // const fieldEntries = Object.entries(args.certificate.fields)
    // paramWriter.writeVarIntNum(fieldEntries.length)
    // for (const [key, value] of fieldEntries) {
    //   const keyAsArray = Utils.toArray(key, 'utf8')
    //   const valueAsArray = Utils.toArray(value, 'utf8')
    //   paramWriter.writeVarIntNum(keyAsArray.length)
    //   paramWriter.write(keyAsArray)
    //   paramWriter.writeVarIntNum(valueAsArray.length)
    //   paramWriter.write(valueAsArray)
    // }
    // paramWriter.writeVarIntNum(args.fieldsToReveal.length)
    // for (const field of args.fieldsToReveal) {
    //   const fieldAsArray = Utils.toArray(field, 'utf8')
    //   paramWriter.writeVarIntNum(fieldAsArray.length)
    //   paramWriter.write(fieldAsArray)
    // }
    // paramWriter.write(Utils.toArray(args.verifier, 'hex'))
    // paramWriter.write(this.encodePrivilegedParams(args.privileged, args.privilegedReason))
    // const result = await this.transmit('proveCertificate', originator, paramWriter.toArray())
    // const resultReader = new Utils.Reader(result)
    // const numFields = resultReader.readVarIntNum()
    // const keyringForVerifier: Record<string, string> = {}
    // for (let i = 0; i < numFields; i++) {
    //   const fieldKeyLength = resultReader.readVarIntNum()
    //   const fieldKey = Utils.toUTF8(resultReader.read(fieldKeyLength))
    //   const fieldValueLength = resultReader.readVarIntNum()
    //   keyringForVerifier[fieldKey] = Utils.toBase64(resultReader.read(fieldValueLength))
    // }
    // return {
    //   keyringForVerifier
    // }
    throw Error('not yet implemented')
  }

  async relinquishCertificate(args: { type: Base64String, serialNumber: Base64String, certifier: PubKeyHex }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ relinquished: true }> {
    // const paramWriter = new Utils.Writer()
    // const typeAsArray = Utils.toArray(args.type, 'base64')
    // paramWriter.write(typeAsArray)
    // const serialNumberAsArray = Utils.toArray(args.serialNumber, 'base64')
    // paramWriter.write(serialNumberAsArray)
    // const certifierAsArray = Utils.toArray(args.certifier, 'hex')
    // paramWriter.write(certifierAsArray)
    // await this.transmit('relinquishCertificate', originator, paramWriter.toArray())
    // return { relinquished: true }
    throw Error('not yet implemented')
  }

  private parseDiscoveryResult(result: number[]): {
    totalCertificates: number
    certificates: Array<{
      type: Base64String
      subject: PubKeyHex
      serialNumber: Base64String
      certifier: PubKeyHex
      revocationOutpoint: OutpointString
      signature: HexString
      fields: Record<CertificateFieldNameUnder50Bytes, Base64String>
      certifierInfo: {
        name: EntityNameStringMax100Bytes
        iconUrl: EntityIconURLStringMax500Bytes
        description: DescriptionString5to50Bytes
        trust: PositiveIntegerMax10
      }
      publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Bytes, Base64String>
      decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>
    }>
  } {
    const resultReader = new Utils.Reader(result)
    const totalCertificates = resultReader.readVarIntNum()
    const certificates: Array<{
      type: Base64String
      subject: PubKeyHex
      serialNumber: Base64String
      certifier: PubKeyHex
      revocationOutpoint: OutpointString
      signature: HexString
      fields: Record<CertificateFieldNameUnder50Bytes, Base64String>
      certifierInfo: {
        name: EntityNameStringMax100Bytes
        iconUrl: EntityIconURLStringMax500Bytes
        description: DescriptionString5to50Bytes
        trust: PositiveIntegerMax10
      }
      publiclyRevealedKeyring: Record<CertificateFieldNameUnder50Bytes, Base64String>
      decryptedFields: Record<CertificateFieldNameUnder50Bytes, string>
    }> = []
    for (let i = 0; i < totalCertificates; i++) {
      const certBinLen = resultReader.readVarIntNum()
      const certBin = resultReader.read(certBinLen)
      const cert = Certificate.fromBin(certBin)
      const nameLength = resultReader.readVarIntNum()
      const name = Utils.toUTF8(resultReader.read(nameLength))
      const iconUrlLength = resultReader.readVarIntNum()
      const iconUrl = Utils.toUTF8(resultReader.read(iconUrlLength))
      const descriptionLength = resultReader.readVarIntNum()
      const description = Utils.toUTF8(resultReader.read(descriptionLength))
      const trust = resultReader.readUInt8()
      const publiclyRevealedKeyring = {}
      const numPublicKeyringEntries = resultReader.readVarIntNum()
      for (let j = 0; j < numPublicKeyringEntries; j++) {
        const fieldKeyLen = resultReader.readVarIntNum()
        const fieldKey = Utils.toUTF8(resultReader.read(fieldKeyLen))
        const fieldValueLen = resultReader.readVarIntNum()
        publiclyRevealedKeyring[fieldKey] = resultReader.read(fieldValueLen)
      }
      const decryptedFields = {}
      const numDecryptedFields = resultReader.readVarIntNum()
      for (let k = 0; k < numDecryptedFields; k++) {
        const fieldKeyLen = resultReader.readVarIntNum()
        const fieldKey = Utils.toUTF8(resultReader.read(fieldKeyLen))
        const fieldValueLen = resultReader.readVarIntNum()
        decryptedFields[fieldKey] = Utils.toUTF8(resultReader.read(fieldValueLen))
      }
      certificates.push({
        ...cert,
        signature: cert.signature as string,
        certifierInfo: { iconUrl, name, description, trust },
        publiclyRevealedKeyring,
        decryptedFields
      })
    }
    return {
      totalCertificates,
      certificates
    }
  }

  async discoverByIdentityKey(args: { seekPermission?: BooleanDefaultTrue, identityKey: PubKeyHex, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<DiscoverCertificatesResult> {
    // const paramWriter = new Utils.Writer()
    // paramWriter.write(Utils.toArray(args.identityKey, 'hex'))
    // if (typeof args.limit === 'number') {
    //   paramWriter.writeVarIntNum(args.limit)
    // } else {
    //   paramWriter.writeVarIntNum(-1)
    // }
    // if (typeof args.offset === 'number') {
    //   paramWriter.writeVarIntNum(args.offset)
    // } else {
    //   paramWriter.writeVarIntNum(-1)
    // }
    // // Serialize seekPermission
    // paramWriter.writeInt8(typeof args.seekPermission === 'boolean' ? args.seekPermission ? 1 : 0 : -1)
    // const result = await this.transmit('discoverByIdentityKey', originator, paramWriter.toArray())
    // return this.parseDiscoveryResult(result)
    throw Error('not yet implemented')
  }

  async discoverByAttributes(args: { seekPermission?: BooleanDefaultTrue, attributes: Record<CertificateFieldNameUnder50Bytes, string>, limit?: PositiveIntegerDefault10Max10000, offset?: PositiveIntegerOrZero }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<DiscoverCertificatesResult> {
    // const paramWriter = new Utils.Writer()
    // const attributeKeys = Object.keys(args.attributes)
    // paramWriter.writeVarIntNum(attributeKeys.length)
    // for (let i = 0; i < attributeKeys.length; i++) {
    //   paramWriter.writeVarIntNum(attributeKeys[i].length)
    //   paramWriter.write(Utils.toArray(attributeKeys[i], 'utf8'))
    //   paramWriter.writeVarIntNum(args.attributes[attributeKeys[i]].length)
    //   paramWriter.write(Utils.toArray(args.attributes[attributeKeys[i]], 'utf8'))
    // }
    // if (typeof args.limit === 'number') {
    //   paramWriter.writeVarIntNum(args.limit)
    // } else {
    //   paramWriter.writeVarIntNum(-1)
    // }
    // if (typeof args.offset === 'number') {
    //   paramWriter.writeVarIntNum(args.offset)
    // } else {
    //   paramWriter.writeVarIntNum(-1)
    // }
    // // Serialize seekPermission
    // paramWriter.writeInt8(typeof args.seekPermission === 'boolean' ? args.seekPermission ? 1 : 0 : -1)
    // const result = await this.transmit('discoverByAttributes', originator, paramWriter.toArray())
    // return this.parseDiscoveryResult(result)
    throw Error('not yet implemented')
  }

  async isAuthenticated(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ authenticated: boolean }> {
    // const result = await this.transmit('isAuthenticated', originator)
    // return { authenticated: !!result[0] }
    throw Error('not yet implemented')
  }

  async waitForAuthentication(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ authenticated: true }> {
    // await this.transmit('waitForAuthentication', originator)
    // return { authenticated: true }
    throw Error('not yet implemented')
  }

  async getHeight(args: {}, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ height: PositiveInteger }> {
    // const result = await this.transmit('getHeight', originator)
    // const resultReader = new Utils.Reader(result)
    // return {
    //   height: resultReader.readVarIntNum()
    // }
    throw Error('not yet implemented')
  }

  async getHeaderForHeight(args: { height: PositiveInteger }, originator?: OriginatorDomainNameStringUnder250Bytes): Promise<{ header: HexString }> {
    // const paramWriter = new Utils.Writer()
    // paramWriter.writeVarIntNum(args.height)
    // const header = await this.transmit('getHeaderForHeight', originator, paramWriter.toArray())
    // return {
    //   header: Utils.toHex(header)
    // }
    throw Error('not yet implemented')
  }

  async getNetwork(args: {}): Promise<{ network: 'mainnet' | 'testnet' }> {
    return await this.api('getNetwork', args)
  }

  async getVersion(args: {}): Promise<{ version: VersionString7To30Bytes }> {
    return await this.api('getVersion', args)
  }
}
