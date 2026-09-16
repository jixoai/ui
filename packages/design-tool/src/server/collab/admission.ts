/**
 * @jixoai/ui-design (collab) — the admission gate: the per-workspace
 * serialized decision point every op passes through (collab-protocol
 * M2; protocol-spec §5, semantics frozen by
 * `.zcode/epic40/lab/p13-errors-and-cursor.mjs` and
 * `p17-admission-gate.mjs` — the ported probes stay the behavioral
 * truth, this module is the production isomorph).
 *
 * The §5 sequence, exactly as numbered in the spec — preceded by a
 * protocol-boundary validation pass (impl-review-1 B2/B4):
 *   B. `assertEnvelopeShape` runs synchronously in `admit()` BEFORE the
 *      op is queued: the §4 tagged unions are checked in full — text
 *      `kind ∈ {insert,delete,replace}` with per-kind field constraints
 *      (insert carries no length, delete no text), tree `kind ∈
 *      {insert,move,remove,revive}` with its kind-specific payload, and
 *      the `syncCursor` tag triage. FROZEN SEMANTICS: structural
 *      violations are caller bugs and throw `TypeError` — they never
 *      consume a peer, a WAL row or a journal row. The one exception is
 *      the syncCursor kind ENUM: a well-formed object with a kind outside
 *      `frontier | vv` is a protocol adjudication and answers the
 *      journaled `409 stale-or-unknown-frontier` inside the gate.
 *   0. `opId` idempotency — same opId returns the ORIGINAL receipt
 *      (commit or rejection), never a second commit.
 *   1. frontier CAS inside the gate: `cmpFrontiers(base, canonical)`;
 *      `1` (client ahead) or a thrown unknown/pruned frontier →
 *      `409 stale-or-unknown-frontier` carrying `canonicalUpdate` +
 *      `syncCursor` so the client can resync and resubmit. `-1`
 *      (behind) and `undefined` (concurrent) mean "changes the client
 *      has not seen" — they proceed to the overlap check, they are not
 *      blanket rejections (§6 non-overlap auto-fusion depends on that).
 *   2. concurrent + same buffer: overlap decided through the JOURNAL's
 *      influence set — both sides' spans re-anchored on current
 *      canonical via their stable Cursor identities, never by
 *      intersecting two base-relative offsets. Overlap → `409 conflict`
 *      (both ops + target tail-5 + current full text), no import.
 *   3. cursor decode + strict `containerId()` match against the
 *      resolved target buffer; unknown buffer or tombstoned target →
 *      `404 bad-target`; malformed/mismatched/unlocatable anchor or a
 *      stale extent → `409 stale-cursor` (retry cursorBytes only when
 *      `getCursorPos` returned an `update`, else `retry.reason
 *      ="reselect"`); surrogate-splitting ranges → `422 utf16-boundary`.
 *      The kernel offset is RECOMPUTED from the anchor (§4) — the
 *      envelope's offset field is the client's belief, not the truth.
 *   4. apply on a candidate fork and commit under the actor's peer;
 *      the canonical frontier is re-checked before the write.
 *   5. frozen WAL ordering `prepare → candidate → canonical → journal
 *      → receipt`; candidate failure writes `WAL abort` and leaves
 *      canonical/journal untouched (the rejection is NOT journaled —
 *      a resubmission of the same opId re-executes).
 *   6. the response increment is normalized by the request's
 *      `syncCursor` tag (frontier → frontiersToVV, vv → direct export
 *      `from`; absent cursor → restricted shallow snapshot).
 *
 * M2 scope: single ops. The M2 `503 transaction-executor-unavailable`
 * marker for `transactionId` submissions is RETIRED (M6): the lane now
 * executes one-op groups through the kernel transaction core
 * (`#runTransactionLane`), and multi-op group/parallel orchestration
 * arrives through the script executor (`runtime/executor.ts`) inside
 * {@link AdmissionGate.runExclusive} — synchronous host callbacks, the
 * parallel-branch lane reusing the full §5 sequence through
 * {@link AdmissionGate.admitWithinTransaction}.
 *
 * M4 adds the §6 conflict/undo surface on the SAME serialized chain:
 * `giveUp` (compensate someone else's committed op — `supersedes`
 * journal accounting, third-party survival) and `overrideUndo`/
 * `overrideRedo` (the actor's own loro UndoManager session). The
 * tree-lane concurrent-move LWW receipts (§6/p12) are computed in the
 * kernel next to the journal index and ride the normal commit path.
 *
 * M5a (tasks M3 gaps ①②) extends the two vocabularies additively:
 * `text create` (explicit buffer creation — the anchor/extent fields are
 * structurally FORBIDDEN on it, and an existing container is the frozen
 * `409 conflict`; tombstone law first) and `tree update` (node meta
 * payload replacement — plain JSON shape at the boundary, tombstoned or
 * unknown targets 404). Both ride the same §5 sequence and WAL ordering.
 *
 * The gate serializes each workspace's commit point with a promise
 * chain (the p17 model): the critical section is fully synchronous, so
 * `maxActive` can never exceed 1 and the frontier cannot move between
 * step 1 and the commit (the §5.4 re-check is still run, literally).
 *
 * Original need: collab-protocol M2 + M5a + M6 (2026-09-15).
 */

import { Cursor } from 'loro-crdt';

import { transactionCompileGate } from './runtime/compile-gate.ts';
import {
  bufferKeyOf,
  CollabKernel,
  encodeContainerKey,
  KernelCandidateError,
  type OverrideOutcome,
  type TransactionOp,
  type TransactionReceipts,
} from './kernel.ts';
import type {
  AdmissionResult,
  ConflictDetail,
  ErrorEnvelope,
  Frontier,
  OpEnvelope,
  SyncCursor,
  TextCreateOpEnvelope,
  TextOpEnvelope,
  TreeOpEnvelope,
} from './types.ts';

/* ── UTF-16 boundary law (§5.3 / §10) ─────────────────────────────────── */

const isHighSurrogate = (code: number): boolean => code >= 0xd800 && code <= 0xdbff;
const isLowSurrogate = (code: number): boolean => code >= 0xdc00 && code <= 0xdfff;

/** a position splits a surrogate pair iff it sits between its two units */
function splitsSurrogate(text: string, position: number): boolean {
  return (
    position > 0 &&
    position < text.length &&
    isHighSurrogate(text.charCodeAt(position - 1)) &&
    isLowSurrogate(text.charCodeAt(position))
  );
}

/* ── gate statistics (the p17 observables) ────────────────────────────── */

export interface AdmissionGateStats {
  /** requests currently inside the critical section */
  readonly active: number;
  /** high-water mark of concurrent critical sections — the serialization proof */
  readonly maxActive: number;
  readonly admitted: number;
  readonly rejected: number;
}

/* ── the gate ─────────────────────────────────────────────────────────── */

export class AdmissionGate {
  readonly #kernel: CollabKernel;
  #tail: Promise<unknown> = Promise.resolve();
  #active = 0;
  #maxActive = 0;
  #admitted = 0;
  #rejected = 0;

  constructor(kernel: CollabKernel) {
    this.#kernel = kernel;
  }

