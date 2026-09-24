# The org — management policy & operating structure (the orchestrator's law)

> The Owner's directive (2026-09-22, verbatim intent): multiple VISION
> subagents do the coding; the orchestrator (ZCode main agent,
> 「总负责人」) assigns ALL component-doc refactors one task at a time,
> interleaving coding and review; every component gets TWO reviews by
> other agents; agents keep experience logs, learn from each other's
> highlights, and receive learning tasks from the orchestrator. All
> communication flows THROUGH this change's files.

## Roles

- **orchestrator** (me) — defines policy, maintains the board, assigns
  one task per agent at a time (never batching ahead), receives every
  report, issues learning tasks, runs the integration gates, owns the
  census/spec folds and commits.
- **quill / vellum / scribe / marginalia** — the four vision subagents.
  Named (manuscript-flavored), each owning a randomly-assigned batch of
  pages (seeded RNG, seed 20260922 — `research/assignment.json`).

## The task loop (one task in flight per agent, always)

1. The orchestrator dispatches the next task (the dispatch brief names:
   task type, target page(s), pointer to the baseline skill + any
   learning pointers).
2. The agent does the work (coding: triage the tier, land it, gates;
   review: the §5 checklist; learning: read a peer's folder, extract,
   upgrade own pages).
3. The agent writes its report to
   `agents/<name>/reports/<seq>-<task>.md` and appends learnings to
   `agents/<name>/experience.md`.
4. The agent's final message to the orchestrator = the report summary
   (components coded/reviewed, tier decisions, learnings, gate tails).
5. The orchestrator integrates (spot-checks, gates, commits by concern),
   updates the board (`research/assignment.json` statuses +
   `BOARD.md`), and dispatches the agent's NEXT task.

## Task-type rotation

- Round 1: all four agents CODE (their batch's first page).
- Thereafter: an agent's next task alternates CODE → REVIEW → CODE…,
  where REVIEW targets a page another agent has just completed (the
  assignment's two designated reviewers get priority; any third agent
  may substitute when a designated reviewer is busy).
- LEARNING tasks are inserted by the orchestrator when a report reveals
  a transferable discovery ("read vellum's §highlight on rung tables,
  then upgrade your badge and figure pages").
- An agent may also self-initiate the learning loop: review highlights
  recorded in experience.md MUST be applied back to the agent's own
  pages (report them as follow-up coding).

## Folders (all inside this change)

```
agents/<name>/
  experience.md        # the living log: techniques, highlights found in
                       # others' pages, mistakes to avoid, upgrades applied
  reports/<seq>-*.md   # one file per completed task (the report contract:
                       # what was coded/reviewed, tier + why, learnings,
                       # gate tails, processes)
```

The board: `research/assignment.json` (page → owner → 2 reviewers,
status todo/coding/in-review/done) + `BOARD.md` (per-agent current task
+ queue). The orchestrator is the ONLY writer of both.

## Definition of done (per page)

Tier executed per the baseline skill §3 + TWO passed reviews (no
unresolved BLOCKER/MAJOR findings) + gates green + the orchestrator's
integration commit. Change-level done: all 110 pages done,
verify:docs-universal 110/110, full suite green, vision walkthrough
rounds on the refactored pages (the sustained-goal law), Codex final
review, Owner acceptance.

## Hard safety (unchanged from the parent session)

No stash/reset/checkout--/clean; explicit-path staging; no push; the
orchestrator commits (agents leave their work in the tree; the
orchestrator's integration commit sweeps by explicit path per concern).
Dev server discipline: ports 5240+ (the Owner's 5230 is untouchable);
kill by PID; report evidence.
