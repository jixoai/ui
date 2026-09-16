/**
 * @jixoai/ui-design (collab) — the §6 conflict-and-undo surface for the
 * panel/CLI (collab-protocol M4; protocol-spec §6, P3/P10/P12 evidence):
 *
 *   give-up（撤他人 op）— compensate exactly ONE committed op: the kernel
 *   reverts a copy that contains the target (forkAt its post-commit
 *   frontier) to the target's pre-commit `targetParent`, imports the
 *   inverse through admission under the frozen WAL ordering, and journals
 *   the compensation with `supersedes: targetOpId`. The history is never
 *   rewritten and third-party concurrent edits survive — the copy must
 *   NOT contain the later third-party commits (a full fork's revertTo
 *   would compensate those too), which is exactly the P3/P10 shape.
 *   Idempotency is frozen: a repeated give-up of the same target returns
 *   the original compensation receipt, across actors and across restarts
 *   (the journal carries the `supersedes` link).
 *
 *   override（保自己）— the actor's OWN peer loro UndoManager session
 *   (`openOverride`): while a session is open, the gate routes the
 *   actor's commits through the session fork so the UndoManager records
 *   them (imports are never recorded — p3 evidence), and undo/redo
 *   generate local compensations transformed against concurrent edits;
 *   the gate imports the delta under the same WAL ordering. Other
 *   actors' ops always survive. Sessions are process-local: after a
 *   restart the actor reopens and only NEW ops are on the stack (the
 *   durable path for old ops is give-up).
 *
 * O1/O2 unlock (2026-09-15, `.zcode/epic40/o1o2-probe.md` outcome A —
 * journal-level rebind; loro-crdt stays pinned at 1.16.1):
 *   - revive of the DIRECT target of a `remove` is a journal-level
 *     rebind: a fresh TreeID under the same componentId, the item read
 *     off the dead node's surviving data, the doc-level buffer
 *     containers reused verbatim (they never died), `tree.rebindOf`
 *     auditing the lineage. The old 404 freeze was an engine-move-path
 *     limit, not a product law — §6's explicit-revive door now opens for
 *     directly-deleted targets too (tombstone-by-inheritance descendants
 *     keep the engine move / their TreeID — the p12 path, unchanged);
 *   - tree `remove` ops ARE compensatable (rebind compensation on a
 *     full-current fork: fresh node at the pre-remove placement + item
 *     copy + attached children hung back; third party and buffers
 *     survive). The retired `503 compensation-unsupported` was a
 *     revertTo artifact (fabricated bare node), not an engine truth;
 *   - compensating a text op on a tombstoned component returns 200 and
 *     takes effect (probe C2): a compensation is history rollback, not
 *     a new write — §6's tombstone 404 law covers ordinary writes only.
 *
 * History note (engine limits frozen 2026-09-15, lifted same day by the
 * O1/O2 ruling): the revive-404 and remove-give-up-503 freezes stood on
 * loro 1.16.1's move/revertTo paths; outcome A re-framed both as
 * implementation details the journal layer can route around.
 *
 * Original need: collab-protocol M4 (2026-09-15).
 */

import { AdmissionGate } from './admission.ts';
import type { CollabKernel, OverrideOutcome } from './kernel.ts';
import type { AdmissionResult, CommitReceipt, SyncCursor } from './types.ts';
import { isCommitReceipt } from './types.ts';

/** the gate-or-kernel target every controlled call accepts */
export type GateOrKernel = AdmissionGate | CollabKernel;

function gateOf(target: GateOrKernel): AdmissionGate {
  // a gate keeps its own serialization chain; a bare kernel gets a fresh
  // one — every critical section stays synchronous, so nothing can
  // interleave mid-transaction either way (frontier CAS arbitrates order)
  return target instanceof AdmissionGate ? target : new AdmissionGate(target);
}

function kernelOf(target: GateOrKernel): CollabKernel {
  return target instanceof AdmissionGate ? target.kernel : target;
}

/**
 * Give up (compensate) one committed op — §6. Resolves the 200-lane
 * compensation receipt or the journaled error envelope (404 for an
 * unknown/never-committed target). Tree `remove` targets compensate via
 * the O2 rebind recipe; text targets (including on tombstoned
 * components) compensate via revertTo. Repeated calls for the same
 * target are idempotent.
 */
export function giveUp(
  target: GateOrKernel,
  targetOpId: string,
  actor: string,
  options: { opId?: string; syncCursor?: SyncCursor } = {},
): Promise<AdmissionResult> {
  return gateOf(target).giveUp({ targetOpId, actor, opId: options.opId, syncCursor: options.syncCursor });
}

/** narrow a give-up/override result onto the 200 lane */
export function isCompensationReceipt(result: AdmissionResult): result is CommitReceipt {
  return isCommitReceipt(result);
}

/* ── override（保自己）: the per-actor UndoManager session ─────────────── */

export interface OverrideSession {
  /** the actor whose peer the session's UndoManager is bound to */
  readonly actor: string;
  /** whether the session currently holds an undoable step */
  canUndo(): boolean;
  /** whether the session currently holds a redoable step */
  canRedo(): boolean;
  /**
   * Undo this actor's latest recorded op — other actors' edits survive.
   * `performed` carries the compensation receipt (`supersedes` = the
   * undone opId when the stack metadata identified it); `empty-stack`
   * means the session had nothing to undo (nothing touched).
   */
  undo(opId: string, options?: { syncCursor?: SyncCursor }): Promise<OverrideOutcome>;
  /** the mirror of {@link undo} for the latest undone op */
  redo(opId: string, options?: { syncCursor?: SyncCursor }): Promise<OverrideOutcome>;
  /** drop the session (the undo/redo stacks are process-local by design) */
  close(): void;
}

/**
 * Open (idempotently) the actor's override session. Ops the actor
 * commits while the session is open are recorded on their own loro
 * UndoManager; ops committed BEFORE the call are not (and remain
 * reachable through {@link giveUp}, which is the durable path).
 */
export function openOverride(target: GateOrKernel, actor: string): OverrideSession {
  const kernel = kernelOf(target);
  const gate = gateOf(target);
  kernel.openOverrideSession(actor);
  return {
    actor,
    canUndo: () => kernel.overrideSessionOf(actor).canUndo,
    canRedo: () => kernel.overrideSessionOf(actor).canRedo,
    undo: (opId, options = {}) => gate.overrideUndo({ actor, opId, syncCursor: options.syncCursor }),
    redo: (opId, options = {}) => gate.overrideRedo({ actor, opId, syncCursor: options.syncCursor }),
    close: () => kernel.closeOverrideSession(actor),
  };
}

export type { OverrideOutcome };
