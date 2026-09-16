/**
 * @jixoai/ui-design (collab) — the panel's prop materializer
 * (design-studio-acceptance-fixes §3, 2026-09-16): the COMPOSITE lane
 * that turns a not-yet-editable prop — a bare boolean (`disabled`) or an
 * absent prop the schema knows — into an addressable buffer, ATOMICALLY.
 *
 * Why a server-side composite: the re-toast (parseSvelte + planPage)
 * only exists server-side, and two independent admits have an illegal
 * intermediate state (tree update first → the projection renders
 * ` disabled={}` which does not compile, and there is no gate window).
 * Atomicity rides `kernel.commitTransaction({strategy:'rollback'})`:
 *
 *   ① tree update — the re-toasted page scaffold (chunks + holes) plus
 *      every component descriptor whose skip list changed;
 *   ② text insert — the NEW hole's buffer content on a lazily created
 *      container (`fork.getText(key)` builds it; expectedBefore `''`).
 *
 * NO `text create` op is used — TransactionOp has no create; a create
 * inside a transaction envelope is re-routed by admission to its own
 * single-op commit (non-atomic; research finding). The rollback
 * strategy discards the whole candidate on ANY failure — the §7 Svelte
 * compile gate (runtime/compile-gate.ts, `prop-expr` whitelist fixed in
 * this same change) runs on the candidate BEFORE the one import.
 *
 * The whole orchestration is assembled and committed inside ONE
 * `gate.runExclusive` section (synchronous body — the §7 fence), so no
 * admission can interleave between the projection read and the commit.
 * Idempotency is NOT the kernel's here (commitTransaction has none):
 * the endpoint replays through `kernel.receiptFor(opId)` — the tree
 * update op carries the REQUEST's opId, so its receipt (or the recorded
 * rejection, §5.0 single-headed) answers the retry.
 *
 * Pure transform law (materializePropText):
 *   - bare bool  → insert `={<bool>}` right after the attribute's end
 *     (how `prop-expr`, buffer text `true`/`false`);
 *   - absent     → insert ` <prop>=<literal>` after the component's
 *     LAST attribute's end (string → quoted via renderValue — the §3
 *     law; bool/number → braced literal);
 *   - anything else (already quoted/braced, an expression, a directive,
 *     the `id` anchor) is a typed 409 — the panel keeps it readonly.
 *
 * Original need: design-studio-acceptance-fixes §3 (2026-09-16).
 */

import { parse as parseSvelte } from 'svelte/compiler';

import { renderValue, type EditValue } from '../prop-edit.ts';
import { projectSource, treeItemsOf, type HoleSerializer } from './bridge.ts';
import type { AdmissionGate } from './admission.ts';
import type { CollabKernel, TransactionOp, TransactionReceipts } from './kernel.ts';
import { planPage, treeUpdateEnvelope } from './resync.ts';
import { transactionCompileGate } from './runtime/compile-gate.ts';
import type { SyncCursor } from './types.ts';

/* ── typed errors ─────────────────────────────────────────────────────── */

export const MATERIALIZE_ERROR_PREFIX = '[jixoai-collab-materialize]';

export type MaterializeErrorCode =
  | 'unknown-page' // 404 — the page was never ingested (no scaffold to re-toast)
  | 'component-not-found' // 404 — no usage carries the component id
  | 'prop-not-materializable'; // 409 — already a buffer / an expression / a directive / the id anchor / out of charset

export class MaterializeError extends Error {
  readonly code: MaterializeErrorCode;
  readonly status: 404 | 409;
  constructor(code: MaterializeErrorCode, status: 404 | 409, message: string) {
    super(`${MATERIALIZE_ERROR_PREFIX} ${message}`);
    this.name = 'MaterializeError';
    this.code = code;
    this.status = status;
  }
}

/* ── the pure transform ───────────────────────────────────────────────── */

/** one hole the transform minted (the future buffer's seeding facts) */
export interface MaterializedHole {
  readonly buffer: string;
  readonly how: HoleSerializer;
  readonly text: string;
}

