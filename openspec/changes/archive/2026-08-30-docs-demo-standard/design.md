# Design: docs-demo-standard

## 1. The props source verdict (task 1.1)

**PICK: (a) build-time extraction — the canvas-schema-pipeline meta
(`component-metadata-gen.mjs` → `apps/www/src/lib/meta/<name>.meta.ts`),
consumed by PropsTable — with a page-level DOCS CURATION LAYER on top.
(b) and (c) are rejected.**

### The three candidates, decided

- **(a) build-time extraction — EXISTS at HEAD** (canvas-schema-pipeline,
  commit 2dce78d): `.svelte` → TS+svelte AST → two-zone `.meta.ts`
  (GENERATED block with props kinds/defaults + hooks; preserved
  hand-authored annotations zone), `--check` drift gate already wired
  into `verify:meta`. Spiking it against the seven pilot pages of this
  batch (select, popover, checkbox, card-grid, date-picker, toast,
  combobox — meta files generated for all seven) shows:
  - name/default truth is exact where the source declares it
    (`placeholder = 'Select...'`, `variant` enums with defaults,
    `maxVisible = 4`, `min = '320px'` — all byte-equal to today's
    hand-written cells);
  - opaque `typeText` IS the legacy Type column for most rows
    (`SelectOption[]`, `ToastStore`, `Density`, `number | string`);
  - the drift gate is the piece no other candidate has: when the
    interface changes, the GENERATED zone changes or CI fails. That is
    precisely the "79 copies of the same truth" death this change
  - ceilings found in the spike (all confirmed live):
    no JSDoc extraction (prose lives in curation), no `$bindable()`
    flag, no TS `?` optionality (so `required` cannot be derived
    honestly), `id = autoId`-style defaults surface as no-default,
    generic conditional types degrade to their raw source text
    (combobox `value: Multiple extends true ? string[] : string`),
    and date-picker's `type Props = SingleTimeProps | RangeOnlyProps`
    union alias falls to initializer inference (mostly `unknown`).
- **(b) per-item manifest** — rejected: a hand-maintained manifest per
  component is today's hand-written array moved to another file; it
  needs the SAME lint against the interface to not drift, at which
  point the lint is the value and the manifest is (a) with extra steps.
- **(c) keep page arrays, lint them against the interface** — rejected
  as the ENDING, kept as the TRANSITION: 72 of 79 pages still render
  the legacy `props` array through the same component (the fallback
  prop, task 4.1). A lint that reconciles 79 page arrays forever
  institutionalizes the copies instead of retiring them.

### The shape that makes (a) work: GENERATED spine + docs curation

`PropsTable` gains a `meta` prop (the `.meta.ts` export). Rows come
from the GENERATED zone: name, kind/typeText, default, in declaration
order. A `docs` prop carries the curation layer per prop:

- `description` — the prose column (until JSDoc extraction exists);
- `type` / `default` — presentation corrections where the extraction
  ceiling bites (date-picker's union alias, combobox's conditional
  generic, display defaults like `density`'s `inherited` / `id`'s
  `auto` which are runtime-resolved, not literals);
- `required` — ASSERTED, never guessed (the extractor does not emit
  `?` optionality; "no default ⇒ required" is wrong for optional
  props like `presets`);
- `bindable` — the `$bindable()` seam, until the extractor emits it;
- `hide` — rows the table omits by curation (`class`, `...rest`
  spread rows, internal `'data-density'`, heritage passthrough);
- `extra` — non-prop API rows (popover's `bind:this` handle).

The curation layer cannot silently contradict the spine: the vitest
diff lock (`test/props-table-meta-drift.spec.ts`) pins, per pilot
page, the exact set of override fields in play, so a future interface
change that needs a NEW correction forces a conscious snapshot edit.
This is the same lock pattern as the taxonomy snapshot in
`test/docs-structure.spec.ts`.

### Extractor gaps to retire curation over time (canvas-schema-pipeline follow-ups — NOT this batch)

1. JSDoc `/** … */` on Props members → `description` (retires most
   curation prose; candidate (a) was specified "Props interfaces +
   JSDoc", the landed extractor does not read JSDoc yet);
2. `$bindable()` initializer → a `bindable` flag;
3. TS `?` optionality → `required` derivation;
4. alias-to-union `type Props = A | B` → merged member resolution
   (date-picker today infers from initializers);
5. conditional/generic type pretty text (combobox).

## 2. Staged skeleton lint (task 5.1/5.2)

`scripts/verify-docs-structure.mjs` keeps its existing global rules
(title, single Usage H2, PLAYGROUND presence, literal undefined/null,
demo-scope headings) and ADDS the skeleton contract in STAGED mode:

- `scripts/docs-skeleton-scope.json` — the committed machine-readable
  scope: `inScope` (this batch's seven pilot routes — the pilot twelve
  minus the five owned by parallel batches), `backlog` (the five
  parallel-batch pilot pages with their owning change), and the
  `successor` field naming the change that flips the hard gate global.
- in-scope route violating the skeleton → HARD FAIL naming page +
  missing section; out-of-scope route → WARN, counted into the printed
  backlog, gate stays green.
- skeleton checks (built HTML, raw-index order):
  exactly one h1 (Intro) < `data-doc-install` section whose text
  carries `npx jixoai-ui add <name>` < the single Usage H2 < first
  demo surface (`data-jx-canvas-stage` / `data-doc-demo-content`) <
  `data-doc-props-table` (API) < `data-doc-see-also` section holding
  ≥1 link to another `/docs/components/*.html` page. Demo titles must
  not be numbered ("demo 1" / "example 2") — the ability grammar's
  mechanical subset; the semantic half ("one phrase, one capability")
  is review law, stated on the demo-standard page.
- The seven pilot pages are brought to compliance in this batch:
  Usage moves above the demos (the skeleton's order is law),
  Install + See Also sections land, See Also links derive from
  `componentContext(name).related` (data, not hand lists).

## 3. Page-header registry-URL copy (task 3.2)

The Install section carries BOTH copy affordances: the CLI command
(`npx jixoai-ui add <name>`) and the registry item URL
(`https://ui.jixoai.com/r/<name>.json`) via the copy-command /
copy-icon-button laws. The literal page-HEADER placement rides task
3.1's delegated canvas-floor rework (the header strip is canvas
chrome); this batch's pages expose the affordance in page-owned
surface.

## 4. Deviations from the change text (recorded, not silent)

- **verify:all wiring** — `verify-all.mjs` is shared (report-only);
  this batch's lint changes are inside verify-docs-structure.mjs
  itself, which verify:all already invokes.
- **learning-path + Docs dropdown link, prerender entry** — the
  demo-standard page is built here; its wiring touches shared files
  (`docs-route-model.ts`, `svelte.config.js`, the nav spec test) and
  is reported to the integrator (see the batch report).
- **Playwright screenshot matrix** — per batch constraint, browser
  verification is replaced by vitest + @testing-library/svelte (jsdom)
  assertions; the theme × density visual matrix is listed as a
  pending-manual item in the batch report.
- **date-picker `locale`** — the hand-written table predates the
  `locale` prop (stale; exactly the drift this change kills). The
  meta-sourced render ADDS the locale row; the diff lock allows it as
  the single intentional content addition and pins it.
