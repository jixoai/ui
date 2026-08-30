# Tasks: docs-demo-standard

## 1. Decide the props source (design gate)

- [ ] 1.1 Spike, THREE candidates: (a) build-time Props extraction
      from `registry/files/ui/**/*.svelte` (Svelte 5
      `interface Props` + JSDoc + `$bindable()`), (b) per-item
      manifest, (c) keep hand-written page arrays as source, lint-
      checked against the interface. Pick ONE; record in design.md.
      (Facts: all 79 pages already render tables from hand-written
      arrays; the siteOnly `apps/www/src/lib/ui/props-table/`
      component already exists.)

## 2. The standard, written

- [ ] 2.1 `docs/demo-standard.html`: the skeleton, the ability-naming
      grammar, the variant suffix convention, worked examples —
      linked into the docs learning path + Docs dropdown.

## 3. Canvas upgrades (registry-side change)

- [ ] 3.1 DELEGATED to `2026-08-30-canvas-floor-lab` (Owner pick 乙,
      2026-08-30): the toggles land with the floor rework there — do
      not implement twice. This change consumes the toggles' contract
      in its skeleton compliance work.
- [ ] 3.2 Page-header registry-URL copy affordance (reuse
      copy-icon-button law).

## 4. Props truth + the pilot twelve

- [ ] 4.1 Extend the EXISTING siteOnly
      `apps/www/src/lib/ui/props-table/` to render from the chosen
      source; keep the page-array shape as a fallback prop so
      non-migrated pages keep working.
- [ ] 4.2 Migrate the twelve pilot pages (press-button, input,
      select, dialog, table, date-picker, toast, popover, combobox,
      checkbox, badge, card-grid) with a diff check against today's
      rendered tables (no content drift).

## 5. Skeleton compliance, staged adoption

- [ ] 5.1 Extend `verify:docs-structure` with the skeleton contract in
      STAGED mode: a committed machine-readable scope file names the
      pilot routes (the twelve + site-polish's rebuilt pages);
      in-scope violations hard-fail, out-of-scope routes warn and
      print the backlog. The scope file records the successor change
      that flips the hard gate global.
- [ ] 5.2 Bring the pilot routes to full compliance; commit the scope
      file + backlog as the lint's data (not prose).

## Verification

- `npm run verify:all` green; the lint prints the compliant count
  (≥13 pages full compliance) and the backlog.
- Pilot pages visually checked in both themes × both densities via the
  new stage toggles (screenshots into the audit folder).
- `npx jixoai-ui add press-button` URL copy yields the exact registry
  item URL.
