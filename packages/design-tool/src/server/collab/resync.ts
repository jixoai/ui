/**
 * @jixoai/ui-design (collab) — the file-resync ingest station
 * (collab-protocol M3 → M5b; protocol-spec §8 file-resync actor /
 * §2 identity).
 *
 * One external `.svelte` source enters the protocol NATIVELY here:
 *
 *   1. OBSERVE — record the canonical frontier, the source hash and (for
 *      already-ingested pages) the canonical projection hash at read
 *      time (§8's `observedFrontier`/`observedHash`).
 *   2. INJECT — `identity.ingestIds` mints/adopts native ids RECURSIVELY
 *      across the fragment subtree (B5: nested usages adopt too; their
 *      tree inserts parent onto the ENCLOSING component, not the page
 *      root; the page counter stays flat).
 *   3. PLAN — parse the rewritten source and collect the buffer set with
 *      the serialization authorities' own machinery: slot/page text spans
 *      via `collectTextSpans` (stamp/transform.ts — half-open, ASCII
 *      trim, decoded text), quoted-string prop values (the prop-edit
 *      AttrInfo law: the span sits INSIDE the quotes), LITERAL-expression
 *      prop values (§3 「非字符串 props 按其文本序列化值处理」— a single
 *      `{true}`/`{42}`/`{'ghost'}` MustacheTag whose expression is a
 *      string/number/boolean Literal; the span sits INSIDE the braces,
 *      the raw bytes ARE the buffer, so quote style and brace form
 *      round-trip byte-exactly), the instance `<script>` content and the
 *      `<style>` content. Arbitrary expressions (`{title}`, `{count+1}`),
 *      multi-part values, directives and the identity `id` itself are NOT
 *      buffers — they are listed in the report.
 *   4. LAND — through the SAME admission gate as every other op, as
 *      actor `file-system`: one tree insert per newly adopted page/
 *      component (nested components under their parent component's
 *      node), then each new buffer's first insert as a regular text op
 *      (stable cursorBytes from the client-mirror snapshot). No
 *      kernel-bypass content seeding: the only kernel-internal call is
 *      `ensureBuffer(…, '')` — creating the EMPTY container, the one
 *      thing the M2 admission vocabulary cannot express — after which
 *      all content arrives as admitted, journaled, `file-system`-
 *      attributed ops.
 *   5. IDEMPOTENCE — re-ingesting an already-adopted source performs
 *      zero ops and appends zero journal/WAL rows (P15's no-op re-ingest,
 *      re-proven on the kernel-integration path).
 *
 * §8's FULL cycle (M5b, p19 semantics productized):
 *
 *   - STALE → 409: the observed frontier/projection hash is RE-CHECKED
 *     before the first landing op; when invalid the station answers a
 *     409 `stale-or-unknown-frontier` envelope carrying
 *     `canonicalUpdate` + retry `syncCursor` + `externalHash` +
 *     `externalDiff` (component/buffer granularity) — the EXTERNAL FILE
 *     IS NEVER touched on this path.
 *   - REBASE: `station.rebase(envelope)` re-derives against canonical
 *     NOW (nothing stale is trusted except the external source), lands
 *     the buffer-granularity diff — whole-buffer replaces for drifted
 *     buffers, tree inserts + seeds for new components/buffers — and
 *     defers what the vocabulary cannot express (scaffold rewrites need
 *     the tree data-update op, externally-deleted components need a
 *     deletion policy; both are kernel gaps, listed in the report).
 *   - WRITE-BACK: only after canonical commit AND journal/WAL receipts,
 *     the canonical projection is written back through the file adapter
 *     — temp file + atomic rename + final hash verification. A failed
 *     write-back records a `projection-pending` row in the station's
 *     projection journal (recoverable via `flushPendingProjections`);
 *     canonical is never rolled back and nothing else is written.
 *   - WATCHER SEAM: `station.onFileChange(path)` debounces file events
 *     into one read-observe-ingest-writeback cycle per window. API and
 *     tests only — server wiring belongs to M6, when the kernel is
 *     server-hosted (per-change decision, not silently skipped).
 *
 * Gap note (reported, not papered over): admission has no buffer-creation
 * op, so the empty-container bootstrap goes through `kernel.ensureBuffer`
 * — the path types.ts itself labels "kernel-seeded buffer (ingest/test
 * bootstrap)". The §3 internal ingest-op exception (synthetic ops without
 * cursorBytes) is not implemented by the M2 gate; first inserts therefore
 * carry real anchor bytes encoded on the (empty) container, which the
 * gate locates at offset 0.
 *
 * M6 收敛轮 (2026-09-15) — the kernel gaps the M6b host worked around:
 *
 *   - FRESH-LANE DRIFT LANDING (gap ① repaid): a station with a file
 *     adapter tracks each page's CONVERGENCE POINT (the frontier at
 *     which the file last held the canonical projection). When an
 *     already-ingested page re-enters `ingestFile` and the file has
 *     moved, the fresh lane lands the buffer-granularity drift through
 *     the SAME admission path as the rebase lane (three-way at the
 *     convergence frontier — whole-buffer replaces as `file-system`
 *     ops). A files-less station (or the stateless `ingestFile` export)
 *     has no convergence point and keeps the adoption-only semantics —
 *     the drift engine for envelope-carrying callers stays `rebase`.
 *   - THE WRITE-BACK GUARD (never silently overwrite): when the diff
 *     deferred a `scaffold-change` (the external scaffold bytes are
 *     authoritative until the panel's full migration, M7) and the file
 *     differs from the projection, the write-back is SKIPPED and the
 *     outcome carries a visible `writeBackGuard` envelope (deferred
 *     details) — the external bytes are never reverted silently.
 *
 * M7 收官轮 (2026-09-15) — the reconcile lane + the out-of-band converge:
 *
 *   - `reconcileFile` (the explicit opt-in lane, driven at host open for
 *     known pages and on `/usage`): a known page whose stored tree meta
 *     differs from the CURRENT plan — an old-protocol `.jx-collab` (the
 *     M3-era planner skipped brace-literal prop buffers) or an unhosted
 *     structural edit — realigns the stored items through admitted tree
 *     `update` ops (M5a vocabulary) on top of the fresh lane's drift
 *     landing. The ordinary lanes keep deferring scaffold changes.
 *   - `pushCurrentProjection`: canonical advancing WITHOUT a file event
 *     (a panel op through admission) leaves the file holding a PRIOR
 *     projection; the push lane writes the CURRENT one atomically under
 *     the verified-held-bytes no-clobber precondition (the M7a
 *     consumption-side workaround's successor).
 *
 * A re-ingest whose scaffold differs from the stored page item (external
 * structural edits) lands only what the vocabulary can express and
 * reports `scaffoldStale`; the full scaffold rewrite awaits the tree
 * data-update op (kernel gap, M5 leftover ②).
 *
 * Original need: collab-protocol M3 (2026-09-15); §8 full cycle + B5
 * recursion M5b (2026-09-15).
 */

import { createHash } from 'node:crypto';
import { readFileSync, renameSync, writeFileSync } from 'node:fs';

import { parse as parseSvelte } from 'svelte/compiler';

import { AdmissionGate } from './admission.ts';
import { bufferAnchor, projectSource, treeItemsOf, type ComponentTreeItem, type HoleRecord, type HoleSerializer, type PageTreeItem, type SkippedProp } from './bridge.ts';
import { ingestIds, type AdoptionEntry, type PageLedger } from './identity.ts';
import { bufferKeyOf, CollabKernel, ContainerKeyError, encodeContainerKey } from './kernel.ts';
import { collectTextSpans } from '../stamp/transform.ts';
import type { AdmissionResult, Frontier, OpEnvelope, SyncCursor, TextOpEnvelope, TreeOpEnvelope } from './types.ts';

/* ── the actor ────────────────────────────────────────────────────────── */

/** §4's file-system actor — out-of-band writes ride this identity */
export const FILE_SYSTEM_ACTOR = 'file-system';

/* ── typed errors ─────────────────────────────────────────────────────── */

export const RESYNC_ERROR_PREFIX = '[jixoai-collab-resync]';

export type ResyncErrorCode =
  | 'unmarked-component' // a top-level usage lacks a readable id after injection
  | 'corrupt-plan' // spans overlapped — the scaffold could not be assembled
  | 'admission-rejected'; // an ingest op came back from the gate non-200

export class ResyncError extends Error {
  readonly code: ResyncErrorCode;
  readonly result?: AdmissionResult;
  constructor(code: ResyncErrorCode, message: string, result?: AdmissionResult) {
    super(`${RESYNC_ERROR_PREFIX} ${message}`);
    this.name = 'ResyncError';
    this.code = code;
    this.result = result;
  }
}

/* ── the svelte AST shapes this station consumes (structural) ──────────── */

