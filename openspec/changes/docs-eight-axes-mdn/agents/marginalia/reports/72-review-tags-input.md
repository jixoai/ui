# TASK 72 — SECOND REVIEW tags-input.html (marginalia, 2026-09-22)

- **Reviewer**: marginalia (2nd of 2; independence law held — scribe's report 66 and
  vellum's report 43 were opened only AFTER the findings below were fixed by my own
  source reads + live probes; concordance addendum appended after filing)
- **Target**: vellum's page — `apps/www/src/routes/docs/components/tags-input.html/`
  (+page.svelte 676 lines) over the tags-input family
  `apps/www/src/lib/ui/tags-input/` (svelte 613 / stylex 147 / css / defaults),
  served live on :5244 with mirrors byte-identical (cmp across 5 files).
- **Method**: source reads (family svelte/stylex, tokens.stylex alias chains), headless
  Chromium over dev SSR :5244 with warm-reload discipline (consecutive SSR fetches
  hash-identical), REAL-input mutation drives (protocol fill + real-clipboard paste via
  grantPermissions + Meta+V after a synthetic ClipboardEvent silently no-oped), an
  activedescendant walk, the two-read protocol on the --jx-muted chip chain (element
  paint vs html-level var, light / root-dark / scoped-island / restored), density digits
  at 1440 and 600, SSR payload parse, the three gates.
- **VERDICT: PASS** — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT new. The dispatched adjudication
  resolved with a record correction in BOTH directions: the alias chain is the :root
  family and is LIVE under root dark (the fleet line's "tags-input FLIP" slot
  CONFIRMED — my own first single-chip falsify was a stage pin, retracted mid-task when
  the concordance reads contradicted it), the stage-pin tier is newly receipted, and
  the mutation census plus the full combobox contract verified on real input.

## THE ADJUDICATION: --jx-muted under root dark — the fleet law gets its correct form (record correction, three-tier model)

