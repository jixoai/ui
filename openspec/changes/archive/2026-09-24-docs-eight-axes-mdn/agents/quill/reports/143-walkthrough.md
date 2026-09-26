# T143 — FINALE WALKTHROUGH, group A: form · select · command · pagination (quill)

- **Scope**: visual acceptance sweep of the four group-A pages over the ALL-CLEAR
  dist (single-writer build, verify:docs rc=0 on that exact build). Acceptance, not
  review — no fixes, no product-tree edits, no commits.
- **Serve**: read-only `vite preview --port 5241` on the verified dist; all four
  pages curl 200 before shooting. No dev server, no rebuild (the mid-task build
  race protocol honored; zero `npm run build` invocations this task).
- **Captures**: 8 full-page shots, 1440×900 and 420×900 viewports,
  `/tmp/t143-shots/{form,select,command,pagination}-{desktop,mobile}.png`
  (form-desktop 1440×8671, select-desktop 1440×8071, command-desktop 1440×6153,
  pagination-desktop 1440×7491; form-mobile 420×900→15664 content, select-mobile
  420×12132, command-mobile 420×8556, pagination-mobile 420×10174).

## Black-image defense (run on the FINAL set, after each hygiene fix)

Canvas histogram per capture; criterion = the law's intent (a pipeline-black frame
is nonZero≈0 with variance≈0), not a document-page tonality quota:

| capture | nonZeroRatio | histVariance | buckets | verdict |
|---|---|---|---|---|
| form-desktop | 0.9939 | 4.15e12 | 25 | OK |
| form-mobile | 0.9912 | 1.99e12 | 27 | OK |
| select-desktop | 0.9922 | 3.62e12 | 19 | OK |
| select-mobile | 0.9865 | 6.54e11 | 28 | OK |
| command-desktop | 0.9932 | 2.11e12 | 18 | OK |
| command-mobile | 0.9882 | 3.25e11 | 29 | OK |
| pagination-desktop | 0.9941 | 3.12e12 | 18 | OK |
| pagination-mobile | 0.9893 | 4.52e11 | 29 | OK |

**DEFENSE GREEN — all 8 non-trivial.** (An earlier pass false-flagged 4 desktop
shots on a `buckets >= 5` quota — white document pages legitimately occupy 2–3
luminance buckets; re-criterione to the intent and re-run. My fault, owned.)

## Capture hygiene (two artifacts found and defeated — method note for the next sweep)

1. **The reveal system is a scroll-driven CSS animation** (jixoai.css ~:1185:
   `animation: jx-reveal-rise both; animation-timeline: view()`). The docs shell
   scrolls `.jx-shell-body`, so naive fullPage caught one fold; flattening the
   ancestor chain (height auto / maxHeight none / overflow visible on
   host/shell/body/main, in-probe only) fixes the fold but KILLS the view()
   timeline — fill-both then holds `opacity: 0` on every data-reveal section
   (measured: 11 of 14 at 0 on form). Inline `opacity: 1` does NOT take
   (animations outrank the style attribute). The clean force is the stylesheet's
   OWN escape hatch: `@media (prefers-reduced-motion: reduce) { [data-reveal] {
   animation: none } }` — Playwright `emulateMedia({ reducedMotion: 'reduce' })`,
   zero DOM mutation. Buckets jumped 3–7 → 18–29 (content actually painted).
2. **fullPage width can exceed the viewport** when the flatten exposes a spill
   (form-mobile first came out 556 wide for a 420 viewport). That artifact turned
   out to be FINDING 1 below, not just hygiene.

## VERDICTS

### form — desktop PASS / mobile NEEDS-WORK (1 finding)

Desktop (1440): the whole page paints end to end — hero ("Data Entry forms — the
family hub", summary, install bar, pills), the three catalog groups (12 native
inputs, select family incl. searchable + action, css selectors checkbox/radio/
toggle — every card's control painted, none empty), the density-ladder demo, the
NativeHTML base teaching block, then Types → Usage → Accessibility → Density and
tokens → API, footer. No overlaps, no clipped content, MDN rhythm coherent, toc +
"on this page" rails present. **PASS.**

**FINDING (mobile, form only): the page has a 136px horizontal pan channel at a
420 viewport.** Evidence chain, all measured live on the preview:

- `.jx-shell-body` scrollWidth **556** vs clientWidth 420 (select/command/
  pagination all measure **420/420** — form is the only one).
- Culprit localized: in the `#native-base` section's first LI (the text-likes
  group), a paragraph P (classes xowzrx4…) carries a text node whose Range rect
  is **width 523, right edge 556** with `white-space: normal` — an unbreakable
  token (fragment: "lands on the element verbatim (text/…" — the parenthesized
  type list) sets min-content 523 and everything above it is overflow:visible.
