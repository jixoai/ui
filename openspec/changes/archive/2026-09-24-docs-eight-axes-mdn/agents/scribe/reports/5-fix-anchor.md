# Report 5 — scribe FIX of anchor per both reviews (quill + vellum)

- agent: scribe · date: 2026-09-22 · fixes land on
  `apps/www/src/routes/docs/components/anchor.html/+page.svelte`
  (working tree, NO commits — main dir, HEAD `d33a4f06`)
- inputs: `agents/quill/reports/2-review-anchor.md` +
  `agents/vellum/reports/2-review-anchor.md` (both read in full; verdicts
  converged on one MAJOR, each carried unique findings — all adjudicated
  below, including vellum's accepted rebuttal of quill's NIT 3)
- ruling applied: research/family-comment-drift.md W-next #1 — "Pages must
  document theme as supply-side until the protocol pass."

## Per-finding fixes (all in the one page file; diff = 6 hunks, no family
## files touched)

### MAJOR (both reviews, convergent) — theme row + §axes summary + dark panel

The false claim ("the other axis the rail consumes … flips every semantic
token the rail reads" / "Only density and theme change the rail's own
paint") is rewritten to the measured mechanism, per the W-next ruling:

1. **Theme row** (axisRows.theme): now opens "Stamp-side on this family" —
   a resolved dark puts `.dark` on the nav and flips the RAW token layer
   (`--foreground`, `--muted-foreground`) at that scope, but the rail's ink
   reads the root-anchored `--jx-*` aliases, declared only at `:root` and
   the stylex theme scopes, which a plain `.dark` never re-substitutes —
   "The rail follows the site theme, not this lane."
2. **§axes summary**: consumption count corrected to density ONLY —
   "Density is the one axis whose paint the rail itself consumes; the other
   seven stamp-and-supply carriers its paint does not read (theme's .dark
   bridge flips the raw token layer only — see the theme row)." The
   consumed-vs-stamp-and-supply split survives, corrected to the honest
   count.
3. **`theme="dark"` panel: recaptioned, not dropped** (the documented-
   absence captioning style, same as the ambient panel): the caption now
   states the honest behavior inline —
   `theme="dark" — .dark stamps the nav; the rail's ink stays site-themed`.
   The panel still earns its place: it demonstrates the §11 bridge stamp
   (grep-able in SSR) while the caption carries the non-consumption.
4. **axesUsage comment** (code shown = code running): "theme: supply-side
   here — a resolved dark stamps the .dark class bridge on the nav; the
   rail's ink follows the site theme".

Measurement receipt (computed-style probes on :5243, headless chromium via
playwright-core, `/tmp/scribe-anchor-fix-probe.mjs` →
`/tmp/scribe-anchor-probe-out.json`):

| probe | ambient rail | theme="dark" rail | verdict |
|---|---|---|---|
| link computed `color` | `oklch(0.3211 0 0)` | `oklch(0.3211 0 0)` | **byte-identical — TRUE** |
| `--jx-muted-foreground` at link | `oklch(0.3211 0 0)` | `oklch(0.3211 0 0)` | root-anchored alias unsubstituted — TRUE |
| `--muted-foreground` at link (raw layer) | `oklch(0.3211 0 0)` | `oklch(0.8452 0 0)` | raw token layer flips at the `.dark` scope — TRUE |
| `.dark` in nav classList | false | true | §11 bridge stamps — TRUE |
| label font-size / letter-spacing | 13px / 1.04px | 13px / 1.04px | size row stays honest — TRUE |

This re-produces (and agrees with) both reviewers' core numbers: quill's
CSSOM read and vellum's class-toggle probe — the claim I originally wrote
is false in effect, the rewritten row is true at every probed point.

### MINOR (both) — axis-table column-mapping lead-in

One lead-in sentence added directly above `<PropsTable … props={axisRows}>`:
"Reading the table: Property is the axis, Type is the real carrier it
stamps on the nav here, Default is the lane default — the named steps,
number unit, and consumption on this family are in each description."
Machinery untouched (no-new-page-machinery law holds); steps/units are now
mapped, not buried.

### MINOR (vellum) — Accessibility density/hit-floor note

Clause added under the A11yTable: "Density is also the hit-surface axis
here: the link's minimum target height (--jx-hit) measures 32 / 40 / 48px
at small / default / large — every rung clears the 24px WCAG 2.5.8 AA
target floor." The numbers are re-measured, not copied: computed
`min-height` of the rails' first links on :5243 → sm 32px · default 40px ·
lg 48px (`/tmp/scribe-anchor-hit-probe.mjs`), matching vellum's ladder and
the `--jx-hit` max() terms (8U/10U/12U).

### NIT (both) — 吃也供 gloss at first mention

The §6 ruling form applied in the summary (its first and only mention on
the page): "… read the supply, the broadcast protocol (吃也供,
supply-and-consume)". The old bare-Chinese parenthetical is gone.

### NIT (both) — density row's five legacy rung spellings

