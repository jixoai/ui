# TASK 31 — REVIEW file-input (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (1st reviewer; reviewer #2 = scribe or quill — independence law: vellum's task-25 report unread until my findings were fixed below)
- **Target**: vellum's page from task 25-B, integrated at `115f365b` — `file-input.html/+page.svelte` (755 lines) + `+page.ts` + `file-input.meta.ts` (no curation file — the hand table + generated-projection model)
- **Method**: source reads (svelte/stylex/css + the alias-seam knob block), live computed probes on the served page (seeded bindings, synthetic DataTransfer drops, a REAL filechooser event, a scope flip xs→sm, a `.dark` island wrap — all restored), SSR raw-byte parse, served-row enumeration, the family/ambient solos, docs-universal, fleet svelte-check grepped to the page
- **VERDICT: PASS** — the fleet's deepest density adoption re-measured digit-exact across all four rungs and six lanes; the theme split, the drag/accept/ARIA chain and the real-filechooser receipt all reproduce. Findings: 2 LOW + 2 INFO; nothing blocks reviewer #2.

## The claims, re-derived

### 1. Density via alias seams — VERIFIED, the full ladder
Source: the knob block (`file-input.stylex.ts:40-45`) aliases the closed contract — `--jx-file-h ← var(--jx-hit)`, `--jx-file-thumb/--jx-file-icon/--jx-file-zone-glyph ← var(--jx-icon)`, `--jx-file-text ← var(--jx-text)`, `--jx-file-zone-pad ← var(--jx-inset)` — and the zone's `minHeight: calc(var(--jx-file-h) * 2.25)` is the 2.25× lane. Measured (seeded binding + the theming rung stages):

| rung | zone minH | row minH | thumb box | name | label | zone-title |
|---|---|---|---|---|---|---|
| xs | **63px** | **28px** | **18px** | **11px** | **10px** | **11px** |
| sm | **72px** | **32px** | **20px** | **12px** | **11px** | **11px** |
| default | **90px** | **40px** | **22px** | **13px** | **12px** | **11px** |
| lg | **108px** | **48px** | **26px** | **15px** | **14px** | **11px** |

- Zone = hit × 2.25 exactly (28/32/40/48 → 63/72/90/108); thumb box = icon knob + the 2px hairline (16/18/20/24 → 18/20/22/26 — my first probe caught the inner img at 16/20/24; the box adds the hairline).
- **The zone-title 11px fixed anomaly HOLDS** — 11px at all four rungs (measured with the correct title element; the label ladder next to it moves 10/11/12/14). The page explains WHY (theming TokenTable: "the uppercase title rides the typed --text-label step — the one density-deaf voice, deliberately a label, not body copy") ✓.
- BREAKPOINT DISCIPLINE: the page's query case keys `md` = 48rem and cites 48rem correctly; no 40rem-class boundary error anywhere.

### 2. Theme: typed-frozen border+ground / raw-flip well sweep — VERIFIED
Emission forms grepped: the zone's border is `tokens['--jx-border']` (typed) and its ground `tokens['--jx-background']` (typed); the well sweep rides the raw sheet machines (`--shadow-well`/-hover — the F-1 fillable-surface law, named in the TokenTable). Measured across a `.dark` island wrap (medium: hydrated live page, island injected then removed): the zone's border stays **oklch(0 0 0)** and the ground **oklch(1 0 0)** (typed-frozen — while the raw `--border` underneath computes **oklch(1 0 0)**, flipped), and the sweep flips to the **white-inset dark shadow** (`rgba(255, 255, 255, 0.12) 1px 1px 0 0 inset` measured on the zone) — exactly the two-sided split the page teaches.

