/**
 * @jixoai/ui-design (collab/runtime) — the orchestration executor
 * (collab-protocol M6; protocol-spec §7 JS 编排运行时, semantics frozen
 * by the ported probes `../p18-executor.test.ts` (group/parallel) and
 * `../p14-sandbox-wrapper.test.ts` (the sandbox it drives) — the probes
 * stay the behavioral truth, this module is the productized isomorph).
 *
 * WHAT RUNS WHERE (D5): a script executes EXACTLY ONCE, on the
 * admitting device, inside one serialized exclusive section of the
 * admission gate (`gate.runExclusive`); everything synchronous — the
 * sandbox's host callbacks commit through the kernel transaction core
 * and the full §5 sequence, so a host callback can never re-enter the
 * admission chain (§7 禁止 host 回调重入同一 admission). What syncs
 * across devices is the accepted op-logs — the script itself is
 * archived as an INTENT artifact (`script` journal row: source + hash
 * + pinned engine identity + capability list) and is never re-executed.
 *
 * THE ctx API (v0.2 minimal shape, spec §7 pseudocode):
 *
 *   const hero = await ctx.component('a13');
 *   hero.text('title').at(0, 0).select(4).type('Ship');   // → #0:0 !4 Ship
 *   log('renamed hero title');
 *   await group({ deps: [hero.frontierAt('v-12')], fail: 'rollback' }, async () => {
 *     hero.prop('variant').replace('ghost');
 *     hero.prop('size').replace('lg');
 *   });
 *   await parallel([() => ctx.component('a14').prop('label').insert(0, 'New: '), ...]);
 *
 * Coordinate law (documented spec-blank decision): the ctx surface is
 * 0-BASED (`at(row, col)` with 0,0 = buffer start) — the 1-based
 * ROW:COL surface belongs to `cli update`'s line protocol (§10); both
 * count UTF-16 code units and both resolve against the CURRENT buffer
 * at the op's turn (the CLI's 针对该行执行前 law). `.replace(t)`
 * without a pending `.select(n)` replaces the WHOLE buffer (the
 * prop-replace idiom of the spec example); `.type(t)` without a select
 * inserts at the cursor.
 *
 * LANES:
 *  - top-level buffer ops flush at the next boundary (log/group/
 *    parallel/script end) through the FULL §5 single-op sequence
 *    (`gate.admitWithinTransaction`) — sequential, fail-stop on the
 *    first rejection (the receipt rides the script result);
 *  - `group({deps, fail}, fn)` — ONE candidate fork + the §7 Svelte
 *    compile gate + ONE commit (mixed tree/text share one
 *    transactionId / atomic receipt); `fail:'rollback'` discards the
 *    candidate with zero effect, `fail:'keep-partial'` commits per op
 *    with explicit per-op receipts;
 *  - `parallel([...])` — every branch submits through the same §5
 *    brain with the PARALLEL-START frontier as its base: non-overlapping
 *    branches auto-fuse, overlapping ones answer 409 conflict (P18's
 *    admission convergence, on the production gate);
 *  - `deps` guards (frontier reached / buffer expectation / target
 *    existence) run before the group; failure applies the strategy
 *    (nothing lands) and the `409 dep-unmet` receipt explains why.
 *
 * Original need: collab-protocol M6 (2026-09-15).
 */

import { createHash } from 'node:crypto';

import { AdmissionGate } from '../admission.ts';
import { bufferAnchor } from '../bridge.ts';
import { bufferKeyOf, CollabKernel, encodeContainerKey, type TransactionOp, type TransactionOpReceipt, type TransactionReceipts } from '../kernel.ts';
import type { AdmissionResult, Frontier, JournalTailEntry, OpEnvelope, SyncCursor, TextOpEnvelope, TreeOpEnvelope, TreeTarget } from '../types.ts';
import { isCommitReceipt } from '../types.ts';
import { transactionCompileGate } from './compile-gate.ts';
import { SANDBOX_ENGINE_IDENTITY, QuickJSSandbox, type SandboxLimits } from './sandbox.ts';

/* ── the public result envelope (§7 返回信封) ───────────────────────────── */

/** script-level failure codes (op-level adjudications ride `ops`/`transactions`) */
export type ScriptFailureCode = 'sandbox-limit' | 'guest-error' | 'op-rejected';

export interface UpdateJsResult {
  readonly status: 200 | 422;
  readonly scriptId: string;
  readonly actor: string;
  /** present on 422 — the script-level failure */
  readonly code?: ScriptFailureCode;
  /** present on 422 — the failure detail (the guest's own error dump for guest-error) */
  readonly detail?: string;
  /** the guest's captured log(...) lines, in order */
  readonly logs: readonly string[];
  /** group transactions (accepted AND rejected), in execution order */
  readonly transactions: readonly TransactionReceipts[];
  /** top-level + parallel-branch op receipts, in execution order */
  readonly ops: readonly TransactionOpReceipt[];
  /** the §5.6-normalized canonical increment for the caller's syncCursor */
  readonly update?: Uint8Array;
  readonly syncCursor?: SyncCursor;
  /** per-touched-component journal tail-5 (the 目标 log 增量) */
  readonly logTail: readonly JournalTailEntry[];
}

