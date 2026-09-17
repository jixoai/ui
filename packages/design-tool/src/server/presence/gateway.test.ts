/**
 * gateway.test.ts — the collab-presence server lane: the frozen §1
 * message vocabulary over REAL ws connections (word-shape contracts for
 * welcome/join/leave/presence/journal-tail/pong), the §2 identity law
 * (hue = (73·counter)%360, counter 只增不减, same-token reconnect,
 * cross-instance persistence, fail-stop ledger rebuild), §3 upgrade
 * routing (path-scoped, a Vite-shaped lane coexists, orphan upgrades
 * pass through), the ~50ms presence merge window, the ping/pong +
 * offline sweep, the admission-hook notify face (actor→player mapping,
 * focus derivation, seq dedupe) and the two integrations: the host's §8
 * cycle journal-tail and the /admit commit hook (panel sessionHint →
 * panel attention on the OTHER players' side).
 *
 * Every server rides an ephemeral port on 127.0.0.1 and is closed
 * inside the test (client closes → gateway close → httpServer close +
 * closeAllConnections) — no orphan process, no fixed port (5193 is the
 * Owner's live server).
 *
 * Original need: collab-presence (2026-09-17).
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { createServer, type AddressInfo, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { Duplex } from 'node:stream';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test, { type TestContext } from 'node:test';

import { WebSocket, WebSocketServer } from 'ws';

import { LoroDoc } from 'loro-crdt';

import { openCollabHost } from '../collab-host.ts';
import { resolveCollabApiRequest } from '../collab-api.ts';
import { bytesToB64, containerKeyOf } from '../../studio/panel-collab.ts';
import {
  attachPresenceGateway,
  findPresenceGateway,
  focusFromOpTarget,
  mapActorToPlayerId,
  parseClientMessage,
  PRESENCE_WS_PATH,
  type PresenceGateway,
} from './gateway.ts';
import { hueOfCounter, PresenceLedger } from './ledger.ts';

/* ── scaffolding ────────────────────────────────────────────────────────── */

type Msg = Record<string, unknown>;

interface Harness {
  readonly designDir: string;
  readonly httpServer: Server;
  readonly gateway: PresenceGateway;
  readonly port: number;
  readonly wsUrl: string;
  close(): Promise<void>;
}

/** a temp workspace + gateway on an EPHEMERAL port; t.after is the safety net */
async function harness(
  t: TestContext,
  options: { presenceWindowMs?: number; offlineTimeoutMs?: number; corrupt?: 'garbage' | 'schema' } = {},
): Promise<Harness> {
  const root = mkdtempSync(join(tmpdir(), 'jx-presence-gw-'));
  const designDir = join(root, 'design');
  mkdirSync(designDir, { recursive: true });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  if (options.corrupt !== undefined) {
    mkdirSync(join(designDir, '.jx-collab'), { recursive: true });
    writeFileSync(
      join(designDir, '.jx-collab', 'presence.json'),
      options.corrupt === 'garbage' ? '{"counter": "x", "players": [' : '{"counter": -3, "players": [{"playerId": 7}]}',
    );
  }
  const httpServer = createServer((_req: IncomingMessage, res: ServerResponse) => {
    res.statusCode = 204;
    res.end();
  });
  const gateway = attachPresenceGateway(httpServer, {
    designDir,
    ...(options.presenceWindowMs !== undefined ? { presenceWindowMs: options.presenceWindowMs } : {}),
    ...(options.offlineTimeoutMs !== undefined ? { offlineTimeoutMs: options.offlineTimeoutMs } : {}),
  });
  await new Promise<void>((resolveListen) => httpServer.listen(0, '127.0.0.1', resolveListen));
  const port = (httpServer.address() as AddressInfo).port;
  const close = async (): Promise<void> => {
    gateway.close();
    // destroy every lingering socket FIRST — httpServer.close()'s callback
    // only fires once the connection count drains, and detached upgrade
    // sockets (paths nobody owned) never drain on their own
    httpServer.closeAllConnections();
    await new Promise<void>((resolveClosed) => httpServer.close(() => resolveClosed()));
  };
  t.after(() => close()); // idempotent double-close — the safety net below the explicit lanes
  return { designDir, httpServer, gateway, port, wsUrl: `ws://127.0.0.1:${port}${PRESENCE_WS_PATH}`, close };
}

