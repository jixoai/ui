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
- [x] Phase 4: pilots on the mirror law — native-select (pilot,
      af1037d) → input+textarea (423020f) → checkbox+radio (405a12e,
      subagent batch) → toggle (cf17648); RANGE ruled out of scope
      (custom pointer-driven slider, not a native wrapper — design
      §4 scope ruling); full suite 549/549, svelte-check == baseline,
      parity gate GREEN
- [x] Phase 5: Part B density adoption — 7 regions swept (B3 buttons,
      B4 text-like box law, textarea min, date/time indicator icon,
      checkbox + radio icon scale; B0 scoped text/leading); fallbacks =
      the old literals (Part A precedent); verify-jx-pure.mjs asserts
      DERIVED values via var() probe elements (never 40px/16px again);
      all face checks pass; native-select parity row FLIPPED GREEN
      (166 comparisons); gzip 18,060B ≤ 18KB
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
