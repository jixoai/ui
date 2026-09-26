# TASK 90 — FIRST REVIEW native-select.html (marginalia, 2026-09-23)

- **Reviewer**: marginalia (1st review; scribe's CODE, legacy explicit-props W3 batch A
  at 6bb88ae0, no CODE report — owner-checked I did not code it. No other
  native-select review exists; no concordance addendum applies. All findings derived
  from my own source reads + probes).
- **Target**: `apps/www/src/routes/docs/components/native-select.html/` (+page.svelte
  638 lines, toc 9) over the native-select family (svelte 186 / stylex 46 / defaults
  38) — the native-first `<select>` (appearance-none closed control, platform popup),
  served live on :5244.
- **VERDICT: PASS — MAJOR x0 / MINOR x2 / LOW x0 / NIT x0.** **Tier proposal: Tier 1**
  — the toc is clean (9/9 with universal-props IN the rail), every measurable claim
  reproduces, and the two findings are a site-layer color-scheme gap and a gate-seed
  gap; no page rebuild owed.
- **Gates (this page's family-specific set)**: ambient **284/284** · universal
  **110/110** · **verify:parity — rc=1, 5 failures (seat-attributed below, no
  baseline)** · svelte-check **1 page diagnostic** (the standing class) · verify:docs
  **RED seat = toast** (the recorded red; native-select passes the skeleton lint).

## MINOR 1 — "color-scheme follows the site theme" is falsified: the site's theme sync stamps `color-scheme: light` INLINE and never updates it in dark

The family header (:13-14) and the page's story teach that the native popup's
color-scheme follows the site theme. The two-read across the chain: light — html
`light` (an **inline style on `<html>`: `color-scheme: light; --jx-scrollbar-thin:
0px; …`**, set by the theme sync), body/field/select all inherit `light`. Root dark
(html class "js dark"): **every link in the chain still reads `light`** — the sync
flips the class but never updates the inline `color-scheme`. Verified on the UNSTAGED
select (s12, outside any stage pin) — this is not the HOST-stratum pin; the staged
demo also holds light (correctly, per its pin). Consequence: **native popups render
light-scheme chrome while the site is dark**. The fix is site-layer (the theme sync
must flip the inline color-scheme with the class), not the family's — the page's
claim describes intended behavior the served site doesn't deliver. Seat: family
header :13-14 + the served `<html style>`; the CSSOM carries 19 color-scheme-bearing
rules but none re-declares the property for `.dark`.

## MINOR 2 — verify:parity is red with 4 native-select DOM-isomorphism failures (no baseline; seat-attributed)

`node scripts/verify-native-parity.mjs 5244` (the gate takes a bare PORT): rc=1 —
**5 failures across 251 comparisons + 20 DOM-AST assertions**: 4 ×
"native-select select ⇄ tier1 select (base/focused, ambient/@lg):
DOM isomorphism failure — tier0 class=(absent) where tier1 class=x19aimcq xuwbqqx at
path root", plus 1 × input focused-border-color (tier0 oklch(0 0 0) vs tier1
oklch(0.6489 0.237 296) — the brand-hue wall-clock vs the native black). Seat:
the harness's DOM-isomorphism assertion expects CLASS parity at the root path while
the component's select necessarily carries its stylex shell classes — a
harness-expectation vs composition mismatch for the family owner (or the harness
needs a class-allowlist for painted families). First audit: no prior baseline to
compare; the failures are consistent across base/focused and ambient/@lg.

## The claims — verified digit-exact

