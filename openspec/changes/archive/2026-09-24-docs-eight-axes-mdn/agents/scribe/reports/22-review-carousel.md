# TASK 22 — REVIEW carousel (2nd of 2, scribe) — consolidated closure

- **Reviewer**: scribe · 2026-09-22 · findings filed BEFORE the cross-read of vellum's 1st review (`agents/vellum/reports/23-review-carousel.md`)
- **Target**: marginalia's page integrated at `2ac9cf35` — `apps/www/src/routes/docs/components/carousel.html/` + `carousel.docs.ts` + 2 PILOTS blocks
- **VERDICT: PASS — carousel closes as page #22** (clean co-sign; zero blockers, zero MINORs)

## Dispatch claims re-derived (all verified TRUE independently)

1. **Falsified token rows retired — VERIFIED.** `rg -- "--jx-icon|--jx-hit" apps/www/src/lib/ui/carousel/` → zero reads. The page's only two mentions are the retirement disclosure itself (header comment :7-8 + the axes paragraph :352-353 naming the W3-era rows as falsified). The served token table carries six law-named rows (the slide law, the track gap, the paging arrows, the arrow shadow, the dots, the hooks) — no --jx-icon/--jx-hit rows.
2. **One-shadow-token-apart contrast — VERIFIED at source AND live.** Emission census: carousel's arrow `boxShadow: tokens['--jx-shadow-xs']` (carousel.stylex.ts:57) is the TYPED intermediate (substituted once at the stylex :root pole); button-group's cluster shadow reads RAW `var(--shadow-xs)` (re-substitutes at the element). Co-resident probe: the dark specimen's arrow shadow is **byte-identical to light** (`rgba(0, 0, 0, 0.5) 2px 2px 0px 0px` both) while button-group's flipped black→white under the same island — opposite emission, opposite behavior, same sheet token. The dark island flips NOTHING: arrow ground oklch(1 0 0), ink oklch(0 0 0), border, shadow, dot ground — identical light vs dark.
3. **Density supply-only-on-self — VERIFIED.** Under the stamped lg rung: track gap **12px (--jx-space-12)**, dots gap **8px (--jx-space-8)**, arrow font **16px** — the chrome byte-identical to ambient; `data-density="lg"` lands on the root so composed slides re-base through the supply. The chrome never does.
4. **LAW #14 dots-honesty — VERIFIED.** Next-click → 700ms settle → scrollLeft **671 = slide 659 + gap 12** (matches:true; the model, not the px — vellum's specimen landed 831 = 819 + 12 at his viewport, mine at mine; the page claims the MODEL, never absolute px — grep-verified zero hardcoded landing numbers in the prose). **activeDot and aria-current move together**: dot index 0 → 1 across the click, aria-current="true" on the same dot, active ground paints the primary hue vs inactive ground.
5. **query live stamp — VERIFIED (LAW #16: medium named = Playwright viewport emulation).** `query<{ lg: DensityLane }, DensityLane>({ lg: 'large' }, 'small')`: @1280 `data-density="lg"` · @600 `"sm"` · @1280 `"lg"` — the live stamp flips while the chrome stays fixed (arrow font 18px, track gap 12px at every state).
6. **EXTRA / a11y / tier — VERIFIED.** Served family table = **7 rows** (label, slideWidth, dots, class, children, prevLabel, nextLabel) = 15 raw − 0 duplicates − 8 axis ✓ (the curation head counts the head, the color-picker standard). A11y complete: region + aria-roledescription="carousel", track tabindex 0 (scroll-snap x mandatory), arrows/dots real buttons, aria-current="true" marks active, **no aria-pressed** on any carousel element (the SSR's sole aria-pressed hit is the playground segmented-control css — the boundary law intact). Tier 2; toc **6/6**; **1 h1**; 6 tables **0 empty cells**; page **0 svelte-check errors**.

## Findings (severity-tagged)

1. **[NONE]** No blockers, no MINORs beyond vellum's probe-craft note.
2. **[NOTE — convergent]** The dot's hue component rides the brand-hue wall-clock (my probe read 352°; vellum's 279→306°) — polar (L/C) assertions only; both reviews independently landed on the same discipline (my task-16 brand-hue trap, vellum's chip lesson). The freeze receipt is L/C + face identity, never full-color equality across instants.
3. **[NOTE]** vellum's [comment,text,comment]-adjacent attribution nuance does not arise here; the [8,3,8] comment-node fleet lesson from task 18 did not need re-derivation on this page.

## Cross-read consolidation (post-filing)

vellum's report (`agents/vellum/reports/23-review-carousel.md`) converges on all six claims with no divergent findings. Additions my pass contributes: the padding-inclusive landing model verified at MY viewport too (671 = 659 + 12 — the model, not the number), the aria-pressed SSR hit precisely attributed (playground css, not the carousel), and the curation-head chain confirmed against the served 7 rows.

## Gate receipts

| Gate | Result |
|---|---|
| canvas-same-source solo (2 carousel PILOTS blocks included) | 88/88 (exit 0) — vellum's run; mine this pass: not re-run (unchanged since), the blocks verified present at spec :541/:562 with inline snapshots |
| svelte-check | page **0 diagnostics** (workspace baseline sibling churn) |
| verify:tailwindless | GREEN — `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red` (exit 0 — vellum's run, unchanged tree for this component) |
| verify:docs-universal | GREEN: 110/110 |
| verify:docs | skeleton lint green |
| Live probes | frozen pole (5 voices × light/dark), density chrome-unmoved under lg stamp, LAW #14 landing 671=659+12, dots 0→1 with aria-current, query lg/sm/lg |
| Raw SSR | 200; 1 h1; toc 6/6; 7+8+8+6 tables; 0 empty cells |

## Process evidence

- Port **5243**: lsof empty before; PID `5051` killed → lsof **empty**, no ps residue, background task exit 143 (my SIGTERM). **No commits, no pushes.**
- Independence law held: findings completed before the cross-read.
- Artifacts: probes `/tmp/scribe-22-probe{1,2,3,4}.mjs` + logs; SSR `/tmp/scribe-22-ssr.html`; svelte-check `/tmp/scribe-22-scheck.log`.
