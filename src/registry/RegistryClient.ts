import {
  WalletInterface,
  WalletProtocol,
  WalletClient
  ,
  PubKeyHex
} from '../wallet/index.js'
import {
  Utils
} from '../primitives/index.js'
import {
  Transaction,
  BroadcastResponse,
  BroadcastFailure
} from '../transaction/index.js'
import {
  LookupResolver,
  TopicBroadcaster
} from '../overlay-tools/index.js'
import {
  PushDrop,
  LockingScript
} from '../script/index.js'
import {
  CertificateFieldDescriptor,
  DefinitionData,
  DefinitionType,
  RegistryQueryMapping,
  RegistryRecord
} from './types/index.js'

const REGISTRANT_TOKEN_AMOUNT = 1

/**
 * RegistryClient manages on-chain registry definitions for three types:
 * - BasketMap (basket-based items)
 * - ProtoMap (protocol-based items)
 * - CertMap (certificate-based items)
 *
 * It provides methods to:
 * - Register new definitions using pushdrop-based UTXOs.
 * - Resolve existing definitions using a overlay lookup service.
 * - List registry entries associated with the operator's wallet.
 * - Revoke an existing registry entry by spending its UTXO.
 *
 * Registry operators use this client to establish and manage
 * canonical references for baskets, protocols, and certificates types.
 */
export class RegistryClient {
  private network: 'mainnet' | 'testnet'
  constructor (
    private readonly wallet: WalletInterface = new WalletClient()
  ) { }

  /**
   * Publishes a new on-chain definition for baskets, protocols, or certificates.
   * The definition data is encoded in a pushdrop-based UTXO.
   *
   * Registry operators (i.e., identity key owners) can create these definitions
   * to establish canonical references for basket IDs, protocol specs, or certificate schemas.
   *
   * @param data - The structured information needed to register an item of kind 'basket', 'protocol', or 'certificate'.
   * @returns A promise with the broadcast result or failure.
   */
  async registerDefinition (data: DefinitionData): Promise<BroadcastResponse | BroadcastFailure> {
    const registryOperator = (await this.wallet.getPublicKey({ identityKey: true })).publicKey
    const pushdrop = new PushDrop(this.wallet)

    // Build the array of fields, depending on the definition type
    const fields = this.buildPushDropFields(data, registryOperator)
    const protocol = this.getWalletProtocol(data.definitionType)

    // Lock the fields
    const lockingScript = await pushdrop.lock(
      fields,
      protocol,
      '1',
      'self'
    )

    // Create a transaction
    const { tx } = await this.wallet.createAction({
      description: `Register a new ${data.definitionType} item`,
      outputs: [
        {
          satoshis: REGISTRANT_TOKEN_AMOUNT,
          lockingScript: lockingScript.toHex(),
          outputDescription: `New ${data.definitionType} registration token`
        }
      ]
    })

    if (tx === undefined) {
      throw new Error(`Failed to create ${data.definitionType} registration transaction!`)
    }

    // Broadcast

    const broadcaster = new TopicBroadcaster(
      [this.getBroadcastTopic(data.definitionType)],
      {
        networkPreset: this.network ??= (await (this.wallet.getNetwork({}))).network
      }
    )
    return await broadcaster.broadcast(Transaction.fromAtomicBEEF(tx))
  }

  /**
   * Resolves registrant tokens of a particular type using a lookup service.
   *
   * The query object shape depends on the registry type:
   * - For "basket", the query is of type BasketMapQuery:
   *   { basketID?: string; name?: string; registryOperators?: string[]; }
   * - For "protocol", the query is of type ProtoMapQuery:
   *   { name?: string; registryOperators?: string[]; protocolID?: string; securityLevel?: number; }
   * - For "certificate", the query is of type CertMapQuery:
   *   { type?: string; name?: string; registryOperators?: string[]; }
   *
   * @param definitionType - The registry type, which can be 'basket', 'protocol', or 'certificate'.
   * @param query - The query object used to filter registry records, whose shape is determined by the registry type.
   * @returns A promise that resolves to an array of matching registry records.
   */
  async resolve<T extends DefinitionType>(
    definitionType: T,
    query: RegistryQueryMapping[T]
  ): Promise<DefinitionData[]> {
    const resolver = new LookupResolver()

    // The service name depends on the kind
    const serviceName = this.getServiceName(definitionType)
    const result = await resolver.query({
      service: serviceName,
      query
    })

    if (result.type !== 'output-list') {
      return []
    }

    const parsedRegistryRecords: DefinitionData[] = []
    for (const output of result.outputs) {
      try {
        const parsedTx = Transaction.fromAtomicBEEF(output.beef)
        const record = await this.parseLockingScript(definitionType, parsedTx.outputs[output.outputIndex].lockingScript)
        parsedRegistryRecords.push(record)
      } catch {
        // skip
      }
    }
    return parsedRegistryRecords
  }

