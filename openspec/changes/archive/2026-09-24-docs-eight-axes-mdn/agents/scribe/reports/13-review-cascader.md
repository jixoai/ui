# scribe review 2 — cascader (task 13, docs-eight-axes-mdn)

Agent: scribe · 2026-09-22 · reviewer role, main dir, no commits.
Scope: `apps/www/src/routes/docs/components/cascader.html/` (+page.svelte,
+page.ts) and `cascader.docs.ts`. Independence law honored: this file was
written BEFORE opening marginalia/reports/9-review-cascader.md; the
consolidation note is appended.

## Verdict: PASS — cascader closure declared (page #11)

The page-side fold (quill task 11-A) is byte-verified from served
bytes; the fixed-paint numbers re-measured; the theme split re-probed;
the seven-supply story re-grepped. Zero BLOCKER/MAJOR/MINOR findings;
one NIT-grade observation recorded.

## Primary target: the page-side fold — VERIFIED from served bytes

- **Headers are exactly `[Token, Default]`** — the Source column is
  GONE: no `fixedTokens` row carries `source`, so TokenTable's
  `tokens.some((t) => t.source)` guard removes the column entirely.
- **6 rows, 0 empty cells** (cell-by-cell parse of the served table).
- **The `--jx-text-base` vs `--jx-text` distinction survives VERBATIM**
  in a rendered cell: "0.8125rem (13px) — the select's mono body voice:
  the ruler's T_base constant, NOT the density channel --jx-text; no
  rung rescales it" — marginalia's most-complete-statement concern is
  satisfied byte-for-byte.
- **The merges lost nothing**: the `--space-6 / --space-10` row carries
  both facts (the group column gap + the chain's wrapping gap / the
  select's inline padding) and the label pair row carries both
  (`--text-label-lg` 0.75rem/12px + `--track-10` 0.1em). Every constant
  re-verified against the family source (cascader.stylex.ts :35/:41-42/
  :55-57/:63-64): the calc(var(--jx-unit) × 1.75) block padding, the
  hairline, the --jx-radius corner.
- The fold's own honesty note is in the page comment ("TokenTable
  renders neither a description column nor a label for
  source:'structural'" — matching my task-11 discovery that the
  description field is dead surface; the badge-ladder model of riding
  facts in Default cells is the correct workaround).

## Standard pass — all verified TRUE

- **Tier 3 justification STRENGTHENED, confirmed**: the W3-era page
  (6bb88ae0, 194 lines) carried the consumption LIE at line 182 — "The
  family CONSUMES size and color: the native element never receives
  them" — exactly backwards (the family consumes NEITHER; both are
  supply-only). The rewrite deleted it (0 hits now) and the axis rows
  state the truth instead. A page whose old content asserted false
  mechanisms earns tier 3 beyond mere structure.
- **Seven-supply + theme's one consumed voice**: grep — zero
  `-effective` carrier readers in cascader.css/cascader.stylex.ts; the
  single raw read is `outline: 1px solid var(--ring)`
  (cascader.css:11). Probed: ring ambient oklch(0.6489 0.237 190) →
  dark oklch(0.7044 0.1872 186) — the L flip + the −4° hue drift
  invariant exactly as the theme row states; shell face oklch(1 0 0)
  frozen across the island. Theme row wording: "Partial re-theme,
  measured: ring flips, face doesn't" — precise, per the split law.
- **Fixed-paint numbers re-measured**: the native select is **35px tall
  at ambient, sm, and under a 24px size stamp** (density-invariant hit
  surface, clearing the 24px WCAG 2.5.8 AA floor — the a11y prose's
  claim); the select face stays **13px** under the size=24 root stamp
  whose style carries `--jx-size-effective: 24px; font-size:
  var(--jx-size-effective, 1rem)` — "size moves the stamp, not the
  paint" is measured-true.
- **Raw-SSR stamps, one per claim**: ambient root has NO data-density
  and NO style attr (the "stamps nothing" caption byte-true); sm root
  carries `data-density="sm"` + `--jx-density-coefficient: 1` (the
  co-stamp); the responsive root flips its rung attribute sm → lg → sm
  across 64rem (the caption's "a DOM fact, not a pixel fact" — exactly
  right for a fixed-paint family).
