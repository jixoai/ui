/**
 * @jixoai/ui-design (studio) — the presence store (collab-presence
 * design.md §4): the browser-side half of the `/__design__/ws`
 * vocabulary (§1, FROZEN — the shared boundary with the gateway).
 *
 * Orthogonal intents (3):
 *   1. VOCABULARY — the §1 tagged-union messages, parsed and emitted
 *      exactly as frozen: welcome/join/leave/presence/journal-tail on
 *      the server side, cursor/attention/virtual-mouse/ping on the
 *      client side. The message codec is exported PURE (parseServer /
 *      buildClient) so the contract is node-testable without a socket.
 *   2. STATE MACHINE — self {playerId, colorHue, name} + the players
 *      table (PlayerView & {cursor, online}). welcome rebuilds the
 *      table from the server's truth; join/leave toggle online (a
 *      left player KEEPS its row — the chip list shows the offline
 *      state, the indicators drop); presence merges cursor/attention/
 *      hasMouse per player. A disconnect marks every player offline
 *      and schedules the reconnect — the editing lane (HTTP ops)
 *      never rode this socket, so degradation is silent-by-design.
 *   3. LIFECYCLE — connect with the sessionStorage token (reconnects
 *      resume the SAME identity: same playerId, same hue), exponential
 *      backoff (500ms·2^n capped at 15s), a ~2.5s ping keeping the
 *      gateway's 5s timeout fed, and a 16ms trailing throttle on
 *      cursor reports. The WebSocket factory, the scheduler and the
 *      storage are all injected seams — the whole machine runs under
 *      node:test against structural fakes (the panel-collab style).
 *
 * Original need: collab-presence task group 2 (2026-09-16). Framework
 * agnostic on purpose: the shell subscribes; nothing here knows svelte.
 */

/* ── the §1 frozen vocabulary (design.md) ────────────────────────────── */

export type PlayerKind = 'human' | 'ai';

/** cursors are CANVAS-SCOPED (presence-visuals ruling 2): a cursor names
 *  the canvas it lives on — players on another page are invisible to each
 *  other, and nothing ever spills onto the studio chrome (the shell
 *  surface is retired) */
export type CursorSurface = 'canvas' | `frame:${string}`;

export interface CursorState {
  readonly canvas: string;
  readonly surface: CursorSurface;
  readonly x: number;
  readonly y: number;
}

export type AttentionFocus =
  | { readonly kind: 'canvas'; readonly component: string; readonly instance: number | null; readonly frameId: string | null }
  | PanelCaretFocus;

/** §1 PlayerView — the identity card (cursor rides the presence stream) */
export interface PlayerView {
  readonly playerId: string;
  readonly name: string;
  readonly kind: PlayerKind;
  readonly colorHue: number;
  readonly hasMouse: boolean;
  /** the join-time snapshot (walkthrough R2): the roster carries each
   *  player's parked cursor so a newcomer renders idle players without
   *  waiting for their next move; optional for older gateways */
  readonly cursor?: CursorState | null;
  readonly attention: AttentionFocus | null;
}

/** the store's table row: PlayerView + the live presence stream state */
export interface RemotePlayer extends PlayerView {
  readonly cursor: CursorState | null;
  readonly online: boolean;
}

export interface SelfView {
  readonly playerId: string;
  readonly name: string;
  readonly kind: PlayerKind;
  readonly colorHue: number;
}

export type PresenceStatus = 'idle' | 'connecting' | 'online' | 'offline';

export interface PresenceSnapshot {
  readonly status: PresenceStatus;
  readonly self: SelfView | null;
  readonly players: readonly RemotePlayer[];
}

/* ── the message codec (PURE — the node-tested §1 boundary) ──────────── */

export type ServerMessage =
  | { readonly type: 'welcome'; readonly playerId: string; readonly token: string; readonly colorHue: number; readonly players: readonly PlayerView[] }
  | { readonly type: 'join'; readonly player: PlayerView }
  | { readonly type: 'leave'; readonly playerId: string }
  | { readonly type: 'presence'; readonly playerId: string; readonly cursor: CursorState | null; readonly attention: AttentionFocus | null; readonly hasMouse: boolean }
  | { readonly type: 'journal-tail'; readonly seq: number };

