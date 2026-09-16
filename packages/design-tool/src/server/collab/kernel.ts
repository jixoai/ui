/**
 * @jixoai/ui-design (collab) — the per-workspace movement kernel: the
 * LoroDoc wrapper, the frozen container-key codec, the actor→peer
 * registry, the append-only journal and the WAL with its frozen
 * `prepare → candidate → canonical → journal → receipt` ordering
 * (collab-protocol M2; protocol-spec §1/§5/§9, design.md 治理冻结一/二).
 *
 * Layer law (§1): the Loro doc is the movement truth (merge brain +
 * state), the journal is the adjudication/audit truth (append-only —
 * conflict sets, ownership, tail-5), and canonical state itself is
 * REBUILT FROM THE JOURNAL at recovery (each commit row carries the
 * update bytes it imported). That construction is what makes §5.5's
 * invariant unbreakable — the persisted canonical can never be ahead of
 * the journal, because it IS the journal replay.
 *
 * Governance freezes implemented here:
 *   - container keys `b:<componentId>:<bufferKey>` (component ids keep
 *     their verbatim form over `[a-z0-9-]`; every other byte is
 *     percent-encoded — generated ids never need it, manual names are
 *     only defended against);
 *   - actor strings map to numeric peers starting at 1001, step 1,
 *     never reused — the registry lives in the journal (append-only),
 *     `peers.json` is a rebuilt cache. Peer 1000 is reserved for
 *     kernel-internal bootstrap (buffer seeds), keeping every actor
 *     op under its registry peer.
 *
 * The kernel is mechanical: it never decides admission policy. The
 * gate, the checks and the error envelopes live in `admission.ts`.
 *
 * M5a (tasks M3 gaps ①②③): the text-create commit path (buffer creation
 * as an actor-attributed op — `ensureBuffer` stays as the internal
 * recovery/bootstrap lane), the tree data-update commit path (node `item`
 * payload replacement, §9-audited before/after), and the `treeItems()`
 * read accessor (kernel-side tree payload reads; no snapshot client).
 *
 * O1/O2 unlock (2026-09-15, `.zcode/epic40/o1o2-probe.md` outcome A):
 * revive of a DIRECTLY-deleted target and give-up of a tree `remove` are
 * both journal-level REBINDS — a fresh TreeID under the same
 * componentId, the item payload read off the dead node's surviving data
 * (A5d; the insert row's persisted item as the compaction fallback, A8),
 * the still-attached (inherited-tombstone) children hung back keeping
 * their TreeIDs (A6), and the doc-level buffer containers — which never
 * died (A1) — reused verbatim. `tree.rebindOf` on the journal row audits
 * the lineage; the dead TreeID stays dead (history is never rewritten).
 *
 * M6 (§7): the transaction commit core — `commitTransaction` runs a
 * whole group on ONE candidate fork under ONE commit (rollback) or per
 * op with per-op candidates (keep-partial), with the executor's Svelte
 * compile gate invoked between apply and commit; every op row carries
 * the shared `transactionId` (atomic receipt). Plus the `textAt`
 * accessor (M5 tail ① — the resync three-way base without the ~40-line
 * journal walk) and the `script`/`projection-pending` journal artifact
 * recorders (§7 intent rows; M5 tail ② types live in types.ts).
 *
 * M7 (§9 留存冻结): journal-retention governance — the active-cursor
 * and tombstone-obligation enumerations plus the compaction guard
 * (`evaluateCompaction`/`requireCompactionAllowed`). No compaction
 * executor exists; the guard stands as the fail-safe gate any future
 * one must clear.
 *
 * Original need: collab-protocol M2 + M5a + M6 + M7 (2026-09-15).
 */

import { Cursor, LoroDoc, UndoManager, VersionVector } from 'loro-crdt';
import type { LoroTree, TreeID } from 'loro-crdt';

import type { CollabStore } from './store.ts';
import type {
  AdmissionResult,
  BufferContainerId,
  CommitJournalEntry,
  CommitReceipt,
  ErrorEnvelope,
  Frontier,
  JournalEntry,
  JournalTailEntry,
  LedgerState,
  OpTarget,
  PeerRegistryState,
  ProjectionPendingJournalEntry,
  ScriptJournalEntry,
  SyncCursor,
  TextCreateOpEnvelope,
  TextOpEnvelope,
  TextTarget,
  TreeLwwContender,
  TreeLwwReceipt,
  TreeOpEnvelope,
  TreeTarget,
  WalEntry,
} from './types.ts';

/* ── governance constants ─────────────────────────────────────────────── */

/** first peer handed to an actor; 1001 onward, step 1, never reused */
export const FIRST_ACTOR_PEER = 1001;
/** reserved peer for kernel-internal bootstrap commits (buffer seeds) */
export const KERNEL_BOOTSTRAP_PEER = 1000;
/** the single tree container (design 治理冻结一: 映射只存 journal) */
export const TREE_CONTAINER = 'tree';

/* ── typed errors (admission maps these onto envelopes) ───────────────── */

export const KERNEL_ERROR_PREFIX = '[jixoai-collab-kernel]';

/** container-key codec violations (design 治理冻结一) */
export class ContainerKeyError extends Error {
  constructor(message: string) {
    super(`${KERNEL_ERROR_PREFIX} ${message}`);
    this.name = 'ContainerKeyError';
  }
}

/**
 * A failure raised while applying an op on the candidate fork — §5.5's
 * abort path: canonical/journal stay untouched; the admission layer
 * writes `WAL abort` and answers with an (unjournaled) envelope.
 */
export class KernelCandidateError extends Error {
  readonly code: 'utf16-boundary' | 'bad-target' | 'internal';
  readonly detail: string;
  constructor(code: 'utf16-boundary' | 'bad-target' | 'internal', detail: string, message: string) {
    super(`${KERNEL_ERROR_PREFIX} ${message}`);
    this.name = 'KernelCandidateError';
    this.code = code;
    this.detail = detail;
  }
}

/**
 * A `syncCursor` loro cannot honor — unknown or already-pruned frontier
 * (impl-review-1 B2). `exportFor` raises this instead of silently
 * degrading to a shallow snapshot; the admission layer maps it onto the
 * journaled `409 stale-or-unknown-frontier` (§4: 已裁剪 cursor 统一 409).
 */
export class PrunedSyncCursorError extends Error {
  constructor(message: string) {
    super(`${KERNEL_ERROR_PREFIX} ${message}`);
    this.name = 'PrunedSyncCursorError';
  }
}

/**
 * §9 留存冻结: a compaction plan the guard REFUSED. Fail-safe by design —
 * the tombstone obligation outranks the compaction (loro 1.16.1 CHANGELOG:
 * persisted state may drop tombstones; the identity high-water and the
 * A-route rebind both read them), and a lagging active cursor outranks it
 * too (旧 cursor 一律 409 + 重同步, never a prune underneath them). No
 * compaction executor exists today — the journal stays append-only and
 * the doc is never pruned — so this error marks the standing gate any
 * FUTURE executor must pass (M7 注记: 压缩执行器接后续，或无需压缩时
 * guard 待命).
 */
export class CompactionRefusedError extends Error {
  readonly decision: CompactionDecision;
  constructor(decision: CompactionDecision) {
    super(
      `${KERNEL_ERROR_PREFIX} compaction refused (§9 retention freeze): ${decision.refusals.map((refusal) => `[${refusal.reason}] ${refusal.detail}`).join('; ')}`,
    );
    this.name = 'CompactionRefusedError';
    this.decision = decision;
  }
}

/** why a compaction was refused (§9 留存冻结) */
export type CompactionRefusalReason = 'unknown-compaction-frontier' | 'lagging-cursor' | 'tombstone-obligation';

/** one refusal — machine-readable reason + operator-readable detail */
export interface CompactionRefusal {
  readonly reason: CompactionRefusalReason;
  readonly detail: string;
}

/**
 * One active sync cursor the retention contract must respect — an
 * actor's LAST-issued cursor (journal-derived: the newest commit's
 * `responseSyncCursor` or rejection's `syncCursor` the actor was left
 * holding). Deterministic across restarts; actors never issued a cursor
 * impose no constraint (they hold none of our frontiers — the runtime
 * §9 path hands them a snapshot + fresh cursor).
 */
export interface ActiveSyncCursor {
  readonly actor: string;
  /** journal seq of the row that minted this cursor */
  readonly seq: number;
  readonly cursor: SyncCursor;
}

/**
 * One journal row whose tombstone evidence must survive any compaction:
 * `deletion-evidence` — the remove/give-up-compensation/override-undo
 * row itself (the §6 record that a TreeID died; the O1 direct-delete
 * discriminator walks exactly these); `dead-node-payload` — an
 * insert/update row of a component that is tombstoned NOW (the A5d
 * rebind payload source and the A8 compaction fallback, plus the §2
 * identity high-water that counts tombstoned ids' max counters).
 */
export interface TombstoneObligation {
  readonly seq: number;
  readonly opId: string;
  readonly actor: string;
  readonly componentId: string;
  readonly kind: string;
  readonly why: 'deletion-evidence' | 'dead-node-payload';
  /** the row's frontier — the version its evidence lives at */
  readonly frontier: Frontier;
}

/** a compaction proposal: prune everything the snapshot at `frontier` subsumes */
export interface CompactionPlan {
  readonly frontier: Frontier;
}

/** the guard's verdict — the full enumeration travels with it (audit) */
export interface CompactionDecision {
  readonly allowed: boolean;
  readonly refusals: readonly CompactionRefusal[];
  readonly activeCursors: readonly ActiveSyncCursor[];
  readonly obligations: readonly TombstoneObligation[];
}

/* ── the frozen container-key codec (design 治理冻结一) ────────────────── */

const SAFE_CHARS = /^[a-z0-9-]$/;
const SLUG_RE = /^[a-z0-9-]+$/;
const PROP_BUFFER_PREFIX = 'p-';
const SLOT_BUFFER_RE = /^t-\d+$/;
const NAMED_BUFFERS = new Set(['script', 'style', 'page']);

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** percent-encode every byte outside `[a-z0-9-]` — `:` and `/` can never leak into a container name */
function encodeComponentId(componentId: string): string {
  let out = '';
  for (const char of componentId) {
    if (SAFE_CHARS.test(char)) {
      out += char;
    } else {
      for (const byte of encoder.encode(char)) out += `%${byte.toString(16).toUpperCase().padStart(2, '0')}`;
    }
  }
  return out;
}

/** decode a percent-encoded component-id segment (`%` can only ever be an escape here) */
function decodeComponentId(segment: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < segment.length; i += 1) {
    if (segment[i] !== '%') {
      bytes.push(segment.charCodeAt(i));
    } else {
      const hex = segment.slice(i + 1, i + 3);
      if (!/^[0-9A-F]{2}$/.test(hex)) throw new ContainerKeyError(`malformed percent escape %${hex} in container key segment`);
      bytes.push(Number.parseInt(hex, 16));
      i += 2;
    }
  }
  return decoder.decode(new Uint8Array(bytes));
}

/**
 * Map a human buffer name onto its schema-frozen slug: `script`/`style`
 * /`page` verbatim, `t-<n>` slots verbatim, anything else is the prop
 * buffer `p-<propName>` (§3: 非字符串 props 按其文本序列化值处理，同词表).
 */
export function bufferKeyOf(buffer: string): string {
  if (buffer.length === 0) {
    throw new ContainerKeyError('buffer name must be non-empty (§4 target.buffer)');
  }
  let slug: string;
  if (NAMED_BUFFERS.has(buffer) || SLOT_BUFFER_RE.test(buffer)) {
    slug = buffer;
  } else {
    slug = `${PROP_BUFFER_PREFIX}${buffer}`;
  }
  if (!SLUG_RE.test(slug)) {
    throw new ContainerKeyError(
      `buffer ${JSON.stringify(buffer)} maps to slug ${JSON.stringify(slug)} outside the frozen charset [a-z0-9-]`,
    );
  }
  return slug;
}

/** `b:<componentId>:<bufferKey>` — the frozen component-buffer container name */
export function encodeContainerKey(componentId: string, bufferKey: string): string {
  if (!SLUG_RE.test(bufferKey)) {
    throw new ContainerKeyError(`bufferKey ${JSON.stringify(bufferKey)} outside the frozen charset [a-z0-9-]`);
  }
  return `b:${encodeComponentId(componentId)}:${bufferKey}`;
}

export interface DecodedContainerKey {
  readonly componentId: string;
  readonly bufferKey: string;
}

/** inverse of {@link encodeContainerKey}; strict — unknown shapes throw */
export function decodeContainerKey(key: string): DecodedContainerKey {
  const parts = key.split(':');
  if (parts.length !== 3 || parts[0] !== 'b') {
    throw new ContainerKeyError(`container key ${JSON.stringify(key)} is not of the frozen form b:<componentId>:<bufferKey>`);
  }
  const [, componentSegment, bufferKey] = parts as [string, string, string];
  if (!SLUG_RE.test(bufferKey)) {
    throw new ContainerKeyError(`bufferKey ${JSON.stringify(bufferKey)} outside the frozen charset [a-z0-9-]`);
  }
  return { componentId: decodeComponentId(componentSegment), bufferKey };
}

/* ── base64 bridges (journal rows are JSON lines; bytes ride as base64) ── */

export function bytesToB64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

export function b64ToBytes(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

/* ── loro typing bridges ──────────────────────────────────────────────── */

/** loro's frontier tuple (`peer` is their `${number}` template type) */
type LoroFrontiers = Parameters<LoroDoc['cmpFrontiers']>[0];

/**
 * Our envelopes carry frontiers as plain JSON (`peer: string`); loro's
 * typings narrow the peer to a numeric template literal. The values are
 * identical at runtime — this is the one controlled cast across that
 * third-party boundary (the probe battery does the same with `as never`).
 */
const toLoroFrontiers = (frontier: Frontier): LoroFrontiers => frontier as LoroFrontiers;

/**
 * Their tree-node ids are `${number}@${number}` template literals while
 * the journal (the mapping's only home) speaks plain strings — one
 * controlled bridge across that third-party boundary.
 */
const asTreeId = (id: string): TreeID => id as TreeID;

/* ── transaction-lane module helpers (M6) ──────────────────────────────── */

function errorMessageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** the §5.3 surrogate law's twin (admission.ts holds the gate's copy) */
function splitsSurrogatePair(text: string, position: number): boolean {
  return (
    position > 0 &&
    position < text.length &&
    text.charCodeAt(position - 1) >= 0xd800 &&
    text.charCodeAt(position - 1) <= 0xdbff &&
    text.charCodeAt(position) >= 0xdc00 &&
    text.charCodeAt(position) <= 0xdfff
  );
}