interface ValuePartNode {
  readonly type: string;
  readonly start?: number;
  readonly end?: number;
  readonly data?: string;
  readonly expression?: { readonly type?: string; readonly start?: number; readonly end?: number; readonly value?: unknown } | null;
}

interface AttributeNode {
  readonly type: string;
  readonly name?: string;
  readonly value?: true | readonly ValuePartNode[] | { readonly type: string };
}

interface TextLikeNode {
  readonly type: string;
  readonly start: number;
  readonly end: number;
  readonly data?: string;
}

interface ComponentNode {
  readonly type: string; // InlineComponent (legacy AST) | Component (modern)
  readonly name: string;
  readonly start: number;
  readonly attributes?: readonly AttributeNode[];
  readonly children?: readonly TextLikeNode[];
}

interface ParsedPage {
  readonly html: { readonly children?: readonly unknown[] } | undefined;
  readonly instance: { readonly content?: { readonly start: number; readonly end: number } } | null | undefined;
  readonly css: { readonly children?: readonly TextLikeNode[] } | null | undefined;
  readonly module: unknown;
}

function isComponentNode(node: unknown): node is ComponentNode {
  if (node === null || typeof node !== 'object') return false;
  const { type, name } = node as { type?: unknown; name?: unknown };
  return (type === 'InlineComponent' || type === 'Component') && typeof name === 'string';
}

/* ── the ingest plan ──────────────────────────────────────────────────── */

interface PlannedBuffer {
  readonly componentId: string;
  readonly buffer: string;
  readonly containerKey: string;
  readonly content: string;
  readonly how: HoleSerializer;
}

interface PlannedHole {
  readonly start: number;
  readonly end: number;
  readonly hole: HoleRecord;
}

export interface PagePlan {
  readonly pageItem: PageTreeItem;
  readonly componentItems: readonly ComponentTreeItem[];
  readonly buffers: readonly PlannedBuffer[];
}

/**
 * Parse the (id-injected) source and derive the full ingest plan: the
 * page scaffold (chunks + holes), the component descriptors, and the
 * buffer set. Pure — spans are half-open UTF-16 offsets into `source`.
 */
export function planPage(source: string, path: string, letter: string): PagePlan {
  const ast = parseSvelte(source) as unknown as ParsedPage;
  const children = ast.html?.children ?? [];
  const holes: PlannedHole[] = [];
  const buffers: PlannedBuffer[] = [];
  const pageSkipped: SkippedProp[] = [];

  // page-level regions: the instance script content (ESTree program span)
  const scriptContent = ast.instance?.content;
  if (scriptContent !== undefined) {
    holes.push({ start: scriptContent.start, end: scriptContent.end, hole: { componentId: path, buffer: 'script', how: 'verbatim' } });
    buffers.push(planBuffer(path, 'script', source.slice(scriptContent.start, scriptContent.end), 'verbatim'));
  }
  // …and the style content (first..last CSS child; tags stay scaffold)
  if (ast.css !== null && ast.css !== undefined) {
    const rules = ast.css.children ?? [];
    const start = rules.length > 0 ? rules[0]!.start : styleBodyStart(source);
    const end = rules.length > 0 ? rules[rules.length - 1]!.end : start;
    holes.push({ start, end, hole: { componentId: path, buffer: 'style', how: 'verbatim' } });
    buffers.push(planBuffer(path, 'style', source.slice(start, end), 'verbatim'));
  }
  if (ast.module !== null && ast.module !== undefined) {
    pageSkipped.push({ name: 'script:module', why: 'the module script stays scaffold in M3 — only the instance script is a buffer' });
  }

  // page-level text regions: top-level Text spans (collectTextSpans law).
  // FROZEN NOTE (M3 boundary, kept): page-level text OUTSIDE components is
  // collected from top-level Text nodes only — text inside block fragments
  // not under a component stays scaffold (chunk bytes); nested components'
  // own slot text is collected by their planComponent below.
  const pageTextNodes = children.filter(isTextLike);
  for (const [index, span] of collectTextSpans(pageTextNodes, source).entries()) {
    const buffer = `t-${index}`;
    holes.push({ start: span.start, end: span.end, hole: { componentId: path, buffer, how: 'template-text' } });
    buffers.push(planBuffer(path, buffer, span.text, 'template-text'));
  }

  // components: the WHOLE fragment subtree, recursively (B5) — pre-order
  // document order guarantees a parent's tree insert precedes its
  // children's; nested usages parent onto the enclosing component
  const componentItems: ComponentTreeItem[] = [];
  const planComponent = (node: ComponentNode, parentId: string | undefined): void => {
    const id = idLiteralOf(node);
    if (id === undefined) {
      throw new ResyncError('unmarked-component', `<${node.name}> in ${path} has no readable id after ingestIds injection — cannot adopt its buffers`);
    }
    const skipped: SkippedProp[] = [];
    for (const attribute of node.attributes ?? []) {
      if (attribute.type !== 'Attribute' || typeof attribute.name !== 'string') {
        skipped.push({ name: attributeNameOf(attribute), why: 'directive (bind/on/spread) — not a text buffer' });
        continue;
      }
      if (attribute.name === 'id') continue; // the identity anchor (§2) — never a content buffer
      const part = singleTextPart(attribute);
      if (part !== undefined) {
        try {
          const containerKey = encodeContainerKey(id, bufferKeyOf(attribute.name));
          holes.push({ start: part.start, end: part.end, hole: { componentId: id, buffer: attribute.name, how: 'prop-quoted' } });
          buffers.push({ componentId: id, buffer: attribute.name, containerKey, content: part.data, how: 'prop-quoted' });
        } catch (error) {
          if (!(error instanceof ContainerKeyError)) throw error;
          skipped.push({ name: attribute.name, why: 'prop name maps outside the frozen buffer slug charset' });
        }
        continue;
      }
      // §3's frozen law: non-string props ride their TEXT serialization —
      // a single braced literal IS a buffer (the span sits inside the
      // braces; the raw bytes are the content, quote style included)
      const literal = singleLiteralExpressionPart(attribute, source);
      if (literal !== undefined) {
        try {
          const containerKey = encodeContainerKey(id, bufferKeyOf(attribute.name));
          holes.push({ start: literal.start, end: literal.end, hole: { componentId: id, buffer: attribute.name, how: 'prop-expr' } });
          buffers.push({ componentId: id, buffer: attribute.name, containerKey, content: literal.data, how: 'prop-expr' });
        } catch (error) {
          if (!(error instanceof ContainerKeyError)) throw error;
          skipped.push({ name: attribute.name, why: 'prop name maps outside the frozen buffer slug charset' });
        }
        continue;
      }
      skipped.push({ name: attribute.name, why: skipWhyOf(attribute) });
    }
    // slot text: Text spans of this component's direct fragment — nested
    // component tags are not Text and never overlap their own prop holes
    for (const [index, span] of collectTextSpans(node.children ?? [], source).entries()) {
      const buffer = `t-${index}`;
      holes.push({ start: span.start, end: span.end, hole: { componentId: id, buffer, how: 'template-text' } });
      buffers.push({ componentId: id, buffer, containerKey: encodeContainerKey(id, bufferKeyOf(buffer)), content: span.text, how: 'template-text' });
    }
    componentItems.push({ kind: 'component', id, tag: node.name, path, parentId, skipped });
    walkFragment(node.children ?? [], id);
  };
  const walkFragment = (nodes: readonly unknown[], parentId: string | undefined): void => {
    for (const node of nodes) {
      if (isComponentNode(node)) {
        planComponent(node, parentId);
        continue;
      }
      descendInto(node, parentId);
    }
  };
  /** the frozen fragment containers — mirrors identity.ts's B5 walker */
  const descendInto = (value: unknown, parentId: string | undefined): void => {
    if (value === null || typeof value !== 'object') return;
    const node = value as { type?: unknown; children?: unknown; else?: unknown; pending?: unknown; then?: unknown; catch?: unknown };
    if (Array.isArray(node.children)) walkFragment(node.children, parentId);
    if (node.type === 'IfBlock' && node.else != null && typeof node.else === 'object') descendInto(node.else, parentId);
    if (node.type === 'AwaitBlock') {
      descendInto(node.pending, parentId);
      descendInto(node.then, parentId);
      descendInto(node.catch, parentId);
    }
  };
  walkFragment(children, undefined);

  // assemble the scaffold: document order, no overlaps, chunks between
  holes.sort((a, b) => a.start - b.start);
  const chunks: string[] = [];
  let cursor = 0;
  for (const planned of holes) {
    if (planned.start < cursor || planned.end < planned.start) {
      throw new ResyncError('corrupt-plan', `buffer spans overlap at [${planned.start}, ${planned.end}) in ${path} — the scaffold cannot be assembled`);
    }
    chunks.push(source.slice(cursor, planned.start));
    cursor = planned.end;
  }
  chunks.push(source.slice(cursor));

  return {
    pageItem: { kind: 'page', path, letter, chunks, holes: holes.map((planned) => planned.hole), skipped: pageSkipped },
    componentItems,
    buffers,
  };
}