/** parse one S→C frame; null on anything off-vocabulary (junk is dropped, never fatal) */
export function parseServerMessage(raw: string): ServerMessage | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (data === null || typeof data !== 'object') return null;
  const message = data as Record<string, unknown>;
  switch (message.type) {
    case 'welcome':
      if (typeof message.playerId !== 'string' || typeof message.token !== 'string' || typeof message.colorHue !== 'number') return null;
      if (!Array.isArray(message.players)) return null;
      return {
        type: 'welcome',
        playerId: message.playerId,
        token: message.token,
        colorHue: message.colorHue,
        players: message.players.filter(isPlayerView),
      };
    case 'join': {
      const player = message.player;
      return isPlayerView(player) ? { type: 'join', player } : null;
    }
    case 'leave':
      return typeof message.playerId === 'string' ? { type: 'leave', playerId: message.playerId } : null;
    case 'presence': {
      if (typeof message.playerId !== 'string' || typeof message.hasMouse !== 'boolean') return null;
      const cursor = message.cursor;
      const attention = message.attention;
      // off-vocabulary members reject the WHOLE frame (a bogus surface
      // or attention shape is a protocol break, not a degraded payload)
      if (cursor !== null && cursor !== undefined && !isCursor(cursor)) return null;
      if (attention !== null && attention !== undefined && !isAttention(attention)) return null;
      return {
        type: 'presence',
        playerId: message.playerId,
        cursor: cursor === null || cursor === undefined ? null : cursor,
        attention: attention === null || attention === undefined ? null : attention,
        hasMouse: message.hasMouse,
      };
    }
    case 'journal-tail':
      return typeof message.seq === 'number' ? { type: 'journal-tail', seq: message.seq } : null;
    default:
      return null;
  }
}

/** one C→S frame (§1 shapes verbatim) */
export function buildClientMessage(message: ClientMessage): string {
  return JSON.stringify(message);
}

export type ClientMessage =
  | { readonly type: 'cursor'; readonly canvas: string; readonly surface: CursorSurface; readonly x: number; readonly y: number }
  | { readonly type: 'attention'; readonly focus: AttentionFocus | null }
  | { readonly type: 'virtual-mouse'; readonly enabled: boolean }
  | { readonly type: 'ping' };

function isPlayerView(value: unknown): value is PlayerView {
  if (value === null || typeof value !== 'object') return false;
  const player = value as Record<string, unknown>;
  if (
    typeof player.playerId === 'string' &&
    typeof player.name === 'string' &&
    (player.kind === 'human' || player.kind === 'ai') &&
    typeof player.colorHue === 'number' &&
    typeof player.hasMouse === 'boolean' &&
    (player.attention === null || player.attention === undefined || isAttention(player.attention))
  ) {
    // the snapshot cursor (walkthrough R2): validated when present, its
    // absence tolerated — the roster degrades to attention-only
    return player.cursor === null || player.cursor === undefined || isCursor(player.cursor);
  }
  return false;
}

/** panel focus deepens with the remote text caret (presence-visuals
 *  ruling 4): an optional non-negative integer offset */
/** panel focus carries the remote SELECTION (P4): {start, end} — equal
 *  ends are a collapsed caret; a range is a selection highlight */
export interface PanelCaretFocus {
  readonly kind: 'panel';
  readonly field: string;
  readonly digest: string;
  readonly selection?: { readonly start: number; readonly end: number };
}

function isCursor(value: unknown): value is CursorState {
  if (value === null || typeof value !== 'object') return false;
  const cursor = value as Record<string, unknown>;
  if (typeof cursor.surface !== 'string' || typeof cursor.x !== 'number' || typeof cursor.y !== 'number') return false;
  if (typeof cursor.canvas !== 'string' || cursor.canvas.length === 0) return false; // canvas-scoped since presence-visuals
  return cursor.surface === 'canvas' || cursor.surface.startsWith('frame:');
}

