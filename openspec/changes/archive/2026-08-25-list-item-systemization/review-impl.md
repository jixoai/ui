# Implementation Review — list-item-systemization

**Scope.** This review covers the list-item implementation commits in
`15db505..1808331` (the seven list-item commits from `bdaa4e1` through
`1808331`). The working tree contains unrelated icon-button/press-button/
tooltip/blueprint changes; those were not reviewed. Generated `public/`
artifacts were also excluded.

## Verdict

**BLOCK — 6.1 / 10.** The implementation delivers most of the intended
family and the main runtime gates are strong, but several public contracts are
not the contracts in `design.md`, and two claimed acceptance gates are weaker
than the task text says. The blockers are concrete and independently
verifiable; this is not a request for a cosmetic refactor.

## Blockers

1. **`ItemRadio` is not bindable, violating the five-adapter contract.**
   `design.md` §3 requires `checked — $bindable(false)` for every adapter.
   [item-radio.svelte:20-45](../../../apps/www/src/lib/ui/list-item/item-radio.svelte:20)
   extends `ControlProps`, but never declares `checked = $bindable(false)` or
   `bind:checked`. It merely leaves a caller-supplied `checked` in
   `controlProps`, which is one-way forwarding and makes
   `<ItemRadio bind:checked>` fail the child bindable contract. Add an explicit
   bindable `checked`, remove it from the spread set, bind it to `Radio`, and
   add a two-way test (including the same-name radio behavior).

2. **`ItemToggle` exposes the wrong public size API.** The design table names
   `size: 'sm'|'md'|'lg'` as the toggle control footprint, while the
   implementation exposes an undeclared `controlSize` prop and uses `size` for
   the ItemField density
   ([item-toggle.svelte:21-36](../../../apps/www/src/lib/ui/list-item/item-toggle.svelte:21),
   [item-toggle.svelte:68-76](../../../apps/www/src/lib/ui/list-item/item-toggle.svelte:68)).
   A consumer following the approved contract cannot set the toggle footprint,
   and `ComponentProps<typeof Toggle>` is sealed against `size` instead of
   resolving the documented API. Decide the public collision explicitly and
   make the implementation/types/docs/tests agree; do not leave `controlSize`
   as an undocumented substitute.

3. **The resolved chrome stamp can leave the declared `ItemChrome` union.**
   The contract says stamped chrome is only
   `surface|none|outline|muted`, but the resolution code writes the raw
   explicit variant, including `default`
   ([item.svelte:25-35](../../../apps/www/src/lib/ui/list-item/item.svelte:25),
   [item.svelte:53-57](../../../apps/www/src/lib/ui/list-item/item.svelte:53)).
   CSS has no `data-item-chrome="default"` rule and even describes it as an
   undocumented transparent escape hatch
   ([item.css:263-281](../../../apps/www/src/lib/ui/list-item/item.css:263)).
   Normalize `default` to the intended resolved value (probably `none`) or
   amend the public union, algorithm, docs, and tests together. A public stamp
   cannot be both an exhaustive union and an extra value.

4. **`ItemDivider` violates its own public DOM contract outside a group.**
   The approved v1 module is a childless decorative
   `<li role="presentation">`; the implementation conditionally renders a
   `<div>` when no group context exists
   ([item-divider.svelte:15-22](../../../apps/www/src/lib/ui/list-item/item-divider.svelte:15)).
   This creates two element contracts for one exported component, and the
   current test only checks role/emptiness, not the tag
   ([list-item.spec.ts:112-117](../../../apps/www/test/list-item.spec.ts:112)).
   Make the component group-only and enforce/document that boundary, or always
   render the specified `li` and add the corresponding validity test.

5. **The matrix gate does not prove the full matrix contract it claims.** The
   wide loop checks both columns and areas, but the narrow loop checks only
   `grid-template-areas`
   ([verify-item-matrix.mjs:130-142](../../../scripts/verify-item-matrix.mjs:130)).
   The task requires both computed properties for every narrow end-present
   combination and the no-implicit-track guarantee. The script also claims a
   focus-visible paint gate but contains no focus assertion; its 31/31 result
   has no focus case. Extend the narrow result object with computed columns,
   assert the expected one-/two-track template for all eight cases, focus an
   anchor and assert the ring, then keep the 31-case count (or update it).

