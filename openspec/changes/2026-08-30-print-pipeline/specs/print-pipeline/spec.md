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

The pipeline SHALL run as one `prepareSnapshot()` transaction:
preparatory medium signal first (the sim toggle or the direct-print
button stamps the doc, opening the plugin filters — beforeprint is a
real-print signal only, never the async preparation entry; the
transaction records whether IT created the stamp — an existing sim
stamp is reused, not owned) → print
plugin interventions landing on the live tree (density/hue stamps) →
SCOPED animation capture (source-root subtree only via
getAnimations({subtree:true}); per-animation {wasRunning, currentTime}
recorded; ONLY running ones paused — pre-paused animations are never
touched nor resumed) → a DOM-commit barrier (double-rAF plus fail-loud
assertions that the source root carries the intervened stamps) →
readiness gate (fonts ready, lazy loading lifted, images decoded,
timeout budget with progress and cancel) → deep clone of the immutable
source root → clone-only transforms (CSS animation frames transferred
to matching clone elements via negative animation-delay derived from
the recorded currentTime; WAAPI/JS animations are NOT transferable —
the transaction CONTINUES with a structured diagnostic list naming
the unsupported owners, never rejecting; the sim renders it as rows
and direct print records it into the artifact metadata + console) → live animations resumed via an idempotent
restore token that only touches animations this transaction paused.
Exiting (sim off / after printing) SHALL restore the live tree exactly
to raw values and remove the stamp (afterprint).

#### Scenario: the preparatory stamp precedes everything

- GIVEN the direct-print button pressed
- WHEN prepareSnapshot begins
- THEN the doc already carries the stamp (filters open); after
  afterprint only a transaction-owned stamp is removed

#### Scenario: an existing sim survives a direct print

- GIVEN sim active (its stamp present) and direct print pressed
- WHEN afterprint fires
- THEN the transaction removes nothing it did not create and the
  medium re-derives to sim

#### Scenario: CSS frames transfer per slot

- GIVEN an element with two named CSS animations (non-zero original
  delays, different currentTimes, non-alternate, running)
- WHEN the clone is built
- THEN each slot's computed animation-delay equals the design's
  per-slot write rule (delay′ = (c<d) ? (d−c) : −((c−d) mod D)),
  play-state is paused, and the clone's computed phase matches the
  source — asserted under real Chromium in verify-print (jsdom keeps
  only the pure path/slot/math/diagnostic function tests);
  FINISHED/ALTERNATE/UNMATCHED_SLOT/NO_NAME/WAAPI/JS slots ride the
  structured diagnostic row

#### Scenario: a pre-paused animation stays paused

- GIVEN a source animation paused before the transaction
- WHEN prepareSnapshot captures and later restores
- THEN it is neither resumed nor its currentTime disturbed

#### Scenario: WAAPI owners continue with a diagnostic

- GIVEN a WAAPI-driven element inside the source tree
- WHEN the clone is built
- THEN the transaction completes and the sim diagnostic row names the
  unsupported animation owner (no rejection, no throw)

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
and calls window.print() only after prepareSnapshot completes. The
sim stylesheet (`@media not print`) SHALL never reach the kernel —
enforced by an AST gate on the kernel stylesheet and a runtime spy on
the preview() inputs.

#### Scenario: sim then real print agree

- GIVEN the same page and config
- WHEN sim runs and when real print runs
- THEN both outputs come from the same chunked artifact with the same
  @page rules — headers, footers and ToC page numbers are real

### Requirement: a browser-initiated print auto-initializes the pipeline

