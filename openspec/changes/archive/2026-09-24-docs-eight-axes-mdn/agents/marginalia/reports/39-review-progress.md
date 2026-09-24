# TASK 39 — REVIEW progress (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (1st reviewer; reviewer #2 after — independence law held: vellum's
  report 34 NOT read; every receipt derived from the page + family source + live probes)
- **Target**: vellum's page integrated at `8a25571b` — `progress.html/+page.svelte` (351 lines)
  + `+page.ts` (9-entry toc) + the family (svelte 161 / stylex / css). Zero drift since
  integration (diff 8a25571b..HEAD on progress paths is empty); the tree's uncommitted set
  (prototype-grid, sheet, agents' experience files) belongs to siblings — untouched.
- **Method**: source reads (page, family svelte/css/stylex), the PIXEL instrument (clip
  screenshots decoded through an in-page canvas, fill-edge column tracing, a burst trace at
  ~9 frames per jump, and a 3s-transition discriminator injection), real `.dark` island
  injection with restore, CDP Accessibility tree for the native mapping, computed clocks,
  SSR parse + meta count, family solos + ambient + docs-universal + fleet svelte-check.
- **VERDICT: NEEDS-WORK** — one MAJOR: the page's titular measured claim (the determinate fill
  is "inert in Chromium", jumping within the first frame) is FALSIFIED by pixels on this
  environment. The burst trace catches a real ~150-200ms fill tween in normal AND reduced
  modes, and a 3s-transition discriminator proves the css channel on the pseudo is live. Six
  of the seven dispatched claims verify TRUE (below); the re-author of the two-clocks story is
  the work this closure needs.

## THE MAJOR — the "inert fill" receipt is an instrument artifact

The page teaches (overview ¶2, motion axis row, a11y row, receipts note) that the determinate
fill's authored `transition: width 200ms cubic-bezier(0.22, 1, 0.36, 1)` (progress.css :22-23)
is **inert**: "Chromium does not transition engine-managed pseudo widths — measured, the fill
edge jumps 10% → 87% within the first frame in normal AND reduced modes".