export interface RunOrchestrationOptions {
  readonly actor: string;
  /** deterministic-clock knobs (admission injects; defaults: epoch 0, [0.125, 0.25, 0.5]) */
  readonly epoch?: number;
  readonly randomSequence?: readonly number[];
  readonly limits?: Partial<SandboxLimits>;
  /** frontier dep labels — `hero.frontierAt('v-12')` resolves through this map */
  readonly frontierLabels?: Readonly<Record<string, Frontier>>;
  readonly syncCursor?: SyncCursor;
}

/* ── the guest kit (ctx API surface, guest-side builder) ───────────────── */

const GUEST_KIT = `
(function(){
  const pending = [];
  function JxBuffer(componentId, buffer) {
    this.componentId = componentId;
    this.buffer = buffer;
    this.ops = [];
    this.pendingSelect = undefined;
  }
  JxBuffer.prototype.at = function(row, col) {
    this.ops.push(['#', row, col]); this.pendingSelect = undefined; return this;
  };
  JxBuffer.prototype.insert = function(off, text) {
    this.ops.push(['@', off]); this.ops.push(['+', text]); return this;
  };
  JxBuffer.prototype.select = function(n) {
    this.pendingSelect = n; return this;
  };
  JxBuffer.prototype.type = function(text) {
    if (this.pendingSelect !== undefined) this.ops.push(['!', this.pendingSelect, text]);
    else this.ops.push(['+', text]);
    this.pendingSelect = undefined; return this;
  };
  JxBuffer.prototype.replace = function(text) {
    this.ops.push(['!', this.pendingSelect === undefined ? 'ALL' : this.pendingSelect, text]);
    this.pendingSelect = undefined; return this;
  };
  function makeComponent(id) {
    return {
      text: function(name) { const b = new JxBuffer(id, name); pending.push(b); return b; },
      prop: function(name) { const b = new JxBuffer(id, name); pending.push(b); return b; },
      frontierAt: function(fid) { return { kind: 'frontier', componentId: id, fid: String(fid) }; }
    };
  }
  // §11: tree ops ride update-js (the line lane carries text only) —
  // buffered exactly like text records, committed through the group lane
  const treeApi = {
    insert: function(componentId, item, parentId, index) {
      pending.push({ __tree: true, kind: 'insert', componentId: componentId, item: item, parentId: parentId, index: index });
    },
    move: function(componentId, newParentId, index) {
      pending.push({ __tree: true, kind: 'move', componentId: componentId, newParentId: newParentId, index: index });
    },
    remove: function(componentId) {
      pending.push({ __tree: true, kind: 'remove', componentId: componentId });
    },
    revive: function(componentId, parentId, index) {
      pending.push({ __tree: true, kind: 'revive', componentId: componentId, parentId: parentId, index: index });
    },
    update: function(componentId, item) {
      pending.push({ __tree: true, kind: 'update', componentId: componentId, item: item });
    }
  };
  globalThis.ctx = { component: makeComponent, tree: treeApi };
  globalThis.log = function() {
    __jx_flush();
    const parts = [];
    for (let i = 0; i < arguments.length; i++) {
      const v = arguments[i];
      parts.push(typeof v === 'string' ? v : JSON.stringify(v));
    }
    __jx_host_log(parts.join(' '));
  };
  function takePending() { const out = pending.slice(); pending.length = 0; return out; }
  globalThis.group = async function(opts, fn) {
    __jx_flush();
    const fail = (opts && opts.fail) ? opts.fail : 'rollback';
    const deps = (opts && opts.deps) ? opts.deps : [];
    if (typeof fn === 'function') { const r = fn(); if (r && typeof r.then === 'function') await r; }
    const buffers = takePending();
    return JSON.parse(await __jx_host_group(fail, JSON.stringify(deps), JSON.stringify(buffers)));
  };
  globalThis.parallel = async function(branches) {
    __jx_flush();
    const collected = [];
    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];
      pending.length = 0;
      if (typeof branch === 'function') { const r = branch(); if (r && typeof r.then === 'function') await r; }
      collected.push(takePending());
    }
    return JSON.parse(await __jx_host_parallel(JSON.stringify(collected)));
  };
  globalThis.__jx_flush = function() {
    const buffers = takePending();
    if (buffers.length === 0) return;
    const status = __jx_host_apply(JSON.stringify(buffers));
    if (status !== 'ok') throw new Error('op-rejected ' + status);
  };
})();
`;

/* ── op-record conversion (the ctx vocabulary → kernel-form plans) ─────── */

/** one guest buffer record (post JSON round-trip) */
interface BufferRecord {
  readonly componentId: string;
  readonly buffer: string;
  readonly ops: readonly unknown[];
}

/** one guest tree record (§11 — tree ops ride update-js, buffered like text) */
interface TreeRecord {
  readonly __tree: true;
  readonly kind: 'insert' | 'move' | 'remove' | 'revive' | 'update';
  readonly componentId: string;
  readonly item?: unknown;
  readonly parentId?: string;
  readonly newParentId?: string;
  readonly index?: number;
}

type GuestRecord = BufferRecord | TreeRecord;

function isTreeRecord(record: unknown): record is TreeRecord {
  return (
    typeof record === 'object' &&
    record !== null &&
    (record as { __tree?: unknown }).__tree === true &&
    typeof (record as { componentId?: unknown }).componentId === 'string'
  );
}

