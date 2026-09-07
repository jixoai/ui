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
 * SCAN COALESCING (inline-code-engine-and-text-modifiers B1,
 * 2026-09-08): the whole-document law has a cost — N surfaces
 * mounting in the same tick (a markdown page with dozens of inline
 * chips is the live case) would each schedule their own scan, N full
 * document passes per frame for zero extra coverage (the LAST scan
 * alone re-covers every element; each keeps its dataset.language).
 * The adapter therefore funnels every in-flight highlight() through
 * ONE queue: the first waiter schedules a single
 * requestAnimationFrame (queueMicrotask where rAF is absent — jsdom
 * and friends), and that one highlightAll drains ALL waiters of the
 * tick. Errors reject that scan's waiters together; a caller arriving
 * after the drain started schedules the next scan. The highlight()
 * contract is unchanged — the promise resolves only after a scan
 * covered the document.
 *
 * THEME SEMANTICS (per-backend mapping): 'jixoai'/undefined → the
 * ITEM-LOCAL jixoai theme (microlighter-jixoai.css — the --syntax-*
 * bridge onto the card's --tok-token-* palette; zero light-dark(),
 * site-mode adaptive by construction, the same default posture as
 * the shiki/hljs/sugar-high backends); any other name is a
 * MicroLighter package theme id verbatim (min, github, dracula, … —
 * CAVEAT: package themes resolve light-dark() against the OS
 * color-scheme, not your site's mode; a host whose mode diverges
 * from the OS pins `pre[data-syntax-theme]` color-scheme to its own
 * dark-class state, see the docs site's app.css). The theme
 * attribute lands on the surface's ANCHOR — the nearest <pre>, or the
 * element itself when the surface is not a card (an inline-code chip
 * has no <pre> and stamps its own <code>), so themes can differ per
 * subtree (the ::highlight rules read the --syntax-* custom
 * properties the attribute scopes).
 *
 * FEATURE GATE: browsers without the CSS Custom Highlight API reject
 * with a clear error BEFORE touching the DOM — the card's plain-text
 * fallback law takes over (Firefox < 140, old Safari).
 *
 * BUNDLER CONTRACT (vite hosts — microlighter loads its grammars via
 * RUNTIME-TEMPLATED relative imports, import(`./grammars/${lang}.js`)
 * inside the package, and swallows every miss with .catch(() => null):
 * a misconfigured host shows plain text with ZERO console signal,
 * found live 2026-09-07): dev MUST exclude the package from the
 * optimizer (optimizeDeps: { exclude: ['microlighter'] }) so the
 * template resolves against real node_modules files; a production
 * build MUST emit node_modules/microlighter/dist/grammars/*.js
 * verbatim next to whichever chunk carries the template (they are
 * zero-import data modules — safe as plain assets). The docs site's
 * vite.config.ts (microlighterGrammarAssets) is the reference
 * implementation.
 */

import { requestedLang, type HighlightBackend } from './backend';

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
 *
 * SSR GUARD (found live 2026-09-08, the chip change): the loader map's
 * CSS dynamic imports are CLIENT-ONLY by construction — highlight()
 * never runs server-side (Svelte effects are client-only and the
 * range pre-gate) — but the module itself now rides the server graph
 * (inline-code statically imports DEFAULT_MICROLIGHTER_BACKEND), and
 * the SSR emitter's replacement for package CSS subpath imports is
 * syntactically broken for most ids (`() =>Promise.resolve({   }))`
 * — a stray paren prerender dies on). Branching on
 * import.meta.env.SSR keeps every import() expression out of the
 * server bundle (dead-branch elimination) while the client build
 * keeps the fully static map vite needs to emit the theme assets.
 */
const themeLoaders: Record<string, () => Promise<unknown>> = import.meta.env.SSR
  ? {}
  : {
      // the zero-download default: the item-local --tok-* bridge (no
      // light-dark(), site-mode adaptive — replaced the package 'min'
      // default 2026-09-07, see the file header for the live bug)
      jixoai: () => import('./microlighter-jixoai.css'),
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

/** the per-backend theme mapping: the default is the item-local --tok-* bridge */
function microlighterThemeName(theme: string | undefined): string {
  return theme === undefined || theme === 'jixoai' ? 'jixoai' : theme;
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
 * The scan selector (found live 2026-09-08, the chip change's vision
 * pass): MicroLighter's default `pre > code` never matches a bare
 * inline chip — the scan returned zero elements with ZERO console
 * signal (its own documented miss posture). The widened arm matches
 * every element carrying the metadata THIS adapter stamps
 * (dataset.language is microlighter's recommended channel), so card
 * codes (pre > code) and chip codes alike resolve; an app element
 * that opts in with data-language paints too — that is the engine's
 * contract, not a leak.
 */
const SCAN_SELECTOR = 'pre > code, code[data-language]';

/**
 * The scan queue — ONE highlightAll per frame for the whole page (the
 * header's SCAN COALESCING law). Waiters are (resolve, reject) pairs;
 * the FIRST caller schedules the drain and every caller arriving
 * before it shares that scan's outcome. Module-level on purpose: the
 * queue is shared by every microLighter() instance — the stock
 * singleton below makes that one instance in practice.
 */
type ScanWaiter = { resolve: () => void; reject: (error: unknown) => void };
let scanWaiters: ScanWaiter[] = [];
let scanScheduled = false;

function coalescedScan(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    scanWaiters.push({ resolve, reject });
    if (scanScheduled) return;
    scanScheduled = true;
    const drain = () => {
      // a caller arriving from here on schedules the NEXT scan
      scanScheduled = false;
      const waiters = scanWaiters;
      scanWaiters = [];
      getHighlightAll()
        .then((highlightAll) =>
          highlightAll({ root: document, selector: SCAN_SELECTOR, languageAliases }),
        )
        .then(
          () => {
            for (const waiter of waiters) waiter.resolve();
          },
          (error: unknown) => {
            for (const waiter of waiters) waiter.reject(error);
          },
        );
    };
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => drain());
    } else {
      queueMicrotask(drain);
    }
  });
}

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
      el.dataset.language = requestedLang(opts).toLowerCase();
      const theme = microlighterThemeName(opts.theme);
      // non-pre surfaces (an inline-code chip's <code>) anchor the
      // theme attribute on themselves — no card required
      (el.closest('pre') ?? el).setAttribute('data-syntax-theme', theme);
      await ensureTheme(theme);
      // whole-document scan, COALESCED: the scan replaces every
      // registered range set, so it must re-cover every element this
      // backend (or an app-level microlighter integration) painted
      // before — and one scan per frame re-covers every synchronously
      // mounting surface at once (the queue's whole point)
      await coalescedScan();
    },
  };
}

/**
 * The stock default backend — ONE shared instance, mirroring
 * DEFAULT_SHIKI_BACKEND's posture in shiki.ts: microLighter() is
 * stateless (id + product only), so every surface riding the default
 * (inline-code's prop → context → stock chain) points at one object
 * identity, and the scan queue above is shared by construction.
 */
export const DEFAULT_MICROLIGHTER_BACKEND: HighlightBackend = microLighter();
