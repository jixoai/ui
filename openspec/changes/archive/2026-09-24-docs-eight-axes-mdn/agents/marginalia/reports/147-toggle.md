# T147 — toggle: the campaign's 110th page, closed (marginalia — owner round, 2026-09-24)

- **Role**: owner (scribe 1st / vellum 2nd queued in assignment.json — untouched).
  Standard campaign docs work on
  `apps/www/src/routes/docs/components/toggle.html/` (+page.svelte, +page.ts) with
  one site-metadata edit (registry.json item description).
- **Tier decision: TIER 1 (archetype alignment), landed.** The page is the
  2026-08-25 docs-restructure P0 artifact: the skeleton bones were all present and
  modern (hero from CATALOG, workbench playground with reset + live output,
  CardGrid demo, the submitted-form canvas with TerminalCard, types variants,
  a11y/theming/universal/api sections, the hardened cx, the same-source drawer) —
  what it needed was the skeleton's missing halves, the Usage reorder, and the
  mechanism copy trued to the family's 2026-08-27 **native-contract-fusion** V2.
  Not Tier 0 (real copy rewrites + two skeleton sections), not Tier 2 (the
  composition and state machinery needed zero structural change).

## The measured gap (why this was not just a formality)

The family moved to the V2 DOM ISOMORPHISM (toggle.svelte header: ONE
`input[role=switch]` — "No label wrapper, no track/knob spans"; the standard
layer's `jx-html-switch` utility paints the capsule on the element itself, knob =
the input's own `::before`) while the page still taught the retired pre-fusion DOM
in nine seats: "visually-hidden checkbox", "drives a rounded rail through the
sibling selector", "sm 28×16, md 36×20, lg 44×24", "checkbox in inline-end
posture / label on the left", a11y `role: checkbox`. Measured on the live page
before the edits:

- **role = "switch"** (type checkbox) on all 19 inputs — the a11y table's
  `role: checkbox` was stale.
- **The label stacks ABOVE the control** (sibling `label[for]`, display block,
  same left edge; labelBottom 725 < inputTop 737) — "label on the left" false.
- **Rail geometry by density** (width = 2 × track, track = `--jx-line`):
  **xs 32×16 · sm 36×18 · default 40×20 · lg 48×24** — the literals 28×16 /
  36×20 / 44×24 wrong at every rung.
- **Checked**: the knob (`::before`) slides **translateX(width − track) = 20px**
  at the default rung and flips to primary-foreground inside the primary ring;
  the rail tints to the brand hue; **transition 0.2s** — the 200ms
  cubic-bezier(0.22, 1, 0.36, 1) claim survived the fusion.
- The page's TokenTable was ALREADY current (track = var(--jx-line), width = ×2,
  knob = track − unit) — the theming section had been trued by the W3-B round;
  only the prose lagged.

## Changes landed (page + site metadata; family source untouched)

1. **DocsInstall served** (new `#install` section after the hero) — the
   skeleton's missing first half.
2. **DocsSeeAlso served** (new `#see-also` section closing the page) — the
   missing second half.
3. **Usage reordered** before the demo sections (the six-keep-order law; the
   toast precedent) and the stale duplicate removed.
4. **Mechanism copy trued to the fusion** at every seat: head meta, hero title
   ("toggle — the native checkbox, painted as a switch"), hero pills ("one
   element — the input is the rail"; "xs → lg rail rungs"), canvas description,
   PlayHelp, the #demo title/summary/paragraph (now carrying the measured rung
   digits and the slide law), the a11y table (`role: switch`), all with the
   visually-hidden/sibling-selector story retired.
5. **toc rebuilt** (+page.ts): usage first, demo relabeled "The painted switch",
   see-also added — 9 entries, all resolving.
6. **registry.json item description trued** (site metadata feeding the CATALOG
   hero — the hand-maintained-copy law preserved; the built copy under public/r
   regenerates with the build).

## Claim → receipt ledger (measurement-first)

| claim (as now taught) | receipt |
|---|---|
| role = switch, native checkbox underneath | served DOM: `input[role="switch"][type="checkbox"]` ×19 |
| the input IS the rail (capsule + ::before knob) | jixoai.css :2027-2065 (appearance:none, infinity radius, muted ground, ::before knob); live computed: radius 3.35e7px capsule, inset 1px ring |
| rung geometry xs 32×16 / sm 36×18 / default 40×20 / lg 48×24 | live rects per data-density (width = 2 × track exactly) |
| slide = width − track = 20px, knob → primary-foreground | live ::before transform matrix translateX 20px ↔ 0 across a real click; knob bg oklch(0 0 0) = primary-foreground at this theme |
| 200ms cubic-bezier(0.22, 1, 0.36, 1) | computed transitionDuration 0.2s ×3; the curve in jixoai.css :2043/:2059 |
| label = sibling label[for], stacked inline-start | label[data-jx-toggle-label] block, labelForWired true, stacked-above measured |
| skeleton: Intro → Install → Usage → Examples → API → See Also | served DOM order + rail hrefs (below) |
| 420 laws hold | tglGrid900 `minmax(0,1fr) minmax(0,0.9fr)` in routes.stylex (pre-dated this round); no horizontal overflow at 420 measured |

## Gate record

- **Fresh build rc=0** (dist 06:51, this batch's only build — I was the sole
  build writer).
- **verify:docs rc=0** — staged scope green; **zero lint mentions of toggle**
  (the six "toggle" strings in the log are theme-toggle/toggle-group backlog
  entries — different pages).
- **docs-universal 110/110 rc=0.**
- **Smoke 200** on the built preview + the structural probe: h1 ×1; install/
  usage/see-also all served; DOM order [install, usage, demo, in-a-form, types,
  accessibility, theming, universal-props, api, see-also]; rail hrefs == DOM
  order, all resolving; **LAW #19: 82 ids, zero duplicates**; no horizontal
  overflow at 1280 or 420; no `undefined` leak.
- **No full svelte-check** (the Owner single-run rule; the round is mechanical +
  copy, and the page carried no type diagnostics in the T138-era runs).
- Teardown: dev server killed before the build, preview killed after —
  **lsof :5244 empty, rc=1**, no orphans.

## Family ledger notes (not touched, per scope)

- The registry mirror under `public/r/registry.json` is build-generated; the
  trued description flows from the root registry.json on rebuild.
- The workbench playground's density segmented control offers sm/md/lg while the
  family's density lane vocabulary is xs/sm/default/lg (the page's own
  PlaySegmented labels "sm/md/lg" are display shorthand for the rungs) — cosmetic,
  noted for the reviewers to adjudicate.
- `demo_tg` name repeated across three demo toggles — names, not ids; FormData
  would see three same-name fields in that demo cell group. Harmless in a demo;
  noting so the 1st reviewer (scribe) can rule it.

## Assignment

`research/assignment.json` toggle entry: **status done, tier 1**, closure note
carrying the above; reviewers remain scribe/vellum (both queued — the page is
now ready for them). **No commit — integration is the orchestrator's.**
