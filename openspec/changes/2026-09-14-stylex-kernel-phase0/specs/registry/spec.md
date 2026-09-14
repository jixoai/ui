# registry delta — stylex-kernel-phase0

## MODIFIED Requirements

### Requirement: consumer contract

A consumer installing any kernel item SHALL owe NO styling-engine
tooling: the payload carries compiled class constants + item CSS,
and the sole wiring is importing the item CSS (exactly the
jixoai.css import consumers perform today). Consumers MAY run
Tailwind, StyleX, or any engine for their own markup — the
canonical layer law keeps consumer utilities above kernel paint
either way. The retired check-tw4-prereq gate is replaced by the
zero-engine-lockfile assertion in verify:shadcn-add (the clean
consumer's lockfile contains no @stylexjs/* entries).

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
