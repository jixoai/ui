## ADDED Requirements

### Requirement: the universal props documented once

The eight axes and their grammar SHALL be documented ONCE (a dedicated
concept page: the grammar 总纲, per-axis lanes, query(), degrade tables) and
every component doc page SHALL render the universal props section from that
one shared source (PropsTable driven by the shared meta block — no per-page
hand copies).

#### Scenario: a doc page shows the shared section

- GIVEN any of the 110 component pages
- THEN the props table includes the universal section generated from the
  shared source, and editing the shared source changes every page

#### Scenario: the concept page explains the grammar

- GIVEN the explicit-props concept page (route frozen:
  `apps/www/src/routes/docs/universal-props.html/`)
- THEN it presents the three-lane grammar, the query() wrapper with media
  vs container keys (`sm` vs `@sm`, named containers as `@sm/card`), and
  the carrier law, with live dogfood examples
- AND the 110-page manifest receipt holds: a script asserts every
  component page under `docs/components/*.html/` renders the shared
  universal section (grep for the section marker in the built HTML) —
  page count and marker count must be equal
