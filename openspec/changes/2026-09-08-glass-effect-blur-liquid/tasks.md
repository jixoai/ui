# Tasks

Order law (r1 P1-6): registry.json item + gen-mirror-manifest
overrides land FIRST, mirror files next, manifest regeneration LAST —
no unclassified-file window. Lanes run SERIALLY on this 16GB machine
(swap discipline).

r10 note: the NORMATIVE implementation is the approved prototype
`.agents/prototypes/2026-09-09-glass-effect-preview/glass/*.ts`
(strict-checked, node-verified, running on the preview page) — Lane A
MOVES it into the item and adapts the surfaces, not rewrites it. The
generator script / map artifact / verify:glass-map gate of the v1
plan are superseded; the chroma branch is out until asked (kube
ships none).

## Lane A — the glass item core (general-purpose agent)

1. registry.json FIRST (the order law): the `glass` item (type ui,
   files: glass.ts, glass.css, glass-map.ts, liquid-glass.svelte.ts,
   index.ts; deps `@jixoai/jixoai-theme` ONLY, description) — the
   entry MUST carry `title` + `meta` `{group, href}` from the start
   (catalog.ts throws at build time on items without site meta —
   scroll-run's entry shape; skipping them kills every www
   build/test between Lane A and Lane C) — + the
   gen-mirror-manifest canonicalMain override → glass.ts.
2. Move the prototype modules in as `registry/files/ui/glass/
   glass-map.ts` + `glass.ts` per design §2/§5 (the four SURFACES,
   the ray-traced profile with the H·thickness+bezel PATH term, ÷max
   normalization, SDF sweep, 2× dpr + 512² area cap, the specular
   ring; clamps + TypeError; the `liquid`/`liquid.apple` factory +
   the §2 semantic compile table; the interactive flag stamps the
   `--jx-glass-interactive:1` var — already the prototype's exact
   name, keep it). Zero DOM in these two.
3. `registry/files/ui/glass/glass.css` per design §3 (scroll-run
   posture; unconditional frost base; the @supports branch is
   POINTER-ONLY — frost lives inside the filter chain; the
   interactive MOTION block (§3) — press scale/brighten gated on
   `--jx-glass-interactive:1`; print + reduced-transparency; NO
   forced-colors).
4. `registry/files/ui/glass/liquid-glass.svelte.ts` + `index.ts` per
   design §4: the Svelte action wraps `attachLiquidGlass` (mount
   sequence stamps → measures (shape override ?? border-radius) →
   fields → canvas encode with the no-canvas/zero-box guards →
   appends host svg + the 9-primitive chain at element size →
   pointer LAST; RO rAF-coalesced; update/destroy). index.ts is a
   plain named barrel (scroll-run's posture — builders, helpers,
   types, the action; NO default export — law items have none).
5. Mirror-copy the item into `apps/www/src/lib/ui/glass/`
   (byte-identical). Manifest regen is Lane B's LAST step, not here.

## Lane B — consumers rebase (general-purpose agent; strictly after A)

1. Theme `jixoai.css` (both sides): `.jx-glass` block RETIRES;
   acrylic block value-tokenized per design §6 (14/1/2 pinned
   locally, fill alias stays).
2. tabs (both sides): glass/liquid materials stamp the channel +
   tuning vars; tabs-trigger.css loses its glass/liquid formula
   lines; liquid's inline feTurbulence SVG DELETED — the indicator
   element gains `use:liquidGlass(liquid({ radius: '2px', saturate:
   1.6 }))`; tabs-indicator.spec re-pinned.
3. toast (both sides): materialGround.glass → data-jx-effect + vars
   (12px / saturate 1 / 55%); viewport imports glass.css; toast.spec
   re-pinned.
