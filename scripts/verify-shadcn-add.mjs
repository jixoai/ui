#!/usr/bin/env node
// Real-consumer clean-install proof harness
// (tw4-css-modularization P0.2 → data-driven rewrite, 2026-08-30
// registry-install-integrity tasks 2b.1 + 2b.2).
//
// Proves the FOLDER-SHAPED install contract with real consumers —
// not inferred from `shadcn build` output (r1 B3 / r4 B12 rulings).
// The harness is DATA-DRIVEN: a case is a plain object (item list +
// App.svelte + optional overrides), so later changes (chart,
// input-group, button-group, patterns) register themselves by adding
// one CASES entry — no harness edits.
//
// Per case, the SAME pipeline runs:
//   1. a FRESH Vite consumer is materialized (template copy: the base
//      dependency tree installs ONCE, each case still gets a virgin
//      source tree),
//   2. `shadcn add @jixoai/…` installs from the GENERATED public/r/
//      payloads (step 0 re-runs `shadcn build` — CI calls this harness
//      before build-site, so the harness must produce its own input),
//   3. GENERIC assertions, derived from registry.json — no hand lists:
//      every file the case's items own (files[].target, alias-mapped)
//      lands at its canonical consumer path; every declared npm
//      dependency arrives in package.json; a case's `forbidden` tokens
//      appear in no payload edge and no installed file,
//   4. the case's App.svelte imports the CANONICAL entry (folder
//      barrel) and `vite build` must pass.
//
// Standing cases:
//   workbench          multi-item install (accordion/toast/code-card/
//                      progressive-blur/list-item) + chain assertions
//   isolated-list-item ONLY list-item: closure must self-deliver,
//                      every canonical target exactly once tree-wide
//   ghostty-term       clean install, zero wasm payloads, virtual-module
//                      stub keeps the data contract (design D7 6a)
//   color-picker       pre-seeded consumer mirrors the standing
//                      undeclared-import debt; $lib/color-utils.ts must
//                      arrive (regression lock, design D7 6b)
//   hero-section       resolves its dependency closure AND requests no
//                      @jixoai/reveal (the 2026-08-30 ghost — task 2b.2)
//   icon-default       DEFAULT icon tier (icon-component-pipeline C1,
//                      design §4 tier 1): a clean consumer adds
//                      @jixoai/icon + @jixoai/icon-set with NO plugin
//                      wired — the committed artifact is inline-only
//                      (zero virtual imports), the build passes and the
//                      SSR/prerendered HTML paints real glyphs
//
// After the cases, ONE forced-overflow fixture (design §4 tier 2 + §5
// sentinel) runs three sub-probes over a REAL vite project whose
// artifact HAS lazy chunks (the 38 built-ins packed under a per-icon
// budget): WIRED (jixoai({ icons: { library } }) → lazy chunk assets
// emit + preloadIcons resolves), UNWIRED (plugin present, library not
// configured → the build fails with the EXACT sentinel bytes), and
// RUNTIME (a wired-but-broken server → the artifact's LAZY catch
// rethrows the sentinel with the drift failure as cause).
//
// Usage (from repo root):
//   node scripts/verify-shadcn-add.mjs
// Scratch lives under .agents/fixtures/ (gitignored), wiped per run.

import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { resolveShadcnBin } from './lib/vite-bin.mjs';
import { acquireLock, ChildRegistry, DieSignal } from './lib/child-lifecycle.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const scratch = join(root, '.agents/fixtures/2026-08-30-registry-install-integrity');
const registryDir = join(scratch, 'registry', 'r');
const publicR = join(root, 'public', 'r');
// the single-instance lock lives OUTSIDE the scratch tree (the scratch is
// wiped per run) and is a real mutex — atomic mkdir acquire, stale
// takeover via rename-retirement, owner-checked release (B1)
const LOCK_DIR = join(root, '.agents/fixtures/shadcn-add.lock');

// ── the lifecycle spine (B2): every long-lived child registers here;
// finish() is the ONE idempotent exit path — normal tail, die() throws,
// uncaught errors and SIGINT/SIGTERM all funnel through it, so the reap
// and the lock release cannot be bypassed ─────────────────────────────
const CHILDREN = new ChildRegistry();
let finished = false;
// assigned once the lock is acquired below; the noop default keeps the
// signal/uncaught paths safe before (or without) a held lock
let releaseLock = () => {};
const finish = async (code, { label = '' } = {}) => {
  if (finished) return;
  finished = true;
  const report = await CHILDREN.reap();
  if (report.terminated.length) {
    console.log(`[lifecycle] reaped ${report.terminated.length} child group(s): ${report.terminated.join(', ')}${label ? ` (${label})` : ''}`);
  }
  if (report.escalated.length) console.error(`[lifecycle] SIGKILL escalation needed for: ${report.escalated.join(', ')}`);
  if (report.leaked.length) {
    // a leaked group after SIGKILL is a lifecycle-contract breach — it
    // must fail the run, never ride a green exit code (r2 B2)
    console.error(`[lifecycle] LEAKED after SIGKILL (unreapable): ${report.leaked.join(', ')}`);
    code = 1;
  }
  releaseLock();
  process.exit(code);
};
process.on('SIGINT', () => void finish(130, { label: 'SIGINT' }));
process.on('SIGTERM', () => void finish(143, { label: 'SIGTERM' }));
process.on('exit', () => CHILDREN.reapSync());
process.on('uncaughtException', (e) => {
  // die() throws DieSignal after building its message; this is the ONE
  // logging point for it (a top-level throw in ESM lands here too)
  console.error(`[verify-shadcn-add] ${e instanceof DieSignal ? e.message : `uncaught: ${e?.stack ?? e}`}`);
  void finish(1, { label: 'uncaught' });
});

const die = (msg) => {
  throw new DieSignal(msg);
};

// ── self-test modes (impl-review r1+r2 fixtures): drive the REAL kernel
// with REAL signals, REAL subprocesses and a cross-process contention
// probe — timeout-style escalation with descendants, SIGINT reaping
// across processes, lock denial, stale-lock takeover, atomic-publish
// contention. The kernel is imported from lib/child-lifecycle.mjs,
// never re-implemented here.
if (process.argv.includes('--lock-deny')) {
  // internal: a probe that must die because someone else holds the lock
  // (pre-acquire — no children, no lock held by us: a direct exit is safe)
  acquireLock(LOCK_DIR);
  console.error('[lock-deny] unexpectedly acquired — probe is broken');
  process.exit(42);
}
if (process.argv.includes('--lock-stress')) {
  // internal: N acquire/release cycles under contention; the shared
  // counter file is read-modify-written ONLY while holding the lock, so
  // a max > 1 proves two processes held it simultaneously. Contenders
  // WAIT for the lock (retry on live-holder) — contention is the point
  const cycles = Number(process.argv[process.argv.indexOf('--lock-stress') + 1] ?? '25');
  const counterFile = process.argv[process.argv.indexOf('--lock-stress') + 2];
  const rmw = (fn) => {
    const cur = JSON.parse(readFileSync(counterFile, 'utf8'));
    const next = fn(cur);
    writeFileSync(counterFile, JSON.stringify(next));
  };
  const acquireWaiting = () => {
    for (;;) {
      try {
        return acquireLock(LOCK_DIR);
      } catch (e) {
        if (e instanceof DieSignal) continue; // someone else holds it — spin
        throw e;
      }
    }
  };
  for (let i = 0; i < cycles; i++) {
    const rl = acquireWaiting();
    rmw((c) => ({ holders: c.holders + 1, max: Math.max(c.max, c.holders + 1) }));
    rmw((c) => ({ ...c, holders: c.holders - 1 }));
    rl();
  }
  process.exit(0);
}
if (process.argv.includes('--victim')) {
  // internal: hold the lock + two sleeper groups, report readiness — and
  // let the SPINE's own signal path do the reaping (finish → CHILDREN
  // reap → releaseLock → exit 130); the victim registers no handler of
  // its own because the spine path IS the contract under test
  releaseLock = acquireLock(LOCK_DIR);
  const sleepers = [0, 1].map(() =>
    spawn(process.execPath, ['-e', 'setInterval(() => {}, 1 << 30)'], { stdio: 'ignore', detached: true })
  );
  sleepers.forEach((s, i) => CHILDREN.add(s.pid, `victim sleeper ${i}`));
  console.log(`[victim] ready sleepers=${sleepers.map((s) => s.pid).join(',')} lock=${LOCK_DIR}`);
  await new Promise(() => {}); // alive until the spine's SIGINT path reaps + releases + exits 130
}

// the lock is the FIRST thing this process does to the shared world —
// before the payload build, before the scratch wipe (a second run's
// rmSync would vaporize the first run's registry mid-case, observed as
// mutual 404s; a stale lock names its dead holder and is taken over
// atomically, never by wiping the scratch first)
try {
  releaseLock = acquireLock(LOCK_DIR);
} catch (e) {
  // no children exist yet and no lock is held by us — a direct exit is safe
  if (e instanceof DieSignal) {
    console.error(`[verify-shadcn-add] ${e.message}`);
    process.exit(1);
  }
  throw e;
}

