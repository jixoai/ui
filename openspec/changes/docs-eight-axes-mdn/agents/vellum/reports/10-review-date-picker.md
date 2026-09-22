# Report 10 — date-picker, REVIEW (1st, vellum)

agent: vellum · 2026-09-22 · route
`apps/www/src/routes/docs/components/date-picker.html/` (+page.ts; curation
`src/lib/ui/props-table/docs/date-picker.docs.ts` — a separate docs file, not
inline) · coder quill (integrated 9ed2a7d8) · law: mdn-doc-style §5 + §6
rulings + LAW #14 (transition-bearing surfaces) · reviewer #2: marginalia.
Every verdict re-derived from source, raw SSR bytes, or live probes on :5242.

## Verdict: PASS

0 BLOCKER · 0 MAJOR · 1 MINOR · 1 NIT. All six scoped verification targets
hold — the headline theme-split pair re-derived at its sharpest (one cell,
two formulas, hue-drift-immune), the composed-consumer naming is
import-true, the density min-height lane measured exact, the number lane
proved inert, the EXTRA arithmetic is exact from raw SSR, and the W3-era
"CONSUMES size and color" copy-paste is verifiably replaced by zero-readers
truth.

## The six scoped verifications

1. **THEME-SPLIT at one element — RE-DERIVED, TRUE.** One-evaluate probe on
   the axes theme panel (`id="axes-theme-dark"`, value 2026-08-24
   committed, panel opened per LAW #14 — 600ms settle, double-read):
   at the SAME selected day cell, `--primary` computes
   `oklch(0.7044 0.1872 calc(13 - 4))` — the DARK formula (L 0.7044,
   C 0.1872, hue = live − 4) — while `--jx-primary` computes
   `oklch(0.6489 0.237 13)` — the LIGHT formula (L 0.6489, C 0.237, same
   live hue, no offset). Ambient cell: both tokens read the light formula.
   The L/C pairs are the stable invariants (the wall-clock hue rotates —
   read 2: calc(17 − 4)/17 — LAW #14 stability asserted in L/C, not raw
   strings). The cell sits under the wrapper's `.dark`
   (`cell.closest('.dark')` true), so the split is the wrapper scope's.
   The page's theme row + the 9-voice themeSplitTokens table (5 FLIPS /
   4 FROZEN) match this measured split voice by voice.
2. **Composed-consumer naming — TRUE.** date-picker.svelte imports
   Calendar (`./calendar.svelte`) and TimeStepper (`./time-stepper.svelte`)
   — the fragments mount inside the field wrapper and inherit its scope
   (measured: the dark panel's cells sit under the wrapper `.dark`; the
   density rung re-bases the trigger inside the same wrapper). The popover
   FAMILY is NOT in the chain: the only popover references are the native
   `:popover-open` attribute reads — zero `from '…/popover…'` imports; the
   panel rides the Popover API + the shared jx-surface vocabulary + the
   surface-motion kernel, exactly as the overview states.
3. **Density named rung — TRUE, on the min-height lane.** The trigger rides
   the jx-html-input law (jixoai.css:1552+: `min-height: var(--jx-hit,
   2.5rem)`, padding-inline `--jx-inset`, gap `--jx-gap`) — the channels
   the density row names are really read. Measured computed min-heights:
   ambient **40px**, sm rung **32px**, lg rung **48px**; the resolved
   `--jx-hit` ladder tracks per rung (sm ×8, default ×10, lg ×12 of the
   unit — the 24/28/32/40/48 2xs→lg ladder the TokenTable quotes, matching
   my alert-round measured correction). Rendered boxes step with content
   above the floor (46/36/58) — the page claims the min-height lane, which
   is exact.
4. **Number lane inert — MEASURED.** `--jx-density-coefficient: 1.5`
   inlined on an ambient field wrapper: trigger min-height 40px before /
   40px / 40px after (the declaring-element law — the channels substitute
   at their declaring elements, the wrapper's inline coefficient never
   re-substitutes them). Exactly the row's claim.
5. **EXTRA arithmetic — EXACT from raw SSR.** Meta = 25 props (avatar.meta
   parse; 8 axis-named + 17 family); the curation has NO extra lane;
   family table renders **17 rows** (value bind, range bind, mode,
   showTime, label, error, placeholder, min, max, format, locale, presets,
   preset, isDisabled, id, variant, class) — 25 − 8 + 0 = 17 ✓. The
   union-alias ceiling corrections + the intentional `locale` add are
   documented in the curation header.
6. **W3-era copy-paste replaced — VERIFIED.** The old page
   (9ed2a7d8~1:415) literally said "The family CONSUMES size and color"
   (consumption by vocabulary analogy). The new page's six supply rows
   carry the house negative-grep receipt form, and my own grep re-derives
   every one: `--jx-size-effective` / `--jx-color-effective` /
   `--jx-shape-effective` / `--jx-radius-effective` /
   `--jx-elevation-effective` / `--jx-motion-effective` — **0 readers each**
   in ui/date-picker/. The elevation row additionally names the real
   consumption pair (`--jx-elevation-surface/-shadow`, stamped by toast/
   terminal-card/press-button — never this family), which is the honest
   superset of the receipt.

