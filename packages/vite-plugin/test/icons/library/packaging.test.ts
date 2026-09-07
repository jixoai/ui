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

  // the per-entry purity law (icon-channel-api design §2, codex r1 M4):
  // the static module graph of the channel sub-entries reaches NO heavy
  // dependency — a consumer importing …/icons/md configures their icon
  // channel without ever loading the lucide/svgo/opentype machinery
  test('per-entry dist purity: channel/md/ph/rx reach NO lucide/svgo/opentype; lucide reaches NO svgo/opentype', async () => {
    const bannedAll = ['lucide', 'svgo', 'opentype.js'] as const;
    const bannedLucideEntry = ['svgo', 'opentype.js'] as const;

    const assertGraphPurity = async (
      entry: string,
      banned: readonly string[],
    ): Promise<void> => {
      const file = dist('icons', `${entry}.js`);
      expect(existsSync(file), `dist/icons/${entry}.js exists`).toBe(true);
      const graph = await walkStaticImports(file);
      for (const specifier of graph.bareSpecifiers) {
        // node builtins are always fine; nothing from the banned set
        expect(
          specifier.startsWith('node:'),
          `dist/icons/${entry}.js reaches bare specifier "${specifier}"`,
        ).toBe(true);
        for (const ban of banned) {
          expect(specifier, `${entry} → ${specifier}`).not.toContain(ban);
        }
      }
      for (const reached of graph.files) {
        const rel = reached.slice(packageRoot.length + 1);
        for (const ban of banned) {
          expect(
            new RegExp(`(^|/)${ban.replace('.', '\\.')}(\\.|/|$)`).test(rel) || rel.includes(`/${ban}/`),
            `dist/icons/${entry}.js graph reaches ${rel} (banned: ${ban})`,
          ).toBe(false);
        }
      }
    };

    for (const entry of ['channel', 'md', 'ph', 'rx']) {
      await assertGraphPurity(entry, bannedAll);
    }
    await assertGraphPurity('lucide', bannedLucideEntry);
  });

  test('each sub-entry exports its contract (defineIconChannel / factories / the instance)', () => {
    const channelCode = readFileSync(dist('icons', 'channel.js'), 'utf8');
    expect(channelCode).toContain('defineIconChannel');
    expect(channelCode).toContain('resolvePeerFile');
    for (const [entry, symbol] of [
      ['lucide', 'lucideChannel'],
      ['md', 'md'],
      ['ph', 'ph'],
      ['rx', 'rx'],
    ] as const) {
      expect(readFileSync(dist('icons', `${entry}.js`), 'utf8'), `dist/icons/${entry}.js`).toContain(
        symbol,
      );
    }
  });
});

describe('the pack smoke check (published shape)', () => {
  test('the package name is the Owner-confirmed @jixoai/ui-vite-plugin', () => {
    const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as {
      name?: string;
    };
    expect(manifest.name).toBe('@jixoai/ui-vite-plugin');
    const run = spawnSync('npm', ['pack', '--dry-run', '--ignore-scripts'], {
      cwd: packageRoot,
      encoding: 'utf8',
    });
    expect(run.status).toBe(0);
    expect(`${run.stdout}\n${run.stderr}`).toContain('@jixoai/ui-vite-plugin@');
  });

  test('npm pack --dry-run lists the bridge target + the type contracts + the channel sub-entries', () => {
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
    // the channel sub-entries (icon-channel-api A4): JS + d.ts each
    for (const entry of ['channel', 'lucide', 'md', 'ph', 'rx']) {
      expect(listed.has(`dist/icons/${entry}.js`), `dist/icons/${entry}.js`).toBe(true);
      expect(listed.has(`dist/icons/${entry}.d.ts`), `dist/icons/${entry}.d.ts`).toBe(true);
    }
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
