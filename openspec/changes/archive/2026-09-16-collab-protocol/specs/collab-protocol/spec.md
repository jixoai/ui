# collab-protocol — spec delta (collab-protocol)

## ADDED Requirements

### Requirement: layered truth with a single admission authority

The substrate SHALL keep three layers: a per-workspace Loro document
(motion state, merge brain), an append-only op journal (adjudication
and audit truth), and the `.svelte` tree plus nested git (static
truth). The server SHALL be the sole admission authority; all
clients submit the same op vocabulary against the same
baseFrontiers.

#### Scenario: an op lands in all three layers

- GIVEN a validated text op admitted by the gate
- WHEN admission commits
- THEN the Loro doc, one journal entry, and the projected source
  change together, and the receipt carries the canonical update

#### Scenario: no client writes artifacts directly

- GIVEN any client (panel, agent CLI, future external) with a pending
  edit
- WHEN it attempts to persist
- THEN it may only submit ops through admission; direct file writes
  are re-absorbed by the file-resync actor as `file-system` ops

> Every client submits the same op vocabulary against the same
> baseFrontiers with no role-specific lane; the panel may keep a
> local mirror for optimistic echo but never treats mirror state as
> artifact truth (protocol-spec §1).

### Requirement: native short component identity

Every component SHALL carry a native HTML `id` attribute as its
identity. Generated ids SHALL follow `<page-letter><counter>` (e.g.
`a13`): page letters are lowercase bijective base-26 assigned
monotonically and never reused; per-page counters increment
monotonically and never reuse a number (deletion leaves a tombstone,
it frees nothing). Existing legal ids SHALL be adopted verbatim.

#### Scenario: ingest injects ids for unmarked source

- GIVEN a page adopted as letter `a` containing two unmarked
  components
- WHEN ingest runs
- THEN the source gains `id="a1"` and `id="a2"`, the LoroTree adopts
  both, and the journal records one adoption event each

#### Scenario: a deleted number is never reused

- GIVEN page `b` once held `b1`,`b2`,`b3` and `b3` was removed
- WHEN a new component is adopted in page `b`
- THEN it receives `b4`, and the tombstone of `b3` still refuses
  writes with `404 bad-target`

#### Scenario: hand-written ids are adopted verbatim

- GIVEN a component already carrying `id="hero-cta"` and another with
  `id="a7"` in page `a`
- WHEN ingest runs
- THEN both ids are kept as-is and the generator's next id is `a8`
  (high-water = max of journal and seen values)

### Requirement: property buffers with a stable-cursor op vocabulary

Editable content SHALL be addressed as named per-component text
buffers (prop values, slot text fragments, script, style) mutated by
the `#ROW:COL` / `+TEXT` / `-n` / `!n TEXT` vocabulary. The wire form
SHAL carry stable cursor bytes (or equivalent item identity), never
bare integer offsets; coordinates are UTF-16 code units and a cursor
or range inside a surrogate pair SHALL be rejected with `422
utf16-boundary`.

#### Scenario: vocabulary maps onto buffer edits

- GIVEN buffer content `abcd` and the patch `#1:2 !1 Q`
- WHEN applied
- THEN the buffer becomes `aQcd` and the receipt's op records the
  kernel form delete(1,1)+insert(1,"Q")

#### Scenario: line lane is fail-stop without rollback

- GIVEN a multi-line `cli update` patch whose third line is malformed
- WHEN executed
- THEN lines 1-2 stay applied, execution stops at line 3, later lines
  never run, and the receipt names the failing line

### Requirement: atomic idempotent admission with a frozen error protocol

Admission SHALL serialize per workspace: frontier recheck, candidate
fork validation (including a whole-group Svelte compile gate),
canonical commit, journal append, receipt — in the frozen WAL order.
`opId` SHALL be the idempotency key for successes AND rejections.
The error protocol SHALL be exactly `409 stale-or-unknown-frontier`,
`409 stale-cursor`, `404 bad-target`, `422 utf16-boundary`, each
with its retry envelope (canonical update, sync cursor, or reselect
reason).

#### Scenario: same-base concurrent writers do not interleave

- GIVEN two ops admitted against the same baseFrontiers
- WHEN both pass the gate
- THEN one commits and the other returns `409
  stale-or-unknown-frontier` with the canonical update attached; a
  retry of the winner's opId returns the original receipt with no
  duplicate effect

#### Scenario: a rejected retry replays its rejection

- GIVEN an op that was rejected with 409
- WHEN the client retries the same opId
- THEN the original rejection receipt is returned and no new journal
  entry is written

### Requirement: overlap conflicts are revealed, never silently merged

Different-buffer concurrent ops SHALL merge automatically.
Same-buffer concurrent ops SHALL auto-fuse only when their
transformed impact sets do not overlap; otherwise the later op
SHALL receive `409 conflict` with both sides' op details, the
target's tail-5 journal, and the current buffer text.

#### Scenario: non-overlapping same-buffer edits fuse

- GIVEN two writers editing disjoint ranges of one buffer from a
  shared base
- WHEN both ops are admitted
- THEN both apply, each anchor reprojected via cursor identity

#### Scenario: overlapping edits return a conflict envelope

- GIVEN two writers replacing the same span of one buffer
- WHEN the second op is admitted
- THEN it gets `409 conflict` with both op payloads and tail-5; the
  human sees an inline override/give-up card, the agent re-submits
  from the returned state