  /**
   * Lists the registry operator's published definitions for the given type.
   *
   * Returns parsed registry records including transaction details such as txid, outputIndex, satoshis, and the locking script.
   *
   * @param definitionType - The type of registry definition to list ('basket', 'protocol', or 'certificate').
   * @returns A promise that resolves to an array of RegistryRecord objects.
   */
  async listOwnRegistryEntries (definitionType: DefinitionType): Promise<RegistryRecord[]> {
    const relevantBasketName = this.getBasketName(definitionType)
    const { outputs } = await this.wallet.listOutputs({
      basket: relevantBasketName,
      include: 'locking scripts'
    })
    const results: RegistryRecord[] = []

    for (const output of outputs) {
      if (output.spendable) {
        continue
      }
      try {
        const record = await this.parseLockingScript(definitionType, LockingScript.fromHex(output.lockingScript as string))
        const [txid, outputIndex] = output.outpoint.split('.')
        results.push({
          ...record,
          txid,
          outputIndex: Number(outputIndex),
          satoshis: output.satoshis,
          lockingScript: output.lockingScript as string
        })
      } catch {
        // ignore parse errors
      }
    }

    return results
  }

  /**
   * Revokes a registry record by spending its associated UTXO.
   *
   * This function creates a transaction that spends the UTXO corresponding to the provided registry record,
   * revoking the registry entry. It prepares an unlocker using the appropriate wallet protocol,
   * builds a signable transaction, signs it, and then broadcasts the finalized transaction.
   *
   * @param registryRecord - The registry record to revoke. It must include a valid txid, outputIndex, and lockingScript.
   * @returns A promise that resolves with either a BroadcastResponse upon success or a BroadcastFailure on error.
   * @throws If required fields are missing or if transaction creation/signing fails.
   */
  async revokeOwnRegistryEntry (
    registryRecord: RegistryRecord
  ): Promise<BroadcastResponse | BroadcastFailure> {
    if (registryRecord.txid === undefined || typeof registryRecord.outputIndex === 'undefined' || registryRecord.lockingScript === undefined) {
      throw new Error('Invalid record. Missing txid, outputIndex, or lockingScript.')
    }

    // Prepare the unlocker
    const pushdrop = new PushDrop(this.wallet)
    const unlocker = await pushdrop.unlock(
      this.getWalletProtocol(registryRecord.definitionType),
      '1',
      'anyone'
    )

    const itemIdentifier =
      registryRecord.definitionType === 'basket'
        ? registryRecord.basketID
        : registryRecord.definitionType === 'protocol'
          ? registryRecord.name
          : registryRecord.definitionType === 'certificate'
            ? (registryRecord.name !== undefined ? registryRecord.name : registryRecord.type)
            : 'unknown'

    const description = `Revoke ${registryRecord.definitionType} item: ${String(itemIdentifier)}`

    // Create a new transaction that spends the UTXO
    const outpoint = `${registryRecord.txid}.${registryRecord.outputIndex}`
    const { signableTransaction } = await this.wallet.createAction({
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      description,
      inputs: [
        {
          outpoint,
          unlockingScriptLength: 73,
          inputDescription: `Revoking ${registryRecord.definitionType} token`
        }
      ]
    })

    if (signableTransaction === undefined) {
      throw new Error('Failed to create signable transaction.')
    }

    // Build a transaction object, sign with the unlock script
    const tx = Transaction.fromBEEF(signableTransaction.tx)
    const finalUnlockScript = await unlocker.sign(tx, registryRecord.outputIndex)

    // Complete the signing
    const { tx: signedTx } = await this.wallet.signAction({
      reference: signableTransaction.reference,
      spends: {
        [registryRecord.outputIndex]: {
          unlockingScript: finalUnlockScript.toHex()
        }
      }
    })

    if (signedTx === undefined) {
      throw new Error('Failed to finalize the transaction signature.')
    }

    // Broadcast
    const broadcaster = new TopicBroadcaster(
      [this.getBroadcastTopic(registryRecord.definitionType)],
      {
        networkPreset: this.network ??= (await (this.wallet.getNetwork({}))).network
      }
    )
    return await broadcaster.broadcast(Transaction.fromAtomicBEEF(signedTx))
  }

  // --------------------------------------------------------------------------
  // INTERNAL HELPER METHODS
  // --------------------------------------------------------------------------

  private buildPushDropFields (
    data: DefinitionData,
    registryOperator: string
  ): number[][] {
    let fields: string[]

    switch (data.definitionType) {
      case 'basket':
        fields = [
          data.basketID,
          data.name,
          data.iconURL,
          data.description,
          data.documentationURL
        ]
        break
      case 'protocol':
        fields = [
          data.securityLevel.toString(),
          data.protocolID,
          data.name,
          data.iconURL,
          data.description,
          data.documentationURL
        ]
        break
      case 'certificate':
        fields = [
          data.type,
          data.name,
          data.iconURL,
          data.description,
          data.documentationURL,
          JSON.stringify(data.fields)
        ]
        break
      default:
        throw new Error('Invalid registry kind specified')
    }

    // Append the registry operator to all cases.
    fields.push(registryOperator)

    return fields.map(field => Utils.toArray(field))
  }

