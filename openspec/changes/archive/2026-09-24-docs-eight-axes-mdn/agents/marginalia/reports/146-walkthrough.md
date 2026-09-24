# T146 — FINALE WALKTHROUGH: vision sweep, group D (marginalia, 2026-09-24)

- **Set**: section-card · float-button · input · markdown (the dogfood/density set).
- **Serving**: read-only `vite preview :5244` over the coordinator's single-writer
  build (rc=0, dist verified; per the race protocol — NO rebuild on my side).
- **Captures**: 43 images in /tmp/m146/ — every page at 1440×900 and 420×900,
  full-scroll coverage via viewport tiles of the shell's own scroller (.jx-shell-body
  is the scroll root; document-level fullPage would capture one viewport — the tiles
  are the real coverage), 5–8 tiles per page/breakpoint.
- **Black-image defense: 43/43 PASS.** Every capture decoded in-browser
  (createImageBitmap → OffscreenCanvas histogram): luminance **std 16.0–64.3**
  (no blank/black frames), dominant-color fraction **≤ 90.7%**, dark pixels
  0–0.1%, unique quantized colors 17–150. Zero trivial flags. Content heights
  measured: section-card 6909 (mobile 9483), float-button 6711 (9951), input
  13571 (19367), markdown 11754 (16540).

## Verdicts

### section-card — PASS
The exemplar holds. Desktop: the hero card (bordered frame, orange eyebrow, mono
title, hexagon pills), the workbench canvas with its tone/summary/eyebrow playground
(default|hero segmented control, live eyebrow input), the usage code block with
clean highlighting, the two-tone Types demos side by side, the A11y table crisp, and
the Theming density ladder rendering XS/SM/DEFAULT/LG cards each at its own scale —
the framing card demonstrating itself at four densities without a hairline out of
place. Mobile (420): single column, the toc collapsed to its glass bar ("Anatomy &
ToC wiring" + chevron), the bottom breadcrumb glass bar present, everything readable.
Observation (cosmetic, one offset): the canvas code-dock toolbar grazes the right
tone-demo card's eyebrow line at mid-scroll — the known canvas-chrome-over-stage
geometry (W-next #21 class), transient, decorative text only.

### float-button — PASS (two cosmetic notes, evidence given)
The page's whole trick works visually: the **bottom-right fixed-fab column stacks
cleanly in the right gutter** (+ Compose, + quick actions, ↑ back-to-top — evenly
spaced, shadow-consistent) while the teaching prose ("Corner is a prop, label is the
law"), the usage blocks, and the Menu-semantics keyboard table render without
interference. Mobile: hero + pills clean; the fabs ride the corner over the canvas
copy as fixed elements do. Notes: (1) the **universal-props canvas stage reads as an
empty box** — its Compose fab is `position:fixed` to the viewport corner (the + in
the gutter IS the demo), so the stage panel shows nothing; inherent to the fixed
idiom (the page's other seats use the scrollable .jx-fab-stage to avoid exactly
this), cosmetic, no break; (2) at 420 the fabs overlay a few lines of canvas copy —
inherent to fixed elements on a narrow column.

### input — PASS
The largest API surface reads cleanly end to end: the Slot system section with the
ENDPOINT field (https:// prefix slot · placeholder · /v1/spawn suffix), the
clearable SEARCH and PRICE ($ prefix / per seat mo suffix) lanes; the **custom picker
bridge grid — all eight native-type seats rendering** (date custom + native opt-out,
color swatch wheel, ISO week, month, time stepper, datetime-local, zh-CN locale) with
the committed/swatch echo line; the Keyboard and ARIA tables (kbd chips, the full
aria-invalid/describedby/reveal/aria-live rows) crisp at 1440; Theming closing the
page. Mobile hero (the long every-native-type summary) wraps correctly with the
hexagon pills below; no overflow, no clipped rows anywhere.

### markdown — PASS
The biggest page holds together at every seat: the **coverage-map table** (14 node
rows, code chips + escape classes, all readable), the **kitchen sink canvas** — the
GFM-vocabulary one-pass with plain bold/italic/struck/inline chips/titled external
link, and the **task list rendering with suppressed markers** (the checked row's
orange check square, the unchecked row's bare square — native disabled inputs, zero
UA chrome, exactly the claim), "tables ride the registry Table" with the
NODE/MAPS TO/ALIGNMENT alignment demo, and the **GitHub alerts** (NOTE tonal blue /
TIP tonal green blockquotes — statuses wired by hue). Code cards carry the Code · N
drawer bars. Mobile: the long hero summary wraps correctly, breadcrumb glass bar
present. No broken cards, no empty canvases, no contrast disasters.

## Cross-page observations

- **Rail rhythm** consistent everywhere: left component rail (grouped, current
  highlighted in brand hue), right ON THIS PAGE rail tracking the section, mobile
  collapsing both into the glass bars — at both breakpoints on all four pages.
- **The canvas-dock-over-stage geometry** (W-next #21 class) showed once more — the
  toolbar grazing a demo eyebrow at one offset (section-card). Cosmetic, transient,
  already ledgered.
- No contrast disasters anywhere: the light theme's ink/borders hold on every tile;
  the dark bezel header reads cleanly on all four pages at both breakpoints.
- No broken or empty canvases except the float-button universal seat noted above
  (an inherent fixed-idiom trade, not a rendering fault).

## Gates + process

- **verify:docs rc=0** on this exact build (staged scope green) — run after the
  walkthrough.
- Preview served read-only per the race protocol (the coordinator's single-writer
  build; no rebuild on my side — my own first build attempt died in the pre-notice
  race and was acknowledged as "holding" before the ALL-CLEAR).
- Teardown: preview killed by PID; **lsof :5244 empty, rc=1**; no orphans. Sibling
  ports (5230 Owner, 5246 unrelated python) untouched.
- **NO fixes, NO commits, zero product-tree edits.** Captures: /tmp/m146/ (43 pngs).
  Artifacts: /tmp/marginalia-146-capture.mjs, /tmp/m146-capture2.mjs,
  /tmp/marginalia-146-{build,preview,docs}.log.