/* ── plan helpers ─────────────────────────────────────────────────────── */

function planBuffer(componentId: string, buffer: string, content: string, how: HoleSerializer): PlannedBuffer {
  return { componentId, buffer, containerKey: encodeContainerKey(componentId, bufferKeyOf(buffer)), content, how };
}

function isTextLike(node: unknown): node is TextLikeNode {
  if (node === null || typeof node !== 'object') return false;
  const { type, start, end } = node as { type?: unknown; start?: unknown; end?: unknown };
  return typeof type === 'string' && typeof start === 'number' && typeof end === 'number';
}

/** the id attribute's plain text literal (post-ingestIds it must exist) */
function idLiteralOf(node: ComponentNode): string | undefined {
  const attribute = node.attributes?.find((candidate) => candidate.type === 'Attribute' && candidate.name === 'id');
  if (attribute === undefined) return undefined;
  return singleTextPart(attribute)?.data;
}

/** a single plain Text value part with concrete offsets, else undefined */
function singleTextPart(attribute: AttributeNode): { readonly start: number; readonly end: number; readonly data: string } | undefined {
  const value = attribute.value;
  if (!Array.isArray(value) || value.length !== 1) return undefined;
  const only = value[0]!;
  if (only.type !== 'Text' || typeof only.data !== 'string' || typeof only.start !== 'number' || typeof only.end !== 'number') {
    return undefined;
  }
  return { start: only.start, end: only.end, data: only.data };
}

/**
 * A single MustacheTag whose expression is a string/number/boolean
 * LITERAL with concrete offsets — §3's text-serialization form of a
 * non-string prop (`{true}`, `{42}`, `{'ghost'}`). The span is the
 * EXPRESSION's (inside the braces); `data` is the raw bytes verbatim, so
 * the original quote style round-trips as buffer content. Anything else —
 * identifiers, arithmetic, template literals, unary minus, multi-part
 * values — is not text-serializable and stays scaffold.
 */
function singleLiteralExpressionPart(attribute: AttributeNode, source: string): { readonly start: number; readonly end: number; readonly data: string } | undefined {
  const value = attribute.value;
  if (!Array.isArray(value) || value.length !== 1) return undefined;
  const only = value[0]!;
  if (only.type !== 'MustacheTag') return undefined;
  const expression = only.expression;
  if (expression === null || expression === undefined) return undefined;
  if (expression.type !== 'Literal') return undefined;
  const literal = expression.value;
  if (typeof literal !== 'string' && typeof literal !== 'number' && typeof literal !== 'boolean') return undefined;
  if (typeof expression.start !== 'number' || typeof expression.end !== 'number') return undefined;
  // the expression span must sit inside the tag's braces (defensive: the
  // AST contract guarantees it; a violation would corrupt the scaffold)
  if (typeof only.start === 'number' && expression.start < only.start) return undefined;
  if (typeof only.end === 'number' && expression.end > only.end) return undefined;
  return { start: expression.start, end: expression.end, data: source.slice(expression.start, expression.end) };
}

/** why a prop is not a buffer, in the report's vocabulary */
function skipWhyOf(attribute: AttributeNode): string {
  const value = attribute.value;
  if (value === true) return 'bare boolean attribute — not a string literal';
  if (Array.isArray(value)) {
    if (value.length === 1 && value[0]!.type === 'MustacheTag') {
      return 'expression prop — not a text-serializable literal';
    }
    return 'multi-part value — not a buffer';
  }
  return 'expression prop — not a buffer';
}

/** the report name of a non-Attribute node (directives get their prefix) */
function attributeNameOf(attribute: AttributeNode): string {
  if (typeof attribute.name === 'string') {
    if (attribute.type === 'Binding' || attribute.type === 'BindDirective') return `bind:${attribute.name}`;
    if (attribute.type === 'EventHandler') return `on:${attribute.name}`;
    return attribute.name;
  }
  return attribute.type;
}

/** the offset just after `<style…>` — empty style bodies have no children */
function styleBodyStart(source: string): number {
  const open = source.indexOf('<style');
  if (open === -1) return 0;
  const close = source.indexOf('>', open);
  return close === -1 ? source.length : close + 1;
}

/* ── the ledger recovery (tree truth → identity state) ────────────────── */

/**
 * Rebuild the page ledger from the kernel's persisted truth: page letters
 * from the page tree items, the per-letter counter high-water from every
 * component item — tombstones included (nodes survive deletion with
 * their payloads), mirroring §2's 「页计数器高水位 = max(journal 高水位,
 * 页内含 tombstone 已见最大序号)」. Scheme attribution uses the
 * component's OWN page letter exactly like identity's schemeNumberOf —
 * a verbatim `aa3` on page `a` bumps nothing.
 */
export function recoverLedger(kernel: CollabKernel): PageLedger {
  const entries = treeItemsOf(kernel);
  const pages = new Map<string, string>();
  for (const entry of entries) {
    if (entry.page !== undefined && !pages.has(entry.page.path)) pages.set(entry.page.path, entry.page.letter);
  }
  const counters = new Map<string, number>();
  for (const entry of entries) {
    const component = entry.component;
    if (component === undefined) continue;
    const letter = pages.get(component.path);
    if (letter === undefined) continue;
    const match = new RegExp(`^${letter}(\\d+)$`).exec(component.id);
    if (match === null) continue;
    counters.set(letter, Math.max(counters.get(letter) ?? 0, Number(match[1])));
  }
  return { pages, counters };
}

/* ── the observed state (§8) ──────────────────────────────────────────── */

