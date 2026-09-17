# css-architecture Specification

## Purpose
The css architecture contract: where every style may live (the placement
law), what the generated css-laws slots own vs. hand sheet regions, and
the shared laws (scales, carriers, surfaces) that keep the theme sheets
one system instead of per-component forks.

## Requirements

### Requirement: the placement law

Styling SHALL live in exactly one place per kind — the ORIGINAL
placement law with its first lane rewritten atom-first, its fourth
lane rewritten tailwindless, every other clause carried verbatim:

1. Paint expressible as typed static atoms → `stylex.create` in the
   component's `<item>.stylex.ts` OR the site surface's atom module
   (the tailwindless extension, 2026-09-17: the site rides the SAME
   atom lane — the first-consumer law; site atom modules live UNDER
   THE TRANSFORM ROOT `apps/www/src/lib/surface/<name>.stylex.ts`
   because the kernel-scope gate transforms only `src/lib` +
   `registry/files` — routes import them, never author outside the
   root, NO plugin include change; the component-authoring shorthand
   law: engine-throw-table properties forbidden), compiled by the
   kernel build into atom classes; dynamic
   values ride CSS-var bindings (atoms consume
   `var(--jx-*)`/component vars; the component computes the vars) —
   factories and vars-keys are forbidden (see component-authoring).
   [CHANGED LANE — was: Tailwind v4 utilities composed in component
   markup; the site extension — was: site markup composing Tailwind
   utilities]
