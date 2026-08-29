# component-authoring — spec delta

## ADDED Requirements

### Requirement: components consume the generated icon module

Registry components SHALL NOT embed hand-written `<svg>` glyph
markup. Decorative icons come from the generated `$lib/icons`
module via `{@html icons.x}`; non-default stroke widths (2.5 /
1.75 / 1.5) ride scoped CSS overrides on the consuming context —
never edited geometry. Structural ornaments that are not
icon-library glyphs (e.g. the tooltip caret polygon) are exempt
from the icon module but MUST be declared in the change record.

#### Scenario: a component hand-draws a lucide-style glyph

- GIVEN a registry component file
- WHEN an inline `<svg viewBox="0 0 24 24" fill="none"
  stroke="currentColor">` glyph appears in markup
- THEN it is a migration miss — the glyph belongs in the
  gen-icons manifest

#### Scenario: a caret needs a heavier stroke

- GIVEN a component consuming `{@html icons.chevronDown}` at sw 2.5
- WHEN the surrounding rule sets `stroke-width: 2.5` on the svg
- THEN the presentation attribute yields to the CSS cascade and no
  manifest variant is created
