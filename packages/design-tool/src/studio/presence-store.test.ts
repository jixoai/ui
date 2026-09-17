/**
 * presence-store.test.ts — the collab-presence §1/§4 contract on the
 * studio's presence half: the FROZEN message vocabulary (welcome/join/
 * leave/presence/journal-tail in, cursor/attention/virtual-mouse/ping
 * out), the connect URL's identity grammar (?name=&kind=&token=), and
 * the store's state machine driven end-to-end through structural fakes
 * (a fake WebSocket, a fake clock, a fake sessionStorage — the
 * panel-collab transport-seam style; no DOM, no sockets).
 *
 * Laws under test (design.md §1/§2/§4):
 *   - the vocabulary parses exactly as frozen and DROPS junk (a bad
 *     frame is never fatal — presence degrades, the studio does not)
 *   - welcome: self {playerId, colorHue}, the server's table rebuilds
 *     wholesale, the token lands in sessionStorage
 *   - join/leave keep the row (the chips show offline) and toggle it
 *   - presence merges cursor/attention/hasMouse; journal-tail emits seq
 *   - a drop marks everyone offline and backs off 500ms·2^n (capped);
 *     a reconnect REUSES the stored token — same identity, same hue
 *   - the self cursor reports ride a 50ms trailing throttle (the
 *     freshest point wins); pings feed the gateway's 5s timeout
 *   - dispose ends the lifecycle — no reconnect after
 *
 * Original need: collab-presence task group 2 (2026-09-16).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PRESENCE_TOKEN_KEY,
  PresenceStore,
  buildClientMessage,
  buildPresenceUrl,
  defaultPlayerName,
  parseServerMessage,
  type PresenceScheduler,
  type PresenceSocket,
} from './presence-store.ts';

/* ── structural fakes ─────────────────────────────────────────────────── */

/** a deterministic clock: tasks fire in schedule order, time only moves on advance */
function fakeClock() {
  let now = 0;
  let seq = 0;
  const tasks = new Map<number, { at: number; fn: () => void }>();
  const scheduler: PresenceScheduler = {
    setTimeout(fn, ms) {
      seq += 1;
      tasks.set(seq, { at: now + (ms as number), fn });
      return seq;
    },
    clearTimeout(handle) {
      tasks.delete(handle as number);
    },
    now: () => now,
  };
  const advance = (ms: number): void => {
    const end = now + ms;
    for (;;) {
      let due: { id: number; at: number; fn: () => void } | null = null;
      for (const [id, task] of tasks) {
        if (task.at <= end && (due === null || task.at < due.at)) due = { id, at: task.at, fn: task.fn };
      }
      if (due === null) break;
      tasks.delete(due.id);
      now = due.at;
      due.fn();
    }
    now = end;
  };
  return { scheduler, advance, pending: () => tasks.size, now: () => now };
}

/** the send/close surface of a WebSocket, plus the test drivers */
class FakeSocket {
  static opened: FakeSocket[] = [];
  readonly url: string;
  readonly sent: string[] = [];
  closed = false;
  onopen: (() => void) | null = null;
  onmessage: ((event: { readonly data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    FakeSocket.opened.push(this);
  }

  send(text: string): void {
    this.sent.push(text);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.onclose?.();
  }

  /* drivers */
  open(): void {
    this.onopen?.();
  }

  receive(payload: unknown): void {
    this.onmessage?.({ data: JSON.stringify(payload) });
  }

  receiveRaw(text: string): void {
    this.onmessage?.({ data: text });
  }

  drop(): void {
    this.onclose?.();
  }
}

function fakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string): string | null => map.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      map.set(key, value);
    },
    dump: (): ReadonlyMap<string, string> => map,
  };
}

function makeStore(overrides: Record<string, unknown> = {}) {
  FakeSocket.opened = [];
  const clock = fakeClock();
  const storage = fakeStorage();
  const store = new PresenceStore({
    socketFactory: (url: string): PresenceSocket => new FakeSocket(url),
    scheduler: clock.scheduler,
    storage,
    name: 'tester',
    ...overrides,
  } as ConstructorParameters<typeof PresenceStore>[0]);
  return { store, clock, storage, sockets: () => FakeSocket.opened };
}

/* ── the §1 vocabulary (pure codec) ───────────────────────────────────── */

