/**
 * packaging.test.ts — the stylex feature's packaging gates (the
 * icons/spinners packaging.test.ts precedent):
 *
 *   1. the bridge law: dist/index.js carries EXACTLY TWO dynamic
 *      imports now — the icons bridge and the stylex bridge — while
 *      its STATIC graph still reaches no engine/provider code and no
 *      bare specifier beyond node: builtins.
 *   2. the engine lives where the bridge points: dist/stylex/
 *      vite-plugin.js exists and statically imports the EXTERNAL
 *      '@stylexjs/unplugin/vite' (kept external by tsdown config —
 *      the bare specifier never becomes a relative node_modules path,
 *      and the engine never enters a consumer's dependency tree).
 *   3. the F9 statement ships: dist/stylex/layer-law.js carries the
 *      canonical bytes verbatim.
 *
 * beforeAll rebuilds (`npm run build`) so `npm test` alone stays
 * sufficient — the gate asserts the PUBLISHED shape (dist/ is
 * gitignored by design).
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, test } from 'vitest';
import { walkStaticImports } from '../icons/library/import-graph.js';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dist = (...parts: string[]): string => join(packageRoot, 'dist', ...parts);

beforeAll(() => {
  execFileSync('npm', ['run', 'build'], { cwd: packageRoot, stdio: 'pipe' });
}, 120_000);

/** strip line + block comments so string scans assert CODE, not prose */
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/[^\n]*/g, '$1');
}

describe('the stylex bridge law (phase 0 P0.2)', () => {
  test('dist/index.js carries EXACTLY TWO dynamic imports — icons first, then stylex', () => {
    const code = stripComments(readFileSync(dist('index.js'), 'utf8'));
    const dynamicImports = [...code.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)].map(
      (match) => match[1]!,
    );
    expect(dynamicImports).toEqual(['./icons/vite-plugin.js', './stylex/vite-plugin.js']);
  });

  test("the stylex bridge's dynamic import target EXISTS in dist", () => {
    expect(existsSync(dist('stylex', 'vite-plugin.js'))).toBe(true);
  });

  test('dist/index.js static graph stays engine-free (node: bare specifiers only, no @stylexjs)', async () => {
    const graph = await walkStaticImports(dist('index.js'));
    for (const specifier of graph.bareSpecifiers) {
      expect(specifier.startsWith('node:'), specifier).toBe(true);
    }
    for (const reached of graph.files) {
      const rel = reached.slice(packageRoot.length + 1);
      expect(rel.startsWith('dist/'), rel).toBe(true);
      expect(rel.includes('stylex/vite-plugin'), `${rel} — the engine must stay behind the bridge`).toBe(false);
    }
  });

  test('a string scan agrees: no engine IMPORT PATHS inside dist/index.js code', () => {
    const code = stripComments(readFileSync(dist('index.js'), 'utf8'));
    // the named-fix error text legitimately NAMES the engine package;
    // the gate is the import SHAPES — no static, no dynamic, no
    // require path to any @stylexjs module from the umbrella entry
    expect(code).not.toMatch(/from\s+['"]@stylexjs/);
    expect(code).not.toMatch(/import\(\s*['"]@stylexjs/);
    expect(code).not.toMatch(/require\(\s*['"]@stylexjs/);
  });

  test('dist/stylex/vite-plugin.js statically imports the EXTERNAL engine (bare specifier kept)', () => {
    const code = readFileSync(dist('stylex', 'vite-plugin.js'), 'utf8');
    expect(code).toContain(`from "@stylexjs/unplugin/vite"`);
    // and never a relative node_modules path (the tsdown external pin)
    expect(code).not.toContain('node_modules/@stylexjs');
  });

  test('the F9 canonical layer law ships in dist/stylex/layer-law.js (dynamic tiers, components nesting)', () => {
    const code = readFileSync(dist('stylex', 'layer-law.js'), 'utf8');
    // the nesting prefix + the standing frame (quote-agnostic — tsdown
    // emits double quotes) + the parser's exact statement shape
    expect(code).toMatch(/["']components\.stylex["']/);
    expect(code).toMatch(/["']properties["'],\s*["']theme["'],\s*["']base["'],\s*["']components["']/);
    expect(code).toMatch(/["']utilities["']/);
    expect(code).toContain('@layer properties, theme, base, components,');
    expect(code).toContain('utilities;\\n');
  });
});
