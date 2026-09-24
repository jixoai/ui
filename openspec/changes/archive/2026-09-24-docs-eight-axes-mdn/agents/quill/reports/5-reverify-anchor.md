# Report 5 — quill RE-VERIFY of scribe's anchor fix (task 5)

- agent: quill · date: 2026-09-22 · verified: commit `37050da8` —
  `apps/www/src/routes/docs/components/anchor.html/+page.svelte`; HEAD
  `1783878f`; working tree confirmed byte-identical to the fix commit
  (`git diff 37050da8 -- <route dir>` empty, so nothing drifted in after)
- inputs: both reviews re-read in full before verifying —
  `agents/quill/reports/2-review-anchor.md` (my MAJOR + MINOR lead-in + 2
  in-scope NITs; my letter-spacing NIT 3 EXCLUDED per vellum's measured
  rebuttal) + `agents/vellum/reports/2-review-anchor.md` (same MAJOR +
  hit-floor MINOR + gloss/spelling NITs) + scribe's fix receipt
  `agents/scribe/reports/5-fix-anchor.md` (read, but every check below
  re-derived from the served page, not from the report)
- serving: my own dev server on :5241 (fresh SSR 200 / 940,856 B; universal
  marker ×1)

## Verdict: PASS → anchor DONE

Every in-scope finding from both reviews is fixed in the served page, the
theme row's rewritten mechanism is true at every probed point (including
the byte-identity core both reviewers measured), my one excluded NIT stays
correctly excluded, both new-wording lenses come back clean, and the two
regression spot-checks reproduce the review-time numbers exactly.

## Per-finding verification (SSR grep on the served page + live probe)

