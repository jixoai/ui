# print-pipeline delta — one pipeline, two exits, zero web change

## ADDED Requirements

### Requirement: existing pages render unchanged on the web

The print layer SHALL attach via the docs layout without altering any
page's web rendering (normal flow, same DOM); the full existing suite
is the regression proof. Print optimization is projection-only.

#### Scenario: a docs page without print intent

- GIVEN any docs page with the print layer attached
- WHEN rendered on screen
- THEN the docs content root renders its normal flow with its authored
  styles unchanged; the layout-owned print controls and the print
  output sibling are the declared, sanctioned additions

### Requirement: prepareSnapshot is a transaction with a commit barrier

The pipeline SHALL run as one `prepareSnapshot()` transaction: medium
derivation → print plugin interventions landing on the live tree
(density/hue stamps) → document.getAnimations() paused → a DOM-commit
barrier (double-rAF plus fail-loud assertions that the source root
carries the intervened stamps) → readiness gate (fonts ready, lazy
loading lifted, images decoded, timeout budget with progress and
cancel) → deep clone of the immutable source root → clone-only
transforms → live animations resumed. Exiting (sim off / after
printing) SHALL restore the live tree exactly to raw values.

#### Scenario: the barrier catches a late intervention

- GIVEN a plugin intervention whose DOM stamp has not committed
- WHEN prepareSnapshot reaches the barrier
- THEN it fails loudly instead of cloning a half-intervened tree

### Requirement: one pipeline serves sim and real print

Both exits SHALL share the same completed artifact (owned by the
pipeline; valid while the frozen-snapshot hash and stylesheet hash
hold, rebuilt from the same snapshot otherwise): prepareSnapshot →
clone-only transforms (animation pause, pre→line spans, ToC-page nav
injection) → paged.js preview into the document-connected output
sibling. Real print additionally hides the app root under print media
and calls window.print() only after prepareSnapshot completes (the
browser's native Ctrl+P is a documented degraded path, not the
contract). The sim stylesheet (`@media not print`) SHALL never reach
the kernel — enforced by an AST gate on the kernel stylesheet and a
runtime spy on the preview() inputs.

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

### Requirement: page config is a constrained grammar

PrintPageConfig SHALL accept structured values (named sizes or
number+unit pairs, enum marks/header-footer tokens) validated before
compilation; invalid input is rejected, never string-concatenated
into CSS.

#### Scenario: an invalid margin

- GIVEN margin: { top: -1, unit: 'mm' }
- WHEN the config compiles
- THEN the validator rejects it and no @page rule is emitted

### Requirement: the parallel Paged* family retires completely

The retirement SHALL follow the transfer table (including PagedCode,
the registry, and both legacy stylesheets), gates rewritten before
deletion, ending with zero-reference assertions over the source tree,
barrel exports, manifests and tests.

#### Scenario: after retirement

- WHEN any import or style references PagedDoc or lib/paged
- THEN the zero-reference gate fails
