/**
 * Hover-stability law (test/hover-stability.spec.ts, 2026-08-23).
 *
 * The press law (2026-08-23): interactive bodies NEVER move on hover —
 * the shadow alone grows. This static guard sweeps every component
 * source for scoped :hover rules that still translate/transform the
 * body — the exact residue the tooltip page exposed (code-card's copy
 * control had kept the pre-law hover lift, alongside popover/dropdown
 * triggers, alert-dialog buttons, pagination pages, and file-input).
 * Utility-class hover moves are covered by the same rule textually.
 *
 * Allowed escapes (drag magnetism is a DRAG state, not hover):
 * none currently — extend the allowlist ONLY with an Owner ruling.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..', 'src', 'lib');
const ALLOW: string[] = [];

function collect(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...collect(p));
    else if (name.endsWith('.svelte')) out.push(p);
  }
  return out;
}

describe('hover stability (press law)', () => {
  // whole-tree regex scan: the generated css-laws slots grew the
  // sheets — 5s chokes under parallel vitest load (it passed at
  // 4.2s before the cutover, 1.8s in isolation)
  it('no scoped :hover rule moves its body (transform/translate)', { timeout: 30_000 }, () => {
    const offenders: string[] = [];
    for (const file of collect(ROOT)) {
      const src = readFileSync(file, 'utf8');
      const rel = file.slice(ROOT.length + 1);
      const rule = /([^{}]+):hover[^{]*\{([^}]*)\}/g;
      for (const m of src.matchAll(rule)) {
        if (!/transform|translate/.test(m[2])) continue;
        const line = src.slice(0, m.index ?? 0).split('\n').length;
        if (ALLOW.some((a) => rel.startsWith(a))) continue;
        offenders.push(`${rel}:${line}`);
      }
    }
    expect(offenders, `hover movers (press law violation):\n${offenders.join('\n')}`).toEqual([]);
  });

  it('no Tailwind hover-translate utility remains in component sources', () => {
    const offenders: string[] = [];
    for (const file of collect(ROOT)) {
      const src = readFileSync(file, 'utf8');
      if (/hover:-?translate-/.test(src)) offenders.push(file.slice(ROOT.length + 1));
    }
    // overview-card (a CARD, not a button) is the one deliberate holder
    expect(offenders.filter((f) => f !== 'overview-card.svelte')).toEqual([]);
  });
});
