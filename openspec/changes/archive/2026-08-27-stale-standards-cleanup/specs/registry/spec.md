# registry — delta

## MODIFIED Requirements

### Requirement: single-source item authoring

Every distributable artifact SHALL originate in `registry/files/**`; nothing
hand-edits `public/r/*.json`. `registry.json` is the machine index and
stays in lockstep with the file tree.

#### Scenario: adding a component

- GIVEN a new component `foo`
- WHEN it is authored under `registry/files/ui/foo/foo.svelte` (the
  folder-per-item law — one directory per item under
  `registry/files/ui/<name>/`, the tw4-css-modularization form; the
  flat `registry/files/ui/foo.svelte` path this scenario historically
  taught was pre-tw4) and declared
  as an item (`type: registry:ui`, files `[{path, target}]`) in
  `registry.json`
- THEN `shadcn build` emits `public/r/foo.json` without manual steps
- AND `apps/www` installs the same-source copy (see the mirror-sync spec)
