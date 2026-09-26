# Gate-1 r1 verdict — visual-g1 (Codex, gpt-5.6-terra xhigh), 2026-09-15

**NEEDS-WORK 5.8/10** (worked 52m 55s). Six blockers, three non-blocking
suggestions, one doc-consistency note. Verbatim blockers (condensed):

1. **W2 veil violates the subtraction ink law** — the "translucent tint
   derived from theme background" adds ink (design-tokens:169 forbids dark
   `background` in veils; backdrop-filter must SUBTRACT). Fix: filter/mask
   subtraction, or amend design-tokens with a bounded mermaid exception.
2. **W4 native sibling inherits custom-thumb ARIA/state machine** —
   native has no drawn thumb; role="scrollbar"/drag/keyboard on it is a
   contradiction. Split the kit: shared core vs hand-drawn-only
   interaction/a11y adapter; native mounts no custom ARIA. "AT-engaged"
   is undetectable — use testable focus/drag/hover pins + accessibility-
   tree persistence.
3. **W3 abspos overlay violates the grid-supplies-stacking law**
   (css-architecture:317) — use one-cell grid sibling + isolation at the
   list root, or declare the exemption explicitly.
4. **W1 observer watches class only** — `data-theme` flips would not
   live re-resolve; watch class AND data-theme; add attribute-flip probe.
5. **MODIFIED mermaid scenarios not byte-verbatim** — delta:202 vs
   living:2271 (nested `- AND` rewrite). Acceptance: paragraph diff zero
   for the six existing scenarios.
6. **W2 contrast acceptance has no object/algorithm/fixture/threshold**
   — fix all four; don't leave the number to the reviewer.

Delta/task notes: four ADDED requirements present (5/5/5/2 scenarios);
W4 additionally needs real clean-consumer shadcn-add cases for the two NEW
items (registry spec:108), not just registry.json entries. Non-blocking:
W5 should write the side×align mapping tables + reuse
scripts/verify-popover-area-align.mjs with a swapped-map negative control;
W3 should pin the geometry payload + add a line(i) residue canary + a real
JS-disabled floor screenshot; W5.2 should enumerate the exact css paths;
W5.3 needs a no-bump criterion; evidence should land in the change's
research/ dir.

## r2 response (this commit)

- B1: veil redesigned subtractive (blur + contrast/brightness chain, ZERO
  background ink; @supports floor = the component's own opaque theme
  ground, recorded as the surface-ground boundary) — design W2, delta
  mermaid intro + backdrop scenario.
- B2: kit split core/adapter/capability-styles; native mounts NO custom
  ARIA; "AT-engaged" replaced by four testable pins + tree persistence —
  design W4, delta scroll-area requirement + scenarios, tasks 4.1–4.4.
- B3: spine = `grid-area: 1/1` sibling in the one-cell host, source order
  under items, `isolation: isolate` at the list root; the two standing
  abspos exemptions RETIRE (recorded) — design W3, delta timeline
  requirement, tasks 3.1/3.2.
- B4: scope observer `attributeFilter: ['class','data-theme']`; flip
  scenario covers both mutation kinds — delta W1 requirement + scenario,
  tasks 1.1/1.2/1.3.
- B5: six existing spliced from the living spec programmatically and
  byte-verified equal (script-checked True/True/True) — delta mermaid
  MODIFIED block.
- B6: fixed acceptance — WCAG ratio; labels ≥ 4.5:1 vs node fill,
  graphics ≥ 3:1 vs adjacent veil ground; fixture = dark-pinned demo on
  light page, pinned Chromium 2× sampling; any pair below threshold
  fails; constants calibrate, thresholds do not move — design W2, delta
  backdrop scenario, tasks 2.2.
- Clean-consumer proof for both new items (component case + lib install
  lane) added to design W4 / tasks 4.4 / proposal Impact.
- Non-blocking adopted: mapping-table law + verify-popover-area-align.mjs
  reuse with swapped-map negative control (design/tasks 5.1); geometry
  payload contract + line(i) canary + real JS-disabled screenshot
  (design W3, tasks 3.1/3.3/3.4); enumerated eight css paths (design W5,
  tasks 5.2); no-bump criterion with input-diff + byte-identical
  manifest proof (design W5, tasks 5.3); evidence receipts copied to
  research/evidence/ (9 screenshots + the timeline probe).
