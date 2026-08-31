/**
 * The stylesheet separation + retirement gates (print-pipeline,
 * 2026-08-30; css-architecture delta).
 *
 *   - AST GATE on kernel-print.css: ZERO `@media not print` wrappers,
 *     ZERO `[data-jx-print-sim]` selectors (a drifted sim selector
 *     fails the gate naming the offending rule), and the audited
 *     whitelist table's five selectors really present with their
 *     forced declarations
 *   - SOURCE SEPARATION: sim-shell.css is the document-side half
 *     (it MUST carry the not-print wrapper); the kernel stylesheet
 *     reaches the kernel only as ?raw text through the pipeline (the
 *     preview-inputs runtime spy lives in print-pipeline.spec.ts)
 *   - ZERO-REFERENCE GATE (post-retirement): no import/usage of the
 *     deleted lib/paged family anywhere in apps/www sources or tests
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const lib = (p: string): string => resolve(__dirname, `../src/lib/${p}`);
const kernelCss = readFileSync(lib('print/kernel-print.css'), 'utf8');
const simShellCss = readFileSync(lib('print/sim-shell.css'), 'utf8');

/** strip comments for stable scanning */
const kernelClean = kernelCss.replace(/\/\*[\s\S]*?\*\//g, '');

// =========================================================================
// the AST gate (drift fails, naming the offender)
// =========================================================================
describe('kernel-print.css — the AST gate', () => {
  it('contains ZERO `@media not print` wrappers', () => {
    expect(kernelClean).not.toMatch(/@media\s+not\s+print/);
  });

  it('contains ZERO [data-jx-print-sim] selectors — a drift fails naming the rule', () => {
    const offenders = kernelClean
      .split('\n')
      .filter((line) => /\[data-jx-print-sim/.test(line));
    expect(offenders, `offending rules: ${offenders.join(' | ')}`).toEqual([]);
  });

  it('carries the audited whitelist table verbatim (selector + forced result)', () => {
    const table: [string, string[]][] = [
      ["[data-jx-print='hide']", ['display: none']],
      ["[data-jx-print='flatten']", ['overflow: visible', 'max-block-size: none']],
      ['[data-jx-canvas-scroll]', ['overflow: visible', 'max-block-size: none']],
      ['[data-jx-code-card-pre]', ['overflow: visible', 'max-block-size: none']],
      ['[data-jx-props-table-scroll]', ['overflow: visible', 'max-block-size: none']],
    ];
    for (const [selector, decls] of table) {
      const escaped = selector.replace(/[[\]'"]/g, '\\$&');
      const ruleRe = new RegExp(`:where\\(${escaped}\\)\\s*\\{([^}]*)\\}`);
      const match = ruleRe.exec(kernelClean);
      expect(match, `missing the whitelisted rule for ${selector}`).not.toBeNull();
      for (const decl of decls) {
        expect(match![1], `${selector} must force ${decl}`).toContain(decl);
      }
    }
  });

  it('carries the reveal flatten (scroll-driven entrances park at opacity:0 — paper has no scrollport)', () => {
    // walkthrough fix 2026-08-31: without this rule every below-fold
    // [data-reveal] section prints as its `from` frame — blank pages
    const m = /\[data-reveal\],\s*\[data-reveal='rule'\]\s*\{([^}]*)\}/.exec(kernelClean);
    expect(m, 'missing the reveal flatten rule').not.toBeNull();
    for (const decl of [
      'animation: none !important',
      'transition: none !important',
      'opacity: 1 !important',
      'transform: none !important',
    ]) {
      expect(m![1], `the reveal flatten must force ${decl}`).toContain(decl);
    }
  });

  it('carries the attr-numbered gutter (ZERO counter rules — pagedjs Counters hijacks them)', () => {
    // walkthrough fix 2026-08-31: pagedjs strips author counter-reset/
    // increment and re-derives negative per-element increments — with
    // multiple pres the gutter counted from −N; the number rides
    // data-line + attr() instead, immune by construction
    expect(kernelClean).toContain("content: attr(data-line)");
    expect(kernelClean).not.toMatch(/counter-reset|counter-increment/);
  });

  it('carries the borderless paper projection + the split dash + the restyled ToC (walkthrough r2)', () => {
    // the DEFAULT print variant: block border → separator, paper is
    // the frame; the boxed opt-out keeps a frame; the code card's
    // embedded frame drops
    const card = /:where\(section\.bg-card\)\s*\{([^}]*)\}/.exec(kernelClean);
    expect(card, 'missing the section-card borderless rule').not.toBeNull();
    expect(card![1]).toContain('border: none');
    expect(card![1]).toContain('border-block-end: 1px solid');
    const boxed = /:where\(section\.bg-card\[data-jx-print='boxed'\]\)\s*\{([^}]*)\}/.exec(kernelClean);
    expect(boxed, 'missing the boxed opt-out').not.toBeNull();
    expect(boxed![1]).toContain('border: 1px solid');
    const codeCard = /:where\(\.jx-code-card\)\s*\{([^}]*)\}/.exec(kernelClean);
    expect(codeCard, 'missing the code-card frame drop').not.toBeNull();
    expect(codeCard![1]).toContain('border: none');
    // the continuation dash on pagedjs split markers — INNERMOST only
    // (the pipeline's data-jx-split-outer quiets the rebuilt ancestor
    // chain: one cut, one dash), the outer layers' own borders at the
    // cut are suppressed (a section's hairline 1px from the dash is
    // the r4 doubled cut), and keep-with-next guards the real strip
    // shapes (a code head is a FIGCAPTION; a section header is the
    // card's first div; the code foot guards its break-BEFORE)
    expect(kernelClean).toMatch(/\[data-split-to\]:not\(\[data-jx-split-outer\]\)\s*\{[^}]*border-block-end: 1px dashed/);
    expect(kernelClean).toMatch(/\[data-split-from\]:not\(\[data-jx-split-outer\]\)\s*\{[^}]*border-block-start: 1px dashed/);
    expect(kernelClean).toMatch(/\[data-split-to\]\[data-jx-split-outer\]\s*\{[^}]*border-block-end: none/);
    expect(kernelClean).toMatch(/\[data-split-from\]\[data-jx-split-outer\]\s*\{[^}]*border-block-start: none/);
    expect(kernelClean).toMatch(/h1,\s*\nh2,\s*\nh3\s*\{[^}]*break-after: avoid/);
    expect(kernelClean).toMatch(/section\.bg-card > div:first-child\s*\{[^}]*break-after: avoid/);
    expect(kernelClean).toMatch(/\.jx-code-card > figcaption\s*\{[^}]*break-after: avoid/);
    expect(kernelClean).toMatch(/\[data-jx-code-card-foot\]\s*\{[^}]*break-before: avoid/);
    // pagedjs's break parser splits selectors on BARE commas — a
    // :where() comma list would shatter into invalid fragments
    // ("' h3)' is not a valid selector", the r3 hang). Only break-*
    // declarations ride that parser; assert none of them hide behind
    // a :where comma list.
    for (const m of kernelClean.matchAll(/([^{}]+)\{[^}]*break-(?:after|before|inside)[^}]*\}/g)) {
      expect(m[1], `break rule selector must be comma-plain: ${m[1].trim()}`).not.toMatch(/:where\([^)]*,/);
    }
    // the restyled ToC: the dot-leader stretch + the attr-folio
    expect(kernelClean).toContain('[data-jx-print-toc-leader]');
    expect(kernelClean).toMatch(/border-block-end: 1px dotted/);
    expect(kernelClean).toContain('[data-jx-print-toc-sub]');
  });

  it('carries the intent header (the migration table, named)', () => {
    expect(kernelCss).toContain('AUDITED WHITELIST');
    expect(kernelCss).toContain('data-jx-props-table-scroll');
  });

  it('carries the attr-backfilled folio law (the ToC page numbers ride data-jx-folio)', () => {
    // vision r3: pagedjs's target-counter resolver loses targets
    // moved by keep-with-next (the moved clone sheds its id); the
    // pipeline backfills the finished layout's page numbers as a
    // static attribute — attr(), never a counter
    expect(kernelClean).toContain('content: attr(data-jx-folio)');
    expect(kernelClean).not.toContain('target-counter');
  });
});

