import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  // [...]
  preset: 'ts-jest',
  extensionsToTreatAsEsm: ['.ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/__test__/**/*.test.ts',
    '<rootDir>/__test__/*.test.ts',
  ]
}

export default jestConfig;