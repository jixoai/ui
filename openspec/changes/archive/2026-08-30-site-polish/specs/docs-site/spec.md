# docs-site delta — the docs surface never lies

## ADDED Requirements

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
