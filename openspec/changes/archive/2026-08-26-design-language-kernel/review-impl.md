# Implementation Review: design-language-kernel

Date: 2026-08-26  
Scope: `git diff 33c4210..HEAD` (`HEAD=240834f`)  
Decision: **BLOCK archive**  
Score: **4.5/10**

## Review boundary

This review covers the committed range only. The modified `apps/www/static/blueprints/*.svg`
files and untracked `openspec/changes/design-language-kernel/verification.md` are unrelated
working-tree state and are not treated as implementation evidence. The committed popover
change is reviewed because it is in the requested range; other dirty files are ignored.

The normative sources were `proposal.md`, `design.md`, `tasks.md`, `verification.md`, and
`review-design.md`, including the Round 4 **ACCEPT 9.4** record. The implementation was
checked in both canonical and generated trees.

## Blockers

### 1. The field lane loses the inherited hit minimum outside subgrid

`apps/www/src/lib/ui/list-item/item.css:190-197` defines the base `[data-slot='item-end']`
lane but omits `min-block-size: var(--jx-d-hit-min)`. The declaration exists only in the
subgrid block at `:544-552`. Therefore a standalone row, or a grouped row in an engine
without subgrid, does not receive the required inherited hit minimum. This directly violates
`design.md:143-157` and the component-authoring requirement that the floor is density-owned,
not a literal 44px.

Required fix: put `min-block-size: var(--jx-d-hit-min)` in the base field-lane selector (and
retain `min-width: 0`), leaving the subgrid rule as a compatible duplicate if needed. Add a
real-browser standalone/no-subgrid assertion at xs, default, and lg that reads the computed
minimum from the ItemEnd lane.

### 2. Truncation opt-in is not implemented

There is no `data-content-wrap` stamp and no `truncate` selector in either
`apps/www/src/lib/ui/list-item/item.css` or its mirror. `ItemContent` has no opt-in surface.
The required selector is explicit in `design.md:158-166`; without it, callers cannot request
ellipsis while ordinary metadata/action rows remain wrapping.

Required fix: add the component API/stamp (for example an ItemContent `wrap="truncate"`
option that emits `data-content-wrap="truncate"`) and the exact `min-width: 0`,
`overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap` rule. Add a focused
render test proving the stamp and a browser assertion proving plain content still wraps.

### 3. The breaking Density migration still exports the forbidden ItemSize alias

Both barrels export `ItemSize` at `apps/www/src/lib/ui/list-item/index.ts:4` and
`registry/files/ui/list-item/index.ts:4`. The approved contract is a breaking retype to
`Density` with no compatibility alias (`design.md:80-84, 175-186`). This keeps the old public
name alive even though the implementation has migrated its props.

Required fix: remove the alias from both barrels, update any remaining imports/usages, and
make `rg "ItemSize" apps/www registry` return no public API references. Re-run the registry
build and canonical/mirror parity check.

### 4. The changed ItemGroup module does not pass strict type checking

`apps/www/src/lib/ui/list-item/item-group.svelte:12` imports `Density` in the module script,
and `:32` imports it again in the instance script. `svelte-check` reports a duplicate
identifier; the byte-identical registry mirror has the same error. This violates the P3 gate
in `tasks.md:20-23`, regardless of the runtime Vitest result.

Required fix: use one type import in the appropriate script (or alias the second import), in
both trees, then run `npx svelte-check` with the changed-file errors reduced to zero.

### 5. The density blueprint has an introduced type error

`apps/www/src/lib/blueprints/scenes/density.svelte:11-12` iterates an untyped string array,
so `d` is inferred as `string` and cannot satisfy `ItemGroup.size?: Density`. This is a
changed-file `svelte-check` error, not one of the unrelated baseline diagnostics.

Required fix: type the tuple/array as `readonly Density[]` (or use `as const` with an
appropriate tuple annotation), and require the blueprint to pass `svelte-check` and the
site build.

### 6. The P6 narrow proof puts media under the wrong ruler

`apps/www/src/routes/docs/components/list-item.html/+page.svelte:405-412` renders
`ItemMedia` inside `<ItemGroup mode="plain" ...>` without
`ruler="media-content-end"`. The default ruler is deliberately media-less
(`design.md:93-101`), and the implementation comment explicitly says a media child is not
legal under `content-end`. This contradicts the P6 claim that media groups declare their
ruler and makes the Owner walkthrough demonstrate the forbidden topology.

