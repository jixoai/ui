# T131 — FIRST REVIEW select (marginalia, 2026-09-24)

- **Target**: `apps/www/src/routes/docs/components/select.html/` (page 517 + ts 17)
  over the family: select.svelte 546, css 121, stylex 120, defaults 72, barrel 6.
  **Registry twins: all 5 files cmp-identical.** Vintage: HEAD 2b06c0d5; fresh build
  (dist 02:33).
- **VERDICT: PASS — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. Tier 2 proposed.** The whole
  listbox contract measured TRUE end-to-end; zero findings.

## Verified TRUE with digits (my own instruments)

1. **Open/close, the platform's own** — click opens the panel
   (`:popover-open` true, aria-expanded "true"); **focus moves INTO the list**
   (activeElement = UL.jx-sel-list — the APG listbox-in-popover law); on open the
   highlight continues from context (activedescendant `s2-opt-0` on the selected
   "node" row). Escape closes it and **focus returns to the trigger** — the
   restitution law (:349) measured on the Escape path, the Enter path AND the
   row-click path (all three close paths exercised, all three restored).
2. **The roving highlight** — End jumps to **"deno"** (index 2) SKIPPING the disabled
   "wasi" (index 3); **no wrap** (a further ↓ stays on deno — clamped, per the APG
   note); Home returns to "node"; Enter commits + closes; a row click commits "deno"
   and closes. aria-activedescendant tracked `{id}-opt-{index}` at every step;
   aria-selected and the data-jx-sel-active/selected/disabled hooks rode along.
3. **↑/↓ on the closed trigger OPENS the panel** (native muscle memory, :383-388) —
   measured true.
4. **The error wiring** — two invalid triggers on the page; describedby resolves to
   `s11-error` whose text is "!plan is required" (the jx-error line); aria-invalid
   "true" on the trigger.
5. **RTL geometry, measured physically** — under `dir="rtl"` the selected row's
   `border-inline-start` is **2px oklch(0.6489 0.237 33)** with computed
   borderLeftWidth **0px** and borderRightWidth **2px**: the logical edge flipped to
   the physical right with no physical property anywhere. The logical-properties
   claim is exact.
6. **The portal carriers (batch C law, live)** — the universal seat stamps
   data-density **"sm"** on the .jx-field AND on the PORTALED panel while it is open
   in the top layer, whose inline style carries
   `--jx-size-effective: 18px; --jx-density-coefficient: 1; --jx-elevation-effective:
   3; --jx-radius-consumed: calc(max(0…` — the self-carried supply across the
   promotion, exactly as the page teaches. The §7 elevation own-level2 and the §3
   radius consumption calc are both on the panel's style.
7. **The faceless form bridge** — 12 `jx-form-field` elements on the page, computed
   display **contents**, aria-hidden — no box, no paint.
8. **The native-first split** — the page's NativeSelect renders a real `<select>`
   with name="cmp_runtime" (FormData path by construction); Select ships the bridge
   instead. The T90 discipline: **the page copy claims no color-scheme/popup-rendering
   behavior anywhere** (grep clean on page + select family; the only color-scheme
   mentions live in native-select's source comments) — the retraction precedent held.
9. **LAW #19**: 149 ids on the page, zero duplicates. svelte-check: page **0 seats**,
   family **0 errors** (+8 fleet-noise warns).

## Findings

**NONE.** The page is the cleanest behavioral surface this reviewer has measured in
the campaign — every keyboard, aria, RTL, portal-carrier and bridge claim reproduced
on the first clean run.

## Tier proposal

**Tier 2** — archetype-complete (install/usage/workbench/split/rtl/types/a11y/
theming/universal/api) with a fully-measured contract. No re-tier case.

## Probe-fault ownership

1. My first select drive ran while the page **500'd on a transient mid-save state of
   a sibling's in-flight playground edit** (play-row.svelte's `$props.id()` placement,
   vellum's T127 fix batch — the tree showed her files dirty; the file had already
   healed on re-read). The diagnostic caught the 500; the retry ran clean. Recorded
   as environment, not a page defect.
2. `smallTriggerFontSize` read null (I read the trigger's computed font-size while
   the size carrier rides the field/panel style) — the panel style head carries the
   real receipt; the misread owned.
3. The tags-input class of full-keyboard walk (Home/End/wrap) was driven on the
   canvas workbench select only; the types-section seats share the component.

## Gate record

- svelte-check (ONE run, saved): page **0 seats**; family **0 errors** (+8 fleet
  warns). Fresh build rc=0 (dist 02:33); **verify:docs rc=0**; docs-universal
  **110/110**.
- Process: port 5244 mine, killed (lsof rc=1); NO commits/pushes/fixes. Artifacts:
  /tmp/marginalia-131-select.mjs, /tmp/m131-seldiag.mjs.
