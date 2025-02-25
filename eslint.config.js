import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import tsStandard from 'ts-standard'
import pluginJest from 'eslint-plugin-jest'

export default [
  tsStandard, // ✅ Ensure ESLint loads ts-standard as a base config

  {
    // Add ignorePatterns at the top level for ESLint
    ignorePatterns: ['src/primitives/Point.ts', 'docs/swagger/*'],

    files: ['src/**/*.ts', '**/*.{js,mjs,cjs,ts,jsx,tsx}'], // ✅ Ensure TS files are included
    languageOptions: {
      globals: {
        ...globals.browser,
        process: 'readonly',
        ...globals.jest
      },
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json', // ✅ Ensure this file exists
        tsconfigRootDir: process.cwd() // ✅ Use process.cwd() instead of import.meta.dirname
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      jest: pluginJest
    },
    rules: {
      ...tseslint.configs.recommended.rules, // ✅ TypeScript ESLint rules
      ...pluginJs.configs.recommended.rules, // ✅ ESLint recommended rules

      // ✅ Jest-specific rules
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error'
    }
  }
]
