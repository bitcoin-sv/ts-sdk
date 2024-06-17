import { SHA1HMAC } from './sha1hmac';
import { Hash } from '@bsv/sdk';
import { dec2hex, hex2dec } from './converters';

export type TOTPAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512';

/**
 * Options for TOTP generation.
 * @param {number} [digits=6] - The number of digits in the OTP.
 * @param {TOTPAlgorithm} [algorithm="SHA-1"] - Algorithm used for hashing.
 * @param {number} [period=30] - The time period for OTP validity in seconds.
 * @param {number} [timestamp=Date.now()] - The current timestamp.
 */
export type TOTPOptions = {
  digits?: number;
  algorithm?: TOTPAlgorithm;
  period?: number;
  timestamp?: number;
};

/**
 * Options for TOTP validation.
 * @param {number} [skew=1] - The number of time periods to check before and after the current time period.
 */
export type TOTPValidateOptions = TOTPOptions & {
  skew?: number;
};

export class TOTP {
  /**
   * Generates a Time-based One-Time Password (TOTP).
   * @param {Uint8Array} rawKey - The secret key for TOTP.
   * @param {TOTPOptions} options - Optional parameters for TOTP.
   * @returns {string} The generated TOTP.
   */
  static generate(rawKey: Uint8Array, options?: TOTPOptions): string {
    const _options = this.withDefaultOptions(options);

    const counter = this.getCounter(_options.timestamp, _options.period);
    const otp = generateHOTP(rawKey, counter, _options);
    return otp;
  }

  /**
   * Validates a Time-based One-Time Password (TOTP).
   * @param {Uint8Array} rawKey - The secret key for TOTP.
   * @param {string} passcode - The passcode to validate.
   * @param {TOTPValidateOptions} options - Optional parameters for TOTP validation.
   * @returns {boolean} A boolean indicating whether the passcode is valid.
   */
  static validate(rawKey: Uint8Array, passcode: string, options?: TOTPValidateOptions): boolean {
    const _options = this.withDefaultValidateOptions(options);
    passcode = passcode.trim();
    if (passcode.length != _options.digits) {
      return false;
    }

    const counter = this.getCounter(_options.timestamp, _options.period);

    const counters = [counter];
    for (let i = 1; i <= _options.skew; i++) {
      counters.push(counter + i);
      counters.push(counter - i);
    }

    for (let c of counters) {
      if (passcode === generateHOTP(rawKey, c, _options)) {
        return true;
      }
    }

    return false;
  }

  private static getCounter(timestamp: number, period: number): number {
    const epochSeconds = Math.floor(timestamp / 1000);
    const counter = Math.floor(epochSeconds / period);
    return counter;
  }

  private static withDefaultOptions(options?: TOTPOptions): Required<TOTPOptions> {
    return {
      digits: 2,
      algorithm: 'SHA-1',
      period: 30,
      timestamp: Date.now(),
      ...options,
    };
  }

  private static withDefaultValidateOptions(options?: TOTPValidateOptions): Required<TOTPValidateOptions> {
    return { skew: 1, ...this.withDefaultOptions(options) };
  }
}

function generateHOTP(rawKey: Uint8Array, counter: number, options: Required<TOTPOptions>): string {
  const keyArray = Array.from(rawKey);
  const timeHex = dec2hex(counter).padStart(16, '0');
  const hmac = calcHMAC(keyArray, timeHex, options.algorithm);

  const signatureHex = hmac.digestHex();

  //RFC 4226 https://datatracker.ietf.org/doc/html/rfc4226#section-5.4
  const offset = hex2dec(signatureHex.slice(-1)) * 2; //offset should point to hex-pair in hex string - that's why "x2 multiplification"
  const fourBytesRange = signatureHex.slice(offset, offset + 8); //starting from offset, get 4. pairs of hex. (Dynamic Truncation)
  const mask = 0x7fffffff; //32-bit number with a leading 0 followed by 31 ones [0111 (...) 1111]
  const masked = hex2dec(fourBytesRange) & mask;
  const otp = masked.toString().slice(-options.digits);
  return otp;
}

function calcHMAC(keyArray: number[], timeHex: string, algorithm: TOTPAlgorithm) {
  switch (algorithm) {
    case 'SHA-1':
      // Because SHA1HMAC is missing in @bsv/sdk, we had to implement it (using SHA1 from @bsv/sdk)
      // TODO: Consider adding SHA1HMAC to @bsv/sdk
      return new SHA1HMAC(keyArray).update(timeHex, 'hex');
    case 'SHA-256':
      return new Hash.SHA256HMAC(keyArray).update(timeHex, 'hex');
    case 'SHA-512':
      return new Hash.SHA512HMAC(keyArray).update(timeHex, 'hex');
    default:
      throw new Error('unsupported HMAC algorithm');
  }
}