Required fix: add `ruler="media-content-end"` to that group (or remove the media child), then
rerun the narrow browser walkthrough and add a negative fixture assertion that a
`content-end` group contains no media child.

### 7. The density gate does not verify the full Appendix A table

`scripts/verify-density-kernel.mjs:23-54,101-105` probes only nine keys per density:
text, line, inline/stack gap, inset, row minimum, hit minimum, media icon, and media image.
It omits the required `content-gap`, `secondary-text`, `secondary-leading`, and
`secondary-line` rows called out by `design.md:201-208`. Consequently the reported `49/49`
can pass while a required alias or equation is wrong.

Required fix: add all required derived/role aliases to the browser fixture and assert their
computed values for all four scopes, including the secondary leading constant and
`content-gap` floor. Keep the expected values derived from the normative table, not merely
presence checks.

### 8. The ruler gate does not cover both rulers or the negative topology law

`scripts/verify-item-ruler.mjs:135-145` checks only the media ruler's five-track count. It
does not assert the content-end ruler's three explicit tracks, zero implicit tracks, or
computed `column-gap: 0`; it also has no negative assertion that a content-end fixture
contains no media child. The design contract requires all of these (`design.md:210-218`),
so `14/14` is not a complete acceptance gate.

Required fix: add separate computed-style probes for both rulers (track count, implicit-track
absence, and column-gap on list, li, and row), and fail a fixture if a media child appears
under content-end. Preserve the mixed narrow auto/never and checkbox assertions.

### 9. The fallback matrix probe still emits the removed data-size authority

`scripts/verify-item-matrix.mjs:49-89` constructs its rows and lists with `data-size="default"`.
The CSS source guard only checks that selectors are absent, so the 33/33 result does not
verify the migration law that `data-size` dies everywhere (`design.md:175-186`). The stale
fixture can also mask a consumer that still depends on the old stamp.

Required fix: migrate the fixture to `data-density` (or omit the attribute where the static
fallback does not need a scope), add an explicit no-`data-size` DOM/source assertion, and
keep the 16-wide + 8-narrow computed matrix checks.

## Gate results

| Gate | Observed result | Review interpretation |
|---|---:|---|
| `openspec validate design-language-kernel --strict` | pass | Docs schema is valid. |
| `node scripts/gen-mirror-manifest.mjs --check` | pass | Manifest paths/hashes are current. |
| Theme, density, list-item, popover canonical/mirror parity | pass | Compared files are byte-identical. |
| `node scripts/verify-density-kernel.mjs` | 49/49 | Green, but incomplete per blocker 7. |
| `node scripts/verify-item-ruler.mjs` | 14/14 | Green, but incomplete per blocker 8. |
| `node scripts/verify-item-matrix.mjs` | 33/33 | Geometry passes; fixture is stale per blocker 9. |
| `node scripts/build-site.mjs` | 7/7 | Build and registry/LLM self-checks pass, with existing Svelte warnings. |
| Focused density/list-item/popover/icon-button Vitest | 26/26 | Relevant focused runtime tests pass. |
| `cd apps/www && npx vitest run` | 490/492 in this run | `composition-d` and `hover-stability` timed out at 5s. A rerun produced a different timeout count; 492/492 is not reproducible. |
| `npx svelte-check --output human` | fail, 267 total diagnostics | Many baseline diagnostics exist, but the duplicate `Density` import and density blueprint type error are changed-file failures. |

## Contract-area quality

