# TASK 125 — theme-toggle (docs page) — 1st eight-axes review (scribe)

**VERDICT: PASS — 0 MAJOR / 1 MINOR / 1 LOW / 1 NIT — Tier 2 proposed.**
Owner = marginalia (coded); this is the independent 1st audit. Dist = 79d7adde (fresh
build rc=0, this review's own build). Port 5243 mine; killed by wrapper PID after probes,
lsof post rc=1, no orphans.

## Delivery-shape taxonomy: SELF-STAMP (own-element)

The root stamps the §11 carriers + `data-density` (omitted at auto — the no-opinion law
visible) + `class:dark` (only when the theme AXIS is dark) on the control's own root
(`data-jx-theme-segmented` or `data-jx-theme-btn`). No portal, no observer, no css sheet —
the paint is stylex atoms joined through the family cx. The GLOBAL flip machinery
(html.dark + localStorage + colorScheme) is a behavior channel, not a paint channel.

## Findings

**MINOR 1 — the page-scoped gate is red (3 diagnostics in the page+family lanes), all
fleet-standard one-liners.** Page :98 — the cx `Object.entries` overload (the standing
class; the `?? {}` one-liner closed it on every sibling). Family: theme-toggle.svelte :69
— the same cx class verbatim; :227 — `current === theme && themeToggleStyles.segActive`
produces `false | atom`, not assignable to the joiner (the dialog :320 ternary shape:
`cond ? atom : undefined`). Three mechanical fixes, zero behavior change. (Saved-run
receipt: /tmp/g125-scheck.txt, the batch's ONE svelte-check run.)

**LOW 1 — the theme-axis claim is UNRENDERED: zero `theme=` instances on the page.** The
universal-props summary teaches "The theme axis is tree-scoped paint (class:dark on the
control own root); it is deliberately NOT the global flip" — source-true (family verified:
`class:dark={d.theme === 'dark'}` on uniRoot; the §6 system lane's set/cycle never touches
it) — but the page renders NO theme-axis seat (the universal canvas shows size/radius
only; a served-bytes census counts 0 `theme="dark"` occurrences). The claim fails the
rendered-table-is-the-claim-surface discipline. Fix shape: add a `theme="dark"` instance
to the universal canvas — the island is then visible (the control flips while the page
stays light), which is exactly the teaching.

**NIT 1 — the hero title says "four densities".** title="theme-toggle — light / dark /
system, four densities" — in a fleet where density is the §4 AXIS, the word collides;
the page's own pills, Types summary, and meta all correctly say variants. Fix: "four
variants".

## Verified-true (receipts against my armed suspicions)

- **The global flip chain, on real clicks**: the compact button's aria-label walks
  "theme: system" → click → html.dark FALSE→… measured: system → **light** (stored
  "light", colorScheme light) → **dark** (html.dark TRUE, colorScheme dark, stored
  "dark") → **system** — the light→dark→system cycle as taught, entered from the default
  system rung (probe note: the first click from a fresh load lands on LIGHT, not dark —
  the cyclic order is what the page claims, and it holds).
- **full sets, one click**: role=group, aria-label "Color theme", three options with live
  `aria-pressed` + `data-active` mirrors; clicking "dark" set storage + html.dark and
  flipped the pressed state in every rendered group (page-wide triples all consistent).
- **The carriers are self-carried and no-opinion**: the size-18 instance stamps
  `--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem)` inline; 2 of 13
  roots carry any style (only the axis-fed ones); `data-density` absent on every root at
  auto.
- **A11y contract**: cycling variants carry `aria-label="theme: {mode}"`; the decorative
  sun/moon/monitor svgs are inline with aria-hidden ✓; the localized zh seat serves
  浅色/深色/系统 while the stored value contract stays light|dark|system (byte-checked).
- **The no-flash half is real**: the served page ships the app.html bootstrap text
  (localStorage + prefers-color-scheme + the .dark apply) as the same-source CodeBlock.
- Structure: toc 8 == DOM 8 == rail order; **LAW #19: 48 ids, zero duplicates**; h1 ×1;
  0 undefined literals; chrome speaks currentColor (inline svg, no component tokens).

## Standard battery + gates

- SSR 200 (433,840 bytes dev / 434,061 first smoke — static preview); verify:docs **rc=0**
  · docs-universal **110/110** · ONE saved svelte-check for the batch (MINOR 1's receipt).
- Probe-fault ownership: (1) my aria-pressed read aggregated ALL rendered groups (18
  buttons page-wide) — per-group triples were each correct; (2) the cycle-order note above
  (first click from default system → light) is a wording nuance, not a defect — the page
  claims the cyclic order and holds it.
- Artifacts: /tmp/g125-{tt,ib,ib2,li,li2,li3,li4,li5}.mjs, /tmp/g125-{build,docs,
  universal,scheck,preview}.log.

## Open questions for the code round

1. The Tier-2 archetype gaps: no #install, no #overview, no #see-also (the dialog
   CODE-round pattern lands all three + the axes table; this page's universal section is
   one line deep — the eight-axis rows are not tabled, only summarized).
2. The Icons are Icon-component renders (lucide geometry, generated set) — the hero's
   "inline SVG" is true at the served paint; fine as-is, noting the phrasing for the code
   round's overview pass if it ever cites the mechanism.
