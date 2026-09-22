# scribe task 7 — REVIEW `alert`, the SECOND review on the FIXED state

- agent: scribe · round 7 · 2026-09-22 · main dir, NO commits, NO push
- reviewed: `apps/www/src/routes/docs/components/alert.html/+page.svelte`
  (+ `+page.ts`), working tree byte-clean vs HEAD b4d8b9df (vellum's
  micro-fix, verified with `git status --porcelain` on the page + family:
  empty; page file mtime 23:04 PRE-dates the fresh dist 23:07, so gates
  ran against the fixed state)
- against: marginalia's 1st review (`agents/marginalia/reports/
  3-review-alert.md` — 2 MINOR + 2 NIT, verdict PASS) + the fix report
  (`agents/vellum/reports/4-fix-alert.md`, context only) + the full law
  library (skills/mdn-doc-style.md §1-§6, 13 laws) — including the
  THEME-SPLIT law's debut application
- method: SSR curl on my port 5243 (977 KB capture) + per-finding greps
  with counts + ONE computed probe for the density inert clause (single
  evaluate, /tmp/scribe-a7-probe.mjs) + ONE single-evaluate re-measure of
  the THEME-SPLIT row (one voice from each half, same script) + a
  one-evaluate disagreement discriminator on the size-18 demo banner
  (/tmp/scribe-a7-size18.mjs) + source receipts for every mechanism claim.

## Verdict: **PASS** — all five fixed findings verified in the served
page; the THEME-SPLIT row's both-halves claim survives my independent
re-measurement exactly; zero regressions, zero new sins.
**alert reaches DONE** (marginalia's 1st-review PASS + this 2nd-review
PASS on the fixed state).

## Per-finding verification (the fixed findings)

| # | Finding (marginalia f#) | Fix claim (vellum) | SSR evidence | Live/source evidence | Status |
|---|---|---|---|---|---|
| 1 | MINOR f1 — axes drawer drifted from its stage at birth ("…= 6px" vs "off the banner's anchor") | single-source: drawer composes `usageFile({Alert, Card}, resolveRawCode('axes'))`; hand literal deleted; canvas `id="axes"`; comments moved INTO stage children | `6px off the banner's anchor` **×2** (stage render + drawer's escaped copy) — the old split-birth is structurally dead | source :65/:309 (the quill idiom verbatim); the re-pin snapshot `canvas-same-source.spec.ts:189-203` carries the full sentence; solo spec green (below) | **FIXED** |
| 2 | MINOR f2 — density row implied the number lane moves the × hit lane | the inert clause + the declaring-element why | `inert on this banner` ×1 · `nothing here scales by the coefficient` ×1 · `a bare number declares no scope block, so nothing re-declares AT the banner` ×1 | **computed probe A5/A6** (below): bare number → × hit stays 40px, padding/title/body byte-unchanged, stamp receipt present; named-rung controls 48/24 | **FIXED** |
| 3 | NIT f3 — "fixed literals" stale pre-stylex phrasing (+ "is"→"are") | "static tokens … none of them reads a density channel" | `fixed literals` **×0** · `are static tokens` ×1, with the three tokens verbatim (`var(--jx-text-base)`, `var(--space-12)`, `calc(var(--jx-unit) * 3.5)`) | source receipts: alert.stylex.ts:39/40/91/100 carry exactly those three reads; none is a density channel | **FIXED** |
| 4 | NIT f4 — density type column contradicted the `density="2xs"` demo | "(+ the five legacy spellings)" in the column | ×1 in SSR | the five spellings verified IN the schema lane (DensityLane, universal-props.schema.ts:71: xs · 2xs · sm · default · lg); the other seven lanes byte-MATCH the schema (below) | **FIXED** |
| 5 | ADDENDUM — the query() one-generic type error (scribe's accordion finding, campaign-wide) | both args in script + drawer string + comment; premise PROVEN by revert-probe | drawer teaches `query&lt;{ sm: DensityLane }, DensityLane>({ sm: 'small' }, 'large')` ×1 (the §6 law's exact shape) | source :75 (running code), :77-87 (drawer string), :72-74 (the why comment); import record carries `query` + `DensityLane` | **FIXED** |