/** one buffered tree record → its §4 envelope shape (validated lightly) */
function treeRecordToOp(record: TreeRecord, opId: string, actor: string, base: Frontier, mintError: (message: string) => ConversionError): { envelope: TreeOpEnvelope; target: TreeTarget } {
  const bad = (message: string): ConversionError => mintError(message);
  const index = record.index === null || record.index === undefined ? undefined : record.index;
  if (index !== undefined && (typeof index !== 'number' || !Number.isInteger(index) || index < 0)) throw bad(`tree ${record.kind} index must be a non-negative integer`);
  const parent = (value: unknown): string | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value !== 'string' || value.length === 0) throw bad(`tree ${record.kind} parent id must be a non-empty string`);
    return value;
  };
  const target: TreeTarget = { componentId: record.componentId };
  if (record.kind === 'insert') {
    if (record.item === undefined) throw bad('tree insert needs its item payload');
    return {
      envelope: { actor, opId, baseFrontiers: base, domain: 'tree', kind: 'insert', target, tree: { item: record.item, parentComponentId: parent(record.parentId), index } },
      target,
    };
  }
  if (record.kind === 'move') {
    return {
      envelope: { actor, opId, baseFrontiers: base, domain: 'tree', kind: 'move', target, tree: { componentId: record.componentId, newParentId: parent(record.newParentId), index } },
      target,
    };
  }
  if (record.kind === 'remove') {
    return { envelope: { actor, opId, baseFrontiers: base, domain: 'tree', kind: 'remove', target, tree: { componentId: record.componentId } }, target };
  }
  if (record.kind === 'revive') {
    return {
      envelope: { actor, opId, baseFrontiers: base, domain: 'tree', kind: 'revive', target, tree: { componentId: record.componentId, parentComponentId: parent(record.parentId), index } },
      target,
    };
  }
  if (record.kind === 'update') {
    if (record.item === undefined) throw bad('tree update needs its item payload');
    return { envelope: { actor, opId, baseFrontiers: base, domain: 'tree', kind: 'update', target, tree: { componentId: record.componentId, item: record.item } }, target };
  }
  throw bad(`unknown tree op kind ${JSON.stringify(record.kind)}`);
}

/** the conversion failure — a script bug or a UTF-16 boundary violation */
class ConversionError extends Error {
  readonly code: 'malformed-script-op' | 'utf16-boundary';
  constructor(code: 'malformed-script-op' | 'utf16-boundary', message: string) {
    super(message);
    this.name = 'ConversionError';
    this.code = code;
  }
}

/** the fail-stop marker a top-level op rejection raises into the guest */
class HostAbort extends Error {
  readonly detail: string;
  constructor(detail: string) {
    super('op-rejected');
    this.name = 'HostAbort';
    this.detail = detail;
  }
}

const isHigh = (code: number): boolean => code >= 0xd800 && code <= 0xdbff;
const isLow = (code: number): boolean => code >= 0xdc00 && code <= 0xdfff;

function splitsSurrogateAt(text: string, position: number): boolean {
  return position > 0 && position < text.length && isHigh(text.charCodeAt(position - 1)) && isLow(text.charCodeAt(position));
}

/** 0-based row/col → UTF-16 offset on `text` (the ctx coordinate law) */
function offsetAtRowCol(text: string, row: number, col: number): number {
  if (!Number.isInteger(row) || row < 0 || !Number.isInteger(col) || col < 0) {
    throw new ConversionError('malformed-script-op', `at(${String(row)}, ${String(col)}) — row/col must be non-negative integers`);
  }
  const lines = text.split('\n');
  if (row >= lines.length) throw new ConversionError('malformed-script-op', `at(${String(row)}, ${String(col)}) — row outside the ${String(lines.length)}-line buffer`);
  const line = lines[row]!;
  if (col > line.length) throw new ConversionError('malformed-script-op', `at(${String(row)}, ${String(col)}) — column outside row ${String(row)} (${String(line.length)} units)`);
  let offset = col;
  for (let i = 0; i < row; i += 1) offset += lines[i]!.length + 1;
  if (splitsSurrogateAt(text, offset)) {
    throw new ConversionError('utf16-boundary', `cursor at ${String(row)}:${String(col)} (offset ${String(offset)}) splits a surrogate pair`);
  }
  return offset;
}

/**
 * The working-string simulation shared by every lane: resolve one
 * record's vocabulary ops against the buffer text the op SEES at its
 * turn (the CLI law), tracking the record's cursor, and emit kernel-
 * form op plans. `state.textOf` seeds each container's working text
 * (canonical NOW for the top-level/group lanes; the PARALLEL-START
 * texts for a parallel branch — branches are concurrent and must not
 * see each other's not-yet-admitted edits).
 */
interface SimulationState {
  readonly textOf: (containerKey: string) => string;
  readonly texts: Map<string, string>;
  readonly cursors: Map<string, number>;
}

