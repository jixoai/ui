/**
 * sandbox.test.ts — the production sandbox wrapper's escape surface
 * (collab-protocol M6; protocol-spec §7 沙箱). The behavioral truth
 * stays the ported probe `../p14-sandbox-wrapper.test.ts`; these tests
 * pin the PRODUCTIZED isomorph (`runtime/sandbox.ts`): the pinned
 * engine gate, the wrapper's dynamic-code fence, deterministic
 * Date/Math, controlled promises + executePendingJobs, explicit
 * disposal (`disposed-handle`), the budget receipts (`sandbox-limit`),
 * and the host-reentry fence.
 *
 * Original need: collab-protocol M6 (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

import { assertPinnedEngine, PINNED_WASM_SHA256, QuickJSSandbox, SANDBOX_ENGINE_IDENTITY, SandboxError } from './sandbox.ts';

/** raw P14-style evaluation on a sandbox — for the escape-surface asserts */
function evaluate(sandbox: QuickJSSandbox, code: string): { ok: boolean; value?: unknown; error?: unknown } {
  // run() drives promises; for plain expressions the settled value is
  // the expression result, errors come back classified
  const result = sandbox.run(code);
  return { ok: result.ok, value: result.value, error: result.error };
}

test('sandbox: the pinned engine gate holds and open() reports the engine identity', async () => {
  const { wasmPath, wasmSha256 } = assertPinnedEngine();
  const nodeRequire = createRequire(import.meta.url);
  assert.equal(wasmPath, nodeRequire.resolve('@jitl/quickjs-wasmfile-release-sync/wasm'), 'the wasm resolves through the package exports ./wasm sub-export');
  assert.equal(
    createHash('sha256').update(readFileSync(wasmPath)).digest('hex'),
    PINNED_WASM_SHA256,
    'the installed wasm hashes to the pin — drift must fail assertPinnedEngine, never silently pass',
  );
  const sandbox = await QuickJSSandbox.open();
  try {
    assert.equal(SANDBOX_ENGINE_IDENTITY.package, 'quickjs-emscripten@0.32.0');
    assert.equal(SANDBOX_ENGINE_IDENTITY.variant, '@jitl/quickjs-wasmfile-release-sync');
    assert.equal(SANDBOX_ENGINE_IDENTITY.wasmSha256, PINNED_WASM_SHA256);
    assert.equal(sandbox.limits.memoryBytes, 1024 * 1024, 'v0 memory ceiling (§7)');
    assert.equal(sandbox.limits.maxStackBytes, 256 * 1024, 'v0 stack ceiling (§7)');
    assert.equal(sandbox.limits.interruptBudget, 1500, 'v0 interrupt instruction budget');
  } finally {
    sandbox.dispose();
  }
});

test('sandbox: the wrapper installs and Date/Math are deterministic', async () => {
  const sandbox = await QuickJSSandbox.open({ epoch: 1700000000000, randomSequence: [0.125, 0.25, 0.5] });
  try {
    const deterministic = evaluate(sandbox, '[Date.now(), new Date().getTime(), Math.random(), Math.random(), Math.random()]');
    assert.ok(deterministic.ok, 'the deterministic probe must evaluate');
    assert.deepEqual(deterministic.value, [1700000000000, 1700000000000, 0.125, 0.25, 0.5]);

    const epochOverride = evaluate(sandbox, 'String(new Date())');
    assert.ok(epochOverride.ok && String(epochOverride.value).includes('2023'), 'the guest Date stringifies the fixed epoch');

    const dateEscape = evaluate(sandbox, '[typeof Date.prototype.constructor, typeof Object.getPrototypeOf(Date).now, typeof new Date().constructor]');
    assert.ok(dateEscape.ok);
    assert.deepEqual(dateEscape.value, ['undefined', 'undefined', 'undefined'], 'Date prototype/static constructor must not expose the native clock');
  } finally {
    sandbox.dispose();
  }
});

test('sandbox: dynamic-code escape surface is blocked (P14 alignment)', async () => {
  const sandbox = await QuickJSSandbox.open();
  try {
    const surface = evaluate(
      sandbox,
      '[typeof eval, typeof Function, typeof WebAssembly, typeof (() => {}).constructor, typeof (async function() {}).constructor, typeof (function*() {}).constructor, typeof (async function*() {}).constructor]',
    );
    assert.ok(surface.ok);
    assert.deepEqual(
      surface.value,
      ['undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined'],
      'eval/Function/WebAssembly and every function-flavor prototype constructor are gone',
    );

    const evalAttempt = evaluate(sandbox, 'eval("6 * 7")');
    assert.ok(!evalAttempt.ok && (evalAttempt.error as { name?: string }).name === 'TypeError', 'direct eval must fail');

    const constructorAttempt = evaluate(sandbox, '({}).constructor.constructor("return 42")()');
    assert.ok(!constructorAttempt.ok && (constructorAttempt.error as { name?: string }).name === 'TypeError', 'prototype constructor escape must fail');

    const moduleAttempt = evaluate(sandbox, 'import x from "not-available"; x');
    assert.ok(
      !moduleAttempt.ok && String((moduleAttempt.error as { message?: string }).message).includes('could not load module'),
      'the module loader is removed',
    );
  } finally {
    sandbox.dispose();
  }
});

