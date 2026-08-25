# design — density-adoption

> AUTHORITATIVE contract, transcribed from the converged Codex r2
> spec (9.2/10). SELF-CONTAINED together with its sibling
> **packet-manifest.md** — the single exact ownership source for
> every packet (full relative paths, no ellipses, no external
> pointers); the orchestrator's path check reads ONLY that file. One
> public seam: ONE policy prop (`density`), ONE resolver, ONE
> inherited alias interface (`--jx-d-ctl-*`).

## 1. Resolver and provider map

```ts
export function resolveDensity(
  explicit: Density | undefined,
  inherited: DensityContext | undefined,
  fallback: Density = DEFAULT_DENSITY,
): Density;
// explicit -> inherited -> local fallback. The fallback NEVER shadows
// inherited context: a Table with no parent resolves sm; the same
// Table under an explicit lg provider resolves lg.
```

The provider object stays ONE stable getter-backed object under ONE
Symbol; the module performs policy only (no pixels, no style writes).
`density?: Density` is the policy prop in every family; there is NO
`size?: Density` alias; visual `size` is permitted only for identity
geometry that is not a control footprint (Avatar is the example).

| owner | local fallback (no parent) | public prop | Svelte action | CSS stamp |
|---|---:|---|---|---|
| `:root` / theme | `default` | none | no provider | root default scope |
| `ItemGroup` | `default` | `density?` | one getter-backed provider | frame + `ul` |
| menu roots (DropdownMenu, Menubar, NavigationMenu) | `default` | `density?` | one per root | trigger/frame + panel |
| Command / combobox-like roots | `default` | `density?` | one per palette | root + surface panel |
| `Table` | `sm` | `density?` | one per table | table frame + body |
| standalone/composite controls | `default` | `density?` (local override only) | consume inherited; never provide unless declared a policy root | resolved control root/lane |
| Item, ItemField, list-item adapters | inherited | `density?` | consume; explicit wins | resolved row/item stamp |
| terminal family | terminal fallback | none this wave | no provider | chrome consumes `--jx-d-*` only |
| `.jx-pure` | `default` | HTML `data-density` only | no JS | css scope |

Composites resolve ONCE and stamp every root that can be moved or
ported (top-layer panels keep Svelte context but CSS inheritance
follows DOM — panel roots carry their own `data-density` stamp).

## 2. The control contract (aliases only — no second scale)

Every density scope adds:

```css
--jx-d-ctl-text: var(--jx-d-text);
--jx-d-ctl-line: var(--jx-d-line);
--jx-d-ctl-pad: var(--jx-d-inline-inset);
--jx-d-ctl-gap: var(--jx-d-inline-gap);
--jx-d-ctl-row: var(--jx-d-row-min);
--jx-d-ctl-hit: var(--jx-d-hit-min);
--jx-d-ctl-icon: var(--jx-d-media-icon);
--jx-d-ctl-toggle-h: var(--jx-d-line);
--jx-d-ctl-toggle-w: calc(var(--jx-d-ctl-toggle-h) * 2);
--jx-d-ctl-toggle-knob: calc(var(--jx-d-ctl-toggle-h) - var(--jx-ruler-unit));
--jx-d-ctl-range-track: max(var(--jx-ruler-unit), calc(var(--jx-d-ctl-line) / 2));
--jx-d-ctl-textarea-min: max(var(--jx-d-ctl-hit), calc(var(--jx-d-ctl-line) * 3 + var(--jx-d-stack-gap) * 2 + 2px));
--jx-d-ctl-color-lane: max(var(--jx-d-ctl-hit), calc(var(--jx-d-ctl-icon) + var(--jx-d-ctl-pad) * 2 + 2px));
```

(The `2px` terms are the two-border allowance, not density.)

```text
text = ctl-text · line = ctl-line · inline pad = ctl-pad
between parts = ctl-gap · structural row = ctl-row
interactive lane min-block-size = ctl-hit · visual glyph = ctl-icon
toggle = 2·line × line; knob = line − U
range rail = max(U, line/2); thumb = ctl-icon
```

