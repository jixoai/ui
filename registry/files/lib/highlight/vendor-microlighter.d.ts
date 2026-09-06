/**
 * Vendor ambient types for the microlighter highlight backend
 * (lib/highlight/vendor-microlighter.d.ts, highlight-engine-matrix,
 * 2026-09-06 — split out of the old shared vendor.d.ts so the per-engine
 * registry items each carry exactly their own vendor surface).
 *
 * microlighter ships no TypeScript declarations. Declared here, scoped
 * to the exact specifiers the backend imports — nothing global beyond
 * them.
 */

declare module 'microlighter' {
  export function highlightAll(options?: {
    root?: ParentNode;
    selector?: string;
    languageAliases?: Record<string, string>;
  }): Promise<HTMLElement[]>;
}

declare module 'microlighter/themes/*';
