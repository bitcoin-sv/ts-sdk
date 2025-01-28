/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["dist/"],
  moduleDirectories: ["node_modules", "src"],
  collectCoverageFrom: ["src/**/*.ts"],
};
