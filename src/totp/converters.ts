export const hexToUint8Array = (hex: string): Uint8Array => {
  const length = hex.length / 2;
  const uintArray = new Uint8Array(length);

  // Loop to convert each hex pair to an integer
  for (let i = 0; i < length; i++) {
    const hexPair = hex.substring(2 * i, 2 * i + 2);
    uintArray[i] = parseInt(hexPair, 16);
  }
  return uintArray;
};

export const hex2dec = (hex: string): number => {
  return parseInt(hex, 16);
};

export const dec2hex = (dec: number): string => {
  const rounded = Math.round(dec);
  const prefix = rounded <= 0xf ? '0' : ''; //ensure that single-digit numbers are padded with a leading zero
  return prefix + rounded.toString(16);
};
