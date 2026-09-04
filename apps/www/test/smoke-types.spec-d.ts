import { expectTypeOf, test } from 'vitest';

// 1.0 typecheck-carrier smoke (context-defaults-economy): proves the
// vitest --typecheck channel runs; 1.1's defaults-types.spec-d.ts
// carries the real fixture.
test('the typecheck carrier is live', () => {
  expectTypeOf(1).toBeNumber();
  expectTypeOf<unknown>().not.toBeNever();
});
