# TASK 112 — dialog CODE ROUND (scribe; the toast/tour pattern)

**Verdict: CODE ROUND LANDED — her NEEDS-WORK dispositions complete, archetype completion
served and measured, family gate closed to 0 errors.** Baseline: marginalia's 1st (task 85,
1 MAJOR / 4 MINOR) was consolidated before this round (page claims corrected at its three
named seats, scrim row trued, toc rail fixed, page gate 0); this round landed her remaining
Tier-2 list (overview/law, axes table, query() seat — the BOARD's code-round scope), the 4
family ERRORs, one MISSED MAJOR-1 seat I caught on the source walk, and one stale family
comment (the drift-ledger class). All family edits MIRRORED byte-identical to the registry
twins; mirror manifest regenerated; nothing staged, nothing committed (per contract — the
orchestrator commits at consolidation).

## Finding-by-finding disposition

**MAJOR 1 (the modal focus-trap leak) — disposition: claims-landed-at-consolidation + ONE
MISSED SEAT FIXED BY THIS ROUND + served-truth re-measured.** The consolidation corrected
the a11y row + summary, the workbench canvas description, and the family comment (mirrored,
W-next #17). My source walk caught a FOURTH seat still teaching the falsified absolute: the
Basic demo summary claimed "focus stays inside the dialog while the page behind is inert"
— unqualified, and false at the second Tab. FIXED (+page.svelte): the summary now teaches
the bounded truth ("the in-dialog cycle holds and the page behind is inert, with ONE
measured exception: every second Tab reaches the page's skip link … the next press returns
— W-next #17"). The prototype-waterfall missed-sixth-seat class, caught pre-2nd-review.
Served-truth re-verified live on my build (real keys, per-press containment, one
`dialog[open]` at every step): press1=Close (in) → press2=**Skip to content (NOT in)** →
press3=in-dialog → press4=Close (in); Escape restores the invoker ("Open dialog"). The page
now teaches exactly what the DOM does. (The repair itself stays the family/scaffold owner's
— W-next #17; my round touches no scaffold file.)

**MINOR 2 (elevation stamped-not-painted) — disposition: claims-landed-at-consolidation +
taught in the new axes table + re-measured live.** The six seats + summary already teach the
measured truth (W-next #18). The new axes table's elevation row carries the same truth with
the number-lane caveat ("6dp IS level3 — the mapping is real; the shadow it names is the
unpainted half"). Re-measured on the level4 seat at settle: boxShadow/filter/
backdrop-filter/background-image all `none` while the root style carries the level4 stamp
(`--jx-elevation-shadow: var(--jx-elevation-level4-shadow)` + the surface rung) — stamped,
not painted, verified on the served page. Radius re-confirmed as the one painting lane
(below).

**MINOR 3 (scrim row stale) — disposition: landed-at-consolidation, verified.** The
TokenTable row serves "black 32% / white 10%" with the stage-pin caveat (read from the
served row). The platform-list seat (`#dialog-base`) carries no numbers and needed nothing.

**MINOR 4 (page gate red + toc ≠ DOM) — disposition: landed-at-consolidation (page 0,
rail 13/13) and SUPERSEDED by this round's additions — the rail is now 14/14.** The
overview entry joins the toc at position 1 and see-also stays chrome-OUT (the toast
policy). Rail read from the served DOM: `overview, dialog-basic, dialog-form,
dialog-card-footer-clusters, dialog-head, dialog-scroll, dialog-base, types, usage,
accessibility, theming, universal-props, api, composition` — 14 entries, DOM order.

**Tier-2 list (the BOARD's code-round scope) — LANDED:**
- **#overview (law)** — new section after the hero: the mechanism split (platform owns the
  modal mechanics; the component adds bind:open + the 460ms `--jx-p` kernel), the card
  dialect (data-jx-card + CardHeader/CardBody/CardFooter, unconditional head / iff-footer),
  and the measured contract paragraph (width min(92vw, 26rem) 416→368px; scrim achromatic
  32%/10%; the trap leak bounded; elevation stamped-not-painted; radius the painting lane;
  kinship: system-dialog / sheet / popover).
- **The eight axes table** — #universal-props retitled "The eight axes on dialog", the
  axisRows PropsTable added (8 rows classified against the served family: size SUPPLY-ONLY,
  shape CONSUMED via dialog.css `corner-shape`, radius CONSUMED-the-painting-lane +
  concentric anchor, density NO-OWN with the data-density stamp truth, color SUPPLY-ONLY,
  theme the island stamp (class:dark), elevation OWN level4 STAMPED-NOT-PAINTED, motion
  family-owned-axis-unread), plus the receipts paragraph (portal law / self-carried
  carriers, LAW #19) and the query() CodeBlock. Grep receipts run over ui/dialog/ + card/
  before writing each row.
- **query() seat** — live, on the ONE lane that paints: `radius={query({ md: 20 }, 8)}` on
  a seventh seat dialog with a PressButton radius="auto" child. **Measured digit-exact on
  the served build**: at 1200w the root stamp reads `--jx-radius-effective: 20px` → dialog
  20px, child **6px** = max(0, 20−14); at 500w the stamp reads `8px` → dialog 8px, child
  **0px** (the clamp). The concentric law moves WITH the query. (The radius-20 static seat
  re-confirmed: 20px → 6px.)
- **#install + #see-also** — DocsInstall("dialog") (marker + `npx jixoai-ui add dialog`
  copy served) and DocsSeeAlso("dialog") (marker + component link), both chrome-OUT of the
  toc per the toast policy. **Adjudication recorded**: I did NOT stage dialog into
  scripts/docs-skeleton-scope.json — the page is an unmapped route (warning-only) and its
  Usage H2 renders AFTER the six demo canvases, so scope membership would hard-fail
  `usage < examples` (the toast-red class) and force a structural reorder that is the
  owner's staging decision, not a code-round edit. The two markers still land (the
  archetype is complete; the backlog warning shrinks when the owner stages).

## Family round (4 ERRORs closed + 1 stale comment), MIRRORED

- **dialog.svelte:109 (Object.entries overload)** — `Object.entries(style ?? {})` + a
  comment naming why (filter(Boolean) does not narrow). The same fix shape the
  consolidation applied to the page-side cx and to toast's joiner clones.
- **dialog.svelte:320 (`false | "jx-waapi"`)** — `panelMotion.supported ? 'jx-waapi' :
  undefined` (the toast-viewport ternary shape).
- **dialog.svelte:376 (the Snippet identity split)** — `icon={xGlyph as unknown as
  Snippet}` with a comment: the snippet's branded type resolves from the other svelte copy
  than IconButton's import — structurally identical, identity-branded (canvas-playground
  carries the same class at its glyph seats; not my scope). Runtime passes the value
  through untouched.
- **dialog.svelte:409 ({@render footer()} possibly undefined)** — the render gate switched
  from the `hasFoot` derived to `footer` itself (TS cannot narrow through a $derived);
  `hasFoot` stays for the data-sep-foot stamp. Verified at runtime: the footer dialog's ×
  and buttons render and close (click receipt below).
- **dialog-defaults.svelte.ts (stale density comment)** — the header still said "the panel
  never stamped data-density and still does not" while dialog.svelte's carrier row stamps
  `data-density={densityRungOf(d.density)}`. Rewritten to the truth: no own on VALUE
  (slot unparameterized), the stamp exists for named rungs and omits for auto/number/query
  (densityRungOf's undefined arm). The drift-ledger class — fixed because my round touches
  the family.

**Mirror law**: both files `cp`-ed to `registry/files/ui/dialog/` immediately after the
edits; `diff` byte-identical BOTH trees at mirror time and re-verified at teardown (two
sibling consolidations — 43da0d99, 97f5b6cc — landed mid-round; twins still identical);
`verify:mirror` rc=0 after regenerating apps/www/mirror-manifest.json (148 items / 795
pairs).

## Test-fixture maintenance (one mechanical index)

The new axisRows table makes dialog's API table PropsTable call-site **1** (0-based); the
ambient matrix pinned `dialog table[0] variant#1`. Updated
`test/fixtures/docs-ambient-vocabulary.matrix.json` tableIndex 0 → 1 (the pinned row's
bareDefault/marker unchanged and still matching). This took the ambient solo from 282/284
back to **284/284**, re-run again after the mid-round sibling consolidations — 284/284 on
the final tree.

## Gates

| Gate | Result |
|---|---|
| fresh `npm run build` (apps/www) | **rc=0** (lint reads THIS dist) |
| verify:docs | **rc=0** — "all docs pages pass the skeleton lint (staged scope green)"; the fully-green state NOT regressed; dialog prints as `[backlog]` warning-only |
| verify:docs-universal | **GREEN 110/110** |
| verify:mirror | **rc=0** (after manifest regen) |
| svelte-check (apps/www CWD) | **dialog.html/+page.(svelte\|ts): 0 diagnostics; dialog family: 0 ERRORS** — the 8 standing `state_referenced_locally` warnings at dialog.svelte:229 (provideUniversalLanes' lane reads) are the pre-existing fleet-wide cosmetic class, untouched by this round, receipted |
| docs-ambient-vocabulary solo | **284/284, rc=0** (twice: post-fix, and on the post-consolidation final tree) |
| docs-nav-filter + nav-filter solos | **34/34, rc=0** (toc-change safety) |
| warm-reload | consecutive SSR fetches **byte-identical** (743,317 bytes — static preview dist) |

## Live-probe receipts (vite preview :5243, real clicks/keys)

- SSR **200**, **742,734 bytes** first fetch; byte needles ALL present: the corrected Basic
  summary ("ONE measured exception"), the a11y leak row, `id="overview"`, "The eight axes
  on dialog", `data-doc-install` + `npx jixoai-ui add dialog`, `data-doc-see-also`, the
  STAMPED-NOT-PAINTED clause, the query-seat trigger and dialog title, the SELF-CARRIED
  receipt. h1 ×1; `>undefined<` 0; `>null<` 0; `jxoai` 0.
- **LAW #19: 106 ids, ZERO duplicates** page-wide (the new sections/tables added none).
- **Rail: 14/14** — served rail ids == +page.ts == DOM order (list above).
- **Trap battery (W-next #17)**: 4 real Tabs on the workbench dialog — the every-second
  leak shape reproduced (in → skip-link out → in → in), open-count 1 throughout, Escape
  restores the invoker.
- **Elevation (W-next #18)**: level4 seat at settle — zero painted shadow channels; the
  inline stamp carries the level4 pair.
- **Radius/query seat**: 1200w → effective 20px, dialog 20px, auto child **6px**; 500w →
  effective 8px, dialog 8px, auto child **0px**; static radius-20 seat 20px → **6px**.
- **Scrim row**: serves "black 32% / white 10%".
- **The family edits run**: the × button serves with its glyph svg and a real click closes
  (the :376 cast + :409 gate are runtime-neutral).

## Process evidence

- Port **5243**: lsof EMPTY before (rc=1) → vite preview wrapper **86695** + listener
  **86730**; both killed by PID after probes; `lsof -nP -iTCP:5243 -sTCP:LISTEN` → empty,
  **rc=1**; orphan sweep clean. Ports 5230/5241/5242/5244 untouched.
- **NO commits, NO pushes, nothing staged.** My round's working-tree inventory:
  dialog.html/+page.svelte, dialog.html/+page.ts, lib/ui/dialog/dialog.svelte,
  lib/ui/dialog/dialog-defaults.svelte.ts, registry/files/ui/dialog/{dialog.svelte,
  dialog-defaults.svelte.ts}, test/fixtures/docs-ambient-vocabulary.matrix.json,
  apps/www/mirror-manifest.json. Sibling in-flight noise (tour/grid/statistic/math-inline
  edits, later consolidated by the orchestrator mid-round) untouched.
- Probe faults owned: (1) my first seat read used `dlg.querySelector('button')` and grabbed
  the **× close button** instead of the radius="auto" PressButton — the concentric-child
  numbers (6px/0px) were unmeasured until the text-scoped re-probe; the × computing 20px is
  its own story, not the claim's element; (2) `--reporter=basic` vitest-4 startup error
  (my own banked lesson, re-hit — dot is the valid form); (3) /tmp probes cannot resolve
  `playwright` from apps/www (ESM resolves from the file's path) — absolute-path import of
  playwright-core + the pinned headless-shell executable.
- Artifacts: /tmp/g112-{probe,probe2,rail}.mjs, /tmp/g112-{scheck-before,scheck-after,
  build,docs,universal,mirror,mirror-gen,ambient,ambient2,navfilter,preview}.log,
  /tmp/g112-ssr{1,2}.html.

## Open questions for the orchestrator / vellum 2nd

1. **The inScope staging call** (recorded above): staging dialog would hard-fail
   `usage < examples` until the six demo canvases move below the Usage H2 — a structural
   reorder (the toast-move class, ×6 sections). Owner's timing; the markers are in place.
2. **The × close button's radius** computes the dialog's full radius (20px on the radius
   seat), not the concentric child formula — IconButton has no radius="auto" consumption.
   Not a claim on this page (no served text says otherwise), but the next prober should not
   read the × as the concentric seat.
3. **The Snippet identity split** is toolchain-fleet (canvas-playground ×8, others) — the
   cast is this round's local bridge; a fleet fix wants the dual svelte-type-copy root
   cause, not per-seat casts.
4. W-next #17's actual repair (scaffold-side skip-link handling while a modal is open) and
   W-next #18's wire-or-retire remain the owner's ledger items — this round taught the
   measured truth at every page seat and re-verified both live.
