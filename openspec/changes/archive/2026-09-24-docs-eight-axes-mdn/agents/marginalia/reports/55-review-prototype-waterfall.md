# TASK 55 — SECOND REVIEW prototype-waterfall (marginalia, 2026-09-23; 2nd of 2)

- **Reviewer**: marginalia (second reviewer; independence law held — vellum's report 37 and
  scribe's report 47 NOT read before the findings below were fixed; the concordance addendum
  follows after filing).
- **Target**: vellum's page — `prototype-waterfall.html/+page.svelte` (481 lines) + the
  family (147 lines, directives only). The correction under re-verify is d572efe3 (17 page
  lines). Zero edits by me; sibling in-flight set (vellum's tabs.html, quill's progress
  review fixtures, scribe's scroll-virtual) receipted, not chased.
- **VERDICT: NEEDS-WORK** — 0 MAJOR / **1 MINOR (the blocker)** / 1 LOW / 0 NIT. The
  two-direction experiment re-derives digit-exact and the corrected seats all teach the
  true mechanism — but the correction missed its FIFTH seat: an always-visible query-panel
  paragraph still teaches the falsified re-scale mechanism. One sentence to fix; the page
  closes on the re-run.

## THE BLOCKER (MINOR) — the fifth seat still teaches the falsified mechanism

The dispatch premise is that the rem-nuance correction landed in **five seats**. It landed
in four:

1. the size axis row (:104) ✓ — "the stamp is ELEMENT-LEVEL — column floors do NOT follow
   it … both forms stamp-scale-blind, two-direction probe";
2. the query-comment seat (:158) ✓ — "element-level: the rem floor does NOT follow the
   stamp";
3. the overview paragraph (:235-238) ✓ — "BOTH column forms are §11-stamp-scale-blind …
   stamp 18px → the 224px floor unchanged; document root 16→20px → 280px";
4. the axes summary (:403) ✓ — "both column forms are stamp-scale-blind … root 16→20px
   moves it to 280px".

**The fifth seat — the query-panel prose (:434-435) — still reads**: "…and because the
column floor is REM-based, **the '14rem' columns re-scale with the stamp**. The number lane
goes bare. Resize across 48rem." That is the falsified mechanism verbatim — the same false
claim scribe's MINOR corrected everywhere else, served in an always-visible paragraph, and
live-falsifiable by the page's own invitation (resize across 48rem: the floor stays 224px
because rem reads the document root, while the 13→18px stamp moves only the voice). The SSR
old-claim census carries exactly this one hit ("re-scale with the stamp" ×1). Fix: one
sentence in the query-panel paragraph ("the stamp is element-level — the rem floor does NOT
follow it; the floor moves only when the DOCUMENT root moves"), mirroring the other four
seats. Blocker because the correction's own premise ("all five seats") is unmet and the
page currently teaches both the true mechanism (four seats) and its refutation (the fifth).

## The re-derivations — the corrected seats' experiment VERIFIED digit-exact

My own two-direction probe on the query specimen (`columns="14rem"` + the size stamp, style
attr `--jx-size-effective: 18px; font-size: var(—); columns: 14rem; column-gap: 12px;`):

- **Direction 1 (stamp scale-blind)**: with the md stamp active (computed font-size 18px),
  the floor computes **224px** (column-width), 3 laid-out columns — the stamp did NOT move
  it. Quoted envelope: "stamp 18px keeps the 224px floor" — digit-exact.
- **Direction 2 (document root moves it)**: document root 16→20px → column-width **280px**
  (laid-out 3→2 as the widened floor re-fits), the 18px voice untouched — digit-exact
  against "document root 16→20px moves it to 280px". Restored: 224px / 3 columns / attr
  unchanged.
- **Floor digit-exact + viewport behavior**: the rig's floor form computes **224px at 1440**
  with **3 laid-out** columns and **2 laid-out at 760** (the floor constant, the count
  following) — "3 laid-out → 2 @760" ✓; the count form holds column-count 3 / auto width ✓;
  clean reverts ✓.
- **The settle phrasing — measured, not just read**: after a gap change, the SAME-task
  computed read returns **16px** (stale) and the next animation frame returns **24px**
  (settled) — the corrected sentence "settles by the first animation frame — the same-task
  read is stale at Svelte's flush boundary" is true by my own instrument.

## The rest of the dispatched surface — verified TRUE

- **The see-also loop resolves from waterfall's side**: the law section's trio pills link
  `/docs/components/prototype-flex.html` and `/docs/components/prototype-grid.html` — both
  fetch **200** (flex closed #42; grid closed earlier); DocsSeeAlso adds grid/flex +
  pattern-cta/pattern-faq, all 200. Waterfall's two outbound trio edges complete the six
  ordered pairs with the trio's other pages.
- **LAW #18 — 8 roots + 41 children mounted**: live census `[data-jx-prototype-waterfall]`
  ×8 (live-demo 1, types 2, universal-props 5), 41 children total; the rig's 9 keyed cards
  (`card.id` keys, stable) mounted.
- **No-JS family**: 147 lines, directives only (style:columns / column-gap / column-fill);
  no handlers, no timers, no observers; the overview's "There is NO JavaScript in the
  family" served (the multicol balancer is the engine).
- **The multicol doctrine caveat served**: column-order (newspaper) tradeoff, the straddle
  warning ("a card straddling a column break is split"), break-inside as the consumer's
  call, and the 'ordered' strategy recorded as the future seam — all live-receipted.
- **Standard battery**: warm-reload hash-identical (5676e55f…); EXTRA-lane by name (4
  canvases: the rig / columns forms / query() / universal props); THEME-SPLIT (dark bridge
  on the dark/lg panel; density rungs sm/lg stamped; named-step carriers on the medium
  panel); vocabulary-grep (zero transition declarations in the family — the motion row's
  grep receipt holds; no css file); SSR/post-settle duality clean; **LAW #19**: toc 8/8
  resolve, zero duplicate ids (SSR + live), h1 ×1; 0 undefined/null literals.

## Gates

| Gate | Result |
|---|---|
| ambient solo | **284/284, exit 0** |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 2495 files) | **page 0 diagnostics**; family 8× state_referenced_locally warns at :126 (fleet pattern, pre-existing) + 1 scene error (the Object.entries overload class); fleet 1567/1028/606 with vellum's tabs.html contributing 2 log lines (sibling noise, receipted) |
| Raw SSR | old-claim census ×1 (the missed fifth seat — the blocker); dups 0; h1 ×1; warm-reload identical |

## Findings (severity-tagged)

1. **[MINOR — THE BLOCKER]** the missed fifth seat (:434-435) — served falsified mechanism,
   one-sentence fix, detailed above.
2. **[LOW — the rig-usage mirror is dormant, and a lazy snippet claims it]** the page's
   `resolveRigUsage` matches only `rig.svelte` while the drawer file is named
   `prototype-waterfall-usage.svelte` (the flex page's LOW, same-source) — and here the
   playground snippet's help text (:292) serves the claim ("the rig's usage file mirrors
   the live control state (same-source law)") that the dormant resolver cannot honor. Fix
   with flex's: name the file `*.rig.svelte` (the resolver fires) or drop the resolver + the
   sentence.
3. **[NONE]** otherwise — the corrected four seats, the experiment, the loop, the census,
   the no-JS law, and the caveats all verify.

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper (pid 97734 / pgid 97731) → vite killed
  by pgid TERM + stragglers -9; **port after: empty (exit 1)**.
- **NO commits, NO pushes; zero product-tree edits.** Live mutations (the root font-size
  experiment, viewport resize, rig drives) all restored in-probe.
- Independence: vellum's report 37 and scribe's report 47 not read before the findings were
  fixed; the concordance addendum follows after filing.
- Instrument honesty: my first specimen finder keyed on the flex page's text (this page's
  query specimen carries card ids, not a "13px" label) — re-keyed on the serialized style
  directive (`columns: 14rem`), which is the honest handle on a directives-only family; the
  no-JS needle initially missed on a source line-wrap (textContent preserves the wrap) —
  re-receipted from SSR.
- Artifacts: /tmp/marginalia-55-probe{1,2}.mjs, /tmp/marginalia-55-ssr.html,
  /tmp/marginalia-55-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading vellum's report 37 and scribe's report 47)

