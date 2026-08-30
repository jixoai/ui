# docs-site delta — the demo page skeleton is law (staged adoption)

## ADDED Requirements

### Requirement: the component docs page skeleton

Every `/docs/components/<name>.html` page SHALL present, in order:
Intro (the one-paragraph contract), Install (copy-ready
`npx jixoai-ui add <name>`), Usage (minimal working example), Examples
(ability-named demos, each with collapsible code), API (a props table:
Prop / Type / Default), See Also (related component links).

Adoption is STAGED, not partial-by-omission: the change commits a
machine-readable scope file (pilot routes + the remaining backlog,
each with an owner and a successor change); the lint HARD-FAILS every
in-scope route and WARNS on out-of-scope routes while printing the
backlog. The successor change flips the lint to hard-fail-everywhere
(the staged exit criterion).

#### Scenario: a pilot page misses a section

- GIVEN a route listed in the staged scope file
- WHEN it lacks an Examples section
- THEN `verify:docs-structure` fails naming the page and the missing
  section

#### Scenario: an out-of-scope page

- GIVEN a route NOT in the staged scope file
- WHEN it lacks sections
- THEN the lint warns and increments the printed backlog without
  failing the gate

### Requirement: demos are named by ability

Example/demo names SHALL use the ability grammar ("with clear button",
"async loading", "multiple chips") — one phrase names one capability.
Registry-level variant items (when promoted) take the
`<name>-<ability>` suffix convention.

#### Scenario: naming a new demo

- WHEN an examples section gains a demo
- THEN its name states the ability, not a number or a scene noun

### Requirement: the canvas stage carries theme and density toggles

The component-canvas stage SHALL offer light/dark and density-tier
toggles applied to the demo surface, so every demo is reviewable in
both themes and every density without page-level switches. Toggle
STATE stays composition-first: the canvas renders the controls and
the scoping attributes; the hosting page owns the state.

#### Scenario: reviewing a dialog in light mode

- WHEN the theme toggle on the canvas stage flips to light
- THEN only the demo surface re-themes (the docs chrome stays put)