test('welcome parses: playerId/token/colorHue + the players table, junk players dropped', () => {
  const message = parseServerMessage(
    JSON.stringify({
      type: 'welcome',
      playerId: 'p3',
      token: 'a'.repeat(32),
      colorHue: 219,
      players: [
        { playerId: 'p1', name: 'owner', kind: 'human', colorHue: 73, hasMouse: true, attention: null },
        { playerId: 'p2', name: 'dsh', kind: 'ai', colorHue: 146, hasMouse: false, attention: { kind: 'canvas', component: 'press-button', instance: 1, frameId: null } },
        'junk',
      ],
    }),
  );
  assert.ok(message !== null && message.type === 'welcome');
  assert.equal(message.playerId, 'p3');
  assert.equal(message.colorHue, 219);
  assert.equal(message.players.length, 2);
  assert.equal(message.players[1].attention?.kind, 'canvas');
});

test('join/leave/presence/journal-tail parse to their frozen shapes', () => {
  const join = parseServerMessage(JSON.stringify({ type: 'join', player: { playerId: 'p2', name: 'dsh', kind: 'ai', colorHue: 146, hasMouse: false, attention: null } }));
  assert.ok(join !== null && join.type === 'join' && join.player.playerId === 'p2');

  const leave = parseServerMessage(JSON.stringify({ type: 'leave', playerId: 'p1' }));
  assert.ok(leave !== null && leave.type === 'leave' && leave.playerId === 'p1');

  const presence = parseServerMessage(
    JSON.stringify({
      type: 'presence',
      playerId: 'p2',
      cursor: { surface: 'canvas', x: 12.5, y: -3 },
      attention: { kind: 'panel', field: 'prop-raised', digest: 'raised=false→true' },
      hasMouse: true,
    }),
  );
  assert.ok(presence !== null && presence.type === 'presence');
  assert.equal(presence.cursor?.surface, 'canvas');
  assert.equal(presence.attention?.kind, 'panel');

  const tail = parseServerMessage(JSON.stringify({ type: 'journal-tail', seq: 1234 }));
  assert.ok(tail !== null && tail.type === 'journal-tail' && tail.seq === 1234);
});

test('off-vocabulary frames drop to null — junk is never fatal', () => {
  assert.equal(parseServerMessage('not json'), null);
  assert.equal(parseServerMessage('null'), null);
  assert.equal(parseServerMessage('{"type":"unknown"}'), null);
  assert.equal(parseServerMessage('{"type":"welcome","playerId":"p1"}'), null); // missing token/hue/players
  assert.equal(parseServerMessage('{"type":"leave"}'), null); // missing playerId
  assert.equal(parseServerMessage('{"type":"presence","playerId":"p1","hasMouse":"yes"}'), null); // wrong type
  assert.equal(parseServerMessage('{"type":"journal-tail","seq":"x"}'), null);
  assert.equal(
    parseServerMessage(JSON.stringify({ type: 'presence', playerId: 'p1', cursor: { surface: 'bogus', x: 0, y: 0 }, attention: null, hasMouse: true })),
    null,
  ); // unknown surface
});

test('client frames serialize verbatim to the frozen §1 shapes', () => {
  assert.equal(buildClientMessage({ type: 'cursor', surface: 'canvas', x: 1, y: 2 }), '{"type":"cursor","surface":"canvas","x":1,"y":2}');
  assert.equal(
    buildClientMessage({ type: 'attention', focus: { kind: 'panel', field: 'prop-raised', digest: 'raised=false→true' } }),
    '{"type":"attention","focus":{"kind":"panel","field":"prop-raised","digest":"raised=false→true"}}',
  );
  assert.equal(buildClientMessage({ type: 'attention', focus: null }), '{"type":"attention","focus":null}');
  assert.equal(buildClientMessage({ type: 'virtual-mouse', enabled: true }), '{"type":"virtual-mouse","enabled":true}');
  assert.equal(buildClientMessage({ type: 'ping' }), '{"type":"ping"}');
});

/* ── the connect URL + identity defaults ─────────────────────────────── */

