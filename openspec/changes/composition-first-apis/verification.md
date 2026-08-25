# verification — composition-first-apis

## Gates (every batch lands green; integrator re-runs at close)

```
pnpm build                                  # payload parity (source ↔ built)
pnpm verify:mirror                          # source ↔ apps/www mirror manifest
pnpm --dir apps/www exec vitest run         # full suite green
node scripts/verify-hook-law.mjs            # data-jx-* / css-defined class law
node scripts/verify-composition-law.mjs --self-test  # four adversarial fixtures (anti-regression)
node scripts/verify-composition-law.mjs     # structural-prop ban (below)
openspec validate composition-first-apis --strict
```

## Per-family acceptance matrix

| family | behavioral locks (must survive verbatim) | new composition locks |
|---|---|---|
| steps | done-marker = button only when onclick; aria-current=step; future inert (never aria-disabled); connector CSS | bind:current; explicit `step` ordinals; Indicator/Title/Description/Separator parts (explicit-parts law) |
| timeline | pending hollow-dot + muted title paint; spine CSS | Dot/Connector/Content/Title/Time parts; children body |
| descriptions | dl semantics; columns/bordered grids | term prop + children value |
| breadcrumb | separators; aria-current page; collapse opt-in | List/Item/Link/Page/Separator/Ellipsis/Collapse parts; Link child() |
| pagination | window math parity with today's computation | pageRange helper unit tests (fixed name/signature: `pageRange(opts: { current: number; total: number; siblings?: number }): (number | 'ellipsis-start' | 'ellipsis-end')[]`); Link/Prev/Next/Ellipsis parts; child() |
| anchor | scrollspy aria-current; observer lifecycle | Item composition; DOM-derived targets |
| terminal-footer | © row chrome | Column composition |
| menubar | ←/→ glide; ↓/↑/Enter open; Home/End; panel menu contract; popover=manual dismissal; per-panel motion kernels | Item/Trigger/Panel/MenuItem parts; ID-derivation protocol; nested-walk scoping (closest) |
| navigation-menu | arrow walk; popovertarget wire; light dismiss; aria-expanded truth | Item/Trigger/Panel/Link parts; bare links; ID protocol; documented Viewport/Indicator divergences |
| toggle-group | single/multiple value law | Item composition |
| toc | scrollspy; outline auto-derive (TocOutlineConfig); SSR rail shell | List/Item/Link tree (no nested anchors) |
| hero-section | copy CTA default; em split styling | title/badges/terminal snippets |
| tour | spotlight; focus/Escape; step lifecycle | steps targets data; card(api incl. current step) snippet default rendering |
| alert-dialog | focus trap; Escape=cancel; scroll lock; bind:open seam | Trigger/Content/Title/Description/Actions/Action/Cancel parts |
| popconfirm | trigger children; confirm/cancel defaults | actions/content snippet overrides |
| command | dialog shell; combobox+activedescendant; IME-safe; hotkey opt-in; motion; disabled items never walk/activedescendant/fire-on-Enter | self-match items (predicate `match` contract); CSS :has group/empty; per-item onselect; hint snippet |
| terminal-header | bar chrome; mobile drawer; brand block | composed nav via Batch C machinery |

## Negative law (structural-prop ban)

Enforced by `scripts/verify-composition-law.mjs` (EXISTS, hardened through r8 —
TypeScript AST over every component's `Props` interfaces, all
`lang="ts"` script blocks): fails on banned-name array props
(object OR string elements), config trees (recursive `children[]`
fields), and keyed render-props (`Snippet<[…, number]>`), against
the in-script `ALLOWLIST` mirroring the declared exceptions
(select/combobox/cascader/tags-input/transfer/language-switcher
option domains, tour steps, tree-view nodes, terminal-card outputs,
code-card code, component-canvas files/output, scroll-virtual,
toast store). Probe status TODAY (synced to actual output):
15 violations = 13 structural props + 2 config-tree doubles
(terminal-header items, toc sections) — exactly the pre-redesign
kill list; the gate goes green when the change lands and stays green
after (CI gate at integrator close). Self-test (`node scripts/verify-composition-law.mjs --self-test`, executable, anti-regression):
union `A[] | B[]` (B recursive), `interface Props extends Base`,
readonly/ReadonlyArray wrappers, `interface Props extends Base` heritage, argument-less alias arrays (`type Items = A[] | B[]`), intersection Props (`Base & Local`), and recursive alias children (`type ChildList = Node[]`) all caught — all FOUR adversarial fixtures, run via the gate's `--self-test` line.

## Fixture classes (per the family context contract)

- **handle-registration families (menubar, navigation-menu):** SSR
  render (complete paint, no flash), keyed reorder (aria-controls
  still resolves the live panel), conditional insert/delete (no
  ghost handles).
- **DOM-delegated families (command, anchor, toc):** keyed reorder
  (walk order follows the new tree order), conditional insert/delete,
  empty-query/empty-group/empty-result CSS states.
- **explicit-ordinal families (steps):** unit checks of state
  derivation (step vs current) incl. duplicated/gapped ordinals —
  no registration exists to break.

## Existing-test migration (integrator)

- Audit every `apps/www/test/*.spec.ts` hit list for the 17 names
  (grep) before gates run; rewrite the old-API blocks (e.g.
  `batch5-antd-components.spec.ts` steps/timeline) to the family
  APIs. list-item.spec.ts untouched (exemplar family).

## Walkthrough (browser, ZCode built-in first)

`npm run site` → the 17 demo pages: interaction sweep per the
behavioral locks column; screenshots compared against the pre-change
baselines (`pnpm shots` captures; visual drift only where the API
redesign intentionally changes markup shape).
