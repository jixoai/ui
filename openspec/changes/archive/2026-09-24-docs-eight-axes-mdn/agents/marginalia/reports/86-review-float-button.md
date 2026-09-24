# TASK 86 — FIRST REVIEW float-button.html (marginalia, 2026-09-22)

- **Reviewer**: marginalia (1st review; scribe's CODE, legacy explicit-props era at
  4f1cd484, folded in without a CODE report — owner-checked I did not code it. No other
  float-button review exists; no concordance addendum applies. All findings derived from
  my own source reads + probes).
- **Target**: `apps/www/src/routes/docs/components/float-button.html/` (+page.svelte 348
  lines, 9 sections, toc 7) over the float-button family (svelte 273 / stylex 97 / css
  35 / defaults 59) — the fixed-corner FAB with the plain/menu idioms, popover=auto menu
  stack, served live on :5244.
- **VERDICT: NEEDS-WORK — MAJOR x1 / MINOR x3 / LOW x0 / NIT x0** (all new; first
  audit). **Tier proposal: Tier 2 — archetype completion** (universal-props rail entry +
  the usage dedupe + density coverage), with the menu geometry and the menu-shadow paint
  as family fixes the orchestrator lands.
- **The transferred instrument classes all fired**: the toc census found the structural
  gaps; the painted-channel walk found the unpainted menu shadow; the focus contract is
  HEALTHY here (non-modal popover — items keyboard-reachable, no leak claims to break);
  `playState` does not exist in this family (grep receipt — the typing instrument
  reduces to the gate, which carries 1 page diagnostic of the standing overload class).

## MAJOR 1 — the menu idiom's geometry breaks on the served demo: the trigger is not corner-fixed and the menu opens displaced

The page's headline law (:255): "Positioning is a prop, not a wrapper: the component
owns its fixed point and the consumer's layout is never touched"; the menu idiom's
claim (source comment :21-24): "the menu occupies the region ABOVE the stack,
END-aligned — right edges together". Measured on the served menu demo (label "quick
actions", `corner="bottom-left"`, popover s5, opened by real keyboard Enter):

- The stack wrapper carrying `anchor-name: --jx-fab-s5` sits **in the section flow at
  (308, 1882)** — not fixed at the viewport's bottom-left corner (the PLAIN fabs on the
  same page ARE `position: fixed` at their declared corners — the two idioms disagree
  on the same page).
- The trigger button computes at **(728, 639)** — mid-viewport, not the declared
  bottom-left corner.
- The open menu panel computes at **(1004–1176, 518)** — **276px right of the
  trigger's left edge and 408px short of its right edge**: neither edge aligned, the
  panel floating displaced up-right of its trigger while the vertical half works
  (12px above, `position-area` serialized "span-left top").

The menu works (opens, three menuitems, light dismiss, Escape) but the corner law and
the END-aligned geometry both fail on the served demo. Root cause for the family owner:
the stack wrapper's corner positioning does not engage in the menu idiom, and the
anchor/position-area resolution lands the panel ~276px off — likely the anchor
resolving against a different containing block than the trigger's fixed frame.

## MINOR 1 — LAW #19 violated: duplicate `id="usage"` ×2

The page renders `id="usage"` twice (:287 the legacy usage section, :319 the archetype
CodeBlock section) — the live DOM census reads **twin: usage ×2**. The toc's single
'usage' entry anchors the first; the second is an unreachable twin. One-line dedupe
(the :319 section is the archetype's Usage card — retitle/re-id it, e.g. `usage-file`).

## MINOR 2 — toc ≠ DOM: 7 rail entries vs 9 sections

The authored toc (+page.ts) lists 7; the DOM serves 9 sections. Named: **#universal-props
unrailable** (the measured-axes section has no rail entry — the dialog-class gap) and
**the second #usage unrailable** (the MINOR 1 twin). No dead anchors (every toc id
resolves). Both fold into the Tier 2 completion.

## MINOR 3 — the menu panel's "real shadow layer" paints no shadow; the elevation recipe is empty

