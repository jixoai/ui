# print-pipeline Specification

## Purpose
TBD - created by archiving change 2026-08-30-print-pipeline. Update Purpose after archive.

## Requirements

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
keeps its screen value). The default section card is PURELY
typographic on paper (Owner, 2026-09-03): no frame, no background,
no shadow, and no block-end hairline of its own — the ONE line a
card needs is the header separator, and it is a LAYOUT element, not
a border: the header zone's authored border-b RETIRES, and a
standard separator rides its own 1px track (the Dialog grid's row
pattern — Separator instances in dedicated tracks spanning
edge-to-edge while the content zones pad themselves; on paper the
track is a flow ::after of the header zone, since a display:grid
section would swallow pagedjs fragmentation of taller-than-page
cards — the r7 flex lesson). The separator carries the separator
component's own ink engine (the contrast ghost — one ink, zero
tokens; Chromium's print pipeline rasterizes backdrop-filter into
the exported PDF, so the sim sheet and the paper agree), and the
header zone is keyed on the avoid stamp (the keep chain's
consumption mark) rather than :first-child — a section split across
pages rebuilds continuation halves whose first div is the BODY, and
a positional key would grow ghost separators on body continuations.
The card's CHILD padding flattens on the INLINE axis only: text
stays flush with the page frame (paper is the frame), while the
authored BLOCK padding rides as the rhythm around the separator
track. Page
breaks SHALL follow the declared keep chain (EVERY heading level
h1–h6 — a component table's h4 strands exactly like a section's h2;
a card's header block; a code card's head strip keep with what
follows; a code card's foot never opens a page alone) consumed by
pagedjs, PLUS a finished-layout enforcement pass that mends TWO
strand shapes — bounded by two laws.

The STRAND mend relocates an uncut keep carrier ending a page into
its NEAREST split-continuation ancestor half: the carrier's own host
when that split (the classic mend, prepended at the continuation's
head), else the deepest ancestor that did — the ended-whole shape (a
heading whose wrapper ended whole at the page bottom has no
continuation of its own; it rides into the ancestor's half
immediately before its document-order successor, the half's first
visible child). CUT-awareness is BOUNDED AT THE CARRIER: a cut
marker strictly below an UNcut carrier would tear the card, so the
pass breaks the round (a whole-chain scan would see the host's
marker on every strand and silently disable the pass — the r5
pre-review caught exactly that: a stranded figcaption shipped over
~338px of dead space with the pass pinned at zero). The REJOIN mend
covers the cut carrier itself (the heading strand's dominant real
shape: a section header's eyebrow, or eyebrow+title, shipped at a
page bottom while the rest moved on — pagedjs cut the avoid block
across the page edge): the halves share a data-ref, so the cut
half's CHILDREN reunite into the pair's head and the emptied half
drops — rejoining is the ONE legal move on a cut (relocating a cut
half elsewhere stays forbidden), and nested halves below the cut
carrier are reunion content, not tears. A move that orphans a split
marker SHALL heal it (a continuation whose predecessor left the
document draws a "continued" dash at a seam that no longer exists —
a reunited header would carry a hairline through its middle).

Both mends are SATISFIABILITY-bounded: they happen only when the
target page can host the move — LEAF-measured room below its
rendered content (pagedjs's rebuilt wrappers inherit the area's full
height and touch its bottom edge on every page; an any-element scan
reads zero room forever and exempts every candidate, silencing the
pass a second way — codex r6, confirmed by live probe: any-element
bottom 100% of the area vs leaf bottom 49-98%); a block whose
block-plus-follower exceeds every page's remainder is the least-bad
break pagedjs already chose — forcing it would push content past the
page box (the pass does not re-chunk), so it ships as the cut and
the gate exempts it. A relocation also re-examines its page: the
move exposes a new bottom edge that may itself strand.

The enforcement pass runs on SETTLED geometry and may run AGAIN after
ready: pagedjs chunks incrementally and its flow promise can resolve
while a late re-chunk tail still re-slots split halves without
observable mutations (the live probe watched a cut eyebrow half sit
mutation-quiet for 100ms at a mid-page slot, then ride 942px to its
resting page-bottom slot) — so the flight waits for a
mutation-quiet, signature-stable, minimum-duration settle, sweeps
mend-then-resettle (capped), and arms ONE post-ready mend at the
flight's tail (generation + artifact-identity guarded; a mend
re-derives the dash layers, the running-head string variables — a
moved h2 changes what a page's head names — and the ToC folios,
then republishes the artifact metadata).

#### Scenario: the header separator is a standard layout track

