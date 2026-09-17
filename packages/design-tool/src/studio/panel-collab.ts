/**
 * @jixoai/ui-design (studio) — the panel's collab client
 * (collab-protocol M7a): the browser-side LoroDoc MIRROR + pending
 * overlay + §6 conflict-card state machine behind
 * `/__design__/api/collab/*` (collab-api.ts is the server face).
 *
 * Orthogonal intents (4):
 *   1. MIRROR — §1's canonical→mirror direction, and ONLY that
 *      direction: the client imports sync increments (log-cursor) into
 *      its own LoroDoc replica and reads buffer texts/cursors from it;
 *      it never exports local state. The mirror is the panel's whole
 *      worldview: seeds, anchors (§4 cursorBytes encode against the
 *      replica — stable across peers by design) and baseFrontiers.
 *   2. OVERLAY — the optimistic echo: a control change writes a
 *      per-buffer DESIRED text immediately (the row paints it) and a
 *      debounced commit lane turns each debounce window's net diff
 *      into ONE fragmented §4 text op (insert/delete/replace derived
 *      by common-prefix/suffix diff — never a blind whole-buffer
 *      replace). 200 imports the receipt update; a merged-but-changed
 *      buffer re-diffs on the next window (concurrent non-overlap
 *      auto-fusion rides the protocol).
 *   3. REBASE — §1's law on every failure lane: `stale-or-unknown-
 *      frontier` imports the carried canonicalUpdate and resubmits
 *      (bounded); `stale-cursor` re-anchors on the envelope's retry
 *      cursorBytes or drops to an honest reselect; a CONFLICT (same-
 *      buffer overlap, §5.2) drops the pending overlay, imports the
 *      canonical increment and raises the inline conflict card.
 *   4. CONFLICT CARD — §6's role asymmetry for the human lane: the
 *      rejected fragment's desired text vs the landed write.
 *      「用我的」 (override, 保自己) withdraws the actor's interleaved
 *      fragments through the undo face's UndoManager lane
 *      (`override-undo` — only the human peer's ops revert) and then
 *      re-asserts the desired text on current canonical; 「用 Agent
 *      的」 (give-up, 接受对方) drops the pending edit and accepts the
 *      canonical text. Edits on a conflicted buffer SUSPEND until the
 *      choice lands (the panel's pending state — the retired SSE
 *      decorative lock's honest successor).
 *
 * Environment: browser (the studio bundle — loro-crdt's browser
 * build) AND node (the unit-test battery runs the same code against
 * the nodejs build with an in-memory transport).
 *
 * Original need: collab-protocol M7a (2026-09-15).
 */

import { LoroDoc } from 'loro-crdt';

/* ── the §4/§5 JSON shapes (collab-api.ts's contract) ─────────────────── */

/** the §4 actor every panel op carries (single-human v0) */
export const PANEL_ACTOR = 'human';

export interface SyncCursorJson {
  readonly kind: 'frontier' | 'vv';
  readonly value: unknown;
}

export interface ConflictCommittedJson {
  readonly opId: string;
  readonly actor: string;
  readonly kind: string;
  readonly offset: number;
  readonly length: number;
}

export interface ConflictDetailJson {
  readonly incoming: ConflictCommittedJson;
  readonly committed: readonly ConflictCommittedJson[];
  /** the component-granularity tail (§9 tailFor spans EVERY buffer of the component) */
  readonly tail: readonly { readonly opId: string; readonly actor: string; readonly componentId: string; readonly buffer: string; readonly value: string }[];
  readonly currentText: string;
}

export interface AdmitJson {
  readonly status: number;
  readonly code?: string;
  readonly opId?: string;
  readonly updateB64?: string;
  readonly syncCursor?: SyncCursorJson;
  readonly canonicalUpdateB64?: string;
  readonly retry?: { readonly cursorBytesB64?: string; readonly reason?: string };
  readonly conflict?: ConflictDetailJson;
  readonly value?: string;
  readonly detail?: string;
}

export interface SyncJson {
  readonly status: number;
  readonly code?: string;
  readonly updateB64: string;
  readonly syncCursor: SyncCursorJson;
}

export interface UndoJson {
  readonly ok?: boolean;
  readonly mode?: string;
  readonly status?: string;
  readonly receipt?: { readonly updateB64?: string; readonly syncCursor?: SyncCursorJson };
}