- **The closed-control paint**: `appearance: none` computed on the select ✓; the
  chevron **paints as the select's own background-image** — an inline-SVG data-URI
  (`.jx-html-select { --jx-icon-chevron-svg: url("data:image/svg+xml,…") }` in the
  served CSSOM; the select's computed backgroundImage is that URL). The header's
  "inline SVG chevron" wording is loose (it is a background-image data-URI, not a DOM
  svg — my first two walks found no DOM svg and nearly filed a missing-chevron
  finding; the select's own background-image read is the honest one).
- **The density ladder**: served rungs — default **13px/46px**, xs **11px/34px**,
  sm **12px/36px**, lg **15px/58px** — the voices match the form page's
  10/11/12/13/15 receipt (2xs not hosted here); the heights are the select's own
  geometry (taller than inputs by the chevron gutter — consistent with the
  native-first split).
- **The multiple list-box posture**: the `size={3}` seat renders **92px** (~3 rows);
  the unsized multiple seat also **92px** (the family's "about three visible rows"
  default ✓); **no chevron renders on either multiple seat** (the :has law — my
  corrected walk finds no svg in either field, so the disappearance is moot as
  served: neither shows a DOM chevron, the single's chevron lives in the
  background-image).
- **The error contract**: aria-invalid **true**, aria-describedby → **s12-error**
  rendering **"!plan is required"**, shell **border-style: dashed**, the line
  monochrome oklch(0 0 0) — "the one-hue law has no error red" ✓.
- **FormData parity**: selecting "free" → `new FormData(form).get("plan")` returns
  **"free"** — the real name/value pair ✓.
- **The keyboard contract (real keys, this engine — Chrome)**: typeahead on the
  closed control works (**"f" → "free"**); ArrowDown does NOT change the closed
  value (it opens the platform popup — **platform contract**, quoted as contract:
  the popup internals are not DOM-measurable). Selection via
  `selectOption` (protocol) flips the value and the FormData pair ✓.
- **The scroll-run tabindex regression check (the T89 fix, live)**: the page hosts
  **five scroll runs — every one start-closed (overflow true) WITH tabindex="0"
  armed (IDL 0)** — the T89 fix arms correctly family-wide; no none-verdict run
  exists here to check the unarmed half.

## Standard battery

- **SSR**: 1,100,431 bytes; h1 ×1; universal marker present; 0 undefined literals;
  zero `jxoai`.
- **Warm-reload (strip-style)**: raw fetches differ; stripped of the dev-assembled
  style block, **byte-identical** — the dev-CSS order artifact, fifth consecutive
  page.
- **EXTRA-lane**: PropsTable serves the declared surface (label required, corner…
  correction: corner is float-button's — here: density, label, children, class + the
  eight axes); attribute-transparent via `{...rest}` (:179) — name/disabled/required/
  multiple/size measured riding through.
- **LAW #18**: no repeated-row each (the options are snippet children) — empty keyed
  surface by construction.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| svelte-check (fleet) | **native-select.html: 1 diagnostic** (:286, the standing Object.entries-undefined class — recorded, not chased). Family lane, pre-existing: 2 ERRORs |
| **verify:parity (port 5244)** | **rc=1 — 5 failures / 251 comparisons + 20 DOM-AST assertions**: 4 × native-select DOM-isomorphism class-at-root (harness expectation vs composition — seat-attributed to the family/harness contract, no baseline this first audit) + 1 × input focused-border hue. Checkbox/radio/toggle pixel shots PASS (toggle dimensions warn-only, known gap) |
| verify:docs (dist c6ba1f1f) | **RED — seat = toast** (the recorded red), **native-select passes the skeleton lint** |

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 72900; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits** (git status clean in scope).
- DOM injections (root dark, the select value) reverted in-probe; real keys for the
  keyboard contract; protocol selectOption for the value-drive receipt.
- Instrument honesty: (1) my chevron walk looked for a DOM svg and found none — the
  chevron paints as the SELECT's background-image data-URI (the header's "inline SVG"
  wording is loose); the finding I nearly filed was wrong and the paint read is the
  receipt; (2) my first color-scheme read keyed the STAGED select — the HOST pin
  explained it; the UNSTAGED re-read under root dark is the finding; (3) the parity
  gate takes a BARE PORT (`verify-native-parity.mjs 5244`), not `--url` — my first
  two runs mis-argued it.
- Artifacts: /tmp/marginalia-90-probe{1,2,3,4,5}.mjs, /tmp/marginalia-90-ssr{1,2}.html,
  /tmp/marginalia-90-{dev,wrapper,listener,ambient,universal,parity,parity2,parity3,scheck,docs}.*.

## Open questions

1. **The site's inline color-scheme** (MINOR 1): the theme sync stamps
   `color-scheme: light` on `<html>` and never flips it — site-layer fix; every
   native control family (select/textarea/input popups, scrollbars) inherits the gap.
2. **The parity harness's class-isomorphism assertion** (MINOR 2): composition
   families necessarily carry shell classes the native control lacks — the harness
   needs a class allowlist (or scoped comparison) or the families a class-stripped
   tier0; the owner's call, now measured.
3. **The toggle dimensions warn** (40×20 vs 41×20, warn-only in the parity shots) —
   pre-existing known gap, unchanged.
