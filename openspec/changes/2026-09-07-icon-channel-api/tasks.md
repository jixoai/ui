# tasks — icon-channel-api

## A. The channel base + built-in rewrite (packages/vite-plugin)

- [ ] A1: `src/icons/library/channel/` — the `IconChannel` contract +
      `defineIconChannel` (prefix grammar, reserved `lucide`, id/prefix
      uniqueness named errors) + the base sub-entry module
- [ ] A2: rewrite the four built-ins as `defineIconChannel` calls —
      md/ph/rx factories (options preserved verbatim) + the lucide
      channel instance (IconNode-lane resolution, default-registered,
      scannable); presets/ dissolves into channels/
- [ ] A3: config surface — `library.channels` replaces `library.presets`
      (normalize + the uniqueness law over channels; enabled prefixes =
      lucide ∪ channels'); resolve/scan/generate/template emission all
      read the one channel set (no lucide special cases)
- [ ] A4: the sub-entries — exports map (`./icons/channel`,
      `./icons/lucide`, `./icons/md`, `./icons/ph`, `./icons/rx`),
      tsdown per-entry build, per-entry dist purity gates in
      packaging.test.ts; the `./icons` barrel re-exports for type imports

## B. Package identity corrections

- [ ] B1: `@jixoai/vite-plugin` → `@jixoai/ui-vite-plugin` — package.json
      + every living reference (registry vite.config + registry.json
      strings, apps/www config + package.json, scripts/
      verify-shadcn-add.mjs templates + expectations, build-site, pin.ts,
      client.d.ts, internal module comments that name the package)
- [ ] B2: `@jixoai/css-laws` → `@jixoai/ui-css-laws` — same treatment
      (package.json, workspace consumers, theme-file comments)
- [ ] B3: file: links re-established (the npm link-layer trap), lockfile
      receipts regenerated, packaging test name assertions updated;
      archived openspec docs explicitly untouched (spot-check)

## C. Dogfood + docs

- [ ] C1: apps/www + registry vite.config.ts (byte-identity law) import
      md/ph/rx from sub-entries, `channels: […]`; gen-icon-set.mjs
      mirrors; regenerate the artifact (a `lucide:` literal joins the
      docs page so all three lanes show in one grid) + mirror + manifest
- [ ] C2: icons page — channel vocabulary, the define-your-own-channel
      section (real `defineIconChannel` myco: example), sub-entry import
      table, gallery prose; icons-page.spec locks updated (43 → new
      count, channel wording)
- [ ] C3: full gate battery green (verify:all incl. budgets re-record
      with rationale if B-consumer moves; vite-plugin suite; www suites)

## D. Closure

- [ ] D1: codex doc-review rounds (PASS gate) → implementation streams
      → codex diff review → archive → push
