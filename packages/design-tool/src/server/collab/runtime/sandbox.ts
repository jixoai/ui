/**
 * @jixoai/ui-design (collab/runtime) — the QuickJS-WASM production
 * sandbox wrapper (collab-protocol M6; protocol-spec §7 沙箱, semantics
 * frozen by the ported probe `../p14-sandbox-wrapper.test.ts` — the
 * probe stays the behavioral truth, this module is the productized
 * isomorph the executor drives).
 *
 * P14 semantics, productized:
 *   - engine frozen to `quickjs-emscripten@0.32.0`'s
 *     `@jitl/quickjs-wasmfile-release-sync` variant (RELEASE_SYNC); the
 *     wasm blob resolves through the package exports' `./wasm`
 *     sub-export (a direct `dist/emscripten-module.wasm` path hits
 *     ERR_PACKAGE_PATH_NOT_EXPORTED) and its sha256 is a HARD GATE —
 *     drift FAILS {@link QuickJSSandbox.open} and must never be silenced
 *     by updating the constant (design.md 引擎钉死; re-run the p14 probe
 *     and update the pin deliberately).
 *   - the wrapper installs on the FRESH context before any guest code:
 *     `removeModuleLoader()`; `eval`/`Function`/`WebAssembly` and the
 *     plain/async/generator/async-generator function prototypes' and
 *     `Date.prototype`'s `constructor` set to non-configurable
 *     `undefined` (QuickJS has no "disable eval" engine switch — the
 *     wrapper is the fence); the native Date is never the wrapper's
 *     static prototype;
 *   - deterministic Date (a fixed epoch injected by the caller —
 *     admission supplies one) + Math.random as a seeded sequence +
 *     frozen Math;
 *   - budgets: memory 1 MiB / stack 256 KiB / an interrupt-handler
 *     instruction budget — overruns classify as `sandbox-limit`
 *     receipts (interrupt / memory / stack), never a hang or a crash;
 *   - async policy: controlled Promises + `executePendingJobs` —
 *     synchronous host callbacks, NO Asyncify/`evalCodeAsync`. Host
 *     functions run inside the guest's job pump; a host callback that
 *     re-enters guest evaluation is refused (`host-reentry` — §7 禁止
 *     host 回调重入同一 admission);
 *   - every handle the host creates is owned explicitly: the sandbox
 *     disposes eval results, host-function handles, deferred promises
 *     and settle values on ALL paths (success, guest error, limit
 *     overrun), and any use after {@link QuickJSSandbox.dispose}
 *     answers `disposed-handle`.
 *
 * Original need: collab-protocol M6 (2026-09-15).
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { getQuickJS } from 'quickjs-emscripten';
import type {
  QuickJSContext,
  QuickJSDeferredPromise,
  QuickJSHandle,
  QuickJSRuntime,
  QuickJSWASMModule,
} from 'quickjs-emscripten';

/* ── the pinned engine (design.md 引擎钉死) ────────────────────────────── */

export const PINNED_WASM_SHA256 = '105c3bed22d457e43e3d1c3c1c6959fda62a8fe06f0fc8a985303c3a2be72232';

/** the engine identity the script journal rows archive (§7 引擎版本) */
export const SANDBOX_ENGINE_IDENTITY = {
  package: 'quickjs-emscripten@0.32.0',
  variant: '@jitl/quickjs-wasmfile-release-sync',
  wasmSha256: PINNED_WASM_SHA256,
} as const;

const WASM_VARIANT_SPECIFIER = '@jitl/quickjs-wasmfile-release-sync/wasm';

/** resolve the variant's wasm blob through the package exports (`./wasm`) */
export function pinnedWasmPath(): string {
  const nodeRequire = createRequire(import.meta.url);
  return nodeRequire.resolve(WASM_VARIANT_SPECIFIER);
}

/**
 * The hard gate: sha256 the installed wasm and FAIL on drift. Drift is
 * an integrity failure, never a receipt to catch — a changed engine
 * invalidates the P14 escape-surface evidence wholesale.
 */
export function assertPinnedEngine(): { wasmPath: string; wasmSha256: string } {
  const wasmPath = pinnedWasmPath();
  const wasmSha256 = createHash('sha256').update(readFileSync(wasmPath)).digest('hex');
  if (wasmSha256 !== PINNED_WASM_SHA256) {
    throw new SandboxError(
      'wasm-hash-drift',
      `quickjs WASM sha256 drifted from the pinned engine: installed ${wasmSha256} != pinned ${PINNED_WASM_SHA256} (${wasmPath}) — re-run the p14 probe against the new engine and update the pin deliberately, never silently`,
    );
  }
  return { wasmPath, wasmSha256 };
}

