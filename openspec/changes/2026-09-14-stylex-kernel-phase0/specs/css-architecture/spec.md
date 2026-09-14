# css-architecture delta — stylex-kernel-phase0

## ADDED Requirements

### Requirement: the canonical layer law (F9)

Every kernel-emitted stylesheet SHALL open with the canonical layer
statement — `@layer theme, base, components, utilities;` followed by
the kernel atoms layer — positioned BEFORE any engine-appended
rules, and it SHALL be owned by the build tooling (the
@jixoai/ui-vite-plugin bakes it; authors never hand-write it). The
statement exists so that consumer utilities always beat kernel atom
paint under any import order (the layer-order inversion discovered
and proven by the research's O1-H diagnostic build: unplugin's
append behavior + CSS first-declaration ordering otherwise makes
kernel styles permanently beat consumer utilities).

#### Scenario: consumer utility beats a kernel atom

- GIVEN a kernel element whose paint is a compiled atom class, in a
  consumer page that also loads Tailwind utilities
- WHEN the consumer adds a conflicting utility on the element
- THEN the utility's declaration wins (computed value = the
  utility's), with the kernel CSS imported before OR after the
  consumer's Tailwind entry

#### Scenario: an author hand-writes a layer statement

- GIVEN a kernel-authored CSS file carrying a hand-written
  `@layer` ordering statement
- WHEN verify:stylex-authoring runs
- THEN it fails, naming the file — the plugin owns the statement

### Requirement: same-build payload consistency

The registry's compiled outputs for an item — the class-constant
module AND the item CSS — SHALL be emitted from ONE build pass and
pinned to the same build hash by verify:stylex-payload. Consumers
SHALL never be expected to recompile kernel style source (class
hashes are path-dependent; we are the only compiler). A payload
whose class constants and CSS disagree FAILS the gate.

#### Scenario: a desynced payload fails the gate

- GIVEN a payload whose class-constant module references a class
  whose rule is absent from the item CSS (hand-edited or from a
  different build)
- WHEN verify:stylex-payload re-derives both artifacts
- THEN the gate FAILS naming the item and the hash mismatch

## MODIFIED Requirements

### Requirement: the placement law

Styling SHALL live in exactly one place per kind (the atom-first
edition — the Tier-1 lane changes; every other lane is unchanged):

1. Paint expressible as typed static atoms → `stylex.create` in the
   component's `<item>.stylex.ts` (longhands only), compiled by the
   kernel build into atom classes; dynamic values ride CSS-var
   bindings (atoms consume `var(--jx-*)`/component vars; the
   component computes the vars) — factories and vars-keys are
   forbidden (see component-authoring).
2. CSS atoms cannot express (pseudo-element geometry, `@container`/
   `@keyframes`/scroll-driven/view-transition at-rules, press-physics
   custom properties, state-machine residue) → colocated
   `ui/<item>/<item>.css` under `@layer components` with `:where()`,
   unchanged from the utility-first edition.
3. Tokens + element-default sheets → `registry/files/theme/`,
   unchanged (the typed `.stylex.ts` accessors WRAP the sheet; they
   never restate values).
4. Site-only surfaces → unchanged.

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
  computes the var (inline style or scoped stamp) — a factory call
  fails verify:stylex-authoring

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
