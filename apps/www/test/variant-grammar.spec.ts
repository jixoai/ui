// variant-grammar source guards (r2 blockers #5/#6 class): the
// no-space arbitrary-utility pair is ONE class token — Tailwind never
// emits the second property, so the fill/ink pair silently half-applies.
// This guard fails the suite the moment the pattern reappears.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(process.cwd(), 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.svelte$/.test(entry)) out.push(full);
  }
  return out;
}

describe('variant-grammar source guards', () => {
  it('no glued arbitrary-property utilities (][--jx- adjacency = one dead token)', () => {
    const offenders = walk(root).filter((f) => {
      const src = readFileSync(f, 'utf8');
      return /]\[--jx-[a-z-]+:/.test(src);
    });
    expect(offenders.map((f) => f.replace(root, '')), 'split the pair with a space').toEqual([]);
  });

  it('docs source drawers name REAL registry paths', () => {
    // r2 blocker #6: TreeFile.name/sourceUrl pointed at
    // registry/files/ui/<name>.svelte — the real files nest one level
    // deeper. Every declared source path must exist.
    const pages = [
      'routes/docs/components/badge.html',
      'routes/docs/components/alert.html',
      'routes/docs/components/press-button.html',
      'routes/docs/components/chip.html',
      'routes/docs/components/inline-code.html',
      'routes/docs/components/toast.html',
    ];
    const repoRoot = resolve(process.cwd(), '../..');
    for (const page of pages) {
      const file = join(root, page, '+page.svelte');
      if (!existsSync(file)) continue;
      const src = readFileSync(file, 'utf8');
      const paths = [...src.matchAll(/registry\/files\/[^\s'"`)]+/g)].map((m) => m[0].replace(/[,;)]$/, ''));
      for (const p of paths) {
        expect(existsSync(join(repoRoot, p)), `${page}: ${p} does not exist`).toBe(true);
      }
    }
  });
});
