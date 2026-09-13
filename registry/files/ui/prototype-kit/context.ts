/**
 * prototype-kit context (registry/files/ui/prototype-kit/context.ts).
 *
 * Orthogonal intents:
 * 1. The ONE context key carrying the prototype-folder name from a
 *    PrototypeCanvas to its descendant frames (design-studio change,
 *     2026-09-11) — getter-backed so a nested canvas re-providing a
 *     different name re-derives descendant URLs in the same frame.
 * 2. The design-host detection seam: frames depend on the design
 *    server (`/__design__/frame`); outside it they render the visible
 *     "requires the design server" notice. Detection is two-channel —
 *     a vite env flag (`VITE_JIXOAI_DESIGN=1`, set by the synthesized
 *     design vite config) OR `window.__jixoaiDesignHost` (set by the
 *     design server's canvas-page shell). Either marks the host.
 *
 * Original requirement input: Owner 2026-09-11 — the prototype
 * standard (canvas/page/component trio) as part of `jixoai-ui design`.
 */

/** the frame theme vocabulary: which token class the frame document
 *  root carries (`auto` = none, follow the host) */
export type PrototypeTheme = 'light' | 'dark' | 'auto';

/** context payload — ONE getter-backed field (the zone-scope
 *  precedent: `{ get variant() }`), never a snapshot; reads re-evaluate
 *  through the providing canvas's derived signal */
export interface PrototypeKitContext {
  readonly prototype: string | undefined;
}

import { getContext } from 'svelte';

/** the single context key of the kit (module-private by convention —
 *  frames and canvases of THIS folder are the only readers/writers) */
export const PROTOTYPE_KIT_KEY: symbol = Symbol('jixoai-prototype-kit');

/** read the nearest canvas context, if any (frames use this; absent
 *  context = the frame is mounted outside a canvas) */
export function getPrototypeContext(): PrototypeKitContext | undefined {
  return getContext<PrototypeKitContext | undefined>(PROTOTYPE_KIT_KEY);
}

// ---- design-host detection ---------------------------------------------

declare global {
  interface Window {
    /** set to true by the design server's canvas-page shell (the
     *     injection channel that needs no vite config coupling) */
    __jixoaiDesignHost?: boolean;
  }
}

/** import.meta.env narrowing without any: vite-typed ImportMeta may
 *  or may not carry env depending on the host's tsconfig — the kit
 *  reads it structurally, one string-keyed channel. */
type ImportMetaWithEnv = ImportMeta & {
  env?: Record<string, string | boolean | undefined>;
};

/** true when running inside the design server host (canvas pages it
 *  serves, or any host that sets the env flag) */
export function hasDesignHost(): boolean {
  const env = (import.meta as ImportMetaWithEnv).env;
  if (env?.VITE_JIXOAI_DESIGN === '1' || env?.VITE_JIXOAI_DESIGN === true) {
    return true;
  }
  return typeof window !== 'undefined' && window.__jixoaiDesignHost === true;
}

// ---- studio-embed detection (#24) ----------------------------------------

declare global {
  interface Window {
    /** set by the canvas entry when the studio embeds the page
     *     (?studio=1) — the natural-size + metrics + wheel-relay mode */
    __jixoaiDesignStudio?: boolean;
  }
}

/**
 * True inside the design STUDIO's canvas embed (#24, 2026-09-12): the
 * studio appends ?studio=1 and the canvas entry sets this flag. In
 * studio mode the kit renders the matrix at NATURAL size (max-content
 * tracks, frame scale 1) and the document reports its metrics +
 * relays ⌘/Ctrl+wheel to the studio — the stage's camera (zoom/pan/
 * auto-fit) takes over as the one view-scaling authority. Standalone
 * canvas pages keep the responsive scale-to-fit regime untouched.
 */
export function isStudioHost(): boolean {
  return typeof window !== 'undefined' && window.__jixoaiDesignStudio === true;
}

/** dev-mode gate for the id-conflict warning (vite DEV flag; vitest
 *  runs under vite so the warning stays test-assertable) */
export function isDevMode(): boolean {
  const env = (import.meta as ImportMetaWithEnv).env;
  return env?.DEV === true || env?.DEV === 'true';
}

/** derive the prototype folder name from a design-server canvas page
 *  URL (`/prototypes/<name>/…`); undefined elsewhere — the top-level
 *  canvas fallback when no explicit prop and no inherited context */
export function derivePrototypeFromLocation(): string | undefined {
  if (typeof location === 'undefined') return undefined;
  const match = location.pathname.match(/^\/prototypes\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}
