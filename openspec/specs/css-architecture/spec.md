# css-architecture Specification

## Purpose
The css architecture contract: where every style may live (the placement
law), what the generated css-laws slots own vs. hand sheet regions, and
the shared laws (scales, carriers, surfaces) that keep the theme sheets
one system instead of per-component forks.

## Requirements

### Requirement: the placement law

Styling SHALL live in exactly one place per kind:

1. Paint expressible as Tailwind v4 utilities → utilities composed in
   component markup (no CSS file).
2. CSS utilities cannot express (pseudo-element geometry,
   `@container`/`@keyframes`/scroll-driven/view-transition at-rules,
   press-physics custom properties) → colocated
   `ui/<item>/<item>.css` loaded by a relative side-effect import from
   the component file, containing ONLY standard CSS (token custom
   properties, `@layer components` scoped with `:where()`, the at-rules
   above). `@utility` MUST NOT appear in folder css (a standalone css
   file has no Tailwind context); custom utilities, if ever needed,
   MUST live in the single Tailwind entry/theme item with their own
   compiled-output probe. Every folder sheet MUST open with the
   canonical layer statement `@layer theme, base, components,
   utilities;` so sheet injection order can never reorder the cascade
   (P0.1 finding: a bare `@layer components` in a sheet injected
   before the Tailwind entry sorts components before base, and
   preflight then beats folder rules).
3. Tokens + element-default sheets → `registry/files/theme/`
   (jixoai.css, jx-pure.css) — consume-only EXCEPT during the
   density-adoption change, whose K0 and F packets are the sanctioned
   owners of these two sheets (the ctl aliases and the v2 rebuild).
4. Site-only surfaces → colocated with the route/module they serve.
   `app.css` keeps the site's global Tailwind context INTACT: the sole
   `@import 'tailwindcss'`, the theme imports, ALL global
   `@theme`/`@custom-variant`/`@layer base` rules, and the import
   order. ONLY selectors that are demonstrably site-only and outside
   the compiler context (data tables, token-lab panels, skip-link,
   …) move to named site module css — global Tailwind context MUST
   NOT be scattered across route css files.

Every authored-CSS file MUST carry a top comment listing its
orthogonal intents (with timestamps) per the repo law.

#### Scenario: a new component needs a pseudo-element build

- WHEN the paint cannot be a utility
- THEN it lands in `ui/<item>/<item>.css` under `@layer components`
  with `:where()`, imported relatively by the component
- AND a consumer utility overrides it (Tier-1-owned css loses to
  utilities)

#### Scenario: component paint IS utility-able

- WHEN a surface is boxes/borders/spacing/typography on the token sheet
- THEN it is composed as utilities in markup and NO css file is created

#### Scenario: css loads exactly once

- GIVEN an item's css imported relatively by its component
- WHEN the component is used on a page that also imported the css
  historically
- THEN the stylesheet appears exactly once in the built output

#### Scenario: a family packet edits the theme sheet

- GIVEN packet A running after K0/F
- WHEN it needs a new token
- THEN it reports the desired delta; the orchestrator (K0 ownership)
  applies it — packets never edit the canonical theme directly

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

### Requirement: grid supplies stacking; position is for transient ink (Owner law, 2026-09-01)

Overlay and layer stacking SHALL be expressed by grid placement —
one-cell hosts with `grid-area: 1/1` siblings and `z-index` for
order (the tabs host: the run base, the veil layer, the chevron
buttons; the carousel window: track + arrows; the top layer's named
areas) — never by `position: absolute/sticky` for LAYOUT.
`position: absolute` remains legal only for these CATEGORIES (each
USE carries a site comment naming its category — the exemption list
is open by category, closed by un-annotated use):

- TRANSIENT INK — effect pseudos (toast pulse/sweep, timeline beam,
  press-button shimmer/spark) and decorative carriers (the liquid-SVG
  zero-size filter def);
- CONTAINING-BLOCK NEEDS — the indicator span inside the scroll run
  (its containing block is the scroller so it travels with content);
  the timeline scroll-progress spine's absolute channel (geometry
  that must span implicit tracks, 2026-09-02);
- PLATFORM POSITIONING — popover/anchor engines (position-anchor,
  top layer) and visually-hidden skip targets.

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
