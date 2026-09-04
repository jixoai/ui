# Delta: component-authoring — R2 浮+引 (Figure counters and Reference resolution)

## ADDED Requirements

### Requirement: the numbered line — Section declares the counter domain

Numbering SHALL be an explicit declaration on the line primitive, never
an implicit depth inference.

- A Section that declares `numbering` becomes THREE things at once: a
  numbered subtree root (it receives a chapter ordinal), the FLOAT
  COUNTER DOMAIN for every Figure in its subtree, and the reset point
  for descendant section counters (the decimal tree `3 → 3.1 → 3.2 →
  3.2.1`).
- A Section that declares nothing keeps today's behavior byte-identical:
  no number display, no DOM delta (the explicit-structure law).
- `floatScope` configures counter continuity per Figure kind at the
  DOMAIN level only: every kind defaults to `'chapter'`;
  `'document'` is the explicit exception (the ASME equation idiom). A
  per-Float-instance scope declaration is a forbidden shape — counter
  identity must stay determinable at the domain.
- Numbers are the display currency of DOM order: runtime resolution
  follows render order, reordering renumbers, and addressing ALWAYS
  rides an explicit `id` — a number is never an address (the upgraded
  Paged* ruling).

#### Scenario: an undeclared section is byte-identical

- WHEN any Section renders without a `numbering` declaration
- THEN its DOM equals today's output exactly — no number display, no
  attribute delta

#### Scenario: the decimal tree and the float domain hang off one declaration

- WHEN a Section declares `numbering` and contains child Sections and
  Figures
- THEN the root renders its ordinal, children continue the decimal
  tree, and each Figure kind counts from 1 inside the domain

#### Scenario: renumbering follows reorder while the id never moves

- GIVEN two Figures with explicit ids under one declared domain
- WHEN their DOM order is swapped
- THEN each keeps its id and swaps its display number (the display
  currency law)

### Requirement: Figure — the 浮 primitive renders number, caption, and the manual backlink lane

The numbered, captioned, referenceable floating unit SHALL be a wrapper
primitive named by its DOM contract.

- `<Figure kind>` renders `<figure data-jx-figure={kind}>` with a
  `<figcaption>` (label + resolved number + caption slot); any point
  nests in the content slot (CodeCard today, the R6 industry points as
  they land). The line carries structure (number/anchor/caption); the
  point carries industry semantics — never merged.
- `kind` values this round: `figure | table | equation | listing`; the
  value domain is the harvest registry, open to R6 extension.
- `id` is optional: a Figure without an id still numbers (display
  currency) but is not referenceable — stable addressing is the id's
  job, documented at the prop.
- `citedIn?: string[]` is the MANUAL backlink lane (Owner 2026-09-04):
  explicitly declared display strings render verbatim in the caption
  tail and emit `data-cited-in`. The component header MUST document the
  GAP: automatic backlink RENDERING is deliberately absent — the
  automatic backlink lives only in the harvest layer (the inversion of
  `refids[]`); the re-entry condition is a genre that actually prints a
  cited-at list (then: reverse-registration context, pure increment).

#### Scenario: the manual lane renders what the author declares

- WHEN a Figure declares `citedIn={['§ 3.1', '§ 5.2']}`
- THEN the caption tail renders those strings and `data-cited-in`
  carries them for harvest
- WHEN no `citedIn` is declared
- THEN nothing renders and no registration machinery runs (the gap is
  the documented default)

### Requirement: Reference resolves its display grammar from the target

The typed cross-link SHALL carry zero grammar knowledge of its own.

- `<Reference to>` renders the TARGET's own display form: a Figure
  renders per its kind (`Eq (4.5)` / `Fig 2-3` / `Table 6-1` /
  `Listing 3`), a numbered Section renders `§ 3.2.1`, an unnumbered
  target degrades to its title (the 参见 form). Change the target's
  kind, chapter, or order and every reference follows automatically.
- The children slot is the explicit escape hatch: custom prose replaces
  the display form while the link and addressing stay.
- A missing target id is a loud fallback: `console.warn` plus a visible
  `??(to)` marker — never a throw, never a blocked print.
- The reference emits its forward face (`data-ref-to`) for the harvest
  contract's `refids[]`.

#### Scenario: the four target states resolve each in its own grammar

- WHEN a Reference targets an equation Figure, a numbered Section, an
  unnumbered target, and a nonexistent id
- THEN they render `Eq (4.5)`, `§ 3.2.1`, the target's title, and the
  visible `??(id)` marker with a console warning respectively