/** what the station saw when it read the external source */
export interface ObservedState {
  readonly frontier: Frontier;
  /** sha256 of the EXTERNAL source bytes (pre-injection) */
  readonly hash: string;
  /**
   * sha256 of the page's canonical PROJECTION at observe time (present
   * only when the page is already ingested) — §8's commit-time hash
   * recheck is against this, never against the external bytes.
   */
  readonly projectionHash?: string;
}

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** frontier deep-equality (the §8 commit-time recheck; admission's twin) */
function sameFrontiers(a: Frontier, b: Frontier): boolean {
  const sorted = (f: Frontier) => JSON.stringify([...f].sort((x, y) => (x.peer < y.peer ? -1 : x.peer > y.peer ? 1 : x.counter - y.counter)));
  return sorted(a) === sorted(b);
}

/* ── the external diff (component/buffer granularity — never whole-file) ── */

/** one entry of §8's `externalDiff` — the rebase lands these */
export type ExternalDiffEntry =
  | { readonly kind: 'new-component'; readonly componentId: string; readonly tag: string; readonly parentId?: string }
  | { readonly kind: 'new-buffer'; readonly componentId: string; readonly buffer: string; readonly content: string }
  | { readonly kind: 'buffer-change'; readonly componentId: string; readonly buffer: string; readonly external: string; readonly canonical: string }
  | { readonly kind: 'scaffold-change'; readonly componentId: string; readonly detail: string }
  | { readonly kind: 'removed-component'; readonly componentId: string; readonly detail: string };

/** the §8 stale-ingest adjudication — a 409 envelope, never a landed op */
export interface StaleIngest {
  readonly status: 409;
  readonly code: 'stale-or-unknown-frontier';
  readonly path: string;
  /** what the station saw when the external source was read */
  readonly observed: ObservedState;
  /** canonical now (why the observed state is invalid) */
  readonly canonicalFrontier: Frontier;
  /** canonical increment FROM the observed frontier (§5 resync payload) */
  readonly canonicalUpdate: Uint8Array;
  /** the retry cursor — re-observe at this version and resubmit */
  readonly syncCursor: SyncCursor;
  /** sha256 of the external source bytes (the envelope's §8 extras) */
  readonly externalHash: string;
  /** the external source the diff was computed from (the rebase input) */
  readonly externalSource: string;
  /** component/buffer-granularity drift external → canonical */
  readonly externalDiff: readonly ExternalDiffEntry[];
  /** the page's current canonical projection (the rebase base), when ingested */
  readonly canonicalProjection?: string;
  readonly detail: string;
}

/** the 409 lane marker on the happy report (the discriminated union) */
export type IngestOutcome = IngestResult | StaleIngest;

/**
 * The STATION's public answer: the 200-lane report (the ledger is
 * internal station state — never leaked) or the §8 409 envelope.
 */
export type StationOutcome = IngestReport | StaleIngest;

/* ── ingest results ───────────────────────────────────────────────────── */

export interface IngestBufferReport {
  readonly componentId: string;
  readonly buffer: string;
  readonly containerKey: string;
  /** the empty container was ensured in this run (the admission-vocabulary gap) */
  readonly created: boolean;
  /** a first-insert text op was admitted (content was non-empty) */
  readonly seeded: boolean;
  readonly opId?: string;
}

export interface IngestReport {
  /** the 200 lane marker (the §8 stale path answers `status: 409`) */
  readonly status: 200;
  readonly path: string;
  readonly observed: ObservedState;
  /** identity.ingestIds' adoption journal (id/path/component/adopted) */
  readonly adoptions: readonly AdoptionEntry[];
  /** the page tree node was inserted in this run */
  readonly pageAdopted: boolean;
  /** component ids whose tree nodes were inserted in this run */
  readonly treeInserts: readonly string[];
  readonly buffers: readonly IngestBufferReport[];
  /** every non-buffer skip the plan recorded (expressions, directives, …) */
  readonly skipped: readonly { readonly componentId: string; readonly name: string; readonly why: string }[];
  /**
   * the stored page scaffold differs from this source's plan — the
   * scaffold rewrite needs the tree data-update op (kernel gap, M5
   * leftover ②); rebase defers it and reports it here.
   */
  readonly scaffoldStale: boolean;
  /** true when nothing at all landed (the P15 no-op re-ingest) */
  readonly idempotent: boolean;
  /** the id-injected source (the projection's fixed point) */
  readonly rewrittenSource: string;
  /** §8 rebase: this run landed a stale-ingest envelope's diff */
  readonly rebased?: boolean;
  /** §8 rebase: the diff entries that actually landed */
  readonly landed?: readonly ExternalDiffEntry[];
  /** §8 rebase: the diff entries the vocabulary cannot express (kernel gaps) */
  readonly deferred?: readonly ExternalDiffEntry[];
  /**
   * fresh-lane drift landing (kernel gap ① repaid, M6 收敛轮): this run
   * landed an already-ingested page's external buffer drift through the
   * same admission path as the rebase lane (three-way at the station's
   * convergence frontier) — no envelope was involved.
   */
  readonly driftLanded?: boolean;
  /**
   * reconcile lane (M7 收官轮): the stored tree meta this run REALIGNED
   * through admitted tree `update` ops — the page path plus component ids
   * whose stored items differed from the current plan (cross-era
   * journals, unhosted structural edits). Absent on the ordinary lanes.
   */
  readonly metaRealigned?: readonly string[];
  /**
   * the §8 write-back guard fired: the diff deferred a scaffold change
   * AND the file differed from the projection, so the external scaffold
   * bytes stayed authoritative (frozen note: until the panel's full
   * migration, M7) — the write-back was SKIPPED, never a silent revert.
   * Visible envelope: the deferred details ride the outcome.
   */
  readonly writeBackGuard?: { readonly reason: string; readonly deferred: readonly ExternalDiffEntry[] };
}

export interface IngestResult extends IngestReport {
  /** the ledger to persist for the next ingest (identity state) */
  readonly ledger: PageLedger;
}

export interface IngestOptions {
  /** the workspace's shared gate; a private one is created when omitted */
  readonly gate?: AdmissionGate;
  /** the identity ledger; recovered from the kernel when omitted */
  readonly ledger?: PageLedger;
  /**
   * §8 pre-recorded observed state — the commit-time recheck (frontier +
   * projection hash) adjudicates against it; omitted means observe NOW
   * (synchronously before landing, so a same-call ingest can never go
   * stale — the stale lane is the deferred/queued/retry ingest's path).
   */
  readonly observed?: ObservedState;
}

/* ── op envelope builders (§4 tagged unions, types.ts shapes) ─────────── */

/** the next `file-system:<n>` opId — journal-derived, station-independent */
function fileSystemOpSeq(kernel: CollabKernel): () => string {
  let max = 0;
  for (const entry of kernel.journalEntries()) {
    if (entry.type !== 'commit' && entry.type !== 'rejection') continue;
    const match = /^file-system:(\d+)$/.exec(entry.opId);
    if (match !== null) max = Math.max(max, Number(match[1]));
  }
  let seq = max;
  return () => `file-system:${(seq += 1)}`;
}

function treeInsertEnvelope(opId: string, componentId: string, item: unknown, parentComponentId: string | undefined, base: Frontier): TreeOpEnvelope {
  return {
    actor: FILE_SYSTEM_ACTOR,
    opId,
    baseFrontiers: base,
    domain: 'tree',
    kind: 'insert',
    target: { componentId },
    tree: { item, parentComponentId, index: undefined },
  };
}

/**
 * The reconcile lane's meta realignment (M7 收官轮): one admitted tree
 * `update` op — the M5a data-update vocabulary, full item replacement —
 * replacing a stored page/component item with the CURRENT plan's. The
 * fresh/rebase lanes still DEFER scaffold changes (the external-bytes
 * guard); the reconcile lane is the explicit opt-in that lands them.
 */
function treeUpdateEnvelope(opId: string, componentId: string, item: unknown, base: Frontier): TreeOpEnvelope {
  return {
    actor: FILE_SYSTEM_ACTOR,
    opId,
    baseFrontiers: base,
    domain: 'tree',
    kind: 'update',
    target: { componentId },
    // the §4/M5a item law: a plain JSON value — the plan's items carry
    // optional-undefined keys (parentId), which a JSON round-trip drops
    tree: { componentId, item: JSON.parse(JSON.stringify(item)) },
  };
}

function textFirstInsertEnvelope(kernel: CollabKernel, opId: string, componentId: string, buffer: string, text: string): TextOpEnvelope {
  return {
    actor: FILE_SYSTEM_ACTOR,
    opId,
    baseFrontiers: kernel.frontiers(),
    domain: 'text',
    kind: 'insert',
    target: { componentId, buffer },
    // the §3 internal exception (cursor-less synthetic ops) is not
    // implemented by the M2 gate — real anchor bytes on the (empty)
    // container, locatable at offset 0
    cursorBytes: bufferAnchor(kernel, componentId, buffer, 0),
    offset: 0,
    length: 0,
    text,
    timestamp: Date.now(),
  };
}

/**
 * §8 rebase: one drifted buffer's whole content as an admitted replace —
 * the anchor is the buffer's head, the affected length is the CURRENT
 * canonical length (rebuilt at construct time, never the diff snapshot's).
 * A concurrent same-buffer write meets the gate's §5.2 overlap check and
 * answers 409 conflict — exactly the §6 semantics, never a silent clobber.
 */
function textReplaceEnvelope(kernel: CollabKernel, opId: string, componentId: string, buffer: string, text: string): TextOpEnvelope {
  const containerKey = encodeContainerKey(componentId, bufferKeyOf(buffer));
  const canonicalLength = kernel.bufferText(containerKey).length;
  return {
    actor: FILE_SYSTEM_ACTOR,
    opId,
    baseFrontiers: kernel.frontiers(),
    domain: 'text',
    kind: 'replace',
    target: { componentId, buffer },
    cursorBytes: bufferAnchor(kernel, componentId, buffer, 0),
    offset: 0,
    length: canonicalLength,
    text,
    timestamp: Date.now(),
  };
}

/* ── the ingest core ──────────────────────────────────────────────────── */

/** §8 step 1: the observed state at read time (frontier + hashes) */
function observeState(kernel: CollabKernel, path: string, source: string): ObservedState {
  const ingested = treeItemsOf(kernel).some((entry) => entry.page?.path === path);
  return {
    frontier: kernel.frontiers(),
    hash: sha256(source),
    ...(ingested ? { projectionHash: sha256(projectSource(kernel, path).source) } : {}),
  };
}

/**
 * The three-way base: one buffer's canonical content at the OBSERVED
 * frontier (§8 与该版本投影 diff). Reconstructed from the journal — the
 * append-only rows carry each op's pre/post text, so walking reverse and
 * rolling back every row that landed AFTER `at` (the first in-base row's
 * `value` / the seed's `value`) yields the text the external writer saw.
 * `undefined` = the buffer did not exist at `at` (seeded later). Pruned
 * frontiers degrade to the current text (the diff then includes
 * canonical-side movement — visible in the landed replaces, never silent).
 */
function bufferBaseAt(kernel: CollabKernel, containerKey: string, at: Frontier): string | undefined {
  const entries = kernel.journalEntries();
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i]!;
    if (entry.type === 'commit' && entry.domain === 'text' && entry.containerKey === containerKey) {
      let relation: -1 | 0 | 1 | undefined;
      try {
        relation = kernel.cmpFrontiers(entry.frontier, at);
      } catch {
        continue; // pruned evidence — keep rolling back conservatively
      }
      if (relation === -1 || relation === 0) return entry.value; // the latest in-base op's post text IS the base
      continue; // after the observed version — roll back through it
    }
    if (entry.type === 'buffer-seed' && entry.containerKey === containerKey) {
      let relation: -1 | 0 | 1 | undefined;
      try {
        relation = kernel.cmpFrontiers(entry.frontier, at);
      } catch {
        return kernel.bufferText(containerKey); // degraded mode
      }
      if (relation === 1) return undefined; // born after the observed version
      return entry.value; // no in-base commits above — the seed content is the base
    }
  }
  return undefined;
}

