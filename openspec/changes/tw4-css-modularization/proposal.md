# tw4-css-modularization — Tailwind v4 as the styling base, modular CSS files, folder-per-component

> Orthogonal intents (3, Owner message 2026-08-24): (1) Tailwind v4
> becomes the CSS authoring standard to end classname pollution;
> (2) CSS files become modular — managed next to their capability, not
> scattered between Svelte files and global sheets — while staying
> shadcn-registry compatible; (3) components move from flat files to
> one-folder-per-component so multi-file splits and colocated CSS have
> a home.
>
> Original request (2026-08-24, Owner, verbatim):
> 1. 底层使用 tailwindcss v4 作为标准，重构我们的 css，否则目前的
>    css-classname 很容易引发不必要的互相污染
> 2. 模块化 css 文件，现在css 管理非常混乱，有的跟着 Svelte 文件走，
>    有的写在全局文件中，在升级成 tailwindcssv4 后，仍然有些不可避
>    免的 css 维护，我们需要将 css 文件也模块化管理（注意 shadcn
>    register 标准）
> 3. 组件现在是平铺处理，我建议每个组件一个文件夹，文件夹意味着
>    模块化管理，这样组件可以拆分成多个文件，css 也可以到文件夹中
>    管理。让代码的可用性更高
>
> Process ruling (Owner): ZCode drafts this change; Codex reviews,
> amends, and finalizes BEFORE any implementation. Development starts
> only on Owner approval. Review history: r1 Block (B1–B6) → r2
> Block (B5/B7/B8-r2) → r3 Block 8/10 (B9/B10) → r4 Block (B11/
> B12/B13) → r5 Block 8/10 (B14/B15) → **r6 Approve 9/10
> (review-r6.md — finalized; non-blocking suggestions folded in)**.
> **Owner approval 2026-08-24: implementation started (P0→P4);
> P3 scope ruled ONE-SHOT — all 72 styled components in this change,
> backed by the per-component baseline screenshot matrix at 0.3.**

## Why

The styling architecture works but concentrates three liabilities
(counts machine-verified 2026-08-24; see design.md Context):

1. **Specificity inversion blocks consumers — Tier-1 only.** Tier-1
   component paint lives in Svelte-scoped `<style>`
   (`.jx-kbd.svelte-xyz` — class + hash specificity): a consumer's
   utility override silently loses. In a shadcn registry — whose
   ecosystem assumes tailwind-class customization — that is an
   ergonomics defect. NOTE the boundary: jx-pure's Tier-2 Part A
   vocabulary is unlayered BY DESIGN (it must beat layered utilities);
   this change does not touch that cascade (B1 ruling). The fix targets
   only Tier-1-owned paint, which moves into the layer system where
   utilities legitimately win.
2. **CSS locality is broken.** Component styles live in three places at
   once: scoped inside `.svelte` files (72 of 79 registry `.svelte`
   files), companion global sheets imported through two different
   mechanisms (`toc.css` side-effect-imported by the component,
   `website-scaffold.css` imported by `+layout.svelte` — both living in
   `src/lib/` root, both also registry items), and site supplements in
   `app.css`. Cross-file class contracts (`.jx-input-lane` defined in
   jx-pure.css Part A, consumed by input/number-input) are real
   coupling with no structural home. Drift detection is partial: the
   lock hashes 6 items; parity tests cover source↔payload, not the
   mirror (see the mirror-sync baseline spec).
3. **Flat files cap decomposition.** 81 files sit flat in
   `registry/files/ui/` (79 `.svelte` + 2 css; mirror side 80 with one
   mirror-only site file). Anything a component needs beyond one file
   — sub-components, an index, a colocated stylesheet — has no place
   to live without name-mangling (`accordion-item.svelte` as a sibling
   instead of a folder member).

## What Changes

### 1. Tailwind v4 becomes the Tier-1 authoring standard