/** one connected ws client with a message log + per-type waiters */
class Client {
  readonly ws: WebSocket;
  readonly #log: Msg[] = [];
  readonly #waiters: { readonly match: (message: Msg) => boolean; readonly resolve: (message: Msg) => void }[] = [];
  /** per-type consumption cursor — next() never re-answers a consumed frame */
  readonly #cursorByType = new Map<string, number>();

  constructor(ws: WebSocket) {
    this.ws = ws;
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString()) as Msg;
      this.#log.push(message);
      for (let index = 0; index < this.#waiters.length; ) {
        const waiter = this.#waiters[index]!;
        if (waiter.match(message)) {
          this.#waiters.splice(index, 1);
          waiter.resolve(message);
        } else {
          index += 1;
        }
      }
    });
    ws.on('error', () => {
      /* handshake/protocol noise — the assertions own the outcome */
    });
  }

  get log(): readonly Msg[] {
    return this.#log;
  }

  countOf(type: string): number {
    return this.#log.filter((message) => message.type === type).length;
  }

  /**
   * The next UNCONSUMED frame of this type — already-received frames count
   * (a frame may land before the await arms; arrival order, not call
   * order, decides). Each returned frame is consumed exactly once.
   */
  next(type: string, timeoutMs = 3000): Promise<Msg> {
    const from = this.#cursorByType.get(type) ?? 0;
    for (let index = from; index < this.#log.length; index += 1) {
      if (this.#log[index]!.type === type) {
        this.#cursorByType.set(type, index + 1);
        return Promise.resolve(this.#log[index]!);
      }
    }
    this.#cursorByType.set(type, this.#log.length);
    return new Promise<Msg>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`timeout waiting for a "${type}" frame`)), timeoutMs);
      this.#waiters.push({
        match: (message) => message.type === type,
        resolve: (message) => {
          clearTimeout(timer);
          const cursor = this.#cursorByType.get(type) ?? 0;
          this.#cursorByType.set(type, Math.max(cursor, this.#log.indexOf(message) + 1));
          resolve(message);
        },
      });
    });
  }

  send(message: unknown): void {
    this.ws.send(JSON.stringify(message));
  }

  close(): void {
    this.ws.close();
  }
}

async function connect(url: string, query: { name?: string; kind?: 'human' | 'ai'; token?: string } = {}): Promise<Client> {
  const params = new URLSearchParams();
  if (query.name !== undefined) params.set('name', query.name);
  if (query.kind !== undefined) params.set('kind', query.kind);
  if (query.token !== undefined) params.set('token', query.token);
  const suffix = params.size > 0 ? `?${params.toString()}` : '';
  const ws = new WebSocket(`${url}${suffix}`);
  const client = new Client(ws); // listeners armed BEFORE open — a frame riding the handshake chunk is never lost
  await new Promise<void>((resolveOpen, rejectOpen) => {
    ws.once('open', () => resolveOpen());
    ws.once('error', (error: Error) => rejectOpen(error));
  });
  return client;
}

const keysOf = (message: Msg): string[] => Object.keys(message).sort();
const viewKeys = ['attention', 'colorHue', 'hasMouse', 'kind', 'name', 'playerId'];

const wait = (ms: number): Promise<void> => new Promise((resolveWait) => setTimeout(resolveWait, ms));

/* ── the frozen vocabulary (§1) ──────────────────────────────────────────── */

