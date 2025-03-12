import { AuthFetch } from '../auth/clients/index.js'
import { DEFAULT_IDENTITY_CLIENT_OPTIONS, defaultIdentity, DisplayableIdentity, KNOWN_IDENTITY_TYPES } from './types/index.js'
import {
  CertificateFieldNameUnder50Bytes,
  DiscoverByAttributesArgs,
  DiscoverByIdentityKeyArgs,
  IdentityCertificate,
  OriginatorDomainNameStringUnder250Bytes,
  WalletCertificate,
  WalletClient,
  WalletInterface
} from '../wallet/index.js'
import { BroadcastFailure, BroadcastResponse, Transaction } from '../transaction/index.js'
import Certificate from '../auth/certificates/Certificate.js'
import { PushDrop } from '../script/index.js'
import { PrivateKey, Utils } from '../primitives/index.js'
import { TopicBroadcaster } from '../overlay-tools/index.js'

/**
 * IdentityClient lets you discover who others are, and let the world know who you are.
 */
export class IdentityClient {
  private readonly authClient: AuthFetch
  private readonly wallet: WalletInterface
  constructor (
    wallet?: WalletInterface,
    private readonly options = DEFAULT_IDENTITY_CLIENT_OPTIONS,
    private readonly originator?: OriginatorDomainNameStringUnder250Bytes
  ) {
    this.wallet = wallet ?? new WalletClient()
    this.authClient = new AuthFetch(this.wallet)
  }

  /**
   * Publicly reveals selected fields from a given certificate by creating a publicly verifiable certificate.
   * The publicly revealed certificate is included in a blockchain transaction and broadcast to a federated overlay node.
   *
   * @param {Certificate} certificate - The master certificate to selectively reveal.
   * @param {CertificateFieldNameUnder50Bytes[]} fieldsToReveal - An array of certificate field names to reveal. Only these fields will be included in the public certificate.
   *
   * @returns {Promise<object>} A promise that resolves with the broadcast result from the overlay network.
   * @throws {Error} Throws an error if the certificate is invalid, the fields cannot be revealed, or if the broadcast fails.
   */
  async publiclyRevealAttributes (
    certificate: WalletCertificate,
    fieldsToReveal: CertificateFieldNameUnder50Bytes[]
  ): Promise<BroadcastResponse | BroadcastFailure> {
    if (Object.keys(certificate.fields).length === 0) {
      throw new Error('Public reveal failed: Certificate has no fields to reveal!')
    }
    if (fieldsToReveal.length === 0) {
      throw new Error('Public reveal failed: You must reveal at least one field!')
    }
    try {
      const masterCert = new Certificate(
        certificate.type,
        certificate.serialNumber,
        certificate.subject,
        certificate.certifier,
        certificate.revocationOutpoint,
        certificate.fields,
        certificate.signature
      )
      await masterCert.verify()
    } catch (error) {
      throw new Error('Public reveal failed: Certificate verification failed!')
    }

    // Given we already have a master certificate from a certifier,
    // create an anyone verifiable certificate with selectively revealed fields
    const { keyringForVerifier } = await this.wallet.proveCertificate({
      certificate,
      fieldsToReveal,
      verifier: new PrivateKey(1).toPublicKey().toString()
    })

    // Build the lockingScript with pushdrop.create() and the transaction with createAction()
    const lockingScript = await new PushDrop(this.wallet).lock(
      [Utils.toArray(JSON.stringify({ ...certificate, keyring: keyringForVerifier }))],
      this.options.protocolID,
      this.options.keyID,
      'anyone',
      true,
      true
    )
    // TODO: Consider verification and if this is necessary
    // counterpartyCanVerifyMyOwnership: true

    const { tx } = await this.wallet.createAction({
      description: 'Create a new Identity Token',
      outputs: [{
        satoshis: this.options.tokenAmount,
        lockingScript: lockingScript.toHex(),
        outputDescription: 'Identity Token'
      }],
      options: {
        randomizeOutputs: false
      }
    })

    if (tx !== undefined) {
      // Submit the transaction to an overlay
      const broadcaster = new TopicBroadcaster(['tm_identity'], {
        networkPreset: (await (this.wallet.getNetwork({}))).network
      })
      return await broadcaster.broadcast(Transaction.fromAtomicBEEF(tx))
    }
    throw new Error('Public reveal failed: failed to create action!')
  }

