/**
 * @jixoai/ui-design (server) — the panel's collab op lane
 * (collab-protocol M7a): the HTTP surface `/__design__/api/collab/*`
 * that retires the old prop-edit file-CAS endpoint.
 *
 * Orthogonal intents (4):
 *   1. USAGE — `POST /usage`: resolve the panel's selection
 *      {file, component, usageIndex} onto the protocol's id-first
 *      addressing (protocol-spec §2): the page's CANONICAL PROJECTION
 *      is parsed with the stamp transform's own document-order space
 *      (the prop-edit locate law, migrated here when the CAS lane was
 *      deleted) and answers the usage's native `id` plus its buffer
 *      set (name + serializer `how` + current kernel text). A page the
 *      workspace has never ingested is ADOPTED on demand through the
 *      M6b host's §8 cycle (`syncExternalChange` — identity injection,
 *      journal accounting, atomic write-back); a usage that still has
 *      no id answers `awaitingIngest` and the panel disables writes
 *      (the transitional defense).
 *   2. ADMIT — `POST /admit`: one §4 op envelope through the
 *      workspace's shared AdmissionGate (the M6b host's `server.collab`
 *      accessor — one kernel, one gate per workspace). Receipts and
 *      §5 error envelopes are transposed to JSON VERBATIM (base64 for
 *      the byte fields); the gate's TypeError envelope-shape rejections
 *      answer 400 without consuming a peer/WAL/journal row. After a
 *      200 the endpoint drives ONE §8 cycle for the affected page so
 *      the canonical projection reaches the .svelte file (atomic
 *      write-back → vite HMR carries it into the frame) — admission is
 *      authoritative, the file is its projection.
 *   3. SYNC — `POST /sync`: the client log-cursor increment + per-
 *      component tail-5 (`cli sync`'s exact engine), the canonical→
 *      mirror direction of §1/§9: the PANEL imports the update into
 *      its browser-side LoroDoc mirror, never the other way round.
 *   4. UNDO — `POST /undo`: the §6 conflict-resolution face the panel's
 *      inline conflict card consumes — `give-up` (compensate a
 *      committed op, `supersedes` accounting) and `override-undo` /
 *      `override-redo` (the human actor's UndoManager session, opened
 *      idempotently by this endpoint so panel commits are recorded).
 *      `status` reports the session's undo/redo availability.
 *
 * Degradation law (create.ts's M6b posture): a workspace whose
 * `.jx-collab/` journal failed to open has NO host — every route
 * answers the honest 503 envelope instead of a half-lane.
 *
 * Original need: collab-protocol M7a (2026-09-15).
 */

import type { IncomingMessage, ServerResponse } from 'node:http';

import { treeItemsOf, projectSource } from './collab/bridge.ts';
import { cliSync } from './collab/cli.ts';
import type { CollabHost } from './collab-host.ts';
import type {
  AdmissionResult,
  CommitReceipt,
  ErrorEnvelope,
  Frontier,
  FrontierPoint,
  JournalTailEntry,
  OpEnvelope,
  SyncCursor,
  TreeOpEnvelope,
} from './collab/types.ts';
import { stampSvelteSource } from './stamp/transform.ts';

/* ── route vocabulary ──────────────────────────────────────────────────── */

export const COLLAB_API_BASE = '/__design__/api/collab';

/** the §4 actor every panel-submitted op carries (single-human v0) */
export const PANEL_ACTOR = 'human';

/* ── byte-field codec (JSON transport of §4/§5 envelopes) ──────────────── */

function toB64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

function fromB64(text: string): Uint8Array {
  return new Uint8Array(Buffer.from(text, 'base64'));
}

/* ── structural JSON narrowing (untrusted request bodies) ──────────────── */

const isObj = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isStr = (value: unknown): value is string => typeof value === 'string';
const isInt = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value);

function frontierFromJson(value: unknown, field: string): Frontier {
  if (!Array.isArray(value)) throw new RequestError(`${field} must be an array of {peer, counter}`);
  const points: FrontierPoint[] = [];
  for (const item of value) {
    if (!isObj(item) || !isStr(item.peer) || !isInt(item.counter)) {
      throw new RequestError(`${field} entries must be {peer: string, counter: integer}`);
    }
    points.push({ peer: item.peer, counter: item.counter });
  }
  return points;
}

