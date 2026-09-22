## ADDED Requirements

### Requirement: every component page documents the eight axes per-component

Every `docs/components/*.html` page SHALL carry, per the baseline skill
(`skills/mdn-doc-style.md` §2.5), a per-axis table for the axes the
family actually carries (mechanism · named steps · number lane ·
default), grouped runnable examples, deviations cited to
`migration-census.md`, and one real `query()` case — replacing the
W3-era single uniform demo card as the page's axis documentation.

#### Scenario: a page documents its real axis surface

- GIVEN any component page
- THEN the page's axis section names each axis's mechanism on THAT
  family (real carrier/var names from the family source), its named
  steps and number-lane unit per `universal-props.schema.ts`, and its
  default
- AND any absent axis is documented with the census citation (never
  silently omitted, never invented)

#### Scenario: the shared sections stay generated

- WHEN any page renders
- THEN the PropsTable universal section renders from the one shared
  source (`data-jx-props-table-universal` present on all 110 pages)
- AND no page hand-copies grammar text that the concept page owns

### Requirement: tiered refactor with two-review sign-off

Each page's refactor tier (简单/优化/完全) is chosen by its coding agent
against the baseline skill §3 rubric, executed within it, and signed off
by TWO review agents per `research/assignment.json`; a tier-3 choice
without recorded justification is a review veto.

#### Scenario: a page reaches done

- GIVEN a page whose coding task and its two designated reviews are
  complete
- THEN no unresolved BLOCKER/MAJOR review finding remains
- AND the orchestrator's integration commit carries the page with all
  change gates green

### Requirement: the refactor adds zero class identities

Doc-page refactors SHALL introduce zero new class identities (the
tailwindless ratchet's zones pin `routes:1`), using the existing
stylex/cx page idiom only.

#### Scenario: the ratchet holds through the campaign

- WHEN any round's integration gates run
- THEN `npm run verify:tailwindless` reads the receipt
  `files=2 · identities=7 · occurrences=7 · zones{routes:1, site-libs:0,
  ui:6} · forms=42` verbatim
