/**
 * @jixoai/ui-design (collab/runtime) — the transaction compile gate
 * (collab-protocol M6; protocol-spec §7 事务内编译门禁): after a group's
 * ops are applied to the candidate fork (and before any commit), the
 * AFFECTED pages' projections must survive the real `svelte/compiler`
 * plus a registry schema check. Semantic errors and conflicts ride the
 * same return→re-reason loop as §5 adjudications (the receipt is the
 * `422 compile-failed` transaction lane).
 *
 * P18 semantics, productized: the lab compiled hand-made source
 * strings; this gate projects the candidate's OWN state — the page
 * scaffold (chunks + holes, from the page tree item) re-serialized
 * with the candidate's buffer texts through the serialization
 * authorities (`serializeHole` re-exported by bridge.ts — the §3
 * frozen law, never forked). Components on tree-less buffers (test
 * scaffolding, direct kernel workspaces) have no page and therefore
 * nothing to compile — the gate passes them with a note.
 *
 * The registry schema check (v0.2 minimal): every touched component's
 * tree `item` payload must remain a structurally valid page/component
 * descriptor (kind/path/id/tag fields present and stringly) — tree
 * ops that mangle payloads fail the gate, not the compile.
 *
 * Contract with kernel.ts: failures throw `CompileGateError` — the
 * kernel recognizes the class STRUCTURALLY by `error.name` (the
 * cycle-free boundary; see kernel's `transactionErrorOf`).
 *
 * Original need: collab-protocol M6 (2026-09-15).
 */

import { LoroDoc } from 'loro-crdt';
import { compile } from 'svelte/compiler';

import { serializeHole, type HoleSerializer } from '../bridge.ts';
import { bufferKeyOf, encodeContainerKey, TREE_CONTAINER } from '../kernel.ts';

/* ── the typed failure ─────────────────────────────────────────────────── */

export const COMPILE_GATE_ERROR_PREFIX = '[jixoai-collab-compile-gate]';

export class CompileGateError extends Error {
  /** which check failed — svelte compile vs the registry schema */
  readonly stage: 'svelte-compile' | 'registry-schema';
  /** the page (or component) the failure belongs to */
  readonly subject: string;
  constructor(stage: 'svelte-compile' | 'registry-schema', subject: string, message: string) {
    super(`${COMPILE_GATE_ERROR_PREFIX} ${message}`);
    this.name = 'CompileGateError';
    this.stage = stage;
    this.subject = subject;
  }
}

/* ── the candidate-side page projection (bridge law, candidate doc) ────── */

interface HoleShape {
  readonly componentId: string;
  readonly buffer: string;
  readonly how: HoleSerializer;
}

interface PageShape {
  readonly kind: 'page';
  readonly path: string;
  readonly chunks: readonly string[];
  readonly holes: readonly HoleShape[];
}

/** structural read of one tree node's item payload (defensive — the tree is ours) */
function readItem(node: { data: { get(key: string): unknown } }): unknown {
  return node.data.get('item');
}

function isPageItem(value: unknown): value is PageShape {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as { kind?: unknown; path?: unknown; chunks?: unknown; holes?: unknown };
  if (item.kind !== 'page' || typeof item.path !== 'string') return false;
  if (!Array.isArray(item.chunks) || item.chunks.some((chunk) => typeof chunk !== 'string')) return false;
  if (!Array.isArray(item.holes)) return false;
  return item.holes.every(
    (hole) =>
      typeof hole === 'object' &&
      hole !== null &&
      typeof (hole as { componentId?: unknown }).componentId === 'string' &&
      typeof (hole as { buffer?: unknown }).buffer === 'string' &&
      ['template-text', 'prop-quoted', 'verbatim'].includes(String((hole as { how?: unknown }).how)),
  );
}

function isComponentItem(value: unknown): value is { kind: 'component'; id: string; tag: string; path: string } {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as { kind?: unknown; id?: unknown; tag?: unknown; path?: unknown };
  return item.kind === 'component' && typeof item.id === 'string' && typeof item.tag === 'string' && typeof item.path === 'string';
}