function syncCursorFromJson(value: unknown, field: string): SyncCursor {
  if (!isObj(value) || (value.kind !== 'frontier' && value.kind !== 'vv')) {
    throw new RequestError(`${field} must be {kind: "frontier"|"vv", value}`);
  }
  if (value.kind === 'frontier') return { kind: 'frontier', value: frontierFromJson(value.value, `${field}.value`) };
  if (!isObj(value.value) || !Object.values(value.value).every(isInt)) {
    throw new RequestError(`${field}.value must be a version vector ({peer: counter})`);
  }
  return { kind: 'vv', value: value.value as Record<string, number> };
}

/** a 400-class request rejection (never a protocol adjudication) */
class RequestError extends Error {}

/* ── the §4 op envelope, JSON → typed ─────────────────────────────────── */

/**
 * Build the typed op envelope from the panel's JSON body. Structural
 * fidelity only — the gate's own `assertEnvelopeShape` remains the §4
 * tagged-union authority (its TypeError answers 400 here).
 */
export function envelopeFromJson(body: unknown): OpEnvelope {
  if (!isObj(body)) throw new RequestError('body must be a JSON object');
  const actor = body.actor;
  const opId = body.opId;
  if (!isStr(actor) || actor.length === 0) throw new RequestError('actor (non-empty string) is required');
  if (!isStr(opId) || opId.length === 0) throw new RequestError('opId (non-empty string) is required');
  const baseFrontiers = frontierFromJson(body.baseFrontiers, 'baseFrontiers');
  const timestamp = body.timestamp === undefined ? undefined : isInt(body.timestamp) ? body.timestamp : undefined;
  const syncCursor = body.syncCursor === undefined ? undefined : syncCursorFromJson(body.syncCursor, 'syncCursor');
  const common = { actor, opId, baseFrontiers, ...(timestamp !== undefined ? { timestamp } : {}), ...(syncCursor !== undefined ? { syncCursor } : {}) };

  if (body.domain === 'text' && body.kind === 'create') {
    const target = textTargetFromJson(body.target);
    if (!isStr(body.initialText)) throw new RequestError('initialText (string) is required for kind "create"');
    return { ...common, domain: 'text', kind: 'create', target, initialText: body.initialText };
  }
  if (body.domain === 'text') {
    if (body.kind !== 'insert' && body.kind !== 'delete' && body.kind !== 'replace') {
      throw new RequestError('text kind must be insert | delete | replace | create');
    }
    const target = textTargetFromJson(body.target);
    if (!isStr(body.cursorBytesB64)) throw new RequestError('cursorBytesB64 (base64 §4 anchor) is required for text ops');
    if (!isInt(body.offset) || body.offset < 0) throw new RequestError('offset (integer >= 0) is required');
    if (!isInt(body.length) || body.length < 0) throw new RequestError('length (integer >= 0) is required');
    if (!isStr(body.text)) throw new RequestError('text (string) is required');
    return {
      ...common,
      domain: 'text',
      kind: body.kind,
      target,
      cursorBytes: fromB64(body.cursorBytesB64),
      offset: body.offset,
      length: body.length,
      text: body.text,
      ...(isStr(body.expectedRaw) ? { expectedRaw: body.expectedRaw } : {}),
      ...(isStr(body.expectedHash) ? { expectedHash: body.expectedHash } : {}),
    };
  }
  if (body.domain === 'tree') {
    if (body.kind !== 'insert' && body.kind !== 'move' && body.kind !== 'remove' && body.kind !== 'revive' && body.kind !== 'update') {
      throw new RequestError('tree kind must be insert | move | remove | revive | update');
    }
    const targetRaw = body.target;
    if (!isObj(targetRaw) || !isStr(targetRaw.componentId) || targetRaw.componentId.length === 0) {
      throw new RequestError('target {componentId} is required');
    }
    if (!isObj(body.tree)) throw new RequestError('tree (the §4 payload object) is required for tree ops');
    // the payload crosses untrusted JSON → the §4 tagged union; the
    // gate's assertEnvelopeShape remains the structural authority
    // the kind↔payload correlation is the gate's §4 authority — the
    // boundary only forwards what it parsed
    return { ...common, domain: 'tree', kind: body.kind, target: { componentId: targetRaw.componentId }, tree: body.tree as unknown as TreeOpEnvelope['tree'] } as TreeOpEnvelope;
  }
  throw new RequestError('domain must be "text" or "tree"');
}

