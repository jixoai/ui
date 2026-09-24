# quill — task 4: chip (tier 2 优化重构)

**Page**: `apps/www/src/routes/docs/components/chip.html/+page.svelte` (+ `+page.ts` toc, NEW
`apps/www/src/lib/ui/props-table/docs/chip.docs.ts`). Family untouched:
`apps/www/src/lib/ui/chip/` (zero edits — census batch B LANDED state is the source of truth).

## Tier: 2 — justification

The bones were good and survive byte-identical where pinned: the primary canvas (the
play-state lab `component-canvas-floor.spec.ts` pins — 3 output rows, first `tonal`), the
anchors/slots/twin/hue demos, the same-source `usageHead`/`usageTail` assembly. What was
broken was structure and honesty, not the material: archetype order violated (usage shown
three times, `id="usage"` duplicated on TWO divs), the API table hand-written while the
family's GENERATED meta sits unused, no per-axis table, no `query()` case, a stale toc
(`hit-lane` id existed nowhere in the page), and two stale claims the old page taught as
demos. Tier 3 (full rewrite) would have meant re-earning the spec pins for nothing; tier 1
could not fix the table or the order.

## The eight axes on chip — measured, not assumed

Probe rig: dev server :5241, SSR curl for the carrier stamps + headless-Chromium computed
styles against the served demo roots (`/tmp/quill-chip-probe{,2,3}.mjs`), then RE-probed
against the rewritten page (`probe3` runs the final DOM). Both sides probed: every
"consumed" claim asserts the changed value AND every "supply-only" claim asserts the
unchanged one.

| axis | state | mechanism (all verified on the served page) |
|---|---|---|
| size | CONSUMED — glyphs only | stamps `--jx-size-effective` + inline `font-size`; the inline stamp outranks the base atom's `var(--jx-text-secondary)` label (14→14px, large→18px). **The BOX does not follow**: height/paddings/slot svg stay density-anchored (measured: a 24px label in the 20px default box) — the badge-twin law. |
| density | CONSUMED (named rungs); number = supply | `data-density="sm"` scope block re-declares the channels ON the root: inset 8/12/16, label 11/12/13, height ≈18/20/23 at sm/default/lg (all measured). A coefficient (1.5) stamps the carrier only — no rung attribute, nothing recomposes (measured: box unmoved) — the declaring-element law. |
| theme | CONSUMED — one-way | `dark` stamps `.dark`; the theme sheet's `.dark` block (jixoai.css:1499) re-declares the four grammar slots on the root — measured: the fill re-resolves to the dark-profile primary (L 0.7044). `light`/`system` stamp nothing: a light chip inside a dark tree stays dark. |
| radius | SUPPLY-ONLY | stamps `--jx-radius-effective`; the silhouette atoms paint `var(--jx-radius)` / `calc(infinity * 1px)` and never read the carrier. **Measured mismatch: a stamped 10px carrier under an 8px computed corner** (`radius={10}` demo on the OLD page implied it paints). Named consumers exist downstream (press-button.css concentric calc; card/tooltip/menubar) — grep receipts in the table row. |
| shape | ABSENT (census-cited) | family-local `shape` (`'square' \| 'pill'`) owns the name; `pill` is outside ShapeLane; not a §13-ruled rename family → axis left out (forwarding ambient), W6-dossier-flagged (migration-census.md batch B, LANDED 4a96996f). Text matches the census verbatim. |
| color | SUPPLY-ONLY | stamps `--jx-color-effective`; the slot re-derivation from the carrier is keyed `[data-jx-press-button]` (press-button.css W6-r3 block) which the chip root never carries. Measured: an `error` carrier leaves the primary tint; the `jx-hue-error` class beside it repaints — the canvas shows the pair side by side. |
| elevation | SUPPLY-ONLY | stamps `--jx-elevation-effective`; **no family css reads it** (negative grep receipt: only the :root invariant, jixoai.css:423). The press rest reads `--jx-elevation-shadow`, stamped only by the press-button component's pair — the chip keeps `--shadow-xs`. Measured: rest shadow unchanged under a stamped level. |
| motion | SUPPLY-ONLY | stamps `--jx-motion-effective`; no family css reads it (only the :root invariant, jixoai.css:424). The press transition is 150ms literals + the reduced-motion kill; the effect loops freeze the same way. |

## Changes

1. **Archetype order**: hero → DocsInstall → overview (3 short paras) → Usage (ONE section,
   duplicate id killed) → primary canvas (spec-pinned playground lab) → anchors → slots →
   twin (the scale law + the silhouette vocabulary) → hue + tokens → API → the eight axes →
   accessibility → DocsSeeAlso.
2. **API table → GENERATED meta + curation**: `<PropsTable meta={chipMeta} docs={CHIP_DOCS} />`;
   new `chip.docs.ts` (variant/shape union + default corrections, per-prop prose, `rest`
   hidden, `children` required). **The collision casualty caught and fixed**: the shared
   split filters every row named in `UNIVERSAL_AXIS_NAMES` from the main table
   (props-table.svelte `mainRows` filter) — chip's FAMILY-LOCAL `shape` would silently
   vanish from the API table the moment the meta path renders. It rides the curation's
   `extra` lane back in with its real union and the own-default marker. The r4 effect mount
   (invisible to the extractor) rides `extra` too.
3. **Per-axis table** (the §2.5 heart): 8 rows, state-led, real carrier/var names, measured
   numbers, census citation on the shape row.
