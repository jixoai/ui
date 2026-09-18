## MODIFIED Requirements

### Requirement: consumer contract

A consumer installing a COMPILED KERNEL PAYLOAD ITEM (an item whose
paint ships as compiled class constants + item CSS — the phase-1+
migration state) SHALL owe NO styling-engine tooling: the sole
wiring is importing the item CSS (exactly the jixoai.css import
consumers perform today). Consumers MAY run Tailwind, StyleX, or any
engine for their OWN markup — that is a consumer choice, never a
kernel prerequisite; the canonical layer law keeps consumer
utilities above kernel paint either way. The one-shot migration
(the tailwindless program's W1..W4 train) migrates every legacy
utility-first item: the TW4 prerequisite and
`scripts/check-tw4-prereq.mjs` RETIRE with it — the jixoai theme
sheet (+ each item's payload CSS) is the whole styling prerequisite;
utility-authored UI items SHALL declare `@jixoai/jixoai-theme` in
`registryDependencies` uniformly so the token sheet arrives with the
component. The zero-engine assertion in verify:shadcn-add checks the
clean consumer's lockfile for @stylexjs/stylex, @stylexjs/unplugin,
AND @stylexjs/babel-plugin — all three must be absent. Items whose
runtime needs a build-time-resolved binary asset keep the
wasm-asset prerequisite unchanged (see the original requirement
text in the spec history for the full wasm chain freeze).

#### Scenario: namespace registration

- GIVEN a components.json with the @jixoai namespace
- WHEN items are added via shadcn
- THEN Svelte 5 consumers receive them first-class; theme/lib/engine
  items stay framework-free

#### Scenario: a clean consumer installs a compiled payload item

- GIVEN a fresh consumer project with no styling engine installed
- WHEN it shadcn-adds any migrated item and imports the item CSS
- THEN the components render correctly and the lockfile gains none
  of @stylexjs/stylex, @stylexjs/unplugin, @stylexjs/babel-plugin;
  no item carries a Tailwind prerequisite anymore

#### Scenario: a Tailwind consumer overrides kernel paint

- GIVEN a consumer running Tailwind for its own markup
- WHEN it passes a token utility to a kernel component
- THEN the utility wins (canonical layer law) under either import
  order
