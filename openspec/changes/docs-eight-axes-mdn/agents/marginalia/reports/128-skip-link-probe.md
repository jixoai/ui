# TASK 128 — LULL: the skip-link tabindex + programmatic-focus probe (marginalia, 2026-09-24)

- **The open item** (drift ledger, from my T108 LOW-1): the scaffold's skip link is a
  plain fragment link (`website-scaffold.svelte :304` — `<a href="#main"
  class="jx-skip-link">Skip to content</a>`) and `main#main` (:308) carries no
  `tabindex="-1"`. Enter lands the VIEW at the toc-line (mainTop 74) but focus stays
  behind. The Owner's candidate: `tabindex="-1"` on main + programmatic focus on skip
  activation. This probe produces the deciding receipts — report only, all mutations
  reverted in-probe.
- **Exemplar page**: grid.html (content-heavy, many tabbables inside main). Dev
  :5244, keyboard drives (real Tab/Enter), viewport 1280×900.

## The A/B table

| measurement | Arm A — baseline (current) | Arm B — candidate (tabindex + focus()) |
|---|---|---|
| first Tab (from fresh load) | `.jx-skip-link` focused, revealed (clip-path none) | same (candidate does not touch the link) |
| after Enter (keyboard path) | activeElement = **BODY** — focus did not move | activeElement = **MAIN#main** — focus moved |
| after click (mouse path) | activeElement = **A.jx-skip-link** — stranded ON the skip link | activeElement = **MAIN#main** — focus moved |
| main `:focus` / `:focus-visible` | false / false — nothing paints | **true / true** — ring paints |
| the ring | none 3px (suppressed) | **auto 1px rgb(0, 95, 204)** — around the ENTIRE main (784×5391) — needs the companion `outline: none` line, see verdict |
| view landing (mainRectTop) | **74** = the toc-line | **74** — identical, no fight |
| next Tab after skip | BUTTON.jx-press | BUTTON.jx-press — **IDENTICAL** (see the Chromium finding) |
| layout (main rect) | 784×5391@256 | 784×5391@256 — identical |

## The regression checks (all clean)

1. **main is NOT a tab stop at rest** — with `tabindex="-1"` applied, a 25-Tab walk
   from body never lands on main (sequential stops never read MAIN#main); `-1` is the
   correct value. Programmatic `.focus()` on main still works while `-1` (measured
   true).
2. **Layout unchanged** — main's rect byte-identical with and without the attribute
   (784×5391@256 both).
3. **No scroll fight** — the real T108 path driven live: shell pre-scrolled to its
   max (2613), skip clicked (fragment lands main at mainTop **74** — scroll-padding
   working), then `main.focus()` added on top: **focusDelta 0** — the programmatic
   focus does not re-scroll, does not fight the 106px scroll-padding, does not
   disturb the toc-line landing. (Expected per spec: focus-induced scrolling honors
   scroll-padding; now measured.)
4. **The a11y Enter row's "skip still reads correctly"** — the link's name and first-
   stop behavior are untouched; the candidate changes only where focus lands after
   activation.

## The Chromium finding that sharpens the verdict

**Tab-after-skip starts from inside main in BOTH arms** (next-Tab landed a
`BUTTON.jx-press` whether or not focus moved): Chromium's fragment navigation already
sets the sequential focus navigation starting point to the fragment target. So the
candidate does NOT buy the Tab-restart behavior on this engine — it is already
delivered by the fragment. What the candidate actually buys, measured:

1. **activeElement lands on main** — baseline leaves it on BODY (keyboard path) or
   STRANDED ON THE SKIP LINK (click path: a mouse user's next Tab starts from the
   link, into the header chrome — the worst seat). Screen readers announce the main
   landmark on arrival only when focus is there.
2. **Visual confirmation** — `:focus-visible` paints on main for the keyboard path;
   baseline paints nothing anywhere (the skip "happens" with zero feedback).
3. **Cross-engine consistency** — the starting-point rule is Chromium behavior; the
   focus() pattern is the spec-portable form (and the click-path stranding is
   engine-independent).

## The recommendation: RECOMMEND — land it, with one companion line

**RECOMMEND**: `tabindex="-1"` on main#main + `main.focus()` on skip activation in
`website-scaffold.svelte` (family edit + registry mirror), **plus the standard
companion CSS** `.jx-page-main:focus { outline: none }` (or scoped to the
programmatic case) — measured necessity: without it the candidate paints a full
column-height outline (auto 1px rgb(0, 95, 204) around 784×5391), which is a visual
regression worse than the status quo. With it: focus moves on both paths, the
toc-line landing is preserved exactly (74), scroll is undisturbed (focusDelta 0),
the tab order and layout are untouched, and the a11y table's Enter row can finally
be trued UP to "focus lands on #main" instead of teaching the caveat (retiring my
T108 LOW-1's caveat by making the copy true).

KEEP is defensible only on the Chromium starting-point finding — but the click-path
stranding (measured), the zero visual feedback (measured), and engine portability
are real gaps the three lines close. The receipts favor landing.

## Suggested implementation shape (for the Owner's call — not landed)

```svelte
<a href="#main" class="jx-skip-link" onclick={() => mainEl?.focus()}>Skip to content</a>
<main id="main" bind:this={mainEl} tabindex="-1" class="jx-page-main …">
```
plus `.jx-page-main:focus { outline: none; }` in the sheet. (bind:this or a plain
getElementById in the handler; the click listener fires for keyboard Enter too —
link activation synthesizes click — which my keyboard path exercised: focus moved.)

## Probe-fault ownership

1. **One regression assertion was mislabeled**: `firstStopStillSkip` tested
   `stops[0].includes('#main')` — the skip link has no id, so the check reads false
   regardless; the first-stop-is-skip receipt comes instead from Arm A's direct
   firstStop read (`jx-skip-link` focused, clip-path none) and is solid. The
   load-bearing `mainEverTabStop` check was correctly keyed on MAIN#main and valid.
2. Arm A's next-Tab destination (BUTTON.jx-press) is recorded by class only, not by
   position — enough for the both-arms-identical comparison, not for identifying the
   button.
3. One dev-server start raced the shell mounting on the first settle — no data
   consequence (all arms measure post-settle).

## Gate + process evidence

- **verify:docs rc=0** — staged scope green (existing dist; no rebuild — no sibling
  preview risk taken and none needed for a probe task).
- Port **5244** mine: lsof empty before (rc=1); dev server (wrapper 80210, listener
  80242); **killed BOTH by PID**; final lsof → **empty, rc=1**. No orphans. Sibling
  ports untouched (quill 5241, vellum 5242, scribe 5243, Owner 5230).
- **NO commits, NO pushes; zero product-tree edits.** The candidate arm applied
  `tabindex` + listeners in-page (AbortController-held), the regressions stage
  removed the attribute before the scroll path, and every context closed without
  persistence.
- Artifacts: /tmp/marginalia-128-probe.mjs, /tmp/marginalia-128-{docs,dev}.log,
  /tmp/marginalia-128-wrapper.txt.
