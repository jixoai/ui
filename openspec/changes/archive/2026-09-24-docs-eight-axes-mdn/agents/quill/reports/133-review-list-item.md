# T133c — SECOND REVIEW list-item.html (quill)

**1st:** scribe 125, PASS 0M/2m/0L/1N, Tier 2 proposed (consolidated 2b06c0d5) — the
page carrying THE ADAPTER TAXONOMY RULING. Owner = marginalia. **2nd protocol:** her
report opened FIRST; landed items verified at DOM + source + gate layers; headline
receipts re-derived; fresh axis = the density-ladder token chains + the inset contract.
Fresh build exit 0 at HEAD 4ab37d41; probes on the dist via `vite preview`.

## Verdict: PASS — 0 M / 0 m / 1 L / 0 N — Tier 2 confirmed

## Landed items — verified

1. **MINOR 1 (the toc ≠ DOM) — LANDED**: +page.ts ships **all 16 entries** (the ten
   proof sections — standalone-ladder, group-modes, slot-topology, media-narrow,
   density-ladder, settings-section, size-contract, item-field-escape, selection-links,
   recipes — plus usage/types/accessibility/theming/universal-props/api) **in DOM
   order**; the served rail resolves 16/16 with zero missing and my order check passes
   (every rail index ascending). The tabs-T42 drift class is closed here.
2. **MINOR 2 (the family's nine) — ALL CLOSED**: ui/list-item family = **0 ERRORs** on
   the batch's ONE saved svelte-check (the item-end/item-actions/item-field inset
   plumbing, the item-divider cx, the item-input labelMode union, and the index.ts
   duplicate re-exports — gone). The trimmed index compiles clean: `ItemVariant`/
   `ItemTone` now export ONCE (from list-item-defaults), and the inset contract has its
   own exported type (`ItemEndInset = 'auto' | number | boolean`). Her OQ2 is settled in
   BOTH directions: the prop is DECLARED in ItemEnd's Props AND the runtime stamp machine
   exists (:45-49 — the data attr + the `--jx-item-end-inset` custom property).
3. **The taxonomy ruling — landed in the meta, the settings summary, and the sibling
   list's hero; ONE SEAT REMAINS**: list-item's meta serves "seven settings-row
   adapters" ✓; the settings-section summary teaches "the seven thin adapters:
   ItemToggle, ItemCheckbox, ItemRadio, ItemSelect, ItemInput, ItemSegmented,
   ItemStepper" ✓; **list's hero** teaches "ItemField + seven control adapters (…the
   list-item 1st review ruling)" ✓. **BUT the page's OWN hero pill still serves
   "ItemField + 5 adapters"** (byte-verified ×1 in the payload, :639) — the ruling's
   most visible seat is the one still stale.

## Headline receipts re-derived — concordant

- **The density ladder's token chains are live per rung**: the served computed
  custom properties carry the 4px-ruler equations verbatim — lg
  `calc(.8125rem + .125rem)` (=15px) with line ×1.6 (=24px) and row min
  `max(48, 40)`; default ×20/13 (=13/20, max(40,36)); sm −.0625 ×1.5 (=12/18,
  max(32,26)); xs −.125 ×16/11 (=11/16, max(28,24)) — her twelve-digit receipt,
  reproduced at the token layer. (Probe fault owned: my first census expected FOUR
  `[data-density]` scopes and caught NINE — the rung scopes NEST; the formulas, not the
  count, are the receipt.)
- **The adapters bind live**: a real click flips a bound ItemToggle (state before ≠
  after).
- **LAW #19**: zero duplicate ids across the fleet's largest proof surface (1.05MB
  served).

## Fresh axis — the inset contract's runtime seat

Her OQ2 left the inset question to the code round; my probe hunted a served seat: the
group-modes/size-contract sections render `ItemGroup inset` groups, and the family stamps
the contract via `data-jx-item-end-inset` + the custom property on ItemEnd. My margin
read was inconclusive (my group census caught sections and non-inset lists at 0px — the
inset margin may ride a nested wrapper my census missed). What IS settled: the prop is
DECLARED (typed), STAMPED (the machine in source), and the family compiles clean — the
typing/runtime divergence her review flagged is closed in source + gate. A pixel-level
inset receipt remains available to the next prober (find the ItemEnd node inside the
inset-labeled group and read `--jx-item-end-inset`).

## Gates (batch-shared)

| Gate | Result |
|---|---|
| svelte-check (ONE run, /tmp/t133-scheck.log, grepped) | list-item.html: **0 diagnostics** (:120 cx CLOSED, :1030 snippet split CLOSED); **ui/list-item family: 0 ERRORs** — the nine closed, exactly as the consolidation claimed; 24 standing warns |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once per batch) |
| LAW #19 | zero duplicate ids across 217+ ids |

## Probe faults owned (mine)

1. The density-ladder census expected 4 scopes and caught 9 (nested rung scopes) — the
   token FORMULAS were the receipt; my length assertion was not.
2. The inset margin hunt read sections and non-inset lists (0px everywhere) — the
   ItemEnd-scoped read is the instrument I ran out of road on; source + gate close the
   landed item regardless.
3. The seven-taxonomy in-page sample scoped to the h1's closest div — it caught the
   settings summary's "seven thin adapters" and missed the hero pill; the SSR payload
   grep settled the pill's stale state.

## Process

Port **5241** (batch preview seat): rc=1 before → fresh dist → after gates killed by
PID + wrapper → port **EMPTY** (0 lines), zero orphans. NO commits, NO product-tree
edits. Artifacts: /tmp/t133-li.mjs, li2, -ssr.html, batch logs.