/* ── typed failures ────────────────────────────────────────────────────── */

export const SANDBOX_ERROR_PREFIX = '[jixoai-collab-sandbox]';

/**
 * The sandbox's failure vocabulary. `sandbox-limit` is the §7 receipt
 * (budget overrun); `disposed-handle` is use-after-dispose; `wasm-hash-drift`
 * is the integrity gate; `host-reentry` is the admission re-entrancy
 * fence; `guest-error` is an uncaught guest exception (the message
 * carries the guest's own error dump).
 */
export type SandboxFailureCode = 'wasm-hash-drift' | 'sandbox-limit' | 'disposed-handle' | 'host-reentry' | 'guest-error' | 'internal';

export class SandboxError extends Error {
  readonly code: SandboxFailureCode;
  /** which budget tripped, when code is sandbox-limit */
  readonly limit?: 'interrupt' | 'memory' | 'stack';
  constructor(code: SandboxFailureCode, message: string, limit?: 'interrupt' | 'memory' | 'stack') {
    super(`${SANDBOX_ERROR_PREFIX} ${message}`);
    this.name = 'SandboxError';
    this.code = code;
    this.limit = limit;
  }
}

/* ── limits & determinism knobs ────────────────────────────────────────── */

/** v0 runtime ceiling (§7): memory 1 MiB, stack 256 KiB, interrupt budget */
export interface SandboxLimits {
  readonly memoryBytes: number;
  readonly maxStackBytes: number;
  /** how many interrupt-handler checks a run may consume (the instruction budget) */
  readonly interruptBudget: number;
  /** bound on the driver's job-pump iterations (a liveness backstop, also `sandbox-limit`) */
  readonly maxJobPumps: number;
}

export const DEFAULT_SANDBOX_LIMITS: SandboxLimits = {
  memoryBytes: 1024 * 1024,
  maxStackBytes: 256 * 1024,
  interruptBudget: 1500,
  maxJobPumps: 100_000,
};

export interface SandboxOptions {
  /** the deterministic Date epoch (ms) — admission injects a fixed value */
  readonly epoch?: number;
  /** the deterministic Math.random sequence (cycled when exhausted, then the last value) */
  readonly randomSequence?: readonly number[];
  readonly limits?: Partial<SandboxLimits>;
}

/* ── the wrapper (P14 verbatim semantics; parameterized epoch/seed) ────── */

function wrapperSource(epoch: number, randomSequence: readonly number[]): string {
  const seed = JSON.stringify([...randomSequence]);
  return `(function(){
  const NativeDate = Date;
  const epoch = ${String(epoch)};
  const seedSequence = ${seed};
  let randomIndex = 0;
  function DeterministicDate(...args) {
    if (new.target) return args.length === 0 ? new NativeDate(epoch) : new NativeDate(...args);
    return new NativeDate(epoch).toString();
  }
  DeterministicDate.prototype = NativeDate.prototype;
  Object.defineProperty(NativeDate.prototype, 'constructor', { value: undefined, writable: false, configurable: false });
  Object.defineProperty(DeterministicDate, 'parse', { value: NativeDate.parse, writable: false, configurable: false });
  Object.defineProperty(DeterministicDate, 'UTC', { value: NativeDate.UTC, writable: false, configurable: false });
  Object.defineProperty(DeterministicDate, 'now', { value: () => epoch, writable: false, configurable: false });
  Object.defineProperty(Math, 'random', { value: () => seedSequence[randomIndex++] ?? seedSequence[seedSequence.length - 1] ?? 0.5, writable: false, configurable: false });
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
})()`;
}

/* ── the result shapes ─────────────────────────────────────────────────── */

export interface SandboxEvalResult {
  readonly ok: boolean;
  readonly value?: unknown;
  /** the dumped guest error (`name`/`message`/`stack`) on failure */
  readonly error?: { readonly name?: string; readonly message?: string };
  /** set when the failure was a budget overrun */
  readonly limit?: 'interrupt' | 'memory' | 'stack';
  /** how many interrupt-handler checks the run consumed (evidence) */
  readonly interruptChecks: number;
}

/** the settle seam handed to a deferred host function (P14 controlled promise) */
export interface SandboxSettle {
  resolve(value: unknown): void;
  reject(error: string): void;
}

interface DeferredTask {
  readonly deferred: QuickJSDeferredPromise;
  settled: boolean;
}

/* ── the sandbox ───────────────────────────────────────────────────────── */

let sharedModule: Promise<QuickJSWASMModule> | undefined;