function textTargetFromJson(value: unknown): { componentId: string; buffer: string } {
  if (!isObj(value) || !isStr(value.componentId) || value.componentId.length === 0 || !isStr(value.buffer) || value.buffer.length === 0) {
    throw new RequestError('target {componentId, buffer} (non-empty strings) is required');
  }
  return { componentId: value.componentId, buffer: value.buffer };
}

/* ── the §5 results, typed → JSON ─────────────────────────────────────── */

/** one tail entry as JSON (already plain — kept for shape stability) */
function tailToJson(entry: JournalTailEntry): Record<string, unknown> {
  return { ...entry };
}

/** the 200-lane receipt (§5.6 return envelope) as JSON */
export function receiptToJson(receipt: CommitReceipt): Record<string, unknown> {
  return {
    status: 200,
    opId: receipt.opId,
    ...(receipt.transactionId !== undefined ? { transactionId: receipt.transactionId } : {}),
    actor: receipt.actor,
    domain: receipt.domain,
    target: receipt.target,
    containerKey: receipt.containerKey,
    frontier: receipt.frontier,
    syncCursor: receipt.syncCursor,
    updateB64: toB64(receipt.update),
    value: receipt.value,
    logTail: receipt.logTail.map(tailToJson),
    serverAdmissionTime: receipt.serverAdmissionTime,
    ...(receipt.clientEventTime !== undefined ? { clientEventTime: receipt.clientEventTime } : {}),
    ...(receipt.supersedes !== undefined ? { supersedes: receipt.supersedes } : {}),
  };
}

/** the §5 error envelope as JSON — every field transposed verbatim */
export function errorToJson(error: ErrorEnvelope): Record<string, unknown> {
  return {
    status: error.status,
    code: error.code,
    opId: error.opId,
    actor: error.actor,
    target: error.target,
    canonicalFrontier: error.canonicalFrontier,
    ...(error.canonicalUpdate !== undefined ? { canonicalUpdateB64: toB64(error.canonicalUpdate) } : {}),
    ...(error.syncCursor !== undefined ? { syncCursor: error.syncCursor } : {}),
    ...(error.retry !== undefined
      ? {
          retry: {
            ...(error.retry.cursorBytes !== undefined ? { cursorBytesB64: toB64(error.retry.cursorBytes) } : {}),
            ...(error.retry.reason !== undefined ? { reason: error.retry.reason } : {}),
          },
        }
      : {}),
    ...(error.conflict !== undefined ? { conflict: error.conflict } : {}),
    ...(error.range !== undefined ? { range: error.range } : {}),
    ...(error.detail !== undefined ? { detail: error.detail } : {}),
    serverAdmissionTime: error.serverAdmissionTime,
  };
}

/** the §5 admission result (either lane) as the endpoint's JSON body */
export function admissionToJson(result: AdmissionResult): Record<string, unknown> {
  return result.status === 200 ? receiptToJson(result) : errorToJson(result);
}

/* ── the stamp-space locate law (prop-edit heritage, M7a migration) ────── */

/**
 * `import X from '#jixoai/<item>'` (+ `{ default as X }` and NAMED
 * specifiers) → the local identifiers that may tag the item's usages.
 * The exact regex law the deleted prop-edit CAS lane used to number
 * usages in the stamp transform's GLOBAL document-order space (the
 * data-jx-instance ordinal contract) — migrated here because the usage
 * endpoint still needs (component, usageIndex) → the usage's id.
 */
