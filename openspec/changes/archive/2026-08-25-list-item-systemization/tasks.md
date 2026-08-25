# tasks — list-item-systemization

> Gates answer review-design.md blockers 1/2/4/5/6 by name. The
> exact registry dependency set and install-closure proof live in
> design §7; the reactive time model in design §2.

- [x] 1. **Prelude bugfixes** — rest-forward HTML/ARIA on
  ItemTitle/ItemDescription (id bug: PlayRow's aria-labelledby points
  at no node today) and the other slot leaves; make Item class
  composition reactive (stale-initial warning); add
  `icons.chevronRight` to both icon files.
  *Gate: focused Item vitest green + fixture proves `id` reaches the
  title node + stale-class warning gone.*
- [x] 2. **Family core rewrite** — typed Symbol-key policy context
  (stable identity, getter-backed reactive fields — the §2 time model) +
  stamped resolution attributes; `ItemEnd` / `ItemAfter` /
  `ItemChevron` / `ItemDivider` (childless decorative) modules;
  end-based presence matrix (16 wide + narrow, self-contained combos);
  group `<section|div>` + `<ul data-slot=item-list>` DOM (frame keeps
  data-mode/inset/size/layout; **data-dividers stamped ONLY on the
  ul** — it owns adjacency) with mode/inset/label/dividers; terminal
  restyle per design §4; DELETE ItemSeparator + chevron props +
  `--card` fill. Canonical + mirrored byte-identical.
  *Gate: typecheck + css source guards (16 combos, selector
  inventory, no var(--card)) + rendered fixtures: standalone,
  nested, labeled, muted, inset, plain. Server-render assertions pin
  INITIAL stamps; client rerender assertions pin re-resolution on
  group mode/size/layout/dividers changes + nested-group shadowing;
  divider resolution matrix: default omitted→auto-on, muted=forced
  none even when `auto` supplied, plain omitted→none vs plain+explicit
  `auto`→on (raw prop optional, no language-level default), explicit
  ItemDivider always available.*
- [x] 3. **ItemField + five adapters** — ItemField (controlId/
  labelId/descriptionId/errorId/describedBy, labelMode for|text) and
  ItemToggle/ItemCheckbox/ItemRadio/ItemSelect/ItemInput; prop types
  via `ComponentProps<typeof Control>` + compile-time `Omit` reserved
  sets (design §3 table — `id`/`aria-labelledby`/`aria-describedby`
  centralized; per-control duplicate label/error/labelSide reserved);
  `$bindable` values; disabled forwarded to the control (the field carries no disabled prop).
  *Gate: vitest per adapter asserts the generated id lands on the
  NATIVE element, deterministic suffix IDs, description-then-error
  `aria-describedby` order, error → `aria-invalid="true"`,
  disabled/bindable forwarding, and no `any`/cast bypass. Both label
  modes: `for` renders `label[id][for=controlId]` with NO
  aria-labelledby on the control; `text` renders span + control
  carries aria-labelledby. Browser keyboard smoke: toggle/checkbox/
  radio (same-name arrows)/select (options snippet, popup)/input —
  native behavior unchanged.*
- [x] 4. **PlayRow bridge** — reimplement play-row.svelte on ItemField
  (generic control snippet), preserving the `jx-play-row` context for
  PlayToggle/PlaySelect/… callers (inventory of current consumers
  regenerated at execution time; counts drift under parallel work).
  *Gate: every playground route compiles + migrated rows' labelledby
  targets exist.*
- [x] 5. **Docs + blueprint rebuild** — 8 demo sections per design
  (standalone ladder, group modes, slot topology, media+narrow,
  settings section with adapters, ItemField escape hatch,
  selection/links, accordion + checkbox-group recipes); blueprint
  stops using explicit outline rows inside default groups; usage
  drawer shows the new barrel.
  *Gate: SSR + browser walkthrough at wide/narrow widths; no
  interactive descendants inside link rows.*
- [x] 6. **Test suite rewrite** — list-item.spec: resolution/stamping,
  nested groups, labeled groups, divider edge law, ItemField IDs,
  adapter forwarding, ItemMedia image variant renders `<img src alt>`
  (src/alt stay public), css source guard refresh. **Exhaustive matrix
  fixture (browser, not jsdom): iterate ALL 16 wide media×end×header×
  footer combinations asserting BOTH computed grid-template-columns
  AND grid-template-areas, every narrow end-present combination under
  the 30rem container, and `ItemEnd wrap="never"` NOT moving lanes;
  source-level combo count guard is a complement, not a substitute.**
  Paint gates: selected edge, focus ring, no double divider,
  terminal-token fills.
  *Gate: focused + full vitest green + the matrix fixture green.*
- [x] 7. **Registry + release sync** — registry.json file list +
  exact dependency set (design §7), catalog text, mirror-manifest
  regen, hashes. **Install-closure proof: extend
  `scripts/verify-shadcn-add.mjs` — publish the actual list-item
  payload to a local registry, `shadcn add @jixoai/list-item` in a
  clean Svelte consumer, import barrel + adapter, Vite build passes;
  assert all nineteen files at canonical targets, no
  `item-separator.svelte`, dependency graph resolves exactly once.**
  *Gate: registry validation + mirror verification + `pnpm
  build:site` (node scripts/build-site.mjs) completing with its
  embedded self-checks (docs.html/docs/components.html assertions,
  legacy shell set, md mirror, llms config) + clean generated diff.*
- [x] 8. **Codex implementation review round** — full diff + gates
  audit; fix residuals; archive with review records.
