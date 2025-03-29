import {
  WalletInterface,
  WalletProtocol,
  WalletClient,
  PubKeyHex,
  SecurityLevel
} from '../wallet/index.js'
import { Utils } from '../primitives/index.js'
import {
  Transaction,
  BroadcastResponse,
  BroadcastFailure
} from '../transaction/index.js'
import {
  LookupResolver,
  TopicBroadcaster
} from '../overlay-tools/index.js'
import { PushDrop, LockingScript } from '../script/index.js'
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
 * - basket (basket-based items)
 * - protocol (protocol-based items)
 * - certificate (certificate-based items)
 *
 * It provides methods to:
 * - Register new definitions using pushdrop-based UTXOs.
 * - Resolve existing definitions using a lookup service.
 * - List registry entries associated with the operator's wallet.
 * - Revoke an existing registry entry by spending its UTXO.
 *
 * Registry operators use this client to establish and manage
 * canonical references for baskets, protocols, and certificate types.
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
   * @param data - Structured information about a 'basket', 'protocol', or 'certificate'.
   * @returns A promise with the broadcast result or failure.
   */
  async registerDefinition (data: DefinitionData): Promise<BroadcastResponse | BroadcastFailure> {
    const registryOperator = (await this.wallet.getPublicKey({ identityKey: true })).publicKey
    const pushdrop = new PushDrop(this.wallet)

    // Convert definition data into PushDrop fields
    const fields = this.buildPushDropFields(data, registryOperator)

    // Convert the user-friendly definitionType to the actual wallet protocol
    const protocol = this.mapDefinitionTypeToWalletProtocol(data.definitionType)

    // Lock the fields into a pushdrop-based UTXO
    const lockingScript = await pushdrop.lock(fields, protocol, '1', 'anyone', true)

    // Create a transaction
    const { tx } = await this.wallet.createAction({
      description: `Register a new ${data.definitionType} item`,
      outputs: [
        {
          satoshis: REGISTRANT_TOKEN_AMOUNT,
          lockingScript: lockingScript.toHex(),
          outputDescription: `New ${data.definitionType} registration token`,
          basket: this.mapDefinitionTypeToBasketName(data.definitionType)
        }
      ],
      options: {
        randomizeOutputs: false
      }
    })

    if (tx === undefined) {
      throw new Error(`Failed to create ${data.definitionType} registration transaction!`)
    }

    // Broadcast to the relevant topic
    const broadcaster = new TopicBroadcaster(
      [this.mapDefinitionTypeToTopic(data.definitionType)],
      {
        networkPreset: this.network ??= (await this.wallet.getNetwork({})).network
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
   *   { name?: string; registryOperators?: string[]; protocolID?: WalletProtocol; }
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
    const serviceName = this.mapDefinitionTypeToServiceName(definitionType)

    // Make the lookup query
    const result = await resolver.query({ service: serviceName, query })
    if (result.type !== 'output-list') {
      return []
    }

    const parsedRegistryRecords: DefinitionData[] = []
    for (const output of result.outputs) {
      try {
        const parsedTx = Transaction.fromBEEF(output.beef)
        const lockingScript = parsedTx.outputs[output.outputIndex].lockingScript
        const record = await this.parseLockingScript(definitionType, lockingScript)
        parsedRegistryRecords.push(record)
      } catch {
        // Skip invalid or non-pushdrop outputs
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
    const relevantBasketName = this.mapDefinitionTypeToBasketName(definitionType)
    const { outputs, BEEF } = await this.wallet.listOutputs({
      basket: relevantBasketName,
      include: 'entire transactions'
    })

    const results: RegistryRecord[] = []
    for (const output of outputs) {
      if (!output.spendable) {
        continue
      }
      try {
        const [txid, outputIndex] = output.outpoint.split('.')
        const tx = Transaction.fromBEEF(BEEF as number[])
        const lockingScript: LockingScript = tx.outputs[outputIndex].lockingScript
        const record = await this.parseLockingScript(
          definitionType,
          lockingScript
        )
        results.push({
          ...record,
          txid,
          outputIndex: Number(outputIndex),
          satoshis: output.satoshis,
          lockingScript: lockingScript.toHex(),
          beef: BEEF as number[]
        })
      } catch {
        // Ignore parse errors
      }
    }

    return results
  }

  /**
   * Revokes a registry record by spending its associated UTXO.
   *
   * @param registryRecord - Must have valid txid, outputIndex, and lockingScript.
   * @returns Broadcast success/failure.
   */
  async revokeOwnRegistryEntry (
    registryRecord: RegistryRecord
  ): Promise<BroadcastResponse | BroadcastFailure> {
    if (registryRecord.txid === undefined || typeof registryRecord.outputIndex === 'undefined' || registryRecord.lockingScript === undefined) {
      throw new Error('Invalid registry record. Missing txid, outputIndex, or lockingScript.')
    }

    // Check if the registry record belongs to the current user
    const currentIdentityKey = (await this.wallet.getPublicKey({ identityKey: true })).publicKey
    if (registryRecord.registryOperator !== currentIdentityKey) {
      throw new Error('This registry token does not belong to the current wallet.')
    }

    // Create a descriptive label for the item we’re revoking
    const itemIdentifier =
      registryRecord.definitionType === 'basket'
        ? registryRecord.basketID
        : registryRecord.definitionType === 'protocol'
          ? registryRecord.name
          : registryRecord.definitionType === 'certificate'
            ? (registryRecord.name !== undefined ? registryRecord.name : registryRecord.type)
            : 'unknown'

    const outpoint = `${registryRecord.txid}.${registryRecord.outputIndex}`
    const { signableTransaction } = await this.wallet.createAction({
      description: `Revoke ${registryRecord.definitionType} item: ${itemIdentifier}`,
      inputBEEF: registryRecord.beef,
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

    const partialTx = Transaction.fromBEEF(signableTransaction.tx)

    // Prepare the unlocker
    const pushdrop = new PushDrop(this.wallet)
    const unlocker = await pushdrop.unlock(
      this.mapDefinitionTypeToWalletProtocol(registryRecord.definitionType),
      '1',
      'anyone',
      'all',
      false,
      registryRecord.satoshis,
      LockingScript.fromHex(registryRecord.lockingScript)
    )

    // Convert to Transaction, apply signature
    const finalUnlockScript = await unlocker.sign(partialTx, registryRecord.outputIndex)

    // Complete signing with the final unlock script
    const { tx: signedTx } = await this.wallet.signAction({
      reference: signableTransaction.reference,
      spends: {
        [registryRecord.outputIndex]: {
          unlockingScript: finalUnlockScript.toHex()
        }
      },
      options: {
        acceptDelayedBroadcast: false
      }
    })

    if (signedTx === undefined) {
      throw new Error('Failed to finalize the transaction signature.')
    }

    // Broadcast
    const broadcaster = new TopicBroadcaster(
      [this.mapDefinitionTypeToTopic(registryRecord.definitionType)],
      {
        networkPreset: this.network ??= (await this.wallet.getNetwork({})).network
      }
    )
    return await broadcaster.broadcast(Transaction.fromAtomicBEEF(signedTx))
  }

  // --------------------------------------------------------------------------
  // INTERNAL UTILITY METHODS
  // --------------------------------------------------------------------------

  /**
   * Convert definition data into an array of pushdrop fields (strings).
   * Each definition type has a slightly different shape.
   */
  private buildPushDropFields (
    data: DefinitionData,
    registryOperator: PubKeyHex
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
          JSON.stringify(data.protocolID),
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
        throw new Error('Unsupported definition type')
    }

    // Append the operator's public identity key last
    fields.push(registryOperator)

    return fields.map(field => Utils.toArray(field))
  }

  /**
   * Decodes a pushdrop locking script for a given definition type,
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
    let parsedData: DefinitionData

    switch (definitionType) {
      case 'basket': {
        if (decoded.fields.length !== 7) {
          throw new Error('Unexpected field count for basket type.')
        }
        const [basketID, name, iconURL, description, docURL, operator] = decoded.fields
        registryOperator = Utils.toUTF8(operator)

        parsedData = {
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
          throw new Error('Unexpected field count for protocol type.')
        }
        const [
          protocolID,
          name,
          iconURL,
          description,
          docURL,
          operator
        ] = decoded.fields
        registryOperator = Utils.toUTF8(operator)

        parsedData = {
          definitionType: 'protocol',
          protocolID: deserializeWalletProtocol(Utils.toUTF8(protocolID)),
          name: Utils.toUTF8(name),
          iconURL: Utils.toUTF8(iconURL),
          description: Utils.toUTF8(description),
          documentationURL: Utils.toUTF8(docURL)
        }
        break
      }

      case 'certificate': {
        if (decoded.fields.length !== 8) {
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

        let parsedFields: Record<string, CertificateFieldDescriptor> = {}
        try {
          parsedFields = JSON.parse(Utils.toUTF8(fieldsJSON))
        } catch {
          // If there's a JSON parse error, assume empty
        }

        parsedData = {
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
        throw new Error(`Unsupported definition type: ${definitionType as string}`)
    }

    // Return the typed data plus the operator key
    return { ...parsedData, registryOperator }
  }

  /**
   * Convert our definitionType to the wallet protocol format ([protocolID, keyID]).
   */
  private mapDefinitionTypeToWalletProtocol (definitionType: DefinitionType): WalletProtocol {
    switch (definitionType) {
      case 'basket':
        return [1, 'basketmap']
      case 'protocol':
        return [1, 'protomap']
      case 'certificate':
        return [1, 'certmap']
      default:
        throw new Error(`Unknown definition type: ${definitionType as string}`)
    }
  }

  /**
   * Convert 'basket'|'protocol'|'certificate' to the basket name used by the wallet.
   */
  private mapDefinitionTypeToBasketName (definitionType: DefinitionType): string {
    switch (definitionType) {
      case 'basket':
        return 'basketmap'
      case 'protocol':
        return 'protomap'
      case 'certificate':
        return 'certmap'
      default:
        throw new Error(`Unknown definition type: ${definitionType as string}`)
    }
  }

  /**
   * Convert 'basket'|'protocol'|'certificate' to the broadcast topic name.
   */
  private mapDefinitionTypeToTopic (definitionType: DefinitionType): string {
    switch (definitionType) {
      case 'basket':
        return 'tm_basketmap'
      case 'protocol':
        return 'tm_protomap'
      case 'certificate':
        return 'tm_certmap'
      default:
        throw new Error(`Unknown definition type: ${definitionType as string}`)
    }
  }

  /**
   * Convert 'basket'|'protocol'|'certificate' to the lookup service name.
   */
  private mapDefinitionTypeToServiceName (definitionType: DefinitionType): string {
    switch (definitionType) {
      case 'basket':
        return 'ls_basketmap'
      case 'protocol':
        return 'ls_protomap'
      case 'certificate':
        return 'ls_certmap'
      default:
        throw new Error(`Unknown definition type: ${definitionType as string}`)
    }
  }
}

export function deserializeWalletProtocol (str: string): WalletProtocol {
  // Parse the JSON string back into a JavaScript value.
  const parsed = JSON.parse(str)

  // Validate that the parsed value is an array with exactly two elements.
  if (!Array.isArray(parsed) || parsed.length !== 2) {
    throw new Error('Invalid wallet protocol format.')
  }

  const [security, protocolString] = parsed

  // Validate that the security level is one of the allowed numbers.
  if (![0, 1, 2].includes(security)) {
    throw new Error('Invalid security level.')
  }

  // Validate that the protocol string is a string and its length is within the allowed bounds.
  if (typeof protocolString !== 'string') {
    throw new Error('Invalid protocolID')
  }

  return [security as SecurityLevel, protocolString]
}