function importTableOf(source: string): Map<string, string> {
  const table = new Map<string, string>();
  const re = /import\s+(?:([A-Za-z_$][\w$]*)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s+['"]#jixoai\/([\w-]+)['"]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    const item = match[3]!;
    if (match[1] !== undefined) table.set(match[1], item);
    if (match[2] !== undefined) {
      for (const part of match[2].split(',')) {
        const spec = part.trim();
        if (spec.length === 0 || spec.startsWith('type ')) continue;
        const asMatch = /^([\w$]+)\s+as\s+([\w$]+)$/.exec(spec);
        table.set(asMatch?.[2] ?? spec, item);
      }
    }
  }
  return table;
}

/** the usage endpoint's resolution of one selection onto protocol addressing */
export interface UsageResolution {
  readonly ok: true;
  readonly page: string;
  readonly componentId: string;
  readonly shared: boolean;
  readonly buffers: readonly { readonly buffer: string; readonly how: string; readonly text: string }[];
}

/**
 * Resolve (page, component, usageIndex) → {id, buffers} against the
 * CANONICAL projection (never the raw file — the protocol is the
 * truth). Pure over the kernel; the adoption drive is the caller's
 * (endpoint) lane because it touches the §8 cycle.
 */
export async function resolveUsage(
  kernel: CollabHost['kernel'],
  page: string,
  component: string,
  usageIndex: number,
): Promise<UsageResolution | { ok: false; reason: 'unknown-page' | 'usage-not-found' | 'awaiting-ingest'; message: string }> {
  let projection: string;
  let report: ReturnType<typeof projectSource>['report'];
  try {
    const result = projectSource(kernel, page);
    projection = result.source;
    report = result.report;
  } catch {
    return { ok: false, reason: 'unknown-page', message: `no page tree item holds ${page} — the ingest drive failed to adopt it` };
  }
  const bindings = Object.fromEntries(importTableOf(projection));
  const stamped = await stampSvelteSource(projection, { filename: page, bindings });
  const entry = stamped?.usageMap[String(usageIndex)];
  if (entry === undefined) {
    return { ok: false, reason: 'usage-not-found', message: `usage #${usageIndex} not found in the canonical projection of ${page}` };
  }
  if (entry.component !== component) {
    return { ok: false, reason: 'usage-not-found', message: `usage #${usageIndex} is ${entry.component}, not "${component}" (the stamp space counts all jixoai usages in document order)` };
  }
  if (entry.id === undefined) {
    return { ok: false, reason: 'awaiting-ingest', message: `usage #${usageIndex} (${component}) carries no native id yet — the page awaits ingest; the panel stays read-only until the §8 cycle adopts it` };
  }
  const buffers = report.buffers
    .filter((buffer) => buffer.componentId === entry.id)
    .map((buffer) => ({ buffer: buffer.buffer, how: buffer.how, text: kernel.bufferText(buffer.containerKey) }));
  return { ok: true, page, componentId: entry.id, shared: entry.inEachBlock, buffers };
}

/** the panel's `file` (host-root-relative) → the design page path */
export function pageOfFile(file: string): string | null {
  if (!file.endsWith('.svelte')) return null;
  const page = file.replace(/^design\//, '');
  if (page.length === 0 || page.startsWith('/') || page.split('/').some((segment) => segment === '..' || segment.startsWith('.'))) return null;
  return page;
}

/**
 * The page a target belongs to: page-level buffers address the page
 * path itself; component targets resolve through the tree items.
 */
function pageOfTarget(host: CollabHost, componentId: string): string | undefined {
  for (const entry of treeItemsOf(host.kernel)) {
    if (entry.page?.path === componentId) return entry.page.path;
    if (entry.component?.id === componentId) return entry.component.path;
  }
  return undefined;
}

/**
 * Drive ONE §8 cycle for the page an admitted/undone op touched, so
 * the canonical projection reaches the .svelte file (atomic write-back
 * → HMR).
 *
 * M7 收官轮 (the host root fix): the host's echo/convergence guards are
 * CONVERGE-ALIGNED — "the file equals the LAST projection" no longer
 * answers idempotent while canonical moved on out-of-band; the host's
 * own `syncExternalChange` pushes the current projection when the file
 * verifiably holds a prior one. The M7a consumption-side repair (this
 * function's own atomic write + station heal + moved-on fallback) is
 * RETIRED — one drive, one lane, the station's laws own every branch.
 */
async function driveProjection(host: CollabHost, page: string): Promise<string> {
  try {
    const outcome = await host.syncExternalChange(page);
    return outcome.kind;
  } catch (cause) {
    return `failed (${cause instanceof Error ? cause.message : String(cause)})`;
  }
}

/* ── the middleware ───────────────────────────────────────────────────── */

export interface CollabApiResponse {
  readonly status: number;
  readonly body: Record<string, unknown>;
}

/**
 * The connect middleware. `getHost` is LATE-BOUND (create.ts opens the
 * collab host after vite's server assembly — requests only arrive
 * after listen, when the reference is populated). A missing host (the
 * M6b corrupt-journal degrade) answers the honest 503 on every route.
 */
export function collabApiMiddleware(getHost: () => CollabHost | undefined): (req: IncomingMessage, res: ServerResponse, next: () => void) => void {
  return (req, res, next) => {
    const pathname = (req.url ?? '').split('?')[0]!;
    if (!pathname.startsWith(`${COLLAB_API_BASE}/`)) return next();
    if (req.method !== 'POST') return next();
    const route = pathname.slice(COLLAB_API_BASE.length + 1);
    if (route !== 'usage' && route !== 'admit' && route !== 'sync' && route !== 'undo') return next();

    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > 4 * 1024 * 1024) {
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      void (async () => {
        let body: unknown;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        } catch {
          respond(res, { status: 400, body: { ok: false, reason: 'bad-request', message: 'invalid JSON body' } });
          return;
        }
        const host = getHost();
        if (host === undefined) {
          respond(res, { status: 503, body: { ok: false, reason: 'collab-unavailable', message: 'the workspace collab kernel failed to open — collaborative lanes are degraded (see the server log)' } });
          return;
        }
        try {
          respond(res, await resolveCollabApiRequest(host, route, body));
        } catch (error) {
          // the resolver maps the known classes; anything reaching here
          // is an unexpected fault — honest 500, never a half-lane
          respond(res, { status: 500, body: { ok: false, reason: 'internal', message: error instanceof Error ? error.message : String(error) } });
        }
      })().catch(next);
    });
  };
}

