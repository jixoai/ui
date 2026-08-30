// Route policy for /docs/paged.html (paged-doc-family pilot, 2026-08-30).
//
// NO layout toc rail on this route — deliberately: the publication
// page owns its own in-document PagedToC, and the immersive flow
// wants the full composed measure (main column + Tufte margin-note
// column) that a second rail would pinch. `undefined` is the layout's
// documented "no toc" signal.
//
// [INTEGRATOR] prerender entry '/docs/paged.html' belongs in
// svelte.config.js kit.prerender.entries (shared file — reported, not
// edited in this batch).
export const load = () => ({});
