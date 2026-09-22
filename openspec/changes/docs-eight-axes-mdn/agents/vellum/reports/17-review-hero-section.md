# TASK 17 — REVIEW hero-section (vellum, 2026-09-22; 1st of 2)

**Verdict: NEEDS-WORK** — one MAJOR (the query() theme demo never
flips: FALSE-implying demo as served) + 1 MINOR (the fleet cx-idiom
debt). Everything else — the emission-form theme split, the size
inertia story, the density supply-chain numbers, the arithmetic, the
lint carve-out — verified TRUE at mechanism grade.

## Claim 1 — EMISSION-FORM THEME SPLIT: VERIFIED TRUE (the page's crown)

Probe (LAW #15 gate: animationName `jx-hero-rise` — the family's own
atom — before reading):
- eyebrow `color: var(--primary-text)` (RAW string, hero.stylex:75):
  **FLIPS** oklch(0.55 0.12 72) → oklch(0.7044 0.1872 68) under the
  stamped .dark — the dispatch's dark polar exactly.
- title-em `var(--primary)` (the :where rule, hero-section.css):
  **FLIPS** oklch(0.6489 0.237 72) → oklch(0.7044 0.1872 68).
- summary + badges `tokens['--jx-muted-foreground']` (defineVars
  member): **FROZEN byte-identical** (oklch(0.3211 0 0) both scopes).
- VAR-CHAIN receipt re-derived live: on the section element,
  `--muted-foreground` flips **oklch(0.3211 0 0) → oklch(0.8452 0 0)**
  while `--jx-muted-foreground` is byte-identical — the raw slot voice
  re-substitutes at the consuming element, the typed intermediate
  substituted once at :root. The page's "the accent flips, the muted
  lead freezes — a dark hero wants a dark host" guidance is exactly
  what the paint does.

## Claim 2 — size = the heading contrast case: VERIFIED TRUE

- SSR: `style="--jx-size-effective: 14px; font-size:
  var(--jx-size-effective, 1rem)"` verbatim on the size={14} section.
- Computed: the stamped section's font-size **exactly 14px**; the auto
  section stamps nothing.
- NOTHING follows (measured identical across the auto/14 pair): title
  clamp 38.4px at this column (rem-floor/cqi/rem-cap — no em), summary
  16px (--text-body-xl at ≥40rem), eyebrow 11px (--text-label). The
  row's "the stamp finds no em to scale" is the measured truth — the
  clean contrast to heading's em ladder.

## Claim 3 — density supply-only on self, consumed by composition: VERIFIED TRUE

