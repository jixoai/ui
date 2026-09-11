# prototype-standard Specification (r2 delta)

## ADDED Requirements

### Requirement: a prototype bundles as a versioned design file

`design save <prototype>` SHALL emit a registry-item-shaped
JSON file (`design/files/<name>.jixoai-design.json`) carrying
`name`, `type: "jixoai:design"`, a monotonically increasing
`version`, a `changes` changelog, and the full `files` snapshot.
Saving unchanged content SHALL NOT bump the version. `design
open <file>` SHALL materialize the files into
`design/prototypes/<name>/` idempotently, refusing on conflict
by naming the clashing path.

#### Scenario: round trip

- GIVEN a saved design file for prototype `welcome`
- WHEN the prototype folder is deleted and the file is opened
- THEN every file returns byte-identical and the workspace
  index records the file's version

#### Scenario: version + changelog discipline

- GIVEN version 1 saved
- WHEN a page is edited and saved with a note
- THEN version becomes 2, the changelog gains the note, and
- re-saving without further edits changes nothing

### Requirement: promotion copies into the host with provenance

`design promote <prototype>` SHALL copy the prototype's ref
files into the host source tree (default `src/lib/design/
<prototype>/`), rewriting `#jixoai/<item>` specifiers to the
host's alias form, and SHALL record per-file provenance
(design file version, base sha256, promotedAt) in
`design/.promotions.json`. Developer edits after promotion
SHALL never be touched by any later tool step except an
explicit `apply`.

#### Scenario: first promotion

- GIVEN prototype `checkout-flow` with two ref files
- WHEN promote runs
- THEN both files land under the host alias path with rewritten
  imports and the provenance manifest lists both with hashes

### Requirement: design changes notify through diff, intent and three-way apply

`design status` SHALL compare each promoted file's recorded
design version against the current design file, reporting the
changelog entries since promotion plus a per-file unified diff
(base → new). `design apply` SHALL merge via three-way (base =
promoted snapshot, ours = current project file, theirs = new
design version): clean hunks merge automatically, conflicts
receive markers and a named report, and NO developer change is
silently overwritten.

#### Scenario: clean merge

- GIVEN a promoted file the developer extended at the bottom,
  and a design edit at the top
- WHEN apply runs
- THEN both changes coexist and the report lists the merged
  hunks

#### Scenario: conflicting edit

- GIVEN the developer rebound a prop the design also changed
- WHEN apply runs
- THEN the file carries conflict markers naming both sides and
  the report names the file and prop

### Requirement: the design server stamps dev-only component identity

The design server's component transform SHALL stamp jixoai
component root elements with `data-jx-component="<item>"` and
`data-jx-instance="<n>"` (depth order) in dev surfaces only.
Production builds SHALL contain no such attributes (the stamp
is a design-server transform, never part of the registry
source).

#### Scenario: picker addressing

- GIVEN a frame rendering two press-button instances
- THEN the DOM carries data-jx-component="press-button" with
  distinct instance numbers, and a click resolves to
  {frameId, instanceId} stably across HMR reloads

#### Scenario: production stays clean

- GIVEN the host project's normal vite build
- THEN the output contains zero data-jx-component attributes