export interface MaterializedSource {
  readonly source: string;
  readonly holes: readonly MaterializedHole[];
}

/* the Svelte AST shapes this transform consumes (structural; offsets are
 * the parser's own UTF-16 spans — the same contract planPage's spans ride) */
interface AttributeLike {
  readonly type: string;
  readonly name?: string;
  readonly start: number;
  readonly end: number;
  readonly value?: true | readonly { readonly type: string }[] | { readonly type: string };
}
interface PartLike {
  readonly type: string;
  readonly data?: string;
}
interface ComponentLike {
  readonly type: string; // InlineComponent (legacy AST) | Component (modern)
  readonly name: string;
  readonly attributes?: readonly AttributeLike[];
  readonly children?: readonly unknown[];
}
interface FragmentAst {
  readonly html?: { readonly children?: readonly unknown[] };
}

function isComponentNode(node: unknown): node is ComponentLike {
  if (node === null || typeof node !== 'object') return false;
  const { type, name } = node as { type?: unknown; name?: unknown };
  return (type === 'InlineComponent' || type === 'Component') && typeof name === 'string';
}

/** the id attribute's plain text literal — resync.ts's idLiteralOf pattern */
function idLiteralOf(node: ComponentLike): string | undefined {
  const attribute = node.attributes?.find((candidate) => candidate.type === 'Attribute' && candidate.name === 'id');
  if (attribute === undefined) return undefined;
  const value = attribute.value;
  if (!Array.isArray(value) || value.length !== 1) return undefined;
  const only = value[0] as PartLike;
  return only.type === 'Text' && typeof only.data === 'string' ? only.data : undefined;
}

/** depth-first fragment walk (resync.ts's B5 walker pattern — blocks too) */
function findComponentById(nodes: readonly unknown[], componentId: string): ComponentLike | undefined {
  for (const node of nodes) {
    if (isComponentNode(node)) {
      if (idLiteralOf(node) === componentId) return node;
      const nested = findComponentById(node.children ?? [], componentId);
      if (nested !== undefined) return nested;
      continue;
    }
    if (node === null || typeof node !== 'object') continue;
    const branch = node as { readonly children?: unknown; readonly else?: unknown; readonly pending?: unknown; readonly then?: unknown; readonly catch?: unknown; readonly type?: unknown };
    if (Array.isArray(branch.children)) {
      const hit = findComponentById(branch.children, componentId);
      if (hit !== undefined) return hit;
    }
    if (branch.type === 'IfBlock' && branch.else != null && typeof branch.else === 'object') {
      const hit = findComponentById([branch.else], componentId);
      if (hit !== undefined) return hit;
    }
    if (branch.type === 'AwaitBlock') {
      for (const arm of [branch.pending, branch.then, branch.catch]) {
        const hit = findComponentById([arm], componentId);
        if (hit !== undefined) return hit;
      }
    }
  }
  return undefined;
}

/**
 * The PURE source transform: locate the usage carrying `componentId` and
 * materialize `prop` into its text-serialized form. Offsets are half-open
 * UTF-16 spans into `source`; the result is the rewritten source plus the
 * hole(s) the new prop will occupy after `planPage` re-toasts the scaffold.
 *
 * @throws MaterializeError `component-not-found` / `prop-not-materializable`.
 */
