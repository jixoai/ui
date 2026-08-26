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
- [x] Phase 6: `verify-native-parity.mjs` complete — 5 rows (tgroup/
      native-select/checkbox/radio/toggle) + @xs/@dark variant sections;
      color-tolerant comparison; transition/animation freeze; hue-stable
      capture (the site's wall-clock brand hue!); pixel oracle with the
      capture-baseline tolerant comparator: checkbox+radio 0.000% hot,
      toggle warn-only (knob carrier divergence — known gap)
- [x] Phase 7: gates all green — vitest 549/549, svelte-check
      253/61/19 == baseline, verify:mirror GREEN (303 pairs),
      verify:contract GREEN, gzip 18,279B ≤ 18KB, verify-jx-pure all
      checks (derived asserts), parity GREEN; verification.md updated
- [x] Phase 8: Codex review loop CLOSED at 8.8/10 (r5, no release
      blockers; Codex verified the fixes with positive+negative cases).
      The ≥9/10 bar was not literally reached — recorded honestly;
      merge/ship is the Owner's ruling. Trajectory 6.5→8.0→8.3→8.1→8.8.
      Non-blocking follow-ups indexed in verification.md
