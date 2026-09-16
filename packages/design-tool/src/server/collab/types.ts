/**
 * @jixoai/ui-design (collab) — the op envelope, receipts, and error
 * envelopes of the admission surface (collab-protocol M2;
 * protocol-spec §4 op 信封 / §5 错误协议 / §9 journal).
 *
 * The envelope is a TAGGED UNION on `domain` (§4): a `text` op must carry
 * `cursorBytes` + kernel-form `offset/length` + `text`; a `tree` op must
 * carry its kind-specific `tree` payload and MUST NOT carry text
 * positioning fields — never guess an op's type from missing fields.
 *
 * `syncCursor` is a tagged union too (§4): only `{ kind: "frontier" }`
 * goes through `frontiersToVV`; a raw version vector is never passed off
 * as a frontier.
 *
 * The error surface is the four-code protocol of §5 (stale-or-unknown-
 * frontier / stale-cursor / bad-target / utf16-boundary) plus the
 * explicit M2 not-ready marker for `transactionId` groups (the group
 * executor is M6). Error envelopes always carry `code`, `status`,
 * `target`, `canonicalFrontier`; per-code extras follow §5's resync
 * rules (canonicalUpdate + syncCursor for frontier rejections, retry
 * cursorBytes-or-reselect for stale cursors, both ops + tail-5 +
 * current text for conflicts, the failing range for surrogate splits).
 *
 * M5a (tasks M3 gaps ①②): the text lane gains `kind=create` (explicit
 * buffer creation — see {@link TextCreateOpEnvelope} for the frozen
 * two-candidate choice) and the tree lane gains `kind=update` (node
 * meta payload replacement — {@link TreeUpdatePayload}); both extend
 * the tagged union additively, so M2/M3/M4 consumers are unaffected.
 *
 * M6 (§7): the journal gains the SCRIPT artifact row (intent-only —
 * replay is always op-based) and the formal `projection-pending` row
 * (M5 leftover ②); the error surface gains the transaction lane's
 * `compile-failed` (422) and `dep-unmet` (409) while RETIRING the M2
 * `transaction-executor-unavailable` marker (kept in the union only so
 * persisted rows keep replaying byte-equal).
 *
 * Original need: collab-protocol M2 + M5a + M6 (2026-09-15).
 */

import type { ContainerID } from 'loro-crdt';

/* ── version addressing (Loro frontiers / version vectors) ────────────── */

/** one Loro op id — the string form of a numeric peer plus its counter */
export interface FrontierPoint {
  readonly peer: string;
  readonly counter: number;
}

/** a Loro frontier: the causal heads a submission has seen (§4 baseFrontiers) */
export type Frontier = readonly FrontierPoint[];

/** a version vector as plain JSON data (`{ "<peer>": counter }`) */
export type VersionVectorValue = Readonly<Record<string, number>>;

/**
 * The sync cursor of a request/response — tagged exactly as §4 freezes it.
 * `frontier` is converted with `frontiersToVV`; `vv` feeds `export({mode:
 * "update", from})` directly. Never conflate the two.
 */
export type SyncCursor =
  | { readonly kind: 'frontier'; readonly value: Frontier }
  | { readonly kind: 'vv'; readonly value: VersionVectorValue };

/* ── targets (§4: bare global component id + buffer name) ─────────────── */

/** text ops address one named buffer of one component */
export interface TextTarget {
  readonly componentId: string;
  readonly buffer: string;
}

/** tree ops address the component tree itself; `buffer` must be absent */
export interface TreeTarget {
  readonly componentId: string;
  readonly buffer?: undefined;
}

export type OpTarget = TextTarget | TreeTarget;

/* ── tree payloads (§4 / §11 + M5a data-update) ────────────────────────── */

