# T123 — SECOND REVIEW dialog.html (vellum)

- **Reviewer**: vellum (2nd review; BOTH prior reports opened FIRST — marginalia's 85
  NEEDS-WORK and scribe's 112 CODE-round disposition; every finding's landed
  disposition verified at byte + served layers; headline receipts re-derived on real
  keys/clicks; fresh axis run. NO commits, NO pushes; zero product-tree edits).
- **Target**: `apps/www/src/routes/docs/components/dialog.html/` over the dialog
  family, served live on :5242, dist @ HEAD **79d7adde** (the dispatch's floor rev,
  built this session — note which: exactly 79d7adde).
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT.** **Tier ruling: Tier 2** (per
  dispatch; her archetype-completion tier is now EARNED — overview/law, the axes
  table, the query() seat, install/see-also all serve and measure). Every 85 finding
  carries a landed, verified disposition; the code round's adjudications respected.

## The NEEDS-WORK set — disposition verified finding-by-finding

1. **MAJOR 1 (the modal focus trap leaks) — LANDED as the bounded truth, re-derived
   press-for-press.** All four seats corrected (Basic summary :534 "with ONE measured
   exception: every second Tab reaches the page's skip link … the next press returns —
   W-next #17"; the law paragraph :468; the workbench canvas description :485; the
   a11y row :910 "WITH A MEASURED LEAK … two independent runs"). My live triad on the
   workbench dialog (real Tabs, per-press containment, one `dialog[open]` throughout):

   | press | activeElement | inside dialog | openCount |
   |---|---|---|---|
   | 1 | "Close" | yes | 1 |
   | 2 | **"Skip to content docs"** | **NO** | 1 |
   | 3 | (in-dialog button) | yes | 1 |
   | 4 | "Close" | yes | 1 |

   Escape → dialogsOpen 0, **focus restored to "Open dialog"** ✓. The served DOM and
   the taught contract are now the same shape. His missed-sixth-seat catch is verified
   at the byte layer (the Basic summary was the one seat still teaching the absolute).
2. **MINOR 2 (elevation stamped-not-painted) — LANDED + re-verified.** The 8-row axes
   table's elevation row (:381) teaches "STAMPED, NOT PAINTED (measured — W-next #18)
   … Exact dp snaps DOWN to the enclosing table rung (6dp IS level3)". Served re-derive
   on the level4 seat: root style carries **`--jx-elevation-shadow:
   var(--jx-elevation-level4-shadow)` + the level4-surface rung** while boxShadow,
   filter, backdrop-filter, background-image and the shadow child ALL compute **none**
   — stamped, not painted, at the served layer.
3. **MINOR 3 (scrim row stale) — LANDED**: the TokenTable serves "**black 32% / white
   10%**" with the real hsl values AND the stage-pin caveat; served ::backdrop
   computes **rgba(0, 0, 0, 0.32)** ✓.
4. **MINOR 4 (page gate red + toc ≠ DOM) — LANDED and SUPERSEDED**: page svelte-check
   **0 diagnostics** (:278/:352 closed); the rail is **14/14, zero dangling**
   (overview → … → composition, DOM order — his exact list).

## The Tier-2 completion — verified served

- **#overview** (the law section) mounted; **DocsInstall**(:427) + **DocsSeeAlso**(:974)
  seats render their markers (data-doc-install / data-doc-see-also live; the install
  copy carries `npx jixoai-ui add dialog`).
- **The eight axes table** ("The eight axes on dialog", :918) serves with the grep-
  receipted classifications.
- **HIS ADJUDICATION RESPECTED**: dialog is deliberately NOT staged into
  scripts/docs-skeleton-scope.json — Usage renders after the six demo canvases, so
  scope membership would hard-fail `usage < examples` (the toast-red class); the
  reorder is the Owner's. verify:docs stays rc=0 with dialog warning-only in backlog —
  confirmed this pass. I file no finding against the adjudication.

