## ADDED Requirements

### Requirement: glass paint tuning flows through the --jx-glass-* token family

Glass paint tuning SHALL flow through ONE inheritable token family —
`--jx-glass-radius`, `--jx-glass-saturate`, `--jx-glass-fill`,
`--jx-glass-brightness` (plus the filter pointer
`--jx-glass-filter` for the liquid member, and the semantic layer's
state flag `--jx-glass-interactive`) — consumed by the glass
law sheet's stamp-channel selectors; component families override the
tokens with their own tuning (tabs 10px/1.5, toast 12px/saturate 1,
surface acrylic 14px/brightness 2/saturate 1) instead of
re-declaring paint formulas. The tokens' fallback values ARE the
retired `.jx-glass` values (14px / 1.35 / the 68% oklab color-mix of
var(--background) / brightness 1): computed-equivalent paint is
preserved (an identity function may append), and the two prior
hard-coded spellings in the theme sheet (`.jx-glass` utility —
retired; `.jx-surface` acrylic block) either flow through the family
or through the tokens.

#### Scenario: one tuning vocabulary, many paints

- GIVEN `.jx-surface[data-variant='acrylic']` painted
  `blur(14px) brightness(2)` with its own fill var before the family
  existed (no saturate — an appended identity must not change the
  rendered result)
- WHEN the glass family lands
- THEN the surface block's backdrop-filter consumes
  `blur(var(--jx-glass-radius)) saturate(var(--jx-glass-saturate))
  brightness(var(--jx-glass-brightness))` with surface-local
  overrides pinning 14px / 1 / 2 (computed-equivalent), AND the
  stamp-channel families (tabs indicator, toast viewport, toc rail,
  docs chrome, the print sim toolbar) carry no raw
  `backdrop-filter: blur(` glass formula in their own sheets — the
  formulas live in the law sheet alone (source-pin tested); surface
  acrylic's selector and motion branches stay theme-owned as the
  declared exception

#### Scenario: degradation stays token-honest

- GIVEN `prefers-reduced-transparency: reduce`
- WHEN the law sheet applies its media block
- THEN glass surfaces paint the solid fallback from the same token
  family (`var(--background)` ground) — transparency is an
  enhancement, never a dependency; no consumer needs its own
  reduced-transparency branch for glass paint
