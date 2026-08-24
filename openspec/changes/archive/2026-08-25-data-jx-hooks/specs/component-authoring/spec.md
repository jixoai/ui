# component-authoring — delta

## ADDED Requirements

### Requirement: semantic hooks are data-jx-* attributes, never css-less classes

Component markup SHALL carry every css-less semantic anchor as a
`data-jx-*` attribute: static hooks as boolean attributes
(`data-jx-foo`), variant families as ONE valued attribute
(`data-jx-foo={variant}`). Every `jx-*` CLASS remaining in markup MUST
be css-defined somewhere (state machines, kernels, Tier-2 frozen
vocabulary, residue statics — the cascade law's territory); a repo-wide
scan (`scripts/verify-hook-law.mjs`) MUST fail on any css-less jx-*
token and on any data-jx-* name shadowing a css-defined selector.
Reference sites (tests, docs, scripts, scenes) query the attribute form
(`[data-jx-foo]`, `[data-jx-foo="v"]`).

#### Scenario: a component needs a semantic anchor

- WHEN tests/docs/JS must target an element that carries no authored
  css selector
- THEN the markup carries `data-jx-foo` (boolean) or `data-jx-foo={v}`
  (variant) and the class attribute holds only utilities and
  css-defined selector names

#### Scenario: the placement law is auditable

- WHEN `verify-hook-law.mjs` runs
- THEN it fails on any css-less jx-* token repo-wide and on any
  data-jx-*/css-defined name collision

#### Scenario: consumer queries a hook

- GIVEN the documented breaking markup-contract change
- WHEN a consumer targets a hook
- THEN they query `[data-jx-kbd]`-style attributes (the `.jx-kbd`
  class era is gone for css-less hooks)
