/**
 * design-file.test.ts — the release-artifact design file (r2 rev2):
 * export-at-tag round trip (byte-identical materialization through
 * open), the artifact's version/changelog derived from the tag
 * ledger, open idempotence, the named-refusal path conflict, and
 * parse validation (type stamp, unsafe paths).
 *
 * Original need: design-studio r2 rev2 (2026-09-11, git release
 * model — the JSON is a shareable artifact, git is the database).
 */

import { strict as assert } from 'node:assert';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { exportDesignFile, openDesignFile, parseDesignFile, designFilePath, DesignFileError } from './design-file.ts';
import { releaseDesignTag, saveDesignCommit } from './design-repo.ts';
import { CANVAS_SOURCE, buildTestHost } from './test-host.ts';

test('round trip: export at the tag, delete the prototype, open — every byte returns', () => {
  const host = buildTestHost();
  try {
    const artifact = exportDesignFile(host.root, 'checkout', host.r1);
    assert.equal(artifact, designFilePath(host.root, 'checkout'));

    const raw = readFileSync(artifact, 'utf8');
    const parsed = JSON.parse(raw) as ReturnType<typeof parseDesignFile>;
    assert.equal(parsed.$schema, 'https://ui.jixoai.com/r/design-file.schema.json');
    assert.equal(parsed.name, 'checkout');
    assert.equal(parsed.type, 'jixoai:design');
    assert.equal(parsed.version, 1, 'r1 is the first release in the ledger');
    assert.equal(parsed.meta.tag, 'r1');
    assert.deepEqual(
      parsed.files.map((f) => f.path).sort(),
      ['canvas.svelte', 'components/cta.svelte', 'pages/hero.svelte'],
    );

    rmSync(host.protoDir, { recursive: true });
    const result = openDesignFile(host.root, artifact);
    assert.equal(result.name, 'checkout');
    assert.equal(result.version, 1);
    assert.equal(readFileSync(join(host.protoDir, 'canvas.svelte'), 'utf8'), CANVAS_SOURCE, 'canvas returns byte-identical');
    assert.ok(readFileSync(join(host.protoDir, 'pages/hero.svelte'), 'utf8').includes('Deploy'));
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('the artifact changelog follows the tag ledger (notes intact, version = ordinal)', () => {
  const host = buildTestHost();
  try {
    writeFileSync(host.heroPath, readFileSync(host.heroPath, 'utf8').replace('Deploy', 'Ship it'), 'utf8');
    saveDesignCommit(host.root, 'checkout', 'v2 wip');
    const r2 = releaseDesignTag(host.root, 'r2', 'deploy → ship it');

    const parsed = JSON.parse(readFileSync(exportDesignFile(host.root, 'checkout', r2.tag), 'utf8')) as ReturnType<typeof parseDesignFile>;
    assert.equal(parsed.version, 2);
    assert.deepEqual(
      parsed.changes.map((c) => [c.version, c.note]),
      [[1, 'first release'], [2, 'deploy → ship it']],
      'the changelog IS the tag ledger with its notes',
    );
    assert.ok(parsed.files.find((f) => f.path === 'pages/hero.svelte')!.content.includes('Ship it'), 'the artifact snapshots the TAGGED content, not the working tree');
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('export refuses a prototype with no tracked files at the tag', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-file-'));
  try {
    const dir = join(host, 'design/prototypes/empty/pages');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'x.svelte'), 'x\n', 'utf8');
    saveDesignCommit(host);
    const r1 = releaseDesignTag(host, 'r1', 'seed');
    // delete the only file, save + release → tag r2 has no tracked files for `empty`
    writeFileSync(join(dir, 'x.svelte'), '', 'utf8');
    rmSync(join(dir, 'x.svelte'));
    saveDesignCommit(host);
    const r2 = releaseDesignTag(host, 'r2', 'gone');
    void r1;
    assert.throws(() => exportDesignFile(host, 'empty', r2.tag), /no tracked files/);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('open is idempotent: a second open writes nothing and reports everything unchanged', () => {
  const host = buildTestHost();
  try {
    const artifact = exportDesignFile(host.root, 'checkout', host.r1);
    rmSync(host.protoDir, { recursive: true });
    openDesignFile(host.root, artifact);
    const second = openDesignFile(host.root, artifact);
    assert.deepEqual(second.written, []);
    assert.equal(second.unchanged.length, 3);
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('open refuses a clashing path by naming it, and never overwrites', () => {
  const host = buildTestHost();
  try {
    const artifact = exportDesignFile(host.root, 'checkout', host.r1);
    rmSync(host.protoDir, { recursive: true });
    openDesignFile(host.root, artifact);
    const clash = join(host.protoDir, 'pages/hero.svelte');
    writeFileSync(clash, 'host edit\n', 'utf8');
    assert.throws(() => openDesignFile(host.root, artifact), (error: unknown) => {
      assert.ok(error instanceof DesignFileError);
      assert.ok(error.message.includes(clash), `error names the clashing path: ${error.message}`);
      return true;
    });
    assert.equal(readFileSync(clash, 'utf8'), 'host edit\n', 'the host edit survives');
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('parse rejects wrong type stamps and unsafe paths', () => {
  const badType = JSON.stringify({ name: 'x', type: 'other', version: 1, changes: [], files: [] });
  assert.throws(() => parseDesignFile(badType, 'x.json'), /type must be/);
  const escape = JSON.stringify({
    name: 'x',
    type: 'jixoai:design',
    version: 1,
    changes: [],
    files: [{ path: '../evil.svelte', content: '' }],
  });
  assert.throws(() => parseDesignFile(escape, 'x.json'), /unsafe file path/);
  const host = mkdtempSync(join(tmpdir(), 'design-file-'));
  try {
    writeFileSync(join(host, 'bad.jixoai-design.json'), escape, 'utf8');
    assert.throws(() => openDesignFile(host, 'bad.jixoai-design.json'), DesignFileError);
    assert.equal(existsSync(join(host, 'design/prototypes/x/../evil.svelte')), false);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});