4. toc mobile rail (both sides) + www docs-sections-nav + www tokens
   demo + www print sim-shell toolbar: `.jx-glass`/raw formulas → the
   stamp channel — toc's files gain the real `import
   '$lib/ui/glass/glass.css'` (the toc → @jixoai/glass edge dies
   without a real import; verify-deps reads .svelte/.ts imports);
   sim-shell.css's stale `.jx-glass` COMMENT (~line
   66) rewrites with the block; verify-print.mjs expectations
   updated.
5. forced-colors consumer map (design §3): tabs indicator + toc rail
   + docs-sections-nav gain their Canvas grounds (toast keeps its
   existing; tokens demo exempt by declaration); Lane D source-pins
   each.
6. registry.json dependency edges: `tabs`, `toast`, `toc` each gain
   `@jixoai/glass`.
7. `verify-shadcn-add.mjs` CASES += glass.
8. LAST: regenerate the mirror manifest (`verify:mirror` green).

## Lane C — docs, playground, adoption (vision agent; after A+B)

1. `/docs/components/glass.html` (both sides): ComponentCanvas over a
   visual band; playground dock covers BOTH layers — the physical
   sliders (surface selector with all four, bezel/thickness/scale/
   blur/rimSaturate/specular) AND the semantic variant row
   (regular/clear/tint/interactive/identity — the prototype's demo
   row is the blueprint); source lane emits the builder +
   `use:liquidGlass(fx)` snippet; degradation copy; BOTH params
   tables (physical + the semantic compile table); "migrating off
   .jx-glass"; the element-chrome recipe (tint + shadow); add
   `glass` to `scripts/docs-skeleton-scope.json` inScope (the
   skeleton gate is staged — without inScope the new page only WARNs)
   ; verify:docs six-section skeleton compliance.
2. tabs/toast/tokens pages copy + demo updates (liquid: noise →
   lens). The tokens demo's `.jx-glass` usage is REBUILT onto the
   stamp channel — Lane D source-pins ZERO `jx-glass` hits in that
   page file post-rebuild.
3. Taxonomy/docs-nav/availability rows; svelte.config prerender
   entry; blueprint scene `glass.svelte` + committed SVG.
4. skills/jixoai-website references (design-tokens.md) row update.
5. In-browser visual acceptance (light+dark: glass/tabs/toast/tokens
   pages; lens visible in Chromium, frost elsewhere; a JS-DISABLED
   pass asserting the FROST base paint holds); NON-SQUARE elements
   exercised (wide card + tabs pill) asserting the band reads
   UNIFORM (the kube look); the semantic row renders distinct
   variants; screenshots to `.agents/images/2026-09-08-glass-effect/`.

## Lane D — tests & gates (general-purpose agent; interleaves B/C)

1. `apps/www/test/glass-map.spec.ts` + `registry/test/` mirror per
   design §5/§10: the pure goldens — center neutrality, rim
   inward-pull ≥ 90 steps at 1px inside (DEFAULT convex-squircle —
   concave/lip legitimately flip; SAMPLING PROTOCOL PINNED: map
   pixel index = dpr on the axis = 1 display px inside → expected
   225/31; raster-px-1 sampling reads 239/17 — one protocol only),
   monotone decay, band UNIFORMITY on a 512×256 element (±2 steps
   top vs left), quadrant antisymmetry, the profile shape triple
   (argmax |d| within s ≤ 0.01 of the border, border sample ≥ 60%
   of max, mid-band ≤ 55% of max — holds for ALL FOUR surfaces),
   the specular anchors (peak RGB 220/129, peak α 191/65 — kube's
   220/128/191/64 within rounding), the HARD area cap (2000×1200 →
   660×396 = 261,360 ≤ 262,144; floor rounding), the 2× raster,
   input clamps/TypeError.
2. `apps/www/test/glass-effect.spec.ts` + mirror: builder defaults +
   clamps/TypeError; the SEMANTIC compile table (apple regular ≡
   liquid() defaults deep-equal; clear/identity/tint/shape/
   isEnabled per design §2); attrs/vars mapping (liquid never
   carries the pointer; the `--jx-glass-interactive:1` var when
   flagged — literal name pinned); law-sheet source pins (base
   paint, POINTER-ONLY @supports branch, cascade order, the
   interactive MOTION block var-gated on --jx-glass-interactive:1
   AND its prefers-reduced-motion gate + the --jx-glass-solid-fill
   reduced-transparency ground,
   print/reduced-transparency, NO forced-colors), one-formula
   boundary, the MIGRATION CANARY source-scan (regex
   `jx-glass(?![-\w])`, comments stripped, self-test fixture both
   directions), computed-equivalence migration parity, tokens page
   zero-`jx-glass` pin, forced-colors consumer map pins.
3. `apps/www/test/liquid-glass-action.spec.ts` + mirror (jsdom):
   mount stamps + appends the 9-primitive chain at element size
   (exact primitive order + fx-derived scale/slope/saturate values)
   + pointer AFTER the svg exists + RO connected; the shape override
   beats border-radius; update rebuilds; destroy removes everything;
   the NO-CANVAS guard (jsdom: frost stands — NOTE jsdom rects are
   0×0 so the zero-box guard fires FIRST; mock getBoundingClientRect
   via vi.spyOn to reach the canvas guard path); zero-box guard.
4. verify-all chain green in the worktree; budgets pass;
   `verify:deps` green over the new edges (tabs/toast/toc → glass,
   glass → jixoai-theme).
5. Full www vitest suite (`--maxWorkers=50%` under load); failures
   triaged to the owning lane.

## Integration

1. `openspec validate --strict` green (change deltas).
2. Subagent group review rounds (remix standard — the Owner's
   2026-09-09 ruling: no codex; MainAgent + subagent reviewers)
   until acceptance; friction log folded back into skills.
3. Owner acceptance: the playground page walked in-browser (the
   approved prototype is the look-reference).
4. Archive the change; commit per ~/.codex/git-committer.md; push;
   worktree cleanup after the Owner's close-out word.
