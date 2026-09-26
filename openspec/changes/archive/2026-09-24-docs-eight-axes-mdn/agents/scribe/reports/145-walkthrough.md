# T145 — FINALE WALKTHROUGH, group C: dialog · system-dialog · text · tour (scribe, 2026-09-22)

- **Scope**: vision sweep only — layout breaks, overlaps, clipping, broken/empty
  canvases, contrast disasters (scrim ::backdrop + panel ink), rail rhythm, mobile
  usability, plus the named text-page check (the modifier playground must VISIBLY
  differentiate weight/size rows — the scanner fix, "the sheet now computes").
  NO code claims, NO fixes, NO commits; no svelte-check run (nothing type-adjacent
  was asserted — the ONE-run rule had nothing to spend).
- **Vintage**: READ-ONLY preview of the orchestrator's single-writer build
  (HEAD 48053c4f; build rc=0, 110 pages in dist, verify:docs rc=0 on that exact
  build — verified by the orchestrator, standing). My own fresh-build attempt hit
  the four-agent concurrent-build race (ERR_MODULE_NOT_FOUND mid-prerender); I
  HELD per protocol, served read-only on ALL-CLEAR, rebuilt nothing.
- **Server**: `vite preview --port 5243 --strictPort` (wrapper PID 7914), all four
  pages curl-200 before capture; nothing stale, no 404s, no STOP needed.

## Method

Per page: full-page filmstrips at 1440×900 (viewport captures stepped 1400px
through `.jx-shell-body` — THE scroll container; window.scrollTo no-ops inside the
scaffold, so fullPage shots only capture the viewport) + 420×900; overlay pages
(dialog, system-dialog, tour) ALSO captured OPEN via real Playwright clicks (the
text page via the playground harness). **Black-image defense on every capture
BEFORE judgment**: sips→BMP→node luminance histogram.

## Black-image defense (the gate for everything below)

**87 captures histogrammed, 87 non-trivial, 0 suspects** — min luminance std
27.0, max 72.0, threshold 20. (3 later diagnostic captures — text-playground ×2,
text-weight-driven — were not part of the judged set.) No black frames anywhere;
the 2026-09-08 blackout class did not recur.

## Verdicts

| Page | Verdict | Tier (standing) |
|---|---|---|
| dialog | **PASS** | Tier 2 |
| system-dialog | **PASS** | Tier 2 |
| text | **PASS** | Tier 2 |
| tour | **PASS** | Tier 2 |

