/**
 * @jixoai/ui-design (collab) — the projection bridge: Loro buffer state →
 * `.svelte` source text (collab-protocol M3; protocol-spec §1 「投影（序列化
 * 桥）」/ §3 「序列化桥沿用 transform.ts/prop-edit.ts 的既有机器」).
 *
 * The bridge is a PURE READ over the kernel's movement state: it never
 * admits ops and never touches the filesystem. The ingest station
 * (`resync.ts`) is the write side; this module re-serializes what landed.
 *
 * Serialization authority (reused, never forked — §3's frozen law):
 *   - slot/page text holes serialize through `serializeTemplateText`
 *     (`prop-edit.ts`): escape in order `&` `<` `>` `{` `}` so an edited
 *     value can never re-open an entity, a tag, an expression or a comment
 *     boundary (p7 probe; quotes stay literal, newlines stay raw).
 *   - quoted-string prop holes serialize through `renderValue(text).slice(1, -1)`
 *     — `prop-edit.ts`'s quotedText law (JSON string escaping minus the
 *     outer quotes; entities are NOT re-escaped for props). `renderValue`
 *     was additively exported for exactly this consumption.
 *   - `script` / `style` holes are verbatim (raw JS/CSS).
 *   - literal-expression prop holes (`{true}`/`{42}`/`{'ghost'}`) serialize
 *     VERBATIM inside the braces — §3's frozen law 「非字符串 props
 *     （bool/enum/number）按其文本序列化值处理，同词表」. FROZEN ROUND-TRIP
 *     NOTE (M6 收敛轮, 2026-09-15): the buffer text IS the raw expression
 *     bytes between the braces, so the original quote style and brace form
 *     survive byte-exactly (`raised={true}` ↔ buffer `true`,
 *     `name={'ghost'}` ↔ buffer `'ghost'`). No escaping is applied — an
 *     expression literal cannot be escaped without changing its value;
 *     syntax validity is the compile gate's lane (§7), never the
 *     serializer's.
 *   - span semantics — half-open UTF-16 `[start, end)`, raw-ASCII-
 *     whitespace trim, decoded `text` vs raw — are collected at INGEST by
 *     `collectTextSpans` (`stamp/transform.ts`) and live in the page
 *     item's chunk/hole scaffold; projection only re-serializes current
 *     buffer state into those holes.
 *
 * Projection canonicalizes entity spellings by construction (p7's
 * conclusion): a buffer holding `&` projects as `&amp;`, and a source raw
 * `&#x20;` (decodes to a space) projects as a plain space on the next
 * projection — canonical escape forms are a fixed point, exotic ones
 * normalize. Formatting noise is visible in the diff, never silently
 * normalized inside the CRDT (§8).
 *
 * The page/component descriptors ride the LoroTree as node payloads
 * (write-once at the ingest tree insert — the M2 op vocabulary has no
 * tree-data update; a changed-scaffold re-ingest is surfaced as
 * `scaffoldStale` by `resync.ts` and fully owned by M5's rebase).
 * Nested usages (B5) are first-class: their buffers are holes in the
 * same document-ordered scaffold, and `treeParentageOf` reads back the
 * component→component nesting the ingest inserts carry.
 *
 * Original need: collab-protocol M3 (2026-09-15); B5 nesting M5b.
 */

import { LoroDoc } from 'loro-crdt';

import { renderValue, serializeTemplateText } from '../prop-edit.ts';
import { bufferKeyOf, encodeContainerKey, TREE_CONTAINER, type CollabKernel } from './kernel.ts';

/* ── typed errors (projection-side failures) ──────────────────────────── */

export const BRIDGE_ERROR_PREFIX = '[jixoai-collab-bridge]';

export type BridgeErrorCode =
  | 'unknown-page' // no page tree item holds the path — ingest first
  | 'corrupt-item' // a stored tree item violates the frozen scaffold shape
  | 'bad-anchor'; // a stable cursor cannot be encoded at the requested spot

