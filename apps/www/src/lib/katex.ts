/**
 * KaTeX integration for jixoai math surfaces
 * (registry/files/lib/katex.ts → $lib/katex.ts).
 *
 * Intent list (2026-09-06, Owner): "引入开箱即用的 KaTeX/Mermaid 渲染
 * 组件" — the math half. Out-of-the-box means: one import gives a site
 * REAL math markup AND its fonts (the single side effect below), the
 * engine's option vocabulary stays the caller's (every jixoai default
 * below is overridable by the same-key option), and a site-level macro
 * table extends the TeX vocabulary without touching component code.
 *
 * This is a facade, not a wrapper (the lib/shiki precedent): renderTex
 * forwards katex.renderToString with options untouched — a site that
 * wants output:'mathml' or throwOnError:true gets exactly that. Nothing
 * here re-implements or re-interprets katex output.
 *
 * jixoai defaults (renderTex), EACH overridable by the caller's same-key
 * option (spread order IS the precedence — caller keys land after):
 *  1. output: 'htmlAndMathml' — visual HTML plus the hidden MathML
 *     (the screen-reader path; math surfaces mount no aria-label
 *     because the MathML already speaks)
 *  2. throwOnError: false — invalid TeX paints in place (the raw source
 *     run in errorColor) instead of throwing; a caller forcing
 *     throwOnError:true makes renderTex THROW, and the SURFACE catches,
 *     paints the raw source + one console.warn (errors never escape a
 *     component boundary)
 *  3. errorColor: 'var(--error)' — the jixoai-theme error token
 *     binding (light/dark follows the sheet, zero re-render)
 *
 * `import 'katex/dist/katex.min.css'` is the module's ONLY side effect
 * and it lives HERE, not in each ui item: KaTeX's fonts ride the npm
 * package and the consumer's bundler — zero font shipping, zero plugin
 * prerequisite — so both math surfaces (and any future markdown lane)
 * load the engine css + fonts exactly once via $lib/katex.
 *
 * registerMacros(macros) merges into a module-level defaults table —
 * SITE-scoped by design, the registerLanguage/registerTheme
 * extension-point precedent: register once at app boot; a repeated key
 * OVERWRITES the earlier macro (last-wins, documented); a per-call
 * `macros` option layers ON TOP per key (call-specific wins, the site
 * defaults stay underneath). vitest's per-file module isolation keeps
 * spec files from cross-pollinating.
 */

import katex from 'katex';
import type { KatexOptions } from 'katex';
import 'katex/dist/katex.min.css';

/**
 * katex.renderToString's own option vocabulary (macros, strict, trust,
 * minRuleThickness, …) with the two jixoai-default keys re-documented
 * in place. Everything katex accepts flows through unchanged.
 */
export interface RenderTexOptions extends KatexOptions {
  /** false default (inline mode) — math-block passes true. */
  displayMode?: boolean;
  /** default 'var(--error)' — the jixoai-theme error token binding. */
  errorColor?: string;
}

/** the site-level macro table registerMacros fills (module state, last-wins per key) */
const siteMacros: NonNullable<KatexOptions['macros']> = {};

/**
 * Register site-level TeX macros: `registerMacros({ '\\RR': '\\mathbb{R}' })`
 * at app boot. SITE-scoped by design — the registerLanguage/
 * registerTheme extension-point precedent: every later renderTex call
 * merges this table under its own `macros` option (per key: the call's
 * macro wins, the site default stays). A repeated key overwrites the
 * earlier registration (last-wins).
 */
export function registerMacros(macros: NonNullable<KatexOptions['macros']>): void {
  Object.assign(siteMacros, macros);
}

/**
 * Render TeX to an HTML string (katex.renderToString) under the jixoai
 * defaults above. Synchronous and isomorphic — the surfaces render in
 * $derived during SSR/prerender (the sync math lane; no floor, no
 * upgrade). Every default is overridable by the same-key option; the
 * per-call macros option merges per key OVER the site table.
 */
export function renderTex(tex: string, options: RenderTexOptions = {}): string {
  const { macros, ...rest } = options;
  return katex.renderToString(tex, {
    // jixoai defaults — each caller key of the same name overrides
    output: 'htmlAndMathml',
    throwOnError: false,
    errorColor: 'var(--error)',
    ...rest,
    // the macro layers: site table under the call's own macros
    macros: { ...siteMacros, ...macros },
  });
}