6. **The install-closure proof is not isolated and does not prove exact-once
   list-item dependencies.** Fixture C installs accordion, toast, code-card,
   progressive-blur, and list-item in one consumer
   ([verify-shadcn-add.mjs:225-245](../../../scripts/verify-shadcn-add.mjs:225)).
   Its list-item checks only file presence for controls/icons/theme
   ([verify-shadcn-add.mjs:280-303](../../../scripts/verify-shadcn-add.mjs:280));
   the only exact-once tree assertion is for `toast-store.ts`. A missing
   list-item registry dependency could be satisfied by one of the earlier
   fixtures, so `ALL GREEN` is not proof of list-item closure. Add a clean
   list-item-only consumer or an isolated install phase, assert every
   dependency's canonical target exactly once, and assert the dependency graph
   resolves from the list-item payload itself.

7. **The reactive-policy implementation does not follow or prove the adopted
   `$state` law.** `design.md` §2/§8 requires a stable context object whose
   policy fields are `$state`-backed and explicitly requires post-mount
   re-resolution plus nested shadowing. The implementation uses getter-backed
   `$props` variables instead
   ([item-group.svelte:60-85](../../../apps/www/src/lib/ui/list-item/item-group.svelte:60)),
   and the tests cover only initial stamps
   ([list-item.spec.ts:68-94](../../../apps/www/test/list-item.spec.ts:68)).
   Getter-backed props may happen to update under current Svelte semantics, but
   that is not the specified authoring law and is unprotected behavior. Use the
   prescribed reactive state holder or add a client fixture that mutates group
   mode/size/layout/dividers and proves re-resolution, plus a nested-group
   shadowing case. Also test the divider matrix: default omitted, muted forced
   none, plain omitted none, and plain explicit auto.

## Non-blocking notes

- The CSS family matrix is plain `.jx-item` rather than consistently
  `:where(.jx-item)`; the design explicitly calls for `:where()`-wrapped family
  rules. The later layer ordering currently limits the practical impact, but a
  source guard should pin the intended specificity law.
- `Item` is typed from `HTMLAnchorAttributes` only
  ([item.svelte:27-39](../../../apps/www/src/lib/ui/list-item/item.svelte:27)),
  while the public contract is a div-or-anchor rest surface. Add a proper
  discriminated/union prop type so div-only attributes are not rejected at
  compile time.
- `ItemChevron` relies on `aria-hidden` embedded in the child SVG; the wrapper
  span itself is not stamped `aria-hidden`
  ([item-chevron.svelte:11-14](../../../apps/www/src/lib/ui/list-item/item-chevron.svelte:11)).
  Put the decorative contract on the exported leaf as well and test the wrapper
  directly. The no-inheritance/no-implicit-chevron behavior itself is correct.
- `ItemGroup` repeats `data-size` on the `<ul>` even though the stamped-attribute
  table assigns group size to the frame and only `data-slot`/`data-dividers` to
  the list ([item-group.svelte:88-105](../../../apps/www/src/lib/ui/list-item/item-group.svelte:88)).
  Either document the CSS-facing duplicate or remove it and express list rhythm
  from the frame.
- The explicit divider edge reset is structurally safe, but the test proves the
  row before the divider rather than the row after it. Add both sides to make the
  single-source law regression-proof.
- `ItemField.disabled` is accepted but unused by the scaffold itself
  ([item-field.svelte:57-69](../../../apps/www/src/lib/ui/list-item/item-field.svelte:57)).
  Adapters do pass disabled to their controls; raw `ItemField` consumers need a
  documented control responsibility or a context field.
- `ItemMedia` renders no `<img>` when `variant="image"` has no `src`
  ([item-media.svelte:21-28](../../../apps/www/src/lib/ui/list-item/item-media.svelte:21)).
  The contract should either require `src` for that variant or define the
  fallback explicitly.

## Gate results