function convertRecord(record: BufferRecord, state: SimulationState, mintOpId: () => string, emit: (op: TransactionOp) => void): void {
  if (typeof record?.componentId !== 'string' || record.componentId.length === 0 || typeof record?.buffer !== 'string' || record.buffer.length === 0) {
    throw new ConversionError('malformed-script-op', 'a buffer record needs non-empty componentId and buffer');
  }
  const containerKey = encodeContainerKey(record.componentId, bufferKeyOf(record.buffer));
  const recordKey = `${record.componentId}\u0000${record.buffer}`;
  if (!state.texts.has(containerKey)) state.texts.set(containerKey, state.textOf(containerKey));
  if (!state.cursors.has(recordKey)) state.cursors.set(recordKey, 0);
  for (const raw of record.ops) {
    if (!Array.isArray(raw) || raw.length < 2) throw new ConversionError('malformed-script-op', `op ${JSON.stringify(raw)} is not a vocabulary tuple`);
    const kind = raw[0];
    let text = state.texts.get(containerKey)!;
    if (kind === '#') {
      const [, row, col] = raw as [string, unknown, unknown];
      if (typeof row !== 'number' || typeof col !== 'number') throw new ConversionError('malformed-script-op', 'at(row, col) needs numeric row/col');
      state.cursors.set(recordKey, offsetAtRowCol(text, row, col));
      continue;
    }
    if (kind === '@') {
      const [, off] = raw as [string, unknown];
      if (typeof off !== 'number' || !Number.isInteger(off) || off < 0) throw new ConversionError('malformed-script-op', 'insert(off, …) needs a non-negative integer offset');
      if (off > text.length) throw new ConversionError('malformed-script-op', `insert offset ${String(off)} exceeds the ${String(text.length)}-unit buffer`);
      if (splitsSurrogateAt(text, off)) throw new ConversionError('utf16-boundary', `insert offset ${String(off)} splits a surrogate pair`);
      state.cursors.set(recordKey, off);
      continue;
    }
    const cursor = state.cursors.get(recordKey) ?? 0;
    if (kind === '+') {
      const [, inserted] = raw as [string, unknown];
      if (typeof inserted !== 'string') throw new ConversionError('malformed-script-op', 'type/insert text must be a string');
      if (splitsSurrogateAt(text, cursor)) throw new ConversionError('utf16-boundary', `insert at offset ${String(cursor)} splits a surrogate pair`);
      emit({
        domain: 'text',
        kind: 'insert',
        opId: mintOpId(),
        target: { componentId: record.componentId, buffer: record.buffer },
        containerKey,
        offset: cursor,
        length: 0,
        text: inserted,
        expectedBefore: text,
      });
      text = text.slice(0, cursor) + inserted + text.slice(cursor);
      state.cursors.set(recordKey, cursor + inserted.length);
      state.texts.set(containerKey, text);
      continue;
    }
    if (kind === '!') {
      const [, extent, replacement] = raw as [string, unknown, unknown];
      if (typeof replacement !== 'string') throw new ConversionError('malformed-script-op', 'replace text must be a string');
      const n = extent === 'ALL' ? text.length : extent;
      if (typeof n !== 'number' || !Number.isInteger(n) || n < 0) throw new ConversionError('malformed-script-op', 'select(n)/!n needs a non-negative integer');
      if (cursor + n > text.length) throw new ConversionError('malformed-script-op', `replace of ${String(n)} units at offset ${String(cursor)} exceeds the ${String(text.length)}-unit buffer`);
      if (n > 0 && (splitsSurrogateAt(text, cursor) || splitsSurrogateAt(text, cursor + n))) {
        throw new ConversionError('utf16-boundary', `replace range [${String(cursor)}, ${String(cursor + n)}) splits a surrogate pair`);
      }
      emit({
        domain: 'text',
        kind: 'replace',
        opId: mintOpId(),
        target: { componentId: record.componentId, buffer: record.buffer },
        containerKey,
        offset: cursor,
        length: n,
        text: replacement,
        expectedBefore: text,
      });
      text = text.slice(0, cursor) + replacement + text.slice(cursor + n);
      state.cursors.set(recordKey, cursor + replacement.length);
      state.texts.set(containerKey, text);
      continue;
    }
    throw new ConversionError('malformed-script-op', `unknown vocabulary op ${JSON.stringify(kind)}`);
  }
}

/* ── journal-derived id minters ────────────────────────────────────────── */

function actorOpMinter(kernel: CollabKernel, actor: string, scriptId: string): { nextOpId: () => string; nextTransactionId: () => string } {
  const prefix = `${actor}:`;
  let max = 0;
  for (const entry of kernel.journalEntries()) {
    if (entry.type !== 'commit' && entry.type !== 'rejection') continue;
    if (!entry.opId.startsWith(prefix)) continue;
    const suffix = entry.opId.slice(prefix.length);
    if (/^\d+$/.test(suffix)) max = Math.max(max, Number(suffix));
  }
  const txPrefix = `tx:${scriptId}:`;
  let txMax = 0;
  for (const entry of kernel.journalEntries()) {
    if (entry.type !== 'commit' && entry.type !== 'rejection') continue;
    // commits carry the transactionId; tx-level rejections key it as their opId
    const txSource = entry.type === 'commit' ? entry.transactionId : entry.opId;
    if (txSource === undefined || !txSource.startsWith(txPrefix)) continue;
    const suffix = txSource.slice(txPrefix.length);
    if (/^\d+$/.test(suffix)) txMax = Math.max(txMax, Number(suffix));
  }
  return {
    nextOpId: () => `${actor}:${(max += 1)}`,
    nextTransactionId: () => `tx:${scriptId}:${(txMax += 1)}`,
  };
}