> Presentation is role-asymmetric: an in-flight human debounce
> fragment is never interrupted — the conflict routes to the agent
> side; a committed human fragment that hits an already-admitted
> write gets the inline override/give-up card (protocol-spec §6).

### Requirement: undo is compensating and attributable

give-up (undo another actor's op) SHALL generate a compensating op
via `revertTo(targetParent)` on a copy containing the target, then
import the inverse as a new journaled op carrying `supersedes:
targetOpId`; the `forkAt(targetParent)`-then-revert path is a no-op
and MUST NOT be used. override (keep one's own) SHALL use the local
peer UndoManager. History SHALL never be rewritten.

#### Scenario: give-up removes only the target op

- GIVEN buffer `base` plus ops A(human) and B(agent) and C(human)
- WHEN B is given up
- THEN the buffer reads as if B never applied (A and C survive) and
  the journal gains a compensation entry superseding B

### Requirement: tree operations with deterministic concurrency

Tree ops SHALL be `insert`/`move`/`remove`/`revive` addressed by
global id on LoroTree. Concurrent moves SHALL resolve by Loro's
native effective-Lamport LWW, numerically larger peer winning ties;
every adjudicated concurrent move SHALL record contenders, orderKey,
winner and resolution in its receipt.

> The v0.2.1 vocabulary adds two kinds (protocol-spec §4, 2026-09-16
> G1 closure): `text/create` (initialText, no anchor, existing
> container → `409 conflict`, tombstone → `404`) and `tree/update`
> (full pure-JSON item replacement, tombstone → `404`, concurrent
> updates resolve per-key LWW without receipts). Line-lane `cli
> update` still carries text `#+-!` only.

#### Scenario: concurrent moves are adjudicated and receipted

- GIVEN two actors moving the same component to different parents
  concurrently
- WHEN both ops merge
- THEN exactly one move wins by orderKey `{lamport, peer}`, the
  receipt lists both contenders, and the loser's op is not lost — it
  is the recorded loser of the adjudication

> Wall-clock timestamps participate in nothing. `remove` tombstones
> the subtree (buffers stay queryable; writes get `404 bad-target`);
> only explicit `revive` restores a node, and `move` MUST NOT
> implicitly revive (protocol-spec §6/§11).

### Requirement: sandboxed JS orchestration lane

`update-js` SHALL run authored JS in a pinned QuickJS-WASM sandbox
(`quickjs-emscripten@0.32.0` RELEASE_SYNC, hash-pinned) with no
module loader, dynamic-code and prototype escapes reduced to
non-configurable undefined, deterministic Date/Math, controlled
Promise, explicit handle disposal, and memory/stack/interrupt
budgets. Scripts SHALL have the `group`/`parallel`/deps primitives;
a group is one candidate fork, one compile gate, one commit.

#### Scenario: a failing group leaves zero effect

- GIVEN a group whose second op breaks Svelte compilation
- WHEN the group is admitted
- THEN the compile gate rejects the whole group, the buffer is
  unchanged, and the receipt carries the compiler diagnostic for
  re-reasoning

#### Scenario: sandbox escapes fail closed

- GIVEN guest code attempting `Function('return 1')`, `({}).constructor.constructor`,
  or `Object.getPrototypeOf(Date).now`
- WHEN executed in the wrapper
- THEN each attempt throws or yields undefined — no host surface is
  reachable, and an infinite loop is cut by the interrupt budget
  with a `sandbox-limit` receipt

> `rollback` discards the candidate before commit (zero effect);
> `keep-partial` receipts per-op. Scripts run once at admission and
> are archived as intent artifacts — only ops sync across devices
> (protocol-spec §7).

### Requirement: file-resync absorbs out-of-band writes atomically

Out-of-band writes (hand edits, git apply/promote, external tools)
SHALL enter through the ingest station as `file-system` ops carrying
observed frontier + source hash. If the observation is stale the
server SHALL return 409 without touching the external file; the
station rebases (canonical update + external diff) and re-admits.
Only after commit, journal and WAL receipt does the server write the
canonical projection back via temp file + atomic rename.

#### Scenario: a stale ingest never clobbers

- GIVEN an external file edited while a concurrent op was admitted
- WHEN the ingest arrives with the stale observation
- THEN it receives 409 with canonical update + external hash/diff,
  the external file is untouched, and after rebase the re-admission
  yields both changes (canonical and file agree)

### Requirement: component-granularity journal and cursors

The journal SHALL be append-only with actor, client event time,
server admission time, target, before/after values, frontier, opId
and transactionId. Clients SHALL hold component-granularity
log-cursors auto-advanced by tool calls; `cli sync` returns
per-node tail-5 summaries, `cli log` full detail. A stale cursor
SHALL receive `409 stale-or-unknown-frontier` with a resync
snapshot/update.

#### Scenario: sync answers who-changed-what

- GIVEN a buffer edited by agent, then file-system, then human
- WHEN `cli sync` runs with the caller's cursor
- THEN the per-component tail-5 lists those entries with final
  values and frontiers, and the caller's cursor advances

#### Scenario: panel mirror is canonical-directed

- GIVEN a panel with a pending overlay whose base went stale
- WHEN the next sync arrives
- THEN the overlay is dropped, the canonical update is imported, and
  only after rebase may the edit be re-submitted — the mirror never
  overwrites canonical

> Compaction SHALL only run past the compression frontier of every
> active cursor; a shallow snapshot MUST NOT become the only storage
> (protocol-spec §9).
