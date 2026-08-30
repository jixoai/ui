# context-plugins delta — contexts become intervenable

## ADDED Requirements

### Requirement: plugins are pure immutable interventions

A ContextPlugin SHALL be a pure value transformer set: `before`
(entry-side) and `after` (projection-side) each take an immutable value
and return a NEW value; mutating inputs is a contract violation. The
pipeline SHALL compose these as derived projections over the single
writable raw state; recomputation scope is asserted by a
dependency-count test (not claimed as performance).

#### Scenario: a print plugin swaps density

- GIVEN a plugin whose before maps density to the existing sm tier
  under env.medium === 'print'
- WHEN the medium derives 'print'
- THEN consumers read sm density and the original context object was
  never mutated

### Requirement: registration is root-scoped and stacks

`provideContextPlugins(plugins)` SHALL provide at a root; nested
roots stack parent-first so the nearest root's interventions land
last. There SHALL be no module-level singleton registry.

#### Scenario: nested roots

- GIVEN an outer root providing [A] and an inner root providing [B]
- WHEN a context under the inner root resolves
- THEN A's intervention applies, then B's — B may override A

### Requirement: the lifecycle covers init, filter, before, after

`init` SHALL be an environment-free one-time defaults injection (later
registrations override earlier; NO veto power); `filter` SHALL be the
reversible eligibility gate (a closed filter excludes the plugin from
that context while the context stays mounted — e.g. medium-gated,
surviving screen→print→screen round-trips); `before`/`after` SHALL
intervene on the value's entry and projection sides. Ordering SHALL
follow the user array with stable 'pre'/'post' anchors (vite
semantics); the plugin chain is captured when the context instance is
created (nested roots compose parent-first, nearest root last).

#### Scenario: gated exclusion is reversible

- GIVEN a print plugin whose filter matches env.medium !== 'screen'
- WHEN the medium goes screen → print → screen
- THEN its intervention applies and then lifts, and the exposed value
  and its reference identity return exactly to the raw provider value

### Requirement: zero plugins is the identity fast path

With no plugins provided, contexts SHALL behave as the pre-plugin
system (the full existing suite is the regression proof) and the
composition is structurally skipped (a no-chain assertion, not a
performance claim).

#### Scenario: today's pages

- GIVEN any existing docs page (no plugin roots)
- WHEN rendered
- THEN density/medium behave exactly as before this change