export class BridgeError extends Error {
  readonly code: BridgeErrorCode;
  constructor(code: BridgeErrorCode, message: string) {
    super(`${BRIDGE_ERROR_PREFIX} ${message}`);
    this.name = 'BridgeError';
    this.code = code;
  }
}

/* ── the tree-item vocabulary (written by resync.ts at ingest) ─────────── */

/** how one hole's buffer text serializes back into source */
export type HoleSerializer =
  | 'template-text' // slot/page text — serializeTemplateText law
  | 'prop-quoted' // quoted-string prop value — renderValue(...).slice(1, -1) law
  | 'prop-expr' // literal-expression prop ({true}/{42}/{'ghost'}) — raw bytes inside the braces (§3)
  | 'verbatim'; // script/style — raw bytes, no template escaping

/** one projected buffer slot inside the page scaffold */
export interface HoleRecord {
  /** the component (or the page itself) owning the buffer */
  readonly componentId: string;
  /** the buffer name (`t-<n>` slots, `p-<prop>` values, `script`, `style`) */
  readonly buffer: string;
  readonly how: HoleSerializer;
}

/** a non-buffer this ingest skipped (expressions, directives, …) */
export interface SkippedProp {
  readonly name: string;
  readonly why: string;
}

/**
 * The page's projection scaffold: `chunks.length === holes.length + 1` and
 * `source = chunks[0] + Σ(hole → serialized buffer text + chunks[i+1])`.
 * Spans were captured against the id-injected source at ingest, in
 * document order, half-open, trim law included — the chunk bytes ARE the
 * peripheral whitespace the trim law preserves.
 */
export interface PageTreeItem {
  readonly kind: 'page';
  readonly path: string;
  /** the page letter (identity §2) — the ledger-recovery hook */
  readonly letter: string;
  readonly chunks: readonly string[];
  readonly holes: readonly HoleRecord[];
  /** page-level skips (module script, …) — merged into projection reports */
  readonly skipped: readonly SkippedProp[];
}

/**
 * One adopted component's descriptor (self-describing identity + skips).
 * `parentId` (B5) names the ENCLOSING component's id — nested usages
 * parent onto their host component's tree node, not the page root;
 * absent = a top-level usage parented on the page node. Write-once at
 * the ingest tree insert; pre-B5 payloads legitimately lack it.
 */
export interface ComponentTreeItem {
  readonly kind: 'component';
  readonly id: string;
  readonly tag: string;
  readonly path: string;
  readonly parentId?: string;
  readonly skipped: readonly SkippedProp[];
}

/* ── structural loro shapes (the one controlled cast boundary) ─────────── */

interface TreeDataLike {
  get(key: string): unknown;
}
interface TreeNodeLike {
  readonly id: unknown;
  readonly data: TreeDataLike;
  parent(): TreeNodeLike | undefined;
  isDeleted(): boolean;
}

/**
 * The client-side read view: one consistent snapshot of the movement
 * state, exactly the admission tests' client-mirror pattern
 * (`LoroDoc.fromSnapshot(kernel.snapshotBytes())`). Reading through a
 * snapshot (never through kernel privates) keeps tree payloads, buffer
 * texts and cursor anchors on one frozen version.
 */
function snapshotDocOf(kernel: CollabKernel): LoroDoc {
  return LoroDoc.fromSnapshot(kernel.snapshotBytes());
}

function treeNodesOf(doc: LoroDoc): readonly TreeNodeLike[] {
  return (doc.getTree(TREE_CONTAINER) as unknown as { nodes(): readonly TreeNodeLike[] }).nodes();
}

/* ── item validation (the tree is written by us, read defensively) ─────── */

function isHoleRecord(value: unknown): value is HoleRecord {
  if (typeof value !== 'object' || value === null) return false;
  const hole = value as { componentId?: unknown; buffer?: unknown; how?: unknown };
  return (
    typeof hole.componentId === 'string' &&
    typeof hole.buffer === 'string' &&
    (hole.how === 'template-text' || hole.how === 'prop-quoted' || hole.how === 'prop-expr' || hole.how === 'verbatim')
  );
}