- `data-density="sm"` greppable in the raw SSR ✓; stamped on the
  section root (the guests' scope — no wrapper paradox).
- The hero's OWN summary holds 16px under the sm rung.
- Composed guests step down: CTA **13 → 12px**, Badge **12 → 11px**
  (ambient baselines measured on the demo panel: 13/12).

## Claims 4–8

- **EXTRA 20 − 8 = 12**: served tables counted — 12 family rows
  (eyebrow*, summary*, copyCommand, copyLabel, title, badges, copy,
  terminal, secondary, class, style, rest — the synthesized rest row
  included) + the 8 axis rows in the Universal section. No EXTRA lane
  (HERO_SECTION_DOCS header ✓).
- **TokenTable fixed-paint fold**: no Source column; the
  emission-form/em-ladder/promotion-seam facts live in Default cells ✓
  (consistent with W-next #3's dead-description finding — description
  cells are bonus, not load-bearing).
- **One-h1 via the family hook carve-out**: the page carries exactly
  one unhooked h1 (the hero card) + 8 demo h1s all carrying
  `data-jx-hero-title`; the carve-out is the lint's REAL mechanism —
  scripts/verify-docs-structure.mjs:131
  `if (/\bdata-jx-[a-z-]+-title\b/.test(attrs)) continue;`
  (component-owned titles exempt from the demo-scope h1–h3 leak check).
  The heading page's headings-ok scope is a DIFFERENT exemption and
  genuinely does not transfer.
- **query() both directions taught**: string lane both generics named;
  the heading page's number-lane bare form cross-referenced. THE DEMO
  ITSELF DOES NOT FLIP — finding 1.
- **Tier 2 audit / archetype order / toc**: hero → install → overview →
  usage → demo → wide-form → slots → api → axes → accessibility →
  see-also; toc 8/8 ids present. The wide-form pan lane (67rem floor =
  64rem tier + insets) survives with an honest caption. The catalog
  sync-binding (fail-loud on registry meta drift) is a nice extra.
- **grep test/ pins**: test/hue-injection.spec.ts exists and passes
  (the color row's byte-pin cite ✓ — family untouched, docs-only).

## Findings

1. **MAJOR — the query() theme demo never flips (FALSE-implying demo as
   served).** Measured three ways: fresh load at 1440 (already ≥48rem,
   the md dark case should win at hydration) renders LIGHT — `.dark`
   never lands on the section; the resize dance 1440→600→1440 (the
   base/case boundary crossed in both directions) stays light
   throughout; ZERO console noise (silent inertness, not an error
   path). Discrimination: the ENGINE is correct — in-page,
   `evaluateQuery({ md: 'dark' }, 'light')` returns
   `{ value: 'dark', matched: 'md' }` at this viewport, and
   `matchMedia('(min-width: 48rem)').matches` is true. So the break is
   in the integration (the family's resolve path, the anchor/context
   seam, or a hydration-reuse quirk — the §9.1 "correct-if-unresponsive
   base" appears to be the PERMANENT state here, not a first-paint
   compromise). The CodeBlock, the canvas caption ("the md case flips
   the ink voices above it") and the "resize across 48rem" instruction
   all promise a flip that cannot be observed. Disposition for the
   orchestrator: family/integration investigation (theme QueryResult
   reactivity through the hero resolve path) OR reword the demo +
   caption to the honest state and log the reactivity gap (W-next #4
   adjacent). Not fixable docs-only without one of those two.
2. **MINOR (fleet debt)** — `+page.svelte:183:28`: the cx helper's
   `.filter(Boolean)` without a type predicate — the known cx-idiom
   error (the page's only svelte-check diagnostic). One-line predicate
   fix, the avatar 2c185457 pattern; quill's next micro-pass.
3. **NOTE** — the density row says the composed guests "inherit the
   re-based channels" — measured TRUE (CTA/Badge step down); the row
   could cite the measured 13→12 / 12→11 numbers the canvas caption
   already carries (optional polish).

## Gates

- probe **15/17 PASS** — the 2 FAILs are finding 1 (the flip never
  engages); every other claim green. Ambient-baseline CTA/Badge
  measured in a follow-up pass (13/12 and 12/11 confirmed).
- ambient solo: **294/295** — the 1 failure is
  `color-picker|1|size|1` (docs-ambient-vocabulary bijection): a
  SIBLING's in-flight color-picker page↔matrix mid-edit state (both
  files modified in the working tree; hero-section is not in the
  failure and its carriers-set pin passed within the 294). Not
  attributable to this page or this review.
- hue-injection solo: green (the color row's pin).
- svelte-check (fleet 2487 files): **1619 errors / 1030 warnings**;
  hero page = exactly 1 error (finding 2), 0 warnings.
- verify:tailwindless exit 0 — receipt verbatim:
  `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red`
- verify:docs-universal exit 0 — `GREEN: 110/110`
- verify:docs exit 0 — skeleton lint green (the lint's hero-title
  exemption exercised live by this very page).

## Process evidence

- Port 5242: lsof EMPTY before (rc=1); server wrapper 78379 → vite
  78410; BOTH killed; after: lsof rc=1 (EMPTY).
- NO commits, NO push, ZERO tree edits by me (review-only; the
  working-tree changes belong to siblings: color-picker/heading/
  inline-code/button-group in-flight tasks).
- Probe: /tmp/vellum-17-hero-probe2.mjs (+ the corrected-baseline and
  query-discrimination scripts, inline); SSR snapshot
  /tmp/vellum-17-hero-ssr.html; logs /tmp/vellum-17-hero-*.log.
