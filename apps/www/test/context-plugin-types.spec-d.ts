/*
 * The kernel's type-level negative probes (context-plugin-v2 task 2.5,
 * 2026-09-03): D1's compile-error locks — a wrong-typed hook, a
 * read-only target, a dual target, an inline def literal, and a
 * hand-written brand are ALL compile errors. Runs under
 * `vitest --typecheck` (spec-d carrier, ignoreSourceErrors).
 */
import { expectTypeOf, test } from 'vitest';
import {
  defineContextDef,
  definePlugin,
  type ContextDef,
  type DefValue,
  type ReadOnlyContextDef,
} from '../src/lib/context-plugin.svelte';
import { MEDIUM_DEF, type MediumState } from '../src/lib/medium.svelte';
import { HUE_DEF } from '../src/lib/hue-runtime.svelte';

// The kernel's TYPE-level lock (context-plugin-v2 task 2.5, 2026-09-03)
// — D1's negative probes. Every @ts-expect-error below must stay
// consumed (an unused directive fails the file, the shiki-lib
// precedent): the hook types flow from the def's value domain, the
// read-only def is rejected as a target, the single-element tuple law
// holds, and an inline def literal (the forgotten-import mistake) is
// a compile error — never a silent dead target.

const PROBE_DEF = defineContextDef({ key: 'probe', defaults: () => 'p', ssrSafe: 'p' });

test('DefValue extracts the def value domain — the only hook type source', () => {
  expectTypeOf<DefValue<typeof HUE_DEF>>().toEqualTypeOf<number>();
  expectTypeOf<DefValue<typeof MEDIUM_DEF>>().toEqualTypeOf<MediumState>();
  expectTypeOf<DefValue<typeof PROBE_DEF>>().toEqualTypeOf<string>();
});

test('hooks typed from the def: the hue domain is number, end to end', () => {
  definePlugin({
    name: 'ok-hue',
    targets: [HUE_DEF],
    before: (v, _env) => {
      expectTypeOf(v).toEqualTypeOf<number>();
      return v + 1;
    },
    after: (v, _env) => v,
    filter: (def, _env) => def.key === 'hue',
    init: (def) => {
      expectTypeOf(def).toEqualTypeOf<typeof HUE_DEF>();
      return (defaults) => defaults;
    },
  });
});

test('negative lanes — every probe below is a compile error', () => {
  // @ts-expect-error before's value type comes from the def — a string hook on the hue domain is a lie
  definePlugin({ name: 'x', targets: [HUE_DEF], before: (v: string) => v.length });

  // @ts-expect-error the medium def is read-only — targets is the rejection lane (MediumTargetRejected arms)
  definePlugin({ name: 'x', targets: [MEDIUM_DEF] });

  // @ts-expect-error one plugin one def — the single-element tuple law
  definePlugin({ name: 'x', targets: [HUE_DEF, PROBE_DEF] });

  definePlugin({
    name: 'x',
    // @ts-expect-error an inline def literal carries no brand — a dead target at compile time, not a silent one
    targets: [{ key: 'density', defaults: () => 'sm', ssrSafe: 'default' }],
  });

  // @ts-expect-error ContextDef is a factory product — the brand cannot be hand-written
  const forged: ContextDef<'x', number> = { key: 'x', defaults: () => 0, ssrSafe: 0 };
  void forged;
});

test('the read-only marker survives the declared annotation (no widening)', () => {
  // [S1] the MEDIUM_DEF annotation must stay the factory's return
  // type — a plain ContextDef annotation would erase this branch and
  // defuse definePlugin's rejection lane
  expectTypeOf(MEDIUM_DEF).toEqualTypeOf<ReadOnlyContextDef<'medium', MediumState>>();
  expectTypeOf(HUE_DEF).toEqualTypeOf<ContextDef<'hue', number>>();
});
