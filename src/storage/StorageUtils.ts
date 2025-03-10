import { Hash } from "../../src/primitives/index.js"
import { fromBase58Check, toBase58Check, toArray } from "../../src/primitives/utils.js"

/**
 * Takes a UHRP URL and removes any prefixes.
 * @param {string} URL - The UHRP URL.
 * @returns {string} - Normalized URL.
 */
export const normalizeURL = (URL: string) => {
  if (URL.toLowerCase().startsWith('uhrp:')) URL = URL.slice(5)
  if (URL.startsWith('//')) URL = URL.slice(2)
  return URL
}

/**
 * Generates a UHRP URL from a given SHA-256 hash.
 * @param {number[]} hash - 32-byte SHA-256 hash.
 * @returns {string} - Base58Check encoded URL.
 */
export const getURLForHash = (hash: number[]) => {
  if (hash.length !== 32) {
    throw new Error('Hash length must be 32 bytes (sha256)')
  }
  return toBase58Check(hash, toArray('ce00', 'hex'))
}

/**
 * Generates a UHRP URL for a given file.
 * @param {number[] | string} file - File content as number array or string.
 * @returns {string} - Base58Check encoded URL.
 */
export const getURLForFile = (file: number[]) => {
  const hash = Hash.sha256(file)
  return getURLForHash(hash)
}

/**
 * Extracts the hash from a UHRP URL.
 * @param {string} URL - UHRP URL.
 * @returns {number[]} - Extracted SHA-256 hash.
 */
export const getHashFromURL = (URL: string) => {
  URL = normalizeURL(URL)
  const { data }  = fromBase58Check(URL)
  if (data.length !== 33) {
    throw new Error('Invalid length!')
  }
  return data
}

/**
 * Checks if a URL is a valid UHRP URL.
 * @param {string} URL - The URL to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const isValidURL = (URL: string) => {
  try {
    getHashFromURL(URL)
    return true
  } catch (e) {
    return false
  }
}

const StorageUtils = {
  normalizeURL,
  getURLForHash,
  getURLForFile,
  getHashFromURL,
  isValidURL
}

export default StorageUtils