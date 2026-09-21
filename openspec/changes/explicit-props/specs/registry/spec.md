## ADDED Requirements

### Requirement: the universal contract in the registry data model

The registry SHALL ship the alias ladder as a CONCRETE artifact chain
(Codex r2 B6, r3 sharpened — not deferred to W5). The frozen entries:

```jsonc
// registry.json — the kernel lib item (new):
{
  "name": "universal-props", "type": "registry:lib",
  "files": [
    { "path": "registry/files/lib/universal-props.schema.ts", "target": "@lib/universal-props.schema.ts" },
    { "path": "registry/files/lib/universal-props.css",      "target": "@lib/universal-props.css" }
  ]
}
// every migrated ui item gains:
"registryDependencies": ["universal-props", "tokens", "jixoai-theme"]
```

`universal-props.css` is GENERATED from the schema (the
`--jx-<axis>-<alias>` definitions + the §14 @supports ladder + the §4
density composition layer). The clean-consumer receipt (task 5.4) asserts
three things verbatim: (1) `shadcn add` lands both files at `src/lib/…`
(the @lib targets); (2) a rendered named step REFERENCES the var
(computed style shows `var(--jx-size-large)`, never an inlined remap
value); (3) overriding the var in the consumer's css flips the rendered
size — pure CSS, no resolver runtime.

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
