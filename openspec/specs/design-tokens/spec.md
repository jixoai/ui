# design-tokens — the jixoai token-sheet law (living spec)

> Capability owner: `registry/files/theme/jixoai.css` (registry item
> `jixoai-theme`, mirrored at `apps/www/src/lib/jixoai.css` with
> `--brand-hue: 330`). One number — the hue — changes per project.

## Current contract (state: 2026-08-24)

### Requirement: OKLCH one-hue law

All colors are OKLCH with a single brand hue per project
(`--brand-hue`); dark mode drifts the hue -4°. Light/dark pairs ship in
`:root` / `.dark` blocks with color-scheme; `.jx-light` excludes
subtrees. Semantic tokens (success / warning / info / error) exist with
`-foreground` pairs; validation remaps valid→success, invalid→error
(destructive stays the monochrome inversion pair).

#### Scenario: rebranding a consumer site

- WHEN a consumer sets one number (`--brand-hue`)
- THEN the whole palette (primary, hover flows, chart harmony) follows

### Requirement: structure laws

Hard offset shadows (no blur), radius 0 with `corner-shape: bevel`
upgrade only (rounded-full reserved for status-dot-class pills),
mono-first typography (`--font-mono` body, `--font-nav` nav), terminal
surfaces (`--terminal*` tokens). Tailwind v4 `@theme` mappings live in
the registry sheet; the site's `app.css` only supplements what the sheet
leaves open (e.g. killing the default rounded scale) plus site-only
surfaces.

#### Scenario: a new surface needs the design law

- WHEN it consumes the token custom properties instead of literal values
- THEN dark mode, hue rebranding and the shadow/radius laws hold with
  zero per-surface work

### Requirement: degradation laws

`prefers-reduced-motion: reduce` neutralizes reveal/motion surfaces;
forced-colors reverts to native paint (carried by jx-pure's Part C for
the element face; site transitions neutralized site-side).

#### Scenario: reduced-motion user

- WHEN the OS requests reduced motion
- THEN entrances render in their final state with transitions removed
