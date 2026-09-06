/**
 * The highlight.js highlight backend (lib/highlight/highlight-js.ts,
 * highlight-engine-matrix, 2026-09-06).
 *
 * A MARKUP backend: hljs.highlight() token spans replace the card's plain
 * text (innerHTML), so the paint survives the print pipeline's freeze
 * clone like shiki's does. The card's <code> also receives the two
 * classes hljs themes key on — `hljs` (the base hook every stock sheet
 * styles) and `language-<id>` (the grammar it was painted with).
 *
 * THE FLAGSHIP SIZE CHANNEL (why this engine exists — design D3):
 * `highlight.js/lib/core` is the ZERO-language kernel; each grammar is
 * `import('highlight.js/lib/languages/<id>')` registered on demand. A
 * card that only ever paints three languages downloads exactly that
 * kernel + three grammars — hljs's own official tree-shaping, with the
 * `langs` option as the per-instance gate on top.
 *
 * Lazy loading (the engine-minisearch precedent, the law all backends
 * share): the core, every grammar and every theme stylesheet are dynamic
 * imports — nothing of highlight.js joins the page until a
 * highlightJs()-backed card actually paints. A failed load clears the
 * cached promise so the next paint retries.
 *
 * THEME SEMANTICS (per-backend mapping, by design): the card's `theme`
 * prop keeps shiki vocabulary; this backend maps 'jixoai'/undefined to
 * the ITEM-EMBEDDED css sheet (./highlight-js-jixoai.css — the same
 * --tok-token-* palette the shiki default reads, zero download) and any
 * other name to a `highlight.js/styles/<name>.css` sheet from the
 * explicit curate below (vite cannot statically analyze templated
 * subpaths — the prism/microlighter law). Like Prism, stock hljs sheets
 * style `.hljs` GLOBALLY: one active look per document (first come,
 * first served); per-card theming stays a shiki / microlighter
 * capability. Unknown names warn and stay unstyled.
 *
 * LANGUAGES mirror lib/shiki.ts's curated set MAPPED TO hljs ids (the
 * markup id is `xml` — html/htm alias onto it). highlight.js 11.12
 * ships no tsx/jsx/svelte/vue module: those and any other unknown id
 * reject with a hint pointing at the shiki backend, and the card falls
 * back to plain text — the same law shiki and prismjs follow.
 */

import { canonicalLang, requestedLang, type HighlightBackend } from './backend';

/** hljs's LanguageFn (type-only — the package's own types, no runtime import) */
type LanguageFn = import('highlight.js').LanguageFn;

/** the zero-language hljs kernel (typed by hljs itself; loaded lazily) */
type HighlightJsCore = typeof import('highlight.js/lib/core')['default'];

let corePromise: Promise<HighlightJsCore> | undefined;

/**
 * The lazy hljs kernel. The ESM entry (`es/core.js`, the export the
 * `import` condition resolves) re-exports the instance as `default`; a
 * failed load clears the cached promise so the next paint retries (the
 * shiki facade's own hardening law, carried by every backend here).
 */
function getHljs(): Promise<HighlightJsCore> {
  corePromise ??= (async () => {
    const { default: hljs } = await import('highlight.js/lib/core');
    return hljs;
  })().catch((error: unknown) => {
    corePromise = undefined;
    throw error;
  });
  return corePromise;
}

/** one in-flight grammar load per id — concurrent paints share it */
const loadsInFlight = new Map<string, Promise<void>>();

function loadOnce(key: string, load: () => Promise<void>): Promise<void> {
  const existing = loadsInFlight.get(key);
  if (existing) return existing;
  const promise = load().finally(() => loadsInFlight.delete(key));
  loadsInFlight.set(key, promise);
  return promise;
}

/**
 * Grammars this backend registers on demand — the flagship channel
 * above. The curated set is flat: none of these modules chains through
 * requireLanguage (verified against 11.12.0), so no ordering contract
 * like prism's jsx chain is needed.
 */
const languageLoaders = new Map<string, () => Promise<{ default: LanguageFn }>>([
  ['typescript', () => import('highlight.js/lib/languages/typescript')],
  ['javascript', () => import('highlight.js/lib/languages/javascript')],
  ['xml', () => import('highlight.js/lib/languages/xml')],
  ['css', () => import('highlight.js/lib/languages/css')],
  ['scss', () => import('highlight.js/lib/languages/scss')],
  ['json', () => import('highlight.js/lib/languages/json')],
  ['bash', () => import('highlight.js/lib/languages/bash')],
  ['markdown', () => import('highlight.js/lib/languages/markdown')],
  ['yaml', () => import('highlight.js/lib/languages/yaml')],
]);

/** alias → canonical grammar id (mirrors lib/shiki.ts's alias table, retargeted to hljs ids: the markup id is xml) */
const langAliases: Record<string, string> = {
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  html: 'xml',
  htm: 'xml',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  shellscript: 'bash',
  md: 'markdown',
  yml: 'yaml',
};

