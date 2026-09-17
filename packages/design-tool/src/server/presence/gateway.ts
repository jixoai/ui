/**
 * @jixoai/ui-design (server/presence) — the WebSocket presence gateway
 * (collab-presence design.md §1/§3: 中心化网关 + Player 在场).
 *
 * Orthogonal intents (4):
 *   1. FROZEN VOCABULARY — the `/__design__/ws` JSON message shapes of
 *      design.md §1 (C→S cursor/attention/virtual-mouse/ping; S→C
 *      welcome/join/leave/presence/journal-tail, plus the ping→pong
 *      ack the task brief pins). Tagged-union protocol style; inbound
 *      frames are structurally narrowed, never trusted. This file is
 *      the server-side half of the shared boundary with the studio
 *      client — field names and semantics must not drift from the
 *      frozen design.
 *   2. PURE MAPPING — actor→Player and op-target→focus derivations for
 *      the admission hook (design.md §3): a sessionHint playerId wins,
 *      then a registered ai actor binding, else NO ghost (journal-tail
 *      only). Exported as pure functions for unit tests.
 *   3. WS SERVING + BROADCAST — `ws` over the DESIGN SERVER'S OWN
 *      http server: an 'upgrade' listener that answers ONLY the
 *      presence path (every other upgrade — Vite HMR included — passes
 *      through untouched). join/leave are immediate; cursor/attention/
 *      virtual-mouse merge into one presence frame per player per
 *      ~50ms window; missing pings sweep a player out after the
 *      offline timeout (leave broadcast + memory removal — the ledger
 *      identity survives for a same-token reconnect). WS is NEVER the
 *      edit path: op admission stays on HTTP, a gateway fault stays in
 *      the gateway.
 *   4. PROCESS REGISTRY — one gateway per design workspace (the
 *      collab-host precedent): `findPresenceGateway(designDir)` is how
 *      the collab API lane, the §8 host cycle and the dsh agent reach
 *      the notify hooks without wiring.
 *
 * Original need: collab-presence (2026-09-17).
 */

import type { IncomingMessage, Server } from 'node:http';
import type { Duplex } from 'node:stream';
import { resolve } from 'node:path';

import { WebSocket, WebSocketServer } from 'ws';

import { PresenceLedger, type PresenceKind } from './ledger.ts';

/* ── the frozen §1 vocabulary ───────────────────────────────────────────── */

/** the one upgrade path this gateway owns (design.md §1) */
export const PRESENCE_WS_PATH = '/__design__/ws';

/** a cursor report — document coordinates inside `surface` */
export interface CursorState {
  readonly surface: string;
  readonly x: number;
  readonly y: number;
}

/** where a Player's attention sits — canvas usage or panel field (§1) */
export type AttentionFocus = CanvasFocus | PanelFocus;

export interface CanvasFocus {
  readonly kind: 'canvas';
  /** the protocol componentId (the native id attribute, e.g. "a4") */
  readonly component: string;
  /** null — an op envelope carries no usage index; the overlay locates
   *  the element by `[id=componentId]` across documents */
  readonly instance: number | null;
  readonly frameId: string | null;
}

export interface PanelFocus {
  readonly kind: 'panel';
  readonly field: string;
  readonly digest: string;
}

/** the roster face (§1 PlayerView — cursor lives in the presence stream) */
export interface PlayerView {
  readonly playerId: string;
  readonly name: string;
  readonly kind: PresenceKind;
  readonly colorHue: number;
  readonly hasMouse: boolean;
  readonly attention: AttentionFocus | null;
}

/** C→S frames (§1) */
export type PresenceClientMessage = ClientCursor | ClientAttention | ClientVirtualMouse | ClientPing;

interface ClientCursor {
  readonly type: 'cursor';
  readonly surface: string;
  readonly x: number;
  readonly y: number;
}
interface ClientAttention {
  readonly type: 'attention';
  readonly focus: AttentionFocus;
}
interface ClientVirtualMouse {
  readonly type: 'virtual-mouse';
  readonly enabled: boolean;
}
interface ClientPing {
  readonly type: 'ping';
}

