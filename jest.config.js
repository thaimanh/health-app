module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  rootDir: './',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    'node_modules',
    'dist',
    'src/server.ts', // Server startup logic doesn't need test coverage
    'src/app.ts', // App initialization
    'src/config/index.ts', // Config loading
    'src/prisma-client.ts', // Prisma client instantiation
    'src/api/v1/index.ts', // Route aggregation
    'src/api/index.ts',
    'src/types/',
  ],
  // Coverage thresholds (4.8)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
