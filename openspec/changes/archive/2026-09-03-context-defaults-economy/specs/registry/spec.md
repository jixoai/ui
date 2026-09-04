# registry delta — defaults files and axis modules: two-tier ownership

## ADDED Requirements

### Requirement: the defaults tooling and axis modules have two-tier registry ownership

SHARED tier: `lib/defaults.svelte.ts` (the composition tool:
`defineComponentDefaults` / `literalSlot` / `absentSlot` / the slot
brand) and the
axis modules (`lib/paint.svelte.ts` with `PAINT_ZONE_KEY` and
`providePaintZone`) SHALL be registry:lib items (the density/entity
precedent, rooted at `registry/files/lib/**`), byte-mirrored to
`apps/www/src/lib/`, listed in the mirror manifest, carrying ZERO
imports of the site-only context-plugin kernel (plugin seams go
through `Symbol.for` global keys) — and zero imports of anything
under `registry/files/ui/**` (the lib→ui reverse dependency is
gate-forbidden). FAMILY tier: each `*-defaults.svelte.ts` lives
INSIDE its family folder as a member file of that registry:ui item
(mirrored pair, installed with the item). registryDependencies SHALL
reflect the real importers of the shared tier (the gen-icons
manifest precedent): the press-button, icon-button, and button-group
items gain their defaults files in `files` and the two lib items in
`registryDependencies`.

#### Scenario: a fresh consumer installs a component with ambient props

- GIVEN a registry consumer installs the press-button item
- WHEN the registry resolves its files and dependencies
- THEN the shared-tier defaults tool and paint axis module arrive as
  registry dependencies (the density item's delivery shape) and the
  paint slot resolves (identity outside any zone) with no kernel
  download

#### Scenario: the mirror gate

- GIVEN any defaults or axis file edited on either side
- WHEN `verify:mirror` runs
- THEN the pair matches or the gate fails

#### Scenario: a family defaults file installs with its item

- GIVEN `@ui/press-button/press-button-defaults.svelte.ts` exists
- WHEN the item is installed
- THEN the defaults file arrives with it (same item payload, no
  separate registry entry)
