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

- GIVEN the explicit-props concept page
- THEN it presents the three-lane grammar, the query() wrapper with media
  vs container keys (`sm` vs `@sm`, named containers), and the carrier law,
  with live dogfood examples