## The THEME-SPLIT row — independent re-measure (the new law's debut)

**One voice from each half, ONE evaluate** (the single-evaluate probe
law), on the served page's own tonal pair ("Scheduled maintenance" light
vs "dark profile" island):

- **FLIPPING half — `--jx-tonal` re-scopes**: light
  `oklch(0.6489 0.237 124)` → dark `oklch(0.7044 0.1872 calc(124 - 4))`.
  The dark values are byte-the-sheet's `--primary` dark profile
  (jixoai.css:281) substituted against the island scope — the mechanism
  the row names.
- **FROZEN half — `--jx-muted-foreground` unchanged**:
  `oklch(0.3211 0 0)` on BOTH banners, while the raw
  `--muted-foreground` flips `0.3211 → 0.8452` (B3) — ledger W-next #1
  exactly, measured on my own probe not vellum's.
- **Extra receipts in the same evaluate**: `--jx-foreground` frozen
  (oklch(0 0 0) both); raw `--shadow-2xs` flips black→white ink while
  `--jx-shadow-2xs` keeps black → computed boxShadow **byte-identical**
  (`rgba(0, 0, 0, 0.5) 1px 1px 0px 0px`) — the row's "the shadow ink
  stay[s] :root-anchored" holds; the dark banner carries the `.dark`
  class, its light twin does not (the bridge receipt).
- **Sheet receipt**: jixoai.css:1497-1504 declares `--jx-tonal`/
  `--jx-outline` on `:root, .jx-light, .dark` — the sheet really does
  theme-scope the slot layer (vellum's line cite verified).
- **Session-hue note (not a discrepancy)**: vellum logged hue
  146 → 142; I measured 124 → calc(124 − 4). The absolute hue is the
  runtime `--brand-hue` stamp (hue-runtime.svelte.ts:146 sets it on
  documentElement); the STRUCTURE — the L/C pair flip + the −4° dark
  drift — is identical across rounds. Cross-round oklch comparisons must
  diff structure, not absolute hue.
- **Wording names BOTH halves + cites the ledger** (SSR counts): theme
  row `A PARTIAL re-theme on this banner, measured` ×1 +
  `the drift ledger's W-next #1` ×1, with the tonal pair re-scope AND
  the stylex ink freeze both named; axes summary
  `theme partially re-themes the banner (the tonal pair re-scopes …;
  the semantic ink layer stays root-anchored)` ×1; demo caption
  `the tonal pair re-scopes to the island's dark profile; the semantic
  ink layer stays root-anchored (W-next #1)` ×2 (stage + drawer, kept
  in sync). All four claim sites agree; no site overclaims a full flip
  or a full freeze.

## Disagreement-probe lens (demo numbers vs ambient)

1. **The inert clause's 40px == the ambient 40px** — the one real
   coincidence on the page. Broken BOTH ways: the stamp receipt (style
   attr carries `--jx-density-coefficient: 3` with NO data-density attr
   — the prop landed and recomposed nothing, not "the prop was
   dropped") and the named-rung controls (lg 48 / 2xs 24 — the pipeline
   demonstrably sees the lane move when a scope block actually
   re-declares). Probe A5.
2. **The 13px static rhythm == 0.8125 × 16 em-reading at ambient** —
   discriminated at the page's own size-18 demo banner: root computes
   **18px** with title/body pinned at **13px** (the em reading would
   render 14.625px); style attr stamps `--jx-size-effective: 18px;
   font-size: var(--jx-size-effective, 1rem)`. The "(rem-anchored)"
   annotation is earned, independently of marginalia's identical
   measurement.
3. **Concentric 6px is anchor-specific, not ambient**: SSR style attr
   receipt on the demo banner (`--jx-radius-effective: 20px` alongside
   the size stamp); without the anchor the nested auto Card would
   resolve 0px (max(0, 8 − 14)), so 6 exists only because the banner
   supplies 20.
4. No other demo number coincides with ambient: rungs 48/24 ≠ 40, the
   query case measured 32px at 1280w (≥40rem, the sm case) ≠ 40.

## Standard sweep

- **Archetype (§2)**: hero → #overview → #usage → #api (Props) → #axes →
  #accessibility → #see-also — exact order, live example early. ToC
  (+page.ts) lists exactly those six; SSR `href="#<id>"` ×2 each (nav +
  payload), 6/6 present in the page DOM.
- **Steps/units vs schema**: size/shape/radius/color/theme/elevation/
  motion type cells **byte-MATCH** the schema lanes (scripted compare);
  density's abbreviated cell verified against the full DensityLane;
  size steps 14/16/18 (universal-props.css:39-41); the query() resolved
  record law holds live (32px at the sm case).
- **Deviations vs census**: "alert/anchor/inline-code/skeleton retired
  their declaration-only density postures" (migration-census.md:295, the
  LANDED D5 / W3 CLOSE row) — the page's citation
  (`explicit-props D5 (migration-census.md, W3 CLOSE)`) is exact; the
  supply-only closing paragraph cites the same census rows.