  /** the kernel this gate serializes — the undo.ts controlled surface needs it (M4) */
  get kernel(): CollabKernel {
    return this.#kernel;
  }

  /**
   * Admit one op envelope. Structurally invalid envelopes (a §4 tagged
   * union violated: missing cursorBytes on a text op, an illegal `kind`
   * enum, a missing tree payload field, negative extents, wrong-charset
   * buffers, structural syncCursor garbage) throw `TypeError` BEFORE the
   * op is queued — caller bugs against the tagged union, never protocol
   * adjudications, consuming no peer/WAL/journal. The one exception: a
   * syncCursor whose `kind` is a string outside `frontier | vv` passes
   * the shape triage and is adjudicated inside the gate as the journaled
   * `409 stale-or-unknown-frontier` (impl-review-1 B2).
   */
  admit(envelope: OpEnvelope): Promise<AdmissionResult> {
    assertEnvelopeShape(envelope);
    const run = this.#tail.then(() => this.#run(envelope));
    this.#tail = run.catch(() => undefined);
    return run;
  }

  stats(): AdmissionGateStats {
    return { active: this.#active, maxActive: this.#maxActive, admitted: this.#admitted, rejected: this.#rejected };
  }

  /* ── §6 give-up / override — serialized onto the same chain (M4) ──────── */

  /**
   * §6 give-up（撤他人 op）: compensate exactly one committed op on a
   * copy that contains it (`forkAt` its post-commit frontier — a full
   * fork's revertTo would also compensate later third-party commits),
   * import the inverse through the frozen WAL ordering, and journal the
   * compensation with `supersedes: targetOpId`. History is never
   * rewritten; third-party concurrent edits survive (P3/P10 evidence).
   *
   * Frozen semantics:
   *  - idempotent: a second give-up of the same target returns the
   *    original compensation receipt (across actors, across restarts);
   *  - unknown / never-committed target → journaled `404 bad-target`;
   *  - tree `remove` targets → O2 unlock (2026-09-15, probe A9): the
   *    kernel compensates by REBINDING (fresh TreeID + item copy + the
   *    still-attached children hung back keeping their TreeIDs; third
   *    party and buffers survive). The old preemptive `503
   *    compensation-unsupported` freeze — revertTo fabricates a bare
   *    node — was an artifact of the revert path, not a product law;
   *    compensating a text op on a tombstoned component is likewise 200
   *    and effective: a compensation is history rollback, not a new
   *    write, so §6's tombstone 404 law does not cover this path (C2).
   */
  giveUp(request: { targetOpId: string; actor: string; opId?: string; syncCursor?: SyncCursor }): Promise<AdmissionResult> {
    if (typeof request.targetOpId !== 'string' || request.targetOpId.length === 0) throw new TypeError('giveUp requires a non-empty targetOpId');
    if (typeof request.actor !== 'string' || request.actor.length === 0) throw new TypeError('giveUp requires a non-empty actor');
    if (request.syncCursor !== undefined) assertSyncCursorShape(request.syncCursor);
    const run = this.#tail.then(() => this.#runGiveUp(request));
    this.#tail = run.catch(() => undefined);
    return run;
  }

  /**
   * §6 override（保自己）undo — drive the actor's open override session
   * (本 peer loro UndoManager) and import the compensating delta under
   * the frozen WAL ordering. Other actors' edits survive (p3 semantics:
   * an UndoManager only reverts its own peer's recorded steps).
   */
  overrideUndo(request: { actor: string; opId: string; syncCursor?: SyncCursor }): Promise<OverrideOutcome> {
    if (typeof request.actor !== 'string' || request.actor.length === 0) throw new TypeError('overrideUndo requires a non-empty actor');
    if (typeof request.opId !== 'string' || request.opId.length === 0) throw new TypeError('overrideUndo requires a non-empty opId');
    if (request.syncCursor !== undefined) assertSyncCursorShape(request.syncCursor);
    const run = this.#tail.then(() => this.#runOverride('undo', request));
    this.#tail = run.catch(() => undefined);
    return run;
  }

  /** §6 override redo — the mirror of {@link overrideUndo} */
  overrideRedo(request: { actor: string; opId: string; syncCursor?: SyncCursor }): Promise<OverrideOutcome> {
    if (typeof request.actor !== 'string' || request.actor.length === 0) throw new TypeError('overrideRedo requires a non-empty actor');
    if (typeof request.opId !== 'string' || request.opId.length === 0) throw new TypeError('overrideRedo requires a non-empty opId');
    if (request.syncCursor !== undefined) assertSyncCursorShape(request.syncCursor);
    const run = this.#tail.then(() => this.#runOverride('redo', request));
    this.#tail = run.catch(() => undefined);
    return run;
  }

  #runGiveUp(request: { targetOpId: string; actor: string; opId?: string; syncCursor?: SyncCursor }): AdmissionResult {
    const opId = request.opId ?? `giveup:${request.actor}:${request.targetOpId}`;
    // step 0 idempotency — same request replays the original receipt
    const replay = this.#kernel.receiptFor(opId);
    if (replay !== undefined) return replay;
    // §4 syncCursor tag law before any WAL/journal cost (B2) — an illegal
    // enum or a pruned frontier answers the journaled 409 with the §5
    // resync payload (the request cursor itself cannot build it)
    const badCursor = this.#syncCursorDetail(request.syncCursor);
    if (badCursor !== undefined) {
      const resync = this.#kernel.exportFor(undefined);
      return this.#rejectGiveUp(opId, request, {
        status: 409,
        code: 'stale-or-unknown-frontier',
        detail: badCursor,
        canonicalUpdate: resync.update,
        syncCursor: resync.syncCursor,
      });
    }
    const superseding = this.#kernel.compensationFor(request.targetOpId);
    if (superseding !== undefined) {
      const receipt = this.#kernel.receiptFor(superseding.opId);
      if (receipt !== undefined) return receipt;
    }
    const targetEntry = this.#kernel.commitRowFor(request.targetOpId);
    if (targetEntry === undefined) {
      return this.#rejectGiveUp(opId, request, {
        status: 404,
        code: 'bad-target',
        detail: `no committed op ${JSON.stringify(request.targetOpId)} to give up (rejections and buffer seeds are not ops)`,
      });
    }
    // O2 unlock (2026-09-15, probe A9): a tree `remove` is compensatable —
    // the kernel rebinds on the compensation fork (fresh TreeID + item copy
    // + attached children hung back; third-party and buffers survive).
    // The preemptive `503 compensation-unsupported` branch that stood here
    // is retired: revertTo's fabricated bare node was an implementation
    // artifact of the revert path, not a product law. The code stays
    // reserved (types.ts) for genuine compensation candidate failures.
    // a FRESH registry peer for the compensating change — the truncated
    // compensator history cannot see any later change of a reused peer
    const peer = this.#kernel.peerOf(`give-up:${request.targetOpId}`);
    this.#kernel.appendWal({
      type: 'prepare',
      opId,
      actor: request.actor,
      peer,
      target: targetEntry.target,
      baseFrontiers: this.#kernel.frontiers(),
      serverTime: Date.now(),
    });
    try {
      const receipt = this.#kernel.commitCompensation({ targetEntry, actor: request.actor, peer, opId, syncCursor: request.syncCursor });
      this.#kernel.appendWal({ type: 'receipt', opId, status: 200, serverTime: Date.now() });
      this.#admitted += 1;
      return receipt;
    } catch (error) {
      // candidate failure — WAL abort, canonical/journal untouched, the
      // rejection is NOT journaled: a resubmission re-executes (§5.5)
      const candidate = error instanceof KernelCandidateError ? error : undefined;
      this.#kernel.appendWal({ type: 'abort', opId, reason: candidate?.detail ?? errorMessage(error), serverTime: Date.now() });
      this.#rejected += 1;
      // full §5 key set — durable rejections rebuild key-for-key (B3)
      return {
        opId,
        status: 503,
        code: 'compensation-unsupported',
        actor: request.actor,
        target: targetEntry.target,
        canonicalFrontier: this.#kernel.frontiers(),
        canonicalUpdate: undefined,
        syncCursor: undefined,
        retry: undefined,
        conflict: undefined,
        range: undefined,
        detail: candidate?.detail ?? errorMessage(error),
        serverAdmissionTime: Date.now(),
      };
    }
  }

  #rejectGiveUp(
    opId: string,
    request: { targetOpId: string; actor: string },
    fields: {
      status: ErrorEnvelope['status'];
      code: ErrorEnvelope['code'];
      detail: string;
      target?: OpEnvelope['target'];
      canonicalUpdate?: Uint8Array;
      syncCursor?: SyncCursor;
    },
  ): AdmissionResult {
    // no located op → the envelope's target echoes the requested opId
    // (it names an op, not a component — the detail says so)
    const target = fields.target ?? { componentId: request.targetOpId };
    // full §5 key set — durable rejections rebuild key-for-key (B3)
    const error: ErrorEnvelope = {
      opId,
      status: fields.status,
      code: fields.code,
      actor: request.actor,
      target,
      canonicalFrontier: this.#kernel.frontiers(),
      canonicalUpdate: fields.canonicalUpdate,
      syncCursor: fields.syncCursor,
      retry: undefined,
      conflict: undefined,
      range: undefined,
      detail: fields.detail,
      serverAdmissionTime: Date.now(),
    };
    this.#rejected += 1;
    return this.#kernel.recordRejection({ opId, actor: request.actor, target }, error);
  }

  #runOverride(kind: 'undo' | 'redo', request: { actor: string; opId: string; syncCursor?: SyncCursor }): OverrideOutcome {
    const session = this.#kernel.overrideSessionOf(request.actor);
    if (!session.open) return { status: 'no-session' };
    // an empty stack is not a failure — no WAL, no canonical touch
    if (kind === 'undo' && !session.canUndo) return { status: 'empty-stack' };
    if (kind === 'redo' && !session.canRedo) return { status: 'empty-stack' };
    // §4 syncCursor tag law BEFORE the WAL prepare (B2): the response
    // export must be servable — an illegal enum or pruned frontier ends
    // the request here with the session and canonical untouched
    if (this.#syncCursorDetail(request.syncCursor) !== undefined) return { status: 'stale-sync-cursor' };
    // the prepare's target is diagnostic: the true target is only known
    // after the step pops (it rides the journal row)
    this.#kernel.appendWal({
      type: 'prepare',
      opId: request.opId,
      actor: request.actor,
      peer: this.#kernel.peerOf(request.actor),
      target: { componentId: `override:${request.actor}` },
      baseFrontiers: this.#kernel.frontiers(),
      serverTime: Date.now(),
    });
    const outcome =
      kind === 'undo'
        ? this.#kernel.performOverrideUndo(request.actor, request.opId, request.syncCursor)
        : this.#kernel.performOverrideRedo(request.actor, request.opId, request.syncCursor);
    if (outcome.status === 'performed') {
      this.#kernel.appendWal({ type: 'receipt', opId: request.opId, status: 200, serverTime: Date.now() });
      this.#admitted += 1;
    } else {
      this.#kernel.appendWal({ type: 'abort', opId: request.opId, reason: `override ${kind} ${outcome.status}`, serverTime: Date.now() });
      this.#rejected += 1;
    }
    return outcome;
  }

  /* ── the serialized critical section (§5 steps 0-6) ──────────────────── */

  #run(envelope: OpEnvelope): AdmissionResult {
    // step 0 — opId idempotency (commits AND rejections are receipts)
    const replay = this.#kernel.receiptFor(envelope.opId);
    if (replay !== undefined) return replay;

    this.#active += 1;
    this.#maxActive = Math.max(this.#maxActive, this.#active);
    try {
      // §4 syncCursor tag law — BEFORE any peer allocation, WAL write or
      // journal row (impl-review-1 B2). Structural garbage already threw
      // TypeError in admit(); an illegal kind ENUM is a protocol
      // adjudication, and a pruned/unknown frontier cannot serve the
      // §5.6 response export — both answer the journaled 409.
      const badCursor = this.#syncCursorDetail(envelope.syncCursor);
      if (badCursor !== undefined) return this.#rejectFrontier(envelope, badCursor);

      // M6 — the transaction lane: the group executor LANDED, the M2
      // `503 transaction-executor-unavailable` marker is RETIRED. A single
      // envelope carrying a `transactionId` executes as a one-op group
      // (single candidate fork + the §7 compile gate + one commit, one
      // atomic receipt); multi-op groups arrive through the executor
      // (`runtime/executor.ts`) inside {@link runExclusive}.
      if (envelope.transactionId !== undefined) {
        return this.#runTransactionLane(envelope);
      }

      // the actor's registry peer — allocation is itself journal truth
      const peer = this.#kernel.peerOf(envelope.actor);

      // step 1 — frontier CAS inside the gate
      const canonicalFrontier = this.#kernel.frontiers();
      let cmp: -1 | 0 | 1 | undefined;
      try {
        cmp = this.#kernel.cmpFrontiers(envelope.baseFrontiers, canonicalFrontier);
      } catch (error) {
        return this.#rejectFrontier(envelope, `unknown or pruned frontier: ${errorMessage(error)}`);
      }
      if (cmp === 1) {
        return this.#rejectFrontier(envelope, 'submitted base is ahead of canonical — resync required');
      }

      // M5a gap ①: text create is its own lane — it has no anchor to
      // recompute (the container does not exist yet) and cannot overlap
      // (its CAS was the container's nonexistence)
      if (envelope.domain === 'text' && envelope.kind === 'create') {
        return this.#runTextCreate(envelope, peer);
      }

      return envelope.domain === 'text' ? this.#runText(envelope, peer, cmp, canonicalFrontier) : this.#runTree(envelope, peer);
    } finally {
      this.#active -= 1;
    }
  }

  /* ── M6: the transaction lane + the executor's exclusive section ─────── */

  #exclusiveDepth = 0;

  /**
   * Serialize one SYNCHRONOUS body onto the gate's chain — the
   * executor lane (`runtime/executor.ts`) runs a whole orchestration
   * script inside one exclusive section: the sandbox drives host
   * callbacks (group/parallel commits, top-level op admissions) that
   * must never re-queue onto the async chain mid-section (§7 禁止 host
   * 回调重入同一 admission — the mechanical fence is that everything
   * in here is synchronous, so the §5.4 re-check cannot even observe a
   * frontier move). The body's return value (or thrown error) settles
   * the promise; the chain always continues.
   */
  runExclusive<T>(body: () => T): Promise<T> {
    const run = this.#tail.then(() => {
      this.#exclusiveDepth += 1;
      try {
        return body();
      } finally {
        this.#exclusiveDepth -= 1;
      }
    });
    this.#tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  /**
   * Run one envelope through the FULL §5 sequence synchronously — the
   * parallel-branch lane of the executor (branch forks converge through
   * the same §5 brain: non-overlapping auto-fuse, overlapping 409).
   * MUST be called inside {@link runExclusive} (or from within the
   * gate's own chain): calling it outside the serialized section throws
   * — this is the re-entrancy law, not a convenience.
   */
  admitWithinTransaction(envelope: OpEnvelope): AdmissionResult {
    assertEnvelopeShape(envelope);
    if (this.#exclusiveDepth < 1) {
      throw new TypeError('admitWithinTransaction requires the exclusive section (gate.runExclusive) — the §5 sequence is only serialized there');
    }
    return this.#run(envelope);
  }

  /**
   * The M6 single-op transaction lane: one §4 envelope carrying a
   * `transactionId` executes as a ONE-OP group — the same kernel
   * transaction core the script executor drives (single candidate fork,
   * the §7 Svelte/registry compile gate, ONE commit, one atomic
   * receipt stamped with the transactionId). The §5 checks run exactly
   * as on the single-op lane: frontier CAS (step 1), cursor decode +
   * strict container binding + offset recompute (step 3), the journal
   * influence-set overlap decision (step 2) — only the commit path
   * differs (the transaction core, never the bare single-op commit).
   */
  #runTransactionLane(envelope: OpEnvelope): AdmissionResult {
    const peer = this.#kernel.peerOf(envelope.actor);

    // M5a ①: a create in a transaction keeps its own lane (it has no
    // anchor to recompute and cannot overlap) — the row already carries
    // the transactionId, giving the group its atomic receipt
    if (envelope.domain === 'text' && envelope.kind === 'create') {
      return this.#runTextCreate(envelope, peer);
    }

    // step 1 — frontier CAS (mirrors the single-op lane)
    const canonicalFrontier = this.#kernel.frontiers();
    let cmp: -1 | 0 | 1 | undefined;
    try {
      cmp = this.#kernel.cmpFrontiers(envelope.baseFrontiers, canonicalFrontier);
    } catch (error) {
      return this.#rejectFrontier(envelope, `unknown or pruned frontier: ${errorMessage(error)}`);
    }
    if (cmp === 1) {
      return this.#rejectFrontier(envelope, 'submitted base is ahead of canonical — resync required');
    }

    let op: TransactionOp;
    if (envelope.domain === 'text') {
      // target resolution + anchor decode + recompute (§5.3), then the
      // influence-set overlap decision (§5.2) — identical to #runText
      const containerKey = encodeContainerKey(envelope.target.componentId, bufferKeyOf(envelope.target.buffer));
      if (!this.#kernel.hasBuffer(containerKey)) {
        return this.#reject(envelope, {
          status: 404,
          code: 'bad-target',
          detail: `buffer ${envelope.target.componentId}:${envelope.target.buffer} has never been created (no container)`,
        });
      }
      const treeNodeId = this.#kernel.treeNodeOf(envelope.target.componentId);
      if (treeNodeId !== undefined && this.#kernel.isTreeNodeDeleted(treeNodeId)) {
        return this.#reject(envelope, {
          status: 404,
          code: 'bad-target',
          detail: `component ${envelope.target.componentId} is a tombstone — only an explicit revive can reopen it (§6)`,
        });
      }
      let cursor: Cursor;
      try {
        cursor = Cursor.decode(envelope.cursorBytes);
      } catch (error) {
        return this.#reject(envelope, { status: 409, code: 'stale-cursor', retry: RESELECT, detail: `malformed cursor bytes: ${errorMessage(error)}` });
      }
      if (cursor.containerId() !== this.#kernel.containerIdOf(containerKey)) {
        return this.#reject(envelope, {
          status: 409,
          code: 'stale-cursor',
          retry: RESELECT,
          detail: 'cursor container does not match the resolved target buffer (§5.3 container check)',
        });
      }
      const position = this.#kernel.getCursorPos(cursor);
      if (position === undefined) {
        return this.#reject(envelope, { status: 409, code: 'stale-cursor', retry: RESELECT, detail: 'cursor cannot be located on canonical (unlocatable anchor)' });
      }
      const offset = position.offset;
      const length = envelope.kind === 'insert' ? 0 : envelope.length;
      if (cmp !== 0) {
        const conflict = this.#overlapConflict(envelope, containerKey, cursor, offset, length);
        if (conflict !== undefined) {
          return this.#reject(envelope, {
            status: 409,
            code: 'conflict',
            conflict,
            detail: 'concurrent overlapping write on the same buffer (§5.2) — not imported',
          });
        }
      }
      op = {
        domain: 'text',
        kind: envelope.kind,
        opId: envelope.opId,
        target: envelope.target,
        containerKey,
        offset,
        length,
        text: envelope.text,
        // inside the gate the canonical text IS the op's base view — the
        // always-enforced transaction evidence
        expectedBefore: this.#kernel.bufferText(containerKey),
      };
    } else {
      op = { domain: 'tree', opId: envelope.opId, target: envelope.target, envelope };
    }

    let receipts: TransactionReceipts;
    try {
      receipts = this.#kernel.commitTransaction({
        ops: [op],
        transactionId: envelope.transactionId!,
        actor: envelope.actor,
        peer,
        strategy: 'rollback',
        compileGate: transactionCompileGate,
        timestamp: envelope.timestamp,
        responseCursor: envelope.syncCursor,
        // the tx-level row would duplicate the envelope-opId rejection
        // this lane journals below — keep the audit single-headed
        journalTxRejection: false,
      });
    } catch (error) {
      const candidate = error instanceof KernelCandidateError ? error : undefined;
      this.#rejected += 1;
      return this.#reject(envelope, {
        status: 404,
        code: 'bad-target',
        detail: candidate?.detail ?? errorMessage(error),
      });
    }
    if (receipts.status === 'accepted') {
      this.#admitted += 1;
      // the kernel set the per-op receipt under the envelope's opId
      return this.#kernel.receiptFor(envelope.opId) ?? this.#reject(envelope, { status: 404, code: 'bad-target', detail: 'transaction committed but the op receipt is unlocatable (internal)' });
    }
    this.#rejected += 1;
    const code = txCodeOf(receipts);
    return this.#reject(envelope, {
      status: code === 'utf16-boundary' || code === 'compile-failed' ? 422 : code === 'dep-unmet' ? 409 : 404,
      code,
      detail: receipts.diagnostics ?? `transaction ${JSON.stringify(envelope.transactionId)} rejected`,
    });
  }

  /* ── the text lane ───────────────────────────────────────────────────── */

  /**
   * M5a gap ① — the buffer-creation lane. FROZEN SEMANTICS:
   *  - the §6 tombstone law dominates: creating a buffer on a tombstoned
   *    component is `404 bad-target` (ordinary writes never touch deleted
   *    nodes; only an explicit revive reopens them) — checked FIRST, so a
   *    tombstoned component with a surviving container still 404s;
   *  - an EXISTING container is `409 conflict`: the target is fully
   *    resolved (not unknown — bad-target would lie), the op collides
   *    with already-committed truth. Concurrent duplicate creates resolve
   *    as first-commit-wins, loser 409 (the gate serializes the pair);
   *  - no cursor, no extent, no influence set: a create cannot overlap
   *    anything, so steps 2-3 of the §5 sequence have nothing to decide.
   */
  #runTextCreate(envelope: TextCreateOpEnvelope, peer: number): AdmissionResult {
    const treeNodeId = this.#kernel.treeNodeOf(envelope.target.componentId);
    if (treeNodeId !== undefined && this.#kernel.isTreeNodeDeleted(treeNodeId)) {
      return this.#reject(envelope, {
        status: 404,
        code: 'bad-target',
        detail: `component ${envelope.target.componentId} is a tombstone — only an explicit revive can reopen it (§6)`,
      });
    }
    const containerKey = encodeContainerKey(envelope.target.componentId, bufferKeyOf(envelope.target.buffer));
    if (this.#kernel.hasBuffer(containerKey)) {
      return this.#reject(envelope, {
        status: 409,
        code: 'conflict',
        detail: `buffer ${envelope.target.componentId}:${envelope.target.buffer} already exists — creation collides with committed truth (M5a freeze: idempotent re-creation is not a thing; create once, edit after)`,
      });
    }

    this.#kernel.appendWal({
      type: 'prepare',
      opId: envelope.opId,
      transactionId: envelope.transactionId,
      actor: envelope.actor,
      peer,
      target: envelope.target,
      baseFrontiers: envelope.baseFrontiers,
      serverTime: Date.now(),
    });
    try {
      const receipt = this.#kernel.commitTextCreateOp({ envelope, peer, containerKey, responseCursor: envelope.syncCursor });
      this.#kernel.appendWal({ type: 'receipt', opId: envelope.opId, status: 200, serverTime: Date.now() });
      this.#admitted += 1;
      return receipt;
    } catch (error) {
      // candidate failure — WAL abort, canonical/journal untouched, the
      // rejection is NOT journaled: a resubmission re-executes (§5.5)
      const candidate = error instanceof KernelCandidateError ? error : undefined;
      this.#kernel.appendWal({
        type: 'abort',
        opId: envelope.opId,
        reason: candidate?.detail ?? errorMessage(error),
        serverTime: Date.now(),
      });
      this.#rejected += 1;
      // full §5 key set — durable rejections rebuild key-for-key (B3);
      // candidate failures are NOT journaled (§5.5) but keep the shape
      return {
        opId: envelope.opId,
        status: 404,
        code: 'bad-target',
        actor: envelope.actor,
        target: envelope.target,
        canonicalFrontier: this.#kernel.frontiers(),
        canonicalUpdate: undefined,
        syncCursor: undefined,
        retry: undefined,
        conflict: undefined,
        range: undefined,
        detail: candidate?.detail ?? errorMessage(error),
        serverAdmissionTime: Date.now(),
      };
    }
  }

  #runText(envelope: TextOpEnvelope, peer: number, cmp: -1 | 0 | 1 | undefined, canonicalFrontier: Frontier): AdmissionResult {
    // target resolution — unknown buffer or tombstoned component → bad-target
    const containerKey = encodeContainerKey(envelope.target.componentId, bufferKeyOf(envelope.target.buffer));
    if (!this.#kernel.hasBuffer(containerKey)) {
      return this.#reject(envelope, {
        status: 404,
        code: 'bad-target',
        detail: `buffer ${envelope.target.componentId}:${envelope.target.buffer} has never been created (no container)`,
      });
    }
    const treeNodeId = this.#kernel.treeNodeOf(envelope.target.componentId);
    if (treeNodeId !== undefined && this.#kernel.isTreeNodeDeleted(treeNodeId)) {
      return this.#reject(envelope, {
        status: 404,
        code: 'bad-target',
        detail: `component ${envelope.target.componentId} is a tombstone — only an explicit revive can reopen it (§6)`,
      });
    }

    // anchor decode + strict container binding (§5.3) — precedes the
    // overlap check because the incoming span's identity IS this anchor
    let cursor: Cursor;
    try {
      cursor = Cursor.decode(envelope.cursorBytes);
    } catch (error) {
      return this.#reject(envelope, { status: 409, code: 'stale-cursor', retry: RESELECT, detail: `malformed cursor bytes: ${errorMessage(error)}` });
    }
    if (cursor.containerId() !== this.#kernel.containerIdOf(containerKey)) {
      return this.#reject(envelope, {
        status: 409,
        code: 'stale-cursor',
        retry: RESELECT,
        detail: 'cursor container does not match the resolved target buffer (§5.3 container check)',
      });
    }
    const position = this.#kernel.getCursorPos(cursor);
    if (position === undefined) {
      return this.#reject(envelope, { status: 409, code: 'stale-cursor', retry: RESELECT, detail: 'cursor cannot be located on canonical (unlocatable anchor)' });
    }
    // §4: the kernel offset is RECOMPUTED from the stable anchor — the
    // envelope offset is the client's belief and may legitimately differ
    // under concurrent edits; the anchor is the identity
    const offset = position.offset;
    const length = envelope.kind === 'insert' ? 0 : envelope.length;

    // step 2 — concurrent same-buffer overlap via the journal influence
    // set: both spans re-anchored at the SUBMITTER'S BASE through their
    // stable Cursor identities (never base-relative offset intersection;
    // deleted regions would collapse on current canonical and hide real
    // overlaps — at the base both spans keep their original extents)
    if (cmp !== 0) {
      const conflict = this.#overlapConflict(envelope, containerKey, cursor, offset, length);
      if (conflict !== undefined) {
        return this.#reject(envelope, {
          status: 409,
          code: 'conflict',
          conflict,
          detail: 'concurrent overlapping write on the same buffer (§5.2) — not imported',
        });
      }
    }

    // step 3 extent checks on current canonical
    const text = this.#kernel.bufferText(containerKey);
    if (offset > text.length || offset + length > text.length) {
      return this.#reject(envelope, {
        status: 409,
        code: 'stale-cursor',
        retry: RESELECT,
        detail: `affected extent [${offset}, ${offset + length}) no longer locates within the ${text.length}-unit buffer`,
      });
    }
    if (splitsSurrogate(text, offset) || (length > 0 && splitsSurrogate(text, offset + length))) {
      return this.#reject(envelope, {
        status: 422,
        code: 'utf16-boundary',
        range: { offset, length },
        detail: `range [${offset}, ${offset + length}) splits a surrogate pair`,
      });
    }
    // expectedRaw is evidence, not identity (§5.2): enforced only on the
    // same-version fast path where a mismatch can only mean a stale view
    if (cmp === 0 && envelope.expectedRaw !== undefined && envelope.expectedRaw !== text) {
      return this.#reject(envelope, {
        status: 409,
        code: 'stale-cursor',
        retry: position.update !== undefined ? { cursorBytes: position.update.encode() } : RESELECT,
        detail: 'expectedRaw fingerprint does not match the canonical buffer (stale view, same-version path)',
      });
    }

    // steps 4-5 — frozen WAL ordering around the candidate fork commit
    this.#kernel.appendWal({
      type: 'prepare',
      opId: envelope.opId,
      transactionId: envelope.transactionId,
      actor: envelope.actor,
      peer,
      target: envelope.target,
      baseFrontiers: envelope.baseFrontiers,
      serverTime: Date.now(),
    });
    try {
      // §5.4 write-time frontier recheck (the gate already serializes,
      // the spec asks for the literal re-check before the write)
      if (!sameFrontiers(this.#kernel.frontiers(), canonicalFrontier)) {
        throw new KernelCandidateError('internal', 'frontier moved inside the gate', 'canonical frontier changed between step 1 and the write');
      }
      const receipt = this.#kernel.commitTextOp({
        envelope,
        peer,
        containerKey,
        resolvedOffset: offset,
        responseCursor: envelope.syncCursor,
      });
      this.#kernel.appendWal({ type: 'receipt', opId: envelope.opId, status: 200, serverTime: Date.now() });
      this.#admitted += 1;
      return receipt;
    } catch (error) {
      // candidate failure — WAL abort, canonical/journal untouched, the
      // rejection is NOT journaled: a resubmission re-executes (§5.5)
      const candidate = error instanceof KernelCandidateError ? error : undefined;
      this.#kernel.appendWal({
        type: 'abort',
        opId: envelope.opId,
        reason: candidate?.detail ?? errorMessage(error),
        serverTime: Date.now(),
      });
      this.#rejected += 1;
      // full §5 key set — durable rejections rebuild key-for-key (B3);
      // candidate failures are NOT journaled (§5.5) but keep the shape
      return {
        opId: envelope.opId,
        status: candidate?.code === 'utf16-boundary' ? 422 : 404,
        code: candidate?.code === 'utf16-boundary' ? 'utf16-boundary' : 'bad-target',
        actor: envelope.actor,
        target: envelope.target,
        canonicalFrontier: this.#kernel.frontiers(),
        canonicalUpdate: undefined,
        syncCursor: undefined,
        retry: undefined,
        conflict: undefined,
        range: candidate?.code === 'utf16-boundary' ? { offset, length } : undefined,
        detail: candidate?.detail ?? errorMessage(error),
        serverAdmissionTime: Date.now(),
      };
    }
  }

  /* ── the tree lane (§11 vocabulary; §6 LWW receipts are kernel-side) ─── */

  #runTree(envelope: TreeOpEnvelope, peer: number): AdmissionResult {
    // pre-candidate target law (cheap checks first; structural legality
    // like cycles is enforced inside the candidate fork, §6)
    if (envelope.kind === 'insert') {
      if (this.#kernel.treeNodeOf(envelope.target.componentId) !== undefined) {
        return this.#reject(envelope, {
          status: 404,
          code: 'bad-target',
          detail: `component ${envelope.target.componentId} already exists in the tree`,
        });
      }
    } else {
      // move/remove/revive/update all address one existing component by id
      const componentId = envelope.tree.componentId;
      const treeNodeId = this.#kernel.treeNodeOf(componentId);
      if (treeNodeId === undefined) {
        return this.#reject(envelope, {
          status: 404,
          code: 'bad-target',
          detail: `component ${componentId} has no tree node`,
        });
      }
      if (envelope.kind === 'move' && this.#kernel.isTreeNodeDeleted(treeNodeId)) {
        return this.#reject(envelope, {
          status: 404,
          code: 'bad-target',
          detail: `component ${componentId} is tombstoned — an ordinary move must not revive it (§6)`,
        });
      }
      if (envelope.kind === 'update' && this.#kernel.isTreeNodeDeleted(treeNodeId)) {
        // M5a gap ②: the §6 tombstone law covers data writes too — payloads
        // survive deletion for revival/history, but an ordinary update must
        // not touch a deleted node; only an explicit revive reopens it
        return this.#reject(envelope, {
          status: 404,
          code: 'bad-target',
          detail: `component ${componentId} is tombstoned — a data update must not touch a deleted node (§6); revive it first`,
        });
      }
    }

    this.#kernel.appendWal({
      type: 'prepare',
      opId: envelope.opId,
      transactionId: envelope.transactionId,
      actor: envelope.actor,
      peer,
      target: envelope.target,
      baseFrontiers: envelope.baseFrontiers,
      serverTime: Date.now(),
    });
    try {
      const receipt = this.#kernel.commitTreeOp({ envelope, peer });
      this.#kernel.appendWal({ type: 'receipt', opId: envelope.opId, status: 200, serverTime: Date.now() });
      this.#admitted += 1;
      return receipt;
    } catch (error) {
      const candidate = error instanceof KernelCandidateError ? error : undefined;
      this.#kernel.appendWal({
        type: 'abort',
        opId: envelope.opId,
        reason: candidate?.detail ?? errorMessage(error),
        serverTime: Date.now(),
      });
      this.#rejected += 1;
      // full §5 key set — durable rejections rebuild key-for-key (B3);
      // candidate failures are NOT journaled (§5.5) but keep the shape
      return {
        opId: envelope.opId,
        status: candidate?.code === 'utf16-boundary' ? 422 : 404,
        code: candidate?.code === 'utf16-boundary' ? 'utf16-boundary' : 'bad-target',
        actor: envelope.actor,
        target: envelope.target,
        canonicalFrontier: this.#kernel.frontiers(),
        canonicalUpdate: undefined,
        syncCursor: undefined,
        retry: undefined,
        conflict: undefined,
        range: undefined,
        detail: candidate?.detail ?? errorMessage(error),
        serverAdmissionTime: Date.now(),
      };
    }
  }

  /* ── step 2 machinery: journal influence set, cursor-identity re-anchor ─ */

  #overlapConflict(
    envelope: TextOpEnvelope,
    containerKey: string,
    cursor: Cursor,
    currentOffset: number,
    length: number,
  ): ConflictDetail | undefined {
    // the submitter's base view — one fork serves every record comparison
    const view = this.#kernel.versionView(envelope.baseFrontiers);
    const incomingStart = view.cursorPos(cursor)?.offset;
    if (incomingStart === undefined) return undefined; // cannot anchor the incoming span — no comparable evidence
    const incomingEnd = incomingStart + length;
    const committed: ConflictDetail['committed'][number][] = [];
    for (const record of this.#kernel.influenceFor(containerKey)) {
      // only entries the submitter has NOT seen are "since its base"
      let relation: -1 | 0 | 1 | undefined;
      try {
        relation = this.#kernel.cmpFrontiers(record.frontier, envelope.baseFrontiers);
      } catch {
        continue; // pruned evidence cannot anchor a conflict — skip it
      }
      if (relation === -1 || relation === 0) continue;
      if (record.anchors === undefined) continue; // point insert (or empty-buffer seed) — auto-fuses
      // re-anchor the RECORD's span at the submitter's base via identity
      const recordStart = view.anchorPos(record.anchors.start);
      const recordEnd = view.anchorPos(record.anchors.end);
      if (recordStart === undefined || recordEnd === undefined) continue; // collapsed/unlocatable evidence
      if (!(incomingStart < recordEnd && recordStart < incomingEnd)) continue; // p2 half-open predicate
      committed.push({ opId: record.opId, actor: record.actor, kind: record.kind, offset: recordStart, length: recordEnd - recordStart });
    }
    if (committed.length === 0) return undefined;
    return {
      incoming: { opId: envelope.opId, actor: envelope.actor, kind: envelope.kind, offset: incomingStart, length },
      committed,
      tail: this.#kernel.tailFor(envelope.target.componentId),
      currentText: this.#kernel.bufferText(containerKey),
    };
  }

  /* ── rejection builders (journaled receipts, §5.0) ───────────────────── */

  /**
   * The §4 syncCursor tag-law adjudication for one request cursor (B2):
   * `undefined` when the cursor is legal and resolvable, otherwise the
   * rejection detail. Runs BEFORE any peer/WAL/journal cost — a cursor
   * the response export cannot honor is adjudicated up front, never
   * discovered mid-commit (§5.5's ordering must never meet it).
   */
  #syncCursorDetail(cursor: SyncCursor | undefined): string | undefined {
    if (cursor === undefined) return undefined;
    const tag: unknown = cursor.kind;
    if (tag !== 'frontier' && tag !== 'vv') {
      return `syncCursor.kind must be "frontier" | "vv" (§4 tagged union), got ${JSON.stringify(tag)}`;
    }
    if (!this.#kernel.syncCursorResolvable(cursor)) {
      return 'syncCursor frontier is unknown or pruned on canonical — resync required (§4)';
    }
    return undefined;
  }

  #rejectFrontier(envelope: OpEnvelope, detail: string): AdmissionResult {
    // the resync payload: honor the request cursor when it can be, else
    // (illegal tag / pruned frontier — exactly the stale-client cases §9
    // describes) the restricted snapshot + a fresh frontier cursor. This
    // fallback is the 409's PAYLOAD, not a silent 200 degradation —
    // exportFor itself stays strict (B2)
    let exported: { update: Uint8Array; syncCursor: SyncCursor };
    try {
      exported = this.#kernel.exportFor(envelope.syncCursor);
    } catch {
      exported = this.#kernel.exportFor(undefined);
    }
    return this.#reject(envelope, {
      status: 409,
      code: 'stale-or-unknown-frontier',
      detail,
      canonicalUpdate: exported.update,
      syncCursor: exported.syncCursor,
    });
  }

  #reject(
    envelope: OpEnvelope,
    fields: {
      status: ErrorEnvelope['status'];
      code: ErrorEnvelope['code'];
      detail?: string;
      retry?: ErrorEnvelope['retry'];
      conflict?: ConflictDetail;
      range?: ErrorEnvelope['range'];
      canonicalUpdate?: Uint8Array;
      syncCursor?: SyncCursor;
    },
  ): AdmissionResult {
    const error: ErrorEnvelope = {
      opId: envelope.opId,
      status: fields.status,
      code: fields.code,
      actor: envelope.actor,
      target: envelope.target,
      canonicalFrontier: this.#kernel.frontiers(),
      canonicalUpdate: fields.canonicalUpdate,
      syncCursor: fields.syncCursor,
      retry: fields.retry,
      conflict: fields.conflict,
      range: fields.range,
      detail: fields.detail,
      serverAdmissionTime: Date.now(),
    };
    this.#rejected += 1;
    return this.#kernel.recordRejection(envelope, error);
  }
}