/**
 * §8's `externalDiff`: the EXTERNAL plan vs the OBSERVED version's
 * projection, three-way at component/buffer granularity — external drift
 * is what differs from the base; buffers only canonical moved are NOT
 * drift (the concurrent edit survives the rebase; p19's
 * preservedConcurrentEdit, buffer-granular).
 */
function diffPlanAgainstCanonical(kernel: CollabKernel, path: string, plan: PagePlan, observedAt: Frontier): readonly ExternalDiffEntry[] {
  const entries: ExternalDiffEntry[] = [];
  const storedPage = treeItemsOf(kernel).find((entry) => entry.page?.path === path)?.page;
  if (storedPage !== undefined && stableStringify(storedPage) !== stableStringify(plan.pageItem)) {
    entries.push({
      kind: 'scaffold-change',
      componentId: path,
      detail: 'the stored chunk/hole scaffold differs — landing it needs the tree data-update op (kernel gap, M5 leftover ②)',
    });
  }
  for (const buffer of plan.buffers) {
    const base = bufferBaseAt(kernel, buffer.containerKey, observedAt);
    if (base === undefined) {
      // did not exist at the observed version
      if (!kernel.hasBuffer(buffer.containerKey)) {
        entries.push({ kind: 'new-buffer', componentId: buffer.componentId, buffer: buffer.buffer, content: buffer.content });
      } else {
        // born after the observed version (someone else's concurrent work) —
        // the file-system's content rides a replace, last-writer journaled
        entries.push({
          kind: 'buffer-change',
          componentId: buffer.componentId,
          buffer: buffer.buffer,
          external: buffer.content,
          canonical: kernel.bufferText(buffer.containerKey),
        });
      }
      continue;
    }
    if (buffer.content === base) continue; // external did not move it — canonical-only movement is NOT drift
    const canonical = kernel.bufferText(buffer.containerKey);
    if (buffer.content === canonical) continue; // already converged (a retry loop re-derives the same diff)
    entries.push({ kind: 'buffer-change', componentId: buffer.componentId, buffer: buffer.buffer, external: buffer.content, canonical });
  }
  for (const component of plan.componentItems) {
    if (kernel.treeNodeOf(component.id) === undefined) {
      entries.push({
        kind: 'new-component',
        componentId: component.id,
        tag: component.tag,
        ...(component.parentId !== undefined ? { parentId: component.parentId } : {}),
      });
    }
  }
  const externalIds = new Set(plan.componentItems.map((component) => component.id));
  for (const entry of treeItemsOf(kernel)) {
    const component = entry.component;
    if (component === undefined || component.path !== path || entry.deleted) continue;
    if (!externalIds.has(component.id)) {
      entries.push({
        kind: 'removed-component',
        componentId: component.id,
        detail: 'the external source no longer holds this component — removal is a deletion-policy decision (conflict surface), not the station\u2019s',
      });
    }
  }
  return entries;
}

/** the §8 commit-time recheck: undefined = still fresh, else the 409 detail */
function staleDetailOf(kernel: CollabKernel, path: string, observed: ObservedState): string | undefined {
  if (!sameFrontiers(kernel.frontiers(), observed.frontier)) {
    return 'the canonical frontier moved between the file read and admission — the ingest base is stale (§8)';
  }
  if (observed.projectionHash !== undefined) {
    const ingested = treeItemsOf(kernel).some((entry) => entry.page?.path === path);
    if (ingested && sha256(projectSource(kernel, path).source) !== observed.projectionHash) {
      return 'the canonical projection changed between the file read and admission — the diff base is stale (§8)';
    }
  }
  return undefined;
}

/** the §8 409 envelope — canonical increment, retry cursor, external hash/diff */
function staleEnvelope(kernel: CollabKernel, path: string, observed: ObservedState, source: string, plan: PagePlan, detail: string): StaleIngest {
  // the resync payload honors the observed frontier when loro still can;
  // a pruned observed frontier answers the restricted snapshot (§5)
  let canonicalUpdate: Uint8Array;
  let syncCursor: SyncCursor;
  try {
    canonicalUpdate = kernel.exportFor({ kind: 'frontier', value: observed.frontier }).update;
    syncCursor = { kind: 'frontier', value: kernel.frontiers() };
  } catch {
    const restricted = kernel.exportFor(undefined);
    canonicalUpdate = restricted.update;
    syncCursor = restricted.syncCursor;
  }
  const ingested = treeItemsOf(kernel).some((entry) => entry.page?.path === path);
  return {
    status: 409,
    code: 'stale-or-unknown-frontier',
    path,
    observed,
    canonicalFrontier: kernel.frontiers(),
    canonicalUpdate,
    syncCursor,
    externalHash: sha256(source),
    externalSource: source,
    externalDiff: diffPlanAgainstCanonical(kernel, path, plan, observed.frontier),
    ...(ingested ? { canonicalProjection: projectSource(kernel, path).source } : {}),
    detail,
  };
}

/** the shared admit helper — ingests are sequential, fail-stop on non-200 */
function admitThrough(gate: AdmissionGate): (envelope: OpEnvelope) => Promise<string> {
  return async (envelope: OpEnvelope): Promise<string> => {
    const result = await gate.admit(envelope);
    if (result.status !== 200) {
      throw new ResyncError(
        'admission-rejected',
        `ingest op ${envelope.opId} came back ${String(result.status)}${'code' in result ? ` ${String(result.code)}` : ''} — the station fails stop (see .result)`,
        result,
      );
    }
    return envelope.opId;
  };
}

/** the happy-path landing: page node, components (parent-aware), buffers */
async function landPlan(
  kernel: CollabKernel,
  nextOpId: () => string,
  admit: (envelope: OpEnvelope) => Promise<string>,
  path: string,
  plan: PagePlan,
): Promise<{ pageAdopted: boolean; treeInserts: string[]; bufferReports: IngestBufferReport[]; scaffoldStale: boolean }> {
  const storedPage = treeItemsOf(kernel).find((entry) => entry.page?.path === path)?.page;
  const scaffoldStale = storedPage !== undefined && stableStringify(storedPage) !== stableStringify(plan.pageItem);
  const pageAdopted = storedPage === undefined;
  if (pageAdopted) {
    await admit(treeInsertEnvelope(nextOpId(), path, plan.pageItem, undefined, kernel.frontiers()));
  }

  const treeInserts: string[] = [];
  const bufferReports: IngestBufferReport[] = [];
  for (const component of plan.componentItems) {
    if (kernel.treeNodeOf(component.id) === undefined) {
      treeInserts.push(component.id);
      // B5: a nested usage parents onto its ENCLOSING component's node —
      // pre-order planning guarantees the parent's insert came first
      await admit(treeInsertEnvelope(nextOpId(), component.id, component, component.parentId ?? path, kernel.frontiers()));
    }
    await landBuffers(kernel, nextOpId, admit, component.id, plan, bufferReports);
  }
  await landBuffers(kernel, nextOpId, admit, path, plan, bufferReports);
  return { pageAdopted, treeInserts, bufferReports, scaffoldStale };
}

/**
 * The station's convergence point for one page: the canonical frontier at
 * which the external file last verifiably held the projection. This is
 * the three-way base of the fresh lane's drift landing (the external
 * writer's effective read version) — the rebase lane's equivalent is the
 * stale envelope's `observed.frontier`.
 */
export interface ConvergenceBase {
  readonly frontier: Frontier;
}