test('buildPresenceUrl: name/kind/token grammar; the token param is absent when there is none', () => {
  assert.equal(buildPresenceUrl('/__design__/ws', { name: 'designer', kind: 'human' }), '/__design__/ws?name=designer&kind=human');
  assert.equal(
    buildPresenceUrl('/__design__/ws', { name: 'wo rld', kind: 'ai', token: 'abc' }),
    '/__design__/ws?name=wo+rld&kind=ai&token=abc',
  );
  assert.equal(
    buildPresenceUrl('/__design__/ws', { name: 'designer', kind: 'human', token: null }),
    '/__design__/ws?name=designer&kind=human',
  );
});

test('defaultPlayerName: human-<rand4> from the injected rand', () => {
  assert.equal(defaultPlayerName(() => 'abcdefgh'), 'human-abcd');
  const name = defaultPlayerName();
  assert.match(name, /^human-[a-z0-9]{4}$/);
});

/* ── the state machine (fake ws + clock + storage) ───────────────────── */

test('connect: the URL carries name+kind+token; welcome sets self, rebuilds the table, stores the token', () => {
  const { store, clock, storage, sockets } = makeStore();
  storage.setItem(PRESENCE_TOKEN_KEY, 'tok-1');
  store.connect();
  const socket = sockets()[0];
  assert.ok(socket !== undefined);
  assert.equal(socket.url, '/__design__/ws?name=tester&kind=human&token=tok-1');

  socket.open(); // the client pings first (§1: the keepalive window opens)
  assert.deepEqual(JSON.parse(socket.sent[0]), { type: 'ping' });

  socket.receive({
    type: 'welcome',
    playerId: 'p2',
    token: 'tok-2',
    colorHue: 146,
    players: [{ playerId: 'p1', name: 'owner', kind: 'human', colorHue: 73, hasMouse: true, attention: null }],
  });
  const snap = store.snapshot();
  assert.equal(snap.status, 'online');
  assert.deepEqual(snap.self, { playerId: 'p2', name: 'tester', kind: 'human', colorHue: 146 });
  assert.equal(snap.players.length, 1); // self is NOT in its own table
  assert.equal(snap.players[0].playerId, 'p1');
  assert.equal(storage.dump().get(PRESENCE_TOKEN_KEY), 'tok-2'); // the credential outlives the socket
  assert.equal(clock.pending() > 0, true); // the ping chain is armed
});

test('join adds online; leave KEEPS the row offline (the chips show the state); rejoin flips it back', () => {
  const { store, sockets } = makeStore();
  store.connect();
  const socket = sockets()[0];
  socket.open();
  socket.receive({ type: 'welcome', playerId: 'p1', token: 't', colorHue: 73, players: [] });

  socket.receive({ type: 'join', player: { playerId: 'p2', name: 'dsh', kind: 'ai', colorHue: 146, hasMouse: false, attention: null } });
  assert.equal(store.snapshot().players[0]?.online, true);

  socket.receive({ type: 'presence', playerId: 'p2', cursor: { surface: 'shell', x: 5, y: 6 }, attention: null, hasMouse: true });
  assert.equal(store.snapshot().players[0]?.cursor?.x, 5);

  socket.receive({ type: 'leave', playerId: 'p2' });
  let gone = store.snapshot().players[0];
  assert.equal(gone?.online, false);
  assert.equal(gone?.cursor, null); // the indicator state drops with it
  assert.equal(gone?.playerId, 'p2'); // …but the ROW stays (offline chip)

  socket.receive({ type: 'join', player: { playerId: 'p2', name: 'dsh', kind: 'ai', colorHue: 146, hasMouse: false, attention: null } });
  assert.equal(store.snapshot().players[0]?.online, true);
});

test('presence merges cursor/attention/hasMouse; a repeated leave is a no-op', () => {
  const { store, sockets } = makeStore();
  store.connect();
  const socket = sockets()[0];
  socket.open();
  socket.receive({ type: 'welcome', playerId: 'p1', token: 't', colorHue: 73, players: [] });
  socket.receive({ type: 'join', player: { playerId: 'p2', name: 'dsh', kind: 'ai', colorHue: 146, hasMouse: false, attention: null } });

  socket.receive({ type: 'presence', playerId: 'p2', cursor: null, attention: { kind: 'canvas', component: 'press-button', instance: 2, frameId: 'f1' }, hasMouse: true });
  let player = store.snapshot().players[0];
  assert.equal(player?.hasMouse, true);
  assert.deepEqual(player?.attention, { kind: 'canvas', component: 'press-button', instance: 2, frameId: 'f1' });

  socket.receive({ type: 'presence', playerId: 'p2', cursor: null, attention: null, hasMouse: false }); // the virtual-mouse flip
  player = store.snapshot().players[0];
  assert.equal(player?.hasMouse, false);

  socket.receive({ type: 'leave', playerId: 'p9' }); // unknown player — ignored
  assert.equal(store.snapshot().players.length, 1);
});

