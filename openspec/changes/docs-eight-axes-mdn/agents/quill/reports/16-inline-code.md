# Task 16 — inline-code (tier 3) + heading cx micro-fix · quill · 2026-09-22

**Verdict: LANDED (working tree; no commits).** Part A: the one-line heading
cx predicate (vellum's carried finding) — heading is now a ZERO-diagnostics
page. Part B: inline-code completed to the archetype at tier 3 — the page was
already canonical (525 lines) and heavily invariant-pinned, so the rewrite is
deliberately minimal; the pinned tables are byte-stable.

## Diff

| File | Change |
|---|---|
| `apps/www/src/routes/docs/components/heading.html/+page.svelte` | the avatar-2c185457 template: `.filter(Boolean)` → the type-guard predicate. svelte-check: **0 diagnostics** (fleet 1623→1620 across the accumulated fixes) |
| `apps/www/src/routes/docs/components/inline-code.html/+page.svelte` | + DocsInstall, + Overview (three paragraphs, sourced from the page's own pinned facts), + DocsSeeAlso; the same cx predicate applied (0 diagnostics; fleet →1619); NOTHING else touched |
| `apps/www/src/routes/docs/components/inline-code.html/+page.ts` | ToC: +overview; pre-existing ids kept with unchanged DOM order |

## Why tier 3 (the pins decided)

- **The invariant lock lives in THIS page's hand table**:
  `docs-ambient-vocabulary.spec.ts:453` — `inline-code#variant keeps its
  canonical definePaintSlot 'ambient zone' cell (never edited, never
  matrix-bound)` — `axisRowsOf(pageSource('inline-code'))` must find exactly
  one `variant` row whose default contains 'ambient zone'. Switching the page
  to the generated meta (inline-code.meta.ts EXISTS) would remove that row
  from the page and fail the test. The hand table stays.
- **The matrix multiset** counts this page's table rows by
  (tableIndex, prop, ordinal); the variant row is exempted at :559
  ("invariant-locked"). Any new table expression or row would move keys
  against the frozen matrix.
- **variant-grammar.spec:41** extracts every `registry/files/…` path from the
  page source and requires existence — new prose must not invent paths.
- GRE EN post-edit: `✓ inline-code#variant keeps its canonical …` and
  `✓ inline-code table[0] density#1 → ambient scope` both hold.

So: no meta switch, no curation file, no new table expressions. The Overview
names the law kinships precisely (code-card shares the ENGINE seam — an edge,
named; "avatar-law simplicity" avoided as prose rot bait; grep receipt: only
the blueprint scenes mount the chip — a leaf).

## Heading micro-fix receipt

`.filter(Boolean)` → `.filter((style): style is string | { readonly
[key: string]: string | object } => Boolean(style))` — the exact avatar
2c185457 template. svelte-check: heading.html **0 diagnostics** (was exactly
1, the standing idiom since the W3 era).

## Gates

| Gate | Result |
|---|---|
| svelte-check | heading.html **0** · inline-code.html **0** (fleet 1623→1619) |
| dev-smoke :5241 | 200; PID 86366 killed; `lsof :5241` empty before AND after |
| SSR order | install → overview → demo canvas → variants → … → api ('ambient zone' cell present) → see-also; exactly 1 h1 |
| verify:tailwindless | GREEN — receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs-universal | GREEN 110/110 |
| verify:docs | staged scope green |
| build | exit 0 |
| affected specs solo | 6 files: **5 passed**; docs-ambient-vocabulary has **2 color-picker-only failures — SIBLING-ATTRIBUTED** (below) |

## The 2 red tests: sibling in-flight, attributed

`test/docs-ambient-vocabulary.spec.ts` fails on exactly two assertions, both
color-picker keys: `color-picker table[1] density#1: expected exactly 1 row,
found 0` and `matrix rows with no candidate: 'color-picker|1|density|1'`.
Attribution: the working tree carries a sibling's IN-FLIGHT color-picker
conversion (`color-picker.html/+page.svelte` +390/−120, `+page.ts`, new
`color-picker.docs.ts` untracked, and their partially-updated
`docs-ambient-vocabulary.matrix.json` / `canvas-same-source.spec.ts`) — their
converted page no longer serves the frozen matrix's table[1] density row
while their fixture edit is incomplete. Zero inline-code or heading keys in
either failure; my pages' own assertions pass (the variant invariant, the
matrix row, drawer paths). Per the shared-worktree law I did not touch their
files; the red resolves when their change lands with its fixture update.

No commits made.