| Contract area | Quality | Assessment |
|---|---:|---|
| Appendix A equations, four scopes, closed `--jx-d-*` aliases | 8/10 | Canonical theme contains the full block and mirror is byte-identical; the gate does not cover the secondary/content-gap portion. |
| `density.svelte.ts` policy surface | 7/10 | Symbol key, explicit/inherited/default resolution, stable getter-backed provider, and policy-only implementation are present; the surrounding changed tree is not type-clean. |
| ItemGroup provider, stamps, stripping, divider resolution | 7/10 | Provider composition, frame/list stamps, caller stamp stripping, ruler prop, and closed divider policy are implemented and focused-tested; duplicate imports and the invalid docs topology remain. |
| Item density resolution and leaves | 7/10 | Item root resolves explicit over inherited density and strips caller `data-density`; actual list-item leaf stamp coverage is not directly tested beyond the generic fixture. |
| Appendix B grouped subgrid | 8/10 | The CSS has explicit 3/5 tracks, `column-gap: 0`, two subgrid levels, fixed wide/narrow area templates, and `:where()`/layer framing. The content-end half is not independently gated. |
| Standalone/no-subgrid matrix | 7/10 | The 16 + 8 geometry path passes 33/33, but standalone hit-min is missing and the fixture still carries `data-size`. |
| Field lane | 3/10 | `wrap=never` is rendered by ItemField and grouped hit-min exists, but standalone hit-min and truncation opt-in are absent. |
| B=G balance and optical law | 6/10 | Theme aliases make inset equal seam in the row ruler; the bounded optical token is declared but not consumed by list-item geometry, and `inset`/`layout=media` behavior drifts from the documented surface. |
| §7 no-literal-branch law | 8/10 | The current source guard passes and component CSS uses aliases; its effectiveness is weakened by the stale matrix fixture and incomplete table probes. |
| Popover De Morgan fallback | 9/10 | `not(A and B and C and D)` is the correct equivalent of the intended joint capability test; both `inset-area` and `position-area` are reset, fallback margin is protected with `!important`, the build parses it, and canonical/registry CSS are byte-identical. |

## Non-blocking notes and residual drift

1. `ItemGroup` still documents inset as fixed `0.75rem` (`item-group.svelte:38` and the
   docs), while CSS uses `margin-inline: calc(3 * var(--jx-d-inline-gap))` at
   `item.css:309-312`; this is density-scaled and is 36px at default, not 12px.
2. The `layout="media"` docs promise a 3rem media square and wider gutters, but the grouped
   rules consume direct `--jx-d-*` aliases while the layout block only changes family
   variables at `item.css:247-254`; `--jx-item-media-size`, column gap, and media gutter are
   not effective in the grouped topology. Either preserve the documented posture or update
   the docs and contract deliberately.
3. `--jx-d-icon-optical-inline` is declared in Appendix A but no list-item selector consumes
   it; current flex centering is visually plausible, but the named bounded correction is not
   an executable law.
4. The full `svelte-check` run includes a large pre-existing baseline (267 diagnostics); the
   review isolates the changed duplicate import and density blueprint errors rather than
   treating every baseline error as a range regression.
5. `verification.md` is untracked and claims `492/492`, Owner screenshots, and a completed
   P0 evidence index. Those claims cannot satisfy this review until the file is committed,
   and automated screenshots never replace the required Owner visual acceptance.
6. Existing compiler warnings include the new popover captured-initial-`id` warning and the
   pre-existing radio accessibility warning. They do not invalidate the De Morgan rewrite,
   but should be cleaned in a later bounded change.

## Tasks boxes versus reality

- Tasks 1 and 2: the contract validation, manifest/registry edge, and committed probe files
  are present; the probes are executable.
- Task 3: the theme pair and parity are present, but “full table” evidence is not actually
  full and the recorded full-suite gate is false in this environment.
- Task 4: the density module and focused tests exist, but the required type-clean gate is
  false because of the duplicate `Density` import in ItemGroup.
- Task 5: the provider/ruler/matrix migration exists and focused tests are green, but the
  field-lane and truncation contracts are incomplete, the public alias remains, and the
  fallback fixture retains `data-size`.
- Task 6: both scripts return green, but their assertion lists are narrower than §8, so the
  box is procedurally green rather than contract-complete.
- Task 7: density/list-item proof scenes and docs were added and the site builds, but the
  narrow docs scene contains a media child under the default media-less ruler; Owner visual
  acceptance is not established by the commit.
- Task 8 remains unchecked, correctly. The implementation review is not ACCEPT and residuals
  have not been fixed, so archive must remain blocked.

## Archive decision

The implementation has a solid kernel shape and the core grouped geometry is close, but the
field-lane contract is not safe in the fallback topology, the explicit truncation API is
absent, the public breaking API still exposes a legacy alias, changed files fail type checks,
and the proof scripts omit required negative and secondary-token assertions. Fix blockers 1–9,
rerun the complete gate set (including a reproducible full suite), perform Owner visual
acceptance, and then request a new implementation review. **BLOCK archive.**

## Round 2

Scope: implementation commits `33c4210..e9c9062`, reviewed against the design-language-kernel packet and the committed tree at `e9c9062`. Dirty blueprint SVGs and untracked `verification.md` are out of scope. Any manifest generated during verification is excluded from commit-range judgment; its current hashes show the repair, but are not committed.

