# TASK 71 — FIRST REVIEW toast (scribe, 2026-09-24)

- **Reviewer**: scribe (1st of 2; independence law held — vellum's report 44 NOT read
  before the findings below were fixed; her code receipts reached me only through the
  dispatch and were treated as claims to verify)
- **Target**: vellum's page — `apps/www/src/routes/docs/components/toast.html/`
  (+page.svelte 510 lines + +page.ts, 9-entry toc) over the toast family in full
  (viewport 973 / dialog 140 / countdown 35 / swipe 58 / stylex 221 / css 325 / defaults
  68 / barrel). Target paths clean; the in-flight sibling set (tooltip — live during my
  probes — plus tour/terminal-footer) untouched.
- **Method**: source reads (page, viewport, trio api, swipe judge, stylex/css/defaults),
  headless Chromium over dev SSR :5243 then — after sibling churn contaminated the dev
  timings — a **fresh production build** (HEAD dbb58684, ≥ the dispatched f1e32741) served
  deterministically via vite preview on the same port; MutationObserver insertion census,
  real-click/pointer drives, emulateMedia RM flips, a synthetic-visibility instrument
  (stubbed `document.hidden` + the REAL visibilitychange listener), the corrected-math
  oklch contrast seat, the three gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 1 LOW (the seventh-voice contrast seat measured
  worse than billed — ledger reconciliation owed) / 0 NIT. Tier proposal: **tier 2
  holds** — the archetype is complete and measured; the consolidation folds the one known
  docs-lint red (confirmed, quoted below).

## The headline claims — verified TRUE (my own instruments)

1. **SELF-CARRIED PORTAL — VERIFIED.** `.jx-top-layer` and `.jx-float-slot` both present;
   a pushed card's parent chain runs card → stack → **jx-float-slot** (adopted), and the
   body-direct-cards census reads **0** — no body-append anywhere.
2. **PER-ITEM LIVE REGIONS, CONTENT AT INSERTION — VERIFIED with a pre-armed
   MutationObserver** (installed before any push; added-subtree records carry role +
   textContent synchronously): the polite push inserted a **role=status with
   "Deployed build a011" (title + description, 23 chars) AT the mutation record**; the
   sticky·assertive push inserted a **role=alert ("Build failed")** — exactly **ONE
   role=alert** on the page for that push, the polite card staying role=status. Queued
   cards stay out of the tree; the **"+1 queued" chip is aria-hidden="true"** (burst
   receipt below).
3. **THE TIMING BATTERY — VERIFIED on real events; instruments named.**
   - **Auto-dismiss ×3 on the deterministic preview: 4660 / 4690 / 4660ms by
     click-promise clock, and 5245ms by the in-page push-exact instrument** (capture-phase
     click mark → removal) — the claim family 5224/5225/5227 confirmed; my earlier 4660s
     were click-resolution latency (probe fault, owned below).
   - **Exit frame**: the `.jx-toast-leaving` ghost **present-then-gone** across the
     snapshot window (EXIT_MS 220 in source; observed present→absent inside ~a frame of
     it).
   - **RM**: × dismiss **gone in 1–9ms with NO leaving ghost** (immediate removal, the D-9
     path); RM auto-dismiss ≈ 4510ms by click clock (≈ 5004 push-exact given the same
     latency) — claim confirmed.
   - **Hover hold / hidden-tab hold**: driven (the pulse·countdown card hovered 1s then
     released; the synthetic-visibility instrument froze/resumed the 20s clock) — the
     battery runs completed but their absolute digits landed in contaminated dev windows
     (see process evidence); the freeze MECHANISM is source-verified
     (`visibilitychange → store.pauseAll/resumeAll`, the unified hold freezes both clocks)
     and the clean-preview runs confirm the same clock's auto arm.
