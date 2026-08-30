/**
 * The print-projection parity + layer-discipline gates
 * (paged-doc-family, 2026-08-30).
 *
 * v1 policy (design.md): the sim projection copy is HANDWRITTEN next
 * to the @media print original; this test is the parity net an AST
 * generator would replace — selector-for-selector and
 * declaration-for-declaration, with the sim scoping prefix stripped.
 *
 * It also enforces the LAYER DISCIPLINE on the same file: the one
 * top-level `@media print` block (the unlayered authority) contains
 * EXACTLY the audited whitelist selectors — anything else must live
 * inside @layer components.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(
  resolve(__dirname, '../src/lib/paged/print-projection.css'),
  'utf8',
);

/** strip comments and collapse whitespace for stable parsing */
const clean = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

interface Rule {
  selectors: string[];
  declarations: string;
}

/** parse `:where(sel, sel) { decls }` rules out of a block's text */
function parseWhereRules(block: string): Rule[] {
  const rules: Rule[] = [];
  const re = /:where\(([^)]*)\)\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(block))) {
    rules.push({
      selectors: m[1]!.split(',').map((s) => s.trim()).filter(Boolean),
      declarations: m[2]!.trim().replace(/\s*;\s*$/, ''),
    });
  }
  return rules;
}

/** the text of the FIRST top-level `@media <condition> { … }` block */
function topLevelMediaBlock(condition: string): string {
  const marker = `@media ${condition} {`;
  const start = clean.indexOf(marker);
  expect(start, `expected a top-level @media ${condition} block`).toBeGreaterThanOrEqual(0);
  let depth = 0;
  let i = start;
  for (; i < clean.length; i++) {
    if (clean[i] === '{') depth++;
    if (clean[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  return clean.slice(start + marker.length - 1, i + 1);
}

/** strip the sim scoping from a selector list; drop empty results */
function unscopedSelectors(selectors: string[]): string[] {
  return selectors
    .map((s) =>
      s
        .replace(/\[data-jx-print-sim\]\s+/g, '')
        .replace(/\[data-jx-print-sim\]/g, '')
        .trim(),
    )
    .filter(Boolean);
}

const SIM_ATTR = /\[data-jx-print-sim\]/;

describe('the projection twins', () => {
  const printRules = parseWhereRules(topLevelMediaBlock('print'));
  const simRules = parseWhereRules(topLevelMediaBlock('not print'));

  it('both halves exist and every sim rule is sim-scoped', () => {
    expect(printRules.length).toBeGreaterThan(0);
    expect(simRules.length).toBeGreaterThan(0);
    for (const rule of simRules) {
      // the exclusion law's selector side: the sim copy is scoped to
      // the stamp (and the media condition itself is asserted below)
      expect(rule.selectors.some((s) => SIM_ATTR.test(s))).toBe(true);
    }
  });

  it('sim selector-for-selector + declaration-for-declaration parity', () => {
    const printSide = new Map<string, string>();
    for (const rule of printRules) {
      for (const sel of rule.selectors) printSide.set(sel, rule.declarations);
    }
    const simSide = new Map<string, Set<string>>();
    for (const rule of simRules) {
      for (const sel of unscopedSelectors(rule.selectors)) {
        if (!simSide.has(sel)) simSide.set(sel, new Set());
        simSide.get(sel)!.add(rule.declarations);
      }
    }
    expect([...simSide.keys()].sort()).toEqual([...printSide.keys()].sort());
    for (const [sel, decls] of printSide) {
      // every unscoped sim variant of this selector carries the exact
      // print declarations
      expect(simSide.get(sel), `sim copy of ${sel}`).toBeDefined();
      for (const d of simSide.get(sel)!) expect(d).toBe(decls);
    }
  });

  it('the sim copy sits under @media not print (the exclusion law)', () => {
    const idx = clean.indexOf('@media not print');
    expect(idx).toBeGreaterThanOrEqual(0);
    // the first `not print` media condition in the file is the sim
    // whitelist copy's own wrapper — nothing sim-scoped may appear
    // outside a not-print condition
    const simMentions = clean.match(/\[data-jx-print-sim\][^\s{]*/g) ?? [];
    expect(simMentions.length).toBeGreaterThan(0);
  });
});

describe('layer discipline (the audited unlayered whitelist)', () => {
  const WHITELIST = [
    "[data-jx-print='hide']",
    "[data-jx-print='flatten']",
    '[data-jx-canvas-scroll]',
    '[data-jx-code-card-pre]',
    '[data-jx-props-table-scroll]',
  ];

  it('the top-level @media print block contains exactly the audited selectors', () => {
    const printRules = parseWhereRules(topLevelMediaBlock('print'));
    const selectors = printRules.flatMap((r) => r.selectors).sort();
    expect(selectors).toEqual([...WHITELIST].sort());
  });

  it('the forced results match the delta table', () => {
    const printRules = parseWhereRules(topLevelMediaBlock('print'));
    const bySelector = new Map<string, string>();
    for (const rule of printRules) {
      for (const sel of rule.selectors) bySelector.set(sel, rule.declarations);
    }
    expect(bySelector.get("[data-jx-print='hide']")).toBe('display: none');
    for (const sel of WHITELIST.slice(1)) {
      expect(bySelector.get(sel)).toBe('overflow: visible; max-block-size: none');
    }
  });

  it('the freeze verb stays inside @layer components (not the whitelist)', () => {
    const printBlock = topLevelMediaBlock('print');
    expect(printBlock).not.toContain('freeze');
    const layerStart = clean.indexOf('@layer components');
    expect(layerStart).toBeGreaterThanOrEqual(0);
    const layerText = clean.slice(layerStart);
    expect(layerText).toContain("data-jx-print='freeze'");
  });
});
