# TASK 18 — REVIEW inline-code (vellum, 2026-09-22; 1st of 2)

**Verdict: PASS** — the tier-3 pin-density decision holds under audit
(triple-pin verified at source AND live; gaps-only shape exact), the
kinship naming is grep-true, the family's headline behaviors measure
exactly as the page says, and the page carries ZERO svelte-check
diagnostics (the cx predicate applied). Findings: 1 MINOR, 0 blockers.

## Extra duty 1 — the pin-density tier-3 decision: VERIFIED

The commit diff (6c812e41^ → 6c812e41, page only) removes exactly ONE
line — the cx `.filter(Boolean)` (replaced by the type predicate) — and
adds DocsInstall + the Overview section + DocsSeeAlso. **The pinned
hand table is untouched**: not one table row edited. Gaps-only shape
exact: install/overview/see-also added (install renders
`data-doc-install` + `aria-label="install inline-code"` in SSR;
see-also present), everything pre-existing byte-preserved.

The three pins, read at source and executed:
- (a) **variant invariant** — docs-ambient-vocabulary.spec:452
  "inline-code#variant keeps its canonical definePaintSlot 'ambient
  zone' cell (never edited, never matrix-bound)": served SSR contains
  EXACTLY ONE variant row and its default cell is `'fused' · ambient
  zone` ✓.
- (b) **matrix ordinals** — :559
  `if (route === 'inline-code' && c.prop === 'variant') continue; //
  exempt: invariant-locked` — the variant row is outside the matrix
  multiset while the other ordinals feed it ✓ (the bijection it passed
  inside the 283).
- (c) **variant-grammar extraction** — variant-grammar.spec:41 lists
  `routes/docs/components/inline-code.html` in the registry-path
  universe ✓ spec green.
- Plus the family spec: **inline-code.spec.ts = 22 tests** (the
  dispatch's count exact) — green.

## Extra duty 2 — kinship naming: GREP-TRUE, shape-agnostic

- **code-card shares the ENGINE EDGE verbatim**: both families import
  the SAME symbols from the same modules —
  `HIGHLIGHT_KEY, type HighlightContextValue` from
  `$lib/highlight/context-key` (inline-code.svelte:237,
  code-card.svelte:89) and inline-code additionally the stock
  `DEFAULT_MICROLIGHTER_BACKEND` from `$lib/highlight/microlighter`.
  Edge share, not composition: code-card never mounts inline-code.
- **the chip is a LEAF by grep receipt**: the only mounters of the
  family outside the page/meta are `blueprints/scenes/figure.svelte`
  and `blueprints/scenes/inline-code.svelte` — demo scenes, not
  components. And the chip composes nothing: its imports are types,
  `cn`, the defaults slot, the highlight backend, and the text-style
  resolver — zero component imports. Law-kinship ≠ composition: the
  Overview's exact claim, verified.

## Standard loadout receipts

- **Archetype order / SSR byte order**: hero → install → overview →
  demo canvas → variants → engine → detection → geometry → modifiers →
  types → usage → accessibility → theming → universal-props → api →
  see-also. The dispatch sketch's anchors (install → overview → demo →
  variants → api → see-also) all in order. **Exactly 1 h1** (the hero
  card; the demo heroes here are hero-section's problem — none on this
  page). toc: 11 listed ids all present, relative order == DOM order;
  docs-install + see-also correctly unlisted (fleet precedent).
- **THEME-SPLIT (no theme claim to carry)**: the family declares NO
  theme prop — nothing to split; the paint probes confirm the variant
  recipes below are the page's real claims. The tonal recipe measured
  **oklab(0.3211 0 0 / 0.12)** ground + **/ 0.45** border — the 12%/45%
  --jx-tonal recipe EXACTLY as the variants section states; fused =
  transparent ground + **backdrop-filter: contrast(0.85)** + 1px
  TRANSPARENT border ("the width-only border painted transparent") —
  all three measured.
- **Zero markup**: the highlighted chip's childNodes = [comment, text,
  comment] (stylex dev markers) — exactly ONE text node carries the
  code: the range engine never touches the DOM text, the a11y row's
  "screen readers read the identical characters" holds.
- **Density radius ladder**: measured border-radius 2px at 2xs/xs/sm,
  4px at default, 8px at lg — the geometry section's ladder verbatim;
  padding-inline 7px = the formula 4 + 12 × (1.5 − 1) / 2 (the worked
  example, measured).
- **size axis + the padding-formula non-collision**: size={18} stamps
  the §11 echo verbatim and the type steps to 18px while the padding
  STAYS 7px — the universal-props summary's "the size axis is separate
  from the modifier fontSize mirror that feeds the padding formula"
  is precisely the measured behavior (declaring-element discipline:
  the calc reads the modifier prop, not the axis stamp).
- **query()**: no query case on this page — none claimed (the family
  is stateless; density composes through the ambient scope channel).
  Consistent, not an omission.

## Findings

1. **MINOR — the axes section is missing from the toc.** The page's
   eight-axis surface renders at `#universal-props` (eyebrow "axes",
   the carriers-JOIN summary + the size={18} demo) but the toc lists
   neither it nor an "The eight axes" label — on a campaign whose
   per-page axes section is the headline deliverable, the one section
   a reader can't reach from the rail is this one. One toc line
   (`{ id: 'universal-props', label: 'The eight axes' }`) after
   `theming`. Non-blocking (the section itself is complete and
   correct), but it is the exact gap the toc policy exists to prevent.
2. **NOTE (receipt hygiene)** — the Overview's leaf receipt names
   "only the blueprint scenes mount it"; the grep also matches the
   family's own files — the precise receipt is "only
   blueprints/scenes/* outside the family", which is what the Overview
   means and what I verified. No change needed; recorded for the
   next auditor.

## Gates (current tree)

- **inline-code.spec.ts: 22/22** · **variant-grammar.spec: green**
  (24/24 combined run) · **docs-ambient-vocabulary solo: 283/283,
  exit 0** (the scribe's color-picker conversion has settled — no
  sibling-attributed failures remained at review time)
- svelte-check (fleet 2488 files): **ZERO diagnostics on
  +page.svelte** (the cx predicate confirmed); fleet 1626/1030 (sibling
  churn)
- verify:tailwindless exit 0 — receipt verbatim:
  `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red`
- verify:docs-universal exit 0 — `GREEN: 110/110`
- verify:docs exit 0 — skeleton lint green

## Process evidence

- Port 5242: lsof EMPTY before (rc=1); server wrapper 96394 → vite
  96424; BOTH killed; after: lsof rc=1 (EMPTY), no 5242 vite remains.
- NO commits, NO push, ZERO tree edits by me (review-only).
- Probe: inline node script (variants/zero-markup/density/size) with
  the LAW #15 gate corrected mid-review (the tonal atom's own tint as
  the family signature — the weak mono-font gate read pre-atom
  defaults); SSR snapshot /tmp/vellum-18-incode-ssr.html; logs
  /tmp/vellum-18-incode-*.log.
