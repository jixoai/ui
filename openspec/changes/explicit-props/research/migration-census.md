# Migration census — the W3 map (pinned 2026-09-21, main @ 4e7960b9)

> Source: the 2026-09-21 Explore census + design §13. This file is the batch
> map W3 executes against; refresh counts on drift.

## Totals

- 115 families under `apps/www/src/lib/ui/` (dirs; +8 loose site files);
  110 hand-written doc pages.
- ~60 `*-defaults.svelte.ts` files consume `densitySlot` today (72 defaults
  files total; the fleet law carries over verbatim — those files gain five
  sibling slots).
- Density channels consumed in 115 files (receipt command in proposal.md —
  the nine-channel explicit grep) — UNCHANGED by this change (kernel
  untouched).

## Batch A — native collision families (16, design §1 rule)

input, native-select, textarea, color-picker, range, checkbox, radio,
file-input, number-input, cascader, tags-input, input-otp, combobox,
input-group, date-picker, ghostty-term.
Duty: destructured prop wins; `{...rest}` keeps forwarding everything the
family does not own. `native-select` documents native `size={n}` for
multiple-rows mode — that stays a NATIVE attribute passthrough (family
documents the collision explicitly).

## Batch B — primitives (full eight axes + concentric receipts)

press-button, icon-button, chip, badge, badge-indicator, card, card-grid,
separator, kbd, link, text, heading, blockquote, avatar, icon, spin,
toggle, toggle-group, checkbox-adjacent primitives as they land in B rounds.

## Batch C — overlays/surfaces (elevation × surface ladder receipts)

dialog, sheet, popover, tooltip, hover-card, popconfirm, system-dialog,
dropdown-menu, menubar, navigation-menu, toast, scaffold-float,
float-button, glass, progressive-blur, terminal-card/header/footer.

## Batch D — long tail (the rest, ~15/round; families NOT already in A/B/C)

carousel, chart, code-card, color-utils, command, descriptions, empty,
figure, grid, hero-section, language-switcher, list, list-item, markdown,
math-block, math-inline, mermaid, pagination, pattern-* (cta/faq/hero-set/
login/pricing), progress, prose, prototype-* (flex/grid/kit/waterfall),
reference, result, scroll-area, scroll-run, scroll-virtual, section-card,
select, stack, statistic, steps, table, tabs, timeline, toc, token-table,
tour, transfer, tree-view, website-scaffold, props-table, a11y-table,
density-demo, docs infra loose files (docs-pager, docs-sections-nav,
search-palette).

> The canonical partition is `universal-props.inventory.json` (W0, task
> 0.7) — this section is the draft map; on conflict the inventory wins.

## The one-off prop mappings (design §13)

| family | today | action |
|---|---|---|
| avatar | `size: 'sm'\|'md'\|'lg'` | adopt universal size; alias md→medium |
| icon / spin | `size: number` | number lane verbatim |
| sheet | `size: <css width>` | RENAME → `width` (not the scale axis) |
| prose | `size: <css length>` | RENAME → `measure` |
| blockquote `ruleSize`, heading `level`, ghostty-term `fontSize` | keep | no collision |
| `Density` type + `data-density` stamp | keep spellings | re-exposed as aliases; docs vocabulary becomes small/medium/large |

## Page/batch coupling

W3 batch N lands together with its W4 doc-page edits for the same families
(one commit per batch; meta regeneration rides along).
