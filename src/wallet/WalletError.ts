export class WalletError extends Error {
  code: number
  isError: boolean = true

  constructor (message: string, code = 1, stack?: string) {
    super(message)
    this.code = code
    this.name = this.constructor.name

    if (stack !== undefined && stack !== null && stack !== '') {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

// NOTE: Enum values must not exceed the UInt8 range (0–255)
enum walletErrors {
  unknownError = 1,
  unsupportedAction = 2,
  invalidHmac = 3,
  invalidSignature = 4,
}

export default walletErrors
export type WalletErrorCode = keyof typeof walletErrors
