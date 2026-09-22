# TASK 30 — CODE kbd (vellum)

## Tier decision: TIER 2 (优化重构)

Gap analysis: the skeleton (248 lines) had a law-grade core — hero, a
workbench canvas with drawer, the shortcut-rows demo (menus + bindings table),
types, usage, accessibility, a theming DensityDemo + TokenTable, universal
demo, and a hand API table — i.e. the family truth was largely present.
Missing: install (id="install"), Overview, DocsSeeAlso (id="see-also"), the
measured axes layer, a query() case, the canonical tail order (api → axes →
accessibility), toc==DOM (universal-props missing; workbench unlisted), and —
the finding of the task — a STALE INHERITANCE CLAIM in the served copy.
Tier 1 would preserve the falsified caption and the missing layers; tier 3
would rewrite a 150-line family whose own spec suite (batch3,
defaults-kbd-badge-chip, context-coverage) already pins its behavior. Tier 2.

## The finding: the stale inheritance caption — FALSIFIED and corrected

The served workbench text claimed the chip "reads at body size (0.75em,
inherits the context)" and the playground help repeated it ("the chip
inherits font-size from context — it shrinks in table cells and grows in
heroes"). MEASURED FALSE: the kbd renders **12px inside a 13.5px prose
context and 12px inside a 13px table row** — the atom pins
`fontSize: var(--jx-text-secondary)` (the density kernel channel), so the
glyph's voice is its OWN: density-governed, context-independent. The
dispatch's lead question is answered: kbd carries an own voice through the
secondary kernel channels; the §11 size stamp moves the root and nothing
follows. Both the workbench description and the playground help are corrected
in place, and the axes size row carries the falsification.

## The eight axes — measured or negative-grepped

- **density — CONSUMED, the live ladder**: fontSize 10/12/14px,
  line-height 13.5/18/21px, inline padding 8/12/16px across xs/default/lg
  (the secondary kernel channels --jx-text-secondary/--jx-line-secondary/
  --jx-gap); ambient attr absent under scope boxes (two-channel finding).
- **size — own voice, not inheritance** (above). Number unit: px.
- **shape / color / motion — SUPPLY-ONLY** (grep receipts: the family ships
  NO css file at all — stylex atoms + the promotion seam are the whole
  surface; zero shape/color/motion readers, zero transitions — LAW #14 clean
  by absence).
- **radius — OWN 2px CORNER**: measured borderRadius 2px at every lane; the
  corner rides the promotion seam var(--kbd-radius, 2px), not the axis
  carrier; a radius lane supplies descendants only.
- **elevation — OWN ENGRAVE TIER, axis unread**: the shadow is the grammar's
  --jx-shadow-engrave token (measured literal inset pair), not
  --jx-elevation-effective. A glyph incised into the plane.
- **theme — THE RE-DERIVING VOICE (a new THEME-SPLIT observation)**: measured
  under a scoped `.dark` the TONAL ladder FLIPS with the scope — background
  mix and ink re-derived from the scope's primary (light 0.6489-family → dark
  0.7044-family measured; ink oklch(0.7044 0.1872 …) inside .dark) — because
  the tonal voices read the --jx-tonal → primary STREAM, which re-resolves
  per element, while the engrave shadow keeps its literal inset pair. This is
  neither the combobox-style frozen pole nor a raw-sheet machine: it is the
  typed STREAM emission re-resolving. Flagged below as the open question.

## Structural changes (2 files, +192/−13)

- +DocsInstall (id="install"), +Overview (3 paragraphs: element semantics +
  compose-by-hand; own voice + engraving + density ladder; the ladder +
  re-deriving theme + kinship chip/press-button), +DocsSeeAlso at
  id="see-also".
- +#universal-props rebuild: the measured 8-row table, receipts note, a NEW
  query() case (`size={query({ md: 18 }, 14)}`, md key = 48rem), the existing
  demo retained.
- DOM reorder to archetype: install / overview / workbench / shortcut-rows /
  types / usage / theming / api / universal-props / accessibility /
  see-also.
- toc rebuilt: DOM order, chrome OUT (install, see-also), 8 entries.
- **api density row restored to the matrix-frozen inline text** ('ambient
  scope' — the pinned vocabulary); the stale TokenTable source enum
  'variant grammar' → 'component' (a pre-existing type error, now fixed).

## EXTRA-lane limit discovered (ghostty's fix does NOT transplant here)

The ghostty EXTRA-lane fix (docs.extra with the same object reference)
requires the row to be an inline literal the AST scanner can see; a hoisted
const identifier is invisible to axisRowsOf (parseRows reads object literals
only) → "expected exactly 1 row, found 0". For kbd the matrix pins the
density row to table[0] with the frozen 'ambient scope' text — so the inline
literal stays and the fold stands. The information is fully served elsewhere:
the axes table carries the measured density row and the api summary points at
it. Documented here so reviewer #2 knows the served api table shows
[variant, class] by design and the density truth lives in the axes table.

## Gates (all green)

- Baseline BEFORE (9 files: batch3-components, canvas-same-source,
  defaults-w4-content, defaults-kbd-badge-chip, context-coverage,
  defaults-overlays, docs-ambient-vocabulary, docs-structure,
  props-table-meta-drift): **494/494**.
- AFTER: **494/494** (ambient solo re-run after the api fix: **284/284**).
- Page-scoped svelte-check: **KBD PAGE CLEAN**; fleet 1597 → **1595** errors
  / 626 → 625 files (the rewrite fixed the page's latent cx error AND the
  pre-existing TokenTable source-enum type error).
- `verify:tailwindless` — receipt, bound verbatim: `files=2 identities=7
  occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim
  (explicit-props design §16.2); drift either direction is red` (✓ GREEN).
- `verify:docs` — ✓ all docs pages pass the skeleton lint.
- `verify:docs-universal` — **GREEN 110/110** (marker ×1, on the api table).
- Post-rewrite served verify: h1 ×1, install + see-also, toc==DOM ok:true,
  density ladder reproduced, zero pageerrors.

## Diff (mine)

- `apps/www/src/routes/docs/components/kbd.html/+page.svelte` (+189/−13 content)
- `apps/www/src/routes/docs/components/kbd.html/+page.ts` (toc)
- No family files touched (kbd ships no css file; the stylex table is the
  family's whole paint surface and needed no change). NO commits, NO push.
  Quill's popconfirm files + the stray probe-*.mjs at the repo root are
  quill's — untouched.

## Process

- Port 5242 empty before (rc=1) and after teardown (rc=1; vite 56703 +
  wrapper 56672 killed by PID).
- Probe: /tmp/vellum-30-kbd-probe.mjs (density ladder, voice contexts,
  theme split, variant ladder, api rows by name; SSR skeleton).

## Open questions for reviewers

1. **THEME-SPLIT taxonomy**: kbd's tonal voices RE-DERIVE under scoped .dark
   (measured) through the --jx-tonal → primary stream, while combobox's typed
   tokens freeze at the :root pole. Both are stylex "typed" atoms — the
   deciding factor appears to be whether the token's stored VALUE is a
   literal or a var() stream. Does the five-mechanism law need a note
   distinguishing typed-LITERAL (frozen) from typed-STREAM (re-deriving)?
2. The api table serves [variant, class] only — the density row's served
   absence is the matrix-frozen arrangement (its generic vocabulary renders
   in the universal fold; the measurements live in the axes table). Accept,
   or should the fold be taught to keep scope-marker rows?
3. The axes size row carries the falsification provenance ("the stale
   inheritance caption corrected here") — keep in the served table (same
   question as input-otp's falsified-consumption row).