### Gates rerun

| Gate | Observed result | Verdict |
|---|---:|---|
| `cd apps/www && npx vitest run` | 40 files, 492/492 tests, 0 failures | PASS |
| `node scripts/verify-density-kernel.mjs` | 61/61 | PASS |
| `node scripts/verify-item-ruler.mjs` | 17/17 | PASS |
| `node scripts/verify-item-matrix.mjs` | 34/34 | PASS |
| `node scripts/build-site.mjs` | 7/7 build/self-check stages | PASS |
| `openspec validate design-language-kernel --strict` | pass | PASS |
| filtered `svelte-check` for changed density/list-item/docs files | no diagnostics | PASS |
| canonical/mirror theme pair | byte-identical | PASS |
| canonical/mirror density module | byte-identical | PASS |
| canonical/mirror list-item family | byte-identical | PASS |
| canonical/mirror popover CSS | byte-identical | PASS |
| `node scripts/gen-mirror-manifest.mjs --check` against committed HEAD | `committed manifest is stale` | BLOCK |

The full suite emits unrelated existing warnings, plus the known captured-initial-`id` warning in `popover.svelte`; neither changes the passing result or the De Morgan CSS assessment.

### Round 1 blockers

All nine Round 1 blockers are closed in the actual source and probes:

1. **B1 — PASS.** The BASE `[data-slot='item-end']` lane now carries `min-block-size: var(--jx-d-hit-min)` (`apps/www/src/lib/ui/list-item/item.css:190-201`), so standalone and fallback rows retain the inherited hit floor; the subgrid copy remains at `:566-567`.
2. **B2 — PASS.** `ItemContent` accepts only `wrap="truncate"`, stamps `data-content-wrap`, and the exact child rule supplies `min-width: 0`, `overflow: hidden`, `text-overflow: ellipsis`, and `white-space: nowrap` (`item-content.svelte:11-22`, `item.css:202-210`). Wrapping remains the default.
3. **B3 — PASS.** `ItemSize` is absent from `apps/www/src` and the registry barrels; `rg ItemSize src` returns no matches. The public migration is breaking as specified, with no compatibility alias.
4. **B4 — PASS.** The duplicate `Density` import in `ItemGroup` is gone; the module import is a single type import (`item-group.svelte:11-13`).
5. **B5 — PASS.** The density blueprint's density tuple is typed `as const`, preserving the literal density union without a widening diagnostic.
6. **B6 — PASS.** Every documented media-bearing group uses `ruler="media-content-end"`; no docs scene leaves media under the media-less `content-end` ruler.
7. **B7 — PASS.** The density probe checks the full Appendix A computed table: content-gap `2/2/4/4` and secondary roles `10/11/12/14` with the `1.5` leading relation. It passes `61/61` and the no-literal-branch scan remains clean.
8. **B8 — PASS.** The ruler probe covers both 5-track and 3-track rulers, `column-gap: 0` on list/li/item, all four narrow forms, and the negative media-under-content-end DOM law. It passes `17/17`.
9. **B9 — PASS.** The matrix fixture uses `data-density`, retains the wide and narrow standalone/fallback matrix, and asserts no `data-size` authority. It passes `34/34`.

### New blocker

1. **Committed mirror manifest is stale (P0 closeout blocker).** `apps/www/mirror-manifest.json` in `HEAD` still records pre-remediation hashes for `item-group.svelte`, `item-content.svelte`, `item.css`, and the list-item index. A regenerated local copy contains current hashes, but `node scripts/gen-mirror-manifest.mjs --check` fails against the committed tree. This violates task 8's “payload/manifest regen” gate and makes the archive record unreproducible. Fix: run `node scripts/gen-mirror-manifest.mjs`, review only expected manifest hash/timestamp changes, commit that manifest, and rerun the check plus parity gates. No source change is required.

### Contract-area quality