### 3. Drag/accept/ARIA end-to-end — VERIFIED (the chain re-run)
- **Synthetic drop on the GATE zone** (`accept="image/*"`; anchor: the dashed trigger BUTTON of the gated input — the plain "drop zone" button is a separate element and accepts everything, correctly): png + txt dropped → **shot.png binds as a `li.jx-file-row`** (size voice "7 B"), **notes.txt never enters the value**, **onreject fires** ([notes.txt] — the page's note renders "notes.txt").
- **The family error line renders**: `.jx-error` = **"!1 dropped file rejected — accept: image/*"** — and the trigger gains **`aria-describedby="…-error"`** pointing at exactly that element (before: null). txt rejection is value-honest and announced.
- **The REAL filechooser**: `page.waitForEvent('filechooser')` fires on the trigger click ✓.
- **ONE accessible control**: the native input is `tabindex="-1"` + `aria-hidden="true"` + multiple; the visible trigger button carries `aria-label="drop zone"` ✓.

### 4. Matrix re-pin — VERIFIED
docs-ambient-vocabulary solo: **284/284, exit 0** on my own run (the table[0]→table[1] shift + the size scope entry hold under the current tree; the earlier file-input/navigation-menu reds cleared with quill's landings).

### 5. Standard chrome + arithmetic — VERIFIED
- **toc 12/12 present, order == DOM; h1 = 1; universal marker ×1**; 7 tables / 167 cells / **0 empty**.
- **Served rows enumerated FIRST**: the api section serves **11 hand contract rows** (files, variant, accept, multiple, maxFiles, hint, label, error, disabled, onreject, zone) + the shared universal 8 + the 3-row FileItem table (file/id/previewUrl). **Meta = 23 keys** (22 + the quoted `'data-density'` safety-net twin). Arithmetic: 23 − 8 axes = 15 family seats; 11 served as rows; id/class/rest/'data-density' ride the wiring notes, the Usage capture line and the fleet conventions — the page claims no false arithmetic sentence, and every served row is curated-prose-backed.
- Supply-only greps: zero `--jx-size-effective/--jx-shape*/--jx-radius-effective/--jx-color-effective/--jx-elev*/--jx-motion*` reads in the family ✓ (the size row's §11-echo story is the contrast case).
- id anchors: **not flagged per instructions** — deferred to closure consolidation by design (the 33dda082 sweep excluded in-review pages).

## Findings (severity-tagged)

1. **[LOW · receipt precision — the error line's "!"/count spacing]** The rejection line's textContent concatenates to **"!1 dropped file rejected"** (no separator between the "!" mark and the count). The scaffold may space it visually via layout, but the accessible name reads "!!1"-adjacent — screen readers announce "!" and "1" fused. Fix: a space or the scaffold's gap made explicit ("! 1 dropped file rejected"). One-character class.
2. **[LOW · api completeness nuance]** The meta carries a public `id` prop (the label[for]/error[id] wiring) that the hand table does not serve as a row; the a11y table documents the wiring, but a consumer looking for the id knob won't find it in Props. Fix: one curated row (or a note in the api summary). Rides consolidation.
3. **[INFO · probe-craft]** The drop-gate chain needs the dashed TRIGGER BUTTON as the dispatch target (the gate's native input and its wrappers don't carry the handlers), and the code-sample drawers contain "rejected"/"notes.txt" strings — rejection receipts must exclude `<code>` subtrees or they false-positive.
4. **[INFO]** My first zone-ladder pass mis-read the thumb (inner img 16/20/24) and the zone (wrapper "auto") — the corrected hooks (thumb box = img parent; zone = the dashed element) reproduce the claimed 18/22/26 and 63/72/90/108 exactly. Recorded so reviewer #2 starts from the right elements.

## Gates

| Gate | Result |
|---|---|
| Family/affected solos (defaults-form-families, density-adoption-form-text, docs-ambient-vocabulary, docs-structure, hover-stability) | **330/330, exit 0** (ambient 284/284 included) |
| verify:docs-universal | exit 0 — GREEN 110/110 |
| svelte-check (fleet) | file-input page **0 diagnostics** (fleet 1597 errors — the shared tree's pre-existing set) |
| Raw SSR | toc 12/12 order==DOM; h1 1; marker 1; 0 empty / 167 |
| Live probes | the full 4-rung × 6-lane ladder; typed-frozen vs raw-flip split; drop/bind/reject/onreject/error-line/describedby; real filechooser; one-accessible-control |

## Process evidence

- Port **5244**: lsof **EMPTY before** (rc=1); my wrapper → vite; killed by PID at session end → **EMPTY after** (rc=1); background exit 143 = my SIGTERM.
- **NO commits, NO pushes, zero product-tree edits** (review-only). Siblings in flight (quill's popconfirm, scribe's badge-indicator review, vellum's combobox review) untouched; no keyed noise encountered.
- Independence: vellum's task-25 report deliberately UNREAD — my findings above were fixed from source + probes first; the cross-check follows this report in time. Disclosure: the combined `25-card-grid-fix-and-file-input.md` passed through context during task 29 (card-grid scope); the file-input claims were still re-derived independently here, and this review adds three deltas vellum's report does not record (the "!"+count concatenation, the meta 23-vs-22 recount with the 'data-density' twin, the thumb-box-vs-img measurement distinction).
- Cross-check result (post-filing read): vellum's Part B numbers reconcile digit-exact with mine (zone 63/72/90/108; rows 28/40/48; thumbs 18/22/26; names 11/13/15; labels 10/11/12/14; zone-title 11px; the drop/accept/reject chain and the real filechooser). Her "22 meta rows" vs my 23 = the quoted `'data-density'` safety-net twin; her thumbs "18/22/26 (icon + the 2px hairline)" is the same box I measured after the img/thumb-box correction. No conflicts.
- Artifacts: probes `/tmp/marginalia-31-probe{1..18}.mjs` (the drop-chain iterations document the target-resolution: dashed TRIGGER BUTTON, not the input wrappers); SSR `/tmp/marginalia-31-ssr.html`; gate logs `/tmp/marginalia-31-{fispecs,universal,scheck,dev}.log`.