function respond(res: ServerResponse, response: CollabApiResponse): void {
  res.statusCode = response.status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(response.body));
}

/**
 * The route resolver (pure over the host + parsed body — the
 * middleware's engine, and the in-process test surface: the panel
 * client battery routes its transport here without sockets).
 * Request-shape rejections and the gate's §4 TypeError surface as 400
 * responses here, identically on both surfaces.
 */
export async function resolveCollabApiRequest(host: CollabHost, route: string, body: unknown): Promise<CollabApiResponse> {
  try {
    switch (route) {
      case 'usage':
        return await handleUsage(host, body);
      case 'admit':
        return await handleAdmit(host, body);
      case 'sync':
        return handleSync(host, body);
      case 'undo':
        return await handleUndo(host, body);
      default:
        return { status: 404, body: { ok: false, reason: 'not-found', message: route } };
    }
  } catch (error) {
    if (error instanceof RequestError) {
      return { status: 400, body: { ok: false, reason: 'bad-request', message: error.message } };
    }
    if (error instanceof TypeError) {
      // the gate's §4 tagged-union shape rejection — caller bug
      return { status: 400, body: { ok: false, reason: 'bad-envelope', message: error.message } };
    }
    return { status: 500, body: { ok: false, reason: 'internal', message: error instanceof Error ? error.message : String(error) } };
  }
}

/* ── /usage — id-first selection resolution (+ the adoption drive) ────── */

