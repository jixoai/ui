// Route-level toc policy (firstpaint era, 2026-08-24): the sections
// ship as PAGE DATA — the ROOT LAYOUT renders one rail from
// `page.data.toc` in the scaffold's chrome snippet, and this route
// DELIBERATELY EXPORTS NO LOAD (docs-eight-axes-mdn task 69): no
// page-toc channel here. The aside rail on the page is the COMPONENT
// itself in manual mode — the self-reference decision, named on both
// sides in the page's overview. The channel's data shape (TocSection[]
// — this very interface, exported from toc.svelte) is exhibited in the
// page body as the page-channel sample.
//
// A `load` export returning `{ toc: [...] }` would light the layout
// rail; returning `{ toc: 'outline' }` would self-derive from main#main;
// returning nothing (this file) leaves the route rail-less.
export {};
