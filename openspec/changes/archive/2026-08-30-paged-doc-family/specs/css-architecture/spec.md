# css-architecture delta — the audited print-projection whitelist

## ADDED Requirements

### Requirement: print-projection overrides live in a named unlayered whitelist

Print rules that must defeat the utilities layer SHALL live in an
UNLAYERED `:where()` whitelist, registered item by item (selector,
forced properties, the utility law they override) — initially:

| selector | forced result |
| --- | --- |
| `[data-jx-print="hide"]` | `display: none` |
| `[data-jx-print="flatten"]` | `overflow: visible; max-block-size: none` |
| `[data-jx-canvas-scroll]` | `overflow: visible; max-block-size: none` |
| `[data-jx-code-card-pre]` | `overflow: visible; max-block-size: none` |
| `[data-jx-props-table-scroll]` | `overflow: visible; max-block-size: none` |

Every other print rule SHALL stay inside `@layer components`. A probe
 SHALL assert, under print media with `display:flex`, `overflow:auto`
and a `max-block-size` utility all present, that the whitelist wins;
the same assertions run for the sim projection. The sim projection
copy SHALL be excluded under real print via `@media not print`.

#### Scenario: utility fights the whitelist

- GIVEN a scroll layer carrying `overflow:auto` and
  `max-block-size: min(32rem,60vh)` utilities plus the canvas-scroll hook
- WHEN print media applies
- THEN computed overflow is visible and max-block-size is none
