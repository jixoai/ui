# TASK 64 — SECOND REVIEW system-dialog (scribe, 2026-09-24)

- **Reviewer**: scribe (2nd of 2; independence law held — vellum's/quill's reports 35/34
  and marginalia's report 58 were opened only AFTER the findings below were fixed by my
  own source reads + live probes; the concordance addendum follows at the end)
- **Target**: quill's page — `apps/www/src/routes/docs/components/system-dialog.html/`
  (+page.svelte 459 lines + +page.ts, 9-entry toc) over the system-dialog family
  (root 117 / content 280 / host 180 / trigger 55 / the imperative api 129 / css /
  stylex / defaults). Target paths clean in the working tree; the in-flight sibling set
  untouched.
- **Method**: source reads (page, root, content, trio api, the matrix fixture), headless
  Chromium over dev SSR :5243 with warm-reload discipline, real-click/keyboard mechanics
  batteries, a served-stylesheet walk for the width-atom hunt, stamp reads at the
  promoted panel, trio resolution-matrix drives, SSR payload parse, the three gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT new; the landed MINOR verified
  both halves at the paint; one FOREIGN committed gate break (separator.html, not this
  page) documented for the orchestrator. The page closes.

## The landed MINOR (38560e22) — both halves verified against the paint

1. **The token row reads AUTHORED, NOT SERVED with the defect named** (:202): "min(24rem,
   100vw − 2rem) — AUTHORED, NOT SERVED … MEASURED DEFECT (W-next #8, second family
   repro): the served anchored panel computes 544.5px with max-width none — no rule in any
   served stylesheet sets the 24rem cap".
2. **The overview carries the mechanism-agnostic disclosure sentence** (:294-299): "the
   authored width cap … does not reach the served panel (544.5px at max-width none; no
   served stylesheet rule sets the cap — W-next #8's second family repro,
   mechanism-agnostic: the anchor itself is proven correct)".
3. **MY PAINT MEASUREMENT**: the served demo panel computes **544.5px wide, max-width
   none** — the authored 384px cap absent at the box. **MY STYLESHEET WALK** (every
   served CSSOM rule, nested included): **zero max-width rules total, zero containing
   24rem** — the atom never ships, upgrading the row's claim from assertion to census.
   No seat on the page still asserts the cap as served (the law table, demo description,
   parts tables, and api make no width-cap-as-served claim — grep + read).

## The dispatched surface — verified TRUE (my own instruments)

1. **THE ANCHORED RISE — VERIFIED LIVE.** The panel's `position-anchor: --s2`
   (the uid interpolated — the second composed dialog on the page), `position-area:
   block-end`; opening the demo dialog lands the panel **below the trigger with a 12px
   gap** and **center-x delta 0** (trigger and panel share center-x exactly), top layer
   confirmed (`:popover-open`).
2. **THE MECHANICS BATTERY — VERIFIED on real clicks/keys.**
   - **No light dismiss**: a real outside pointer click leaves the panel open.
   - **Escape scoping BOTH SIDES**: Tab ×2 moves focus outside (the sibling trigger);
     Escape there **does NOT close** the panel (the keydown lives on the panel — my first
     probe sequence muddied this by never re-asserting open state after the outside
     Escape; the corrected battery asserts it: open true before, open true after);
     focusing the Cancel inside and pressing Escape closes.
   - **Tab exits** the non-modal panel (no trap — focus walks to page anchors, the
     question stays open).
   - **The safe landing**: focus lands on **Cancel** on open.
   - **The confirm seam + invoker focus restore**: clicking the destructive action runs
     the Root's `onconfirm` (canvas output flips to **deleted: yes**) and closes; focus
     restores to the **invoker trigger** ("delete pipeline…", measured).
