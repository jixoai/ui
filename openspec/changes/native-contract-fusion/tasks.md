# tasks — native-contract-fusion

- [x] Phase 0: OpenSpec authoring (proposal/design/spec deltas/tasks
      — this file set); design frozen on Codex r1 verdict
- [x] Phase 1: tw-context probe — `apps/www/test/tw-context-probe.spec.ts`
      + child-process runner: named-theme @apply FAILS, arbitrary/core/
      variant compile (4/4 green; vitest-in-worktree needed a one-time
      `svelte-kit sync` — .svelte-kit/tsconfig.json is generated)
- [ ] Phase 2: Part A contract layer — BEGIN/END markers in
      jx-pure.css; `scripts/gen-jx-native-contract.mjs`;
      registry.json: `jx-native-contract` item + the 12 UI items
      switch deps + jx-pure description vocabulary fix; mirror
      manifest + payload regen; drift gate folded into verify:mirror
- [ ] Phase 3: toggle-group native rewrite — Part A `.jx-tgroup` law
      (mirror pair); toggle-group.svelte/-item.svelte rewritten
      (radio/checkbox, bind:group, reset sync, onValueChange split,
      rest-before-internal binding); toggle-group.css mirror sheet;
      batch4 tests rewritten to the new contract; docs page updated
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
