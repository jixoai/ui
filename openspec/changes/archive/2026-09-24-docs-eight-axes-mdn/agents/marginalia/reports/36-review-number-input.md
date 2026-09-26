# TASK 36 — REVIEW number-input (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (1st reviewer; reviewer #2 after — independence law held: vellum's
  report 32 NOT read; every receipt below derived from the page + family source + live probes)
- **Target**: vellum's page integrated at `6ab74431` — served on the current tree, which also
  carries TWO UNCOMMITTED in-flight edits I measured but never touched: the W-next #6 family
  fix (`.jx-num[data-jx-num-invalid]` unlayered carve-out in number-input.css) and the page's
  re-trued error-state prose (the dispatch anticipated both).
- **Method**: source reads (page, family svelte/css/meta), vocabulary-grep (the law), live
  probes with real pointer events (hold clock), settled computed reads (LAW #14 — twice, see
  the process note), breakpoint-disciplined query() probes (fresh-load pins + resize both
  directions), SSR parse + meta brace-count, family solos + ambient + docs-universal + fleet
  svelte-check.
- **VERDICT: PASS (with 2 MINOR doc-drift findings, no MAJOR)** — all seven dispatched claims
  verified TRUE on the current tree; the four open questions adjudicated below.

## The claims — verified TRUE

1. **The 5-rung ladder, 2xs at the WCAG floor — VERIFIED digit-exact** (DensityDemo scopes,
   live boxes): 2xs **24×24 / 10px** · xs **28×28 / 11px** · sm **32×32 / 12px** · default
   **40×40 / 13px** · lg **48×48 / 15px** — full-hit squares (width==height at every rung),
   shell min-heights matching, and the 2xs rung landing at **exactly 24px** (the WCAG 2.5.8
   target-size minimum), rendered live. Explicit-lane specimen stamps `data-density="2xs"` on
   the field root and re-scopes in place (measured 24×24 at the explicit seat too).
2. **Hold-clock receipts — VERIFIED with real pointer events**: samples (ms, value) from
   pointerdown on the plus stepper (start 4): **[85, 5]** — immediate step ≈80ms claim true;
   **[237, 5] and [341, 5]** — plateau through the 300ms delay (still 5 past 250ms) true;
   then [514, 6] [663, 8] [807, 9] [1109, 12] [1411, 15] — consistent with the 100ms/step
   interval armed at ~300ms (ticks ~400/500/600…). Release via pointerup at a DISTANT body
   coordinate (window-level listener): value stable at 15 before/after a 350ms wait —
   **orphanStep: false**.
3. **Theme split with the SETTLED correction — VERIFIED.** Computed `transitionDuration:
   0.15s` read FIRST, then a 600ms settle (LAW #14). The dark field (theme="dark", class bridge
   on root): **--shadow-well white ink** `hsl(0 0% 100% / 0.12)` (ambient: black 0.12), **--ring
   oklch(0.7044 0.1872 calc(75 - 4))** (the drifted dark primary; ambient 0.6489 0.237 75),
   **--muted oklch(0.2178 0 0)** (ambient 0.9551), **--background oklch(0 0 0)** (ambient 1 0 0)
   — ALL FLIP, while the shell atoms stay **frozen light**: shell background oklch(1 0 0), shell
   border oklch(0 0 0). The settled measurement confirms vellum's correction (her first "frozen"
   read was a t≈0 artifact of the 150ms transition).
4. **Commit semantics — VERIFIED live + spec**: "007" + Enter → input value **"7"**, chip 7;
   "99" + Enter → **16** (clamped under max=16); empty + Enter → the demo chip reads **"value
   1"** — the PlayRange shared-binding bounce (see adjudication 4; the component-level
   undefined is spec-true at onCommit `value = Number.isFinite(n) ? clamp(snap(n)) : undefined`
   + display `value == null ? '' : String(value)`).
5. **Falsified-claims purge — VERIFIED by vocabulary-grep**: the PAGE has zero hits for
   "28px-wide", "CONSUMES size and color", "dashes the shell" (source + served bytes), and zero
   un-measured "CONSUMED" claims — the axes rows carry grep receipts (zero channel readers in
   ui/number-input/ — re-grepped clean: no --jx-size-effective/--jx-color-effective/--jx-shape*/
   --jx-radius*/--jx-elevation-effective/--jx-motion-effective anywhere in the family).
   **The error state is now TRUE against the FIXED family**: the uncommitted carve-out rule is
   served (found in document.styleSheets: `.jx-num[data-jx-num-invalid] { border-style: dashed;
   border-color: var(--jx-destructive); }`), the error specimen computes **border-style: dashed**
   + border-color var(--jx-destructive) → **oklch(0 0 0)** (the destructive token: black light /
   white dark per jixoai.css:73/:290 — token-correct in the monochrome system), aria-invalid
   true + describedby → the "! message" line with the mark aria-hidden. The re-trued prose
   matches the served behavior.
6. **chrome is ambient — VERIFIED**: zero `chrome=` specimens on the page (grep clean); the
   overview documents the ambient resolution (control-integration context, frame | bare, not a
   prop); the bare STRIP re-verified live by attribute flip + 400ms settle: shell bg/border →
   transparent, well → none, button fill/borders → transparent (and `data-chrome` reverts to
   the Svelte-owned value after my probe — restored). svelte-check fails the family's
   `chrome: chromeProp` destructure (:169) — the not-a-prop receipt at the type level.