## Standard review

- **Tier 2 justified** — the old page's catalogue demos, playground and
  generated-props direction survive verbatim (the page header's claim;
  the catalogue Canvas + lab are intact in the new tree); the skeleton
  gained Overview, the per-axis table, the query() case, install and
  see-also; types/theming/universal-props folded into the axes section
  with their content preserved (the theme-split TokenTables are the
  theming section's successor).
- **Archetype §2 order** — hero → install → overview → usage → live lab →
  catalogue → props → axes → accessibility → see-also ✓.
- **toc vs DOM** — 6 ids ×1 each in raw SSR, order matches DOM; **See also
  is NOT in the toc** (the ruling) while DocsSeeAlso renders (marker ×1);
  dead ids (types/theming/universal-props) gone.
- **query() §6** — `query<{ sm: DensityLane }, DensityLane>({ sm: 'small'
  }, 'large')` both-generic in stage AND drawer sample; type-checks clean
  (the page's only svelte-check error is the fleet cx idiom at 152:28).
  Flip measured both directions at the min-height lane: 1440 → sm/32px,
  600 → base large/48px, back → 32px (LAW #14 awaits between flips).
- **Consumed-vs-supply positive side** — density's read channels really
  read: the jx-html-input law consumes `--jx-hit` (min-height),
  `--jx-inset`, `--jx-gap` (jixoai.css:1552-1636) — the row's mechanism
  names are the family's real reads.
- **Prose §1** — measurement-first header, the composed-consumer law named
  in the overview, the reading-guide note above the axes table, the
  吃也供 gloss present in raw SSR.

## Findings

1. **MINOR — the density row's channel list omits `--jx-leading`'s
   sibling read but overstates "everything composed under the wrapper
   re-base together" without the panel caveat it earns.**
   `+page.svelte:266`: the Calendar and TimeStepper ARE the composed
   consumers (verified), but the PANEL (the popover surface the Calendar
   mounts in) is a top-layer popover when open — its cells measured under
   the wrapper scope in the built DOM (my probe: `closest('.dark')` true),
   so the claim holds — yet the row never distinguishes the trigger's
   min-height lane (the one place the re-base is directly visible) from
   the panel's inherited scope. One clause of precision would future-proof
   it: "the trigger's min-height lane is the directly visible re-base; the
   panel's cells inherit the same scope through the wrapper."
   Fix: add the clause (no numbers change).
2. **NIT — the density TokenTable's `--jx-hit` row says "the whole box
   steps" while the measured box overshoots the min-height at lg
   (rendered 58px over a 48px floor — content + input-law leading at the
   big rung).** `+page.svelte:315`. The min-height claim is exact; "the
   whole box steps" is directionally true (46 → 36 → 58 measured) but the
   box is content-driven above the floor. Fix: "the trigger's floor steps"
   (or quote the min-heights 32/40/48 explicitly — the numbers the probe
   verified).

Zero BLOCKER/MAJOR — justified: the headline pair (the review's reason for
sharpest-work) reproduced exactly, and every supply receipt re-derived as a
personal grep result rather than trusted from the page.

## Verified-TRUE receipts (summary)

- Theme split pair at one cell (probe, L/C invariants, double-read stable).
- 6 × zero-readers grep receipts (size/shape/radius/color/elevation/motion
  carriers) re-run personally — all 0.
- Composition imports (Calendar/TimeStepper in; popover family out).
- Density channels consumed via the jx-html-input law (jixoai.css:1552+).
- min-height lane 40/32/48 + query 32/48/32 (both directions).
- Number-lane inert (40/40/40).
- EXTRA arithmetic 25−8+0=17 (raw SSR row parse).
- toc 6/6 ×1, See-also out of toc per the ruling, markers ×1, dead ids none.
- gates: tailwindless receipt verbatim; docs-universal 110/110;
  verify:docs green; svelte-check page delta = 1 cx error (fleet debt).

## Process evidence

- Port :5242 empty before (lsof exit 1); wrapper PID **74593** (log
  /tmp/vellum-10-dp-vite.log); killed by PID; `lsof -ti :5242` → empty
  (exit 1); wrapper dead; no orphan.
- Probes: /tmp/vellum-10-dp-theme2.mjs (headline pair + LAW #14 stability),
  -density.mjs (min-heights + number lane + query flip), -diag.mjs
  (trigger id map). SSR: /tmp/vellum-10-dp-ssr.html (1,077,341 bytes).
- Gate logs: /tmp/vellum-10-dp-{tw,univ,docs,scheck}.log.
- Probe-lesson banked (experience.md): quill's calc()-hue and the
  wall-clock rotation defeat naive oklch regexes and byte-equal stability
  checks — assert L/C polar invariants with a calc()-tolerant parser.
- Working tree carries sibling in-flight work (unchecked, untouched). NO
  commits, NO push.