Tier-1 components are re-authored utility-first: paint moves from
scoped `<style>` into tailwind v4 utility classes in the markup,
composing the token-sheet `@theme` mappings that already exist.
Consumer contract: ui items REQUIRE the canonical entry setup —
Tailwind v4 with the jixoai token sheet wired into the consumer's
single CSS entry (`@import 'tailwindcss'` → jixoai theme import →
optional jx-pure) — declared in README/catalog docs, enforced by
`scripts/check-tw4-prereq.mjs` as far as the toolchain allows, and
carried by utility-authored items as a uniform
`@jixoai/jixoai-theme` registryDependency so the token sheet arrives
with the component (r4 B13: a "has tailwind" check alone would leave
`border-border`/`dark:*` unresolved). The frozen Tier-2 vocabulary and
jx-pure stay CSS by design and are consume-only (design.md D1).

### 2. CSS files become modular with a placement law

A single placement law replaces "wherever it landed":

- **utility-able paint** → tailwind utilities in markup (no css file);
- **CSS that utilities cannot express** (pseudo-element geometry,
  `@container`/`@keyframes`/scroll-driven/view-transition at-rules,
  press-physics custom properties) → a colocated
  `ui/<item>/<item>.css` owned by that component, loaded by a relative
  side-effect import from the component file, containing ONLY standard
  CSS (tokens, `@layer components` + `:where()`, at-rules) — NO
  `@utility` (which requires a Tailwind context a standalone css file
  does not have; r1 B2 ruling);
- **token sheets + element-default laws** → `theme/` unchanged;
- **site-only surfaces** → colocated with the route/module they serve.

### 3. Folder-per-component (registry:ui items)

`registry/files/ui/accordion/{accordion.svelte, accordion-item.svelte,
index.ts}` — one folder per `registry:ui` item's component-local files
(the 73 ui items out of 84 total; the 9 lib + 1 theme + 1 file items
keep their canonical roots); `index.ts` is a pure barrel whose default
export follows the manifest's `canonicalMainSource` (the item's main
file need not be name-identical — `toast` → `toast-viewport.svelte`;
r4 B11 ruling: the manifest is the single machine-readable source).
Shared `@lib` support files referenced by UI items (code-card →
shiki.ts, toast → toast-store.ts) stay canonical, ruled per-file by
the P0.3 mapping table (r2 B8). Registry targets move from
`@ui/accordion.svelte` to `@ui/accordion/accordion.svelte`.
**This is a deliberate breaking install/import-layout change**
(v1, pre-widespread-adoption window): `/r/<name>.json` URLs and the
namespace stay stable, but installed file paths change — old flat
imports (`$lib/ui/<name>.svelte` and flat sub-component imports)
break, and the new `$lib/ui/<name>` folder entry import is the
post-migration public surface. Real-consumer `shadcn add`
verification (accordion + toast fixtures) is a P0 gate (r1 B3, r2 B8,
r4 B12).

### 4. Mirror discipline becomes a full manifest

A complete source↔mirror manifest (normalized relative paths + sha256,
covering `ui/**`, `lib/**`, theme mappings, with an explicit
site-only/mirror-only exceptions inventory) replaces the 6-item lock;
the parity suite gains a separately-named source↔mirror test beside
the existing source↔payload test (r1 B4).

## Impact

- Every Tier-1 component file (registry + mirror): folders, index.ts,
  utility re-authoring where paint was scoped CSS.
- registry.json: file paths/targets for ~80 items; new `utils` item
  (npm `dependencies: clsx + tailwind-merge`) for the P3 `cn()` work.
- apps/www: import graph, lock → manifest, tests, fixtures,
  PAGE_STANDARDS references, site css placement, duplicate CSS imports
  removed.
- Specs: component-authoring, registry, mirror-sync modified; NEW
  css-architecture capability.
- NOT in scope: jx-pure.css/jixoai.css re-authoring or cascade changes
  (any Part A change requires its own change against the jx-pure
  living spec), visual redesign, the CLI, engine libs.

## Evaluation

Baseline specs (registry / mirror-sync / design-tokens /
component-authoring) were added 2026-08-24 while drafting this change —
the "write specs while learning" half of the Owner process ruling; the
mirror-sync baseline records the partial-lock reality honestly.
This change then carries the real deltas.
