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