test('journal-tail emits the seq through the event seam', () => {
  const { store, sockets } = makeStore();
  const tails: number[] = [];
  store.on('journal-tail', (seq) => tails.push(seq as number));
  store.connect();
  const socket = sockets()[0];
  socket.open();
  socket.receive({ type: 'welcome', playerId: 'p1', token: 't', colorHue: 73, players: [] });
  socket.receive({ type: 'journal-tail', seq: 900 });
  socket.receive({ type: 'journal-tail', seq: 901 });
  assert.deepEqual(tails, [900, 901]);
});

test('a drop marks everyone offline, backs off 500ms·2^n, and reconnects with the SAME token', () => {
  const { store, clock, storage, sockets } = makeStore();
  storage.setItem(PRESENCE_TOKEN_KEY, 'tok-1');
  store.connect();
  const first = sockets()[0];
  first.open();
  first.receive({ type: 'welcome', playerId: 'p1', token: 'tok-1', colorHue: 73, players: [{ playerId: 'p2', name: 'x', kind: 'human', colorHue: 146, hasMouse: true, attention: null }] });

  first.drop();
  const offline = store.snapshot();
  assert.equal(offline.status, 'offline');
  assert.equal(offline.players[0]?.online, false); // every remote goes dark
  assert.equal(sockets().length, 1); // no instant reconnect

  clock.advance(499);
  assert.equal(sockets().length, 1, 'the 500ms first backoff has not elapsed');
  clock.advance(1);
  assert.equal(sockets().length, 2, 'the first backoff fires at 500ms');
  assert.equal(sockets()[1].url.includes('token=tok-1'), true, 'the reconnect reuses the stored identity');

  // a second drop backs off 1000ms (2^1)
  sockets()[1].drop();
  clock.advance(999);
  assert.equal(sockets().length, 2);
  clock.advance(1);
  assert.equal(sockets().length, 3);

  // a welcome RESETS the ladder: the next drop starts at 500ms again
  sockets()[2].open();
  sockets()[2].receive({ type: 'welcome', playerId: 'p1', token: 'tok-1', colorHue: 73, players: [] });
  sockets()[2].drop();
  clock.advance(500);
  assert.equal(sockets().length, 4);
});

test('the backoff caps at 15s', () => {
  const { store, clock, sockets } = makeStore();
  store.connect();
  sockets()[0].open();
  sockets()[0].receive({ type: 'welcome', playerId: 'p1', token: 't', colorHue: 73, players: [] });
  // the ladder: 500·2^n capped — 500, 1000, 2000, 4000, 8000, then 15000 forever
  const backoffs = [500, 1000, 2000, 4000, 8000, 15000, 15000];
  for (const backoff of backoffs) {
    const current = sockets()[sockets().length - 1];
    current.open();
    current.drop();
    clock.advance(backoff - 1);
    const count = sockets().length;
    clock.advance(1);
    assert.equal(sockets().length, count + 1, `backoff ${backoff} reconnects exactly at the boundary`);
  }
});

test('self cursor reports ride the 50ms trailing throttle — the freshest point wins', () => {
  const { store, clock, sockets } = makeStore();
  store.connect();
  const socket = sockets()[0];
  socket.open();
  socket.receive({ type: 'welcome', playerId: 'p1', token: 't', colorHue: 73, players: [] });
  const before = socket.sent.length;

  store.reportCursor('shell', 1, 1);
  store.reportCursor('shell', 2, 2);
  store.reportCursor('canvas', 3, 3);
  assert.equal(socket.sent.length, before, 'nothing sends inside the throttle window');

  clock.advance(50);
  assert.equal(socket.sent.length, before + 1); // ONE frame
  assert.deepEqual(JSON.parse(socket.sent[socket.sent.length - 1]), { type: 'cursor', surface: 'canvas', x: 3, y: 3 });

  // the window re-arms per burst
  store.reportCursor('shell', 9, 9);
  clock.advance(50);
  assert.deepEqual(JSON.parse(socket.sent[socket.sent.length - 1]), { type: 'cursor', surface: 'shell', x: 9, y: 9 });
});

