# T111 — statistic (docs page) — 1st eight-axes review (marginalia)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 2 LOW / 1 NIT — Tier 2 proposed**

Owner = scribe; 1st review (vellum holds the 2nd). Independence: my own reads
+ probes. Page:
`apps/www/src/routes/docs/components/statistic.html/+page.svelte` (397
lines). Family read in full: `statistic.svelte` (151),
`statistic.stylex.ts` (67), `statistic-defaults.svelte.ts` (47), `index.ts`
(6). No css file on either side (the family is stylex-only, zero css residue
— source :10-16). **Registry twins byte-checked: all 5 files
cmp-identical.**

Process: port 5244 mine (killed at end — lsof post_rc=1, no orphans). Probes
/tmp/marginalia-111-probe1.mjs (partial — the batch probe died on the grid
page's Vite reload before reaching statistic) + probe2.mjs (statistic
complete). Dist 9f70476b. No fixes applied.

---

## 1. Verified TRUE with digits

- **Trend voices**: the up glyph ▲ paints `oklch(0.6489 0.237 346)` ==
  `--jx-primary` (brand voice ✓); the down glyph ▼ paints `oklch(0 0 0)` ==
  `--jx-destructive` (black IS destructive in the one-hue light theme — the
  T106 resolution applied); `aria-label="trend up"` on the glyph ✓; the
  value row's face is `tabular-nums` ✓. Text-glyph trends (▲/▼, no icon
  dependency) ✓ source :146.
- **The countdown recipe, live**: start → 01:29 → 01:27 at the 1s cadence;
  the value's width **87.02px → 87.02px** across different digits — the
  "tabular-nums face keeps every frame the same width, no layout shift"
  claim TRUE to the hundredth; pause freezes (01:27 held 1.4s later) ✓;
  the interval clears on pause (source :67-72; the finished-at-zero clamp
  and one-shot flag are source-level :59-63 — the 90s window was not waited
  out live). The page-owned tick law (the component renders the handed
  value) is the composition story and matches the source exactly.
- **The affix + precision matrix, live**: one raw 1234.5 through the
  segmented control — **1,234.50 → 1,235 → 1,234.500** at digits 2/0/3
  (Intl.NumberFormat, live re-format); affixes $/USD/%/ms render muted ✓
  ("the affixes are snippets — muted by the component's own affix paint" ✓,
  stylex affix atom muted-foreground).
- **Density**: the DensityDemo trio (xs/default/lg — three scopes as
  authored) yields value sizes **24/30/36px** over the --jx-line channel —
  the tokens' "density scale" rows TRUE; clone census 3, unique (LAW #19 —
  data-density absent at auto on all three, the ambient scope channel
  flowing, exactly as the no-opinion law says).
- **Size axis consumed**: `size={18}` → root `--jx-size-effective: 18px`
  inline + computed 18px; `size="medium"` → `var(--jx-size-medium)` → 16px
  — "the size axis scales the root" TRUE.
- **Toc**: authored 12 = rail 12 = DOM 12, order match, zero dead anchors —
  clean (no list-class drift on this page).
- **LAW #18**: no `{#each}`. All-no-own defaults (8 no-own slots) ✓.
- **Rendered API tables: [5, 8]** — title*/value*/trend/prefix/suffix +
  the universal fold's axis rows (the `density` array row dedupes into the
  fold's density row — rendered census confirms 5, not 6).

## 2. Findings

**LOW-1 — `radius="large"` is demoed on a family with zero radius readers
(stamped-never-consumed, the T104 class).** The universal-props demo (:374)
renders `radius="large"`; the root stamps the radius carrier (inline style
present) and the computed border-radius is **0px** — the family ships no css
file and statistic.stylex.ts reads no `--jx-radius-*` var (grep: zero
readers; the `jx-stat*` hooks are deliberately css-less anchors). Softer
than input's T104 case — the readout is a chromeless column, so there is
nothing visible to round even if consumed — but the demo still implies an
axis behavior the family cannot express. Fix shape: drop radius from the
demo pair (size + density already demonstrate the container contract), or
note it as supply-only in the row.

**LOW-2 — the live countdown demo lacks the sr-only aria-live region its
own help text claims.** The PlayHelp (:309-311): "The sr-only live region
announces the close, not every tick." The LIVE demo (:290-303) renders the
Statistic, the finished Badge and the controls — **no `.sr-only`
aria-live node exists in `#statistic-countdown`** (probe2 ST_LIVE_REGION:
null). The region exists only inside the drawer's recipe string (:121),
which the live markup was mirrored from without it. The a11y table's row is
recipe-scoped ("aria-live (recipe)") so the table itself hedges; the
playground help describes the demo and the demo doesn't have it. Fix shape:
add `<p class="sr-only" aria-live="polite">{finished ? '…' : ''}</p>` to the
live demo (the recipe already shows it) — or scope the help text to the
recipe.

**NIT-1 — the API table omits the `class` prop.** The component merges
`class` through cx (source :87, :134); the rendered table's 5 rows
(title/value/trend/prefix/suffix — density rides the universal fold) don't
include it, and no count claim excuses the omission. Phrasing-level (the
row set is otherwise complete against the rendered surface). Same family
as the campaign's serial api-row nits.

## 3. Notes

- The composition law ("the component never guesses what good means for
  your metric") is real in source: trend is a two-voice static table
  (TREND_CLASS :122-125), affixes are raw snippets, value renders verbatim
  — no formatting, no countdown item, no good/bad judgment anywhere.
- The countdown's "never ticking past zero" is source-true
  (`Math.max(0, …)` + the exact-zero stop, :59-63); live receipt covers the
  cadence, the freeze and the width stability; the zero-crossing itself was
  not waited out (90s window) — source-level, owned in §4.
- T94 audit: the family sheets carry no pseudo-class pairs (stylex atoms +
  zero css). Nothing to spec-match.
- The page's status line ("ticking · 1s interval" / "idle" / "the window
  closed") is a page-owned readout, consistent with the output lane.

## 4. Probe-fault ownership (mine)

- Probe1 died on the GRID page's Vite reload before reaching statistic —
  probe2 re-ran statistic complete with `load` + settle waits (the batch's
  shared lesson; no statistic data lost).
- The finished-flag zero-crossing was not waited out live (90s); the claim
  is receipted at source + the pause/clamp behavior live. Owned as a
  receipt-scope limit.

## 5. Gate record (batch-wide, once)

- ambient solo: 284/284, rc=0. docs-universal: GREEN 110/110, rc=0.
- svelte-check: statistic page 1 error (:177 cx clone) + component 1
  (:116 cx twin) — both filed in the batch's joiner census (LOW, seats as
  reported).
- `npm run verify:docs` (dist 9f70476b) → rc=0 GREEN (the toast red is gone
  — the scribe's T71 landed); staged scope green.
- Server killed: lsof :5244 empty (post_rc=1), no orphans.