/**
 * Theme stylesheet loaders — 'jixoai' is the item-embedded sheet; the
 * stock entries are curated from the ACTUAL node_modules/highlight.js/
 * styles/ listing (github + github-dark exist in 11.12.0; vitesse-*
 * does not ship — verified, not guessed).
 */
const themeLoaders: Record<string, () => Promise<unknown>> = {
  jixoai: () => import('./highlight-js-jixoai.css'),
  github: () => import('highlight.js/styles/github.css'),
  'github-dark': () => import('highlight.js/styles/github-dark.css'),
};

const loadedThemes = new Set<string>();

/** the per-backend theme mapping: shiki defaults → the embedded --tok palette sheet */
function highlightJsThemeName(theme: string | undefined): string {
  return theme === undefined || theme === 'jixoai' ? 'jixoai' : theme;
}

async function ensureTheme(name: string): Promise<void> {
  if (loadedThemes.has(name)) return;
  const loader = themeLoaders[name];
  if (loader === undefined) {
    console.warn(
      `[jixoai/highlight/highlight-js] no highlight.js theme "${name}" — staying unstyled (stock ids: ${Object.keys(themeLoaders).join(', ')})`,
    );
    return;
  }
  await loadOnce(`theme:${name}`, async () => {
    await loader();
  });
  loadedThemes.add(name);
}

async function ensureGrammar(lang: string): Promise<void> {
  // the CURATED SET is the boundary, checked BEFORE hljs's registry:
  // hljs grammars self-register extra aliases (typescript claims
  // "tsx"!) that this backend's language law does not endorse
  const loader = languageLoaders.get(lang);
  if (loader === undefined) {
    throw new Error(
      `[jixoai/highlight/highlight-js] no highlight.js grammar for "${lang}" — the curated set ships: ${[...languageLoaders.keys()].join(', ')} (highlight.js has no tsx/jsx/svelte/vue module; use the shiki backend for those)`,
    );
  }
  const hljs = await getHljs();
  // registered already (this factory or an earlier highlightJs()
  // instance — the kernel registry is intentionally shared)
  if (hljs.getLanguage(lang) !== undefined) return;
  await loadOnce(`language:${lang}`, async () => {
    const { default: defineLanguage } = await loader();
    hljs.registerLanguage(lang, defineLanguage);
  });
}

/** Options for the highlight.js backend factory (highlight-engine-matrix, 2026-09-06). */
export interface HighlightJsBackendOptions {
  /**
   * Restrict THIS instance to a language subset (alias or canonical ids;
   * canonicalized on construction). Omitted = the full curated set above
   * ("the engine's whole capability" is the default posture — and with
   * this engine that already means kernel + chosen grammars only). A
   * request outside the set rejects with a hint — the card's plain-text
   * fallback law takes over. The shared kernel registry is never
   * narrowed: instances compose freely.
   */
  langs?: readonly string[];
}

/**
 * The highlight.js backend factory: `<CodeCard backend={highlightJs()} />`
 * or `highlightJs({ langs: ['ts', 'bash'] })`. (The factory name avoids
 * the package name's dot — the FILE is highlight-js.ts for the same
 * reason.) Stateful per instance only through the shared module-level
 * caches (kernel, grammars, themes) — instances compose freely.
 */
export function highlightJs(options: HighlightJsBackendOptions = {}): HighlightBackend {
  const allowed =
    options.langs === undefined
      ? undefined
      : new Set(options.langs.map((lang) => canonicalLang(langAliases, lang)));
  return {
    id: 'highlightjs',
    async highlight(el, code, opts) {
      const canonical = canonicalLang(langAliases, requestedLang(opts));
      if (allowed !== undefined && !allowed.has(canonical)) {
        throw new Error(
          `[jixoai/highlight/highlight-js] lang "${canonical}" is outside this instance's langs set ` +
            `(allowed: ${[...allowed].join(', ')}) — widen highlightJs({ langs: [...] }) ` +
            `or use an unrestricted highlightJs()`,
        );
      }
      await ensureGrammar(canonical);
      const hljs = await getHljs();
      // ignoreIllegals: stray syntax degrades to text instead of throwing —
      // the forgiving posture of the shiki facade's JS engine, not a crash
      const { value } = hljs.highlight(code, { language: canonical, ignoreIllegals: true });
      // the theme hooks: swap any previous language-* class (a cross-
      // backend repaint), keep whatever else the host put on the element
      for (const cls of [...el.classList]) {
        if (cls.startsWith('language-') || cls === 'hljs') el.classList.remove(cls);
      }
      el.classList.add(`language-${canonical}`, 'hljs');
      el.innerHTML = value;
      await ensureTheme(highlightJsThemeName(opts.theme));
    },
  };
}