if (process.argv.includes('--lifecycle-self-test')) {
  const pass = (m) => console.log(`  PASS  ${m}`);
  // every failure exits through the spine (reap + release + exit 1) —
  // a direct process.exit here would leak the very things under test
  const fail = async (m) => {
    console.error(`  FAIL  ${m}`);
    await finish(1, { label: 'self-test failure' });
  };

  // 1. the lock this process already holds is well-formed (owner = us)
  //    and denies a second instance cross-process (the real TOCTOU probe)
  {
    const owner = JSON.parse(readFileSync(join(LOCK_DIR, 'owner.json'), 'utf8'));
    if (owner.pid !== process.pid) await fail(`lock owner is ${owner.pid}, expected ${process.pid}`);
    pass(`lock held: ${LOCK_DIR} (owner = self, token-bound)`);
    const deny = spawnSync(process.execPath, [process.argv[1], '--lock-deny'], { encoding: 'utf8' });
    if (deny.status === 0) await fail('lock-deny probe unexpectedly succeeded');
    if (!String(deny.stderr).includes('holds')) await fail(`lock-deny probe died for the wrong reason:\n${deny.stderr}`);
    pass('a live holder denies a second instance (cross-process)');
  }

  // readiness markers: a child is only reaped AFTER its SIGTERM handler
  // is installed (a half-booted child proves nothing) — the handler
  // scripts drop a marker file the moment they are armed. Marker names
  // are UNIQUE PER RUN (impl-review r3 B1: a fixed name let the second
  // run see the first run's marker and TERM a half-booted child — the
  // residue also faked readiness); stale markers from crashed runs are
  // swept at self-test start
  const fixturesDir = join(root, '.agents', 'fixtures');
  const RUN_TOKEN = `${process.pid}-${Date.now().toString(36)}`;
  for (const f of readdirSync(fixturesDir)) {
    if (f.startsWith('lifecycle-selftest-')) rmSync(join(fixturesDir, f), { force: true });
  }
  const markerFor = (name) => join(fixturesDir, `lifecycle-selftest-${RUN_TOKEN}-${name}.ready`);
  const waitMarker = async (name, what, ms = 8000) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (existsSync(markerFor(name))) return;
      await new Promise((r) => setTimeout(r, 50));
    }
    await fail(`timeout waiting for ${what} to arm its SIGTERM handler`);
  };
  const armedSleeper = (name, immune) =>
    spawn(
      process.execPath,
      [
        '-e',
        `require('node:fs').writeFileSync(${JSON.stringify(markerFor(name))}, '');${immune ? 'process.on("SIGTERM", () => {});' : ''}setInterval(() => {}, 1 << 30)`,
      ],
      { stdio: 'ignore', detached: true },
    );

  // 2. escalation: a SIGTERM-immune sleeper must fall to SIGKILL, a
  //    well-behaved one to SIGTERM — and NOTHING may leak
  const stub = armedSleeper('stub', true);
  const nice = armedSleeper('nice', false);
  CHILDREN.add(stub.pid, 'stubborn (SIGTERM-immune) sleeper');
  CHILDREN.add(nice.pid, 'well-behaved sleeper');
  await waitMarker('stub', 'the stubborn sleeper');
  await waitMarker('nice', 'the well-behaved sleeper');
  const report = await CHILDREN.reap({ graceMs: 1200, pollMs: 50 });
  if (!report.escalated.includes(stub.pid)) await fail(`the SIGTERM-immune sleeper was not escalated: ${JSON.stringify(report)}`);
  if (report.escalated.includes(nice.pid)) await fail(`the well-behaved sleeper needed escalation: ${JSON.stringify(report)}`);
  if (report.leaked.length) await fail(`leaked after SIGKILL: ${report.leaked.join(', ')}`);
  pass('reap: TERM sufficed for the well-behaved, KILL for the stubborn, zero leaks');

  // 2b. GROUP reaping (r2 B2): a leader that dies on TERM while a
  //     same-group DESCENDANT ignores it must still be escalated and
  //     leave nothing behind — leader-PID-only liveness would miss it
  {
    const leader = spawn(
      process.execPath,
      [
        '-e',
        `const { spawn } = require('node:child_process');
         spawn(process.execPath, ['-e', "require('node:fs').writeFileSync(process.env.MARKER, ''); process.on('SIGTERM', () => {}); setInterval(() => {}, 1 << 30)"], { stdio: 'ignore' });
         setInterval(() => {}, 1 << 30);`,
      ],
      { stdio: 'ignore', detached: true, env: { ...process.env, MARKER: markerFor('descendant') } },
    );
    CHILDREN.add(leader.pid, 'leader (TERM-responsive) with immune descendant');
    await waitMarker('descendant', 'the immune descendant');
    const t0 = Date.now();
    const rep = await CHILDREN.reapOne({ pid: leader.pid, pgid: leader.pid }, { graceMs: 1200, pollMs: 50 });
    const elapsed = Date.now() - t0;
    if (!rep.escalated.includes(leader.pid)) await fail(`the immune descendant did not force group escalation: ${JSON.stringify(rep)}`);
    if (rep.leaked.length) await fail(`descendant leaked after group KILL: ${JSON.stringify(rep)}`);
    if (elapsed > 8000) await fail(`reapOne not bounded (${elapsed}ms) against an immune group`);
    pass(`group reap: leader died to TERM, immune descendant fell to group KILL in ${elapsed}ms, zero leaks`);
  }

  // 2c. ENTRY RETIREMENT (r4 B1): (a) a naturally-exited group retires
  //     on the next reap — no stale pgid survives for reapSync; (b) a
  //     reapOne invoked through an EQUAL-VALUED but DISTINCT object
  //     (the shape every timeout call site uses) still retires the
  //     registered entry — reference identity removed nothing before
  {
    const shortLived = spawn(process.execPath, ['-e', 'process.exit(0)'], { stdio: 'ignore', detached: true });
    CHILDREN.add(shortLived.pid, 'short-lived (natural exit) probe');
    await new Promise((r) => setTimeout(r, 300)); // let it die on its own
    await CHILDREN.reap();
    if (CHILDREN.entries.some((c) => c.pid === shortLived.pid)) await fail('a naturally-exited entry survived reap() — reapSync would signal its stale pgid');
    pass('natural exit: the dead entry retires on the next reap');

    const retired = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1 << 30)'], { stdio: 'ignore', detached: true });
    CHILDREN.add(retired.pid, 'timeout-style reap probe');
    await new Promise((r) => setTimeout(r, 400));
    const adHoc = { pid: retired.pid, pgid: retired.pid, command: 'ad-hoc equal-valued object' };
    const rep = await CHILDREN.reapOne(adHoc, { graceMs: 800, pollMs: 50 });
    if (rep.leaked.length) await fail(`timeout-style probe leaked: ${JSON.stringify(rep)}`);
    if (CHILDREN.entries.some((c) => c.pid === retired.pid)) await fail('reapOne through an equal-valued ad-hoc object did not retire the registered entry (r4 B1)');
    pass('timeout-style reap: entry retires through an equal-valued ad-hoc object');
  }

  // 3. stale-lock takeover: a dead holder's lock is retired atomically
  releaseLock();
  const deadHolder = spawnSync(process.execPath, ['-e', 'process.exit(0)']);
  mkdirSync(LOCK_DIR, { recursive: true });
  writeFileSync(join(LOCK_DIR, 'owner.json'), `${JSON.stringify({ pid: deadHolder.pid, started: 'long ago' })}\n`);
  const rl2 = acquireLock(LOCK_DIR);
  rl2();
  if (existsSync(LOCK_DIR)) await fail('release left the lock dir behind');
  pass('a stale lock (dead holder) is taken over via rename-retirement');

  // 3b. ATOMIC PUBLISH under contention (r2 B1): concurrent contenders
  //     acquire/release in tight loops; the counter file is only touched
  //     under the lock, so max > 1 means the mutex failed
  {
    const counterFile = join(root, '.agents', 'fixtures', 'shadcn-add.lock-stress-counter.json');
    writeFileSync(counterFile, JSON.stringify({ holders: 0, max: 0 }));
    const contenders = [0, 1, 2, 3].map(() =>
      spawn(process.execPath, [process.argv[1], '--lock-stress', '25', counterFile], { stdio: 'ignore' })
    );
    const codes = await Promise.all(contenders.map((c) => new Promise((r) => c.on('close', r))));
    if (codes.some((c) => c !== 0)) await fail(`a stress contender exited non-zero: ${codes.join(', ')}`);
    const { holders, max } = JSON.parse(readFileSync(counterFile, 'utf8'));
    if (holders !== 0) await fail(`stress ended with holders=${holders} (a release was lost)`);
    if (max > 1) await fail(`MUTEX BROKEN: ${max} concurrent holders observed under contention`);
    pass('contention probe: 4 contenders × 25 cycles, exactly one holder at all times');
  }

  // 4. SIGINT across processes: the victim's sleepers die and its lock
  //    releases before it exits 130
  const victim = spawn(process.execPath, [process.argv[1], '--victim'], { stdio: ['ignore', 'pipe', 'inherit'] });
  CHILDREN.add(victim.pid, 'self-test SIGINT victim'); // reaped if a later step fails
  let ready = '';
  victim.stdout.on('data', (d) => (ready += d));
  const waitFor = async (pred, what, ms = 10_000) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (pred()) return true;
      await new Promise((r) => setTimeout(r, 100));
    }
    await fail(`timeout waiting for ${what}`);
  };
  await waitFor(() => ready.includes('[victim] ready'), 'victim readiness');
  const sleeperPids = (ready.match(/sleepers=([0-9,]+)/)?.[1] ?? '').split(',').filter(Boolean).map(Number);
  let vcode = null;
  victim.on('exit', (c) => (vcode = c)); // attached BEFORE the kill, or it never fires
  victim.kill('SIGINT');
  await waitFor(() => { try { process.kill(victim.pid, 0); return false; } catch { return true; } }, 'victim exit');
  await waitFor(() => !existsSync(LOCK_DIR), 'victim lock release');
  const sleeperDead = await waitFor(() => sleeperPids.every((p) => { try { process.kill(p, 0); return false; } catch { return true; } }), 'victim sleepers gone');
  if (sleeperDead) pass('SIGINT: victim exited, sleepers reaped, lock released');
  if (vcode !== 130) await fail(`victim exited ${vcode}, expected 130`);

  // sweep THIS run's markers (the next run's startup sweep is the hard
  // guarantee; this keeps the fixtures dir clean in the happy path)
  for (const f of readdirSync(fixturesDir)) {
    if (f.startsWith('lifecycle-selftest-')) rmSync(join(fixturesDir, f), { force: true });
  }
  console.log('[lifecycle-self-test] GREEN — token-bound atomic lock, live denial, TERM/KILL escalation (leaders, descendants, immune groups), stale takeover, contention mutex, cross-process SIGINT reap');
  await finish(0, { label: 'self-test complete' });
}
const templateDir = join(scratch, 'consumer-template');
// A FREE port, probed at runtime: a fixed port gets squatted by a stale
// fixture server (observed: an old run's python http.server survived on
// 5399 and served its own dead registry — silent wrong-registry adds).
const PORT = await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.unref();
  probe.on('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const port = probe.address().port;
    probe.close(() => resolve(port));
  });
});
const BASE = `http://127.0.0.1:${PORT}/r`;

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const source = (p) => readFileSync(join(root, p), 'utf8');
const readdirSafe = (dir) => {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
};
const countTree = (dir, basename) => {
  let hits = 0;
  for (const entry of readdirSafe(dir)) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) hits += countTree(full, basename);
    else if (entry.name === basename) hits += 1;
  }
  return hits;
};
const walkFilesNamed = (dir, predicate, hits = []) => {
  for (const entry of readdirSafe(dir)) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkFilesNamed(full, predicate, hits);
    else if (predicate(entry.name, readFileSync(full, 'utf8'))) hits.push(full);
  }
  return hits;
};

