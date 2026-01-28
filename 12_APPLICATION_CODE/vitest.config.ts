/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'node_modules/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        'dist/',
        // Entry point - not unit testable
        'src/client/main.tsx',
        'src/server/lib/**',
        'src/server/index.ts',
      ],
      // Coverage thresholds - IRONCLAD standard
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
      },
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    // Ensure test isolation
    isolate: true,
    // Retry flaky tests once
    retry: 1,
    // Report slow tests
    slowTestThreshold: 1000,
  },
});