7. **Drift/structure — VERIFIED**: toc **8/8** served order==DOM (overview, live-demo, types,
   usage, theming, api, universal-props, accessibility; install/see-also out); h1 ×1; universal
   marker ×1; install/see-also markers present; axes table 8 measured rows served; 0 literal
   undefined/null text nodes; zero stale vocabulary in the served bytes.

## The four open questions — adjudicated

1. **Does the page copy teach the dashed-border fix right? YES.** The re-trued axes prose names
   the mechanism (the family's unlayered attribute carve-out, the atom-vs-atom cascade kill)
   and claims "re-measured dashed here" — which I re-measured TRUE (dashed + destructive token
   + wiring). The api error row describes the WIRING (aria-invalid/described-by), which was
   never broken — accurate as written.
2. **Should Props declare the ambient chrome axis? NO — with a drift triangle to clean up
   family-side.** Chrome resolves from the control-integration CONTEXT (getContext
   CONTROL_CHROME_KEY, defaulting frame); the design point is that the HOST decides chrome — a
   consumer prop would create a second voice competing with the ambient context. The current
   triangle: the META carries a chrome entry (opaque safety-net) that invites exactly the
   `chrome="bare"` attempt svelte-check then fails; Props doesn't declare it; the family's
   pull-out destructure (`chrome: chromeProp = undefined`, :169) costs a svelte-check error.
   Direction: drop/annotate the meta entry, type the destructure safely — family/registry lane.
3. **Hardcoded English stepper aria-labels — flag-level, YES.** aria-label="decrease"/"increase"
   are hardcoded (:310/:341); the page's a11y table DISCLOSES it verbatim ("Hardcoded English —
   a localization gap to know when translating"), consistent with the family's no-locale-layer
   contract. A label pair prop is the eventual family fix; the disclosure is honest. Not a
   defect.
4. **PlayRange undefined→min coercion on shared bindings — DEMO ARTIFACT, confirmed live.**
   Empty+Enter at the shared-binding demo seat leaves chip "value 1" (= min): the component
   sets undefined (spec-true), the PlayRange slider's end of the shared binding coerces
   undefined→min and writes 1 back. Not a component defect; the demo could decouple the slider
   or note the bounce. The api row's "undefined renders empty" remains true at the component.

## Findings (severity-tagged)

1. **[MINOR — api summary drift from the served table]** The api summary claims "the generated
   meta carries **22** entries (21 named props + the synthesized rest)" — measured **21**
   (brace-count: 20 named + rest). It also claims "the hand table serves the **8** consumer
   rows — density's row text is the family's ambient-scope vocabulary" — the SERVED hand table
   has **7** family rows: the `universal` directive FOLDS the density row (an axis name) into
   the shared section, whose density row is the generic §4 text — the family's ambient-override
   vocabulary is NOT served in the api. The popconfirm fold rule is satisfied (the axes table's
   measured density row is the richest row and IS served), but the summary describes the
   authored shape, not the served shape. Fix: correct the two numbers/shapes (or restore
   density's text via docs curation).
2. **[MINOR — stale family doc comments shipped through the same-source drawer]** The drawer
   serves number-input.svelte?raw verbatim, and its header comment still claims "**28px-wide**
   stepper buttons" (:7 — falsified by the measured full-hit squares 24–48px) and marks size
   AND color "**CONSUMED** by the family" (:103/:116 — contradicted by the page's measured
   zero-readers receipt; the parentheticals describe the §1 guard, not consumption). The page
   purged the vocabulary; the family comment didn't. Family-lane comment fix (behavior
   unaffected).
3. **[LOW — copy slip]** The universal canvas's fourth specimen is labeled "dense" but carries
   `density="large"` — identical to the labeled "large" specimen beside it (both measured
   48×48). Either the label or the rung is wrong.
4. **[INFO]** Duplicated density doc comment in the family (:97-98, the stale one-liner above
   the full one) — trivial, ride along with finding 2's comment pass.
5. **[NONE]** otherwise — no MAJOR on any dispatched claim.

## Gates

| Gate | Result |
|---|---|
| number-input family solos (defaults-form-families + density-adoption-form-text + form-components + list-item-control-chrome) + ambient | **352/352, exit 0** (ambient 284/284 included) |
| verify:docs-universal | GREEN **110/110** |
| svelte-check (fleet, 619 files) | **page 0 diagnostics**; family errors pre-existing (the file is unchanged in the tree — only its css and the page prose carry uncommitted edits); the :169 error IS the chrome-not-a-prop receipt |
| Raw SSR | toc 8/8 order==DOM; h1 1; markers present; 0 stale vocabulary; 0 undefined/null literals |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper → vite (PID 75355 + wrapper killed by PID);
  **port after: []**.
- **NO commits, NO pushes; zero product-tree edits.** The uncommitted number-input.css
  carve-out + page prose re-truing and the press-button page files belong to siblings —
  measured as served, never modified.
- Independence: vellum's report 32 not read; all receipts derived fresh. Discipline worked
  both directions — I caught MY OWN mid-transition read on the bare strip (oklab(0 0 0)
  artifact) and re-probed at settle (transparent), the same class as the theme-settled
  correction under review. LAW #14 is now a three-time winner on this family.
- Artifacts: /tmp/marginalia-36-probe{1,2,3}.mjs, /tmp/marginalia-36-ssr.html,
  /tmp/marginalia-36-{specs,scheck,dev}.log.
