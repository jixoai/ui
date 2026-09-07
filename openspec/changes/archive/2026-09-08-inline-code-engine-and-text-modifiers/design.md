# Design: inline-code engine upgrade + the fused/solid rework + the text modifier kernel

Worktree `jixoai-ui-inline-code-r4` (branch `inline-code-r4` off main
`e581e647`). Every ruling below is Owner-locked unless marked
implementer-set.

## D1 — the engine seam (asks 1 + 2)

**Resolution chain** (code-card's seam verbatim, `code-card.svelte:154`
precedent):

```
backend prop → getContext(HIGHLIGHT_KEY)?.backend → DEFAULT_MICROLIGHTER_BACKEND
```

- `DEFAULT_MICROLIGHTER_BACKEND` is a new singleton export of
  `lib/highlight/microlighter.ts` (`microLighter()` is stateless —
  id/product), mirroring `DEFAULT_SHIKI_BACKEND`'s posture.
- The chip keeps NO shiki import: the token-span `$effect` +
  `tokenPaint` snippet + `InlineToken` type all retire. Detection
  (`detectInlineLang` + tables) stays — it is ours, sync, and
  zero-download.
- **The pre-gate** (implementer-set, honors the Owner's 纯文本降级
  ruling): the chip checks `CSS?.highlights && typeof Highlight ===
  'function'` BEFORE calling the backend; unavailable ⇒ stay plain,
  no call, no console noise (jsdom + old Safari). Print degrades by
  a SEPARATE mechanism — the pre-gate passes there, but ranges do
  not survive the freeze clone (microlighter.ts's documented
  limitation). The adapter's own gate stays as defense-in-depth.
- **Lang resolution**: `explicit → (auto: detectInlineLang) → ''`;
  `PLAIN_LANGS` short-circuits; empty/'' skips the backend. The
  resolved id is passed through `opts.lang` (the adapter lowercases
  and stamps `dataset.language` itself; microlighter's grammar miss
  degrades silently — its documented bundler/miss contract).