| Contract area | Quality | Assessment |
|---|---:|---|
| Appendix A equations, four scopes, closed aliases | 9/10 | Theme pair is verbatim and parity-clean; the 61-point probe covers the complete computed table. |
| `density.svelte.ts` policy surface | 9/10 | Policy-only, Symbol-keyed, getter-backed provider with explicit/inherited/default resolution; filtered type check is clean. |
| ItemGroup provider, stamps, stripping, divider policy | 9/10 | First provider, `ruler`, frame/list stamps, caller stamp stripping, and closed divider resolution are implemented and exercised. |
| Item density leaf resolution | 9/10 | Item resolves explicit over inherited density and stamps the resolved value while stripping caller authority. |
| Appendix B grouped subgrid | 9/10 | 3/5 explicit tracks, zero column gaps, two subgrid levels, fixed wide/narrow templates, and all four narrow forms are present and probed. |
| Standalone/fallback matrix | 9/10 | Wide 16 + narrow 8 geometry and no-`data-size` authority pass; the committed manifest is the only closeout failure. |
| Field lane | 9/10 | Base hit-min is inherited, `wrap="never"` is retained, and truncation is explicit opt-in. |
| B=G balance and optical law | 8/10 | Density aliases preserve the balance relation and the optical token remains bounded; the token is declared but not consumed by list-item geometry. |
| §7 no-literal-branch law | 8/10 | Density branching is absent from component CSS and the scanner passes; broad wording could still be clarified for unrelated letter-spacing literals. |
| Popover De Morgan fallback | 9/10 | `@supports not ((A) and (B) and (C) and (D))` is the correct joint-capability negation; both area properties reset, fallback margin is protected, and canonical/registry CSS match. |

### Non-blocking notes

1. `ItemGroup`'s `inset` comment/docs still describe fixed `0.75rem`, while CSS uses `calc(3 * var(--jx-d-inline-gap))`; at default density that is 36px. Align prose and implementation in a later bounded change.
2. `layout="media"` docs promise a 3rem media posture and wider gutters, but grouped selectors consume direct density aliases; the layout-family variables are not the effective geometry in the grouped topology. Either make that posture executable or revise the docs deliberately.
3. `--jx-d-icon-optical-inline` is declared by Appendix A but is not consumed by list-item geometry. This is a bounded-token follow-up, not a blocker for the current probes.
4. The broad §7 prose mentions dimension literals, while the current scanner intentionally targets density-owned properties and does not flag unrelated `letter-spacing` literals. Clarify the intended exception if this is meant to be universal.
5. Owner visual acceptance remains a separate human gate. The four screenshots are handoff evidence only; automated build/probe output does not substitute for that walkthrough.

### Tasks boxes versus reality

Tasks 1–7 are substantively complete and their listed implementation gates are green. Task 8 remains correctly unchecked: the combined suite and probes pass, but the committed payload manifest has not been regenerated, the Round 2 review record is only now being appended, and Owner visual acceptance is still a human gate. After committing the manifest update and recording Owner acceptance, task 8 can be checked and the change archived.

### Round 2 decision

The nine implementation blockers are remediated and the runtime/CSS proof surface is strong. The stale committed mirror manifest is a concrete, verifiable P0 closeout defect, so the archive decision remains **BLOCK** until the manifest is regenerated and committed. Round 2 score: **8.8/10**.

## Round 3

Scope: automated closeout of `5161010` (`chore(registry): mirror manifest regenerated post kernel remediation`) immediately after `e9c9062`. The unrelated dirty blueprint SVGs and untracked handoff files remain excluded.

### Closeout verification

| Check | Observed result | Verdict |
|---|---:|---|
| `git log --oneline -2` | `5161010` over `e9c9062` | PASS |
| `node scripts/gen-mirror-manifest.mjs` | wrote 88 items / 297 file pairs | PASS |
| immediate `node scripts/gen-mirror-manifest.mjs --check` | check GREEN | PASS |
| post-run manifest diff | no structural/hash diff; only intentional `generatedAt` volatility, restored for a clean tree | PASS |
| parity spot-check | theme, density, list-item CSS/provider, and popover CSS byte-identical | PASS |

The Round 2 blocker is closed: the committed manifest now contains the
post-remediation list-item hashes, and the generator/check path is semantically
idempotent. No source files changed after the Round 2 gate run, so its passing
full-suite, Chromium probes, build, strict OpenSpec validation, and filtered type
check remain the applicable implementation evidence.

### Final verdict

No new automated findings. The previous nine blockers remain PASS, and the sole
closeout blocker is resolved by `5161010`. The `tasks.md` task-8 checkbox is still
administratively unchecked in the worktree; its automated criteria are now met and
it can be checked as part of archive bookkeeping. The four Owner screenshots and
visual acceptance remain the standing human handoff in `verification.md`, not an
additional automated blocker for this review.

Round 3 score: **9.5/10**. Call: **ACCEPT archive**.
