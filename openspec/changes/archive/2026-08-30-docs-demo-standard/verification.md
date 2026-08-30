# Verification: docs-demo-standard

1. `npm run verify:all` green; `verify:docs-structure` reports ≥13
   fully compliant pages + committed backlog list.
2. Pilot page × {light, dark} × {comfortable, compact} screenshot
   matrix (4 shots into the audit shots dir) — demo surface re-themes,
   chrome stable.
3. Props tables render for the twelve pilot components with
   Prop/Type/Default filled from the single chosen source; spot-check
   `press-button` `variant` default and `input` `size` default against
   the source interface.
4. The demo-standard page is reachable from the docs learning path and
   the Docs dropdown.