3. **THE IMPERATIVE TRIO — VERIFIED EXACTLY-ONCE AT DEAD-CENTER.** Each call mounts
   exactly **one** panel with **no anchor chain** in its style (pose="center" drops the
   chain) at **dead-center** (cx 700 == 700, cy 450 == 450 at 1400×900; both deltas < 2px)
   — the full resolution matrix driven: **confirm action → true**; **confirm Escape →
   false**; **prompt Enter → the typed value** (`"jixoai/renamed"` in the page's
   JSON.readout); **prompt Escape → null**; **alert → acknowledged**. **Unmount after the
   exit window**: no trio-minted host div remains after settle (the strict census's single
   body-level candidate is the composed demo's own `display: contents` wrapper, present
   from first load — not a trio host; zero open panels remain).
4. **STAMPS ON THE PROMOTED PANEL — VERIFIED.** The axes seat (`density="small"
   theme="dark" radius={12}`): **data-density="sm"**, **class:dark**, style attr carries
   `--jx-radius-effective: 12px` + the consumed calc, computed corner **12px**, and the
   corner is **PUBLISHED: `--jx-corner: calc(12px * 1)`** for the strip's end cells; the
   **own elevation level3 rides with no lane named** (`--jx-elevation-effective: 6` +
   `--jx-elevation-shadow: var(--jx-elevation-level3-shadow)`). **Auto stamps nothing**
   (the demo panel: no data-density, no dark class — only the elevation-own + anchoring
   declarations).