/** the focus validator — the gateway's isValidFocus law, mirrored
 *  client-side (Codex R1 N2: the inbound mirror must not be weaker
 *  than the server's; a damaged presence frame must die at the store,
 *  never reach the caret measurement) */
function isAttention(value: unknown): value is AttentionFocus {
  if (value === null || typeof value !== 'object') return false;
  const attention = value as Record<string, unknown>;
  if (attention.kind === 'canvas') {
    return typeof attention.component === 'string' && attention.component.length > 0
      && (attention.instance === null || (typeof attention.instance === 'number' && Number.isInteger(attention.instance)))
      && (attention.frameId === null || typeof attention.frameId === 'string');
  }
  if (attention.kind === 'panel') {
    if (typeof attention.field !== 'string' || attention.field.length === 0 || typeof attention.digest !== 'string') return false;
    const sel = attention.selection;
    if (sel === undefined) return true;
    if (sel === null || typeof sel !== 'object') return false;
    const range = sel as Record<string, unknown>;
    return typeof range.start === 'number' && Number.isInteger(range.start)
      && typeof range.end === 'number' && Number.isInteger(range.end)
      && range.start >= 0 && range.end >= 0 && range.end >= range.start;
  }
  return false;
}

/* ── the connect URL + identity defaults ─────────────────────────────── */

/** §1: the WebSocket endpoint path (the gateway routes the upgrade) */
export const PRESENCE_WS_PATH = '/__design__/ws';
/** the identity credential's sessionStorage key — reconnects resume the same player */
export const PRESENCE_TOKEN_KEY = 'jx-design:presence-token';

/** `?name=` default (§4): human-<rand4> */
export function defaultPlayerName(rand: () => string = () => Math.random().toString(36).slice(2, 10)): string {
  return `human-${rand().slice(0, 4)}`;
}

/** §1 auth query: `?name=<urlencoded>&kind=human[&token=<t>]` */
export function buildPresenceUrl(base: string, identity: { name: string; kind: PlayerKind; token?: string | null }): string {
  const params = new URLSearchParams({ name: identity.name, kind: identity.kind });
  if (identity.token !== undefined && identity.token !== null && identity.token !== '') params.set('token', identity.token);
  return `${base}?${params.toString()}`;
}

/* ── the injected seams (node:test runs the whole machine) ───────────── */

