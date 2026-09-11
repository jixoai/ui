# prototype-standard Specification (r2 delta)

## ADDED Requirements

### Requirement: the design workspace is a nested git repository with release checkpoints

`design/` SHALL be a self-contained nested git repository
(initialized idempotently; the host repository never sees
design history). `design save` SHALL make work-in-progress
commits; `design release [name] [-n notes]` SHALL create an
annotated tag — the version checkpoint, a deliberate
developer action — with notes serving as release intent
(defaulting to the latest agent turn summary when available).
`design diff <tagA>..<tagB>` SHALL report per-page change
status (which pages changed, which did not) and SHALL be
exportable as a patch. An optional `--export` at release time
SHALL emit the registry-item-shaped JSON artifact (the
portable sharing snapshot — git is the version database, the
JSON is a publish artifact). `design open <file>` SHALL
materialize an artifact into `design/prototypes/<name>/`
idempotently, refusing on conflict by naming the path.

#### Scenario: checkpoint discipline

- GIVEN design work committed via saves
- WHEN release runs twice with the same name
- THEN the second is refused, and an unchanged-workspace
  release prompts instead of tagging

#### Scenario: page-level compare

- GIVEN releases v1 and v2 where only pages/hero.svelte changed
- WHEN design diff v1..v2 --by-page runs
- THEN hero is listed as modified, every other page as
  unchanged, and the exit is exportable as a unified patch

### Requirement: promotion pins the design tag with git-backed provenance

`design promote <prototype>` SHALL copy the prototype's ref
files into the host source tree (default `src/lib/design/
<prototype>/`), rewriting `#jixoai/<item>` specifiers to the
host's alias form, and SHALL record per-file provenance in
`design/.promotions.json`: the pinned design tag and commit
sha, promotedAt (base content lives in the git object store,
post-rewrite at merge time — never inlined). Repeated
promotion to an existing target SHALL refuse with a diff
unless forced. Developer edits after promotion SHALL never be
touched except by an explicit `apply`.

#### Scenario: first promotion

- GIVEN prototype `checkout-flow` released at v2
- WHEN promote runs
- THEN the files land under the host alias path with rewritten
  imports and the manifest pins tag v2 with its commit sha

### Requirement: design changes notify through git diffs, release notes and three-way apply

`design status` SHALL compare each promoted file's pinned tag
against HEAD via git diff (name-status per prototype, release
notes from the tag annotations, per-file unified diffs with
the new side passed through the same rewrite pipeline).
`design apply` SHALL merge via `git merge-file` three-way
(base = the tagged content post-rewrite, ours = current
project file, theirs = HEAD content post-rewrite): clean
hunks merge automatically, conflicts receive git-style
markers and a named report, files the developer deleted are
skipped and listed, and NO developer change is silently
overwritten. `design apply --agent` SHALL offer the
agent-mediated path (diffs + notes to the design agent,
producing a reviewable patch for conflicts and semantic
migrations).

#### Scenario: clean merge

- GIVEN a promoted file the developer extended at the bottom,
  and a design edit at the top since the pinned tag
- WHEN apply runs
- THEN both changes coexist and the report lists the merged
  hunks

#### Scenario: conflicting edit

- GIVEN the developer rebound a prop the design also changed
- WHEN apply runs
- THEN the file carries git-style conflict markers naming
  both sides and the report names the file and prop

#### Scenario: deleted downstream file

- GIVEN a promoted file the developer deleted
- WHEN apply runs
- THEN the file stays deleted and the report lists it as
  skipped
