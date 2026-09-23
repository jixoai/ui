# TASK 34 — CODE progress (vellum)

Tier 2 (优化重构). Gates green. NO commits — two files changed:
`apps/www/src/routes/docs/components/progress.html/+page.svelte` + `+page.ts`.

## Tier decision — gap analysis

Tier 2, not 1: the 179-line page had the native-element story and a live dock but
violated the archetype structurally — no install/overview/see-also, no measured axes
table, no query() seat, toc missing universal-props with accessibility/theming ahead
of the api trio, a prose-y unmeasured TokenTable, and an a11y table missing the
indeterminate-valuenow nuance plus the generic-name anchoring note. Tier 2, not 3:
the native-element story is the family's core and was already right.

## What changed

1. **Archetype rebuild**: hero (h1 ×1) → `#install` → `#overview` (the native
   semantics + the two clocks + the frozen-ink seam, law-notes folded) →
   `#live-demo` (dock, playground) → `#progress-base` (the W3C foundation, kept) →
   `#types` → `#usage` → `#theming` (DensityDemo **5-rung ladder incl. 2xs** +
   measured TokenTable) → `#api` → `#universal-props` (measured axes table +
   receipts + query() seat + specimens) → `#accessibility` → `#see-also`.
   toc == DOM, chrome out, trio LAST (probe PASS). **The dispatch's duplicate-id
   lesson applied as a hard assert**: a page-wide id scan (section ids AND all
   id attributes) reports zero duplicates.
2. **Axes table**: 8 measured/grepped rows (below), including the density
   paint-invariance finding and the two-clock motion verdict.
3. **query() seat**: `query({ md: 18 }, 13)` on the size lane (number lane bare);
   measured both sides of 48rem.
4. **cx predicate fix** (fleet law) applied to the page's join.

## Measurements (probe receipts, served DOM at 5242)

- **TWO CLOCKS, and only one is real (LAW #14 receipts)**:
  - *Indeterminate clock — ALIVE*: `jx-progress-run` sweep measured 0.9s / linear /
    infinite with a 24px tile (repeating-linear-gradient brand stripe on a
    transparent ground); under prefers-reduced-motion the duration is forced to 4s
    (measured via media emulation).
  - *Value clock — INERT IN CHROMIUM*: the css authors a 200ms cubic-bezier(0.22, 1,
    0.36, 1) width transition on `::-webkit-progress-value`, but the fill edge
    measured jumping 10% → 87% WITHIN THE FIRST SCREENSHOT FRAME in normal AND
    reduced modes (pixel sampling of the bar row: saturated-fill vs gray-track
    columns). Chromium does not transition engine-managed pseudo widths. The docs
    now state the determinate bar reports position discretely. (Measurement note:
    getComputedStyle with `::-webkit-progress-value` falls back to the ELEMENT's
    styles in Chromium — the first probe's "transition 0s / fill = track color"
    reads were artifacts; the pixel method is the truth instrument.)
- **Theme — THE FROZEN-INK SEAM, THIRD INSTANCE (measured)**: under .dark on the
  field root the FILL re-derives (the pseudo paints var(--primary), a live legacy
  chain: oklch(0.6489-family) → 0.7044-family) while the track (--jx-muted atom),
  the 1px frame (--jx-border atom) and the label/value readout inks
  (--jx-muted-foreground / --jx-foreground atoms measured oklch(0.3211 0 0) on both
  sides) keep their LIGHT literals — a brand stripe on a light track under dark.
- **Density is managed but PAINT-INVARIANT**: the height equation
  `calc(var(--jx-unit) * 2.5)` reads the FIXED 4px unit — measured 10px at every
  rung including the 2xs stamp; the readout label voice measured 12px constant.
- **Radius = own promotion seam**: `var(--progress-radius, 4px)` measured 4px
  ambient; stamped 9px → 9px live; the radius AXIS is unread (grep: zero
  radius-effective readers).
- **Native a11y mapping (measured)**: implicit progressbar; determinate position
  0.42 with aria-label "deploy"; indeterminate position −1 with valuenow omitted;
  at max=250/value=100 the platform serves valuenow=100; the % readout carries
  `role=status` (measured "42%"). The aria-label fallback is the generic
  "progress" — the anchoring note is now in the a11y table.
- **Grep receipts**: zero readers of size/color/shape/radius/elevation/
  motion-effective carriers in ui/progress/ — five axes supply-only, one seam.
- **Served rows**: api hand table = value, max, label, class (density folds into
  the universal fold's 8 rows). No matrix pins exist for progress — no re-pin.

## Gates

- `verify:tailwindless` — ✓ GREEN, receipt VERBATIM: `files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42`.
- `verify:docs` — ✓ "all docs pages pass the skeleton lint (staged scope green)".
- `verify:docs-universal` — ✓ "GREEN: 110/110 component pages render the shared
  universal section (110 markers)".
- svelte-check page-scoped — ✓ ZERO diagnostics on
  `routes/docs/components/progress.html/+page.svelte|+page.ts`.
- Specs post-edit, one run: **7 files / 427 passed** (ambient 284,
  batch2-components, defaults-overlays, timeline-value, progressive-blur,
  print-freeze, docs-nav-filter). Baselines BEFORE edits: same suites 427/427.

## Port discipline

lsof :5242 rc=1 before; vite wrapper 84188 / listener 84220 captured; killed by PID
at teardown; lsof rc=1 and `pgrep -lf "vite --port 5242"` empty after. Probes in
/tmp (vellum-34-progress-{probe,pixels,clock}.mjs). NO commits. Siblings' in-flight
files (quill's scroll-virtual, scribe's menubar review, marginalia's number-input
review) never touched.

## Open questions for the reviewers

1. **The inert fill transition**: the authored 200ms cubic-bezier on
   `::-webkit-progress-value` cannot transition in Chromium (engine pseudo width).
   Options: (a) accept the discrete value clock and drop the dead declaration,
   (b) re-author the fill as a REAL div width (transitionable) behind the element —
   a family change with registry implications. The docs currently state the
   measured truth; the family decision is the Owner's.
2. **The frozen-ink seam's third instance**: track/frame/readout inks stay light
   under .dark (only the fill re-derives). If scribe concurs on menubar's
   triggerOpen candidate, progress's atom set (muted/border/muted-foreground/
   foreground) joins the same W-next entry — the pattern fix (re-declare the four
   atoms in the dark scope, or stamp tokenScope) would cover all three families.
3. **The generic "progress" aria-label fallback**: with two unlabeled bars on one
   page, AT users hear two identical names. An id-derived or context label could
   disambiguate — docs note shipped; family change optional.
4. **`--progress-radius` seam naming**: it is consumer-overridable (measured 9px
   stamped live) — worth promoting to a documented token row on the tokens page?
