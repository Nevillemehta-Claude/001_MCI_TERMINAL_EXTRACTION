// Type augmentation for test environment
// This allows vi.fn() to be assigned to global.fetch without TypeScript errors

declare global {
  // Override fetch to accept any type in tests (needed for vi.fn() mocks)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var fetch: any;
}

export {};
