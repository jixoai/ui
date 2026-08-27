# css-architecture — delta

## MODIFIED Requirements

### Requirement: the placement law

Styling SHALL live in exactly one place per kind:

1. Paint expressible as Tailwind v4 utilities → utilities composed in
   component markup (no CSS file).
5. Native-control LAWS → the standard layer: the `.jx-html-*`
   @utility family in the theme sheet (the single declaration
   source). Registry markup consumes the classes; the face
   (jx-pure.css) applies them through the entry @import chain
   (`@apply jx-html-input` inside its bare-element rules — context
   flows through @import, probe-locked). Folder css NEVER
   re-declares a standard-layer law; component extras follow kinds
   1–2 above.
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
3. Tokens + standard layer + the face → `registry/files/theme/`
   (jixoai.css carries tokens AND the .jx-html utilities;
   jx-pure.css is the face — pipeline-bound @apply applications of
   the standard layer).
4. Site-only surfaces → colocated with the route/module they serve.
   `app.css` keeps the site's global Tailwind context INTACT (the
   sole `@import 'tailwindcss'`, the theme imports, ALL global
   `@theme`/`@custom-variant`/`@layer base` rules, and the import
   order).

Every authored-CSS file MUST carry a top comment listing its
orthogonal intents (with timestamps) per the repo law.

#### Scenario: a new component needs a pseudo-element build

- WHEN the paint cannot be a utility
- THEN it lands in `ui/<item>/<item>.css` under `@layer components`
  with `:where()`, imported relatively by the component
- AND a consumer utility overrides it (Tier-1-owned css loses to
  utilities)

#### Scenario: component paint IS utility-able

- WHEN a surface is boxes/borders/spacing/typography on the token
  sheet
- THEN it is composed as utilities in markup and NO css file is
  created

#### Scenario: a native law changes

- WHEN a .jx-html-* utility is edited in the theme
- THEN the registry (markup classes) and the face (@apply chain)
  both pick it up in one build — no second declaration site exists

#### Scenario: named-theme @apply is attempted in a folder sheet

- GIVEN a folder css containing `@apply border-border`
- WHEN the tw-context probe (or any build) compiles it
- THEN it fails — named utilities require a context standalone
  sheets do not have; token paint uses plain declarations or
  arbitrary utilities

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