/** the browser WebSocket's send/close surface (enough for the store) */
export interface PresenceSocket {
  send(text: string): void;
  close(): void;
  onopen: (() => void) | null;
  onmessage: ((event: { readonly data: string }) => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
}

export type PresenceSocketFactory = (url: string) => PresenceSocket;

/** the studio's factory: a relative path upgrades to ws(s):// against the
 *  page origin, wrapped in the store's send/close seam (the DOM event
 *  handler signatures stay behind the adapter — the transport-seam law) */
export function browserPresenceSocket(loc: { readonly protocol: string; readonly host: string } = location): PresenceSocketFactory {
  return (url) => {
    const absolute = url.startsWith('/')
      ? `${loc.protocol === 'https:' ? 'wss:' : 'ws:'}//${loc.host}${url}`
      : url;
    const ws = new WebSocket(absolute);
    // a send while CONNECTING THROWS (InvalidStateError) — and the first
    // throwback kills the caller: the selection→attention effect reports
    // the moment the store lands, connect() has barely started, and the
    // exception destroys the $effect forever (the P1 lesson, probe-proven
    // 2026-09-18). Buffer pre-open frames and flush them on open; a send
    // on a CLOSING/dead socket drops silently — presence reports are
    // ephemeral and the reconnect's welcome rebuilds the world.
    const preOpenQueue: string[] = [];
    return {
      send: (text) => {
        if (ws.readyState === WebSocket.CONNECTING) {
          preOpenQueue.push(text);
          return;
        }
        try {
          ws.send(text);
        } catch {
          /* CLOSING or already dead — the reconnect cycle owns recovery */
        }
      },
      close: () => ws.close(),
      get onopen(): (() => void) | null {
        return ws.onopen as (() => void) | null;
      },
      set onopen(fn: (() => void) | null) {
        ws.onopen = fn === null
          ? null
          : ((event) => {
              for (const queued of preOpenQueue.splice(0)) {
                try {
                  ws.send(queued);
                } catch {
                  /* raced close — the rest of the queue dies with it */
                }
              }
              (fn as unknown as (event: unknown) => void)(event);
            }) as unknown as WebSocket['onopen'];
      },
      get onmessage(): ((event: { readonly data: string }) => void) | null {
        return ws.onmessage as unknown as ((event: { readonly data: string }) => void) | null;
      },
      set onmessage(fn: ((event: { readonly data: string }) => void) | null) {
        ws.onmessage = fn as unknown as WebSocket['onmessage'];
      },
      get onclose(): (() => void) | null {
        return ws.onclose as (() => void) | null;
      },
      set onclose(fn: (() => void) | null) {
        ws.onclose = fn as unknown as WebSocket['onclose'];
      },
      get onerror(): (() => void) | null {
        return ws.onerror as (() => void) | null;
      },
      set onerror(fn: (() => void) | null) {
        ws.onerror = fn as unknown as WebSocket['onerror'];
      },
    };
  };
}

export interface PresenceScheduler {
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
  now(): number;
}

const globalScheduler: PresenceScheduler = {
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (handle) => clearTimeout(handle as Parameters<typeof clearTimeout>[0]),
  now: () => Date.now(),
};

export interface PresenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type PresenceEvent = 'join' | 'leave' | 'presence' | 'journal-tail' | 'status';
type PresenceListener = (payload: unknown) => void;

/* ── timing laws (§3/§4: 16ms cursor merge, 5s gateway timeout) ─────── */

/** self-side cursor report throttle (trailing — the freshest point wins) */
export const CURSOR_THROTTLE_MS = 16;
/** keep the gateway's 5s no-ping timeout fed with headroom */
export const PING_INTERVAL_MS = 2500;
/** reconnect backoff: 500ms·2^n, capped */
export const RECONNECT_BASE_MS = 500;
export const RECONNECT_MAX_MS = 15000;

export interface PresenceOptions {
  /** the player name (default human-<rand4>) */
  readonly name?: string;
  /** the connect kind — the studio always connects human (§4) */
  readonly kind?: PlayerKind;
  /** the ws endpoint base (default PRESENCE_WS_PATH) */
  readonly base?: string;
  readonly socketFactory: PresenceSocketFactory;
  readonly scheduler?: PresenceScheduler;
  readonly storage?: PresenceStorage;
}

/**
 * The presence store. One instance per studio page; `connect()` starts
 * the lifecycle, `dispose()` ends it (no reconnect after). The whole
 * editing lane never rides this socket — a dead gateway degrades the
 * indicators, not the studio.
 */
export class PresenceStore {
  readonly #socketFactory: PresenceSocketFactory;
  readonly #scheduler: PresenceScheduler;
  readonly #storage: PresenceStorage | null;
  readonly #name: string;
  readonly #kind: PlayerKind;
  readonly #base: string;

  #socket: PresenceSocket | null = null;
  #status: PresenceStatus = 'idle';
  #self: SelfView | null = null;
  readonly #players = new Map<string, RemotePlayer>();
  #attempt = 0;
  #disposed = false;
  #reconnectTimer: unknown = null;
  #pingTimer: unknown = null;
  #cursorTimer: unknown = null;
  #cursorPending: CursorState | null = null;
  readonly #listeners = new Set<() => void>();
  readonly #events = new Map<PresenceEvent, Set<PresenceListener>>();

  constructor(options: PresenceOptions) {
    this.#socketFactory = options.socketFactory;
    this.#scheduler = options.scheduler ?? globalScheduler;
    this.#storage = options.storage ?? null;
    this.#name = options.name ?? defaultPlayerName();
    this.#kind = options.kind ?? 'human';
    this.#base = options.base ?? PRESENCE_WS_PATH;
  }

