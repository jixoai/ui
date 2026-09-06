/**
 * The shiki highlight backend (lib/highlight/shiki.ts,
 * highlight-backend-pluggable, 2026-09-02).
 *
 * A thin adapter over the EXISTING lib/shiki facade (zero new
 * downloads, zero behavior change): highlightCode's on-demand
 * grammars/themes, the jixoai css-variables default theme, and the
 * <pre> editor-colors ride-along the CodeCard has always applied —
 * moved here verbatim so the card is backend-agnostic.
 *
 * This is also the DEFAULT backend (the stock instance below): a card
 * with no `backend` prop and no context provider highlights exactly as
 * it did before the pluggable system existed.
 */

import { DEFAULT_THEME, highlightCode } from '$lib/shiki';
import {
  applyDeclarations,
  canonicalLang,
  requestedLang,
  type HighlightBackend,
} from './backend';

/**
 * Mirrors lib/shiki.ts's alias table — the facade keeps its own copy and
 * this factory canonicalizes BOTH its `langs` option entries and each
 * request against the same mapping, so allowlists written in alias or
 * canonical form behave identically.
 */
const langAliases: Record<string, string> = {
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  shellscript: 'bash',
  md: 'markdown',
  yml: 'yaml',
  htm: 'html',
};

/**
 * Shiki's classic structure is <pre …><code…>INNER</code></pre>; source
 * text is entity-escaped inside INNER, so the first <code open and the
 * last </code> close bracket exactly the token markup. Keeping only the
 * inner markup lets the backend paint the card's OWN <code> element —
 * the card's <pre> stays the single scrollport (no CLS on the swap, no
 * nested scroll areas). Any structure we do not recognize yields '' —
 * the plain-text fallback — rather than feeding foreign markup to
 * innerHTML (CodeCard Codex r1 hardening, carried over).
 */
function innerCodeHtml(html: string): string {
  const open = html.indexOf('<code');
  const openEnd = html.indexOf('>', open);
  const close = html.lastIndexOf('</code>');
  if (open === -1 || openEnd === -1 || close === -1 || close <= openEnd) return '';
  return html.slice(openEnd + 1, close);
}

/** the theme's editor colors from Shiki's <pre style="…">, verbatim */
function preStyleOf(html: string): string {
  return /^<pre[^>]*style="([^"]*)"/.exec(html)?.[1] ?? '';
}

/** Options for the shiki backend factory (highlight-engine-matrix, 2026-09-06). */
export interface ShikiBackendOptions {
  /**
   * Restrict THIS instance to a language subset (alias or canonical ids;
   * canonicalized on construction). Omitted = the facade's full curated
   * set ("the engine's whole capability" is the default posture). A
   * request outside the set rejects with a hint — the card's plain-text
   * fallback law takes over. The shared facade registry is never
   * mutated: instances compose freely.
   */
  langs?: readonly string[];
}

/**
 * The shiki backend factory: `<CodeCard backend={shiki()} />` or
 * `shiki({ langs: ['ts', 'bash'] })`. Instances are stateless adapters
 * over the shared highlighter — create as many as you like.
 */
export function shiki(options: ShikiBackendOptions = {}): HighlightBackend {
  const allowed =
    options.langs === undefined
      ? undefined
      : new Set(options.langs.map((lang) => canonicalLang(langAliases, lang)));
  return {
    id: 'shiki',
    async highlight(el, code, opts) {
      const lang = canonicalLang(langAliases, requestedLang(opts));
      if (allowed !== undefined && !allowed.has(lang)) {
        throw new Error(
          `[jixoai/highlight/shiki] lang "${lang}" is outside this instance's langs set ` +
            `(allowed: ${[...allowed].join(', ')}) — widen shiki({ langs: [...] }) ` +
            `or use an unrestricted shiki()`,
        );
      }
      const html = await highlightCode(code, {
        lang,
        theme: opts.theme ?? DEFAULT_THEME,
      });
      const inner = innerCodeHtml(html);
      // '' = unrecognized structure: leave the plain sample standing
      if (inner !== '') el.innerHTML = inner;
      const pre = el.closest('pre');
      if (pre) applyDeclarations(pre, preStyleOf(html));
    },
  };
}

/**
 * The stock default backend — ONE shared instance (the def's defaults()
 * and the card's no-context fallback both point here, so "no provider"
 * is one object identity everywhere).
 */
export const DEFAULT_SHIKI_BACKEND: HighlightBackend = shiki();
