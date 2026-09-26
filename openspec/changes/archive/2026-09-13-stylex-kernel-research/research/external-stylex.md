# External intel: StyleX state-of-art (R1 / lane L1)

> Provenance: web-research subagent report, 2026-09-13, completed
> DURING Gate 1 (in flight at change-doc review time — its findings
> had no influence on the pre-registered design §4 criteria). Labels:
> [官方] Meta docs/artifacts · [社区] third-party · [本地实测] the
> subagent compiled against @stylexjs/babel-plugin@0.19.0 · [分析]
> inference. Task ref: R1/RQ1, RQ3, RQ7 inputs.

## Verdict up front

**StyleX + Svelte 5 is officially supported (2026-04, PR #1454) —
"directly viable", not "build-your-own adapter", with TWO blind spots
our spikes must close: (1) no official adapter-static/prerender story
(all official examples are SSR adapters), (2) no Vite 8 compatibility
statement (examples pin Vite ^7.2.6).**

---

## 1. Versions & maintenance health

- Latest `@stylexjs/stylex@0.19.0` (2026-06-16), 81 versions total.
  Cadence: monthly through 2025, quarterly in 2026 — alive, no EOL
  signal. [npm](https://www.npmjs.com/package/@stylexjs/stylex)
- Downloads: **1.43M/week** (2026-09-05..11); ~20× yearly growth
  (349k → 6.99M monthly).
- GitHub 10,288 stars, last push 2026-09-11; 122 open issues + 129
  PRs. Recent commits substantive (e.g. #1834 removed
  property-prefixed debug class names — a real 0.18→0.19 breaking
  change). [repo](https://github.com/facebook/stylex)
- Meta investment: FB/IG/WhatsApp/Threads full-line standard per
  engineering blog (2025-11-11, 2026-01-12). External adopters named
  officially: **Figma, Snowflake, HubSpot**. [blog](https://stylexjs.com/blog/a-new-year-2026)
- Risk: **0.x semver** (minors can break — did), `unstable_*` config
  surface, single-vendor dependence.

## 2. Framework-agnostic boundary

- [官方] "a CSS-in-JS solution, **not a CSS-in-React** solution";
  same-code claim for className-accepting frameworks (Solid, Preact,
  Qwik); Svelte/Vue noted as "may need custom configuration" — which
  the unplugin now ships. [thinking-in-stylex](https://stylexjs.com/docs/learn/thinking-in-stylex/) · [getting-started](https://stylexjs.com/docs/learn/)
- [本地实测] `stylex.create()` compiles to **atomic class-name
  constants**; same-file `stylex.props()` folds to string constants —
  zero runtime for static usage; cross-file/dynamic keeps `styleq`
  (~1.83KB client cost incl. deps styleq/css-mediaquery/invariant).
- **`stylex.attrs()`** returns `{ class, style, data-style-src }` —
  docs name Svelte explicitly; usage `<div {...stylex.attrs(styles.foo)}>`.
  [attrs](https://stylexjs.com/docs/api/javascript/attrs/)
- Runtime injection: `dev:true` → `<style data-stylex="true">` into
  head/shadow roots; prod default `runtimeInjection: false`.
- **`StyleXServerStyleSheet` does not exist** (0 hits repo-wide) —
  the SSR model is build-time static extraction, not runtime sheet
  collection. `insertionPoint` option: gone (0 hits).

## 3. Vite integration

- **Official path = `@stylexjs/unplugin` 0.19.0** (149k/week): all
  unplugin adapters (vite/rollup/webpack/rspack/esbuild/bun/farm),
  passes through babel-plugin options. [vite guide](https://stylexjs.com/docs/learn/installation/vite/) · [unplugin config](https://stylexjs.com/docs/api/configuration/unplugin/)
- Dev: virtual modules `/virtual:stylex.css`, `virtual:stylex:runtime`,
  `virtual:stylex:css-only`; `devMode: full|css-only|off`;
  `devPersistToDisk`. Prod: appends aggregated CSS to vite-emitted CSS
  assets (`cssInjectionTarget` optional, else new stylex.css).
- Community `vite-plugin-stylex`: dead (last release 2024-11-06) —
  do not use.
- **Vite 8: no official statement.** unplugin peers only on
  `unplugin@^2.3.11` (doesn't pin Vite). Must be spike-verified.

## 4. Svelte support — REAL and OFFICIAL since 2026-04

- unplugin `transformInclude` matches `.svelte` (SVELTE_LIKE_RE in
  [core.js](https://github.com/facebook/stylex/blob/main/packages/%40stylexjs/unplugin/src/core.js));
  transforms the Svelte-compiled JS with babel.
- [PR #1454 "Add support for Svelte"](https://github.com/facebook/stylex/pull/1454)
  merged 2026-04-01, shipping an official SvelteKit example.
- Official [`examples/example-sveltekit`](https://github.com/facebook/stylex/tree/main/examples/example-sveltekit):
  **Svelte 5.55.7 + SvelteKit 2.60.1 + Vite 7.2.6 + unplugin 0.19.0**,
  runes syntax, `stylex.attrs` spread, dependabot-maintained.
- 0.18.x release notes: "stylex.attrs is back… frameworks such as
  Solid.js, **Svelte**, Vue…" ([blog](https://stylexjs.com/blog/v0-18-x))
- Official SvelteKit page:
  [stylexjs.com/docs/learn/installation/vite/sveltekit](https://stylexjs.com/docs/learn/installation/vite/sveltekit)
  — plugin-order trick (`enforce: undefined`), single CSS entry,
  dev-HMR boilerplate (`$effect(() => import('virtual:stylex:runtime'))`
  + conditional `<link href="/virtual:stylex.css">`).
- Community adapters: **zero** (all 404) — official unplugin is the
  only route. Historic nmn/sveltekit-stylex (2024, Svelte 4) obsolete.
- **Gap: no adapter-static/prerender coverage anywhere official.**

## 5. SSR/SSG

- Model = build-time static extraction: class attrs are compile-time
  constants (SSG-safe by construction), CSS lands as build assets.
- Two official paths: unplugin asset-append; `@stylexjs/cli`
  (`stylex -i in -o out -b stylex_bundle.css`) for exotic setups.
- [分析] adapter-static should compose cleanly, but DYNAMIC styles
  (runtime-decided values) degrade to styleq + inline style with
  default classes in first-paint HTML. Needs PoC — spike/ssg exists
  for exactly this.

## 6. Theming & tokens

- `stylex.defineVars` (in `.stylex.js|ts`): compiles to CSS custom
  properties on `:root` + a class. **[本地实测] values may reference
  existing external vars: `'var(--primary)'` is legal verbatim**
  (fallback syntax included). Named keys (`'--named'`) keep their
  names; default is hashed (`--x1tytwpu`). `classNamePrefix` works.
- `stylex.createTheme(vars, overrides)`: class-scoped var override,
  same external-var() legality; requires token files statically
  resolvable — **barrel re-exports break theming** (LogRocket pitfall);
  theming needs `unstable_moduleResolution` enabled.
- Conditional values (`{ default, '@media …': … }`) compile to
  media-scoped custom properties. [creating-themes](https://stylexjs.com/docs/learn/theming/creating-themes/)
- `debug: true` → readable keys + `data-style-src`; class names stay
  hashed (deliberate, #1834).

## 7. Cascade & Tailwind coexistence

- **`useCSSLayers`** is the interop switch: `true` wraps each priority
  tier in a `@layer`; object form `{ before: ['reset','base'], after:
  ['utilities'], prefix: 'stylex' }` emits
  `@layer reset, base, stylex.priority1, …, utilities;`. **Official
  docs use Tailwind as the canonical example** and document that
  layered < unlayered. [unplugin config](https://stylexjs.com/docs/api/configuration/unplugin/)
- Determinism: property-specificity resolution — `margin-top` always
  beats `margin` regardless of order; cross-file deterministic.
  `styleResolution: 'application-order'` alternative. [docs](https://stylexjs.com/docs/learn/thinking-in-stylex/)
- [社区] LogRocket real migration (Next.js 16 + TW 4.3.2 + StyleX
  0.19, 20 components): coexisted in one globals.css under
  `useCSSLayers: true` with no specificity conflicts; pitfalls were
  `@import`-must-be-first and layer-statement placement. [article](https://blog.logrocket.com/tailwind-css-vs-stylex-a-real-migration-with-20-components/)

## 8. Performance & size

- Claims: zero-cost create/apply (compiled away); atomic CSS size
  plateaus with scale; move work to build time. [官方]
- Runtime +1.83KB client (styleq core) —
  [stylex-plumeria-benchmark](https://github.com/refirst11/stylex-plumeria-benchmark/).
- Render benchmarks (React): no render-path overhead.
  [jantimon bench](https://jantimon.github.io/css-in-js-bench/)
- Build cost: **+2~4s** (Next.js, kanopylabs) vs TW <1s; small
  projects flat (LogRocket 8.0s vs 7.4s). **No Vite-at-scale data
  anywhere** — unplugin babel-transforms every JS-like + .svelte
  module. Our spike must measure on www scale.
- Output size (LogRocket, 20 components): 20,379B TW vs 20,561B
  StyleX — parity; **authored style code +100.5%** (1568→3143 lines),
  Container/Grid families worst (+280%/+181%).

## 9. Capability gaps (kernel-critical)

| capability | status |
|---|---|
| keyframes | ✅ `stylex.keyframes`, dedup, shareable via defineVars |
| pseudo-classes/elements | ✅ (docs advise real elements over pseudos) |
| descendant/sibling | ✅ `stylex.when.*` + `defineMarker` (`:has()` for lookahead) |
| @media + nested conditions | ✅ |
| **container queries** | ❌ **not supported yet** ("looking into it") — css-architecture's container-query geometry law (range/color controls, cq units) must stay in folder css |
| RTL/logical props | ✅ ltr/rtl dual rules auto-generated |
| **variant/recipe system** | ⚠️ none built-in — hand-rolled multi-create + conditional spread (our variant tables) |
| TS types | ✅ VarGroup/StyleXStyles/Theme; token typos = compile errors (biggest win vs TW per LogRocket) |
| IDE | ⚠️ VS Code intellisense experimental; Chrome DevTools ext official; `tailwind-to-stylex` converter exists |
| new CSS | ✅ viewTransitionClass, positionTry, defineConsts, @stylexjs/atoms (0.19) |

## 10. Adoption

Meta full-line; Figma/Snowflake/HubSpot named officially; 20×
download growth; community sentiment positive; "better for AI-assisted
coding" narrative circulating (rumor-grade).

## Competitor quick-scan (slot: Svelte5 + compile-time atomic + zero-runtime + TW-coexistent)

| engine | maintenance | Svelte | key diff |
|---|---|---|---|
| UnoCSS | 66.10.2 (2026-09-11), 364k/wk | native vite plugin, zero adaptation | utility engine, no token/type system — same species as TW, weak kernel differentiator |
| **Panda CSS** | 1.12.1 (2026-09-11), 300k/wk | **official Svelte guide** (PostCSS route) | built-in recipes/cva variants (what StyleX lacks); tokens via config not .stylex.js |
| vanilla-extract | 1.21.2 (2026-07), 2.05M/wk | framework-agnostic .css.ts + official vite plugin | zero-runtime but per-class (not per-property atomic); recipes plugin |
| PigmentCSS | 0.0.31, **on hold** (MUI confirmed) | none | excluded |
| Linaria | 8.2.0, 3.8k/wk | none special | fading |
| style9 | dead 3+ yrs | none | excluded |

Svelte-friendliness rank: UnoCSS > **Panda** > vanilla-extract >
StyleX (official but youngest chain, most boilerplate).

## Three risks that matter for OUR decision

1. **Consumer integration tax** — shadcn-add copies SOURCE into
   consumer builds; consumers must configure unplugin (+ importSources/
   externalPackages correctly) + dev-HMR boilerplate. Misconfiguration
   (layer order, barrel-forwarded tokens) = site-wide style failure.
   Compare today's TW4 prereq (one plugin + one import). This is the
   D3 battleground; architecture B (@jixoai/ui-vite-plugin absorbing
   the transform) exists to answer it.
2. **0.x + single-vendor + young Svelte chain** — 5-month-old Svelte
   integration, zero known production Svelte cases, breaking changes
   in minors. We'd be earliest-of-early adopters on this exact stack.
3. **babel drag at scale + authoring cost** — +2~4s build (Next.js
   data), authored style LOC ~2×, container queries missing, no
   variant system (hand-roll against our variant tables).

Upside factors: compile-time token type-safety, deterministic
cross-file cascade, size plateau, Meta+3 scale proof, official
TW-coexistence design, tailwind-to-stylex converter for migration.
