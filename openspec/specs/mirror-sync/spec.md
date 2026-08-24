# mirror-sync — apps/www same-source consumption (living spec)

> Capability owner: `apps/www/jixoai-ui.lock` +
> `apps/www/.jixoai-ui-version` + the parity test suite. The docs site
> consumes the registry from THIS repository with zero network: the
> installed files under `apps/www/src/lib/**` are intended as
> byte-identical copies of `registry/files/**`.

## Current contract (state: 2026-08-24, verified)

### Requirement: same-source copies (intended discipline)

`apps/www/src/lib/ui/*` mirrors `registry/files/ui/*` (and lib/theme
equivalently: `src/lib/jixoai.css`, `src/lib/jx-pure.css`). An edit to
one side is mirrored to the other in the same commit.

**Verified reality (2026-08-24 inventory):** the drift detection is
PARTIAL. `jixoai-ui.lock` hashes only 6 items; the vitest parity guard
(`registry-payload-parity.spec.ts`) compares published `public/r/*.json`
payloads against `registry/files/**` sources — it does NOT compare the
apps/www mirror. Known exceptions: `component-tree-nav.svelte` exists
mirror-only (site chrome, not a registry item); `toc.css` /
`website-scaffold.css` exist registry-side under `files/ui/` while the
mirror keeps them at `src/lib/` (import-path difference, not content
drift). A full source↔mirror manifest is not yet implemented — the
tw4-css-modularization change defines it.

#### Scenario: registry payload edited without rebuild

- GIVEN `registry/files/ui/<x>.svelte` changes
- WHEN vitest runs before the root `shadcn build` regenerates payloads
- THEN `registry-payload-parity.spec.ts` fails, naming the stale file

#### Scenario: mirror drift today

- GIVEN a one-sided edit to a mirrored file not covered by the 6-item
  lock
- THEN nothing fails today — the gap this spec records honestly

### Requirement: parity verification (dual invariants)

Two distinct invariants exist and MUST stay separately named/tested:
(1) source↔published-payload (the vitest guard above); (2)
source↔mirror content (intended; today only the partial lock).
Behavioral verification: the vitest suite (~25 spec files) plus root
`scripts/verify-*.mjs` playwright probes run against a RUNNING dev
server (`npm run site`, :5199).

#### Scenario: component behavior change

- WHEN a component's interactive law changes (e.g. press physics)
- THEN the corresponding verify script / spec exercises it in a real
  browser before the change is considered done