- **Examples-match-source**: usage drawer vs stage bodies identical
  (four banners, the dark caption byte-shared); the axes drawer IS the
  stage (composed); the query drawer's hand file is the declared
  teaching exception, copy-identical to the stage's sentence.
- **Prose (§1)**: en-US throughout (0 british spellings), no marketing
  tone, no hedging; the campaign vocabulary (axis · lane · named step ·
  `auto` · carrier · ambient · rung) used consistently. "Broadcast
  protocol" appears only inside INLINED jixoai.css source comments in
  the payload, never in page prose — §6's gloss law not triggered.
- **Hard laws**: zero new class identities (tailwindless receipt
  UNMOVED verbatim, below); the universal marker ×1 (SSR count);
  generated sections intact (docs-universal 110/110); usage H2 ×1.

## Gates (tails)

- `npm run verify:tailwindless` → exit 0; `[tailwindless] ✓ GREEN — 2
  class-bearing files against the pin …`; `[tailwindless] receipt:
  files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0,
  ui:6} forms=42 — bound verbatim …; drift either direction is red`
- `npm run verify:docs-universal` → exit 0; `[docs-universal-manifest]
  GREEN: 110/110 component pages render the shared universal section
  (110 markers)` (against the fresh dist built 23:07, post-dating the
  fixed page 23:04)
- `npx vitest run test/canvas-same-source.spec.ts` (solo, apps/www) →
  exit 0, `Tests 51 passed (51)` — grew from vellum's 44 because
  sibling rounds joined the PILOTS lane (the spec carries +129
  uncommitted lines from marginalia's accordion fix and the badge
  round; the alert entries — `alert.html :: axes` re-pin + the PILOTS
  loop tests — all green). Pre-existing teardown nag only ("Tests
  closed successfully but something prevents Vite server from
  exiting"), same as prior rounds.

## Processes (receipt)

- Dev server: `npx vite dev --port 5243 --strictPort` (apps/www) —
  wrapper PID 41561 (`npm exec vite dev …`), vite child 41597 (+ one
  same-tree process 54125 matching the port args); all killed BY PID
  after the probes and gates. Receipts: `lsof -i :5243 -sTCP:LISTEN` →
  0 lines (exit 1); `lsof -ti :5243` → empty (exit 1); `pgrep -fl
  "port 5243"` → none (exit 1); `ps -p 41561,41597,54125` → empty
  output (all gone). No orphans.
- Scratch artifacts, /tmp only: scribe-a7-ssr.html (the SSR capture),
  scribe-a7-probe.mjs + .log (13/13), scribe-a7-size18.mjs + .log
  (PASS), scribe-a7-dev.log, scribe-a7-tw.log, scribe-a7-univ.log,
  scribe-a7-vitest.log. Repo-side writes: this report + a highlight in
  my experience.md. Page source, family source, kernel, schema, spec:
  untouched.
- Probe honesty note: my probe's first run scored 12/13 — the FAIL was
  MY assertion A4 reading the DECLARED `--jx-hit` token stream (a
  `max(calc(…))` formula, never a literal "40px") instead of the
  resolved value; fixed with a scratch-element resolve and re-run green
  13/13. The page was right; the probe was wrong. (Second self-catch,
  same class as my blockquote round's detail-string slip.)
