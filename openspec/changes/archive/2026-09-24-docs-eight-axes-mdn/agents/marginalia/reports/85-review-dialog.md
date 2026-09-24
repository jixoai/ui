# TASK 85 — FIRST REVIEW dialog.html (marginalia, 2026-09-22)

- **Reviewer**: marginalia (1st review; scribe's CODE, legacy explicit-props era at
  4f1cd484, folded into the campaign without a per-page CODE report — owner-checked I
  did not code it. No other dialog review exists; no concordance addendum applies. All
  findings derived from my own source reads + probes).
- **Target**: `apps/www/src/routes/docs/components/dialog.html/` (+page.svelte 809
  lines, 13 sections, toc 12) over the dialog family (svelte 409 / stylex 49 / css 98 /
  defaults 71) — the native `<dialog>` + showModal() + the WAAPI surface kernel —
  served live on :5244.
- **VERDICT: NEEDS-WORK — MAJOR x1 / MINOR x4 / LOW x0 / NIT x0** (all new; first
  audit). **Tier proposal: Tier 2 — archetype completion + measured axes.** The claim
  density is real (focus/scrim/motion/elevation/concentric stories, five demo families)
  and the demos are strong, but the archetype layers are absent (no overview/law, no
  axes table, no query() seat, #universal-props unrailable, toc 12 vs DOM 13) and two
  claim families fail their own receipts (the focus trap leaks; the elevation ladder
  does not paint).

## MAJOR 1 — the modal focus trap leaks; the page behind is focusable while the dialog claims inert

The a11y table (:768): "Tab — Cycles inside the dialog — **the showModal() focus trap;
the page behind is inert**". Measured on the served page with exactly ONE
`dialog[open]` (showModal — top layer, ::backdrop painted, open-count 1 at every
step), real Tab presses, per-press containment reads:

| press | activeElement | inside dialog | in top layer |
|---|---|---|---|
| 1 | "Close" (×) | yes | yes |
| 2 | **"Skip to conten[t]" — the page's skip link** | **no** | **no** |
| 3 | unnamed BUTTON (in dialog) | yes | yes |
| 4 | "Close" | yes | yes |
| 5 | **"Skip to conten[t]"** | **no** | **no** |

The escape is periodic (every second press), reproduced across two independent runs
(probe2 A, probe3 A). The page behind is focusable while the modal is open — "the
platform supplies the focus trap / the page behind is inert" (family header :4-5) is
falsified on the served DOM. Whether the root cause is the component's
showModal/hidePopover choreography racing the native inertness or a scaffold
interaction, the served contract fails at the second Tab for every keyboard user. The
Escape path itself is healthy (cancel closes, focus restores to the invoker —
"Open dialog" re-read after Escape).

## MINOR 2 — the elevation ladder does not paint: four seats, zero shadow, zero rung delta

The universal-props summary + six seats claim the modal's OWN elevation: "level4 (8dp
shadow recipe + the surface-container-high rung)", "level3 · 6dp + the
surface-container rung", "6dp IS level3", "the inset 1px shadow over the deepest
ladder rung", "in dark the surface rungs STEP". Measured across all five seats
(real-key opens, settled reads): **no box-shadow on the dialog, its `[data-jx-card]`
child, the `.jx-surface-shadow` child, or ::after/::before; filter and backdrop-filter
`none`; no background-image; the only fill in every subtree is the same translucent
`oklch(1 0 0 / 0.32)` layer — level4, level3, 6dp, level-1 and dark are visually
identical**. The one elevation-adjacent claim that DOES paint is radius: the radius-20
seat renders 20px on the dialog and card, and the "auto radius" child button computes
**6px = max(0px, 20 − 14)** — the §3 concentric law through the top layer, digit-exact
(the × rides the full 20px anchor). The elevation ladder is the width-token truism's
big sibling: receipts in prose, no served paint.

## MINOR 3 — the scrim row's numbers are stale, and the dark half does not reproduce

TokenTable (:769): "--scrim: black 14% / white 14% — semi-transparent black (light) /
white (dark), never a brand tint". Served: `::backdrop` computes **rgba(0, 0, 0,
0.32)** in light — and under root html.dark the staged dialog's scrim **stays
rgba(0, 0, 0, 0.32)** (black; the stage pins `--scrim` light, the HOST stratum). The
real token values are `hsl(0 0% 0% / 0.32)` (light) and `hsl(0 0% 100% / 0.1)` (dark)
— jixoai.css :177/:345. The row's "14%" is wrong on both numbers; its "white in dark"
half is unreachable on the served demos (the stage pin) and at the token layer is 10%,
not 14%. One-row fix to the real 32%/10% values, with the stage-pin caveat the other
theme rows already carry.

## MINOR 4 — the page-scoped gate is red: 2 diagnostics, and the toc ≠ DOM