The dispatch expected the slot-block class. Neither slot-block nor the "root-pinned =
frozen" model survived the probe arc — my first two-read sampled only the FIRST chip and
read HOLD (falsifying the expected FLIP); the concordance reads then contradicted my
receipt (scribe 66 #5 and vellum 43 both measured a root-dark chip FLIP), which forced a
decisive third probe: a full-chip census under root html.dark plus an ANCESTOR WALK to
find where the var pins. The truth splits:

| context | chip computed backgroundColor census (all 22 chips) |
|---|---|
| light baseline | 22/22 oklch(0.9551 0 0) |
| **root html.dark** | **14 FLIP to oklch(0.2178 0 0) — 8 HOLD 0.9551** |
| restored | 22/22 back to 0.9551 |

The ancestor walk finds the pin site on every holding chip: a demo-stage `div` carrying
**`data-theme="light"`** whose computed `--jx-muted` re-voices to 0.9551 while its parent
reads 0.2178 — the canvas-stage theme-attribution chrome pinning the token family for
its demos (the same seam family as table's color-surface class). The 14 flipping chips
sit outside any such stage. Declaring-rule receipt: the alias is declared at
**`:root, .xbpgcew { --jx-muted: var(--muted) … }`** (inside
`@layer components.stylex.priority1`) — the :root alias family, and it is **LIVE**: a
custom-property var() reference on :root re-substitutes when html.dark flips `--muted`,
and the recomputed value inherits to every unpinned descendant.

So the correct three-tier model, measured on this page:

1. **Root-level html.dark FLIPS the alias chain** (live re-substitution at :root) —
   scribe 66 #5 and vellum 43's chip-flip receipts STAND; my probe4 first-chip HOLD was
   a stage pin, retracted. The fleet line's "tags-input FLIP" slot is CONFIRMED.
2. **A mid-tree `.dark` island CANNOT flip alias consumers** (probe4: island div.dark
   re-derives site `--muted` but the chip's `--jx-muted` substitutes at :root above the
   island — chip HELD) — concordant with scribe's and vellum's island receipts.
3. **`data-theme="light"` demo stages locally PIN the family** — the 8 holds, including
   every "frozen" sample of mine.

**Fleet implication (cross-task flag for the orchestrator):** the same model predicts
that separator's and spin's root-dark HOLDs (task 61/65, including my task-65
"fleet-wide frozen, no carve-out" correction) may equally be `data-theme` stage pins —
their samples were canvas-stage demos. Both slots should be re-adjudicated with the
ancestor-walk pin-finder before the fleet record freezes again. My task-65 correction is
withdrawn in favor of re-measurement; tabs/system-dialog's FLIP slots are consistent
with the live-alias model. The var-vs-paint read-site law stands unchanged (the
html-level flip vs paint split is visible in every table above); what changes is the
MECHANISM story: frozen-unless-pinned, not frozen-by-:root.

Chain classification per the dispatch: **:root alias family (`--jx-muted: var(--muted)`),
live under root dark, island-proof, stage-pinnable** — not slot-block, and not frozen.
No page defect — this is the campaign record correction the dispatch sent me to earn.

## The mutation census — VERIFIED on real input, zero console errors

- **Enter +1**: 2 chips → 3, chip text = the typed query.
- **Duplicate submit +0** with the flash: submitting "marginalia" twice left the chip
  list unchanged, and during the window the existing chip carried `jx-tags-flash` +
  `tagsStyles.chipFlash` (source :503 gates it on `tag.value === flashValue`); gone
  after 350ms (the ≤300ms window + margin).
- **Backspace-on-empty −1**: 3 → 2, the last removable tag deleted (source :419-424,
  `Backspace && query === ''` → removeAt).
- **Paste +2**: real clipboard ("node, marginalia" comma-split) grew the global option
  census 23 → 25 across instances. My first synthetic ClipboardEvent drive SILENTLY
  no-oped — the receipt only counts after the real-clipboard drive (instrument honesty;
  same law as task 63's selectOption).
- Zero console errors/warnings across every session including the full walk.

## The combobox announcement contract — VERIFIED live

- **Suggestions**: typing "r" resolves `aria-activedescendant` → `s2-sug-0`
  ("typescript", role=option, 3 options in the popover listbox).
- **Enter submits the highlight**: the activedescendant chip ("typescript") joined the
  tags — not the raw query text.
- **Chips are options in the horizontal listbox**: the shell is role=listbox
  aria-orientation=horizontal (source :491-493); every chip is role=option
  aria-selected=true (source :497-498), live census confirms.
- **Chip × announces "remove X"**: aria-labels read ["remove svelte", "remove node",
  "remove marginalia", "remove typescript", …] (source :511).
- **Error wiring**: the error demo input carries aria-describedby → `s11-error` whose
  target renders "!at least one label is required", with aria-invalid=true.
- **Composite key law**: `{#each tags as tag, index (\`${tag.value}#${index}\`)}` at
  :495 — unique by construction (duplicates are rejected pre-insert, and the index
  suffix carries remove/re-add reorder). LAW #18 clean, zero console key warnings.

## Density seats with BOTH digits — VERIFIED digit-exact

The query seat (label "stack — responsive", `density={query({ md: 'large' }, 'small')}`):

| viewport | wrapper data-density | shell min-height (--jx-hit) | input height |
|---|---|---|---|
| 1440 | **"lg"** | **48px** | **46px** |
| 600 | **"sm"** | **32px** | **30px** |

The 2px border pair holds on both rungs (48/46, 32/30), digit-exact per the dispatch.
The rung stamps on the `.jx-field` WRAPPER (source :460; panel :560) while the shell
paints via `minBlockSize: 'var(--jx-hit)'` (stylex :42/:87/:133) — my first probe read
data-density on the shell and got null: read-site note, not a defect. Ambient default
shells measure 40px/38px — the md rung, same pair shape. Size rejects query by type
(`number | string`, no QueryResult — the family's own hybrid); the seat rides density,
per the lanes-vs-passthroughs boundary.

## Drift #13 — confirmed as billed (latent)

Suggestion rows key by value alone: `{#each filtered as suggestion, index
(suggestion.value)}` at :583. Latent as billed: suggestions derive from the committed
tag set (duplicates cannot re-enter — the +0 guard), so colliding keys have no live
reproduction surface on this page. Ledger item stands for the family owner; nothing
owed on the page.

## Standard battery

- **SSR**: warm-reload consecutive fetches hash-identical (no module-counter drift on
  this family); h1 ×1; universal marker ×1; 0 undefined/null literals. The earlier
  byte-census oddities `id=""` ×6 and `id="true"` ×2 DECODED as grep substring
  artifacts — tails of `data-no-subgrid=""` (demo-cell chrome) and
  `aria-invalid="true"`; the live DOM carries 101 ids, zero empty, zero "true", zero
  twins. **LAW #19 clean.**
- **Keyed-each**: tags keyed composite (:495), suggestions keyed value (:583, drift
  #13 as above), zero key warnings.
- **Vocabulary-grep**: zero `jxoai` misspellings in family or page.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284, rc=0** |
| verify:docs-universal | **GREEN 110/110** (110 markers) |
| svelte-check (fleet) | **tags-input.html: 0 diagnostics** (both page files). Family lane, pre-existing unchanged files: tags-input.svelte 8× state_referenced_locally at :250 (the provideUniversalLanes kernel pattern — density/size/shape/radius/color/theme/elevation/motion), 2 ERRORs (:205 `chrome` not on Props; :219 Object.entries undefined-overload) + 1 in `src/lib/blueprints/scenes/tags-input.svelte` :18 (same overload shape) — the family owner's standing debt, same class as table's :80/:213 receipt |

## Process evidence

- Port **5244**: lsof LISTEN before probes (node 15831, wrapper 15777); killed BOTH by
  PID after gates; `lsof -nP -iTCP:5244 -sTCP:LISTEN` → **empty, rc=1** after.
- **NO commits, NO pushes; zero product-tree edits** (git status shows only the
  siblings' in-flight transfer.html pair; zero diff in tags-input family or page).
- Independence: scribe 66 and vellum 43 unopened until after this report was filed.
- Instrument honesty: (1) synthetic ClipboardEvent paste no-oped silently — replaced
  with real-clipboard grantPermissions + Meta+V; (2) first flash/wiring drive keyed on
  the wrong `[data-jx-tags-input]` selector — the family shell is `.jx-tags-shell`;
  (3) the data-density read needed the wrapper, not the shell; (4) the two id oddities
  were my own grep substring artifacts — decoded and retracted before they could
  become a phantom finding; (5) **the adjudication itself**: my first two-read sampled
  only the first chip (a stage-pinned one) and produced a high-confidence WRONG falsify
  of the dispatched FLIP — the concordance reads caught the contradiction and the
  ancestor-walk probe settled it. Single-sample theme probes are not adjudications;
  the fleet line was right and my first correction was wrong.
- Artifacts: /tmp/marginalia-72-probe{1,2,3,4,5,6,7}.mjs, /tmp/marginalia-72-ssr.html,
  /tmp/marginalia-72-{ambient,universal,scheck}.log, /tmp/marginalia-72-pgid.txt.

## Open questions

1. **The fleet record — separator and spin HOLD slots need re-adjudication** with the
   ancestor-walk pin-finder: their root-dark holds (tasks 61/65, incl. my own task-65
   correction) may be `data-theme="light"` stage pins rather than :root freezing. The
   instrument is in /tmp/marginalia-72-probe6/7.mjs — census all instances + walk to
   the pin site; a HOLD that lacks a pinning ancestor falsifies the live-alias model
   and restores the frozen family law.
2. **Family ERROR trio** (:205/:219/:blueprints-18): real type errors in the family
   lane, pre-existing, zero page impact — for the W-next ledger with the family owner.

---

## Concordance addendum (appended after reading scribe's report 66 and vellum's report 43)

My findings above were fixed before this section — including one mid-task retraction it
triggered (the adjudication arc is told honestly in the body).

- **FULL CONCORDANCE with scribe 66 on every overlapping receipt**: the composite chip
  keys and the four-route mutation census (Enter +1 / duplicate +0-with-flash /
  Backspace-on-empty −1 / paste +2, zero console noise, page interactive throughout);
  the combobox contract (expanded, autocomplete=list, activedescendant into real row
  ids, Enter commits the HIGHLIGHT, × announces "remove X", chips as options in the
  horizontal listbox); the error wiring (invalid + describedby → rendered error id);
  density lg↔sm with BOTH digits (her lane equation 48/32 = 0.25rem×12/×8 and my
  computed min-heights 48/32 + input 46/30 = hit − 2px — the same 2px-border-pair
  precision note); drift #13 latent as billed (her one-word composite-key hardening
  named for the family owner = vellum's OQ1); toc/LAW #19 (her 101 ids, zero dupes ==
  my live census exactly); ambient 284/284, universal 110/110, page 0 diagnostics; the
  same family-error trio receipt (Object.entries overload, chrome-not-on-Props, the
  kernel warns at :250).
- **Vellum 43 concords** on the taxonomy (SELF-STAMP root .jx-field carrying
  data-density + class:dark), the mutation census shape, the combobox battery, the
  toc-10 restructure, and the alias chain's light/island numbers.
- **THE DISCORDANCE THAT MADE THE TASK — resolved in scribe's and vellum's favor**:
  her 66 #5 ("at root-level html.dark the chip flipped to 0.2178") and vellum 43
  ("root-level html.dark re-derived the alias — chip background flipped") both recorded
  the FLIP my first probe denied. Their receipt was RIGHT: 14 of 22 chips flip; my
  first sample was one of the 8 stage-pinned chips. The three-tier model in the body is
  the synthesis their data and mine jointly force — live at root, island-proof,
  stage-pinnable — and it RETIRES the "root-pinned = frozen at :root substitution"
  mechanism story my task-65 record used.
- **The dispatch's slot-block expectation is also retired**: the declaring rule
  (`:root, .xbpgcew { --jx-muted: var(--muted) }`) is the :root alias family, not a
  scoped theme block; the class that matters mid-tree is the data-theme stage pin, not
  a theme-block declaration.
- **Additions (mine, not in 66/43)**: the full-chip census under root dark (8/14
  split) and the ancestor-walk pin-finder (the instrument that locates the
  `data-theme="light"` pin site — reusable for the separator/spin re-adjudication);
  the declaring-rule receipt at the CSS layer (styleSheets + adoptedStyleSheets scan);
  the wrapper-vs-shell density stamp site (:460/:560 vs the --jx-hit paint); the real
  inputs the id-oddity grep artifacts (aria-invalid="true" / data-no-subgrid=""
  tails — the live DOM has 101 clean ids); and the SILENT synthetic-clipboard no-op
  receipt.
