# docs-site Specification

## Purpose
TBD - created by archiving change 2026-08-30-site-polish. Update Purpose after archive.

## Requirements

### Requirement: docs pages render honest state

Demo prose SHALL NOT render JavaScript `undefined`/`null` literals.
Every interpolation of a possibly-empty `$bindable` value into rendered
text uses an explicit empty-state glyph (em dash).

#### Scenario: a demo value is not picked yet

- GIVEN a demo whose bound value is empty at first render
- WHEN the page renders
- THEN the value slot shows `—`, never `undefined`

### Requirement: the docs page skeleton is lintable

Every `/docs/components/<name>.html` page SHALL have exactly one
`Usage` section, a PLAYGROUND section when the component is
interactive, and a page title. Demo content SHALL NOT emit real
headings: the lint targets consumer-authored content inside the
canvas's `data-doc-demo-content` wrapper only — ComponentCanvas's own
structural chrome (title/Playground headings) is exempt. The lint
(`verify:docs-structure`) enforces this on the built output and rides
`verify:all`, with fixtures proving canvas chrome passes and a
consumer heading inside the wrapper fails.

#### Scenario: a page grows a second Usage section

- WHEN a docs page edit introduces a duplicate `Usage` heading
- THEN `npm run verify:docs-structure` fails naming the page

#### Scenario: demo copy pretends to be a heading

- GIVEN consumer-authored content inside the `data-doc-demo-content`
  wrapper
- WHEN it renders an `h2` for demo copy
- THEN the lint fails naming the page; the same copy as a styled
  non-heading passes

### Requirement: development serves the registry

The dev server SHALL serve `/r/*.json` from the repo-root `public/r/`
(read-only fallback) so registry links are verifiable during
development. `scripts/build-site.mjs` remains the only WRITER of
`public/r/`.

#### Scenario: a contributor opens the registry overview in dev

- GIVEN `npm run site` is running
- WHEN the registry-overview table's `registry.json` link is followed
- THEN JSON is served (HTTP 200), not the SPA 404 fallback

### Requirement: internal surfaces are marked internal

Verification-only pages (`/parity.html`, `/blueprints.html`,
`/probe-folder-css`) SHALL carry `noindex` and enough on-page context
(title + one-paragraph purpose) to be self-explanatory when reached
from a search or a stale link.

#### Scenario: a search engine finds the parity page

- WHEN `/parity.html` is crawled
- THEN the page declares `noindex` and states its verification purpose

### Requirement: enterprise data surfaces are demo-complete

The table / transfer / tour / descriptions / statistic docs pages
SHALL each carry ability-named composition recipes covering their
market-standard forms (table: sort, filter, pagination, row
selection, row actions, column visibility, sticky header, and one
composed toolbar example; transfer: oneWay; tour: non-modal +
placement; descriptions: vertical + responsive + extra; statistic:
countdown). A discovered missing atom API SHALL be recorded in the
change's `followups.md` rather than worked around silently.

#### Scenario: composing the tasks-table demo

- WHEN the composed toolbar demo is authored
- THEN it uses only public component behavior and every interactive
  part is keyboard-reachable

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
