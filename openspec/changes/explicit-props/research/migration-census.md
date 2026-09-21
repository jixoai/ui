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

LANDED (6bb88ae0, + the pulled-forward 4.3 PropsTable shared section;
probe-w3a-universal-props 14/14; orchestrator gates re-run green —
mirror 756 pairs, tailwindless 2·7·7 unmoved, meta/context/deps,
`Type Errors: no errors`). Axis-surface outcomes, census-recorded:
`native-select` carries SEVEN prop lanes — the native `size` rows
passthrough owns the prop name (the ruling above); the size lane
forwards ambient (no own opinion, supply chain intact via inheritance).
`ghostty-term` carries SEVEN prop lanes — its `theme` prop is the
terminal shell-theme OBJECT (shadows the axis name; NOT a §13 rename
family, no rename without an Owner ruling) and `fontSize` keeps per §13;
the theme lane forwards ambient. `input-group` keeps its r11
eager-capture legacy provider, narrowed at the legacy edge for the
auto/number/query lanes. meta.universal stays UNIVERSAL_AXES verbatim
per the frozen §17.1 merge rule — per-family honesty rides the props
rows + live demos, never the shared section.

## Batch B — primitives (full eight axes + concentric receipts)

press-button, icon-button, chip, badge, badge-indicator, card, card-grid,
separator, kbd, link, text, heading, blockquote, avatar, icon, spin,
toggle, toggle-group, checkbox-adjacent primitives as they land in B rounds.

LANDED (4a96996f; probe-w3b-concentric 18/18 — §3's expression stamped +
computed 6px under card 20/0.875rem inset, squircle ×2 live + factor-1
degrade branch, IACVT 0px fallback, named step via the alias ladder var;
orchestrator gates re-run green — mirror 761 pairs, tailwindless 2·7·7
unmoved, meta/context/deps 16+3, `Type Errors: no errors`, suite EXACTLY
the 87/2782 standing baseline, zero delta both directions). Axis-surface
outcomes, census-recorded:
- `chip` + `badge` carry SEVEN lanes each — their family-local `shape`
  (`'square' | 'pill'`, the silhouette/corner-law vocabulary) owns the prop
  name and `pill` is outside ShapeLane; NOT a §13-ruled rename family, so
  the axis is left out (forwarding ambient) rather than renamed — FLAGGED
  for the W6 Owner dossier as an open refinement (a future rename ruling
  could adopt the axis).
- `icon` / `spin` carry seven lanes + the size NUMBER lane verbatim (§13's
  ruling — explicit px numbers stamp the size carrier; named/auto stay
  unadopted on glyphs per each family's recorded no-ambient-size law).
- `avatar` adopts the size axis with the sm/md/lg → small/medium/large
  alias table (`AvatarSizeInput`; the DENSITY_NAMED_ALIASES precedent).
- Out-of-scope rest-forwarding consumers that broke on the widened prop
  unions got minimal mirrored Omits forced by the family need
  (button-group-divider, system-dialog-action) — batch C/D do their full
  surfaces.
- heading's local `size` em-ladder const renamed `sizeLadder` (the
  local-yields-to-axis precedent); text's 8 Raw sugars retyped to
  `ComponentProps<typeof Text>`.

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