test('sandbox: host functions marshal JSON-able values both ways', async () => {
  const sandbox = await QuickJSSandbox.open();
  try {
    sandbox.defineHostFunction('echo', (...args) => JSON.stringify(args));
    const result = evaluate(sandbox, 'echo(1, "x", [1,2], {a:1}, true)');
    assert.ok(result.ok);
    assert.deepEqual(JSON.parse(String(result.value)), [1, 'x', [1, 2], { a: 1 }, true]);
  } finally {
    sandbox.dispose();
  }
});

test('sandbox: controlled promises settle through executePendingJobs with observable state', async () => {
  const sandbox = await QuickJSSandbox.open();
  try {
    let seam: { resolve(value: unknown): void } | undefined;
    sandbox.defineDeferredHostFunction('pending', (_args, s) => {
      seam = s;
    });
    // a LATER host callback settles the controlled promise — the P14
    // shape (host settles between guest steps; no Asyncify anywhere)
    sandbox.defineHostFunction('release', () => {
      seam?.resolve(8);
      return 'released';
    });
    const result = sandbox.run('(async () => { const p = pending(); release(); const v = await p; return "got:" + v; })()');
    assert.equal(result.ok, true, 'the async script settles');
    assert.equal(result.value, 'got:8', 'the deferred host value rides the controlled promise');
  } finally {
    sandbox.dispose();
  }
});

test('sandbox: deferred host rejection surfaces as a guest rejection', async () => {
  const sandbox = await QuickJSSandbox.open();
  try {
    sandbox.defineDeferredHostFunction('boom', (_args, seam) => {
      seam.reject('host said no');
    });
    const result = sandbox.run('(async () => { try { await boom(); return "nope"; } catch (e) { return "caught:" + e; } })()');
    assert.equal(result.ok, true);
    assert.equal(result.value, 'caught:host said no');
  } finally {
    sandbox.dispose();
  }
});

test('sandbox: dispose is explicit and use-after-dispose answers disposed-handle', async () => {
  const sandbox = await QuickJSSandbox.open();
  sandbox.defineHostFunction('probe', () => 'ok');
  assert.equal(sandbox.alive, true);
  sandbox.dispose();
  assert.equal(sandbox.alive, false);
  let code: string | undefined;
  try {
    sandbox.run('1 + 1');
  } catch (error) {
    code = error instanceof SandboxError ? error.code : undefined;
  }
  assert.equal(code, 'disposed-handle', 'a disposed sandbox refuses further evaluation');
  sandbox.dispose(); // idempotent
});

test('sandbox: the interrupt budget stops an infinite loop as sandbox-limit', async () => {
  const sandbox = await QuickJSSandbox.open();
  try {
    const result = sandbox.run('(function loop(){ while (true) {} })()');
    assert.ok(!result.ok, 'the loop must not hang');
    assert.equal(result.error?.name, 'InternalError');
    assert.ok(sandbox.interruptChecks > 0, 'the interrupt handler fired');
  } finally {
    sandbox.dispose();
  }
  // the classified receipt shape the executor maps onto `sandbox-limit`
  const sandbox2 = await QuickJSSandbox.open();
  try {
    const result = sandbox2.run('(function loop(){ while (true) {} })()');
    assert.ok(!result.ok && result.limit === 'interrupt', 'the overrun classifies as sandbox-limit(interrupt)');
  } finally {
    sandbox2.dispose();
  }
});

test('sandbox: the memory ceiling classifies as sandbox-limit(memory)', async () => {
  const sandbox = await QuickJSSandbox.open();
  try {
    const result = sandbox.run('let a = "x"; for (let i = 0; i < 40; i++) { a = a + a + a; } a.length');
    assert.ok(!result.ok, 'the allocation must fail under 1 MiB');
    assert.equal(result.limit, 'memory');
  } finally {
    sandbox.dispose();
  }
});

test('sandbox: a stack overflow classifies as sandbox-limit(stack)', async () => {
  const sandbox = await QuickJSSandbox.open();
  try {
    const result = sandbox.run('(function f(n){ return f(n + 1); })(0)');
    assert.ok(!result.ok);
    assert.equal(result.limit, 'stack');
  } finally {
    sandbox.dispose();
  }
});

test('sandbox: host callbacks cannot re-enter guest evaluation', async () => {
  const sandbox = await QuickJSSandbox.open();
  try {
    sandbox.defineHostFunction('reenter', () => {
      return sandbox.run('1 + 1') as unknown as string;
    });
    const result = sandbox.run('reenter()');
    assert.ok(!result.ok, 'the re-entry must surface as a guest exception');
    assert.ok(String(result.error?.message).includes('inside a host callback'), `the failure names the fence (got ${JSON.stringify(result.error?.message)})`);
  } finally {
    sandbox.dispose();
  }
});
