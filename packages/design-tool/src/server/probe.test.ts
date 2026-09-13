/**
 * probe.test.ts — fixture-tree unit tests for probeDesignHost (T0).
 *
 * Original need: design-studio T0 (2026-09-11) demands a testable
 * alias table. Fixtures are built in tmp dirs (node:test + node:fs);
 * the REAL worktree is asserted as the vehicle smoke (moduleRoot
 * resolution included).
 */

import { strict as assert } from 'node:assert';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { ITEM_ALIAS_PREFIX, probeDesignHost } from './probe.ts';

function tmpHost(): string {
  return mkdtempSync(join(tmpdir(), 'design-probe-'));
}

function write(path: string, content: string): void {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content);
}

/* ── vehicle fixtures ─────────────────────────────────────────────────── */

test('vehicle: registry layout yields item aliases pointing at real entries', () => {
  const host = tmpHost();
  try {
    write(join(host, 'registry.json'), '{"items":[]}');
    write(join(host, 'registry/files/ui/press-button/index.ts'), "export { default } from './press-button.svelte';\n");
    write(join(host, 'registry/files/ui/press-button/press-button.svelte'), '<main>press</main>\n');
    write(join(host, 'registry/files/ui/badge/badge.svelte'), '<span>badge</span>\n'); // no index.ts
    write(join(host, 'apps/www/src/app.css'), "@import 'tailwindcss';\n");
    write(join(host, 'apps/www/src/lib/jixoai.css'), ':root { --x: 1; }\n');

    const info = probeDesignHost(host);
    assert.equal(info.kind, 'vehicle');
    assert.ok(info.itemAliases[`${ITEM_ALIAS_PREFIX}press-button`]?.endsWith('index.ts'));
    // no index.ts → the name-matching .svelte is the entry
    assert.ok(info.itemAliases[`${ITEM_ALIAS_PREFIX}badge`]?.endsWith('badge.svelte'));
    assert.ok(info.appCss?.includes('apps/www/src/app.css'));
    assert.equal(info.tailwindContentRoots[0], info.root);
    assert.ok(info.designDir.endsWith('design'));
    // no plugin install anywhere → moduleRoot null (bare-import fallback)
    assert.equal(info.moduleRoot, null);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('vehicle: files (non-dir) entries in ui/ are skipped; empty dirs dropped', () => {
  const host = tmpHost();
  try {
    write(join(host, 'registry.json'), '{"items":[]}');
    write(join(host, 'registry/files/ui/README.md'), 'not an item\n');
    mkdirSync(join(host, 'registry/files/ui/empty-item'), { recursive: true });
    const info = probeDesignHost(host);
    assert.equal(Object.keys(info.itemAliases).length, 0);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

/* ── consumer fixtures ────────────────────────────────────────────────── */

test('consumer: components.json ui alias resolves to src/lib/ui entries', () => {
  const host = tmpHost();
  try {
    write(join(host, 'components.json'), JSON.stringify({
      aliases: { ui: 'src/lib/ui', lib: 'src/lib' },
      tailwind: { css: 'src/app.css' },
    }));
    write(join(host, 'src/lib/ui/toc/index.ts'), "export { default } from './toc.svelte';\n");
    write(join(host, 'src/lib/ui/toc/toc.svelte'), '<nav>toc</nav>\n');
    write(join(host, 'src/app.css'), "@import 'tailwindcss';\n");

    const info = probeDesignHost(host);
    assert.equal(info.kind, 'consumer');
    assert.ok(info.itemAliases[`${ITEM_ALIAS_PREFIX}toc`]?.endsWith('index.ts'));
    assert.ok(info.appCss?.endsWith('src/app.css'));
    assert.equal(info.moduleRoot, null); // no plugin install fixture
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('consumer: $lib ui alias resolves through tsconfig paths', () => {
  const host = tmpHost();
  try {
    write(join(host, 'components.json'), JSON.stringify({ aliases: { ui: '$lib/ui' } }));
    write(join(host, 'tsconfig.json'), JSON.stringify({
      compilerOptions: { paths: { '$lib': ['src/lib'], '$lib/*': ['src/lib/*'] } },
    }));
    write(join(host, 'src/lib/ui/card/card.svelte'), '<section>card</section>\n');

    const info = probeDesignHost(host);
    assert.equal(info.kind, 'consumer');
    assert.ok(info.itemAliases[`${ITEM_ALIAS_PREFIX}card`]?.endsWith('card.svelte'));
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('consumer with missing ui dir degrades to vehicle posture (empty table)', () => {
  const host = tmpHost();
  try {
    write(join(host, 'components.json'), JSON.stringify({ aliases: { ui: 'src/lib/ui' } }));
    // src/lib/ui deliberately absent
    const info = probeDesignHost(host);
    assert.equal(info.kind, 'vehicle');
    assert.equal(Object.keys(info.itemAliases).length, 0);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

/* ── undetectable root ────────────────────────────────────────────────── */

test('undetectable root degrades to vehicle mode with an empty table', () => {
  const host = tmpHost();
  try {
    const info = probeDesignHost(host);
    assert.equal(info.kind, 'vehicle');
    assert.equal(Object.keys(info.itemAliases).length, 0);
    assert.equal(info.appCss, null);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

/* ── the real worktree (vehicle smoke) ────────────────────────────────── */

test('real worktree: vehicle aliases resolve and moduleRoot finds the plugin set', () => {
  const repoRoot = join(import.meta.dirname, '../../../..');
  const info = probeDesignHost(repoRoot);
  assert.equal(info.kind, 'vehicle');
  const items = Object.keys(info.itemAliases);
  assert.ok(items.length > 50, `expected the full registry table, got ${items.length}`);
  assert.ok(info.appCss?.endsWith('apps/www/src/app.css'));
  assert.ok(info.moduleRoot !== null, 'expected a moduleRoot resolving the plugin set');
});