  /* ── observation (snapshot + events, the panel-collab pattern) ─────── */

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  /** the event seams: join/leave/presence/journal-tail (§1) + status */
  on(event: PresenceEvent, listener: PresenceListener): () => void {
    let set = this.#events.get(event);
    if (set === undefined) {
      set = new Set();
      this.#events.set(event, set);
    }
    set.add(listener);
    return () => set.delete(listener);
  }

  snapshot(): PresenceSnapshot {
    return {
      status: this.#status,
      self: this.#self,
      players: [...this.#players.values()].sort(byPlayerOrdinal),
    };
  }

  #notify(): void {
    for (const listener of [...this.#listeners]) listener();
  }

  #emit(event: PresenceEvent, payload: unknown): void {
    const set = this.#events.get(event);
    if (set === undefined) return;
    for (const listener of [...set]) listener(payload);
  }

  /* ── lifecycle ─────────────────────────────────────────────────────── */

  connect(): void {
    if (this.#disposed || this.#socket !== null) return;
    this.#status = 'connecting';
    this.#notify();
    this.#emit('status', this.#status);
    const token = this.#tryReadToken();
    const url = buildPresenceUrl(this.#base, { name: this.#name, kind: this.#kind, token });
    const socket = this.#socketFactory(url);
    socket.onopen = () => {
      // §1: the server speaks first (welcome) — a ping opens the keepalive window
      this.#send({ type: 'ping' });
    };
    socket.onmessage = (event) => this.#receive(event.data);
    socket.onerror = () => {
      /* close follows; the reconnect lane owns recovery */
    };
    socket.onclose = () => this.#handleDown();
    this.#socket = socket;
  }

  dispose(): void {
    this.#disposed = true;
    this.#clearTimers();
    const socket = this.#socket;
    this.#socket = null;
    socket?.close();
    this.#listeners.clear();
    this.#events.clear();
  }

  #tryReadToken(): string | null {
    try {
      return this.#storage?.getItem(PRESENCE_TOKEN_KEY) ?? null;
    } catch {
      return null;
    }
  }

  #handleDown(): void {
    if (this.#socket === null) return; // dispose() already tore down
    this.#socket = null;
    this.#clearTimers();
    this.#cursorPending = null;
    if (this.#status !== 'offline') {
      this.#status = 'offline';
      // every remote goes dark: indicators drop, chips show offline
      for (const [id, player] of this.#players) {
        this.#players.set(id, { ...player, online: false, cursor: null, attention: null });
      }
      this.#notify();
      this.#emit('status', this.#status);
    }
    this.#armReconnect();
  }

  #armReconnect(): void {
    if (this.#disposed || this.#reconnectTimer !== null) return;
    const delay = Math.min(RECONNECT_BASE_MS * 2 ** Math.min(this.#attempt, 5), RECONNECT_MAX_MS);
    this.#attempt += 1;
    this.#reconnectTimer = this.#scheduler.setTimeout(() => {
      this.#reconnectTimer = null;
      if (!this.#disposed) this.connect();
    }, delay);
  }

  #clearTimers(): void {
    if (this.#reconnectTimer !== null) {
      this.#scheduler.clearTimeout(this.#reconnectTimer);
      this.#reconnectTimer = null;
    }
    if (this.#pingTimer !== null) {
      this.#scheduler.clearTimeout(this.#pingTimer);
      this.#pingTimer = null;
    }
    if (this.#cursorTimer !== null) {
      this.#scheduler.clearTimeout(this.#cursorTimer);
      this.#cursorTimer = null;
    }
  }

  /* ── the S→C state machine (§1) ────────────────────────────────────── */

  #receive(raw: string): void {
    const message = parseServerMessage(raw);
    if (message === null) return;
    switch (message.type) {
      case 'welcome':
        this.#onWelcome(message);
        break;
      case 'join': {
        if (this.#self !== null && message.player.playerId === this.#self.playerId) return;
        this.#players.set(message.player.playerId, { ...message.player, cursor: message.player.cursor ?? null, online: true });
        this.#notify();
        this.#emit('join', message.player);
        break;
      }
      case 'leave': {
        const player = this.#players.get(message.playerId);
        if (player === undefined || !player.online) return;
        this.#players.set(message.playerId, { ...player, online: false, cursor: null, attention: null });
        this.#notify();
        this.#emit('leave', message.playerId);
        break;
      }
      case 'presence': {
        const player = this.#players.get(message.playerId);
        if (player === undefined || !player.online) return;
        this.#players.set(message.playerId, {
          ...player,
          cursor: message.cursor,
          attention: message.attention,
          hasMouse: message.hasMouse,
        });
        this.#notify();
        this.#emit('presence', message.playerId);
        break;
      }
      case 'journal-tail':
        this.#emit('journal-tail', message.seq);
        break;
    }
  }

