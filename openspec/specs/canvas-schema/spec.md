# canvas-schema Specification

## Purpose
jsonSchema is the canvas's native tongue: a locked `component-metadata-gen` build step extracts component structure from registry `.svelte` sources into committed two-zone meta files, and the schema kernel lowers the IR to standard jsonSchema (`x-ui` passthrough, zero internal vocabulary leakage) so ComponentCanvas can render its control rows straight from the schema. It serves docs authors (no hand-copied option arrays or reset boilerplate) and third parties that lower their own schemas through the same front door. Core contract: the canvas renders controls from the lowered schema, with the consumer-authored `playground` snippet as the precedence escape hatch and honest degradation for non-representable props.

## Requirements

### Requirement: component structure extraction is a locked build artifact

The repository SHALL provide a `component-metadata-gen` step that
takes registry `.svelte` component paths and emits two-zone
`.meta.ts` files (GENERATED block + preserved hand-annotations zone)
under `apps/www/src/lib/meta/`. Generated files SHALL be committed,
and a `--check` mode SHALL fail when the generated zone is stale
relative to the component source. Hand annotations SHALL survive
regeneration untouched.

#### Scenario: a component prop changes

- GIVEN a committed `press-button.meta.ts` in sync
- WHEN `press-button.svelte` gains a prop and `--check` runs
- THEN the check exits non-zero naming the stale file, and
  regeneration updates only the GENERATED zone

#### Scenario: annotated control hints

- GIVEN an annotations zone marking `variant` as segmented
- WHEN the extractor regenerates after an unrelated source change
- THEN the annotation is byte-identical and the merged schema still
  carries `x-ui.control: "segmented"`

### Requirement: the IR lowers to standard jsonSchema without leakage

The schema kernel SHALL lower IR nodes to standard jsonSchema
keywords (`type`, `enum`, `minimum`, `maximum`, `default`,
`required`) with `x-ui` annotations passed through. Internal IR
vocabulary SHALL NOT appear in any export.

#### Scenario: exporting press-button structure

- WHEN `toJSONSchema` runs on the press-button meta
- THEN the output contains `"type": "object"` with per-prop keyword
  nodes and `required` listing exactly the props without defaults,
  and the serialized export contains neither `kind` nor `typeText`

### Requirement: the canvas renders controls from jsonSchema

ComponentCanvas SHALL accept an optional `schema` (lowered
jsonSchema) and bindable `values` initialized from schema defaults,
rendering control rows through the registry list-item family
(declared `@jixoai/list-item`): toggle/select/text/slider rows via
the ItemToggle/ItemSelect/ItemInput adapters, segmented/stepper via
ItemField's control snippet — the same ItemField scaffold the site
play kit's play-row bridges onto, so schema panes and snippet panes
are one surface. The row grammar is ItemField's (the legacy
hand-rolled `.jx-canvas-ctl` grid layer and the block lane are
retired; `lane` stays advisory kernel metadata). The
consumer-authored `playground` snippet SHALL take precedence when
supplied; reset SHALL restore schema defaults when no `onreset` is
given; an `onvalue` seam SHALL let the page own value semantics for
non-representable props.

#### Scenario: schema-driven playground

- GIVEN the pilot page passes schema + `bind:values`
- THEN variant/size/loading/radius render as segmented/toggle/
  stepper rows, stage updates live, and reset returns defaults

#### Scenario: both panes share one row surface

- GIVEN a schema-mode canvas and a snippet-mode canvas
- THEN both panes render ItemField outline rows in the same tight
  fields rhythm, and the schema pane's leaf controls carry their own
  focus paint (only the canvas-authored segmented/stepper idioms
  keep rules in the canvas residue sheet)

#### Scenario: escape hatch precedence

- GIVEN a canvas with BOTH `schema` and a `playground` snippet
- THEN the snippet renders (the page keeps full control) and schema
  rows are not duplicated

### Requirement: honest degradation for non-representable props

Snippet props and imported/opaque types SHALL be documented in the
meta with their source type text and excluded from generated
controls — never silently dropped from the exported structure.

#### Scenario: a Snippet prop

- GIVEN `children: Snippet` in the props interface
- THEN the meta records it as a snippet-kind node with type text,
  the export marks it under `x-ui`, and no control row renders
