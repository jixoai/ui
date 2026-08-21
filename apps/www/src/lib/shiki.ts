/**
 * Shiki integration for jixoai code surfaces
 * (registry/files/lib/shiki.ts → @lib/shiki.ts).
 *
 * Intent list (2026-08-22, user): "基于 Shiki 引入成熟高亮，语言/主题按需
 * 加载且轻量；不做过度封装，兼容 Shiki 生态。"
 *  1. on-demand singleton over `shiki/core` (JavaScript regex engine, no WASM)
 *  2. fine-grained grammar/theme loading — one dynamic import per request
 *  3. zero-download default theme: Shiki's css-variables recipe bound to --tok-*
 *  4. ecosystem passthrough: stock HighlighterCore + codeToHtml options
 *
 * This is a facade, not a wrapper: `getHighlighter()` returns a stock
 * `HighlighterCore` and `highlightCode()` forwards options untouched, so
 * anything from the Shiki ecosystem — themes, grammars, transformers,
 * decorations, dual-theme rendering — flows through unchanged. Nothing here
 * re-implements or re-interprets Shiki output.
 *
 * Loading model (why this is light):
 *  - shiki/core + the JS engine are dynamically imported on FIRST highlight,
 *    so they code-split out of the entry chunk and never load for JS-off or
 *    no-code pages.
 *  - every grammar and theme below is its own dynamic import; bundlers emit
 *    one lazy chunk per module and the browser fetches only what a page
 *    actually highlights (plus sub-grammars the code itself hints at, via
 *    Shiki's guessEmbeddedLanguages — the same mechanism the full bundle
 *    uses).
 *  - the default `jixoai` theme costs nothing: token colors resolve to the
 *    consumer's `--tok-*` CSS variables at paint time (see code-card.svelte
 *    for the palette), so light/dark adaptation is pure CSS.
 */

import type {
  CodeOptionsMeta,
  CodeOptionsMultipleThemes,
  CodeOptionsSingleTheme,
  CodeToHastOptions,
  CodeToHastOptionsCommon,
  HighlighterCore,
  LanguageInput,
  ThemeInput,
  ThemeRegistration,
} from 'shiki/core';

/** Default theme name: the zero-download css-variables theme (see below). */
export const DEFAULT_THEME = 'jixoai';

/**
 * Shiki's own codeToHtml options, with theme/themes made optional — when
 * neither is given, highlightCode injects the jixoai default. Everything
 * else (transformers, decorations, dual themes, colorReplacements…) is the
 * untouched Shiki contract.
 */
export type HighlightOptions = CodeToHastOptionsCommon &
  CodeOptionsMeta &
  Partial<CodeOptionsSingleTheme> &
  Partial<CodeOptionsMultipleThemes>;

type LangModule = { default: LanguageInput };
type ThemeModule = { default: ThemeInput };
/** a theme registration object, or a lazy loader (`import('shiki/themes/x.mjs')`) */
type ThemeSource = ThemeRegistration | (() => Promise<ThemeModule>);

/**
 * Grammars registered here — each entry one lazy chunk (`shiki/langs/<id>.mjs`).
 * The set is deliberately curated to what jixoai sites show; any other Shiki
 * grammar joins via registerLanguage with a one-line import.
 */
const langLoaders = new Map<string, () => Promise<LangModule>>([
  ['typescript', () => import('shiki/langs/typescript.mjs')],
  ['tsx', () => import('shiki/langs/tsx.mjs')],
  ['javascript', () => import('shiki/langs/javascript.mjs')],
  ['jsx', () => import('shiki/langs/jsx.mjs')],
  ['svelte', () => import('shiki/langs/svelte.mjs')],
  ['html', () => import('shiki/langs/html.mjs')],
  ['css', () => import('shiki/langs/css.mjs')],
  ['scss', () => import('shiki/langs/scss.mjs')],
  ['json', () => import('shiki/langs/json.mjs')],
  ['bash', () => import('shiki/langs/bash.mjs')],
  ['markdown', () => import('shiki/langs/markdown.mjs')],
  ['yaml', () => import('shiki/langs/yaml.mjs')],
  ['vue', () => import('shiki/langs/vue.mjs')],
]);

/** alias → canonical grammar id, mirroring Shiki's bundled aliases for the set above */
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

/** Themes registered here — one lazy chunk each (`shiki/themes/<name>.mjs`). */
const themeLoaders = new Map<string, () => Promise<ThemeModule>>([
  ['github-dark', () => import('shiki/themes/github-dark.mjs')],
  ['github-light', () => import('shiki/themes/github-light.mjs')],
  ['vitesse-dark', () => import('shiki/themes/vitesse-dark.mjs')],
  ['vitesse-light', () => import('shiki/themes/vitesse-light.mjs')],
  ['min-dark', () => import('shiki/themes/min-dark.mjs')],
  ['min-light', () => import('shiki/themes/min-light.mjs')],
]);

/** themes registered as objects (registerTheme with a ThemeRegistration). */
const inlineThemes = new Map<string, ThemeInput>();

/** Shiki's special languages render without any grammar download. */
const SPECIAL_LANGS = new Set(['ansi', 'text', 'plain', 'plaintext']);

let highlighterPromise: Promise<HighlighterCore> | undefined;

