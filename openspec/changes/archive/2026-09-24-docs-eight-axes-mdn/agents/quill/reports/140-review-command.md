# T140b — SECOND REVIEW command.html (quill)

**1st:** vellum 127, PASS 0M/2m/0L/0N, Tier 2 proposed — her MINOR-1 (select-close) was
REVISED by her own CODE micro (132): the family is CORRECT; the defect was the
site-layer ⌘K collision. Owner = marginalia. **2nd protocol:** her reports opened FIRST;
the landed state verified with BOTH drives on real keys + the api-row note; fresh axis =
the filter/active jump. Fresh build exit 0 at HEAD 8044b180; probes on the dist via
`vite preview`.

## Verdict: PASS — 0 M / 0 m / 0 L / 0 N — Tier 2 confirmed

## Landed items — verified (real keys, both drives)

1. **DRIVE A — the trigger path (collision isolated out)**: "open palette" → type
   "open tokens" → ArrowDown → Enter → the item runs (the output reads "open tokens")
   AND **paletteOpen FALSE** — the select-close chain works end to end on the served
   default config. Her 132 ground truth (shut() runs; the early-return was the dialog's
   own close event) confirmed from the outside.
2. **DRIVE B — the ⌘K collision, live**: Meta+K opens **BOTH** (`paletteOpen` true AND
   the site "Search the docs" dialog open — both window handlers fire on one keypress);
   Enter runs "deploy site" and **closes the palette**; **the site search persists** —
   exactly what the landed api row teaches, measured as served behavior.
3. **The api row's collision note serves in the payload** ("the key is shared… both
   handlers fire… the site search stays until dismissed") — the documentation arm
   landed and SSRs.
4. **MINOR 2 (the cx class) — CLOSED**: command.html **0 diagnostics**; the
   ui/command family **0 ERRORs** (her five family seats gone — the consolidation
   reached the whole family).

## Headline receipts re-derived — concordant

- **The ARIA chain on real keys**: filter "open" → exactly **3 visible matches**
  ("Open the registry", "Open tokens", "Open GitHub") with the **active pointer on the
  FIRST VISIBLE** — via BOTH instruments (dialog-scoped `aria-selected="true"` AND the
  input's `aria-activedescendant` target agree).
- **The empty state paints** ("no matches…") on `zzzz` and recovers on re-filter.
- **toc == rail 6/6**; LAW #19 clean; T94 zero pseudo pairs.

## Fresh axis — the filter/active RE-JUMP

Her battery walked one filter's walk-set; mine jumps filters: narrowing "open" →
"open g" **re-filters to 1 match AND the active pointer RE-JUMPS to the new first
visible** ("Open GitHub") — the active-pointer tracking survives a filter transition,
not just an initial mount. (Probe fault owned: my first active read matched the canvas
file-tree's `aria-selected` OUTSIDE the dialog — the dialog-scoped instrument is the
honest one, the same per-step-verification shape her probe faults taught.)

## Gates (batch-shared)

| Gate | Result |
|---|---|
| svelte-check (ONE run, /tmp/t140-scheck.log, grepped) | command.html: **0 diagnostics** (:138 cx CLOSED); ui/command family: **0 ERRORs** (her five family cx seats CLOSED), 7 standing warns |
| verify:docs | **rc=0 — fully green** |
| verify:docs-universal | GREEN 110/110 (once per batch) |
| Mirror law | the command family = HEAD (her 132 receipt: the family was never wrong; nothing to re-cmp) |
| T94 | zero pseudo-class pairs |

## Probe faults owned (mine)

1. The active-pointer read matched the CANVAS file-tree's `aria-selected` node
   (out-of-dialog) — the dialog-scoped `[role=option]` enumeration plus the
   `aria-activedescendant` cross-check is the instrument.
2. Drive A's first run pressed Enter while the filter box held my typed text but the
   active pointer hadn't settled — the 300→600ms staged waits are the settled drive.

## Process

Port **5241** (batch preview seat): rc=1 before → fresh dist → after gates killed by
PID + wrapper → port **EMPTY** (0 lines), zero orphans. NO commits, NO product-tree
edits. Artifacts: /tmp/t140-cmd.mjs, cmd2, -ssr.html, batch logs.
