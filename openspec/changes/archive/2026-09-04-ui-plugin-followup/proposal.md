# ui-plugin-followup — residual work from the V2 fusion + plugin rounds

## Why

The V2 standard-layer fusion and the @jixoai/ui-plugin package are
implemented and green (76/76 plugin + 573/573 site + strict VALID).
This change tracks the REMAINING work items identified across Codex
review rounds r0-r5 and Owner feedback, organized by priority.

## What Changes

1. **Architecture completion**: DOM-AST isomorphism gate, face icon
   variable layering, three-budget baselines
2. **Component migration**: composite components adopt the standard layer
3. **Plugin hardening**: opentype.js externalization, HMR cleanup,
   WOFF2 real tests, geometry consistency gate
4. **Publishing readiness**: package visibility, consumer docs
5. **Openspec hygiene**: archive completed changes

## Impact

- No breaking changes — all items are additive or refinement
- Priority order: architecture > components > plugin > publishing
