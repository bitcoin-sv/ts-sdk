import { Utils, WalletInterface } from '../../../mod.js'

/**
 * Verifies a nonce derived from a wallet
 * @param nonce - A nonce to verify as a base64 string.
 * @param wallet
 * @returns The status of the validation
 */
export async function verifyNonce(nonce: string, wallet: WalletInterface): Promise<boolean> {
  // Convert nonce from base64 string to Uint8Array
  const buffer = Utils.toArray(nonce, 'base64')

  // Split the nonce buffer
  const data = buffer.slice(0, 16)
  const hmac = buffer.slice(16)

  // Calculate the HMAC
  const { valid } = await wallet.verifyHmac({
    data,
    hmac,
    protocolID: [2, 'server hmac'],
    keyID: Utils.toUTF8(data),
    counterparty: 'self'
  })

  return valid
}
