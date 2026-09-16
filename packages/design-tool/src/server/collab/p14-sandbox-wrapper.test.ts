/**
 * p14-sandbox-wrapper.test.ts — lab probe p14-sandbox-wrapper port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p14-sandbox-wrapper.mjs`.
 * Port deviation: none in sandbox semantics. The lab only reported the
 * WASM sha256; per the M0 port brief the hash is now a hard gate — a drift
 * from the pinned engine FAILS this test and must never be silenced by
 * updating the constant (collab-protocol design.md 引擎钉死). The wasm
 * path resolves through the package install layout via the variant's
 * `./wasm` export (the lab used a node_modules-relative file URL).
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { getQuickJS } from 'quickjs-emscripten';

import { finish } from './lab-helpers.ts';

const PINNED_WASM_SHA256 =
  '105c3bed22d457e43e3d1c3c1c6959fda62a8fe06f0fc8a985303c3a2be72232';

test('p14-sandbox-wrapper', async () => {
  const nodeRequire = createRequire(import.meta.url);
  const wasmPath = nodeRequire.resolve('@jitl/quickjs-wasmfile-release-sync/wasm');
  const wasmSha256 = createHash('sha256').update(readFileSync(wasmPath)).digest('hex');
  assert.equal(
    wasmSha256,
    PINNED_WASM_SHA256,
    'quickjs WASM sha256 drifted from the pinned engine (design.md 引擎钉死) — re-run the p14 probe against the new engine and update the pin deliberately, never silently',
  );

  const QuickJS = await getQuickJS();
  const runtime = QuickJS.newRuntime();
  runtime.setMemoryLimit(1024 * 1024);
  runtime.setMaxStackSize(256 * 1024);
  let interruptChecks = 0;
  runtime.setInterruptHandler(() => interruptChecks++ > 1500);
  runtime.removeModuleLoader();
  const vm = runtime.newContext();

  function evaluate(code: string): { ok: boolean; value?: unknown; error?: unknown } {
    const result = vm.evalCode(code);
    if ('error' in result) {
      const error = vm.dump(result.error);
      result.error.dispose();
      return { ok: false, error };
    }
    const value = vm.dump(result.value);
    result.value.dispose();
    return { ok: true, value };
  }

  const wrapper = evaluate(`(function(){
  const NativeDate = Date;
  const epoch = 1700000000000;
  function DeterministicDate(...args) {
    if (new.target) return args.length === 0 ? new NativeDate(epoch) : new NativeDate(...args);
    return new NativeDate(epoch).toString();
  }
  DeterministicDate.prototype = NativeDate.prototype;
  Object.defineProperty(NativeDate.prototype, 'constructor', { value: undefined, writable: false, configurable: false });
  Object.defineProperty(DeterministicDate, 'parse', { value: NativeDate.parse, writable: false, configurable: false });
  Object.defineProperty(DeterministicDate, 'UTC', { value: NativeDate.UTC, writable: false, configurable: false });
  Object.defineProperty(DeterministicDate, 'now', { value: () => epoch, writable: false, configurable: false });
  let randomIndex = 0;
  Object.defineProperty(Math, 'random', { value: () => [0.125, 0.25, 0.5][randomIndex++] ?? 0.5, writable: false, configurable: false });
  Object.freeze(Math);
  Object.defineProperty(globalThis, 'Date', { value: DeterministicDate, writable: false, configurable: false });
  const functionPrototypes = [
    Object.getPrototypeOf(function() {}),
    Object.getPrototypeOf(async function() {}),
    Object.getPrototypeOf(function*() {}),
    Object.getPrototypeOf(async function*() {}),
  ];
  for (const prototype of functionPrototypes) Object.defineProperty(prototype, 'constructor', { value: undefined, writable: false, configurable: false });
  for (const name of ['eval', 'Function', 'WebAssembly']) Object.defineProperty(globalThis, name, { value: undefined, writable: false, configurable: false });
})()`);
  assert.ok(wrapper.ok, 'sandbox wrapper must install');

  const deterministic = evaluate('[Date.now(), new Date().getTime(), Math.random(), Math.random(), Math.random()]');
  assert.ok(
    deterministic.ok &&
      JSON.stringify(deterministic.value) === JSON.stringify([1700000000000, 1700000000000, 0.125, 0.25, 0.5]),
    'Date/Math sequence must be deterministic',
  );
  const dateEscape = evaluate("[typeof Date.prototype.constructor, typeof Object.getPrototypeOf(Date).now, typeof new Date().constructor]");
  assert.ok(
    dateEscape.ok &&
      JSON.stringify(dateEscape.value) === JSON.stringify(['undefined', 'undefined', 'undefined']),
    'Date prototype/static constructor must not expose native clock',
  );
  const escapeSurface = evaluate('[typeof eval, typeof Function, typeof WebAssembly, typeof (() => {}).constructor, typeof (async function() {}).constructor, typeof (function*() {}).constructor, typeof (async function*() {}).constructor]');
  assert.ok(
    escapeSurface.ok &&
      JSON.stringify(escapeSurface.value) === JSON.stringify(['undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined']),
    'dynamic-code constructors must be blocked',
  );
  const evalAttempt = evaluate('eval("6 * 7")');
  assert.ok(
    !(evalAttempt as { ok: boolean }).ok && (evalAttempt.error as { name?: string }).name === 'TypeError',
    'direct eval must fail',
  );
  const constructorAttempt = evaluate('({}).constructor.constructor("return 42")()');
  assert.ok(
    !(constructorAttempt as { ok: boolean }).ok &&
      (constructorAttempt.error as { name?: string }).name === 'TypeError',
    'prototype constructor escape must fail',
  );
  const moduleAttempt = evaluate('import x from "not-available"; x');
  assert.ok(
    !(moduleAttempt as { ok: boolean }).ok &&
      ((moduleAttempt.error as { message?: string }).message ?? '').includes('could not load module'),
    'module loader must be disabled',
  );

  const deferred = vm.newPromise();
  vm.setProp(vm.global, 'pending', deferred.handle);
  const pendingResult = vm.evalCode('pending.then(value => value + 1)');
  assert.ok('value' in pendingResult, 'controlled promise must return a guest handle');
  const promiseHandle = (pendingResult as { value: ReturnType<typeof vm.unwrapValue> }).value;
  const number = vm.newNumber(8);
  deferred.resolve(number);
  number.dispose();
  const jobs = runtime.executePendingJobs();
  assert.ok('value' in jobs && (jobs as { value: number }).value >= 1, 'executePendingJobs must settle controlled promise');
  const promiseState = vm.getPromiseState(promiseHandle as never);
  assert.ok(
    promiseState.type === 'fulfilled' && vm.getNumber((promiseState as { value: unknown }).value as never) === 9,
    'controlled promise result must be observable',
  );
  (promiseState as { value: { dispose(): void } }).value.dispose();
  (promiseHandle as { dispose(): void }).dispose();
  assert.ok(deferred.alive, 'deferred remains owned until explicit disposal');
  deferred.dispose();
  assert.ok(!deferred.alive, 'deferred dispose must release promise handles');
  const functionHandle = vm.newFunction('controlled', () => vm.undefined);
  assert.ok(functionHandle.alive, 'host function handle must start alive');
  functionHandle.dispose();
  let functionUseAfterDispose: string | undefined;
  try {
    void (functionHandle as { value: unknown }).value;
  } catch (error) {
    functionUseAfterDispose = String(error);
  }
  assert.ok(
    !functionHandle.alive && functionUseAfterDispose?.includes('Lifetime not alive'),
    'disposed host function must reject use-after-free',
  );

  const timedOut = evaluate('(function loop(){ while (true) {} })()');
  assert.ok(
    !(timedOut as { ok: boolean }).ok &&
      (timedOut.error as { name?: string }).name === 'InternalError' &&
      interruptChecks > 0,
    'interrupt budget must stop an infinite loop',
  );

  vm.dispose();
  runtime.dispose();
  finish('p14-sandbox-wrapper', {
    package: 'quickjs-emscripten@0.32.0',
    variant: 'RELEASE_SYNC',
    wasm: { path: wasmPath, sha256: wasmSha256, pinnedSha256: PINNED_WASM_SHA256, hashGate: 'asserted (drift fails the test)' },
    wrapper: { deterministic, dateEscape, escapeSurface, directEval: evalAttempt.error, constructorEscape: constructorAttempt.error, moduleLoader: moduleAttempt.error },
    async: { strategy: 'controlled Promise + executePendingJobs; no Asyncify/evalCodeAsync in v0', jobs: (jobs as { value: number }).value, settled: promiseState.type, disposed: { promise: !deferred.alive, function: !functionHandle.alive, useAfterDispose: functionUseAfterDispose } },
    limits: { memoryBytes: 1024 * 1024, maxStackBytes: 256 * 1024, interruptChecks, timeout: timedOut.error },
    policy: 'wrapper-level intrinsic removal plus frozen deterministic Date/Math; host handles are owned and disposed explicitly',
  });
});
