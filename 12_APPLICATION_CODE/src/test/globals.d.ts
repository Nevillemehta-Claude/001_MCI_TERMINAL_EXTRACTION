// Type augmentation for test environment
// This allows vi.fn() to be assigned to global.fetch without TypeScript errors

import { Mock } from 'vitest';

declare global {
  // Override fetch to accept Mock type in tests
  var fetch: typeof globalThis.fetch | Mock<any, any>;
}

export {};
