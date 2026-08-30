# Tasks: site-polish

## 1. No literal `undefined` in demo prose (F4)

- [x] 1.1 date-picker "review (locale display)" demo: empty value renders
      `—`. Fix the interpolation in the page snippet.
- [x] 1.2 Sweep: grep every docs page for value interpolations of
      `$bindable` props; any that can print `undefined`/`null` get the
      em-dash fallback (expected hits: date-picker, color-picker,
      combobox, tags-input, file-input).
- [x] 1.3 Guard: `verify-docs-structure.mjs` scans built pages for the
      literal strings `>undefined<` / `>null<` in rendered text and
      fails.

## 2. Dev server serves the registry (F5)

- [x] 2.1 `scripts/dev-site.mjs` (or a vite middleware in
      `apps/www/vite.config.ts` dev-only): map `/r/<name>.json` (and
      `/r/registry.json`) onto repo-root `public/r/` when not found in
      the www asset space. Read-only; never writes.
- [x] 2.2 Probe: with dev running,
      `curl localhost:5201/r/registry.json` → 200 JSON;
      `/r/press-button.json` → 200; footer/docs-nav links resolve.

## 3. Toast queue honesty (F6)

- [x] 3.1 Registry `toast-viewport.svelte`: render a `+N queued` tail
      chip when the store holds more toasts than `maxVisible` (pure
      paint, no behavior change); mirror re-record
      (`gen-mirror-manifest`), `verify:mirror` green.
- [x] 3.2 Toast page burst demo: titles become "Deployed #1..#5" with
      real descriptions; the queued-tail chip demonstrates queueing.
- [x] 3.3 Docs: the toast page copy names the indicator.

## 4. Orphan pages get attribution (F7)

- [x] 4.1 `/parity.html`: standard site chrome (header/footer) + a
      one-paragraph "what this page is" (native parity verification
      surface) + `noindex` meta.
- [x] 4.2 `/blueprints.html` and `/probe-folder-css`: confirm `noindex`
      meta present (blueprints already declared internal in
      svelte.config — verify the meta actually ships).

## 5. Blueprint tiles (F8)

- [x] 5.1 `scripts/build-blueprints.mjs`: fix the toc-engine scene
      overlap (label collision) and the list-item scene right-edge clip
      (canvas width / measure-then-fit).
- [~] 5.2 (PARTIAL — probe shipped report-only with --strict switch; the two target scenes are clean but 20 legacy scenes still overflow; strict wiring is a recorded followup) Extend the blueprint check to fail when a text run exceeds
      its scene box (overflow probe in the generated SVG/satori output).

## 6. Docs page structure lint (F10 + F12)

- [x] 6.1 `scripts/verify-docs-structure.mjs`: for every
      `/docs/components/<name>.html` — exactly ONE `Usage` H2; a
      PLAYGROUND section for components with interactive demos; no
      literal `undefined`; page `title` present and Title-Case.
      Heading-leakage rule is SCOPED to consumer-authored demo
      content: h1–h3 INSIDE the canvas's demo-content scope (a
      `data-doc-demo-content` wrapper inside the stage, which
      ComponentCanvas itself renders) fail; ComponentCanvas's OWN
      structural chrome (its `h2` title, `h3` Playground) is exempt
      — the wrapper, not the whole demo region, is the lint target.
- [x] 6.2 dialog/sheet: RESOLVED AS MISDIAGNOSIS — the "gutted pages"
      were an a11y-table keyed-each hydration collapse (duplicate keys);
      fixing the key restored the full skeleton that was always there.
- [x] 6.3 De-duplicate the 18 pages' second Usage section; add the
      standard opening to the 8 flagged pages; fix the 5 lowercase
      titles + toc's case mix; convert leaked demo headings to styled
      non-heading text.
- [x] 6.4 Avatar demo srcs: replace the four `/favicon.png` demo srcs
      with real images (or `/icon.svg`); keep the deliberately-missing
      error-state demo src; probe every rendered img
      `naturalWidth > 0` except the error-state one.
- [x] 6.5 Carousel playground: manually verify focusability (audit
      could not detect focusable elements); fix or record.
- [x] 6.6 Wire into `verify:all`.

## Sequencing

Two sub-batches for parallel development:
- **B1 (mechanical)**: tasks 1, 2, 4, 5 + the lint script (6.1) +
  title/Usage-dedup/opening fixes (6.3) — no content authoring.
- **B2 (content)**: dialog/sheet page rebuilds (6.2), toast viewport
  + burst demo rewrite (3.x), heading-leakage conversion (6.3's leak
  class), avatar srcs (6.4), carousel check (6.5).
B lands BEFORE the other docs-page changes (E/F/G/H) so their pages
are built on the fixed template; B owns `verify-docs-structure.mjs`
first, C extends it later. `public/r/` is NOT in git — B's dev-serving
probe requires one `shadcn build` first.

## Verification

- `npm run verify:all` green (incl. the new docs-structure gate).
- Dev probe (2.2) green; production build path untouched
  (`build-site.mjs` still the only `/r/` writer).
- Built toast page shows the `+N queued` chip after a burst; visible
  toasts carry honest titles.
- `grep '>undefined<' apps/www/dist` → 0 hits on docs pages.
- Blueprint gallery re-render: no overlapping text runs (visual check
  + the 5.2 probe).
