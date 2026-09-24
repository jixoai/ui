# Report 21 — image, REVIEW (1st, marginalia)

agent: marginalia · 2026-09-22 · route
`apps/www/src/routes/docs/components/image.html/` (+page.ts; hand
PropsTable with the bare `universal` directive — no curation/meta by
design, drift #9) · coder quill (integrated 7105f2ea) · law: mdn-doc-style
§5+§6, emission-form / THEME-SPLIT frozen pole, PROBE-READINESS (lazy
failure states), §1 native collision, carriers bijection · reviewer #2:
scribe (after — independence held; scribe's review not read at filing
time). Every verdict re-derived from source, raw SSR bytes, or live probes
on :5244.

## Verdict: NEEDS-WORK

**0 BLOCKER · 1 MAJOR · 1 NIT · 0 MINOR.** The frozen pole is the purest
case and verifies byte-for-byte; the size inertness, merge law, carriers-
bijection decision and leaf greps all hold exactly. But the page's ONE
query() case promises a stamp movement the demo cannot show — the demo's
composed-fallback snippet removes the very panel whose `data-density` the
caption says moves.

## Findings

1. **MAJOR — the query case's stamp claim is false as served: the demo's
   composed-fallback snippet removes the panel the caption says stamps.**
   The page prose (:450-451): "at 48rem and wider the md case wins and the
   failure surface stamps sm (**the data-density on the broken panel moves
   in the raw bytes**)"; the demo's own slot text repeats it ("the sm rung
   stamps at 48rem+"). But the demo Image provides a **fallback snippet**
   (:441-445), and the snippet branch renders the consumer's markup ONLY —
   `{#if failed && fallback}{@render fallback()}` (image.svelte:153-154):
   no `data-jx-image-broken` panel exists, so there is **no
   data-density anywhere** on the failure surface. Measured at both
   viewports: 1280px (≥48rem) → density **null**; 600px → **null**; back →
   **null**. The two-generic FORM is fine and the lane genuinely resolves
   (it would read sm ↔ lg), but in this demo the promised raw-byte movement
   is unobservable — nothing on the page moves across the breakpoint. Fix
   (one of): (a) drop the `fallback` snippet from the query demo — the
   default frame's broken panel carries `data-density` (image.svelte:165)
   and flips sm ↔ lg exactly as captioned; or (b) keep the snippet and
   reword to the truth ("with a composed fallback the stamp has no panel
   to land on — the lane moves through the context supply only; the
   default frame's panel is what stamps").
2. **NIT — the axes code sample's paths differ from the stage it claims to
   run.** The section comment says "code shown = code running" (:70) and
   the axesUsage sample shows `src="/missing.png"` (:75), but the stage's
   probe panels load `/definitely-missing.png` (:402/:406) — and this
   axes canvas is a hand file, not resolveRawCode (no disclosure, unlike
   the composition demo's precedent on other pages). Align the path and
   add the one-line hand-file disclosure.

## Verified-TRUE receipts (all my own probes/current tree)

- **Carriers-bijection decision (drift #9) — verified as designed.**
  'image' is ABSENT from docs-ambient-vocabulary's `expectedCarriers`
  bijection set (:355) and the matrix fixture; no `image.meta.ts` exists;
  the hand PropsTable carries the bare `universal` directive and renders
  the exact marker the gate counts — `data-jx-props-table-universal` ×1
  in the served page (docs-universal GREEN 110/110 re-run on this tree).
  The hand table is honest: 9 rows (alt*, width*, height*, src, fallback,
  onerror, class, style, ...rest) matching the real interface
  (Omit&lt;HTMLImgAttributes, 'alt'|'width'|'height'|'color'&gt; — the §1
  collision rule in the interface itself), no invented meta, no axis-named
  family props; the universal section still renders its 8 axis rows from
  the shared schema (served table[1]).
- **The frozen pole's purest case — byte-identical, third substitution-
  site proof.** PROBE-READINESS applied (every broken image scrolled into
  view; swaps awaited before reads): light vs theme="dark" broken panels
  compute **bg oklch(0.9551 0 0) · border oklch(0 0 0) · ink
  oklch(0.3211 0 0) · padding 24px — byte-identical (true)**, while on the
  dark island the panel's raw `--muted` **flips oklch(0.9551 0 0) →
  oklch(0.2178 0 0)** and `--jx-muted` stays **oklch(0.9551 0 0)** in
  both. The atoms (image.stylex.ts `broken`) read only typed intermediates
  (--jx-hairline/--jx-border/--jx-muted/--jx-muted-foreground/--jx-space-24)
  — zero raw-var voices, exactly the emission-form class.
- **Size measured inert.** size={14} img: computed font-size **exactly
  14px** (style attr `--jx-size-effective: 14px; font-size:
  var(--jx-size-effective, 1rem)`), control auto img **16px**; both boxes
  **96×96** (the width/height attributes' own) — pixels have no em voice.
- **Merge law receipt.** Broken panel style attr served/measured =
  `width: 96px; height: 96px;` (the literals); stamping a carrier live
  joins it: `width: 96px; height: 96px; --jx-radius-effective: 16px;` —
  the axis surface survives failure, carriers and literals in ONE attr.
- **Density row honesty**: padding measured 24px fixed — the atom reads
  `--jx-space-24` (kernel geometry), NOT the density channels ✓; the row's
  "supply-only on self, supplied to the slot" split matches the source
  (densityRungOf stamps root/panel; provideUniversalLanes supplies).
- **Leaf both directions (shape-agnostic)**: ui/image/ imports = svelte
  types, Icon, cn, defaults, stylex — the only FAMILY import is the Icon;
  the only production mounter is `lib/blueprints/scenes/image.svelte` (a
  demo scene). Zero -effective/kernel-channel/raw-token reads in ui/image/
  (all greps 0).
- **Standard**: toc **7/7** ×1 in DOM order, see-also out of the toc per
  the ruling (DocsSeeAlso renders); `add image` ×4; tier 2 justified (old
  page 156 lines, 0 DocsInstall/DocsSeeAlso, dead #types/#theming/
  #universal-props; hero canvas, types panels and a11y table survive);
  archetype order hero → install → overview → usage → demo → law → api →
  axes → a11y → see-also ✓; measurement-first header + probe-ready
  `data-probe` hooks; declaring-element/emission-form named in the theme
  row; raw-SSR discipline (the asymmetric `&gt;`/raw-`>` encoding
  respected when grepping the query form).
- **test/ pins**: batch6-antd2-components.spec.ts pins the family
  lifecycle ([data-jx-image-broken] at :197/:207/:217) — the docs honor
  docs-only scope (no duplicated lifecycle claims).

## Gates (re-run this review)

| gate | result | tail |
|---|---|---|
| `verify:docs-universal` | exit 0 | `GREEN: 110/110 component pages render the shared universal section (110 markers)` — image counts via its hand table's marker |
| `verify:tailwindless` | exit 0 | receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim` |
| `verify:docs` | exit 0 | `✓ all docs pages pass the skeleton lint (staged scope green)` |

## Process evidence

- Port :5244 empty before (lsof exit 1); dev server background task (log
  /tmp/marginalia-21-dev.log), killed by PID at the end with the
  lsof-empty receipt in the final message.
- Probes: /tmp/marginalia-21-probe.mjs (frozen pole + size inert + merge
  law + first query attempt), -probe2.mjs (crashed — the PROBE-READINESS
  lesson re-learned: no scroll → lazy img never fails → no swap), 
  -probe3.mjs (merge-law carrier join + query), -probe4.mjs (title-anchored
  query — landed on the wrong broken panel), -probe5.mjs (slot-anchored —
  the density-null receipt at both viewports). SSR:
  /tmp/marginalia-21-ssr.html (1,041,514 bytes). Old page:
  /tmp/marginalia-21-old.svelte. Gates: /tmp/marginalia-21-{univ,twl,docs}.log.
- Independence: reviewer #2 (scribe) has not reviewed yet — this is the
  1st review; scribe re-derives after.
- Working tree carries sibling in-flight work (unchecked, untouched). NO
  commits, NO push.
