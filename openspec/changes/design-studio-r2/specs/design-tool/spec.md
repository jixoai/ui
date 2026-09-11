# design-tool Specification (r2 delta)

## ADDED Requirements

### Requirement: selection is one shared studio state fed by picker and tree

The studio SHALL maintain a single selection state
(`{frameId, instanceId}`) fed by two equal inputs: the canvas
picker (click in a frame resolves the nearest stamped component
ancestor, highlighting it) and the ComponentTreeView (the
stamped component tree of the active frame, nodes selecting in
place). The chat input SHALL show the current selection as a
chip and outgoing messages SHALL carry it as context.

#### Scenario: picker to chat

- GIVEN the welcome canvas showing press-button states
- WHEN one instance is clicked and a message sent
- THEN the chip reads the component and instance, and the
  agent reply addresses that exact instance's file and usage

#### Scenario: tree and picker agree

- GIVEN a selection made in the tree
- THEN the same instance highlights in the frame, and a
  subsequent picker click moves both views

### Requirement: the property panel edits prototype source, not runtime props

Selecting an instance SHALL fetch its component schema
(`GET /__design__/api/meta/<item>.json`, the on-demand
extraction) and render controls (the canvas-schema x-ui
conventions). A control edit SHALL rewrite the prototype
SOURCE — the AST-located prop literal of that instance via
magic-string — and ride HMR; non-representable props (bound
or non-literal values) SHALL render read-only with a
"edit in code" hint.

#### Scenario: variant flips in source

- GIVEN a selected press-button instance with variant="fill"
- WHEN the segmented control picks "tonal"
- THEN the prototype file's prop literal reads tonal and the
  frame hot-updates without reload

#### Scenario: bound prop degrades honestly

- GIVEN an instance whose disabled prop is a binding
- THEN its row is read-only with the hint, and no source
  rewrite is attempted

### Requirement: metadata extraction serves any installed component on demand

The design server SHALL extract component structure from the
host's installed jixoai component sources on demand (the
component-metadata-gen kernel, served per item), reusing the
existing IR → jsonSchema lowering with `x-ui` passthrough.
Hand annotations SHALL live in the `.meta.ts` two-zone format's
annotation zone; the extractor SHALL validate annotation keys
(icon, i18n, grouping) and fail loudly on unknown keys.

#### Scenario: annotations flow to the panel

- GIVEN a meta.ts annotation setting x-ui.icon for a prop
- WHEN the panel renders that component's schema
- THEN the row shows the annotated icon

#### Scenario: unknown annotation key

- GIVEN an annotation key outside the vocabulary
- WHEN the meta endpoint extracts
- THEN the response names the file, key, and legal vocabulary

### Requirement: the layout family ships on the alpha track

The `@jixoai/ui-prototype-plugin` package SHALL ship Flex,
Grid and Waterfall layout components with standardized
prop vocabularies, registered as alpha-labeled registry
items installable via the normal `jixoai-ui add` flow. Their
standard props SHALL be editable through the same property
panel path as any jixoai component.

#### Scenario: layout tuning in the panel

- GIVEN a prototype using Flex with gap={8}
- WHEN the panel's gap stepper changes it to 16
- THEN the source literal updates and the frame reflows

#### Scenario: alpha labeling

- GIVEN the registry entries for the three components
- THEN each carries the alpha marker in meta and the studio
  guide surfaces the track label

## ADDED Requirements

### Requirement: the dsh provider overlay runs on an isolated home

The `--agent dsh` implementation SHALL route through the
design provider overlay (`--patch` on an isolated DSH_HOME
under `design/.dsh-home`), with endpoint and model
overridable via `JIXOAI_DESIGN_LLM_BASE_URL` /
`JIXOAI_DESIGN_LLM_MODEL`. The user's `~/.dsh` settings SHALL
remain untouched by the tool.

#### Scenario: the user home stays pristine

- GIVEN any design tool run with --agent dsh
- THEN no file under the user's dsh home changes and the
  isolated home carries the design sessions
