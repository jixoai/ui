# TASK 63 — SECOND REVIEW scroll-area (marginalia, 2026-09-23; 2nd of 2)

- **Reviewer**: marginalia (second reviewer; independence law held — vellum's report 38 and
  scribe's report 50 NOT read before the findings below were fixed; the concordance
  addendum follows after filing).
- **Target**: vellum's page — `scroll-area.html/+page.svelte` (760 lines) + `+page.ts`
  (14-entry toc) + the family (svelte 339 / stylex / css / defaults) over the
  scroll-area-kit kernel (core + hand-drawn adapter). Scribe's 1st PASS named zero page
  changes; this review re-derives the surface fresh. Zero edits by me.
- **VERDICT: PASS — the page closes.** 0 MAJOR / **1 MINOR (family-level, rides
  closure)** / 0 LOW / 0 NIT. Every dispatched claim verified live; one family mechanism
  receipt (the SSR viewport-id counter) fails the warm-reload law and rides closure with a
  known one-line fix shape.
- **⚠ URGENT CROSS-TASK FLAG (not this page's blocker)**: the separator page is DOWN on
  main — commit `7f1b78ff` integrated my task-61 MINOR correction with a raw apostrophe
  ("the strip's paint") inside a single-quoted string; the Svelte compile fails
  (`js_parse_error` at +page.svelte 505:1580, live **HTTP 500**, 2 fleet errors). The
  ambient suite's 6 failures this pass are ALL that regression. Fix: escape `\'` (or
  re-quote the string) in the theming TokenTable's solid-fill row.

## The dispatched surface — verified TRUE

1. **THE STAMP TOPOLOGY — OWN REGION ROOT, VERIFIED on the 9-cell radius × width matrix.**
   The region's style attribute is the ONE joined stamp, and every radius mode reads
   exactly right:
   - default (no radius): style attr **null** — square-cut ambient, nothing stamped;
   - `radius={6}`: **`--jx-radius-effective: 6px; --jx-scroll-thumb-radius: 6px`** — the
     axis carriers AND the thumb-corner literal in ONE attribute, and the px number
     **double-stamps** as the universal radius anchor for descendants (the owned-name
     collision receipt: one number, two jobs, one attribute);
   - `radius="full"`: **`--jx-scroll-thumb-radius: calc(infinity * 1px)`** only — 'full'
     stays outside RadiusLane, no axis carrier.
   All three × the three width tiers (`data-width` thin/auto/wide) × `orientation="both"`
   — 9 regions, every cell live.
2. **THE THUMB CONTRACT AT INVARIANT FORM — VERIFIED at three scroll states.** Driving the
   capsule demo's viewport (top / middle / end): **thumbFrac == clientFrac at every state
   (0.18 == 0.18)**; the position ratio equals the thumb's track ratio **(0/0, 0.61/0.61,
   1/1)**; `aria-valuenow` tracks 0 → 61 → 100 with role="scrollbar" — the a11y contract
   and the geometry move together, and the ratio is viewport-relative (scribe's NIT form,
   confirmed).
3. **THE PINS TIMELINE — VERIFIED on the family holder.** Region focus pins the chrome
   (`data-thumb-live="on"` appears); blur + 2s clears it (null — the ~700ms idle fade plus
   margin). The holder attribute cycles as the receipts paragraph states.
4. **THE FROZEN-INK WATCH — NEGATIVE VERIFIED AT THE PAINT (the new craft law applied).**
   The thumb's computed paint (its own `backgroundColor`, not a container var read):
   - baseline: **oklab(0 0 0 / 0.3)** (currentColor at 30%, the region's text color
     oklch(0 0 0));
   - a **bare `.dark` island on the region alone**: thumb paint **UNCHANGED** (the island
     re-declares token values; currentColor did not move — the precise edge the axis row
     teaches);
   - **re-theming the stage's text color** (`color: rgb(200,60,60)`): the thumb **follows**
     (oklab(0.562 0.16 0.074 / 0.3)). currentColor is inheritance — no frozen pin, in both
     directions, at the element's computed usage.
5. **THE QUERY SEAT — both directions VERIFIED**: the region's style attr flips
   `--jx-size-effective: 18px` (1440) ↔ **13px** (600) across the 48rem key, computed
   font-size following; nothing in the family consumes it (the zero-reader receipt).
6. **+page.ts toc == served DOM — VERIFIED**: 14 entries (overview, live-demo, capsule,
   chrome-params, platform-sibling, the-kit, virtual-scrolling, toc-metadata, types, usage,
   theming, api, universal-props, accessibility), every href resolves.
7. **LAW #18 — mounted children VERIFIED at list depth**: the capsule demo **60** log
   lines; the types pair **12** (vertical) and **16** (horizontal); plus the chrome matrix
   mounts 9 regions × 24 cards.
8. **THE KIT-BOUNDARY TRIANGLE — grep-CONFIRMED**: the family consumes the kit
   (`$lib/scroll-area-kit/hand-drawn.svelte` + `core`); the kit files import no family
   file — one-way kernel dependency, the triangle's third side is the shared payload.
9. **Scribe's two NITs — nothing owed, both re-receipted**: the ratio math is
   viewport-relative (verified above); the api table's row ledger serves 10 rows including
   the getViewport() export row.

## Standard battery

- **SSR/post-settle duality**: clean within each render (see the MINOR — across renders
  the viewport-id counter drifts; every other byte identical, diff-isolated).