  /**
  * Resolves displayable identity certificates, issued to a given identity key by a trusted certifier.
  *
  * @param {DiscoverByIdentityKeyArgs} args - Arguments for requesting the discovery based on the identity key.
  * @returns {Promise<DisplayableIdentity[]>} The promise resolves to displayable identities.
  */
  async resolveByIdentityKey (
    args: DiscoverByIdentityKeyArgs
  ): Promise<DisplayableIdentity[]> {
    const { certificates } = await this.wallet.discoverByIdentityKey(args, this.originator)
    return certificates.map(cert => {
      return IdentityClient.parseIdentity(cert)
    })
  }

  /**
   * Resolves displayable identity certificates by specific identity attributes, issued by a trusted entity.
   *
   * @param {DiscoverByAttributesArgs} args - Attributes and optional parameters used to discover certificates.
   * @returns {Promise<DisplayableIdentity[]>} The promise resolves to displayable identities.
   */
  async resolveByAttributes (
    args: DiscoverByAttributesArgs
  ): Promise<DisplayableIdentity[]> {
    const { certificates } = await this.wallet.discoverByAttributes(args, this.originator)
    return certificates.map(cert => {
      return IdentityClient.parseIdentity(cert)
    })
  }

  /**
   * TODO: Implement once revocation overlay is created
   * Remove public certificate revelation from overlay services by spending the identity token
   * @param serialNumber - Unique serial number of the certificate to revoke revelation
   */
  // async revokeCertificateRevelation(
  //   serialNumber: Base64String
  // ): Promise<BroadcastResponse | BroadcastFailure> {
  //   // 1. Find existing UTXO
  //   const lookupResolver = new LookupResolver()
  //   const result = await lookupResolver.query({
  //     service: 'ls_identity',
  //     query: {
  //       serialNumber
  //     }
  //   })

  //   let outpoint: string
  //   let lockingScript: LockingScript | undefined
  //   if (result.type === 'output-list') {
  //     const tx = Transaction.fromAtomicBEEF(result.outputs[this.options.outputIndex].beef)
  //     outpoint = `${tx.id('hex')}.${this.options.outputIndex}` // Consider better way
  //     lockingScript = tx.outputs[this.options.outputIndex].lockingScript
  //   }

  //   if (lockingScript === undefined) {
  //     throw new Error('Failed to get locking script for revelation output!')
  //   }

  //   // 2. Parse results
  //   const { signableTransaction } = await this.wallet.createAction({
  //     description: '',
  //     inputs: [{
  //       inputDescription: 'Spend certificate revelation token',
  //       outpoint,
  //       unlockingScriptLength: 73
  //     }],
  //     options: {
  //       randomizeOutputs: false
  //     }
  //   })

  //   if (signableTransaction === undefined) {
  //     throw new Error('Failed to create signable transaction')
  //   }

  //   const partialTx = Transaction.fromBEEF(signableTransaction.tx)

  //   const unlocker = new PushDrop(this.wallet).unlock(
  //     this.options.protocolID,
  //     this.options.keyID,
  //     'self',
  //     'all',
  //     false,
  //     1,
  //     lockingScript
  //   )

  //   const unlockingScript = await unlocker.sign(partialTx, this.options.outputIndex)

  //   const { tx: signedTx } = await this.wallet.signAction({
  //     reference: signableTransaction.reference,
  //     spends: {
  //       [this.options.outputIndex]: {
  //         unlockingScript: unlockingScript.toHex()
  //       }
  //     }
  //   })

  //   // 4. Return broadcast status
  //   // Submit the transaction to an overlay
  //   const broadcaster = new SHIPBroadcaster(['tm_identity'])
  //   return await broadcaster.broadcast(Transaction.fromAtomicBEEF(signedTx as number[]))
  // }

