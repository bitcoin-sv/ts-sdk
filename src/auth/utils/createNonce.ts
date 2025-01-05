import { Utils, Random, Wallet } from '../../../mod.js'

/**
 * Creates a nonce derived from a privateKey
 * @param wallet
 * @returns A random nonce derived with a wallet
 */
export async function createNonce(wallet: Wallet): Promise<string> {
  // Generate 16 random bytes for the first half of the data
  const firstHalf = Random(16)
  // Create an sha256 HMAC
  const { hmac } = await wallet.createHmac({ protocolID: [2, 'server hmac'], keyID: Utils.toUTF8(firstHalf), data: firstHalf, counterparty: 'self' })
  // Concatenate firstHalf and secondHalf as the nonce bytes
  const nonceBytes = [...firstHalf, ...hmac]
  return Utils.toBase64(nonceBytes)
}