- It is user-reachable: panning `.jx-shell-body` to max scrolls **136px** and the
  viewport screenshot (`/tmp/t143-shots/form-mobile-panned.png`) shows the hero
  clipped off the left edge with an empty dead band on the right.
- Not to be confused with the page's legit internal scrollers: code blocks sit in
  PRE overflow-x:auto (871 in 352) and the API tables in auto wrappers (425 in
  354) — those are correct MDN patterns and contained.
- Fix shape (for the code round, NOT landed): make that token breakable
  (wbr/overflow-wrap:anywhere on the type-list span) or shorten the list.

### select — desktop PASS / mobile PASS

Desktop: hero ("select — the popover listbox") + install + pills, types code, a
live workbench with the listbox painted OPEN, the non-native→native-first family
comparison (both selects painted), raw-markup skinning pair, the RTL demo with a
dir=rtl listbox open (geometry mirrors correctly), variants, keyboard + attribute
tables fully painted, four density cards + token table, behavioral laws with the
popover-slot demo, API tables, see-also, footer. Mobile (420×12132): clean single
column, all demos and tables painted, tables scroll internally. No breaks.
**PASS both.**

### command — desktop PASS / mobile PASS

Desktop: hero ("command — the composed ⌘K surface") with the grammar pills, the
workbench with the palette painted OPEN (groups + items + foot hints visible —
the T132-documented site-search ⌘K collision is api-row copy, not a visual
defect), variants (command-tabs), a large usage code block, keyboard/aria tables,
density token table, universal-props demo, three API tables, prev/next, footer.
Mobile (420×8556): single column, palette and tables all painted. No breaks.
**PASS both.**

### pagination — desktop PASS / mobile PASS

Desktop: hero ("pagination — nav of real links"), the workbench (FIRST/3/8/NEXT
with the current chip in brand hue, props panel beside it), window-evidence
ranges, composable-atoms card row, render-a-page-window code, keyboard/aria
tables, the four-rung density chip ladder (each rung painted with prev/current/
next), token table, universal-props demo, API tables, footer. Mobile (420×10174):
single column, everything painted. No breaks. **PASS both.**

## Contrast / flow notes (fleet-level, informational)

- Light-mode ground + ink reads cleanly at a glance on all four pages; brand-hue
  accents (current page chip, active listbox options, install highlights) have
  visible contrast against the ground in every painted instance.
- Hero → usage → demos → api rhythm holds on all four; the toc rail (left) and
  "on this page" rail (right, desktop) are present and consistent.

## Gates

| Gate | Result |
|---|---|
| verify:docs (repo ROOT, on the ALL-CLEAR build) | **rc=0** |
| rebuilds this task | **0** (single-writer protocol) |
| fixes/commits/product edits | **none** |

## Teardown

Preview wrapper + listener killed by PID; `lsof -ti:5241` post-kill: **0 lines**
(receipt in the task log). Sibling ports 5242/5243/5244 and Owner's 5230 untouched.
No orphans.

## Probe-fault ownership

1. My first "force-reveal" set inline `opacity: 1` on [data-reveal] and READ BACK
   0 — the sections were still transparent because a fill-both animation
   outranks inline styles; the chain probe first blamed a bare wrapper DIV
   (wrapper-vs-atom, the recurring class), then an animation that
   getComputedStyle reported as `none` because I read the WRAPPER again. The
   stylesheet grep (jixoai.css view() block) is what settled it.
2. My first defense criterion (`buckets >= 5`) false-flagged 4 legit white pages;
   re-criterione to the law's intent and re-run — the false flag was mine, the
   captures were fine.
3. The 556-wide form-mobile capture was initially treated as pure artifact; the
   overflow probes (scrollWidth vs clientWidth, then Range rects on TEXT NODES
   after two element-rect passes found nothing) showed it was a real page spill.
   Element rects do not grow with overflowing text — the Range pass is the
   receipt.
