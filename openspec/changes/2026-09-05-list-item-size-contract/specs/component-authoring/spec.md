# ADDED Requirement: the edge-inset ownership vocabulary (global practice)

> Owner vocabulary ruling 2026-09-05 r2: `inset?: 'auto' | number | boolean`
> is THE union for edge-inset ownership at any container/child boundary.
> Snippet-param form (`#snippet end({ inset })`) flows outward — CSS cannot
> consume it — so the union rides a container prop; semantics verbatim.

The optical inset at a container edge has exactly ONE owner. The container
exposes `inset: 'auto' | number | boolean`:

- `'auto'` (default) — presence inference: a terminal child declaring
  `data-self-inset` (at its ROOT face, the capability-at-own-face shape)
  wins the edge; the container yields its own inset there.
- `number` — an explicit edge: the container yields and the boundary
  carries exactly N px (a custom property, never an inline padding, so
  cascade tiers can suspend it). Negative values throw.
- `true` / `false` — force the auto inference on / off.

**Stacked/folded geometry suspends the contract**: when layout folds the
child to its own row (the list's 30rem narrow law), `auto` resolves to
KEEP — the container's default inset stands; `on`/`set` lose their yield.

#### Scenario: the input shell (the founding precedent, aligned)

- **WHEN** a control shell hosts a self-insetting edge child (the stepper
  pair, the clear button)
- **THEN** the shell's edge-zone law (`:has(> child:first/last-child)`
  zeroing that side's padding) IS the 'auto' tier of this vocabulary —
  same ruling one level down, no API change required.

#### Scenario: the list-item end lane (the reference implementation)

- **WHEN** a fitted end lane's terminal control declares
  `data-self-inset` at its root (select: always, the chevron reserve;
  input: clear/picker/suffix conditionally; number: always)
- **THEN** the row yields `padding-inline-end` (auto tier); `inset={false}`
  forbids it; `inset={N}` hands the tail to the lane with N px.

#### Scenario: new containers adopt the vocabulary

- **WHEN** any future container (menu lanes, table cells, toolbar ends)
  hosts controls with their own edge insets
- **THEN** it exposes the same union with the same semantics — the
  vocabulary is the global practice, not a list-item local.