Text/select/button shells: hit+pad+text+line+gap (no `min-h-10`/
`py-2`/`px-3`/`text-sm` in density-owned selectors). Checkbox/radio:
a PHYSICAL label/wrapper activation lane at `ctl-hit` with the visual
square at `ctl-icon`. Toggle: hit lane + `ctl-toggle-w×h` track.
Number steppers: independent `ctl-hit` targets. Range/color triggers:
`ctl-hit`; rail/thumb/swatch from visual aliases. OTP slots:
`max(ctl-hit, 2·ctl-line)`. Menu/command options KEEP the hit floor
while rhythm follows density.

DIE (no aliases): `controlSize`, policy-bearing `size`, `ItemSize`,
`data-size`, `--jx-toggle-w/h`, independent `--jx-file-*` geometry,
`jx-range-sm/lg`, density-owned literal dimensions. A family private
property is legal only as a one-line alias to `--jx-d-ctl-*`.

## 3. jx-pure v2 vocabulary (breaking, sanctioned)

Keep: `.jx-field` · `.jx-label` · `.jx-error` (accurate names).
Rename (NO deprecated aliases):

```text
.jx-input       -> .jx-control
.jx-field-shell -> .jx-control-shell
.jx-input-lane  -> .jx-control-lane
.jx-range       -> .jx-slider
.jx-color-field -> .jx-color-shell
.jx-color       -> .jx-color-swatch
.jx-color-stretch -> .jx-color-expand
```

`.jx-slotted` stays a structural state stamp; range size classes
disappear. Derivations: `.jx-field` gap = stack-gap; label/error ride
secondary aliases (uppercase/tracking are VOICE, not density);
control+shell = hit/pad/text/line/gap; lane chromeless, valid/invalid
insets = ctl-pad; slider = ctl-range-track + ctl-icon; color shell =
ctl-color-lane (expand = the explicit full-width posture); Tier-0
buttons use the aliases (default interactive lane derived, not
hard-coded 40px); `.jx-pure` sets scoped `font-size: var(--jx-d-text)`
+ `line-height: var(--jx-d-leading)` — `body` untouched. Display
headings, color-map dimensions, icon alpha geometry, borders/outlines,
degradation rules: explicit registry exceptions.

## 4. Packet ownership

THE exact per-packet file lists live in **packet-manifest.md** (same
directory) — verbatim, full paths, mechanically checkable; the
orchestrator's path check reads ONLY that file. This section
summarizes roles. `P(ui/foo/{a,b})` = the listed files under BOTH
trees (byte-identical pairs). Family agents own ONLY their docs
page's canvas/demo sections; shared layout/ToC is orchestrator-owned.

**K0** (single owner, before concurrency): `P(theme/jixoai.css)` ·
`P(lib/density.svelte.ts)` · `P(ui/list-item/{index,item.css,item,
item-actions,item-after,item-checkbox,item-chevron,item-content,
item-description,item-divider,item-end,item-field,item-footer,
item-group,item-header,item-input,item-media,item-radio,item-select,
item-title,item-toggle})` · `openspec/specs/{design-tokens,
css-architecture,component-authoring}/spec.md` ·
`scripts/verify-density-kernel.mjs` · `scripts/verify-density-adoption.mjs`
(new) · `scripts/density-adoption-registry.mjs` (new) ·
`scripts/verify-item-ruler.mjs` · `apps/www/test/{density-context,
list-item,list-item-field}.spec.ts` · the list-item docs route pair.
K0 gates: resolver tests (explicit/inherited/fallback, parent-lg+
Table→lg, no-parent Table→sm, getter reactivity, policy-only);
kernel 59 table + 2 scanner checks; ruler 18/18; matrix 37/37;
zero `controlSize`/`ItemSize`/public `data-size`/policy `size` in
both trees; NO manifest or registry-index edits in K0. K0 closes the
§7 residuals.

