import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // The vite build()/createServer() integration tests are heavyweight;
    // give them room without masking real hangs.
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
