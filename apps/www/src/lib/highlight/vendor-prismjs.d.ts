/**
 * Vendor ambient types for the prismjs highlight backend
 * (lib/highlight/vendor-prismjs.d.ts, highlight-engine-matrix, 2026-09-06 —
 * split out of the old shared vendor.d.ts so the per-engine registry items
 * each carry exactly their own vendor surface).
 *
 * prismjs' component and theme files are untyped side-effect modules.
 * Declared here, scoped to the exact specifiers the backend imports —
 * nothing global beyond them.
 */

declare module 'prismjs/components/prism-*';

declare module 'prismjs/themes/*';