test('vocabulary: welcome / join / leave carry the frozen §1 shapes', async (t) => {
  const h = await harness(t);
  const alice = await connect(h.wsUrl, { name: 'alice' });
  const welcomeA = await alice.next('welcome');
  assert.deepEqual(keysOf(welcomeA), ['colorHue', 'playerId', 'players', 'token', 'type']);
  assert.equal(welcomeA.playerId, 'p1');
  assert.equal(welcomeA.colorHue, 73);
  assert.match(String(welcomeA.token), /^[0-9a-f]{32}$/, 'the issued token is 32 hex chars');
  const rosterA = welcomeA.players as Msg[];
  assert.equal(rosterA.length, 1, 'the first player sees itself in the welcome roster');
  assert.deepEqual(Object.keys(rosterA[0]!).sort(), viewKeys);
  assert.equal(rosterA[0]!.playerId, 'p1');
  assert.equal(rosterA[0]!.name, 'alice');
  assert.equal(rosterA[0]!.kind, 'human');
  assert.equal(rosterA[0]!.hasMouse, true);
  assert.equal(rosterA[0]!.attention, null);

  const bob = await connect(h.wsUrl, { name: 'bob' });
  const joinOnAlice = await alice.next('join');
  assert.deepEqual(keysOf(joinOnAlice), ['player', 'type']);
  assert.deepEqual(Object.keys(joinOnAlice.player as Msg).sort(), viewKeys);
  assert.equal((joinOnAlice.player as Msg).playerId, 'p2');
  const welcomeB = await bob.next('welcome');
  assert.equal((welcomeB.players as Msg[]).length, 2, 'the newcomer\'s welcome carries the full roster');

  bob.close();
  const leaveOnAlice = await alice.next('leave');
  assert.deepEqual(keysOf(leaveOnAlice), ['playerId', 'type']);
  assert.equal(leaveOnAlice.playerId, 'p2');

  alice.close();
  await h.close();
  assert.equal(h.gateway.closed, true, 'close ran');
  assert.equal(findPresenceGateway(h.designDir), undefined, 'the registry entry is released — no residue');
});

/* ── the identity law (§2) ──────────────────────────────────────────────── */

test('色律: hues follow the join order (73/146/219), a same-token reconnect restores the identity, a tokenless rejoin takes a fresh number', async (t) => {
  const h = await harness(t);
  const first = await connect(h.wsUrl);
  const w1 = await first.next('welcome');
  assert.equal(w1.playerId, 'p1');
  assert.equal(w1.colorHue, 73);
  const second = await connect(h.wsUrl);
  const w2 = await second.next('welcome');
  assert.equal(w2.playerId, 'p2');
  assert.equal(w2.colorHue, 146);
  const third = await connect(h.wsUrl);
  const w3 = await third.next('welcome');
  assert.equal(w3.playerId, 'p3');
  assert.equal(w3.colorHue, 219);

  const token1 = String(w1.token);
  first.close();
  third.close();
  await wait(50); // the close handshakes settle

  const again = await connect(h.wsUrl, { token: token1, name: 'renamed-should-not-apply' });
  const wAgain = await again.next('welcome');
  assert.equal(wAgain.playerId, 'p1', 'the token hit restores the SAME playerId');
  assert.equal(wAgain.colorHue, 73, 'the token hit restores the SAME hue');
  assert.equal(wAgain.token, token1, 'the restored identity carries the same token');
  const selfView = (wAgain.players as Msg[]).find((view) => view.playerId === 'p1')!;
  assert.equal(selfView.name, 'player-1', 'the ledger name survives a reconnect (同 name)');

  const fourth = await connect(h.wsUrl);
  const w4 = await fourth.next('welcome');
  assert.equal(w4.playerId, 'p4', 'a tokenless join NEVER reuses a spent number');
  assert.equal(w4.colorHue, (73 * 4) % 360);

  const persisted = JSON.parse(readFileSync(join(h.designDir, '.jx-collab', 'presence.json'), 'utf8')) as { counter: number; players: Msg[] };
  assert.equal(persisted.counter, 4);
  assert.equal(persisted.players.length, 4);
  assert.ok(persisted.players.every((row) => /^sha256:[0-9a-f]{64}$/.test(String(row.tokenHash))), 'tokens are stored hashed, never in the clear');

  again.close();
  fourth.close();
  second.close();
  await h.close();
});

test('counter persists across gateway instances over the same workspace', async (t) => {
  const h = await harness(t);
  const first = await connect(h.wsUrl);
  await first.next('welcome'); // p1
  const second = await connect(h.wsUrl);
  await second.next('welcome'); // p2
  first.close();
  second.close();
  h.gateway.close();
  assert.equal(findPresenceGateway(h.designDir), undefined);

  const reopened = attachPresenceGateway(h.httpServer, { designDir: h.designDir });
  const third = await connect(h.wsUrl);
  const w3 = await third.next('welcome');
  assert.equal(w3.playerId, 'p3', 'the reopened gateway continues the persisted counter');
  assert.equal(w3.colorHue, 219);
  third.close();
  reopened.close();
  await h.close();
});

