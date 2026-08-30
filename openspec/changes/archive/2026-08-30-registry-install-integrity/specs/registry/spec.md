# registry delta — dependency resolution is part of the distribution contract

## MODIFIED Requirements

### Requirement: registryDependencies mirror actual imports

Dependency truth is OWNERSHIP-RESOLVED through `registry.json`
`files[].target` (raw alias matching is not the test): every declared
`@jixoai/*` edge SHALL name an existing item; every cross-item import
of an owned file SHALL have a declared edge; a declared-but-unimported
edge SHALL fail UNLESS it is a structured install prerequisite — the
theme sheet is the canonical case (every registry:ui item declares
`@jixoai/jixoai-theme` without importing it). `verify:deps` enforces
all three with the four-case fixture matrix (dangling FAIL /
undeclared cross-item import FAIL / theme prerequisite PASS / dead
non-prerequisite FAIL).

#### Scenario: a dangling registry dependency

- GIVEN any item whose `registryDependencies` lists `@jixoai/foo`
- WHEN `registry.json` has no item named `foo`
- THEN `npm run verify:deps` fails naming the offender and the missing
  target

#### Scenario: an undeclared cross-item import

- GIVEN an item whose owned files import a file owned by another item
  (target-resolved, e.g. `$lib/toc-engine`)
- WHEN the item's `registryDependencies` does not list the
  corresponding `@jixoai/*` item
- THEN `npm run verify:deps` fails naming the file and the undeclared
  dependency

#### Scenario: an item's declared icon dep is unused

- GIVEN an item whose files never import `$lib/icons`
- WHEN registry.json still lists `@jixoai/icons`
- THEN the registry surface check flags the dead dependency
  (unchanged — now enforced by `verify:deps`)

#### Scenario: the theme install prerequisite

- GIVEN a registry:ui item that declares `@jixoai/jixoai-theme`
  without importing it
- WHEN `verify:deps` runs
- THEN the declaration PASSes as the structured install prerequisite

## ADDED Requirements

### Requirement: the homepage consumes a validated featured projection

The homepage catalog SHALL render from a featured projection exported
by `catalog.ts` — an explicit item-ID list validated against the
derived catalog (unknown or duplicate IDs throw at build time). The
registry-total count SHALL render from the catalog and be labeled as
the registry total; the featured row count is a separate curated
number and the two SHALL NOT be equated.

#### Scenario: the count never drifts

- WHEN an item lands in or leaves `registry.json`
- THEN the labeled registry total reflects the catalog on the next
  page build with no hand edits

#### Scenario: a featured row outlives its item

- WHEN an item is deleted while still referenced by the featured ID
  list
- THEN the projection validation fails the build naming the ghost ID

### Requirement: the published artifact carries its custom domain

`build-site.mjs` SHALL emit a `CNAME` file (`ui.jixoai.com`) into
`public/` so every deploy re-attaches the custom domain to the Pages
artifact, and `deploy.yml` SHALL smoke-test the deployed domain
(`/`, `/r/registry.json`, `/r/press-button.json` — all HTTP 200)
after publish.

#### Scenario: a fresh checkout deploys

- GIVEN a clean clone on a fresh Pages target
- WHEN `build-site.mjs` runs and `deploy.yml` publishes
- THEN the artifact contains `CNAME` and the smoke job verifies
  `https://ui.jixoai.com/r/registry.json` returns 200
