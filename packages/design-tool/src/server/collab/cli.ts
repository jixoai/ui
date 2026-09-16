/**
 * @jixoai/ui-design (collab) — the CLI face, initial four commands
 * (collab-protocol M6; protocol-spec §10, line-protocol rules frozen by
 * the ported probes `./p20-cli-parser.test.ts` (update) and
 * `./p16-sync-log.test.ts` (sync/log data basis) — the probes stay the
 * behavioral truth, this module is the productized isomorph).
 *
 *   update <target> LINE-BY-LINE-PATCH   # 行式 op（文本 only, §11）
 *   update-js <script>                   # 编排脚本（QuickJS-WASM 执行器）
 *   sync [component]                     # 游标增量 + tail-5 摘要
 *   log <component>                      # 详情（git log 心智）
 *
 * `cli update` FROZEN RULES (§10, P20 semantics productized): each line
 * carries exactly ONE complete token (`#ROW:COL` / `+TEXT` / `-n` /
 * `!n TEXT`); NO trim (inserted/replaced text keeps its spaces and
 * empty lines verbatim); ROW/COL are 1-BASED and resolve against the
 * buffer as it stands BEFORE that line executes; columns, `n` and all
 * offsets count UTF-16 CODE UNITS (newline = one unit); a cursor or
 * affected range touching the middle of a surrogate pair answers the
 * line receipt `422 utf16-boundary`; line-number, syntax and plain
 * range errors answer `malformed-patch`; the FIRST error stops the
 * patch (earlier accepted lines are KEPT — no rollback, no group
 * transaction), and every accepted line still rides the full §5
 * admission with its stable cursor recomputed. Tree ops never ride
 * this lane (§11: they belong to update-js/panel).
 *
 * WORKSPACE RESOLUTION FREEZE: commands resolve the workspace by its
 * DESIGN ROOT — `openWorkspaceCollab(designDir)` lays out/opens the
 * frozen `.jx-collab/` artifacts (journal/WAL/peers/ledger, git-ignored
 * by the store) inside it. The thin bin (`../../cli/bin.ts`) and the
 * future dsh adapter share these programmatic functions; nothing here
 * reads argv.
 *
 * Original need: collab-protocol M6 (2026-09-15).
 */

import { bufferAnchor } from './bridge.ts';
import { AdmissionGate } from './admission.ts';
import { rowColToOffset } from './lab-helpers.ts';
import { bufferKeyOf, CollabKernel, encodeContainerKey } from './kernel.ts';
import { FileCollabStore } from './store.ts';
import type { Frontier, JournalTailEntry, SyncCursor, TextOpEnvelope, TextTarget } from './types.ts';
import { runOrchestration, type RunOrchestrationOptions, type UpdateJsResult } from './runtime/executor.ts';

/** every command accepts a gate (shared serialization) or a bare kernel */
export type GateOrKernel = AdmissionGate | CollabKernel;

function gateOf(target: GateOrKernel): AdmissionGate {
  return target instanceof AdmissionGate ? target : new AdmissionGate(target);
}

function kernelOf(target: GateOrKernel): CollabKernel {
  return target instanceof AdmissionGate ? target.kernel : target;
}

/**
 * Open a design workspace's collab stack from its ROOT directory — the
 * frozen resolution: `.jx-collab/` lives at the design workspace root
 * (FileCollabStore's layout + gitignore duty). One kernel + one shared
 * gate per process; the dsh adapter and the future server host the
 * same pair.
 */
export function openWorkspaceCollab(designDir: string): { kernel: CollabKernel; gate: AdmissionGate; store: FileCollabStore } {
  const store = new FileCollabStore(designDir);
  const kernel = CollabKernel.open(store);
  return { kernel, gate: new AdmissionGate(kernel), store };
}

/** journal-derived per-actor opId sequence (`<actor>:<n>`, monotonic) */
function actorOpSeq(kernel: CollabKernel, actor: string): () => string {
  const prefix = `${actor}:`;
  let max = 0;
  for (const entry of kernel.journalEntries()) {
    if (entry.type !== 'commit' && entry.type !== 'rejection') continue;
    if (!entry.opId.startsWith(prefix)) continue;
    const suffix = entry.opId.slice(prefix.length);
    if (/^\d+$/.test(suffix)) max = Math.max(max, Number(suffix));
  }
  return () => `${actor}:${(max += 1)}`;
}

/* ── update: the line-by-line patch lane (§10 / P20) ───────────────────── */