/** S→C frames (§1 + the brief's ping→pong ack) */
export type PresenceServerMessage =
  | { readonly type: 'welcome'; readonly playerId: string; readonly token: string; readonly colorHue: number; readonly players: readonly PlayerView[] }
  | { readonly type: 'join'; readonly player: PlayerView }
  | { readonly type: 'leave'; readonly playerId: string }
  | { readonly type: 'presence'; readonly playerId: string; readonly cursor: CursorState | null; readonly attention: AttentionFocus | null; readonly hasMouse: boolean }
  | { readonly type: 'journal-tail'; readonly seq: number }
  | { readonly type: 'pong' };

/* ── structural narrowing of untrusted frames ───────────────────────────── */

const isObj = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isStr = (value: unknown): value is string => typeof value === 'string';
const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

/** the focus validator — shared by inbound frames and derived focuses */
export function isValidFocus(value: unknown): value is AttentionFocus {
  if (!isObj(value)) return false;
  if (value.kind === 'canvas') {
    return isStr(value.component) && value.component.length > 0 && (value.instance === null || Number.isInteger(value.instance)) && (value.frameId === null || isStr(value.frameId));
  }
  if (value.kind === 'panel') {
    return isStr(value.field) && value.field.length > 0 && isStr(value.digest);
  }
  return false;
}

/** narrow one parsed C→S frame; junk answers undefined (ignored, never fatal) */
export function parseClientMessage(value: unknown): PresenceClientMessage | undefined {
  if (!isObj(value)) return undefined;
  switch (value.type) {
    case 'ping':
      return { type: 'ping' };
    case 'cursor':
      if (!isStr(value.surface) || value.surface.length === 0 || !isFiniteNumber(value.x) || !isFiniteNumber(value.y)) return undefined;
      return { type: 'cursor', surface: value.surface, x: value.x, y: value.y };
    case 'attention':
      return isValidFocus(value.focus) ? { type: 'attention', focus: value.focus } : undefined;
    case 'virtual-mouse':
      return typeof value.enabled === 'boolean' ? { type: 'virtual-mouse', enabled: value.enabled } : undefined;
    default:
      return undefined;
  }
}

/* ── the admission-hook mapping (design.md §3 — pure, unit-tested) ──────── */

/**
 * The op-origin hint the panel may attach to a commit: its own playerId
 * plus the field it is editing. `playerId` is the v1 identity mapping
 * (the panel op's sessionHint IS the playerId — design.md §3).
 */
export interface SessionHint {
  readonly playerId?: string;
  readonly field?: string;
  readonly digest?: string;
}

/** one row of the actor→player resolution index (the gateway's live set) */
export interface PlayerIndexEntry {
  readonly playerId: string;
  readonly kind: PresenceKind;
  /** server-held actor binding (the dsh lane's registered ai Player) */
  readonly boundActor?: string;
  readonly present: boolean;
}

/**
 * actor → playerId (design.md §3): the sessionHint's playerId wins when
 * that player is present; then a registered actor binding; else NOTHING
 * — an unmappable actor never gets a ghost (journal-tail only).
 */
export function mapActorToPlayerId(actor: string, sessionHint: SessionHint | undefined, players: readonly PlayerIndexEntry[]): string | undefined {
  const hinted = sessionHint?.playerId;
  if (hinted !== undefined && hinted.length > 0) {
    const entry = players.find((player) => player.playerId === hinted);
    if (entry !== undefined && entry.present) return entry.playerId;
  }
  return players.find((player) => player.boundActor === actor)?.playerId;
}