async function handleUsage(host: CollabHost, body: unknown): Promise<CollabApiResponse> {
  if (!isObj(body)) return { status: 400, body: { ok: false, reason: 'bad-request', message: 'body must be a JSON object' } };
  if (!isStr(body.file) || body.file.length === 0) return { status: 400, body: { ok: false, reason: 'bad-request', message: 'file (string) is required' } };
  if (!isStr(body.component) || body.component.length === 0) return { status: 400, body: { ok: false, reason: 'bad-request', message: 'component (string) is required' } };
  if (!isInt(body.usageIndex) || body.usageIndex < 1) return { status: 400, body: { ok: false, reason: 'bad-request', message: 'usageIndex (integer >= 1, document order, 1-based) is required' } };
  const page = pageOfFile(body.file);
  if (page === null) return { status: 400, body: { ok: false, reason: 'bad-request', message: `file escapes the design workspace or is not a .svelte page: ${body.file}` } };

  // the adoption drive: a page the workspace never ingested enters the
  // protocol NOW (identity injection + journal + atomic write-back —
  // the browser then sees ids on the next stamp pass via HMR)
  let adopted: string | undefined;
  let reconciled: string | undefined;
  const known = treeItemsOf(host.kernel).some((entry) => entry.page?.path === page);
  if (!known) {
    const outcome = await host.syncExternalChange(page);
    adopted = outcome.kind;
    if (outcome.kind === 'failed' || outcome.kind === 'skipped') {
      return { status: 422, body: { ok: false, reason: 'ingest-failed', message: `the §8 adoption drive failed for ${page}: ${outcome.detail ?? outcome.kind}` } };
    }
  } else {
    // the known-page reconcile drive (M7 收官轮): a page whose
    // convergence state does not match the current file — a cross-era
    // journal's stale tree meta (the panel's buffer underreport), or a
    // hand edit that never routed — runs ONE §8 reconcile cycle so the
    // resolution below answers the CURRENT buffer set (idempotent/free
    // when the file verifiably holds its converged projection)
    const outcome = await host.reconcilePage(page);
    if (outcome.kind === 'failed' || outcome.kind === 'skipped') {
      return { status: 422, body: { ok: false, reason: 'reconcile-failed', message: `the §8 reconcile drive failed for ${page}: ${outcome.detail ?? outcome.kind}` } };
    }
    if (outcome.kind !== 'idempotent') reconciled = outcome.kind;
  }

  const resolution = await resolveUsage(host.kernel, page, body.component, body.usageIndex);
  if (!resolution.ok) {
    const status = resolution.reason === 'unknown-page' ? 422 : 404;
    return {
      status,
      body: { ok: false, reason: resolution.reason, message: resolution.message, ...(adopted !== undefined ? { adopted } : {}), ...(reconciled !== undefined ? { reconciled } : {}) },
    };
  }
  return {
    status: 200,
    body: {
      ok: true,
      page: resolution.page,
      componentId: resolution.componentId,
      shared: resolution.shared,
      buffers: resolution.buffers,
      ...(adopted !== undefined ? { adopted } : {}),
      ...(reconciled !== undefined ? { reconciled } : {}),
    },
  };
}

/* ── /admit — one op envelope through the §5 gate ─────────────────────── */

async function handleAdmit(host: CollabHost, body: unknown): Promise<CollabApiResponse> {
  const envelope = envelopeFromJson(body);
  // the human's UndoManager session must be open BEFORE the commit so
  // the §6 override lane can take panel fragments back (idempotent)
  if (envelope.actor === PANEL_ACTOR) host.kernel.openOverrideSession(PANEL_ACTOR);
  const result = await host.gate.admit(envelope);
  const page = pageOfTarget(host, envelope.target.componentId);
  const projection = result.status === 200 && page !== undefined ? await driveProjection(host, page) : undefined;
  return {
    status: result.status,
    body: { ...admissionToJson(result), ...(projection !== undefined ? { projection } : {}) },
  };
}

/* ── /sync — the client log-cursor increment + tail-5 (§9) ────────────── */

