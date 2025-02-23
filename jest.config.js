module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      isolatedModules: true, // any other ts-jest configuration
    }],
  },
  testMatch: [
    "**/?(*.)+(spec|test).ts" // Match test files only
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/src/index.ts" // Exclude index.ts from being tested
  ],
};
