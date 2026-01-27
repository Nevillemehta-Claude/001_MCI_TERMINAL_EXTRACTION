/**
 * Stryker Mutation Testing Configuration
 *
 * NOTE: Requires vitest >= 2.0.0. Upgrade vitest to enable mutation testing:
 *   npm install vitest@latest @stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker
 *   npm run test:mutation
 *
 * Mutation testing verifies test quality by introducing bugs (mutations)
 * and checking if tests catch them.
 */

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'vitest',
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  mutate: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
    '!src/test/**',
  ],
  reporters: ['progress', 'html', 'clear-text'],
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
  concurrency: 4,
  timeoutMS: 60000,
  ignorePatterns: [
    'node_modules',
    'dist',
    'e2e',
    'playwright-report',
  ],
};
