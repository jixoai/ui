# T107c — SECOND REVIEW math-block.html (quill)

**1st:** marginalia 89, PASS 0M/2m/0L/0N, Tier 1 (BOARD line 19). **2nd protocol:** her
report opened FIRST; landed fixes verified at served-DOM + source + mirror layers; headline
receipts re-derived with my own instruments; fresh probe axis added. Target:
`apps/www/src/routes/docs/components/math-block.html/` (scribe's CODE, legacy
explicit-props W4) over the math-block family riding the shared scroll-run contract.

## Verdict: PASS — page closes, Tier 1 confirmed (0 new findings)

## The two MINORs' landed state — verified

Her report labels MINOR 1 explicitly (the scroll run not keyboard-focusable, falsifying the
a11y table's Tab row); the verdict's second MINOR is the falsified row itself — and BOTH
close with the one landed fix:

1. **The fix landed in the SHARED contract, not a family copy** (the right home):
   `scroll-run.svelte.ts:233-234` — `state === 'none'` → `removeAttribute('tabindex')`;
   otherwise `setAttribute('tabindex', '0')`. Landed at c6ba1f1f ("the scroll run joins
   the tab order at the verdict (marginalia 89)"). Mirrors: scroll-run 2/2 IDENTICAL,
   math-block 4/4 + index IDENTICAL (registry ⇄ apps/www).
2. **Served DOM census (10 runs)**: every overflowing run carries `tabindex="0"` and paints
   `start-closed`; every fitting run paints `none` with NO tabindex — the attribute tracks
   the verdict exactly, per the contract's arming point.
3. **The a11y rows (:389-390) now measure TRUE under my own drive**: a REAL Tab walk (focus
   the preceding focusable, one Tab) lands ON the armed strip — her 1st-review measured
   "never reaches the run in six presses"; now ONE press. And `ArrowRight` scrolls the
   focused strip (scrollLeft advanced) — the "← / → — Scroll the focused strip when the
   verdict is open" row is true end-to-end, keyboard focus through scroll, WCAG 2.1.1
   closed.

## Her headline receipts — re-derived, concordant

- **Katex duality**: hydrated paint carries real `.katex` markup + hidden `.katex-mathml`
  across the page, with the error seat present; the workbench live-drive re-derives in
  place (below).
- **The verdict machine** (workbench selects, real selectOption): euler fits (`none`,
  not over) → system overflows (`start-closed`, over) → **fit=on kills the overflow and the
  verdict re-measures to `none`** — her exact sequence, my own drive.
- **The error seat**: `.katex-error` renders the raw source painted in
  **oklch(0.6 0.2 25)** with the console warn **"[jixoai/math-block] KaTeX parse error
  (painted in place): ParseError…"** — both halves verbatim.
- **The family's own gate**: `npm run verify:km -- --url http://localhost:5241` → GREEN,
  **9 assertions** (mermaid render + engine-chrome leaks + the strip verdict read
  none/none/start-closed/none/none — matching my census exactly). Run against MY server,
  not the stale :5199 default her report flagged.

## FRESH AXIS — the verdict follows the VIEWPORT with no prop change

Her drive moved the verdict through selects/fit; mine moves it through geometry:
`system` armed at **1920px** paints `none` (fits) → resize **1440px** paints
`start-closed` (overflows) → resize back **1920px** paints `none` — settled reads, no
select touched between reads. The single-truth claim extends from the fit toggle to live
viewport re-measure. (Probe honesty: two earlier "contradictory" reads — `none` stamped
against `over:true` geometry — were my sampler catching the scaffold's width transition
mid-flight; settled re-reads resolved them. Instrument artifact, not the page's.)

## Gates (batch-shared runs, seat-receipted)

- svelte-check full fleet: math-block.html + +page.ts **0 diagnostics**; ui/math-block
  family **4 ERRORs — exactly her recorded standing count, unchanged** (pre-existing;
  her review fixed nothing in the family, correctly). NEW INFORMATION adjacent to the
  landed fix: **ui/scroll-run carries 3 ERRORs** — scroll-chrome.svelte :70 the
  Object.entries-undefined cx class (a SIXTH seat not among f92d6555's five closed
  families) + :232/:241 `blurLevels` union-narrowing errors. All pre-existing (last
  family touches predate this batch), none from the tabindex landing — receipted for the
  fleet consolidation lull, not chased.
- verify:km GREEN 9/9 (above).
- verify:docs-universal GREEN 110/110; verify:docs sole red = toast (seat-attributed to
  scribe's T71, NOT adopted); math-block clean.

## Process

Port 5241 (batch seat; one documented restart during the icon fresh-axis). Probes
/tmp/t107c-math.mjs … t107c7-math.mjs. NO commits, NO product-tree edits. Probe faults
owned: my first workbench read used the page's LAST run (`at(-1)` — the universal-props
demo) instead of the workbench run — re-scoped to `#math-block-workbench
[data-jx-scroll-run]`; the live-resize leg's first pass caught transition-midflight
geometry (settled polls are the honest instrument); one dev reload destroyed an execution
context mid-probe (guard + fresh-load fallback legs).