async function runIngest(
  kernel: CollabKernel,
  gate: AdmissionGate,
  ledger: PageLedger,
  path: string,
  source: string,
  preobserved?: ObservedState,
  convergedAt?: ConvergenceBase,
  reconcile?: boolean,
): Promise<IngestOutcome> {
  if (preobserved !== undefined && preobserved.hash !== sha256(source)) {
    throw new TypeError(
      `${RESYNC_ERROR_PREFIX} the supplied observed state hashes different bytes than the given source — record observed at read time and pass the same source`,
    );
  }
  const observed = preobserved ?? observeState(kernel, path, source);

  // steps 1-2: inject ids (IdentityError → the admission 409 feed, by contract)
  const ids = ingestIds(source, ledger, path);
  const letter = ids.ledger.pages.get(path)!;
  const plan = planPage(ids.source, path, letter);
  const nextOpId = fileSystemOpSeq(kernel);

  // §8 commit-time recheck BEFORE the first landing op — stale ⇒ the 409
  // envelope; NOTHING lands and the external file is never touched
  const staleDetail = staleDetailOf(kernel, path, observed);
  if (staleDetail !== undefined) {
    return staleEnvelope(kernel, path, observed, source, plan, staleDetail);
  }

  const admit = admitThrough(gate);
  // kernel gap ① repaid (M6 收敛轮): an ALREADY-INGESTED page with a
  // convergence point lands its buffer drift on the FRESH lane too — the
  // same three-way engine as the rebase lane (base = the convergence
  // frontier; canonical-only movement is never drift, so concurrent ops
  // survive). Files-less/stateless callers pass no base: adoption-only,
  // the envelope-carrying rebase stays their drift engine.
  const alreadyIngested = treeItemsOf(kernel).some((entry) => entry.page?.path === path);
  const drift = alreadyIngested && convergedAt !== undefined ? diffPlanAgainstCanonical(kernel, path, plan, convergedAt.frontier) : [];

  const landing = await landPlan(kernel, nextOpId, admit, path, plan);
  const { bufferReports, ...landingRest } = landing;

  // reconcile lane (M7 收官轮): the stored page/component items REALIGN
  // to the current plan through admitted tree `update` ops — the M5a
  // data-update vocabulary the ordinary lanes still defer to the guard.
  // This is the cross-era converge: an old-protocol journal (e.g. the M3
  // era, which skipped brace-literal prop buffers) meets the current
  // planner, and the tree meta starts referencing what the file holds.
  const realigned: string[] = [];
  if (reconcile === true) {
    // the §4/M5a item law: plain JSON values — normalize the plan items
    // (optional-undefined keys drop) so STORED and PLANNED compare under
    // one canonical form and the fixed point stays idempotent
    const jsonItem = (item: unknown): unknown => JSON.parse(JSON.stringify(item));
    if (landing.scaffoldStale) {
      await admit(treeUpdateEnvelope(nextOpId(), path, jsonItem(plan.pageItem), kernel.frontiers()));
      realigned.push(path);
    }
    for (const component of plan.componentItems) {
      const normalized = jsonItem(component);
      const stored = treeItemsOf(kernel).find((entry) => entry.component?.id === component.id)?.component;
      if (stored === undefined || stableStringify(stored) !== stableStringify(normalized)) {
        await admit(treeUpdateEnvelope(nextOpId(), component.id, normalized, kernel.frontiers()));
        realigned.push(component.id);
      }
    }
  }

  const landed: ExternalDiffEntry[] = [];
  const deferred: ExternalDiffEntry[] = [];
  for (const entry of drift) {
    if (entry.kind === 'new-component' || entry.kind === 'new-buffer') {
      landed.push(entry); // landed by landPlan above
      continue;
    }
    if (entry.kind === 'buffer-change') {
      await admit(textReplaceEnvelope(kernel, nextOpId(), entry.componentId, entry.buffer, entry.external));
      landed.push(entry);
      continue;
    }
    if (entry.kind === 'scaffold-change' && reconcile === true) {
      landed.push(entry); // realigned through the tree update ops above
      continue;
    }
    deferred.push(entry); // scaffold-change / removed-component
  }

  return {
    status: 200,
    path,
    observed,
    adoptions: ids.journal,
    ...landingRest,
    buffers: bufferReports,
    skipped: [
      ...plan.pageItem.skipped.map((skip) => ({ componentId: path, name: skip.name, why: skip.why })),
      ...plan.componentItems.flatMap((component) => component.skipped.map((skip) => ({ componentId: component.id, name: skip.name, why: skip.why }))),
    ],
    idempotent:
      !landing.pageAdopted && landing.treeInserts.length === 0 && bufferReports.every((report) => !report.created && !report.seeded) && landed.length === 0 && realigned.length === 0,
    rewrittenSource: ids.source,
    ...(convergedAt !== undefined && alreadyIngested ? { landed, deferred, driftLanded: landed.some((entry) => entry.kind === 'buffer-change') } : {}),
    ...(reconcile === true && realigned.length > 0 ? { metaRealigned: realigned } : {}),
    ledger: ids.ledger,
  };
}

/**
 * §8 rebase: re-derive the external source against canonical NOW (nothing
 * stale is trusted from the envelope except the source itself), then land
 * the buffer-granularity diff — new components/buffers as ingest ops,
 * drifted buffers as whole-buffer replaces, scaffold rewrites and external
 * removals deferred (kernel gap / deletion policy) and reported.
 */
async function runRebase(kernel: CollabKernel, gate: AdmissionGate, ledger: PageLedger, stale: StaleIngest): Promise<IngestResult> {
  const path = stale.path;
  const source = stale.externalSource;
  const observed = observeState(kernel, path, source); // §8: 以新的 canonical frontier/hash 重提

  const ids = ingestIds(source, ledger, path);
  const letter = ids.ledger.pages.get(path)!;
  const plan = planPage(ids.source, path, letter);
  const nextOpId = fileSystemOpSeq(kernel);
  // the three-way base is the ORIGINAL observed frontier (the external
  // writer's read version) — the fresh observe only refreshes the
  // admission base; canonical-only movement is never counted as drift
  const diff = diffPlanAgainstCanonical(kernel, path, plan, stale.observed.frontier);

  const admit = admitThrough(gate);
  const landing = await landPlan(kernel, nextOpId, admit, path, plan);
  const { bufferReports, ...landingRest } = landing;

  const landed: ExternalDiffEntry[] = [];
  const deferred: ExternalDiffEntry[] = [];
  for (const entry of diff) {
    if (entry.kind === 'new-component' || entry.kind === 'new-buffer') {
      landed.push(entry); // landed by landPlan above
      continue;
    }
    if (entry.kind === 'buffer-change') {
      await admit(textReplaceEnvelope(kernel, nextOpId(), entry.componentId, entry.buffer, entry.external));
      landed.push(entry);
      continue;
    }
    deferred.push(entry); // scaffold-change / removed-component
  }

  return {
    status: 200,
    path,
    observed,
    adoptions: ids.journal,
    ...landingRest,
    buffers: bufferReports,
    skipped: [
      ...plan.pageItem.skipped.map((skip) => ({ componentId: path, name: skip.name, why: skip.why })),
      ...plan.componentItems.flatMap((component) => component.skipped.map((skip) => ({ componentId: component.id, name: skip.name, why: skip.why }))),
    ],
    idempotent:
      !landing.pageAdopted && landing.treeInserts.length === 0 && bufferReports.every((report) => !report.created && !report.seeded) && landed.length === 0,
    rewrittenSource: ids.source,
    rebased: true,
    landed,
    deferred,
    ledger: ids.ledger,
  };
}

/** ensure + first-insert every not-yet-adopted buffer of one owner */
async function landBuffers(
  kernel: CollabKernel,
  nextOpId: () => string,
  admit: (envelope: OpEnvelope) => Promise<string>,
  componentId: string,
  plan: PagePlan,
  reports: IngestBufferReport[],
): Promise<void> {
  for (const buffer of plan.buffers) {
    if (buffer.componentId !== componentId) continue;
    const created = !kernel.hasBuffer(buffer.containerKey);
    if (created) {
      // the admission-vocabulary gap: containers are kernel-ensured EMPTY;
      // every byte of content below arrives as an admitted file-system op
      kernel.ensureBuffer(buffer.componentId, buffer.buffer, '');
    }
    let seeded = false;
    let opId: string | undefined;
    // only a NEW buffer takes a first insert — an existing buffer's
    // content is canonical truth; external drift is M5's rebase, never
    // silently re-seeded here
    if (created && buffer.content.length > 0) {
      const envelope = textFirstInsertEnvelope(kernel, nextOpId(), buffer.componentId, buffer.buffer, buffer.content);
      opId = await admit(envelope);
      seeded = true;
    }
    reports.push({ componentId: buffer.componentId, buffer: buffer.buffer, containerKey: buffer.containerKey, created, seeded, opId });
  }
}

/* ── the public surface ───────────────────────────────────────────────── */

/**
 * Ingest one external `.svelte` source into the protocol (§8 happy path:
 * observe → inject → plan → land through admission). Pure over the
 * injected ledger; the returned result carries the next ledger. With a
 * pre-recorded `observed` state the §8 commit-time recheck runs and the
 * stale lane answers the 409 envelope instead of landing.
 */
export async function ingestFile(kernel: CollabKernel, path: string, source: string, options?: IngestOptions): Promise<IngestOutcome> {
  const gate = options?.gate ?? new AdmissionGate(kernel);
  const ledger = options?.ledger ?? recoverLedger(kernel);
  return runIngest(kernel, gate, ledger, path, source, options?.observed);
}

/* ── the projection file adapter (§8 atomic write-back) ───────────────── */