function isSkippedProp(value: unknown): value is SkippedProp {
  if (typeof value !== 'object' || value === null) return false;
  const skip = value as { name?: unknown; why?: unknown };
  return typeof skip.name === 'string' && typeof skip.why === 'string';
}

function isPageItem(value: unknown): value is PageTreeItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as { kind?: unknown; path?: unknown; letter?: unknown; chunks?: unknown; holes?: unknown; skipped?: unknown };
  if (item.kind !== 'page' || typeof item.path !== 'string' || typeof item.letter !== 'string') return false;
  if (!Array.isArray(item.chunks) || item.chunks.some((chunk) => typeof chunk !== 'string')) return false;
  if (!Array.isArray(item.holes) || item.holes.some((hole) => !isHoleRecord(hole))) return false;
  if (item.chunks.length !== item.holes.length + 1) return false;
  if (item.skipped !== undefined && (!Array.isArray(item.skipped) || item.skipped.some((skip) => !isSkippedProp(skip)))) return false;
  return true;
}

function isComponentItem(value: unknown): value is ComponentTreeItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as { kind?: unknown; id?: unknown; tag?: unknown; path?: unknown; parentId?: unknown; skipped?: unknown };
  if (item.kind !== 'component' || typeof item.id !== 'string' || typeof item.tag !== 'string' || typeof item.path !== 'string') {
    return false;
  }
  if (item.parentId !== undefined && typeof item.parentId !== 'string') return false;
  if (item.skipped !== undefined && (!Array.isArray(item.skipped) || item.skipped.some((skip) => !isSkippedProp(skip)))) return false;
  return true;
}

/* ── the tree-item read surface (bridge + ledger recovery) ─────────────── */

export interface TreeItemEntry {
  readonly page?: PageTreeItem;
  readonly component?: ComponentTreeItem;
  /** the node is a tombstone (§6) — payloads survive deletion by design */
  readonly deleted: boolean;
}

/**
 * Read every tree node's `item` payload (the design-冻结 journal-only
 * mapping pairs these with TreeIDs for admission; the payloads
 * self-describe componentId, so the bridge reads them directly). Deleted
 * nodes are included — tombstoned components still feed the identity
 * high-water during ledger recovery.
 */
export function treeItemsOf(kernel: CollabKernel): readonly TreeItemEntry[] {
  const entries: TreeItemEntry[] = [];
  for (const node of treeNodesOf(snapshotDocOf(kernel))) {
    const item = node.data.get('item');
    entries.push({
      page: isPageItem(item) ? item : undefined,
      component: isComponentItem(item) ? item : undefined,
      deleted: node.isDeleted(),
    });
  }
  return entries;
}

/**
 * The B5 nesting read: componentId → its tree parent's componentId (a
 * page node reports its own `path`, the forest root reports nothing).
 * The ingest station's nested tree inserts (`parentComponentId`) are
 * verified here — `<Outer><Mid/></Outer>` must show Mid under Outer's
 * node, not the page root. Tombstoned nodes keep their parentage.
 */
export function treeParentageOf(kernel: CollabKernel): ReadonlyMap<string, string> {
  const parentage = new Map<string, string>();
  for (const node of treeNodesOf(snapshotDocOf(kernel))) {
    const item = node.data.get('item');
    let key: string | undefined;
    if (isPageItem(item)) key = item.path;
    else if (isComponentItem(item)) key = item.id;
    if (key === undefined) continue;
    const parent = node.parent();
    const parentItem = parent?.data.get('item');
    const parentKey = parentItem !== undefined && isComponentItem(parentItem) ? parentItem.id : parentItem !== undefined && isPageItem(parentItem) ? parentItem.path : undefined;
    if (parentKey !== undefined) parentage.set(key, parentKey);
  }
  return parentage;
}

/* ── the serializer switch (the §3 authority dispatch) ─────────────────── */

/**
 * Serialize one hole's buffer text into source form. `template-text`
 * escapes `& < > { }` in order; `prop-quoted` applies the JSON law inside
 * the quotes (no entity escaping for props); `prop-expr` passes the raw
 * expression bytes through (the §3 non-string-props law — quote style and
 * brace form are the buffer's own bytes); `verbatim` passes through.
 */