| Gate | Result | Reality |
|---|---:|---|
| Focused list-item/field/bridge Vitest | 14/14 | Green; initial DOM/ARIA cases pass. |
| Full Vitest (`cd apps/www && npx vitest run`) | 471/471 | Green in the current run; unrelated dirty tooltip changes were not treated as list-item evidence. |
| Matrix (`node scripts/verify-item-matrix.mjs`) | 31/31 | Green for implemented assertions; narrow columns and focus are not asserted (Blocker 5). |
| Install proof (`node scripts/verify-shadcn-add.mjs`) | Green | 21 files, no separator, consumer Vite build; isolation/exact-once gap remains (Blocker 6). |
| Site build (`npm run build:site`) | Green, 7/7 | Site, registry, 88 registry files, llms/md checks completed. |
| Mirror check (`npm run verify:mirror`) | Fails | Committed manifest is stale only because unrelated dirty tooltip files differ; all 21 list-item canonical/mirror files are byte-identical by direct `cmp`. |
| Filtered `svelte-check` | Fails | Workspace run reports 366 errors. Relevant output includes missing `TocSection` in list-item docs `+page.ts`, `play-range.svelte` `onchange`, and fake-Snippet typing in `test/list-item.spec.ts`; no direct list-item source adapter error was reported. The docs/playground claimed clean gate is therefore not reproducible. |

## Tasks versus reality

1. **Task 1 — partially supported.** Rest forwarding, reactive class
   composition, and `chevronRight` are implemented; focused Vitest passes. The
   stale-warning claim is not pinned by a dedicated warning assertion.
2. **Task 2 — not fully supported.** Native group DOM, stamps, CSS, and initial
   divider ownership pass. Reactive rerender, nested shadowing, and the full
   divider-resolution matrix are not tested, and the context authoring law
   differs from the design (Blocker 7).
3. **Task 3 — not fully supported.** Initial IDs, label modes, described-by,
   invalid, and disabled forwarding pass for the fixture. Radio is not
   bindable, Toggle size is renamed, and the claimed Chromium keyboard smoke is
   absent from the reviewed test surface (Blockers 1–2).
4. **Task 4 — partially supported.** The PlayRow bridge test proves real label
   targets for its fixture and the full Vitest suite is green. The claimed
   playground-wide typecheck is not green in the current filtered check.
5. **Task 5 — partially supported.** The rebuilt page and production build are
   present, but the filtered docs-page typecheck reports the missing
   `TocSection` export and no reproducible 19/19 browser test is committed.
6. **Task 6 — partially supported.** The 16-wide matrix, implemented narrow
   areas, selected paint, and divider paint pass. Narrow columns and focus
   remain unproven (Blocker 5).
7. **Task 7 — partially supported.** Registry dependencies, 21-file payload,
   mirror bytes, and consumer build pass. The install proof is not an isolated
   list-item closure proof (Blocker 6).
8. **Task 8 — correctly still open.** This document is the requested review
   artifact; no source fixes were made during the audit.

## Quality by contract area

| Area | Assessment | Notes |
|---|---:|---|
| Typed policy and stamped resolution | 6/10 | Initial auto-variant, size/layout inheritance, and stable Symbol key work; `$state` law and dynamic tests are missing, and `default` can escape `ItemChrome`. |
| Group DOM, labels, dividers | 7/10 | Native section/div + ul/li structure and ul-only divider ownership are correct; standalone divider fallback and dynamic divider matrix drift. |
| End lane and presence matrix | 7/10 | All 16 wide selectors and 8 narrow selectors exist and wide runtime geometry passes; narrow columns/focus gates are incomplete. |
| ItemField context and label modes | 7/10 | IDs, label/for versus text, described-by ordering, and invalid wiring pass initial fixtures; disabled/raw-field behavior is underdefined. |
| Five adapters | 4/10 | Four adapters are thin and mostly correctly sealed; Radio bindability and Toggle size are public contract failures, with no committed keyboard smoke. |
| Terminal paint and chevron | 7/10 | Terminal tokens, no `--card`, selected edge, explicit chevron composition, and divider strengths are implemented; wrapper hiding and default stamp need tightening. |
| Registry and consumer closure | 6/10 | Payload and Vite consumer compile; the combined fixture cannot establish isolated dependency closure or exact-once placement. |
| Tests/docs/playground evidence | 5/10 | Full Vitest, matrix, build, and focused tests are useful; claimed dynamic/browser/typecheck evidence is incomplete or not reproducible. |

## What changed since the design round

