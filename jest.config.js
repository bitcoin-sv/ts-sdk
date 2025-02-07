/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['dist/'],
  moduleDirectories: ['node_modules', 'src'],
  collectCoverageFrom: ['src/**/*.ts'],

  // ✅ Ensure Jest can resolve imports correctly
  moduleNameMapper: {
    '^@primitives/(.*)$': '<rootDir>/src/primitives/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
    '^@transaction/(.*)$': '<rootDir>/src/transaction/$1',
    '^@wallet/(.*)$': '<rootDir>/src/wallet/$1',
    '^@compat/(.*)$': '<rootDir>/src/compat/$1',
    '^@messages/(.*)$': '<rootDir>/src/messages/$1',
    '^@overlay-tools/(.*)$': '<rootDir>/src/overlay-tools/$1',
    '^@script/(.*)$': '<rootDir>/src/script/$1',
    '^@totp/(.*)$': '<rootDir>/src/totp/$1'
  },

  // ✅ Ensure Jest recognizes TypeScript and resolves `.ts` extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
}