// =========================================================================
// the source separation
// =========================================================================
describe('sim-shell.css — the document-side half', () => {
  it('DOES carry the not-print exclusion wrapper (the sim chrome)', () => {
    expect(simShellCss).toMatch(/@media\s+not\s+print/);
    expect(simShellCss).toContain('[data-print-output]');
  });

  it('carries the real-print switch gated on the pipeline-active stamp', () => {
    expect(simShellCss).toMatch(/@media print/);
    expect(simShellCss).toContain('html[data-jx-print-active]');
  });
});

describe('source separation (imports)', () => {
  it('the kernel stylesheet reaches the codebase only as ?raw text via the pipeline', () => {
    const offenders: string[] = [];
    const walk = (dir: string): void => {
      for (const name of readdirSync(dir)) {
        const full = resolve(dir, name);
        if (statSync(full).isDirectory()) {
          walk(full);
          continue;
        }
        if (!/\.(ts|svelte)$/.test(name)) continue;
        const source = readFileSync(full, 'utf8');
        for (const match of source.matchAll(/from\s+'([^']*kernel-print[^']*)'/g)) {
          if (match[1] !== './kernel-print.css?raw') offenders.push(`${full}: ${match[1]}`);
        }
      }
    };
    walk(lib('print'));
    expect(offenders).toEqual([]);
  });

  it('the pipeline module never imports the sim shell', () => {
    const pipelineSource = readFileSync(lib('print/pipeline.svelte.ts'), 'utf8');
    expect(pipelineSource.match(/from\s+'[^']*sim-shell[^']*'/g)).toBeNull();
  });
});