/* ── shared helpers ───────────────────────────────────────────────────── */

const RESELECT = { reason: 'reselect' } as const;

/** the journaled code of one rejected transaction (the first op's code carries it) */
function txCodeOf(receipts: TransactionReceipts): ErrorEnvelope['code'] {
  const code = receipts.receipts[0]?.code;
  if (code === 'utf16-boundary' || code === 'compile-failed' || code === 'dep-unmet' || code === 'bad-target') return code;
  return 'bad-target';
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** frontier deep-equality (the §5.4 write-time recheck) */
function sameFrontiers(a: ReadonlyArray<{ peer: string; counter: number }>, b: ReadonlyArray<{ peer: string; counter: number }>): boolean {
  return JSON.stringify([...a].sort((x, y) => (x.peer < y.peer ? -1 : x.peer > y.peer ? 1 : x.counter - y.counter))) === JSON.stringify([...b].sort((x, y) => (x.peer < y.peer ? -1 : x.peer > y.peer ? 1 : x.counter - y.counter)));
}

/* ── §4 shape law helpers ─────────────────────────────────────────────── */

/** a frontier is a plain array of `{ peer: string, counter: number }` points */
function isFrontierValue(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (point) =>
        typeof point === 'object' && point !== null &&
        typeof (point as { peer?: unknown }).peer === 'string' &&
        typeof (point as { counter?: unknown }).counter === 'number' && Number.isInteger((point as { counter?: unknown }).counter),
    )
  );
}