## Concordance addendum (appended after reading vellum's report 37 and scribe's report 47)

My findings above were fixed before this section; cross-check against both:

- **FULL CONCORDANCE with scribe's falsification and receipts**: her two-direction
  experiment reproduces digit-exact on my instrument (stamp 18px keeps the 224px floor —
  her falsifier was "if the stamp re-scaled it, 14 × 18 = 252px. It didn't move"; document
  root 16→20px moves it to 280px); the floor end-to-end (224px / laid-out 3 @1400-1440,
  laid-out 2 @760); LAW #18 (8 roots, children [9,9,9,5,3,2,2,2] = 41 — my aggregate census
  8/41 concurs); the loop pills resolving; the no-JS grep; zero dup ids; page 0
  diagnostics; ambient clean. Her settle NIT is now MEASURED by my probe (same-task read
  16px stale, next animation frame 24px settled) — the corrected overview phrasing is
  true, not just precise.
- **FULL CONCORDANCE with vellum's CODE receipts that survive**: rig baseline and 4-form,
  floor 224px with laid-out 3→2 @760, stamps census, loop implementation, toc == DOM. Her
  point-4 nuance claim (the size stamp re-scales rem floors) is the falsification both
  reviewers measured — her own receipt list never ran the rescale experiment (scribe's
  divergence note, concurred).
- **THE BLOCKER SHARPENED by the seat ledger**: scribe's five seats were the size axis row,
  the overview third paragraph, the axes summary, the query-seat caption (the CodeBlock
  comment), and the receipts paragraph's IMPLIED reading. The correction landed those —
  but the **query-panel PROSE paragraph (:434-435) was in neither her list nor the
  correction**, and it carries the falsified sentence verbatim ("the '14rem' columns
  re-scale with the stamp"). My MINOR is precisely this: an unlisted sixth location the
  seat-census missed, served always-visible.
- **ADDITIONS**: (1) the receipts paragraph (:413) still reads "the reflow settled within
  the frame" — the NIT's pre-correction phrasing survives there (the :218 seat got "by the
  first animation frame"); phrasing-precision residual, same one-word class as the landed
  NIT. (2) the playground snippet's served claim "the rig's usage file mirrors the live
  control state" is the flex page's dormant-resolver LOW's sibling (file named
  `prototype-waterfall-usage.svelte`, resolver matches `rig.svelte`) — here stated in
  served prose. (3) my settle quantification (stale-vs-frame numbers) instruments the NIT
  for any future re-verify.
- **Gate-delta notes**: scribe's ambient 284/284 and mine agree; her port was 5243, mine
  5244 per dispatch; vellum's ambient 282/284 (the sheet-route pair) predates the
  system-dialog fix that has since landed — the suite is clean on the current tree.