// =========================================================================
// the zero-reference gate (the retirement's closing assertion)
// =========================================================================
describe('the parallel family retired — zero references', () => {
  const roots = [resolve(__dirname, '../src'), __dirname];

  function* sources(): Generator<string> {
    for (const base of roots) {
      const walk = (dir: string): void => {
        for (const name of readdirSync(dir)) {
          const full = resolve(dir, name);
          if (statSync(full).isDirectory()) {
            walk(full);
          } else if (/\.(ts|svelte|css|html)$/.test(name)) {
            results.push(full);
          }
        }
      };
      const results: string[] = [];
      walk(base);
      yield* results;
    }
  }

  it('lib/paged no longer exists', () => {
    expect(existsSync(lib('paged'))).toBe(false);
  });

  it('no import/usage of the family survives (source, barrel, routes, tests)', () => {
    const offenders: string[] = [];
    const patterns: RegExp[] = [
      /from\s+['"][^'"]*(?:\$lib\/paged|\/paged\/|\.\.\/paged|\.\/paged)['"]/,
      /import\s+['"][^'"]*lib\/paged[^'']*['"]/,
      /<Paged[A-Z]\w*/,
      /lib\/paged\//,
    ];
    // comment-stripped: prose mentions are not references (the code
    // surface is what the gate holds)
    const stripComments = (source: string): string =>
      source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
    for (const file of sources()) {
      const source = stripComments(readFileSync(file, 'utf8'));
      for (const pattern of patterns) {
        if (pattern.test(source)) offenders.push(`${file}: ${pattern}`);
      }
    }
    expect(offenders, offenders.slice(0, 6).join('\n')).toEqual([]);
  });

  it('the print layer barrel exports the replacement surface', () => {
    const barrel = readFileSync(lib('print/index.ts'), 'utf8');
    expect(barrel).toContain('PrintDoc');
    expect(barrel).toContain('PrintControls');
    expect(barrel).toContain('prepareSnapshot');
  });
});