/** one transaction op's §4 target shape (text ops carry the buffer) */
function walTargetOf(op: TransactionOp): OpTarget {
  return op.domain === 'text' ? { componentId: op.target.componentId, buffer: op.target.buffer } : { componentId: op.target.componentId };
}

/**
 * Does `sup` dominate-or-equal `sub` as version vectors (every `sub`
 * counter is met or exceeded in `sup`, missing peers counting as 0)?
 * The §9 cursor-crossing relation: a cursor dominates the compaction
 * frontier iff the client has already received everything ≤ it.
 */
function dominatesVersionVector(sup: ReadonlyMap<string, number>, sub: ReadonlyMap<string, number>): boolean {
  for (const [peer, counter] of sub) {
    if ((sup.get(peer) ?? 0) < counter) return false;
  }
  return true;
}

/**
 * Map one thrown transaction-lane failure onto the journaled envelope
 * shape: the candidate-error codes follow the single-op admission
 * mapping (utf16 → 422, everything else 404 bad-target with the real
 * cause preserved in the detail); a compile-gate failure is recognized
 * STRUCTURALLY (`error.name === "CompileGateError"` — the class lives in
 * `runtime/compile-gate.ts`; the name check is the deliberate
 * cycle-free contract between the two modules) and maps to the M6
 * `422 compile-failed`.
 */
function transactionErrorOf(error: unknown): { status: 409 | 404 | 422 | 503; code: ErrorEnvelope['code']; detail: string } {
  if (error instanceof KernelCandidateError) {
    if (error.code === 'utf16-boundary') return { status: 422, code: 'utf16-boundary', detail: error.detail };
    return { status: 404, code: 'bad-target', detail: error.detail };
  }
  const detail = errorMessageOf(error);
  if (error instanceof Error && error.name === 'CompileGateError') return { status: 422, code: 'compile-failed', detail };
  return { status: 404, code: 'bad-target', detail };
}

/* ── journal-derived indices the gate needs ───────────────────────────── */

/** one committed text op's stable-identity influence record (§5.2) */
export interface InfluenceRecord {
  readonly opId: string;
  readonly actor: string;
  readonly kind: string;
  readonly offset: number;
  readonly length: number;
  readonly frontier: Frontier;
  /** base64 Cursor anchors of the affected span, encoded pre-apply */
  readonly anchors?: { readonly start: string; readonly end: string };
}

/* ── the M6 transaction vocabulary (§7 group/parallel lane) ────────────── */

/**
 * One RESOLVED op of a transaction plan. Text ops carry kernel-form
 * offsets against the buffer state AFTER the transaction's prior ops on
 * the same buffer (sequential CLI-like lane) plus `expectedBefore` — the
 * strict buffer-text evidence, ALWAYS enforced on the transaction lane
 * (a divergence means the executor's simulation drifted; the candidate
 * dies with zero effect, never a silently mis-anchored write). Tree ops
 * reuse the §4 envelope payload verbatim.
 */
export type TransactionOp =
  | {
      readonly domain: 'text';
      readonly kind: 'insert' | 'delete' | 'replace';
      readonly opId: string;
      readonly target: TextTarget;
      readonly containerKey: string;
      readonly offset: number;
      readonly length: number;
      readonly text: string;
      readonly expectedBefore: string;
    }
  | { readonly domain: 'tree'; readonly opId: string; readonly target: TreeTarget; readonly envelope: TreeOpEnvelope };

/** one op's adjudication inside a transaction receipt */
export interface TransactionOpReceipt {
  readonly opId: string;
  readonly status: 'accepted' | 'rejected';
  readonly code?: string;
  readonly error?: string;
}

/**
 * The ATOMIC receipt of one group/parallel transaction (§4: 同一事务内
 * 的 tree/text op 共享一个原子 receipt). `status` is `accepted` when
 * every op landed, `rejected` when nothing landed (rollback failure,
 * unmet deps), `partial` when keep-partial kept some ops. `strategy`
 * is the group fail strategy (`rollback`/`keep-partial`, kernel-minted)
 * or `parallel` (the executor's convergence summary — its branch ops
 * ride the ordinary §5 single-op lane, only sharing the id).
 */
export interface TransactionReceipts {
  readonly transactionId: string;
  readonly status: 'accepted' | 'rejected' | 'partial';
  readonly strategy: 'rollback' | 'keep-partial' | 'parallel';
  readonly receipts: readonly TransactionOpReceipt[];
  /** group-level diagnostics — the compile gate error, the dep failure detail */
  readonly diagnostics?: string;
  /** how many op rows actually committed */
  readonly effects: number;
  readonly frontier?: Frontier;
  readonly syncCursor?: SyncCursor;
  readonly update?: Uint8Array;
  /** the componentIds the transaction touched (receipt envelope tails) */
  readonly touched: readonly string[];
}

/**
 * The transaction compile gate (§7 事务内编译门禁): invoked with the
 * CANDIDATE doc (all of the group's ops applied, nothing committed) and
 * the touched component ids; MUST throw to reject the group/ops. The
 * executor installs the real Svelte compiler + registry schema gate
 * (`runtime/compile-gate.ts`).
 */
export type TransactionCompileGate = (candidate: LoroDoc, touched: ReadonlySet<string>) => void;

/**
 * One component-tree node as a read-only kernel snapshot (M5a gap ③):
 * the bridge/projection read surface, so they no longer need the
 * snapshot-client round-trip (`LoroDoc.fromSnapshot(kernel.snapshotBytes())`).
 * Tombstones are included by design (§6 keeps payloads/history alive; the
 * identity high-water reads them) — `deleted` is the flag.
 */
export interface TreeItemNode {
  /** the protocol component id (journal mapping reverse side); undefined only for nodes outside the journal mapping */
  readonly componentId: string | undefined;
  /** the loro tree-node id — the journal mapping's other side */
  readonly treeNodeId: string;
  /** the parent's component id (`undefined` = forest root) */
  readonly parentComponentId: string | undefined;
  /** the parent's loro tree-node id (`undefined` = forest root) */
  readonly parentTreeNodeId: string | undefined;
  /** the node's position among its parent's children, as loro reports it */
  readonly index: number | undefined;
  /** the node's `item` meta payload — a raw JSON value, opaque to the kernel */
  readonly meta: unknown;
  /** §6 tombstone flag — deleted nodes stay readable by design */
  readonly deleted: boolean;
}

/**
 * The M4 §6 shapes crossing the kernel↔gate boundary:
 *  - {@link GiveUpPlan} — everything the serialized give-up transaction needs;
 *  - {@link OverrideOutcome} — the controlled override (本 peer UndoManager)
 *    result: a receipt when something was undone/redone, an explicit
 *    terminal status otherwise.
 */
export interface GiveUpPlan {
  readonly targetEntry: CommitJournalEntry;
  /** a FRESH registry peer for the compensating change (see commitCompensation) */
  readonly compensationPeer: number;
}

export type OverrideOutcome =
  | { readonly status: 'performed'; readonly receipt: CommitReceipt }
  | { readonly status: 'no-session' }
  | { readonly status: 'empty-stack' }
  | { readonly status: 'stale-sync-cursor' };

/** the observable state of one actor's override session (undo.ts surface) */
export interface OverrideSessionInfo {
  readonly open: boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
}

/* ── the kernel ───────────────────────────────────────────────────────── */

export interface KernelStats {
  readonly journalSeq: number;
  readonly nextPeer: number;
  readonly actorCount: number;
  readonly bufferCount: number;
  readonly receiptCount: number;
}

interface KernelOverrideSession {
  readonly actor: string;
  readonly peer: number;
  readonly fork: LoroDoc;
  readonly undo: UndoManager;
  /** opId stamped onto the undo step while a gate commit applies on the fork */
  pendingOpId?: string;
  /** opIds popped by the most recent undo()/redo() call (onPush metadata) */
  lastPopped: readonly string[];
}

export class CollabKernel {
  readonly #doc: LoroDoc;
  readonly #store: CollabStore;
  readonly #journal: JournalEntry[] = [];
  readonly #receipts = new Map<string, AdmissionResult>();
  readonly #actors = new Map<string, number>();
  readonly #buffers = new Set<string>();
  readonly #influence = new Map<string, InfluenceRecord[]>();
  /** source component id ↔ Loro TreeID — journal-only mapping (design 冻结) */
  readonly #treeNodes = new Map<string, string>();
  /** committed op rows by opId — the give-up locator and the LWW contender scan */
  readonly #commitIndex = new Map<string, CommitJournalEntry>();
  /** per-actor override sessions (本 peer UndoManager, §6 override) */
  readonly #overrideSessions = new Map<number, KernelOverrideSession>();
  /**
   * The §8 pending-projection WORKLIST (kernel gap ② repaid, M6 收敛轮):
   * un-flushed `projection-pending` rows, recovered from the journal at
   * open — cross-process truth that survived the crash. The journal rows
   * stay append-only audit; the worklist membership is process-local
   * bookkeeping (`markProjectionFlushed` retires an entry).
   */
  readonly #pendingProjections = new Map<number, ProjectionPendingJournalEntry>();
  readonly #recoveryNotes: string[] = [];
  #nextPeer = FIRST_ACTOR_PEER;
  #nextSeq = 1;

  private constructor(store: CollabStore) {
    this.#store = store;
    this.#doc = new LoroDoc();
    this.#doc.setPeerId(KERNEL_BOOTSTRAP_PEER);
  }

  /** open (or recover) a workspace kernel over a store */
  static open(store: CollabStore): CollabKernel {
    store.init();
    const kernel = new CollabKernel(store);
    kernel.#recover();
    return kernel;
  }

  /* ── recovery: the journal IS the canonical truth (§9 / §5.5) ────────── */

  #recover(): void {
    const journal = this.#store.readJournal();
    const wal = this.#store.readWal();

    for (const entry of journal) {
      this.#journal.push(entry);
      this.#nextSeq = Math.max(this.#nextSeq, entry.seq + 1);
      switch (entry.type) {
        case 'peer': {
          this.#actors.set(entry.actor, entry.peer);
          this.#nextPeer = Math.max(this.#nextPeer, entry.peer + 1);
          break;
        }
        case 'commit': {
          const update = b64ToBytes(entry.updateB64);
          if (update.byteLength > 0) this.#doc.import(update);
          this.#receipts.set(entry.opId, this.#receiptFromCommit(entry));
          this.#buffers.add(entry.containerKey);
          this.#commitIndex.set(entry.opId, entry);
          if (entry.domain === 'text' && entry.anchors !== undefined) {
            const records = this.#influence.get(entry.containerKey) ?? [];
            records.push({
              opId: entry.opId,
              actor: entry.actor,
              kind: entry.kind,
              offset: entry.offset,
              length: entry.length,
              frontier: entry.frontier,
              anchors: entry.anchors,
            });
            this.#influence.set(entry.containerKey, records);
          }
          if (entry.tree !== undefined) this.#treeNodes.set(entry.tree.componentId, entry.tree.treeNodeId);
          break;
        }
        case 'rejection': {
          this.#receipts.set(entry.opId, this.#receiptFromRejection(entry));
          break;
        }
        case 'buffer-seed': {
          const update = b64ToBytes(entry.updateB64);
          if (update.byteLength > 0) this.#doc.import(update);
          this.#buffers.add(entry.containerKey);
          break;
        }
        // M6 §7 / M5 tail ②: intent + audit rows with zero canonical
        // effect — recovery skips past them (replay is op-based; the
        // projection write-back worklist is station-side)
        case 'script':
          break;
        // M6 收敛轮 (kernel gap ②): the row joins the kernel-side
        // pending-projection WORKLIST — the recovered cross-process list
        // a later process retries against (§8 crash recovery)
        case 'projection-pending':
          this.#pendingProjections.set(entry.seq, entry);
          break;
      }
    }