/**
 * op target → attention focus (design.md §3/§5): a panel-origin op (the
 * sessionHint carries a field) focuses the panel field; anything else
 * focuses the canvas usage the op's target names. The canvas `component`
 * carries the protocol's componentId (the native usage identity — the
 * server cannot cheaply recover the tag name); instance/frameId stay
 * NULL — an op envelope knows neither, and the acceptance matrix caught
 * a hardcoded instance pinning every ring onto usage #1. The overlay
 * resolves the DOM box by `[id=componentId]` ACROSS documents.
 */
export function focusFromOpTarget(target: { readonly componentId: string; readonly buffer?: string }, sessionHint: SessionHint | undefined): AttentionFocus {
  const field = sessionHint?.field;
  if (field !== undefined && field.length > 0) {
    return { kind: 'panel', field, digest: sessionHint?.digest ?? '' };
  }
  return { kind: 'canvas', component: target.componentId, instance: null, frameId: null };
}

/* ── the gateway ────────────────────────────────────────────────────────── */

export interface PresenceGatewayOptions {
  /** the design workspace root — the ledger lives under its `.jx-collab/` */
  readonly designDir: string;
  /** per-player presence merge window in ms (default 50 — design.md §3) */
  readonly presenceWindowMs?: number;
  /** offline timeout for missing pings in ms (default 5000 — design.md §2) */
  readonly offlineTimeoutMs?: number;
  /** the clock seam — deterministic tests */
  readonly clock?: () => number;
  /** the timer seam — deterministic tests */
  readonly scheduler?: { setTimeout(fn: () => void, ms: number): unknown; clearTimeout(handle: unknown): void };
}

/** the notify face the admission lanes consume (never throws into a caller) */
export interface PresenceGateway {
  /** broadcast {journal-tail, seq} when seq advances (deduped) */
  notifyJournalTail(seq: number): void;
  /** the commit-success hook: journal-tail + the actor→player attention relay */
  notifyCommit(input: { readonly seq: number; readonly actor: string; readonly target: { readonly componentId: string; readonly buffer?: string }; readonly sessionHint?: SessionHint }): void;
  /** the server-held ai Player (design.md §5 — the dsh lane); idempotent */
  registerAiPlayer(input: { readonly name: string; readonly actor: string }): string;
  /** stop serving, release every handle, unregister (idempotent) */
  close(): void;
  /** close() ran — cleanup evidence for tests/embedders */
  readonly closed: boolean;
}

/** one live player — a WS connection, or a server-held ai identity */
interface LivePlayer {
  readonly playerId: string;
  readonly name: string;
  readonly kind: PresenceKind;
  readonly colorHue: number;
  ws: WebSocket | null;
  boundActor: string | undefined;
  lastPing: number;
  cursor: CursorState | null;
  attention: AttentionFocus | null;
  hasMouse: boolean;
  flushHandle: unknown | null;
  /** a superseded/closing socket leaves silently (no leave broadcast) */
  silent: boolean;
}

const DEFAULT_PRESENCE_WINDOW_MS = 50;
const DEFAULT_OFFLINE_TIMEOUT_MS = 5_000;

class PresenceGatewayImpl implements PresenceGateway {
  readonly #ledger: PresenceLedger;
  readonly #wss: WebSocketServer;
  readonly #httpServer: Server;
  /** the registry key this instance closes out of */
  readonly #key: string;
  readonly #live = new Map<string, LivePlayer>();
  readonly #presenceWindowMs: number;
  readonly #offlineTimeoutMs: number;
  readonly #clock: () => number;
  readonly #scheduler: { setTimeout(fn: () => void, ms: number): unknown; clearTimeout(handle: unknown): void };
  readonly #sweep: ReturnType<typeof setInterval>;
  #lastSeq = 0;
  #closed = false;

