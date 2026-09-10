# Tasks

## 1. API + ladder

- [x] 1.1 ItemEnd: `fit?: 'md'|'lg'|'full'` prop, `data-fit` stamp (the `data-size` first draft was caught by the kernel source guard — renamed),
      size+wrap=never runtime guard (family throw precedent)
- [x] 1.2 item.css: the size contract block — `--jx-item-end-w` ladder
      (md 10/7/full, lg 16/11/full), 44rem step-down, lane-level sizing
- [x] 1.3 ItemField: `fit` prop → conditional wrap + stamp
- [x] 1.4 five adapters: `fit` passthrough to ItemField
- [x] 1.5 index.ts exports ItemEndFit

## 2. Narrow fold (subgrid preserved)

- [x] 2.1 subgrid 30rem branch: fold `[data-fit]` lanes per ruler
      (content-end + media-content-end), areas-only, subgrid columns kept
- [x] 2.2 folded lanes: `--jx-item-end-w: 100%` + flex-fill contract + start alignment

## 3. Proof surface + tests

- [x] 3.1 prototype fusion.svelte swaps to the real fit API
- [x] 3.2 test/list-item-size-contract.spec.ts — stamps ×3 rungs,
      conflict guard throws, adapter forwarding, field relaxation, flex fill source-pinned
- [x] 3.3 targeted vitest (list-item specs + new spec) green
- [x] 3.4 mirror sync + manifest (self-consistent worktree) + verify:deps

## 4. B5 control integration (same change)

- [x] 4.1 ItemGroup controlChrome prop — opt-in, muted/plain forced self
- [x] 4.2 ItemField controlChrome default integrated + data-control-chrome stamp
- [x] 4.3 item.css integration law — dissolve bg/border/well-shadow(+hover),
      state machine re-asserts, real tags hook, InputGroup excluded
- [x] 4.4 test/list-item-control-chrome.spec.ts — stamp matrix + source pins
- [x] 4.5 prototype private dissolve block retired (family owns the law)

## 5. B6 cluster boundary (list-item half)

- [x] 5.1 prototype Action rows: joined ButtonGroups (3-btn, 2-btn+icon)
- [x] 5.2 list-item-end-cluster.spec.ts — verbatim children + sheet pins
- [x] 5.3 boundary recorded: group-side radius policy = button-group's own
