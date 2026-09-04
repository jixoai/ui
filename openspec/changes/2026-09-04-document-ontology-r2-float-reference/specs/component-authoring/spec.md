# Delta: component-authoring — R2 浮+引 (Figure counters and Reference resolution)

## ADDED Requirements

### Requirement: the numbered line — Section declares the counter domain

Numbering SHALL be an explicit declaration on the line primitive, never
an implicit depth inference.

- A Section that declares `numbering` becomes THREE things at once: a
  numbered subtree root (it receives a chapter ordinal), the FLOAT
  COUNTER DOMAIN for every Figure in its subtree, and the reset point
  for descendant section counters (the decimal tree `3 → 3.1 → 3.2 →
  3.2.1`). Descendant sections need NO declaration of their own —
  inside a domain they receive numbers; the byte-identity guarantee
  applies ONLY to sections outside every numbering domain subtree.
- Counter resolution is a DOM-derived AUTO mode and SHALL claim the
  family-context law's existing auto-mode exception (state-sharing
  context otherwise carries state and behavior, never membership
  order): ordinals derive from `compareDocumentPosition` order over a
  reactive registry whose revision is bumped by a domain-root
  MutationObserver — registration order NEVER assigns numbers, and
  DOM mutation is the ONLY renumbering signal. The claim splits by
  shape: Reference resolution rides the exception's shell-plus-
  hydration form (forward references render the fallback in
  prerender, hydrate to the resolved form), while Figure numbering
  is SSR-complete (instantiation order = template order = static
  DOM order; hydration's first frame MUST match the SSR output) and
  touches the exception's class only through incremental renumbering.
  CSS counters are a forbidden implementation (print-fragmentation
  rewrites them and their values never reach the DOM); a number must
  land as DOM text plus `data-number`.
- `floatScope` configures counter continuity per Figure kind at the
  DOMAIN level only: every kind defaults to `'chapter'`; `'document'`
  is the explicit exception (the ASME equation idiom — one counter
  per document per kind, iterating only the domains that declare it).
  A per-Figure-instance scope declaration is a forbidden shape.
- Numbers are the display currency of DOM order: reordering
  renumbers, and addressing ALWAYS rides an explicit `id` — a number
  is never an address (the upgraded Paged* ruling).

#### Scenario: a section outside every domain is byte-identical

- WHEN any Section renders with no `numbering` declaration in its
  ancestry
- THEN its DOM equals today's output exactly — no number display, no
  `data-number` attribute

#### Scenario: the decimal tree and the float domain hang off one declaration

- WHEN a Section declares `numbering` and contains child Sections and
  Figures
- THEN the root renders its ordinal with `data-number`, undeclared
  children continue the decimal tree, and each Figure kind counts
  from 1 inside the domain

#### Scenario: renumbering follows a keyed reorder while the id never moves

- GIVEN two Figures with explicit ids under one declared domain,
  rendered through a keyed `{#each}` (component instances preserved,
  DOM nodes moved), and a Reference pointing at the second
- WHEN the array order is reversed
- THEN each keeps its id, swaps its display number and `data-number`,
  the renumbering is driven by the DOM-mutation signal (not by
  unmount/remount), and the Reference's rendered value follows the
  target's new number in the same settle

#### Scenario: sibling root domains number by document order

- GIVEN two sibling Sections each declaring `numbering` (the
  handbook main path — one root per chapter)
- THEN the roots receive ascending chapter ordinals by document
  order and each domain's floats count independently from 1

#### Scenario: the document-scope exception counts across domains

- GIVEN two declared domains where the first sets
  `floatScope={{ equation: 'document' }}` and both contain equation
  Figures
- THEN the document-scoped counter is unique per document for that
  kind, iterating only participating domains, while every other kind
  keeps its per-domain counters (mixed regimes coexist, never added)

#### Scenario: a nested declaration shadows the outer domain

- WHEN a Section inside a numbering domain declares `numbering` of
  its own
- THEN its subtree forms a new domain: descendants number within the
  inner tree and its Figures belong to the nearest declaring
  ancestor — the outer float counter never crosses in

### Requirement: Figure — the 浮 primitive renders number, caption, and the manual backlink lane

The numbered, captioned, referenceable floating unit SHALL be a wrapper
primitive named by its DOM contract.

- `<Figure kind>` renders `<figure data-jx-figure={kind}>` with a
  `<figcaption>` (label + resolved number + caption slot); any point
  nests in the content slot (CodeCard today, the R6 industry points as
  they land), keeping its own kind marker — the line carries
  structure, the point carries industry semantics, and the HARVEST
  projection hangs the number on the wrapped point's block (the
  wrapper never becomes a block of its own).