  constructor(httpServer: Server, options: PresenceGatewayOptions) {
    this.#httpServer = httpServer;
    this.#key = resolve(options.designDir);
    this.#ledger = new PresenceLedger(options.designDir);
    this.#presenceWindowMs = options.presenceWindowMs ?? DEFAULT_PRESENCE_WINDOW_MS;
    this.#offlineTimeoutMs = options.offlineTimeoutMs ?? DEFAULT_OFFLINE_TIMEOUT_MS;
    this.#clock = options.clock ?? (() => Date.now());
    this.#scheduler = options.scheduler ?? {
      setTimeout: (fn, ms) => setTimeout(fn, ms),
      clearTimeout: (handle) => clearTimeout(handle as Parameters<typeof clearTimeout>[0]),
    };
    if (this.#ledger.recoveryNote !== undefined) {
      console.error(`[design-presence] ${this.#ledger.recoveryNote}`);
    }

    // 64KiB inbound cap (the "inbound never trusted" posture — a
    // hostile oversized frame must not wedge the event loop)
    this.#wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
    this.#wss.on('connection', (ws, request) => this.#onConnection(ws, request));
    this.#httpServer.on('upgrade', this.#onUpgrade);

    // the offline law (design.md §2): 5s without a ping → leave broadcast
    // + memory removal. unref'd — the sweep never holds the process
    this.#sweep = setInterval(() => this.#sweepOffline(), Math.max(50, Math.floor(this.#offlineTimeoutMs / 2)));
    this.#sweep.unref();
  }

  get closed(): boolean {
    return this.#closed;
  }

  /* ── upgrade routing (§3 — every other ws passes untouched) ──────────── */

  readonly #onUpgrade = (req: IncomingMessage, socket: Duplex, head: Buffer): void => {
    let url: URL;
    try {
      url = new URL(req.url ?? '/', 'http://localhost');
    } catch {
      return;
    }
    if (url.pathname !== PRESENCE_WS_PATH) return; // Vite HMR & friends pass through
    this.#wss.handleUpgrade(req, socket, head, (ws) => {
      this.#wss.emit('connection', ws, req);
    });
  };

  #onConnection(ws: WebSocket, request: IncomingMessage): void {
    if (this.#closed) {
      ws.close(1001, 'gateway closed');
      return;
    }
    let params: URLSearchParams;
    try {
      params = new URL(request.url ?? '/', 'http://localhost').searchParams;
    } catch {
      params = new URLSearchParams();
    }
    const name = params.get('name') ?? undefined;
    const kind: PresenceKind = params.get('kind') === 'ai' ? 'ai' : 'human';
    const tokenParam = params.get('token') ?? undefined;

    let identity;
    try {
      identity = this.#ledger.restoreOrCreate({ name, kind, token: tokenParam });
    } catch (error) {
      // ledger fs failure degrades THIS connection only — never the server
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[design-presence] identity resolution failed (${message}) — connection refused`);
      ws.close(1011, 'ledger unavailable');
      return;
    }

    // a same-token reconnect while the old socket lingers: the identity is
    // reused, the stale socket leaves silently, the roster sees one player
    const stale = this.#live.get(identity.record.playerId);
    if (stale !== undefined) {
      stale.silent = true;
      if (stale.flushHandle !== null) this.#scheduler.clearTimeout(stale.flushHandle);
      this.#live.delete(stale.playerId);
      stale.ws?.terminate();
    }

    const player: LivePlayer = {
      playerId: identity.record.playerId,
      name: identity.record.name,
      kind: identity.record.kind,
      colorHue: identity.record.colorHue,
      ws,
      boundActor: undefined,
      lastPing: this.#clock(),
      cursor: null,
      attention: null,
      hasMouse: identity.record.kind === 'human',
      flushHandle: null,
      silent: false,
    };
    this.#live.set(player.playerId, player);

    // §1: welcome carries the self identity (token disclosed once) + the
    // full roster; the roster is told about the newcomer immediately
    this.#send(ws, { type: 'welcome', playerId: player.playerId, token: identity.token, colorHue: player.colorHue, players: this.#views() });
    this.#broadcast({ type: 'join', player: this.#viewOf(player) }, player.playerId);

    ws.on('message', (data) => {
      player.lastPing = this.#clock(); // any frame is liveness — ping is the keepalive floor
      let parsed: unknown;
      try {
        const text = typeof data === 'string' ? data : Array.isArray(data) ? Buffer.concat(data).toString('utf8') : Buffer.from(data).toString('utf8');
        parsed = JSON.parse(text);
      } catch {
        return; // junk frame — ignored, never fatal
      }
      const message = parseClientMessage(parsed);
      if (message === undefined) return;
      switch (message.type) {
        case 'ping':
          this.#send(ws, { type: 'pong' });
          break;
        case 'cursor':
          player.cursor = { surface: message.surface, x: message.x, y: message.y };
          this.#armPresenceFlush(player);
          break;
        case 'attention':
          player.attention = message.focus;
          this.#armPresenceFlush(player);
          break;
        case 'virtual-mouse':
          player.hasMouse = message.enabled;
          this.#armPresenceFlush(player);
          break;
      }
    });
    ws.on('close', () => {
      if (this.#live.get(player.playerId) !== player) return; // already superseded
      this.#live.delete(player.playerId);
      if (player.flushHandle !== null) {
        this.#scheduler.clearTimeout(player.flushHandle);
        player.flushHandle = null;
      }
      if (player.silent || this.#closed) return;
      this.#broadcast({ type: 'leave', playerId: player.playerId });
    });
    ws.on('error', () => {
      /* protocol-level noise; 'close' follows and owns the leave lane */
    });
  }

  /* ── broadcast laws (§3) ─────────────────────────────────────────────── */

  #viewOf(player: LivePlayer): PlayerView {
    return { playerId: player.playerId, name: player.name, kind: player.kind, colorHue: player.colorHue, hasMouse: player.hasMouse, attention: player.attention };
  }

  #views(): PlayerView[] {
    return [...this.#live.values()].map((player) => this.#viewOf(player));
  }

  #send(ws: WebSocket, message: PresenceServerMessage): void {
    if (ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify(message));
    } catch {
      /* a dead socket's send failure is the close lane's business */
    }
  }

  /** fan out to every connected player (optionally excluding one) */
  #broadcast(message: PresenceServerMessage, exceptPlayerId?: string): void {
    const text = JSON.stringify(message);
    for (const player of this.#live.values()) {
      if (player.playerId === exceptPlayerId) continue;
      const ws = player.ws;
      if (ws === null || ws.readyState !== WebSocket.OPEN) continue;
      try {
        ws.send(text);
      } catch {
        /* never fatal — the close lane owns the roster */
      }
    }
  }

  /** the ~50ms merge window: bursts collapse into ONE presence frame (latest state wins) */
  #armPresenceFlush(player: LivePlayer): void {
    if (player.flushHandle !== null) return;
    player.flushHandle = this.#scheduler.setTimeout(() => {
      player.flushHandle = null;
      this.#broadcast({ type: 'presence', playerId: player.playerId, cursor: player.cursor, attention: player.attention, hasMouse: player.hasMouse }, player.playerId);
    }, this.#presenceWindowMs);
  }

  /** immediate presence relay (commit-derived attention — low frequency by construction) */
  #flushPresenceNow(player: LivePlayer): void {
    if (player.flushHandle !== null) {
      this.#scheduler.clearTimeout(player.flushHandle);
      player.flushHandle = null;
    }
    this.#broadcast({ type: 'presence', playerId: player.playerId, cursor: player.cursor, attention: player.attention, hasMouse: player.hasMouse }, player.playerId);
  }

  #sweepOffline(): void {
    const now = this.#clock();
    for (const player of [...this.#live.values()]) {
      if (player.ws === null) continue; // server-held players never time out
      if (now - player.lastPing > this.#offlineTimeoutMs) {
        player.silent = false; // a timeout IS a leave (§2: 摘除广播 leave)
        player.ws.terminate(); // 'close' broadcasts the leave
      }
    }
  }

  /* ── the notify face (admission lanes — never throws) ────────────────── */

  notifyJournalTail(seq: number): void {
    if (this.#closed) return;
    if (!Number.isInteger(seq) || seq < 0) return;
    if (seq <= this.#lastSeq) return; // dedupe: one broadcast per seq advance
    this.#lastSeq = seq;
    this.#broadcast({ type: 'journal-tail', seq });
  }

  notifyCommit(input: { readonly seq: number; readonly actor: string; readonly target: { readonly componentId: string; readonly buffer?: string }; readonly sessionHint?: SessionHint }): void {
    if (this.#closed) return;
    this.notifyJournalTail(input.seq);
    const playerId = mapActorToPlayerId(input.actor, input.sessionHint, this.#index());
    if (playerId === undefined) return; // 映射不到就只发 journal-tail，不造 ghost
    const player = this.#live.get(playerId);
    if (player === undefined) return;
    player.attention = focusFromOpTarget(input.target, input.sessionHint);
    this.#flushPresenceNow(player);
  }

  registerAiPlayer(input: { readonly name: string; readonly actor: string }): string {
    let record;
    try {
      record = this.#ledger.ensureServerPlayer(input.name);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[design-presence] server player registration failed (${message})`);
      return '';
    }
    let player = this.#live.get(record.playerId);
    if (player === undefined) {
      player = {
        playerId: record.playerId,
        name: record.name,
        kind: record.kind,
        colorHue: record.colorHue,
        ws: null,
        boundActor: input.actor,
        lastPing: this.#clock(),
        cursor: null,
        attention: null,
        hasMouse: false, // §5: ai players start mouseless (virtual-mouse registers one)
        flushHandle: null,
        silent: false,
      };
      this.#live.set(player.playerId, player);
      this.#broadcast({ type: 'join', player: this.#viewOf(player) });
      return player.playerId;
    }
    player.boundActor = input.actor; // idempotent re-registration rebinds only
    return player.playerId;
  }

  #index(): PlayerIndexEntry[] {
    return [...this.#live.values()].map((player) => ({
      playerId: player.playerId,
      kind: player.kind,
      ...(player.boundActor !== undefined ? { boundActor: player.boundActor } : {}),
      present: true,
    }));
  }

  /* ── teardown ────────────────────────────────────────────────────────── */

  close(): void {
    if (this.#closed) return;
    this.#closed = true;
    this.#httpServer.off('upgrade', this.#onUpgrade);
    clearInterval(this.#sweep);
    for (const player of this.#live.values()) {
      if (player.flushHandle !== null) this.#scheduler.clearTimeout(player.flushHandle);
      player.ws?.terminate(); // 'close' handlers see #closed → silent leave
    }
    this.#live.clear();
    this.#wss.close();
    if (registry.get(this.#key) === this) registry.delete(this.#key);
  }
}

/* ── the process-level registry (one gateway per design workspace) ─────── */

const registry = new Map<string, PresenceGatewayImpl>();

/** lookup WITHOUT creating — the admission lanes' probe */
export function findPresenceGateway(designDir: string): PresenceGateway | undefined {
  return registry.get(resolve(designDir));
}

/**
 * Attach the presence gateway to a design server's http server. The
 * upgrade listener is path-scoped — every other websocket (Vite HMR
 * included) passes through untouched. Idempotent per workspace (the
 * collab-host precedent): a second attach returns the live gateway;
 * `close()` releases the entry (a later attach mints a fresh one).
 */
export function attachPresenceGateway(httpServer: Server, options: PresenceGatewayOptions): PresenceGateway {
  const key = resolve(options.designDir);
  const existing = registry.get(key);
  if (existing !== undefined) return existing;
  const gateway = new PresenceGatewayImpl(httpServer, options);
  registry.set(key, gateway);
  return gateway;
}
