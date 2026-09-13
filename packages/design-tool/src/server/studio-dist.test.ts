/**
 * studio-dist.test.ts — fixture unit tests for the prebuilt studio
 * bundle's shared base (issue #18): input content hashing, the build
 * manifest, MIME mapping, and the static-hosting middlewares.
 *
 * Original need: issue #18 foundation round (2026-09-13). Fixtures are
 * built in tmp dirs (node:test + node:fs, the probe.test.ts style);
 * content-vs-mtime is the load-bearing assertion (git checkout/rebase
 * resets mtimes — a mtime oracle would flag forever-stale bundles).
 */

import { strict as assert } from 'node:assert';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  computeStudioInputsHash,
  mimeFor,
  readStudioBuildManifest,
  resolveStudioAsset,
  serveStudioAsset,
  serveStudioIndex,
  studioDistStatus,
  studioInputRoots,
  writeStudioBuildManifest,
} from './studio-dist.ts';

function tmpRepo(): string {
  return mkdtempSync(join(tmpdir(), 'studio-dist-'));
}

function write(path: string, content: string): void {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content);
}

/** a minimal vehicle-shaped repo: one file per hashed input class */
function seedVehicle(repo: string): void {
  write(join(repo, 'packages/design-tool/src/studio/shell.svelte'), '<main>shell v1</main>\n');
  write(join(repo, 'packages/design-tool/src/server/resolver.ts'), 'export const x = 1;\n');
  write(join(repo, 'registry/files/ui/press-button/index.ts'), "export { default } from './p.svelte';\n");
  write(join(repo, 'registry/files/lib/cn.ts'), 'export const cn = () => {};\n');
  write(join(repo, 'registry/files/theme/jixoai.css'), ':root { --brand-hue: 330; }\n');
  write(join(repo, 'apps/www/src/lib/utils/cn.ts'), 'export const cn = () => {};\n');
  write(join(repo, 'scripts/build-studio.mjs'), '// build\n');
}

/* ── the input hash ───────────────────────────────────────────────────── */