test('offline reports are dropped, not queued: the stream resumes on reconnect', () => {
  const { store, clock, sockets } = makeStore();
  store.connect();
  const socket = sockets()[0];
  socket.open();
  socket.receive({ type: 'welcome', playerId: 'p1', token: 't', colorHue: 73, players: [] });
  socket.drop();
  store.reportCursor('shell', 1, 1);
  clock.advance(2000); // the pending throttle fires mid-offline
  const offlineSent = sockets()[0].sent.filter((frame) => frame.includes('cursor')).length;
  assert.equal(offlineSent, 0, 'no cursor leaves a dead socket');

  clock.advance(500);
  const next = sockets()[1];
  next.open();
  next.receive({ type: 'welcome', playerId: 'p1', token: 't', colorHue: 73, players: [] });
  store.reportCursor('shell', 4, 4);
  clock.advance(50);
  assert.deepEqual(JSON.parse(next.sent[next.sent.length - 1]), { type: 'cursor', surface: 'shell', x: 4, y: 4 });
});

test('attention and virtual-mouse send honestly (no throttle), only while online', () => {
  const { store, sockets } = makeStore();
  store.connect();
  const socket = sockets()[0];
  socket.open();
  socket.receive({ type: 'welcome', playerId: 'p1', token: 't', colorHue: 73, players: [] });
  const before = socket.sent.length;
  store.reportAttention({ kind: 'panel', field: 'prop-raised', digest: 'raised=false→true' });
  store.setVirtualMouse(true);
  assert.equal(socket.sent.length, before + 2);

  socket.drop();
  const count = socket.sent.length;
  store.reportAttention(null);
  store.setVirtualMouse(false);
  assert.equal(socket.sent.length, count);
});

test('the ping chain feeds the gateway every 2.5s', () => {
  const { store, clock, sockets } = makeStore();
  store.connect();
  const socket = sockets()[0];
  socket.open();
  socket.receive({ type: 'welcome', playerId: 'p1', token: 't', colorHue: 73, players: [] });
  const pings = (): number => socket.sent.filter((frame) => frame === '{"type":"ping"}').length;
  assert.equal(pings(), 1); // onopen
  clock.advance(2500);
  assert.equal(pings(), 2);
  clock.advance(2500);
  assert.equal(pings(), 3);
});

test('dispose ends the lifecycle — no reconnect, listeners released', () => {
  const { store, clock, sockets } = makeStore();
  let notified = 0;
  store.subscribe(() => {
    notified += 1;
  });
  store.connect();
  const socket = sockets()[0];
  socket.open();
  socket.receive({ type: 'welcome', playerId: 'p1', token: 't', colorHue: 73, players: [] });
  store.dispose();
  assert.equal(socket.closed, true);
  socket.drop(); // the close event arrives after dispose — nothing reconnects
  clock.advance(60000);
  assert.equal(sockets().length, 1);
  assert.equal(clock.pending(), 0); // every timer died (ping, throttle, backoff)
  const notifiedAtDispose = notified;
  socket.receive({ type: 'join', player: { playerId: 'p9', name: 'x', kind: 'human', colorHue: 1, hasMouse: true, attention: null } });
  assert.equal(notified, notifiedAtDispose); // subscribers released
});

test('snapshot orders players by joining ordinal (p2 before p10)', () => {
  const { store, sockets } = makeStore();
  store.connect();
  const socket = sockets()[0];
  socket.open();
  socket.receive({ type: 'welcome', playerId: 'p1', token: 't', colorHue: 73, players: [] });
  for (const id of ['p10', 'p2', 'p3']) {
    socket.receive({ type: 'join', player: { playerId: id, name: id, kind: 'human', colorHue: 1, hasMouse: true, attention: null } });
  }
  assert.deepEqual(
    store.snapshot().players.map((player) => player.playerId),
    ['p2', 'p3', 'p10'],
  );
});