export interface CliLineReceipt {
  readonly line: number;
  readonly status: 'accepted' | 'rejected';
  readonly kind?: 'cursor' | 'insert' | 'delete' | 'replace';
  readonly opId?: string;
  readonly code?: string;
  readonly detail?: string;
}

export interface CliUpdateResult {
  readonly status: 200 | 422;
  readonly target: TextTarget;
  readonly receipts: readonly CliLineReceipt[];
  /** the buffer's final text (successful lines kept, fail-stop after the first error) */
  readonly value: string;
  readonly linesExecuted: number;
}

/** the first error of a line's local resolution, classified per §10 */
function classifyLineError(message: string): 'utf16-boundary' | 'malformed-patch' {
  return message.includes('utf16-boundary') ? 'utf16-boundary' : 'malformed-patch';
}

/** does [start, start+length) split a surrogate pair at either end? (P20 law) */
function spanSplitsSurrogate(text: string, start: number, length: number): boolean {
  const deleted = text.slice(start, start + length);
  return /^[\udc00-\udfff]/u.test(deleted) || /[\ud800-\udbff]$/u.test(deleted);
}

/**
 * `cli update` — apply one line-by-line patch to a component buffer.
 * Sequential fail-stop semantics (P20): lines execute in order, each
 * resolving against the CURRENT buffer (post prior lines, via the
 * kernel's own truth); the first malformed/boundary/admission failure
 * stops the patch with a line-numbered receipt and everything accepted
 * before it stays. Cursor lines (`#ROW:COL`) are pure position setters
 * (no op admitted); `+`/`-`/`!` lines each admit one §4 text op with a
 * stable cursor anchor at the resolved offset.
 */
export async function cliUpdate(target: GateOrKernel, init: { actor: string; componentId: string; buffer: string; patch: string }): Promise<CliUpdateResult> {
  const kernel = kernelOf(target);
  const gate = gateOf(target);
  if (typeof init.actor !== 'string' || init.actor.length === 0) throw new TypeError('cliUpdate requires a non-empty actor');
  if (typeof init.componentId !== 'string' || init.componentId.length === 0) throw new TypeError('cliUpdate requires a non-empty componentId');
  if (typeof init.buffer !== 'string' || init.buffer.length === 0) throw new TypeError('cliUpdate requires a non-empty buffer');
  if (typeof init.patch !== 'string') throw new TypeError('cliUpdate requires a string patch');

  const textTarget: TextTarget = { componentId: init.componentId, buffer: init.buffer };
  const containerKey = encodeContainerKey(init.componentId, bufferKeyOf(init.buffer));
  const receipts: CliLineReceipt[] = [];
  const nextOpId = actorOpSeq(kernel, init.actor);
  let cursor = 0;
  let linesExecuted = 0;

  for (const [index, line] of init.patch.split('\n').entries()) {
    const lineNumber = index + 1;
    // resolve against the CURRENT canonical buffer — the line-before-
    // execution law (each admit below is awaited before the next line)
    const current = kernel.bufferText(containerKey);
    try {
      let match = /^#(\d+):(\d+)$/.exec(line);
      if (match) {
        cursor = rowColToOffset(current, Number(match[1]), Number(match[2]));
        receipts.push({ line: lineNumber, status: 'accepted', kind: 'cursor' });
        continue;
      }
      match = /^\+([\s\S]*)$/.exec(line);
      if (match) {
        const receipt = await admitLine(kernel, gate, {
          actor: init.actor,
          opId: nextOpId(),
          target: textTarget,
          kind: 'insert',
          offset: cursor,
          length: 0,
          text: match[1]!,
        });
        receipts.push({ line: lineNumber, status: receipt.status, kind: 'insert', opId: receipt.opId, code: receipt.code, detail: receipt.detail });
        if (receipt.status === 'accepted') {
          cursor += match[1]!.length;
          linesExecuted += 1;
        } else {
          return failStop();
        }
        continue;
      }
      match = /^-(\d+)$/.exec(line);
      if (match && Number(match[1]) > 0) {
        const length = Number(match[1]);
        if (cursor + length > current.length) throw new Error(`delete exceeds buffer (${String(length)} units at offset ${String(cursor)} of ${String(current.length)})`);
        if (spanSplitsSurrogate(current, cursor, length)) throw new Error('utf16-boundary: delete splits a surrogate pair');
        const receipt = await admitLine(kernel, gate, {
          actor: init.actor,
          opId: nextOpId(),
          target: textTarget,
          kind: 'delete',
          offset: cursor,
          length,
          text: '',
        });
        receipts.push({ line: lineNumber, status: receipt.status, kind: 'delete', opId: receipt.opId, code: receipt.code, detail: receipt.detail });
        if (receipt.status === 'accepted') linesExecuted += 1;
        else return failStop();
        continue;
      }
      match = /^!(\d+) ([\s\S]*)$/.exec(line);
      if (match && Number(match[1]) > 0) {
        const length = Number(match[1]);
        if (cursor + length > current.length) throw new Error(`replace exceeds buffer (${String(length)} units at offset ${String(cursor)} of ${String(current.length)})`);
        if (spanSplitsSurrogate(current, cursor, length)) throw new Error('utf16-boundary: replace splits a surrogate pair');
        const receipt = await admitLine(kernel, gate, {
          actor: init.actor,
          opId: nextOpId(),
          target: textTarget,
          kind: 'replace',
          offset: cursor,
          length,
          text: match[2]!,
        });
        receipts.push({ line: lineNumber, status: receipt.status, kind: 'replace', opId: receipt.opId, code: receipt.code, detail: receipt.detail });
        if (receipt.status === 'accepted') {
          cursor += match[2]!.length;
          linesExecuted += 1;
        } else {
          return failStop();
        }
        continue;
      }
      throw new Error('malformed-patch');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      receipts.push({ line: lineNumber, status: 'rejected', code: classifyLineError(message), detail: message });
      return failStop();
    }
  }
  return {
    status: 200,
    target: textTarget,
    receipts,
    value: kernel.bufferText(containerKey),
    linesExecuted,
  };

  function failStop(): CliUpdateResult {
    return {
      status: 422,
      target: textTarget,
      receipts,
      value: kernel.bufferText(containerKey),
      linesExecuted,
    };
  }
}

