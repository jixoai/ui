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
  order): ordinals derive from `compareDocumentPosition` order over
  a reactive registry driven by the TWO-LEVEL revision matrix — the
  domain-root observer bumps `domainRevision` (in-domain members and
  positions; sibling-root order, root moves, and document-scope
  participants invalidate through `documentRevision`, bumped by the
  document-level domain registry's observer) — registration order
  NEVER assigns numbers, and DOM mutation is the ONLY renumbering
  signal. The claim splits by
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

#### Scenario: the number's visible DOM is frozen

- WHEN a numbered Section renders
- THEN `data-number` sits on the section root element and the display
  number is a leading dedicated `<span data-jx-number>` inside the
  header's title node (not aria-hidden — "3.2 Methods" is the natural
  accessible heading text), asserted as full outerHTML
- WHEN the section is unnumbered
- THEN the span node does not exist at all

#### Scenario: a nested domain restarts locally and never consumes a sibling ordinal

- GIVEN an outer root with a child that declares `numbering` of its
  own, followed by a sibling root of the outer
- THEN the inner root renders its LOCAL restart `1` (not its document
  registry position) with descendants `1.1`, the inner root is absent
  from the outer's SectionRecord set (outer numbering continues past
  it), and the following sibling root numbers `2` by document-order
  position

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

- GIVEN two declared domains that BOTH set
  `floatScope={{ equation: 'document' }}` and both contain equation
  Figures
- THEN the document-scoped counter is unique per document for that
  kind, iterating only the participating domains in document order,
  while every other kind keeps its per-domain counters (mixed
  regimes coexist, never added); a domain that declares no document
  scope for the kind does not participate

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
- THEN the caption tail renders those strings and the tail node
  carries `data-cited-in` (the harvest marker — one name everywhere,
  never `data-jx-cited-in`) with the JSON array as its payload
- WHEN `citedIn` is absent or an empty array
- THEN no `data-cited-in` node or attribute renders and no
  backlink-only registration runs — while the Figure's normal
  numbering-domain and target registration still run (the gap is the
  documented default, not a registration opt-out)

#### Scenario: an undomained Figure stays usable but unnumbered

- WHEN a Figure renders with no `numbering` declaration in its
  ancestry (a bare demo page, an external consumer)
- THEN it renders its content and `data-jx-figure`, carries no number
  or `data-number`, and a dev warning names the escaped domain

### Requirement: Reference resolves its display grammar from its target

The typed cross-link SHALL carry zero grammar knowledge of its own.

- `<Reference to>` resolves through a DOCUMENT-LEVEL registry — a
  `TargetRegistry` INSTANCE created per route page
  (`createTargetRegistry()` + `setContext` at the page root; never
  the root/docs layouts, which outlive routes and would leak
  prior-page ids; the registry dies with the page component on
  navigation, collapsing every reference to the missing state with
  no dangling warnings). Entries are a real discriminated union
  with derived fields registered as ACCESSOR THUNKS (read-on-call
  values, reactive inside `$derived` — never registration-time
  snapshots): `FigureTargetEntry { id, kind: 'figure', number: ()
  => string, title: null }` and `SectionTargetEntry { id, kind:
  'section', number: () => string | null, title: () => string }`.
  `registry.registerTarget()` returns an idempotent disposer; a
  duplicate id warns in dev with the FIRST live registration the
  winner, the earliest still-live candidate promoted in the same
  settle when the winner disposes, and the target returning to the
  missing state when the last entry disposes. Section/Figure/
  Reference share ONE cross-domain move model: moves happen only
  through Svelte instance destroy-and-rebuild — unmount disposes
  (the old domain stops counting, the registry entry vanishes),
  remount re-registers in the new domain; observer bumps recompute
  ordinals but never migrate registry ownership. The rendered form follows the
  TARGET: a Figure renders per its kind (`Eq (4.5)` / `Fig 2-3` /
  `Table 6-1` / `Listing 3`), a numbered Section renders `§ 3.2.1`,
  an unnumbered target renders its title (no connective — author
  prose rides the children lane). Change the target's kind, chapter,
  or order and every reference follows automatically — the follow is
  gate-asserted (reorder scenario below). Referenceable targets:
  numbered Figures and Sections (numbered or not); a bare id element
  and an unnumbered Figure are NOT referenceable this round (both
  resolve as the missing-id fallback).
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

## MODIFIED Requirements

### Requirement: family context contract

