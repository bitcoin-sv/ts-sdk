import { PubKeyHex } from '@bsv/sdk'

/**
 * Determines which category of registry item we are working with.
 * - "basket" corresponds to BasketMap
 * - "protocol" corresponds to ProtoMap
 * - "certificate"  corresponds to CertMap
 */
export type DefinitionType = 'basket' | 'protocol' | 'certificate'

/**
 * Describes a re-usable structure for certificate fields (used by CertMap).
 */
export interface CertificateFieldDescriptor {
  friendlyName: string
  description: string
  type: 'text' | 'imageURL' | 'other'
  fieldIcon: string
}

/**
 * Registry data for a Basket-style record (BasketMap).
 */
export interface BasketDefinitionData {
  definitionType: 'basket'
  basketID: string
  name: string
  iconURL: string
  description: string
  documentationURL: string
  registryOperator?: PubKeyHex
}

/**
 * Registry data for a Proto-style record (ProtoMap).
 */
export interface ProtocolDefinitionData {
  definitionType: 'protocol'
  protocolID: string
  securityLevel: 0 | 1 | 2
  name: string
  iconURL: string
  description: string
  documentationURL: string
  registryOperator?: PubKeyHex
}

/**
 * Registry data for a Cert-style record (CertMap).
 */
export interface CertificateDefinitionData {
  definitionType: 'certificate'
  type: string
  name: string
  iconURL: string
  description: string
  documentationURL: string
  fields: Record<string, CertificateFieldDescriptor>
  registryOperator?: PubKeyHex
}

export type DefinitionData =
  | BasketDefinitionData
  | ProtocolDefinitionData
  | CertificateDefinitionData

export interface TokenData {
  txid: string
  outputIndex: number
  satoshis: number
  lockingScript: string
}

export type RegistryRecord = DefinitionData & TokenData

// Lookup Query Types (Note: can be shared types with lookup service)

interface BasketMapQuery {
  basketID?: string
  registryOperators?: string[]
  name?: string
}

interface ProtoMapQuery {
  name?: string
  registryOperators?: string[]
  protocolID?: string
  securityLevel?: number
}

interface CertMapQuery {
  type?: string
  name?: string
  registryOperators?: string[]
}

export interface RegistryQueryMapping {
  basket: BasketMapQuery
  protocol: ProtoMapQuery
  certificate: CertMapQuery
}
