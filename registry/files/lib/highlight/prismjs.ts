/**
 * The Prism.js highlight backend (lib/highlight/prismjs.ts,
 * highlight-backend-pluggable, 2026-09-02).
 *
 * A MARKUP backend: Prism.highlight() token spans replace the card's
 * plain text (innerHTML), so the paint survives the print pipeline's
 * freeze clone like shiki's does.
 *
 * Lazy loading (the engine-minisearch precedent): the prism core, every
 * grammar and every theme stylesheet are dynamic imports — nothing of
 * Prism joins the page until a prismjs()-backed card actually paints.
 * Prism core is imported in MANUAL mode (window.Prism = { manual: true }
 * is set before the first load) so its DOMContentLoaded auto-highlight
 * never fights the card's own effect.
 *
 * THEME SEMANTICS (per-backend mapping, by design): the card's `theme`
 * prop keeps shiki vocabulary; this backend maps 'jixoai'/undefined to
 * the stock light 'prism' theme and treats any other name as a Prism
 * theme stylesheet id verbatim (github-dark → no stock match → warns
 * and stays unstyled; bring your own by registering below). Prism
 * themes style `code[class*="language-"]` GLOBALLY — one active theme
 * per document (last requested wins); per-card theming is a shiki /
 * microlighter capability, not Prism's model.
 *
 * LANGUAGES mirror lib/shiki.ts's curated set minus what prismjs 1.30
 * no longer ships (svelte, vue): unknown ids reject with a hint and the
 * card falls back to plain text — the same law shiki follows.
 */

import type { HighlightBackend } from './backend';

/** prism core namespace (typed by @types/prismjs; loaded lazily) */
type PrismCore = typeof import('prismjs');

let corePromise: Promise<PrismCore> | undefined;

/**
 * The lazy prism core. manual mode must be armed BEFORE the core
 * executes; a failed load clears the cached promise so the next paint
 * retries (the shiki facade's own hardening law). The CJS↔ESM seam
 * differs by host — node interop exposes module.exports as `default`,
 * vite's prebundle exposes the named exports — so both shapes are
 * reconciled here.
 */
function getPrism(): Promise<PrismCore> {
  corePromise ??= (async () => {
    if (typeof window !== 'undefined') {
      // the double cast keeps @types/prismjs's UMD global namespace
      // (which types a bare `Prism` value) out of this property write
      const win = window as unknown as { Prism?: unknown };
      // pre-core marker object: Prism reads `.manual` off window.Prism
      // at init — this is Prism's own documented bundler pattern
      win.Prism ??= { manual: true };
    }
    const mod = (await import('prismjs')) as typeof import('prismjs') & {
      default?: PrismCore;
    };
    return mod.default ?? mod;
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
 * Grammars this backend ships loaders for — dependency-ordered chains
 * (prism components are plain side-effect modules over the shared
 * core; deps must execute first). Core preloads markup/css/clike/
 * javascript, so those ids cost nothing.
 */
const grammarLoaders = new Map<string, () => Promise<unknown>>([
  ['markup', async () => {}],
  ['css', async () => {}],
  ['clike', async () => {}],
  ['javascript', async () => {}],
  ['typescript', () => import('prismjs/components/prism-typescript')],
  [
    'jsx',
    async () => {
      await import('prismjs/components/prism-markup-templating');
      await import('prismjs/components/prism-jsx');
    },
  ],
  [
    'tsx',
    async () => {
      await import('prismjs/components/prism-markup-templating');
      await import('prismjs/components/prism-jsx');
      await import('prismjs/components/prism-typescript');
      await import('prismjs/components/prism-tsx');
    },
  ],
  ['json', () => import('prismjs/components/prism-json')],
  ['bash', () => import('prismjs/components/prism-bash')],
  ['markdown', () => import('prismjs/components/prism-markdown')],
  ['yaml', () => import('prismjs/components/prism-yaml')],
  ['scss', () => import('prismjs/components/prism-scss')],
]);

/** alias → canonical grammar id (mirrors lib/shiki.ts's alias table) */
const langAliases: Record<string, string> = {
  html: 'markup',
  mathml: 'markup',
  svg: 'markup',
  xml: 'markup',
  htm: 'markup',
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
};

/**
 * Prism stock theme stylesheet ids (explicit loaders — vite cannot
 * statically analyze templated package subpaths).
 */
const themeLoaders: Record<string, () => Promise<unknown>> = {
  prism: () => import('prismjs/themes/prism.css'),
  coy: () => import('prismjs/themes/prism-coy.css'),
  dark: () => import('prismjs/themes/prism-dark.css'),
  funky: () => import('prismjs/themes/prism-funky.css'),
  okaidia: () => import('prismjs/themes/prism-okaidia.css'),
  solarizedlight: () => import('prismjs/themes/prism-solarizedlight.css'),
  tomorrow: () => import('prismjs/themes/prism-tomorrow.css'),
  twilight: () => import('prismjs/themes/prism-twilight.css'),
};

const loadedThemes = new Set<string>();

/** the per-backend theme mapping: shiki defaults → the stock light theme */
function prismThemeName(theme: string | undefined): string {
  return theme === undefined || theme === 'jixoai' ? 'prism' : theme;
}

async function ensureTheme(name: string): Promise<void> {
  if (loadedThemes.has(name)) return;
  const loader = themeLoaders[name];
  if (loader === undefined) {
    console.warn(
      `[jixoai/highlight/prismjs] no Prism theme "${name}" — staying unstyled (stock ids: ${Object.keys(themeLoaders).join(', ')})`,
    );
    return;
  }
  await loader();
  loadedThemes.add(name);
}

async function ensureGrammar(lang: string): Promise<string> {
  const Prism = await getPrism();
  const canonical = langAliases[lang] ?? lang;
  if (Prism.languages[canonical] === undefined) {
    const loader = grammarLoaders.get(canonical);
    if (loader === undefined) {
      throw new Error(
        `[jixoai/highlight/prismjs] no Prism grammar for "${lang}" — prismjs 1.30 ships: ${[...grammarLoaders.keys()].join(', ')} (svelte/vue left the package; use the shiki backend for those)`,
      );
    }
    await loadOnce(`grammar:${canonical}`, async () => {
      await loader();
    });
  }
  return canonical;
}

/**
 * The Prism.js backend factory: `<CodeCard backend={prismjs()} />`.
 * Stateful per instance only through the shared module-level caches
 * (core, grammars, themes) — instances compose freely.
 */
export function prismjs(): HighlightBackend {
  return {
    id: 'prismjs',
    async highlight(el, code, opts) {
      const canonical = await ensureGrammar(opts.lang ?? 'ts');
      const Prism = await getPrism();
      const grammar = Prism.languages[canonical];
      if (grammar === undefined) {
        // a component that loaded but registered nothing — same law
        throw new Error(`[jixoai/highlight/prismjs] grammar "${canonical}" did not register`);
      }
      // the language class is the Prism theme contract
      // (code[class*="language-"]) — swap any previous one, keep
      // whatever else the host put on the element
      for (const cls of [...el.classList]) {
        if (cls.startsWith('language-')) el.classList.remove(cls);
      }
      el.classList.add(`language-${canonical}`);
      el.innerHTML = Prism.highlight(code, grammar, canonical);
      await ensureTheme(prismThemeName(opts.theme));
    },
  };
}
