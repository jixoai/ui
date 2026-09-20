## ADDED Requirements

### Requirement: the universal contract in the registry data model

The registry SHALL declare the universal-props contract as shared schema
data (the alias tables' shipped defaults and the axis grammars), so the CLI,
the docs site, and consumers resolve identical vocabularies from one source.
Per-item `docs` strings SHALL reference the universal grammar instead of
re-describing per-component size vocabularies.

#### Scenario: a consumer resolves an alias from the registry

- GIVEN the shipped registry data
- WHEN a consumer resolves `density="lg"` (a legacy rung name) or a name a
  plugin registered
- THEN it resolves identically to the kernel's var indirection
  (`--jx-density-lg`) — named steps never inline values, so consumer-side
  overrides need no resolver runtime

#### Scenario: shadcn-add carries the contract

- GIVEN a clean-install consumer adding any component
- WHEN the artifact lands
- THEN the component's universal axes resolve against the consumer's own
  alias table (defaults shipped with the kernel files), with no engine
  dependency beyond CSS
