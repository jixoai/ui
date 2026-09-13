# spinner-channel-api — tasks

## plugin face

- [ ] 1. `src/spinners/channel/` module: `types.ts` (SpinnerChannel +
      the id/prefix patterns), `define.ts` (the factory — shape +
      grammar + per-entry flat-name validation + the EMPTY-record
      named error, teaching errors naming both grammar forms),
      `normalize.ts` (set-level one-per-id + one-per-prefix, the
      smuggle gate re-running every factory check incl. non-string
      peerPackage/defaultsNote), `index.ts` barrel.
- [ ] 2. `types.ts` config surface: `SpinnersPluginOptions.channels?`
      (additive); document the merge law in the option's doc comment.
- [ ] 3. `resolve.ts`: `SPINNER_FULL_NAME_PATTERN` (flat ∪
      `prefix:name`) exported beside the unchanged
      `SPINNER_NAME_PATTERN`; `NormalizedSpinnersOptions.channels`
      carries validated instances (idempotent re-normalization —
      the vite double-normalize path); `mergeSources` folds defaults
      → channels (registration order, `prefix:name` keys) → flat
      record (last-writer on full names). Warn-mode drop labels
      carry the FULL name (`myco:evil`, never `evil`).
- [ ] 4. Pack factories: `magecdn({ pick? })` in
      `packs/magecdn.ts` (filter semantics — pack record key order
      wins, duplicate picks dedupe, unknown pick + empty pick =
      named errors), `sam({ pick? })` in `packs/svg-loaders.ts`
      (id `svg-loaders`, prefix `sam`). Records export unchanged.
- [ ] 5. `src/spinners/index.ts` re-exports `defineSpinnerChannel`
      + `SpinnerChannel` (+ the two patterns, the icons channel
      entry's export parity); pack sub-entries export their
      factories.

## tests

- [ ] 6. `test/spinners/resolve.test.ts`: factory grammar errors
      (both patterns taught); set-level uniqueness errors; the
      EMPTY channel record + EMPTY pick errors; forged-literal
      smuggle gate (illegal prefix/id, per-entry bad name,
      non-string peerPackage/defaultsNote — named failures); flat
      `myco:pulse` overriding a channel entry; merge order
      defaults → channels → flat; warn-mode labels use full names.
- [ ] 7. `test/spinners/packs.test.ts`: `magecdn()` / `sam()`
      channel shapes (id/prefix law); `pick` subset + unknown-pick +
      empty-pick errors + filter determinism (pack record order);
      both Records unchanged (94/12, existing assertions stay).
- [ ] 8. `test/spinners/generate.test.ts`: a namespaced artifact
      key round-trips `getSpin('myco:pulse')` and the SpinName
      union member is the quoted string (the §4 zero-component-
      change pin, generator level).
- [ ] 9. `test/spinners/vite-plugin.test.ts` + `umbrella.test.ts`:
      CONFIG-PARITY holds for a channels config on BOTH adapters
      (the double-normalize idempotence pin); the umbrella
      re-export surface includes the factory (frozen lists grow).

## dogfood + docs

- [ ] 10. The THREE-config CONFIG-PARITY law: `apps/www/
       vite.config.ts`, `registry/vite.config.ts`, and the root
       `gen:spins` script's SPINNERS_OPTIONS all gain the same
       `docs` channel (one authored inline loader) together;
       regenerate the committed artifacts.
- [ ] 11. Docs page svg-lane section: the channel snippet (custom
       channel + pack channel with pick) + the live
       `<Spin spinner="docs:…" />` demo row.
- [ ] 12. `registry.json`: spin/spin-set docs fields mention the
       channel lane where they describe the plugin face; byte-mirror
       sync stays green.
- [ ] 13. The jixoai.com v0.5 post: plugin references → 0.5.1, the
       channel API subsection, title de-emphasized to v0.5, version
       frontmatter 0.5.1, git-log window v0.4.0..v0.5.1.

## release

- [ ] 14. Versions: cli 0.5.1, plugin 0.5.1; `verify:all` green;
       commit, tag v0.5.1, push, watch the Release + Deploy
       workflows to green (trusted publishing is configured).
