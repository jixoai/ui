# T131 — FIRST REVIEW terminal-header (marginalia, 2026-09-24)

- **Target**: `apps/www/src/routes/docs/components/terminal-header.html/` (page 279 +
  ts 16) over the family: terminal-header.svelte 402, css 213, stylex 215, defaults
  58, barrel 6. **Registry twins: all 5 files cmp-identical.** Vintage: HEAD
  2b06c0d5; fresh build (dist 02:33).
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 0 NIT. Tier 2 proposed.**

## Verified TRUE with digits (my own instruments)

The page's whole trick is that **the live demo is the site's own bar** (a header
cannot nest a header) — so the probe drives the real chrome the page wears:

1. **The bezel lock — the two-read receipt.** The live `header.jx-nav` computes
   **background oklch(0.2 0 0)** and **color-scheme dark** while the page body is
   **oklch(1 0 0)** light — the dark CRT shell on a light page, carried by the
   wrapper classes `dark` + the tokenScope theme class (the re-declaration law,
   :286-294 — the W4-r6 lost-dark-bezel regression's fix visible live).
2. **The chrome anatomy** — `data-jx-chrome` on the row ✓; brand wing renders
   "jixoai-ui / ui.jixoai.com / the design language" ✓; the indicator part is
   mounted with the `vt-nav-active` view-transition name (SPAN, 110×32 at the Docs
   pill) ✓; the pill box hosts the composed nav ✓.
3. **The mega panel is the browser's** — clicking the **Docs** pill opened exactly
   one popover (jx-subpanel classes, top layer) whose authored grid carries the docs
   tree ("install the zero-tooling prerequisite" as the first link); **Escape closed
   it** (open-popover census 0) — popover=auto native laws, no header-owned close
   machinery.
4. **The drawer shell** — at 500px the hamburger is visible; folding it flipped
   aria-expanded to true and opened the disclosure to **249px holding 279 links**
   (the entire docs tree as the drawer snippet's nav); **Escape closed it AND
   returned focus to the hamburger** (the :239-246 law measured). **Tier-cross
   reset** — resizing back across sm with the drawer open reset it (expanded false,
   the state never crosses tiers, :226-231).
5. **LAW #19**: 37 ids on the page, zero duplicates. svelte-check: page **0 seats**,
   family **0 errors** (+7 fleet-noise warns).

## Findings

1. **[LOW — the page's interaction instruction names a pill that does not exist.]**
   Two seats instruct "click the **Components** pill in the real header above" (the
   stage card :187 and the canvas PlayHelp :205 — same copy again in the drawer
   description). The live bar's pills are **Overview** and **Docs** — the docs tree
   the copy wants the reader to open lives behind the **Docs** trigger. A reader
   following the pointer finds no Components pill. Fix shape: rename the pill in the
   two seats ("the Docs pill") or phrase generically ("the nav pill that holds this
   page's tree"). Copy-only; the interaction itself is real and measured.

## Notes

- The `theme` prop is correctly taught as the SHELL lock, deliberately absent from
  the axis supply (the unruled-collision law, :159-163) — the universal-props
  summary and the defaults record agree; no finding.
- The universal-props canvas on this page is copy-only by design (a second header
  would nest a banner) — the axes receipts are source-level; the seven-lane record
  and the elevation no-own read clean in terminal-header-defaults.
- The indicator's aria-current repaint law (navigation-driven) is source-verified
  (the family part carries the measurement + WAAPI slide; the header never sees nav
  data); the live receipt is the alignment of the vt-nav-active box (110×32) with
  the section pill holding the current route.

## Tier proposal

**Tier 2** — the composition-first page is honest about its constraint (it cannot
demo its own component inline) and teaches through the live chrome; one copy rename
closes the only finding.

## Probe-fault ownership

1. My first drive clicked a nav LINK ("Overview") expecting the indicator to move —
   it navigated the page instead (links navigate; only aria-current flips move the
   indicator, and that happens through navigation). The cross-pill move receipt was
   dropped for the correct static-alignment receipt; the wasted drive owned.
2. My `--jx-surface-solid-fill` two-read returned empty strings (the fill resolves
   through the body child's fill props, not the header root); the computed
   background-color pair (0.2 vs 1.0) is the honest two-read and carries the receipt.
3. My first indicator-alignment check compared the indicator against the
   `[aria-current="page"]` element — which is a HIDDEN panel link (rect 0×0) marking
   the current route inside the docs tree; the visible-pill alignment numbers
   (918/20.5/110×32) are the receipt.

## Gate record

- svelte-check (ONE run, saved): page **0 seats**; family **0 errors** (+7 fleet
  warns). Fresh build rc=0 (dist 02:33); **verify:docs rc=0**; docs-universal
  **110/110**.
- Process: port 5244 mine, killed (lsof rc=1); NO commits/pushes/fixes; viewport
  resizes reverted. Artifacts: /tmp/marginalia-131-thd.mjs, /tmp/m131-thddiag.mjs.