- **svelte-check: 2 diagnostics on dialog.html/+page.svelte** (:278 the
  Object.entries-undefined overload — the standing class; **:352 `Type 'true' is not
  assignable to type 'false'`** — a real page type error). Every other reviewed page
  closed its gate at 0; this page never had a CODE round to fix its debt.
- **toc == DOM fails**: 13 sections in the DOM, the toc lists 12 — **#universal-props
  has no rail entry** (the archetype's measured-axes section is unrailable; the page
  also lacks #overview/#law — both fold into the Tier 2 proposal below).

## The claims that held (receipts against my armed suspicions)

- **The width law SHIPS** — my system-dialog truism suspicion cleared: computed
  dialog width **416px @1440 and @800 (the 26rem cap) → 368px @400 = 92vw** —
  `min(92vw, 26rem)` is live and responsive (the TokenTable's "surface width" row is
  true; the earlier CSSOM scan missed the atomic rule's serialization — the computed
  evidence across three viewports is the receipt).
- **The WAAPI open timeline**: `--jx-p` sampled 0.3624 → 0.5435 → 0.7248 → 0.9059 → 1
  through the 460ms kernel on a real-click open.
- **The scrim is achromatic** (black 0.32 light, and black under the staged demo's
  pin — never a brand tint) — the row's NUMBERS are stale (MINOR 3), the
  never-colors claim holds.
- **Escape closes and restores the invoker**; the title names the dialog
  (aria-label "Deploy queued"); the × is the landing focus on open.
- **LAW #19**: 102 ids page-wide, zero duplicates (12 transfer-class instances —
  correction: 12 dialog instances censused, all dual-panel-free, ids clean).

## Standard battery

- **SSR**: 1,283,516 bytes; h1 ×1; universal marker present; 0 undefined literals;
  zero `jxoai`.
- **Warm-reload — receipt with a caveat**: consecutive fetches differ at the BYTE
  level (the campaign's first), but the divergence is entirely inside the dev-assembled
  `<style data-sveltekit>` block — the same sheets concatenated in a different module
  order per request (same total length; the payload with that block stripped is
  **byte-identical**). Dev-CSS assembly order, not a component counter; noted so the
  fleet's byte-equality assumption gets the strip-the-style-block refinement.
- **EXTRA-lane**: the api table serves 9 named props (title/open/variant/class/scroll/
  head/children/footer/cancelGuard) + the composition table (CardHeader/CardFooter
  faces); attribute posture is NAMED (the composition-first law — dialog composes,
  it does not forward a native attribute set; the class prop is geometry-only).
- **KEYED-EACH**: the canvas files arrays are static data; no repeated-row each on the
  page (the keyed surface is the family's step lists — none).

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** |
| svelte-check (fleet) | **dialog.html: 2 diagnostics — RED** (see MINOR 4); family lane 4 ERRORs (dialog.svelte :103 the standing overload class, :314 a `false \| "jx-waapi"` narrowing, +2) |

Sibling keyed noise receipted, not chased: quill's website-scaffold, vellum's toc,
scribe's toast in flight.

## Process evidence

- Port **5244**: lsof empty before (rc=1) → wrapper + listener 15687; killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits** (git status clean in scope).
- DOM injections (root dark) reverted in-probe; all dialog opens/closes via real
  clicks and real keys.
- Instrument honesty: (1) my first trap read had no containment checks — the
  instrumented re-run (open-count + contains + top-layer per press) is the receipt;
  (2) my first elevation read sampled the dialog element and pseudos mid-stack — the
  walk for ANY painted channel (boxShadow/filter/backdrop/bg-image, element +
  pseudos + card + shadow child) is what settles "does not paint"; (3) the CSSOM
  width scan needed the computed-evidence form (three viewports) after the
  serialization miss; (4) the canvas dock exposes no `<select>` — the `--jx-text`
  11/12/13/15px density row went unverified this pass (coverage note, not a finding).
- Artifacts: /tmp/marginalia-85-probe{1,2,3,4,5,6,7,8,9,10}.mjs,
  /tmp/marginalia-85-ssr{1,2}.html,
  /tmp/marginalia-85-{dev,wrapper,listener,ambient,universal,scheck}.*.

## Open questions

1. **The trap-leak root cause** (MAJOR 1): the component calls showModal() (source
   :271) and the top layer engages (backdrop paints) — yet focus reaches the skip
   link. Either a Chromium modal-inertness gap on this page shape, or something in the
   scaffold/component re-arms focusability behind the dialog. The family owner gets
   the A.walk transcript; a `role="status"`-style announcement or an inert polyfill
   will not fix it — the inertness itself needs investigating.
2. **The elevation wiring** (MINOR 2): the level pairs exist in the theme's level
   table (per the summary); the top-layered dialog receives the carriers (radius
   proves the channel) but the shadow/rung recipe never paints. Same owner decision
   shape as tour's radius drift: wire the reader or retire the receipts.
