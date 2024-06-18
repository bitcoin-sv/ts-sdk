export const hex2dec = (hex: string): number => {
  return parseInt(hex, 16)
}

export const dec2hex = (dec: number): string => {
  const rounded = Math.round(dec)
  const prefix = rounded <= 0xf ? '0' : '' // ensure that single-digit numbers are padded with a leading zero
  return prefix + rounded.toString(16)
}