- **EXTRA-lane by name**: canvases "scroll-area", "scroll-area · capsule",
  "scroll-area · chrome params", "scroll-area · toc metadata", "scroll-area · axes",
  "scroll-area · query()", "ScrollArea · universal props" — all mounted post-reveal.
- **Measurement-first / THEME-SPLIT**: the frozen-ink watch measured at the thumb's
  computed paint in three states (above); the dark bridge receipted via class:dark.
- **Vocabulary-grep**: zero axis-carrier readers in the family (the axis rows' grep
  receipts hold — size/shape/color/elevation/motion unread; motion consumed as the
  reduced-motion FLOOR by the kit adapter, not a channel).
- **LAW #19 one receipt line**: zero duplicate ids (SSR + live), h1 ×1, toc 14/14
  resolving, 0 undefined/null literals.

## Findings (severity-tagged)

1. **[MINOR — the SSR viewport-id counter drifts across requests]** the family's
   module-level `nextViewportId` (++ per instance, scroll-area.svelte :52-56 + :196) makes
   every SSR render's viewport ids grow (`jx-scroll-viewport-89…121` → `122…` on the next
   request): **byte-identical warm-reload fails** (diff-isolated: zero non-id bytes
   change), the source comment's "SSR unique + stable" is only half true, and hydration
   patches the id/aria-controls attributes client-side. Within-render uniqueness holds and
   nothing user-visible breaks (all probes drove the served page). Fix shape: `$props.id()`
   (the system-dialog root's per-instance form) instead of the module counter — per-instance
   stable AND SSR-stable. Rides closure; family-level, one line.
2. **[NONE]** otherwise — the stamp topology, the thumb contract, the pins, the frozen-ink
   negative, the query seat, and the toc all verify; no MAJOR, no LOW.

## Gates

| Gate | Result |
|---|---|
| ambient solo | **278/284, exit 1 — all 6 failures are separator.html CompileError** (`js_parse_error` at :505 — the committed 7f1b78ff regression, see the flag above); **scroll-area rows pass** (deny-lint ✓, its matrix rows ✓); zero scroll-area keys in the failures |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 2495 files) | **page 0 diagnostics** (the one grep hit is native-scroll-area.html — a different family); family warnings are the fleet pattern; fleet 1566/1028/605; separator.html carries the 2 parse errors (the flag) |
| Raw SSR | dups 0; h1 ×1; toc 14/14; the id-drift diff-isolated (see the MINOR) |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper (pid 65498 / pgid 65486) → vite killed
  by pgid TERM + stragglers -9; **port after: empty (exit 1)**.
- **NO commits, NO pushes; zero product-tree edits.** The frozen-ink probe's island and
  recolor fully unwound; scroll states self-resolved.
- Independence: vellum's report 38 and scribe's report 50 not read before the findings
  were fixed.
- Instrument honesty: my first LAW #18 census stopped one DOM level short (the content div
  wraps the list) — re-censused at list depth; dsf 1, viewport-clip space.
- Artifacts: /tmp/marginalia-63-probe{1,2}.mjs, /tmp/m63-{a,b}.html,
  /tmp/marginalia-63-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading vellum's report 38 and scribe's report 50)

## Concordance addendum (appended after reading vellum's report 38 and scribe's report 50)

My findings above were fixed before this section; cross-check against both:

- **FULL CONCORDANCE with scribe's 1st PASS**: the stamp topology (source + boundary
  greps), the thumb invariant at her geometry (0.180 == mine 0.18), the verdict vocabulary
  (her start-closed discovery explains why naive at-top probes see no live attribute), the
  pins timeline (her armed-watcher 52ms/716ms trace with the track-fades-never-the-thumb
  receipt; my focus/blur cycle concurs at coarser sampling), the radius ladder with the
  engine-capped capsule, the double-stamp form (her 20px specimen, my 6px cells), the
  frozen-ink negative both directions (her red re-theme, mine rgb(200,60,60) — same law),
  the query seat both directions, LAW #18 60/12/16 digit-exact, LAW #19 zero dups, page 0
  diagnostics, and her two NITs as nothing-owed.
- **FULL CONCORDANCE with vellum's CODE receipts**: the own-region-root topology, the
  thumb contract at her viewport (0.333 == client/scroll — the invariant again), the width
  tiers, the pins, the frozen-ink watch negative, the query seat, LAW #18, toc == DOM —
  and her "module counter, SSR-stable" claim is the one my MINOR sharpens: stable WITHIN a
  render, drifting ACROSS requests (the diff-isolated receipt).
- **ADDITIONS (mine)**: the MINOR (the cross-request viewport-id drift — new to the
  ledger; neither prior review ran a byte-compare across fetches); the 9-cell per-cell
  style-attr receipts (default null / px double-stamp / full literal-only, each × three
  width tiers); the LAW #18 census at list depth (the content div wraps the list — a
  one-level-short census reads 1/1/1); the kit triangle as a one-way import grep; and the
  frozen-ink watch at computed usage with an independent recolor value.
- **Urgent cross-task flag (restated for the ledger)**: separator.html serves **500** on
  main — 7f1b78ff integrated the task-61 MINOR correction with an unescaped apostrophe
  ("the strip's paint") inside a single-quoted string (js_parse_error at :505). The ambient
  suite's 6 failures key there; the fix is escaping the apostrophe. Not scroll-area's
  blocker; scroll-area's own rows pass.
