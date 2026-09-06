/**
 * packaging.test.ts — the svgo packaging chain's gates (A2, design §9):
 *
 *   1. the dist graph-purity gate: parse dist/index.js's STATIC import
 *      graph TRANSITIVELY (real imports, not a string scan) — no icons
 *      implementation (icons/vite-plugin), provider, lucide or svgo
 *      module appears; the bridge's DYNAMIC import is the only icons
 *      reference and its target module file exists in dist.
 *   2. the pack smoke check: dist carries the icons sub-entry module
 *      files the bridge loads; svgo is the ONLY regular dependency;
 *      the self-contained lockfile pins it.
 *
 * beforeAll builds the package (`npm run build`) so `npm test` alone
 * stays sufficient — the gate asserts the PUBLISHED shape, and dist/ is
 * gitignored by design.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, test } from 'vitest';
import { walkStaticImports, parseStaticSpecifiers } from './import-graph.js';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const dist = (...parts: string[]): string => join(packageRoot, 'dist', ...parts);

beforeAll(() => {
  // one build for the whole file (idempotent; ~2s)
  execFileSync('npm', ['run', 'build'], { cwd: packageRoot, stdio: 'pipe' });
}, 120_000);

/** strip line + block comments so string scans assert CODE, not prose */
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1');
}

describe('the dist graph-purity gate (design §9)', () => {
  test('dist/index.js static graph is free of icons-impl/provider/lucide/svgo', async () => {
    const index = dist('index.js');
    expect(existsSync(index)).toBe(true);
    const graph = await walkStaticImports(index);

    // every LOCAL module reached through static imports
    for (const file of graph.files) {
      const rel = file.slice(packageRoot.length + 1);
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

    // bare specifiers: node builtins + NOTHING from the banned set
    for (const spec of graph.bareSpecifiers) {
      expect(spec.startsWith('node:')).toBe(true);
    }
    expect(graph.bareSpecifiers).not.toContain('svgo');
    expect(graph.bareSpecifiers).not.toContain('lucide');
    expect(graph.bareSpecifiers).not.toContain('vite'); // vite stays a peer, dynamically tolerated elsewhere
  });

  test("the bridge's dynamic import targets a module that EXISTS in dist", async () => {
    const code = stripComments(readFileSync(dist('index.js'), 'utf8'));
    const dynamicImports = [...code.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)].map(
      (match) => match[1]!,
    );
    // the ONLY dynamic import in the umbrella is the icons bridge load
    expect(dynamicImports).toEqual(['./icons/vite-plugin.js']);
    // and the published package actually carries it (the pack shape)
    expect(existsSync(dist('icons', 'vite-plugin.js'))).toBe(true);
  });

  test('a string scan agrees: no provider/svgo bytes inside dist/index.js code', () => {
    const code = stripComments(readFileSync(dist('index.js'), 'utf8'));
    expect(code).not.toContain('svgo');
    expect(code).not.toContain('lucide');
    expect(code).not.toContain('preset-default');
  });

  test('the icons sub-entry DOES reference svgo (external, dynamic-only)', async () => {
    const iconsPlugin = dist('icons', 'vite-plugin.js');
    const optimize = dist('icons', 'library', 'optimize.js');
    expect(existsSync(iconsPlugin)).toBe(true);
    expect(existsSync(optimize)).toBe(true);

    const optimizeCode = readFileSync(optimize, 'utf8');
    // svgo is loaded ONLY through the dynamic import, kept external
    expect(/import\(\s*['"]svgo['"]\s*\)/.test(optimizeCode)).toBe(true);
    const statics = parseStaticSpecifiers(optimizeCode);
    expect(statics).not.toContain('svgo');

    const iconsGraph = await walkStaticImports(iconsPlugin);
    expect(iconsGraph.bareSpecifiers).not.toContain('svgo');
  });
});

describe('the pack smoke check (published shape)', () => {
  test('npm pack --dry-run lists the bridge target + the type contracts', () => {
    // npm writes the tarball listing to STDERR (stdout is just the name)
    const run = spawnSync('npm', ['pack', '--dry-run', '--ignore-scripts'], {
      cwd: packageRoot,
      encoding: 'utf8',
    });
    expect(run.status).toBe(0);
    const output = `${run.stdout}\n${run.stderr}`;
    // tarball listing lines: "npm notice <size>  <path>"
    const listed = new Set(
      [...output.matchAll(/npm notice\s+[\d.]+\s*[kmg]?B\s+(\S+)/g)].map((match) => match[1]!),
    );
    expect(listed.size).toBeGreaterThan(10); // the listing actually parsed
    expect(listed.has('dist/index.js')).toBe(true);
    expect(listed.has('dist/icons.js')).toBe(true); // the ./icons sub-entry
    expect(listed.has('dist/icons/vite-plugin.js')).toBe(true); // the bridge's load target
    expect(listed.has('dist/icons/library/generate.js')).toBe(true);
    expect(listed.has('dist/index.d.ts')).toBe(true);
    expect(listed.has('dist/client.d.ts')).toBe(true);
  });

  test('svgo is the ONLY regular dependency, pinned in the self-contained lockfile', () => {
    const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    expect(Object.keys(manifest.dependencies ?? {})).toEqual(['svgo']);
    expect(manifest.dependencies?.svgo).toMatch(/\^4\./);

    const lock = JSON.parse(readFileSync(join(packageRoot, 'package-lock.json'), 'utf8')) as {
      packages?: { ''?: { dependencies?: Record<string, string> } };
    };
    const root = lock.packages?.[''];
    expect(root?.dependencies?.svgo).toMatch(/\^4\./);
    expect(Object.keys(root?.dependencies ?? {})).toEqual(['svgo']);
  });
});