export interface TreeInsertPayload {
  /** component descriptor (tag/props seed) — opaque JSON, stored on the node */
  readonly item: unknown;
  /** omit (or leave undefined) to insert as a forest root */
  readonly parentComponentId?: string;
  readonly index?: number;
}
export interface TreeMovePayload {
  readonly componentId: string;
  readonly newParentId?: string;
  readonly index?: number;
}
export interface TreeRemovePayload {
  readonly componentId: string;
}
export interface TreeRevivePayload {
  readonly componentId: string;
  readonly parentComponentId?: string;
  readonly index?: number;
}
/**
 * M5a gap ② (tasks M3): the tree data-update op — replace one node's `item`
 * meta payload. FROZEN SEMANTICS: full replacement (partial merges are the
 * caller's job); structure (parent/order) is NOT touched here — that is
 * move's lane. `item` must be a plain JSON value (the boundary rejects
 * anything JSON cannot round-trip before a peer/WAL/journal cost is paid).
 */
export interface TreeUpdatePayload {
  readonly componentId: string;
  readonly item: unknown;
}

/* ── the op envelope — tagged union on `domain` (§4) ──────────────────── */

interface EnvelopeCommon {
  /** `human` / `agent:<id>` / `file-system` (§4 actor) */
  readonly actor: string;
  /** global idempotency key — actor + monotonic sequence (§5 step 0) */
  readonly opId: string;
  /** the causal version the submitter built the op on (§4 baseFrontiers) */
  readonly baseFrontiers: Frontier;
  /** client event time; the server records its own admission time (§4) */
  readonly timestamp?: number;
  /** optional group/parallel transaction id — the executor lands in M6 */
  readonly transactionId?: string;
  /** the cursor the response increment is normalized against (§5 step 6) */
  readonly syncCursor?: SyncCursor;
}

/** `domain=text`: cursorBytes + kernel-form offset/length + text fields */
export interface TextOpEnvelope extends EnvelopeCommon {
  readonly domain: 'text';
  readonly kind: 'insert' | 'delete' | 'replace';
  readonly target: TextTarget;
  /** stable anchor (Loro Cursor encode) — mandatory for external text ops */
  readonly cursorBytes: Uint8Array;
  /** kernel-form UTF-16 offset — recomputed from the anchor at admission */
  readonly offset: number;
  /** affected length — 0 for insert (§4) */
  readonly length: number;
  /** inserted content — '' for delete (§4) */
  readonly text: string;
  /** optional fingerprint evidence — checked, never used as identity (§5.2) */
  readonly expectedRaw?: string;
  readonly expectedHash?: string;
}

/**
 * `domain=text, kind=create` (M5a gap ①): explicit buffer creation. FROZEN
 * SEMANTICS (the two-candidate choice): creation is its own kind, NOT an
 * `insert` onto a nonexistent container — §4's tagged-union law ("不能靠省略
 * 字段来猜测 op 类型") forbids an op whose meaning flips on container
 * existence, and no stable anchor can exist for a container that does not
 * exist yet (§3's cursorBytes law). `initialText` may be empty (container-
 * only creation — the ingest bootstrap shape). Anchor/extent fields
 * (`cursorBytes`/`offset`/`length`/`text`) must be ABSENT; a create can
 * never overlap anything (its CAS is the container's nonexistence), so it
 * contributes no influence-set anchors.
 */
export interface TextCreateOpEnvelope extends EnvelopeCommon {
  readonly domain: 'text';
  readonly kind: 'create';
  readonly target: TextTarget;
  /** the buffer's initial content — the whole first truth of the container */
  readonly initialText: string;
}

/** `domain=tree`: kind-specific payload, no text positioning fields (§4) */
export type TreeOpEnvelope =
  | (EnvelopeCommon & { readonly domain: 'tree'; readonly kind: 'insert'; readonly target: TreeTarget; readonly tree: TreeInsertPayload })
  | (EnvelopeCommon & { readonly domain: 'tree'; readonly kind: 'move'; readonly target: TreeTarget; readonly tree: TreeMovePayload })
  | (EnvelopeCommon & { readonly domain: 'tree'; readonly kind: 'remove'; readonly target: TreeTarget; readonly tree: TreeRemovePayload })
  | (EnvelopeCommon & { readonly domain: 'tree'; readonly kind: 'revive'; readonly target: TreeTarget; readonly tree: TreeRevivePayload })
  | (EnvelopeCommon & { readonly domain: 'tree'; readonly kind: 'update'; readonly target: TreeTarget; readonly tree: TreeUpdatePayload });