State-sharing context in a family SHALL carry state and behavior
only — never membership order. Ordinal state compares explicit
per-item values; keyboard walks and filtering are DOM-delegated and
scoped to the nearest container (`closest()`), so nested families
never leak into each other's walks. Where items carry metadata the
DOM cannot express (match text), items SELF-match against context
state instead of registering into a central ordered registry. What
must register (imperative show/hide handles) registers at component
initialization — synchronously, SSR-executed, under a family-defined
stable DERIVED key (panel families: `${itemId}-panel`, never the
registrant's own `$props.id()`), unregistered `onDestroy`; `onMount`
is never the only registration path. Consequences that MUST hold: SSR output is semantically
complete before hydration; keyed `{#each}` reorders, conditional
inserts, deletions and restores never corrupt state or walk order.
Declared DOM-derived AUTO-mode exceptions (a toc deriving links from
rendered headings; the R2 figure counters and reference resolution):
each renders its landmark shell server-side and completes on
hydration — the data does not exist at render time. The exceptions
split by shape — reference resolution rides the shell-plus-hydration
form (a forward reference prerenders the fallback marker and follows
on hydration), while figure numbering is SSR-complete (instantiation
order = template order = static DOM order; hydration's first frame
matches the SSR output) and touches the exception class only through
incremental renumbering driven by DOM mutation. The exceptions apply
to auto modes only, never to composed trees.

#### Scenario: SSR renders the family complete

- GIVEN a composed family rendered server-side
- THEN the first paint carries every item with correct state paint
  and no hydration-time re-registration flash

#### Scenario: keyed reorder cannot corrupt state

- GIVEN a Steps/Command/Anchor family whose items live in a keyed
  `{#each}` that reorders at runtime
- THEN item state and walk order follow the NEW tree order with no
  stale ordinals and no ghost registration

#### Scenario: nested families do not leak walks

- GIVEN a MenubarPanel containing a nested dropdown-menu
- WHEN the panel walker walks `[role=menuitem]`
- THEN only entries whose `closest('[role=menu]')` is this panel
  participate — the nested menu keeps its own walk

### Requirement: composition-first API surface

Repeated or nested UI structure SHALL be authored in the consumer's
tree as family parts (Svelte 5 snippets/children), never described
through props. A registered component MUST NOT own markup that is
only reachable via data-array props, config trees, keyed render-props,
or string-to-glyph mappings. Legal props are: value/state (bindable),
behavior (`activation`, `placement`), presentation enums (`variant`,
`size`, `orientation`), and value/behavior-domain payloads (option
sets, tour targets, code strings, virtualizer rows) — the payload
category MUST provide snippet escapes for per-item content. ONE
declared narrow exception (R2, Owner 2026-09-04): a
**display-currency metadata payload** — an array of plain display
strings rendered verbatim as annotations with NO per-item content
sovereignty (no per-item layout, paint, or slots; Figure's `citedIn`
is the instance) — carries no snippet escape; the strings are the
harvest contract's mirror, not caller-defined structure. The
diagnostic for gray zones: a prop that changes WHAT renders (which
rows/sections exist) must become a child component; a prop that
changes HOW it renders (paint, layout mode) is legal.

Families ship at ecosystem part granularity: the shadcn/shadcn-vue/
Dice UI anatomy for the equivalent component is the floor, not the
ceiling. Barrels follow the tabs precedent — `export { default }`
for the canonical main when one exists, sub-parts as named defaults,
`export *` for module types; NO Root aliases.

#### Scenario: a new component needs repeated items

- WHEN a component renders a list/sections/steps of caller-defined
  content
- THEN the registry ships the family parts and the consumer authors
  each item in their tree; no `items`/`steps`/`sections` prop exists

#### Scenario: ordinal state stays explicit

- GIVEN a composed family with an active/progress ordinal
- THEN items carry REQUIRED explicit ordinal/value props (`step`) and
  state derives from comparing them to the bindable root state —
  registration or instantiation order is never load-bearing

#### Scenario: the keyed render-prop trap

- GIVEN a component tempted to expose `body?: Snippet<[item, index]>`
  as the only content path over a data array
- THEN that design is rejected: iteration ownership moves to the
  consumer and the snippet becomes plain children

#### Scenario: value-domain payload with content escape

- GIVEN an option-domain control (select options, tour targets) whose
  items ARE the value
- THEN the data prop is legal only if rich per-item content escapes
  through snippets; a fully closed row renderer is a violation

#### Scenario: computed structure ships logic, not markup

- GIVEN structure computed from state (pagination windows)
- THEN the computation lands as an exported pure helper and the
  consumer composes the parts through it; the component does not
  compute-and-render rows behind closed markup
