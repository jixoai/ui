# Tasks

- [x] 1. Write the tier-conditional spec delta (supersedes the archived
      unconditional SHALL per Owner ruling B+C).
- [x] 2. Validate the change (`openspec validate --strict`).
- [x] 3. Archive the change WITHOUT `--skip-specs` — the delta lands in the
      living spec `openspec/specs/docs-site/spec.md`.
- [x] 4. Post-landing gates: `npm run verify:docs` rc=0 (the staged scope
      behavior unchanged — 11 inScope hard-fail, warn fleet + backlog
      printing as designed); confirm no skeleton-scope json change.
