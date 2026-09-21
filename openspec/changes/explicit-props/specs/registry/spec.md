## ADDED Requirements

### Requirement: the universal contract in the registry data model

The registry SHALL ship the alias ladder as a CONCRETE artifact chain
(Codex r2 B6, r3 sharpened — not deferred to W5). The frozen entries:

```jsonc
// registry.json — the kernel lib item (new; PRESCRIBED for W1 — Codex r5
// §18 vocabulary; deps use the @jixoai/ namespace form the registry
// already speaks, and files[] entries carry the "type" every real record
// carries):
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "universal-props", "type": "registry:lib",
  "title": "jixoai universal props (the eight-axis kernel)",
  "description": "The shared explicit-props kernel: the schema (grammar types + alias defaults) and the generated CSS ladder (alias vars, @supports verdicts, density composition).",
  "files": [
    { "type": "registry:file", "path": "registry/files/lib/universal-props.schema.ts", "target": "@lib/universal-props.schema.ts" },
    { "type": "registry:file", "path": "registry/files/lib/universal-props.css",      "target": "@lib/universal-props.css" }
  ]
}
// every migrated ui item gains:
"registryDependencies": ["@jixoai/universal-props", "@jixoai/tokens", "@jixoai/jixoai-theme"]
```

`universal-props.css` is GENERATED from the schema (the
`--jx-<axis>-<alias>` definitions + the §14 @supports ladder + the §4
density composition layer). The clean-consumer receipt (task 5.4) asserts
three things verbatim — split by WHAT each layer can prove (Codex r4 B8:
computed style resolves vars, it never preserves authored `var()` text):
(1) `shadcn add` lands both files at the `@lib` targets (filesystem
check); (2) the INSTALLED component css REFERENCES `var(--jx-size-large)`
(textual check over the landed css) and the rendered element's computed
font-size equals the alias's defined px (computed check); (3) overriding
`--jx-size-large` in the consumer's css FLIPS the computed px (the
override receipt) — pure CSS, no resolver runtime.

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
