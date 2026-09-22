# Report 3 — FIX blockquote (marginalia's NEEDS-WORK + scribe's addendum)

- agent: quill · round 3 · task 3 · 2026-09-22
- fixes applied to: `apps/www/src/routes/docs/components/blockquote.html/+page.svelte`
  (+ `+page.ts`), `apps/www/src/lib/ui/props-table/docs/blockquote.docs.ts`,
  re-pin in `apps/www/test/canvas-same-source.spec.ts`
- inputs: `agents/marginalia/reports/2-review-blockquote.md` (all 3 findings)
  + orchestrator addendum carrying `agents/scribe/reports/3-review-blockquote.md`
  findings 2/4/5 (1 MAJOR + 2 NIT; scribe's 1/3 overlap marginalia's 2/3 and
  were fixed in the same pass — one round, no micro-fix needed)
- learning task done: read `agents/vellum/experience.md` first; the fix's
  receipt is a live-measurement probe (below). Technique recorded in my
  experience.md under "Learned from vellum".

## Per-finding fixes

### Finding 1 — BLOCKER, the size-axis mechanism (marginalia)
The kernel stamps INLINE `--jx-size-effective: <v>; font-size:
var(--jx-size-effective, 1rem)` (defaults.svelte.ts:575) and the style
attribute outranks the @layer `:where([data-jx-blockquote]){font-size:
0.875em}` (blockquote.css:39-41) — so an explicit size REPLACES the em
voice; the voice is the auto-only ambient rescale. Rewrote all five
flagged locations:
- `+page.svelte` size row: "an explicit size REPLACES the em voice … the
  quote renders the stamped size verbatim (14 → 14px; large →
  var(--jx-size-large) = 18px). The 0.875em body voice … is the auto-only
  ambient rescale — it never rides on top of an explicit size." (The
  label/cite chrome claim survived review — `var(--jx-text-base)` is
  rem-anchored 13px, blockquote.stylex.ts:117/124 — kept, annotated
  "rem-anchored".)
- axes canvas description: "the root renders the stamped size verbatim —
  an explicit size REPLACES the 0.875em em voice, which applies only at
  auto"; dropped the false "voice below the viewport" phrasing.
- demo "size 14": "the body renders 14px, not 0.875 × 14; the em voice is
  auto-only" (the false 12.25px claim deleted).
- demo "size large": "renders it verbatim — 18px, no em rescale on top".
- demo "responsive": "the stamped size lands verbatim at each rung".
- `blockquote.docs.ts` children override: "At auto the body rides 0.875em
  …; an explicit size REPLACES that em voice — the root renders the
  stamped size verbatim and the body copy follows it."
As predicted, no pins broke (the axes canvas has no snapshot pin).

### Finding 2 — MAJOR, density row overstated consumption (marginalia; scribe concurs)
I re-verified before writing: `rg` over `lib/ui/blockquote/` shows the
family reads only `--jx-unit` (paddings, stylex:52/60), `--jx-space-12`
(:61), `--jx-space-8` (labelRow gap, :115), `var(--jx-text-base)` (:117/124)
— zero hits for `--jx-stack/--jx-gap/--jx-text`, zero reads of
`data-density`. The row now states the supply-to-composed-children story
with the real scope names: "stamps --jx-density-coefficient and the
data-density rung attribute on the root; the kernel's [data-density] scope
blocks then re-declare the density channels (--jx-text, --jx-gap,
--jx-stack, --jx-hit …) at the quote root, so kernel-bearing content
composed into the body follows the rung. A bare number stamps the
coefficient only — no rung attribute, no scope block matches, nothing
recomposes (the declaring-element law). No blockquote css reads any
channel: the quote's own paint is fixed…". The section summary's miscount
is fixed too: "Two axes are consumed on the quote itself (size, theme);
density is scope-only — its rung re-bases the kernel channels for content
composed into the body while the quote's own paint stays fixed; five are
supply-only…".

### Finding 3 — MINOR, stale "shadow-4" label ×2 (marginalia; scribe finding 3 concurs)
`rule="shadow" ruleSize={1}` retitled "shadow-1 — the hairline: a 1px
inset rule painted over geometry." (was "shadow-4 — the default: …", which
contradicted the rendered `data-jx-blockquote-rule="shadow-1"` hook and the
adjacent "4 won the browser review" panel). The ×2 ships from one source
line (canvas + drawer via resolveRawCode) — fixed once, and the rule
inline snapshot re-pinned once (canvas-same-source.spec.ts) to cover both
caption edits.

### Addendum MAJOR — stale toc (scribe finding 2)
`+page.ts` rebuilt to the page DOM in the campaign standard's shape
(anchor/breadcrumb precedent, Overview + The eight axes rows):
overview → usage → rungs → The rule channel → Composition → API → The
eight axes → accessibility. The eight-axes section is reachable from page
navigation again (probe: `a[href="#axes"]` present in served + built HTML).