| # | finding (source) | fix claim | SSR receipt (occurrences) | verdict |
|---|---|---|---|---|
| 1 | MAJOR — theme row consumption claim false (quill + vellum, convergent) | row rewritten "Stamp-side on this family … The rail follows the site theme, not this lane" | "Stamp-side on this family" ×1; "The rail follows the site theme, not this lane" ×1; OLD "flips every semantic token the rail reads" ×0 | **FIXED** (probe below, 5/5 TRUE) |
| 2 | MAJOR — §axes summary claimed "density and theme change the rail's own paint" (both) | density-only count with theme cross-ref | "Density is the one axis whose paint the rail itself consumes" ×1; "theme's .dark bridge flips the raw token layer only — see the theme row" ×1; OLD "Only density and theme change the rail" ×0 | **FIXED** |
| 3 | MAJOR — `theme="dark"` panel presented as working demo (both) | recaptioned documented-absence style | `theme="dark" — .dark stamps the nav; the rail's ink stays site-themed` ×1 (SSR passes `'` raw; my first escaped-pattern grep was a false 0 — resolved by byte-context read) | **FIXED** |
| 4 | MAJOR — axesUsage comment taught the old story (both, code-shown-law) | "theme: supply-side here — … the rail's ink follows the site theme" | ×2 (CodeBlock + same-source drawer) | **FIXED** |
| 5 | MINOR — per-axis table rides PropsTable headers (quill + vellum) | one column-mapping lead-in sentence above the table | "Reading the table: Property is the axis, Type is the real carrier …" ×1; machinery untouched | **FIXED** |
| 6 | MINOR — a11y skips §2.6 density/hit-floor note (vellum) | clause under A11yTable with measured 32/40/48 vs 24px floor | "32 / 40 / 48px at small / default / large" ×1; "WCAG 2.5.8" ×1 — and my independent re-measure returns **exactly 32/40/48** (probe 2) | **FIXED** |
| 7 | NIT — 吃也供 bare-Chinese gloss (quill; vellum carried the ruling) | ruled gloss form at first mention | "the broadcast protocol (吃也供, supply-and-consume)" ×1; OLD "(吃也供 —" prose form ×0 | **FIXED** (grep-receipt below) |
| 8 | NIT — density row omits legacy rung spellings (both) | "The five legacy rung spellings (xs · 2xs · sm · default · lg) also address lanes directly." | ×1; matches `universal-props.schema.ts` §4 frozen alias note | **FIXED** |
| 9 | scribe's own catch — query() bare form vs typing law (post-review fix scope) | `query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')` in ALL mirror sites | typed form ×3 (axesUsage CodeBlock + panel caption + drawer's embedded axes file; 6 `DensityLane` occurrences); OLD bare form ×0; scoped svelte-check: anchor.html carries exactly the ONE pre-existing cx-idiom error at 67:28 — the call-site `QueryResult<string>` error is gone | **FIXED** |
| — | quill NIT 3 (size letter-spacing) — EXCLUDED, vellum's rebuttal stands | no edit made (correct per rebuttal) | incidental probe value: label 13px / letter-spacing 1.04px on BOTH rails, unmoved — the rebuttal's numbers still hold; row text unchanged | **correctly NOT applied** |

## The ONE probe — theme row's honest core (link-ink byte-identity under .dark)

`/tmp/quill-anchor-rv-probe.mjs` → `/tmp/quill-anchor-rv-probe-out.json`
(headless chromium-shell-1243, viewport 1440px). Every clause of the
rewritten row got its own verdict:

| rewritten-row clause | probe | result |
|---|---|---|
| "a resolved dark puts .dark on the nav" | `.dark` in dark rail's nav classList; absent on ambient | **TRUE** (dark-only) |
| "flips the raw token layer (--foreground, --muted-foreground) at that scope" | computed var at the link | `--muted-foreground` `oklch(0.3211 0 0)` → `oklch(0.8452 0 0)`; `--foreground` `0 0 0` → `1 0 0` — **TRUE** |
| "the rail's ink reads the root-anchored --jx-* aliases … never re-substitutes" | `--jx-muted-foreground` at the link | `oklch(0.3211 0 0)` on BOTH — unsubstituted, **TRUE** |
| the core claim both reviewers measured | link computed `color` | `oklch(0.3211 0 0)` ambient vs dark — **byte-identical, TRUE** |
| (side receipt) label stays 13px/1.04px on both | font-size + letter-spacing | **TRUE** |

This reproduces quill's CSSOM read, vellum's class-toggle probe, and
scribe's fix probe — three agents, same numbers. The row is now honest at
every probed point.

## No regressions (spot-checks, both TRUE)

- **query() flip** (probe 2 + SSR): responsive rail SSR-stamps
  `data-density="sm"` + `--jx-density-coefficient: 1`; at 1440px client it
  resolves `"lg"` (hit 48px, text 15px); at 900px it flips back `"sm"` —
  boundary behavior intact, demo note still literally true.
- **density channels** (probe 2): hit `--jx-hit` consumed as link
  min-height 32/40/48px at sm/default/lg; text 12/13/15px; line 18/20/24px;
  stack calc 4/8/8px — matches vellum's review-time ladder and quill's
  channel reads; coefficient 1 on all named rungs. The TokenTable's
  "rung scale × coefficient" equations untouched (6 rows + hairline).

## NEW-wording spot-checks (my lenses)

- **disagreement-probe** (the hit-floor clause introduces new demo
  numbers): independently re-measured the link's computed min-height on
  all three density rails → 32/40/48px, agreeing with the clause to the
  pixel. Honest numbers, not invented.
- **grep-receipt** (the broadcast-protocol gloss is a new broadcast
  claim): ruled form present exactly ×1 and it IS the first prose mention
  (byte-offset check; the only earlier 吃也供 in the document is a family-CSS
  source comment inside the inlined stylesheet — "the root-sheet half of
  the broadcast protocol (吃也供)" — pre-existing, out of docs scope, the
  drift-ledger's territory, not a §4 violation on this page).
- Ruling alignment: W-next #1 ("pages must document theme as supply-side
  until the protocol pass", research/family-comment-drift.md) — the row's
  "Stamp-side on this family" + comment's "supply-side here" follow it.

## Gates (my own runs, log-file + $? discipline)

| gate | result | evidence |
|---|---|---|
| `verify:tailwindless` | GREEN, receipt UNMOVED | exit 0; verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` (/tmp/quill-anchor-rv-tl.log) |
| `verify:docs-universal` | GREEN 110/110 | exit 0; "110/110 component pages render the shared universal section (110 markers)" (/tmp/quill-anchor-rv-du.log) |
| `verify:docs` | GREEN | exit 0; skeleton lint staged scope green (/tmp/quill-anchor-rv-vd.log) |
| dev-smoke :5241 | PASS | SSR 200 / 940,856 B; marker ×1; per-finding greps above |
| scoped svelte-check | matches fix receipt | `npx svelte-check --workspace apps/www --output machine` → COMPLETED 2479 FILES **1645** ERRORS 1031 WARNINGS (scribe's final state exact; my first `grep -c ERROR` said 1646 — it counted the COMPLETED line itself); anchor.html → exactly ONE line, the pre-existing cx-idiom 67:28 (/tmp/quill-anchor-rv-sc.log) |

## Process receipt

Dev server started for this re-verify: wrapper PID 28424
(`npm run dev -- --port 5241 --strictPort` → /tmp/quill-anchor-rv-dev.log),
vite listener PID 28453 (lsof :5241). Killed by PID after the gates;
`ps -p 28424 28453` → both gone; `lsof -i :5241 -sTCP:LISTEN` → empty
(exit 1); zero leftover `vite.*5241` processes; zero chrome-headless-shell
processes (probe chromium exited with the driver; host's unrelated Chrome
untouched). Probe scripts + SSR capture live in /tmp only
(quill-anchor-rv-probe.mjs, quill-anchor-rv-probe2.mjs, and their -out.json
receipts, quill-anchor-rv-ssr.html); no repo files touched outside this
report. No commits, no push. Measurement-only verification — the one image
free zone held: no visual judgment entered any verdict.