The design round ended at **ACCEPT 9.2** after resolving the earlier six
planning blockers: `data-dividers` now belongs only to the list, the public
tables are copied into `design.md`, the five adapters and reserved sets are
planned, the 16-combination gate is named, and the install-closure proof is
specified. The implementation does realize those major shape decisions: the
family is 21 files with byte-identical registry/app mirrors, groups are native
section/div + ul/li, ItemEnd keeps the matrix at four bits, terminal paint no
longer uses `--card`, ItemField has both label modes, and the registry consumer
build works.

The remaining gap is therefore execution precision, not product direction:
Radio and Toggle diverge from the accepted public API; `default` and
standalone divider stamps diverge from the accepted DOM/value contract; the
dynamic policy and keyboard claims are not proven; and the matrix/install
scripts report green without covering all of the dimensions the design names.

## Score

**6.1 / 10 — Block.** The implementation earns substantial credit for the
system-level rewrite and the green runtime/build evidence, but a v1 UI family
cannot ship while one of five adapters is not bindable, a documented public
prop is renamed, a stamped union is open-ended, and the two highest-risk
release gates are incomplete. Fix Blockers 1–7, rerun the focused/browser/
consumer checks, and then re-review the task-8 box.

## Round 2

**Scope and method.** This round audits `4630fe0` on top of `1808331` against
the amended `design.md` sections 2, 3, and 8, the complete design contract,
and the checked boxes in `tasks.md`. The original implementation range remains
the review subject; the remediation commit is assessed as the follow-up delta.
The dirty icon-button/press-button/tooltip/blueprint/session changes and
generated `public/` output remain excluded.

### Gate rerun

| Gate | Result | Evidence and boundary |
|---|---:|---|
| Focused list-item, field, bridge Vitest | **16/16 pass** | `npx vitest run test/list-item.spec.ts test/list-item-field.spec.ts test/playground-bridge.spec.ts`; the Radio click-through and reactive-policy tests pass. The compiler still emits the existing Radio `aria-invalid` warning. |
| Full Vitest | **FAIL: 462 pass, 1 fail; 2 suites fail** | `cd apps/www && npx vitest run`. `composition-f.spec.ts` crashes before tests because the unrelated dirty `terminal-header` edit no longer matches its probe; registry parity reports the unrelated dirty breadcrumb payload. No list-item test failed. |
| Matrix browser gate | **33/33 pass** | `node scripts/verify-item-matrix.mjs`; both computed columns and areas for all 8 narrow combinations, both divider-adjacent edges, selected paint, `wrap=never`, and real Tab focus-visible are asserted. |
| Install closure | **ALL GREEN** | `node scripts/verify-shadcn-add.mjs`; the isolated list-item-only consumer installs 21 files, omits `item-separator`, finds each dependency target exactly once tree-wide, and builds with Vite. |
| Filtered Svelte check | **FAIL (exit 1)** | `npx svelte-check --tsconfig ./tsconfig.json --output machine`, filtered to list-item/playground/docs-page paths: 12 errors remain in `test/list-item.spec.ts` from the cast fake Snippet helper; `play-range.svelte` has a pre-existing `onchange` prop error and `play-segmented.svelte` a warning. The list-item docs page has no `TocSection` error after the re-export; Radio still warns on `aria-invalid`. |
| Canonical/registry parity | **PASS** | Direct `cmp` over all 21 `registry/files/ui/list-item/*` files and their `apps/www` counterparts. |
| Diff hygiene | **PASS** | `git diff --check 1808331..4630fe0`. |

The full-suite and playground failures above are not attributed to this
feature where their files are outside the reviewed range. The list-item test
type errors are in-scope evidence failures even though Vitest executes them.

### B1–B7 resolution verdicts

1. **B1 Radio bindability — RESOLVED, with the amended contract.** `Radio`
   now exposes a `$bindable()` `group`, `ItemRadio` forwards `bind:group`, and
   `checked` remains an uncontrolled native rest attribute. This matches
   Svelte's radio law and the amended table in [design.md:165-171](design.md:165).
   The fixture proves same-name selection and click-through; it does not
   observe the parent variable after the click (see the notes below).
