/**
 * katex facade suite (test/katex.spec.ts, 2026-09-06, the katex-mermaid
 * change — intent (Owner): "引入开箱即用的 KaTeX/Mermaid 渲染组件").
 *
 * The REAL engine in vitest (small, sync, isomorphic — no mock). The
 * facade promises:
 *  - jixoai defaults: output htmlAndMathml (visual HTML + the hidden
 *    MathML screen-reader path), throwOnError:false, and errorColor
 *    bound to the theme token var(--error);
 *  - EVERY default overridable by the caller's same-key option (output
 *    'mathml'/'html', throwOnError:true, a custom errorColor);
 *  - the site-level registerMacros table: module-scope, last-wins per
 *    key, layered UNDER a per-call macros option (per key);
 *  - the engine's markup vocabulary (.katex / .katex-mathml /
 *    .katex-html, .katex-display) arriving untouched — facade, not
 *    wrapper.
 *
 * The katex.min.css import is inert under vitest (css stubbing — the
 * code-card precedent ships its own css import and its spec runs); the
 * spec running against the module that imports it IS the receipt.
 */
import { describe, expect, it } from 'vitest';

import { renderTex, registerMacros } from '../src/lib/katex';

describe('katex facade · markup vocabulary (the real engine)', () => {
  it('renders the .katex span carrying BOTH halves: hidden MathML + visual HTML', () => {
    const html = renderTex('c = \\pm\\sqrt{a^2 + b^2}');
    expect(html).toContain('class="katex');
    expect(html).toContain('katex-mathml');
    expect(html).toContain('<math');
    expect(html).toContain('katex-html');
  });

  it('inline by default: no .katex-display wrapper; displayMode:true wraps one', () => {
    const inline = renderTex('\\sum_{n=1}^{\\infty} \\frac{1}{n}');
    expect(inline).not.toContain('katex-display');

    const display = renderTex('\\sum_{n=1}^{\\infty} \\frac{1}{n}', { displayMode: true });
    expect(display).toContain('katex-display');
  });

  it('the visual html half is aria-hidden; the MathML stays the exposed screen-reader path', () => {
    const html = renderTex('x^2');
    // katex 0.18 hides the VISUAL half from AT — the MathML speaks instead
    expect(html).toMatch(/class="katex-html" aria-hidden="true"/);
    expect(html).toContain('<span class="katex-mathml"><math');
    expect(html).not.toMatch(/katex-mathml"[^>]*aria-hidden/);
  });
});

describe('katex facade · jixoai defaults and their override precedence', () => {
  it('an invalid formula paints IN PLACE: the raw source run in var(--error), never throws', () => {
    const html = renderTex('\\notacommand + \\frac{1}{');
    expect(html).toContain('katex-error');
    // the token binding: the tint resolves against the consumer's theme sheet
    expect(html).toContain('color:var(--error)');
    // katex's own error output paints the source itself
    expect(html).toContain('\\notacommand');
  });

  it('a caller errorColor replaces the token binding verbatim (same-key override)', () => {
    const html = renderTex('\\notacommand', { errorColor: '#ff00ff' });
    expect(html).toContain('color:#ff00ff');
    expect(html).not.toContain('var(--error)');
  });

  it('a caller output override drops the unwanted half (mathml-only / html-only)', () => {
    const mathmlOnly = renderTex('x^2', { output: 'mathml' });
    expect(mathmlOnly).toContain('<math');
    expect(mathmlOnly).not.toContain('katex-html');

    const htmlOnly = renderTex('x^2', { output: 'html' });
    expect(htmlOnly).toContain('katex-html');
    expect(htmlOnly).not.toContain('katex-mathml');
    expect(htmlOnly).not.toContain('<math');
  });

  it('a caller throwOnError:true throws the engine ParseError (the surface layer catches)', () => {
    expect(() => renderTex('\\notacommand', { throwOnError: true })).toThrow();
  });

  it('a per-call macros option expands through the engine untouched', () => {
    const html = renderTex('x \\in \\RR', { macros: { '\\RR': '\\mathbb{R}' } });
    expect(html).toContain('<span class="mord mathbb">R</span>');
  });
});

describe('katex facade · registerMacros (site-scoped, last-wins)', () => {
  // module state persists within this file (vitest per-file module
  // isolation keeps other spec files clean) — the ordering below is
  // load-bearing: register → serve → overwrite → re-serve
  it('registers a site-level macro that serves later calls with no macros option', () => {
    registerMacros({ '\\jxSet': '\\mathbb{R}' });
    expect(renderTex('x \\in \\jxSet')).toContain('<span class="mord mathbb">R</span>');
  });

  it('a repeated key overwrites the earlier macro (last-wins)', () => {
    registerMacros({ '\\jxSet': '\\mathbb{Z}' });
    expect(renderTex('x \\in \\jxSet')).toContain('<span class="mord mathbb">Z</span>');
    expect(renderTex('x \\in \\jxSet')).not.toContain('<span class="mord mathbb">R</span>');
  });

  it('the per-call macros option layers ON TOP of the site table per key', () => {
    expect(renderTex('x \\in \\jxSet', { macros: { '\\jxSet': '\\mathbb{Q}' } })).toContain(
      '<span class="mord mathbb">Q</span>',
    );
    // the site default survives underneath for later calls
    expect(renderTex('x \\in \\jxSet')).toContain('<span class="mord mathbb">Z</span>');
  });
});