/** a version vector is a plain `Record<string, integer>` */
function isVersionVectorValue(value: unknown): boolean {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return Object.values(value).every((counter) => typeof counter === 'number' && Number.isInteger(counter));
}

/**
 * A value JSON can round-trip (M5a tree-update meta shape law): plain
 * scalars/arrays/objects only — `undefined`, functions, symbols, bigints,
 * non-finite numbers, class instances and Dates are caller bugs (the
 * kernel deep-copies tree payloads through JSON into CRDT state; a value
 * JSON.stringify would drop or mangle must die at the boundary, never
 * land silently truncated).
 */
function isJsonValue(value: unknown): boolean {
  if (value === null) return true;
  switch (typeof value) {
    case 'string':
    case 'boolean':
      return true;
    case 'number':
      return Number.isFinite(value);
    case 'object':
      break;
    default:
      return false; // undefined, function, symbol, bigint
  }
  if (Array.isArray(value)) return value.every(isJsonValue);
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  return Object.values(value).every(isJsonValue);
}

/**
 * Structural triage of one `syncCursor` (§4 tagged union, B2): the object
 * must be tagged with a STRING kind and, when the kind is a legal enum,
 * carry the matching value shape. Structural garbage is a caller bug
 * (TypeError). A string kind OUTSIDE `frontier | vv` deliberately passes
 * triage — the gate adjudicates it as the protocol 409
 * `stale-or-unknown-frontier`, because a well-formed request with an
 * illegal tag is a protocol adjudication, not a caller bug.
 */