Zero layout breaks, zero overlaps, zero clipping, zero broken canvases, zero
contrast disasters across 87 judged captures. Findings from earlier rounds
(T112's landed items among them) show no visual regressions.

### dialog — PASS

- Filmstrip 12 frames @1440 + 18 @420: hero/chips/install/overview rail rhythm
  correct; every seat paints; nothing collides at either width.
- **Open state (real click)**: panel over dimmed page; **the scrim is
  pixel-proven** — my first eyeball read of dialog-open.png said "no dimming",
  but pixel-diff of the clip shows 740 differing bytes and luminance mean
  **170 (open) vs 229 (closed) = the exact 0.32 dim factor** of the
  ::backdrop law. Numbers, not eyeballs (probe fault owned below).
- Mobile: keyboard table, ARIA table, and the a11y prose (the T112 measured-leak
  copy) all reflow clean; no glyph overlap at 420.

### system-dialog — PASS

- Hero frame clean (title, 4 hex chips, install card); Accessibility frame's
  Keyboard/ARIA tables aligned; the print-sim band renders as designed (below).
- **Open state**: the anchored alert popover rises beside the trigger over the
  tinted page; panel ink vs scrim contrast reads clean.
- **Mobile API table**: at 420 the Properties table header is cut at the frame
  edge ("DESCI…") — programmatic check: wrapper `overflow-x: auto`,
  wrapScrollW **422** vs wrapClientW **322** → the DESIGNED horizontal-scroll
  container, not clipping. Mobile usable.

### text — PASS (the named check lands)

- **Mark matrix**: all 8 forms visibly differentiated — p regular, strong 600,
  em italic, del line-through, mark pink ground, ins underline, sub/sup baseline
  shifts — no two forms render alike.
- **The playground computes, live**: driving the WEIGHT select to
  "550 · font-[550]" flipped the base paragraph's computed font-weight
  **500 → 550** in the live DOM (options: normal·400 … bold·700 PLUS the
  arbitrary `font-[450]`/`font-[550]` rungs — the sheet computes even the
  arbitrary-value dialect). Size rows visibly differentiate in the universal
  seats (14px vs large). The scanner-fix claim is receipted interactively.
- **The "clipped base paragraph" resolved as capture artifact**: measured —
  baseScrollW 830 = baseClientW 830, overflow visible, baseRight 1143 <
  stageRight 1167; the dock (bottom 1976) is flow-separated ABOVE the paragraph
  (top 2323). My playground screenshot overlaid them only because the dock is
  viewport-fixed at my scroll offset. No layout break.
- Mobile: Accessibility frame clean (semantic-element table, keyboard
  "not focusable" row, data-jx-text row).

### tour — PASS

- Hero + API frames clean; the API Properties + Universal-props tables align at
  1440; See Also / RELATED / pager / footer furniture intact at 420.
- **Open state (after re-drive)**: anchored card over the spotlight hole + tint
  framing Target A; popover census exactly 1 ("Target A — the lease lands here —
  inspect style.anchor-name"); controls visible.
- The ARIA table's own receipt is visible on the page: popover=manual,
  "the scrim is pointer-events:none", aria-hidden indicator dots.

## Observations (not findings — recorded for the ledger's eyes)

1. **Scrollspy double-highlight mid-scroll**: system-dialog and tour frames show
   TWO adjacent right-rail entries lit while crossing a section boundary
   (Usage+Accessibility, Custom indicators+API). Consistent fleet behavior of a
   leaving+entering pair; not a defect.
2. **Print-sim band** ("docs · print 打印预览(sim) · 打印/导出 PDF · medium:
   screen") sits above the hero on dialog/system-dialog — a page affordance,
   rendering as designed; noting so nobody misreads it as chrome bleed.
3. **Tour dock echo**: the canvas dock read "FINISHED AT STEP —" (em-dash
   placeholder for the finishing index) while the tour stood at step 1/2.
   Canvas-interior echo semantics; the tour's own state was correct.

## Probe-fault ownership

1. **The concurrent build race**: my dispatch's fresh-build step rc=1'd
   (ERR_MODULE_NOT_FOUND on .svelte-kit/output mid-prerender) — four walkthrough
   agents raced one workspace. Orchestrator-owned dispatch error; I held per the
   protocol correction and served the single-writer build read-only. No retry
   loops.
2. **Scrim false-read**: I first judged dialog-open.png by eyeball ("no
   dimming") — pixel-diff + luminance (170 vs 229) proved the scrim paints.
   Lesson restated: judge luminance numerically; downscaled Reads lie.
3. **tour-open first capture was identical to the closed page** — my click raced
   the reveal. Diagnostic re-drive showed the popover open; recaptured with
   settle waits.
4. **text-drive script crash**: implicit-global `p = …` in an ESM module
   (strict mode) — one wasted run; fixed with an explicit declaration.
5. Earlier in this task: `rg -rn` misuse (the --replace trap) caught and
   re-run with `rg -n` before any conclusion.

## Gate record

- No build by me after the race (protocol); single-writer build rc=0 at HEAD
  48053c4f with **verify:docs rc=0** (orchestrator-verified on that exact build)
  — standing, unchanged by this sweep (read-only).
- NO svelte-check run (no type/code claims in a vision sweep).
- NO fixes, NO commits, NO pushes. Zero product-tree edits.
- Teardown: preview wrapper + listener killed by PID; `lsof -i :5243` EMPTY
  after (receipt below); sibling ports 5241/5242/5244 + 5230 never touched.
- Artifacts: /tmp/g145/ (87 judged PNGs + triviality.json + 3 diagnostic
  captures), scripts /tmp/g145-capture.mjs, /tmp/g145-capture2.mjs,
  /tmp/g145-text-pg.mjs, /tmp/g145-tour.mjs, /tmp/g145-scrim.mjs,
  /tmp/g145-text-drive.mjs, /tmp/g145-edge.mjs, /tmp/g145-mobile-table.mjs.