test('hash: deterministic across calls and stable under mtime-only drift', () => {
  const repo = tmpRepo();
  try {
    seedVehicle(repo);
    const first = computeStudioInputsHash(repo);
    assert.match(first, /^[0-9a-f]{64}$/);
    assert.equal(computeStudioInputsHash(repo), first);

    // mtime regression (the rebase/checkout trap): content untouched →
    // the hash MUST not move
    const past = new Date('2020-01-01T00:00:00Z');
    utimesSync(join(repo, 'registry/files/theme/jixoai.css'), past, past);
    assert.equal(computeStudioInputsHash(repo), first);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('hash: content changes in ANY input class move it (studio, ui, lib, theme, www-mirror, build script)', () => {
  const repo = tmpRepo();
  try {
    seedVehicle(repo);
    const base = computeStudioInputsHash(repo);
    const mutations: Array<[string, string]> = [
      ['packages/design-tool/src/studio/shell.svelte', '<main>shell v2</main>\n'],
      ['registry/files/ui/press-button/index.ts', "export { default } from './q.svelte';\n"],
      ['registry/files/lib/cn.ts', 'export const cn = () => 2;\n'],
      ['registry/files/theme/jixoai.css', ':root { --brand-hue: 200; }\n'],
      ['apps/www/src/lib/utils/cn.ts', 'export const cn = () => 3;\n'],
      ['scripts/build-studio.mjs', '// build v2\n'],
    ];
    for (const [rel, mutatedContent] of mutations) {
      const path = join(repo, rel);
      const original = readFileSync(path, 'utf8');
      writeFileSync(path, mutatedContent);
      assert.notEqual(computeStudioInputsHash(repo), base, `${rel} content change must move the hash`);
      writeFileSync(path, original); // restore → next mutation starts from the base set
    }
    assert.equal(computeStudioInputsHash(repo), base); // full restore, no residue
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('hash: missing roots hash as named markers (computable in any install)', () => {
  const empty = tmpRepo();
  try {
    const hash = computeStudioInputsHash(empty);
    assert.match(hash, /^[0-9a-f]{64}$/);
    assert.equal(computeStudioInputsHash(empty), hash);
    // adding one previously-missing input moves it
    write(join(empty, 'registry/files/theme/jx-pure.css'), '/* new */\n');
    assert.notEqual(computeStudioInputsHash(empty), hash);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test('input roots: the contract covers studio sources, the build script, and every alias-target tree', () => {
  const roots = studioInputRoots('/repo').map((root) => root.replaceAll('\\', '/'));
  for (const expected of [
    '/repo/packages/design-tool/src/studio',
    '/repo/scripts/build-studio.mjs',
    '/repo/registry/files/ui',
    '/repo/registry/files/lib',
    '/repo/registry/files/theme',
    '/repo/apps/www/src/lib',
  ]) {
    assert.ok(roots.includes(expected), `input roots must include ${expected}`);
  }
});

/* ── the build manifest ───────────────────────────────────────────────── */

test('manifest: null when absent or malformed; writeStudioBuildManifest round-trips the live hash', () => {
  const repo = tmpRepo();
  const dist = join(repo, 'dist-studio');
  try {
    seedVehicle(repo);
    assert.equal(readStudioBuildManifest(dist), null);
    mkdirSync(dist, { recursive: true });
    // malformed JSON → null (never a crash on a half-written artifact)
    writeFileSync(join(dist, 'build-manifest.json'), '{not json');
    assert.equal(readStudioBuildManifest(dist), null);

    const written = writeStudioBuildManifest(repo, dist);
    assert.equal(written.inputsHash, computeStudioInputsHash(repo));
    assert.match(written.builtAt, /^\d{4}-\d{2}-\d{2}T/);
    assert.ok(written.inputRoots.includes('registry/files/ui'));

    const read = readStudioBuildManifest(dist);
    assert.ok(read !== null);
    assert.equal(read.inputsHash, written.inputsHash);
    assert.equal(read.studioVersion, written.studioVersion);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

/* ── MIME + asset resolution ──────────────────────────────────────────── */

test('mimeFor: honest types for the bundle file vocabulary', () => {
  assert.equal(mimeFor('index.html'), 'text/html; charset=utf-8');
  assert.equal(mimeFor('assets/entry-abc.js'), 'text/javascript; charset=utf-8');
  assert.equal(mimeFor('assets/entry-abc.css'), 'text/css; charset=utf-8');
  assert.equal(mimeFor('assets/jetbrains-abc.woff2'), 'font/woff2');
  assert.equal(mimeFor('assets/manifest.json'), 'application/json; charset=utf-8');
  assert.equal(mimeFor('assets/glyph.svg'), 'image/svg+xml');
  assert.equal(mimeFor('assets/blob.bin'), 'application/octet-stream');
});

test('resolveStudioAsset: maps only real bundle files under /__design__/', () => {
  const dist = tmpRepo();
  try {
    mkdirSync(join(dist, 'assets'), { recursive: true });
    writeFileSync(join(dist, 'assets', 'entry-abc.js'), 'export {};\n');

    assert.equal(resolveStudioAsset(dist, '/frame'), null); // not the studio prefix
    assert.equal(resolveStudioAsset(dist, '/__design__/'), null); // the SPA route, not an asset
    assert.equal(resolveStudioAsset(dist, '/__design__/frame'), null); // dynamic face owns it
    assert.equal(resolveStudioAsset(dist, '/__design__/api/manifest.json'), null);
    assert.equal(resolveStudioAsset(dist, '/__design__/assets/missing.js'), null);
    assert.equal(resolveStudioAsset(dist, '/__design__/../build-manifest.json'), null); // traversal
    assert.equal(resolveStudioAsset(dist, '/__design__/%2e%2e/secret.js'), null); // encoded traversal
    assert.equal(resolveStudioAsset(dist, '/__design__/assets/../../secret.js'), null);

    const asset = resolveStudioAsset(dist, '/__design__/assets/entry-abc.js');
    assert.ok(asset !== null);
    assert.equal(asset.mime, 'text/javascript; charset=utf-8');
    assert.ok(asset.file.endsWith(join('assets', 'entry-abc.js')));
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});

/* ── the hosting middlewares (stub ServerResponse) ────────────────────── */

interface StubResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  setHeader(name: string, value: string): void;
  end(body: string): void;
}

function stubResponse(): StubResponse {
  const res: StubResponse = {
    statusCode: 0,
    headers: {},
    body: '',
    setHeader(name, value) {
      res.headers[name] = value;
    },
    end(body) {
      res.body = body;
    },
  };
  return res;
}

test('serveStudioIndex: 200 + no-store when the bundle exists; 503 + build:studio guidance when absent', () => {
  const dist = tmpRepo();
  try {
    const missing = stubResponse();
    serveStudioIndex(dist, missing);
    assert.equal(missing.statusCode, 503);
    assert.match(missing.headers['Content-Type'] ?? '', /text\/html/);
    assert.match(missing.body, /npm run build:studio/);
    assert.match(missing.body, /dev:studio/);
    assert.match(missing.body, new RegExp(dist.replaceAll('\\', '\\\\'), 'u')); // names where it looked

    writeFileSync(join(dist, 'index.html'), '<!doctype html><title>studio</title>');
    const served = stubResponse();
    serveStudioIndex(dist, served);
    assert.equal(served.statusCode, 200);
    assert.equal(served.headers['Cache-Control'], 'no-store');
    assert.match(served.body, /<title>studio<\/title>/);
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});

test('serveStudioAsset: serves the mapped file with its MIME; falls through (false) otherwise', () => {
  const dist = tmpRepo();
  try {
    mkdirSync(join(dist, 'assets'), { recursive: true });
    writeFileSync(join(dist, 'assets', 'entry-abc.js'), 'export {};\n');
    writeFileSync(join(dist, 'assets', 'font-xyz.woff2'), new Uint8Array([0, 0x77, 0x4f, 0x32]));

    const js = stubResponse();
    assert.equal(serveStudioAsset(dist, '/__design__/assets/entry-abc.js', js), true);
    assert.equal(js.statusCode, 200);
    assert.equal(js.headers['Content-Type'], 'text/javascript; charset=utf-8');

    const font = stubResponse();
    assert.equal(serveStudioAsset(dist, '/__design__/assets/font-xyz.woff2', font), true);
    assert.equal(font.headers['Content-Type'], 'font/woff2');

    const missed = stubResponse();
    assert.equal(serveStudioAsset(dist, '/__design__/assets/nope.js', missed), false);
    assert.equal(missed.statusCode, 0); // untouched — the caller keeps routing
  } finally {
    rmSync(dist, { recursive: true, force: true });
  }
});

/* ── the staleness oracle (real-package smoke — state-machine only) ───── */

test('studioDistStatus: reports a legal state for THIS checkout (build-order dependent)', () => {
  const status = studioDistStatus();
  assert.ok(['current', 'missing', 'stale'].includes(status.state));
  assert.ok(status.distDir.replaceAll('\\', '/').endsWith('packages/design-tool/dist-studio'));
  if (status.state === 'current' || status.state === 'stale') {
    assert.ok(status.manifest !== null);
    assert.match(status.manifest.inputsHash, /^[0-9a-f]{64}$/);
  }
});
