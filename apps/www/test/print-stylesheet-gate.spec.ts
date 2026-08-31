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

  it('carries the intent header (the migration table, named)', () => {
    expect(kernelCss).toContain('AUDITED WHITELIST');
    expect(kernelCss).toContain('data-jx-props-table-scroll');
  });

  it('carries the ToC target-counter law (kernel-real page numbers)', () => {
    expect(kernelClean).toContain('target-counter(attr(href url), page)');
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