export function serializeHole(how: HoleSerializer, text: string): string {
  if (how === 'template-text') return serializeTemplateText(text);
  if (how === 'prop-quoted') return renderValue(text).slice(1, -1);
  return text; // prop-expr / verbatim — raw bytes by their own laws
}

/* ── projection ───────────────────────────────────────────────────────── */

/** one projected buffer, as the report lists it */
export interface ProjectedBuffer {
  readonly componentId: string;
  readonly buffer: string;
  readonly containerKey: string;
  readonly how: HoleSerializer;
  /** current buffer length (UTF-16 units) */
  readonly length: number;
}

export interface ProjectionReport {
  readonly path: string;
  /** the page's own componentId (the tree-node key resync inserted) */
  readonly pageComponentId: string;
  readonly buffers: readonly ProjectedBuffer[];
  /** every non-buffer skip recorded at ingest (expressions, directives, …) */
  readonly skipped: readonly { readonly componentId: string; readonly name: string; readonly why: string }[];
}

export interface ProjectionResult {
  readonly source: string;
  readonly report: ProjectionReport;
}

/**
 * Project one page's current Loro buffer state into its `.svelte` source
 * text (§1 投影). Pure read: chunks from the page item, serialized buffer
 * texts in the holes, one consistent snapshot underneath. The result is
 * byte-exact against the ingested source whenever the source's raws were
 * in canonical escape form (see the module header for the entity
 * canonicalization note).
 *
 * @throws BridgeError `unknown-page` when the path has never been ingested.
 */
export function projectSource(kernel: CollabKernel, path: string): ProjectionResult {
  const doc = snapshotDocOf(kernel);
  let page: PageTreeItem | undefined;
  const components: ComponentTreeItem[] = [];
  for (const node of treeNodesOf(doc)) {
    const item = node.data.get('item');
    if (isPageItem(item) && item.path === path && page === undefined) page = item;
    if (isComponentItem(item) && item.path === path) components.push(item);
  }
  if (page === undefined) {
    throw new BridgeError('unknown-page', `no page tree item holds path ${JSON.stringify(path)} — ingest it first (resync ingestFile)`);
  }

  let source = page.chunks[0] ?? '';
  const buffers: ProjectedBuffer[] = [];
  for (let i = 0; i < page.holes.length; i += 1) {
    const hole = page.holes[i]!;
    const containerKey = encodeContainerKey(hole.componentId, bufferKeyOf(hole.buffer));
    const text = doc.getText(containerKey).toString();
    source += serializeHole(hole.how, text);
    source += page.chunks[i + 1] ?? '';
    buffers.push({ componentId: hole.componentId, buffer: hole.buffer, containerKey, how: hole.how, length: text.length });
  }

  const skipped = [
    ...page.skipped.map((skip) => ({ componentId: path, name: skip.name, why: skip.why })),
    ...components.flatMap((component) => component.skipped.map((skip) => ({ componentId: component.id, name: skip.name, why: skip.why }))),
  ];
  return { source, report: { path, pageComponentId: path, buffers, skipped } };
}

/* ── the client-side anchor encoder (panel/mirror/test seam) ───────────── */

/**
 * Encode a stable cursor (§4 cursorBytes) for one buffer position against
 * the kernel's current state — the client-mirror anchor the panel and the
 * round-trip tests submit text ops with. Works on empty containers (the
 * first-insert anchor of an ingest): a cursor at the container start is
 * locatable even with zero content.
 */
export function bufferAnchor(kernel: CollabKernel, componentId: string, buffer: string, offset: number): Uint8Array {
  const containerKey = encodeContainerKey(componentId, bufferKeyOf(buffer));
  const cursor = snapshotDocOf(kernel).getText(containerKey).getCursor(offset, 0);
  if (cursor === undefined) {
    throw new BridgeError('bad-anchor', `cannot encode a stable cursor at UTF-16 offset ${offset} of ${containerKey}`);
  }
  return cursor.encode();
}
