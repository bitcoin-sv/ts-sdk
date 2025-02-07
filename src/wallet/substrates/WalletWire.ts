/**
 * A Wallet Wire is an abstraction over a raw transport medium where binary data can be sent to and subsequently received from a wallet.
 */
export default interface WalletWire {
  transmitToWallet: (message: number[]) => Promise<number[]>
}
