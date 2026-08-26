# css-architecture — delta

## MODIFIED Requirements

### Requirement: the placement law

Styling SHALL live in exactly one place per kind:

1. Paint expressible as Tailwind v4 utilities → utilities composed in
   component markup (no CSS file) — EXCEPT native-family components,
   whose law-mirroring static paint lives in the folder's @apply
   mirror sheet (kind 1b below).
1b. Native-family mirror paint → `ui/<item>/<item>.css` rules whose
   declarations mirror the Tier-0 twin law: bounded `@apply`
   (context-free core utilities + arbitrary-value utilities ONLY —
   named-theme `@apply` fails without a Tailwind context and is
   banned, the same rationale as the `@utility` ban), plain-CSS
   token declarations, `@layer components` `:where()` for statics,
   unlayered `:where()` state machines per the carve-out. The
   mirror sheet is parity-gated against the Tier-0 law
   (native-contract spec).
2. CSS utilities cannot express (pseudo-element geometry,
   `@container`/`@keyframes`/scroll-driven/view-transition at-rules,
   press-physics custom properties, UA pseudos) → colocated
   `ui/<item>/<item>.css` loaded by a relative side-effect import from
   the component file, containing ONLY standard CSS (token custom
   properties, `@layer components` scoped with `:where()`, the
   at-rules above). `@utility` MUST NOT appear in folder css (a
   standalone css file has no Tailwind context); custom utilities, if
   ever needed, MUST live in the single Tailwind entry/theme item
   with their own compiled-output probe. Every folder sheet MUST open
   with the canonical layer statement `@layer theme, base,
   components, utilities;` so sheet injection order can never
   reorder the cascade.
3. Tokens + element-default sheets → `registry/files/theme/`
   (jixoai.css, jx-pure.css, and the generated
   jx-native-contract.css extract) — consume-only; Part A edits
   happen in jx-pure.css and flow through the generator (the
   extract is never hand-edited).
4. Site-only surfaces → colocated with the route/module they serve.
   `app.css` keeps the site's global Tailwind context INTACT (the
   sole `@import 'tailwindcss'`, the theme imports, ALL global
   `@theme`/`@custom-variant`/`@layer base` rules, and the import
   order).

Every authored-CSS file MUST carry a top comment listing its
orthogonal intents (with timestamps) per the repo law.

#### Scenario: a native component mirrors its law

- WHEN a native-family component paints beyond the Part A classes
- THEN the mirror rules land in its folder css under `@layer
  components` `:where()` with bounded @apply, and the parity gate
  proves equivalence to the Tier-0 twin

#### Scenario: named-theme @apply is attempted in a folder sheet

- GIVEN a folder css containing `@apply border-border`
- WHEN the tw-context probe (or any build) compiles it
- THEN it fails — named utilities require a context standalone
  sheets do not have; token paint uses plain declarations or
  arbitrary utilities

#### Scenario: component paint IS utility-able (non-native family)

- WHEN a composite's surface is boxes/borders/spacing/typography on
  the token sheet
- THEN it is composed as utilities in markup and NO css file is
  created

#### Scenario: css loads exactly once

- GIVEN an item's css imported relatively by its component
- WHEN the component is used on a page that also imported the css
  historically
- THEN the stylesheet appears exactly once in the built output

#### Scenario: a family packet edits the theme sheet

- GIVEN packet A running after the orchestrator
- WHEN it needs a new token
- THEN it reports the desired delta; the orchestrator applies it —
  packets never edit the canonical theme directly
