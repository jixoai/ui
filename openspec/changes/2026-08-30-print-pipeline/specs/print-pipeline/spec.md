# print-pipeline delta — one pipeline, two exits, zero web change

## ADDED Requirements

### Requirement: existing pages render unchanged on the web

The print layer SHALL attach via the docs layout without altering any
page's web rendering (normal flow, same DOM); the full existing suite
is the regression proof. Print optimization is projection-only.

#### Scenario: a docs page without print intent

- GIVEN any docs page with the print layer attached
- WHEN rendered on screen
- THEN the DOM and styles match the pre-layer page byte-for-byte

### Requirement: one pipeline serves sim and real print

Both exits SHALL share the path: medium derivation → print context
plugin (immutable interventions on live contexts) → readiness gate
(fonts + images, fail-loud on timeout) → deep clone → clone-only
transforms (animation pause, pre→line spans, ToC-page nav injection)
→ paged.js preview. Real print additionally hides the app root under
print media and calls window.print(). The sim stylesheet (`@media
not print`) SHALL never be fed to the kernel.

#### Scenario: sim then real print agree

- GIVEN the same page and config
- WHEN sim runs and when real print runs
- THEN both outputs come from the same chunked artifact with the same
  @page rules — headers, footers and ToC page numbers are real

### Requirement: clone transforms never touch the live DOM

All transforms (animation pause CSS injection, line-span splitting,
the ToC-page nav) SHALL operate on the clone only; the live tree's
contexts re-derive back on exit (afterprint / sim off) and the clone
is destroyed.

#### Scenario: exiting sim

- WHEN sim turns off
- THEN the clone is removed and density/hue/motion read their
  pre-sim values again

### Requirement: headers, footers and the ToC page are kernel-real

Page headers/footers SHALL come from @page margin boxes (string-set /
counter(page) / counter(pages)) driven by the PrintPageConfig; the
print ToC page SHALL be injected into the clone as a nav whose entries
resolve through target-counter to real page numbers. The web ToC is
the site's existing one — no parallel component survives.

#### Scenario: a customized footer

- GIVEN footer: { end: 'counter(pages)' }
- WHEN the pipeline renders
- THEN every page's bottom margin box shows N/total with the real
  kernel-computed total

### Requirement: pagedjs is vendored, lazy and client-only

The dependency SHALL be pinned (0.5.0-beta.2) with a lockfile audit
note; the kernel SHALL load as a lazy client chunk with zero SSR path.

#### Scenario: SSR/prerender

- WHEN the site builds
- THEN no pagedjs code appears in any server/prerender bundle