  /**
   * Parse out identity and certifier attributes to display from an IdentityCertificate
   * @param identityToParse - The Identity Certificate to parse
   * @returns - IdentityToDisplay
   */
  static parseIdentity (identityToParse: IdentityCertificate): DisplayableIdentity {
    const { type, decryptedFields, certifierInfo } = identityToParse
    let name, avatarURL, badgeLabel, badgeIconURL, badgeClickURL

    // Parse out the name to display based on the specific certificate type which has clearly defined fields.
    switch (type) {
      case KNOWN_IDENTITY_TYPES.xCert:
        name = decryptedFields.userName
        avatarURL = decryptedFields.profilePhoto
        badgeLabel = `X account certified by ${certifierInfo.name}`
        badgeIconURL = certifierInfo.iconUrl
        badgeClickURL = 'https://socialcert.net' // TODO Make a specific page for this.
        break
      case KNOWN_IDENTITY_TYPES.discordCert:
        name = decryptedFields.userName
        avatarURL = decryptedFields.profilePhoto
        badgeLabel = `Discord account certified by ${certifierInfo.name}`
        badgeIconURL = certifierInfo.iconUrl
        badgeClickURL = 'https://socialcert.net' // TODO Make a specific page for this.
        break
      case KNOWN_IDENTITY_TYPES.emailCert:
        name = decryptedFields.email
        avatarURL = 'XUTZxep7BBghAJbSBwTjNfmcsDdRFs5EaGEgkESGSgjJVYgMEizu'
        badgeLabel = `Email certified by ${certifierInfo.name}`
        badgeIconURL = certifierInfo.iconUrl
        badgeClickURL = 'https://socialcert.net' // TODO Make a specific page for this.
        break
      case KNOWN_IDENTITY_TYPES.phoneCert:
        name = decryptedFields.phoneNumber
        avatarURL = 'XUTLxtX3ELNUwRhLwL7kWNGbdnFM8WG2eSLv84J7654oH8HaJWrU'
        badgeLabel = `Phone certified by ${certifierInfo.name}`
        badgeIconURL = certifierInfo.iconUrl
        badgeClickURL = 'https://socialcert.net' // TODO Make a specific page for this.
        break
      case KNOWN_IDENTITY_TYPES.identiCert:
        name = `${decryptedFields.firstName} ${decryptedFields.lastName}`
        avatarURL = decryptedFields.profilePhoto
        badgeLabel = `Government ID certified by ${certifierInfo.name}`
        badgeIconURL = certifierInfo.iconUrl
        badgeClickURL = 'https://identicert.me' // TODO Make a specific page for this.
        break
      case KNOWN_IDENTITY_TYPES.registrant:
        name = decryptedFields.name
        avatarURL = decryptedFields.icon
        badgeLabel = `Entity certified by ${certifierInfo.name}`
        badgeIconURL = certifierInfo.iconUrl
        badgeClickURL = 'https://projectbabbage.com/docs/registrant' // TODO: Make this doc page exist
        break
      case KNOWN_IDENTITY_TYPES.coolCert:
        name = decryptedFields.cool === 'true' ? 'Cool Person!' : 'Not cool!'
        break
      case KNOWN_IDENTITY_TYPES.anyone:
        name = 'Anyone'
        avatarURL = 'XUT4bpQ6cpBaXi1oMzZsXfpkWGbtp2JTUYAoN7PzhStFJ6wLfoeR'
        badgeLabel = 'Represents the ability for anyone to access this information.'
        badgeIconURL = 'XUUV39HVPkpmMzYNTx7rpKzJvXfeiVyQWg2vfSpjBAuhunTCA9uG'
        badgeClickURL = 'https://projectbabbage.com/docs/anyone-identity' // TODO: Make this doc page exist
        break
      case KNOWN_IDENTITY_TYPES.self:
        name = 'You'
        avatarURL = 'XUT9jHGk2qace148jeCX5rDsMftkSGYKmigLwU2PLLBc7Hm63VYR'
        badgeLabel = 'Represents your ability to access this information.'
        badgeIconURL = 'XUUV39HVPkpmMzYNTx7rpKzJvXfeiVyQWg2vfSpjBAuhunTCA9uG'
        badgeClickURL = 'https://projectbabbage.com/docs/self-identity' // TODO: Make this doc page exist
        break
      default:
        name = defaultIdentity.name
        avatarURL = decryptedFields.profilePhoto
        badgeLabel = defaultIdentity.badgeLabel
        badgeIconURL = defaultIdentity.badgeIconURL
        badgeClickURL = defaultIdentity.badgeClickURL // TODO: Make this doc page exist
        break
    }

    return {
      name,
      avatarURL,
      abbreviatedKey: identityToParse.subject.length > 0 ? `${identityToParse.subject.substring(0, 10)}...` : '',
      identityKey: identityToParse.subject,
      badgeIconURL,
      badgeLabel,
      badgeClickURL
    }
  }
}