- GIVEN a default section card rendered into the pages
- WHEN the projection applies
- THEN the section carries no frame and no end hairline, the header
  zone's authored border-b is retired, and a 1px contrast-ghost
  separator track rides below the header content (edge-to-edge,
  rasterized into the exported PDF) — while a section's BODY
  continuation half grows no separator of its own

#### Scenario: a split through a stamped head's card

- GIVEN a tall card whose first div carries break-after: avoid and
  whose body splits across a page boundary
- WHEN the enforcement pass runs
- THEN the pass leaves the cut half alone (the marker sits at or
  below the carrier — its own subtree continues) and no tear occurs

#### Scenario: the classic stranded head over dead space, hosted

- GIVEN an avoid-stamped code card head at a page's bottom with its
  body moved whole to the next page (the host carries the cut
  marker) and the next page's content bottom leaves room for it
- WHEN the enforcement pass runs
- THEN the head relocates into the host's continuation half and the
  finished layout carries zero strands

#### Scenario: the cut heading block rejoins its pair

- GIVEN a section card whose header block pagedjs CUT at a page
  bottom (the eyebrow, or eyebrow+title, stranded; the h2 and body
  on the next page) and the pair's page has leaf-measured room
- WHEN the enforcement pass runs
- THEN the cut half's children reunite into the pair, the emptied
  half and its wrappers drop, the healed seam draws no dash, and the
  rejoin counter rides the artifact metadata

#### Scenario: the ended-whole heading rides to its successor

- GIVEN a heading whose own wrapper ended whole at a page bottom
  (no continuation of its own) while a deeper ancestor split and
  the successor page has room
- WHEN the enforcement pass runs
- THEN the heading lands immediately before its document-order
  successor inside the ancestor's continuation half

#### Scenario: an unsatisfiable keep is the least-bad break

- GIVEN the same stranded head but the continuation page is already
  full to its content bottom
- WHEN the enforcement pass runs
- THEN the pass leaves the layout alone (no push past the page box)
  and the zero-strands gate exempts the shape

#### Scenario: the late tail is mended after ready

- GIVEN a split half that pagedjs re-slots into its resting position
  after the flight published ready (the re-chunk tail no bounded
  settle caught)
- WHEN the post-ready mend runs on the rested layout
- THEN the strand/rejoin detection mends what fits and republishes
  the metadata — the verify gate reads the RESTED artifact only

### Requirement: the continuation dash is a block judgment

pagedjs marks the WHOLE rebuilt ancestor chain at a cut, and every
page boundary cuts some chain — so a per-element "innermost owns the
dash" rule draws a hairline at nearly every page turn, even where
plain flow simply continues (the page break itself is the signal).
The dashed continuation marker SHALL be a BLOCK judgment (Owner
directive, 2026-09-03, corrected same day): the criterion is the
border the PRINT PROJECTION carries, not the screen's. It draws ONLY
for a page cut through a block that keeps its box on paper — a code
card (its head/foot strips survive the borderless projection and the
card reads as a discrete block) and the boxed section opt-out
(`section.bg-card[data-jx-print='boxed']`, authored 1px frame). The
DEFAULT section card does NOT qualify (paper is the frame — its
bottom hairline is a separator, not a box), row-ruled tables ride
their own row hairlines, and plain flow needs no marker: none of
them dash. The pipeline stamps `data-jx-split-dash` on every cut
HALF of the qualifying block (a card spanning three pages dashes
each cut side it owns); the kernel keys the dashed rule on the stamp
alone. The r3/r4 companion laws hold: ancestor layers at a cut still
suppress their OWN authored borders there (`data-jx-split-outer` —
an outer hairline at a cut edge says "this ends here" while content
continues, and stacking it 1px from the dash is the doubled-cut
bug), and ONE dash per cut edge holds — nested qualifying blocks cut
at the same page bottom collapse to the INNERMOST block, the visible
object being cut. A healed or reunited seam draws nothing.

#### Scenario: a code card fragments across pages

- GIVEN a code card taller than one page, fragmenting across a page
  boundary
- WHEN the dash pass runs
- THEN the card's halves carry the stamp and the dashed edge draws
  at the cut — and nothing else in that cut's ancestor chain draws

#### Scenario: plain flow crosses a page turn

- GIVEN a page break falling through ordinary prose and wrapper
  blocks (no print-boxed block in the cut chain)
- WHEN the dash pass runs
- THEN no dashed edge draws anywhere on either page

#### Scenario: the default borderless section card cuts without a dash

- GIVEN a page bottom cutting a default (non-boxed) section card —
  the projection carries only its bottom separator hairline
