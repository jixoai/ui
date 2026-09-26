# T114 — SECOND REVIEW popover.html (quill)

**1st:** marginalia 93, NEEDS-WORK 2M/4m/2L/1N, Tier 2 proposed (BOARD line: the full
consolidation LANDED — the childrenScoped DensityDemo quartet fix, the scoped density
seat, the 8 claim trues, the cx closure). Owner = scribe. **2nd protocol:** her report
opened FIRST; every landed item verified at the DOM + source layers; headline receipts
re-derived with my own instruments; fresh axis = the full quartet matrix + a hydration
watch; plus one platform delta she didn't hit. Fresh build exit 0 at HEAD **43da0d99**
(newer than the 5318741b floor); **the geometry legs ran against the DIST via
`vite preview`** (see process — dev-mode was being hot-reloaded by sibling lanes' edits).

## Verdict: PASS — the NEEDS-WORK bank is fully landed; 0 M / 0 m / 1 L (platform delta, new) / 1 N (family seats, new information) — Tier 2 confirmed

## Landed items — verified

1. **MAJOR-1 (density-pop ×4) — the childrenScoped fix HOLDS.** Byte layer: the page
   renders the theming seat through DensityDemo's `childrenScoped(scope)` snippet with
   `id={`density-pop-${scope}`}` (+page.svelte:546-547); DensityDemo documents the split
   ("plain clone form — omit when childrenScoped is given (id-bearing…)"). DOM layer:
   bare `density-pop` id GONE; per-rung ids **density-pop-xs/sm/default/lg all distinct**;
   LAW #19 clean (duplicate census 0 page-wide). **Per-rung anchor names all distinct**
   (`--jx-pop-density-pop-xs/sm/default/lg`). **Hydration flip GONE**: a MutationObserver
   on id/style/popover attrs over the density seats in the first 1.8s post-load recorded
   ZERO flips.
2. **The quartet matrix (fresh axis — her probe only demonstrated the bug on rung 2)**:
   clicking EACH of the four rung triggers opens **its own** panel (`:popover-open` on
   that rung's id), riding **its own** anchor name, with truthful aria —
   `aria-expanded` false → **true** on the clicked trigger, every rung. The pre-fix
   failure mode (wrong panel, wrong anchoring, lying aria) is structurally gone.
3. **MAJOR-2 + the claim trues — landed.** Hero, meta, base bullet now teach the scoped
   truth: "the default trigger path runs zero listeners and zero positioning script —
   one aria toggle seam plus the shared surface-motion kernel (view source and count)";
   meta: "a component whose default trigger path runs zero positioning script. Anchored
   placement ships — the placement prop." No "no JavaScript at all"/"0 lines of JS" /
   unscoped "zero-script" strings remain.
4. **MINOR-3 — landed as a v1→SHIPPED lineage**: the strategy list keeps "placement v1 —
   authored centering" AS HISTORY next to a new "SHIPPED: anchored placement … behind the
   live placement prop (nine positions, demoed above)"; the only future-tense bullet left
   is `popover="manual"` (still unshipped, honest).
5. **MINOR-4 — landed**: authored +page.ts toc = usage FIRST, then menu/card/base/types,
   then the trio — the skeleton law the page cites.
6. **MINOR-5 — landed as the honest seat**: the childrenScoped seat's own text teaches
   "Density-FLAT by family mechanism (measured): the scope stamps re-derive on the wrapper
   (--jx-hit arithmetic 28/32/40/48) but this family's trigger and panel consume no
   density lane — the trigger stays 43px and the panel pad 12px 14px across every rung;
   each rung's panel is its OWN instance (per-rung ids, LAW #19)." The overclaim is gone,
   replaced by the measured truth.
7. **MINOR-6 — the cx closure landed at the page**: the :245 cx ERROR is GONE; the only
   page row left is her recorded `state_referenced_locally` WARN on `canvasUsageLive`
   (line-drifted :229 → :233 by the consolidation edits) — the warn she graded benign by
   design; page = **0 ERROR, 1 standing warn**.
8. **LOW-7/LOW-8** — the false strings ("focus loss closes" as a page claim, "reopens
   itself on toggle") are gone from the page copy; the a11y table's remaining
   "(outside click / focus loss)" phrasing is attributed to the NATIVE `popover="auto"`
   semantics, not to a page promise.

## Her headline receipts — re-derived, concordant (dist-served)

1. **Flush 0/0 (the r22 law)**: demo-menu settled open — `dyBottom 0 / dRight 0`,
   `position-area` computes **`span-left bottom`** (the span-semantics END-align law live),
   panel anchored via `--jx-pop-demo-menu`.
2. **The nine-grid master-switch + collapse**: 9 `aria-pressed` cells all-on → the center
   master cell flips **9 → 0**; lighting `top` alone → open measures **dyTop 0 (flush
   above), cxDelta 0 (anchor-center)** and `position-try-fallbacks` collapses to
   **`--jx-try-top`** — her receipt digit-exact.
3. **The elevation quartet paints 4 distinct rung recipes**: the named seats
   (univ-default/univ-l3/univ-dp/univ-concave) carry inline effective values
   **3 / 6 / 8 / −1** and four distinct computed body box-shadow recipes — the "8dp IS
   level4" snap-down quartet, live.
4. **Wrap-IN-PLACE**: the panel's parent chain is IDENTICAL at rest and open (no
   body-append severance; tokenScope survives the promotion) — the combobox lesson's law
   holding on this family.

## NEW INFORMATION (findings to you — no fixes by me)

1. **[L — platform delta, NOT a page defect] "Renders above open dialogs" does not
   reproduce on my runner.** With a `showModal()` dialog open, a popover opened AFTER it —
   a fresh never-opened seat AND a reopen — enters the top layer (`:popover-open` true)
   but **elementFromPoint at the panel hit-tests DIALOG**: the dialog keeps paint/hit
   precedence on **Chrome for Testing 153.0.8010.12 (chromium-1243)**. Her 1st review
   measured hit-in-panel TRUE on system Chrome — a version delta in top-layer
   LIFO/hit-testing, the same platform-attribution class as her LOW-7 (focus-loss light
   dismiss). The page's "renders above sticky headers, transforms, and open dialogs"
   over-claims on this engine; owner's call: scope the claim, or accept the engine delta
   (the claim mirrors the platform promise, and engine versions move).
2. **[N — family seats, post-closure new information] ui/popover carries 2 open ERRORs**:
   popover.svelte **:109:28 the cx-overload clone** (the family's own seat — the fleet
   closure reached the PAGE but not the component) and **:399:34** `false | "jx-waapi"`
   not assignable to the cx parameter (a `cond && 'literal'` arg the joiner's type
   doesn't accept). Family files untouched by any reviewer (pre-existing); both belong on
   the fleet consolidation sweep list. The family also carries 9 standing
   `state_referenced_locally` warns (:216 ×8, :253) — the W3-D3 class.

## Gates

| Gate | Result |
|---|---|
| verify:docs | **rc=0 — fully green** (any-red-is-new-information clause untriggered) |
| verify:docs-universal | GREEN 110/110 (once, this task) |
| svelte-check page-scoped | popover.html **0 ERROR** (the cx closure landed), 1 standing WARN (:233, her recorded benign) |
| svelte-check family | ui/popover **2 ERRORs** (:109 cx seat + :399) — new information, receipted above |
| Fresh build | exit 0 at HEAD 43da0d99; geometry legs served from the dist via vite preview |

## Probe faults owned (all mine, all fixed pre-verdict)

1. **Programmatic-vs-state race**: my first quartet matrix split click and aria read
   across two `page.evaluate` calls and read `aria-expanded` false-while-open on all four
   rungs — a direct one-shot drive reads TRUE (the seam is fine; my split raced the
   re-render).
2. **Seat confusion**: the universal-props section hosts 11 popovertarget buttons — my
   first "quartet" swept them all (5 distinct shadows, wrong n); re-scoped to the four
   named seats.
3. **Anchor matching**: a first-element `[style*="anchor-name"]` finder measured a far
   seat's rect (dyBottom 786) — all geometry reads now match the panel's computed
   `position-anchor` name to its carrying element (the T113 lesson, applied).
4. **The try-grid cells are GLYPHS** (`title={cell.id}`, labels ◤▲…) — my text finder
   found no `center`/`top` cell and the leg hung (an async that rejects past
   `.then(resolve)` never settles); title-attribute matching + always-resolve guards
   fixed it.
5. **Sibling churn**: two legs died to "context destroyed → navigation" — scribe's
   dialog CODE edits hot-reload MY dev server (shared tree). Moved the geometry legs to
   `vite preview` serving the fresh dist: stable, and it is the same artifact the lint
   gate audits. The LIFO delta receipt above is FROM THE DIST BUILD.

## Process

Port **5241**: pre-check rc=1 → dev for the theming/quartet legs → **preview (dist) for
the geometry legs** → after gates killed by PID + wrapper → `lsof -ti :5241` **0 lines,
port EMPTY**, zero Chrome orphans, zero probe processes. Sibling ports (5242/5243/5244/
5230) untouched. NO commits, NO product-tree edits. Root-dark/hydration observers and
injected dialogs removed in-probe. Artifacts: /tmp/t114-p1.mjs, p1b, p2, p2b, p2c,
diag, leg/leg2/leg3, -ssr.html, -build/-dev/-prev/-scheck/-docs/-universal logs.