The family header (:28-30): "the real shadow rides a DOM child (data-jx-fab-menu-shadow)
the kernel animates in lockstep"; the universal-props summary: "The fab carries its OWN
elevation — level3 (6dp, M3's FAB rung); the MENU panel rides the family resolution."
Measured on the open menu (painted-channel walk): `[data-jx-fab-menu-shadow]` computes
**box-shadow: none** (its fill is a translucent white wash oklch(1 0 0 / 0.32)), the
menu body oklch(0.94 0 0 / 0.72) — translucent — and the panel/::after/::before carry
**no shadow on any channel** (boxShadow/filter/background-image all none). On the FAB
itself: `--jx-elevation-effective` **stamps 6** (the own level3) but
`--jx-shadow-effective` is **EMPTY** — the elevation consumption pair stamps the level
and drops the recipe. The 6dp shadow recipe does not paint, on the button or the panel —
the same unpainted-elevation class as dialog's MINOR 2, now on a second family.

## The claims that held (receipts)

- **The menu idiom's interaction contract is healthy**: real-key open, `role="menu"`
  with three menuitems (back to top / copy this page / github ↗), **native light
  dismiss** (outside click closes), **Escape closes**, `aria-expanded` flips
  true↔false, `aria-haspopup="menu"` + `aria-controls` wired, `popover="auto"`.
- **The menu is keyboard-reachable**: Tab walks INTO the menu and through all three
  items (3/3 in-menu, menu stays open) — non-modal done right; no trap claims to
  break.
- **Vertical anchoring works**: the panel opens 12px above the trigger ("above the
  stack" half of the geometry claim; the horizontal half fails — MAJOR 1).
- **Corner-is-a-prop for the PLAIN idiom**: both served plain fabs are
  `position: fixed` at their declared corners with the press-law hard offset shadow
  painted (`rgb(0 0 0) 4px 4px 0px 0px`, bg oklch(1 0 0)) — the corner atoms paint
  there.
- **No playState prop exists** (grep receipt) — the dispatch's typing instrument
  reduces to the gate.
- **The universal-props Compose seat paints** (fixed bottom-right, shadow painted) —
  the own-level3 stamp (`--jx-elevation-effective` = 6) reaches the FAB; only the
  shadow RECIPE is empty (MINOR 3).

## Standard battery

- **SSR**: 977,429 bytes; h1 ×1; universal marker present; 0 undefined literals; zero
  `jxoai`.
- **Warm-reload (the dialog refinement applied)**: raw consecutive fetches differ;
  **with the dev-assembled style block stripped they are byte-identical** — dev-CSS
  module order, not a component counter.
- **EXTRA-lane**: PropsTable serves the declared surface (label required, corner,
  actions, variant own-auto, the eight axes, class); attribute posture is
  composition-first (no rest spread — the family names every prop; the plain idiom's
  onclick is a declared prop).
- **KEYED-EACH**: no repeated-row each on the page (the menu items are snippet
  content) — the keyed surface is empty by construction.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| svelte-check (fleet) | **float-button.html: 1 diagnostic** — :84 the Object.entries-undefined overload (the standing class; no genuine page type error). Family lane, pre-existing: 3 ERRORs (:177 the same overload; :252 an always-true condition; +1) — recorded, not chased |

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 52827; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits** (git status clean in scope).
- DOM state (the open menu, focus) reverted in-probe; all drives real keys/clicks.
- Instrument honesty: (1) my first menu click was pointer-intercepted (a fixed FAB
  under section content) — re-drove with focus + Enter (real keys); (2) my first
  "unpainted FAB" candidate was the menu-idiom stack WRAPPER (correctly transparent —
  the wrapper holds the anchor, the button paints); identified by section/class walk
  before counting; (3) the end-alignment first read used the bottom-RIGHT expectation
  on a bottom-LEFT demo — the full rect transcript (left/right deltas both wrong) is
  what proves displacement rather than mirroring.
- Artifacts: /tmp/marginalia-86-probe{1,2,3,4}.mjs, /tmp/marginalia-86-ssr{1,2}.html,
  /tmp/marginalia-86-{dev,wrapper,listener,ambient,universal,scheck}.*.

## Open questions

1. **The menu geometry** (MAJOR 1): the corner positioning not engaging in the menu
   idiom + the ~276px horizontal displacement is a family fix (the wrapper's corner
   atoms, the anchor/containing-block resolution). The vertical half works — the
   position-area literal is probably fine once the anchor resolves against the fixed
   frame.
2. **The elevation recipe** (MINOR 3): the level stamp reaches the FAB but
   `--jx-shadow-effective` ships empty and the menu shadow child paints a wash — the
   same wire-or-retire decision as dialog's MINOR 2.
3. **The usage dedupe + the rail entry** (MINOR 1/2): one re-id + one toc line, part
   of the Tier 2 completion.
