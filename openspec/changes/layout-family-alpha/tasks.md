# Tasks: layout-family-alpha

- [x] 1. Spec delta: the new `layout-family` domain (ADDED —
      standardized vocabulary, single-root/rest-spread, inline-style
      posture, alpha stamp); `openspec validate
      layout-family-alpha --strict` green.
- [x] 2. The three items under `registry/files/ui/`:
      `prototype-flex`, `prototype-grid`, `prototype-waterfall`
      (component + pure barrel each; intent header with the original
      requirement input + timestamp; TS-strict; zero imports).
- [x] 3. registry.json: three entries with `meta.alpha: true`,
      group `layout`, live hrefs; descriptions name the alpha track
      and the stamp precondition.
- [x] 4. The www mirrors + `gen-mirror-manifest.mjs` regeneration;
      `verify:mirror --check` green.
- [x] 5. Minimal alpha docs pages (one per item) + svelte.config
      entries + docs-structure taxonomy snapshot re-freeze
      (layout 16→19, 108 ui items); catalog.spec + docs-structure
      green.
- [x] 6. The acceptance suite
      `apps/www/test/prototype-layout-family.spec.ts`: props→style
      1:1 mapping (every union member + both number coercions),
      omission transparency, rest spread on the single root,
      children render, alpha registry contract. Dependency-free
      (native mount — see design §6): in-worktree verification is
      the pure-node source smoke (skeleton/spread-order/coercions/
      registry/mirror/compile — green); the vitest suite itself
      runs on the tracked lane in the main checkout at merge (the
      baseline's vitest cannot cold-start anywhere — friction
      report).
- [x] 7. Gate sweep: verify:context (no Defaults owed — confirm by
      run), verify:standards, verify:meta untouched-green; the
      touched suites green.
- [ ] 8. super-thinker review rounds; absorb blockers until ≥8
      with none open.
- [ ] 9. Merge to main (main-checkout merge, --no-ff, after status
      check); the suite + touched gates re-run green on main.
- [ ] 10. Archive the change (living spec applied from the delta;
       archive commit on main, spec-sync only).
