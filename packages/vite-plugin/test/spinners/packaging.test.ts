/**
 * packaging.test.ts — the spinners sub-entry's packaging gates (P3,
 * spin-ora-svg-lane design §5; the icons packaging.test.ts precedent):
 *
 *   1. per-entry dist purity: dist/spinners.js's static graph reaches
 *      NO svgo / lucide / vite (the face is small and pure — the
 *      reason the umbrella wires it DIRECTLY, no bridge)
 *   2. the umbrella wiring pin: dist/index.js carries EXACTLY ONE
 *      dynamic import (the icons bridge — the spinners wiring added
 *      none) while its STATIC graph DOES reach the spinners adapter
 *      (the direct-wiring proof)
 *   3. the pack shape: npm pack lists dist/spinners.js + its .d.ts,
 *      and package.json's exports map carries the ./spinners sub-entry
 *
 * beforeAll builds the package (`npm run build`) so `npm test` alone
 * stays sufficient — the gate asserts the PUBLISHED shape, and dist/
 * is gitignored by design.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, test } from 'vitest';
import { walkStaticImports, parseStaticSpecifiers } from '../icons/library/import-graph.js';

// NOTE: test/spinners/ is TWO levels under test/ (the icons battery's
// library tests sit three deep) — '../..' is the package root here
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dist = (...parts: string[]): string => join(packageRoot, 'dist', ...parts);

beforeAll(() => {
  // one build for the whole file (idempotent; ~13s)
  execFileSync('npm', ['run', 'build'], { cwd: packageRoot, stdio: 'pipe' });
}, 120_000);

/** strip line + block comments so string scans assert CODE, not prose */
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1');
}

describe('per-entry dist purity (design §5 — small and pure, no bridge needed)', () => {
  test('dist/spinners.js static graph reaches NO svgo/lucide/vite', async () => {
    const entry = dist('spinners.js');
    expect(existsSync(entry)).toBe(true);
    const graph = await walkStaticImports(entry);
    for (const specifier of graph.bareSpecifiers) {
      expect(
        specifier.startsWith('node:'),
        `dist/spinners.js reaches bare specifier "${specifier}"`,
      ).toBe(true);
    }
    expect(graph.bareSpecifiers).not.toContain('svgo');
    expect(graph.bareSpecifiers).not.toContain('lucide');
    expect(graph.bareSpecifiers).not.toContain('vite');
    for (const reached of graph.files) {
      const rel = reached.slice(packageRoot.length + 1);
      // the ONE sanctioned coupling: safety.ts re-exports the icons
      // RAW checker (design §5 R2) — dist/icons/safety.js + its types
      // island are self-contained and dependency-free
      const allowed =
        rel.startsWith('dist/spinners/') ||
        rel === 'dist/spinners.js' ||
        rel === 'dist/icons/safety.js' ||
        rel === 'dist/icons/types.js';
      expect(allowed, rel).toBe(true);
    }
  });
});

describe('the umbrella wiring pin (direct, not a bridge)', () => {
  test('dist/index.js carries EXACTLY ONE dynamic import — the icons bridge', () => {
    const code = stripComments(readFileSync(dist('index.js'), 'utf8'));
    const dynamicImports = [...code.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)].map(
      (match) => match[1]!,
    );
    expect(dynamicImports).toEqual(['./icons/vite-plugin.js']);
  });

  test('dist/index.js STATICALLY reaches the spinners adapter (the direct wiring)', async () => {
    const graph = await walkStaticImports(dist('index.js'));
    const rels = graph.files.map((file) => file.slice(packageRoot.length + 1));
    expect(rels).toContain('dist/spinners/vite-plugin.js');
    // and the banned-set purity still holds for the enlarged graph
    for (const rel of rels) {
      expect(
        {
          rel,
          offending:
            /icons\/vite-plugin/.test(rel) ||
            /providers\//.test(rel) ||
            /\blucide\b/.test(rel) ||
            /\bsvgo\b/.test(rel),
        },
        rel,
      ).toEqual({ rel, offending: false });
    }
    for (const spec of graph.bareSpecifiers) {
      expect(spec.startsWith('node:'), spec).toBe(true);
    }
  });

  test('a string scan agrees: no svgo/lucide bytes inside dist/index.js code', () => {
    const code = stripComments(readFileSync(dist('index.js'), 'utf8'));
    expect(code).not.toContain('svgo');
    expect(code).not.toContain('lucide');
    expect(code).not.toContain('preset-default');
  });

  test('the spinners adapter itself imports vite ONLY as types (statics are node + local)', () => {
    const code = readFileSync(dist('spinners', 'vite-plugin.js'), 'utf8');
    const statics = parseStaticSpecifiers(code);
    for (const spec of statics) {
      expect(spec.startsWith('node:') || spec.startsWith('./') || spec.startsWith('../'), spec).toBe(true);
    }
  });
});

describe('the pack smoke check (published shape)', () => {
  test('package.json exports map carries the ./spinners sub-entry', () => {
    const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as {
      exports?: Record<string, { types?: string; import?: string }>;
      description?: string;
    };
    expect(manifest.exports?.['./spinners']).toEqual({
      types: './dist/spinners.d.ts',
      import: './dist/spinners.js',
    });
    // the description sentence names the spinners feature
    expect(manifest.description).toMatch(/svg-spinner set generator/);
    expect(manifest.description).toMatch(/\.\/spinners subpath/);
  });

  test('npm pack --dry-run lists the spinners entry (js + d.ts)', () => {
    // npm writes the tarball listing to STDERR (stdout is just the name)
    const run = spawnSync('npm', ['pack', '--dry-run', '--ignore-scripts'], {
      cwd: packageRoot,
      encoding: 'utf8',
    });
    expect(run.status).toBe(0);
    const output = `${run.stdout}\n${run.stderr}`;
    const listed = new Set(
      [...output.matchAll(/npm notice\s+[\d.]+\s*[kmg]?B\s+(\S+)/g)].map((match) => match[1]!),
    );
    expect(listed.size).toBeGreaterThan(10); // the listing actually parsed
    expect(listed.has('dist/spinners.js')).toBe(true);
    expect(listed.has('dist/spinners.d.ts')).toBe(true);
    expect(listed.has('dist/spinners/vite-plugin.js')).toBe(true);
  });
});
