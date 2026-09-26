# docs-site deltas

## ADDED Requirements

### Requirement: the timeline docs page carries the reui demo families and the fractional-progress demos (Owner 2026-09-15 r2)

The timeline docs page SHALL demonstrate the full reui-standard
capability surface AND our highlights beyond it, every demo inside the
canvas-stage skeleton (the docs lint's scope): the TWELVE official
reui families, ONE stage each (the official full titles are the
inventory's source of truth — research/reui-family-inventory.md —
whose mapping table pins each stage's aria-label; docs short names
are display aliases) — Basic · roadmap · order status
· git activity · milestones · pipeline steps · roadmap items ·
vertical · horizontal with leading labels · deployment log ·
activity feed with user avatars · compact horizontal milestone —
PLUS our highlights: the 8-directional dot-slot matrix, the spine
presets, the custom geometry snippet, and a decimal-progress tween +
controlled-stepper demo (playing `value` through fractional
mid-states so the path draw is visible). The page's props
table SHALL document the value contract (`defaultValue` / `value` /
`onValueChange`, decimals; item `step`). The scroll-area docs page
SHALL demonstrate the radius and width configuration; the
effects/press-button copy SHALL state the scope-token fill basis.

#### Scenario: the families render on the page

- GIVEN the upgraded timeline docs page
- THEN each of the TWELVE official families mounts in its own canvas
  stage (aria-label matching the inventory's frozen mapping table,
  one row per family) and the docs structure
  lint passes on the page (skeleton-scoped, as the standing gate
  runs it)

#### Scenario: the value contract is demonstrated live

- GIVEN the controlled-stepper and decimal-tween demos
- THEN a visitor can move the value by the buttons and watch both the
  discrete completion and the fractional stroke respond (probe: the
  stepper buttons change `data-completed` counts; the tween demo's
  stroke dashoffset varies over time)
