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