function scriptIdFor(kernel: CollabKernel, actor: string): string {
  const prefix = `${actor}:js:`;
  let max = 0;
  for (const entry of kernel.journalEntries()) {
    if (entry.type !== 'script') continue;
    if (!entry.scriptId.startsWith(prefix)) continue;
    const suffix = entry.scriptId.slice(prefix.length);
    if (/^\d+$/.test(suffix)) max = Math.max(max, Number(suffix));
  }
  return `${actor}:js:${max + 1}`;
}

/** the guest-safe receipt summary (bytes stripped — envelopes carry them) */
function guestSummary(receipts: TransactionReceipts): string {
  return JSON.stringify({
    transactionId: receipts.transactionId,
    status: receipts.status,
    strategy: receipts.strategy,
    receipts: receipts.receipts,
    diagnostics: receipts.diagnostics,
    effects: receipts.effects,
    touched: receipts.touched,
  });
}

/* ── the host callback context (one script run) ────────────────────────── */

interface HostContext {
  readonly kernel: CollabKernel;
  readonly gate: AdmissionGate;
  readonly actor: string;
  readonly minters: { nextOpId: () => string; nextTransactionId: () => string };
  readonly frontierLabels: Readonly<Record<string, Frontier>>;
  readonly logs: string[];
  readonly transactions: TransactionReceipts[];
  readonly ops: TransactionOpReceipt[];
  readonly touched: Set<string>;
}

/**
 * The §4 envelope for one top-level/parallel text op (the full §5 lane).
 * `anchorBytes` overrides the anchor encoder — the parallel lane mints
 * its anchors at the PARALLEL-START version (concurrent clients share
 * that base; an anchor encoded on later canonical can attach to items
 * the base never saw and would stop resolving there).
 */
function envelopeFor(kernel: CollabKernel, ctx: HostContext, op: Extract<TransactionOp, { domain: 'text' }>, base: Frontier, anchorBytes?: Uint8Array): TextOpEnvelope {
  return {
    actor: ctx.actor,
    opId: op.opId,
    baseFrontiers: base,
    domain: 'text',
    kind: op.kind,
    target: { componentId: op.target.componentId, buffer: op.target.buffer },
    cursorBytes: anchorBytes ?? bufferAnchor(kernel, op.target.componentId, op.target.buffer, op.offset),
    offset: op.offset,
    length: op.kind === 'insert' ? 0 : op.length,
    text: op.text,
    timestamp: Date.now(),
  };
}

function opReceiptOf(result: AdmissionResult): TransactionOpReceipt {
  if (isCommitReceipt(result)) return { opId: result.opId, status: 'accepted' };
  return { opId: result.opId, status: 'rejected', code: result.code, error: result.detail };
}

/** the deps guard (§7): undefined = every dep holds, else the failure detail */
function depsFailure(kernel: CollabKernel, labels: Readonly<Record<string, Frontier>>, deps: readonly unknown[]): string | undefined {
  for (const dep of deps) {
    if (typeof dep !== 'object' || dep === null || typeof (dep as { kind?: unknown }).kind !== 'string') {
      return `dep ${JSON.stringify(dep)} is not a descriptor object`;
    }
    const descriptor = dep as { kind: string; componentId?: unknown; fid?: unknown; buffer?: unknown; expected?: unknown };
    if (descriptor.kind === 'frontier') {
      if (typeof descriptor.fid !== 'string') return `frontier dep needs a string fid, got ${JSON.stringify(descriptor.fid)}`;
      const named = labels[descriptor.fid];
      if (named === undefined) return `frontier label ${JSON.stringify(descriptor.fid)} is unknown to this admission (pass it via RunOrchestrationOptions.frontierLabels)`;
      let relation: -1 | 0 | 1 | undefined;
      try {
        relation = kernel.cmpFrontiers(named, kernel.frontiers());
      } catch {
        return `frontier label ${JSON.stringify(descriptor.fid)} is unknown or pruned on canonical`;
      }
      if (relation !== -1 && relation !== 0) return `frontier ${JSON.stringify(descriptor.fid)} not yet reached on canonical`;
      continue;
    }
    if (descriptor.kind === 'buffer') {
      if (typeof descriptor.componentId !== 'string' || typeof descriptor.buffer !== 'string' || typeof descriptor.expected !== 'string') {
        return 'buffer dep needs componentId, buffer and expected strings';
      }
      const containerKey = encodeContainerKey(descriptor.componentId, bufferKeyOf(descriptor.buffer));
      if (!kernel.hasBuffer(containerKey)) return `buffer ${descriptor.componentId}:${descriptor.buffer} does not exist`;
      if (kernel.bufferText(containerKey) !== descriptor.expected) {
        return `buffer ${descriptor.componentId}:${descriptor.buffer} holds ${JSON.stringify(kernel.bufferText(containerKey))}, dep expected ${JSON.stringify(descriptor.expected)}`;
      }
      continue;
    }
    if (descriptor.kind === 'exists') {
      if (typeof descriptor.componentId !== 'string') return 'exists dep needs a componentId string';
      const treeNodeId = kernel.treeNodeOf(descriptor.componentId);
      if (treeNodeId === undefined || kernel.isTreeNodeDeleted(treeNodeId)) return `component ${descriptor.componentId} does not exist (or is a tombstone)`;
      continue;
    }
    return `unknown dep kind ${JSON.stringify(descriptor.kind)} (frontier | buffer | exists)`;
  }
  return undefined;
}

