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
 * built here): a plugin targeting 'highlight' can gate on env.medium —
 * e.g. a print plugin whose filter is isPrintProjection(env.medium)
 * and whose before() returns a MARKUP backend would repair the one
 * known limitation of range backends under the print pipeline's DOM
 * freeze (see microlighter.ts). That composition belongs to the app,
 * never hardcoded in the card.
 */

import { getContext, setContext } from 'svelte';
import {
  getContextPlugins,
  withPlugins,
  type ContextDef,
  type PluginPipeline,
} from '../context-plugin.svelte';
import { DEFAULT_SHIKI_BACKEND } from './shiki';
import { HIGHLIGHT_KEY, type HighlightContextValue } from './context-key';
import type { HighlightBackend } from './backend';

/** The def: an opinion value domain (unlike the read-only medium). */
export const HIGHLIGHT_DEF: ContextDef<'highlight', HighlightBackend> = {
  key: 'highlight',
  defaults: () => DEFAULT_SHIKI_BACKEND,
  ssrSafe: DEFAULT_SHIKI_BACKEND,
};

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
 * The nearest provider's context — undefined outside any provider (the
 * card then falls back to the stock shiki default). Safe outside
 * component initialisation (pure unit calls).
 */
export function getHighlightContext(): HighlightContext | undefined {
  try {
    return getContext<HighlightContext | undefined>(HIGHLIGHT_KEY);
  } catch {
    // Svelte throws lifecycle_outside_component when no component
    // context exists — that is simply "no provider around"
    return undefined;
  }
}