- WHEN the dash pass runs
- THEN no dashed edge draws (paper is the frame; the section is not
  a box in the preview)

#### Scenario: nested qualifying blocks collapse to the innermost

- GIVEN a page bottom cutting a boxed section whose inner code card
  is also cut at the same edge
- WHEN the dash pass runs
- THEN only the code card's half draws (the innermost block — the
  visible object being cut), one dashed line at the edge

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

### Requirement: the print projection renders in a declared theme scope, light by default

Paper is a physical material: the print projection SHALL render in a
DECLARED theme scope regardless of the live document's theme. The
default is the LIGHT scope (`jx-light` + `color-scheme: light` on the
pipeline-owned output root); only an explicit `theme: 'dark'` in the
page's PrintPageConfig declares the dark exception (black paper, light
ink). The stamp is idempotent per flight, and the theme rides the
artifact's stylesheet hash so a theme-only change rebuilds.

#### Scenario: a dark site prints dark ink on white paper

- GIVEN the site is in dark mode (html carries `.dark`)
- WHEN any print exit runs without a theme declaration
- THEN the output root carries the light stamp (`data-print-theme="light"`,
  the `jx-light` scope class, inline `color-scheme: light`) and every
  token-derived ink inside the pages resolves in the light palette;
  the `<html>` element itself is never touched (no screen flash, no
  theme-toggle race)

#### Scenario: the declared dark exception

- GIVEN a page declaring `printConfig.theme = 'dark'`
- WHEN a print exit runs (light or dark site, either)
- THEN the output root carries the dark stamp and the kernel's
  dark-paper family applies: `print-color-adjust: exact` on the
  stamped root (inherited down the whole ink chain) and the paged
  sheets paint `var(--background)` as the paper ground, in sim and
  in real print alike

#### Scenario: the grammar rejects an unknown theme

- GIVEN a printConfig carrying any theme value other than
  `'light' | 'dark'`
- WHEN the flight parses the config
- THEN the flight fails loud with a PageConfigError naming the field
  and nothing renders

### Requirement: a light declaration retires dark-variant utilities from the clone

The `dark:` Tailwind variant keys off `.dark` ANCESTRY and no scope
class can turn it off. Under a LIGHT declaration the pipeline SHALL
retire every `dark:`-prefixed class from the frozen clone (the clone
is the product; the live tree is never touched); under a DARK
declaration they SHALL stay (they are the adaptation). Class tokens
that merely contain `dark:` mid-name are not variants and stay.

#### Scenario: inline-code chips on paper

- GIVEN a docs page whose prose carries inline-code chips (plain
  light `--tok-*` utilities + `dark:[--tok-*]` overrides) and the
  site is dark
- WHEN a light-declared flight clones the content
- THEN the clone's chips keep their plain utilities and carry zero
  `dark:` classes, so the printed code ink is the light palette

### Requirement: the light scope re-flips CSS-scoped dark adaptations

Where a component sheet adapts to dark via a `.dark <descendant>`
CSS override, the same sheet SHALL re-declare the light formulas
under the `.jx-light <descendant>` scope, placed AFTER the dark
override (source order is the verdict at equal `:where()` weight).
The re-flip is required wherever the dark override carries literal
light-mix values (e.g. `oklch(1 0 0)`) that would wash out on white
paper.

#### Scenario: the code card's Shiki palette under a forced-light artifact

- GIVEN code-card.css declares `--tok-*` on `.jx-code-card` with a
  `.dark .jx-code-card` override (its function/meta colors mix toward
  literal white)
- WHEN a light-declared artifact renders under a dark document
- THEN the card's computed `--tok-token-function` carries the light
  formula — no `oklch(1 0 0)` literal survives — and nested dark
  islands (a canvas dark stage) still resolve dark ink through the
  formulas' lazy var() substitution

### Requirement: the print kernel stays theme-agnostic

kernel-print.css SHALL carry no theme-scope selectors (`.dark`,
`.jx-light`) and no light-branch rules: the theme sheet's own scope
classes and the pipeline stamp carry the light default. The only
theme-keyed rules the kernel owns are the DECLARED-dark paper family
(`print-color-adjust: exact` + the sheet ground), keyed on
`[data-print-theme='dark']` — one rule family for the exception,
zero for the default.

#### Scenario: the gate holds the kernel's theme-agnosticism

- WHEN the stylesheet gate parses kernel-print.css
- THEN the dark-paper family's two rules are present verbatim, and no
  `data-print-theme='light'`, `.dark` or `.jx-light` selector exists
  anywhere in the file