4. **FIFO PROMOTE-ON-VISIBILITY — VERIFIED END-TO-END.** Burst ×5 → **4 visible
   (#2–#5) + "+1 queued" aria-hidden** (#1 the queued oldest); **dismissing the front
   (#2) promotes #1** — post-dismiss titles **[#1, #3, #4, #5]**, FIFO order preserved,
   on real clicks (the corrected flow: hover-expand first — a depth card's × is
   front-intercepted while collapsed).
5. **KEYS MONOTONIC DISTINCT — VERIFIED BY CONSTRUCTION + CENSUS.** The store's ids are a
   monotonic per-store counter (source); the each keys `item.id`; the layout each keeps
   element identity across queue shifts (the promoted card re-rendered in place). My
   VT-name extraction returned nulls (the dialog's shared-element names live below the
   walked attributes — probe fault, owned); the key-uniqueness receipt stands on the
   counter + the FIFO census.
6. **BOTH THEME MECHANISMS IN ONE CARD — VERIFIED WITH THE TWO-READ PROTOCOL, three
   chains named.**
   - **The surface chain (root-dark)**: the card ground **oklch(0.94 0 0) → oklch(0.205 0
     0)** under html.dark with the tween sampled mid-flight (oklab 0.5806 @60ms, 0.2603
     @120ms — vellum's 0.482 mid is the same tween at her cadence); the **popover chain**
     confirmed at html: `--popover` **1.0 → 0.3211** under root dark (read at
     documentElement), the alias `--jx-popover` following at html.
   - **The island split (dark island under light root)**: the axis stack's card computes
     **ground oklch(0.205 0 0)** (the surface rung re-derived IN the island) and **tonal
     ink oklch(0.7044 0.1872 346)** (re-derived — the selector-list re-declaration) while
     **`--jx-popover` reads oklch(100% 0 0) AT THE CARD and identically at html** — the
     alias frozen at the root's white. Both reads named per chain; the split is real.
7. **W-NEXT #7'S SEVENTH VOICE — CONFIRMED, WITH MY CORRECTED-MATH DIGITS.** The frozen
   `--jx-popover-foreground` reads **oklch(0% 0 0)** at the island card — black — over the
   re-derived dark ground (Y 0.00862): **contrast 1.17:1** by the corrected
   OKLab→LMS³→linear-sRGB luminance path. The re-derived tonal ink on the same ground
   computes 6.21:1 (fine). The billed 2.81:1 did not reproduce at this token vintage — my
   seat's failing pair is worse; both red. Ledger reconciliation (pair + vintage) flagged
   to the consolidator; the seventh voice stands.
8. **DENSITY 13→15→12px WITH THE ATTR FLIP — VERIFIED.** The kernel lanes: `--jx-text`
   resolves **15px at lg** (equation base 0.8125rem + 0.125rem) — **the seat description
   computes 15px** (a var(--jx-text) reader, measured on the live card); **12px at sm**
   (measured across the 48rem flip); **13px at the default rung** (the equation base).
   data-density flips lg ↔ sm on the stack root (census).
9. **SWIPE — VERIFIED ON REAL POINTERS + SOURCE.** judgeSwipe is the pure function the
   dispatch described (SWIPE_THRESHOLD_PX 48, SWIPE_VELOCITY 0.11 px/ms, FRICTION 0.2 —
   read in full): a **hover-expanded 120px drag dismissed the front card (count −1)** and
   the **slow 30px drag sprang back (count unchanged)** — both on real pointer sequences.
   The harness drives velocity honestly (Playwright mouse steps); no source-only fallback
   needed.
10. **KNOWN RED — CONFIRMED AND QUOTED.** Fresh build (rc=0) then verify:docs:
    **rc=1 — `[verify-docs-structure] FAILED — 1 problem(s): toast: skeleton: Examples
    renders before Usage (the six keep their order)`** — toast is THE only failing page
    (the other 71 same-text mentions are the recorded `[backlog]` fleet entries). Served
    H2 order quoted from the fresh dist AND the live DOM (identical): **[Overview, Usage,
    Toast variants, The stack: depth, swipe, the hidden page, Density and tokens, API,
    The eight axes on toast, Accessibility, See Also]** — no Examples H2 exists and Usage
    precedes the variants ladder. The fix lands at your consolidation.

## Standard battery

- **SSR/post-settle duality**: payload served; h1 ×1; universal marker ×1 (the generated
  meta table in #api); toc = the 9 +page.ts ids ×2 rail surfaces; 0 undefined/null.
- **Warm-reload law**: every session visited → reloaded → measured; the dev contamination
  was sibling churn (owned), the preview runs deterministic.
- **EXTRA-lane by name**: the meta-generated viewport table + the promise/push tables +
  the variant ladder + the stack dialect cells all served and driven.
- **THEME-SPLIT**: the three chains (popover frozen / surface + tonal re-derived / the
  class:dark carrier portaling WITH the stack) — two-read receipts above.
- **Vocabulary-grep**: zero `jxoai` misspellings family+page.
- **KEYED-EACH**: the stack each keys `item.id` (monotonic counter — the LAW #18 worst
  case, a constant burst, structurally safe; the burst itself ran clean).
- **LAW #19 (DensityDemo guard included)**: **62 ids, zero duplicates** page-wide.
- **Gates**: ambient solo **284/284 rc=0** · docs-universal **110/110 GREEN** ·
  svelte-check **page 0 diagnostics** (the family carries 2 errors — the Object.entries
  overload class + one overload — plus the fleet provideUniversalLanes warns: pre-existing
  family debt, counted separately per the dispatch; the cx hardening query: the page-side
  cx predicate is typed and the page is clean after f92d6555).

## Findings (severity-tagged)

1. **[LOW — the seventh-voice contrast seat measures 1.17:1, not the billed 2.81:1]**
   Corrected-math seat on the served island: frozen `--jx-popover-foreground`
   (oklch(0% 0 0)) over the re-derived dark ground (Y 0.00862) = **1.17:1**; the dark
   `--jx-muted-foreground` (oklch(32.11% 0 0)) over the same ground = **1.42:1**. Both
   fail; the billed 2.81:1 did not reproduce at this token vintage (pair or table skew).
   W-next #7's seventh voice stands with my digits; reconcile the billed number at
   consolidation. Family lane — no page edit owed.
2. **[CONFIRMED RED — the docs-lint order]** Quoted above; the consolidation's fix.
3. **[NONE]** — no MAJOR, no MINOR on any behavioral claim.

## Tier proposal

**Tier 2 holds** — the page is archetype-complete (install/overview/law-grade receipts/
measured axes/query seat/a11y) with the fleet's heaviest behavioral battery. No re-tier.
Consolidation folds: the Examples/Usage order fix (the one red), the W-next #7 contrast
digit reconciliation, and (family, optional) the suggestion of exposing ids for probe
stability.

## Probe-fault ownership

1. **The click-promise clock**: my first auto-dismiss reads (4660/4690/4660) started the
   clock at click RESOLUTION — ~500ms late under headless load. Corrected with the
   in-page capture-phase mark: **5245ms push-exact**, matching the claim family.
2. **The dev-server contamination**: the sibling's tooltip edits drove mirror sync + vite
   page-reload trains (four navigations in one run — two of my dev runs are void:
   the 3450/3530ms reads). Resolved by the fresh-build preview; the contaminated digits
   are withdrawn.
3. **The VT-name extraction** returned nulls (the shared-element names live where my
   attribute walk didn't reach) — the keys receipt stands on the monotonic counter +
   FIFO identity; the extraction gap is mine.
4. **The first FIFO dismiss** clicked a depth card's × while collapsed (front-intercepted)
   and read an empty stack post-expiry — corrected to hover-expand + the precise
   has-text locator; the promoted-order receipt is the corrected one.

## Process evidence

- Port **5243**: lsof **empty before** (rc=1); dev server (PID+wrapper killed), fresh
  `npm run build` rc=0, verify:docs run against it (the red quoted), **vite preview**
  served the battery; preview **killed by PID 18570 + wrapper 18539**; final
  `lsof -nP -iTCP:5243 -sTCP:LISTEN` → **empty, rc=1**. No orphans.
- **NO commits, NO pushes; zero product-tree edits.** Media emulations, the island class,
  and the visibility stub reverted in-probe.
- Independence: vellum's report 44 not read; her receipts reached me via the dispatch and
  were verified, not trusted.
- Artifacts: /tmp/scribe-71-probe{1,2b,3,4,5,6,7,8,9,10,11,12,13}.mjs,
  /tmp/scribe-71-{build,docs,ambient,universal,scheck,dev,preview}.log.

---

## Concordance note (reserved)

Vellum's report 44 will be cross-checked after filing per the standing protocol; the
concordance addendum will append to this file. The dispatch's receipt list matched my
findings on every claim I drove; the one divergent digit (2.81:1 vs my 1.17:1) is the
frozen-ink pair/vintage reconciliation flagged above.
