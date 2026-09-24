# TASK 33 — REVIEW popconfirm (marginalia, 2026-09-23; 1st of 2)

- **Reviewer**: marginalia (1st reviewer; reviewer #2 after — independence law: quill's report 24 read only AFTER my findings were fixed below; disclosed exposure noted in the cross-check)
- **Target**: quill's page integrated at `1e4aad06` — `popconfirm.html/+page.svelte` (576 lines) + `popconfirm.docs.ts`-less hand table + the family (`popconfirm.svelte/css`)
- **Method**: source reads (page, popconfirm.svelte/css, PressButton's popovertarget prop), live computed probes on real OPEN panels (TRANSITION-FRAME: 750ms settle past the 420ms kernel on every open), synthetic scope flips restored, SSR raw-byte parse + served-row enumeration, the popconfirm family + ambient solos, docs-universal, fleet svelte-check
- **VERDICT: PASS** — the dead-trigger fix verified end-to-end on all six rig panels; the axes receipts digit-exact; findings: 1 LOW (a measured-delta paraphrase) + adjudications on quill's open questions. Nothing blocks reviewer #2.

## The claims — verified TRUE

1. **The dead-trigger fix (explicit wire) — VERIFIED end-to-end.** Source: PressButton OWNS `popovertarget` as a first-class prop (press-button.svelte:404 declared, :446 default undefined, :707 forwarded) — a consumer's auto-wire `setAttribute` is clobbered on PressButton's re-render (the attribute re-applies from the undefined prop and drops). The family's auto-wire targets `button:not([popovertarget])` (:239) — so the explicit wire coexists with it. Measured: **all six rig panels open** on their trigger clicks (pc-ax-ambient/radius/elev/dark/density/placement), each panel `:popover-open` true, and the keep/Cancel click closes through the platform (**:popover-open true → false on all six**); the override's **keep button** (popovertarget="merge-pc" inside the panel) also closes it. The page documents the workaround at the exact break point (demo :359-361: the wrapper auto-wires the first PLAIN button; PressButton's own prop takes the explicit wire). Family design defect = W-next #5 (not judged here); the PAGE's documentation of the workaround is accurate and placed where the failure was.
2. **Siblings-not-carriers — VERIFIED in the served DOM.** The instance renders THREE siblings under the component root: the description `P` (unpainted), the anchor `SPAN` carrying **only** `anchor-name: --jx-pc-<id>` (no style stamp, no data-density), and the promoted `DIV.jx-pc.jx-surface[popover]` carrying **the entire stamp block** (`--jx-elevation-effective`, `--jx-radius-consumed`, carriers) + `position-anchor`. Sheet split: popconfirm.css references popover.css **zero** times (the D1-exempt residue reads its own consumption). The panel is self-carried; the anchor span is a pure anchoring handle.
3. **The measured axes — VERIFIED.**
   - **radius**: ambient OPEN panel **0px** with the auto concentric stamp verbatim; `radius="large"` OPEN panel **10px** with `--jx-radius-effective: var(--jx-radius-large)` + the EXPLICIT form stamped on the panel ✓ self-carried consumption.
   - **elevation**: ambient surface-body **oklch(0.96 0 0 / 0.72)** with stamp `--jx-elevation-effective: 3` → `elevation="level3"` **oklch(0.94 0 0 / 0.72)** with stamp **6** ✓ (the paired ladder-rung surface + the dp stamp both move).
   - **theme**: the dark panel's surface-body **oklch(0.185 0 0 / 0.72)** (the raw --popover chain flipped) while the title ink holds **frozen light black oklch(0 0 0)** ✓ — the honest low-contrast cost, taught as the mechanism's cost.
   - **density consumed TWICE**: the lg specimen's trigger measures **48px** (ambient 40) AND the OPEN panel's buttons measure **48px** (ambient 40) — the re-based --jx-hit inside the panel's rung scope reaches the panel's own controls ✓.
   - **TRANSITION-FRAME**: the open kernel computes ~0.42-0.46s-class transitions; every measurement taken at a 750ms settle ✓.
4. **a11y — VERIFIED**: **focus lands on Cancel on open, probe-true on all six rig panels** (document.activeElement === the Cancel button, every time).
5. **EXTRA served-first — VERIFIED.** Served api rows enumerated by name: **14 family rows** (title* · description · onconfirm · oncancel · confirmLabel · cancelLabel · confirmTone · placement · variant · id · content · actions · children* · class/rest as ONE row — title/children required ✓) + the shared universal 8 + the axes TokenTable. No silent fold; the page claims no false arithmetic.
6. **Chrome**: **toc 9/9 present, order == DOM** (byte positions monotonic); the stale `popconfirm-base` toc id **absent from the served bytes** (audited away, documented in +page.ts); h1 = 1; 7 tables / 179 cells / **0 empty**; **install/see-also id anchors present** ✓.

## quill's open questions — adjudicated

**(1) The composition-d fixture shipping the dead bare-popovertarget pattern unpinned — leaving it was RIGHT.** The fixture is a composition test of the family's auto-wire contract (first-plain-button wiring), which remains a real capability for plain buttons; the defect is specifically PressButton's claimed-prop clobber — a family/W-next-#5 concern, not a fixture concern. Pinning the page-side workaround into a fixture would freeze a pre-fix pattern at the fixture layer. Correct scope discipline; revisit the fixture only when W-next #5 lands the family fix.

**(2) The api-vs-curation fold — did not surface as a conflict.** The api serves the full-root interface as a hand table (14 rows, no meta — no curation file exists to fold); the universal directive folds only the 8 axis names into the shared section, and density's EXTRA-channel row sits in the root table by consumption right. If a future fold pulls density out of the root table, the consumed-axis row must re-appear in the axes table's measured seat — ledger the rule, no action now.

## Findings (severity-tagged)

1. **[LOW · measured-delta paraphrase]** The dark surface alpha measures **0.72** (`oklch(0.185 0 0 / 0.72)` — the same 72% alpha as the light surfaces), not the dispatch's "0.185/77%". The flip itself and the 0.185 hue-less dark are exact; only the alpha paraphrase differs. Recorded so reviewer #2 measures the box, not the summary.
2. **[INFO · adjudication record]** quill's open question 3 (the dark panel's frozen light-black title ink on the 0.185 surface — an honest low-contrast cost): teaching it as the mechanism's cost is the RIGHT call. The frozen ink IS the typed-pole law working; auto-flipping the ink would mask the mechanism and contradict the family's own emission forms. The page already discloses the cost in the theme row. Consumers needing contrast flip their own tokens.
3. **[INFO]** The title element renders at font-weight 400 — the "title" reads as body-plus, matching the compact-confirm posture (not a dialog heading). No action.
4. **[NONE]** otherwise — no MAJOR, no MINOR on the dispatched claims.

## Gates

| Gate | Result |
|---|---|
| popconfirm family solos (batch5-antd-components, composition-d, defaults-overlays, density-adoption-menus) + ambient | **331/331, exit 0** (ambient 284/284 included; quill's 47/47 four-file subset covered) |
| verify:docs-universal | exit 0 — GREEN 110/110 |
| svelte-check (fleet) | popconfirm page **0 diagnostics** (fleet 1595 — the shared tree's set) |
| Raw SSR | toc 9/9 order==DOM; h1 1; 0 empty / 179; stale popconfirm-base absent; install/see-also ids present |
| Live probes | six-panel open/focus/close sweep (focus-on-Cancel ×6, platform-close ×6); radius 0→10 + both stamp forms; elevation 3→6dp + 0.96→0.94; theme 0.185 flip + frozen ink; density twice (trigger 48, panel buttons 48); override keep-close |

## Process evidence

- Port **5244**: lsof **EMPTY before** (rc=1); my wrapper → vite; killed by PID at session end → **EMPTY after** (rc=1); background exit 143 = my SIGTERM.
- **NO commits, NO pushes, zero product-tree edits** (review-only). Siblings in flight (scribe's ghostty-term review, quill's file-input review, vellum's menubar CODE) untouched.
- Independence: my probes and findings were complete before reading quill's report 24; the cross-read reconciles (documented below).
- Artifacts: probes `/tmp/marginalia-33-probe{1..5}.mjs`; SSR `/tmp/marginalia-33-ssr.html`; gate logs `/tmp/marginalia-33-{pcspecs,universal,scheck,dev}.log`.
- Probe craft banked: data-reveal pages need a scroll-reveal pass before ANY selector work (the rig panels were absent from the DOM until scrolled); anchor popconfirm probes by the `popovertarget` VALUE (the panel ids), not guessed wrapper names; the surface fill paints on the inner `.jx-surface-body`, not the `[popover]` element (which stays transparent for the UA sheet).
