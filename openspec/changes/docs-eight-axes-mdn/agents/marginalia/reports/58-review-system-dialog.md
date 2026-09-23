# TASK 58 — FIRST REVIEW system-dialog (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (FIRST reviewer; independence law held — quill's reports 34/35
  NOT read before the findings below were fixed; the concordance addendum follows after
  filing).
- **Target**: quill's page — `system-dialog.html/+page.svelte` (452 lines) + `+page.ts`
  (9-entry toc) + the family (root 117 / content 280 / host 180 / trigger 55 / the
  imperative api 129 / css 114 / stylex 82 / defaults 97). The arc under review: the dead
  anchored rise → the TDZ crash (LAW #20) → the flip repair. Zero edits by me; sibling
  in-flight set (vellum's tags-input.html mid-edit) receipted, not chased.
- **VERDICT: PASS** — 0 MAJOR / **1 MINOR (rides closure)** / 0 LOW / 0 NIT. Every
  behavioral claim of the arc verified LIVE — the anchored rise, the imperative trio, the
  stamps, the re-pin — and the width-atom loss is receipted at the stylesheet level; the
  MINOR is the missing disclosure seat the dispatch expected, copy-only.

## The dispatched surface — verified TRUE

1. **THE ANCHORED RISE — VERIFIED LIVE.** `position-anchor` interpolates the uid (measured
   `--s2` on the demo pair, `--s10` on the stamps pair; the Trigger's `anchor-name: --s2`
   matches its Content's `position-anchor: --s2`). Opening the demo dialog: the panel lands
   **below the trigger with a 12px gap** and **center-x delta 0** (panel cx 636 == trigger
   cx 636) — `position-area: block-end` with the symmetric `margin: var(--jx-gap)`.
   Mechanics, each driven:
   - **No light dismiss**: a real outside pointer click on empty page space leaves the
     panel open (manual-popover gravity) — and a 1.5s open-state watch shows no
     spontaneous close.
   - **Escape scoping BOTH SIDES**: Tab twice moves focus OUT of the panel (to the sibling
     trigger) with the panel still open, and Escape there does NOT close it (the keydown
     lives on the panel); focusing the Cancel inside and pressing Escape closes it.
   - **Tab exits the non-modal panel**: no trap — focus walks out, the question stays open.
   - **The safe landing**: focus lands on **Cancel** on open (measured); the alert
     posture's no-cancel form lands on the affirmative (the trio's alert focuses "ok").
   - **The confirm seam + focus restore**: clicking the destructive action runs the root's
     `onconfirm` (the canvas output flips to deleted: yes) and closes through the one
     animated path; focus restores to the **invoker trigger** (measured `isInvoker: true`).
2. **THE IMPERATIVE TRIO (the new taxonomy shape) — VERIFIED LIVE.** Hosts mount as private
   divs **on body** (census receipted, with the canvas's own body-level layer distinguished
   — see process evidence); the panel carries `data-pose="center"`, **no anchor chain** in
   its style, `margin: auto`, and paints **dead-center** (cx 721 vs 720, cy 501 vs 500).
   Exactly-once resolution, each route driven: **confirm → true** (action), **confirm →
   false** (Escape), **prompt Enter → the typed value** (`"jixoai-labs/ui
   marginalia-was-here"` — the initialValue plus my keystrokes, focusing the input per
   `focusLanding="none"`), **prompt Escape → null**, **alert → acknowledged**. **Unmount
   after the exit window**: the mounted host is gone within ~600ms of resolution (body
   census 2 → 1), never hanging, never double-resolving (the readout flips once).
3. **THE WIDTH-ATOM SPLIT — THE LOSS PERSISTS, PINNED AT THE STYLESHEET LEVEL.** The
   anchored demo panel computes **544.5px wide with max-width: none** against the declared
   `min(24rem, calc(100vw − 2rem))` (384 cap); the stamps panel shows a stretch form
   (**1440px, max-width 100%**) at its scroll state; the trio's centered panel fits under
   the cap only by content (370/487). The stylesheet walk settles the class of the loss:
   **no rule in any served stylesheet sets the 24rem width at all** — the atom exists in
   the stylex source of record (`panel.width = min(24rem, …)`) and never reaches CSS. The
   anchor being correct (the rise measured above) proves the split: geometry repaired,
   width atom still lost — W-next #8's second family repro, receipted.
4. **Stamps on the promoted panel — VERIFIED.** `density="small" theme="dark" radius={12}`
   on the axes Content: **data-density="sm"**, **class:dark**, style attr carries
   `--jx-radius-effective: 12px` + the explicit-lane consumed calc, computed corner
   **12px**, and the corner is **PUBLISHED: `--jx-corner` computes `calc(12px * 1)`** for
   the strip's end cells; the **own elevation level3 rides the style attr with no lane
   named** (`--jx-elevation-effective: 6` + the level3 shadow/surface pair). **Auto stamps
   nothing**: the demo's anchored panel carries `data-density: null`, no dark class, and
   only the elevation-own + anchoring declarations.
5. **The matrix re-pin — VERIFIED IN-TREE.** The ambient suite compiles the system-dialog
   rows at their new ordinals: **Content at table[3] and Action at table[4]** — the 2→3 /
   3→4 moves — both passing, plus the deny-lint row; the suite's 6 failures are ALL
   tags-input.html CompileError (vellum's in-flight sibling file — `git status` confirms
   the uncommitted edit; zero system-dialog keys).
6. **LAW #20 residue — as expected.** Page-scoped svelte-check: **0 diagnostics**. The
   family carries the known debt: trigger.svelte 5 errors (the implicit-any / `$props`
   block-scoped class from the template-literal + repair era) + content.svelte 8×
   state_referenced_locally warns (:144, the fleet pattern) — expected, not page findings.

## Standard battery

- **SSR/post-settle duality + warm-reload law**: two fetches hash-identical (a24bd2bf…);
  SSR clean.
- **EXTRA-lane by name**: canvases "system dialog" + "SystemDialog · universal props"
  mounted post-reveal; the trio section's three PressButtons + the live readout.
- **Measurement-first**: every behavioral receipt above is a driven probe (clicks, keys,
  rect math), not a computed-style assertion.
- **THEME-SPLIT vocabulary**: the dark bridge measured on the promoted panel (class:dark
  true with theme="dark"); ambient panels carry nothing.
- **Vocabulary-grep**: zero transition declarations across the family svelte + css (the
  motion row's WAAPI-kernel claim — the kernel drives, the family authors none).
- **KEYED-EACH**: the page mounts no each (composition family — the receipt is the census:
  8 promoted/inline roots, all panels present by name).
- **LAW #19**: toc 9/9 (overview, system-dialog-demo, system, law, types, usage, parts,
  axes, accessibility) resolve; zero duplicate ids (SSR + live); h1 ×1; 0 undefined/null.

## Findings (severity-tagged)

1. **[MINOR — the width-loss disclosure seat is missing, and the token row asserts the
   falsified measure]** The dispatch expected the page to disclose the width-atom loss
   "without claiming a cause"; no such disclosure exists — and worse, the TokenTable's
   "the viewport measure" row states `min(24rem, 100vw − 2rem)` as "The anchored panel's
   width", which the served panel falsifies (544.5px measured, the 24rem rule absent from
   every stylesheet). Copy-only, rides closure: one disclosure sentence naming the loss
   mechanism-agnostically (W-next #8's second repro) + true the token row to "the authored
   measure (currently not landing on the promoted panel — see the width-atom loss)".
   The loss itself is W-next #8's recorded family repro — no cause claimed here either.
2. **[NONE]** otherwise — no MAJOR, no LOW on any behavioral claim; the trio, the rise, the
   stamps, and the re-pin all verify.

## Gates

| Gate | Result |
|---|---|
| ambient solo | **278/284, exit 1 — the 6 failures are all tags-input.html CompileError** (vellum's in-flight uncommitted edit; `git status` keyed), zero system-dialog keys; **the re-pin rows pass at their new ordinals (Content table[3], Action table[4])** — attributed per protocol |
| verify:docs-universal | GREEN **110/110** (110 markers) |
| svelte-check (fleet, 2495 files) | **page 0 diagnostics**; family = the LAW #20 residue (trigger 5 errors + content 8× warns — expected, unchanged files); fleet 1566/1028/605 |
| Raw SSR | warm-reload identical; dups 0; h1 ×1; toc 9/9; 8 sysdlg hooks in SSR |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper (pid 22935 / pgid 22932) → vite killed by
  pgid TERM + stragglers -9; **port after: empty (exit 1)**.
- **NO commits, NO pushes; zero product-tree edits.** All live mutations (dialog drives,
  focus moves, trio mounts) self-resolved or unmounted in-probe.
- Independence: quill's reports 34/35 not read before the findings were fixed.
- Instrument honesty: my first anchored probe measured the trigger pre-click and the panel
  post-auto-scroll — the "-301 gap" was my stale rect, not a page defect; probe v2 measures
  both in one evaluate. My first trio census over-counted body hosts by including the
  canvas's own body-level layer (407KB, holding the page's composed dialog) — the load-time
  census (1 layer, panelOpen false) separates the layers cleanly. The Tab-scoping sequence
  needed exactly-two Tab presses (cancel → action → outside) before the outside-Escape
  receipt is honest.
- Artifacts: /tmp/marginalia-58-probe{1,2,3,4}.mjs, /tmp/marginalia-58-ssr.html,
  /tmp/marginalia-58-{ambient,universal,scheck,dev}.log.

---

## Concordance addendum (appended after reading quill's reports 34 and 35)

## Concordance addendum (appended after reading quill's reports 34 and 35)

My findings above were fixed before this section; cross-check against the arc:

- **FULL CONCORDANCE with the flip (report 35)**: the uid interpolation (--s2/--s10
  measured; her --s2), the panel below the trigger with the 12px gap, center-x delta 0
  (her 556 == 556 at her viewport; mine 636 == 636 at mine), and every anchored mechanic —
  outside click stays open, Escape scoped both sides, Tab exits, safe landing on Cancel
  with the no-cancel fallback, the confirm seam + invoker restore, the trio exactly-once at
  pose=center dead-center — all reproduce. Her LAW #20 repair is verified in source (the
  anchorStyle const moved below the context init with the ordering-law comment) and her
  "+2 warnings" forecast is absorbed in the 8× :144 fleet-pattern warns I receipted.
- **FULL CONCORDANCE with the CODE (report 34)**: the stamps census (sm rung, dark bridge,
  radius 12px → --jx-radius-effective AND --jx-corner published, the own level3 with no
  lane named, auto stamps nothing), the matrix re-pin ordinals (Content table[3], Action
  table[4] passing in my ambient run), the chrome receipts, and her defect-arc: the dead
  rise she receipted (top-left 12,12, width 545) is exactly what the flip repaired — my
  probes measure the repaired truth.
- **THE WIDTH SPLIT — concordant, and my instrument pins it one level deeper**: her split
  stands (the anchor correct, the loss independent, W-next #8's second repro), and my
  addition is the stylesheet walk: **no rule in any served stylesheet sets the 24rem width
  at all** — the atom exists in the stylex source of record and never reaches CSS, which
  upgrades "reads absent on the measured element" to "the atom never ships". I also
  receipt a second, worse form: the stamps panel stretches to 1440px (max-width 100%) at
  its scroll state while the demo panel fit-contents at 544.5 — the loss is not one number.
  And her report 35's "the page documents the contract" is the seat my MINOR bites: the
  page documents the TOKEN as if true and never discloses the loss — the dispatch's
  expected disclosure seat does not exist.
- **ADDITIONS**: the exactly-once + unmount census with the canvas-layer distinction (the
  body's 407KB canvas layer vs the mounted trio host — a load-time census separates them);
  the trio's 370px width (under the cap by content, not by the atom); the ambient
  attribution (6 failures all tags-input.html CompileError — vellum's live file is
  tags-input, not the dispatch's tabs.html); and the LAW #20 residue census (trigger 5
  errors + content 8× warns, page 0).
