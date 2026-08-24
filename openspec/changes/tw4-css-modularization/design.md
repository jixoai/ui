# design — tw4-css-modularization

> Decision-first document. Each D# carries the trade-off the Owner
> asked to have debated with Codex before implementation. r1 review
> (review-r1.md) ruled on the open questions; rulings are folded in
> and marked [r1].

## Context (machine-verified 2026-08-24)

```
registry/files/ui/   81 files = 79 .svelte (72 carry scoped <style>) + toc.css + website-scaffold.css
apps/www/src/lib/ui/ 80 files (mirror-only: component-tree-nav.svelte — site chrome, not an item)
registry/files/theme/  jixoai.css 718 ℓ · jx-pure.css 2029 ℓ   (Tier-0/-2 — STAY CSS, consume-only)
site css              app.css 229 ℓ (tailwind entry + supplements) · lib/toc.css · lib/website-scaffold.css
CSS load mechanisms   toc.css: side-effect import inside toc.svelte · website-scaffold.css: +layout.svelte import
tailwind              v4 installed (@tailwindcss/vite); ONE site entry fan-in context: app.css's @import 'tailwindcss'
                      (jixoai.css itself carries @custom-variant/@theme/@layer base — effective for consumers only
                      once their entry imports it)
drift detection       jxoai-ui.lock hashes 6 items · parity test covers source↔public/r payload only (not the mirror)
npm-dep precedent     registry items declare npm deps via item `dependencies` (shiki, @tanstack/svelte-virtual)
```

## D1 — Tailwind-ification boundary [r1: B1 ruling folded in]

**Decision.** Tier-1 component paint is re-authored as tailwind v4
utilities composed in markup. Exemptions, each with a fixed home:

1. **Tier-2 frozen vocabulary + jx-pure element-default laws** —
   consume-only. `.jx-field/.jx-label/.jx-error/.jx-input/
   .jx-field-shell/.jx-input-lane/.jx-range/.jx-color-field/.jx-color`
   and everything in jx-pure Parts A–D MUST NOT be copied, moved,
   redefined, or re-wrapped by this change. Part A is unlayered BY
   DESIGN (it beats layered utilities); any change to that cascade
   requires its own change against the jx-pure living spec.
2. **Token sheets** (jixoai.css) — the utilities' raw material.
3. **Selector geometry utilities cannot express** (pseudo-element
   construction, `@container` size math, `@keyframes`, scroll-driven /
   view-transition at-rules, cqw-shadow techniques) → the component
   folder's `<item>.css`, inside `@layer components` + `:where()`.

**Trade-off.** Consumers gain the standard shadcn customization surface
(utilities beat Tier-1-owned paint); the cost is a documented Tailwind
v4 prerequisite for ui items (theme/engine/jx-pure items stay
framework-free). The utilities-win law is scoped to Tier-1-owned css
ONLY — the Tier-2 exception is normative (see the css-architecture
delta).

**Rejected.** CSS modules (hashing breaks the frozen class contract).
Keeping scoped `<style>` for paint (keeps the silent-override defect).

## D2 — The placement law + folder-css processing contract [r1: B2 ruling]

```
paint expressible as utilities ──────────▶ utilities in markup
CSS utilities cannot express ────────────▶ ui/<item>/<item>.css  (standard CSS only)
tokens + element-default laws ───────────▶ theme/ (jixoai.css, jx-pure.css) — consume-only
site-only surface css ───────────────────▶ colocated: routes/<page>/+page.css | site lib module css
tailwind entry + import order ───────────▶ app.css keeps the global fan-in/context block after the
                                           site-only supplements move out (r4 B10 ruling)
```

Folder css contract (fixed, verified by P0.1 before any move):

- Loaded by a RELATIVE side-effect import from the component file
  (`import './toc.css'`) — the item is self-contained; the site's
  `+layout.svelte`/`$lib/...` manual imports are REMOVED (one load
  path, loaded once).
- Contains ONLY standard CSS: token custom properties,
  `@layer components` + `:where()`, the at-rules D1 exempts.
  `@utility` is FORBIDDEN in folder css this change —
  `@tailwindcss/vite` builds a compiler per css request; a standalone
  css file without its own Tailwind import does not inherit app.css's
  context, so `@utility` there does not expand. If a custom utility is
  ever needed it goes into the single Tailwind entry/theme item with
  its own compiled-output probe.
- Scoped-style migration MUST preserve selector boundaries explicitly:
  Svelte `:global(...)` child selectors (e.g. accordion's
  `.jx-accordion :global(> * + *)`), pseudo-elements, `@supports`,
  media queries are re-expressed deliberately, not pattern-copied.
- P0.1 verifies (with fixtures): vite output correctness, layer order,
  pseudo/`@container` survival, single-load, and computed
  `:where()`-vs-utility specificity in a browser.

## D3 — Folder anatomy + consumer proof [r1: B3/D5.1/D5.4; r2: B8 scope ruling]

```
registry/files/ui/accordion/                    registry/files/ui/toast/
  accordion.svelte        ← canonical main         toast-viewport.svelte  ← canonical main (r3 B9:
  accordion-item.svelte   ← sub-component            item name ≠ main file name)
  accordion.css           ← only if D1-exempt       (toast-store.ts stays @lib)
  index.ts                ← pure barrel             index.ts
```