// ── 0. the payload under test: generated public/r/ ─────────────────
// `shadcn build` re-emits public/r/*.json from registry.json — the exact
// bytes a real consumer fetches from https://ui.jixoai.com/r/. CI runs
// this harness BEFORE build-site, so generating here keeps it
// self-sufficient; build-site later re-runs the same build for publish.
console.log('shadcn build (generate public/r payloads)…');
{
  // the CLI spawned directly — the root `build` script means the full
  // site artifact since the scripts overhaul 2026-08-31
  const build = spawnSync(process.execPath, [resolveShadcnBin(root), 'build'], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  if (build.status !== 0) die(`shadcn build failed:\n${build.stdout}\n${build.stderr}`);
}
if (!existsSync(join(publicR, 'registry.json'))) die('public/r/registry.json missing after shadcn build');

// ── 1. scratch registry = the generated public/r payloads ──────────
// the single-instance lock is already held (acquired before anything
// touched the shared world — see acquireLock at the top); the scratch
// wipe below is therefore exclusive by construction
rmSync(scratch, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
mkdirSync(scratch, { recursive: true });
mkdirSync(join(registryDir, 'colors'), { recursive: true });
cpSync(publicR, registryDir, { recursive: true });

// the CLI resolves its default base (incl. r/colors/neutral.json)
// from REGISTRY_URL — cache the palette locally so the fixture never
// depends on ui.shadcn.com reachability (cached across runs in
// gitignored .agents/ so repeat runs work offline)
const neutralCache = join(root, '.agents', 'fixtures', 'colors-neutral.cache.json');
mkdirSync(dirname(neutralCache), { recursive: true });
if (!existsSync(neutralCache)) {
  const neutral = spawnSync('curl', ['-s', '-m', '15', 'https://ui.shadcn.com/r/colors/neutral.json'], { encoding: 'utf8' });
  if (neutral.status !== 0 || !neutral.stdout.trim().startsWith('{')) die('cannot cache r/colors/neutral.json (offline?)');
  writeFileSync(neutralCache, neutral.stdout);
}
cpSync(neutralCache, join(registryDir, 'colors', 'neutral.json'));

// ── 2. local HTTP registry ─────────────────────────────────────────
// python's http.server over node's: the shadcn CLI's undici fetch hit
// Headers Timeout against a bare node keep-alive server; python's
// battle-tested static server (same one build-site documents) does not.
// Process-group lifecycle (B2, impl-review r1): every long-lived child is
// spawned DETACHED in its own group and registered in CHILDREN as
// {pid, pgid, command}; the ONE exit path (finish()) reaps the whole set
// with TERM→grace→KILL escalation and verifies every pid is gone — die()
// throws, signals funnel through finish(), nothing escapes the reap.
const registryRoot = join(scratch, 'registry');
const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', registryRoot], { stdio: 'ignore', detached: true });
CHILDREN.add(server.pid, 'python3 http.server (scratch registry)');
// wait until the registry answers — die loudly if it never does (a silent
// proceed once made every add fail against an unrelated stale server)
{
  let up = false;
  for (let i = 0; i < 50; i++) {
    const probe = spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', `${BASE}/accordion.json`], { encoding: 'utf8' });
    if (probe.stdout.trim() === '200') {
      up = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  if (!up) die(`local registry server did not come up on ${BASE}`);
}

// ── 3. registry.json projection: canonical targets per item ────────
// Components.json aliases are the consumer contract: @ui/* lands under
// the ui alias, @lib/* under the lib alias. THE generic assertion set
// derives from this — hand-written file lists drifted twice (P3-r1).
const registryItems = JSON.parse(source('registry.json')).items ?? JSON.parse(source('registry.json'));
const byName = new Map(registryItems.map((i) => [i.name, i]));
const wwwComponents = JSON.parse(source('apps/www/components.json'));
const aliases = wwwComponents.aliases;
const targetToConsumer = (target) => {
  if (target.startsWith('@ui/')) return `${aliases.ui}/${target.slice(4)}`;
  if (target.startsWith('@lib/')) return `${aliases.lib}/${target.slice(5)}`;
  return null;
};
const canonicalTargets = (itemNames) =>
  itemNames.flatMap((name) => {
    const item = byName.get(name);
    if (!item) die(`registry.json has no item ${name}`);
    return (item.files ?? []).map((f) => targetToConsumer(f.target ?? '')).filter(Boolean);
  });

// ── 4. the CASES (data — extend by adding an entry) ────────────────
const CASES = [
  {
    id: 'workbench',
    items: ['accordion', 'toast', 'code-card', 'progressive-blur', 'list-item'],
    app: `<script lang="ts">
  // THE import-resolution probe: folder entries via the index barrels
  import Accordion, { AccordionItem } from '$lib/ui/accordion';
  import ToastViewport from '$lib/ui/toast';
  import CodeCard from '$lib/ui/code-card';
  import ProgressiveBlur from '$lib/ui/progressive-blur';
  import { Item, ItemGroup, ItemContent, ItemTitle, ItemEnd, ItemChevron, ItemToggle } from '$lib/ui/list-item';
</script>

<Accordion>
  <AccordionItem summary="one">first</AccordionItem>
</Accordion>
<ToastViewport />
<div class="relative h-32 overflow-auto">
  <ProgressiveBlur position="top" reveal="scroll" height="3rem" />
  <p>scrolling content</p>
</div>
<ItemGroup label="consumer probe">
  <Item href="#x">
    <ItemContent><ItemTitle>row</ItemTitle></ItemContent>
    <ItemEnd><ItemChevron /></ItemEnd>
  </Item>
  <ItemToggle label="Fast builds" />
</ItemGroup>
`,
    extraChecks(ctx) {
      // toast: non-identical main + item-shipped canonical lib
      check('toast non-identical main in folder', ctx.exists('src/lib/ui/toast/toast-viewport.svelte') && !ctx.exists('src/lib/ui/toast/toast.svelte'));
      check('toast canonical @lib file at root (exactly once)', ctx.exists('src/lib/toast-store.ts') && !ctx.exists('src/lib/ui/toast/toast-store.ts'));
      const storeHits = walkFilesNamed(join(ctx.dir, 'src'), (name) => name === 'toast-store.ts');
      check('toast-store.ts appears exactly once tree-wide', storeHits.length === 1, `${storeHits.length} hit(s)`);
      // code-card chain: exactly-once @lib files + npm dep arrival
      check('code-card chain: shiki.ts exactly once at canonical @lib', ctx.exists('src/lib/shiki.ts') && !ctx.exists('src/lib/ui/code-card/shiki.ts'));
      check('code-card chain: jixoai.css (theme) arrived', ctx.exists('src/lib/jixoai.css'));
      const pkg = JSON.parse(ctx.read('package.json'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      check('code-card chain: npm shiki installed', !!deps.shiki);
      // engine-matrix single-engine default (2026-09-06): the code-card
      // install must carry NO other highlighting engine — engines are
      // opt-in items, never bundled defaults
      const engineLeak = ['prismjs', 'microlighter', 'highlight.js', 'sugar-high', 'web-tree-sitter', 'tree-sitter-typescript', 'tree-sitter-javascript'].filter((d) => !!deps[d]);
      check('code-card default: single engine (shiki only)', engineLeak.length === 0, engineLeak.join(', ') || 'clean');
    },
  },
  {
    id: 'isolated-list-item',
    items: ['list-item'],
    app: `<script lang="ts">
  import { Item, ItemGroup, ItemContent, ItemTitle, ItemEnd, ItemChevron, ItemDivider, ItemAfter, ItemToggle, ItemCheckbox, ItemRadio, ItemSelect, ItemInput } from '$lib/ui/list-item';
  let channel = $state('stable');
  let on = $state(false);
  let density = $state('default');
  let name = $state('');
</script>

<ItemGroup label="isolated">
  <Item href="#x">
    <ItemContent><ItemTitle>row</ItemTitle></ItemContent>
    <ItemEnd><ItemAfter>2</ItemAfter></ItemEnd>
  </Item>
  <ItemDivider />
  <ItemToggle label="Fast builds" bind:checked={on} />
  <ItemCheckbox label="Telemetry" />
  <ItemRadio name="channel" value="stable" label="Stable" bind:group={channel} />
  <ItemSelect label="Density" bind:value={density}><option value="default">default</option></ItemSelect>
  <ItemInput label="Project name" bind:value={name} />
</ItemGroup>
`,
    extraChecks(ctx) {
      check('list-item: item-separator absent', !ctx.exists('src/lib/ui/list-item/item-separator.svelte'));
      // closure delivery on a CLEAN consumer: every control folder +
      // frozen kernel exactly once tree-wide (impl-review blocker 6)
      const exactOnce = [
        'src/lib/ui/toggle/toggle.svelte',
        'src/lib/ui/checkbox/checkbox.svelte',
        'src/lib/ui/radio/radio.svelte',
        'src/lib/ui/native-select/native-select.svelte',
        'src/lib/ui/input/input.svelte',
        'src/lib/icon-set.gen.ts',
        'src/lib/jx-pure.css',
        'src/lib/jixoai.css',
        'src/lib/utils.ts',
      ];
      for (const target of exactOnce) {
        const base = target.split('/').at(-1);
        check(`isolated: ${base} exactly once tree-wide`, ctx.exists(target) && countTree(join(ctx.dir, 'src'), base) === 1);
      }
    },
  },
  {
    id: 'ghostty-term',
    items: ['ghostty-term'],
    // The real plugin resolves wasm bytes at build time — the wrong tool
    // for an INSTALL fixture. This stub keeps only the plugin's public
    // data contract (pure-data virtual module, design D3).
    viteConfig: `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const ghosttyVirtualStub = {
  name: 'fixture-ghostty-virtual-stub',
  resolveId(id) { return id === 'virtual:jixoai-ghostty' ? '\\0virtual:jixoai-ghostty' : null; },
  load(id) {
    if (id !== '\\0virtual:jixoai-ghostty') return null;
    return [
      "export const url = '/fixture/ghostty-vt.wasm';",
      "export const sha256 = '${'0'.repeat(64)}';",
      "export const variant = 'full';",
      "export const buildInfo = 'fixture-stub';",
      // named exports only — mirrors the REAL plugin contract
      // (impl-r2 #4): the stub must not ship a default export either.
    ].join('\\n');
  },
};

export default defineConfig({
  plugins: [ghosttyVirtualStub, svelte(), tailwindcss()],
  resolve: { alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) } },
  build: { target: 'esnext' },
});
`,
    app: `<script lang="ts">
  import GhosttyTerm from '$lib/ui/ghostty-term';
</script>

<GhosttyTerm />
`,
    extraChecks(ctx) {
      // zero wasm payloads in the installed tree — binaries ride the
      // vite-plugin supply chain (pin manifest + resolver), never the registry
      const wasmHits = walkFilesNamed(join(ctx.dir, 'src'), (name) => name.endsWith('.wasm'));
      check('ghostty-term: zero wasm payloads in src/', wasmHits.length === 0, wasmHits.map((p) => p.slice(ctx.dir.length)).join(', ') || 'none');
      const frozen = ['src/lib/ghostty-vt.ts', 'src/lib/jixoai.css', 'src/lib/utils.ts', 'src/lib/color-utils.ts', 'src/lib/density.svelte.ts'];
      const missing = frozen.filter((f) => !ctx.exists(f));
      check('ghostty-term: frozen dependency closure arrived', missing.length === 0, missing.join(', ') || 'complete');
    },
    postBuild(ctx) {
      // impl-r2 #4: the virtual-module contract is named-exports-only —
      // the bundled consumer output must carry the named url and no default face
      const bundled = walkFilesNamed(join(ctx.dir, 'dist', 'assets'), (name) => name.endsWith('.js'))
        .map((f) => readFileSync(f, 'utf8'))
        .join('\n');
      check(
        'ghostty-term: virtual module named-only (url present, no default face)',
        bundled.includes('ghostty-vt.wasm') && !/export\s+default\s*\{\s*url/.test(bundled),
      );
    },
  },
  {
    id: 'color-picker',
    items: ['color-picker'],
    // Pre-seed at canonical targets from the registry sources — exactly
    // what an older jixoai-ui install (or the www tree) carries: the
    // folders color-picker imports but does not declare, plus the kernels
    // those imports lean on (the standing registry debt, mirrors the www
    // tree). The regression lock: $lib/color-utils.ts MUST still arrive.
    preseed: [
      ['registry/files/ui/input/input.svelte', 'src/lib/ui/input/input.svelte'],
      ['registry/files/ui/input/index.ts', 'src/lib/ui/input/index.ts'],
      ['registry/files/ui/input/input.css', 'src/lib/ui/input/input.css'],
      ['registry/files/ui/native-select/native-select.svelte', 'src/lib/ui/native-select/native-select.svelte'],
      ['registry/files/ui/native-select/index.ts', 'src/lib/ui/native-select/index.ts'],
      // native-select ships no css (the preseed list once assumed parity —
      // merge-alignment A3 caught the phantom file)
      ['registry/files/ui/press-button/press-button.svelte', 'src/lib/ui/press-button/press-button.svelte'],
      ['registry/files/ui/press-button/index.ts', 'src/lib/ui/press-button/index.ts'],
      ['registry/files/ui/press-button/press-button.css', 'src/lib/ui/press-button/press-button.css'],
      ['registry/files/ui/press-button/ripple.svelte.ts', 'src/lib/ui/press-button/ripple.svelte.ts'],
      ['registry/files/lib/surface-motion.ts', 'src/lib/surface-motion.ts'],
      ['registry/files/lib/density.svelte.ts', 'src/lib/density.svelte.ts'],
      ['registry/files/lib/icon-set.gen.ts', 'src/lib/icon-set.gen.ts'],
    ],
    app: `<script lang="ts">
  import ColorPicker from '$lib/ui/color-picker';
</script>

<ColorPicker />
`,
    extraChecks(ctx) {
      check('color-picker: $lib/color-utils.ts arrived (regression lock)', ctx.exists('src/lib/color-utils.ts'));
      check(
        'color-picker: declared deps arrived (utils/jixoai-theme/jx-pure)',
        ctx.exists('src/lib/utils.ts') && ctx.exists('src/lib/jixoai.css') && ctx.exists('src/lib/jx-pure.css'),
      );
      for (const target of ['src/lib/ui/input/input.svelte', 'src/lib/ui/native-select/native-select.svelte', 'src/lib/ui/press-button/press-button.svelte']) {
        const base = target.split('/').at(-1);
        check(`color-picker: pre-seeded ${base} untouched (exactly once)`, ctx.exists(target) && countTree(join(ctx.dir, 'src'), base) === 1);
      }
      check(
        'color-picker: pre-seeded kernels exactly once (surface-motion/density)',
        countTree(join(ctx.dir, 'src'), 'surface-motion.ts') === 1 && countTree(join(ctx.dir, 'src'), 'density.svelte.ts') === 1,
      );
    },
  },
  {
    id: 'hero-section',
    // registry-install-integrity task 2b.2: the hero must resolve its
    // dependency closure AND request no @jixoai/reveal — the ghost edge
    // that made every hero install fail (deleted item, live declaration).
    items: ['hero-section'],
    forbidden: ['reveal'],
    app: `<script lang="ts">
  import HeroSection from '$lib/ui/hero-section';
</script>

<HeroSection eyebrow="clean-install probe" summary="the hero composes from the registry payload" copyCommand="npx jixoai-ui add hero-section">
  {#snippet terminal()}<pre>probe</pre>{/snippet}
</HeroSection>
`,
    extraChecks(ctx) {
      const missing = ['src/lib/jixoai.css', 'src/lib/icon-set.gen.ts'].filter((f) => !ctx.exists(f));
      check('hero-section: theme + icon-set closure arrived', missing.length === 0, missing.join(', ') || 'complete');
    },
  },
  {
    id: 'icon-default',
    // icon-component-pipeline C1 (design §4 tier 1): the DEFAULT tier is
    // PLUGIN-FREE — a clean consumer adds @jixoai/icon + @jixoai/icon-set
    // and the committed artifact builds standalone: zero npm deps, zero
    // virtual imports, the inline core answers getIcon() synchronously
    // (SSR paints the glyphs — the prerender probe below). NO viteConfig
    // override: the template's plugin list (svelte + tailwindcss only)
    // IS the assertion — no jixoai plugin is ever wired.
    items: ['icon', 'icon-set'],
    app: `<script lang="ts">
  import Icon from '$lib/ui/icon';
</script>

<Icon name="chevronRight" />
<Icon name="x" size={13} strokeWidth={2.5} />
`,
    extraChecks(ctx) {
      const artifact = ctx.read('src/lib/icon-set.gen.ts');
      // the artifact is the DEFAULT-config output: every name maps to
      // chunk 0 (inline) → the LAZY map is empty and NOTHING references
      // virtual:jixoai-icons — the plugin-free contract in artifact bytes
      check(
        'icon-default: artifact carries zero virtual chunk imports',
        !artifact.includes('virtual:jixoai-icons/chunk/'),
      );
      check('icon-default: artifact seeds the inline cache (CHUNK_0)', artifact.includes('new Map(Object.entries('));
      check(
        'icon-default: the rendered names exist in the artifact',
        artifact.includes("'chevronRight'") && artifact.includes("'x'"),
      );
      check(
        'icon-default: icon component landed via the folder barrel',
        ctx.exists('src/lib/ui/icon/icon.svelte') && ctx.exists('src/lib/ui/icon/index.ts'),
      );
      check(
        'icon-default: artifact exactly once tree-wide',
        ctx.exists('src/lib/icon-set.gen.ts') && countTree(join(ctx.dir, 'src'), 'icon-set.gen.ts') === 1,
      );
    },
    async postBuild(ctx) {
      // plugin-free proof over the BUILT tree: no virtual id leaked into
      // any emitted asset (the artifact's lazy map is empty, so plain
      // module code is all the bundle ever needed)
      const virtualHits = walkFilesNamed(join(ctx.dir, 'dist'), (_name, content) => content.includes('virtual:jixoai-icons'));
      check('icon-default: zero virtual:jixoai-icons references in dist/', virtualHits.length === 0, virtualHits.map((p) => p.slice(ctx.dir.length)).join(', ') || 'none');

      // the SERVER/prerendered output: boot a middleware dev server over
      // the INSTALLED tree (svelte plugin + the $lib alias only — still no
      // jixoai plugin) and SSR-render App.svelte, asserting the inline
      // core painted real <svg> glyphs — never a reserved box (design §3).
      // The render call lives INSIDE a module loaded through the server
      // (src/ssr-probe-entry.js): routing App AND svelte/server through
      // the same vite pipeline keeps ONE svelte-internals copy in play —
      // importing svelte/server from the node side while vite
      // dep-optimizes the components' internals splits the Renderer class
      // and dies on invalid_snippet_arguments (observed, svelte 5.56).
      writeAt(
        ctx.dir,
        'src/ssr-probe-entry.js',
        [
          "import { writeFileSync } from 'node:fs';",
          "import { render } from 'svelte/server';",
          "import App from './App.svelte';",
          '',
          'const { body } = render(App);',
          "writeFileSync(new URL('../prerender-body.html', import.meta.url).pathname, body, 'utf8');",
          'const glyphs = (body.match(/<svg[^>]*data-jx-icon/g) ?? []).length;',
          "const pending = body.includes('data-jx-icon-pending');",
          'console.log(`PRERENDER_GLYPHS=${glyphs}`);',
          'console.log(`PRERENDER_PENDING=${pending}`);',
          'if (glyphs === 0 || pending) {',
          '  console.error(body);',
          "  throw new Error('prerender probe: no glyphs painted or pending boxes leaked');",
          '}',
        ].join('\n'),
      );
      writeAt(
        ctx.dir,
        'icon-prerender-probe.mjs',
        [
          "import { fileURLToPath } from 'node:url';",
          "import { createServer } from 'vite';",
          "import { svelte } from '@sveltejs/vite-plugin-svelte';",
          '',
          'const here = fileURLToPath(new URL(".", import.meta.url));',
          'const server = await createServer({',
          '  root: here,',
          "  logLevel: 'silent',",
          '  configFile: false,',
          "  appType: 'custom',",
          '  plugins: [svelte()],',
          "  resolve: { alias: { $lib: `${here}src/lib` } },",
          '  server: { middlewareMode: true },',
          '});',
          'try {',
          "  await server.ssrLoadModule('/src/ssr-probe-entry.js');",
          '} catch (e) {',
          '  console.error(String(e?.stack ?? e));',
          '  process.exitCode = 1;',
          '} finally {',
          '  await server.close();',
          '}',
        ].join('\n'),
      );
      const probe = await runIn(ctx.dir, process.execPath, ['icon-prerender-probe.mjs'], { timeoutMs: 120_000, label: 'case icon-default: prerender probe' });
      check(
        'icon-default: prerender probe ran green',
        probe.status === 0 && !probe.timedOut,
        probe.status === 0 ? '' : probe.timedOut ? 'TIMED OUT (120s group-budget)' : `${probe.stdout}\n${probe.stderr}`.slice(-800),
      );
      if (probe.status === 0 && !probe.timedOut) {
        check('icon-default: SSR painted 2 glyphs (one per Icon)', probe.stdout.includes('PRERENDER_GLYPHS=2'), probe.stdout.trim());
        check('icon-default: SSR painted zero pending boxes', probe.stdout.includes('PRERENDER_PENDING=false'), probe.stdout.trim());
        // the painted geometry IS the artifact's payload: chevronRight's
        // serialized d rides the server HTML verbatim ({@html} of the
        // plugin-extracted chunk-0 bytes)
        const artifact = ctx.read('src/lib/icon-set.gen.ts');
        const dPayload = /chevronRight: \{ v: '[^']+', n: '[^']+', d: '([^']+)' \}/.exec(artifact)?.[1];
        const body = ctx.read('prerender-body.html');
        check('icon-default: SSR HTML carries the artifact d payload', !!dPayload && body.includes(dPayload), dPayload ?? 'chevronRight entry not found');
      }
    },
  },
  {
    id: 'markdown',
    // markdown-streaming task 3.4: the whole closure must self-deliver on a
    // clean consumer — the sibling items Table/CodeCard/jx-pure/utils ride
    // the registryDependencies edges, the npm dep (stream-markdown-parser)
    // rides dependencies. The doc under test exercises the three non-trivial
    // mappings at once (table → Table, fence → CodeCard, task list).
    items: ['markdown'],
    app: `<script lang="ts">
  import Markdown from '$lib/ui/markdown';
</script>

<Markdown
  source={'# Registry probe\\n\\n| Axis | State |\\n| --- | --- |\\n| streaming | keyed |\\n| security | floor |\\n\\n- [x] tables map through Table\\n- [ ] open fences stream\\n\\n\`\`\`ts\\nexport const proof = true;\\n\`\`\`\\n'}
/>
`,
    extraChecks(ctx) {
      // the direct-import graph's own files (design §5): every declared
      // edge must physically land on the consumer — transitive needs
      // (defaults/density/highlight/icons/theme) resolve through those
      // items' own registryDependencies
      const missing = [
        'src/lib/ui/table/table.svelte',
        'src/lib/ui/code-card/code-card.svelte',
        'src/lib/jx-pure.css',
        'src/lib/utils.ts',
        'src/lib/jixoai.css',
      ].filter((f) => !ctx.exists(f));
      check('markdown: direct-import closure arrived', missing.length === 0, missing.join(', ') || 'complete');
    },
  },
  {
    id: 'math-block',
    // katex-mermaid 5.4: the math lane's out-of-the-box receipt — the
    // fonts-ride-the-package proof. katex lands as a real npm dep, the
    // engine lib rides its declared @jixoai/katex edge to the canonical
    // @lib root, and the consumer's vite build RESOLVES the katex css
    // font URLs (the emitted KaTeX_* font assets ARE the receipt).
    items: ['math-block'],
    app: `<script lang="ts">
  import MathBlock from '$lib/ui/math-block';
</script>

<MathBlock tex={'\\\\mathrm{e}^{\\\\mathrm{i}\\\\pi} + 1 = 0'} />
`,
    extraChecks(ctx) {
      const pkg = JSON.parse(ctx.read('package.json'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      check('math-block: katex in the consumer package.json', !!deps.katex);
      // the engine lib rides its declared registryDependency edge to the
      // canonical @lib root — exactly once tree-wide (the code-card/shiki
      // chain-delivery precedent)
      check('math-block: katex engine lib at canonical @lib', ctx.exists('src/lib/katex.ts') && !ctx.exists('src/lib/ui/math-block/katex.ts'));
      check('math-block: katex.ts exactly once tree-wide', countTree(join(ctx.dir, 'src'), 'katex.ts') === 1);
      check('math-block: scroll-run chain arrived (the shared strip)', ctx.exists('src/lib/ui/scroll-run/scroll-run.svelte.ts'));
      check('math-block: engine css present in node_modules (fonts ride the package)', ctx.exists('node_modules/katex/dist/katex.min.css'));
    },
    postBuild(ctx) {
      // the fonts receipt: the consumer's vite build resolved the
      // url(fonts/KaTeX_*.woff2|woff|ttf) references inside
      // katex.min.css (imported by $lib/katex) and emitted the font
      // assets into dist — zero font shipping, zero plugin prerequisite
      const fonts = walkFilesNamed(join(ctx.dir, 'dist'), (name) => /^KaTeX_[A-Za-z0-9-]+\.(woff2|woff|ttf)$/.test(name));
      check('math-block: katex fonts emitted to dist (the fonts-ride-the-package receipt)', fonts.length > 0, `${fonts.length} font asset(s)`);
    },
  },
  {
    id: 'mermaid',
    // katex-mermaid 5.4: the diagram lane's receipt — mermaid lands as a
    // real npm dep and the ~1MB lazy engine actually BUNDLES into the
    // consumer's vite build output (the code-split chunk the surface's
    // dynamic import resolves at runtime).
    items: ['mermaid'],
    app: `<script lang="ts">
  import Mermaid from '$lib/ui/mermaid';
</script>

<Mermaid name="install-probe.mmd" source={'flowchart TD\\n  install --> render'} />
`,
    extraChecks(ctx) {
      const pkg = JSON.parse(ctx.read('package.json'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      check('mermaid: mermaid in the consumer package.json', !!deps.mermaid);
      check('mermaid: engine lib at canonical @lib', ctx.exists('src/lib/mermaid-engine.ts') && !ctx.exists('src/lib/ui/mermaid/mermaid-engine.ts'));
      check('mermaid: color-utils chain arrived (the probe pipeline)', ctx.exists('src/lib/color-utils.ts'));
    },
    postBuild(ctx) {
      // the lazy-engine receipt: the mermaid chunk rides the build
      // output as its own asset the surface's import() resolves
      const chunks = walkFilesNamed(
        join(ctx.dir, 'dist', 'assets'),
        (name, content) => name.endsWith('.js') && content.includes('flowchart') && content.includes('sequenceDiagram'),
      );
      check('mermaid: the lazy engine bundled into the consumer build', chunks.length > 0, chunks.map((p) => p.slice(ctx.dir.length)).join(', ') || 'no engine chunk found');
    },
  },
];

// ── 4b. engine-matrix cases (highlight-engine-matrix, 2026-09-06 r2-4) ──
// One ISOLATED case per `highlight-*` item, AUTO-DERIVED from
// registry.json: new engines register themselves here by existing — the
// derivation fails loudly if an engine lacks a factory template below
// (nothing is silently skipped), and the generated-case count must equal
// the registry's engine count. Per case: canonical files land (generic),
// npm deps contain the OWN engine and NO sibling engine package, and the
// consumer builds. The tree-sitter case additionally serves dist/ over
// HTTP and fetches every emitted wasm (the ?url channel's end-to-end
// evidence, r3-1).
const engineRegistry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'));
// detection-capability items (highlight-lang-detector lib +
// highlight-detect-default wrapper, 2026-09-07) match the highlight-*
// prefix but are NOT engines — excluded here so the probe-template
// derivation does not die on them; their consumers are the detection
// cases in 4d below
const DETECTION_ITEMS = new Set(['highlight-lang-detector', 'highlight-detect-default']);
const engineItems = engineRegistry.items.filter((i) => /^highlight-/.test(i.name) && !DETECTION_ITEMS.has(i.name));

/** how each engine's consumer probe constructs its backend (fails loud on unknown) */
const ENGINE_PROBES = {
  'highlight-shiki': {
    imports: "import { shiki } from '$lib/highlight/shiki';",
    mount: 'const backend = shiki({ langs: [\'ts\'] });',
  },
  'highlight-prismjs': {
    imports: "import { prismjs } from '$lib/highlight/prismjs';",
    mount: 'const backend = prismjs({ langs: [\'css\'] });',
  },
  'highlight-microlighter': {
    imports: "import { microLighter } from '$lib/highlight/microlighter';",
    mount: 'const backend = microLighter();',
  },
  'highlight-highlightjs': {
    imports: "import { highlightJs } from '$lib/highlight/highlight-js';",
    mount: "const backend = highlightJs({ langs: ['ts', 'bash'] });",
  },
  'highlight-sugar-high': {
    imports: "import { sugarHigh } from '$lib/highlight/sugar-high';",
    mount: 'const backend = sugarHigh();',
  },
  'highlight-tree-sitter': {
    imports: "import { treeSitter } from '$lib/highlight/tree-sitter';",
    mount: "const backend = treeSitter({ langs: ['ts'] });",
  },
};

const SIBLING_NPM = new Set(engineItems.flatMap((i) => i.dependencies ?? []));
const missingProbes = engineItems.filter((i) => !(i.name in ENGINE_PROBES)).map((i) => i.name);
if (missingProbes.length > 0) {
  die(`engine-matrix: no consumer probe template for ${missingProbes.join(', ')} — add one to ENGINE_PROBES (nothing may be silently skipped)`);
}

for (const item of engineItems) {
  const own = new Set(item.dependencies ?? []);
  const probe = ENGINE_PROBES[item.name];
  CASES.push({
    id: item.name,
    items: [item.name],
    app: `<script lang="ts">
  ${probe.imports}
  ${probe.mount}
</script>

<pre><code data-engine="${item.name}">probe</code></pre>
`,
    extraChecks(ctx) {
      const pkg = JSON.parse(ctx.read('package.json'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      for (const dep of own) {
        check(`${item.name}: own npm dep ${dep} installed`, !!deps[dep.split('@')[0]] || !!deps[dep]);
      }
      const siblings = [...SIBLING_NPM].filter((d) => !own.has(d));
      const leaked = siblings.filter((d) => !!deps[d.split('@')[0]]);
      check(
        `${item.name}: zero sibling-engine npm packages`,
        leaked.length === 0,
        leaked.join(', ') || 'clean',
      );
    },
    ...(item.name === 'highlight-tree-sitter'
      ? {
          // the ?url channel's end-to-end proof: build emitted the wasm
          // assets, HTTP serves them, the magic bytes are real (r3-1)
          async postBuild(ctx) {
            const { createServer: httpServer } = await import('node:http');
            const dist = join(ctx.dir, 'dist');
            const wasmFiles = walkFilesNamed(dist, (name) => name.endsWith('.wasm'));
            check('highlight-tree-sitter: build emitted wasm assets', wasmFiles.length >= 4, `${wasmFiles.length} file(s)`);
            const server = httpServer((req, res) => {
              const rel = decodeURIComponent(req.url ?? '/').replace(/^\/+/, '');
              const file = join(dist, rel);
              if (!file.startsWith(dist) || !existsSync(file)) {
                res.statusCode = 404;
                res.end('nope');
                return;
              }
              res.setHeader('content-type', 'application/wasm');
              res.end(readFileSync(file));
            });
            await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
            const port = server.address().port;
            try {
              for (const file of wasmFiles) {
                const rel = file.slice(dist.length + 1);
                const res = await fetch(`http://127.0.0.1:${port}/${rel}`);
                check(`highlight-tree-sitter: fetch /${rel} → 200`, res.status === 200);
                const bytes = new Uint8Array(await res.arrayBuffer());
                check(
                  `highlight-tree-sitter: /${rel} is real wasm (magic bytes)`,
                  bytes.length > 4 && bytes[0] === 0x00 && bytes[1] === 0x61 && bytes[2] === 0x73 && bytes[3] === 0x6d,
                );
              }
            } finally {
              server.close();
            }
          },
        }
      : {}),
  });
}
check(
  'engine-matrix: generated cases match registry engine count',
  engineItems.length === Object.keys(ENGINE_PROBES).length && engineItems.length >= 6,
  `${engineItems.length} registry engines / ${Object.keys(ENGINE_PROBES).length} probes`,
);

// ── 4d. detection-capability cases (highlight-lang-detector, 2026-09-07) ──
// Three ISOLATED consumers locking the zero-build-edge law end to end:
//   code-card-bare        ONLY code-card — the built artifact carries
//                         ZERO DLD bytes and a lang="auto" card still
//                         COMPILES (detection is a runtime reject)
//   code-card-dld-lib     + @jixoai/highlight-lang-detector, wired by the
//                         hand-written setContext (form ②) — clean build,
//                         the wasm emitted as a REAL asset (?url channel)
//   code-card-dld-wrapper + the highlight-detect-default item, the
//                         children wrapper compiled through BOTH consumer
//                         dialects (direct .svelte + folder barrel)
//
// The npm bridge: @jixoai/ui-betlang-wasm is workspace-built and published
// by CI — at harness time it is NOT on registry.npmjs.org (404, probed),
// and the shadcn CLI runs `npm install -- @jixoai/ui-betlang-wasm@^0.1.1`
// verbatim (a versioned spec is never skipped as already-installed). A
// one-name LOCAL MIRROR keeps the resolution path real — npm pack of the
// workspace package serves the packument + tarball, everything else
// passes through to registry.npmjs.org — so the add resolves exactly as
// it will post-publish, against the tree under test.
const BETLANG_PKG = 'packages/betlang-wasm';
let npmMirrorBase = '';
{
  const packDest = join(scratch, 'npm-mirror');
  mkdirSync(packDest, { recursive: true });
  const pack = spawnSync('npm', ['pack', '--pack-destination', packDest], { cwd: join(root, BETLANG_PKG), encoding: 'utf8', stdio: 'pipe' });
  if (pack.status !== 0) die(`detection: npm pack ${BETLANG_PKG} failed (build it first: npm run build there):\n${pack.stdout}\n${pack.stderr}`);
  const tarballName = String(pack.stdout ?? '').trim().split('\n').filter(Boolean).at(-1);
  if (!tarballName?.endsWith('.tgz')) die(`detection: npm pack printed no tarball name (got: ${JSON.stringify(tarballName)})`);
  const tarballPath = join(packDest, tarballName);
  const tarballBytes = readFileSync(tarballPath);
  const integrity = `sha512-${createHash('sha512').update(tarballBytes).digest('base64')}`;
  const pkgManifest = JSON.parse(readFileSync(join(root, BETLANG_PKG, 'package.json'), 'utf8'));
  const version = pkgManifest.version;
  const { createServer: mirrorServer } = await import('node:http');
  const mirror = mirrorServer(async (req, res) => {
    const url = req.url ?? '';
    const path = decodeURIComponent(url.split('?')[0]);
    try {
      if (path === '/@jixoai/ui-betlang-wasm') {
        const packument = JSON.stringify({
          name: '@jixoai/ui-betlang-wasm',
          'dist-tags': { latest: version },
          versions: {
            [version]: {
              ...pkgManifest,
              dist: { tarball: `${npmMirrorBase}/@jixoai/ui-betlang-wasm/-/${tarballName}`, integrity },
            },
          },
        });
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.end(packument);
        return;
      }
      if (path.startsWith('/@jixoai/ui-betlang-wasm/-/')) {
        res.statusCode = 200;
        res.setHeader('content-type', 'application/octet-stream');
        res.end(tarballBytes);
        return;
      }
      // passthrough: the real registry carries everything else (shiki,
      // audit endpoints, packuments for the template's own resolution)
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks);
      const upstream = await fetch(`https://registry.npmjs.org${url}`, {
        method: req.method,
        headers: { accept: req.headers.accept ?? '*/*' },
        body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
      });
      res.statusCode = upstream.status;
      const contentType = upstream.headers.get('content-type');
      if (contentType) res.setHeader('content-type', contentType);
      res.end(Buffer.from(await upstream.arrayBuffer()));
    } catch (e) {
      res.statusCode = 502;
      res.end(`npm-mirror passthrough failure: ${e?.message ?? e}`);
    }
  });
  npmMirrorBase = await new Promise((resolve, reject) => {
    mirror.once('error', reject);
    mirror.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${mirror.address().port}`));
  });
  console.log(`detection: npm mirror up at ${npmMirrorBase} (betlang-wasm ${version} from ${BETLANG_PKG}; everything else → registry.npmjs.org)`);
}
// DLD layer tokens whose presence in a BUILT artifact means detector
// bytes leaked into a consumer that never installed them (the frozen
// reject template's guidance strings mention the ITEM name but none of
// these module identifiers — probed against the card's warn text)
const DLD_TOKENS = ['default-detector', 'detect-ext-table', 'detect-shebang-table', 'detect-structure', 'lang-canonical', 'betlang'];
const WASM_MAGIC = (file) => {
  const bytes = readFileSync(file);
  return bytes.length > 4 && bytes[0] === 0x00 && bytes[1] === 0x61 && bytes[2] === 0x73 && bytes[3] === 0x6d;
};

CASES.push(
  {
    id: 'code-card-bare',
    // the zero-build-edge law: a bare code-card install carries ZERO
    // DLD bytes — a lang="auto" card COMPILES (detection runs only at
    // paint; with no ring the card rejects at runtime and keeps plain)
    items: ['code-card'],
    app: `<script lang="ts">
  import CodeCard from '$lib/ui/code-card';
  import { AUTO_LANG } from '$lib/highlight/lang-detector';
</script>

<!-- the sentinel card compiles clean — the build never runs detection;
     at paint, no ring rejects with install + wiring guidance -->
<CodeCard filename="main.ts" lang={AUTO_LANG} code={'export const bare = true;'} />
<CodeCard lang="ts" code={'export const ordinary = true;'} />
`,
    postBuild(ctx) {
      const dldHits = walkFilesNamed(join(ctx.dir, 'dist'), (_name, content) => DLD_TOKENS.some((t) => content.includes(t)));
      check('code-card-bare: zero DLD bytes in dist/', dldHits.length === 0, dldHits.map((p) => p.slice(ctx.dir.length)).join(', ') || 'clean');
      const wasm = walkFilesNamed(join(ctx.dir, 'dist'), (name) => name.endsWith('.wasm'));
      check('code-card-bare: zero wasm payloads in dist/', wasm.length === 0, `${wasm.length} file(s)`);
      // the core contract file DID land (the AUTO_LANG import's target) —
      // the detection capability is what stays absent, not the contract
      check(
        'code-card-bare: core contract landed, no DLD layer modules in src/',
        ctx.exists('src/lib/highlight/lang-detector.ts') &&
          !ctx.exists('src/lib/highlight/default-detector.ts') &&
          !ctx.exists('src/lib/highlight/betlang-detector.ts'),
      );
    },
  },
  {
    id: 'code-card-dld-lib',
    // form ② wiring on a clean consumer: the DLD lib item + ONE
    // hand-written setContext at the root — the wasm must ride vite's
    // ?url channel out of a REAL npm resolution (the mirror bridge
    // supplies @jixoai/ui-betlang-wasm until CI publishes it)
    items: ['code-card', 'highlight-lang-detector'],
    preAdd(ctx) {
      writeAt(ctx.dir, '.npmrc', `registry=${npmMirrorBase}\n`);
    },
    app: `<script lang="ts">
  import { setContext } from 'svelte';
  import CodeCard from '$lib/ui/code-card';
  import { AUTO_LANG } from '$lib/highlight/lang-detector';
  import { HIGHLIGHT_DETECT_KEY } from '$lib/highlight/context-key';
  import { defaultLangDetector } from '$lib/highlight/default-detector';

  // form ②: one line at any subtree root — every auto card below eats the DLD
  setContext(HIGHLIGHT_DETECT_KEY, { detector: defaultLangDetector() });
</script>

<CodeCard filename="main.ts" lang={AUTO_LANG} code={'export const wired = true;'} />
`,
    extraChecks(ctx) {
      const pkg = JSON.parse(ctx.read('package.json'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      check('code-card-dld-lib: @jixoai/ui-betlang-wasm dep installed', !!deps['@jixoai/ui-betlang-wasm'], Object.keys(deps).filter((d) => d.includes('betlang')).join(', ') || 'absent');
      // framework-free law: the DLD item lands ONLY .ts under $lib/highlight
      check(
        'code-card-dld-lib: DLD payload is framework-free (no ui folder)',
        !ctx.exists('src/lib/ui/highlight-lang-detector') && ctx.exists('src/lib/highlight/default-detector.ts'),
      );
      // the core contract file ships once tree-wide (payload exactly-once:
      // core's lang-detector.ts, never the DLD item's)
      check('code-card-dld-lib: lang-detector.ts exactly once tree-wide', countTree(join(ctx.dir, 'src'), 'lang-detector.ts') === 1);
    },
    postBuild(ctx) {
      const wasm = walkFilesNamed(join(ctx.dir, 'dist'), (name) => name.endsWith('.wasm'));
      check('code-card-dld-lib: wasm emitted as a real asset (?url channel)', wasm.length >= 1, `${wasm.length} file(s): ${wasm.map((p) => p.split('/').at(-1)).join(', ')}`);
      if (wasm.length > 0) check('code-card-dld-lib: the wasm is real betlang binary (magic bytes)', WASM_MAGIC(wasm[0]));
    },
  },
  {
    id: 'code-card-dld-wrapper',
    // the full stack: card + DLD + the wrapper item, BOTH consumer
    // dialects compiled at once (the direct .svelte path AND the folder
    // barrel) — the children wrapper wires the detection default for
    // each wrapped subtree; siblings outside stay untouched (context law)
    items: ['code-card', 'highlight-lang-detector', 'highlight-detect-default'],
    preAdd(ctx) {
      writeAt(ctx.dir, '.npmrc', `registry=${npmMirrorBase}\n`);
    },
    app: `<script lang="ts">
  import CodeCard from '$lib/ui/code-card';
  import { AUTO_LANG } from '$lib/highlight/lang-detector';
  // form ①, both dialects: the folder barrel and the direct .svelte path
  import HighlightDetectDefault from '$lib/ui/highlight-detect-default';
  import HighlightDetectDefaultDirect from '$lib/ui/highlight-detect-default/highlight-detect-default.svelte';
</script>

<HighlightDetectDefault>
  <CodeCard filename="main.ts" lang={AUTO_LANG} code={'export const wrapped = true;'} />
</HighlightDetectDefault>

<!-- the direct-dialect twin wraps a sibling card (no filename → the
     waterfall falls through to the statistical layer at paint) -->
<HighlightDetectDefaultDirect>
  <CodeCard lang={AUTO_LANG} code={'fn wrapper_dialect() {\\n    direct_path()\\n}'} />
</HighlightDetectDefaultDirect>
`,
    extraChecks(ctx) {
      check(
        'code-card-dld-wrapper: wrapper landed via folder (component + barrel)',
        ctx.exists('src/lib/ui/highlight-detect-default/highlight-detect-default.svelte') && ctx.exists('src/lib/ui/highlight-detect-default/index.ts'),
      );
      const pkg = JSON.parse(ctx.read('package.json'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      check('code-card-dld-wrapper: @jixoai/ui-betlang-wasm dep installed', !!deps['@jixoai/ui-betlang-wasm']);
      check(
        'code-card-dld-wrapper: the barrel is a pure re-export (no logic)',
        ctx.read('src/lib/ui/highlight-detect-default/index.ts').includes("export { default } from './highlight-detect-default.svelte';"),
      );
    },
    postBuild(ctx) {
      const wasm = walkFilesNamed(join(ctx.dir, 'dist'), (name) => name.endsWith('.wasm'));
      check('code-card-dld-wrapper: wasm emitted as a real asset (?url channel)', wasm.length >= 1, `${wasm.length} file(s)`);
      if (wasm.length > 0) check('code-card-dld-wrapper: the wasm is real betlang binary (magic bytes)', WASM_MAGIC(wasm[0]));
    },
  },
);

// ── 5. consumer template (written once, npm-installed once) ────────
const versions = JSON.parse(source('apps/www/package.json')).devDependencies;
mkdirSync(join(templateDir, 'src/lib/ui'), { recursive: true });
mkdirSync(join(templateDir, 'public'), { recursive: true });
const writeAt = (dir, p, c) => writeFileSync(join(dir, p), c);
const consumerFiles = {
  'package.json': JSON.stringify({
    name: 'jixoai-clean-install-consumer',
    private: true,
    type: 'module',
    scripts: { build: 'vite build' },
    devDependencies: {
      svelte: versions.svelte,
      '@sveltejs/vite-plugin-svelte': versions['@sveltejs/vite-plugin-svelte'],
      vite: versions.vite,
      typescript: versions.typescript,
      '@tailwindcss/vite': versions['@tailwindcss/vite'],
      tailwindcss: versions.tailwindcss,
      // EXACT, not a range: the add-side CLI contract is versioned — a
      // floating range made the same gate run different CLIs over time
      // (4.19.0 = the repo's pnpm resolution; the root npm package-lock
      // resolving 4.18.0 is a pre-existing dual-lock split, recorded)
      shadcn: '4.19.0',
    },
  }, null, 2),
  'components.json': JSON.stringify({
    $schema: 'https://ui.shadcn.com/schema.json',
    style: 'new-york',
    rsc: false,
    tsx: true,
    tailwind: { config: '', css: 'src/app.css', baseColor: 'neutral', cssVariables: true, prefix: '' },
    iconLibrary: 'lucide',
    // $lib-ROOTED, frozen table (env-debt-cleanup D2): the CLI rewrites
    // `$lib/x` in delivered .ts files to the alias target — a `src/lib`
    // target produced bare `src/lib/x` specifiers plain vite cannot
    // resolve; `$lib` targets make the rewrite a no-op and the vite alias
    // (below) does the resolving. .svelte files are never rewritten (the
    // CLI's ext allowlist is ts/tsx/js/jsx only).
    aliases: { components: '$lib', utils: '$lib/utils', ui: '$lib/ui', lib: '$lib', hooks: '$lib/hooks' },
    registries: { '@jixoai': `${BASE}/{name}.json` },
  }, null, 2),
  'vite.config.ts': `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: { alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) } },
  build: { target: 'esnext' },
});
`,
  'tsconfig.json': JSON.stringify({
    compilerOptions: {
      target: 'esnext', module: 'esnext', moduleResolution: 'bundler',
      verbatimModuleSyntax: true, strict: true, noEmit: true,
      paths: { '$lib': ['./src/lib'], '$lib/*': ['./src/lib/*'] },
      types: ['svelte', 'vite/client'],
    },
    include: ['src/**/*.ts', 'src/**/*.svelte', 'vite.config.ts'],
  }, null, 2),
  'svelte.config.js': `import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
export default { preprocess: vitePreprocess() };
`,
  'src/app.css': `@import 'tailwindcss';
`,
  'index.html': `<!doctype html>
<html><head><meta charset="utf-8" /><title>clean-install consumer</title></head>
<body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>
`,
  'src/main.ts': `import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';
mount(App, { target: document.getElementById('app')! });
`,
};
for (const [p, c] of Object.entries(consumerFiles)) writeAt(templateDir, p, c);

console.log('npm install (consumer template deps — installs once, 600s group-budget)…');
{
  const child = spawn('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], { cwd: templateDir, stdio: 'pipe', detached: true });
  const entry = { pid: child.pid, pgid: child.pid, command: 'npm install (consumer template)' };
  CHILDREN.add(child.pid, entry.command);
  let out = '';
  child.stdout?.on('data', (d) => (out += d));
  child.stderr?.on('data', (d) => (out += d));
  let timedOut = false;
  // HARD budget (r2 B3 + r3 S3): resolve on close OR reap completion —
  // a pipe-holding out-of-group descendant can hold 'close' hostage
  let reapDone;
  const reaped = new Promise((r) => (reapDone = r));
  const timer = setTimeout(() => {
    timedOut = true;
    void CHILDREN.reapOne(entry, { graceMs: 2000 }).then(reapDone, reapDone);
  }, 600_000);
  const code = await Promise.race([
    new Promise((resolveClose) => {
      child.on('close', resolveClose); // fires for spawn errors too
      child.on('error', () => resolveClose(null));
    }),
    reaped.then(() => null),
  ]);
  clearTimeout(timer);
  if (timedOut) die(`npm install exceeded the 600s group-budget — process group ${child.pid} TERM→KILLed; tail:\n${out.slice(-1200)}`);
  if (code !== 0) die(`npm install failed (exit ${code}):\n${out.slice(-1200)}`);
}

// the version chain, printed at both ends (env-debt-cleanup D2): the ROOT
// binary generates the payloads, the TEMPLATE binary runs the adds — the
// interop of the printed pair is what the five cases below prove. Both
// probes check their exit status; the root output must be a real version
// (a silently broken probe must not print 'unknown' into the interop
// log); the template must be 4.19.0 EXACTLY (S4, impl-review r1)
{
  const rootV = spawnSync(process.execPath, [resolveShadcnBin(root), '--version'], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  if (rootV.status !== 0) die(`root shadcn --version probe failed (exit ${rootV.status}): ${rootV.stderr}`);
  const rootVersion = String(rootV.stdout || '').trim();
  if (!/^\d+\.\d+\.\d+/.test(rootVersion)) die(`root shadcn --version printed no version (got: ${JSON.stringify(rootVersion)})`);
  console.log(`[versions] root shadcn (build side)  = ${rootVersion}`);
  const tplV = spawnSync('npx', ['shadcn', '--version'], { cwd: templateDir, encoding: 'utf8', stdio: 'pipe' });
  if (tplV.status !== 0) die(`template shadcn --version probe failed (exit ${tplV.status}): ${tplV.stderr}`);
  const tplVersion = String(tplV.stdout || '').trim();
  console.log(`[versions] template shadcn (add side) = ${tplVersion}`);
  if (tplVersion !== '4.19.0') die(`template shadcn must be 4.19.0 exactly (got: ${tplVersion})`);
}

// ── 6. run the cases ───────────────────────────────────────────────
let templateContractChecked = false;
// runIn spawns DETACHED in its own process group and registers it — npx
// and vite fan out node grandchildren that a bare parent-kill would
// orphan; the group + reap contract (and the per-call budget below) is
// what keeps them collectable. spawnSync survives only for genuinely
// childless short probes (curl, --version).
const runIn = async (dir, cmd, args, { env = {}, timeoutMs = 300_000, label = '' } = {}) => {
  const child = spawn(cmd, args, {
    cwd: dir,
    stdio: 'pipe',
    detached: true,
    // The local base stays OFF any proxy (the machine proxy black-holes
    // localhost — the earlier curl 502).
    env: { ...process.env, REGISTRY_URL: BASE, NO_PROXY: 'localhost,127.0.0.1', no_proxy: 'localhost,127.0.0.1', ...env },
  });
  const entry = { pid: child.pid, pgid: child.pid, command: `${cmd} ${args.join(' ')}${label ? ` (${label})` : ''}` };
  CHILDREN.add(child.pid, entry.command);
  let out = '';
  child.stdout?.on('data', (d) => (out += d));
  child.stderr?.on('data', (d) => (out += d));
  let spawnError = null;
  // HARD budget (r2 B3 + r3 S3): the deadline runs the bounded single-
  // group reap (TERM → grace → KILL → verify); the waiter resolves on
  // EITHER the child's close OR the reap's completion — an out-of-group
  // descendant holding the stdio pipes can hold 'close' hostage after
  // the group is already dead, so reap completion is a resolution path
  // of its own (bounded ≤ ~4s), never a fire-and-forget
  let timedOut = false;
  let reapDone;
  const reaped = new Promise((r) => (reapDone = r));
  const timer = setTimeout(() => {
    timedOut = true;
    void CHILDREN.reapOne(entry, { graceMs: 2000 }).then(reapDone, reapDone);
  }, timeoutMs);
  const status = await Promise.race([
    new Promise((resolveClose) => {
      child.on('close', resolveClose); // fires for spawn errors too
      child.on('error', (e) => {
        spawnError = e;
        resolveClose(null);
      });
    }),
    reaped.then(() => null),
  ]);
  clearTimeout(timer);
  return { status, stdout: out, stderr: out, timedOut, spawnError };
};

for (const testCase of CASES) {
  console.log(`\n━━ case: ${testCase.id} (add ${testCase.items.map((i) => `@jixoai/${i}`).join(' ')}) ━━━━━━━━━━━━━━━`);
  const dir = join(scratch, `consumer-${testCase.id}`);
  rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  mkdirSync(dirname(dir), { recursive: true });
  cpSync(templateDir, dir, { recursive: true });
  if (testCase.viteConfig) writeAt(dir, 'vite.config.ts', testCase.viteConfig);
  for (const [src, dest] of testCase.preseed ?? []) {
    mkdirSync(dirname(join(dir, dest)), { recursive: true });
    writeFileSync(join(dir, dest), source(src));
  }
  writeAt(dir, 'src/App.svelte', testCase.app);

  const ctx = {
    dir,
    exists: (p) => existsSync(join(dir, p)),
    read: (p) => readFileSync(join(dir, p), 'utf8'),
  };

  // per-case hook after the template copy, before the add (the
  // detection cases point their consumer's .npmrc at the local mirror)
  await testCase.preAdd?.(ctx);

  const add = await runIn(dir, 'npx', ['shadcn', 'add', ...testCase.items.map((i) => `@jixoai/${i}`), '--yes', '--overwrite'], { label: `case ${testCase.id}: shadcn add` });
  check('shadcn add resolves from public/r payloads', add.status === 0 && !add.timedOut, add.status === 0 ? '' : add.timedOut ? `TIMED OUT (300s group-budget), tail:\n${add.stdout.slice(-800)}` : `${add.stdout}\n${add.stderr}`.slice(-800));
  if (add.status !== 0) continue; // later assertions are moot for this case

  // ── the template contract (env-debt-cleanup D2, asserted once after the
  // first successful add — the five frozen groups) ─────────────────────
  if (!templateContractChecked) {
    templateContractChecked = true;
    // (a) the consumer's on-disk aliases are exactly the frozen $lib table
    {
      const frozen = { components: '$lib', utils: '$lib/utils', ui: '$lib/ui', lib: '$lib', hooks: '$lib/hooks' };
      const consumerAliases = JSON.parse(ctx.read('components.json')).aliases;
      check('template contract: consumer aliases = frozen $lib table', JSON.stringify(consumerAliases) === JSON.stringify(frozen), JSON.stringify(consumerAliases));
    }
    // (b) the template tsconfig resolves $lib[/suffix] into src/lib (the
    // minimal baseUrl+paths resolver the CLI itself uses)
    {
      const tsconfig = JSON.parse(ctx.read('tsconfig.json'));
      const paths = tsconfig.compilerOptions?.paths ?? {};
      const resolves = (spec) => {
        const hit = Object.keys(paths).find((p) => p.endsWith('/*') ? spec.startsWith(p.slice(0, -1)) : spec === p);
        if (!hit) return null;
        const target = paths[hit][0].replace(/\*$/, '');
        return target + (hit.endsWith('/*') ? spec.slice(hit.length - 1) : '');
      };
      check('template contract: tsconfig resolves $lib → src/lib', resolves('$lib') === './src/lib' && resolves('$lib/ui/x') === './src/lib/ui/x', JSON.stringify(paths));
    }
    // (c) canonicalTargets dual derivation: the www-side alias table and
    // the CONSUMER'S OWN on-disk aliases — resolved through the consumer's
    // tsconfig paths — hit the SAME physical paths. Both sides are derived,
    // nothing hardcoded: the payload layout is alias-shape independent
    // (S1, impl-review r1)
    {
      const consumerAliases = JSON.parse(ctx.read('components.json')).aliases;
      const tsconfig = JSON.parse(ctx.read('tsconfig.json'));
      const paths = tsconfig.compilerOptions?.paths ?? {};
      const resolves = (spec) => {
        const hit = Object.keys(paths).find((p) => p.endsWith('/*') ? spec.startsWith(p.slice(0, -1)) : spec === p);
        if (!hit) return null;
        const target = paths[hit][0].replace(/\*$/, '');
        return target + (hit.endsWith('/*') ? spec.slice(hit.length - 1) : '');
      };
      // alias value ('$lib/ui') → physical dir ('src/lib/ui') via tsconfig
      const physicalForAlias = Object.fromEntries(
        Object.entries(consumerAliases).map(([k, v]) => [k, (resolves(v) ?? '').replace(/^\.\//, '')]),
      );
      const wwwSide = canonicalTargets(testCase.items).sort();
      const consumerSide = testCase.items
        .flatMap((name) => (byName.get(name).files ?? []).map((f) => f.target ?? ''))
        .map((t) => {
          for (const [aliasKey, aliasPrefix] of Object.entries(consumerAliases)) {
            const head = `@${aliasKey}/`;
            if (t.startsWith(head)) return `${physicalForAlias[aliasKey]}/${t.slice(head.length)}`;
          }
          return null;
        })
        .filter(Boolean)
        .sort();
      const derivationValid = Object.values(physicalForAlias).every((p) => p.startsWith('src/lib'));
      check('template contract: consumer alias table resolves fully through tsconfig', derivationValid, JSON.stringify(physicalForAlias));
      check('template contract: canonical targets agree across alias tables', JSON.stringify(wwwSide) === JSON.stringify(consumerSide), `${wwwSide.length} vs ${consumerSide.length}`);
    }
    // (d) delivered .ts/.svelte.ts files keep their $lib imports — zero
    // bare `src/lib` specifiers (the rewrite no-op proof)
    {
      const offenders = walkFilesNamed(join(dir, 'src'), (name, content) => name.endsWith('.ts') && /(?:from|import|require)\s*['"]src\/lib/.test(content));
      check('template contract: delivered .ts keeps $lib (no bare src/lib specifiers)', offenders.length === 0, offenders.map((p) => `${p.slice(dir.length)}: ${(readFileSync(p, 'utf8').match(/['"]src\/lib[^'"]*['"]/) ?? [''])[0]}`).join(', ') || 'none');
    }
    // (e) the registry pointer the CLI actually consumed (on disk) points
    // at the live server this harness probed
    {
      const pointer = JSON.parse(ctx.read('components.json')).registries['@jixoai'];
      const u = new URL(pointer);
      // pathname is percent-encoded ({name} → %7Bname%7D) — decode before strip
      const originAndBase = `${u.origin}${decodeURIComponent(u.pathname).replace(/\/\{name\}\.json$/, '')}`;
      check('template contract: registry pointer = live server', originAndBase === BASE, `${pointer} vs ${BASE}`);
    }
  }

  // GENERIC: every canonical target of every case item landed
  const missing = canonicalTargets(testCase.items).filter((p) => !ctx.exists(p));
  check('canonical target files landed', missing.length === 0, missing.join(', ') || 'complete');

  // GENERIC: declared npm dependencies arrive in package.json
  // (registry `dependencies` may be an object map OR an array of names;
  // array entries may carry a version spec — compare against package.json
  // KEYS, which npm always writes as bare names)
  {
    const bare = (d) => (d.startsWith('@') ? d.split('@', 2).join('@') : d.split('@')[0]);
    const pkg = JSON.parse(ctx.read('package.json'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const depNames = (d) => (d == null ? [] : Array.isArray(d) ? d : Object.keys(d));
    const wanted = testCase.items.flatMap((name) => depNames(byName.get(name).dependencies)).map(bare);
    const absent = [...new Set(wanted)].filter((d) => !deps[d]);
    check('declared npm dependencies installed', absent.length === 0, absent.join(', ') || 'complete');
  }

  // GENERIC: forbidden tokens ride no edge, no import, and no filename
  // (prose mentions in comments are fine — the contract is about module
  // resolution, e.g. hero-section's css comments discuss the retired
  // reveal era without importing it)
  const IMPORT_OF = (token) => new RegExp(`(?:import|from|require)\\s*\\(?\\s*['"][^'"]*${token}[^'"]*['"]`);
  for (const token of testCase.forbidden ?? []) {
    const payloadEdges = testCase.items
      .map((name) => JSON.parse(readFileSync(join(registryDir, `${name}.json`), 'utf8')))
      .flatMap((payload) => payload.registryDependencies ?? []);
    check(`forbidden token not requested: ${token}`, !payloadEdges.some((e) => e.includes(token)), payloadEdges.join(', ') || 'no edges');
    const hits = walkFilesNamed(join(dir, 'src'), (name, content) => name.includes(token) || IMPORT_OF(token).test(content));
    check(`forbidden token imported nowhere: ${token}`, hits.length === 0, hits.map((p) => p.slice(dir.length)).join(', ') || 'none');
  }

  testCase.extraChecks?.(ctx);

  console.log('  vite build (import resolution + svelte compile gate)…');
  const build = await runIn(dir, 'npx', ['vite', 'build'], { timeoutMs: 600_000, label: `case ${testCase.id}: vite build` });
  check('consumer vite build passes', build.status === 0 && !build.timedOut, build.status === 0 ? '' : build.timedOut ? `TIMED OUT (600s group-budget), tail:\n${build.stdout.slice(-800)}` : `${build.stdout}\n${build.stderr}`.slice(-800));
  if (build.status === 0) await testCase.postBuild?.(ctx);
}

// ── 7. the forced-overflow probe (icon-component-pipeline C1, design
// §4 tier 2 + §5 sentinel) ──────────────────────────────────────────
// A REAL vite project (the consumer template's dependency tree — real
// vite, real builds, no mocks) whose artifact HAS lazy chunks: the 38
// built-ins packed under a per-icon maxChunkBytes → chunk 0 inline,
// chunks 1..N lazy. One fixture, three sub-probes:
//   (a) WIRED — jixoai({ icons: { library } }) per design §1: the build
//       emits every lazy chunk as its own asset and preloadIcons
//       RESOLVES them (the built entry runs under node; vite 8
//       tree-shaking drops an UNUSED lazy chain, so the entry drives
//       preloadIcons at top level to keep it alive);
//   (b) UNWIRED — plugin present, library NOT configured (provider-only
//       wiring): the build FAILS with the EXACT ICON_LIBRARY_SENTINEL_ERROR
//       bytes — the resolver's named error, never vite's generic
//       unresolved-import sink;
//   (c) RUNTIME — a wired-but-BROKEN server: its library resolves FEWER
//       icons than the artifact's packing assumes, the chunk import
//       throws at load time, and the artifact's LAZY catch rethrows the
//       sentinel with the drift failure as cause (the runtime belt).
// The sentinel + generator are IMPORTED from the built plugin dist (not
// copied) so the probe's bytes cannot drift from the plugin's contract.
console.log('\n━━ forced-overflow probe (icon-component-pipeline C1) ━━━━━━━━━━━━━━━');
const overflowDir = join(scratch, 'consumer-icon-overflow');
rmSync(overflowDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
mkdirSync(dirname(overflowDir), { recursive: true });
cpSync(templateDir, overflowDir, { recursive: true });

// @jixoai/ui-vite-plugin is unpublished (the ghostty-term precedent stubs its
// data contract for INSTALL fixtures); this BUILD probe needs the real
// plugin, so it is LINKED into the fixture's node_modules — the vitest
// vite-build.test.ts precedent imports the package directly. The link
// keeps the '@jixoai/ui-vite-plugin[/icons]' specifiers (the real consumer
// import surface) while svgo/lucide resolve from the package's own tree.
mkdirSync(join(overflowDir, 'node_modules', '@jixoai'), { recursive: true });
const pluginLink = join(overflowDir, 'node_modules', '@jixoai', 'ui-vite-plugin');
symlinkSync(join(root, 'packages', 'vite-plugin'), pluginLink, 'dir');
if (!existsSync(join(pluginLink, 'dist', 'icons.js'))) die('overflow: the @jixoai/ui-vite-plugin link did not land (dist/icons.js unreachable)');

let pluginIcons;
try {
  pluginIcons = await import(fileURLToPath(new URL('../packages/vite-plugin/dist/icons.js', import.meta.url)));
} catch (e) {
  die(`overflow: cannot import the built plugin dist — build packages/vite-plugin first (npm run build there): ${e?.message ?? e}`);
}
const { ICON_LIBRARY_SENTINEL_ERROR, createSafetyChecker, generateIconLibraryArtifacts, resolveLibraryInputs } = pluginIcons;

// generate the overflow artifact through the REAL adapter chain
// (resolve → safety → svgo → pack; the same pure core gen:icons uses):
// includeDefaults loads the 38 built-ins through lucide, and the budget
// (= the largest serialized icon) forces multiple chunks with NO
// oversized-own-chunk warnings. The SAME config drives the wired build,
// so the plugin-served chunks and the on-disk artifact are the same
// deterministic bytes.
const overflowLibrary = { includeDefaults: true };
const overflowNoIo = {
  async loadSource() {
    throw new Error('the overflow fixture declares no {file} sources');
  },
  watchFile() {},
};
const overflowResolution = await resolveLibraryInputs(overflowLibrary, overflowNoIo, createSafetyChecker({ mode: 'warn' }));
if (overflowResolution.warnings.length > 0) die(`overflow: the default library resolved with warnings: ${overflowResolution.warnings.join(' | ')}`);
if (overflowResolution.icons.length < 4) die(`overflow: expected the 38 built-ins, resolved ${overflowResolution.icons.length}`);
const overflowProbe = generateIconLibraryArtifacts(overflowResolution.icons, { maxChunkBytes: Number.MAX_SAFE_INTEGER });
const overflowBudget = Math.max(...Object.values(overflowProbe.report.perIconBytes));
const overflowGenerated = generateIconLibraryArtifacts(overflowResolution.icons, { maxChunkBytes: overflowBudget });
const overflowLazyChunks = overflowGenerated.report.lazyChunks.length;
if (overflowGenerated.report.chunkCount < 2 || overflowLazyChunks < 1) die('overflow: the per-icon budget produced no lazy chunks — the probe would prove nothing');
writeAt(overflowDir, 'src/lib/icon-set.gen.ts', overflowGenerated.artifact);
check(
  'overflow fixture: the generated artifact HAS lazy chunks',
  overflowGenerated.artifact.includes('virtual:jixoai-icons/chunk/'),
  `${overflowGenerated.report.chunkCount} chunks (${overflowLazyChunks} lazy), budget ${overflowBudget}B`,
);

// the entry drives BOTH paths at top level (vite 8 tree-shaking note):
// getIcon keeps the inline chain, preloadIcons keeps the LAZY chain
writeAt(
  overflowDir,
  'src/entry.js',
  [
    "import { getIcon, ICON_NAMES, preloadIcons } from './lib/icon-set.gen';",
    'export const inlineIcon = getIcon(ICON_NAMES[0]);',
    'export const lazyNames = ICON_NAMES.filter((name) => getIcon(name) === null);',
    '// vite 8 tree-shaking drops an UNUSED lazy chain — preloadIcons driven',
    '// at TOP LEVEL keeps the dynamic chunk imports + their sentinel catch alive',
    'const loaded = await preloadIcons(lazyNames);',
    'console.log(`OVF_PRELOAD_OK=${loaded.length}`);',
    'const firstLazy = getIcon(lazyNames[0]);',
    'console.log(`OVF_LAZY_ICON_NATURE=${firstLazy.n}`);',
    'console.log(`OVF_LAZY_ICON_HAS_D=${typeof firstLazy.d === "string" && firstLazy.d.length > 0}`);',
    'console.log(`OVF_ICON_COUNT=${ICON_NAMES.length}`);',
    'console.log(`OVF_LAZY_COUNT=${lazyNames.length}`);',
  ].join('\n'),
);

// (a) the WIRED config — the design §1 umbrella wiring
writeAt(
  overflowDir,
  'vite.config.ovf-wired.ts',
  `import { defineConfig } from 'vite';
import { jixoai } from '@jixoai/ui-vite-plugin';

// design §1: jixoai({ icons: { library } }) — the umbrella bridge, ghostty
// off (this fixture has no wasm business). includeDefaults: the full
// built-in manifest; maxChunkBytes: the per-icon budget the on-disk
// artifact was packed under (parity by determinism).
export default defineConfig({
  plugins: [jixoai({
    ghostty: false,
    icons: { library: { includeDefaults: true, maxChunkBytes: ${overflowBudget} } },
  })],
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/entry.js',
      output: { entryFileNames: 'entry.js', chunkFileNames: 'chunks/[name]-[hash].js' },
    },
  },
});
`,
);

// (b) the UNWIRED config — plugin present, library NOT configured
// (provider-only): the artifact's chunk imports must fail with the NAMED
// sentinel, never vite's generic unresolved-import error
writeAt(
  overflowDir,
  'vite.config.ovf-unwired.ts',
  `import { defineConfig } from 'vite';
import { jixoai } from '@jixoai/ui-vite-plugin';
import { svgIconProvider } from '@jixoai/ui-vite-plugin/icons';

export default defineConfig({
  plugins: [jixoai({
    ghostty: false,
    icons: { provider: svgIconProvider({ dir: './slot-icons', slots: {} }) },
  })],
  build: {
    target: 'esnext',
    outDir: 'dist-unwired',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/entry.js',
      output: { entryFileNames: 'entry.js', chunkFileNames: 'chunks/[name]-[hash].js' },
    },
  },
});
`,
);

// (c) the wired-but-BROKEN runtime harness: the artifact on disk was packed
// from the FULL overflow library, but THIS server wires a SMALLER library
// (its own output points elsewhere, so the artifact under test serves from
// disk). The artifact's lazy import resolves but fails to load → the LAZY
// catch must rethrow the FIXED sentinel with the drift error as cause.
writeAt(
  overflowDir,
  'ovf-runtime-sentinel.mjs',
  [
    "import { createServer } from 'vite';",
    "import { createIconPlugin } from '@jixoai/ui-vite-plugin/icons';",
    '',
    'const server = await createServer({',
    '  root: new URL(".", import.meta.url).pathname,',
    "  logLevel: 'silent',",
    '  configFile: false,',
    '  plugins: [',
    '    createIconPlugin({',
    '      library: {',
    '        includeDefaults: false,',
    "        icons: { probeOnly: '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\"><path d=\"M1 1l3 3\"/></svg>' },",
    "        output: 'src/lib/other.gen.ts',",
    '      },',
    '    }),',
    '  ],',
    '});',
    'try {',
    "  const mod = await server.ssrLoadModule('/src/lib/icon-set.gen.ts');",
    '  const inlineName = mod.ICON_NAMES[0];',
    '  console.log(`RUNTIME_INLINE_OK=${mod.getIcon(inlineName) !== null}`);',
    '  const lazyName = mod.ICON_NAMES.find((name) => mod.getIcon(name) === null);',
    '  try {',
    '    await mod.loadIcon(lazyName);',
    "    console.log('RUNTIME_SENTINEL=MISSING (loadIcon resolved!)');",
    '    process.exitCode = 1;',
    '  } catch (err) {',
    '    console.log(`RUNTIME_SENTINEL_MESSAGE=${err.message}`);',
    '    console.log(`RUNTIME_SENTINEL_CAUSE=${err.cause instanceof Error ? err.cause.message : String(err.cause)}`);',
    '  }',
    '} finally {',
    '  await server.close();',
    '}',
  ].join('\n'),
);

// (a) WIRED — build, then run the built entry under node so preloadIcons
// resolves against the EMITTED chunk assets (chunks emit AND load)
console.log('  vite build (wired library — lazy chunks emit)…');
const wired = await runIn(overflowDir, 'npx', ['vite', 'build', '-c', 'vite.config.ovf-wired.ts'], { timeoutMs: 300_000, label: 'overflow: wired vite build' });
check(
  'overflow wired: vite build passes',
  wired.status === 0 && !wired.timedOut,
  wired.status === 0 ? '' : wired.timedOut ? `TIMED OUT (300s group-budget), tail:\n${wired.stdout.slice(-800)}` : `${wired.stdout}\n${wired.stderr}`.slice(-800),
);
if (wired.status === 0 && !wired.timedOut) {
  const chunkFiles = readdirSync(join(overflowDir, 'dist', 'chunks'), { withFileTypes: true }).filter((f) => f.name.endsWith('.js'));
  check(
    'overflow wired: every lazy chunk emitted as its own asset',
    chunkFiles.length === overflowLazyChunks,
    `${chunkFiles.length} emitted vs ${overflowLazyChunks} lazy`,
  );
  const entryBundle = readFileSync(join(overflowDir, 'dist', 'entry.js'), 'utf8');
  check('overflow wired: built entry seeds the inline cache', entryBundle.includes('new Map(Object.entries('));
  check(
    'overflow wired: the sentinel catch survived the build (LAZY chain kept)',
    entryBundle.includes(ICON_LIBRARY_SENTINEL_ERROR),
  );
  const wiredRun = await runIn(overflowDir, process.execPath, ['dist/entry.js'], { timeoutMs: 120_000, label: 'overflow: wired entry run' });
  check(
    'overflow wired: built entry runs green',
    wiredRun.status === 0 && !wiredRun.timedOut,
    wiredRun.status === 0 ? '' : `${wiredRun.stdout}\n${wiredRun.stderr}`.slice(-800),
  );
  if (wiredRun.status === 0 && !wiredRun.timedOut) {
    const lazyCount = Number(/OVF_LAZY_COUNT=(\d+)/.exec(wiredRun.stdout)?.[1] ?? NaN);
    check(
      'overflow wired: preloadIcons resolved every lazy name',
      lazyCount > 0 && wiredRun.stdout.includes(`OVF_PRELOAD_OK=${lazyCount}`),
      wiredRun.stdout.split('\n').filter((l) => l.startsWith('OVF_')).join(' | '),
    );
    check(
      'overflow wired: lazy payloads are real {v,n,d} artwork',
      wiredRun.stdout.includes('OVF_LAZY_ICON_HAS_D=true') && /OVF_LAZY_ICON_NATURE=(fill|stroke)/.test(wiredRun.stdout),
      wiredRun.stdout.split('\n').filter((l) => l.startsWith('OVF_')).join(' | '),
    );
  }
}

// (b) UNWIRED — the build must FAIL with the EXACT sentinel bytes
console.log('  vite build (unwired — expecting the sentinel failure)…');
const unwired = await runIn(overflowDir, 'npx', ['vite', 'build', '-c', 'vite.config.ovf-unwired.ts'], { timeoutMs: 300_000, label: 'overflow: unwired vite build' });
check(
  'overflow unwired: the build FAILS (library not configured)',
  unwired.status !== 0 && !unwired.timedOut,
  unwired.status === 0 ? 'unexpectedly GREEN — the sentinel did not fire' : '',
);
const unwiredOut = `${unwired.stdout}\n${unwired.stderr}`;
check(
  'overflow unwired: the EXACT sentinel bytes name the fix',
  unwiredOut.includes(ICON_LIBRARY_SENTINEL_ERROR),
  unwiredOut.slice(-500),
);

// (c) RUNTIME — the LAZY catch rethrows the sentinel with cause
console.log('  runtime sentinel (wired-but-broken server)…');
const runtime = await runIn(overflowDir, process.execPath, ['ovf-runtime-sentinel.mjs'], { timeoutMs: 120_000, label: 'overflow: runtime sentinel harness' });
check(
  'overflow runtime: harness ran green',
  runtime.status === 0 && !runtime.timedOut,
  runtime.status === 0 ? '' : runtime.timedOut ? 'TIMED OUT (120s group-budget)' : `${runtime.stdout}\n${runtime.stderr}`.slice(-800),
);
if (runtime.status === 0 && !runtime.timedOut) {
  const message = /RUNTIME_SENTINEL_MESSAGE=(.*)/.exec(runtime.stdout)?.[1] ?? '';
  const cause = /RUNTIME_SENTINEL_CAUSE=(.*)/.exec(runtime.stdout)?.[1] ?? '';
  check('overflow runtime: inline core still answers synchronously', runtime.stdout.includes('RUNTIME_INLINE_OK=true'), runtime.stdout.trim());
  check(
    'overflow runtime: LAZY catch rethrows the EXACT sentinel',
    message === ICON_LIBRARY_SENTINEL_ERROR,
    message,
  );
  check(
    'overflow runtime: the drift failure rides as cause',
    /virtual chunk \d+ requested but the configured library has no such chunk/.test(cause),
    cause,
  );
}

// the ONE exit: reap every registered group (TERM→grace→KILL→verify),
// release the lock, then exit with the case verdict. The scratch tree
// stays for inspection; the next run wipes it under the lock.
const failed = results.filter((r) => !r.ok);
console.log(
  failed.length === 0
    ? `\nclean-install cases (${CASES.length}): ALL GREEN`
    : `\nclean-install cases (${CASES.length}): ${failed.length} FAILURE(S)`,
);
await finish(failed.length === 0 ? 0 : 1);
