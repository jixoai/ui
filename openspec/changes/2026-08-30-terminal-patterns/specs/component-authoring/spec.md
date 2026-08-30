# component-authoring delta — patterns compose, never fork

## ADDED Requirements

### Requirement: patterns are composition-only items

Pattern items are FLAT registry:ui items under the existing UI area:
`registry/files/ui/pattern-<name>/` (folder law unchanged; the prefix
is a product namespace, NOT a new source root), mirrored to
`apps/www/src/lib/ui/pattern-<name>/` with generated canonicalMain
manifest entries verified by `verify:mirror`. A pattern SHALL compose
ONLY the atoms it lists as direct `registryDependencies` — it SHALL
NOT re-implement atom behavior, duplicate atom paint, or add props to
an atom (a needed prop change belongs to the atom's own family
change, recorded as a followup). `verify:deps` compares
target-resolved imports to those direct edges; resolver traversal
owns only the transitive closure.

#### Scenario: a pattern needs a new atom prop

- GIVEN the hero marquee pattern wants a new press-button behavior
- WHEN the gap is found
- THEN the pattern records a followup instead of patching the atom,
  and ships without the behavior until the atom change lands

#### Scenario: installing a pattern

- WHEN `npx shadcn add @jixoai/pattern-login` runs in a fresh consumer
  (the A change's data-driven clean-install harness)
- THEN every directly declared atom installs through the resolved
  registryDependencies closure and the canonical entry BUILDS

### Requirement: patterns have canonical docs routes

Each pattern item SHALL own a canonical docs route under
`/docs/components/pattern-<name>.html` with a unique meta.group and
meta.href, a prerender entry, and docs-structure assertions — the
same contract as every registry:ui item. `/docs/patterns.html` is a
GALLERY linking those canonical routes, never their replacement.

#### Scenario: the docs navigation enumerates patterns

- WHEN the components navigation is built
- THEN each of the five pattern items appears exactly once with a
  unique canonical href
