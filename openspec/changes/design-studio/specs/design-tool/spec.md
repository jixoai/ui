# design-tool Specification

## ADDED Requirements

### Requirement: one vite server serves studio, frames and canvases on the same origin

The `@jixoai/ui-design` package SHALL provide
`createDesignViteServer(root)` starting ONE vite dev server with
three surfaces: `/__design__/` (studio SPA),
`/__design__/frame` (the ref-mounting surface) and
`/prototypes/<name>/` (canvas pages). The synthesized config
SHALL include svelte, tailwind v4 AND `@jixoai/ui-vite-plugin`
with its icons feature (components import
`virtual:jixoai-icons`), plus an alias table resolving the
host's component sources and app.css (monorepo probe output).

#### Scenario: same-origin preview

- GIVEN a scaffolded workspace in a host project
- WHEN the server starts
- THEN the studio embeds canvas iframes and frame iframes on
  one origin with zero CORS, sharing vite's module cache

#### Scenario: icon-bearing components render

- GIVEN a canvas framing a component that renders icons
- WHEN the frame loads
- THEN icons resolve through the virtual module (no unresolvable
  `virtual:jixoai-icons` import errors in any frame)

#### Scenario: canvas HMR end to end

- GIVEN a studio session showing a canvas
- WHEN a ref'd page file is edited
- THEN the frame hot-updates without reload and studio state
  (chat, navigation) is untouched

### Requirement: the package ships as source with a file: dependency edge

`@jixoai/ui-design` SHALL be source-distributed (main points at
`src/index.ts`, css-laws precedent — no dist build), wired into
host vehicles by a `file:` dependency (the ui-vite-plugin
pattern), while `cli/bin/design.mjs` locates it via
createRequire with a monorepo path fallback so the CLI works
without installation inside this repository.

#### Scenario: the CLI finds the server factory

- GIVEN the jixoai-labs/ui repository checkout
- WHEN `jixoai-ui design` runs without any publish/install step
- THEN the CLI resolves the package and starts the server

### Requirement: the studio shell is host-authored with a package default

The package SHALL ship a default studio shell (navigator,
preview grid, chat panel, guide) imported by a generated
`design/studio.svelte` which the host may edit or replace. The
default shell SHALL NOT import host components (package/host
decoupling); dogfooding happens through optional slots the host
mount page fills. The scaffold SHALL be idempotent — re-running
only creates MISSING files, never overwriting existing ones.

#### Scenario: scaffold idempotence

- GIVEN a first run scaffolded the workspace
- WHEN the command runs again after the user edited
  design/studio.svelte
- THEN the edit survives byte-identical and no file is touched
  beyond filling gaps

### Requirement: the agent seam is the single chat contract over SSE

The package SHALL define the `DesignAgent` interface (`info()`,
`chat(sessionId, message)` streaming `AgentEvent`s: text, file,
tool, done) transported over SSE at `/__design__/api/chat`,
with `EchoAgent` (recorded playbook, no model service) and
`DshAgent` (dsh host adapter, experimental) implementations.
`--agent none` SHALL disable chat entirely (read-only studio).

#### Scenario: the echo loop proves the product circuit

- GIVEN `--agent echo`
- WHEN the user sends the demo instruction
- THEN the agent streams text events, writes real workspace
  files, the canvas hot-updates, and a done event closes the
  turn — with no model service configured

#### Scenario: dsh smoke (best effort, experimental)

- GIVEN `--agent dsh` with a working dsh host
- WHEN a message is sent
- THEN the reply and any file edits flow through the same
  AgentEvent stream; MID-TURN dsh failures (spawn error, nonzero
  exit, timeout) degrade to inline error events, never a crash —
  while a missing binary at STARTUP fails the CLI preflight fast
  with the mirror install hint (the r2 ruling: fail fast before
  the studio opens, degrade inline after)

### Requirement: the knowledge pack builds as a committed snapshot

The package SHALL provide `buildKnowledgePack()` producing a
layered design-agent system prompt plus a component index from
registry.json titles/descriptions, variant/Context docs,
authored state-machine excerpts, and the prototype-standard
spec. The output SHALL be generated at repository build time
into a committed snapshot consumed at runtime, so consumer
machines never depend on repository paths. The studio guide
SHALL render the same index the prompt consumes.

#### Scenario: prompt and guide share one index

- GIVEN the committed knowledge snapshot
- WHEN the studio loads
- THEN every item name in the guide also appears in the
  prompt's selection layer, from one source

### Requirement: the CLI exposes design as a single command

The `jixoai-ui` CLI SHALL accept `design [--port <n>]
[--agent dsh|echo|none] [--no-open]` which scaffolds the
workspace idempotently, starts the design server, optionally
starts the agent host, and opens the browser at the studio URL.
The command SHALL live in its own module
(`cli/bin/design.mjs`), leaving the existing command surface
untouched.

#### Scenario: first run in this repository

- GIVEN the jixoai-labs/ui repository root
- WHEN `jixoai-ui design --agent echo --no-open` runs
- THEN the server serves the studio and the built-in demo
  prototype, and a second run changes nothing on disk
