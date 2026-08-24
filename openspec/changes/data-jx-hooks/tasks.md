# tasks — data-jx-hooks

> DRAFT for Codex review — implementation starts only after Approve.

## P0 — inventory + codemod

- [ ] 0.1 DONE r2: `scripts/jx-inventory.mjs` (structured scanner)
      + `scripts/verify-hook-law.mjs` (failing gate, proven failing
      pre-migration) are committed; the COMMITTED authoritative manifest is
      `openspec/changes/data-jx-hooks/inventory.json` (clean-worktree
      regeneration, --label provenance). Original:
      DEFINED/HOOK split + variant families + foreign reference map;
      its JSON output is the codemod's seed.
- [x] 0.2 DONE: codemod v2 = the provably-mechanical subset (selectors/classList/directives); class-expression sites migrated by the manifest-guided subagent batches. `scripts/codemod-data-jx.mjs` implements the D1 shape table
      + D3 six file classes with a dry-run
      mode; hand-review sites reported, not auto-forced.
- [ ] 0.3 DONE r2: verify-hook-law.mjs committed; fixtures green;
      --post proven failing on the pre-migration tree (3 failures).

## P1 — the rewrite

- [x] 1.1 Codemod pass over component .svelte (registry + mirror),
      tests, docs routes, scenes, scripts, site src.
- [x] 1.2 Hand-review sites resolved per D2; decisions recorded.
- [x] 1.3 Mirror byte-equality + manifest regenerate.

## P2 — gates

- [x] 2.1 DONE (build:site blocked by Owner prototype-docs WIP — see verification.md): vitest, npm run build, apps build + build:site,
      manifest --check, verify-layer-law, verify-folder-css,
      shadcn-add fixtures, clean-consumer.
- [x] 2.2 verify-hook-law browser probes (D4(c)).
- [x] 2.3 Screenshot oracle: capture + compare vs the archived
      baseline (markup-only change; 0 CHANGED expected — any delta is
      a finding).

## P3 — docs + archive

- [x] 3.1 README consume section: the breaking markup-contract note
      (hooks are data-jx-* attributes).
- [ ] 3.2 verification.md with evidence; Codex implementation review;
      archive.