2. **B2 Toggle size collision — RESOLVED.** `controlSize` is documented as
   the Toggle footprint and `size` remains ItemField density. The Omit sealing
   and `size={controlSize}` forwarding are present in [item-toggle.svelte:16-75](../../../apps/www/src/lib/ui/list-item/item-toggle.svelte:16).
3. **B3 Closed chrome stamp — RESOLVED.** Explicit `variant="default"` now
   stamps `data-item-chrome="none"`; the test asserts the closed union and
   the CSS has no `default` paint branch.
4. **B4 ItemDivider DOM — RESOLVED.** The component always emits an empty
   `<li role="presentation" data-slot="item-divider">`; the test now asserts
   the tag and childlessness. The group-only consumer boundary is documented.
5. **B5 Matrix gate — RESOLVED.** The revised Chromium script reports 33/33
   and checks both computed properties for every narrow case, both sides of an
   explicit divider, and keyboard focus-visible paint.
6. **B6 Install closure — RESOLVED.** Fixture C now has an isolated consumer
   that installs only list-item, checks canonical targets exactly once, rejects
   the removed separator, and performs a real Vite build.
7. **B7 Reactive policy law — RESOLVED for the amended getter-backed law.**
   `ItemGroup` creates one typed Symbol context with getter-backed `size` and
   `layout`; the fixture proves live mode/size/divider changes, nested
   shadowing, and the default/muted/plain divider omission matrix. The original
   `$state-holder` wording was amended in [design.md:71-85](design.md:71).

### New blockers

8. **ItemInput drops the required ARIA relations.** `ItemInput` passes the
   computed `aria-invalid` and `aria-describedby` at
   [item-input.svelte:63-71](../../../apps/www/src/lib/ui/list-item/item-input.svelte:63),
   but `Input`'s normal, range, and color branches spread `rest` and then write
   their own `invalidAttr`/`describedBy` values at
   [input.svelte:169-217](../../../apps/www/src/lib/ui/input/input.svelte:169).
   Because the adapter deliberately omits `error`, those internal values are
   undefined and overwrite the adapter's values on the native input. An
   `<ItemInput error="...">` therefore loses both `aria-invalid="true"` and
   the ItemField error/description chain. Fix the Input/adapter merge law so
   computed adapter relations survive (without allowing caller rest props to
   replace them), and add an ItemInput error regression asserting the native
   attributes and referenced nodes. Mirror the fix in the registry copy.

9. **The `data-dividers` ownership law is still bypassable through frame rest
   attributes.** `ItemGroup` stamps `data-dividers` only on the `<ul>`, but
   [item-group.svelte:88-103](../../../apps/www/src/lib/ui/list-item/item-group.svelte:88)
   spreads `...rest` onto the frame and never clears a caller-supplied
   `data-dividers`. `<ItemGroup data-dividers="none">` consequently leaves a
   second stamp on the frame, violating §1/§5 and the component-owned
   attribute-last rule. Strip that key from rest or explicitly set the frame's
   `data-dividers` to `undefined`, and add a DOM regression for a malicious
   caller stamp. Mirror the change and rerun the source/SSR checks.

10. **Three narrow matrix selectors still violate the `:where()` specificity
   law.** The remediation claim says the family matrix is `:where()` wrapped,
   but the canonical and mirrored CSS leave the no-media narrow selectors as
   raw `.jx-item` at [item.css:456-468](../../../apps/www/src/lib/ui/list-item/item.css:456).
   Wrap all three selectors and add a source guard that rejects any matrix rule
   beginning with bare `.jx-item`; the 33/33 geometry result does not test this
   cascade contract.

11. **The accepted public tables are internally contradictory.**
   `design.md` §3 still advertises `ItemField disabled: boolean` at
   [design.md:122-134](design.md:122), while amended §8 and the implementation
   explicitly remove that prop and make adapters own disabled forwarding.
   `tasks.md:39` repeats the stale “disabled forwarded to field AND control”
   wording, and `tasks.md:14-16` still names `$state` fields after §2/§8
   accepted getter-backed fields. Remove or amend those stale rows before
   archive (restoring `ItemField.disabled` would be the incompatible option).

