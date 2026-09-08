# Design: the canvas playground dock

Worktree `jixoai-ui-canvas-dock` (branch `canvas-playground-dock` off
main `0eac689e`). Baseline explorer facts (verbatim-anchored in the
parent session): component-canvas.svelte is 969 lines (module script
107-243 = schema kernel; instance script 245-590; markup 592-969; the
playground aside = 722-884, output dl = 862-882, schema fields =
755-859); component-canvas.css 337 lines (side/below tiers 88-154,
fields width laws 177-235); the site kit at apps/www/src/lib/playground/
(PlayFields = plain grid, PlayRow = ItemField bridge, PlayHelp = prose
footer); ItemGroup at registry/files/ui/list-item/item-group.svelte
(mode/density/ruler/dividers/**controlChrome 'integrated'**/label
props, the B5 integration where the group frame is the sole surface
owner and in-row control shells dissolve); drag precedent carousel.svelte
:116-181 (pointerdown + setPointerCapture + delta math); collapse
precedent = the canvas's own code drawer (grid-rows 0fr→1fr + inert).

## D1 — the dock component (canvas-playground.svelte)

**AMENDMENT (Owner, mid-flight 2026-09-08): the dock head is the
unified chrome standard.** The canvas header's theme/density
toggle-groups MOVE INTO the dock head, and the dock mounts on EVERY
canvas (not only playground-carrying ones). The head row is EXACTLY
(Owner's sketch, normative — no fifth element):

```
collapsed:  [drag-grip-icon, theme-toggle-icon-button, size-select, →]
expanded:   [drag-grip-icon, theme-toggle-icon-button, size-select, ↓]
            [ body … ]
```

- drag-grip: decorative (aria-hidden) — the drag affordance icon.
- theme-toggle: ONE icon button flipping light↔dark (icon swaps
  sun/moon from the icon set), `aria-label="Toggle theme"`,
  `aria-pressed` carries state; the canvas `theme` prop stays bindable
  'light'|'dark', the dock flips it.
- size-select: a compact native SELECT (not a group) with the
  REPO-STANDARD Density vocabulary **xs | sm | default | lg**
  (`import type { Density } from '$lib/density.svelte'`). The canvas
  `density` prop TYPE CHANGES from 'comfortable'|'compact' to Density;
  the stage stamps `data-density={density}` DIRECTLY (the old
  compact→sm / comfortable→default mapping is deleted). Dock default:
  'default'. `aria-label="Density"`.
- The collapse chevron button renders ONLY when the dock HAS a body
  (playground || schema || output?.length); body-less canvases ship
  the chrome row alone — no chevron, no expansion. This makes the
  canvas header's loss of theme/density honest: the header keeps
  title/description/install/source.
- The icon-only reset moves OUT of the head into the BODY foot row
  (next to the output dl) — still shown only when onreset || rows.
- Ripple: `@jixoai/toggle-group` leaves the item's
  registryDependencies (no family import remains); the floor-spec
  toggle-group assertions re-pin to the icon button + native select.

Props (the canvas passes everything through; the dock never reads
context itself):

```ts
interface Props {
  title: string;                       // aria context only
  theme?: 'light' | 'dark';            // $bindable — the head's icon button flips it
  density?: Density;                   // $bindable — the head's select (xs/sm/default/lg)
  playground?: Snippet;                // consumer controls (precedence)
  rows?: ControlRow[];                 // schema-lowered rows
  schemaDefaults?: Record<string, unknown>;  // reset fallback
  values?: Record<string, unknown>;    // $bindable — schema state machine lives HERE
  onvalue?: (key, value) => void;
  onreset?: () => void;
  output?: readonly PlayOutput[];
  class?: string;
}
```

- **Pose**: `position: absolute; inset-block-start: var(--jx-gap);
  inset-inline-end: var(--jx-gap);` inside the stage-row (which gains
  `position: relative`); `translate: var(--jx-dock-x, 0px)` for the
  drag; width `clamp(240px, 30cqi, 300px)`; the dock is a bordered
  surface card (bg var(--background), border, a soft shadow tier)
  floating OVER the stage's top-right corner. The stage-row is the
  positioning context so the dock never scrolls with stage content.
- **默认展开** (ruling): `let open = $state(true)`. The head row is
  the four-element chrome cluster the amendment defines above (grip,
  theme button, density select, chevron — the chevron only when the
  dock HAS a body; the old "Playground" eyebrow label died with the
  standardization). Body collapse rides the code-drawer pattern
  (`grid-rows-[0fr]→[1fr]` + `inert={!open}`); collapsed state = the
  head chip alone.
- **Drag**: on the HEAD row, pointerdown records `clientX` +
  current `--jx-dock-x`; `setPointerCapture`; pointermove writes
  `--jx-dock-x` clamped to `[ -(hostWidth - dockWidth - insets),
  +inset-inline-end base ]`… concretely clamp so the dock's box stays
  inside the stage-row: measured via
  `host.getBoundingClientRect()` vs `dock.getBoundingClientRect()` at
  drag start. `<4px` total displacement on pointerup ⇒ treat as
  click (toggle); ≥4px ⇒ drag, no toggle. Touch-action: none on the
  head (the drag is horizontal-only; vertical gestures pass through
  to scrolling? NO — `touch-action: pan-y none`… keep
  `touch-action: none` on the head so horizontal drag doesn't scroll;
  the head is small so vertical scroll loss is negligible).
  Position is transient per canvas instance (no persistence).
- **Composition** (the Owner's core ask): the expanded body renders

  ```svelte
  <ItemGroup mode="plain" controlChrome="integrated" density="sm">
    {#if playground}{@render playground()}
    {:else}{#each rows as row}…Item+ItemField adapters…{/each}
    {/if}
  </ItemGroup>
  ```

  — mode='plain' (the dock card IS the host surface),
  controlChrome='integrated' (frame sole owner, shells dissolve —
  the B5 posture), density sm for the compact dock. The schema-row
  adapters (ItemToggle/ItemSelect/ItemInput + the stepper/segmented
  control snippets with their ctlId ids) migrate VERBATIM from
  component-canvas.svelte 755-859 into this file; the schema state
  machine (setValue/resetValues/rowValue/stepValue/stepText +
  generation of values) migrates with them (the canvas keeps ONLY the
  kernel import for rows/defaults derivation).
- **Output**: the `<dl>` + formatOutput move to the dock foot
  (unchanged semantics: never a live region).
- **A11y**: the dock keeps `aria-label="Controls for {title}"` on a
  complementary-ish region (`aside` role stays honest); toggle carries
  `aria-expanded`; focus-visible rings carried over from the residue
  sheet; drag is pointer-only and decorative — every function
  (toggle/reset/controls) is keyboard-reachable without position.
- **Pointer law**: the dock root takes pointer events; nothing else
  (no overlay shim) — the stage underneath stays interactive.

## D2 — kernel extraction (canvas-schema.svelte.ts)

Move VERBATIM from component-canvas.svelte's module script (117-243):
CanvasXUI/CanvasSchemaProp/CanvasSchema/ControlKind/ControlRow types,
SEGMENTED_MAX/BLOCK_DESCRIPTION_LENGTH, feasibleControl, controlsFor,
schemaDefaultsOf — into
`registry/files/ui/component-canvas/canvas-schema.svelte.ts`. The
canvas module script becomes `export * from './canvas-schema.svelte'`
+ its default component export (public surface byte-stable for
consumers); `$lib/schema/schema2form.ts` (the site mirror) re-points
its import to the kernel file; the dock imports ControlRow from the
kernel. PlayOutput/TreeFile/inferTreeLang STAY in the canvas (they
are canvas concerns; the dock re-imports PlayOutput's type from the
canvas module — no, kernel file gets PlayOutput too: it is a
playground concern. Decision: PlayOutput moves to the kernel file
with a re-export from the canvas).

## D3 — canvas slimming + css

- Template: the entire aside region (722-884) replaced by

  ```svelte
  {#if playground || schema}
    <CanvasPlayground {title} {playground} rows={schema ? rows : undefined}
      schemaDefaults={schema ? defaults : undefined}
      bind:values onvalue={onvalue} onreset={onreset} {output} />
  {/if}
  ```

  mounted INSIDE the stage-row div (sibling after the scroll layer).
- `pane` prop retires from Props + destructure + the `data-pane`
  stamp; the one consumer page swept (rg `pane=` under routes).
- css deletions: the ≥48rem stage-row grid + pane column law
  (88-95), pane side containment (96-118), drawer side-by-side tier
  keeps BUT detrees from the pane (the drawer panels grid stays —
  verify it doesn't depend on the pane grid), below-tier (137-154),
  `.jx-canvas-fields` + row tightening + pane-width law (177-235).
- css additions (residue-only law): the dock pose rule
  (`:where([data-jx-canvas-dock])` position/clamp/translate var +
  internal `max-block-size` + body scroll), the collapse grid
  transition, drag cursor on the head (`cursor: grab` /
  `[data-dragging]` → grabbing), the head `touch-action: none`,
  focus rings + reduced-motion carried. Stage-row gains
  `position: relative` (one utility in markup, not css).

## D4 — kit unification (site side, 99 pages API-stable)

- `play-fields.svelte`: the root div becomes
  `<ItemGroup mode="plain" controlChrome="integrated">` (keep the
  uid context + data-cols passthrough via class); the grid geometry
  (1/2 cols) rides ItemGroup's own list layout — cols=2 becomes a
  two-column ItemGroup? NO — keep it honest: ItemGroup is a single
  list; cols=2 wraps rows via the grid on the UL through a class.
  Minimal: ItemGroup + `class={cols === 2 ? 'jx-play-cols-2' : ''}`
  with a tiny residue rule for the 2-col grid. cols=1 (the default
  everywhere) gets the ItemGroup rhythm for free.
- `play-row.svelte`: gains the Item row shell —
  `<Item variant="auto"><ItemField …/></Item>` (auto → chrome none
  inside the integrated group; the ItemField bridge stays
  verbatim).
- `play-help.svelte`: unchanged component; playground.css tunes it
  into the dock's compact footnote (smaller block padding, the top
  hairline stays).
- `playground.css`: the `.jx-play-fields` grid rules retire (the
  ItemGroup owns layout); seg/range/help rules stay.

## D5 — pages, gates, tests

- The ONE `pane=` page swept (find via rg; the steps page per the
  css comment).
- component-canvas docs page: the recursive workbench demo reworks —
  the outer canvas shows the dock (expanded default), the inner
  canvas's conditional playground snippet demo stays meaningful
  (dock appears/disappears); copy updated (no pane vocabulary).
- Specs to sweep: rg in apps/www/test for
  `jx-canvas-playground|jx-canvas-fields|data-pane|pane=` —
  re-pin to the dock structure. NEW spec
  `canvas-playground.spec.ts`: default expanded; toggle collapses
  (aria-expanded, inert body); reset wired (onreset || schema
  fallback); output rows render; schema rows render as ItemGroup
  rows (data-slot=item-row hooks); snippet precedence; drag =
  pointer-math unit (clamp function exported pure, tested
  table-style — the toast-swipe precedent); jsdom-safe (no real
  pointer capture needed for the non-drag assertions).
- vision snapshot regen (structural change, `-u`), mirror sync +
  manifest, meta regen for component-canvas if its meta pins props
  (pane removal → props-table LEGACY row update).
- The canvas-schema spec delta: "the canvas renders controls from
  jsonSchema" requirement MODIFIED (controls render INSIDE the
  floating dock; ItemGroup integrated posture; pane retired).

## Risks

- 104 pages' visual rhythm changes at once — the vision pass sweeps
  representative pages per route type (playState flagship, plain
  PlayFields, schema flagship, no-playground).
- The drawer's wide-tier grid (119-134) may visually depend on the
  pane grid — verify at implementation; the drawer is BELOW the
  stage-row (a sibling), so it should be independent.
- Stage top-right content (demos with controls in that corner) gets
  covered while expanded — accepted (the Owner chose 默认展开);
  collapse is one click; drag relocates.
