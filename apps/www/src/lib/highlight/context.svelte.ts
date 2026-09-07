/**
 * The highlight default-backend context (lib/highlight/context.svelte.ts,
 * highlight-backend-pluggable, 2026-09-02) — the kernel side of the
 * CodeCard backend seam.
 *
 * Owner requirement (r9 acceptance, printing §3): the default highlight
 * library (Shiki | Prism.js | MicroLighter) is "只是一个默认的值" — a
 * pure runtime value, provided through the context-plugin kernel so it
 * is settable at ANY subtree root AND switchable live at runtime:
 *
 *   <script>   import { createHighlightContext } from '$lib/highlight/context.svelte';
 *              import { prismjs } from '$lib/highlight/prismjs';
 *              const highlight = createHighlightContext(prismjs()); </script>
 *   <CodeCard code={sample} />              ← eats the prism default
 *   <CodeCard code={sample} backend={shiki()} />  ← prop beats context
 *   highlight.set(microLighter())           ← live switch, cards repaint
 *
 * The endorsement follows the hue precedent exactly: a ContextDef +
 * withPlugins pipeline captured at the providing component's init
 * (provide-time chain capture), a getter-backed read-only projection
 * for consumers, and setRaw as the app's write channel. With zero
 * plugins this is the identity fast path — no chain is built.
 *
 * THE PLUGIN PAYOFF (available to the app layer, deliberately not
 * built here): a plugin targeting HIGHLIGHT_DEF can gate on env.medium —
 * e.g. a print plugin whose filter is isPrintProjection(env.medium)
 * and whose before() returns a MARKUP backend would repair the one
 * known limitation of range backends under the print pipeline's DOM
 * freeze (see microlighter.ts). That composition belongs to the app,
 * never hardcoded in the card.
 */

import { getContext, setContext } from 'svelte';
import {
  defineContextDef,
  getContextPlugins,
  withPlugins,
  type ContextDef,
  type PluginPipeline,
} from '../context-plugin.svelte';
import { DEFAULT_SHIKI_BACKEND } from './shiki';
import { HIGHLIGHT_KEY, type HighlightContextValue } from './context-key';
import {
  HIGHLIGHT_DETECT_KEY,
  type HighlightDetectContextValue,
} from './context-key';
import type { HighlightBackend } from './backend';
import type { LanguageDetector } from './lang-detector';

/** The def: an opinion value domain (unlike the read-only medium). A
 *  factory product since context-plugin-v2 — plugins bind THIS
 *  object's identity, never the 'highlight' string. */
export const HIGHLIGHT_DEF: ContextDef<'highlight', HighlightBackend> = defineContextDef({
  key: 'highlight',
  defaults: () => DEFAULT_SHIKI_BACKEND,
  ssrSafe: DEFAULT_SHIKI_BACKEND,
});

/** The app-facing context API: read the projection, write the raw. */
export interface HighlightContext extends HighlightContextValue {
  /**
   * Switch the default backend at runtime — every card without an
   * explicit backend prop repaints through its highlight effect (the
   * pipeline's exposed projection is reactive end to end).
   */
  set(backend: HighlightBackend): void;
}

/**
 * Create (and provide) the highlight default-backend context. MUST run
 * during a component's initialisation (the app root layout, a page, or
 * any subtree root) so the plugin chain visible there is captured
 * once — the kernel's provide-time capture coordinate. Omit the
 * argument to provide the stock shiki default explicitly.
 */
export function createHighlightContext(initial?: HighlightBackend): HighlightContext {
  const pipeline: PluginPipeline<HighlightBackend> = withPlugins(
    HIGHLIGHT_DEF,
    getContextPlugins(),
  );
  if (initial !== undefined) pipeline.setRaw(initial);

  const context: HighlightContext = {
    get backend(): HighlightBackend {
      return pipeline.exposed;
    },
    set(backend: HighlightBackend): void {
      pipeline.setRaw(backend);
    },
  };
  setContext(HIGHLIGHT_KEY, context);
  return context;
}

/**
 * The nearest provider's context — undefined inside a component window
 * with no provider around (the card then falls back to the stock shiki
 * default). The window is a HARD CONTRACT (context-plugin-v2 D3-C):
 * outside component initialisation Svelte's own
 * `lifecycle_outside_component` propagates — never caught, never
 * normalized. (CodeCard itself never rides this function — it reads
 * HIGHLIGHT_KEY directly, always in-window.)
 */
export function getHighlightContext(): HighlightContext | undefined {
  return getContext<HighlightContext | undefined>(HIGHLIGHT_KEY);
}

/**
 * The detect def (highlight-lang-detector, 2026-09-07 — design D8.2): the
 * kernel-side half of the SECOND orthogonal seam. The pipeline value is
 * `LanguageDetector | undefined` — undefined means "no opinion" (defaults
 * and ssrSafe both undefined: detection is a runtime behavior, there is
 * no DEFAULT_SHIKI_BACKEND counterpart; an empty tail falls to the
 * backend.detector ring, per the card's three-ring chain).
 *
 * The site form of "wire the DLD as the subtree default": a plugin may
 * also target this def to project ANY detector (e.g. betlangDetector as
 * the site-wide statistical opinion, overriding engines' own slots while
 * the card's explicit langDetector prop always wins).
 */
export const HIGHLIGHT_DETECT_DEF: ContextDef<
  'highlight-detect',
  LanguageDetector | undefined
> = defineContextDef({
  key: 'highlight-detect',
  defaults: () => undefined,
  ssrSafe: undefined,
});

/** The app-facing detect context API: read the projection, write the raw. */
export interface HighlightDetectContext extends HighlightDetectContextValue {
  /** Switch the default detector at runtime — every `lang="auto"` card in
   * the subtree re-runs its detection chain through the effect. */
  set(detector: LanguageDetector): void;
}

/**
 * Create (and provide) the default-detector context. MUST run during a
 * component's initialisation (any subtree root); omit the argument to
 * provide an explicitly-empty detect default. The stored context value is
 * the { detector } adapter — the same shape the wrapper item and
 * hand-written setContext produce (the three-write-path unity law).
 */
export function createHighlightDetectContext(
  initial?: LanguageDetector,
): HighlightDetectContext {
  const pipeline: PluginPipeline<LanguageDetector | undefined> = withPlugins(
    HIGHLIGHT_DETECT_DEF,
    getContextPlugins(),
  );
  if (initial !== undefined) pipeline.setRaw(initial);

  const context: HighlightDetectContext = {
    get detector(): LanguageDetector | undefined {
      return pipeline.exposed;
    },
    set(detector: LanguageDetector): void {
      pipeline.setRaw(detector);
    },
  };
  setContext(HIGHLIGHT_DETECT_KEY, context);
  return context;
}