**F** (after K0, before A–E): `P(theme/jx-pure.css)` ·
`openspec/specs/jx-pure/spec.md` · `scripts/verify-jx-pure.mjs` ·
`apps/www/test/jx-pure-parity.spec.ts` · the jx-pure docs route pair ·
`blueprints/scenes/{jx-pure,native-form}.svelte`. F gates:
canonical/mirror equality; v2 names only; four scopes; layer
precedence; dark/light, forced-colors, reduced-motion, shadow-root,
Tier-1 consume-only proofs; the complete 65-check browser run.

**A form-text**: `P(ui/{input,textarea,select,native-select,
number-input,tags-input,input-otp,file-input}/…)` (each family's
component+index+css as listed in the r2 §4) ·
`apps/www/test/density-adoption-form-text.spec.ts` (new) · the eight
families' docs route pairs · their blueprint scenes (+form-field).
Gates: inheritance/stamps per root; shell/OTP/chip/stepper hit
geometry at xs/default/lg; registry packet A; mirror equality; docs
density ladder with a real click-target probe.

**B form-boolean**: `P(ui/{checkbox,radio,toggle,toggle-group,range,
color-picker}/…)` · its test/docs/scenes. Gates: wrapper activation
rectangles ≥ ctl-hit with squares at ctl-icon; toggle equations;
footprint size/controlSize absent; range keyboard/pointer green;
color map allowlisted structural.

**C buttons+navigation**: `P(ui/{press-button,icon-button,
float-button,anchor,pagination}/…)` · its test/docs/scenes. Gates:
every interactive body at ctl-hit; press/bevel/focus/icon-composition/
link/pagination laws hold; registry packet C.

**D menus**: `P(ui/{dropdown-menu,menubar,navigation-menu,command,
popconfirm,breadcrumb}/…)` · its test/docs/scenes. Gates: trigger +
nested panel roots stamp resolved density; row hit floors; keyboard
roving/light-dismiss/motion/alignment green; four scopes +
root-default + inherited-parent probes.

**E data+status**: `P(ui/{table,tabs,descriptions,statistic,badge,
kbd,empty,result,timeline,steps}/…)` · its test/docs/scenes. Gates:
unparented Table→sm, parent-lg Table→lg; cells/tabs/descriptions/
labels/indicators consume aliases; column/overflow + structural media
allowlisted; registry packet E.

**G continuity**: `blueprints/scenes/density.svelte` (+ registration
if needed); generated SVGs only via build:blueprints. G owns the
final build, parity, all gates, and the Owner walkthrough.

## 5. The adoption registry and proof gates

`scripts/density-adoption-registry.mjs` — each row IS a contract:

```text
family · canonical source/mirror roots · docs route · probe root
selector · interactive lane selectors · visual-only selectors ·
density-owned properties · structural exceptions (selector+property+
reason) · expected hit-floor relation · resize assertions (scope +
expected relation) · focused test file
```

`verify-density-adoption.mjs` consumes it: STATIC phase scans only
registered density-owned selector/property pairs, rejects literals +
legacy stamps, reports the owning row; BROWSER phase mounts real docs
fixtures, nests `data-density` scopes, samples computed USED values,
checks stamps, measures ACTUAL clickable rectangles (clicks wrappers
where applicable), runs registered resize assertions. Never flags
1px borders/outlines, color-map geometry, viewport max-height, SVG
boxes, fixed menu minimum widths, or explicit aspect ratios unless a
family registers them as density-owned. **Custom-property assertions
compare USED values — raw text is serialization-fragile** (the
`oklch(60% .2 25)` lesson, `17ef509`).

The adoption verifier CLI contract (every packet gate uses it):

    node scripts/verify-density-adoption.mjs --packet <A|B|C|D|E|all> [port]

- selects the exact registry rows owned by the packet; `--packet all`
  is the post-merge/orchestrator form;
- STATIC phase first (registry scan, no browser): exit 1 with
  `family / selector / property → value` failure lines naming the
  owning row;
- BROWSER phase: starts its own fixture server unless `[port]` names a
  running one; mounts the docs fixtures, nests the four scopes,
  samples USED values, checks stamps, measures/clicks physical lanes,
  runs resize assertions; failures print the same row-addressed
  format, phase-prefixed;
