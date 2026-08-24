# design — data-jx-hooks (r2, post Codex review-r1)

## The engine (B1/B2/B4 remediation — `scripts/jx-inventory.mjs`)

One importable scanner, three structured inputs, fail-closed output:

- **css-DEFINED set**: every authored css — `*.css` files AND every
  `.svelte` `<style>` block (source-sliced via AST offsets, comments
  stripped, `:where()`/`:is()` unwrapped, paren-aware comma split).
- **Template usage**: the Svelte AST — ONLY class `Attribute` value
  fragments (Text + expression, source-sliced) and `Class` directives.
  ids (`jx-bar-panel-${id}`), events (`onjx-*`), comments and prose
  are structurally invisible. Dual node-name compatibility
  (Element/RegularElement, MustacheTag/ExpressionTag).
- **Script usage**: `.ts/.mjs` + svelte instance/module — ONLY
  classList method args, query-API selector strings, and (svelte
  scripts) balanced-paren `cn(...)` spans. Any other jx- token in a
  quoted string → **handReview** (fail-closed; 159 current sites,
  mostly lib markup-builders like form-field.ts and test tone
  queries — enumerated for the codemod's hand pass).
- **Families vs parts** (the r1 D2 ambiguity, resolved): a family base
  comes ONLY from dynamic sites — template `` jx-<base>-${…} `` or
  literal `'jx-<base>-' +`. Literal part tokens (`jx-alert-title`) are
  STATIC hooks even when they share a family prefix. A family is
  pruned when every concrete selector `jx-<base>*` is css-defined.
- JSON CLI (`--json --root=<tree>`) emits the stable schema (engine
  version, counts, defined, hooks, families{variants,shapes,sites},
  handReview, references) — the COMMITTED authoritative manifest lives
  at `openspec/changes/data-jx-hooks/inventory.json`, regenerated from
  a clean `git worktree` at HEAD (the live tree may carry Owner WIP —
  the r2 review caught exactly that drift).
- Family evidence rule: zero css-defined `jx-<base>-*` selectors →
  the family survives; ≥1 → MIXED, surfaced in handReview for an
  explicit ruling (state families like sheet sides are css-defined;
  file-icon's kind variants are css-less hooks — the engine no longer
  guesses).

Clean-HEAD measurement (engine@2): see inventory.json counts. The r0
figures 529/232 are the HISTORICAL regex-baseline, not an acceptance
value.

## D1 — The mapping table (per SHAPE, r1 B3)

| shape (real source form) | example | becomes |
| --- | --- | --- |
| static hook in class string | `'jx-kbd …'` in cn/text | `data-jx-kbd` boolean attr |
| SAME-BASE MERGE (B6 law) | `'jx-alert jx-alert-${tone}'` | ONE attribute `data-jx-alert={tone}` — the bare base token is DROPPED (hasAttribute covers presence: `[data-jx-alert]` matches the valued form); the base token survives as a CLASS only when css-defined (then class + attribute coexist lawfully, e.g. file-icon) |
| svelte class directive | `class:jx-hue-play-on={x}` | `data-jx-hue-play-on={x ? '' : undefined}` |
| template family | `` `jx-alert-${tone}` `` | `data-jx-alert={tone}` (one valued attr) |
| concat family | `'jx-badge-' + tone` | `data-jx-badge={tone}` |
| conditional pair, same base | `cond ? 'jx-tgroup-on …' : '…'` | `data-jx-tgroup={cond ? 'on' : undefined}` when mechanical, else two booleans — codemod reports the site |
| `&&` guard | `cond && 'jx-foo-x'` | merge into the family/boolean above; reported |
| css-DEFINED anything | `.jx-toggle-track` in css | NEVER converted (priority law) |
| query reference | `'.jx-alert-default'` | `'[data-jx-alert="default"]'` |
| classList probe | `classList.add('jx-foo')` | `setAttribute('data-jx-foo','')` / removeAttribute; reads via `hasAttribute` |
| id / event / custom-prop | `jx-bar-panel-${id}`, `onjx-*`, `--jx-*` | untouched (structurally invisible) |

CSS-defined priority is applied BEFORE shape mapping (r1 D5-3
ruling): any token or family whose concrete selector is css-defined
stays a class — including docs-page demo classes defined in route
`<style>` blocks.

## D3 — File classes (six, each with parser + fail mode)

1. registry component `.svelte` — svelte AST (class attrs, Class
   directives, cn-spans in script); fail-closed on parse errors.
2. apps/www mirror `.svelte` — same parser; mirror byte-equality gate.
3. tests (`.spec.ts`, fixtures `.svelte`) — selector/classList rewrites
   from the reference map; unknown tokens fail the run.
4. docs routes (`routes/**/*.svelte`) — same as 3 plus demo markup
   class attributes.
5. runtime `.ts`/scripts `.mjs` — classList/selector rewrites; the 159
   handReview sites resolved by hand, each recorded in verification.
6. generated/blueprint scenes + README examples — selector-form only.

## D4 — Gates (`scripts/verify-hook-law.mjs`, committed)

- Regression fixtures every run: `jx-try-on` stays css-defined;
  `jx-bar-panel`/`jx-bar-trigger` id-families invisible; event names
  invisible.
- `--post`: zero css-less hooks, zero families, zero handReview
  ambiguities, zero `data-jx-*` names shadowing css-defined selectors
  (normalization: compare `jx-<name>` against the defined set and
  against family bases). Non-zero exit with file:line detail.
  **Proven failing on the pre-migration tree** (3 failures at r2).
- `--live <port>`: `[data-jx-kbd]` present + `.jx-kbd` absent; a
  variant valued attribute resolves.

## D5 — r1 rulings adopted

1. Plain attribute selectors, no compatibility classes.
2. One `data-jx-*` namespace; hook-only state names ride booleans;
   event protocol names (`onjx-*`, `jx-reset`) never migrate.
3. Docs demo classes defined in route `<style>` stay classes
   (CSS-defined priority); only zero-authored-css anchors convert.