function quickjsModule(): Promise<QuickJSWASMModule> {
  sharedModule ??= getQuickJS();
  return sharedModule;
}

export class QuickJSSandbox {
  readonly #runtime: QuickJSRuntime;
  readonly #vm: QuickJSContext;
  readonly #limits: SandboxLimits;
  #interruptChecks = 0;
  #disposed = false;
  #inHostCall = false;
  readonly #hostHandles: QuickJSHandle[] = [];
  readonly #deferredTasks = new Set<DeferredTask>();

  private constructor(runtime: QuickJSRuntime, vm: QuickJSContext, options: SandboxOptions) {
    this.#runtime = runtime;
    this.#vm = vm;
    this.#limits = { ...DEFAULT_SANDBOX_LIMITS, ...options.limits };
    runtime.setMemoryLimit(this.#limits.memoryBytes);
    runtime.setMaxStackSize(this.#limits.maxStackBytes);
    runtime.setInterruptHandler(() => {
      this.#interruptChecks += 1;
      return this.#interruptChecks > this.#limits.interruptBudget;
    });
    runtime.removeModuleLoader();
    const wrapper = this.#evaluate(wrapperSource(options.epoch ?? 0, options.randomSequence ?? [0.125, 0.25, 0.5]));
    if (!wrapper.ok) {
      this.#disposeHandles();
      vm.dispose();
      runtime.dispose();
      throw new SandboxError('internal', `the sandbox wrapper failed to install: ${JSON.stringify(wrapper.error)}`);
    }
  }

  /**
   * Open a fresh sandbox. Verifies the pinned engine FIRST (the hard
   * gate throws on drift — never silenced), then builds the runtime,
   * context and wrapper.
   */
  static async open(options: SandboxOptions = {}): Promise<QuickJSSandbox> {
    assertPinnedEngine();
    const module = await quickjsModule();
    const runtime = module.newRuntime();
    const vm = runtime.newContext();
    return new QuickJSSandbox(runtime, vm, options);
  }

  get alive(): boolean {
    return !this.#disposed;
  }

  /** evidence for tests/receipts: interrupt-handler checks consumed so far */
  get interruptChecks(): number {
    return this.#interruptChecks;
  }

  get limits(): SandboxLimits {
    return this.#limits;
  }

  /* ── host function injection ─────────────────────────────────────────── */

  /**
   * Register one host function. Arguments arrive as guest values (the
   * sandbox dumps them — JSON-able guest data only, by contract); the
   * implementation returns `undefined | string | number | boolean`,
   * marshalled back into the guest. Functions that need deferred
   * settlement use {@link defineDeferredHostFunction} (P14 controlled
   * promise). RE-ENTRANCY: while a host callback runs, any guest
   * evaluation through this sandbox throws `host-reentry`.
   */
  defineHostFunction(name: string, impl: (...args: unknown[]) => unknown): void {
    this.#assertAlive();
    const handle = this.#vm.newFunction(name, (...args) => {
      if (this.#inHostCall) throw new SandboxError('host-reentry', `host function ${JSON.stringify(name)} re-entered guest evaluation inside an active host callback`);
      const values = args.map((arg) => this.#vm.dump(arg));
      this.#inHostCall = true;
      let result: unknown;
      try {
        result = impl(...values);
      } finally {
        this.#inHostCall = false;
      }
      return this.#marshalReturn(result);
    });
    this.#vm.setProp(this.#vm.global, name, handle);
    this.#hostHandles.push(handle); // owned until dispose — the guest may keep referencing it
  }

  /**
   * Register one host function whose settlement the driver resolves
   * BETWEEN job pumps: the impl receives the settle seam; calling
   * `resolve`/`reject` settles the guest-visible promise (a controlled
   * Promise — P14's async policy, no Asyncify). If the impl settles
   * synchronously the promise resolves before the first pump.
   */
  defineDeferredHostFunction(name: string, impl: (args: readonly unknown[], settle: SandboxSettle) => void): void {
    this.#assertAlive();
    const handle = this.#vm.newFunction(name, (...args) => {
      if (this.#inHostCall) throw new SandboxError('host-reentry', `deferred host function ${JSON.stringify(name)} re-entered guest evaluation inside an active host callback`);
      const values = args.map((arg) => this.#vm.dump(arg));
      const deferred = this.#vm.newPromise();
      const task: DeferredTask = { deferred, settled: false };
      this.#deferredTasks.add(task);
      const settle: SandboxSettle = {
        resolve: (value) => {
          if (task.settled || this.#disposed) return;
          task.settled = true;
          const marshalled = this.#marshalReturn(value);
          deferred.resolve(marshalled);
          marshalled.dispose();
        },
        reject: (error) => {
          if (task.settled || this.#disposed) return;
          task.settled = true;
          const marshalled = this.#vm.newString(String(error));
          deferred.reject(marshalled);
          marshalled.dispose();
        },
      };
      try {
        impl(values, settle);
      } catch (error) {
        settle.reject(error instanceof Error ? error.message : String(error));
      }
      // returning the handle transfers it to the guest (the P14 pattern);
      // our disposal duty stays on the deferred itself
      return deferred.handle;
    });
    this.#vm.setProp(this.#vm.global, name, handle);
    this.#hostHandles.push(handle);
  }

  #marshalReturn(value: unknown): QuickJSHandle {
    if (value === undefined) return this.#vm.undefined;
    if (typeof value === 'string') return this.#vm.newString(value);
    if (typeof value === 'number') return this.#vm.newNumber(value);
    if (typeof value === 'boolean') return value ? this.#vm.true : this.#vm.false;
    throw new SandboxError(
      'internal',
      `host functions may return undefined | string | number | boolean (JSON-able data by contract), got ${typeof value} — wrap structured results in a JSON string`,
    );
  }

  /* ── evaluation ──────────────────────────────────────────────────────── */

  /** raw one-shot evaluation, P14 style — handles owned and disposed here */
  #evaluate(code: string): SandboxEvalResult {
    const result = this.#vm.evalCode(code);
    const err = result.error;
    if (err !== undefined) {
      const error = this.#vm.dump(err);
      err.dispose();
      return { ok: false, error: error as { name?: string; message?: string }, interruptChecks: this.#interruptChecks };
    }
    const value = this.#vm.dump(result.value);
    result.value.dispose();
    return { ok: true, value, interruptChecks: this.#interruptChecks };
  }

  /**
   * Evaluate one guest expression/script (typically the wrapped async
   * orchestration script) and DRIVE it to settlement: `executePendingJobs`
   * pumps guest continuations synchronously while deferred host tasks
   * settle between pumps — the §7/P14 async policy. Budget overruns
   * classify as `sandbox-limit` with the `limit` field; uncaught guest
   * errors as `guest-error` with the dumped error. Every handle the run
   * mints is disposed on every path.
   */
  run(code: string): SandboxEvalResult {
    this.#assertAlive();
    if (this.#inHostCall) throw new SandboxError('host-reentry', 'run() called from inside a host callback');
    let result: ReturnType<QuickJSContext['evalCode']>;
    try {
      result = this.#vm.evalCode(code);
    } catch (error) {
      // interrupt/limit overruns surface as host-side throws from the ffi
      const classified = classifyHostThrow(error, this.#interruptChecks);
      this.#drainDeferredTasks();
      return { ok: false, error: { name: 'InternalError', message: classified.detail }, limit: classified.limit, interruptChecks: this.#interruptChecks };
    }
    const err = result.error;
    if (err !== undefined) {
      const error = this.#vm.dump(err) as { name?: string; message?: string };
      err.dispose();
      this.#drainDeferredTasks();
      const limit = classifyLimitError(error, this.#interruptChecks);
      if (limit !== undefined) return { ok: false, error, limit, interruptChecks: this.#interruptChecks };
      return { ok: false, error, interruptChecks: this.#interruptChecks };
    }
    // drive the (possibly async) top-level value to settlement
    const top = result.value;
    try {
      return this.#pumpUntilSettled(top);
    } finally {
      top.dispose();
    }
  }

  /** pump jobs + settle deferred host tasks until the top handle settles */
  #pumpUntilSettled(top: QuickJSHandle): SandboxEvalResult {
    let state = this.#vm.getPromiseState(top);
    let pumps = 0;
    while (state.type === 'pending') {
      pumps += 1;
      if (pumps > this.#limits.maxJobPumps) {
        this.#drainDeferredTasks();
        return { ok: false, error: { name: 'InternalError', message: 'sandbox-limit: job pump budget exhausted (script never settled)' }, limit: 'interrupt', interruptChecks: this.#interruptChecks };
      }
      const jobs = this.#runtime.executePendingJobs();
      const jobError = jobs.error;
      if (jobError !== undefined) {
        const error = this.#vm.dump(jobError) as { name?: string; message?: string };
        jobError.dispose();
        this.#drainDeferredTasks();
        const limit = classifyLimitError(error, this.#interruptChecks);
        if (limit !== undefined) return { ok: false, error, limit, interruptChecks: this.#interruptChecks };
        return { ok: false, error, interruptChecks: this.#interruptChecks };
      }
      this.#drainDeferredTasks();
      state = this.#vm.getPromiseState(top);
    }
    if (state.type === 'rejected') {
      const error = this.#vm.dump(state.error) as { name?: string; message?: string };
      state.error.dispose();
      // a budget overrun thrown inside the async script surfaces here as
      // the rejection's payload — classify it like a direct eval error
      const limit = classifyLimitError(error, this.#interruptChecks);
      if (limit !== undefined) return { ok: false, error, limit, interruptChecks: this.#interruptChecks };
      return { ok: false, error, interruptChecks: this.#interruptChecks };
    }
    // NOTE: a NON-promise top reports fulfilled with `value` BEING the
    // input handle (the library's notAPromise shape) — dumping is safe,
    // disposing is the caller's (run's finally) job, never ours here
    const notAPromise = (state as { notAPromise?: boolean }).notAPromise === true;
    const value = this.#vm.dump(state.value);
    if (!notAPromise) state.value.dispose();
    return { ok: true, value, interruptChecks: this.#interruptChecks };
  }

  /** release settled deferred tasks (resolve/reject already disposed the callbacks) */
  #drainDeferredTasks(): void {
    for (const task of this.#deferredTasks) {
      if (task.settled && task.deferred.alive) task.deferred.dispose();
    }
    for (const task of [...this.#deferredTasks]) {
      if (task.settled) this.#deferredTasks.delete(task);
    }
  }

  /* ── the P14 observation seam (tests + future tooling) ───────────────── */

  /**
   * The controlled-promise observation surface: the guest-side promise
   * state of a global the test pinned. Read-only; handles disposed here.
   */
  promiseStateOf(globalName: string): { type: 'pending' | 'fulfilled' | 'rejected' | 'missing'; value?: unknown; error?: unknown } {
    this.#assertAlive();
    const handle = this.#vm.getProp(this.#vm.global, globalName);
    try {
      const state = this.#vm.getPromiseState(handle);
      if (state.type === 'pending') return { type: 'pending' };
      if (state.type === 'rejected') {
        const error = this.#vm.dump(state.error);
        state.error.dispose();
        return { type: 'rejected', error };
      }
      const value = this.#vm.dump(state.value);
      state.value.dispose();
      return { type: 'fulfilled', value };
    } catch {
      return { type: 'missing' };
    } finally {
      handle.dispose();
    }
  }

  /** execute pending jobs once (the P14 observation primitive) */
  executePendingJobs(): number {
    this.#assertAlive();
    const jobs = this.#runtime.executePendingJobs();
    this.#drainDeferredTasks();
    const jobError = jobs.error;
    if (jobError !== undefined) {
      const error = this.#vm.dump(jobError) as { message?: string };
      jobError.dispose();
      throw new SandboxError('guest-error', `pending job threw: ${String(error.message)}`);
    }
    return jobs.value;
  }

  /* ── disposal ────────────────────────────────────────────────────────── */

  /**
   * Release everything the sandbox owns — host function handles, live
   * deferred promises, the context, the runtime — on ANY path. Further
   * use answers `disposed-handle`.
   */
  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#drainDeferredTasks();
    for (const task of this.#deferredTasks) {
      if (task.deferred.alive) task.deferred.dispose();
    }
    this.#deferredTasks.clear();
    this.#disposeHandles();
    this.#vm.dispose();
    this.#runtime.dispose();
  }

  #disposeHandles(): void {
    for (const handle of this.#hostHandles) {
      if (handle.alive) handle.dispose();
    }
    this.#hostHandles.length = 0;
  }

  #assertAlive(): void {
    if (this.#disposed) throw new SandboxError('disposed-handle', 'the sandbox has been disposed — every handle it minted is gone');
  }
}

/* ── limit classification ──────────────────────────────────────────────── */

function classifyLimitError(error: { name?: string; message?: string }, interruptChecks: number): 'interrupt' | 'memory' | 'stack' | undefined {
  const message = String(error.message ?? '');
  if (message === 'interrupted' && interruptChecks > 0) return 'interrupt';
  if (message.includes('stack overflow')) return 'stack';
  if (
    message.includes('string too long') ||
    message.includes('out of memory') ||
    message.includes('memory') ||
    message.includes('alloc')
  ) {
    return 'memory';
  }
  return undefined;
}

function classifyHostThrow(error: unknown, interruptChecks: number): { limit?: 'interrupt' | 'memory' | 'stack'; detail: string } {
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (interruptChecks > 0) return { limit: 'interrupt', detail };
  const probe = { name: undefined, message: error instanceof Error ? error.message : String(error) };
  const limit = classifyLimitError(probe, 0);
  return { limit, detail };
}
