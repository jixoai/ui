# The atom authoring law (v2) — stylex atoms everywhere, three-tier values

## The Gate-1 revision

The draft proposed a hand-rolled, css-laws-generated `jx-atoms.css`
utility sheet. Gate-1 killed it (correctly): the living placement law
ALREADY chose `stylex.create` as the atom lane (registry components
are mid-migration on it — 9 corpus families done, the
research/migration-ledger.json at repo root), and a second utility
system would re-create the problem under a different name. v2:

- **ONE atom mechanism**: `stylex.create` in `<item>.stylex.ts`
  (components — the standing lane) and `<surface>.stylex.ts` (site —
  the extension). The kernel build compiles; nothing hand-rolls.
- css-laws' charter stays the 13 form-control laws (its types bound
  it); the atom vocabulary needs NO new generator — the ENFORCEMENT
  is linting the authored sources, not emitting a sheet.

## The value rule (three tiers — the closed-vocabulary discipline)

1. **Structural constants** (lawful literals): display, flex
   direction/wrap, position scheme, item placement, atom-local
   geometry (`blockSize: '1px'` on a divider), gradient/mask
   geometry strings (the separator corpus precedent). These are the
   atom's own semantics, not theme decisions.
2. **Theme-able values** (token-bound ONLY): color roles, spacing
   steps, font sizes/weights/tracking/leading, radii, shadows,
   motion durations/easings, z tiers. A literal here is a MISSING
   TOKEN STEP — promote it into the design-tokens sheet (收纳) and
   reference the step (`tokens.text.label`, `var(--jx-track-label)`).
   The promotion table below seeds the pilot's steps.
3. **Registered semantic rules** (lane 2): recurring composites
   (eyebrow, section shell, page grid, playground rows) live in the
   surface's scoped css under `@layer components` + `:where()`, with
   the sheet's intent comment recording owner, selector family, and
   declaration scope. The gate's registry lists them; an unregistered
   lookalike is red.

Enforcement: the EXISTING `verify:stylex-authoring` (factory/vars-keys
ban, engine-throw-table) + the new tailwindless gate's source scan
(tier-2 literals in `.stylex.ts` red; tier-3 unregistered selectors
red).

## Dynamic producers (registered, Gate-1 blocker 2)

`cn()` (utils.ts), `resolveTextStyle` (registry/files/lib/
text-style.svelte.ts — currently EMITS `leading-[…]`/`font-[…]`
brackets: its identities migrate to token steps and the producer's
legal enumeration lists them), slot resolvers, and any code path
building class strings. The gate's source carries each producer's
legal identity set; growth or unlisted identities are red.

## Responsive + interactive seams (Gate-1 blocker 7)

- Viewport seams (`min-[1100px]`, `sm:`/`lg:`) become CONTAINER
  queries on the section host (`@container` — a container never
  matches itself; hosts declared per section) or registered semantic
  media rules in the surface sheet. The pilot inventories every seam
  it meets; the matrix proves each.
- `hover:`/`focus-visible:` composites become NATIVE pseudo
  selectors inside semantic rules (the existing component pattern) —
  NOT JS data-attr rewrites.
- `dark:` variants resolve through the scope law (the html.dark
  scope re-tunes tokens — most dark: utilities are redundant once
  colors ride tokens; the residual list lands per file).

## Promotion table (pilot seed)

text 11px → --jx-text-label · 13px → --jx-text-body · 12.5px →
--jx-text-small · 15px → --jx-text-title · tracking 0.24em →
--jx-track-label · 0.08em → --jx-track-wide · max-w 90rem →
--jx-shell-w · 62ch → --jx-measure · leading-6 → --jx-leading-body.
Each step lands once (P1's design-tokens delta references the
pilot's actual promotions).
