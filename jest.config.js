/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // Use the preset specifically designed for ESM
  preset: 'ts-jest/presets/default-esm',

  // Use the Node environment for testing
  testEnvironment: 'node',

  // Ignore compiled output
  testPathIgnorePatterns: ['dist/'],
  transform: {
      '^.+\\.test.ts?$': ['ts-jest', { 
        useESM: true
      }],
  },

  // Tell Jest that files ending in .ts should be treated as ESM modules
  extensionsToTreatAsEsm: ['.ts'],

  // Optionally, if you have imports with a .js extension in your source (or tests)
  // but your source files are actually TypeScript, this mapper will remove the extension.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
}
