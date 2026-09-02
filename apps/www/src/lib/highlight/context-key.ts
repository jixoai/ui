/**
 * The highlight context key (lib/highlight/context-key.ts,
 * highlight-backend-pluggable, 2026-09-02).
 *
 * The registry-safe half of the default-backend context: this file is
 * ZERO-DEPENDENCY (no kernel import), so the byte-mirrored CodeCard
 * can read the provided default through plain Svelte context — the
 * density seam's law (a registry item must keep installing whole).
 * The kernel side (def + provide/get + plugin endorsement) lives in
 * context.svelte.ts, a site-only module.
 */

import type { HighlightBackend } from './backend';

/** The context value: the default backend for cards without a backend prop. */
export interface HighlightContextValue {
  /** the chained (plugin-projected) default backend */
  readonly backend: HighlightBackend;
}

export const HIGHLIGHT_KEY = Symbol('jx-highlight-backend');
