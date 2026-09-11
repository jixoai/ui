# design-tool Specification (r2 delta)

## ADDED Requirements

### Requirement: the design server stamps usage sites with component identity

The design server's transform SHALL stamp the n-th usage of a
jixoai component inside consumer modules (prototype files and
any host module resolving through the alias table, anchored at
the probe's itemAliasBase — never the component definition
files) with static `data-jx-component="<item>"` and
`data-jx-instance="<n>"` attributes in document order, riding
the component's rest spread to its root. The same traversal
SHALL produce the usage→AST-prop-position map the property
panel consumes. Components without a single-root rest spread
SHALL carry no stamp (and be honestly unselectable). Dev
surfaces only — production builds contain zero stamp
attributes.

#### Scenario: static numbering is HMR-stable

- GIVEN a prototype file with two press-button usages
- THEN the DOM carries data-jx-component with instances 1 and
  2 in document order, and an edit that preserves order keeps
  the numbering identical after HMR

#### Scenario: production stays clean

- GIVEN the host project's normal vite build
- THEN the output contains zero data-jx-component attributes

### Requirement: selection is one shared studio state fed by picker and tree

The studio SHALL maintain a single selection state
(`{frameId, usageIndex, iterationIndex?}`) fed by two equal
inputs: the canvas picker (click in a frame resolves the
nearest stamped ancestor, highlighting it) and the
ComponentTreeView (the stamp tree of the active frame). The
chat input SHALL show the current selection as a chip and
outgoing messages SHALL carry it as context. Loop usages
({#each}) render N instances sharing one usageIndex: the
panel and chip label the sharing honestly, and edits target
the usage site.

#### Scenario: picker to chat

- GIVEN the welcome canvas showing press-button states
- WHEN one instance is clicked and a message sent
- THEN the chip reads the component and usage index, and the
  agent reply addresses that file and usage

#### Scenario: shared usage degrades honestly

- GIVEN an {#each} loop rendering three badges
- WHEN one iteration is selected
- THEN the chip and panel state "3 instances share this
  usage" and an edit applies once at the usage site

### Requirement: the property panel edits prototype source with write arbitration

Selecting a usage SHALL fetch its component schema and render
controls (the canvas-schema x-ui conventions). A control edit
SHALL rewrite the prototype SOURCE — the AST-located prop
literal at that usage via magic-string — under CAS
arbitration (content-hash check before write; on mismatch,
re-locate once, else abandon with a notice — never a blind
write), then ride HMR. During an agent turn the panel SHALL
be read-only. Non-representable props (bound or non-literal)
SHALL render read-only with an "edit in code" hint.

#### Scenario: an enum prop flips in source

- GIVEN a selected usage whose schema carries an enum prop with a
  literal present in source
- WHEN the segmented control picks another member
- THEN the prototype file's prop literal changes and the frame
  hot-updates without reload (verified live with a real value
  round-trip; press-button's variant is slot-derived OPAQUE on the
  vehicle — extraction ceiling in force, the row degrades to
  edit-in-code there)

#### Scenario: concurrent write is refused

- GIVEN a panel edit staged while the file changed on disk
- WHEN the write is attempted
- THEN the mismatch is detected, one re-location retry runs,
  and a repeated mismatch abandons with a notice instead of
  corrupting the file

### Requirement: metadata extraction serves any installed component on demand

The design server SHALL extract component structure from the
host's installed jixoai component sources on demand
(`GET /__design__/api/meta/<item>.json`, the
component-metadata-gen kernel re-anchored to the probe's
itemAliasBase, with typescript as a direct dependency of the
tool). Hand annotations SHALL live in the `.meta.ts` two-zone
format's annotation zone; the extractor SHALL validate
annotation keys and fail loudly on unknown keys. Annotation
shipping is a VEHICLE-side fact this round (host annotations
ride a later registry change) — host schemas render without
decorations and everything else works.

#### Scenario: annotations flow to the panel

- GIVEN a meta.ts annotation setting x-ui.icon for a prop
- WHEN the panel renders that component's schema in the
  vehicle
- THEN the row shows the annotated icon

#### Scenario: unknown annotation key

- GIVEN an annotation key outside the vocabulary
- WHEN the meta endpoint extracts
- THEN the response names the file, key, and legal vocabulary

### Requirement: the layout family ships on the alpha track

The `@jixoai/ui-prototype-plugin` package SHALL ship Flex,
Grid and Waterfall layout components with standardized prop
vocabularies and single-root rest-spread (stamp-ready),
registered as alpha-labeled registry items installable via
the normal `jixoai-ui add` flow, their standard props editable
through the same property-panel path as any jixoai component.

#### Scenario: layout tuning in the panel

- GIVEN a prototype using Flex with gap={8}
- WHEN the panel's gap stepper changes it to 16
- THEN the source literal updates and the frame reflows

#### Scenario: alpha labeling

- GIVEN the registry entries for the three components
- THEN each carries the alpha marker in meta and the studio
  guide surfaces the track label

### Requirement: the studio surfaces promotion drift

The studio SHALL expose promotion drift: canvases whose
promoted files lag the current design file show an updates
badge (the status endpoint's data), and the badge's detail
lists changelog intent plus per-file diffs.

#### Scenario: updates badge

- GIVEN a promoted prototype saved again with changes
- WHEN the navigator refreshes
- THEN the canvas shows the updates badge and opening it
  lists the intent note and file diffs

### Requirement: the dsh provider overlay runs on an isolated home

The `--agent dsh` implementation SHALL route through the
design provider overlay (`--patch` on an isolated DSH_HOME
under `design/.dsh-home`), with endpoint and model
overridable via `JIXOAI_DESIGN_LLM_BASE_URL` /
`JIXOAI_DESIGN_LLM_MODEL`. The user's `~/.dsh` settings SHALL
remain untouched by the tool. (Satisfied by the r1
implementation, commit 489acb59 — this requirement retro-
covers shipped behavior; no new task.)

#### Scenario: the user home stays pristine

- GIVEN any design tool run with --agent dsh
- THEN no file under the user's dsh home changes and the
  isolated home carries the design sessions