/** admit one line's op through the full §5 sequence; map the result onto a line receipt */
async function admitLine(
  kernel: CollabKernel,
  gate: AdmissionGate,
  init: { actor: string; opId: string; target: TextTarget; kind: 'insert' | 'delete' | 'replace'; offset: number; length: number; text: string },
): Promise<{ status: 'accepted' | 'rejected'; opId: string; code?: string; detail?: string }> {
  const envelope: TextOpEnvelope = {
    actor: init.actor,
    opId: init.opId,
    baseFrontiers: kernel.frontiers(),
    domain: 'text',
    kind: init.kind,
    target: init.target,
    cursorBytes: bufferAnchor(kernel, init.target.componentId, init.target.buffer, init.offset),
    offset: init.offset,
    length: init.length,
    text: init.text,
    timestamp: Date.now(),
  };
  const result = await gate.admit(envelope);
  if (result.status === 200) return { status: 'accepted', opId: init.opId };
  return { status: 'rejected', opId: init.opId, code: result.code, detail: result.detail };
}

/* ── update-js: the orchestration lane (§7) ────────────────────────────── */

/**
 * `cli update-js` — run one orchestration script through the pinned
 * QuickJS sandbox + the executor (deps guards, group/parallel, compile
 * gate), answering the §7 return envelope (captured logs + op receipts
 * + touched tail-5 + the caller's canonical increment).
 */
export async function cliUpdateJs(target: GateOrKernel, script: string, options: RunOrchestrationOptions): Promise<UpdateJsResult> {
  return runOrchestration(gateOf(target), script, options);
}

/* ── sync: cursor increments + per-component tail-5 (§9 / P16) ─────────── */

export interface CliSyncLog {
  readonly componentId: string;
  readonly tail: readonly JournalTailEntry[];
}

export interface CliSyncResult {
  readonly status: 200 | 409;
  readonly code?: 'stale-or-unknown-frontier';
  /** canonical increment FROM the caller's cursor (restricted snapshot when absent) */
  readonly update: Uint8Array;
  readonly syncCursor: SyncCursor;
  /** per-component tail-5 — every journaled component, or just the filter */
  readonly logs: readonly CliSyncLog[];
}

/**
 * `cli sync` — the caller's log-cursor increment plus the component
 * tail-5 summaries. An absent cursor answers the §5.6 restricted
 * snapshot + a fresh frontier cursor; a frontier the canonical can no
 * longer honor answers the §9 409 shape WITH the resync payload
 * (restricted snapshot + fresh cursor) so the client can rebase and
 * re-pull. The Loro update is the causal-closure increment — it may
 * carry other containers; import canonical-first, then apply overlays.
 */