- `kind` values this round: `figure | table | equation | listing`;
  the value domain is the harvest registry, open to R6 extension.
  Display words are hardcoded English defaults this round; the
  customization axis (word/locale/number format) belongs to the R5
  preset round.
- `id` is optional: a Figure without an id still numbers (display
  currency) but is not referenceable — stable addressing is the id's
  job, documented at the prop. A Figure outside every declared domain
  renders unnumbered with a dev warning (explicit structure; no
  implicit sniffing).
- `citedIn?: string[]` is the MANUAL backlink lane (Owner 2026-09-04):
  explicitly declared display strings render verbatim in the caption
  tail and emit `data-cited-in` as a JSON array. The component header
  MUST document the GAP: automatic backlink RENDERING is deliberately
  absent — the automatic backlink lives only in the harvest layer
  (the inversion of the reference points' `refids[]`); the static
  strings do not follow reordering (a stale `§ 3.1` after a swap is
  the pressure that motivates the return); the re-entry condition is
  a genre that actually prints a cited-at list (then:
  reverse-registration context, pure increment).

#### Scenario: the manual lane renders what the author declares

- WHEN a Figure declares `citedIn={['§ 3.1', '§ 5.2']}`
- THEN the caption tail renders those strings and `data-cited-in`
  carries the JSON array for harvest
- WHEN no `citedIn` is declared
- THEN nothing renders and no registration machinery runs (the gap is
  the documented default)

#### Scenario: an undomained Figure stays usable but unnumbered

- WHEN a Figure renders with no `numbering` declaration in its
  ancestry (a bare demo page, an external consumer)
- THEN it renders its content and `data-jx-figure`, carries no number
  or `data-number`, and a dev warning names the escaped domain

### Requirement: Reference resolves its display grammar from its target

The typed cross-link SHALL carry zero grammar knowledge of its own.

- `<Reference to>` resolves through a DOCUMENT-LEVEL registry (a
  `Symbol.for` key owned by the figure family, provided at the root
  layout; entries `{ id, kind, number, title }` with `number` a
  derived-value reference, NEVER a registration-time snapshot) —
  domain context serves counting only, addressing always walks the
  registry, so cross-domain references resolve. The rendered form
  follows the TARGET: a Figure renders per its kind (`Eq (4.5)` /
  `Fig 2-3` / `Table 6-1` / `Listing 3`), a numbered Section renders
  `§ 3.2.1`, an unnumbered target renders its title (no connective —
  author prose rides the children lane). Change the target's kind,
  chapter, or order and every reference follows automatically — the
  follow is gate-asserted (reorder scenario below). Referenceable
  targets: numbered Figures and Sections (numbered or not); a bare
  id element and an unnumbered Figure are NOT referenceable this
  round (both resolve as the missing-id fallback).
- Forward references (the target renders later) are a distinct state
  from a missing target: the registry is reactive, so a late-registered
  target is adopted automatically, and the warning fires only when
  the target is still absent after settle. In SSR/prerender the
  forward reference renders the fallback marker (single-pass
  rendering cannot see ahead) and hydration follows to the resolved
  form — this shape difference is the honest cost of display-currency
  numbering under one-way rendering and is pinned by scenario.
- A missing target id is a loud fallback: `console.warn` (never
  dev-gated — prerender builds must surface broken references) plus a
  visible `??(to)` marker rendered in production too; never a throw,
  never a blocked print. A reference to a missing target emits NO
  `data-ref-to` (dead anchors are a filed bug class).
- The reference emits its forward face (`data-ref-to`) for the
  harvest contract's `refids[]`.

#### Scenario: the five target states resolve each in its own grammar

- WHEN a Reference targets an equation Figure, a numbered Section, an
  unnumbered target, a nonexistent id, and a forward-positioned
  equation Figure (in that order)
- THEN they render `Eq (4.5)`, `§ 3.2.1`, the target's title, the
  visible `??(id)` marker with one console warning and no
  `data-ref-to`, and `Eq (4.5)` after hydration — while the
  prerendered forward form reads `??(id)` without a settled warning
