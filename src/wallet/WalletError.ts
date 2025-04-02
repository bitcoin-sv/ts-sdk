import { AtomicBEEF, OutpointString, ReviewActionResult, SendWithResult, TXIDHexString } from "./Wallet.interfaces.js"

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
  reviewActions = 5,
}

export default walletErrors
export type WalletErrorCode = keyof typeof walletErrors

/**
 * When a `createAction` or `signAction` is completed in undelayed mode (`acceptDelayedBroadcast`: false),
 * any unsucccessful result will return the results by way of this exception to ensure attention is
 * paid to processing errors.
 */
export class WERR_REVIEW_ACTIONS extends WalletError {
  /**
   * All parameters correspond to their comparable `createAction` or `signSction` results
   * with the exception of `reviewActionResults`;
   * which contains more details, particularly for double spend results.
   */
  constructor(
    public reviewActionResults: ReviewActionResult[],
    public sendWithResults: SendWithResult[],
    public txid?: TXIDHexString,
    public tx?: AtomicBEEF,
    public noSendChange?: OutpointString[]
  ) {
    super('Undelayed createAction or signAction results require review.', 5)
  }
}