2. CSS atoms cannot express (pseudo-element geometry,
   `@container`/`@keyframes`/scroll-driven/view-transition at-rules,
   press-physics custom properties) → colocated
   `ui/<item>/<item>.css` (or the site module's named css) loaded by a
   relative side-effect import from the component/module file,
   containing ONLY standard CSS (token custom properties, `@layer
   components` scoped with `:where()`, the at-rules above). `@utility`
   MUST NOT appear in folder css (a standalone css file has no
   Tailwind context); custom utilities, if ever needed, MUST live in
   the single Tailwind entry/theme item with their own
   compiled-output probe — THE LEGACY MIGRATION WINDOW CLAUSE
   (tailwindless, 2026-09-17): the existing `@utility` inventory in
   jixoai.css is FROZEN (growth is gate-red); the clause dies at
   Pfinal with the engine (every `@utility` deleted, the
   compiled-output probe retired with it). Every folder sheet MUST
   open with the
   canonical layer statement (the FULL form per the canonical layer
   law). [carried verbatim except the canonical-statement extension,
   the site-module wording, and the legacy-window clause]
3. Tokens + element-default sheets → `registry/files/theme/`
   (jixoai.css, jx-pure.css) — consume-only EXCEPT during the
   density-adoption change, whose K0 and F packets are the sanctioned
   owners of these two sheets. [verbatim]
4. Site-only surfaces → colocated with the route/module they serve.
   [CHANGED — the tailwindless edition, 2026-09-17] app.css's
   Tailwind context RETIRES in phases (the tailwindless program):
   NEW site styling lands as stylex atoms (lane 1) or registered
   site-module css (lane 2 semantics); during migration the Tailwind
   entry remains ONLY for unmigrated surfaces, with the
   `verify:tailwindless` per-file allowlists pinning the retreat; at
   program end the sole `@import 'tailwindcss'`, the global
   `@theme`/`@custom-variant` rules, and the tailwindcss dependency
   are deleted and app.css carries only token imports + site base
   rules in plain CSS.

Every authored-CSS file MUST carry a top comment listing its
orthogonal intents (with timestamps) per the repo law. [verbatim]

BOUNDARY (explicit): the Tier-2 unlayered exception, the
state-machine carve-out, the surface-kernel override, the print
whitelist, the derived-scale/density laws, and every OTHER
requirement of this spec are UNCHANGED by this delta — atoms ride
the same layer/specificity physics the utilities lane rode.

#### Scenario: a new component needs a pseudo-element build

- WHEN the paint cannot be expressed as atoms (pseudo-element
  geometry, at-rules)
- THEN it lands in `ui/<item>/<item>.css` under `@layer components`
  with `:where()`, imported relatively by the component
- AND a consumer utility overrides it (Tier-1-owned css loses to
  utilities)

#### Scenario: component paint IS utility-able

- WHEN a surface is boxes/borders/spacing/typography on the token
  sheet (the atom-first edition of this scenario: "utility-able"
  paint now means atom-able)
- THEN it is authored as static atoms in `<item>.stylex.ts`, NO css
  file is created, and consumer utilities still override it (the
  canonical layer law)

#### Scenario: a dynamic width is authored

- WHEN a component needs a runtime-dependent size
- THEN the atom consumes `var(--component-size)` and the component
  computes the var — a factory call fails verify:stylex-authoring

#### Scenario: css loads exactly once

- GIVEN an item's css imported relatively by its component
- WHEN the component is used on a page that also imported the css
  historically
- THEN the stylesheet appears exactly once in the built output

#### Scenario: a family packet edits the theme sheet

- GIVEN packet A running after the foundations
- WHEN it needs a new token
- THEN it reports the desired delta; the orchestrator applies it —
  packets never edit the canonical theme directly

#### Scenario: a site page needs layout paint

- GIVEN a site surface needing boxes/spacing/typography (the
  tailwindless edition)
- WHEN the edit lands
- THEN it is authored as static atoms in the surface's
  `<surface>.stylex.ts` over typed tokens (theme-able values) and
  structural constants — Tailwind utility composition in site markup
  is closed to new code (the file's allowlist may only shrink)

### Requirement: utilities win over Tier-1-owned css; three documented exceptions

All Tier-1-owned STATIC authored css MUST sit in `@layer components`
behind `:where()` so consumer utilities win. Three exceptions exist, all
deliberate and bounded:

1. The frozen Tier-2 vocabulary (jx-pure Part A) is the intentionally
   unlayered cascade exception — by design it beats layered utilities.
2. The STATE-MACHINE CARVE-OUT (P3 finding, 2026-08-24 — the Part A
   precedent applied to components): residue rules that must override
   the component's OWN utility paint (sibling `:checked`/`:has()`/
   `:focus-visible` repaints, reduced-motion kills of `animate-*`
   utilities) ride unlayered behind `:where(...)`. Layered placement
   would make them permanently lose to the utilities layer; unlayered
   zero-specificity keeps consumer css tie-winning at the unlayered
   level while the component's STATIC utility paint stays
   consumer-overridable.
3. The SURFACE-KERNEL OVERRIDE (P3-r1 finding, Codex ruling
   2026-08-24): enumerated rules that override ANOTHER component's
   unlayered surface law (the floating-surface kernel) ride unlayered
   with NATURAL specificity — `:where()` would zero the specificity
   the override needs and a components-layer copy always loses to the
   unlayered kernel. The exception is BOUNDED: each use MUST enumerate
   its selectors in the sheet header, state the foreign law it
   overrides, and carry a consumer-override probe; it SHALL NOT
   justify unlayering a whole sheet (terminal-header's statics moved
   back into `@layer components` `:where()` under this ruling).
   Current enumerated uses: terminal-header `.jx-nav .jx-pop.jx-subpanel*`
   (over the Popover primitive's panel law), tooltip/popover
   `.jx-tip.jx-surface::after` + notch-mask family (over the
   jx-surface law's pseudo-shadow ownership).

jx-pure Parts B–D are an externally-owned living sheet, outside this
change's scope (consume-only, unchanged — not a layering exception).
Components MUST consume Part A/B/C/D and MUST NOT copy, move,
redefine, or re-wrap them. Changing the Part A cascade REQUIRES a
separate change against the jx-pure living spec.

#### Scenario: specificity probe (Tier-1)

- GIVEN component paint `.jx-foo` in the folder css
- WHEN a consumer adds `class="jx-foo text-primary"` (or any utility)
- THEN the utility's declaration wins over the folder css declaration

#### Scenario: Tier-2 exception intact

- GIVEN `.jx-input` defined by jx-pure Part A (unlayered)
- WHEN a consumer utility attempts to override one of its declarations
- THEN Part A wins — by design — and this change leaves that untouched

#### Scenario: state-machine carve-out (component-own override)

- GIVEN a migrated component whose `:checked` residue must repaint its
  own `bg-muted` utility paint
- WHEN the state activates
- THEN the unlayered `:where(...:checked...)` rule wins over the
  utilities layer (verified: toggle flips rail/knob/travel)
- AND the component's STATIC paint stays consumer-overridable (a
  consumer utility still beats the unchecked `bg-muted`)

### Requirement: stamped-attribute painting (presence-matrix families)

Component families whose geometry or chrome depends on slot presence
or group policy SHALL resolve that state in the component and stamp
it as data attributes; family css paints stamps only and MUST NOT
infer from arbitrary descendant context. Presence-driven GRID
templates: STANDALONE rows (and the no-subgrid fallback) keep the
exhaustive self-contained combinations — every media/end/header/
footer combo declares BOTH columns AND areas (no implicit tracks).
GROUPED rows under @supports(subgrid) SHALL instead rent an EXPLICIT
shared ruler (three or five tracks with explicit gap tracks,
column-gap 0) through two subgrid levels, with one fixed area
template per ruler per wrap mode; missing slots retain shared tracks
(deliberate alignment) and the narrow law changes areas ONLY — never
the shared tracks. Group-owned paint targets the group frame, the
inner list, and direct-child row wrappers only.

#### Scenario: the topology split holds in one tree

- GIVEN the migrated list-item css
- THEN grouped-subgrid rows carry no per-row presence matrix while
  standalone rows keep all 16 wide + 8 narrow self-contained
  combinations, and neither path ever mints an implicit track

#### Scenario: the narrow law never rewrites the ruler

- GIVEN a media-content-end group at or below the 30rem container
  WHEN one row wraps auto and its sibling keeps wrap="never"
- THEN the auto row's end occupies a full-width area row while the
  never row's end stays on the shared fifth track — the ul's tracks
  are unchanged

#### Scenario: chrome is inspectable without a computed style

- GIVEN a grouped Item resolved as chrome-less
- THEN `data-item-chrome` on the row root reads `"none"` in the SSR
  HTML, and the browser paints exactly that resolution

#### Scenario: no implicit tracks at any presence combination

- GIVEN a browser fixture rendering all sixteen wide media × end ×
  header × footer combinations (standalone/fallback path)
- WHEN each row's computed grid is read
- THEN both `grid-template-columns` and `grid-template-areas` match
  the authored template exactly — zero implicit tracks, no ghost
  columns; grouped-subgrid rows assert three/five explicit tracks

#### Scenario: consumer overrides still win

- GIVEN family rules written as `:where()` inside `@layer components`
- WHEN a consumer applies a utility class to a row or group
- THEN the utility overrides the family paint per the layer law

### Requirement: the derived-scale law (尺规思维)

Geometry and type tokens SHALL be derived from the ruler by written
equations in the canonical theme sheet (calc chains from `--jx-unit`
and the text base), never hand-picked per component. Density scopes
([data-density]) exist ONLY in that sheet and its byte-identical
generated mirror; components consume the inherited `--jx-*` aliases.
The four-density computed table (text/line/gaps/inset/row-min/
hit-min/media) is asserted by a real-browser gate; a greppable source
guard enforces the same law statically. (The ruler token was renamed
`--jx-ruler-unit` → `--jx-unit` by c31fe6a; this delta corrects the
spec's spelling — the law itself is unchanged.)

#### Scenario: the scale computes

- GIVEN the token sheet at a 16px root
- WHEN a real browser resolves each [data-density] scope
- THEN every value in the four-row table computes exactly (e.g.
  mediaImage == 2 × line, seam excluded; hitMin >= the 7U hit-floor
  — a guardrail at 28px (Owner ruling 2026-08-29 "彻底跟字"), never
  binding at the current row-min values, retired from the 44px
  touch-first clamp)

#### Scenario: a hand-picked dimension sneaks in

- GIVEN component css with padding: 0.625rem
- WHEN the source guard scans density-owned declarations
- THEN it fails and names the file, selector, property, and value

### Requirement: the generated-law boundary (merge-alignment B1, 2026-08-29)

The 13 native form-control laws (jx-html-* family) SHALL be authored
ONLY as typed TS objects in packages/css-laws/src/laws and serialized
into the theme sheets between `@jixoai/css-laws` marker slots.
Hand-authored `@utility jx-html-*` or `@apply jx-html-*` outside the
slots is FORBIDDEN (the retired chain must not creep back). The
jx-hue-*/jx-pair-* intent utilities are a different, legal layer and
are out of scope. Enforced by scripts/verify-standards.mjs (B1) in
verify:all.

#### Scenario: a hand-written law creeps back

- GIVEN either theme sheet
- WHEN a `@utility jx-html-*` or `@apply jx-html-*` appears outside
  the css-laws markers
- THEN verify:standards FAILS naming the sheet and the offender

### Requirement: the icon carrier hierarchy (merge-alignment B2, 2026-08-29)

Glyphs SHALL ride, in order of preference: (1) inline SVG with
stroke="currentColor" in component contexts; (2) for CSS-only
contexts, a dedicated mask carrier painted with
mask + background-color: currentColor, with all box chrome (border/
shadow/fill) on ancestors or siblings — never on the masked element;
(3) for engine-constrained UA pseudos that reject author masks,
background-image with the -ink variant pair flipped by .dark/.jx-light.
Every data-URI glyph in the theme sheets MUST be a `--jx-icon-*`
slot definition or a slotted `var(--jx-icon-*, fallback)` use — bare
duplicate paints are forbidden (enforced by verify-standards B2).

#### Scenario: a glyph bypasses the slot system

- GIVEN a data-URI svg paint in either theme sheet
- WHEN it is neither `--jx-icon-x: url(...)` nor
  `var(--jx-icon-x, url(...))`
- THEN verify:standards FAILS naming the line

### Requirement: the container-query geometry law (merge-alignment B4, 2026-08-29)

Fixed-posture controls (locked size and ratio: the range slider, the
color chip) SHALL derive ALL internal geometry from their own size
container: a definite containing block, `container-type: size`,
height locked to the density lane, aspect-ratio (or width) locked,
and every internal dimension expressed in cq units — never in
density tokens (the ONE token read is the height). Fluid/editorial
surfaces are exempt. Adoption requires used-value verification
across the density matrix (a height change scales every internal
proportionally).

#### Scenario: a fixed-posture control hardcodes an internal size

- GIVEN a control under this law
- WHEN an internal dimension references a density token directly
  (instead of cq units)
- THEN the control no longer scales as one unit and the law is
  violated

### Requirement: one floating-surface law (merge-alignment B5, 2026-08-29)

Every popover/dialog/panel family — including the terminal panels —
SHALL specialize the shared surface law (.jx-surface platform
element paints nothing; .jx-surface-body carries the bezel;
.jx-surface-shadow the shadow layer; the one WAAPI kernel animates
--jx-p). No component-specific motion law may fork the kernel; the
reduced-motion, no-JS, and exit-cancellation states stay locked for
every specialization.

#### Scenario: a panel family forks its own motion law

- GIVEN a popover/dialog/panel component shipping its own enter/exit
  animation instead of riding the surface WAAPI kernel
- WHEN the css-architecture gate reviews the sheet
- THEN the fork is rejected — every specialization rides .jx-surface /
  .jx-surface-body / .jx-surface-shadow and the one --jx-p kernel,
  with reduced-motion, no-JS and exit-cancellation locked alike

### Requirement: grid supplies stacking; position is for transient ink (Owner law, 2026-09-01; isolation clause 2026-09-09)

Overlay and layer stacking SHALL be expressed by grid placement —
one-cell hosts with `grid-area: 1/1` siblings and `z-index` for
order (the tabs host: the run base, the veil layer, the chevron
buttons; the carousel window: track + arrows — in zero-z source
order; the top layer's named areas) — never by `position:
absolute/sticky` for LAYOUT. `position: absolute` remains legal only
for these CATEGORIES (each USE carries a site comment naming its
category — the exemption list is open by category, closed by
un-annotated use):

- TRANSIENT INK — effect pseudos (toast pulse/sweep, press-button
  shimmer/spark — the timeline beam retired into the drawn spine layer,
  2026-09-15) and decorative carriers (the liquid-SVG zero-size filter
  def);
- CONTAINING-BLOCK NEEDS — the indicator span inside the scroll run
  (its containing block is the scroller so it travels with content) —
  the timeline scroll-progress spine's absolute channel (2026-09-02)
  retired with the drawn-spine stroke draw (2026-09-15);
- PLATFORM POSITIONING — popover/anchor engines (position-anchor,
  top layer) and visually-hidden skip targets.

A z LADDER (any set of z-index assignments ordering siblings of one
host) is COMPONENT-PRIVATE: the sheet that assigns it SHALL root
the ladder in a stacking context of its own — `isolation: isolate`
on the ladder's common parent (the press-button/chip `relative
z-0` host rooting and `.jx-surface`'s `isolation: isolate` are the
two lawful in-repo proofs) — so component ladders never compare
rungs across components (the scroll-run chips z:2 over the canvas
dock z:1 incident, 2026-09-09: both ladders were lawful, both
leaked into a shared ancestor context and compared raw numbers).
A ladder spanning MULTIPLE parents (timeline's bridging lines)
isolates at its TRUE common parent (the list root), never
per-item — per-item isolation would freeze cross-item order to DOM
order. Same-cell grid siblings ordered by SOURCE ORDER with zero
z (carousel, section-card, tree-view) are the compliant zero-z
dialect — grid stacking does not require z, only permits it.
`container-type` does NOT establish a stacking context (measured,
Chrome — a `@container`-carrying host still leaks); isolation is
one explicit property, never implied by containment. Ladders in
MARKUP UTILITIES (`z-[1]`, `z-0`) follow the same law as sheet
z-index. The ONE sanctioned raw-number comparison is the
page-terminal calibrated plane — {content < toc/top-layer 40 <
fab 80 < toast 90 < skip-link 100} — cross-component by design at
page level; everything below it orders between ATOMIC UNITS at
their shared boundary: content < decorative ink < interactive
chrome < canvas chrome < page chrome.

Overlay planes SHALL be pointer-transparent except on their actual
content: the plane container sets `pointer-events: none` and content
opts back in (`auto`). A plane stretched over the stage with
`pointer-events: auto` is a click shield over the page (the toast
float-plane incident, 2026-09-02). The INVARIANT is "an adopted plane
never becomes a shield or inflates its children" — the mechanism is
free (today: the float wrapper is content-sized at the stage corner
via place-self and the toast stack rides content-end rows); laws pin
invariants, implementations pick mechanisms.

#### Scenario: an overlay is positioned instead of gridded

- GIVEN a component adds a scroll chevron / veil / badge / center
  overlay (donut center, busy scrim, dropdown menu)
- WHEN it is placed with position:absolute instead of a grid area on
  the shared host — or, for menus, the popover platform
- THEN review rejects it — grid + z-index (or the platform) is the law

#### Scenario: a private ladder leaks into a shared context

- GIVEN a component whose sheet assigns z-index to its own parts
  (a veil at 1, chips at 2) embedded in a foreign z-using context
  (a canvas stage whose own chrome rides z 1)
- WHEN its ladder's common parent establishes no stacking context
  (plain grid host, `@container` utility, or consumer markup)
- THEN review rejects it — the owner adds `isolation: isolate` at
  the ladder's common parent; the component becomes one atomic unit
  outside, its internal order untouched

#### Scenario: a canvas guarantees chrome above demo content

- GIVEN a canvas whose stage hosts arbitrary demo content (any
  registry component, any internal z usage)
- WHEN the canvas's own chrome (the playground dock, z 1) shares an
  ancestor stacking context with the demo subtree
- THEN the canvas isolates the demo boundary (the scroll layer) so
  demo content is one atomic unit under the chrome — the canvas
  never trusts demo internals, and demos never paint above canvas
  chrome regardless of their own ladders

#### Scenario: an adopted float plane intercepts the page

- GIVEN a top-layer plane (ScaffoldFloat area) over the stage
- WHEN a user clicks page content underneath the plane's empty areas
- THEN the click must reach the page — planes are pointer-transparent
  and content-sized; the css-source law (pointer-events: none after
  the grant) plus the real-scaffold mount fixture guard this

### Requirement: the component-mount projection for generated laws (adversarial review, 2026-09-02)

A registry component that mounts a generated bare-element FACE (the
law's full rule-set) on its own hook SHALL receive it through a
css-laws marker slot (`@jixoai/css-laws:begin:<law>-mount`) generated
from the SAME law source — never a hand-copied block. The generated
mount rides `@layer components`, keeps the law's own escape hatches,
and `build --check` gates its freshness exactly like the sheet
projections. The boundary: TIER APPLICATIONS that merely consume
elevation tokens (`box-shadow: var(--shadow-well)` + hover/focus
states, as the six picker faces carry) may stay hand-written — the
tokens are the single source there — but sweep commits owe them a
grep-verifiable pattern, and a repeated multi-file face is mount-
projection debt to retire at the next touch. Intentional face
divergences (the color-picker swatch chip vs the colorLaw well) are
ruled divergences and carry a comment naming the ruling.

#### Scenario: a hand-copied face drifts from its law

- GIVEN a component css carrying a verbatim copy of a law's face
- WHEN the law source evolves
- THEN the copy silently wins or loses by cascade accident — which is
  why the marker projection is mandatory for faces and the copy is
  rejected in review

### Requirement: icon geometry provenance (icon upstream, 2026-08-29)

Every SVG glyph in the theme sheets — law-slot fallbacks, the
`--jx-icon-*` vocabulary definitions, and the ink variants — SHALL
derive its geometry from the `lucide` package's IconNode data at
generation time (css-laws `src/icon-uris.ts`). Hand-written path
data in law sources or the hand sheet regions is FORBIDDEN, with
ZERO exemptions. The ink pair SHALL map to lucide `check` (valid)
and lucide `circle-alert` (invalid) at sw 2.5.

#### Scenario: a law source hand-writes a data URI

- GIVEN any css-laws law source
- WHEN a `url("data:image/svg` literal appears instead of an
  `iconUri(...)` call
- THEN code review rejects it and the byte-stability tests flag the
  delta against the lucide-derived expectation

#### Scenario: the vocabulary block drifts from lucide

- GIVEN the generated `jx-icon-vocab` slot in jx-pure.css
- WHEN a `--jx-icon-*` definition's URI is edited by hand
- THEN the css-laws `--check` gate FAILS (slot not fresh from the
  lucide-backed law sources)

### Requirement: print-projection overrides live in a named unlayered whitelist

Print rules that must defeat the utilities layer SHALL live in an
UNLAYERED `:where()` whitelist, registered item by item (selector,
forced properties, the utility law they override) — initially:

| selector | forced result |
| --- | --- |
| `[data-jx-print="hide"]` | `display: none` |
| `[data-jx-print="flatten"]` | `overflow: visible; max-block-size: none` |
| `[data-jx-canvas-scroll]` | `overflow: visible; max-block-size: none` |
| `[data-jx-code-card-pre]` | `overflow: visible; max-block-size: none` |
| `[data-jx-props-table-scroll]` | `overflow: visible; max-block-size: none` |

Every other print rule SHALL stay inside `@layer components`. A probe
 SHALL assert, under print media with `display:flex`, `overflow:auto`
and a `max-block-size` utility all present, that the whitelist wins;
the same assertions run for the sim projection. The sim projection
copy SHALL be excluded under real print via `@media not print`.

#### Scenario: utility fights the whitelist

- GIVEN a scroll layer carrying `overflow:auto` and
  `max-block-size: min(32rem,60vh)` utilities plus the canvas-scroll hook
- WHEN print media applies
- THEN computed overflow is visible and max-block-size is none

### Requirement: the audited print whitelist lives in kernel-print.css

The unlayered print-projection whitelist SHALL migrate from the retired
print-projection.css into `lib/print/kernel-print.css` (the stylesheet
fed to the paged.js kernel), carrying the full named table (selector,
forced properties, overridden utility) and an intent header at the top
of the file. An AST gate SHALL hold: kernel-print.css contains zero
`@media not print` wrappers and zero `[data-jx-print-sim]` selectors;
the sim shell stylesheet SHALL never appear in the preview() inputs
(runtime-spy asserted).

#### Scenario: the gate holds against drift

- GIVEN kernel-print.css accidentally gains a sim selector
- WHEN the AST gate runs
- THEN it fails, naming the offending rule

### Requirement: the canonical layer law (F9)

There SHALL be EXACTLY ONE canonical layer statement, and every
kernel stylesheet MUST establish it — the statement's GENERAL form
(priority1..N, utilities CONSTANTLY last; the O1-H measurement of
1..3 was that corpus's special case, not the law):

```
@layer properties, theme, base, components,
  components.stylex.priority1, …, components.stylex.priorityN,
  utilities;
```

- N = the HIGHEST stylex priority layer the css in question carries
  (derived from the engine's own emission at bake time — never a
  hand-fixed constant). The statement MUST cover every priority tier
  appearing in that css; listing tiers a css does not carry is
  harmless, omitting one it carries is the escape. `utilities` is
  CONSTANTLY the last name.
- THE NESTING LAW: the engine's priority tiers NEST UNDER
  `components` (`components.stylex.priorityN` — the useCSSLayers
  prefix), never as top-level layer names. Cascade-layer registration
  is append-only by first mention, so a TOP-LEVEL stylex tier first
  mentioned after the consumer's `utilities` registration sorts AFTER
  it and permanently beats utilities (the Gate-2 measured failure);
  nested under `components`, the tiers ride the position Tailwind's
  own prelude (`@layer properties, theme, base, components,
  utilities;`) already gives `components` — BEFORE `utilities` —
  whichever stylesheet arrives first.
- THE GUARANTEE'S SCOPE: a consumer whose utilities are unlayered, or
  layered behind Tailwind's standing prelude (the registry contract's
  named consumer shape), wins under BOTH import orders. A consumer
  hand-rolling a prelude that registers `utilities` BEFORE
  `components` (no known engine does) is outside the guarantee —
  mechanically no arriving stylesheet can demote itself below an
  already-registered layer.
- ENGINE-EMITTED CSS: the statement is generated by the build tooling
  (@jixoai/ui-vite-plugin — layer-law.ts is the single source; the
  payload generator imports it) — never hand-authored. The dev
  virtual css, the build assets, and the payload item css carry the
  same law.
- FOLDER SHEETS (`ui/<item>/<item>.css`): the standing law that every
  folder sheet opens with the canonical layer statement CONTINUES —
  TRANSITIONALLY SCOPED: NEW and MIGRATED sheets (any sheet touched
  by the stylex phase train) MUST open with the canonical statement
  (the sheet form — the five standing layers; a sheet carries no
  engine output, so it lists no priority tiers); LEGACY sheets (~147
  today) keep the old four-layer form LAWFULLY until their family's
  migration lands (the header update rides each family's migration
  commit). The authoring gate scans ONLY stylex-touched trees (the
  migration ledger's file list), so legacy sheets never fail it — no
  mass-failure, no silent exemption.
- Any import order composes: whichever sheet arrives first
  establishes the same full order (the nesting law + the statement
  jointly).

#### Scenario: consumer utility beats a kernel atom

- GIVEN a kernel element whose paint is a compiled atom class, in a
  consumer page that also loads Tailwind utilities (the consumer css
  = Tailwind's standing prelude + a utility in `@layer utilities`)
- WHEN the consumer adds a conflicting utility on the element, with
  the kernel CSS imported as ONE SEPARATE stylesheet BEFORE the
  consumer's entry, and AGAIN with the kernel CSS imported AFTER it
- THEN in BOTH orders the element's computed value equals the
  utility's (mechanically: verify:stylex-payload loads a payload item
  css and the consumer stylesheet in both orders in headless
  Chromium and reads getComputedStyle — the assertion is the computed
  value, never css text)
- AND the same fixture loaded with an ESCAPED kernel css (top-level
  stylex.* tier blocks after a statement that stops short of them)
  shows the ATOM's value winning — the negative control proving the
  green arms are meaningful and the planted-escape detector has a
  real target

#### Scenario: an engine-emitted statement is hand-authored

- GIVEN an engine-output CSS file carrying a hand-written layer
  statement instead of the plugin's
- WHEN verify:stylex-authoring runs
- THEN it fails naming the file — the plugin owns engine statements

#### Scenario: a folder sheet carries a varied statement

- GIVEN a folder sheet whose opening statement reorders the standing
  layers, or omits priority tiers the sheet itself carries
- WHEN verify:stylex-authoring runs
- THEN it fails naming the file and the divergence — the canonical
  text is exact

#### Scenario: a legal folder sheet passes the gate

- GIVEN a folder sheet opening with the exact canonical statement
- WHEN verify:stylex-authoring runs
- THEN the sheet passes (no false positive on lawful folder CSS)

#### Scenario: a priority tier escapes past utilities

- GIVEN a kernel css whose canonical statement stops at priorityK
  while the css carries top-level tiers beyond it (or nests them as
  top-level stylex.* names at all)
- WHEN verify:stylex-payload runs
- THEN it FAILS naming the item, the uncovered tier, and the
  top-level block — the browser arm's negative control is this exact
  shape

### Requirement: same-build payload consistency

The registry's compiled outputs SHALL be described by a payload
manifest produced by the generator in the SAME pass that emits the
artifacts:

```
payload-manifest.json := {
  buildId: sha256(generatorVersion ‖ engineVersion ‖ sorted
                  (itemPath ‖ sha256(itemSourceFiles…))… ),
  items: { "<item>": {
    classModule: { path, sha256 },
    css:         { path, sha256 },
    sourceSnapshot: [ { path, sha256 }… ] } } }
```

- Canonical paths: `classModule` → the registry payload's compiled
  constants module; `css` → the payload's item CSS. buildId
  serialization is CANONICAL: UTF-8; fields joined by U+000A with a
  trailing separator; paths POSIX-normalized relative to the
  repository root (the Gate-2 discretion promoted from code comment
  to law: the manifest outlives any single registry layout, and the
  migration ledger already anchors repo-root-relative); the source
  list sorted by path bytes; hashes lowercase hex sha256.
- Reverse lookup: EVERY class-constant string in a classModule
  SHALL appear as an (escaped) selector in that item's css.
- verify:stylex-payload re-derives the manifest from the payload
  artifacts and FAILS on: (1) a constant whose rule is missing
  (missing-rule); (2) artifacts whose buildIds disagree
  (cross-build mix); (3) any sha256 mismatch vs the recorded
  content (manual edit). Each failure mode carries a self-test that
  plants the defect and asserts the gate catches it.
- The generator is wired into the registry build (`shadcn build`
  pipeline): the build PUBLISHES the payload tree + manifest into the
  deploy tree (`public/payload/stylex/` — the zero-engine consumer
  surface at /payload/stylex/<item>/), and verify:shadcn-add installs
  a compiled item FROM that published manifest in its consumer
  fixture (class module + item css, one css import, zero @stylexjs/*
  in the built consumer).

#### Scenario: a desynced payload fails the gate

- GIVEN a payload whose class-constant module references a class
  absent from the item CSS
- WHEN verify:stylex-payload runs
- THEN it FAILS naming the item and the missing rule (self-test 1)

#### Scenario: cross-build artifacts are caught

- GIVEN a classModule from build A paired with css from build B
- WHEN verify:stylex-payload runs
- THEN it FAILS on buildId mismatch (self-test 2)

#### Scenario: a manual edit is caught

- GIVEN a hand-edited constant or css whose content no longer
  matches its recorded sha256
- WHEN verify:stylex-payload runs
- THEN it FAILS naming the artifact and the mismatch (self-test 3)

### Requirement: the tailwindless law — the site is the first consumer of its own tokens (Owner 2026-09-17)

jixoai-ui's own site (apps/www routes + site libs) and every registry
component SHALL express ALL styling through the EXISTING placement-law
lanes, with NO second utility system: typed static atoms
(`stylex.create`, lane 1 — now extended to site surfaces), colocated
scoped CSS for what atoms cannot express (lane 2), and the token
sheets (lane 3). The Tailwind engine RETIRES from the whole repo in
phases (the blueprint's P0..Pfinal): during migration a
`verify:tailwindless` gate pins a per-file ALLOWLIST of surviving
utility identities + counts (growth is CI-red; a finished file's
allowlist is zero); at program end the budget is EMPTY and the
engine's every trace is deleted.

THE VALUE RULE (three tiers, enforced over `.stylex.ts` sources and
authored CSS by `verify:stylex-authoring` + the tailwindless gate):
(a) STRUCTURAL constants are lawful (display, flex-direction,
position, geometry in atoms' own terms — `display: 'flex'`,
`blockSize: '1px'`); (b) THEME-ABLE values (color, spacing steps,
typography sizes/tracking/leading, radii, shadows, motion durations)
MUST reference tokens (`var(--jx-*)`/the typed `tokens.stylex`
members) — a literal in a theme-able slot is a MISSING TOKEN STEP:
the value is promoted into the design-tokens sheet (the 收纳 process)
and the atom references the step; (c) recurring composite clusters
become REGISTERED semantic rules (lane-2 sheets with owner + selector
family + declaration scope recorded in the sheet's intent comment) —
never an unregistered utility lookalike.

Dynamic class producers (any code path building class strings —
`cn()`, `resolveTextStyle`, slot resolvers) are REGISTERED in the
gate's source with an enumeration of the identities they may emit;
an unregistered producer or identity is gate-red.

PFINAL (the negative end-state, each item a task with its own
receipt): no `@import 'tailwindcss'`, `@tailwindcss`, `@theme`,
`@custom-variant`, or `@utility` anywhere in repo CSS; no
`@tailwindcss/vite` in either vite config; no `tailwind-merge` in
`cn()` (the class-merge seam retires with a documented replacement);
the print clone's `dark:`-stripping logic replaced by scope-native
handling; `check-tw4-prereq.mjs` and the registry install
prerequisite RETIRED (the registry spec's consumer contract flips:
migrated items need the jixoai theme sheet ONLY); `tailwindcss`
absent from production `package.json` files (design-tool and test
fixtures' scope frozen by explicit decision before Pfinal); the
tailwindless gate runs with an EMPTY allowlist; the stylex payload's
layer contract re-proven post-Tailwind (dual import-order browser
probe — the cascade proof must not keep assuming the utilities layer
rides last), and the canonical layer statement FROZEN for the
post-engine world: the utilities tier is REMOVED from the prelude
(the layer dies with the engine), the generator emits the shortened
statement, and a negative test pins both (a stale utilities-tier
prelude is red).

#### Scenario: the gate pins the migration budget

- GIVEN any state of the migration program
- WHEN `verify:tailwindless` runs
- THEN every class identity in apps/www/src and the mirrored registry
  components resolves against the atom vocabulary, registered
  semantic/producer identities, or the file's ALLOWLIST (identity +
  count) — any GROWTH or unlisted identity fails the gate, and a
  finished file's allowlist is exactly zero

#### Scenario: a bracket value is promoted, not tolerated

- GIVEN a migration edit touching a surviving utility with an
  arbitrary value (a `[...]` form)
- WHEN the edit lands
- THEN the recurring value has become a token step (or an existing
  step covers it) and the site references it through an atom or
  semantic rule — the bracket form is gone from the file

#### Scenario: the no-Tailwind consumer contract is proven early

- GIVEN the P0 consumer fixture (a plain-vite spot project, zero
  Tailwind and zero @stylexjs, installing the migrated REGISTRY
  families — separator first — plus the jixoai theme sheet)
- WHEN it renders
- THEN the families style correctly through atoms + tokens alone —
  the fixture is the standing receipt that migration increments
  shrink the hard binding, and it grows one family per completed
  phase until it covers the registry

#### Scenario: the engine's retirement is total

- GIVEN the program's final phase
- THEN every Pfinal negative condition above holds verbatim — the
  repo greps clean of Tailwind directives, plugins, the merge
  dependency, and the prerequisite machinery, and the gate runs with
  an EMPTY allowlist