## Headline receipts — re-derived

- **The query() seat, static**: at 1200w the root stamps `--jx-radius-effective:
  20px` → dialog **20px**, the radius="auto" PressButton child **6px** = max(0, 20−14)
  ✓ (his digit-exact receipt; the × close button deliberately NOT read as the
  concentric seat, per his open-question 2).
- **The width law**: fresh opens compute **416px @1200, 416px @500, 368px @400** =
  min(92vw, 26rem) — her three-viewport receipt re-derived (plus the 500 point).
- **LAW #19**: 107 ids, zero duplicates (his 106 + reveal-state delta; the law holds).

## Fresh axis — the query() seat under LIVE resize (his battery was reopen-at-width)

With the query dialog held OPEN, resizing the viewport across the 48rem key:
- 1200 → 500 **while open**: the stamp re-evaluates **live** — `--jx-radius-effective:
  8px`, dialog 8px, auto child **0px** (the clamp) — no reopen needed;
- 500 → 1200 **while open**: back to **20px / 20px / 6px** — reversible;
- the reopen-at-500 control reads the same **8px / 8px / 0px** — the live channel
  equals the instructed path.

The concentric law moves WITH the query through re-layout, one rung stronger than the
page's own "and reopen" instruction. (Honest instrument note: on the same live-resize
pass the dialog's computed **width** read 500px — off the min() law — while the radius
updated; fresh opens at 500 read the law-true 416px. No page claim covers
resize-while-open; the width row is verified on the standard path. Noted for the
fleet's instrument ledger, not filed.)

## Gates

| Gate | Result |
|---|---|
| verify:docs (dist @ 79d7adde) | **GREEN rc=0** (staged scope green; dialog warning-only backlog — the adjudication holding) |
| verify:docs-universal | **GREEN 110/110 rc=0** |
| svelte-check (ONE saved run) | **page 0 diagnostics; family 0 ERRORS** (the four closed seats hold; the :229 warnings octet recorded, untouched); registry twins 0 errors |
| fixture note | ONE dialog-named ERROR exists in **test/fixtures/context-coverage/root/registry/files/ui/dialog/dialog.svelte** :17:47 — the context-coverage fixture's OWN sandbox copy (variant typing), not the product tree or the mirrored registry; fixture-lane ledger, flagged for that fixture's owner |

## Process evidence

- Port **5242**: wrapper (/tmp/t123-wrapper.pid) + listener 67023; lsof-empty before
  (0 lines); after gates killed BOTH by PID; `lsof -nP -iTCP:5242 -sTCP:LISTEN` →
  **0 lines, rc=1 — port EMPTY after**. Siblings 5241/5243/5244/5230 untouched.
- NO commits, NO pushes. All dialog opens/closes via real clicks and real keys; the
  dark injection was not needed this pass (the scrim/stage-pin receipt is byte+serve
  from her round).
- Probe faults owned: (1) my first query-seat locator keyed hasText /open/i — the
  trigger's label is "radius · query()" (source :950); (2) my first elevation loop
  opened universal seats until the style carried level4 — the found-by-stamp form is
  the receipt (66 buttons in the section); (3) the live-resize width anomaly —
  instrumented honestly as an observation rather than smoothed over.
- Artifacts: /tmp/t123/{probe-dialog.mjs,probe-query.mjs,probe-width.mjs,dialog.json,
  gate-docs.log,gate-universal.log,scheck.log,lsof-after.txt}.

## Open questions

1. W-next #17 (the scaffold-side skip-link repair) and W-next #18 (wire-or-retire the
   elevation reader) remain the Owner's ledger items — this pass verifies the taught
   truth at every seat, not the repairs.
2. The context-coverage fixture's stale dialog copy (:17:47) — fixture-lane, its
   owner's queue.
3. The × close button computing the dialog's full radius (his open-question 2) —
   confirmed unchanged; no served text claims otherwise; noted for the next prober.
