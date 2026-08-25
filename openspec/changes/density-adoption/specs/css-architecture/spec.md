# css-architecture — delta

## MODIFIED Requirements

### Requirement: the derived-scale law (尺规思维)

Geometry and type tokens SHALL be derived from the ruler by written
equations in the canonical theme sheet (calc chains from
--jx-ruler-unit and the text base), never hand-picked per component.
The `--jx-d-ctl-*` property list is part of the density-owned
vocabulary — aliases only, never a second scale; family-local literal
branches and unregistered literals are forbidden; private family
properties are one-line aliases to `--jx-d-ctl-*` only. Density
scopes exist ONLY in that sheet and its byte-identical mirror.
Browser assertions SHALL compare USED values.

#### Scenario: the scale computes

- GIVEN the token sheet at a 16px root
- WHEN a real browser resolves each [data-density] scope
- THEN every value in the four-row table (and each ctl alias)
  computes exactly, compared as USED values

#### Scenario: a hand-picked dimension sneaks in

- GIVEN component css with padding: 0.625rem
- WHEN the registry static phase scans density-owned declarations
- THEN it fails and names the family row, selector, property, value

#### Scenario: a family invents a second scale

- GIVEN family css declaring an independent size custom property
- WHEN the registry static phase scans it
- THEN it fails unless the property is a one-line alias to a ctl
  alias

### Requirement: stamped-attribute painting (presence-matrix families)

Component families whose geometry or chrome depends on slot presence
or group policy SHALL resolve that state in the component and stamp
it as data attributes; family css paints stamps only and MUST NOT
infer from arbitrary descendant context. Presence-driven GRID
templates: STANDALONE rows (and the no-subgrid fallback) keep the
exhaustive self-contained combinations; GROUPED rows under
@supports(subgrid) rent an EXPLICIT shared ruler through two subgrid
levels with one fixed area template per ruler per wrap mode; the
narrow law changes areas ONLY. The effective grouped `layout="media"`
deltas (media track from --jx-d-media-image, line-derived lane
posture) and their probes are normative; inert vocabulary is removed
rather than kept.

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
- THEN data-item-chrome on the row root reads "none" in the SSR HTML,
  and the browser paints exactly that resolution

#### Scenario: no implicit tracks at any presence combination

- GIVEN a browser fixture rendering all sixteen wide combinations
  (standalone/fallback path)
- WHEN each row's computed grid is read
- THEN both grid-template-columns and grid-template-areas match the
  authored template exactly — zero implicit tracks

#### Scenario: consumer overrides still win

- GIVEN family rules as :where() inside @layer components
- WHEN a consumer applies a utility class
- THEN the utility overrides family paint per the layer law

#### Scenario: grouped media posture is observable

- GIVEN a media-content-end group at standard vs layout=media
- WHEN probed at xs/default/lg
- THEN the registered deltas (track width, block-start alignment,
  stack gap) are observable — inert vocabulary is removed instead

## MODIFIED Requirements (2nd wave)

### Requirement: the placement law

Styling SHALL live in exactly one place per kind:

1. Paint expressible as Tailwind v4 utilities → utilities composed in
   component markup (no CSS file).
2. CSS utilities cannot express (pseudo-element geometry,
   `@container`/`@keyframes`/scroll-driven/view-transition at-rules,
   press-physics custom properties) → colocated
   `ui/<item>/<item>.css` loaded by a relative side-effect import from
   the component file, containing ONLY standard CSS (token custom
   properties, `@layer components` scoped with `:where()`, the
   at-rules above). `@utility` MUST NOT appear in folder css; custom
   utilities, if ever needed, MUST live in the single Tailwind
   entry/theme item with their own compiled-output probe. Every
   folder sheet MUST open with the canonical layer statement.
3. Tokens + element-default sheets → `registry/files/theme/`
   (jixoai.css, jx-pure.css). During the density-adoption change the
   K0 and F packets ARE the sanctioned owners of those two sheets
   (the ctl aliases and the v2 rebuild); outside that ownership the
   sheets return to consume-only. One-placement and import-order laws
   are unchanged.

#### Scenario: a family packet edits the theme sheet

- GIVEN packet A running after K0/F
- WHEN it needs a new token
- THEN it reports the desired delta; the orchestrator (K0 ownership)
  applies it — packets never edit the canonical theme directly

### Requirement: utilities win over Tier-1-owned css; three documented exceptions

All Tier-1-owned STATIC authored css MUST sit in `@layer components`
behind `:where()` so consumer utilities win. Three exceptions exist, all
deliberate and bounded:

1. The v2 Tier-2 vocabulary (jx-pure Part A — the renamed
   `.jx-control/.jx-control-shell/.jx-control-lane/.jx-slider/
   .jx-color-shell/.jx-color-swatch/.jx-color-expand` + kept
   `.jx-field/.jx-label/.jx-error`) is the intentionally unlayered
   cascade exception — by design it beats layered utilities.
2. The STATE-MACHINE CARVE-OUT: residue rules that must override the
   component's OWN utility paint ride unlayered behind `:where(...)`.
3. The SURFACE-KERNEL OVERRIDE: enumerated rules overriding another
   component's unlayered surface law ride unlayered with NATURAL
   specificity, each enumerated in the sheet header with a
   consumer-override probe.

jx-pure Parts B–D are rebuilt by the density-adoption F packet
against the living jx-pure spec (that spec's delta governs the
vocabulary); components consume Part A/B/C/D and MUST NOT copy, move,
redefine, or re-wrap them. Changing the Part A cascade still REQUIRES
a change against the jx-pure living spec.

#### Scenario: specificity probe (Tier-1)

- GIVEN component paint `.jx-foo` in the folder css
- WHEN a consumer adds `class="jx-foo text-primary"` (or any utility)
- THEN the utility's declaration wins over the folder css declaration

#### Scenario: Tier-2 exception intact

- GIVEN `.jx-control` defined by jx-pure Part A (unlayered)
- WHEN a consumer utility attempts to override one of its declarations
- THEN Part A wins — by design — and this change leaves that untouched

#### Scenario: state-machine carve-out (component-own override)

- GIVEN a migrated component whose `:checked` residue must repaint its
  own `bg-muted` utility paint
- WHEN the state activates
- THEN the unlayered `:where(...:checked...)` rule wins over the
  utilities layer
- AND the component's STATIC paint stays consumer-overridable
