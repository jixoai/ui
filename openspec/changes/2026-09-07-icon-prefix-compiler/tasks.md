# tasks — icon-prefix-compiler

## A. Scanner (packages/vite-plugin)

- [ ] A1: `src/icons/library/scan.ts` — the static-literal scanner
       (attribute + string-literal expression forms; `as` grammar;
       scope exclusions; (preset, name) sorted dedupe)
- [ ] A2: vite adapter wiring — enforce:'pre' transform collects;
       scanned-set changes invalidate through the slot-face refresh
       path; unit tests incl. dedupe, exclusions, expression-form
       non-matches (dynamic names intentionally unserved)

## B. Generator + typing

- [ ] B1: ScannedRef input stream (after declared refs); collision
       matrix (named errors: alias↔name, 2→1 alias, 1 ref↔other
       ref's name); packing shares one entry per ref (dual keys)
- [ ] B2: `IconName` emission gains `` `md:${string}` ``-style
       members for ENABLED presets only; generator tests for the
       union shape
- [ ] B3: dynamic-name lane — getIcon(null) rides the existing lazy
       path; dev-only unknown-name warn (the chunk-warn channel);
       component test for the reserved-box + no-crash contract

## C. Docs + gates

- [ ] C1: component page — prefixed names, the `as` form, the
       compile/build/runtime three-tier safety story, the
       dynamic-name contract; icons page cross-link; spec locks
- [ ] C2: full gate battery green (verify:all; vite-plugin suite;
       www suite)
- [ ] C3: ordering note — this change IMPLEMENTS after
       2026-09-07-icon-library-presets lands (resolvers dependency)

## D. Closure

- [ ] D1: codex doc-review rounds (PASS gate) → implementation
       streams → codex diff review → archive → push
