# print-pipeline delta — the paper is white: light pinned, dark declared

## ADDED Requirements

### Requirement: the print projection renders in a declared theme scope, light by default

Paper is a physical material: the print projection SHALL render in a
DECLARED theme scope regardless of the live document's theme. The
default is the LIGHT scope (`jx-light` + `color-scheme: light` on the
pipeline-owned output root); only an explicit `theme: 'dark'` in the
page's PrintPageConfig declares the dark exception (black paper, light
ink). The stamp is idempotent per flight, and the theme rides the
artifact's stylesheet hash so a theme-only change rebuilds.

#### Scenario: a dark site prints dark ink on white paper

- GIVEN the site is in dark mode (html carries `.dark`)
- WHEN any print exit runs without a theme declaration
- THEN the output root carries the light stamp (`data-print-theme="light"`,
  the `jx-light` scope class, inline `color-scheme: light`) and every
  token-derived ink inside the pages resolves in the light palette;
  the `<html>` element itself is never touched (no screen flash, no
  theme-toggle race)

#### Scenario: the declared dark exception

- GIVEN a page declaring `printConfig.theme = 'dark'`
- WHEN a print exit runs (light or dark site, either)
- THEN the output root carries the dark stamp and the kernel's
  dark-paper family applies: `print-color-adjust: exact` on the
  stamped root (inherited down the whole ink chain) and the paged
  sheets paint `var(--background)` as the paper ground, in sim and
  in real print alike

#### Scenario: the grammar rejects an unknown theme

- GIVEN a printConfig carrying any theme value other than
  `'light' | 'dark'`
- WHEN the flight parses the config
- THEN the flight fails loud with a PageConfigError naming the field
  and nothing renders

### Requirement: a light declaration retires dark-variant utilities from the clone

The `dark:` Tailwind variant keys off `.dark` ANCESTRY and no scope
class can turn it off. Under a LIGHT declaration the pipeline SHALL
retire every `dark:`-prefixed class from the frozen clone (the clone
is the product; the live tree is never touched); under a DARK
declaration they SHALL stay (they are the adaptation). Class tokens
that merely contain `dark:` mid-name are not variants and stay.

#### Scenario: inline-code chips on paper

- GIVEN a docs page whose prose carries inline-code chips (plain
  light `--tok-*` utilities + `dark:[--tok-*]` overrides) and the
  site is dark
- WHEN a light-declared flight clones the content
- THEN the clone's chips keep their plain utilities and carry zero
  `dark:` classes, so the printed code ink is the light palette

### Requirement: the light scope re-flips CSS-scoped dark adaptations

Where a component sheet adapts to dark via a `.dark <descendant>`
CSS override, the same sheet SHALL re-declare the light formulas
under the `.jx-light <descendant>` scope, placed AFTER the dark
override (source order is the verdict at equal `:where()` weight).
The re-flip is required wherever the dark override carries literal
light-mix values (e.g. `oklch(1 0 0)`) that would wash out on white
paper.

#### Scenario: the code card's Shiki palette under a forced-light artifact

- GIVEN code-card.css declares `--tok-*` on `.jx-code-card` with a
  `.dark .jx-code-card` override (its function/meta colors mix toward
  literal white)
- WHEN a light-declared artifact renders under a dark document
- THEN the card's computed `--tok-token-function` carries the light
  formula — no `oklch(1 0 0)` literal survives — and nested dark
  islands (a canvas dark stage) still resolve dark ink through the
  formulas' lazy var() substitution

### Requirement: the print kernel stays theme-agnostic

kernel-print.css SHALL carry no theme-scope selectors (`.dark`,
`.jx-light`) and no light-branch rules: the theme sheet's own scope
classes and the pipeline stamp carry the light default. The only
theme-keyed rules the kernel owns are the DECLARED-dark paper family
(`print-color-adjust: exact` + the sheet ground), keyed on
`[data-print-theme='dark']` — one rule family for the exception,
zero for the default.

#### Scenario: the gate holds the kernel's theme-agnosticism

- WHEN the stylesheet gate parses kernel-print.css
- THEN the dark-paper family's two rules are present verbatim, and no
  `data-print-theme='light'`, `.dark` or `.jx-light` selector exists
  anywhere in the file
