# TASK 125 — list-item (docs page) — 1st eight-axes review (scribe) + THE ADAPTER TAXONOMY RULING

**VERDICT: PASS — 0 MAJOR / 2 MINOR / 0 LOW / 1 NIT — Tier 2 proposed.**
Owner = marginalia; independent 1st audit. Dist = 79d7adde (fresh build rc=0). Port 5243
mine; killed after probes, lsof post rc=1, no orphans. The page is the fleet's largest
proof surface (1,051,807 bytes served) and owns the control-adapters taxonomy — the ruling
the dispatch asked for is first.

## THE TAXONOMY RULING (settles list's T105 NIT-1 and this page's own pill)

**SEVEN control adapters — ItemToggle, ItemCheckbox, ItemRadio, ItemSelect, ItemInput,
ItemSegmented, ItemStepper.** `list-item/index.ts` exports exactly those seven plus
**ItemField, which is NOT an adapter** — it is the escape hatch the adapters compose
("the seven thin adapters are the settings page as one-liners… Each is ItemField + the
existing control", the page's own settings summary; the meta description agrees: "ItemField
+ seven settings-row adapters"). The count word "five" is STALE in two places:
- this page's hero pill: "ItemField + 5 adapters" (:638, served byte-verified) — against
  the same page's summary/meta saying seven;
- the sibling **list** page's hero (marginalia's T105 NIT-1) — the same stale word.
**Ruling for both pages: "ItemField + seven control adapters"** — the adapter set is the
seven control one-liners; ItemField is named separately, always, because it is the
composition primitive the adapters are made of, not a member of the set. Suggested
canonical sentence for both heroes: "ItemField + the seven control adapters (toggle,
checkbox, radio, select, input, segmented, stepper)".

## Findings

**MINOR 1 — the toc ≠ DOM: the rail lists 6 sections; the DOM carries 16 id-bearing
sections; the order contradicts.** Rail (served): types, usage, accessibility, theming,
universal-props, api. DOM sections NOT on the rail (ten): standalone-ladder, group-modes,
slot-topology, media-narrow, density-ladder, settings-section, size-contract,
item-field-escape, selection-links, recipes. AND the DOM renders **usage (:1241) BEFORE
types (:1252)** while the toc lists types first — the rail's own pair is order-inverted
against the page it names. The tabs-T42 drift class (an outline-era rail under a page that
grew ten proof sections). Fix shape: +page.ts ships all 16 in DOM order (labels: the
proof-section titles).