A print the BROWSER initiates (Ctrl/Cmd+P, the menu, a foreign
window.print) SHALL drive the same transaction the print button
drives. The beforeprint handler SHALL synchronously stamp the print
pose (the app root hides under print media the instant the dialog
opens — the dialog can never print the raw screen), then run the
prepare→preview→standby transaction asynchronously with the layer's
own page grammar (never a fallback default), and SHALL NOT call
window.print (the dialog is already open — a second call would stack
another). afterprint owns the exit under the stamp-ownership law,
including the dialog-closed-early settle (the artifact never outlives
the print that requested it). A beforeprint ours already owns (a
mounted sim artifact, or the pipeline's own in-flight print) is a
no-op. The ambient entry arms with the print layer and survives
dispose (the pipeline keeps serving the next print); only the layer's
unmount disarms it.

#### Scenario: a cold Ctrl/Cmd+P

- GIVEN a docs page at rest (no sim, no prior flight)
- WHEN the browser fires beforeprint as its print dialog opens
- THEN the active stamp lands within the same dispatch, the pages
  mount into the standby output with the layer's configured grammar,
  window.print is never called by the pipeline, and afterprint leaves
  zero residue with the self-stamp released

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

Page headers/footers SHALL come from @page margin boxes driven by the
PrintPageConfig — token SEQUENCES (whitespace-separated) of the two
counters, `string:<name>` reads and balanced quoted literals (the
folio pair `counter(page) " / " counter(pages)` compiles to ONE
content value); the running heads ride string-set sources the kernel
declares on the content (h1→docTitle, h2→sectionTitle — string(name,
first) carries the value across pages), and a `headerIcon`
(site-relative plain path) SHALL be stamped by the pipeline as a real
img into the top-left margin boxes (margin-box content CSS cannot
carry images) — the icon + doc title left, the running section right,
the folio pair centered, corners clipped to ellipsis so an overlong
head never crosses the sheet (Owner r5, the industry-standard
furniture). The print ToC page SHALL be injected into the clone as a
nav whose entries carry real page numbers — the pipeline backfills
each anchor's page from the finished layout onto a data attribute the
stylesheet renders (attr-carried, not target-counter: pagedjs's own
resolver loses targets moved by keep-with-next, and its counter
machinery rewrites author rules; walkthrough r2/r3). The web ToC is
the site's existing one — no parallel component survives.

#### Scenario: the folio pair

- GIVEN footer: { 'bottom-center': 'counter(page) " / " counter(pages)' }
- WHEN the pipeline renders
- THEN every page's bottom-center margin box shows N / total as ONE
  combined content value with the real kernel-computed total

#### Scenario: running heads and the brand icon

- GIVEN headerIcon: '/icon.svg' and top-left/top-right string tokens
- WHEN the pipeline renders
- THEN every content page's top-left shows the loaded icon plus the
  SAME doc title (a page before its first h1 legitimately reads
  empty), the top-right shows the section the page is in, and no
  retired corner slot carries content

### Requirement: print typography is a medium judgment, and the keep chain ends clean

The projection SHALL set paper code leading (~1.2 — the screen's 1.6
rides the clone verbatim and reads airy on paper; the source tree
keeps its screen value), and the borderless card's CHILD inset SHALL
flatten (the page margin is the frame — padding inside it is the
box-in-a-box double whitespace; margins keep the block rhythm). Page
breaks SHALL follow the declared keep chain (headings, a card's
header block, a code card's head strip keep with what follows; a code
card's foot never opens a page alone) consumed by pagedjs, PLUS a
finished-layout enforcement pass that relocates a stranded keep
carrier into its host's continuation half — and a page whose bottom
edge is a CUT (the deepest content's ancestor carries data-split-to)
is never a strand site: the cut itself proves the content continues,
and acting there would tear a card's head into its continuation
(Owner r5: the flattened inset moved a split into a stamped head
div).

#### Scenario: a split through a stamped head's card

- GIVEN a tall card whose first div carries break-after: avoid and
  whose body splits across a page boundary
- WHEN the enforcement pass runs
- THEN the pass leaves the page alone (cut edge — no relocation, no
  torn head) and the finished layout carries zero stranded keeps

### Requirement: pagedjs is vendored, lazy and client-only

The dependency SHALL be pinned (0.5.0-beta.2) with a lockfile audit
note; the kernel SHALL load as a lazy client chunk with zero SSR path.

#### Scenario: SSR/prerender

- WHEN the site builds
- THEN no pagedjs code appears in any server/prerender bundle

#### Scenario: an unmeasurable output root fails loudly

- GIVEN the output sibling hidden with display:none
- WHEN preview is about to run
- THEN the measurability assertion (offsetWidth > 0) fails the
  transaction instead of emitting zero-size pages; cancelling after
  preview entry is best-effort (remove the output root + destroy the
  artifact handle) and the no-residue fixture holds

### Requirement: page config is a constrained grammar

PrintPageConfig SHALL accept structured values (named sizes or
number+unit pairs, enum marks/header-footer tokens — a slot's value
a token sequence whose parts are each validated, so a quoted literal
may carry spaces but no css meta characters; headerIcon a
site-relative plain path) validated before compilation; invalid
input is rejected, never string-concatenated into CSS.

#### Scenario: an invalid margin

- GIVEN margin: { top: -1, unit: 'mm' }
- WHEN the config compiles
- THEN the validator rejects it and no @page rule is emitted

#### Scenario: a broken literal

- GIVEN footer: { 'bottom-center': 'counter(page) " /' }
- WHEN the config compiles
- THEN the validator rejects the unterminated literal part whole

### Requirement: the parallel Paged* family retires completely

The retirement SHALL follow the transfer table (including PagedCode,
the registry, and both legacy stylesheets), gates rewritten before
deletion, ending with zero-reference assertions over the source tree,
barrel exports, manifests and tests.

#### Scenario: after retirement

- WHEN any import or style references PagedDoc or lib/paged
- THEN the zero-reference gate fails