function assertSyncCursorShape(cursor: SyncCursor): void {
  if (typeof cursor !== 'object' || cursor === null) throw new TypeError('syncCursor must be a tagged { kind, value } object (§4)');
  const tag: unknown = (cursor as { kind?: unknown }).kind;
  if (typeof tag !== 'string') throw new TypeError(`syncCursor.kind must be the string "frontier" | "vv" (§4), got ${JSON.stringify(tag)}`);
  const value: unknown = (cursor as { value?: unknown }).value;
  if (tag === 'frontier' && !isFrontierValue(value)) throw new TypeError('syncCursor { kind: "frontier" } must carry a Frontier[] value (§4)');
  if (tag === 'vv' && !isVersionVectorValue(value)) throw new TypeError('syncCursor { kind: "vv" } must carry a Record<string, number> value (§4)');
}

/**
 * §4 shape law — the tagged unions must be honest before the gate ever
 * runs (impl-review-1 B4): the text `kind` enum with its per-kind field
 * constraints, the tree `kind` enum with its kind-specific payload, no
 * cross-domain field smuggling, and the syncCursor structural triage.
 * FROZEN SEMANTICS: violations are caller bugs (TypeError), not protocol
 * adjudications — an illegal shape never reaches peer allocation, the
 * WAL or the journal. The one exception is the syncCursor kind ENUM,
 * which `assertSyncCursorShape` lets through for the gate's journaled
 * 409 (see its doc).
 */