    // WAL audit — the §5.5 crash windows, decided by persisted evidence:
    //  - prepare without receipt/abort and without a journal row → the
    //    process died between prepare and canonical/journal → the op is
    //    dropped with zero effect (canonical is journal-derived);
    //  - prepare without a WAL receipt but WITH a journal row → died
    //    between journal append and the WAL receipt marker → idempotency
    //    is served from the journal;
    //  - a journal commit without any prepare → the frozen order was
    //    violated somewhere upstream — flagged loudly, replayed anyway
    //    (the journal, not the flag, is the truth).
    const walStates = new Map<string, { receipt?: boolean; abort?: boolean; prepare?: boolean }>();
    for (const entry of wal) {
      const state = walStates.get(entry.opId) ?? {};
      if (entry.type === 'prepare') state.prepare = true;
      if (entry.type === 'receipt') state.receipt = true;
      if (entry.type === 'abort') state.abort = true;
      walStates.set(entry.opId, state);
    }
    for (const [opId, state] of walStates) {
      if (state.receipt === true || state.abort === true) continue;
      if (this.#receipts.has(opId)) {
        this.#recoveryNotes.push(`wal-prepare-without-receipt-marker ${opId}: journal holds the op — idempotency served from the journal`);
      } else {
        this.#recoveryNotes.push(
          `dropped-prepared-op ${opId}: crashed between WAL prepare and canonical/journal — zero effect, resubmission required`,
        );
      }
    }
    for (const entry of this.#journal) {
      if (entry.type === 'commit' && walStates.get(entry.opId)?.prepare !== true) {
        this.#recoveryNotes.push(`canonical-without-prepare ${entry.opId}: journal commit lacks a WAL prepare — ordering invariant flag`);
      }
    }

    this.#materializeCaches();
  }

  /** rebuild peers.json/ledger.json caches whenever they lag the journal */
  #materializeCaches(): void {
    const actors: Record<string, number> = {};
    for (const [actor, peer] of this.#actors) actors[actor] = peer;
    const peersState: PeerRegistryState = { actors, nextPeer: this.#nextPeer };
    const persistedPeers = this.#store.loadPeers();
    if (persistedPeers === undefined || persistedPeers.nextPeer !== peersState.nextPeer || Object.keys(persistedPeers.actors).length !== this.#actors.size) {
      this.#store.savePeers(peersState);
    }
    const ledger = this.#ledgerState();
    const persistedLedger = this.#store.loadLedger();
    if (persistedLedger === undefined || persistedLedger.journalSeq !== ledger.journalSeq) {
      this.#store.saveLedger(ledger);
    }
  }

  #ledgerState(): LedgerState {
    const receipts: Record<string, { status: number; code?: string; seq: number }> = {};
    for (const entry of this.#journal) {
      if (entry.type === 'commit') receipts[entry.opId] = { status: 200, seq: entry.seq };
      if (entry.type === 'rejection') receipts[entry.opId] = { status: entry.status, code: entry.code, seq: entry.seq };
    }
    return { journalSeq: this.#nextSeq - 1, nextPeer: this.#nextPeer, receipts };
  }

  /* ── identity: the actor→peer registry (design 治理冻结二) ───────────── */

  /** the numeric peer of an actor, allocating (and journaling) on first sight */
  peerOf(actor: string): number {
    const known = this.#actors.get(actor);
    if (known !== undefined) return known;
    const peer = this.#nextPeer;
    this.#nextPeer += 1;
    this.#actors.set(actor, peer);
    this.#appendJournal({ type: 'peer', seq: this.#nextSeq++, serverAdmissionTime: Date.now(), actor, peer });
    this.#materializeCaches();
    return peer;
  }

  knownPeerOf(actor: string): number | undefined {
    return this.#actors.get(actor);
  }

  /* ── buffers (containers of the frozen key shape) ────────────────────── */

  hasBuffer(containerKey: string): boolean {
    return this.#buffers.has(containerKey);
  }

  bufferText(containerKey: string): string {
    return this.#doc.getText(containerKey).toString();
  }

  /** the loro container id a decoded cursor must match (§5.3 container check) */
  containerIdOf(containerKey: string): BufferContainerId {
    return this.#doc.getText(containerKey).id;
  }

  /**
   * M5 tail ① (M6 delivery): one buffer's text at an arbitrary included
   * version — the §8 three-way base WITHOUT the ~40-line journal walk
   * (resync's `bufferBaseAt` derivation). Reads through `forkAt(at)`;
   * an unknown/pruned frontier answers `undefined`. DOCUMENTED EDGE: a
   * container born AFTER `at` reads as `''` (the fork predates it) where
   * the journal walk answers `undefined` — existence questions stay
   * journal-derived; this accessor answers content questions.
   */
  textAt(containerKey: string, at: Frontier): string | undefined {
    try {
      return this.#doc.forkAt(toLoroFrontiers(at)).getText(containerKey).toString();
    } catch {
      return undefined; // unknown or pruned frontier
    }
  }

  /**
   * M6 §7: archive the orchestration script as an INTENT artifact —
   * source + sha256 + pinned engine identity + capability list. The row
   * has zero canonical effect: replay is always op-based, the script is
   * never re-executed (D5).
   */
  recordScriptArtifact(request: {
    scriptId: string;
    actor: string;
    source: string;
    sourceHash: string;
    engine: ScriptJournalEntry['engine'];
    capabilities: readonly string[];
    transactionIds?: readonly string[];
  }): void {
    const entry: ScriptJournalEntry = {
      type: 'script',
      seq: this.#nextSeq++,
      serverAdmissionTime: Date.now(),
      scriptId: request.scriptId,
      actor: request.actor,
      source: request.source,
      sourceHash: request.sourceHash,
      engine: request.engine,
      capabilities: request.capabilities,
      ...(request.transactionIds !== undefined ? { transactionIds: request.transactionIds } : {}),
    };
    this.#appendJournal(entry);
    this.#materializeCaches();
  }

  /**
   * M5 tail ② (M6 delivery): append the formal `projection-pending`
   * journal row — §8's write-back failure audit. The resync station's
   * transitional sidecar stays its worklist; this is the kernel-persisted
   * audit trail entry for the migration. Zero canonical effect by law
   * (不回滚不另写).
   *
   * M6 收敛轮 (kernel gap ② repaid): the row joins the kernel-side
   * WORKLIST (recovered at open), and `base` — sha256 of the file bytes
   * at the failed cycle's read — is a STRUCTURAL field the recovery
   * no-clobber guard reads (the M6b host's reason-suffix smuggling is
   * retired).
   */
  recordProjectionPending(request: { path: string; projectionHash: string; reason: string; base?: string }): void {
    const entry: ProjectionPendingJournalEntry = {
      type: 'projection-pending',
      seq: this.#nextSeq++,
      serverAdmissionTime: Date.now(),
      path: request.path,
      projectionHash: request.projectionHash,
      ...(request.base !== undefined ? { base: request.base } : {}),
      reason: request.reason,
    };
    this.#appendJournal(entry);
    this.#pendingProjections.set(entry.seq, entry);
    this.#materializeCaches();
  }

  /** the un-flushed pending-projection worklist, oldest first (§8 recovery input) */
  pendingProjections(): readonly ProjectionPendingJournalEntry[] {
    return [...this.#pendingProjections.values()].sort((a, b) => a.seq - b.seq);
  }

  /**
   * Retire one worklist entry after its projection landed (or was
   * consciously resolved). Process-local marker only: the append-only
   * journal row stays the audit truth forever.
   */
  markProjectionFlushed(seq: number): boolean {
    return this.#pendingProjections.delete(seq);
  }

  /**
   * Seed a named buffer — idempotent: an already known buffer is left
   * untouched. The seed commit runs under the reserved kernel peer and
   * lands in the journal like any other truth.
   *
   * M5a demotion: this is now the INTERNAL recovery/bootstrap path
   * (kernel rebuild, test scaffolding, and resync.ts's legacy bootstrap —
   * kept working for backward compatibility). Production ingest creates
   * buffers through the admitted `text create` op
   * ({@link CollabKernel.commitTextCreateOp}) so creation is an
   * actor-attributed, journaled op like every other write.
   */
  ensureBuffer(componentId: string, buffer: string, seed = ''): string {
    const containerKey = encodeContainerKey(componentId, bufferKeyOf(buffer));
    if (this.#buffers.has(containerKey)) return containerKey;
    const { update, frontier } = this.#commitOnFork(KERNEL_BOOTSTRAP_PEER, `seed ${containerKey}`, undefined, (fork) => {
      if (seed.length > 0) fork.getText(containerKey).insert(0, seed);
    });
    const value = this.#bufferTextOf(containerKey);
    this.#buffers.add(containerKey);
    this.#appendJournal({
      type: 'buffer-seed',
      seq: this.#nextSeq++,
      serverAdmissionTime: Date.now(),
      containerKey,
      componentId,
      buffer,
      value,
      frontier,
      updateB64: bytesToB64(update),
    });
    this.#materializeCaches();
    return containerKey;
  }

  /* ── tree registry (journal-only mapping, design 治理冻结一) ─────────── */

  treeNodeOf(componentId: string): string | undefined {
    return this.#treeNodes.get(componentId);
  }

  isTreeNodeDeleted(treeNodeId: string): boolean {
    return this.#doc.getTree(TREE_CONTAINER).isNodeDeleted(asTreeId(treeNodeId));
  }

  treeSummary(): string {
    return JSON.stringify(this.#doc.getTree(TREE_CONTAINER).getShallowValue());
  }

  /**
   * M5a gap ③: the tree-payload read accessor — every node's component id
   * (journal mapping), parent linkage, sibling index, `item` meta payload
   * and tombstone flag, read directly off canonical. Equivalent to the
   * snapshot-client read the bridge performs today (test-pinned); the
   * bridge/projection switch to this API is theirs to make later.
   */
  treeItems(): readonly TreeItemNode[] {
    // reverse side of the journal-only mapping (componentId ↔ TreeID)
    const componentByTreeNodeId = new Map<string, string>();
    for (const [componentId, treeNodeId] of this.#treeNodes) componentByTreeNodeId.set(treeNodeId, componentId);
    return this.#doc.getTree(TREE_CONTAINER).nodes().map((node) => {
      const parent = node.parent();
      return {
        componentId: componentByTreeNodeId.get(node.id),
        treeNodeId: node.id,
        parentComponentId: parent === undefined ? undefined : componentByTreeNodeId.get(parent.id),
        parentTreeNodeId: parent === undefined ? undefined : parent.id,
        index: node.index(),
        meta: node.data.get('item') as unknown,
        deleted: node.isDeleted(),
      };
    });
  }

  /* ── §6 conflict & undo substrate (M4) ───────────────────────────────── */

  /** the committed journal row of an opId (the give-up locator); rejections/seeds are not commits */
  commitRowFor(opId: string): CommitJournalEntry | undefined {
    return this.#commitIndex.get(opId);
  }

  /** the compensation row that already superseded `targetOpId`, if any (give-up idempotency) */
  compensationFor(targetOpId: string): CommitJournalEntry | undefined {
    for (const entry of this.#commitIndex.values()) {
      if (entry.supersedes === targetOpId) return entry;
    }
    return undefined;
  }

  /**
   * The §6 `targetParent` — canonical's frontier immediately before the
   * commit. New rows carry `parentFrontier` verbatim; M2 rows derive it:
   * `frontiersToVV(frontier)` minus this commit's own change (one commit
   * is exactly one change per peer — one opId per `commit()`).
   */
  parentFrontierOf(entry: CommitJournalEntry): Frontier | undefined {
    if (entry.parentFrontier !== undefined) return entry.parentFrontier;
    try {
      const vv = this.#doc.frontiersToVV(toLoroFrontiers(entry.frontier));
      const entries = new Map([...vv.toJSON().entries()] as [`${number}`, number][]);
      const ownKey = String(entry.peer) as `${number}`;
      const own = entries.get(ownKey);
      if (own === undefined || own < 1) return undefined;
      entries.set(ownKey, own - 1);
      return this.#doc.vvToFrontiers(new VersionVector(entries)) as Frontier;
    } catch {
      return undefined;
    }
  }

  /**
   * §6 give-up core — the P3/P10-verified recipe, run inside the gate's
   * serialized give-up transaction (WAL ordering lives in admission):
   *
   *   compensator = canonical.forkAt(target's post-commit frontier)
   *               — a copy that contains the target op but NOT the later
   *                 third-party commits (a FULL fork's revertTo would
   *                 compensate those too; probe-verified), while changes
   *                 concurrent to the target that were already imported
   *                 sit inside `targetParent` and are untouched;
   *   compensator.revertTo(targetParent) — identity-precise inverse ops
   *               (unlike diff/applyDiff re-application, which is
   *               position-based and corrupts under concurrent edits
   *               inside the compensated span — probe-verified);
   *   export relative to canonical's CURRENT version and import — the
   *               third-party edits canonical gained in between survive
   *               (CRDT-merged against the inverse).
   *
   * O2 exception (2026-09-15, probe A9): a tree `remove` is NOT reverted —
   * revertTo's tree-delete inverse fabricates a bare node (TreeID identity
   * and node data lost; the retired 503's root cause). It is compensated
   * by REBINDING on a full-current fork: a fresh node at the pre-remove
   * placement (parent/index read on a fork of `targetParent`, where the
   * node is still live — a dead node reports a sentinel parent and no
   * index, probe-verified), the item copied off the dead node's data, and
   * the still-attached children hung back keeping their TreeIDs. Children
   * revived AWAY after the remove are no longer attached on the current
   * fork — those later ops survive untouched; third-party noise and every
   * buffer ride along untouched by construction.
   *
   * `peer` MUST be a fresh registry peer: the compensator's truncated
   * history cannot see that peer's later changes, so any reuse would
   * collide change counters (the gate allocates `give-up:<targetOpId>`,
   * never reused, and enforces give-up idempotency before calling).
   */
  commitCompensation(request: {
    targetEntry: CommitJournalEntry;
    actor: string;
    peer: number;
    opId: string;
    syncCursor: SyncCursor | undefined;
  }): CommitReceipt {
    const { targetEntry, actor, peer, opId, syncCursor } = request;
    const targetParent = this.parentFrontierOf(targetEntry);
    if (targetParent === undefined) {
      throw new KernelCandidateError('internal', 'target parent frontier unresolvable', `give-up ${opId}: cannot locate the pre-commit frontier of ${targetEntry.opId}`);
    }
    // the A9 rebind row (tree remove only): the fresh TreeID the component
    // is compensated onto, with its `rebindOf` lineage audit
    let rebind: { componentId: string; treeNodeId: string; rebindOf: string } | undefined;
    let update: Uint8Array;
    try {
      if (targetEntry.domain === 'tree' && targetEntry.kind === 'remove') {
        const treeNodeId = this.#treeNodes.get(targetEntry.target.componentId);
        if (treeNodeId === undefined) {
          throw new Error(`bad-target: remove target ${targetEntry.target.componentId} has no tree node`);
        }
        const compensator = this.#doc.fork();
        compensator.setPeerId(peer);
        const loroTree = compensator.getTree(TREE_CONTAINER);
        const deadHandle = loroTree.nodes().find((node) => node.id === asTreeId(treeNodeId));
        if (deadHandle === undefined || !deadHandle.isDeleted()) {
          // already rebound (a revive landed between the remove and this
          // give-up) — the target op's effect no longer exists structurally
          throw new Error(`bad-target: remove target ${targetEntry.target.componentId} is unlocatable or no longer deleted`);
        }
        // the pre-remove placement, read where the node is still live
        let parentTreeNodeId: string | undefined;
        let index: number | undefined;
        const preState = this.#doc.forkAt(toLoroFrontiers(targetParent));
        const preTree = preState.getTree(TREE_CONTAINER);
        if (preTree.has(asTreeId(treeNodeId)) && !preTree.isNodeDeleted(asTreeId(treeNodeId))) {
          const liveHandle = preTree.nodes().find((node) => node.id === asTreeId(treeNodeId));
          const liveParent = liveHandle?.parent();
          parentTreeNodeId = liveParent === undefined ? undefined : liveParent.id;
          index = liveHandle?.index();
        }
        const item = deadHandle.data.get('item') ?? this.#journaledInsertItem(targetEntry.target.componentId);
        const rebound = loroTree.createNode(parentTreeNodeId === undefined ? undefined : asTreeId(parentTreeNodeId), index);
        if (item !== undefined) rebound.data.set('item', JSON.parse(JSON.stringify(item)) as never);
        const children = deadHandle.children() ?? [];
        for (let position = 0; position < children.length; position += 1) children[position]!.move(rebound, position);
        compensator.commit();
        update = compensator.export({ mode: 'update', from: this.#doc.oplogVersion() });
        rebind = { componentId: targetEntry.target.componentId, treeNodeId: rebound.id, rebindOf: treeNodeId };
      } else {
        const compensator = this.#doc.forkAt(toLoroFrontiers(targetEntry.frontier));
        compensator.setPeerId(peer);
        compensator.revertTo(toLoroFrontiers(targetParent));
        update = compensator.export({ mode: 'update', from: this.#doc.oplogVersion() });
      }
    } catch (error) {
      throw this.#candidateError(error, `give-up compensation of ${targetEntry.opId}`);
    }
    const parentFrontier = this.#doc.frontiers();
    this.#doc.import(update);
    if (rebind !== undefined) this.#treeNodes.set(rebind.componentId, rebind.treeNodeId);
    const value = targetEntry.domain === 'text' ? this.#bufferTextOf(targetEntry.containerKey) : this.treeSummary();
    const response = this.exportFor(syncCursor);
    const entry: CommitJournalEntry = {
      type: 'commit',
      seq: this.#nextSeq++,
      serverAdmissionTime: Date.now(),
      opId,
      actor,
      peer,
      domain: targetEntry.domain,
      kind: 'give-up-compensation',
      target: targetEntry.target,
      containerKey: targetEntry.containerKey,
      before: targetEntry.value,
      value,
      offset: 0,
      length: 0,
      text: '',
      frontier: this.#doc.frontiers(),
      parentFrontier,
      supersedes: targetEntry.opId,
      // O2: the remove-compensation's rebind mapping row (recovery re-points
      // the componentId onto the fresh TreeID; `rebindOf` audits the lineage)
      tree: rebind,
      updateB64: bytesToB64(update),
      responseB64: bytesToB64(response.update),
      responseSyncCursor: response.syncCursor,
    };
    this.#appendJournal(entry);
    this.#commitIndex.set(opId, entry);
    const receipt: CommitReceipt = {
      opId,
      status: 200,
      actor,
      domain: targetEntry.domain,
      target: targetEntry.target,
      containerKey: targetEntry.containerKey,
      frontier: entry.frontier,
      syncCursor: response.syncCursor,
      update: response.update,
      value,
      logTail: this.tailFor(targetEntry.target.componentId),
      serverAdmissionTime: entry.serverAdmissionTime,
      supersedes: targetEntry.opId,
    };
    this.#receipts.set(opId, receipt);
    this.#materializeCaches();
    return receipt;
  }

  /* ── §6 override sessions (本 peer loro UndoManager, M4) ─────────────── */

  /**
   * Open (idempotently) the actor's override session: a full-history fork
   * bound to the actor's registry peer with a loro `UndoManager` on it.
   * While a session is open, the gate's commit path routes the actor's ops
   * through the session fork, so the UndoManager records them (imports —
   * including every op committed before the session opened — are never
   * recorded; p3 evidence). Undo/redo generate compensating LOCAL commits
   * on the session fork, transformed against concurrent imports; the gate
   * exports and imports that delta under the frozen WAL ordering.
   *
   * Sessions are process-local runtime state: they are not journaled and
   * not recovered (an UndoManager stack cannot survive a restart by
   * design); give-up compensations remain the durable undo path.
   */
  openOverrideSession(actor: string): void {
    const peer = this.peerOf(actor);
    if (this.#overrideSessions.has(peer)) return;
    this.#installSession(actor, peer);
  }

  /** create (or replace) the peer's session fork + wired UndoManager */
  #installSession(actor: string, peer: number): KernelOverrideSession {
    const fork = this.#doc.fork();
    fork.setPeerId(peer);
    const session: KernelOverrideSession = { actor, peer, fork, undo: new UndoManager(fork, { mergeInterval: 0 }), lastPopped: [] };
    session.undo.setOnPush(() => ({ value: session.pendingOpId ?? '', cursors: [] }));
    session.undo.setOnPop((_isUndo, value) => {
      const opId = String(value.value ?? '');
      session.lastPopped = [...session.lastPopped, opId];
    });
    this.#overrideSessions.set(peer, session);
    return session;
  }

  closeOverrideSession(actor: string): void {
    const peer = this.knownPeerOf(actor);
    if (peer !== undefined) this.#overrideSessions.delete(peer);
  }

  overrideSessionOf(actor: string): OverrideSessionInfo {
    const peer = this.knownPeerOf(actor);
    const session = peer === undefined ? undefined : this.#overrideSessions.get(peer);
    if (session === undefined) {
      return { open: false, canUndo: false, canRedo: false };
    }
    return { open: true, canUndo: session.undo.canUndo(), canRedo: session.undo.canRedo() };
  }

  /** §6 override undo — the actor's own latest recorded op is compensated; others survive */
  performOverrideUndo(actor: string, opId: string, syncCursor: SyncCursor | undefined): OverrideOutcome {
    return this.#performOverride(actor, opId, 'override-undo', syncCursor, (session) => session.undo.undo());
  }

  /** §6 override redo — the actor's own latest undone op is re-applied; others survive */
  performOverrideRedo(actor: string, opId: string, syncCursor: SyncCursor | undefined): OverrideOutcome {
    return this.#performOverride(actor, opId, 'override-redo', syncCursor, (session) => session.undo.redo());
  }

  #performOverride(
    actor: string,
    opId: string,
    kind: 'override-undo' | 'override-redo',
    syncCursor: SyncCursor | undefined,
    drive: (session: KernelOverrideSession) => boolean,
  ): OverrideOutcome {
    const peer = this.knownPeerOf(actor);
    if (peer === undefined) return { status: 'no-session' };
    const session = this.#overrideSessions.get(peer);
    if (session === undefined) return { status: 'no-session' };
    // sync the session with everything canonical gained first — the undo
    // stacks transform against concurrent edits on import (probe-verified)
    session.fork.import(this.#doc.export({ mode: 'update', from: session.fork.oplogVersion() }));
    session.lastPopped = [];
    if (!drive(session)) return { status: 'empty-stack' };

    const parentFrontier = this.#doc.frontiers();
    const update = session.fork.export({ mode: 'update', from: this.#doc.oplogVersion() });
    this.#doc.import(update);
    const superseded = session.lastPopped.find((popped) => popped.length > 0);
    const origin = superseded !== undefined ? this.#commitIndex.get(superseded) : undefined;
    const containerKey = origin?.containerKey ?? TREE_CONTAINER;
    const value = origin === undefined || origin.domain === 'tree' ? this.treeSummary() : this.#bufferTextOf(containerKey);
    const response = this.exportFor(syncCursor);
    const entry: CommitJournalEntry = {
      type: 'commit',
      seq: this.#nextSeq++,
      serverAdmissionTime: Date.now(),
      opId,
      actor,
      peer,
      domain: origin?.domain ?? 'tree',
      kind,
      target: origin?.target ?? { componentId: actor },
      containerKey,
      before: origin?.value ?? '',
      value,
      offset: 0,
      length: 0,
      text: '',
      frontier: this.#doc.frontiers(),
      parentFrontier,
      supersedes: superseded !== undefined && superseded.length > 0 ? superseded : undefined,
      updateB64: bytesToB64(update),
      responseB64: bytesToB64(response.update),
      responseSyncCursor: response.syncCursor,
    };
    this.#appendJournal(entry);
    this.#commitIndex.set(opId, entry);
    const receipt: CommitReceipt = {
      opId,
      status: 200,
      actor,
      domain: entry.domain,
      target: entry.target,
      containerKey,
      frontier: entry.frontier,
      syncCursor: response.syncCursor,
      update: response.update,
      value,
      logTail: this.tailFor(entry.target.componentId),
      serverAdmissionTime: entry.serverAdmissionTime,
      supersedes: entry.supersedes,
    };
    this.#receipts.set(opId, receipt);
    this.#materializeCaches();
    return { status: 'performed', receipt };
  }

  /* ── version addressing (§5.1) ───────────────────────────────────────── */

  frontiers(): Frontier {
    return this.#doc.frontiers();
  }

  /** loro `cmpFrontiers` passthrough — unknown/pruned frontiers throw (mapped upstream) */
  cmpFrontiers(base: Frontier, current: Frontier): -1 | 0 | 1 | undefined {
    return this.#doc.cmpFrontiers(toLoroFrontiers(base), toLoroFrontiers(current));
  }

  /** cursor resolution on canonical (§5.3) */
  getCursorPos(cursor: Cursor): { update?: Cursor; offset: number; side: number } | undefined {
    return this.#doc.getCursorPos(cursor);
  }

  /** decode a base64 anchor and resolve its CURRENT canonical offset */
  resolveAnchor(anchorB64: string): number | undefined {
    return this.#doc.getCursorPos(Cursor.decode(b64ToBytes(anchorB64)))?.offset;
  }

  /**
   * A read-only view at an arbitrary included version — the §5.2 overlap
   * substrate. Both the incoming op's span and every concurrent record's
   * span are re-anchored on the SUBMITTER'S base through their stable
   * Cursor identities there; comparing base-relative offsets directly is
   * exactly what the spec forbids. Deleted regions collapse on current
   * canonical, which would hide true overlaps — at the submitter's base
   * both spans still express their original extents.
   *
   * M6: `cursorAt` ENCODES a stable anchor at the view's version — the
   * parallel lane's branches are concurrent clients over the shared
   * parallel-start base, so their anchors must be minted THERE (an
   * anchor encoded on later canonical can attach to items the base
   * never saw, and would silently stop resolving at the base).
   */
  versionView(at: Frontier): {
    cursorPos(cursor: Cursor): { offset: number; side: number } | undefined;
    anchorPos(anchorB64: string): number | undefined;
    cursorAt(containerKey: string, offset: number): Uint8Array | undefined;
  } {
    const view = this.#doc.forkAt(toLoroFrontiers(at));
    return {
      cursorPos: (cursor) => {
        const pos = view.getCursorPos(cursor);
        return pos === undefined ? undefined : { offset: pos.offset, side: pos.side };
      },
      anchorPos: (anchorB64) => view.getCursorPos(Cursor.decode(b64ToBytes(anchorB64)))?.offset,
      cursorAt: (containerKey, offset) => view.getText(containerKey).getCursor(offset, 0)?.encode(),
    };
  }

  /** a client-style full snapshot for building client views in tests/tools */
  snapshotBytes(): Uint8Array {
    return this.#doc.export({ mode: 'snapshot' });
  }

  /**
   * Can this sync cursor be honored on canonical RIGHT NOW (§4)? Only
   * `frontier`-tagged cursors can fail — `frontiersToVV` throws on
   * unknown/pruned frontiers. The admission boundary probes this BEFORE
   * any peer allocation, WAL write or commit so a stale cursor is
   * adjudicated as `409 stale-or-unknown-frontier` rather than blowing up
   * mid-commit (§5.5's ordering must never meet an unresolvable cursor).
   */
  syncCursorResolvable(cursor: SyncCursor): boolean {
    if (cursor.kind !== 'frontier') return true;
    try {
      this.#doc.frontiersToVV(toLoroFrontiers(cursor.value));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * The §5.6 normalized increment: `frontier` cursors go through
   * `frontiersToVV`, `vv` cursors feed `export({mode:"update", from})`
   * directly; no cursor yields the restricted (shallow) snapshot — that
   * path is the §5.6-sanctioned answer to an ABSENT cursor only. A
   * frontier loro cannot honor (unknown/pruned) raises
   * {@link PrunedSyncCursorError} for the admission layer to map onto the
   * 409 — never a silent shallow-snapshot degradation (impl-review-1 B2;
   * §4: 已裁剪 cursor 统一 409).
   */
  exportFor(cursor: SyncCursor | undefined): { update: Uint8Array; syncCursor: SyncCursor } {
    if (cursor === undefined) {
      return {
        update: this.#doc.export({ mode: 'shallow-snapshot', frontiers: this.#doc.oplogFrontiers() }),
        syncCursor: { kind: 'frontier', value: this.frontiers() },
      };
    }
    if (cursor.kind === 'frontier') {
      let from: ReturnType<LoroDoc['frontiersToVV']>;
      try {
        from = this.#doc.frontiersToVV(toLoroFrontiers(cursor.value));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new PrunedSyncCursorError(`syncCursor frontier is unknown or pruned on canonical: ${message}`);
      }
      return { update: this.#doc.export({ mode: 'update', from }), syncCursor: { kind: 'frontier', value: this.frontiers() } };
    }
    if (cursor.kind === 'vv') {
      const from = new VersionVector(new Map(Object.entries(cursor.value) as [`${number}`, number][]));
      const value = Object.fromEntries([...this.#doc.version().toJSON().entries()]);
      return { update: this.#doc.export({ mode: 'update', from }), syncCursor: { kind: 'vv', value } };
    }
    throw new TypeError(`syncCursor.kind must be "frontier" | "vv" (§4 tagged union), got ${JSON.stringify((cursor as { kind?: unknown }).kind)}`);
  }

  /* ── M7 journal-retention governance (§9 留存冻结) ─────────────────────── */

  /**
   * The active-cursor enumeration: every actor's last-issued sync cursor,
   * journal-derived (the newest `responseSyncCursor`/`syncCursor` row per
   * actor — deterministic across restarts, no registry state). This is
   * the retention contract a compaction must clear: EVERY cursor here
   * must have advanced to the compaction frontier first.
   */
  activeSyncCursors(): readonly ActiveSyncCursor[] {
    const byActor = new Map<string, ActiveSyncCursor>();
    for (const entry of this.#journal) {
      if (entry.type === 'commit' && entry.responseSyncCursor !== undefined) {
        byActor.set(entry.actor, { actor: entry.actor, seq: entry.seq, cursor: entry.responseSyncCursor });
      } else if (entry.type === 'rejection' && entry.syncCursor !== undefined) {
        byActor.set(entry.actor, { actor: entry.actor, seq: entry.seq, cursor: entry.syncCursor });
      }
    }
    return [...byActor.values()].sort((a, b) => (a.actor < b.actor ? -1 : 1));
  }

  /**
   * The tombstone-obligation enumeration: every journal tree row whose
   * evidence must survive a compaction — the deletion rows themselves
   * (remove / give-up-compensation / override-undo: the O1 direct-delete
   * discriminator) and the insert/update rows of components tombstoned
   * NOW (the rebind payload sources A5d/A8 and the §2 identity
   * high-water, which counts tombstoned ids' max counters). loro 1.16.1
   * persisted state may drop tombstones (CHANGELOG) — this enumeration
   * is what turns that engine fact into a kernel law.
   */
  tombstoneObligations(): readonly TombstoneObligation[] {
    const obligations: TombstoneObligation[] = [];
    for (const entry of this.#journal) {
      if (entry.type !== 'commit' || entry.domain !== 'tree') continue;
      const base = { seq: entry.seq, opId: entry.opId, actor: entry.actor, componentId: entry.target.componentId, kind: entry.kind, frontier: entry.frontier };
      if (entry.kind === 'remove' || entry.kind === 'give-up-compensation' || entry.kind === 'override-undo') {
        obligations.push({ ...base, why: 'deletion-evidence' });
        continue;
      }
      if ((entry.kind === 'insert' || entry.kind === 'update') && this.#componentIsDead(entry.target.componentId)) {
        obligations.push({ ...base, why: 'dead-node-payload' });
      }
    }
    return obligations;
  }

  /**
   * The §9 compaction guard. A plan `frontier` proposes to prune
   * everything the snapshot there subsumes (all ops causally ≤ it).
   * The verdict is ALLOWED only when BOTH hold:
   *   1. every active cursor has advanced to the frontier (its version
   *      vector dominates the frontier's) — a cursor that cannot resolve
   *      (unknown/pruned) counts as lagging, fail-safe;
   *   2. NO tombstone obligation lives at or below the frontier — an
   *      obligation row causally ≤ the pruning frontier would lose its
   *      evidence, so the compaction is refused outright (宁可不压不丢
   *      身份高水位). An obligation row whose frontier cannot resolve is
   *      treated as at risk, fail-safe.
   *
   * No compaction executor is wired today — the journal is append-only
   * and the doc is never pruned. This guard is the standing M7 gate any
   * future executor MUST route through (M7 注记: 压缩执行器接后续，或
   * 无需压缩时 guard 待命); until then it only ever audits.
   */
  evaluateCompaction(plan: CompactionPlan): CompactionDecision {
    const refusals: CompactionRefusal[] = [];
    const activeCursors = this.activeSyncCursors();
    const obligations = this.tombstoneObligations();

    const planVV = this.#frontierVV(plan.frontier);
    if (planVV === undefined) {
      refusals.push({
        reason: 'unknown-compaction-frontier',
        detail: 'the compaction frontier does not resolve on canonical (unknown or already pruned) — refusing to prune against a frontier the doc cannot address',
      });
      return { allowed: false, refusals, activeCursors, obligations };
    }

    for (const active of activeCursors) {
      const cursorVV = this.#cursorVV(active.cursor);
      if (cursorVV === undefined) {
        refusals.push({
          reason: 'lagging-cursor',
          detail: `actor ${JSON.stringify(active.actor)} (journal seq ${active.seq}) holds a cursor canonical cannot resolve — unknown or pruned frontier (§9: stale cursors get 409 + resync, never a prune underneath them)`,
        });
      } else if (!dominatesVersionVector(cursorVV, planVV)) {
        refusals.push({
          reason: 'lagging-cursor',
          detail: `actor ${JSON.stringify(active.actor)} (journal seq ${active.seq}) has not advanced to the compaction frontier yet (§9: compaction only after every active cursor crossed it)`,
        });
      }
    }

    for (const obligation of obligations) {
      const rowVV = this.#frontierVV(obligation.frontier);
      if (rowVV === undefined || dominatesVersionVector(planVV, rowVV)) {
        refusals.push({
          reason: 'tombstone-obligation',
          detail:
            `pruning at the proposed frontier would drop the ${obligation.why} of ${obligation.kind} on ${JSON.stringify(obligation.componentId)}` +
            ` (journal seq ${obligation.seq}, opId ${obligation.opId}) — the identity high-water and the A-route rebind both depend on tombstones` +
            ' (loro 1.16.1 persisted state may drop them); fail-safe: keep the journal/oplog whole',
        });
      }
    }

    return { allowed: refusals.length === 0, refusals, activeCursors, obligations };
  }

  /**
   * The throwing form of {@link evaluateCompaction} — the entry a future
   * compaction executor must call BEFORE pruning anything. Throws
   * {@link CompactionRefusedError} carrying the full decision.
   */
  requireCompactionAllowed(plan: CompactionPlan): void {
    const decision = this.evaluateCompaction(plan);
    if (!decision.allowed) throw new CompactionRefusedError(decision);
  }

  /** is the component's CURRENT node tombstoned (detached or inherited)? */
  #componentIsDead(componentId: string): boolean {
    const treeNodeId = this.#treeNodes.get(componentId);
    if (treeNodeId === undefined) return false; // never inserted — no tombstone exists
    const tree = this.#doc.getTree(TREE_CONTAINER);
    return tree.has(asTreeId(treeNodeId)) && tree.isNodeDeleted(asTreeId(treeNodeId));
  }

  /** a frontier → plain version vector; undefined when loro cannot resolve it */
  #frontierVV(frontier: Frontier): Map<string, number> | undefined {
    try {
      const vv = this.#doc.frontiersToVV(toLoroFrontiers(frontier));
      return new Map([...vv.toJSON().entries()].map(([peer, counter]) => [peer as string, counter as number]));
    } catch {
      return undefined;
    }
  }

  /** a sync cursor → plain version vector; undefined when unresolvable */
  #cursorVV(cursor: SyncCursor): Map<string, number> | undefined {
    if (cursor.kind === 'vv') return new Map(Object.entries(cursor.value));
    return this.#frontierVV(cursor.value);
  }

  /* ── truth access ────────────────────────────────────────────────────── */

  journalEntries(): readonly JournalEntry[] {
    return [...this.#journal];
  }

  walEntries(): readonly WalEntry[] {
    return this.#store.readWal();
  }

  receiptFor(opId: string): AdmissionResult | undefined {
    return this.#receipts.get(opId);
  }

  /** committed influence records of one buffer — the §5.2 overlap input */
  influenceFor(containerKey: string): readonly InfluenceRecord[] {
    return this.#influence.get(containerKey) ?? [];
  }

  /** component-granularity journal tail (§9 log-cursor, `cli sync` tail-5) */
  tailFor(componentId: string, limit = 5): JournalTailEntry[] {
    const rows: JournalTailEntry[] = [];
    for (const entry of this.#journal) {
      if (entry.type === 'commit' && entry.target.componentId === componentId) {
        rows.push({
          seq: entry.seq,
          opId: entry.opId,
          actor: entry.actor,
          componentId,
          buffer: entry.target.buffer ?? '',
          kind: entry.kind,
          value: entry.value,
          frontier: entry.frontier,
        });
      } else if (entry.type === 'buffer-seed' && entry.componentId === componentId) {
        rows.push({
          seq: entry.seq,
          opId: `seed:${entry.containerKey}`,
          actor: 'kernel',
          componentId,
          buffer: entry.buffer,
          kind: 'seed',
          value: entry.value,
          frontier: entry.frontier,
        });
      } else if (entry.type === 'rejection' && entry.target.componentId === componentId) {
        rows.push({
          seq: entry.seq,
          opId: entry.opId,
          actor: entry.actor,
          componentId,
          buffer: entry.target.buffer ?? '',
          kind: `rejected:${entry.code}`,
          value: '',
          frontier: entry.frontier,
        });
      }
    }
    return rows.slice(-limit);
  }

  recoveryNotes(): readonly string[] {
    return [...this.#recoveryNotes];
  }

  stats(): KernelStats {
    return {
      journalSeq: this.#nextSeq - 1,
      nextPeer: this.#nextPeer,
      actorCount: this.#actors.size,
      bufferCount: this.#buffers.size,
      receiptCount: this.#receipts.size,
    };
  }

  /* ── the admission internals (called only inside the gate) ───────────── */

  appendWal(entry: WalEntry): void {
    this.#store.appendWal(entry);
  }

  /**
   * §5.4-5.5 commit path for one TEXT op: apply on a candidate fork,
   * commit under the actor's peer, import into canonical, append the
   * journal row (with the response delta for the original submitter) —
   * one uninterrupted synchronous section. Fork-apply failures raise
   * {@link KernelCandidateError} BEFORE anything observable mutates.
   */
  commitTextOp(request: {
    envelope: TextOpEnvelope;
    peer: number;
    containerKey: string;
    resolvedOffset: number;
    responseCursor: SyncCursor | undefined;
  }): CommitReceipt {
    const { envelope, peer, containerKey, resolvedOffset, responseCursor } = request;
    const before = this.#bufferTextOf(containerKey);
    const length = envelope.kind === 'insert' ? 0 : envelope.length;
    const parentFrontier = this.#doc.frontiers();

    let anchors: { start: string; end: string } | undefined;
    let update: Uint8Array;
    let frontier: Frontier;
    try {
      const committed = this.#commitOnFork(peer, this.#commitMessage(envelope.target, envelope), envelope.timestamp, (fork) => {
        const text = fork.getText(containerKey);
        // stable-anchor identities of the affected span, encoded pre-apply
        const start = text.getCursor(resolvedOffset, 0);
        const end = text.getCursor(resolvedOffset + length, 0);
        if (start !== undefined && end !== undefined) {
          anchors = { start: bytesToB64(start.encode()), end: bytesToB64(end.encode()) };
        }
        if (envelope.kind === 'insert') {
          text.insert(resolvedOffset, envelope.text);
        } else if (envelope.kind === 'delete') {
          text.delete(resolvedOffset, envelope.length);
        } else {
          text.delete(resolvedOffset, envelope.length);
          text.insert(resolvedOffset, envelope.text);
        }
      }, envelope.opId);
      update = committed.update;
      frontier = committed.frontier;
    } catch (error) {
      throw this.#candidateError(error, `text ${envelope.kind} on ${containerKey}`);
    }

    const value = this.#bufferTextOf(containerKey);
    const response = this.exportFor(responseCursor);
    const entry: CommitJournalEntry = {
      type: 'commit',
      seq: this.#nextSeq++,
      serverAdmissionTime: Date.now(),
      opId: envelope.opId,
      transactionId: envelope.transactionId,
      actor: envelope.actor,
      peer,
      domain: 'text',
      kind: envelope.kind,
      target: envelope.target,
      containerKey,
      before,
      value,
      offset: resolvedOffset,
      length,
      text: envelope.text,
      frontier,
      parentFrontier,
      updateB64: bytesToB64(update),
      anchors,
      responseB64: bytesToB64(response.update),
      responseSyncCursor: response.syncCursor,
      clientEventTime: envelope.timestamp,
    };
    this.#appendJournal(entry);
    this.#commitIndex.set(envelope.opId, entry);
    this.#buffers.add(containerKey);
    if (anchors !== undefined) {
      const records = this.#influence.get(containerKey) ?? [];
      records.push({
        opId: envelope.opId,
        actor: envelope.actor,
        kind: envelope.kind,
        offset: resolvedOffset,
        length,
        frontier,
        anchors,
      });
      this.#influence.set(containerKey, records);
    }
    const receipt: CommitReceipt = {
      opId: envelope.opId,
      transactionId: envelope.transactionId,
      status: 200,
      actor: envelope.actor,
      domain: 'text',
      target: envelope.target,
      containerKey,
      frontier,
      syncCursor: response.syncCursor,
      update: response.update,
      value,
      logTail: this.tailFor(envelope.target.componentId),
      serverAdmissionTime: entry.serverAdmissionTime,
      clientEventTime: envelope.timestamp,
    };
    this.#receipts.set(envelope.opId, receipt);
    this.#materializeCaches();
    return receipt;
  }

  /**
   * §5.4-5.5 commit path for one TEXT CREATE op (M5a gap ①): materialize
   * the container (inserting `initialText` at 0 when non-empty) on a
   * candidate fork, commit under the ACTOR's registry peer — creation is
   * an ordinary actor-attributed op, never a kernel-bypass seed — and
   * journal a `kind=create` commit row. No anchors are recorded: a create
   * cannot overlap anything (its CAS was the container's nonexistence,
   * checked by the gate), so it never joins an influence set.
   */
  commitTextCreateOp(request: {
    envelope: TextCreateOpEnvelope;
    peer: number;
    containerKey: string;
    responseCursor: SyncCursor | undefined;
  }): CommitReceipt {
    const { envelope, peer, containerKey, responseCursor } = request;
    const parentFrontier = this.#doc.frontiers();
    let update: Uint8Array;
    let frontier: Frontier;
    try {
      const committed = this.#commitOnFork(peer, this.#commitMessage(envelope.target, envelope), envelope.timestamp, (fork) => {
        // even an empty create must register the container in the CRDT —
        // same shape as ensureBuffer's bootstrap commit; content (if any)
        // arrives as the create's own initialText, all under the actor peer
        if (envelope.initialText.length > 0) fork.getText(containerKey).insert(0, envelope.initialText);
      }, envelope.opId);
      update = committed.update;
      frontier = committed.frontier;
    } catch (error) {
      throw this.#candidateError(error, `text create on ${containerKey}`);
    }

    const value = this.#bufferTextOf(containerKey);
    const response = this.exportFor(responseCursor);
    const entry: CommitJournalEntry = {
      type: 'commit',
      seq: this.#nextSeq++,
      serverAdmissionTime: Date.now(),
      opId: envelope.opId,
      transactionId: envelope.transactionId,
      actor: envelope.actor,
      peer,
      domain: 'text',
      kind: 'create',
      target: envelope.target,
      containerKey,
      before: '',
      value,
      offset: 0,
      length: 0,
      text: envelope.initialText,
      frontier,
      parentFrontier,
      updateB64: bytesToB64(update),
      responseB64: bytesToB64(response.update),
      responseSyncCursor: response.syncCursor,
      clientEventTime: envelope.timestamp,
    };
    this.#appendJournal(entry);
    this.#commitIndex.set(envelope.opId, entry);
    this.#buffers.add(containerKey);
    const receipt: CommitReceipt = {
      opId: envelope.opId,
      transactionId: envelope.transactionId,
      status: 200,
      actor: envelope.actor,
      domain: 'text',
      target: envelope.target,
      containerKey,
      frontier,
      syncCursor: response.syncCursor,
      update: response.update,
      value,
      logTail: this.tailFor(envelope.target.componentId),
      serverAdmissionTime: entry.serverAdmissionTime,
      clientEventTime: envelope.timestamp,
    };
    this.#receipts.set(envelope.opId, receipt);
    this.#materializeCaches();
    return receipt;
  }

  /**
   * §5.4-5.5 commit path for one TREE op — same frozen ordering; the
   * componentId↔TreeID mapping row lives in the journal (never in band
   * with the CRDT state). Candidate failures (cycle, tombstone law,
   * engine limits) raise {@link KernelCandidateError} with zero effect.
   */
  commitTreeOp(request: { envelope: TreeOpEnvelope; peer: number }): CommitReceipt {
    const { envelope, peer } = request;
    const target = envelope.target;
    const parentFrontier = this.#doc.frontiers();
    // journal mapping row — insert/revive-rebind rows carry their extras
    // (A8 item, O1/O2 rebindOf lineage); M5a: the update row's previous
    // payload (the §9 前后值 audit) — both filled by the shared applier
    let mapping: { componentId: string; treeNodeId: string; rebindOf?: string; item?: unknown } | undefined;
    let previousItem: unknown;
    let update: Uint8Array;
    let frontier: Frontier;
    try {
      const committed = this.#commitOnFork(peer, this.#commitMessage(target, envelope), envelope.timestamp, (fork) => {
        ({ mapping, previousItem } = this.#applyTreeEnvelopeOnFork(fork, envelope));
      }, envelope.opId);
      update = committed.update;
      frontier = committed.frontier;
    } catch (error) {
      throw this.#candidateError(error, `tree ${envelope.kind} on ${target.componentId}`);
    }

    if (mapping !== undefined) this.#treeNodes.set(mapping.componentId, mapping.treeNodeId);
    const value = this.treeSummary();
    // §6: when the journal influence set shows same-node moves the submitter
    // had not seen, the admission is a concurrent-move adjudication — the
    // receipt keeps every contender with its orderKey and the LWW winner.
    // Concurrent tree UPDATES deliberately ride plain CRDT merge (loro
    // container data is LWW-per-key by lamport/peer): both journal rows
    // survive; §6 freezes move-adjudication receipts only.
    const lww = envelope.kind === 'move' ? this.#moveLwwReceipt(envelope, peer, frontier) : undefined;
    const response = this.exportFor(envelope.syncCursor);
    const entry: CommitJournalEntry = {
      type: 'commit',
      seq: this.#nextSeq++,
      serverAdmissionTime: Date.now(),
      opId: envelope.opId,
      transactionId: envelope.transactionId,
      actor: envelope.actor,
      peer,
      domain: 'tree',
      kind: envelope.kind,
      target,
      containerKey: TREE_CONTAINER,
      // update rows carry the replaced payload as their §9 前后值 audit
      before: envelope.kind === 'update' && previousItem !== undefined ? JSON.stringify(previousItem) : '',
      value,
      offset: 0,
      length: 0,
      text: '',
      frontier,
      parentFrontier,
      updateB64: bytesToB64(update),
      tree: mapping,
      treeEcho:
        envelope.kind === 'move'
          ? { componentId: envelope.tree.componentId, newParentId: envelope.tree.newParentId, index: envelope.tree.index }
          : envelope.kind === 'update'
            ? { componentId: envelope.tree.componentId }
            : undefined,
      lww,
      responseB64: bytesToB64(response.update),
      responseSyncCursor: response.syncCursor,
      clientEventTime: envelope.timestamp,
    };
    this.#appendJournal(entry);
    this.#commitIndex.set(envelope.opId, entry);
    const receipt: CommitReceipt = {
      opId: envelope.opId,
      transactionId: envelope.transactionId,
      status: 200,
      actor: envelope.actor,
      domain: 'tree',
      target,
      containerKey: TREE_CONTAINER,
      frontier,
      syncCursor: response.syncCursor,
      update: response.update,
      value,
      logTail: this.tailFor(target.componentId),
      serverAdmissionTime: entry.serverAdmissionTime,
      clientEventTime: envelope.timestamp,
      lww,
    };
    this.#receipts.set(envelope.opId, receipt);
    this.#materializeCaches();
    return receipt;
  }

  /**
   * The shared tree-op applier (M6 extraction): apply one §4 tree
   * envelope's payload on a candidate fork, returning the journal
   * mapping row (insert/revive-rebind) and the replaced `item` payload
   * (update rows' §9 前后值). Throws on the target law (unknown node,
   * tombstone, cycle detection inside loro) — callers wrap it into
   * {@link KernelCandidateError} with zero effect. Used by the single-op
   * commit path AND the M6 transaction lane (one fork, many ops).
   */
  #applyTreeEnvelopeOnFork(fork: LoroDoc, envelope: TreeOpEnvelope): {
    mapping?: { componentId: string; treeNodeId: string; rebindOf?: string; item?: unknown };
    previousItem?: unknown;
  } {
    const target = envelope.target;
    const loroTree = fork.getTree(TREE_CONTAINER);
    let mapping: { componentId: string; treeNodeId: string; rebindOf?: string; item?: unknown } | undefined;
    let previousItem: unknown;
    if (envelope.kind === 'insert') {
      if (this.#treeNodes.has(target.componentId)) {
        throw new Error(`bad-target: component ${target.componentId} already holds a tree node`);
      }
      const parentTreeNodeId = this.#requireLiveParent(loroTree, envelope.tree.parentComponentId);
      const node = loroTree.createNode(parentTreeNodeId, envelope.tree.index);
      // the item descriptor is component data (CRDT state); the id↔node mapping stays journal-only.
      // A8: the row persists the item too — the rebind's fallback source
      // if a future compaction drops the dead node's own data
      const item = JSON.parse(JSON.stringify(envelope.tree.item)) as unknown;
      node.data.set('item', item as never);
      mapping = { componentId: target.componentId, treeNodeId: node.id, item };
    } else if (envelope.kind === 'move') {
      const treeNodeId = this.#requireLiveNode(loroTree, envelope.tree.componentId, 'move');
      const parentTreeNodeId = this.#requireLiveParent(loroTree, envelope.tree.newParentId);
      loroTree.move(treeNodeId, parentTreeNodeId, envelope.tree.index);
    } else if (envelope.kind === 'remove') {
      const treeNodeId = this.#requireLiveNode(loroTree, envelope.tree.componentId, 'remove');
      loroTree.delete(treeNodeId);
    } else if (envelope.kind === 'update') {
      // data-only: parent/order untouched (move's lane); live node enforced
      const treeNodeId = this.#requireLiveNode(loroTree, envelope.tree.componentId, 'update');
      const handle = loroTree.nodes().find((node) => node.id === treeNodeId);
      if (handle === undefined) throw new Error(`bad-target: update target ${envelope.tree.componentId} is unlocatable`);
      previousItem = handle.data.get('item');
      handle.data.set('item', JSON.parse(JSON.stringify(envelope.tree.item)) as never);
    } else {
      // revive — two doors (§6; O1 unlock 2026-09-15, probe outcome A):
      //  - tombstone-by-inheritance → the engine move (the p12 path),
      //    TreeID kept, the attached subtree returns with the node;
      //  - directly-deleted → journal-level REBIND: a fresh node under
      //    the requested live parent carries the item read off the dead
      //    node's surviving data (A5d; insert row as fallback, A8), the
      //    journal mapping re-points with `rebindOf` auditing the
      //    lineage, the still-attached children are hung back keeping
      //    their TreeIDs (A6 — directly-deleted children are detached
      //    and invisible to children(), they stay dead), and the
      //    doc-level buffer containers — which never died (A1) — are
      //    reused verbatim.
      const treeNodeId = this.#treeNodes.get(envelope.tree.componentId);
      if (treeNodeId === undefined || !loroTree.has(asTreeId(treeNodeId))) {
        throw new Error(`bad-target: revive target ${envelope.tree.componentId} has no tree node`);
      }
      if (!loroTree.isNodeDeleted(asTreeId(treeNodeId))) {
        throw new Error(`bad-target: revive target ${envelope.tree.componentId} is live (nothing to revive)`);
      }
      const parentTreeNodeId = this.#requireLiveParent(loroTree, envelope.tree.parentComponentId);
      const parentHandle =
        parentTreeNodeId === undefined ? undefined : loroTree.nodes().find((node) => node.id === parentTreeNodeId);
      const deadHandle = loroTree.nodes().find((node) => node.id === treeNodeId);
      if (deadHandle === undefined) throw new Error(`bad-target: revive target ${envelope.tree.componentId} is unlocatable`);
      if (!this.#directlyDeletedTreeIds().has(treeNodeId)) {
        deadHandle.move(parentHandle, envelope.tree.index);
        mapping = { componentId: envelope.tree.componentId, treeNodeId };
      } else {
        const item = deadHandle.data.get('item') ?? this.#journaledInsertItem(envelope.tree.componentId);
        const rebound = loroTree.createNode(parentTreeNodeId, envelope.tree.index);
        if (item !== undefined) rebound.data.set('item', JSON.parse(JSON.stringify(item)) as never);
        const children = deadHandle.children() ?? [];
        for (let position = 0; position < children.length; position += 1) children[position]!.move(rebound, position);
        mapping = { componentId: envelope.tree.componentId, treeNodeId: rebound.id, rebindOf: treeNodeId };
      }
    }
    return { ...(mapping !== undefined ? { mapping } : {}), ...(previousItem !== undefined ? { previousItem } : {}) };
  }

  /* ── the M6 transaction commit core (§7 group lane) ──────────────────── */

  /**
   * Commit one group/parallel transaction (§7). FROZEN SEMANTICS:
   *
   *  - `strategy: 'rollback'` — ONE candidate fork carries every op
   *    (tree AND text — 树与文本混合 group 只能一次 commit), applied
   *    sequentially (a text op's `expectedBefore` must equal the buffer
   *    the fork holds at its turn — the executor's simulation, always
   *    enforced), then the compile gate runs over the whole candidate,
   *    then ONE commit + ONE import. A gate or apply failure discards
   *    the candidate with ZERO effect (v0 rollback = pre-commit discard;
   *    any future non-atomic executor must switch to `supersedes`
   *    compensations instead) — one tx-level rejection row is journaled
   *    under `tx:<transactionId>` and every op is listed rejected.
   *  - `strategy: 'keep-partial'` — per op: fresh candidate, apply, the
   *    compile gate over that single op's candidate, commit-or-reject;
   *    the receipt lists each op accepted/rejected EXPLICITLY (不得把
   *    两者混成「单次 commit 但部分成功」).
   *
   * Every journaled row carries the shared `transactionId` (§4 atomic
   * receipt); rollback rows share the single update bytes (first row
   * carries them, the rest empty — CRDT import dedups anyway, recovery
   * skips zero-length updates by construction). WAL ordering stays
   * frozen per op: `prepare → candidate → canonical → journal →
   * receipt`/`abort`. Note: transaction ops do NOT ride an open
   * override session (v0 — a plain candidate fork commits under the
   * actor's registry peer; give-up remains the durable undo path).
   */
  commitTransaction(request: {
    ops: readonly TransactionOp[];
    transactionId: string;
    actor: string;
    peer: number;
    strategy: 'rollback' | 'keep-partial';
    compileGate?: TransactionCompileGate;
    timestamp?: number;
    responseCursor?: SyncCursor;
    /**
     * journal the tx-level `tx:<id>` rejection row on rollback failure
     * (default true — the executor lane wants the durable audit row);
     * the admission single-op lane passes false and journals under the
     * ENVELOPE's opId through its own §5 rejection builder instead
     */
    journalTxRejection?: boolean;
  }): TransactionReceipts {
    const { ops, transactionId, actor, peer, strategy } = request;
    if (ops.length === 0) throw new TypeError('commitTransaction requires at least one op');
    if (typeof transactionId !== 'string' || transactionId.length === 0) throw new TypeError('commitTransaction requires a non-empty transactionId');
    const touched = [...new Set(ops.map((op) => op.target.componentId))];
    for (const op of ops) {
      this.appendWal({
        type: 'prepare',
        opId: op.opId,
        transactionId,
        actor,
        peer,
        target: walTargetOf(op),
        baseFrontiers: this.#doc.frontiers(),
        serverTime: Date.now(),
      });
    }
    return strategy === 'rollback'
      ? this.#commitTransactionRollback(request, touched, request.journalTxRejection !== false)
      : this.#commitTransactionKeepPartial(request, touched);
  }

  /** the rollback strategy — one fork, one commit, zero effect on failure */
  #commitTransactionRollback(
    request: { ops: readonly TransactionOp[]; transactionId: string; actor: string; peer: number; compileGate?: TransactionCompileGate; timestamp?: number; responseCursor?: SyncCursor },
    touched: readonly string[],
    journalTxRejection: boolean,
  ): TransactionReceipts {
    const { ops, transactionId, actor, peer, compileGate } = request;
    const parentFrontier = this.#doc.frontiers();
    const fork = this.#doc.fork();
    fork.setPeerId(peer);
    // per-op journal evidence collected during the sequential apply
    const applied: {
      op: TransactionOp;
      before: string;
      value: string;
      anchors?: { start: string; end: string };
      mapping?: { componentId: string; treeNodeId: string; rebindOf?: string; item?: unknown };
      previousItem?: unknown;
    }[] = [];
    try {
      for (const op of ops) {
        if (op.domain === 'text') {
          const evidence = this.#applyTransactionTextOnFork(fork, op);
          applied.push({ op, before: evidence.before, value: evidence.value, anchors: evidence.anchors });
        } else {
          const { mapping, previousItem } = this.#applyTreeEnvelopeOnFork(fork, op.envelope);
          applied.push({ op, before: '', value: '', mapping, previousItem });
        }
      }
      compileGate?.(fork, new Set(touched));
      // ONE commit for the whole group — the mixed tree/text atomic unit
      fork.setNextCommitOptions({ origin: actor, timestamp: request.timestamp, message: `tx=${transactionId} actor=${actor} ops=${ops.length}` });
      fork.commit();
    } catch (error) {
      for (const op of ops) {
        this.appendWal({ type: 'abort', opId: op.opId, reason: `transaction ${transactionId} rolled back: ${errorMessageOf(error)}`, serverTime: Date.now() });
      }
      // the tx-level durable rejection (audit + idempotent replay marker) —
      // skipped when the admission single-op lane journals under the
      // envelope's own opId instead
      const mapped = transactionErrorOf(error);
      if (journalTxRejection) {
        this.recordRejection(
          { opId: `tx:${transactionId}`, actor, target: walTargetOf(ops[0]!) },
          {
            opId: `tx:${transactionId}`,
            status: mapped.status,
            code: mapped.code,
            actor,
            target: walTargetOf(ops[0]!),
            canonicalFrontier: this.#doc.frontiers(),
            canonicalUpdate: undefined,
            syncCursor: undefined,
            retry: undefined,
            conflict: undefined,
            range: undefined,
            detail: `transaction ${JSON.stringify(transactionId)} rolled back with zero effect: ${mapped.detail}`,
            serverAdmissionTime: Date.now(),
          },
        );
      }
      return {
        transactionId,
        status: 'rejected',
        strategy: 'rollback',
        receipts: ops.map((op) => ({ opId: op.opId, status: 'rejected' as const, code: mapped.code, error: mapped.detail })),
        diagnostics: mapped.detail,
        effects: 0,
        touched,
      };
    }

    // single import — the ONE canonical advance of the whole group
    const update = fork.export({ mode: 'update', from: this.#doc.oplogVersion() });
    this.#doc.import(update);
    const frontier = this.#doc.frontiers();
    const treeValue = this.treeSummary();
    const response = this.exportFor(request.responseCursor);
    let first = true;
    for (const entry of applied) {
      const op = entry.op;
      if (entry.mapping !== undefined) this.#treeNodes.set(entry.mapping.componentId, entry.mapping.treeNodeId);
      const row: CommitJournalEntry = {
        type: 'commit',
        seq: this.#nextSeq++,
        serverAdmissionTime: Date.now(),
        opId: op.opId,
        transactionId,
        actor,
        peer,
        domain: op.domain,
        kind: op.domain === 'text' ? op.kind : op.envelope.kind,
        target: walTargetOf(op),
        containerKey: op.domain === 'text' ? op.containerKey : TREE_CONTAINER,
        before: op.domain === 'tree' && op.envelope.kind === 'update' && entry.previousItem !== undefined ? JSON.stringify(entry.previousItem) : entry.before,
        value: op.domain === 'text' ? entry.value : treeValue,
        offset: op.domain === 'text' ? op.offset : 0,
        length: op.domain === 'text' ? (op.kind === 'insert' ? 0 : op.length) : 0,
        text: op.domain === 'text' ? op.text : '',
        frontier,
        parentFrontier,
        updateB64: first ? bytesToB64(update) : '',
        anchors: op.domain === 'text' ? entry.anchors : undefined,
        tree: entry.mapping,
        treeEcho:
          op.domain === 'tree' && op.envelope.kind === 'move'
            ? { componentId: op.envelope.tree.componentId, newParentId: op.envelope.tree.newParentId, index: op.envelope.tree.index }
            : op.domain === 'tree' && op.envelope.kind === 'update'
              ? { componentId: op.envelope.tree.componentId }
              : undefined,
        responseB64: first ? bytesToB64(response.update) : '',
        responseSyncCursor: response.syncCursor,
        clientEventTime: request.timestamp,
      };
      this.#appendJournal(row);
      this.#commitIndex.set(op.opId, row);
      if (op.domain === 'text') {
        this.#buffers.add(op.containerKey);
        if (entry.anchors !== undefined) {
          const records = this.#influence.get(op.containerKey) ?? [];
          records.push({ opId: op.opId, actor, kind: op.kind, offset: op.offset, length: op.kind === 'insert' ? 0 : op.length, frontier, anchors: entry.anchors });
          this.#influence.set(op.containerKey, records);
        }
        const receipt: CommitReceipt = {
          opId: op.opId,
          transactionId,
          status: 200,
          actor,
          domain: 'text',
          target: walTargetOf(op),
          containerKey: op.containerKey,
          frontier,
          syncCursor: response.syncCursor,
          update: response.update,
          value: entry.value,
          logTail: this.tailFor(op.target.componentId),
          serverAdmissionTime: row.serverAdmissionTime,
          clientEventTime: request.timestamp,
        };
        this.#receipts.set(op.opId, receipt);
      } else {
        const receipt: CommitReceipt = {
          opId: op.opId,
          transactionId,
          status: 200,
          actor,
          domain: 'tree',
          target: walTargetOf(op),
          containerKey: TREE_CONTAINER,
          frontier,
          syncCursor: response.syncCursor,
          update: response.update,
          value: treeValue,
          logTail: this.tailFor(op.target.componentId),
          serverAdmissionTime: row.serverAdmissionTime,
          clientEventTime: request.timestamp,
        };
        this.#receipts.set(op.opId, receipt);
      }
      first = false;
    }
    this.#materializeCaches();
    return {
      transactionId,
      status: 'accepted',
      strategy: 'rollback',
      receipts: ops.map((op) => ({ opId: op.opId, status: 'accepted' as const })),
      effects: ops.length,
      frontier,
      syncCursor: response.syncCursor,
      update: response.update,
      touched,
    };
  }

  /** the keep-partial strategy — per-op candidate + gate + commit, explicit receipts */
  #commitTransactionKeepPartial(
    request: { ops: readonly TransactionOp[]; transactionId: string; actor: string; peer: number; compileGate?: TransactionCompileGate; timestamp?: number; responseCursor?: SyncCursor },
    touched: readonly string[],
  ): TransactionReceipts {
    const { ops, transactionId, actor, peer, compileGate } = request;
    const receipts: TransactionOpReceipt[] = [];
    let effects = 0;
    for (const op of ops) {
      const parentFrontier = this.#doc.frontiers();
      const fork = this.#doc.fork();
      fork.setPeerId(peer);
      let evidence: { before: string; value: string; anchors?: { start: string; end: string } };
      let mapping: { componentId: string; treeNodeId: string; rebindOf?: string; item?: unknown } | undefined;
      let previousItem: unknown;
      try {
        if (op.domain === 'text') {
          evidence = this.#applyTransactionTextOnFork(fork, op);
        } else {
          ({ mapping, previousItem } = this.#applyTreeEnvelopeOnFork(fork, op.envelope));
          evidence = { before: '', value: '' };
        }
        compileGate?.(fork, new Set([op.target.componentId]));
        fork.setNextCommitOptions({ origin: actor, timestamp: request.timestamp, message: `op=${op.opId} actor=${actor} tx=${transactionId}` });
        fork.commit();
      } catch (error) {
        const mapped = transactionErrorOf(error);
        this.appendWal({ type: 'abort', opId: op.opId, reason: `keep-partial op rejected: ${mapped.detail}`, serverTime: Date.now() });
        this.recordRejection(
          { opId: op.opId, actor, target: walTargetOf(op) },
          {
            opId: op.opId,
            status: mapped.status,
            code: mapped.code,
            actor,
            target: walTargetOf(op),
            canonicalFrontier: this.#doc.frontiers(),
            canonicalUpdate: undefined,
            syncCursor: undefined,
            retry: undefined,
            conflict: undefined,
            range: undefined,
            detail: `keep-partial op rejected, transaction ${JSON.stringify(transactionId)}: ${mapped.detail}`,
            serverAdmissionTime: Date.now(),
          },
        );
        receipts.push({ opId: op.opId, status: 'rejected', code: mapped.code, error: mapped.detail });
        continue;
      }
      const update = fork.export({ mode: 'update', from: this.#doc.oplogVersion() });
      this.#doc.import(update);
      if (mapping !== undefined) this.#treeNodes.set(mapping.componentId, mapping.treeNodeId);
      const frontier = this.#doc.frontiers();
      const response = this.exportFor(request.responseCursor);
      const treeValue = this.treeSummary();
      const row: CommitJournalEntry = {
        type: 'commit',
        seq: this.#nextSeq++,
        serverAdmissionTime: Date.now(),
        opId: op.opId,
        transactionId,
        actor,
        peer,
        domain: op.domain,
        kind: op.domain === 'text' ? op.kind : op.envelope.kind,
        target: walTargetOf(op),
        containerKey: op.domain === 'text' ? op.containerKey : TREE_CONTAINER,
        before:
          op.domain === 'tree' && op.envelope.kind === 'update' && previousItem !== undefined ? JSON.stringify(previousItem) : evidence.before,
        value: op.domain === 'text' ? evidence.value : treeValue,
        offset: op.domain === 'text' ? op.offset : 0,
        length: op.domain === 'text' ? (op.kind === 'insert' ? 0 : op.length) : 0,
        text: op.domain === 'text' ? op.text : '',
        frontier,
        parentFrontier,
        updateB64: bytesToB64(update),
        anchors: op.domain === 'text' ? evidence.anchors : undefined,
        tree: mapping,
        treeEcho:
          op.domain === 'tree' && op.envelope.kind === 'move'
            ? { componentId: op.envelope.tree.componentId, newParentId: op.envelope.tree.newParentId, index: op.envelope.tree.index }
            : op.domain === 'tree' && op.envelope.kind === 'update'
              ? { componentId: op.envelope.tree.componentId }
              : undefined,
        responseB64: bytesToB64(response.update),
        responseSyncCursor: response.syncCursor,
        clientEventTime: request.timestamp,
      };
      this.#appendJournal(row);
      this.#commitIndex.set(op.opId, row);
      if (op.domain === 'text') {
        this.#buffers.add(op.containerKey);
        if (evidence.anchors !== undefined) {
          const records = this.#influence.get(op.containerKey) ?? [];
          records.push({ opId: op.opId, actor, kind: op.kind, offset: op.offset, length: op.kind === 'insert' ? 0 : op.length, frontier, anchors: evidence.anchors });
          this.#influence.set(op.containerKey, records);
        }
      }
      this.#receipts.set(op.opId, {
        opId: op.opId,
        transactionId,
        status: 200,
        actor,
        domain: op.domain,
        target: walTargetOf(op),
        containerKey: op.domain === 'text' ? op.containerKey : TREE_CONTAINER,
        frontier,
        syncCursor: response.syncCursor,
        update: response.update,
        value: op.domain === 'text' ? evidence.value : treeValue,
        logTail: this.tailFor(op.target.componentId),
        serverAdmissionTime: row.serverAdmissionTime,
        clientEventTime: request.timestamp,
      });
      this.appendWal({ type: 'receipt', opId: op.opId, status: 200, serverTime: Date.now() });
      receipts.push({ opId: op.opId, status: 'accepted' });
      effects += 1;
    }
    this.#materializeCaches();
    const status: TransactionReceipts['status'] = effects === ops.length ? 'accepted' : effects === 0 ? 'rejected' : 'partial';
    const response = this.exportFor(request.responseCursor);
    return {
      transactionId,
      status,
      strategy: 'keep-partial',
      receipts,
      effects,
      frontier: this.#doc.frontiers(),
      syncCursor: response.syncCursor,
      update: response.update,
      touched,
    };
  }

  /**
   * Apply one transaction text op on the evolving candidate fork. The
   * `expectedBefore` evidence is ALWAYS enforced (a divergence between
   * the executor's simulation and the fork is an internal failure, never
   * a silently mis-anchored write); extent and surrogate-boundary checks
   * follow §5.3's law on the fork's current text. Anchors are encoded
   * pre-apply — the stable identities the influence set remembers.
   */
  #applyTransactionTextOnFork(
    fork: LoroDoc,
    op: Extract<TransactionOp, { domain: 'text' }>,
  ): { before: string; value: string; anchors?: { start: string; end: string } } {
    const text = fork.getText(op.containerKey);
    const before = text.toString();
    if (before !== op.expectedBefore) {
      throw new KernelCandidateError('internal', 'executor simulation diverged from the candidate buffer', `text ${op.kind} on ${op.containerKey}: expectedBefore mismatch`);
    }
    const length = op.kind === 'insert' ? 0 : op.length;
    if (op.offset > before.length || op.offset + length > before.length) {
      throw new KernelCandidateError('bad-target', `extent [${op.offset}, ${op.offset + length}) exceeds the ${before.length}-unit buffer`, `text ${op.kind} on ${op.containerKey}: stale extent`);
    }
    if (splitsSurrogatePair(before, op.offset) || (length > 0 && splitsSurrogatePair(before, op.offset + length))) {
      throw new KernelCandidateError('utf16-boundary', `range [${op.offset}, ${op.offset + length}) splits a surrogate pair`, `text ${op.kind} on ${op.containerKey}: surrogate boundary`);
    }
    let anchors: { start: string; end: string } | undefined;
    const start = text.getCursor(op.offset, 0);
    const end = text.getCursor(op.offset + length, 0);
    if (start !== undefined && end !== undefined) anchors = { start: bytesToB64(start.encode()), end: bytesToB64(end.encode()) };
    if (op.kind === 'insert') {
      text.insert(op.offset, op.text);
    } else if (op.kind === 'delete') {
      text.delete(op.offset, op.length);
    } else {
      text.delete(op.offset, op.length);
      text.insert(op.offset, op.text);
    }
    return { before, value: text.toString(), anchors };
  }

  /**
   * Persist a rejection — rejections are receipts too (§5.0 idempotency),
   * so the journal row carries the COMPLETE error envelope (impl-review-1
   * B3): the one-shot resync extras (`canonicalUpdate`, retry `syncCursor`,
   * `retry`, `conflict`, `range`, `detail`) are persisted verbatim (bytes
   * as base64) and recovered byte-equal. A restart must replay the
   * ORIGINAL receipt, not a freshly-recomputed lookalike.
   */
  recordRejection(envelope: { opId: string; actor: string; target: OpTarget }, error: ErrorEnvelope): ErrorEnvelope {
    this.#appendJournal({
      type: 'rejection',
      seq: this.#nextSeq++,
      serverAdmissionTime: error.serverAdmissionTime,
      opId: envelope.opId,
      actor: envelope.actor,
      status: error.status,
      code: error.code,
      target: envelope.target,
      frontier: error.canonicalFrontier,
      canonicalUpdateB64: error.canonicalUpdate !== undefined ? bytesToB64(error.canonicalUpdate) : undefined,
      syncCursor: error.syncCursor,
      retryB64:
        error.retry === undefined
          ? undefined
          : {
              cursorBytesB64: error.retry.cursorBytes !== undefined ? bytesToB64(error.retry.cursorBytes) : undefined,
              reason: error.retry.reason,
            },
      conflict: error.conflict,
      range: error.range,
      detail: error.detail,
    });
    this.#receipts.set(envelope.opId, error);
    this.#materializeCaches();
    return error;
  }

  /* ── internals ───────────────────────────────────────────────────────── */

  #appendJournal(entry: JournalEntry): void {
    this.#store.appendJournal(entry);
    this.#journal.push(entry);
  }

  #bufferTextOf(containerKey: string): string {
    return this.#doc.getText(containerKey).toString();
  }

  #commitMessage(target: OpTarget, envelope: { opId: string; actor: string }): string {
    const buffer = target.buffer === undefined ? '' : ` buffer=${target.buffer}`;
    return `op=${envelope.opId} actor=${envelope.actor} component=${target.componentId}${buffer}`;
  }

  #requireLiveNode(loroTree: LoroTree, componentId: string, action: string): TreeID {
    const treeNodeId = this.#treeNodes.get(componentId);
    if (treeNodeId === undefined || !loroTree.has(asTreeId(treeNodeId))) {
      throw new Error(`bad-target: ${action} target ${componentId} has no tree node`);
    }
    if (loroTree.isNodeDeleted(asTreeId(treeNodeId))) {
      throw new Error(`bad-target: ${action} target ${componentId} is tombstoned (§6)`);
    }
    return asTreeId(treeNodeId);
  }

  #requireLiveParent(loroTree: LoroTree, parentComponentId: string | undefined): TreeID | undefined {
    if (parentComponentId === undefined) return undefined;
    const parentTreeNodeId = this.#treeNodes.get(parentComponentId);
    if (parentTreeNodeId === undefined || !loroTree.has(asTreeId(parentTreeNodeId))) {
      throw new Error(`bad-target: parent ${parentComponentId} has no tree node`);
    }
    if (loroTree.isNodeDeleted(asTreeId(parentTreeNodeId))) {
      throw new Error(`bad-target: parent ${parentComponentId} is tombstoned (§6)`);
    }
    return asTreeId(parentTreeNodeId);
  }

  /**
   * O1 (2026-09-15): the TreeIDs the journal shows were DIRECTLY deleted —
   * a `remove` row's mapped target at its row position, plus the node a
   * give-up/override-undo took out by compensating a tree `insert`. The
   * set is the revive-door discriminator: an inherited tombstone (absent
   * here) is still attached to its (dead) parent and revives through the
   * engine move keeping its TreeID; a directly-deleted one (present here)
   * is detached — the engine move throws on it — and takes the rebind.
   * Journal-derived on purpose: it is deterministic across restarts and
   * never depends on undocumented engine internals. A miss falls back to
   * the engine path failing honestly (the pre-O1 404), never to a wrong
   * rebind; a false positive is impossible (only our own kernel deletes).
   */
  #directlyDeletedTreeIds(): ReadonlySet<string> {
    const mapping = new Map<string, string>();
    const direct = new Set<string>();
    for (const entry of this.#journal) {
      if (entry.type !== 'commit') continue;
      if (entry.tree !== undefined) mapping.set(entry.tree.componentId, entry.tree.treeNodeId);
      if (entry.domain !== 'tree') continue;
      if (entry.kind === 'remove') {
        const deleted = mapping.get(entry.target.componentId);
        if (deleted !== undefined) direct.add(deleted);
      } else if ((entry.kind === 'give-up-compensation' || entry.kind === 'override-undo') && entry.supersedes !== undefined) {
        // compensating a tree insert removes that node — a direct deletion
        const superseded = this.#commitIndex.get(entry.supersedes);
        if (superseded?.domain === 'tree' && superseded.kind === 'insert') {
          const deleted = mapping.get(superseded.target.componentId);
          if (deleted !== undefined) direct.add(deleted);
        }
      }
    }
    return direct;
  }

  /**
   * A8 (2026-09-15): the item payload persisted on the component's latest
   * insert row — the rebind's fallback source when the dead node's own
   * CRDT data has been dropped by a (future) journal/oplog compaction.
   * The primary source is always the dead node's data itself (A5d).
   */
  #journaledInsertItem(componentId: string): unknown {
    for (let index = this.#journal.length - 1; index >= 0; index -= 1) {
      const entry = this.#journal[index];
      if (entry?.type === 'commit' && entry.domain === 'tree' && entry.kind === 'insert' && entry.target.componentId === componentId) {
        return entry.tree?.item;
      }
    }
    return undefined;
  }

  #candidateError(error: unknown, where: string): KernelCandidateError {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('middle of the codepoin')) {
      return new KernelCandidateError('utf16-boundary', message, `candidate fork rejected a surrogate-splitting op (${where})`);
    }
    if (message.includes('bad-target') || message.includes('Tree') || message.includes('deleted')) {
      return new KernelCandidateError('bad-target', message, `candidate fork rejected the op (${where}): ${message}`);
    }
    return new KernelCandidateError('internal', message, `candidate fork failed unexpectedly (${where}): ${message}`);
  }

  /**
   * The frozen §5.4-5.5 core: fork canonical, set the writing peer, run
   * the candidate edits, stamp commit options (`origin: actor` is not
   * persisted by loro — the journal row is the actor truth, P6), export
   * the delta relative to canonical, and import it back — one
   * synchronous section so the gate's serialization is never undercut.
   *
   * M4: when the peer has an open override session, the edits run on the
   * SESSION fork instead of a fresh one (synced first) so the session's
   * loro UndoManager records the commit under the actor's own peer; the
   * opId stamp rides the undo step via the onPush metadata.
   */
  #commitOnFork(
    peer: number,
    message: string,
    timestamp: number | undefined,
    apply: (fork: LoroDoc) => void,
    sessionOpId?: string,
  ): { update: Uint8Array; frontier: Frontier } {
    const beforeVV = this.#doc.oplogVersion();
    const session = this.#overrideSessions.get(peer);
    let fork: LoroDoc;
    if (session !== undefined) {
      // bring the session up to canonical — its stacks transform against
      // the concurrent imports (probe-verified), counters stay collision-free
      session.fork.import(this.#doc.export({ mode: 'update', from: session.fork.oplogVersion() }));
      session.pendingOpId = sessionOpId;
      fork = session.fork;
    } else {
      fork = this.#doc.fork();
      fork.setPeerId(peer);
    }
    try {
      apply(fork);
      fork.setNextCommitOptions({ origin: message, timestamp, message });
      fork.commit();
    } catch (error) {
      // a fresh fork is discarded on candidate failure, but a session fork
      // would KEEP any partial edits (loro applies before commit) — the
      // only safe salvage is a clean re-install; the undo stack is lost,
      // which the give-up path (durable, journal-backed) still covers
      if (session !== undefined) this.#installSession(session.actor, session.peer);
      throw error;
    } finally {
      if (session !== undefined) session.pendingOpId = undefined;
    }
    const update = fork.export({ mode: 'update', from: beforeVV });
    this.#doc.import(update);
    return { update, frontier: this.#doc.frontiers() };
  }

  /* ── §6 concurrent-move LWW receipt machinery ─────────────────────────── */

  /**
   * The §6/p12 adjudication audit for one committed `move`: contenders =
   * journal-indexed moves of the same component the submitter had NOT seen
   * (its `baseFrontiers`), plus the incoming op itself. orderKey comes
   * from the engine's own change metadata (`getAllChanges` → lamport);
   * the winner is max(lamport, peer) — cross-checked against the engine's
   * `getLastMoveId` on the node, which is the effective-move truth.
   */
  #moveLwwReceipt(envelope: TreeOpEnvelope & { kind: 'move' }, peer: number, postFrontier: Frontier): TreeLwwReceipt | undefined {
    const contenders: { contender: TreeLwwContender; counter: number }[] = [];
    for (const entry of this.#commitIndex.values()) {
      if (entry.domain !== 'tree' || entry.kind !== 'move' || entry.opId === envelope.opId) continue;
      if (entry.target.componentId !== envelope.tree.componentId) continue;
      let relation: -1 | 0 | 1 | undefined;
      try {
        relation = this.#doc.cmpFrontiers(toLoroFrontiers(entry.frontier), toLoroFrontiers(envelope.baseFrontiers));
      } catch {
        continue; // pruned evidence cannot anchor an adjudication — skip it
      }
      if (relation === -1 || relation === 0) continue; // the submitter saw it — not a contender
      const counter = this.#changeCounterOf(entry.peer, entry.frontier);
      if (counter === undefined) continue;
      contenders.push({
        contender: {
          opId: entry.opId,
          actor: entry.actor,
          peer: entry.peer,
          newParentId: entry.treeEcho?.newParentId,
          orderKey: { lamport: this.#lamportOf(entry.peer, counter) ?? -1, peer: entry.peer },
        },
        counter,
      });
    }
    if (contenders.length === 0) return undefined;
    const ownCounter = this.#changeCounterOf(peer, postFrontier);
    if (ownCounter === undefined) return undefined;
    contenders.push({
      contender: {
        opId: envelope.opId,
        actor: envelope.actor,
        peer,
        newParentId: envelope.tree.newParentId,
        orderKey: { lamport: this.#lamportOf(peer, ownCounter) ?? -1, peer },
      },
      counter: ownCounter,
    });

    const byOrderKey = (a: { contender: TreeLwwContender }, b: { contender: TreeLwwContender }): number =>
      a.contender.orderKey.lamport !== b.contender.orderKey.lamport
        ? a.contender.orderKey.lamport - b.contender.orderKey.lamport
        : a.contender.orderKey.peer - b.contender.orderKey.peer;
    let winner = [...contenders].sort(byOrderKey).at(-1)!;
    // engine truth: the node's effective last move wins any disagreement
    const treeNodeId = this.#treeNodes.get(envelope.tree.componentId);
    const handle = treeNodeId === undefined ? undefined : this.#doc.getTree(TREE_CONTAINER).nodes().find((node) => node.id === asTreeId(treeNodeId));
    const lastMove = handle?.getLastMoveId();
    if (lastMove !== undefined) {
      const engineWinner = contenders.find((item) => String(lastMove.peer) === String(item.contender.peer) && lastMove.counter === item.counter);
      if (engineWinner !== undefined) winner = engineWinner;
    }
    return {
      componentId: envelope.tree.componentId,
      contenders: contenders.map((item) => item.contender),
      winnerOpId: winner.contender.opId,
      resolution: 'lww',
    };
  }

  /** the op's own change counter: its peer's point on the post-commit frontier */
  #changeCounterOf(peer: number, frontier: Frontier): number | undefined {
    return frontier.find((point) => String(point.peer) === String(peer))?.counter;
  }

  /** the effective Lamport of one change (peer, counter) from the engine's oplog */
  #lamportOf(peer: number, counter: number): number | undefined {
    const changes = this.#doc.getAllChanges().get(String(peer) as `${number}`);
    return changes?.find((change) => change.counter === counter)?.lamport;
  }

  #receiptFromCommit(entry: CommitJournalEntry): CommitReceipt {
    return {
      opId: entry.opId,
      transactionId: entry.transactionId,
      status: 200,
      actor: entry.actor,
      domain: entry.domain,
      target: entry.target,
      containerKey: entry.containerKey,
      frontier: entry.frontier,
      syncCursor: entry.responseSyncCursor,
      update: b64ToBytes(entry.responseB64),
      value: entry.value,
      logTail: this.tailFor(entry.target.componentId),
      serverAdmissionTime: entry.serverAdmissionTime,
      clientEventTime: entry.clientEventTime,
      supersedes: entry.supersedes,
      lww: entry.lww,
    };
  }

  #receiptFromRejection(entry: Extract<JournalEntry, { type: 'rejection' }>): ErrorEnvelope {
    // B3 (impl-review-1): the durable row carries the complete original
    // envelope — the one-shot resync extras recover byte-equal (base64 →
    // bytes), so a restarted kernel replays the ORIGINAL receipt the
    // submitter got, never a re-adjudicated lookalike. Key-for-key the
    // rebuilt envelope matches the in-memory one (absent fields stay
    // absent-valued keys, exactly like the #reject builder).
    const retry =
      entry.retryB64 === undefined
        ? undefined
        : {
            ...(entry.retryB64.cursorBytesB64 !== undefined ? { cursorBytes: b64ToBytes(entry.retryB64.cursorBytesB64) } : {}),
            ...(entry.retryB64.reason !== undefined ? { reason: entry.retryB64.reason } : {}),
          };
    return {
      opId: entry.opId,
      status: entry.status as ErrorEnvelope['status'],
      code: entry.code,
      actor: entry.actor,
      target: entry.target,
      canonicalFrontier: entry.frontier,
      canonicalUpdate: entry.canonicalUpdateB64 !== undefined ? b64ToBytes(entry.canonicalUpdateB64) : undefined,
      syncCursor: entry.syncCursor,
      retry,
      conflict: entry.conflict,
      range: entry.range,
      detail: entry.detail,
      serverAdmissionTime: entry.serverAdmissionTime,
    };
  }
}