12. **The adapter Reserved tables do not describe the implemented Omit sets.**
   `ItemCheckbox`, `ItemSelect`, and `ItemInput` omit the native numeric
   `size` prop in [item-checkbox.svelte:14-19](../../../apps/www/src/lib/ui/list-item/item-checkbox.svelte:14),
   [item-select.svelte:14-19](../../../apps/www/src/lib/ui/list-item/item-select.svelte:14),
   and [item-input.svelte:14-19](../../../apps/www/src/lib/ui/list-item/item-input.svelte:14),
   but §3 lists native `size` as reserved only for Toggle and Radio. Either
   amend the three table rows to name this reservation or expose a deliberate
   non-colliding control-size prop; then add compile-time consumer probes so
   “all non-reserved control props” cannot drift again.

13. **The checked reactive-policy gate omits layout mutation.** `tasks.md:27-32`
   requires mode/size/layout/dividers re-resolution, but
   `item-policy-host.svelte` and its test mutate/assert only mode, size, and
   dividers. Add a live `layout` prop flip and assert both the group frame and
   an auto-layout Item's `data-layout`, or amend the task gate to match the
   narrower evidence. The getter implementation itself exposes layout, so this
   is an unproven required dimension rather than a demonstrated runtime failure.

14. **The claimed zero-error filtered typecheck is not reproducible.** The
   remaining list-item errors are the in-scope fake Snippet values in
   [test/list-item.spec.ts:33-147](../../../apps/www/test/list-item.spec.ts:33),
   which are cast to an object with `render` and rejected by Svelte's `Snippet`
   type. Replace the helper with a type-correct snippet fixture (or make the
   checker configuration intentionally exclude test files and state that
   boundary). Do not retain the commit message's `svelte-check 0 errors` claim
   while the requested filtered command exits 1.

### Non-blocking notes

- The new Radio source comment still says “Uncontrolled by design” even though
  `group` is now bindable. Update the prose; the implementation and amended
  table are correct.
- The focused test proves radio DOM click-through but does not assert the
  parent's bound `group` value. Add that assertion when the fixture is next
  touched; same-name native behavior is already covered.
- Svelte emits the existing `aria-invalid` warning for the implicit radio role.
  The design requires the state for invalid fields; keep it unless the project
  adopts a documented compiler-warning suppression or a semantically equivalent
  validation wrapper.
- The amended no-`src` `ItemMedia` behavior, `<ul data-size>` rhythm stamp,
  anchor-superset rest type, wrapper `aria-hidden`, and childless divider are
  documented and implemented. Their dedicated assertions could be expanded,
  but no new behavior defect was found.
- No browser walkthrough for all five adapter keyboard stories or all eight
  documentation sections is committed. The focused runtime and install gates
  are useful evidence, but they do not replace that task-level acceptance.

### Tasks versus reality

1. **Task 1 [x] — supported.** Rest forwarding, reactive Item class
   composition, and `icons.chevronRight` are present; focused tests pass.
2. **Task 2 [x] — partial evidence.** Group DOM, typed policy, stamps, divider
   ownership, nested shadowing, and the divider matrix pass. Layout rerender is
   untested; the task prose still names the rejected `$state` holder and stale
   disabled behavior.
3. **Task 3 [x] — partial and currently blocked.** All five adapters have
   bindable channels and compile-time Omit shapes, but ItemInput's ARIA output
   is wrong, its Reserved table is stale, and the filtered checker is not clean.
4. **Task 4 [x] — bridge runtime passes.** The PlayRow bridge test is green;
   the broader playground checker still sees the pre-existing play-range
   `onchange` error and a segmented warning.
5. **Task 5 [x] — implementation present, acceptance incomplete.** The docs
   page export root cause is fixed and the list-item page has no filtered
   diagnostic, but the requested browser walkthrough is not a committed gate.
6. **Task 6 [x] — matrix gate passes.** The browser matrix is 33/33, including
   narrow columns/areas, divider edges, selected paint, and focus ring. The CSS
   specificity guard and ItemInput regression are still missing.
7. **Task 7 [x] — closure passes.** The isolated list-item-only consumer and
   exact-once dependency checks are green; canonical/registry byte parity is
   also green.
8. **Task 8 [ ] — this Round 2 review is now appended, but the box remains
   open until the blockers above are corrected and re-reviewed.**

### Quality by contract area