- used-value normalization everywhere (no raw custom-property text);
- K0 ships the registry with COMPLETE rows for every A-E family —
  placeholder rows are forbidden.

Wave gates: (1) `verify-density-kernel.mjs` (ruler + all aliases +
ctl aliases + nested inheritance + K0 residuals); (2)
`verify-density-adoption.mjs` per the CLI above; (3)
`verify-jx-pure.mjs` (v2 face + shadow root + layers + degradation +
density continuity, used values). Ruler 18/18 + matrix 37/37 remain
mandatory baselines.

**The closed token-consumption rule**: control-footprint geometry
consumes `--jx-d-ctl-*`; semantic roles consume the CLOSED kernel
ruler-role allowlist (`--jx-d-secondary-*`, `--jx-d-media-*`,
`--jx-d-inline-inset/gap`, `--jx-d-stack-gap`, `--jx-d-row-min`,
`--jx-d-hit-min`, `--jx-d-text/line/leading`,
`--jx-d-icon-optical-inline`) — established by the kernel change,
legal for the roles it already owns. Any OTHER `--jx-d-*` consumption
in family css fails the registry scan as a second-scale attempt.

## 6. Sequence and merge protocol

```
clean baseline (17ef509 proven)
  → K0 (resolver/theme/list-item/registry) → 61+18+37 green
    + the FULL apps/www suite green (the concurrency substrate)
  → F jx-pure v2 → 65/65 green + the FULL suite green
  → A B C D E in PARALLEL (subagents, never commit, report diffs)
  → orchestrator: exact-list merge (overlap = merge stop) → parity
    → payload/manifest regenerated ONCE → build site+blueprints
  → G Owner browser walkthrough and release decision
```

Packets never edit `registry.json`, `mirror-manifest.json`, generated
`public/r/**`, generated SVGs, or shared layout/ToC infrastructure.

## 7. K0 residual dispositions

1. **Optical token — CONSUME**: `Q = clamp(var(--jx-d-icon-optical-inline,
   0px), calc(var(--jx-ruler-unit) / -2), calc(var(--jx-ruler-unit) / 2))`;
   solid media glyphs apply `translateX(Q)` (default 0px); the ruler
   probe asserts the declared clamp AND a non-zero fixture value.
2. **Grouped `layout="media"` — EFFECTIVE**: content-gap→stack-gap and
   block-start anchoring (existing) PLUS the media track explicitly
   from `--jx-d-media-image` and the row media lane at the
   line-derived posture (`min-block-size` = the derived object size).
   Probes compare standard vs media at xs/default/lg (track width,
   block-start alignment, stack gap, no implicit tracks). If a delta
   cannot be made observable, REMOVE the promise + docs instead of
   keeping inert vocabulary.
3. **Inset prose — ALIGN**: `margin-inline: calc(3 *
   var(--jx-d-inline-gap))` with the 36px-at-default value called out;
   no `0.75rem` description remains.

## 8. Regression strategy

- **Tests**: preserve the 492 floor; extend K0 context tests + ONE
  focused jsdom file per A–E; no wholesale snapshot rewrites. A
  geometry expectation changes ONLY with its packet's recorded
  before/after relation. Full runs at K0/F barriers + post-merge;
  focused per packet; retries never convert timeouts to green.
- **CSS/browser**: kernel proves equations+inheritance once; adoption
  proves every registry row at four densities + physical targets;
  pure proves the static/no-JS face. Layer/press/surface-motion/
  ruler/matrix/scrollbar/terminal/stamped-attribute/getter-context
  laws stay green. Used-value comparisons only.
- **Visual continuity**: BEFORE K0 implementation, capture
  representative docs fixtures at default/sm/lg/xs (narrow container)
  — computed geometry JSON + screenshots under
  `.agents/documents/2026-08-26-density-adoption/baselines/`. Each
  packet adds its own density ladder. The Owner's browser judgment is
  authoritative for anatomy, silhouette, and density feel.
- **Registry/dual-tree**: every source edit carries its byte-identical
  mirror edit in the same packet; payload parity and manifest checks
  are separate failures; only the orchestrator regenerates after the
  exact-list merge.
