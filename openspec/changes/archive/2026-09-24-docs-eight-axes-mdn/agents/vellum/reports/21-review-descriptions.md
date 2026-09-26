# TASK 21 — REVIEW descriptions (vellum, 2026-09-22; 1st of 2)

**Verdict: PASS** — the ruler ladder, the frozen-pole twin, the six
supply-only lanes, the container query and the arithmetic all
re-derived independently and verified TRUE; the two-honest-failures
restore confirmed on the served page. Findings: 1 MINOR (the query
caption's boundary rem), 0 blockers.

## Claim 1 — density via the ruler ladder: VERIFIED (the full four-rung ladder measured)

Injected rung wrappers (data-density xs/sm/default/lg around a live
clone) + the on-page DensityDemo/default panels:
- **term (--jx-text-secondary/--jx-line-secondary): 10 / 11 / 12 /
  14px** across xs/sm/default/lg (line-heights 13.5/15.95/18/21) ✓
- **value (--jx-text/--jx-line): 11 / 12 / 13 / 15px** ✓
- **padding (--jx-gap/--jx-inset on the dt): 8 / 8 / 12 / 16px** ✓
- **the number coefficient is inert**: a wrapper re-declaring
  `--jx-density-coefficient: 3` leaves the 12px/13px/12px voices
  byte-unmoved (the coefficient composes at the :root rung scopes —
  the declaring-element law, measured by injection).
- **the named rung stamps AND resets**: the lg specimen's root style
  carries `--jx-density-coefficient: 1` (the reset) beside
  `--jx-desc-cols` ✓, plus the data-density stamp.

## Claim 2 — theme = the frozen-pole twin: VERIFIED (census + co-resident probe)

- **Built/runtime CSS census**: each of the five chrome aliases
  (--jx-muted-foreground, --jx-border, --jx-card, --jx-muted,
  --jx-background) is declared **exactly twice** — `:root, .xbpgcew`
  and the doubled-specificity stylex theme class (`.x13ei35y.x13ei35y,
  .x13ei35y.x13ei35y:root`) — and NO plain `.dark` record re-declares
  any of them (the .dark scope exists in the sheet with no voice) ✓.
- **Co-resident probe**: the theme="dark" specimen lands `.dark` on the
  dl and term ink (oklch(0.3211 0 0)), value ink (oklch(0 0 0)), frame
  (oklch(0 0 0)) and card ground (oklch(1 0 0)) are byte-identical to
  the light specimen ✓ — the row's documented absence is the truth.

## Claim 3 — six supply-only lanes + the color grammar: VERIFIED

- Negative-grep receipts re-run per lane (no carrier readers in the
  family css/atoms).
- The color carrier is stamped VERBATIM on a live root —
  `style="--jx-color-effective: var(--jx-color-error); --jx-desc-cols: 1"`
  — and the term/value ink is byte-unmoved (oklch(0.3211 0 0) /
  oklch(0 0 0) both scopes) ✓.

## Claim 4 — columns + container query: VERIFIED

- `--jx-desc-cols` inline on the root; the clamp is source-pinned
  (descriptions.svelte:110 `Math.max(1, Math.min(4, Math.trunc(columns)))`).
- **The container fallback measured**: a clone inside a 500px
  inline-size container computes **ONE track** (the unlayered
  `@container (max-width: 640px)` fallback); the ambient container
  computes multi-track ✓.
- **query() both directions measured**: 1280 → **15px values / 16px
  padding** (lg case) ↔ 600 → **12px / 8px** (small base) — the
  dispatch's exact numbers; both directions exercised (narrow-first and
  wide-first loads).

## Claim 5 — EXTRA arithmetic + the empty-cell fix: VERIFIED

- Served api tables: the main table holds **exactly columns, bordered,
  children, style** (4 family rows) + the 8 axis rows in the Universal
  section = **14 − 8 − 2 = 4** ✓ (the "−2" being the Item's
  citation-duplicate seats: term/value are documented on the Item
  component, not duplicated as axis-adjacent rows).
- **No empty Source cells survive**: the TokenTable rows use
  'component'/'density' sources (both render labels); the old page's
  empty-source cell on the --jx-desc-cols row is gone (0 empty tds in
  the token region).

## Claim 6 — standard loadout receipts

- **Tier 2 audit**: archetype order (hero → install → overview → usage
  → demo → types → examples → vertical → responsive → extra → api →
  axes → accessibility → see-also); toc 10/10 present,
  order == DOM; h1 = 1; #install AND #see-also ids PRESENT (the
  two-honest-failures restore verified); PILOTS 3 blocks (types/
  vertical/axes) — canvas-same-source solo green (below).
- **grep test/ pins**: table-grid-toolbar-pages.spec (the mount +
  skeleton pin), canvas-same-source.spec (the 3 PILOTS blocks),
  docs-ambient-vocabulary (descriptions in expectedCarriers).

## Findings

1. **MINOR — the query() caption states the wrong boundary rem.**
   `query({ lg: 'large' }, 'small')`: the `lg` key is **64rem**
   (universal-props-query VIEWPORT_SCALE), but the CodeBlock comment
   and the caption both say "below **40rem** the base applies — at
   40rem and wider the lg case wins". Measured discriminator: at
   **800px** (≥40rem, <64rem) the grid still computes 12px/8px (the
   small base); the lg case engages only at ≥1024px. The measured
   end-states (12/8 and 15/16) are right; the boundary instruction
   would fail a resizer who tests at 700–1000px. Fix: "40rem" →
   "64rem" in the comment and caption (two strings), or re-key to
   `md` (48rem) if 40rem-ish was the intent.
2. **NOTE (flake attribution, no action)** — in the combined pin run,
   table-grid-toolbar-pages' table-mount test timed out at 5s under
   load (transform 33.6s + import 22.9s in the same process); the SOLO
   re-run is green (exit 0). Same flaky-mount class scribe already
   attributed honestly in the incident record — not a product defect.
3. **NOTE (probe craft, no action)** — my first two probe passes raced
   the stylex injection again (UA dt defaults) and one selector walked
   the panel div instead of the dl (dark:false read). LAW #15's gate
   must assert the FAMILY VALUE (12px secondary voice), and the
   structure dump must precede the selectors. Both applied; final
   probe clean.

## Gates (current tree)

- **canvas-same-source solo: 84/84** (the 3 PILOTS blocks — types/
  vertical/axes — included; snapshot-pinned) · **ambient solo: 283/283**
- **table-grid-toolbar-pages solo: green** (the combined-run timeout is
  the attributed flake, finding-note 2)
- page-scoped svelte-check (fleet 2490 files): **ZERO diagnostics** on
  +page.svelte; fleet 1612/1030
- verify:tailwindless exit 0 — receipt verbatim:
  `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red`
- verify:docs-universal exit 0 — `GREEN: 110/110`
- verify:docs exit 0 — skeleton lint green

## Process evidence

- Port 5242: lsof EMPTY before (rc=1); server wrapper 41407 → vite
  41456; BOTH killed; after: lsof rc=1 (EMPTY), no 5242 vite remains.
- NO commits, NO push, ZERO tree edits by me (review-only; descriptions
  files absent from git status).
- Probes: inline node scripts (rung-ladder injection, coefficient-3
  injection, container-fallback clone, dark census with the corrected
  stylesheet walk); SSR snapshot /tmp/vellum-21-desc-ssr.html; logs
  /tmp/vellum-21-desc-*.log.