- **Canonical main rule (r3 B9)**: the folder's main file is the
  item's component ENTRY, which NEED NOT be name-identical to the
  item (`toast` → `toast-viewport.svelte`, target
  `@ui/toast/toast-viewport.svelte`, index default export points at
  it).

- **Scope (r2 B8)**: the folder law covers `registry:ui` items'
  COMPONENT-LOCAL files only (main + sub-components + index +
  companion css). Item type census (verified): 84 items = 73
  `registry:ui` + 9 `registry:lib` + 1 `registry:theme` + 1
  `registry:file` — lib/theme/file items keep canonical roots and
  targets. Shared `@lib` support files referenced by UI items
  (`code-card` → `lib/shiki.ts`, `toast` → `lib/toast-store.ts`) stay
  at their canonical targets; the P0.3 mapping table rules each one
  (owner / target / move-vs-dependency).
- Registry item `files[]`: one entry per file,
  `target: "@ui/accordion/accordion.svelte"` etc.; `index.ts` and
  `<item>.css` ship as `registry:file` — item css lives in the SAME
  folder as the item (no `@lib/toc.css` legacy alias survives P1).
- ALL multi-file items fold their siblings in — enumerated by script
  (accordion 2, dropdown-menu, tabs 4, …), not by example.
- `index.ts` MUST NOT add logic, defaults, or auto-exported private
  `Props` (r1 D5.1).
- **Consumer install is a P0 gate, not an inference**: TWO real
  scratch-consumer `shadcn add` fixtures — the multi-file accordion,
  and toast (non-identical main + item-shipped canonical `@lib`
  file) — assert folder landing, `$lib/ui/<name>` index resolution,
  css load, relative imports, and `tsc`; a NAMED code-card chain case
  joins the P1 full gate (r5 B15). `npm run build` emitting payloads
  proves nothing about install.
- **Breaking-change statement**: `/r/<name>.json` URLs and the
  `@jixoai` namespace stay stable; installed file layout and import
  paths change. This is a deliberate v1 breaking layout change in the
  pre-adoption window (r1 B3: "no consumer breakage" was wrong).
- Category dirs `ui/ lib/ theme/` stay as-is (r1 D5.4: folder = item
  boundary, not a new taxonomy).

## D4 — Phased migration; two acceptance axes [r1: B6; r2: B7 option 1]

Phases P0–P4 (numbering unified with tasks.md):

```
P0  pipeline probes (folder-css contract · TWO shadcn add fixtures · inventory + mapping table + drift block · screenshots)
P1  mechanical moves to folder shape — companion css moves IN THE SAME BATCH as its item
    (physical move + relative import rewrite + target update + mirror/manifest): every item is a
    self-consistent folder at every commit; zero visual delta
P2  cascade + selector rewrite (layer law lands; TWO acceptance axes + compiled-context probe)
    app.css boundary (r3 B10): keeps sole @import 'tailwindcss' + theme imports + ALL global
    @theme/@custom-variant/@layer base + import order; ONLY site-only non-compiler-context
    selectors move to named site module css
P3  utility re-authoring  (P3a form family gates → P3b remainder; cn() only on migrated slots)
P4  registry/docs re-index + spec deltas + final review
```

Acceptance axes (P2/P3): (a) EXISTING docs visual/behavior parity
(screenshot diff + verify scripts); (b) the NEW consumer-override
contract (utilities beat Tier-1 paint). P1/P2 sequencing (r2 B7,
option 1 chosen): the companion-css move belongs to P1 so no
transitional state exists where targets point at future folders while
sources/imports still use legacy paths; P2 is then purely the
layer/selector/cascade change.

## D5 — Resolved decision log (r1 rulings)

1. **index.ts** — pure barrel; stable public types only; ships as
   `registry:file`; covered by the consumer TS fixture. [adopted D3]
2. **folder css / @tailwindcss/vite** — relative side-effect import;
   standard CSS only; `@utility` forbidden this change. [adopted D2]
3. **cn()** — adopted, P3-only, scoped by the component-authoring
   delta's WHEN clause: a component's public class slots adopt `cn()`
   WHEN that component is migrated to utility-authored paint; P0–P2
   transitional components carry no cn() obligation. Ships as a NEW
   `utils` registry item with npm
   `dependencies: ["clsx", "tailwind-merge"]` (the field precedent is
   shiki/@tanstack — npm deps are item `dependencies`, NOT
   `registryDependencies`); components depend via
   `registryDependencies: ["@jixoai/utils"]`. `cn()` is class-string
   hygiene (dedupe conflicts inside one string) — it is NOT a cascade
   or specificity mechanism and MUST NOT be cited as override
   evidence. Tier-2 classes never route through `cn()` as a
   redefinition entry. [adopted; fixes r1 B5, r2 B5-r2]
4. **categories** — keep `ui/ lib/ theme/`; folder = item boundary. [adopted D3]
5. **P3 scope** — staged: P3a (form/input high-traffic family) builds
   the utility + cn + Tier-2-exception + screenshot/consumer-fixture
   gates; P3b (remaining styled components) reuses them. One-shot for
   all 72 requires the Owner to accept a full per-component baseline
   screenshot matrix first; default is staged. [adopted D4/tasks]
