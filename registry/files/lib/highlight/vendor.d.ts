/**
 * Vendor ambient types for the highlight backends
 * (lib/highlight/vendor.d.ts, highlight-backend-pluggable, 2026-09-02).
 *
 * microlighter ships no TypeScript declarations; prismjs' component
 * and theme files are untyped side-effect modules. Declared here,
 * scoped to the exact specifiers the backends import — nothing
 * global beyond them.
 */

declare module 'microlighter' {
  export function highlightAll(options?: {
    root?: ParentNode;
    selector?: string;
    languageAliases?: Record<string, string>;
  }): Promise<HTMLElement[]>;
}

declare module 'prismjs/components/prism-*';

declare module 'prismjs/themes/*';
declare module 'microlighter/themes/*';
