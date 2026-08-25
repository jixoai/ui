# tasks — docs restructure

- [x] 1. Codex design round: D1–D8 ruled (6.4/10, P0 found), design.md
      rewritten as r1 final rulings — cross-verified by ZCode
- [x] 2. `$lib/docs-route-model.ts` lands (from the prototype, rebuilt on
      the 73-canonical-page model) + locks: lib/theme/file never under
      Components nav; 73×ui once each; prev/next chain snapshot; related
      nearest-first (prev1/next1/prev2/next2); host hrefs resolve;
      source route + built canonical HTML + href uniqueness + legacy
      manifest all covered
- [x] 3. P0 route work: 58 one-to-one moves; form.html → 13 item pages +
      family hub (historical fragments preserved, not in inventory);
      scroll-area → scroll-area + scroll-virtual; registry.json
      meta.href rewritten; shadcn payload regen; catalog.spec updates
- [x] 4. svelte.config entries rebuilt from the route model; build-site
      assertions + llms sections config retargeted (old dirs excluded)
- [x] 5. D1 redirect layer: legacy-doc-routes.json + build-site emitter
      (meta refresh + canonical + noindex,follow + location.replace
      hash) + llms exclusion of components.html and components/**
- [x] 6. Top nav: Docs pill (Sections panel) + Components pill retarget +
      single-active-pill law (D8); prototype gate removed
- [x] 7. D2 sidebar: sections nav takes data-area="tree" (rail/bar forms,
      immersive laws); ComponentTreeNav deleted; three-breakpoint
      behavior verified
- [x] 8. Page relations: prev/next pager + related links (nearest-first)
      + breadcrumb on every component page
- [x] 9. Registry overview page (installable inventory table); planned
      pages NOT published (D4 — production nav omits them)
- [x] 10. D3 taxonomy: layer group inserted after navigation with the
       10-member table; feedback keeps 5; registry meta.group +
       CatalogGroupId + catalog locks + nav counts follow
- [x] 11. Migrate the verification chain: capture-baseline discovery,
       10 Playwright verify scripts, catalog.spec route reads,
       batch3:27, blueprint scene hrefs, homepage copy +
       PAGE_STANDARDS.md
- [x] 12. D8 view transitions (carousel 4 entries, .html-stripped) +
       scroll memory + hash ladder regression on new paths
- [x] 13. Prototype /prototype-docs deleted; SSR acceptance re-verified
       on the real tree (Codex env could not reach the dev server —
       local verification is the gate)
- [x] 14. Full chain green: build:site + tests + ego walkthrough
       (desktop/mobile, three sections, chains, pill panels, redirects)
- [x] 15. Codex review rounds (r2 7.2 → r3 8.3; blockers fixed each
       round) → verification.md → archive
- [x] 16. DEBT (r3 P2, non-blocking): carried EXPLICITLY as debt —
       svelte.config entries remain a hand list (the exact-set lock in
       test/docs-structure.spec.ts catches drift; the single-source
       generator from docs-route-model is future work under a new
       change); dist/md locks cover existence, not content parity.
       Final handover closeout (2026-08-25): the four css-less hooks
       the new docs surfaces introduced (jx-dsn-groups/-gcount,
       jx-count-btn, jx-inv-type) converted to data-jx-* per the live
       component-authoring law; docs-nav-filter test selector updated;
       mirror manifest classifies the new site-only files
       (docs-route-model, docs-pager+css, docs-sections-nav); gates:
       hook-law --post exit 0, vitest 347/347, mirror GREEN,
       build:site GREEN (83 pages / 86 payloads).
