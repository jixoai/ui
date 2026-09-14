# registry delta — stylex-kernel-phase0

## MODIFIED Requirements

### Requirement: consumer contract

A consumer installing a COMPILED KERNEL PAYLOAD ITEM (an item whose
paint ships as compiled class constants + item CSS — the phase-1+
migration state) SHALL owe NO styling-engine tooling: the sole
wiring is importing the item CSS (exactly the jixoai.css import
consumers perform today). Consumers MAY run Tailwind, StyleX, or any
engine for their OWN markup — that is a consumer choice, never a
kernel prerequisite; the canonical layer law keeps consumer
utilities above kernel paint either way. TRANSITIONAL: LEGACY
utility-first items (not yet migrated) keep the standing TW4
prerequisite and check-tw4-prereq applies to THEM until their
migration lands; the gate's applicability narrows as the phase train
advances and retires with the last legacy item. The zero-engine
assertion in verify:shadcn-add checks the clean consumer's lockfile
for @stylexjs/stylex, @stylexjs/unplugin, AND @stylexjs/babel-plugin
— all three must be absent.

#### Scenario: namespace registration

- GIVEN a components.json with the @jixoai namespace
- WHEN items are added via shadcn
- THEN Svelte 5 consumers receive them first-class; theme/lib/engine
  items stay framework-free

#### Scenario: a clean consumer installs an item

- GIVEN a fresh consumer project with no styling engine installed
- WHEN it shadcn-adds a kernel item and imports the item CSS
- THEN the components render correctly and the lockfile gains zero
  @stylexjs/* entries

#### Scenario: a Tailwind consumer overrides kernel paint

- GIVEN a consumer running Tailwind for its own markup
- WHEN it passes a token utility to a kernel component
- THEN the utility wins (canonical layer law) under either import
  order