export function materializePropText(source: string, componentId: string, prop: string, value: EditValue): MaterializedSource {
  if (prop === 'id') {
    throw new MaterializeError('prop-not-materializable', 409, `prop id on the usage of ${componentId} is the identity anchor (§2) — never a content buffer`);
  }
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
    throw new MaterializeError('prop-not-materializable', 409, `prop ${prop} of ${componentId} materializes from a string | number | boolean value, got ${typeof value}`);
  }
  const ast = parseSvelte(source) as unknown as FragmentAst;
  const node = findComponentById(ast.html?.children ?? [], componentId);
  if (node === undefined) {
    throw new MaterializeError('component-not-found', 404, `no component usage carrying id ${JSON.stringify(componentId)} exists in the page — the selection is stale`);
  }
  const attributes = (node.attributes ?? []).filter((attribute) => attribute.type === 'Attribute' && typeof attribute.name === 'string');
  const directive = (node.attributes ?? []).find((attribute) => attribute.type !== 'Attribute' && attribute.name === prop);
  if (directive !== undefined) {
    throw new MaterializeError('prop-not-materializable', 409, `prop ${prop} on <${node.name}> rides a directive (${directive.type}) — the panel cannot address it`);
  }
  const target = attributes.find((attribute) => attribute.name === prop);
  if (target !== undefined) {
    if (target.value !== true) {
      throw new MaterializeError(
        'prop-not-materializable',
        409,
        `prop ${prop} on <${node.name}> already carries a value — it is either a buffer (prop-quoted/prop-expr) or an expression the panel cannot address`,
      );
    }
    if (typeof value !== 'boolean') {
      throw new MaterializeError('prop-not-materializable', 409, `the bare boolean prop ${prop} on <${node.name}> materializes from a boolean value, got ${typeof value}`);
    }
    // bare boolean → `={<bool>}` right after the attribute's name
    const insertion = `={${String(value)}}`;
    return {
      source: source.slice(0, target.end) + insertion + source.slice(target.end),
      holes: [{ buffer: prop, how: 'prop-expr', text: String(value) }],
    };
  }
  // absent → ` <prop>=<literal>` after the component's LAST attribute
  const last = attributes.at(-1);
  if (last === undefined) {
    throw new MaterializeError(
      'prop-not-materializable',
      409,
      `<${node.name}> carries no attributes to anchor the insertion — unreachable on ingested pages (the id anchor law guarantees one)`,
    );
  }
  const how: HoleSerializer = typeof value === 'string' ? 'prop-quoted' : 'prop-expr';
  // the §3 laws: quoted-string buffer = the bytes INSIDE the quotes
  // (renderValue(...).slice(1, -1)); brace-literal buffer = the raw bytes
  const text = typeof value === 'string' ? renderValue(value).slice(1, -1) : String(value);
  const insertion = ` ${prop}=${renderValue(value)}`;
  return {
    source: source.slice(0, last.end) + insertion + source.slice(last.end),
    holes: [{ buffer: prop, how, text }],
  };
}

/* ── the orchestration (the server-side composite) ────────────────────── */

export interface MaterializeRequest {
  readonly page: string;
  readonly componentId: string;
  readonly prop: string;
  readonly value: EditValue;
  /** the caller's idempotency key — the tree-update op's opId (receiptFor lane) */
  readonly opId: string;
  readonly actor: string;
  /** the response increment normalizes against the caller's cursor (§5 step 6) */
  readonly syncCursor?: SyncCursor;
}

/**
 * Assemble and commit the atomic materialization group inside ONE
 * exclusive section of the gate (§7 fence — everything synchronous):
 * current projection → pure transform → planPage re-toast → ops (tree
 * updates + the new hole's text insert) → `commitTransaction` under the
 * §7 compile gate, `journalTxRejection: false` (the endpoint journals
 * under the REQUEST opId — the §5.0 single-headed audit, mirroring the
 * admission single-op transaction lane).
 *
 * A rollback answers `status: 'rejected'` with ZERO effect (pre-commit
 * discard); the caller surfaces `diagnostics` as the gate error. Cursor
 * anchoring is risk-free by construction: tree update never touches Text
 * containers and the text op targets a FRESH container.
 */