### Addendum NIT — density type cell (scribe finding 4)
Type cell now carries the full DensityLane verbatim from
universal-props.schema.ts:71: `'small' | 'medium' | 'large' | 'xs' | '2xs'
| 'sm' | 'default' | 'lg' | 'auto' | number`.

### Addendum NIT — "still 0.875rem of pad" (scribe finding 5)
Retitled "pad fixed at 14px (calc(var(--jx-unit) * 3.5))" — no more unit
collision with the 0.875em body-voice vocabulary (also covered by the
snapshot re-pin).

### Orchestrator ruling (吃也供, mdn-doc-style §6)
Checked: the term does not appear anywhere on my page or curation — no
first mention to gloss; ruling recorded for the next quill page that
introduces it.

## The fix's receipt — live measurement (21/21 PASS)

Probe: playwright-core against the dev server :5241
(/tmp/quill-bq-axis-probe.mjs, log /tmp/quill-bq-axis-probe.log), vellum's
axis-honesty pattern. Key lines:

- BLOCKER: size-14 root computes **14px verbatim** (ambient parent 16px) —
  not 12.25px; stamps read `--jx-size-effective: 14px; font-size:
  var(--jx-size-effective, 1rem)` inline.
- BLOCKER: size-large computes **18px verbatim** — not 15.75px.
- The em voice lives ONLY at auto: auto quote has empty style attr, no
  data-density, and computes 14px = 0.8750 × parent 16px (measured ratio).
- theme dark: `.dark` class present, zero `--jx-` style vars.
- query(): ≥48rem → 16px verbatim; 600px viewport → 14px; back → 16px
  (live matchMedia re-resolution, rAF-settled).
- Rewritten copy ships: "12.25" gone, "shadow-4 — the default" gone,
  "0.875rem of pad" gone; "REPLACES the em voice", "own paint is fixed",
  "Two axes are consumed on the quote itself (size, theme)" all present.
- Surfaces: exactly 1 `data-jx-props-table-universal`; 8 per-axis rows;
  toc reaches #axes/#rule/#overview.
- Built dist verified separately (post-build grep): all fixed strings
  present at the expected ×1/×2 multiplicities, all stale strings ×0.

## Learning outcome (also in experience.md, "Learned from vellum")

My BLOCKER was vellum's disease exactly: I documented a mechanism read
from css files and missed the kernel's inline stamp — a style attribute
outranks @layer rules, so the cascade I described never ran at explicit
sizes. The adopted technique: (1) read the SERVED markup for stamps
before writing mechanism prose; (2) after writing a per-axis table, run a
computed-style probe asserting every row's claim; (3) probe BOTH sides of
a claim — positive-only checks would have passed with the falsehood
standing (14px at auto ≡ 14px at size=14 is the coincidence that carried
the lie through two rounds).

## Gates (tails)

- `npx vitest run test/canvas-same-source.spec.ts` (solo, apps/www) →
  **Tests 41 passed (41)** with the re-pinned rule snapshot (the "close
  timed out" teardown nag is pre-existing).
- `npm run verify:tailwindless` (root) → GREEN, receipt **UNMOVED
  verbatim**: "files=2 identities=7 occurrences=7 zones={routes:1,
  site-libs:0, ui:6} forms=42 — bound verbatim".
- `npm run build` (apps/www) → EXIT:0; `npm run verify:docs-universal` →
  "GREEN: 110/110 component pages render the shared universal section
  (110 markers)".
- `npm run verify:docs` → "✓ all docs pages pass the skeleton lint
  (staged scope green)".
- Probe: **21/21** (details above; log kept at /tmp/quill-bq-axis-probe.log).

## Processes (receipt)

- Dev server: started on MY port 5241 --strictPort (npm-exec wrapper PID
  72884, vite child 72915); killed by PID after the probe; `lsof -ti
  :5241` → empty; `pgrep -fl "port 5241"` → none.
- Leftover noted, NOT mine, untouched: a vite dev on :5242 (PID 45553,
  vellum's port) was already listening before I started — flagged for the
  orchestrator in case vellum leaked it.
- Shared-worktree courtesy honored: `pgrep -fl "vite build"` checked
  before building — no sibling build in flight.
- No commits, no push. Working-tree footprint: the four files above +
  my experience.md (sibling agents' experience/BOARD/assignment edits
  predate this task and were not touched by me).
- Scratch artifacts (repo-clean): /tmp/quill-bq-axis-probe.mjs,
  /tmp/quill-bq-axis-probe.log, /tmp/quill-bq-fix-{dev.log,pid,tw.log,
  univ.log,docs.log,build.log}.
