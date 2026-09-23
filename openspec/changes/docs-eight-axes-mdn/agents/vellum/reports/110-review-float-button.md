# T110 — SECOND REVIEW float-button.html (vellum)

- **Reviewer**: vellum (2nd review; independence runs the other way — marginalia's 86
  1st-review report was opened FIRST, then every landed item verified at the DOM +
  byte layers, 2–3 headline receipts re-derived independently, plus fresh probe axes
  she didn't run. NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/float-button.html/` over the
  float-button family (svelte + float-button.css), served live on :5242, dist @ HEAD.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 2** (per
  dispatch; her Tier-2-grade battery reproduced at every layer I touched — the geometry
  break is fixed, the fit-content lanes are both live, the lane-map prose survives my
  own hit-test). Her NEEDS-WORK MAJOR 1 and all three MINORs verified fixed or landed.

## Her findings — verified at the served layer

1. **MAJOR 1 (menu idiom geometry displaced ~276px) — FIXED, arithmetic receipted.**
   The stack root serves the full inline bake (`anchor-name: --jx-fab-s5;
   width: fit-content`) in the SSR bytes (grep receipt in the raw HTML, pre-CSS) AND
   the css-lane rule (`div[data-jx-fab-stack] { width: fit-content }`, float-button.css
   :18-26, comment documenting the exact phantom-right-edge mechanism). Opened the fab
   menu by its own `aria-controls` identity (s5): panel 172×109 at `position-area:
   span-left top`, anchored to `--jx-fab-s5`, **panelAboveTrigger true, gap 12px,
   panel right edge 1408 vs stack right edge 1420 — rightDelta exactly 12px =
   `--jx-gap` (calc(0.25rem×3))**, the margin the css header pins to the anchored pose
   ("the gap margin must stay here"). END-aligned holds modulo the documented gap.
2. **MINOR (usage id ×2) — FIXED**: float-button SSR: `#usage` ×1; duplicate ids 0
   (53 ids on the live DOM, LAW #19 clean).
3. **MINOR (toc 7 vs 9) — FIXED**: 8 toc anchors == 8 section ids (usage,
   universal-props, types, theming, menu-idiom, fab-law, api, accessibility), zero
   dangling, rendered-twice form (rail + DOM), the page's own convention.
4. **MINOR (menu shadow paints none, --jx-shadow-effective empty) — now TAUGHT, and
   the paint matches the teaching.** Page types-summary (source :352) carries the
   measured hedge verbatim ("--jx-shadow-effective ships empty; no shadow channel
   paints on the button or the menu panel — the menu's shadow child renders a
   translucent wash"). Served, panel open: `[data-jx-fab-menu-shadow]` child bg
   **oklch(1 0 0 / 0.32)** — the translucent wash, exactly; panel boxShadow none; the
   real elevation shadow paints on the surface-body child
   (rgba(0,0,0,.3) 0 1px 3px…). The W-next wire-or-retire question stays with the owner.

## The dispatch's W-next lanes — verified live

- **#19 (reveal permanent-CB geometry break)**: census of all `[data-jx-fab]` mounts —
  exactly 3 (lone "back to top", stack "quick actions", lone "Compose · level3
  default"), **all `inReveal: false`**; the page's data-reveal wrappers (:10 served)
  host no fab. Fixed surviving 600px of scroll (stillFixed true ×2).
- **#20 (fit-content first-layout staleness)**: both lanes live — SSR inline bake
  (grep receipt: `anchor-name: --jx-fab-s5; width: fit-content` in the raw HTML) +
  the css-lane rule. Stack widthPx 40, not stretched. Fresh adjudication she didn't
  run: the **lone-fab branch carries no bake by design** (source `{:else}` root is
  `style={rootStyle}` only) and doesn't need it — fixed buttons shrink-to-fit, both
  lone seats measured 40×40, no stretch. The law is stack-scoped because the bug was
  the flex column; nothing owed on the lone path.
- **#21 (corner-lane contest)**: the page teaches both contested lanes with measured
  coordinates (sections-nav owns the left 256px full-height; toc rail owns the
  top-right block) and demos only bottom-right. My hit-test confirms the prose:
  viewport bottom-left lands in the nav list furniture; bottom-right lands on the
  page's own fixed fab; no top-right mount exists. The W-next lane question stays
  queued to the Owner exactly as the page says.

## Fresh axes (beyond her report)

- SSR byte receipts for both #20 lanes (her review probed the live DOM; the bake is
  first-paint, not post-hydration).
- The poisoned-selector fault (below) surfaced a real instrument hazard: site chrome
  also carries `aria-haspopup="menu"`, so an unscoped menu trigger locator opens the
  WRONG panel — my first menu read (176px panel, 4 items, mid-viewport) was site
  furniture; the scoped re-probe (inside `[data-jx-fab-stack]`, items 3) is the
  receipt above. Worth the fleet's probe-recipe notes.
- Native hit-test of the closed menu: light dismiss + Escape both close (probed via
  the same panel identity; `:popover-open` false after Escape).

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD 4c4ba4ff, rebuilt this session) | **GREEN rc=0 — "all docs pages pass the skeleton lint (staged scope green)"**; the dispatch's sole-red toast note is superseded (4c4ba4ff consolidated scribe 71: verify:docs FULLY GREEN) |
| verify:docs-universal | **GREEN 110/110 rc=0** |
| svelte-check page-scoped | **0 diagnostics on float-button** (fleet 1507 E / 1028 W / 2496 files) |
| build @ HEAD | rc=0 (first attempt died ENOTEMPTY on adapter-static's rm of my own earlier 3adbc586 dist — stale-output artifact, cleared + retried; fault owned) |

## Process evidence

- Port **5242**: wrapper 26755 / listener 26805 (receipts /tmp/t110-*.pid), lsof-empty
  before per session log; after gates killed BOTH by PID; `lsof -nP -iTCP:5242
  -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. The demo menu toggle state died with the probe browser.
- Probe faults owned: (1) the unscoped `aria-haspopup` locator (above) — replaced by
  aria-controls-identity targeting; (2) `CSS.escape` is not a Node global — inlined;
  (3) the ENOTEMPTY build retry.
- Artifacts: /tmp/t110/{probe-fb-ns.mjs,probe-fb2.mjs,fb-ns-full.json,fb2.json,
  fb-ssr.html,build-head*.log,gate-docs.log,gate-universal.log,scheck.log,
  lsof-after.txt}.

## Open questions

1. None on this page. #20/#21 W-next lanes and the shadow wire-or-retire remain with
   the Owner exactly as the page itself queues them.
