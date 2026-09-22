# TASK 25 — FIX card-grid + CODE file-input (vellum)

Two parts, one report. No commits, no push.

## Part A — FIX card-grid (scribe's NEEDS-WORK-lite, c389990f)

All three findings fixed and RE-MEASURED (the rig must perform — probe
/tmp/vellum-25-cg-probe.mjs):

1. **MAJOR — the query demo's unmeasurable claim, fixed by the swap**: the
   `<Card>` tenants are gone from the supply-chain canvas, the query() canvas,
   and both usage strings; SectionCard tenants now carry the claim. Re-measured
   on the served page: at 720 (below 48rem) the tenant header padding is
   **8px / 12px** (block/inline, sm rung); at 1024 it is **12px / 16px**
   (default rung) — the corrected prose is LIVE-TRUE. The density axis row now
   quotes scribe's exact ladder — 8px 12px (xs) · 8px 12px (sm) · 12px 16px
   (default) · 12px 20px (lg) — all four re-measured on the theming
   DensityDemo (grid gap 20px at every rung: the inert half holds), and the
   axes summary + deviations note updated to the pairs. The Card-freeze truth
   is stated where the tenants could mislead ("a Card tenant would hold still
   — its chrome is frozen by its own law").
2. **MINOR — the foot row's empty Description**: curation entry added to
   `apps/www/src/lib/ui/props-table/docs/card-grid.docs.ts` with the
   family-header wording; the drift-lock pins updated to the new truth
   (`test/props-table-meta-drift.spec.ts`: the legacy foot row's description +
   the override matrix gains `foot: ['description']`).
3. **NIT — the theme="dark" specimen**: a second canvas ("card-grid · theme
   bridge") in the axes section — `.dark` measured landing on the grid root
   (`class:dark` present in classList), the grid's own paint confirmed
   unmoved (transparent ground, 20px gap), tenants speaking through their own
   emission forms.

## Part B — CODE file-input

Route: `apps/www/src/routes/docs/components/file-input.html/` (+page.svelte
rewritten, +page.ts toc rebuilt; NO family files touched).

**What the page gained**: DocsInstall + **#overview** + DocsSeeAlso (all three
were MISSING — the old page had neither install nor see-also, receipt: SSR
`data-doc-install`/`data-doc-see-also` false pre-rewrite); archetype order
hero → install → overview → usage → fi-demo → fi-drop → fi-list → fi-variants
→ fi-overflow → types → accessibility → theming → universal-props (measured
axes table + query() seat) → api → see-also; **toc == DOM** (12 entries, the
old toc was nearly reversed and missed universal-props); a measured per-axis
table; a corrected universal summary (the old page claimed "the family
CONSUMES size and color" — false, like combobox's); a capture line in Usage
(`capture` rides the rest spread to the platform picker).

**Measurement-first receipts** (probe: /tmp/vellum-25-fi-probe.mjs,
-fi-verify.mjs):

- **Density — the fleet's deepest adoption, measured**: the root aliases the
  closed contract (`--jx-file-h ← --jx-hit`, thumb/icon ← `--jx-icon`, text ←
  `--jx-text`, zone-pad ← `--jx-inset`). Measured across xs/sm/default/lg:
  zone min-height **63 / 72 / 90 / 108px** (exactly hit × 2.25), list rows
  **28 / 40 / 48px**, thumb box **18 / 22 / 26px** (icon + the 2px hairline),
  name voice **11 / 13 / 15px**, label **10 / 11 / 12 / 14px**. THE FIXED
  EXCEPTION, measured: the zone's uppercase title stays **11px** at every
  rung (the typed `--text-label` step — a label, not body copy).
- **Size — the §11 echo**: stamp verbatim (computed 14px / 18px on the roots);
  zone title stays 11px; no em-of-parent anywhere (all voices are px channels
  or typed steps).
- **THEME-SPLIT**: inside a `.dark` scope the zone's typed border AND ground
  stay at the light pole (oklch(0 0 0) / oklch(1 0 0)) while the well sweep
  flips to the white-inset dark shadow — a dropped zone keeps its light
  canvas; the row hairline (`var(--border)`), drag ink (`--primary`), focus
  ring and hover grounds are the flipping machines (css read receipts).
- **Supply-only rows (grep receipts over src/lib/ui/file-input/)**: zero
  reads of `--jx-size-effective/--jx-shape*/--jx-radius*/--jx-color-effective/
  --jx-elev*/--jx-motion*`. Elevation: the shadows belong to the PRESS seams
  (`--jx-press-shadow*` typed atoms over `--shadow-2xs/xs/sm` + presses) and
  the F-1 well sweep — trigger laws, not the lane. Motion: carrier unread;
  `--motion-150` ease-out transitions + the reduced-motion kill live.
- **Drag/accept gate + ARIA — measured live** (synthetic DataTransfer drops in
  Chromium): an image + a .txt dropped on an `accept="image/*"` zone bind the
  png and REJECT the txt (error line "! 1 dropped file rejected — accept:
  image/*", `aria-describedby={id}-error` wired, `onreject` fires, txt never
  in the value); a plain drop renders 1 row + live preview img +
  "remove shot.png"; list labelled "selected files"; the trigger is a BUTTON
  with aria-label and its click REACHES THE PLATFORM FILECHOOSER (playwright
  filechooser event); the native input is `tabindex="-1"` + `aria-hidden`
  (ONE accessible control). The transient over-pose class was not captured by
  the synthetic rig (Svelte settles the class post-dispatch) — the page
  doesn't claim it as measured; the drop pipeline itself is.
- **API arithmetic**: 22 meta rows − 8 ambient axes = 14 family rows; the
  hand table serves the 11 contract rows (class forwards via cn; the rest
  spread rides the native input) + the FileItem table.

**Watch-items resolved**: file-input IS input-family — the .jx-label/.jx-error
scaffold comes from jx-pure Part A and the InputGroup hardening (min-width 0,
max-width 100%, ellipsis + title) is family law #5, kept honest by the 390px
host section; the chromeless-part law appears as the ONE-accessible-control
pattern (native input clipped out of the tree). accept is a real prop with
the drop gate; capture rides `{...rest}` (now documented in Usage).

## Gates

- Baseline BEFORE Part B edits: 8 affected spec files **402/402** (card-grid,
  card, defaults-form-families, density-adoption-form-text,
  docs-ambient-vocabulary, docs-structure, hover-stability,
  props-table-meta-drift).
- AFTER: same 8 **402/402** (one hover-stability failure in a full batch was
  the known contention flake — isolated re-run GREEN, full-set re-run GREEN);
  ambient-vocabulary solo **283/283** after the matrix re-pin; drift-lock
  **60/60**; canvas-same-source **92/92** (sibling's in-flight additions
  included — my pages conform).
- Page-scoped svelte-check: **card-grid CLEAN, file-input CLEAN**; fleet
  1606 → **1603** errors / 633 → 631 files (my rewrites removed both pages'
  latent cx `filter(Boolean)` errors via the banked predicate typing).
- `verify:tailwindless` — receipt, bound verbatim: `files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim
  (explicit-props design §16.2); drift either direction is red` (✓ GREEN, 2
  class-bearing files against the pin, @utility freeze 0).
- `verify:docs` — ✓ all docs pages pass the skeleton lint (staged scope green).
- `verify:docs-universal` — **GREEN 110/110** (the native-scroll-area marker
  from my mid-task run cleared in the tree — quill's repair landed; no
  attribution note needed at this integration).
- Ambient matrix re-pin (documented in the fixture note): file-input's
  variant row moved table[0] → table[1] — the archetype's measured axes
  table is the new call-site table[0]; `fileInputVariantSlot` own-'drop'
  untouched (the own↔defaults lock passes).

## Diff list (mine)

- `apps/www/src/routes/docs/components/card-grid.html/+page.svelte` (Part A)
- `apps/www/src/lib/ui/props-table/docs/card-grid.docs.ts` (Part A)
- `apps/www/test/props-table-meta-drift.spec.ts` (Part A pin)
- `apps/www/src/routes/docs/components/file-input.html/+page.svelte` (Part B)
- `apps/www/src/routes/docs/components/file-input.html/+page.ts` (Part B)
- `apps/www/test/fixtures/docs-ambient-vocabulary.matrix.json` (Part B re-pin)

NOT mine (siblings, in flight — untouched): `code-card.html/+page.svelte`,
`test/canvas-same-source.spec.ts` (marginalia), native-scroll-area + the
agents' experience files (quill).

## Verdict

**PASS** — Part A: all three review findings fixed with the rig re-measured
live (the claim is now true because the demo makes it true). Part B: the page
moved to the archetype with install/overview/see-also, toc==DOM, a measured
eight-axis table (the alias-seam density ladder is the new deepest-adoption
receipt), the theme split, and a drag/accept/ARIA probe that exercised the
gate end-to-end.
