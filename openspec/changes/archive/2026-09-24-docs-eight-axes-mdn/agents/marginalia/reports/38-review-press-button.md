# TASK 38 — REVIEW press-button (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (1st reviewer; reviewer #2 after — independence law held: vellum's
  report 33 NOT read; every receipt derived from the page + family source + live probes)
- **Target**: vellum's page integrated at `c4fdd555` — `press-button.html/+page.svelte` (991
  lines) + `+page.ts` (12-entry toc) + the family (svelte 715 / stylex / css / effect runtime /
  ripple). Zero drift since integration: no commits and no uncommitted changes touch any
  press-button path (the tree's in-flight set — quill's sheet files, vellum's
  prototype-flex/grid — belongs to siblings; untouched).
- **Method**: source reads (page, family svelte/css/stylex, the theme's `.jx-press` law in
  jixoai.css, SectionCard/meta as needed), live probes with REAL pointer states and
  `matches(':hover'/':active')` engagement receipts (LAW #14 settles past the 150ms press
  transitions), a real `.dark` island injection with restore, forced-colors emulation,
  breakpoint-disciplined query(), SSR parse + real-DOM duplicate-id scan, vocabulary sweep,
  family solos + ambient + docs-universal + fleet svelte-check.
- **VERDICT: PASS (1 MINOR + 2 LOW, no MAJOR)** — the press ladder, the floors, the radius
  wiring, the theme split's honesty, and the forced-colors law all verified digit-exact; one
  stale hue-digit receipt, one stale family docstring (drift #11), one frozen-ink extension
  noted.

## The claims — verified TRUE

1. **The press ladder — VERIFIED pixel-exact with engagement receipts** (fill, live-demo,
   `matches(':hover'/':active')` asserted true at each read):
   - **rest**: `rgba(0,0,0,0.5) 2px 2px 0px 0px` (shadow-xs), translate none;
   - **hover**: shadow GROWS to sm — `rgb(0,0,0) 2px 2px 0 0, rgba(255,255,255,0.5) 1px 1px 0 1px`
     (a white lift ring joins) — **translate: none, the body never moves** ✓;
   - **active**: **translate: 1px 1px** with the shadow offsets **counter-shrunk 1px on both
     layers** (`1px 1px` black + `0px 0px 0px 1px` ring — the paint stays anchored on screen) ✓;
   - **transitions**: `0.15s ease-out` ×5 on translate, box-shadow, background-color,
     border-color, color (the `.jx-press` law, jixoai.css :1101-1119 — the press moves via the
     individual `translate` property, not `transform`);
   - **ghost**: the none-trio (`--jx-press-shadow/-hover/-active: none`, press-button.css
     :108-111) — shadow none at rest AND active, **the vector retained: translate 1px 1px on
     active** (no move override — the law's default 1px 1px);
   - **flat** (`raised={false}`): the engrave swap — active shadow
     `rgba(0,0,0,0.4) 1px 1px 0 0 inset, rgba(255,255,255,0.96) -1px -1px 0 0 inset` with
     **`--jx-press-move: none` → translate none, the body never moves** ✓.
   Probe craft: my first run collapsed the hover leg into the pressed state (press-then-read)
   and read a mid-transition `translate` — both caught by engagement receipts and re-measured.
2. **Hit floors — VERIFIED**: ladder heights **24 / 28 / 32 / 40 / 48px** with voices
   **10 / 11 / 12 / 13 / 15px** (the 2xs rung at exactly the WCAG 2.5.8 24px minimum, live in
   the DensityDemo); the **square pose measures 40.0×40.0**; default-rung hit height 40px.
3. **Radius wiring — VERIFIED**: the dock's driven seat (`--jx-radius-effective: 20px;
   --jx-inset-effective: 0.875rem` stamped on the seat) computes **6px** through the consumed
   auto form — the evaluated chain read live: `calc(max(0px, calc(20px - 0.875rem)) * 1)`;
   **radius="medium" → 8px**; **radius 10 + squircle → 20px with corner-shape superellipse(2)**
   (§14 ×2, computed). (My first sweep read 0px off the wrong element — the targeted
   seat-scoped read is the receipt.)
4. **Theme split WITHIN the ladder — VERIFIED, and the page is HONEST about the freeze.** Under
   a real `.dark` island (injected, settled 450ms, restored): **fill re-tints**
   oklch(0.6489 0.237 129) → **oklch(0.7044 0.1872 125)** (the drifted dark primary), the
   **outline frame flips white (oklch(1 0 0))**, and the **outline/ghost label ink stays frozen
   oklch(0 0 0) on both sides**. The page NAMES the freeze with its mechanism ("a defineVars
   :root literal the dark scope does not re-declare") — it does not paper over it. The quoted
   HUE digits (47 → 43) do not reproduce — see the LOW.
5. **Forced-colors — VERIFIED emulated**: **link → rgb(0, 0, 159)** (LinkText), fill →
   ButtonFace white/ButtonText black. The law's citation is live.
6. **W-next #5 — adjudicated: CLOSE (narrowed to documentation-closure).** The two receipts
   compose rather than conflict: vellum's EXPLICIT path (popovertarget declared :404, defaulted
   undefined :446, forwarded :707; opens+toggles with zero component listeners — and my own
   task-35 sweep opened six popconfirm panels through PressButton triggers) is the SUPPORTED
   wire; quill's UNSET path (an auto-wire's setAttribute clobbered on re-render) is the claimed
   prop behaving correctly under reconciliation — the non-contract failing. The page's api row
   + overview teach the explicit contract truthfully (button-only, anchors drop it, composers
   set aria-haspopup); popconfirm's page (my task-35 review) documents the interplay workaround.
   A family-side "fix" would mean post-write attribute reconciliation — fighting the framework.
   Narrow the ledger entry to: "claimed-prop components must expose the wiring as a prop; the
   setAttribute wire is unsupported" — both pages already say so.
7. **Step 0 re-truing cross-reference — HONEST BY ABSENCE**: zero number-input mentions on the
   press-button page (grep) — there is no cross-reference to falsify; the re-trued error copy
   lives on the number-input page (my task-36 review verified it against the fixed family).
8. **Standard chrome — VERIFIED**: toc **12/12** served order==DOM (overview → live-demo →
   zone → anchors → async → law → types → usage → theming → api → universal-props →
   accessibility; install/see-also out); h1 ×1; universal marker ×1; install/see-also markers
   present; 0 literal undefined/null text nodes. **The id="usage" dedup held** — the only real
   duplicate ids on the page are `overview` and `see-also` as DIV+H2 pairs, which is the
   SCAFFOLD's own toc-anchor pattern (verified identical on popconfirm — fleet-wide, not page
   debt). **Vocabulary sweep**: "the external law" survives at page :683/:801 and family :643 —
   all three describe the CURRENT #5 derived-flag behavior correctly (only an absolute http(s)
   URL is external); no behavioral survivor of the retired form.

## Findings (severity-tagged)

1. **[MINOR — drift ledger #11, second live catch]** The family docstring still sells the
   square pose as "a size-10.5 (**42px**) frame" (:406, repeated :561) — measured **40.0×40.0**
   (the square rides the density hit channel, not a literal). The page's same-source drawer
   ships press-button.svelte?raw verbatim, so consumers read the stale number. Family-lane
   comment fix (behavior unaffected).
2. **[LOW — stale hue digits in the theme receipt]** The theme row quotes the fill re-tint as
   oklch(0.6489 0.237 **47**) → oklch(0.7044 0.1872 **43**); measured live **129 → 125** — L/C
   identical on both sides (the re-derive signature holds), hue shifted +82 by the site-local
   hue runtime (jixoai.css :32-45 documents the wall-clock rotation). Quote the runtime caveat
   or the L/C signature; absolute hue digits don't reproduce across runtime states.
3. **[LOW — the frozen-ink seam's unmentioned third instance]** The page names outline/ghost
   label ink as the frozen literal; **fill's label ink is also constant oklch(0 0 0)** — on
   light AND on the re-tinted dark fill (measured) — so the W-next #7 seam extends to the
   loudest rung, where black-on-dark-primary is the visible contrast cost. Candidate extension
   for the W-next #7 record; the page's honesty about outline/ghost stands.
4. **[INFO — pre-existing diagnostics, unchanged files]** family :448/:449 (the aria-label/
   aria-disabled pull-out destructures — the composed-never-clobbered law's typing debt),
   :577 Object.entries overload; meta 'icon'-not-in-XUI ×2 (generated-file drift); scenes ×2;
   spec dataset-on-Element ×2. Page: **0 diagnostics**.
5. **[NONE]** otherwise — no MAJOR on any dispatched claim.

## Gates

| Gate | Result |
|---|---|
| press-button family solos (press-button + restprops + canvas-schema + press-fill-basis + defaults-buttons + density-adoption-buttons + effect-attachments) | **410/412** — the 2 failures are ambient sheet-keyed (below); **zero press-button failures** |
| ambient | solo 282/284; the 2 failures (`sheet\|1\|variant\|1`) are **quill's in-flight sheet.html edits** (uncommitted in the tree, solo-reproduced, keyed exactly to their file) — sibling noise per the attribution protocol, never touched |
| verify:docs-universal | GREEN **110/110** |
| svelte-check (fleet, 616 files) | **page 0 diagnostics**; press-button-path debt pre-existing (unchanged files) |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper → vite (PID 9202 + wrapper killed by PID);
  **port after: []**.
- **NO commits, NO pushes; zero product-tree edits.** The `.dark` islands and pose probes were
  injected and restored in the live DOM only; sibling files untouched.
- Independence: vellum's report 33 not read. My own first battery had two probe faults — the
  press-then-read hover collapse and a wrong-element radius read — both caught by engagement
  receipts (`matches(':active')`) and impossible values, then re-measured correctly. The
  receipts above are the corrected ones.
- Artifacts: /tmp/marginalia-38-probe{1,2}.mjs, /tmp/marginalia-38-ssr.html,
  /tmp/marginalia-38-{specs,ambient,scheck,dev}.log.
