# prototype-standard Specification (r2 delta)

## ADDED Requirements

### Requirement: a prototype bundles as a versioned design file

`design save <prototype>` SHALL emit a registry-item-shaped
JSON file (`design/files/<name>.jixoai-design.json`) carrying
`name`, `type: "jixoai:design"`, a monotonically increasing
`version`, a `changes` changelog, and the current `files`
snapshot (history is NOT retained — the merge base lives in
the promotion manifest). Saving unchanged content SHALL NOT
bump the version. `design open <file>` SHALL materialize the
files into `design/prototypes/<name>/` idempotently, refusing
on conflict by naming the clashing path.

#### Scenario: round trip

- GIVEN a saved design file for prototype `welcome`
- WHEN the prototype folder is deleted and the file is opened
- THEN every file returns byte-identical

#### Scenario: version + changelog discipline

- GIVEN version 1 saved
- WHEN a page is edited and saved with a note
- THEN version becomes 2, the changelog gains the note, and
  re-saving without further edits changes nothing

### Requirement: promotion copies into the host with an inline base snapshot

`design promote <prototype>` SHALL copy the prototype's ref
files into the host source tree (default `src/lib/design/
<prototype>/`), rewriting `#jixoai/<item>` specifiers to the
host's alias form, and SHALL record per-file provenance in
`design/.promotions.json`: design version, promotedAt, sha256,
and the INLINE post-rewrite base snapshot (the three-way
merge's base — post-rewrite so imports never phantom-conflict).
Repeated promotion to an existing target SHALL refuse with a
diff unless forced. Developer edits after promotion SHALL
never be touched except by an explicit `apply`.

#### Scenario: first promotion

- GIVEN prototype `checkout-flow` with two ref files
- WHEN promote runs
- THEN both files land under the host alias path with rewritten
  imports and the manifest lists both with inline bases

### Requirement: design changes notify through diff, intent and three-way apply

`design status` SHALL compare each promoted file's recorded
design version against the current design file, reporting the
changelog entries since promotion plus a per-file unified diff
(inline base → new design content through the same rewrite
pipeline). `design apply` SHALL merge via three-way (base =
inline snapshot, ours = current project file, theirs = new
design content post-rewrite): clean hunks merge automatically,
conflicts receive markers and a named report, files the
developer deleted are skipped and listed, and NO developer
change is silently overwritten.

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

#### Scenario: deleted downstream file

- GIVEN a promoted file the developer deleted
- WHEN apply runs
- THEN the file stays deleted and the report lists it as
  skipped
