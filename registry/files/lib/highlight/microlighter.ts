/**
 * The MicroLighter highlight backend (lib/highlight/microlighter.ts,
 * highlight-backend-pluggable, 2026-09-02 —
 * https://github.com/davatron5000/microlighter).
 *
 * A RANGE backend — the other output model: ZERO markup. MicroLighter
 * tokenizes with native RegExp over TextMate grammars and registers
 * Highlight ranges in the GLOBAL CSS.highlights registry; paint comes
 * from ::highlight() rules in a [data-syntax-theme] scoped stylesheet.
 * The card's <code> keeps its plain text node (copyable, editable) —
 * the progressive-enhancement floor IS the final DOM.
 *
 * PRINT LIMITATION (accepted, deliberate — do not hack the print
 * pipeline around it): the ranges registry does NOT survive DOM
 * cloning. The print pipeline's freeze clone carries the plain text
 * but loses every registered range, and the theme stylesheet cannot
 * bring them back: under print, a microlighter card degrades to plain
 * text. Apps that must print highlighted code pin a markup backend
 * (the HIGHLIGHT_DEF context seam is where an app-side print-gated
 * plugin could switch backends under isPrintProjection(env.medium)).
 *
 * GLOBAL REGISTRY LAW: every highlightAll() scan REPLACES all
 * previously registered range sets. With one card that is invisible;
 * with several, each paint must re-cover the others — hence the scan
 * below runs over the WHOLE document (idempotent: elements keep their
 * language metadata, inactive markup elements are skipped by
 * MicroLighter's own single-text-node guard). A card that unmounts
 * leaves detached-node ranges behind until the next scan paints over
 * them — invisible residue, harmless.
 *
 * THEME SEMANTICS (per-backend mapping): 'jixoai'/undefined → the
 * 'min' theme (MicroLighter's light/dark-adaptive minimal set — the
 * closest match to the card's token-palette posture); any other name
 * is a MicroLighter theme id verbatim (github, dracula, monokai, …).
 * The theme attribute lands on the card's <pre>, so themes can differ
 * per subtree (the ::highlight rules read the --syntax-* custom
 * properties the attribute scopes).
 *
 * FEATURE GATE: browsers without the CSS Custom Highlight API reject
 * with a clear error BEFORE touching the DOM — the card's plain-text
 * fallback law takes over (Firefox < 140, old Safari).
 */

import type { HighlightBackend } from './backend';

/** what microlighter's highlightAll needs from the host environment */
type HighlightAllFn = (options: {
  root?: ParentNode;
  selector?: string;
  languageAliases?: Record<string, string>;
}) => Promise<HTMLElement[]>;

let libPromise: Promise<HighlightAllFn> | undefined;

/** the lazy library — nothing of microlighter joins the page until a microLighter()-backed card paints */
function getHighlightAll(): Promise<HighlightAllFn> {
  libPromise ??= (async () => {
    const { highlightAll } = await import('microlighter');
    return highlightAll as HighlightAllFn;
  })().catch((error: unknown) => {
    libPromise = undefined;
    throw error;
  });
  return libPromise;
}

/**
 * MicroLighter theme stylesheet ids (explicit loaders — vite cannot
 * statically analyze templated package subpaths).
 */
const themeLoaders: Record<string, () => Promise<unknown>> = {
  cobalt2: () => import('microlighter/themes/cobalt2.css'),
  dracula: () => import('microlighter/themes/dracula.css'),
  github: () => import('microlighter/themes/github.css'),
  min: () => import('microlighter/themes/min.css'),
  monokai: () => import('microlighter/themes/monokai.css'),
  'night-owl': () => import('microlighter/themes/night-owl.css'),
  'solarized-light': () => import('microlighter/themes/solarized-light.css'),
  'tokyo-night': () => import('microlighter/themes/tokyo-night.css'),
  vesper: () => import('microlighter/themes/vesper.css'),
  'vscode-plus': () => import('microlighter/themes/vscode-plus.css'),
};

const loadedThemes = new Set<string>();

/** the per-backend theme mapping: shiki defaults → the minimal light/dark set */
function microlighterThemeName(theme: string | undefined): string {
  return theme === undefined || theme === 'jixoai' ? 'min' : theme;
}

async function ensureTheme(name: string): Promise<void> {
  if (loadedThemes.has(name)) return;
  const loader = themeLoaders[name];
  if (loader === undefined) {
    console.warn(
      `[jixoai/highlight/microlighter] no MicroLighter theme "${name}" — staying unstyled (stock ids: ${Object.keys(themeLoaders).join(', ')})`,
    );
    return;
  }
  await loader();
  loadedThemes.add(name);
}

/**
 * Extra aliases beyond MicroLighter's built-ins, mirroring
 * lib/shiki.ts's alias table so the same card samples resolve in all
 * three backends.
 */
const languageAliases: Record<string, string> = {
  htm: 'html',
  mts: 'typescript',
  cts: 'typescript',
  mjs: 'javascript',
  cjs: 'javascript',
  shellscript: 'bash',
};

/**
 * The MicroLighter backend factory: `<CodeCard backend={microLighter()} />`.
 */
export function microLighter(): HighlightBackend {
  return {
    id: 'microlighter',
    async highlight(el, code, opts) {
      // feature gate FIRST — microlighter would crash on CSS.highlights
      const globals = globalThis as {
        CSS?: { highlights?: unknown };
        Highlight?: unknown;
      };
      if (
        globals.CSS === undefined ||
        globals.CSS.highlights === undefined ||
        typeof globals.Highlight !== 'function'
      ) {
        throw new Error(
          '[jixoai/highlight/microlighter] the CSS Custom Highlight API is unavailable here — the card stays plain text',
        );
      }
      // MicroLighter's tokenizer contract: exactly ONE text node, no
      // markup siblings (also the idempotent plain reset for re-paints)
      el.textContent = code;
      // language metadata on the element (its recommended channel)
      el.dataset.language = (opts.lang ?? 'ts').toLowerCase();
      const theme = microlighterThemeName(opts.theme);
      el.closest('pre')?.setAttribute('data-syntax-theme', theme);
      await ensureTheme(theme);
      const highlightAll = await getHighlightAll();
      // whole-document scan: this scan replaces every registered range
      // set, so it must re-cover every element this backend (or an
      // app-level microlighter integration) painted before
      await highlightAll({ root: document, languageAliases });
    },
  };
}