Density row now closes: "The five legacy rung spellings (xs · 2xs · sm ·
default · lg) also address lanes directly." Verified against
`universal-props.schema.ts` §4 (FROZEN alias note: "the five legacy
spellings keep working with ZERO migration").

### NIT 3 (quill) — NOT applied; vellum's rebuttal accepted

The size row's "The labels do not follow" wording stands exactly as
written (vellum's exact-mechanism r7 probe: the em-based track resolves
against the link's own density-channel font-size, not the nav/root; label
13px / letter-spacing 1.04px unmoved under a real size stamp — and my fix
probe re-confirmed both values equal across the ambient/dark rails). No
edit made.

### REBUTTAL RESPECTED — query() demo vs the new typing law

The demo did NOT use the banned single-arg generic form — it was the
bare two-runtime-arg form, `query({ lg: 'large' }, 'small')`, with no
explicit type args (so B's inference was never disabled). BUT the scoped
svelte-check run caught a real error at the call site anyway (the same
disease, one step earlier): the bare object literal widens the case value
so T infers `QueryResult<string>`, and `density` rejects it —
`Type 'QueryResult<string>' is not assignable to type … QueryResult<DensityLane>`
(accordion's own comment names this exact mechanism: "the object literal
alone would infer QueryResult<string>"). Fixed to the §6-ruled BOTH-args
form, the same shape the post-law exemplars (alert, badge) ship:

`query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')`

…applied in all three places that must stay identical (code shown = code
running, and captions are curl-able assertions): the running canvas rail,
the axesUsage snippet (whose comment now teaches why: "the bare form
infers QueryResult<string> — a type error"), and the panel caption. Added
`import type { DensityLane } from '$lib/defaults.svelte'` (the fleet
convention, re-exported at defaults.svelte:62). svelte-check's scoped
result is the machine receipt: the anchor page is now down to the ONE
pre-existing cx-idiom error already logged for the orchestrator.

## Gates (my runs; log-file + explicit $? discipline)

| gate | result | evidence |
|---|---|---|
| dev-smoke :5243 | PASS (final state) | vite listener PID 5367; SSR `HTTP 200 / 940856 bytes`; marker `data-jx-props-table-universal` ×1; SSR greps ×1 each: theme row, density-only summary, gloss, recaption, legacy spellings, lead-in, hit-floor note, typed query form (CodeBlock + caption, HTML-escaped `&lt;` in text nodes — 6 `DensityLane` hits total); old false claim ×0; old bare query form ×0 (4 other "WCAG 2.5.8" hits are the same-source drawer's embedded family CSS — pre-existing) |
| fix probe (byte-identity) | PASS, all 6 verdicts TRUE | `/tmp/scribe-anchor-probe-out.json` — link `color` byte-identical `oklch(0.3211 0 0)` ambient vs dark; `--jx-muted-foreground` unsubstituted on both; `--muted-foreground` flips `0.3211 → 0.8452`; `.dark` on dark nav only; label 13px/1.04px on both |
| hit ladder probe | PASS | computed link `min-height`: sm 32px · default 40px · lg 48px (`/tmp/scribe-anchor-hit-probe.mjs`) — the a11y clause's exact numbers |
| `verify:tailwindless` | GREEN, receipt UNMOVED | exit 0; verbatim `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` (/tmp/scribe-anchor-tl.log) |
| `verify:docs-universal` | GREEN 110/110 | exit 0; "110/110 component pages render the shared universal section (110 markers)" (/tmp/scribe-anchor-du.log) |
| `verify:docs` | GREEN | exit 0; "all docs pages pass the skeleton lint (staged scope green)" (/tmp/scribe-anchor-vd.log) |
| affected specs solo | VALID | `openspec validate docs-eight-axes-mdn` → "Change 'docs-eight-axes-mdn' is valid", exit 0 |
| svelte-check (REPO ROOT, scoped) | PASS at page scope | `npx svelte-check --workspace apps/www --output machine` → grep `anchor.html`: 1 hit, the pre-existing cx-idiom 67:28 only; the query() call-site error eliminated (tail above; /tmp/scribe-anchor-svelte-check.log) |

svelte-check scoped tail (FINAL state): workspace 2479 files, 1645 errors
(was 1646 — the one removed is mine), 1031 warnings. Grep `anchor.html` →
exactly ONE line, the KNOWN pre-existing cx-idiom error at 67:28
(`Object.entries` overload vs `.filter(Boolean)`'s `undefined` — same
error as before the fix, shifted +1 by the import line; per
experience.md "Upgrades applied back to my pages": the fix is a fleet
cx-idiom change, logged for the orchestrator, per-page patches would fork
the idiom). The query() demo error is GONE — the typing-law fix is
machine-verified. Full-run exit 1 is the documented workspace noise, not
a page regression.

## Process receipt

Dev server started for this fix: wrapper PID 5339 (`npm run dev -- --port
5243 --strictPort`, nohup → /tmp/scribe-anchor-dev.log), vite listener PID
5367 (lsof :5243). Kill-by-PID after the gates with `lsof` re-check →
empty (exit 1). Probe chromium processes exited with the driver (no
ms-playwright leftovers; host's unrelated Chrome processes untouched).
Probe scripts and captures live in /tmp only
(scribe-anchor-fix-probe.mjs, scribe-anchor-hit-probe.mjs,
scribe-anchor-ssr.html, scribe-anchor-probe-out.json); no repo files
touched outside my page + this report/experience pair. No commits, no
push. Measurement-only verification — no visual judgments entered any
verdict (the black-image law; every number above is a computed-style or
grep receipt).