/** journal one transaction-lane rejection under the tx id (audit + durable marker) */
function journalTxRejection(kernel: CollabKernel, ctx: HostContext, transactionId: string, status: 409 | 422, code: 'dep-unmet' | 'utf16-boundary' | 'bad-target', detail: string): void {
  kernel.recordRejection(
    { opId: `tx:${transactionId}`, actor: ctx.actor, target: { componentId: 'ctx' } },
    {
      opId: `tx:${transactionId}`,
      status,
      code,
      actor: ctx.actor,
      target: { componentId: 'ctx' },
      canonicalFrontier: kernel.frontiers(),
      canonicalUpdate: undefined,
      syncCursor: undefined,
      retry: undefined,
      conflict: undefined,
      range: undefined,
      detail,
      serverAdmissionTime: Date.now(),
    },
  );
}

/** register the host functions on the sandbox (the whole ctx surface) */
function installHostFunctions(sandbox: QuickJSSandbox, ctx: HostContext): void {
  const { kernel, gate } = ctx;

  sandbox.defineHostFunction('__jx_host_log', (message) => {
    if (typeof message === 'string') ctx.logs.push(message);
    return 'ok';
  });

  // top-level lane: sequential full-§5 admissions, fail-stop on first rejection
  sandbox.defineHostFunction('__jx_host_apply', (buffersJson) => {
    if (typeof buffersJson !== 'string') return `rejected:${JSON.stringify({ code: 'guest-error', error: 'internal: apply payload is not a string' })}`;
    let records: GuestRecord[];
    try {
      records = JSON.parse(buffersJson) as GuestRecord[];
    } catch (error) {
      return `rejected:${JSON.stringify({ code: 'guest-error', error: `unparsable op payload: ${String(error)}` })}`;
    }
    const state: SimulationState = { textOf: (key) => kernel.bufferText(key), texts: new Map(), cursors: new Map() };
    try {
      for (const record of records) {
        if (isTreeRecord(record)) {
          const { envelope } = treeRecordToOp(record, ctx.minters.nextOpId(), ctx.actor, kernel.frontiers(), (message) => new ConversionError('malformed-script-op', message));
          const result = gate.admitWithinTransaction(envelope);
          ctx.ops.push(opReceiptOf(result));
          ctx.touched.add(record.componentId);
          if (!isCommitReceipt(result)) {
            throw new HostAbort(JSON.stringify({ opId: result.opId, code: result.code, error: result.detail }));
          }
          continue;
        }
        if (!Array.isArray(record?.ops) || record.ops.length === 0) continue;
        convertRecord(record, state, ctx.minters.nextOpId, (op) => {
          if (op.domain !== 'text') return;
          const envelope = envelopeFor(kernel, ctx, op, kernel.frontiers());
          const result = gate.admitWithinTransaction(envelope);
          ctx.ops.push(opReceiptOf(result));
          ctx.touched.add(op.target.componentId);
          if (!isCommitReceipt(result)) {
            throw new HostAbort(JSON.stringify({ opId: result.opId, code: result.code, error: result.detail }));
          }
        });
      }
    } catch (error) {
      if (error instanceof HostAbort) return `rejected:${error.detail}`;
      const detail = error instanceof Error ? error.message : String(error);
      return `rejected:${JSON.stringify({ code: error instanceof ConversionError ? error.code : 'guest-error', error: detail })}`;
    }
    return 'ok';
  });

  // the group lane — deps guard, then the kernel transaction core
  sandbox.defineHostFunction('__jx_host_group', (fail, depsJson, buffersJson) => {
    const strategy = fail === 'keep-partial' ? 'keep-partial' : 'rollback';
    const transactionId = ctx.minters.nextTransactionId();
    let deps: readonly unknown[] = [];
    try {
      deps = typeof depsJson === 'string' ? (JSON.parse(depsJson) as unknown[]) : [];
    } catch {
      deps = [{ kind: 'unparsable' }]; // fails the guard below with a named reason
    }
    const unmet = depsFailure(kernel, ctx.frontierLabels, deps);
    if (unmet !== undefined) {
      const receipts: TransactionReceipts = {
        transactionId,
        status: 'rejected',
        strategy,
        receipts: [],
        diagnostics: `dep-unmet: ${unmet}`,
        effects: 0,
        touched: [],
      };
      journalTxRejection(kernel, ctx, transactionId, 409, 'dep-unmet', `deps guard failed, nothing landed: ${unmet}`);
      ctx.transactions.push(receipts);
      return guestSummary(receipts);
    }
    let records: GuestRecord[] = [];
    try {
      records = typeof buffersJson === 'string' ? (JSON.parse(buffersJson) as GuestRecord[]) : [];
    } catch {
      records = [];
    }
    const ops: TransactionOp[] = [];
    const state: SimulationState = { textOf: (key) => kernel.bufferText(key), texts: new Map(), cursors: new Map() };
    let conversion: ConversionError | undefined;
    try {
      for (const record of records) {
        if (isTreeRecord(record)) {
          const built = treeRecordToOp(record, ctx.minters.nextOpId(), ctx.actor, kernel.frontiers(), (message) => new ConversionError('malformed-script-op', message));
          ops.push({ domain: 'tree', opId: built.envelope.opId, target: built.target, envelope: built.envelope });
          continue;
        }
        if (!Array.isArray(record?.ops) || record.ops.length === 0) continue;
        convertRecord(record, state, ctx.minters.nextOpId, (op) => ops.push(op));
      }
    } catch (error) {
      if (!(error instanceof ConversionError)) throw error;
      conversion = error;
    }
    if (conversion !== undefined) {
      const receipts: TransactionReceipts = {
        transactionId,
        status: 'rejected',
        strategy,
        receipts: [],
        diagnostics: `${conversion.code}: ${conversion.message}`,
        effects: 0,
        touched: [],
      };
      journalTxRejection(
        kernel,
        ctx,
        transactionId,
        422,
        conversion.code === 'utf16-boundary' ? 'utf16-boundary' : 'bad-target',
        `script op conversion failed, nothing landed: ${conversion.message}`,
      );
      ctx.transactions.push(receipts);
      return guestSummary(receipts);
    }
    if (ops.length === 0) {
      // an empty group is trivially accepted — nothing to gate, nothing to commit
      const receipts: TransactionReceipts = { transactionId, status: 'accepted', strategy, receipts: [], effects: 0, touched: [] };
      ctx.transactions.push(receipts);
      return guestSummary(receipts);
    }
    const receipts = kernel.commitTransaction({
      ops,
      transactionId,
      actor: ctx.actor,
      peer: kernel.peerOf(ctx.actor),
      strategy,
      compileGate: transactionCompileGate,
      timestamp: Date.now(),
    });
    ctx.transactions.push(receipts);
    for (const componentId of receipts.touched) ctx.touched.add(componentId);
    for (const receipt of receipts.receipts) ctx.ops.push(receipt);
    return guestSummary(receipts);
  });

  // the parallel lane — branches submit with the PARALLEL-START base
  sandbox.defineHostFunction('__jx_host_parallel', (branchesJson) => {
    const transactionId = ctx.minters.nextTransactionId();
    let branches: GuestRecord[][];
    try {
      branches = typeof branchesJson === 'string' ? (JSON.parse(branchesJson) as GuestRecord[][]) : [];
    } catch {
      branches = [];
    }
    const parallelStart = kernel.frontiers();
    const startTexts = new Map<string, string>();
    const branchOps: TransactionOp[][] = [];
    let failure: ConversionError | undefined;
    for (const branch of branches) {
      const state: SimulationState = {
        textOf: (key) => {
          if (!startTexts.has(key)) startTexts.set(key, kernel.bufferText(key));
          return startTexts.get(key)!;
        },
        texts: new Map(),
        cursors: new Map(),
      };
      const ops: TransactionOp[] = [];
      if (failure === undefined) {
        try {
          for (const record of branch) {
            // v0.2: parallel branches carry text ops — tree records are
            // silently ignored here (they ride groups/top-level; §11)
            if (isTreeRecord(record)) continue;
            if (!Array.isArray(record?.ops) || record.ops.length === 0) continue;
            convertRecord(record, state, ctx.minters.nextOpId, (op) => ops.push(op));
          }
        } catch (error) {
          if (error instanceof ConversionError) failure = error;
        }
      }
      branchOps.push(ops);
    }
    if (failure !== undefined) {
      const receipts: TransactionReceipts = {
        transactionId,
        status: 'rejected',
        strategy: 'parallel',
        receipts: [],
        diagnostics: `${failure.code}: ${failure.message}`,
        effects: 0,
        touched: [],
      };
      ctx.transactions.push(receipts);
      return guestSummary(receipts);
    }
    // submit every branch's ops sequentially through the FULL §5 brain,
    // each branch's FIRST op carrying the parallel-start base and an
    // anchor minted AT THAT VERSION — the concurrency contract:
    // non-overlap fuses, overlap 409s (P18)
    const baseView = kernel.versionView(parallelStart);
    const receipts: TransactionOpReceipt[] = [];
    for (const ops of branchOps) {
      let branchBase = parallelStart;
      for (const op of ops) {
        if (op.domain !== 'text') continue; // v0.2 parallel branches carry text ops; tree ops ride groups
        const anchor = baseView.cursorAt(op.containerKey, op.offset);
        if (anchor === undefined) {
          // the op's position does not exist at the shared base — it
          // cannot join the concurrency contract as-is
          receipts.push({ opId: op.opId, status: 'rejected', code: 'stale-cursor', error: `cannot anchor at offset ${String(op.offset)} of ${op.containerKey} at the parallel-start version` });
          ctx.touched.add(op.target.componentId);
          continue;
        }
        const envelope: OpEnvelope = { ...envelopeFor(kernel, ctx, op, branchBase, anchor), transactionId };
        const result = gate.admitWithinTransaction(envelope);
        receipts.push(opReceiptOf(result));
        ctx.touched.add(op.target.componentId);
        branchBase = kernel.frontiers(); // within a branch, later ops are sequential
      }
    }
    const status: TransactionReceipts['status'] =
      receipts.length === 0 || receipts.every((receipt) => receipt.status === 'accepted')
        ? 'accepted'
        : receipts.every((receipt) => receipt.status === 'rejected')
          ? 'rejected'
          : 'partial';
    const summary: TransactionReceipts = {
      transactionId,
      status,
      strategy: 'parallel',
      receipts,
      effects: receipts.filter((receipt) => receipt.status === 'accepted').length,
      frontier: kernel.frontiers(),
      touched: [...ctx.touched],
    };
    ctx.transactions.push(summary);
    for (const receipt of receipts) ctx.ops.push(receipt);
    return guestSummary(summary);
  });
}

