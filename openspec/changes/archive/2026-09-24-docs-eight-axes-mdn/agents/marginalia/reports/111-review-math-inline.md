# T111 — math-inline (docs page) — 1st eight-axes review (marginalia)

**VERDICT: PASS — 0 MAJOR / 0 MINOR / 1 LOW / 1 NIT — Tier 2 proposed**

Owner = scribe; 1st review (vellum holds the 2nd). Independence: my own reads
+ probes. Page:
`apps/www/src/routes/docs/components/math-inline.html/+page.svelte` (297
lines). Family read in full: `math-inline.svelte` (151),
`math-inline-defaults.svelte.ts` (39), `index.ts` (5) + the facade contract
(`$lib/katex.ts`: output htmlAndMathml, throwOnError false, registerMacros
module table). No css file on either side (the folder-css law: none needed) —
**registry twins byte-checked: all 4 files cmp-identical**.

Process: port 5244 mine (killed at end — lsof post_rc=1, no orphans). Probes
/tmp/marginalia-111-probe1/2/3.mjs + probe3b.mjs. Dist 9f70476b. No fixes.

---

## 1. Verified TRUE with digits

- **The sync lane**: typing an unclosed group (`{`) into the workbench
  paints the error run IN PLACE — `.katex-error` appears with the raw
  source text and katex's red (oklch(0.6 0.2 25)); filling the identity
  back restores `.katex-html` synchronously (probe2 MI_ERROR_RUN +
  MI_RECOVER). `throwOnError: false` is the facade default (katex.ts :88)
  and the component catches escaped-throw fallbacks (source :124-131).
- **role="math" + the hidden MathML + no aria-label**: 5 live spans, ALL
  `role="math"`, ZERO aria-labels, each carrying one `.katex-mathml`
  (the screen-reader tree) + one `.katex-html` — `output: 'htmlAndMathml'`
  (facade :87) exactly as the a11y table states. "Consumer aria-* rides
  rest and wins its own fields": rest spreads BEFORE the component's
  data-jx-math-inline/role stamps (source :142-146) ✓.
- **"The span carries nothing but the formula output"**: the span's only
  child is the katex wrapper SPAN (childTags census) ✓.
- **macros/strict/trust passthrough + the registerMacros merge** (facade
  :61-72, component :126) ✓ source; `data-jx-math-inline` hook ✓;
  data-density absent at auto ✓; all-no-own defaults (8 no-own slots) ✓.
- **Zero-re-render architecture**: across a theme toggle the lane's
  katex-html innerHTML length is byte-identical (3343 → 3343) — the
  "color-scheme change, not a re-derive" claim's mechanism holds.
- **LAW #18/#19**: no `{#each}` on page or component; no DensityDemo; no
  duplicate ids.
- **Rendered API tables: [6, 8]** — tex*/macros/strict/trust/class/…rest +
  the universal fold's axis rows (the `universal` attr is present here).
  "Five props plus the HTML rest" ✓ (tex, macros, strict, trust, class).

## 2. Findings

**LOW-1 — the toc's order contradicts the page's own stated skeleton.**
The page comment (:154-155): "the demo-standard skeleton: Install then
Usage sit ABOVE the demos — Intro → Install → Usage → Examples → API → See
Also" — and the DOM agrees (usage at :160, before the workbench :173 and
the lane :206). The authored toc (+page.ts) renders the rail as workbench →
lane → **usage** → …, putting Usage third in the rail while it is first in
the content. All six ids exist (no dead anchors — the grid page's dead-link
class does not recur); this is order-only drift, but it drifts against the
page's own declared skeleton. Fix shape: move usage up in the toc array
(or the section down in the DOM — one of the two orders should win).

**NIT-1 — "Flip the site theme" has no discoverable real path on this
page.** The lane copy (:225) invites flipping the site theme to watch the
formulas invert; no site-level theme toggle is reachable from this page
(the dock's toggle governs the canvas stage only, and flipping it left the
lane unchanged). The claim's MECHANISM is receipted — the katex output
inherits the prose color exactly (demo paragraph and `.katex` both
oklch(0 0 0), `inherits: true`) and nothing re-renders — so any theme
change that moves the prose color moves the formula for free. Noted as a
receipt-scope limit, not a falsehood: the inversion is architectural
(inheritance), just not demonstrable through a control this page ships.

## 3. Probe-fault ownership (mine, and it matters)

- Probe1's "currentColor fails — prose accent vs black katex" reading was
  MY selector bug: `lane.querySelector('p')` grabbed the section-HEADER's
  label paragraph (eyebrow accent ink), not the demo paragraph. Probe3b
  re-read via `katex.closest('p')`: paragraph and formula both
  oklch(0 0 0), inherits true. The claim was never false.
- The math-inline page needed ~4 extra loads across probes (Vite
  dep-optimization reloads + first-compile latency killed networkidle and
  even a mid-probe execution context). Final instrument: `waitUntil:
  'load'` + an IN-PAGE poll for `p .katex` (single evaluate, no node-side
  racing). Recorded for the next math/katex-adjacent review.

## 4. Sibling-differential (dispatch)

math-block (T89) owns the display figure; math-inline owns the sentence —
the page teaches the seam exactly once ("Display math owns its figure;
inline math rides the sentence", :212) and never re-explains the block
lane. No contradiction observed from this side.

## 5. Gate record (batch-wide, once)

- ambient solo: 284/284, rc=0. docs-universal: GREEN 110/110, rc=0.
- svelte-check: math-inline page 1 error (:113 cx clone — the page carries
  one, so it is a page finding by the standing rule); the COMPONENT is
  clean (it joins through `cn`, no local cx — the family needed no twin
  fix). Filed above as part of the batch's joiner census (LOW, this page's
  seat :113).
- `npm run verify:docs` (dist 9f70476b) → rc=0 GREEN (the toast red is gone
  — the scribe's T71 landed); staged scope green.
- Server killed: lsof :5244 empty (post_rc=1), no orphans.