- **query() two-generic**: `query<{ lg: DensityLane }, DensityLane>({
  lg: 'large' }, 'small')` in the drawer string AND the live stage; the
  drawer comment teaches WHY (the bare form infers
  `QueryResult<string>` — a type error); svelte-check shows zero
  diagnostics on the query line (the shipped form is clean — the real
  type error receipt).
- **吃也供 gloss**: first mention glossed "(吃也供, supply-and-consume)"
  in the axes summary ✓.
- **Survivor ids / preserveHash**: the toc keeps usage/api/
  accessibility/cascader-demo with the legacy-doc-routes comment ✓; toc
  6/6 ids resolve in the DOM; See also out of the toc (the ruling).
- **EXTRA arithmetic**: no shadowing props — CASCADER_DOCS carries no
  extra lane (options/value/separator/label are family props, not axis
  names; the §1 note documents that HTML's own select `size` attribute
  has no passthrough collision since the family renders no
  multi-select) — the Props section renders meta + curation only, and
  the page says so.
- **Archetype order**: hero → Install → Overview → Usage → live demo
  canvas → Props → the eight axes → Accessibility → See also; ONE Usage
  H2; Title-Case title; the P1 playground protocol (echo output +
  onreset) documented.

## Findings summary

| # | severity | note |
|---|---|---|
| 1 | PASS | fold: [Token, Default] × 6 rows × 0 empty; the ruler-constant distinction verbatim; merges lossless |
| 2 | PASS | fixed-paint numbers (35px ×3 rungs; 13px face under a 24px stamp) |
| 3 | PASS | theme split (ring flips with the −4° invariant; face frozen) + seven-supply grep |
| 4 | PASS | query() two-generic + DOM-flip receipt; tier-3 lie deletion confirmed |
| 5 | NIT (observation, no action) | the page's a11y prose says the 35px select "clears the 24px WCAG 2.5.8 AA target floor" — 2.5.8's AA minimum is 24px ✓ correct, but the fleet's other a11y notes cite the 28px pin as "WCAG 2.5.8 AA" too; a one-place-per-fleet ruling on which number maps to which conformance level would keep citations uniform (orchestrator's call, not this page's defect) |

**PASS — cascader closure declared (page #11).**

## Processes

- Port 5243: lsof empty before start; dev server killed by listener PID
  + wrapper PID — `listeners=0 wrappers=0` receipt. No build (review
  only; no repo source writes).
- Probes: /tmp/scribe-13-probe.mjs (first pass — my own locator bug:
  caption-fragment matching hit the drawer's CODE SAMPLE text and the
  ancestor walk overshot into the canvas stage's stamps; fixed by
  aria-label locators `[data-jx-cascader][aria-label=…]` — the label
  prop IS the group's accessible name), probe2 (role=group reads),
  probe4 (the cross-specimen ring comparison). Logs alongside.
- svelte-check full run: /tmp/scribe-13-svelte-check.log — the page
  carries exactly ONE diagnostic (the fleet cx-idiom class at :97);
  the query line is clean.

---

## Consolidation note (appended after cross-reading marginalia's 9-review-cascader.md)

Cross-read complete. Convergence confirmed on every axis of the review:
marginalia's PASS re-derived the same fixed-paint numbers (35px
density-invariant hit surface; 13px face under a 24px root stamp — the
disagreement core they settled by measurement), the zero--effective
grep + the var(--ring) one-consumed-voice story with the −4° invariant,
the survivor-id preserveHash set, the no-extra-lane arithmetic, and the
strengthened tier-3 justification via the deleted consumption lie
(6bb88ae0:182, byte-located independently by both reviews).

Causal chain for my primary target, now exact: marginalia's MINOR was
the fixed-paint TokenTable rendering a dead prose column with an EMPTY
Source cell on every row (7 rows, `<td …></td>` receipt) — quill's 11-A
fold is that finding's fix, taken one step further: not just filling the
facts but DELETING the dead column via the `tokens.some(t => t.source)`
guard and folding every fact into Default cells. My independent pass
verifies the fix from served bytes (headers exactly [Token, Default],
6 rows, 0 empty cells, the ruler-constant distinction verbatim, both
merges lossless) — receipts that did not exist at marginalia's review
time and are mine to file. Also additive: the cross-specimen ring probe
(cleaner than clone-into-island: the light and dark specimens sit side
by side on the same page), the aria-label locator pattern for cascader
(the label prop IS the group's accessible name — no class/hash
selectors), and the svelte-check cleanliness of the shipped two-generic
query line. PASS stands; closure stands (page #11).