  /**
   * Decodes a pushdrop locking script for a given registry kind,
   * returning a typed record with the appropriate fields.
   */
  private async parseLockingScript (
    definitionType: DefinitionType,
    lockingScript: LockingScript
  ): Promise<DefinitionData> {
    const decoded = PushDrop.decode(lockingScript)
    if (decoded.fields.length === 0) {
      throw new Error('Not a valid registry pushdrop script.')
    }

    let registryOperator: PubKeyHex
    let data: DefinitionData
    switch (definitionType) {
      case 'basket': {
        if (decoded.fields.length !== 6) {
          throw new Error('Unexpected field count for basket type.')
        }
        const [basketID, name, iconURL, description, docURL, operator] = decoded.fields
        registryOperator = Utils.toUTF8(operator)
        data = {
          definitionType: 'basket',
          basketID: Utils.toUTF8(basketID),
          name: Utils.toUTF8(name),
          iconURL: Utils.toUTF8(iconURL),
          description: Utils.toUTF8(description),
          documentationURL: Utils.toUTF8(docURL)
        }
        break
      }
      case 'protocol': {
        if (decoded.fields.length !== 7) {
          throw new Error('Unexpected field count for proto type.')
        }
        const [
          securityLevel,
          protocolID,
          name,
          iconURL,
          description,
          docURL,
          operator
        ] = decoded.fields
        registryOperator = Utils.toUTF8(operator)
        data = {
          definitionType: 'protocol',
          securityLevel: parseInt(Utils.toUTF8(securityLevel), 10) as 0 | 1 | 2,
          protocolID: Utils.toUTF8(protocolID),
          name: Utils.toUTF8(name),
          iconURL: Utils.toUTF8(iconURL),
          description: Utils.toUTF8(description),
          documentationURL: Utils.toUTF8(docURL)
        }
        break
      }
      case 'certificate': {
        if (decoded.fields.length !== 7) {
          throw new Error('Unexpected field count for certificate type.')
        }
        const [
          certType,
          name,
          iconURL,
          description,
          docURL,
          fieldsJSON,
          operator
        ] = decoded.fields

        registryOperator = Utils.toUTF8(operator)

        let parsedFields: Record<string, CertificateFieldDescriptor>
        try {
          parsedFields = JSON.parse(Utils.toUTF8(fieldsJSON))
        } catch {
          parsedFields = {}
        }

        data = {
          definitionType: 'certificate',
          type: Utils.toUTF8(certType),
          name: Utils.toUTF8(name),
          iconURL: Utils.toUTF8(iconURL),
          description: Utils.toUTF8(description),
          documentationURL: Utils.toUTF8(docURL),
          fields: parsedFields
        }
        break
      }
      default:
        throw new Error('Invalid registry kind for parsing.')
    }

    const currentIdentityKey = (await this.wallet.getPublicKey({ identityKey: true })).publicKey
    if (registryOperator !== currentIdentityKey) {
      throw new Error('This registry token does not belong to the current wallet.')
    }

    return {
      ...data,
      registryOperator
    }
  }

  /**
   * Returns the (protocolID, keyID) used for pushdrop based on the registry kind.
   */
  private getWalletProtocol (definitionType: DefinitionType): WalletProtocol {
    switch (definitionType) {
      case 'basket':
        return [1, 'basketmap']
      case 'protocol':
        return [1, 'protomap']
      case 'certificate':
        return [1, 'certmap']
      default:
        throw new Error(`Unknown registry type: ${definitionType as string}`)
    }
  }

  /**
   * Returns the name of the basket used by the wallet
   */
  private getBasketName (definitionType: DefinitionType): string {
    switch (definitionType) {
      case 'basket':
        return 'basketmap'
      case 'protocol':
        return 'protomap'
      case 'certificate':
        return 'certmap'
      default:
        throw new Error(`Unknown basket type: ${definitionType as string}`)
    }
  }

  /**
   * Returns the broadcast topic to be used with SHIPBroadcaster.
   */
  private getBroadcastTopic (definitionType: DefinitionType): string {
    switch (definitionType) {
      case 'basket':
        return 'tm_basketmap'
      case 'protocol':
        return 'tm_protomap'
      case 'certificate':
        return 'tm_certmap'
      default:
        throw new Error(`Unknown topic type: ${definitionType as string}`)
    }
  }

  /**
   * Returns the lookup service name to use.
   */
  private getServiceName (definitionType: DefinitionType): string {
    switch (definitionType) {
      case 'basket':
        return 'ls_basketmap'
      case 'protocol':
        return 'ls_protomap'
      case 'certificate':
        return 'ls_certmap'
      default:
        throw new Error(`Unknown service type: ${definitionType as string}`)
    }
  }
}
