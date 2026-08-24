# mirror-sync — delta

## MODIFIED Requirements

### Requirement: same-source copies

`apps/www/src/lib/ui/<name>/**` SHALL mirror
`registry/files/ui/<name>/**` folder-for-folder, with cross-root files
mapped by a FIXED canonical mapping table (no per-run freedom):

```
registry/files/ui/<name>/**   → apps/www/src/lib/ui/<name>/**
registry/files/lib/<x>        → apps/www/src/lib/<x>          (engine/lib files)
registry/files/theme/jixoai.css → apps/www/src/lib/jixoai.css
registry/files/theme/jx-pure.css → apps/www/src/lib/jx-pure.css
```

Drift detection MUST be complete: a committed manifest
(normalized relative paths + sha256 per file) covering every mapped
pair, with an explicit exceptions inventory split into two lists —
pre-migration known exceptions (e.g. mirror-only
`component-tree-nav.svelte` site chrome) and post-migration permanent
exceptions (site-only files that never become items). After P1, an
item's css living outside its folder is NOT an allowed exception.
The manifest-replacing lock regenerates on every mirror-touching
commit.

#### Scenario: registry component edited

- GIVEN `registry/files/ui/kbd/kbd.svelte` gains a prop
- WHEN the mirror is updated and the manifest regenerated
- THEN both parity tests are green and `apps/www` renders the new prop

#### Scenario: drift introduced (either side)

- GIVEN a one-sided edit, addition, or deletion (registry without
  mirror, mirror without registry, or stale manifest)
- WHEN the source↔mirror test runs
- THEN it fails, naming the drifted file and side

### Requirement: parity verification (dual invariants)

Two invariants MUST remain separately named and separately tested:
(1) source↔published-payload (the existing
`registry-payload-parity.spec.ts`); (2) source↔mirror (the new
manifest test). Test names and failure messages MUST distinguish the
two (a payload-staleness failure says "re-run shadcn build"; a mirror
failure says "sync the mirror + regenerate the manifest").

#### Scenario: component behavior change

- WHEN a component's interactive law changes (e.g. press physics)
- THEN the corresponding verify script / spec exercises it in a real
  browser before the change is considered done
