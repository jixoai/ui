/**
 * p8-sandbox-review.test.ts — lab probe p8-sandbox-review port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p8-sandbox-review.mjs`.
 * Port deviation: none (quickjs-emscripten is a pinned dependency).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { getQuickJS } from 'quickjs-emscripten';

import { finish } from './lab-helpers.ts';

test('p8-sandbox-review', async () => {
  const QuickJS = await getQuickJS();
  const runtime = QuickJS.newRuntime();
  runtime.setMemoryLimit(512 * 1024);
  runtime.setMaxStackSize(128 * 1024);
  let interruptChecks = 0;
  runtime.setInterruptHandler(() => interruptChecks++ > 1000);
  const vm = runtime.newContext();

  let emitted = 0;
  const emit = vm.newFunction('emit', (value) => {
    emitted += vm.getNumber(value);
    return vm.undefined;
  });
  vm.setProp(vm.global, 'emit', emit);
  emit.dispose();

  const run = (code: string): { ok: boolean; value?: unknown; error?: unknown } => {
    const result = vm.evalCode(code);
    if ('error' in result) {
      const error = vm.dump(result.error);
      result.error.dispose();
      return { ok: false, error };
    }
    const value = vm.dump(result.value);
    result.value.dispose();
    return { ok: true, value };
  };

  const injected = run('emit(7); 35 + 7');
  assert.ok(
    injected.ok && injected.value === 42 && emitted === 7,
    'injected capability did not run in QuickJS',
  );
  const blocked = run(
    'typeof process + ":" + typeof require + ":" + typeof fetch + ":" + typeof Date.now + ":" + typeof Math.random',
  );
  assert.ok(
    blocked.ok && blocked.value === 'undefined:undefined:undefined:function:function',
    `unexpected ambient globals: ${String(blocked.value)}`,
  );
  const escapeSurface = run(
    '[typeof eval, typeof Function, typeof WebAssembly, eval("6 * 7"), Function("return 6 * 7")()]',
  );
  assert.ok(
    escapeSurface.ok &&
      JSON.stringify(escapeSurface.value) === JSON.stringify(['function', 'function', 'undefined', 42, 42]),
    'unexpected dynamic-code escape surface',
  );
  const timedOut = run('(function loop(){ while (true) {} })()');
  assert.ok(!timedOut.ok && interruptChecks > 0, 'interrupt handler did not stop an infinite loop');

  vm.dispose();
  runtime.dispose();
  finish('p8-sandbox-review', {
    package: 'quickjs-emscripten',
    capabilities: { injectedFunction: injected, ambientGlobals: blocked.value, escapeSurface: escapeSurface.value, infiniteLoop: timedOut.error },
    limits: { memoryBytes: 512 * 1024, maxStackBytes: 128 * 1024, interruptChecks },
    conclusion: 'QuickJS-WASM exposes the required host injection and runtime limits, but the spec must define handle ownership, async policy, and an explicit wrapper that omits Date/Math entropy rather than merely observing host defaults.',
  });
});