export type OpEnvelope = TextOpEnvelope | TextCreateOpEnvelope | TreeOpEnvelope;

/* ── tree concurrent-move LWW receipts (§6, M4; p12 semantics productized) ── */

/** one contender of an adjudicated concurrent-move set (§6) */
export interface TreeLwwContender {
  readonly opId: string;
  readonly actor: string;
  /** the actor's numeric registry peer (design 治理冻结二) */
  readonly peer: number;
  /** the move's destination parent component (`undefined` = forest root) */
  readonly newParentId?: string;
  /** the frozen LWW order key — effective Lamport first, numeric peer second */
  readonly orderKey: { readonly lamport: number; readonly peer: number };
}

/**
 * The audit receipt of a concurrent tree-move adjudication (§6): every
 * contender with its `orderKey={lamport,peer}`, the winner, and the frozen
 * `resolution:"lww"`. Attached to the commit receipt/journal row of the
 * admission at which the contention was detected (the journal influence
 * set identifies same-node moves the submitter had not seen).
 */
export interface TreeLwwReceipt {
  readonly componentId: string;
  readonly contenders: readonly TreeLwwContender[];
  readonly winnerOpId: string;
  readonly resolution: 'lww';
}

/* ── receipts (the 200 lane) ──────────────────────────────────────────── */

/** one journal row of a component's tail-N log (`cli sync` default tail-5) */
export interface JournalTailEntry {
  readonly seq: number;
  readonly opId: string;
  readonly actor: string;
  readonly componentId: string;
  readonly buffer: string;
  readonly kind: string;
  readonly value: string;
  readonly frontier: Frontier;
}

export interface CommitReceipt {
  readonly opId: string;
  readonly transactionId?: string;
  readonly status: 200;
  readonly actor: string;
  readonly domain: 'text' | 'tree';
  readonly target: OpTarget;
  readonly containerKey: string;
  /** post-commit canonical frontier */
  readonly frontier: Frontier;
  /** normalized per the request's syncCursor tag (§5 step 6) */
  readonly syncCursor: SyncCursor;
  /** canonical delta (or restricted snapshot when no cursor was given) */
  readonly update: Uint8Array;
  /** post-commit buffer text (text domain) / tree summary (tree domain) */
  readonly value: string;
  readonly logTail: readonly JournalTailEntry[];
  readonly serverAdmissionTime: number;
  readonly clientEventTime?: number;
  /**
   * M4: the op this entry compensates or reverts — `give-up` compensations
   * (§6) and `override-undo` rows carry the target opId here. Absent on
   * ordinary ops (M2 rows never have it).
   */
  readonly supersedes?: string;
  /** M4: concurrent tree-move LWW adjudication audit (§6); text ops never have it */
  readonly lww?: TreeLwwReceipt;
}

/* ── the error surface (§5's four codes + the M2 group marker) ────────── */

export type AdmissionErrorCode =
  | 'stale-or-unknown-frontier' // 409 — ahead of canonical, unknown/pruned base (§5.1)
  | 'stale-cursor' // 409 — malformed/mismatched/unlocatable anchor or stale extent (§5.3)
  | 'conflict' // 409 — concurrent same-buffer overlap via journal influence set (§5.2)
  | 'bad-target' // 404 — unknown buffer, missing/tombstoned target (§5.3)
  | 'utf16-boundary' // 422 — the op splits a surrogate pair (§5.3)
  // 422 — the transaction's compile gate rejected the group (§7 事务内编译门禁,
  // M6): semantic errors and conflicts ride the same return→re-reason loop.
  | 'compile-failed'
  // 409 — a group/parallel dep guard failed (§7 deps 前置守卫, M6): frontier
  // not reached / buffer expectation mismatch / target gone.
  | 'dep-unmet'
  // 503 — RETIRED (M6, transaction lane): the M2 marker that answered
  // transactionId submissions while the group executor was unbuilt. Kept in
  // the union for rejection rows already persisted under it (recovery must
  // keep replaying them byte-equal); the gate itself never mints it again —
  // transactionId submissions now execute through the real executor.
  | 'transaction-executor-unavailable'
  // 503 — RESERVED (2026-09-15, O1/O2 unlock, probe outcome A): the tree-
  // `remove` give-up lane that owned this code retired when the journal-
  // level rebind compensation landed (revertTo's fabricated bare node was
  // an implementation artifact, not a product law). Kept in the union for
  // genuine compensation candidate failures and for rejection rows already
  // persisted under it (recovery must keep replaying them byte-equal).
  | 'compensation-unsupported';

