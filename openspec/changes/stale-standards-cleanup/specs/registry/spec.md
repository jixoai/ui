# registry — delta

## MODIFIED Requirements

### Requirement: adding a component (scenario correction)

- GIVEN a new component `foo`
- WHEN it is authored under `registry/files/ui/foo/foo.svelte` (the
  folder-per-item law — one directory per item under
  `registry/files/ui/<name>/`) and declared as an item
  (`type: registry:ui`, files `[{path, target}]`) in `registry.json`
- THEN `shadcn build` emits `public/r/foo.json` without manual steps
- AND `apps/www` installs the same-source copy (see the mirror-sync
  spec)
