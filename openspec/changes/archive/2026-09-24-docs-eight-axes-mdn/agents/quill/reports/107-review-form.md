# T107a — SECOND REVIEW form.html (quill)

**1st:** marginalia 87, PASS 0M/0m/0L/1N, Tier 1 (BOARD line 17). **2nd protocol:** her
report opened FIRST; landed fixes verified at served-DOM + source layers; her headline
receipts re-derived with my own instruments; fresh probe axes added. Target: the FAMILY HUB
`apps/www/src/routes/docs/components/form.html/` (scribe's CODE, legacy explicit-props W4).

## Verdict: PASS — page closes, Tier 1 confirmed (0 new findings)

## Landed items — verified

1. **The NIT digit (served DOM + source)**: the `--jx-text` TokenTable cell now reads
   **"10 / 11 / 12 / 13 / 15px"** (+page.svelte:322 source read; served cell read
   `=== '10 / 11 / 12 / 13 / 15px'` — PASS). The 2xs 10px voice she found served-and-omitted
   is now quoted.
2. **The :149 overload — gate ZERO**: full fleet svelte-check (fresh dist, HEAD da166454 ≥
   the 8254dd5c dispatch floor): **form.html + form.html/+page.ts: 0 diagnostics**. Her
   recorded single page diagnostic (:149, the Object.entries-undefined standing class) is
   closed.
3. **The archetype waiver still reads true**: the source header retains the self-demotion —
   "NOT a registry item itself — no prev/next, no inventory membership" (:8-9) — and the
   served hub carries no prev/next chrome; the Tier-1 hub classification stands on her
   original reasoning.

## Her headline receipts — re-derived, concordant

- **The density ladder, digit-exact**: five columns (2xs/xs/sm/default/lg, each
  `data-density` + `data-density-scope` + a `data-density-click-target` lane): voices
  **10/11/12/13/15px**, input heights **22/26/30/38/46px**, probe lanes **24/28/32/40/48px**
  (the --jx-hit scale) — all four sequences match her probe B exactly.
- **Authored-toc census**: rail anchors **all resolve** on the served DOM (no dead anchors;
  the legacy hub-group anchors included).
- **The focus contract**: label[for] census — **0 broken pairs**; every ladder input carries
  a wired id with a matching `label[for]` (her s15–s19 receipt re-derived by construction).

## Fresh probe axes (mine)

1. **The 14-card catalog census, exhaustive**: the three hub-group sections
   (#all-types/#select-textarea/#example-form) render exactly **14** OverviewCard links
   (8+3+3, the hero pill's count, now card-exhaustive rather than spot-checked) — and every
   one resolves **HEAD 200** (input, number-input, range, date-picker, color-picker,
   combobox, tags-input, file-input, native-select, select, textarea, checkbox, radio,
   toggle). Beyond the cards, **all 109** unique `/docs/components/` hrefs on the page
   resolve 200 (bad: []).
2. **Real-keyboard Tab walk**: focusing the first ladder input and pressing Tab ×5 walks
   native order through wired controls (no focus traps, no skips) — the a11y table's "native
   elements, native order" claim holds under a real keyboard pass, not just pair census.

## Gates (this batch's shared runs, seat-receipted here)

- svelte-check full fleet (from apps/www): form.html 0; **ui/input family 0 ERRORs**
  (8 standing `state_referenced_locally` warns — the fleet-wide W3-D3 class, unchanged).
- verify:docs-universal: GREEN 110/110 (run once this batch; see the close-out).
- Fresh build at HEAD da166454, exit 0 — the lint-gate dist floor 8254dd5c satisfied.
- verify:docs (this dist): sole red = **toast skeleton order — seat-attributed to scribe's
  in-flight T71, NOT adopted**; form.html passes the skeleton lint.

## Process

Port 5241 (batch-long seat): pre-check rc=1; served dev; probes
/tmp/t107a-form.mjs, /tmp/t107a2-form.mjs. NO commits, NO product-tree edits. Probe faults
owned: my first ladder census caught the page's other DensityDemo instances (rungs
duplicated across demos — the digits were right, the scope wrong; re-scoped to
data-density-scope+lane columns); the waiver text lives in the source header, not rendered
prose (checked where it actually reads); in-page fetch crashed the execution context —
page.request HEADs are the stable instrument.
