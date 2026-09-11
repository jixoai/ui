/**
 * @jixoai/ui-design (studio) — structural equivalence gates for
 * reactive source writes (design-studio-r3 T0, issue #12).
 *
 * Orthogonal intents (2):
 *   1. SIGNATURES — deterministic serializations of the studio's
 *      polled/observed payloads (manifest entries, promotion
 *      statuses, tree stamp records). Two payloads with equal
 *      signatures are interchangeable, so the writer keeps the old
 *      $state identity (no write) and the downstream $derived /
 *      $effect graph sees zero churn from a byte-equal poll — the
 *      #12 root cause was exactly that churn (new array → derived
 *      re-runs → panel seed refetch → "loading" flicker).
 *   2. THE PANEL SEED CONTRACT — seedTargetOf bundles the seed
 *      effect's whole world into plain primitives (frameId /
 *      usageIndex / component / selectionFile); seedSignature then
 *      makes even an identity-only effect re-run a provable no-op.
 *      This removes the LAST object dependency (frameFiles, r3 T0
 *      layer 2).
 *
 * PURE functions only — node-tested without a DOM (selection.ts
 * discipline). Original need: Owner 2026-09-11 issue #12
 * (design-studio-r3 T0, 2026-09-12).
 */

import type { StampRecord } from './selection.ts';

/* ── the payload contracts (the shapes the gates serialize) ─────────── */

/** one manifest.json entry (the navigator's canvas list) */
export interface ManifestEntry {
  readonly name: string;
  readonly path: string;
  readonly frames?: ManifestFrame[];
}
export interface ManifestFrame {
  readonly id: string;
  readonly ref?: string;
}

/**
 * One promotions.json per-file verdict — the REAL payload shape
 * (pipeline/promote.ts PromotionFileStatus; the shell's r2 local copy
 * had drifted — designVersion/regressed never existed server-side).
 * `generatedAt` is deliberately NOT part of the contract: it changes
 * on every request and nothing consumes it.
 */
export interface PromotionFileStatus {
  readonly file: string;
  readonly proto: string;
  readonly ref: string;
  readonly tag: string;
  readonly commitSha: string;
  readonly promotedAt: string;
  /** the newest release tag reachable from HEAD; null = none exist */
  readonly currentTag: string | null;
  /** the design moved ahead of the promotion anchor (apply is meaningful) */
  readonly drifted: boolean;
  /** the recorded tag is gone from the ledger — provenance lost */
  readonly tagMissing: boolean;
  /** the promoted file is gone from the host */
  readonly hostMissing: boolean;
  /** the promoted file differs from its reconstructed base */
  readonly hostModified: boolean;
  /** release notes published after the promotion (empty when in sync) */
  readonly changelogSince: readonly { readonly tag: string; readonly at: string; readonly note: string }[];
  /** git unified diff commitSha..HEAD for the ref (null when not drifted) */
  readonly diff: string | null;
  /** the ref no longer exists at HEAD (the design deleted it) */
  readonly refRemovedFromDesign: boolean;
}

/* ── the signatures (#12 T0 layer 1: source equivalence gates) ──────── */

/**
 * The manifest's structural signature: name + path + frames[].id/ref,
 * in list order (a reordered list IS a change — the navigator's DOM
 * order follows it). `frames: undefined` and `frames: []` are one
 * state (nothing renders either way).
 */
export function manifestSignature(entries: readonly ManifestEntry[]): string {
  return JSON.stringify(
    entries.map((entry) => ({
      name: entry.name,
      path: entry.path,
      frames: (entry.frames ?? []).map((frame) => [frame.id, frame.ref ?? null]),
    })),
  );
}

/**
 * The promotions payload's structural signature: every field the
 * studio consumes (drift verdicts, provenance, host-side states,
 * changelog intent, the diff text), in list order. Equivalent polls
 * produce equal signatures — the badge data keeps its identity.
 */
export function promotionsSignature(statuses: readonly PromotionFileStatus[]): string {
  return JSON.stringify(
    statuses.map((status) => [
      status.file,
      status.proto,
      status.ref,
      status.tag,
      status.commitSha,
      status.promotedAt,
      status.currentTag,
      status.drifted,
      status.tagMissing,
      status.hostMissing,
      status.hostModified,
      status.refRemovedFromDesign,
      status.diff,
      status.changelogSince.map((change) => [change.tag, change.at, change.note]),
    ]),
  );
}

/**
 * The tree records' structural signature: the full stamp tuple in
 * walk order. MutationObserver bursts that leave the stamp tree
 * unchanged (highlight toggles, HMR no-ops) produce equal signatures
 * and must not re-derive tree/groups.
 */
export function recordsSignature(records: readonly StampRecord[]): string {
  return JSON.stringify(
    records.map((record) => [
      record.frameId,
      record.component,
      record.usageIndex,
      record.instanceCount,
      record.parentUsageIndex,
    ]),
  );
}

/* ── the panel seed contract (#12 T0 layer 2: primitive-only deps) ──── */

/** the seed effect's whole world — four primitives, nothing else */
export interface SeedTarget {
  readonly frameId: string | null;
  readonly usageIndex: number;
  readonly component: string;
  /** the shell-resolved edit target (frameId → source file); null = unresolved frame */
  readonly file: string | null;
}

/**
 * Resolve the seed target from the selection plus the shell-resolved
 * file. Defensive about malformed seam payloads (any missing key →
 * null, same as the r2 inline logic). PURE: an identity-churned
 * selection object (same keys, new reference) yields a deep-equal
 * target — that equality is the W2-③ no-flicker contract.
 */
export function seedTargetOf(
  selection: { readonly frameId?: string | null; readonly usageIndex?: number; readonly component?: string } | null,
  selectionFile: string | null,
): SeedTarget | null {
  if (selection === null) return null;
  const { frameId, usageIndex, component } = selection;
  if (usageIndex === undefined || component === undefined) return null;
  return { frameId: frameId ?? null, usageIndex, component, file: selectionFile };
}

/** the seed target's signature — equal signature ⇒ a re-run is a no-op */
export function seedSignature(target: SeedTarget): string {
  return JSON.stringify([target.frameId, target.usageIndex, target.component, target.file]);
}
