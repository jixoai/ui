# Tasks: registry-install-integrity

## 1. Kill the ghost

- [ ] 1.1 Remove `@jixoai/reveal` from `hero-section.registryDependencies`
      in `registry.json`; re-run `shadcn build`; confirm
      `public/r/hero-section.json` no longer references it.
- [ ] 1.2 Homepage: delete the stale `reveal` catalog row; reword every
      homepage mention of a reveal *action* (Law-03 paragraph, hero
      quick-start) to the `data-reveal` + CSS law.
- [ ] 1.3 Grep sweep: no other file (docs pages, cli, skills) still
      instructs `npx jixoai-ui add reveal` or imports `@jixoai/reveal`.

## 2. The dependency gate

- [ ] 2.1 Author `scripts/verify-deps.mjs` — ownership-resolved, not
      raw-matched: (a) every declared `@jixoai/*` edge in any item's
      registryDependencies names an existing item; (b) every cross-item
      import (each file owned via `registry.json` `files[].target`)
      has a declared edge — same-item/barrel/shared-lib imports are
      not cross-item; (c) a declared-but-unimported edge is a FAIL
      unless it is a structured install prerequisite (the theme:
      every registry:ui item declares `@jixoai/jixoai-theme`). Four
      fixtures prove the matrix: dangling edge FAIL, undeclared
      target-resolved import FAIL, declared theme prerequisite PASS,
      dead non-prerequisite dependency FAIL.
- [ ] 2.2 Wire `verify:deps` into `package.json` and `verify-all.mjs`
      (order: after `verify:mirror`). [integrator]
- [ ] 2.3 Self-test: the four fixtures above as its unit test.

## 2b. The clean-install proof harness

- [ ] 2b.1 Make `scripts/verify-shadcn-add.mjs` data-driven: each case
      starts a FRESH Vite consumer, installs from the generated
      `public/r/` payload, asserts the canonical target files, imports
      the canonical entry, and BUILDS. Cases are declared as data
      (item list), so later changes (chart, input-group,
      button-group, patterns) register themselves without editing the
      harness.
- [ ] 2b.2 Add the hero-section case: resolves AND requests no
      `@jixoai/reveal` dependency; canonical entry imports and builds.
- [ ] 2b.3 `verify:all` executes the cases. [integrator]

## 3. The domain rides the artifact

- [ ] 3.1 `build-site.mjs`: write `public/CNAME` (`ui.jixoai.com`) in
      the prepare phase (after empty, before dist copy); keep the
      existing "assert index.html + r/registry.json" step, extended to
      assert CNAME exists.
- [ ] 3.2 `deploy.yml`: add a `smoke` job after the publish job —
      curl `https://ui.jixoai.com/`, `/r/registry.json`,
      `/r/press-button.json`; any non-200 fails with a remediation
      hint (Pages settings → custom domain; Owner DNS).
- [ ] 3.3 OWNER ACTION (cannot be done from the repo): re-attach
      `ui.jixoai.com` in GitHub Pages settings (or
      `gh api repos/jixoai/ui/pages -X PUT -f cname=ui.jixoai.com`).
      Document in the change PR description.

## 4. Homepage catalog truth (featured projection)

- [ ] 4.1 `catalog.ts` exports a `featured` projection: an explicit
      item-ID list validated against the catalog (duplicate/unknown ID
      throws at build time); `+page.svelte` consumes it and DELETES
      its page-local row list.
- [ ] 4.2 The "N items" heading renders the registry TOTAL from the
      catalog and is labeled as the registry total (the featured rows
      are a curated selection; the two counts are never equated).

## 5. Comment drift rider

- [ ] 5.1 Fix the `--brand-hue` comment on BOTH mirror sides
      (`registry/files/theme/jixoai.css:34` +
      `apps/www/src/lib/jixoai.css:34`): 330 is the pre-JS flash
      value; the live hue is wall-clock driven by hue-runtime.
      Re-run `gen-mirror-manifest` so `verify:mirror` stays green.

## Verification

- `npm run verify:all` green (incl. the new `verify:deps` with its
  four fixtures and the data-driven clean-install cases).
- Dependency closure probe: zero dangling refs (baseline before fix:
  1, `hero-section → @jixoai/reveal`); the theme prerequisite PASSes.
- Clean-install probe: hero-section case installs from `public/r/`
  into a fresh consumer, imports the canonical entry, and BUILDS; the
  case asserts `@jixoai/reveal` is NOT requested.
- Homepage: featured projection drives the rows (each featured ID
  resolves exactly once); heading shows the registry total, labeled;
  no "reveal" row; grep finds no "add reveal" anywhere.
- CI smoke job green after the Owner re-attaches the domain
  (blocker documented if DNS lag).
