/**
 * import-graph.ts — test helper: walk a module's STATIC import graph
 * (real imports, not a string scan). Shared by the pure-core no-vite
 * pin (generate.test.ts / script adapter) and the dist graph-purity
 * gate (packaging.test.ts).
 *
 * STATIC means: `import … from 'x'`, `import 'x'`, `export … from 'x'`
 * and `require('x')`. DYNAMIC `import('x')` is deliberately excluded —
 * it is a runtime reference, not a graph edge (the whole point of the
 * umbrella bridge). `.js` specifiers map back to `.ts` siblings (the
 * NodeNext convention this package's sources use; dist files keep
 * their `.js`).
 */

import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';

export interface WalkedGraph {
  /** every local module file reached through STATIC imports */
  readonly files: readonly string[];
  /** every bare specifier reached (node:, npm packages) */
  readonly bareSpecifiers: readonly string[];
}

const STATIC_SPECIFIER_PATTERNS: readonly RegExp[] = [
  /^import\s+[^'";]*?\sfrom\s*['"]([^'"]+)['"]/gm,
  /^import\s*['"]([^'"]+)['"]/gm,
  /^export\s+[^'";]*?\sfrom\s*['"]([^'"]+)['"]/gm,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

/** extract the STATIC import/export/require specifiers of one module */
export function parseStaticSpecifiers(code: string): readonly string[] {
  const specifiers = new Set<string>();
  for (const pattern of STATIC_SPECIFIER_PATTERNS) {
    for (const match of code.matchAll(pattern)) specifiers.add(match[1]!);
  }
  return [...specifiers];
}

/** resolve a relative specifier against its importing file (ts/js twin lookup) */
async function resolveSpecifier(fromFile: string, specifier: string): Promise<string | null> {
  const base = resolve(dirname(fromFile), specifier);
  const extension = extname(specifier);
  const candidates =
    extension === '.js' || extension === '.ts'
      ? [base, base.replace(/\.js$/, '.ts')]
      : [base, `${base}.ts`, `${base}.js`, `${base}/index.ts`, `${base}/index.js`];
  for (const candidate of candidates) {
    try {
      await readFile(candidate);
      return candidate;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
}

/** BFS the STATIC import graph from one module file */
export async function walkStaticImports(startFile: string): Promise<WalkedGraph> {
  const seen = new Set<string>();
  const files: string[] = [];
  const bare = new Set<string>();

  const queue = [startFile];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (seen.has(current)) continue;
    seen.add(current);
    files.push(current);
    const code = await readFile(current, 'utf8');
    for (const specifier of parseStaticSpecifiers(code)) {
      if (!specifier.startsWith('.')) {
        bare.add(specifier);
        continue;
      }
      const resolved = await resolveSpecifier(current, specifier);
      if (resolved === null) {
        bare.add(specifier); // unresolved relative — surface it for the assertions
        continue;
      }
      if (!seen.has(resolved)) queue.push(resolved);
    }
  }
  return { files, bareSpecifiers: [...bare] };
}