/** how the station touches external files — injectable for tests/embedding */
export interface ProjectionFileAdapter {
  /** the external file's current bytes (the watcher's read path) */
  read(path: string): string;
  /**
   * Atomic write: temp file in the SAME directory + rename over the
   * target + read-back hash verification against `expectedHash`. Throws
   * on any failure — the caller records `projection-pending` and never
   * writes anywhere else (§8: 不回滚不另写).
   */
  writeAtomic(path: string, content: string, expectedHash: string): void;
}

/** the node:fs default: `<path>.projection-tmp` + `renameSync` + hash check */
export function nodeProjectionFiles(): ProjectionFileAdapter {
  return {
    read: (path) => readFileSync(path, 'utf8'),
    writeAtomic(path, content, expectedHash) {
      const tmp = `${path}.projection-tmp`;
      writeFileSync(tmp, content, 'utf8');
      renameSync(tmp, path);
      const written = readFileSync(path, 'utf8');
      if (sha256(written) !== expectedHash) {
        throw new Error(`${RESYNC_ERROR_PREFIX} hash mismatch after atomic write of ${path}: expected ${expectedHash}, file holds ${sha256(written)}`);
      }
    },
  };
}

/* ── the station-side projection journal (§8 write-back accounting) ───── */

/**
 * The write-back worklist. TRANSITIONAL HOME (kernel-API need): the
 * kernel journal's frozen entry types (types.ts) have no
 * `projection-pending` row, so the station keeps this sidecar until the
 * kernel opens one — audit TRUTH stays in the kernel journal; these rows
 * are the recovery worklist + write receipts. `flushedAt` is a mutable
 * worklist marker, not an append-only audit field.
 */
export type ProjectionJournalEntry =
  | { readonly type: 'projection-written'; readonly path: string; readonly hash: string; readonly at: number }
  | {
      readonly type: 'projection-pending';
      readonly path: string;
      readonly projectionHash: string;
      readonly reason: string;
      readonly recordedAt: number;
      flushedAt?: number;
    };

/* ── the stateful ingest station ──────────────────────────────────────── */

export interface ResyncStationOptions {
  /** the projection file adapter — enables §8 write-back + the watcher seam */
  readonly files?: ProjectionFileAdapter;
  /** watcher debounce window in ms (default 40) */
  readonly debounceMs?: number;
  /** the timer seam — inject for deterministic watcher tests */
  readonly scheduler?: { setTimeout(fn: () => void, ms: number): unknown; clearTimeout(handle: unknown): void };
}

/**
 * The stateful ingest station: one kernel, one shared admission gate, one
 * page ledger (recovered from the kernel's persisted truth on open, so a
 * reopened workspace keeps its letters and counter high-waters), plus the
 * §8 cycle — stale 409 → rebase → atomic write-back → watcher seam.
 *
 * CONVERGENCE TRACKING (M6 收敛轮, kernel gap ①): with a file adapter the
 * station records each page's convergence frontier (the version whose
 * projection the file verifiably holds — set after every successful
 * write-back or verified fixed point, NEVER after a failed/guarded one).
 * That frontier is the three-way base of the fresh lane's drift landing:
 * an external edit of an already-ingested page lands as journaled
 * `file-system` replaces while concurrent canonical movement survives.
 */
export class ResyncStation {
  readonly #kernel: CollabKernel;
  readonly #gate: AdmissionGate;
  #ledger: PageLedger;
  readonly #files: ProjectionFileAdapter | undefined;
  readonly #debounceMs: number;
  readonly #scheduler: { setTimeout(fn: () => void, ms: number): unknown; clearTimeout(handle: unknown): void };
  readonly #watch = new Map<string, { handle: unknown; run: Promise<void>; supersede: () => void }>();
  readonly #inflight = new Set<Promise<void>>();
  readonly #projectionJournal: ProjectionJournalEntry[] = [];
  readonly #lastOutcomes = new Map<string, IngestOutcome>();
  /** the frontier at station open — pages already ingested then default their drift base here */
  readonly #openFrontier: Frontier;
  /** page paths the journal already held at open (drift-base eligibility without a marker) */
  readonly #pagesAtOpen = new Set<string>();
  /** page path → the convergence point (files-adapter stations only) */
  readonly #converged = new Map<string, { readonly frontier: Frontier; readonly projectionHash: string }>();

