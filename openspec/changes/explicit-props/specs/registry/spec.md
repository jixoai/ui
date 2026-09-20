## ADDED Requirements

### Requirement: the universal contract in the registry data model

The registry SHALL ship the alias ladder as a CONCRETE artifact chain
(Codex r2 B6 — not deferred to W5): the shared schema
(`registry/files/lib/universal-props.schema.ts` + the mirror) generates
`universal-props.css` (the `--jx-<axis>-<alias>` var definitions + the
@supports ladder), the kernel lib item CARRIES both files in its
`files[]`, dependent items gain the `registryDependencies` edge, and a
clean `shadcn add` installs them at the documented `@lib/` targets. The
clean-consumer receipt asserts: install lands the CSS, a named step
resolves through the var (not an inlined value), and a consumer override
of the var remaps it — pure CSS, no resolver runtime.

#### Scenario: a consumer resolves an alias from the registry

- GIVEN a clean consumer that added a component (which pulled the kernel
  lib item via registryDependencies)
- WHEN `density="lg"` (a legacy rung name) or a plugin-registered name is
  used
- THEN the resolved CSS references `--jx-density-lg` (or the registered
  var) from the installed `universal-props.css` — named steps never inline
  values, so consumer-side overrides need no resolver runtime

#### Scenario: shadcn-add carries the contract

- GIVEN a clean-install consumer adding any component
- WHEN the artifact lands
- THEN the component's universal axes resolve against the consumer's own
  alias table (defaults shipped with the kernel files), with no engine
  dependency beyond CSS