/** the §5.2 conflict body: BOTH ops + the target tail-5 + current full text */
export interface ConflictDetail {
  readonly incoming: {
    readonly opId: string;
    readonly actor: string;
    readonly kind: string;
    readonly offset: number;
    readonly length: number;
  };
  readonly committed: readonly {
    readonly opId: string;
    readonly actor: string;
    readonly kind: string;
    readonly offset: number;
    readonly length: number;
  }[];
  readonly tail: readonly JournalTailEntry[];
  readonly currentText: string;
}

export interface ErrorEnvelope {
  readonly opId: string;
  readonly status: 409 | 404 | 422 | 503;
  readonly code: AdmissionErrorCode;
  readonly actor: string;
  readonly target: OpTarget;
  readonly canonicalFrontier: Frontier;
  /** stale-or-unknown-frontier must carry the resync update (§5) */
  readonly canonicalUpdate?: Uint8Array;
  /** stale-or-unknown-frontier must carry the retry cursor (§5) */
  readonly syncCursor?: SyncCursor;
  /** stale-cursor: an updatable anchor re-encoded, else an explicit reselect */
  readonly retry?: { readonly cursorBytes?: Uint8Array; readonly reason?: 'reselect' };
  /** conflict body (§5.2) */
  readonly conflict?: ConflictDetail;
  /** utf16-boundary: the offending kernel-form range (§5) */
  readonly range?: { readonly offset: number; readonly length: number };
  readonly detail?: string;
  readonly serverAdmissionTime: number;
}

export type AdmissionResult = CommitReceipt | ErrorEnvelope;

/** narrow a result onto the 200 lane */
export function isCommitReceipt(result: AdmissionResult): result is CommitReceipt {
  return result.status === 200;
}

/* ── the append-only journal + WAL (§9 / §5.5) ────────────────────────── */

/** a committed op — the audit truth row: before/after, frontier, delta bytes */
export interface CommitJournalEntry {
  readonly type: 'commit';
  readonly seq: number;
  readonly serverAdmissionTime: number;
  readonly opId: string;
  readonly transactionId?: string;
  readonly actor: string;
  readonly peer: number;
  readonly domain: 'text' | 'tree';
  readonly kind: string;
  readonly target: OpTarget;
  readonly containerKey: string;
  readonly before: string;
  readonly value: string;
  readonly offset: number;
  readonly length: number;
  readonly text: string;
  readonly frontier: Frontier;
  /** base64 of the canonical update this commit imported (replay truth) */
  readonly updateB64: string;
  /** stable-anchor identities of the affected span (influence-set input) */
  readonly anchors?: { readonly start: string; readonly end: string };
  /**
   * tree op mapping row: source component id ↔ Loro TreeID (design 冻结).
   */
  readonly tree?: {
    readonly componentId: string;
    readonly treeNodeId: string;
    /**
     * O1/O2 (2026-09-15, probe outcome A): the lineage audit of a rebind —
     * a revive of a directly-deleted target and a give-up compensation of
     * a tree `remove` both mint a FRESH TreeID for the same componentId;
     * `rebindOf` names the dead TreeID the component was re-bound FROM
     * (the dead node stays dead — the history is never rewritten, only
     * audited). Absent on first-bind rows and engine-move revives.
     */
    readonly rebindOf?: string;
    /**
     * A8 (2026-09-15): insert rows persist the item payload — `value` is
     * the treeSummary, which never carries node data (probe-verified), so
     * the row is the rebind's fallback item source if a future journal
     * compression drops the dead node's own CRDT data.
     */
    readonly item?: unknown;
  };
  /**
   * M4 (§6 audit): the tree op's payload echo — move destinations are what
   * concurrent-move LWW receipts list per contender; absent on non-move rows.
   * M5a: `update` rows echo `{ componentId }` and carry the PREVIOUS item
   * JSON in `before` (§9 前后值 — the audit delta of the replaced payload).
   */
  readonly treeEcho?: { readonly componentId?: string; readonly newParentId?: string; readonly index?: number };
  /** base64 of the response delta served to the original submitter */
  readonly responseB64: string;
  readonly responseSyncCursor: SyncCursor;
  readonly clientEventTime?: number;
  /**
   * M4 (§6): the frontier of canonical immediately BEFORE this commit —
   * the `targetParent` a give-up compensation reverts to. Absent on M2
   * rows; derived on demand (`frontiersToVV` minus this commit's own
   * change — one commit is exactly one change per peer).
   */
  readonly parentFrontier?: Frontier;
  /**
   * M4 (§6): the op this row compensates/reverts (`give-up` compensations,
   * `override-undo`). The history of the superseded op is never rewritten.
   */
  readonly supersedes?: string;
  /** M4 (§6): concurrent tree-move LWW adjudication audit */
  readonly lww?: TreeLwwReceipt;
}