export function cliSync(target: GateOrKernel, options: { syncCursor?: SyncCursor; componentId?: string } = {}): CliSyncResult {
  const kernel = kernelOf(target);
  if (options.componentId !== undefined && (typeof options.componentId !== 'string' || options.componentId.length === 0)) {
    throw new TypeError('cliSync componentId filter must be a non-empty string when given');
  }
  let update: Uint8Array;
  let syncCursor: SyncCursor;
  let stale = false;
  try {
    const exported = kernel.exportFor(options.syncCursor);
    update = exported.update;
    syncCursor = exported.syncCursor;
  } catch {
    // pruned/unknown frontier — the §9 stale answer carries the resync payload
    stale = true;
    const restricted = kernel.exportFor(undefined);
    update = restricted.update;
    syncCursor = restricted.syncCursor;
  }
  const logs: CliSyncLog[] = [];
  const seen = new Set<string>();
  for (const entry of kernel.journalEntries()) {
    const componentId =
      entry.type === 'commit' || entry.type === 'rejection'
        ? entry.target.componentId
        : entry.type === 'buffer-seed'
          ? entry.componentId
          : undefined;
    if (componentId === undefined || seen.has(componentId)) continue;
    if (options.componentId !== undefined && componentId !== options.componentId) continue;
    seen.add(componentId);
    logs.push({ componentId, tail: kernel.tailFor(componentId, 5) });
  }
  return stale
    ? { status: 409, code: 'stale-or-unknown-frontier', update, syncCursor, logs }
    : { status: 200, update, syncCursor, logs };
}

/* ── log: the component detail view (§9, git log mentality) ────────────── */

export interface CliLogEntry {
  readonly seq: number;
  readonly type: 'commit' | 'rejection' | 'buffer-seed';
  readonly opId: string;
  readonly transactionId?: string;
  readonly actor: string;
  readonly kind: string;
  readonly buffer: string;
  readonly before?: string;
  readonly value?: string;
  readonly frontier?: Frontier;
  readonly serverAdmissionTime: number;
  readonly detail?: string;
}

export interface CliLogResult {
  readonly componentId: string;
  /** newest first (git log mentality) */
  readonly entries: readonly CliLogEntry[];
}

/**
 * `cli log <componentId>` — the component's journal detail, newest
 * first: every commit (with transactionId, before→value, frontier) and
 * rejection (with code + detail) that targeted it, plus its buffer
 * seeds. Script/peer/projection rows are workspace-level and stay out
 * of the component view (the journal itself remains the audit truth).
 */
export function cliLog(target: GateOrKernel, componentId: string, options: { limit?: number } = {}): CliLogResult {
  if (typeof componentId !== 'string' || componentId.length === 0) throw new TypeError('cliLog requires a non-empty componentId');
  const kernel = kernelOf(target);
  const entries: CliLogEntry[] = [];
  for (const entry of kernel.journalEntries()) {
    if (entry.type === 'commit' && entry.target.componentId === componentId) {
      entries.push({
        seq: entry.seq,
        type: 'commit',
        opId: entry.opId,
        ...(entry.transactionId !== undefined ? { transactionId: entry.transactionId } : {}),
        actor: entry.actor,
        kind: entry.kind,
        buffer: entry.target.buffer ?? '',
        before: entry.before,
        value: entry.value,
        frontier: entry.frontier,
        serverAdmissionTime: entry.serverAdmissionTime,
      });
    } else if (entry.type === 'rejection' && entry.target.componentId === componentId) {
      entries.push({
        seq: entry.seq,
        type: 'rejection',
        opId: entry.opId,
        actor: entry.actor,
        kind: `rejected:${entry.code}`,
        buffer: entry.target.buffer ?? '',
        serverAdmissionTime: entry.serverAdmissionTime,
        detail: entry.detail,
      });
    } else if (entry.type === 'buffer-seed' && entry.componentId === componentId) {
      entries.push({
        seq: entry.seq,
        type: 'buffer-seed',
        opId: `seed:${entry.containerKey}`,
        actor: 'kernel',
        kind: 'seed',
        buffer: entry.buffer,
        value: entry.value,
        frontier: entry.frontier,
        serverAdmissionTime: entry.serverAdmissionTime,
      });
    }
  }
  entries.reverse();
  const limit = options.limit;
  return { componentId, entries: limit === undefined ? entries : entries.slice(0, limit) };
}
