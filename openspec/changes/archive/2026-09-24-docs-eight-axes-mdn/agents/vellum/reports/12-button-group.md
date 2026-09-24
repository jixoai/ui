# TASK 12 — CODE button-group (vellum, 2026-09-22)

**Tier: 2** — the old page was content-rich but docs-demo-standard-shaped:
the real material (lab, W7 scroll canvas, variant-scope zone, nested
clusters, toggle-group boundary, the hand API table) survived verbatim;
the skeleton re-ordered to the archetype and gained Overview, the
per-axis eight-axes table, one real query() case and the same-source
axes canvas. Tier 3 (full archetype rewrite) would have discarded
working demos; tier 1 (review-only) would have left the stale toc, the
dead theming anchor and no per-axis story on the PROVIDER family of the
batch.

## Diff
- `apps/www/src/routes/docs/components/button-group.html/+page.svelte` —
  rewritten (+358/−124 vs old): archetype order hero → install →
  overview → usage → lab → W7 scroll → variant-scope → examples
  (nesting + boundary) → API → axes → accessibility → see-also; the
  stale toc dead anchors (install/theming) and the wrong --jx-hit
  ladder (28/32/40/48) replaced; hand-`cx` fixed (type-narrowing); the
  raw `</script>` in the variant-scope inline template replaced with
  the `${close}` splice (the parse-signature fleet error the draft
  carried).
- `apps/www/src/routes/docs/components/button-group.html/+page.ts` —
  toc rebuilt to the new DOM (11 ids, each verified present exactly
  once in SSR).
- `apps/www/test/canvas-same-source.spec.ts` — PILOTS += button-group;
  the axes canvas snapshot pinned (the page's one id-bearing canvas,
  same-source via resolveRawCode; 75/75 spec green).

## Same-source lane
- The axes canvas joined the canvas same-source law (`usageFile` +
  `resolveRawCode('axes')`): drawer usage file AND body CodeBlock feed
  from the EXTRACTED stage markup — one source, two surfaces.
- Lab/scroll canvases stay hand files (page-state bind: — the rejection
  class); the query() canvas stays hand (the responsive `query<{ lg },
  DensityLane>(…, 'small')` embed — same class, the avatar play-state
  precedent). Both recorded as the standing follow-up.

## Measurement receipts (probe /tmp/vellum-12-bg-measure4.mjs, 9/9 PASS)
- THEME-SPLIT — the family's own pole, FOUR voice classes measured:
  1. FLIPS: joined outline buttons' border — the theme-scoped
     `--jx-outline` slot — oklch(0 0 0) → oklch(1 0 0) under .dark.
  2. FROZEN: label ink — the `--jx-foreground` stylex alias — stays
     oklch(0 0 0).
  3. THEME-NEUTRAL: seams — contrast-ghost ink, paints no color.
  4. FOLLOWS: cluster shadow — raw `--shadow-xs` — rgba(0,0,0,.5) →
     rgba(255,255,255,.5) 2px 2px.
- DENSITY (the provider axis): named rung re-bases the JOINED buttons
  through the provided scope — measured default 40px/13px, sm 32/12,
  lg 48/15 (xs 28/11 from the earlier sweep); the number lane inert
  (declaring-element law).
- RADIUS: stamped `--jx-radius-effective: 16px` on the group moves the
  joined corner 0px → 16px — the buttons consume the carrier.
- SIZE: supply-only for the button anatomy — 20px root font left the
  13px button type unmoved (measured, earlier sweep).
- ELEVATION/MOTION: supply-only, negative-grep receipts (zero carrier
  readers in ui/button-group/).
- W7 scroll: verdict `data-jx-scroll-state="start-closed"` on the
  scroller, overflowX auto, scrollbar-width none, chevrons present.
- query(): wide 1280px → lg rung (h=48, stamped data-density=lg);
  narrow 600px → base (h=32, stamped sm).
- SSR ground truth: HTTP 200, 36 `data-jx-btngroup` occurrences,
  13 `role="group"`, 11 toc ids each present exactly once.

## Gates (all on the FINAL tree)
- `verify:tailwindless` exit 0 — receipt verbatim:
  `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red`
- `verify:docs-universal` exit 0 — `GREEN: 110/110 component pages
  render the shared universal section (110 markers)`
- `verify:docs` exit 0 — `✓ all docs pages pass the skeleton lint
  (staged scope green)`
- Affected specs solo AFTER edit: `button-group-overflow.spec.ts` +
  `button-group-scroll.spec.ts` — 25/25 PASS (baseline before edit was
  the 147/147 campaign solo sweep).
- Ambient vocabulary solo: 284/284 PASS (no fixture pins for
  button-group existed; none needed).
- `canvas-same-source.spec.ts` solo: 75/75 PASS.
- Page-scoped svelte-check (fleet run, 2485 files): my `+page.svelte`
  carries ZERO errors and 2 warnings (`state_referenced_locally` on the
  two usage-file captures — the fleet-common signature, 1030 fleet
  wide, present on the old page too; render is correct via
  `resolveFileContent`). Fleet totals 1623 errors / 1030 warnings.

## Process evidence
- Port 5242: `lsof` empty before start; dev server run as wrapper 502 →
  vite 538; teardown `kill 538` + `kill 502` (SIGTERM, escalate only if
  needed — SIGTERM sufficed); after: `lsof -nP -iTCP:5242 -sTCP:LISTEN`
  rc=1 (EMPTY), no vite processes remain. No orphans started.
- NO commits, NO push. Sibling in-flight files untouched (git status
  clean apart from my three files + experience.md).
- Probe scripts: /tmp/vellum-12-bg-measure{3,4}.mjs (measure4 final);
  check logs /tmp/vellum-12-bg-check{,2,final}.log; gate logs
  /tmp/vellum-12-bg-{tl2,du2,docs2,specs,ambient,pilot-full}.log.

## Deviations / honest notes
- The old page's pre-existing hand mirrors (zone/nesting/boundary
  drawer strings) remain hand — they predate this task and escape the
  id gate; migrating them to extracted canvases needs the §6.4-style
  identifier lifting (recorded follow-up, not silently dropped).
- The axes CodeBlock now shows the COMPOSED extracted usage (not the
  old hand snippet with the explanatory comments) — the per-axis table
  above it carries the prose; this is the same-source trade.
- Fleet error total moved 1647 (baseline at dispatch) → 1623; my page's
  contribution went ~15 (draft parse errors, fixed) → 0. The delta is
  sibling drift plus my cleanup, not a masked regression (my page's
  diagnostics are enumerated above).
