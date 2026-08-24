# css-architecture — the styling placement law (delta: ADDED)

## ADDED Requirements

### Requirement: the placement law

Styling SHALL live in exactly one place per kind:

1. Paint expressible as Tailwind v4 utilities → utilities composed in
   component markup (no CSS file).
2. CSS utilities cannot express (pseudo-element geometry,
   `@container`/`@keyframes`/scroll-driven/view-transition at-rules,
   press-physics custom properties) → colocated
   `ui/<item>/<item>.css` loaded by a relative side-effect import from
   the component file, containing ONLY standard CSS (token custom
   properties, `@layer components` scoped with `:where()`, the at-rules
   above). `@utility` MUST NOT appear in folder css (a standalone css
   file has no Tailwind context); custom utilities, if ever needed,
   MUST live in the single Tailwind entry/theme item with their own
   compiled-output probe. Every folder sheet MUST open with the
   canonical layer statement `@layer theme, base, components,
   utilities;` so sheet injection order can never reorder the cascade
   (P0.1 finding: a bare `@layer components` in a sheet injected
   before the Tailwind entry sorts components before base, and
   preflight then beats folder rules).
3. Tokens + element-default sheets → `registry/files/theme/`
   (jixoai.css, jx-pure.css) — consume-only, unchanged by this change.
4. Site-only surfaces → colocated with the route/module they serve.
   `app.css` keeps the site's global Tailwind context INTACT: the sole
   `@import 'tailwindcss'`, the theme imports, ALL global
   `@theme`/`@custom-variant`/`@layer base` rules, and the import
   order. ONLY selectors that are demonstrably site-only and outside
   the compiler context (data tables, token-lab panels, skip-link,
   …) move to named site module css — global Tailwind context MUST
   NOT be scattered across route css files.

Every authored-CSS file MUST carry a top comment listing its
orthogonal intents (with timestamps) per the repo law.

#### Scenario: a new component needs a pseudo-element build

- WHEN the paint cannot be a utility
- THEN it lands in `ui/<item>/<item>.css` under `@layer components`
  with `:where()`, imported relatively by the component
- AND a consumer utility overrides it (Tier-1-owned css loses to
  utilities)

#### Scenario: component paint IS utility-able

- WHEN a surface is boxes/borders/spacing/typography on the token sheet
- THEN it is composed as utilities in markup and NO css file is created

#### Scenario: css loads exactly once

- GIVEN an item's css imported relatively by its component
- WHEN the component is used on a page that also imported the css
  historically
- THEN the stylesheet appears exactly once in the built output

### Requirement: utilities win over Tier-1-owned css; Tier-2 is the exception

All Tier-1-owned authored css MUST sit in `@layer components` behind
`:where()` so consumer utilities win. Two distinct external facts bound
this law: (1) the frozen Tier-2 vocabulary (jx-pure Part A) is the
ONLY intentionally unlayered cascade exception — by design it beats
layered utilities; (2) jx-pure Parts B–D are an externally-owned living
sheet, outside this change's scope (consume-only, unchanged — not a
layering exception). Components MUST consume them and MUST NOT copy,
move, redefine, or re-wrap them. Changing the Part A cascade REQUIRES a
separate change against the jx-pure living spec.

#### Scenario: specificity probe (Tier-1)

- GIVEN component paint `.jx-foo` in the folder css
- WHEN a consumer adds `class="jx-foo text-primary"` (or any utility)
- THEN the utility's declaration wins over the folder css declaration

#### Scenario: Tier-2 exception intact

- GIVEN `.jx-input` defined by jx-pure Part A (unlayered)
- WHEN a consumer utility attempts to override one of its declarations
- THEN Part A wins — by design — and this change leaves that untouched