function assertEnvelopeShape(envelope: OpEnvelope): void {
  if (typeof envelope.actor !== 'string' || envelope.actor.length === 0) throw new TypeError('envelope.actor must be a non-empty string');
  if (typeof envelope.opId !== 'string' || envelope.opId.length === 0) throw new TypeError('envelope.opId must be a non-empty string');
  if (!Array.isArray(envelope.baseFrontiers) || !isFrontierValue(envelope.baseFrontiers)) throw new TypeError('envelope.baseFrontiers must be a frontier array');
  if (typeof envelope.target !== 'object' || envelope.target === null || typeof envelope.target.componentId !== 'string' || envelope.target.componentId.length === 0) {
    throw new TypeError('envelope.target must address a non-empty componentId (§4)');
  }
  if (envelope.syncCursor !== undefined) assertSyncCursorShape(envelope.syncCursor);
  if (envelope.domain === 'text') {
    if (typeof envelope.target.buffer !== 'string' || envelope.target.buffer.length === 0) {
      throw new TypeError('text ops must address a named buffer');
    }
    const kind: unknown = (envelope as { kind?: unknown }).kind;
    if (kind === 'create') {
      // M5a gap ①: create carries initialText ONLY — no anchor, no extent,
      // no inserted-text alias (the container does not exist yet; §4's
      // tagged-union law forbids guessing an op type from missing fields,
      // and no cursorBytes can be minted against a nonexistent container)
      if (typeof (envelope as TextCreateOpEnvelope).initialText !== 'string') {
        throw new TypeError('text create must carry a string initialText (§4/M5a)');
      }
      const smuggled = envelope as { cursorBytes?: unknown; offset?: unknown; length?: unknown; text?: unknown };
      if (smuggled.cursorBytes !== undefined || smuggled.offset !== undefined || smuggled.length !== undefined || smuggled.text !== undefined) {
        throw new TypeError('text create carries initialText only — no cursorBytes/offset/length/text smuggling (§4 tagged union)');
      }
      return;
    }
    if (kind !== 'insert' && kind !== 'delete' && kind !== 'replace') {
      throw new TypeError(`text op kind must be "insert" | "delete" | "replace" | "create" (§4 tagged union), got ${JSON.stringify(kind)}`);
    }
    const edit = envelope as TextOpEnvelope;
    if (!(edit.cursorBytes instanceof Uint8Array) || edit.cursorBytes.byteLength === 0) {
      throw new TypeError('text ops must carry non-empty cursorBytes (§4; the ingest exception is internal-only)');
    }
    if (!Number.isInteger(edit.offset) || edit.offset < 0) throw new TypeError('text ops must carry a non-negative integer offset');
    if (!Number.isInteger(edit.length) || edit.length < 0) throw new TypeError('text ops must carry a non-negative integer length');
    if (typeof edit.text !== 'string') throw new TypeError('text ops must carry a string text field');
    if (kind === 'insert') {
      if (edit.text.length === 0) throw new TypeError('insert ops must carry non-empty text');
      if (edit.length !== 0) throw new TypeError('insert ops affect no existing span — length must be 0 (§4)');
    }
    if (kind === 'delete' && edit.text !== '') throw new TypeError('delete ops carry no inserted content — text must be "" (§4)');
  } else if (envelope.domain === 'tree') {
    if (envelope.target.buffer !== undefined) throw new TypeError('tree ops must omit text positioning fields (§4)');
    const carried = envelope as { cursorBytes?: unknown; offset?: unknown; length?: unknown; text?: unknown };
    if (carried.cursorBytes !== undefined || carried.offset !== undefined || carried.length !== undefined || carried.text !== undefined) {
      throw new TypeError('tree ops must not carry text positioning fields (§4: offset/length 只属于 domain=text)');
    }
    if (typeof envelope.tree !== 'object' || envelope.tree === null) throw new TypeError('tree ops must carry their kind-specific payload');
    const kind: unknown = (envelope as { kind?: unknown }).kind;
    if (kind !== 'insert' && kind !== 'move' && kind !== 'remove' && kind !== 'revive' && kind !== 'update') {
      throw new TypeError(`tree op kind must be "insert" | "move" | "remove" | "revive" | "update" (§4/§11 tagged union), got ${JSON.stringify(kind)}`);
    }
    if (kind === 'insert') {
      if (!('item' in envelope.tree)) throw new TypeError('tree insert must carry its item payload (§4: insert={item,parentComponentId,index})');
    } else {
      // move/remove/revive/update all address one component via tree.componentId —
      // the boundary rejects a missing target here, it must never surface
      // as the business 404 of a resolved lookup (impl-review-1 B4)
      const componentId: unknown = (envelope.tree as { componentId?: unknown }).componentId;
      if (typeof componentId !== 'string' || componentId.length === 0) {
        throw new TypeError(`tree ${JSON.stringify(kind)} must carry a non-empty tree.componentId (§4)`);
      }
      if (kind === 'update') {
        // M5a gap ②: the meta shape law — a value JSON cannot round-trip
        // would be silently mangled by the kernel's JSON deep-copy into
        // CRDT state, so the boundary rejects it as a caller bug
        if (!('item' in envelope.tree)) throw new TypeError('tree update must carry its item payload (§4/M5a: update={componentId,item})');
        if (!isJsonValue((envelope.tree as { item?: unknown }).item)) {
          throw new TypeError('tree update item must be a plain JSON value (string/number/boolean/null/plain array/plain object) — the CRDT deep-copies through JSON (M5a)');
        }
      }
    }
    // shared optional payload fields: parents are ids, indices are kernel-form integers
    const payload = envelope.tree as { parentComponentId?: unknown; newParentId?: unknown; index?: unknown };
    for (const [field, value] of [
      ['parentComponentId', payload.parentComponentId],
      ['newParentId', payload.newParentId],
    ] as const) {
      if (value !== undefined && (typeof value !== 'string' || value.length === 0)) {
        throw new TypeError(`tree ${JSON.stringify(kind)} payload ${field} must be a non-empty component id (§4)`);
      }
    }
    if (payload.index !== undefined && (typeof payload.index !== 'number' || !Number.isInteger(payload.index) || payload.index < 0)) {
      throw new TypeError(`tree ${JSON.stringify(kind)} payload index must be a non-negative integer (§4)`);
    }
  } else {
    throw new TypeError(`envelope.domain must be "text" | "tree" (got ${String((envelope as { domain?: unknown }).domain)})`);
  }
}