**MINOR 2 — the page-scoped gate is the batch's reddest: 2 page + 9 family diagnostics.**
Page: :120 the cx overload (the `?? {}` one-liner); :1030 the Snippet dual-copy identity
split (the T112 dialog cast shape — `icon={cpuGlyph as unknown as Snippet}`-class, here on
ItemStepper's icon payload). Family (9 errors): item-end :41, item-actions :46, item-field
:157 — three seats pass an `inset` prop the inner Props interfaces do not declare ("Did
you mean 'inert'?" — a real prop-plumbing gap, likely a missing interface member, not a
typo at the call sites); item-divider :27 the cx class; item-input :33 — Props extends
`Omit<ControlProps,'disabled'>` but re-declares `labelMode` with an incompatible union
('text'|'for' vs the control's 'stacked'|'floating' — the adapter's own vocabulary collides
with the imported control's); index.ts :4/:37 — **`ItemVariant`/`ItemTone` re-exported
TWICE** (the header comment block and the tail export line both declare them — duplicate
identifiers ×4). All typing-layer; the page runs. Fix shapes: the joiner one-liners; the
inset seats want the prop ADDED to the inner Props (the plumbing exists at runtime); the
index.ts duplicates want one of the two export statements dropped.

**NIT 1 — the hero pill count word** ("ItemField + 5 adapters"): the taxonomy ruling above
is the fix; recorded as this page's NIT and the shared ruling for list's hero.

## Verified-true (receipts against my armed suspicions)

- **The density ladder is DIGIT-EXACT at the token layer** — every number the summary
  names is a visible equation from the 4px ruler (computed custom properties on the rung
  scopes): lg text (.8125rem+.125rem)=15px, line ×1.6=24px, row min max(48,40)=**48**;
  default 13px/20px/max(40,36)=**40**; sm 12px/18px/max(32,26)=**32**; xs 11px/16px/
  max(28,24)=**28**. "text 11/12/13/15 on lines 16/18/20/24, rows 28/32/40/48" — all
  twelve digits reproduce.
- **data-item-chrome tells the truth**: all four chrome values live on rendered rows
  (surface / none / outline / muted) — the auto-resolution claim ("inspect it") holds.
- **The narrow law paints**: on the ≤30rem containers (measured ul widths 210/210/194px)
  the first row's children stack (content lane top 0, the end lane top 18px ON ITS OWN
  ROW) — the container-query fold, not a breakpoint.
- **The concentric chain engages** (probe note, see ownership): the radius-20 group's
  auto rows stamp the consumed calc VERBATIM
  (`--jx-radius-consumed: calc(max(0px, calc(var(--jx-radius-effective, 0px) -
  var(--jx-inset-effective, 0px))) * …)`) and resolve it — 20−0=**20px** painted, because
  the family supplies **--jx-inset-effective: 0px**: the subtraction is real but P=0, so
  the demo shows R following the frame without a visible step. The summary's claim is true
  as written; a seat with P>0 (an inset supply) would make the §3 subtraction observable.
- **Selection is visual-only**: the one `aria-selected` on the page is the ComponentCanvas
  file-tree's (another family's UI); the Item rows carry none — the selected demo row is an
  anchor with the consumer's `aria-current="page"` ✓.
- **The adapters bind live**: a real click on the ItemToggle flipped the bound readout
  ("fast on" → "fast off"); the ItemSegmented arrow-walk moved balanced→full on a real
  ArrowRight (native radio semantics, the group walks). LAW #18: the recipes/checkbox-group
  eaches key on unique step strings; the ladder demo eaches key rung names — clean.
- Structure: **LAW #19: 217 ids, zero duplicates** (the batch's largest page is clean); h1
  ×1; 0 undefined; hero summary is the CATALOG lookup (fail-loud) — served.

## Standard battery + gates

- SSR 200 (1,051,807 bytes) · verify:docs **rc=0** · docs-universal **110/110** · ONE
  saved svelte-check (MINOR 2's receipt; the new one-run rule observed — this was the
  batch's only run, saved to /tmp/g125-scheck.txt and greped per page/family).
- Probe-fault ownership: (1) my first "seven" byte-check was case-sensitive and false-negatived
  (the summary opens with capital "The") — the case-insensitive re-read is the receipt;
  (2) two refinement passes were mine, not the page's: the density rung rows wrap at the
  stage width (rect heights 80px — the computed token ladder is the receipt, not rects);
  the narrow pane's class is a stylex atom (`lsiMaxW19`), not the tailwind literal my first
  selector hunted; the concentric rows' first read took the group's `li` (0px) instead of
  the `.jx-item` face (20px) — the li is not the painted surface; (3) the bound-readout
  regex captured only the first segment on my first flip attempt — the full-line capture
  is the receipt.
- Artifacts: /tmp/g125-{tt,ib,ib2,li,li2,li3,li4,li5}.mjs + /tmp/g125-*.log (batch-shared).

## Open questions for the code round

1. The rail rebuild (MINOR 1) should also decide the ItemGroup API question: the page
   teaches group props (label/mode/ruler/inset/layout/dividers/density) in summaries only —
   the api table carries Item's five props; a Group table (or an explicit fold note) would
   complete the rendered-claim-surface discipline for the family's second root.
2. The `inset` prop plumbing (MINOR 2's family seats) is a runtime/typing divergence — if
   the prop WORKS at runtime but the Props interfaces lack it, consumers lose typing; if it
   does NOT work, ItemEnd's inset teaching (the size-contract section's inset vocabulary)
   is falsified. The code round should settle which.
3. The taxonomy ruling above is written for list's hero too — one count word there.
