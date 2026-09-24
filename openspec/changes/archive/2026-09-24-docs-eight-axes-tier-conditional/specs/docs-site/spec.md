## ADDED Requirements

### Requirement: every component page documents the eight axes at its recorded tier

Every `/docs/components/*.html` page SHALL document the universal eight-axis
surface (size · shape · radius · density · color · theme · elevation · motion)
at the depth its RECORDED tier calls for — the tier and its justification live
in the docs-eight-axes campaign ledger (`assignment.json` per page), and the
two-review sign-off enforced depth-at-tier at closure. The archived
docs-eight-axes-mdn delta's unconditional per-axis-table SHALL is superseded
by this tier-conditional form (Owner ruling 2026-09-24, decision #13 option
B+C).

#### Scenario: a tier-2/3 page (完全重构/优化重构) documents its real axis surface

- GIVEN a page whose recorded tier is 2 or 3
- THEN its axis section carries a bespoke per-axis table for the axes the
  family actually carries (mechanism with real carrier/var names · named
  steps · number-lane unit · default), grouped runnable examples, deviations
  cited to the migration census, and one real `query()` case
- AND any absent axis is documented with the census citation — never silently
  omitted, never invented

#### Scenario: a tier-1 page (简单重构) satisfies the contract through the shared section

- GIVEN a page whose recorded tier is 1
- THEN the shared universal props section renders from the one generated
  source (`data-jx-props-table-universal`) AND the page names the family's
  real mechanisms for the axes it materially consumes (prose or table rows)
- AND a `query()` case is present when the family carries lane-bearing axes
  the demo can drive, else the absence is named

#### Scenario: the successor gate flip stays scoped to the skeleton contract

- WHEN `2026-08-30-docs-demo-standard-global-gate` flips the skeleton lint
  to hard-fail-everywhere
- THEN axis depth is adjudicated against this requirement's depth-at-tier
  rule — a tier-1 page without a bespoke axis table does not fail that flip
  by that fact alone
- AND the skeleton-contract gaps (Install / See-Also / Usage-order) remain
  that successor's backlog until emptied, per `scripts/docs-skeleton-scope.json`