| Area | Assessment | Round 2 basis |
|---|---:|---|
| Typed policy and stamped resolution | 8.5/10 | Getter-backed context, closed chrome union, SSR-deterministic initial stamps, and live mode/size/divider evidence pass; layout live evidence and frame `data-dividers` sealing remain. |
| Group DOM, labels, dividers | 8.5/10 | Native section/div + ul/li, label wiring, ul-only implementation, explicit edge law, and childless divider are correct; caller rest can reintroduce a frame divider stamp. |
| End lane and presence matrix | 8.5/10 | All 16 wide and 8 narrow combinations are self-contained and computed geometry is green; three narrow selectors still miss the required `:where()` specificity law. |
| ItemField context and label modes | 7/10 | Context IDs, for/text modes, described-by ordering, and native target IDs pass; ItemInput loses the computed invalid/description relations. |
| Five adapters | 7/10 | Radio group, Toggle controlSize, bindables, disabled forwarding, and Omit sealing are largely sound; ItemInput ARIA is functionally broken and three native-size reservations are undocumented. |
| Terminal paint and chevron | 9/10 | Terminal tokens, no `--card`, explicit chevron composition/hidden wrapper, selected edge, and divider strengths match the contract. |
| Registry and install closure | 9.5/10 | Isolated consumer, exact-once dependency targets, Vite build, and 21-file canonical/mirror parity all pass. |
| Tests, docs, and task evidence | 6.5/10 | Focused tests and the two browser/install gates pass, but the filtered checker exits 1, layout is untested, and full-suite green is not reproducible in this dirty workspace. |

### What changed since the design round

The design round ended at **ACCEPT 9.2** after the policy, divider ownership,
self-contained tables, adapter Reserved sets, matrix, and install-closure
decisions were accepted. Round 2 now confirms that the implementation has the
intended product shape: native group DOM, getter-backed reactive policy,
explicit chrome stamps, the four-bit end lane, terminal paint without
`--card`, ItemField label modes, all five thin adapters, the 33-case matrix,
and an isolated registry consumer.

The remediation also correctly changed the Radio API to Svelte's `group`
channel rather than the impossible `bind:checked` suggestion, documented
Toggle `controlSize`, normalized explicit `default`, made ItemDivider a
childless `<li>`, strengthened both browser/install gates, and fixed the
`TocSection` export root cause. The remaining issues are execution precision
and contract bookkeeping: ItemInput ARIA propagation is wrong, a rest path can
duplicate `data-dividers`, three narrow selectors miss the cascade law, the
docs/tasks tables have stale API statements, and the requested type/layout
evidence is incomplete.

### Final score and archive call

**7.8 / 10 — BLOCK for archiving.** The core family architecture and the
highest-risk matrix/registry gates are now strong, so this is materially above
the original 6.1 review. A v1 archive still needs the ItemInput ARIA fix and
regression, frame stamp sealing, CSS specificity correction, and synchronized
design/task/typecheck evidence. Re-run the focused/full/filtered gates after
those changes, then close task 8.

## Round 3

**Scope.** Final archive check of `bb43022` (`fix(ui): impl-review r2
remediation — B8-B14 precision pass`) against the complete amended design and
tasks contract. The direct commit changes only the Input merge law, ItemGroup
stamp sealing, the three CSS selectors, Radio prose, the policy/field fixtures,
and the synchronized design/tasks text; unrelated props-sweep commits and the
dirty icon-button/press-button/tooltip work remain outside this review.

### Gate rerun

| Gate | Result | Evidence and boundary |
|---|---:|---|
| Full Vitest | **479/479 pass** | `cd apps/www && npx vitest run`. The suite is green; compiler warnings remain for unrelated components and the known Radio `aria-invalid` rule. |
| Matrix browser gate | **33/33 pass** | `node scripts/verify-item-matrix.mjs`; all wide/narrow columns and areas, divider edges, selected paint, `wrap=never`, and focus-visible remain green. |
| Install closure | **ALL GREEN** | `node scripts/verify-shadcn-add.mjs`; combined and isolated consumers pass, with 21 family files, no separator, exact-once dependency targets, and Vite builds. |
| Filtered Svelte check | **0 relevant errors** | Workspace `svelte-check` still exits 1 on unrelated `toc-link.svelte`/`input-otp.svelte` diagnostics. Filtering to `src/lib/ui/list-item/**`, `radio.svelte`, `input.svelte`, `toc.svelte`, and list-item fixtures/tests yields no errors; only the existing Radio `aria-invalid` warning remains. |
| Canonical/registry parity | **PASS** | `cmp` passes for all 21 list-item files, and also for the changed Input and Radio mirrors. |
| Diff hygiene | **PASS** | `git diff --check 4630fe0..bb43022`. |