/**
 * M6 (§7): the orchestration script artifact — INTENT ONLY. A script runs
 * once on the admitting device; what syncs across devices is the accepted
 * op-logs, never a re-executed script. The row archives the exact source
 * (plus sha256), the pinned engine identity (variant + wasm hash — the
 * same hard gate the sandbox asserts at open), and the capability list
 * the run was granted, so an auditor can reconstruct what the author
 * asked for next to what actually landed (the commit rows).
 */
export interface ScriptJournalEntry {
  readonly type: 'script';
  readonly seq: number;
  readonly serverAdmissionTime: number;
  /** the script's own id (opId-style, actor-attributed) */
  readonly scriptId: string;
  readonly actor: string;
  /** the verbatim source the sandbox evaluated */
  readonly source: string;
  /** sha256 hex of `source` */
  readonly sourceHash: string;
  /** the pinned engine identity the run executed under */
  readonly engine: {
    readonly package: string;
    readonly variant: string;
    readonly wasmSha256: string;
  };
  /** the capability surface the run was granted (e.g. `ctx.component`, `group`, `parallel`, `log`) */
  readonly capabilities: readonly string[];
  /** the transactionIds the script minted, when known up front (append-only: later rows are the truth) */
  readonly transactionIds?: readonly string[];
}

/**
 * M5 leftover ② (M6 delivery): `projection-pending` as a FORMAL journal
 * row — §8's write-back failure record. The resync station keeps its
 * transitional sidecar worklist (with its mutable `flushedAt` marker);
 * this row is the append-only AUDIT trail entry a kernel-persisted
 * station can append. Canonical state is never rolled back and nothing
 * else is written (§8: 不回滚不另写) — the row has zero replay effect.
 *
 * M6 收敛轮 (2026-09-15, kernel gap ② repaid): the row carries a
 * STRUCTURAL `base` — sha256 of the file bytes observed at the failed
 * cycle's read (the pre-write state). Recovery pushes the projection
 * only while the file still holds exactly those bytes (a moved-on file
 * is never clobbered); the M6b host's `reason`-suffix smuggling
 * (`…; base=<hex>`) is retired.
 */
export interface ProjectionPendingJournalEntry {
  readonly type: 'projection-pending';
  readonly seq: number;
  readonly serverAdmissionTime: number;
  /** the external file whose canonical projection write-back failed */
  readonly path: string;
  /** sha256 of the projection that should have been written */
  readonly projectionHash: string;
  /** sha256 of the file bytes at the failed cycle's read — the recovery no-clobber guard */
  readonly base?: string;
  /** why the atomic write failed */
  readonly reason: string;
}

