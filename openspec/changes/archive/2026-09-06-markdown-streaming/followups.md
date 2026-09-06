# Followups — friction confirmed by subagents (feedback protocol)

Recorded at integration (2026-09-07). These are real frictions hit
during implementation, cross-verified by the orchestrator; they
outlive this change and want an upstream home (skill or spec) at
archive time.

## For component-authoring (spec candidate)

1. **Svelte 5 self-reference syntax** (subagent B): a component
   referencing ITSELF must use an explicit self-import
   (`import MarkdownNode from './markdown-node.svelte'`) — the
   PascalCase file-name form throws `ReferenceError` at compile, and
   the kebab self-tag is WORSE: it silently compiles to an unknown
   custom element (empty render, no error). markdown-node.svelte is
   the standing precedent. A one-line law in the living spec would
   prevent the silent variant.
2. **Sibling component imports are default imports** (subagent B):
   named imports of sibling .svelte components don't work; the repo
   convention (default import) is unwritten. Candidate for the
   component-authoring barrel/import section.

## For the workflow docs / machine notes (skill candidate)

3. **Fresh worktrees must `svelte-kit sync` before vitest** (subagent
   B): apps/www/tsconfig.json extends `.svelte-kit/tsconfig.json`
   (gitignored); a cold worktree without it makes vite 8's rolldown
   optimizer fail with `TSCONFIG_ERROR → Could not resolve
   'node:module'`. One `npx svelte-kit sync` fixes it. Belongs beside
   the existing "Registry CLI traps on this machine" notes.
4. **Tests import through the mirror ($lib), never registry/files
   relative paths** (subagent A root-cause): npm deps of an item live
   under apps/www/node_modules; a spec importing
   `../../../registry/files/...` cannot resolve them. Convention is
   unwritten for TEST files specifically.

## For verify tooling (repo docs candidates)

5. **verify:shadcn-add exit code is swallowed by pipes** (subagent C):
   `| tail` masks `process.exit(1)`; capture to a file or use
   PIPESTATUS. Worth a header note in the script.
6. **meta.href pointing at a not-yet-existing docs page** (subagent C):
   verify:docs-structure happens to be staged-scope tolerant, but the
   behavior is undocumented — a note in the registry spec's
   "adding a component" scenario would remove a self-audit.

## Upstream debts observed (NOT this change's)

7. verify-hook-law pre-existing failure: `jx-tk-`/`jx-dsn-`
   trailing-dash hooks in apps/www/src/lib/ui/docs-sections-nav.svelte
   (stash-verified failing on the clean tree; the docs-sections-nav
   stream owns it).
8. B-source budget headroom: baseline 36106 → 37636 (+4.2%), ~275
   bytes from the +5% gate — the NEXT theme-css-touching change trips
   unless baselines are re-recorded (`verify-budgets --update`).
9. Root package-lock.json materialized shadcn's implicit lucide peer
   during worktree bootstrap; packages/vite-plugin/package-lock.json
   was stale at 0.1.0 (package.json says 0.2.0). Both are environment
   hygiene, excluded from this change's commit.