test('fail-stop ledger: corrupted presence.json (malformed JSON and schema alike) rebuilds empty — the gateway still serves, loudly', async (t) => {
  for (const corrupt of ['garbage', 'schema'] as const) {
    const notes: string[] = [];
    const errorSpy = t.mock.method(console, 'error', (...args: unknown[]) => {
      notes.push(args.map(String).join(' '));
    });
    try {
      const h = await harness(t, { corrupt });
      const alice = await connect(h.wsUrl, { name: 'alice' });
      const welcome = await alice.next('welcome');
      assert.equal(welcome.playerId, 'p1', `a rebuilt ledger starts fresh (${corrupt})`);
      assert.equal(welcome.colorHue, 73);
      assert.ok(
        notes.some((note) => note.includes('[design-presence]') && note.includes('rebuilt empty')),
        `the rebuild logs loud (${corrupt})`,
      );
      const persisted = JSON.parse(readFileSync(join(h.designDir, '.jx-collab', 'presence.json'), 'utf8')) as { counter: number };
      assert.equal(persisted.counter, 1, `the rejected file was rewritten as a valid ledger (${corrupt})`);
      alice.close();
      await h.close();
    } finally {
      errorSpy.mock.restore();
    }
  }
});

test('ledger unit law: hueOfCounter and the ledger-facing schema (no sockets)', (t) => {
  assert.equal(hueOfCounter(1), 73);
  assert.equal(hueOfCounter(2), 146);
  assert.equal(hueOfCounter(3), 219);
  assert.equal(hueOfCounter(5), (73 * 5) % 360);
  const root = mkdtempSync(join(tmpdir(), 'jx-presence-ledger-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const ledger = new PresenceLedger(join(root, 'design'));
  assert.equal(ledger.counter, 0);
  const identity = ledger.restoreOrCreate({ name: 'owner', kind: 'human' });
  assert.equal(identity.record.playerId, 'p1');
  assert.equal(identity.token.length, 32);
  assert.equal(ledger.find('p1')?.tokenHash, `sha256:${createHash('sha256').update(identity.token).digest('hex')}`);
  const ai = ledger.ensureServerPlayer('dsh');
  assert.equal(ai.kind, 'ai');
  assert.equal(ledger.ensureServerPlayer('dsh').playerId, ai.playerId, 'server players reuse their identity');
  assert.equal(ledger.counter, 2);
});

/* ── upgrade routing (§3) ───────────────────────────────────────────────── */

test('upgrade routing: /__design__/ws is served while a Vite-shaped lane coexists and orphan upgrades pass through', async (t) => {
  const h = await harness(t);

  // the Vite-HMR-shaped second lane: answers only its own protocol header
  const viteWss = new WebSocketServer({ noServer: true });
  const viteConnected = new Promise<WebSocket>((resolveVite) => viteWss.on('connection', (ws) => resolveVite(ws)));
  const viteListener = (req: IncomingMessage, socket: Duplex, head: Buffer): void => {
    if (req.headers['sec-websocket-protocol'] === 'vite-hmr') {
      viteWss.handleUpgrade(req, socket, head, (ws) => viteWss.emit('connection', ws, req));
    }
  };
  h.httpServer.on('upgrade', viteListener);

  const alice = await connect(h.wsUrl, { name: 'alice' });
  const welcome = await alice.next('welcome');
  assert.equal(welcome.playerId, 'p1', 'the presence lane answers its own path');

  const viteClient = new WebSocket(`ws://127.0.0.1:${h.port}/`, 'vite-hmr');
  await new Promise<void>((resolveOpen) => viteClient.once('open', () => resolveOpen()));
  await viteConnected;
  viteClient.close();

  // an upgrade nobody owns: the gateway must NOT answer it — the
  // handshake times out on the client instead of completing. The
  // server-side socket of an unowned upgrade is detached from the http
  // server's tracking (stock node behavior — vite-only servers share it),
  // so the test janitors its own orphan or httpServer.close() hangs.
  const orphanSockets: Duplex[] = [];
  const janitor = (req: IncomingMessage, socket: Duplex): void => {
    if ((req.url ?? '').startsWith('/__design__/other')) orphanSockets.push(socket);
  };
  h.httpServer.on('upgrade', janitor);
  const orphan = new WebSocket(`ws://127.0.0.1:${h.port}/__design__/other`, { handshakeTimeout: 400 });
  const orphanOutcome = await new Promise<'open' | 'failed'>((resolveOutcome) => {
    orphan.once('open', () => resolveOutcome('open'));
    orphan.once('error', () => resolveOutcome('failed'));
    orphan.once('close', () => resolveOutcome('failed')); // ws may fail the handshake with only a close
  });
  orphan.terminate();
  for (const socket of orphanSockets) socket.destroy();
  h.httpServer.off('upgrade', janitor);
  assert.equal(orphanOutcome, 'failed', 'the orphan upgrade was passed through, not hijacked');

  h.httpServer.off('upgrade', viteListener);
  await new Promise<void>((resolveClosed) => viteWss.close(() => resolveClosed()));
  alice.close();
  await h.close();
});

/* ── presence stream + liveness (§1/§2) ─────────────────────────────────── */

test('presence: bursts collapse into one frame per merge window, latest state wins, shapes frozen', async (t) => {
  const h = await harness(t, { presenceWindowMs: 60 });
  const alice = await connect(h.wsUrl, { name: 'alice' });
  await alice.next('welcome');
  const bob = await connect(h.wsUrl, { name: 'bob' });
  await bob.next('welcome');
  const joinOnAlice = alice.next('join'); // drain bob's join on alice's side
  await joinOnAlice.catch(() => undefined);

  alice.send({ type: 'cursor', canvas: 'welcome', surface: 'canvas', x: 1, y: 1 });
  alice.send({ type: 'cursor', canvas: 'welcome', surface: 'canvas', x: 2, y: 2 });
  await wait(150);
  assert.equal(bob.countOf('presence'), 1, 'two rapid cursors collapsed into ONE presence frame');
  const burst = await bob.next('presence'); // consumes the burst frame
  assert.deepEqual(keysOf(burst), ['attention', 'cursor', 'hasMouse', 'playerId', 'type']);
  assert.deepEqual(burst.cursor, { canvas: 'welcome', surface: 'canvas', x: 2, y: 2 }, 'the LATEST state won the window');
  assert.equal(burst.attention, null);

  alice.send({ type: 'attention', focus: { kind: 'canvas', component: 'press-button', instance: null, frameId: null } });
  const attentionFrame = await bob.next('presence');
  assert.deepEqual(attentionFrame.attention, { kind: 'canvas', component: 'press-button', instance: null, frameId: null });
  assert.deepEqual(attentionFrame.cursor, { canvas: 'welcome', surface: 'canvas', x: 2, y: 2 }, 'the merged frame carries the whole state');

  // junk frames are ignored, the connection survives
  alice.ws.send('not json');
  alice.send({ type: 'bogus' });
  alice.send({ type: 'cursor', canvas: 'welcome', surface: '', x: 0, y: 0 });
  await wait(120);
  assert.equal(bob.countOf('presence'), 2, 'junk produced no frames');
  alice.send({ type: 'ping' });
  assert.equal((await alice.next('pong')).type, 'pong');

  alice.close();
  bob.close();
  await h.close();
});

test('liveness: ping→pong answers, silence past the offline timeout is swept out with a leave broadcast', async (t) => {
  const h = await harness(t, { offlineTimeoutMs: 250 });
  const alice = await connect(h.wsUrl, { name: 'alice' });
  await alice.next('welcome');
  const bob = await connect(h.wsUrl, { name: 'bob' });
  await bob.next('welcome');

  alice.send({ type: 'ping' });
  assert.equal((await alice.next('pong')).type, 'pong');

  // the OFFLINE law is symmetric — the observer must keep pinging to
  // outlive the swept player (a real client's keepalive)
  const bobKeepalive = setInterval(() => bob.send({ type: 'ping' }), 100);

  // alice stays silent → the sweep terminates her socket → leave on bob.
  // The socket may already be closed by the time we look (the sweep raced
  // ahead of the leave frame) — readyState answers without replaying the
  // missed 'close' event.
  const leaveOnBob = await bob.next('leave', 3000);
  assert.equal(leaveOnBob.playerId, 'p1');
  const gone =
    alice.ws.readyState === WebSocket.CLOSED
      ? 'closed'
      : await new Promise<'closed'>((resolveClosed) => alice.ws.once('close', () => resolveClosed('closed')));
  assert.equal(gone, 'closed');

  clearInterval(bobKeepalive);
  bob.close();
  await h.close();
});

test('virtual-mouse: ai players start mouseless and register through the message', async (t) => {
  const h = await harness(t, { presenceWindowMs: 20 });
  const human = await connect(h.wsUrl, { name: 'owner' });
  await human.next('welcome');
  const ai = await connect(h.wsUrl, { name: 'dsh-agent', kind: 'ai' });
  const aiWelcome = await ai.next('welcome');
  const aiView = (aiWelcome.players as Msg[]).find((view) => view.playerId === aiWelcome.playerId)!;
  assert.equal(aiView.kind, 'ai');
  assert.equal(aiView.hasMouse, false, 'ai players start without a mouse');

  const joinOnHuman = human.next('join');
  ai.send({ type: 'virtual-mouse', enabled: true });
  const registered = await human.next('presence');
  await joinOnHuman.catch(() => undefined);
  assert.equal(registered.playerId, aiWelcome.playerId);
  assert.equal(registered.hasMouse, true, 'the virtual mouse registered');

  ai.send({ type: 'virtual-mouse', enabled: false });
  const unregistered = await human.next('presence');
  assert.equal(unregistered.hasMouse, false, 'the virtual mouse unregistered');

  ai.close();
  human.close();
  await h.close();
});

/* ── the notify face (admission hooks, §3) ──────────────────────────────── */

test('notifyCommit: journal-tail dedupes by seq; mappable actors relay attention, unmappable ones get no ghost', async (t) => {
  const h = await harness(t);
  const human = await connect(h.wsUrl, { name: 'owner' });
  const humanWelcome = await human.next('welcome');

  const dshId = h.gateway.registerAiPlayer({ name: 'dsh', actor: 'dsh' });
  const join = await human.next('join');
  assert.equal((join.player as Msg).playerId, dshId);
  assert.equal((join.player as Msg).kind, 'ai');
  assert.equal((join.player as Msg).hasMouse, false);
  assert.equal(h.gateway.registerAiPlayer({ name: 'dsh', actor: 'dsh' }), dshId, 'registration is idempotent');

  // an unmappable actor → journal-tail ONLY (no ghost)
  h.gateway.notifyCommit({ seq: 10, actor: 'file-system', target: { componentId: 'a1', buffer: 'label' } });
  const tail1 = await human.next('journal-tail');
  assert.deepEqual(keysOf(tail1), ['seq', 'type']);
  assert.equal(tail1.seq, 10);
  await wait(80);
  assert.equal(human.countOf('presence'), 0, 'no presence ghost for the unmappable actor');
  await human.next('join', 1).then(
    () => assert.fail('no second join'),
    () => undefined,
  );

  // the registered dsh actor → canvas attention relay
  h.gateway.notifyCommit({ seq: 11, actor: 'dsh', target: { componentId: 'a1', buffer: 'label' } });
  assert.equal((await human.next('journal-tail')).seq, 11);
  const dshAttention = await human.next('presence');
  assert.equal(dshAttention.playerId, dshId);
  assert.deepEqual(dshAttention.attention, { kind: 'canvas', component: 'a1', instance: null, frameId: null });

  // seq dedupe: a repeated seq broadcasts nothing
  h.gateway.notifyJournalTail(11);
  h.gateway.notifyJournalTail(9);
  await wait(80);
  assert.equal(human.countOf('journal-tail'), 2, 'only seq ADVANCES broadcast');

  // a sessionHint playerId → the panel attention relay (visible to OTHERS)
  const observer = await connect(h.wsUrl, { name: 'watcher' });
  await observer.next('welcome');
  h.gateway.notifyCommit({
    seq: 12,
    actor: 'human',
    target: { componentId: 'a1', buffer: 'raised' },
    sessionHint: { playerId: String(humanWelcome.playerId), field: 'prop-raised', digest: 'raised=false→true' },
  });
  assert.equal((await observer.next('journal-tail')).seq, 12);
  const panelAttention = await observer.next('presence');
  assert.equal(panelAttention.playerId, humanWelcome.playerId);
  assert.deepEqual(panelAttention.attention, { kind: 'panel', field: 'prop-raised', digest: 'raised=false→true' });

  human.close();
  observer.close();
  await h.close();
});

/* ── pure mapping functions ─────────────────────────────────────────────── */

test('mapActorToPlayerId: the hint wins, then the actor binding, else no ghost', () => {
  const players = [
    { playerId: 'p1', kind: 'human', present: true },
    { playerId: 'p2', kind: 'ai', boundActor: 'dsh', present: true },
    { playerId: 'p3', kind: 'human', present: false },
  ] as const;
  assert.equal(mapActorToPlayerId('human', { playerId: 'p1' }, players), 'p1');
  assert.equal(mapActorToPlayerId('anything', { playerId: 'p3' }, players), undefined, 'an offline hinted player gets no ghost');
  assert.equal(mapActorToPlayerId('dsh', undefined, players), 'p2');
  assert.equal(mapActorToPlayerId('file-system', undefined, players), undefined);
  assert.equal(mapActorToPlayerId('human', undefined, players), undefined);
});

test('focusFromOpTarget: a panel hint wins, otherwise the canvas focus carries the op target', () => {
  assert.deepEqual(focusFromOpTarget({ componentId: 'a1', buffer: 'label' }, undefined), { kind: 'canvas', component: 'a1', instance: null, frameId: null });
  assert.deepEqual(focusFromOpTarget({ componentId: 'a1' }, { field: 'prop-raised', digest: 'x→y' }), { kind: 'panel', field: 'prop-raised', digest: 'x→y' });
  assert.deepEqual(focusFromOpTarget({ componentId: 'a1' }, { playerId: 'p9' }), { kind: 'canvas', component: 'a1', instance: null, frameId: null });
  assert.deepEqual(focusFromOpTarget({ componentId: 'a1' }, { digest: 'only-digest' }), { kind: 'canvas', component: 'a1', instance: null, frameId: null });
});

test('parseClientMessage: junk ignored, valid frames narrowed', () => {
  assert.equal(parseClientMessage(undefined), undefined);
  assert.equal(parseClientMessage('nope'), undefined);
  assert.equal(parseClientMessage({ type: 'unknown' }), undefined);
  assert.equal(parseClientMessage({ type: 'cursor', canvas: 'welcome', surface: '', x: 0, y: 0 }), undefined);
  assert.equal(parseClientMessage({ type: 'cursor', canvas: 'welcome', surface: 'canvas', x: Number.NaN, y: 0 }), undefined);
  assert.equal(parseClientMessage({ type: 'attention', focus: { kind: 'bogus' } }), undefined);
  assert.equal(parseClientMessage({ type: 'attention', focus: { kind: 'panel', field: '', digest: '' } }), undefined);
  assert.equal(parseClientMessage({ type: 'virtual-mouse', enabled: 'yes' }), undefined);
  // attention null CLEARS (the field-blur law — the visuals-matrix catch)
  assert.deepEqual(parseClientMessage({ type: 'attention', focus: null }), { type: 'attention', focus: null });
  assert.deepEqual(parseClientMessage({ type: 'ping' }), { type: 'ping' });
  assert.deepEqual(parseClientMessage({ type: 'cursor', canvas: 'welcome', surface: 'canvas', x: 1.5, y: -2 }), { type: 'cursor', canvas: 'welcome', surface: 'canvas', x: 1.5, y: -2 });
  assert.deepEqual(parseClientMessage({ type: 'attention', focus: { kind: 'canvas', component: 'press-button', instance: 2, frameId: 'hero' } }), {
    type: 'attention',
    focus: { kind: 'canvas', component: 'press-button', instance: 2, frameId: 'hero' },
  });
  assert.deepEqual(parseClientMessage({ type: 'virtual-mouse', enabled: true }), { type: 'virtual-mouse', enabled: true });
});

/* ── integration: the §8 host cycle announces journal-tail ──────────────── */

const PAGE_SOURCE = `<script module lang="ts">
  import Button from '#jixoai/press-button';
</script>

<main>
  <Button id="a1" raised={true} variant="ghost">Start designing</Button>
</main>
`;

test('integration: a §8 cycle that commits announces journal-tail through the workspace gateway', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-presence-host-'));
  const designDir = join(root, 'design');
  const pageAbs = join(designDir, 'prototypes/demo/canvas.svelte');
  mkdirSync(dirname(pageAbs), { recursive: true });
  writeFileSync(pageAbs, PAGE_SOURCE);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const host = openCollabHost(designDir, { ownFsWatch: false });
  t.after(() => void host.dispose());

  const httpServer = createServer((_req: IncomingMessage, res: ServerResponse) => {
    res.statusCode = 204;
    res.end();
  });
  const gateway = attachPresenceGateway(httpServer, { designDir });
  await new Promise<void>((resolveListen) => httpServer.listen(0, '127.0.0.1', resolveListen));
  const wsUrl = `ws://127.0.0.1:${(httpServer.address() as AddressInfo).port}${PRESENCE_WS_PATH}`;
  t.after(() => {
    gateway.close();
    httpServer.close();
    httpServer.closeAllConnections();
  });

  const observer = await connect(wsUrl, { name: 'watcher' });
  await observer.next('welcome');

  const outcome = await host.syncExternalChange(pageAbs);
  assert.equal(outcome.kind, 'adopted');
  const tail = await observer.next('journal-tail');
  assert.equal(tail.seq, host.kernel.stats().journalSeq, 'the tail carries the journal row count');
  assert.ok((tail.seq as number) > 0);

  observer.close();
});

/* ── integration: the /admit commit hook (sessionHint → panel attention) ── */

test('integration: /admit commit notifies journal-tail and relays the hinted panel attention to other players', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-presence-admit-'));
  const designDir = join(root, 'design');
  const pageAbs = join(designDir, 'prototypes/demo/canvas.svelte');
  mkdirSync(dirname(pageAbs), { recursive: true });
  writeFileSync(pageAbs, PAGE_SOURCE);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const host = openCollabHost(designDir, { ownFsWatch: false });
  t.after(() => void host.dispose());

  const httpServer = createServer((_req: IncomingMessage, res: ServerResponse) => {
    res.statusCode = 204;
    res.end();
  });
  const gateway = attachPresenceGateway(httpServer, { designDir });
  await new Promise<void>((resolveListen) => httpServer.listen(0, '127.0.0.1', resolveListen));
  const wsUrl = `ws://127.0.0.1:${(httpServer.address() as AddressInfo).port}${PRESENCE_WS_PATH}`;
  t.after(() => {
    gateway.close();
    httpServer.close();
    httpServer.closeAllConnections();
  });

  const alice = await connect(wsUrl, { name: 'alice' });
  const aliceWelcome = await alice.next('welcome');
  const bob = await connect(wsUrl, { name: 'bob' });
  await bob.next('welcome');

  // adopt the page first (the §8 cycle lands identity + buffers), then
  // build the browser panel's own mirror (collab-api.test.ts's lane):
  // import the canonical update, anchor on the raised buffer
  const adoption = await host.syncExternalChange(pageAbs);
  assert.equal(adoption.kind, 'adopted');
  await bob.next('journal-tail'); // drain the adoption's own tail — the admit's tail is the one under assertion
  const mirror = new LoroDoc();
  mirror.setPeerId(0xc0ffee);
  const syncResponse = await resolveCollabApiRequest(host, 'sync', {});
  assert.equal(syncResponse.status, 200);
  const syncBody = syncResponse.body as { updateB64: string };
  if (syncBody.updateB64.length > 0) mirror.import(Buffer.from(syncBody.updateB64, 'base64'));
  const raised = mirror.getText(containerKeyOf('a1', 'raised'));
  const cursor = raised.getCursor(0, 0);
  assert.ok(cursor !== undefined, 'the mirror anchors on the raised buffer');
  const op = {
    actor: 'human',
    opId: `human:presence-test:${Math.random().toString(36).slice(2, 8)}`,
    baseFrontiers: mirror.frontiers(),
    domain: 'text',
    kind: 'replace',
    target: { componentId: 'a1', buffer: 'raised' },
    cursorBytesB64: bytesToB64(cursor.encode()),
    offset: 0,
    length: 4,
    text: 'false',
    timestamp: Date.now(),
    sessionHint: { playerId: String(aliceWelcome.playerId), field: 'raised', digest: 'raised=true→false' },
  };
  const admit = await resolveCollabApiRequest(host, 'admit', op);
  assert.equal(admit.status, 200, `the admit landed: ${JSON.stringify(admit.body).slice(0, 200)}`);

  // the OTHER player sees journal-tail + alice's panel attention
  const tail = await bob.next('journal-tail');
  assert.equal(tail.seq, host.kernel.stats().journalSeq);
  const presence = await bob.next('presence');
  assert.equal(presence.playerId, aliceWelcome.playerId);
  assert.deepEqual(presence.attention, { kind: 'panel', field: 'raised', digest: 'raised=true→false' });

  alice.close();
  bob.close();
});
