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
//
// Usage (from repo root):
//   node scripts/verify-shadcn-add.mjs
// Scratch lives under .agents/fixtures/ (gitignored), wiped per run.

import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
  if (report.leaked.length) console.error(`[lifecycle] LEAKED after SIGKILL (unreapable): ${report.leaked.join(', ')}`);
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

// ── self-test modes (B2 fixtures, impl-review r1): drive the REAL kernel
// with REAL signals and subprocesses — timeout-style escalation, SIGINT
// reaping across processes, lock denial, stale-lock takeover. The kernel
// is imported from lib/child-lifecycle.mjs, never re-implemented here.
if (process.argv.includes('--lock-deny')) {
  // internal: a probe that must die because someone else holds the lock
  acquireLock(LOCK_DIR);
  console.error('[lock-deny] unexpectedly acquired — probe is broken');
  process.exit(42);
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
  const fail = (m) => { console.error(`  FAIL  ${m}`); process.exit(1); };

  // 1. the lock this process already holds is well-formed (owner = us)
  //    and denies a second instance cross-process (the real TOCTOU probe)
  {
    const owner = JSON.parse(readFileSync(join(LOCK_DIR, 'owner.json'), 'utf8'));
    if (owner.pid !== process.pid) fail(`lock owner is ${owner.pid}, expected ${process.pid}`);
    pass(`lock held: ${LOCK_DIR} (owner = self)`);
    const deny = spawnSync(process.execPath, [process.argv[1], '--lock-deny'], { encoding: 'utf8' });
    if (deny.status === 0) fail('lock-deny probe unexpectedly succeeded');
    if (!String(deny.stderr).includes('holds')) fail(`lock-deny probe died for the wrong reason:\n${deny.stderr}`);
    pass('a live holder denies a second instance (cross-process)');
  }

  // 2. escalation: a SIGTERM-immune sleeper must fall to SIGKILL, a
  //    well-behaved one to SIGTERM — and NOTHING may leak
  const stub = spawn(process.execPath, ['-e', 'process.on("SIGTERM", () => {}); setInterval(() => {}, 1 << 30)'], { stdio: 'ignore', detached: true });
  const nice = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1 << 30)'], { stdio: 'ignore', detached: true });
  CHILDREN.add(stub.pid, 'stubborn (SIGTERM-immune) sleeper');
  CHILDREN.add(nice.pid, 'well-behaved sleeper');
  // boot settle: both children must finish node startup and INSTALL their
  // signal dispositions before the TERM arrives — reaping a half-booted
  // child proves nothing about the handler path
  await new Promise((r) => setTimeout(r, 600));
  const report = await CHILDREN.reap({ graceMs: 1200, pollMs: 50 });
  if (!report.escalated.includes(stub.pid)) fail(`the SIGTERM-immune sleeper was not escalated: ${JSON.stringify(report)}`);
  if (report.escalated.includes(nice.pid)) fail(`the well-behaved sleeper needed escalation: ${JSON.stringify(report)}`);
  if (report.leaked.length) fail(`leaked after SIGKILL: ${report.leaked.join(', ')}`);
  pass(`reap: TERM sufficed for the well-behaved, KILL for the stubborn, zero leaks`);

  // 3. stale-lock takeover: a dead holder's lock is retired atomically
  releaseLock();
  const deadHolder = spawnSync(process.execPath, ['-e', 'process.exit(0)']);
  mkdirSync(LOCK_DIR, { recursive: true });
  writeFileSync(join(LOCK_DIR, 'owner.json'), `${JSON.stringify({ pid: deadHolder.pid, started: 'long ago' })}\n`);
  const rl2 = acquireLock(LOCK_DIR);
  rl2();
  if (existsSync(LOCK_DIR)) fail('release left the lock dir behind');
  pass('a stale lock (dead holder) is taken over via rename-retirement');

  // 4. SIGINT across processes: the victim's sleepers die and its lock
  //    releases before it exits 130
  const victim = spawn(process.execPath, [process.argv[1], '--victim'], { stdio: ['ignore', 'pipe', 'inherit'] });
  let ready = '';
  victim.stdout.on('data', (d) => (ready += d));
  const waitFor = async (pred, what, ms = 10_000) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (pred()) return true;
      await new Promise((r) => setTimeout(r, 100));
    }
    fail(`timeout waiting for ${what}`);
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
  if (vcode !== 130) fail(`victim exited ${vcode}, expected 130`);

  console.log('[lifecycle-self-test] GREEN — atomic lock, live denial, TERM/KILL escalation, stale takeover, cross-process SIGINT reap');
  process.exit(0);
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
        'src/lib/icons.ts',
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
      ['registry/files/lib/icons.ts', 'src/lib/icons.ts'],
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
      const missing = ['src/lib/jixoai.css', 'src/lib/icons.ts'].filter((f) => !ctx.exists(f));
      check('hero-section: theme + icons closure arrived', missing.length === 0, missing.join(', ') || 'complete');
    },
  },
];

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
  CHILDREN.add(child.pid, 'npm install (consumer template)');
  let out = '';
  child.stdout?.on('data', (d) => (out += d));
  child.stderr?.on('data', (d) => (out += d));
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    // the group dies in finish()'s reap; the flag rides the diagnostic
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      /* already gone */
    }
  }, 600_000);
  const code = await new Promise((resolveExit) => child.on('exit', resolveExit));
  clearTimeout(timer);
  if (timedOut) die(`npm install exceeded the 600s group-budget — process group ${child.pid} SIGTERMed; tail:\n${out.slice(-1200)}`);
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
  CHILDREN.add(child.pid, `${cmd} ${args.join(' ')}${label ? ` (${label})` : ''}`);
  let out = '';
  child.stdout?.on('data', (d) => (out += d));
  child.stderr?.on('data', (d) => (out += d));
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      /* already gone */
    }
  }, timeoutMs);
  const status = await new Promise((resolveExit) => child.on('exit', resolveExit));
  clearTimeout(timer);
  return { status, stdout: out, stderr: out, timedOut };
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
  if (build.status === 0) testCase.postBuild?.(ctx);
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
