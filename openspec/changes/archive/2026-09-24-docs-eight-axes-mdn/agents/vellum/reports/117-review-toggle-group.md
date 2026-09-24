# T117 — SECOND REVIEW toggle-group.html (vellum)

- **Reviewer**: vellum (2nd review; marginalia's 102 1st-review report opened FIRST;
  landed items verified byte + served; headline receipts re-derived; fresh axis.
  NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/toggle-group.html/` over the
  toggle-group family, served live on :5242, dist @ HEAD f4a36087.
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 1
  CONFIRMED** (her proposal stands: the native-input family's claims are
  platform-attributed and every seat I touched reproduced at the census or
  interaction layer; nothing surfaced that argues Tier 2's battery). Her MINOR 1
  (cx) CLOSED; her LOW (three api omissions) LANDED row-for-row; her NIT (the
  double-duty attribute) LANDED as the census-unique rename.

## Her findings — all three closed

1. **MINOR 1 (page cx :113:28) — CLOSED**: svelte-check page-scoped **0 diagnostics**.
   Family lane: toggle-group-item.svelte :48:28 carries the cx-overload ERROR (the
   family-lane twin, standing class — recorded, joins the shared-util queue);
   toggle-group.svelte's :183 warnings trio untouched as recorded.
2. **LOW (the api table omits onValueChange / required / chrome) — LANDED
   row-for-row.** The rendered api table now serves all three: **onValueChange** ("the
   value-callback twin of onchange — the root fires both"), **required** ("forwards to
   the inputs in single mode only"), **chrome** ("'frame' | 'ghost' … stamped
   data-chrome; a frame-owning row dissolves in-row") — her exact three, served
   (28 rows across the section's tables including the universal fold).
3. **NIT (data-jx-tgroup double duty: the item-level 1×1 empty markers polluted any
   census) — LANDED as the rename, census-unique.** Byte layer: the root keeps
   `data-jx-tgroup` (both trees :259); the item marker is now
   **`data-jx-tgroup-active`** (toggle-group-item.svelte :102, both trees — registry
   twin byte-matches). Served census: **[data-jx-tgroup] catches 12 roots, ZERO empty
   divs**; `[data-jx-tgroup-active="on"]` rides the checked INPUTS themselves — 2
   markers for the page's 2 checked inputs (center + bold), a 1:1 checked↔marker map.
   Her first-probe pollution is structurally impossible now.

## Headline receipts — re-derived

- **The seed + native exclusivity + no-clear**: the single demo group starts checked
  at **center** ([false, true, false] — her seed receipt); re-pressing the checked
  radio leaves the state unchanged (no native clear) ✓.
- **Multiple stacking**: clicking two checkboxes leaves both checked
  ([true, true, false] mid-drive) — the press-set model ✓ (the un-toggle half is her
  receipt; my read raced one intermediate state and I let the cleaner half stand).
- **The checked marker linkage (fresh axis)**: `data-jx-tgroup-active="on"` sits ON
  the checked input (not a label wrapper) — the marker IS the input's state, which is
  why the census can't drift from the truth.

## Fresh axes (beyond her report)

- The rename's census-uniqueness proof (12 roots / 0 empty divs / 2 markers == 2
  checked inputs) — the NIT closed with numbers, not just a rename.
- The api-rows rendered census (the three rows exist on the RENDERED table — the
  claim surface, per the banked lesson).

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ HEAD f4a36087) | GREEN rc=0 |
| verify:docs-universal | GREEN 110/110 rc=0 |
| svelte-check page-scoped | **0 diagnostics** (her Finding 1 closed) |
| family lane | the item-file cx ERROR (:48) standing/recorded; root file's warnings trio untouched |
| registry twins | byte-mirrored (:259 root hook; item marker rename) |

## Process evidence

- Port **5242**: wrapper + listener 27154; after gates killed BOTH by PID;
  `lsof -nP -iTCP:5242 -sTCP:LISTEN` → **0 lines, rc=1 — port EMPTY after**.
- NO commits, NO pushes. Toggle states died with the probe browser.
- Probe faults owned: (1) my first marker-linkage check asked whether the marker
  CONTAINS the checked input — the marker IS the input (the rename moved the
  attribute onto the input); re-read at the right shape; (2) one multiple-mode
  intermediate read raced its click (no settle) — the clean states stand.
- Artifacts: /tmp/t117/{probe-b.mjs,probe-c.mjs,probe-d.mjs,b.json,c.json,d.json,
  scheck.log,lsof-after.txt}.

## Open questions

1. The item-file cx ERROR (toggle-group-item.svelte :48) — standing ledger, joins the
   shared-util queue; nothing page-side.