- **The anchor generalization** (highlight core, minimal): the
  adapter's theme stamp becomes `(el.closest('pre') ?? el)
  .setAttribute('data-syntax-theme', theme)` — a non-`pre` surface
  anchors on itself. The chip already carries the `--tok-*` palette
  (tokenPalette), so `[data-syntax-theme='jixoai']`'s `--syntax-*`
  bridge resolves chip-side with ZERO new paint surface.
- **rAF coalescing** (highlight core): `highlightAll` replaces every
  registered range set, so N chips mounting synchronously would scan
  N times. The adapter queues scans: one `requestAnimationFrame`
  (microtask fallback when rAF is absent) drains all waiters after a
  single `highlightAll`. Correctness unchanged (each element keeps
  its `dataset.language`; the last scan re-covers all); the
  `highlight()` promise resolves after the shared scan.
  - **The scan selector** (found live in the vision pass):
    microlighter's DEFAULT selector is `pre > code` — a bare chip
    never matches, the scan returns zero elements with ZERO console
    signal (its documented miss posture). The scan passes
    `selector: 'pre > code, code[data-language]'`: card codes and
    chip codes alike resolve, and an app element carrying
    data-language paints too (the engine's own opt-in contract).
  - **Probing note**: `CSS.highlights` is a Maplike — `Object.keys()`
    on it is ALWAYS empty; live probes must read `.size` / `.keys()`
    (a false "empty registry" sent the first review down a wrong
    path; the selector defect was real, the measurement was not).
- **Single-text-node contract**: the adapter's `el.textContent = code`
  reset already guarantees it; the chip's children snippet renders
  once, the effect snapshots `textContent`, the backend re-sets the
  same string — reactive children mutations re-render as authored
  (remount to re-detect; unchanged posture).
- **registry edges**: inline-code drops npm `shiki` + registry
  `@jixoai/shiki`; gains registry `@jixoai/highlight` +
  `@jixoai/highlight-microlighter` (the npm `microlighter@^2.1.0`
  rides the engine item, the matrix's per-item dependency law).
- **Bundler note surfaces in docs**: microlighter's vite contract
  (dev `optimizeDeps.exclude`, grammar assets at build) moves from
  "code-card engine option" to "the CHIP's default engine" — the
  inline-code docs page carries the same note (the docs site's
  vite.config already satisfies it for the www app).

**Markdown wiring (ask 1)**: both `InlineCode` call sites
(markdown-node.svelte:318 and the html `<code>` equivalence site
:412) drop `lang="text"`. The map comment (:20) and the living spec's
`inline_code` sentence amend with it. Streaming posture: detection
is sync + zero-download; the range highlight is the async in-place
upgrade (SSR plain, zero layout shift, no per-span keyed work).

## D2 — fused joins the ladder (ask 3, front half)

- `PaintVariant` (lib/paint.svelte.ts:49) becomes
  `'fill' | 'tonal' | 'outline' | 'ghost' | 'link' | 'fused'`;
  `ZonePaintVariant` (Exclude link) inherits `fused` automatically.
- config `paintVariantUnion` += `"fused"` (the A4-union-not-subset
  gate mirror); `frozenAvailability['inline-code']` becomes
  `{variants:['fused','tonal','outline'], own:'fused'}`.
- The slot: `definePaintSlot(['fused','tonal','outline'], 'fused')`.
- **Semantics** (vg page + spec wording): fused is the
  backdrop-fusion rung — paint derived from the ground behind the
  element (the separator's ink technique promoted to chip paint),
  the quietest rung; zero own color, zero border, foreground ink.
  It sits after ghost/link in the ladder listing with its own line,
  not stuffed between prominence neighbors.
- **The paint** (implementer-tuned, vision-validated): transparent
  background + a backdrop contrast filter + NO visible border — the
  shared base keeps its width-only `border`, fused colors it
  `border-transparent` (a colorless width-only border would paint
  currentColor), and forced-colors repaints the same frame
  `border-[color:CanvasText]` so the degrade is visible (a
  border-color alone with no width paints nothing — the frame law):
  the fusion IS the frame. Form (to tune against both
  themes + a patterned backdrop on the docs page):

  ```
  bg-transparent border-transparent backdrop-contrast-[…%] text-foreground forced-colors:border-[color:CanvasText]
  ```

  contrast(<1) pulls the backdrop toward mid exactly like the
  separator's ghost (the exact % lands in review — separator uses
  0.5; a chip's band may want subtler). Print: backdrop-filter
  degrades to transparent (the chip reads as bare mono code —
  acceptable, the separator's own print posture). forced-colors:
  the CanvasText border keeps the chip readable.

## D3 — separator fused/solid (ask 3, back half)

- Literal slot: `['fused','solid','dashed','dense','dotted','wavy',
  'fade']`, own **fused**. The rename is zero-CSS: the base strip's
  selector is `:where([data-jx-separator][data-orientation=…])` —
  value-agnostic presence.
- **solid** (ink-law amendment, Owner 2026-09-08): a new rule
  `:where([data-jx-separator='solid'][data-orientation=…])` with
  `backdrop-filter: none; background: var(--border);` per
  orientation (block/inline sizes inherit the base strip). The
  design-tokens delta adds the exception to the subtraction ink
  law's named-exception list (scrim family, state-carrying lines,
  and now the separator's OWN solid variant: subtraction is the
  default ink, solid is the plain-fill escape for grounds where the
  ghost's exact-mid blind spot or a patterned backdrop defeats it).
- **The sweep**: every `variant="line"` usage, `data-jx-separator=
  "line"` literal, docs copy, and test pin across registry + www +
  blueprints renames to `fused` (archive/ changes are frozen
  history — untouched).

## D4 — the density radius ladder (ask 4)

Owner-set: default mode 4px; 2px/8px around it. Mapping (locked in
plan review): **2xs/xs/sm → 2px, default → 4px, lg → 8px**.

Channel (the `--jx-inset` authoring pattern, theme density ladder):
primitives `--jx-density-chip-radius-{2xs:2px, xs:2px, sm:2px,
default:4px, lg:8px}` + every density scope gains
`--jx-chip-radius: var(--jx-density-chip-radius-…)` — INCLUDING the
root/default block
`:where(:root:not([data-density]), [data-density='default'])`
(jixoai.css:2104): that block IS the no-ancestor case, so the root
resolves 4px (the Owner's "default 模式 4px"), never the lg
primitive. The chip's `rounded-(--radius)` becomes
`rounded-(--jx-chip-radius)`.

Why a token and not a JS map: ambient density flows as an ANCESTOR
css scope — `d.density` is undefined when riding ambient, so the
component cannot key a JS ladder off it. The custom property
inherits down from the ambient scope AND applies when the chip
stamps its own explicit `data-density` (self-match on the same
`:where` block) — one channel, both paths. `--radius` (the global
corner token, 0px/8px-corner-shape) decouples: the Owner's ask
overrides the fleet corner for the chip.

## D5 — the text modifier kernel (ask 5)

New file `registry/files/lib/text-style.svelte.ts`. **Shipping
decision**: the file lists under the TEXT item (it is the text
kernel — `@lib/text-style.svelte.ts` in the text item's files), and
inline-code's `registryDependencies` gains `@jixoai/text` (the edge
pulls the file into the chip's install) — the same shape as a family
reusing another item's file through a registry edge. No new
registry item is minted.

API:

```ts
export interface TextStyleProps {
  lineHeight?: number | string;   // number ⇒ unitless ratio, string ⇒ verbatim
  weight?: string;                // '450' | 'bold' … ⇒ font-[…] / named map
  italic?: boolean;
  tracking?: string;              // '-0.02em' | 'wide' …
  family?: string;                // font-family value or stack name
  fontSize?: string;              // CSS length
}
export function resolveTextStyle(props: TextStyleProps): string;
// → 'leading-[1.5] font-[550] italic tracking-[-0.02em] font-[family-name:…] [font-size:12px]'
```

- `fontSize` uses the arbitrary-property form `[font-size:…]`
  (consistent with the chip's own token form); bare `size` naming is
  BANNED (AXIS_PROPS collision).
- `weight`: numeric strings ride `font-[450]`; the named set maps to
  the utilities (`font-medium` …) when they exist, else arbitrary.
- `family`: verbatim arbitrary `[font-family:…]` (no stack registry
  this round).
- Absent prop ⇒ NO utility ⇒ the ambient channel flows (the law
  below).
- **text.svelte**: Props += the six (rest-spread untouched); class
  merge order: `forms.utilities + resolveTextStyle(mods) +
  className` — consumer LAST, modifiers AFTER the form's own
  utilities (a consumer overriding italic with not-italic still
  wins).
- **inline-code.svelte**: same six props; `fontSize`/`lineHeight`
  feed BOTH the paint utilities AND the padding calc (D6).
- The eight sugars pass through (`{...rest}`) — zero changes beyond
  typing.
- **The ambient-scale amendment** (component-authoring delta): "NO
  font-size utilities anywhere" becomes "absent = inheritance (the
  trio/prose laws untouched); an EXPLICIT modifier prop emits its
  utility — explicit beats ambient". The interplay ruling recorded
  with it: an explicit member `lineHeight` utility (utilities layer)
  beats the prose scope's leading residue (components layer) — the
  layer law's own posture, now written down for the text family.
- props-table: LEGACY arrays + `text.docs.ts` descriptions for the
  six (main text entry only — the sugars inherit through the table's
  family grouping; the drift gate's real exemption field is `hide`,
  applied per-sugar only if the gate demands rows the sugars cannot
  honestly fill).

## D6 — the padding-inline formula (ask 6)

`padding-inline = radius + fontSize × (lineHeight − 1) / 2`
(equivalently `radius + (lineBox − fontSize) / 2`).

**THE CHANNEL PIVOT (vision pass, live-found)**: the arbitrary-utility
form NEVER survived Tailwind's source scanner — the long nested calc
generated zero CSS (and dynamic assembly never can); every chip
rendered with 0 padding. The formula moved to a folder css
(`inline-code.css`, the separator D1-exempt precedent): ONE
`:where([data-jx-inline-code])` rule over custom properties with
token fallbacks —

```css
padding-inline: calc(var(--jx-chip-radius) +
  (var(--jx-code-line, var(--jx-line-secondary))
    - var(--jx-code-fs, var(--jx-text-secondary))) / 2);
