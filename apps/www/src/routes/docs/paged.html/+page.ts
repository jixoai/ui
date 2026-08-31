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
// printConfig: the page grammar the docs layout's print controls
// compile — structured values only (the parser rejects anything
// else); it rides page data so the layer stays ONE wiring for the
// whole tree while each page owns its paper.
import type { TocSection } from '$lib/ui/toc/toc.svelte';
import type { PrintPageConfig } from '$lib/print';

const toc: TocSection[] = [
  { id: 'transaction', label: 'The transaction' },
  { id: 'animation', label: 'Animation protocol' },
  { id: 'stylesheet', label: 'Three sources, one kernel' },
  { id: 'verbs', label: 'Print verbs & whitelist' },
  { id: 'gutter', label: 'Line wrapping & gutter' },
  { id: 'toc', label: 'The injected ToC page' },
];

const printConfig: PrintPageConfig = {
  size: 'A4',
  margin: { top: 18, right: 16, bottom: 18, left: 16, unit: 'mm' },
  footer: { 'bottom-left': 'counter(page)', 'bottom-right': 'counter(pages)' },
};

export const load = () => ({ toc, printConfig });