### B8-B14 resolution verdicts

8. **B8 ItemInput ARIA propagation — RESOLVED.** `Input` now retains
   caller-supplied `aria-invalid`/`aria-describedby` whenever its own `error`
   wiring is absent, across normal, range, and color branches. The adapter
   fixture now asserts `aria-invalid="true"`, the exact
   `i1-description i1-error` chain, and that both real nodes exist. The app and
   registry Input implementations are identical.
9. **B9 frame divider rest leak — RESOLVED.** `ItemGroup` destructures and
   drops caller `data-dividers` before spreading the remaining frame attrs.
   The DOM regression proves the frame is null and the list remains `auto`.
10. **B10 narrow CSS specificity — RESOLVED.** All three formerly bare no-media
    narrow selectors are `:where()` wrapped in both copies. The source guard
    rejects a bare matrix `.jx-item` rule, and the focused test passes.
11. **B11 ItemField/tasks contract drift — RESOLVED.** The stale public
    `ItemField.disabled` row is removed; design §8 and task 3 now consistently
    say adapters own disabled forwarding. The task's policy wording now names
    getter-backed fields rather than the rejected `$state` holder.
12. **B12 adapter Reserved tables — RESOLVED.** Design §3 now reserves native
    `size` for Checkbox, Select, and Input as their Omit implementations do.
13. **B13 layout evidence — RESOLVED.** The policy fixture accepts live layout,
    rerenders from `standard` to `media`, and asserts both the group frame and
    an auto-layout row receive `data-layout="media"`.
14. **B14 list-item typecheck claim — RESOLVED.** The test helper is cast to the
    real Svelte `Snippet` type, and the exact reviewed paths have zero Svelte
    errors. The remaining workspace errors are outside this feature's paths.

### New findings

**None blocking.** The amended implementation now matches the public tables,
stamped-attribute laws, reactive time model, matrix, adapter ARIA/bindable
behavior, and install closure. No new contract drift was found in the final
diff.

### Residual notes

- Svelte still reports its existing warning that `aria-invalid` is unsupported
  on the implicit radio role. The design explicitly requires invalid-field
  state on the native radio, and this warning does not fail the suite; keep it
  as a documented compiler-warning exception or revisit only with an equivalent
  accessible implementation.
- The committed task text still describes browser keyboard walkthrough/SSR
  acceptance, but the reviewed test surface proves the DOM/ARIA and native
  bindings through Vitest rather than a dedicated five-control walkthrough.
  This is an evidence-quality note, not a demonstrated behavior defect; the
  requested runtime/build gates are green.
- `tasks.md` task 8 remains unchecked because this review artifact is not itself
  a task-file edit. The implementation is otherwise ready for the owner to
  close that box and archive the change.

### Final quality and archive call

| Contract area | Final assessment |
|---|---:|
| Typed policy and stamped resolution | 9.5/10 |
| Group DOM, labels, and divider ownership | 9.5/10 |
| End lane and 16+8 presence matrix | 9.7/10 |
| ItemField context and five adapters | 9.4/10 |
| Terminal paint and explicit chevron | 9.5/10 |
| Registry and isolated consumer closure | 9.5/10 |
| Tests, docs, and acceptance evidence | 8.8/10 |

**9.3 / 10 — ACCEPT for archiving.** Compared with the design-round ACCEPT
9.2, the implementation now has the accepted getter-backed policy law,
Svelte-correct Radio grouping, closed chrome stamps, childless divider DOM,
fully asserted 33-case matrix, isolated install proof, and synchronized public
tables. Compared with Round 2, all seven remediation blockers are closed and
the full 479-test suite is green. Archive the change after the owner closes
task 8; retain the Radio warning and browser/SSR walkthrough note as explicit
follow-up evidence rather than archive blockers.
