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

LANDED (09d64fb0; probe-w3c-elevation 17/17 — the M3 two-layer recipe +
the PAIRED surface rung through the §12 var indirection at light AND
dark (dark STEPS the rung, `background-image: none`, zero color-mix),
level-1's inset wall + `--surface-concave`, the number lane dp verbatim,
and the PORTAL ROOT self-carried (a nested `radius="auto"` computes
20−14=6px through the portal); orchestrator gates re-run green — mirror
764 pairs, tailwindless 2·7·7 unmoved, meta/context/deps 16+3,
`Type Errors: no errors`, suite 85F/2785P vs the 87/2782 standing set —
failures DOWN 2, zero new deterministic). Outcomes, census-recorded:
- Own-elevation mapping (historic z-feel → level table): dialog/sheet
  **level4** (8dp, M3's dialog rung); system-dialog/float-button/toast
  **level3** (6dp, the snackbar/FAB rung); popover/dropdown-menu/
  hover-card/popconfirm/menubar-panel/navigation-menu **level2** (3dp,
  M3's menu rung); tooltip **level1**; scaffold-float/progressive-blur/
  terminal-card/header/footer carry NONE (placement chrome / flat
  subtractive veil / their own documented 6px hard-offset law — the
  explicit lane still steps the table).
- The number lane between rungs SNAPS DOWN (never rounds up to a deeper
  shadow than asked) — the batch's §14-consistent decision.
- `sheet`'s §13 rename landed name-wide (`size`→`width`; the freed
  `size` is now the scale axis) — task 3.5 half-done, `prose`
  size→measure rides batch D.
- Deviations: `terminal-card` + `terminal-header` carry SEVEN lanes —
  their `theme` is the shell-theme LITERAL (own-before-ambient,
  dark-locked regardless of the tree — not the axis' ambient-first law);
  §13 rules no rename → axis left out, W6-dossier-flagged beside
  ghostty-term. `terminal-footer` carries theme whole. `glass` is the
  material LIB (builders + law sheet, NO component root — no prop
  surface to adopt; the axes ride its consumers): an exemption-ledger
  candidate for W4's 4.6 drift gate per §17's gate-visible-delta law.
- KERNEL PATTERN NOTE (batches D+): `provideQueryAnchor` TDZes when a
  watcher forces eager resolution — it must sit AFTER the anchor state
  declarations (relocated in all 13 affected files).

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

LANDED D1 (3e8c38ec; probe-w3d1-spot 10/10 — code-card size=18 carrier +
computed 18px, ItemGroup radius=20 → auto row computes through the §3
expression, named steps via the ladder vars, zero inline px; orchestrator
gates re-run green — mirror 772 pairs, tailwindless 2·7·7 unmoved,
meta/context/deps 16+3, `Type Errors: no errors`, suite 86F/2784P ≈ the
standing set, family battery EXACTLY its baseline). Outcomes,
census-recorded:
- **code-card** carries SEVEN lanes — the shiki `theme` literal owns the
  name ('light'/'dark' are legal shiki themes: a genuinely colliding
  value space); §13 rules no rename → axis left out (carriers stamp
  `{...d, theme: undefined}`), W6-dossier-flagged beside the
  terminal/ghostty twins.
- **color-utils** is the SECOND rootless lib (registry:lib pure TS, no
  component — the glass precedent): exemption-ledger candidate for 4.6.
- **chart**: the `size` prop splits — the NUMBER lane feeds the
  pre-existing donut-diameter literal (the icon/spin §13 law applied by
  analogy — the prop's number semantics are load-bearing), while the
  ensemble ROOT carries the size axis whole (named steps); census-recorded
  as an analogy-extension, dossier-noted.
- **command** carries own elevation **level4** (the modal rung — batch
  C's dialog law).
- **THE PROVIDER-SNAPSHOT KERNEL LAW** (D1's finding, swept fleet-wide by
  2b28536c): wherever a family has the REACTIVE bridged
  `provideDensity(() => …)`, `density` must NOT ride the
  `provideUniversalLanes` object literal — the literal SNAPSOTS the prop
  at init and freezes the explicit lane over the bridge. Six latent
  violators (markdown, dropdown-menu, popconfirm, input-group, menubar,
  navigation-menu — every one's comment already stated the law while its
  code didn't) fixed beside D1's original three; all batches' briefs and
  the 5.1 lint must encode this law.
- list-item joined the §3 concentric chain (item.css swapped to the
  consumed-radius form); markdown's founding law (the root never stamps
  a rung for the PRESET — only an explicit lane does) rides the bridge
  alone now.

LANDED D2 (45aeb6ff; probe-w3d2-spot 13/13 — progress size=18 carrier +
computed, ScrollArea radius 20 → auto Card computes 6px, prose's rename
live; orchestrator gates re-run green — mirror 782 pairs, tailwindless
2·7·7 unmoved, meta/context/deps 16+3, `Type Errors: no errors`, suite
EXACTLY 86/2784 the standing set). Outcomes, census-recorded:
- **prose's §13 rename landed name-wide** (`size`→`measure`; the css
  channel keeps `--jx-ty-size`, the `--jx-sheet-size` precedent; the
  carriers JOIN `hostStyle` first so `measure` stays cascade-sovereign
  over the axis font-size) — task 3.5 CLOSES with it.
- **mermaid** carries SEVEN lanes — the `theme` engine-token literal
  owns the name ('system' has no engine meaning); axis left out,
  W6-dossier-flagged (the shiki/shell-theme family).
- **scroll-area** carries SEVEN lanes + the radius NUMBER lane riding
  BOTH (px feeds the thumb chrome literal AND the exact-px axis carrier
  — the region becomes the concentric anchor): the chart split-lane
  §13-analogy, dossier-noted beside it.
- **pattern-hero-set** is the NO-ROOT form: the canonical main supplies
  seven lanes through CONTEXT only (the bezel theme pin owns the name —
  a pre-existing passthrough exemption); the ascii/marquee siblings own
  roots and stamp all eight.
- **prototype-kit**: the canvas root only; the frame half (iframe
  documents) documented outside the supply set.
- The consumer-merge law, spec-pinned via prototype-layout: carriers
  JOIN the consumer's `style` attr — never replace it.

LANDED D3 (c6959e78; probe-w3d3-spot 14/14 — statistic size-18,
section-card radius 20 → auto Card 6px, select's PORTAL (trigger +
promoted panel both self-carried, §7 pair resolving, Escape closes),
table's named step via the ladder var; orchestrator gates re-run green —
mirror 789 pairs, tailwindless 2·7·7 unmoved, meta/context/deps 16+3,
`Type Errors: no errors`, suite EXACTLY 86/2784 the standing set).
**ZERO deviations — the first batch landed entirely on existing
rulings.** Structural records: scroll-run is the second NO-ROOT
fragment dialect (context-only supply); scroll-virtual forwards to the
composed ScrollArea (radius NUMBER lane only — the chart analogy's
third instance; named radius cannot cross ScrollArea's
`number | 'full'` edge); select + tour carry own elevation **level2**
with the portal law (trigger AND promoted panel stamp); table + tabs
encode the provider-snapshot law verbatim; toc/transfer/tree-view/
stack first-time no-own. Receipt-authoring law (D3's §7 lesson): assert
the DECLARATION in the style attr + a non-empty computed recipe — never
the computed value of an unregistered custom property (it substitutes
vars).

## The one-off prop mappings (design §13)

## W3 CLOSE — the fleet completeness receipt (D4's sweep, orchestrator-verified)

LANDED D4 (a946d336; probe-w3d4-spot 11/11 — palette ⌘K portal
self-carried at `--jx-elevation-effective: 8`, density-demo dogfoods the
explicit lane, props-table's own surface minimal-additive with its 3
specs + live pages green; gates re-run green — mirror 789, 2·7·7,
16+3, `Type Errors: no errors`, suite EXACTLY 86/2784). The seven
D4 items all first-time no-own; search-palette composes batch C's Dialog
(portal law via composition); siteOnly families carry NO metas (the
generator's registry-item intersection never sees them — recorded, not
forced).

**The sweep's finding — 13 holes the batch map never listed** (the
census sketch's own gap; the inventory wins by its own rule;
orchestrator re-verified: dirs exist, machinery files = 0, all 13 in
the 115): accordion, alert, anchor, boot-splash, breadcrumb,
button-group (deferred from B, never landed), component-canvas,
highlight-detect-default, image, inline-code, native-scroll-area,
skeleton, theme-toggle. → **D5 (the hole round) is prescribed: all 13.**
component-canvas migrates HERE (W3 keeps the clean every-family
boundary; W4's 4.2 then wires its controls on the migrated surface).
highlight-detect-default gets the rootless check (the color-utils
precedent). The classification vocabulary for 5.1's lint:
surface · siteOnly · context-only (icon-button, scroll-run,
pattern-hero-set) · engine-wrapper (scroll-virtual) · rootless-lib
(glass; color-utils sits OUTSIDE the dir inventory) — single-class,
no double-count (the sweep's 116 was icon-button counted twice).

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
