# registry deltas (slot-values-first)

## MODIFIED Requirements

### Requirement: the defaults tooling and axis modules have two-tier registry ownership

SHARED tier: `lib/defaults.svelte.ts` (the composition tool:
`defineComponentDefaults` / `defineLiteralSlot` / `defineOpenSlot` /
`absentSlot` / the slot brand), the axis modules (`lib/paint.svelte.ts`
with `PAINT_ZONE_KEY`, `providePaintZone`, `getPaintZone`, and
`definePaintSlot`), AND the context-plugin kernel
(`lib/context-plugin.svelte.ts` — a registry:lib item since
context-plugin-v2, the first runes-carrying lib item) SHALL be
registry:lib items (the density/entity precedent, rooted at
`registry/files/lib/**`), byte-mirrored to `apps/www/src/lib/`,
listed in the mirror manifest, carrying zero imports of anything
under `registry/files/ui/**` (the lib→ui reverse dependency is
gate-forbidden). The kernel imports NOTHING beyond `svelte` and
same-tree lib modules (env vocabulary owned in-kernel, providers
injected); the density item imports the kernel directly (the `Symbol.for`
structural seam is RETIRED — the plugin scope key is a
module-private symbol); defaults and paint remain kernel-free. (`locale.svelte.ts` already carries `$state` in
this tree — the runes-carrying kernel item extends an existing
shape, not a new one.) FAMILY tier: each `*-defaults.svelte.ts`
lives INSIDE its family folder as a member file of that
registry:ui item (mirrored pair, installed with the item).
registryDependencies SHALL reflect the real importers of the shared
tier (the gen-icons manifest precedent): the press-button,
icon-button, and button-group items gain their defaults files in
`files` and the two lib items in `registryDependencies`; the
density item gains `@jixoai/context-plugin`.

#### Scenario: a fresh consumer installs a component with ambient props

- GIVEN a registry consumer installs the press-button item
- WHEN the registry resolves its files and dependencies
- THEN the shared-tier defaults tool and paint axis module arrive
  as DIRECT registry dependencies, the kernel arrives TRANSITIVELY
  through the density item (press-button declares density for
  `densitySlot`; density declares the kernel) — the direct
  dependency faces of defaults and paint stay kernel-free, and
  every density consumer carries an installable plugin economy

#### Scenario: a fresh consumer installs the plugin economy

- GIVEN a registry consumer installs the density item
- WHEN the registry resolves its dependencies
- THEN the context-plugin kernel arrives as a registry:lib item
  and `definePlugin` products are installable outside the site

#### Scenario: the mirror gate

- GIVEN any defaults, axis, or kernel file edited on either side
- WHEN `verify:mirror` runs
- THEN the pair matches or the gate fails

#### Scenario: a family defaults file installs with its item

- GIVEN `@ui/press-button/press-button-defaults.svelte.ts` exists
- WHEN the item is installed
- THEN the defaults file arrives with it (same item payload, no
  separate registry entry)
