/**
 * Dialog install-closure suite (test/dialog-closure.spec.ts, 2026-09-13
 * — issue #3: "dialog item does not vendor its $lib/entity.svelte
 * closure: add dialog leaves builds broken").
 *
 * The registry's ONE product promise is that `jixoai-ui add dialog`
 * resolves (verify-deps.mjs's words). dialog.svelte imports TWO $lib
 * files that live in OTHER items' ownership — $lib/entity.svelte
 * (owned by the entity item) and $lib/surface-motion (owned by
 * popover, the file's vendor) — and a consumer install only receives
 * files carried by the item's dependency closure, so an undeclared
 * edge leaves `vite build`/`tsc` failing on the unresolved import
 * until the human vendors the files by hand.
 *
 * Two locks, matching the two halves of the fix:
 *  1. GRAPH — the dialog item declares @jixoai/entity and
 *     @jixoai/popover in registryDependencies, and EVERY $lib import
 *     of registry/files/ui/dialog/dialog.svelte resolves into a file
 *     owned by that declared closure (the verify-deps ownership model,
 *     dialog-scoped: files[].target @lib/* and @ui/* map to consumer
 *     paths under the $lib tree). The debt ledger keeps no dialog row
 *     — healed edges must be re-recorded, and this keeps them healed.
 *  2. RENDER — the same-source dialog mounts through the entity
 *     closure: provideEntity() executes and stamps the panel root
 *     data-jx-entity="1" (the entity law's DOM hook — the number only
 *     exists if $lib/entity.svelte resolved and ran).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import type { Snippet } from 'svelte';

import Dialog from '../src/lib/ui/dialog/dialog.svelte';

const root = resolve(process.cwd(), '../..');
const registry = JSON.parse(readFileSync(resolve(root, 'registry.json'), 'utf8')) as {
  items: { name: string; registryDependencies?: string[]; files: { path: string; target: string }[] }[];
};
const items = Array.isArray(registry) ? registry : registry.items;
const byName = new Map(items.map((it) => [it.name, it]));

/** the consumer-path files an item owns: @lib/* → <lib>/…, @ui/* → <lib>/ui/…
 *  (verify-deps's targetToFs with the www alias layout, $lib = src/lib) */
function ownedFsPaths(item: { files: { target: string }[] }): string[] {
  return item.files
    .map((f) => f.target)
    .filter((t) => t.startsWith('@lib/') || t.startsWith('@ui/'))
    .map((t) => (t.startsWith('@lib/') ? t.slice(5) : `ui/${t.slice(4)}`));
}

/** dialog's dependency closure (registryDependencies, transitively) */
function closureOf(name: string): Set<string> {
  const seen = new Set<string>();
  const q = [name];
  while (q.length) {
    const n = q.shift()!;
    if (seen.has(n)) continue;
    seen.add(n);
    const it = byName.get(n);
    if (!it) throw new Error(`unknown registry item in closure: ${n}`);
    for (const dep of it.registryDependencies ?? []) q.push(dep.replace(/^@jixoai\//, ''));
  }
  return seen;
}

const SUFFIXES = ['', '.ts', '.js', '.svelte', '.css', '.svelte.ts', '/index.ts', '/index.js'];

/** every $lib import specifier of a registry source file (statement-
 *  anchored, verify-deps's extraction shape) */
function libImports(source: string): string[] {
  const specs: string[] = [];
  const patterns = [
    /(?:^|\n)\s*import\s+(?:type\s+)?[\w*{},\s$]*?from\s+["']([^"']+)["']/g,
    /(?:^|\n)\s*import\s+["']([^"']+)["']/g,
  ];
  for (const re of patterns) for (const m of source.matchAll(re)) specs.push(m[1]);
  return specs.filter((s) => s.startsWith('$lib/'));
}

// ---------------------------------------------------------------------------
// 1 · the graph — the declared closure covers every $lib import
// ---------------------------------------------------------------------------
describe('dialog install closure (#3) — the registry graph', () => {
  const dialog = byName.get('dialog')!;

  it('declares the entity and popover edges (the two $lib closure owners)', () => {
    expect(dialog.registryDependencies).toContain('@jixoai/entity');
    expect(dialog.registryDependencies).toContain('@jixoai/popover');
  });

  it('the edges deliver the actual files: entity owns entity.svelte.ts + entity.css; popover owns surface-motion.ts', () => {
    expect(ownedFsPaths(byName.get('entity')!)).toEqual(
      expect.arrayContaining(['entity.svelte.ts', 'entity.css']),
    );
    expect(ownedFsPaths(byName.get('popover')!)).toContain('surface-motion.ts');
  });

  it('every $lib import of the registry dialog.svelte resolves inside the declared closure', () => {
    const closure = closureOf('dialog');
    const owned = new Map<string, string>(); // fs path → owning item
    for (const n of closure) {
      for (const p of ownedFsPaths(byName.get(n)!)) owned.set(p, n);
    }
    const source = readFileSync(resolve(root, 'registry/files/ui/dialog/dialog.svelte'), 'utf8');
    const specs = libImports(source);
    expect(specs.length).toBeGreaterThan(0);
    for (const spec of specs) {
      const bare = spec.slice('$lib/'.length);
      const hit = SUFFIXES.map((sfx) => bare + sfx).find((candidate) => owned.has(candidate));
      expect(
        hit,
        `${spec} resolves to no file owned by dialog's declared closure`,
      ).toBeDefined();
    }
  });

  it('the verify-deps debt ledger keeps no dialog row (healed edges stay healed)', () => {
    const baseline = JSON.parse(
      readFileSync(resolve(root, 'scripts/verify-deps-baseline.json'), 'utf8'),
    ) as { undeclared: string[] };
    expect(baseline.undeclared.filter((row) => row.startsWith('dialog ->'))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2 · the render — the same-source dialog mounts through the closure
// ---------------------------------------------------------------------------
describe('dialog install closure (#3) — the entity closure executes', () => {
  const children = (() => {}) as unknown as Snippet;

  it('mounts with data-jx-entity="1": $lib/entity.svelte resolved and provideEntity ran', () => {
    const { container } = render(Dialog, { props: { title: 'closure probe', children } });
    const panel = container.querySelector('dialog[data-jx-entity="1"]');
    expect(panel).toBeTruthy();
  });
});