function handleSync(host: CollabHost, body: unknown): CollabApiResponse {
  if (body === null || body === undefined) return { status: 400, body: { ok: false, reason: 'bad-request', message: 'body must be a JSON object' } };
  if (!isObj(body)) return { status: 400, body: { ok: false, reason: 'bad-request', message: 'body must be a JSON object' } };
  const syncCursor = body.syncCursor === undefined ? undefined : syncCursorFromJson(body.syncCursor, 'syncCursor');
  const componentId = body.componentId === undefined ? undefined : isStr(body.componentId) && body.componentId.length > 0 ? body.componentId : undefined;
  if (body.componentId !== undefined && componentId === undefined) {
    return { status: 400, body: { ok: false, reason: 'bad-request', message: 'componentId must be a non-empty string when given' } };
  }
  const result = cliSync(host.gate, { ...(syncCursor !== undefined ? { syncCursor } : {}), ...(componentId !== undefined ? { componentId } : {}) });
  return {
    status: result.status,
    body: {
      ok: result.status === 200,
      ...(result.code !== undefined ? { code: result.code } : {}),
      updateB64: toB64(result.update),
      syncCursor: result.syncCursor,
      logs: result.logs,
    },
  };
}

/* ── /undo — the §6 face (give-up / override-undo / override-redo) ─────── */

async function handleUndo(host: CollabHost, body: unknown): Promise<CollabApiResponse> {
  if (!isObj(body)) return { status: 400, body: { ok: false, reason: 'bad-request', message: 'body must be a JSON object' } };
  const mode = body.mode;
  const actor = isStr(body.actor) && body.actor.length > 0 ? body.actor : PANEL_ACTOR;
  const syncCursor = body.syncCursor === undefined ? undefined : syncCursorFromJson(body.syncCursor, 'syncCursor');

  if (mode === 'status') {
    const session = host.kernel.overrideSessionOf(actor);
    return { status: 200, body: { ok: true, mode, actor, ...session } };
  }
  if (mode === 'give-up') {
    if (!isStr(body.targetOpId) || body.targetOpId.length === 0) {
      return { status: 400, body: { ok: false, reason: 'bad-request', message: 'targetOpId (the committed op to compensate) is required for give-up' } };
    }
    const opId = isStr(body.opId) && body.opId.length > 0 ? body.opId : undefined;
    const result = await host.gate.giveUp({ targetOpId: body.targetOpId, actor, ...(opId !== undefined ? { opId } : {}), ...(syncCursor !== undefined ? { syncCursor } : {}) });
    const page = result.status === 200 ? pageOfTarget(host, result.target.componentId) : undefined;
    const projection = page !== undefined ? await driveProjection(host, page) : undefined;
    return { status: result.status, body: { ...admissionToJson(result), ...(projection !== undefined ? { projection } : {}) } };
  }
  if (mode === 'override-undo' || mode === 'override-redo') {
    if (!isStr(body.opId) || body.opId.length === 0) {
      return { status: 400, body: { ok: false, reason: 'bad-request', message: `opId (the undo op's own id) is required for ${mode}` } };
    }
    host.kernel.openOverrideSession(actor); // idempotent — the session must predate nothing; empty-stack is honest
    const outcome =
      mode === 'override-undo'
        ? await host.gate.overrideUndo({ actor, opId: body.opId, ...(syncCursor !== undefined ? { syncCursor } : {}) })
        : await host.gate.overrideRedo({ actor, opId: body.opId, ...(syncCursor !== undefined ? { syncCursor } : {}) });
    const page = outcome.status === 'performed' ? pageOfTarget(host, outcome.receipt.target.componentId) : undefined;
    const projection = page !== undefined ? await driveProjection(host, page) : undefined;
    const receipt = outcome.status === 'performed' ? receiptToJson(outcome.receipt) : undefined;
    return {
      status: outcome.status === 'performed' ? 200 : 409,
      body: { ok: outcome.status === 'performed', mode, status: outcome.status, ...(receipt !== undefined ? { receipt } : {}), ...(projection !== undefined ? { projection } : {}) },
    };
  }
  return { status: 400, body: { ok: false, reason: 'bad-request', message: 'mode must be "status" | "give-up" | "override-undo" | "override-redo"' } };
}