/**
 * A rejected op — rejections are receipts too (opId idempotency, §5.0), so
 * the durable row carries the COMPLETE original error envelope, not just
 * the adjudication essentials (impl-review-1 B3): after a restart the
 * same opId must replay the receipt it got the first time, byte-equal on
 * every §5 field — `canonicalUpdate` (base64 here; bytes in the envelope),
 * the retry `syncCursor`, `retry` cursorBytes (base64 here), the `conflict`
 * body, the `utf16-boundary` `range` and the diagnostic `detail`.
 */
export interface RejectionJournalEntry {
  readonly type: 'rejection';
  readonly seq: number;
  readonly serverAdmissionTime: number;
  readonly opId: string;
  readonly actor: string;
  readonly status: number;
  readonly code: AdmissionErrorCode;
  readonly target: OpTarget;
  readonly frontier: Frontier;
  /** base64 of the 409's canonicalUpdate (stale-or-unknown-frontier, §5) */
  readonly canonicalUpdateB64?: string;
  /** the retry cursor the original rejection carried (§5) */
  readonly syncCursor?: SyncCursor;
  /** stale-cursor retry anchor (base64) or the explicit reselect marker */
  readonly retryB64?: { readonly cursorBytesB64?: string; readonly reason?: 'reselect' };
  /** conflict body (§5.2) */
  readonly conflict?: ConflictDetail;
  /** utf16-boundary range (§5.3) */
  readonly range?: { readonly offset: number; readonly length: number };
  /** diagnostic detail (§5) */
  readonly detail?: string;
}

/** actor → numeric peer allocation (design 治理冻结二, append-only in journal) */
export interface PeerJournalEntry {
  readonly type: 'peer';
  readonly seq: number;
  readonly serverAdmissionTime: number;
  readonly actor: string;
  readonly peer: number;
}

/**
 * kernel-seeded buffer (reserved kernel peer 1000). M5a: production ingest
 * creates buffers through the admitted `text create` op (actor-attributed);
 * this row survives only for the kernel-internal recovery/bootstrap path
 * (`ensureBuffer`) and rows already persisted — both stay first-class truth.
 */
export interface BufferSeedJournalEntry {
  readonly type: 'buffer-seed';
  readonly seq: number;
  readonly serverAdmissionTime: number;
  readonly containerKey: string;
  readonly componentId: string;
  readonly buffer: string;
  readonly value: string;
  readonly frontier: Frontier;
  readonly updateB64: string;
}

export type JournalEntry =
  | CommitJournalEntry
  | RejectionJournalEntry
  | PeerJournalEntry
  | BufferSeedJournalEntry
  | ScriptJournalEntry
  | ProjectionPendingJournalEntry;

/**
 * The WAL — §5.5 freezes the order `prepare → candidate validation →
 * canonical update → journal append → WAL receipt`, with `abort` marking a
 * failed candidate (canonical/journal untouched).
 */
export type WalEntry =
  | {
      readonly type: 'prepare';
      readonly opId: string;
      readonly transactionId?: string;
      readonly actor: string;
      readonly peer: number;
      readonly target: OpTarget;
      readonly baseFrontiers: Frontier;
      readonly serverTime: number;
    }
  | { readonly type: 'abort'; readonly opId: string; readonly reason: string; readonly serverTime: number }
  | { readonly type: 'receipt'; readonly opId: string; readonly status: number; readonly serverTime: number };

/** materialized actor registry cache (peers.json; journal is the truth) */
export interface PeerRegistryState {
  readonly actors: Readonly<Record<string, number>>;
  readonly nextPeer: number;
}

/** materialized idempotency-index cache (ledger.json; journal is the truth) */
export interface LedgerState {
  readonly journalSeq: number;
  readonly nextPeer: number;
  readonly receipts: Readonly<Record<string, { readonly status: number; readonly code?: string; readonly seq: number }>>;
}

/** the loro container id of a buffer container (`cid:root-…:Text`) */
export type BufferContainerId = ContainerID;
