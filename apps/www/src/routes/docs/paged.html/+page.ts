// Route policy for /docs/paged.html (print-pipeline, 2026-08-30 —
// the page is now a NORMAL docs page: the layout toc rail serves it
// like every other /docs page; the PRINT ToC is a different thing —
// a nav the clone transform injects, its folios BACKFILLED by the
// pipeline: fillTocFolios stamps data-jx-folio once the layout has
// placed every section, and the kernel renders content:
// attr(data-jx-folio) — pagedjs's own target-counter resolver loses
// targets moved by keep-with-next — never a web component). The
// prerender entry '/docs/paged.html' already sits in svelte.config.js.
//
// printConfig: RETIRED as a page override (Owner acceptance r5,
// 2026-09-01) — the docs layout's default IS the convention now (the
// brand icon + running doc/section heads, the composed centered
// folio); the pilot adopts it like every other page instead of
// pinning the pre-convention grammar.
import type { TocSection } from '$lib/ui/toc/toc.svelte';

const toc: TocSection[] = [
  { id: 'transaction', label: 'The transaction' },
  { id: 'animation', label: 'Animation protocol' },
  { id: 'stylesheet', label: 'Three sources, one kernel' },
  { id: 'verbs', label: 'Print verbs & whitelist' },
  { id: 'gutter', label: 'Line wrapping & gutter' },
  { id: 'toc', label: 'The injected ToC page' },
];

export const load = () => ({ toc });