```

— and the component MIRRORS explicit modifier props onto
`--jx-code-fs` / `--jx-code-line` through the style attribute (the
only channel that carries runtime literals past the scanner):
`fontSize="12px"` → `--jx-code-fs:12px`; `lineHeight` number →
`--jx-code-line:calc((fs) * ratio)` (fs = the explicit fontSize or
the token var); `lineHeight` string length → verbatim (it IS the
line box). Absent props emit nothing and the fallbacks read the
density pair — ONE rule serves every mode, stays density-exact
(radius is a var everywhere), and `:where()` keeps consumer padding
utilities winning (the layer law). The style attribute sits before
the rest spread (a consumer's own style wins wholesale). Live
verified: default chips compute 7px at the worked-example settings.
`[padding-inline:var(--jx-inset)]` (the old form) RETIRES.

## D7 — mirrors + gates + docs

- Byte-mirror to `apps/www/src/lib/**` (gen-mirror-manifest).
- `component-metadata-gen` ×3 (inline-code, text, separator).
- vg docs page (`docs/components/variant-grammar`): ladder table row
  for fused + the inline-code row's own changes + separator literal
  table (fused/solid).
- ambient matrix page: separator bareDefault line→fused mirror (find
  the exact mirror during the sweep).
- docs pages: inline-code (engine section rewrite — backend prop +
  microlighter default + degrade; fused demo; radius ladder demo;
  modifier demo; padding formula note), separator (fused rename +
  solid demo), text (modifier matrix demo).
- Tests (see tasks): inline-code.spec rewrite, markdown-render pins,
  separator specs, text specs, props-table-meta-drift LEGACY rows,
  canvas-same-source snapshots (docs pages changed ⇒ `-u` regen) —
  AND the two default-pinning suites the review surfaced:
  `paint-zone-availability.spec.ts` (inline-code zone fallback
  'tonal' → 'fused', :27/:42/:6) and `defaults-w4-content.spec.ts`
  (inline-code own 'tonal' → 'fused', :10/:64-67/:123/:259-260).
  The markdown item's install-facing copy moves with D1:
  registry.json :1191 (description) + :1240 (docs) + the markdown
  docs page's construct-table row (markdown.html/+page.svelte:519).

## Risks

- microlighter's whole-document scan over a markdown page with dozens
  of chips — mitigated by D1's rAF coalescing; the vision pass
  watches the docs page for jank.
- The fused chip on a plain page background is nearly invisible BY
  DESIGN (backdrop fusion on a flat ground = the ghost's own quiet);
  the docs demo must show it over textured/tonal grounds where it
  reads. If review finds the default unreadable in prose-on-white,
  the tuning knob is the contrast %, not a revert.
- The A4 gate chain (union ⊆, values ≡ frozen, own ≡) — every link
  moves in ONE commit or the gate is red mid-change; lane order
  puts the config+slot+type edit together.