/**
 * The shared lazy HighlighterCore. Created once: shiki/core + the JavaScript
 * regex engine load on first call (code-split, zero WASM); the jixoai theme
 * is created in-memory from Shiki's own css-variables factory — no fetch.
 */
export function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= (async () => {
    const [{ createHighlighterCore, createCssVariablesTheme }, { createJavaScriptRegexEngine }] =
      await Promise.all([import('shiki/core'), import('shiki/engine/javascript')]);
    return createHighlighterCore({
      themes: [
        createCssVariablesTheme({
          name: DEFAULT_THEME,
          variablePrefix: '--tok-',
          variableDefaults: {
            background: 'transparent',
            foreground: 'inherit',
          },
        }),
      ],
      // forgiving: grammars the JS engine cannot compile degrade to plain
      // tokens instead of throwing (the engine's own production recommendation)
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    });
  })();
  return highlighterPromise;
}

/** Register a grammar for on-demand loading (canonical id or alias). */
export function registerLanguage(id: string, loader: () => Promise<LangModule>): void {
  langLoaders.set(id, loader);
}

/**
 * Register a theme: either a lazy module loader (`registerTheme('github-dark',
 * () => import('shiki/themes/github-dark.mjs'))`) or a plain ThemeRegistration
 * object straight from the Shiki ecosystem.
 */
export function registerTheme(name: string, source: ThemeSource): void {
  if (typeof source === 'function') {
    themeLoaders.set(name, source);
    inlineThemes.delete(name);
  } else {
    inlineThemes.set(name, source);
    themeLoaders.delete(name);
  }
}

/** Registered grammar ids (canonical + aliases) — for docs UIs to enumerate. */
export function getRegisteredLanguages(): string[] {
  return [...langLoaders.keys(), ...Object.keys(langAliases)];
}

/** Registered theme names (loaders + objects, the jixoai default included). */
export function getRegisteredThemes(): string[] {
  return [DEFAULT_THEME, ...themeLoaders.keys(), ...inlineThemes.keys()];
}

/**
 * Load the grammar for `lang` (alias-resolved) plus any sub-grammars the code
 * itself hints at — markdown fences, `<script lang=…>`, frontmatter — using
 * Shiki's guessEmbeddedLanguages, exactly like the full bundle does. Guesses
 * outside the registered set are ignored (they may be arbitrary user text).
 */
async function ensureLanguage(lang: string, code: string): Promise<string> {
  if (SPECIAL_LANGS.has(lang)) return lang;
  const highlighter = await getHighlighter();
  const id = langAliases[lang] ?? lang;
  const { guessEmbeddedLanguages } = await import('shiki/core');
  const wanted = [id, ...guessEmbeddedLanguages(code, id)];
  for (const wantedId of wanted) {
    const canonical = langAliases[wantedId] ?? wantedId;
    if (highlighter.getLoadedLanguages().includes(canonical)) continue;
    const loader = langLoaders.get(canonical);
    if (canonical !== id && !loader) continue; // unregistered guess: skip, not an error
    if (!loader) {
      throw new Error(
        `[jixoai/shiki] no grammar registered for "${lang}" — registerLanguage('${canonical}', () => import('shiki/langs/${canonical}.mjs')) first`,
      );
    }
    await highlighter.loadLanguage((await loader()).default);
  }
  return id;
}

/** Load a theme by name (jixoai is preloaded; unknown names throw with a hint). */
async function ensureTheme(name: string): Promise<void> {
  if (name === 'none') return; // Shiki's SpecialTheme
  const highlighter = await getHighlighter();
  if (highlighter.getLoadedThemes().includes(name)) return;
  const inline = inlineThemes.get(name);
  if (inline) {
    await highlighter.loadTheme(inline);
    return;
  }
  const loader = themeLoaders.get(name);
  if (!loader) {
    throw new Error(
      `[jixoai/shiki] no theme registered for "${name}" — registerTheme('${name}', () => import('shiki/themes/${name}.mjs')) or pass a ThemeRegistration`,
    );
  }
  await highlighter.loadTheme((await loader()).default);
}

/**
 * Highlight through the shared highlighter. `options` is Shiki's own
 * codeToHtml options object (transformers, decorations, dual `themes`, …) —
 * passed through untouched. Grammars and themes load on demand; when neither
 * theme nor themes is given, the jixoai css-variables theme applies.
 */
export async function highlightCode(code: string, options: HighlightOptions): Promise<string> {
  const { theme, themes, ...rest } = options;
  const lang = await ensureLanguage(rest.lang, code);
  // string names load on demand; registration objects pass straight through
  // (Shiki normalizes inline themes without the registry)
  const themeSources = theme !== undefined ? [theme] : Object.values(themes ?? {});
  for (const source of themeSources) {
    if (typeof source === 'string') await ensureTheme(source);
  }
  const highlighter = await getHighlighter();
  // inject the default only when the caller passed neither theme nor themes
  const resolved: CodeToHastOptions =
    theme !== undefined
      ? { ...rest, lang, theme }
      : themes !== undefined
        ? { ...rest, lang, themes }
        : { ...rest, lang, theme: DEFAULT_THEME };
  return highlighter.codeToHtml(code, resolved);
}
