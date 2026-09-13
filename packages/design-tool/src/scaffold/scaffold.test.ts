/**
 * scaffold.test.ts — scaffold idempotence (V1): two runs over the
 * same host, the second run performs ZERO writes and every byte
 * survives a user edit. Data-driven against the real templates tree
 * (subagent A's welcome demo landed 2026-09-11; the assertions adapt
 * whether prototype templates are present or not).
 *
 * Original need: design-studio T3/V1 (2026-09-11).
 */

import { strict as assert } from 'node:assert';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { scaffoldWorkspace } from './scaffold.ts';

const TEMPLATES_DIR = join(import.meta.dirname, 'templates');

/** template-relative paths that should land in design/ (design/ prefix stripped) */
function expectedTemplateLandings(): string[] {
  if (!existsSync(TEMPLATES_DIR)) return [];
  const walk = (dir: string, prefix: string): string[] => {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      const rel = prefix === '' ? entry.name : `${prefix}/${entry.name}`;
      if (entry.isDirectory()) out.push(...walk(join(dir, entry.name), rel));
      else if (rel !== 'README.md') out.push(rel.startsWith('design/') ? rel.slice('design/'.length) : rel);
    }
    return out;
  };
  return walk(TEMPLATES_DIR, '');
}

test('first run scaffolds the studio mount page plus every template (byte-identical, no design/ nesting)', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-scaffold-'));
  try {
    const landings = expectedTemplateLandings();
    const result = scaffoldWorkspace(host);
    assert.deepEqual(
      [...result.created].sort((a, b) => (a < b ? -1 : 1)),
      ['studio.svelte', ...landings].sort((a, b) => (a < b ? -1 : 1)),
    );

    const content = readFileSync(join(host, 'design/studio.svelte'), 'utf8');
    assert.ok(content.includes(`from '#jixoai-design/shell'`), 'mount page imports the default shell alias');
    assert.ok(content.includes('manifestUrl'), 'mount page wires the manifest endpoint');

    for (const landing of landings) {
      const landed = readFileSync(join(host, 'design', landing), 'utf8');
      const source = readFileSync(join(TEMPLATES_DIR, landing.startsWith('design/') ? landing : `design/${landing}`), 'utf8');
      assert.equal(landed, source, `${landing} must be a byte-identical copy`);
      assert.ok(!landing.startsWith('design/'), 'the design/ mirror prefix is stripped, no double nesting');
    }
    // the provenance README never scaffolds
    assert.ok(!existsSync(join(host, 'design/README.md')));
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('V1 idempotence: re-run after a host edit writes nothing, edits survive byte-identical', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-scaffold-'));
  try {
    scaffoldWorkspace(host);
    const studioPath = join(host, 'design/studio.svelte');
    const edited = '<!-- my fork -->\n' + readFileSync(studioPath, 'utf8');
    writeFileSync(studioPath, edited);

    const second = scaffoldWorkspace(host);
    assert.equal(second.created.length, 0, 'second run creates nothing');
    assert.deepEqual(
      [...second.kept].sort((a, b) => (a < b ? -1 : 1)),
      ['studio.svelte', ...expectedTemplateLandings()].sort((a, b) => (a < b ? -1 : 1)),
    );
    assert.equal(readFileSync(studioPath, 'utf8'), edited, 'the host edit survives byte-identical');
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('gap filling: a deleted target is re-created while existing siblings stay untouched', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-scaffold-'));
  try {
    scaffoldWorkspace(host);
    rmSync(join(host, 'design/studio.svelte'));
    const second = scaffoldWorkspace(host);
    assert.deepEqual(second.created, ['studio.svelte']);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});