4. **Axes canvas**: 8 panels — size number (glyphs only), size named step, density sm rung,
   density 1.5 no-op, theme dark bridge, **one real `query()` case** (`query({ md: 16 }, 14)`
   — measured 16px at the md viewport; base always provided per the campaign typing law, no
   explicit generics needed), and the supply-only vs injected color PAIR.
5. **Stale claims killed** (drift ledger, below) + TokenTable rebuilt: `--jx-hit` row dropped
   (not a chip channel since the 2026-09-01 ruling); measured defaults on the density rows
   (8/12/16 inset, 11/12/13 label); `--jx-radius` added as the square silhouette's corner.
6. **ToC rebuilt** (+page.ts): DOM order, stale `hit-lane` entry gone, `axes`/`see-also`
   added, labels checked against the outline probe (`'chip'`/`'playground'` exact-match
   absent — spec holds).

## Drift ledger entries (page vs source/measurement — the page lied, the family didn't)

1. TokenTable `--jx-hit` "28/32/40/48px — minimum block size of the root": the chip reads NO
   hit channel (badge twin, 2026-09-01 ruling supersedes the hit-lane floor); measured
   height 20px = line-secondary + hairlines. Row dropped; the a11y section now carries the
   hit-floor ruling honestly.
2. Universal demo panel "radius 10 · primary": implied the radius lane paints. Measured:
   computed corner 8px under a stamped 10px carrier (and 8px under the `medium`=8px stamp —
   the old demo only LOOKED right because 10 coincided with the site radius).
3. +page.ts toc listed `hit-lane` — an id that existed nowhere in the page (dead toc entry
   shipped to the layout).
4. Two sibling divs both `id="usage"` (invalid HTML, ambiguous fragment target).
5. Hand API table's `onclick` row ("the ripple seam moved into pressEffect's own gesture
   surface") survived from the retired effect grammar; replaced by the meta row + the r4
   attachment `extra` row.

## Sibling note for marginalia's badge review (same collision)

Badge carries the SAME census row (batch B: SEVEN lanes, family-local `shape` owns the
name). Three things to check there: (1) the generated-meta migration will silently DROP
badge's family `shape` row via the `UNIVERSAL_AXIS_NAMES` filter — the `extra` lane is the
fix (chip.docs.ts is the pattern); (2) probe radius/color/elevation on the SERVED badge
before writing its axis rows — badge's atoms are a different sheet and the consuming blocks
are keyed `[data-jx-press-button]`/theme-sheet scopes, so assume nothing from chip's
results; (3) badge's TokenTable/a11y rows may carry the same retired `--jx-hit` claim.

## Gates (all green, tails)

- dev-smoke :5241 → 200 (rewritten page); server killed by PID 88157, port free (exit 143
  confirmed via task notification — process recovered).
- `verify:docs-universal` → `GREEN: 110/110 component pages render the shared universal
  section (110 markers)` (marker survives via the meta path).
- `verify:tailwindless` → `✓ GREEN — 2 class-bearing files … identities=7 occurrences=7
  zones={routes:1, site-libs:0, ui:6}` — receipt byte-unmoved.
- Affected specs solo: component-canvas-floor + variant-grammar 18/18 (chip lab pin:
  3 output rows, first `tonal`, derived source link, tree drawer); canvas-same-source +
  props-table-meta-drift 72/72; chip family specs 30/30; final sweep 90/90 across the four.
- svelte-check scoped: chip files → 1 standing error, the `cx` `Object.entries` narrowing
  pattern this page shares byte-identically with badge.html:136 and blockquote.html:87
  (baseline parity, zero delta — the old page carried the same one); `chip.docs.ts` clean.
  My one NEW error during the round (`TokenTable source: 'theme'`) fixed to `'structural'`.
- `verify:docs` (fresh `vite build` ×3 during the round) → `✓ all docs pages pass the
  skeleton lint (staged scope green)`, zero chip findings (Install/See-Also/Usage order all
  clean).
- Coordinator laws applied: query() always with a base (the single-arg failure mode is
  structurally absent — inference + base literal, svelte-check clean); every broadcast/
  supply claim carries a named-consumer grep receipt (radius → press-button.css concentric
  calc + card/tooltip/menubar; color → press-button.css slot re-derivation + jx-pure.css;
  elevation/motion → NEGATIVE receipt, only the :root invariants at jixoai.css:423-424).

## Process evidence

- SSR carrier stamps grepped from the served page BEFORE writing any prose:
  `--jx-size-effective: 14px; font-size: var(--jx-size-effective, 1rem); --jx-density-coefficient: 1`
  + `data-density="sm"`; `--jx-radius-effective: 10px; --jx-color-effective: var(--jx-color-primary)`.
- Computed-style probe of all 8 rewritten panels (probe3): size14 {font 14px, h 20},
  sizeLarge {font 18px, h 20}, denSmall {data-density sm, font 11, pad 8, h 18}, den15
  {no attr, h 20}, themeDark {class dark, dark-profile bg}, queryCase {16px at md},
  colorError {primary tint}, hueError {error tint}; outline probe [].
- Live A/B on the served CSS: `.dark` class flip re-hues fill; `--jx-color-effective: error`
  leaves the tint; coefficient 1.5 leaves the box; `--jx-elevation-effective: 4` leaves the
  shadow.
- Worktree shared-tree hygiene: only my three files touched
  (`chip.html/+page.svelte`, `chip.html/+page.ts`, `props-table/docs/chip.docs.ts`); NO
  commits, NO push. Screenshots: /tmp/quill-chip-axes.png (per-axis table),
  /tmp/quill-chip-canvas.png (the 8-panel axes canvas, post-fix).