export async function materializeProp(gate: AdmissionGate, request: MaterializeRequest): Promise<TransactionReceipts> {
  return await gate.runExclusive(() => {
    const kernel: CollabKernel = gate.kernel;
    const { page, componentId, prop, value, opId, actor } = request;

    const storedPage = treeItemsOf(kernel).find((entry) => entry.page?.path === page)?.page;
    if (storedPage === undefined) {
      throw new MaterializeError('unknown-page', 404, `no page tree item holds ${JSON.stringify(page)} — the ingest drive failed to adopt it`);
    }
    if (kernel.treeNodeOf(componentId) === undefined) {
      throw new MaterializeError('component-not-found', 404, `component ${componentId} holds no tree node — the selection is stale`);
    }

    const projection = projectSource(kernel, page);
    const transformed = materializePropText(projection.source, componentId, prop, value);
    const plan = planPage(transformed.source, page, storedPage.letter);
    const hole = plan.pageItem.holes.find((candidate) => candidate.componentId === componentId && candidate.buffer === prop);
    if (hole === undefined) {
      throw new MaterializeError('prop-not-materializable', 409, `prop ${prop} maps outside the frozen buffer slug charset — the panel cannot address it`);
    }

    const base = kernel.frontiers();
    const ops: TransactionOp[] = [];
    // ① the re-toasted page scaffold — the request's opId rides THE tree
    // update so `receiptFor(opId)` owns the idempotent replay
    ops.push({ domain: 'tree', opId, target: { componentId: page }, envelope: treeUpdateEnvelope(opId, page, plan.pageItem, base, actor) });
    // ② component descriptors whose skip lists changed (the materialized
    // prop left them) — the same M5a update the reconcile lane lands
    for (const component of plan.componentItems) {
      const stored = treeItemsOf(kernel).find((entry) => entry.component?.id === component.id)?.component;
      if (stored === undefined) continue; // not this lane's job (the reconcile lane inserts)
      if (stableStringify(stored) === stableStringify(component)) continue;
      const metaOpId = `${opId}:meta:${component.id}`;
      ops.push({ domain: 'tree', opId: metaOpId, target: { componentId: component.id }, envelope: treeUpdateEnvelope(metaOpId, component.id, component, base, actor) });
    }
    // ③ the buffers: every plan buffer whose container is missing (the
    // new hole — the fork's lazy `getText` builds it) or holds residue
    // differing from the plan content (defensive: unreachable through the
    // real lanes, honest through hand-corrupted states)
    let seed = 0;
    for (const buffer of plan.buffers) {
      const existing = kernel.hasBuffer(buffer.containerKey) ? kernel.bufferText(buffer.containerKey) : undefined;
      if (existing === buffer.content) continue;
      seed += 1;
      const seedOpId = `${opId}:seed${seed}`;
      ops.push(
        existing === undefined
          ? {
              domain: 'text',
              kind: 'insert',
              opId: seedOpId,
              target: { componentId: buffer.componentId, buffer: buffer.buffer },
              containerKey: buffer.containerKey,
              offset: 0,
              length: 0,
              text: buffer.content,
              expectedBefore: '',
            }
          : {
              domain: 'text',
              kind: 'replace',
              opId: seedOpId,
              target: { componentId: buffer.componentId, buffer: buffer.buffer },
              containerKey: buffer.containerKey,
              offset: 0,
              length: existing.length,
              text: buffer.content,
              expectedBefore: existing,
            },
      );
    }

    const receipts = kernel.commitTransaction({
      ops,
      transactionId: `tx:${opId}`,
      actor,
      peer: kernel.peerOf(actor),
      strategy: 'rollback',
      compileGate: transactionCompileGate,
      timestamp: Date.now(),
      ...(request.syncCursor !== undefined ? { responseCursor: request.syncCursor } : {}),
      // the endpoint journals the rejection under the REQUEST opId (the
      // §5.0 single-headed audit) — the tx-level row would duplicate it
      journalTxRejection: false,
    });
    if (receipts.status !== 'accepted') {
      kernel.recordRejection(
        { opId, actor, target: { componentId: page } },
        {
          opId,
          status: 422,
          code: 'compile-failed',
          actor,
          target: { componentId: page },
          canonicalFrontier: kernel.frontiers(),
          canonicalUpdate: undefined,
          syncCursor: undefined,
          retry: undefined,
          conflict: undefined,
          range: undefined,
          detail: `materialize transaction tx:${opId} rolled back with zero effect: ${receipts.diagnostics ?? 'unknown failure'}`,
          serverAdmissionTime: Date.now(),
        },
      );
    }
    return receipts;
  });
}

/* ── stable deep compare (resync.ts's scaffold-stale twin) ────────────── */

/** key-sorted canonical JSON — order-insensitive deep equality */
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value as Record<string, unknown>).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