/* ── the entry point ───────────────────────────────────────────────────── */

/**
 * Run one orchestration script (`cli update-js` / future MCP surface):
 * archive the intent artifact, open the pinned-engine sandbox, drive the
 * script inside the gate's exclusive section, and answer the §7 return
 * envelope (captured logs + op receipts + the touched components'
 * journal tail-5 + the caller's canonical increment). Script-level
 * failures (`sandbox-limit` / `guest-error` / `op-rejected`) answer 422
 * with everything the script managed to land BEFORE the failure — those
 * effects are durable (sequential lanes; a group either landed whole or
 * not at all).
 */
export async function runOrchestration(gate: AdmissionGate, script: string, options: RunOrchestrationOptions): Promise<UpdateJsResult> {
  const kernel = gate.kernel;
  if (typeof options.actor !== 'string' || options.actor.length === 0) throw new TypeError('runOrchestration requires a non-empty actor');
  if (typeof script !== 'string') throw new TypeError('runOrchestration requires a string script');

  const scriptId = scriptIdFor(kernel, options.actor);
  kernel.recordScriptArtifact({
    scriptId,
    actor: options.actor,
    source: script,
    sourceHash: createHash('sha256').update(script).digest('hex'),
    engine: SANDBOX_ENGINE_IDENTITY,
    capabilities: [
      'ctx.component',
      'ctx.component.text',
      'ctx.component.prop',
      'ctx.component.frontierAt',
      'ctx.tree.insert',
      'ctx.tree.move',
      'ctx.tree.remove',
      'ctx.tree.revive',
      'ctx.tree.update',
      'buffer.at',
      'buffer.select',
      'buffer.type',
      'buffer.insert',
      'buffer.replace',
      'group',
      'parallel',
      'log',
    ],
  });

  const sandbox = await QuickJSSandbox.open({ epoch: options.epoch, randomSequence: options.randomSequence, limits: options.limits });
  const ctx: HostContext = {
    kernel,
    gate,
    actor: options.actor,
    minters: actorOpMinter(kernel, options.actor, scriptId),
    frontierLabels: options.frontierLabels ?? {},
    logs: [],
    transactions: [],
    ops: [],
    touched: new Set<string>(),
  };
  installHostFunctions(sandbox, ctx);

  const outcome = await gate.runExclusive(() => {
    // the trailing flush lands everything the script buffered after its
    // last boundary (top-level ops flush at log/group/parallel/END) —
    // even on a guest throw, authored-before-failure ops keep (the
    // CLI lane's 成功行保留 spirit); the ORIGINAL error still wins the
    // result unless the flush itself is what failed
    const result = sandbox.run(
      `${GUEST_KIT}\n;(async () => {\n  let __jx_err;\n  try {\n${script}\n  } catch (e) { __jx_err = e; }\n  try { __jx_flush(); } catch (e) { if (!__jx_err) __jx_err = e; }\n  if (__jx_err) throw __jx_err;\n})()`,
    );
    sandbox.dispose();
    // the tail view of every touched component (the 目标 log 增量, tail-5)
    const logTail: JournalTailEntry[] = [];
    for (const componentId of ctx.touched) logTail.push(...kernel.tailFor(componentId));
    if (result.ok) {
      const exported = kernel.exportFor(options.syncCursor);
      return {
        status: 200 as const,
        scriptId,
        actor: options.actor,
        logs: [...ctx.logs],
        transactions: [...ctx.transactions],
        ops: [...ctx.ops],
        update: exported.update,
        syncCursor: exported.syncCursor,
        logTail,
      };
    }
    const message = String(result.error?.message ?? 'unknown guest failure');
    const opRejected = message.startsWith('op-rejected ');
    const detail = opRejected ? message.slice('op-rejected '.length) : `${String(result.error?.name ?? 'Error')}: ${message}`;
    return {
      status: 422 as const,
      scriptId,
      actor: options.actor,
      code: (result.limit !== undefined ? 'sandbox-limit' : opRejected ? 'op-rejected' : 'guest-error') as ScriptFailureCode,
      detail:
        result.limit !== undefined
          ? `sandbox-limit (${result.limit}): ${message} [interruptChecks=${String(result.interruptChecks)}]`
          : detail,
      logs: [...ctx.logs],
      transactions: [...ctx.transactions],
      ops: [...ctx.ops],
      logTail,
    };
  });
  return outcome;
}