5. **THE MATRIX RE-PIN ORDINALS — VERIFIED IN-TREE AND AGAINST THE SERVED ORDER.** The
   fixture rows: **Content at table[3]** (variant, bareDefault auto, own,
   alertDialogSurfaceVariantSlot, carrying the re-pin note "root=1/Trigger=2/Content=3/
   Action=4, the axes table follows at 5") and **Action at table[4]** (variant, fill,
   alertDialogActionVariantSlot). The served page order matches: [0] the law table (which
   the page gained ahead of the parts — the re-pin's cause), [1] root, [2] Trigger,
   [3] Content, [4] Action, [5] axes. Both rows' props are the first variant of their
   tables. Correct.
6. **THE VAR-VS-PAINT READ-SITE SPLIT — APPLIED.** My theme receipts name the read site:
   `class:dark` lands on the promoted panel and the paint was read **at the panel element
   itself** (the platform element paints nothing — the surface body owns fill, computed
   dark mix read in the panel subtree) — no html-level var read stands in for the
   element's paint anywhere in my receipts.

## Standard battery

- **SSR/post-settle duality**: payload 965,931 bytes; h1 ×1; universal marker ×1 (the
  root table in #parts); toc = the 9 +page.ts ids ×2 rail surfaces; 0 undefined/null
  literals.
- **Warm-reload law**: every session visited → reloaded → measured; all machines stable.
- **EXTRA-lane by name**: the demo pair, the system trio's three PressButtons + the
  live readout (`data-testid="system-result"`), the axes seat — all present and driven.
- **THEME-SPLIT**: the dark bridge on the promoted panel (measured, read site named
  above); auto panels carry nothing.
- **Vocabulary-grep**: zero `jxoai` misspellings; no transition declarations in the
  family (the WAAPI kernel drives; the family authors none).
- **KEYED-EACH**: the page mounts no each (a composition family) — the receipt is the
  census: all panels present by name, zero console errors/warnings across every session.
- **LAW #19**: **51 ids, zero duplicates**.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **278/284, exit 1 — all 6 failures are separator.html `js_parse_error` (:505), a COMMITTED foreign page bug**: the var-vs-paint law sentence in the theming TokenTable carries an unescaped apostrophe inside a single-quoted string (landed with 7f1b78ff, the separator 1st-pass integration). Zero system-dialog keys fail; **the re-pin rows PASS at their new ordinals**. The 4 bijection/red tests fail only because the corpus parse dies on separator. One-character escape (or reword) in separator.html :505 fixes all 6 — NOT my page's scope; flagged for the orchestrator |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 604 files) | **page 0 diagnostics**; the family carries the LAW #20 residue (trigger 5 errors, content 8× state_referenced_locally at :144, index :23 + action/cancel/actions type noise) — pre-existing, unchanged files |
| Raw SSR | h1 ×1; marker ×1; toc 9/9 ×2; 0 undefined/null |

## Process evidence

- Port **5243**: lsof empty before the run; vite killed by **PID 66965 + wrapper 66935**
  (`npm run dev --port 5243 --strictPort`); `lsof -nP -iTCP:5243 -sTCP:LISTEN` → **empty,
  rc=1** after.
- **NO commits, NO pushes; zero product-tree edits.** All dialog drives self-resolved or
  unmounted in-probe; siblings' in-flight files untouched.
- Independence: quill 35/34 and marginalia 58 opened only after the findings above were
  fixed; concordance follows.
- Instrument honesty: my first escape-scoping sequence pressed Escape with focus outside
  and never re-asserted the open state before moving on — the corrected battery asserts
  open-state on BOTH sides of the outside-Escape (the scoping held; my sequence, not the
  page, was the defect); my first strict host census over-matched (a `display: contents`
  wrapper holding the composed demo dialog is present from first load — identified, not a
  trio leftover).
- Artifacts: /tmp/scribe-64-probe{1,2,3,4,5}.mjs, /tmp/scribe-64-ssr.html,
  /tmp/scribe-64-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading quill 34/35 + marginalia 58)

My findings above were fixed before this section.

- **FULL CONCORDANCE with marginalia 58 — every overlapping receipt reproduced**: the
  width split (544.5px, max-width none; her stylesheet walk "no rule sets the 24rem at
  all" = my census, zero max-width rules corpus-wide), the uid interpolation (--s2 both),
  the 12px gap + center-x delta 0, the full mechanics battery (outside click, Escape
  scoped both sides, Tab exits, Cancel landing, the seam + invoker restore — her
  `isInvoker: true` = my "delete pipeline…" read), the trio exactly-once at dead-center
  with all six resolution routes (her prompt keystroke receipt = my typed-value receipt),
  the unmount census (her body 2 → 1 = my zero trio-minted leftovers, with the same
  canvas-layer distinction she pioneered), the stamps census (sm/dark/12px consumed +
  --jx-corner published + the own level3; auto stamps nothing), the re-pin ordinals
  passing, page 0 diagnostics, and her family debt census (trigger 5 errors + content 8×
  :144 warns).
- **THE LANDED MINOR — verified as the closure she asked for**: her MINOR requested
  exactly the two halves the dispatch named; both are served (quoted above), and my paint
  + stylesheet-walk measurements confirm the disclosed defect is still the truth on the
  served page (the disclosure is accurate, not stale).
- **quill 35 (the flip)**: her repaired-truth receipts all reproduce (--s2, block-end,
  12px, Δ0 — her 556 == 556 at her viewport, mine at mine); her TDZ repair is visible in
  source (anchorStyle below the context init with the ordering-law comment); her W-next #8
  extension is the ledger entry the landed MINOR now discloses. quill 34's pre-flip
  dead-rise defect receipts are superseded by the flip (per 35's own finding history) — my
  probes measure the repaired truth, matching 35's battery.
- **THE GATE DELTA — the rotating sibling parse error, now COMMITTED**: her run's 6
  failures were tags-input.html (vellum's uncommitted file); mine are separator.html
  :505 — the same failure class (foreign CompileError, zero system-dialog keys) but this
  one is COMMITTED (7f1b78ff) and stays red until the apostrophe is escaped. The
  untracked-sibling attribution protocol covered her case; this one needs the orchestrator's
  one-character fix (or folds into the separator 2nd pass) before the ambient gate reads
  green tree-wide.
- **Additions (mine, not in the prior three)**: the exhaustive served-CSSOM walk (zero
  max-width rules of any kind — the atom never ships, census-grade); the corrected
  outside-Escape assert (open-state on both sides — the receipt her battery implied but
  mine initially muddied); the strict trio-leftover census with the
  `display: contents` wrapper identified; the matrix fixture dump matched against the
  served table order (the re-pin's 1-based note reconciled with the 0-based tableIndex).
