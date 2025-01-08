import { sdk } from ".."
import { WalletErrorObject } from "./Wallet.interfaces"

/**
 * Derived class constructors should use the derived class name as the value for `name`,
 * and an internationalizable constant string for `message`.
 *
 * If a derived class intends to wrap another WalletError, the public property should
 * be named `walletError` and will be recovered by `fromUnknown`.
 * 
 * Optionaly, the derived class `message` can include template parameters passed in
 * to the constructor. See WERR_MISSING_PARAMETER for an example.
 *
 * To avoid derived class name colisions, packages should include a package specific
 * identifier after the 'WERR_' prefix. e.g. 'WERR_FOO_' as the prefix for Foo package error
 * classes.
 */
export class WalletError extends Error implements WalletErrorObject {
  // Facilitates detection of Error objects from non-error return values.
  isError: true = true

  constructor(name: string, message: string, stack?: string, public details?: Record<string, string>) {
    super(message)
    this.name = name
    if (stack) this.stack = stack
  }

  /**
     * Error class compatible accessor for  `code`.
     */
  get code (): sdk.ErrorCodeString10To40Bytes { return this.name }
  set code (v: sdk.ErrorCodeString10To40Bytes) { this.name = v }

  /**
     * Error class compatible accessor for `description`.
     */
  get description (): sdk.ErrorDescriptionString20To200Bytes { return this.message }
  set description (v: sdk.ErrorDescriptionString20To200Bytes) { this.message = v }

  /**
   * Recovers all public fields from WalletError derived error classes and relevant Error derived errors.
   * 
   * Critical client data fields are preserved across HTTP DojoExpress / DojoExpressClient encoding.
   */
  static fromUnknown(err: unknown): WalletError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let name = 'WERR_UNKNOWN'
    let message = ''
    let stack: string | undefined
    const details: Record<string, string> = {}
    if (err !== null && typeof err === 'object') {
      if (err["name"] === "Error" || err["name"] === "FetchError")
        name = err["code"] || err["status"] || "WERR_UNKNOWN"
      else
        name = err["name"] || err["code"] || err["status"] || "WERR_UNKNOWN"
      if (typeof name !== 'string') name = "WERR_UNKNOWN"

      message = err["message"] || err["description"] || ''
      if (typeof message !== 'string') message = "WERR_UNKNOWN"

      if (typeof err["stack"] === 'string') stack = err["stack"]

      if (typeof err["sql"] === 'string') details.sql = err["sql"]
      if (typeof err["sqlMessage"] === 'string') details.sqlMessage = err["sqlMessage"]
    }
    const e = new WalletError(
      name,
      message,
      stack,
      Object.keys(details).length > 0 ? details : undefined
    )
    if (err !== null && typeof err === 'object') {
      for (const [key, value] of Object.entries(err)) {
        if (key !== 'walletError' && typeof value !== 'string' && typeof value !== 'number' && !Array.isArray(value))
          continue
        switch (key) {
          case 'walletError':
            e[key] = WalletError.fromUnknown(value);
            break
          case 'status': break
          case 'name': break
          case 'code': break
          case 'message': break
          case 'description': break
          case 'stack': break
          case 'sql': break
          case 'sqlMessage': break
          default:
            e[key] = value;
            break
        }
      }
    }
    return e
  }

  /**
   * @returns standard HTTP error status object with status property set to 'error'.
   */
  asStatus(): { status: string, code: string, description: string } {
    return {
      status: 'error',
      code: this.name,
      description: this.message
    }
  }
}