/**
 * Project one page's source off an ARBITRARY doc (the candidate fork)
 * using the bridge's frozen serialization law. `undefined` when the
 * path holds no page item (never ingested / tree-less workspace).
 */
export function projectPageFromDoc(doc: LoroDoc, path: string): string | undefined {
  let page: PageShape | undefined;
  for (const node of doc.getTree(TREE_CONTAINER).nodes()) {
    const item = readItem(node);
    if (isPageItem(item) && item.path === path && page === undefined) page = item;
  }
  if (page === undefined) return undefined;
  let source = page.chunks[0] ?? '';
  for (let i = 0; i < page.holes.length; i += 1) {
    const hole = page.holes[i]!;
    const containerKey = encodeContainerKey(hole.componentId, bufferKeyOf(hole.buffer));
    source += serializeHole(hole.how, doc.getText(containerKey).toString());
    source += page.chunks[i + 1] ?? '';
  }
  return source;
}

/* ── the gate ──────────────────────────────────────────────────────────── */

export interface CompileGateResult {
  /** pages actually compiled (path → projected length) */
  readonly compiledPages: readonly { readonly path: string; readonly length: number }[];
  /** components with no owning page — nothing to compile (noted, never silent) */
  readonly pagelessComponents: readonly string[];
}

/**
 * The transaction compile gate (§7): throw {@link CompileGateError} to
 * reject. Checks, in order:
 *   1. REGISTRY SCHEMA — every touched component that HAS a tree node
 *      must still carry a structurally valid item payload;
 *   2. SVELTE COMPILE — every touched component's owning page is
 *      projected OFF THE CANDIDATE and pushed through the real
 *      `svelte/compiler` (`generate: 'client'`, exactly the p18 shape).
 */
export function transactionCompileGate(candidate: LoroDoc, touched: ReadonlySet<string>): CompileGateResult {
  // componentId → owning page path, off the candidate's own tree
  const componentPaths = new Map<string, string>();
  for (const node of candidate.getTree(TREE_CONTAINER).nodes()) {
    const item = readItem(node);
    if (isComponentItem(item)) componentPaths.set(item.id, item.path);
  }

  // 1. registry schema: touched components with tree nodes must keep valid payloads
  for (const componentId of touched) {
    const node = candidate.getTree(TREE_CONTAINER).nodes().find((candidateNode) => {
      const item = readItem(candidateNode);
      return isComponentItem(item) && item.id === componentId;
    });
    if (node === undefined) continue; // tree-less target (kernel-level buffer work) — nothing to schema-check
    const item = readItem(node);
    if (!isComponentItem(item) && !isPageItem(item)) {
      throw new CompileGateError('registry-schema', componentId, `component ${componentId}'s tree item is neither a page nor a component descriptor (got ${JSON.stringify(item)?.slice(0, 120)})`);
    }
  }

  // 2. svelte compile: every affected page, projected off the candidate
  const pagePaths = new Set<string>();
  const pageless: string[] = [];
  for (const componentId of touched) {
    const path = componentPaths.get(componentId);
    if (path === undefined) {
      // a page ITSELF (the tree item is the page) or tree-less scaffolding
      let isPage = false;
      for (const node of candidate.getTree(TREE_CONTAINER).nodes()) {
        const item = readItem(node);
        if (isPageItem(item) && item.path === componentId) isPage = true;
      }
      if (isPage) pagePaths.add(componentId);
      else pageless.push(componentId);
      continue;
    }
    pagePaths.add(path);
  }
  const compiledPages: { path: string; length: number }[] = [];
  for (const path of pagePaths) {
    const source = projectPageFromDoc(candidate, path);
    if (source === undefined) continue; // no page item — nothing to compile
    try {
      compile(source, { generate: 'client' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new CompileGateError('svelte-compile', path, `page ${path} failed the Svelte compile gate on the transaction candidate: ${message}`);
    }
    compiledPages.push({ path, length: source.length });
  }
  return { compiledPages, pagelessComponents: pageless };
}