**Pixel falsification** (burst trace — 9 clip screenshots after setting value 0.10 → 0.87,
each decoded and scanned for the fill-color boundary; engagement = the fill's own green):

- NORMAL: edge **0.558 at ~75ms, 0.85 at ~152ms, settling 0.866** — a real decelerating tween
  matching the authored 200ms cubic-bezier envelope. NOT a first-frame jump.
- REDUCED (`prefers-reduced-motion: reduce`, verified live — the stripe sweep slowed to 4s
  under the same emulation): edge **0.556 at ~49ms, 0.808 at ~98ms, settling ~0.866** — the
  tween PERSISTS despite the css kill.
- **The 3s discriminator**: injecting `.jx-progress-bar::-webkit-progress-value { transition:
  width 3s linear !important }` stretches the tween to ~3s linear (0.362 @ 182ms → 0.52 @
  1021ms). **The css transition channel on the pseudo is LIVE** — the authored rule is a real,
  working transition, not dead code.

Reading of the composite evidence: the authored 200ms governs the normal-mode envelope; a
further engine-side smoothing (~150-200ms, css-independent) explains the tween persisting under
reduced-motion, where the kill (unlayered `:where(...)` — it wins the cascade) removes the css
transition yet the visible motion remains. Either way, BOTH halves of the page's claim fail:
the fill does not jump within the first frame, and the reduced-motion kill does not stop the
visible fill motion. The a11y row's "the inert fill transition is killed outright" is likewise
falsified — a reduced-motion user still sees the fill animate. Her instrument lesson ("pixels,
not computed styles") was right, and the fuller pixel truth is the second chapter: a SINGLE
capture taken ≥200ms after the set sees two settled bars and reads "inert" — the burst trace
is the honest instrument, and its first frames are the receipt.

**Work required (family + page)**: re-author the two-clocks story around the measured truth —
two LIVE clocks (the 0.9s stripe sweep; the ~200ms fill tween) + a reduced-motion caveat (the
fill's visible motion survives the kill; css cannot suppress the engine's smoothing) — across
overview ¶2, the motion row, the a11y row, and the receipts note. Her open question 1 (drop the
200ms vs re-author a div fill) is MOOT: the rule is neither dead nor droppable — it works.

## The claims — verified TRUE

1. *(the indeterminate half)* **The sweep clock — VERIFIED**: computed `animation: 0.9s linear
   infinite` (name jx-progress-run, tile 24px), slowing to **4s under reduced-motion** (both
   measured). The determinate half is the MAJOR above.
2. **The frozen-ink seam, third instance — VERIFIED, and the page is HONEST.** Under a real
   `.dark` island (injected, settled, restored): the `--primary` chain re-derives
   **oklch(0.6489 0.237 133) → oklch(0.7044 0.1872 calc(133 − 4))** (the fill's legacy chain is
   live), while the **track stays oklch(0.9551 0 0)**, the **1px frame oklch(0 0 0)**, the
   **label ink oklch(0.3211 0 0)** — the exact frozen literal the row quotes — and the **value
   ink oklch(0 0 0)**, all on both sides. The page NAMES the seam ("THE FROZEN-INK SEAM, THIRD
   INSTANCE") and enumerates every frozen atom — model honesty.
3. **Density paint-invariance — VERIFIED**: bar height **10px at every rung including the 2xs
   stamp** (the fixed-unit equation), readout voice **12px constant** — five rungs measured.
4. **Radius seam — VERIFIED**: ambient **4px**; `--progress-radius: 9px` stamped on the live
   node → **9px**; restored → 4px. Axis unread (grep receipt re-run clean).
5. **Native a11y — VERIFIED**: implicit progressbar; the indeterminate element has **no value
   attribute** and exposes **value: null** in the CDP AX tree (the platform omits valuenow —
   the substance of "position −1"); **value 100 at max 250 exposes AX value 100** (position
   0.4 read off the element); the readout is **role="status" with text "42%"**; the generic
   `aria-label={label ?? 'progress'}` fallback is in the family (:155) and the anchoring note
   is documented (every served specimen carries a real label — the fallback appears zero times
   in the SSR).
6. **Grep receipts — VERIFIED**: zero readers of the six axis carriers in ui/progress/
   (re-grepped clean); five supply-only rows + the radius seam, exactly as tabulated.
7. **Chrome — VERIFIED**: toc **9/9** served order==DOM (overview, live-demo, progress-base,
   types, usage, theming, api, universal-props, accessibility; install/see-also out); h1 ×1;
   universal marker ×1; install/see-also markers present; 0 literal undefined/null text nodes.

## Her four open questions — adjudicated

1. **The inert 200ms declaration — MOOT, reframed by the pixels**: the rule is live (the 3s
   discriminator proves the channel), so nothing to drop and nothing to re-author. The real
   family decision the pixels surface: the reduced-motion gap — the visible fill tween
   survives the kill (engine-side smoothing is css-unreachable). Document the limit; if
   suppression is wanted, it needs a real re-author (a div fill the css actually controls).
2. **The seam atom set joining W-next #7 — YES.** Measured frozen voices: track (--jx-muted →
   oklch(0.9551 0 0)), frame (--jx-border → oklch(0 0 0)), label (--jx-muted-foreground →
   0.3211), value (--jx-foreground → 0 0 0) — all light literals under dark, beside the live
   --primary fill chain. The family fix should enumerate progress's four frozen voices with the
   menubar/number-input/press-button set.
3. **The generic "progress" fallback — guidance is enough.** The anchoring note ("pass a label
   when several bars share a page") is documented and the need is real (this page alone serves
   five same-named "sync" bars); a scope-unique-label law would be prop churn over a disclosed
   fallback.
4. **--progress-radius promotion — YES, low urgency.** The seam is consumer-overridable
   (measured 4→9→4) and already TokenTable'd here; adding it to the global tokens inventory at
   the next tokens-page touch is cheap discoverability.

## Other findings (severity-tagged)

1. **[LOW — api arithmetic]** The summary claims "the generated meta carries 12 entries (11
   named + the synthesized rest)" — the meta stores **12 named entries** (value, max, label, 8
   axes, class) and **no rest key**; the component is rest-less (undeclared attributes are
   dropped — nothing spreads onto the element). The trailing clause "the rest of the element's
   attributes ride through natively" conflates the native element's semantics with component
   attribute forwarding — reword both.
2. **[INFO — leftover probe route]** `src/routes/probe-timeline-progress/+page.svelte` carries
   a svelte-check diagnostic — looks like an integration-probe route that survived in the tree.
   Orchestrator: sweep candidate.
3. **[INFO — pre-existing debt, unchanged files]** family :61/:153 Object.entries overload
   errors + :123 8× state_referenced_locally warns (fleet pattern); scenes/progress ×1.
   Page: **0 diagnostics**.
4. **[NONE]** on the remaining dispatched claims.

## Gates

| Gate | Result |
|---|---|
| progress-adjacent solos (batch2-components + defaults-overlays) + ambient | **319/321, exit 1** — the 2 failures are exactly `sheet\|1\|variant\|1`, **quill's in-flight sheet.html CODE** (uncommitted in the tree, solo-reproduced, keyed to their file) — sibling noise per protocol |
| verify:docs-universal | GREEN **110/110** |
| svelte-check (fleet, 614 files) | **page 0 diagnostics**; family/scene debt pre-existing (unchanged files) |
| Raw SSR | toc 9/9 order==DOM; h1 1; markers present; 0 undefined/null literals |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper → vite (PID 30972 + wrapper killed by PID);
  **port after: []**.
- **NO commits, NO pushes; zero product-tree edits.** The `.dark` island, the radius stamp and
  the 3s style injection were live-DOM probes, all restored; sibling files untouched.
- Independence: vellum's report 34 not read. Instrument honesty on my side too: three probe
  faults were caught and fixed before any conclusion (a closure bug, a scan that flagged the
  1px frame, and my own press-then-read hover collapse last task) — the MAJOR above survived a
  3s discriminator designed to FALSIFY it, which is the standard a titular claim should meet.
- Artifacts: /tmp/marginalia-39-probe{1,2,3}.mjs, /tmp/marginalia-39-ssr.html,
  /tmp/marginalia-39-{specs,scheck,dev}.log.
