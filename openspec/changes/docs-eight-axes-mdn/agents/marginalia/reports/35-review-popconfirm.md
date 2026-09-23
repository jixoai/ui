# TASK 35 — REVIEW popconfirm (marginalia, 2026-09-23; 2nd of 2 — SELF-CONTINUATION)

- **Reviewer**: marginalia, reviewing MY OWN task-33 PASS. Per the dispatch this is the
  self-continuation exception: I held the strictest standard, re-derived every claim from the
  CURRENT tree as if fresh (new probes written from scratch, receipts re-measured, not quoted),
  and disclose the exposure here: I read my own report 33 before probing (unavoidable — it is
  the review under continuation), so the discipline applied is reproduce-don't-trust: every
  number below was re-measured on today's tree, and one of my own 1st-review probe habits
  (see the override finding) was caught being wrong-structured this pass.
- **Target**: quill's page at `1e4aad06` as it stands on HEAD `6ab74431` — five integrations
  landed between (7bf5a57c…6ab74431 per the drift check below).
- **Method**: git drift audit (1e4aad06..HEAD per path), fresh live probes (six-panel sweep,
  override/keep mechanics, placement anchoring, siblings shape — all on real OPEN panels at a
  750ms settle past the ~420ms kernel), raw SSR parse + served-row enumeration, the family
  solos + ambient + docs-universal + fleet svelte-check.
- **VERDICT: PASS (closes popconfirm)** — zero drift, every standing claim re-derived TRUE on
  the current tree, the W-next #5 documentation still truthful, no new findings above LOW.

## 0. Drift audit — the one thing the 1st couldn't check

- `git diff 1e4aad06..HEAD -- '*popconfirm*' '*press-button*'` → **the only hit is my own
  report file** (agents/marginalia/reports/33-review-popconfirm.md, +51). Zero commits touch
  the page, the family, or PressButton.