/** the /materialize response (§5 receipt shape on 200; reason/message on failure) */
export interface MaterializeJson {
  readonly status?: number;
  readonly code?: string;
  readonly reason?: string;
  readonly opId?: string;
  readonly updateB64?: string;
  readonly syncCursor?: SyncCursorJson;
  readonly detail?: string;
  readonly message?: string;
}

/** the transport seam — fetch in the studio, a stub in the tests */
export interface PanelTransport {
  post(path: string, body: unknown): Promise<unknown>;
}

/** the fetch-backed transport over the collab API base */
export function fetchTransport(base: string): PanelTransport {
  return {
    async post(path: string, body: unknown): Promise<unknown> {
      const response = await fetch(`${base}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return (await response.json()) as unknown;
    },
  };
}

/* ── universal base64 (browser btoa AND node ≥16 globals) ─────────────── */

export function bytesToB64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function b64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

/* ── the §3 container-key codec (kernel.ts parity — test-pinned) ───────── */

const NAMED_BUFFERS = new Set(['script', 'style', 'page']);
const SLOT_BUFFER_RE = /^t-\d+$/;
const PROP_BUFFER_PREFIX = 'p-';
const SAFE_CHARS = /^[a-z0-9-]$/;
const SLUG_RE = /^[a-z0-9-]+$/;

const encoder = new TextEncoder();

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

/** the human buffer name → schema-frozen slug (collab/kernel.ts's law, byte-identical) */
export function bufferSlugOf(buffer: string): string {
  if (NAMED_BUFFERS.has(buffer) || SLOT_BUFFER_RE.test(buffer)) return buffer;
  const slug = `${PROP_BUFFER_PREFIX}${buffer}`;
  if (!SLUG_RE.test(slug)) throw new Error(`[panel-collab] buffer ${JSON.stringify(buffer)} maps to slug ${JSON.stringify(slug)} outside the frozen charset [a-z0-9-]`);
  return slug;
}

/** the mirror's container address of one buffer (b:<componentId>:<bufferKey>) */
export function containerKeyOf(componentId: string, buffer: string): string {
  return `b:${encodeComponentId(componentId)}:${bufferSlugOf(buffer)}`;
}

/**
 * The buffer's PANEL FIELD id for the admit sessionHint
 * (presence-liveness P3): a slot-text buffer reports as
 * `slot-text-<buffer>` (the textarea's DOM id), a prop buffer as
 * `prop-<buffer>` — so the gateway's op→attention relay lights the
 * exact row the panel renders (the resolve law: #<field> then
 * prop-<field>). The digest rule is unchanged.
 */
export function attentionFieldOf(buffer: string, how: string | undefined): string {
  return how === 'template-text' ? `slot-text-${buffer}` : `prop-${buffer}`;
}

/* ── the text diff (one debounce window → one fragmented op) ──────────── */

export interface TextDiff {
  readonly kind: 'insert' | 'delete' | 'replace';
  readonly offset: number;
  readonly length: number;
  readonly text: string;
}

/** the net diff turning `current` into `desired`; null when identical */
export function diffText(current: string, desired: string): TextDiff | null {
  if (current === desired) return null;
  const min = Math.min(current.length, desired.length);
  let start = 0;
  while (start < min && current[start] === desired[start]) start += 1;
  let end = 0;
  while (end < min - start && current[current.length - 1 - end] === desired[desired.length - 1 - end]) end += 1;
  const length = current.length - start - end;
  const text = desired.slice(start, desired.length - end);
  return {
    kind: length === 0 ? 'insert' : text.length === 0 ? 'delete' : 'replace',
    offset: start,
    length,
    text,
  };
}

/* ── the §3 prop literal codecs (buffer text ↔ row value) ─────────────── */

export type PropValue = string | number | boolean;

/**
 * Parse a prop buffer's text into the row's value. `prop-quoted`: the
 * buffer IS the decoded string. `prop-expr`: the raw bytes inside the
 * braces — true/false, a JSON number, or a JSON-quoted string;
 * anything else is an honest null (the row degrades to "edit in
 * code").
 */
export function parsePropLiteral(raw: string, how: 'prop-quoted' | 'prop-expr'): PropValue | null {
  if (how === 'prop-quoted') return raw;
  if (raw === 'true' || raw === 'false') return raw === 'true';
  if (/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(raw)) return Number(raw);
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    try {
      return JSON.parse(raw.replaceAll("'", '"')) as string;
    } catch {
      return null;
    }
  }
  return null;
}

/** render a row value back into the buffer's text (the §3 law) */
export function renderPropLiteral(value: PropValue, how: 'prop-quoted' | 'prop-expr'): string {
  if (how === 'prop-quoted') return String(value);
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

/* ── the usage info (the /usage response payload) ─────────────────────── */

export interface PanelUsageInfo {
  readonly page: string;
  readonly componentId: string;
  readonly shared: boolean;
  readonly buffers: readonly { readonly buffer: string; readonly how: string; readonly text: string }[];
  /**
   * the component's non-buffer props (design-studio-acceptance-fixes §3):
   * bare booleans (materializable) and expressions (readonly) with the
   * planner's own `why` vocabulary — the panel's row-classification
   * evidence for the materialize lane.
   */
  readonly skipped?: readonly { readonly name: string; readonly why: string }[];
}

/* ── the observable snapshot (svelte copies this into $state) ─────────── */

export interface PanelBufferState {
  readonly buffer: string;
  readonly how: string;
  /** the EFFECTIVE text: the pending overlay when one stands, else the mirror */
  readonly text: string;
  readonly pending: boolean;
}

export interface PanelConflictState {
  readonly buffer: string;
  /** the value before the landed write (the conflicted buffer's own oldest tail row) */
  readonly oldValue: string;
  /** my rejected desired text */
  readonly mine: string;
  /** the landed canonical text */
  readonly theirs: string;
  /** the actors of the landed conflicting ops (「Agent 的」 naming) */
  readonly actors: readonly string[];
  /** a resolution is in flight (both buttons suspend) */
  readonly resolving: boolean;
}

export interface PanelCollabSnapshot {
  readonly phase: 'idle' | 'seeding' | 'ready' | 'error' | 'awaiting-ingest';
  readonly error: string | null;
  readonly page: string | null;
  readonly componentId: string | null;
  readonly shared: boolean;
  readonly buffers: readonly PanelBufferState[];
  readonly conflicts: readonly PanelConflictState[];
  /** my session has landed ops the override lane can take back */
  readonly undoable: boolean;
}

/* ── options ──────────────────────────────────────────────────────────── */

export interface PanelCollabOptions {
  /** one debounce window's net diff becomes one op (default 350ms) */
  readonly debounceMs?: number;
  /** the timer seam — deterministic tests */
  readonly scheduler?: { setTimeout(fn: () => void, ms: number): unknown; clearTimeout(handle: unknown): void };
  /** the opId namespace (default: a random session id) */
  readonly sessionId?: string;
}

const randomSessionId = (): string => Math.random().toString(36).slice(2, 10);

/* ── the client ───────────────────────────────────────────────────────── */

/**
 * The panel's collab client. One instance per SELECTION TARGET (the
 * component owns the lifecycle); `snapshot()` + `subscribe()` drive
 * the svelte state copy. All server talk rides the injected
 * transport; the LoroDoc mirror is this object's private worldview.
 */
export class PanelCollabClient {
  readonly #transport: PanelTransport;
  readonly #debounceMs: number;
  readonly #scheduler: { setTimeout(fn: () => void, ms: number): unknown; clearTimeout(handle: unknown): void };
  readonly #sessionId: string;

  readonly #doc = new LoroDoc();
  #cursor: SyncCursorJson | undefined;
  #info: PanelUsageInfo | undefined;
  #phase: PanelCollabSnapshot['phase'] = 'idle';
  #error: string | null = null;

  readonly #overlay = new Map<string, string>();
  readonly #conflicts = new Map<string, PanelConflictState>();
  /** buffer → my landed fragments this session (the override lane's bound) */
  readonly #committed = new Map<string, number>();
  readonly #inflight = new Set<string>();
  readonly #timers = new Map<string, unknown>();
  /** the presence identity behind this panel (collab-presence §3): the
   *  admit/materialize bodies carry sessionHint{playerId, field, digest}
   *  so the gateway attributes the edit to the right Player's attention */
  #presenceHint: { playerId: string } | null = null;

  /** the shell feeds the live presence playerId (null while offline) */
  setPresenceHint(playerId: string | null): void {
    this.#presenceHint = playerId === null || playerId.length === 0 ? null : { playerId };
  }
  #seq = 0;
  readonly #listeners = new Set<() => void>();
  #disposed = false;

  constructor(transport: PanelTransport, options: PanelCollabOptions = {}) {
    this.#transport = transport;
    this.#debounceMs = options.debounceMs ?? 350;
    this.#scheduler = options.scheduler ?? {
      setTimeout: (fn, ms) => setTimeout(fn, ms),
      clearTimeout: (handle) => clearTimeout(handle as Parameters<typeof clearTimeout>[0]),
    };
    this.#sessionId = options.sessionId ?? randomSessionId();
    // a fresh peer for the mirror: it never commits, but a distinct id
    // keeps accidental local state from ever masquerading as canonical
    this.#doc.setPeerId(Number.parseInt(this.#sessionId.slice(0, 8), 36) + 0x10000);
  }

  /* ── observation ─────────────────────────────────────────────────────── */

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  snapshot(): PanelCollabSnapshot {
    const info = this.#info;
    return {
      phase: this.#phase,
      error: this.#error,
      page: info?.page ?? null,
      componentId: info?.componentId ?? null,
      shared: info?.shared ?? false,
      buffers:
        info === undefined
          ? []
          : info.buffers.map((buffer) => {
              const overlay = this.#overlay.get(buffer.buffer);
              return {
                buffer: buffer.buffer,
                how: buffer.how,
                text: overlay !== undefined ? overlay : this.mirrorTextOf(buffer.buffer),
                pending: overlay !== undefined || this.#inflight.has(buffer.buffer),
              };
            }),
      conflicts: [...this.#conflicts.values()],
      undoable: [...this.#committed.values()].some((count) => count > 0),
    };
  }

  /** the mirror's current text of one buffer ('' when the container is absent) */
  mirrorTextOf(buffer: string): string {
    const info = this.#info;
    if (info === undefined) return '';
    return this.#doc.getText(containerKeyOf(info.componentId, buffer)).toString();
  }

  /** does the MIRROR carry a buffer the seed-time list never knew? (a
   *  peer's materialize lands as a new `b:<componentId>:<buffer>`
   *  container on import — the panel reseeds when this flips true).
   *  Names outside the frozen slug charset (camelCase schema props)
   *  can never be protocol containers — they probe as false, never
   *  throw: the seed's listener chain must survive every schema. */
  mirrorCarriesUnseededBuffer(candidate: string): boolean {
    const info = this.#info;
    if (info === undefined) return false;
    if (info.buffers.some((buffer) => buffer.buffer === candidate)) return false;
    const slugLegal = NAMED_BUFFERS.has(candidate) || SLOT_BUFFER_RE.test(candidate) || SLUG_RE.test(`${PROP_BUFFER_PREFIX}${candidate}`);
    if (!slugLegal) return false;
    return this.#doc.getText(containerKeyOf(info.componentId, candidate)).length > 0;
  }

  #notify(): void {
    for (const listener of [...this.#listeners]) listener();
  }

  /* ── seeding ─────────────────────────────────────────────────────────── */

  /**
   * Seed the client from the /usage resolution: sync the mirror first
   * (the canonical→mirror direction — never trust the payload's text
   * snapshot over the imported state), then adopt the buffer set.
   */
  async seed(usage: PanelUsageInfo): Promise<void> {
    this.#assertLive();
    this.#phase = 'seeding';
    this.#overlay.clear();
    this.#conflicts.clear();
    this.#error = null;
    this.#notify();
    try {
      await this.syncNow();
      this.#info = usage;
      this.#phase = 'ready';
    } catch (cause) {
      this.#phase = 'error';
      this.#error = cause instanceof Error ? cause.message : String(cause);
    }
    this.#notify();
  }

  /** an awaiting-ingest resolution parks the client (the write-disable defense) */
  markAwaitingIngest(message: string): void {
    this.#phase = 'awaiting-ingest';
    this.#error = message;
    this.#notify();
  }

  fail(message: string): void {
    this.#phase = 'error';
    this.#error = message;
    this.#notify();
  }

  /* ── the mirror (§1 canonical→mirror) ───────────────────────────────── */

  /** pull the cursor increment into the mirror; a stale cursor re-bases on the restricted snapshot */
  async syncNow(): Promise<void> {
    this.#assertLive();
    const body = await this.#transport.post('sync', { ...(this.#cursor !== undefined ? { syncCursor: this.#cursor } : {}) });
    const json = body as SyncJson;
    if (typeof json?.updateB64 !== 'string' || json?.syncCursor === undefined) {
      throw new Error('malformed sync response');
    }
    this.#import(json.updateB64);
    this.#cursor = json.syncCursor;
    this.#notify();
  }

  #import(updateB64: string | undefined): void {
    if (updateB64 === undefined || updateB64.length === 0) return;
    this.#doc.import(b64ToBytes(updateB64));
    this.#doc.commit();
  }

  /* ── the edit lane (overlay + fragmented debounce commits) ──────────── */

  /**
   * Record a desired text for one buffer (the optimistic echo) and arm
   * the debounce window. A conflicted buffer SUSPENDS (§6: the choice
   * must land first); a disposed client ignores the call.
   */
  setDesired(buffer: string, text: string): void {
    if (this.#disposed || this.#phase !== 'ready') return;
    if (this.#conflicts.has(buffer)) return;
    if (this.mirrorTextOf(buffer) === text) {
      this.#overlay.delete(buffer);
      this.#cancelTimer(buffer);
      this.#notify();
      return;
    }
    this.#overlay.set(buffer, text);
    this.#schedule(buffer);
    this.#notify();
  }

  /** arm one debounce window for the buffer (re-arming supersedes) */
  #schedule(buffer: string): void {
    this.#cancelTimer(buffer);
    const handle = this.#scheduler.setTimeout(() => {
      this.#timers.delete(buffer);
      void this.commitNow(buffer);
    }, this.#debounceMs);
    this.#timers.set(buffer, handle);
  }

  /** commit one buffer's overlay NOW (the debounce fire and the Enter lane) */
  async commitNow(buffer: string): Promise<void> {
    if (this.#disposed || this.#conflicts.has(buffer)) return;
    if (this.#inflight.has(buffer)) {
      // a commit is already running — the finally lane re-arms when it
      // settles, so a fresher overlay is never stranded
      return;
    }
    const desired = this.#overlay.get(buffer);
    if (desired === undefined || this.#info === undefined) return;
    this.#inflight.add(buffer);
    this.#notify();
    try {
      await this.#runLadder(buffer, desired);
    } finally {
      this.#inflight.delete(buffer);
      // the ladder may have left a FRESHER desired text (a keystroke
      // during the flight, or a merged-but-changed rebase): one more
      // window owns it
      if (!this.#disposed && this.#overlay.has(buffer) && !this.#conflicts.has(buffer)) {
        this.#schedule(buffer);
      }
      this.#notify();
    }
  }

  /**
   * The §1/§5 failure ladder for one submission (bounded retries):
   *   200                → import, count my fragment, re-check (merged-
   *                        but-changed buffers re-diff on the loop)
   *   stale-or-unknown-
   *   frontier           → import the carried canonicalUpdate, resubmit
   *   stale-cursor       → re-anchor on retry.cursorBytesB64; a
   *                        `reselect` drops the overlay honestly
   *   conflict           → drop the overlay, sync, raise the card
   *   anything else      → drop the overlay, surface the error
   */
  async #runLadder(buffer: string, desired: string): Promise<void> {
    let attempts = 0;
    let anchorB64: string | undefined;
    for (;;) {
      const current = this.mirrorTextOf(buffer);
      if (current === desired) {
        this.#overlay.delete(buffer);
        return;
      }
      const diff = diffText(current, desired);
      if (diff === null) {
        this.#overlay.delete(buffer);
        return;
      }
      const envelope = this.#envelopeOf(buffer, diff, anchorB64);
      attempts += 1;
      const json = (await this.#transport.post('admit', envelope)) as AdmitJson;
      if (json?.status === 200) {
        this.#import(json.updateB64);
        if (json.syncCursor !== undefined) this.#cursor = json.syncCursor;
        this.#committed.set(buffer, (this.#committed.get(buffer) ?? 0) + 1);
        anchorB64 = undefined;
        // the fragment LANDED and the merge is the new truth: a
        // concurrent non-overlap write that rode along (§6 auto-fusion)
        // survives — the row re-seeds from the mirror on the next
        // snapshot, never force-reverts the merged text to `desired`
        this.#overlay.delete(buffer);
        return;
      }
      const code = json?.code ?? 'unknown';
      if (code === 'stale-or-unknown-frontier') {
        if (attempts >= 3) {
          this.#overlay.delete(buffer);
          this.#error = `the workspace moved three times under this edit — dropped; retry (buffer ${buffer})`;
          return;
        }
        this.#import(json?.canonicalUpdateB64);
        if (json?.syncCursor !== undefined) this.#cursor = json.syncCursor;
        continue; // §5: sync, then resubmit
      }
      if (code === 'stale-cursor') {
        if (json?.retry?.cursorBytesB64 !== undefined && attempts < 3) {
          anchorB64 = json.retry.cursorBytesB64; // the server recomputes the offset from the anchor
          continue;
        }
        this.#overlay.delete(buffer); // `reselect` — the row's identity died
        this.#error = 'the edit anchor moved irrecoverably — reselect and retry';
        return;
      }
      if (code === 'conflict') {
        // §1: drop the pending overlay, rebase on canonical, THEN the card
        this.#overlay.delete(buffer);
        try {
          await this.syncNow();
        } catch {
          /* the card still stands on the conflict body's currentText */
        }
        const detail = json?.conflict;
        const theirs = this.mirrorTextOf(buffer) || detail?.currentText || '';
        // the tail is COMPONENT-granularity (tailFor spans every buffer
        // of the component) — the 旧值 row must read the CONFLICTED
        // buffer's own history, never a sibling buffer's value (the
        // walkthrough catch: a raised-buffer row leaked into a variant
        // conflict's 旧值)
        const priorRow = detail?.tail.find((row) => row.buffer === buffer);
        this.#conflicts.set(buffer, {
          buffer,
          oldValue: priorRow?.value ?? theirs,
          mine: desired,
          theirs,
          actors: [...new Set((detail?.committed ?? []).map((op) => op.actor))],
          resolving: false,
        });
        return;
      }
      this.#overlay.delete(buffer);
      this.#error = json?.detail ?? `edit rejected (${code})`;
      return;
    }
  }

  /** one §4 text-op envelope (JSON form — collab-api.ts's contract) */
  #envelopeOf(buffer: string, diff: TextDiff, anchorB64: string | undefined): Record<string, unknown> {
    const info = this.#info!;
    const container = this.#doc.getText(containerKeyOf(info.componentId, buffer));
    const cursor = container.getCursor(diff.offset, 0);
    if (cursor === undefined) {
      throw new Error(`cannot anchor at offset ${diff.offset} of buffer ${buffer}`);
    }
    this.#seq += 1;
    return {
      actor: PANEL_ACTOR,
      opId: `panel:${this.#sessionId}:${this.#seq}`,
      baseFrontiers: this.#doc.frontiers() as unknown,
      domain: 'text',
      kind: diff.kind,
      target: { componentId: info.componentId, buffer },
      cursorBytesB64: anchorB64 ?? bytesToB64(cursor.encode()),
      offset: diff.offset,
      length: diff.length,
      text: diff.text,
      timestamp: Date.now(),
      ...(this.#cursor !== undefined ? { syncCursor: this.#cursor } : {}),
      ...(this.#presenceHint !== null
        ? { sessionHint: { playerId: this.#presenceHint.playerId, field: attentionFieldOf(buffer, info.buffers.find((candidate) => candidate.buffer === buffer)?.how), digest: `${info.componentId} · ${buffer}=${diff.text}` } }
        : {}),
    };
  }

  /* ── the materialize lane (design-studio-acceptance-fixes §3) ────────── */

  /**
   * Materialize one not-yet-editable prop (a bare boolean or an absent
   * prop the schema knows) into an addressable buffer through the
   * server-side COMPOSITE transaction (tree update + the new hole's
   * text insert, one atomic rollback group). The opId is the endpoint's
   * idempotency key (`panel:<session>:m<seq>` — the #envelopeOf
   * namespace); the response's update imports into the mirror like any
   * admit receipt. The buffer SET changed, so the caller MUST re-seed
   * (/usage + seed) after a `true` return — the new prop then rides the
   * ordinary toggle/input channel; unchecking is a `true→false` replace,
   * never an attribute removal (the buffer law).
   *
   * Returns false on rejection with `snapshot().error` carrying the
   * server's reason (non-silent by contract).
   */
  async materialize(prop: string, value: PropValue): Promise<boolean> {
    this.#assertLive();
    const info = this.#info;
    if (info === undefined) throw new Error('the panel collab client has no usage to materialize against — seed it first');
    this.#seq += 1;
    const json = (await this.#transport.post('materialize', {
      file: info.page,
      componentId: info.componentId,
      prop,
      value,
      opId: `panel:${this.#sessionId}:m${this.#seq}`,
      timestamp: Date.now(),
      ...(this.#cursor !== undefined ? { syncCursor: this.#cursor } : {}),
      ...(this.#presenceHint !== null
        ? { sessionHint: { playerId: this.#presenceHint.playerId, field: `prop-${prop}`, digest: `${info.componentId} · ${prop}=${String(value)}` } }
        : {}),
    })) as MaterializeJson;
    if (json?.status === 200) {
      this.#import(json.updateB64);
      if (json.syncCursor !== undefined) this.#cursor = json.syncCursor;
      this.#error = null;
      this.#notify();
      return true;
    }
    this.#error = json?.message ?? json?.detail ?? `materialize rejected (${String(json?.reason ?? json?.code ?? 'unknown')})`;
    this.#notify();
    return false;
  }

  /* ── the §6 conflict card resolutions ───────────────────────────────── */

  /**
   * 「用我的」 (override, 保自己): withdraw the human actor's interleaved
   * fragments through the undo face's UndoManager lane (only this
   * peer's ops revert — the agent's landed write survives), then
   * re-assert the desired text on current canonical.
   */
  async chooseOverride(buffer: string): Promise<void> {
    await this.#resolveConflict(buffer, async (card) => {
      while ([...this.#committed.values()].some((count) => count > 0)) {
        const performed = await this.#undoOne();
        if (!performed) break;
      }
      // the card's suspension is lifted for the re-assert itself; a
      // mid-assert race raises a FRESH card through the ladder
      this.#conflicts.delete(buffer);
      this.#overlay.set(buffer, card.mine);
      await this.commitNow(buffer);
    });
  }

  /**
   * 「用 Agent 的」 (give-up, 接受对方): drop the pending edit and accept
   * the canonical text — the landed write stands as-is.
   */
  async chooseGiveUp(buffer: string): Promise<void> {
    await this.#resolveConflict(buffer, async () => {
      this.#overlay.delete(buffer);
    });
  }

  async #resolveConflict(buffer: string, drive: (card: PanelConflictState) => Promise<void>): Promise<void> {
    const card = this.#conflicts.get(buffer);
    if (card === undefined || card.resolving || this.#disposed) return;
    this.#conflicts.set(buffer, { ...card, resolving: true });
    this.#notify();
    try {
      await this.syncNow();
      await drive(card);
      this.#conflicts.delete(buffer);
      this.#error = null;
    } catch (cause) {
      this.#conflicts.set(buffer, { ...card, resolving: false });
      this.#error = cause instanceof Error ? cause.message : String(cause);
    }
    this.#notify();
  }

  /** one override-undo through the face; true when something was undone */
  async #undoOne(): Promise<boolean> {
    this.#seq += 1;
    // the client's cursor rides the request: without it the receipt's
    // update exports as a shallow SNAPSHOT the mirror cannot apply over
    // its own deeper history (a stale mirror anchors the next op wrong)
    const json = (await this.#transport.post('undo', {
      mode: 'override-undo',
      actor: PANEL_ACTOR,
      opId: `panel:${this.#sessionId}:undo${this.#seq}`,
      ...(this.#cursor !== undefined ? { syncCursor: this.#cursor } : {}),
    })) as UndoJson;
    if (json?.status !== 'performed' || json.receipt === undefined) return false;
    this.#import(json.receipt.updateB64);
    if (json.receipt.syncCursor !== undefined) this.#cursor = json.receipt.syncCursor;
    // the receipt names the buffer the undone op touched (its target)
    const receipt = json.receipt as { readonly target?: { readonly buffer?: string } };
    const touched = receipt.target?.buffer;
    if (touched !== undefined) {
      this.#committed.set(touched, Math.max(0, (this.#committed.get(touched) ?? 1) - 1));
    } else {
      for (const [key, count] of this.#committed) this.#committed.set(key, Math.max(0, count - 1));
    }
    return true;
  }

  /* ── lifecycle ───────────────────────────────────────────────────────── */

  #cancelTimer(buffer: string): void {
    const handle = this.#timers.get(buffer);
    if (handle !== undefined) {
      this.#scheduler.clearTimeout(handle);
      this.#timers.delete(buffer);
    }
  }

  #assertLive(): void {
    if (this.#disposed) throw new Error('the panel collab client is disposed');
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    for (const buffer of [...this.#timers.keys()]) this.#cancelTimer(buffer);
    this.#listeners.clear();
  }

  get disposed(): boolean {
    return this.#disposed;
  }
}