  #onWelcome(message: Extract<ServerMessage, { type: 'welcome' }>): void {
    // the credential outlives the socket: a reconnect resumes this identity
    try {
      this.#storage?.setItem(PRESENCE_TOKEN_KEY, message.token);
    } catch {
      /* private mode — identity lasts the socket's life */
    }
    this.#self = { playerId: message.playerId, name: this.#name, kind: this.#kind, colorHue: message.colorHue };
    // the server's table is the truth: rebuild wholesale (reconnects may
    // have missed joins/leaves). The roster's parked cursors ride along
    // (the join-time snapshot — walkthrough R2: idle players render at
    // once, no waiting for their next move)
    this.#players.clear();
    for (const player of message.players) {
      if (player.playerId === message.playerId) continue;
      this.#players.set(player.playerId, { ...player, cursor: player.cursor ?? null, online: true });
    }
    this.#attempt = 0;
    this.#status = 'online';
    this.#notify();
    this.#emit('status', this.#status);
    this.#armPing();
  }

  #armPing(): void {
    if (this.#pingTimer !== null) this.#scheduler.clearTimeout(this.#pingTimer);
    this.#pingTimer = this.#scheduler.setTimeout(() => {
      this.#pingTimer = null;
      if (this.#socket !== null && !this.#disposed) {
        this.#send({ type: 'ping' });
        this.#armPing();
      }
    }, PING_INTERVAL_MS);
  }

  /* ── the C→S reports (§1) ──────────────────────────────────────────── */

  /** pointer report, 16ms trailing throttle (CURSOR_THROTTLE_MS) — the freshest point wins */
  reportCursor(canvas: string, surface: CursorSurface, x: number, y: number): void {
    if (this.#disposed) return;
    this.#cursorPending = { canvas, surface, x, y };
    if (this.#cursorTimer !== null) return;
    this.#cursorTimer = this.#scheduler.setTimeout(() => {
      this.#cursorTimer = null;
      const pending = this.#cursorPending;
      this.#cursorPending = null;
      if (pending !== null && this.#socket !== null) this.#send({ type: 'cursor', ...pending });
    }, CURSOR_THROTTLE_MS);
  }

  /** attention is low-frequency — no throttle, honest sends */
  reportAttention(focus: AttentionFocus | null): void {
    if (this.#disposed || this.#socket === null) return;
    this.#send({ type: 'attention', focus });
  }

  /** the AI lane's virtual mouse toggle (§1 vocabulary completeness) */
  setVirtualMouse(enabled: boolean): void {
    if (this.#disposed || this.#socket === null) return;
    this.#send({ type: 'virtual-mouse', enabled });
  }

  #send(message: ClientMessage): void {
    this.#socket?.send(buildClientMessage(message));
  }
}

/** chips order: p2 before p10 (the joining ordinal — §1 playerId = p<n>) */
function byPlayerOrdinal(a: RemotePlayer, b: RemotePlayer): number {
  return ordinalOf(a.playerId) - ordinalOf(b.playerId);
}

function ordinalOf(playerId: string): number {
  const match = /^p(\d+)$/.exec(playerId);
  return match === null ? Number.MAX_SAFE_INTEGER : Number.parseInt(match[1], 10);
}
