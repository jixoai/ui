# tasks — native-contract-fusion

- [x] Phase 0: OpenSpec authoring (proposal/design/spec deltas/tasks
      — this file set); design frozen on Codex r1 verdict
- [x] Phase 1: tw-context probe — `apps/www/test/tw-context-probe.spec.ts`
      + child-process runner: named-theme @apply FAILS, arbitrary/core/
      variant compile (4/4 green; vitest-in-worktree needed a one-time
      `svelte-kit sync` — .svelte-kit/tsconfig.json is generated)
- [x] Phase 2: Part A contract layer — BEGIN/END markers in
      jx-pure.css (mirror pair synced); scripts/gen-jx-native-contract.mjs
      (+ --check, npm run verify:contract); registry.json:
      `jx-native-contract` item + the 12 UI items switched deps +
      jx-pure description vocabulary fix; mirror manifest 91/303;
      payload regen (28,263B extract byte-identical)
- [x] Phase 3: toggle-group native rewrite — Part A `.jx-tgroup` law
      (mirror pair, contract extract regenerated; gzip 17,918B ≤ 18KB);
      toggle-group.svelte/-item.svelte rewritten (radio/checkbox,
      bind-law projection, reset sync, onValueChange/onchange split,
      rest-before-internal binding, name REQUIRED in single);
      toggle-group.css DELETED (the law is Part A); batch4 +
      composition-c/-props tests rewritten; blueprint scene + SVG;
      docs page copy; full suite 549/549, svelte-check 253/61/19
      (== main baseline)
- [ ] Phase 4: pilots on the mirror law — native-select → input →
      textarea → checkbox → radio → toggle (each: mirror sheet +
      markup cleanup + parity fixture); subagent batches per Owner
      orchestration; shared files ZCode-only
- [ ] Phase 5: Part B density adoption — jx-pure.css Part B
      hard-codes → alias interface; B0 scoped font-size/line-height;
      verify-jx-pure(-engines) assert derived numbers; gzip budget
      re-checked (≤18KB)
- [ ] Phase 6: `verify-native-parity.mjs` — shared fixtures, both
      renderers, state matrix × density × light/dark, normalized
      values; screenshot oracle for pseudo builds; npm script + CI
- [ ] Phase 7: gates all green (vitest suite, svelte-check,
      verify:mirror incl. contract, gzip, verify-jx-pure engines,
      parity) + verification.md evidence index
- [ ] Phase 8: Codex implementation review loop until ≥9/10 or two
      consecutive non-improving rounds → hand over per the
      algorithm-task escalation rule; then integration commit(s)
      per batch