  constructor(kernel: CollabKernel, gate: AdmissionGate = new AdmissionGate(kernel), options?: ResyncStationOptions) {
    this.#kernel = kernel;
    this.#gate = gate;
    this.#ledger = recoverLedger(kernel);
    this.#openFrontier = kernel.frontiers();
    for (const entry of treeItemsOf(kernel)) {
      if (entry.page !== undefined) this.#pagesAtOpen.add(entry.page.path);
    }
    this.#files = options?.files;
    this.#debounceMs = options?.debounceMs ?? 40;
    this.#scheduler = options?.scheduler ?? {
      setTimeout: (fn, ms) => setTimeout(fn, ms),
      clearTimeout: (handle) => clearTimeout(handle as Parameters<typeof clearTimeout>[0]),
    };
  }

  /** the current identity ledger (a defensive copy of the internal state) */
  get ledger(): PageLedger {
    return { pages: new Map(this.#ledger.pages), counters: new Map(this.#ledger.counters) };
  }

  /** the shared gate this station admits through (inject the server's) */
  get gate(): AdmissionGate {
    return this.#gate;
  }

  /** the projection file adapter, when the station was given one */
  get files(): ProjectionFileAdapter | undefined {
    return this.#files;
  }

  /**
   * Ingest one external source. The fresh-observed call (no options) can
   * never go stale — observe and the recheck share one synchronous
   * section; a pre-recorded `observed` state opens the §8 stale lane.
   * On 200 with a file adapter the canonical projection is written back
   * atomically — UNLESS the write-back guard fires (a deferred
   * scaffold change + file≠projection keeps the external bytes, surfaced
   * as `writeBackGuard`); the 409 lane NEVER touches the external file.
   */
  async ingestFile(path: string, source: string, options?: { observed?: ObservedState }): Promise<StationOutcome> {
    const outcome = await runIngest(this.#kernel, this.#gate, this.#ledger, path, source, options?.observed, this.#driftBaseOf(path));
    this.#lastOutcomes.set(path, outcome);
    if (outcome.status === 409) return outcome; // §8: keep the external file as-is
    this.#ledger = outcome.ledger;
    const { ledger: _ledger, ...report } = outcome;
    const writeBack = await this.#writeBack(path, report.deferred ?? []);
    if (writeBack === 'guarded') {
      return {
        ...report,
        writeBackGuard: {
          reason: 'the diff deferred a scaffold change and the file differs from the projection — the external scaffold bytes stay authoritative (M7 owns the migration); write-back skipped',
          deferred: report.deferred ?? [],
        },
      };
    }
    return report;
  }

  /**
   * §8 rebase: land a stale envelope's buffer-granularity diff against
   * canonical NOW (the external source is the only thing reused from the
   * envelope — frontier/hash/diff are all re-derived), then write back —
   * guarded the same way as the fresh lane when a scaffold change was
   * deferred (never a silent revert of the external bytes).
   */
  async rebase(stale: StaleIngest): Promise<IngestReport> {
    const result = await runRebase(this.#kernel, this.#gate, this.#ledger, stale);
    this.#ledger = result.ledger;
    this.#lastOutcomes.set(stale.path, result);
    const { ledger: _ledger, ...report } = result;
    const writeBack = await this.#writeBack(stale.path, report.deferred ?? []);
    if (writeBack === 'guarded') {
      return {
        ...report,
        writeBackGuard: {
          reason: 'the diff deferred a scaffold change and the file differs from the projection — the external scaffold bytes stay authoritative (M7 owns the migration); write-back skipped',
          deferred: report.deferred ?? [],
        },
      };
    }
    return report;
  }

  /**
   * The cross-era reconcile cycle (M7 收官轮, the explicit opt-in lane):
   * ONE §8 run over a KNOWN page's current file that, beyond the fresh
   * lane's drift landing, REALIGNS the stored tree meta to the current
   * plan through admitted tree `update` ops — so a `.jx-collab` journal
   * written by an older protocol generation (the M3-era planner skipped
   * brace-literal prop buffers: the container exists, the tree meta
   * never references it, `/usage` underreports and the panel degrades
   * to "edit in code") converges to what the current station would have
   * produced. The standard write-back law applies after the landing
   * (fixed point untouched; removed-component deferrals still guard).
   */
  async reconcileFile(path: string, source: string): Promise<StationOutcome> {
    const outcome = await runIngest(this.#kernel, this.#gate, this.#ledger, path, source, undefined, this.#driftBaseOf(path), true);
    this.#lastOutcomes.set(path, outcome);
    if (outcome.status === 409) return outcome; // fresh observe cannot go stale — defensive parity with ingestFile
    this.#ledger = outcome.ledger;
    const { ledger: _ledger, ...report } = outcome;
    const writeBack = await this.#writeBack(path, report.deferred ?? []);
    if (writeBack === 'guarded') {
      return {
        ...report,
        writeBackGuard: {
          reason: 'the reconcile deferred a structural removal and the file differs from the projection — the external bytes stay authoritative; write-back skipped',
          deferred: report.deferred ?? [],
        },
      };
    }
    return report;
  }

  /**
   * THE OUT-OF-BAND CONVERGE (M7 收官轮, the host's root fix): canonical
   * advanced WITHOUT a file event (a panel/agent op through admission)
   * while the file verifiably holds a PRIOR projection — push the
   * CURRENT projection atomically. `heldHash` is the caller's verified
   * evidence (the echo expectation or the convergence marker); the push
   * re-reads and re-checks it inside, so a file that moved on past those
   * bytes answers 'moved' and keeps them (the no-clobber precondition —
   * a genuine external edit never gets overwritten by this lane).
   */
  async pushCurrentProjection(path: string, heldHash: string): Promise<'idempotent' | 'written' | 'pending' | 'moved' | 'untracked'> {
    const files = this.#files;
    if (files === undefined) return 'untracked';
    let projection: string;
    try {
      projection = projectSource(this.#kernel, path).source;
    } catch {
      return 'untracked'; // never-ingested page — nothing to push
    }
    const projectionHash = sha256(projection);
    let file: string;
    try {
      file = files.read(path);
    } catch {
      return 'moved'; // absent/unreadable — the adoption lane owns creation
    }
    if (sha256(file) !== heldHash) return 'moved'; // raced past the verified bytes
    if (projectionHash === heldHash) {
      this.#recordConverged(path, projectionHash); // verifiably at the fixed point
      return 'idempotent';
    }
    try {
      files.writeAtomic(path, projection, projectionHash);
      this.#projectionJournal.push({ type: 'projection-written', path, hash: projectionHash, at: Date.now() });
      this.#recordConverged(path, projectionHash);
      return 'written';
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.#projectionJournal.push({ type: 'projection-pending', path, projectionHash, reason, recordedAt: Date.now() });
      return 'pending';
    }
  }

  /**
   * The fresh lane's three-way base for one path: the convergence marker
   * when tracked, else (journal-replayed pages) the station-open
   * frontier, else undefined — files-less/stateless stations never land
   * drift on the fresh lane (their drift engine is the rebase lane).
   */
  #driftBaseOf(path: string): ConvergenceBase | undefined {
    if (this.#files === undefined) return undefined;
    const marker = this.#converged.get(path);
    if (marker !== undefined) return { frontier: marker.frontier };
    if (this.#pagesAtOpen.has(path)) return { frontier: this.#openFrontier };
    return undefined;
  }

  /** the file verifiably holds the current projection — record the convergence point */
  #recordConverged(path: string, projectionHash: string): void {
    if (this.#files === undefined) return;
    this.#converged.set(path, { frontier: this.#kernel.frontiers(), projectionHash });
  }

  /**
   * The page's convergence point, when tracked: the canonical frontier
   * and the projection hash the file verifiably held there. Host-side
   * echo-skip evidence (an event carrying exactly those bytes carries no
   * drift — the idempotent skip happens before any station work).
   */
  fileConvergence(path: string): { readonly frontier: Frontier; readonly projectionHash: string } | undefined {
    const marker = this.#converged.get(path);
    return marker === undefined ? undefined : { ...marker };
  }

  /** the most recent ingest outcome per path (the watcher's observable) */
  lastOutcome(path: string): IngestOutcome | undefined {
    return this.#lastOutcomes.get(path);
  }

  /** the projection write-back journal (receipts + the pending worklist) */
  projectionJournal(): readonly ProjectionJournalEntry[] {
    return [...this.#projectionJournal];
  }

  /**
   * §8 watcher seam — API ONLY, no server wiring (that is M6, when the
   * kernel is server-hosted). Debounce semantics: every event for a path
   * (re)arms one timer; the file is read AT FIRE TIME so the latest
   * content wins, bursts collapse into one ingest, and the §8 observed
   * state is recorded at that same read. An fs.watch layer may pre-
   * debounce upstream — this window only guarantees per-station
   * coalescing, never cross-process exclusivity.
   */
  onFileChange(path: string): void {
    if (this.#files === undefined) {
      throw new TypeError(`${RESYNC_ERROR_PREFIX} onFileChange requires the projection file adapter (ResyncStationOptions.files) — server wiring belongs to M6`);
    }
    const pending = this.#watch.get(path);
    if (pending !== undefined) {
      this.#scheduler.clearTimeout(pending.handle);
      pending.supersede(); // the cancelled arm's run settles WITHOUT an ingest — the new arm owns the cycle
    }
    let fire: () => void = () => {};
    let supersede: () => void = () => {};
    const run = new Promise<void>((resolve, reject) => {
      supersede = () => resolve();
      fire = () => {
        this.#fireIngest(path).then(() => resolve(), reject);
      };
    });
    run.catch(() => undefined); // fire-and-forget callers never leak an unhandled rejection; flush() still sees it
    this.#inflight.add(run);
    run.then(
      () => this.#inflight.delete(run),
      () => this.#inflight.delete(run),
    );
    const handle = this.#scheduler.setTimeout(() => {
      this.#watch.delete(path);
      fire();
    }, this.#debounceMs);
    this.#watch.set(path, { handle, run, supersede });
  }

  /** await every scheduled AND in-flight watcher run (the deterministic test seam) */
  async flush(): Promise<void> {
    const runs = [...this.#watch.values()].map((pending) => pending.run);
    await Promise.all([...runs, ...this.#inflight]);
  }

  async #fireIngest(path: string): Promise<void> {
    const files = this.#files!;
    const source = files.read(path); // latest content at fire time (debounce semantics)
    const observed = observeState(this.#kernel, path, source); // §8: observed recorded at read time
    await this.ingestFile(path, source, { observed });
  }

  /**
   * §8 write-back: only after canonical commit + journal/WAL receipts (the
   * caller awaits admits first). Fixed-point files are left untouched;
   * THE GUARD (M6 收敛轮): a deferred scaffold change with file≠projection
   * SKIPS the write and answers 'guarded' — the external scaffold bytes
   * are authoritative (frozen note until the panel's M7 migration), the
   * revert is never silent and the deferred details ride the outcome; a
   * failure records `projection-pending` — no rollback, no other write.
   */
  async #writeBack(path: string, deferred: readonly ExternalDiffEntry[]): Promise<'written' | 'skipped' | 'pending' | 'guarded'> {
    const files = this.#files;
    if (files === undefined) return 'skipped';
    let projection: string;
    try {
      projection = projectSource(this.#kernel, path).source;
    } catch {
      return 'skipped'; // never-ingested page (a failed ingest) — nothing to write
    }
    const expectedHash = sha256(projection);
    let file: string | undefined;
    try {
      file = files.read(path);
    } catch {
      // unreadable/absent target — the adoption case proceeds to write
    }
    if (file === projection) {
      this.#recordConverged(path, expectedHash); // verifiably at the fixed point
      return 'skipped';
    }
    if (deferred.some((entry) => entry.kind === 'scaffold-change') && file !== undefined) {
      return 'guarded'; // external scaffold bytes win — never silently overwrite
    }
    try {
      files.writeAtomic(path, projection, expectedHash);
      this.#projectionJournal.push({ type: 'projection-written', path, hash: expectedHash, at: Date.now() });
      this.#recordConverged(path, expectedHash);
      return 'written';
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.#projectionJournal.push({ type: 'projection-pending', path, projectionHash: expectedHash, reason, recordedAt: Date.now() });
      return 'pending';
    }
  }

  /** retry every pending projection write against CURRENT canonical (§8 recovery) */
  async flushPendingProjections(): Promise<number> {
    const files = this.#files;
    if (files === undefined) return 0;
    let flushed = 0;
    for (const entry of this.#projectionJournal) {
      if (entry.type !== 'projection-pending' || entry.flushedAt !== undefined) continue;
      let projection: string;
      try {
        projection = projectSource(this.#kernel, entry.path).source;
      } catch {
        continue; // the page vanished — stays pending for the operator
      }
      try {
        files.writeAtomic(entry.path, projection, sha256(projection));
        entry.flushedAt = Date.now(); // worklist marker — audit truth stays in the kernel journal
        this.#recordConverged(entry.path, sha256(projection)); // the file holds the projection again
        flushed += 1;
      } catch {
        // still failing — remains pending
      }
    }
    return flushed;
  }
}

/* ── stable deep compare for scaffold-stale detection ─────────────────── */

/** key-sorted canonical JSON — order-insensitive deep equality */
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
