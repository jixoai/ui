# Implementation Review r8

Scope: the uncommitted Owner round-2 implementation, compared with `proposal.md`, `design.md`, and `tasks.md`. The unrelated `firstpaint` changes are not attributed to this round.

## A. Blockers

1. **Risk 1 / D2: the opt-out is not actually an element-and-subtree `all: revert`.** `registry/files/theme/jx-pure.css:1717-1719` applies `all: revert` only to a fixed list of descendant surface elements. The `.no-jx-pure` node itself is not reverted unless it happens to be one of those elements, and arbitrary descendants such as `span`/`div` are not reverted. This contradicts D2's explicit “元素自身+后代” contract and makes the documented `display`/layout rollback false for the common wrapper usage shown in the docs.

2. **Risk 2 / forced-colors: the default select is left custom-painted.** `registry/files/theme/jx-pure.css:1795-1803` still targets `select.jx-select`, even though D2 removed the opt-in requirement and the active rule is the bare `:where(.jx-pure) select` rule. Under forced colors, a normal single select therefore keeps `appearance:none` and its gradient background instead of restoring `appearance:auto`, violating the risk-list requirement.

3. **Risk 4 / RTL: scope-root RTL is missed.** `registry/files/theme/jx-pure.css:410-412` and `1119-1121` use `[dir='rtl'] .jx-pure ...`, which only matches when the `dir` element is an ancestor. A normal `<div dir="rtl" class="jx-pure">` does not match, so range fill direction stays LTR. The implementation has no RTL probe for range, switch travel, group slots, or label order.

4. **Risk 4 / D6 disabled contract: group state only watches disabled inputs.** `registry/files/theme/jx-pure.css:239-249` uses `:has(input:disabled)` for both hover suppression and opacity. The new group explicitly supports `select` and `textarea`, but disabled select/textarea groups do not receive the required disabled opacity/cursor state; the docs also provide no disabled group case.

## B. Quality / evidence gaps

5. **Risk 2:** no Firefox/WebKit screenshot or runtime evidence is present. The docs explicitly label those engines “unverified” (`+page.svelte:368-379`), while the risk list requires real cross-engine validation of `:has()`, range pseudos, and outline overflow. Chromium computed-style/bitmap probes are insufficient evidence for D1.

6. **Risk 5:** nested `.no-jx-pure`/`.jx-pure` and shadow-root boundaries are not probed. The existing probe only checks one button/input island (`scripts/verify-jx-pure.mjs:217-265`); it does not establish the specified nested-scope precedence or arbitrary wrapper rollback.

7. **Risk 6:** semantic token presence and auto-dark parity are covered, but there is no contrast audit under light, dark, and forced-colors, nor chart snapshot review. Passing token-resolution probes does not prove the required contrast/harmony.

8. **Risk 8:** `.jx-group` examples all add `aria-label` to the control (`+page.svelte:276-289`), so they do not exercise accessible-name composition or prefix/suffix announcement. No AT/keyboard walk-through evidence exists, despite that being an explicit risk requirement.

## C. Score

**5.5/10 — reject for Owner acceptance.** The main D1/D3/D4/D5 mechanisms are substantially implemented and the Chromium/projection gates are green (`verify-jx-pure` passes; Vitest 327/327; gzip 16,653B), but four contract-level gaps remain, including two directly observable forced-colors/RTL failures and an incomplete `.no-jx-pure` law. Fix blockers and add the missing boundary evidence before re-review.