- Zero uncommitted changes in those paths (the tree's in-flight set is input-otp.css +
  number-input.css — siblings').
- The feeding type sources (defaults.svelte.ts, props-table, blueprints) also unchanged — so
  the diagnostics set (below) is byte-identical pre-existing debt, not drift.

## 1. Standing claims re-derived on the current tree — all verified TRUE

1. **Dead-trigger fix end-to-end — VERIFIED ×6 fresh.** All six rig panels
   (pc-ax-ambient/radius/elev/dark/density/placement) open on their PressButton trigger clicks,
   each panel `:popover-open` true at the 750ms settle; **focus lands on Cancel ×6**
   (activeElement is the panel's Cancel button, `isCancel: true` every panel); the **Cancel
   click closes through the platform ×6** (`:popover-open` true → false). The family auto-wire
   seam is unchanged (`button:not([popovertarget])`, popconfirm.svelte:239) and PressButton's
   claimed prop coexists with it.
2. **Siblings-not-carriers — VERIFIED fresh** on pc-ax-ambient: root children = the description
   `P` (empty style attr, unpainted), the anchor `SPAN` carrying **only**
   `anchor-name: --jx-pc-pc-ax-ambient`, and the promoted `DIV.jx-pc.jx-surface[popover]`
   carrying the entire stamp block (`--jx-elevation-effective: 3; --jx-radius-consumed: …`).
   Pure anchoring handle + self-carried panel, exactly as the 1st recorded.
3. **The axes digits — VERIFIED digit-exact:**
   - **radius**: ambient OPEN panel **0px** with the auto concentric stamp verbatim
     (`calc(max(0px, calc(var(--jx-radius-effective, 0px) - var(--jx-inset-effective, 0px))) × …)`);
     `radius="large"` **10px** with `--jx-radius-effective: var(--jx-radius-large)` (the
     EXPLICIT stamp form) — both stamp forms alive.
   - **elevation**: ambient surface-body **oklch(0.96 0 0 / 0.72)** with stamp
     `--jx-elevation-effective: 3` → `elevation="level3"` **oklch(0.94 0 0 / 0.72)** with stamp
     **6** — the paired ladder-rung surface + dp stamp both move.
   - **theme**: the dark panel surface **oklch(0.185 0 0 / 0.72)** — **alpha 0.72, my 1st-pass
     correction re-measured verbatim** — while the title ink holds **frozen oklch(0 0 0)** at
     weight 400 (the honest low-contrast cost, still taught as the mechanism's cost).
   - **density consumed twice**: the lg panel's trigger measures **48px** (ambient 40) AND the
     open panel's buttons **48/48px** (ambient 40/40), with `--jx-density-coefficient: 1` in
     the panel's stamp — the re-based --jx-hit reaches the panel's own controls.
   - **placement**: computed `position-anchor: --jx-pc-pc-ax-placement` +
     `position-area: bottom`, panel geometrically below the trigger.
4. **EXTRA served-first — VERIFIED**: api section enumerates **14 family rows** (title* ·
   description · onconfirm · oncancel · confirmLabel · cancelLabel · confirmTone · placement ·
   variant · id · content · actions · children* · class/rest as one) + the shared universal 8;
   the axes section serves the 8 axis rows + the 6-row TokenTable. Same shape my 1st recorded.
5. **Chrome — VERIFIED**: toc **9/9** present, served anchor order == DOM (overview →
   popconfirm-demo → popconfirm-override → law → types → usage → api → axes → accessibility;
   install/see-also keep their ids folded out of the toc per the page's stated policy); h1 ×1;
   the stale `popconfirm-base` id **absent** (0 hits); universal marker ×1;
   install/see-also markers ×1 each; 0 literal undefined/null text nodes.

## 2. W-next #5 context — documentation still truthful

- PressButton still OWNS `popovertarget` as a first-class prop (declared :404, defaulted
  undefined :446, forwarded :707) — the claimed-prop clobber mechanism stands as ledgered.
- The page's workaround text (the workbench PlayHelp) reads: *"a component trigger that claims
  its own popovertarget prop (PressButton) takes the EXPLICIT wire — give the Popconfirm an id
  and pass the prop through"* — **accurate against the current source**, placed at the break.
- quill's composition-d adjudication (untouched fixture = correct; it tests the plain-button
  auto-wire path, which remains real) stays concurred; the fixture set still passes (below).

## 3. New receipts this pass (beyond the 1st)

- **The override panel's aria-labelledby drop — now probe-verified**: the open merge-pc panel
  (content/actions snippets) carries `aria-labelledby: null` + `role: dialog` — the a11y
  table's "DROPS when a content snippet renders" claim, measured.
- **The override keep-close — re-verified with corrected targeting**: the keep button
  (`popovertarget="merge-pc"`) closes the merge-pc panel through the platform
  (`closedAfterKeep: true`). NOTE: my first sweep this pass aimed the keep-check at pc-demo —
  the wrong panel (keep lives in the OVERRIDE panel, merge-pc; pc-demo is the default
  rendering) and no-op'd. My 1st review's claim was right about the panel; the record here
  makes the targeting explicit so reviewer #3 (if any) doesn't repeat the miss.
- The authored content snippet text is served in the SSR bytes ("fast-forward is impossible").

## Findings (severity-tagged)

1. **[NONE on the dispatched claims]** — every standing claim re-derived TRUE; zero drift.
2. **[INFO · probe craft]** the override keep-check must target the OVERRIDE panel (merge-pc),
   not the default-rendering panel (pc-demo) — the two demos sit side by side and share the
   popovertarget-wiring story. Recorded so the receipt chain stays reproducible.
3. **[INFO · pre-existing debt, unchanged]** diagnostics attributable to popconfirm paths:
   family `popconfirm.svelte:190` 7× `state_referenced_locally` warns (the fleet-wide
   provideUniversalLanes pattern) + `:301` 1× `Object.entries` overload error, and
   `blueprints/scenes/popconfirm.svelte` 3× Props-literal errors — all in files untouched
   since 1e4aad06 with unchanged type sources (drift-audited above); NOT the page's debt and
   not a regression. Page (`+page.svelte`/`+page.ts`): **0 diagnostics**.

## Gates

| Gate | Result |
|---|---|
| popconfirm family solos (batch5-antd-components + composition-d + defaults-overlays + density-adoption-menus) + ambient | **331/331, exit 0** (ambient 284/284 included) |
| verify:docs-universal | GREEN **110/110** |
| svelte-check (fleet, 621 files) | page 0 diagnostics; fleet 1591 errors (sibling churn set); popconfirm-path debt unchanged/pre-existing (§3) |
| Raw SSR | toc 9/9 order==DOM; h1 1; rows 14+8; stale id absent; markers present; override text served |

## Process evidence

- Port **5244**: lsof **empty before**; my wrapper → vite (PID 58713 + wrapper killed by PID);
  **port after: []**.
- **NO commits, NO pushes, zero product-tree edits** (review-only). Siblings in flight
  (vellum's press-button CODE, scribe's kbd review, quill's menubar review) untouched; the
  tree's uncommitted input-otp.css/number-input.css belong to them.
- Self-continuation disclosure: report 33 read before probing; every receipt re-measured fresh
  (/tmp/marginalia-35-probe1.mjs, -probe2.mjs, /tmp/marginalia-35-ssr.html) — and the fresh
  pass still caught its own targeting error (§3), which is the strictest-standard argument for
  reproduce-don't-trust even on one's own prior PASS.
